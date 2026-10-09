# Incremental dynamic theming engine

Date: 2026-10-09
Scope: SHIFT (`src/dynamic-engine.js` and its tests). Sub-project A of the Reddit performance work; sub-project B (exp-core shared page observer) has its own design.

## Problem

Measured on Reddit (user trace, 61 s) and on a local Reddit-like fixture (1,500 web components with shadow roots, styles arriving in 40 waves):

1. **Slow loading.** Every added `<style>` or stylesheet link schedules a full refresh 100 ms later. A full refresh walks every element and every shadow root (`querySelectorAll('*')` plus `closest()` per element) and reprocesses every stylesheet in every root. Trace: 8 refreshes = 4.5 s of main-thread time, up to 882 ms each. Fixture: 41 refreshes, 3.7–6.2 s.
2. **Shared stylesheets themed in one place only.** Generated CSS is keyed per stylesheet and inserted into the first root that uses it. Components sharing an adopted stylesheet stay unthemed everywhere else (fixture: first post themed, last post `rgb(255,255,255)`).
3. **Late components never refresh (Reddit chat).** The trigger watches only the main document. Styles added inside a shadow root created later are never seen, so those components stay unthemed unless an unrelated light-DOM style happens to arrive afterwards.
4. **Cache thrash.** The generated-CSS cache is an LRU of 96 entries; pages with more distinct stylesheets re-theme from scratch on every refresh (fixture: 150 sheets = 6.2 s vs 3.7 s for 1).

## Goal and success criteria

- Reddit-like pages load without SHIFT long tasks: no engine slice over 50 ms, and total engine time on the fixture at least 5× below today's.
- Every component using a stylesheet is themed, including shared adopted sheets.
- Late components (chat) are themed when they appear, with no other page change needed.
- Theming output (which rules are generated, budgets, preserve guard) is unchanged.

## 1. Discovery

- Known roots: `document` plus every shadow root seen, held in a `WeakSet` (removed components are released automatically).
- Start: one walk of the document finds existing shadow roots (today's walk, run once).
- After start, each known shadow root gets a `MutationObserver` (`childList`, `subtree`). Added elements and their descendants are checked for `shadowRoot`; new roots become known, are observed, and are queued. Nested roots (chat inside an app shell) are covered.
- The main document keeps exp-core's shared observer (`observePageBatch`) for light-DOM changes, with the same checks for added shadow roots.
- Triggers:
  - new shadow root → process that root;
  - `<style>` or `link[rel~="stylesheet"]` added in a known root → reprocess that root only;
  - theme change → one full pass over known roots (no document walk);
  - light-DOM changes adding no styles and no shadow roots → nothing.

## 2. Theming and output

- Per-sheet result cache: `WeakMap<CSSStyleSheet, { signature, themeKey, css, constructed }>`. Rebuilt only when the sheet's `signature()` or the theme key changes. No size cap.
- Generation is unchanged: same `walk()`, 6000-rule budget, `DYNAMIC_PRESERVE_GUARD`, owned-sheet skipping.
- Document root: one `<style data-exp-owned="1" data-exp-shift-dynamic="1">` per stylesheet, as today.
- Shadow roots: the result is also built once as a constructed `CSSStyleSheet` whose first rule is the owned-sheet marker (`.exp-owned-sheet-marker{}`). It is appended to the end of the root's `adoptedStyleSheets` for every root whose sheets include the original. If a root's adopted list no longer contains it (component reassigned the list), it is re-added when that root is next processed.
- Fallback: if adoption throws or is unsupported, a `<style data-exp-owned="1" data-exp-shift-dynamic="1">` is inserted into that root.
- Cross-origin sheets: fetching and the remote cache are unchanged; the fetched result is applied through the same per-root path.
- Theme off (`stop()`): removes every themed constructed sheet from every known root's `adoptedStyleSheets`, every fallback `<style>`, and every document `<style>`; disconnects all observers. Theme change replaces content in place (`replaceSync` on constructed sheets, `textContent` on styles).

## 3. Pacing and health

- Work is queued and processed in slices of about 8 ms, yielding between slices with `requestIdleCallback` (timeout 200 ms), falling back to `setTimeout(0)`. Duplicate roots in the queue are merged. A theme change clears the queue and starts a full pass, also sliced.
- `health()` adds: `knownRoots`, `adoptedRoots`, `fallbackRoots`, `cachedSheets`, `maxSliceMs`, `totalMs`, `passes`. Existing fields stay.

## 4. Testing

New browser tests on a Reddit-like fixture in `tests/`:
- 1,500 components sharing adopted stylesheets: every component's inner element has the themed background.
- A late chat component with nested shadow roots and its own `<style>`, added after load with no other changes: themed within 2 s.
- A component that reassigns `adoptedStyleSheets`: themed again after its next mutation.
- Theme off removes all themed sheets and styles; theme change replaces them.
- Performance: `health().maxSliceMs < 50` and `health().totalMs < 750` on the 1,500-component fixture (today about 3,700 ms; the budget is 5× lower).

Existing tests that look for `style[data-exp-shift-dynamic]` inside shadow roots (`tests/browser.test.cjs` around lines 1392 and 1430) check for the themed adopted sheet instead; all others stay.

## 5. Out of scope

- SHIFT's live element-repair pass (0.6 s in the trace, max 138 ms).
- exp-core's shared page observer (sub-project B).

## 6. Rollout

Normal SHIFT release. Notes: "Loads faster on Reddit and other component-heavy sites." and "Themes Reddit chat and every post consistently." A new trace from the user after release confirms the result on Reddit.

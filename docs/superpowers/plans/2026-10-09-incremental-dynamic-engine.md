# Incremental Dynamic Theming Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SHIFT's stylesheet theming incremental so component-heavy pages (Reddit) load without long tasks, shared stylesheets are themed in every component, and late components (Reddit chat) are themed when they appear.

**Architecture:** `src/dynamic-engine.js` keeps its rule generator (`walk`, budgets, preserve guard, remote fetching) and replaces the "full refresh on every new style" loop with: a registry of known roots (document + shadow roots, each shadow root watched by its own `MutationObserver`), a per-stylesheet result cache (`WeakMap`), one shared constructed themed stylesheet per original adopted into every shadow root that uses it (document keeps `<style>` elements), and a queue processed in ~8 ms idle slices. The document root is processed synchronously on `start`/`refresh`.

**Tech Stack:** Plain JavaScript userscript, `node:test`, Playwright (Chromium).

**Spec:** `SHIFT/docs/superpowers/specs/2026-10-09-incremental-dynamic-engine-design.md`

## Global Constraints

- Repo: `C:/Users/OneDareAtHome/Documents/ChatGPT/ExtraPotions/SHIFT`, local branch `codex/remaining-hardening` (equal to `origin/main`). Commit locally; no push before Task 5, which needs the user's go-ahead.
- Generated CSS is unchanged: same `walk()`, `6000`-rule budget for local sheets, `8000` for remote, `DYNAMIC_PRESERVE_GUARD`, owned-sheet skipping.
- Owned marker for constructed sheets: first rule `.exp-owned-sheet-marker{}` (already recognized by `isOwnedSheet`).
- Document output: `<style data-exp-owned="1" data-exp-shift-dynamic="1">` per local sheet and `<style data-exp-owned="1" data-exp-shift-dynamic-remote="1">` per remote href, as today.
- Shadow output: one shared constructed sheet per original, appended to the end of each using root's `adoptedStyleSheets`; fallback `<style data-exp-owned="1" data-exp-shift-dynamic="1">` inside the root if adoption throws.
- Slices: `SLICE_MS = 8`, scheduled with `requestIdleCallback(fn, { timeout: 200 })`, else `setTimeout(fn, 0)`.
- Public API stays `{ start, refresh, stop, health }`; `start`/`refresh` theme the document root before returning; existing `health()` fields keep their names.
- New `health()` fields: `knownRoots`, `adoptedRoots`, `fallbackRoots`, `cachedSheets`, `maxSliceMs`, `totalMs`, `passes`, `slices`.
- Performance targets (Reddit-like fixture, 1,500 components): `maxSliceMs < 50`, `totalMs < 750`.
- `npm run` may hang in agent shells here; run `node scripts/build.cjs` and `node --test tests/*.test.cjs` directly.

## Review Focus

- A component that reassigns `adoptedStyleSheets` without any DOM mutation afterwards keeps the theme dropped until the next mutation in that root or the next full pass — acceptable per spec; check nothing else re-drops it in a loop.
- Our own fallback `<style>` insertions into a shadow root must not re-trigger that root's observer into a processing loop (owned nodes are skipped).
- Removed components: their observers, copies and registry entries are released on the next full pass; nothing holds detached shadow roots forever.
- Theme change replaces copies in place: no root ends up with two SHIFT copies of the same original (including remote hrefs).
- Pages with no shadow roots (most sites) behave exactly as before: same document `<style>` output, synchronous theming on start.

---

### Task 1: Failing tests for the incremental engine

**Files:**
- Create: `SHIFT/tests/dynamic-engine-incremental.test.cjs`

**Interfaces:**
- Consumes (current engine): `EXP.DynamicEngine.start(theme, { nativeDark })`, `.refresh(theme)`, `.stop()`, `.health()`; `EXP.Themes.resolve(themeId, accentId)`.

- [ ] **Step 1: Write the tests** — `SHIFT/tests/dynamic-engine-incremental.test.cjs`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

// The engine requires Core's shared page observer (commit 44043f0), so Core loads first.
const core = fs.readFileSync(path.join(__dirname, '../vendor/exp-core/exp-core.js'), 'utf8');
const source = ['themes.js', 'color-engine.js', 'dynamic-engine.js'].map(file => fs.readFileSync(path.join(__dirname, '../src', file), 'utf8')).join('\n');

async function fixture(t) {
  const browser = await chromium.launch(); t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><head><style>body{background:#fff;color:#111}</style></head><body><main id="feed"></main></body></html>');
  await page.addScriptTag({ content: `${core}\nconst EXP={Core:{safeError(){}}};${source};window.expTest=EXP;` });
  await page.evaluate(() => {
    window.white = 'rgb(255, 255, 255)';
    window.ownedSheet = sheet => { try { return sheet.cssRules[0]?.selectorText === '.exp-owned-sheet-marker'; } catch { return false; } };
    window.innerBg = host => getComputedStyle(host.shadowRoot.querySelector('.inner')).backgroundColor;
    window.makeSheets = (kinds, rules = 120) => Array.from({ length: kinds }, (_, k) => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync('.inner{background:#ffffff;color:#1c1c1c;padding:4px}' + Array.from({ length: rules }, (_, i) => `.k${k}r${i}{color:#1c1c1c;background:#fafafa}`).join(''));
      return sheet;
    });
    window.definePost = sheets => {
      customElements.define('shift-post', class extends HTMLElement {
        connectedCallback() {
          if (this.shadowRoot) return;
          const shadow = this.attachShadow({ mode: 'open' });
          shadow.adoptedStyleSheets = [sheets[(+this.dataset.i) % sheets.length]];
          shadow.innerHTML = `<div class="inner">Post ${this.dataset.i}</div>`;
        }
      });
    };
    window.addPosts = (from, count) => {
      const feed = document.getElementById('feed');
      for (let i = from; i < from + count; i++) { const post = document.createElement('shift-post'); post.dataset.i = i; feed.append(post); }
    };
    window.unthemedPosts = () => [...document.querySelectorAll('shift-post')].filter(post => innerBg(post) === white).length;
  });
  return page;
}
const midnight = 'expTest.Themes.resolve("midnight","site-default")';

test('every component sharing an adopted stylesheet is themed', async t => {
  const page = await fixture(t);
  await page.evaluate(`definePost(makeSheets(3)); addPosts(0, 300); expTest.DynamicEngine.start(${midnight});`);
  await page.waitForTimeout(2000);
  const facts = await page.evaluate(() => ({ unthemed: unthemedPosts(), health: expTest.DynamicEngine.health() }));
  assert.equal(facts.unthemed, 0, JSON.stringify(facts.health));
  assert.equal(facts.health.adoptedRoots, 300);
});

test('a late component with nested shadow roots is themed with no other page change', async t => {
  const page = await fixture(t);
  await page.evaluate(`expTest.DynamicEngine.start(${midnight});`);
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    customElements.define('chat-msg', class extends HTMLElement { connectedCallback() { const s = this.attachShadow({ mode: 'open' }); s.innerHTML = '<style>.msg{background:#ffffff;color:#0f1a1c}</style><div class="msg" id="msg">Hello</div>'; } });
    customElements.define('rs-chat', class extends HTMLElement { connectedCallback() { const s = this.attachShadow({ mode: 'open' }); s.innerHTML = '<style>.room{background:#ffffff;color:#0f1a1c}</style><div class="room" id="room">Room</div><chat-msg></chat-msg>'; } });
    document.body.append(document.createElement('rs-chat'));
  });
  await page.waitForTimeout(2000);
  const facts = await page.evaluate(() => {
    const chat = document.querySelector('rs-chat').shadowRoot;
    return { room: getComputedStyle(chat.getElementById('room')).backgroundColor, msg: getComputedStyle(chat.querySelector('chat-msg').shadowRoot.getElementById('msg')).backgroundColor };
  });
  assert.notEqual(facts.room, 'rgb(255, 255, 255)');
  assert.notEqual(facts.msg, 'rgb(255, 255, 255)');
});

test('a component that reassigns adoptedStyleSheets is themed again after its next change', async t => {
  const page = await fixture(t);
  await page.evaluate(`window.sheets = makeSheets(1); definePost(sheets); addPosts(0, 1); expTest.DynamicEngine.start(${midnight});`);
  await page.waitForFunction(() => innerBg(document.querySelector('shift-post')) !== white, null, { timeout: 3000 });
  await page.evaluate(() => {
    const shadow = document.querySelector('shift-post').shadowRoot;
    shadow.adoptedStyleSheets = [sheets[0]];
    shadow.append(document.createElement('span'));
  });
  await page.waitForTimeout(1000);
  assert.notEqual(await page.evaluate(() => innerBg(document.querySelector('shift-post'))), 'rgb(255, 255, 255)');
});

test('a theme change replaces copies in place and stop removes every copy', async t => {
  const page = await fixture(t);
  await page.evaluate(`definePost(makeSheets(2)); addPosts(0, 20); expTest.DynamicEngine.start(${midnight});`);
  await page.waitForTimeout(1000);
  const before = await page.evaluate(() => innerBg(document.querySelector('shift-post')));
  await page.evaluate(() => expTest.DynamicEngine.refresh(expTest.Themes.resolve('crimson', 'site-default')));
  await page.waitForTimeout(1000);
  const changed = await page.evaluate(() => ({
    bg: innerBg(document.querySelector('shift-post')),
    copiesPerRoot: [...document.querySelectorAll('shift-post')].map(post => post.shadowRoot.adoptedStyleSheets.filter(ownedSheet).length),
  }));
  assert.notEqual(changed.bg, before);
  assert.ok(changed.copiesPerRoot.every(count => count === 1), JSON.stringify(changed.copiesPerRoot));
  await page.evaluate(() => expTest.DynamicEngine.stop());
  const after = await page.evaluate(() => ({
    unthemed: unthemedPosts(),
    copies: [...document.querySelectorAll('shift-post')].reduce((sum, post) => sum + post.shadowRoot.adoptedStyleSheets.filter(ownedSheet).length + post.shadowRoot.querySelectorAll('style[data-exp-shift-dynamic]').length, 0),
    documentStyles: document.querySelectorAll('style[data-exp-shift-dynamic],style[data-exp-shift-dynamic-remote]').length,
  }));
  assert.deepEqual(after, { unthemed: 20, copies: 0, documentStyles: 0 });
});

test('a Reddit-sized page themes everything without long engine slices', async t => {
  const page = await fixture(t);
  await page.evaluate(`window.sheets = makeSheets(150); definePost(sheets); expTest.DynamicEngine.start(${midnight});`);
  await page.evaluate(async () => {
    for (let wave = 0; wave < 40; wave++) {
      addPosts(wave * 38, 38);
      const style = document.createElement('style'); style.textContent = `.w${wave}{color:#222}`; document.head.append(style);
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  });
  await page.waitForTimeout(2000);
  const facts = await page.evaluate(() => ({ unthemed: unthemedPosts(), health: expTest.DynamicEngine.health() }));
  assert.equal(facts.unthemed, 0, `unthemed ${facts.unthemed}`);
  assert.ok(facts.health.maxSliceMs < 50, `longest slice ${facts.health.maxSliceMs} ms`);
  assert.ok(facts.health.totalMs < 750, `total engine time ${facts.health.totalMs} ms`);
  assert.ok(facts.health.knownRoots >= 1521, `known roots ${facts.health.knownRoots}`);
});
```

- [ ] **Step 2: Run to see them fail**

Run: `cd SHIFT && node --test tests/dynamic-engine-incremental.test.cjs`
Expected: FAIL on "every component sharing…" (unthemed > 0), "late component…" (room/msg white), "theme change replaces…" (copies per root 0), and "Reddit-sized…" (`maxSliceMs` undefined). "reassigns adoptedStyleSheets" may already pass (today's engine inserts a `<style>`, which reassignment doesn't remove); it guards the new adoption path.

- [ ] **Step 3: Commit the failing tests**

```bash
cd SHIFT && git add tests/dynamic-engine-incremental.test.cjs && git commit -m "test: incremental dynamic engine expectations"
```

---

### Task 2: Incremental engine

**Files:**
- Modify: `SHIFT/src/dynamic-engine.js`

**Interfaces:**
- Produces: unchanged `EXP.DynamicEngine = { start, refresh, stop, health }`; `health()` gains the fields in Global Constraints.

- [ ] **Step 1: Declarations** — at the top of the module:
  - Delete `const remoteHandles = new Map();` and `const cache = new Map();`.
  - In the `stats` object literal, append `, slices:0, totalMs:0, maxSliceMs:0, passes:0, cachedSheets:0`.
  - Replace `let sharedObserverCleanup=null, timer=0, active=false, ...` with the same line minus `timer=0, `. (Commit 44043f0 already removed `observer`; the engine always uses `ExtraPotionsCore.observePageBatch`.)
  - After `const watchedLinks = new WeakSet();` add:

```js
  // Roots: the document plus every shadow root seen. Each shadow root has its own observer,
  // so styles and components added inside it are noticed without rescanning the page.
  const OWNED_MARKER = '.exp-owned-sheet-marker{}';
  const SLICE_MS = 8;
  const LOCAL_BUDGET = 6000;
  let knownRoots = new WeakSet();
  let rootList = [];
  const rootObservers = new Map();
  const sheetResults = new WeakMap();   // CSSStyleSheet -> { sig, key, css, constructed }
  const remoteOwners = new Map();       // href -> { css, constructed }
  const shadowCopies = new Map();       // ShadowRoot -> Map<sheet | href, constructed sheet>
  const fallbackStyles = new Map();     // ShadowRoot -> Map<sheet | href, <style>>
  const queue = new Set();
  let sliceHandle = null;
```

- [ ] **Step 2: Replace `processSheet`** — delete the whole `function processSheet(sheet,root,budget){…}` and put in its place:

```js
  const mapFor = (maps, root) => { let map = maps.get(root); if (!map) { map = new Map(); maps.set(root, map); } return map; };
  const ownedNode = node => Boolean(node?.closest?.('[data-exp-owned="1"]'));
  const liveRoot = root => root === document || Boolean(root?.host?.isConnected);

  function themedResult(sheet) {
    const sig = signature(sheet), key = themeKey(theme);
    let entry = sheetResults.get(sheet);
    if (entry && entry.sig === sig && entry.key === key) { stats.cacheHits++; return entry; }
    stats.cacheMisses++;
    const out = []; walk(sheet.cssRules, out, new Map(), LOCAL_BUDGET);
    if (!entry) { entry = { sig, key, css: '', constructed: null }; sheetResults.set(sheet, entry); stats.cachedSheets++; }
    entry.sig = sig; entry.key = key; entry.css = out.join('\n');
    if (entry.constructed) { try { entry.constructed.replaceSync(OWNED_MARKER + entry.css); } catch { entry.constructed = null; } }
    return entry;
  }

  function remoteOwner(href, css) {
    let owner = remoteOwners.get(href);
    if (!owner) { owner = { css: '', constructed: null }; remoteOwners.set(href, owner); }
    if (owner.constructed && owner.css !== css) { try { owner.constructed.replaceSync(OWNED_MARKER + css); } catch { owner.constructed = null; } }
    owner.css = css;
    return owner;
  }

  function removeCopy(root, key) {
    const copy = shadowCopies.get(root)?.get(key);
    if (copy) {
      try { root.adoptedStyleSheets = root.adoptedStyleSheets.filter(sheet => sheet !== copy); } catch {}
      shadowCopies.get(root).delete(key);
    }
    const style = fallbackStyles.get(root)?.get(key);
    if (style) { style.remove(); fallbackStyles.get(root).delete(key); }
  }

  // key is the original CSSStyleSheet, or the href string for a remote sheet.
  function applyCss(root, key, css, owner) {
    if (root === document) {
      let handle = handles.get(key);
      if (!css) { handle?.remove(); handles.delete(key); return; }
      if (!handle?.isConnected) {
        handle = document.createElement('style'); handle.dataset.expOwned = '1';
        handle.dataset[typeof key === 'string' ? 'expShiftDynamicRemote' : 'expShiftDynamic'] = '1';
        (document.head || document.documentElement).append(handle); handles.set(key, handle);
      }
      if (handle.textContent !== css) handle.textContent = css;
      return;
    }
    if (!css) { removeCopy(root, key); return; }
    const fallback = mapFor(fallbackStyles, root);
    if (!fallback.has(key)) {
      try {
        if (!owner.constructed) { owner.constructed = new CSSStyleSheet(); owner.constructed.replaceSync(OWNED_MARKER + css); }
        const copies = mapFor(shadowCopies, root), previous = copies.get(key);
        let adopted = root.adoptedStyleSheets;
        if (previous && previous !== owner.constructed) adopted = adopted.filter(sheet => sheet !== previous);
        if (!adopted.includes(owner.constructed)) adopted = [...adopted, owner.constructed];
        if (adopted !== root.adoptedStyleSheets) root.adoptedStyleSheets = adopted;
        copies.set(key, owner.constructed);
        return;
      } catch {}
    }
    let style = fallback.get(key);
    if (!style?.isConnected) { style = document.createElement('style'); style.dataset.expOwned = '1'; style.dataset.expShiftDynamic = '1'; root.append(style); fallback.set(key, style); }
    if (style.textContent !== css) style.textContent = css;
  }

  function pruneRoot(root, live) {
    if (root === document) {
      for (const [key, handle] of [...handles]) if (!live.has(key)) { handle.remove(); handles.delete(key); }
      return;
    }
    const keys = new Set([...(shadowCopies.get(root)?.keys() || []), ...(fallbackStyles.get(root)?.keys() || [])]);
    for (const key of keys) if (!live.has(key)) removeCopy(root, key);
  }

  function processRoot(root) {
    watchStylesheetLinks(root);
    const normal = [...(root.styleSheets || [])];
    let adopted = []; try { adopted = [...(root.adoptedStyleSheets || [])]; } catch {}
    stats.adoptedSheets += adopted.length;
    const live = new Set();
    for (const sheet of [...normal, ...adopted]) {
      if (sheet.ownerNode?.dataset?.expOwned === '1' || isOwnedSheet(sheet)) continue;
      let accessible = true; try { void sheet.cssRules; } catch { accessible = false; }
      if (accessible) { const entry = themedResult(sheet); applyCss(root, sheet, entry.css, entry); live.add(sheet); stats.sheets++; }
      else { stats.inaccessible++; const href = sheet.href || sheet.ownerNode?.href; if (href) live.add(href); processRemoteSheet(sheet, root); }
    }
    pruneRoot(root, live);
  }
```

- [ ] **Step 3: Remote sheets use the same apply path** — in `processRemoteSheet`, replace the last three statements (from `let handle=remoteHandles.get(href);` through `if(handle.textContent!==css)handle.textContent=css;stats.remoteSheets++;`) with:

```js
    applyCss(root, href, css, remoteOwner(href, css)); stats.remoteSheets++;
```


- [ ] **Step 4: Stylesheet link loads queue their own root** — in `watchStylesheetLink`, replace `if(active)schedule();` with:

```js
      if(active){queue.add(link.getRootNode?.()||document);scheduleSlice();}
```

- [ ] **Step 5: Replace `refresh`, `schedule`, `start`, `stop`, `health`** — delete everything from `  function refresh(nextTheme,nextOptions){` to just before `  return Object.freeze({start,refresh,stop,health});`, and insert:

```js
  function resetRunStats() {
    stats.sheets = stats.rulesSeen = stats.rulesGenerated = stats.inaccessible = stats.remoteSheets = stats.remoteRules = stats.remoteFailures = stats.remoteSkippedNoHref = stats.variables = stats.groups = stats.shadowRoots = stats.adoptedSheets = stats.inferredVariables = stats.skippedSemanticVariables = stats.gradients = stats.layeredBackgrounds = stats.preservedImages = stats.currentColor = stats.colorMix = stats.masks = stats.filters = 0;
  }

  function registerRoot(root) {
    if (knownRoots.has(root)) return false;
    knownRoots.add(root); rootList.push(root);
    if (root !== document) {
      const watcher = new MutationObserver(records => onRootMutations(root, records));
      watcher.observe(root, { childList: true, subtree: true });
      rootObservers.set(root, watcher);
    }
    return true;
  }

  // Registers every shadow root inside node (including nested ones) and queues them.
  function discoverIn(node) {
    const visit = el => {
      const shadow = el.shadowRoot;
      if (!shadow || knownRoots.has(shadow) || ownedNode(el)) return;
      registerRoot(shadow); queue.add(shadow); discoverIn(shadow);
    };
    if (node?.nodeType === 1) visit(node);
    try { node?.querySelectorAll?.('*').forEach(visit); } catch {}
  }

  const addsStyles = node => node?.nodeType === 1 && (Boolean(node.matches?.('style,link[rel~="stylesheet"]')) || Boolean(node.querySelector?.('style,link[rel~="stylesheet"]')));

  function onRootMutations(root, records) {
    if (!active) return;
    let styled = false;
    for (const record of records) {
      if (record.target?.nodeName === 'STYLE' && !ownedNode(record.target)) styled = true;
      for (const node of record.addedNodes) {
        if (node.nodeType !== 1 || ownedNode(node)) continue;
        discoverIn(node); watchStylesheetLinks(node);
        if (addsStyles(node)) styled = true;
      }
      for (const node of record.removedNodes) if (node.nodeType === 1 && !node.dataset?.expOwned && addsStyles(node)) styled = true;
    }
    if (styled) queue.add(root);
    scheduleSlice();
  }

  function recordSlice(started) {
    const ms = performance.now() - started;
    stats.slices++; stats.totalMs += ms; stats.maxSliceMs = Math.max(stats.maxSliceMs, ms);
  }

  function scheduleSlice() {
    if (sliceHandle || !queue.size || !active) return;
    if (typeof requestIdleCallback === 'function') { const id = requestIdleCallback(runSlice, { timeout: 200 }); sliceHandle = { cancel: () => cancelIdleCallback(id) }; }
    else { const id = setTimeout(runSlice, 0); sliceHandle = { cancel: () => clearTimeout(id) }; }
  }

  function runSlice() {
    sliceHandle = null;
    if (!active) return;
    const started = performance.now();
    while (queue.size && performance.now() - started < SLICE_MS) {
      const root = queue.values().next().value; queue.delete(root);
      if (liveRoot(root)) processRoot(root);
    }
    recordSlice(started);
    scheduleSlice();
  }

  // Themes the document now and queues every known shadow root.
  function fullPass() {
    resetRunStats(); stats.runs++; stats.passes++;
    for (const [root, watcher] of [...rootObservers]) {
      if (liveRoot(root)) continue;
      watcher.disconnect(); rootObservers.delete(root); shadowCopies.delete(root); fallbackStyles.delete(root); knownRoots.delete(root);
    }
    rootList = rootList.filter(root => knownRoots.has(root));
    stats.shadowRoots = Math.max(0, rootList.length - 1);
    const started = performance.now(); processRoot(document); recordSlice(started);
    for (const root of rootList) if (root !== document) queue.add(root);
    scheduleSlice();
  }

  function refresh(nextTheme, nextOptions) {
    if (!nextTheme) return;
    if (nextOptions && Object.prototype.hasOwnProperty.call(nextOptions, 'nativeDark')) nativeDarkMode = Boolean(nextOptions.nativeDark);
    if (!active) { start(nextTheme, { nativeDark: nativeDarkMode }); return; }
    const nextKey = themeKey(nextTheme);
    if (lastThemeKey && lastThemeKey !== nextKey) { generation++; pendingRemote.clear(); }
    theme = nextTheme; lastThemeKey = nextKey;
    queue.clear(); sliceHandle?.cancel(); sliceHandle = null;
    fullPass();
  }

  function start(nextTheme, nextOptions = {}) {
    nativeDarkMode = Boolean(nextOptions.nativeDark);
    if (active) { refresh(nextTheme, { nativeDark: nativeDarkMode }); return; }
    theme = nextTheme; lastThemeKey = themeKey(nextTheme); active = true;
    registerRoot(document); discoverIn(document);
    fullPass();
    sharedObserverCleanup?.(); sharedObserverCleanup = null;
    const inspectRoots = roots => {
      let styled = false;
      for (const root of roots || []) {
        if (!root || ownedNode(root)) continue;
        discoverIn(root); watchStylesheetLinks(root);
        if (root.nodeName === 'STYLE' || addsStyles(root)) styled = true;
      }
      if (styled) queue.add(document);
      scheduleSlice();
    };
    sharedObserverCleanup = ExtraPotionsCore.observePageBatch((_batch, roots) => inspectRoots(roots), { productId: 'shift' });
  }

  function stop() {
    active = false; nativeDarkMode = false; generation++; pendingRemote.clear();
    sliceHandle?.cancel(); sliceHandle = null; queue.clear();
    sharedObserverCleanup?.(); sharedObserverCleanup = null;
    for (const watcher of rootObservers.values()) watcher.disconnect();
    rootObservers.clear();
    for (const root of new Set([...shadowCopies.keys(), ...fallbackStyles.keys()])) {
      const keys = new Set([...(shadowCopies.get(root)?.keys() || []), ...(fallbackStyles.get(root)?.keys() || [])]);
      for (const key of keys) removeCopy(root, key);
    }
    shadowCopies.clear(); fallbackStyles.clear();
    for (const handle of handles.values()) handle.remove();
    handles.clear();
    knownRoots = new WeakSet(); rootList = []; lastThemeKey = '';
  }

  function health() {
    const handleKeys = [...handles.keys()];
    return {
      ...stats, nativeDarkMode,
      pendingRemote: pendingRemote.size,
      pendingRemoteHosts: [...new Set([...pendingRemote.keys()].map(key => { try { return new URL(key.split('|')[0]).hostname; } catch { return ''; } }).filter(Boolean))].slice(0, 12),
      remoteAttemptHosts: [...remoteLifetime.hosts].slice(0, 12),
      remoteAttemptsLifetime: remoteLifetime.attempts, remoteSuccessesLifetime: remoteLifetime.successes, remoteFailuresLifetime: remoteLifetime.failures,
      remoteSkippedNoHrefLifetime: remoteLifetime.skippedNoHref, remoteRulesRecoveredLifetime: remoteLifetime.recoveredRules,
      lastRemoteSuccessAt: remoteLifetime.lastSuccessAt || null, lastRemoteFailure: remoteLifetime.lastFailure ? { ...remoteLifetime.lastFailure } : null,
      handles: handleKeys.filter(key => typeof key !== 'string').length,
      remoteHandles: handleKeys.filter(key => typeof key === 'string').length,
      cacheEntries: stats.cachedSheets, remoteCacheEntries: remoteCache.size,
      knownRoots: rootList.length,
      adoptedRoots: [...shadowCopies.values()].filter(map => map.size).length,
      fallbackRoots: [...fallbackStyles.values()].filter(map => map.size).length,
      totalMs: Math.round(stats.totalMs), maxSliceMs: Math.round(stats.maxSliceMs * 10) / 10,
    };
  }
```

The field list above is copied exactly from the reset statement in the old `refresh`.

- [ ] **Step 6: Run the new tests**

Run: `cd SHIFT && node --test tests/dynamic-engine-incremental.test.cjs tests/dynamic-boundaries.test.cjs`
Expected: PASS (5 + 3). If a dynamic-boundaries test fails, read its assertion: it may depend on a `health()` field or synchronous document behaviour that Step 5 must preserve; fix the engine, not the test.

- [ ] **Step 7: Commit**

```bash
cd SHIFT && git add src/dynamic-engine.js && git commit -m "perf: incremental dynamic theming with shared copies per stylesheet"
```

---

### Task 3: Existing shadow-root tests follow the shared-copy model

**Files:**
- Modify: `SHIFT/tests/browser.test.cjs` (tests near lines 1380–1440; also check the shadow test near line 1220)

- [ ] **Step 1: Run the full suite to see what changed**

Run: `cd SHIFT && node scripts/build.cjs && node --test tests/*.test.cjs > ../shift-suite.log 2>&1; grep -E "^ℹ (pass|fail)|^✖" ../shift-suite.log`
Expected: failures only in shadow-root tests that look for `style[data-exp-shift-dynamic]` inside a shadow root, or count `adoptedStyleSheets`.

- [ ] **Step 2: Update those tests**

In the test with `#component-host` (≈1392–1398), replace the wait and the `generated` count with a check for SHIFT's adopted copy:

```js
  await page.waitForFunction(() => document.getElementById('component-host').shadowRoot.adoptedStyleSheets.some(sheet => { try { return sheet.cssRules[0]?.selectorText === '.exp-owned-sheet-marker'; } catch { return false; } }));
```
and `generated: shadow.adoptedStyleSheets.filter(sheet => { try { return sheet.cssRules[0]?.selectorText === '.exp-owned-sheet-marker'; } catch { return false; } }).length,`

In the `#adopted-host` test (≈1407–1440), keep "without replacing site sheets": store the site sheet as `window.__siteSheet = sheet` when creating it, use the same `waitForFunction` as above (for `adopted-host`), and replace the facts/asserts with:

```js
  const facts = await page.evaluate(() => {
    const shadow = document.getElementById('adopted-host').shadowRoot;
    const owned = shadow.adoptedStyleSheets.filter(sheet => { try { return sheet.cssRules[0]?.selectorText === '.exp-owned-sheet-marker'; } catch { return false; } });
    return { bg: getComputedStyle(shadow.getElementById('adopted-part')).backgroundColor, siteSheetFirst: shadow.adoptedStyleSheets[0] === window.__siteSheet, overrides: owned.length };
  });
  assert.notEqual(facts.bg, 'rgb(245, 245, 245)');
  assert.equal(facts.siteSheetFirst, true);
  assert.equal(facts.overrides, 1);
```

Apply the same pattern to any other failing shadow-root assertion from Step 1 (look for `style[data-exp-shift-dynamic]` queried on a `shadowRoot`). Do not change assertions about document-level `style[data-exp-shift-dynamic]` — those must still pass unchanged.

- [ ] **Step 3: Full suite and release check**

Run: `cd SHIFT && node scripts/build.cjs && node --test tests/*.test.cjs` then `node scripts/release-check.cjs`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
cd SHIFT && git add tests/browser.test.cjs shift.user.js && git commit -m "test: shadow-root theming uses shared adopted copies"
```

---

### Task 4: Measure on the Reddit-like page

**Files:** none committed.

- [ ] **Step 1:** Re-create the measurement used during diagnosis: a Playwright script that injects the readable SHIFT (`tests/load-source.cjs` → `loadSource()`), sets GM storage `exp:v3:shift:settings` to `{ schema: 1, theme: 'midnight', updateNotifications: false }`, loads a page with 1,500 shadow-root components using 150 shared constructed sheets added in 40 waves 150 ms apart (each wave also adds a light-DOM `<style>`), plus a late `rs-chat` component with a nested `chat-msg` at 2.5 s, and records long tasks (`PerformanceObserver` type `longtask`) and `EXP.DynamicEngine` health. Run it on the new build. The pre-change baseline from diagnosis is 41 refreshes, 3.7–6.2 s of SHIFT time, max refresh 196–282 ms, last post unthemed.
- [ ] **Step 2:** Expected after: long tasks attributable to SHIFT ≈ 0, `maxSliceMs < 50`, every post and both chat elements themed. Record before/after numbers in the final report.

---

### Task 5: Release (requires the user's explicit go-ahead)

- [ ] **Step 1:** Ask the user to approve publishing SHIFT. On a clear yes:

```bash
cd SHIFT && RELEASE_NOTES_JSON='["Loads faster on Reddit and other component-heavy sites.","Themes Reddit chat and every post consistently."]' node scripts/prepare-feature-release.cjs && node scripts/build.cjs && node scripts/release-check.cjs
```

- [ ] **Step 2:** Recapture README screenshots (`cd exp-core && node scripts/capture-screenshots.cjs SHIFT`), commit `Release SHIFT <version>: faster theming on component-heavy sites`, `git fetch origin && git rebase origin/main && git push origin HEAD:main`, and watch the `Publish release` workflow to success.
- [ ] **Step 3:** Ask the user for a fresh Reddit trace to confirm on the real site.

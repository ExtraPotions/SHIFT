## 3.3.23 — 2026-09-25

- Uses the same menu-width notice surface for Current Version, Update Available, and Update Complete, matching Dropper.
- Forces a fresh update check for each newly installed SHIFT version instead of inheriting the previous version's 15-minute throttle or stale remote version.
- Reports separate progress-card, launcher, launcher-row, menu, and notice geometry, and limits resource-error details to ownership plus asset hostname.

## 3.3.22 — 2026-09-25

- Preserves SHIFT settings across userscript updates by recovering from browser-local backup storage when manager storage is missing.
- Mirrors validated settings to both manager storage and the local fallback so future updates can self-heal without resetting preferences.

## 3.3.21 — 2026-09-25

- Shows each automatic update notice once for that version instead of on every page load.
- Stacks simultaneous notices beside the complete launcher grid.
- Moves diagnostics and recovery actions under the final System menu.

## 3.3.20 — 2026-09-25

- Keeps every launcher clickable when Dropper and multiple ExtraPotions products share the page.
- Uses exp-core 3.2.19 to prevent transparent launcher containers from intercepting pointer input.

## 3.3.19 — 2026-09-25

- Uses the borderless SHIFT launcher artwork everywhere an icon is shown.
- References the SVG by URL instead of embedding image bytes in the userscript.
- Removes the superseded bordered SVG and raster badge files.

## 3.3.18 — 2026-09-25

- Keeps the rebuilt theme rendering and expanded Amazon coverage from 3.3.17.
- Aligns shared status and progress chrome with the rounded-rectangle suite preference.
- Updates the bundled Core provenance to the verified Dropper 3.2.18 artifact.
- Retains Page, Technical, Console, and Plugin diagnostics with peer conflict reporting.

## 3.3.17 — 2026-09-25

- Rebuilds theme rendering with one owner each for component rules, stylesheet transformation, live DOM repair, and lifecycle restoration.
- Improves Amazon coverage with per-stylesheet budgets, stale-response cancellation, scroll-aware contrast repair, and explicit component roles.
- Standardizes Page, Technical, Console, and Plugin diagnostics with bounded redaction and current-page product conflict observations.
- Embeds the canonical SHIFT badge in userscript-manager metadata and replaces the bordered README image with borderless SVG artwork.

## 3.3.16 — 2026-09-24

- Removes the decorative progress ring from the SHIFT launcher.
- Keeps the launcher at 48 px with 40 px artwork and the menu badge at 38 px.
- Uses the canonical SHIFT SVG as the userscript-manager icon.

## 3.3.15 — 2026-09-24

- Uses 48 px launcher buttons with 40 px artwork and an 8 px gap between launchers.
- Expands menu-header badge artwork to 38 px.
- Adds a dedicated 128 px raster badge derivative without changing either SVG source.

## 3.3.14 — 2026-09-24

- Keeps the changelog near a bottom-positioned launcher instead of pushing it to the top of the window.
- Places the changelog beside upward-opening menus so it remains outside the menu without covering it.
- Repositions the changelog after launcher coordination, menu resizing, and viewport changes.

## 3.3.13 — 2026-09-24

- Limits active launcher and theme coordination to Dropper, SHIFT, PRISMA, and WARD.
- Stops cross-product audits from tracking archived repositories.
- Pins the bundled Core reference to the verified Dropper 3.2.13 release artifact.

## 3.3.12 — 2026-09-24

- Packs installed product launchers into Dropper's compact progress rail and restores the normal grid when the obstacle closes.
- Keeps open-menu placement aligned to each launcher's assigned grid row.

## 3.3.11 — 2026-09-24

- Replaces the legacy menu palettes with Ember, Midnight, Glacier, High contrast, Verdant, Pride, Crimson, and SHIFT gem.
- Migrates saved legacy palette names to the closest new direction without changing page content settings.

## 3.3.10 — 2026-09-24

- Adds Dropper’s layered Warm charcoal menu finish while keeping page themes separate.
- Retains the winner-theme priority and matte controls across installed products.

## 3.3.9 — 2026-09-24

- Uses the highest-priority installed product’s selected theme surfaces without changing page themes.
- Hides subordinate menu theme controls while preserving their own selections.

## 3.3.8 — 2026-09-24

- Repairs SteamGifts giveaway controls with dark theme surfaces and readable labels.
- Stops repeated stylesheet walks during ordinary page mutations.

## 3.3.7 — 2026-09-24

- Pairs SteamGifts pale headings and table controls with dark theme surfaces.
- Preserves the warning color of SteamGifts notices while fixing their contrast.

## 3.3.6 — 2026-09-24

- Adopts the verified Dropper 3.2.8 Core for menus, themes, notices, diagnostics, and launcher coordination.
- Keeps SHIFT page theming independent while standardizing matte controls, responsive layout, and CSP-safe chrome.
- Synchronizes source, install metadata, and the reproducible userscript build.

## 3.3.0 — 2026-09-23

- Rebuilds SHIFT around a dedicated stylesheet transformer, visual verification resolver, and reversible inline color engine.
- Adds dynamic repair for Shadow DOM, pseudo-elements, same-origin frames, forms, overlays, gradients, borders, and contrast failures.
- Preserves artwork, semantic and brand colors, masks, currentColor, and modern CSS relationships while repairing structural light surfaces.
- Keeps the proven 3.2.6 launcher and menu baseline while expanding diagnostics for the rebuilt rendering pipeline.

## 3.1.0 — 2026-09-23

- Adds the independent SHIFT color engine with source-hierarchy preservation, inline color repair, and semantic CSS custom-property transformation.
- Adds stylesheet, open Shadow DOM, and adopted stylesheet transformation with reversible cleanup and diagnostics.
- Adds native-dark conflict avoidance, contrast-aware foreground repair, viewport-priority processing, and cached anti-flash preload.
- Adds pseudo-element and CSS gradient transformation while preserving URL-backed artwork.
- Adds transformation caching and expanded browser regression coverage for the 3.1 engine.

## 3.0.19 — 2026-09-23

- Restyles toggle switches with matte theme surfaces, softer knobs, and restrained accent ON states instead of metallic gray and full-gradient tracks.
- Keeps High Contrast and forced-colors switch behavior explicit for accessibility.
- Matches switch chrome to the active theme instead of using metallic gray tracks or full-gradient Pride ON fills.
- Leaves existing toggle behavior, settings persistence, and panel layout unchanged.

## 3.0.18 — 2026-09-21

- Keeps menu CSS inside the shadow root so userscript style APIs cannot paint the page.
- Pins the launcher host transparent so the browser popover layer cannot cover the site in white.
- Leaves a site background shorthand intact on Original and exclusion so loading SHIFT cannot turn the page white.

## 3.0.17 — 2026-09-21

- Stops destroying site background shorthand when theming, so exclusion/Original cannot leave a blank white canvas.
- Purges leftover SHIFT page styles on restore and matches exclusions to subdomains (www).

## 3.0.16 — 2026-09-21

- Stops blanket background fills on section and article so transparent wrappers no longer cover heroes.
- Surface repair only adopts opaque neutral shells, and nested thumbnails no longer block repairing grey boxes.

## 3.0.15 — 2026-09-21

- Stops painting common layout classes (`.container`, `.wrapper`, `.page`, and similar) that were covering heroes and page art on every site.
- Keeps Greasy Fork `.width` / `.script-list` shells themed so light text is not left on white CMS boxes.

## 3.0.14 — 2026-09-21

- Paints classic light-site content wrappers (`.width`, `.container`, and similar) so forced theme text is not left on white boxes.
- Fixes washed-out Greasy Fork and CMS pages where headings stayed light on unpainted white shells.
## 3.3.6 — 2026-09-24

- Migrated menu chrome, themes, diagnostics, update notices, and launcher placement to the Dropper 3.2.8 Core contract.
- Kept SHIFT page-theme variables outside dynamic stylesheet rewriting so palette tokens remain stable.
- Added cross-product launcher coordination and refreshed browser coverage for the canonical UI.

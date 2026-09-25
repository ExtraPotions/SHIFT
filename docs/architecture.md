# Architecture

SHIFT is a source-first vanilla JavaScript userscript. The build concatenates ordered modules into one private closure; no runtime module or executable code is downloaded.

`core.js` owns product registration, lifecycle, capability validation, version negotiation, sanitized diagnostics, one filtered DOM scheduler, navigation signaling, and declarative DOM coordination. Each userscript sandbox keeps its own callback-bearing Core runtime. The DOM protocol publishes only versioned product/launcher state so isolated sandboxes do not assume a shared JavaScript global.

`settings.js` owns the `exp:v3:shift` schema. It does not inspect ColorShift or other pre-V3 keys. Validation creates a complete replacement object before persistence so invalid import data cannot partially apply.

`color-engine.js` is SHIFT's independent color transformation layer. It parses source colors, preserves useful luminance/chroma relationships, maps backgrounds, foregrounds, borders, and outlines into the resolved SHIFT palette, caches transformations by the complete resolved palette, and repairs explicit inline colors through namespaced CSS variables without replacing the site's original declarations. Inline repair is reversible and skips image-backed artwork when Preserve art is enabled.

`engine.js` resolves effective settings and paints through a host-first cascade: `html[data-exp-shift]`, `body`, and common app shells receive an opaque page palette immediately (with an inline host fallback after stylesheet attach), one owned page stylesheet is updated in place and reattached if stolen, then bounded classification repairs leftover neutral boxes including viewport shells and a limited set of open shadow roots. The same filtered scheduler now feeds bounded inline-color repair, so dynamic inline styles can be recolored without adding a second mutation observer. Structural classification obeys Repair surfaces independently from inline color repair. An “everywhere” layer themes landmarks and exact framework chrome classes via CSS variables without broad substring class hooks or invert filters, so nested content stays readable. Artwork, photo `url()` backgrounds, forced-colors, and print stay protected. The engine's scheduler also invokes adapter processors, avoiding separate competing mutation observers.

`adapters.js` selects at most one supported-site adapter. Adapter exceptions are contained and reported as degraded while Generic Mode continues. Adapter styles and classification markers use the `exp-shift` namespace.

`ui.js` renders one Shadow DOM root containing a 48×48 rounded-square launcher and two-panel desktop menu. Narrow viewports preserve the same destinations through sequential horizontal navigation. Boolean controls are buttons with `role="switch"`; no checkbox UI is used.

State precedence is hostname override, selected profile, global product values, then schema defaults. Appearance selects, switches, and palette swatches preview and persist on change. Hold to Show Original temporarily removes SHIFT effects only.
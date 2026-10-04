EXP.VERSION = '3.5.3';

EXP.ReleaseNotes = (() => {
  const NOTES = Object.freeze({
    '3.5.3': ["Show a clear System status with safe retry for a suspended theme repair.","Choose Standard, Large, or Extra Large menus on each site.","Verify Amazon search, product, cart, and orders theme readability while preserving artwork and purchasing controls."],
    '3.5.2': ["Use product names without the retired V3 integration label in settings prompts and import messages.","Keep existing saved settings and settings exports compatible."],
    '3.5.1': ["Make small menu text easier to read, including captions, version badges, notices, and diagnostic details.","Use consistent sizes for labels and controls across the menu."],
    '3.5.0': ["Create, preview, import, and export custom colors in Palette Studio with a text-contrast check.","Preserve selected elements on a site and reuse those choices when page content changes.","Pause ExtraPotions page features together from System > Site control."],
    '3.4.31': ['Updates the shared foundation to exp-core 3.4.13.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.30': ['Updates the shared foundation to exp-core 3.4.12.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.29': ["Removes retired menu-width preferences from stored settings without resetting other preferences.","Keeps the existing shared menu size and tests rendered layout instead of obsolete width-mode labels."],
    '3.4.28': ['Updates the shared foundation to exp-core 3.4.11.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.27': ['Updates the shared foundation to exp-core 3.4.10.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.26': ["Updates to exp-core 3.4.9.","Install Update now always installs the latest published release, never unreleased code.","The SHIFT menu now closes when you click outside it, like the rest of the suite."],
    '3.4.25': ['Updates the shared foundation to exp-core 3.4.8.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.24': ["Fixes a blank video on streams that have an extension overlay, such as Fortnite streams: SHIFT no longer paints the overlay frame over the video.","SHIFT now leaves embedded frames from other websites (overlays, ads, maps, players) to the page that hosts them, and keeps them transparent.","Frames from the same website, and the page itself, are themed as before."],
    '3.4.23': ['Updates the shared foundation to exp-core 3.4.7.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.22': ['Updates the shared foundation to exp-core 3.4.6.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.21': ['Updates the shared foundation to exp-core 3.4.5.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.20': ["Themes now recognize other ExtraPotions styles by the marker Core puts on them, not by a list of product names.","Keeps PRISMA, WARD, and Dropper colors untouched under every SHIFT theme.","Leaves theming of the page itself unchanged.","Adds no new settings."],
    '3.4.19': ['Updates the shared foundation to exp-core 3.4.4.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.18': ['Updates the shared foundation to exp-core 3.4.3.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.17': ["Adds a Check for updates button that works without turning on update notifications.","Checks GitHub release information only when you press it and never installs anything.","Reports whether an update is available, the script is current, or the check failed.","Leaves everything else in the product unchanged."],
    '3.4.16': ["Keeps PRISMA highlights and other ExtraPotions products using their own colors under every SHIFT theme.","Stops the dynamic theme engine from rewriting rules that belong to PRISMA, WARD, and Dropper.","Leaves theming of the page itself unchanged.","Adds no new settings."],
    '3.4.15': ['Updates the shared foundation to exp-core 3.4.2.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.14': ['Updates the shared foundation to exp-core 3.4.1.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.13': ['Updates the shared foundation to exp-core 3.4.0.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.12': ['Updates the shared foundation to exp-core 3.3.17.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.11': ['Updates the shared foundation to exp-core 3.3.15.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.10': ['Updates the shared foundation to exp-core 3.3.13.','Rebuilds shared UI, launcher, diagnostics, notices, and coordination from the pinned Core release.','Leaves SHIFT product-specific engine behavior unchanged.'],
    '3.4.9': ["Adds the shared themed outer menu border across the ExtraPotions suite.","Bundles exp-core 3.3.12 pinned to the verified Dropper 3.3.15 baseline.","Preserves SHIFT page-theme, readability, and site-adapter behavior."],
    '3.4.8': ['Lets every launcher move left, right, up, or down within the shared grid.','Persists launcher order and supports Alt+Arrow keyboard reordering.','Bundles exp-core 3.3.11.'],
    '3.4.7': ['Adds “Why this appearance?” with the effective palette, setting sources, and the reason SHIFT is active or paused.','Lets each explanation jump directly to its global, profile, or site control.','Bundles exp-core 3.3.10 with layered menu surfaces and accessible semantic colors.'],
    '3.4.6': ["Compacts System menus and keeps menu width controls together on one row.","Groups existing menu preferences consistently while preserving saved settings.","Removes automatic Settings Backup and its restore controls.","Adds a Bitcoin donation option with address copying and wallet support."],
    '3.4.5': ['Aligns automated release verification with the bundled exp-core 3.3.8.','Preserves the Original swatch, menu controls, and refreshed feature guide.'],
    '3.4.4': ["Adds an Original palette swatch, selected by default for fresh settings.","Bundles exp-core 3.3.8 with section arrangement and viewport-safe menus.","Refreshes the README and feature screenshots in a horizontal gallery."],
    '3.4.3': ["Adds a readability inspector and a reversible bypass for selected page elements.","Restores inline repairs from both color engines while preserving unrelated styles.","Adds settings backups, rollback, and compatibility details through exp-core 3.3.7."],
    '3.4.2': ["Bundles exp-core 3.3.6 with shared menu coordination and default donation controls.","Preserves Firefox-safe settings and closes peer launcher menus without stealing focus."],
    '3.4.1': ["Fixes Firefox settings initialization and editable settings drafts in userscript sandboxes.","Bundles exp-core 3.3.5 with Firefox-safe settings copies and idle menu mutation fixes."],
    '3.4.0': [
      'Prevents launcher backdrops from covering Greasy Fork and other sites while preserving real site dialogs.',
      'Keeps Amazon and other light pages themed after startup by removing temporary Preload paint before native-theme detection.',
      'Bundles exp-core 3.3.3 with the shared launcher fix and preserves the Dropper 3.3.2 interface baseline.',
    ],
    '3.4.0-dev.10': [
      'Respects ESGST semantic color ownership on SteamGifts category chips, highlighted contributor levels, and ESGST-colored entry controls.',
      'Marks supported third-party semantic components as preserved before generic live repair so extension-owned state colors are not rewritten.',
      'Makes global link, form, and muted-text readability rules honor preserved subtrees consistently.',
      'Keeps native SteamGifts headings, notices, and unowned contributor-level surfaces under Shift styling.',
    ],
    '3.4.0-dev.9': [
      'Adds conservative inferred native-dark detection for sites with a dark canvas and a strong majority of dark major surfaces even when color-scheme is not declared.',
      'Requires multiple large visible surface samples, a high dark-surface ratio, and very few light major surfaces, while strong light-surface evidence or a large light primary content region vetoes native-dark classification.',
      'Adds native-dark evidence diagnostics including explicit-scheme state, canvas state, sampled surface counts, dark/light/mid counts, and dark-surface ratio.',
      'Adds anonymous positive and mixed-surface regressions so dark applications gain native-dark restraint while mixed or light sites remain on the full transformation path.',
    ],
    '3.4.0-dev.8': [
      'Memoizes resolved ancestor backgrounds within each resolver pass so deeply nested native-dark content can reuse parent results instead of rebuilding the same chain.',
      'Keeps an eight-level native-dark fast path but extends accurately to a hard depth of twenty-four only when needed, then caches the resolved chain.',
      'Adds diagnostics for parent-background cache reuse and extended native-dark walks while preserving the existing native-dark structural fast path.',
      'Adds an anonymous deep native-dark regression covering nested contrast repair, sibling reuse conditions, and preservation of intentional light surfaces.',
    ],
    '3.4.0-dev.7': [
      'Adds a native-dark fast path that scans only interactive/accessibility surfaces instead of the full structural surface set.',
      'Caches effective backgrounds within each resolver pass and caps native-dark ancestor reconstruction at eight levels.',
      'Avoids duplicate effective-background work before native-dark repairs while keeping text, forms, dialogs, focus, and contrast correction active.',
      'Adds native-dark performance telemetry and a generic native-dark regression while leaving Amazon full-transformation behavior unchanged.',
    ],
    '3.4.0-dev.6': [
      'Suppresses resolver feedback from Shift-owned inline style writes so generic repairs do not immediately schedule redundant mutation passes.',
      'Collapses nested mutation roots before each pass and reports per-pass examined versus changed counts, collapsed roots, ignored self-mutations, and maximum pass duration.',
      'Adds an unknown-site regression with no adapter or site rules to verify generic surface, contrast, form, media-preservation, and dynamic-content behavior.',
      'Keeps the established Amazon dev.5 appearance and remote stylesheet recovery behavior as regression baselines while moving performance hardening into the generic engine.',
    ],
    '3.4.0-dev.5': [
      'Neutralizes Amazon multiply blend modes on product metadata so repaired titles and prices render at their intended light color.',
      'Neutralizes multiply blending and reduced opacity on Amazon product images and image wrappers while keeping native media wells intact.',
      'Uses the uploaded Amazon page structure to cover hashed asin metadata, title, price, image-wrapper, and image class families without hard-coding build hashes.',
      'Adds a regression proving Amazon product text and images remain visible when Amazon applies multiply blending.',
    ],
    '3.4.0-dev.4': [
      'Adds a final Amazon product-text repair pass so recovered stylesheet rules cannot push recommendation titles and prices back to near-black.',
      'Keeps the successful remote stylesheet recovery path unchanged while applying Amazon title and price corrections after it.',
      'Preserves the dev.3 product-media well treatment and native artwork handling.',
      'Adds a regression proving Amazon product text remains readable even when a recovered stylesheet uses important dark colors.',
    ],
    '3.4.0-dev.3': [
      'Preserves Amazon product-media wells so dark cards do not swallow dark or transparent product artwork.',
      'Repairs Amazon product titles and prices explicitly while keeping product images unfiltered and fully opaque.',
      'Adds an independent watchdog around remote stylesheet requests so stalled manager requests cannot remain pending forever.',
      'Adds bounded remote host diagnostics so Amazon stylesheet transport failures can be identified precisely.',
    ],
    '3.4.0-dev.2': [
      'Strengthens Amazon navigation, card, form, flyout, alert, and result-surface coverage while preserving product artwork.',
      'Adds explicit Amazon CDN connections for cross-origin stylesheet recovery.',
      'Adds durable remote stylesheet telemetry for pending requests, lifetime successes/failures, recovered rules, and last failure context.',
      'Adds Amazon surface and remote stylesheet regression coverage.',
    ],
    '3.4.0-dev.1': [
      'Rebuilds SHIFT on the Dropper 3.3.2 application shell instead of maintaining a separate launcher and menu implementation.',
      'Uses exp-core for the launcher, header, support control, section navigation, Full / Compact / Narrow geometry, update cards, and multi-product coordination.',
      'Preserves the existing SHIFT color, stylesheet, live-repair, adapter, profile, and site-rule engines behind the new shared shell.',
      'Removes the legacy SHIFT menu-chrome module from the generated userscript so shared UI has one implementation owner.',
    ],
	'3.3.23': [
	  'Uses the same menu-width notice surface for Current Version, Update Available, and Update Complete, matching Dropper.',
	  'Forces a fresh update check for each newly installed SHIFT version instead of inheriting the previous version\'s 15-minute throttle or stale remote version.',
	  'Reports separate progress-card, launcher, launcher-row, menu, and notice geometry, and limits resource-error details to ownership plus asset hostname.',
	],
	'3.3.22': [
	  'Preserves SHIFT settings across userscript updates by recovering from browser-local backup storage when manager storage is missing.',
	  'Mirrors validated settings to both manager storage and the local fallback so future updates can self-heal without resetting preferences.',
	],
	'3.3.21': [
	  'Shows each automatic update notice once for that version instead of on every page load.',
	  'Stacks simultaneous notices beside the complete launcher grid.',
	  'Moves diagnostics and recovery actions under the final System menu.',
	],
	'3.3.20': [
	  'Keeps every launcher clickable when Dropper and multiple ExtraPotions products share the page.',
	  'Uses exp-core 3.2.19 to prevent transparent launcher containers from intercepting pointer input.',
	],
	'3.3.19': [
	  'Uses the borderless SHIFT launcher artwork everywhere an icon is shown.',
	  'References the SVG by URL instead of embedding image bytes in the userscript.',
	  'Removes the superseded bordered SVG and raster badge files.',
	],
	'3.3.18': [
	  'Keeps the rebuilt theme rendering and expanded Amazon coverage from 3.3.17.',
	  'Aligns shared status and progress chrome with the rounded-rectangle suite preference.',
	  'Updates the bundled Core provenance to the verified Dropper 3.2.18 artifact.',
	  'Retains Page, Technical, Console, and Plugin diagnostics with peer conflict reporting.',
	],
	'3.3.17': [
	  'Rebuilds theme rendering with one owner each for component rules, stylesheet transformation, live DOM repair, and lifecycle restoration.',
	  'Improves Amazon coverage with per-stylesheet budgets, stale-response cancellation, scroll-aware contrast repair, and explicit component roles.',
	  'Standardizes Page, Technical, Console, and Plugin diagnostics with bounded redaction and current-page product conflict observations.',
	  'Embeds the canonical SHIFT badge in userscript-manager metadata and replaces the bordered README image with borderless SVG artwork.',
	],
	'3.3.16': [
	  'Removes the decorative progress ring from the SHIFT launcher.',
	  'Keeps the launcher at 48 px with 40 px artwork and the menu badge at 38 px.',
	  'Uses the canonical SHIFT SVG as the userscript-manager icon.',
	],
	'3.3.15': [
	  'Uses 48 px launcher buttons with 40 px artwork and an 8 px gap between launchers.',
	  'Expands menu-header badge artwork to 38 px.',
	  'Adds a dedicated 128 px raster badge derivative without changing either SVG source.',
	],
	'3.3.14': [
	  'Keeps the changelog near a bottom-positioned launcher instead of pushing it to the top of the window.',
	  'Places the changelog beside upward-opening menus so it remains outside the menu without covering it.',
	  'Repositions the changelog after launcher coordination, menu resizing, and viewport changes.',
	],
	'3.3.13': [
	  'Limits active launcher and theme coordination to Dropper, SHIFT, PRISMA, and WARD.',
	  'Stops cross-product audits from tracking archived repositories.',
	  'Pins the bundled Core reference to the verified Dropper 3.2.13 release artifact.',
	],
	'3.3.12': [
	  "Packs installed product launchers into Dropper's compact progress rail and restores the normal grid when the obstacle closes.",
	  "Keeps open-menu placement aligned to each launcher's assigned grid row.",
	],
	'3.3.11': [
	  'Replaces the legacy menu palettes with Ember, Midnight, Glacier, High contrast, Verdant, Pride, Crimson, and SHIFT gem.',
	  'Migrates saved legacy palette names to the closest new direction without changing page content settings.',
	],
    '3.3.10': [
      'Adds Dropper’s layered Warm charcoal menu finish while keeping page themes separate.',
      'Retains the winner-theme priority and matte controls across installed products.',
    ],
    '3.3.9': [
      'Uses the highest-priority installed product’s selected theme surfaces without changing page themes.',
      'Hides subordinate menu theme controls while preserving their own selections.',
    ],
    '3.3.8': [
      'Repairs SteamGifts giveaway controls with dark theme surfaces and readable labels.',
      'Stops repeated stylesheet walks during ordinary page mutations.',
    ],
    '3.3.7': [
      'Pairs SteamGifts pale headings and table controls with dark theme surfaces.',
      'Preserves the warning color of SteamGifts notices while fixing their contrast.',
    ],
    '3.3.6': [
      'Adopts the verified Dropper 3.2.8 Core for menus, themes, notices, diagnostics, and launcher coordination.',
      'Keeps SHIFT page theming independent while standardizing matte controls, responsive layout, and CSP-safe chrome.',
      'Synchronizes source, install metadata, and the reproducible userscript build.',
    ],
    '3.3.0': [
      'Rebuilds SHIFT around a dedicated stylesheet transformer, visual verification resolver, and reversible inline color engine.',
      'Adds dynamic repair for Shadow DOM, pseudo-elements, same-origin frames, forms, overlays, gradients, borders, and contrast failures.',
      'Preserves artwork, semantic and brand colors, masks, currentColor, and modern CSS relationships while repairing structural light surfaces.',
      'Keeps the proven 3.2.6 launcher and menu baseline while expanding diagnostics for the rebuilt rendering pipeline.',
    ],
    '3.3.0-dev.2': [
      'Hardens generated stylesheet insertion for highly dynamic pages such as Amazon.',
      'Prevents detached or moved stylesheet owner nodes from aborting relationship-aware CSS transformation.',
      'Retains the dev.1 variable, compositing, foreground pairing, gradient, shadow, SVG, caching, and invalidation work.',
    ],
    '3.3.0-dev.1': [
      'Development preview of the relationship-aware stylesheet engine for Amazon live testing.',
      'Adds CSS variable-chain resolution, alpha compositing, foreground/background pairing, gradients, shadows, SVG paint transforms, pseudo-element coverage, stylesheet caching, and event-driven invalidation.',
      'Adds diagnostics for advanced stylesheet transformations and cache behavior.',
    ],
    '3.2.6': [
      'Positions the floating changelog above the open SHIFT menu instead of overlapping the menu surface.',
      'Aligns the changelog to the menu edge while retaining launcher-relative placement when the menu is closed.',
    ],
    '3.2.5': [
      'Adds the missing GitHub Release action to the floating changelog card, matching Dropper update chrome.',
    ],
    '3.2.4': [
      'Moves update and changelog cards out of the SHIFT menu so they behave as floating notices attached to the launcher, matching Dropper.',
      'Keeps update/changelog content independent of menu scrolling and section layout.',
    ],
    '3.2.3': [
      'Restores the borderless SHIFT menu badge to its full 38px header footprint instead of shrinking the SVG after removing its frame.',
    ],
    '3.2.2': [
      'Restores the SHIFT menu badge to borderless artwork, matching Dropper rather than wrapping the icon in a separate framed tile.',
      'Keeps structural chrome on the launcher control itself while allowing the badge SVG to render cleanly on its own.',
    ],
    '3.2.1': [
      'Matches the SHIFT launcher framing to Dropper with a real theme-aware border and inset frame instead of relying on the icon artwork for its edge.',
      'Places the menu badge inside the same 38px framed header tile used by Dropper and normalizes both launcher and header artwork to 24px.',
    ],
    '3.2.0': [
      'Brings SHIFT update and changelog behavior in line with Dropper: version-pill changelog, themed update notice, update-complete notice, GitHub Release and Install Update actions, and 30-second dismissal.',
      'Checks for updates on the same 15-minute cadence used by Dropper when update notifications are enabled.',
      'Restyles the header divider to the Dropper-style soft edge fade while keeping Pride full-gradient treatment.',
    ],
    '3.1.10': [
      'Recognizes ManaPool Tailwind yellow/amber, red, green, and blue utility status surfaces that do not expose semantic alert class names.',
      'Maps those site-specific utility alerts to SHIFT semantic warning, error, success, and info pairs.',
    ],
    '3.1.9': [
      'Themes warning, success, error, and info surfaces as semantic foreground/background pairs instead of transforming each color independently.',
      'Keeps status links and controls readable while retaining recognizable warning, success, error, and information meaning.',
    ],
    '3.1.8': [
      'Increases structural depth separation so dark palettes retain distinct page, surface, raised, and overlay layers.',
      'Strengthens muted and secondary text recovery for low-contrast labels and captions.',
      'Skips redundant stylesheet transformation passes when the theme and stylesheet signature have not changed.',
    ],
    '3.1.7': [
      'Stops saturated source-site backgrounds and borders from tinting every SHIFT palette toward the site brand color.',
      'Maps structural surfaces and borders into the selected palette while preserving semantic color through links, status elements, accents, and artwork.',
    ],
    '3.1.6': [
      'Stops SHIFT generated styles and owned UI mutations from feeding back into the DOM scheduler.',
      'Coalesces rapid repeated scans of the same page root to reduce SPA mutation churn and CPU work.',
    ],
    '3.1.5': [
      'Captures the site color-scheme and canvas baseline before SHIFT preload/theme paint.',
      'Prevents SHIFT own color-scheme: dark declaration from falsely classifying light sites such as ManaPool as native-dark.',
    ],
    '3.1.4': [
      'Runs SHIFT in the userscript content context instead of forcing page-world injection, improving compatibility with Orion/iPad and strict sites such as ManaPool.',
      'Retains unsafeWindow for the limited page-world access points that explicitly need it.',
    ],
    '3.1.3': [
      'Adds mobile/WebKit launcher visibility self-checks and automatic viewport recovery for sites that strand a connected launcher off-screen.',
      'Hardens launcher host visibility, opacity, pointer events, stacking, and transforms for Orion/iPad-style browser environments.',
    ],
    '3.1.2': [
      'Guards the document-start anti-flash preload so an early DOM or storage failure cannot abort the entire userscript.',
      'Moves preload startup into the protected main boot path before the full DOMContentLoaded initialization.',
    ],
    '3.1.1': [
      'Keeps the SHIFT launcher and recovery menu available even if the new page engine or a site adapter fails during initialization.',
      'Defers full SHIFT startup until DOMContentLoaded while retaining the document-start anti-flash preload.',
    ],
    '3.1.0': [
      'Adds an independently implemented color engine that preserves source surface hierarchy while mapping pages into SHIFT themes.',
      'Repairs inline background, text, border, and semantic CSS custom-property colors without importing Dark Reader source code.',
      'Keeps artwork protection and the existing semantic surface scanner as a conservative fallback.',
      'Makes transformed inline colors fully reversible when SHIFT is disabled, excluded, or set back to Original.',
    ],
    '3.0.19': [
      'Restyles toggle switches with matte theme surfaces, softer knobs, and restrained accent ON states instead of metallic gray and full-gradient tracks.',
      'Keeps High Contrast and forced-colors switch behavior explicit for accessibility.',
      'Matches switch chrome to the active theme instead of using metallic gray tracks or full-gradient Pride ON fills.',
      'Leaves existing toggle behavior, settings persistence, and panel layout unchanged.',
    ],
    '3.0.18': [
      'Keeps menu CSS inside the shadow root so userscript style APIs cannot paint the page.',
      'Pins the launcher host transparent so the browser popover layer cannot cover the site in white.',
      'Leaves a site background shorthand intact on Original and exclusion so loading SHIFT cannot turn the page white.',
    ],
    '3.0.17': [
      'Stops destroying site background shorthand when theming, so exclusion/Original cannot leave a blank white canvas.',
      'Purges leftover SHIFT page styles on restore and matches exclusions to subdomains (www).',
    ],
    '3.0.16': [
      'Stops blanket background fills on section and article so transparent wrappers no longer cover heroes.',
      'Surface repair only adopts opaque neutral shells, and nested thumbnails no longer block repairing grey boxes.',
    ],
    '3.0.15': [
      'Stops painting common layout classes (`.container`, `.wrapper`, `.page`, and similar) that were covering heroes and page art on every site.',
      'Keeps Greasy Fork `.width` / `.script-list` shells themed so light text is not left on white CMS boxes.',
    ],
    '3.0.14': [
      'Paints classic light-site content wrappers (`.width`, `.container`, and similar) so forced theme text is not left on white boxes.',
      'Fixes washed-out Greasy Fork and CMS pages where headings stayed light on unpainted white shells.',
    ],
    '3.0.13': [
      'Dropdown option text matches other menu label text at 11px.',
      'Fixes theme paint so pages keep opaque host backgrounds and readable contrast without blank-white or over-covered content.',
      'Narrows chrome class hooks, scopes host rules to `html[data-exp-shift]`, and keeps an inline host fallback after stylesheet attach.',
      'Leaves media unfiltered and avoids invert/filter stacking that can hide page content.',
    ],
    '3.0.12': [
      'Pride header divider matches other menu rainbow dividers (full bar, not a faded hairline).',
      'Exposes Pride on the host dataset so shared menu chrome applies the same rainbow bar.',
    ],
    '3.0.11': [
      'Appearance selects, switches, and palette swatches preview and save on change—no Apply or Cancel.',
      'Hold to Show Original remains for temporary page comparison without discarding settings.',
      'Committed themes stay active across SPA route changes without a draft row.',
    ],
    '3.0.10': [
      'Applies themes everywhere sooner with CSS variables plus common chrome and framework class hooks.',
      'Follows SG-Dark-Grey / ESGST patterns: :root tokens, color-scheme dark, and broad !important surface paint.',
      'Keeps media unfiltered while cards, navbars, modals, and utility light backgrounds pick up the active theme.',
    ],
    '3.0.9': [
      'Pride uses a full rainbow border, divider, and accents—not just a pink overlay.',
      'Launcher helper tips flip below when the badge sits at the top of the window.',
      'Removes redundant tips from menu section names.',
      'Keeps appearance previews across SPA route changes until Apply or Cancel.',
    ],
    '3.0.8': [
      'Preserves appearance previews across SPA route changes until Apply or Cancel.',
      'Makes Pride visibly distinct with plum page, rainbow edge, and pink accents.',
      'Rebalances the menu into six task-focused routes with Dropper-style chrome.',
      'Ships a direct-install shift.user.js build without loader parts or remote resources.',
    ],
    '3.0.7': [
      'Hardens the launcher host against site CSS that hides, clips, or disables plugin controls.',
      'Uses the browser top layer when manual popovers are available so overlays stay below the launcher.',
      'Reattaches and restores the launcher host if a page removes or hides it during SPA updates.',
    ],
    '3.0.6': [
      'Pride paints a muted rainbow highlight, a plum page, and pink accents on interactive surfaces.',
      'SHIFT gem is a dedicated teal palette instead of near-black midnight.',
      'Warm charcoal, Graphite, Midnight, Pine, and Ember use lighter, more distinct hues.',
    ],
  });

  function forVersion(version) {
    return NOTES[version] || [];
  }

  function renderChangelog(version) {
    const fragment = document.createDocumentFragment();
    const heading = document.createElement('strong');
    heading.className = 'changelog-version';
    heading.textContent = `Version ${version}`;
    fragment.append(heading);
    const list = document.createElement('ul');
    list.className = 'changelog-list';
    for (const item of forVersion(version).slice(0, 4)) {
      const row = document.createElement('li');
      row.textContent = item;
      list.append(row);
    }
    fragment.append(list);
    return fragment;
  }

  return Object.freeze({ forVersion, renderChangelog });
})();

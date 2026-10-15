EXP.Adapters = (() => {
  let pointsWatch = null;
  const YEAR = 365.25 * 86400000;
  const STALE_CSS = '[data-exp-shift-stale="true"]{opacity:.45!important}[data-exp-shift-stale="true"]:is(:hover,:focus-within){opacity:1!important}';
  // A separate attribute per switch, so two dimming switches on one site turn on and off independently.
  const DIM_CSS = (name) => `[data-exp-shift-dim-${name}="true"]{opacity:.45!important}[data-exp-shift-dim-${name}="true"]:is(:hover,:focus-within){opacity:1!important}`;
  const definitions = {
    manapool: {
      name: 'ManaPool', hosts: ['manapool.com'],
      options: [['dense-grid', 'Denser card grid'], ['hide-sold-out', 'Hide sold out'], ['compact-prices', 'Compact prices'], ['always-show-chips', 'Always show chips']],
      actions: [['collapse-all', 'Collapse all', () => setManaSections(true)], ['expand-all', 'Expand all', () => setManaSections(false)]],
      css: (s) => `${s['dense-grid'] ? 'ul.grid,.grid{gap:.5rem!important}article{margin:0!important}' : ''}${s['hide-sold-out'] ? '[data-exp-shift-sold="true"]{display:none!important}' : ''}${s['compact-prices'] ? '.text-green-700,.text-xl.font-bold{font-size:.95rem!important;line-height:1.2!important}' : ''}${s['always-show-chips'] ? '.rounded-b-lg.bg-gray-50,.inline-flex.items-center.border{opacity:1!important;visibility:visible!important}' : ''}[data-exp-shift-collapsed="true"]>:not(h2){display:none!important}
        /* ManaPool uses Tailwind utility colors rather than semantic alert class names. */
        [class*="bg-yellow-"],[class*="bg-amber-"]{background-color:color-mix(in srgb,#b88718 34%,var(--exp-shift-surface))!important;color:#fff3c4!important;border-color:#b88718!important}
        [class*="bg-yellow-"] :is(a,button),[class*="bg-amber-"] :is(a,button){color:inherit!important}
        [class*="bg-red-"],[class*="bg-rose-"]{background-color:color-mix(in srgb,#a8323a 32%,var(--exp-shift-surface))!important;color:#ffe1e4!important}
        [class*="bg-green-"],[class*="bg-emerald-"]{background-color:color-mix(in srgb,#218739 30%,var(--exp-shift-surface))!important;color:#dcffe4!important}
        [class*="bg-blue-"],[class*="bg-sky-"]{background-color:color-mix(in srgb,#2879a8 30%,var(--exp-shift-surface))!important;color:#e0f4ff!important}`,
      process: () => markSold('article,li.group,.group.bg-white', (card) => /sold\s*out|out\s*of\s*stock/i.test(card.textContent || '') || card.querySelector('[data-stock="0"],[class*="out-of-stock"]'))
    },
    scryfall: {
      name: 'Scryfall', hosts: ['scryfall.com'], options: [['dim-content-warnings', 'Dim content warnings']],
      css: (s) => s['dim-content-warnings'] ? '.card-content-warning{opacity:.4!important;filter:grayscale(.55)!important;max-height:3.5rem!important;overflow:hidden!important}.card-content-warning:hover,.card-content-warning:focus-within{opacity:1!important;filter:none!important;max-height:none!important}' : ''
    },
    steamgifts: {
      name: 'SteamGifts', hosts: ['steamgifts.com'], options: [['hide-entered', 'Hide entered'], ['hide-ended', 'Hide ended'], ['hide-unaffordable', 'Hide ones I can’t afford'], ['soft-hide-featured', 'Soft-hide featured / pinned'], ['high-contrast-enter', 'High-contrast Enter']],
      css: (s) => `${s['hide-entered'] ? '.giveaway__row-outer-wrap:has(.is-faded),.giveaway__row-outer-wrap:has(.esgst-faded),.giveaway-gridview .faded{display:none!important}' : ''}${s['hide-ended'] ? '[data-exp-shift-ended="true"]{display:none!important}' : ''}${s['hide-unaffordable'] ? '[data-exp-shift-costly="true"]{display:none!important}' : ''}${s['soft-hide-featured'] ? '.featured__container,.pinned-giveaways{opacity:.32!important;max-height:52px!important;overflow:hidden!important}.featured__container:hover,.featured__container:focus-within,.pinned-giveaways:hover,.pinned-giveaways:focus-within{opacity:1!important;max-height:none!important}' : ''}${s['high-contrast-enter'] ? '.sidebar__entry-insert,.form__submit-button{background:#125c14!important;color:#fff!important;border:2px solid #fff!important;font-weight:bold!important}' : ''}`,
      process: () => {
        // Points come from the header and change as giveaways are entered; without them nothing is marked.
        const pointsNode = document.querySelector('.nav__points');
        // SHIFT's page observer skips text-only changes, so the points number is watched directly.
        if (pointsNode && pointsWatch?.node !== pointsNode) { pointsWatch?.observer.disconnect(); pointsWatch = { node: pointsNode, observer: new MutationObserver(() => process()) }; pointsWatch.observer.observe(pointsNode, { characterData: true, childList: true, subtree: true }); }
        const points = /\d/.test(pointsNode?.textContent || '') ? Number(pointsNode.textContent.replace(/\D/g, '')) : Infinity;
        document.querySelectorAll('.giveaway__row-outer-wrap').forEach((row) => {
          row.dataset.expShiftEnded = String(Boolean(row.querySelector('.fa-times-circle') || [...row.querySelectorAll('[title]')].some((node) => /ended/i.test(node.title))));
          const cost = [...row.querySelectorAll('.giveaway__heading__thin')].map((node) => /^\((\d+)P\)$/.exec(node.textContent.trim())).find(Boolean);
          row.dataset.expShiftCostly = String(Boolean(cost && !row.querySelector('.is-faded,.esgst-faded') && Number(cost[1]) > points));
        });
      }
    },
    cardkingdom: {
      name: 'Card Kingdom', hosts: ['cardkingdom.com'], options: [['dense-results', 'Denser product results'], ['hide-sold-out', 'Hide fully sold out'], ['compact-condition-rows', 'Compact condition rows'], ['sticky-filters', 'Sticky search filters'], ['hide-promos', 'Hide promotions']],
      css: (s) => `${s['dense-results'] ? '.productItemWrapper{margin-bottom:.5rem!important}.productCardWrapper,.itemContentWrapper,.detailWrapper{padding:.45rem!important}' : ''}${s['hide-sold-out'] ? '[data-exp-shift-sold="true"]{display:none!important}' : ''}${s['compact-condition-rows'] ? '.addToCartByType,.oneRow,.twoRow{min-height:auto!important;margin:.15rem 0!important;padding:.2rem .35rem!important}' : ''}${s['sticky-filters'] ? '.sidesearch{position:sticky!important;top:8px!important;max-height:calc(100vh - 16px)!important;overflow:auto!important}' : ''}${s['hide-promos'] ? '.promo,.promo-banner,.mega-menu-promo,[class*="promoColumn"],[class*="marketing"]{display:none!important}' : ''}`,
      process: () => markSold('.productItemWrapper,.productCardWrapper', (card) => !card.querySelector('.addToCartButton:not(.disabled),button.addToCartButton:not([disabled])') && card.querySelector('.outOfStockNotice'))
    },
    tcgplayer: {
      name: 'TCGPlayer', hosts: ['tcgplayer.com'], options: [['dense-grid', 'Denser product grid'], ['hide-out-of-stock', 'Hide out of stock'], ['compact-listings', 'Compact listing rows'], ['hide-merchandising', 'Hide merchandising carousels'], ['hide-support-chat', 'Hide support chat']],
      css: (s) => `${s['dense-grid'] ? '.search-results,.product-grid{gap:.5rem!important}.product-card,.search-result{margin:.25rem!important}' : ''}${s['hide-out-of-stock'] ? '.out-of-stock,.mp-oos-badge,[data-exp-shift-sold="true"],.search-result:has(.out-of-stock){display:none!important}' : ''}${s['compact-listings'] ? '.listing-item{padding:.5rem .75rem!important;margin-bottom:.25rem!important}.search-toolbar,.horizontal-filters-bar{min-height:auto!important;padding:.5rem 1rem!important}' : ''}${s['hide-merchandising'] ? '.merchandising-filmstrip,.product-carousel{display:none!important}' : ''}${s['hide-support-chat'] ? 'iframe#forethought-chat,iframe[src*="forethought.ai"],iframe[id^="forethought-"]{display:none!important}' : ''}`,
      process: () => markSold('.search-result,.search-result__content,.product-card,.item-card,.list-view-product-card', (card) => card.querySelector('.out-of-stock,.mp-oos-badge') || /\bout\s*of\s*stock\b/i.test(card.textContent || ''))
    },
    // EDHREC and Archidekt hash their class names per build, so these match the stable part of each name.
    edhrec: {
      name: 'EDHREC', hosts: ['edhrec.com'], options: [['hide-ads', 'Hide ad slots'], ['hide-card-prices', 'Hide price strips under cards'], ['dense-card-grid', 'Denser card grid']],
      css: (s) => `${s['hide-ads'] ? '[class*="_adLeaderboard"],.adunitwrapper,.adhesion_wrapper,.adunit,[class*="_container"]:has(>[class*="_content"]>[class*="mvSidebar"]){display:none!important}' : ''}${s['hide-card-prices'] ? '[class*="_hasPrices"]>[class*="_prices"]{display:none!important}' : ''}${s['dense-card-grid'] ? '[class*="_grid"]:has(>[class*="_rec"]){gap:8px 6px!important}' : ''}`
    },
    archidekt: {
      name: 'Archidekt', hosts: ['archidekt.com'], options: [['hide-ads', 'Hide ad slots'], ['hide-card-prices', 'Hide price tags on cards'], ['dense-stacks', 'Tighter card stacks']],
      css: (s) => `${s['hide-ads'] ? '[class*="inlineInhouseAd_"],[class*="inhouseFixedAd_"],#fixed-ad,#stack-ramp{display:none!important}' : ''}${s['hide-card-prices'] ? '[class*="imageCard_extras"] [class*="prices_container"]{display:none!important}' : ''}${s['dense-stacks'] ? '[class*="stack_columns"]{gap:6px!important}[class*="stack_column_"]{gap:10px!important}' : ''}`
    },
    nexusmods: {
      name: 'Nexus Mods', hosts: ['nexusmods.com'], options: [['hide-ads', 'Hide ad slots'], ['compact-tiles', 'Compact mod tiles'], ['flag-stale', 'Mark mods not updated in 2+ years'], ['hide-premium-prompts', 'Hide Premium prompts']],
      // #adBanner is the 10px probe Nexus uses to detect ad blockers, so it is left alone.
      css: (s) => `${s['hide-ads'] ? '[data-testid^="ad-"],[id^="ad-vertical"],[id^="ad-horizontal"],[id^="ad-billboard"]{display:none!important}' : ''}${s['compact-tiles'] ? '.mods-grid{gap:8px!important}[data-e2eid="mod-tile"]{min-height:0!important}[data-e2eid="mod-tile-summary"]{display:none!important}' : ''}${s['flag-stale'] ? STALE_CSS : ''}${s['hide-premium-prompts'] ? '.nxm-button-premium,.user-profile-menu-premium-banner-wrapper,.rj-supporter-wrapper{display:none!important}' : ''}`,
      process: () => markStale('[data-e2eid="mod-tile"]', (tile) => Date.parse(tile.querySelector('[data-e2eid="mod-tile-updated"] time[datetime]')?.getAttribute('datetime') || '') < Date.now() - 2 * YEAR)
    },
    steamdb: {
      name: 'SteamDB', hosts: ['steamdb.info'], options: [['compact-rows', 'Compact sale rows'], ['dim-low-rated', 'Dim games rated under 70%'], ['dim-owned', 'Dim games you own']],
      css: (s) => `${s['compact-rows'] ? '.table-sales td{padding-top:1px!important;padding-bottom:1px!important}.table-sales .applogo img{height:26px!important;width:auto!important}' : ''}${s['dim-low-rated'] ? DIM_CSS('low-rated') : ''}${s['dim-owned'] ? DIM_CSS('owned') : ''}`,
      // The rating column is found by its heading, and its value read from data-sort; SteamDB marks owned rows itself.
      process: () => document.querySelectorAll('table.table-sales').forEach((table) => {
        const column = [...table.querySelectorAll('thead th')].findIndex((heading) => heading.textContent.trim() === 'Rating');
        table.querySelectorAll('tbody tr.app').forEach((row) => {
          const rating = Number.parseFloat(row.cells[column]?.dataset.sort);
          row.dataset.expShiftDimLowRated = String(column >= 0 && Number.isFinite(rating) && rating < 70);
          row.dataset.expShiftDimOwned = String(row.classList.contains('owned'));
        });
      })
    },
    backpacktf: {
      name: 'backpack.tf', hosts: ['backpack.tf'], options: [['one-line-messages', 'One-line trade messages'], ['dim-offline', 'Dim offline traders'], ['dim-stale', 'Dim listings not bumped in 7+ days']],
      css: (s) => `${s['one-line-messages'] ? '.listing .quote-box:not(:hover,:focus-within) p{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}' : ''}${s['dim-offline'] ? DIM_CSS('offline') : ''}${s['dim-stale'] ? DIM_CSS('stale-listing') : ''}`,
      process: () => document.querySelectorAll('li.listing').forEach((item) => {
        item.dataset.expShiftDimOffline = String(Boolean(item.querySelector('.user-handle .offline')));
        const bumped = Date.parse(item.querySelector('.data1 time[datetime],time[datetime]')?.getAttribute('datetime') || '');
        item.dataset.expShiftDimStaleListing = String(bumped < Date.now() - 7 * 86400000);
      })
    },
    thunderstore: {
      name: 'Thunderstore', hosts: ['thunderstore.io'], options: [['hide-ads', 'Hide ad slots'], ['compact-cards', 'Compact package cards'], ['flag-stale', 'Mark packages not updated in 1+ year']],
      css: (s) => `${s['hide-ads'] ? '.ad-container,.layout__ads{display:none!important}' : ''}${s['compact-cards'] ? '.package-search__grid{gap:8px!important}.card-package__description{display:none!important}' : ''}${s['flag-stale'] ? STALE_CSS : ''}`,
      // Cards only show relative dates ("last year", "3 years ago").
      process: () => markStale('.card-package', (card) => /^(last year|\d+ years? ago)$/i.test(card.querySelector('.card-package__updated')?.textContent.trim() || ''))
    },
    goodreads: {
      name: 'Goodreads', hosts: ['goodreads.com'], options: [['dense-book-lists', 'Denser book lists'], ['compact-reviews', 'Compact reviews'], ['hide-recommendations', 'Hide recommendations'], ['wide-reading', 'Wider reading column']],
      css: (s) => `${s['dense-book-lists'] ? '.elementList,.bookalike,.BookCard{padding:.45rem 0!important;margin:.2rem 0!important}.leftAlignedImage img,.bookCover{max-height:110px!important;width:auto!important}' : ''}${s['compact-reviews'] ? '.review,.ReviewCard{padding:.65rem!important;margin:.35rem 0!important}.reviewText,.ReviewText{line-height:1.42!important}' : ''}${s['hide-recommendations'] ? '[data-exp-shift-recommendation="true"]{display:none!important}' : ''}${s['wide-reading'] ? '.BookPage__mainContent,.mainContent,.gr-mainContent{max-width:980px!important;width:min(980px,100%)!important}' : ''}`,
      process: () => markRecommendations(/readers also enjoyed|recommend(?:ed|ations)|similar books|people also liked/i)
    },
    genius: {
      name: 'Genius', hosts: ['genius.com'], options: [['focus-lyrics', 'Focus lyrics'], ['compact-annotations', 'Compact annotations'], ['dim-media', 'Dim media embeds'], ['hide-recommendations', 'Hide recommendations'], ['hide-community', 'Hide Community section'], ['hide-latest', 'Hide Latest section'], ['hide-videos', 'Hide Videos section'], ['hide-charts', 'Hide Charts section'], ['hide-news', 'Hide News section']],
      css: (s) => `${s['focus-lyrics'] ? '[data-lyrics-container="true"],[class*="Lyrics__Container"]{max-width:760px!important;margin-left:auto!important;margin-right:auto!important;font-size:1.08rem!important;line-height:1.72!important}' : ''}${s['compact-annotations'] ? '[class*="Annotation"]{padding:.55rem!important;margin:.35rem 0!important;line-height:1.42!important}' : ''}${s['dim-media'] ? 'iframe,video,[class*="Media"]{opacity:.42!important;transition:opacity .15s ease}iframe:hover,iframe:focus,video:hover,video:focus,[class*="Media"]:hover,[class*="Media"]:focus-within{opacity:1!important}' : ''}${s['hide-recommendations'] ? '[data-exp-shift-recommendation="true"]{display:none!important}' : ''}${s['hide-community'] ? 'main #community{display:none!important}' : ''}${s['hide-latest'] ? 'main [data-exp-shift-home-section="latest"]{display:none!important}' : ''}${s['hide-videos'] ? 'main #videos{display:none!important}' : ''}${s['hide-charts'] ? 'main #top-songs{display:none!important}' : ''}${s['hide-news'] ? 'main #featured-stories{display:none!important}' : ''}`,
      process() { markRecommendations(/you might also like|recommended|more from|related songs/i); document.querySelectorAll('main h2').forEach((heading) => { if (heading.textContent.trim() === 'Latest') heading.closest('section')?.setAttribute('data-exp-shift-home-section', 'latest'); }); }
    }
  };
  const recovery=ExtraPotionsCore.createRecoveryGuard();
  let recoveryContext=location.href;
  const feature=()=>active?.[0]||'none';
  let active;
  let style;
  let status = { id: null, state: 'inactive', reason: 'Generic Mode' };
  function setManaSections(collapsed) { document.querySelectorAll('main section,.container section').forEach((section) => { if (section.querySelector(':scope > h2')) section.dataset.expShiftCollapsed = String(collapsed); }); }
  function markSold(selector, predicate) { document.querySelectorAll(selector).forEach((card) => card.dataset.expShiftSold = String(Boolean(predicate(card)))); }
  function markStale(selector, predicate) { document.querySelectorAll(selector).forEach((card) => card.dataset.expShiftStale = String(Boolean(predicate(card)))); }
  function markRecommendations(pattern) { document.querySelectorAll('h1,h2,h3,h4').forEach((heading) => { if (pattern.test(heading.textContent || '')) (heading.closest('section,.gr-box,[class*="Recommended"],[class*="Related"]') || heading.parentElement)?.setAttribute('data-exp-shift-recommendation', 'true'); }); }
  function select(hostname = location.hostname) { return Object.entries(definitions).find(([, item]) => item.hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))); }
  function settings() { return active ? EXP.Settings.snapshot().adapterSettings[active[0]] || {} : {}; }
  function apply() {
    if (!active) return;
    style?.remove(); style = null;
    const effective = EXP.Settings.effective();
    const cssText = (typeof ExtraPotionsCore !== 'undefined' && ExtraPotionsCore.suiteSitePaused?.()) || effective.safeMode || effective.excluded ? '' : active[1].css(settings());
    if (cssText) { style = EXP.Core.injectStyle(document, cssText, { expShiftAdapterStyle: '1' }); style.id = 'exp-shift-adapter-style'; }
  }
  function initialize() { if(location.href!==recoveryContext){recovery.clearContext(recoveryContext);recoveryContext=location.href;}active = select(); status = active ? { id: active[0], name: active[1].name, state: 'healthy', reason: 'Enhanced Mode available' } : { id: null, state: 'inactive', reason: 'Generic Mode' }; apply(); return status; }
  function process(force=false) {
    if(location.href!==recoveryContext){recovery.clearContext(recoveryContext);recoveryContext=location.href;}
    const effective=EXP.Settings.effective();
    if(ExtraPotionsCore.suiteSitePaused()||effective.safeMode||effective.excluded||!active||status.state==='failed')return false;
    if(!force&&recovery.snapshot(feature(),recoveryContext).suspended)return false;
    try {active[1].process?.();status={...status,state:'healthy',reason:'Enhanced Mode active'};recovery.succeeded(feature(),recoveryContext);return true;}
    catch(error){status={...status,state:'degraded',reason:error.code||'ADAPTER_PROCESSING'};if(force)throw error;recovery.failed(feature(),recoveryContext);EXP.Core.safeError(error,`adapter-${active[0]}`);return false;}
    finally {EXP.UI?.refreshHealth?.();}
  }
  function retry(){return recovery.retry(feature(),recoveryContext,()=>process(true));}
  function disable() { style?.remove(); style = null; document.querySelectorAll('[data-exp-shift-collapsed]').forEach((node) => node.removeAttribute('data-exp-shift-collapsed')); status = active ? { ...status, state: 'inactive', reason: 'Adapter suspended' } : status; }
  function health() { return { ...status,recovery:recovery.snapshot(feature(),recoveryContext), controls: active?.[1].options.map(([id]) => id) || [], actions: active?.[1].actions?.map(([id]) => id) || [] }; }
  function options() { return active?.[1].options || []; }
  function actions() { return active?.[1].actions || []; }
  function runAction(id) { if (typeof ExtraPotionsCore !== 'undefined' && ExtraPotionsCore.suiteSitePaused?.()) return false; const action = active?.[1].actions?.find(([candidate]) => candidate === id); if (!action) return false; action[2](); process(); return true; }
  function setOption(id, value) { if (!active || !active[1].options.some(([candidate]) => candidate === id)) return; const state = EXP.Settings.snapshot(); const adapterSettings = { ...state.adapterSettings, [active[0]]: { ...(state.adapterSettings[active[0]] || {}), [id]: Boolean(value) } }; EXP.Settings.update({ adapterSettings }, `adapter-${active[0]}-${id}`); apply(); process(); }
  return Object.freeze({ catalog: definitions, select, initialize, apply, process, disable, retry, health, options, actions, runAction, settings, setOption });
})();

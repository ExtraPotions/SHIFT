EXP.Adapters = (() => {
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
      name: 'SteamGifts', hosts: ['steamgifts.com'], options: [['hide-entered', 'Hide entered'], ['hide-ended', 'Hide ended'], ['soft-hide-featured', 'Soft-hide featured / pinned'], ['high-contrast-enter', 'High-contrast Enter']],
      css: (s) => `${s['hide-entered'] ? '.giveaway__row-outer-wrap:has(.is-faded),.giveaway__row-outer-wrap:has(.esgst-faded),.giveaway-gridview .faded{display:none!important}' : ''}${s['hide-ended'] ? '[data-exp-shift-ended="true"]{display:none!important}' : ''}${s['soft-hide-featured'] ? '.featured__container,.pinned-giveaways{opacity:.32!important;max-height:52px!important;overflow:hidden!important}.featured__container:hover,.featured__container:focus-within,.pinned-giveaways:hover,.pinned-giveaways:focus-within{opacity:1!important;max-height:none!important}' : ''}${s['high-contrast-enter'] ? '.sidebar__entry-insert,.form__submit-button{background:#125c14!important;color:#fff!important;border:2px solid #fff!important;font-weight:bold!important}' : ''}`,
      process: () => document.querySelectorAll('.giveaway__row-outer-wrap').forEach((row) => row.dataset.expShiftEnded = String(Boolean(row.querySelector('.fa-times-circle') || [...row.querySelectorAll('[title]')].some((node) => /ended/i.test(node.title)))))
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
  let active;
  let style;
  let status = { id: null, state: 'inactive', reason: 'Generic Mode' };
  function setManaSections(collapsed) { document.querySelectorAll('main section,.container section').forEach((section) => { if (section.querySelector(':scope > h2')) section.dataset.expShiftCollapsed = String(collapsed); }); }
  function markSold(selector, predicate) { document.querySelectorAll(selector).forEach((card) => card.dataset.expShiftSold = String(Boolean(predicate(card)))); }
  function markRecommendations(pattern) { document.querySelectorAll('h1,h2,h3,h4').forEach((heading) => { if (pattern.test(heading.textContent || '')) (heading.closest('section,.gr-box,[class*="Recommended"],[class*="Related"]') || heading.parentElement)?.setAttribute('data-exp-shift-recommendation', 'true'); }); }
  function select(hostname = location.hostname) { return Object.entries(definitions).find(([, item]) => item.hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))); }
  function settings() { return active ? EXP.Settings.snapshot().adapterSettings[active[0]] || {} : {}; }
  function apply() {
    if (!active) return;
    style?.remove(); style = null;
    const effective = EXP.Settings.effective();
    const cssText = effective.safeMode || effective.excluded ? '' : active[1].css(settings());
    if (cssText) { style = EXP.Core.injectStyle(document, cssText, { expShiftAdapterStyle: '1' }); style.id = 'exp-shift-adapter-style'; }
  }
  function initialize() { active = select(); status = active ? { id: active[0], name: active[1].name, state: 'healthy', reason: 'Enhanced Mode available' } : { id: null, state: 'inactive', reason: 'Generic Mode' }; apply(); return status; }
  function process() { if (!active || status.state === 'failed') return; try { active[1].process?.(); status = { ...status, state: 'healthy', reason: 'Enhanced Mode active' }; } catch (error) { status = { ...status, state: 'degraded', reason: error.code || 'ADAPTER_PROCESSING' }; EXP.Core.safeError(error, `adapter-${active[0]}`); } }
  function disable() { style?.remove(); style = null; document.querySelectorAll('[data-exp-shift-collapsed]').forEach((node) => node.removeAttribute('data-exp-shift-collapsed')); status = active ? { ...status, state: 'inactive', reason: 'Adapter suspended' } : status; }
  function health() { return { ...status, controls: active?.[1].options.map(([id]) => id) || [], actions: active?.[1].actions?.map(([id]) => id) || [] }; }
  function options() { return active?.[1].options || []; }
  function actions() { return active?.[1].actions || []; }
  function runAction(id) { const action = active?.[1].actions?.find(([candidate]) => candidate === id); if (!action) return false; action[2](); process(); return true; }
  function setOption(id, value) { if (!active || !active[1].options.some(([candidate]) => candidate === id)) return; const state = EXP.Settings.snapshot(); const adapterSettings = { ...state.adapterSettings, [active[0]]: { ...(state.adapterSettings[active[0]] || {}), [id]: Boolean(value) } }; EXP.Settings.update({ adapterSettings }, `adapter-${active[0]}-${id}`); apply(); process(); }
  return Object.freeze({ catalog: definitions, select, initialize, apply, process, disable, health, options, actions, runAction, settings, setOption });
})();

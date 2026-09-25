EXP.SiteFixes = (() => {
  const fixes = Object.freeze({
    amazon: {
      hosts: ['amazon.com'],
      // Small, declarative exceptions. Dynamic Engine remains primary.
      preserve: [
        '#imgTagWrapperId img','.a-dynamic-image','.s-image','img.a-lazy-loaded',
        '[class*="image"] img','video','canvas'
      ],
      surfaces: [
        '#nav-main','#navbar','#nav-belt','.nav-search','.nav-search-field',
        '.a-box','.a-cardui','.a-popover-inner','.a-modal-scroller',
        '.s-result-item','.s-card-container','.a-section.a-spacing-base',
        '.a-dropdown-container select','.a-button','.a-button-inner',
        'input:not([type="checkbox"]):not([type="radio"])','textarea'
      ],
      text: ['.a-color-base','.a-color-secondary','.a-size-base','.a-text-normal'],
      ignoreInline: ['[style*="background-image"]','.a-dynamic-image'],
    },
    steamgifts: {
      hosts: ['steamgifts.com'],
      // SteamGifts uses pale gradient heading/notice strips over an otherwise dark layout.
      // Keep those strips and their controls together instead of darkening only their text.
      css: `:is(.page__heading,.page__heading__breadcrumbs,.table__heading,.table__column__heading){background-color:var(--exp-shift-raised)!important;background-image:none!important;color:var(--exp-shift-text)!important}
        .notification{background-color:color-mix(in srgb,#b88718 30%,var(--exp-shift-surface))!important;background-image:none!important;color:#fff3c4!important;border-color:#b88718!important}
        :is(.page__heading,.page__heading__breadcrumbs,.notification,.table__heading,.table__column__heading) :is(a,span,small,button){color:var(--exp-shift-text)!important}
        .notification :is(a,span,small,button){color:#fff3c4!important}
        .table__row-outer-wrap :is(.table__column__heading,.table__column__secondary-link){color:var(--exp-shift-text)!important}
        :is(.giveaway__row-outer-wrap,.featured__container) :is(.giveaway__heading__thin,.giveaway__heading__name,.giveaway__column--contributor-level){color:var(--exp-shift-text)!important;text-shadow:none!important}
        :is(.giveaway__row-outer-wrap,.featured__container) .giveaway__column--contributor-level{background-image:none!important;background-color:var(--exp-shift-raised)!important;border-color:var(--exp-shift-muted)!important}`,
    }
  });
  function match(host=location.hostname){
    return Object.entries(fixes).find(([,f])=>f.hosts.some(h=>host===h||host.endsWith('.'+h)))||null;
  }
  function active(){const m=match();return m?{id:m[0],...m[1]}:null;}
  function css(){return active()?.css||'';}
  return Object.freeze({active,match,css});
})();

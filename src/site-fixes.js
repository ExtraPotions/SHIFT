EXP.SiteFixes = (() => {
  const fixes = Object.freeze({
    amazon: {
      hosts: ['amazon.com'],
      // Small, declarative exceptions. Dynamic Engine remains primary.
      preserve: [
        '#imgTagWrapperId img','.a-dynamic-image','.s-image','img.a-lazy-loaded',
        '[class*="image"] img','video','canvas'
      ],
      preserveSurfaces: [
        '#imgTagWrapperId','.s-product-image-container',
        '[class*="product-image" i]','[class*="image-container" i]',
        '.a-cardui :is(.a-section,.a-row):has(> img)',
        '.a-carousel-card :is(.a-section,.a-row):has(> img)'
      ],
      surfaces: [
        '#nav-main','#navbar','#nav-belt','#nav-subnav','.nav-search','.nav-search-field',
        '.nav-flyout','.nav-flyout-content','.a-box','.a-cardui','.a-popover-inner','.a-modal-scroller',
        '.s-result-item','.s-card-container','.s-widget-container','.a-section.a-spacing-base',
        '.a-alert-container','.a-alert-content','.a-tabs','.a-tab-heading',
        '.a-dropdown-container select','.a-dropdown-prompt','.a-menu-item','.a-button','.a-button-inner',
        '.a-input-text','.nav-input','input:not([type="checkbox"]):not([type="radio"])','textarea'
      ],
      text: [
        '.a-color-base','.a-color-secondary','.a-color-tertiary','.a-size-base','.a-text-normal',
        '.a-size-base-plus','.a-size-medium','.a-size-large',
        '.a-price','.a-price-whole','.a-price-fraction','.a-price-symbol',
        '.s-title-instructions-style','.a-link-normal:not(:has(img))'
      ],
      forceText: [
        '.a-cardui :is(.a-size-base,.a-size-base-plus,.a-size-medium,.a-size-large,.a-text-normal,.a-price,.a-price-whole,.a-price-fraction,.a-price-symbol)',
        '.s-card-container :is(.a-size-base,.a-size-base-plus,.a-size-medium,.a-size-large,.a-text-normal,.a-price,.a-price-whole,.a-price-fraction,.a-price-symbol)',
        '.s-widget-container :is(.a-size-base,.a-size-base-plus,.a-size-medium,.a-size-large,.a-text-normal,.a-price,.a-price-whole,.a-price-fraction,.a-price-symbol)',
        '.a-carousel-card :is(.a-size-base,.a-size-base-plus,.a-size-medium,.a-size-large,.a-text-normal,.a-price,.a-price-whole,.a-price-fraction,.a-price-symbol)',
        '.a-cardui a.a-link-normal:not(:has(img))',
        '.s-card-container a.a-link-normal:not(:has(img))',
        '.s-widget-container a.a-link-normal:not(:has(img))',
        '.a-carousel-card a.a-link-normal:not(:has(img))'
      ],
      ignoreInline: ['[style*="background-image"]','.a-dynamic-image'],
      css: `
        :is(#nav-main,#navbar,#nav-belt,#nav-subnav,.nav-flyout,.nav-flyout-content){
          background-color:var(--exp-shift-navigation)!important;color:var(--exp-shift-text)!important;
          border-color:color-mix(in srgb,var(--exp-shift-muted) 40%,transparent)!important
        }
        :is(.a-box,.a-cardui,.s-card-container,.s-widget-container,.a-popover-inner,.a-modal-scroller,.a-alert-container,.a-alert-content,.a-tabs,.a-menu-item){
          background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important;
          border-color:color-mix(in srgb,var(--exp-shift-muted) 38%,transparent)!important
        }
        :is(.nav-search-field,.a-input-text,.a-dropdown-container select,.a-dropdown-prompt,.nav-input,input:not([type="checkbox"]):not([type="radio"]),textarea){
          background-color:var(--exp-shift-input)!important;color:var(--exp-shift-text)!important;
          border-color:color-mix(in srgb,var(--exp-shift-accent) 65%,var(--exp-shift-muted))!important
        }
        :is(.a-button,.a-button-inner,#nav-search-submit-button){
          background-color:var(--exp-shift-interactive)!important;color:var(--exp-shift-text)!important;
          border-color:color-mix(in srgb,var(--exp-shift-muted) 45%,transparent)!important
        }
        :is(.a-color-base,.a-color-secondary,.a-color-tertiary,.a-size-base,.a-text-normal,.a-size-base-plus,.a-size-medium,.a-size-large,.a-price,.a-price-whole,.a-price-fraction,.a-price-symbol,.s-title-instructions-style){
          color:var(--exp-shift-text)!important
        }
        :is(.a-dynamic-image,.s-image,#imgTagWrapperId img,[class*="image"] img,[class*="asin-image" i]){
          filter:none!important;opacity:1!important;mix-blend-mode:normal!important
        }
        :is(#imgTagWrapperId,.s-product-image-container,[class*="product-image" i],[class*="image-container" i],[class*="asin-image-wrapper" i],[class*="asin-image-container" i]){
          opacity:1!important;filter:none!important;mix-blend-mode:normal!important
        }
        :is([class*="asin-metadata" i],[class*="asin-title" i],[class*="asin-price" i]){
          opacity:1!important;filter:none!important;mix-blend-mode:normal!important
        }
      `,
    },
    steamgifts: {
      hosts: ['steamgifts.com'],
      // SteamGifts uses pale gradient heading/notice strips over an otherwise dark layout.
      // Keep those strips and their controls together instead of darkening only their text.
      // ESGST owns the semantic colors of its category panels, highlighted levels and custom entry controls.
      preserve: [
        '.esgst-gc-panel','.esgst-gc','.esgst-glh-highlight','.esgst-elgb-button',
        '.giveaway__quick-entry-btn--insert[title^="ESGST "]',
        '[class*="esgst-"][style*="color" i]','[class*="esgst-"][style*="background" i]'
      ],
      css: `:is(.page__heading,.page__heading__breadcrumbs,.table__heading,.table__column__heading){background-color:var(--exp-shift-raised)!important;background-image:none!important;color:var(--exp-shift-text)!important}
        .notification{background-color:color-mix(in srgb,#b88718 30%,var(--exp-shift-surface))!important;background-image:none!important;color:#fff3c4!important;border-color:#b88718!important}
        :is(.page__heading,.page__heading__breadcrumbs,.notification,.table__heading,.table__column__heading) :is(a,span,small,button){color:var(--exp-shift-text)!important}
        .notification :is(a,span,small,button){color:#fff3c4!important}
        .table__row-outer-wrap :is(.table__column__heading,.table__column__secondary-link){color:var(--exp-shift-text)!important}
        :is(.giveaway__row-outer-wrap,.featured__container) :is(.giveaway__heading__thin,.giveaway__heading__name,.giveaway__column--contributor-level):not([data-exp-shift-preserve]){color:var(--exp-shift-text)!important;text-shadow:none!important}
        :is(.giveaway__row-outer-wrap,.featured__container) .giveaway__column--contributor-level:not([data-exp-shift-preserve]){background-image:none!important;background-color:var(--exp-shift-raised)!important;border-color:var(--exp-shift-muted)!important}`,
    }
  });
  function match(host=location.hostname){
    return Object.entries(fixes).find(([,f])=>f.hosts.some(h=>host===h||host.endsWith('.'+h)))||null;
  }
  function active(){const m=match();return m?{id:m[0],...m[1]}:null;}
  function css(){return active()?.css||'';}
  return Object.freeze({active,match,css});
})();

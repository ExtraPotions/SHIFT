EXP.Privacy = (() => {
  // Saved per hostname in siteOverrides, so "Reset this site" clears it with the rest of the site's settings.
  const KEY = 'privacyBlur';
  const MEDIA = ':is(img,video,iframe)';
  // Hovering the media reveals it, and so does hovering a container holding only that one (overlays often sit above
  // the image, but a hovered gallery must not reveal all of it), or keyboard focus on it or the link around it.
  // html:root outranks Reduce blur's filter:none on classified surfaces.
  const CSS = `html:root ${MEDIA}{filter:blur(18px)!important}
    html:root ${MEDIA}:is(:hover,:focus),html:root :hover>${MEDIA}:only-of-type,html:root :is(a,button):focus-visible ${MEDIA}{filter:none!important}`;
  let style = null;
  function enabled(hostname = location.hostname) { return EXP.Settings.snapshot().siteOverrides[hostname]?.[KEY] === true; }
  function apply() {
    const effective = EXP.Settings.effective();
    const on = enabled() && !effective.safeMode && !effective.excluded && !ExtraPotionsCore.suiteSitePaused?.();
    if (!on) { style?.remove(); style = null; return false; }
    if (!style?.isConnected) { style?.remove(); style = EXP.Core.injectStyle(document, CSS, { expShiftPrivacyStyle: '1' }); style.id = 'exp-shift-privacy-style'; }
    return true;
  }
  function set(value) {
    const state = EXP.Settings.snapshot();
    const site = { ...(state.siteOverrides[location.hostname] || {}) };
    if (value) site[KEY] = true; else delete site[KEY];
    const siteOverrides = { ...state.siteOverrides, [location.hostname]: site };
    if (!Object.keys(site).length) delete siteOverrides[location.hostname];
    EXP.Settings.update({ siteOverrides }, 'privacy-blur');
    apply();
  }
  function disable() { style?.remove(); style = null; }
  return Object.freeze({ enabled, apply, set, disable });
})();

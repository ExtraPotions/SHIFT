EXP.Preload = (() => {
  const STYLE_ID = 'exp-shift-preload';
  let style;

  function cachedSettings() {
    try {
      if (typeof GM_getValue === 'function') {
        const value = GM_getValue('exp:v3:shift:settings', null);
        if (value && typeof value === 'object') return value;
      }
    } catch {}
    try {
      const raw = localStorage.getItem('exp:v3:shift:settings');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function excluded(hostname, list) {
    return Array.isArray(list) && list.some((item) => {
      const needle = String(item || '').trim().toLowerCase();
      const host = String(hostname || '').trim().toLowerCase();
      return needle && (host === needle || host.endsWith('.' + needle));
    });
  }

  function effectiveAppearance(saved) {
    if (!saved || saved.safeMode || excluded(location.hostname, saved.exclusions)) return null;
    const site = saved.siteOverrides?.[location.hostname] || {};
    const profileId = site.profileId || saved.currentProfile;
    const profile = saved.profiles?.find?.((item) => item.id === profileId);
    const appearance = profileId && profileId !== 'original' ? profile?.appearance || {} : {};
    return { ...saved, ...appearance, ...site };
  }

  function start() {
    try {
      const html = document.documentElement;
      if (html && !html.dataset.expShiftNativeBaseline) {
        const root = getComputedStyle(html);
        const body = document.body ? getComputedStyle(document.body) : null;
        const meta = [...document.querySelectorAll('meta[name="color-scheme"]')].map((node) => node.content || '').join(' ');
        html.dataset.expShiftNativeBaseline = JSON.stringify({
          meta,
          rootScheme: root.colorScheme || '',
          bodyScheme: body?.colorScheme || '',
          rootBg: root.backgroundColor || '',
          bodyBg: body?.backgroundColor || '',
        });
      }
    } catch {}
    const state = effectiveAppearance(cachedSettings());
    if (!state || !state.theme || state.theme === 'original') return false;
    const theme = EXP.Themes.resolve(state.theme, state.accent, state);
    if (!theme || theme.original || !theme.page || !theme.text) return false;
    const css = `html{background:${theme.page}!important;background-color:${theme.page}!important;color:${theme.text}!important;color-scheme:dark!important}body{background-color:${theme.page}!important;color:${theme.text}!important}`;
    try {
      style = document.createElement('style');
      style.id = STYLE_ID;
      style.dataset.expOwned = '1';
      style.dataset.expShiftPreload = '1';
      style.textContent = css;
      (document.head || document.documentElement).append(style);
      document.documentElement?.setAttribute('data-exp-shift-preloading', state.theme);
      return true;
    } catch { return false; }
  }

  function finish() {
    try { style?.remove(); } catch {}
    style = null;
    document.documentElement?.removeAttribute('data-exp-shift-preloading');
  }

  return Object.freeze({ start, finish });
})();

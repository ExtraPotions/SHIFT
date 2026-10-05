EXP.Settings = (() => {
  // Persisted settings are JSON data. Copy in this realm: native structuredClone may
  // return page-realm Xray wrappers in Firefox userscript sandboxes.
  const clone = (value) => ExtraPotionsCore.cloneSettings(value);
  const PREFIX = 'exp:v3:shift';
  const SCHEMA = 1;
  const memory = new Map();
  const defaults = Object.freeze({
    schema: SCHEMA,
    theme: 'original',
    accent: 'site-default',
    themeStrength: 'normal',
    surfaceLevel: 'conservative',
    preserveArt: true,
    repairSurfaces: true,
    linkVisibility: 'enhanced',
    textContrast: 'normal',
    mutedRecovery: true,
    formReadability: true,
    focusVisibility: 'enhanced',
    reduceMotion: 'system',
    reduceShadows: false,
    reduceTransparency: false,
    simplifyGradients: false,
    reduceBlur: false,
    safeMode: false,
    shortcut: '',
    launcherPosition: 'automatic-end-bottom',
    menuAutoClose: true,
    menuNotifications: true,
    updateNotifications: false,
    profiles: [{ id: 'original', name: 'Original', appearance: { theme: 'original', accent: 'site-default' }, builtIn: true }],
    customThemes: [],
    customAccents: [],
    currentProfile: 'original',
    adapterSettings: {},
    siteOverrides: {},
    exclusions: []
  });
  let state;
  const listeners = new Set();
  const key = (name) => `${PREFIX}:${name}`;
  function rawRead(name) {
    const storageKey = key(name);
    try {
      if (typeof GM_getValue === 'function') {
        const value = GM_getValue(storageKey, undefined);
        if (value !== undefined) return value;
      }
    } catch {}
    try {
      const value = localStorage.getItem(storageKey);
      if (value !== null) {
        const parsed = JSON.parse(value);
        memory.set(storageKey, parsed);
        try { if (typeof GM_setValue === 'function') GM_setValue(storageKey, parsed); } catch {}
        return parsed;
      }
    } catch {}
    return memory.get(storageKey);
  }
  function rawWrite(name, value) {
    const storageKey = key(name);
    memory.set(storageKey, value);
    try { if (typeof GM_setValue === 'function') GM_setValue(storageKey, value); } catch {}
    try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch {}
  }
  const validTheme = (value) => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);
  function validate(candidate) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw Object.assign(new Error('Settings must be an object'), { code: 'SETTINGS_TYPE' });
    const result = clone(defaults);
    const normalizedTheme = candidate.theme === undefined ? defaults.theme : EXP.Themes?.normalizeTheme(candidate.theme) || candidate.theme;
    const enums = {
      theme: Object.keys(EXP.Themes?.catalog || { original: {} }), accent: ['site-default'],
      themeStrength: ['soft', 'normal', 'strong'],
      surfaceLevel: ['off', 'conservative', 'balanced', 'aggressive'], linkVisibility: ['site', 'enhanced', 'high'], textContrast: ['normal', 'enhanced'],
      focusVisibility: ['site', 'enhanced', 'high'], reduceMotion: ['off', 'system', 'on'], launcherPosition: ['automatic-end-bottom', 'end-top', 'end-bottom', 'start-top', 'start-bottom']
    };
    for (const [name, allowed] of Object.entries(enums)) {
	  const value = name === 'theme' ? normalizedTheme : candidate[name];
	  if (value !== undefined && allowed.includes(value)) result[name] = value;
	}
    for (const name of ['preserveArt', 'repairSurfaces', 'mutedRecovery', 'formReadability', 'reduceShadows', 'reduceTransparency', 'simplifyGradients', 'reduceBlur', 'safeMode', 'updateNotifications', 'menuAutoClose', 'menuNotifications']) if (typeof candidate[name] === 'boolean') result[name] = candidate[name];
    if (typeof candidate.shortcut === 'string' && candidate.shortcut.length <= 40) result.shortcut = candidate.shortcut;
    if (Array.isArray(candidate.exclusions)) result.exclusions = [...new Set(candidate.exclusions.filter((item) => typeof item === 'string' && item.length <= 253))].slice(0, 500);
    if (candidate.siteOverrides && typeof candidate.siteOverrides === 'object' && !Array.isArray(candidate.siteOverrides)) {
      result.siteOverrides = clone(candidate.siteOverrides);
      for(const site of Object.values(result.siteOverrides)){if(!site||typeof site!=='object')continue;if(site.preservedSelectors)site.preservedSelectors=Array.isArray(site.preservedSelectors)?[...new Set(site.preservedSelectors.filter(value=>typeof value==='string'&&value.length<=500))].slice(0,100):[];}
    }
    if (candidate.adapterSettings && typeof candidate.adapterSettings === 'object' && !Array.isArray(candidate.adapterSettings)) {
      for (const [adapterId, values] of Object.entries(candidate.adapterSettings)) {
        if (!/^[a-z][a-z0-9-]+$/.test(adapterId) || !values || typeof values !== 'object' || Array.isArray(values)) continue;
        result.adapterSettings[adapterId] = Object.fromEntries(Object.entries(values).filter(([, value]) => typeof value === 'boolean'));
      }
    }
    if (Array.isArray(candidate.profiles)) {
      const profiles = candidate.profiles.filter((profile) => profile && validTheme(profile.id) && typeof profile.name === 'string' && profile.name.trim() && profile.name.length <= 80 && profile.appearance && validTheme(profile.appearance.theme)).slice(0, 100);
      if (profiles.some((profile) => profile.id === 'original')) result.profiles = clone(profiles);
    }
    if (Array.isArray(candidate.customThemes)) result.customThemes = candidate.customThemes.filter((item) => item && validTheme(item.id) && typeof item.name === 'string' && item.name.trim() && item.name.length <= 80 && ['page', 'surface', 'raised', 'overlay', 'navigation', 'input', 'interactive', 'text', 'muted'].every((key) => EXP.Themes?.hex(item[key]))).slice(0, 50).map((item) => clone(item));
    if (Array.isArray(candidate.customAccents)) result.customAccents = candidate.customAccents.filter((item) => item && validTheme(item.id) && typeof item.name === 'string' && item.name.trim() && item.name.length <= 80 && EXP.Themes?.hex(item.color)).slice(0, 50).map((item) => clone(item));
    if (typeof candidate.currentProfile === 'string' && result.profiles.some((profile) => profile.id === candidate.currentProfile)) result.currentProfile = candidate.currentProfile;
    // Migrate every appearance scope; retained custom colors stay exportable.
    for (const appearance of [...result.profiles.map(profile => profile.appearance), ...Object.values(result.siteOverrides)]) {
      if (!appearance || typeof appearance !== 'object') continue;
      if (typeof appearance.theme === 'string' && EXP.Themes) appearance.theme = EXP.Themes.normalizeTheme(appearance.theme);
      if (appearance.accent !== undefined) appearance.accent = 'site-default';
    }
    return result;
  }
  function load() {
    const stored = rawRead('settings');
    state = validate(stored || defaults);
    rawWrite('settings', state);
    return snapshot();
  }
  function snapshot() { return clone(state || defaults); }
  function replace(next, reason = 'replace') { const valid = validate(next);  rawWrite('settings', valid); state = valid; for (const listener of listeners) listener(snapshot(), reason); return snapshot(); }
  function update(patch, reason = 'update') { return replace({ ...snapshot(), ...patch }, reason); }
  function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
  function hostExcluded(hostname, exclusions = []) {
    return exclusions.some((host) => {
      const needle = String(host || '').trim().toLowerCase();
      if (!needle) return false;
      const haystack = String(hostname || '').trim().toLowerCase();
      return haystack === needle || haystack.endsWith(`.${needle}`);
    });
  }
  function explain(hostname = location.hostname) {
    const current = snapshot();
    const site = current.siteOverrides[hostname] || {};
    const profile = current.profiles.find((item) => item.id === (site.profileId || current.currentProfile)) || current.profiles[0];
    const profileAppearance = site.profileId || current.currentProfile !== 'original' ? profile.appearance : {};
    const settings = { ...current, ...profileAppearance, ...site, excluded: hostExcluded(hostname, current.exclusions) };
    const sources = Object.fromEntries(Object.keys(defaults).map((key) => [key,
      Object.hasOwn(site, key) ? { kind: 'site', label: `Site override (${hostname})` }
      : Object.hasOwn(profileAppearance, key) ? { kind: 'profile', label: `Profile: ${profile.name}` }
      : { kind: 'global', label: 'Global settings' }]));
    return { settings, sources, profile: profile.name, hostname };
  }
  function effective(hostname = location.hostname) { return explain(hostname).settings; }
  function exportData() { return { product: 'shift', generation: 3, schema: SCHEMA, settings: snapshot() }; }
  function importData(payload) {
    if (!payload || payload.product !== 'shift' || payload.generation !== 3 || payload.schema !== SCHEMA) throw Object.assign(new Error('This is not a supported SHIFT export'), { code: 'IMPORT_SCHEMA' });
    return replace(payload.settings, 'import');
  }
  return Object.freeze({clone, PREFIX, SCHEMA, defaults, load, snapshot, update, replace, subscribe, effective, explain, exportData, importData });
})();

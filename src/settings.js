EXP.Settings = (() => {
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
    menuWidth: 'compact',
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
    try { if (typeof GM_getValue === 'function') return GM_getValue(key(name), undefined); } catch {}
    try { const value = localStorage.getItem(key(name)); return value === null ? undefined : JSON.parse(value); } catch { return memory.get(key(name)); }
  }
  function rawWrite(name, value) {
    memory.set(key(name), value);
    try { if (typeof GM_setValue === 'function') { GM_setValue(key(name), value); return; } } catch {}
    try { localStorage.setItem(key(name), JSON.stringify(value)); } catch {}
  }
  const validTheme = (value) => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);
  function validate(candidate) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw Object.assign(new Error('Settings must be an object'), { code: 'SETTINGS_TYPE' });
    const result = structuredClone(defaults);
	const themeAliases = { warm: 'ember', discord: 'glacier', pine: 'verdant', obsidian: 'obsidian' };
	const normalizedTheme = themeAliases[candidate.theme] || candidate.theme;
    const enums = {
      theme: EXP.Themes ? [...Object.keys(EXP.Themes.catalog), ...(candidate.customThemes || []).map((item) => item?.id).filter(Boolean)] : ['original'], accent: [...Object.keys(EXP.Themes?.accents || { 'site-default': null }), ...(candidate.customAccents || []).map((item) => item?.id).filter(Boolean)],
      themeStrength: ['soft', 'normal', 'strong'],
      surfaceLevel: ['off', 'conservative', 'balanced', 'aggressive'], linkVisibility: ['site', 'enhanced', 'high'], textContrast: ['normal', 'enhanced'],
      focusVisibility: ['site', 'enhanced', 'high'], reduceMotion: ['off', 'system', 'on'], launcherPosition: ['automatic-end-bottom', 'end-top', 'end-bottom', 'start-top', 'start-bottom'], menuWidth: ['full', 'compact', 'narrow']
    };
    for (const [name, allowed] of Object.entries(enums)) {
	  const value = name === 'theme' ? normalizedTheme : candidate[name];
	  if (value !== undefined && allowed.includes(value)) result[name] = value;
	}
    for (const name of ['preserveArt', 'repairSurfaces', 'mutedRecovery', 'formReadability', 'reduceShadows', 'reduceTransparency', 'simplifyGradients', 'reduceBlur', 'safeMode', 'updateNotifications', 'menuAutoClose', 'menuNotifications']) if (typeof candidate[name] === 'boolean') result[name] = candidate[name];
    if (typeof candidate.shortcut === 'string' && candidate.shortcut.length <= 40) result.shortcut = candidate.shortcut;
    if (Array.isArray(candidate.exclusions)) result.exclusions = [...new Set(candidate.exclusions.filter((item) => typeof item === 'string' && item.length <= 253))].slice(0, 500);
    if (candidate.siteOverrides && typeof candidate.siteOverrides === 'object' && !Array.isArray(candidate.siteOverrides)) result.siteOverrides = structuredClone(candidate.siteOverrides);
    if (candidate.adapterSettings && typeof candidate.adapterSettings === 'object' && !Array.isArray(candidate.adapterSettings)) {
      for (const [adapterId, values] of Object.entries(candidate.adapterSettings)) {
        if (!/^[a-z][a-z0-9-]+$/.test(adapterId) || !values || typeof values !== 'object' || Array.isArray(values)) continue;
        result.adapterSettings[adapterId] = Object.fromEntries(Object.entries(values).filter(([, value]) => typeof value === 'boolean'));
      }
    }
    if (Array.isArray(candidate.profiles)) {
      const profiles = candidate.profiles.filter((profile) => profile && validTheme(profile.id) && typeof profile.name === 'string' && profile.name.trim() && profile.name.length <= 80 && profile.appearance && validTheme(profile.appearance.theme)).slice(0, 100);
      if (profiles.some((profile) => profile.id === 'original')) result.profiles = structuredClone(profiles);
    }
    if (Array.isArray(candidate.customThemes)) result.customThemes = candidate.customThemes.filter((item) => item && validTheme(item.id) && typeof item.name === 'string' && item.name.trim() && item.name.length <= 80 && ['page', 'surface', 'raised', 'overlay', 'navigation', 'input', 'interactive', 'text', 'muted'].every((key) => EXP.Themes?.hex(item[key]))).slice(0, 50).map((item) => structuredClone(item));
    if (Array.isArray(candidate.customAccents)) result.customAccents = candidate.customAccents.filter((item) => item && validTheme(item.id) && typeof item.name === 'string' && item.name.trim() && item.name.length <= 80 && EXP.Themes?.hex(item.color)).slice(0, 50).map((item) => structuredClone(item));
    if (typeof candidate.currentProfile === 'string' && result.profiles.some((profile) => profile.id === candidate.currentProfile)) result.currentProfile = candidate.currentProfile;
    return result;
  }
  function load() { state = validate(rawRead('settings') || defaults); return snapshot(); }
  function snapshot() { return structuredClone(state || defaults); }
  function replace(next, reason = 'replace') { const valid = validate(next); rawWrite('settings', valid); state = valid; for (const listener of listeners) listener(snapshot(), reason); return snapshot(); }
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
  function effective(hostname = location.hostname) {
    const current = snapshot();
    const site = current.siteOverrides[hostname] || {};
    const profile = current.profiles.find((item) => item.id === (site.profileId || current.currentProfile)) || current.profiles[0];
    const profileAppearance = site.profileId || current.currentProfile !== 'original' ? profile.appearance : {};
    return { ...current, ...profileAppearance, ...site, excluded: hostExcluded(hostname, current.exclusions) };
  }
  function exportData() { return { product: 'shift', generation: 3, schema: SCHEMA, settings: snapshot() }; }
  function importData(payload) {
    if (!payload || payload.product !== 'shift' || payload.generation !== 3 || payload.schema !== SCHEMA) throw Object.assign(new Error('This is not a supported SHIFT V3 export'), { code: 'IMPORT_SCHEMA' });
    return replace(payload.settings, 'import');
  }
  return Object.freeze({ PREFIX, SCHEMA, defaults, load, snapshot, update, replace, subscribe, effective, exportData, importData });
})();

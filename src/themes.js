EXP.Themes = (() => {
  const catalog = Object.freeze({
    original: { name: 'Original', original: true },
    system: { name: 'System', system: true },
    ember: { name: 'Ember', page: '#120807', surface: '#24100c', raised: '#351914', overlay: '#47231c', text: '#f1ddd2', muted: '#b99787', highlight: '#e16a3b' },
    midnight: { name: 'Midnight', page: '#050a12', surface: '#0c1726', raised: '#142238', overlay: '#1d2e49', text: '#d4deeb', muted: '#91a2b7', highlight: '#477abd' },
    glacier: { name: 'Glacier', page: '#061216', surface: '#0d252a', raised: '#17363d', overlay: '#214952', text: '#d8ebee', muted: '#8fa9ae', highlight: '#67b7c1' },
    obsidian: { name: 'High contrast', page: '#000000', surface: '#0a0a0a', raised: '#171717', overlay: '#242424', text: '#ffffff', muted: '#e0e0e0', highlight: '#ffd400' },
    verdant: { name: 'Verdant', page: '#06110d', surface: '#0d2218', raised: '#173326', overlay: '#214735', text: '#d7e9df', muted: '#93aa9e', highlight: '#49a879' },
    pride: {
      name: 'Pride',
      page: '#100a12',
      pageFill: 'linear-gradient(180deg,#2a1930 0%,#100a12 42%)',
      pageEdge: 'linear-gradient(90deg,#c84e66 0%,#d07840 16.6%,#be9f37 33.3%,#3b8a5f 50%,#3d79a6 66.6%,#7455a4 100%)',
      surface: '#1d1222', raised: '#2a1930', overlay: '#39213f', navigation: '#18101c', input: '#25162b', interactive: '#312039',
      text: '#f0ddea', muted: '#b89db4', highlight: '#dd6793'
    },
    crimson: { name: 'Crimson', page: '#0c0508', surface: '#1d090f', raised: '#2d1019', overlay: '#401725', text: '#e5d2d7', muted: '#ae8b94', highlight: '#b63243' },
    shift: {
      name: 'SHIFT gem',
      page: '#041313',
      pageFill: 'linear-gradient(180deg,#0d3032 0%,#041313 40%)',
      pageEdge: 'linear-gradient(90deg,#1e938f,#3f6fa8 55%,#c34766)',
      surface: '#082427', raised: '#10363a', overlay: '#17494f', navigation: '#071c1e', input: '#0d2d31', interactive: '#143d42',
      text: '#d7eeec', muted: '#8aacaa', highlight: '#2eaaa5'
    }
  });
  const accents = Object.freeze({
    'site-default': null, teal: '#2f7f86', coral: '#c9512c', sky: '#477abd', mint: '#49a879', amber: '#b68a32', violet: '#7555a6', silver: '#bfbfbf', pride: '#dd6793', 'ember-default': '#e16a3b', 'midnight-default': '#477abd', 'glacier-default': '#67b7c1', 'contrast-default': '#ffd400', 'verdant-default': '#49a879', 'pride-default': '#dd6793', 'crimson-default': '#b63243', 'shift-default': '#2eaaa5'
  });
  const aliases = Object.freeze({ warm: 'ember', discord: 'glacier', pine: 'verdant' });
  const hex = (value) => /^#[0-9a-f]{6}$/i.test(value || '');
  function themeOptions(state) { return [...Object.entries(catalog).map(([id, item]) => [id, item.name]), ...(state?.customThemes || []).map((item) => [item.id, item.name])]; }
  function accentOptions(state) { return [...Object.entries(accents).map(([id]) => [id, id === 'site-default' ? 'Site default' : id[0].toUpperCase() + id.slice(1)]), ...(state?.customAccents || []).map((item) => [item.id, item.name])]; }
  function resolve(themeId, accentId, state = {}) {
    themeId = aliases[themeId] || themeId;
    let theme = catalog[themeId] || state.customThemes?.find((item) => item.id === themeId) || catalog.original;
    if (theme.system) theme = matchMedia('(prefers-color-scheme: dark)').matches ? catalog.glacier : catalog.original;
    const accent = accents[accentId] || state.customAccents?.find((item) => item.id === accentId)?.color || (theme.original ? '#287a74' : theme.highlight || '#2eaaa5');
    return { ...theme, id: themeId, accent, highlight: theme.highlight || accent, navigation: theme.navigation || theme.surface, input: theme.input || theme.raised, interactive: theme.interactive || theme.raised };
  }
  return Object.freeze({ catalog, accents, hex, resolve, themeOptions, accentOptions });
})();

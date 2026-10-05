EXP.Themes = (() => {
  const catalog = Object.freeze({
    original: { name: 'Original site', original: true },
    system: { name: 'Follow system', system: true },
    midnight: { name: 'Midnight', page: '#050a12', surface: '#0c1726', raised: '#142238', overlay: '#1d2e49', text: '#d4deeb', muted: '#b5c3d6', highlight: '#91baff' },
    amethyst: { name: 'Amethyst', page: '#100b18', surface: '#1c1329', raised: '#2a1d3d', overlay: '#38274c', text: '#f1eafa', muted: '#c4b4d7', highlight: '#c3a0ff' },
    crimson: { name: 'Crimson', page: '#0c0508', surface: '#1d090f', raised: '#2d1019', overlay: '#401725', text: '#f2e2e7', muted: '#c4aeb6', highlight: '#f18c9c' },
    verdant: { name: 'Verdant', page: '#06110d', surface: '#0d2218', raised: '#173326', overlay: '#214735', text: '#d7e9df', muted: '#b0c6bb', highlight: '#79cf9b' },
    pride: { name: 'Pride', page: '#100a12', pageEdge: 'linear-gradient(90deg,#c84e66 0%,#d07840 16.6%,#be9f37 33.3%,#3b8a5f 50%,#3d79a6 66.6%,#7455a4 100%)', surface: '#1d1222', raised: '#2a1930', overlay: '#39213f', text: '#f0ddea', muted: '#cab5c6', highlight: '#ef9ccc' },
    obsidian: { name: 'High contrast', page: '#000000', surface: '#0a0a0a', raised: '#171717', overlay: '#242424', text: '#ffffff', muted: '#e0e0e0', highlight: '#ffd400' }
  });
  const accents = Object.freeze({ 'site-default': null });
  const aliases = Object.freeze({ warm: 'crimson', ember: 'crimson', discord: 'amethyst', glacier: 'amethyst', shift: 'amethyst', pine: 'verdant', contrast: 'obsidian' });
  const hex = value => /^#[0-9a-f]{6}$/i.test(value || '');
  function normalizeTheme(id) { return Object.hasOwn(aliases, id) ? aliases[id] : Object.hasOwn(catalog, id) ? id : 'midnight'; }
  function themeOptions() { return Object.entries(catalog).map(([id, item]) => [id, item.name]); }
  function accentOptions() { return [['site-default', 'Theme accent']]; }
  function resolve(themeId) {
    themeId = normalizeTheme(themeId);
    let theme = catalog[themeId];
    if (theme.system) theme = matchMedia('(prefers-color-scheme: dark)').matches ? catalog.midnight : catalog.original;
    const accent = theme.highlight || '#287a74';
    return { ...theme, id: themeId, accent, highlight: accent, navigation: theme.navigation || theme.surface, input: theme.input || theme.raised, interactive: theme.interactive || theme.raised };
  }
  return Object.freeze({ catalog, accents, aliases, normalizeTheme, hex, resolve, themeOptions, accentOptions });
})();

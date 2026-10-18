EXP.Themes = (() => {
  const navigationThemes=Object.freeze([
    {id:'default',name:'Default',light:'#F1F0F6',dark:'#232128',accent:'#b8a4ff',ink:'#55419b'},
    {id:'indigo',name:'Indigo',light:'#F4F0FF',dark:'#25202F',accent:'#b8a4ff',ink:'#55419b'},
    {id:'blue',name:'Blue',light:'#E9F3FC',dark:'#1B202F',accent:'#8dbdff',ink:'#245ca0'},
    {id:'green',name:'Green',light:'#ECF4EE',dark:'#1C2527',accent:'#8bd3a2',ink:'#28653d'},
    {id:'red',name:'Red',light:'#FCF1EF',dark:'#2C1D1F',accent:'#ffb1a5',ink:'#9b342a'},
    {id:'gray',name:'Gray',light:'#ECECEF',dark:'#232227',accent:'#c5c3cf',ink:'#55535f'}
  ].map(Object.freeze));
  const catalog = Object.freeze({
    ...Object.fromEntries(navigationThemes.map(theme=>[theme.id,{name:theme.name,navigationTheme:true}])),
    original: { name: 'Original site', original: true }
  });
  const accents = Object.freeze({ 'site-default': null });
  const hex = value => /^#[0-9a-f]{6}$/i.test(value || '');
  function normalizeTheme(id) { return Object.hasOwn(catalog, id) ? id : 'default'; }
  function themeOptions() { return navigationThemes.map(({id,name}) => [id,name]); }
  function accentOptions() { return [['site-default', 'Theme accent']]; }
  function resolve(themeId, _accent, state={}) {
    themeId = normalizeTheme(themeId);
    let theme = catalog[themeId];
    if(theme.navigationTheme){
      const navigation=navigationThemes.find(item=>item.id===themeId);
      const mode=state.colorMode||'dark',dark=mode==='dark'||(mode==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
      const palette=dark?{page:'#18171d',surface:'#242329',raised:'#302e38',overlay:'#3d3947',text:'#efedf5',muted:'#bcb8c8',highlight:navigation.accent}:{page:'#ffffff',surface:'#f6f5f8',raised:'#eeebf2',overlay:'#e4e0ec',text:'#242129',muted:'#5f596a',highlight:navigation.ink};
      return {...palette,id:themeId,name:navigation.name,colorScheme:dark?'dark':'light',navigation:dark?navigation.dark:navigation.light,input:palette.surface,interactive:palette.raised,accent:palette.highlight};
    }
    const accent = theme.highlight || '#287a74';
    return { ...theme, id: themeId, accent, highlight: accent, navigation: theme.navigation || theme.surface, input: theme.input || theme.raised, interactive: theme.interactive || theme.raised };
  }
  return Object.freeze({ catalog, navigationThemes, accents, normalizeTheme, hex, resolve, themeOptions, accentOptions });
})();

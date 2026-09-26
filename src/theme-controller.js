EXP.Engine = (() => {
  const STYLE_ID = 'exp-shift-page-style';
  const HOST_ATTR = 'data-exp-shift';
  const SHELL_SELECTOR = '#root,#app,#__next,#__nuxt,#__layout,#app-root,#react-root,#vue-app,#application,#main,#main-content,[data-reactroot],ytd-app,shreddit-app';
  const CHROME_SELECTOR = [
    '.card','.panel','.modal','.modal-content','.modal-dialog','.modal-body','.dropdown-menu',
    '.navbar','.nav-bar','.sidebar','.drawer','.toolbar','.menubar','.list-group','.list-group-item',
    '.bg-white','.bg-light','.bg-body','.bg-body-tertiary','.bg-body-secondary',
    '.MuiPaper-root','.MuiAppBar-root','.MuiDrawer-paper','.MuiDialog-paper','.MuiToolbar-root',
    '.ant-layout','.ant-layout-header','.ant-layout-sider','.ant-card','.ant-modal-content','.ant-drawer-content'
  ].join(',');
  const NAV_SELECTOR = '.navbar,.nav-bar,.sidebar,.drawer,.toolbar,.menubar,.MuiAppBar-root,.MuiDrawer-paper,.MuiToolbar-root,.ant-layout-header,.ant-layout-sider,.ant-drawer-content';
  const CONTENT_SELECTOR = '.width,.script-list';
  const EXCLUDE = ':not(:where(img,picture,video,canvas,svg,[role="img"],[data-exp-owned="1"],[data-exp-shift-preserve],[hidden],[aria-hidden="true"]))';

  let style = null;
  let guard = null;
  let active = false;
  let originalHeld = false;
  let settings = null;
  let lastCss = '';
  let parseContext;
  let nativeBaseline = null;
  let writing = false;
  const hostPaint = new WeakMap();
  const metrics = { mode:'Original', reattaches:0, nativeDark:false, nativeDarkReason:null, nativeDarkEvidence:null, applies:0 };

  function parseColor(value) {
    const raw=String(value||'').trim();
    if(!raw||raw==='transparent'||raw==='none')return null;
    try{
      if(parseContext===undefined){const canvas=document.createElement('canvas');parseContext=canvas.getContext('2d',{willReadFrequently:true})||null;}
      if(parseContext){parseContext.fillStyle='#000';parseContext.fillStyle=raw;const normalized=String(parseContext.fillStyle);const match=normalized.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);if(match)return{r:+match[1],g:+match[2],b:+match[3],a:match[4]===undefined?1:+match[4]};}
    }catch{}
    return EXP.ColorEngine.parse(raw);
  }
  function forcedColors(){try{return matchMedia('(forced-colors: active)').matches;}catch{return false;}}
  function captureNativeBaseline(){
    if(nativeBaseline||!document.documentElement)return nativeBaseline;
    try{
      const html=document.documentElement,body=document.body,rootStyle=getComputedStyle(html),bodyStyle=body?getComputedStyle(body):null;
      let saved=null;try{saved=JSON.parse(html.dataset.expShiftNativeBaseline||'null');}catch{}
      nativeBaseline={
        meta:String(saved?.meta||[...document.querySelectorAll('meta[name="color-scheme"]')].map(node=>node.content||'').join(' ')).toLowerCase(),
        rootScheme:saved?.rootScheme||rootStyle.colorScheme||'',bodyScheme:saved?.bodyScheme||bodyStyle?.colorScheme||'',
        rootBg:parseColor(saved?.rootBg||rootStyle.backgroundColor),bodyBg:parseColor(saved?.bodyBg||bodyStyle?.backgroundColor||'')
      };
    }catch{nativeBaseline={meta:'',rootScheme:'',bodyScheme:'',rootBg:null,bodyBg:null};}
    return nativeBaseline;
  }
  function detectNativeDark(){
    const baseline=captureNativeBaseline();
    const tone=color=>{
      if(!color||(color.a??1)<.9)return 'transparent';
      const level=(Math.max(color.r,color.g,color.b)+Math.min(color.r,color.g,color.b))/510;
      if(level<=.28)return 'dark';
      if(level>=.68)return 'light';
      return 'mid';
    };
    const darkOnlyScheme=value=>/\bdark\b/i.test(String(value||''))&&!/\blight\s+dark\b|\bdark\s+light\b/i.test(String(value||''));
    const explicit=darkOnlyScheme(baseline.rootScheme)||darkOnlyScheme(baseline.bodyScheme)||darkOnlyScheme(baseline.meta);
    const darkCanvas=tone(baseline.rootBg)==='dark'||tone(baseline.bodyBg)==='dark';
    const sampleSelectors=[
      'main','[role="main"]','header','nav','aside','section','article','form',
      '[role="banner"]','[role="navigation"]','[role="contentinfo"]','[role="dialog"]',
      '.card','.panel','[class*="card" i]','[class*="panel" i]'
    ].join(',');
    const candidates=[];
    try{
      for(const el of document.querySelectorAll(sampleSelectors)){
        if(candidates.length>=48)break;
        if(el.closest?.('[data-exp-owned="1"]'))continue;
        const rect=el.getBoundingClientRect();
        if(rect.width<120||rect.height<40||rect.bottom<0||rect.top>innerHeight*2)continue;
        const area=rect.width*rect.height;
        if(area<Math.max(8000,innerWidth*innerHeight*.025))continue;
        let color=null;try{color=parseColor(getComputedStyle(el).backgroundColor);}catch{}
        const kind=tone(color);
        if(kind==='transparent')continue;
        candidates.push({area,kind});
      }
    }catch{}
    candidates.sort((a,b)=>b.area-a.area);
    const samples=candidates.slice(0,24);
    const darkSurfaceCount=samples.filter(item=>item.kind==='dark').length;
    const lightSurfaceCount=samples.filter(item=>item.kind==='light').length;
    const midSurfaceCount=samples.length-darkSurfaceCount-lightSurfaceCount;
    const darkSurfaceRatio=samples.length?darkSurfaceCount/samples.length:0;
    const inferred=darkCanvas&&samples.length>=4&&darkSurfaceCount>=3&&darkSurfaceRatio>=.72&&lightSurfaceCount<=Math.max(1,Math.floor(samples.length*.12));
    metrics.nativeDark=Boolean((explicit&&darkCanvas)||(!explicit&&inferred));
    metrics.nativeDarkReason=metrics.nativeDark?(explicit?'explicit-dark-scheme-with-dark-canvas':'inferred-dark-surface-majority'):null;
    metrics.nativeDarkEvidence={
      explicitDarkScheme:explicit,darkCanvas,sampleCount:samples.length,darkSurfaceCount,lightSurfaceCount,midSurfaceCount,
      darkSurfaceRatio:Math.round(darkSurfaceRatio*1000)/1000,inferred
    };
    return metrics.nativeDark;
  }
  function rememberHost(node){
    if(!node||hostPaint.has(node))return;
    hostPaint.set(node,['background','background-color','color','color-scheme'].map(property=>[property,node.style.getPropertyValue(property),node.style.getPropertyPriority(property)]));
  }
  function restoreHost(node){
    const saved=hostPaint.get(node);if(!saved)return;hostPaint.delete(node);
    for(const [property,value,priority] of saved){node.style.removeProperty(property);if(value)node.style.setProperty(property,value,priority);}
  }
  function lockHost(theme,paint=true){
    const html=document.documentElement;if(!html)return;
    if(paint){
      for(const node of [html,document.body]){if(!node)continue;rememberHost(node);node.style.setProperty('background-color',theme.page,'important');node.style.setProperty('color',theme.text,'important');node.style.setProperty('color-scheme','dark','important');}
    }
    html.setAttribute(HOST_ATTR,theme.id||'1');
  }
  function unlockHost(){document.documentElement?.removeAttribute(HOST_ATTR);for(const node of [document.documentElement,document.body])restoreHost(node);}
  function ensureGuard(){
    if(guard||!document.documentElement)return;
    guard=new MutationObserver(mutations=>{
      if(writing||!active||!lastCss)return;
      const removed=mutations.some(mutation=>[...mutation.removedNodes].some(node=>node===style||(node.nodeType===1&&(node.id===STYLE_ID||node.dataset?.expShiftPageStyle))));
      if(removed){metrics.reattaches++;style=null;ensureStyle(lastCss);}
    });
    guard.observe(document.documentElement,{childList:true,subtree:true});
  }
  function ensureStyle(cssText){
    lastCss=cssText;if(writing)return style;writing=true;
    try{
      if(style?.isConnected){if(style.textContent!==cssText)style.textContent=cssText;return style;}
      style?.remove();style=EXP.Core.injectStyle(document,cssText,{expShiftPageStyle:'1'});style.id=STYLE_ID;ensureGuard();return style;
    }finally{writing=false;}
  }
  function pagePaint(theme,state,edge=false){
    if(state.simplifyGradients)return `background:${theme.page}!important;background-color:${theme.page}!important`;
    const layers=[];
    if(edge&&theme.pageEdge)layers.push(`${theme.pageEdge} top / 100% ${theme.id==='pride'?10:6}px no-repeat`);
    if(theme.pageFill)layers.push(theme.pageFill);layers.push(theme.page);
    return `background:${layers.join(',')}!important;background-color:${theme.page}!important`;
  }
  function css(theme,state,nativeDark=false){
    const strength=state.themeStrength||'normal';
    const surface=strength==='soft'?`color-mix(in srgb,${theme.surface} 58%,${theme.page})`:theme.surface;
    const raised=strength==='soft'?`color-mix(in srgb,${theme.raised} 62%,${theme.surface})`:strength==='strong'?theme.overlay:theme.raised;
    const overlay=strength==='strong'?`color-mix(in srgb,${theme.overlay} 84%,${theme.text})`:theme.overlay;
    const text=state.textContrast==='enhanced'?theme.text:`color-mix(in srgb,${theme.text} 88%,${theme.muted})`;
    const vars=`--exp-shift-page:${theme.page};--exp-shift-surface:${surface};--exp-shift-raised:${raised};--exp-shift-overlay:${overlay};--exp-shift-navigation:${theme.navigation};--exp-shift-input:${theme.input};--exp-shift-interactive:${theme.interactive};--exp-shift-text:${text};--exp-shift-muted:${theme.muted};--exp-shift-accent:${theme.accent};--exp-shift-highlight:${theme.highlight||theme.accent}`;
    const effects=`${state.reduceShadows?'box-shadow:none!important;':''}${state.reduceTransparency?'backdrop-filter:none!important;':''}${state.simplifyGradients?'background-image:none!important;':''}${state.reduceBlur?'filter:none!important;backdrop-filter:none!important;':''}`;
    const reduceMotion=state.reduceMotion==='on'||(state.reduceMotion==='system'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
    const motion=reduceMotion?'html[data-exp-shift] :is([data-exp-shift-live],main,header,footer,nav,aside,section,article,button,input,select,textarea){animation:none!important;transition:none!important;scroll-behavior:auto!important}':'';
    const links=state.linkVisibility==='site'?'':`html[${HOST_ATTR}] a:not([role="button"]):not([data-exp-owned="1"]){color:var(--exp-shift-accent)!important;text-decoration-thickness:${state.linkVisibility==='high'?'2px':'auto'}!important}`;
    const forms=state.formReadability
      ? (nativeDark
        ? `html[${HOST_ATTR}] :is(input,select,textarea):not([data-exp-owned="1"]){color:var(--exp-shift-text)!important;border-color:color-mix(in srgb,var(--exp-shift-accent) 55%,currentColor)!important}`
        : `html[${HOST_ATTR}] :is(input,select,textarea):not([data-exp-owned="1"]){background-color:var(--exp-shift-input)!important;color:var(--exp-shift-text)!important;border-color:var(--exp-shift-accent)!important}`)
      : '';
    const muted=state.mutedRecovery?`html[${HOST_ATTR}] :is(.muted,.text-muted,[class*="muted" i],[class*="secondary" i],[class*="subtle" i],figcaption,small,caption):not([data-exp-owned="1"]){color:color-mix(in srgb,var(--exp-shift-muted) 80%,var(--exp-shift-text))!important}`:'';
    const focus=state.focusVisibility==='site'?'':`html[${HOST_ATTR}] :focus-visible{outline:${state.focusVisibility==='high'?3:2}px solid var(--exp-shift-accent)!important;outline-offset:2px!important}`;
    const structural=nativeDark?'':`
      html[${HOST_ATTR}]{${pagePaint(theme,state,true)};color:${text}!important}
      html[${HOST_ATTR}] body{${pagePaint(theme,state)};color:${text}!important}
      html[${HOST_ATTR}] :is(${SHELL_SELECTOR})${EXCLUDE}{background-color:var(--exp-shift-page)!important;color:var(--exp-shift-text)!important}
      html[${HOST_ATTR}] :is(header,footer,nav,aside,[role="banner"],[role="navigation"],[role="contentinfo"])${EXCLUDE}{background-color:var(--exp-shift-navigation)!important;color:var(--exp-shift-text)!important;border-color:var(--exp-shift-highlight)!important}
      html[${HOST_ATTR}] :is(main,[role="main"])${EXCLUDE}{background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important}
      html[${HOST_ATTR}] :is(section,article,p,li,label,h1,h2,h3,h4,h5,h6,dt,dd,figcaption,legend,caption,blockquote,small)${EXCLUDE}{color:var(--exp-shift-text)!important}
      html[${HOST_ATTR}] :is(${CHROME_SELECTOR})${EXCLUDE}{background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important;border-color:color-mix(in srgb,var(--exp-shift-muted) 40%,transparent)!important}
      html[${HOST_ATTR}] :is(${NAV_SELECTOR})${EXCLUDE}{background-color:var(--exp-shift-navigation)!important;color:var(--exp-shift-text)!important}
      html[${HOST_ATTR}] :is(${CONTENT_SELECTOR})${EXCLUDE}{background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important}
      ${EXP.ThemeRules.css(state,EXCLUDE)}${EXP.SiteFixes.css()}`;
    return `@media screen{
      :root,html[${HOST_ATTR}],:host{${vars}}
      html[${HOST_ATTR}]{color-scheme:dark!important}
      ${structural}
      html[${HOST_ATTR}] :is(img,picture,video,canvas,svg,[role="img"],[data-exp-shift-preserve]){filter:none!important}
      html[${HOST_ATTR}] [data-exp-shift-live]{${effects}}
      html[${HOST_ATTR}]{scrollbar-color:var(--exp-shift-muted) var(--exp-shift-raised)}
      ${links}${forms}${muted}${focus}${motion}
    }`;
  }
  function restore(){
    EXP.DynamicEngine?.stop();EXP.LiveResolver?.stop();EXP.ColorEngine.clear();
    style?.remove();style=null;lastCss='';unlockHost();
    try{document.querySelectorAll(`#${STYLE_ID},style[data-exp-shift-page-style],style[data-exp-shift-adapter-style]`).forEach(node=>node.remove());}catch{}
  }
  function apply(next){
    settings=next;metrics.applies++;
    const theme=EXP.Themes.resolve(next.theme,next.accent,next);
    const disabled=theme.original||next.safeMode||next.excluded||originalHeld||forcedColors();
    metrics.mode=next.excluded?'Excluded':next.safeMode?'Safe':theme.original||originalHeld?'Original':'Generic';
    if(disabled){EXP.Preload?.finish();restore();return{theme,mode:metrics.mode};}
    const nativeDark=detectNativeDark();
    unlockHost();
    lockHost(theme,!nativeDark);
    ensureStyle(css(theme,next,nativeDark));EXP.Preload?.finish();
    if(nativeDark)EXP.DynamicEngine?.stop();else EXP.DynamicEngine?.start(theme);
    EXP.LiveResolver?.start(theme,{repairSurfaces:next.repairSurfaces,surfaceLevel:next.surfaceLevel,nativeDark});
    return{theme,mode:metrics.mode};
  }
  function start(initial){if(active)return;active=true;settings=initial;captureNativeBaseline();apply(initial);}
  function stop(){active=false;guard?.disconnect();guard=null;restore();}
  function holdOriginal(held){originalHeld=Boolean(held);if(settings)apply(settings);}
  function health(){
    const live=EXP.LiveResolver?.health?.()||{};
    const leftoverStyles=document.querySelectorAll(`#${STYLE_ID},style[data-exp-shift-page-style],style[data-exp-shift-adapter-style]`).length;
    const hostLocked=Boolean(document.documentElement?.hasAttribute(HOST_ATTR));
    return{...metrics,scanned:live.scanned||0,batches:live.passes||0,lastDurationMs:live.lastDurationMs||0,owned:live.ownedRepairs||0,classified:live.brightSurfaces||0,shells:0,shadows:EXP.DynamicEngine?.health?.().shadowRoots||0,colorRepairs:live.resolved||0,stylesheetInvalidation:{owner:'DynamicEngine',safetyPollMs:0},dynamicEngine:EXP.DynamicEngine?.health?.()||null,liveResolver:live,colorEngine:EXP.ColorEngine.health(),leftoverPaint:{hostAttribute:hostLocked,styleSheets:leftoverStyles,ownedSurfaces:live.ownedRepairs||0,active:Boolean(lastCss)||hostLocked||leftoverStyles>0||(live.ownedRepairs||0)>0}};
  }
  function addProcessor(processor){return EXP.LiveResolver.addProcessor(processor);}
  return Object.freeze({start,stop,apply,holdOriginal,health,scan:()=>EXP.LiveResolver.scan(),fullScan:()=>EXP.LiveResolver.fullScan(),addProcessor});
})();

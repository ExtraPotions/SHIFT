EXP.LiveResolver = (() => {
  let observer = null;
  let timer = 0;
  let active = false;
  let theme = null;
  let fix = null;
  let options = { repairSurfaces:true, surfaceLevel:'conservative', nativeDark:false };

  const ATTR = 'data-exp-shift-live';
  const PRESERVE = 'data-exp-shift-preserve';
  const PROTECTED = [
    '[data-exp-owned="1"]', `[${PRESERVE}]`,
    'img','picture','video','canvas','svg','[role="img"]',
    '[class*="badge" i]','[class*="status" i]','[class*="rating" i]','[role="progressbar"]'
  ].join(',');
  const CANDIDATES = [
    'html','body','main','header','footer','nav','aside','section','article','div','form','fieldset',
    'input','textarea','select','button','details','summary','dialog','[popover]','[role="main"]','[role="banner"]','[role="navigation"]',
    '[role="contentinfo"]','[role="dialog"]','[role="menu"]','[role="listbox"]','[role="option"]',
    '[role="button"]','[role="textbox"]','[role="combobox"]','[role="searchbox"]','[role="tooltip"]','[role="alert"]','[role="status"]'
  ].join(',');
  const TEXT_CANDIDATES = [
    'p','span','a','label','li','dt','dd','small','figcaption','legend','caption',
    'h1','h2','h3','h4','h5','h6','button','input','textarea','select','[role="button"]','[role="option"]'
  ].join(',');

  const ledger = new Map();
  const processors = new Set();
  const queuedRoots = new Set();
  const pseudoRules = new Map();
  let pseudoStyle = null;
  let pseudoSequence = 0;
  const stats = {
    passes:0,scanned:0,unresolved:0,resolved:0,siteFixes:0,contrast:0,brightSurfaces:0,forms:0,
    inheritedBackgrounds:0,transparentSurfaces:0,textRepairs:0,skippedProtected:0,skippedSemantic:0,backgroundImages:0,imageOverlays:0,iframes:0,iframeFailures:0,placeholders:0,selectionRules:0,scrollbars:0,stickySurfaces:0,fixedSurfaces:0,borders:0,outlines:0,details:0,dialogs:0,popovers:0,mutationPasses:0,rootsQueued:0
  };

  function parse(value){ return EXP.ColorEngine.parse(value); }
  function rgba(color){
    if(!color)return null;
    const a=color.a==null?1:color.a;
    return a<.999
      ? `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${Math.round(a*1000)/1000})`
      : `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;
  }
  function composite(fg,bg){
    if(!fg)return bg;
    if(!bg||(fg.a??1)>=.999)return {...fg,a:1};
    const fa=Math.max(0,Math.min(1,fg.a??1)),ba=Math.max(0,Math.min(1,bg.a??1));
    const a=fa+ba*(1-fa);
    if(a<=.001)return {r:0,g:0,b:0,a:0};
    return {
      r:(fg.r*fa+bg.r*ba*(1-fa))/a,
      g:(fg.g*fa+bg.g*ba*(1-fa))/a,
      b:(fg.b*fa+bg.b*ba*(1-fa))/a,a
    };
  }
  function isProtected(el){
    try{
      if(!el||el.nodeType!==1)return true;
      if(el.matches(PROTECTED)||el.closest('[data-exp-owned="1"],[data-exp-shift-preserve]')){stats.skippedProtected++;return true;}
    }catch{}
    return false;
  }
  function visible(el){
    try{
      const cs=getComputedStyle(el);
      if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)<=.01)return false;
      const r=el.getBoundingClientRect();
      return r.width>1&&r.height>1&&r.bottom>=-240&&r.top<=innerHeight+240&&r.right>=-240&&r.left<=innerWidth+240;
    }catch{return false;}
  }
  function bright(color){
    const p=typeof color==='string'?parse(color):color;
    return Boolean(p&&(p.a??1)>.82&&EXP.ColorEngine.luminance(p)>.56);
  }
  function remember(el,property){
    let saved=ledger.get(el);
    if(!saved){saved=new Map();ledger.set(el,saved);}
    if(!saved.has(property))saved.set(property,[el.style.getPropertyValue(property),el.style.getPropertyPriority(property)]);
  }
  function write(el,property,value){
    if(!value)return false;
    remember(el,property);
    if(el.style.getPropertyValue(property)===value&&el.style.getPropertyPriority(property)==='important')return false;
    el.style.setProperty(property,value,'important');
    return true;
  }
  function effectiveBackground(el){
    let node=el,accumulated=null,inherited=false,depth=0;
    while(node&&depth<24){
      depth++;
      try{
        const cs=getComputedStyle(node),color=parse(cs.backgroundColor);
        if(color&&(color.a??1)>.001){
          accumulated=accumulated?composite(accumulated,color):color;
          if((accumulated.a??1)>=.985){
            if(inherited)stats.inheritedBackgrounds++;
            return rgba(accumulated);
          }
        }else stats.transparentSurfaces++;
      }catch{}
      inherited=true;
      node=node.parentElement||node.getRootNode?.()?.host||null;
    }
    const fallback=parse(theme?.page)||{r:0,g:0,b:0,a:1};
    return accumulated?rgba(composite(accumulated,fallback)):(theme?.page||'#000');
  }
  function minimumContrast(el){
    try{
      const cs=getComputedStyle(el),size=parseFloat(cs.fontSize)||16,weight=parseInt(cs.fontWeight,10)||400;
      return size>=24||(size>=18.66&&weight>=700)?3:4.5;
    }catch{return 4.5;}
  }
  function semanticSurface(el,cs){
    try{
      const key=`${el.className||''} ${el.id||''} ${el.getAttribute('role')||''} ${el.getAttribute('aria-label')||''}`.toLowerCase();
      if(/(?:badge|status|rating|star|success|danger|error|warning|sale|discount|promo|price|favorite|heart|brand|logo)/.test(key)){stats.skippedSemantic++;return true;}
      const own=parse(cs.backgroundColor);
      if(own&&EXP.ColorEngine.saturation(own)>.42&&EXP.ColorEngine.luminance(own)>.08&&EXP.ColorEngine.luminance(own)<.72){stats.skippedSemantic++;return true;}
    }catch{}
    return false;
  }
  function hasArtwork(cs){
    const image=String(cs.backgroundImage||'');
    if(!image||image==='none')return false;
    if(/url\s*\(/i.test(image)){stats.backgroundImages++;return true;}
    return false;
  }
  function repairImageOverlay(el,cs,effectiveBg){
    if(!hasArtwork(cs)||!bright(effectiveBg))return false;
    const text=parse(cs.color),bg=parse(effectiveBg);
    if(!text||!bg||EXP.ColorEngine.contrastRatio(text,bg)>=4.5)return false;
    const current=String(cs.backgroundImage||'');
    if(!/url\s*\(/i.test(current))return false;
    const overlay=`linear-gradient(rgba(0,0,0,.34),rgba(0,0,0,.34)),${current}`;
    if(write(el,'background-image',overlay)){stats.imageOverlays++;return true;}
    return false;
  }
  function shouldRepairSurface(el,cs,effectiveBg){
    const own=parse(cs.backgroundColor);
    if(!own||(own.a??1)<.08||!bright(effectiveBg)||semanticSurface(el,cs))return false;
    const sat=EXP.ColorEngine.saturation(own),lum=EXP.ColorEngine.luminance(own);
    return sat<=.32||lum>=.78;
  }
  function recordElementState(el,cs){
    if(cs.position==='fixed')stats.fixedSurfaces++;
    else if(cs.position==='sticky')stats.stickySurfaces++;
    if(el.tagName==='DETAILS'&&el.open)stats.details++;
    if(el.tagName==='DIALOG'&&el.open)stats.dialogs++;
    if(el.matches?.(':popover-open'))stats.popovers++;
  }
  function repairEdges(el,cs,bg){
    if(!bg)return false;
    let changed=false;
    for(const property of ['border-top-color','border-right-color','border-bottom-color','border-left-color']){
      const raw=cs.getPropertyValue(property),parsed=parse(raw);
      if(!parsed||(parsed.a??1)<.08)continue;
      if(EXP.ColorEngine.contrastRatio(parsed,bg)<1.22&&EXP.ColorEngine.luminance(parsed)>.45&&write(el,property,EXP.ColorEngine.border(raw,theme))){stats.borders++;changed=true;}
    }
    const outline=parse(cs.outlineColor);
    if(outline&&(outline.a??1)>.08&&cs.outlineStyle!=='none'&&EXP.ColorEngine.contrastRatio(outline,bg)<1.35&&write(el,'outline-color',theme.accent||EXP.ColorEngine.border(cs.outlineColor,theme))){stats.outlines++;changed=true;}
    return changed;
  }
  function repairForeground(el,cs,effectiveBg){
    const fg=parse(cs.color),bg=parse(effectiveBg);if(!fg||!bg)return false;
    const minimum=minimumContrast(el);if(EXP.ColorEngine.contrastRatio(fg,bg)>=minimum)return false;
    const next=EXP.ColorEngine.foreground(cs.color,theme,effectiveBg,minimum);
    if(!next||!write(el,'color',next))return false;
    stats.contrast++;stats.textRepairs++;return true;
  }
  function repairForm(el,effectiveBg){
    if(!/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))return false;
    stats.forms++;let changed=false;
    if(bright(effectiveBg)&&write(el,'background-color',theme.input||theme.raised||theme.surface))changed=true;
    const nowBg=effectiveBackground(el),nowFg=getComputedStyle(el).color;
    if(parse(nowFg)&&parse(nowBg)&&EXP.ColorEngine.contrastRatio(nowFg,nowBg)<4.5&&write(el,'color',EXP.ColorEngine.foreground(nowFg,theme,nowBg,4.5))){stats.contrast++;changed=true;}
    return changed;
  }
  function repair(el,reason,options={}){
    if(isProtected(el)||!visible(el))return false;
    let cs;try{cs=getComputedStyle(el);}catch{return false;}
    let changed=false,effectiveBg=effectiveBackground(el);
    recordElementState(el,cs);
    if(!options.nativeDark&&el.hasAttribute('style')&&!el.matches('html,body'))EXP.ColorEngine.inspectInline(el,theme);
    if(repairImageOverlay(el,cs,effectiveBg)){changed=true;try{cs=getComputedStyle(el);effectiveBg=effectiveBackground(el);}catch{}}
    if(options.surface!==false&&options.repairSurfaces!==false&&!options.nativeDark&&shouldRepairSurface(el,cs,effectiveBg)){
      const next=EXP.ColorEngine.background(cs.backgroundColor,theme,theme.page);
      if(next&&write(el,'background-color',next)){stats.brightSurfaces++;changed=true;effectiveBg=effectiveBackground(el);}
    }
    if(repairEdges(el,cs,parse(effectiveBg)))changed=true;
    if(options.text!==false&&repairForeground(el,cs,effectiveBg))changed=true;
    if(repairForm(el,effectiveBg))changed=true;
    if(changed){el.setAttribute(ATTR,reason);stats.resolved++;}
    return changed;
  }
  function repairText(el,reason){
    if(isProtected(el)||!visible(el))return false;
    let cs;try{cs=getComputedStyle(el);}catch{return false;}
    const bg=effectiveBackground(el),fg=parse(cs.color),parsedBg=parse(bg);
    if(!fg||!parsedBg)return false;
    const minimum=minimumContrast(el);
    if(EXP.ColorEngine.contrastRatio(fg,parsedBg)>=minimum)return false;
    const next=EXP.ColorEngine.foreground(cs.color,theme,bg,minimum);
    if(!next||!write(el,'color',next))return false;
    el.setAttribute(ATTR,reason);stats.contrast++;stats.textRepairs++;stats.resolved++;return true;
  }
  function applySiteFixes(root=document){
    if(!fix)return;
    const scope=root?.querySelectorAll?root:document;
    try{
      if(fix.preserve?.length)scope.querySelectorAll(fix.preserve.join(',')).forEach(el=>el.setAttribute(PRESERVE,'1'));
      if(fix.preserveSurfaces?.length)scope.querySelectorAll(fix.preserveSurfaces.join(',')).forEach(el=>el.setAttribute(PRESERVE,'1'));
      if(options.repairSurfaces&&!options.nativeDark&&fix.surfaces?.length)scope.querySelectorAll(fix.surfaces.join(',')).forEach(el=>{if(repair(el,`site:${fix.id}`,options))stats.siteFixes++;});
      if(fix.text?.length)scope.querySelectorAll(fix.text.join(',')).forEach(el=>{if(repairText(el,`site-text:${fix.id}`))stats.siteFixes++;});
      if(fix.forceText?.length)scope.querySelectorAll(fix.forceText.join(',')).forEach(el=>{
        if(isProtected(el)||!visible(el))return;
        if(write(el,'color',theme.text)){el.setAttribute(ATTR,`site-force-text:${fix.id}`);stats.siteFixes++;stats.textRepairs++;stats.resolved++;}
      });
    }catch{}
  }
  function syncPseudoStyle(){
    if(!pseudoRules.size){pseudoStyle?.remove();pseudoStyle=null;return;}
    if(!pseudoStyle?.isConnected){pseudoStyle=document.createElement('style');pseudoStyle.dataset.expOwned='1';pseudoStyle.dataset.expShiftLivePseudo='1';(document.head||document.documentElement).append(pseudoStyle);}
    pseudoStyle.textContent=[...pseudoRules.values()].join('\n');
  }
  function pseudoRepair(el,reason){
    if(isProtected(el)||!visible(el))return false;
    let id=el.getAttribute('data-exp-shift-pseudo-id'),changed=false;
    const rules=[];
    for(const pseudo of ['::before','::after']){
      try{
        const cs=getComputedStyle(el,pseudo);
        if(!cs||cs.content==='none'||cs.display==='none'||cs.visibility==='hidden')continue;
        const bg=parse(cs.backgroundColor),fg=parse(cs.color),effective=effectiveBackground(el);
        let nextBg='',nextFg='';
        if(bg&&bright(bg)){nextBg=EXP.ColorEngine.background(cs.backgroundColor,theme,theme.page);nextFg=EXP.ColorEngine.foreground(cs.color,theme,nextBg,4.5);}
        else if(fg&&parse(effective)&&EXP.ColorEngine.contrastRatio(fg,parse(effective))<4.5)nextFg=EXP.ColorEngine.foreground(cs.color,theme,effective,4.5);
        if(nextBg||nextFg){
          if(!id){id=`p${++pseudoSequence}`;el.setAttribute('data-exp-shift-pseudo-id',id);}
          rules.push(`[data-exp-shift-pseudo-id="${id}"]${pseudo}{${nextBg?`background-color:${nextBg}!important;`:''}${nextFg?`color:${nextFg}!important;`:''}}`);
        }
      }catch{}
    }
    if(id){
      const css=rules.join('');
      if(css){if(pseudoRules.get(id)!==css){pseudoRules.set(id,css);changed=true;}}
      else if(pseudoRules.delete(id)){el.removeAttribute('data-exp-shift-pseudo-id');changed=true;}
      if(changed)syncPseudoStyle();
    }
    if(changed)stats.resolved++;
    return changed;
  }
  function scanFrames(){
    for(const frame of document.querySelectorAll('iframe')){
      try{
        const doc=frame.contentDocument;
        if(!doc?.documentElement)continue;
        stats.iframes++;
        const root=doc.documentElement;
        const nodes=[root,doc.body,...root.querySelectorAll(CANDIDATES)].filter(Boolean).slice(0,500);
        for(const el of nodes){
          try{
            const cs=doc.defaultView.getComputedStyle(el),bg=parse(cs.backgroundColor);
            if(bg&&bright(bg)){
              const next=EXP.ColorEngine.background(cs.backgroundColor,theme,theme.page);
              el.style.setProperty('background-color',next,'important');
              const fg=EXP.ColorEngine.foreground(cs.color,theme,next,4.5);
              el.style.setProperty('color',fg,'important');
            }
          }catch{}
        }
      }catch{stats.iframeFailures++;}
    }
  }
  function ensureGlobalRepairs(){
    let style=document.querySelector('style[data-exp-shift-live-global="1"]');
    if(!style){style=document.createElement('style');style.dataset.expOwned='1';style.dataset.expShiftLiveGlobal='1';(document.head||document.documentElement).append(style);}
    const css=`
      ::placeholder{color:${theme.muted}!important;opacity:1!important}
      ::selection{background:${theme.accent}!important;color:${theme.page}!important}
      html{scrollbar-color:${theme.muted} ${theme.raised||theme.surface}!important}
      input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,textarea:-webkit-autofill,select:-webkit-autofill{
        -webkit-text-fill-color:${theme.text}!important;
        box-shadow:0 0 0 1000px ${theme.input||theme.raised||theme.surface} inset!important;
        caret-color:${theme.text}!important
      }`;
    if(style.textContent!==css)style.textContent=css;
    stats.placeholders++;stats.selectionRules++;stats.scrollbars++;
  }
  function collect(root,selector,out,limit){
    if(!root||out.length>=limit)return;
    if(root.nodeType===1&&root.matches?.(selector)&&visible(root))out.push(root);
    if(out.length>=limit)return;
    try{for(const el of root.querySelectorAll?.(selector)||[]){if(visible(el))out.push(el);if(out.length>=limit)break;}}catch{}
  }
  function pass(roots=null,mutation=false){
    if(!active||!theme)return;
    const started=performance.now();stats.passes++;if(mutation)stats.mutationPasses++;ensureGlobalRepairs();
    const targets=[],textTargets=[],sourceRoots=roots?.length?roots:[document.documentElement];
    // Site preservation must run before the generic scan so artwork/media wells
    // are protected before any bright-surface repair can rewrite them.
    for(const root of sourceRoots)applySiteFixes(root);
    const levelLimit={off:0,conservative:700,balanced:1800,aggressive:5000}[options.surfaceLevel]??700;
    const surfaceLimit=roots?.length?Math.min(levelLimit,1200):levelLimit,textLimit=roots?.length?1200:2600;
    for(const root of sourceRoots){
      collect(root,CANDIDATES,targets,surfaceLimit);collect(root,TEXT_CANDIDATES,textTargets,textLimit);
      if(targets.length>=surfaceLimit&&textTargets.length>=textLimit)break;
    }
    const seen=new Set();
    for(const el of targets){
      if(seen.has(el)||!visible(el))continue;
      seen.add(el);stats.scanned++;
      const bg=effectiveBackground(el);
      if(bright(bg)){stats.unresolved++;repair(el,'visual',options);}
      else repair(el,'contrast',{...options,surface:false});
      pseudoRepair(el,'pseudo');
    }
    for(const el of textTargets){
      if(seen.has(el)||!visible(el))continue;
      stats.scanned++;repairText(el,'text');
    }
    for(const processor of processors){try{processor(sourceRoots);}catch(error){EXP.Core.safeError(error,'shift-processor');}}
    stats.lastDurationMs=Math.round((performance.now()-started)*10)/10;
  }
  function flush(){
    timer=0;if(!active)return;
    const roots=[...queuedRoots].filter(root=>root?.isConnected!==false);
    queuedRoots.clear();pass(roots.length?roots:null,true);
  }
  function schedule(root){
    if(root?.nodeType===1){queuedRoots.add(root);stats.rootsQueued++;}
    clearTimeout(timer);timer=setTimeout(flush,90);
  }
  const onScroll = () => { if(active)schedule(document.documentElement); };
  function start(nextTheme,nextOptions={}){
    if(!nextTheme||nextTheme.original){stop();return;}
    if(active){refresh(nextTheme,nextOptions);return;}
    theme=nextTheme;options={...options,...nextOptions};fix=EXP.SiteFixes.active();active=true;pass();
    observer?.disconnect();
    observer=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        if(mutation.type==='attributes'){
          const target=mutation.target;
          if(target?.nodeType===1&&!target.closest?.('[data-exp-owned="1"],[data-exp-shift-preserve]'))schedule(target);
          continue;
        }
        for(const node of mutation.addedNodes){
          if(node?.nodeType!==1||node.closest?.('[data-exp-owned="1"],[data-exp-shift-preserve]'))continue;
          schedule(node);
        }
      }
    });
    observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden','aria-hidden','open']});
    document.addEventListener('scroll',onScroll,{capture:true,passive:true});
  }
  function refresh(nextTheme,nextOptions={}){
    if(!nextTheme||nextTheme.original){stop();return;}
    if(!active){start(nextTheme,nextOptions);return;}
    theme=nextTheme;options={...options,...nextOptions};fix=EXP.SiteFixes.active();schedule(document.documentElement);
  }
  function restore(){
    for(const [el,properties] of [...ledger]){
      if(!el)continue;
      for(const [property,[value,priority]] of properties){
        try{if(value)el.style.setProperty(property,value,priority);else el.style.removeProperty(property);}catch{}
      }
      try{el.removeAttribute(ATTR);}catch{}
    }
    ledger.clear();
    pseudoRules.clear();pseudoStyle?.remove();pseudoStyle=null;try{document.querySelectorAll('style[data-exp-shift-live-global="1"]').forEach(node=>node.remove());document.querySelectorAll('[data-exp-shift-pseudo-id]').forEach(node=>node.removeAttribute('data-exp-shift-pseudo-id'));}catch{}
  }
  function stop(){
    document.removeEventListener('scroll',onScroll,true);
    active=false;clearTimeout(timer);timer=0;queuedRoots.clear();observer?.disconnect();observer=null;restore();
    EXP.ColorEngine.clear();
  }
  function health(){
    return {...stats,site:fix?.id||null,active,ownedRepairs:[...ledger.keys()].filter(el=>el?.isConnected).length,queued:queuedRoots.size};
  }
  function addProcessor(processor){processors.add(processor);return()=>processors.delete(processor);}
  function scan(){schedule(document.documentElement);}
  function fullScan(){const previous=options.surfaceLevel;options={...options,surfaceLevel:'aggressive'};pass();options={...options,surfaceLevel:previous};}
  return Object.freeze({start,refresh,stop,health,scan,fullScan,addProcessor});
})();

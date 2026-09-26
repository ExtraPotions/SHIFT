EXP.DynamicEngine = (() => {
  const handles = new Map();
  const remoteHandles = new Map();
  const remoteCache = new Map();
  const cache = new Map();
  const stats = { runs:0, sheets:0, rulesSeen:0, rulesGenerated:0, inaccessible:0, remoteSheets:0, remoteRules:0, remoteFailures:0, remoteSkippedNoHref:0, cacheHits:0, cacheMisses:0, variables:0, groups:0, shadowRoots:0, adoptedSheets:0, inferredVariables:0, skippedSemanticVariables:0, gradients:0, layeredBackgrounds:0, preservedImages:0, currentColor:0, colorMix:0, masks:0, filters:0, stylesheetLoads:0 };
  const remoteLifetime = { attempts:0, successes:0, failures:0, skippedNoHref:0, recoveredRules:0, lastSuccessAt:0, lastFailure:null, hosts:new Set() };
  let observer=null, timer=0, active=false, theme=null, lastThemeKey='', generation=0;
  const pendingRemote = new Map();
  const watchedLinks = new WeakSet();

  const signature = (sheet) => {
    try {
      const rules=sheet.cssRules; let hash=2166136261;
      for(let i=0;i<rules.length;i+=Math.max(1,Math.floor(rules.length/48))){
        const text=rules[i]?.cssText||'';
        for(let j=0;j<text.length;j+=Math.max(1,Math.floor(text.length/32))){hash^=text.charCodeAt(j);hash=Math.imul(hash,16777619);}
      }
      return `${rules.length}:${hash>>>0}`;
    } catch { return 'x'; }
  };
  const themeKey = (t) => [t.id,t.page,t.surface,t.raised,t.overlay,t.text,t.muted,t.accent].join('|');
  const DYNAMIC_PRESERVE_GUARD = ':not(:where([data-exp-shift-preserve],[data-exp-shift-preserve] *))';
  function guardSelectorText(selectorText){
    const source=String(selectorText||''),parts=[];
    let start=0,paren=0,bracket=0,quote='',escape=false;
    for(let i=0;i<=source.length;i++){
      const ch=source[i]||',';
      if(quote){
        if(escape){escape=false;continue;}
        if(ch==='\\'){escape=true;continue;}
        if(ch===quote)quote='';
        continue;
      }
      if(ch==='"'||ch==="'"){quote=ch;continue;}
      if(ch==='(')paren++;
      else if(ch===')')paren=Math.max(0,paren-1);
      else if(ch==='[')bracket++;
      else if(ch===']')bracket=Math.max(0,bracket-1);
      else if(ch===','&&paren===0&&bracket===0){
        const part=source.slice(start,i).trim();
        if(part){
          const pseudo=part.indexOf('::');
          parts.push(pseudo>=0
            ? `${part.slice(0,pseudo)}${DYNAMIC_PRESERVE_GUARD}${part.slice(pseudo)}`
            : `${part}${DYNAMIC_PRESERVE_GUARD}`);
        }
        start=i+1;
      }
    }
    return parts.join(',');
  }

  function role(property,name='',value=''){
    if(String(name).startsWith('--exp-shift-'))return null;
    const key=`${property} ${name}`.toLowerCase();
    const semantic=/(?:success|danger|error|warning|info|brand|logo|rating|star|sale|discount|promo|price|positive|negative|favorite|heart|selected|active-state)/.test(key);
    if(semantic){stats.skippedSemanticVariables++;return null;}
    if(/background|\bbg\b|surface|canvas|panel|card|layer|container|popover|dialog|menu/.test(key))return'background';
    if(/color|text|foreground|\bfg\b|label|ink|content|fill|lighting|copy|font/.test(key))return'foreground';
    if(/border|outline|divider|stroke|rule|separator/.test(key))return'border';
    if(name&&String(name).startsWith('--')){
      const parsed=EXP.ColorEngine.parse(String(value).trim());
      if(parsed&&(parsed.a??1)>.08){
        const lum=EXP.ColorEngine.luminance(parsed),sat=EXP.ColorEngine.saturation(parsed);
        if(sat<.14&&lum>.42){stats.inferredVariables++;return'background';}
        if(sat<.12&&lum<.42){stats.inferredVariables++;return'foreground';}
      }
    }
    return null;
  }
  function resolve(value,vars,seen=new Set()){
    return String(value||'').replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]+))?\)/g,(m,n,f)=>{
      if(seen.has(n))return f||m;const v=vars.get(n);if(!v)return f||m;const next=new Set(seen);next.add(n);return resolve(v,vars,next);
    });
  }
  function transformValue(property,value,vars,background){
    let resolved=resolve(value,vars);
    if(/currentcolor/i.test(resolved)){stats.currentColor++;return value;}
    if(/color-mix\s*\(/i.test(resolved)){stats.colorMix++;return value;}
    const hasUrl=/url\s*\(/i.test(resolved),hasGradient=/(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/i.test(resolved);
    if(hasUrl&&!hasGradient){stats.preservedImages++;return value;}
    if(hasGradient){
      stats.gradients++;
      if(hasUrl)stats.layeredBackgrounds++;
      return resolved.replace(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:white|black|silver|gray|grey)\b)/ig,c=>EXP.ColorEngine.transform(c,'background',theme,background));
    }
    if(/mask(?:-image)?$/i.test(property)){stats.masks++;return value;}
    if(/^filter$/i.test(property)){
      stats.filters++;
      return resolved.replace(/drop-shadow\(([^)]*)\)/ig,(m,body)=>`drop-shadow(${body.replace(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\))/ig,c=>EXP.ColorEngine.transform(c,'border',theme,background))})`);
    }
    if(/shadow/i.test(property)) return resolved.replace(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\))/ig,c=>EXP.ColorEngine.transform(c,'border',theme,background));
    const r=role(property,'',resolved);if(!r)return value;
    return resolved.replace(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:white|black|silver|gray|grey|red|green|blue|yellow|teal|aqua)\b)/ig,c=>EXP.ColorEngine.transform(c,r,theme,background));
  }
  function walk(rules,out,vars=new Map(),budget=5000){
    if (typeof budget === 'number') budget = { remaining: budget };
    if(!rules||budget.remaining<=0)return;
    const scope=new Map(vars);
    for(const rule of rules){try{if(rule.type===CSSRule.STYLE_RULE)for(let i=0;i<rule.style.length;i++){const p=rule.style.item(i);if(p.startsWith('--'))scope.set(p,rule.style.getPropertyValue(p));}}catch{}}
    for(const rule of rules){
      if(budget.remaining<=0)break;budget.remaining--;stats.rulesSeen++;
      try{
        if(rule.type===CSSRule.STYLE_RULE&&rule.selectorText&&rule.style){
          if(/data-exp-shift|exp-shift-root/.test(rule.selectorText))continue;
          const declarations=[];let bg=theme.page;
          const rawBg=rule.style.getPropertyValue('background-color')||rule.style.getPropertyValue('background');
          if(rawBg){const transformed=transformValue('background-color',rawBg,scope,theme.page);const token=transformed.match(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\))/i)?.[0];if(token)bg=token;}
          for(let i=0;i<rule.style.length;i++){
            const p=rule.style.item(i),v=rule.style.getPropertyValue(p);let next=v;
            if(p.startsWith('--')){const rr=role('',p,v);if(rr){next=resolve(v,scope).replace(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\))/ig,c=>EXP.ColorEngine.transform(c,rr,theme,bg));if(next!==v)stats.variables++;}}
            else next=transformValue(p,v,scope,bg);
            if(next!==v)declarations.push(`${p}:${next}!important`);
          }
          if(declarations.length){const selector=guardSelectorText(rule.selectorText);if(selector){out.push(`${selector}{${declarations.join(';')}}`);stats.rulesGenerated++;}}
        }else if(rule.cssRules){
          const nested=[];walk(rule.cssRules,nested,scope,budget);
          const head=rule.cssText?.slice(0,rule.cssText.indexOf('{')).trim();
          if(nested.length&&/^@(media|supports|layer|container|scope)\b/i.test(head||'')){out.push(`${head}{${nested.join('')}}`);stats.groups++;}
        }
      }catch{}
    }
  }
  function processSheet(sheet,root,budget){
    const key=`${themeKey(theme)}|${signature(sheet)}|${budget}`;let css=cache.get(key);
    if(css!==undefined)stats.cacheHits++;else{stats.cacheMisses++;const out=[];walk(sheet.cssRules,out,new Map(),budget);css=out.join('\n');cache.set(key,css);if(cache.size>96)cache.delete(cache.keys().next().value);}
    let handle=handles.get(sheet);
    if(!css){handle?.remove();handles.delete(sheet);return;}
    if(!handle?.isConnected){handle=document.createElement('style');handle.dataset.expOwned='1';handle.dataset.expShiftDynamic='1';(root instanceof ShadowRoot?root:(document.head||document.documentElement)).append(handle);handles.set(sheet,handle);}
    if(handle.textContent!==css)handle.textContent=css;
  }
  function requestText(url){
    return new Promise((resolve,reject)=>{
      if(typeof GM_xmlhttpRequest!=='function')return reject(new Error('Remote stylesheet transport unavailable'));
      let settled=false,request=null;
      const finish=(fn,value)=>{
        if(settled)return;
        settled=true;
        clearTimeout(watchdog);
        fn(value);
      };
      const watchdog=setTimeout(()=>{
        try{request?.abort?.();}catch{}
        finish(reject,new Error('Stylesheet request watchdog timed out'));
      },15000);
      try{
        request=GM_xmlhttpRequest({
          method:'GET',url,timeout:12000,
          onload:r=>r.status>=200&&r.status<300
            ? finish(resolve,r.responseText)
            : finish(reject,new Error(`Stylesheet HTTP ${r.status}`)),
          onerror:()=>finish(reject,new Error('Stylesheet request failed')),
          ontimeout:()=>finish(reject,new Error('Stylesheet request timed out')),
          onabort:()=>finish(reject,new Error('Stylesheet request aborted')),
        });
      }catch(error){finish(reject,error);}
    });
  }
  function rewriteUrls(cssText,baseUrl){
    return String(cssText||'').replace(/url\(\s*(['"]?)(?!data:|blob:|https?:|\/\/|#)([^'")]+)\1\s*\)/ig,(_m,q,path)=>{
      try{return `url("${new URL(path,baseUrl).href}")`;}catch{return _m;}
    });
  }
  function parseRemote(cssText){
    const doc=document.implementation.createHTMLDocument('shift-css');
    const style=doc.createElement('style');style.textContent=cssText;doc.head.append(style);
    return style.sheet?.cssRules||[];
  }
  async function processRemoteSheet(sheet,root){
    const href=sheet.href||sheet.ownerNode?.href;
    if(!href||!/^https?:/i.test(href)){
      stats.remoteSkippedNoHref++;
      remoteLifetime.skippedNoHref++;
      return;
    }
    const key=`${href}|${themeKey(theme)}`, epoch=generation;
    if(pendingRemote.has(key))return;
    let css=remoteCache.get(key);
    if(css===undefined){
      try{
        pendingRemote.set(key,epoch);
        remoteLifetime.attempts++;
        try{remoteLifetime.hosts.add(new URL(href).hostname);}catch{}
        const source=rewriteUrls(await requestText(href),href);
        if(!active||epoch!==generation||sheet.ownerNode?.isConnected===false)return;
        const rules=parseRemote(source),out=[];
        walk(rules,out,new Map(),8000);
        css=out.join('\n');
        remoteCache.set(key,css);
        if(remoteCache.size>32)remoteCache.delete(remoteCache.keys().next().value);
        stats.remoteRules+=out.length;
        remoteLifetime.successes++;
        remoteLifetime.recoveredRules+=out.length;
        remoteLifetime.lastSuccessAt=Date.now();
      }catch(error){
        if(active&&epoch===generation){
          stats.remoteFailures++;
          remoteLifetime.failures++;
          let host='';
          try{host=new URL(href).hostname;}catch{}
          remoteLifetime.lastFailure={ at:Date.now(), host, message:String(error?.message||error||'Remote stylesheet failed') };
          EXP.Core.safeError(Object.assign(error,{code:'REMOTE_STYLESHEET'}),'shift-dynamic');
        }
        return;
      }
      finally { if(pendingRemote.get(key)===epoch)pendingRemote.delete(key); }
    }else stats.cacheHits++;
    if(!active||epoch!==generation||sheet.ownerNode?.isConnected===false)return;
    let handle=remoteHandles.get(href);
    if(!css){handle?.remove();remoteHandles.delete(href);return;}
    if(!handle?.isConnected){handle=document.createElement('style');handle.dataset.expOwned='1';handle.dataset.expShiftDynamicRemote='1';(root instanceof ShadowRoot?root:(document.head||document.documentElement)).append(handle);remoteHandles.set(href,handle);}
    if(handle.textContent!==css)handle.textContent=css;stats.remoteSheets++;
  }

  function watchStylesheetLink(link){
    if(!link||watchedLinks.has(link)||!link.matches?.('link[rel~="stylesheet"]'))return;
    watchedLinks.add(link);
    link.addEventListener('load',()=>{
      stats.stylesheetLoads++;
      if(active)schedule();
    },{once:true});
  }
  function watchStylesheetLinks(root=document){
    if(root?.nodeType===1)watchStylesheetLink(root);
    try{root?.querySelectorAll?.('link[rel~="stylesheet"]').forEach(watchStylesheetLink);}catch{}
  }

  function refresh(nextTheme){
    if(!nextTheme)return;
    if(!active){start(nextTheme);return;}
    const nextKey=themeKey(nextTheme);
    if(lastThemeKey&&lastThemeKey!==nextKey){
      generation++;pendingRemote.clear();
      for(const h of handles.values())h.remove(); handles.clear();
      for(const h of remoteHandles.values())h.remove(); remoteHandles.clear();
    }
    theme=nextTheme;lastThemeKey=nextKey;stats.runs++;stats.sheets=stats.rulesSeen=stats.rulesGenerated=stats.inaccessible=stats.remoteSheets=stats.remoteRules=stats.remoteFailures=stats.remoteSkippedNoHref=stats.variables=stats.groups=stats.shadowRoots=stats.adoptedSheets=stats.inferredVariables=stats.skippedSemanticVariables=stats.gradients=stats.layeredBackgrounds=stats.preservedImages=stats.currentColor=stats.colorMix=stats.masks=stats.filters=0;
    const roots=[document];
    const visitShadows=(root)=>{
      root.querySelectorAll?.('*').forEach(el=>{
        if(!el.shadowRoot||el.closest?.('[data-exp-owned="1"]'))return;
        roots.push(el.shadowRoot);visitShadows(el.shadowRoot);
      });
    };
    visitShadows(document);
    stats.shadowRoots=Math.max(0,roots.length-1);
    const live=new Set();
    for(const root of roots){
      watchStylesheetLinks(root);
      const normalSheets=[...(root.styleSheets||[])];
      let adopted=[];try{adopted=[...(root.adoptedStyleSheets||[])];}catch{}
      stats.adoptedSheets+=adopted.length;
      for(const sheet of [...normalSheets,...adopted]){
        if(sheet.ownerNode?.dataset?.expOwned==='1')continue;
        try{void sheet.cssRules;processSheet(sheet,root,6000);live.add(sheet);stats.sheets++;}catch{stats.inaccessible++;processRemoteSheet(sheet,root);}
      }
    }
    for(const [sheet,handle] of [...handles])if(!live.has(sheet)){handle.remove();handles.delete(sheet);}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(()=>{timer=0;if(active&&theme)refresh(theme);},100);}
  function start(nextTheme){
    if(active){refresh(nextTheme);return;}
    theme=nextTheme;active=true;refresh(theme);observer?.disconnect();
    observer=new MutationObserver(ms=>{
      let shouldSchedule=false;
      for(const mutation of ms){
        if(mutation.target?.nodeName==='STYLE')shouldSchedule=true;
        for(const node of mutation.addedNodes){
          if(node?.nodeType!==1)continue;
          watchStylesheetLinks(node);
          if(node.matches?.('style,link[rel~="stylesheet"]')||node.querySelector?.('style,link[rel~="stylesheet"]'))shouldSchedule=true;
        }
      }
      if(shouldSchedule)schedule();
    });
    observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  }
  function stop(){active=false;generation++;pendingRemote.clear();clearTimeout(timer);timer=0;observer?.disconnect();observer=null;for(const h of handles.values())h.remove();handles.clear();for(const h of remoteHandles.values())h.remove();remoteHandles.clear();lastThemeKey='';}
  function health(){return {...stats,pendingRemote:pendingRemote.size,pendingRemoteHosts:[...new Set([...pendingRemote.keys()].map(key=>{try{return new URL(key.split('|')[0]).hostname;}catch{return'';}}).filter(Boolean))].slice(0,12),remoteAttemptHosts:[...remoteLifetime.hosts].slice(0,12),remoteAttemptsLifetime:remoteLifetime.attempts,remoteSuccessesLifetime:remoteLifetime.successes,remoteFailuresLifetime:remoteLifetime.failures,remoteSkippedNoHrefLifetime:remoteLifetime.skippedNoHref,remoteRulesRecoveredLifetime:remoteLifetime.recoveredRules,lastRemoteSuccessAt:remoteLifetime.lastSuccessAt||null,lastRemoteFailure:remoteLifetime.lastFailure?{...remoteLifetime.lastFailure}:null,handles:handles.size,remoteHandles:remoteHandles.size,cacheEntries:cache.size,remoteCacheEntries:remoteCache.size};}
  return Object.freeze({start,refresh,stop,health});
})();

EXP.DynamicEngine = (() => {
  const handles = new Map();
  const remoteCache = new Map();
  const stats = { runs:0, sheets:0, rulesSeen:0, rulesGenerated:0, inaccessible:0, remoteSheets:0, remoteRules:0, remoteFailures:0, remoteSkippedNoHref:0, cacheHits:0, cacheMisses:0, variables:0, groups:0, shadowRoots:0, adoptedSheets:0, inferredVariables:0, skippedSemanticVariables:0, gradients:0, layeredBackgrounds:0, preservedImages:0, currentColor:0, colorMix:0, masks:0, filters:0, stylesheetLoads:0, slices:0, totalMs:0, maxSliceMs:0, discoverMs:0, discoverCalls:0, discoverElements:0, adoptedChecks:0, passes:0, cachedSheets:0 };
  const remoteLifetime = { attempts:0, successes:0, failures:0, skippedNoHref:0, recoveredRules:0, lastSuccessAt:0, lastFailure:null, hosts:new Set() };
  let sharedObserverCleanup=null, active=false, theme=null, lastThemeKey='', generation=0, nativeDarkMode=false;
  const pendingRemote = new Map();
  const watchedLinks = new WeakSet();
  // Roots: the document plus every shadow root seen. Each shadow root has its own observer,
  // so styles and components added inside it are noticed without rescanning the page.
  const OWNED_MARKER = '.exp-owned-sheet-marker{}';
  const SLICE_MS = 8;
  const LOCAL_BUDGET = 6000;
  let knownRoots = new WeakSet();
  let rootList = [];
  const rootObservers = new Map();
  const sheetResults = new WeakMap();   // CSSStyleSheet -> { sig, key, result }; result = { key, text, indexKey, css, constructed } (may be shared)
  const sharedResults = new Map();      // `${themeKey}|${signature}|${fullTextHash}|${budget}` -> shared result (text compared on hit)
  const SHARED_LIMIT = 512;
  const remoteOwners = new Map();       // href -> { css, constructed }
  const shadowCopies = new Map();       // ShadowRoot -> Map<sheet | href, constructed sheet>
  const fallbackStyles = new Map();     // ShadowRoot -> Map<sheet | href, <style>>
  const queue = new Set();
  let sliceHandle = null;
  const remoteWaiters = new Map();      // pending remote key -> Set<root> that need the result
  const watchedTags = new Set();        // custom element names with a whenDefined watch (page lifetime)
  let lateChecked = new WeakSet();      // defined elements already queued for a late shadow-root check (per run)
  let lateFrame = [];
  const LATE_SHADOW_MS = 250;
  const SWEEP_DELAY_MS = 500;
  let sweepTimer = 0, sweptSize = 0;

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
  const themeKey = (t) => [t.id,t.page,t.surface,t.raised,t.overlay,t.text,t.muted,t.accent,nativeDarkMode?'native-dark':'full'].join('|');
  // Core marks every stylesheet it injects (see ExtraPotionsCore.injectStyle); a constructed
  // sheet has no owner node, so the marker is an empty first rule.
  const isOwnedSheet=(sheet)=>{try{return sheet.cssRules?.[0]?.selectorText==='.exp-owned-sheet-marker';}catch{return false;}};
  const DYNAMIC_PRESERVE_GUARD = ':not(:where([data-exp-shift-preserve],[data-exp-shift-preserve] *))';
  // :host is featureless, so `:host:not(...)` never matches; the guard goes inside :host(),
  // which takes a single compound (a preserved ancestor of the host cannot be expressed there).
  // Returns null when the selector is not exactly `:host` or `:host(<compound>)`.
  function hostGuard(selector){
    const match=/^:host(?:\((.*)\))?$/is.exec(selector);
    if(!match)return null;
    const inner=match[1];
    if(inner===undefined)return ':host(:not([data-exp-shift-preserve]))';
    let depth=0;
    for(let i=0;i<inner.length;i++){
      if(inner[i]==='(')depth++;
      else if(inner[i]===')'&&--depth<0)return null;
    }
    return depth===0?`:host(${inner}:not([data-exp-shift-preserve]))`:null;
  }
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
        if(part&&!/::backdrop\b/i.test(part)){
          const pseudo=part.indexOf('::');
          const head=pseudo>=0?part.slice(0,pseudo):part,tail=pseudo>=0?part.slice(pseudo):'';
          const host=hostGuard(head);
          parts.push(host
            ? `${host}${tail}`
            : `${head}${DYNAMIC_PRESERVE_GUARD}${tail}`);
        }
        start=i+1;
      }
    }
    return parts.join(',');
  }

  function primitiveVariable(name){
    const key=String(name||'').toLowerCase();
    if(!key.startsWith('--'))return false;
    if(key.startsWith('--exp-shift-')||key.startsWith('--tw-'))return true;
    if(/^--(?:font|spacing|container|radius|shadow|drop-shadow|blur|ease|animate|aspect|leading|tracking|breakpoint)(?:-|$)/.test(key))return true;
    return /^--color-(?:black|white|slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?$/.test(key);
  }
  function role(property,name='',value=''){
    if(primitiveVariable(name))return null;
    const prop=String(property||'').toLowerCase();
    if(prop){
      if(prop==='background'||prop==='background-color')return'background';
      if(/^(?:color|text-decoration-color|caret-color|fill|stop-color|flood-color|lighting-color)$/.test(prop))return'foreground';
      if(/^(?:border(?:-(?:top|right|bottom|left))?|outline|column-rule)$/.test(prop)||/^(?:border(?:-(?:top|right|bottom|left))?-color|outline-color|column-rule-color|stroke)$/.test(prop))return'border';
      return null;
    }
    const key=String(name||'').toLowerCase();
    const semantic=/(?:success|danger|error|warning|info|brand|logo|rating|star|sale|discount|promo|price|positive|negative|favorite|heart|selected|active-state)/.test(key);
    if(semantic){stats.skippedSemanticVariables++;return null;}
    if(/background|\bbg\b|surface|canvas|panel|card|layer|container|popover|dialog|menu/.test(key))return'background';
    if(/color|text|foreground|\bfg\b|label|ink|content|fill|lighting|copy/.test(key))return'foreground';
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
  function transformLiterals(value,colorRole,background){
    const source=String(value||''),vars=[];
    const masked=source.replace(/var\([^()]*\)/g,token=>`__EXP_VAR_${vars.push(token)-1}__`);
    const next=masked.replace(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:white|black|silver|gray|grey|red|green|blue|yellow|teal|aqua)\b)/ig,color=>{
      if(nativeDarkMode&&colorRole==='background'){
        const parsed=EXP.ColorEngine.parse(color);
        if(parsed&&(parsed.a??1)>=.8&&EXP.ColorEngine.luminance(parsed)>=.72)return color;
      }
      return EXP.ColorEngine.transform(color,colorRole,theme,background);
    });
    return next.replace(/__EXP_VAR_(\d+)__/g,(_match,index)=>vars[Number(index)]||_match);
  }
  function transformValue(property,value,vars,background){
    const source=String(value||''),resolved=resolve(source,vars);
    if(/currentcolor/i.test(source)||/currentcolor/i.test(resolved)){stats.currentColor++;return value;}
    if(/color-mix\s*\(/i.test(source)||/color-mix\s*\(/i.test(resolved)){stats.colorMix++;return value;}
    const hasUrl=/url\s*\(/i.test(source),hasGradient=/(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/i.test(source);
    if(hasUrl&&!hasGradient){stats.preservedImages++;return value;}
    if(hasGradient){
      stats.gradients++;
      if(hasUrl)stats.layeredBackgrounds++;
      return transformLiterals(source,'background',background);
    }
    if(/mask(?:-image)?$/i.test(property)){stats.masks++;return value;}
    if(/^filter$/i.test(property)){
      stats.filters++;
      // Native blur, shadows and other media effects belong to the site.
      return value;
    }
    if(/shadow/i.test(property))return transformLiterals(source,'border',background);
    const r=role(property,'',resolved);if(!r)return value;
    return transformLiterals(source,r,background);
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
            if(p.startsWith('--')){const rr=role('',p,v);if(rr){next=transformLiterals(v,rr,bg);if(next!==v)stats.variables++;}}
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
  const mapFor = (maps, root) => { let map = maps.get(root); if (!map) { map = new Map(); maps.set(root, map); } return map; };
  const ownedNode = node => Boolean(node?.closest?.('[data-exp-owned="1"]'));
  const liveRoot = root => root === document || Boolean(root?.host?.isConnected);

  // Full text of a sheet, for exact identity. A <style> with text is read as written; an empty one
  // (rules inserted through CSSOM) or a constructed or <link> sheet is serialised rule by rule.
  function sheetText(sheet) {
    const owner = sheet.ownerNode;
    if (owner?.nodeName === 'STYLE') { const text = owner.textContent; if (text) return text; }
    let text = ''; for (const rule of sheet.cssRules) text += rule.cssText + '\n';
    return text;
  }
  const textHash = (text) => { let hash = 2166136261; for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(36); };

  // Identical sheets (one <style> per component instance) share one result: one walk, one css
  // string and one constructed sheet. sheetResults is the per-sheet fast path (sampled signature:
  // "has this sheet changed"); on a miss the sheet's full text is read and sharedResults is looked
  // up by theme + signature + full-text hash, sharing only when the stored text is identical.
  // Each shared result keeps its source text for that comparison (bounded by SHARED_LIMIT).
  function themedResult(sheet) {
    const sig = signature(sheet), key = themeKey(theme);
    const record = sheetResults.get(sheet);
    if (record && record.sig === sig && record.key === key) { stats.cacheHits++; return record.result; }
    const text = sheetText(sheet), indexKey = `${key}|${sig}|${textHash(text)}|${LOCAL_BUDGET}`;
    const shared = sharedResults.get(indexKey);
    if (shared && shared.text === text) { sheetResults.set(sheet, { sig, key, result: shared }); stats.cacheHits++; return shared; }
    stats.cacheMisses++;
    const out = []; walk(sheet.cssRules, out, new Map(), LOCAL_BUDGET);
    // After a theme change a result whose text is unchanged is rethemed in place, so its
    // constructed sheet (adopted by every root using it) is replaced once; other sheets with the
    // same text then hit. A result is never rewritten with a different text.
    let result = record?.result;
    if (!result || result.key === key || result.text !== text) { result = { key, text, indexKey, css: '', constructed: null }; stats.cachedSheets++; }
    else if (sharedResults.get(result.indexKey) === result) sharedResults.delete(result.indexKey);
    result.key = key; result.indexKey = indexKey; result.css = out.join('\n');
    if (result.constructed) updateConstructed(result, result.css);
    sheetResults.set(sheet, { sig, key, result });
    // A hash hit with different text keeps the existing entry; this result stays private.
    if (!shared) {
      sharedResults.set(indexKey, result);
      if (sharedResults.size > SHARED_LIMIT) sharedResults.delete(sharedResults.keys().next().value);
    }
    return result;
  }

  // Replaces a shared constructed sheet's content in place. If that fails, a fresh sheet takes
  // its place in every root adopting the old one (or, failing that, a <style> per root), so no
  // root waits for its own reprocessing with the previous theme's CSS.
  function updateConstructed(owner, css) {
    const old = owner.constructed;
    try { old.replaceSync(OWNED_MARKER + css); return; } catch {}
    let fresh = null;
    try { fresh = new CSSStyleSheet(); fresh.replaceSync(OWNED_MARKER + css); } catch { fresh = null; }
    owner.constructed = fresh;
    for (const [root, copies] of shadowCopies) {
      for (const [key, sheet] of [...copies]) {
        if (sheet !== old) continue;
        if (fresh) { try { root.adoptedStyleSheets = root.adoptedStyleSheets.map(item => item === old ? fresh : item); copies.set(key, fresh); continue; } catch {} }
        removeCopy(root, key); fallbackStyle(root, key, css);
      }
    }
  }

  function remoteOwner(href, css) {
    let owner = remoteOwners.get(href);
    if (!owner) { owner = { css: '', constructed: null }; remoteOwners.set(href, owner); }
    if (owner.constructed && owner.css !== css) updateConstructed(owner, css);
    owner.css = css;
    return owner;
  }

  function dropRemote(href) {
    handles.get(href)?.remove(); handles.delete(href);
    for (const root of new Set([...shadowCopies.keys(), ...fallbackStyles.keys()])) removeCopy(root, href);
    remoteOwners.delete(href);
  }

  function removeCopy(root, key) {
    const copy = shadowCopies.get(root)?.get(key);
    if (copy) {
      try { root.adoptedStyleSheets = root.adoptedStyleSheets.filter(sheet => sheet !== copy); } catch {}
      shadowCopies.get(root).delete(key);
    }
    const style = fallbackStyles.get(root)?.get(key);
    if (style) { style.remove(); fallbackStyles.get(root).delete(key); }
  }

  // key is the original CSSStyleSheet, or the href string for a remote sheet.
  function applyCss(root, key, css, owner) {
    if (root === document) {
      let handle = handles.get(key);
      if (!css) { handle?.remove(); handles.delete(key); return; }
      if (!handle?.isConnected) {
        handle = document.createElement('style'); handle.dataset.expOwned = '1';
        handle.dataset[typeof key === 'string' ? 'expShiftDynamicRemote' : 'expShiftDynamic'] = '1';
        (document.head || document.documentElement).append(handle); handles.set(key, handle);
      }
      if (handle.textContent !== css) handle.textContent = css;
      return;
    }
    if (!css) { removeCopy(root, key); return; }
    const fallback = mapFor(fallbackStyles, root);
    if (!fallback.has(key)) {
      try {
        if (!owner.constructed) { owner.constructed = new CSSStyleSheet(); owner.constructed.replaceSync(OWNED_MARKER + css); }
        const copies = mapFor(shadowCopies, root), previous = copies.get(key);
        let adopted = root.adoptedStyleSheets;
        if (previous && previous !== owner.constructed) adopted = adopted.filter(sheet => sheet !== previous);
        if (!adopted.includes(owner.constructed)) adopted = [...adopted, owner.constructed];
        if (adopted !== root.adoptedStyleSheets) root.adoptedStyleSheets = adopted;
        copies.set(key, owner.constructed);
        return;
      } catch {}
    }
    fallbackStyle(root, key, css);
  }

  function fallbackStyle(root, key, css) {
    const fallback = mapFor(fallbackStyles, root);
    let style = fallback.get(key);
    if (!style?.isConnected) { style = document.createElement('style'); style.dataset.expOwned = '1'; style.dataset.expShiftDynamic = '1'; root.append(style); fallback.set(key, style); }
    if (style.textContent !== css) style.textContent = css;
  }

  function pruneRoot(root, live) {
    if (root === document) {
      for (const [key, handle] of [...handles]) if (!live.has(key)) { handle.remove(); handles.delete(key); }
      return;
    }
    const keys = new Set([...(shadowCopies.get(root)?.keys() || []), ...(fallbackStyles.get(root)?.keys() || [])]);
    for (const key of keys) if (!live.has(key)) removeCopy(root, key);
  }

  function processRoot(root) {
    watchStylesheetLinks(root);
    const normal = [...(root.styleSheets || [])];
    let adopted = []; try { adopted = [...(root.adoptedStyleSheets || [])]; } catch {}
    stats.adoptedSheets += adopted.length;
    const live = new Set();
    for (const sheet of [...normal, ...adopted]) {
      if (sheet.ownerNode?.dataset?.expOwned === '1' || isOwnedSheet(sheet))continue;
      let accessible = true; try { void sheet.cssRules; } catch { accessible = false; }
      if (accessible) { const entry = themedResult(sheet); applyCss(root, sheet, entry.css, entry); live.add(sheet); stats.sheets++; }
      else { stats.inaccessible++; const href = sheet.href || sheet.ownerNode?.href; if (href) live.add(href); processRemoteSheet(sheet, root); }
    }
    pruneRoot(root, live);
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
    // Other roots using the same sheet while it is in flight wait for this request's result.
    if(pendingRemote.has(key)){remoteWaiters.get(key)?.add(root);return;}
    let css=remoteCache.get(key), targets=[root];
    if(css===undefined){
      const waiters=new Set([root]);
      try{
        pendingRemote.set(key,epoch);remoteWaiters.set(key,waiters);
        remoteLifetime.attempts++;
        try{remoteLifetime.hosts.add(new URL(href).hostname);}catch{}
        const source=rewriteUrls(await requestText(href),href);
        if(!active||epoch!==generation)return;
        targets=[...waiters];
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
      finally {
        if(pendingRemote.get(key)===epoch)pendingRemote.delete(key);
        if(remoteWaiters.get(key)===waiters)remoteWaiters.delete(key);
      }
    }else stats.cacheHits++;
    if(!active||epoch!==generation)return;
    const owner=remoteOwner(href, css);
    for(const target of targets){
      if(target===root&&sheet.ownerNode?.isConnected===false)continue;
      if(!liveRoot(target))continue;
      applyCss(target, href, css, owner); stats.remoteSheets++;
    }
  }

  function watchStylesheetLink(link){
    if(!link||watchedLinks.has(link)||!link.matches?.('link[rel~="stylesheet"]'))return;
    watchedLinks.add(link);
    link.addEventListener('load',()=>{
      stats.stylesheetLoads++;
      if(active){queue.add(link.getRootNode?.()||document);scheduleSlice();}
    },{once:true});
  }
  function watchStylesheetLinks(root=document){
    if(root?.nodeType===1)watchStylesheetLink(root);
    try{root?.querySelectorAll?.('link[rel~="stylesheet"]').forEach(watchStylesheetLink);}catch{}
  }

  // Stats scopes: resetRunStats() fields count work since the last full pass (a root processed
  // again between passes counts again); resetRunTotals() fields accumulate over one run (start to
  // stop); remoteLifetime and the *Lifetime health fields span the page's lifetime.
  function resetRunTotals() {
    stats.runs = stats.passes = stats.slices = stats.totalMs = stats.maxSliceMs = stats.discoverMs = stats.discoverCalls = stats.discoverElements = stats.adoptedChecks = stats.cacheHits = stats.cacheMisses = stats.cachedSheets = stats.stylesheetLoads = 0;
  }

  function resetRunStats() {
    stats.sheets = stats.rulesSeen = stats.rulesGenerated = stats.inaccessible = stats.remoteSheets = stats.remoteRules = stats.remoteFailures = stats.remoteSkippedNoHref = stats.variables = stats.groups = stats.shadowRoots = stats.adoptedSheets = stats.inferredVariables = stats.skippedSemanticVariables = stats.gradients = stats.layeredBackgrounds = stats.preservedImages = stats.currentColor = stats.colorMix = stats.masks = stats.filters = 0;
  }

  function registerRoot(root) {
    if (knownRoots.has(root)) return false;
    knownRoots.add(root); rootList.push(root);
    if (root !== document) {
      const watcher = new MutationObserver(records => onRootMutations(root, records));
      watcher.observe(root, { childList: true, subtree: true, characterData: true });
      rootObservers.set(root, watcher);
    }
    if (rootList.length >= 2 * Math.max(sweptSize, 64)) requestSweep();
    return true;
  }

  // Forgets a shadow root whose host left the document, taking our copies out of it first so
  // a host re-attached later (even after stop) carries nothing of ours. If the host comes back
  // while theming, the page observers see it added and it is registered and themed again.
  function releaseRoot(root) {
    if (root === document) return;
    const keys = new Set([...(shadowCopies.get(root)?.keys() || []), ...(fallbackStyles.get(root)?.keys() || [])]);
    for (const key of keys) removeCopy(root, key);
    rootObservers.get(root)?.disconnect(); rootObservers.delete(root);
    shadowCopies.delete(root); fallbackStyles.delete(root); knownRoots.delete(root); queue.delete(root);
  }

  function sweepDead() {
    const started = performance.now();
    for (const root of rootList) if (!liveRoot(root)) releaseRoot(root);
    rootList = rootList.filter(root => knownRoots.has(root));
    sweptSize = rootList.length;
    recordSlice(started);
  }

  // Removals are noticed by the page and root observers; one sweep covers a burst of them.
  function requestSweep() {
    if (sweepTimer || !active) return;
    sweepTimer = setTimeout(() => { sweepTimer = 0; if (active) sweepDead(); }, SWEEP_DELAY_MS);
  }

  // A custom element inserted before its definition gets its shadow root while upgrading,
  // which no observer reports; the definition promise is the signal to look again. Each tag is
  // watched once for the page's lifetime (across stop/start); the result acts only while active.
  function watchDefinition(tag) {
    if (watchedTags.has(tag) || typeof globalThis.customElements?.whenDefined !== 'function') return;
    watchedTags.add(tag);
    globalThis.customElements.whenDefined(tag).then(() => {
      if (!active) return;
      for (const root of [...rootList]) { try { root.querySelectorAll(tag).forEach(discoverIn); } catch {} }
      scheduleSlice();
    }, () => {});
  }

  // A defined element may attach its shadow root after insertion (in a timer or microtask), which
  // no observer reports either. Such elements are looked at again on the next frame and once
  // more about 250 ms later; one frame and one timer serve each batch, and each element is
  // checked at most once.
  function watchLateShadow(el) {
    if (lateChecked.has(el)) return;
    lateChecked.add(el); lateFrame.push(el);
    if (lateFrame.length > 1) return;
    const frame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (fn => setTimeout(fn, 16));
    frame(() => {
      const batch = lateFrame; lateFrame = [];
      if (!active) return;
      const waiting = batch.filter(node => !adoptLateShadow(node));
      if (waiting.length) setTimeout(() => { if (active) waiting.forEach(adoptLateShadow); }, LATE_SHADOW_MS);
    });
  }
  function adoptLateShadow(el) {
    if (!el.isConnected) return true;
    if (!el.shadowRoot) return false;
    if (!knownRoots.has(el.shadowRoot)) { discoverIn(el); scheduleSlice(); }
    return true;
  }

  // Registers every shadow root inside node (including nested ones) and queues them.
  function discoverIn(node) {
    stats.discoverCalls++;
    const visit = el => {
      stats.discoverElements++;
      const shadow = el.shadowRoot;
      if (!shadow) {
        const tag = el.localName;
        if (!tag?.includes('-') || ownedNode(el)) return;
        if (globalThis.customElements?.get?.(tag)) watchLateShadow(el);
        else watchDefinition(tag);
        return;
      }
      if (knownRoots.has(shadow) || ownedNode(el)) return;
      registerRoot(shadow); queue.add(shadow); discoverIn(shadow);
    };
    if (node?.nodeType === 1) visit(node);
    try { node?.querySelectorAll?.('*').forEach(visit); } catch {}
  }

  function reportError(error) {
    try { EXP.Core.safeError(error, 'shift-dynamic'); } catch {}
  }

  const addsStyles = node => node?.nodeType === 1 && (Boolean(node.matches?.('style,link[rel~="stylesheet"]')) || Boolean(node.querySelector?.('style,link[rel~="stylesheet"]')));

  // Text changes outside a <style> (tickers, chat: `.data = ` or `.textContent = `) say nothing
  // about styles; a batch made only of those is ignored entirely.
  const styleTextEdit = record => record.target?.parentNode?.nodeName === 'STYLE' && !ownedNode(record.target.parentNode);
  const textOnly = nodes => { for (const node of nodes) if (node.nodeType === 1) return false; return true; };
  const ignorable = record => record.type === 'characterData'
    ? !styleTextEdit(record)
    : record.type === 'childList' && record.target?.nodeName !== 'STYLE' && textOnly(record.addedNodes) && textOnly(record.removedNodes);
  function onRootMutations(root, records) {
    if (!active || records.every(ignorable)) return;
    const started = performance.now();
    try {
      let styled = false, removed = false;
      for (const record of records) {
        if (record.target?.nodeName === 'STYLE' && !ownedNode(record.target)) styled = true;
        // An in-place edit of a style's text node (style.firstChild.data = ...).
        if (record.type === 'characterData') {
          if (styleTextEdit(record)) styled = true;
          continue;
        }
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1 || ownedNode(node)) continue;
          discoverIn(node); watchStylesheetLinks(node);
          if (addsStyles(node)) styled = true;
        }
        for (const node of record.removedNodes) {
          if (node.nodeType !== 1 || node.dataset?.expOwned) continue;
          removed = true;
          if (addsStyles(node)) styled = true;
        }
      }
      if (styled || adoptedStale(root)) queue.add(root);
      if (removed) requestSweep();
    } catch (error) { reportError(error); }
    finally { stats.discoverMs += performance.now() - started; scheduleSlice(); }
  }

  // Components can reassign adoptedStyleSheets (dropping our copy) without a DOM mutation;
  // their next DOM change is the signal to check the adopted list again.
  function adoptedStale(root) {
    if (root === document) return false;
    stats.adoptedChecks++;
    let adopted; try { adopted = root.adoptedStyleSheets || []; } catch { return false; }
    const copies = shadowCopies.get(root), fallback = fallbackStyles.get(root);
    if (copies) for (const copy of copies.values()) if (!adopted.includes(copy)) return true;
    for (const sheet of adopted) {
      if (copies?.has(sheet) || fallback?.has(sheet) || isOwnedSheet(sheet)) continue;
      const record = sheetResults.get(sheet);
      if (!record || record.result.css) return true;
    }
    return false;
  }

  function recordSlice(started) {
    const ms = performance.now() - started;
    stats.slices++; stats.totalMs += ms; stats.maxSliceMs = Math.max(stats.maxSliceMs, ms);
  }

  function scheduleSlice() {
    if (sliceHandle || !queue.size || !active) return;
    if (typeof requestIdleCallback === 'function') { const id = requestIdleCallback(runSlice, { timeout: 200 }); sliceHandle = { cancel: () => cancelIdleCallback(id) }; }
    else { const id = setTimeout(runSlice, 0); sliceHandle = { cancel: () => clearTimeout(id) }; }
  }

  function runSlice() {
    sliceHandle = null;
    if (!active) return;
    const started = performance.now();
    let released = false;
    try {
      while (queue.size && performance.now() - started < SLICE_MS) {
        const root = queue.values().next().value; queue.delete(root);
        if (!liveRoot(root)) { releaseRoot(root); released = true; continue; }
        try { processRoot(root); } catch (error) { reportError(error); }
      }
      if (released) rootList = rootList.filter(root => knownRoots.has(root));
    } finally {
      recordSlice(started);
      scheduleSlice();
    }
  }

  // Themes the document now and queues every known shadow root.
  function fullPass() {
    resetRunStats(); stats.runs++; stats.passes++;
    sweepDead();
    const started = performance.now();
    try { processRoot(document); } catch (error) { reportError(error); }
    finally { recordSlice(started); }
    for (const root of rootList) if (root !== document) queue.add(root);
    scheduleSlice();
  }

  function refresh(nextTheme, nextOptions) {
    if (!nextTheme) return;
    if (nextOptions && Object.prototype.hasOwnProperty.call(nextOptions, 'nativeDark')) nativeDarkMode = Boolean(nextOptions.nativeDark);
    if (!active) { start(nextTheme, { nativeDark: nativeDarkMode }); return; }
    const nextKey = themeKey(nextTheme);
    if (lastThemeKey && lastThemeKey !== nextKey) {
      generation++; pendingRemote.clear(); remoteWaiters.clear();
      for (const indexKey of [...sharedResults.keys()]) if (!indexKey.startsWith(`${nextKey}|`)) sharedResults.delete(indexKey);
      // A remote copy is rethemed only once its new-theme result arrives; until then (or if that
      // fetch fails) the page is better without it than with the previous theme's colors.
      for (const href of [...remoteOwners.keys()]) if (!remoteCache.has(`${href}|${nextKey}`)) dropRemote(href);
    }
    theme = nextTheme; lastThemeKey = nextKey;
    queue.clear(); sliceHandle?.cancel(); sliceHandle = null;
    fullPass();
  }

  function start(nextTheme, nextOptions = {}) {
    nativeDarkMode = Boolean(nextOptions.nativeDark);
    if (active) { refresh(nextTheme, { nativeDark: nativeDarkMode }); return; }
    theme = nextTheme; lastThemeKey = themeKey(nextTheme); active = true;
    registerRoot(document); discoverIn(document);
    fullPass();
    sharedObserverCleanup?.(); sharedObserverCleanup = null;
    const inspectRoots = (roots, details) => {
      const started = performance.now();
      try {
        let styled = false;
        // Core reports the changed parent, not the added nodes; walking it is only worth it
        // when something was added. Details are aligned with roots.
        (roots || []).forEach((root, index) => {
          if (!root || ownedNode(root)) return;
          const detail = details?.[index], added = !detail || detail.added > 0;
          if (added) { discoverIn(root); watchStylesheetLinks(root); }
          if (root.nodeName === 'STYLE' || ((added || detail.removed > 0) && addsStyles(root))) styled = true;
        });
        if (styled) queue.add(document);
        if ((details || []).some(detail => detail?.removed)) requestSweep();
      } catch (error) { reportError(error); }
      finally { stats.discoverMs += performance.now() - started; scheduleSlice(); }
    };
    sharedObserverCleanup = ExtraPotionsCore.observePageBatch((_batch, roots, details) => inspectRoots(roots, details), {productId:'shift'});
  }

  function stop() {
    active = false; nativeDarkMode = false; generation++; pendingRemote.clear(); remoteWaiters.clear(); remoteOwners.clear();
    lateFrame = []; lateChecked = new WeakSet();
    resetRunStats(); resetRunTotals();
    sliceHandle?.cancel(); sliceHandle = null; queue.clear();
    clearTimeout(sweepTimer); sweepTimer = 0; sweptSize = 0;
    sharedObserverCleanup?.(); sharedObserverCleanup = null;
    for (const watcher of rootObservers.values()) watcher.disconnect();
    rootObservers.clear();
    for (const root of new Set([...shadowCopies.keys(), ...fallbackStyles.keys()])) {
      const keys = new Set([...(shadowCopies.get(root)?.keys() || []), ...(fallbackStyles.get(root)?.keys() || [])]);
      for (const key of keys) removeCopy(root, key);
    }
    shadowCopies.clear(); fallbackStyles.clear();
    for (const handle of handles.values()) handle.remove();
    handles.clear();
    knownRoots = new WeakSet(); rootList = []; lastThemeKey = '';
  }

  function health() {
    const handleKeys = [...handles.keys()];
    return {
      ...stats, nativeDarkMode, shadowRoots: Math.max(0, rootList.length - 1),
      pendingRemote: pendingRemote.size,
      pendingRemoteHosts: [...new Set([...pendingRemote.keys()].map(key => { try { return new URL(key.split('|')[0]).hostname; } catch { return ''; } }).filter(Boolean))].slice(0, 12),
      remoteAttemptHosts: [...remoteLifetime.hosts].slice(0, 12),
      remoteAttemptsLifetime: remoteLifetime.attempts, remoteSuccessesLifetime: remoteLifetime.successes, remoteFailuresLifetime: remoteLifetime.failures,
      remoteSkippedNoHrefLifetime: remoteLifetime.skippedNoHref, remoteRulesRecoveredLifetime: remoteLifetime.recoveredRules,
      lastRemoteSuccessAt: remoteLifetime.lastSuccessAt || null, lastRemoteFailure: remoteLifetime.lastFailure ? { ...remoteLifetime.lastFailure } : null,
      handles: handleKeys.filter(key => typeof key !== 'string').length,
      remoteHandles: handleKeys.filter(key => typeof key === 'string').length,
      // Themed results built this run; results kept from an earlier run are reused, not counted.
      cacheEntries: stats.cachedSheets, remoteCacheEntries: remoteCache.size, remoteOwners: remoteOwners.size,
      knownRoots: rootList.length,
      adoptedRoots: [...shadowCopies.values()].filter(map => map.size).length,
      fallbackRoots: [...fallbackStyles.values()].filter(map => map.size).length,
      totalMs: Math.round(stats.totalMs), maxSliceMs: Math.round(stats.maxSliceMs * 10) / 10, discoverMs: Math.round(stats.discoverMs * 10) / 10,
    };
  }
  return Object.freeze({start,refresh,stop,health});
})();

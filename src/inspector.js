// Readability inspection with reversible session bypasses and privacy-safe site rules.
EXP.Inspector = (() => {
  let selected=null, picking=false, announce=()=>{};
  const preserved=new Map();
  const savedMarks=new Map();
  function restoreSavedMarks(matches=new Set()){for(const [node,old] of savedMarks){if(matches.has(node))continue;if(node.getAttribute('data-exp-shift-preserve')==='saved'){if(old===null)node.removeAttribute('data-exp-shift-preserve');else node.setAttribute('data-exp-shift-preserve',old);}else if(preserved.get(node)==='saved'){preserved.set(node,old);}savedMarks.delete(node);}}
  function cancel(){document.removeEventListener('click',pick,true);document.removeEventListener('keydown',key,true);picking=false;}
  function key(event){if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();cancel();announce('Selection cancelled.');}}
  function pick(event){
    const node=event.composedPath().find(n=>n?.nodeType===1);
    if(!node||node.closest('[data-exp-owned="1"]'))return;
    event.preventDefault();event.stopImmediatePropagation();cancel();
    if(node===document.body||node===document.documentElement){announce('Select a text or content element instead of the page root.');return;}
    selected=node;announce('Element selected.');
  }
  function select(notify){cancel();announce=notify;document.addEventListener('click',pick,true);document.addEventListener('keydown',key,true);picking=true;notify('Select an element on the page. Escape cancels.');}
  function preserve(){if(!selected?.isConnected)return;if(!preserved.has(selected))preserved.set(selected,selected.getAttribute('data-exp-shift-preserve'));selected.setAttribute('data-exp-shift-preserve','inspector');EXP.LiveResolver.restoreElement(selected);}
  const escape = value => globalThis.CSS?.escape ? CSS.escape(value) : String(value).replace(/[^a-z0-9_-]/gi, character => `\\${character}`);
  function selectorFor(node){
    if(!node?.matches)return '';
    if(node.id){const selector=`#${escape(node.id)}`;try{if(document.querySelectorAll(selector).length===1)return selector;}catch{}}
    for(const name of ['data-testid','data-test','data-component-type']){const value=node.getAttribute(name);if(!value||value.length>120)continue;const selector=`${node.localName}[${name}="${String(value).replace(/["\\]/g,'\\$&')}"]`;try{if(document.querySelectorAll(selector).length===1)return selector;}catch{}}
    const parts=[];let current=node;
    while(current&&current!==document.body&&parts.length<5){let part=current.localName;if(!part)break;const stable=[...current.classList].filter(value=>/^[a-z][a-z0-9_-]{1,48}$/i.test(value)&&!/[0-9a-f]{8,}/i.test(value)).slice(0,2);if(stable.length)part+=stable.map(value=>`.${escape(value)}`).join('');else{const siblings=[...current.parentElement?.children||[]].filter(item=>item.localName===current.localName);if(siblings.length>1)part+=`:nth-of-type(${siblings.indexOf(current)+1})`;}parts.unshift(part);const selector=parts.join(' > ');try{if(document.querySelectorAll(selector).length===1)return selector;}catch{}current=current.parentElement;}
    return parts.join(' > ');
  }
  function savedSelectors(){return EXP.Settings.snapshot().siteOverrides?.[location.hostname]?.preservedSelectors||[];}
  function applySaved(){const effective=EXP.Settings.effective();if(effective.excluded||effective.safeMode||ExtraPotionsCore.suiteSitePaused()){restoreSavedMarks();return;}const matches=new Set();for(const selector of savedSelectors()){try{for(const node of document.querySelectorAll(selector))matches.add(node);}catch{}}restoreSavedMarks(matches);for(const node of matches){if(node.getAttribute('data-exp-shift-preserve')!=='inspector'){if(!savedMarks.has(node))savedMarks.set(node,node.getAttribute('data-exp-shift-preserve'));node.setAttribute('data-exp-shift-preserve','saved');}EXP.LiveResolver.restoreElement(node);}}
  function saveSelected(){const selector=selectorFor(selected);if(!selector)return false;const state=EXP.Settings.snapshot();const site={...(state.siteOverrides[location.hostname]||{})};site.preservedSelectors=[...new Set([...(site.preservedSelectors||[]),selector])].slice(0,100);EXP.Settings.replace({...state,siteOverrides:{...state.siteOverrides,[location.hostname]:site}},'element-rescue-save');applySaved();return selector;}
  function clearSaved(){const state=EXP.Settings.snapshot();const site={...(state.siteOverrides[location.hostname]||{})};delete site.preservedSelectors;EXP.Settings.replace({...state,siteOverrides:{...state.siteOverrides,[location.hostname]:site}},'element-rescue-clear');restoreSavedMarks();EXP.LiveResolver.scan();}
  function resume(){for(const [node,old] of preserved){if(node.getAttribute('data-exp-shift-preserve')!=='inspector')continue;if(old===null)node.removeAttribute('data-exp-shift-preserve');else node.setAttribute('data-exp-shift-preserve',old);}preserved.clear();EXP.LiveResolver.scan();}
  function createControls(onSelected){
    const card=document.createElement('details');card.style.cssText='border:1px solid var(--theme-line);border-radius:7px;padding:7px;margin-top:8px';
    const title=document.createElement('summary');title.textContent='Inspect readability';const output=document.createElement('p');output.style.whiteSpace='pre-wrap';output.setAttribute('role','status');
    function show(message=''){let text=message;if(selected?.isConnected){const data=EXP.LiveResolver.inspectElement(selected);text+='\n'+data.tag+' · '+EXP.Engine.health().mode+'\nText: '+data.foreground+'\nBackground: '+data.background+'\nFont: '+data.font+'\n'+(data.repairs.length?data.repairs.map(r=>r.property+': '+r.original+' → '+r.current).join('\n'):'No SHIFT-owned inline repairs on this element.');}output.textContent=text;}
    function button(text,fn){const b=document.createElement('button');b.type='button';b.className='life-btn action';b.textContent=text;b.addEventListener('click',fn);return b;}
    const note=document.createElement('p');note.textContent='Select a page element to inspect it, bypass it for this session, or preserve its original appearance on this site. Saved rules contain a structural selector only; page text is not stored.';
    card.append(title,note,button('Select page element',()=>select(message=>{show(message);if(!picking)onSelected?.();})),button('Refresh inspection',()=>show()),button('Temporarily bypass selected element',()=>{preserve();show('Session bypass applied.');}),button('Preserve selected element on this site',()=>{const selector=saveSelected();show(selector?`Saved site rule: ${selector}`:'Choose a stable page element first.');}),button('Clear saved element rules for this site',()=>{clearSaved();show('Saved element rules removed.');}),button('Resume session bypasses',()=>{resume();show('Session bypasses removed.');}),button('Cancel selection',()=>{cancel();show('Selection cancelled.');}),output);
    card.addEventListener('toggle',()=>{if(card.open)show();});return card;
  }
  function destroy(){cancel();resume();restoreSavedMarks();selected=null;announce=()=>{};}
  return Object.freeze({createControls,destroy,select,preserve,resume,cancel,applySaved,selectorFor});
})();

// Read-only inspection except for an explicit, reversible local repair bypass.
EXP.Inspector = (() => {
  let selected=null, picking=false, announce=()=>{};
  const preserved=new Map();
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
  function resume(){for(const [node,old] of preserved){if(node.getAttribute('data-exp-shift-preserve')!=='inspector')continue;if(old===null)node.removeAttribute('data-exp-shift-preserve');else node.setAttribute('data-exp-shift-preserve',old);}preserved.clear();EXP.LiveResolver.scan();}
  function createControls(onSelected){
    const card=document.createElement('details');card.style.cssText='border:1px solid var(--theme-line);border-radius:7px;padding:7px;margin-top:8px';
    const title=document.createElement('summary');title.textContent='Inspect readability';const output=document.createElement('p');output.style.whiteSpace='pre-wrap';output.setAttribute('role','status');
    function show(message=''){let text=message;if(selected?.isConnected){const data=EXP.LiveResolver.inspectElement(selected);text+='\n'+data.tag+' · '+EXP.Engine.health().mode+'\nText: '+data.foreground+'\nBackground: '+data.background+'\nFont: '+data.font+'\n'+(data.repairs.length?data.repairs.map(r=>r.property+': '+r.original+' → '+r.current).join('\n'):'No SHIFT-owned inline repairs on this element.');}output.textContent=text;}
    function button(text,fn){const b=document.createElement('button');b.type='button';b.className='life-btn action';b.textContent=text;b.addEventListener('click',fn);return b;}
    const note=document.createElement('p');note.textContent='The bypass restores SHIFT-owned inline repairs on the selected subtree and excludes it from further styling until resumed or reloaded. Inherited parent colors and site changes may still apply. Page text is not saved.';
    card.append(title,note,button('Select page element',()=>select(message=>{show(message);if(!picking)onSelected?.();})),button('Refresh inspection',()=>show()),button('Temporarily bypass selected element',()=>{preserve();show('Local bypass applied.');}),button('Resume all inspected elements',()=>{resume();show('Local bypasses removed.');}),button('Cancel selection',()=>{cancel();show('Selection cancelled.');}),output);
    card.addEventListener('toggle',()=>{if(card.open)show();});return card;
  }
  function destroy(){cancel();resume();selected=null;announce=()=>{};}
  return Object.freeze({createControls,destroy,select,preserve,resume,cancel});
})();

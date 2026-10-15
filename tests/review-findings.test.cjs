'use strict';
// Cases from the 2026-10 Crimson review of real sites, rebuilt as small pages.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const script=fs.readFileSync(path.join(__dirname,'../shift.user.js'),'utf8');

function measure(selectors){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const context=canvas.getContext('2d');
  const rgba=c=>{context.clearRect(0,0,1,1);context.fillStyle=c;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].map(n=>n/255);};
  const ch=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4,lum=c=>.2126*ch(c[0])+.7152*ch(c[1])+.0722*ch(c[2]);
  const ratio=(a,b)=>{const x=lum(rgba(a)),y=lum(rgba(b));return Math.round((Math.max(x,y)+.05)/(Math.min(x,y)+.05)*100)/100;};
  const background=el=>{for(let node=el;node;node=node.parentElement){const bg=getComputedStyle(node).backgroundColor;if(rgba(bg)[3]>.5)return bg;}return 'rgb(255,255,255)';};
  return Object.fromEntries(Object.entries(selectors).map(([key,sel])=>{const el=document.querySelector(sel),cs=getComputedStyle(el),bg=background(el);return [key,{color:cs.color,background:bg,fill:cs.fill,ratio:ratio(cs.color,bg)}];}));
}
async function themed(t,url,html){
  const browser=await chromium.launch();t.after(()=>browser.close());
  const page=await browser.newPage();
  await page.addInitScript(()=>{const saved=new Map([['exp:v3:shift:settings',{theme:'crimson'}]]);window.GM_getValue=(k,f)=>saved.get(k)||f;window.GM_setValue=(k,v)=>saved.set(k,v);window.GM_xmlhttpRequest=()=>{};});
  await page.route('**/*',route=>route.fulfill({contentType:'text/html',body:html}));
  await page.goto(url);
  await page.addScriptTag({content:script});
  await page.waitForFunction(()=>document.documentElement.getAttribute('data-exp-shift')==='crimson');
  await page.waitForTimeout(1200);
  return page;
}

test('a cart count badge stays readable on its own fill',async t=>{
  const page=await themed(t,'https://www.walmart.com/',`<!doctype html><html><head><style>
    :root{--ld-yellow:#ffc220;--ld-gray:#2e2f32}
    body{margin:0;background:#fff;color:var(--ld-gray);font:16px sans-serif}header{background:#0071dc;padding:8px;color:#fff}
    .ld_A{color:var(--ld-yellow)}.ld_B{color:var(--ld-yellow)}.ld_D{color:var(--ld-yellow)}.ld_E{color:var(--ld-gray)}
    .ld_W{background-color:var(--ld-yellow)}.ld_C{color:var(--ld-gray)}
    .ld_S{display:inline-block;min-width:16px;padding:2px 4px;border-radius:9px;font-size:12px;font-weight:700}
  </style></head><body><header><a href="/cart" style="color:#fff">Cart <span class="ld_C ld_W ld_S cart-badge-redesigned">1</span></a> <span class="ld_A">Deals</span></header><main><p class="ld_B">Rollback</p><p class="ld_D">Flash</p><p class="ld_E">Shop</p></main></body></html>`);
  const {badge}=await page.evaluate(measure,{badge:'.cart-badge-redesigned'});
  assert.ok(badge.ratio>=4.5,'cart count contrast '+badge.ratio+': '+JSON.stringify(badge));
});

test('a two-color logo keeps its colors while a one-color icon still adapts',async t=>{
  const page=await themed(t,'https://www.bbc.com/news',`<!doctype html><html><head><style>
    body{margin:0;background:#fff;color:#141414;font:16px sans-serif}
    .logo-mark rect{fill:#000}.logo-mark path{fill:#fff}.search-icon path{fill:#141414}
  </style></head><body><header><a href="https://www.bbc.com/" aria-label="BBC Homepage"><svg class="logo-mark" viewBox="0 0 84 24" width="84" height="24"><rect width="24" height="24"/><path d="M6 6h12v12H6z"/></svg></a>
  <button aria-label="Search"><svg class="search-icon" viewBox="0 0 24 24" width="24" height="24"><path d="M2 2h20v20H2z"/></svg></button></header><main><p>News</p></main></body></html>`);
  const result=await page.evaluate(()=>({square:getComputedStyle(document.querySelector('.logo-mark rect')).fill,letter:getComputedStyle(document.querySelector('.logo-mark path')).fill,icon:getComputedStyle(document.querySelector('.search-icon path')).fill}));
  assert.equal(result.square,'rgb(0, 0, 0)','the logo square stays black: '+JSON.stringify(result));
  assert.equal(result.letter,'rgb(255, 255, 255)','the logo letter stays white: '+JSON.stringify(result));
  assert.notEqual(result.icon,'rgb(20, 20, 20)','a one-color interface icon still adapts to the dark page: '+JSON.stringify(result));
});

test('a logo with dark lettering beside its mark stays visible on the dark page',async t=>{
  const page=await themed(t,'https://www.youtube.com/',`<!doctype html><html><head><style>
    body{margin:0;background:#fff;color:#0f0f0f;font:16px sans-serif}header{background:#fff;padding:8px}.yt-logo .letters{fill:#282828}
  </style></head><body><header><a href="/" title="YouTube Home"><svg class="yt-logo" viewBox="0 0 90 20" width="90" height="20"><rect class="play" width="28" height="20" rx="4" fill="#ff0000"/><path class="triangle" d="M11 6l7 4-7 4z" fill="#ffffff"/><path class="letters" d="M34 4h50v12H34z"/></svg></a></header><main><p>Videos</p></main></body></html>`);
  const result=await page.evaluate(()=>{
    const letters=document.querySelector('.yt-logo .letters');let bg='rgb(255, 255, 255)';
    for(let node=letters.closest('svg').parentElement;node;node=node.parentElement){const value=getComputedStyle(node).backgroundColor;if(!/rgba\(0, 0, 0, 0\)|transparent/.test(value)){bg=value;break;}}
    return {letters:getComputedStyle(letters).fill,bg};
  });
  const ratio=await page.evaluate(({a,b})=>{const c=document.createElement('canvas').getContext('2d');const rgb=v=>{c.clearRect(0,0,1,1);c.fillStyle=v;c.fillRect(0,0,1,1);return [...c.getImageData(0,0,1,1).data].slice(0,3).map(n=>n/255);};const ch=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4,l=x=>.2126*ch(x[0])+.7152*ch(x[1])+.0722*ch(x[2]);const x=l(rgb(a)),y=l(rgb(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);},{a:result.letters,b:result.bg});
  assert.ok(ratio>=3,'the logo lettering stays visible: '+ratio.toFixed(2)+' '+JSON.stringify(result));
});

test('a theme chosen in another tab reaches a tab that is already open',async t=>{
  const browser=await chromium.launch();t.after(()=>browser.close());
  const page=await browser.newPage();
  await page.addInitScript(()=>{
    const saved=new Map([['exp:v3:shift:settings',{theme:'crimson'}]]);window.__valueListeners=[];
    window.GM_getValue=(k,f)=>saved.has(k)?saved.get(k):f;window.GM_setValue=(k,v)=>saved.set(k,v);window.GM_xmlhttpRequest=()=>{};
    window.GM_addValueChangeListener=(k,fn)=>{window.__valueListeners.push([k,fn]);return window.__valueListeners.length;};
    // Another tab saves a new choice: the manager stores it and tells this tab, with remote=true.
    window.__remoteSave=(k,v)=>{const before=saved.get(k);saved.set(k,v);for(const [key,fn] of window.__valueListeners)if(key===k)fn(k,before,v,true);};
  });
  await page.route('**/*',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="background:#fff;color:#111"><p>Article</p></body></html>'}));
  await page.goto('https://en.wikipedia.org/wiki/Color');
  await page.addScriptTag({content:script});
  await page.waitForFunction(()=>document.documentElement.getAttribute('data-exp-shift')==='crimson');
  const settingsKey=await page.evaluate(()=>window.__valueListeners.map(([k])=>k).find(k=>/shift:settings$/.test(k)));
  assert.ok(settingsKey,'SHIFT listens for settings saved in other tabs');
  const other=await page.evaluate(()=>GM_getValue('exp:v3:shift:settings'));
  const amethyst=JSON.parse(JSON.stringify(other));
  const setTheme=(value,theme)=>{for(const p of value.profiles||[])if(p.appearance)p.appearance.theme=theme;if('theme' in value)value.theme=theme;return value;};
  await page.evaluate(([k,v])=>window.__remoteSave(k,v),[settingsKey,setTheme(amethyst,'amethyst')]);
  await page.waitForFunction(()=>document.documentElement.getAttribute('data-exp-shift')==='amethyst',null,{timeout:3000});
});

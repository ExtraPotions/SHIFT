'use strict';
// Reddit chat (dark mode) paints its surfaces with neutrally named near-black variables such as
// --color-tone-7, reached through component aliases. SHIFT used to read those names as text colors and
// lighten them, painting the whole chat in the theme's text color. How a variable is used decides its role.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const script=fs.readFileSync(path.join(__dirname,'../shift.user.js'),'utf8');
const html=`<!doctype html><html class="theme-beta theme-dark"><head><style>
.theme-dark{--color-tone-1:#d7dadc;--color-tone-2:#818384;--color-tone-6:#1a1a1b;--color-tone-7:#121213;--color-neutral-background:#0E1113;color-scheme:dark}
body{margin:0;background:var(--color-neutral-background);color:var(--color-tone-1)}
</style></head><body><rs-app></rs-app><script>
const sheet=new CSSStyleSheet();
sheet.replaceSync(':host{display:block;--rs-surface:var(--color-tone-7);--rs-row:var(--color-tone-6);--rs-text:var(--color-tone-1);--rs-muted:var(--color-tone-2);background-color:var(--rs-surface);color:var(--rs-text);min-height:300px}.row{background:var(--rs-row)}.time{color:var(--rs-muted)}');
customElements.define('rs-app',class extends HTMLElement{connectedCallback(){if(this.shadowRoot)return;const root=this.attachShadow({mode:'open'});root.adoptedStyleSheets=[sheet];root.innerHTML='<a class="row"><span class="name">Room name</span> <span class="time">2h</span></a><p class="msg">Message</p>';}});
</script></body></html>`;

function measure(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const context=canvas.getContext('2d');
  const rgba=c=>{context.clearRect(0,0,1,1);context.fillStyle=c;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].map(n=>n/255);};
  const ch=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4,lum=c=>.2126*ch(c[0])+.7152*ch(c[1])+.0722*ch(c[2]);
  const ratio=(a,b)=>{const x=lum(rgba(a)),y=lum(rgba(b));return Math.round((Math.max(x,y)+.05)/(Math.min(x,y)+.05)*100)/100;};
  const app=document.querySelector('rs-app'),root=app.shadowRoot,cs=n=>getComputedStyle(n);
  const appBg=cs(app).backgroundColor,rowBg=cs(root.querySelector('.row')).backgroundColor;
  return {appBg,rowBg,appLum:Math.round(lum(rgba(appBg))*1000)/1000,rowLum:Math.round(lum(rgba(rowBg))*1000)/1000,
    msg:ratio(cs(root.querySelector('.msg')).color,appBg),name:ratio(cs(root.querySelector('.name')).color,rowBg),time:ratio(cs(root.querySelector('.time')).color,rowBg)};
}

for(const theme of ['amethyst','midnight'])test(`Reddit chat surfaces stay dark and readable under ${theme}`,async t=>{
  const browser=await chromium.launch();t.after(()=>browser.close());
  const page=await browser.newPage({colorScheme:'dark'});
  await page.addInitScript(theme=>{const saved=new Map([['exp:v3:shift:settings',{theme}]]);window.GM_getValue=(k,f)=>saved.get(k)||f;window.GM_setValue=(k,v)=>saved.set(k,v);window.GM_xmlhttpRequest=()=>{};},theme);
  await page.route('**/*',route=>route.fulfill({contentType:'text/html',body:html}));
  await page.goto('https://www.reddit.com/chat/room/fixture');
  await page.addScriptTag({content:script});
  await page.waitForFunction(()=>document.documentElement.hasAttribute('data-exp-shift'));
  await page.waitForTimeout(1500);
  const result=await page.evaluate(measure);
  assert.ok(result.appLum<.2&&result.rowLum<.2,'chat surfaces stay dark: '+JSON.stringify(result));
  for(const key of ['msg','name','time'])assert.ok(result[key]>=4.5,`${key} contrast ${result[key]}: ${JSON.stringify(result)}`);
});

// The real page defines its tones in a cross-origin stylesheet SHIFT fetches and rewrites before the chat
// components load, and uses --color-tone-7 mostly, not only, as a background.
const remoteCss=`.theme-dark{--color-tone-1:#d7dadc;--color-tone-2:#818384;--color-tone-6:#1a1a1b;--color-tone-7:#121213;--color-neutral-background:#0E1113;color-scheme:dark}
body{margin:0;background:var(--color-neutral-background);color:var(--color-tone-1)}
.content{background:var(--color-tone-7)}.modal{background-color:var(--color-tone-7)}.disabled-label{color:var(--color-tone-7)}`;
const lateHtml=`<!doctype html><html class="theme-beta theme-dark"><head><link rel="stylesheet" href="https://www.redditstatic.com/shreddit/theme.css"></head><body><rs-app></rs-app><script>
setTimeout(()=>{
const sheet=new CSSStyleSheet();
sheet.replaceSync(':host{display:block;background-color:var(--color-tone-7);color:var(--color-tone-1);min-height:300px}.row{display:block;background-color:var(--color-tone-7)}.row.selected{background-color:var(--color-tone-6)}.time{color:var(--color-tone-2)}');
customElements.define('rs-app',class extends HTMLElement{connectedCallback(){if(this.shadowRoot)return;const root=this.attachShadow({mode:'open'});root.adoptedStyleSheets=[sheet];root.innerHTML='<a class="row selected"><span class="name">Room name</span> <span class="time">2h</span></a><p class="msg">Message</p>';}});
},800);
</script></body></html>`;

for(const theme of ['crimson','amethyst'])test(`Reddit chat stays dark under ${theme} when its tones come from a fetched stylesheet and the chat loads later`,async t=>{
  const browser=await chromium.launch();t.after(()=>browser.close());
  const page=await browser.newPage({colorScheme:'dark'});
  await page.addInitScript(([theme,css])=>{const saved=new Map([['exp:v3:shift:settings',{theme}]]);window.GM_getValue=(k,f)=>saved.get(k)||f;window.GM_setValue=(k,v)=>saved.set(k,v);
    window.GM_xmlhttpRequest=o=>{setTimeout(()=>o.onload({status:200,responseText:/theme\.css/.test(o.url)?css:''}),50);return{abort(){}};};},[theme,remoteCss]);
  await page.route('https://www.redditstatic.com/**',route=>route.fulfill({contentType:'text/css',body:remoteCss}));
  await page.route('https://www.reddit.com/**',route=>route.fulfill({contentType:'text/html',body:lateHtml}));
  await page.goto('https://www.reddit.com/chat/room/fixture');
  await page.addScriptTag({content:script});
  await page.waitForFunction(()=>document.documentElement.hasAttribute('data-exp-shift'));
  await page.waitForTimeout(2500);
  const result=await page.evaluate(measure);
  assert.ok(result.appLum<.2&&result.rowLum<.2,'chat surfaces stay dark: '+JSON.stringify(result));
  for(const key of ['msg','name','time'])assert.ok(result[key]>=4.5,`${key} contrast ${result[key]}: ${JSON.stringify(result)}`);
});

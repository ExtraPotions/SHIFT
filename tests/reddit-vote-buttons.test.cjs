'use strict';
// Reddit colors its gray button text with --color-secondary-onBackground (black in light mode). The name says
// "background", but the value is the text drawn on a background, so SHIFT must lighten it like any text color.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const script=fs.readFileSync(path.join(__dirname,'../shift.user.js'),'utf8');
const html=`<!doctype html><html class="theme-light theme-rpl"><head><style>
:root,.theme-light{--color-secondary-onBackground:#000000;--color-secondary-background:#E5EBEE;--color-secondary-plain:#181C1F;--color-neutral-background:#FFFFFF;--color-neutral-content:#333D42}
.theme-rpl{--color-button-secondary-text:var(--color-secondary-onBackground);--color-button-secondary-background:var(--color-secondary-background)}
body{background:var(--color-neutral-background);color:var(--color-neutral-content)}
</style></head><body><main><p>Post title</p><x-post></x-post></main><script>
customElements.define('x-post',class extends HTMLElement{connectedCallback(){if(this.shadowRoot)return;this.attachShadow({mode:'open'}).innerHTML=\`<style>
.button-secondary{--button-color-text-default:var(--color-button-secondary-text);--button-color-background-default:var(--color-button-secondary-background)}
.group{display:inline-flex;align-items:center;border-radius:999px;background-color:var(--button-color-background-default)}
button{color:var(--button-color-text-default);background:transparent;border:0}
.rpl-vote-button-group.button-secondary{--vote-button-label-color:var(--color-secondary-plain)}
.label{color:var(--vote-button-label-color)}
</style><span class="group rpl-vote-button-group button-secondary"><button upvote aria-label="Upvote">▲</button><span class="label">5</span><button downvote aria-label="Downvote">▼</button></span>\`;}});
</script></body></html>`;

function contrasts(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const context=canvas.getContext('2d');
  const rgba=color=>{context.clearRect(0,0,1,1);context.fillStyle=color;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].map(n=>n/255);};
  const channel=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
  const light=c=>.2126*channel(c[0])+.7152*channel(c[1])+.0722*channel(c[2]);
  const root=document.querySelector('x-post').shadowRoot,surface=rgba(getComputedStyle(root.querySelector('.group')).backgroundColor);
  return Object.fromEntries(['button[upvote]','.label','button[downvote]'].map(selector=>{
    const one=light(rgba(getComputedStyle(root.querySelector(selector)).color)),two=light(surface);
    return [selector,Math.round((Math.max(one,two)+.05)/(Math.min(one,two)+.05)*100)/100];
  }));
}

for(const theme of ['midnight','obsidian'])test(`Reddit vote buttons stay readable under ${theme}`,async t=>{
  const browser=await chromium.launch();t.after(()=>browser.close());
  const page=await browser.newPage();
  await page.addInitScript(theme=>{const saved=new Map([['exp:v3:shift:settings',{theme}]]);window.GM_getValue=(key,fallback)=>saved.get(key)||fallback;window.GM_setValue=(key,value)=>saved.set(key,value);window.GM_xmlhttpRequest=()=>{};},theme);
  await page.route('**/*',route=>route.fulfill({contentType:'text/html',body:html}));
  await page.goto('https://www.reddit.com/');
  await page.addScriptTag({content:script});
  await page.waitForFunction(()=>document.documentElement.hasAttribute('data-exp-shift'));
  await page.waitForFunction(()=>getComputedStyle(document.body).backgroundColor!=='rgb(255, 255, 255)');
  await page.waitForTimeout(500);
  const result=await page.evaluate(contrasts);
  for(const [selector,ratio] of Object.entries(result))assert.ok(ratio>=4.5,`${selector} contrast ${ratio} against the vote pill (${JSON.stringify(result)})`);
});

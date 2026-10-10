'use strict';
// Link visibility gives plain links the accent color. A link styled as a button (anime.nexus' "Watch Now",
// a light zinc pill with dark text) keeps the site's text color: the accent on its own light fill was 1.84:1.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const script=fs.readFileSync(path.join(__dirname,'../shift.user.js'),'utf8');
const html=`<!doctype html><html class="dark"><head><style>
:root{color-scheme:dark}body{margin:0;background:#09090b;color:#fafafa;font:16px sans-serif}
:root{--primary:oklch(0.92 0.004 286.32);--primary-foreground:oklch(0.21 0.006 285.885)}.bg-primary{background-color:var(--primary)}.text-primary-foreground{color:var(--primary-foreground)}
</style></head><body><main><p>Read the <a class="plain" href="#a">plain link</a> here.</p>
<a class="watch group/button inline-flex bg-primary text-primary-foreground" href="#w">Watch Now</a>
<a class="btn shop bg-primary text-primary-foreground" href="#s">Shop</a>
<a class="slot bg-primary text-primary-foreground" data-slot="button" href="#d">Details</a></main></body></html>`;

function measure(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const context=canvas.getContext('2d');
  const rgba=c=>{context.clearRect(0,0,1,1);context.fillStyle=c;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].map(n=>n/255);};
  const ch=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4,lum=c=>.2126*ch(c[0])+.7152*ch(c[1])+.0722*ch(c[2]);
  const ratio=(a,b)=>{const x=lum(rgba(a)),y=lum(rgba(b));return Math.round((Math.max(x,y)+.05)/(Math.min(x,y)+.05)*100)/100;};
  const accent=getComputedStyle(document.documentElement).getPropertyValue('--exp-shift-accent').trim();
  const row=sel=>{const el=document.querySelector(sel),cs=getComputedStyle(el);return {color:cs.color,background:cs.backgroundColor,ratio:ratio(cs.color,cs.backgroundColor==='rgba(0, 0, 0, 0)'?getComputedStyle(document.body).backgroundColor:cs.backgroundColor)};};
  const probe=document.createElement('i');probe.style.color=accent;document.body.append(probe);const accentColor=getComputedStyle(probe).color;probe.remove();
  return {accentColor,plain:row('.plain'),watch:row('.watch'),shop:row('.shop'),slot:row('.slot')};
}

test('links styled as buttons keep their own readable text while plain links get the accent',async t=>{
  const browser=await chromium.launch();t.after(()=>browser.close());
  const page=await browser.newPage({colorScheme:'dark'});
  await page.addInitScript(()=>{const saved=new Map([['exp:v3:shift:settings',{theme:'crimson'}]]);window.GM_getValue=(k,f)=>saved.get(k)||f;window.GM_setValue=(k,v)=>saved.set(k,v);window.GM_xmlhttpRequest=()=>{};});
  await page.route('**/*',route=>route.fulfill({contentType:'text/html',body:html}));
  await page.goto('https://anime.nexus/');
  await page.addScriptTag({content:script});
  await page.waitForFunction(()=>document.documentElement.hasAttribute('data-exp-shift'));
  await page.waitForTimeout(1200);
  const result=await page.evaluate(measure);
  assert.equal(result.plain.color,result.accentColor,'plain links still get the accent: '+JSON.stringify(result));
  for(const key of ['watch','shop','slot']){
    assert.notEqual(result[key].color,result.accentColor,`${key} keeps its own text color: ${JSON.stringify(result)}`);
    assert.ok(result[key].ratio>=4.5,`${key} contrast ${result[key].ratio}: ${JSON.stringify(result)}`);
  }
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const script=fs.readFileSync(path.join(__dirname,'../shift.user.js'),'utf8');
for(const native of [false,true]){
 test(`document-start preload does not become native theme evidence (native=${native})`,async t=>{
  const browser=await chromium.launch();t.after(()=>browser.close());
  const page=await browser.newPage({colorScheme:'dark'});
  await page.addInitScript(()=>{
   window.GM_getValue=(k,d)=>k==='exp:v3:shift:settings'?{theme:'midnight',accent:'midnight-default',surfaceLevel:'off'}:d;
   window.GM_setValue=()=>{};window.GM_xmlhttpRequest=()=>{};
  });
  await page.route('https://baseline.test/**',async r=>{
   const url=new URL(r.request().url());
   if(url.pathname==='/shift.js')return r.fulfill({contentType:'text/javascript',body:script});
   if(url.pathname==='/late.css')return r.fulfill({contentType:'text/css',body:'.late-card{background:#fff;color:#111}'});
   return r.fulfill({contentType:'text/html',body:`<!doctype html><html><head><script src="/shift.js"></script><style>${native?'html{color-scheme:dark;background:#121212}':''}body{margin:0;background:${native?'#121212':'white'};color:${native?'white':'#111'}}.card{height:250px;background:${native?'#181818':'white'}}.spacer{height:1800px}</style></head><body><div class="card">First</div><div class="spacer"></div><div class="card" id="late">Later</div></body></html>`});
  });
  await page.goto('https://baseline.test/');
  await page.waitForFunction(()=>document.documentElement.hasAttribute('data-exp-shift')&&!document.querySelector('#exp-shift-preload'));
  const body=await page.locator('body').evaluate(n=>getComputedStyle(n).backgroundColor);
  assert.equal(body,native?'rgb(18, 18, 18)':'rgb(5, 10, 18)','native classification must use the site, not Preload paint');
  await page.locator('#late').scrollIntoViewIfNeeded();
  await page.evaluate(()=>{const link=document.createElement('link');link.rel='stylesheet';link.href='/late.css';document.head.append(link)});
  await page.waitForTimeout(400);
  assert.equal(await page.locator('body').evaluate(n=>getComputedStyle(n).backgroundColor),body,'scroll and stylesheet recheck retain the correct mode');
  if(native)assert.equal(await page.locator('#late').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(24, 24, 24)');
  else assert.notEqual(await page.locator('#late').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(255, 255, 255)');
 });
}

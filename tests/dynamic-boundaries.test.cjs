'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const source=['themes.js','color-engine.js','dynamic-engine.js'].map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
async function fixture(t){const browser=await chromium.launch();t.after(()=>browser.close());const page=await browser.newPage();await page.setContent('<main>Fixture</main>');await page.addScriptTag({content:`const EXP={Core:{safeError(){}}};${source};window.expTest=EXP;`});return page;}
test('large first stylesheet cannot starve later Amazon-sized stylesheet groups',async t=>{
 const page=await fixture(t);
 const result=await page.evaluate(()=>{
  const first=document.createElement('style');first.textContent=Array.from({length:6001},(_,i)=>`.first${i}{background-color:#fff}`).join('');document.head.append(first);
  const later=document.createElement('style');later.textContent='.late-order-card{background-color:#fff;color:#111}';document.head.append(later);
  expTest.DynamicEngine.start(expTest.Themes.resolve('midnight','site-default'));
  return {covered:[...document.querySelectorAll('[data-exp-shift-dynamic]')].some(n=>n.textContent.includes('.late-order-card')),health:expTest.DynamicEngine.health()};
 });assert.equal(result.covered,true,JSON.stringify(result.health));
});
test('late remote stylesheet response cannot revive a stopped theme or overwrite a newer palette',async t=>{
 const page=await fixture(t);
 await page.route('https://styles.test/**',r=>r.fulfill({contentType:'text/css',body:'.remote{color:#111;background:#fff}'}));
 await page.evaluate(async()=>{window.responses=[];window.GM_xmlhttpRequest=o=>responses.push(o);const l=document.createElement('link');l.rel='stylesheet';l.href='https://styles.test/a.css';document.head.append(l);await new Promise(r=>l.onload=r);expTest.DynamicEngine.start(expTest.Themes.resolve('midnight','site-default'));});
 await page.evaluate(()=>{expTest.DynamicEngine.stop();responses[0].onload({status:200,responseText:'.remote{color:#111;background:#fff}'});});
 assert.equal(await page.locator('[data-exp-shift-dynamic-remote]').count(),0);
 await page.evaluate(()=>{expTest.DynamicEngine.start(expTest.Themes.resolve('midnight','site-default'));expTest.DynamicEngine.refresh(expTest.Themes.resolve('ember','site-default'));responses.at(-2).onload({status:200,responseText:'.stale-only{color:#111}'});responses.at(-1).onload({status:200,responseText:'.current-only{color:#111}'});});
 const css=await page.locator('[data-exp-shift-dynamic-remote]').allTextContents();assert.equal(css.length,1);assert.match(css[0],/current-only/);assert.doesNotMatch(css[0],/stale-only/);
});

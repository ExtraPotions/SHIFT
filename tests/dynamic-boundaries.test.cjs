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


test('remote stylesheet telemetry survives refresh resets and reports pending/failure state',async t=>{
 const page=await fixture(t);
 await page.route('https://styles.test/**',r=>r.fulfill({contentType:'text/css',body:'.remote{color:#111;background:#fff}'}));
 const result=await page.evaluate(async()=>{
  window.requests=[];
  window.GM_xmlhttpRequest=o=>requests.push(o);
  const l=document.createElement('link');l.rel='stylesheet';l.href='https://styles.test/fail.css';document.head.append(l);
  await new Promise(r=>l.onload=r);
  expTest.DynamicEngine.start(expTest.Themes.resolve('midnight','site-default'));
  const pending=expTest.DynamicEngine.health();
  requests.at(-1).onerror();
  await new Promise(r=>setTimeout(r,0));
  const failed=expTest.DynamicEngine.health();
  expTest.DynamicEngine.refresh(expTest.Themes.resolve('midnight','site-default'));
  const refreshed=expTest.DynamicEngine.health();
  return {pending,failed,refreshed};
 });
 assert.ok(result.pending.pendingRemote>=1,JSON.stringify(result.pending));
 assert.equal(result.failed.remoteFailuresLifetime,1);
 assert.equal(result.failed.lastRemoteFailure.host,'styles.test');
 assert.match(result.failed.lastRemoteFailure.message,/failed/i);
 assert.equal(result.refreshed.remoteFailuresLifetime,1);
 assert.equal(result.refreshed.lastRemoteFailure.host,'styles.test');
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
test('scrolling reaches contrast repairs beyond a long page scan limit and stops cleanly',async t=>{
 const browser=await chromium.launch();t.after(()=>browser.close());const page=await browser.newPage();
 await page.setContent('<main>'+('<span style="display:block;height:20px">Filler</span>'.repeat(3000))+'<div id="late" style="height:100px;background:#fff;color:#fff"><span>Late content</span></div></main>');
 const source=['themes.js','color-engine.js','site-fixes.js','live-resolver.js'].map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
 await page.addScriptTag({content:`const EXP={};${source};window.expTest=EXP;EXP.LiveResolver.start(EXP.Themes.resolve('midnight','site-default'));`});
 assert.equal(await page.locator('#late').getAttribute('data-exp-shift-live'),null);
 await page.locator('#late').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('#late').hasAttribute('data-exp-shift-live'),null,{timeout:3000});
 assert.notEqual(await page.locator('#late').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(255, 255, 255)');
 const passes=await page.evaluate(()=>{expTest.LiveResolver.stop();return expTest.LiveResolver.health().passes;});
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(160);
 assert.equal(await page.evaluate(()=>expTest.LiveResolver.health().passes),passes);
 assert.equal(await page.locator('#late').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(255, 255, 255)');
});

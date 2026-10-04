'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),files=['core.js','settings.js','themes.js','color-engine.js','site-fixes.js','live-resolver.js'];
const runtime=fs.readFileSync(path.join(root,'vendor/exp-core/exp-core.js'),'utf8')+'\nconst EXP={};'+files.map(f=>fs.readFileSync(path.join(root,'src',f),'utf8')).join('\n')+';window.EXP=EXP;';
test('SHIFT suspends a repeatedly failing live repair pass and retries one pass',async t=>{const browser=await chromium.launch();t.after(()=>browser.close());const page=await browser.newPage();await page.route('**/*',r=>r.fulfill({body:'<html><body><main>Fixture</main></body></html>',contentType:'text/html'}));await page.goto('https://example.test/');await page.addScriptTag({content:runtime});
 const data=await page.evaluate(async()=>{EXP.Settings.load();let calls=0;const remove=EXP.LiveResolver.addProcessor(()=>{calls++;throw Error('fixture');});EXP.LiveResolver.start(EXP.Themes.resolve('ember'));EXP.LiveResolver.fullScan();EXP.LiveResolver.fullScan();const before=calls;EXP.LiveResolver.fullScan();const held=EXP.LiveResolver.health().recovery;remove();await EXP.LiveResolver.retry();return{held,before,after:calls,recovered:EXP.LiveResolver.health().recovery};});
 assert.equal(data.held.suspended,true);assert.equal(data.after,data.before);assert.equal(data.recovered.suspended,false);
});

'use strict';
// Each inline write dirties style, so the next computed-style read forces a recalc. On large pages
// that recalc is expensive; a repair pass reads first and applies its writes together at the end.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
test('a repair pass forces a bounded number of style recalcs and still repairs every card',async t=>{
 const browser=await chromium.launch();t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width:1280,height:2400}});
 // Site stylesheets paint these cards; inline style attributes go through ColorEngine.inspectInline, which writes immediately.
 const card='<section class="card"><p>Card <a href="#">link</a> <span>meta</span></p><button>Go</button></section>';
 await page.setContent('<style>.card{background:#fff;color:#ddd;padding:4px}.card p{color:#eee}.card button{background:#fafafa;color:#eee}</style><main>'+card.repeat(40)+'</main>');
 const source=fs.readFileSync(path.join(__dirname,'../vendor/exp-core/exp-core.js'),'utf8')+'\n'+['themes.js','color-engine.js','site-fixes.js','live-resolver.js'].map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
 await page.addScriptTag({content:`const EXP={};${source};window.expTest=EXP;`});
 const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
 const recalcs=async()=>(await cdp.send('Performance.getMetrics')).metrics.find(metric=>metric.name==='RecalcStyleCount').value;
 await page.evaluate(()=>document.body.offsetHeight);
 const before=await recalcs();
 await page.evaluate(()=>expTest.LiveResolver.start(expTest.Themes.resolve('midnight','site-default')));
 const forced=await recalcs()-before;
 const facts=await page.evaluate(()=>{
  // Passes repair the viewport band (innerHeight + 240px).
  const cards=[...document.querySelectorAll('.card')].filter(card=>card.getBoundingClientRect().top<=innerHeight+240);
  return {cards:cards.length,repaired:cards.filter(card=>getComputedStyle(card).backgroundColor!=='rgb(255, 255, 255)'&&card.hasAttribute('data-exp-shift-live')).length,resolved:expTest.LiveResolver.health().resolved};
 });
assert.equal(facts.repaired,facts.cards,'every card surface in the viewport band is repaired and marked');
 assert.ok(facts.cards>=20&&facts.resolved>=facts.cards,'many cards are in view and repairs are still counted');
 assert.ok(forced<=12,`one pass forces a bounded number of style recalcs (saw ${forced} for ${facts.resolved} repairs)`);
});
// No public path reaches applyWrites outside a pass today, so this test exposes the internals
// (test-only source patch) to pin that landing writes outside a pass leaves batching off.
test('landing writes outside a pass does not leave later writes batched',async t=>{
 const browser=await chromium.launch();t.after(()=>browser.close());
 const page=await browser.newPage();
 await page.setContent('<main><section class="card">Card</section></main>');
 const resolver=fs.readFileSync(path.join(__dirname,'../src/live-resolver.js'),'utf8');
 const exposed=resolver.replace('return Object.freeze({retry,','return Object.freeze({testApplyWrites:applyWrites,testWrite:write,retry,');
 assert.notEqual(exposed,resolver,'test hook inserted');
 const source=fs.readFileSync(path.join(__dirname,'../vendor/exp-core/exp-core.js'),'utf8')+'\n'+['themes.js','color-engine.js','site-fixes.js'].map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n')+'\n'+exposed;
 await page.addScriptTag({content:`const EXP={};${source};window.expTest=EXP;`});
 const value=await page.evaluate(()=>{
  expTest.LiveResolver.start(expTest.Themes.resolve('midnight','site-default'));
  expTest.LiveResolver.testApplyWrites();
  const card=document.querySelector('.card');
  expTest.LiveResolver.testWrite(card,'outline-color','rgb(1, 2, 3)');
  return card.style.getPropertyValue('outline-color');
 });
 assert.equal(value,'rgb(1, 2, 3)');
});

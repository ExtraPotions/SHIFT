'use strict';
// A pass looks for visible candidates across the whole document. On Reddit most candidates are off
// screen, and checking computed style and presentation state before geometry cost seconds per scroll.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
test('a repair pass reads computed style only for candidates near the viewport',async t=>{
 const browser=await chromium.launch();t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width:1000,height:800}});
 const card='<section class="card"><p>Card <a href="#">link</a></p></section>';
 await page.setContent('<style>.card{background:#fff;color:#ddd;height:60px}</style><main>'+card.repeat(2000)+'</main>');
 const source=fs.readFileSync(path.join(__dirname,'../vendor/exp-core/exp-core.js'),'utf8')+'\n'+['themes.js','color-engine.js','site-fixes.js','live-resolver.js'].map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
 await page.addScriptTag({content:`const EXP={};${source};window.expTest=EXP;`});
 const facts=await page.evaluate(()=>{
  let reads=0;const original=window.getComputedStyle;
  window.getComputedStyle=function(...args){reads+=1;return original.apply(this,args);};
  expTest.LiveResolver.start(expTest.Themes.resolve('midnight','site-default'));
  window.getComputedStyle=original;
  const near=[...document.querySelectorAll('.card')].filter(card=>card.getBoundingClientRect().top<=innerHeight+240);
  return {reads,near:near.length,repaired:near.filter(card=>card.hasAttribute('data-exp-shift-live')).length};
 });
 assert.equal(facts.repaired,facts.near,'cards near the viewport are still repaired');
 assert.ok(facts.reads<facts.near*40,`computed-style reads: ${facts.reads} for ${facts.near} cards in view`);
});

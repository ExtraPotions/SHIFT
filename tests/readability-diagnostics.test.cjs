'use strict';
// Core's diagnostics carry a readability scan so a washed-out page can be diagnosed from Copy Diagnostics or
// Report a Problem alone, without DevTools. The scan never copies page text.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const script=fs.readFileSync(path.join(__dirname,'../shift.user.js'),'utf8');
const html=`<style>body{background:#fff;color:#111}</style><main><p>Readable heading</p><x-card data-exp-shift-preserve></x-card></main>
<div class="veil" data-exp-shift-preserve style="position:fixed;inset:0;background:rgba(255,255,255,.6);pointer-events:none"></div>
<script>customElements.define('x-card',class extends HTMLElement{connectedCallback(){if(this.shadowRoot)return;this.attachShadow({mode:'open'}).innerHTML='<p class="ghost" style="color:#fafafa;background:#fff">secret message text</p>';}});</script>`;

async function report(t){
  const browser=await chromium.launch();t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width:1200,height:800}});
  await page.route('https://fixture.test/**',route=>route.fulfill({contentType:'text/html',body:html}));
  await page.goto('https://fixture.test/');await page.addScriptTag({content:script});await page.waitForSelector('#exp-shift-root',{state:'attached'});
  const root=page.locator('#exp-shift-root');
  await root.locator('.launcher').click();
  await root.locator('[data-exp-section-tab="system"]').click();
  await root.getByRole('tab',{name:'Support',exact:true}).click();
  await root.getByRole('button',{name:'Show Diagnostics',exact:true}).click();
  return JSON.parse(await root.locator('.diag').textContent());
}

test('diagnostics list the hardest-to-read text, including inside shadow roots, without page text',async t=>{
  const {readability}=await report(t);
  assert.ok(readability,'report has a readability section');
  assert.ok(readability.scanned>0);
  const ghost=readability.worst.find(row=>/ghost/.test(row.cls));
  assert.ok(ghost,'the unreadable shadow-root paragraph is listed: '+JSON.stringify(readability.worst.slice(0,3)));
  assert.equal(ghost.host,'x-card');
  assert.ok(ghost.ratio<1.5,'ratio '+ghost.ratio);
  assert.match(ghost.color,/^rgb/);assert.match(ghost.background,/^rgb/);
  assert.ok(ghost.textLength>0);
  assert.deepEqual(readability.worst.map(row=>row.ratio),[...readability.worst.map(row=>row.ratio)].sort((a,b)=>a-b),'sorted hardest first');
  assert.ok(readability.worst.length<=25);
  assert.doesNotMatch(JSON.stringify(readability),/secret|message text|Readable heading/,'no page text is copied');
});

test('diagnostics describe what covers the page, including click-through overlays',async t=>{
  const {readability}=await report(t);
  const veil=readability.overlays.find(layer=>/veil/.test(layer.cls));
  assert.ok(veil,'the page overlay is listed: '+JSON.stringify(readability.overlays));
  assert.equal(veil.background,'rgba(255, 255, 255, 0.6)');
  assert.equal(veil.pointerEvents,'none');
  assert.equal(veil.coverage,1);
  assert.ok(readability.points.length===3&&readability.points.every(point=>point.chain.length>0),'sample points describe the element under them');
});

'use strict';
const test=require('node:test'), assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const script=fs.readFileSync(path.join(__dirname,'../shift.user.js'),'utf8');
async function fixture(t){
  const browser=await chromium.launch();t.after(()=>browser.close());const page=await browser.newPage();
  await page.route('https://fixture.test/**',r=>r.fulfill({contentType:'text/html',body:`<style>body{background:white;color:#111}.information-layout{background:transparent}.alert-success,.alert-danger{background:#eee;color:#111}</style><main><table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Value</td></tr></tbody></table><div class="alert-success"><span>Saved</span></div><div class="alert-danger"><span>Failed</span></div><div class="information-layout">Layout</div><div id="owned" data-exp-owned="1"><button style="background:rgb(21,32,43);color:rgb(220,230,240)">Other product</button></div><div data-exp-shift-preserve><code id="preserved" style="background:rgb(12,23,34)">Media label</code></div><button id="control">Action</button><input value="Original"><pre>Code</pre></main>`}));
  await page.goto('https://fixture.test/');await page.addScriptTag({content:script});await page.waitForSelector('#exp-shift-root',{state:'attached'});
  await page.locator('#exp-shift-root .launcher').click();await page.locator('#exp-shift-root [data-route="appearance"]').click();
  await page.locator('#exp-shift-root .exp-theme-swatch[aria-label="Midnight"]').click();
  return page;
}
test('component theme distinguishes table headings, state messages and controls without repainting unrelated information classes',async t=>{
  const page=await fixture(t);
  const css=()=>page.evaluate(()=>{const read=s=>{const c=getComputedStyle(document.querySelector(s));return {bg:c.backgroundColor,fg:c.color}};return {head:read('th'),cell:read('td'),success:read('.alert-success'),successText:read('.alert-success span'),danger:read('.alert-danger'),layout:read('.information-layout'),owned:read('#owned button'),preserved:read('#preserved'),button:read('#control')};});
  const before=await css();assert.notEqual(before.head.bg,before.cell.bg);assert.notEqual(before.success.bg,before.danger.bg);assert.equal(before.success.fg,before.successText.fg);assert.equal(before.layout.bg,'rgba(0, 0, 0, 0)');assert.equal(before.owned.bg,'rgb(21, 32, 43)');assert.equal(before.preserved.bg,'rgb(12, 23, 34)');
  await page.locator('#control').hover();assert.notEqual((await css()).button.bg,before.button.bg);
  await page.evaluate(()=>{const row=document.querySelector('thead tr');row.insertAdjacentHTML('beforeend','<th id="late">Late header</th>');});
  assert.equal(await page.locator('#late').evaluate(n=>getComputedStyle(n).backgroundColor),before.head.bg);
  await page.locator('#exp-shift-root .exp-theme-swatch[aria-label="Ember"]').click();assert.notEqual((await css()).head.bg,before.head.bg);
});
test('Original and Safe Mode restore component role styling',async t=>{
  const page=await fixture(t);
  await page.locator('#exp-shift-root [data-route="system"]').click();await page.locator('#exp-shift-root [aria-label="Safe Mode"]').click();
  assert.equal(await page.locator('.alert-success').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(238, 238, 238)');
  await page.locator('#exp-shift-root [aria-label="Safe Mode"]').click();
  await page.locator('#exp-shift-root [data-route="appearance"]').click();
  await page.locator('#exp-shift-root button').filter({hasText:/^Hold to Show Original$/}).dispatchEvent('pointerdown');
  assert.equal(await page.locator('.alert-success').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(238, 238, 238)');
});
test('live contrast repair starts when leaving Original and resumes after Safe Mode',async t=>{
 const page=await fixture(t);
 await page.locator('#exp-shift-root [data-route="system"]').click();
 const active=async()=>{
  await page.locator('#exp-shift-root').getByRole('button',{name:'Show Diagnostics',exact:true}).click();
  const report=JSON.parse(await page.locator('#exp-shift-root .diag').textContent());
  await page.locator('#exp-shift-root').getByRole('button',{name:'Hide Diagnostics',exact:true}).click();
  return report.mode.liveResolver.active;
 };
 assert.equal(await active(),true);
 await page.locator('#exp-shift-root [aria-label="Safe Mode"]').click();assert.equal(await active(),false);
 await page.locator('#exp-shift-root [aria-label="Safe Mode"]').click();assert.equal(await active(),true);
});

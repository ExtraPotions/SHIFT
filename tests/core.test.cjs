'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const coreSource = fs.readFileSync(path.resolve(__dirname, '../vendor/exp-core/exp-core.js'), 'utf8') + '\n' + fs.readFileSync(path.resolve(__dirname, '../src/core.js'), 'utf8');

test('Core lifecycle is ordered, idempotent, and independently testable', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><head></head><body></body></html>');
  await page.addScriptTag({ content: `const EXP={};${coreSource};window.testCore=EXP.Core;window.calls=[];` });
  const result = await page.evaluate(async () => {
    const product = testCore.register({ id: 'test-product', version: '1.0.0', capabilities: ['lifecycle'] }, {
      initialize: () => calls.push('initialize'), enable: () => calls.push('enable'), disable: () => calls.push('disable'), cleanup: () => calls.push('cleanup')
    });
    await product.initialize(); await product.initialize(); await product.enable(); await product.enable(); await product.disable(); await product.cleanup(); await product.cleanup();
    return { calls, state: product.state, snapshot: testCore.diagnosticSnapshot(), coordinator: document.querySelector('[data-exp-core-coordinator="1"]')?.dataset.protocol };
  });
  assert.deepEqual(result.calls, ['initialize', 'enable', 'disable', 'cleanup']);
  assert.equal(result.state, 'cleaned');
  assert.equal(result.coordinator, 'exp-core-coordination-v1');
  assert.equal(result.snapshot.products[0].id, 'test-product');
});

test('Core rejects unknown capabilities before partial initialization', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ content: `const EXP={};${coreSource};window.testCore=EXP.Core;` });
  const message = await page.evaluate(() => { try { testCore.register({ id: 'bad', version: '1.0.0', capabilities: ['missing'] }, {}); } catch (error) { return `${error.code}:${error.message}`; } });
  assert.match(message, /^CAPABILITY_MISSING:/);
});

test('Core negotiation preserves newer compatible versions and isolates incompatible protocols', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ content: `const EXP={};${coreSource};window.testCore=EXP.Core;` });
  const results = await page.evaluate(() => [testCore.negotiate('4.0.0'), testCore.negotiate('2.9.9'), testCore.negotiate(testCore.VERSION), testCore.negotiate('9.0.0', 'foreign-protocol')]);
  assert.deepEqual(results.map((item) => item.selection), ['peer-newer', 'local-newer', 'equal', 'isolated']);
  assert.equal(results[3].compatible, false);
});

test('injectStyle paints through adopted stylesheets when inline style tags are forbidden', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src scryfall.com *.scryfall.com"></head><body><div id="probe">Hello</div></body></html>');
  await page.evaluate(new Function(`const EXP={};${coreSource};window.testCore=EXP.Core;`));
  const result = await page.evaluate(() => {
    const probe = document.getElementById('probe');
    const node = testCore.injectStyle(document, '#probe{color:rgb(12, 34, 56)!important}', { expShiftPageStyle: '1' });
    node.id = 'exp-shift-page-style';
    const painted = { color: getComputedStyle(probe).color, text: node.textContent, adopted: document.adoptedStyleSheets.length };
    node.remove();
    return { ...painted, restored: getComputedStyle(probe).color, leftover: document.adoptedStyleSheets.length };
  });
  assert.equal(result.color, 'rgb(12, 34, 56)');
  assert.match(result.text, /#probe/);
  assert.ok(result.adopted >= 1);
  assert.notEqual(result.restored, 'rgb(12, 34, 56)');
  assert.equal(result.leftover, result.adopted - 1);
});

test('injectStyle falls back and still paints when adoptedStyleSheets assignment is ignored', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><head></head><body><div id="probe">Hello</div></body></html>');
  await page.evaluate(new Function(`const EXP={};${coreSource};window.testCore=EXP.Core;`));
  const result = await page.evaluate(() => {
    Object.defineProperty(document, 'adoptedStyleSheets', {
      configurable: true,
      get() { return []; },
      set() {}
    });
    const probe = document.getElementById('probe');
    testCore.injectStyle(document, '#probe{color:rgb(9, 8, 7)!important}', { expShiftPageStyle: '1' });
    return getComputedStyle(probe).color;
  });
  assert.equal(result, 'rgb(9, 8, 7)');
});

test('injectStyle paints through the page window when unsafeWindow is present', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src scryfall.com *.scryfall.com"></head><body><div id="probe">Hello</div></body></html>');
  await page.evaluate(new Function(`const EXP={};${coreSource};window.testCore=EXP.Core;window.unsafeWindow=window;`));
  const result = await page.evaluate(() => {
    const probe = document.getElementById('probe');
    testCore.injectStyle(document, '#probe{color:rgb(4, 5, 6)!important}', { expShiftPageStyle: '1' });
    return getComputedStyle(probe).color;
  });
  assert.equal(result, 'rgb(4, 5, 6)');
});

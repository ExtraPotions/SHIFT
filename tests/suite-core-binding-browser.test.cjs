'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const script = fs.readFileSync(path.resolve(__dirname, '../shift.user.js'), 'utf8');

async function themedPage(t, head = '') {
  const browser = await chromium.launch({ headless: true }); t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const saved = new Map([['exp:v3:shift:settings', { theme: 'ember', accent: 'ember-default' }]]);
    window.GM_getValue = (key, fallback) => saved.has(key) ? saved.get(key) : fallback;
    window.GM_setValue = (key, value) => saved.set(key, value);
    window.GM_xmlhttpRequest = () => {};
  });
  const html = `<!doctype html><html><head>${head}<style>body{background:#fff;color:#111}.card{background-color:#fff;color:#111}</style></head><body><main><section class="card">Card</section></main></body></html>`;
  await page.route('https://suite.test/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: html }));
  await page.goto('https://suite.test/fixture');
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  return { page, errors };
}

const dynamicCss = (page) => page.evaluate(() => [...document.querySelectorAll('style[data-exp-shift-dynamic]')].map((node) => node.textContent).join('\n'));

test('shipped SHIFT bundle publishes suite state and leads the shared page observer when alone', async (t) => {
  const { page, errors } = await themedPage(t);
  await page.waitForFunction(() => document.querySelector('meta[data-exp-suite-state-product="shift"]'));
  const state = await page.evaluate(() => JSON.parse(document.querySelector('meta[data-exp-suite-state-product="shift"]').dataset.expSuiteStatePayload));
  assert.deepEqual({ ...state, theme: undefined }, { active: true, theme: undefined, safeMode: false, excluded: false });
  assert.match(state.theme, /^[a-z0-9][a-z0-9._:-]*$/u);
  assert.notEqual(state.theme, 'original');
  assert.equal(await page.evaluate(() => document.querySelector('meta[data-exp-page-observer]')?.dataset.expPageObserver), 'shift');
  assert.equal(await page.evaluate(() => typeof globalThis.ExtraPotionsCore), 'undefined');
  assert.deepEqual(errors, []);
});

test('SHIFT leaves WARD-hidden surfaces unrepaired', async (t) => {
  const { page, errors } = await themedPage(t);
  await page.evaluate(() => {
    const surface = (id) => `<section id="${id}" style="display:block;width:420px;height:120px;background:#fff;color:#111">Bright panel <a href="#x">link</a></section>`;
    document.querySelector('main').insertAdjacentHTML('beforeend', `${surface('control')}<div id="warded" data-exp-presentation-state='{"ward":{"visibility":"hide"}}'>${surface('inside')}</div>`);
  });
  await page.waitForFunction(() => document.querySelector('#control[data-exp-shift-live]'), null, { timeout: 3000 });
  assert.equal(await page.locator('#warded [data-exp-shift-live], #warded[data-exp-shift-live]').count(), 0);
  assert.deepEqual(errors, []);
});

test('SHIFT themes a late stylesheet from another product\'s shared page batch', async (t) => {
  // Another suite product already leads the page observer, so SHIFT must not start its own.
  const { page, errors } = await themedPage(t, '<meta data-exp-page-observer="ward" data-exp-page-observer-protocol="exp-page-observer-v1" data-exp-page-observer-epoch="0">');
  await page.waitForFunction(() => document.querySelector('style[data-exp-shift-dynamic]'));
  await page.evaluate(() => {
    const late = document.createElement('style');
    late.textContent = '.late-card{background-color:#fff;color:#111}';
    document.head.append(late);
  });
  await page.waitForTimeout(400);
  assert.doesNotMatch(await dynamicCss(page), /late-card/u, 'nothing announced the new stylesheet yet');

  await page.evaluate(() => {
    const detail = JSON.stringify({ protocol: 'exp-page-observer-v1', owner: 'ward', epoch: 1, rootIndex: 0, rootCount: 1, types: ['childList'], added: 1, removed: 0, href: location.href, at: Date.now() });
    for (const phase of ['observe', 'classify', 'visibility', 'theme']) {
      document.head.dispatchEvent(new CustomEvent(`exp-core:page-phase:${phase}`, { bubbles: true, composed: true, detail }));
      document.dispatchEvent(new CustomEvent(`exp-core:page-phase-end:${phase}`, { detail: JSON.stringify({ protocol: 'exp-page-observer-v1', owner: 'ward', epoch: 1, phase, rootCount: 1, href: location.href, at: Date.now() }) }));
    }
  });
  await page.waitForFunction(() => [...document.querySelectorAll('style[data-exp-shift-dynamic]')].some((node) => node.textContent.includes('.late-card')), null, { timeout: 3000 });
  assert.deepEqual(errors, []);
});

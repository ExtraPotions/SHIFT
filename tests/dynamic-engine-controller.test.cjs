'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { loadSource } = require('./load-source.cjs');

// The theme controller drives the dynamic engine; this loads the readable full build.
test('a native recheck at window load keeps every component themed throughout', async t => {
  const browser = await chromium.launch(); t.after(() => browser.close());
  const page = await browser.newPage();
  await page.addInitScript(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, value);
    window.GM_xmlhttpRequest = () => ({ abort() {} });
  });
  await page.setContent('<!doctype html><html><head><style>body{background:#fff;color:#111}</style></head><body><main id="feed"></main></body></html>');
  await page.evaluate(() => {
    window.ownedSheet = sheet => { try { return sheet.cssRules[0]?.selectorText === '.exp-owned-sheet-marker'; } catch { return false; } };
    window.copies = () => [...document.querySelectorAll('shift-post')].map(post => post.shadowRoot.adoptedStyleSheets.filter(ownedSheet).length);
    const sheet = new CSSStyleSheet(); sheet.replaceSync('.inner{background:#ffffff;color:#1c1c1c}');
    customElements.define('shift-post', class extends HTMLElement {
      connectedCallback() { if (this.shadowRoot) return; const shadow = this.attachShadow({ mode: 'open' }); shadow.adoptedStyleSheets = [sheet]; shadow.innerHTML = '<div class="inner">Post</div>'; }
    });
    for (let i = 0; i < 20; i++) document.getElementById('feed').append(document.createElement('shift-post'));
  });
  await page.addScriptTag({ content: loadSource().replace('\nbootOnce();', '\nwindow.testShift=EXP;bootOnce();') });
  await page.waitForFunction(() => window.testShift?.Engine);
  await page.evaluate(() => testShift.Engine.apply({ ...testShift.Settings.effective(), theme: 'midnight', excluded: false, safeMode: false }));
  await page.waitForFunction(() => copies().every(count => count === 1), null, { timeout: 5000 });
  const facts = await page.evaluate(async () => {
    const before = testShift.Engine.health().nativeRechecks;
    let minimum = Infinity;
    const timer = setInterval(() => { minimum = Math.min(minimum, ...copies()); }, 10);
    // A 10 ms sampler can miss a copy that is dropped and re-adopted between ticks, so every
    // write to a component's adoptedStyleSheets is checked as well.
    const descriptor = Object.getOwnPropertyDescriptor(ShadowRoot.prototype, 'adoptedStyleSheets');
    Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', { ...descriptor, set(value) { if (this.host?.localName === 'shift-post') minimum = Math.min(minimum, [...value].filter(ownedSheet).length); descriptor.set.call(this, value); } });
    window.dispatchEvent(new Event('load'));
    await new Promise(resolve => setTimeout(resolve, 1000));
    clearInterval(timer);
    Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', descriptor);
    return { minimum, rechecks: testShift.Engine.health().nativeRechecks - before };
  });
  assert.ok(facts.rechecks >= 1, `recheck ran: ${JSON.stringify(facts)}`);
  assert.equal(facts.minimum, 1, JSON.stringify(facts));
});

// Native darkness only feeds the menu's explanation. Re-applying the theme for every stylesheet that
// loads after the page has loaded restarted the live resolver: up to 630 ms per load on Reddit.
// The dynamic engine and the live resolver follow stylesheet loads on their own.
test('a stylesheet that loads after the page has loaded does not re-apply the theme', async t => {
  const browser = await chromium.launch(); t.after(() => browser.close());
  const page = await browser.newPage();
  await page.addInitScript(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, value);
    window.GM_xmlhttpRequest = () => ({ abort() {} });
  });
  await page.setContent('<!doctype html><html><head><style>body{background:#fff;color:#111}</style></head><body><main><section class="card" style="background:#fff;color:#111;height:200px">Card</section></main></body></html>');
  await page.addScriptTag({ content: loadSource().replace('\nbootOnce();', '\nwindow.testShift=EXP;bootOnce();') });
  await page.waitForFunction(() => window.testShift?.Engine);
  await page.evaluate(() => testShift.Engine.apply({ ...testShift.Settings.effective(), theme: 'midnight', excluded: false, safeMode: false }));
  await page.waitForTimeout(400);
  const facts = await page.evaluate(async () => {
    const before = testShift.Engine.health();
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'data:text/css,'; document.head.append(link);
    link.dispatchEvent(new Event('load'));
    await new Promise(resolve => setTimeout(resolve, 800));
    const after = testShift.Engine.health();
    return { rechecks: after.nativeRechecks - before.nativeRechecks, applies: after.applies - before.applies, themed: document.documentElement.getAttribute('data-exp-shift') };
  });
  assert.equal(facts.rechecks, 0, JSON.stringify(facts));
  assert.equal(facts.applies, 0, JSON.stringify(facts));
  assert.equal(facts.themed, 'midnight');
});

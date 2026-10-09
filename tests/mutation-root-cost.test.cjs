'use strict';
// The live resolver queues each added node as its own root. Core's shared page batch reports only
// mutation targets (the parent), so routing child-list work through it would re-scan a whole feed
// for every appended item: about 1150 layout reads instead of 4 for this fixture.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const script = fs.readFileSync(path.resolve(__dirname, '../shift.user.js'), 'utf8');
const items = Array.from({ length: 500 }, (_, index) => `<article style="display:block;height:40px;background:#fff;color:#111">Item ${index} <a href="#">link</a></article>`).join('');
const html = `<!doctype html><html><head><style>body{background:#fff;color:#111}</style></head><body><main id="feed">${items}</main></body></html>`;

test('appending one item to a long feed repairs only that item', async (t) => {
  const browser = await chromium.launch({ headless: true }); t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  await page.addInitScript(() => {
    const saved = new Map([['exp:v3:shift:settings', { theme: 'ember', accent: 'ember-default' }]]);
    window.GM_getValue = (key, fallback) => saved.has(key) ? saved.get(key) : fallback;
    window.GM_setValue = (key, value) => saved.set(key, value);
    window.GM_xmlhttpRequest = () => {};
    window.__layoutReads = 0;
    const read = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () { window.__layoutReads += 1; return read.call(this); };
  });
  await page.route('https://feed.test/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: html }));
  await page.goto('https://feed.test/');
  await page.addScriptTag({ content: script });
  await page.waitForFunction(() => document.querySelector('#feed article[data-exp-shift-live]'));
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    window.__layoutReads = 0;
    const item = document.createElement('article');
    item.id = 'new-item';
    item.style.cssText = 'display:block;height:40px;background:#fff;color:#111';
    item.textContent = 'New item';
    document.querySelector('#feed').prepend(item);
  });
  await page.waitForFunction(() => document.querySelector('#new-item[data-exp-shift-live]'), null, { timeout: 3000 });
  await page.waitForTimeout(500);
  const reads = await page.evaluate(() => window.__layoutReads);
  assert.ok(reads < 100, `one appended item cost ${reads} layout reads`);
});

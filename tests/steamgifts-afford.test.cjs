'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const script = fs.readFileSync(path.resolve(__dirname, '../shift.user.js'), 'utf8');

const giveaway = (id, cost, { copies = '', entered = false } = {}) =>
  `<div class="giveaway__row-outer-wrap" id="${id}"><div class="giveaway__row-inner-wrap${entered ? ' is-faded' : ''}"><h2 class="giveaway__heading"><a class="giveaway__heading__name" href="#">${id}</a>${copies ? `<span class="giveaway__heading__thin">(${copies} Copies)</span>` : ''}<span class="giveaway__heading__thin">(${cost}P)</span></h2></div></div>`;

async function steamgifts(t, header, settings) {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.addInitScript((settings) => {
    const saved = new Map([['exp:v3:shift:settings', { theme: 'ember', accent: 'ember-default', adapterSettings: { steamgifts: settings } }]]);
    window.GM_getValue = (key, fallback) => saved.has(key) ? saved.get(key) : fallback;
    window.GM_setValue = (key, value) => saved.set(key, value);
    window.GM_xmlhttpRequest = () => {};
  }, settings);
  const body = `${header}${giveaway('cheap', 10)}${giveaway('exact', 40, { copies: 3 })}${giveaway('costly', 75)}${giveaway('entered', 90, { entered: true })}`;
  await page.route('https://www.steamgifts.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html><body>${body}</body></html>` }));
  await page.goto('https://www.steamgifts.com/');
  await page.addScriptTag({ content: script });
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-exp-shift'));
  await page.waitForTimeout(150);
  return page;
}

const visible = (page) => page.evaluate(() => [...document.querySelectorAll('.giveaway__row-outer-wrap')].filter((row) => getComputedStyle(row).display !== 'none').map((row) => row.id));

test('Hide ones I can\'t afford hides giveaways costing more points than the header shows, and follows the points as they change', async (t) => {
  const page = await steamgifts(t, '<header><a class="nav__button" href="/account"><span class="nav__points">40</span>P</a></header>', { 'hide-unaffordable': true });
  assert.deepEqual(await visible(page), ['cheap', 'exact', 'entered']);
  // Entering a giveaway fades its row and lowers the header points in the same step.
  await page.evaluate(() => { document.querySelector('#cheap .giveaway__row-inner-wrap').classList.add('is-faded'); document.querySelector('.nav__points').textContent = '5'; });
  await page.waitForFunction(() => getComputedStyle(document.getElementById('exact')).display === 'none');
  assert.deepEqual(await visible(page), ['cheap', 'entered']);
  // Points also rise on their own while the list is open.
  await page.evaluate(() => { document.querySelector('.nav__points').textContent = '100'; });
  await page.waitForFunction(() => getComputedStyle(document.getElementById('costly')).display !== 'none');
  assert.deepEqual(await visible(page), ['cheap', 'exact', 'costly', 'entered']);
});

test('the switch is off by default and does nothing when points are not shown', async (t) => {
  const off = await steamgifts(t, '<span class="nav__points">40</span>', {});
  assert.deepEqual(await visible(off), ['cheap', 'exact', 'costly', 'entered']);
  const signedOut = await steamgifts(t, '<header><a class="nav__sits" href="/?login">Sign in through STEAM</a></header>', { 'hide-unaffordable': true });
  assert.deepEqual(await visible(signedOut), ['cheap', 'exact', 'costly', 'entered']);
});

test('SteamGifts lists the new switch after Hide ended', async () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/adapters.js'), 'utf8');
  const ids = [...source.match(/steamgifts: \{[\s\S]*?options: (\[[^\n]*?\]\]),/)[1].matchAll(/\['([a-z-]+)', '([^']+)'\]/g)].map((match) => [match[1], match[2]]);
  assert.deepEqual(ids.slice(0, 3), [['hide-entered', 'Hide entered'], ['hide-ended', 'Hide ended'], ['hide-unaffordable', 'Hide ones I can’t afford']]);
});

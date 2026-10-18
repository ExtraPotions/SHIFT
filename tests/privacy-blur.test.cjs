'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const script = fs.readFileSync(path.resolve(__dirname, '../shift.user.js'), 'utf8');
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');
const BODY = '<main><a id="link" href="#"><img id="linked" src="/pic.png" width="200" height="120"></a><div id="tile" style="position:relative"><img id="plain" src="/pic.png" width="200" height="120"><span id="overlay" style="position:absolute;inset:0"></span></div><video id="clip" width="200" height="120"></video><div id="gallery"><img id="g1" src="/pic.png" width="50" height="50"><img id="g2" src="/pic.png" width="50" height="50"></div><p id="text">Text stays sharp.</p><img id="slow" src="/slow.png" width="10" height="10"></main>';

async function open(t, settings, { host = 'blur.example', holdLoad = false } = {}) {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.addInitScript((settings) => {
    const saved = new Map([['exp:v3:shift:settings', settings]]);
    window.GM_getValue = (key, fallback) => saved.has(key) ? saved.get(key) : fallback;
    window.GM_setValue = (key, value) => saved.set(key, value);
    window.GM_xmlhttpRequest = () => {};
  }, settings);
  let release;
  const held = new Promise((resolve) => { release = resolve; });
  t.after(() => release());
  await page.route(`https://${host}/**`, async (route) => {
    const url = route.request().url();
    if (url.endsWith('/slow.png')) { if (holdLoad) await held; return route.fulfill({ status: 200, contentType: 'image/png', body: PNG }); }
    if (url.endsWith('.png')) return route.fulfill({ status: 200, contentType: 'image/png', body: PNG });
    return route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html><body>${BODY}</body></html>` });
  });
  await page.goto(`https://${host}/`, { waitUntil: holdLoad ? 'domcontentloaded' : 'load' });
  await page.addScriptTag({ content: script });
  await page.waitForFunction(() => document.getElementById('exp-shift-root'));
  return { page, release };
}

const filters = (page) => page.evaluate(() => Object.fromEntries(['linked', 'plain', 'clip', 'text'].map((id) => [id, getComputedStyle(document.getElementById(id)).filter])));
const blurred = { linked: 'blur(18px)', plain: 'blur(18px)', clip: 'blur(18px)', text: 'none' };
const sharp = { linked: 'none', plain: 'none', clip: 'none', text: 'none' };
const on = (host = 'blur.example', extra = {}) => ({ theme: 'ember', accent: 'ember-default', siteOverrides: { [host]: { privacyBlur: true } }, ...extra });

test('Blur images and videos until hover blurs media on this site before the page finishes loading, and leaves text alone', async (t) => {
  const { page } = await open(t, on(), { holdLoad: true });
  await page.waitForSelector('#exp-shift-privacy-style', { state: 'attached' });
  assert.notEqual(await page.evaluate(() => document.readyState), 'complete');
  assert.deepEqual(await filters(page), blurred);
});

test('hovering the media or its container reveals it, and so does keyboard focus on the link around it', async (t) => {
  const { page } = await open(t, on());
  await page.hover('#overlay');
  assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById('plain')).filter), 'none');
  await page.mouse.move(0, 0);
  assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById('plain')).filter), 'blur(18px)');
  await page.hover('#g1');
  assert.deepEqual(await page.evaluate(() => ['g1', 'g2'].map((id) => getComputedStyle(document.getElementById(id)).filter)), ['none', 'blur(18px)']);
  await page.mouse.move(0, 0);
  await page.keyboard.press('Tab');
  await page.waitForFunction(() => document.activeElement?.id === 'link');
  assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById('linked')).filter), 'none');
});

test('the switch is off by default and is saved for one site only', async (t) => {
  const plain = await open(t, { theme: 'ember', accent: 'ember-default' });
  assert.deepEqual(await filters(plain.page), sharp);
  const other = await open(t, on('elsewhere.example'));
  assert.deepEqual(await filters(other.page), sharp);
});

test('Safe Mode and a site exclusion turn the blur off; Reduce blur does not', async (t) => {
  const safe = await open(t, on('blur.example', { safeMode: true }));
  assert.deepEqual(await filters(safe.page), sharp);
  const excluded = await open(t, on('blur.example', { exclusions: ['blur.example'] }));
  assert.deepEqual(await filters(excluded.page), sharp);
  const reduced = await open(t, on('blur.example', { reduceBlur: true }));
  assert.deepEqual(await filters(reduced.page), blurred);
});

test('the Privacy switch in Effects turns the blur on for this site, and Reset this site clears it', async (t) => {
  const { page } = await open(t, { theme: 'ember', accent: 'ember-default' });
  const host = page.locator('#exp-shift-root');
  await host.locator('.launcher').click();
  await host.locator('[data-exp-section-tab="advanced"]').evaluate((node) => node.click());
  await host.locator('summary:visible').filter({ hasText: /^Effects & integrations$/ }).evaluate((node) => node.click());
  const toggle = host.locator('button[role="switch"][aria-label="Blur images and videos until hover"]');
  assert.equal(await toggle.getAttribute('aria-checked'), 'false');
  await toggle.evaluate((node) => node.click());
  await page.waitForFunction(() => getComputedStyle(document.getElementById('plain')).filter === 'blur(18px)');
  assert.deepEqual(await page.evaluate(() => GM_getValue('exp:v3:shift:settings').siteOverrides), { 'blur.example': { privacyBlur: true } });
  page.on('dialog', (dialog) => dialog.accept());
  await host.locator('summary:visible').filter({ hasText: /^Profiles & sites$/ }).evaluate((node) => node.click());
  await host.locator('button:visible').filter({ hasText: /^Reset site$/ }).first().evaluate((node) => node.click());
  await page.waitForFunction(() => getComputedStyle(document.getElementById('plain')).filter === 'none');
  assert.deepEqual(await page.evaluate(() => GM_getValue('exp:v3:shift:settings').siteOverrides), {});
});

test('pausing all ExtraPotions products on the site lifts the blur, and resuming puts it back', async (t) => {
  const { page } = await open(t, on());
  // Another tab pausing the site arrives as a storage event, which Core turns into a suite site-control event.
  const setPaused = (paused) => page.evaluate((paused) => { const key = 'exp:v3:suite-site-pause:blur.example'; if (paused) localStorage.setItem(key, '1'); else localStorage.removeItem(key); dispatchEvent(new StorageEvent('storage', { key })); }, paused);
  await setPaused(true);
  await page.waitForFunction(() => getComputedStyle(document.getElementById('plain')).filter === 'none');
  await setPaused(false);
  await page.waitForFunction(() => getComputedStyle(document.getElementById('plain')).filter === 'blur(18px)');
});

test('the blur is in place when SHIFT runs at document-start, before the page has a head', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const saved = new Map([['exp:v3:shift:settings', { theme: 'ember', accent: 'ember-default', siteOverrides: { 'blur.example': { privacyBlur: true } } }]]);
    window.GM_getValue = (key, fallback) => saved.has(key) ? saved.get(key) : fallback;
    window.GM_setValue = (key, value) => saved.set(key, value);
    window.GM_xmlhttpRequest = () => {};
  });
  await page.addInitScript({ content: script });
  await page.route('https://blur.example/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html><body>${BODY}</body></html>` }));
  await page.goto('https://blur.example/');
  assert.deepEqual(await filters(page), blurred);
  assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('#exp-shift-privacy-style')].length), 1);
  assert.deepEqual(errors, []);
});

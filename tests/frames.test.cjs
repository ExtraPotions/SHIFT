'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const script = fs.readFileSync(path.resolve(__dirname, '../shift.user.js'), 'utf8');

// A page with a video-sized area, a transparent overlay frame from another origin on top of it (the way Twitch lays
// an extension over a stream), and a frame from the same origin.
const top = `<!doctype html><html><body style="margin:0"><div id="stage" style="position:relative;width:640px;height:360px;background:#246">
  <iframe id="overlay" src="https://overlay.test/" style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>
  <iframe id="sibling" src="https://site.test/inner" style="width:300px;height:100px"></iframe></body></html>`;
const overlay = '<!doctype html><html><body style="margin:0"><p id="hint" style="color:#fff;background:#000;padding:4px;width:200px">Extension hint</p></body></html>';
const inner = '<!doctype html><html><body><p>Same-origin frame</p></body></html>';

async function load(settings) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 900, height: 600 } });
  const page = await context.newPage();
  await page.addInitScript(seeded => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => key === 'exp:v3:shift:settings' ? seeded : values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, value);
    window.GM_xmlhttpRequest = () => {};
  }, settings);
  await page.route('https://site.test/inner', route => route.fulfill({ contentType: 'text/html', body: inner }));
  await page.route('https://site.test/**', route => route.fulfill({ contentType: 'text/html', body: top }));
  await page.route('https://overlay.test/**', route => route.fulfill({ contentType: 'text/html', body: overlay }));
  await page.addInitScript({ content: script });
  await page.goto('https://site.test/');
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-exp-shift'), null, { timeout: 15000 });
  await page.waitForTimeout(400);
  return { browser, page };
}

const facts = frame => frame.evaluate(() => ({
  attr: document.documentElement.getAttribute('data-exp-shift'),
  preloading: document.documentElement.hasAttribute('data-exp-shift-preloading'),
  preloadStyle: Boolean(document.getElementById('exp-shift-preload')),
  htmlBg: getComputedStyle(document.documentElement).backgroundColor,
  bodyBg: getComputedStyle(document.body).backgroundColor,
  scheme: getComputedStyle(document.documentElement).colorScheme,
}));

test('SHIFT never paints a frame from another origin, so overlays stay transparent over what is beneath them', async t => {
  const { browser, page } = await load({ schema: 1, theme: 'midnight', currentProfile: 'original' });
  t.after(() => browser.close());
  const overlayFrame = page.frames().find(frame => frame.url().startsWith('https://overlay.test/'));
  assert.ok(overlayFrame, 'the foreign overlay frame loaded');
  const overlayFacts = await facts(overlayFrame);
  assert.equal(overlayFacts.attr, null, 'the foreign frame is not themed');
  assert.equal(overlayFacts.preloading, false);
  assert.equal(overlayFacts.preloadStyle, false, 'no early background paint was injected');
  assert.equal(overlayFacts.htmlBg, 'rgba(0, 0, 0, 0)', JSON.stringify(overlayFacts));
  assert.equal(overlayFacts.bodyBg, 'rgba(0, 0, 0, 0)', JSON.stringify(overlayFacts));
  assert.notEqual(overlayFacts.scheme, 'dark', 'a dark color-scheme would also give a transparent frame an opaque backdrop');
  // What a viewer sees in the middle of the overlay is whatever lies beneath it (here the stage), not an opaque frame.
  const stageColor = await page.evaluate(() => getComputedStyle(document.getElementById('stage')).backgroundColor);
  const shot = await page.screenshot({ clip: { x: 400, y: 300, width: 4, height: 4 } });
  const seen = await page.evaluate(async b64 => {
    const bitmap = await createImageBitmap(new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], { type: 'image/png' }));
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d'); ctx.drawImage(bitmap, 0, 0);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  }, shot.toString('base64'));
  assert.equal(seen, stageColor, 'the overlay frame lets the stage show through');
});

test('SHIFT still themes the top page and frames from its own origin', async t => {
  const { browser, page } = await load({ schema: 1, theme: 'midnight', currentProfile: 'original' });
  t.after(() => browser.close());
  const topFacts = await facts(page.mainFrame());
  assert.equal(topFacts.attr, 'midnight');
  assert.equal(topFacts.htmlBg, 'rgb(5, 10, 18)');
  const sameOrigin = page.frames().find(frame => frame.url() === 'https://site.test/inner');
  assert.ok(sameOrigin, 'the same-origin frame loaded');
  assert.equal((await facts(sameOrigin)).attr, 'midnight', 'a frame of the same site is still themed');
});

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const themesSource = fs.readFileSync(path.resolve(__dirname, '../src/themes.js'), 'utf8');
const colorEngineSource = fs.readFileSync(path.resolve(__dirname, '../src/color-engine.js'), 'utf8');

async function withColorEngine(t, html = '<!doctype html><html><head></head><body></body></html>') {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent(html);
  await page.addScriptTag({ content: `const EXP={};${themesSource};${colorEngineSource};window.testThemes=EXP.Themes;window.testColors=EXP.ColorEngine;` });
  return page;
}

test('color engine maps source colors into the selected SHIFT palette while preserving hierarchy', async (t) => {
  const page = await withColorEngine(t);
  const result = await page.evaluate(() => {
    const theme = testThemes.resolve('shift', 'shift-default', {});
    const bright = testColors.background('#ffffff', theme, theme.page);
    const mid = testColors.background('#d0d0d0', theme, theme.page);
    const colored = testColors.background('#e24b38', theme, theme.page);
    const foreground = testColors.foreground('#222222', theme, theme.surface);
    return {
      bright,
      mid,
      colored,
      foreground,
      contrast: testColors.contrastRatio(testColors.parse(foreground), testColors.parse(theme.surface))
    };
  });
  assert.match(result.bright, /^rgb/);
  assert.match(result.mid, /^rgb/);
  assert.match(result.colored, /^rgb/);
  assert.notEqual(result.bright, result.mid);
  assert.notEqual(result.colored, result.bright);
  assert.ok(result.contrast >= 4.5, String(result.contrast));
});

test('color cache keys include resolved palette values for edited custom themes', async (t) => {
  const page = await withColorEngine(t);
  const result = await page.evaluate(() => {
    const first = { id: 'custom', page: '#101820', surface: '#182832', raised: '#243844', overlay: '#304854', navigation: '#16242d', input: '#20323d', interactive: '#293e49', text: '#eef7fa', muted: '#a9bcc4', accent: '#55b8bf' };
    const second = { ...first, page: '#241010', surface: '#3a2020', raised: '#4a2a2a', overlay: '#603838' };
    return [
      testColors.background('#ffffff', first, first.page),
      testColors.background('#ffffff', second, second.page)
    ];
  });
  assert.notEqual(result[0], result[1]);
});

test('semantic inline CSS variables are transformed without touching brand tokens', async (t) => {
  const page = await withColorEngine(t, '<!doctype html><html style="--page-background:#fff;--primary-text:#222;--border-color:#ddd;--brand-accent:#ff00ff"><head></head><body></body></html>');
  const result = await page.evaluate(() => {
    const theme = testThemes.resolve('shift', 'shift-default', {});
    const root = document.documentElement;
    testColors.inspectInline(root, theme);
    return {
      page: root.style.getPropertyValue('--page-background'),
      text: root.style.getPropertyValue('--primary-text'),
      border: root.style.getPropertyValue('--border-color'),
      brand: root.style.getPropertyValue('--brand-accent'),
      marker: root.getAttribute('data-exp-shift-vars'),
    };
  });
  assert.notEqual(result.page, '#fff');
  assert.notEqual(result.text, '#222');
  assert.notEqual(result.border, '#ddd');
  assert.equal(result.brand, '#ff00ff');
  assert.match(result.marker, /--page-background/);
});

test('inline repair is reversible', async (t) => {
  const page = await withColorEngine(t, '<!doctype html><html><head></head><body><div id="card" style="background-color:#fff;color:#222;border:1px solid #ddd">Card</div></body></html>');
  const result = await page.evaluate(() => {
    const theme = testThemes.resolve('shift', 'shift-default', {});
    const card = document.getElementById('card');
    const original = { background: card.style.backgroundColor, color: card.style.color, border: card.style.borderTopColor };
    testColors.inspectInline(card, theme);
    const repaired = {
      marker: card.getAttribute('data-exp-shift-inline'),
      background: card.style.backgroundColor,
      color: card.style.color,
      border: card.style.borderTopColor
    };
    testColors.clear();
    return {
      original,
      repaired,
      restored: {
        background: card.style.backgroundColor,
        color: card.style.color,
        border: card.style.borderTopColor,
        marker: card.hasAttribute('data-exp-shift-inline')
      }
    };
  });
  assert.match(result.repaired.marker, /background-color/);
  assert.notEqual(result.repaired.background, result.original.background);
  assert.notEqual(result.repaired.color, result.original.color);
  assert.notEqual(result.repaired.border, result.original.border);
  assert.equal(result.restored.marker, false);
  assert.deepEqual(
    { background: result.restored.background, color: result.restored.color, border: result.restored.border },
    result.original
  );
});

test('inline repair preserves URL artwork while repairing text', async (t) => {
  const page = await withColorEngine(t, '<!doctype html><html><head></head><body><div id="hero" style="background-color:#fff;background-image:url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==);color:#222">Hero</div></body></html>');
  const result = await page.evaluate(() => {
    const theme = testThemes.resolve('shift', 'shift-default', {});
    const hero = document.getElementById('hero');
    const image = hero.style.backgroundImage;
    testColors.inspectInline(hero, theme);
    return {
      image,
      repairedImage: hero.style.backgroundImage,
      color: hero.style.color,
      marker: hero.getAttribute('data-exp-shift-inline')
    };
  });
  assert.equal(result.repairedImage, result.image);
  assert.notEqual(result.color, '#222');
  assert.match(result.marker, /color/);
});

test('a translucent overlay keeps its transparency so the page under it stays visible', async (t) => {
  const page = await withColorEngine(t);
  const result = await page.evaluate(() => {
    const theme = testThemes.resolve('shift', 'midnight', {});
    return { scrim: testColors.parse(testColors.background('#0000004d', theme, theme.page)), veil: testColors.parse(testColors.background('rgba(255,255,255,.6)', theme, theme.page)), solid: testColors.parse(testColors.background('#ffffff', theme, theme.page)) };
  });
  assert.ok(Math.abs(result.scrim.a - 0.3) < 0.01, 'scrim alpha ' + JSON.stringify(result.scrim));
  assert.ok(Math.abs(result.veil.a - 0.6) < 0.01, 'veil alpha ' + JSON.stringify(result.veil));
  assert.equal(result.solid.a, 1);
});

test('modern CSS color syntaxes parse, so contrast is measured against the real fill', async (t) => {
  // Tailwind 4 and shadcn sites compute colors as oklch()/oklab()/color(); Chromium keeps that syntax.
  const page = await withColorEngine(t);
  const result = await page.evaluate(() => ({
    oklch: testColors.parse('oklch(0.92 0.004 286.32)'),
    oklab: testColors.parse('oklab(0.705 0.00415142 -0.0144141 / 0.4)'),
    srgb: testColors.parse('color(srgb 0.800376 0.718243 0.747545)'),
    lab: testColors.parse('lab(50 20 30)'),
    ratio: testColors.contrastRatio('rgb(241, 140, 156)', 'oklch(0.92 0.004 286.32)'),
  }));
  const near = (got, want) => Object.entries(want).every(([k, v]) => Math.abs(got[k] - v) <= (k === 'a' ? 0.01 : 2));
  assert.ok(result.oklch && near(result.oklch, { r: 228, g: 228, b: 231, a: 1 }), 'oklch ' + JSON.stringify(result.oklch));
  assert.ok(result.oklab && Math.abs(result.oklab.a - 0.4) < 0.01, 'oklab ' + JSON.stringify(result.oklab));
  assert.ok(result.srgb && near(result.srgb, { r: 204, g: 183, b: 191, a: 1 }), 'color(srgb) ' + JSON.stringify(result.srgb));
  assert.ok(result.lab && result.lab.a === 1, 'lab ' + JSON.stringify(result.lab));
  assert.ok(result.ratio > 1.7 && result.ratio < 2, 'pink on the light oklch fill ' + result.ratio);
});

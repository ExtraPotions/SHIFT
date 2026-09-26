'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const script = fs.readFileSync(path.resolve(__dirname, '../shift.user.js'), 'utf8');

async function fixture(t, host, body) {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.addInitScript(() => {
    const saved = new Map([['exp:v3:shift:settings', { theme: 'ember', accent: 'ember-default' }]]);
    window.GM_getValue = (key, fallback) => saved.has(key) ? saved.get(key) : fallback;
    window.GM_setValue = (key, value) => saved.set(key, value);
    window.GM_xmlhttpRequest = () => {};
  });
  await page.route(`https://${host}/**`, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html><body>${body}</body></html>` }));
  await page.goto(`https://${host}/fixture`);
  await page.addScriptTag({ content: script });
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-exp-shift'));
  return page;
}

test('SteamGifts pale native headings and notices get paired dark surfaces and legible text', async (t) => {
  const page = await fixture(t, 'www.steamgifts.com', '<div class="page__heading" style="background:linear-gradient(white,#ddd);color:white"><a href="#">Giveaways › Won</a></div><div class="notification" style="background:#faf3c7;color:#fff">Check your Steam account</div><div class="giveaway__row-outer-wrap"><span class="giveaway__column--contributor-level" style="background:linear-gradient(white,#ddd);color:white">Level 1</span></div>');
  const result = await page.evaluate(() => Object.fromEntries(['.page__heading', '.notification'].map(selector => {
    const style = getComputedStyle(document.querySelector(selector));
    return [selector, { image: style.backgroundImage, foreground: style.color, background: style.backgroundColor }];
  })));
  assert.equal(result['.page__heading'].image, 'none');
  assert.notEqual(result['.page__heading'].foreground, result['.page__heading'].background);
  assert.equal(result['.notification'].image, 'none');
  assert.notEqual(result['.notification'].foreground, result['.notification'].background);
  const level = await page.locator('.giveaway__column--contributor-level').evaluate(node => ({ image: getComputedStyle(node).backgroundImage, foreground: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor }));
  assert.equal(level.image, 'none');
  assert.notEqual(level.foreground, level.background);
});

test('ManaPool is recognized as a site integration', async (t) => {
  const page = await fixture(t, 'manapool.com', '<main><section><h2>Commander Cards</h2><article><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Card"></article></section></main>');
  const result = await page.evaluate(() => {
    const root = document.querySelector('#exp-shift-root');
    root.shadowRoot.querySelector('.launcher').click();
    root.shadowRoot.querySelector('[data-section="effects"]').click();
    return root.shadowRoot.textContent;
  });
  assert.match(result, /ManaPool · healthy/);
});


test('Amazon navigation, cards, forms, text, and product media wells keep usable contrast', async (t) => {
  const page = await fixture(t, 'www.amazon.com', [
    '<div id="nav-main" style="background:#fff;color:#fff">Nav</div>',
    '<div class="a-cardui" style="background:#fff;color:#fff;border:1px solid #fff">Card</div>',
    '<div class="s-card-container" style="background:#fff;color:#fff">',
      '<span class="a-size-base-plus" style="color:#111">Product title</span>',
      '<span class="a-price" style="color:#111">$1299</span>',
      '<div class="s-product-image-container" style="background:#fff">',
        '<img class="s-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" style="filter:brightness(.2);opacity:.45" alt="Product">',
      '</div>',
    '</div>',
    '<input class="a-input-text" value="query" style="background:#fff;color:#fff;border-color:#fff">'
  ].join(''));
  const result = await page.evaluate(() => {
    const pick = (selector) => {
      const node = document.querySelector(selector);
      const style = getComputedStyle(node);
      return { background: style.backgroundColor, color: style.color, border: style.borderColor, filter: style.filter, opacity: style.opacity };
    };
    return {
      nav: pick('#nav-main'),
      card: pick('.a-cardui'),
      result: pick('.s-card-container'),
      title: pick('.a-size-base-plus'),
      price: pick('.a-price'),
      media: pick('.s-product-image-container'),
      input: pick('.a-input-text'),
      image: pick('.s-image'),
    };
  });
  assert.notEqual(result.nav.background, 'rgb(255, 255, 255)');
  assert.notEqual(result.card.background, 'rgb(255, 255, 255)');
  assert.notEqual(result.result.background, 'rgb(255, 255, 255)');
  assert.notEqual(result.input.background, 'rgb(255, 255, 255)');
  assert.equal(result.media.background, 'rgb(255, 255, 255)');
  assert.equal(result.image.filter, 'none');
  assert.equal(result.image.opacity, '1');
  assert.notEqual(result.title.color, 'rgb(17, 17, 17)');
  assert.notEqual(result.price.color, 'rgb(17, 17, 17)');
  assert.notEqual(result.card.color, result.card.background);
  assert.notEqual(result.input.color, result.input.background);
});

test('Amazon final text repair wins over recovered important product colors', async (t) => {
  const page = await fixture(t, 'www.amazon.com', [
    '<style>.s-card-container .a-size-base-plus,.s-card-container .a-price{color:#111!important}</style>',
    '<div class="s-card-container" style="background:#fff">',
      '<span class="a-size-base-plus">Recovered-title</span>',
      '<span class="a-price">$19.99</span>',
    '</div>'
  ].join(''));
  const result = await page.evaluate(() => {
    const title = getComputedStyle(document.querySelector('.a-size-base-plus')).color;
    const price = getComputedStyle(document.querySelector('.a-price')).color;
    const bg = getComputedStyle(document.querySelector('.s-card-container')).backgroundColor;
    return { title, price, bg };
  });
  assert.notEqual(result.bg, 'rgb(255, 255, 255)');
  assert.notEqual(result.title, 'rgb(17, 17, 17)');
  assert.notEqual(result.price, 'rgb(17, 17, 17)');
  assert.notEqual(result.title, result.bg);
  assert.notEqual(result.price, result.bg);
});



test('Amazon product metadata and media do not inherit multiply blending on dark cards', async (t) => {
  const page = await fixture(t, 'www.amazon.com', [
    '<style>',
      '.x-asin-metadata{mix-blend-mode:multiply}',
      '.x-asin-image{mix-blend-mode:multiply;opacity:.4}',
    '</style>',
    '<div class="s-card-container" style="background:#fff">',
      '<div class="x-asin-image-wrapper"><img class="x-asin-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Product"></div>',
      '<div class="x-asin-metadata">',
        '<div class="x-asin-title"><span class="a-size-base-plus">Product title</span></div>',
        '<div class="x-asin-price"><span class="a-price">$19.99</span></div>',
      '</div>',
    '</div>'
  ].join(''));
  const result = await page.evaluate(() => {
    const pick = selector => {
      const style = getComputedStyle(document.querySelector(selector));
      return { blend: style.mixBlendMode, opacity: style.opacity, color: style.color };
    };
    return {
      metadata: pick('.x-asin-metadata'),
      title: pick('.a-size-base-plus'),
      price: pick('.a-price'),
      image: pick('.x-asin-image'),
    };
  });
  assert.equal(result.metadata.blend, 'normal');
  assert.equal(result.image.blend, 'normal');
  assert.equal(result.image.opacity, '1');
  assert.notEqual(result.title.color, 'rgb(17, 17, 17)');
  assert.notEqual(result.price.color, 'rgb(17, 17, 17)');
});


test('generic unknown sites get dark surfaces, readable text, preserved media, and dynamic mutation repair', async (t) => {
  const page = await fixture(t, 'generic-fixture.test', [
    '<main>',
      '<section id="generic-panel" style="background:#fff;color:#f8f8f8;border:1px solid #fff">',
        '<h2 id="generic-title" style="color:#eee">Generic dashboard</h2>',
        '<input id="generic-input" value="hello" style="background:#fff;color:#fff;border-color:#fff">',
        '<img id="generic-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" style="filter:none;opacity:1" alt="Artwork">',
      '</section>',
    '</main>'
  ].join(''));
  const before = await page.evaluate(() => {
    const read = selector => {
      const style = getComputedStyle(document.querySelector(selector));
      return { background: style.backgroundColor, color: style.color, filter: style.filter, opacity: style.opacity };
    };
    return {
      panel: read('#generic-panel'),
      title: read('#generic-title'),
      input: read('#generic-input'),
      image: read('#generic-image'),
    };
  });
  assert.notEqual(before.panel.background, 'rgb(255, 255, 255)');
  assert.notEqual(before.title.color, before.panel.background);
  assert.notEqual(before.input.background, 'rgb(255, 255, 255)');
  assert.equal(before.image.filter, 'none');
  assert.equal(before.image.opacity, '1');

  await page.evaluate(() => {
    const card = document.createElement('article');
    card.id = 'dynamic-card';
    card.style.cssText = 'background:#fff;color:#fff;border:1px solid #fff';
    card.innerHTML = '<span id="dynamic-copy" style="color:#eee">Dynamic content</span>';
    document.querySelector('main').append(card);
  });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#dynamic-card')).backgroundColor !== 'rgb(255, 255, 255)');
  const after = await page.evaluate(() => ({
    card: getComputedStyle(document.querySelector('#dynamic-card')).backgroundColor,
    copy: getComputedStyle(document.querySelector('#dynamic-copy')).color,
  }));
  assert.notEqual(after.card, 'rgb(255, 255, 255)');
  assert.notEqual(after.copy, after.card);
});


test('native-dark generic fast path repairs contrast without repainting native surfaces', async (t) => {
  const page = await fixture(t, 'native-dark.test', [
    '<style>html,body{color-scheme:dark;background:#0d1117;color:#c9d1d9} .panel{background:#161b22} .dim{color:#1f2933} .native-light{background:#fff;color:#111}</style>',
    '<main>',
      '<section class="panel">',
        '<p class="dim">Low contrast text</p>',
        '<input id="dark-input" value="query" style="background:#0d1117;color:#1f2933">',
        '<div class="native-light" id="native-light">Intentional light surface</div>',
      '</section>',
    '</main>'
  ].join(''));
  const result = await page.evaluate(() => {
    const read = selector => {
      const style = getComputedStyle(document.querySelector(selector));
      return { background: style.backgroundColor, color: style.color };
    };
    return {
      rootScheme: getComputedStyle(document.documentElement).colorScheme,
      panel: read('.panel'),
      dim: read('.dim'),
      input: read('#dark-input'),
      light: read('#native-light'),
    };
  });
  assert.match(result.rootScheme, /dark/);
  assert.equal(result.panel.background, 'rgb(22, 27, 34)');
  assert.notEqual(result.dim.color, 'rgb(31, 41, 51)');
  assert.equal(result.input.background, 'rgb(13, 17, 23)');
  assert.notEqual(result.input.color, 'rgb(31, 41, 51)');
  assert.equal(result.light.background, 'rgb(255, 255, 255)');
});


test('deep native-dark ancestry keeps contrast accurate without repainting native structure', async (t) => {
  const depth = 14;
  const nestedOpen = Array.from({ length: depth }, (_, i) => `<div class="layer layer-${i}">`).join('');
  const nestedClose = '</div>'.repeat(depth);
  const page = await fixture(t, 'deep-native-dark.test', [
    '<style>',
      'html,body{color-scheme:dark;background:#101318;color:#d7dce2}',
      '.native-panel{background:#171b22;color:#d7dce2}',
      '.layer{background:transparent}',
      '.too-dim{color:#252a31}',
      '.intentional-light{background:#fff;color:#111}',
    '</style>',
    '<main class="native-panel">',
      nestedOpen,
        '<span class="too-dim" id="deep-copy">Deep text</span>',
        '<span class="too-dim" id="deep-copy-2">Sibling text</span>',
      nestedClose,
      '<div class="intentional-light" id="intentional-light">Light surface</div>',
    '</main>'
  ].join(''));
  const result = await page.evaluate(() => ({
    panel: getComputedStyle(document.querySelector('.native-panel')).backgroundColor,
    copy: getComputedStyle(document.querySelector('#deep-copy')).color,
    copy2: getComputedStyle(document.querySelector('#deep-copy-2')).color,
    light: getComputedStyle(document.querySelector('#intentional-light')).backgroundColor,
  }));
  assert.equal(result.panel, 'rgb(23, 27, 34)');
  assert.notEqual(result.copy, 'rgb(37, 42, 49)');
  assert.notEqual(result.copy2, 'rgb(37, 42, 49)');
  assert.equal(result.light, 'rgb(255, 255, 255)');
});

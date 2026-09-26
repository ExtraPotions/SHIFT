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


test('Amazon navigation, cards, forms, and product art use the strengthened site contract', async (t) => {
  const page = await fixture(t, 'www.amazon.com', [
    '<div id="nav-main" style="background:#fff;color:#fff">Nav</div>',
    '<div class="a-cardui" style="background:#fff;color:#fff;border:1px solid #fff">Card</div>',
    '<div class="s-card-container" style="background:#fff;color:#fff">Result</div>',
    '<input class="a-input-text" value="query" style="background:#fff;color:#fff;border-color:#fff">',
    '<img class="s-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" style="filter:brightness(.2)" alt="Product">'
  ].join(''));
  const result = await page.evaluate(() => {
    const pick = (selector) => {
      const node = document.querySelector(selector);
      const style = getComputedStyle(node);
      return { background: style.backgroundColor, color: style.color, border: style.borderColor, filter: style.filter };
    };
    return {
      nav: pick('#nav-main'),
      card: pick('.a-cardui'),
      result: pick('.s-card-container'),
      input: pick('.a-input-text'),
      image: pick('.s-image'),
      site: EXP?.SiteFixes?.active?.()?.id || null,
    };
  });
  assert.equal(result.site, 'amazon');
  assert.notEqual(result.nav.background, 'rgb(255, 255, 255)');
  assert.notEqual(result.card.background, 'rgb(255, 255, 255)');
  assert.notEqual(result.result.background, 'rgb(255, 255, 255)');
  assert.notEqual(result.input.background, 'rgb(255, 255, 255)');
  assert.equal(result.image.filter, 'none');
  assert.notEqual(result.card.color, result.card.background);
  assert.notEqual(result.input.color, result.input.background);
});

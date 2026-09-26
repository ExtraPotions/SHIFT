'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const script = fs.readFileSync(path.resolve(__dirname, '../shift.user.js'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));

test('SHIFT does not mount a launcher inside an iframe', async (t) => {
  const browser = await chromium.launch({ headless: true }); t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body><iframe srcdoc="<!doctype html><html><body><main>Embedded</main></body></html>"></iframe></body></html>');
  const frame = page.frames().find((candidate) => candidate !== page.mainFrame());
  await frame.evaluate(() => { const values = new Map(); window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback; window.GM_setValue = (key, value) => values.set(key, value); window.GM_xmlhttpRequest = () => {}; });
  await frame.addScriptTag({ content: script });
  await page.waitForTimeout(100);
  assert.equal(await frame.locator('#exp-shift-root').count(), 0);
});

test('GM_addElement cannot leak menu CSS onto the page', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  await page.addInitScript(() => {
    window.GM_getValue = (_key, fallback) => fallback;
    window.GM_setValue = () => {};
    window.GM_xmlhttpRequest = () => {};
    const dump = (css) => {
      const node = document.createElement('style');
      node.dataset.gmLeak = '1';
      node.textContent = css;
      (document.head || document.documentElement).append(node);
      return node;
    };
    window.GM_addStyle = dump;
    window.GM_addElement = (_parent, _tag, attrs) => dump(attrs?.textContent || '');
  });
  await page.setContent('<!doctype html><html><body style="margin:0;background:#123456;color:#111"><header id="site-header" style="background:#abc;color:#111">Site header</header><button id="site-button" style="background:#def;color:#111">Site button</button></body></html>');
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  const facts = await page.evaluate(() => {
    const leaked = [...document.querySelectorAll('style')].filter((node) => node.getRootNode() === document && /\.launcher\{/.test(node.textContent || ''));
    const host = document.getElementById('exp-shift-root');
    const box = host.getBoundingClientRect();
    return {
      leaked: leaked.length,
      headerBg: getComputedStyle(document.getElementById('site-header')).backgroundColor,
      buttonBg: getComputedStyle(document.getElementById('site-button')).backgroundColor,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      hostBg: getComputedStyle(host).backgroundColor,
      hostW: Math.round(box.width),
      hostH: Math.round(box.height),
    };
  });
  assert.equal(facts.leaked, 0, JSON.stringify(facts));
  assert.equal(facts.headerBg, 'rgb(170, 187, 204)');
  assert.equal(facts.buttonBg, 'rgb(221, 238, 255)');
  assert.equal(facts.bodyBg, 'rgb(18, 52, 86)');
  assert.equal(facts.hostBg, 'rgba(0, 0, 0, 0)');
  assert.equal(facts.hostW, 0);
  assert.equal(facts.hostH, 0);
});

test('inline background shorthand survives Original boot and exclusion', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  await page.addInitScript(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
    window.GM_xmlhttpRequest = () => {};
  });
  await page.route('https://fixture.test/**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><html><body style="margin:0;background:#123456;color:#111"><main id="copy">Shorthand</main></body></html>',
  }));
  await page.goto('https://fixture.test/shorthand');
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  const boot = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.equal(boot, 'rgb(18, 52, 86)');
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Ember"]').click();
  });
  await page.waitForFunction(() => document.documentElement.getAttribute('data-exp-shift') === 'ember');
  const themed = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.notEqual(themed, boot);
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('[data-section="profiles"]').click();
    const row = [...shadow.querySelectorAll('.row, .setting-row, .identity, .mini-row')].find((item) => /Enable SHIFT on this site/i.test(item.textContent || ''));
    const toggle = row?.querySelector('[role="switch"]');
    if (!toggle) throw new Error('missing site toggle');
    if (toggle.getAttribute('aria-checked') === 'true') toggle.click();
  });
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-exp-shift'));
  const restored = await page.evaluate(() => ({
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyStyle: document.body.getAttribute('style') || '',
  }));
  assert.equal(restored.bodyBg, 'rgb(18, 52, 86)');
  assert.match(restored.bodyStyle, /background:\s*(#123456|rgb\(18,\s*52,\s*86\))/i);
  assert.doesNotMatch(restored.bodyStyle, /background-image:\s*initial/i);
});

async function fixture(options = {}) {
  const viewport = { width: options.width || 1100, height: options.height || 800 };
  const html = typeof options.html === 'string'
    ? options.html
    : `<!doctype html><html><head><style>body{margin:0;background:#fff;color:#222}header,main,section{display:block;background:#f4f4f4;padding:24px;margin:10px}section{width:420px;height:120px}a{color:#164f8b}</style></head><body><header>Header</header><main><h1>Fixture</h1><section><a href="#test">Link</a><label>Field <input placeholder="Example"></label></section><img alt="Artwork" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='red'/%3E%3C/svg%3E"></main></body></html>`;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport });
  await page.addInitScript(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
    window.__updateRequests = 0;
    window.GM_xmlhttpRequest = (options) => { window.__updateRequests += 1; queueMicrotask(() => options.onload({ status: 200, responseText: JSON.stringify({ tag_name: 'v3.0.1' }) })); };
  });
  await page.setContent(html);
  await page.evaluate(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
    window.__updateRequests = 0;
    window.GM_xmlhttpRequest = (options) => { window.__updateRequests += 1; queueMicrotask(() => options.onload({ status: 200, responseText: JSON.stringify({ tag_name: 'v3.0.1' }) })); };
  });
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  return { browser, page };
}

test('menu rows keep usable label widths and avoid nested scrollers', async (t) => {
  const { browser, page } = await fixture({ width: 900, height: 700 });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  const facts = await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    [...shadow.querySelectorAll('.fl-tool-header')].find((button) => button.textContent.includes('Appearance')).click();
    const panel = shadow.querySelector('[data-exp-part="dock"]');
    const body = shadow.querySelector('.fl-tool-body:not([hidden])');
    const rows = [...body.querySelectorAll('.row')];
    return {
      overflow: getComputedStyle(body).overflow,
      maxHeight: getComputedStyle(body).maxHeight,
      panelOutline: getComputedStyle(panel).outlineStyle,
      panelBorder: getComputedStyle(panel).borderTopWidth,
      minLabelWidth: Math.min(...rows.map((row) => row.firstElementChild.getBoundingClientRect().width)),
      visibleFileInputs: [...body.querySelectorAll('input[type="file"]')].filter((input) => getComputedStyle(input).display !== 'none').length,
      groupColumns: [...body.querySelectorAll('.group')].map((group) => getComputedStyle(group).gridTemplateColumns),
    };
  });
  assert.equal(facts.overflow, 'visible');
  assert.equal(facts.maxHeight, 'none');
  assert.equal(facts.panelOutline, 'none');
  assert.equal(facts.panelBorder, '1px');
  assert.ok(facts.minLabelWidth >= 76, JSON.stringify(facts));
  assert.equal(facts.visibleFileInputs, 0);
  assert.ok(facts.groupColumns.every((value) => value.trim().split(/\s+/).length === 1), JSON.stringify(facts));
});

test('appearance live-commits on selection and survives SPA traversal', async (t) => {
  const browser = await chromium.launch({ headless: true }); t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.route('https://fixture.test/**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><html><body><main><section>Fixture</section></main></body></html>',
  }));
  await page.goto('https://fixture.test/start');
  await page.evaluate(() => {
    const values = new Map();
    window.__gmValues = values;
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
    window.GM_xmlhttpRequest = () => {};
  });
  await page.addScriptTag({ content: script });
  const root = page.locator('#exp-shift-root');
  await root.evaluate((host) => {
    const shadow = host.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Pride"]').click();
  });
  const appearance = () => page.evaluate(() => ({
    theme: document.documentElement.getAttribute('data-exp-shift'),
    page: getComputedStyle(document.documentElement).getPropertyValue('--exp-shift-page').trim(),
    saved: window.__gmValues.has('exp:v3:shift:settings'),
  }));
  assert.deepEqual(await appearance(), { theme: 'pride', page: '#100a12', saved: true });
  await page.evaluate(() => history.pushState({}, '', '/preview-route'));
  await page.waitForTimeout(650);
  assert.deepEqual(await appearance(), { theme: 'pride', page: '#100a12', saved: true });
  await page.evaluate(() => history.pushState({}, '', '/applied-route'));
  await page.waitForTimeout(650);
  assert.deepEqual(await appearance(), { theme: 'pride', page: '#100a12', saved: true });
});

test('first run is Original and menu is a six-row Dropper-style shell', async (t) => {
  const { browser, page } = await fixture();
  t.after(() => browser.close());

  const initial = await page.evaluate(() => ({
    themed: document.querySelectorAll('[data-exp-shift-live]').length,
    style: document.querySelector('#exp-shift-page-style')?.textContent || '',
  }));
  assert.equal(initial.themed, 0);
  assert.equal(initial.style, '');

  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => node.shadowRoot.querySelector('.launcher').click());

  const facts = await root.evaluate(async (node) => {
    const shadow = node.shadowRoot;
    const panel = shadow.querySelector('[data-exp-part="dock"]');
    shadow.querySelector('.version').click();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const notice = shadow.querySelector('.update-notice');
    const panelRect = panel.getBoundingClientRect();
    const noticeRect = notice.getBoundingClientRect();
    return {
      panelHidden: panel.hidden,
      navCount: shadow.querySelectorAll('nav .fl-tool-header').length,
      checkboxCount: shadow.querySelectorAll('input[type="checkbox"]').length,
      switchCount: shadow.querySelectorAll('[role="switch"]').length,
      visibleBodies: [...shadow.querySelectorAll('.route-body')].filter((body) => !body.hidden).length,
      width: panelRect.width,
      noticeOutside: !panel.contains(notice) && !notice.hidden,
      versionLabel: shadow.querySelector('.version')?.textContent || '',
      noticeTitle: notice.querySelector('.update-title')?.textContent || '',
      noticeVersion: notice.querySelector('.update-version')?.textContent || '',
      noticeBullets: [...notice.querySelectorAll('.update-list li')].map((item) => item.textContent),
      noticePlacement: notice.dataset.placement,
      panelRight: panelRect.right,
      noticeRight: noticeRect.right,
      noticeTop: noticeRect.top,
      noticeBottom: noticeRect.bottom,
      panelTop: panelRect.top,
      panelBottom: panelRect.bottom,
    };
  });

  assert.equal(facts.panelHidden, false);
  assert.equal(facts.navCount, 6);
  assert.equal(facts.checkboxCount, 0);
  assert.equal(facts.switchCount, 0);
  assert.equal(facts.visibleBodies, 0);
  assert.equal(facts.width, 260);
  assert.equal(facts.noticeOutside, true);
  assert.equal(facts.versionLabel, `v${pkg.version}`);
  assert.equal(facts.noticeTitle, 'SHIFT Changelog');
  assert.equal(facts.noticeVersion, `v${pkg.version}`);
  assert.ok(facts.noticeBullets.length >= 2 && facts.noticeBullets.length <= 4, JSON.stringify(facts.noticeBullets));
  assert.ok(facts.noticeBullets.some((item) => /Amazon|remote stylesheet|Dropper|Core/i.test(item)));
  assert.equal(facts.noticePlacement, 'menu');
  assert.ok(Math.abs(facts.noticeRight - facts.panelRight) <= 1, JSON.stringify(facts));
  assert.ok(facts.noticeBottom <= facts.panelTop || facts.noticeTop >= facts.panelBottom, JSON.stringify(facts));

  const labels = await root.evaluate((node) => [...node.shadowRoot.querySelectorAll('[data-section]')].map((item) => item.textContent.replace(/[▸▾]/g, '').trim()));
  assert.deepEqual(labels, ['Appearance', 'Readability', 'Effects & Integrations', 'Profiles & Sites', 'Menu & Updates', 'System']);

  const subtitle = await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    const title = shadow.querySelector('[data-exp-part="title"]');
    const subtitleNode = shadow.querySelector('[data-exp-part="subtitle"]');
    const style = getComputedStyle(subtitleNode);
    return {
      text: subtitleNode.textContent,
      titleLeft: title.getBoundingClientRect().left,
      subtitleLeft: subtitleNode.getBoundingClientRect().left,
      paddingLeft: style.paddingLeft,
      borderTopWidth: style.borderTopWidth,
      textAlign: style.textAlign,
    };
  });
  assert.equal(subtitle.text, 'Adaptive themes and readability');
  assert.equal(subtitle.subtitleLeft, subtitle.titleLeft);
  assert.deepEqual(
    { paddingLeft: subtitle.paddingLeft, borderTopWidth: subtitle.borderTopWidth, textAlign: subtitle.textAlign },
    { paddingLeft: '0px', borderTopWidth: '0px', textAlign: 'start' },
  );

  const expanded = await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('[data-section="readability"]').click();
    return {
      switchCount: shadow.querySelectorAll('[role="switch"]').length,
      visibleBodies: [...shadow.querySelectorAll('.route-body')].filter((body) => !body.hidden).length,
      nested: shadow.querySelectorAll('.route-body:not([hidden]) details').length,
    };
  });
  assert.ok(expanded.switchCount >= 2);
  assert.equal(expanded.visibleBodies, 1);
  assert.equal(expanded.nested, 0);

  const reopened = await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('.launcher').click();
    return {
      visibleBodies: [...shadow.querySelectorAll('.route-body')].filter((body) => !body.hidden).length,
      marker: shadow.querySelector('.fl-tool-header.last-opened')?.textContent.replace(/[▸▾]/g, '').trim(),
    };
  });
  assert.deepEqual(reopened, { visibleBodies: 0, marker: 'Readability' });

  const launcherChrome = await root.evaluate((host) => {
    const shadow = host.shadowRoot;
    const launcher = shadow.querySelector('.launcher');
    return {
      button: Math.round(launcher.getBoundingClientRect().width),
      radius: getComputedStyle(launcher).borderRadius,
      hasRing: Boolean(shadow.querySelector('.launcher-ring')),
      icon: Math.round(shadow.querySelector('.launcher-icon').getBoundingClientRect().width),
      headerBadge: Math.round(shadow.querySelector('.header-icon .menu-icon').getBoundingClientRect().width),
    };
  });
  assert.deepEqual(launcherChrome, { button: 48, radius: '10px', hasRing: false, icon: 40, headerBadge: 38 });
});

test('Appearance owns palette and surfaces; Readability owns text and motion', async (t) => {
  const { browser, page } = await fixture();
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
  });
  const appearanceLabels = await root.evaluate((node) => [...node.shadowRoot.querySelectorAll('.route-body:not([hidden]) .label')].map((item) => item.textContent));
  assert.ok(appearanceLabels.includes('Theme Strength'));
  assert.ok(appearanceLabels.includes('Surface Intelligence'));
  assert.equal(appearanceLabels.includes('Reduce motion'), false);
  await root.evaluate((node) => node.shadowRoot.querySelector('[data-section="readability"]').click());
  const readabilityLabels = await root.evaluate((node) => [...node.shadowRoot.querySelectorAll('.route-body:not([hidden]) .label')].map((item) => item.textContent));
  assert.ok(readabilityLabels.includes('Reduce motion'));
  assert.ok(readabilityLabels.includes('Text contrast'));
  assert.ok(readabilityLabels.includes('Focus visibility'));
  assert.equal(readabilityLabels.includes('Surface Intelligence'), false);
  await root.evaluate((node) => node.shadowRoot.querySelector('[data-section="effects"]').click());
  const effectsLabels = await root.evaluate((node) => [...node.shadowRoot.querySelectorAll('.route-body:not([hidden]) .label')].map((item) => item.textContent));
  assert.ok(effectsLabels.includes('Reduce shadows'));
  assert.equal(effectsLabels.includes('Text contrast'), false);
});

test('appearance selects and swatches live-commit with real engine effects', async (t) => {
  const { browser, page } = await fixture();
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => { const shadow=node.shadowRoot;shadow.querySelector('.launcher').click();shadow.querySelector('[data-section="appearance"]').click(); });
  const palettes = await root.evaluate((node) => [...node.shadowRoot.querySelectorAll('.exp-theme-swatch')].map((item) => item.getAttribute('aria-label')));
  assert.deepEqual(palettes, ['Ember', 'Midnight', 'Glacier', 'High contrast', 'Verdant', 'Pride', 'Crimson', 'SHIFT gem']);
  assert.equal(await root.evaluate((node) => [...node.shadowRoot.querySelectorAll('button')].some((item) => item.textContent === 'Apply' || item.textContent === 'Cancel')), false);
  await root.evaluate((node) => node.shadowRoot.querySelector('.exp-theme-swatch[aria-label="Ember"]').click());
  await page.waitForFunction(() => document.querySelector('#exp-shift-page-style')?.textContent.includes('--exp-shift-page'));
  await page.waitForFunction(() => document.querySelectorAll('[data-exp-shift-live]').length > 0);
  assert.ok(await page.locator('[data-exp-shift-live]').count() > 0);
  await root.evaluate((node) => {
    const select = [...node.shadowRoot.querySelectorAll('select')].find((item) => item.getAttribute('aria-label') === 'Theme Strength');
    select.value = 'strong';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  assert.equal(await page.evaluate(() => window.GM_getValue('exp:v3:shift:settings').themeStrength), 'strong');
  assert.equal(await root.evaluate((node) => [...node.shadowRoot.querySelectorAll('select')].find((item) => item.getAttribute('aria-label') === 'Theme Strength')?.value), 'strong');
  await root.evaluate((node) => node.shadowRoot.querySelector('.exp-theme-swatch[aria-label="Midnight"]').click());
  await page.waitForFunction(() => document.querySelector('#exp-shift-page-style')?.textContent.includes('--exp-shift-page:#050a12'));
  await page.waitForFunction(() => document.querySelectorAll('[data-exp-shift-live]').length > 0);
  assert.ok(await page.locator('[data-exp-shift-live]').count() > 0);
  assert.equal(await page.locator('img[data-exp-shift-live]').count(), 0);
});

test('Pride and SHIFT gem palettes recolor the live page when constructable sheets are inert', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  const sabotage = () => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
    window.GM_xmlhttpRequest = () => {};
    window.CSSStyleSheet = class extends CSSStyleSheet {
      replaceSync() {}
    };
  };
  await page.addInitScript(sabotage);
  await page.setContent(`<!doctype html><html><head><style>body{margin:0;background:#fff;color:#222}header,main,section{display:block;background:#f4f4f4;padding:24px;margin:10px}section{width:420px;height:120px}a{color:#164f8b}</style></head><body><header>Header</header><main><h1>Fixture</h1><section><a href="#test">Link</a></section></main></body></html>`);
  await page.evaluate(sabotage);
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => { const shadow=node.shadowRoot;shadow.querySelector('.launcher').click();shadow.querySelector('[data-section="appearance"]').click(); });
  await root.evaluate((node) => node.shadowRoot.querySelector('.exp-theme-swatch[aria-label="Pride"]').click());
  await page.waitForFunction(() => document.querySelector('#exp-shift-page-style')?.textContent.includes('--exp-shift-page:#100a12'));
  await root.evaluate((node) => node.shadowRoot.querySelector('.exp-theme-swatch[aria-label="SHIFT gem"]').click());
  await page.waitForFunction(() => document.querySelector('#exp-shift-page-style')?.textContent.includes('--exp-shift-page:#041313'));
  assert.notEqual(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor), 'rgba(0, 0, 0, 0)');
});

test('Pride palette recolors the live page', async (t) => {
  const { browser, page } = await fixture();
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => { const shadow=node.shadowRoot;shadow.querySelector('.launcher').click();shadow.querySelector('[data-section="appearance"]').click(); });
  await root.evaluate((node) => node.shadowRoot.querySelector('.exp-theme-swatch[aria-label="Pride"]').click());
  await page.waitForFunction(() => document.querySelector('#exp-shift-page-style')?.textContent.includes('--exp-shift-page:#100a12'));
  assert.notEqual(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor), 'rgba(0, 0, 0, 0)');
});

test('Pride paints a muted rainbow highlight and a pink accent', async (t) => {
  const { browser, page } = await fixture();
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Pride"]').click();
  });
  await page.waitForFunction(() => document.querySelector('#exp-shift-page-style')?.textContent.includes('--exp-shift-page:#100a12'));
  const sheet = await page.evaluate(() => document.querySelector('#exp-shift-page-style')?.textContent || '');
  assert.match(sheet, /#c84e66/);
  assert.match(sheet, /#d07840/);
  assert.match(sheet, /#3b8a5f/);
  assert.match(sheet, /#7455a4/);
  assert.match(sheet, /--exp-shift-accent:#dd6793/);
  assert.match(sheet, /--exp-shift-highlight:#dd6793/);
  assert.match(sheet, /--exp-shift-page:#100a12/);
  assert.match(sheet, /linear-gradient\(90deg,#c84e66/);
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('a')).color), 'rgb(221, 103, 147)');
});

test('Pride palette differs materially from Ember with rainbow page and menu treatment', async (t) => {
  const { browser, page } = await fixture();
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  const openAppearance = () => root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
  });
  await openAppearance();
  await root.evaluate((node) => node.shadowRoot.querySelector('.exp-theme-swatch[aria-label="Pride"]').click());
  await page.waitForFunction(() => document.querySelector('#exp-shift-page-style')?.textContent.includes('--exp-shift-page:#100a12'));
  const pride = await page.evaluate(() => {
    const html = document.documentElement;
    const rootNode = document.querySelector('#exp-shift-root');
    const shadow = rootNode.shadowRoot;
    const sheet = document.querySelector('#exp-shift-page-style')?.textContent || '';
    const menuStyle = shadow.querySelector('style[data-exp-shift-menu-theme]')?.textContent || '';
    return {
      page: getComputedStyle(document.body).backgroundColor,
      vars: {
        page: getComputedStyle(html).getPropertyValue('--exp-shift-page').trim(),
        surface: getComputedStyle(html).getPropertyValue('--exp-shift-surface').trim(),
        accent: getComputedStyle(html).getPropertyValue('--exp-shift-accent').trim(),
        highlight: getComputedStyle(html).getPropertyValue('--exp-shift-highlight').trim()
      },
      sheet,
      menuStyle,
      menuBg: getComputedStyle(shadow.querySelector('.dropper-menu-surface')).backgroundImage,
      dividerBg: getComputedStyle(shadow.querySelector('.header-divider')).backgroundImage,
      dividerHeight: getComputedStyle(shadow.querySelector('.header-divider')).height,
      uiTheme: rootNode.dataset.uiTheme
    };
  });
  assert.equal(pride.vars.page, '#100a12');
  assert.equal(pride.vars.surface, '#1d1222');
  assert.equal(pride.vars.accent, '#dd6793');
  assert.equal(pride.vars.highlight, '#dd6793');
  assert.match(pride.sheet, /#c84e66/);
  assert.match(pride.sheet, /#3d79a6/);
  assert.match(pride.menuBg, /linear-gradient/);
  assert.match(pride.dividerBg, /linear-gradient/);
  assert.match(pride.dividerBg, /200,\s*78,\s*102|#c84e66/i);
  assert.match(pride.dividerBg, /61,\s*121,\s*166|#3d79a6/i);
  assert.doesNotMatch(pride.dividerBg, /rgba\(0,\s*0,\s*0,\s*0\).*200/i);
  assert.equal(pride.dividerHeight, '2px');
  assert.equal(pride.uiTheme, 'pride');
  await root.evaluate((node) => node.shadowRoot.querySelector('.exp-theme-swatch[aria-label="Ember"]').click());
  await page.waitForFunction(() => document.querySelector('#exp-shift-page-style')?.textContent.includes('--exp-shift-page:#120807'));
  const ember = await page.evaluate(() => ({
    page: getComputedStyle(document.body).backgroundColor,
    vars: {
      page: getComputedStyle(document.documentElement).getPropertyValue('--exp-shift-page').trim(),
      surface: getComputedStyle(document.documentElement).getPropertyValue('--exp-shift-surface').trim(),
      accent: getComputedStyle(document.documentElement).getPropertyValue('--exp-shift-accent').trim()
    },
    sheet: document.querySelector('#exp-shift-page-style')?.textContent || ''
  }));
  assert.equal(ember.vars.page, '#120807');
  assert.equal(ember.vars.surface, '#24100c');
  assert.equal(ember.vars.accent, '#e16a3b');
  assert.doesNotMatch(ember.sheet, /#c84e66/);
  assert.notEqual(pride.page, ember.page);
  assert.notEqual(pride.vars.page, ember.vars.page);
  assert.notEqual(pride.vars.surface, ember.vars.surface);
  assert.notEqual(pride.vars.accent, ember.vars.accent);
});

test('narrow viewport keeps launcher and sequential navigation reachable', async (t) => {
  const { browser, page } = await fixture({ width: 390, height: 720 });
  t.after(() => browser.close());
  const result = await page.locator('#exp-shift-root').evaluate((node) => {
    const launcher = node.shadowRoot.querySelector('.launcher'); launcher.click();
    const panel = node.shadowRoot.querySelector('[data-exp-part="dock"]').getBoundingClientRect();
    const nav = getComputedStyle(node.shadowRoot.querySelector('nav'));
    return { panel: { left: panel.left, right: panel.right, top: panel.top, bottom: panel.bottom }, navDisplay: nav.display, launcher: launcher.getBoundingClientRect().toJSON() };
  });
  assert.ok(result.panel.left >= 0 && result.panel.right <= 390 && result.panel.top >= 0 && result.panel.bottom <= 720);
  assert.equal(result.navDisplay, 'block');
  assert.ok(result.launcher.width >= 48 && result.launcher.height >= 48);
});

test('supported-site adapter controls persist and invoke page effects', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1000, height: 760 } });
  await page.addInitScript(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
  });
  await page.route('https://www.goodreads.com/**', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body><main><section id="recommendations"><h2>Readers also enjoyed</h2><p>Books</p></section></main></body></html>' }));
  await page.goto('https://www.goodreads.com/book/show/fixture');
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => { node.shadowRoot.querySelector('.launcher').click(); [...node.shadowRoot.querySelectorAll('[data-section]')].find((item) => item.dataset.section === 'effects').click(); });
  const labels = await root.evaluate((node) => [...node.shadowRoot.querySelectorAll('.group .label')].map((item) => item.textContent));
  assert.ok(labels.includes('Hide recommendations'));
  await root.evaluate((node) => { const row = [...node.shadowRoot.querySelectorAll('.row')].find((item) => item.querySelector('.label')?.textContent === 'Hide recommendations'); row.querySelector('[role="switch"]').click(); });
  await page.waitForFunction(() => document.querySelector('#recommendations')?.dataset.expShiftRecommendation === 'true');
  assert.match(await page.locator('#exp-shift-adapter-style').evaluate((node) => node.textContent), /data-exp-shift-recommendation/);
});

test('launcher coordination assigns deterministic non-overlapping slots', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.setContent('<!doctype html><html><body><div id="peer" data-exp-product-launcher="1" data-product-id="prisma" data-launcher-priority="200"></div></body></html>');
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  const slots = await page.evaluate(() => ({ peer: document.querySelector('#peer').dataset.launcherSlot, shift: document.querySelector('#exp-shift-root').dataset.launcherSlot, x: document.querySelector('#exp-shift-root').style.getPropertyValue('--exp-launcher-x'), y: document.querySelector('#exp-shift-root').style.getPropertyValue('--exp-launcher-y') }));
  assert.deepEqual(slots, { peer: '0', shift: '1', x: '56px', y: '0px' });
});

test('launcher reflows when a higher-priority product joins after mount', async (t) => {
  const { browser, page } = await fixture({ width: 900, height: 700 });
  t.after(() => browser.close());
  const before = await page.locator('#exp-shift-root').evaluate((node) => node.shadowRoot.querySelector('.launcher').getBoundingClientRect().toJSON());
  await page.evaluate(() => {
    const peer = document.createElement('div');
    peer.id = 'late-peer';
    peer.dataset.expProductLauncher = '1';
    peer.dataset.productId = 'priority-peer';
    peer.dataset.launcherPriority = '200';
    document.documentElement.append(peer);
    document.dispatchEvent(new CustomEvent('exp-core:coordination', { detail: { type: 'launcher-added', productId: 'priority-peer' } }));
  });
  await page.waitForFunction(() => document.querySelector('#exp-shift-root')?.dataset.launcherSlot === '1');
  await page.waitForTimeout(50);
  const after = await page.locator('#exp-shift-root').evaluate((node) => ({
    top: node.shadowRoot.querySelector('.launcher').getBoundingClientRect().top,
    left: node.shadowRoot.querySelector('.launcher').getBoundingClientRect().left,
    inlineTop: node.shadowRoot.querySelector('.launcher').style.top,
    slot: node.dataset.launcherSlot,
    offset: getComputedStyle(node).getPropertyValue('--exp-launcher-offset').trim(),
  }));
  assert.equal(after.top, before.top, JSON.stringify(after));
  assert.equal(after.left, before.left - 56, JSON.stringify(after));
});

test('launcher drag reorders products and moves the complete grid between bottom and top anchors', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.addInitScript(() => { const values=new Map();window.GM_getValue=(key,fallback)=>values.has(key)?values.get(key):fallback;window.GM_setValue=(key,value)=>values.set(key,structuredClone(value));window.GM_xmlhttpRequest=()=>{}; });
  await page.route('https://launcher.test/**', (route) => route.fulfill({ contentType:'text/html', body:'<!doctype html><html><body><main>Launcher fixture</main></body></html>' }));
  await page.goto('https://launcher.test/');
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  await page.evaluate(() => localStorage.setItem('exp:v3:launcher-order', JSON.stringify(['prisma','shift'])));
  let box = await page.locator('#exp-shift-root').evaluate((node) => node.shadowRoot.querySelector('.launcher').getBoundingClientRect().toJSON());
  await page.mouse.move(box.x + 24, box.y + 24); await page.mouse.down(); await page.mouse.move(box.x + 90, box.y + 24, { steps: 5 }); await page.mouse.up();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('exp:v3:launcher-order') || '[]')[0] === 'shift');
  box = await page.locator('#exp-shift-root').evaluate((node) => node.shadowRoot.querySelector('.launcher').getBoundingClientRect().toJSON());
  await page.mouse.move(box.x + 24, box.y + 24); await page.mouse.down(); await page.mouse.move(box.x + 24, 24, { steps: 8 }); await page.mouse.up();
  await page.waitForFunction(() => document.documentElement.dataset.expLauncherAnchor === 'top');
  assert.ok(Number(await page.evaluate(() => localStorage.getItem('exp:v3:launcher-grid-delta'))) < 0);
});

test('Safe Mode restores owned effects and can recover without losing appearance', async (t) => {
  const { browser, page } = await fixture();
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => { const shadow=node.shadowRoot;shadow.querySelector('.launcher').click();shadow.querySelector('[data-section="appearance"]').click(); });
  await root.evaluate((node) => { node.shadowRoot.querySelector('.exp-theme-swatch[aria-label="Ember"]').click(); });
  await page.waitForFunction(() => document.querySelectorAll('[data-exp-shift-live]').length > 0);
  await root.evaluate((node) => [...node.shadowRoot.querySelectorAll('[data-section]')].find((item) => item.dataset.section === 'system').click());
  await root.evaluate((node) => { const row = [...node.shadowRoot.querySelectorAll('.row')].find((item) => item.querySelector('.label')?.textContent === 'Safe Mode'); row.querySelector('[role="switch"]').click(); });
  await page.waitForFunction(() => !(document.querySelector('#exp-shift-page-style')?.textContent) && document.querySelectorAll('[data-exp-shift-live]').length === 0);
  await root.evaluate((node) => { const row = [...node.shadowRoot.querySelectorAll('.row')].find((item) => item.querySelector('.label')?.textContent === 'Safe Mode'); row.querySelector('[role="switch"]').click(); });
  await page.waitForFunction(() => document.querySelector('#exp-shift-page-style')?.textContent.includes('--exp-shift-page:#120807') && document.querySelectorAll('[data-exp-shift-live]').length > 0);
});

test('Appearance is flat and has no custom-theme editors', async (t) => {
  const { browser, page } = await fixture(); t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate(node => {const s=node.shadowRoot;s.querySelector('.launcher').click();s.querySelector('[data-section="appearance"]').click();});
  assert.equal(await root.locator('.appearance-group').count(),0);
  assert.equal(await root.locator('.route-body:not([hidden]) details').count(),0);
  assert.equal(await root.getByText('Create custom theme',{exact:true}).count(),0);
  assert.equal(await root.getByText('Import custom theme',{exact:true}).count(),0);
  assert.equal(await root.getByLabel('Theme Strength',{exact:true}).isVisible(),true);
  assert.equal(await root.getByLabel('Surface Intelligence',{exact:true}).isVisible(),true);
  await root.evaluate(node => node.shadowRoot.querySelector('[data-section="readability"]').click());
  assert.equal(await root.getByLabel('Text contrast',{exact:true}).isVisible(),true);
});

test('Profiles & Sites and Menu & Updates hold site and chrome controls', async (t) => {
  const { browser, page } = await fixture();
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => { node.shadowRoot.querySelector('.launcher').click(); node.shadowRoot.querySelector('[data-section="profiles"]').click(); });
  const profileLabels = await root.evaluate((node) => [...node.shadowRoot.querySelectorAll('.route-body:not([hidden]) .label')].map((item) => item.textContent));
  assert.ok(profileLabels.includes('Enable SHIFT on this site'));
  assert.ok(profileLabels.includes('Current profile'));
  await root.evaluate((node) => node.shadowRoot.querySelector('[data-section="menu"]').click());
  const menuLabels = await root.evaluate((node) => [...node.shadowRoot.querySelectorAll('.route-body:not([hidden]) .label')].map((item) => item.textContent));
  assert.ok(menuLabels.includes('Menu width'));
  assert.ok(menuLabels.includes('Quiet update notifications'));
  assert.equal(menuLabels.includes('Safe Mode'), false);
  await root.evaluate((node) => node.shadowRoot.querySelector('[data-section="system"]').click());
  const recoveryLabels = await root.evaluate((node) => [...node.shadowRoot.querySelectorAll('.route-body:not([hidden]) .label')].map((item) => item.textContent));
  assert.ok(recoveryLabels.includes('Safe Mode'));
  assert.ok(recoveryLabels.includes('Export SHIFT settings'));
  assert.equal(recoveryLabels.includes('Quiet update notifications'), false);
});

test('update metadata remains offline by default and requests only after opt in', async (t) => {
  const { browser, page } = await fixture();
  t.after(() => browser.close());
  assert.equal(await page.evaluate(() => window.__updateRequests), 0);
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => { node.shadowRoot.querySelector('.launcher').click(); [...node.shadowRoot.querySelectorAll('[data-section]')].find((item) => item.dataset.section === 'menu').click(); });
  await root.evaluate((node) => { const row = [...node.shadowRoot.querySelectorAll('.row')].find((item) => item.querySelector('.label')?.textContent === 'Quiet update notifications'); row.querySelector('[role="switch"]').click(); });
  await page.waitForFunction(() => window.__updateRequests === 1);
  assert.equal(await page.evaluate(() => window.__updateRequests), 1);
});

test('menu CSS stays in the shadow root when constructable sheets are unavailable', async (t) => {
  const browser = await chromium.launch({ headless: true }); t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body><main>Fixture</main></body></html>');
  await page.evaluate(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
    window.GM_xmlhttpRequest = () => {};
    window.__gmStyleAdds = 0;
    window.CSSStyleSheet = undefined;
    window.GM_addElement = (parent, tag, attributes = {}) => {
      const node = document.createElement(tag);
      if (attributes.textContent !== undefined) node.textContent = attributes.textContent;
      parent.append(node);
      if (tag === 'style') window.__gmStyleAdds += 1;
      return node;
    };
  });
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  const result = await page.evaluate(() => {
    const host = document.querySelector('#exp-shift-root');
    const launcher = host.shadowRoot.querySelector('.launcher');
    const leaked = [...document.querySelectorAll('style')].filter((node) => node.getRootNode() === document && /\.launcher\{/.test(node.textContent || ''));
    return { calls: window.__gmStyleAdds, root: Boolean(host), leaked: leaked.length, width: getComputedStyle(launcher).width };
  });
  assert.equal(result.root, true);
  assert.equal(result.calls, 0, JSON.stringify(result));
  assert.equal(result.leaked, 0);
  assert.equal(result.width, '48px');
});

test('SHIFT paints launcher chrome when the page forbids inline style tags', async (t) => {
  const browser = await chromium.launch({ headless: true }); t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src scryfall.com *.scryfall.com"></head><body><main>Fixture</main></body></html>');
  await page.evaluate(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
    window.GM_xmlhttpRequest = () => {};
  });
  await page.evaluate(new Function(script));
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  const painted = await page.locator('#exp-shift-root').evaluate((host) => {
    const launcher = host.shadowRoot.querySelector('.launcher');
    const style = getComputedStyle(launcher);
    return { width: style.width, radius: style.borderRadius, position: style.position };
  });
  assert.equal(painted.width, '48px');
  assert.equal(painted.radius, '10px');
  assert.equal(painted.position, 'fixed');
});

test('everywhere CSS variables theme common chrome without waiting for surface marks', async (t) => {
  const { browser, page } = await fixture({
    html: `<!doctype html><html><body style="background:#fff;color:#111">
      <header id="site-header" style="background:#fafafa;color:#222">Nav</header>
      <nav id="site-nav" style="background:#eee">Links</nav>
      <main id="site-main" style="background:#fff"><p id="site-copy">Content</p></main>
      <dialog id="site-dialog" open style="background:#fff;color:#000">Dialog</dialog>
      <button id="site-btn" type="button" style="background:#ddd;color:#000">Go</button>
      <div id="site-card" class="card bg-white" style="background:#fff;color:#111">Card</div>
      <div id="site-toolbar" class="navbar toolbar" style="background:#f5f5f5;color:#111">Bar</div>
    </body></html>`
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="SHIFT gem"]').click();
  });
  await page.waitForFunction(() => getComputedStyle(document.documentElement).getPropertyValue('--exp-shift-page').trim() === '#041313');
  const painted = await page.evaluate(() => {
    const css = (id) => getComputedStyle(document.getElementById(id));
    return {
      pageVar: getComputedStyle(document.documentElement).getPropertyValue('--exp-shift-page').trim(),
      accentVar: getComputedStyle(document.documentElement).getPropertyValue('--exp-shift-accent').trim(),
      header: css('site-header').backgroundColor,
      nav: css('site-nav').backgroundColor,
      main: css('site-main').backgroundColor,
      dialog: css('site-dialog').backgroundColor,
      button: css('site-btn').backgroundColor,
      card: css('site-card').backgroundColor,
      toolbar: css('site-toolbar').backgroundColor,
      copy: css('site-copy').color,
      sheet: document.querySelector('#exp-shift-page-style')?.textContent || ''
    };
  });
  assert.equal(painted.pageVar, '#041313');
  assert.equal(painted.accentVar, '#2eaaa5');
  assert.match(painted.sheet, /:root,html\[data-exp-shift\],:host/);
  assert.match(painted.sheet, /\.MuiPaper-root/);
  assert.match(painted.sheet, /\.bg-white/);
  assert.match(painted.sheet, /\.width/);
  assert.doesNotMatch(painted.sheet, /\.container,/);
  assert.doesNotMatch(painted.sheet, /\.wrapper,/);
  assert.doesNotMatch(painted.sheet, /\[class\*="modal"/i);
  assert.doesNotMatch(painted.sheet, /\[class\*="paper"/i);
  assert.doesNotMatch(painted.sheet, /html,body\{/);
  assert.notEqual(painted.header, 'rgb(250, 250, 250)');
  assert.notEqual(painted.nav, 'rgb(238, 238, 238)');
  assert.notEqual(painted.main, 'rgb(255, 255, 255)');
  assert.notEqual(painted.dialog, 'rgb(255, 255, 255)');
  assert.notEqual(painted.button, 'rgb(221, 221, 221)');
  assert.notEqual(painted.card, 'rgb(255, 255, 255)');
  assert.notEqual(painted.toolbar, 'rgb(245, 245, 245)');
  assert.notEqual(painted.copy, 'rgb(17, 17, 17)');
});

test('theming avoids white-screen underpaint and nested overpaint', async (t) => {
  const { browser, page } = await fixture({
    html: `<!doctype html><html style="background:#fff"><head></head>
      <body style="margin:0;background:#ffffff;color:#111">
        <div id="false-card" class="discard postcard" style="background:transparent;color:#111;padding:8px">Keep me</div>
        <section id="outer-section" style="background:#f7f7f7;color:#111;padding:16px">
          <section id="inner-section" style="background:#fafafa;color:#222;padding:12px">
            <p id="nested-copy">Readable nested copy</p>
            <img id="art" alt="Art" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23ff0000'/%3E%3C/svg%3E">
          </section>
        </section>
        <header id="sticky-nav" class="navbar" style="position:sticky;top:0;background:#eee;color:#111">Sticky</header>
        <table id="data-table" style="background:#fff"><tbody><tr><td id="cell" style="background:#fff;color:#111">Cell</td></tr></tbody></table>
      </body></html>`
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Midnight"]').click();
  });
  await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(5, 10, 18)');
  await page.waitForTimeout(300);
  const facts = await page.evaluate(() => {
    const luminance = (color) => {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!match) return 1;
      const channel = (value) => {
        const part = Number(value) / 255;
        return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(match[1]) + 0.7152 * channel(match[2]) + 0.0722 * channel(match[3]);
    };
    const contrast = (fg, bg) => {
      const a = luminance(fg);
      const b = luminance(bg);
      const light = Math.max(a, b);
      const dark = Math.min(a, b);
      return (light + 0.05) / (dark + 0.05);
    };
    const html = getComputedStyle(document.documentElement);
    const body = getComputedStyle(document.body);
    const copy = document.getElementById('nested-copy');
    const copyStyle = getComputedStyle(copy);
    const falseCard = getComputedStyle(document.getElementById('false-card'));
    const outer = getComputedStyle(document.getElementById('outer-section'));
    const inner = getComputedStyle(document.getElementById('inner-section'));
    const cell = getComputedStyle(document.getElementById('cell'));
    const sticky = getComputedStyle(document.getElementById('sticky-nav'));
    const art = getComputedStyle(document.getElementById('art'));
    const sheet = document.querySelector('#exp-shift-page-style')?.textContent || '';
    return {
      htmlBg: html.backgroundColor,
      bodyBg: body.backgroundColor,
      bodyColor: body.color,
      htmlFilter: html.filter,
      bodyFilter: body.filter,
      copyContrast: contrast(copyStyle.color, getComputedStyle(copy.parentElement).backgroundColor),
      falseCardBg: falseCard.backgroundColor,
      outerBg: outer.backgroundColor,
      innerBg: inner.backgroundColor,
      cellBg: cell.backgroundColor,
      cellContrast: contrast(cell.color, cell.backgroundColor),
      stickyBg: sticky.backgroundColor,
      artFilter: art.filter,
      hasInvert: /filter:\s*invert\(/i.test(sheet),
      unscopedHost: /(?:^|})\s*html,body\{/m.test(sheet),
      broadSubstring: /\[class\*="(?:card|paper|sheet|modal)"/i.test(sheet),
      inlineHtmlBg: document.documentElement.style.getPropertyValue('background-color'),
      inlineBodyBg: document.body.style.getPropertyValue('background-color'),
    };
  });
  assert.equal(facts.htmlBg, 'rgb(5, 10, 18)');
  assert.equal(facts.bodyBg, 'rgb(5, 10, 18)');
  assert.notEqual(facts.bodyColor, 'rgb(17, 17, 17)');
  assert.ok(facts.copyContrast >= 4.5, JSON.stringify(facts));
  assert.ok(facts.cellContrast >= 4.5, JSON.stringify(facts));
  assert.equal(facts.htmlFilter, 'none');
  assert.equal(facts.bodyFilter, 'none');
  assert.equal(facts.hasInvert, false);
  assert.equal(facts.unscopedHost, false);
  assert.equal(facts.broadSubstring, false);
  assert.equal(facts.artFilter, 'none');
  assert.ok(['rgba(0, 0, 0, 0)', 'transparent'].includes(facts.falseCardBg), JSON.stringify(facts.falseCardBg));
  assert.notEqual(facts.outerBg, 'rgb(247, 247, 247)');
  assert.notEqual(facts.innerBg, 'rgb(250, 250, 250)');
  assert.notEqual(facts.cellBg, 'rgb(255, 255, 255)');
  assert.notEqual(facts.stickyBg, 'rgb(238, 238, 238)');
  assert.ok(['#050a12', 'rgb(5, 10, 18)'].includes(facts.inlineHtmlBg), JSON.stringify(facts.inlineHtmlBg));
  assert.ok(['#050a12', 'rgb(5, 10, 18)'].includes(facts.inlineBodyBg), JSON.stringify(facts.inlineBodyBg));
});

test('content wrappers like Greasy Fork .width keep readable contrast', async (t) => {
  const { browser, page } = await fixture({
    html: `<!doctype html><html><body style="margin:0;background:#eee;color:#333">
      <div id="main" style="background:#fff;color:#333;min-height:100vh;padding:24px">
        <div class="width" id="gf-width" style="background:#ffffff;color:#444;max-width:960px;margin:0 auto;padding:16px">
          <h1 id="gf-title" style="color:#111">How to use Greasy Fork</h1>
          <p id="gf-copy" style="color:#555">Step 1: install a user script manager</p>
          <ul id="gf-list" style="color:#555"><li id="gf-item">Tampermonkey</li></ul>
        </div>
      </div>
    </body></html>`
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="SHIFT gem"]').click();
  });
  await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(4, 19, 19)');
  const facts = await page.evaluate(() => {
    const luminance = (color) => {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!match) return 1;
      const channel = (value) => {
        const part = Number(value) / 255;
        return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(match[1]) + 0.7152 * channel(match[2]) + 0.0722 * channel(match[3]);
    };
    const contrast = (fg, bg) => {
      const a = luminance(fg);
      const b = luminance(bg);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const width = document.getElementById('gf-width');
    const title = document.getElementById('gf-title');
    const copy = document.getElementById('gf-copy');
    const item = document.getElementById('gf-item');
    const widthStyle = getComputedStyle(width);
    const sheet = document.querySelector('#exp-shift-page-style')?.textContent || '';
    return {
      widthBg: widthStyle.backgroundColor,
      titleContrast: contrast(getComputedStyle(title).color, widthStyle.backgroundColor),
      copyContrast: contrast(getComputedStyle(copy).color, widthStyle.backgroundColor),
      itemContrast: contrast(getComputedStyle(item).color, widthStyle.backgroundColor),
      paintsWidth: /\.width/.test(sheet),
    };
  });
  assert.equal(facts.paintsWidth, true);
  assert.notEqual(facts.widthBg, 'rgb(255, 255, 255)');
  assert.ok(facts.titleContrast >= 4.5, JSON.stringify(facts));
  assert.ok(facts.copyContrast >= 4.5, JSON.stringify(facts));
  assert.ok(facts.itemContrast >= 4.5, JSON.stringify(facts));
});

test('common layout wrappers stay transparent over hero art', async (t) => {
  const { browser, page } = await fixture({
    html: `<!doctype html><html><body style="margin:0;background:#111;color:#eee">
      <div class="hero-wrap" id="hero" style="min-height:70vh;display:grid;place-items:center;background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22500%22><rect width=%22800%22 height=%22500%22 fill=%22%23f59e0b%22/></svg>');background-size:cover">
        <div class="container" id="hero-container" style="background:transparent;padding:24px">
          <div class="wrapper" id="hero-wrapper" style="background:transparent">
            <div class="content" id="hero-content" style="background:transparent">
              <div class="page" id="hero-page" style="background:transparent">
                <h1 id="hero-title" style="color:#fff">Brand Hero</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body></html>`
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="SHIFT gem"]').click();
  });
  await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(4, 19, 19)');
  const facts = await page.evaluate(() => {
    const opaque = (bg) => {
      const match = String(bg || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/i);
      if (!match) return false;
      const alpha = match[4] === undefined ? 1 : Number(match[4]);
      return alpha >= 0.95;
    };
    const bg = (id) => getComputedStyle(document.getElementById(id)).backgroundColor;
    const sheet = document.querySelector('#exp-shift-page-style')?.textContent || '';
    return {
      heroImage: getComputedStyle(document.getElementById('hero')).backgroundImage,
      containerOpaque: opaque(bg('hero-container')),
      wrapperOpaque: opaque(bg('hero-wrapper')),
      contentOpaque: opaque(bg('hero-content')),
      pageOpaque: opaque(bg('hero-page')),
      sheetHasContainer: /\.container/.test(sheet),
      sheetHasWrapper: /\.wrapper/.test(sheet),
      sheetHasPage: /(?<![a-z-])\.page(?![a-z-])/.test(sheet),
      sheetHasWidth: /\.width/.test(sheet),
    };
  });
  assert.match(facts.heroImage, /url\(/i);
  assert.equal(facts.containerOpaque, false, JSON.stringify(facts));
  assert.equal(facts.wrapperOpaque, false, JSON.stringify(facts));
  assert.equal(facts.contentOpaque, false, JSON.stringify(facts));
  assert.equal(facts.pageOpaque, false, JSON.stringify(facts));
  assert.equal(facts.sheetHasContainer, false);
  assert.equal(facts.sheetHasWrapper, false);
  assert.equal(facts.sheetHasPage, false);
  assert.equal(facts.sheetHasWidth, true);
});

test('transparent section/article stay clear over hero art', async (t) => {
  const { browser, page } = await fixture({
    html: `<!doctype html><html><body style="margin:0;background:#041c1f">
      <div id="site-shell" style="background:transparent;min-height:100vh">
        <section id="hero" style="min-height:60vh;display:grid;place-items:center;background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22400%22><rect width=%22800%22 height=%22400%22 fill=%22%23f59e0b%22/></svg>');background-size:cover">
          <h1 id="hero-title" style="color:#fff">Hero</h1>
        </section>
        <article id="story" style="background:transparent;padding:24px"><p id="story-copy">Story copy</p></article>
      </div>
    </body></html>`
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="SHIFT gem"]').click();
  });
  await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(4, 19, 19)');
  await page.waitForTimeout(400);
  const facts = await page.evaluate(() => {
    const opaque = (bg) => {
      const match = String(bg || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/i);
      if (!match) return false;
      const alpha = match[4] === undefined ? 1 : Number(match[4]);
      return alpha >= 0.95;
    };
    const bg = (id) => getComputedStyle(document.getElementById(id)).backgroundColor;
    const sheet = document.querySelector('#exp-shift-page-style')?.textContent || '';
    return {
      shellOpaque: opaque(bg('site-shell')),
      heroOpaque: opaque(bg('hero')),
      storyOpaque: opaque(bg('story')),
      heroImage: getComputedStyle(document.getElementById('hero')).backgroundImage,
      sheetPaintsSectionBg: /:is\(section,article\)[^{]*\{[^}]*background-color:/i.test(sheet),
      ownedHero: document.getElementById('hero').getAttribute('data-exp-shift-surface'),
      ownedStory: document.getElementById('story').getAttribute('data-exp-shift-surface'),
    };
  });
  assert.match(facts.heroImage, /url\(/i);
  assert.equal(facts.shellOpaque, false, JSON.stringify(facts));
  assert.equal(facts.heroOpaque, false, JSON.stringify(facts));
  assert.equal(facts.storyOpaque, false, JSON.stringify(facts));
  assert.equal(facts.sheetPaintsSectionBg, false, JSON.stringify(facts));
  assert.equal(facts.ownedHero, null);
  assert.equal(facts.ownedStory, null);
});

test('excluding a site restores stylesheet backgrounds without a white canvas', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  await page.addInitScript(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
    window.GM_xmlhttpRequest = () => {};
  });
  await page.route('https://fixture.test/**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: `<!doctype html><html><head><style>body{margin:0;background:#eee;color:#333}.width{background:#fff;color:#444;padding:16px}</style></head>
      <body><div class="width" id="panel"><p id="copy">Greasy Fork style panel</p></div></body></html>`,
  }));
  await page.goto('https://fixture.test/scripts');
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Ember"]').click();
  });
  await page.waitForFunction(() => document.documentElement.getAttribute('data-exp-shift') === 'ember');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('[data-section="profiles"]').click();
    const row = [...shadow.querySelectorAll('.row, .setting-row, .identity, .mini-row')].find((item) => /Enable SHIFT on this site/i.test(item.textContent || ''));
    const toggle = row?.querySelector('[role="switch"]');
    if (toggle?.getAttribute('aria-checked') === 'true') toggle.click();
  });
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-exp-shift'));
  const facts = await page.evaluate(() => ({
    bodyBg: getComputedStyle(document.body).backgroundColor,
    panelBg: getComputedStyle(document.getElementById('panel')).backgroundColor,
    copyColor: getComputedStyle(document.getElementById('copy')).color,
    pageStyle: Boolean(document.getElementById('exp-shift-page-style')),
    owned: document.querySelectorAll('[data-exp-shift-live]').length,
    bodyStyle: document.body.getAttribute('style') || '',
    leftoverStyles: document.querySelectorAll('#exp-shift-page-style,style[data-exp-shift-page-style]').length,
    leftoverOwned: document.querySelectorAll('[data-exp-shift-live]').length,
    hostAttr: document.documentElement.getAttribute('data-exp-shift'),
  }));
  assert.doesNotMatch(script, /style\.removeProperty\(\s*['"]background['"]\s*\)/);
  assert.equal(facts.pageStyle, false);
  assert.equal(facts.owned, 0);
  assert.equal(facts.bodyBg, 'rgb(238, 238, 238)');
  assert.equal(facts.panelBg, 'rgb(255, 255, 255)');
  assert.equal(facts.copyColor, 'rgb(68, 68, 68)');
  assert.equal(facts.leftoverStyles, 0);
  assert.equal(facts.leftoverOwned, 0);
  assert.equal(facts.hostAttr, null);
  assert.doesNotMatch(facts.bodyStyle, /background-image:\s*initial/i);
});

test('host CSS themes SPA app shells that never use landmarks', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  await page.addInitScript(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
    window.GM_xmlhttpRequest = () => {};
  });
  await page.setContent('<!doctype html><html><head></head><body style="margin:0;background:#ffffff;color:#111"><div id="root" style="min-height:100vh;width:100%;background:#ffffff;color:#111"><p>SPA shell</p></div></body></html>');
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="SHIFT gem"]').click();
  });
  await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(4, 19, 19)');
  const painted = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).backgroundColor,
    body: getComputedStyle(document.body).backgroundColor,
    shell: getComputedStyle(document.getElementById('root')).backgroundColor,
    host: document.documentElement.getAttribute('data-exp-shift')
  }));
  assert.equal(painted.html, 'rgb(4, 19, 19)');
  assert.equal(painted.body, 'rgb(4, 19, 19)');
  assert.notEqual(painted.shell, 'rgb(255, 255, 255)');
  assert.equal(painted.host, 'shift');
});

test('page stylesheet is restored after the site steals it', async (t) => {
  const { browser, page } = await fixture();
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Pride"]').click();
  });
  await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(16, 10, 18)');
  await page.evaluate(() => document.getElementById('exp-shift-page-style')?.remove());
  await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(16, 10, 18)' && Boolean(document.getElementById('exp-shift-page-style')));
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(16, 10, 18)');
});

test('inline html and body backgrounds lose to the chosen palette', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  await page.addInitScript(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
    window.GM_xmlhttpRequest = () => {};
  });
  await page.setContent('<!doctype html><html style="background:#fff !important;background-color:#fff !important"><head></head><body style="background:#fff !important;background-color:#fff !important;margin:0"><main style="min-height:120px;background:#f4f4f4">Inline</main></body></html>');
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Pride"]').click();
  });
  await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(16, 10, 18)');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor), 'rgb(16, 10, 18)');
});

test('open shadow roots of viewport shells receive the palette', async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  await page.addInitScript(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
    window.GM_xmlhttpRequest = () => {};
  });
  await page.setContent('<!doctype html><html><head></head><body style="margin:0;background:#fff"></body></html>');
  await page.evaluate(() => {
    const host = document.createElement('div');
    host.id = 'shadow-shell';
    host.style.cssText = 'display:block;width:100%;height:100vh;background:#ffffff';
    const shadow = host.attachShadow({ mode: 'open' });
    const inner = document.createElement('div');
    inner.id = 'inner';
    inner.style.cssText = 'display:block;width:100%;height:100%;background:#f4f4f4;color:#111';
    inner.textContent = 'Shadow app';
    shadow.append(inner);
    document.body.append(host);
  });
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Midnight"]').click();
  });
  await page.waitForFunction(() => {
    const inner = document.getElementById('shadow-shell')?.shadowRoot?.getElementById('inner');
    return inner && getComputedStyle(inner).backgroundColor !== 'rgb(255, 255, 255)';
  });
  assert.notEqual(await page.evaluate(() => getComputedStyle(document.getElementById('shadow-shell')).backgroundColor), 'rgb(255, 255, 255)');
});

test('launcher omits the retired helper tooltip', async (t) => {
  const { browser, page } = await fixture({ width: 900, height: 700 });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  const result = await root.evaluate((host) => {
    const launcher = host.shadowRoot.querySelector('.launcher');
    const styles = [...host.shadowRoot.querySelectorAll('style')].map((node) => node.textContent).join('\n');
    const hasCss = styles.includes('.launcher.tip-below::before');
    return { hasCss, help: launcher.dataset.help || '' };
  });
  assert.deepEqual(result, { hasCss: false, help: '' });
});

test('route headers do not carry restated helper tips', async (t) => {
  const { browser, page } = await fixture({ width: 900, height: 700 });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  const tips = await root.evaluate((host) => {
    const shadow = host.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="menu"]')?.click();
    return {
      headers: [...shadow.querySelectorAll('.fl-tool-header')].map((node) => ({
        tip: node.dataset.tip || '',
        hasTooltip: node.classList.contains('has-tooltip'),
      })),
      rows: [...shadow.querySelectorAll('.row')].map((node) => ({
        tip: node.dataset.tip || '',
        hasTooltip: node.classList.contains('has-tooltip'),
      })),
    };
  });
  assert.ok(tips.headers.length >= 4);
  assert.ok(tips.headers.every((item) => !item.tip && !item.hasTooltip), JSON.stringify(tips.headers));
  assert.ok(tips.rows.length > 0);
  assert.ok(tips.rows.every((item) => !item.tip && !item.hasTooltip), JSON.stringify(tips.rows));
});


test('3.1 color engine transforms stylesheet hierarchy', async (t) => {
  const { browser, page } = await fixture({
    html: `<!doctype html><html><head><style id="site-theme">
      body{margin:0;background:#ffffff;color:#202020}
      .low{background:#f7f7f7;color:#222;border:1px solid #dddddd;padding:12px}
      .mid{background:#dedede;color:#292929;border:1px solid #bbbbbb;padding:12px}
      .brand{background:#dbeafe;color:#17365d;border:1px solid #60a5fa;padding:12px}
    </style></head><body><div class="low" id="low">Low</div><div class="mid" id="mid">Mid</div><div class="brand" id="brand">Brand</div></body></html>`
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="SHIFT gem"]').click();
  });
  await page.waitForFunction(() => document.querySelectorAll('style[data-exp-shift-dynamic]').length > 0);
  const themed = await page.evaluate(() => ({
    low: getComputedStyle(document.getElementById('low')).backgroundColor,
    mid: getComputedStyle(document.getElementById('mid')).backgroundColor,
    brand: getComputedStyle(document.getElementById('brand')).backgroundColor,
    generated: document.querySelectorAll('style[data-exp-shift-dynamic]').length,
  }));
  assert.ok(themed.generated > 0, JSON.stringify(themed));
  assert.notEqual(themed.low, 'rgb(247, 247, 247)');
  assert.notEqual(themed.mid, 'rgb(222, 222, 222)');
  assert.notEqual(themed.brand, 'rgb(219, 234, 254)');
  assert.notEqual(themed.low, themed.mid, JSON.stringify(themed));

});

test('3.1 color engine follows dynamically replaced stylesheets', async (t) => {
  const { browser, page } = await fixture({
    html: '<!doctype html><html><head><style id="dynamic">.dynamic-card{background:#fafafa;color:#111;border:1px solid #ddd}</style></head><body><div id="card" class="dynamic-card">Dynamic</div></body></html>'
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Midnight"]').click();
  });
  await page.waitForFunction(() => document.querySelectorAll('style[data-exp-shift-dynamic]').length > 0);
  const first = await page.evaluate(() => getComputedStyle(document.getElementById('card')).backgroundColor);
  await page.evaluate(() => {
    const old = document.getElementById('dynamic');
    const next = document.createElement('style');
    next.id = 'dynamic';
    next.textContent = '.dynamic-card{background:#d8f3dc;color:#15351f;border:2px solid #52b788}';
    old.replaceWith(next);
  });
  await page.waitForFunction((previous) => getComputedStyle(document.getElementById('card')).backgroundColor !== previous, first);
  const facts = await page.evaluate(() => ({
    bg: getComputedStyle(document.getElementById('card')).backgroundColor,
    generated: document.querySelectorAll('style[data-exp-shift-dynamic]').length,
  }));
  assert.notEqual(facts.bg, 'rgb(216, 243, 220)');
  assert.ok(facts.generated > 0, JSON.stringify(facts));
});

test('3.1 color engine transforms inline colors and semantic variables', async (t) => {
  const { browser, page } = await fixture({
    html: '<!doctype html><html><body><div id="inline" style="--card-background:#f4f4f4;--text-primary:#202020;background-color:#fafafa;color:#222;border:1px solid #ddd">Inline</div></body></html>'
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Ember"]').click();
  });
  await page.waitForFunction(() => document.getElementById('inline').hasAttribute('data-exp-shift-inline'));
  const themed = await page.evaluate(() => {
    const el = document.getElementById('inline');
    return {
      bg: el.style.getPropertyValue('background-color'),
      text: el.style.getPropertyValue('color'),
      variable: el.style.getPropertyValue('--card-background'),
      varMarker: el.getAttribute('data-exp-shift-vars'),
    };
  });
  assert.notEqual(themed.bg, '#fafafa');
  assert.notEqual(themed.text, '#222');
  assert.notEqual(themed.variable, '#f4f4f4');
  assert.match(themed.varMarker || '', /--card-background/);

});


test('3.1 color engine transforms styles inside open shadow roots', async (t) => {
  const { browser, page } = await fixture();
  t.after(() => browser.close());
  await page.evaluate(() => {
    const host = document.createElement('div');
    host.id = 'component-host';
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>.part{background:#f1f1f1;color:#191919;border:1px solid #ccc}</style><div class="part" id="part">Part</div>';
    document.body.append(host);
  });
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Midnight"]').click();
  });
  await page.waitForFunction(() => document.getElementById('component-host').shadowRoot.querySelectorAll('style[data-exp-shift-dynamic]').length > 0);
  const facts = await page.evaluate(() => {
    const shadow = document.getElementById('component-host').shadowRoot;
    return {
      bg: getComputedStyle(shadow.getElementById('part')).backgroundColor,
      generated: shadow.querySelectorAll('style[data-exp-shift-dynamic]').length,
    };
  });
  assert.notEqual(facts.bg, 'rgb(241, 241, 241)');
  assert.ok(facts.generated > 0);
});

test('3.1 color engine transforms adopted stylesheets without replacing site sheets', async (t) => {
  const { browser, page } = await fixture();
  t.after(() => browser.close());
  const supported = await page.evaluate(() => typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in Document.prototype && typeof CSSStyleSheet.prototype.replaceSync === 'function');
  if (!supported) return;
  await page.evaluate(() => {
    const host = document.createElement('div');
    host.id = 'adopted-host';
    const shadow = host.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync('.adopted-part{background:#f5f5f5;color:#181818;border:1px solid #ccc}');
    shadow.adoptedStyleSheets = [sheet];
    const part = document.createElement('div');
    part.id = 'adopted-part';
    part.className = 'adopted-part';
    part.textContent = 'Adopted';
    shadow.append(part);
    document.body.append(host);
  });
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Ember"]').click();
  });
  await page.waitForFunction(() => document.getElementById('adopted-host').shadowRoot.querySelectorAll('style[data-exp-shift-dynamic]').length > 0);
  const facts = await page.evaluate(() => {
    const shadow = document.getElementById('adopted-host').shadowRoot;
    return {
      bg: getComputedStyle(shadow.getElementById('adopted-part')).backgroundColor,
      siteSheets: shadow.adoptedStyleSheets.length,
      overrides: shadow.querySelectorAll('style[data-exp-shift-dynamic]').length,
    };
  });
  assert.notEqual(facts.bg, 'rgb(245, 245, 245)');
  assert.equal(facts.siteSheets, 1);
  assert.equal(facts.overrides, 1);
});


test('3.1 avoids inline rewriting on explicit native dark pages', async (t) => {
  const { browser, page } = await fixture({
    html: '<!doctype html><html style="color-scheme:dark;background:#101318"><head><meta name="color-scheme" content="dark"><style>.native-card{background:#1c2128;color:#e6edf3;border:1px solid #30363d}</style></head><body style="margin:0;background:#101318;color:#e6edf3"><div id="native-card" class="native-card">Native dark</div></body></html>'
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="SHIFT gem"]').click();
  });
  await page.waitForTimeout(500);
  const facts = await page.evaluate(() => ({
    generated: document.querySelectorAll('style[data-exp-shift-dynamic]').length,
    inlineRepair: document.getElementById('native-card').hasAttribute('data-exp-shift-inline'),
    cardBg: getComputedStyle(document.getElementById('native-card')).backgroundColor,
    host: document.documentElement.getAttribute('data-exp-shift'),
  }));
  assert.ok(facts.generated <= 2, JSON.stringify(facts));
  assert.equal(facts.inlineRepair, false, JSON.stringify(facts));
  assert.notEqual(facts.cardBg, 'rgb(255, 255, 255)', JSON.stringify(facts));
  assert.equal(facts.host, 'shift');
});

test('3.1 still transforms dark-looking pages that do not declare a native dark scheme', async (t) => {
  const { browser, page } = await fixture({
    html: '<!doctype html><html style="background:#151515"><head><style>.card{background:#f4f4f4;color:#181818}</style></head><body style="margin:0;background:#151515"><div id="mixed-card" class="card">Mixed page</div></body></html>'
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Verdant"]').click();
  });
  await page.waitForFunction(() => document.querySelectorAll('style[data-exp-shift-dynamic]').length > 0);
  const bg = await page.evaluate(() => getComputedStyle(document.getElementById('mixed-card')).backgroundColor);
  assert.notEqual(bg, 'rgb(244, 244, 244)');
});


test('3.1 contrast-aware foreground repair keeps transformed text readable', async (t) => {
  const { browser, page } = await fixture({
    html: '<!doctype html><html><body><div id="contrast-card" style="width:420px;height:120px;background-color:#f4d7df;color:#b05a70;padding:20px">Muted source text</div></body></html>'
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="SHIFT gem"]').click();
  });
  await page.waitForFunction(() => document.getElementById('contrast-card').hasAttribute('data-exp-shift-inline'));
  const ratio = await page.evaluate(() => {
    const parse = (value) => {
      const m = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
    };
    const lum = (rgb) => {
      const linear = (v) => { const n = v / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; };
      return .2126 * linear(rgb[0]) + .7152 * linear(rgb[1]) + .0722 * linear(rgb[2]);
    };
    const el = document.getElementById('contrast-card');
    const css = getComputedStyle(el);
    const fg = lum(parse(css.color));
    const bg = lum(parse(css.backgroundColor));
    return (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05);
  });
  assert.ok(ratio >= 4.5, String(ratio));
});

test('3.1 contrast repair preserves colored foreground identity when already readable', async (t) => {
  const { browser, page } = await fixture({
    html: '<!doctype html><html><body><div id="colored-copy" style="width:420px;height:120px;background-color:#ffffff;color:#0057b8;padding:20px">Colored text</div></body></html>'
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="Midnight"]').click();
  });
  await page.waitForFunction(() => document.getElementById('colored-copy').hasAttribute('data-exp-shift-inline'));
  const color = await page.evaluate(() => getComputedStyle(document.getElementById('colored-copy')).color);
  assert.notEqual(color, 'rgb(232, 238, 246)');
});


test('3.1 transforms pseudo-element chrome and CSS gradients while preserving URL art', async (t) => {
  const { browser, page } = await fixture({
    html: `<!doctype html><html><head><style>
      .pseudo::before{content:"";display:block;width:60px;height:20px;background:#fafafa;border:2px solid #ddd}
      .gradient{width:300px;height:100px;background-image:linear-gradient(90deg,#ffffff,#dbeafe,#eeeeee)}
      .art{width:300px;height:100px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='20' height='20' fill='red'/%3E%3C/svg%3E")}
    </style></head><body><div id="pseudo" class="pseudo"></div><div id="gradient" class="gradient"></div><div id="art" class="art"></div></body></html>`
  });
  t.after(() => browser.close());
  const root = page.locator('#exp-shift-root');
  await root.evaluate((node) => {
    const shadow = node.shadowRoot;
    shadow.querySelector('.launcher').click();
    shadow.querySelector('[data-section="appearance"]').click();
    shadow.querySelector('.exp-theme-swatch[aria-label="SHIFT gem"]').click();
  });
  await page.waitForFunction(() => document.querySelectorAll('style[data-exp-shift-dynamic]').length > 0);
  const facts = await page.evaluate(() => ({
    pseudo: getComputedStyle(document.getElementById('pseudo'), '::before').backgroundColor,
    gradient: getComputedStyle(document.getElementById('gradient')).backgroundImage,
    art: getComputedStyle(document.getElementById('art')).backgroundImage,
  }));
  assert.notEqual(facts.pseudo, 'rgb(250, 250, 250)');
  assert.match(facts.gradient, /linear-gradient/i);
  assert.doesNotMatch(facts.gradient, /rgb\(255, 255, 255\)/);
  assert.match(facts.art, /url\(/i);
});

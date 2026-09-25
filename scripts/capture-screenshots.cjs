'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'docs', 'screenshots');
const script = fs.readFileSync(path.join(root, 'shift.user.js'), 'utf8');

const fixtureHtml = `<!doctype html><html><head><style>body{margin:0;background:#fff;color:#222;font:16px/1.4 system-ui,sans-serif}header,main,section{display:block;background:#f4f4f4;padding:24px;margin:10px}section{width:420px;height:120px}a{color:#164f8b}</style></head><body><header>Header</header><main><h1>Fixture</h1><section><a href="#test">Link</a><label>Field <input placeholder="Example"></label></section><img alt="Artwork" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='red'/%3E%3C/svg%3E"></main></body></html>`;

const MENU_SHOTS = [
  { route: 'appearance', file: 'appearance-menu.png' },
  { route: 'readability', file: 'readability-menu.png' },
  { route: 'effects', file: 'effects-menu.png' },
  { route: 'recovery', file: 'recovery-menu.png' },
];

const gmInit = () => {
  const values = new Map();
  window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
  window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
  window.GM_xmlhttpRequest = () => {};
};

async function mount(page) {
  await page.addInitScript(gmInit);
  await page.setContent(fixtureHtml);
  await page.evaluate(gmInit);
  await page.addScriptTag({ content: script });
  await page.waitForSelector('#exp-shift-root', { state: 'attached' });
}

async function ensureMenuOpen(page) {
  await page.evaluate(() => {
    const panel = document.querySelector('#exp-shift-root').shadowRoot.querySelector('.panel');
    if (!panel.hidden) return;
    document.querySelector('#exp-shift-root').shadowRoot.querySelector('.launcher').click();
  });
}

async function capturePanel(page, fileName) {
  const handle = await page.evaluateHandle(() => document.querySelector('#exp-shift-root').shadowRoot.querySelector('.panel'));
  await handle.asElement().screenshot({ path: path.join(outDir, fileName) });
  await handle.dispose();
}

async function setRoute(page, routeId) {
  await page.locator('#exp-shift-root').evaluate((node, id) => {
    const shadow = node.shadowRoot;
    for (const route of shadow.querySelectorAll('[data-route]')) {
      const open = route.dataset.route === id;
      if (open !== (route.getAttribute('aria-expanded') === 'true')) route.click();
    }
  }, routeId);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const stale of fs.readdirSync(outDir).filter((name) => name.endsWith('.png'))) {
    fs.unlinkSync(path.join(outDir, stale));
  }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 2400 }, deviceScaleFactor: 2 });
  await mount(page);
  await ensureMenuOpen(page);

  await page.locator('#exp-shift-root').evaluate((node) => {
    const shadow = node.shadowRoot;
    const appearance = shadow.querySelector('[data-route="appearance"]');
    if (appearance.getAttribute('aria-expanded') !== 'true') appearance.click();
    const gem = shadow.querySelector('.exp-theme-swatch[aria-label="SHIFT gem"]');
    if (!gem) throw new Error('Missing SHIFT gem swatch');
    gem.click();
    const menu = shadow.querySelector('[data-route="menu"]');
    if (menu.getAttribute('aria-expanded') !== 'true') menu.click();
    const width = [...shadow.querySelectorAll('select')].find((item) => item.getAttribute('aria-label') === 'Menu width');
    if (!width) throw new Error('Missing Menu width control');
    width.value = 'full';
    width.dispatchEvent(new Event('change', { bubbles: true }));
    const autoClose = shadow.querySelector('[role="switch"][aria-label="Automatic menu close"]');
    if (autoClose?.getAttribute('aria-checked') === 'true') autoClose.click();
    if (menu.getAttribute('aria-expanded') === 'true') menu.click();
    const toast = shadow.querySelector('.toast');
    if (toast) toast.hidden = true;
  });
  await page.waitForTimeout(160);
  await capturePanel(page, 'menu-overview.png');

  for (const shot of MENU_SHOTS) {
    await setRoute(page, shot.route);
    await page.waitForTimeout(180);
    await capturePanel(page, shot.file);
  }

  await browser.close();
  console.log(`Captured ${MENU_SHOTS.length + 1} screenshots in ${path.relative(root, outDir)}/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

'use strict';

// Regenerates the README screenshots from the built userscript against a local sample page.
//   npm run screenshots
// Images are captured into a temporary folder first, so a failed run never leaves docs/screenshots half updated.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs', 'screenshots');
const HOST = '#exp-shift-root';
const THEME = 'Midnight';

const samplePage = `<!doctype html><html><head><meta charset="utf-8"><title>Sample page</title><style>
body{margin:0;background:#fff;color:#222;font:18px/1.55 system-ui,sans-serif}
main{max-width:430px;margin:36px}
.card{background:#f1f1f1;border:1px solid #ddd;border-radius:14px;padding:22px 26px;margin:20px 0}
h1{font-size:38px;margin:0 0 .3em}h2{margin-top:0}a{color:#164f8b}
</style></head><body><main>
<h1>A calmer space to browse</h1>
<div class="card"><h2>Read at your own pace</h2><p>Adjust appearance, keep text readable, and choose the controls that work for you.</p><p><a href="#guide">Explore the guide</a></p></div>
<div class="card"><h2>Community</h2><p>Every page keeps its layout while colors follow your theme.</p></div>
</main></body></html>`;

function gmStub() {
  const values = new Map();
  window.GM_getValue = (key, fallback) => (values.has(key) ? values.get(key) : fallback);
  window.GM_setValue = (key, value) => values.set(key, value);
  window.GM_deleteValue = (key) => values.delete(key);
  window.GM_listValues = () => [...values.keys()];
  window.GM_addValueChangeListener = () => 1;
  window.GM_registerMenuCommand = () => {};
  window.GM_xmlhttpRequest = (options) => { queueMicrotask(() => options.onerror?.({ status: 0 })); return { abort() {} }; };
}

// Use Playwright's bundled Chromium when installed, otherwise the system Edge.
const launch = () => chromium.launch().catch(() => chromium.launch({ channel: 'msedge' }));

async function openSection(page, section, tab) {
  const host = page.locator(HOST);
  const header = host.locator('.fl-tool-header').filter({ hasText: section });
  if (await header.getAttribute('aria-expanded') !== 'true') await header.click();
  if (tab) await host.getByRole('tab', { name: tab, exact: true }).click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
}

(async () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'shift-shots-'));
  const browser = await launch();
  const files = ['appearance-demo.png', 'readability.png'];
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 760 }, deviceScaleFactor: 2 });
    await page.addInitScript(gmStub);
    await page.route('**/*', (route) => {
      const asset = route.request().url().match(/raw\.githubusercontent\.com\/ExtraPotions\/SHIFT\/main\/(assets\/.+)$/);
      if (asset) return route.fulfill({ path: path.join(root, asset[1]) });
      if (route.request().isNavigationRequest()) return route.fulfill({ status: 200, contentType: 'text/html', body: samplePage });
      return route.abort();
    });
    await page.goto('https://sample.test/read');
    await page.addScriptTag({ content: fs.readFileSync(path.join(root, 'shift.user.js'), 'utf8') });
    const host = page.locator(HOST);
    await host.locator('[data-exp-part="launcher"]').click();
    await page.waitForTimeout(400);

    // The sample page with a website theme applied next to the open Appearance menu.
    await openSection(page, 'Appearance', 'Overview');
    const swatch = host.locator(`.exp-theme-swatch[aria-label*="${THEME}"]`);
    if (!await swatch.count()) {
      const found = await host.locator('.exp-theme-swatch').evaluateAll((items) => items.map((item) => item.getAttribute('aria-label')));
      throw new Error(`Missing ${THEME} theme; found ${found.join(', ')}`);
    }
    await swatch.first().click();
    await page.waitForTimeout(600);
    await host.evaluate((node) => { for (const toast of node.shadowRoot.querySelectorAll('.toast')) toast.hidden = true; });
    await page.screenshot({ path: path.join(work, files[0]) });

    await page.setViewportSize({ width: 900, height: 1400 });
    await openSection(page, 'Appearance', 'Readability');
    await host.locator('[data-exp-part="dock"]').screenshot({ path: path.join(work, files[1]) });

    fs.mkdirSync(output, { recursive: true });
    for (const file of files) fs.copyFileSync(path.join(work, file), path.join(output, file));
  } finally {
    await browser.close();
    fs.rmSync(work, { recursive: true, force: true });
  }
  console.log(`Captured ${files.length} SHIFT screenshots in ${path.relative(root, output)}/`);
})().catch((error) => { console.error(error); process.exit(1); });

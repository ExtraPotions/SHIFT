'use strict';

// Regenerates docs/screenshots from the built userscript against a sample page.
//   npm run screenshots
// Screenshots are written to a temporary folder first, so a failed run never
// leaves docs/screenshots half empty.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'docs', 'screenshots');
const script = fs.readFileSync(path.join(root, 'shift.user.js'), 'utf8');
const HOST = '#exp-shift-root';
const DOCK = '[data-exp-part="dock"]';

const sampleHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#fff;color:#222;font:18px/1.5 system-ui,sans-serif}
.page{max-width:900px;margin:0 0 0 60px;padding:60px 0}
.eyebrow{letter-spacing:.12em;text-transform:uppercase;font-size:14px}
h1{font-size:44px;margin:.3em 0}
.card{background:#f1f1f1;border:1px solid #ddd;border-radius:14px;padding:28px 32px;margin:24px 0}
a{color:#164f8b}input{font:inherit;padding:10px 14px;margin-left:8px}
</style></head><body><div class="page">
<div class="eyebrow">Sample page · demonstration content</div>
<h1>A calmer space to browse</h1>
<div class="card"><h2>Read at your own pace</h2><p>Adjust appearance, keep text readable, and choose the controls that work for you.</p><p><a href="#guide">Explore the guide</a></p><label>Search the guide <input placeholder="Search topics"></label></div>
<div class="card"><h2>Community language</h2><p>The lesbian, gay, bisexual, transgender, nonbinary and pansexual communities have a place here.</p></div>
</div></body></html>`;

const gmInit = () => {
  const values = new Map();
  window.GM_getValue = (key, fallback) => (values.has(key) ? values.get(key) : fallback);
  window.GM_setValue = (key, value) => values.set(key, structuredClone(value));
  window.GM_deleteValue = (key) => values.delete(key);
  window.GM_addValueChangeListener = () => 1;
  window.GM_registerMenuCommand = () => {};
  window.GM_info = { script: { version: '3.0.0' }, scriptHandler: 'Screenshot fixture' };
  window.GM_xmlhttpRequest = () => {};
};

async function shadowAction(page, action, argument) {
  return page.locator(HOST).evaluate((node, [name, value]) => {
    const shadow = node.shadowRoot;
    const submenu = (label) => [...shadow.querySelectorAll('details')].find((item) => item.querySelector(':scope > summary')?.textContent.trim().startsWith(label));
    if (name === 'open-menu') {
      if (!shadow.querySelector('[data-exp-part="dock"]').classList.contains('fl-rail-open')) shadow.querySelector('.launcher').click();
    } else if (name === 'section') {
      for (const header of shadow.querySelectorAll('.fl-tool-header')) {
        const wanted = (header.dataset.route || header.dataset.section || header.dataset.panel) === value;
        if (wanted !== (header.getAttribute('aria-expanded') === 'true')) header.click();
      }
    } else if (name === 'submenu') {
      const item = submenu(value);
      if (!item) throw new Error(`Missing submenu: ${value}`);
      item.open = true;
    } else if (name === 'palette') {
      const swatch = shadow.querySelector(`.exp-theme-swatch[aria-label="${value}"]`);
      if (!swatch) throw new Error(`Missing palette: ${value}; found ${[...shadow.querySelectorAll(".exp-theme-swatch")].map((x) => x.getAttribute("aria-label")).join("|")}; headers ${[...shadow.querySelectorAll(".fl-tool-header")].map((h) => h.dataset.route + ":" + h.getAttribute("aria-expanded")).join("|")}`);
      swatch.click();
    } else if (name === 'hide-toast') {
      for (const toast of shadow.querySelectorAll('.toast')) toast.hidden = true;
    }
  }, [action, argument]);
}

async function settle(page) { await page.waitForTimeout(220); }

async function main() {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'shift-shots-'));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
    await page.addInitScript(gmInit);
    await page.setContent(sampleHtml);
    await page.evaluate(gmInit);
    await page.addScriptTag({ content: script });
    await page.waitForSelector(HOST, { state: 'attached' });

    const dock = page.locator(HOST).locator(DOCK);
    const shot = async (name, target) => (target || dock).screenshot({ path: path.join(work, name) });

    await shot('current-fixture.png', page);
    await shadowAction(page, 'open-menu');
    await settle(page);
    await shadowAction(page, 'section', 'appearance');
    await settle(page);
    await shadowAction(page, 'palette', 'SHIFT gem');
    await settle(page);
    await shadowAction(page, 'section', '');
    await shadowAction(page, 'hide-toast');
    await settle(page);
    await shot('menu-overview.png');

    await shadowAction(page, 'section', 'appearance');
    await settle(page);
    await shot('appearance-menu.png');

    await shadowAction(page, 'submenu', 'Readability');
    await settle(page);
    await shot('readability-menu.png');
    await shot('readability.png', page);

    await shadowAction(page, 'section', 'advanced');
    await settle(page);
    await shadowAction(page, 'submenu', 'Effects');
    await settle(page);
    await shot('effects-menu.png');

    await shadowAction(page, 'section', 'system');
    await settle(page);
    await shot('recovery-menu.png');

    await shadowAction(page, 'section', 'appearance');
    await settle(page);
    await shadowAction(page, 'palette', 'Midnight');
    await shadowAction(page, 'hide-toast');
    await settle(page);
    await shot('appearance-demo.png', page);

    fs.mkdirSync(outDir, { recursive: true });
    const names = fs.readdirSync(work).filter((name) => name.endsWith('.png'));
    for (const name of names) fs.copyFileSync(path.join(work, name), path.join(outDir, name));
    console.log(`Captured ${names.length} screenshots in ${path.relative(root, outDir)}/`);
  } finally {
    await browser.close();
    fs.rmSync(work, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

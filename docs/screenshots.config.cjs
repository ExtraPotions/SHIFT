'use strict';

// README screenshots, captured by exp-core's shared tool: npm run screenshots

const THEME = 'Midnight';

async function applyTheme(page, host) {
  const swatch = host.locator(`.exp-theme-swatch[aria-label*="${THEME}"]`);
  if (!(await swatch.count())) {
    const found = await host.locator('.exp-theme-swatch').evaluateAll(items => items.map(item => item.getAttribute('aria-label')));
    throw new Error(`Missing ${THEME} theme; found ${found.join(', ')}`);
  }
  await swatch.first().click();
  await page.waitForTimeout(600);
}

module.exports = {
  build: ['scripts/build.cjs'],
  userscript: 'shift.user.js',
  host: '#exp-shift-root',
  url: 'https://sample.test/read',
  page: `<!doctype html><html><head><meta charset="utf-8"><title>Sample page</title><style>
body{margin:0;background:#fff;color:#222;font:18px/1.55 system-ui,sans-serif}
main{max-width:430px;margin:36px}
.card{background:#f1f1f1;border:1px solid #ddd;border-radius:14px;padding:22px 26px;margin:20px 0}
h1{font-size:38px;margin:0 0 .3em}h2{margin-top:0}a{color:#164f8b}
</style></head><body><main>
<h1>A calmer space to browse</h1>
<div class="card"><h2>Read at your own pace</h2><p>Adjust appearance, keep text readable, and choose the controls that work for you.</p><p><a href="#guide">Explore the guide</a></p></div>
<div class="card"><h2>Community</h2><p>Every page keeps its layout while colors follow your theme.</p></div>
</main></body></html>`,
  viewport: { width: 900, height: 760 },
  shots: [
    // The sample page with a website theme applied next to the open Appearance menu.
    { file: 'appearance-demo.png', section: 'Appearance', tab: 'Overview', include: 'page', before: applyTheme },
    { file: 'readability.png', section: 'Appearance', tab: 'Readability', viewport: { width: 900, height: 1400 } },
  ],
};

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const script = fs.readFileSync(path.resolve(__dirname, '../shift.user.js'), 'utf8');

for (const theme of ['original', 'midnight']) {
 for (const fallback of [false, true]) {
  test(`launcher cannot cover the page with a site backdrop (${theme}, fallback=${fallback})`, async t => {
    const browser = await chromium.launch();
    t.after(() => browser.close());
    const page = await browser.newPage({ colorScheme: 'dark' });
    await page.setContent('<style>:root{color-scheme:dark}body{background:#0a0a0a;color:white}::backdrop{background:#fff9}dialog{width:200px;height:100px}</style><main><h1>Visible page</h1><button id="site">Site action</button></main><dialog>Site dialog</dialog>');
    await page.evaluate(({theme, fallback}) => {
      if (fallback) window.CSSStyleSheet = undefined;
      window.GM_getValue = (key, fallback) => key === 'exp:v3:shift:settings' ? {theme, accent:'midnight-default'} : fallback;
      window.GM_setValue = () => {};
      window.GM_xmlhttpRequest = () => {};
    }, {theme, fallback});
    await page.addScriptTag({ content: script });
    await page.waitForFunction(() => document.querySelector('#exp-shift-root')?.matches(':popover-open'));
    const backdrop = () => page.locator('#exp-shift-root').evaluate(host => {
      const style = getComputedStyle(host, '::backdrop');
      return {display:style.display, background:style.backgroundColor, pointerEvents:style.pointerEvents};
    });
    assert.equal((await backdrop()).display, 'none', 'launcher backdrop must never paint over the site');
    await page.addStyleTag({content:'::backdrop{background:white!important;backdrop-filter:blur(20px)!important;pointer-events:auto!important}'});
    assert.equal((await backdrop()).display, 'none', 'late opaque site backdrops must remain isolated');
    assert.equal((await backdrop()).pointerEvents, 'none');
    await page.locator('#site').click();
    await page.locator('#exp-shift-root .launcher').click();
    await page.locator('#exp-shift-root .launcher').click();
    await page.evaluate(() => document.querySelector('dialog').showModal());
    assert.equal(await page.locator('dialog').evaluate(n=>getComputedStyle(n,'::backdrop').backgroundColor), 'rgb(255, 255, 255)', 'real site modal backdrops retain their styling');
  });
 }
}

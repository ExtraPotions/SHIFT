'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { loadSource } = require('./load-source.cjs');

async function fixture(t, html) {
  const browser = await chromium.launch(); t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  await page.addInitScript(() => {
    const values = new Map();
    window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
    window.GM_setValue = (key, value) => values.set(key, value);
    window.GM_xmlhttpRequest = () => ({ abort() {} });
  });
  await page.setContent(html);
  await page.addScriptTag({ content: loadSource().replace('\nbootOnce();', '\nwindow.testShift=EXP;bootOnce();') });
  await page.evaluate(() => testShift.Engine.apply({ ...testShift.Settings.effective(), theme: 'midnight', excluded: false, safeMode: false }));
  return page;
}

test('removed repaired feed cards are collectible while SHIFT remains active', async t => {
  const page = await fixture(t, '<main id="feed" style="display:grid;grid-template-columns:repeat(10,1fr)"></main>');
  const cdp = await page.context().newCDPSession(page);
  await page.evaluate(() => { window.retiredCards = []; });
  for (let round = 0; round < 3; round++) {
    await page.evaluate(() => {
      const feed = document.getElementById('feed');
      for (let n = 0; n < 40; n++) {
        const card = document.createElement('div');
        card.style.cssText = 'height:30px;background:#fff;color:#fff;--card-background:#fff';
        card.textContent = 'Feed card'; feed.append(card);
        retiredCards.push(new WeakRef(card));
      }
      testShift.LiveResolver.fullScan();
      if (![...feed.children].some(node => node.hasAttribute('data-exp-shift-inline') || node.hasAttribute('data-exp-shift-live'))) throw new Error('Fixture must exercise saved repairs');
      feed.replaceChildren();
    });
    await page.waitForTimeout(100);
    await cdp.send('HeapProfiler.collectGarbage');
  }
  const retained = await page.evaluate(() => retiredCards.filter(ref => ref.deref()).length);
  assert.equal(retained, 0, 'removed cards must not remain reachable through restoration ledgers');
  assert.equal(await page.evaluate(() => testShift.LiveResolver.health().active), true);
});

test('removal restores original inline styles and pseudo rules before reinsert and disable', async t => {
  const page = await fixture(t, '<style data-exp-owned="1">.pseudo::before{content:"badge";background:white;color:white}</style><main id="feed"></main>');
  const facts = await page.evaluate(async () => {
    const wait = () => new Promise(resolve => setTimeout(resolve, 100));
    const card = document.createElement('div');
    card.className = 'pseudo'; card.style.cssText = 'height:40px;background:#fff;color:#fff;--card-background:#fff'; card.textContent = 'Reusable card';
    const original = card.getAttribute('style'); document.getElementById('feed').append(card);
    testShift.LiveResolver.fullScan();
    const repaired = card.getAttribute('style') !== original;
    const pseudoId = card.getAttribute('data-exp-shift-pseudo-id');
    const destination = document.createElement('section'); document.body.append(destination);
    destination.append(card); await wait();
    const movePreserved = card.getAttribute('style') !== original;
    card.remove(); await wait();
    const restored = card.getAttribute('style');
    const pseudoGone = !card.hasAttribute('data-exp-shift-pseudo-id') && !(document.querySelector('style[data-exp-shift-live-pseudo]')?.textContent || '').includes(`"${pseudoId}"`);
    document.getElementById('feed').append(card); testShift.LiveResolver.fullScan();
    const repairedAgain = card.getAttribute('style') !== original;
    testShift.LiveResolver.stop();
    return { original, repaired, movePreserved, restored, pseudoId, pseudoGone, repairedAgain, final: card.getAttribute('style') };
  });
  assert.equal(facts.repaired, true); assert.ok(facts.pseudoId);
  assert.equal(facts.movePreserved, true);
  assert.equal(facts.restored, facts.original); assert.equal(facts.pseudoGone, true);
  assert.equal(facts.repairedAgain, true); assert.equal(facts.final, facts.original);
});

test('native option and optgroup palettes stay readable without recoloring owned controls', async t => {
  const page = await fixture(t, '<style>select{background:white;color:#111}option,optgroup{background:white}</style><style data-exp-owned="1">#owned,#owned option{color:#111!important;background:white!important}</style><select id="site"><optgroup label="Group"><option>First</option><option>Second</option></optgroup></select><div data-exp-owned="1"><select id="owned"><option>Owned option</option></select></div>');
  for (const theme of ['midnight', 'amethyst', 'original']) {
    const facts = await page.evaluate(theme => {
      testShift.Engine.apply({ ...testShift.Settings.effective(), theme, excluded: false, safeMode: false, formReadability: true });
      const items = [...document.querySelectorAll('#site option,#site optgroup')].map(node => {
        const style = getComputedStyle(node);
        return { color: style.color, background: style.backgroundColor, contrast: testShift.ColorEngine.contrastRatio(testShift.ColorEngine.parse(style.color), testShift.ColorEngine.parse(style.backgroundColor)) };
      });
      return { items, owned: getComputedStyle(document.querySelector('#owned option')).color };
    }, theme);
    assert.ok(facts.items.every(item => item.contrast >= 4.5), `${theme}: ${JSON.stringify(facts)}`);
    assert.equal(facts.owned, 'rgb(17, 17, 17)');
  }
});

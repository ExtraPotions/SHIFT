'use strict';
// Fixtures are trimmed from the live pages (October 2026): EDHREC and Archidekt hash their class names, so the
// adapters match on the stable part of each name and scope it under the card it belongs to.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const script = fs.readFileSync(path.resolve(__dirname, '../shift.user.js'), 'utf8');
const DAY = 86400000;
const iso = (daysAgo) => new Date(Date.now() - daysAgo * DAY).toISOString();

const edhrecCard = (id) => `<li class="ZnARQW_rec"><div class="_1abGTq_container"><div class="_1abGTq_inner"><div class="_1abGTq_faces"><div class="wz3HWa_container wz3HWa_hasPrices"><div class="wz3HWa_faces"><div class="wz3HWa_cardFront" id="${id}-front">Atraxa</div></div><div class="wz3HWa_prices" id="${id}-prices"><div class="Tst9Ya_container"><ul class="Tst9Ya_pricesMain"><li><a href="#">$27.99</a></li></ul></div></div></div></div></div></div></li>`;
const EDHREC = `<div class="e_GtJW_inner"><div class="e_GtJW_adLeaderboard" id="leaderboard">Ad</div></div>
  <div id="adhesion_desktop_wrapper" class="adhesion_wrapper"><div id="adhesion_desktop" class="adunit">Ad</div></div>
  <div id="universalPlayer_wrapper" class="adunitwrapper"><div id="universalPlayer" class="adunit">Ad</div></div>
  <div class="BRNVZG_container" style="display:flex"><div class="_8tMbPa_container" id="ad-rail" style="flex:0 0 300px"><div class="_8tMbPa_content"><div class="mvSidebar1"></div><a class="iFq2Tq_container" href="#">Please consider supporting us on Patreon to remove ads.</a></div></div><main class="rMAYjG_container" id="main">Recs</main></div>
  <div class="Pq2rTa_pricesSummary" id="summary">Average deck price $400</div>
  <ul class="ZnARQW_grid" id="grid" style="display:grid;gap:24px 10px">${edhrecCard('a')}${edhrecCard('b')}</ul>`;

const ARCHIDEKT = `<div class="decks_center__aKdPY" id="center"><div id="deck-top" class="inlineInhouseAd_demoBannerAd__BT4MQ decks_ad__7djpy"><a class="inlineInhouseAd_patreonLink__K_r1D" href="#">Support us</a></div><h1 id="title">Baby Lasagna</h1></div>
  <div id="fixed-ad" class="inhouseFixedAd_desktopAdheasion__FsFTN">Ad</div>
  <div class="stack_columns__n1i4T" id="columns" style="display:grid;gap:14px"><div class="stack_column__d8TP_ undefined" id="column" style="display:flex;flex-direction:column;gap:28px"><div class="imageStack_container__GxRKQ"><div class="stackHeader_meta__lJ5Wv"><span>Price: <span id="stack-price">$0.49</span></span></div><div class="imageStack_cardStack__IFA_m"><div class="deckCardWrapper_container__PGeKO"><div class="imageCard_imageCard__x7s_J imageStack_basicCard__r2aGK"><div class="imageCard_extrasContainer__VyEjh"><div class="imageCard_extras___E80J"><div class="prices_container__osq8S" id="card-prices"><a class="prices_price__duDqs" href="#">$0.49</a></div></div></div></div></div></div></div></div></div>`;

const nexusTile = (id, daysAgo) => `<div class="group/mod-tile @container/mod-tile flex min-h-108 flex-col rounded bg-surface-mid" data-e2eid="mod-tile" id="${id}" style="min-height:432px"><a href="#"><img alt="" src="data:,"></a><a data-e2eid="mod-tile-title" href="#">${id}</a><p data-e2eid="mod-tile-updated"><span><time datetime="${iso(daysAgo)}">some time ago</time></span></p><p data-e2eid="mod-tile-uploaded"><span><time datetime="${iso(4000)}">long ago</time></span></p><div data-e2eid="mod-tile-summary" id="${id}-summary">Summary</div></div>`;
const NEXUS = `<div id="mainContent"><div data-testid="ad-vertical_sticky_left" id="ad-vertical_sticky_left">Ad</div><div data-testid="ad-horizontal_sticky">Ad</div>
  <div class="mods-grid" id="grid" style="display:grid;gap:24px">${nexusTile('fresh', 30)}${nexusTile('middle', 550)}${nexusTile('stale', 1100)}</div>
  <a class="nxm-button nxm-button-primary" id="download" href="#">Manual download</a>
  <div class="text-left"><a class="nxm-button nxm-button-premium w-full" id="footer-premium" href="#">Mod faster with premium</a></div>
  <div class="user-profile-menu-premium-banner-wrapper" id="menu-premium">Unlock uncapped download speeds</div>
  <div class="rj-supporter-wrapper" id="supporter"><a class="rj-btn" href="#">Go premium</a></div></div>
  <div id="adBanner" class="adLeaderboard adBanner leaderboard_ad" style="height:10px;width:10px">&nbsp;</div>`;

const thunderCard = (id, updated) => `<div class="card-package card-package--variant--card card-package--size--medium" id="${id}"><a class="link card-package__media" href="#"><img src="data:," alt=""></a><div class="card-package__content"><div class="card-package__info"><a class="link card-package__title" id="${id}-title" href="#">${id}</a></div><p class="card-package__description" id="${id}-description">A mod</p><div class="card-package__footer"><span class="card-package__updated" aria-label="Last Updated"><span> <!-- -->${updated}</span></span></div></div></div>`;
const THUNDERSTORE = `<main class="island layout__main layout__main--ads"><div class="package-search package-search--with-sidebar-ad"><div class="package-search__sidebar" id="sidebar"><div class="package-search__filters" id="filters">Filters</div><div class="ad-container" id="sidebar-ad"><div class="ad-container__content" id="nimbus-v2-community-sidebar-300x250">Ad</div></div></div>
  <div class="package-search__content"><div class="package-search__grid" id="grid" style="display:grid;gap:24px">${thunderCard('weeks', '3 weeks ago')}${thunderCard('months', '10 months ago')}${thunderCard('lastyear', 'last year')}${thunderCard('years', '3 years ago')}</div></div></div>
  <div class="layout__ads"><div class="layout__ads-stack"><div class="ad-container" id="side-ad">Ad</div></div></div></main>`;

async function open(t, host, body, adapterId, settings, theme = 'ember') {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.addInitScript(([adapterId, settings, theme]) => {
    const saved = new Map([['exp:v3:shift:settings', { theme, accent: `${theme}-default`, adapterSettings: { [adapterId]: settings } }]]);
    window.GM_getValue = (key, fallback) => saved.has(key) ? saved.get(key) : fallback;
    window.GM_setValue = (key, value) => saved.set(key, value);
    window.GM_xmlhttpRequest = () => {};
  }, [adapterId, settings, theme]);
  await page.route(`https://${host}/**`, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html><body>${body}</body></html>` }));
  await page.goto(`https://${host}/`);
  await page.addScriptTag({ content: script });
  if (theme === 'original') await page.locator('#exp-shift-root').waitFor({ state: 'attached' });
  else await page.waitForFunction(() => document.documentElement.hasAttribute('data-exp-shift'));
  await page.waitForTimeout(150);
  return page;
}

const shown = (page, ids) => page.evaluate((ids) => Object.fromEntries(ids.map((id) => [id, getComputedStyle(document.getElementById(id)).display !== 'none'])), ids);
const style = (page, id, property) => page.evaluate(([id, property]) => getComputedStyle(document.getElementById(id))[property], [id, property]);
const all = (ids, value) => Object.fromEntries(ids.map((id) => [id, value]));
const options = (id) => {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/adapters.js'), 'utf8');
  return [...source.match(new RegExp(`${id}: \\{[\\s\\S]*?options: (\\[[^\\n]*?\\]\\]),`))[1].matchAll(/\['([a-z-]+)', '([^']+)'\]/g)].map((match) => [match[1], match[2]]);
};

test('the four new site integrations list the switches from the approved mockups', () => {
  assert.deepEqual(options('edhrec'), [['hide-ads', 'Hide ad slots'], ['hide-card-prices', 'Hide price strips under cards'], ['dense-card-grid', 'Denser card grid']]);
  assert.deepEqual(options('archidekt'), [['hide-ads', 'Hide ad slots'], ['hide-card-prices', 'Hide price tags on cards'], ['dense-stacks', 'Tighter card stacks']]);
  assert.deepEqual(options('nexusmods'), [['hide-ads', 'Hide ad slots'], ['compact-tiles', 'Compact mod tiles'], ['flag-stale', 'Mark mods not updated in 2+ years'], ['hide-premium-prompts', 'Hide Premium prompts']]);
  assert.deepEqual(options('thunderstore'), [['hide-ads', 'Hide ad slots'], ['compact-cards', 'Compact package cards'], ['flag-stale', 'Mark packages not updated in 1+ year']]);
});

test('EDHREC: switches are off by default, then hide ad slots and card price strips and tighten the grid', async (t) => {
  const ads = ['leaderboard', 'adhesion_desktop_wrapper', 'universalPlayer_wrapper', 'ad-rail'];
  const off = await open(t, 'edhrec.com', EDHREC, 'edhrec', {});
  assert.deepEqual(await shown(off, [...ads, 'a-prices', 'b-prices']), all([...ads, 'a-prices', 'b-prices'], true));
  assert.equal(await style(off, 'grid', 'rowGap'), '24px');
  const on = await open(t, 'edhrec.com', EDHREC, 'edhrec', { 'hide-ads': true, 'hide-card-prices': true, 'dense-card-grid': true });
  assert.deepEqual(await shown(on, [...ads, 'a-prices', 'b-prices']), all([...ads, 'a-prices', 'b-prices'], false));
  // Prices outside a card, and the card art itself, stay.
  assert.deepEqual(await shown(on, ['summary', 'main', 'a-front', 'b-front']), all(['summary', 'main', 'a-front', 'b-front'], true));
  assert.equal(await style(on, 'grid', 'rowGap'), '8px');
});

test('Archidekt: switches are off by default, then hide ad slots and card price tags and tighten the stacks', async (t) => {
  const off = await open(t, 'archidekt.com', ARCHIDEKT, 'archidekt', {});
  assert.deepEqual(await shown(off, ['deck-top', 'fixed-ad', 'card-prices']), all(['deck-top', 'fixed-ad', 'card-prices'], true));
  assert.equal(await style(off, 'column', 'rowGap'), '28px');
  const on = await open(t, 'archidekt.com', ARCHIDEKT, 'archidekt', { 'hide-ads': true, 'hide-card-prices': true, 'dense-stacks': true });
  assert.deepEqual(await shown(on, ['deck-top', 'fixed-ad', 'card-prices']), all(['deck-top', 'fixed-ad', 'card-prices'], false));
  // The stack's own price total and the deck page around the banner stay.
  assert.deepEqual(await shown(on, ['stack-price', 'center', 'title']), all(['stack-price', 'center', 'title'], true));
  assert.equal(await style(on, 'column', 'rowGap'), '10px');
  assert.equal(await style(on, 'columns', 'rowGap'), '6px');
});

test('Nexus Mods: switches hide ad slots and Premium prompts, compact tiles, and dim mods not updated in 2+ years', async (t) => {
  const hidden = ['ad-vertical_sticky_left', 'footer-premium', 'menu-premium', 'supporter'];
  const off = await open(t, 'www.nexusmods.com', NEXUS, 'nexusmods', {});
  assert.deepEqual(await shown(off, [...hidden, 'fresh-summary']), all([...hidden, 'fresh-summary'], true));
  assert.equal(await style(off, 'stale', 'opacity'), '1');
  const on = await open(t, 'www.nexusmods.com', NEXUS, 'nexusmods', { 'hide-ads': true, 'compact-tiles': true, 'flag-stale': true, 'hide-premium-prompts': true });
  assert.deepEqual(await shown(on, [...hidden, 'fresh-summary']), all([...hidden, 'fresh-summary'], false));
  // The ordinary download button stays, and so does the 10px #adBanner Nexus uses to check for ad blockers.
  assert.deepEqual(await shown(on, ['download', 'adBanner', 'fresh', 'stale']), all(['download', 'adBanner', 'fresh', 'stale'], true));
  assert.equal(await style(on, 'grid', 'rowGap'), '8px');
  assert.notEqual(await style(on, 'fresh', 'minHeight'), '432px');
  assert.deepEqual(await on.evaluate(() => ['fresh', 'middle', 'stale'].map((id) => getComputedStyle(document.getElementById(id)).opacity)), ['1', '1', '0.45']);
  await on.hover('#stale');
  assert.equal(await style(on, 'stale', 'opacity'), '1');
});

test('Thunderstore: switches hide ad slots, compact cards, and dim packages not updated in 1+ year', async (t) => {
  const off = await open(t, 'thunderstore.io', THUNDERSTORE, 'thunderstore', {});
  assert.deepEqual(await shown(off, ['sidebar-ad', 'side-ad', 'weeks-description']), all(['sidebar-ad', 'side-ad', 'weeks-description'], true));
  assert.equal(await style(off, 'years', 'opacity'), '1');
  const on = await open(t, 'thunderstore.io', THUNDERSTORE, 'thunderstore', { 'hide-ads': true, 'compact-cards': true, 'flag-stale': true });
  assert.deepEqual(await shown(on, ['sidebar-ad', 'side-ad', 'weeks-description']), all(['sidebar-ad', 'side-ad', 'weeks-description'], false));
  assert.deepEqual(await shown(on, ['sidebar', 'filters', 'weeks-title']), all(['sidebar', 'filters', 'weeks-title'], true));
  assert.equal(await style(on, 'grid', 'rowGap'), '8px');
  assert.deepEqual(await on.evaluate(() => ['weeks', 'months', 'lastyear', 'years'].map((id) => getComputedStyle(document.getElementById(id)).opacity)), ['1', '1', '0.45', '0.45']);
});

// The theme only colours the page; site integrations are page functions and keep working on the Original theme.
test('site integrations keep working on the Original theme, including cards added after load', async (t) => {
  const edhrec = await open(t, 'edhrec.com', EDHREC, 'edhrec', { 'hide-card-prices': true }, 'original');
  assert.deepEqual(await shown(edhrec, ['a-prices', 'summary']), { 'a-prices': false, summary: true });
  assert.equal(await edhrec.evaluate(() => document.documentElement.hasAttribute('data-exp-shift')), false);
  const thunder = await open(t, 'thunderstore.io', THUNDERSTORE, 'thunderstore', { 'flag-stale': true }, 'original');
  assert.equal(await style(thunder, 'years', 'opacity'), '0.45');
  await thunder.evaluate((html) => document.getElementById('grid').insertAdjacentHTML('beforeend', html), thunderCard('late', '2 years ago'));
  await thunder.waitForFunction(() => getComputedStyle(document.getElementById('late')).opacity === '0.45', null, { timeout: 3000 });
});

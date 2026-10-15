'use strict';
// Fixtures follow the live markup (October 2026): SteamDB's DataTables sales table, where SteamDB marks owned games
// with tr.owned and keeps the rating in data-sort, and backpack.tf's listings with their online dot and bump time.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const script = fs.readFileSync(path.resolve(__dirname, '../shift.user.js'), 'utf8');
const DAY = 86400000;
const iso = (daysAgo) => new Date(Date.now() - daysAgo * DAY).toISOString().replace('.000Z', '+00:00');

const steamRow = (id, rating, owned = false) => `<tr class="app${owned ? ' owned' : ''}" data-appid="${id}" id="${id}"><td data-sort="1" class="dt-type-numeric"><a class="info-icon" href="#"></a></td><td class="applogo"><a href="#"><img src="data:," width="107" height="40" style="width:107px;height:40px;display:block"></a></td><td><div><a class="b" href="#">Game ${id}</a> <span class="cats"></span></div></td><td class="price-discount dt-type-numeric" data-sort="50"><b>-50%</b></td><td data-sort="2999" class="dt-type-numeric">$29.99</td><td data-sort="${rating}" class="dt-type-numeric">${rating}%</td><td data-sort="1553126400" class="dt-type-numeric">Mar 2019</td><td data-sort="1792083600" class="timeago dt-type-numeric">in 2 days</td><td data-sort="1790875811" class="timeago dt-type-numeric">12 days ago</td></tr>`;
const STEAMDB = `<style>.table-sales{border-collapse:collapse}.table-sales td{padding:4px 12px;line-height:20px}</style><table class="table-sales table-hover table-sortable dataTable" id="sales"><thead><tr><th class="dt-type-numeric"></th><th></th><th>Name</th><th class="dt-type-numeric">%</th><th class="dt-type-numeric">Price</th><th class="dt-type-numeric">Rating</th><th class="dt-type-numeric">Release</th><th class="dt-type-numeric">Ends</th><th class="dt-type-numeric">Started</th></tr></thead><tbody id="rows">${steamRow('good', '94.28')}${steamRow('poor', '47.51')}${steamRow('mine', '91.03', true)}</tbody></table>`;

const listing = (id, { online, bumped, message }) => `<li class="listing " id="${id}"><div class="listing-item"><div class="item q-440-6" title="Team Captain"></div></div><div class="listing-body"><div class="listing-header"><div class="listing-title"><i class="fa fa-arrow-left listing-intent-buy"></i><h5>Strange Team Captain</h5></div></div><div class="listing-details"><span class="text-muted">Bumped <span class="data1"><time class="timeago" datetime="${bumped}">x</time></span> by <span class="user-handle"><a class="user-link" href="#">trader</a> <i class="fa ${online ? 'fa-circle online' : 'fa-circle-o offline'}" title="${online ? 'Currently Online' : 'Last Online 10 hours ago'}"></i></span></span></div><div class="quote-box" id="${id}-quote" style="line-height:18.57px"><i class="fa fa-quote-left pull-left fa-large text-muted"></i><p style="margin:0">${message}</p><i class="fa fa-quote-right pull-right fa-large text-muted"></i></div></div></li>`;
const LONG = 'Buying for 3 keys, add me or send an offer. Will also take painted variants and pay overpay on spells. Fast trades, no lowballs please, counteroffers welcome.';
const BACKPACK = `<ul class="media-list" style="width:460px">${listing('fresh', { online: true, bumped: iso(0.1), message: LONG })}${listing('away', { online: false, bumped: iso(1), message: 'Selling, offers' })}${listing('old', { online: true, bumped: iso(9), message: 'Selling' })}</ul>`;

async function open(t, host, body, adapterId, settings) {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.addInitScript(([adapterId, settings]) => {
    const saved = new Map([['exp:v3:shift:settings', { theme: 'original', accent: 'original-default', adapterSettings: { [adapterId]: settings } }]]);
    window.GM_getValue = (key, fallback) => saved.has(key) ? saved.get(key) : fallback;
    window.GM_setValue = (key, value) => saved.set(key, value);
    window.GM_xmlhttpRequest = () => {};
  }, [adapterId, settings]);
  await page.route(`https://${host}/**`, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html><body>${body}</body></html>` }));
  await page.goto(`https://${host}/`);
  await page.addScriptTag({ content: script });
  await page.locator('#exp-shift-root').waitFor({ state: 'attached' });
  await page.waitForTimeout(250);
  return page;
}
const opacity = (page, ids) => page.evaluate((ids) => ids.map((id) => getComputedStyle(document.getElementById(id)).opacity), ids);
const height = (page, id) => page.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().height), id);

test('SteamDB and backpack.tf list the switches from the approved mockups', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/adapters.js'), 'utf8');
  const options = (id) => [...source.match(new RegExp(`${id}: \\{[\\s\\S]*?options: (\\[[^\\n]*?\\]\\]),`))[1].matchAll(/\['([a-z-]+)', '([^']+)'\]/g)].map((match) => [match[1], match[2]]);
  assert.deepEqual(options('steamdb'), [['compact-rows', 'Compact sale rows'], ['dim-low-rated', 'Dim games rated under 70%'], ['dim-owned', 'Dim games you own']]);
  assert.deepEqual(options('backpacktf'), [['one-line-messages', 'One-line trade messages'], ['dim-offline', 'Dim offline traders'], ['dim-stale', 'Dim listings not bumped in 7+ days']]);
});

test('SteamDB: switches are off by default, then compact rows and dim low-rated and owned games independently', async (t) => {
  const off = await open(t, 'steamdb.info', STEAMDB, 'steamdb', {});
  assert.deepEqual(await opacity(off, ['good', 'poor', 'mine']), ['1', '1', '1']);
  assert.ok(await height(off, 'good') >= 45, 'rows start at full height');
  const rated = await open(t, 'steamdb.info', STEAMDB, 'steamdb', { 'dim-low-rated': true });
  assert.deepEqual(await opacity(rated, ['good', 'poor', 'mine']), ['1', '0.45', '1']);
  const on = await open(t, 'steamdb.info', STEAMDB, 'steamdb', { 'compact-rows': true, 'dim-low-rated': true, 'dim-owned': true });
  assert.deepEqual(await opacity(on, ['good', 'poor', 'mine']), ['1', '0.45', '0.45']);
  assert.ok(await height(on, 'good') <= 30, 'compact rows');
  // DataTables renders the next page of rows in place; new rows are marked too.
  await on.evaluate((html) => document.getElementById('rows').insertAdjacentHTML('beforeend', html), steamRow('late', '55.00'));
  await on.waitForFunction(() => getComputedStyle(document.getElementById('late')).opacity === '0.45', null, { timeout: 3000 });
});

test('backpack.tf: switches are off by default, then shorten messages and dim offline traders and stale listings', async (t) => {
  const off = await open(t, 'backpack.tf', BACKPACK, 'backpacktf', {});
  assert.deepEqual(await opacity(off, ['fresh', 'away', 'old']), ['1', '1', '1']);
  const tall = await height(off, 'fresh-quote');
  assert.ok(tall > 40, 'the long message wraps');
  const on = await open(t, 'backpack.tf', BACKPACK, 'backpacktf', { 'one-line-messages': true, 'dim-offline': true, 'dim-stale': true });
  assert.deepEqual(await opacity(on, ['fresh', 'away', 'old']), ['1', '0.45', '0.45']);
  assert.ok(await height(on, 'fresh-quote') <= 22, 'one line');
  await on.hover('#fresh-quote');
  assert.equal(await height(on, 'fresh-quote'), tall);
});

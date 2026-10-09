'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

// The engine requires Core's shared page observer (commit 44043f0), so Core loads first.
const core = fs.readFileSync(path.join(__dirname, '../vendor/exp-core/exp-core.js'), 'utf8');
const source = ['themes.js', 'color-engine.js', 'dynamic-engine.js'].map(file => fs.readFileSync(path.join(__dirname, '../src', file), 'utf8')).join('\n');

async function fixture(t) {
  const browser = await chromium.launch(); t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><head><style>body{background:#fff;color:#111}</style></head><body><main id="feed"></main></body></html>');
  await page.addScriptTag({ content: `${core}\nconst EXP={Core:{safeError(){}}};${source};window.expTest=EXP;` });
  await page.evaluate(() => {
    window.white = 'rgb(255, 255, 255)';
    window.ownedSheet = sheet => { try { return sheet.cssRules[0]?.selectorText === '.exp-owned-sheet-marker'; } catch { return false; } };
    window.innerBg = host => getComputedStyle(host.shadowRoot.querySelector('.inner')).backgroundColor;
    window.makeSheets = (kinds, rules = 120) => Array.from({ length: kinds }, (_, k) => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync('.inner{background:#ffffff;color:#1c1c1c;padding:4px}' + Array.from({ length: rules }, (_, i) => `.k${k}r${i}{color:#1c1c1c;background:#fafafa}`).join(''));
      return sheet;
    });
    window.definePost = sheets => {
      customElements.define('shift-post', class extends HTMLElement {
        connectedCallback() {
          if (this.shadowRoot) return;
          const shadow = this.attachShadow({ mode: 'open' });
          shadow.adoptedStyleSheets = [sheets[(+this.dataset.i) % sheets.length]];
          shadow.innerHTML = `<div class="inner">Post ${this.dataset.i}</div>`;
        }
      });
    };
    window.addPosts = (from, count) => {
      const feed = document.getElementById('feed');
      for (let i = from; i < from + count; i++) { const post = document.createElement('shift-post'); post.dataset.i = i; feed.append(post); }
    };
    window.unthemedPosts = () => [...document.querySelectorAll('shift-post')].filter(post => innerBg(post) === white).length;
  });
  return page;
}
const midnight = 'expTest.Themes.resolve("midnight","site-default")';

test('every component sharing an adopted stylesheet is themed', async t => {
  const page = await fixture(t);
  await page.evaluate(`definePost(makeSheets(3)); addPosts(0, 300); expTest.DynamicEngine.start(${midnight});`);
  await page.waitForTimeout(2000);
  const facts = await page.evaluate(() => ({ unthemed: unthemedPosts(), health: expTest.DynamicEngine.health() }));
  assert.equal(facts.unthemed, 0, JSON.stringify(facts.health));
  assert.equal(facts.health.adoptedRoots, 300);
});

test('a late component with nested shadow roots is themed with no other page change', async t => {
  const page = await fixture(t);
  await page.evaluate(`expTest.DynamicEngine.start(${midnight});`);
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    customElements.define('chat-msg', class extends HTMLElement { connectedCallback() { const s = this.attachShadow({ mode: 'open' }); s.innerHTML = '<style>.msg{background:#ffffff;color:#0f1a1c}</style><div class="msg" id="msg">Hello</div>'; } });
    customElements.define('rs-chat', class extends HTMLElement { connectedCallback() { const s = this.attachShadow({ mode: 'open' }); s.innerHTML = '<style>.room{background:#ffffff;color:#0f1a1c}</style><div class="room" id="room">Room</div><chat-msg></chat-msg>'; } });
    document.body.append(document.createElement('rs-chat'));
  });
  await page.waitForFunction(() => { const chat = document.querySelector('rs-chat')?.shadowRoot; const msg = chat?.querySelector('chat-msg')?.shadowRoot?.getElementById('msg'); return chat && msg && getComputedStyle(chat.getElementById('room')).backgroundColor !== 'rgb(255, 255, 255)' && getComputedStyle(msg).backgroundColor !== 'rgb(255, 255, 255)'; }, null, { timeout: 5000 }).catch(() => {});
  const facts = await page.evaluate(() => {
    const chat = document.querySelector('rs-chat').shadowRoot;
    return { room: getComputedStyle(chat.getElementById('room')).backgroundColor, msg: getComputedStyle(chat.querySelector('chat-msg').shadowRoot.getElementById('msg')).backgroundColor };
  });
  assert.notEqual(facts.room, 'rgb(255, 255, 255)');
  assert.notEqual(facts.msg, 'rgb(255, 255, 255)');
});

test('a component that reassigns adoptedStyleSheets is themed again after its next change', async t => {
  const page = await fixture(t);
  await page.evaluate(`window.sheets = makeSheets(1); definePost(sheets); addPosts(0, 1); expTest.DynamicEngine.start(${midnight});`);
  await page.waitForFunction(() => innerBg(document.querySelector('shift-post')) !== white, null, { timeout: 3000 });
  await page.evaluate(() => {
    const shadow = document.querySelector('shift-post').shadowRoot;
    shadow.adoptedStyleSheets = [sheets[0]];
    shadow.append(document.createElement('span'));
  });
  await page.waitForTimeout(1000);
  assert.notEqual(await page.evaluate(() => innerBg(document.querySelector('shift-post'))), 'rgb(255, 255, 255)');
});

test('a theme change replaces copies in place and stop removes every copy', async t => {
  const page = await fixture(t);
  await page.evaluate(`definePost(makeSheets(2)); addPosts(0, 20); expTest.DynamicEngine.start(${midnight});`);
  await page.waitForTimeout(1000);
  const before = await page.evaluate(() => innerBg(document.querySelector('shift-post')));
  await page.evaluate(() => expTest.DynamicEngine.refresh(expTest.Themes.resolve('crimson', 'site-default')));
  await page.waitForTimeout(1000);
  const changed = await page.evaluate(() => ({
    bg: innerBg(document.querySelector('shift-post')),
    copiesPerRoot: [...document.querySelectorAll('shift-post')].map(post => post.shadowRoot.adoptedStyleSheets.filter(ownedSheet).length),
  }));
  assert.notEqual(changed.bg, before);
  assert.ok(changed.copiesPerRoot.every(count => count === 1), JSON.stringify(changed.copiesPerRoot));
  await page.evaluate(() => expTest.DynamicEngine.stop());
  const after = await page.evaluate(() => ({
    unthemed: unthemedPosts(),
    copies: [...document.querySelectorAll('shift-post')].reduce((sum, post) => sum + post.shadowRoot.adoptedStyleSheets.filter(ownedSheet).length + post.shadowRoot.querySelectorAll('style[data-exp-shift-dynamic]').length, 0),
    documentStyles: document.querySelectorAll('style[data-exp-shift-dynamic],style[data-exp-shift-dynamic-remote]').length,
  }));
  assert.deepEqual(after, { unthemed: 20, copies: 0, documentStyles: 0 });
});

test('a Reddit-sized page themes everything without long engine slices', async t => {
  const page = await fixture(t);
  await page.evaluate(`window.sheets = makeSheets(150); definePost(sheets); expTest.DynamicEngine.start(${midnight});`);
  await page.evaluate(async () => {
    for (let wave = 0; wave < 40; wave++) {
      addPosts(wave * 38, 38);
      const style = document.createElement('style'); style.textContent = `.w${wave}{color:#222}`; document.head.append(style);
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  });
  await page.waitForTimeout(2000);
  const facts = await page.evaluate(() => ({ unthemed: unthemedPosts(), health: expTest.DynamicEngine.health() }));
  assert.equal(facts.unthemed, 0, `unthemed ${facts.unthemed}`);
  assert.ok(facts.health.maxSliceMs < 50, `longest slice ${facts.health.maxSliceMs} ms`);
  assert.ok(facts.health.totalMs < 750, `total engine time ${facts.health.totalMs} ms`);
  assert.ok(facts.health.knownRoots >= 1521, `known roots ${facts.health.knownRoots}`);
});

test('removed components are released from the engine', async t => {
  const page = await fixture(t);
  await page.evaluate(`definePost(makeSheets(2, 10)); addPosts(0, 50); expTest.DynamicEngine.start(${midnight});`);
  await page.waitForFunction(() => unthemedPosts() === 0, null, { timeout: 5000 });
  await page.evaluate(() => {
    [...document.querySelectorAll('shift-post')].slice(10).forEach(post => post.remove());
    document.querySelector('shift-post').shadowRoot.append(document.createElement('span'));
  });
  await page.waitForTimeout(1500);
  const health = await page.evaluate(() => expTest.DynamicEngine.health());
  assert.ok(health.knownRoots <= 11, `known roots ${health.knownRoots}`);
  assert.ok(health.adoptedRoots <= 10, `adopted roots ${health.adoptedRoots}`);
});

test('a cross-origin stylesheet shared by many components is themed in all of them', async t => {
  const page = await fixture(t);
  const href = 'https://cdn.fixture.test/shared.css';
  const body = '.remote-inner{background:#ffffff;color:#111}';
  await page.route(href, route => route.fulfill({ status: 200, contentType: 'text/css', body }));
  const facts = await page.evaluate(async ({ href, body }) => {
    window.remoteRequests = 0;
    window.GM_xmlhttpRequest = ({ url, onload }) => { window.remoteRequests++; setTimeout(() => onload({ status: 200, responseText: url === href ? body : '' }), 100); return { abort() {} }; };
    customElements.define('remote-post', class extends HTMLElement {
      connectedCallback() { if (this.shadowRoot) return; this.attachShadow({ mode: 'open' }).innerHTML = `<link rel="stylesheet" href="${href}"><div class="remote-inner">Remote</div>`; }
    });
    const feed = document.getElementById('feed');
    for (let i = 0; i < 20; i++) feed.append(document.createElement('remote-post'));
    await new Promise(resolve => setTimeout(resolve, 300));
    const sheet = document.querySelector('remote-post').shadowRoot.styleSheets[0];
    let inaccessible = false; try { void sheet.cssRules; } catch { inaccessible = true; }
    return { inaccessible };
  }, { href, body });
  assert.equal(facts.inaccessible, true, 'fixture sheet must be cross-origin');
  await page.evaluate(`expTest.DynamicEngine.start(${midnight});`);
  const remoteBg = () => [...document.querySelectorAll('remote-post')].filter(post => getComputedStyle(post.shadowRoot.querySelector('.remote-inner')).backgroundColor === 'rgb(255, 255, 255)').length;
  await page.waitForFunction(remoteBg => eval(remoteBg)() === 0, remoteBg.toString(), { timeout: 3000 }).catch(() => {});
  const unthemed = await page.evaluate(remoteBg);
  assert.equal(unthemed, 0, `unthemed ${unthemed} of 20`);
});

test('components defined after insertion are themed once they upgrade', async t => {
  const page = await fixture(t);
  await page.evaluate(`{ const feed = document.getElementById('feed'); for (let i = 0; i < 5; i++) feed.append(document.createElement('lazy-post')); } expTest.DynamicEngine.start(${midnight});`);
  await page.waitForTimeout(300);
  await page.evaluate(() => customElements.define('lazy-post', class extends HTMLElement {
    connectedCallback() { if (this.shadowRoot) return; this.attachShadow({ mode: 'open' }).innerHTML = '<style>.inner{background:#ffffff;color:#111}</style><div class="inner">Lazy</div>'; }
  }));
  await page.waitForFunction(() => [...document.querySelectorAll('lazy-post')].every(post => innerBg(post) !== white), null, { timeout: 3000 }).catch(() => {});
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('lazy-post')].filter(post => innerBg(post) === white).length), 0);
});

test('one failing component does not stall theming of the others', async t => {
  const page = await fixture(t);
  await page.evaluate(() => {
    customElements.define('bad-post', class extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return;
        const shadow = this.attachShadow({ mode: 'open' }); shadow.innerHTML = '<div class="inner">Bad</div>';
        Object.defineProperty(shadow, 'styleSheets', { get() { throw new Error('boom'); } });
      }
    });
    document.getElementById('feed').append(document.createElement('bad-post'));
    definePost(makeSheets(1, 5)); addPosts(0, 10);
  });
  await page.evaluate(`expTest.DynamicEngine.start(${midnight});`);
  await page.waitForFunction(() => unthemedPosts() === 0, null, { timeout: 3000 }).catch(() => {});
  assert.equal(await page.evaluate(() => unthemedPosts()), 0);
});

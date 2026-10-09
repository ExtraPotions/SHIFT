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

test('a component removed, released, and re-attached after stop keeps none of our copies', async t => {
  const page = await fixture(t);
  await page.evaluate(`definePost(makeSheets(1, 5)); addPosts(0, 3); expTest.DynamicEngine.start(${midnight});`);
  await page.waitForFunction(() => unthemedPosts() === 0, null, { timeout: 5000 });
  await page.evaluate(() => { window.detached = document.querySelector('shift-post'); detached.remove(); });
  await page.waitForTimeout(1200);
  const facts = await page.evaluate(() => {
    expTest.DynamicEngine.stop();
    document.getElementById('feed').append(detached);
    return { owned: detached.shadowRoot.adoptedStyleSheets.filter(ownedSheet).length, fallback: detached.shadowRoot.querySelectorAll('style[data-exp-shift-dynamic]').length, bg: innerBg(detached) };
  });
  assert.deepEqual(facts, { owned: 0, fallback: 0, bg: 'rgb(255, 255, 255)' });
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

test('identical per-component style elements are themed once and share one copy', async t => {
  const page = await fixture(t);
  await page.evaluate(`
    window.styleText = '.inner{background:#ffffff;color:#1c1c1c}' + Array.from({ length: 199 }, (_, i) => '.f' + i + '{color:#1c1c1c;background:#fafafa}').join('');
    customElements.define('styled-post', class extends HTMLElement {
      connectedCallback() { if (this.shadowRoot) return; this.attachShadow({ mode: 'open' }).innerHTML = '<style>' + styleText + '</style><div class="inner">Post</div>'; }
    });
    expTest.DynamicEngine.start(${midnight});
  `);
  await page.evaluate(async () => {
    const feed = document.getElementById('feed');
    for (let wave = 0; wave < 30; wave++) {
      for (let i = 0; i < 50; i++) feed.append(document.createElement('styled-post'));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });
  await page.waitForFunction(() => [...document.querySelectorAll('styled-post')].every(post => innerBg(post) !== white), null, { timeout: 5000 }).catch(() => {});
  const facts = await page.evaluate(() => ({
    unthemed: [...document.querySelectorAll('styled-post')].filter(post => innerBg(post) === white).length,
    bg: innerBg(document.querySelector('styled-post')),
    constructed: new Set([...document.querySelectorAll('styled-post')].flatMap(post => post.shadowRoot.adoptedStyleSheets.filter(ownedSheet))).size,
    health: expTest.DynamicEngine.health(),
  }));
  assert.equal(facts.unthemed, 0, `unthemed ${facts.unthemed}`);
  assert.equal(facts.constructed, 1, `constructed sheets ${facts.constructed}`);
  assert.ok(facts.health.cacheMisses <= 2, `cache misses ${facts.health.cacheMisses}`);
  assert.ok(facts.health.totalMs < 750, `total engine time ${facts.health.totalMs} ms`);
  assert.ok(facts.health.maxSliceMs < 50, `longest slice ${facts.health.maxSliceMs} ms`);
  await page.evaluate(() => expTest.DynamicEngine.refresh(expTest.Themes.resolve('crimson', 'site-default')));
  await page.waitForTimeout(1500);
  const changed = await page.evaluate(() => ({
    bgs: [...new Set([...document.querySelectorAll('styled-post')].map(innerBg))],
    copiesPerRoot: [...new Set([...document.querySelectorAll('styled-post')].map(post => post.shadowRoot.adoptedStyleSheets.filter(ownedSheet).length + post.shadowRoot.querySelectorAll('style[data-exp-shift-dynamic]').length))],
  }));
  assert.deepEqual(changed.copiesPerRoot, [1]);
  assert.equal(changed.bgs.length, 1, JSON.stringify(changed.bgs));
  assert.notEqual(changed.bgs[0], facts.bg);
});

// Per-instance components: each host gets its own <style> with the given text.
const defineStyled = (page, tag, css, body) => page.evaluate(({ tag, css, body }) => {
  customElements.define(tag, class extends HTMLElement {
    connectedCallback() { if (this.shadowRoot) return; this.attachShadow({ mode: 'open' }).innerHTML = `<style>${css}</style>${body}`; }
  });
  document.getElementById('feed').append(document.createElement(tag));
}, { tag, css, body });

test('different stylesheets whose sampled signatures collide are each themed from their own rules', async t => {
  const page = await fixture(t);
  // Same even-numbered rules, different odd-numbered rules: a stride sample sees only the even ones.
  const sheetText = letter => Array.from({ length: 100 }, (_, i) => i % 2 ? `.${letter}${i}{background:#ffffff}` : `.e${i}{color:#1c1c1c}`).join('');
  await defineStyled(page, 'odd-a', sheetText('a'), '<div class="a1 own">A</div>');
  await defineStyled(page, 'odd-b', sheetText('b'), '<div class="b1 own">B</div>');
  await page.evaluate(`expTest.DynamicEngine.start(${midnight});`);
  const ownBg = tag => getComputedStyle(document.querySelector(tag).shadowRoot.querySelector('.own')).backgroundColor;
  await page.waitForFunction(fn => ['odd-a', 'odd-b'].every(tag => eval(fn)(tag) !== 'rgb(255, 255, 255)'), ownBg.toString(), { timeout: 3000 }).catch(() => {});
  const facts = await page.evaluate(fn => ({ a: eval(fn)('odd-a'), b: eval(fn)('odd-b') }), ownBg.toString());
  assert.notEqual(facts.a, 'rgb(255, 255, 255)', 'odd-a own rule themed');
  assert.notEqual(facts.b, 'rgb(255, 255, 255)', 'odd-b own rule themed');
});

test('per-instance style variables that differ in one character are each themed from their own text', async t => {
  const page = await fixture(t);
  const hostText = surface => `.wrap{--surface:${surface};--ink:#111111;--line:#dddddd;display:block}.box{background:var(--surface)}`;
  const values = { 'host-a': '#ffffff', 'host-b': '#f0f0f0', 'host-c': '#fffffe' };
  for (const [tag, value] of Object.entries(values)) await defineStyled(page, tag, hostText(value), '<div class="wrap"><div class="box">Box</div></div>');
  await page.evaluate(`expTest.DynamicEngine.start(${midnight});`);
  await page.waitForFunction(() => ['host-a', 'host-b', 'host-c'].every(tag => document.querySelector(tag).shadowRoot.adoptedStyleSheets.some(ownedSheet)), null, { timeout: 3000 }).catch(() => {});
  const facts = await page.evaluate(values => {
    const theme = expTest.Themes.resolve('midnight', 'site-default');
    const probe = document.createElement('div'); document.body.append(probe);
    const asRgb = color => { probe.style.background = color; return getComputedStyle(probe).backgroundColor; };
    const out = {};
    for (const [tag, value] of Object.entries(values)) {
      const shadow = document.querySelector(tag).shadowRoot;
      out[tag] = { bg: getComputedStyle(shadow.querySelector('.box')).backgroundColor, expected: asRgb(expTest.ColorEngine.transform(value, 'background', theme, theme.page)), owned: shadow.adoptedStyleSheets.filter(ownedSheet) };
    }
    probe.remove();
    return {
      a: { bg: out['host-a'].bg, expected: out['host-a'].expected },
      b: { bg: out['host-b'].bg, expected: out['host-b'].expected },
      c: { bg: out['host-c'].bg, expected: out['host-c'].expected },
      distinctCopies: new Set(Object.values(out).flatMap(entry => entry.owned)).size,
    };
  }, values);
  assert.notEqual(facts.a.expected, facts.b.expected, 'fixture values theme differently');
  assert.equal(facts.a.bg, facts.a.expected);
  assert.equal(facts.b.bg, facts.b.expected);
  assert.equal(facts.c.bg, facts.c.expected);
  assert.equal(facts.distinctCopies, 3, 'each distinct text has its own themed copy');
});

test('page batches that add nothing do not walk the changed container', async t => {
  const page = await fixture(t);
  await page.evaluate(() => {
    const box = document.createElement('section'); box.id = 'box';
    box.append(document.createTextNode('count 0'));
    for (let i = 0; i < 1000; i++) { const row = document.createElement('div'); row.innerHTML = '<span>a</span><b>b</b><i>c</i><em>d</em>'; box.append(row); }
    document.body.append(box);
  });
  await page.evaluate(`expTest.DynamicEngine.start(${midnight});`);
  await page.waitForTimeout(500);
  const read = () => { const health = expTest.DynamicEngine.health(); return { ms: health.discoverMs, calls: health.discoverCalls, elements: health.discoverElements }; };
  const baseline = await page.evaluate(read);
  await page.evaluate(async () => {
    const box = document.getElementById('box');
    for (let i = 0; i < 30; i++) {
      if (i % 2) box.lastElementChild.remove(); else box.firstChild.data = `count ${i}`;
      await new Promise(resolve => setTimeout(resolve, 90));
    }
  });
  await page.waitForTimeout(300);
  const spent = await page.evaluate(read);
  assert.equal(typeof spent.elements, 'number');
  assert.equal(spent.calls - baseline.calls, 0, 'no discovery walks over 30 add-free batches');
  assert.equal(spent.elements - baseline.elements, 0, 'no elements visited over 30 add-free batches');
  assert.ok(spent.ms - baseline.ms < 50, `discovery time ${spent.ms - baseline.ms} ms over 30 add-free batches`);
  await page.evaluate(() => {
    customElements.define('box-post', class extends HTMLElement { connectedCallback() { if (this.shadowRoot) return; this.attachShadow({ mode: 'open' }).innerHTML = '<style>.inner{background:#ffffff;color:#111}</style><div class="inner">Box</div>'; } });
    document.getElementById('box').append(document.createElement('box-post'));
  });
  await page.waitForFunction(() => innerBg(document.querySelector('box-post')) !== white, null, { timeout: 3000 }).catch(() => {});
  assert.notEqual(await page.evaluate(() => innerBg(document.querySelector('box-post'))), 'rgb(255, 255, 255)');
});

test('an in-place edit of a component style element is themed', async t => {
  const page = await fixture(t);
  await page.evaluate(() => {
    customElements.define('edit-post', class extends HTMLElement { connectedCallback() { if (this.shadowRoot) return; this.attachShadow({ mode: 'open' }).innerHTML = '<style>.part{background:#fff}</style><div class="part">Part</div><div class="late">Late</div>'; } });
    document.getElementById('feed').append(document.createElement('edit-post'));
  });
  await page.evaluate(`expTest.DynamicEngine.start(${midnight});`);
  const partBg = () => getComputedStyle(document.querySelector('edit-post').shadowRoot.querySelector('.part')).backgroundColor;
  await page.waitForFunction(fn => eval(fn)() !== 'rgb(255, 255, 255)', partBg.toString(), { timeout: 3000 });
  await page.evaluate(() => { document.querySelector('edit-post').shadowRoot.querySelector('style').firstChild.data = '.part{background:#f0f0f0}.late{background:#f0f0f0}'; });
  const lateBg = () => getComputedStyle(document.querySelector('edit-post').shadowRoot.querySelector('.late')).backgroundColor;
  await page.waitForFunction(fn => eval(fn)() !== 'rgb(240, 240, 240)', lateBg.toString(), { timeout: 3000 }).catch(() => {});
  const facts = await page.evaluate(({ partBg, lateBg }) => ({
    part: eval(partBg)(), late: eval(lateBg)(),
    copies: document.querySelector('edit-post').shadowRoot.adoptedStyleSheets.filter(ownedSheet).length,
  }), { partBg: partBg.toString(), lateBg: lateBg.toString() });
  assert.notEqual(facts.part, 'rgb(240, 240, 240)');
  assert.notEqual(facts.late, 'rgb(240, 240, 240)');
  assert.equal(facts.copies, 1);
});

test('a never-defined tag is watched once across repeated theme on and off', async t => {
  const page = await fixture(t);
  const calls = await page.evaluate(`(() => {
    let calls = 0;
    const original = customElements.whenDefined.bind(customElements);
    customElements.whenDefined = tag => { if (tag === 'never-post') calls++; return original(tag); };
    document.getElementById('feed').append(document.createElement('never-post'));
    for (let i = 0; i < 5; i++) { expTest.DynamicEngine.start(${midnight}); expTest.DynamicEngine.stop(); }
    return calls;
  })()`);
  assert.equal(calls, 1);
});

test('health after stop and start reflects only the new run', async t => {
  const page = await fixture(t);
  await page.evaluate(`definePost(makeSheets(3)); addPosts(0, 300); expTest.DynamicEngine.start(${midnight});`);
  await page.waitForFunction(() => unthemedPosts() === 0, null, { timeout: 5000 });
  const first = await page.evaluate(() => expTest.DynamicEngine.health());
  await page.evaluate(`expTest.DynamicEngine.stop(); document.getElementById('feed').replaceChildren(); expTest.DynamicEngine.start(${midnight});`);
  await page.waitForTimeout(300);
  const second = await page.evaluate(() => expTest.DynamicEngine.health());
  assert.equal(second.passes, 1, JSON.stringify(second));
  assert.ok(second.slices < first.slices, `slices ${second.slices} vs first run ${first.slices}`);
  assert.ok(second.totalMs <= first.totalMs, `total ${second.totalMs} vs first run ${first.totalMs}`);
  assert.equal(second.cacheMisses, 0, 'the page sheet was cached in the first run');
  assert.equal(second.discoverElements < first.discoverElements, true);
});

test('health reports shadow roots found after start', async t => {
  const page = await fixture(t);
  await page.evaluate(`definePost(makeSheets(1, 5)); expTest.DynamicEngine.start(${midnight});`);
  await page.evaluate(() => addPosts(0, 7));
  await page.waitForFunction(() => unthemedPosts() === 0, null, { timeout: 5000 });
  assert.equal(await page.evaluate(() => expTest.DynamicEngine.health().shadowRoots), 7);
});

test('a theme change whose remote fetch fails leaves no old-theme remote copy, and stop forgets remote owners', async t => {
  const page = await fixture(t);
  const href = 'https://styles.fixture.test/remote.css';
  await page.route(href, route => route.fulfill({ status: 200, contentType: 'text/css', body: '.remote-inner{background:#ffffff;color:#111}' }));
  await page.evaluate(async href => {
    let requests = 0;
    window.GM_xmlhttpRequest = ({ onload, onerror }) => {
      const first = ++requests === 1;
      setTimeout(() => first ? onload({ status: 200, responseText: '.remote-inner{background:#ffffff;color:#111}' }) : onerror(), 20);
      return { abort() {} };
    };
    customElements.define('remote-card', class extends HTMLElement {
      connectedCallback() { if (this.shadowRoot) return; this.attachShadow({ mode: 'open' }).innerHTML = `<link rel="stylesheet" href="${href}"><div class="remote-inner">Remote</div>`; }
    });
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; document.head.append(link);
    await new Promise(resolve => { link.onload = resolve; });
    document.getElementById('feed').append(document.createElement('remote-card'));
    await new Promise(resolve => setTimeout(resolve, 200));
  }, href);
  const copies = () => ({
    documentRemote: document.querySelectorAll('style[data-exp-shift-dynamic-remote]').length,
    shadowRemote: document.querySelector('remote-card').shadowRoot.adoptedStyleSheets.filter(ownedSheet).length + document.querySelector('remote-card').shadowRoot.querySelectorAll('style[data-exp-shift-dynamic]').length,
  });
  await page.evaluate(`expTest.DynamicEngine.start(${midnight});`);
  await page.waitForFunction(fn => { const c = eval(fn)(); return c.documentRemote === 1 && c.shadowRemote === 1; }, copies.toString(), { timeout: 3000 });
  await page.evaluate(() => expTest.DynamicEngine.refresh(expTest.Themes.resolve('crimson', 'site-default')));
  await page.waitForTimeout(500);
  const afterFailure = await page.evaluate(copies);
  assert.deepEqual(afterFailure, { documentRemote: 0, shadowRemote: 0 });
  await page.evaluate(() => expTest.DynamicEngine.stop());
  assert.equal(await page.evaluate(() => expTest.DynamicEngine.health().remoteOwners), 0);
});

test('a failed in-place replace still moves every component to the new theme', async t => {
  const page = await fixture(t);
  await page.evaluate(`definePost(makeSheets(1, 5)); addPosts(0, 10); expTest.DynamicEngine.start(${midnight});`);
  await page.waitForFunction(() => unthemedPosts() === 0, null, { timeout: 5000 });
  const before = await page.evaluate(() => innerBg(document.querySelector('shift-post')));
  const facts = await page.evaluate(async () => {
    const posts = [...document.querySelectorAll('shift-post')];
    // Slices run on setTimeout, and the first component takes a whole slice, so the state right
    // after the failing slice (before any other component is reprocessed) can be observed.
    window.requestIdleCallback = undefined;
    const styleSheets = Object.getOwnPropertyDescriptor(ShadowRoot.prototype, 'styleSheets').get;
    Object.defineProperty(posts[0].shadowRoot, 'styleSheets', { get() { const end = performance.now() + 12; while (performance.now() < end); return styleSheets.call(this); } });
    const original = CSSStyleSheet.prototype.replaceSync;
    let failed = null, staleAfterFailingSlice = null;
    // Fail the first in-place replace of a themed copy already adopted by every component.
    CSSStyleSheet.prototype.replaceSync = function (text) {
      if (!failed && String(text).startsWith('.exp-owned-sheet-marker') && ownedSheet(this)) {
        failed = this;
        setTimeout(() => { staleAfterFailingSlice = posts.filter(post => post.shadowRoot.adoptedStyleSheets.includes(failed)).length; }, 0);
        throw new Error('replace failed');
      }
      return original.call(this, text);
    };
    expTest.DynamicEngine.refresh(expTest.Themes.resolve('crimson', 'site-default'));
    await new Promise(resolve => setTimeout(resolve, 800));
    CSSStyleSheet.prototype.replaceSync = original;
    return { failed: Boolean(failed), staleAfterFailingSlice, bgs: [...new Set(posts.map(innerBg))], copies: [...new Set(posts.map(post => post.shadowRoot.adoptedStyleSheets.filter(ownedSheet).length + post.shadowRoot.querySelectorAll('style[data-exp-shift-dynamic]').length))] };
  });
  assert.equal(facts.failed, true, 'the forced failure happened');
  assert.equal(facts.staleAfterFailingSlice, 0, 'no component keeps the old-theme copy once the replace fails');
  assert.equal(facts.bgs.length, 1, JSON.stringify(facts.bgs));
  assert.notEqual(facts.bgs[0], before);
  assert.deepEqual(facts.copies, [1]);
});

test('a defined component that attaches its shadow root after insertion is themed', async t => {
  const page = await fixture(t);
  await page.evaluate(`expTest.DynamicEngine.start(${midnight});`);
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    // Core's page batch arrives about 60 ms after insertion; the shadow root comes later still.
    customElements.define('slow-post', class extends HTMLElement {
      connectedCallback() { setTimeout(() => { if (!this.shadowRoot) this.attachShadow({ mode: 'open' }).innerHTML = '<style>.inner{background:#ffffff;color:#111}</style><div class="inner">Slow</div>'; }, 120); }
    });
    document.getElementById('feed').append(document.createElement('slow-post'));
  });
  await page.waitForFunction(() => document.querySelector('slow-post').shadowRoot && innerBg(document.querySelector('slow-post')) !== white, null, { timeout: 3000 }).catch(() => {});
  assert.notEqual(await page.evaluate(() => innerBg(document.querySelector('slow-post'))), 'rgb(255, 255, 255)');
});

test(':host rules theme the host element unless it is preserved', async t => {
  const page = await fixture(t);
  await page.evaluate(() => {
    const define = (tag, css) => customElements.define(tag, class extends HTMLElement { connectedCallback() { if (this.shadowRoot) return; this.attachShadow({ mode: 'open' }).innerHTML = `<style>${css}</style><span>Host</span>`; } });
    define('bare-host', ':host{display:block;background:#ffffff;color:#111}');
    define('arg-host', ':host(.active){display:block;background:#fff}');
    const feed = document.getElementById('feed');
    feed.append(document.createElement('bare-host'));
    const active = document.createElement('arg-host'); active.className = 'active'; feed.append(active);
    const kept = document.createElement('bare-host'); kept.id = 'kept'; kept.setAttribute('data-exp-shift-preserve', ''); feed.append(kept);
  });
  await page.evaluate(`expTest.DynamicEngine.start(${midnight});`);
  const hostBgs = () => ({ bare: getComputedStyle(document.querySelector('bare-host:not(#kept)')).backgroundColor, arg: getComputedStyle(document.querySelector('arg-host')).backgroundColor, kept: getComputedStyle(document.getElementById('kept')).backgroundColor });
  await page.waitForFunction(fn => { const bgs = eval(fn)(); return bgs.bare !== 'rgb(255, 255, 255)' && bgs.arg !== 'rgb(255, 255, 255)'; }, hostBgs.toString(), { timeout: 3000 }).catch(() => {});
  const facts = await page.evaluate(hostBgs);
  assert.notEqual(facts.bare, 'rgb(255, 255, 255)', ':host themed');
  assert.notEqual(facts.arg, 'rgb(255, 255, 255)', ':host(.active) themed');
  assert.equal(facts.kept, 'rgb(255, 255, 255)', 'preserved host untouched');
});

test('generated CSS for selectors other than :host is unchanged', async t => {
  const page = await fixture(t);
  const css = '.a{background:#ffffff}.b::before{color:#111111}div > p.c, ul li{background:#fafafa}a[href*=","]:hover{color:#222222}:is(.x, .y) .z::after{border-color:#dddddd}:host .inner{background:#ffffff}dialog::backdrop{background:#ffffff}@media (min-width: 1px){.m{background:#ffffff}}';
  const out = await page.evaluate(css => {
    document.head.querySelector('style').textContent = css;
    expTest.DynamicEngine.start(expTest.Themes.resolve('midnight', 'site-default'));
    return document.querySelector('style[data-exp-shift-dynamic]').textContent;
  }, css);
  const guard = ':not(:where([data-exp-shift-preserve],[data-exp-shift-preserve] *))';
  // Captured from the engine before :host guarding changed (c659a2d + round 1).
  const expected = [
    `.a${guard}{background-color:rgb(28, 44, 70)!important}`,
    `.b${guard}::before{color:#d4deeb!important}`,
    `div > p.c${guard},ul li${guard}{background-color:rgb(27, 43, 68)!important}`,
    `a[href*=","]:hover${guard}{color:#d4deeb!important}`,
    `:is(.x, .y) .z${guard}::after{border-top-color:rgb(97, 111, 132)!important;border-right-color:rgb(97, 111, 132)!important;border-bottom-color:rgb(97, 111, 132)!important;border-left-color:rgb(97, 111, 132)!important}`,
    `:host .inner${guard}{background-color:rgb(28, 44, 70)!important}`,
    `@media (min-width: 1px){.m${guard}{background-color:rgb(28, 44, 70)!important}}`,
  ].join('\n');
  assert.equal(out, expected);
});

test('text edits inside a component do not trigger adopted-sheet checks or slices', async t => {
  const page = await fixture(t);
  await page.evaluate(() => {
    customElements.define('ticker-post', class extends HTMLElement { connectedCallback() { if (this.shadowRoot) return; this.attachShadow({ mode: 'open' }).innerHTML = '<style>.inner{background:#ffffff;color:#111}</style><div class="inner"><span class="value">0</span></div>'; } });
    document.getElementById('feed').append(document.createElement('ticker-post'));
  });
  await page.evaluate(`expTest.DynamicEngine.start(${midnight});`);
  await page.waitForFunction(() => innerBg(document.querySelector('ticker-post')) !== white, null, { timeout: 3000 });
  await page.waitForTimeout(200);
  const read = () => { const health = expTest.DynamicEngine.health(); return { checks: health.adoptedChecks, slices: health.slices, calls: health.discoverCalls }; };
  const before = await page.evaluate(read);
  await page.evaluate(async () => {
    const text = document.querySelector('ticker-post').shadowRoot.querySelector('.value').firstChild;
    for (let i = 1; i <= 200; i++) { text.data = String(i); if (i % 20 === 0) await new Promise(resolve => setTimeout(resolve, 10)); }
  });
  await page.waitForTimeout(300);
  const after = await page.evaluate(read);
  assert.equal(typeof after.checks, 'number');
  assert.deepEqual({ checks: after.checks - before.checks, slices: after.slices - before.slices, calls: after.calls - before.calls }, { checks: 0, slices: 0, calls: 0 });
});

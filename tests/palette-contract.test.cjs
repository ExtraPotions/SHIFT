'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ui = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui.js'), 'utf8');
const themes = fs.readFileSync(path.join(__dirname, '..', 'src', 'themes.js'), 'utf8');

test('SHIFT presents the locked eight palettes in order', () => {
  const names = ['Ember', 'Midnight', 'Glacier', 'High contrast', 'Verdant', 'Pride', 'Crimson', 'SHIFT gem'];
  let cursor = -1;
  for (const name of names) {
    const next = ui.indexOf(`name:'${name}'`, cursor + 1);
    assert.ok(next > cursor, `${name} follows the locked order`);
    cursor = next;
  }
  assert.doesNotMatch(ui, /name:'Twitch'/u);
});

test('SHIFT includes exact Midnight, Crimson, and gem anchors', () => {
  for (const token of ['#050a12', '#0c0508', '#041313', '#1e938f']) assert.match(themes, new RegExp(token, 'u'));
  for (const token of ['#3563a3', '#941f2f']) assert.match(ui, new RegExp(token, 'u'));
});

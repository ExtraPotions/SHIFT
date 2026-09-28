'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('SHIFT declares its suite interoperability capabilities', () => {
  const source = read('src/main.js');
  assert.match(source, /registerSuiteProduct\?\./u);
  for (const capability of ['appearance.theme', 'appearance.readability', 'appearance.site-profile']) {
    assert.match(source, new RegExp(capability.replace('.', '\\.')));
  }
});

test('generated SHIFT userscript carries the same suite declaration', () => {
  const built = read('shift.user.js');
  assert.match(built, /productId:\s*'shift'/u);
  assert.match(built, /appearance\.theme/u);
});


test('SHIFT declares its presentation interoperability phase', () => {
  const source = read('src/main.js');
  assert.match(source, /registerPresentationProvider\\?\\./u);
  assert.match(source, /productId:\\s*'shift'/u);
  assert.match(source, /'theme'/u);
});


test('SHIFT honors shared presentation suppression before live repair work', () => {
  const source = read('src/live-resolver.js');
  assert.match(source, /isPresentationSuppressed\\?\\.\\(el\\)/u);
});

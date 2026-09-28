'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('SHIFT declares its suite interoperability capabilities', () => {
  const source = read('src/main.js');
  assert.ok(source.includes('registerSuiteProduct?.({'));
  assert.ok(source.includes('appearance.theme'));
  assert.ok(source.includes('appearance.readability'));
  assert.ok(source.includes('appearance.site-profile'));
});

test('generated SHIFT userscript carries the same suite declaration', () => {
  const built = read('shift.user.js');
  assert.ok(built.includes("productId: 'shift'"));
  assert.ok(built.includes('appearance.theme'));
});

test('SHIFT declares its presentation interoperability phase', () => {
  const source = read('src/main.js');
  assert.ok(source.includes('registerPresentationProvider?.({'));
  assert.ok(source.includes("productId: 'shift'"));
  assert.ok(source.includes('"theme"'));
});

test('SHIFT uses the shared presentation contract at its existing engine gate', () => {
  const resolver = read('src/live-resolver.js');
  assert.ok(resolver.includes("isPresentationSuppressed?.(el)"));
});

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('SHIFT delegates suite and presentation metadata to Core diagnostics bootstrap', () => {
  const source = read('src/main.js');
  assert.match(source, /registerDiagnosticsProduct\('shift'/);
  assert.doesNotMatch(source, /registerSuiteProduct\?\./u);
  assert.doesNotMatch(source, /registerPresentationProvider\?\./u);
});

test('generated SHIFT userscript keeps the same Core-owned interoperability bootstrap', () => {
  const built = read('shift.user.js');
  assert.match(built, /registerDiagnosticsProduct\('shift'/);
  assert.doesNotMatch(built, /registerSuiteProduct\?\./u);
  assert.doesNotMatch(built, /registerPresentationProvider\?\./u);
});

test('SHIFT honors shared presentation suppression at the live repair gate', () => {
  const resolver = read('src/live-resolver.js');
  assert.ok(resolver.includes("globalThis.ExtraPotionsCore?.isPresentationSuppressed?.(el)"));
});

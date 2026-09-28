'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('SHIFT delegates its suite interoperability metadata to Core', () => {
  const source = read('src/main.js');
  const suiteStart = source.indexOf('registerSuiteProduct?.({');
  const presentationStart = source.indexOf('registerPresentationProvider?.({');
  const diagnosticsStart = source.indexOf('registerDiagnosticsProduct');
  assert.ok(suiteStart >= 0);
  assert.ok(presentationStart > suiteStart);
  assert.ok(diagnosticsStart > presentationStart);
  const suiteBlock = source.slice(suiteStart, presentationStart);
  const presentationBlock = source.slice(presentationStart, diagnosticsStart);
  assert.ok(suiteBlock.includes("productId: 'shift'"));
  assert.ok(suiteBlock.includes('productVersion: EXP.VERSION'));
  assert.doesNotMatch(suiteBlock, /capabilities\s*:/u);
  assert.ok(presentationBlock.includes("productId: 'shift'"));
  assert.doesNotMatch(presentationBlock, /phases\s*:/u);
});

test('generated SHIFT userscript carries the delegated interoperability registration', () => {
  const built = read('shift.user.js');
  const suiteStart = built.indexOf('registerSuiteProduct?.({');
  const presentationStart = built.indexOf('registerPresentationProvider?.({');
  assert.ok(suiteStart >= 0);
  assert.ok(presentationStart > suiteStart);
  assert.ok(built.slice(suiteStart, presentationStart).includes("productId: 'shift'"));
});

test('SHIFT uses the shared presentation contract at its existing engine gate', () => {
  const resolver = read('src/live-resolver.js');
  assert.ok(resolver.includes("globalThis.ExtraPotionsCore?.isPresentationSuppressed?.(el)"));
});

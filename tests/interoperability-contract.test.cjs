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


test('SHIFT dynamic stylesheet engine shares Core observation when available', () => {
  const engine = read('src/dynamic-engine.js');
  assert.ok(engine.includes('globalThis.ExtraPotionsCore?.observePageBatch'));
  assert.ok(engine.includes("{productId:'shift'}"));
  assert.ok(engine.includes('sharedObserverCleanup?.()'));
  assert.ok(engine.includes('observer=new MutationObserver'));
});


test('SHIFT live resolver phase-orders child-list work through Core while retaining attribute observation', () => {
  const resolver = read('src/live-resolver.js');
  assert.ok(resolver.includes("typeof globalThis.ExtraPotionsCore?.observePageBatch==='function'"));
  assert.ok(resolver.includes("{productId:'shift'}"));
  assert.ok(resolver.includes('childList:!sharedAvailable'));
  assert.ok(resolver.includes("attributeFilter:['class','style','hidden','aria-hidden','open']"));
  assert.ok(resolver.includes('sharedObserverCleanup?.()'));
});

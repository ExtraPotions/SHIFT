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
  assert.match(built, /registerDiagnosticsProduct\(['"]shift['"]/);
  assert.doesNotMatch(built, /registerSuiteProduct\?\./u);
  assert.doesNotMatch(built, /registerPresentationProvider\?\./u);
});

test('SHIFT honors shared presentation suppression at the live repair gate', () => {
  const resolver = read('src/live-resolver.js');
  assert.ok(resolver.includes("ExtraPotionsCore.isPresentationSuppressed(el)"));
});

test('SHIFT reaches Core through the bundle-local binding, never an unassigned global', () => {
  for (const file of fs.readdirSync(path.join(root, 'src')).filter((name) => name.endsWith('.js'))) {
    assert.doesNotMatch(read(`src/${file}`), /globalThis\.ExtraPotionsCore/u, file);
  }
});


test('SHIFT dynamic stylesheet engine shares Core observation', () => {
  const engine = read('src/dynamic-engine.js');
  assert.ok(engine.includes('ExtraPotionsCore.observePageBatch('));
  assert.ok(engine.includes("{productId:'shift'}"));
  assert.ok(engine.includes('sharedObserverCleanup?.()'));
  assert.doesNotMatch(engine, /\.observe\(\s*document/u);
  assert.match(engine, /\.observe\(\s*root\s*,/u);
});


test('SHIFT live resolver observes added nodes itself, since Core page batches name only their parents', () => {
  const resolver = read('src/live-resolver.js');
  assert.doesNotMatch(resolver, /observePageBatch/u);
  assert.ok(resolver.includes('childList:true'));
  assert.ok(resolver.includes("attributeFilter:['class','style','hidden','aria-hidden','open']"));
});


test('SHIFT publishes compact non-identifying suite state', () => {
  const source = read('src/main.js');
  assert.match(source, /ExtraPotionsCore\.publishSuiteState\('shift', 'shift\.state-changed'/u);
  assert.match(source, /active:/u);
  assert.match(source, /theme:/u);
  assert.match(source, /safeMode:/u);
  assert.match(source, /excluded:/u);
});

test('SHIFT dynamic themes skip stylesheets that Core marks as owned, without a list of product names', () => {
  const engine = fs.readFileSync(path.join(__dirname, '..', 'src', 'dynamic-engine.js'), 'utf8');
  assert.ok(engine.includes('isOwnedSheet=(sheet)=>'));
  assert.ok(engine.includes("selectorText==='.exp-owned-sheet-marker'"));
  assert.ok(engine.includes('isOwnedSheet(sheet))continue;'));
  for (const name of ['exp-prisma', 'exp-ward', '.tdh-']) assert.ok(!engine.includes(name), `no product name in the theme engine: ${name}`);
});

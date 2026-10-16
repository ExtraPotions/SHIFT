'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('diagnostics omit saved hosts, selectors and custom names while exports retain them', () => {
  const context = vm.createContext({ EXP: {}, location: { hostname: 'example.test' }, ExtraPotionsCore: { cloneSettings: value => JSON.parse(JSON.stringify(value)) } });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/settings.js'), 'utf8'), context);
  const settings = context.EXP.Settings;
  settings.load();
  settings.update({ profiles: [{ id: 'original', name: 'Private profile', appearance: { theme: 'original' } }], siteOverrides: { 'private.example': { preservedSelectors: ['#private-order'] } }, exclusions: ['clinic.example'] });
  const exported = JSON.stringify(settings.exportData());
  const result = settings.diagnosticSnapshot();
  for (const value of ['Private profile', 'private.example', '#private-order', 'clinic.example']) assert.ok(!JSON.stringify(result).includes(value), value);
  assert.equal(result.profileCount, 1);
  assert.equal(result.siteOverrideCount, 1);
  assert.equal(result.exclusionCount, 1);
  assert.equal(settings.diagnosticSnapshot(settings.defaults).siteOverrideCount, 0);
  assert.equal(JSON.stringify(settings.exportData()), exported);
  assert.ok(exported.includes('#private-order'));
});

test('reports and issue summaries use sanitized current and default settings', () => {
  const ui = fs.readFileSync(path.join(__dirname, '../src/ui.js'), 'utf8');
  assert.match(ui, /settings: EXP\.Settings\.diagnosticSnapshot\(\)/);
  assert.match(ui, /issueSettings:\(\)=>\(\{current:EXP\.Settings\.diagnosticSnapshot\(\),defaults:EXP\.Settings\.diagnosticSnapshot\(EXP\.Settings\.defaults\)\}\)/);
});

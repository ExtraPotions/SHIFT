'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('settings stay mutable in the userscript realm when native clones are Xray-wrapped', () => {
  const context = vm.createContext({ EXP: {}, ExtraPotionsCore: { cloneSettings: value => JSON.parse(JSON.stringify(value)) }, location: { hostname: 'example.com' },
    structuredClone(value) {
      return new Proxy(structuredClone(value), { set(target, key, next) {
        if (next && typeof next === 'object') throw new Error('Not allowed to define cross-origin object as property on XrayWrapper');
        target[key] = next; return true;
      } });
    }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../vendor/exp-core/exp-core.js'),'utf8').match(/const ExtraPotionsTools = \(\(\) => \{[\s\S]*?\n\}\)\(\);/)[0]+';ExtraPotionsCore.createSettingsRecovery=ExtraPotionsTools.createSettingsRecovery;',context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/settings.js'), 'utf8'), context);
  const settings = context.EXP.Settings;
  const loaded = settings.load();
  assert.equal(loaded.currentProfile, 'original');
  const next = settings.update({siteOverrides: {'example.com': {theme: 'original'}}});
  next.siteOverrides['example.com'].theme = 'changed';
  assert.equal(settings.snapshot().siteOverrides['example.com'].theme, 'original');
  const exported = settings.exportData();
  assert.equal(settings.importData(exported).profiles[0].id, 'original');
});

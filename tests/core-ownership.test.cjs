'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const source = fs.readdirSync(src)
  .filter(name => name.endsWith('.js'))
  .map(name => fs.readFileSync(path.join(src, name), 'utf8'))
  .join('\n');

test('SHIFT does not redefine Core-owned shared infrastructure', () => {
  for (const pattern of [
    /function protectLauncherHost\s*\(/u,
    /function layoutGrid\s*\(/u,
    /function registerLauncher\s*\(/u,
    /function createProductNotice\s*\(/u,
    /function createMenuNotice\s*\(/u,
    /function layoutFloatingNotices\s*\(/u,
    /function createDiagnosticsReport\s*\(/u,
    /function createReleaseUpdateChecker\s*\(/u,
  ]) {
    assert.doesNotMatch(source, pattern);
  }
});

test('SHIFT consumes the public ExtraPotionsCore boundary', () => {
  assert.match(source, /ExtraPotionsCore\.createLifecycle\(/u);
  assert.match(source, /ExtraPotionsCore\.createProductNotice\(/u);
  assert.match(source, /ExtraPotionsCore\.createDiagnosticsReport\(/u);
  assert.match(source, /ExtraPotionsCore\.createReleaseUpdateChecker\(/u);
});

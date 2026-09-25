'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const script = fs.readFileSync(path.join(root, 'shift.user.js'), 'utf8');
const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
const releaseNotes = fs.readFileSync(path.join(root, 'src', 'release-notes.js'), 'utf8');

test('legacy release-note files and screenshots are removed', () => {
  for (const name of fs.readdirSync(root)) assert.doesNotMatch(name, /^RELEASE-NOTES-/);
  for (const file of ['docs/preview-rc1.png', 'docs/shift-badge-32.png', 'docs/checkpoint-d.md', 'assets/shift-badge.png']) {
    assert.equal(fs.existsSync(path.join(root, file)), false, file);
  }
  const screenshots = fs.readdirSync(path.join(root, 'docs', 'screenshots')).filter((name) => name.endsWith('.png'));
  assert.deepEqual(screenshots.sort(), ['appearance-menu.png', 'current-fixture.png', 'effects-menu.png', 'menu-overview.png', 'readability-menu.png', 'recovery-menu.png']);
});

test('CHANGELOG and in-app release notes use Dropper-style version headers and bullets', () => {
  const header = new RegExp(`^## ${pkg.version.replaceAll('.', '\\.')} — \\d{4}-\\d{2}-\\d{2}$`, 'm');
  assert.match(changelog, header);
  const section = changelog.slice(changelog.search(header)).split(/\n## /)[0];
  const bullets = [...section.matchAll(/^- (.+)$/gm)].map((match) => match[1]);
  assert.ok(bullets.length >= 2 && bullets.length <= 4, JSON.stringify(bullets));
  assert.doesNotMatch(section, /\.\s+[A-Z][a-z]+.*\.\s+[A-Z]/);
  assert.match(releaseNotes, new RegExp(`'${pkg.version.replaceAll('.', '\\.')}': \\[`));
  assert.match(script, new RegExp(`EXP\\.VERSION = '${pkg.version.replaceAll('.', '\\.')}'`));
  assert.match(script, /heading\.textContent = `Version \$\{version\}`/);
  assert.match(script, /changelog-list/);
  for (const bullet of bullets) assert.ok(script.includes(bullet), bullet);
});

test('updates and manifest read the shared product version', () => {
  assert.match(script, new RegExp(`const CURRENT_VERSION = EXP\\.VERSION`));
  assert.match(script, new RegExp(`version: EXP\\.VERSION`));
  assert.match(script, new RegExp(`@version\\s+${pkg.version.replaceAll('.', '\\.')}`));
});

test('bottom-launcher changelog has a side-placement fallback', () => {
  assert.match(script, /function positionChangelog\(\)/);
  assert.match(script, /notice\.dataset\.placement = 'launcher-side'/);
  assert.match(script, /host\?\.dataset\.openDirection === 'up'/);
});

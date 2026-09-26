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
  for (const file of ['docs/preview-rc1.png', 'docs/shift-badge-32.png', 'docs/checkpoint-d.md', 'assets/shift-badge.png', 'assets/shift-badge.svg', 'assets/shift-badge-128.png']) {
    assert.equal(fs.existsSync(path.join(root, file)), false, file);
  }
  const screenshots = fs.readdirSync(path.join(root, 'docs', 'screenshots')).filter((name) => name.endsWith('.png'));
  assert.deepEqual(screenshots.sort(), ['appearance-menu.png', 'current-fixture.png', 'effects-menu.png', 'menu-overview.png', 'readability-menu.png', 'recovery-menu.png']);
});

test('CHANGELOG and in-app release notes use Dropper-style version headers and bullets', () => {
  const escapedVersion = pkg.version.replaceAll('.', '\\.');
  const header = new RegExp(`^## ${escapedVersion} — \\d{4}-\\d{2}-\\d{2}$`, 'm');
  assert.match(changelog, header);
  const section = changelog.slice(changelog.search(header)).split(/\n## /)[0];
  const bullets = [...section.matchAll(/^- (.+)$/gm)].map((match) => match[1]);
  assert.ok(bullets.length >= 2 && bullets.length <= 4, JSON.stringify(bullets));
  assert.ok(releaseNotes.includes(`'${pkg.version}': [`), 'Current version must have an in-app release-note entry.');
  assert.ok(script.includes(`EXP.VERSION = '${pkg.version}'`), 'Built product version must match package.json.');
  const normalizedNotes = releaseNotes.replaceAll("\\'", "'");
  for (const bullet of bullets) assert.ok(normalizedNotes.includes(bullet), bullet);
  assert.match(script, /title: 'SHIFT Changelog'/);
  assert.match(script, /update-list/);
});

test('updates and manifest read the shared product version', () => {
  assert.match(script, /ExtraPotionsCore\.createReleaseUpdateChecker/);
  assert.match(script, /currentVersion:\s*EXP\.VERSION/);
  assert.match(script, /endpoint:\s*'https:\/\/api\.github\.com\/repos\/ExtraPotions\/SHIFT\/releases\/latest'/);
  assert.match(script, /version:\s*EXP\.VERSION/);
  const metadataVersion = script.match(/^\/\/ @version\s+(\S+)$/m)?.[1];
  assert.equal(metadataVersion, pkg.version);
});

test('changelog uses the shared Dropper menu-width notice controller', () => {
  assert.match(script, /function createMenuNotice\(/);
  assert.match(script, /notice\.dataset\.placement = 'menu'/);
  assert.match(script, /ExtraPotionsCore\.createProductNotice\(/);
  assert.match(script, /notice\.dataset\.placement = 'menu'/);
  assert.doesNotMatch(script, /function positionChangelog\(\)/);
  assert.doesNotMatch(script, /EXP\.Core\.registerFloatingNotice\(host, updateNotice\)/);
});

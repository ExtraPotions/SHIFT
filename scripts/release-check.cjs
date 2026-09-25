'use strict';
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

const root = path.resolve(__dirname, '..');
for (const asset of ['shift-badge.svg', 'shift-launcher.svg', 'shift-badge-128.png']) {
  if (!fs.existsSync(path.join(root, 'assets', asset))) throw new Error(`Missing SHIFT asset: ${asset}`);
}
const run = (args) => cp.execFileSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
run(['scripts/build.cjs', '--check']);
run(['--test', 'tests/*.test.cjs']);

const files = [];
for (const directory of ['src', 'scripts', 'tests', 'docs']) {
  const full = path.join(root, directory);
  if (!fs.existsSync(full)) continue;
  for (const name of fs.readdirSync(full)) if (fs.statSync(path.join(full, name)).isFile()) files.push(path.join(full, name));
}
files.push(path.join(root, 'README.md'), path.join(root, 'CHANGELOG.md'), path.join(root, 'package.json'), path.join(root, 'shift.user.js'));
const combined = files.filter(fs.existsSync).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const artifact = fs.readFileSync(path.join(root, 'shift.user.js'), 'utf8');
const credentialPatterns = [
  [/AKIA[0-9A-Z]{16}/, 'AWS access key'],
  [/gh[pousr]_[A-Za-z0-9_]{30,}/, 'GitHub token'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key']
];
const artifactPatterns = [
  [/\b(?:eval\s*\(|new\s+Function\b)/, 'dynamic execution'],
  [/@require\b/, 'remote executable dependency']
];
for (const [pattern, label] of credentialPatterns) if (pattern.test(combined)) throw new Error(`Release blocked: ${label} detected.`);
for (const [pattern, label] of artifactPatterns) if (pattern.test(artifact)) throw new Error(`Release blocked: ${label} detected.`);
const connects = [...artifact.matchAll(/^\/\/ @connect\s+(.+)$/gm)].map((match) => match[1].trim());
if (connects.length !== 1 || connects[0] !== 'api.github.com') throw new Error(`Release blocked: unexpected @connect inventory: ${connects.join(', ') || 'none'}.`);
const grants = [...artifact.matchAll(/^\/\/ @grant\s+(.+)$/gm)].map((match) => match[1].trim()).sort();
const allowedGrants = ['GM_addElement', 'GM_addStyle', 'GM_getValue', 'GM_setValue', 'GM_xmlhttpRequest', 'unsafeWindow'].sort();
if (JSON.stringify(grants) !== JSON.stringify(allowedGrants)) throw new Error(`Release blocked: userscript grant inventory changed: ${grants.join(', ')}.`);
if (!artifact.includes("const ENDPOINT = 'https://api.github.com/repos/ExtraPotions/SHIFT/releases/latest';")) throw new Error('Release blocked: update metadata endpoint does not match the network inventory.');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
const versionHeader = new RegExp(`^## ${pkg.version.replaceAll('.', '\\.')} — \\d{4}-\\d{2}-\\d{2}$`, 'm');
if (!versionHeader.test(changelog)) throw new Error(`Release blocked: CHANGELOG.md is missing a dated header for ${pkg.version}.`);
const section = changelog.slice(changelog.search(versionHeader)).split(/\n## /)[0];
const bullets = [...section.matchAll(/^- (.+)$/gm)].map((match) => match[1]);
if (bullets.length < 2 || bullets.length > 4) throw new Error(`Release blocked: ${pkg.version} changelog must contain 2–4 bullet items.`);
for (const name of fs.readdirSync(root)) if (/^RELEASE-NOTES-/.test(name)) throw new Error(`Release blocked: remove legacy release note file ${name}.`);
for (const file of ['docs/preview-rc1.png', 'docs/shift-badge-32.png', 'docs/checkpoint-d.md']) {
  if (fs.existsSync(path.join(root, file))) throw new Error(`Release blocked: remove legacy asset ${file}.`);
}
const screenshots = fs.readdirSync(path.join(root, 'docs', 'screenshots')).filter((name) => name.endsWith('.png'));
if (screenshots.length !== 6) throw new Error(`Release blocked: docs/screenshots must contain exactly 6 PNG files (found ${screenshots.length}).`);
if (!artifact.includes(`EXP.VERSION = '${pkg.version}'`)) throw new Error('Release blocked: built userscript EXP.VERSION does not match package.json.');
for (const bullet of bullets) if (!artifact.includes(bullet)) throw new Error(`Release blocked: in-app release notes missing changelog bullet: ${bullet}`);
console.log('Release check passed: build, tests, credentials, dynamic execution, network permissions, and control policy.');

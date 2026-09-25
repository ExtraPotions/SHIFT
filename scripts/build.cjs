'use strict';
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const crypto = require('node:crypto');
const normalize = (text) => text.replace(/\r\n/g, '\n');
const corePath = path.join(root, 'vendor', 'exp-core', 'exp-core.js');
const coreSource = fs.readFileSync(corePath, 'utf8');
const core = normalize(coreSource);
const coreManifest = JSON.parse(fs.readFileSync(path.join(root, 'vendor', 'exp-core', 'manifest.json'), 'utf8'));
if (crypto.createHash('sha256').update(coreSource).digest('hex') !== coreManifest.bundleSha256) throw new Error('Bundled Core hash mismatch');

const sourceFiles = ['core.js', 'settings.js', 'themes.js', 'preload.js', 'color-engine.js', 'site-fixes.js', 'dynamic-engine.js', 'live-resolver.js', 'theme-rules.js', 'theme-controller.js', 'adapters.js', 'release-notes.js', 'updates.js', 'menu-chrome.js', 'diagnostics.js', 'ui.js', 'main.js'];
let metadata = normalize(fs.readFileSync(path.join(root, 'src', 'metadata.txt'), 'utf8')).trimEnd();
const badgeData = `data:image/svg+xml;base64,${fs.readFileSync(path.join(root, 'assets', 'shift-badge.svg')).toString('base64')}`;
metadata = metadata.replaceAll('__EXP_SHIFT_BADGE_DATA__', badgeData);
const launcherData = `data:image/svg+xml;base64,${fs.readFileSync(path.join(root, 'assets', 'shift-launcher.svg')).toString('base64')}`;
const source = sourceFiles.map((name) => normalize(fs.readFileSync(path.join(root, 'src', name), 'utf8')).trim()).join('\n\n')
  .replaceAll('__EXP_SHIFT_BADGE_DATA__', badgeData)
  .replaceAll('__EXP_SHIFT_LAUNCHER_DATA__', launcherData)
  .replace(/const BADGE_DATA = 'data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+';/, `const BADGE_DATA = '${badgeData}';`)
  .replace(/const LAUNCHER_DATA = 'data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+';/, `const LAUNCHER_DATA = '${launcherData}';`);
const output = `${metadata}\n\n(() => {\n'use strict';\nconst EXP = Object.create(null);\n\n${core}\n${source}\n})();\n`;
const target = path.join(root, 'shift.user.js');

if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== output) {
    console.error('shift.user.js is not reproducible from current source.');
    process.exit(1);
  }
  console.log('Build check passed.');
} else {
  fs.writeFileSync(target, output, 'utf8');
  console.log(`Built ${path.relative(root, target)} (${Buffer.byteLength(output)} bytes).`);
}

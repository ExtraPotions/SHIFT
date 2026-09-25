'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'shift.user.js');
const script = fs.readFileSync(scriptPath, 'utf8');
const scriptBytes = fs.statSync(scriptPath).size;

test('userscript metadata and generated safety constraints', () => {
  assert.match(script, /@name\s+SHIFT/);
  assert.ok(scriptBytes >= 100 * 1024 && scriptBytes <= 400 * 1024, `shift.user.js must be 100–400KB (got ${scriptBytes} bytes)`);
  assert.doesNotMatch(script, /^\/\/ @resource\b/m);
  assert.doesNotMatch(script, /\bGM_getResourceText\b/);
  assert.doesNotMatch(script, /\bexpPart\d+\b/);
  assert.match(script, /@namespace\s+https:\/\/github\.com\/ExtraPotions/);
  assert.deepEqual(Buffer.from(script.match(/^\/\/ @icon\s+data:image\/svg\+xml;base64,(.+)$/m)[1], 'base64'), fs.readFileSync(path.join(root, 'assets', 'shift-badge.svg')));
  assert.doesNotMatch(script, /@require\b/);
  assert.match(script, /@connect\s+api\.github\.com/);
  assert.match(script, /@updateURL\s+https:\/\/github\.com\/ExtraPotions\/SHIFT\/releases\/latest\/download\/shift\.user\.js/);
  assert.match(script, /@grant\s+unsafeWindow/);
  assert.match(script, /@grant\s+GM_addStyle/);
  assert.match(script, /@inject-into\s+content/);
  assert.doesNotMatch(script, /\beval\s*\(/);
  assert.doesNotMatch(script, /new\s+Function\b/);
  assert.match(script, /applyMatteToggleChrome/);
  assert.match(script, /MATTE_TOGGLE_CHROME_CSS/);
  assert.match(script, /background-image:none!important/);
  assert.doesNotMatch(script, /\.switch\[aria-checked="true"\],\[role="switch"\]\[aria-checked="true"\]\{border-color:transparent!important;background:\$\{edge\}!important\}/);
  assert.doesNotMatch(script, /background:#313b3d;cursor:pointer\}\.switch span\{display:block;width:16px/);
  assert.doesNotMatch(script, /localStorage\.(?:getItem|setItem)\(['"](?:colorshift|dpb)/i);
  assert.match(script, /data:image\/svg\+xml;base64,/);
  assert.doesNotMatch(script, /__EXP_SHIFT_BADGE_DATA__/);
  assert.doesNotMatch(script, /__EXP_SHIFT_LAUNCHER_DATA__/);
  const launcher = fs.readFileSync(path.join(root, 'assets', 'shift-launcher.svg'), 'utf8');
  const badge = fs.readFileSync(path.join(root, 'assets', 'shift-badge.svg'));
  assert.equal(crypto.createHash('sha256').update(badge).digest('hex'), '905b36793533ce4ced6cff8650d98b0f022fa185a3938beabbdced3db8842fb5');
  assert.equal(crypto.createHash('sha256').update(launcher).digest('hex'), 'ec77127e1645426a0494a768de07a65009ddfd49d7ea919c2ecba07521f60b64');
  assert.match(script, /\[data-exp-part="launcher"\]\{[^}]*width:48px!important;[^}]*height:48px!important/u);
  assert.match(script, /\[data-exp-part="launcher"\] \.launcher-icon\{width:40px!important;height:40px!important\}/u);
  assert.match(script, /\.header-icon \.menu-icon\{width:38px!important;height:38px!important\}/u);
  assert.ok(script.includes(`data:image/svg+xml;base64,${badge.toString('base64')}`));
  assert.ok(script.includes(`data:image/svg+xml;base64,${Buffer.from(launcher).toString('base64')}`));
  assert.doesNotMatch(launcher, /<rect x="32"|<rect x="42"|id="border"/u);
  assert.match(script, /createDiagnosticsReport\('SHIFT'/);
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'src', 'ui.js'), 'utf8'), /<svg class="launcher-ring"/u);
  assert.match(script, /launcher\.replaceChildren\(mark\)/u);
});

test('128 px source badge derivative has exact dimensions', () => {
  const png = fs.readFileSync(path.join(root, 'assets', 'shift-badge-128.png'));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 128);
  assert.equal(png.readUInt32BE(20), 128);
});

test('manifest and package versions agree', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const metadataVersion = script.match(/@version\s+([^\s]+)/)[1];
  assert.equal(metadataVersion, pkg.version);
  assert.match(script, /version: EXP\.VERSION/);
  assert.match(script, new RegExp(`EXP\\.VERSION = '${pkg.version.replaceAll('.', '\\.')}'`));
});

test('source avoids legacy JavaScript var declarations', () => {
  for (const file of fs.readdirSync(path.join(root, 'src')).filter((name) => name.endsWith('.js'))) {
    const source = fs.readFileSync(path.join(root, 'src', file), 'utf8');
    assert.doesNotMatch(source, /(^|[;{}]\s*)var\s+[A-Za-z_$]/m, file);
  }
});

test('runtime source keeps direct style creation inside Core fallback only', () => {
  const files = ['theme-controller.js','adapters.js','updates.js','menu-chrome.js','diagnostics.js','ui.js','main.js','settings.js','themes.js'];
  for (const name of files) {
    const source = fs.readFileSync(path.resolve(__dirname, '..', 'src', name), 'utf8');
    assert.doesNotMatch(source, /createElement\(['"]style['"]\)|el\(['"]style['"]/i, name);
  }
});

test('theme runtime has one owner for stylesheets and one owner for live DOM repair', () => {
  const controller = fs.readFileSync(path.join(root, 'src', 'theme-controller.js'), 'utf8');
  const colors = fs.readFileSync(path.join(root, 'src', 'color-engine.js'), 'utf8');
  const live = fs.readFileSync(path.join(root, 'src', 'live-resolver.js'), 'utf8');
  const dynamic = fs.readFileSync(path.join(root, 'src', 'dynamic-engine.js'), 'utf8');
  const build = fs.readFileSync(path.join(root, 'scripts', 'build.cjs'), 'utf8');
  assert.equal(fs.existsSync(path.join(root, 'src', 'engine.js')), false);
  assert.match(build, /theme-controller\.js/);
  assert.doesNotMatch(build, /['"]engine\.js['"]/);
  assert.doesNotMatch(colors, /refreshStyleSheets|clearStyleSheets|data-exp-shift-sheet-style/);
  assert.doesNotMatch(controller, /createScheduler|setInterval|sheetMutationObserver|data-exp-shift-surface/);
  assert.match(dynamic, /style,link\[rel~=/);
  assert.match(live, /attributeFilter:\['class','style','hidden','aria-hidden','open'\]/);
});

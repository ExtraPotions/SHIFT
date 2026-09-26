'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
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
  assert.match(script, /^\/\/ @icon\s+https:\/\/raw\.githubusercontent\.com\/ExtraPotions\/SHIFT\/main\/assets\/shift-launcher\.svg$/m);
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
  assert.doesNotMatch(script, /data:image\//u);
  assert.doesNotMatch(script, /__EXP_SHIFT_BADGE_DATA__/);
  assert.doesNotMatch(script, /__EXP_SHIFT_LAUNCHER_DATA__/);
  const launcher = fs.readFileSync(path.join(root, 'assets', 'shift-launcher.svg'), 'utf8');
  assert.match(script, /\[data-exp-part="launcher"\]\{[^}]*width:48px!important;[^}]*height:48px!important/u);
  assert.match(script, /\[data-exp-part="launcher"\] \.launcher-icon\{width:40px!important;height:40px!important\}/u);
  assert.match(script, /\.header-icon \.menu-icon\{width:38px!important;height:38px!important\}/u);
  assert.ok(script.includes('https://raw.githubusercontent.com/ExtraPotions/SHIFT/main/assets/shift-launcher.svg'));
  for (const removed of ['shift-badge.svg', 'shift-badge-128.png']) {
    assert.equal(fs.existsSync(path.join(root, 'assets', removed)), false, removed);
  }
  assert.doesNotMatch(launcher, /<rect x="32"|<rect x="42"|id="border"/u);
  assert.match(script, /createDiagnosticsReport\('SHIFT'/);
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'src', 'ui.js'), 'utf8'), /<svg class="launcher-ring"/u);
  assert.match(script, /launcher\.replaceChildren\(mark\)/u);
  assert.match(script, /ExtraPotionsCore\.createProduct\(\{/u);
  assert.match(script, /ExtraPotionsCore\.createProductNotice\(\{/u);
  assert.match(script, /supportUrl:\s*SUPPORT_URL/u);
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'scripts', 'build.cjs'), 'utf8'), /menu-chrome\.js/u);
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
  const files = ['theme-controller.js','adapters.js','updates.js','diagnostics.js','ui.js','main.js','settings.js','themes.js'];
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
  assert.match(live, /const NATIVE_DARK_CANDIDATES = \[/u);
  assert.match(live, /nativeDarkFastPathPasses/u);
  assert.match(live, /backgroundCacheHits/u);
  assert.match(live, /backgroundParentCacheHits/u);
  assert.match(live, /nativeDarkExtendedWalks/u);
  assert.match(live, /const hardLimit=24,softLimit=options\.nativeDark\?8:24/u);
  assert.match(live, /backgroundCache\.set\(node,result\)/u);
  assert.match(live, /Math\.min\(levelLimit,700\)/u);
  assert.match(live, /repair\(el,'native-dark',\{\.\.\.options,surface:false\}\)/u);
  assert.match(controller, /inferred-dark-surface-majority/u);
  assert.match(controller, /darkSurfaceRatio>=\.72/u);
  assert.match(controller, /nativeDarkEvidence/u);
  assert.match(controller, /lightSurfaceCount<=Math\.max\(1,Math\.floor\(samples\.length\*\.12\)\)/u);
  assert.match(controller, /contradictoryLightMajority/u);
  assert.match(controller, /dominantLightContent/u);
  assert.match(controller, /const lightVeto=dominantLightContent\|\|contradictoryLightMajority/u);
  assert.match(controller, /explicitConfirmed=explicit&&darkCanvas&&!lightVeto/u);
  assert.match(controller, /lightSurfaceRatio>=\.5/u);
  assert.match(controller, /EXP\.DynamicEngine\?\.stop\(\);\s*EXP\.LiveResolver\?\.stop\(\);\s*unlockHost\(\);\s*const nativeDark=detectNativeDark\(\);/u);
});

test('SHIFT settings survive manager storage gaps and mirror to fallback storage', () => {
  const settings = fs.readFileSync(path.join(root, 'src', 'settings.js'), 'utf8');
  assert.match(settings, /const value = GM_getValue\(storageKey, undefined\);\s*if \(value !== undefined\) return value;/u);
  assert.match(settings, /const value = localStorage\.getItem\(storageKey\);\s*if \(value !== null\) \{/u);
  assert.match(settings, /if \(typeof GM_setValue === 'function'\) GM_setValue\(storageKey, parsed\);/u);
  assert.match(settings, /if \(typeof GM_setValue === 'function'\) GM_setValue\(storageKey, value\);/u);
  assert.match(settings, /localStorage\.setItem\(storageKey, JSON\.stringify\(value\)\);/u);
  assert.match(settings, /function load\(\) \{\s*const stored = rawRead\('settings'\);\s*state = validate\(stored \|\| defaults\);\s*rawWrite\('settings', state\);/u);
  assert.doesNotMatch(settings, /GM_setValue\(key\(name\), value\); return;/u);
});


const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ui=fs.readFileSync(path.join(__dirname,'../src/ui.js'),'utf8');
test('website palette chooser derives its choices from the curated catalog',()=>{assert.doesNotMatch(ui,/Saved themes/);assert.match(ui,/EXP\.Themes\.navigationThemes/);assert.doesNotMatch(ui,/function paletteStudio|function colorControl/);assert.match(ui,/applyTheme\(host,\s*'shift',/);});

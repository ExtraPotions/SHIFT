const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ui=fs.readFileSync(path.join(__dirname,'../src/ui.js'),'utf8');
test('website palette chooser derives its choices from the curated catalog',()=>{assert.match(ui,/EXP\.Themes\.themeOptions\(\)/);assert.match(ui,/label:'Website theme'/);assert.doesNotMatch(ui,/function paletteStudio|function colorControl/);assert.match(ui,/applyTheme\(host, 'shift'\)/);});

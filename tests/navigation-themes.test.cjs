'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function runtime(){let dark=true;const context=vm.createContext({EXP:{},ExtraPotionsCore:{cloneSettings:v=>JSON.parse(JSON.stringify(v))},matchMedia:()=>({get matches(){return dark;}}),location:{hostname:'example.test'}});for(const file of ['themes','settings'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/'+file+'.js'),'utf8'),context);return{...context.EXP,setDark:value=>dark=value};}
test('six themes support both modes and migrate retired palettes without changing scoped modes',()=>{
 const e=runtime();assert.deepEqual(Array.from(e.Themes.navigationThemes,t=>t.name),['Default','Indigo','Blue','Green','Red','Gray']);
 for(const t of e.Themes.navigationThemes){const light=e.Themes.resolve(t.id,'site-default',{colorMode:'light'}),dark=e.Themes.resolve(t.id,'site-default',{colorMode:'dark'});assert.equal(light.navigation,t.light);assert.equal(dark.navigation,t.dark);assert.equal(light.colorScheme,'light');assert.equal(dark.colorScheme,'dark');assert.notEqual(light.text,dark.text);}
 assert.equal(e.Themes.resolve('original').original,true);assert.equal(e.Themes.resolve('pride').id,'default');
 const state=e.Settings.replace({theme:'blue',colorMode:'light',profiles:[...e.Settings.defaults.profiles,{id:'reading',name:'Reading',appearance:{theme:'green',colorMode:'system'}}],currentProfile:'reading',siteOverrides:{'example.test':{theme:'red',colorMode:'light'}}});
 assert.equal(state.colorMode,'light');assert.equal(e.Settings.effective().colorMode,'light');assert.equal(e.Settings.effective().theme,'red');
 assert.equal(e.Settings.prepareImport(e.Settings.exportData()).profiles[1].appearance.colorMode,'system');
 assert.equal(e.Settings.validate,undefined);assert.equal(e.Settings.replace({theme:'blue',colorMode:'invalid'}).colorMode,'dark');
});
test('system mode resolves both directions without mutating saved theme or mode',()=>{const e=runtime();const state=e.Settings.replace({theme:'indigo',colorMode:'system'});assert.equal(e.Themes.resolve(state.theme,state.accent,state).colorScheme,'dark');e.setDark(false);assert.equal(e.Themes.resolve(state.theme,state.accent,state).colorScheme,'light');assert.equal(e.Settings.snapshot().theme,'indigo');assert.equal(e.Settings.snapshot().colorMode,'system');});
test('profile imports retain Original and migrate retired palettes to Default',async t=>{
 const {chromium}=require('playwright'),browser=await chromium.launch();t.after(()=>browser.close());const page=await browser.newPage();
 await page.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({contentType:'text/html',body:'<!doctype html><main>Fixture</main>'}):r.abort());await page.goto('https://example.test/');
 await page.evaluate(()=>{const saved=new Map();window.GM_getValue=(k,v)=>saved.get(k)||v;window.GM_setValue=(k,v)=>saved.set(k,v);window.GM_xmlhttpRequest=o=>{queueMicrotask(()=>o.onerror?.({status:503}));return{abort(){}}};});
 await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'../shift.user.js'),'utf8')});const host=page.locator('#exp-shift-root');await host.locator('[data-exp-part=launcher]').click();await host.getByRole('tab',{name:'Advanced',exact:true}).click();
 const input=host.getByLabel('Import SHIFT profile',{exact:true});
 for(const theme of ['original','midnight']){
  await input.setInputFiles({name:'profile.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({product:'shift',generation:3,schema:1,type:'profile',profile:{name:theme,appearance:{theme,accent:'site-default'}}}))});
  await host.getByText('Profile imported.',{exact:true}).waitFor();
  await page.waitForFunction(name=>GM_getValue('exp:v3:shift:settings').profiles.at(-1).name===name,theme);
  await host.getByRole('tab',{name:'Appearance',exact:true}).click();
  assert.equal(await page.evaluate(()=>GM_getValue('exp:v3:shift:settings').profiles.at(-1).appearance.theme),theme==='original'?'original':'default');
  await host.getByRole('tab',{name:'Advanced',exact:true}).click();
 }
});
test('built appearance controls apply light/dark and OS changes to real page and native options',async t=>{
 const {chromium}=require('playwright'),browser=await chromium.launch();t.after(()=>browser.close());const page=await browser.newPage();await page.emulateMedia({colorScheme:'dark'});
 await page.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="background:white;color:black"><main><p>Sample text</p><select><option>Native option</option></select></main></body></html>'}):r.abort());await page.goto('https://example.test/');
 await page.evaluate(()=>{const saved=new Map([['exp:v3:shift:settings',{theme:'indigo',colorMode:'dark',updateNotifications:false}]]);window.GM_getValue=(key,value)=>saved.has(key)?saved.get(key):value;window.GM_setValue=(key,value)=>saved.set(key,value);window.GM_xmlhttpRequest=o=>{queueMicrotask(()=>o.onerror?.({status:503}));return{abort(){}}};});
 await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'../shift.user.js'),'utf8')});const host=page.locator('#exp-shift-root');await host.locator('[data-exp-part=launcher]').click();await host.locator('[data-shift-theme=indigo]').waitFor();
 for(const mode of ['light','dark'])for(const theme of ['default','indigo','blue','green','red','gray']){
   await host.locator('[data-shift-color-mode='+mode+']').click();await host.locator('[data-shift-theme='+theme+']').click();
   await page.waitForFunction(expected=>getComputedStyle(document.documentElement).colorScheme===expected,mode);
   assert.equal(await host.locator('[data-shift-theme='+theme+']').getAttribute('aria-pressed'),'true');
   assert.equal(await host.locator('[data-exp-part=dock]').evaluate(n=>n.scrollWidth<=n.clientWidth+1),true);
   const option=await page.locator('main option').evaluate(n=>({background:getComputedStyle(n).backgroundColor,color:getComputedStyle(n).color}));assert.notEqual(option.background,option.color);
 }
 await host.locator('[data-shift-color-mode=system]').click();await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>getComputedStyle(document.documentElement).colorScheme==='light');await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>getComputedStyle(document.documentElement).colorScheme==='dark');
 await host.getByRole('tab',{name:'Advanced',exact:true}).click();await host.getByRole('tab',{name:'Appearance',exact:true}).click();assert.equal(await host.locator('[data-shift-color-mode=system]').getAttribute('aria-pressed'),'true');
 await host.locator('[data-shift-appearance-explanation]>summary').click();await host.locator('[data-setting-source=theme]').getByRole('button',{name:'View source',exact:true}).click();
 await page.waitForFunction(()=>{const root=document.querySelector('#exp-shift-root').shadowRoot;return root.activeElement===root.querySelector('[data-shift-theme][aria-pressed="true"]');});assert.equal(await host.getByLabel('Saved theme',{exact:true}).count(),0);
});

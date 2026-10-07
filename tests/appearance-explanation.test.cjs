const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {chromium}=require('playwright');
test('appearance provenance follows global, profile and site precedence including Original assignments',()=>{
 const c=vm.createContext({EXP:{},ExtraPotionsCore:{cloneSettings:v=>JSON.parse(JSON.stringify(v))},location:{hostname:'example.test'}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/settings.js'),'utf8'),c);
 const s=c.EXP.Settings;s.load();s.update({themeStrength:'strong',profiles:[...s.defaults.profiles,{id:'reading',name:'Reading',appearance:{theme:'original',themeStrength:'soft'}}],currentProfile:'reading',siteOverrides:{'example.test':{themeStrength:'normal'}}});
 let e=s.explain();assert.equal(e.sources.theme.kind,'profile');assert.equal(e.sources.themeStrength.kind,'site');assert.equal(e.settings.themeStrength,'normal');assert.equal(JSON.stringify(e.settings),JSON.stringify(s.effective()));
 s.update({siteOverrides:{'example.test':{profileId:'original'}}});e=s.explain();assert.equal(e.sources.theme.label,'Profile: Original');assert.equal(e.sources.themeStrength.kind,'global');assert.equal(e.settings.themeStrength,'strong');
 s.update({currentProfile:'original',siteOverrides:{},exclusions:['example.test']});e=s.explain('sub.example.test');assert.equal(e.settings.excluded,true);assert.equal(e.sources.theme.kind,'global');
});
test('instrumented readable source appearance explanation reports blockers, updates values, and navigates to the source on narrow menus',async t=>{
 const browser=await chromium.launch();t.after(()=>browser.close());const page=await browser.newPage({viewport:{width:320,height:700}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://example.test/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><body><main>Example</main></body>'}));await page.goto('https://example.test/');
 const script=require('./load-source.cjs').loadSource().replace('\nbootOnce();','\nwindow.testShift=EXP;bootOnce();');await page.addScriptTag({content:script});
 const host=page.locator('#exp-shift-root');await host.locator('.launcher').click();await host.locator('[data-section="appearance"]').click();
 const card=host.locator('[data-shift-appearance-explanation]');await card.locator(':scope > summary').click();await page.waitForFunction(()=>document.querySelector('#exp-shift-root').shadowRoot.querySelector('[data-shift-appearance-explanation]').textContent.includes('Original is selected'));
 await page.evaluate(()=>testShift.Settings.update({safeMode:true}));await card.locator('button').filter({hasText:'Refresh explanation'}).click();assert.match(await card.textContent(),/Safe Mode is on/);
 await page.evaluate(()=>testShift.Settings.update({safeMode:false,theme:'midnight',siteOverrides:{'example.test':{theme:'crimson'}}}));await card.getByText('Refresh explanation',{exact:true}).click();assert.match(await card.locator('[data-setting-source="theme"]').textContent(),/Crimson.*Site override/);
 await card.locator('[data-setting-source="theme"] button').click();assert.equal(await host.getByRole('combobox',{name:'Site profile',exact:true}).evaluate(n=>n===n.getRootNode().activeElement),true);
 await host.locator('[data-section="appearance"]').click();if(!await card.evaluate(n=>n.open))await card.locator(':scope > summary').click();
 await page.emulateMedia({forcedColors:'active'});await card.getByText('Refresh explanation',{exact:true}).click();assert.match(await card.textContent(),/forced colors/);
 await page.emulateMedia({forcedColors:'none'});await page.evaluate(()=>testShift.Engine.holdOriginal(true));await card.getByText('Refresh explanation',{exact:true}).click();assert.match(await card.textContent(),/temporary Original/);
 assert.equal(await card.evaluate(n=>n.scrollWidth<=n.clientWidth+1),true);assert.deepEqual(errors,[]);
});

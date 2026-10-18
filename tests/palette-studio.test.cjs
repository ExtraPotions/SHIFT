const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const{chromium}=require('playwright');
test('six website choices persist while menu identity stays fixed and custom creation is absent',async t=>{
 const browser=await chromium.launch();t.after(()=>browser.close());const page=await browser.newPage();
 await page.route('https://fixture.test/**',r=>r.fulfill({body:'<!doctype html><main>Readable sample</main>',contentType:'text/html'}));await page.goto('https://fixture.test/');const script=fs.readFileSync(path.join(__dirname,'../shift.user.js'),'utf8');await page.addScriptTag({content:script});const root=page.locator('#exp-shift-root');await root.locator('.launcher').click();
 const appearance=()=>root.getAttribute('data-ui-theme'),before=await appearance();
 assert.equal(await root.getByLabel('Saved theme',{exact:true}).count(),0);assert.equal(await page.getByText('Palette Studio',{exact:true}).count(),0);
 for(const theme of ['default','indigo','blue','green','red','gray']){await root.locator('[data-shift-theme='+theme+']').click();assert.deepEqual(await appearance(),before);}
 await page.reload();await page.addScriptTag({content:script});assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('exp:v3:shift:settings')).theme),'gray');
});

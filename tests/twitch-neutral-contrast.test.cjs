'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
test('Twitch neutral tokens stay paired before stylesheet recovery and restore with Original',async t=>{
  const browser=await chromium.launch();t.after(()=>browser.close());
  const page=await browser.newPage();
  await page.route('**/*',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><style>.dark-theme{--color-text-base:#efeff1;--color-background-base:#18181b;--color-text-overlay:#fff;--color-background-overlay:#000}.top-nav__menu{background:var(--color-background-base);color:var(--color-text-base)}.tw-text{color:var(--color-text-base)}</style><body class="dark-theme"><nav class="top-nav__menu"><span class="tw-text">Following</span></nav></body></html>'}));
  await page.goto('https://www.twitch.tv/');
  const source=require('./load-source.cjs').loadSource().replace('\nbootOnce();','\nwindow.testShift=EXP;');
  await page.addScriptTag({content:source});
  await page.evaluate(()=>{testShift.DynamicEngine={refresh(){},stop(){}};testShift.LiveResolver={start(){},stop(){}};});
  for(const mode of ['light','dark','light','dark']){
    await page.evaluate(mode=>testShift.Engine.start({...testShift.Settings.defaults,theme:'blue',colorMode:mode}),mode);
    await page.evaluate(mode=>testShift.Engine.apply({...testShift.Settings.defaults,theme:'blue',colorMode:mode}),mode);
    const colors=await page.locator('.tw-text').evaluate(n=>{
      const text=getComputedStyle(n).color,background=getComputedStyle(n.parentElement).backgroundColor,c=document.createElement('canvas').getContext('2d');
      const lum=color=>{c.fillStyle=color;c.fillRect(0,0,1,1);const rgb=[...c.getImageData(0,0,1,1).data].slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
      const a=lum(text),b=lum(background);return{text,background,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),overlay:getComputedStyle(document.body).getPropertyValue('--color-text-overlay').trim()};
    });
    assert.ok(colors.ratio>=4.5,JSON.stringify(colors));
    assert.equal(colors.overlay,'#fff','video overlay tokens remain native');
  }
  await page.evaluate(()=>testShift.Engine.apply({...testShift.Settings.defaults,theme:'original'}));
  assert.equal(await page.locator('.tw-text').evaluate(n=>getComputedStyle(n).color),'rgb(239, 239, 241)');
  assert.equal(await page.locator('.top-nav__menu').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(24, 24, 27)');
});

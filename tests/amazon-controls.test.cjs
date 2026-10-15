'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const script=fs.readFileSync(path.join(__dirname,'../shift.user.js'),'utf8');
const routes=[['search','/s?k=fixture'],['product','/dp/fixture'],['cart','/cart'],['orders','/gp/your-account/order-history']];
function readability() {
 const channel=value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const context=canvas.getContext('2d');
 const rgba=color=>{context.clearRect(0,0,1,1);context.fillStyle=color;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].map(n=>n/255);};
 const light=color=>{const c=color.slice(0,3).map(channel);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
 const contrast=(a,b)=>{const one=light(a),two=light(b);return (Math.max(one,two)+.05)/(Math.min(one,two)+.05);};
 const background=node=>{
  const ancestors=[];for(let current=node;current;current=current.parentElement)ancestors.unshift(current);
  return ancestors.reduce((base,current)=>{const c=rgba(getComputedStyle(current).backgroundColor);return c.slice(0,3).map((v,i)=>v*c[3]+base[i]*(1-c[3]));},[1,1,1]);
 };
 return [...document.querySelectorAll('body,header,main,section,article,form,aside,footer,[role="dialog"],label,p,h1,h2,a,button,input,select,textarea')]
  .filter(node=>!node.closest('[data-exp-owned="1"]')&&!node.id.startsWith('exp-'))
  .map(node=>({tag:node.tagName,id:node.id,label:node.getAttribute('aria-label'),contrast:contrast(rgba(getComputedStyle(node).color),background(node)),visible:node.getClientRects().length>0,disabled:node.disabled||false}));
}
for(const theme of ['midnight','amethyst','crimson','verdant','pride','obsidian','custom-light'])test(`Amazon controls and page surfaces stay readable under ${theme}`,async t=>{
 const browser=await chromium.launch();t.after(()=>browser.close());
 for(const [name,route] of routes){
  const page=await browser.newPage();const html=fs.readFileSync(path.join(__dirname,'fixtures/amazon',name+'.html'),'utf8');
  await page.addInitScript(theme=>{
   const saved=new Map([['exp:v3:shift:settings',{theme,accent:'site-default',focusVisibility:'high',customThemes:[{id:'custom-light',name:'Light fixture',page:'#fafafa',surface:'#ffffff',raised:'#eeeeee',overlay:'#e5e5e5',navigation:'#eeeeee',input:'#ffffff',interactive:'#eeeeee',text:'#111111',muted:'#555555',highlight:'#1f5aa0'}]}]]);
   window.GM_getValue=(key,fallback)=>saved.get(key)||fallback;window.GM_setValue=(key,value)=>saved.set(key,value);window.GM_xmlhttpRequest=()=>{};
  },theme);
  await page.route('**/*',r=>r.fulfill({contentType:r.request().url().endsWith('.svg')?'image/svg+xml':'text/html',body:r.request().url().endsWith('.svg')?'<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#f00"/></svg>':html}));
  await page.goto('https://www.amazon.com'+route);
  const before=await page.evaluate(()=>{window.fixtureControls=[...document.querySelectorAll('input,select,textarea,button')];return fixtureControls.map(n=>({value:n.value,disabled:n.disabled}));});
  await page.addScriptTag({content:script});await page.waitForSelector('#exp-shift-root',{state:'attached'});
  await page.waitForFunction(()=>document.documentElement.hasAttribute('data-exp-shift'));
  const data=await page.evaluate(readability);
  assert.ok(data.some(row=>row.tag==='SELECT')&&data.some(row=>row.tag==='TEXTAREA'),name+' includes select and textarea coverage');
  assert.deepEqual(data.filter(row=>!row.visible||(!row.disabled&&row.contrast<4.49)),[],name+': unreadable controls or surfaces');
  assert.deepEqual(await page.evaluate(()=>fixtureControls.map(n=>({value:n.value,disabled:n.disabled}))),before,name+' preserves values and disabled controls');
  const field=page.getByLabel('Gift message',{exact:true});await field.fill('A gift for you');assert.equal(await field.inputValue(),'A gift for you');
  await page.keyboard.press('Tab');await field.focus();
  assert.ok(await field.evaluate(n=>parseFloat(getComputedStyle(n).outlineWidth)>=3),'keyboard focus remains visible');
  const quantity=page.getByLabel('Quantity',{exact:true});await quantity.selectOption('2');assert.equal(await quantity.inputValue(),'2');
  assert.equal(await page.locator('#art').evaluate(n=>getComputedStyle(n).filter),'none');assert.equal(await page.locator('#art').getAttribute('data-exp-shift-live'),null);
  await page.evaluate(()=>{const panel=document.createElement('section');panel.id='late-delivery';panel.className='a-box';panel.innerHTML='<h2>Delivery options</h2><label for="late-field">Delivery instructions</label><input id="late-field" value="Leave at door"><button>Save instructions</button>';document.querySelector('main').append(panel);});
  await page.waitForFunction(()=>{const n=document.getElementById('late-field');return getComputedStyle(n).color!=='rgb(221, 221, 221)';});
  assert.deepEqual((await page.evaluate(readability)).filter(row=>!row.visible||(!row.disabled&&row.contrast<4.49)),[],name+' themes late delivery content');
  assert.equal(await field.inputValue(),'A gift for you');
  if(process.env.EXP_AMAZON_SCREENSHOTS){fs.mkdirSync(process.env.EXP_AMAZON_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.EXP_AMAZON_SCREENSHOTS,`${theme}-${name}.png`),fullPage:true});}
  await page.close();
 }
});

import { webkit, devices } from 'playwright';
const BASE='http://127.0.0.1:18888';
const ROOM='VIS'+Date.now().toString(36).slice(-4).toUpperCase();
const out='/Users/gemstone/Desktop/coral-crew/_qa/acceptance-latest';
const browser=await webkit.launch({headless:true});
const ipad=devices['iPad (gen 7) landscape'];
const a=await browser.newContext({...ipad,hasTouch:true,isMobile:true});
const b=await browser.newContext({...ipad,hasTouch:true,isMobile:true});
const t=await browser.newContext({viewport:{width:1280,height:800}});
const A=await a.newPage(), B=await b.newPage(), T=await t.newPage();
const errors=[];
for (const [name,p] of [['A',A],['B',B],['T',T]]) {
  p.on('pageerror',e=>errors.push(name+':'+e.message));
}
await A.goto(BASE+'/',{waitUntil:'networkidle'});
await B.goto(BASE+'/',{waitUntil:'networkidle'});
await A.evaluate(r=>document.querySelector('#room-input').value=r,ROOM);
await B.evaluate(r=>document.querySelector('#room-input').value=r,ROOM);
await A.click('button.role.pirate'); await A.waitForTimeout(120); await A.click('button.role.pirate');
await B.click('button.role.diver'); await B.waitForTimeout(120); await B.click('button.role.diver');
await A.waitForSelector('#hud:not([hidden])'); await B.waitForSelector('#hud:not([hidden])');
await A.click('#ready'); await B.click('#ready');
await A.waitForFunction(()=>document.querySelector('#ready')?.hidden===true);
await A.screenshot({path:out+'/01-pirate-before-kraken.png',fullPage:true});
await B.screenshot({path:out+'/02-diver-before-kraken.png',fullPage:true});
await T.goto(BASE+'/teacher.html',{waitUntil:'networkidle'});
await T.fill('#room',ROOM); await T.fill('#code','CORAL'); await T.click('#btn-connect');
await T.waitForFunction(()=>document.querySelector('#status-msg')?.textContent?.includes('成功连接'));
await T.click('button[data-event="spawn-kraken"]');
await A.waitForSelector('#boss-hud:not([hidden])');
await A.screenshot({path:out+'/03-pirate-kraken-arrival.png',fullPage:true});
await B.screenshot({path:out+'/04-diver-kraken-arrival.png',fullPage:true});
await A.waitForTimeout(3900);
await A.screenshot({path:out+'/05-pirate-after-slam.png',fullPage:true});
const data=await A.evaluate(()=>({
  boss:document.querySelector('#boss-hud')?.innerText,
  food:document.querySelector('#food-value')?.textContent,
  ship:document.querySelector('#ship-hp-value')?.textContent||document.querySelector('#ship-hp')?.textContent,
  vignette:document.querySelector('#vignette')?.className,
  action:[...document.querySelectorAll('button.action')].map(x=>x.innerText)
}));
console.log(JSON.stringify({ROOM,errors,data},null,2));
await browser.close();

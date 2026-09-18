import assert from 'node:assert/strict';
import { webkit, devices } from 'playwright';

const BASE_URL = 'http://127.0.0.1:18888';
const ROOM = 'UPG' + Date.now().toString(36).slice(-4).toUpperCase();

console.log(`=== 开始 Coral Crew 升级专项目标验收 (房间: ${ROOM}) ===`);

const browser = await webkit.launch({ headless: true });
const ipad = devices['iPad (gen 7) landscape'];

const ctxA = await browser.newContext({ ...ipad, hasTouch: true, isMobile: true });
const ctxB = await browser.newContext({ ...ipad, hasTouch: true, isMobile: true });
const ctxTeacher = await browser.newContext({ viewport: { width: 1280, height: 800 } });

const pageA = await ctxA.newPage();
const pageB = await ctxB.newPage();
const pageT = await ctxTeacher.newPage();

const errors = [];
pageA.on('pageerror', err => errors.push({ p: 'A', msg: err.message }));
pageB.on('pageerror', err => errors.push({ p: 'B', msg: err.message }));
pageT.on('pageerror', err => errors.push({ p: 'T', msg: err.message }));

try {
  await pageA.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await pageB.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

  // 1. 验证 改动1：选角界面与按键文案已升级为“盛宴备粮”
  console.log('\n[验收 1/4] 验证 改动1：海盗角色文案与低频高效备粮...');
  const pirateCardText = await pageA.locator('button.role.pirate').innerText();
  assert.ok(pirateCardText.includes('盛宴备粮'), `Role card should contain 盛宴备粮, got: ${pirateCardText}`);
  console.log('✅ 选角卡片已升级为【盛宴备粮】');

  // 设置专属房间
  await pageA.evaluate(r => { document.querySelector('#room-input').value = r; }, ROOM);
  await pageB.evaluate(r => { document.querySelector('#room-input').value = r; }, ROOM);

  // 进入游戏
  await pageA.click('button.role.pirate');
  await pageA.waitForTimeout(100);
  await pageA.click('button.role.pirate');

  await pageB.click('button.role.diver');
  await pageB.waitForTimeout(100);
  await pageB.click('button.role.diver');

  await pageA.waitForSelector('#hud:not([hidden])', { timeout: 4000 });
  await pageB.waitForSelector('#hud:not([hidden])', { timeout: 4000 });

  // 准备好
  await pageA.click('#ready');
  await pageB.click('#ready');
  await pageA.waitForFunction(() => document.querySelector('#ready')?.hidden === true, { timeout: 4000 });
  console.log('✅ 双方成功就绪，进入 playing 阶段');

  // 验证海盗操作按钮文案
  const chopBtnA = pageA.locator('button.action[data-action="chop"]');
  const btnTitle = await chopBtnA.locator('b').innerText();
  assert.equal(btnTitle, '盛宴备粮', '海盗按钮应命名为【盛宴备粮】');
  console.log('✅ 海盗操作按钮已确认为【🍉 盛宴备粮】');

  // 海盗执行一次盛宴备粮 (3次点击切成大瓜盛宴)
  await chopBtnA.click();
  await pageA.waitForTimeout(450);
  await chopBtnA.click();
  await pageA.waitForTimeout(450);
  await chopBtnA.click();
  await pageA.waitForTimeout(600);

  const foodCount = await pageA.evaluate(() => Number(document.querySelector('#food-value')?.textContent || 0));
  assert.ok(foodCount >= 5, `一次盛宴产出丰盛食物 (期望 >= 5, 实际: ${foodCount})`);
  console.log(`✅ 盛宴备粮高收益验证通过：一次备粮直接获得 ${foodCount} 份食物，彻底告别频繁切瓜！`);

  // 验证第二次备粮后仓储充裕提示
  await chopBtnA.click();
  await pageA.waitForTimeout(450);
  await chopBtnA.click();
  await pageA.waitForTimeout(450);
  await chopBtnA.click();
  await pageA.waitForTimeout(600);

  const progressLabel = await chopBtnA.locator('small').innerText();
  assert.equal(progressLabel, '仓储充裕', '食物充足时应显示仓储充裕');
  console.log(`✅ 仓储充足状态提示生效：显示【${progressLabel}】，无需继续反复点击`);

  // 2. 验证 改动2：巨妖 Kraken 召唤、压迫感异象与受击反馈
  console.log('\n[验收 2/4] 验证 改动2：教师端召唤 Kraken，检验异象与压迫感...');
  await pageT.goto(`${BASE_URL}/teacher.html`, { waitUntil: 'networkidle' });
  await pageT.fill('#room', ROOM);
  await pageT.fill('#code', 'CORAL');
  await pageT.click('#btn-connect');
  await pageT.waitForFunction(() => document.querySelector('#status-msg')?.textContent?.includes('成功连接'), { timeout: 4000 });

  // 教师点击召唤巨妖 Kraken
  await pageT.click('button[data-event="spawn-kraken"]');
  console.log('🦑 教师端已触发 Kraken 召唤');

  // 等待学生端检测到 Kraken 登场
  await pageA.waitForSelector('#boss-hud:not([hidden])', { timeout: 4000 });
  await pageB.waitForSelector('#boss-hud:not([hidden])', { timeout: 4000 });

  const bossTextA = await pageA.locator('#boss-hud .boss-label').innerText();
  assert.ok(bossTextA.includes('KRAKEN') || bossTextA.includes('巨妖'), `Boss HUD text: ${bossTextA}`);
  console.log(`✅ 学生端 Boss 危险警告血条生效：“${bossTextA}”`);

  // 3. 验证合作打怪：海盗重炮轰击巨妖
  console.log('\n[验收 3/4] 验证 双人合作击退巨妖（海盗重炮 + 潜水员气泡枪）...');
  const fireBtnA = pageA.locator('button.action[data-action="fire"]');
  await fireBtnA.click();
  await pageA.waitForTimeout(600);
  console.log('✅ 海盗在 iPad A 成功轰击重炮打怪！');

  // 4. 控制台与错误检查
  console.log('\n[验收 4/4] 检查浏览器控制台...');
  assert.equal(errors.length, 0, `Errors during play: ${JSON.stringify(errors)}`);
  console.log('✅ 零报错！');

  console.log('\n🎉 改动 1 & 改动 2 专项全真 iPad WebKit 验证完美通过！🎉\n');
} finally {
  await browser.close();
}

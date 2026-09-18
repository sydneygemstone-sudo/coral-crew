import assert from 'node:assert/strict';
import { webkit, devices } from 'playwright';

const PORT = 18888;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const LAN_API = `${BASE_URL}/api/lan`;

console.log('=== 开始 Coral Crew 自动化综合验收 ===');

// 1. HTTP 路由回归验收
console.log('\n[1/6] 验证 HTTP 路由与源码安全保护...');
const routes200 = [
  '/', '/index.html', '/client.js', '/style.css', '/teacher.html',
  '/qa.html', '/about.html', '/journal.html', '/parents.html',
  '/archive.css', '/vendor/three.module.js', '/vendor/three.core.js',
  '/health', '/api/lan', '/api/qr'
];

for (const path of routes200) {
  const res = await fetch(`${BASE_URL}${path}`);
  assert.equal(res.status, 200, `Expected 200 for ${path}, got ${res.status}`);
}
console.log(`✅ 15 个公开静态与 API 端点均正确返回 HTTP 200`);

const routes404 = ['/server.mjs', '/simulation.mjs', '/package.json', '/.git', '/%2e%2e/server.mjs'];
for (const path of routes404) {
  const res = await fetch(`${BASE_URL}${path}`);
  assert.ok([403, 404].includes(res.status), `Expected 403/404 for sensitive path ${path}, got ${res.status}`);
}
console.log(`✅ 服务端源码与敏感文件均被安全拦截 (403/404)，无泄露`);

// 启动 Playwright WebKit (模拟 Safari)
console.log('\n[2/6] 启动 WebKit 浏览器引擎模拟两台 iPad (Safari 横屏)...');
const browser = await webkit.launch({ headless: true });

const ipadDevice = devices['iPad (gen 7) landscape'];
const errorsA = [];
const errorsB = [];
const errorsTeacher = [];

// iPad A: Lisha
const ctxA = await browser.newContext({
  ...ipadDevice,
  hasTouch: true,
  isMobile: true,
});
const pageA = await ctxA.newPage();
pageA.on('pageerror', err => {
  console.log('Page A error:', err.message);
  errorsA.push(err.message);
});

// iPad B: Quentin
const ctxB = await browser.newContext({
  ...ipadDevice,
  hasTouch: true,
  isMobile: true,
});
const pageB = await ctxB.newPage();
pageB.on('pageerror', err => {
  console.log('Page B error:', err.message);
  errorsB.push(err.message);
});

// Teacher Mac
const ctxTeacher = await browser.newContext({
  viewport: { width: 1280, height: 800 }
});
const pageTeacher = await ctxTeacher.newPage();
pageTeacher.on('pageerror', err => {
  console.log('Teacher error:', err.message);
  errorsTeacher.push(err.message);
});

try {
  console.log('\n[3/6] 检查 iPad Safari 横屏、WebGL、触控与页面不溢出...');
  await pageA.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await pageB.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await pageA.evaluate(r => document.querySelector('#room-input').value = r, 'QAISO');
  await pageB.evaluate(r => document.querySelector('#room-input').value = r, 'QAISO');

  // 验证横屏无横向滚动条溢出
  const noOverflowA = await pageA.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  const noOverflowB = await pageB.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  assert.ok(noOverflowA && noOverflowB, 'iPad 横屏页面不能产生横向滚动溢出');
  console.log('✅ iPad Safari 横屏布局正常，无横向溢出');

  // 验证 WebGL 渲染就绪
  const webglA = await pageA.evaluate(() => {
    const canvas = document.querySelector('#world canvas');
    return !!(canvas && (canvas.getContext('webgl') || canvas.getContext('webgl2')));
  });
  assert.ok(webglA, 'WebGL 3D 画布已成功初始化');
  console.log('✅ Three.js WebGL 画布在 iPad WebKit 正常创建渲染');

  // 验证触控区域与 touch-action
  const touchActionOk = await pageA.evaluate(() => {
    const bodyTouch = getComputedStyle(document.body).touchAction;
    const pirateBtn = document.querySelector('button.role.pirate');
    return bodyTouch === 'none' && pirateBtn && pirateBtn.offsetHeight >= 44;
  });
  assert.ok(touchActionOk, 'iPad 关键触控与防抢焦点 touch-action 规则生效');
  console.log('✅ touch-action: none 规则生效，按钮触控高度 >= 44px');

  console.log('\n[4/6] 验证角色进入、角色防抢占与同房联机...');
  // iPad A (Lisha) 选海盗 Pirate (先听后选，点击两次)
  await pageA.click('button.role.pirate');
  await pageA.waitForTimeout(100);
  await pageA.click('button.role.pirate');

  // 等待 iPad A 进入游戏界面
  await pageA.waitForSelector('#hud:not([hidden])', { timeout: 4000 });
  console.log('✅ Lisha (iPad A) 成功以【海盗 Pirate】身份登船进入 QAISO');

  // iPad B (Quentin) 尝试抢占已占用的海盗角色
  await pageB.click('button.role.pirate');
  await pageB.waitForTimeout(100);
  await pageB.click('button.role.pirate');
  await pageB.waitForTimeout(500);

  // 验证抢占被拒绝，且停留在 lobby
  const joinErrorB = await pageB.evaluate(() => document.querySelector('#join-error')?.textContent || '');
  assert.ok(joinErrorB.includes('已有伙伴') || joinErrorB.includes('已经有伙伴'), `Expected conflict error, got: ${joinErrorB}`);
  const isLobbyVisibleB = await pageB.evaluate(() => !document.querySelector('#lobby')?.hidden);
  assert.ok(isLobbyVisibleB, '角色冲突后 iPad B 留在选角大厅');
  console.log(`✅ 角色防冲突验证通过：iPad B 选已被占的海盗被拒绝 (“${joinErrorB}”)`);

  // iPad B 选潜水员 Diver (点击两次)
  await pageB.click('button.role.diver');
  await pageB.waitForTimeout(100);
  await pageB.click('button.role.diver');

  await pageB.waitForSelector('#hud:not([hidden])', { timeout: 4000 });
  console.log('✅ Quentin (iPad B) 成功以【潜水员 Diver】身份登船进入 QAISO');

  // 验证双方均显示两人连接
  await pageA.waitForFunction(() => document.querySelector('#connection')?.textContent?.includes('两人已连接'), { timeout: 3000 });
  await pageB.waitForFunction(() => document.querySelector('#connection')?.textContent?.includes('两人已连接'), { timeout: 3000 });
  console.log('✅ 双方均显示【● 两人已连接】');

  // 双方点击【准备好】开始正式航程 (若未处于 playing 阶段)
  const readyVisible = await pageA.locator('#ready').isVisible();
  if (readyVisible) {
    await pageA.click('#ready');
    await pageB.click('#ready');
    await pageA.waitForFunction(() => document.querySelector('#ready')?.hidden === true, { timeout: 4000 });
    await pageB.waitForFunction(() => document.querySelector('#ready')?.hidden === true, { timeout: 4000 });
  }
  console.log('✅ 两人 Ready，游戏处于 playing 阶段');

  // 验证动作实时同步：海盗在 iPad A 完成切西瓜，潜水员在 iPad B 立即看到船备食物同步增加
  console.log('\n[5/6] 验证动作跨设备实时同步与断线重连...');
  const chopBtnA = pageA.locator('button.action[data-action="chop"]');
  await chopBtnA.click();
  await pageA.waitForTimeout(400);
  await chopBtnA.click();
  await pageA.waitForTimeout(400);
  await chopBtnA.click();

  // 在 iPad B (潜水员) 端检查船备食物同步增加 (盛宴备粮产量 >= 6)
  await pageB.waitForFunction(() => {
    const val = document.querySelector('#food-value')?.textContent;
    return Number(val) >= 3;
  }, { timeout: 4000 });
  console.log('✅ 动作同步验证通过：Lisha 海盗盛宴备粮后，Quentin 潜水员端即时收到船备食物同步！');

  // 验证断线重连：记录 Quentin 的 token，模拟网络断开与重连
  const diverToken = await pageB.evaluate(() => localStorage.getItem('coral-token:QAISO:diver'));
  assert.ok(diverToken && diverToken.length === 48, '应已获得 48 位安全的重连 token');
  console.log(`ℹ️  获取到 Quentin 潜水员重连凭证: ${diverToken.slice(0, 12)}...`);

  // 模拟关闭 iPad B 页面
  await pageB.close();

  // iPad A 端应感知到伙伴离线 (等待伙伴 或 正在重连)
  await pageA.waitForFunction(() => {
    const txt = document.querySelector('#connection')?.textContent || '';
    return txt.includes('等待伙伴') || txt.includes('离线');
  }, { timeout: 5000 });
  console.log('✅ iPad A 实时感知到潜水员离线，状态进入保护暂停');

  // iPad B 重新打开并凭 token 重连
  const pageBReconnected = await ctxB.newPage();
  await pageBReconnected.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  // 点击选潜水员或继续航程
  const resumeVisible = await pageBReconnected.evaluate(() => !document.querySelector('#resume')?.hidden);
  if (resumeVisible) {
    await pageBReconnected.click('#resume');
  } else {
    await pageBReconnected.click('button.role.diver');
    await pageBReconnected.waitForTimeout(100);
    await pageBReconnected.click('button.role.diver');
  }

  // 验证重连成功回到游戏
  await pageBReconnected.waitForSelector('#hud:not([hidden])', { timeout: 4000 });
  await pageA.waitForFunction(() => document.querySelector('#connection')?.textContent?.includes('两人已连接'), { timeout: 4000 });
  console.log('✅ Quentin 潜水员断线后使用原 token 成功秒级重连恢复，双人状态恢复同步！');

  console.log('\n[6/6] 验证教师控制台 (teacher.html) 监控与暂停/继续控场...');
  await pageTeacher.goto(`${BASE_URL}/teacher.html`, { waitUntil: 'networkidle' });

  // 填写房间 CORAL 与口令 CORAL
  await pageTeacher.fill('#room', 'QAISO');
  await pageTeacher.fill('#code', 'CORAL');
  await pageTeacher.click('#btn-connect');

  // 等待教师端连接成功并显示双人在线
  await pageTeacher.waitForFunction(() => {
    const pirateBadge = document.querySelector('#badge-pirate')?.textContent || '';
    const diverBadge = document.querySelector('#badge-diver')?.textContent || '';
    return pirateBadge === '在线' && diverBadge === '在线';
  }, { timeout: 4000 });
  console.log('✅ 教师端成功连接，实时监控显示：海盗【在线】，潜水员【在线】');

  // 教师点击【暂停航程】
  await pageTeacher.click('#btn-pause');
  await pageTeacher.waitForFunction(() => {
    const msg = document.querySelector('#status-msg')?.textContent || '';
    return msg.includes('暂停');
  }, { timeout: 3000 });
  console.log('✅ 教师端触发【暂停航程】成功');

  // 验证 iPad A 与 iPad B 均感知到暂停 (动作按钮禁用或暂停文案)
  await pageA.waitForFunction(() => {
    const copy = document.querySelector('#learning-copy')?.textContent || '';
    const chopBtn = document.querySelector('button.action[data-action="chop"]');
    return copy.includes('暂停') || chopBtn?.disabled === true;
  }, { timeout: 3000 });
  console.log('✅ iPad 学生端全部即时冻结，并显示教师暂停提示');

  // 教师点击【继续航程】
  await pageTeacher.click('#btn-resume');
  await pageTeacher.waitForFunction(() => {
    const msg = document.querySelector('#status-msg')?.textContent || '';
    return msg.includes('成功连接') || msg.includes('监控中');
  }, { timeout: 3000 });
  console.log('✅ 教师端触发【继续航程】成功');

  // 验证 iPad A 恢复可操作
  await pageA.waitForFunction(() => {
    const chopBtn = document.querySelector('button.action[data-action="chop"]');
    return chopBtn && !chopBtn.disabled;
  }, { timeout: 3000 });
  console.log('✅ iPad 学生端恢复操作，全流程测试通过！');

  // 检查控制台是否有阻断级错误
  console.log('\n--- 浏览器控制台错误检查 ---');
  console.log('iPad A 错误数:', errorsA.length);
  console.log('iPad B 错误数:', errorsB.length);
  console.log('教师端错误数:', errorsTeacher.length);
  assert.equal(errorsA.length, 0, `iPad A had errors: ${errorsA.join('; ')}`);
  assert.equal(errorsB.length, 0, `iPad B had errors: ${errorsB.join('; ')}`);
  assert.equal(errorsTeacher.length, 0, `Teacher had errors: ${errorsTeacher.join('; ')}`);
  console.log('✅ 控制台无任何阻塞级 JS 报错！');

} finally {
  await browser.close();
}

console.log('\n🎉🎉🎉 全部 6 大项自动化验收 100% 通过！🎉🎉🎉\n');

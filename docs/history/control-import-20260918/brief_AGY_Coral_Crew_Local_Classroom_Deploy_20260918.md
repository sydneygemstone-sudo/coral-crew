# AGY — Coral Crew 本地课堂部署任务包（2026-09-18）

只做“本地课堂可玩部署 + 联机验收”，不要重做玩法、UI 或角色规则。

## 唯一执行仓库
- /Users/gemstone/Desktop/coral-crew
- baseline: 45efd40 feat(coral-crew): initial release of Coral Crew 3D LAN co-op game with Game Master protocol
- 不要在 /Users/gemstone/Desktop/student-works/coral-crew 执行；那份是归档/镜像副本。
- 当前主仓库已安装 node_modules，检查时 git status clean。
- Mac 当前 LAN IP 检测为 192.168.1.120，但不得硬编码，启动时动态检测。

## 已核验
- Node.js v22.22.0。
- npm test：9/9 PASS。
- server 默认 PORT=18888、HOST=0.0.0.0。
- WebSocket 客户端通过 location.host 连接 /ws，适合同一局域网。
- /health 可用。
- /vendor/three.module.js 与 /vendor/three.core.js 测试通过。
- 当前真实阻塞：服务启动后 GET / 返回 404。
- 根因：server.mjs 对非 vendor 静态资源使用 DIRECTORY/public，但仓库当前没有 public/；index.html、client.js、style.css、teacher.html 等都在根目录。
- 现有测试没有断言首页，所以会出现“9/9 PASS 但浏览器首页 404”。

## 第一优先级：修好真实入口
目标是今天课堂稳定可用，同时不要暴露服务端源码。
推荐建立真正的 public/ 静态目录，只放浏览器需要的文件；不要简单开放整个仓库根目录。
至少确保以下 URL 返回 200：
/、/index.html、/client.js、/style.css、/teacher.html、/qa.html、/about.html、/journal.html、/parents.html、/archive.css、/vendor/three.module.js、/vendor/three.core.js、/health、/api/lan、/api/qr。
如果移动静态文件进入 public/，同步修正相对引用、README 和测试；如果采用其他实现，必须使用明确白名单，不能通过 HTTP 暴露 server.mjs、simulation.mjs、package.json、package-lock.json、.git 等。
新增自动测试：GET /、GET /client.js、GET /style.css、GET /teacher.html 均断言 200。

## 一键课堂部署
在仓库中加入：
- classroom-start.command
- classroom-stop.command
- classroom-status.command
- .runtime/ 用于 PID 与日志，并加入 .gitignore

classroom-start.command：
1. 自动 cd 到脚本自身仓库。
2. 检查 node/npm；如依赖缺失，按 package-lock 使用 npm ci。
3. 先跑 npm test；失败则停止并报告。
4. 检查 18888。若已是健康 coral-crew 实例，直接复用；若被其他程序占用，只报告，不影响其他程序。
5. 使用 HOST=0.0.0.0 PORT=18888 启动。
6. 动态检测局域网 IPv4，优先 Wi-Fi/en0 的 192.168.x.x 或 10.x.x.x。
7. 启动后轮询 localhost:18888/health，再验证 localhost:18888/ 首页返回 200。
8. 清晰打印 STUDENT、TEACHER、QR、ROOM、TEACHER CODE。
9. 自动打开 Mac 教师端，不自动占学生角色。
10. 日志写入 .runtime/server.log。

classroom-stop.command：仅停止由本项目记录的 PID，并先验证它确实属于 coral-crew。
classroom-status.command：显示 PID、health、当前 LAN URL、/api/lan 和 18888 监听状态。

## 课堂连接规则
- Mac、两台 iPad 在同一个 Wi-Fi/LAN。
- iPad Safari 打开 http://<Mac-LAN-IP>:18888/，不要用 localhost。
- 房间统一 CORAL。
- Lisha 选 Pirate / 海盗。
- Quentin 选 Diver / 潜水员。
- 老师在 Mac 打开 http://localhost:18888/teacher.html 或 LAN 地址。
- 教师码 CORAL。

## iPad 兼容要求
不要引入 HTTPS、云端服务或外部 CDN 依赖。
保持 Three.js、本地 WebSocket、本地音效的离线局域网模式。
检查 iPad Safari 横屏：
- 页面不横向溢出；
- 关键按钮触控区域足够大；
- touch/pointer 不触发浏览器滚动抢焦点；
- WebGL 能创建；
- 两个角色按钮都可点；
- 断线 15 秒内可按 token 重连；
- Web Audio 如需用户手势启动，不应阻塞游戏本身。
不要为适配而重做视觉，只修阻塞课堂的问题。

## 自动化验收
完成修改后执行：
1. npm test，全部 PASS。
2. 启动 18888。
3. curl/fetch 验证 /health、/、/teacher.html、/client.js、/style.css、/api/lan、/api/qr。
4. 用两个独立浏览器 context 模拟两台 iPad：
   - 同时进入 CORAL；
   - A 加入 pirate，B 加入 diver；
   - 两边都收到 welcome + state；
   - 两人 ready 后进入 playing；
   - A 的一个有效动作能在 B 的 state 中同步看到；
   - 角色占用冲突会被拒绝；
   - 暂时断线后使用原 token 能重连。
5. 第三个 context 打开 teacher.html，教师码 CORAL，验证 pause/resume 至少一次。
6. 浏览器控制台无阻塞级 JS error。
7. 记录最终实际 LAN IP 和可访问 URL。

## 最终回执格式
只在真实做完并验证后回：
DEPLOYMENT: PASS/FAIL
REPO:
HEAD:
FILES_CHANGED:
TESTS:
SERVER:
LAN_IP:
STUDENT_URL:
TEACHER_URL:
QR_URL:
ROOM: CORAL
TEACHER_CODE: CORAL
IPAD_SIMULATION:
KNOWN_LIMITATIONS:
ROLLBACK:
并说明是否仍有任何需要老师手工做的步骤。

不要只告诉我“代码改好了”。完成标准是：Mac 本地真实启动、首页 200、WebSocket 工作、两名学生同房同步、教师端可控，并给出今天可直接输入 iPad 的实际 URL。
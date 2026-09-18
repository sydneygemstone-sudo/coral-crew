#!/bin/bash
set -e
cd "$(dirname "$0")"

mkdir -p .runtime
PID_FILE=".runtime/server.pid"
LOG_FILE=".runtime/server.log"
PORT=18888
HEALTH_URL="http://127.0.0.1:${PORT}/health"
INDEX_URL="http://127.0.0.1:${PORT}/"

echo "======================================================"
echo "⛵ 珊瑚船员 Coral Crew · 正在准备课堂启动..."
echo "======================================================"

# 1. 检查 Node.js / npm
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "❌ 错误: 未检测到 node 或 npm，请先安装 Node.js (推荐 LTS 版本)"
  exit 1
fi
echo "✅ Node.js: $(node -v), npm: $(npm -v)"

# 2. 检查依赖
if [ ! -d "node_modules" ]; then
  echo "📦 node_modules 缺失，按 package-lock 执行 npm ci..."
  npm ci || { echo "❌ npm ci 安装依赖失败"; exit 1; }
fi

# 3. 运行自动化测试
echo "🧪 正在执行自动化测试 (npm test)..."
if ! npm test; then
  echo "❌ 自动化测试未通过，停止启动！请检查测试输出。"
  exit 1
fi
echo "✅ 自动化测试全部通过！"

# 4. 检查 18888 端口
REUSE_RUNNING=false
if lsof -iTCP:${PORT} -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  HEALTH_RESP=$(curl -s -m 2 "$HEALTH_URL" 2>/dev/null || true)
  if echo "$HEALTH_RESP" | grep -q '"instance":"coral-crew"'; then
    echo "ℹ️  端口 ${PORT} 已有运行中的 coral-crew 实例，直接复用。"
    REUSE_RUNNING=true
  else
    echo "❌ 端口 ${PORT} 已被其他程序占用，且并非健康 coral-crew 实例！"
    lsof -iTCP:${PORT} -sTCP:LISTEN -n -P
    echo "请关闭占用进程后再启动。"
    exit 1
  fi
fi

# 5. 启动服务 (若未在运行)
if [ "$REUSE_RUNNING" = false ]; then
  echo "🚀 正在启动 Coral Crew (HOST=0.0.0.0 PORT=${PORT})..."
  (
    set -m
    HOST=0.0.0.0 PORT=${PORT} nohup node server.mjs </dev/null >> "$LOG_FILE" 2>&1 &
    echo "$!" > "$PID_FILE"
  )
  SERVER_PID=$(cat "$PID_FILE")
  echo "服务后台启动中 (PID: $SERVER_PID, 日志: $LOG_FILE)"
fi

# 6. 轮询健康检查与首页 200
echo "⏳ 验证服务响应与首页返回..."
READY=false
for i in $(seq 1 30); do
  if curl -s -m 1 "$HEALTH_URL" 2>/dev/null | grep -q '"ok":true'; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 2 "$INDEX_URL" 2>/dev/null || true)
    if [ "$HTTP_CODE" = "200" ]; then
      READY=true
      break
    fi
  fi
  sleep 0.4
done

if [ "$READY" != true ]; then
  echo "❌ 服务在 12 秒内未就绪或首页未返回 200！"
  if [ -f "$LOG_FILE" ]; then
    echo "--- 最新日志 ($LOG_FILE) ---"
    tail -n 25 "$LOG_FILE"
  fi
  exit 1
fi

# 7. 获取动态局域网 IP 与 URL
LAN_DATA=$(curl -s "http://127.0.0.1:${PORT}/api/lan" 2>/dev/null || echo "{}")
LAN_IP=$(node -e "try { const d = JSON.parse(process.argv[1]); console.log(d.lanIp || '127.0.0.1'); } catch { console.log('127.0.0.1'); }" "$LAN_DATA")
STUDENT_URL="http://${LAN_IP}:${PORT}/"
TEACHER_URL="http://${LAN_IP}:${PORT}/teacher.html"
QR_URL="http://${LAN_IP}:${PORT}/api/qr"
ROOM="CORAL"
TEACHER_CODE="CORAL"

echo ""
echo "======================================================"
echo "🎉 课堂服务已成功部署并运行！"
echo "======================================================"
echo "📡 实际 LAN IP:    ${LAN_IP}"
echo "📱 STUDENT_URL:    ${STUDENT_URL}"
echo "🎓 TEACHER_URL:    ${TEACHER_URL}"
echo "📷 QR_URL:         ${QR_URL}"
echo "🏷️  ROOM:            ${ROOM}"
echo "🔑 TEACHER_CODE:   ${TEACHER_CODE}"
echo "======================================================"
echo "👨‍🏫 课堂操作说明:"
echo "   1. 确保两台 iPad 与 Mac 连入同一个 Wi-Fi 网络"
echo "   2. iPad Safari 打开: ${STUDENT_URL}"
echo "   3. 房间输入: ${ROOM}"
echo "   4. Lisha 选【海盗 Pirate】，Quentin 选【潜水员 Diver】"
echo "   5. 两人均点【准备】后正式开航"
echo "======================================================"
echo ""

# 8. 自动打开 Mac 教师端 (不自动占学生角色)
if [ -n "$DISPLAY" ] || [ "$(uname)" = "Darwin" ]; then
  echo "🖥️  正在打开 Mac 教师端控制台..."
  open "http://localhost:${PORT}/teacher.html" 2>/dev/null || true
fi

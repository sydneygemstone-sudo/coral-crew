#!/bin/bash
cd "$(dirname "$0")"

PID_FILE=".runtime/server.pid"
LOG_FILE=".runtime/server.log"
PORT=18888
HEALTH_URL="http://127.0.0.1:${PORT}/health"
LAN_URL_API="http://127.0.0.1:${PORT}/api/lan"

echo "======================================================"
echo "⛵ 珊瑚船员 Coral Crew · 课堂服务状态"
echo "======================================================"

# 1. 检查 PID 文件
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE" | tr -d '[:space:]')
  echo "PID 文件记录: $PID"
  if ps -p "$PID" >/dev/null 2>&1; then
    CMD=$(ps -p "$PID" -o command= 2>/dev/null)
    echo "进程状态: 运行中 (CMD: $CMD)"
  else
    echo "进程状态: 进程已退出 (PID 无效)"
  fi
else
  echo "PID 文件记录: (无 PID 记录)"
fi

# 2. 检查 18888 监听
echo ""
echo "--- 端口 18888 监听状态 ---"
if lsof -iTCP:${PORT} -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  lsof -iTCP:${PORT} -sTCP:LISTEN -n -P
else
  echo "端口 ${PORT} 当前未处于监听状态"
fi

# 3. 检查 Health
echo ""
echo "--- 健康检查接口 (/health) ---"
HEALTH_DATA=$(curl -s -m 2 "$HEALTH_URL" 2>/dev/null || true)
if [ -n "$HEALTH_DATA" ]; then
  echo "$HEALTH_DATA"
else
  echo "无法连接至 $HEALTH_URL"
fi

# 4. 检查 LAN
echo ""
echo "--- 局域网信息 (/api/lan) ---"
LAN_DATA=$(curl -s -m 2 "$LAN_URL_API" 2>/dev/null || true)
if [ -n "$LAN_DATA" ]; then
  echo "$LAN_DATA"
  LAN_IP=$(node -e "try { console.log(JSON.parse(process.argv[1]).lanIp || '未知'); } catch { console.log('未知'); }" "$LAN_DATA")
  echo ""
  echo "📡 实际 LAN IP:    ${LAN_IP}"
  echo "📱 STUDENT_URL:    http://${LAN_IP}:${PORT}/"
  echo "🎓 TEACHER_URL:    http://${LAN_IP}:${PORT}/teacher.html"
  echo "📷 QR_URL:         http://${LAN_IP}:${PORT}/api/qr"
  echo "🏷️  ROOM:            CORAL"
  echo "🔑 TEACHER_CODE:   CORAL"
else
  echo "无法获取 /api/lan"
fi

# 5. 最新日志
if [ -f "$LOG_FILE" ]; then
  echo ""
  echo "--- 最新日志 (末尾 5 行) ---"
  tail -n 5 "$LOG_FILE"
fi

echo "======================================================"

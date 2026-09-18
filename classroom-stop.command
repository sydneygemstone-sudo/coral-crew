#!/bin/bash
set -e
cd "$(dirname "$0")"

PID_FILE=".runtime/server.pid"
PORT=18888

echo "======================================================"
echo "⛵ 珊瑚船员 Coral Crew · 课堂服务停止脚本"
echo "======================================================"

STOPPED=false

# 1. 检查 PID 文件
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE" | tr -d '[:space:]')
  if [ -n "$PID" ]; then
    if ps -p "$PID" >/dev/null 2>&1; then
      CMD_LINE=$(ps -p "$PID" -o command= 2>/dev/null || true)
      if echo "$CMD_LINE" | grep -q 'server.mjs'; then
        echo "🛑 正在停止 Coral Crew 进程 (PID: $PID)..."
        kill "$PID" || true
        for i in $(seq 1 10); do
          if ! ps -p "$PID" >/dev/null 2>&1; then
            break
          fi
          sleep 0.3
        done
        if ps -p "$PID" >/dev/null 2>&1; then
          echo "强制终止 PID: $PID"
          kill -9 "$PID" || true
        fi
        STOPPED=true
        echo "✅ 进程 (PID: $PID) 已成功终止。"
      else
        echo "⚠️  PID $PID 命令为 '$CMD_LINE'，不属于 coral-crew/server.mjs，安全起见不予终止。"
      fi
    else
      echo "ℹ️  记录的 PID $PID 已不在运行。"
    fi
  fi
  rm -f "$PID_FILE"
fi

# 2. 如果 PID 文件没有停止，但端口 18888 上运行着 coral-crew，进行安全确认与终止
if lsof -iTCP:${PORT} -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  HEALTH_RESP=$(curl -s -m 1 "http://127.0.0.1:${PORT}/health" 2>/dev/null || true)
  if echo "$HEALTH_RESP" | grep -q '"instance":"coral-crew"'; then
    PORT_PID=$(lsof -iTCP:${PORT} -sTCP:LISTEN -t -n -P 2>/dev/null || true)
    if [ -n "$PORT_PID" ]; then
      CMD_LINE=$(ps -p "$PORT_PID" -o command= 2>/dev/null || true)
      if echo "$CMD_LINE" | grep -q 'server.mjs'; then
        echo "🛑 停止端口 ${PORT} 上的 Coral Crew 实例 (PID: $PORT_PID)..."
        kill "$PORT_PID" || true
        sleep 0.5
        STOPPED=true
        echo "✅ 端口 ${PORT} 实例已终止。"
      fi
    fi
  fi
fi

if [ "$STOPPED" = true ]; then
  echo "🎉 Coral Crew 课堂服务已安全停止。"
else
  echo "ℹ️  未检测到运行中的 Coral Crew 服务。"
fi
echo "======================================================"

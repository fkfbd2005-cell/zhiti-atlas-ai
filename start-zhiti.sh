#!/bin/sh
# 知体 · ATLAS AI 一键启动（macOS / Linux）
# 用法：双击（macOS 需先在「终端」里 chmod +x），或在终端运行 ./start-zhiti.sh
set -e
cd "$(dirname "$0")"

printf '\n  知体 . ATLAS AI\n  正在启动，请稍候...\n\n'

if ! command -v node >/dev/null 2>&1; then
  printf '  [X] 未找到 Node.js\n\n'
  printf '  请先安装 Node.js 22.13 或更高版本：\n'
  printf '    https://nodejs.org\n\n'
  exit 1
fi

exec node "scripts/launch.mjs" "$@"

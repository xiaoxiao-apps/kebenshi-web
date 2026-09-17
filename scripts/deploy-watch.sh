#!/bin/zsh
# 部署监控探针：静默原则——无事零输出 exit 0；事件只吐哨兵 token
# DEPLOY_LIVE = 线上 Pages 已含四轮标记（推送已到达）
# DEPLOY_WATCH_ERR = 连续3次网络失败（阈值穿越才报）
url="https://xiaoxiao-apps.github.io/kebenshi-web/content/physics_g8_v1_c1_s4/quiz.html"
body=$(curl -m 20 -sS "$url" 2>/dev/null)
code=$?
if [ $code -ne 0 ]; then
  n=$(( $(cat /tmp/deploy-watch-fails 2>/dev/null || echo 0) + 1 ))
  echo $n > /tmp/deploy-watch-fails
  if [ $n -eq 3 ]; then echo DEPLOY_WATCH_ERR; fi
  exit 0
fi
echo 0 > /tmp/deploy-watch-fails
if echo "$body" | grep -q "重置本题"; then
  echo DEPLOY_LIVE
fi
exit 0

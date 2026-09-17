#!/bin/zsh
# 部署监控轮询：每5分钟探一次线上页；事件发生时输出一行哨兵并退出（触发主会话唤醒）
# 最长存活24小时，到期输出 EXPIRED 退出
WATCH=/Users/personal/projects/keben_web/scripts/deploy-watch.sh
END=$(( $(date +%s) + 86400 ))
while [ "$(date +%s)" -lt "$END" ]; do
  out=$("$WATCH" 2>/dev/null)
  case "$out" in
    *DEPLOY_LIVE*) echo "DEPLOY_LIVE $(date '+%F %T')"; exit 0 ;;
    *DEPLOY_WATCH_ERR*) echo "DEPLOY_WATCH_ERR $(date '+%F %T')"; exit 0 ;;
  esac
  sleep 300
done
echo "DEPLOY_WATCH_EXPIRED $(date '+%F %T')"
exit 0

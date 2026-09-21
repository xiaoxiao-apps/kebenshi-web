# c2s5 exp-room 修复报告 R3

1. 响铃中切材料音量实时联动：applyMat() 条件由 `if(ringing&&gainNode)` 修为 `if(ringing&&masterGain)`（第87行）。
   父会话 runtime 实测（__roomDebug 钩子读数）：响铃 gain=1 → 切海绵 0.25 → 切纸板 0.7。
2. 读数自动刷新：新增 refreshDb()（第118行）统一刷新 dbVal/diffVal/drawProbeScreen；
   startRing 内 `dbTimer=setInterval(refreshDb,2000)`（第126行），stopRing/reset 清 timer（第130/146行）；
   applyMat 内 `if(baseDb!==null){refreshDb();}`。
   实测：响铃中未点测量，2.4s 内 dbVal 由 -- 自动变 69.3。
3. 末尾加调试钩子 `window.__roomDebug`（第167行，暴露 gain/ringing）。

自查结果：
- node --check exp-room.js：通过
- exp-room.html 首行 <!DOCTYPE html>、末行 </html>，各计数 1
- wc -l exp-room.js = 168

复验：
- 默认未响铃（ringing=false）
- 停止→再开始仍响铃（ringing=true）

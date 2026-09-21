# c2s5 exp-room 真闹钟音频替换报告（2026-09-21）

## 音频截取
- 源：~/Desktop/音频素材/机械闹钟.mp3（11.42s，44.1kHz 立体声，只读未动）
- 分析：afconvert→WAV，python3 wave+audioop 按 0.25s 窗算 RMS
- 选取窗口：**2.75s ~ 7.50s（4.75s）**
- 依据：0~10s 全程持续响铃（RMS 5200~7600，>52% 峰值）；两端落在能量低谷
  （2.75s 窗 RMS=5202/52.2%，7.25s 窗 RMS=5226/52.4%，均为局部谷点），
  避开 0s 起始冲击与 10s 后响铃停止的衰减尾音，循环播放接缝平滑。
- 产物：audio/alarm.m4a（AAC 128kbps，4.75s，**71,535B ≈ 70KB** < 200KB，afinfo 时长核对正确）

## 代码改动（exp-room.js，html 零改动，node --check 通过）
1. 新增真音频通路：loadAlarm() fetch('audio/alarm.m4a')→decodeAudioData 缓存（Promise 防重复加载）；
   startAlarmSrc() 建 BufferSource(loop=true)→**masterGain**→destination；stopAlarmSrc() 停源。
2. startRing：buffer 已缓存直接播；否则 loadAlarm 后播，**decode/fetch 失败回退旧 oscillator 合成**
   （beep/scheduleRing/pattern 保留为 fallback 分支 startFallbackRing）。
3. 锤摆动画：删除 sin(t*25) 连续摆动，改 setInterval 每 0.5s toggle hammerSwing（±0.45rad 敲击视觉）；
   stopRing 清理该 timer 并复位锤头。
4. __roomDebug 增加 alarmLoaded(bool)、srcPlaying(bool) getter。
5. applyMat/updateMatGain/refreshDb/按钮绑定/波纹泄漏动画：零改动，音量联动走原 masterGain 路径。

## runtime 验收（browser，?v=alarm1，全过）
- 点响铃：ringing=true, alarmLoaded=true, srcPlaying=true, gain=1 ✓
- 切海绵：gain=0.25（联动生效），ringing/srcPlaying 仍 true ✓
- 停止：ringing=false, srcPlaying=false，按钮回"开始响铃" ✓
- 再开始：ringing=true, srcPlaying=true ✓

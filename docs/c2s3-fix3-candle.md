# c2s3-fix3 扬声器与烛焰声音验收

## 改动文件
- `content/physics_g8_v1_c2_s3/exp-candle.js`

## 声音方案
- 点击「播放音乐」在用户手势内创建/恢复 AudioContext，合成 440 Hz 基频正弦 + 1.5 倍频正弦 + 2 倍频三角波，形成持续悦耳乐音。
- 点击「停止」断开 oscillator，gain 归零，立即停声。
- 音量滑块 0-100 实时控制 masterGain，30 时 gain 约为 0.075；视觉火焰振幅仍由 amp 驱动，保留不变。
- 暴露调试钩子 `window.__candleAudio`。

## 自查结果
- node --check exp-candle.js：通过
- HTML 三重自查：通过
- curl md5 与磁盘一致：14c3c92340e9eac6811ef9328c9f65b0
- 浏览器 errors=0
- 点播放后 `__candleAudio.getCtx().state === 'running'`，gain>0，oscCount=3
- 滑块 30 后 gain 降至约 0.075
- 点停止后 playing=false，oscCount=0，gain=0

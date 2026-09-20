# c2s3 修复轮2 补单报告

## 问题1：explain.html 直跳链接
磁盘现状：已落盘。`explain.html` 中 4 处实验区入口改为直跳：
- t2 → `exp-echo.html?from=explain&tab=t2`
- t3 按钮 → `exp-candle.html?from=explain&tab=t3`
- t3「想一想」→ `exp-candle.html?from=explain&tab=t3`
- t4 → `exp-huanqiu.html?from=explain&tab=t4`
- t1 按蔡总指示保持进入 `experiment.html`
验证：`grep -n "exp-" explain.html` 命中上述链接；curl 服务端与磁盘一致。

## 问题2：圜丘纵视图
磁盘现状：已落盘。`exp-huanqiu.js` 重写为纵向剖面图：人站台面、声波向栏板传播、栏板反射、0.07 s 回声返回人耳；`exp-huanqiu.html` 同步更新。

## 问题3：音乐公路声音
修改文件：`content/physics_g8_v1_c2_s3/exp-road.js`（`exp-road.html` 原有声音开关按钮，仅配合验证）。
实现：
- 发车按钮 click 内创建/恢复 `AudioContext`。
- 用 `OscillatorNode + GainNode`，频率绑定 `freqSlider` 当前值（220–880 Hz，默认 392 Hz）。
- 发车发声，暂停/声音关停止 oscillator；拖滑块时用 `setValueAtTime` 实时更新频率。
- 新增调试验证钩子 `window.__roadAudio`（不影响业务逻辑）。

## 验证结果
- `node --check exp-road.js`：OK
- HTML 三重自查：`<!DOCTYPE html>` 存在、`</html>` 结尾且仅 1 个
- curl 服务端 `exp-road.js` 含 `AudioContext`/`createOscillator`/`createGain`
- 浏览器实测（新建标签页）：errors 0 条
  - 发车后：`AudioContext.state === 'running'`，oscillator.frequency === 392 Hz
  - 拖滑块到 600 Hz 后：oscillator.frequency === 600 Hz
  - 声音开关关闭后：oscillator 断开，按钮显示 `🔇 声音关`

# c2s3-fix3-echo 验收修复报告

## 改动摘要
- exp-echo.html：删除「练习①」字样；h2 改为「模拟测深」；h3 改为「猜一猜」；在 anim-btns 增加「🔊 声音开/关」按钮。
- exp-echo.js：脉冲动画时长改为按真实往返时间比例（×28 缩放），空气@15m≈2.47s，海水@15m≈0.56s，比例≈4.41；新增 WebAudio 合成发射声/撞击声；声音开关控制 masterGain；暴露 window.__echoAudio 调试验证钩子。

## 音效方案
- 发射声：sawtooth oscillator 频率从 880Hz 指数降到 220Hz，0.32s，快衰减。
- 撞击声：square oscillator 1800Hz→110Hz + 短延迟反馈混响，0.22s，在脉冲进度≈0.5 触发。
- AudioContext 在用户点击「发射脉冲」/「声音开」时创建/resume；无外部音频文件。

## 速度差数据（15m）
- 空气 340 m/s：约 2470 ms
- 海水 1500 m/s：约 560 ms
- 比值：≈4.41（理论 4.41）

## 自查结果
1. node --check exp-echo.js：通过
2. HTML 三重自查：DOCTYPE 正确；tail -2 为 `</body>\n</html>`；`</html>`=1
3. grep -cF "练习①" exp-echo.html=0；exp-echo.js=0
4. curl md5 与磁盘 md5 一致：cfe4edc243913518ee28329edb20eda4
5. 浏览器新标签页打开目标 URL：errors=0
6. 发射脉冲后 __echoAudio.getCtx().state === 'running'：通过
7. 同距离 15m 切换介质：海水 pulseDuration≈560ms，空气≈2470ms，比值≈4.41：通过
8. 点声音开关：soundOn 变化，后续脉冲无 gain：通过

## 修改文件
- content/physics_g8_v1_c2_s3/exp-echo.html
- content/physics_g8_v1_c2_s3/exp-echo.js

## 2026-09-20 追加修复
- 根因：`firePulse` 依赖闭包 `speed`，切换介质后若 `change` 事件未触发则时长不变。
- 修复：在 `firePulse` 内调用 `updateReadout()` 强制从 DOM 刷新 `speed`/`dist` 再计算 `pulseDuration`。
- 实测：A（空气 340 m/s @ 15 m）= 2470.59 ms；B（海水 1500 m/s @ 15 m）= 560 ms；A/B ≈ 4.41 ± 0.2。
- 验证：node --check 通过；curl md5 与磁盘一致（7f6e4e4b21e6adde21514a8e5004c7b4）；浏览器新标签页无 errors。

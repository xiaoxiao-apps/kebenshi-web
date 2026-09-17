# c2s1 修复轮6-A（exp-vibrate 振动台端点+单次声+删摸喉头）

改动文件：content/physics_g8_v1_c2_s1/exp-vibrate.html、exp-vibrate.js（其余未动）

## (5) 端点钉牢 + 每周期一声
- drawBand 改为 24 段折线，静止下垂量(SAG=8px×松紧系数)与振动位移同乘驻波包络 sin(π·u)，u=0/1 处位移恒 0；钉帽 pin() 固定画在 yBase，不随振动移动。
- 音频重构：删除常驻 sawtooth oscillator 长鸣；改为每完成一个完整振动周期（floor(now·freq) 递增）调 pluckSound(level) 发一次短促拨弦声（triangle，指数包络，dur≈8/freq），音量随 curAmp/maxAmp 衰减递减；curAmp 按 exp(-t/1.2) 衰减，<0.4px 时置 0、plucked=false → 停止发声并停止动画（状态回「静止」）。
- 浏览器实测（instrumented createOscillator 计数 + canvas getImageData 采样 57 帧）：5.3s 内 oscillator 数 30 ≈ 周期数 29.7（每周期一声）；衰减停后状态回「不振动/无声」；左右端点列像素 y∈[186.5,187.5]（yBase=187.2，±0.7px 抗锯齿级），中间列摆动 ±18px。
- 文案同步：hint-bar、state-line、canvas 标签改为「每振动一个来回『铮』一声、渐弱、静止后不再发声」。

## (6) 删「边说话边摸喉头」交互
- HTML：删除 throat-box（svg+ahBtn+throatTxt）与 .throat-box/.cordShake CSS，卡片改为纯文字 .throat-note：「说话时把手轻按在喉头处，能感到声带在振动——和橡皮筋一样，声音是由振动产生的。」
- JS：删除 ahBtn/ahOn/ahOff/ahAudio 全部逻辑（约 30 行）；grep 确认无残留引用。
- 布局不塌：桌面与 390px 截图均正常（卡片、归纳 tipbox 在位）。

## 自查结果
- node --check exp-vibrate.js：通过。
- HTML 三重自查：head -3 含 DOCTYPE；tail -2 为 </body></html>；grep -c '</html>' = 1。
- curl localhost:8901 该页 html/js：命中新文案与新代码（throat-note、pluckSound、now/1.2）。
- 返回按钮 <a class="back-btn" data-back href="experiment.html"> 与 exp-back.js 引用未动。
- canvas 颜色全 hex 字面量（虚影 rgba 为透明度叠色，原有写法保留）。
- 390px（iPhone 12 模拟）：scrollWidth=390 <= clientWidth=390，无溢出。
- console errors：0（桌面+移动各查一次）。
- 截图：docs/qa_screenshots/c2s1_fix6_vibrate.png（桌面振动中）、c2s1_fix6_vibrate_m.png（390px 振动中）。
- 未 git commit、未 rm、未动其他文件。

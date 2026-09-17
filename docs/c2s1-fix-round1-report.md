# c2s1 验收修复轮 1/3 — Tab①「声音的产生」交互实验

改动文件：`content/physics_g8_v1_c2_s1/explain.html`（仅 Tab① 区域 + head 样式 + 脚本引用）、新增 `explain-tab1.js`。其余 Tab/脚本未动，未用 git。

## 逐要求落实
1. **盒子+橡皮筋真实感**：静态 SVG 换成 canvas（#t1BandCv）。盒子画顶面(#6cc25a)/正面(#4a8c3f+明暗渐变)/右侧暗面(#3a7231)+棱线+地面投影；橡皮筋有厚度、白色高光细线、两端固定钉。
2. **拉动 slider**：#t1Tension 0–100，厚度 6px→2px 线性（bandThick），颜色 #c4a35a→#6b4a08 线性插值转 hex（bandColor）；#t1Hz 实时读数 130+2.62×t（0%→130Hz、100%→392Hz）。
3. **拨动发声**：#t1Pluck → WebAudio OscillatorNode(triangle)→BiquadFilter(lowpass 2400Hz)→Gain→destination；gain 0.0001→0.32 linearRamp(+0.01s instant attack)→exponentialRamp 0.0001(+1.2s decay)；AudioContext 懒创建并在点击手势内 resume()。
4. **振动动画**：驻波包络 sin(πu)·sin(ωt)（两端固定中间幅最大），振幅 26px·e^(-t/0.5) 约1.5s 停；视觉频率=真实Hz/25（放慢但快慢随音高正确）；附同色虚影+加粗模糊层。
5. **颜色纪律**：canvas 全 hex/rgba 字面量，无 var()。
6. **响应式**：canvas 按 clientWidth+dpr 自适应，≤768px 高 200px；390px 实测 scrollWidth=clientWidth=390 无溢出。

## 验证
- node --check：explain-tab1.js 与 explain.html 内联脚本提取均过。
- HTML 三重自查：head -3 首行 DOCTYPE；tail -2 末行 </html>；grep -c "</html>" = 1。
- curl localhost:8901/.../explain.html | grep -c explain-tab1.js = 1；explain-tab1.js HTTP 200。
- 浏览器实测：slider 20%→182 Hz、90%→366 Hz（读数不同）；两次拨动后 AudioContext.state==='running'；console errors=0；拨动后 canvas 像素采样前后不同（动画确在跑）。
- 截图：docs/qa_screenshots/c2s1_fix1_tab1.png（桌面1280px）、c2s1_fix1_tab1_m.png（390px）。

# c2s1 验收修复轮 2/3 — Tab② 真空罩交互实验（接手者完成）

## 改动范围
- explain.html：仅 Tab② 区域（旧静态 SVG 删除→canvas#t2VacCv + 控件区 + 新 figcap）+ head 内新增 .t2-ctrls 样式 + 尾部加 `<script src="explain-tab2.js">`；Tab①③④ 与内联切 Tab 脚本一字未动。
- 新增 explain-tab2.js（355 行）：canvas 渲染 + 状态机 + WebAudio 懒创建。

## 蔡总验收逐条
1. 播放：闹钟机身 |sin| 弹跳 + 铃锤 ±0.5rad 摆动 + 双方波(1760/2217Hz)+7Hz LFO「铃铃铃」循环铃声。✅
2. 按住抽气泵（pointerdown/mousedown/touchstart 统一）：罩侧壁渲染带管壁厚度管子，蓝粒子按洗牌 rank 逐个沿贝塞尔管外逃，air -20/s，gain=f(air)^1.3 渐小；抽到 0 全粒子出管、gain=0 完全无声。✅
3. 松开：air +25/s 回升，粒子沿管回流进罩（t≥1 恢复罩内漂移），铃声渐大至正常。✅
4. 真实感：玻璃罩左高光条+顶部弧形反光+蓝/白双描边+密封 rim、木质底座、闹钟双铃+铃锤+支脚、蓝粒子随机漂移、管子双层描边显管壁。✅

## 自查结果（2026-09-17 16:15）
- node --check：explain-tab2.js ✅；explain.html 内联脚本提取 ✅
- head -3 见 DOCTYPE ✅；tail -2 见 </html> ✅；grep -c "</html>" = 1 ✅
- curl localhost:8901 …/explain.html | grep -c explain-tab2.js = 1 ✅（服务未重启）
- 浏览器实测：播放→AudioContext running、gain=0.100；按住 3s→air=40、读数下降、canvas 像素变化（粒子动画在跑）、gain=0.031；抽到 0→gain=0；松开 3s→air=75、gain=0.067，回满→gain=0.100；console 0 error。
- 桌面 1387px 与 390px 均无横向溢出；截图 docs/qa_screenshots/c2s1_fix2_tab2.png / c2s1_fix2_tab2_m.png ✅

## 备注
- 截图工具 vision 回传失败但文件已落盘（从 outbound 副本 cp 到目标路径）。
- 未动 git、未动其他文件。

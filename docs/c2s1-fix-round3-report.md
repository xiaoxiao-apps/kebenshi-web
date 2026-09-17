# c2s1 验收修复轮 3/3 — Tab③ 声波与水波（子代理静默死两回，助理亲自完成）

## 改动范围
- explain.html：仅 Tab③ 区域（旧静态 SVG → canvas#t3WaveCv + 控件区 + 新 figcap）+ head 新增 .t3-ctrls 样式 + 尾部挂 explain-tab3.js；Tab①②④ 与切 Tab 内联脚本一字未动。
- 新增 explain-tab3.js（290 行）：双模式 canvas + WebAudio 懒创建（手势内 resume）。

## 蔡总验收逐条
1. 声波模式：真实感鼓（木纹鼓身横向渐变+木纹线、皮质鼓面径向高光、10 铆钉、斜腿支架+横档、地面投影）；点「敲击」鼓面 exp 衰减正弦纵抖+鼓身微颤，WebAudio 鼓声（150→55Hz 正弦咚 + lowpass 噪声瞬态）；波前=鼓面右缘同心弧右扩（主弧+内伴弧=疏密相间），错峰 260ms 连发→越远越稀疏、半径越大、alpha 随龄衰减→越远越淡。✅
2. 水波模式：透视立体水面（径向蓝绿渐变+深水描边+两静态高光斑）；点「击打水面」或直接点水面任意处 → 4 圈同心椭圆环外扩，lineWidth 与 alpha 随半径衰减直到消失；伴 bandpass 噪声水声。✅
3. 模式切换清空 fronts/ripples/drumHit 重绘无残留；敲击按钮仅声波模式显示、击打水面按钮仅水波模式显示、模式按钮常显。✅

## 自查结果（2026-09-17 17:05）
- node --check：explain-tab1/2/3.js 全过；explain.html 内联脚本提取过
- head -3 见 DOCTYPE ✅；tail -2 见 </html> ✅；grep -c "</html>" = 1 ✅
- curl localhost:8901 …/explain.html | grep -cE 'explain-tab[123].js' = 3 ✅（服务未重启）
- 浏览器实测：声波敲击→鼓右区域非背景像素 0→232→978（波前在扩）；二次敲击 createOscillator +2（鼓声真实发声）；水波击打→帧差 405→1191（涟漪在扩）；模式切换按钮显隐正确；console 0 error（仅 QA 采样触发的 willReadFrequently warning）
- 390px 无横向溢出（scrollW=390=clientW）；截图 c2s1_fix3_tab3_wave.png / c2s1_fix3_tab3_water.png / c2s1_fix3_tab3_m.png 已落盘
- 实测中修 1 bug：setMode 误隐藏模式切换按钮导致切不回去 → 改为只切换动作按钮显隐

## 备注
- 本轮子代理两次静默死亡（零代码落盘），由助理亲自接手完成；截图工具 vision 回传失败但文件已存，从 outbound 副本 cp 到目标路径。
- 未动 git、未动其他文件。

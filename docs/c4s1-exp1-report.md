# c4s1 实验①「介质中的直线传播」开发报告（c4s1-exp1b）

日期：2026-09-30 · 开发员：子代理 c4s1-exp1b · 目录：content/physics_g8_v1_c4_s1/

## 文件清单 + 行数

| 文件 | 行数 | 说明 |
|------|------|------|
| exp-medium.html | 92 | 实验页：顶部栏(返回/标题/⛶全屏)+canvas#scene+hint条+三分区panel |
| exp-medium-audio.js | 58 | WebAudio 合成：playClick 800Hz方波0.05s / playTick 1200Hz 0.02s / playPulse 660Hz正弦0.15s渐弱；soundOn默认true；#btn-mute切🔊/🔇；首次pointerdown resume |
| exp-medium-core.js | 142 | canvas 高清适配+resize；2.5D激光笔/水槽/玻璃砖；绿色直光路；拖拽/切换/播放/暂停/重置；rAF幂等重绘 |

并行单 c4s1-exp1a 负责（本单未读其内容，仅 wc -l）：index.html = 48 行；thumb1.svg = 19 行。

node --check：exp-medium-audio.js ✅ 通过；exp-medium-core.js ✅ 通过。

## 交互清单

1. 拖激光笔：pointerdown 命中笔口30px内或笔身→pointermove 改 angle（clamp 水平±35°），角度整数变化时 playTick
2. 介质切换 radio（空气薄雾/水槽加牛奶/玻璃砖，默认空气）：change→只重绘器材与底纹 + playClick
3. checkbox#cb-ray 光线符号（默认勾）：勾=带箭头直线符号；取消=淡色光晕无箭头
4. #btn-play：绿色光点 P0→P1 匀速 1.4s 一次性，跑完停 + playPulse
5. #btn-pause：冻结/恢复 rAF（按钮文字 暂停/继续）
6. #btn-reset：angle 回水平 0，光点动画复位 + playClick
7. #btn-mute：🔊/🔇 切换（audio.js 内）
8. ⛶ 全屏：requestFullscreen；← 返回：href="./index.html"

## 物理断言自查（三条）

1. **直光路永不弯折**：core.js L23 `rayEnd()` 单直线求交（y1=p0.y+(x1-p0.x)*tan(angle)，出界截边仍是直线段）；L69 `drawRay()` 一次 moveTo→lineTo 绘制 P0→P1，全代码无曲线/折射/分段弯折分支。同种均匀介质内光沿直线传播 ✅
2. **「光线」=带箭头直线符号（模型符号）**：core.js L65 `arrow()` 箭头函数；L71 showRay 勾选时画 3px 绿直线+中点箭头+端点箭头表方向；取消勾选只剩淡色光晕不带箭头——符号可隐藏而光现象仍在，体现「光线是模型符号」 ✅
3. **三介质只改视觉表现，不改直线性质**：core.js L31 `drawMedium()` 仅绘制底纹/器材（空气=淡灰薄雾点纹 sin(i*127.1) 确定性伪随机；水槽=浅蓝半透玻璃缸+水面线+牛奶白浊渐变；玻璃砖=浅青渐变+高光线+斜透视厚度）；光路计算 rayEnd/drawRay 不含 medium 变量，切换介质光路直线性完全不变 ✅

术语逐字：光在同种均匀介质中沿直线传播（hint条+断言）/光线（cb-ray标签+符号逻辑）/介质（radio组+drawMedium）。深色主题变量、16px圆角按规格落实。

# c4s1 实验② 光影成像实验室 — 开发报告（补件轮 r2）

日期：2026-09-30 ｜ 目录：content/physics_g8_v1_c4_s1/ ｜ 本轮只交付 exp-shadow-core.js + 本报告

## 文件清单（实测 wc -l）
- exp-shadow.html — 73 行（既有，未改动）
- exp-shadow-audio.js — 44 行（既有，未改动；已自带 #btn-mute 绑定，core 未重复绑定）
- thumb2.svg — 21 行（既有，未改动）
- **exp-shadow-core.js — 161 行（本轮新写，5 段追加，node --check 通过）**
- index.html / thumb1.svg / exp-medium.* — 由并行单 c4s1-exp1a/1b 负责，本轮未触碰

## 三场景控件与交互
| 场景 | 控件 | 交互 |
|---|---|---|
| 小孔成像 pin | #u-slider(80-240)+#u-val、#v-slider(60-200)+#v-val | 滑杆双向同步；拖蜡烛改 u、拖屏改 v（30px 命中，回写滑杆） |
| 手影 hand | #hand-slider(-60~60)+#hand-val | 手垂直移动；拖手（30px 命中）同步滑杆 |
| 激光准直 align | #hole-slider(-30~30)+#hole-val、#btn-align | 中孔偏移挡光；一键对齐 0.4s easeInOut 动画滑回 0，到位 playClick |
| 公共 | #cb-rays、#btn-pause、#btn-reset、#btn-mute(audio 管)、#btn-full、radio×3 | 切换场景组显隐+hint+playClick；暂停冻结 rAF；重置全状态复位 |

光线：绿 #4ade80（激光束）、金 #ffd166（成像/手影光线，带箭头）、红 #ff5252（阻挡点）。
dpr 高清适配+resize；rAF 幂等重绘；无 Math.random 参与绘制（薄雾/纹理用 sin 确定性伪随机，L12）。

## 五条物理断言自查（core.js 行号）
1. **小孔成像倒立且 Hi=Ho·v/u** ✅ L35：`s=v/u, Hi=60*s`（Ho=60）；L44：`flame(sc,AX+dy[i],FS*s,true)` flip=true 倒立绘制；L23 `cx.scale(s,flip?-s:s)` 实现上下翻转。相似三角形：L45-46 光线 物顶→孔→像底 / 物底→孔→像顶，在孔交叉带箭头。
2. **模糊随 v 连续增大（有限孔径）** ✅ L35：`bl=(v-60)/200*6` 随 v 连续；L43-44：3 层半透明重绘（alpha 0.25/0.5/0.25，偏移 -bl/0/+bl），v 越大像越大（FS*s）越模糊越暗。
3. **手影倒向且放大率=灯墙距÷灯手距** ✅ L49：`f=(860-lx)/(handX-lx)`（灯墙距÷灯手距）；L50：`sy(py)=AX+(AX-py)*f` 绕灯高镜像——hand>0 手上移则 sy 变小方向翻转=影子向下（倒向）；手靠近灯 handX↓→f↑ 影子变大。L66-67 影子用 sy 绘制，L68-71 光线灯→指尖→墙与影子边界吻合。
4. **三孔共线透光；中孔错位光在第2板被挡、屏无亮斑** ✅ L73：`blocked=Math.abs(hole)>1e-6`；L78：板2孔 y=AX+hole；L83-89 未挡时绿束 lx→858 直达+屏上发光渐变亮斑；L91-92 挡住时绿束止于 xs[1]-7（第2板前缘），L93-97 红点+光晕，第2板后无光、屏无亮斑。
5. **场景切换仅显隐控件组、光路逻辑独立** ✅ L109-112：setMode 仅 classList.toggle('hidden') 三组 + 更新 #hint；L108：draw() 按 mode 三分支调 drawPin/drawHand/drawAlign，三函数各自独立布局与光路，无共享可变状态（仅通用 mode/开关）。

## 备注
- node --check exp-shadow-core.js → 通过（SYNTAX-OK）。
- 未改动任何既有文件：git status 显示 content/physics_g8_v1_c4_s1/ 为并行单整体新增目录，本轮仅新增 core.js 与本报告；html/audio/thumb2 行数与落盘时一致。
- 音效全部 `if(window.playXxx)` 防御调用；拖拽 playTick 节流 100ms（L157）；#btn-mute 由 audio.js 绑定，core 未重复绑定。

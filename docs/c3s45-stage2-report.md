# c3s45 Stage2 报告 — 《升华凝华观察站》模式②粒子实验室

日期：2026-09-29 ｜ 目录：content/physics_g8_v1_c3_s4/

## 文件变更
| 文件 | 变更 | 行数 |
|------|------|------|
| exp-subl-lab.js | 新增（IIFE，THREE.InstancedMesh 200粒引擎） | 422 |
| exp-subl.js | switchMode 接 lab enter/exit；updateUI 驱动 lab.update | 189 |
| exp-subl-audio.js | 追加 playLabSublime（带通上滑呼啸）/playLabDeposit（高频叮铃簇） | 113 |
| exp-subl.html | 挂载 lab.js（core 之后、主 js 之前，?v=2） | 184 |

lab 面板 DOM 由 buildDom() 动态插入 #ui-layer：场景 select（4项）+ 温度滑杆(-20~120℃) + hint 提示条 + 干冰按钮/揭示卡，默认 display:none。

## 四场景要点
- a) 樟脑片渐小：晶格微振动→逐粒升腾消失（樟脑片随 gone 计数缩小），升华吸热↑箭头
- b) 结冰湿衣变干：衣物上冰粒子直接飞散（无液态），低温回落再结晶
- c) 霜/冰花/雾凇：气态粒子遇冷玻璃平面附着结晶（temp<40℃ 才附着），蓝紫色冰晶；树枝简化体陪衬
- d) 干冰三段：按钮推进 食品盒降温(干冰粒缩小+气升)→人工降雨(云层粒子变雨滴下落)→舞台白雾(环绕漂浮)；揭示卡先猜「白雾是CO₂吗」点击揭晓「不是，是小水滴」

粒子色：固=蓝紫 0x8a7cff，气=橙红 0xff7043，冰晶=浅蓝；滑杆升温显示↑吸热箭头、降温↓放热箭头（复用 heat/cool-arrow）。

## 模式①回归
切回模式①：浇热水→vapor=1.0、phase=sublimate（紫蒸气正常）；浇冷水→phase=deposit。lab 面板隐藏、容器组恢复可见。✅ 未破坏。

## 自查4项结果
1. node --check：lab.js / exp-subl.js / audio.js / core.js 全过 ✅
2. curl localhost:8931 exp-subl.html=200、exp-subl-lab.js=200 ✅
3. browser：errors=0；pill② 进入后滑杆+4场景按钮存在（snapshot确认）；滑杆110℃→200/200变气态、-20℃→200/200回落结晶；干冰三段 stage1/2/3 各200粒子态切换+揭示卡显示 ✅；模式①回归绿 ✅；截图 /tmp/c3s45-stage2.png ✅
4. grep 外链：无 CDN 引用（仅 localhost/w3.org）✅

## 修复记录
- 中途 heredoc 追加因链式 node --check 失败被跳过一块（buildScene等），用 edit 锚点补回
- applyLabParticles 加 mesh 空守卫；updateUI 钩子改为 SublimationLab.state.active

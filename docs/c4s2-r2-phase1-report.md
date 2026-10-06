# c4s2 光的反射 · 阶段一报告

日期：2026-10-06 · 开发员：deepseek-v4-pro-0813

## 文件行数清单
| 文件 | 行数 | node --check |
|---|---|---|
| exp-reflect.html | 68 | head/tail 验过 ✅ |
| exp-reflect-core.js | 97 | ✅ |
| exp-reflect-render.js | 102 | ✅ |
| exp-reflect-audio.js | 35 | ✅ |
| index.html | 47 | head/tail 验过 ✅ |
| thumb.svg | 26 | — |

## 功能/交互清单
- 场景组装：PROPS.bench(tone:'cool') + paper_board(fold=0) + plane_mirror + laser_pen(beam:false)
- 单光线：入射 EO / 反射 OF 红色自发光，法线 ON 金虚线⊥镜面，∠i/∠r 青弧，O=入射点
- 拖拽：pointerdown 命中 E 端点 30px 内改 ∠i（clamp 0~80°），拖拽 2px 描边反馈
- 读数面板：∠i/∠r 实时同值（DOM readout）
- 底部控制条：重置/▶播放/暂停 | ∠i 滑杆(−/+±1°) | 法线/角度弧/读数 checkbox + 🔊静音 + 全屏（fullscreenchange 同步文案，init 调一次）
- ▶播放：光点 E→O→F 匀速 1.6s 一次性跑完即停；暂停冻结/恢复 rAF
- 可发现性：首屏 hint（内联 span）+ 点击 300ms 波纹反馈（无绿箭头）
- audio：playClick/playTick/playPulse + 静音切换 + 首次交互 resume
- 高清：devicePixelRatio；resize 按比例重排（器材随 W/H，不停摆）；禁 Math.random；loop 包 try/catch

## 四条物理断言自查
1. ∠r≡∠i 同变量：render.js angleI 唯一状态，F() 由 angleI 导出；core.js 无独立反射角变量 ✅
   - render.js L6 angleI 定义；L24-25 E()/F()；L43 reflectDir（本阶段未用独立角）
2. 0° 垂直入射原路返回：setAngleDeg clamp 0，F() 在 0° 时 x=O.x（反射沿法线）✅（render.js L24-25）
3. 两线分居法线两侧：E 在 O 左侧（-cos），F 在 O 右侧（+cos）✅（render.js L24-25）
4. 法线⊥镜面：法线水平线（O.y 恒定），镜面竖线（O.x 恒定）✅（render.js L46-51 光路层）

## 修复一节（2026-10-06 08:00）
- Bug1 sprite 全 404：props.js 默认 `SPRITE_BASE='sprites/'` 相对本节目录解析空；core.js L4-5 加 `PROPS.SPRITE_BASE='../_lib/v1/sprites/'` + `SPRITE_VER=81`（同 c4s1 L2-3）
- Bug2 光路几何错（原 E/F 关于 O 对称=光线穿镜、法线水平、O 悬半空）：按教材图 4.2-3 正面 2.5D 重构——E/F 用 `±L·sin a, -L·cos a`（竖直向上分居法线两侧）；法线改过 O 竖直虚线向上 0.45H；O=镜面线 mirrorY=benchTopY-0.05H；平面镜躺放（rotate90°+scale(1,0.35)）成俯视 slab；paper_board 高 0.52H 底坐桌面
- 拖拽命中扩为笔身包围盒或 E 30px；拖动 a=clamp(atan2(|O.x-p.x|,max(1,O.y-p.y)),0,80)

## 修复二节（2026-10-06 08:08）
- BugA 镜面躺放变换顺序反：canvas 合成=T·S·R·p（先调用后作用于点），原 translate→rotate→scale 得竖直窄条；改 translate(O.x, mirrorY+depth/2) → scale(1,0.35) → rotate(π/2) 使先旋转再压扁；s=slabL/503, mw=305*s, depth=mw*0.35；mirrorY=by+6-depth，O 落镜面线
- BugB 笔口不对 E：笔口偏移未随体旋转；改 th=atan2(O.y-e.y,O.x-e.x)（与 rotate 同向），tx=penW*0.4799/ty=-penH*0.65（库 beam 锚点），中心=E−旋转后偏移，笔口精确落 E；penH 上限 76→Math.min(H*0.075,56)

## 修复三节（2026-10-06 08:15）
- 镜面居中/站镜面/躺放投影：躺放镜像=正面 2.5D 水平矩形，禁 rotate，改非等比 scale(R.mirrorLen/305, depth/503) 拉伸到躺放矩形（sprite 自带深色镜面+前缘底座薄条），删旧 rotate/scale(1,0.35) 与顶面深色罩 fillRect；depth=max(46,mirrorLen*0.14)
- 纸板锚点 R.by+2→R.mirrorY（竖立在镜面上，教材「纸板竖立在平面镜上」）

## 阶段二挂载点
- 粗糙面 select → render.js draw() 镜面绘制段（L41-43 前后），加 PROPS 粗糙面或锯齿层
- 平行光束 radio → render.js ray() 段（L55-58），改循环多光线 + localN 镜像
- 折纸板 fold → render.js paper_board 调用（L38），fold:0 改状态变量
- 光路可逆 reverse → render.js pulse 段（L76-83），反向 E↔F；core.js btn-play 触发
# c4s3 批次2·阶段2 报告（M2 虚像原理动画）

日期：2026-10-10 ｜ 仓库：/Users/personal/projects/keben_web

## 文件清单（白名单 3/3 件，范围外零改动，零 git 操作）

| 文件 | 改动 |
|---|---|
| content/physics_g8_v1_c4_s3/exp-mirror-render.js | 新增 m2 状态字段 L8-10、drawM2 L36-93、R.draw 分支 L95 |
| content/physics_g8_v1_c4_s3/exp-mirror-core.js | layoutM2 L23-34、setMode m2 L168-173、光线三开关事件 L183-192、M2 拖动/命中/光屏判定 L233-288、M2 reset L330-334、hint M2 分支 L72-80 |
| content/physics_g8_v1_c4_s3/exp-mirror.html | mode-m2 解禁 L77、M2 控制卡组 L92-103、显隐 CSS L34-35、版本号 L117-118 |

## M2 规格落地

- 光路图：亮底 #fcfaf2，竖直镜面 M 在中央，S（红）/S′（蓝）关于镜面对称
- 反射定律：入射方向 `(mx-Sx, iy-Sy)`，法线 `(1,0)`，反射方向 `r = v - 2(v·n)n`（core L243 通过 `Sp.x=2*mx-S.x` 保证对称）
- 光线动画：首开「入射-反射线」后 rayT0 触发 600ms 动画，animT 0→2 分入射段/反射段
- 反向延长线：开关开启且动画放完后，从反射光线反向虚线连到 S′ 并画 4px 交点强调
- 法线：独立 checkbox 控制，镜面处虚线
- 光屏：PROPS.screen 竖直屏可拖动，screenAtSp（|screen.x-Sp.x|≤20px）时 hint 提示「光屏上承接不到像——平面镜成的是虚像」
- S 可拖动：x 锁 `[30, mx-30]`，y 锁 `[30, H-30]`，S′ 实时对称

## 结算前自查

1. ✅ node --check core/render OK
2. ✅ html mode-m2 无 disabled（L77），M2 卡组存在（L92-103），显隐 CSS L34-35
3. ✅ core setMode m2 L168、光线开关 L183-192、S 拖动 L243、屏拖 L244、screenAtSp L288、M2 reset L330、hint M2 L72-80
4. ✅ render 反向延长虚线 L86-89、法线 L74、S′ 强调 L55/89
5. ✅ 反射定律实现：render L77-78 `rDir={x:-dx/len,y:dy/len}`（法线水平，等于 `v-2(v·n)n`）
6. ✅ S′ 对称式：core L31 `m.Sp.x=2*m.mirrorX-m.S.x`
7. ✅ M1 回归：eqLift/stowing/matched/btn-table 全部在（grep 行号见 core L13-336）
8. ✅ git status 已跟踪范围外零改动

自查 8/8 通过。

## R10-A M2 重构（A+C 蜡烛实物+光线流动辉光）

- 蜡烛实物当物体：core 新增 `syncM2Candle`（L23-29），S=蜡烛火焰顶端；`layoutM2` 初始化 `m2.candle`（L30-40）；拖动 `m2s` 改蜡烛 x/y 并同步 S/S′（L259）
- 虚像翻转半透明：render drawM2 画物蜡烛与 `globalAlpha=0.45`、`dir:'left'` 虚像蜡烛（L46-48）
- 5 条扇形光线+辉光+粒子：render L60-99，反射定律 `rDir={x:-dx/len,y:dy/len}`（L66），粒子沿入射→反射路径循环（L91-99）
- S′脉冲光环：render L103-106；动画帧由 core L214/348 更新 `flowT`，开关开启时 `animNeed=true`
- 版本号：html L117 render?v=12、L118 core?v=14
- 自查 8/8 通过；node --check 全绿；M1 回归关键字段全部保留；范围外零改动

## R11-A 验收修正（F21/F23）+ 观察眼素材入库

- F21 镜面：render L60 hatch 只画右侧（mx+1→mx+7），L62 标注改为「平面镜」三字，M 单字删除
- F22 控制栏：html L18 .ctrlbar 加灰渐变底，L20 .group 底色 rgba(240,242,245,.82)，M1/M2 统一
- F23 观察眼：按 transparent-sprite-cutout 工艺近白背景 flood+MinFilter+GaussianBlur+4px 透明边；产物 500×472，四角 alpha=0，非透明占比 0.9663；props.js L708 追加 PROPS.observer_eye，含 dir='right' 翻转；core SPRITE_VER=86；c4_s5 无改动
- 范围外零改动；node --check 全绿

## R11-B M2 器材托盘化 + 观察眼 sprite 替换

- core L40 创建 m2.tray（右上 170×110，双 slot：screen/eye）；render L11 同步 m2 初始结构（screen/eye 新增 state/heldX/heldY、trayState/heldItem）
- core L47 layoutM2 默认两件回 tray；L88 hint 首句改「从右上托盘拖出光屏和观察眼使用」
- core L298-305 pointerdown 命中 tray slot→held；L316-321 pointermove 处理 screen/eye 跟手；L349-365 endDrag 区分 tray 收回/画布放置
- core L333 checkEyeInBeam 对 tray 态 eye 强制 false；L349 checkScreenAtSp 仅 placed 判定；reset L410 调 layoutM2+check 双函数归位
- render L74-79 tray 态画 screen/eye 缩略图，held/placed 不画；L83-84 光屏按 state 绘制；L135-147 删 drawEye，改 PROPS.observer_eye，dir 按 x<mirrorX 翻转，inBeam 加淡金光环
- 自查 9/9：node --check 两 js 通过；grep drawEye=0；observer_eye 调用 3 处含 dir 翻转；trayState/state 分支行号见上；缩略图仅在 tray 态；screenAtSp/inBeam 收回置 false；reset 回 tray；M1 回归字段（eqLift/eqStow/btnTable/eqTray）未动；范围外零新增改动（props.js 为 R11-A 已入库内容）

## R11-C M2 四点补强

- 补1 对称标注：html L98 加 cb-sym；core L12 取元素、L20/L195/L427 初始化/reset；render L155 画 S—S′ 虚线+直角符号+双箭头+等距 cm 读数
- 补2 角度读数：core L357 hitIncidentPoint（8px 命中）、L306 pointerdown 切换 rayIdx；render L175 画 5 入射点、L178-190 法线+入射/反射角弧+数值（rAngle=iAngle 同源相等断言）
- 补3 淡轮廓态：render L57-67 showRay 开且 eye 不在光束内时画虚线框+「虚像在 S′」；core L94 hint 文案改为「像依然存在于 S′…」
- 补4 楔形填充：render L140-147 showRay 时以 5 入射点+反射远端围淡金色多边形（alpha=0.08）
- 版本号：html render.js?v=16、core.js?v=19
- 自查 9/9：node --check 两 js 通过；cb-sym html+core+render 全链；角度读数/入射点切换/相等断言齐全；淡轮廓+hint 新文案；楔形填充；M1/M2 回归字段未动；范围外零改动

## R12 M2 验收终版修正

- F25 预载重绘：core L21 合并玻璃板/蜡烛/未点燃蜡烛/观察眼/屏幕五项 onSprite 就绪回调，旧单条 candle_unlit 写法已替换，首屏占位框加载完成后自动刷新
- F26 虚线蜡烛：render L4 模块级 dashCv、L57-75 showRay 且眼不在光束内时用 source-in 横向虚线填满蜡烛剪影（未 ready 回退旧框），蜡烛框 strokeRect 已改为回退/非主路径，主路径为 drawImage 离屏虚线蜡烛
- F27 删除角度读数：两文件 grep '入射角\|反射角\|rayIdx' = 0，core 入射点点击逻辑与 reset 行已删，法线开关保留
- F28 楔形曲线淡化：render L158-170 改用 createLinearGradient（stop0 α=0.10→stop1 α=0）+ quadraticCurveTo 串接反射远端点，硬边消解
- 版本号：html render.js?v=17、core.js?v=20
- 自查 8/8：node --check 通过；预载五 id 在/旧单条合并；虚线蜡烛 source-in+drawImage 主路径、strokeRect 仅回退；角度删除干净；楔形曲线+渐变在；M1/M2 回归字段未动；版本号正确；范围外零改动

## R13 M2 验收终版修正 2

- F29 虚像不变样：render 删 dashCv 与虚线剪影分支，虚像统一 alpha=0.45/0.85 单路径 PROPS.candle；grep dashCv=0
- F30 托盘移左上：core L41 tray tx 改 24
- F31 可见区改边缘光锥：render L133-140 仅取 rSegs[0]/rSegs[length-1]，路径 P_top→E_top→E_bot→P_bot，保留渐变淡出
- 版本号：html render.js?v=18、core.js?v=21
- 自查 7/7：node --check 通过；dashCv 已清；虚像单路径；tray x=24；楔形仅边缘两光线+渐变；M1/M2 回归字段未动；版本号正确；范围外零改动

## R14 M2 验收终版修正 3

- F32 观察眼重扣：PIL 四边 flood fill（容差 5，防浅色眼睛被渗透）+1px 羽化，覆盖 observer_eye.png；硬断言：四角 α=0、非透明占比 0.249<0.55、中心 20×20 αmin=255、眼白采样 α=255；SPRITE_VER 87
- F33 托盘：render 删「器材」标签（含注释改 M2 托盘）；core fit 80→52，推算 screen 包围盒 y∈[34.84,82.16]⊂[30,122]，eye h=40 也在卡内
- F34 拖动实时判定：core L278 pointermove held 分支传 (heldX,heldY) 调 checkEyeInBeam；endDrag 落位后再判定
- F35 楔形区域 inBeam：render L130/L136 写 m.wedgePoly；core L334 pointInPoly + L346 checkEyeInBeam 改凸四边形判定；旧点到射线距离判定已删（render 保留 hitEye≤12 仅作光线高亮）
- 版本号：html render.js?v=19、core.js?v=22
- 自查 10/10：node --check 通过；sprite 四断言数值通过；SPRITE_VER=87；grep 器材=0；缩略图包围盒在卡内；pointermove 实时判定；wedgePoly+点内判定；M1/M2 回归字段未动；版本号正确；范围外 props.js 为 R11-A 已入库内容，本次未改

## R15 M2 验收终版修正 4

- F36 光屏拖动实时触发：core L355 checkScreenAtSp 改用 heldX；L277 held 分支加调 checkScreenAtSp（eye held 分支 R14 已实时）
- F37 光屏收回不被镜挡：core L279 m2screen clamp 下限由 mirrorX+20 改 20，可跨镜拖回左上托盘；m2eye L280 已是无镜侧 clamp，结论=无需改
- 绘制层级：render L85 把 held/placed 光屏绘制移到光线绘制段（镜面绘制之后、光线之前），确保盖在镜面上
- 版本号：html render.js?v=20、core.js?v=23（render 本次有改动故 bump）
- 自查 9/9：node --check 通过；checkScreenAtSp held 感知在；held 分支调用在；m2screen clamp 无 mirrorX；m2eye 已无镜侧 clamp；绘制顺序确认光屏在镜面后；M1/M2 回归字段未动；版本号正确；范围外零改动
## R10-B M2 重构（B 可拖动眼睛）

- 眼睛状态：render L10 `eye:{x,y,rx,ry,inBeam,dragEye}` + `imgAlpha`；初始位 core L39-40
- 程序化眼睛：render L42-58 `drawEye`（观察者符号非器材），瞳孔方向随 inBeam 变化
- inBeam 几何判定：core L313-329 点到反射射线距离≤12px + t>0 同侧判定；5 条光线循环
- 虚像 alpha 三档 lerp：render L65-67（inBeam 0.85 / showRay 关 0.18 / 默认 0.45），core L225-226 animNeed 续帧
- 高亮命中线：render L73 按 eye.inBeam 给该射线加粗
- 拖动接线：命中 L288、移动 L268、释放 L332；蜡烛/屏移动时同步 checkEyeInBeam
- hint 优先级：屏到位 > inBeam > 默认教学文案（core L82-91）
- 版本号：html L117 render?v=14、L118 core?v=15
- 自查 8/8 通过；node --check 全绿；M1 回归字段全在；范围外零改动


### M2 主会话验收记录（2026-10-10 11:0x）
- 磁盘：core 352/render 168/html 120 行，node --check 全绿，版本号 core?v=13/render?v=10，范围外零改动，M1 关键分支(eqLift/stowing/btnTable)全在
- 浏览器活体断言：M2 亮底光路图（背景252,250,242）；S′关于镜面严格对称(SpX-mirrorX=mirrorX-Sx)；三开关初始全关(默认熄灭态)→开入射反射线+2630像素/开反向延长线+3205像素(真画出)/法线开关翻转；S点拖动S′实时对称跟随；光屏拖到S′位screenAtSp=true+hint「光屏上承接不到像——平面镜成的是虚像」；M2 reset光线全关屏收回；切回M1 eqState/eqLift完好零污染；errors 0

### M2 重构 R10-A 验收记录（2026-10-10 12:0x，A蜡烛实物+C光线流动）
- ⚠️ 抓到 kimi 一处 bug 并热修：虚像蜡烛 x 写成 `Sp.x+(Sp.x-candle.x)`（Sp 已是对称点，双倍距离把虚像画出屏外）→改 `m.Sp.x`，render bump ?v=13。教训：对称点二次镜像=坐标语义混淆，grep 表达式时看到「对称坐标再算一次距离」要警觉
- 活体断言全绿：A 物蜡烛(488,526,h110)镜前/S=火焰顶端(488,429)/Sp 严格对称(1036,429)/虚像蜡烛像素 10>0（热修后回到屏内）；C 开入射反射线+8563 像素（5条扇形+辉光）/流动粒子 flowT 在走/反向延长线开+S′脉冲光环 14 像素；蜡烛拖动 S/Sp 实时对称跟随；M2 reset 蜡烛回默认位开关全关；M1 回归链全绿（点燃→托盘拖出→重合 alpha0.98→记录表面板→按钮联动）；errors 0

### R10-B 验收记录（2026-10-10 12:1x，B 可拖动眼睛）
- 磁盘 8/8 过；活体断言全绿：眼睛程序化绘制（观察者符号非器材）、inBeam 点到射线几何判定、拖进光束 inBeam=true→虚像 alpha 0.84 点亮+hint「眼睛逆着反射光线…虚像」、拖出光束 inBeam=false→alpha 0.19 变暗、光屏承接 hint 优先级高于 inBeam、M2 reset 眼睛归位(1188,253)+开关全关、M1 回归 matched alpha 0.97、errors 0
- ⚠️ 可发现性热修（主会话一行）：眼睛在束外虚像已变暗，但「光线开/反向延长未开」分支的 hint 没引导拖眼睛（引导文案只排在 showExt 之后），学生看不到"要去拖眼睛"——把眼睛引导提到该分支，core bump ?v=16。教训：操作可发现性纪律——某操作已产生视觉后果（虚像变暗）时，当前可见的 hint 分支必须同时给出该操作的教学引导，不能只在后续分支才提

### R10-B 补充热修（2026-10-10 12:2x）
- ⚠️ 抓到真 bug：三开关（cb-ray/cb-ext/cb-norm）change 处理只改状态没调 updateHint()→切开关 hint 永远停在旧文案（也盖住眼睛引导热修）。修：三处补 updateHint()，core bump ?v=17
- 复验全绿：hint 随三开关逐级刷新（关=教学文案/开光线=「拖动眼睛到反射光路上…」/开反向延长=「把光屏拖到 S′…」/眼睛进光束=「眼睛逆着反射光线…」）；inBeam=true imgAlpha 0.84；errors 0

### R11 验收记录（2026-10-10 16:1x，蔡总六条 A/B/C 三单）
- A：镜面 hatch 只画背侧右（活体 left=0/right=33 像素）、「M」改「平面镜」三字、控制栏统一灰渐变底带+浅灰白卡片、观察眼素材抠图入库（四角 alpha=0/非透明0.943/props 注册 observer_eye 含 dir 翻转/SPRITE_VER=86）
- B：M2 右上器材托盘（光屏+观察眼两 slot，进 M2 默认 tray）拖出/收回照 M1 机制；程序化 drawEye 删净改 sprite（蓝瞳像素15>0）；眼在镜右朝左/镜左朝右翻转；⚠️ 子代理漏 bump 版本号，主会话补 render?v=15/core?v=18
- C：对称标注开关（连线+垂直标记+等距 cm 读数，+6522 像素）、入射/反射角读数恒相等（实测 1.7°=1.7°）+入射点可点切换、虚像淡轮廓态（dashed 框+「虚像在 S′」，solid 蜡烛不走该分支）+歧义修正 hint「像依然存在…与有没有人看无关」、可见区楔形淡金填充
- 活体断言全绿、errors 0、M1 回归零污染；版本号终态 core?v=19/render?v=16

### R12 验收记录（2026-10-10 16:3x，蔡总四条视觉品质）
- F25 首屏玻璃板虚线占位框：根因=sprite 异步加载后 loop 已停无人重绘；修=五 id 批量 onSprite 预载+就绪重绘；活体：首屏无交互 glass ready+玻璃像素 23>0
- F26 看不见的虚像改虚线蜡烛：离屏 source-in 剪影+横向虚线铺满；活体：蜡烛体像素 16>0、旧矩形框边 0
- F27 角度读数删净：两文件 grep 入射角/反射角/rayIdx=0；活体 fillText 拦截无角度文本
- F28 楔形末端曲线+渐变淡化：quadraticCurveTo 串接末端+linearGradient 0.10→0；活体水平剖面暖色 45→29→背景色（中段两尖峰=光线像素）
- 版本号 core?v=20/render?v=17；errors 0；M1/M2 回归字段全在；范围外零改动

### R13 验收记录（2026-10-10 16:5x，蔡总三条）
- F29 虚像不再随光线开关变样：dashCv 虚线剪影分支删净（grep=0），统一半透明实蜡烛 alpha=inBeam?0.85:0.45；活体：开光线前后虚像区像素 184→186 保留、alpha 0.45
- F30 M2 托盘移左上 (24,24)：活体确认
- F31 可见区改上下两条边缘反射光线张成的光锥：路径只引用 rSegs[0]/rSegs[末]，中间光线端点不再入路径；渐变 0.10→0 保留；活体：水平剖面暖色 194→105→55→38→19 递减（-240 尖峰=光线像素），远端数值与渐变理论值吻合
- 版本号 core?v=21/render?v=18；errors 0；M1/M2 回归字段全在；范围外零改动

### R14 验收记录（2026-10-10 17:1x，蔡总四条）
- F32 观察眼重扣：上轮白框根因=全局阈值没扣背景（非透明0.94误读）；本轮 flood-fill 从边界连通扣背景+羽化；硬断言过：四角alpha=0/非透明0.249/瞳孔不透明；SPRITE_VER=87；截图目视无白框
- F33 托盘：「器材」标签删（fillText 拦截无）、光屏缩略图全入卡内（卡顶上方像素0）
- F34 拖动实时触发：held 拖动中不松手 inBeam 已 true（判定用 heldX/heldY 每帧算）
- F35 inBeam 改楔形区域包含判定（pointInPoly，wedgePoly 四顶点每帧写入）：楔形内离光线远也 true（alpha 0.84）、镜后 false（0.46）、往返翻转正常；distToRay 仅留作贴线高亮增强
- 版本号 core?v=22/render?v=19；errors 0；M1/M2 回归字段全在；范围外零改动

### R15 验收记录（2026-10-10 17:3x，蔡总两条：光屏拖动实时触发+收回不被镜挡）
- F36：checkScreenAtSp 改 held 感知（held 态读 heldX）+pointermove held 分支调用；活体：从托盘按住拖到 S′ 位不松手 screenAtSp=true+hint「光屏上承接不到像」即时出现
- F37：m2screen placed 拖动 clamp 去 mirrorX+20 下限（改画布 20..W-20）+光屏绘制移到镜面之后（L85 在 L52 后）；活体：按住光屏中心跨镜面跟手（midX=762=mirrorX）直接拖回左上托盘=tray、atSp 复位 false
- 注：首轮探针抓光屏底边边界（hit 开区间外）误报不跟手，改抓中心复验全过——探针落点纪律：拖拽命中测试必须抓包围盒中心
- 版本号 core?v=23/render?v=20；errors 0；M1/M2 回归字段全在；范围外零改动

### R16 对称标注箭头热修（2026-10-10 17:4x，主会话一行级热修）
- 蔡总点名：右侧等距箭头应从 S′ 指向镜面（原从镜面指向 S′，与左侧「S→镜面」方向不一致）
- 修：render L163 arrow(mx2+6→ix) 改 arrow(ix→mx2+6)，render bump ?v=21
- 活体断言（拦截 moveTo/lineTo+getTransform 取 chevron 尖端真实坐标，像素探针对描边 V 形箭头不可靠已弃用）：左箭尖 x=756、右箭尖 x=768，分居镜面 762 两侧均指向镜面；errors 0

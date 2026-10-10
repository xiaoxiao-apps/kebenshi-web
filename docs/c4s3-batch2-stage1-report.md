# c4s3 批次2·阶段1 报告（新建节骨架 + M1 成像探究台）

日期：2026-10-10 ｜ 执行：子代理（r2）｜ 仓库：/Users/personal/projects/keben_web

## 文件清单（白名单7件，全部新建，范围外零改动，零 git 操作）

| 文件 | 行数 | 验证 |
|---|---|---|
| content/physics_g8_v1_c4_s3/index.html | 43 | 结构照抄 c4_s5 index（卡片页写法/导航守恒） |
| content/physics_g8_v1_c4_s3/thumb.svg | 60 | 玻璃板+点燃蜡烛+板后对称虚像+等距标注 |
| content/physics_g8_v1_c4_s3/exp-mirror.html | 93 | pseudo-fs CSS L36-37；script 顺序 props→audio→render→core，props.js?v=89 照抄 c4_s5 |
| content/physics_g8_v1_c4_s3/exp-mirror-core.js | 183 | node --check 通过 |
| content/physics_g8_v1_c4_s3/exp-mirror-render.js | 98 | node --check 通过 |
| content/physics_g8_v1_c4_s3/exp-mirror-audio.js | 45 | node --check 通过 |
| docs/c4s3-batch2-stage1-report.md | 本文件 | ≤60行 |

合计 6 件代码/页面文件 522 行。

## M1 功能落地

- 场景：PROPS.room_25d（fy=控制栏顶线）+ wood_desk 全屏桌带（by=0.70H）+ paper_board 铺板下 + glass_plate 竖直桌面中部（h=min(0.46H, candleH+90) 装下完整像）+ 物蜡烛/等效蜡烛 PROPS.candle（opt.lit 双 sprite 切换）
- 物理本体：虚像 imgX = mirrorX + doCm*K 严格镜像对称（像距=物距、等大、连线垂直）；alpha=0.4 半透明渲染 + 「虚像」文字标注；点燃与否虚像恒在，点燃时像火焰同步点亮（lit 同传）+ 额外光晕更明显，未点燃=整体半透明像
- 交互：①蜡烛点击点燃/熄灭（命中圈+悬停虚线环反馈+点燃 300ms 渐隐光晕 lightFx；点按与拖拽用 downMoved>3px 位移阈值区分）②拖物蜡烛水平移动（clamp 桌内 [max(16,mirrorX-doMax*K), mirrorX-3K]，虚像实时镜像同步；绿色四向箭头 CueingArrows 首拖消失）③拖等效蜡烛找像位（|eqX-imgX|≤6px 判定重合→绿色高亮光晕+playMatch 三音和弦+hint「像与物等大、到镜面距离相等」；可拖开重找）④桌面刻度尺以板面为 0 位（cm，5cm 长齿带数字）+ 卡A 实时物距/像距读数 ⑤卡B 记录表 3 行（列=蜡烛到板距离/像到板距离，「记录当前」写下一空行、满 3 行提示先清除、「清除」清空，纯观察不判分）⑥辅助线开关（物—像连线虚线+板面垂直小直角标记）⑦点击类先读快照（toggleLit wasLit、checkMatch was 先记后转移再分支）
- 控制栏：页底固定 ctrlbar（照抄 c4_s5：group 卡片分组+glabel nowrap+align-items:stretch+flex-wrap）——卡A 蜡烛（物距滑杆 3-16cm 与画布拖拽双向同步+读数+辅助线）｜卡B 记录表｜卡C 系统（重置/静音/全屏归一卡）｜模式栏 M1 active + M2/M3 disabled+「待上线」角标（挂载点 setMode 仅放行 m1）
- 音效：WebAudio 合成零外部音频（click/tick/light 点燃/snuff 熄灭/pick 拾/drop 放/match 重合），首次 pointerdown resume，btn-mute 静音钮
- 布局常量同源：by/fy/mirrorX/K/candleH 等全部 core.layout() 单点写入 MRR，render 只读，无双处硬编码
- 首屏 hint：①点击蜡烛点燃 ②拖板前蜡烛改变物距、看虚像对称移动 ③拖板后未点燃蜡烛去找像的位置

## 结算前自查（8条逐条）

1. ✅ wc -l 见上表；3 个 js 全部 node --check 通过（退出码 0）
2. ✅ grep -c "PROPS." core=4（SPRITE_BASE/VER/seatY×2）render=7（room_25d/wood_desk/paper_board/candle×3/glass_plate）；本地仅 drawArrowCross（教学提示箭头）+drawRuler（刻度尺）+光晕/命中环辅助层，零私画器材
3. ✅ core L4 SPRITE_BASE='../_lib/v1/sprites/'、L5 SPRITE_VER=85（照抄 c4_s5 core 现值）
4. ✅ core+audio 全部 13 个 getElementById id（scene/scene-wrap/obj-slider/read-do/read-di/cb-aux/btn-rec/btn-clear/btn-reset/btn-mute/btn-full/mode-m1/hint）逐个在 html 存在；#rec-table tbody tr 3行 .c-do/.c-di 契约在；html 控件全部有接线（mode-m2/m3 为 disabled 挂载点，spec 要求不接线）
5. ✅ exp-mirror.html L36-37 pseudo-fs 两条 CSS 规则在
6. ✅ index L32 卡链→exp-mirror.html；exp-mirror.html L43 返回→./index.html（导航守恒，与 c4_s5 同款写法）
7. ✅ 签名逐个对上库源：room_25d(c,W,H,opts{fy})=L858；wood_desk(ctx,W,H,{by,fy,x0,x1})=L728；glass_plate(ctx,x,y,{h})底边中心=L650；candle(ctx,x,y,{h,lit})=L320；paper_board(ctx,x,y,{h})=L287；seatY(by,topH,span)=L847；R1-R5 遵守（坐深居中 seatY/零投影不画接地阴影/拖拽 clamp 桌内/器材只坐顶面带 by..by+64）
8. ✅ 单位口径与 transcript 一致：记录表表头「蜡烛到板距离/cm」「蜡烛的像到板距离/cm」（P99 表格）、序号 1/2/3；结论句「像与物等大、到镜面距离相等」「像与物体关于镜面对称/连线与镜面垂直」（P100）；初始蜡烛未点燃（蔡总光源关态偏好，拍板条5 candle/candle_unlit 双 sprite）

自查 8/8 通过，0 不过项。sprite 实存核验：candle.png/candle_unlit.png/glass_plate.png/paper_board.png 均在 _lib/v1/sprites/。

## R1 修复（2026-10-10 蔡总三条验收意见，续做单）

- F1 桌面厚度锁死：core.js layout() 删 R.by=R.H*0.70，改先算 R.fy 再 R.by=R.fy-109（L88，常量109px 照 c4_s5 定版）；render wood_desk 调用未动，厚度自动=109
- F2 删白纸：render L51 paper_board 调用删除、初始态删 paperH/paperY；core 删两行赋值
- F3 等效蜡烛+刻度改按钮触发：html 卡A末尾加 btn-eq（L63）+button.on 选中态样式（L30）；core 加 eqOn:false，btn-eq 点击切换+.on 同步+playClick（L108-118），pointerdown 命中前置 R.eqOn（L155），reset 回 eqOn=false 移除 .on（L184），updateReadout 分支 eqOn=false 读数「—」+btnRec.disabled=true（L43-53）；render 等效蜡烛绘制/重合光晕/drawRuler 全包进 if(R.eqOn)（L51、L61-71）；hint 分阶段文案（core L55-60）；checkMatch 加 R.eqOn&& 前置（L24）；版本号 render?v=3（L92）、core?v=2（L93）

R1 自查（逐条+行号）：
1. ✅ node --check core/render 均过（退出码0）
2. ✅ grep -c paper 三文件 = 0/0/0
3. ✅ grep "R.by=R.fy-109" core L88 =1 处；"R.H*0.70" core/render =0
4. ✅ btn-eq：html L63 元素在、core L12 getElementById 接线；btnRec.disabled 同步 core L48/L51
5. ✅ render 等效蜡烛 L61 if(R.eqOn) 内、drawRuler 调用 L51 if(R.eqOn)（函数本体保留 L28）
6. ✅ html 版本号 L92 render?v=3、L93 core?v=2

自查 6/6 通过；改动后行数 core=198/render=100/html=95；范围外零改动、零 git 操作。

## R2 修复（2026-10-10）
- F1 器材放大：core L91 `R.candleH=Math.round(R.H*0.32)`，L92 `R.glassH=Math.round(R.H*0.50)`，L93 加蜡烛顶越界 clamp。
- F2 虚像点燃才显：render L53-58 三处（candle/flameGlow/文字）包进 `if(R.objLit)`。
- F3 等效蜡烛初始远端：render L5 `eqDo:14`、core L190 `eqDo=Math.round(eqMax()*0.9)`。
- F4 重合实体化：render L8 `imgAlpha:0.4`、L55 lerp、core L130-132 loop 收敛停帧、L141 熄灭重置；hint L59 加“拼成一支完整蜡烛”。
- 版本号：html L92 render?v=4、L93 core?v=3。
- 自查 7/7 通过；node --check 两 js OK；范围外零改动。

## R3 修复（2026-10-10）
- F5 托盘机制：状态 `R.eqState` ∈ off/tray/placed，保留 `R.eqOn=(eqState!=='off')` 兼容读数/刻度尺。
- 托盘绘制：render L65-68 调用 `R.eqTray.drawCard/drawThumb`；托盘创建 core L97-98 在 layout 中右上区域。
- 拖出：core L166-169 pointerdown 命中托盘缩略图即 placed，真实尺寸蜡烛跟随指针（setEqPx y 锁桌面）。
- 收回：core L177-179 pointerup 落回托盘卡区域→tray；reset L205 回 off。
- btn-eq：core L113-119 off→tray→off 循环，`.on` 同步。
- hint 三分支：core L54-61（off/tray/placed）。
- 版本号：html L92 render?v=5、L93 core?v=5。
- 自查 8/8 通过；node --check 两 js OK；范围外零改动。

## R4 修复（2026-10-10）
- F6 托盘外观：core L97 trayX=24/trayY=24、trayW/H=150、fit=100；render L68 托盘条件 `eqState!=='off'`、L71 自绘「等效蜡烛」标签、绿色箭头已删。
- F7 拖出重做：状态 off→tray→held→falling→placed；core L190 pointerdown 切 held 并启动放大（L141 eqScale lerp）、L200-209 pointerup 卡外→falling 下落 350ms 后 placed、L205 placed 拖回托盘→tray；render L75 绘制 held/falling 跟随蜡烛。
- F8 物距延长：core L19-20 去 16cm 封顶；core L101 objS.setAttribute('max',doMax())；render L30-43 drawRuler 动态 maxL/maxR。
- 版本号：html L92 render?v=6、L93 core?v=6。
- 自查 8/8 通过；node --check 两 js OK；范围外零改动。

## R5 修复（2026-10-10）
- F9 白方块：core L18 `PROPS.onSprite('candle_unlit', ...)` 触发加载并重绘。
- F10 清箭头/圈：render 删除 drawArrowCross、hoverRing 函数与全部调用；core 删除 cueObj/cueEq 所有引用。
- F11 跨板：core L36 setEqPx lo=16、L228 falling lo=16；L48 readDi 与 L56 记录表均用 `Math.abs(R.eqDo)`。
- F12 拿起收回：core L193 placed→held、L197 held/stowing 自由跟手、L149 loop stowing 插值回 tray、L225 held 松手落托盘→stowing；render L64 含 stowing 绘制。
- F13 刻度尺：render L55 `if(R.matched)drawRuler(c)`。
- F14 未点燃无效：core L25 `matched=R.objLit&&eqState==='placed'&&...`。
- 版本号：html L92 render?v=7、L93 core?v=8。
- 自查 10/10 通过；node --check 两 js OK；范围外零改动。

## R6 修复（2026-10-10）
- F15 收回重叠：render 托盘缩略图只在 `eqState==='tray'` 画，且改 `PROPS.candle(...,lit:false)` 直调；drawThumb 调用=0。
- F16 水平滑动：core 加 `eqLift`，L218 placed pointerdown 不转 held，L196-203 pointermove 水平拖→setEqPx、上拖>28px→held；L241 endDrag 清 lift；L63 hint 追加「向上拖可拿起收回托盘」。
- 版本号：html L92 render?v=8、L93 core?v=9。
- 自查 7/7 通过；node --check 两 js OK；范围外零改动。

## R7 修复（2026-10-10）
- F17 按钮按压态：html CSS 给 #btn-eq 做凸起/凹陷两态（inset shadow + translateY(1px)），.on 切换逻辑不动。
- F18 记录表浮层：html 删除控制栏「记录表」group，scene-wrap 内新增 .rec-panel（右上常显）；控制栏「蜡烛」卡内 btn-eq 后并排加「记录数据」按钮；core 绑定与 disabled 联动不变（id 未变）。
- 版本号：html L100 render?v=9、L101 core?v=10（render 无逻辑改动）。
- 自查 8/8 通过；node --check 两 js OK；范围外零改动。

## R8 修复（2026-10-10）
- F19 面板放大：html CSS .rec-panel min-width:320px、字体 14px、th/td padding 6px 8px；btn-rec 移入 rp-foot 与 btn-clear 并列。
- F20 记录表按钮 toggle：html 控制栏 btn-eq 后新增 btn-table，CSS 与 btn-eq 共用两态；.rec-panel display:none+.show；core L129 btn-table click toggle 面板与 .on class，L274 reset 收回面板。
- 版本号：html L101 render?v=9、L102 core?v=11（render 无逻辑改动）。
- 自查 9/9 通过；node --check core OK；范围外零改动。

### R2 主会话验收记录（2026-10-10 08:4x）
- 磁盘自查 7/7 过；浏览器活体断言全绿：F1 蜡烛 0.319H/玻璃板 0.50H、F2 未点燃板后 0 像素→点燃后 19 像素、F3 等效蜡烛初始 eqDo=14 远端（离像位 120px）+记录钮联动、F4 拖重合 matched→imgAlpha=1.0、拖开→0.4，errors 0
- ⚠️ 抓到 kimi R2 一处 bug 并热修（一行级例外）：越界保护 clamp `if(R.candleY-R.candleH<0)...` 被放在 R.candleY=seatY 赋值**之前**（candleY 还是 0）→ 蜡烛被压成 0 高（活体断言 candleH=0 暴露，node --check 抓不到）；已移到赋值后，core bump ?v=4。教训：顺序敏感的保护性 clamp 必须紧跟其依赖变量的赋值之后

### R3 主会话验收记录（2026-10-10 08:5x）
- 磁盘 8/8 过；浏览器活体断言全绿：初始 off（无托盘/记录钮置灰）→ btn-eq 出托盘卡（#e8eef5 像素证实）+刻度尺+hint「从托盘拖…」→ pointerdown 命中槽位即 placed（即成品跟随，无 ghost）→ 拖中 eqX 实时跟指针 → 落位 eqDo=10 → 拖回托盘区收回 tray → 再点按钮回 off；回归链：点燃→虚像→拖托盘蜡烛到像位 matched→imgAlpha=1；errors 0

### R4 主会话验收记录（2026-10-10 09:3x）
- 磁盘 8/8 过；浏览器活体断言：F6 托盘左上(24,24) 150×150、绿色箭头已删（drawArrowCross 只剩物蜡烛/placed 两处教学用）、三态常显；F7 全链路 held(0.4起放大)→拖动跟随→松手 falling→350ms 落桌 placed→matched=true→imgAlpha 0.99，autoOverlapBug=false（物距拉满37cm时点托盘蜡烛不再自动重叠）；F8 滑杆 max=37（doMax 动态）、objX 可达 22px 桌面左端、刻度尺 span 22→1500 全桌宽
- ⚠️ 抓到 kimi R4 一处 bug 并热修：falling 落地转 placed 只补了 eqOn=true，缺 checkMatch()+animNeed 续帧 → 蜡烛正好拖到像位松手时 matched 不触发、实体化动画死（R.eqOn=false 期间 matched 恒 false，落地帧 alphaNeed 按旧值算完 loop 即停）。热修=落地分支补 checkMatch();updateReadout();animNeed=true;，core bump ?v=7。教训：状态门控的派生量（matched 依赖 eqOn）在门恢复时必须重算一次，动画循环的续帧判据要覆盖状态刚切换的帧

### R5 主会话验收记录（2026-10-10 10:0x）
- 磁盘 10/10 过；浏览器活体断言全绿：F9 白块 0 像素（onSprite 预载生效）；F10 悬停位=墙色无蓝虚线圈、箭头/圈代码清零；F11 等效蜡烛落板左 642px（mirrorX-120）、eqDo=-6、像距读数取绝对值 6.0；F12 桌面拿起=held→落托盘=stowing→tray；F13 刻度尺 matched 时 493 像素/离开 0 像素/回重合再现；F14 未点燃拖到像位 matched=false、alpha 0.4；回归链 点燃→重合→alpha 0.99；errors 0
- 白块根因备忘：PROPS.candle lit:false 的 candle_unlit 未加载 fallback 白块（props.js L341-344），页面级修法=onSprite 预载，未动库

### R6 主会话验收记录（2026-10-10 10:3x）
- 磁盘 7/7 过；浏览器活体断言全绿：F15 tray 态缩略图火苗像素 0（lit:false 直调生效）、stowing 中途托盘区火苗 0（不再两支叠）、收回后 tray 火苗 0；F16 水平拖 100px 保持 placed（922→1072）、上拖 40px 才转 held、拖回托盘 stowing→tray 回归不坏；回归链 点燃→拖出→水平滑动对准→matched→alpha 0.99；errors 0

### R7 主会话验收记录（2026-10-10 10:4x）
- 磁盘 8/8 过；浏览器活体断言：F17 btn-eq 未按下=外投影凸起/按下 .on=inset 内凹+translateY(1px)/再点回弹（采样落在 .12s 过渡中属正常）；F18 面板 scene-wrap 右上 (16,16) 宽260、记录数据按钮初始 disabled→引入等效蜡烛后激活、重合后点击写入 1/8/8 行、关按钮后面板与已记录行保留；errors 0

### R8 主会话验收记录（2026-10-10 10:5x）
- 磁盘 9/9 过；⚠️ 抓到 kimi R8 一处 bug 并热修：btn-table 点击处理引用 R.recPanel（面板实际挂局部变量 recPanel，R 上无此属性）→ 点击抛错面板不显；活体断言抓出（panelVisible=false），改局部引用后复验全绿，core bump ?v=12。教训：R 状态对象与局部 DOM 变量命名相近时子代理易引用错名，语法检查不报、运行才炸——活体断言是唯一防线
- 复验全绿：初始面板隐藏/点 btn-table 面板出现(320px)+按钮凹陷 inset/再点消失+弹起/记录数据置灰联动(无等效蜡烛true→引入false)/重合写入1/8/8/reset收面板清数据；btn-rec+btn-clear 并列在面板 rp-foot；CSS 与 btn-eq 共用两态；errors 0

### R9 刻度尺标签热修（2026-10-10 11:2x，主会话一行级热修）
- 蔡总点名：重合时刻度尺数值不均匀。根因=drawRuler 标签双套混排（`if(big)每5格必标` + `else if(i%labelStep===0)每2格也标`）→ 间距 2,2,1,1,2 交替
- 修：合并为单条 `if(i%labelStep===0)`（k=20→labelStep=2，等距每2cm一标），render bump ?v=11
- 活体断言（fillText 拦截取真实坐标）：38 个标签间距全部 40px 等距、奇数5位置多余标签 0 个、'cm' 单位在位、matched 态刻度尺正常出现

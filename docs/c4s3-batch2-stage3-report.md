# c4s3 批次2 阶段三 M3 潜望镜 开发报告

## R17 M3 潜望镜初版

- 范围：content/physics_g8_v1_c4_s3/exp-mirror-core.js、exp-mirror-render.js、exp-mirror.html
- html：mode-m3 按钮解禁并去「待上线」角标；加 M3 卡组（卡A angle-slider 30-60°、读数 read-angle；卡B cb-path 光路开关）；三套 mode-* CSS 显隐互斥
- core：R.m3 状态字段 L22；layoutM3 L53 计算 Z 形管几何、上下卡槽、眼睛/物体位置、plane_mirror 托盘；setMode('m3') L230 切模式；pointermove m3 分支 L331 拖动 held 态实时 checkM3；pointerdown m3 分支 L377 托盘取出/placed 拾取；endDrag m3 L486 托盘收回/卡槽吸附；angleS input L200、cbPath change L204；reset m3 L541；updateHint m3 L118；checkM3 L425+computeM3Path L437 按反射定律实算两段反射、inEye 判定
- render：R.m3 字段初始化 L23；drawM3 L202 绘制 Z 形管壁/卡槽/托盘/PROPS.plane_mirror 45° 旋转变换调用/光路三段+流动粒子/PROPS.observer_eye(dir='left')/正立像；rayM3 L182 复用 M2 辉光粒子语言
- 反射定律实现：入射方向 d 对法向 n 做 r=d-2(d·n)n；top 法向 n=(cosθ,sinθ)、bottom 法向 n=(-cosθ,sinθ)；≠45° 时出射不水平；inEye=出射光线与眼睛 y 水平线交点 ex 距 eye.x≤36px
- plane_mirror 签名：PROPS.plane_mirror(ctx,x,y,{w:300})，(x,y)=顶面中心；调用处用 ctx.save/translate/rotate(±π/4)/plane_mirror(c,0,0,{w:m.mirrorW})/restore 实现 45° 摆放
- observer_eye 签名：PROPS.observer_eye(ctx,x,y,{h:48,dir:'left'})，(x,y)=包围盒中心，dir='left' 水平翻转
- 版本号：render.js?v=22、core.js?v=24
- 自查 10/10：node --check core+render 通过；html mode-m3 无 disabled/无待上线、M3 卡组存在、三套显隐 CSS 互斥；core setMode/layoutM3/托盘拖拽/角度/光路/inEye/reset 行号可查；render Z形管/卡槽/PROPS.plane_mirror/45°旋转/光路/observer_eye/正立像 grep 可查；反射定律实算非硬编码；inEye 判定式可查；库签名一致；M1/M2 回归 grep 字段数未异常；版本号正确；范围外零改动（props.js 未改）

## R18 M3 修复（蔡总实测后按根因修复）

- layoutM3 重写：新字段 x_l/x_r/x_e/y1/y2/w/wall；阶梯 Z 形管 →↓→；topSlot/bottomSlot 在竖直段上下拐角；objPos/eyePos 对齐管轴；mirrorW=round(w*1.45)≈70
- 状态机：checkM3(commit) L425；pointermove 调 checkM3(false) 不改状态；endDrag 调 checkM3(true) 落槽/placed；pointerdown 支持 (placed||slot) 重拾；hitM3Mirror 用有效位置（held→heldX/Y 否则 x/y）半径34
- 几何修复：computeM3Path L437 删旧 n1/n2/ix1；理想 45° 时 i2=(x_r,y2)、ex=x_e+20；非 45° 用 r1=(cos2θ,sin2θ) 实算、碰壁时 wall 光斑；滑块 45° 磁吸 L197
- render drawM3 重写：中心线三段两弯、壁厚/内腔；镜子统一 rotate(+θ) 随 angle 滑块；删 ±π/4 硬编码；光路支持 wall 态两段+橙色光斑，inEye 态三段+粒子
- hint：非 45° 文案改为「光线射到管壁上了」
- 版本号：render.js?v=23、core.js?v=26
- 自查 10/10：node --check 两 js 通过；checkM3(commit) 签名+pointermove(false)+endDrag(true) 可查；pointerdown 认 slot 重拾+hitM3Mirror 有效位置；layoutM3 新字段在、旧 segW/midY/botY 清零；computeM3Path cos(2*th)/wall/tx/ty 在、旧 n1/n2/ix1 清零；镜子 rotate 用 angle 非 ±π/4；滑块 45° 磁吸在；M1/M2 回归字段数未异常；版本号正确；范围外零改动

## R19 M3 潜水艇场景化（蔡总 2026-10-10 拍板）

- layoutM3 改潜水艇剖面坐标：y_w=H*0.24 水面线、y1=H*0.13 潜望镜头部、y_hull=H*0.44 艇顶、y2=H*0.66 艇内目镜、y_hb=H*0.84 艇底、x_hl/x_hr 艇壳范围、towerW=64；objPos 小船贴水面、eyePos 艇腔内；p0 起点改 x_l+6（观察窗内）
- drawM3 重写：buildM3Background 静态缓存（bgCv）含天空/海水/潜望镜管/观察窗缺口/潜艇双线胶囊壳+内腔/指挥塔/法兰 junction/尾舵螺旋桨/舷窗；drawWave 双正弦每帧；drawBoat 小船剪影（船体+桅杆+帆）替代绿箭头；像用 0.8x 同船+「正立的像」标注
- hint m3 分支文案改为潜水艇首屏、双镜入槽+45° 追加「艇里的人直接看看不到水面…」
- 版本号：render.js?v=24、core.js?v=27
- 自查 12/12：node --check 通过；layoutM3 新字段 y_w/y_hull/y_hb/x_hl/x_hr/towerW 在、topSlot/bottomSlot/eyePos/objPos 新映射；bgCv 缓存+重建在；双层波浪 drawWave 在；潜艇双线壳/内腔/指挥塔/法兰/尾舵/舷窗 grep 在；小船+「水面船只」在；小船像+「正立的像」在；物理/交互行号未变（checkM3 L426、computeM3Path L439、磁吸 L201、pointermove checkM3(false) L338、endDrag checkM3(true) L484）；M1/M2 回归字段数未异常；版本号正确；范围外零改动

## R20 M3 潜艇剖面换生成图 sprite（蔡总 2026-10-10 点名）

- props.js 追加 PROPS.submarine_hull L731（按 observer_eye 模式，(x,y)=中心，opt.w 显示宽，高=opt.w/5.136 来源 sprite 实测 bbox），SPRITE_VER 87→88
- core layoutM3：y_hull/y_hb 改由 HULL_RATIO=5.136 与 y2 计算；m.tube 增 hullW/hullH；其余 R19 字段保留
- render buildM3Background：删程序化胶囊艇壳/尾舵/螺旋桨/舷窗；改 PROPS.submarine_hull 静态画入 bgCv；保留潜望镜管、观察窗缺口、指挥塔、法兰 junction、双层波浪、小船、光路、眼睛、正立像
- core 预载列表追加 'submarine_hull'；版本号 core?v=28、render?v=25
- 自查 10/10：node --check 三 js 通过；props 新增 sprite+SPRITE_VER=88 纯追加；layout HULL_RATIO/y_hull/y_hb/hullW/hullH 在；render 旧 capsulePath/doubleLine/尾舵/螺旋桨/舷窗 grep 清零、submarine_hull 调用在 bgCv；预载列表六 id；sprite 路径 200；物理交互行号与 R19 一致；M1/M2 回归字段数未异常；版本号正确；范围外零改动

## R21 M3 视觉接线两修

- F1 光线与小船接线：layoutM3 y1=y_w-40；computeM3Path p0={objPos.x,y1}；drawBoat 桅杆从甲板画到 y1（桅顶=光起点）；光路视觉上从桅顶水平射入观察窗
- F2 像改画中画 inset：删眼睛右侧小船像；inEye 时画右上角圆角面板 (W-252,36,216,104)，含迷你水面线+0.7x 小船+「潜望镜里看到的」「正立的像」
- 版本号 core?v=29、render?v=26
- 自查 7/7：node --check 两 js 通过；y1=y_w-40+p0 桅顶+桅杆到 y1 在；旧眼侧像段 grep 清零、inset roundRect/潜望镜里看到/正立的像在；物理交互仅 p0 一行变（checkM3 L429、computeM3Path L442、磁吸 L204 与 R20 一致）；M1/M2 回归字段数未异常；版本号正确；范围外零改动

### R18 验收记录（2026-10-10 20:5x，蔡总点名主会话亲自浏览器体验）
- 实测确诊三组根因：①状态机死锁（checkM3 每帧把 held 提前落 placed，snap 只认 held→永远进不了槽）②几何全错（5段4弯S形管/槽悬管外/眼和物体浮管外/反射法线方向反/除零/镜子角硬编码）③入槽镜拿不出来（pointerdown 只认 placed）
- kimi 按主会话给定方案重写：layoutM3 阶梯3段2弯（x_l/x_r/x_e/y1/y2）、checkM3(commit) 拖动中不改状态、pointerdown 认 slot 重拾、computeM3Path 反射角 2θ 实算+打管壁分支、镜子 rotate 随滑块、45° 磁吸
- 主会话交互实测全过：拖镜入槽 held→slot、45° inEye=true 光路 →↓→ 三段+粒子、50° 打管壁+hint 引导、44.8° 磁吸回 45.0、入槽镜重拾 held→placed 光路断、reset 全复位、M1/M2 回归正常、errors 0、截图目视（阶梯管/双镜45°/光路/眼/正立像/控制栏灰带全对）
- 版本号 core?v=26/render?v=23

### R20/R21 验收记录（2026-10-10 21:5x，蔡总点名生成图方案+主会话目视闭环）
- R20：程序化剖面失败（大圆+散线）→ Seedream Pro 生成艇体剖面（2048×768）+flood-fill 抠图入库 submarine_hull.png（bbox 1813×353 比例5.136/四角透明/0.881）；props 追加 PROPS.submarine_hull+SPRITE_VER=88；layout 按实测比例适配（y_hull=y2-0.6hullH）；render 删程序化壳改 sprite 入 bgCv；预载六 id；主会话目视：艇体合格（胶囊双壳/舷窗/舵桨/光路穿水面穿塔全对）
- R21：主会话目视发现两断点→修：①y1=y_w-40 头部贴水面+桅杆顶=光起点 p0（光线从船桅顶射进观察窗）②「正立的像」改右上角画中画 inset 面板（防艇尾舵压住）
- 版本号 core?v=29/render?v=26；errors 0；M1/M2 回归全在；范围外零改动
- R21 热修补丁：drawBoat 桅高改显式参数（inset 局部坐标下旧式 y-tube.y1=-58 为负→帆画水面下）；inset 传 40；render bump ?v=27

## R22 镜筒缩短+薄镜片（蔡总 M3 验收三条）

- F1 layoutM3（core L55/62/63）：headLen=0.10W、eyeLen=0.11W；x_l=x_r-headLen、x_e=x_r+eyeLen（x_r=0.56W 不变）；objPos={0.13W,y_w} 小船固定左侧、p0 桅顶穿空气射观察窗（空气段变长物理正确）；eyePos={x_e+26,y2} 眼睛贴目镜筒口随缩短前移；校验 x_e+26+40<x_hr（0.67W+66<0.88W 恒成立）；管中心线/观察窗缺口/法兰全绑 x_l/x_r/x_e 自动跟随，drawM3 绘制代码零改动
- F2 props.js 纯追加 PROPS.mirror_plate L944（照 submarine_hull 注释风格）：(x,y)=中心、opt.len 默认90、th=7、roundRect 玻璃渐变(#cfe4f7/0.45#f4f9ff/#a8c8e8)+stroke #334155 lw1.5+背面斜纹4条 #64748b lw1.2；render L273 托盘缩略图 mirror_plate{len:44} 水平、L277 drawMirrorAt mirror_plate{len:mirrorW*1.3}（rotate 包裹不动，slot/held/placed 三态共用）；grep PROPS.plane_mirror render=0；props 库件 plane_mirror 保留未删
- F3 版本号：props.js?v=90、core?v=30、render?v=28
- 自查 8/8：①node --check 三 js 通过 ②layoutM3 新公式 L55/62/63 ③mirror_plate L944 纯追加（既有行零改动）④render mirror_plate 两处调用覆盖缩略图+三态、plane_mirror=0 ⑤html 三版本号 L129/131/132 ⑥M3 交互零改动：checkM3 L429、computeM3Path L442、磁吸 L204、pointerdown L363 与 R21 一致 ⑦M1/M2 回归 grep（eqLift/stowing/btnTable/labelStep/trayState/wedgePoly/showSym/inBeam）core 28+render 15 在 ⑧范围外零改动

### R22 验收记录（2026-10-10 22:4x，蔡总三条：镜筒缩短+眼睛跟随+薄镜片；夜间窗口单，personal 通道欠费改 aliyun2 执行）
- F1：headLen=0.10W/eyeLen=0.11W（实测 152/168px），x_l/x_e 绑短 stub；eyePos=x_e+26 贴目镜筒口前移（实测 1047=1021+26）；小船固定 0.13W，光线空气段从桅顶射到观察窗（物理正确）
- F2：props 追加 PROPS.mirror_plate 薄镜片（7px 厚玻璃渐变+背面斜纹），render 三态+托盘缩略图全替换，plane_mirror 调用=0
- 目视复验：镜筒比例像真潜望镜、眼睛贴筒口、薄镜片清爽、光路/画中画/艇体/波浪全正常；errors 0
- 版本号 props?v=90/core?v=30/render?v=28；M1/M2 回归 28+15；范围外零改动
- 运维事件：22:23 派单撞 personal 通道欠费（billing error），切 aliyun2-token-plan 重派成功；已提醒蔡总充值/换 key

## R23（蔡总四条：镜筒再短/上镜翻转/潜艇放大/光路顺序传递）

- F1 镜筒再短（core L55）：headLen=0.06W、eyeLen=0.07W（R22 的 0.10/0.11 再收），x_l=x_r-headLen、x_e=x_r+eyeLen、眼睛 x_e+26 跟随
- F2 上镜翻转（render L277）：drawMirrorAt(x,y,isTop) 上镜 rotate(theta+π)，斜纹背面朝右上、镜面朝左下受光；三态共用不变
- F3 潜艇放大（core L55）：x_hl=0.14W、x_hr=0.96W、y2=0.62H，管/塔/法兰/壳全绑字段自动跟随
- F4 光路顺序传递（本会话落盘）：pathT0 四处=render 初始化 L13、core 初始化 L22、cbPath L208（勾选重置）、computeM3Path L444/451/460（null→非null 才重置，角度重算不打断）；rayM3 第6参 cap（L182，frac=cap/len，粒子 d>cap 跳过 L197）；drawM3 光路块重写 L288-303：segs 二维/三段、lens/L、prog=(now-pathT0)/2200、drawn=prog*L、逐段 capI 裁剪，prog>=1 后恢复整段+粒子；wall 态爆点闪光改为光传到才出；loop 帧维持已有（showPath→animNeed=true，未改）
- 版本号：core?v=31、render?v=29
- 自查 8/8：①node --check 两 js 通过 ②pathT0 四处 ③rayM3 cap+粒子过滤 ④drawM3 segs/prog/drawn/sofar ⑤版本 31/29 ⑥交互零改动：checkM3 L429、computeM3Path L442、磁吸 L204、pointerdown L363 与 R22 一致，反射段公式未动 ⑦M1/M2 回归 grep core 28+render 15 ⑧范围外零改动（F1/F2/F3 为上轮已落盘，本轮仅补报告行号）
- R23 重派核验（22:5x，aliyun2 重派单）：发现上一单并非静默零落盘——core/render/html/本报告 mtime 22:49-22:55 与重派单开始（22:44）重叠，原单已把 F1-F4 全部写完。本单未改任何代码，逐项复验磁盘终态：node --check 双通过；headLen/eyeLen=0.06/0.07W（core L55）；drawMirrorAt isTop→θ+π（render L279，三态调用点 L281-286 已带 isTop 参）；x_hl/x_hr/y2=0.14W/0.96W/0.62H+hullH≈0.16W 注释校验（L55/58）；pathT0 五处（core L22、render L13、cbPath L208、computeM3Path L444/451/460）；rayM3 cap 第6参+粒子 d>cap 过滤（render L182/197）；drawM3 segs/lens/prog=2200ms/drawn/sofar 逐段 cap、prog>=1 传 undefined 复原状、wall 光斑 prog>=1 才现（L288-308）；loop 维持确认 showPath→animNeed=true（core L281）未改；交互行号 checkM3 L429/computeM3Path L442/磁吸 L204/pointerdown L363 与 R22 一致；M1/M2 回归 grep 8 关键词全在（eqLift/stowing/btnTable/labelStep/trayState/wedgePoly/showSym/inBeam）；版本 core?v=31/render?v=29（html L131/132）；audio.js/index.html/props.js?v=90 零改动；20s mtime 复查稳定无并发残留写。自查 10/10。

### R24 热修（2026-10-10 23:1x，蔡总圈图：管口悬浮矩形突兀+目镜再减半+眼位不变；主会话一行级热修）
- 删「观察窗缺口」悬浮矩形（rect x_l-8 段）+管左端 round cap 圆头改 butt 平口敞开（lineCap='butt' 两处），光线从敞口自然进管
- eyeLen 0.07W→0.035W（实测 53px）；eyePos 锁 R23 现位 eyeX=0.63W+26（实测 985 不变）；computeM3Path ex 改 eyePos.x-30（光出筒口射到眼前，inEye 判定不坏）
- 目视复验：矩形消失、敞口自然、目镜短、眼位不变、光路全通 inEye=true；errors 0；版本 core?v=32/render?v=30；M1/M2 回归 28+15；交互行号未动

### R25 器材库改造（2026-10-10 23:5x，蔡总点名两器材；库层单一来源修改，全局生效含已上线）
- 玻璃板：改**纯程序化绘制**（props.js glass_plate 重写：等距薄板三面 rgba 半透明 0.32/0.50/0.65+高光斜纹，无底座；总宽比 0.415h 对齐旧图 0.413，各页摆放不漂移）。PIL 修补（底边插值脏条）与 Seedream 图生图（参考图通道两败）两路皆弃
- 蜡烛 lit/unlit：PIL 去椭圆底座（座顶检测=自上而下首行宽>110 连续5行）+36px 柱身段平铺延至原高 465+黑底封口；unlit 左缘残弧用列条复制修净；两图成对改防点燃切换穿帮
- 缓存：SPRITE_VER 88→89；六页 props.js?v 全 bump（mirror 91/shadow 54/medium 51/dispersion 90/reflect 59/gallery 90）
- 目视：M1 玻璃板透墙色+无座、蜡烛柱体到底；已上线影子页蜡烛同步无座（带座灰板=孔板独立器材未动）；errors 0；原图备份 /tmp/sprites_backup_R25/
- R25b 蔡总复验两修：①蜡烛底平切→2.5D 椭圆弧底（PIL chord 下半圆盘+弧描边，lit/unlit 成对）②玻璃板 upright 矩形（视觉=贴墙横摆）→等距斜摆平行四边形板面（sk=0.10h 斜移）+厚度面减薄 dx=0.022h，「竖立在桌面上」2.5D 效果；SPRITE_VER 90、六页 props 版本再 bump（mirror 92/shadow 55/medium 52/dispersion 91/reflect 60/gallery 91）；目视 M1 通过、errors 0
- R25c 蔡总复验两修：①未点燃蜡烛线条淡→根因=两源图描边本来不一致；改**未点燃图从点燃图派生**（清火焰+光晕、保留烛芯，其余像素不动），像素探针四行边缘 100% 一致，点燃切换唯一差异=火焰 ②玻璃板倾斜方向错（R25b 侧边斜=绕横轴歪=要倒）→按旧 PNG 探针几何重写=**绕纵轴**：侧边竖直、上下边右斜 drop=0.048h、顶面退向右后上、右侧厚度面 dx=0.05h；SPRITE_VER 91、六页 props 版本再 bump（mirror 93/shadow 56/medium 53/dispersion 92/reflect 61/gallery 92）；目视未点燃/点燃两态+虚像正常、errors 0
- R25d 蔡总三调：旋转角加大 drop 0.048→0.085h（超旧图 0.076h）、厚度再减 dx 0.05→0.030h、删板面两条白竖纹；六页 props 版本 bump（mirror 94/shadow 57/medium 54/dispersion 93/reflect 62/gallery 93）；目视通过、errors 0

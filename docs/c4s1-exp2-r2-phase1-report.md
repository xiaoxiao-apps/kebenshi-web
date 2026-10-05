# c4s1 实验②「光影成像实验室」重制 · 阶段一报告

## 一、文件清单与行数
| 文件 | 路径 | 行数 |
|------|------|------|
| 页面骨架 | content/physics_g8_v1_c4_s1/exp-shadow.html | 53 |
| 核心逻辑 | content/physics_g8_v1_c4_s1/exp-shadow-core.js | 294 |
| 本报告 | docs/c4s1-exp2-r2-phase1-report.md | 本文件 |
| 探针 | /tmp/c4s1e2-probe.txt | 1 |

## 二、磁盘自查结果
- `node --check exp-shadow-core.js` → CHECK_OK ✅
- `grep -c "PROPS\."` → 11（≥8）✅
- `grep -n "SPRITE_BASE"` → 第2行（在第3行内，置顶）✅；`SPRITE_VER=60` 置顶 ✅
- `grep -n "__c4s2dbg"` → 第287行 ✅
- 器材本体渲染全部走 PROPS.*（desk_lamp/candle/hand_shadow/screen/board_with_hole/laser_pen），无本地重画；仅影子剪影/辅助光线/读数面板属动态层自画 ✅
- 收尾 `})();` 完整，无截断 ✅

## 三、物理规格落地说明
1. 骨架照抄 v53：状态机 stored/active/falling/returning、pointerdown 命中倒序、constrain、supportY 每帧支撑重检、liftT 提起动画、setPointerCapture、draw 层次（bench→toolbox→media→影子→光线→读数）。
2. 初始态：8件全 stored + 光源全灭（lit=false）；无 ?参数自动放置逻辑。
3. 8槽托盘两行4列（卡左上 16,16 / 292×150）。
4. 点光源规格（拍板A）：拖出默认熄灭，点击灯体（pointerup 位移<5px）→ lit 取反；desk_lamp 用 `{lit:!m.lit, glow:m.lit}`，candle 用 `{lit:!m.lit}`；播 playClick；falling/returning 不响应点击。
5. 手例外：hand_shadow 不受重力，pointerup 即 active 停在松手处（constrain 限舞台），不进 falling。
6. 手影物理：desk_lamp lit 且 hand/screen active 才投影（缺灯提示点亮、缺屏提示拖屏、缺手提示拖手、手不在灯屏之间提示「移到灯屏之间」）。
   - 点光源 P=灯位+frac；光心→手→屏面放大率 m=(Sx-Px)/(Ht-Px)；影子中心 Sy=Py+(Ht.y-Py)*m，大小∝m，clip 屏面矩形，色 rgba(10,12,18,.9)。
   - 手形剪影=掌心椭圆+3指椭圆（自写 handShadowShape）。
7. cb-ray 勾选画两条辅助光线（P→指尖→屏面上下缘，虚线黄 .5）。
8. 右上读数面板（canvas 圆角白卡）：显示「放大率 m=×N.N」+「手近灯 → 影变大」。
9. 调试钩子 `__c4s2dbg`：media/W/H/benchY/place(id)/lightOn(id,v)/u(灯手距)/v(灯屏距)。

## 四、Python+PIL 探针坐标（禁目测）
素材均在 content/_lib/v1/sprites/：

- **desk_lamp.png 311×539**（点光源=灯罩开口中心）
  - 灯罩暗区 bbox：x 13~303 / y 7~215，罩帽中心 frac (0.43, 0.24)
  - 灯罩开口底口 frac x=0.399 / y=0.392
  - 亮/灭差分光晕核心 frac (0.32, 0.41)
  - → 取 **LAMP_BULB fx=0.40, fy=0.39**（灯泡出光口中心）

- **screen.png 283×467**（屏面=局部亮舞台区）
  - 横向扫描 y=150/230/300 帧边缘过渡 x=29→251（内框右缘 271）
  - 纵向扫描 x=80/140/200 帧边缘过渡 y=27→380（内底 399/433）
  - → 取 **SCREEN_SURF xL=0.102, xR=0.887, yT=0.058, yB=0.814**

- hand_shadow.png 447×506（黑版）/ hand_shadow_skin.png 785×798（props 内部已归一，NAT 填黑版基准）
- candle.png 175×465、candle_unlit.png 175×465、board_with_hole.png 328×487、laser_pen.png 324×90

## 五、遗留问题 / 后续阶段
- btn-align「一键对齐」阶段一恒 disabled（占位）。
- laser_pen 本阶段仅搬运（stored/active/falling），按钮逻辑=阶段三。
- 蜡烛火焰物理像=阶段二（本阶段仅开关状态与 sprite 切换）。
- 器材成品尺寸互不遮挡微调留后续阶段。
- 效果实测需蔡总浏览器验收（子代理按规则不实测）。
## 六、阶段一验收修复记录
1. drawMedia desk_lamp：`lit:!m.lit` → `lit:m.lit`（熄灭/点亮 sprite 契约取反修正）
2. drawMedia candle：`lit:!m.lit` → `lit:m.lit`
3. drawMedia hand_shadow：补 `skin:true`（设计书 7.2 肤色版）
4. exp-shadow.html core 版本 `?v=60` → `?v=61`

## 七、蔡总回报修复单(kimi)
1. 点亮时序：pointerup 先记 `wasActive` 与 `dist`，再做 falling/returning 转移，最后 `wasActive && dist<5 && (lamp||candle)` 时切换 `m.lit`。
2. 点燃反馈：`fx[]` 记录 300ms 渐隐动画——台灯黄色光晕环、蜡烛橙色脉冲圆点。
3. 首屏 hint：空台时提示「从左上托盘拖器材到桌面。点击台灯/蜡烛可点亮或熄灭」，后续仍走 `hintFor` 动态。
4. 拖动跟手：dragging 中 active 器材加 2px `rgba(37,99,235,.5)` 描边。
5. 落点吸附：falling 落地后 `resolveOverlap()`，重叠面积>50% 则水平推开。
6. 读数增强：面板加「物距 u=NN px」「像距 v=NN px」。
7. 版本对齐：`SPRITE_VER=62`，html `core.js?v=62`。
8. 重置彻底：`resetAll()` 恢复首屏 hint、清 `alignAnim`（若存在）。

磁盘自查：`node --check` OK；`wasActive` 在 L266，点亮分支在状态转移后 L277；`PROPS.`=11；`lit:!m.lit`=0；`skin:true` 命中；`SPRITE_VER=62` 命中；`v=62` 命中；core 341 行、html 53 行；收尾正常。

## 八、阶段二小孔成像(kimi)
### 物理公式落地（蔡总 10-05 拍板纠错版）
- 孔心：boardHolePos 取 `PROPS.BOARD_HOLE(cx,cy)` × 板高/487。
- 物=火焰：`flamePos` 物顶=火焰尖、物中心=火焰中点、物高=0.18×蜡烛高。
- 像高：`hi = Oh × (v/u)`，倒立：屏上像点 `y = 孔心y + (孔心y−物点y)×(v/u)`。
- 模糊斑径：`d = holeD×(u+v)/u`，`holeD = holeR×2×s_board`。
- 亮度能量守恒：`bright = clamp((14/d)²×0.9, 0.12, 1)`，层数 `n=clamp(round(d/3),1,9)`，单层 alpha=bright/n。
- 光锥边际光线：火焰顶→孔顶→屏像底、火焰底→孔底→屏像顶（cb-ray 勾选）。
- Clip：统一走 `PROPS.screenGeom()` 梯形路径。

### 控件清单
- html 新增 `div#grp-hole`：label「孔径」+ `−`/`+` + range `8-40 step2` + `#hole-val`。
- core `holeR` 状态默认 14；`setHole` 钳位+对正 step2；±按钮/滑杆/input 事件；仅孔板 active 时显示。
- `wasDraggedScreen`：屏右侧绿色四向箭头首次 pointerdown 命中屏后消失。

### 自查结果
- `node --check` OK；`SCREEN_SURF`=0；`screenGeom` 命中 4 处；`grp-hole`/`hole-slider`/`wasDraggedScreen` 命中；`PROPS.`=13≥11；`lit:!m.lit`=0；`SPRITE_VER=63`、`v=51`/`v=63` 命中；core 445 行≤470；html 63 行；报告追加完成。

## 九、蔡总10-05反馈修复(kimi)
### A. 库层真挖孔
- `props.js` `PROPS.board_with_hole` 改用模块级离屏缓冲 `PROPS._boardBuf`；`clearRect`→`drawImage`→`destination-out` 真抠穿→`source-atop` 画孔缘内阴影环（`rgba(0,0,0,.25)`，宽 `hr*0.12`）。
- `noHole=true` 直接画 sprite；孔位/孔径/angle/dir 包裹不变。

### B. 光轴锁定
- `LOCKED={candle:1,board1:1,screen:1}`；`constrain` 强制 y=`benchTopY()`；`pointerup` 不进 falling；`tick` 跳过支撑重检；`__c4s2dbg.place` 落位后强制 y=`benchTopY()`。
- 高度重标：screen `0.52→0.60`、board `0.34→0.417`、candle `0.24→0.275`，使火焰/孔心/屏心共轴。
- 轴高公式：`axisH=0.30H`，`axisY=benchTopY()-axisH`；三件同 active 时画主光轴虚线 `rgba(100,116,139,.5)` dash `[6,6]`。

### C. 托盘减槽
- `SLOTS` 删 `board2`/`board3`，改 6 槽两行三列（x=40/110/180, y=60/122, fit=56）；`NAT`/`TYPE` 同步删除。
- 激光准直阶段三改用单板方案：本单未实现，留后续处理。

### 版本与自查
- gallery `props.js?v=37`；exp-shadow `props.js?v=52`、`core.js?v=64`；core 第 3 行 `SPRITE_VER=64`。
- `node --check` props/core 双过；`destination-out` 命中；`board2|board3`=0；`LOCKED` 6 处；`axisY|axisH` 3 处；`PROPS.`=13≥12；core 464 行≤480；html/gallery 版本全命中；报告追加完成。

## 十、阶段三交互重构(kimi)
1. 默认摆好：initMedia 后 `setDefaultLayout()` 置 mode='pinhole'，candle/board1/screen 分别落位 `0.22W/0.50W/0.80W` 的 `benchTopY()`，其余 stored，全 lit=false。
2. 模式切换：html 控制区新增 `grp-mode` radio（pinhole/hand）；`switchMode(to)` 用 `flys[]` 驱动 0.6s tween，退场向上 easeInQuad 飞出、进场从台下 easeOutCubic 飞入；screen 不动，同模式点 radio 无动作。
3. 台灯朝向：hand 模式下 desk_lamp 传 `dir:'left'` 水平翻转朝右；`bulbPos` 对 flipped 灯用 `fx=1-0.40=0.60`。
4. 圆锥光带：hand 模式且 lamp.lit 时画 P→手 bbox→屏面外推的渐变多边形 + 两条边缘线，画在影子前。
5. 黑手影：删除 `handShadowShape`，改用 `PROPS.hand_shadow(ctx,faceX,SyC+handH/2,{h:handH})` 黑版 sprite，clip 屏面梯形，globalAlpha=0.92。
6. 背景换色：`props.js` `PROPS.bench` 支持 `opt.tone='cool'` 冷灰蓝系；core `draw()` 传 `{tone:'cool'}`；页面 body/header 背景改为 `#e8f1f8`。
7. 附带小修：`setPointerCapture` 包 try/catch；hint 按 mode 分支；`grp-hole` 仅在 pinhole+有孔板时显示；hand 读数只显 m+u；版本对齐 `SPRITE_VER=65`/html `v53+v65`/gallery `v38`。

### 自查结果
- `node --check` props.js / core.js 双过；`tail -n 1 core` 为 `})();`。
- `grep -n "tone" props.js bench 段命中；`grep -c "handShadowShape" core`=0。
- `grep -n "dir:'left'\|dir: 'left'" core`≥1；`grep -n "flys" core`≥4；html `name="mode"` 命中。
- `grep -n "tone:'cool'\|tone: 'cool'" core`≥1；`grep -c LOCKED core`≥5。
- 版本三处命中；core 行数 ≤560。

## 十一、亮度公式修正(kimi)
- 默认摆好下光斑不可见，根因为 `bright=Math.pow(14/blurD,2)*0.9` 使 alpha 摊薄到底。
- 改为 `bright=Math.min(1,Math.max(0.12,Math.pow(holeD/24,2)))`，通光量∝孔面积，n 层公式不动。
- 版本对齐 `SPRITE_VER=66`、html `core.js?v=66`。

## 十二、光斑确定性与箭头外移(kimi)
- 光斑：废止 `Math.random()` 随机偏移，改核心层 alpha=0.55×bright + 7 层确定性模糊环，闪烁消除。
- 箭头：`drawCueingArrows` 基准 x 从 `sg.cx` 移到 `sg.pts.TR.x+20`，避开屏面像区。
- 版本对齐 `SPRITE_VER=67`、html `core.js?v=67`。

## 十三、resize重排+亮度参考(kimi)
- `resize()` 捕获旧 W/H，对 active/falling 器材按新舞台重算尺寸与坐标；LOCKED 件坐新 `benchTopY()` 并保持相对 x；hand 按比例缩放 x/y。
- 亮度基准改 `holeD/16`，默认孔径约 12.5px 时 bright≈0.61，最小 0.25 兜底仍可见。
- 版本对齐 `SPRITE_VER=68`、html `core.js?v=68`。

## 十四、手默认位=灯泡高(kimi)
- switchMode 手进场目标 y 改为灯泡高 + 手半高，使默认黑手影落在屏面中心。
- 版本对齐 `SPRITE_VER=69`、html `core.js?v=69`。

## 十五、手飞入落位三修(kimi)
- 新增 `lampBulbWorldY()` 用舞台尺寸预测灯泡世界 y，手进场目标 y=灯泡高+手半高，不再误用 stored 态缩略值。
- fly 完成分支对手跳过 `constrain()`。
- tick falling 与支撑重检加 `m.t!=='hand'` 守卫，手永不坠落。
- 版本对齐 `SPRITE_VER=70`、html `core.js?v=70`。

## 十六、倒像/光线/火焰像五修(kimi)
- 火焰像改真实倒立：以 tipImgY/baseImgY 为上下端，通过 `scale(1,-1)` 绘制；核心层用 #fff7d6→#ffb703→#ff7b00 线性渐变，coreAlpha=0.30+0.62×bright 封顶 0.92。
- 光线改两条单一直线段：tip物→tip像、base物→base像，颜色 `rgba(245,158,11,0.85)`、实线 2px；光锥颜色不动。
- 版本对齐 `SPRITE_VER=71`、html `core.js?v=71`。

## 十七、孔径读数口径(kimi)
- 读数面板孔径行由 `holeR*2` 改为 `holeR+'px'`，与滑杆数值一致。
- 版本对齐 `SPRITE_VER=72`、html `core.js?v=72`。

## 十八、模糊叠印+等比缩放(kimi)
- 新增 `makeFlameBuf()` 离屏缓冲，按像高 `hi` 等比绘制火焰本体（w=hi×0.55，禁用再乘 `m`），避免像被额外拉伸。
- 主画布以 sunflower 黄金角 `2.399963` 叠印 n 层虚影，大孔 blurD 大 → 偏移层多、中心饱和，像亮而糊；小孔偏移收敛，像清晰。
- bright 下限由 0.25 提到 0.35，保证极小孔像仍可见。
- 版本对齐 `SPRITE_VER=73`、html `core.js?v=73`。

## 十九、最小孔清晰/删托盘/删箭头(kimi)
- `computePinholeScene` 新增 `blurEff`：孔径较小时按 `(holeR-6)/34` 的 1.35 次幂压缩模糊半径，holeR=8 时 blurEff≈0 → 单印锐利；孔大时恢复全模糊。
- 删除工具托盘绘制与命中逻辑：`toolbox.drawCard`、`pointInCard`、`rectInCard`、`hitSlot` 全部移除；器材从不可见状态飞入的逻辑保留。
- 删除绿色提示箭头 `drawCueingArrows` 及 `wasDraggedScreen` 相关代码。
- 版本对齐 `SPRITE_VER=74`、html `core.js?v=74`。

## 二十、stored不画(kimi)
- `drawMedia` 循环开头跳过 `state==='stored'`，确保托盘背景删除后残留缩略图不再渲染。
- 版本对齐 `SPRITE_VER=75`、html `core.js?v=75`。

## 廿一、真火焰+激光准直取消(kimi)
- 新增 `getFlameImg()` 从 `candle.png` 抠真火焰区建 `_flameBuf`；`drawCandleWithFlame` 烛体画未点燃版，点燃后叠真火焰，根部为轴正弦摆动。
- `flamePos` 按真火焰高度返回 tip/baseY；`drawShadow` pinhole 分支改用真火焰缓冲倒立等比绘制。
- 删除 `drawFlamePath`/`drawCandleFlame` 假火焰几何；删除 `btn-align`/`alignAnim` 一键对齐按钮与逻辑。
- 版本对齐 `SPRITE_VER=76`、html `core.js?v=76`。

## 廿二、模式快切fly去重(kimi)
- 复现机制：0.6s fly 期间再点模式 radio，同器材旧 out 条目完成后会把 state 覆盖成 `stored`；因托盘已删，stored 不画不可点，器材“死掉”。
- `switchMode` 两处 `flys.push` 前均用 `flys.filter` 去重同一器材旧条目，避免并发 fly。
- `tick` fly 完成分支加 `hasNewer` 保险：同器材存在其它条目时只 splice 不改 state，确保只有最新 fly 生效。
- 版本对齐 `SPRITE_VER=77`、html `core.js?v=77`。

## 廿三、素材注册表名修正+loop防死(kimi)
- 根因：`getFlameImg` 误用编造名 `PROPS._sprites['candle']`，实际 API 为 `PROPS.spriteReady(id)` / `PROPS.img(id)`；点燃后首帧抛 TypeError → 渲染循环死亡 → 冻结半画帧骗过前两轮验收。
- 修正为 `PROPS.spriteReady('candle')` 检测、`PROPS.img('candle')` 取图。
- `loop()` 加 try/catch，绘制异常只降级缺画+console 留痕，不再杀死 requestAnimationFrame。
- 版本对齐 `SPRITE_VER=78`、html `core.js?v=78`。

## 廿四、蜡烛加高火焰齐轴(kimi)
- `stageSize` 中蜡烛高度系数由 0.275 提至 0.30，火焰顶端（0.742 烛体顶 + 0.23 火焰高）可齐平或略超中轴线。
- 版本对齐 `SPRITE_VER=79`、html `core.js?v=79`。

## 廿五、蜡烛系数0.32(kimi)
- `stageSize` 中蜡烛高度系数由 0.30 提至 0.32，火焰顶端高出中轴线约 0.011H，符合“超过一点”。
- 版本对齐 `SPRITE_VER=80`、html `core.js?v=80`。

## 廿六、全屏开关态(kimi)
- `btn-full` 文案改为开关态：全屏/退出全屏；click 分支根据 `fullscreenElement` 调用进入/退出。
- `fullscreenchange` 监听内调 `syncFullBtn()`，初始化末尾也调一次，Esc 退出同步。
- 版本对齐 `SPRITE_VER=81`、html `core.js?v=81`。

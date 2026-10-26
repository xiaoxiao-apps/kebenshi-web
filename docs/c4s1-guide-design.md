# c4s1 双实验语音讲解层设计书（光在介质中的直线传播 + 光影成像实验室）

> 目标页面：`content/physics_g8_v1_c4_s1/exp-medium.html`（§A）与 `content/physics_g8_v1_c4_s1/exp-shadow.html`（§B）
> 规范依据：`可交互教材/实验语音讲解层改造规范-B版标配.md`（2026-10-26 定稿，下称「规范」）；格式参照 `docs/c4s3-guide-variants-design.md`。
> 物理口径权威源：本节 `explain.html`（光在同种均匀介质中沿直线传播；烟雾/滴牛奶的水/玻璃砖三介质实验；影子=光被挡住的黑暗区域；小孔成像=倒立实像、光路在小孔处交叉、物近孔像变大；「手近灯 → 影变大」为 core 读数面板原文）。本文案与其零冲突。
> 行号基线（2026-10-26 实测）：`exp-medium-core.js` 436 行、`exp-shadow-core.js` 554 行。所有 trigger 字段逐一对照源码核实，禁臆造。
> 本文档为纯设计产出：**零代码改动、零 git 操作**。§-1 的暴露代码块与 §5 的 guide-data 均为「待开发单落地」的设计稿。

---

## §0 总览

| 项 | §A 光在介质中的直线传播 | §B 光影成像实验室 |
|---|---|---|
| 页面 | exp-medium.html | exp-shadow.html |
| core | exp-medium-core.js（436 行） | exp-shadow-core.js（554 行） |
| 状态暴露对象（本设计新增） | `window.C4S1M` | `window.C4S1S` |
| guide-data 对象 | `window.C4S1M_GUIDE` | `window.C4S1S_GUIDE` |
| mode key（统一） | `refract` | `refract` |
| clip id 前缀 | `c4s1m-` | `c4s1s-` |
| steps / errors / free / clips | 6 / 2 / 3 / 12 | 7 / 2 / 3 / 13 |

约定与共用规则：

1. **trigger 表达式一律 `R.` 前缀**：引擎 `engine-core.js` 用 `new Function('R','G',...)` 求值（L47），`R = window.GUIDE_CFG.state`（L12）。本文 `R.xxx` 即暴露对象的 getter（§A-1 / §B-1）。
2. **两页均为单模式页**：`window.GUIDE_CFG={mode:'refract', state:window.C4S1M|C4S1S}` 钉死 mode，数据 key 统一 `refract`。注意 §B 的 `R.mode`（'pinhole'|'hand'）只是**普通状态字段**，不是引擎 mode——引擎 mode 以 `GUIDE_CFG.mode` 优先（engine-core.js L360），不会因切手影而触发 onModeEnter 重播 intro。
3. **全部 steps `repeat:true`**（规范 §2.2），3s 冷却防刷屏；零 `delay:` 型步骤（规避 delayFired 风险面）；零一次性 saidFlag；零 `G.*` 依赖（引擎 G 字段采集是 c4s3 专属，本页 trigger 只用 R.*，G.t 亦不引用）。
4. **结论条** `after:锚点@6000`（规范 §2.4，延时 ≥6s 防即时打断砍腰）。锚点=主线完成步（§A=m-s5，§B=s-s2，理由见各节）。
5. **已知引擎限制（开发单前置改造项）**：
   - `bindEventTriggers()`（engine-core.js L280~300）目前**写死** `#btn-rec`/`#obj-slider` 两个选择器。本设计用到 `event:click:#btn-play`、`event:input:#rng-turbid`、`event:input:#hole-slider` → 开发单须把绑定改为**数据驱动**（扫描 `DATA[curMode]` 全部 `event:` trigger，按「选择器+事件类型」去重绑定），并保持 c4s3 回归零变化（规范 §3.4 共享文件纪律）。
   - **`repeat:true` + `@hold` 组合禁用**：tickSteps 的 hold 分支要求触发帧 `!rPrev`（engine-core.js L177~186），条件持续为真时 rPrev 恒真 → 永不触发。本设计 steps 零 `@hold`；`@hold` 只用于 errors（tickErrors 路径正常，c4s3 判例 m2-e2/m3-e3 已验证）。
6. **暴露对象纪律**：`GUIDE_CFG.state` 在引擎加载时捕获一次，暴露对象必须**原地稳定、只加 getter、永不重赋值**（同 c4s3 的 window.MRR）。getter 惰性求值，core 内部照旧直接改闭包变量，零行为影响。

---

# §A 「光在介质中的直线传播」 exp-medium.html

## §A-1 状态暴露核查（最关键一节）

### A-1.1 现状

- **无干净的 window 状态对象**。现有全局仅两个：
  - `window.muted`（L381，🔊 按钮翻转，音效静音位）——与讲解层无关；
  - `window.__c4s1dbg`（L435，调试钩子：media/pen getter、place()、penOn() 等）——复验工具，**不作为讲解层契约**（命名即声明临时性，且缺派生字段）。
- 真实状态全部是 IIFE 闭包散变量（`var pen=...`、`var media=[]`、`var angle=...` 等），语音层无法轮询 → 必须做最小暴露。

### A-1.2 闭包状态字段速查表（grep 核实，字段名与 core.js 完全一致）

| 闭包变量 | 行号 | 类型 / 取值 | 含义 | 变更点（行号） |
|---|---|---|---|---|
| `pen` | L7 | `{x:number, y:number, h:70, on:bool}` | 激光笔位置与**光源开关** | `pen.on` 翻转：L370（点笔身按钮，位移<5px 判点击）；置 true：L378（`#btn-play`）；置 false：L380（`#btn-reset`）。`pen.x/y`：L350（movePen 拖动） |
| `showRay` | L8 | bool，初始 true | 光线符号（介质段绿色箭头，drawArrows L233） | L377 `#cb-ray` change |
| `paused` | L8 | bool | 暂停绘制（loop L~300：paused 时仅有动作才 draw） | L379 `#btn-pause` |
| `pulse` | L8 | `{on:bool, t0:number}` | 「播放光点」行进光斑动画 | 置 on：L378 `#btn-play`；**自动复位**：L238（drawPulse 光点走完置 `pulse.on=false`）→ 每按一次产生一个新边沿 |
| `initialAngle` / `angle` | L11 | 弧度，钳制 ±A_MAX=35°（L6） | 笔身倾角（rotate 手势） | L349（pointermove k='rotate'）；复位 L380 |
| `media` | L17 | 数组恒 3 项：`{id:'smoke_box'\|'water_tank'\|'glass_brick', t:'smoke'\|'water'\|'glass'(typeOf L21), n:1\|1.33\|1.5(nOf L22), state, x, y, w, h, ...}` | 三件介质器材 | `state` 迁移：'stored'→'active' L336（从托盘拖出）；'falling' L367（松手未回卡）；落地回 'active' L419；'returning' L365（扔回托盘卡）；归位 'stored' L412 |
| `dragInfo` | L18 | `null` 或 `{k:'med'\|'btn'\|'rotate'\|'movePen',...}` | 当前拖动手势 | L327 pointerdown 置位 / L357+ pointerup 清 null |
| `turbidity` | L265 | 0..1，初始 0 | 水浑浊度（影响水中光路散射亮度） | L273~274 `#rng-turbid` input（value/100） |
| `W` / `H` | L5 | px | 画布逻辑尺寸 | resize L49 |

派生量（函数，非状态，暴露层可包 getter）：`emitPt()` L51（出光口坐标）、`computePath(p0,a0)` L95 → `segs[{a,b,t:'air'|'smoke'|'water'|'glass',n,m}]`（空气段 t='air' 不绘制光束——**这就是「没器材时开了灯也看不见光路」的出处**，drawBeamSeg L~190 首行 `if(t==='air') return;`）。

### A-1.3 最小暴露方案

**位置**：`exp-medium-core.js` **L435（`window.__c4s1dbg={...};` 整行）之后、L436 `})();` 之前**插入（此时 pen/media/angle/turbidity/pulse/paused 均已声明，getter 闭包捕获即可，无需搬动任何既有代码）：

```js
/* 语音讲解层状态暴露（设计书 docs/c4s1-guide-design.md §A-1.3；只读 getter 门面，引擎轮询；对象永不重赋值） */
function mediaOnStage(id){for(var i=0;i<media.length;i++){var m=media[i];if(m.id===id&&(m.state==='active'||m.state==='falling'))return true;}return false;}
window.C4S1M={
  get laserOn(){return pen.on;},
  get pulseOn(){return pulse.on;},
  get paused(){return paused;},
  get angleDeg(){return Math.round(angle*180/Math.PI);},
  get turbidity(){return turbidity;},
  get activeCount(){var n=0;for(var i=0;i<media.length;i++){var s=media[i].state;if(s==='active'||s==='falling')n++;}return n;},
  get smokeOn(){return mediaOnStage('smoke_box');},
  get waterOn(){return mediaOnStage('water_tank');},
  get glassOn(){return mediaOnStage('glass_brick');}
};
```

**字段对照（trigger 路径 ↔ 闭包源头）**：

| trigger 用 | getter | 闭包源头 | 出处 |
|---|---|---|---|
| `R.laserOn` | `pen.on` | pen | L7 / L370 / L378 / L380 |
| `R.pulseOn` | `pulse.on` | pulse | L8 / L378 / L238 |
| `R.paused` | `paused` | paused | L8 / L379 |
| `R.angleDeg` | `Math.round(angle*180/Math.PI)` | angle | L11 / L349（±35°，L6） |
| `R.turbidity` | `turbidity` | turbidity | L265 / L273~274 |
| `R.activeCount` | 统计 state∈{active,falling} | media | L17 / L336 / L367 / L419 |
| `R.smokeOn` / `R.waterOn` / `R.glassOn` | 对应 id 在台（active/falling） | media | 同上；id 常量出处 L15（toolbox items）、L21（typeOf） |

## §A1 steps（6 条，含 1 条结论；全部 repeat:true）

引导主线（与 intro 文案一致）：摆烟雾箱 → 开激光笔（空气/烟雾中直线）→ 换水箱（水中直线）→ 换玻璃砖（玻璃中直线）→ 按「▶ 播放光点」→ 结论。
「介质切换对比」不单列条目：s3/s4 文案即切换对比（「换到水里」「玻璃砖里」），避免同帧双边沿打架（见 §A4），对比总结由结论条收口。

| id | repeat | trigger | 核实出处 | say（≤25字） | audio |
|---|---|---|---|---|---|
| m-s1 | true | `R.smokeOn===true && R.laserOn===false` | smokeOn=media[smoke_box].state∈{active,falling}（L336 拖出台）；laserOn=pen.on（L7） | 烟雾箱摆好啦，接下来打开激光笔。 | c4s1m-s1 |
| m-s2 | true | `R.smokeOn===true && R.laserOn===true` | pen.on 翻转 L370（点笔身按钮）/ L378（btn-play）；烟雾中光束可见=drawBeamSeg t='smoke' 分支 | 看，烟雾里的光路，是一条笔直的线。 | c4s1m-s2 |
| m-s3 | true | `R.waterOn===true && R.laserOn===true` | water_tank 上台 L336；水中光路 drawBeamSeg t='water'；口径=explain「射入滴了几滴牛奶的水中，光路仍是直线」 | 换到水里：光在水下也走直线。 | c4s1m-s3 |
| m-s4 | true | `R.glassOn===true && R.laserOn===true` | glass_brick 上台 L336；t='glass' 分支；口径=explain「射入玻璃砖，光路照样笔直」 | 玻璃砖里，光路照样笔直。 | c4s1m-s4 |
| m-s5 | true | `R.pulseOn===true` | pulse.on=true 仅 L378 `#btn-play`；L238 自动复位保证每次点击都是新边沿 | 放出光点，看它沿着直线一路跑过去。 | c4s1m-s5 |
| m-concl | true | `after:m-s5@6000` | 锚点=m-s5（引导主线最后一步；引擎 after: 解析 engine-core.js L35，依赖 fireCount L126） | 因此我们得出结论：光在同种均匀介质中沿直线传播。 | c4s1m-concl |

> 口径核对：结论句与 explain.html「光在**同种均匀介质**中沿直线传播」逐字一致；步骤文案只说各介质内「直线/笔直」，不提界面偏折（折射非本节口径）。

## §A2 errors（2 条，「不对哟～」系）

| id | trigger | 核实出处 | fix（橙色纠错） | audio |
|---|---|---|---|---|
| m-e1 | `R.laserOn===true && R.activeCount===0@2000` | activeCount=0 → computePath 全 air 段（L95~110），drawBeamSeg air 直接 return（不画）→ 开了灯什么都看不见；@2000 持续判定（tickErrors hold 路径，engine-core.js L212~224）+ 5s 节流 | 不对哟～空气里的光路看不见，先摆上烟雾箱。 | c4s1m-e1 |
| m-e2 | `event:click:#btn-play:R.activeCount===0` | `#btn-play` L378（html exp-medium.html 控件区第一个按钮）；capture 即时判态（引擎 L~285，需按 §0.5 扩数据驱动绑定） | 别急哟～桌上没器材，光点没处显形，先摆烟雾箱。 | c4s1m-e2 |

> 刻意不做的纠错：没开灯就摆器材（不算错，m-s1 会引导开灯）；器材扔回托盘（正常收纳，state='returning' L365 不判错）。

## §A3 free（3 条，全部带 audio + 状态闸门）

| # | trigger | 闸门说明 | note（中性观察，≤25字） | audio |
|---|---|---|---|---|
| m-f1 | `event:input:#rng-turbid:R.waterOn===true` | 事件型带表达式闸门：水箱不在台时拖滑杆不出声（滑杆本身也随 updateTurbidUI L268~272 隐藏，双保险）；口径=explain「滴了几滴牛奶的水」 | 水里加点牛奶，光路会更清楚哦。 | c4s1m-f1 |
| m-f2 | `R.laserOn===true && Math.abs(R.angleDeg)>=25` | 闸门 laserOn：没开灯转笔不出声；angle 钳制 ±35°（L6/L349），25° 可达、边沿触发 | 笔身歪一歪，光线还是一条直线。 | c4s1m-f2 |
| m-f3 | `R.paused===true && R.laserOn===true` | 闸门 laserOn：空台按暂停不出声；paused L379 翻转=边沿 | 暂停啦，慢慢看这条光的路线。 | c4s1m-f3 |

## §A4 已知边界情况（验收时按此预期，不算 bug）

1. **激光关着直接按「▶ 播放光点」**：btn-play 一个动作同时置 `pen.on=true`+`pulse.on=true`（L378）→ m-s2 与 m-s5 同帧双边沿。引擎同帧只发数组序第一条（tickSteps 触发即 return），下一帧发第二条并按即时打断制接管（规范 §2.1）——最终听到的是 m-s5，m-s2 被截。发生率低（intro 已引导先开灯再播光点），接受；不为此加 hold（repeat+hold 组合引擎不触发，见 §0.5）。
2. `pulse.on` 走完自动复位（L238）→ 重复按 btn-play 每次都是新边沿，m-s5 可重复播报（3s 冷却内不刷屏），符合规范 §2.2。
3. 器材「falling」下落瞬间即计入 smokeOn/waterOn/glassOn（active|falling），播报略早于落定 ~百 ms，观感自然，不做 hold。

---

# §B 「光影成像实验室」 exp-shadow.html

## §B-1 状态暴露核查

### B-1.1 现状

- **无干净的 window 状态对象**。现有全局仅：`window.muted`（L477）、`window.__c4s2dbg`（L546~552，调试钩子；其 `get v()` L551 引用了不存在的 `screenPlane`，一调即抛——**再次证明 dbg 不可当契约**，讲解层不用它）。
- 状态是闭包散变量（mode/media/holeR/rayOn/dragInfo/flys）+ 三个派生场景函数（computeHandScene/computePinholeScene/computeScene）。**派生函数返回值极适合做 trigger 闸门**（missing/ok/m 一站式），暴露层直接包 getter。

### B-1.2 闭包状态字段速查表

| 闭包变量 | 行号 | 类型 / 取值 | 含义 | 变更点（行号） |
|---|---|---|---|---|
| `mode` | L25 | `'pinhole'` \| `'hand'`，初始 'pinhole' | 实验模式（小孔成像/手影游戏） | L474~475 radio change → switchMode L71（mode=to L~97；器材飞行 600ms，L79/L90 置 'flying'） |
| `media` | L19 | 数组恒 6 项：`{id:'candle'\|'desk_lamp'\|'hand_shadow'\|'board1'\|'screen'\|'laser_pen', t(TYPE L11):'candle'\|'lamp'\|'hand'\|'board'\|'screen'\|'laser', lit:bool, state, x, y, w, h}` | 器材 | `lit` 翻转：L454（点击位移<5px 且 t∈{lamp,candle}）；`state`：'flying' L79/L90，飞行结束 'active'/'stored' L508~514；'falling' L449；落地 'active' L~524 |
| `LOCKED` | L12 | `{candle:1, board1:1, screen:1}` | 三件 y 锁桌面、只可横拖（constrain L~130） | 常量 |
| `rayOn` | L23 | bool，初始 true | 光线符号（drawRays 仅 pinhole 成像时画两条过孔交叉线） | L467 `#cb-ray` change |
| `holeR` | L24 | 8..40 偶数，初始 14 | 小孔孔径 px | L469 setHole（滑杆 L470 `#hole-slider`、± 钮 L471~472）；控件仅 pinhole+孔板在台可见（updateCtrlVisibility L473） |
| `dragInfo` | L20 | `null` \| `{k:'med', m}` | 当前拖动 | L425 pointerdown / L441 pointerup |
| `flys` | L26 | 数组 | 切模式飞行动画队列 | switchMode L79~94 / stepPhysics L500~518 |
| `W`/`H` | L5 | px | 画布尺寸 | resize L~105 |

**派生场景（trigger 闸门主力，全部纯函数、每帧可重复调用）**：

| 函数 | 行号 | 返回值（核实逐字段） |
|---|---|---|
| `computeHandScene()` | L211 | `null`（灯/手/屏任一不在台）；`{missing:'lampOff',...}`（灯未点亮）；`{missing:'handNoImg',...}`（手不在灯与屏之间）；`{mode:'hand', missing:null, ok:true, P, Ht, Sx, m, Sy, sg}`（m=放大率=(Sx−P.x)/(Ht.x−P.x)，手越近灯 m 越大；读数面板副题「手近灯 → 影变大」L~334） |
| `computePinholeScene()` | L224 | `null`（蜡烛/孔板/屏任一不在台）；`{missing:'candleOff'}`（烛未点燃）；`{missing:'candlePos', u<=0}`（蜡烛跑到孔右侧）；`{missing:'boardPos', v<=0}`（屏在孔板左侧）；`{mode:'pinhole', missing:null, ok:true, u, v, m, hi, holeD, blurD, blurEff, bright}`（m=v/u：物近孔→u 小→像大；读数面板副题「孔小像清、孔大像亮」L~336） |
| `computeScene()` | L240 | `computePinholeScene() \|\| computeHandScene()`（pinhole 模式下手影件不在台 → pinhole 分支返回对象；hand 模式下烛/板已收回 → pinhole 分支返回 null，落到 hand 分支） |
| `findById(id)` | L137 | media 按 id 查件 |

**默认布局（setDefaultLayout L58~70，决定阈值可行性）**：pinhole 模式；candle@0.22W、board1@0.50W、screen@0.80W 均 active，其余 stored；一切 lit=false → **开机 scene.missing='candleOff'**（这就是首屏 hint「点击蜡烛点燃」）。此时 m=v/u≈0.30W/0.28W≈1.07（W=960 时 u≈270px、v≈290px），故 §B1 的 m≥1.4 / m≤0.7 阈值都必须**真实拖动**才可达（蜡烛右移 ~60px / 左移 ~145px；屏也可横拖改 v）。手影默认（switchMode L84~88）：lamp@0.22W、hand@0.50W → m≈0.58W/0.28W≈2.07，阈值 2.6（手左移 ~55px）/1.7（手右移 ~65px）同理需真实拖动。

### B-1.3 最小暴露方案

**位置**：`exp-shadow-core.js` **L552（`window.__c4s2dbg={...};` 的收尾 `};`）之后、L553（`initMedia(); setDefaultLayout(); ...`）之前**插入（findById/computeScene 等已声明；getter 惰性求值，media 在 L553 才填充也不影响）：

```js
/* 语音讲解层状态暴露（设计书 docs/c4s1-guide-design.md §B-1.3；只读 getter 门面，引擎轮询；对象永不重赋值） */
window.C4S1S={
  get mode(){return mode;},
  get rayOn(){return rayOn;},
  get candleLit(){var m=findById('candle');return !!(m&&m.lit&&(m.state==='active'||m.state==='falling'));},
  get scene(){return computeScene();},
  get imgM(){var sc=computePinholeScene();return sc&&sc.ok?sc.m:null;},
  get handM(){var sc=computeHandScene();return sc&&sc.ok?sc.m:null;}
};
```

**字段对照（trigger 路径 ↔ 闭包源头）**：

| trigger 用 | 含义 | 源头 |
|---|---|---|
| `R.mode` | 'pinhole'\|'hand' | mode L25 / switchMode L71 |
| `R.rayOn` | 光线符号开关 | rayOn L23 / L467 |
| `R.candleLit` | 蜡烛在台且点燃 | media.lit L454 + state |
| `R.scene` | 当前场景对象（null / missing / ok） | computeScene L240 |
| `R.scene.missing` | 'candleOff'\|'candlePos'\|'boardPos'\|'lampOff'\|'handNoImg' | L226~232 / L215~219 |
| `R.imgM` | 小孔成像放大率（成像 ok 才有值，否则 null） | computePinholeScene.ok/m L236~238 |
| `R.handM` | 手影放大率（同上） | computeHandScene.ok/m L221 |

> 性能：引擎每 rAF 轮询会把 computeScene 系函数多调 1~3 次；均为纯几何运算（draw() 本来就每帧调 computeScene L~370），无累积状态，可忽略。
> `lampLit`/`holeR`/`dragInfo` 本次 trigger 未用到，不暴露（最小化原则）；后续加 free 再扩。

## §B1 steps（7 条，含 1 条结论；全部 repeat:true）

主线（pinhole 默认模式）：点燃蜡烛（倒立像出现）→ 拖近蜡烛（像变大）→ 拖远蜡烛（像变小）→ 结论；分支（hand 模式）：切手影 → 点灯出手影 → 手近灯影变大。

| id | repeat | trigger | 核实出处 | say（≤25字） | audio |
|---|---|---|---|---|---|
| s-s1 | true | `R.candleLit===true && R.imgM!==null` | 点燃 L454；imgM≠null ⇔ computePinholeScene ok（默认几何 u>0,v>0，点燃即成像）；口径=explain「板后的屏上会出现一个倒立的火焰像」 | 点着啦！光屏上的火焰像，居然是倒立的！ | c4s1s-s1 |
| s-s2 | true | `R.imgM!==null && R.imgM>=1.4` | m=v/u（L236~238）；默认 m≈1.07（§B-1.2 布局核算），1.4=真实拖近蜡烛（或右移屏）才达；口径=explain「物离孔越近、屏离孔越远，像越大」 | 蜡烛靠近小孔，屏上的像变大了。 | c4s1s-s2 |
| s-s3 | true | `R.imgM!==null && R.imgM<=0.7` | 同上反向；0.7=蜡烛左移 ~145px 可达（constrain 允许到 x≈40） | 蜡烛移远，像又缩小了，还是倒立的。 | c4s1s-s3 |
| s-s4 | true | `R.mode==='hand'` | mode 翻转 L474~475→switchMode L71；飞行 600ms 期间其余闸门全 null，不会抢话 | 手影模式！台灯和小手替换了蜡烛。 | c4s1s-s4 |
| s-s5 | true | `R.mode==='hand' && R.handM!==null` | handM≠null ⇔ 灯亮+手在灯屏之间（computeHandScene ok L221）；灯未亮时 missing='lampOff' 静默等待；口径=core hint「光锥罩住手，光幕现黑手影」 | 台灯点亮，光幕上出现黑黑的手影。 | c4s1s-s5 |
| s-s6 | true | `R.handM!==null && R.handM>=2.6` | m=(Sx−P.x)/(Ht.x−P.x)（L219）；默认 ≈2.07，2.6=手真实移近灯；口径=读数面板「手近灯 → 影变大」（L~334） | 手越靠近台灯，影子变得越大！ | c4s1s-s6 |
| s-concl | true | `after:s-s2@6000` | 锚点=s-s2。**不锚数组最后一步 s-s6 的原因**：pinhole 是默认主线、s-s2 是主线完成步（近大规律=explain 成像特点核心句）；锚 s-s6 会让只玩小孔成像（多数路径）的学生永远听不到结论（r3 判例：流程走完没结论被点名）。手影分支的规律由 s-s6 文案自带收口。口径=explain「倒立的实像，能用屏承接」 | 因此我们得出结论：光沿直线传播，穿过小孔成的是倒立的实像。 | c4s1s-concl |

> 口径核对：s-s1「倒立」、s-concl「倒立的实像」与 explain.html 三、小孔成像逐字对齐；「实像」仅出现在结论（能承接=屏上可见，学生已亲眼看屏）。影子 vs 像的区分（一个缺光一个有光）不进 25 字短条，留给 explain 页。
> 可选扩展（验收后蔡总点头再加）：手影双结论 `s-concl2: after:s-s6@6000`「光沿直线传播，被手挡住就形成影子；影子和像不一样，一个缺光、一个有光。」

## §B2 errors（2 条，「不对哟～」系；@hold 只用于 errors）

| id | trigger | 核实出处 | fix（橙色纠错） | audio |
|---|---|---|---|---|
| s-e1 | `R.mode==='pinhole' && R.scene && (R.scene.missing==='candlePos' \|\| R.scene.missing==='boardPos')@1500` | missing='candlePos' ⇔ u<=0（蜡烛被拖到孔板右侧，L229~231）；'boardPos' ⇔ v<=0（屏在孔板左侧，L232~234）；@1500 持续判定避开拖拽路过瞬间；文案与 core hint「把带孔板放到蜡烛和屏之间」（hintFor L353）同口径 | 不对哟～带孔板要放在蜡烛和光屏中间。 | c4s1s-e1 |
| s-e2 | `R.mode==='hand' && R.scene && R.scene.missing==='handNoImg'@1500` | 'handNoImg' ⇔ 手不在灯与屏之间（Ht.x<=P.x 或 >=Sx，L217~219）；文案与 core hint「把手移到灯和屏之间，才能成像」（L361）同口径 | 不对哟～把手移到灯和屏之间，影子才会出现。 | c4s1s-e2 |

> 刻意不做的纠错：`missing==='candleOff'`/`'lampOff'`（未点燃**不是错误**，是开机默认态——若设为 error，落地即播且每 5s 唠叨一次；core hint 已引导「点击蜡烛点燃」，s-s1/s-s5 会在点亮瞬间接话）。

## §B3 free（3 条，全部带 audio + 状态闸门）

| # | trigger | 闸门说明 | note（中性观察，≤25字） | audio |
|---|---|---|---|---|
| s-f1 | `event:input:#hole-slider:R.imgM!==null` | 事件型带表达式闸门：没成像时拖孔径不出声（控件本身也只在 pinhole+孔板在台时可见，L473，双保险）；口径=读数面板「孔小像清、孔大像亮」（L~336，blurEff/bright 随 holeR 变，L235~238） | 孔小像清晰，孔大像更亮，看出区别了吗？ | c4s1s-f1 |
| s-f2 | `R.rayOn===false && R.imgM!==null` | 闸门 imgM：没成像时关光线不出声；rayOn 翻转 L467；口径=explain「光路在小孔处交叉，所以像上下颠倒」（drawRays 画的就是过孔交叉的两条线） | 光线符号关了，两条光线在小孔处交叉，还记得吗？ | c4s1s-f2 |
| s-f3 | `R.handM!==null && R.handM<=1.7` | 闸门 handM：灯灭/手出界不出声；默认 ≈2.07，1.7=手真实移远灯；与 s-s6（≥2.6）阈值区间互斥，不打架（规范 §2.5 禁条件重叠） | 手离灯越远，影子就越小。 | c4s1s-f3 |

## §B4 已知边界情况

1. **切模式 600ms 飞行窗**：media state='flying' → computeHandScene/computePinholeScene 均 null → 所有 R.scene/imgM/handM 闸门静默，只有 s-s4（mode 边沿）发声，落地后各步按新状态重新武装。无双边沿。
2. **点燃蜡烛一个动作同翻 candleLit 与 imgM**：已合并为单条 s-s1，无同帧双触发。
3. **手影模式把屏拖到手左侧**：Sx<Ht.x → missing='handNoImg' → s-e2 纠错（相对顺序表述仍成立）。
4. 孔径 ± 按钮（`#hole-minus`/`#hole-plus` L471~472）与滑杆同改 holeR，但 s-f1 只绑 `#hole-slider`；点 ± 不播报（可接受，滑杆是主操作；如需覆盖，开发单再加两条 event:click 同文案——引擎数据驱动绑定改造后零成本）。
5. `laser_pen` 在该页托盘里是摆设（computeScene 不引用），拖出无任何触发——不配文案，避免给「激光笔」在本节加戏。

---

## §4 音频 clip 清单（两实验合并，共 25 条）

估算规则同规范 §4.4：中文 TTS ≈4 字/秒 + 0.5s 尾静音，向上取整到 0.5s；**落地时一律 afinfo 实测替换**（预估普遍偏短）。音色 `zh-CN-XiaoxiaoNeural`、语速 1.0x；「～」发音为逗号停顿；「：」正常停顿；文件名=clip id+.mp3，存 `content/physics_g8_v1_c4_s1/guide/audio/`（新目录），每条落盘核 ≥2000 字节。

| clip id | 类别 | 文本 | 字数 | 预估秒数 |
|---|---|---|---|---|
| c4s1m-intro | intro | 欢迎来直线传播实验室！先把烟雾箱拖出来、打开激光笔，光路就看得见；再换水箱、玻璃砖比一比，按播放光点送光点跑一圈。 | 57 | 15.0s |
| c4s1m-s1 | step | 烟雾箱摆好啦，接下来打开激光笔。 | 16 | 4.5s |
| c4s1m-s2 | step | 看，烟雾里的光路，是一条笔直的线。 | 17 | 5.0s |
| c4s1m-s3 | step | 换到水里：光在水下也走直线。 | 14 | 4.0s |
| c4s1m-s4 | step | 玻璃砖里，光路照样笔直。 | 12 | 3.5s |
| c4s1m-s5 | step | 放出光点，看它沿着直线一路跑过去。 | 17 | 5.0s |
| c4s1m-concl | 结论 | 因此我们得出结论：光在同种均匀介质中沿直线传播。 | 24 | 6.5s |
| c4s1m-e1 | error | 不对哟～空气里的光路看不见，先摆上烟雾箱。 | 21 | 6.0s |
| c4s1m-e2 | error | 别急哟～桌上没器材，光点没处显形，先摆烟雾箱。 | 23 | 6.5s |
| c4s1m-f1 | free | 水里加点牛奶，光路会更清楚哦。 | 15 | 4.5s |
| c4s1m-f2 | free | 笔身歪一歪，光线还是一条直线。 | 15 | 4.5s |
| c4s1m-f3 | free | 暂停啦，慢慢看这条光的路线。 | 14 | 4.0s |
| c4s1s-intro | intro | 欢迎来到光影成像实验室！点亮蜡烛，看看屏上的火焰像长什么样；拖近拖远蜡烛，像会跟着变；再切到手影模式，拿小手玩光影。 | 58 | 15.0s |
| c4s1s-s1 | step | 点着啦！光屏上的火焰像，居然是倒立的！ | 19 | 5.5s |
| c4s1s-s2 | step | 蜡烛靠近小孔，屏上的像变大了。 | 15 | 4.5s |
| c4s1s-s3 | step | 蜡烛移远，像又缩小了，还是倒立的。 | 17 | 5.0s |
| c4s1s-s4 | step | 手影模式！台灯和小手替换了蜡烛。 | 16 | 4.5s |
| c4s1s-s5 | step | 台灯点亮，光幕上出现黑黑的手影。 | 16 | 4.5s |
| c4s1s-s6 | step | 手越靠近台灯，影子变得越大！ | 14 | 4.0s |
| c4s1s-concl | 结论 | 因此我们得出结论：光沿直线传播，穿过小孔成的是倒立的实像。 | 29 | 8.0s |
| c4s1s-e1 | error | 不对哟～带孔板要放在蜡烛和光屏中间。 | 18 | 5.0s |
| c4s1s-e2 | error | 不对哟～把手移到灯和屏之间，影子才会出现。 | 21 | 6.0s |
| c4s1s-f1 | free | 孔小像清晰，孔大像更亮，看出区别了吗？ | 19 | 5.5s |
| c4s1s-f2 | free | 光线符号关了，两条光线在小孔处交叉，还记得吗？ | 23 | 6.5s |
| c4s1s-f3 | free | 手离灯越远，影子就越小。 | 12 | 3.5s |

> 时长安全核对（即时打断制）：结论条 @6000 起播时，锚点条（m-s5≈5.0s / s-s2≈4.5s）已播完，不砍腰；两条结论（6.5s/8.0s）自身无后继条目，可完整播完。intro 15s 期间无 delay: 型步骤抢话（本设计零 delay 步骤），学生若抢先操作，按规范 §2.1 即时打断 intro——预期行为。

---

## §5 完整 guide-data.js（两份）

### 文件 A：`content/physics_g8_v1_c4_s1/guide/guide-data-m.js`（exp-medium.html 引用）

```js
'use strict';
/* c4s1「光在介质中的直线传播」exp-medium.html · 语音讲解层数据（B 版标配）
   设计书：docs/c4s1-guide-design.md §A/§4/§5，文案逐字照抄禁改写。
   状态源：window.C4S1M（exp-medium-core.js L435 后暴露的只读 getter 门面）。
   trigger 约定（engine-core.js parseTrigger）：
     "R.xxx" 表达式 / "expr@2000" 持续满足 / "after:id@6000" 依赖步后延时 /
     "event:click:#btn-play:EXPR"、"event:input:#rng-turbid:EXPR" 事件即时判态。
   mode key 统一 'refract'（单模式页，GUIDE_CFG.mode 钉死）。全部 steps repeat:true。 */
window.C4S1M_GUIDE={
  refract:{
    intro:{
      text:'欢迎来直线传播实验室！先把烟雾箱拖出来、打开激光笔，光路就看得见；再换水箱、玻璃砖比一比，按播放光点送光点跑一圈。',
      audio:'c4s1m-intro'
    },
    steps:[
      {id:'m-s1',repeat:true,trigger:"R.smokeOn===true && R.laserOn===false",say:'烟雾箱摆好啦，接下来打开激光笔。',audio:'c4s1m-s1'},
      {id:'m-s2',repeat:true,trigger:"R.smokeOn===true && R.laserOn===true",say:'看，烟雾里的光路，是一条笔直的线。',audio:'c4s1m-s2'},
      {id:'m-s3',repeat:true,trigger:"R.waterOn===true && R.laserOn===true",say:'换到水里：光在水下也走直线。',audio:'c4s1m-s3'},
      {id:'m-s4',repeat:true,trigger:"R.glassOn===true && R.laserOn===true",say:'玻璃砖里，光路照样笔直。',audio:'c4s1m-s4'},
      {id:'m-s5',repeat:true,trigger:"R.pulseOn===true",say:'放出光点，看它沿着直线一路跑过去。',audio:'c4s1m-s5'},
      {id:'m-concl',repeat:true,trigger:'after:m-s5@6000',say:'因此我们得出结论：光在同种均匀介质中沿直线传播。',audio:'c4s1m-concl'}
    ],
    errors:[
      {id:'m-e1',trigger:"R.laserOn===true && R.activeCount===0@2000",fix:'不对哟～空气里的光路看不见，先摆上烟雾箱。',audio:'c4s1m-e1'},
      {id:'m-e2',trigger:"event:click:#btn-play:R.activeCount===0",fix:'别急哟～桌上没器材，光点没处显形，先摆烟雾箱。',audio:'c4s1m-e2'}
    ],
    free:[
      {trigger:"event:input:#rng-turbid:R.waterOn===true",note:'水里加点牛奶，光路会更清楚哦。',audio:'c4s1m-f1'},
      {trigger:"R.laserOn===true && Math.abs(R.angleDeg)>=25",note:'笔身歪一歪，光线还是一条直线。',audio:'c4s1m-f2'},
      {trigger:"R.paused===true && R.laserOn===true",note:'暂停啦，慢慢看这条光的路线。',audio:'c4s1m-f3'}
    ],
    tasks:[]
  },
  audios:{
    'c4s1m-intro':'guide/audio/c4s1m-intro.mp3',
    'c4s1m-s1':'guide/audio/c4s1m-s1.mp3',
    'c4s1m-s2':'guide/audio/c4s1m-s2.mp3',
    'c4s1m-s3':'guide/audio/c4s1m-s3.mp3',
    'c4s1m-s4':'guide/audio/c4s1m-s4.mp3',
    'c4s1m-s5':'guide/audio/c4s1m-s5.mp3',
    'c4s1m-concl':'guide/audio/c4s1m-concl.mp3',
    'c4s1m-e1':'guide/audio/c4s1m-e1.mp3',
    'c4s1m-e2':'guide/audio/c4s1m-e2.mp3',
    'c4s1m-f1':'guide/audio/c4s1m-f1.mp3',
    'c4s1m-f2':'guide/audio/c4s1m-f2.mp3',
    'c4s1m-f3':'guide/audio/c4s1m-f3.mp3'
  }
};
/* 引擎接线：engine-core.js 在加载时捕获 window.GUIDE_DATA（无 c4s1 回退），本文件必须先于引擎加载 */
window.GUIDE_DATA=window.C4S1M_GUIDE;
```

### 文件 B：`content/physics_g8_v1_c4_s1/guide/guide-data-s.js`（exp-shadow.html 引用）

```js
'use strict';
/* c4s1「光影成像实验室」exp-shadow.html · 语音讲解层数据（B 版标配）
   设计书：docs/c4s1-guide-design.md §B/§4/§5，文案逐字照抄禁改写。
   状态源：window.C4S1S（exp-shadow-core.js L552 后暴露的只读 getter 门面）。
   R.mode('pinhole'|'hand') 是普通状态字段；引擎 mode 由 GUIDE_CFG.mode='refract' 钉死，
   切手影不会触发 onModeEnter/intro 重播。全部 steps repeat:true。 */
window.C4S1S_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到光影成像实验室！点亮蜡烛，看看屏上的火焰像长什么样；拖近拖远蜡烛，像会跟着变；再切到手影模式，拿小手玩光影。',
      audio:'c4s1s-intro'
    },
    steps:[
      {id:'s-s1',repeat:true,trigger:"R.candleLit===true && R.imgM!==null",say:'点着啦！光屏上的火焰像，居然是倒立的！',audio:'c4s1s-s1'},
      {id:'s-s2',repeat:true,trigger:"R.imgM!==null && R.imgM>=1.4",say:'蜡烛靠近小孔，屏上的像变大了。',audio:'c4s1s-s2'},
      {id:'s-s3',repeat:true,trigger:"R.imgM!==null && R.imgM<=0.7",say:'蜡烛移远，像又缩小了，还是倒立的。',audio:'c4s1s-s3'},
      {id:'s-s4',repeat:true,trigger:"R.mode==='hand'",say:'手影模式！台灯和小手替换了蜡烛。',audio:'c4s1s-s4'},
      {id:'s-s5',repeat:true,trigger:"R.mode==='hand' && R.handM!==null",say:'台灯点亮，光幕上出现黑黑的手影。',audio:'c4s1s-s5'},
      {id:'s-s6',repeat:true,trigger:"R.handM!==null && R.handM>=2.6",say:'手越靠近台灯，影子变得越大！',audio:'c4s1s-s6'},
      {id:'s-concl',repeat:true,trigger:'after:s-s2@6000',say:'因此我们得出结论：光沿直线传播，穿过小孔成的是倒立的实像。',audio:'c4s1s-concl'}
    ],
    errors:[
      {id:'s-e1',trigger:"R.mode==='pinhole' && R.scene && (R.scene.missing==='candlePos' || R.scene.missing==='boardPos')@1500",fix:'不对哟～带孔板要放在蜡烛和光屏中间。',audio:'c4s1s-e1'},
      {id:'s-e2',trigger:"R.mode==='hand' && R.scene && R.scene.missing==='handNoImg'@1500",fix:'不对哟～把手移到灯和屏之间，影子才会出现。',audio:'c4s1s-e2'}
    ],
    free:[
      {trigger:"event:input:#hole-slider:R.imgM!==null",note:'孔小像清晰，孔大像更亮，看出区别了吗？',audio:'c4s1s-f1'},
      {trigger:"R.rayOn===false && R.imgM!==null",note:'光线符号关了，两条光线在小孔处交叉，还记得吗？',audio:'c4s1s-f2'},
      {trigger:"R.handM!==null && R.handM<=1.7",note:'手离灯越远，影子就越小。',audio:'c4s1s-f3'}
    ],
    tasks:[]
  },
  audios:{
    'c4s1s-intro':'guide/audio/c4s1s-intro.mp3',
    'c4s1s-s1':'guide/audio/c4s1s-s1.mp3',
    'c4s1s-s2':'guide/audio/c4s1s-s2.mp3',
    'c4s1s-s3':'guide/audio/c4s1s-s3.mp3',
    'c4s1s-s4':'guide/audio/c4s1s-s4.mp3',
    'c4s1s-s5':'guide/audio/c4s1s-s5.mp3',
    'c4s1s-s6':'guide/audio/c4s1s-s6.mp3',
    'c4s1s-concl':'guide/audio/c4s1s-concl.mp3',
    'c4s1s-e1':'guide/audio/c4s1s-e1.mp3',
    'c4s1s-e2':'guide/audio/c4s1s-e2.mp3',
    'c4s1s-f1':'guide/audio/c4s1s-f1.mp3',
    'c4s1s-f2':'guide/audio/c4s1s-f2.mp3',
    'c4s1s-f3':'guide/audio/c4s1s-f3.mp3'
  }
};
/* 引擎接线：engine-core.js 在加载时捕获 window.GUIDE_DATA（无 c4s1 回退），本文件必须先于引擎加载 */
window.GUIDE_DATA=window.C4S1S_GUIDE;
```

---

## §6 落地接线备忘（开发单范围，本设计书不实施）

1. **html 引用顺序**（以 exp-medium.html 为例，插在 `exp-medium-core.js` 之后；exp-shadow.html 同构，换成 C4S1S/guide-data-s.js）：

```html
<link rel="stylesheet" href="../_lib/guide/guide-core.css?v=YYYYMMDD">
<script>window.GUIDE_CFG={mode:'refract',state:window.C4S1M};</script>
<script src="guide/guide-data-m.js?v=YYYYMMDD"></script>
<script src="../_lib/guide/engine-core.js?v=YYYYMMDD"></script>
<script src="../_lib/guide/vB-core.js?v=YYYYMMDD"></script>
```

   顺序硬约束：core.js（定义 C4S1M/C4S1S）→ GUIDE_CFG 内联 → guide-data（置 GUIDE_DATA）→ engine-core（捕获两者）→ vB-core（读 GUIDE_DATA.audios）。所有引用带 `?v=` 并每轮 bump（规范 §3.5），交付提醒蔡总强刷。
2. **引擎前置改造**（共享文件，规范 §3.4 向后兼容）：`bindEventTriggers()` 由写死 `#btn-rec`/`#obj-slider` 改为数据驱动扫描 DATA 中全部 `event:` trigger（本设计新增 `click:#btn-play`、`input:#rng-turbid`、`input:#hole-slider`），改完必须回归 c4s3 四变体页 0 报错。
3. **core.js 暴露**：§A-1.3 / §B-1.3 两段 getter 门面，各一处插入点（medium L435 后、shadow L552 后），纯只读零行为影响；插入后 `node --check` 两文件。
4. **音频**：25 条走 `cn-batch-tts-voiceover` 技能（edge-tts、zh-CN-XiaoxiaoNeural、1.0x），命名=clip id，落 `content/physics_g8_v1_c4_s1/guide/audio/`，逐条 ≥2000 字节对账；下游延时如需精调一律 afinfo 实测（本设计 @6000 为规范 §2.4 固定下限，不依赖实测值）。
5. **验收对照**：规范 §6 清单逐项打勾，重点：五类 audio 零缺失（intro/steps/errors/free 全带，tasks 为空数组）；repeat 重播+3s 冷却；free 闸门零泄漏（空台拖浊度滑杆/未成像拖孔径不出声）；s-concl 在纯小孔玩法可达（after:s-s2@6000）；两页 console 0 报错；`__c4s1dbg`/`__c4s2dbg` 调试钩子行为不变。

（完）

# c5_s1「透镜」透镜光学台 · 语音讲解层设计书（B 版标配 · Part1）

> 目标页面：`content/physics_g8_v1_c5_s1/exp-lens.html`（**双场景**：`bench` 自由光学台 / `focal` 阳光测焦距，两场景状态完全隔离）
> 规范依据：`~/.openclaw/workspace/可交互教材/实验语音讲解层改造规范-B版标配.md`（steps 全 repeat:true、即时打断、状态闸门、五类语音全带 audio、event: 前缀、结论条 after:xxx@6000）；格式参照 `docs/c6-guide-design.md`。
> 物理口径权威源=`explain.html`，本文所有解说词与其逐条对齐，数值口径零臆造。
> 本设计书=纯文本产出，零代码改动；接线细节见 §A-7 备忘，供后续开发单执行。
> 引擎能力核实（`content/_lib/guide/engine-core.js`）：
> - `parseTrigger()` 五种：`delay:N` / `expr@N`（持续满足）/ `event:事件:选择器[:表达式]`（capture 即时判定，先于 core bubble 处理器=读到事件前状态）/ `after:ID@N` / 纯 expr（边沿）。
> - 状态源 `R=(window.GUIDE_CFG&&window.GUIDE_CFG.state)||window.MRR`（行9）；数据源 `window.GUIDE_DATA`（行10）；模式源 `(GUIDE_CFG.mode)||(R.mode)` 每帧轮询（tick ≈行352）。**本实验 state 无 mode 字段，场景源=`state.scene`（'bench'|'focal'）→ GUIDE_CFG.mode 用 getter 返回 scene**（参照 c6s3 stage getter 做法，等效 R.mode 轮询：切场景自动 onModeEnter，播各自 intro+clearRepeatState）。
> - repeat:true 步骤边沿重触发+3s 冷却（REP_COOLDOWN）；delay 型 repeat 每次进模式只发一次（delayFired 守卫）；after 型 repeat 依赖步每多发一次重新延时触发（seenCount 追 fireCount）；errors 电平触发 5s 节流；free 边沿+8s 节流。
> - G 私有字段核查：`G.t/G.mode/G.modeEnterT` 可用；`G.angChangeCount/G.lastAngChangeT` 采集监听 `R.angleI`——**本实验无 angleI，禁用**；`G.recCount/objChangeCount/eqMoveGestureCount/everLit/firstSlotDone` 依赖 c4s3 专属字段（R.doCm/R.objLit/R.eqState/R.m3/#rec-table DOM）——c5_s1 全不存在，**一律禁用**。本设计 trigger **0 次使用 G.\***，只用 `R.*` 与 event DOM。
> - `bindEventTriggers()`（≈行260）动态扫描 DATA 全部 event 型 trigger，按（选择器,事件）去重绑定并分发 steps/errors/free 三类 → `#rng-f/#rng-d/#btn-flow/#btn-labels/#btn-table` 直接可用，引擎零改动。
> - vB 皮肤走 `_lib/guide/vB-core.js`（读 `window.GUIDE_DATA.audios`），零改动。

---

## §A-1 状态暴露核查

状态在 IIFE 闭包 `var state={...}`（exp-lens-core.js **行57~62**），**全文仅此一次赋值**；其后 `resetBench()`（行698）/`resetFocal()`（行710）/`switchScene()`（行733）及初始化（行786~789）全部为原地 mutate 或嵌套子对象替换，state 本体稳定 → 满足引擎「稳定对象」要求。调试通道 `window.__c5s1dbg.get state()`（行792）佐证对象长期存活。

**状态字段速查表**（出处均为 exp-lens-core.js）：

| 字段 | 类型 | 取值/范围 | 含义 | 写入点 |
|---|---|---|---|---|
| scene | string | 'bench'\|'focal' | 当前场景（=mode 源） | 行58 声明；写 switchScene() 行736 |
| animating | bool | | 场景切换动画锁（600ms，ANIM_DUR 行43） | 行59；写 行738 / 行773 |
| anim | obj\|null | {to,t0} | 飞入飞出动画参数 | 行59；写 行738 / 行773 |
| bench.f | number | 1.2~4.8 cm，默认2.0，滑杆步进0.05，吸附2/3（行6~8） | 场景一焦距 | 行60；写 setF() 行64（滑杆 input 行671、步进钮 nudgeF 行675、switchScene 行737、resetBench 行702、resetFocal 行714 经 setF） |
| bench.d | number | 2.4~6.0 cm，默认4.0（行13） | 场景一直径（=孔径，与 f 解耦：只改通光量） | 行60；写 setD() 行65（滑杆 input 行684、resetBench 行702） |
| bench.lens | obj\|null | {kind:'convex'\|'concave', x} | 场景一透镜（**初始预置凸透镜**，行786） | 行60；托盘拖入/换型 行551~552、收回（拖入控制区）行625、resetBench 行701；x 拖写 pointermove lens 分支 ≈行577 |
| bench.source | obj\|null | pens:{type,x,yOff,on[3]} / bulb:{type,x,on,snapped}（光源互斥，行543） | 场景一光源 | 行60；拖入 行545/546、收回 行614/618、resetBench 行700；笔钮 toggle 行603、灯泡本体 toggle 行609、snapped 行589/590 |
| focal.f / focal.d | number | f 默认2.0 / d 固定4.0（FOCAL_D_DEF_CM 行42） | 场景二焦距/直径（与场景一隔离） | 行61；写 setF/setD（resetFocal 行714、switchScene 行734/737） |
| focal.lens | obj | {kind:'convex', x}，**预置不可收回不可换型**（行625 注释） | 场景二凸透镜 | 行61；写 行712 / 行787；x 拖写 ≈行577 |
| focal.screen | obj | {x, atF} 常驻件不可收回（≈行621 注释） | 光屏；atF=光斑最小最亮判定 | 行61；写 行713/789/796；x 拖写 pointermove screen 分支 ≈行594；**atF 写 checkSpotFocus() 行291（true）/行295（false）**，判据 \|sc.x−xFocus\|≤focusTol（±0.12cm≈6px，行9~10） |

派生量（闭包函数，trigger 不可调用）：`bulbAtF()` 行132~133、`spotOK()` 行134、`anyLit()` 行129、`xFocus()` 行131、`cmPx()` 行5（依赖 H，px 几何 trigger 不可算）。

**替代判定（关键）**：`bulbAtF()` 需 `fPx`（闭包散变量，行12，不在 state）→ trigger 用 **`bench.source.snapped`** 替代：磁吸逻辑（行586~590）在灯泡进入前/后焦点 ±focusTol 内即吸附置 true、拖离即置 false，正常拖拽路径与 bulbAtF 等价。已知边界：snapped 只在灯泡拖拽分支更新，透镜被拖动后不复查可能残留 true——b-s5 为 repeat 边沿触发，至多多播一次不循环，可接受（开发单无需处理）。

**陷阱字段（trigger 禁用）**：`drag/startPt/glowFx`（行67，瞬态手势/300ms光晕）、`animating/anim`（行59，600ms 动画窗）、`VS/fCmV/fPx/dCmV/dPx`（散变量渲染缓存，行11~15/66，trigger 认 `R.bench.f/.d`）、`showFocus/showVirtual/showLabels/showFlow`（散变量显示开关，行55/68，交互反馈走 event: 型）、`source.yOff`（行545，pens 渲染偏移）、`lens.x/source.x/screen.x`（渲染坐标，位置语义只认 `snapped/atF/kind/on`）。

**最小暴露方案**：state 声明闭合 `};`（**行62**）之后、`function cur()`（行63）之前插入一句：
```js
window.C5S1_STATE=state;
```
全部 trigger 所用字段均在 state 内（fPx 依赖已由 snapped 替代）→ **无需 c3_s1 式不可枚举 getter 聚合，也无需 c3_s2 式 Proxy**；嵌套 lens/source/screen/anim 存在整体替换（行545/546/551/700/701/712/713/738/786/789），引擎每帧从 R 重新取路径求值（evalParsed），不受影响。

**物理口径锚点**（explain.html）：行77 凸透镜=中间厚边缘薄/凹透镜=中间薄边缘厚；行78 主光轴/光心/过光心方向不变；行81 凸会聚凹发散；行97 焦点F/焦距f/实焦点；行98 凹透镜虚焦点（反向延长线交于入射侧）；行99 焦距越短会聚作用越强；行102~104 太阳光粗测焦距三步（阳光正对透镜=平行光→移屏找最小最亮光斑→量光斑到透镜距离=f）；行110 光路可逆（焦点处光源发出的光经凸透镜成平行光）；行119~121 凸透镜三条特殊光线；行122 凹透镜对应规律。

**core 自洽核实**：refractSlope 行187~190 近轴折射（凸=会聚/凹=发散）；pens 三条水平平行光 drawRays 行209~227（mIn=0 入射→过另一侧焦点，合 explain 行119①）；bulb 五线扇形 drawBulbRays 行236~249（BULB_HS 含 0=过光心线，行35，合 explain 行120②）；凹透镜反向延长虚线 traceRay 行204~207（showVirtual 默认开行55）；光斑 drawSpot 行277~285（半径 r=SPOT_BASE+d×SPOT_K 行28，离焦越远越大越暗）；checkSpotFocus 行287~296（atF 双向写，toast 文案行292 与 f-s2 解说同源）；太阳进入即亮不可拖（行40 注释、drawSun 无开关）。

---

## §A-2 steps 表（10 条：bench 7 + focal 3，全 repeat:true）

**LIT 缩写**（表中简写，A-5 代码内全式展开）：
`LIT := R.bench.source!==null && (R.bench.source.type==='bulb' ? R.bench.source.on===true : (R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))`

**bench 场景（自由光学台，mode key='bench'）**：

| id | trigger | say（≤25字） | audio | 核实出处 |
|---|---|---|---|---|
| c5s1-b-s1 | `delay:13000` | 从左上角托盘拖出光源，点一下本体点亮它。 | c5s1-b-s1 | delay 型（规范§2.3，delayFired 守卫每次进模式一发）；13000=预估，待 intro afinfo 实测+1s 回填；托盘 layout() 行89~99、光源拖入 行543~546、hint b-nosource 行449 |
| c5s1-b-s2 | `R.bench.source!==null && (R.bench.source.type==='bulb' ? R.bench.source.on!==true : !(R.bench.source.on[0]\|\|R.bench.source.on[1]\|\|R.bench.source.on[2]))` | 点光源上的红色按钮开光，光沿直线传播。 | c5s1-b-s2 | 笔钮 toggle 行603、灯泡 toggle 行609；hint b-pens-off 行450 / b-bulb-off 行452；进模式 source=null→假，不砍 intro |
| c5s1-b-s3 | `R.bench.lens===null && LIT` | 没有透镜时光沿直线走，把透镜拖到主轴上。 | c5s1-b-s3 | lens 收回（拖入控制区）行625；初始预置凸透镜 行786（初始为假）；hint b-nolens 行453 |
| c5s1-b-s4 | `R.bench.lens!==null && R.bench.lens.kind==='convex' && LIT` | 平行光经凸透镜，会聚在另一侧的焦点F。 | c5s1-b-s4 | refractSlope 凸会聚 行187~189；pens 三条平行光 drawRays 行209~227（mIn=0）；explain 行119①；hint b-pens-convex 行451 |
| c5s1-b-s5 | `R.bench.lens!==null && R.bench.lens.kind==='concave' && LIT` | 凹透镜让光发散，反向延长线交在虚焦点。 | c5s1-b-s5 | refractSlope 凹发散 行189；反向延长虚线 traceRay 行204~207（showVirtual 默认开 行55）；explain 行98/122；hint b-concave 行457 |
| c5s1-b-s6 | `R.bench.source!==null && R.bench.source.type==='bulb' && R.bench.source.on===true && R.bench.source.snapped===true` | 焦点发出的光出来变平行光，光路可逆！ | c5s1-b-s6 | snapped 写 行589/590（±focusTol 磁吸，等价 bulbAtF 行132，见 A-1 替代判定）；explain 行110；hint b-bulb-atF 行455；drawBulbRays 行236~249 |
| c5s1-b-s7 | `after:c5s1-b-s6@6000` | 因此我们得出结论：凸透镜会聚光，凹透镜发散光。 | c5s1-b-s7 | after 型@6000（规范§2.4）；explain 行81、小结 行157 |

**focal 场景（阳光测焦距，mode key='focal'）**：

| id | trigger | say（≤25字） | audio | 核实出处 |
|---|---|---|---|---|
| c5s1-f-s1 | `delay:13000` | 阳光可看作平行光，移动光屏找最小最亮的光斑。 | c5s1-f-s1 | delay 型；13000=预估待实测回填；explain 行102~103；hint f-sun/f-drag 行446~447；太阳 5 条平行光 drawSunRays 行228~234（进入即亮不可拖 行40） |
| c5s1-f-s2 | `R.focal.screen.atF===true` | 光斑最小最亮！屏到透镜的距离就是焦距f。 | c5s1-f-s2 | atF 写 checkSpotFocus 行291（判据 \|sc.x−xFocus\|≤focusTol 行289）；toast 同口径 行292；explain 行103~104；hint f-atF 行445；进模式 atF=false→假，不砍 intro |
| c5s1-f-s3 | `after:c5s1-f-s2@6000` | 因此我们得出结论：光斑到透镜的距离就是焦距f。 | c5s1-f-s3 | after 型@6000；explain 行104（s2c 第三步：量出光斑到透镜的距离，即焦距 f） |

说明：①拖拽交互全在 canvas（无 DOM 选择器），故操作类步骤一律状态表达式 repeat 边沿方案；②focal 光屏常驻、透镜预置凸不可换（行625 注释、行787），场景内无可错顺序，步骤仅 3 条；③「屏移离焦点光斑变大变暗」的探索反馈放 free（ff2，G.t 闸门防进模式砍 intro，见 A-4）。

---

## §A-3 errors 表（2 条，橙色纠错抓误操作，电平/事件型 5s 节流）

| id | trigger | fix | audio | 核实出处 |
|---|---|---|---|---|
| c5s1-b-e1 | `event:change:#cb-virtual:R.bench.lens!==null&&R.bench.lens.kind==='concave'&&!document.getElementById('cb-virtual').checked` | 不对哟～没有虚线就看不到虚焦点啦，勾回来吧。 | c5s1-b-e1 | cb-virtual 监听 行659；虚线绘制受 showVirtual 控制 traceRay 行204~207；虚焦点口径 explain 行98。时机核实：浏览器先更新 checked 再派发 change，引擎 capture 读到的已是新值 → expr=「凹透镜在场且刚被取消勾选」；勾选回来（checked=true）不触发 |
| c5s1-b-e2 | `R.bench.source!==null && R.bench.source.type==='pens' && R.bench.lens!==null && R.bench.source.x>=R.bench.lens.x` | 不对哟～光源要放在透镜左边，拖回来吧。 | c5s1-b-e2 | 电平型：pens 拖拽期 x 实时写（pointermove pens 分支 行583~584），clampPensX 上限 W*0.35（行116）与 clampLensX 下限 W*0.30（行115）存在重叠窗 → 拖到透镜右侧可检出；松手回吸 x=PENS_X（endDrag 行615）自动解除；x 在此仅作左右相对判定（与 core clamp 语义同向），非绝对渲染坐标依赖 |

focal 场景 0 条：光屏/透镜全常驻且 clamp 强约束（clampScreenX 下限=L.x+30px 行119~122），无可检出的误操作状态。

---

## §A-4 free 表（7 条：bench 4 + focal 3，探索反馈；event: 型或带状态闸门电平型）

**bench（mode 内分发天然带场景闸门，bindEventTriggers 只发 curMode 条目）**：

| trigger | note | audio | 核实出处 |
|---|---|---|---|
| `event:input:#rng-f:R.bench.lens!==null` | 焦距越短，会聚作用越强哦。 | c5s1-b-f1 | rng-f input 行671（f∈1.2~4.8cm 行6，吸附2/3 行7）；口径 explain 行99「焦距越短，会聚作用越强」；闸门=透镜在场（无透镜谈会聚无意义） |
| `event:input:#rng-d:R.bench.lens!==null` | 直径只改通光量，不改焦距哦。 | c5s1-b-f2 | rng-d input 行684（d∈2.4~6.0cm 行13）；口径=行13 注释「与 f 解耦：直径不改焦距、只改通光量」+ hint b-convex 行456 |
| `event:click:#btn-flow` | 蓝色脉冲在指示光的传播方向。 | c5s1-b-f3 | btn-flow 行650~655（showFlow 开=蓝色虚线脉冲 x0→x1 流动，beam() 行158~166、COL_FLOW 行44）；开/关均播报故文案中性；showFlow 为散变量不可入 expr，用纯 event 型 |
| `R.bench.source!==null && R.bench.source.type==='bulb' && R.bench.source.on===true && R.bench.lens!==null` | 过光心的光，传播方向不变。 | c5s1-b-f4 | 电平边沿：点灯瞬间触发（进模式 source=null→假不砍 intro）；BULB_HS 含 0=过光心线 行35、drawBulbRays 行242；core 自绘同文案 drawAnnotations 行378~384；口径 explain 行120② |

**focal**：

| trigger | note | audio | 核实出处 |
|---|---|---|---|
| `event:click:#btn-table` | 读数面板能随时查看屏透镜距离和光斑状态。 | c5s1-f-f1 | btn-table 行690~696；面板三行=屏-透镜距离/当前焦距f/光斑状态 updatePanel 行484~490；纯 event 型（面板开合均适用） |
| `(G.t-G.modeEnterT)>12000 && R.focal.screen.atF===false` | 还没到焦点哦，光斑又大又暗，继续移动光屏。 | c5s1-f-f2 | G.t/G.modeEnterT=引擎通用字段（updateG 每帧写 G.t；onModeEnter 重置 modeEnterT）——12s 闸门保证 focal intro（预估~9s）讲完才可能出声；进场景 12s 后仍未对焦→上升沿播一次；atF 真→假（拖离焦点）→假→真→再拖离 会再次上升沿+8s 节流=「又移开了」再提醒；光斑物理：r=SPOT_BASE+d×SPOT_K、alpha 随 d 衰减 drawSpot 行277~285；hint f-atF 行445 同口径 |
| `event:input:#rng-f:R.scene==='focal'` | 焦距变了，焦点位置也跟着变，重新找找光屏位置。 | c5s1-f-f3 | focal 场景焦距卡保留（syncSceneUI 只淡出直径/显示卡 行727~731）；改 f→xFocus()=lens.x+fPx 移动（行131）→atF 由 checkSpotFocus 行295 复查降为 false，需重新对屏；expr 闸门 R.scene==='focal' 双保险（与 bench 的 b-f1 同选择器不同 mode，分发互不串扰） |

---

## §A-5 guide-data.js（完整代码块）

> mode 源说明：本实验 state **无 mode 字段**（场景源=`state.scene`），若按「GUIDE_CFG 不设 mode 走 R.mode 轮询」则引擎 `mode=(GUIDE_CFG.mode)||(R.mode)` 恒 undefined 永不进模式 → 必须照 **c6s3 stage getter 先例**设 `get mode(){return window.C5S1_STATE.scene;}`（引擎 tick 每帧轮询该 getter，语义等同 R.mode 轮询：'bench'↔'focal' 切换沿自动 onModeEnter，播各自 intro+clearRepeatState）。mode key 照实= **bench / focal** 两个。
> LIT 全式（b-s3/s4/s5 内联展开）：`R.bench.source!==null && (R.bench.source.type==='bulb' ? R.bench.source.on===true : (R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))`

```js
/* content/physics_g8_v1_c5_s1/guide/guide-data.js */
window.C5S1_GUIDE={
  bench:{
    intro:{text:'欢迎来到透镜光学台！凸透镜会聚光，凹透镜发散光。拖出光源和透镜，看看光路怎么变～',audio:'c5s1-b-intro'},
    steps:[
      {id:'c5s1-b-s1',repeat:true,trigger:'delay:13000',say:'从左上角托盘拖出光源，点一下本体点亮它。',audio:'c5s1-b-s1'},
      {id:'c5s1-b-s2',repeat:true,trigger:'R.bench.source!==null && (R.bench.source.type===\'bulb\' ? R.bench.source.on!==true : !(R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))',say:'点光源上的红色按钮开光，光沿直线传播。',audio:'c5s1-b-s2'},
      {id:'c5s1-b-s3',repeat:true,trigger:'R.bench.lens===null && R.bench.source!==null && (R.bench.source.type===\'bulb\' ? R.bench.source.on===true : (R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))',say:'没有透镜时光沿直线走，把透镜拖到主轴上。',audio:'c5s1-b-s3'},
      {id:'c5s1-b-s4',repeat:true,trigger:'R.bench.lens!==null && R.bench.lens.kind===\'convex\' && R.bench.source!==null && (R.bench.source.type===\'bulb\' ? R.bench.source.on===true : (R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))',say:'平行光经凸透镜，会聚在另一侧的焦点F。',audio:'c5s1-b-s4'},
      {id:'c5s1-b-s5',repeat:true,trigger:'R.bench.lens!==null && R.bench.lens.kind===\'concave\' && R.bench.source!==null && (R.bench.source.type===\'bulb\' ? R.bench.source.on===true : (R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))',say:'凹透镜让光发散，反向延长线交在虚焦点。',audio:'c5s1-b-s5'},
      {id:'c5s1-b-s6',repeat:true,trigger:'R.bench.source!==null && R.bench.source.type===\'bulb\' && R.bench.source.on===true && R.bench.source.snapped===true && R.bench.lens!==null',say:'焦点发出的光出来变平行光，光路可逆！',audio:'c5s1-b-s6'},
      {id:'c5s1-b-s7',repeat:true,trigger:'after:c5s1-b-s6@6000',say:'因此我们得出结论：凸透镜会聚光，凹透镜发散光。',audio:'c5s1-b-s7'}
    ],
    errors:[
      {id:'c5s1-b-e1',trigger:'event:change:#cb-virtual:R.bench.lens!==null&&R.bench.lens.kind===\'concave\'&&!document.getElementById(\'cb-virtual\').checked',fix:'不对哟～没有虚线就看不到虚焦点啦，勾回来吧。',audio:'c5s1-b-e1'},
      {id:'c5s1-b-e2',trigger:'R.bench.source!==null && R.bench.source.type===\'pens\' && R.bench.lens!==null && R.bench.source.x>=R.bench.lens.x',fix:'不对哟～光源要放在透镜左边，拖回来吧。',audio:'c5s1-b-e2'}
    ],
    free:[
      {trigger:'event:input:#rng-f:R.bench.lens!==null',note:'焦距越短，会聚作用越强哦。',audio:'c5s1-b-f1'},
      {trigger:'event:input:#rng-d:R.bench.lens!==null',note:'直径只改通光量，不改焦距哦。',audio:'c5s1-b-f2'},
      {trigger:'event:click:#btn-flow',note:'蓝色脉冲在指示光的传播方向。',audio:'c5s1-b-f3'},
      {trigger:'R.bench.source!==null && R.bench.source.type===\'bulb\' && R.bench.source.on===true && R.bench.lens!==null',note:'过光心的光，传播方向不变。',audio:'c5s1-b-f4'}
    ],
    tasks:[]
  },
  focal:{
    intro:{text:'阳光可以看作平行光！平行光经凸透镜会聚于焦点。移动光屏，找最小最亮的光斑测焦距。',audio:'c5s1-f-intro'},
    steps:[
      {id:'c5s1-f-s1',repeat:true,trigger:'delay:13000',say:'阳光可看作平行光，移动光屏找最小最亮的光斑。',audio:'c5s1-f-s1'},
      {id:'c5s1-f-s2',repeat:true,trigger:'R.focal.screen.atF===true',say:'光斑最小最亮！屏到透镜的距离就是焦距f。',audio:'c5s1-f-s2'},
      {id:'c5s1-f-s3',repeat:true,trigger:'after:c5s1-f-s2@6000',say:'因此我们得出结论：光斑到透镜的距离就是焦距f。',audio:'c5s1-f-s3'}
    ],
    errors:[],
    free:[
      {trigger:'event:click:#btn-table',note:'读数面板能随时查看屏透镜距离和光斑状态。',audio:'c5s1-f-f1'},
      {trigger:'(G.t-G.modeEnterT)>12000 && R.focal.screen.atF===false',note:'还没到焦点哦，光斑又大又暗，继续移动光屏。',audio:'c5s1-f-f2'},
      {trigger:'event:input:#rng-f:R.scene===\'focal\'',note:'焦距变了，焦点位置也跟着变，重新找找光屏位置。',audio:'c5s1-f-f3'}
    ],
    tasks:[]
  },
  audios:{
    'c5s1-b-intro':'guide/audio/c5s1-b-intro.mp3',
    'c5s1-b-s1':'guide/audio/c5s1-b-s1.mp3','c5s1-b-s2':'guide/audio/c5s1-b-s2.mp3',
    'c5s1-b-s3':'guide/audio/c5s1-b-s3.mp3','c5s1-b-s4':'guide/audio/c5s1-b-s4.mp3',
    'c5s1-b-s5':'guide/audio/c5s1-b-s5.mp3','c5s1-b-s6':'guide/audio/c5s1-b-s6.mp3',
    'c5s1-b-s7':'guide/audio/c5s1-b-s7.mp3',
    'c5s1-b-e1':'guide/audio/c5s1-b-e1.mp3','c5s1-b-e2':'guide/audio/c5s1-b-e2.mp3',
    'c5s1-b-f1':'guide/audio/c5s1-b-f1.mp3','c5s1-b-f2':'guide/audio/c5s1-b-f2.mp3',
    'c5s1-b-f3':'guide/audio/c5s1-b-f3.mp3','c5s1-b-f4':'guide/audio/c5s1-b-f4.mp3',
    'c5s1-f-intro':'guide/audio/c5s1-f-intro.mp3',
    'c5s1-f-s1':'guide/audio/c5s1-f-s1.mp3','c5s1-f-s2':'guide/audio/c5s1-f-s2.mp3',
    'c5s1-f-s3':'guide/audio/c5s1-f-s3.mp3',
    'c5s1-f-f1':'guide/audio/c5s1-f-f1.mp3','c5s1-f-f2':'guide/audio/c5s1-f-f2.mp3',
    'c5s1-f-f3':'guide/audio/c5s1-f-f3.mp3'
  }
};
window.GUIDE_CFG={state:window.C5S1_STATE,get mode(){return window.C5S1_STATE.scene;}};
window.GUIDE_DATA=window.C5S1_GUIDE;
```

G 字段使用自查：全文件仅 f-f2 用 `G.t/G.modeEnterT`（引擎通用字段，白名单内）；0 次使用 G.angChangeCount/G.lastAngChangeT（本实验无 R.angleI）、0 次使用 c4s3 专属进度字段。五类条目（intro/steps/errors/free）audio 字段全量在位（tasks 空表，无 A 版任务链）。

---

## §A-6 音频 clip 清单（前缀 c5s1-；预估秒数=字数÷4+0.5，TTS 落盘后一律 afinfo 实测回填）

全批统一 `zh-CN-XiaoxiaoNeural` 1.0x；「～」不发音只做停顿；「F」读「艾弗」；文件名=clip id，存 `content/physics_g8_v1_c5_s1/guide/audio/`。

| clip id | 文本 | 预估秒数 |
|---|---|---|
| c5s1-b-intro | 欢迎来到透镜光学台！凸透镜会聚光，凹透镜发散光。拖出光源和透镜，看看光路怎么变～ | 10.5 |
| c5s1-b-s1 | 从左上角托盘拖出光源，点一下本体点亮它。 | 5.5 |
| c5s1-b-s2 | 点光源上的红色按钮开光，光沿直线传播。 | 5.3 |
| c5s1-b-s3 | 没有透镜时光沿直线走，把透镜拖到主轴上。 | 5.5 |
| c5s1-b-s4 | 平行光经凸透镜，会聚在另一侧的焦点F。 | 5.3 |
| c5s1-b-s5 | 凹透镜让光发散，反向延长线交在虚焦点。 | 5.3 |
| c5s1-b-s6 | 焦点发出的光出来变平行光，光路可逆！ | 5.0 |
| c5s1-b-s7 | 因此我们得出结论：凸透镜会聚光，凹透镜发散光。 | 6.3 |
| c5s1-b-e1 | 不对哟～没有虚线就看不到虚焦点啦，勾回来吧。 | 6.0 |
| c5s1-b-e2 | 不对哟～光源要放在透镜左边，拖回来吧。 | 5.3 |
| c5s1-b-f1 | 焦距越短，会聚作用越强哦。 | 3.8 |
| c5s1-b-f2 | 直径只改通光量，不改焦距哦。 | 4.0 |
| c5s1-b-f3 | 蓝色脉冲在指示光的传播方向。 | 4.0 |
| c5s1-b-f4 | 过光心的光，传播方向不变。 | 3.8 |
| c5s1-f-intro | 阳光可以看作平行光！平行光经凸透镜会聚于焦点。移动光屏，找最小最亮的光斑测焦距。 | 10.5 |
| c5s1-f-s1 | 阳光可看作平行光，移动光屏找最小最亮的光斑。 | 6.0 |
| c5s1-f-s2 | 光斑最小最亮！屏到透镜的距离就是焦距f。 | 5.5 |
| c5s1-f-s3 | 因此我们得出结论：光斑到透镜的距离就是焦距f。 | 6.3 |
| c5s1-f-f1 | 读数面板能随时查看屏透镜距离和光斑状态。 | 5.5 |
| c5s1-f-f2 | 还没到焦点哦，光斑又大又暗，继续移动光屏。 | 5.8 |
| c5s1-f-f3 | 焦距变了，焦点位置也跟着变，重新找找光屏位置。 | 6.3 |

合计 **21 条**（bench 14 + focal 7），总时长约 2 分钟，体积无压力（规范§4）。两条 delay:13000（b-s1/f-s1）以 intro 预估 10.5s+余量设定，intro mp3 落盘后按规范§2.3 afinfo 实测+1s 回填。

---

## §A-7 接线备忘（供后续开发单执行，本设计书零代码改动）

**① html 五件套插入位置（exp-lens.html）**：
1. `<head>` 内（行66 pseudo-fs 样式之后）：`<link rel="stylesheet" href="../_lib/guide/guide-core.css?v=YYYYMMDDg1">`
2. `.scene-wrap` 内 `<div id="toast"></div>`（行85）之后：`<div id="guide-layer"></div>`（vB 浮标+字幕+启动层挂载点；engine Caption 也优先找它）
3. `<script src="exp-lens-core.js?v=…">`（行124）之后、`</body>`（行125）之前，按序插三个：`<script src="guide/guide-data.js?v=YYYYMMDDg1">`（**必须先于 engine**，引擎 IIFE 顶部即捕获 R=GUIDE_CFG.state）→ `<script src="../_lib/guide/engine-core.js?v=YYYYMMDDg1">` → `<script src="../_lib/guide/vB-core.js?v=YYYYMMDDg1">`
4. 既有 4 个 script 引用（行121~124）+新增 3 个 guide 引用统一 `?v=` bump，交付提醒蔡总强刷（规范§3.5）
5. 字幕底边距：engine Caption bottomOff() 读 `.ctrlbar` 高度（本页行24 在位 ✓），无需另配

**② core 暴露块插入点（exp-lens-core.js）**：行62 `};`（state 声明闭合）之后、行63 `function cur()` 之前插入 `window.C5S1_STATE=state;`（仅此一行为 core 必需改动；散变量无需 getter 聚合，理由见 A-1）。

**③ hint 橙色解说条删除范围**（职责被语音字幕取代，照 F4③ 注释块整体移除）：
- html：行76 `<div id="hint"></div>` + CSS 行20~21（`#hint{…}`/`#hint.show{…}`）
- core：行438~491 整块（hintEl 行439、hintSt 行440、hintBranch 行442~458、updateHint 行459~468、showHintNow 行470~476、hideHint 行477、hintReset 行478、placeHint 行480~491；注意 updatePanel 行492 起**保留**）
- core 调用点逐一摘除（14 处）：行294/295（checkSpotFocus 内，toast 保留）、行435（draw 尾部 `if(!state.animating) updateHint();` 整句删）、行564（pointerdown 链尾）、行628（endDrag 链尾）、行673/678（rng-f/nudgeF）、行686（rng-d）、行721（btn-reset）、行739（switchScene hideHint）、行774（tick 动画结束 hintReset+updateHint）、行790（init）、行793~797（__c5s1dbg 各方法链内 updateHint() 摘除，其余保留）
- 删除后 node --check + 全交互回归（拖光源/透镜/光屏、双滑杆、四显示钮、重置、切场景）确认无 ReferenceError

**④ 移动三件现状**（托盘/读数面板/toast，均保留不动）：
- 器材托盘：canvas 左上角绘制（layout() 行89~99，卡 366×106@16,12，F4② 缩小档），非 DOM 无需避让；仅场景一渲染（drawTray 只被 renderBench 调用）
- 读数面板 `#panel-read`：DOM 右上角（html 行54，top:12px right:12px z-index:15），与 guide 右下浮标/底部字幕无重叠；btn-table 开关（core 行690~696）
- `#toast`：DOM 顶部 13% 居中（html 行58~59，z-index:16），focal 对焦庆祝（core 行292）与 f-s2 语音字幕同源口径、视觉/语音互补，保留
- vB 浮标右下位与 .ctrlbar（min-height 88px，z-index:20）相邻：浮标默认位若被系统组按钮（全屏/静音右上浮出）遮挡，开发单微调浮标 bottom 避开即可，字幕条 bottomOff 已自动量 ctrlbar 真高

**⑤ 数据一致性备注**：A-5 代码块为准——b-s6 trigger 比 A-2 表多 `R.bench.lens!==null` 兜底（snapped 残留边界，见 A-1 替代判定）；b-e1 为 event:change:#cb-virtual（checkbox 原生事件=change 非 click）；f-f2 是全文唯一 G.* 使用者（G.t/G.modeEnterT 白名单通用字段）。

（Part1 完 · c5_s1 单实验；本文件=docs/c5-guide-design-part1.md）

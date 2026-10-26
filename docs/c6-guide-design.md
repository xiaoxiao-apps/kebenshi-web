# c6「质量与密度」三实验页 · 语音讲解层设计书（B 版标配）

> 目标页面：`content/physics_g8_v1_c6_s1/exp-mass.html`（§A 天平实验室）/ `physics_g8_v1_c6_s2/exp-density.html`（§B 密度实验室）/ `physics_g8_v1_c6_s3/exp-measure.html`（§C 密度测量台，两阶段：测盐水→测石块）
> 规范依据：`~/.openclaw/workspace/可交互教材/实验语音讲解层改造规范-B版标配.md`（steps 全 repeat:true、即时打断、状态闸门、五类语音全带 audio、event: 前缀、结论条 after:xxx@6000）；格式参照 `docs/c4s3-guide-variants-design.md`。
> 物理口径权威源=各节 `explain.html`，本文所有解说词与其逐条对齐，数值口径零臆造。
> 引擎能力核实（`content/_lib/guide/engine-core.js`）：
> - `parseTrigger()` 支持五种：`delay:N` / `expr@N`（持续满足）/ `event:事件:选择器[:表达式]`（capture 即时判定）/ `after:ID@N` / 纯 expr（边沿）（≈行33~48）。
> - 状态源 `R=(window.GUIDE_CFG&&window.GUIDE_CFG.state)||window.MRR`（行9）；数据源 `window.GUIDE_DATA`（行10）；模式源 `(GUIDE_CFG.mode)||(R.mode)`，每帧轮询（≈行352）→ **c6s3 可用 getter 让 mode 跟随 state.stage**。
> - repeat:true 步骤边沿重触发+3s 冷却；delay 型 repeat 每次进模式只发一次（delayFired 守卫，r6）；errors 电平触发 5s 节流；free 边沿+8s 节流。
> - G 私有字段核查：`G.t`（每帧时间戳，updateG 写入，可用）；`G.recCount/objChangeCount/eqMoveGestureCount/lastObjChangeT/everLit/firstSlotDone` 等的采集依赖 c4_s3 专属字段（R.doCm/R.objLit/R.eqState/R.m3/#rec-table DOM）——c6 三页这些字段全不存在，**一律禁用**；本设计 trigger 只用 `R.*`，不依赖任何 G 进度字段。
> - 事件型扫描绑定（bindEventTriggers≈行260）自动覆盖宿主任意选择器，`#btn-submit` 等直接可用。
> - vB 皮肤走 `_lib/guide/vB-core.js`（通用版，读 `window.GUIDE_DATA.audios`），无需改。

---

## §A c6_s1 天平实验室（exp-mass.html）

### A-1 状态暴露核查

状态在 IIFE 闭包 `var state={}`（exp-mass-core.js 行35~54），**全文仅此一次赋值**（grep `state\s*=\s*{` 唯一命中行35），其后含 `resetAll()`（行954）在内全部为原地 mutate → 满足引擎「稳定对象原地 mutate」要求。已有调试通道 `window.__c6dbg.get state()`（行1048）佐证对象长期存活。

**状态字段速查表**（出处均为 exp-mass-core.js）：

| 字段 | 类型 | 取值/范围 | 含义 | 出处 |
|---|---|---|---|---|
| obj | string\|null | 'clay'\|'ice'\|'pencil'\|null | 被测物三选（15g/60g/8g，OBJECTS 行21~25） | 行37；写 selectObj() 行895 |
| onPan / onHeat | bool | | 被测物在左盘 / 冰杯在热源 | 行38；写 行594 / 599 |
| rider | number | 0~5，0.1步进 | 游码示数 g | 行44；画布拖 行554、滑杆 行922 |
| nut | number | −4~4，初值−2.5（NUT_INIT 行11） | 平衡螺母偏置，0.5/步 | 行44；写 nutTurn() 行913 |
| tilt | number | −8~8 | 横梁倾角**显示插值**（每帧逼近 tiltTarget） | 行44；插值 行859 |
| leveled | bool | 闩锁（置真不回退，重置才清） | 已调平。判据：空盘+panW空+rider=0+\|nut\|<0.3 | 行44；判定 行852~853 |
| matched | bool | | 横梁平衡=唯一可读数窗。判据：obj 在盘且 \|tiltTarget\|≤0.1 | 行44；判定 行861~864 |
| panW | array | ['100','50','20','20b','10','5'] 子集，降序 | 右盘砝码 | 行45；写 insertPan() 行582~584 |
| g | number | 0.5~12，默认9.8 | 重力环境（位置线索） | 行36；写 行938 |
| morph / kneaded | number 0~2 / bool | | 橡皮泥形变 / 已揉捏 | 行39；写 行1034~1035 / 1018 |
| ice / meltedOnce | number 100→0 / bool | | 冰占比 / 曾全熔化 | 行40；写 行867 / 871 |
| heating / freezing | bool | 互斥 | 加热/制冰旋钮 | 行41；写 行634 |
| modal | bool | | 揉捏窗打开 | 行51；写 行1004/1016 |
| seen / alldone | {shape,state,pos} / bool | | 三不变性线索闩锁 | 行53；写 checkClues() 行734~748 |
| bal.moved | bool | | 天平被拖动过 | 行49；写 行647 |

派生量（闭包函数，trigger 不可调用）：`massR()` 行112、`diff()` 行114、`tiltTarget()` 行116、`badRead()=matched&&!leveled` 行764。如需右盘总克数，备用表达式（WEIGHT_G 行19）：
`R.panW.reduce(function(s,id){return s+({'100':100,'50':50,'20':20,'20b':20,'10':10,'5':5})[id];},0)+R.rider`（本设计未用到，matched 已覆盖平衡语义）。

**陷阱字段（trigger 禁用）**：`drag`(行50)、`falls`(行47)、`wPos`(行48)、`objDrop`(行52)、`bal.vy/squash`(行49)、`knobAng`(行42)、`heatX/heatMoved`(行41) —— 全为瞬态手势/渲染插值；`tilt`(行44) 是跟随显示值，平衡判定一律认 `matched`；`loose` 瞬态停驻。`ice/morph/kneaded/meltedOnce/heating/freezing` 仅在对应 obj 下有意义，trigger 必须先挂 `R.obj===` 闸门。

**最小暴露方案**：在 `state.showLabels=false;`（**行55**）之后加一句：
```js
window.C6S1_STATE=state;
```
（嵌套对象 `seen` 在重置时被整体替换（行964），但引擎每帧从 R 重新取路径求值，不受影响。）

**物理口径锚点**（explain.html）：行136 放水平台；行137 游码归零+调平衡螺母使指针指分度盘中线；行138 左物右码；行139 读数=砝码总质量+游码示数，**游码以左侧边缘对准刻度为准**（易错点）；使用前三要求（称量上限/镊子/潮湿物不入盘）。

### A-2 steps（8 条，全 repeat:true）

| id | trigger | say（≤25字） | audio | 核实出处 |
|---|---|---|---|---|
| c6s1-s1 | `delay:13000` | 天平放在水平台，先把游码拨到左端零刻度。 | c6s1-s1 | delay 型（规范§2.3）；延时=待 intro afinfo 实测+1s 回填，此处预估 |
| c6s1-s2 | `R.leveled===false && R.rider===0 && R.nut!==-2.5` | 旋平衡螺母，让指针指在分度盘中线。 | c6s1-s2 | nut 写 行913；初值−2.5 行11；leveled 行44 |
| c6s1-s3 | `R.leveled===true` | 指针指中线，横梁调平啦！ | c6s1-s3 | leveled 判定 行852~853 |
| c6s1-s4 | `R.obj!==null && R.onPan===true` | 物体放左盘，砝码放右盘，左物右码。 | c6s1-s4 | onPan 写 行594；口径 explain 行138 |
| c6s1-s5 | `R.onPan===true && R.panW.length>=1 && R.matched===false` | 右盘加减砝码，由大到小试。 | c6s1-s5 | panW 写 行582~584 |
| c6s1-s6 | `R.onPan===true && R.rider>0 && R.matched===false` | 微调游码，直到横梁再次平衡。 | c6s1-s6 | rider 写 行554/922；matched 行861~864 |
| c6s1-s7 | `R.matched===true && R.leveled===true` | 读数=砝码总质量+游码示数，游码看左边缘。 | c6s1-s7 | matched 行863；游码读数口径 explain 行139 |
| c6s1-s8 | `after:c6s1-s7@6000` | 因此我们得出结论：m等于砝码总质量加游码示数。 | c6s1-s8 | after 型@6000（规范§2.4） |

说明：画布拖拽（砝码/物体/游码）无 DOM 选择器，故全部用状态表达式 repeat 方案（任务书允许的两种方案之一）；游码滑杆虽有 `#rng-rider`，状态式可同时覆盖画布拖游码与滑杆两条路径，不另挂 event。

### A-3 errors（2 条）

| id | trigger | fix | audio | 核实出处 |
|---|---|---|---|---|
| c6s1-e1 | `R.matched===true && R.leveled===false` | 不对哟～还没调平，读数是错的，先调平再称。 | c6s1-e1 | badRead() 行764；红字警示口径 行722（guideText 首分支） |
| c6s1-e2 | `R.leveled===false && R.rider>0` | 不对哟～调平前，先把游码移回零刻度线。 | c6s1-e2 | leveled 判据含 rider===0 行852；游码归零口径 explain 行137 |

### A-4 free（3 条，均带状态闸门）

| trigger | note | audio | 核实出处 |
|---|---|---|---|
| `R.obj==='clay' && R.kneaded && R.seen.shape` | 形状变了，读数不变——质量不随形状改变。 | c6s1-f1 | seen.shape 写 行736~737（含 onPan&&matched 前置）；口径 explain「质量不随形状改变」 |
| `R.leveled===true && Math.abs(R.g-9.8)>0.05` | 换到别处重力变了，质量可不变哟。 | c6s1-f2 | g 写 行938；seen.pos 口径 行742~743 |
| `R.obj==='ice' && R.meltedOnce===true` | 冰化成水物态变了，总质量不变。 | c6s1-f3 | meltedOnce 写 行871；口径 行739~740 |

### A-5 guide-data.js（完整）

```js
/* content/physics_g8_v1_c6_s1/guide/guide-data.js */
window.C6S1_GUIDE={
  refract:{
    intro:{text:'欢迎来到天平实验室！口诀：先调平，左物右码，读数等于砝码加游码。',audio:'c6s1-intro'},
    steps:[
      {id:'c6s1-s1',repeat:true,trigger:'delay:13000',say:'天平放在水平台，先把游码拨到左端零刻度。',audio:'c6s1-s1'},
      {id:'c6s1-s2',repeat:true,trigger:'R.leveled===false && R.rider===0 && R.nut!==-2.5',say:'旋平衡螺母，让指针指在分度盘中线。',audio:'c6s1-s2'},
      {id:'c6s1-s3',repeat:true,trigger:'R.leveled===true',say:'指针指中线，横梁调平啦！',audio:'c6s1-s3'},
      {id:'c6s1-s4',repeat:true,trigger:'R.obj!==null && R.onPan===true',say:'物体放左盘，砝码放右盘，左物右码。',audio:'c6s1-s4'},
      {id:'c6s1-s5',repeat:true,trigger:'R.onPan===true && R.panW.length>=1 && R.matched===false',say:'右盘加减砝码，由大到小试。',audio:'c6s1-s5'},
      {id:'c6s1-s6',repeat:true,trigger:'R.onPan===true && R.rider>0 && R.matched===false',say:'微调游码，直到横梁再次平衡。',audio:'c6s1-s6'},
      {id:'c6s1-s7',repeat:true,trigger:'R.matched===true && R.leveled===true',say:'读数=砝码总质量+游码示数，游码看左边缘。',audio:'c6s1-s7'},
      {id:'c6s1-s8',repeat:true,trigger:'after:c6s1-s7@6000',say:'因此我们得出结论：m等于砝码总质量加游码示数。',audio:'c6s1-s8'}
    ],
    errors:[
      {id:'c6s1-e1',trigger:'R.matched===true && R.leveled===false',fix:'不对哟～还没调平，读数是错的，先调平再称。',audio:'c6s1-e1'},
      {id:'c6s1-e2',trigger:'R.leveled===false && R.rider>0',fix:'不对哟～调平前，先把游码移回零刻度线。',audio:'c6s1-e2'}
    ],
    free:[
      {trigger:'R.obj===\'clay\' && R.kneaded && R.seen.shape',note:'形状变了，读数不变——质量不随形状改变。',audio:'c6s1-f1'},
      {trigger:'R.leveled===true && Math.abs(R.g-9.8)>0.05',note:'换到别处重力变了，质量可不变哟。',audio:'c6s1-f2'},
      {trigger:'R.obj===\'ice\' && R.meltedOnce===true',note:'冰化成水物态变了，总质量不变。',audio:'c6s1-f3'}
    ],
    tasks:[]
  },
  audios:{
    'c6s1-intro':'guide/audio/c6s1-intro.mp3',
    'c6s1-s1':'guide/audio/c6s1-s1.mp3','c6s1-s2':'guide/audio/c6s1-s2.mp3',
    'c6s1-s3':'guide/audio/c6s1-s3.mp3','c6s1-s4':'guide/audio/c6s1-s4.mp3',
    'c6s1-s5':'guide/audio/c6s1-s5.mp3','c6s1-s6':'guide/audio/c6s1-s6.mp3',
    'c6s1-s7':'guide/audio/c6s1-s7.mp3','c6s1-s8':'guide/audio/c6s1-s8.mp3',
    'c6s1-e1':'guide/audio/c6s1-e1.mp3','c6s1-e2':'guide/audio/c6s1-e2.mp3',
    'c6s1-f1':'guide/audio/c6s1-f1.mp3','c6s1-f2':'guide/audio/c6s1-f2.mp3',
    'c6s1-f3':'guide/audio/c6s1-f3.mp3'
  }
};
window.GUIDE_CFG={state:window.C6S1_STATE,mode:'refract'};
window.GUIDE_DATA=window.C6S1_GUIDE;
```

---

## §B c6_s2 密度实验室（exp-density.html）

### B-1 状态暴露核查

闭包 `var state={}`（exp-density-core.js 行62~70），全文唯一赋值；页面含三子场景 e3（探究 m-V）/e4（密度水槽）/e5（物质鉴别），`resetE3()`（行1356）/`resetE4()`（行786）/`genE5()`（行805）均为原地改字段（其中 `e4.single`、`e5.blocks` 会整体替换嵌套对象——引擎每帧重新从 R 取当前引用求值，不受影响；state 本体稳定）。

**状态字段速查表**（出处均为 exp-density-core.js）：

| 字段 | 类型 | 取值 | 含义 | 出处 |
|---|---|---|---|---|
| scene | string | 'e3'\|'e4'\|'e5' | 当前子场景 | 行63；写 switchScene() 行1030/1033 |
| animating | bool | | 切场景锁输入窗 | 行63 |
| e3.mat | string | aluminum\|iron\|wood | 材质（RHO：铝2.7/铁7.9/木0.5，行14） | 行64；写 e3Select() 行395（钮 #btn-mat-*） |
| e3.v | number | 10\|20\|30 cm³ | 体积档（E3_VOLS 行16） | 行64；写 行395（钮 #btn-v10/20/30） |
| e3.block.loc | string | source\|drag\|pan\|cyl | 物块位置 | 行65；写 e3Drop() 行440 |
| e3.mKnown / e3.vKnown | bool | | 已称 m / 已测 V（列吸附落盘即置位） | 行65；写 行444 / 448 |
| e3.converged | bool | | 双测齐→汇聚动画 | 行65；写 行408 |
| e3.records | array | [{mat,v,m,ratio,t}] | 记录表（同 mat+v 覆盖不重复） | 行64；写 行414 |
| e4.dual / e4.sel | bool / 0\|1 | | 双块对比 / 选中块 | 行67；e4ToggleDual() 行767；双块初始=木5L2kg+铝5L13.5kg 行772 |
| e4.single / e4.duals | 块对象 | {preset,mat,v,m,x,y,loc...} | 水槽块（ρ=m/v，浮沉按 ρ≷1） | 行67；mkE4Block() 行469；初始木 行789 |
| e4.lvl | number | 基础100L起 | 水位（=基础+排水，平滑逼近） | 行67；写 行551~552 |
| e5.blocks | array(3) | {id,mat,v,m,mKnown,vKnown,revealed,solved,guess,verdict,vok,loc,stackOn} | 神秘块（ρ 全部出自教材表池，行24） | 行69；genE5() 行805、赋值 行817 |
| e5.sel | number | 0~2 | 选中块 | 行69；写 行933/937 落点 + syncE5Sel() 行965 |

**陷阱字段（trigger 禁用）**：`e3.drag/e4.drag/e5.drag`（行66/68/69，瞬态手势）、`e3.cylTw/e5.cylTw`（行66/69，水位 tween）、`e3.arw`（行66，汇聚动画）、`e3.dropT`（行64，落块动画时间戳，行402/1358/1417 写入后 250ms 清零）、`e4.splashes`（行68，涟漪）、`e5.fade`（行69，换题淡入淡出）、`block.x/y`（渲染坐标，位置判定认 `loc`）、`e3.cylFrac/e5.cylFrac`（动画水位值，测量判定认 `mKnown/vKnown`）。

**最小暴露方案**：在 state 声明闭合 `};`（**行70**）之后加一句：
```js
window.C6S2_STATE=state;
```

**物理口径锚点**（explain.html）：行81 同种物质质量与体积成正比、比值一定，不同物质比值互不相同；ρ=m/V 是量度式非决定式；1 g/cm³=1×10³ kg/m³；测密度对照密度表鉴别物质。页面自洽：E3 排水法水位差 20→20+V（e3CylW 行218，底水 E3_CYL_BASE=20 行28）；木块 ρ<水走筒底系线全浸（drawCylTether 行226，口径提示行1264）。

### B-2 steps（8 条，全 repeat:true；mode key=refract，跨子场景用 R.scene 闸门）

| id | trigger | say | audio | 核实出处 |
|---|---|---|---|---|
| c6s2-s1 | `delay:13000` | 下方选材质和大小，把物块拖去天平和量筒。 | c6s2-s1 | delay 型；延时待 intro 实测回填 |
| c6s2-s2 | `R.scene==='e3' && R.e3.mKnown===true` | 称出质量m！拖进量筒还能测体积。 | c6s2-s2 | 行444 |
| c6s2-s3 | `R.scene==='e3' && R.e3.vKnown===true` | 排水法：水位差就是物块的体积。 | c6s2-s3 | 行448；水位差口径 行218 |
| c6s2-s4 | `R.scene==='e3' && R.e3.records.length>=1` | m和V齐了，m÷V的比值自动入表。 | c6s2-s4 | records 写 行414 |
| c6s2-s5 | `R.scene==='e3' && R.e3.records.length>=2` | 同种物质的点，连成一条过原点的直线。 | c6s2-s5 | 行414；过原点比例线 drawE3Graph()（≈行292~340） |
| c6s2-s6 | `R.scene==='e3' && R.e3.records.some(...)`（见 B-5 完整式） | 换种物质再测——比值一般不同，这就是密度。 | c6s2-s6 | records.mat 行414；口径 explain 行81 |
| c6s2-s7 | `after:c6s2-s6@6000` | 因此我们得出结论：同种物质质量与体积成正比。 | c6s2-s7 | after 型@6000 |
| c6s2-s8 | `R.scene==='e5' && R.e5.blocks.some(function(b){return b.solved;})` | 算出密度查表对号，物质身份揭晓！ | c6s2-s8 | solved 写 行989 |

### B-3 errors（2 条，均事件型，抓提交鉴别瞬间）

| id | trigger | fix | audio | 核实出处 |
|---|---|---|---|---|
| c6s2-e1 | `event:click:#btn-submit:` + `R.scene==='e5'&&(!R.e5.blocks[R.e5.sel].mKnown\|\|!R.e5.blocks[R.e5.sel].vKnown)` | 不对哟～先称质量再测体积，都测完才能鉴别。 | c6s2-e1 | submitE5() 未测全分支 行986；#btn-submit 监听 行1328 |
| c6s2-e2 | `event:click:#btn-submit:` + `R.scene==='e5'&&R.e5.blocks[R.e5.sel].mKnown&&R.e5.blocks[R.e5.sel].vKnown&&!R.e5.blocks[R.e5.sel].guess` | 不对哟～先查密度表，选个材质再提交。 | c6s2-e2 | submitE5() 未选材质分支（行983~990）；guess 写 行1326（#sel-e5mat） |

### B-4 free（3 条，带状态闸门）

| trigger | note | audio | 核实出处 |
|---|---|---|---|
| `R.scene==='e4' && !R.e4.dual && R.e4.single && (R.e4.single.m/R.e4.single.v)>=1` | 这块密度比水大，沉底了。 | c6s2-f1 | single 行67；m/v 字段写 行469；浮沉口径 ρ≷ρ水 |
| `R.scene==='e4' && !R.e4.dual && R.e4.single && (R.e4.single.m/R.e4.single.v)<1` | 密度比水小，它漂起来啦！ | c6s2-f2 | 同上（初始木块 ρ=0.4，行789） |
| `R.scene==='e5' && R.e5.blocks.some(function(b){return b.loc==='cyl';})` | 水位升高了多少，体积就是多少。 | c6s2-f3 | loc='cyl' 写 行937；排水口径 行937~940 |

### B-5 guide-data.js（完整）

```js
/* content/physics_g8_v1_c6_s2/guide/guide-data.js */
window.C6S2_GUIDE={
  refract:{
    intro:{text:'密度是物质的身份数值：ρ等于m除以V。先称质量，再用排水法测体积，跟我来！',audio:'c6s2-intro'},
    steps:[
      {id:'c6s2-s1',repeat:true,trigger:'delay:13000',say:'下方选材质和大小，把物块拖去天平和量筒。',audio:'c6s2-s1'},
      {id:'c6s2-s2',repeat:true,trigger:'R.scene===\'e3\' && R.e3.mKnown===true',say:'称出质量m！拖进量筒还能测体积。',audio:'c6s2-s2'},
      {id:'c6s2-s3',repeat:true,trigger:'R.scene===\'e3\' && R.e3.vKnown===true',say:'排水法：水位差就是物块的体积。',audio:'c6s2-s3'},
      {id:'c6s2-s4',repeat:true,trigger:'R.scene===\'e3\' && R.e3.records.length>=1',say:'m和V齐了，m÷V的比值自动入表。',audio:'c6s2-s4'},
      {id:'c6s2-s5',repeat:true,trigger:'R.scene===\'e3\' && R.e3.records.length>=2',say:'同种物质的点，连成一条过原点的直线。',audio:'c6s2-s5'},
      {id:'c6s2-s6',repeat:true,trigger:'R.scene===\'e3\' && R.e3.records.some(function(a){return R.e3.records.some(function(b){return a.mat!==b.mat;});})',say:'换种物质再测——比值一般不同，这就是密度。',audio:'c6s2-s6'},
      {id:'c6s2-s7',repeat:true,trigger:'after:c6s2-s6@6000',say:'因此我们得出结论：同种物质质量与体积成正比。',audio:'c6s2-s7'},
      {id:'c6s2-s8',repeat:true,trigger:'R.scene===\'e5\' && R.e5.blocks.some(function(b){return b.solved;})',say:'算出密度查表对号，物质身份揭晓！',audio:'c6s2-s8'}
    ],
    errors:[
      {id:'c6s2-e1',trigger:'event:click:#btn-submit:R.scene===\'e5\'&&(!R.e5.blocks[R.e5.sel].mKnown||!R.e5.blocks[R.e5.sel].vKnown)',fix:'不对哟～先称质量再测体积，都测完才能鉴别。',audio:'c6s2-e1'},
      {id:'c6s2-e2',trigger:'event:click:#btn-submit:R.scene===\'e5\'&&R.e5.blocks[R.e5.sel].mKnown&&R.e5.blocks[R.e5.sel].vKnown&&!R.e5.blocks[R.e5.sel].guess',fix:'不对哟～先查密度表，选个材质再提交。',audio:'c6s2-e2'}
    ],
    free:[
      {trigger:'R.scene===\'e4\' && !R.e4.dual && R.e4.single && (R.e4.single.m/R.e4.single.v)>=1',note:'这块密度比水大，沉底了。',audio:'c6s2-f1'},
      {trigger:'R.scene===\'e4\' && !R.e4.dual && R.e4.single && (R.e4.single.m/R.e4.single.v)<1',note:'密度比水小，它漂起来啦！',audio:'c6s2-f2'},
      {trigger:'R.scene===\'e5\' && R.e5.blocks.some(function(b){return b.loc===\'cyl\';})',note:'水位升高了多少，体积就是多少。',audio:'c6s2-f3'}
    ],
    tasks:[]
  },
  audios:{
    'c6s2-intro':'guide/audio/c6s2-intro.mp3',
    'c6s2-s1':'guide/audio/c6s2-s1.mp3','c6s2-s2':'guide/audio/c6s2-s2.mp3',
    'c6s2-s3':'guide/audio/c6s2-s3.mp3','c6s2-s4':'guide/audio/c6s2-s4.mp3',
    'c6s2-s5':'guide/audio/c6s2-s5.mp3','c6s2-s6':'guide/audio/c6s2-s6.mp3',
    'c6s2-s7':'guide/audio/c6s2-s7.mp3','c6s2-s8':'guide/audio/c6s2-s8.mp3',
    'c6s2-e1':'guide/audio/c6s2-e1.mp3','c6s2-e2':'guide/audio/c6s2-e2.mp3',
    'c6s2-f1':'guide/audio/c6s2-f1.mp3','c6s2-f2':'guide/audio/c6s2-f2.mp3',
    'c6s2-f3':'guide/audio/c6s2-f3.mp3'
  }
};
window.GUIDE_CFG={state:window.C6S2_STATE,mode:'refract'};
window.GUIDE_DATA=window.C6S2_GUIDE;
```

---

## §C c6_s3 密度测量台（exp-measure.html，两阶段）

### C-1 状态暴露核查

闭包 `var state={}`（exp-measure-core.js 行61~71），全文唯一赋值；两阶段状态完全隔离（`s1`/`s2` 子对象），切阶段/重置均原地 mutate。**存在阶段字段 `state.stage`** → GUIDE_CFG.mode 用 getter 返回 `state.stage`，引擎每帧轮询到 's1'↔'s2' 切换即自动 onModeEnter（播各自 intro、清 repeat 状态），trigger 无需再带阶段前缀。

**状态字段速查表**（出处均为 exp-measure-core.js）：

| 字段 | 类型 | 取值 | 含义 | 出处 |
|---|---|---|---|---|
| stage | string | 's1'\|'s2' | 当前阶段（模式源） | 行62；写 setStage() 行1159/1162；钮 #btn-stage-s1/s2 行1224~1225 |
| animating | bool | | 切换锁窗（300ms 交叉淡化） | 行62 |
| bal.tilt / bal.tw | number / obj | | 横梁倾角（放置后单调归零） | 行64；写 行389/390；判平 balLeveled() 行397 |
| eyeDrag | bool | | 拖动观察眼中 | 行63；写 pointerdown 眼睛分支（≈行783）/清 行850~851 |
| s1.rho | number | 1.00~1.20 | 盐水密度（加盐递增；测后锁定） | 行65；写 setSaltRho() 行366；加盐锁 行912 |
| s1.beakerVol | number | 初100 mL | 杯中液体体积 | 行65；倾倒写 行930 |
| s1.cylMl | number | 0~100 | 量筒中盐水体积 | 行65；写 行930 |
| s1.m1 / s1.m2 | number\|null | | 杯+盐水总质量 / 杯+剩余质量 | 行66；写 doRecord() 行528 / 531 |
| s1.vConf | number\|null | | 已确认的量筒读数 V | 行66；写 doConfirm() 行1012 |
| s1.done | bool | | ρ 算出闭环 | 行66；写 s1TryFinish() 行968 |
| s1.beaker.loc | string | bench\|pan\|drag | 烧杯位置 | 行67；写 行797/862/854 |
| s1.pouring | bool | | 倾倒进行中 | 行68；写 行927（前置锁：须 m1 已记 行925~926） |
| s1.eyeT / s2.eyeT | number | 0~1（0.5=平视，初值0.25=俯视） | 观察眼位（按阶段隔离） | 行65/69；拖写 行829；θ 换算 行575；平视判定 行584（±2°，行28） |
| s2.stone | obj | {seed,V∈[15,20],rho∈[2.5,2.8],m,loc,sinkP,wet,vBase,sinkTw} | 石块 | 行69；mkStone() 行374；loc 写 pan 行874 / cyl 行891 / drag 行816 |
| s2.cur.{m,v1,v2,done} | number\|null / bool | | 当前测量三值 | 行69；写 行956 / 1015 / 1017；闭环 行981 |
| s2.injected | bool | | 已注水（目标 60 mL，行22） | 行69；写 行785 |
| s2.waterMl | number | 0~100 | 量筒水位 | 行69；沉石排水 行901 |
| s2.rows | array | 历史对比行 | 换石块归档 | 行69；写 行1206 |

常量：HOLLOW_CRIT=1.05（行19，选种临界）、CYL_CAP=100/分度5（行17）、CUP_MASS=58（行15）、BEAKER_INIT_ML=100（行16）、POUR_RATE=45（行21）。

**陷阱字段（trigger 禁用）**：`s1.drag/s2.drag`（行68/70 瞬态）、`s2.waterTw`、`s1.jar.pourTw`、`stone.sinkTw`、`bal.tw`（tween 瞬态）、`s1.grainT/grainT0/grainFrom/grainTo`（行68 种粒动画参数）、`eyeAlignBeep`（行63 一次性蜂鸣旗）、`s2.firstHintShown`（行70 一次性）、`stone.wet/sinkP/vBase`（动画量）、`bal.tilt`（影子显示值，读数稳定认 `s1.m1/m2`、`s2.cur.m`）；`openP`（面板开关）是闭包散变量**不在 state 内**，禁依赖。

**最小暴露方案**：在 state 声明闭合 `};`（**行71**）之后加一句：
```js
window.C6S3_STATE=state;
```
（stage/mode 联动由 guide-data.js 的 GUIDE_CFG getter 完成，见 C-5。）

**物理口径锚点**（explain.html）：行83 量筒读数视线与液面相平、凹液面最低处为准、俯视偏大仰视偏小；测盐水五步（测 m₁→倒部分入量筒读 V→测 m₂→m=m₁−m₂→ρ=m/V，差值法防杯壁残留致 ρ 偏小）；测石块：排水法 V=V₂−V₁、「适量」水、**先质量后体积**（否则沾水 m 偏大、ρ 偏大）。页面自洽：样例 m₁=162.0/m₂=110.0→m=52.0、V=50.0→ρ=1.04（文件头注释）；倾倒前置锁（行925~926）与教材顺序一致。

### C-2 steps（11 条：s1 链 6 条 + s2 链 5 条，全 repeat:true）

**阶段一 s1（测盐水）**：core 强制顺序 m₁→倒→V→m₂（行925~926、行475~480、行592），解说与操作流严格同序。

| id | trigger | say | audio | 核实出处 |
|---|---|---|---|---|
| c6s3-s1-s1 | `R.s1.rho>1.01` | 盐溶化了，盐水密度比清水大。 | c6s3-s1-s1 | rho 写 行366；初值 1.00 行65 |
| c6s3-s1-s2 | `R.s1.m1!==null` | 记下m₁：烧杯和盐水的总质量。 | c6s3-s1-s2 | 写 行528；口径 explain「测杯和盐水总质量 m₁」 |
| c6s3-s1-s3 | `R.s1.pouring===true` | 沿壁缓倒，把部分盐水倒入量筒。 | c6s3-s1-s3 | 写 行927；沿壁缓倒口径 explain |
| c6s3-s1-s4 | `R.s1.vConf!==null` | 平视凹液面最低处，读出体积V。 | c6s3-s1-s4 | 写 行1012；确认须平视 行1009；口径 explain 行83 |
| c6s3-s1-s5 | `R.s1.m2!==null` | 再称杯和剩余盐水m₂，m等于m₁减m₂。 | c6s3-s1-s5 | 写 行531；差值法口径 explain |
| c6s3-s1-s6 | `after:c6s3-s1-s5@6000` | 因此我们得出结论：盐水密度ρ等于m除以V。 | c6s3-s1-s6 | after 型@6000 |

**阶段二 s2（测石块）**：

| id | trigger | say | audio | 核实出处 |
|---|---|---|---|---|
| c6s3-s2-s1 | `R.s2.cur.m!==null` | 石块的质量m测好了。 | c6s3-s2-s1 | 写 行956 |
| c6s3-s2-s2 | `R.s2.cur.v1!==null` | 量筒装适量水，平视读出V₁。 | c6s3-s2-s2 | 写 行1015；注水 行785；「适量」口径 explain |
| c6s3-s2-s3 | `R.s2.stone!==null && R.s2.stone.loc==='cyl' && !R.s2.stone.sinkTw && R.s2.cur.v2===null` | 石块沉底，水位升高的体积就是它的体积。 | c6s3-s2-s3 | loc='cyl' 行891；沉底完成 行902；排水法口径 explain |
| c6s3-s2-s4 | `R.s2.cur.v2!==null` | 读出总体积V₂，V等于V₂减V₁。 | c6s3-s2-s4 | 写 行1017 |
| c6s3-s2-s5 | `after:c6s3-s2-s4@6000` | 因此我们得出结论：石块密度ρ等于m除以V。 | c6s3-s2-s5 | after 型@6000 |

### C-3 errors（2 条，按阶段各一）

| id | trigger | fix | audio | 核实出处 |
|---|---|---|---|---|
| c6s3-s1-e1 | `R.s1.cylMl>0.5 && (R.s1.eyeT<0.15\|\|R.s1.eyeT>0.85)` | 不对哟～要平视凹液面最低处再读数。 | c6s3-s1-e1 | eyeT 行65；平视=0.5 换算 行575；偏差模型 行585（俯>真>仰）；口径 explain 行83 |
| c6s3-s2-e1 | `R.s2.cur.v2!==null && R.s2.cur.m===null` | 不对哟～应先测质量，沾水再称m会偏大。 | c6s3-s2-e1 | cur.v2 行1017、cur.m 行956；顺序口径 explain（先质量后体积，沾水 ρ 偏大） |

### C-4 free（3 条，带状态闸门）

| trigger | note | audio | 核实出处 |
|---|---|---|---|
| `R.eyeDrag===true && R.stage==='s1'` | 上下拖眼睛，视线与凹液面相平再读数。 | c6s3-s1-f1 | eyeDrag 行63；命中分支 行758 |
| `R.s1.rho>=1.05` | ρ达到1.05，空瘪粒上浮，能选种啦！ | c6s3-s1-f2 | HOLLOW_CRIT 行19；写 行366 |
| `R.s2.rows.length>=1` | 换块石头再测：同种物质，密度一定。 | c6s3-s2-f1 | rows.push 行1206；呼应口径 explain |

### C-5 guide-data.js（完整，两阶段分两个 mode key：s1 / s2）

```js
/* content/physics_g8_v1_c6_s3/guide/guide-data.js */
window.C6S3_GUIDE={
  s1:{
    intro:{text:'先配一杯盐水：用天平测质量，量筒测体积，再用ρ等于m除以V算密度。',audio:'c6s3-s1-intro'},
    steps:[
      {id:'c6s3-s1-s1',repeat:true,trigger:'R.s1.rho>1.01',say:'盐溶化了，盐水密度比清水大。',audio:'c6s3-s1-s1'},
      {id:'c6s3-s1-s2',repeat:true,trigger:'R.s1.m1!==null',say:'记下m₁：烧杯和盐水的总质量。',audio:'c6s3-s1-s2'},
      {id:'c6s3-s1-s3',repeat:true,trigger:'R.s1.pouring===true',say:'沿壁缓倒，把部分盐水倒入量筒。',audio:'c6s3-s1-s3'},
      {id:'c6s3-s1-s4',repeat:true,trigger:'R.s1.vConf!==null',say:'平视凹液面最低处，读出体积V。',audio:'c6s3-s1-s4'},
      {id:'c6s3-s1-s5',repeat:true,trigger:'R.s1.m2!==null',say:'再称杯和剩余盐水m₂，m等于m₁减m₂。',audio:'c6s3-s1-s5'},
      {id:'c6s3-s1-s6',repeat:true,trigger:'after:c6s3-s1-s5@6000',say:'因此我们得出结论：盐水密度ρ等于m除以V。',audio:'c6s3-s1-s6'}
    ],
    errors:[
      {id:'c6s3-s1-e1',trigger:'R.s1.cylMl>0.5 && (R.s1.eyeT<0.15||R.s1.eyeT>0.85)',fix:'不对哟～要平视凹液面最低处再读数。',audio:'c6s3-s1-e1'}
    ],
    free:[
      {trigger:'R.eyeDrag===true && R.stage===\'s1\'',note:'上下拖眼睛，视线与凹液面相平再读数。',audio:'c6s3-s1-f1'},
      {trigger:'R.s1.rho>=1.05',note:'ρ达到1.05，空瘪粒上浮，能选种啦！',audio:'c6s3-s1-f2'}
    ],
    tasks:[]
  },
  s2:{
    intro:{text:'不规则的小石块：天平测质量，排水法测体积，V等于V₂减V₁。',audio:'c6s3-s2-intro'},
    steps:[
      {id:'c6s3-s2-s1',repeat:true,trigger:'R.s2.cur.m!==null',say:'石块的质量m测好了。',audio:'c6s3-s2-s1'},
      {id:'c6s3-s2-s2',repeat:true,trigger:'R.s2.cur.v1!==null',say:'量筒装适量水，平视读出V₁。',audio:'c6s3-s2-s2'},
      {id:'c6s3-s2-s3',repeat:true,trigger:'R.s2.stone!==null && R.s2.stone.loc===\'cyl\' && !R.s2.stone.sinkTw && R.s2.cur.v2===null',say:'石块沉底，水位升高的体积就是它的体积。',audio:'c6s3-s2-s3'},
      {id:'c6s3-s2-s4',repeat:true,trigger:'R.s2.cur.v2!==null',say:'读出总体积V₂，V等于V₂减V₁。',audio:'c6s3-s2-s4'},
      {id:'c6s3-s2-s5',repeat:true,trigger:'after:c6s3-s2-s4@6000',say:'因此我们得出结论：石块密度ρ等于m除以V。',audio:'c6s3-s2-s5'}
    ],
    errors:[
      {id:'c6s3-s2-e1',trigger:'R.s2.cur.v2!==null && R.s2.cur.m===null',fix:'不对哟～应先测质量，沾水再称m会偏大。',audio:'c6s3-s2-e1'}
    ],
    free:[
      {trigger:'R.s2.rows.length>=1',note:'换块石头再测：同种物质，密度一定。',audio:'c6s3-s2-f1'}
    ],
    tasks:[]
  },
  audios:{
    'c6s3-s1-intro':'guide/audio/c6s3-s1-intro.mp3',
    'c6s3-s1-s1':'guide/audio/c6s3-s1-s1.mp3','c6s3-s1-s2':'guide/audio/c6s3-s1-s2.mp3',
    'c6s3-s1-s3':'guide/audio/c6s3-s1-s3.mp3','c6s3-s1-s4':'guide/audio/c6s3-s1-s4.mp3',
    'c6s3-s1-s5':'guide/audio/c6s3-s1-s5.mp3','c6s3-s1-s6':'guide/audio/c6s3-s1-s6.mp3',
    'c6s3-s1-e1':'guide/audio/c6s3-s1-e1.mp3',
    'c6s3-s1-f1':'guide/audio/c6s3-s1-f1.mp3','c6s3-s1-f2':'guide/audio/c6s3-s1-f2.mp3',
    'c6s3-s2-intro':'guide/audio/c6s3-s2-intro.mp3',
    'c6s3-s2-s1':'guide/audio/c6s3-s2-s1.mp3','c6s3-s2-s2':'guide/audio/c6s3-s2-s2.mp3',
    'c6s3-s2-s3':'guide/audio/c6s3-s2-s3.mp3','c6s3-s2-s4':'guide/audio/c6s3-s2-s4.mp3',
    'c6s3-s2-s5':'guide/audio/c6s3-s2-s5.mp3','c6s3-s2-e1':'guide/audio/c6s3-s2-e1.mp3',
    'c6s3-s2-f1':'guide/audio/c6s3-s2-f1.mp3'
  }
};
window.GUIDE_CFG={state:window.C6S3_STATE,get mode(){return window.C6S3_STATE.stage;}};
window.GUIDE_DATA=window.C6S3_GUIDE;
```

---

## §D 音频 clip 总清单（三实验一张大表，前缀区分；预估=字数÷4+0.5s，TTS 落盘后一律 afinfo 实测回填）

| clip id | 文本 | 预估秒数 |
|---|---|---|
| c6s1-intro | 欢迎来到天平实验室！口诀：先调平，左物右码，读数等于砝码加游码。 | 9.0 |
| c6s1-s1 | 天平放在水平台，先把游码拨到左端零刻度。 | 5.5 |
| c6s1-s2 | 旋平衡螺母，让指针指在分度盘中线。 | 4.5 |
| c6s1-s3 | 指针指中线，横梁调平啦！ | 3.5 |
| c6s1-s4 | 物体放左盘，砝码放右盘，左物右码。 | 5.0 |
| c6s1-s5 | 右盘加减砝码，由大到小试。 | 4.0 |
| c6s1-s6 | 微调游码，直到横梁再次平衡。 | 4.0 |
| c6s1-s7 | 读数=砝码总质量+游码示数，游码看左边缘。 | 6.0 |
| c6s1-s8 | 因此我们得出结论：m等于砝码总质量加游码示数。 | 6.5 |
| c6s1-e1 | 不对哟～还没调平，读数是错的，先调平再称。 | 6.0 |
| c6s1-e2 | 不对哟～调平前，先把游码移回零刻度线。 | 5.5 |
| c6s1-f1 | 形状变了，读数不变——质量不随形状改变。 | 5.5 |
| c6s1-f2 | 换到别处重力变了，质量可不变哟。 | 4.5 |
| c6s1-f3 | 冰化成水物态变了，总质量不变。 | 4.5 |
| c6s2-intro | 密度是物质的身份数值：ρ等于m除以V。先称质量，再用排水法测体积，跟我来！ | 9.5 |
| c6s2-s1 | 下方选材质和大小，把物块拖去天平和量筒。 | 5.5 |
| c6s2-s2 | 称出质量m！拖进量筒还能测体积。 | 4.5 |
| c6s2-s3 | 排水法：水位差就是物块的体积。 | 4.5 |
| c6s2-s4 | m和V齐了，m÷V的比值自动入表。 | 4.5 |
| c6s2-s5 | 同种物质的点，连成一条过原点的直线。 | 5.0 |
| c6s2-s6 | 换种物质再测——比值一般不同，这就是密度。 | 6.0 |
| c6s2-s7 | 因此我们得出结论：同种物质质量与体积成正比。 | 6.0 |
| c6s2-s8 | 算出密度查表对号，物质身份揭晓！ | 4.5 |
| c6s2-e1 | 不对哟～先称质量再测体积，都测完才能鉴别。 | 6.0 |
| c6s2-e2 | 不对哟～先查密度表，选个材质再提交。 | 5.0 |
| c6s2-f1 | 这块密度比水大，沉底了。 | 3.5 |
| c6s2-f2 | 密度比水小，它漂起来啦！ | 3.5 |
| c6s2-f3 | 水位升高了多少，体积就是多少。 | 4.5 |
| c6s3-s1-intro | 先配一杯盐水：用天平测质量，量筒测体积，再用ρ等于m除以V算密度。 | 9.0 |
| c6s3-s1-s1 | 盐溶化了，盐水密度比清水大。 | 4.0 |
| c6s3-s1-s2 | 记下m₁：烧杯和盐水的总质量。 | 4.5 |
| c6s3-s1-s3 | 沿壁缓倒，把部分盐水倒入量筒。 | 4.5 |
| c6s3-s1-s4 | 平视凹液面最低处，读出体积V。 | 4.5 |
| c6s3-s1-s5 | 再称杯和剩余盐水m₂，m等于m₁减m₂。 | 5.5 |
| c6s3-s1-s6 | 因此我们得出结论：盐水密度ρ等于m除以V。 | 6.0 |
| c6s3-s1-e1 | 不对哟～要平视凹液面最低处再读数。 | 5.0 |
| c6s3-s1-f1 | 上下拖眼睛，视线与凹液面相平再读数。 | 5.0 |
| c6s3-s1-f2 | ρ达到1.05，空瘪粒上浮，能选种啦！ | 5.0 |
| c6s3-s2-intro | 不规则的小石块：天平测质量，排水法测体积，V等于V₂减V₁。 | 8.0 |
| c6s3-s2-s1 | 石块的质量m测好了。 | 3.0 |
| c6s3-s2-s2 | 量筒装适量水，平视读出V₁。 | 4.0 |
| c6s3-s2-s3 | 石块沉底，水位升高的体积就是它的体积。 | 5.5 |
| c6s3-s2-s4 | 读出总体积V₂，V等于V₂减V₁。 | 4.5 |
| c6s3-s2-s5 | 因此我们得出结论：石块密度ρ等于m除以V。 | 6.0 |
| c6s3-s2-e1 | 不对哟～应先测质量，沾水再称m会偏大。 | 5.5 |
| c6s3-s2-f1 | 换块石头再测：同种物质，密度一定。 | 5.0 |

合计 **46 条**（c6s1 14 + c6s2 14 + c6s3 18），总时长约 3.9 分钟，体积无压力（规范§4）。TTS 注意：「～」不发音只做停顿；m₁/m₂/V₁/V₂ 读「m一／m二／V一／V二」；ρ 读「rou」；全批统一 `zh-CN-XiaoxiaoNeural` 1.0x；文件名=clip id，存各节 `guide/audio/`。

---

## §E 接线备忘（供后续开发单，本设计书零代码改动）

1. 每页 core.js 各加一行暴露（A-1/B-1/C-1 指定行号后）；`<script>` 加载顺序：`…-core.js`（暴露 C6Sx_STATE）→ `guide/guide-data.js`（设 GUIDE_CFG/GUIDE_DATA，**必须先于 engine**，因引擎 IIFE 顶部即捕获 R）→ `../_lib/guide/engine-core.js` → `../_lib/guide/vB-core.js` → 页内补 `#guide-layer` 容器与 guide-core.css（字幕条用 `.ctrlbar` 测底边距，三页均有 ✓）。
2. delay 型开场步（c6s1-s1/c6s2-s1）的 13000 为预估值，音频落盘后按规范 §2.3 用 afinfo 实测时长+1s 回填。
3. 交付时 html 四处引用（含 guide 新增）统一 `?v=` bump，提醒强刷。

（完）

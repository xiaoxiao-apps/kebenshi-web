# c5 第2/3节两实验页 · 语音讲解层设计书（B 版标配）

> 目标页面：`content/physics_g8_v1_c5_s2/exp-lens-life.html`（§A 生活中的透镜 · 三场景：cam 照相机 / proj 投影仪 / mag 放大镜）/ `content/physics_g8_v1_c5_s3/exp-image-law.html`（§B 探究凸透镜成像的规律 · 光具座单场景）
> 规范依据：`~/.openclaw/workspace/可交互教材/实验语音讲解层改造规范-B版标配.md`（steps 全 repeat:true、即时打断、状态闸门、五类语音全带 audio、event: 前缀、结论条 after:xxx@6000）；格式参照 `docs/c6-guide-design.md`。
> 物理口径权威源=各节 `explain.html`，本文所有解说词与其逐条对齐，数值口径零臆造。
> 引擎能力核实（`content/_lib/guide/engine-core.js`）：
> - `parseTrigger()` 五种（行32~44）：`delay:N`（行36）/ `after:ID@N`（行37）/ `event:事件:选择器[:expr]`（行38~40，capture 即时判定、读点击前状态、不拦截原逻辑）/ `expr@N` 持续满足（行42）/ 纯 expr 边沿（行43）。
> - 状态源 `R=(GUIDE_CFG.state)||window.MRR`（行12）；数据源 `window.GUIDE_DATA`（行13）；模式源 `(GUIDE_CFG.mode)||(R.mode)` 每帧轮询（tick 行415）→ **c5s2 三场景用 GUIDE_CFG.mode getter 跟随 state.scene（照 c6s3 stage getter 先例）；c5s3 单场景设固定 mode key**。
> - repeat:true 边沿重触发+3s 冷却（REP_COOLDOWN 行18）；delay 型 repeat 有 delayFired 守卫、每次进模式只发一次（行187~188）；errors 电平 5s 节流（tickErrors 行232）、支持 @N hold（holdMs 分支）；free 边沿+8s 节流（tickFree 行253）；事件型由 bindEventTriggers（行268）动态扫描 DATA 全部 event: trigger 去重绑定，steps/errors/free 三类均分发。
> - G 字段核查：可用仅 `G.t`（行93 每帧写入）/`G.modeEnterT`（行95、onModeEnter 行342）；`G.angChangeCount/G.lastAngChangeT` 监听 R.angleI（行126~137）——两页均无 R.angleI 字段，**禁用**；`G.recCount` 采集依赖 `#rec-table tbody .c-do`（c5s3 记录表是 #rec-body，恒 0）、`G.objChangeCount` 依赖 R.doCm、`G.eqMoveGestureCount` 依赖 R.eqState/R.eqDo、`G.everLit` 依赖 R.objLit——全为 c4_s3 专属采集链，两页无这些字段一律恒假，**禁用**。本设计 trigger 只用 `R.*` 与 `G.t/G.modeEnterT`（仅 c5s3-s2 闸门一处）。
> - 同帧多条规则：tickSteps 每帧按数组序只发第一条（return），其余条目下一帧补边沿（repPrev 未被处理不丢触发）；随后 tickErrors、tickFree。即时打断制下后发者掐先发者——本设计所有同帧可同真条目已做互斥核查（各表附注）。
> - vB 皮肤走 `_lib/guide/vB-core.js`（通用版读 `window.GUIDE_DATA.audios`），零改动。

---

## §A c5_s2 生活中的透镜（exp-lens-life.html）

### A-1 状态暴露核查

状态在 IIFE 闭包 `var state={}`（exp-lens-life-core.js **行35**，闭合 `};` **行41**），**全文唯一赋值**（grep `state\s*=\s*{` 唯一命中行35），其后 resetCam()（行841）/resetProj()（行851）/resetMag()（行861）/switchScene()（行900~908）全部原地 mutate；cam/proj/mag 三子对象从不整体替换（reset 均逐字段写）→ 满足引擎「稳定对象原地 mutate」要求，**直接引用赋值即可，无需 c3_s1 不可枚举 getter 聚合、也无需 c3_s2 Proxy**。调试通道 `window.__c5s2dbg.get state()`（行953）佐证对象长期存活。

**状态字段速查表**（出处均为 exp-lens-life-core.js）：

| 字段 | 类型 | 取值/范围 | 含义 | 写入点 |
|---|---|---|---|---|
| scene | string | 'cam'\|'proj'\|'mag' | 当前场景（=mode 源，getter 轮询） | 声明行36；switchScene() 行903 |
| animating | bool | | 切场景 600ms 锁输入窗（ANIM_DUR 行19） | 行37；置行904、清行939 |
| anim | obj\|null | {from,to,t0} | 飞入飞出动画参数 | 行37；置行904、清行939 |
| cam.u | number | 17~30，初22（U_MIN/U_DEF 行7） | 照相机物距 cm；f=8（行5）恒 u>2f | 行38；画布整拖行769 |
| cam.vTube | number | 9~15，初13（行8） | 筒距=透镜到薄膜（像距） | 行38；拖后筒行768、滑杆 #rng-camf 行826 |
| cam.focused | bool | 电平 | 当前帧清晰：\|vTube−v像\|≤0.6（isFocused 行98，FOCUS_TOL 行6） | 行38；checkFocus() 置行705、清行710 |
| cam.everFocused | bool | 闩锁（reset 清行843） | 曾对上焦 | 行38；置行705 |
| cam.everDragLed | bool | 闩锁 | 曾整拖相机改 u | 行38；置行769 |
| cam.chalH0 | number | 0=未设 | 挑战基线像高 | 行38；唯一置点 sayHint() 行646（**删除依赖警示见 A-7**） |
| cam.chalDone | bool | 闩锁 | 挑战达成：focused 且像高>基线×1.1 | 行38；置行712 |
| proj.u | number | 7~9.5，初7.8（行16） | 投影仪物距；f₂=5（F2_CM 行15）恒 f<u<2f，对焦点 u*≈7.1（行103 注释） | 行39；拖透镜行755、滑杆 #rng-pf 行837 |
| proj.flipped | bool | | 投影片已倒插 | 行39；#btn-flip 行886 |
| proj.focused | bool | 电平 | 清晰：\|v像−屏距\|≤0.6（isFocused2 行119，PROJ_TOL 行17） | 行39；checkFocus2() 置行721、清行726 |
| proj.everFocused | bool | 闩锁 | 曾对上焦 | 行39；置行721 |
| proj.everFlip | bool | 闩锁 | 曾点过倒插钮 | 行39；置行886 |
| proj.pfSet | bool | 闩锁 | 曾调过焦（本设计未用） | 行39；置行755/837 |
| mag.u | number | 2~7.0，初5（U3_MIN/MAX/DEF 行18） | 放大镜物距；上限 7.0<f=8 恒虚像区 | 行40；拖透镜行758 |
| mag.everDrag | bool | 闩锁 | 曾拖过透镜 | 行40；置行758 |
| mag.screenX | number\|null | null=在托盘 | 光屏放置 x（画布坐标） | 行40；endDrag 置行778/780 |
| mag.everScreen | bool | 闩锁 | 曾把屏放到透镜左侧虚像区 | 行40；置行782 |

派生函数（闭包函数，trigger 不可调用）：`vImg()` 行96、`imgHCm()` 行97、`isFocused()` 行98、`vImg2()` 行116、`isFocused2()` 行119、`vImg3()` 行123、`dimAlpha()` 行127。清晰判定 trigger 一律认 `cam.focused`/`proj.focused` 电平字段（checkFocus/checkFocus2 在拖拽、滑杆、pointerup 全路径逐帧边检，行755/768/791/826/837），无需内联透镜公式。

**陷阱字段（trigger 禁用）**：`animating/anim`（行37，切换瞬态）；`drag/startPt/glowFx/toastTimer/hintSt`（行43/44/601 等闭包散变量，不在 state 内）；`showRays/showLabels`（行34 闭包散变量——光路/标注开关状态**不可读**，free 条目一律不挂显示开关）；`cam.chalH0`（基线快照非状态语义）；`mag.screenX` 数值本体（渲染坐标，位置语义只认 everScreen 闩锁）。

**最小暴露方案**：state 声明闭合 `};`（**行41**）之后加一句：
```js
window.C5S2_STATE=state;
```
**mode 源**：state 无 mode 字段（只有 scene），禁改 core 字段名 → 照 c6s3 先例（docs/c6-guide-design.md §C-5）用 GUIDE_CFG getter 返回 scene，引擎 tick 行415 每帧轮询，切场景即 onModeEnter（播对应 intro+clearRepeatState），**trigger 无需 R.scene 前缀（mode 天然隔离）**：
```js
window.GUIDE_CFG={state:window.C5S2_STATE,get mode(){return window.C5S2_STATE.scene;}};
```

**物理口径锚点**（explain.html）：行77 照相机 u>2f 成倒立缩小实像、像与物在镜头两侧；行80 像变大=靠近被摄物体+拉长暗箱（物近、像远、像变大）；行97 投影仪投影片在 f 与 2f 之间、屏上倒立放大实像；行101~103 倒插三步（f<u<2f 成倒立实像→正插屏上颠倒→倒插呈现正立）；行123 放大镜 u<f 正立放大虚像；行124 虚像=折射光线反向延长线相交、同侧、屏承接不了；行125 适当远离物体虚像更大、必须在焦点以内使用；行131 物距越接近焦距虚像越大；行142 实像都是倒立的。页面自洽：cam f=8、u∈[17,30] 恒>2f ✓；proj f₂=5、u∈[7,9.5] 恒 f<u<2f ✓（光路 span 24cm 行102）；mag f=8、u∈[2,7.0] 恒<f ✓。

### A-2 steps（12 条：cam 4 + proj 4 + mag 4，全 repeat:true；mode=scene，trigger 免 R.scene 前缀）

**cam 照相机**（进模式播 intro 后接 delay 步；chalH0/chalDone 因 hint 删除失活，未用）：

| id | trigger | say（≤25字） | audio | 核实出处 |
|---|---|---|---|---|
| c5s2-c-s1 | `delay:13000` | 拖动后面的纸筒调筒距，直到薄膜上的F变清晰。 | c5s2-c-s1 | delay 型（规范§2.3）；延时=intro afinfo 实测+1s 回填，此处预估 |
| c5s2-c-s2 | `R.cam.focused===true` | 对上焦啦！倒立、缩小的实像。 | c5s2-c-s2 | focused 置行705/清行710；isFocused() 行98；口径 explain 行77 |
| c5s2-c-s3 | `R.cam.everDragLed===true && R.cam.focused===false && R.cam.u<22` | 物移近了像会变大，拉长后筒重新对焦。 | c5s2-c-s3 | everDragLed 置行769；u<22=U_DEF 行7；口径 explain 行80「物近、像远、像变大」 |
| c5s2-c-s4 | `after:c5s2-c-s2@6000` | 因此我们得出结论：照相机成倒立缩小的实像。 | c5s2-c-s4 | after 型@6000（规范§2.4）；口径 explain 行77 |

同帧互斥核查：c-s2（focused）与 c-s3（!focused）电平互斥 ✓；c-s4 依赖 c-s2 触发计数，晚 6s ✓；c-s3/c-f1 均加 u<22 闸门（U_DEF=22 行7）——像高=4.1×8/(u−8) 随 u 单调减（imgHCm 行97），u<22 ⇔ 像比初态大，保证「物近像远像变大」方向语义成立（explain 行80）。

**proj 投影仪**：

| id | trigger | say | audio | 核实出处 |
|---|---|---|---|---|
| c5s2-p-s1 | `delay:13000` | 拖动调焦滑杆或透镜，让幕布上出现清晰的像。 | c5s2-p-s1 | delay 型；滑杆 #rng-pf 行835~838、拖透镜行755 |
| c5s2-p-s2 | `R.proj.focused===true` | 清晰啦！幕布上是倒立、放大的实像。 | c5s2-p-s2 | focused 置行721/清行726；isFocused2() 行119；口径 explain 行97 |
| c5s2-p-s3 | `R.proj.flipped===true` | 投影片倒插，屏幕上的像就正立啦。 | c5s2-p-s3 | flipped 写行886（#btn-flip）；口径 explain 行101~103 倒插三步 |
| c5s2-p-s4 | `after:c5s2-p-s3@6000` | 因此我们得出结论：投影仪成倒立放大的实像。 | c5s2-p-s4 | after 型@6000；口径 explain 行97 |

同帧核查：p-s2/p-s3 罕见同帧（对焦态点倒插）→ 数组序 p-s3 下一帧后发掐 p-s2，即时打断制下语义最新者胜，可接受。

**mag 放大镜**：

| id | trigger | say | audio | 核实出处 |
|---|---|---|---|---|
| c5s2-m-s1 | `delay:13000` | 拖动放大镜远离物体，看虚像越来越大。 | c5s2-m-s1 | delay 型；拖透镜行756~758；口径 explain 行125「适当远离物体虚像更大」 |
| c5s2-m-s2 | `R.mag.everDrag===true` | 透过透镜看：正立放大的虚像，和物体同侧。 | c5s2-m-s2 | everDrag 置行758；口径 explain 行123~124 |
| c5s2-m-s3 | `R.mag.everScreen===true` | 屏上没有像——虚像不能用光屏承接。 | c5s2-m-s3 | everScreen 置行782；口径 explain 行124；core toast 同义行784 |
| c5s2-m-s4 | `after:c5s2-m-s3@6000` | 因此我们得出结论：放大镜成正立放大的虚像。 | c5s2-m-s4 | after 型@6000；口径 explain 行123 |

### A-3 errors（3 条，电平触发 5s 节流）

| id | trigger | fix | audio | 核实出处 |
|---|---|---|---|---|
| c5s2-c-e1 | `(R.cam.vTube<=9.05||R.cam.vTube>=14.95) && R.cam.focused===false` | 不对哟～筒到头还不清晰，微调物距再试试。 | c5s2-c-e1 | V_MIN=9/V_MAX=15 行8；focused 行705/710 |
| c5s2-p-e1 | `R.proj.u>=9.4 && R.proj.focused===false` | 不对哟～透镜拖太远啦，往回慢慢移看幕布对焦。 | c5s2-p-e1 | U2_MAX=9.5 行16；对焦点 u*≈7.1 行103 注释；focused2 行721/726 |
| c5s2-m-e1 | `R.mag.u>=6.95` | 不对哟～放大镜要在焦点以内用，往回拉一点。 | c5s2-m-e1 | U3_MAX=7.0 行18；core 上限提示同义行759~761；口径 explain 行125「必须在焦点以内使用」 |

### A-4 free（3 条，均带状态闸门，与 errors/steps 条件互斥）

| trigger | note | audio | 核实出处 |
|---|---|---|---|
| `R.cam.focused===true && R.cam.everDragLed===true && R.cam.u<22` | 物近、像远、像变大，规律就是这个～ | c5s2-c-f1 | everDragLed 行769；u<22=U_DEF 行7；口径 explain 行80；与 c-s3（!focused）互斥 ✓ |
| `R.proj.everFlip===true && R.proj.flipped===false` | 正着插回去，屏上的像又颠倒啦。 | c5s2-p-f1 | everFlip/flipped 写行886；口径 explain 行102「正着插，实像就会颠倒」 |
| `R.mag.u>=6.8 && R.mag.u<6.95` | 越接近焦点，虚像越大也越淡哦。 | c5s2-m-f1 | 阈值 0.85f=6.8 照 core m-dim 行612；口径 explain 行131「物距越接近焦距，虚像越大」；上界 6.95 与 m-e1 互斥 ✓ |

### A-5 guide-data.js（完整，三场景三个 mode key：cam / proj / mag）

```js
/* content/physics_g8_v1_c5_s2/guide/guide-data.js */
window.C5S2_GUIDE={
  cam:{
    intro:{text:'模型照相机：前筒嵌凸透镜，后筒蒙薄膜当底片。u大于2f，成倒立缩小的实像。',audio:'c5s2-c-intro'},
    steps:[
      {id:'c5s2-c-s1',repeat:true,trigger:'delay:13000',say:'拖动后面的纸筒调筒距，直到薄膜上的F变清晰。',audio:'c5s2-c-s1'},
      {id:'c5s2-c-s2',repeat:true,trigger:'R.cam.focused===true',say:'对上焦啦！倒立、缩小的实像。',audio:'c5s2-c-s2'},
      {id:'c5s2-c-s3',repeat:true,trigger:'R.cam.everDragLed===true && R.cam.focused===false && R.cam.u<22',say:'物移近了像会变大，拉长后筒重新对焦。',audio:'c5s2-c-s3'},
      {id:'c5s2-c-s4',repeat:true,trigger:'after:c5s2-c-s2@6000',say:'因此我们得出结论：照相机成倒立缩小的实像。',audio:'c5s2-c-s4'}
    ],
    errors:[
      {id:'c5s2-c-e1',trigger:'(R.cam.vTube<=9.05||R.cam.vTube>=14.95) && R.cam.focused===false',fix:'不对哟～筒到头还不清晰，微调物距再试试。',audio:'c5s2-c-e1'}
    ],
    free:[
      {trigger:'R.cam.focused===true && R.cam.everDragLed===true && R.cam.u<22',note:'物近、像远、像变大，规律就是这个～',audio:'c5s2-c-f1'}
    ],
    tasks:[]
  },
  proj:{
    intro:{text:'投影仪：投影片放在f和2f之间，幕布上成倒立放大的实像。先调焦找到清晰的像！',audio:'c5s2-p-intro'},
    steps:[
      {id:'c5s2-p-s1',repeat:true,trigger:'delay:13000',say:'拖动调焦滑杆或透镜，让幕布上出现清晰的像。',audio:'c5s2-p-s1'},
      {id:'c5s2-p-s2',repeat:true,trigger:'R.proj.focused===true',say:'清晰啦！幕布上是倒立、放大的实像。',audio:'c5s2-p-s2'},
      {id:'c5s2-p-s3',repeat:true,trigger:'R.proj.flipped===true',say:'投影片倒插，屏幕上的像就正立啦。',audio:'c5s2-p-s3'},
      {id:'c5s2-p-s4',repeat:true,trigger:'after:c5s2-p-s3@6000',say:'因此我们得出结论：投影仪成倒立放大的实像。',audio:'c5s2-p-s4'}
    ],
    errors:[
      {id:'c5s2-p-e1',trigger:'R.proj.u>=9.4 && R.proj.focused===false',fix:'不对哟～透镜拖太远啦，往回慢慢移看幕布对焦。',audio:'c5s2-p-e1'}
    ],
    free:[
      {trigger:'R.proj.everFlip===true && R.proj.flipped===false',note:'正着插回去，屏上的像又颠倒啦。',audio:'c5s2-p-f1'}
    ],
    tasks:[]
  },
  mag:{
    intro:{text:'放大镜就是凸透镜：u小于f，透过透镜看到正立放大的虚像，和物体在同一侧。',audio:'c5s2-m-intro'},
    steps:[
      {id:'c5s2-m-s1',repeat:true,trigger:'delay:13000',say:'拖动放大镜远离物体，看虚像越来越大。',audio:'c5s2-m-s1'},
      {id:'c5s2-m-s2',repeat:true,trigger:'R.mag.everDrag===true',say:'透过透镜看：正立放大的虚像，和物体同侧。',audio:'c5s2-m-s2'},
      {id:'c5s2-m-s3',repeat:true,trigger:'R.mag.everScreen===true',say:'屏上没有像——虚像不能用光屏承接。',audio:'c5s2-m-s3'},
      {id:'c5s2-m-s4',repeat:true,trigger:'after:c5s2-m-s3@6000',say:'因此我们得出结论：放大镜成正立放大的虚像。',audio:'c5s2-m-s4'}
    ],
    errors:[
      {id:'c5s2-m-e1',trigger:'R.mag.u>=6.95',fix:'不对哟～放大镜要在焦点以内用，往回拉一点。',audio:'c5s2-m-e1'}
    ],
    free:[
      {trigger:'R.mag.u>=6.8 && R.mag.u<6.95',note:'越接近焦点，虚像越大也越淡哦。',audio:'c5s2-m-f1'}
    ],
    tasks:[]
  },
  audios:{
    'c5s2-c-intro':'guide/audio/c5s2-c-intro.mp3',
    'c5s2-c-s1':'guide/audio/c5s2-c-s1.mp3','c5s2-c-s2':'guide/audio/c5s2-c-s2.mp3',
    'c5s2-c-s3':'guide/audio/c5s2-c-s3.mp3','c5s2-c-s4':'guide/audio/c5s2-c-s4.mp3',
    'c5s2-c-e1':'guide/audio/c5s2-c-e1.mp3','c5s2-c-f1':'guide/audio/c5s2-c-f1.mp3',
    'c5s2-p-intro':'guide/audio/c5s2-p-intro.mp3',
    'c5s2-p-s1':'guide/audio/c5s2-p-s1.mp3','c5s2-p-s2':'guide/audio/c5s2-p-s2.mp3',
    'c5s2-p-s3':'guide/audio/c5s2-p-s3.mp3','c5s2-p-s4':'guide/audio/c5s2-p-s4.mp3',
    'c5s2-p-e1':'guide/audio/c5s2-p-e1.mp3','c5s2-p-f1':'guide/audio/c5s2-p-f1.mp3',
    'c5s2-m-intro':'guide/audio/c5s2-m-intro.mp3',
    'c5s2-m-s1':'guide/audio/c5s2-m-s1.mp3','c5s2-m-s2':'guide/audio/c5s2-m-s2.mp3',
    'c5s2-m-s3':'guide/audio/c5s2-m-s3.mp3','c5s2-m-s4':'guide/audio/c5s2-m-s4.mp3',
    'c5s2-m-e1':'guide/audio/c5s2-m-e1.mp3','c5s2-m-f1':'guide/audio/c5s2-m-f1.mp3'
  }
};
window.GUIDE_CFG={state:window.C5S2_STATE,get mode(){return window.C5S2_STATE.scene;}};
window.GUIDE_DATA=window.C5S2_GUIDE;
```

### A-6 clip 清单（前缀 c5s2-，共 21 条；预估秒数=字数÷4+0.5，TTS 落盘后 afinfo 实测回填 delay）

| clip id | 文本 | 预估秒数 |
|---|---|---|
| c5s2-c-intro | 模型照相机：前筒嵌凸透镜，后筒蒙薄膜当底片。u大于2f，成倒立缩小的实像。 | 9.5 |
| c5s2-c-s1 | 拖动后面的纸筒调筒距，直到薄膜上的F变清晰。 | 5.5 |
| c5s2-c-s2 | 对上焦啦！倒立、缩小的实像。 | 3.8 |
| c5s2-c-s3 | 物移近了像会变大，拉长后筒重新对焦。 | 4.8 |
| c5s2-c-s4 | 因此我们得出结论：照相机成倒立缩小的实像。 | 6.0 |
| c5s2-c-e1 | 不对哟～筒到头还不清晰，微调物距再试试。 | 5.3 |
| c5s2-c-f1 | 物近、像远、像变大，规律就是这个～ | 4.3 |
| c5s2-p-intro | 投影仪：投影片放在f和2f之间，幕布上成倒立放大的实像。先调焦找到清晰的像！ | 9.8 |
| c5s2-p-s1 | 拖动调焦滑杆或透镜，让幕布上出现清晰的像。 | 5.5 |
| c5s2-p-s2 | 清晰啦！幕布上是倒立、放大的实像。 | 4.5 |
| c5s2-p-s3 | 投影片倒插，屏幕上的像就正立啦。 | 4.3 |
| c5s2-p-s4 | 因此我们得出结论：投影仪成倒立放大的实像。 | 6.0 |
| c5s2-p-e1 | 不对哟～透镜拖太远啦，往回慢慢移看幕布对焦。 | 6.0 |
| c5s2-p-f1 | 正着插回去，屏上的像又颠倒啦。 | 4.0 |
| c5s2-m-intro | 放大镜就是凸透镜：u小于f，透过透镜看到正立放大的虚像，和物体在同一侧。 | 9.8 |
| c5s2-m-s1 | 拖动放大镜远离物体，看虚像越来越大。 | 5.0 |
| c5s2-m-s2 | 透过透镜看：正立放大的虚像，和物体同侧。 | 5.3 |
| c5s2-m-s3 | 屏上没有像——虚像不能用光屏承接。 | 4.5 |
| c5s2-m-s4 | 因此我们得出结论：放大镜成正立放大的虚像。 | 6.0 |
| c5s2-m-e1 | 不对哟～放大镜要在焦点以内用，往回拉一点。 | 5.8 |
| c5s2-m-f1 | 越接近焦点，虚像越大也越淡哦。 | 4.0 |

### A-7 接线备忘（c5s2，供后续开发单，本设计书零代码改动）

1. **html 五件套**（exp-lens-life.html）：①`</head>`（行56）前加 `<link rel="stylesheet" href="../_lib/guide/guide-core.css?v=…">`；②scene-wrap 内 `#toast`（行73）之后加 `<div id="guide-layer"></div>`；③行112 core 引用之后、`</body>`（行113）之前依序加三 script：`guide/guide-data.js` → `../_lib/guide/engine-core.js` → `../_lib/guide/vB-core.js`（**guide-data 必须先于 engine**：引擎 IIFE 行12 顶部即捕获 R、行13 捕获 DATA）；④core.js 行41 `};` 后（function cur() 行42 前）加 `window.C5S2_STATE=state;`；⑤四处引用（原 3 + guide 新增）统一 `?v=YYYYMMDDgN` bump，交付提醒蔡总强刷。
2. **hint 删除范围**：html `#toast`（行73）+ `#toast/#toast-x` CSS（≈行47~54）；core：`toastTimer`（行44）、`hintSt`（行601）、`hintBranch()`（行602~620）、`toastHide()`（≈行621~622）、`sceneBBox()`（≈行623~633）、`checkToastFit()`（≈行634~640）、`sayHint()`（行642~652）、toastXEl 监听（≈行653）、`showToast()`（行681~688）、全篇 sayHint/showToast/toastHide 调用点 32 处（含 tick 内每 10 帧 checkToastFit ≈行936）。事件 toast 四条文案（行708/724/761/784）语义已由本设计 c-s2/p-s2/m-e1/m-s3 承接，删除无信息损失。
   ⚠️ **连带警示**：`cam.chalH0` 唯一置点在 sayHint 内（行646）→ 删 hint 后挑战判定 chalDone（行712）永不触发。本设计 trigger 未用 chalDone，无影响；若产品要保留「像变大挑战」玩法，开发单需把 chalH0 基线设置移入 checkFocus() 对焦分支（另行拍板，勿顺手改）。
3. **移动三件现状**：canvas `touch-action:none`（html 行19 css，浮标/字幕为 DOM 层不受影响）；小窗紧凑档 `COMPACT_H=600`（core 行27，resize 加 .compact）；字幕底边避让 Caption.bottomOff 依赖 `.ctrlbar`（本页有 ✓）；viewport meta **无** `viewport-fit=cover`（c5s3 有）——现状记录，是否补齐由开发单定。

---

## §B c5_s3 探究凸透镜成像的规律（exp-image-law.html）

### B-1 状态暴露核查

状态在 IIFE 闭包 `var st={}`（exp-image-law-core.js **行31**，闭合 `};` **行38**），**全文唯一赋值**（grep `var st=` 唯一命中行31），其后复位（btn-reset 行720~735）为逐字段原地 mutate；`st.rows` 会整体替换（行677 参考数据/行683 清空/行727 复位）、`st.anim` 会置对象/null——引擎每帧从 R 重新取路径求值，不受影响；st 本体稳定 → **直接引用赋值即可，无需 c3_s1 不可枚举 getter 聚合、也无需 c3_s2 Proxy**。调试通道 `window.__c5s3dbg.get st()`（行811~812）佐证对象长期存活。

**状态字段速查表**（出处均为 exp-image-law-core.js）：

| 字段 | 类型 | 取值/范围 | 含义 | 写入点 |
|---|---|---|---|---|
| u | number | 4~28，初21（U_MIN/U_MAX_CM 行10） | 物距 cm | 行32；拖物行564、debug setU 行814、reset 行723 |
| f | number | 2~12，初10，10/20 吸附（行7） | 焦距 cm | 行32；setF() 行618~622、onFChange 行623、#rng-f input 行624 |
| vSc | number | 3~vMaxDyn()，初19.1（行11） | 屏位=像距 cm（动态上界 vMaxDyn ≈行63，屏不出画布右缘） | 行32；拖屏行568、寻像动画 tick 行772、reset 行723 |
| obj | string | 'F'\|'candle' | 物体（F 形光源/蜡烛） | 行33；托盘换用行538、蜡烛拖回行588、reset 行724 |
| lit | bool | | 光源点亮 | 行33；点蜡烛/点F 行594/598、#btn-lit 行644、reset 行724 |
| screenOn | bool | | 光屏在位/已撤 | 行34；#btn-noscreen 行709/713、reset 行725 |
| screenA/eyeA/eyeOff | number | 0~1/px | 撤屏淡出+眼飞入**插值**（trap） | 行34；tick 行772~779 |
| eye | bool | | 观察眼显示中 | 行34；tick 行774~779 |
| eyeX | number\|null | null=默认屏位 | 眼观察位（纯观察不改像） | 行34；拖眼 ≈行579、reset 行725 |
| hand | bool | | 遮光板开关（#btn-hand） | 行35；twoState 行642、reset 行726 |
| handA | number | 0~1 | 遮光板淡入淡出**插值**（trap） | 行35；tick ≈行783 |
| marks/rays | bool | | F/2F 标记、光路显示开关 | 行35；twoState 行640~641、reset 行726 |
| rows | array | [{u,xu,da,zd,h,v}] 全字符串；u 为 toFixed(1) | 记录表行（同 u 覆盖行501、新增 push 行502、按 u 排序行503） | 行36；recordCurrent() 行491~504（#btn-record 行666~673）、参考数据行677、清空行683、reset 行727 |
| anim | obj\|null | {kind:'auto'\|'out'\|'in',…} | 动画参数（trap） | 行36；寻像 ≈行697、撤屏行710/714 |
| fTip/touched/snapI/wasSharp/eyeTip/eyeTipShown | bool/number | | hint 旗标与引擎性边沿缓存（trap） | 行37；散布（touched 置行539/550/623/688/707；wasSharp 行398/570） |

派生函数（闭包函数，trigger 不可调用，一律展开为 R 表达式）：`vImg()=u*f/(u−f)` 行72、`imgKind()` 行73（'none'⇔|u−f|≤0.25，EPS_CM 行8；'real'⇔u−f>0.25；'virtual'⇔f−u>0.25）、`mag()` 行74、`isSharp()` 行77（real 且 |vSc−vImg|≤0.6，SHARP_TOL_CM 行9）、`vMaxDyn()` ≈行63。**清晰 trigger 内联式**：`R.u-R.f>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))<=0.6`（与 isSharp 行77 逐字同义）。

**陷阱字段（trigger 禁用）**：`anim`、`screenA/eyeA/eyeOff/handA`（动画插值）、`snapI`（拖拽瞬态）、`wasSharp`（边沿缓存，引擎自语义）、`fTip/eyeTip/eyeTipShown/touched` 中仅 `touched` 可用作「已动手」闩锁但本设计未依赖（s2 用 G 时闸门代替，见 B-2）；`drag/startPt/toastTimer/glowFx/hintSt`（行39/402 等闭包散变量，不在 st 内）；`eyeX` 数值本体（纯观察位）。

**最小暴露方案**：st 声明闭合 `};`（**行38**）之后（行39 `var drag=null,…` 前）加一句：
```js
window.C5S3_STATE=st;
```
**mode 源**：单场景、st 无 mode/scene 字段 → GUIDE_CFG 设固定 mode key `'refract'`（照 c6s1/c6s2 单场景先例），引擎 init 后首帧即 onModeEnter('refract') 播 intro。

**物理口径锚点**（explain.html）：行80 烛焰/透镜/光屏中心同一高度；行83~86 四步（测 f 标 F/2F→u>2f 移屏找清晰像记录→f<u<2f 重复、再移焦点以内**撤去光屏透过透镜观察**→数据成表归纳）；行103~107 三区表（u>2f 倒立缩小实像 f<v<2f 照相机；u=2f 倒立等大 v=2f；f<u<2f 倒立放大 v>2f 投影仪；u=f 不成像出射平行光；u<f 正立放大虚像同侧放大镜）；行111 实像都倒立异侧可屏承、虚像都正立放大同侧只能眼看；行113+≈行117 遮挡透镜像仍完整只是变暗；行127~128 一倍焦距分虚实、二倍焦距分大小；行131 物移近实像远离且变大、过焦点后虚像越近越小；行150 物近像远像变大；行168~170 小结。页面自洽：进页初态 u=21、f=10、vSc=19.1=v像 210/11（行32 注释）即清晰倒立缩小实像；f/2f 磁吸 ±0.2（行562~563）；u=f、u=2f 落点 toast（行590~591）。

### B-2 steps（11 条，全 repeat:true；单场景 mode='refract'）

| id | trigger | say（≤25字） | audio | 核实出处 |
|---|---|---|---|---|
| c5s3-s1 | `delay:13000` | 拖动F光源改变物距u，拖光屏找清晰的像。 | c5s3-s1 | delay 型（规范§2.3）；延时=intro afinfo 实测+1s 回填，此处预估；拖物写行564、拖屏写行568 |
| c5s3-s2 | `R.u-R.f>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))>0.6` | 屏上像模糊啦，拖屏或点寻像找清晰像。 | c5s3-s2 | !isSharp() 展开（行77；EPS_CM 行8/SHARP_TOL 行9；real 区 R.u−R.f>0.25=imgKind 行73）；文案照 core hint 'sharp' 行417；初态清晰（行32 vSc=19.1=v像）不误发 |
| c5s3-s3 | `R.u>2*R.f && R.u-R.f>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))<=0.6 && (G.t-G.modeEnterT)>22000` | 现在u大于2f：倒立、缩小的实像。 | c5s3-s3 | isSharp 展开行77；G.modeEnterT 行95/342——**时间闸门防进模式即真掐断 intro**（初态 u=21>2f=20 已清晰）；22000=预估（s1 delay 13s+s1 音频≈6s+3s 余量），音频落盘后按「s1 delay+s1 实测+2s」回填；口径 explain 三区表行103~107 |
| c5s3-s4 | `R.u-R.f>0.25 && R.u<2*R.f && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))<=0.6` | f和2f之间：倒立、放大的实像。 | c5s3-s4 | 区间+isSharp 展开；u=2f 磁吸（行562~563）保证与 s3/s5 边界互斥；口径 explain 行105/149 |
| c5s3-s5 | `Math.abs(R.u-2*R.f)<=0.25` | u等于2f：倒立等大的实像，大小分界。 | c5s3-s5 | core 'e2f' hint 行416 同判据；口径 explain 行128「二倍焦距分大小」/三区表行104 |
| c5s3-s6 | `Math.abs(R.u-R.f)<=0.25` | u等于f不成像，一倍焦距分虚实。 | c5s3-s6 | imgKind 'none' 行73（EPS 行8）；core 'nof' 行413；口径 explain 行106/127 |
| c5s3-s7 | `R.f-R.u>0.25` | u小于f：正立放大的虚像，物像同侧。 | c5s3-s7 | imgKind 'virtual' 行73；core 'vgo' 行415；口径 explain 行107/111 |
| c5s3-s8 | `R.screenOn===false && R.f-R.u>0.25` | 撤去光屏，用眼从屏侧观察虚像。 | c5s3-s8 | screenOn 写行709/713（#btn-noscreen）；口径 explain 行85 第三步「撤去光屏透过透镜观察」；core 行711 同义 |
| c5s3-s9 | `R.rows.length>=1 && R.rows.length<3` | 记下一笔啦！跨三个区每区记一笔。 | c5s3-s9 | rows push 行502（#btn-record 行667）；上界<3 保与 s10 同帧互斥（否则第 3 笔时 s9/s10 同帧齐真、s10 次帧掐断 s9）；口径 explain 行86 第四步 |
| c5s3-s10 | `R.rows.length>=3` | 三组数据齐了，开规律卡对照归纳。 | c5s3-s10 | 同上；规律卡 #btn-law（html 面板 panel-law）；口径 explain 行86「归纳出规律」 |
| c5s3-s11 | `after:c5s3-s10@6000` | 因此我们得出结论：一倍焦距分虚实，二倍焦距分大小。 | c5s3-s11 | after 型@6000（规范§2.4）；口径 explain 行127~128 口诀/小结行168 |

同帧互斥核查：区间步 s3~s7 经 EPS 判定带+f/2f 磁吸互斥；s2（模糊）与 s3/s4（清晰）电平互斥；s8 与 s7 罕见同帧齐真（撤屏态拖入虚像区）→ 数组序 s7 先发、s8 次帧边沿补发（引擎 tickSteps 早退不更新后续 repPrev，无丢触发），连播语义连贯可接受。

### B-3 errors（3 条，全事件型 capture 即时判定，5s 节流）

| id | trigger | fix | audio | 核实出处 |
|---|---|---|---|---|
| c5s3-e1 | `event:click:#btn-record:R.u-R.f>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))>0.6` | 不对哟～屏上像还模糊，先寻像再记录哦。 | c5s3-e1 | recordCurrent() 行491~504 无清晰前置校验（模糊也入表、v 记 vSc 失真）→ 真实纠错点；capture 读点击前状态（引擎行38 注释）；风格规范§2.8 |
| c5s3-e2 | `event:click:#btn-auto:Math.abs(R.u-R.f)<=0.25` | 不对哟～u等于f不成像，寻像也没用呀。 | c5s3-e2 | bAuto k='none' 分支行690~691 同义 toast；口径 explain 行106 |
| c5s3-e3 | `event:click:#btn-auto:R.f-R.u>0.25` | 不对哟～虚像屏接不到，撤屏用眼睛看。 | c5s3-e3 | bAuto virtual 分支行691；口径 explain 行85 |

### B-4 free（4 条；f1/f3 电平互斥，f2 与 e2/e3 同选择器按区间互斥）

| trigger | note | audio | 核实出处 |
|---|---|---|---|
| `R.hand===true && R.u-R.f>0.25` | 遮住透镜一部分，像仍完整只是变暗。 | c5s3-f1 | hand 写行642（#btn-hand twoState）；core 'hand' hint 行407；口径 explain 思考讨论1 行113~118+小结行170 |
| `event:click:#btn-auto:R.u-R.f>0.25` | 寻像按钮会自动把屏滑到清晰像位。 | c5s3-f2 | bAuto 动画置行697~698、finishAuto 行699；expr 闸门排除 u=f/u<f（让位 e2/e3），同点击三者互斥 ✓ |
| `R.hand===true && R.f-R.u>0.25` | 遮挡时虚像也完整，只是变暗哟。 | c5s3-f3 | core 'handv' hint 行406（与实像结论对称） |
| `R.obj==='candle'` | 换成蜡烛作物体啦，像变烛焰图案。 | c5s3-f4 | obj 写行538（托盘换用）/行588（拖回换 F）；core toast 行541 同义；边沿+8s 节流，换回再换重播 |

### B-5 guide-data.js（完整，单场景 mode key=refract）

```js
/* content/physics_g8_v1_c5_s3/guide/guide-data.js */
window.C5S3_GUIDE={
  refract:{
    intro:{text:'光具座探究成像规律：拖光源改物距u，拖光屏找像，f和2f是两条分界线。',audio:'c5s3-intro'},
    steps:[
      {id:'c5s3-s1',repeat:true,trigger:'delay:13000',say:'拖动F光源改变物距u，拖光屏找清晰的像。',audio:'c5s3-s1'},
      {id:'c5s3-s2',repeat:true,trigger:'R.u-R.f>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))>0.6',say:'屏上像模糊啦，拖屏或点寻像找清晰像。',audio:'c5s3-s2'},
      {id:'c5s3-s3',repeat:true,trigger:'R.u>2*R.f && R.u-R.f>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))<=0.6 && (G.t-G.modeEnterT)>22000',say:'现在u大于2f：倒立、缩小的实像。',audio:'c5s3-s3'},
      {id:'c5s3-s4',repeat:true,trigger:'R.u-R.f>0.25 && R.u<2*R.f && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))<=0.6',say:'f和2f之间：倒立、放大的实像。',audio:'c5s3-s4'},
      {id:'c5s3-s5',repeat:true,trigger:'Math.abs(R.u-2*R.f)<=0.25',say:'u等于2f：倒立等大的实像，大小分界。',audio:'c5s3-s5'},
      {id:'c5s3-s6',repeat:true,trigger:'Math.abs(R.u-R.f)<=0.25',say:'u等于f不成像，一倍焦距分虚实。',audio:'c5s3-s6'},
      {id:'c5s3-s7',repeat:true,trigger:'R.f-R.u>0.25',say:'u小于f：正立放大的虚像，物像同侧。',audio:'c5s3-s7'},
      {id:'c5s3-s8',repeat:true,trigger:'R.screenOn===false && R.f-R.u>0.25',say:'撤去光屏，用眼从屏侧观察虚像。',audio:'c5s3-s8'},
      {id:'c5s3-s9',repeat:true,trigger:'R.rows.length>=1 && R.rows.length<3',say:'记下一笔啦！跨三个区每区记一笔。',audio:'c5s3-s9'},
      {id:'c5s3-s10',repeat:true,trigger:'R.rows.length>=3',say:'三组数据齐了，开规律卡对照归纳。',audio:'c5s3-s10'},
      {id:'c5s3-s11',repeat:true,trigger:'after:c5s3-s10@6000',say:'因此我们得出结论：一倍焦距分虚实，二倍焦距分大小。',audio:'c5s3-s11'}
    ],
    errors:[
      {id:'c5s3-e1',trigger:'event:click:#btn-record:R.u-R.f>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))>0.6',fix:'不对哟～屏上像还模糊，先寻像再记录哦。',audio:'c5s3-e1'},
      {id:'c5s3-e2',trigger:'event:click:#btn-auto:Math.abs(R.u-R.f)<=0.25',fix:'不对哟～u等于f不成像，寻像也没用呀。',audio:'c5s3-e2'},
      {id:'c5s3-e3',trigger:'event:click:#btn-auto:R.f-R.u>0.25',fix:'不对哟～虚像屏接不到，撤屏用眼睛看。',audio:'c5s3-e3'}
    ],
    free:[
      {trigger:'R.hand===true && R.u-R.f>0.25',note:'遮住透镜一部分，像仍完整只是变暗。',audio:'c5s3-f1'},
      {trigger:'event:click:#btn-auto:R.u-R.f>0.25',note:'寻像按钮会自动把屏滑到清晰像位。',audio:'c5s3-f2'},
      {trigger:'R.hand===true && R.f-R.u>0.25',note:'遮挡时虚像也完整，只是变暗哟。',audio:'c5s3-f3'},
      {trigger:'R.obj===\'candle\'',note:'换成蜡烛作物体啦，像变烛焰图案。',audio:'c5s3-f4'}
    ],
    tasks:[]
  },
  audios:{
    'c5s3-intro':'guide/audio/c5s3-intro.mp3',
    'c5s3-s1':'guide/audio/c5s3-s1.mp3','c5s3-s2':'guide/audio/c5s3-s2.mp3',
    'c5s3-s3':'guide/audio/c5s3-s3.mp3','c5s3-s4':'guide/audio/c5s3-s4.mp3',
    'c5s3-s5':'guide/audio/c5s3-s5.mp3','c5s3-s6':'guide/audio/c5s3-s6.mp3',
    'c5s3-s7':'guide/audio/c5s3-s7.mp3','c5s3-s8':'guide/audio/c5s3-s8.mp3',
    'c5s3-s9':'guide/audio/c5s3-s9.mp3','c5s3-s10':'guide/audio/c5s3-s10.mp3',
    'c5s3-s11':'guide/audio/c5s3-s11.mp3',
    'c5s3-e1':'guide/audio/c5s3-e1.mp3','c5s3-e2':'guide/audio/c5s3-e2.mp3',
    'c5s3-e3':'guide/audio/c5s3-e3.mp3',
    'c5s3-f1':'guide/audio/c5s3-f1.mp3','c5s3-f2':'guide/audio/c5s3-f2.mp3',
    'c5s3-f3':'guide/audio/c5s3-f3.mp3','c5s3-f4':'guide/audio/c5s3-f4.mp3'
  }
};
window.GUIDE_CFG={state:window.C5S3_STATE,mode:'refract'};
window.GUIDE_DATA=window.C5S3_GUIDE;
```

说明：`event:click:#btn-auto` 同选择器挂 1 free + 2 errors，bindEventTriggers（引擎行268）按 (选择器,事件) 去重只绑一次、回调内三类全分发，expr 闸门互斥保证同一次点击至多命中一条。

### B-6 clip 清单（前缀 c5s3-，共 19 条；预估秒数=字数÷4+0.5，TTS 落盘后 afinfo 实测回填 delay/闸门）

| clip id | 文本 | 预估秒数 |
|---|---|---|
| c5s3-intro | 光具座探究成像规律：拖光源改物距u，拖光屏找像，f和2f是两条分界线。 | 8.5 |
| c5s3-s1 | 拖动F光源改变物距u，拖光屏找清晰的像。 | 5.8 |
| c5s3-s2 | 屏上像模糊啦，拖屏或点寻像找清晰像。 | 5.3 |
| c5s3-s3 | 现在u大于2f：倒立、缩小的实像。 | 4.5 |
| c5s3-s4 | f和2f之间：倒立、放大的实像。 | 4.3 |
| c5s3-s5 | u等于2f：倒立等大的实像，大小分界。 | 5.3 |
| c5s3-s6 | u等于f不成像，一倍焦距分虚实。 | 4.5 |
| c5s3-s7 | u小于f：正立放大的虚像，物像同侧。 | 5.0 |
| c5s3-s8 | 撤去光屏，用眼从屏侧观察虚像。 | 4.3 |
| c5s3-s9 | 记下一笔啦！跨三个区每区记一笔。 | 4.5 |
| c5s3-s10 | 三组数据齐了，开规律卡对照归纳。 | 4.5 |
| c5s3-s11 | 因此我们得出结论：一倍焦距分虚实，二倍焦距分大小。 | 6.8 |
| c5s3-e1 | 不对哟～屏上像还模糊，先寻像再记录哦。 | 5.5 |
| c5s3-e2 | 不对哟～u等于f不成像，寻像也没用呀。 | 5.3 |
| c5s3-e3 | 不对哟～虚像屏接不到，撤屏用眼睛看。 | 5.3 |
| c5s3-f1 | 遮住透镜一部分，像仍完整只是变暗。 | 4.8 |
| c5s3-f2 | 寻像按钮会自动把屏滑到清晰像位。 | 4.5 |
| c5s3-f3 | 遮挡时虚像也完整，只是变暗哟。 | 4.3 |
| c5s3-f4 | 换成蜡烛作物体啦，像变烛焰图案。 | 4.5 |

TTS 注意（规范§4）：全批 `zh-CN-XiaoxiaoNeural` 1.0x；「～」只做停顿不发音；u/f/v 按字母读；2f 读「二倍焦距」语义已由文本自带；文件名=clip id 存 `content/physics_g8_v1_c5_s3/guide/audio/`。

### B-7 接线备忘（c5s3，供后续开发单，本设计书零代码改动）

1. **html 五件套**（exp-image-law.html）：①`</head>`（行72）前加 `<link rel="stylesheet" href="../_lib/guide/guide-core.css?v=…">`；②scene-wrap 内 `#toast`（行113）之后加 `<div id="guide-layer"></div>`；③行157 core 引用之后、`</body>`（行158）之前依序加三 script：`guide/guide-data.js` → `../_lib/guide/engine-core.js` → `../_lib/guide/vB-core.js`（guide-data 必须先于 engine，引擎行12/13 顶部捕获 R/DATA）；④core.js 行38 `};` 后（行39 `var drag=null…` 前）加 `window.C5S3_STATE=st;`；⑤四处引用统一 `?v=YYYYMMDDgN` bump，交付提醒蔡总强刷。
2. **hint 删除范围**：html `#toast`（行113）+ `#toast/#toast-x` CSS（≈行57~63）；core：`toastTimer`（行39）、`hintSt`（行403）、`hintBranch()`（行404~420）、`hideToast()`（≈行421）、`sayHint()`（行423~430 附近）、`showToast()`（行430~438）、`sceneBBox()`/`checkToastNarrow()`（≈行440~452）、toastXEl 监听（≈行453）、draw() 内 `if(!st.anim) sayHint()`（行385 附近）、tick 内每 10 帧 checkToastNarrow（≈行787）、全篇 sayHint/showToast/hideToast 调用点 37 处。
   ⚠️ 事件 toast 文案中 u=2f/u=f 分界点破（行590~591）、清晰像播报（行573）、记录确认（行671）、寻像到位（行699~700）等语义已由本设计 s5/s6/s2/s9/e2/e3/f2 承接，删除无信息损失；「fTip 焦距变小解说」（行408）与「eyeTip 眼位解说」（行409）为一次性知识提示，本设计未收录——如需保留由开发单决定改为 free 条目（R.fTip/R.eyeTip 字段在 st 内可用，行37）。
3. **移动三件现状**：canvas `touch-action:none`（html 行19）；紧凑档 `COMPACT_H=600`（core 行12）；viewport meta **含** `viewport-fit=cover`（html 行7）；字幕底边避让依赖 `.ctrlbar`（本页有 ✓）。
4. **delay/闸门回填清单**（TTS 落盘后）：c5s2 三个 intro 实测+1s → 三个 `delay:13000`；c5s3 intro 实测+1s → `delay:13000`；c5s3-s3 闸门 22000 → 按「c5s3-s1 delay 回填值 + c5s3-s1 音频实测 + 2s」重算。

---

## §C 汇总

- **steps/errors/free**：c5s2 = 12/3/3（cam 4+proj 4+mag 4 / 1+1+1 / 1+1+1）；c5s3 = 11/3/4；两页合计 23/6/7。
- **clip 总数**：c5s2 21 条（3 intro + 12 steps + 3 errors + 3 free）+ c5s3 19 条（1 intro + 11 steps + 3 errors + 4 free）= **40 条**，五类全带 audio（规范§2.7），预估总时长约 3.3 分钟，体积无压力（规范§4.5）。
- **trigger 纪律自查**：全部条目只用 R.*（core 逐行核实字段）+ G.t/G.modeEnterT（引擎行93/95 通用写入）；未用 G.angChangeCount（两页无 R.angleI）、未用 G.recCount/objChangeCount/eqMoveGestureCount/everLit（c4s3 专属采集链，本页恒假）。
- **mode 方案**：c5s2 多场景 → GUIDE_CFG.mode getter 轮询 state.scene（引擎 tick 行415 每帧读，切场景自动 onModeEnter：intro 重播+clearRepeatState）；c5s3 单场景 → 固定 mode key 'refract'。

（完）

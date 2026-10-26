# c5「透镜及其应用」s4/s5 两实验页 · 语音讲解层设计书（B 版标配 · part3）

> 目标页面：`content/physics_g8_v1_c5_s4/exp-eye.html`（§A 眼睛与视力矫正）/ `content/physics_g8_v1_c5_s5/exp-telescope.html`（§B 望远镜）
> 规范依据：`~/.openclaw/workspace/可交互教材/实验语音讲解层改造规范-B版标配.md`（steps 全 repeat:true、即时打断、状态闸门、五类语音全带 audio、event: 前缀、结论条 after:xxx@6000）；格式参照 `docs/c6-guide-design.md`。
> 物理口径权威源=各节 `explain.html`，本文所有解说词与其逐条对齐，数值口径零臆造。
> 引擎能力核实（`content/_lib/guide/engine-core.js`，489 行）：
> - `parseTrigger()` 支持五种：`delay:N` / `expr@N`（持续满足）/ `event:事件:选择器[:表达式]`（capture 即时判定）/ `after:ID@N` / 纯 expr（边沿）。
> - 状态源 `R=(window.GUIDE_CFG&&window.GUIDE_CFG.state)||window.MRR`（行10）；数据源 `window.GUIDE_DATA`（行11）；模式源 `(GUIDE_CFG.mode)||(R.mode)`，每帧轮询（tick 内）→ 多场景页可用 R.mode 轮询切场景。
> - repeat:true 步骤边沿重触发+3s 冷却（REP_COOLDOWN=3000）；delay 型 repeat 每次进模式只发一次（delayFired 守卫，r6）；errors 电平触发 5s 节流；free 边沿+8s 节流。
> - `bindEventTriggers()` 动态扫描 DATA 全部 event: 型 trigger 按 (选择器,事件) 去重绑定，且事件回调对 steps/errors/free 三类都分发（steps 走 repLast+REP_COOLDOWN 节流）——宿主任意 DOM 选择器直接可用。
> - G 私有字段核查（updateG）：通用可用=`G.t`（每帧时间戳）、`G.modeEnterT`（进模式时间戳）；`G.angChangeCount/G.lastAngChangeT` 监听 `R.angleI`——**两实验 state 均无 angleI 字段，一律禁用**；`G.recCount/objChangeCount/eqMoveGestureCount/lastObjChangeT/lastEqChangeT/everLit/firstSlotDone/eqEverOn/everMatched/matchedEdgeCount/angleWasOff` 采集依赖 c4_s3 专属字段（R.doCm/R.objLit/R.eqState/R.m3/R.matched/#rec-table DOM）——c5 两页这些字段全不存在，**一律禁用**。本设计 trigger 只用 `R.*` + `G.t/G.modeEnterT`。
> - vB 皮肤走 `_lib/guide/vB-core.js`（通用版，读 `window.GUIDE_DATA.audios`），无需改。

---

## §A c5_s4 眼睛与视力矫正（exp-eye.html）

### A-1 状态暴露核查

状态在 IIFE 闭包 `var st={...}`（exp-eye-core.js 行22~26），**全文仅此一次赋值**（grep `st\s*=\s*{` 唯一命中行22），重置（btn-reset 监听 行634~636）与全部交互均为原地 mutate 字段 → 满足引擎「稳定对象原地 mutate」要求。既有调试通道 `window.__c5s4dbg.get st()`（行687~691）佐证对象长期存活。注意：状态变量名是 **st**（非 state），且成像质量（清晰/会聚位置）是闭包函数 imgInfo()（行129~134）每帧解算的派生量，**st 本体无 sharp 字段** → 暴露方案须补派生 getter（参照 c3_s1 不可枚举 getter 聚合；本对象无整体重赋值，无需 c3_s2 Proxy）。

**状态字段速查表**（出处均为 exp-eye-core.js）：

| 字段 | 类型 | 取值/范围 | 含义 | 出处（行号） |
|---|---|---|---|---|
| cond | string | 'normal'\|'myopia'\|'hyper' | 眼况（模式源；COND_NAME 行14） | 声明行23；写 行597（#sel-cond change）、行635（reset） |
| auto | bool | 默认 true | 睫状体自动调节开关 | 行23；写 行602（#btn-auto click） |
| tCmd | number | 0~1 | **仅手动档**晶状体厚度指令（自动档被 tActNow() 行69 旁路） | 行23；写 行603（关自动时接手当前厚度）、行608（setT←#rng-t input 行611、#btn-t-down/up 行620~621 nudgeT） |
| uK | number | 0.9~2.7（UK_MIN/UK_MAX 行9） | 无量纲物距系数（×D，大=树远；初始 2.7 远端） | 行23；写 行523（canvas 拖树 pointermove，clampUK 行52）、行635（reset→UK_MAX） |
| glass | string\|null | 'concave'\|'convex'\|null | 眼前挂载的矫正镜 | 行24；写 行536（拖回托盘=取下）、行539（挂载，endDrag） |
| showFlow | bool | | 光流脉冲开关 | 行25；写 行623（#btn-flow click） |
| flowT0 | number | | 光流动画时间戳（瞬态） | 行25；写 行624 |

派生 getter（本方案新增）：`mode`=st.cond（模式源）；`sharp`=imgInfo().sharp（清晰判定 |xConv−xRet|≤SHARP_TOL·D，SHARP_TOL=0.03 行8，判定体 行129~134）；`imgWhere`=imgInfo().where（'视网膜上'\|'视网膜前'\|'视网膜后'）。

**关键物理标定点**（core 常量区注释 行8~13）：正常眼全行程恒清晰（R33：厚极限 0.45 覆盖 req(0.9)=0.4737）；**近视远点 1.78D**（uK>1.78 看远模糊）；**远视清晰阈值 1.94D**（uK<1.94 看近模糊）；调节范围 COND_FRNG 行13：normal[0.45,1.00]/myopia[0.42,0.64]/hyper[0.66,1.05]；矫正镜焦度 GLASS_F_K 行10（concave −2.61 / convex 4.48）。→ 本设计 m4 取 uK<1.6、h4 取 uK>2.1、n2 取 uK<1.2、n3 取 uK>2.4，均在标定区间内留裕量。

**陷阱字段（trigger 禁用）**：`drag/startPt/dragGhost/glowFx/toolbox/toastTimer`（行27 闭包散变量：瞬态手势/动画/布局缓存）；`st.flowT0`（行25 动画时间戳）；`st.tCmd`（**自动档下完全失效**——实际厚度=tActNow() 行69 由 fReqK 反解，trigger 禁以 tCmd 判厚薄）；闭包几何缓存 `G`（行29 起 var G={}，layout 重算，闭包私有不上 window，与引擎注入参数 G 无关不冲突）；`wasSharp/retinaPt/suppressClick`（行353 渲染瞬态）；`hintSt`（行397）。**st 无 angleI 字段 → G.angChangeCount/G.lastAngChangeT 禁用**；R.doCm/R.objLit/R.eqState/R.m3/#rec-table 全不存在 → G.recCount/objChangeCount/eqMoveGestureCount/everLit 等 c4s3 专属字段全禁用（必恒假/恒 0）。trigger 仅用 `R.*` + `G.t/G.modeEnterT`。

**最小暴露方案**：在 st 声明闭合 `};`（**行26**）之后插入（imgInfo 为函数声明 行129，hoisting 保证 getter 惰性调用时已定义；imgInfo→traceRays 行108 每帧十几步浮点，引擎轮询负载可忽略）：

```js
/* guide 语音层暴露（B版标配）：不可枚举 getter 聚合派生量，零干扰 st 本体 */
(function(){
  Object.defineProperty(st,'mode',{enumerable:false,get:function(){return st.cond;}});
  Object.defineProperty(st,'sharp',{enumerable:false,get:function(){return imgInfo().sharp;}});
  Object.defineProperty(st,'imgWhere',{enumerable:false,get:function(){return imgInfo().where;}});
  window.C5S4_STATE=st;
})();
```
（用不可枚举是硬要求：`__c5s4dbg.set` 走 `Object.assign(st,o)`（行689~690），可枚举 getter 会被 Object.assign 当普通属性误写报错。）

**模式源**：多场景页（三眼况 #sel-cond 切换，st.cond 即场景字段）→ **GUIDE_CFG 不设 mode**，走 R.mode 轮询（getter=st.cond）。cond 变化沿 → 引擎 onModeEnter：播该眼况 intro + clearRepeatState，且 trigger 天然按模式隔离（tickSteps/tickErrors/tickFree 只求值 curMode 的条目，表达式内无需再挂 R.cond 闸门）。

**物理口径锚点**（explain.html）：行76 角膜+晶状体≈凸透镜、视网膜=光屏；行77 成倒立缩小实像；行80 睫状体调节（看远放松变薄/看近收缩变厚）；行82 近点约10cm、明视距离约25cm；行97 近视成因（晶状体太厚折光太强/眼球前后太长）；行98 像会聚在视网膜前方只剩模糊光斑；行101 凹透镜先发散再会聚、像落回视网膜；行110 远视成因（太薄太弱/太短，老花眼）；行111 像成在视网膜后方；行114 凸透镜老花镜（看报戴、看远摘）；行130 度数=焦度×100（凹负凸正）；行152~154 小结。

### A-2 steps 表（11 条，全 repeat:true；三个 mode key = st.cond 值：normal / myopia / hyper）

> 闸门纪律：仅「进模式瞬间即为真」的条件加 `(G.t-G.modeEnterT)>13000` 闸门，防掐断开场白（规范§2.3）；13000=intro 预估（≈11.5s）+余量，afinfo 实测后回填（与 delay 步同值联动）。进模式为假的条件（uK<1.6、glass 挂载等）不加闸门，用户操作即时打断属规范设计（r5）。G 字段仅用 G.t/G.modeEnterT（引擎通用，updateG 写入）；st 无 angleI → G.angChangeCount 禁用。

**mode=normal（3 条）**

| id | trigger | say（≤25字） | audio | 核实出处 |
|---|---|---|---|---|
| c5s4-n1 | `delay:13000` | 拖左侧的小树远近变化，看晶状体自动变厚变薄。 | c5s4-n1 | delay 型（规范§2.3，delayFired 守卫每进模式一次）；延时待 intro 实测回填 |
| c5s4-n2 | `R.uK<1.6 && R.glass===null` | 看近处：睫状体收缩，晶状体变厚，像仍然清晰。 | c5s4-n2 | uK 写 行523；正常眼全行程恒清晰=R33 行11；口径 explain 行80。glass 闸门：正常眼戴镜必模糊（en1 纠错态），禁说「仍然清晰」 |
| c5s4-n3 | `after:c5s4-n2@6000` | 因此我们得出结论：睫状体调节晶状体厚薄，远近都清晰。 | c5s4-n3 | after 型@6000（规范§2.4）；口径 explain 行80/153 |

**mode=myopia（4 条）**

| id | trigger | say | audio | 核实出处 |
|---|---|---|---|---|
| c5s4-m1 | `!R.sharp && R.imgWhere==='视网膜前' && (G.t-G.modeEnterT)>13000` | 看远处时，像会聚在视网膜前，只剩模糊光斑。 | c5s4-m1 | sharp/imgWhere=getter←imgInfo() 行129~134；近视远点1.78D 行11（初始 uK=2.7 必模糊→进门即真→必须加闸门）；口径 explain 行97~98 |
| c5s4-m2 | `R.sharp===true && R.uK<1.6 && R.glass===null` | 把树拖近就清晰啦：近视看近清楚、看远模糊。 | c5s4-m2 | uK 初值 2.7（行23/635）→进门为假免闸门；口径 hint 行408、explain 行97/155 |
| c5s4-m3 | `R.glass==='concave' && R.sharp===true` | 矫正成功！凹透镜先发散，像被拉回视网膜上。 | c5s4-m3 | glass 写 行539；凹镜 −2.61 行10（远端 2.7D 放松态清晰）；口径 explain 行101、hint m-ok 行400 |
| c5s4-m4 | `after:c5s4-m3@6000` | 因此我们得出结论：近视要戴凹透镜做的眼镜。 | c5s4-m4 | after 型@6000；口径 explain 行101/155 |

**mode=hyper（4 条）**

| id | trigger | say | audio | 核实出处 |
|---|---|---|---|---|
| c5s4-h1 | `!R.sharp && R.imgWhere==='视网膜后' && (G.t-G.modeEnterT)>13000` | 会聚点落在视网膜后，近处的物体看不清啦。 | c5s4-h1 | imgInfo 行129~134（diff>0=视网膜后，R16 虚线延长 行258~267）；远视清晰阈值1.94D 行11；口径 explain 行110~111 |
| c5s4-h2 | `R.sharp===true && R.uK>1.95 && R.glass===null && (G.t-G.modeEnterT)>13000` | 看远处是清晰的；把树拖近，试试模糊光斑。 | c5s4-h2 | 进门即真（初始 uK=2.7>1.94 行11/23）→必须加闸门；口径 hint 行409（拖远又能调清晰） |
| c5s4-h3 | `R.glass==='convex' && R.sharp===true` | 矫正成功！凸透镜先会聚，像前移回视网膜。 | c5s4-h3 | 凸镜 4.48 行10；远视戴镜调节档 [0.45,1.05] 全行程无锁=R34 行12/56；口径 explain 行114、hint h-ok 行401 |
| c5s4-h4 | `after:c5s4-h3@6000` | 因此我们得出结论：远视戴凸透镜，老花镜就是它。 | c5s4-h4 | after 型@6000；口径 explain 行114/155 |

### A-3 errors 表（3 条，电平触发 5s 节流；按 mode key 分挂，天然眼况闸门，表达式无需再带 R.cond）

| id | mode | trigger | fix | audio | 核实出处 |
|---|---|---|---|---|---|
| c5s4-en1 | normal | `R.glass!==null` | 不对哟～正常眼不用戴眼镜，戴上像反而模糊啦。 | c5s4-en1 | 正常眼戴镜必偏离视网膜（fReqK 行59~67 不做串联补偿）；口径 hint n-glass 行399、showToast 行542 |
| c5s4-em1 | myopia | `R.glass==='convex'` | 不对哟～近视该戴凹透镜，凸透镜让像更散哦。 | c5s4-em1 | glass 写 行539；口径 hint g-wrong 行402、showToast 行545（近视要凹透镜） |
| c5s4-eh1 | hyper | `R.glass==='concave'` | 不对哟～远视该戴凸透镜，把凹镜拖回托盘换一片。 | c5s4-eh1 | 取下=拖回托盘 行536；口径 行402/545（远视要凸透镜） |

### A-4 free 表（5 条，边沿+8s 节流，全部带状态闸门）

| mode | trigger | note | audio | 核实出处 |
|---|---|---|---|---|
| normal | `R.showFlow===true` | 光流开啦：蓝色脉冲标出光进眼睛的路线。 | c5s4-fn1 | showFlow 写 行623；光流绘制 beamSeg 行198~204 |
| myopia | `R.auto===false` | 自动关啦：拖厚度滑杆，看会聚点前后移动。 | c5s4-fm1 | auto 写 行602（关自动 tCmd 接手 行603）；口径 hint manual 行404（近视手动看远够不着清晰） |
| myopia | `R.showFlow===true` | 光流开啦：看清光怎样先经凹透镜发散。 | c5s4-fm2 | 行623；口径 explain 行101（凹透镜先使光适当发散） |
| hyper | `R.auto===false` | 自动关啦：拖滑杆调厚薄，自己找清晰像点。 | c5s4-fh1 | 行602；口径 hint 行405~406 |
| hyper | `R.showFlow===true` | 光流开啦：看清光怎样先经凸透镜会聚。 | c5s4-fh2 | 行623；口径 explain 行114（凸透镜使光先适当会聚） |

条件重叠自查（r5 纪律）：三 mode 各自独立求值互不打架；同 mode 内 steps/errors/free 触发条件两两无同时为真的重叠对（en1 挂 glass≠null 时 normal 无其他 glass 相关条目；fm1/fh1 挂 auto===false，steps 均不含 auto 条件）。

### A-5 guide-data.js（完整）

> 口径统一：`(G.t-G.modeEnterT)>13000` 闸门与 delay:13000 同值=intro afinfo 实测+1s 回填（三条 intro 预估 11.3~11.5s，A-2 表已同步用 13000）。
> n2 未加闸门（初始 uK=2.7 为假）；边缘场景=树已拖近时切走再切回 normal，n2 会在 intro 期间即时打断重进——按规范§2.2「即时打断」属可接受行为，若蔡总实机反馈打断开场白，再补同款 13000 闸门（一行改动）。

```js
/* content/physics_g8_v1_c5_s4/guide/guide-data.js */
window.C5S4_GUIDE={
  normal:{
    intro:{text:'欢迎来到眼睛成像实验室！晶状体相当于凸透镜，视网膜是光屏，睫状体自动调节厚薄，跟我看！',audio:'c5s4-n-intro'},
    steps:[
      {id:'c5s4-n1',repeat:true,trigger:'delay:13000',say:'拖左侧的小树远近变化，看晶状体自动变厚变薄。',audio:'c5s4-n1'},
      {id:'c5s4-n2',repeat:true,trigger:'R.uK<1.6 && R.glass===null',say:'看近处：睫状体收缩，晶状体变厚，像仍然清晰。',audio:'c5s4-n2'},
      {id:'c5s4-n3',repeat:true,trigger:'after:c5s4-n2@6000',say:'因此我们得出结论：睫状体调节厚薄，远近都清晰。',audio:'c5s4-n3'}
    ],
    errors:[
      {id:'c5s4-en1',trigger:'R.glass!==null',fix:'不对哟～正常眼不用戴眼镜，戴上像反而模糊啦。',audio:'c5s4-en1'}
    ],
    free:[
      {trigger:'R.showFlow===true',note:'光流开啦：蓝色脉冲标出光进眼睛的路线。',audio:'c5s4-fn1'}
    ],
    tasks:[]
  },
  myopia:{
    intro:{text:'近视眼：晶状体太厚折光太强，远处的像落在视网膜前。看，远处模糊、近处清楚，凹透镜能矫正！',audio:'c5s4-m-intro'},
    steps:[
      {id:'c5s4-m1',repeat:true,trigger:'!R.sharp && R.imgWhere===\'视网膜前\' && (G.t-G.modeEnterT)>13000',say:'看远处时，像会聚在视网膜前，只剩模糊光斑。',audio:'c5s4-m1'},
      {id:'c5s4-m2',repeat:true,trigger:'R.sharp===true && R.uK<1.6 && R.glass===null',say:'把树拖近就清晰啦：近视看近清楚、看远模糊。',audio:'c5s4-m2'},
      {id:'c5s4-m3',repeat:true,trigger:'R.glass===\'concave\' && R.sharp===true',say:'矫正成功！凹透镜先发散，像被拉回视网膜上。',audio:'c5s4-m3'},
      {id:'c5s4-m4',repeat:true,trigger:'after:c5s4-m3@6000',say:'因此我们得出结论：近视要戴凹透镜做的眼镜。',audio:'c5s4-m4'}
    ],
    errors:[
      {id:'c5s4-em1',trigger:'R.glass===\'convex\'',fix:'不对哟～近视该戴凹透镜，凸透镜让像更散哦。',audio:'c5s4-em1'}
    ],
    free:[
      {trigger:'R.auto===false',note:'自动关啦：拖厚度滑杆，看会聚点前后移动。',audio:'c5s4-fm1'},
      {trigger:'R.showFlow===true',note:'光流开啦：看清光怎样先经凹透镜发散。',audio:'c5s4-fm2'}
    ],
    tasks:[]
  },
  hyper:{
    intro:{text:'远视眼就是老花眼：晶状体太薄折光太弱，近处的像落在视网膜后。凸透镜老花镜来帮忙，试试！',audio:'c5s4-h-intro'},
    steps:[
      {id:'c5s4-h1',repeat:true,trigger:'!R.sharp && R.imgWhere===\'视网膜后\' && (G.t-G.modeEnterT)>13000',say:'会聚点落在视网膜后，近处的物体看不清啦。',audio:'c5s4-h1'},
      {id:'c5s4-h2',repeat:true,trigger:'R.sharp===true && R.uK>1.95 && R.glass===null && (G.t-G.modeEnterT)>13000',say:'看远处是清晰的；把树拖近，试试模糊光斑。',audio:'c5s4-h2'},
      {id:'c5s4-h3',repeat:true,trigger:'R.glass===\'convex\' && R.sharp===true',say:'矫正成功！凸透镜先会聚，像前移回视网膜。',audio:'c5s4-h3'},
      {id:'c5s4-h4',repeat:true,trigger:'after:c5s4-h3@6000',say:'因此我们得出结论：远视戴凸透镜，老花镜就是它。',audio:'c5s4-h4'}
    ],
    errors:[
      {id:'c5s4-eh1',trigger:'R.glass===\'concave\'',fix:'不对哟～远视该戴凸透镜，把凹镜拖回托盘换一片。',audio:'c5s4-eh1'}
    ],
    free:[
      {trigger:'R.auto===false',note:'自动关啦：拖滑杆调厚薄，自己找清晰像点。',audio:'c5s4-fh1'},
      {trigger:'R.showFlow===true',note:'光流开啦：看清光怎样先经凸透镜会聚。',audio:'c5s4-fh2'}
    ],
    tasks:[]
  },
  audios:{
    'c5s4-n-intro':'guide/audio/c5s4-n-intro.mp3',
    'c5s4-n1':'guide/audio/c5s4-n1.mp3','c5s4-n2':'guide/audio/c5s4-n2.mp3','c5s4-n3':'guide/audio/c5s4-n3.mp3',
    'c5s4-en1':'guide/audio/c5s4-en1.mp3','c5s4-fn1':'guide/audio/c5s4-fn1.mp3',
    'c5s4-m-intro':'guide/audio/c5s4-m-intro.mp3',
    'c5s4-m1':'guide/audio/c5s4-m1.mp3','c5s4-m2':'guide/audio/c5s4-m2.mp3',
    'c5s4-m3':'guide/audio/c5s4-m3.mp3','c5s4-m4':'guide/audio/c5s4-m4.mp3',
    'c5s4-em1':'guide/audio/c5s4-em1.mp3','c5s4-fm1':'guide/audio/c5s4-fm1.mp3','c5s4-fm2':'guide/audio/c5s4-fm2.mp3',
    'c5s4-h-intro':'guide/audio/c5s4-h-intro.mp3',
    'c5s4-h1':'guide/audio/c5s4-h1.mp3','c5s4-h2':'guide/audio/c5s4-h2.mp3',
    'c5s4-h3':'guide/audio/c5s4-h3.mp3','c5s4-h4':'guide/audio/c5s4-h4.mp3',
    'c5s4-eh1':'guide/audio/c5s4-eh1.mp3','c5s4-fh1':'guide/audio/c5s4-fh1.mp3','c5s4-fh2':'guide/audio/c5s4-fh2.mp3'
  }
};
window.GUIDE_CFG={state:window.C5S4_STATE};/* 多场景页不设 mode key：引擎每帧轮询 R.mode（=st.cond 不可枚举 getter，normal/myopia/hyper） */
window.GUIDE_DATA=window.C5S4_GUIDE;
```

### A-6 clip 清单（前缀 c5s4-，共 22 条；预估秒数=字数÷4+0.5，afinfo 实测后回填）

| clip id | 文本 | 预估秒数 |
|---|---|---|
| c5s4-n-intro | 欢迎来到眼睛成像实验室！晶状体相当于凸透镜，视网膜是光屏，睫状体自动调节厚薄，跟我看！ | 11.3 |
| c5s4-n1 | 拖左侧的小树远近变化，看晶状体自动变厚变薄。 | 5.8 |
| c5s4-n2 | 看近处：睫状体收缩，晶状体变厚，像仍然清晰。 | 5.5 |
| c5s4-n3 | 因此我们得出结论：睫状体调节厚薄，远近都清晰。 | 6.0 |
| c5s4-en1 | 不对哟～正常眼不用戴眼镜，戴上像反而模糊啦。 | 5.8 |
| c5s4-fn1 | 光流开啦：蓝色脉冲标出光进眼睛的路线。 | 5.0 |
| c5s4-m-intro | 近视眼：晶状体太厚折光太强，远处的像落在视网膜前。看，远处模糊、近处清楚，凹透镜能矫正！ | 11.5 |
| c5s4-m1 | 看远处时，像会聚在视网膜前，只剩模糊光斑。 | 5.5 |
| c5s4-m2 | 把树拖近就清晰啦：近视看近清楚、看远模糊。 | 5.3 |
| c5s4-m3 | 矫正成功！凹透镜先发散，像被拉回视网膜上。 | 5.3 |
| c5s4-m4 | 因此我们得出结论：近视要戴凹透镜做的眼镜。 | 5.8 |
| c5s4-em1 | 不对哟～近视该戴凹透镜，凸透镜让像更散哦。 | 5.3 |
| c5s4-fm1 | 自动关啦：拖厚度滑杆，看会聚点前后移动。 | 5.0 |
| c5s4-fm2 | 光流开啦：看清光怎样先经凹透镜发散。 | 4.8 |
| c5s4-h-intro | 远视眼就是老花眼：晶状体太薄折光太弱，近处的像落在视网膜后。凸透镜老花镜来帮忙，试试！ | 11.5 |
| c5s4-h1 | 会聚点落在视网膜后，近处的物体看不清啦。 | 5.3 |
| c5s4-h2 | 看远处是清晰的；把树拖近，试试模糊光斑。 | 5.3 |
| c5s4-h3 | 矫正成功！凸透镜先会聚，像前移回视网膜。 | 5.3 |
| c5s4-h4 | 因此我们得出结论：远视戴凸透镜，老花镜就是它。 | 6.0 |
| c5s4-eh1 | 不对哟～远视该戴凸透镜，把凹镜拖回托盘换一片。 | 5.8 |
| c5s4-fh1 | 自动关啦：拖滑杆调厚薄，自己找清晰像点。 | 5.0 |
| c5s4-fh2 | 光流开啦：看清光怎样先经凸透镜会聚。 | 4.8 |

小计 22 条（intro 3 + steps 11 + errors 3 + free 5）。TTS：全批 `zh-CN-XiaoxiaoNeural` 1.0x；「～」只停顿不发音；文件名=clip id 存 `guide/audio/`；intro 三条落盘后 afinfo 实测，回填 A-2 delay:13000 与 modeEnterT>13000 闸门（三处同值联动）。

### A-7 接线备忘（供后续开发单，本设计书零代码改动）

1. **core 插入点**：exp-eye-core.js 行26（`var st={...};` 闭合）之后插入 A-1 暴露代码块（4 个 defineProperty + window.C5S4_STATE=st）。
2. **html 五件套**（exp-eye.html 141 行，现 script 区 行132~135：props.js→props-optics.js→sfx.js→exp-eye-core.js）：在 行135 core 引用之后、行136 页内 `<script>` 之前依次加：
   - `<link rel="stylesheet" href="../_lib/guide/guide-core.css?v=…">`（head 内）
   - `<script src="guide/guide-data.js?v=…">`（**必须先于 engine**：引擎 IIFE 顶部即捕获 R/DATA）
   - `<script src="../_lib/guide/engine-core.js?v=…">`
   - `<script src="../_lib/guide/vB-core.js?v=…">`
   - 页尾补 `<div id="guide-layer"></div>` 容器 + vB init（照 c4s3 各变体页样板）
3. **hint 删除范围**：guide 上线后橙色 toast 解说条与语音层信息重叠——开发单执行时删/隐 `#toast`（html 行97）+ sayHint/showToast/hintBranch 调用链（core 行396~434 及相关调用点），保留 bubble 知识气泡（点击触发，不与语音抢通道）；此段仅备忘，具体拆线范围以开发单为准。
4. **移动三件现状**：viewport meta 行7 已有（width=device-width, initial-scale=1.0，无 viewport-fit=cover，guide 层用 fixed 定位不受影响）；canvas `touch-action:none` 行18 已有；ctrlbar compact 档（COMPACT_H=600，core 行17/586）已有 → 三件齐备，字幕条 bottomOff() 走 `.ctrlbar` 测高（html 行99 有该 class ✓）。
5. **缓存**：guide 四引用 + core 引用统一 `?v=` bump；交付提醒强刷。

---

## §B c5_s5 望远镜（exp-telescope.html）

### B-1 状态暴露核查

状态在 IIFE 闭包 `var st={...}`（exp-telescope-core.js 行16~21），**全文仅此一次赋值**（grep `st\s*=\s*{` 唯一命中行16），重置（#btn-reset 监听 行415~430）与全部交互均为原地 mutate 字段 → 满足引擎「稳定对象原地 mutate」要求。既有调试通道 `window.__c5s5dbg.get st()`（行461~466）佐证对象长期存活。状态变量名是 **st**；对焦判定是闭包函数 isMatch()（行27，|L−lMatch|≤MATCH_TOL_CM=0.6cm，行6），**st 本体无 matched 字段** → 暴露方案补派生 getter（c3_s1 不可枚举 getter 聚合；无整体重赋值，无需 c3_s2 Proxy）。

**状态字段速查表**（出处均为 exp-telescope-core.js）：

| 字段 | 类型 | 取值/范围 | 含义 | 出处（行号） |
|---|---|---|---|---|
| fObj | number | 20\|30（cm） | 物镜焦距（select 两档） | 声明行17；写 行351（#sel-fobj change）、行416（reset） |
| fEye | number | 10\|15（cm） | 目镜焦距 | 行17；写 行357（#sel-feye change）、行416 |
| L | number | lMatch±5，0.5 步进（clampL 行40） | 镜筒距离=两镜间距 cm | 行17；写 setL() 行318（←#rng-tube input 行371、◀▶钮 行373~375、canvas 拖目镜 pointermove ≈行337）、行418（reset 回匹配点）、syncTubeRange 行367（换镜/换物距收回范围） |
| near | bool | 默认 false | 物距档：false=最远（u→∞）/true=较近（u=6f物，NEAR_U_K 行7） | 行17；写 setNear() 行384（#btn-far/#btn-near 行392~393） |
| wasMatch | bool | 初值 true | checkMatch 内部边沿追踪器（上一次对焦态） | 行18；写 行316（checkMatch）、行351/357/384（换档置 false）、行419 |
| everMatch | bool | 初值 false，闩锁（reset 才清） | 曾对焦成功（失焦→再对焦边沿 行309~315 置真） | 行18；写 行311、行419 |
| angleSeen | bool | | 视角对比 hint 已展示 | 行18；写 行294（**仅 sayHint 内**，hint 删除后永不置真→trigger 禁用） |
| flow | bool | | 光流脉冲开关 | 行19；写 行396（#btn-flow click） |
| showLabels | bool | | canvas 标注开关（f物/f目/L 尺寸线） | 行20；写 行403（#btn-labels click） |

派生 getter（本方案新增）：`matched`=isMatch()（行27；lMatchCm() 行26=vObjCm()+fEye，vObjCm() 行25：最远档=f物、较近档=1.2f物）。倍率 magK()=fObj/fEye（行28）为闭包函数，trigger 需要时可直接写 `R.fObj/R.fEye` 表达式（本设计未用）。

**陷阱字段（trigger 禁用）**：`drag/startPt/glowFx/toastTimer`（行22 闭包散变量：瞬态手势/动画）；`flowT0`（行23 闭包散变量，动画时间戳）；`st.wasMatch`（内部边沿追踪器，语义=上一次 checkMatch 结果，判「当前已对焦」一律用 matched getter）；`st.angleSeen`（依赖 hint toast 展示，guide 版删 hint 后恒假）；闭包布局缓存 `W/H/S/axisY/xObjLens/eyeRoom/hatchP`（行14~15/45~50，resize/layout 重算，闭包私有）。**st 无 angleI → G.angChangeCount/G.lastAngChangeT 禁用**；R.doCm/R.objLit/R.eqState/R.m3/#rec-table 全不存在 → G.recCount/objChangeCount/eqMoveGestureCount/everLit 等 c4s3 专属字段全禁用。本章 trigger 的 G 字段仅用 `G.t/G.modeEnterT` 一处（s2 闸门）：初始 L=匹配点（行17 L:30=lMatch，行464~465 初始化回匹配点），**进门 matched 即为真**，无闸门会在 intro 期间误发；其余条目进门均为假，不需闸门。

**最小暴露方案**：在 st 声明闭合 `};`（**行21**）之后插入（isMatch 为函数声明 行27，hoisting 保证 getter 惰性调用安全；__c5s5dbg 无 Object.assign 写 st 路径，不可枚举仍照 c3_s1 纪律执行）：

```js
/* guide 语音层暴露（B版标配）：不可枚举 getter 聚合派生量，零干扰 st 本体 */
(function(){
  Object.defineProperty(st,'matched',{enumerable:false,get:function(){return isMatch();}});
  window.C5S5_STATE=st;
})();
```
（注：引擎 updateG 读 R.matched 会顺带激活 G.everMatched/matchedEdgeCount 采集——本设计不引用，无害；countRec 查 #rec-table 不存在恒 0，无报错。）

**模式源**：本页**单场景**——无望远镜类型切换（恒开普勒式两凸透镜），「物距最远/较近」只是同一实验的物距档微调（setNear 行382~393 只改 lMatch 目标值），切档重播 intro 反而吵 → **GUIDE_CFG.mode='refract' 照实设**（照 c6s1/c6s2 单场景先例），near 档差异用 steps 内 R.near 闸门表达。

**物理口径锚点**（explain.html）：行90 物镜给远处物体成倒立缩小实像（物距≫2f，同照相机）；行91 实像落目镜焦点以内、目镜相当于放大镜再放大、视角大大增加、觉得物体被拉近；行94 观察最远物体时两镜间距约等于焦距之和 L≈f物+f目、观察较近物体时间距要稍大一些；行96 物镜口径大会聚更多光像更明亮；行102 选焦距长的作物镜、短的作目镜，倍率大；行111~112 视角越大看得越清、共同本质=增大视角；行115 放大倍率=f物÷f目；行133~135 例题（24÷8=3 倍、L≈32cm）。页面自洽：checkMatch 对焦 toast（行313）「镜筒距离≈f物+f目」、眼视图窗 drawEyePeep（≈行246~270）离焦=模糊变淡、R19 出射光恒平行主轴（drawRays ≈行233~245）。**口径注意**：core 的眼视图/toast 写「正立放大的像」，explain 思考讨论2 答案写「像是倒立的」（行119~121）——两处存在页面级出入，语音文案**回避正倒表述**，只用双方一致的「实像→目镜放大→视角变大→拉近」链条，零臆造零站队。

### B-2 steps 表（7 条，全 repeat:true；单场景 mode key=refract）

> 闸门核查：初始 L=lMatch（行17 注释「L 初始=默认组合匹配距离」+ 初始化 行464~465）→ **进门 matched 即为真**，s2 必须加 `(G.t-G.modeEnterT)>13000` 闸门（=intro 实测+1s 回填，防掐开场白）；其余条目进门均为假，免闸门。G 字段仅用 G.t/G.modeEnterT。

| id | trigger | say（≤25字） | audio | 核实出处 |
|---|---|---|---|---|
| c5s5-s1 | `delay:13000` | 先拖镜筒滑杆，调物镜和目镜之间的距离。 | c5s5-s1 | delay 型（规范§2.3，delayFired 守卫）；滑杆 #rng-tube input 行371、◀▶ 行373~375、canvas 拖目镜 ≈行337 |
| c5s5-s2 | `R.matched===true && R.near===false && (G.t-G.modeEnterT)>13000` | 对焦成功！间距刚好约等于f物加f目。 | c5s5-s2 | matched getter←isMatch() 行27；lMatchCm=vObj+fEye 行26（最远档 vObj=f物 行25）；口径 explain 行94 |
| c5s5-s3 | `after:c5s5-s2@6000` | 因此我们得出结论：物镜成像、目镜放大，视角变大。 | c5s5-s3 | after 型@6000（规范§2.4）；口径 explain 行90~91/147 |
| c5s5-s4 | `R.matched===false && R.near===false` | 像模糊啦，慢慢拖动镜筒重新对焦。 | c5s5-s4 | setL 行318；眼视图离焦提示「像模糊——调镜筒长度对焦」drawEyePeep ≈行267 |
| c5s5-s5 | `R.near===true && R.matched===false` | 换看较近的物体，间距要稍大一些，重新调。 | c5s5-s5 | setNear 行382~393（#btn-near 行393）；切档必失焦（lMatch 变 0.2f物≥4cm>MATCH_TOL 0.6，行6/25~26）；口径 explain 行94「间距要稍大一些」 |
| c5s5-s6 | `R.near===true && R.matched===true` | 对焦成功！看近物时间距比焦距之和稍大。 | c5s5-s6 | vObjCm 行25（较近档 v=1.2f物）；lMatchCm 行26；口径 explain 行94 |
| c5s5-s7 | `R.fObj/R.fEye!==2` | 换镜片啦！放大倍率等于f物除以f目。 | c5s5-s7 | fObj 写 行351（#sel-fobj）、fEye 写 行357（#sel-feye）；默认 20/10=2 行17；magK 行28；口径 explain 行115 |

**同帧竞态核查（r5 纪律）**：
1. **换镜片必失焦**（ΔlMatch≥4cm>容差 0.6）→ s7 与 s4（或 near 档 s5）同帧上升沿。数组序 s4/s5 在前先发，次帧 s7 即时打断——最终完整听到的是倍率解说（信息量更高），s4/s5 仅泄漏 ≤20ms 起音不可闻。若实机嫌毛刺，备选改法：s4/s5 加 `R.fObj===20 && R.fEye===10` 闸门（默认组合才播模糊引导），一行改动。
2. s4↔s5、s5↔s6、s2↔s6 均以 `R.near`/`R.matched` 互斥，无重叠对。
3. s3 结论锚 s2：默认路径（不操作）13s 发 s2 → 19s 出结论；此后每次远档重新对焦，s2 重发 → 结论 6s 后重播（镜像 c6s1 s7/s8 模式）。
4. near 档切回最远：lMatch 变小必失焦 → s4 接住（✓ 引导重新对焦），无死区。

### B-3 errors 表（1 条，hold 型电平 5s 节流）

| id | trigger | fix | audio | 核实出处 |
|---|---|---|---|---|
| c5s5-e1 | `!R.matched && Math.abs(R.L-(R.near?R.fObj*1.2+R.fEye:R.fObj+R.fEye))>4@3000` | 不对哟～间距偏太多了，慢慢往f物加f目靠。 | c5s5-e1 | lMatch 展开式=vObjCm 行25（near=1.2f物←NEAR_U_K=6 行7）+lMatchCm 行26；滑杆行程 lMatch±5（TUBE_STROKE_CM 行4）→ >4cm=近行程端点仍失焦；@3000 hold 型 tickErrors 支持（持续满足 3s 才发）；与 s4/s5 分工=s4 边沿即时引导、e1 持续 3s 大偏差才纠错，时点错开不打架 |

### B-4 free 表（2 条，边沿+8s 节流，带闸门）

| trigger | note | audio | 核实出处 |
|---|---|---|---|
| `R.flow===true` | 光流开啦：看光怎样过物镜、目镜，进入眼睛。 | c5s5-f1 | flow 写 行396（#btn-flow click）；光流绘制 beam ≈行219~231；口径 explain 行90~91 光路链 |
| `R.showLabels===true` | 标注开啦：焦距和镜筒距离L都标出来了。 | c5s5-f2 | showLabels 写 行403（#btn-labels click）；haloText 行152、drawDim R32 总开关 ≈行246 |

**倍率类 free 弃用说明**：凡以 `R.matched===true` 为闸门的 free（如「3 倍组合倍率更大」）必与对焦 steps（s2/s6）同帧变真互相打断（tickFree 与 tickSteps 同帧先后执行，free 掐掉 step 音频）——按 r5「禁条件重叠」纪律弃用，倍率话题由 s7 步骤独家承担。engine-core.js tickFree 不支持 hold 型（无 holdMs 分支），无法用 @N 错开，故无替代写法。

### B-5 guide-data.js（完整）

```js
/* content/physics_g8_v1_c5_s5/guide/guide-data.js */
window.C5S5_GUIDE={
  refract:{
    intro:{text:'欢迎来到望远镜实验室！物镜成实像，目镜当放大镜，把远处物体的视角放大。先调镜筒距离对焦，跟我来！',audio:'c5s5-intro'},
    steps:[
      {id:'c5s5-s1',repeat:true,trigger:'delay:13000',say:'先拖镜筒滑杆，调物镜和目镜之间的距离。',audio:'c5s5-s1'},
      {id:'c5s5-s2',repeat:true,trigger:'R.matched===true && R.near===false && (G.t-G.modeEnterT)>13000',say:'对焦成功！间距刚好约等于f物加f目。',audio:'c5s5-s2'},
      {id:'c5s5-s3',repeat:true,trigger:'after:c5s5-s2@6000',say:'因此我们得出结论：物镜成像、目镜放大，视角变大。',audio:'c5s5-s3'},
      {id:'c5s5-s4',repeat:true,trigger:'R.matched===false && R.near===false',say:'像模糊啦，慢慢拖动镜筒重新对焦。',audio:'c5s5-s4'},
      {id:'c5s5-s5',repeat:true,trigger:'R.near===true && R.matched===false',say:'换看较近的物体，间距要稍大一些，重新调。',audio:'c5s5-s5'},
      {id:'c5s5-s6',repeat:true,trigger:'R.near===true && R.matched===true',say:'对焦成功！看近物时间距比焦距之和稍大。',audio:'c5s5-s6'},
      {id:'c5s5-s7',repeat:true,trigger:'R.fObj/R.fEye!==2',say:'换镜片啦！放大倍率等于f物除以f目。',audio:'c5s5-s7'}
    ],
    errors:[
      {id:'c5s5-e1',trigger:'!R.matched && Math.abs(R.L-(R.near?R.fObj*1.2+R.fEye:R.fObj+R.fEye))>4@3000',fix:'不对哟～间距偏太多了，慢慢往f物加f目靠。',audio:'c5s5-e1'}
    ],
    free:[
      {trigger:'R.flow===true',note:'光流开啦：看光怎样过物镜、目镜，进入眼睛。',audio:'c5s5-f1'},
      {trigger:'R.showLabels===true',note:'标注开啦：焦距和镜筒距离L都标出来了。',audio:'c5s5-f2'}
    ],
    tasks:[]
  },
  audios:{
    'c5s5-intro':'guide/audio/c5s5-intro.mp3',
    'c5s5-s1':'guide/audio/c5s5-s1.mp3','c5s5-s2':'guide/audio/c5s5-s2.mp3',
    'c5s5-s3':'guide/audio/c5s5-s3.mp3','c5s5-s4':'guide/audio/c5s5-s4.mp3',
    'c5s5-s5':'guide/audio/c5s5-s5.mp3','c5s5-s6':'guide/audio/c5s5-s6.mp3',
    'c5s5-s7':'guide/audio/c5s5-s7.mp3',
    'c5s5-e1':'guide/audio/c5s5-e1.mp3',
    'c5s5-f1':'guide/audio/c5s5-f1.mp3','c5s5-f2':'guide/audio/c5s5-f2.mp3'
  }
};
window.GUIDE_CFG={state:window.C5S5_STATE,mode:'refract'};/* 单场景：mode key 照实设（照 c6s1/c6s2 先例） */
window.GUIDE_DATA=window.C5S5_GUIDE;
```

### B-6 clip 清单（前缀 c5s5-，共 11 条；预估秒数=字数÷4+0.5，afinfo 实测后回填）

| clip id | 文本 | 预估秒数 |
|---|---|---|
| c5s5-intro | 欢迎来到望远镜实验室！物镜成实像，目镜当放大镜，把远处物体的视角放大。先调镜筒距离对焦，跟我来！ | 11.5 |
| c5s5-s1 | 先拖镜筒滑杆，调物镜和目镜之间的距离。 | 5.0 |
| c5s5-s2 | 对焦成功！间距刚好约等于f物加f目。 | 4.8 |
| c5s5-s3 | 因此我们得出结论：物镜成像、目镜放大，视角变大。 | 6.3 |
| c5s5-s4 | 像模糊啦，慢慢拖动镜筒重新对焦。 | 4.3 |
| c5s5-s5 | 换看较近的物体，间距要稍大一些，重新调。 | 5.5 |
| c5s5-s6 | 对焦成功！看近物时间距比焦距之和稍大。 | 5.3 |
| c5s5-s7 | 换镜片啦！放大倍率等于f物除以f目。 | 4.8 |
| c5s5-e1 | 不对哟～间距偏太多了，慢慢往f物加f目靠。 | 5.3 |
| c5s5-f1 | 光流开啦：看光怎样过物镜、目镜，进入眼睛。 | 5.3 |
| c5s5-f2 | 标注开啦：焦距和镜筒距离L都标出来了。 | 5.0 |

小计 11 条（intro 1 + steps 7 + errors 1 + free 2）。TTS：`zh-CN-XiaoxiaoNeural` 1.0x；「～」只停顿；「f物/f目」读「f物／f目」（同屏字幕原样）；intro 落盘后 afinfo 实测，回填 s1 delay:13000 与 s2 闸门 >13000（两处同值联动）。

### B-7 接线备忘（供后续开发单，本设计书零代码改动）

1. **core 插入点**：exp-telescope-core.js 行21（`var st={...};` 闭合）之后插入 B-1 暴露代码块（1 个 defineProperty + window.C5S5_STATE=st）。
2. **html 五件套**（exp-telescope.html 127 行，现 script 区 行122~125：props.js→props-optics.js→sfx.js→exp-telescope-core.js）：在 行125 core 引用之后依次加：
   - `<link rel="stylesheet" href="../_lib/guide/guide-core.css?v=…">`（head 内）
   - `<script src="guide/guide-data.js?v=…">`（**必须先于 engine**：引擎 IIFE 顶部即捕获 R/DATA）
   - `<script src="../_lib/guide/engine-core.js?v=…">`
   - `<script src="../_lib/guide/vB-core.js?v=…">`
   - 页尾补 `<div id="guide-layer"></div>` 容器 + vB init（照 c4s3 各变体页样板）
3. **hint 删除范围**：橙色 toast 解说条（html 行79 `#toast`）+ hintBranch/sayHint/showToast 调用链（core ≈行280~306 及 draw 内 sayHint 调用、checkMatch 对焦 toast 行313、setNear 切档 toast ≈行390）与语音重叠——guide 上线后删除；注意 `st.angleSeen` 写点在 sayHint 内（行294），删 hint 后该字段废弃（本设计已禁用）。canvas 眼视图窗（drawEyePeep）是教学本体**保留**。具体拆线范围以开发单为准。
4. **移动三件现状**：viewport meta 行7 已有（无 viewport-fit=cover，guide 层 fixed 定位不受影响）；canvas `touch-action:none` 行18 已有；ctrlbar compact 档（COMPACT_H=600，core 行8）已有 → 三件齐备，字幕条 bottomOff() 走 `.ctrlbar` 测高（html 行81 有该 class ✓）。
5. **缓存**：guide 四引用 + core 引用统一 `?v=` bump；交付提醒强刷。

---

## 全局纪律自检

- trigger 字段全部来自两 core.js 实核字段/常量（每条附行号）；G.* 仅用 G.t/G.modeEnterT（引擎 updateG 通用写入）；两页均无 R.angleI → G.angChangeCount 系禁用 ✓；c4s3 专属 G 字段（recCount/objChangeCount/eqMoveGestureCount/everLit 等）零引用 ✓。
- steps 全 repeat:true；结论条 after:xxx@6000；纠错「不对哟～」只说不打击；free 全带闸门；五类条目 audio 零缺失（A 章 22 clip = intro3+steps11+errors3+free5；B 章 11 clip = intro1+steps7+errors1+free2）✓。
- 文案口语化、一条一知识点、字幕 ≤25 字、intro ≤60 字（A 章 42/44/43 字，B 章 48 字）✓；物理口径逐条对齐 explain.html（正倒立出入处回避，见 B-1 口径注意）✓。
- delay/闸门 13000 均为预估，音频落盘后按规范§2.3/§4.4 afinfo 实测回填（A 章 5 处、B 章 2 处）。

（完）

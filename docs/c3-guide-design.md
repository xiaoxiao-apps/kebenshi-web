# c3 物态变化 · 四实验页语音讲解层设计书（B 版标配）

> 目标页面（4 个实验，各一份 guide-data）：
> - §A `content/physics_g8_v1_c3_s1/exp-temp-lab.html` 温度实验室
> - §B `content/physics_g8_v1_c3_s2/exp-melt.html` 熔化凝固探究馆
> - §C `content/physics_g8_v1_c3_s3/exp-vapor.html` 汽化液化探究馆（boil/evap/liquefy 三模式，html 实际加载 exp-vapor-* 全套 + exp-liquefy-core.js + exp-liquefy.js，见 html:153-160）
> - §D `content/physics_g8_v1_c3_s4/exp-subl.html` 升华凝华观察站
>
> 依据：`~/.openclaw/workspace/可交互教材/实验语音讲解层改造规范-B版标配.md`（下称【规范】）+ 格式模板 `docs/c4s3-guide-variants-design.md` + 共享引擎 `content/_lib/guide/engine-core.js`（下称【引擎】）/`vB-core.js`。
> 物理口径权威源：各节 `explain.html`（本文解说词与其逐条对齐，禁臆造数值）。
> 本文档为纯设计产出：**不改任何代码、不 git**。所有 trigger 字段均已 grep 核实，逐条标注（文件+行号）。
>
> **文件缩写**（出处标注用）：
> - S1-core=`physics_g8_v1_c3_s1/exp-temp-lab-core.js`，S1-ui=`exp-temp-lab.js`，S1-html=`exp-temp-lab.html`
> - S2-core=`physics_g8_v1_c3_s2/exp-melt-core.js`，S2-ui=`exp-melt.js`，S2-html=`exp-melt.html`
> - S3-core=`physics_g8_v1_c3_s3/exp-vapor-core.js`，S3-phys=`exp-vapor-physics.js`，S3-ui=`exp-vapor.js`，S3-lq=`exp-liquefy-core.js`，S3-lqui=`exp-liquefy.js`，S3-html=`exp-vapor.html`
> - S4-core=`physics_g8_v1_c3_s4/exp-subl-core.js`，S4-ui=`exp-subl.js`，S4-pour=`exp-subl-pour.js`，S4-html=`exp-subl.html`
> - 引擎=`content/_lib/guide/engine-core.js`

---

## §0 总览与共享约定

### 0.1 形态与引擎

四页统一走 B 版语音标配（【规范】§1/§2）：复用共享 `_lib/guide/engine-core.js + vB-core.js + guide-core.css`，每页新建 `guide/guide-data.js`（数据）+ `guide/audio/*.mp3`（配音），宿主用 vB 对比页方式接入（同 c4s3：生产实验页 html 零改动，新建 `exp-*-vB.html` 加载同一套 core + 讲解层；core.js 仅加「状态暴露」行，见各 §-1）。

引擎触发机制（引擎:33-47）：
- `delay:N`＝进模式延时一次（repeat 步骤有 delayFired 守卫，引擎:168-173）
- `after:<stepId>@N`＝依赖步触发后延时 N ms（repeat 下依赖步每多发一次重挂一次，引擎:175-182）
- `event:<evt>:<selector>[:expr]`＝capture 阶段即时判态（**读到的是点击前状态**，引擎:246-268；通用版自动扫描 DATA 绑定任意选择器，引擎:270-289）
- `expr@N`＝条件持续 N ms 才触发（引擎:41/190-201）
- 其余为电平表达式；steps 全 `repeat:true`（边沿重触发+3s 冷却，引擎:202-205）；errors 电平 5s 节流（引擎:225）；free 边沿+8s 节流（引擎:238-244）。
- **trigger 表达式只注入 `R`（=GUIDE_CFG.state）与 `G` 两个变量**（引擎:44 `new Function('R','G',...)`）。共享引擎的 `G` 采集是 c4s3 专属字段（引擎:68-121，recCount/doCm/eqState…），c3 各页没有这些字段，**本设计所有 trigger 一律不使用 G.\*（G.t 也不用）**，只用 R.\*、window 全局（如 `window.SublimationPour.state`）与 event:/after:/delay: 语法——保证零引擎改动。
- 即时打断制（vB-core 头注释）：同帧多条只发第一条（引擎:204/207 `return`），连发会互相掐断。**凡两条 step 可能同帧/近帧变真的，本设计一律用 `after:xxx@6000` 链式错开**（【规范】§2.4：延时必须 ≥6s）。

### 0.2 mode key 约定

| 实验 | state.mode 实况 | guide-data mode key | GUIDE_CFG |
|---|---|---|---|
| c3_s1 | 无 mode 字段（S1-core:28-38 全量字段无 mode） | `refract`（单场景统一约定） | `{state:window.C3S1_STATE, mode:'refract'}` |
| c3_s2 | `state.mode='melt'\|'freeze'`（S2-core:59、988、1008、1030） | 真实 key：`melt`/`freeze` 两节 | `{state:window.C3S2_STATE}`（引擎:376 轮询 R.mode 自动切） |
| c3_s3 | `state.mode='boil'\|'evap'\|'liquefy'`（S3-phys:47，tab 切换 S3-ui:179-181） | 真实 key：`boil`/`evap`/`liquefy` 三节 | `{state:window.C3S3_STATE}` |
| c3_s4 | `state.mode` 恒 `'iodine'`（S4-core:38，单 tab S4-html:91） | `refract`（单场景统一约定；GUIDE_CFG.mode 优先级高于 R.mode，引擎:376） | `{state:window.C3S4_STATE, mode:'refract'}` |

c3_s2 的 melt→freeze 由实验自动推进（S2-core:1002-1004 熄火自动转凝固 / 1023-1030 预熔按钮直达），引擎在 R.mode 变化沿 onModeEnter → 自动播对应模式 intro（引擎:376-377、301-312），正好承担「阶段转场开场白」。

### 0.3 宿主接线模板（开发单用，每页 vB html 末尾）

```html
<div id="guide-layer"></div>
<link rel="stylesheet" href="../_lib/guide/guide-core.css?v=YYYYMMDDg1">
<script src="guide/guide-data.js?v=YYYYMMDDg1"></script>
<script>window.GUIDE_CFG={state:window.C3SX_STATE/*,mode:'refract' 视 §0.2 */};window.GUIDE_DATA=window.C3SX_GUIDE;</script>
<script src="../_lib/guide/engine-core.js?v=YYYYMMDDg1"></script>
<script src="../_lib/guide/vB-core.js?v=YYYYMMDDg1"></script>
```

加载顺序硬约束（docs/guide-core-lib-report.md §前提顺序）：宿主 core 脚本（暴露 window.C3SX_STATE）→ guide-data.js → GUIDE_CFG/GUIDE_DATA 内联 → engine-core → vB-core。引擎在脚本求值时即捕获 `GUIDE_CFG.state` 引用（引擎:12），**因此暴露的状态对象必须在脚本加载期就存在且此后永不重赋值**（原地 mutate）——这正是各 §-1 最小暴露方案要解决的。

### 0.4 已知边界（落地/验收时留意，非阻塞）

1. **重进模式抢 intro**：core 的 `*Announced` 旗标与 `R.heating` 等跨模式切换不清零。若学生带着「灯还开着」从 evap 切回 boil，boil-s1（电平真）会在进模式首帧触发、按即时打断制掐掉 intro 换成步骤解说——内容仍连贯，属可接受行为；c4s3 同款场景同行为。若蔡总实测不满意，修复方向是 vB 层「intro 播放期间挂起 steps 首发」，勿改 core 旗标（会引发 core 自己的 toast 重放）。
2. 本设计**无 `delay:N` 型步骤**（四页探究链全部由真实交互边沿起步，不依赖「进模式 N 秒后」的悬空解说）；若落地轮增补 delay 步，N 必须按【规范】§4.4 用 afinfo 实测 intro 时长 +1s 回填，禁预估。
3. event 型 trigger 读 capture 时刻（点击前）状态——本设计所有 event 表达式都按「点击前」语义写，行内有注。
4. c3_s3 蒸发子台的风扇加速是 canvas 点击（S3-core:780-795），无 DOM 钩子，不配语音；三因素解说由滑杆 event + fastShown 步骤承担。
5. c3_s3 纸锅点火有两条路径：DOM 按钮 `#paper-match-btn`（S3-ui:231-235）与 canvas 点火柴（S3-core:797-806）。evap-e1 只能挂按钮路径；canvas 路径空烧由 evap-e2（burning 电平）兜底。
6. c3_s3 蒸发「涂酒精」按钮是 class 选择器（`.evap-coat-btn`×2，S3-html:140-141，无 id），引擎 `document.querySelector` 只能绑到第一个（引擎:248）且无法区分左右 → 不配 event 型 trigger，用 `alcohol[0]<=0` 电平引导（§C.3 evap-f2）。

### 0.5 引擎前置微补丁（开发单必做，唯一引擎改动）

共享引擎 `bindEventTriggers` 的监听器只分发 **errors 和 free** 两类 event 型 trigger（引擎:250-268），扫描绑定时虽包含 steps（引擎:273），但 steps 的 event 型永远不触发。本设计 **§A 步骤 s3（`event:click:#clinical-shake`）是唯一一条 event 型 step**（甩体温计是瞬时动作，电平无法捕捉「刚甩过」边沿）。

→ 开发单需在 `_lib/guide/engine-core.js` 的 `bind()` 监听器内（free 分发块之后，约引擎:267 行后）镜像 errors 分支补一段 steps 分发：

```js
if(md.steps)md.steps.forEach(function(st){
  var p=parseTrigger(st.trigger);
  if(!p||p.evt!==evt||p.el!==elSel)return;
  if(throttle(repLast,st.id,REP_COOLDOWN))fireStep(st,curMode);
});
```

向后兼容（【规范】§3.4）：c4s3 script.js 的 steps 无 event 型 trigger，此补丁对其零行为变化；交付时回归 c4s3 四变体页 console 0 报错。若蔡总不想动共享引擎，降级方案=删掉 c3s1-s3（甩体温计知识点并入 intro 口播），其余设计不变。

---

## §A c3_s1 温度实验室（mode key：`refract`）

### §A-1 状态暴露核查（最关键）

状态在 S1-core 闭包：`let state = {...}`（S1-core:28-38），**resetState 只逐字段赋值、不重赋 state 引用**（S1-core:58-79），对象天然稳定 ✓。但 `paused`（S1-core:40）与 `thermometers`（S1-core:54）是独立闭包散变量，且 `paused = !paused` 会重赋值（S1-ui:41），不能直接挂引用 → 用**不可枚举 getter** 聚到 state 上。

状态字段速查表（trigger 只准用这些）：

| 字段 | 类型/取值 | 含义 | 出处 |
|---|---|---|---|
| `R.waterTemp` | number ℃，初 20，钳位 [-30,100] | 水温 | S1-core:29、117；沸腾钳 100 S1-core:94-97 |
| `R.ambTemp` | number ℃，初 20，滑杆 -10~40 | 环境温度 | S1-core:30；绑定 S1-ui:29；滑杆 S1-html:50 |
| `R.volumeML` | 100~400，初 200 | 水量 mL | S1-core:31；绑定 S1-ui:31；滑杆 S1-html:64 |
| `R.heatPower` | 0~500 步进 10，初 0 | 加热功率 W | S1-core:32；绑定 S1-ui:30；滑杆 S1-html:57 |
| `R.heating` | bool | 加热开关（火焰可见性同源） | S1-core:33；setHeating S1-core:329-333；按钮 S1-ui:33-37 |
| `R.iceMass` | number g ≥0，每按 +10g | 冰剩余质量 | S1-core:34；addIce S1-core:285-288（ICE_CUBE_G=10 S1-core:14）；熔化衰减 S1-core:99-107 |
| `R.simTime` | number 模拟秒 | 仅 !paused 时累计 | S1-core:35、82-85 |
| `R.timeScale` | 1/10/60/300，初 60 | 时间加速 | S1-core:36；S1-ui:66；S1-html:70 |
| `R.dataLog` | array {t,T} | 温度采样（≤6000） | S1-core:37、86-87 |
| `R.paused`（getter 暴露） | bool，初 true | 时间是否暂停 | S1-core:40；切换 S1-ui:41-43；物理门 S1-core:83 |
| `R.thermometers`（getter 暴露） | array，元素 {id,type,def,inWater,reading,retainedReading,...} | 已插入温度计；type∈lab/clinical/diy/digital | S1-core:54；元素构造 S1-ui:312；THERM_DEFS（体温计量程 35~42）S1-ui:4-9 |

物理/UI 关键判定（trigger 依据）：
- 沸腾气泡判定 `heating && waterTemp>=99.5`：S1-core:307-308（updateBubbles，物理气泡）
- 冰存在时水温钳 0℃（冰水混合物平台）：S1-core:106
- 体温计缩口保持峰值、离水不回落：S1-ui:512-518；甩一甩复位 S1-ui:594-599（按钮 `#clinical-shake` S1-html:95）
- 体温计超量程 warn 钳位：S1-ui:529-534
- 控件 id：`#btn-heat`(S1-html:78)、`#btn-ice`(79)、`#btn-pause`(86)、`#power-slider`(57)、`#amb-slider`(50)、`#vol-slider`(64)、`.rack-item`×4(24-27，无独立 id → 事件型不可用，温度计步骤走 R.thermometers 电平)

**最小暴露方案**（唯一代码改动，开发单执行）：S1-core 文件末尾（353 行 pagehide 监听之后）追加：

```js
/* ---- 语音讲解层暴露（docs/c3-guide-design.md §A-1）：state 永远原地 mutate（resetState 58-79 只改字段），
   paused/thermometers 为闭包散变量且会重赋值，用不可枚举只读 getter 聚合，不改任何实验逻辑 ---- */
Object.defineProperties(state, {
  paused: { get(){ return paused; }, enumerable: false },
  thermometers: { get(){ return thermometers; }, enumerable: false }
});
window.C3S1_STATE = state;
```

宿主接线：`window.GUIDE_CFG={state:window.C3S1_STATE,mode:'refract'};window.GUIDE_DATA=window.C3S1_GUIDE;`

### §A.1 steps（7 条，含结论条；全 repeat:true）

探究链：认识温度计（插入→体温计缩口→甩一甩）→ 点火加热 → 加冰看 0℃ 锚点 → 沸腾看 100℃ 锚点 → 结论（摄氏温标规定）。

| id | trigger（核实出处） | say（≤25字） | 知识点（explain.html 对齐） |
|---|---|---|---|
| s1 | `R.thermometers.length>=1`（数组 getter 暴露后；元素构造 S1-ui:312） | 温度计插进水里啦！等示数稳定了再读数哦。 | 使用五要点④「待示数稳定再读」 |
| s2 | `R.thermometers.some(t=>t.type==='clinical'&&!t.inWater)`（inWater 切换 S1-ui:287-295；体温计离水保持 S1-ui:521-523） | 体温计离开水，读数却不降，缩口在起作用。 | 缩口→水银断开退不回→离体读数 |
| s3 | `event:click:#clinical-shake:R.thermometers.some(t=>t.type==='clinical'&&!t.inWater)`（按钮 S1-html:95；shake 前置条件「clinical 且离水」S1-ui:594-596，capture 读到点击前状态=闸门） | 甩一甩，水银退回玻璃泡，读数就复位啦。 | 体温计使用前要用力甩 |
| s4 | `R.heating===true && R.heatPower>0`（setHeating S1-core:329-333；功率绑定 S1-ui:30） | 开始加热啦，水温一点点往上爬，盯紧读数。 | 吸热升温 |
| s5 | `R.iceMass>0 && R.waterTemp<=0.5`（加冰 S1-core:285-288；冰存在水温钳 0 S1-core:106） | 冰水混合物！温度稳稳停在0℃不动。 | 摄氏温标：标准大气压冰水混合物 0℃ |
| s6 | `R.heating && R.waterTemp>=99.5`（沸腾判定 S1-core:307-308，与 core 气泡显示同一条件；100℃ 钳位 S1-core:94-97） | 沸腾啦！气泡涌到水面，温度停在100℃。 | 沸水 100℃；气泡为物理沸腾现象 |
| concl | `after:s6@6000`（【规范】§2.4/§2 结论条） | 因此我们得出结论：标准大气压下，冰水混合物是0℃，沸水是100℃；测温度不能靠感觉，要用温度计。 | 摄氏温度规定 + 凭感觉不可靠（导入实验） |

说明：s5 与 s6 物理互斥（冰在时水温≤0，沸腾需≥99.5），无同帧冲突；s1/s2/s4 分属不同用户动作边沿，引擎每帧只发一条天然错开。concl 挂 s6（沸腾=探究链最后一步）；若学生只走加冰线不加热，无结论条（可接受，重置后再做完整链）。s5 需连加约 5 块冰才到 0℃ 平台（每块 10g 熔化吸热 3340J，200mL 水每块约降 4℃；S1-core:14、99-107），解说线正是为「持续加冰」这个探究行为设计的。s3 为 event 型 step，依赖 §0.5 引擎微补丁。

### §A.2 errors（2 条）

| id | trigger（核实出处） | fix |
|---|---|---|
| e1 | `event:click:#btn-heat:R.heatPower===0 && !R.heating`（capture=点击前：即将开加热且功率为 0；功率滑杆 S1-html:57，按钮 S1-ui:33-37） | 不对哟～功率还是0，先把加热功率调大，再开加热呀。 |
| e2 | `R.paused===true && (R.heating===true \|\| R.iceMass>0)@3000`（paused getter §A-1；物理只在 !paused 步进 S1-core:82-83；@3000 持续判定，引擎:41） | 不对哟～时间还暂停着呢，点「开始」，温度才会动哦。 |

### §A.3 free（3 条，全带 audio+状态闸门）

| trigger（核实出处） | note | 闸门说明 |
|---|---|---|
| `event:input:#power-slider:R.heating===true`（滑杆 S1-html:57，input 绑定 S1-ui:75-84） | 加热功率越大，水温升得越快。 | 未在加热时拖功率不播（【规范】§2.6 同款闸门） |
| `R.iceMass>0 && R.waterTemp>5`（冰熔化吸热 S1-core:99-107） | 冰在吸热熔化，水温一点点往下掉。 | 电平边沿+8s 节流，只在真有冰且水温高于 5℃ 时播 |
| `event:input:#amb-slider:R.simTime>0`（滑杆 S1-html:50，绑定 S1-ui:29） | 环境温度一变，水最后凉到的温度也跟着变。 | 实验未开始（simTime=0）不播 |

---

## §B c3_s2 熔化凝固探究馆（mode key：`melt` / `freeze`，真实模式名）

### §B-1 状态暴露核查（最关键）

状态在 S2-core 闭包：`let state = JSON.parse(JSON.stringify(INITIAL))`（S2-core:70）。⚠️ 两个重赋值风险：①`resetState()` 整体重赋 `state = JSON.parse(...)`（S2-core:95）——grep 确认当前**无任何调用者**（死代码，btn-reset 走的是原地 mutate 的 `resetPhysics()` S2-core:106-125 / S2-ui:57-63），但防将来被接线；②`paused` 是独立闭包散变量且会被重赋值（S2-core:71、S2-ui:52）。→ 统一用 **Proxy 委托暴露**（1 行，零侵入，天然免疫重赋值）。

状态字段速查表（INITIAL 全量 S2-core:57-69；物理更新 S2-core:801-854）：

| 字段 | 类型/取值 | 含义 | 出处 |
|---|---|---|---|
| `R.mode` | 'melt'\|'freeze'，初 melt | 探究阶段；熔→凝自动切换 | S2-core:59；startFreezePhase S2-core:987-993；熄火自动转凝固 S2-core:1002-1004；preMeltComplete S2-core:1030 |
| `R.sample` | 'hypo'\|'paraffin'\|'ice'，初 hypo | 样品 | S2-core:60；SAMPLE_DEFS S2-core:4-21（海波晶体熔点48℃/石蜡非晶体 softStart50 softEnd70/冰晶体熔点0℃）；切换 S2-ui:19-25 |
| `R.fire` | 'low'\|'medium'\|'high' | 火力 80/150/260W | S2-core:60；FIRE_POWER S2-core:23；S2-ui:26 |
| `R.ambTemp` | -10~40 初25 | 环境温度（拖动同步重置样品/水浴温度） | S2-core:60；滑杆 S2-html:73；S2-ui:29-34 |
| `R.amount` | small/medium/large → 0.015/0.030/0.060kg | 样品量 | S2-core:60；AMOUNT_KG S2-core:24 |
| `R.timeScale` | 1/10/60/300 初60 | 时间加速 | S2-core:60；S2-ui:28 |
| `R.sampleTemp` | ℃ 钳位[-15,120] | 样品温度 | S2-core:61；积分 S2-core:827-847 |
| `R.bathTemp` | ℃ ≤100（BATH_MAX_TEMP） | 水浴温度 | S2-core:61、819-824；S2-core:25 |
| `R.meltedFrac` | 0..1 | 熔化份额（晶体相变进度） | S2-core:61；applyHeatCrystal S2-core:716-799 |
| `R.heating` | bool | 酒精灯 | S2-core:62；setHeating S2-core:956-959；按钮 `#btn-lamp` S2-ui:38-45 |
| `R.simTime` | 模拟秒，仅 !paused 累计 | 实验时间 | S2-core:62、801-805 |
| `R.dataLog` | ≤120 条 {t,T,heat,mode} | 每分钟自动记录 | S2-core:63；recordData S2-core:856-864 |
| `R.phaseName` | '固态'\|'固液共存'\|'液态'\|'变软变稀'\|'变稠变硬' | 物态（每帧刷新） | S2-core:64；updatePhaseName S2-core:145-149（调用点 848）；phaseForCrystal S2-core:132-136；phaseForParaffin S2-core:138-143（freeze 时='变稠变硬'） |
| `R.plateauAnnounced` | bool | 熔/凝平台 toast 已发 | S2-core:65；checkPhaseToast S2-core:1076-1100 |
| `R.fullyMeltedAnnounced` | bool | 晶体全熔 | S2-core:66；updatePhaseFlow S2-core:996-1000 |
| `R.paraffinHeatAnnounced` / `R.paraffinFreezeAnnounced` | bool | 石蜡变软/变稠 toast 已发 | S2-core:67-68；S2-core:1089-1095 |
| `R.freezeAnnotationShown` | bool | 海波凝固点=熔点标注已显示 | S2-core:69；S2-ui:177-186（仅 hypo+freeze+0<frac<1） |
| `R.paused`（Proxy 暴露） | bool 初 true | 暂停 | S2-core:71；S2-ui:52；物理门 S2-core:802 |

控件 id（S2-html）：`#btn-lamp`(76)、`#btn-freeze-quick`(77，仅 meltedFrac>=1&&heating 时可见 S2-ui:112-115)、`#btn-pre-melt`(78，直达液态 S2-core:1023-1043)、`#amb-slider`(73)、`#btn-pause`(146)、`#btn-reset`(147)。⚠️ 样品/火力/样品量是 custom-select（S2-html:71-75），点击选项**不派发原生 change**（S2-ui:122-163），event 型 trigger 不可靠 → 一律用 R.sample/R.fire 电平。

**最小暴露方案**：S2-core 文件末尾（pagehide 监听后，1152 行之后）追加：

```js
/* ---- 语音讲解层暴露（docs/c3-guide-design.md §B-1）：Proxy 委托，免疫 resetState(95)/paused(71) 重赋值 ---- */
window.C3S2_STATE = new Proxy({}, { get(_t, k){ if (k === 'paused') return paused; return state ? state[k] : undefined; } });
```

宿主接线：`window.GUIDE_CFG={state:window.C3S2_STATE};window.GUIDE_DATA=window.C3S2_GUIDE;`（mode 由引擎轮询 R.mode 自动切 melt/freeze，引擎:376-377）

### §B.1 steps（melt 4 条 + freeze 5 条，共 9；全 repeat:true）

探究链（melt）：水浴点火 → 熔点平台（固液共存）→ 全熔升温 → 结论；（freeze）：凝固点平台 → 凝固点=熔点 → 石蜡对照 → 结论。melt→freeze 转场由引擎 onModeEnter 自动播 freeze intro（引擎:301-312），正好当阶段开场白。

| id | trigger（核实出处） | say（≤25字） | 知识点 |
|---|---|---|---|
| melt-s1 | `R.heating===true && R.phaseName==='固态'`（setHeating S2-core:956-959；phaseName 每帧 S2-core:848） | 酒精灯点着啦，水浴传热，样品温度慢慢升。 | 水浴加热、吸热升温（explain 探究实验） |
| melt-s2 | `R.phaseName==='固液共存' && R.sample!=='paraffin'`（phaseForCrystal 0<frac<1 S2-core:132-136） | 到熔点啦！晶体边吸热边熔化，温度停住不动。 | 晶体熔化吸热温度不变、固液共存 |
| melt-s3 | `R.fullyMeltedAnnounced===true`（S2-core:996-1000） | 全化成液体啦，温度又开始往上升咯。 | 全熔后液态继续升温 |
| melt-concl | `(R.fullyMeltedAnnounced===true \|\| (R.sample==='paraffin' && R.paraffinHeatAnnounced===true))@6000`（晶体线：全熔旗标 S2-core:996-1000；石蜡线：变软旗标 S2-core:1089-1092；hold 6s=条件持续6秒才播，与【规范】结论条 @6000 同语义且不砍上一条音频） | 因此我们得出结论：晶体熔化要吸热，但有固定熔点，熔化中温度不变；非晶体像石蜡，没有熔点，边熔化边升温。 | explain 晶体/非晶体对比 |
| freeze-s1 | `R.mode==='freeze' && R.phaseName==='固液共存' && R.sample!=='paraffin'`（凝固中 frac 递减 S2-core:769-795；phaseName S2-core:132-136） | 到凝固点啦！边放热边凝固，温度也不变。 | 晶体凝固放热温度不变 |
| freeze-s2 | `after:freeze-s1@6000`（与 freeze-s1 同状态，链式错开防同帧抢话，引擎:204/207） | 同一种晶体，凝固点和熔点相同，都是那个温度。 | 凝固点=熔点（explain 核心概念） |
| freeze-s3 | `R.sample==='paraffin' && R.mode==='freeze' && R.phaseName==='变稠变硬'`（phaseForParaffin freeze 分支 S2-core:141） | 石蜡没有凝固点，边放热边变稠，温度一直降。 | 非晶体无凝固点 |
| freeze-concl | `after:freeze-s2@6000` | 因此我们得出结论：晶体凝固要放热，有固定凝固点，凝固中温度不变，凝固点和熔点相同。 | 晶体凝固结论 |
| freeze-concl-b | `after:freeze-s3@6000` | 因此我们得出结论：非晶体凝固没有固定温度，边放热边变稠变硬，温度持续下降。 | 非晶体凝固结论（石蜡线专属，与 freeze-concl 互斥） |

熔化线：晶体（hypo/ice）走 melt-s1→s2→s3→s4；石蜡走 melt-s1→s4（s2/s3 有晶体闸门不触发，s4 的 hold 表达式双路覆盖）。凝固线：晶体走 freeze-s5→s6→s8；石蜡走 s7→s9。石蜡熔化无自动凝固（meltedFrac 恒 0，updatePhaseFlow S2-core:1002 不触发），需点「直接跳到液态」（preMeltComplete S2-core:1023-1043）进入 freeze 线——intro-freeze 会在 onModeEnter 自动播。各链由 sample/mode 闸门天然互斥，不同帧冲突。

### §B.2 errors（2 条）

| id | trigger（核实出处） | fix |
|---|---|---|
| melt-e1 | `R.paused===true && R.heating===true`@3000（paused 散变量 Proxy 暴露 §B-1；物理门 S2-core:802；@3000 持续判定 tickErrors 支持 holdMs 引擎:218-227） | 不对哟～还暂停着呢，点「开始」实验才会跑哦。 |
| melt-e2 | `R.heating===false && R.simTime>0 && R.meltedFrac<=0 && R.sampleTemp<=R.ambTemp+1`@5000（熄火后样品回落到环境温度：散热项 S2-core:829-831） | 灯灭啦，样品到不了熔点哟～重新点燃酒精灯吧。 |

### §B.3 free（3 条，全带 audio+闸门）

| 所在模式 | trigger（核实出处） | note | 闸门说明 |
|---|---|---|---|
| melt | `event:input:#amb-slider:R.mode==='melt'`（滑杆 S2-html:73，input 绑定 S2-ui:94-100） | 环境温度一变，散热快慢跟着变，升温节奏不同啦。 | 仅 melt 模式播 |
| melt | `R.sample==='paraffin' && R.paraffinHeatAnnounced===true`（旗标置位 S2-core:1089-1092） | 石蜡没有熔点，边吸热边变软变稀，温度一直升。 | 电平边沿，只在石蜡越过 softStart=50℃ 后播一次/8s |
| freeze | `R.freezeAnnotationShown===true`（S2-ui:177-186，仅海波） | 看标注：海波凝固点48℃，跟熔点一模一样。 | 边沿触发，与 core 标注同条件同帧出现 |

---

## §C c3_s3 汽化液化探究馆（mode key：`boil` / `evap` / `liquefy`，真实模式名）

html 实际加载全部 8 个脚本（S3-html:153-160）：physics→audio→core→chart→ui→liquefy-core→liquefy-ui；液化不是独立 state，是**同一个 state 的 mode='liquefy' + state.liquefy 子对象**（S3-lq:560-564）。

### §C-1 状态暴露核查（最关键）

⚠️ S3 的 `let state;`（S3-core:17）在 **DOMContentLoaded→init() 才赋值**（S3-ui:5、308），且 `resetAll()`（S3-ui:85）、`resetPhysicsCore()`（S3-core:59）都会**整体重赋值** → 直接 `window.C3S3_STATE=state` 会捕获 undefined 或在重置后失效。**必须用 Proxy 委托**（get 时实时解引用闭包绑定，三个赋值点全覆盖；引擎在脚本求值期捕获 Proxy 对象本身，引用永久稳定）。paused 在 state 内（S3-phys:53），无需额外 getter。

状态字段速查表（makeInitialState 全量 S3-phys:45-64）：

| 字段 | 类型/取值 | 含义 | 出处 |
|---|---|---|---|
| `R.mode` | 'boil'\|'evap'\|'liquefy'，初 boil | 顶部三 tab | S3-phys:47；switchMode S3-ui:179-210；tab S3-html:17-19 |
| `R.fire` | low/medium/high → 120/150/240W | 火力 | S3-phys:5、47；S3-ui:29 |
| `R.ambTemp` | 10~40 初25（拖动同步 waterTemp！） | 环境温度 | S3-phys:47；S3-html:29；S3-ui:33 |
| `R.amount` | small/medium/large → 0.10/0.20/0.30kg | 水量 | S3-phys:6、47；S3-ui:30 |
| `R.timeScale` | 初 10 | 时间加速 | S3-phys:47；S3-html:41 |
| `R.waterTemp` | ℃ | 水温（沸腾钳到沸点） | S3-phys:48；钳位 S3-phys:101-104、113-115 |
| `R.heating` | bool | 酒精灯（boil 与 liquefy 共用） | S3-phys:48；toggleLamp S3-ui:71-79；液化灯按钮 S3-lqui:39-54 |
| `R.boiling` | bool（T≥BP-0.05 且加热） | 沸腾中 | S3-phys:48、101-104 |
| `R.lid` | 'vent'\|'sealed' | 杯盖；沸点 vent=100℃ / sealed=102.5℃（模拟值） | S3-phys:9、49；boilingPoint S3-phys:11；switchLid S3-phys:123-130；UI+toast S3-ui:32 |
| `R.soundLevel` | 0..1 四阶段（<60 无声→60~85 最吵→85~100 渐小→沸腾 0.12） | 沸腾声音 | S3-phys:53；soundLevel() S3-phys:20-27；赋值 S3-phys:118 |
| `R.bubbleRegime` | 'none'\|'collapse'\|'boil'（<50 无；50~沸点前收缩；沸腾变大） | 气泡形态（物理气泡） | S3-phys:53；bubbleRegime() S3-phys:29-34；赋值 S3-phys:119 |
| `R.firstHeatT` | null/模拟秒 | 点火时刻（点火前不计时不画线） | S3-phys:49、91 |
| `R.recordStop` | bool（沸腾后 4.5min 置真） | 触发实验结论 toast | S3-phys:49、86；S3-core:394-398 |
| `R.paused` | bool 初 false（进页即运行） | 暂停 | S3-phys:53；S3-ui:37；物理门 S3-phys:90 |
| `R.simTime` | 模拟秒 | 实验时间 | S3-phys:48 |
| `R.evapSub` | 'factors'\|'cooling'\|'paper' | 蒸发三子台 | S3-phys:54；switchEvapSub S3-ui:263-274；子 tab S3-html:58-60 |
| `R.evap.factors.temp` | 10~60 初35 | 实验组液温 | S3-phys:56；滑杆 S3-html:64；S3-ui:214 |
| `R.evap.factors.area` | 0.3~2.0 初1.5 | 表面积 | S3-phys:56；S3-html:65；S3-ui:215 |
| `R.evap.factors.wind` | 0~5 初2.0 | 空气流速 | S3-phys:56；S3-html:66；S3-ui:216 |
| `R.evap.factors.volumes[2]` | 1→0（左对照/右实验） | 液滴剩余 | S3-phys:56；衰减 S3-phys:150-154 |
| `R.evap.factors.fastShown` / `slowShown` | bool | 右快/左快已判定 | S3-phys:56；置位 S3-phys:157-158 |
| `R.evap.cooling.alcohol[2]` | 0..100，每点「涂酒精」+20 | 酒精量 | S3-phys:57；按钮 `.evap-coat-btn`×2（class 非 id）S3-html:140-141；S3-ui:224-227 |
| `R.evap.cooling.withTemp/withoutTemp` | ℃ | 涂/不涂酒精温度计示数 | S3-phys:57；降温积分 S3-phys:161-180 |
| `R.evap.cooling.conclusionShown` | bool（withTemp<baseT-2 且 alcohol[0]>0） | 致冷结论 | S3-phys:183 |
| `R.evap.paper.lit` | bool | 已点火（按钮或 canvas 火柴） | S3-phys:58；S3-ui:231-235；canvas S3-core:797-806 |
| `R.evap.paper.water` | 0..1（filling 注水中） | 纸锅水量 | S3-phys:58；S3-ui:238-241；S3-phys:196-199 |
| `R.evap.paper.boiling` | bool（水温≥100） | 纸锅水沸腾 | S3-phys:210-218 |
| `R.evap.paper.burning` | bool（无水空烧到 183℃着火点） | 纸锅烧着 | S3-phys:222-225（着火点 183 与 explain 纸锅例题一致） |
| `R.evap.paper.conclusionShown` | bool | 纸锅结论 | S3-phys:237 |
| `R.liquefy.waterTemp` | ℃ | 液化台水温 | S3-lq:560-562（ensureLiquefyState S3-lqui:7-11 于 init 创建 S3-ui:13） |
| `R.liquefy.steamState` | '无'\|'少量水蒸气'\|'大量水蒸气'\|'沸腾·大量水蒸气'（T>70 大量） | 蒸气状态 | S3-lq:563 |
| `R.liquefy.collectedPct` | 0..100（480 滴=100%） | 收集水量 | S3-lq:29、541、564 |

**最小暴露方案**：S3-core 文件末尾（pagehide 监听后，1133 行之后）追加：

```js
/* ---- 语音讲解层暴露（docs/c3-guide-design.md §C-1）：state 惰性赋值(S3-ui:5)且会整体重赋值(S3-ui:85/S3-core:59)，
   必须 Proxy 委托实时解引用闭包绑定；引擎加载期捕获的是 Proxy 本身，引用永久稳定 ---- */
window.C3S3_STATE = new Proxy({}, { get(_t, k){ return state ? state[k] : undefined; } });
```

宿主接线：`window.GUIDE_CFG={state:window.C3S3_STATE};window.GUIDE_DATA=window.C3S3_GUIDE;`
⚠️ trigger 引用 `R.liquefy.*` 一律带 `R.liquefy &&` 前置守卫（理论上 init 早于引擎 tick，防御 bfcache/异常路径）。

### §C.1 steps（boil 7 条 + evap 9 条 + liquefy 5 条；全 repeat:true）

**boil 沸腾探究**（点火加热→气泡变化→声音四阶段→沸腾平台→结论；「气泡」是物理沸腾气泡，与 UI 无关，正常讲）：

| id | trigger（核实出处） | say（≤25字） | 知识点 |
|---|---|---|---|
| boil-s1 | `R.heating===true && !R.boiling && R.waterTemp<60`（toggleLamp S3-ui:71-79） | 点火啦！水开始吸热升温，盯紧温度计。 | 吸热升温 |
| boil-s2 | `R.bubbleRegime==='collapse'`（S3-phys:29-34、119；50℃起） | 杯底冒出小气泡，上升遇冷又变小消失了。 | explain：沸腾前气泡上升途中变小消失 |
| boil-s3 | `R.heating && !R.boiling && R.waterTemp>=60 && R.waterTemp<85`（声音峰值段 S3-phys:20-27；core toast「响水不开」S3-core:381-384） | 响水不开！气泡破裂最吵的时候，还没沸腾。 | 响水不开 |
| boil-s4 | `R.heating && !R.boiling && R.waterTemp>=85`（S3-phys:25-26；toast S3-core:385-388） | 开水不响～声音反而变小，马上就要沸腾啦。 | 开水不响 |
| boil-s5 | `R.boiling===true`（S3-phys:101-104；气泡变大到水面破裂 S3-phys:29-34 'boil'） | 沸腾啦！气泡上升越变越大，到水面破裂。 | explain：沸腾时气泡越变越大到水面破裂 |
| boil-s6 | `after:boil-s5@6000` | 继续吸热，温度却停在沸点不变，看曲线平了！ | explain：沸腾虽继续吸热温度保持不变 |
| boil-concl | `after:boil-s6@6000` | 因此我们得出结论：水沸腾前温度不断升高；沸腾后继续吸热，温度保持在沸点不变。 | core 结论 toast 同口径 S3-core:394-398 |

**evap 蒸发探究**（三因素→致冷→纸锅；子台切换 evapSub 闸门）：

| id | trigger（核实出处） | say（≤25字） | 知识点 |
|---|---|---|---|
| evap-s1 | `R.evapSub==='factors' && R.evap.factors.temp>35`（滑杆 S3-ui:214，初值35 S3-html:64） | 液体温度调高了，蒸发一下子变快啦。 | 因素①温度越高蒸发越快 |
| evap-s2 | `R.evapSub==='factors' && R.evap.factors.area>1.5`（S3-ui:215，初值1.5 S3-html:65） | 表面积摊大了，蒸发更快，衣服摊开干得快。 | 因素②表面积 |
| evap-s3 | `R.evapSub==='factors' && R.evap.factors.wind>2`（S3-ui:216，初值2.0 S3-html:66） | 空气流速加快，蒸发更快，有风天干得快。 | 因素③空气流动 |
| evap-s4 | `R.evapSub==='factors' && R.evap.factors.slowShown===true`（S3-phys:158；需学生把右组因素调低才成立——fastShown 默认参数下会自发成立，不能当步骤，该观察挪入 free 类 §C.3） | 咦，这回对照组反而快！三个因素被你调低了。 | 三因素反向验证 |
| evap-s5 | `R.evapSub==='cooling' && R.evap.cooling.alcohol[0]>0`（涂酒精 S3-ui:224-227） | 酒精涂上啦，它要开始蒸发，温度计有好戏看。 | 蒸发对象就位 |
| evap-s6 | `R.evap.cooling.conclusionShown===true`（S3-phys:183；core toast S3-ui:284-287） | 涂酒精的示数更低！蒸发吸热，有致冷作用。 | explain：蒸发吸热致冷 |
| evap-s7 | `R.evapSub==='paper' && R.evap.paper.lit && R.evap.paper.water>0 && !R.evap.paper.boiling && !R.evap.paper.burning`（lit S3-ui:231-235；water S3-ui:238-241） | 火苗舔着纸锅，水在升温，纸却烧不着！ | 纸锅烧水过程 |
| evap-s8 | `R.evap.paper.boiling===true`（S3-phys:210-218；纸温=水温+10 钳182.99 S3-phys:219） | 纸锅里的水沸腾啦！水温压住纸温，到不了着火点。 | explain 例题：水把纸温压在沸点，远低于着火点约183℃ |
| evap-concl | `after:evap-s8@6000` | 因此我们得出结论：蒸发在任何温度下都能发生；温度越高、表面积越大、空气流动越快，蒸发越快；蒸发吸热，有致冷作用。 | explain 蒸发三因素+致冷 |

**liquefy 液化探究**（点灯汽化→蒸气遇冷→液化水珠→收集→结论）：

| id | trigger（核实出处） | say（≤25字） | 知识点 |
|---|---|---|---|
| lq-s1 | `R.heating===true && !R.boiling`（液化灯按钮同写 state.heating S3-lqui:39-54） | 点灯加热，水吸热汽化，变成看不见的水蒸气。 | 汽化 |
| lq-s2 | `R.heating===true && R.waterTemp>=70`（steamState '大量水蒸气' 阈值 T>70 S3-lq:563） | 水蒸气升上去，碰到上方冰冷的玻璃片啦。 | 蒸气上升遇冷 |
| lq-s3 | `R.liquefy && R.liquefy.collectedPct>0`（冷凝概率 S3-lq:477-483；收集计数 S3-lq:541、564） | 看！蒸气遇冷液化成小水珠，挂在玻璃片上。 | explain：水蒸气遇冷液化成小水滴 |
| lq-s4 | `R.liquefy && R.liquefy.collectedPct>=50`（S3-lq:564） | 水珠越聚越大，顺着玻璃片流下来收集啦。 | 液化聚集 |
| lq-concl | `after:lq-s4@6000` | 因此我们得出结论：气态的水蒸气遇冷放热，液化成小水珠，降低温度是液化的途径之一，液化还要放热。 | explain：途径一降温；液化放热 |

### §C.2 errors（boil 1 + evap 2 + liquefy 2，共 5 条；熄灯降温是正常现象非错误，归 boil-f3 中性描述，「沸腾须持续吸热」由 boil-s6/s7 步骤链讲透）

| 模式 | id | trigger（核实出处） | fix |
|---|---|---|---|
| boil | boil-e1 | `R.paused===true && R.heating===true`@3000（paused S3-phys:53；物理门 S3-phys:90） | 不对哟～时间暂停着呢，点「开始」水温才会升哦。 |
| evap | evap-e1 | `event:click:#paper-match-btn:R.evap.paper.water===0 && !R.evap.paper.lit`（capture=点击前；按钮 S3-html:75、S3-ui:231-235；无水点火→空烧 burning S3-phys:222-225） | 不对哟～纸锅还没加水呢，空烧马上就着火啦。 |
| evap | evap-e2 | `R.evap.paper.burning===true`（S3-phys:222-225，着火点 183℃） | 哎呀烧着啦！没水吸热，纸温冲到183℃着火点。 |
| liquefy | lq-e1 | `event:click:#lq-lamp-btn:R.paused===true`（按钮 S3-html:83；capture=点击前 paused） | 不对哟～时间暂停着呢，点「开始」再点灯呀。 |
| liquefy | lq-e2 | `R.heating===false && R.waterTemp<=R.ambTemp+2 && (!R.liquefy \|\| R.liquefy.collectedPct===0)`@8000（液化模式下冷态闲置引导） | 还没产生水蒸气哟～先点燃酒精灯把水烧热。 |

### §C.3 free（boil 3 + evap 3 + liquefy 2，共 8 条；全带 audio+闸门）

| 模式 | trigger（核实出处） | note | 闸门说明 |
|---|---|---|---|
| boil | `event:input:#amb-slider:R.heating===true`（滑杆 S3-html:29；拖动会同步 waterTemp S3-ui:33，文案如实描述） | 环境温度一拖，水温也跟着跳，重新加热看看。 | 加热中才播 |
| boil | `R.lid==='sealed' && R.heating && !R.boiling`（switchLid S3-phys:123-130；102.5℃ 口径同 core toast S3-ui:32） | 密封盖压住蒸气，气压升高，要到102.5℃才沸。 | 边沿：换盖瞬间播 |
| boil | `R.heating===false && R.waterTemp<95 && R.waterTemp>R.ambTemp+3`（自然冷却钳 ambTemp S3-phys:113-115；<95 上限避开沸腾余温段瞬态） | 灯熄了，水慢慢凉下来，向环境温度靠过去。 | 熄灯降温的中性描述（§C.2 注） |
| evap | `R.evapSub==='factors' && R.evap.factors.fastShown===true && R.evap.factors.volumes[1]<0.7`（fastShown S3-phys:157；volumes<0.7 闸门=默认参数下约 25s 后才成立，避开与 evap intro（约15s）抢话） | 右边液滴干得快，温度高表面积大，占了优势。 | 自发成立的观察放 free 不放 steps |
| evap | `R.evapSub==='cooling' && R.evap.cooling.alcohol[0]<=0`（涂酒精按钮 class 选择器不可靠（S3-html:140-141 无 id、引擎 querySelector 只绑首个），改电平引导） | 点温度计下面的「涂酒精」，对比才看得出来了。 | 进 cooling 子台未涂酒精时播一次 |
| evap | `event:click:#paper-water-btn:!R.evap.paper.lit`（按钮仅 !lit&&water===0 可见 S3-ui:165；capture 闸门） | 水加好啦，纸锅贴着水，温度就被水压住了。 | 未点火才播 |
| liquefy | `R.liquefy && R.liquefy.collectedPct>=100`（min(100,…) S3-lq:564） | 收集满啦！这些水全是水蒸气液化变回来的。 | 边沿一次 |
| liquefy | `R.heating===false && R.liquefy && R.liquefy.collectedPct>0 && R.liquefy.collectedPct<100` | 灯熄了，水蒸气断了源，液化慢慢停下来。 | 与上条互斥 |

---

## §D c3_s4 升华凝华观察站（mode key：`refract`）

### §D-1 状态暴露核查（最关键）

⚠️ S4 的 `let state;`（S4-core:19）**DOMContentLoaded→init() 才赋值**（S4-ui:5、189）——引擎在脚本求值期捕获引用（引擎:12），直接暴露必捕获 undefined。**必须 Proxy 委托**。resetScene 只逐字段 mutate（S4-core:333-344）✓。state.mode 恒 'iodine'（单 tab S4-html:91），guide mode key 用统一约定 `refract`，由 GUIDE_CFG.mode 强制（引擎:376 GUIDE_CFG.mode 优先于 R.mode）。

状态字段速查表（makeInitialState 全量 S4-core:36-56）：

| 字段 | 类型/取值 | 含义 | 出处 |
|---|---|---|---|
| `R.mode` | 恒 'iodine' | 单场景 | S4-core:38；switchMode 预留 S4-ui:100-109 |
| `R.hotTemp` | 60\|80\|100 初80 | 热水温度→升华速率 0.28/0.5/0.78 | S4-core:39；HOT_PROFILE S4-core:13-17；原生 select S4-html:98-102 + change S4-ui:32-35 |
| `R.coldTemp` | 20 | 冷水温度（常量，未接 UI） | S4-core:40 |
| `R.iodineAmount` | small/medium/large → 颗粒数 40/80/140 | 碘量 | S4-core:12、41-42；select S4-html:106-110 + S4-ui:36-41 |
| `R.phase` | 'idle'\|'sublimate'\|'deposit' | 相变阶段；浇淋动画结束时切换 | S4-core:43；startSublimate S4-core:321-325 / startDeposit 327-331；触发点 triggerPhysics S4-pour:928-931（finishPour 链路 S4-pour:666-668） |
| `R.vapor` | 0..1 | 碘蒸气充满度（sublimate 增/deposit 减） | S4-core:44、312-313、316 |
| `R.iodineLeft` | 1..0.2 | 底部固态碘剩余 | S4-core:45、314 |
| `R.wallCrystal` | 0..1 | 器壁凝华结晶 | S4-core:46、317 |
| `R.paused` | bool 初 false | 暂停（物理门） | S4-core:47、309；按钮 S4-ui:73-76 |
| `R.sublimAnnounced` | bool（vapor>0.35 置真，弹「升华」定义卡） | 升华讲解已触发 | S4-core:50；S4-ui:121-124；定义卡 S4-ui:131-146 |
| `R.depositAnnounced` | bool（wallCrystal>0.25 置真，弹「凝华」卡） | 凝华讲解已触发 | S4-core:51；S4-ui:125-128 |
| `R.guessDone` | bool | 猜测卡已确认 | S4-core:53；#guess-reveal S4-ui:67-70；卡片 S4-html:141-161 |
| `window.SublimationPour.state`（=POUR，已暴露） | `.animPhase` 'idle'\|'lift'\|'pour'\|'return'\|'fade'；`.animType` 'hot'\|'cold'；`.isDragging` | 浇淋动画机（trigger 可直接引用 window 全局——表达式经 new Function 求值，可访问全局作用域，引擎:44） | 暴露点 S4-pour:1348-1350；POUR 字段 S4-pour:19-49；相位流转 S4-pour:624-668；playPour 入口 S4-pour:580-597 |

控件 id（S4-html）：`#btn-hot`(113)、`#btn-cold`(114)、`#hot-select`(98)、`#iodine-select`(106)、`#guess-reveal`(158)、`#btn-pause`(130)、`#btn-reset`(131)。

**最小暴露方案**：S4-core 文件末尾（pagehide 监听后，397 行之后）追加：

```js
/* ---- 语音讲解层暴露（docs/c3-guide-design.md §D-1）：state 在 DOMContentLoaded→init 才赋值(S4-ui:5)，
   引擎脚本求值期即捕获引用(engine-core.js:12)，必须 Proxy 委托实时解引用 ---- */
window.C3S4_STATE = new Proxy({}, { get(_t, k){ return state ? state[k] : undefined; } });
```

宿主接线：`window.GUIDE_CFG={state:window.C3S4_STATE,mode:'refract'};window.GUIDE_DATA=window.C3S4_GUIDE;`

### §D.1 steps（7 条，含结论条；全 repeat:true）

探究链：猜一猜 → 浇热水升华 → 紫色蒸气（升华定义）→ 浇冷水凝华 → 器壁结晶（凝华定义）→ 全程无液态 → 结论。

| id | trigger（核实出处） | say（≤25字） | 知识点 |
|---|---|---|---|
| s1 | `R.guessDone===true`（#guess-reveal S4-ui:67-70；直接点浇淋不置真 S4-ui:45-46，跳过不阻塞后续链） | 猜好啦？那就点「浇热水」，看碘怎么变身。 | 预测先行（POE） |
| s2 | `R.phase==='sublimate' && R.vapor<0.35`（startSublimate S4-core:321-325，浇淋动画尾部触发 S4-pour:928-930） | 热水一浇，碘直接冒出紫色蒸气，没化成液体！ | explain：固态碘不经液态直接冒碘蒸气 |
| s3 | `R.sublimAnnounced===true`（vapor>0.35 S4-ui:121-124，同帧弹「升华」定义卡） | 这就是升华：固态直接变气态，还要吸热。 | 升华定义+吸热 |
| s4 | `R.phase==='deposit' && R.wallCrystal<0.25`（startDeposit S4-core:327-331） | 浇冷水啦，紫色蒸气变淡，要变回固态了。 | 凝华开始 |
| s5 | `R.depositAnnounced===true`（wallCrystal>0.25 S4-ui:125-128，同帧弹「凝华」卡） | 器壁挂上亮晶晶的碘晶体，这叫凝华，放热。 | explain：碘蒸气不经液态直接在器壁变回固态碘；凝华放热 |
| s6 | `R.phase==='deposit' && R.vapor<=0.05 && R.wallCrystal>0.25`（vapor 递减到 0 S4-core:316） | 蒸气散尽啦，全程固态气态互变，没有液态。 | explain：注意「直接」——中间不经过液态 |
| concl | `after:s6@6000` | 因此我们得出结论：固态直接变气态叫升华要吸热，气态直接变固态叫凝华要放热，中间都不经过液态。 | 升华/凝华定义+吸放热 |

### §D.2 errors（2 条）

| id | trigger（核实出处） | fix |
|---|---|---|
| e1 | `event:click:#btn-cold:R.vapor<=0 && R.phase!=='sublimate'`（capture=点击前；无蒸气时浇冷水 startDeposit 无物可凝 S4-core:315-318） | 不对哟～还没有碘蒸气呢，先点「浇热水」吧。 |
| e2 | `R.paused===true && R.phase!=='idle'`@2000（paused 物理门 S4-core:309；按钮文案 paused 时=「开始」S4-ui:13、73-76） | 不对哟～时间暂停了，点「开始」变化才继续哦。 |

### §D.3 free（3 条，全带 audio+闸门）

| trigger（核实出处） | note | 闸门说明 |
|---|---|---|
| `event:change:#hot-select`（原生 select+change S4-ui:32-35；速率差 HOT_PROFILE S4-core:13-17） | 热水越热，升华越快，紫色蒸气冒得越猛。 | 事件型，即改即讲 |
| `window.SublimationPour.state.animPhase==='pour' && window.SublimationPour.state.animType==='hot'`（POUR 相位 S4-pour:21、647-652；animType S4-pour:583；边沿=起浇瞬间，8s 节流） | 热水正浇在容器上，热量传进去，碘要升华咯。 | 电平边沿，一次浇淋播一次 |
| `event:change:#iodine-select`（S4-ui:36-41） | 碘颗粒的量变啦，越多蒸气越浓越壮观。 | 事件型 |

---

## §4 音频 clip 清单表（四实验一张大表，共 79 条）

命名=clip id（【规范】§4.3 三处同名：文件名/audios 映射/本表）；文件存各实验 `guide/audio/<clipid>.mp3`。文本=§1~§3 的 say/fix/note/intro 同一套（屏幕文案保持原样）；预估秒数按中文 TTS ≈4字/秒+0.5s 尾静音向上取整 0.5s（落地轮一律 afinfo 实测回填，【规范】§4.4）。音色统一 `zh-CN-XiaoxiaoNeural`（【规范】§4.1，跨章节不换）。

TTS 发音预处理（**只进 mp3，屏幕文案与本表文本保持原样**，【规范】§4.2）：`0℃`→零摄氏度、`100℃`→一百摄氏度、`48℃`→四十八摄氏度、`183℃`→一百八十三摄氏度、`102.5℃`→一百零二点五摄氏度、`～`→逗号停顿、`——`→逗号停顿、剥「」引号标记。即：本表文本=§5 guide-data 的 say/fix/note/intro.text 逐字同源，TTS 批处理轮才做替换。

| clip id | 文本 | 预估秒数 |
|---|---|---|
| c3s1-intro | 欢迎来到温度实验室！凭感觉判冷热不可靠，要用温度计。插上温度计读读数，加热看升温，加冰看看0℃，烧开看看100℃，把摄氏温标定下来吧！ | 12.0s |
| c3s1-s1 | 温度计插进水里啦！等示数稳定了再读数哦。 | 5.0s |
| c3s1-s2 | 体温计离开水，读数却不降，缩口在起作用。 | 5.0s |
| c3s1-s3 | 甩一甩，水银退回玻璃泡，读数就复位啦。 | 4.5s |
| c3s1-s4 | 开始加热啦，水温一点点往上爬，盯紧读数。 | 5.0s |
| c3s1-s5 | 冰水混合物！温度稳稳停在0℃不动。 | 5.0s |
| c3s1-s6 | 沸腾啦！气泡涌到水面，温度停在100℃。 | 5.5s |
| c3s1-s7 | 因此我们得出结论：标准大气压下，冰水混合物是0℃，沸水是100℃；测温度不能靠感觉，要用温度计。 | 10.5s |
| c3s1-e1 | 不对哟～功率还是0，先把加热功率调大，再开加热呀。 | 6.0s |
| c3s1-e2 | 不对哟～时间还暂停着呢，点「开始」，温度才会动哦。 | 5.5s |
| c3s1-f1 | 加热功率越大，水温升得越快。 | 4.0s |
| c3s1-f2 | 冰在吸热熔化，水温一点点往下掉。 | 4.5s |
| c3s1-f3 | 环境温度一变，水最后凉到的温度也跟着变。 | 5.0s |
| c3s2-intro-melt | 欢迎来到熔化凝固探究馆！海波和石蜡要在水浴里加热，看晶体怎么熔化、非晶体怎么变软。点燃酒精灯，开始记温度吧！ | 11.5s |
| c3s2-intro-freeze | 灯熄啦，进入凝固阶段！晶体凝固时温度也会保持不变吗？石蜡呢？盯紧温度计。 | 9.0s |
| c3s2-s1 | 酒精灯点着啦，水浴传热，样品温度慢慢升。 | 5.0s |
| c3s2-s2 | 到熔点啦！晶体边吸热边熔化，温度停住不动。 | 5.5s |
| c3s2-s3 | 全化成液体啦，温度又开始往上升咯。 | 4.5s |
| c3s2-s4 | 因此我们得出结论：晶体熔化要吸热，但有固定熔点，熔化中温度不变；非晶体像石蜡，没有熔点，边熔化边升温。 | 11.0s |
| c3s2-s5 | 到凝固点啦！边放热边凝固，温度也不变。 | 5.0s |
| c3s2-s6 | 同一种晶体，凝固点和熔点相同，都是那个温度。 | 5.5s |
| c3s2-s7 | 石蜡没有凝固点，边放热边变稠，温度一直降。 | 5.5s |
| c3s2-s8 | 因此我们得出结论：晶体凝固要放热，有固定凝固点，凝固中温度不变，凝固点和熔点相同。 | 10.0s |
| c3s2-s9 | 因此我们得出结论：非晶体凝固没有固定温度，边放热边变稠变硬，温度持续下降。 | 9.5s |
| c3s2-e1 | 不对哟～还暂停着呢，点「开始」实验才会跑哦。 | 5.0s |
| c3s2-e2 | 灯灭啦，样品到不了熔点哟～重新点燃酒精灯吧。 | 5.5s |
| c3s2-f1 | 环境温度一变，散热快慢跟着变，升温节奏不同啦。 | 5.5s |
| c3s2-f2 | 石蜡没有熔点，边吸热边变软变稀，温度一直升。 | 5.5s |
| c3s2-f3 | 看标注：海波凝固点48℃，跟熔点一模一样。 | 5.5s |
| c3s3-intro-boil | 欢迎来到汽化液化探究馆！先烧水：沸腾前的气泡和沸腾时有什么不同？水烧开后温度还升吗？点燃酒精灯找答案。 | 11.0s |
| c3s3-intro-evap | 沸腾要到沸点才发生，蒸发却任何温度都在进行。这里有三个小台子：拖滑杆比蒸发快慢，涂酒精感受蒸发致冷，还能纸锅烧水！切子标签玩起来。 | 12.5s |
| c3s3-intro-liquefy | 水蒸气看不见，怎么把它变回水？加热水产生蒸气，让它上升遇到冷玻璃片，看它液化成水珠，一点点收集起来。点燃酒精灯开始吧。 | 11.5s |
| c3s3-s1 | 点火啦！水开始吸热升温，盯紧温度计。 | 4.5s |
| c3s3-s2 | 杯底冒出小气泡，上升遇冷又变小消失了。 | 5.0s |
| c3s3-s3 | 响水不开！气泡破裂最吵的时候，还没沸腾。 | 5.0s |
| c3s3-s4 | 开水不响～声音反而变小，马上就要沸腾啦。 | 5.0s |
| c3s3-s5 | 沸腾啦！气泡上升越变越大，到水面破裂。 | 5.0s |
| c3s3-s6 | 继续吸热，温度却停在沸点不变，看曲线平了！ | 5.5s |
| c3s3-s7 | 因此我们得出结论：水沸腾前温度不断升高；沸腾后继续吸热，温度保持在沸点不变。 | 9.5s |
| c3s3-s8 | 液体温度调高了，蒸发一下子变快啦。 | 4.5s |
| c3s3-s9 | 表面积摊大了，蒸发更快，衣服摊开干得快。 | 5.0s |
| c3s3-s10 | 空气流速加快，蒸发更快，有风天干得快。 | 5.0s |
| c3s3-s11 | 咦，这回对照组反而快！三个因素被你调低了。 | 5.5s |
| c3s3-s12 | 酒精涂上啦，它要开始蒸发，温度计有好戏看。 | 5.5s |
| c3s3-s13 | 涂酒精的示数更低！蒸发吸热，有致冷作用。 | 5.0s |
| c3s3-s14 | 火苗舔着纸锅，水在升温，纸却烧不着！ | 5.0s |
| c3s3-s15 | 纸锅里的水沸腾啦！水温压住纸温，到不了着火点。 | 5.5s |
| c3s3-s16 | 因此我们得出结论：蒸发在任何温度下都能发生；温度越高、表面积越大、空气流动越快，蒸发越快；蒸发吸热，有致冷作用。 | 12.0s |
| c3s3-s17 | 点灯加热，水吸热汽化，变成看不见的水蒸气。 | 5.5s |
| c3s3-s18 | 水蒸气升上去，碰到上方冰冷的玻璃片啦。 | 5.0s |
| c3s3-s19 | 看！蒸气遇冷液化成小水珠，挂在玻璃片上。 | 5.0s |
| c3s3-s20 | 水珠越聚越大，顺着玻璃片流下来收集啦。 | 5.0s |
| c3s3-s21 | 因此我们得出结论：气态的水蒸气遇冷放热，液化成小水珠，降低温度是液化的途径之一，液化还要放热。 | 10.5s |
| c3s3-e1 | 不对哟～时间暂停着呢，点「开始」水温才会升哦。 | 5.5s |
| c3s3-e2 | 不对哟～纸锅还没加水呢，空烧马上就着火啦。 | 5.5s |
| c3s3-e3 | 哎呀烧着啦！没水吸热，纸温冲到183℃着火点。 | 6.5s |
| c3s3-e4 | 不对哟～时间暂停着呢，点「开始」再点灯呀。 | 5.0s |
| c3s3-e5 | 还没产生水蒸气哟～先点燃酒精灯把水烧热。 | 5.5s |
| c3s3-f1 | 环境温度一拖，水温也跟着跳，重新加热看看。 | 5.5s |
| c3s3-f2 | 密封盖压住蒸气，气压升高，要到102.5℃才沸。 | 6.5s |
| c3s3-f3 | 灯熄了，水慢慢凉下来，向环境温度靠过去。 | 5.0s |
| c3s3-f4 | 右边液滴干得快，温度高表面积大，占了优势。 | 5.5s |
| c3s3-f5 | 点温度计下面的「涂酒精」，对比才看得出来了。 | 5.0s |
| c3s3-f6 | 水加好啦，纸锅贴着水，温度就被水压住了。 | 5.0s |
| c3s3-f7 | 收集满啦！这些水全是水蒸气液化变回来的。 | 5.0s |
| c3s3-f8 | 灯熄了，水蒸气断了源，液化慢慢停下来。 | 5.0s |
| c3s4-intro | 欢迎来到升华凝华观察站！封闭容器里有少量碘颗粒，浇热水直接冒紫色蒸气，浇冷水又直接变回固体，全程不经过液态！先猜一猜，再动手验证。 | 12.5s |
| c3s4-s1 | 猜好啦？那就点「浇热水」，看碘怎么变身。 | 5.0s |
| c3s4-s2 | 热水一浇，碘直接冒出紫色蒸气，没化成液体！ | 5.5s |
| c3s4-s3 | 这就是升华：固态直接变气态，还要吸热。 | 5.0s |
| c3s4-s4 | 浇冷水啦，紫色蒸气变淡，要变回固态了。 | 5.0s |
| c3s4-s5 | 器壁挂上亮晶晶的碘晶体，这叫凝华，放热。 | 5.0s |
| c3s4-s6 | 蒸气散尽啦，全程固态气态互变，没有液态。 | 5.0s |
| c3s4-s7 | 因此我们得出结论：固态直接变气态叫升华，要吸热；气态直接变固态叫凝华，要放热，中间都不经过液态。 | 10.5s |
| c3s4-e1 | 不对哟～还没有碘蒸气呢，先点「浇热水」吧。 | 5.0s |
| c3s4-e2 | 不对哟～时间暂停了，点「开始」变化才继续哦。 | 5.0s |
| c3s4-f1 | 热水越热，升华越快，紫色蒸气冒得越猛。 | 5.0s |
| c3s4-f2 | 热水正浇在容器上，热量传进去，碘要升华咯。 | 5.5s |
| c3s4-f3 | 碘颗粒的量变啦，越多蒸气越浓越壮观。 | 5.0s |

**计数**：c3s1 = 1 intro + 7 steps + 2 errors + 3 free = 13；c3s2 = 2 intro + 9 steps + 2 errors + 3 free = 16；c3s3 = 3 intro + 21 steps + 5 errors + 8 free = 37；c3s4 = 1 intro + 7 steps + 2 errors + 3 free = 13。**合计 79 条**，按均 6s 估 ≈ 8 分钟音频，体量 ≈3MB（【规范】§4.5 上百条才需先报体积，79 条直接做）。

id↔clip 映射说明：c3s1/c3s4 的 step id 与 clip 序号一致（s1↔c3s1-s1）；c3s2 表格 id（melt-s1…freeze-concl-b）→ clip 顺序号 c3s2-s1…s9；c3s3 表格 id（boil-s1…lq-concl）→ c3s3-s1…s21（boil=s1~s7，evap=s8~s16，liquefy=s17~s21）。guide-data（§5）以 clip 序号为准，表格 id 仅为阅读别名；**`after:` 引用同样按规范 id 换算**——表格 `after:boil-s5@6000`＝guide-data `after:s5@6000`（boil 节内）、表格 `after:freeze-s1@6000`＝`after:s5@6000`（freeze 节内），引擎按 DATA 内真实 step id 匹配（引擎:34、176-181），开发单落数据时一律照 §5 原文。

---

## §5 完整 guide-data.js 四份

约定（对齐 c4s3 `guide/script.js` 与【规范】§2/§3）：trigger 存字符串由引擎 `new Function('R','G')` 求值（引擎:44）——**本设计不使用任何 G.\* 字段**（共享引擎 G 采集是 c4s3 专属，见 §0.1），只读 R.\*、`window.SublimationPour.state`（c3s4）与 event:/after:/@ 语法；steps 全 `repeat:true`（3s 冷却防刷屏，引擎:202-205）；`event:…` capture 判态读**点击前**状态；结论条一律 `after:xxx@6000`。audios 路径 `guide/audio/<clipid>.mp3`。五类中 tasks 为 A 版专属数据，本轮 B 语音版不建（四类 intro/steps/errors/free audio 零缺失）。

### §5.1 c3_s1 `guide/guide-data.js`（mode key：refract）

```js
'use strict';
/* c3s1 温度实验室 · B 语音版数据（docs/c3-guide-design.md §A/§4 逐条搬入；文案逐字照抄，禁改写）
   R=window.C3S1_STATE（§A-1 暴露：state+paused/thermometers 不可枚举 getter）。
   s3 为 event 型 step，依赖 §0.5 引擎微补丁（bindEventTriggers 的 steps 分发）。 */
window.C3S1_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到温度实验室！凭感觉判冷热不可靠，要用温度计。插上温度计读读数，加热看升温，加冰看看0℃，烧开看看100℃，把摄氏温标定下来吧！',
      audio:'c3s1-intro'
    },
    steps:[
      {id:'s1',repeat:true,trigger:"R.thermometers.length>=1",say:'温度计插进水里啦！等示数稳定了再读数哦。',audio:'c3s1-s1'},
      {id:'s2',repeat:true,trigger:"R.thermometers.some(t=>t.type==='clinical'&&!t.inWater)",say:'体温计离开水，读数却不降，缩口在起作用。',audio:'c3s1-s2'},
      {id:'s3',repeat:true,trigger:"event:click:#clinical-shake:R.thermometers.some(t=>t.type==='clinical'&&!t.inWater)",say:'甩一甩，水银退回玻璃泡，读数就复位啦。',audio:'c3s1-s3'},
      {id:'s4',repeat:true,trigger:"R.heating===true && R.heatPower>0",say:'开始加热啦，水温一点点往上爬，盯紧读数。',audio:'c3s1-s4'},
      {id:'s5',repeat:true,trigger:"R.iceMass>0 && R.waterTemp<=0.5",say:'冰水混合物！温度稳稳停在0℃不动。',audio:'c3s1-s5'},
      {id:'s6',repeat:true,trigger:"R.heating && R.waterTemp>=99.5",say:'沸腾啦！气泡涌到水面，温度停在100℃。',audio:'c3s1-s6'},
      {id:'s7',repeat:true,trigger:'after:s6@6000',say:'因此我们得出结论：标准大气压下，冰水混合物是0℃，沸水是100℃；测温度不能靠感觉，要用温度计。',audio:'c3s1-s7'}
    ],
    errors:[
      {id:'e1',trigger:"event:click:#btn-heat:R.heatPower===0 && !R.heating",fix:'不对哟～功率还是0，先把加热功率调大，再开加热呀。',audio:'c3s1-e1'},
      {id:'e2',trigger:"R.paused===true && (R.heating===true || R.iceMass>0)@3000",fix:'不对哟～时间还暂停着呢，点「开始」，温度才会动哦。',audio:'c3s1-e2'}
    ],
    free:[
      {trigger:"event:input:#power-slider:R.heating===true",note:'加热功率越大，水温升得越快。',audio:'c3s1-f1'},
      {trigger:"R.iceMass>0 && R.waterTemp>5",note:'冰在吸热熔化，水温一点点往下掉。',audio:'c3s1-f2'},
      {trigger:"event:input:#amb-slider:R.simTime>0",note:'环境温度一变，水最后凉到的温度也跟着变。',audio:'c3s1-f3'}
    ]
  },
  audios:{
    'c3s1-intro':'guide/audio/c3s1-intro.mp3',
    'c3s1-s1':'guide/audio/c3s1-s1.mp3',
    'c3s1-s2':'guide/audio/c3s1-s2.mp3',
    'c3s1-s3':'guide/audio/c3s1-s3.mp3',
    'c3s1-s4':'guide/audio/c3s1-s4.mp3',
    'c3s1-s5':'guide/audio/c3s1-s5.mp3',
    'c3s1-s6':'guide/audio/c3s1-s6.mp3',
    'c3s1-s7':'guide/audio/c3s1-s7.mp3',
    'c3s1-e1':'guide/audio/c3s1-e1.mp3',
    'c3s1-e2':'guide/audio/c3s1-e2.mp3',
    'c3s1-f1':'guide/audio/c3s1-f1.mp3',
    'c3s1-f2':'guide/audio/c3s1-f2.mp3',
    'c3s1-f3':'guide/audio/c3s1-f3.mp3'
  }
};
```

### §5.2 c3_s2 `guide/guide-data.js`（mode key：melt / freeze）

```js
'use strict';
/* c3s2 熔化凝固探究馆 · B 语音版数据（§B/§4）。R=window.C3S2_STATE（§B-1 Proxy 暴露）。
   mode 由引擎轮询 R.mode 自动切（melt→freeze 转场自动播 freeze intro）。
   熔化晶体线 s1→s2→s3→s4；熔化石蜡线 s1→s4（s4 用 hold 表达式双路覆盖：晶体全熔旗标 或 石蜡变软旗标，
   持续6s才播）。石蜡熔化无自动凝固（meltedFrac 恒 0），需 btn-pre-melt 进 freeze（S2-core:1023-1043）走 s7→s9；
   凝固晶体线 s5→s6→s8。 */
window.C3S2_GUIDE={
  melt:{
    intro:{
      text:'欢迎来到熔化凝固探究馆！海波和石蜡要在水浴里加热，看晶体怎么熔化、非晶体怎么变软。点燃酒精灯，开始记温度吧！',
      audio:'c3s2-intro-melt'
    },
    steps:[
      {id:'s1',repeat:true,trigger:"R.heating===true && R.phaseName==='固态'",say:'酒精灯点着啦，水浴传热，样品温度慢慢升。',audio:'c3s2-s1'},
      {id:'s2',repeat:true,trigger:"R.phaseName==='固液共存' && R.sample!=='paraffin'",say:'到熔点啦！晶体边吸热边熔化，温度停住不动。',audio:'c3s2-s2'},
      {id:'s3',repeat:true,trigger:"R.fullyMeltedAnnounced===true",say:'全化成液体啦，温度又开始往上升咯。',audio:'c3s2-s3'},
      {id:'s4',repeat:true,trigger:"(R.fullyMeltedAnnounced===true || (R.sample==='paraffin' && R.paraffinHeatAnnounced===true))@6000",say:'因此我们得出结论：晶体熔化要吸热，但有固定熔点，熔化中温度不变；非晶体像石蜡，没有熔点，边熔化边升温。',audio:'c3s2-s4'}
    ],
    errors:[
      {id:'e1',trigger:"R.paused===true && R.heating===true@3000",fix:'不对哟～还暂停着呢，点「开始」实验才会跑哦。',audio:'c3s2-e1'},
      {id:'e2',trigger:"R.heating===false && R.simTime>0 && R.meltedFrac<=0 && R.sampleTemp<=R.ambTemp+1@5000",fix:'灯灭啦，样品到不了熔点哟～重新点燃酒精灯吧。',audio:'c3s2-e2'}
    ],
    free:[
      {trigger:"event:input:#amb-slider:R.mode==='melt'",note:'环境温度一变，散热快慢跟着变，升温节奏不同啦。',audio:'c3s2-f1'},
      {trigger:"R.sample==='paraffin' && R.paraffinHeatAnnounced===true",note:'石蜡没有熔点，边吸热边变软变稀，温度一直升。',audio:'c3s2-f2'}
    ]
  },
  freeze:{
    intro:{
      text:'灯熄啦，进入凝固阶段！晶体凝固时温度也会保持不变吗？石蜡呢？盯紧温度计。',
      audio:'c3s2-intro-freeze'
    },
    steps:[
      {id:'s5',repeat:true,trigger:"R.phaseName==='固液共存' && R.sample!=='paraffin'",say:'到凝固点啦！边放热边凝固，温度也不变。',audio:'c3s2-s5'},
      {id:'s6',repeat:true,trigger:'after:s5@6000',say:'同一种晶体，凝固点和熔点相同，都是那个温度。',audio:'c3s2-s6'},
      {id:'s7',repeat:true,trigger:"R.sample==='paraffin' && R.mode==='freeze' && R.phaseName==='变稠变硬'",say:'石蜡没有凝固点，边放热边变稠，温度一直降。',audio:'c3s2-s7'},
      {id:'s8',repeat:true,trigger:'after:s6@6000',say:'因此我们得出结论：晶体凝固要放热，有固定凝固点，凝固中温度不变，凝固点和熔点相同。',audio:'c3s2-s8'},
      {id:'s9',repeat:true,trigger:'after:s7@6000',say:'因此我们得出结论：非晶体凝固没有固定温度，边放热边变稠变硬，温度持续下降。',audio:'c3s2-s9'}
    ],
    errors:[],
    free:[
      {trigger:"R.freezeAnnotationShown===true",note:'看标注：海波凝固点48℃，跟熔点一模一样。',audio:'c3s2-f3'}
    ]
  },
  audios:{
    'c3s2-intro-melt':'guide/audio/c3s2-intro-melt.mp3',
    'c3s2-intro-freeze':'guide/audio/c3s2-intro-freeze.mp3',
    'c3s2-s1':'guide/audio/c3s2-s1.mp3',
    'c3s2-s2':'guide/audio/c3s2-s2.mp3',
    'c3s2-s3':'guide/audio/c3s2-s3.mp3',
    'c3s2-s4':'guide/audio/c3s2-s4.mp3',
    'c3s2-s5':'guide/audio/c3s2-s5.mp3',
    'c3s2-s6':'guide/audio/c3s2-s6.mp3',
    'c3s2-s7':'guide/audio/c3s2-s7.mp3',
    'c3s2-s8':'guide/audio/c3s2-s8.mp3',
    'c3s2-s9':'guide/audio/c3s2-s9.mp3',
    'c3s2-e1':'guide/audio/c3s2-e1.mp3',
    'c3s2-e2':'guide/audio/c3s2-e2.mp3',
    'c3s2-f1':'guide/audio/c3s2-f1.mp3',
    'c3s2-f2':'guide/audio/c3s2-f2.mp3',
    'c3s2-f3':'guide/audio/c3s2-f3.mp3'
  }
};
```

### §5.3 c3_s3 `guide/guide-data.js`（mode key：boil / evap / liquefy）

```js
'use strict';
/* c3s3 汽化液化探究馆 · B 语音版数据（§C/§4）。R=window.C3S3_STATE（§C-1 Proxy 暴露）。
   「气泡」均为物理沸腾气泡（bubbleRegime S3-phys:29-34），与 UI 无关，解说正常讲。
   R.liquefy.* 全部带 R.liquefy&& 守卫（init 早于引擎 tick，防御 bfcache）。
   evap 子台用 R.evapSub 闸门；「涂酒精」按钮无 id（§0.4.6），用 alcohol[0] 电平引导（f5）。 */
window.C3S3_GUIDE={
  boil:{
    intro:{
      text:'欢迎来到汽化液化探究馆！先烧水：沸腾前的气泡和沸腾时有什么不同？水烧开后温度还升吗？点燃酒精灯找答案。',
      audio:'c3s3-intro-boil'
    },
    steps:[
      {id:'s1',repeat:true,trigger:"R.heating===true && !R.boiling && R.waterTemp<60",say:'点火啦！水开始吸热升温，盯紧温度计。',audio:'c3s3-s1'},
      {id:'s2',repeat:true,trigger:"R.bubbleRegime==='collapse'",say:'杯底冒出小气泡，上升遇冷又变小消失了。',audio:'c3s3-s2'},
      {id:'s3',repeat:true,trigger:"R.heating && !R.boiling && R.waterTemp>=60 && R.waterTemp<85",say:'响水不开！气泡破裂最吵的时候，还没沸腾。',audio:'c3s3-s3'},
      {id:'s4',repeat:true,trigger:"R.heating && !R.boiling && R.waterTemp>=85",say:'开水不响～声音反而变小，马上就要沸腾啦。',audio:'c3s3-s4'},
      {id:'s5',repeat:true,trigger:"R.boiling===true",say:'沸腾啦！气泡上升越变越大，到水面破裂。',audio:'c3s3-s5'},
      {id:'s6',repeat:true,trigger:'after:s5@6000',say:'继续吸热，温度却停在沸点不变，看曲线平了！',audio:'c3s3-s6'},
      {id:'s7',repeat:true,trigger:'after:s6@6000',say:'因此我们得出结论：水沸腾前温度不断升高；沸腾后继续吸热，温度保持在沸点不变。',audio:'c3s3-s7'}
    ],
    errors:[
      {id:'e1',trigger:"R.paused===true && R.heating===true@3000",fix:'不对哟～时间暂停着呢，点「开始」水温才会升哦。',audio:'c3s3-e1'}
    ],
    free:[
      {trigger:"event:input:#amb-slider:R.heating===true",note:'环境温度一拖，水温也跟着跳，重新加热看看。',audio:'c3s3-f1'},
      {trigger:"R.lid==='sealed' && R.heating && !R.boiling",note:'密封盖压住蒸气，气压升高，要到102.5℃才沸。',audio:'c3s3-f2'},
      {trigger:"R.heating===false && R.waterTemp<95 && R.waterTemp>R.ambTemp+3",note:'灯熄了，水慢慢凉下来，向环境温度靠过去。',audio:'c3s3-f3'}
    ]
  },
  evap:{
    intro:{
      text:'沸腾要到沸点才发生，蒸发却任何温度都在进行。这里有三个小台子：拖滑杆比蒸发快慢，涂酒精感受蒸发致冷，还能纸锅烧水！切子标签玩起来。',
      audio:'c3s3-intro-evap'
    },
    steps:[
      {id:'s8',repeat:true,trigger:"R.evapSub==='factors' && R.evap.factors.temp>35",say:'液体温度调高了，蒸发一下子变快啦。',audio:'c3s3-s8'},
      {id:'s9',repeat:true,trigger:"R.evapSub==='factors' && R.evap.factors.area>1.5",say:'表面积摊大了，蒸发更快，衣服摊开干得快。',audio:'c3s3-s9'},
      {id:'s10',repeat:true,trigger:"R.evapSub==='factors' && R.evap.factors.wind>2",say:'空气流速加快，蒸发更快，有风天干得快。',audio:'c3s3-s10'},
      {id:'s11',repeat:true,trigger:"R.evapSub==='factors' && R.evap.factors.slowShown===true",say:'咦，这回对照组反而快！三个因素被你调低了。',audio:'c3s3-s11'},
      {id:'s12',repeat:true,trigger:"R.evapSub==='cooling' && R.evap.cooling.alcohol[0]>0",say:'酒精涂上啦，它要开始蒸发，温度计有好戏看。',audio:'c3s3-s12'},
      {id:'s13',repeat:true,trigger:"R.evap.cooling.conclusionShown===true",say:'涂酒精的示数更低！蒸发吸热，有致冷作用。',audio:'c3s3-s13'},
      {id:'s14',repeat:true,trigger:"R.evapSub==='paper' && R.evap.paper.lit && R.evap.paper.water>0 && !R.evap.paper.boiling && !R.evap.paper.burning",say:'火苗舔着纸锅，水在升温，纸却烧不着！',audio:'c3s3-s14'},
      {id:'s15',repeat:true,trigger:"R.evap.paper.boiling===true",say:'纸锅里的水沸腾啦！水温压住纸温，到不了着火点。',audio:'c3s3-s15'},
      {id:'s16',repeat:true,trigger:'after:s15@6000',say:'因此我们得出结论：蒸发在任何温度下都能发生；温度越高、表面积越大、空气流动越快，蒸发越快；蒸发吸热，有致冷作用。',audio:'c3s3-s16'}
    ],
    errors:[
      {id:'e2',trigger:"event:click:#paper-match-btn:R.evap.paper.water===0 && !R.evap.paper.lit",fix:'不对哟～纸锅还没加水呢，空烧马上就着火啦。',audio:'c3s3-e2'},
      {id:'e3',trigger:"R.evap.paper.burning===true",fix:'哎呀烧着啦！没水吸热，纸温冲到183℃着火点。',audio:'c3s3-e3'}
    ],
    free:[
      {trigger:"R.evapSub==='factors' && R.evap.factors.fastShown===true && R.evap.factors.volumes[1]<0.7",note:'右边液滴干得快，温度高表面积大，占了优势。',audio:'c3s3-f4'},
      {trigger:"R.evapSub==='cooling' && R.evap.cooling.alcohol[0]<=0",note:'点温度计下面的「涂酒精」，对比才看得出来了。',audio:'c3s3-f5'},
      {trigger:"event:click:#paper-water-btn:!R.evap.paper.lit",note:'水加好啦，纸锅贴着水，温度就被水压住了。',audio:'c3s3-f6'}
    ]
  },
  liquefy:{
    intro:{
      text:'水蒸气看不见，怎么把它变回水？加热水产生蒸气，让它上升遇到冷玻璃片，看它液化成水珠，一点点收集起来。点燃酒精灯开始吧。',
      audio:'c3s3-intro-liquefy'
    },
    steps:[
      {id:'s17',repeat:true,trigger:"R.heating===true && !R.boiling",say:'点灯加热，水吸热汽化，变成看不见的水蒸气。',audio:'c3s3-s17'},
      {id:'s18',repeat:true,trigger:"R.heating===true && R.waterTemp>=70",say:'水蒸气升上去，碰到上方冰冷的玻璃片啦。',audio:'c3s3-s18'},
      {id:'s19',repeat:true,trigger:"R.liquefy && R.liquefy.collectedPct>0",say:'看！蒸气遇冷液化成小水珠，挂在玻璃片上。',audio:'c3s3-s19'},
      {id:'s20',repeat:true,trigger:"R.liquefy && R.liquefy.collectedPct>=50",say:'水珠越聚越大，顺着玻璃片流下来收集啦。',audio:'c3s3-s20'},
      {id:'s21',repeat:true,trigger:'after:s20@6000',say:'因此我们得出结论：气态的水蒸气遇冷放热，液化成小水珠，降低温度是液化的途径之一，液化还要放热。',audio:'c3s3-s21'}
    ],
    errors:[
      {id:'e4',trigger:"event:click:#lq-lamp-btn:R.paused===true",fix:'不对哟～时间暂停着呢，点「开始」再点灯呀。',audio:'c3s3-e4'},
      {id:'e5',trigger:"R.heating===false && R.waterTemp<=R.ambTemp+2 && (!R.liquefy || R.liquefy.collectedPct===0)@8000",fix:'还没产生水蒸气哟～先点燃酒精灯把水烧热。',audio:'c3s3-e5'}
    ],
    free:[
      {trigger:"R.liquefy && R.liquefy.collectedPct>=100",note:'收集满啦！这些水全是水蒸气液化变回来的。',audio:'c3s3-f7'},
      {trigger:"R.heating===false && R.liquefy && R.liquefy.collectedPct>0 && R.liquefy.collectedPct<100",note:'灯熄了，水蒸气断了源，液化慢慢停下来。',audio:'c3s3-f8'}
    ]
  },
  audios:{
    'c3s3-intro-boil':'guide/audio/c3s3-intro-boil.mp3',
    'c3s3-intro-evap':'guide/audio/c3s3-intro-evap.mp3',
    'c3s3-intro-liquefy':'guide/audio/c3s3-intro-liquefy.mp3',
    'c3s3-s1':'guide/audio/c3s3-s1.mp3',
    'c3s3-s2':'guide/audio/c3s3-s2.mp3',
    'c3s3-s3':'guide/audio/c3s3-s3.mp3',
    'c3s3-s4':'guide/audio/c3s3-s4.mp3',
    'c3s3-s5':'guide/audio/c3s3-s5.mp3',
    'c3s3-s6':'guide/audio/c3s3-s6.mp3',
    'c3s3-s7':'guide/audio/c3s3-s7.mp3',
    'c3s3-s8':'guide/audio/c3s3-s8.mp3',
    'c3s3-s9':'guide/audio/c3s3-s9.mp3',
    'c3s3-s10':'guide/audio/c3s3-s10.mp3',
    'c3s3-s11':'guide/audio/c3s3-s11.mp3',
    'c3s3-s12':'guide/audio/c3s3-s12.mp3',
    'c3s3-s13':'guide/audio/c3s3-s13.mp3',
    'c3s3-s14':'guide/audio/c3s3-s14.mp3',
    'c3s3-s15':'guide/audio/c3s3-s15.mp3',
    'c3s3-s16':'guide/audio/c3s3-s16.mp3',
    'c3s3-s17':'guide/audio/c3s3-s17.mp3',
    'c3s3-s18':'guide/audio/c3s3-s18.mp3',
    'c3s3-s19':'guide/audio/c3s3-s19.mp3',
    'c3s3-s20':'guide/audio/c3s3-s20.mp3',
    'c3s3-s21':'guide/audio/c3s3-s21.mp3',
    'c3s3-e1':'guide/audio/c3s3-e1.mp3',
    'c3s3-e2':'guide/audio/c3s3-e2.mp3',
    'c3s3-e3':'guide/audio/c3s3-e3.mp3',
    'c3s3-e4':'guide/audio/c3s3-e4.mp3',
    'c3s3-e5':'guide/audio/c3s3-e5.mp3',
    'c3s3-f1':'guide/audio/c3s3-f1.mp3',
    'c3s3-f2':'guide/audio/c3s3-f2.mp3',
    'c3s3-f3':'guide/audio/c3s3-f3.mp3',
    'c3s3-f4':'guide/audio/c3s3-f4.mp3',
    'c3s3-f5':'guide/audio/c3s3-f5.mp3',
    'c3s3-f6':'guide/audio/c3s3-f6.mp3',
    'c3s3-f7':'guide/audio/c3s3-f7.mp3',
    'c3s3-f8':'guide/audio/c3s3-f8.mp3'
  }
};
```

### §5.4 c3_s4 `guide/guide-data.js`（mode key：refract）

```js
'use strict';
/* c3s4 升华凝华观察站 · B 语音版数据（§D/§4）。R=window.C3S4_STATE（§D-1 Proxy 暴露）。
   f2 引用 window.SublimationPour.state（POUR 已暴露 exp-subl-pour.js:1348-1350；trigger 经
   new Function 求值可访问全局作用域）。state.mode 恒 'iodine'，GUIDE_CFG.mode='refract' 强制单场景 key。 */
window.C3S4_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到升华凝华观察站！封闭容器里有少量碘颗粒，浇热水直接冒紫色蒸气，浇冷水又直接变回固体，全程不经过液态！先猜一猜，再动手验证。',
      audio:'c3s4-intro'
    },
    steps:[
      {id:'s1',repeat:true,trigger:"R.guessDone===true",say:'猜好啦？那就点「浇热水」，看碘怎么变身。',audio:'c3s4-s1'},
      {id:'s2',repeat:true,trigger:"R.phase==='sublimate' && R.vapor<0.35",say:'热水一浇，碘直接冒出紫色蒸气，没化成液体！',audio:'c3s4-s2'},
      {id:'s3',repeat:true,trigger:"R.sublimAnnounced===true",say:'这就是升华：固态直接变气态，还要吸热。',audio:'c3s4-s3'},
      {id:'s4',repeat:true,trigger:"R.phase==='deposit' && R.wallCrystal<0.25",say:'浇冷水啦，紫色蒸气变淡，要变回固态了。',audio:'c3s4-s4'},
      {id:'s5',repeat:true,trigger:"R.depositAnnounced===true",say:'器壁挂上亮晶晶的碘晶体，这叫凝华，放热。',audio:'c3s4-s5'},
      {id:'s6',repeat:true,trigger:"R.phase==='deposit' && R.vapor<=0.05 && R.wallCrystal>0.25",say:'蒸气散尽啦，全程固态气态互变，没有液态。',audio:'c3s4-s6'},
      {id:'s7',repeat:true,trigger:'after:s6@6000',say:'因此我们得出结论：固态直接变气态叫升华，要吸热；气态直接变固态叫凝华，要放热，中间都不经过液态。',audio:'c3s4-s7'}
    ],
    errors:[
      {id:'e1',trigger:"event:click:#btn-cold:R.vapor<=0 && R.phase!=='sublimate'",fix:'不对哟～还没有碘蒸气呢，先点「浇热水」吧。',audio:'c3s4-e1'},
      {id:'e2',trigger:"R.paused===true && R.phase!=='idle'@2000",fix:'不对哟～时间暂停了，点「开始」变化才继续哦。',audio:'c3s4-e2'}
    ],
    free:[
      {trigger:"event:change:#hot-select",note:'热水越热，升华越快，紫色蒸气冒得越猛。',audio:'c3s4-f1'},
      {trigger:"window.SublimationPour.state.animPhase==='pour' && window.SublimationPour.state.animType==='hot'",note:'热水正浇在容器上，热量传进去，碘要升华咯。',audio:'c3s4-f2'},
      {trigger:"event:change:#iodine-select",note:'碘颗粒的量变啦，越多蒸气越浓越壮观。',audio:'c3s4-f3'}
    ]
  },
  audios:{
    'c3s4-intro':'guide/audio/c3s4-intro.mp3',
    'c3s4-s1':'guide/audio/c3s4-s1.mp3',
    'c3s4-s2':'guide/audio/c3s4-s2.mp3',
    'c3s4-s3':'guide/audio/c3s4-s3.mp3',
    'c3s4-s4':'guide/audio/c3s4-s4.mp3',
    'c3s4-s5':'guide/audio/c3s4-s5.mp3',
    'c3s4-s6':'guide/audio/c3s4-s6.mp3',
    'c3s4-s7':'guide/audio/c3s4-s7.mp3',
    'c3s4-e1':'guide/audio/c3s4-e1.mp3',
    'c3s4-e2':'guide/audio/c3s4-e2.mp3',
    'c3s4-f1':'guide/audio/c3s4-f1.mp3',
    'c3s4-f2':'guide/audio/c3s4-f2.mp3',
    'c3s4-f3':'guide/audio/c3s4-f3.mp3'
  }
};
```

---

## 附：落地顺序建议（供派单，非本文范围）

1. 本设计书 + TTS 音频 79 条（cn-batch-tts-voiceover 技能，晓晓音色）checkpoint commit。
2. 引擎微补丁（§0.5，`_lib/guide/engine-core.js` steps event 分发，回归 c4s3 四变体）。
3. 四页 core.js 各加暴露段（§A-1/§B-1/§C-1/§D-1，每页仅追加不改动既有行）+ 四份 guide-data.js + vB html（§0.3 模板，?v= 全 bump）。
4. 主会话浏览器实测（【规范】§6 清单逐项）→ commit 本地存档点 → 交作业提醒强刷。

（完）

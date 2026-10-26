# c4s5 光的色散实验室 · 语音讲解层设计书（B 版标配）

> 目标页面：`content/physics_g8_v1_c4_s5/exp-dispersion.html`（单页双场景：m1 色散台 / m2 三原色）
> 规范依据：`可交互教材/实验语音讲解层改造规范-B版标配.md`（§2 播报行为规则：steps 全 `repeat:true`、状态闸门、五类语音全覆盖、事件型 trigger 用 `event:` 前缀、延时 ≥6s）。
> 格式参照：`docs/c4s3-guide-variants-design.md`（判例库同源）。
> 物理口径权威源：`content/physics_g8_v1_c4_s5/explain.html`（白光色散=复色光被棱镜拆开；紫光偏折最大、红光最小；色光三原色红绿蓝；红+绿=黄、红+蓝=品红、绿+蓝=青、三色全满=白）。本文案与其零冲突。
> 引擎：`content/_lib/guide/engine-core.js` + `vB-core.js`（通用版，状态源=`window.GUIDE_CFG.state`，数据源=`window.GUIDE_DATA`，mode key=`GUIDE_CFG.mode`）。
> 本文档为纯设计产出，不含任何代码改动。所有 trigger 字段均已对照 `exp-dispersion-core.js`（168 行）与 `exp-dispersion-render.js`（142 行，`window.DSP` 定义于第 4 行）逐行核实，禁臆造字段。

---

## §-1 状态暴露核查

### -1.1 全局状态对象在哪、稳不稳

- **定义处**：`exp-dispersion-render.js` **第 4 行** `var R=window.DSP={W:0,H:0,by:0,fy:0,ctx:null,mode:'m1',source:null,prism:null,sourceOn:false,showRays:true,showLabels:false,dragHint:true,R:255,G:255,B:255,ripple:{t0:0,x:0,y:0},sunR:40,sunHover:false,bandX0:null,bandX1:null,faceW:null};`
- **复用处**：`exp-dispersion-core.js` 第 7 行 `var R=window.DSP;`——core/render 共用同一对象。
- **稳定性判定：✅ 稳定 mutate，不重建**。全仓对 `window.DSP` 只有 render L4 一次赋值；此后 core/render 全部原地改属性（`R.prism={...}`、`R.ripple={...}` 是属性级重建，DSP 对象引用本身不变），engine 在 load 时捕获一次引用即可（engine-core.js L12 + docs/guide-core-lib-report.md L84 约束满足）。core L159 `startLoop()` 后 `R.draw()` 每帧执行，`bandX0/bandX1/faceW/faceXMid/bandY` 每帧刷新。
- **结论：状态已在 window 上，无需任何新增暴露代码**。缺的只是页面接线（见 -1.4）。

### -1.2 已核实状态字段速查表（trigger 只准用这些）

| 字段 | 类型 | 取值 | 含义 | 核实出处 |
|---|---|---|---|---|
| `R.mode` | string | `'m1'`(色散台) / `'m2'`(三原色) | 当前场景 | render L4 初始化；core L15、L40 `setMode` |
| `R.sourceOn` | bool | 初始 false | 白光源开关（真开关，唯一权威） | render L4；core L63 `toggleLight`、L126 点太阳切换 |
| `R.prism.deg` | number | −15…15 整数 | 棱镜角度滑杆值（度） | core L28 建对象；L45 `setPrism` 钳位写入 |
| `R.prism.x` | number | `0.12W`…`0.46W` | 棱镜水平位置（canvas 拖动） | core L28；L120 拖动钳位写入 |
| `R.prism.y` / `R.prism.h` | number | layout 计算 | 棱镜底座 y / 高 | core L28（⚠ resize 会重建 prism：x 重置回 `0.30W`、只保留 deg，core L26-28） |
| `R.R` / `R.G` / `R.B` | number | 0…255 | m2 三原色色阶 | render L4；core L46 `setRGB` |
| `R.showRays` | bool | 初始 true | 七条直线光线显隐（`#cb-rays`） | core L97 change 写入 |
| `R.showLabels` | bool | 初始 false | 墙上七色文字标签（`#cb-labels`） | core L98 change 写入 |
| `R.dragHint` | bool | true→false 单向 | 首次抓住棱镜时置 false | render L4；core L128 |
| `R.bandX0` / `R.bandX1` | number/null | null=灯灭 或 m2 或光带竖移出墙；数值=墙上光带左右缘 x(px) | 光带是否在墙上、多宽（`bandX1-bandX0`） | render L125（写入）、L126/L127（置 null）、L89（m2 置 null） |
| `R.faceW` / `R.faceXMid` / `R.bandY` | number | 340 / 0.74W / 光带中心 y | 墙面光斑几何（每帧写） | render L59 |
| `R.W` / `R.H` | number | canvas 逻辑宽高 | 布局基准（trigger 里做相对位置用） | core L20-21 `layout` |
| `window.__dspDbg` | getters | bandX0/bandX1/bandC/faceW/faceXMid/bandY | 调试只读视图（trigger 不用，验收可用） | core L160-167 |

**⚠ 陷阱字段（已核实，trigger 禁用）：**

| 字段 | 为什么禁 | 出处 |
|---|---|---|
| `R.prismDeg` | core L15 一次性写 0 后**全仓再无任何更新**；真实角度在 `R.prism.deg`（core L45） | core L15 vs L45 |
| `R.source.on` | core L30 建对象时写死 false 后**从不更新**；真实开关是 `R.sourceOn`（core L63/L126） | core L30 vs L63 |
| `R.sunHover` / `R.ripple` | 每帧瞬态动画值，做电平 trigger 会抖动刷屏 | core L35/L116 |
| `G.recCount`、`G.objChangeCount`、`G.eqMoveGestureCount` 等 c4s3 私有 G 字段 | engine-core `updateG()`（L86-122）采集的是 c4s3 专属状态（`R.doCm/R.eqOn/R.m3`），DSP 上全为 undefined，采集逻辑有守卫不会报错但**值永远无意义**；本页 trigger 一律不引用（`G.t`/`G.modeEnterT` 两个通用字段可用） | engine-core L86-122 |

### -1.3 控件 id 清单（exp-dispersion.html，事件型 trigger 用）

`mode-m1`、`mode-m2`（场景钮）；`prism-slider`+`prism-val`（棱镜角度 −15…15）；`btn-light`（点亮/熄灭）；`cb-rays`、`cb-labels`（显示勾选）；`read-spread`（墙上光带宽读数）；`r-slider`/`g-slider`/`b-slider` + `r-num`/`g-num`/`b-num`（三原色滑杆+输入框，超范围 core 加 `.invalid` 红框，core L79-92）；`mix-swatch`+`mix-readout`（混合色块+读数，core L47-50）；`btn-reset`、`btn-mute`、`btn-full`；`scene`(canvas)、`scene-wrap`、`hint`。
（core L99 引用的 `tray-source` 在 HTML 中不存在，core 已判空守卫，无影响。）

### -1.4 最小接线方案（Qoder 实施，本设计书不动代码）

状态已在 window 上，**零暴露代码**。仅需在 `exp-dispersion.html` 尾部、`exp-dispersion-core.js` 之后按序追加（宿主 core → GUIDE_CFG/GUIDE_DATA → engine-core → vB-core，见 docs/guide-core-lib-report.md L88-98）：

```html
<link rel="stylesheet" href="../_lib/guide/guide-core.css?v=YYYYMMDD">
<script src="guide/guide-data.js?v=YYYYMMDD"></script>
<script>window.GUIDE_CFG={state:window.DSP,mode:'refract'};window.GUIDE_DATA=window.C4S5_GUIDE;</script>
<script src="../_lib/guide/engine-core.js?v=YYYYMMDD"></script>
<script src="../_lib/guide/vB-core.js?v=YYYYMMDD"></script>
```

- `GUIDE_CFG.mode='refract'` 恒定（单场景实验统一 key，engine-core L376 优先读它），所以 `onModeEnter('refract')` 只在引擎启动时发生一次：intro 播一次，m1↔m2 切换**不会**重播 intro、也不会触发 `clearRepeatState`——步骤重进语义靠各 trigger 自身边沿（`repPrev`）保证，本页数据已按此设计。
- engine `updateG()` 对 c4s3 专属字段的引用全部带守卫（`R.doCm!=null`、`if(R.eqOn)`、`R.m3&&`），DSP 缺失字段不会报错（engine-core L86-101 已核实）。

### -1.5 两条引擎硬约束（trigger 写法的依据，落地时禁「优化」）

1. **`repeat:true` + `expr@holdMs` 组合在引擎里永远不触发**：`tickSteps` 每帧先把 `repPrev[id]` 更新为当前电平 v（engine-core L186-187），hold 到期时要求 `!rPrev`（L194），而条件持续为真时 rPrev 恒 true → 永不 fire。**所以本页 steps 的「等上一条讲完」全部用 `after:步骤id@N` 链（规范 §2.4 认可式），`@hold` 只允许出现在 errors**（`tickErrors` 无 repeat 逻辑，L217-227 正常）。
2. **事件型 trigger 只在 capture 阶段由 `bindEventTriggers` 触发 errors 和 free**（engine-core L246-286，**不触发 steps**）；capture 先于 core 的 bubble 处理器执行，所以事件表达式里：**DOM 属性已是新值**（range 的 `.value`、checkbox 的 `.checked` 在事件派发前已更新），**`R.*` 字段还是旧值**（core 的处理器后跑）。本页事件型 expr 只读 `R.mode/R.sourceOn`（与该事件无关的稳定字段）或 DOM 属性，不读将被该事件改写的 R 字段——c4s3 `event:click:#btn-rec:R.objLit===false` 同款判例。
3. 因此**拖滑杆/移动类的即时反馈全部放 free/errors（事件型），steps 一律用状态电平/after 链**。

### -1.6 内容范围核查：红外线/紫外线

已 grep 全目录（`红外|紫外|infrared|ultraviolet`）：**0 命中**。explain.html 实际口径=白光色散/色光混合/物体的颜色/例题小结，实验可视元素也只有七色光带与 RGB 混色。任务单提及的「红外线/紫外线区域」在权威源中不存在，**按纪律不臆造，本设计不覆盖**；如蔡总要加，属 explain.html+实验本体的内容扩写，另立需求。「物体的颜色」（反射/透过）实验里也没有对应场景，同样不入解说。

---

## §1 步骤解说稿 steps（9 条，全 `repeat:true`）

探究链：开光源 → 七色光带 → 色散原理（各色光偏折不同）→ 标签强化（紫最大红最小）→ 拖棱镜看光带宽窄 → 切三原色 → 三满=白 → 红+绿=黄 → 总结论。

数组顺序=同帧优先级（`tickSteps` 每帧只发第一条命中的，engine-core L202）。`after:` 链的延时依据规范 §2.4（≥6s）+ 上一条音频预估时长留余量；落地后须按 afinfo 实测复核（规范 §4.4）。

| id | trigger | 核实出处 | say（≤25字） | audio | 知识点 |
|---|---|---|---|---|---|
| c4s5-s1 | `R.mode==='m1' && R.sourceOn===true` | sourceOn：core L63/L126；mode：core L40 | 点亮啦！一束白光直射向三棱镜。 | c4s5-s1 | 白光入射棱镜（牛顿 1666 实验起点，explain e1） |
| c4s5-s2 | `after:c4s5-s1@6000` | after 语法 engine-core L35；s1 音频≈4.5s<6s 不砍 | 看！白光在墙上散开成红橙黄绿蓝靛紫七色光带啦。 | c4s5-s2 | 色散现象+七色顺序（explain e1：红橙黄绿蓝靛紫） |
| c4s5-s3 | `after:c4s5-s2@8000` | s2 音频≈6.5s，8s 留余量 | 为什么会分开？各色光通过棱镜时，偏折程度不一样呀。 | c4s5-s3 | 色散原理=折射、各色光偏折程度不同（explain e1 key-point 原口径，不用「折射率」超纲词） |
| c4s5-s4 | `R.mode==='m1' && R.sourceOn===true && R.showLabels===true` | showLabels：core L98 `#cb-labels`；标签绘制 render L120-123 | 打开标签看得清：紫光偏折最大，红光偏折最小。 | c4s5-s4 | 紫最大红最小（explain e1 key-point） |
| c4s5-s5 | `R.mode==='m1' && R.sourceOn===true && Math.abs(R.prism.x-R.W*0.30)>30` | prism.x 拖动：core L120（钳位 0.12W~0.46W）；基准 0.30W：core L28；墙在 0.74W：render L22；横向散开∝距离 D：render L38/L47-48 | 拖动棱镜沿桌子走，离墙距离变了，光带宽窄也跟着变。 | c4s5-s5 | 色散距离影响光带宽窄（core L69 hint 同口径） |
| c4s5-s6 | `R.mode==='m2'` | setMode：core L40（点 `#mode-m2`，core L95） | 切到三原色啦！红、绿、蓝就是色光三原色。 | c4s5-s6 | 色光三原色（explain e2） |
| c4s5-s7 | `after:c4s5-s6@6000` | s6 音频≈5.5s<6s；初始 R=G=B=255（render L4），进 m2 画面即白光 | 记住：红绿蓝三色拉到最满，混出来就是白光！ | c4s5-s7 | 红+绿+蓝=白（explain e2 速查）；写成普适规律句，用户已拖滑杆也不穿帮 |
| c4s5-s8 | `R.mode==='m2' && R.R===255 && R.G===255 && R.B===0` | setRGB：core L46；黄判定与 core L55 `mixName()` 精确一致 | 神奇吧？红光加绿光，居然混出了黄光！ | c4s5-s8 | 红+绿=黄（explain e2 速查；直觉冲突点） |
| c4s5-s9 | `after:c4s5-s8@6000` | 规范 §2.4 结论步标准式；s8 音频≈5.0s<6s | 因此我们得出结论：白光是多种色光混合成的复色光，既能被棱镜色散，也能用色光重新混合出来。 | c4s5-s9 | 总结论=复色光+可散可合（explain e1 key-point①+思考讨论1 倒棱镜复合白光）；结论步按 c4s3 判例可超 25 字 |

**设计说明：**
- s2/s3 不用电平 trigger 是因为「开灯瞬间光带即出现」——电平会让 s1/s2/s3 同帧连环触发、即时打断制下自己把自己砍掉（r5/r6 判例）。`after:` 链=规范认可的顺序播报式，且 `repeat:true` 下 s1 每次重新点灯 re-fire → s2/s3 链自动重播（`fireCount/seenCount` 机制，engine-core L178-179），符合「状态类解说可重复播报」。
- 已知取舍（记录备查）：`after:` 不查状态——若用户点灯后 6s 内关灯/切去 m2，s2（或 s3）仍会播出。c4s3 `after:m3-s4@1500` 同款行为已被蔡总实机验收，风险接受；若实机反馈穿帮，修复方向是引擎给 after 型加可选状态后缀（另立引擎单，不在本页数据层解决）。
- 转棱镜滑杆（`#prism-slider`）的即时反馈放在 §3 f1（事件型），steps 里**不设**转棱镜步——引擎事件型不触发 steps（-1.5 第 2 条），且状态型 `prism.deg!==0` 会与 f1 事件同帧撞车双播。

---

## §2 纠错 errors（3 条，「不对哟～」，只说该先做什么）

| id | trigger | 核实出处 | fix（橙色纠错） | audio |
|---|---|---|---|---|
| c4s5-e1 | `event:input:#prism-slider:R.mode==='m1' && R.sourceOn===false` | 滑杆 input 绑定 core L73；`#prism-slider` html 存在；expr 读 sourceOn（该事件不改写它，capture 时序安全，-1.5 第 2 条） | 不对哟～先点亮光源，才看得见光带往哪儿偏呀。 | c4s5-e1 |
| c4s5-e2 | `event:change:#cb-rays:R.mode==='m1' && R.sourceOn===true && document.getElementById('cb-rays').checked===false` | core L97 change 写入 showRays；capture 时 `.checked` 已是新值（change 在状态翻转后派发）；七条光线绘制在 render L97-101 受 showRays 控制 | 不对哟～勾上「光线」才看得到七条光路，勾回来就有。 | c4s5-e2 |
| c4s5-e3 | `event:input:#r-num:!(/^\d+$/.test(document.getElementById('r-num').value.trim()) && +document.getElementById('r-num').value.trim()<=255)` | 合法性判定逐字镜像 core L82-83（`/^\d+$/` 且 0…255，非法走 L89 加 `.invalid` 红框）；capture 先于 core 的 invalid 类名写入，故直接验 value 不验类名 | 不对哟～只能输入 0 到 255 的整数，红框的不算哦。 | c4s5-e3 |

- 节流：引擎对 errors 统一 5s 节流（engine-core L232/L253），数据层不用管。
- e3 只做 `#r-num` 一条（g-num/b-num 机制完全相同，core L79-92 同一循环生成）；如蔡总实机要求三框全盖，复制两条改 id 与文案即可（clip 同文可复用 c4s5-e3 音频，不新增 TTS）。
- e2 备注：取消勾选「光线」只隐藏七条直线（render L97-101），墙上渐变光带仍在（render L105-119 不受 showRays 控制）——纠错词只承诺「七条光路」，与画面一致，不夸大。

---

## §3 自由解说 free（4 条，全带 audio；事件型已挂状态闸门）

| # | trigger | 核实出处 | note（中性描述，≤25字） | audio |
|---|---|---|---|---|
| f1 | `event:input:#prism-slider:R.mode==='m1' && R.sourceOn===true` | 闸门=sourceOn（灯灭已由 e1 接管，两条 expr 互斥零双播）；角度→光带偏移：core L69 hint 原话「转棱柱看光带偏移」，几何在 render L47-48 | 棱镜角度一变，光带整体跟着偏移。 | c4s5-f1 |
| f2 | `R.mode==='m2' && R.R===255 && R.G===0 && R.B===255` | 品红判定与 core L57 `mixName()` 一致 | 红光加蓝光，混出品红色，好艳丽！ | c4s5-f2 |
| f3 | `R.mode==='m2' && R.R===0 && R.G===255 && R.B===255` | 青判定与 core L56 一致 | 绿光加蓝光，混出青色，清清爽爽。 | c4s5-f3 |
| f4 | `R.mode==='m2' && R.R===0 && R.G===0 && R.B===0` | 黑判定与 core L53 一致 | 三色都归零，一点光也没有，黑漆漆。 | c4s5-f4 |

- f2/f3/f4 为电平边沿+8s 节流（engine-core L231-242 `tickFree`），精确值触发、与 mixName 色名一一对应，不会出现「说黄指绿」。
- 红+绿=黄不入 free——已由步骤 s8 覆盖（避免同状态双条目抢话）。

---

## §4 音频 clip 清单表（17 条，五类全量，零缺失）

规则（规范 §4）：edge-tts `zh-CN-XiaoxiaoNeural`，语速 1.0x；文件名=clip id；预估秒数=字数÷4+0.5s 向上取整到 0.5s（落盘后一律 afinfo 实测替换预估，再回填 after/delay 值）。发音预处理只进 mp3：「～」读逗号停顿、「0 到 255」读「零到二百五十五」、剥「」引号；屏幕文案保持原样。

| clip id | 类别 | 文本 | 字数 | 预估秒数 |
|---|---|---|---|---|
| c4s5-intro | intro | 欢迎来到色散实验室！一束白光穿过三棱镜，居然在墙上变出七色光带！白光为什么藏着这么多颜色？点亮光源一探究竟吧。 | 55 | 14.5s |
| c4s5-s1 | steps | 点亮啦！一束白光直射向三棱镜。 | 15 | 4.5s |
| c4s5-s2 | steps | 看！白光在墙上散开成红橙黄绿蓝靛紫七色光带啦。 | 23 | 6.5s |
| c4s5-s3 | steps | 为什么会分开？各色光通过棱镜时，偏折程度不一样呀。 | 25 | 7.0s |
| c4s5-s4 | steps | 打开标签看得清：紫光偏折最大，红光偏折最小。 | 22 | 6.0s |
| c4s5-s5 | steps | 拖动棱镜沿桌子走，离墙距离变了，光带宽窄也跟着变。 | 25 | 7.0s |
| c4s5-s6 | steps | 切到三原色啦！红、绿、蓝就是色光三原色。 | 20 | 5.5s |
| c4s5-s7 | steps | 记住：红绿蓝三色拉到最满，混出来就是白光！ | 21 | 6.0s |
| c4s5-s8 | steps | 神奇吧？红光加绿光，居然混出了黄光！ | 17 | 5.0s |
| c4s5-s9 | steps(concl) | 因此我们得出结论：白光是多种色光混合成的复色光，既能被棱镜色散，也能用色光重新混合出来。 | 44 | 11.5s |
| c4s5-e1 | errors | 不对哟～先点亮光源，才看得见光带往哪儿偏呀。 | 22 | 6.0s |
| c4s5-e2 | errors | 不对哟～勾上「光线」才看得到七条光路，勾回来就有。 | 25 | 7.0s |
| c4s5-e3 | errors | 不对哟～只能输入 0 到 255 的整数，红框的不算哦。 | 23 | 6.5s |
| c4s5-f1 | free | 棱镜角度一变，光带整体跟着偏移。 | 16 | 4.5s |
| c4s5-f2 | free | 红光加蓝光，混出品红色，好艳丽！ | 16 | 4.5s |
| c4s5-f3 | free | 绿光加蓝光，混出青色，清清爽爽。 | 16 | 4.5s |
| c4s5-f4 | free | 三色都归零，一点光也没有，黑漆漆。 | 17 | 5.0s |

预估总时长 ≈ 116s（<2MB 级，规范 §4.5 无需报体积）。落盘目录：`content/physics_g8_v1_c4_s5/guide/audio/`（随音频轮创建，与 c4s3 `guide/audio/` 同构）。

---

## §5 完整 guide-data.js 内容

文件：`content/physics_g8_v1_c4_s5/guide/guide-data.js`（Qoder 落地时逐字照抄，文案=§1~§4，禁改写；接线见 -1.4）。

```js
'use strict';
/* c4s5 光的色散实验室 · 语音讲解层数据（设计书 docs/c4s5-guide-design.md §1~§4 逐字搬入，禁改写）
   状态源=window.DSP（exp-dispersion-render.js L4 定义，稳定 mutate）；页面接线：
   window.GUIDE_CFG={state:window.DSP,mode:'refract'};window.GUIDE_DATA=window.C4S5_GUIDE;
   trigger 约定（engine-core.js）：
     "after:c4s5-s1@6000"              = 依赖步触发后延时 6s（规范 §2.4，延时≥6s）
     "event:input:#prism-slider:EXPR"  = 滑杆 input capture 即时判态（EXPR 只读稳定 R 字段/DOM 新值）
     "event:change:#cb-rays:EXPR"      = 勾选变更即时判态（capture 时 .checked 已是新值）
   ⚠ 禁把 steps 改成 expr@hold 形式：engine tickSteps 的 repeat+hold 分支永不触发（设计书 -1.5 第 1 条）。 */
window.C4S5_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到色散实验室！一束白光穿过三棱镜，居然在墙上变出七色光带！白光为什么藏着这么多颜色？点亮光源一探究竟吧。',
      audio:'c4s5-intro'
    },
    steps:[
      {id:'c4s5-s1',repeat:true,trigger:"R.mode==='m1' && R.sourceOn===true",say:'点亮啦！一束白光直射向三棱镜。',audio:'c4s5-s1'},
      {id:'c4s5-s2',repeat:true,trigger:'after:c4s5-s1@6000',say:'看！白光在墙上散开成红橙黄绿蓝靛紫七色光带啦。',audio:'c4s5-s2'},
      {id:'c4s5-s3',repeat:true,trigger:'after:c4s5-s2@8000',say:'为什么会分开？各色光通过棱镜时，偏折程度不一样呀。',audio:'c4s5-s3'},
      {id:'c4s5-s4',repeat:true,trigger:"R.mode==='m1' && R.sourceOn===true && R.showLabels===true",say:'打开标签看得清：紫光偏折最大，红光偏折最小。',audio:'c4s5-s4'},
      {id:'c4s5-s5',repeat:true,trigger:"R.mode==='m1' && R.sourceOn===true && Math.abs(R.prism.x-R.W*0.30)>30",say:'拖动棱镜沿桌子走，离墙距离变了，光带宽窄也跟着变。',audio:'c4s5-s5'},
      {id:'c4s5-s6',repeat:true,trigger:"R.mode==='m2'",say:'切到三原色啦！红、绿、蓝就是色光三原色。',audio:'c4s5-s6'},
      {id:'c4s5-s7',repeat:true,trigger:'after:c4s5-s6@6000',say:'记住：红绿蓝三色拉到最满，混出来就是白光！',audio:'c4s5-s7'},
      {id:'c4s5-s8',repeat:true,trigger:"R.mode==='m2' && R.R===255 && R.G===255 && R.B===0",say:'神奇吧？红光加绿光，居然混出了黄光！',audio:'c4s5-s8'},
      {id:'c4s5-s9',repeat:true,trigger:'after:c4s5-s8@6000',say:'因此我们得出结论：白光是多种色光混合成的复色光，既能被棱镜色散，也能用色光重新混合出来。',audio:'c4s5-s9'}
    ],
    errors:[
      {id:'c4s5-e1',trigger:"event:input:#prism-slider:R.mode==='m1' && R.sourceOn===false",fix:'不对哟～先点亮光源，才看得见光带往哪儿偏呀。',audio:'c4s5-e1'},
      {id:'c4s5-e2',trigger:"event:change:#cb-rays:R.mode==='m1' && R.sourceOn===true && document.getElementById('cb-rays').checked===false",fix:'不对哟～勾上「光线」才看得到七条光路，勾回来就有。',audio:'c4s5-e2'},
      {id:'c4s5-e3',trigger:"event:input:#r-num:!(/^\\d+$/.test(document.getElementById('r-num').value.trim()) && +document.getElementById('r-num').value.trim()<=255)",fix:'不对哟～只能输入 0 到 255 的整数，红框的不算哦。',audio:'c4s5-e3'}
    ],
    free:[
      {trigger:"event:input:#prism-slider:R.mode==='m1' && R.sourceOn===true",note:'棱镜角度一变，光带整体跟着偏移。',audio:'c4s5-f1'},
      {trigger:"R.mode==='m2' && R.R===255 && R.G===0 && R.B===255",note:'红光加蓝光，混出品红色，好艳丽！',audio:'c4s5-f2'},
      {trigger:"R.mode==='m2' && R.R===0 && R.G===255 && R.B===255",note:'绿光加蓝光，混出青色，清清爽爽。',audio:'c4s5-f3'},
      {trigger:"R.mode==='m2' && R.R===0 && R.G===0 && R.B===0",note:'三色都归零，一点光也没有，黑漆漆。',audio:'c4s5-f4'}
    ],
    tasks:[]
  },
  audios:{
    'c4s5-intro':'guide/audio/c4s5-intro.mp3',
    'c4s5-s1':'guide/audio/c4s5-s1.mp3',
    'c4s5-s2':'guide/audio/c4s5-s2.mp3',
    'c4s5-s3':'guide/audio/c4s5-s3.mp3',
    'c4s5-s4':'guide/audio/c4s5-s4.mp3',
    'c4s5-s5':'guide/audio/c4s5-s5.mp3',
    'c4s5-s6':'guide/audio/c4s5-s6.mp3',
    'c4s5-s7':'guide/audio/c4s5-s7.mp3',
    'c4s5-s8':'guide/audio/c4s5-s8.mp3',
    'c4s5-s9':'guide/audio/c4s5-s9.mp3',
    'c4s5-e1':'guide/audio/c4s5-e1.mp3',
    'c4s5-e2':'guide/audio/c4s5-e2.mp3',
    'c4s5-e3':'guide/audio/c4s5-e3.mp3',
    'c4s5-f1':'guide/audio/c4s5-f1.mp3',
    'c4s5-f2':'guide/audio/c4s5-f2.mp3',
    'c4s5-f3':'guide/audio/c4s5-f3.mp3',
    'c4s5-f4':'guide/audio/c4s5-f4.mp3'
  }
};
```

> 注①：e3 trigger 字符串里正则写作 `/^\d+$/`（JS 字符串内 `\d` 需转义为 `\\d`，上方代码已按可直接落盘的转义写好；Qoder 照抄后跑 `node --check` 验证）。
> 注②：`audios` 挂在 `window.C4S5_GUIDE` 顶层（与 mode key 平级），vB-core L14 从 `GUIDE_DATA.audios` 读取——与 c4s3 script.js 同构。
> 注③：`tasks:[]` 留空=本轮不做 A 版任务链，engine `tickTasks` 对空数组零副作用（engine-core L345-354）。

---

## §6 文案口径对账（explain.html 逐条）

| 解说 | 口径来源（explain.html） |
|---|---|
| s2 七色顺序「红橙黄绿蓝靛紫」 | panel-e1：「展开成红、橙、黄、绿、蓝、靛、紫七色」；render L6 `L7` 同序 |
| s3 「各色光通过棱镜时，偏折程度不一样」 | panel-e1 key-point②：「色散的本质是折射——不同色光通过棱镜偏折程度不同」（不用「折射率」一词，explain 全文未出现，避免超纲） |
| s4 「紫光偏折最大，红光偏折最小」 | panel-e1 key-point② 原句 |
| s6 「红、绿、蓝就是色光三原色」 | panel-e2：「色光的三原色」 |
| s7 「三色拉到最满=白光」 | panel-e2 速查：「红 + 绿 + 蓝 = 白」 |
| s8/f2/f3 「红+绿=黄、红+蓝=品红、绿+蓝=青」 | panel-e2 速查原句 |
| s9 「复色光、既能色散也能重新混合」 | panel-e1 key-point①「白光…是多种色光混合成的复色光」+ 思考讨论1「倒置棱镜复合回白光」 |
| 红外/紫外 | explain.html 与实验代码均无（-1.6），不覆盖、不臆造 |

（完）

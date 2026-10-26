# 语音批量铺路 W1 接线报告 · c4s5 色散 + c4s2 反射

> 日期：2026-10-27 ｜ 任务书：W1（照 c4s4 试点模板）｜ 设计书：docs/c4s5-guide-design.md、docs/c4s2-guide-design.md（唯一数据源，逐字照抄）
> 改动面：新建 `content/physics_g8_v1_c4_s5/guide/guide-data.js`、`content/physics_g8_v1_c4_s2/guide/guide-data.js`；修改 `content/physics_g8_v1_c4_s5/exp-dispersion.html`、`content/physics_g8_v1_c4_s2/exp-reflect.html`。
> 红线全守：`_lib/guide/` 三件、两实验 core/render/audio js、c4_s3/c4_s4 全目录零触碰（`git diff --stat` 对这些文件为空）；未 commit/push。

## 0. 总判定

**接线本身全部正确、静态验收全过、移动兼容三件到位。**
- **c4s5 色散：浏览器实测全绿**（启动层/intro发声+字幕/9 条 steps 含 concl/纠错 e1 橙字幕/浮标三态/repeat 重播/console 0/375 无溢出）= **PASS**。
- **c4s2 反射：10 条 steps 中 8 条 PASS**（s1/s2/s3/s6/s7/s8/s9/concl）+ intro/e1/浮标三态/console 0（净序）/375 无溢出全 PASS；**s4（法线）、s5（验证∠r=∠i）两条 FAIL——被上游冻结引擎阻塞**（engine-core 未实现设计书附 A 适配点 A5：`G.angChangeCount`/`G.lastAngChangeT` 从不采集，s4 trigger 逐字含 `G.angChangeCount>=1` 恒假 → s4 永不触发 → after:s4 链的 s5 连带死）。红线禁改 `_lib/guide/`，**未修**，见 §5 阻塞①。
- 另测出 **c4s2 一个预存 render bug（与语音层无关）**：`exp-reflect-render.js:150` 在「平行光束 + 光路可逆」态引用越界变量 `incDir` 抛 ReferenceError（每帧），正常 UI 可复现。render js 属红线禁改，**未修**，见 §5 阻塞②。

**结论：两实验语音层接线达标可交付；c4s2 s4/s5 待引擎热修 A5 后无需改数据即自动复验通过；c4s2 render incDir 属实验本体历史 bug，建议另立 render 热修单。**

---

## 1. 静态验收（全过）

### 1.1 `node --check`
```
content/physics_g8_v1_c4_s5/guide/guide-data.js  → c4s5 OK
content/physics_g8_v1_c4_s2/guide/guide-data.js  → c4s2 OK
```

### 1.2 node 冒烟（global.window={} + require，断言计数/audios/文件存在）
```
===== c4s5 =====
GUIDE_DATA===C4S5_GUIDE: true
mode keys: ["refract"] count: 1
  [refract] steps:9 errors:3 free:4 tasks:0
  audio字段缺失: 无(全非空)
  未被audios映射覆盖的audio id: 无
audios keys count: 17
audios映射文件缺失: 无(全部存在)

===== c4s2 =====
GUIDE_DATA===C4S2_GUIDE: true
mode keys: ["refract"] count: 1
  [refract] steps:10 errors:3 free:4 tasks:0
  audio字段缺失: 无(全非空)
  未被audios映射覆盖的audio id: 无
audios keys count: 18
audios映射文件缺失: 无(全部存在)
```
对账设计书 §4/附C：c4s5 = 9 steps（s1~s9，s9 为 concl）/3 errors/4 free/17 audios ✅；c4s2 = 10 steps（s1~s9+concl）/3 errors/4 free/18 audios ✅。两实验均单场景 `refract`（GUIDE_CFG.mode='refract' 恒定，engine-core.js:399 优先读它，m1↔m2 切换不重播 intro）。

### 1.3 陷阱字段核查（设计书标注禁用字段，guide-data.js 零使用）
```
c4s5 R.prismDeg            : 0 命中
c4s5 R.source.on           : 0 命中
c4s2 R.showRead            : 0 命中
```
✅ 三个陷阱字段全部零引用（真实字段分别用 R.prism.deg / R.sourceOn / —）。

### 1.4 `git status --short`（我的足迹）
```
 M content/physics_g8_v1_c4_s2/exp-reflect.html      ← 本轮我改
 M content/physics_g8_v1_c4_s5/exp-dispersion.html   ← 本轮我改
?? content/physics_g8_v1_c4_s2/guide/                ← 内含 guide-data.js(我建) + audio/18mp3(前轮配音)
?? content/physics_g8_v1_c4_s5/guide/                ← 内含 guide-data.js(我建) + audio/17mp3(前轮配音)
```
`git diff --stat` 我的两 html：c4s2 +25/-… 共 29 insertions/19 deletions（两文件合计）；`exp-reflect-render.js`/`exp-reflect-core.js`/`exp-dispersion-render.js`/`exp-dispersion-core.js`/`_lib/guide/` 的 `git diff --stat` **全空 = 零触碰** ✅。

### 1.5 html diff 核对（五件套顺序 / hint 删除 / ?v= bump / 移动三件）
两页一致，以 c4s5 为例（c4s2 同构，宿主多一个 exp-reflect-audio.js）：
```
47:<link rel="stylesheet" href="../_lib/guide/guide-core.css?v=20261027n1">   ← head，既有<style>之后
111:<script src="exp-dispersion-core.js?v=20261027n1"></script>              ← 宿主最后一个 core/render
112:<div id="guide-layer">…</div>                                            ← 五件套①容器
113:<script>window.GUIDE_CFG={state:window.DSP,mode:'refract'};</script>     ← ②内联(core之后,DSP已存在)
114:<script src="guide/guide-data.js?v=20261027n1"></script>                 ← ③(末尾双赋值GUIDE_DATA)
115:<script src="../_lib/guide/engine-core.js?v=20261027n1"></script>        ← ④
116:<script src="../_lib/guide/vB-core.js?v=20261027n1"></script>            ← ⑤
```
c4s2：`GUIDE_CFG={state:window.RFX,mode:'refract'}`，五件套在 `exp-reflect-core.js`(103) 之后 104~108 行，顺序同上 ✅。
- **?v= bump**：两页既有全部 `?v=20261024` → `20261027n1`（c4s5 四件宿主脚本；c4s2 五件宿主脚本含 audio.js），新增五件套亦带 `?v=20261027n1` ✅。
- **删橙色解说条**：header `<span id="hint" class="hint">…</span>` 整段删除 + `<style>` 的 `.hint{…}` 规则删除；标题文字（「光的色散」/「光的反射」）保留。
  - 安全性核实：两 core 均有 `hintEl` 空守卫——c4s5 `exp-dispersion-core.js:65 if(!hintEl)return;`；c4s2 `exp-reflect-core.js:105 if(!hintEl)return;` 及 178/181/185 `if(hintEl){…}`。删 `#hint` 后 `hintEl=null`，全部走守卫，**不报错**（浏览器实测 console 0 已证）。
  - 物理现象文案未误删：两页 hint 均为纯操作指引（「棱镜角度滑杆=转棱柱…」「点激光笔红钮/太阳开关光源…」），属解说条，按蔡总拍板删除；无「气泡」类实验内容描述。
- **移动兼容三件**：① viewport 补 `maximum-scale=1, user-scalable=no`；② `html,body` 补 `-webkit-tap-highlight-color:transparent`；③ 交互 canvas `canvas#scene` 补 `touch-action:none`。
  - dvh 回退：两页 `#scene-wrap`/`.scene-wrap` 均为 `position:fixed;top:34px;left:0;right:0;bottom:0` 固定布局，**无 100vh，按任务书如实记录不需要 dvh 改动**。

### 1.6 mp3 `curl -sI` 抽查（每实验 ≥3 条 = 200）
```
c4s5-intro.mp3 : HTTP/1.0 200 OK      c4s2-intro.mp3 : HTTP/1.0 200 OK
c4s5-s1.mp3    : HTTP/1.0 200 OK      c4s2-s1.mp3    : HTTP/1.0 200 OK
c4s5-s9.mp3    : HTTP/1.0 200 OK      c4s2-concl.mp3 : HTTP/1.0 200 OK
c4s5-e1.mp3    : HTTP/1.0 200 OK
```
注：c4s5 **无名为 concl 的 clip**——其结论步音频 = `c4s5-s9`（17 条 = intro/s1~s9/e1~e3/f1~f4）。任务书 §3.4 样例写「concl」对 c4s5 会 404，属命名差异非缺陷，已改用 s9（200）。c4s2 有独立 `c4s2-concl`（18 条）。

---

## 2. c4s5 色散 · 浏览器实测矩阵（全绿）

工具：Playwright 1.62.1（npx 缓存）驱动 chromium-1223「Google Chrome for Testing」headless，`http://localhost:8848/content/...`。状态置入用 `evaluate` 改 `window.DSP` + `dispatchEvent`（任务书 §3.5 认可）。

| 项 | 结果 | 证据 |
|---|---|---|
| 5a 启动层出现 | ✅ | `--autoplay-policy=user-gesture-required` 强制拦截下 `.gvb-start` visible=true（默认策略下 Chromium 偶发放行 autoplay→不弹启动层，属浏览器启发式，非缺陷；intro 仍发声+字幕） |
| 5a intro 真实发声+字幕 | ✅ | 字幕逐字=「欢迎来到色散实验室！…点亮光源一探究竟吧。」；点击启动层后 `c4s5-intro.mp3` resource entries 1→2（拦截+点击重播） |
| 5b s1 开光源 | ✅ | 点 `#btn-light`→字幕「点亮啦！一束白光直射向三棱镜。」 |
| 5b s2 七色光带（after:s1@6000） | ✅ | 字幕「看！白光在墙上散开成红橙黄绿蓝靛紫七色光带啦。」 |
| 5b s3 色散原理（after:s2@8000） | ✅ | 字幕「为什么会分开？各色光通过棱镜时，偏折程度不一样呀。」 |
| 5b s4 标签 | ✅ | 点 `#cb-labels`→「打开标签看得清：紫光偏折最大，红光偏折最小。」 |
| 5b s5 拖棱镜 | ✅ | `evaluate DSP.prism.x=DSP.W*0.45`→「拖动棱镜沿桌子走，离墙距离变了，光带宽窄也跟着变。」 |
| 5b s6 切三原色 | ✅ | 点 `#mode-m2`→「切到三原色啦！红、绿、蓝就是色光三原色。」 |
| 5b s7 三满=白（after:s6@6000） | ✅ | 「记住：红绿蓝三色拉到最满，混出来就是白光！」 |
| 5b s8 红+绿=黄 | ✅ | `#b-slider`→0 dispatch input（R255 G255 B0）→「神奇吧？红光加绿光，居然混出了黄光！」 |
| 5d concl s9（after:s8@6000） | ✅ | 「因此我们得出结论：白光是多种色光混合成的复色光…」+ `c4s5-s9.mp3` entries=1 |
| 5c 纠错 e1 橙色字幕 | ✅ | sourceOn=false 时 `#prism-slider` dispatch input→`.gvb-caption` 带 `err` 类、抖动，字幕=「不对哟～先点亮光源，才看得见光带往哪儿偏呀。」 |
| 5e 浮标三态循环 | ✅ | 点 `.gvb-fab`：mode-text/🔇 → mode-sleep/💤 → mode-voice（无角标） |
| 5f repeat s1 重播 | ✅ | 回 m1→关灯→冷却 3.6s（>REP_COOLDOWN 3s）→开灯：s1 字幕重现，`c4s5-s1.mp3` entries 2→3 |
| 5g console 0 报错 | ✅ | 桌面全程 console error + pageerror 双通道均空 |
| 5g 移动 375×667 无横向溢出 | ✅ | scrollWidth=375 ≤ innerWidth=375；移动上下文 console 0 |
| 陷阱字段零使用 | ✅ | guide-data.js 中 `prismDeg`/`source.on` 0 命中 |

**原有交互零退化**：`#btn-light`/`#cb-labels`/`#mode-m1`/`#mode-m2`/`#prism-slider`/`#b-slider` 逐一操作均正常驱动对应 step（=core 处理器未受影响）；重置/静音/全屏钮未破坏。

---

## 3. c4s2 反射 · 浏览器实测矩阵（8/10 steps，2 条被引擎阻塞）

| 项 | 结果 | 证据 |
|---|---|---|
| 5a 启动层出现 | ✅ | `.gvb-start` visible=true（默认策略下本页被拦截，弹出启动层） |
| 5a intro 发声+字幕 | ✅ | 字幕=「欢迎来到光的反射实验室！…等你亲手找出来！」；`c4s2-intro.mp3` entries=2（拦截+点击重播） |
| 5b s1 开激光（15.5s 闸门） | ✅ | 等 `G.t-G.modeEnterT>15500` 后置 `RFX.laserOn=true`→「激光开啦！这束红光射向平面镜，叫入射光线。」（s1 闸门 15500=intro 14.5s+1s，工作正常） |
| 5b s2 入射点 O（after:s1@6000） | ✅ | 「光打在镜面的 O 点——入射点；反射光也从 O 射出。」 |
| 5b s3 改入射角（event:input:#ang-slider） | ✅ | `#ang-slider` dispatch input（laserOn=true）→「拖动滑杆改入射角，看反射角马上跟着变！」（热修#3 事件型 steps 分支生效） |
| **5b s4 法线** | **❌ 引擎阻塞** | `G.angChangeCount=undefined`（`GuideEngine.getG()` 实测）→ trigger `…&& G.angChangeCount>=1 && …` 恒假 → s4 字幕永不出现。根因见 §5 阻塞① |
| **5b s5 验证∠r=∠i** | **❌ 连带** | trigger=`after:c4s2-s4@6000`，s4 死 → `fireCount['c4s2-s4']` 恒 0 → s5 永不排程。根因同 §5 阻塞① |
| 5b s6 三线共面（fold>0） | ✅ | `#fold-slider`→40 dispatch input→「纸板一折，反射光不在折起的纸板上——三线共面！」 |
| 5b s7 光路可逆 | ✅ | 点 `#btn-reverse`（电平 `R.pulse.reverse===true`，非 event:click，避 capture 反语义）→「光路可逆！沿原反射光路射入，光就沿原入射路射出。」 |
| 5b s8 镜面反射（beam） | ✅ | beam radio dispatch change（pulse 静止态）→「平行光照镜面，反射光仍平行——这是镜面反射。」 |
| 5b s9 漫反射（rough>0） | ✅ | `#surface`→rough dispatch change（syncSurface 置 rough=40）→「表面变粗糙，反射光散向四面八方——漫反射。」 |
| 5d concl（after:s9@6000） | ✅ | 「记住啦：三线共面、分居法线两侧、反射角等于入射角；镜面反射和漫反射都遵守反射定律，光路还可逆！」+ `c4s2-concl.mp3` entries=1 |
| 5c 纠错 e1 橙色字幕 | ✅ | laserOn=false 时 `#ang-slider` dispatch input→`err` 类橙字幕=「不对哟～先点激光笔的红钮开光，再改入射角呀。」 |
| 5e 浮标三态循环 | ✅ | mode-text/🔇 → mode-sleep/💤 → mode-voice |
| 5g console 0 报错（净序） | ✅ | 规避「beam+pulse 同帧」预存 bug 的净序全矩阵下，console error + pageerror 双通道全空（0 errors） |
| 5g 移动 375×667 无横向溢出 | ✅ | scrollWidth=375 ≤ innerWidth=375；移动 console 0 |
| 陷阱字段零使用 | ✅ | guide-data.js 中 `showRead` 0 命中 |

**原有交互零退化**：`#ang-slider`/`#fold-slider`/`#surface`/beam radios/`#btn-reverse`/`#btn-reset` 逐一操作均正常驱动对应 step；唯一 console 报错来自预存 render bug（§5 阻塞②），与语音层及我的改动无关。

---

## 4. 回归（全过）

| 页 | 结果 | 证据 |
|---|---|---|
| c4_s4 `exp-refract.html` | ✅ | 加载 + 驻留 2.5s，console error + pageerror 双通道 0 报错（共享库未被本轮破坏） |
| c4_s3 `exp-mirror-vB.html` | ✅ | 同法 0 报错（该页用本地 `guide/engine.js`+`C4S3_SCRIPT`，不走 GUIDE_DATA） |

---

## 5. 两个红线阻塞（禁改文件，未修，待派热修单）

### 阻塞① engine-core 未实现设计书附 A 适配点 A5 → c4s2 s4/s5 死
- **现象**：`window.GuideEngine.getG().angChangeCount === undefined`；c4s2-s4 trigger 逐字含 `G.angChangeCount>=1 && (G.t-G.lastAngChangeT)>800`，恒假 → s4 永不触发 → `after:c4s2-s4@6000` 的 s5 连带永不排程。
- **根因**：冻结的 `_lib/guide/engine-core.js` `updateG()`（L86-122）只采集 c4s3 专属手势计数 `objChangeCount`（监听 `R.doCm`）与 `eqMoveGestureCount`（监听 `R.eqState`）；`resetG()`（L68-73）初始化 G 时**无** `angChangeCount`/`lastAngChangeT`。全文件对 `angChangeCount|lastAngChangeT|angleI` **零命中**（grep 已证）。设计书 c4s2 §附A A5 明确要求「监听 `R.angleI` 采集 `G.angChangeCount/G.lastAngChangeT`」，但通用引擎落地时未把该适配点泛化。
- **热修方向（engine-core，一行级泛化）**：在 `updateG()` 增加对 `R.angleI` 的边沿计数（镜像 L101-108 的 `objChangeCount` 逻辑，350ms 武装），写 `G.angChangeCount`/`G.lastAngChangeT`；`resetG()` 补 `angChangeCount:0,lastAngChangeT:0`。修后 c4s2 数据层零改动即自动复验 s4/s5。
- **纪律**：本轮 trigger 逐字照抄设计书（红线），未为绕开 bug 改写 s4；红线禁改 `_lib/guide/`，故未修，上报。

### 阻塞② exp-reflect-render.js:150 `incDir` 越界 → 「平行光束+光路可逆」每帧抛错（预存历史 bug）
- **现象**：`reflect draw: ReferenceError: incDir is not defined at R.draw (exp-reflect-render.js:150) at loop (exp-reflect-core.js:50)`；纯状态注入（`RFX.laserOn=true; beamMode='beam'; pulse.active=true`）700ms 内抛 50 次（每帧）。
- **根因**：`render.js:140` 脉冲光点块 `if(R.laserOn && R.pulse.active)` 内，`beamMode==='beam'` 分支（L145-159）第 150 行 `var p1={x:x-incDir.x*R.L*1.35, …}` 引用 `incDir`，但 `incDir` 只在**另一函数** `drawBeam()`（L92 `var incDir={…}`）内定义，此作用域无该变量；同分支 L151 及 single 分支 L161 都用内联 `{x:Math.sin(a),y:Math.cos(a)}`，唯 L150 漏写成 `incDir`。
- **正常 UI 可复现**：开激光 → 点「光路可逆」(core:84 置 `pulse.active=true`) → 切「平行光束」→ 每帧抛错。
- **与语音层无关**：错误栈仅 `render.js`/`core.js` 两帧，**零** `guide-data.js`/`engine-core.js`/`vB-core.js` 帧（隔离测试已断言 `语音层三件涉入=false`）；引擎只读 `window.RFX` 从不写。`git diff` 证 render.js 本轮零触碰 = 预存 bug。
- **热修方向（render js，另立单）**：脉冲块顶部补 `var incDir={x:Math.sin(a),y:Math.cos(a)};`，或把 L150 的 `incDir` 换成内联（与 L151 一致）。红线禁改 render js，故未修，上报。

---

## 6. 与任务书/盘点的差异（如实记录）

1. **audio 未 commit**：任务书 §3.2 假设「audio 已 commit 过」，实际 `git status` 中两实验整个 `guide/`（audio/*.mp3 + 我新建的 guide-data.js）均为 `??` 未跟踪。故 `??` 不止「两 guide-data.js」，而是 `?? content/physics_g8_v1_c4_s{2,5}/guide/`（git 折叠未跟踪目录）。我的新增文件确为两 guide-data.js（`--untracked-files=all` 已逐一列出：c4s5 17mp3+guide-data.js、c4s2 18mp3+guide-data.js）。
2. **共享工作树有并发改动（非本轮我改）**：`git status` 另有 `M c3_s1~s4/exp-*-{core.js,html}`、`M c4_s1/exp-{medium,shadow}-{core.js,html}` 共 12 个文件，系并行的「16 实验铺路」工作流所改，**非本任务书 W1 足迹**。本轮我的 `M` 仅 `c4_s2/exp-reflect.html` + `c4_s5/exp-dispersion.html` 两个。
3. **c4s5 无 concl 命名 clip**：结论步音频 = `c4s5-s9`（见 §1.6）。
4. **c4s5 启动层在默认 autoplay 策略下非必现**：Chromium 偶发放行 autoplay 时不弹启动层（intro 仍发声+字幕，5a 实质达标）；用 `--autoplay-policy=user-gesture-required` 强制拦截可确定性复现启动层+点击重播（recheck A 全 PASS）。c4s2 默认即弹启动层。属浏览器 autoplay 启发式，非接线缺陷。

---

## 7. 改动清单（逐文件）

**新建**
- `content/physics_g8_v1_c4_s5/guide/guide-data.js`：设计书 §5 逐字照抄 `window.C4S5_GUIDE={refract:{intro,steps×9,errors×3,free×4,tasks:[]},audios×17}` + 末尾 `window.GUIDE_DATA=window.C4S5_GUIDE;`
- `content/physics_g8_v1_c4_s2/guide/guide-data.js`：设计书 §5 逐字照抄 `window.C4S2_GUIDE={refract:{intro,steps×10,errors×3,free×4,tasks:[]},audios×18}` + 末尾 `window.GUIDE_DATA=window.C4S2_GUIDE;`

**修改 `content/physics_g8_v1_c4_s5/exp-dispersion.html`**
- head：viewport 补 `maximum-scale=1,user-scalable=no`；`html,body` 补 `-webkit-tap-highlight-color:transparent`；`canvas#scene` 补 `touch-action:none`；删 `.hint{…}` 规则；`</style>` 后加 `guide-core.css?v=20261027n1`
- body：header 删 `<span id="hint" class="hint">…</span>`（标题「光的色散」保留）
- 宿主 4 脚本 `?v=20261024`→`20261027n1`；`exp-dispersion-core.js` 后加五件套（guide-layer div → GUIDE_CFG{state:window.DSP,mode:'refract'} → guide-data.js → engine-core.js → vB-core.js）

**修改 `content/physics_g8_v1_c4_s2/exp-reflect.html`**
- 同 c4s5 的 head/body/移动三件/删 hint（标题「光的反射」保留）
- 宿主 5 脚本（含 exp-reflect-audio.js）`?v=`→`20261027n1`；`exp-reflect-core.js` 后加五件套（GUIDE_CFG{state:window.RFX,mode:'refract'}）

**零触碰（git diff 为空）**：`_lib/guide/{engine-core.js,vB-core.js,guide-core.css}`、两实验 `*-core.js`/`*-render.js`/`*-audio.js`、c4_s3/c4_s4 全目录。

=== DONE ===
报告路径：docs/voice-wave-W1-report.md

# c4s3 平面镜成像 · 四变体讲解层开发报告

> 任务书：c4s3 四变体讲解层（vA/vB/vC/vD + hub）；设计书=docs/c4s3-guide-variants-design.md（唯一数据源）
> 日期：2026-10-26 · 分支 main · 未 commit / 未 push（按红线）
> 结论：12 个交付文件全部新建完成，验收 7 条自验通过（浏览器视觉行为待主会话验收），生产文件零改动。

---

## 1. 交付文件清单（全部新建，白名单内）

| 文件 | 行数 | 说明 |
|---|---|---|
| content/physics_g8_v1_c4_s3/guide/script.js | 179 | 数据层：§0.2 结构 + §1 步骤19 + §2 纠错12 + §3 任务11 + §4 音频34 + §5 序列20 + §7 自由玩14 |
| content/physics_g8_v1_c4_s3/guide/engine.js | 366 | 共享触发引擎：G 字段采集、rAF 轮询、边沿/电平/延时/持续@/事件类触发、任务链推进、Caption 字幕条组件 |
| content/physics_g8_v1_c4_s3/guide/vA.js | 114 | A 任务链版皮肤（老师卡+POE 选项+庆祝条+可折叠） |
| content/physics_g8_v1_c4_s3/guide/vB.js | 64 | B 语音版皮肤（D 版字幕条 + audio 播放 + guide-mute 独立静音钮） |
| content/physics_g8_v1_c4_s3/guide/vC.js | 310 | C 分步引导版皮肤（SVG mask 聚光灯挖洞 + DOM 脉冲圈 + 进度条 + 绿闪 + 退出引导） |
| content/physics_g8_v1_c4_s3/guide/vD.js | 34 | D 字幕解说版皮肤（蔡总方案；intro/steps/errors/free 全走字幕条） |
| content/physics_g8_v1_c4_s3/guide/guide.css | 177 | 四变体共用样式（字幕条/气泡/高亮/面板/遮罩/庆祝条，命名空间 .guide-*） |
| content/physics_g8_v1_c4_s3/guide/hub.html | 78 | 对比入口页（四卡 + 原版链接，浅底圆角卡，移动端竖排） |
| content/physics_g8_v1_c4_s3/exp-mirror-vA.html | 143 | 变体页（exp-mirror.html 副本+叠加层） |
| content/physics_g8_v1_c4_s3/exp-mirror-vB.html | 143 | 同上 |
| content/physics_g8_v1_c4_s3/exp-mirror-vC.html | 143 | 同上 |
| content/physics_g8_v1_c4_s3/exp-mirror-vD.html | 143 | 同上 |

架构按任务书 §2：变体页 = 原页完整副本 + `#guide-layer` 叠加容器（内容由皮肤运行时注入）+ 三行 guide script；引用顺序 props.js → sfx.js → render → core → script.js → engine.js → v{X}.js；guide 引用带 `?v=20261026g1`；render/core 在副本里 bump 为 `?v=20261026g1`（原文件不动）；props/sfx 保持 `?v=20261024`（任务书只要求 bump core/render）；`.back` → `./guide/hub.html`。

## 2. 验收 7 条逐条证据

### ① node --check 全部 6 个新 js 通过
```
OK guide/script.js  OK guide/engine.js  OK guide/vA.js  OK guide/vB.js  OK guide/vC.js  OK guide/vD.js
（末轮复跑 ALL-CHECK-OK，engine.js 修 bug 后重查通过）
```

### ② 4 个变体 html 与 exp-mirror.html diff 仅限白名单四类
`diff exp-mirror.html exp-mirror-v{A,B,C,D}.html` 输出（四页一致，仅 v{X}.js 名不同）：
```
55a56  > <link rel="stylesheet" href="guide/guide.css?v=20261026g1">          ← guide 引用块
60c61  < <a class="back" href="./index.html">← 返回实验卡页</a>
       > <a class="back" href="./guide/hub.html">← 返回对比入口</a>            ← back 链接
135,136c136,141
       < render.js?v=20261024 / core.js?v=20261024
       > render.js?v=20261026g1 / core.js?v=20261026g1                        ← ?v= 参数
       > <div id="guide-layer">…</div> + script.js/engine.js/v{X}.js 三行      ← 叠加层 DOM
```
除上述外零差异（原 138 行结构/样式逐行保留）。

### ③ 生产文件零改动
`git status --short`：13 个 `??` 全部为本单新文件（含会话开始前已存在的 .DS_Store），**无任何 M 状态**。exp-mirror.html / exp-mirror-core.js / exp-mirror-render.js / index.html / explain.html 等零触碰。

### ④ script.js 数据量对账（node 加载实测）
```
steps=19 errors=12 tasks=11 free=14 intro=3
cSequence: m1=8 m2=6 m3=6 total=20
audios=34（audio refs=34, missing-in-table=0, missing-file=0, bad-path=0）
```
与任务书要求 19/12/11/14/3/20/34 完全一致。

### ⑤ 文案与设计书逐字一致
自动化全量比对（node 脚本把 script.js 每条 text 在设计书原文中做子串匹配，设计书侧仅剥离 markdown 加粗符 `**`）：
```
texts checked, missing-in-doc=0   ← intro3 + say19 + fix12 + note14 + 题干/选项/praise/retry 33 + focus20 全部命中
trigger 表达式归一化比对: missing=1（仅 m1-free5，设计书原文为文字描述「R.matched===true 再次达成（第二次以后重合）」，
  实现为 R.matched===true && G.matchedEdgeCount>=2，见 §4 决策点 2）
task done 表达式比对: missing=0
```
抽查对照一：§1 M1 8 条步骤（trigger | 解说词，与设计书表格逐字一致）：

| id | trigger | say |
|---|---|---|
| m1-s1 | R.objLit===true && R.eqState==='off' && !G.everMatched | 点燃啦！看玻璃板里，出现了一支蜡烛的像。 |
| m1-s2 | R.objLit && !R.eqOn && G.objChangeCount>=1 && Math.abs(R.doCm-G.do0)>=2 | 蜡烛移远，像也跟着移远，大小可没变哦。 |
| m1-s3 | R.eqOn===true && (R.eqState==='tray'\|\|R.eqState==='held') | 等效蜡烛拿出来了，把它拖到玻璃板后面去。 |
| m1-s4 | R.eqState==='placed' && !R.matched && R.eqDo>=0 | 慢慢挪，让它跟板里的像完全重合。 |
| m1-s5 | R.matched===true && !G.everMatched | 重合了！像和物等大，到镜面距离也相等。 |
| m1-s6 | G.recCount===1 | 记下第一组！物距和像距是不是相等呀？ |
| m1-s7 | G.recCount===2 | 换个物距再做一次，规律还成立吗？ |
| m1-s8 | G.recCount>=3 | 三组数据都说明：等大、等距、对称、虚像！ |

抽查对照二：§2 全部 12 条纠错（trigger | 纠错词，逐字一致；`**` 为设计书排版加粗符已剥离，与 §4 音频稿一致）：

| id | trigger | fix |
|---|---|---|
| m1-e1 | R.eqState==='placed' && R.eqDo<0 | 不对哟～等效蜡烛要放到玻璃板后面，像在那边呢。 |
| m1-e2 | event:click:#btn-rec:R.objLit===false | 不对哟～先点蜡烛点燃，才有像可以记录呀。 |
| m1-e3 | event:input:#obj-slider:R.objLit && !R.eqOn && !G.eqEverOn && G.objChangeCount>=2 | 别急哟～先开「等效蜡烛」找到像的位置，再换物距。 |
| m1-e4 | R.eqState==='placed' && !R.matched && Math.abs(R.eqDo-R.doCm)>3@2000 | 差一点啦～像在板后跟物对称的位置，距离相等哦。 |
| m1-e5 | event:click:#btn-rec:G.recCount>=3 | 记录表满啦～点「清除」腾出空行再记吧。 |
| m2-e1 | R.m2.screen.state!=='tray' && !R.m2.showRay | 不对哟～先打开「入射-反射线」，再拖光屏去试。 |
| m2-e2 | R.m2.showExt===true && !R.m2.showRay@2000 | 不对哟～先开入射-反射线，反向延长线才有依托呀。 |
| m2-e3 | R.m2.eye.state==='placed' && !R.m2.showRay | 没有光线可接收，眼睛看不到像哟～先开光线显示。 |
| m2-e4 | R.m2.screen.state==='placed' && !R.m2.screenAtSp && R.m2.showExt@2000 | 把光屏放到虚线交点 S′ 那里，看能不能承接到像。 |
| m3-e1 | R.m3.showPath===true && (R.m3.top.state!=='slot' \|\| R.m3.bottom.state!=='slot') | 不对哟～先把两块镜子都装进卡槽，光才有得反射。 |
| m3-e2 | R.m3.path && R.m3.path.wall | 光打到管壁上去啦～把角度调回 45° 试试。 |
| m3-e3 | R.m3.top.state==='placed' \|\| R.m3.bottom.state==='placed'@1500 | 镜子没进卡槽哟～把它拖到卡槽圆圈里才算装好。 |

（m1-e2/e5 的「点击 #btn-rec 时判态」按任务书 §2.3 用 capture 阶段 click 监听即时判定，先于 core 的 recFill，读到点击前状态；m1-e3 同理挂 #obj-slider input capture。持续≥Ns 用 `@N` 后缀编码，engine 首满足计时、中断清零。）

### ⑥ 本地起服务实测
`python3 -m http.server 8765`（仓库根，仍在运行供主会话浏览器验收）。curl 实测：
```
200 exp-mirror-vA.html   200 exp-mirror-vB.html   200 exp-mirror-vC.html   200 exp-mirror-vD.html
200 guide/hub.html       200 guide/script.js?v=20261026g1   200 guide/engine.js?v=20261026g1
200 guide/vD.js?v=20261026g1   200 guide/guide.css?v=20261026g1   200 guide/audio/c4s3-m1-intro.mp3
```
JS 报错排查（node 环境可查部分）：
- 全部 trigger/done/高亮字段路径表达式编译冒烟：`compiled exprs=99 bad=0`；
- engine 全链路 DOM-stub 冒烟测试（/tmp/c4s3_engine_smoke.js，非交付物）：
```
events: intro:m1 mode:m1 step:m1-s1 error:m1-e1 step:m1-s4 free:等效蜡烛和像还没重合，位置差了一点。
        step:m1-s5 intro:m2 mode:m2 step:m2-s1 error:m2-e2 intro:m3 mode:m3 step:m3-s2 step:m3-s3
        step:m3-s4 step:m3-s5
SMOKE PASS (17 events, 0 fails)
```
覆盖：三模式 intro 沿、步骤边沿只发一次、电平纠错、@2s 持续纠错（未满足不触发/满足后触发）、free 中性解说、delay:2000 延时步、after:m3-s4@1500 链式延时、任务链 predict 答对→done 满足→推进。冒烟测试还抓到并修复 1 个真 bug：节流表 `||0` 兜底 + `performance.now()` 从页面加载起算 → 加载后前 5s 内纠错/自由玩会被误吞；改为 null 判定首放行（engine.js `throttle()`）。
浏览器行为（字幕条动画/音频解锁/聚光灯视觉/任务卡交互）node 查不了，**待主会话浏览器验收**（见 §5）。

### ⑦ 音频对账
```
ls guide/audio | wc -l = 34
audio refs=34  missing-in-table=0  missing-file=0  bad-path=0
```
vB 经 `C4S3_SCRIPT.audios` 表引用，表值一律 `guide/audio/{id}.mp3`，与磁盘文件名一一对应；未重新生成任何音频。

## 3. 只读纪律自查
- engine/皮肤对 `window.MRR` 只读（全文无 `R.xxx=` 赋值；G 为 engine 闭包私有，经 new Function 参数注入，不挂 window）。
- 未调用 core 内部函数（core 为 IIFE 也无从调起）；事件监听全部 capture/被动读取，不 preventDefault、不拦截原逻辑。
- 叠加层 `#guide-layer` 及皮肤元素 pointer-events 受控（字幕条/聚光灯 none；老师卡/按钮 auto），不挡 canvas 拖放。

## 4. 偏差与自行决策点（均有依据）
1. **特殊 trigger 编码**：`delay:2000`（任务书 §2.3 指定值，对应设计书「intro 后延时约2s」）、`@2000/@1500` 持续后缀（任务书 §2.3 指定语法）、`after:m3-s4@1500`（m3-s5 设计书原文即「m3-s4 触发后延时约1.5s」的文字描述，编码为链式延时）、`event:click:#btn-rec:expr` / `event:input:#obj-slider[:expr]`（m1-e2/e3/e5 与两条自由玩的「点击/拖动时」语义）。
2. **m1-free5**：设计书原文「R.matched===true 再次达成（第二次以后重合）」为文字描述，实现为 `R.matched===true && G.matchedEdgeCount>=2`（engine 私有上升沿计数，第一次重合归 m1-s5，避免与步骤解说重复）。
3. **G 字段扩展**：§0.3 表格 7 字段之外，按设计书 trigger 原文需要补 `G.everLit`、`G.angleWasOff`、`G.matchedEdgeCount`、`G.*Said` 边沿标记（§1 trigger 原文即引用；任务书 §2.3 明确「以及 §1 各 *Said 边沿标记」）。`G.everMatched` 置位特意排在 tickSteps 之后，否则 m1-s5（`!G.everMatched`）永不触发——冒烟测试实证。
4. **objChangeCount 手势归并**：R.doCm 变化 + 350ms 静默武装，一次连续拖动（滑杆或 canvas 拖蜡烛）只计 1 次，防止单次拖动内误触发 m1-e3（`>=2` 语义=改了两次物距）。
5. **纠错词中的 `**` 加粗符与「」**：设计书 §2 表格用 `**后面**`、§4 音频稿无加粗；字幕文案取去加粗版（与音频稿同文）。「清除」等按钮名保留设计书 §2 的「」引号。
6. **C 版 done 对齐**：各步 done=本步聚焦说明对应的自身动作状态（如第2步勾 cb-ray → done=R.m2.showRay）；纯观察步（m2 第1步认识 S、m3 第4步确认角度、m3 第6步看画中画）done=null，走「下一步」按钮手动推进，避免入场即满足导致秒跳。m3 第1步 done=任一镜离开托盘（开始动手即推进）。
7. **m2 第4步 wedge 聚光**：反射光束区域取 `R.m2.wedgePoly` 外接矩形挖洞 + 托盘眼睛件（右槽）挖洞，即设计书「托盘眼睛件→箭头指向反射光束区域」的落地形态（洞旁气泡即指示）。
8. **vC 切模式重置**：任务书只要求 M2/M3 重置，实现统一三模式切回即重置（逻辑一致、无副作用）。
9. **vA 的 act/verify 不出选项**：按任务书 §2.4「act/verify 任务：气泡显示指令，engine 轮询 done」；数据层 options 保留（m1-t4/m2-t3/m3-t3 为 verify+选项，题干本身含问句，学生观察后 done 自动印证）。
10. **安全钩子提示说明**：写入时钩子对 `new Function` 与 `innerHTML` 报警——两者内容均为本仓库第一方静态数据（script.js 的设计书核实表达式 / 皮肤固定 DOM 骨架字符串），无用户输入、无网络数据，任务书 §2.3 明确指定 new Function 求值方案；无注入面。
11. **hub.html 风格**：未读 index.html（不在允许清单），按任务书文字描述「浅底圆角卡」自拟同风格实现。
12. **音频 autoplay**：vB 首条 intro 在首次交互前触发会被浏览器拦截，`play().catch(()=>{})` 静默失败、字幕照常（任务书 §2.4 预期行为）；guide-mute 只控讲解配音，与 core 的 btn-mute（SFX 音效）互相独立。

## 5. 未尽事项（待主会话/浏览器验收）
- 浏览器视觉与交互验收：D 版字幕条滑入/停留/橙色抖动、B 版音频首播解锁与 🔊/🔇、C 版聚光灯挖洞跟随拖动与绿闪、A 版老师卡折叠与选项置灰划线、移动端竖排。本地服务已起：`http://localhost:8765/content/physics_g8_v1_c4_s3/guide/hub.html`。
- vC 聚光灯在「退出引导」后不再恢复（按设计=回到自由态兜底，无重进按钮；如需重进可刷新页面）。
- 音频 34 条为既有资产未动；若蔡总换声线需重配，仅替换 guide/audio 同名文件即可，代码零改。
- 未 commit / 未 push（红线）；`.DS_Store` 为会话前已存在的系统文件，未纳入本单。

=== DONE === docs/c4s3-guide-variants-dev-report.md

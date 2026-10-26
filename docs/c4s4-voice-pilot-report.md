# c4s4 折射实验 · 语音讲解层试点接线报告（通用 guide-core 首跑）

> 日期：2026-10-27 ｜ 任务书：c4s4 接线单 ｜ 设计书：docs/c4s4-guide-design.md
> 改动面：新建 `content/physics_g8_v1_c4_s4/guide/guide-data.js`；修改 `content/physics_g8_v1_c4_s4/exp-refract.html`。红线全守：core/render/_lib 三件/c4_s3 零触碰，未 commit/push。

## 0. 总判定

**接线本身全部正确、静态验收全过；浏览器验收 5a/5c(字幕)/5d/5e/5g 及全部回归项 PASS；5b-s1、5f-repeat、s4 三项因共享引擎 `_lib/guide/engine-core.js` 两个既有 bug 不达标（红线禁改，未修）。判定：FAIL（被上游引擎阻塞）——需派 engine-core 热修单（两处一行级修复，见 §4），热修后本页无需改动即可复验通过。**

## 1. 静态验收（全过）

1. `node --check guide/guide-data.js` ✅
2. node 冒烟（`global.window={};require(...)`）输出：
   ```
   GUIDE_DATA===C4S4_GUIDE: true
   steps.length: 9        （8步+concl）
   errors.length: 3  free.length: 4  tasks.length: 0
   audios keys: 17
   audio字段缺失: 无(全非空)
   audios映射未覆盖的audio id: 无
   ```
3. `git status --short`：`M exp-refract.html`、`?? guide/guide-data.js`（另有仓库既有 `?? .DS_Store`，非本轮产物）✅
4. html diff 核对：hint span+`.hint{}` 规则删除 ✅；`?v=20261027n1` 共 8 处（既有 4 件 bump + guide-core.css/guide-data/engine-core/vB-core 4 件新增，多于任务书"6 个"系新增件也带 v 参数，如实记录）✅；五件套顺序=core.js 之后、cb-path 内联之前：`GUIDE_CFG 内联 → guide-data.js → engine-core.js → vB-core.js` ✅
5. mp3 `curl -sI` 抽查 4 条（intro/s3/concl/e2）全 `HTTP/1.0 200 OK` ✅
6. GUIDE_DATA 契约核实：engine-core.js 第 12~13 行 `GUIDE_CFG.state||MRR`、`GUIDE_DATA||C4S3_SCRIPT`；采用任务书允许的第二种写法——guide-data.js 末尾 `window.GUIDE_DATA=window.C4S4_GUIDE;` 双赋值，html 内联仅一行 `window.GUIDE_CFG={state:window.RR,mode:'refract'};`（位于 core.js 之后，window.RR 已存在）

## 2. 浏览器实测（Playwright 1.60 / chromium headless，http://localhost:8848）

| 项 | 结果 | 证据 |
|---|---|---|
| 5a 启动层出现→点击 | ✅ | `.gvb-start` rect=[0,0,1280,800] display:flex；首次 play-reject NotAllowedError→启动层弹出→点击后 1735ms `playing c4s4-intro.mp3` |
| 5a intro 真实发声+字幕 | ✅ | resource entries(c4s4-intro.mp3)=2（首次被拦+点击后重播）；字幕逐字=「欢迎来到光的折射实验台！…」；`.hint` 查询 null |
| 5b s1 开灯 | ❌ | **s1 实际触发并发声**（timeline 2744ms `play-call c4s4-s1.mp3`、2751ms `playing`、字幕「灯亮啦…」上屏），**但 2754ms 被 s3 误触发顶掉**（字幕停留仅 10ms）——根因见 §4 bug① |
| 5b s2 切玻璃 | ✅ | 字幕=「换成玻璃砖啦！…」+ c4s4-s2.mp3 资源加载 |
| 5b s3 拖滑杆 | ✅ | dispatch input→字幕=「入射角一变…」+ c4s4-s3.mp3；且插桩证实 s3 正常播放 6s（7724ms ended） |
| s4 垂直入射（加测，非验收单列项） | ❌ | iDeg=0 持续 >1.5s 无字幕无音频——根因见 §4 bug② |
| 5b s5/s6/s7/s8 | ✅×4 | 逐条字幕逐字匹配 + 对应 mp3 资源加载（虚线是法线/蓝弧是入射角i/还有一条淡淡的光/光路可逆） |
| 5c 纠错 e1 | ✅(字幕) | 重置后不开灯勾角度标签→橙色(`err:true`)抖动字幕=「不对哟～先点亮激光笔，有了光路才好研究角呀。」；e1 音频 fetch 已发起（play-call）但 ~16ms 后被 s6 打断致资源条目未落（中断的请求不进 Resource Timing，测试方法学局限+设计书互斥声明不成立，见 §5） |
| 5c 纠错 e2 | ✅ | 没开灯拖滑杆→「不对哟～先点亮激光笔，光都没射出去，看不到折射哟。」（e2 无 step 竞争，字幕完整驻留） |
| 5d concl | ✅ | s8 后 6s+ 字幕=「因此我们得出结论：…」+ c4s4-concl.mp3；after:s8@6000 fireCount/seenCount 机制工作正常 |
| 5e 浮标三态 | ✅ | 🔊voice(无角标)→🔇text(勾法线：字幕出现、s5 资源计数 1→1 不发声)→💤sleep(全静无字幕)→🔊voice |
| 5f repeat s1 | ❌ | 关灯→3.3s→开灯，s1 未再发声（entries 2→2）——同为 bug① 派生：s3 的 tickSteps 电平误判把 repPrev/repLast 状态搅乱+s1 即便重发也会被 s3 立刻顶掉（无法观测）|
| 5g console | ✅ | 桌面全程 0 报错（console error + pageerror 双通道均空） |
| 5g 移动 375×667 | ✅ | scrollWidth=375 ≤ innerWidth=375 零横向溢出；touch 上下文 0 报错 |
| free f4 重置 | ✅ | 字幕=「回到起点：水槽、入射角四十度、激光关闭。」 |

## 3. 回归（全过）

- **c4_s3 exp-mirror-vB.html**：console 0 报错 ✅（该页用本地 `guide/engine.js`+`C4S3_SCRIPT`，不走 GUIDE_DATA，共享库未被破坏；首轮脚本误用 `!!window.GUIDE_DATA` 断言属测试脚本写错，非页面问题）
- **c4s4 原有交互零退化**：拖笔身调角 iDeg 40→30 ✅；重置后 RR=`{medium:'water',iDeg:40,laserOn:false,showNormal:false,showAngles:false,showReflect:false,reverse:false}` ✅；全屏（pseudo-fs 降级路径生效）✅；静音钮 🔊→🔇 ✅
- 移动兼容三件如实记录：viewport 补 `maximum-scale=1,user-scalable=no`；`html,body` 补 tap-highlight 透明；`#cv` 既有 `touch-action:none` 未重复；`#scene-wrap` 为 `position:fixed;top:34px;bottom:0` 布局，**无需 dvh 改动**（按任务书如实记录不动）。

## 4. 引擎 bug（红线禁改 `_lib/guide/`，待派热修单）

**bug① tickSteps 不跳过 event 型步骤（阻塞级，本轮 3 项 FAIL 同源）**
`engine-core.js` tickSteps（第 165~166 行）`parseTrigger` 后只判 `p.delayMs/p.afterId/p.expr==null`，**缺 `if(p.evt)continue;`**（tickErrors 第 215 行、tickFree 第 237 行都有 `p.evt` 判断，唯独 tickSteps 没有）。event 型带闸门表达式的 step（s3 `event:input:#slider-i:R.laserOn===true`）被当普通电平型每帧求值闸门——激光一点亮，s3 在下一帧（10ms）误触发，即时打断制把 s1 字幕/音频腰斩。c4s3 未暴露此 bug 系其 event 型步骤闸门恰不在模式进入时为真。**热修=一行**：tickSteps 内 `if(!p)continue;` 后加 `if(p.evt)continue;/* 事件型由 bindEventTriggers 处理 */`。
铁证 timeline：`2744ms play s1 → 2751ms playing s1 → 2754ms play s3`（鼠标自始至终未接触滑杆，s3 唯一可能路径=tickSteps 电平求值）。

**bug② repeat:true + @hold 型步骤永不触发**
tickSteps hold 分支（第 193~195 行）要求 `!rPrev`（上一帧电平为假）才发火，但 hold 期间每帧 `repPrev[st.id]=v` 已置真，1500ms 到期时 `rPrev` 恒为 true → s4（`R.iDeg===0 && R.laserOn===true@1500`）永不触发。**热修方向**：hold 到期分支对 repeat 步骤去掉 `!rPrev` 前置（改为进入 hold 时记边沿），或与 c4s3 母版 engine.js 同逻辑核对后对齐。s4 不在验收单 5b 列项内，但设计书 §1 有此步骤，热修单应一并覆盖。

## 5. 其他发现（不阻塞）

- **设计书互斥声明不成立**（§1 尾注「s6 与 e1/e3 按 laserOn 真假分流不会同帧双响」）：s6 trigger=`R.showAngles===true` 无 laserOn 闸门，没开灯勾角度标签时 e1（capture 即时）与 s6（下一帧电平）**都会触发**，e1 被 16ms 打断。属设计书数据问题，本轮照抄红线未改，建议下轮设计书勘误（给 s6 加 `&& R.laserOn===true` 闸门或接受打断行为）。
- 测试方法学备忘（后续 16 实验验收脚本沿用）：被打断的音频 fetch 不落 Resource Timing 条目，音频断言须在字幕完整驻留后查或改查 play 调用日志；`position:fixed` 元素 `offsetParent===null`，可见性断言用 getBoundingClientRect。

## 6. 后续实验接线模板（试点定稿）

1. **head**：既有 `<style>` 之后加 `<link rel="stylesheet" href="../_lib/guide/guide-core.css?v=YYYYMMDDnN">`
2. **body 末尾**（ctrlbar 之后、宿主脚本之前）：`<div id="guide-layer"><!-- 语音讲解层容器：内容由 _lib/guide/vB-core.js 运行时注入 --></div>`
3. **脚本五件套顺序（严格）**：宿主 props/sfx/render/core（全部 bump v）→
   `<script>window.GUIDE_CFG={state:window.RX,mode:'模式key'};</script>`（必须在宿主 core 之后，状态对象已存在）→
   `<script src="guide/guide-data.js?v=…"></script>`（文件末尾自带 `window.GUIDE_DATA=window.XXX_GUIDE;` 双赋值）→
   `<script src="../_lib/guide/engine-core.js?v=…"></script>` → `<script src="../_lib/guide/vB-core.js?v=…"></script>` → 既有 cb-path 内联保持最后
4. **guide-data.js**：从设计书 §5 逐字照抄 `window.XXX_GUIDE={...}`，文件头注释标注设计书路径，末尾追加 GUIDE_DATA 双赋值一行
5. **删 hint**：header 的 `<span class="hint">…</span>` 整段 + `<style>` 的 `.hint{...}` 规则（操作指引由 intro 语音+字幕承担）
6. **移动兼容三件**：viewport 补 `maximum-scale=1,user-scalable=no`；`html,body` 补 `-webkit-tap-highlight-color:transparent`；交互 canvas 确认 `touch-action:none`（fixed 布局页无需 dvh）
7. **前置依赖**：engine-core 热修单（§4 bug①②）落地后方可批量铺开，否则每个含 event 型 step 的实验都会复现 s1 被顶掉问题

=== DONE ===
报告路径：docs/c4s4-voice-pilot-report.md

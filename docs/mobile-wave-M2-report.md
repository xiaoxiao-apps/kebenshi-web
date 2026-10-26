# 移动兼容波 M2 报告（c1_s1 + c1_s2 剩余 9 页移动兼容）

日期：2026-10-26 ｜ 执行：Qoder ｜ 范围：白名单 9 html（0 js 改动），未 commit/push

## 0. 盘点结论（先 grep 后动手）

对 9 页 html + 关联 js（measure-lab.js / lab.js / exp-common.js / fullscreen.js / exp-back.js）全量 grep：

```
mousedown|mousemove|mouseup|touchstart|touchmove|touchend 命中数 = 0（全部 9 页 + 全部关联 js）
```

**9 页无一含 mouse/touch 拖拽绑定，规格 2.1（pointer 收敛）本轮整体不适用（N/A）**。交互全部为
`click`（按钮/pill/tab/SVG 元素点选）+ `input`（range 滑杆、文本框）+ `resize`，均为触屏原生可用事件。
故本轮零 js 改动，只做 2.2 视口高度、2.3 防误触、2.4 布局核查。与 M1「五页手机拖不动」的根因不同，
这 9 页本就不存在拖不动问题。

## 1. 每页改动表

| 页 | canvas 交互页？ | 改动内容 | 实测结果（375×667 touch） |
|---|---|---|---|
| c1_s1/exp-estimate | 否（DOM 表单：input+select+按钮） | meta 补 `maximum-scale=1, user-scalable=no`；内联加 `html,body{-webkit-tap-highlight-color:transparent}` + `#fsEstimate.pseudo-fullscreen` dvh 覆盖；原内联全屏规则 `height:100vh` 加 `height:100dvh` 回退 | tap 检查→反馈条出现、tap 再来一题→清空重出题；375≤375 无溢出；console 0 错 |
| c1_s1/exp-task | 否（DOM 表格输入 + tab） | 同上（`#fsTask`；原内联 100vh 加 dvh 回退） | 填两次测量值→平均 25.5 自动算出；tap tab 切「时间测量」生效；375≤375；0 错 |
| c1_s1/exp-warmup | 否（SVG 展示 + 按钮，无 canvas） | 同上（`#fsPonzo/#fsCorner/#fsMuller` 三 wrap dvh 覆盖；原内联 100vh 加 dvh 回退） | tap 答题→反馈出现；tap 量一量→SVG 克隆叠合动画生成（ponzoTopClone 存在）；tap tab 切错觉三生效；375≤375；0 错 |
| c1_s1/exp-measure-lab | 否（iframe 整合壳，height:100% 无 100vh） | meta 补防缩放；内联加 tap-highlight；iframe data-src 中本轮已改的 warmup/estimate/task 三子页 `?v=20261024→20261026m2`（ruler/stopwatch 属 M1 白名单外禁碰，保持 20261024 原样） | iframe 懒加载生效；tap tab 切「估测挑战」→对应 frame active、data-src 带 20261026m2；375≤375；0 错 |
| c1_s2/exp-harvester | canvas 展示页（动画 canvas 无 pointer 交互；控件=pill/滑杆/按钮） | meta 补防缩放；内联加 tap-highlight + `#fsHvWrap.pseudo-fullscreen` dvh 覆盖 | canvas 计算样式 touch-action=none（common.css 既有规则命中）；tap 参照物 pill→结论条「静止」联动；tap 出发→「⏸ 暂停」；滑杆拖到 500→t=5.0s；印记开关→「开」；375≤375；0 错 |
| c1_s2/exp-lab | 否（iframe 整合壳） | meta 补防缩放；内联加 tap-highlight；四子页 data-src `?v=` 全升 20261026m2 | tap tab 切「列车错觉」→frame active；4 个 data-src 均带 20261026m2；375≤375；0 错 |
| c1_s2/exp-motion | canvas 展示页（状态机由按钮/滑杆驱动，canvas 本身无 pointer 交互） | meta 补防缩放；内联加 tap-highlight + `#fsMoWrap.pseudo-fullscreen` dvh 覆盖 | canvas touch-action=none；tap「▶ 观察彗星」→「⏳ 观察中…」→4s 播完自动进「▶ 观察猎豹」+ 回放轴出现；375≤375；0 错 |
| c1_s2/exp-reference | SVG 点选交互页（click 街景元素设参照物，非拖拽） | meta 补防缩放；内联加 tap-highlight + `#fsRefWrap.pseudo-fullscreen` dvh 覆盖；`.svg-scene` 加 `user-select:none; -webkit-user-select:none; -webkit-touch-callout:none`（点击目标区防长按选中/呼出，场景内无可复制文本） | tap SVG 树→refRing opacity=1 + 结论条「以【树木】为参照物，汽车…运动」；tap pill 切目标生效；svg 计算样式 user-select=none；375≤375；0 错 |
| c1_s2/exp-train | canvas 展示页（状态机由按钮/pill 驱动） | meta 补防缩放；内联加 tap-highlight + `#fsTrainWrap.pseudo-fullscreen` dvh 覆盖 | canvas touch-action=none；tap 两步进 PEEK→1.2s 动画后「站台没有动」提示 + 参照物 pill 出现；tap「旁边列车」+ 结论→「运动」徽标；375≤375；0 错 |

dvh 覆盖写法与 M1 完全一致：共享 common.css 的 `.pseudo-fullscreen{height:100vh !important}` 属禁改文件，
故各页内联 `<style>`（位于 link 之后）加 `#fsXxxWrap.pseudo-fullscreen { height:100vh !important; height:100dvh !important; }`
（ID 特异性 + 后置，覆盖成立）；页内自有 `height:100vh` 规则（estimate/task/warmup）原地加 `height:100dvh` 回退行。

### 2.4 桌面专属布局核查
9 页 html/css grep `min-width:≥1000px`、固定 `width:≥1000px` 均 0 命中；common.css 自带
`@media(max-width:768px)` 断点与流式 `.container{max-width:960px}`；measure-lab.css/lab.css 自带
`@media(max-width:720px)` 壳适配。**按实况记「无需转换」，零多余改动**（同 M1 exp-room 先例）。
exp-task 五行三列表格在 375px 实测无横向溢出（scrollWidth=375），未加断点。

### 缓存号（规格 3.6）
- 两个 iframe 壳页内 data-src：7 个已改子页引用升 `?v=20261026m2`（s1 三个 + s2 四个）。
- 9 页均为内联脚本或引用未改动的共享 js（fullscreen.js/exp-back.js/exp-common.js/measure-lab.js/lab.js 零改动），
  故无 js `?v=` 需升；experiment.html/index.html 对本轮页面的链接原本不带 `?v=`，未动。

## 2. 验收证据

### 2.1 node --check
本轮 **0 个 js 文件改动**；关联 js 仍全数通过：
```
$ node --check measure-lab.js && node --check lab.js && node --check exp-common.js
NODE_CHECK_OK
```

### 2.2 grep 对账（9 页改后计数）
```
exp-estimate.html    mouse/touch:0  dvh:2  tap-highlight:1  user-scalable=no:1
exp-measure-lab.html mouse/touch:0  dvh:0(壳页height:100%无100vh)  tap:1  scalable:1
exp-task.html        mouse/touch:0  dvh:2  tap:1  scalable:1
exp-warmup.html      mouse/touch:0  dvh:2  tap:1  scalable:1
exp-harvester.html   mouse/touch:0  dvh:1  tap:1  scalable:1
exp-lab.html         mouse/touch:0  dvh:0(壳页)  tap:1  scalable:1
exp-motion.html      mouse/touch:0  dvh:1  tap:1  scalable:1
exp-reference.html   mouse/touch:0  dvh:1  tap:1  scalable:1
exp-train.html       mouse/touch:0  dvh:1  tap:1  scalable:1
```
touch-action 页面级 0 新增（本轮无拖拽面）；三个展示 canvas（moCv/trainCv/fieldCv）位于
`.fullscreen-wrap` 内，common.css 既有 `.fullscreen-wrap canvas{touch-action:none}` 已命中，
浏览器实测计算样式 `touchAction=none` 三页全过（见 2.4 表）。

### 2.3 git status（仅 9 页 M）
```
$ git status --short
 M content/physics_g8_v1_c1_s1/exp-estimate.html
 M content/physics_g8_v1_c1_s1/exp-measure-lab.html
 M content/physics_g8_v1_c1_s1/exp-task.html
 M content/physics_g8_v1_c1_s1/exp-warmup.html
 M content/physics_g8_v1_c1_s2/exp-harvester.html
 M content/physics_g8_v1_c1_s2/exp-lab.html
 M content/physics_g8_v1_c1_s2/exp-motion.html
 M content/physics_g8_v1_c1_s2/exp-reference.html
 M content/physics_g8_v1_c1_s2/exp-train.html
?? .DS_Store   （非本轮产物，未触碰）
```

### 2.4 浏览器实测（Python Playwright + Chromium，71/71 PASS）
移动端 emulate：viewport 375×667、is_mobile=True、has_touch=True、iPhone UA；交互全部用
`page.touchscreen.tap(x,y)` 真实合成触摸（先 scrollIntoView 取 boundingBox 中心），滑杆用
input 事件驱动。桌面回归：1280×800 无 touch，`page.click` 鼠标交互。逐页断言明细见第 1 节表。

汇总：
- 移动端 9 页：`scrollWidth=375 ≤ innerWidth=375` 全过（含 warmup 切 tab 后复测）；console/pageerror 全 0。
- 移动端交互 56 项断言全 PASS（tap 反馈/状态机推进/滑杆/pill/SVG 点选/iframe 懒加载与 tab 切换）。
- 桌面回归：9 页加载 0 报错 + 5 页交互抽查（estimate 点击判分、reference 点选参照物、harvester pill+播放、
  motion 播放、train 状态推进）全 PASS，桌面行为零变化。
- 测试脚本 /tmp/m2_test.py，结果 json /tmp/m2_results.json（71/71，exit 0）。

## 3. 与盘点/任务书差异记录
1. 任务书 2.1 预设「含 canvas/拖拽交互的页」需 pointer 收敛——实测 grep 9 页 mouse/touch 绑定均为 0，
   canvas 页（motion/train/harvester）的 canvas 只做动画展示，交互全在按钮/滑杆/pill 上，2.1 整项 N/A，零 js 改动。
2. exp-reference 为 SVG 点选交互页（非 canvas）：按 2.3 精神给 `.svg-scene` 加 user-select 三件套防长按选中，
   但**不加** `touch-action:none`——点选不需要禁滚动，禁了反而挡住页面滚动（场景 SVG 占屏大）。
3. 两个壳页（measure-lab/exp-lab）用 `height:100%` 布局无 100vh，2.2 对其 N/A；壳内 data-src 只升本轮已改
   子页的缓存号，M1 产物 exp-ruler/exp-stopwatch 引用保持原样（禁碰白名单外文件的引用语义）。
4. common.css（两目录）已是移动就绪（tap-highlight、44px 触控目标、canvas touch-action、768px 断点、
   s2 另有 slider min-height:28px），按「共享禁改」原则零触碰，dvh 覆盖全部走页内联，与 M1 改法一致。
5. 观察项（既有行为，非本轮引入）：`.fullscreen-wrap canvas{touch-action:none}` 使移动端在展示 canvas 上
   滑动不滚动页面（canvas 下方控件区仍可正常滚动），M1 起即如此，未改动。

## 4. 纪律确认
物理逻辑/状态机/判分零改动（0 js 改动）；只加防误触/视口回退/缓存号；未 commit、未 push；
未触碰 c1_s1/exp-ruler*、exp-stopwatch*、c4 系及白名单外任何文件；轮次用量约 12/20。

=== DONE ===
报告路径：docs/mobile-wave-M2-report.md

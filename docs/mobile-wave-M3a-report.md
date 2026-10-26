# 移动兼容波 M3a 报告（c1_s3 + c1_s4 全部 8 实验页移动兼容）

日期：2026-10-27 ｜ 执行：Qoder ｜ 范围：白名单 8 html（0 js 改动），未 commit/push

## 0. 盘点结论（先 grep 后动手）

对 8 页 html + 关联 js（exp-calc.js / exp-slope.js / lab.js / fullscreen.js / exp-back.js / exp-common.js）全量 grep：

```
mousedown|mousemove|mouseup|mouseleave|touchstart|touchmove|touchend|touchcancel 命中数 = 0
```

**8 页无一含 mouse/touch 绑定，规格 2.1（pointer 收敛）本轮整体不适用（N/A），零 js 改动。**
交互全部为 `click`（按钮/chips/bar 行/tab）+ `input`（range 滑杆、number 输入）+ `change`（select）+ `keydown` + `resize`，
均为触屏原生可用事件。exp-slope.html 全屏数据表悬浮小窗的拖拽把手**已是 pointer 单绑**
（pointerdown/pointermove/pointerup/pointercancel + setPointerCapture + `.fs-drag-handle{touch-action:none}`，
先前语音波之外的既有实现），本轮零触碰。

### 2.4 桌面专属布局核查（exp-sensor / exp-slope 重点）
盘点称两页命中"桌面专属布局（固定宽≥1000px）"，实况 grep `min-width:≥1000px`、固定 `width:≥1000px`：
- 两页命中的仅是全屏态卡片 `max-width: 1100px; width: 100%`（**流式**，max-width 非 min-width）；
- 场景均为 `svg{width:100%; height:auto}` + `viewBox` 自适应；control-row 自带 `flex-wrap`/`overflow-x:auto`；
- 两目录 common.css 自带 `@media(max-width:768px)` 断点，lab.css 自带 `@media(max-width:720px)` 壳适配；
- exp-slope 全屏悬浮表已有 `@media(max-width:480px)` 小屏收缩规则（width:min(200px,54vw)）。

**按实况记「无需转换」，零多余改动**（同 M1 exp-room、M2 先例）。实测 375×667 两页 scrollWidth=375≤innerWidth=375（见 §2.4）。

## 1. 每页改动表

| 页 | canvas 交互页？ | 改动内容 | 实测结果（375×667 touch） |
|---|---|---|---|
| c1_s3/exp-calc | 否（DOM 表单：number 输入+select） | meta 补 `maximum-scale=1, user-scalable=no`；内联加 `html,body{-webkit-tap-highlight-color:transparent}`；`#fsCalc` 全屏规则 `height:100vh` 后加 `height:100dvh` 回退 + `#fsCalc.pseudo-fullscreen{height:100vh!important;height:100dvh!important}` 覆盖 common.css | 填 s=100/t=10 → 「v = s ÷ t = 100 m ÷ 10 s ≈ 10 m/s（≈ 36 km/h）」；tap 行无崩溃；375≤375；console 0 错 |
| c1_s3/exp-motion | canvas 展示页（动画 canvas 无 pointer 交互，控件=按钮/滑杆） | 同上（`#fsMotion`） | canvas 计算样式 touch-action=none（common.css `.fullscreen-wrap canvas` 命中）；tap 播放 1.6s → a0=「150 m」；滑杆→8 m/s；tap 重播→表格清空；375≤375；0 错 |
| c1_s3/exp-speed | 否（DOM 点击行，无 canvas） | 同上（`#fsSpeed`） | tap 第 3 行 → detail「自行车：约5 m/s = 18 km/h…」；375≤375；0 错 |
| c1_s3/exp-unit | 否（DOM 表单+chips） | 同上（`#fsUnit`） | 默认「1 m/s = 3.6 km/h」；tap 蜗牛 chip → 0.0015 载入；select 切 mph → 实时重算；375≤375；0 错 |
| c1_s3/exp-lab | iframe 整合壳（lab.css height:100%，无 100vh，dvh N/A） | meta 补防缩放；内联加 tap-highlight；4 个子页 data-src `?v=20261024→20261026m3` | iframe 懒加载生效；tap tab 切「速度计算器」→ frame active + #inS 可见；4 个 data-src 均带 20261026m3；375≤375；0 错（截图 /tmp/m3a-mobile-s3-lab.png） |
| c1_s4/exp-sensor | SVG 示意页（无拖拽：滑杆/按钮/select 驱动） | meta 补防缩放；内联加 tap-highlight；`#fsSensor` dvh 回退 + pseudo-fullscreen dvh !important 覆盖 | 滑杆移到 300（未测距读数保持 --）；tap 发射脉冲 → 1.8s 后 dist=0.57 m、t=3.36ms 自动填入；s₁/s₂/Δt 输入 → v=1.00；375≤375；0 错（截图 /tmp/m3a-mobile-s4-sensor.png） |
| c1_s4/exp-slope | SVG 状态机页（把手拖拽已 pointer 化，本轮零触碰） | meta 补防缩放；内联加 tap-highlight；`#fsSlope` dvh 回退 + pseudo-fullscreen dvh !important 覆盖 | 滑杆→「高」；tap 释放小车 → 秒表走动（0.40s）→ 1.8s 跑完 t₁=1.81 自动填表、步骤③激活、v₁=55.25；tap 再测一次→秒表归零；375≤375；0 错（截图 /tmp/m3a-mobile-s4-slope.png） |
| c1_s4/exp-lab | iframe 整合壳 | meta 补防缩放；内联加 tap-highlight；2 个子页 data-src `?v=` 升 20261026m3 | tap tab 切「超声波传感器测速」→ frame active + #emitBtn 可见；data-src 均带 20261026m3；375≤375；0 错 |

dvh 写法与 M1/M2 完全一致：共享 common.css（s3/s4 两份 diff 相同）的 `.pseudo-fullscreen{height:100vh!important}` 属禁改文件，
故各页内联 `<style>`（位于 link 之后）加 `#fsXxx.pseudo-fullscreen{height:100vh!important;height:100dvh!important}`（ID 特异性覆盖成立）；
页内自有 `:fullscreen` 组合规则原地加 `height:100dvh` 回退行。

### 缓存号（规格 2.5）
- 两个壳页 data-src：6 个本轮已改子页引用升 `?v=20261026m3`（s3 四个 + s4 两个）。
- 8 页引用的 js/css（exp-calc.js、exp-slope.js、lab.js、fullscreen.js、exp-back.js、common.css、lab.css）本轮**零改动**，
  其 `?v=20261024` 保持原样（M2 先例：只升已改资源的缓存号）。
- experiment.html / explain.html / index.html 对白名单页的链接原本不带 `?v=`，未动。

## 2. 验收证据

### 2.1 node --check
本轮 **0 个 js 文件改动**；关联 js 仍全数通过：
```
$ node --check exp-calc.js && node --check exp-slope.js && node --check lab.js(s3,s4) && node --check fullscreen.js(s3,s4)
NODE_CHECK_OK
```

### 2.2 git status（仅白名单 8 页本轮 M）
```
 M content/physics_g8_v1_c1_s3/exp-calc.html
 M content/physics_g8_v1_c1_s3/exp-lab.html
 M content/physics_g8_v1_c1_s3/exp-motion.html
 M content/physics_g8_v1_c1_s3/exp-speed.html
 M content/physics_g8_v1_c1_s3/exp-unit.html
 M content/physics_g8_v1_c1_s4/exp-lab.html
 M content/physics_g8_v1_c1_s4/exp-sensor.html
 M content/physics_g8_v1_c1_s4/exp-slope.html
 M content/physics_g8_v1_c4_s4/exp-refract.html   （语音线既有未提交产物，本轮零触碰）
?? .DS_Store / content/physics_g8_v1_c4_s4/guide/guide-data.js（同上，非本轮产物）
```

### 2.3 grep 对账（8 页改后计数）
```
c1_s3/exp-calc.html    mouse/touch:0  dvh:2  tap:1  scalable:1  touch-action:0  v-bump:0
c1_s3/exp-lab.html     mouse/touch:0  dvh:0(壳height:100%)  tap:1  scalable:1  v-bump:4
c1_s3/exp-motion.html  mouse/touch:0  dvh:2  tap:1  scalable:1  touch-action:0(common.css命中canvas)  v-bump:0
c1_s3/exp-speed.html   mouse/touch:0  dvh:2  tap:1  scalable:1  touch-action:0  v-bump:0
c1_s3/exp-unit.html    mouse/touch:0  dvh:2  tap:1  scalable:1  touch-action:0  v-bump:0
c1_s4/exp-lab.html     mouse/touch:0  dvh:0(壳)  tap:1  scalable:1  v-bump:2
c1_s4/exp-sensor.html  mouse/touch:0  dvh:2  tap:1  scalable:1  touch-action:0(无拖拽面)  v-bump:0
c1_s4/exp-slope.html   mouse/touch:0  dvh:2  tap:1  scalable:1  touch-action:1(既有.fs-drag-handle)  v-bump:0
```
mouse 残留=0（全部 8 页，含改前即为 0）；tap-highlight 页面级 common.css 本有 `*{-webkit-tap-highlight-color:transparent}`，
按规格 2.3 每页仍内联 `html,body` 一份（与 M2 做法一致，双保险）。

### 2.4 浏览器实测（Python Playwright + Chromium，65/65 PASS）
移动端 emulate：viewport 375×667、is_mobile=True、has_touch=True、iPhone UA；交互用 `page.touchscreen.tap(x,y)`
真实合成触摸（scrollIntoView 后取 boundingBox 中心），滑杆/select 用 input/change 事件驱动。
桌面回归：1280×800 无 touch，`page.click` 鼠标交互。逐页断言明细见 §1 表。

汇总：
- 移动端 8 页：`scrollWidth=375 ≤ innerWidth=375` 全过；meta `maximum-scale=1,user-scalable=no` 全过；console/pageerror 全 0。
- 移动端交互 41 项断言全 PASS（表单求解/播放暂停重播/滑杆/chips/bar 点击/SVG 测距/状态机跑表填表/iframe 懒加载与 tab 切换）。
- 桌面回归：8 页加载 0 报错 + 8 项交互抽查（calc 求解、motion 播放、speed 点行、unit 36km/h=10m/s、
  两壳 tab 切换、sensor 发射测距、slope 释放跑完）全 PASS，桌面行为零变化。
- 移动截图：/tmp/m3a-mobile-s4-sensor.png、/tmp/m3a-mobile-s4-slope.png、/tmp/m3a-mobile-s3-lab.png。
- 测试脚本 /tmp/m3a_test.py，结果 json /tmp/m3a_results.json（65/65，exit 0）。
- 首轮 3 项 FAIL 均为测试脚本自身问题（motion 表格需 t≥10s 即 1.25s 真实时间才填 a0，等待不足；
  unit 桌面用例 from/to 同为 kmh 走了「同单位数值不变」分支），修正脚本后全过；页面零改动。

## 3. 与盘点/任务书差异记录
1. 盘点称 exp-sensor/exp-slope 命中「桌面专属布局（固定宽≥1000px）」——实况为 `max-width:1100px; width:100%`
   流式布局 + SVG viewBox 自适应 + 既有 480px/768px 断点，375px 实测无横向溢出，2.4 项按实况记「无需转换」（M1 exp-room 先例）。
2. 任务书 2.1 预设 canvas/拖拽页需 pointer 收敛——实测 grep 8 页 mouse/touch 绑定均为 0；
   exp-slope 全屏悬浮表把手已是 pointer+setPointerCapture+touch-action:none 的完备实现，2.1 整项 N/A，零 js 改动。
3. exp-motion 的 canvas 为纯动画展示（无 pointer 交互），touch-action:none 由 common.css 既有规则命中，未新增。
4. 两个壳页 height:100% 布局无 100vh，2.2 对其 N/A；壳内 data-src 只升本轮已改 6 个子页，未改动的 js/css `?v=` 保持原样。
5. sensor/slope 的场景 SVG 非交互面（交互在滑杆/按钮上），未加 touch-action:none（避免挡住页面滚动，M2 exp-reference 先例精神）；
   两 SVG 既有 `user-select:none` 保留。

## 4. 纪律确认
物理逻辑/状态机/判分零改动（0 js 改动）；只加防误触/视口回退/缓存号；未 commit、未 push；
未触碰 c2 系（M3b）、c3~c6（语音线）及白名单外任何文件；轮次用量约 14/18。

=== DONE ===
报告路径：docs/mobile-wave-M3a-report.md

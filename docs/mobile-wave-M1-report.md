# 移动兼容波 M1 报告（c1/c2 五页改触控 + dvh + 防误触）

日期：2026-10-26 ｜ 执行：主会话 ｜ 范围：白名单 10 文件（5 html + 5 js），未 commit/push

## 1. 修改清单

### 1.1 事件绑定 mouse/touch → pointer（核心）

| 页面 js | 改前（HEAD）绑定 | 改后 | 说明 |
|---|---|---|---|
| c1_s1/exp-ruler.js | mousedown/mousemove/mouseup ×2 组 + touchstart/touchmove/touchend/touchcancel（铅笔拖拽组 + 全屏答题面板拖拽组，共 13 处 mouse/touch） | pointerdown/pointermove/pointerup/pointercancel 共 8 处，mouse/touch 0 残留 | 铅笔拖拽与面板拖拽均加 `setPointerCapture`（3 处）；`e.type==='touchstart/touchmove'` 判断改 `e.pointerType==='touch'` |
| c1_s1/exp-stopwatch.js | mousedown×2 + mousemove/mouseup + touchstart/touchmove/touchend（画布按钮点击 + 面板拖拽，共 8 处） | pointerdown/pointermove/pointerup/pointercancel 共 5 处；画布点击统一走 `e.offsetX/offsetY`（PointerEvent 原生支持，删除 changedTouches 分支） | 面板拖拽加 `setPointerCapture` |
| c2_s1/exp-vacuum.js | pointer/mouse/touch 三套混绑（抽气键 pointerdown+mousedown+touchstart，stop 五路，共 5 处 mouse/touch 冗余） | 只留 pointer 一套 10 处（pointerdown/up/leave/cancel + window pointerup/pointercancel） | 按住抽气为 hold 型非拖拽型，保留原 pointerleave 松手语义，不加 capture（与桌面行为一致） |
| c2_s1/exp-vibrate.js | mousedown/mouseup/mouseleave + touchstart/touchend（按住橡皮筋键，共 5 处） | pointerdown/pointerup/pointerleave/pointercancel 共 4 处 | hold 型，保留 mouseleave→pointerleave 语义；防滚动改由 CSS `touch-action:none` 承担（替代原 touchstart preventDefault） |
| c2_s5/exp-room.js | mousedown/mousemove/mouseup（3D 相机旋转，纯鼠标，手机完全拖不动） | pointerdown/pointermove/pointerup/pointercancel；`setPointerCapture` 2→3 处 | 按钮/输入上的 pointerdown 跳过 capture，避免兼容鼠标事件重定向破坏 matGrid 委托 click 与 bellBtn click（实测材料点击仍生效） |

要点：pointer 事件桌面同样触发，故删掉全部 mouse/touch 重复绑定，桌面不会双触发；拖拽页（ruler/stopwatch/room）按规格加 `setPointerCapture`，`pointerup`/`pointercancel` 释放或隐式释放。

### 1.2 视口高度 100vh → 100dvh（带回退）
- stopwatch：内联 `.pseudo-fullscreen #stopwatchCv`、`:fullscreen #stopwatchCv` 两行各加 `height:100dvh !important` 回退行；另加 `#fsSwWrap.pseudo-fullscreen` dvh 覆盖。
- ruler/vacuum/vibrate：共享 common.css 的 `.pseudo-fullscreen{height:100vh!important}` 属禁改文件，故各页内联加 `#fsXxxWrap.pseudo-fullscreen { height:100vh !important; height:100dvh !important; }`（内联 style 在 link 之后，同特异性可覆盖）。
- room：内联 `#fsRoom:fullscreen, #fsRoom.pseudo-fullscreen` 加 `height:100dvh` 回退行。

### 1.3 触控防误触（5 页统一）
- viewport meta 全部补 `maximum-scale=1, user-scalable=no`（原仅 `width=device-width, initial-scale=1.0, viewport-fit=cover`）。
- 各页内联加 `html, body { -webkit-tap-highlight-color: transparent; }`。
- 交互元素 `touch-action:none; user-select:none; -webkit-user-select:none;`：#rulerCv、#stopwatchCv、#vacCv、#pumpBtn、#holdBtn、#room3d；面板容器 #fsRulerQuiz、#fsQuiz 加 `touch-action:none`（输入框自身不受影响，仍可输入）。读数文本未加 user-select，保留可复制。

### 1.4 exp-room 响应式（2.4 项）
- grep 结果：exp-room.html / exp-room.js / c2_s5 common.css 均**不存在** `min-width:1000px`（或 ≥1000px 固定宽），盘点信息与实况不符。该页布局本已流式：`#room3d{width:100%}`、`.ctl-row{flex-wrap:wrap}`、`.readout{flex-wrap:wrap}`、`.mat-grid` 已有 `@media(max-width:768px)` 单列断点、无 min-width:520px 面板。
- 实测 375×667：`document.documentElement.scrollWidth=375 ≤ innerWidth=375`，无横向溢出（截图 /tmp/m1-mobile-room.png）。故无需新增固定宽转换；未做多余改动。

### 1.5 缓存号
5 页 js 引用 `?v=` 统一升 `20261026m1`（仓库惯例）。

## 2. 验收证据

### 2.1 node --check（5/5 过）
```
$ node --check exp-ruler.js && ... && node --check exp-room.js
NODE-CHECK-5-OK
```

### 2.2 grep 对账（改前=git HEAD 计数 → 改后）
```
exp-ruler.js     mouse/touch绑定:13->0  pointer绑定:0->8   setPointerCapture:0->3
exp-stopwatch.js mouse/touch绑定:8->0   pointer绑定:0->5   setPointerCapture:0->1
exp-vacuum.js    mouse/touch绑定:5->0   pointer绑定:10->10 setPointerCapture:0->0(hold型,保留leave语义)
exp-vibrate.js   mouse/touch绑定:5->0   pointer绑定:0->4   setPointerCapture:0->0(hold型)
exp-room.js      mouse/touch绑定:3->0   pointer绑定:4->8   setPointerCapture:2->3
exp-ruler.html     dvh:1 tap:1 touch-action:2 viewport(max-scale):1
exp-stopwatch.html dvh:3 tap:1 touch-action:2 viewport(max-scale):1
exp-vacuum.html    dvh:1 tap:1 touch-action:2 viewport(max-scale):1
exp-vibrate.html   dvh:1 tap:1 touch-action:1 viewport(max-scale):1
exp-room.html      dvh:1 tap:1 touch-action:2 viewport(max-scale):1
```

### 2.3 git status（仅 10 文件 M）
```
$ git status --short | grep "^ M" | wc -l
10
```
（另有 untracked `.DS_Store`、`content/_lib/guide/`、`docs/guide-core-lib-report.md` 非本轮产物，未触碰。）

### 2.4 浏览器实测（Playwright + Chromium，32/32 PASS）
移动端 emulate：viewport 375×667、is_mobile、has_touch、DSR2、iPhone UA；交互用 `PointerEvent('pointerdown/pointermove/pointerup',{pointerId:1,pointerType:'touch',clientX,clientY,bubbles:true})` 合成手指事件（stopwatch 画布按钮经 defineProperty 补 offsetX/Y，因合成事件无原生 offsetX）。桌面回归：1280×800、pointerType:'mouse'。

| 页 | 移动端交互断言 | 桌面回归断言 | 溢出 | console |
|---|---|---|---|---|
| ruler | 拖铅笔读数变化 `6.00\|7.87\|1.87 → 6.13\|8.00\|1.87` | `3.90\|5.44\|1.54 → 4.40\|5.94\|1.54` | 375≤375 / 1280≤1280 | 0 / 0 |
| stopwatch | 点击前画面静止、点开始钮后走针（截图 diff） | 同 | 同上 | 0 / 0 |
| vacuum | 按住抽气键→`pressed`+「抽气中」、松手复原 | 同 | 同上 | 0 / 0 |
| vibrate | 按住橡皮筋键→`holding`、松手复原 | 同 | 同上 | 0 / 0 |
| room | 拖动画布 3D 场景像素变化；海绵按钮 click 仍生效（capture 未破坏委托） | 同两项 | 同上 | 0 / 0 |

移动端截图（375×667，布局无横向溢出、控件换行正常）：/tmp/m1-mobile-{ruler,stopwatch,vacuum,vibrate,room}.png

## 3. 与盘点差异记录
1. 盘点称 5 页「只绑 mouse」，实测 4 页（ruler/stopwatch/vacuum/vibrate）为 mouse+touch 双绑、仅 room 纯 mouse；本轮统一收敛为 pointer 单绑并删除 touch 版（否则移动端 pointer+touch 双触发）。
2. exp-room 无 min-width:1000px 桌面专属布局，2.4 项按实况记为「无需转换」，以 375px 实测无溢出为验收。
3. vacuum/vibrate 为按住型交互，未加 setPointerCapture，保留原 leave 松手语义（桌面行为零变化）。

## 4. 纪律确认
物理逻辑/状态机/判分零改动；每页改后即 node --check + 浏览器实测；未 commit、未 push。

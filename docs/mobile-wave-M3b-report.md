# 移动兼容波 M3b 报告（c2 全章剩余 23 页手机/平板兼容）

日期：2026-10-27 ｜ 执行：Qoder ｜ 范围：白名单 23 html + 1 js（exp-control.js），未 commit/push
改法照搬 M1（docs/mobile-wave-M1-report.md）/ M2（docs/mobile-wave-M2-report.md）已验证规格。

## 0. 盘点结论（先 grep 后动手）

对 18 个内容页 js + 5 壳页 + 共享 js（lab.js/fullscreen.js/exp-common.js/exp-back.js）全量 grep：

```
addEventListener('mouse*|touch*') 命中 = 0（18 个目标 js + 全部 html 内联脚本 + 共享 js）
```

交互全部为 click / input / change / resize（触屏原生可用），**规格 2.1「mouse/touch→pointer 收敛」对 17 页 N/A**（同 M2 结论）。唯一例外：

- **exp-control.js（c2_s4）为纯 HTML5 drag&drop（dragstart/dragover/drop），移动端触屏完全不触发** —— 手机上该页核心交互（措施卡分类到三桶）完全不可用。本轮唯一 js 改动：抽出 `tryPlace(card,bin)` 供 drop 复用（判分逻辑 `bin.dataset.accept === card.dataset.category`、showFb/checkWin/placed 计数零改动），新增触屏回退「点卡选中(.sel)→点桶放置」，桌面拖拽路径原样保留（drop 时清 sel 防状态串）。
- exp-decibel.js 同为 DnD 但**自带 click 回退**（卡片 click→setDb），无需改动，实测 tap 生效。
- exp-loudness.js 既有的 1 处 pointerdown 是 WebAudio unlock（已是 pointer），不动。

c2 五节 common.css 完全相同且已移动就绪（`*{-webkit-tap-highlight-color:transparent}`、`.fullscreen-wrap canvas{touch-action:none}`、768px 断点、44px 触控目标），按「共享禁改」零触碰；`.pseudo-fullscreen{height:100vh!important}` 的 dvh 回退全部走页内联（ID 特异性+!important 覆盖，同 M1/M2 改法）。

## 1. 每页改动表（23 页）

统一改动（全部 23 页）：viewport meta 补 `maximum-scale=1, user-scalable=no`；`<link>` 后内联 `<style>` 加 `html,body{-webkit-tap-highlight-color:transparent}`。下表只列额外项。

| 页 | canvas 交互页？ | 额外改动 | 实测（375×667 touch，逐页断言） |
|---|---|---|---|
| s1/exp-amp | 展示 canvas（wrap 内，touch-action:none 既有） | `#fsAmpWrap.pseudo-fullscreen` dvh 覆盖 | tap 慢放→slowBtn.active；tap 敲音叉无报错；375≤375；console 0 |
| s1/exp-dual | 否（SVG 赛道+表单） | `#fsDualWrap` dvh 覆盖 + 自有内联 `height:100vh` 原地加 `height:100dvh` 回退 | tap 100m 快捷→lenInput=100；tap 发射→roT1=0.019s；375≤375；0 错 |
| s1/exp-echo | 否（SVG+表单） | `#fsEcho` dvh 覆盖 + 内联 100vh 加 dvh 回退 | tap 喊一声→roT=0.353s；375≤375；0 错 |
| s1/exp-lab（壳） | — | 6 个本轮改动子页 data-src `?v=20261024→20261026m3`（vibrate/vacuum=M1 产物禁碰，保持原样） | tap tab②→frame active 且 src=exp-amp.html?v=20261026m3；375≤375；0 错 |
| s1/exp-medium | 否（DOM 按钮+meter） | 无 | tap 桌子路径→btnDesk.on；tap 敲桌无报错；375≤375；0 错 |
| s1/exp-speed | 否（点选排序 DOM 游戏） | 无 | tap 池卡→判序反馈「❌ 这张比第 1 名大…」（点选生效）；375≤375；0 错 |
| s1/exp-wave | 展示 canvas（wrap 内 none） | `#fsWaveWrap` dvh 覆盖 | 滑杆→freqVal 适中→高；tap 节拍无报错；375≤375；0 错 |
| s2/exp-intro | 展示 canvas（wrap 内 none） | `#fsIntroWrap` dvh 覆盖 | tap 揭晓→answerBox 显示；375≤375；0 错 |
| s2/exp-timbre | 展示 canvas（wrap 内 none） | `#fsTimbreWrap` dvh 覆盖 | tap 随机→nowVal=音叉；375≤375；0 错 |
| s2/exp-ruler | 展示 canvas（wrap 内 none） | `#fsRulerWrap` dvh 覆盖 | 滑杆→lenVal 20→25cm；tap 拨动无报错；375≤375；0 错 |
| s2/exp-scope | 展示 canvas（wrap 内 none） | `#fsScopeWrap` dvh 覆盖 | tap 预测「密」→predFb ✅ 判分；375≤375；0 错 |
| s2/exp-range | 展示 canvas（**不在 wrap 内**，touch-action=auto，纯频谱展示无拖拽，如实记录不强加） | 无 | 滑杆→playHz 390→200000Hz；375≤375；0 错 |
| s2/exp-loudness | 展示 canvas（wrap 内 none） | `#fsLoudWrap` dvh 覆盖 | tap 轻敲→forceVal=轻敲；距离滑杆→distVal 2→10m；375≤375；0 错 |
| s2/exp-lab（壳） | — | 6 子页 data-src 升 m3（intro 原 20261026→m3；craft/instruments 白名单外保持 20261024） | tap tab 钢尺→src=exp-ruler.html?v=20261026m3；375≤375；0 错 |
| s3/exp-candle | 展示 canvas（wrap 内 none） | `#fsCandleWrap` dvh 覆盖 | 振幅滑杆→ampVal 60→100%；tap 播放无报错；375≤375；0 错 |
| s3/exp-echo | 展示 canvas（wrap 内 none） | `#fsEchoWrap` dvh 覆盖 | tap 发射→tVal=0.088s；375≤375；0 错 |
| s3/exp-huanqiu | 展示 canvas（wrap 内 none） | `#fsHuanqiuWrap` dvh 覆盖 | select 站位→updateInfo 内容切换；tap 喊声无报错；375≤375；0 错 |
| s3/exp-lab（壳） | — | 3 子页 data-src 升 m3 | tap tab 回声→src=exp-echo.html?v=20261026m3；375≤375；0 错 |
| s4/exp-control | 否（**HTML5 DnD 分类，触屏原不可用**） | **exp-control.js 加点选回退**（唯一 js 改动，判分零变化）+ html 加 `.measure-card.sel` 选中样式 + js `?v=20261026m3` | tap 卡→.sel；tap 对应桶→.placed+fb「放对了」；**桌面 1280×800 HTML5 drag_to 实测仍 placed（拖拽路径未破坏）**；375≤375；0 错 |
| s4/exp-wave | 展示 canvas（wrap 内 none） | `#fsWaveWrap` dvh 覆盖 | tap 音叉→pauseBtn 启用；tap 暂停→「⏸ 暂停→▶ 继续」；375≤375；0 错 |
| s4/exp-decibel | 否（DnD+click 双通道，click 本就可用） | 无 | tap 卡片→dbReadout 0dB→30~40dB；375≤375；0 错 |
| s4/exp-lab（壳） | — | 3 子页 data-src 升 m3 | tap tab 分贝→src=exp-decibel.html?v=20261026m3；375≤375；0 错 |
| s5/exp-lab（壳） | — | 仅统一项（单模式壳无 tab；room=M1 产物 data-src 保持 20261026 不动，实测确认未被误升） | frame active 且 src=exp-room.html?v=20261026；375≤375；0 错 |

### 2.4 桌面专属布局核查
23 页 grep `min-width:≥1000px` / 固定 `width:≥1000px` 均 0 命中；common.css 自带 768px 断点、多页自带 480px 断点（dual/echo-s1 全屏态）。**按实况记「无需转换」，零多余改动**（同 M1 exp-room、M2 先例）。全部 23 页 375px 实测 scrollWidth=375≤innerWidth=375，无横向溢出。

### 缓存号（规格 2.5）
- 4 壳页 data-src：本轮 18 个已改子页引用升 `?v=20261026m3`（s1×6、s2×6、s3×3、s4×3）；M1 产物（vibrate/vacuum/room）与白名单外页（craft/instruments）引用保持原样。
- exp-control.js 为本轮唯一 js 改动，其引用升 `?v=20261026m3`；其余 17 页 js 零改动，引用不升（M2 先例）。common.css/lab.css 未改不升。

## 2. 验收证据

### 2.1 node --check
```
$ node --check content/physics_g8_v1_c2_s4/exp-control.js
NODE_CHECK_OK   （本轮唯一 js 改动；其余 17 js 未动无需 check，仍抽查通过）
```

### 2.2 git status（仅白名单 24 文件 M，与 M3a 的 c1 文件零交集）
```
M c2_s1: exp-amp/dual/echo/lab/medium/speed/wave .html（7）
M c2_s2: exp-intro/lab/loudness/range/ruler/scope/timbre .html（7）
M c2_s3: exp-candle/echo/huanqiu/lab .html（4）
M c2_s4: exp-control.html + exp-control.js + exp-decibel/lab/wave .html（5）
M c2_s5: exp-lab.html（1）  合计 24 = 23 html + 1 js
```
（工作区另有 c4_s4/exp-refract.html M 与 guide/ 等 untracked，属语音线并行产物，本轮零触碰；会话开始时存在的 c1_s3/s4 M 已被 M3a 并行单自行处置，本轮未碰任何 c1 文件。禁碰页 exp-vacuum/exp-vibrate/exp-room 零改动。）

### 2.3 grep 对账（改后计数，23 页）
```
18 内容页：mouse/touch 绑定=0；tap-highlight=1；user-scalable=no=1
13 个带全屏 wrap 页：pseudo-fullscreen dvh 覆盖各 1 处（dual/echo-s1 另有内联 100vh→+100dvh 回退行，dvh 计 3）
5 壳页：dvh=0（height:100% 布局无 100vh，如实记录 N/A）；tap=1；scalable=1；data-src m3：s1=6 s2=6 s3=3 s4=3 s5=0
canvas touch-action：wrap 内展示 canvas 计算样式=none（common.css 既有规则，11 页实测命中）；rangeCv 在 wrap 外=auto（纯展示无拖拽）
```

### 2.4 浏览器实测（Python Playwright + Chromium，119/119 PASS，exit 0）
移动端 emulate：viewport 375×667、is_mobile、has_touch、DSR2、iPhone UA；交互用 `locator.tap()` 真实合成触摸（滑杆/select 用 input/change 事件驱动，同 M2）。桌面回归：1280×800 无 touch，鼠标 click + HTML5 drag_to。
- 移动端 18 内容页：逐页交互断言（见第 1 节表）+ scrollWidth=375≤375 + console/pageerror 0（WebAudio autoplay 拦截容错已配置，实际 0 错无需容错命中）。
- 移动端 5 壳页：tab 切换→对应 frame active + data-src 版本号断言（m3/保持原样）+ 0 错 + 无溢出。
- 桌面回归：23 页加载 console 0 错；抽查交互——**exp-control HTML5 拖放 drag_to→placed PASS（js 改动未破坏桌面拖拽）**、amp 慢放 click、dual q100、decibel 卡片 click→读数变化，全 PASS。
- 测试脚本 /tmp/m3b_test.py，结果 json /tmp/m3b_results.json（119/119）。

## 3. 与盘点/任务书差异记录
1. 任务书 2.1 预设 canvas/拖拽页需 pointer 收敛——实测 18 js 的 mouse/touch 绑定全为 0，pointer 收敛整项 N/A；**真正的触屏断点是 exp-control 的 HTML5 DnD**（不在 2.1 字面范围，按「手机不可交互=不兼容」的波次目标以最小改动加点选回退，判分/状态逻辑零改动，桌面拖拽回归实测通过）。
2. exp-decibel 同为 DnD 但原生带 click 回退，未动 js。
3. 5 壳页 height:100% 布局无 100vh，2.2 对其 N/A（同 M2 壳页先例）；s5 壳无 tab（单模式），data-src 无本轮改动子页，仅统一防误触项。
4. s2 壳 intro 引用原为 `?v=20261026`（语音线先前 bump），本轮升 `20261026m3`；craft/instruments 在白名单外，引用保持 20261024。
5. rangeCv 不在 fullscreen-wrap 内（touch-action=auto）：纯频谱展示、无任何拖拽/点按交互，按实况记录不强加 none（加了反而挡页面滚动，M2 exp-reference 同理先例）。
6. hint-bar 解说条 23 页全部原样保留（任务书明令，c2 暂不加语音层）。

## 4. 纪律确认
物理逻辑/状态机/判分/WebAudio 音频合成零改动（唯一 js 改动 exp-control.js 仅抽函数复用+加 click 回退，accept 判分原样）；未 commit、未 push；禁碰页（exp-vacuum/exp-vibrate/exp-room）及 c1/c3~c6 零触碰；轮次用量约 14/30。

=== DONE ===
报告路径：docs/mobile-wave-M3b-report.md

# c4s3 vB 语音版打磨报告（g2）

日期：2026-10-26 ｜ 蔡总拍板「B 语音版效果最好」，在其基础上加「可收起解说」+ 整体体验打磨。

## 一、改动摘要（3 个文件，红线内）

### 1. `content/physics_g8_v1_c4_s3/guide/vB.js`（重写）
- **老师浮标 = 解说总开关**：右下 52px 圆形 🧑‍🏫 钮（`.gvb-fab`），`bottom` 依 ctrlbar 实测高度自适应（`ctrlbar.height + 14`，无 ctrlbar 兜底 110px），不遮任何控件。
  - 收起态：字幕条立即隐藏 + 当前配音立即 `pause()` + 后续 `onIntro/onStep/onError/onFree` 只更新内部状态（`cur`）不显示不发声；浮标 `opacity .45` + 右上 💤 角标；`guide-mute` 一并隐藏。
  - 展开态：恢复显示与配音，且**收起期间错过的最近一条若仍在其显示时限内则补显并重新配音**（`missedWindow()` 按音频条 15s / 纯文字条 `max(4000,len*280)` 计算剩余）——可选项已实现。
  - 状态记忆：`localStorage['gvb-collapsed']`（'1'/'0'），刷新保持；切模式不影响（`cur` 与 collapsed 独立于 mode）。
- **配音开关联动**：保留右上 `#guide-mute` 🔊/🔇（只控配音不控字幕），状态写 `localStorage['gvb-muted']`，初始化即读取。静音时字幕照常出、走纯文字时长；解除静音时若当前条有 clip 则立即补配音。
- **字幕与音频时长同步**：成功起播 → 驻留至 `audio.ended + 400ms`，兜底上限 15s（`MAX_DUR`）；`play()` 被拦截 / `error` / 静音 / 收起 → 回退 `max(4000, len*280)`。纠错条同样遵循 ended 同步，且保持橙底 + 抖动（复用 `.guide-caption.err/.shake`）。
- **🔁 重播钮**：字幕条右缘内嵌 `.gvb-replay`，仅当当前条有 audioId 且未收起时显示；点击重建 `Audio` 从头播并重置驻留计时。
- **讲话中动效**：`.gvb-speaking` 3 根小竖条，`playing` 起、`ended/pause/error` 即停。
- **字幕逻辑自建**（不 `new GuideEngine.Caption()`），只复用 `.guide-caption` 基础视觉类 → vC/vD 各自实例化零影响；engine.js 未动。
- badge「B · 语音版」保留；`onFree` 兼容 `free.audio`（现数据 free 无 clip，自动走纯文字时长 + 隐藏重播钮）。

### 2. `content/physics_g8_v1_c4_s3/guide/guide.css`（仅尾部追加 `.gvb-*`）
`@@ -175,3 +175,64 @@`，删除行 0 条，既有规则零改动。新增：`.gvb-fab`（+hover/`.is-collapsed`/`.gvb-fab-zzz`）、`.gvb-caption`（整体左移 36px 让开浮标，含隐藏态同位移避免淡出横跳）、`.gvb-replay`（`pointer-events:auto`，条体仍 none 不挡 canvas）、`.gvb-speaking` + `@keyframes gvb-bars`、移动端 `@media (max-width:640px)`（浮标 46px 右 8px、字幕 `min(92vw, 100vw-84px)`、左移 28px）。

### 3. `content/physics_g8_v1_c4_s3/exp-mirror-vB.html`
仅 guide 引用 `?v=20261026g1` → `?v=20261026g2`（guide.css / script.js / engine.js / vB.js 共 4 处）；`exp-mirror-render.js`、`exp-mirror-core.js` 的版本号未动。

## 二、验收 6 条证据

**① `node --check guide/vB.js`**
```
node --check vB.js OK
```

**② `git status --short`（仅 3 个 M，无其他改动）**
```
 M content/physics_g8_v1_c4_s3/exp-mirror-vB.html
 M content/physics_g8_v1_c4_s3/guide/guide.css
 M content/physics_g8_v1_c4_s3/guide/vB.js
?? .DS_Store        ← 会话开始前既存未跟踪文件，非本次产生
```
禁动清单核验：engine.js / script.js / vA.js / vC.js / vD.js / hub.html / 其余三变体页 / exp-mirror.html / -core.js / -render.js 均未出现在 status 中 = 零触碰。未 commit、未 push。

**③ exp-mirror-vB.html diff 仅 ?v= 变化**（完整 diff）
```
-<link rel="stylesheet" href="guide/guide.css?v=20261026g1">
+<link rel="stylesheet" href="guide/guide.css?v=20261026g2">
-<script src="guide/script.js?v=20261026g1"></script>
-<script src="guide/engine.js?v=20261026g1"></script>
-<script src="guide/vB.js?v=20261026g1"></script>
+<script src="guide/script.js?v=20261026g2"></script>
+<script src="guide/engine.js?v=20261026g2"></script>
+<script src="guide/vB.js?v=20261026g2"></script>
```
（`exp-mirror-render.js?v=20261026g1` / `exp-mirror-core.js?v=20261026g1` 保持原样，出现在 diff 上下文行而非增删行）

**④ guide.css 既有规则零改动**
```
git diff guide.css | grep -c '^-[^-]'  → 0        # 无任何删除/修改行
git diff guide.css | grep '^@@'        → @@ -175,3 +175,64 @@   # 唯一 hunk 在文件尾部追加
```

**⑤ grep 对账（vB.js / guide.css）**
| 项 | vB.js | guide.css |
|---|---|---|
| `gvb-collapsed`（localStorage 键） | 1 | — |
| `gvb-muted`（localStorage 键） | 1 | — |
| `ended` 监听 | 5 | — |
| 🔁 重播 | 3 | — |
| 💤 角标 | 2 | 1 |
| `.gvb-fab` | — | 8 |
| `.gvb-caption` | — | 4 |
| `.gvb-replay` | 2 | 3 |
| `.gvb-speaking` / `gvb-bars` | 2 | 7 / 2 |
| `max-width:640px` 移动端块 | — | 2（既有 1 + 追加 1） |

音频资产对账：`audios` 登记 34 条，磁盘缺失 0；script.js 中 intro/steps/errors 引用 clip 34 条，未登记 0。

**⑥ 运行时冒烟测试（Node DOM 桩，无浏览器环境下的替代验证）**
桩件 `/tmp/vbtest.js`（未落仓库）：假 DOM/localStorage/Audio + 真 `script.js` 数据 + `GuideEngine` 桩捕获 api，逐条驱动交互。**23/23 PASS**：
```
PASS | DOM 建齐 badge/mute/fab/caption | badge=B · 语音版
PASS | fab bottom 依 ctrlbar 高度自适应 | bottom=110px (96+14)
PASS | onStep 后字幕显示 | text=点燃啦！看玻璃板里，出现了一
PASS | 重播钮可见（有 audioId）
PASS | 配音已起播 | guide/audio/c4s3-m1-s1.mp3
PASS | playing → 讲话动效 on
PASS | ended → 动效停 + 400ms 后隐藏计时
PASS | 收起：字幕立即隐藏 / mute 钮隐藏 / fab is-collapsed / localStorage gvb-collapsed=1
PASS | 收起中触发：不显示不发声（onStep + onError 双验）
PASS | 展开：补显最近一条 + 重新配音 / mute 钮恢复 / localStorage=0
PASS | 静音：🔇 + 停播 + 记忆 gvb-muted=1
PASS | 静音中：字幕照常、无新配音
PASS | 解除静音：🔊 + 当前条重新配音
PASS | 🔁 重播当前条（旧音频停、新音频起） | n1=3 total=4
PASS | error 态橙底+抖动类
PASS | free 无 clip → 重播钮隐藏、纯文字时长
---
23/23 PASS
```

## 三、未尽事项
1. **真机浏览器验收未做**：本机无 Chrome/Chromium、无 playwright/puppeteer，视觉与真实音频时序（ended 同步、竖条动效观感、浮标与字幕不重叠的实际像素）只能靠 DOM 桩 + CSS 静态核对。建议蔡总在浏览器打开 `exp-mirror-vB.html` 实测：点浮标收起→拖动操作确认全静、刷新确认记忆、点 🔁 重播。
2. **收起态不排队补播**：收起期间错过的解说只保留「最近一条」用于展开补显，不做多条队列（避免展开时连播打扰）。
3. **解除静音会重播当前条**（从头发音而非续播），属有意的体验取舍；如需「续播」可改记 `currentTime`。
4. 浮标与字幕条采用「字幕左移 36px（移动端 28px）」避让，而非动态挪浮标，保证浮标位置恒定不误触。
5. 未 commit / 未 push，候蔡总体验拍板。

=== DONE ===
docs/c4s3-vb-polish-report.md

# 移动兼容波 M4 报告：c1/c2 解说条改字幕式（蔡总 2026-10-26 拍板第3条）

日期：2026-10-27
范围：`content/physics_g8_v1_c1_s2`、`content/physics_g8_v1_c2_s1~s5` 全部含 hint-bar 的实验页（21 页）
禁碰确认：c3~c6、`_lib`、全部 `.js` 文件零改动；未 commit / 未 push。

## 0. 白名单核对（grep 实况）

`grep -rl "hint-bar" content/physics_g8_v1_c1_s*/ content/physics_g8_v1_c2_s*/` 命中 21 页，与任务书白名单**完全一致**，无出入。

js 动态写入核查：`grep -rn "hint-bar" content/**/*.js` → **0 命中**。21 页 hint 文案全部为 html 静态写入，故验收第 4 条「抽查 js 动态写 hint 文本」为 N/A；改为对全部 21 页做点击交互冒烟（见 §5），确认字幕条不随交互损坏、不被遮挡。

## 1. 最终样式（21 页统一，逐字一致）

```css
.hint-bar { width: fit-content; max-width: min(92vw, 760px); margin: 18px auto 0; background: rgba(15,23,42,.82); color: #fff; font-size: 13px; line-height: 1.55; padding: 9px 18px; border-radius: 14px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,.25); }
```

视觉对齐语音版 `.guide-caption`（`content/_lib/guide/guide-core.css:14`，只读参考未改）：深色半透明圆角、白字、居中、`max-width:min(92vw,760px)`、`line-height:1.55`、`padding:9px …`、底部阴影。原「💡」前缀与全部文案一字未改（diff 仅 CSS 规则行 + 节点位置行）。

## 2. 关键偏离与决策记录（同一错误 2 次换思路）

任务书给的 `position:fixed; bottom:110px` 规格，其前提是「页面有底部固定控制栏（~96px）」。grep/实测确认：**c1/c2 这 21 页全部是可滚动长文档，控制按钮在正常文档流内，无任何页面有底部固定控制栏**。因此悬浮字幕在任意滚动位置必然压住流内按钮。三次实测（Playwright，375×667 + 1280×800 双档，逐页 getBoundingClientRect 与全部 button/input/select/a/canvas/.pill/label 求交）：

| 方案 | 结果 | 结论 |
|---|---|---|
| A. 任务书 fixed 底部 110px | 42 组断言 24 组 FAIL（如 mobile exp-motion 压 tlSlider、exp-intro 压 mosqPauseBtn；desktop exp-vacuum 压 playBtn/pumpBtn/resetVac） | 遮控制按钮，违反验收 3 |
| B. sticky 钉底 16px | 42 组 38 组 FAIL（钉住时绘制位置脱离流内保留位，仍压按钮；仅 4 个短页通过） | 同上 |
| C. **流内底部字幕条（最终）** | **42/42 PASS**：零重叠、零横向溢出、文案不截断、console 0 报错 | 结构上不可能遮挡 |

方案 C 保留「字幕形式 + 底部位置」：节点移至 `.container` 末尾（21 页结构经脚本核验完全一致：`</div>` 容器闭合行紧邻首个 `<script`），渲染为页面底部的深色圆角白字字幕条，与语音版视觉一致（截图见 `/tmp/m4test/m4-*-caption.png`）。

**遗留/待蔡总拍板**：流内底部意味着移动端首屏不可见（21 页移动端页高 1.05~3.34 屏，见 §4 表），滚动到页尾才出现。若蔡总要求首屏可见，备选两案（各为单行改动，未实施）：① 节点放回卡片 h2 之后、保持字幕样式（首屏可见、仍零重叠）；② 恢复 fixed 悬浮 + `pointer-events:none`（首屏常驻，但接受视觉上压住流内按钮，验收 3 几何断言将不绿）。

## 3. 位置冲突处理记录

- 21 页均无底部固定元素，无需上移避让；唯一 fixed 元素为 `exp-room` 的 `.fs-float-mat`（仅全屏态出现，左下 z-30）。字幕条在全屏包裹 `#fsRoom` **之外**，伪全屏层 z-index 99999 覆盖全屏视口，字幕条自然隐藏于其下，二者永不共存，无冲突。
- 伪全屏验证（exp-harvester/exp-room/exp-wave，双档）：`wrapCoversViewport=true`、`captionInsideWrap=false`、底部中心命中元素为全屏层内控件（`elementFromPoint` 非 hint-bar）→ 字幕条不拦截全屏内点击，行为与改造前一致（改造前 hint-bar 本就在 fsWrap 之外）。
- 全屏高度计算不受影响：`exp-common.js:33` 遍历 `fsWrap.children`，hint-bar 改造前后均非 fsWrap 子节点。
- z-index：流内方案无需层级，已移除（原方案中 room 页曾设 40，随方案 C 一并移除）。

## 4. 21 页清单 + 实测数据（Playwright chromium headless，双档）

「底距」= 字幕条底边到文档底边距离（= `.container` padding-bottom，桌面 60 / 移动 40，媒体查询所致）；「屏数」= 文档高/视口高。

| 页 | 移动 docH/屏数 | 桌面 docH/屏数 | 底距 移/桌 | 文案字数 | 重叠 | 溢出 | console |
|---|---|---|---|---|---|---|---|
| c1_s2/exp-harvester | 1197 / 1.79 | 1016 / 1.27 | 40/60 | 52 | 0 | 0 | 0 |
| c1_s2/exp-reference | 783 / 1.17 | 991 / 1.24 | 40/60 | 37 | 0 | 0 | 0 |
| c1_s2/exp-motion | 950 / 1.42 | 930 / 1.16 | 40/60 | 27 | 0 | 0 | 0 |
| c1_s2/exp-train | 701 / 1.05 | 800 / 1.00 | 40/74 | 23 | 0 | 0 | 0 |
| c2_s1/exp-wave | 999 / 1.50 | 920 / 1.15 | 40/60 | 71 | 0 | 0 | 0 |
| c2_s1/exp-amp | 1382 / 2.07 | 1203 / 1.50 | 40/60 | 83 | 0 | 0 | 0 |
| c2_s1/exp-vibrate | 1436 / 2.15 | 1228 / 1.54 | 40/60 | 91 | 0 | 0 | 0 |
| c2_s1/exp-vacuum | 1951 / 2.93 | 1769 / 2.21 | 40/60 | 82 | 0 | 0 | 0 |
| c2_s2/exp-intro | 1273 / 1.91 | 1255 / 1.57 | 40/60 | 41 | 0 | 0 | 0 |
| c2_s2/exp-timbre | 1248 / 1.87 | 1033 / 1.29 | 40/60 | 54 | 0 | 0 | 0 |
| c2_s2/exp-ruler | 1069 / 1.60 | 963 / 1.20 | 40/61 | 54 | 0 | 0 | 0 |
| c2_s2/exp-scope | 1182 / 1.77 | 950 / 1.19 | 40/60 | 45 | 0 | 0 | 0 |
| c2_s2/exp-range | 1293 / 1.94 | 1160 / 1.45 | 40/60 | 77 | 0 | 0 | 0 |
| c2_s2/exp-loudness | 1118 / 1.68 | 897 / 1.12 | 40/60 | 57 | 0 | 0 | 0 |
| c2_s3/exp-candle | 1010 / 1.51 | 914 / 1.14 | 40/60 | 45 | 0 | 0 | 0 |
| c2_s3/exp-echo | 1389 / 2.08 | 1243 / 1.55 | 40/60 | 49 | 0 | 0 | 0 |
| c2_s3/exp-huanqiu | 1134 / 1.70 | 1000 / 1.25 | 40/60 | 57 | 0 | 0 | 0 |
| c2_s4/exp-control | 1017 / 1.52 | 800 / 1.00 | 40/280 | 46 | 0 | 0 | 0 |
| c2_s4/exp-wave | 986 / 1.48 | 887 / 1.11 | 40/60 | 35 | 0 | 0 | 0 |
| c2_s4/exp-decibel | 951 / 1.43 | 800 / 1.00 | 40/128 | 46 | 0 | 0 | 0 |
| c2_s5/exp-room | 2227 / 3.34 | 1739 / 2.17 | 40/60 | 46 | 0 | 0 | 0 |

断言口径：滚动首/末两态各测一次；与 button/input/select/a/canvas/.pill/label/.card/.conclusion/h2/p/.note-line/.tl-row/.anim-btns 求交为 0；`scrollWidth <= innerWidth+1`；`scrollHeight <= clientHeight+2`（文案不截断）；`background=rgba(15,23,42,.82)`、`color=rgb(255,255,255)`、`border-radius=14px`、`text-align=center`；末态字幕条在视口内。合计 **42/42 PASS**。

## 5. 交互冒烟（21 页，375×667）

逐页程序化点击全部可见 button/.pill/.mark-toggle/.mat-btn（跳过返回键），再校验 console 与字幕条遮挡：20 页点击数 2~13 次全通过；exp-control 页按钮为拖拽卡片（click 计数 0，拖拽逻辑未触碰）。console 报错 0。伪全屏切换 3 页复验见 §3。

## 6. 验收对照

1. git status：本轮仅 21 页 html 为 M，`.js` 零改动。（工作区另有 `content/physics_g8_v1_c6_s1~s3` 的 exp-mass/exp-density/exp-measure 及其 -core.js 共 6 处 M，为语音波 c6 并行未提交改动，非本轮产生，未触碰。）
2. 每页 grep：新规则命中 `background: rgba(15,23,42,.82)` + `border-radius: 14px` + `text-align: center`；旧规则（`var(--brown-bg)/var(--cyan-bg)` 橙棕底、`margin-bottom:14px`、c1 系 `display:flex`）已全部替换，21/21。
3. 浏览器实测：见 §4（42/42）+ §3 全屏 + §5 冒烟；截图 `/tmp/m4test/m4-wave-375-*.png`、`m4-harvester-1280-*.png`、`m4-room-375-*.png`。
4. js 动态写 hint：grep 0 命中，N/A；以 21 页交互冒烟替代（§5）。
5. 本报告。

M3b 三件套复核：21 页 `user-scalable=no`、`tap-highlight-color: transparent` 全在；common.css `touch-action` 在；本轮未破坏。

=== DONE ===
/Users/personal/projects/keben_web/docs/mobile-wave-M4-report.md

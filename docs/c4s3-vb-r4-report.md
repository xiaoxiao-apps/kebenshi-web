# c4s3 vB 语音版修复轮 r4 验收报告（2026-10-26）

蔡总三条反馈：①步骤解说可重复播报 ②只字幕模式 🔇 居中 ③休眠 💤 恢复第1版（r2）圆外右上角。

## 改动范围（红线自查）

`git status --short`：

```
 M content/physics_g8_v1_c4_s3/exp-mirror-vB.html
 M content/physics_g8_v1_c4_s3/guide/engine.js
 M content/physics_g8_v1_c4_s3/guide/guide.css
 M content/physics_g8_v1_c4_s3/guide/script.js
?? .DS_Store
```

仅任务书允许的 5 文件中的 4 个 M（vB.js 零改动——applyMode 本就挂 `mode-text`/`mode-sleep` 类，CSS 选择器即可区分两态）。`?? .DS_Store` 为会话开始前已存在的系统文件。vA.js/vC.js/vD.js/hub.html/其余变体页/生产文件/guide/audio/ 零触碰。未 commit/push。

## 1. 语法检查

`node --check` engine.js / script.js / vB.js 全过（ALL-OK）。

## 2. engine.js · repeat 支持（向后兼容自查）

新增引擎私有状态 `repPrev / repLast / fireCount / seenCount` + `REP_COOLDOWN=3000`：

- **非 repeat 路径零变化**：tickSteps 中 `else if(fired[st.id])continue`、delay 的 `sched`、after 的 `fired[p.afterId]` 判定、hold 达成 `fired[st.id]=true;fireStep`、表达式 `fired[st.id]=true;fireStep` 全部原样保留在 `st.repeat` 为假的分支；sched 回调非 repeat 分支原样。fireStep 仅加一行 `fireCount[id]+1`（纯计数，不影响行为）。
- **repeat+表达式**：每帧存档上一帧电平 `rPrev`，上升沿（v&&!rPrev）且距上次触发 ≥3s → fireStep；不写 firedSteps、不执行 saidFlag（script.js 已删净 saidFlag 字段，该分支实际不再命中）。
- **repeat+@holdMs**：hold 计时复用现有 `hold[]`，达成时走同样的边沿（!rPrev，即上次达成后条件曾中断）+3s 冷却判定。
- **repeat+delay**：sched 回调跳过 fired 检查（仅 curMode===mode），onModeEnter 清 stepSched+clearRepeatState → 每次进模式重新延时触发（m2-s1/m3-s1 重进模式重播，一并修复）。
- **repeat+after:ID@ms**：fireStep 每次给 `fireCount[id]` 计数；repeat+after 步骤 `fireCount[afterId] > seenCount[st.id]` 且无 pending sched → seenCount 更新并 sched(afterMs)（m1-concl/m2-concl/m3-s5/m3-concl 随依赖步重发）。
- clearRepeatState() 遍历全部模式 steps 清 4 组状态（step id 全局唯一，跨模式不残留）；init() 同步初始化。
- `if(R.matched)G.everMatched=true`（tick 内）保留不动，free 的 matchedEdgeCount 逻辑未触碰。

## 3. script.js diff 范围

仅三个 steps 数组 22 条数据行变化：每条 +`repeat:true`；删 7 处一次性闸门（m1-s1/m1-s5 的 `!G.everMatched`、m2-s2 `!G.raySaid`、m2-s4 `!G.inBeamSaid`、m2-s5 `!G.spSaid`、m3-s2 `!G.firstSlotSaid`、m3-s3 `!G.bothSlotSaid`、m3-s4 `!G.pathSaid`）；删 6 处 `saidFlag` 字段；m1-s1 trigger 改为 `R.objLit===true && R.eqState==='off'`；m1-s5 改为 `R.matched===true`；m1-s2 拖动新鲜度条件保留。say 文案/audio id/id/errors/free/tasks/cSequence/audios/intro 零 diff（diff --stat：script.js 22 行替换，均在 steps 数组内）。

## 4. guide.css · 角标两态

- `.gvb-fab-badge` 基础样式逐字恢复 r2（f73bf32）版：`top:-6px;right:-6px;font-size:14px;drop-shadow`，无白底托/border/box-shadow（sleep 💤 = 圆外右上角）。
- 新增 `.gvb-fab.mode-text .gvb-fab-badge`：`left:50%;top:50%;translate(-50%,-50%)` + 56% 白圆底托 → 🔇 圆正中间。
- 删除 r3 追加的移动端 `.gvb-fab-badge{font-size:11.5px}`（r2 无此规则，恢复一致）。

## 5. exp-mirror-vB.html

仅 guide 三脚本 + guide.css 引用 `?v=20261026g4` → `g5`（render/core 的 g1 不动）。

## 6. 浏览器实测（headless Chrome + playwright-core，http://localhost:8848，18/18 PASS）

字幕断言用 MutationObserver 记录 `.guide-caption-text` 全部出现次数；voice 态、`--autoplay-policy=no-user-gesture-required`，先等 intro 播完清空记录再断言。

| # | 断言 | 结果 | 证据 |
|---|------|------|------|
| a1 | matched=true → m1-s5「重合了」出现 | PASS | count≥1 |
| a2 | m1-concl「因此我们得出结论」出现 | PASS | count≥1 |
| a3 | matched false→等3.6s→true → m1-s5 **再次**出现 | PASS | count=3（含 a1 与后续边沿） |
| a4 | matched 再走一遍 → m1-concl 再次出现 | PASS | count=2 |
| b1 | objLit=true → m1-s1「点燃啦」出现 | PASS | count≥1 |
| b2 | 吹灭 3.6s 再点燃 → s1 重播 | PASS | count=3 |
| c1 | matched true→false→true 间隔 <3s → 不重播 | PASS | 3→3（冷却生效，无刷屏） |
| d1 | text 态 🔇 badge 中心与 fab 中心偏差 ≤3px | PASS | dx=0, dy=0, glyph=🔇, class=gvb-fab mode-text |
| d2 | sleep 态 💤 badge 在 fab 圆外右上 | PASS | top<fab.top 且 right>fab.right 均 true |
| d3 | voice 态无 badge（纯净头像） | PASS | count=0 |
| e | vB/vA/vC/vD 四页 console 0 报错 | PASS | 0 errors |

## 7. 回归 vA/vC/vD

- vA：`.guide-card` 老师卡在位，m1→m2→m3→m1 场景切换正常，0 报错（tasks 链不经 steps，不受影响）。
- vC：`.guide-topbar` 顶栏在位，场景切换正常，0 报错（引导用 cSequence，零改动）。
- vD：字幕条 `.guide-caption` 在位；点燃 → 「点燃啦」字幕出现 1 次；objLit <3s 快速 off→on 重演 → 计数 1→1 **不刷屏**（同条 3s 冷却生效）；0 报错。vD 步骤字幕获得与 vB 一致的重复播报能力（预期内一致行为）。

## 结论

三条反馈全部修复并实测通过：触发动作重复发生即重复播报（3s 冷却防刷屏，concl 随依赖步重发，重进模式 delay 步重播）；🔇 圆心正中（偏差 0px）；💤 恢复 r2 圆外右上角样式。红线内 4 文件 M、vB.js 零改动、未 commit/push。

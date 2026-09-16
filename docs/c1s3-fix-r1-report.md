# c1s3 第1轮修复报告 · 双车运动对比逐帧按钮

**文件**：`content/physics_g8_v1_c1_s3/exp-motion.html`（仅此一个）

## 验收项
播放至终点（t=40）后，"⏭ 逐帧 +10s" 按钮无反应 → 改为自动置灰不可点击。

## 改了什么
1. JS 新增唯一状态刷新口 `updateControls()`：`btnStep.disabled = t >= 40;`
   - 挂在 `draw()` 末尾，所有改变 t 的路径（tick 播放结束、逐帧、重播、播放）
     都必经 `draw()`，因此按钮状态与实际时刻永不脱节，无需新增分支。
2. CSS 增加 `:disabled` 样式：灰边框/灰底/灰字 + `cursor: not-allowed`；
   hover 规则加 `:not(:disabled)`，避免置灰后仍显示悬停高亮误导。
3. 取按钮引用为 `btnStep` 变量，事件绑定同步复用（行为不变）。

## 怎么验证的
- 三重自查：`head -3` 有 DOCTYPE；`tail -2` 为 `</body></html>`；`grep -c "</html>"` = 1。
- 内联 JS 抽出后 `node --check` 通过。
- 逻辑回归（node 模拟）：t=0 可点 / t=30 可点 / t=40 置灰 / 重播回 t=0 恢复可点，全部符合预期。
- 本地服务 `http://localhost:8642/content/physics_g8_v1_c1_s3/exp-motion.html`
  curl 命中新标记 `updateControls` ×2，服务端已提供改后文件。

## 自查结果
DOCTYPE ✓ | 闭合 ✓ | `</html>`=1 ✓ | node --check ✓ | curl 命中 ✓ | 逻辑回归 ✓

## 备注（未改，属既有设计）
`t>=40` 时"播放"按钮内部已有 `if (t >= 40) t = 0` 自动从头重播，故未置灰；
"暂停"在终点后点击无害，保持原样以最小化改动范围。

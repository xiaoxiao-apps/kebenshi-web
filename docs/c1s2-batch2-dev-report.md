# c1s2 批2 开发报告（exp-reference / exp-train）

日期：2026-09-14　执行人：修复员（subagent）

## 批2 文件状态
1. **exp-reference.html**：已由总经理补齐 `</body></html>` 闭合，本批次未再改动。
2. **exp-train.html**：修复状态机 bug（见下）。

## 已修复 bug（exp-train.html）
- **症状**：主按钮点击无效，控制台 `TypeError: Cannot read properties of undefined (reading 'next')`。
- **根因**：`info` 用字符串键（SIT/FEEL/…），而 `state.step` 为数字（ST.SIT=0…ST.CONCLUSION=4），`info[cur]` 取到 undefined。
- **修复**：`info` 改为按数字索引数组 `info[ST.SIT]=…` 逐项赋值；text/next/btn 三字段内容原样保留。
- **连带修正**：
  - `setStep` 按钮文案改为 `info[step].text`（CONCLUSION 态用 `info[4].btn`「⟲ 再体验一次」），与验收序列一致；
  - VERIFY 态点击参照物 pill 后自动进入 CONCLUSION（触发结论）。

## 自测结果（http://localhost:8902/exp-train.html，server 保留运行）
- 按钮序列：▶ 坐在车厢里 → 继续：好像动了？ → 继续：驶过车尾 →（VERIFY：主按钮隐藏、refPills 出现）→ 点 🚉站台 pill → 结论显示 → ⟲ 再体验一次 → 回初始态。✅
- 结论文案：「以【站台】为参照物，你乘坐的列车：静止」✅
- window error 监听 + console：无 JS 报错（无 favicon 404 干扰）。✅
- 截图：docs/qa_screenshots/c1s2-exp-train-fix.jpg，布局无破损。✅

## 遗留问题
- 无阻塞项。建议后续批次回归时顺带验证「旁边列车」参照物分支（本次仅按验收用例测 platform 分支，代码路径对称）。

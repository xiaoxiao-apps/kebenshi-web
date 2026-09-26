# c3s2 R7 修复报告

## 修改文件
- `content/physics_g8_v1_c3_s2/exp-melt-chart.js`
- `content/physics_g8_v1_c3_s2/exp-melt.html`
- `content/physics_g8_v1_c3_s2/exp-melt-stage3.css`

## 项A：浮窗拖动回看/双击回最新
- `bindFloatPan`：dblclick 绑定到 canvas 父级 wrap，排除关闭/最新按钮。
- 新增 wrap 级手动 double-tap 检测（两次 pointerup <350ms 且位移<10px）。
- `moveToRight` 后调用 `updateFloatLatestBtn`，回看态时「最新」按钮高亮。
- 浮窗标题栏新增提示文案「拖动回看历史·双击回最新」。
- 浏览器真实输入验证：桌面鼠标拖拽、双击回最新均正常；iPhone 12 触控拖拽、双击回最新均正常。

## 项B：教材曲线浮窗运行期闪现
- 删除 `renderTextbookChart` 尾部的 `card.style.display='none'`。
- 新增 `hideSegmentCard()`，仅在切图按钮、切离 textbook、关闭浮窗、stage 空白处调用。
- 验证：运行中记录数据 → 浮窗仍 `display:flex`、卡片文案不变；关闭浮窗后 `display:none`；切换「晶体凝固」后旧卡片隐藏、FG 段新文案正确；暂停态稳定。

## 自查
- `node --check exp-melt-chart.js` 通过。
- `curl` 页面含 2 处「双击回最新」。
- 浏览器 console errors：0 条。

## 截图
- `docs/c3s2-r7-float-pan.png`
- `docs/c3s2-r7-popup-stable.png`

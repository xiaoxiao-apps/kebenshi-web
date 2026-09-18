# c2s2 F1 修复报告

文件：`content/physics_g8_v1_c2_s2/explain.html`

## 修改项

1. 删除副标题中“四个 Tab 一次讲清”字样。
2. Tab1「想一想」移到钢尺结论后、频率概念前；按钮指向 `exp-ruler.html`。
3. 蚊子/蝴蝶卡片新增「去互动体验 →」按钮，指向 `exp-intro.html`。
4. 4 个 Tab 的「想一想」按钮分别直达 `exp-ruler.html`、`exp-loudness.html`、`exp-timbre.html`、`exp-range.html`。
5. Tab1 波形演示重绘为虚线网格 SVG：红色高音调（密集）、蓝色低音调（稀疏），峰谷占网格高度约 70%，含图例。
6. Tab2 音叉乒乓球配图重绘为写实 SVG：铁架台、U 形音叉、细线吊球，轻敲/重敲两状态标幅度差。
7. Tab2 振幅-响度波形重绘为同款网格 SVG：红色振幅大、蓝色振幅小，频率相同。
8. Tab2「想一想」移到演示步骤后、振幅概念前。
9. Tab3 新增波形对比 SVG：音叉（红）、钢琴（蓝）、长笛（绿），同频率、形状不同，配要点文字。
10. Tab4 新增生物听觉频率分段 SVG：对数坐标 1 Hz~200 kHz，六动物分段着色，hover/click 浮层显示范围与应用，区分次声/超声底色。

## 验证

- HTML 首尾检查、`</html>` 唯一。
- 内联 JS 抽出后 `node --check` 通过。
- `curl` 命中「去互动体验」「wave-legend」「bio-seg」新标记。
- 浏览器 4 个 Tab 自查截图：`c2s2-fix1-t1.png`、`c2s2-fix1-t2.png`、`c2s2-fix1-t3.png`、`c2s2-fix1-t4.png`。
- 仅修改 `explain.html`，未提交 git。

# c1s4 explain.html 验收缺陷修复报告

## 修改文件
- `/Users/personal/projects/keben_web/content/physics_g8_v1_c1_s4/explain.html`

## 修复内容
1. **可见即画**：新增 `drawWhenVisible(canvas, drawFn)`，用 `IntersectionObserver` 在 canvas 进入视口且尺寸>0 时补画，解决 Tab/子栏目隐藏时初始化空白的问题。
2. **超声波最终态**：
   - 动画完成后保留去程线（上偏 5px）和回程线（下偏 5px）。
   - 两条路径上各放一个 `s` 标注，分别位于 1/3 和 2/3 处，避免重叠。
   - 动画结束后清除脉冲点，下次发射时整体重置。
3. **区间测速**：初始状态改为汽车在左侧待命（`startX=70`），道路/摄像头/标注就位；进入可见时自动开始演示，保留重新演示按钮逻辑。

## 验证
- 浏览器实测：切到「常用测速工具」→ 超声波场景立即可见。
- 切到「区间测速」→ 道路+摄像头+汽车+标注立即可见，重新演示正常。
- 超声波播放结束后：双路径 + 双 `s` 标注常留。

## 工程纪律
- 仅修改 `explain.html`。
- 提取 inline JS 后 `node --check` 通过。
- 三重自查：
  - `head -3` → `<!DOCTYPE html>`
  - `tail -2` → `</body>\n</html>`
  - `grep -c '</html>'` → 1

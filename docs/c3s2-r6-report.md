# c3s2 R6 修复报告

## 改动文件
- `content/physics_g8_v1_c3_s2/exp-melt-chart.js`
- `content/physics_g8_v1_c3_s2/exp-melt.html`

## 改动与验证

1. **横轴拖动钳位**：`moveToRight` 右缘 clamp 到 `[窗口, max(tMax, 窗口)]`，左缘始终 ≥0，轴域不变。验证：猛拖后 xMin=0、xMax 与拖前一致。
2. **实时按钮**：小图头部新增「实时」按钮，回看态显示；点击恢复跟随最新。验证：拖入回看态后按钮可见，点击后 livePanRight=null。
3. **教材曲线段浮窗**：新增 `SEGMENT_INFO` 与 8px 线段/贝塞尔命中检测，熔化/凝固各段文案齐全。验证：BC、FG 段点击弹出含温度/吸放热/状态三要素。
4. **端点说明稳定显示**：端点与线段统一处理，浮窗带 ×，点击空白处可关，3 秒后仍显示。验证：A、E 端点弹窗稳定可关。

## 截图
- `docs/c3s2-r6-drag-clamp.png`
- `docs/c3s2-r6-live-btn.png`
- `docs/c3s2-r6-seg-popup.png`

## 自查
- `node --check exp-melt-chart.js` 通过。
- HTML DOCTYPE/`</html>`/单 `</html>` 通过；curl 含「实时」≥1 通过。
- 浏览器新标签验证零 console error。

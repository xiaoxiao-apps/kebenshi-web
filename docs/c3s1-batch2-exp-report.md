# c3s1「温度」实验区开发批C报告

## 文件清单

| # | 文件 | 说明 | 行数 |
|---|---|---|---|
| 1 | content/physics_g8_v1_c3_s1/experiment.html | 实验区中转页（nav-card 网格） | 103 |
| 2 | content/physics_g8_v1_c3_s1/exp-hands.html | G1 冷热感觉不可靠 | 76 |
| 3 | content/physics_g8_v1_c3_s1/exp-hands.js | G1 3D 逻辑 | 122 |
| 4 | content/physics_g8_v1_c3_s1/exp-expand.html | G2 液体热胀冷缩 | 64 |
| 5 | content/physics_g8_v1_c3_s1/exp-expand.js | G2 3D 逻辑 | 102 |
| 6 | content/physics_g8_v1_c3_s1/exp-use.html | G3 温度计使用 | 86 |
| 7 | content/physics_g8_v1_c3_s1/exp-use.js | G3 3D 逻辑 | 116 |
| 8 | content/physics_g8_v1_c3_s1/exp-clinical.html | G4 体温计缩口 | 63 |
| 9 | content/physics_g8_v1_c3_s1/exp-clinical.js | G4 3D 逻辑 | 108 |
| 10 | content/physics_g8_v1_c3_s1/exp-read.html | G5 温度计读数 | 58 |
| 11 | content/physics_g8_v1_c3_s1/exp-read.js | G5 SVG 程序化渲染 | 96 |
| 12 | content/physics_g8_v1_c3_s1/exp-types.html | G6 各种各样的温度计 | 50 |
| 13 | content/physics_g8_v1_c3_s1/three.min.js | 本地化 three.js | 4 |

> 注：three.min.js 为二进制压缩文件，行数按 `wc -l` 输出为 4。

## 自查结果

- **node --check**：全部 JS 通过（exp-back.js/exp-common.js/exp-hands.js/exp-expand.js/exp-use.js/exp-clinical.js/exp-read.js/fullscreen.js）。
- **HTML 首尾完整**：experiment.html 及 6 个实验页均包含 `<!DOCTYPE html>` 与 `</html>`。
- **explain_tab key**：仅 exp-back.js 使用 `c3s1_explain_tab`，未在其他页面误用。
- **素材库**：未新增图片/音频素材，无需渲染或索引。
- **禁改文件**：未修改 app.js/explain.html/summary.html/index.html/quiz.html/4 共用文件。
- **37℃左右**：已按教材原文保留无空格写法。

## 待定夺项

1. **G1 exp-hands**：左右手 3D 模型与杯子位置较紧凑，蔡总可接受当前简化表现。
2. **G3 exp-use**：读数步骤交互简化为按钮触发，是否需要更严格的 3D 拖拽/动画可后续打磨。
3. **G5 exp-read**：体温计刻度按 0.1℃ 分度出题，但实际 SVG 主刻度仅显示整数，需确认是否足够清晰。

## 说明

本次未涉及 git、未部署线上；所有改动均限制在 `content/physics_g8_v1_c3_s1/` 内。实验页均通过 `data-back` + `exp-back.js` 实现导航守恒与 from/tab 透传。

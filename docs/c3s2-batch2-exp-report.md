# c3s2「熔化和凝固」实验区开发批D 报告

## 文件清单

| 文件 | 路径 | 行数 | 说明 |
|------|------|------|------|
| experiment.html | content/physics_g8_v1_c3_s2/experiment.html | 83 | 中转页，6 个 nav-card 网格，from/tab 参数透传 |
| exp-melt.html | content/physics_g8_v1_c3_s2/exp-melt.html | 82 | G1 海波/石蜡熔化 3D 实验页 |
| exp-melt.js | content/physics_g8_v1_c3_s2/exp-melt.js | 124 | 3D 水浴加热、温度计、实时描点、数据表 |
| exp-crystal.html | content/physics_g8_v1_c3_s2/exp-crystal.html | 56 | G2 晶体/非晶体微观结构页 |
| exp-crystal.js | content/physics_g8_v1_c3_s2/exp-crystal.js | 95 | 晶格/无序粒子动画 + 温度曲线联动 |
| exp-table.html | content/physics_g8_v1_c3_s2/exp-table.html | 57 | G3 熔点表查询页 |
| exp-table.js | content/physics_g8_v1_c3_s2/exp-table.js | 43 | 晶体熔点表筛选/排序 |
| exp-heat.html | content/physics_g8_v1_c3_s2/exp-heat.html | 56 | G4 熔化吸热/凝固放热场景页 |
| exp-heat.js | content/physics_g8_v1_c3_s2/exp-heat.js | 80 | 饮料加冰 + 菜窖放水 3D 动画 |
| exp-graph.html | content/physics_g8_v1_c3_s2/exp-graph.html | 51 | G5 熔化图像分段标注页 |
| exp-graph.js | content/physics_g8_v1_c3_s2/exp-graph.js | 83 | 曲线分段点击标注 |
| exp-compare.html | content/physics_g8_v1_c3_s2/exp-compare.html | 50 | G6 熔化/凝固曲线对比页 |
| exp-compare.js | content/physics_g8_v1_c3_s2/exp-compare.js | 75 | 动态对比绘制 |
| three.min.js | content/physics_g8_v1_c3_s2/three.min.js | 6 | 从 c2_s5 复制本地化 |

**合计：14 个文件，941 行（含 three.min.js 6 行包装）。**

## 自查结果

- **node --check**：exp-melt.js / exp-crystal.js / exp-heat.js / exp-table.js / exp-graph.js / exp-compare.js 全部通过。
- **HTML 首尾完整**：全部 7 个 HTML 文件均有 `<!DOCTYPE html>`、`</body></html>` 完整结束。
- **参数透传/导航守恒**：experiment.html 参照 c2s4 实现 nav-card from/tab 参数透传；各实验页返回 `experiment.html` 并带 data-back。
- **explain_tab key**：未改动，grep 仅命中原有 `c3s2_explain_tab` 记录。
- **禁改文件**：未修改 app.js / explain.html / summary.html / index.html / quiz.html / common.css / exp-back.js / exp-common.js / fullscreen.js。
- **数字保真**：海波熔点 48℃、计时起点 40℃、记录间隔 1min、冰 0℃ 已落实。

## 待定夺项

1. exp-melt 中温度计刻度为示意，是否需按 40℃ 起点做精确读数标注？
2. exp-heat 粒子效果为示意性热流粒子，未使用 sprite，后续如需更真实效果需素材库补充。
3. exp-crystal 的微观粒子运动为示意模型，晶体熔化后粒子振动幅度增大，非晶体粒子自由移动。

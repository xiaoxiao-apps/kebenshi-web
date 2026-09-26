# c3s2「熔化和凝固」开发批B 报告

## 文件清单

| # | 文件 | 行数 | 说明 |
|---|---|---|---|
| 1 | `content/physics_g8_v1_c3_s2/index.html` | 49 | 本节导航页 |
| 2 | `content/physics_g8_v1_c3_s2/explain.html` | 138 | 知识讲解（4 Tab） |
| 3 | `content/physics_g8_v1_c3_s2/summary.html` | 137 | 本节小结（4 导图 + 数字速记） |
| 4 | `content/physics_g8_v1_c3_s2/experiment.html` | 24 | 互动探索区骨架页 |
| 5 | `content/physics_g8_v1_c3_s2/quiz.html` | 24 | 小练习骨架页 |
| 6 | `content/physics_g8_v1_c3_s2/common.css` | 372 | 拷贝自 c2s1 |
| 7 | `content/physics_g8_v1_c3_s2/fullscreen.js` | 82 | 拷贝自 c2s1 |
| 8 | `content/physics_g8_v1_c3_s2/exp-back.js` | 36 | 拷贝自 c2s1，已改 key |
| 9 | `content/physics_g8_v1_c3_s2/exp-common.js` | 45 | 拷贝自 c2s1 |

## 页面覆盖

- index.html：章标识「第三章 物态变化」+ 节标题「第2节 熔化和凝固」+ 4 张导航卡。
- explain.html：4 个 Tab：① 物态变化；② 熔化实验；③ 熔点和凝固点；④ 吸热与放热。
- summary.html：4 支知识导图 + C 类数字速记（覆盖表3.2-1 全部 14 种晶体熔点）。
- experiment.html / quiz.html：骨架页，含「内容即将上线」占位卡。

## 自查结果

- `node --check` 通过：`exp-back.js`、`exp-common.js`、`fullscreen.js`。
- `c3s2_explain_tab` key 一致：
  - `exp-back.js:14` 读取 `c3s2_explain_tab`
  - `explain.html:124` 写入 `c3s2_explain_tab`
- 表3.2-1 数字逐字与 `c3s2-textbook-analysis.md` 一致。
- 未触碰根目录 `app.js` 及 `c3s1` 目录。

## 待蔡总定夺项

1. **Tab 2「熔化实验」想一想**：目前使用 `<details>` 折叠答案（选 b）。若后续实验页有对应海波/石蜡熔化实验入口，可改为直跳 `experiment.html?from=explain&tab=t2`。
2. **Tab 4「吸热与放热」想一想**：答案中补充了教材未明确列出的生活实例（如冰袋降温、干冰升华）。如要求严格教材保真，可删除补充部分，仅保留饮料加冰、菜窖放水。
3. **骨架页后续安排**：experiment.html 与 quiz.html 本批为占位页，后续是否由同一子代理继续开发，或另开实验/练习批次，请蔡总指示。

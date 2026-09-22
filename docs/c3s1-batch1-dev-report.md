# c3s1「温度」开发批 A 报告

## 1. 文件清单

| 文件 | 来源 | 行数 |
|---|---|---|
| `common.css` | 拷贝 c2s1 | 372 |
| `fullscreen.js` | 拷贝 c2s1 | 82 |
| `exp-back.js` | 拷贝 c2s1，改 key | 36 |
| `exp-common.js` | 拷贝 c2s1 | 45 |
| `index.html` | 新建 | 49 |
| `explain.html` | 新建 | 180 |
| `summary.html` | 新建 | 118 |
| `experiment.html` | 新建骨架 | 26 |
| `quiz.html` | 新建骨架 | 26 |

## 2. 页面覆盖

- **index.html**：第三章 物态变化 · 第1节 温度，4 张导航卡。
- **explain.html**：4 个 Tab — ①温度与温度计、②摄氏温度、③温度计的使用、④各种各样的温度计。
- **summary.html**：知识导图 + 数字速记（0℃ / 100℃ / 37℃ 左右 / -53℃ 等）。
- **experiment.html / quiz.html**：骨架页，"内容即将上线"。

## 3. 自查结果

- `exp-back.js` 与 `explain.html` 两处 key 均改为 `c3s1_explain_tab`，一致。
- `node --check` 通过：exp-back.js、fullscreen.js、exp-common.js，explain/summary 内嵌 JS 也已检查。
- explain.html 想一想 4 题均用 `<details>` 折叠，无重复实验入口问题。
- 教材数字严格照 analysis 清单，未改动。

## 4. 待蔡总定夺项

1. **实验页入口**：当前 4 个想一想均未直跳实验页。后续若要为 Tab1「自制温度计」、Tab3「温度计使用」开设独立实验，可把对应想一想改为跳 `experiment.html?from=explain&tab=tX`。
2. **explain.html 图片占位**：目前仅用文字描述教材图号（图 3.1-2 / 3.1-4 / 3.1-5），后续是否替换为教材照片/示意图待批。
3. **quiz.html 题目形式**：练习与应用 4 题，后续是否做成选择/填空/计算交互待批。
4. **科学世界拓展**：P61 体温计/红外/热电偶已在 explain Tab4 和 summary 中保留，是否需单独小页或动画待批。

## 5. 注意事项

- 未触碰根目录 `app.js`，路由登记待上线轮处理。
- 未使用 git。
- 所有操作仅在 `~/projects/keben_web/content/physics_g8_v1_c3_s1/` 内进行。

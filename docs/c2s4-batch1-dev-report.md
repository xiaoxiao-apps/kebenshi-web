# c2s4「噪声的危害和控制」Batch1 开发报告

> 开发员：子代理 | 日期：2026-09-20 | 范围：目录骨架 + 知识讲解 + 小结 + 占位页

## 文件清单与行数

| 文件 | 行数 | 说明 |
|---|---|---|
| `content/physics_g8_v1_c2_s4/index.html` | 49 | 本节导航页 |
| `content/physics_g8_v1_c2_s4/explain.html` | 264 | 知识讲解（3 Tab） |
| `content/physics_g8_v1_c2_s4/summary.html` | 95 | 本节小结 |
| `content/physics_g8_v1_c2_s4/experiment.html` | 28 | 互动探索区占位页 |
| `content/physics_g8_v1_c2_s4/quiz.html` | 28 | 小练习占位页 |
| `content/physics_g8_v1_c2_s4/common.css` | 372 | 从 c2s3 拷贝 |
| `content/physics_g8_v1_c2_s4/fullscreen.js` | 82 | 从 c2s3 拷贝 |
| `content/physics_g8_v1_c2_s4/exp-back.js` | 55 | 从 c2s3 拷贝，key 已改 |
| `content/physics_g8_v1_c2_s4/exp-common.js` | 45 | 从 c2s3 拷贝 |

## 页面覆盖

- **index.html**：章标识「第二章 声现象」+ 节标题「第4节 噪声的危害和控制」+ 4 张导航卡（知识讲解/互动探索区/小练习/本节小结）。
- **explain.html**：3 个 Tab——① 噪声的来源（含问题导入 + 图2.4-1 SVG 噪声波形）② 噪声的危害（含想想议议 + 小资料 dB 表格，数字逐字）③ 控制噪声（含图2.4-3/2.4-4 示意 + 三途径卡片）。每 Tab 末「想一想」采用 details 查看答案方案，答案含机制与易混点。
- **summary.html**：结构化知识导图，覆盖来源/危害/控制三途径/小资料数字速记（30~40 dB、70 dB、90 dB、150 dB、三个「不能超过」）。
- **experiment.html / quiz.html**：占位页，标题/导航/返回链接 +「内容即将上线」卡片。

## 自查结果

- HTML 文件：全部以 `<!DOCTYPE html>` 开头、`</html>` 结尾。
- JS 文件：`node --check` 全部通过（exp-back.js / exp-common.js / fullscreen.js）。
- key 一致性：`exp-back.js` 与 `explain.html` 均使用 `c2s4_explain_tab`，grep 通过。
- 未提交 git，未修改 app.js、c2s3、c2s5 目录。
- 未做浏览器截图/live 验证（符合规则7）。

## 遗留问题

1. 实验区（噪声波形、分贝计、控制三途径分类）待后续批次开发。
2. 练习区（教材练习与应用 ①~⑤）待后续批次开发。
3. explain.html 中「想一想」当前采用 (b) 方案 details 展开；后续实验区建成后需评估是否改为直跳链接。

# c2s5「跨学科实践：制作隔音房间模型」Batch1 开发报告

## 范围
本次只完成目录骨架、知识讲解、本节小结、互动探索区/小练习占位页。不碰 app.js、不碰 c2s3/c2s4、不 commit、不做浏览器截图。

## 文件清单
| 文件 | 行数 | 说明 |
|---|---|---|
| content/physics_g8_v1_c2_s5/index.html | 49 | 节导航页，4 张卡片 |
| content/physics_g8_v1_c2_s5/explain.html | 220 | 4 Tab 知识讲解，含 SVG 插图 |
| content/physics_g8_v1_c2_s5/summary.html | 74 | 本节小结知识导图 |
| content/physics_g8_v1_c2_s5/experiment.html | 25 | 互动探索区占位页 |
| content/physics_g8_v1_c2_s5/quiz.html | 24 | 小练习占位页 |
| content/physics_g8_v1_c2_s5/common.css | 372 | 从 c2s3 拷贝 |
| content/physics_g8_v1_c2_s5/fullscreen.js | 82 | 从 c2s3 拷贝 |
| content/physics_g8_v1_c2_s5/exp-back.js | 55 | 从 c2s3 拷贝，key 已改 c2s5 |
| content/physics_g8_v1_c2_s5/exp-common.js | 45 | 从 c2s3 拷贝 |

## 页面覆盖
- index.html：章标识「第二章 声现象」+ 节标题 + 4 张导航卡。
- explain.html：项目提出 / 项目分析 / 项目实施 / 展示交流 4 Tab；每 Tab 末「想一想」用 details/summary 内置答案；图 2.5-1、图 2.5-2 用内联 SVG 示意。
- summary.html：项目全流程 + 核心操作 + 隔音材料评价四维度 + 数字速记。
- experiment.html / quiz.html：占位页，标题/导航/返回链接 + 即将上线卡片。

## 自查结果
- exp-back.js 与 explain.html 的 sessionStorage key 均为 `c2s5_explain_tab`：一致。
- HTML 全部 DOCTYPE 开头、`</html>` 结尾。
- node --check 通过（exp-back.js / fullscreen.js / exp-common.js）。
- 拷贝后已改 key，grep 自查确认无 `c2s3_explain_tab` 残留。

## 遗留问题
- 互动探索区、小练习为占位页，需后续批次填充。

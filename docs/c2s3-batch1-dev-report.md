# c2s3「声的利用」Batch1 开发报告（2026-09-19）

## 输入
- 教材照片 3 张（桌面可交互教学/2.3，IMG_0149~0151，HEIC→JPG 存 `可交互教材/c2s3_photos/`），页脚 P44–P48。
- 依据：`docs/c2s3-transcript.md`（175 行，0 处 ⚠️）、`docs/c2s3-textbook-analysis.md`。
- 规则：`可交互教材/开发规则.md` 四条（导航守恒/教材保真/物理语义/物理保真）。

## 文件清单（content/physics_g8_v1_c2_s3/）
| 文件 | 行数 | 说明 |
|---|---|---|
| common.css / fullscreen.js / exp-back.js / exp-common.js | 372/82/42/45 | 自 c2s2 拷贝；exp-back.js 的 sessionStorage key 改 c2s3 |
| index.html | 49 | 章标识+节标题+4 导航卡 |
| explain.html | 276 | 4 Tab（声与信息·自然/声与信息·应用/声与能量/建筑声学），每 Tab 末「想一想」不附答案 |
| summary.html | 89 | 导图：声与信息、声与能量、建筑声学、信息vs能量辨析、数字速记 |
| experiment.html / quiz.html | 29/29 | 骨架占位「内容即将上线」，返回链接正确 |

docs/ 新增：c2s3-transcript.md、c2s3-textbook-analysis.md、本报告。

## 页面覆盖
- 教材栏目全覆盖：问题、声与信息（P44–45）、声与能量+演示（P45–46）、科学世界（P46–47）、练习与应用①~⑤（转录在册，练习页后续批次）。
- 插图 12 幅全部以图号+示意卡/SVG 呈现（图2.3-9 圜丘反射路径为 SVG 重绘）。
- 数字逐字一致：1530 年、约 5 m、约 11.5 m、约 0.07 s、4 s、1 500 m/s、54 km/h、392 Hz。

## 自查结果
- 5 个 HTML 首尾完整（DOCTYPE/html 闭合）；3 个 JS `node --check` 通过。
- 返回链接：子页均 `‹ 返回本节/本节导航`；explain 记录 `c2s3_explain_tab`，exp-back.js 读同 key 回跳（导航守恒）。
- 单次 write/append ≤150 行；explain 分 3 段落盘，wc -l 递增（98→198→276）。
- 未 commit、未动 app.js 与范围外文件。

## 后续批次候选
- Batch2：实验区（回声定位测距、圜丘回声 0.07 s、烛焰颤动、音乐公路 λ=v/f）。
- Batch3：练习区 ①~⑤ 判分（①3 000 m；⑤≈0.038 m）。

# c2s2「声音的特性」开发批次1 报告

## 完成文件清单

| 类型 | 文件 | 说明 |
|------|------|------|
| 样式/JS | `content/physics_g8_v1_c2_s2/common.css` | 从 c2s1 拷贝，节内通用 |
| JS | `content/physics_g8_v1_c2_s2/fullscreen.js` | 从 c2s1 拷贝 |
| JS | `content/physics_g8_v1_c2_s2/exp-back.js` | 从 c2s1 拷贝 |
| JS | `content/physics_g8_v1_c2_s2/exp-common.js` | 从 c2s1 拷贝 |
| 页面 | `content/physics_g8_v1_c2_s2/index.html` | 本节导航页，4 张导航卡 |
| 页面 | `content/physics_g8_v1_c2_s2/explain.html` | 知识讲解，4 个 Tab |
| 页面 | `content/physics_g8_v1_c2_s2/summary.html` | 知识导图，5 张导图卡 |
| 页面 | `content/physics_g8_v1_c2_s2/experiment.html` | 实验区骨架页 |
| 页面 | `content/physics_g8_v1_c2_s2/quiz.html` | 小练习骨架页 |

## 页面内容覆盖

- **index.html**：章标识「第二章 声现象」、节标题「第2节 声音的特性」、4 张导航卡。
- **explain.html**：
  - Tab1 音调与频率：蚊子/蝴蝶引入、钢尺实验、频率定义、波形疏密。
  - Tab2 响度与振幅：音叉弹乒乓球、振幅定义、距离影响。
  - Tab3 音色与波形：音色定义、音叉/钢琴/长笛 C 调 do 波形对比。
  - Tab4 听觉范围与超声次声：20~20 000 Hz、超声波>20 000 Hz、次声波<20 Hz、表 2.2-1、观察方法旁注。
  - 每 Tab 末尾含「想一想」问题卡，引导进实验区，不附答案。
- **summary.html**：三主支（音调↔频率、响度↔振幅+距离、音色↔材料结构+波形）+ 超声/次声 + 乐器三类 + 贾湖骨笛 8 000 多年。
- **experiment.html / quiz.html**：标题/导航/返回链接 + 「内容即将上线」占位卡。

## 自查结果

- 数字事实：严格沿用教材空格分节写法（如 20 000、120 000、8 000 多年）。
- JS 语法：`node --check` 通过 `fullscreen.js`、`exp-back.js`、`exp-common.js`。
- 未改动范围外文件，未触碰根目录 `app.js`，未执行 `git commit`。
- 文件均已完成落盘。

## 本批未做

- 互动实验区具体实验页面与脚本。
- 练习与应用 5 题内容。
- `explain.html` 中的 canvas/WebAudio 交互，本批以静态讲解为主。

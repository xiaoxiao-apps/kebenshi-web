# c1s3「运动的快慢」批 1 开发报告

## 完成清单
1. 新建目录 `content/physics_g8_v1_c1_s3/`
2. 从 `c1_s2` 复制 4 个共享文件：common.css、fullscreen.js、exp-common.js、exp-back.js
3. 编写本节导航页 `index.html`
4. 编写实验区骨架页 `experiment.html`
5. 编写知识讲解页 `explain.html`
6. 在 `app.js` 的 `AVAILABLE` 表追加 `physics_g8_v1_c1_s3` 一行，并用 `node --check app.js` 通过

## 交互点实现
- **导航页**：page-header + 3 卡片，分别指向 explain.html / experiment.html / quiz.html
- **讲解页 Tab**：`.tab-btn` + `.tab-panel` 模式，active 态使用 `var(--green)`
- **E1 比较快慢**：canvas 小动画演示「同时间比路程」和「同路程比时间」两种模式切换
- **E2 速度**：公式框居中、单位与换算、`m/s ↔ km/h` 实时联动输入框、`svg` 速度表读 80 km/h
- **E3 匀速/变速**：canvas 双车位置动画，0/10/20/30/40 s 与 0/150/300/450/600 m（甲）、0/100/235/400/600 m（乙），支持播放/重播/步进
- **E4 平均速度**：例题分步揭晓（已知→公式→代入→结果），重置后重新逐步显示；附计算规范 checklist

## 自查项
- app.js 语法校验通过
- 目录文件数正确：7 个（含 4 个复制文件 + 3 个新建文件）
- 未修改 c1_s1 / c1_s2 / c4_s2 等其他目录
- 未进行 git commit
- 未改动 `app.js` 其他行

## 遗留工作
- `experiment.html` 的 `nav-grid` 内注释「批2起逐批追加工具卡片」待后续批次填充
- `quiz.html` 待批 2 建设

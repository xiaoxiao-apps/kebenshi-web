# c1s4 第4批开发报告 · 收尾批

## 任务
新建 `content/physics_g8_v1_c1_s4/` 下 2 个文件：
- `quiz.html`：练习与应用 5 题
- `exp-sensor.html`：超声波传感器模拟

## 依据
- `/docs/c1s4-transcript.md`（教材练习全文 + 协调员复核补注）
- `/docs/c1s4-textbook-analysis.md`（C 类硬约束）
- 已建骨架 `common.css`、`exp-common.js`

## 完成内容

### quiz.html
- 教材「练习与应用」5 题，Tab 导航分题，不堆长页。
- 每题均含学生作答区 +「查看答案」折叠防剧透。
- 练习 2 严格使用复核值：A=100 cm、B=75 cm、C=0 cm；时刻 00:00.00 / 00:01.00 / 00:02.00；答案 v_AB=25 cm/s、v_BC=75 cm/s、v_AC=50 cm/s。
- 练习 2 配 SVG 频闪照片示意图（三球 + 刻度尺 + 时刻标注）。
- 联动：练习 1 下拉判定、练习 2 数值输入即时判对错并联动计算、练习 3 点击选择、练习 4 符号表达式校验、练习 5 里程碑实时换算速度。
- 进度条按答题/揭晓更新。

### exp-sensor.html
- 顶部声明动画为示意。
- SVG 场景：传感器 B、轨道、刻度尺、运动小车、计算机读数屏。
- 手动拖动 / 自动往返两种模式；「发射脉冲」按钮触发动画：脉冲发出 → 碰小车反射 → 返回接收。
- 实时显示距离读数，并联动 `s = 340 m/s × t ÷ 2` 计算。
- 附加连续两次测距模块，实时估算速度 `v = (s₂ − s₁) / Δt`。
- 复用 `common.css` 变量与 `exp-common.js`。

## 校验
- `node --check` 通过 quiz.html 内联脚本。
- `node --check` 通过 exp-sensor.html 内联脚本。
- 文件清单自查：

```
-rw-------  1 personal  staff  8341 Sep 16 10:54 content/physics_g8_v1_c1_s4/quiz.html
-rw-------  1 personal  staff  8671 Sep 16 10:56 content/physics_g8_v1_c1_s4/exp-sensor.html
```

## 红线遵守
- 未执行任何 git 操作。
- 仅新建 `quiz.html`、`exp-sensor.html` 及报告文件。
- 单次写入均 ≤ 150 行。
- 所有数字、表述与教材 / 协调员复核补注一致。

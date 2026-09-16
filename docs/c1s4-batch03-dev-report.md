# c1s4 第3批开发报告 · 知识讲解页 explain.html

## 完成内容
- 新建 `content/physics_g8_v1_c1_s4/explain.html`（约 20 KB）。
- 5 个 Tab 单显导航，选中态使用 `--green`：
  1. **平均速度**：v=s/t 概念复习 + 联动计算 + “平均速度≠速度的平均”辨析。
  2. **实验5步**：斜面小车教材 5 步图文讲解，末尾链接 `exp-slope.html`。
  3. **想想议议**：方案 A（间接计算）vs 方案 B（中部释放）对比，解析默认折叠。
  4. **超声波测距**：发射→反射→接收动画，声速 340 m/s，联动计算 s=340×t÷2。
  5. **区间测速**：区间测速牌含义 + 输入区间长度/限速自动算最少时间（min）。

## 设计约束落地
- 复用 `common.css` 变量与 `exp-common.js` 的 `fitCanvas()`。
- 表单控件单行排布，input 宽度 70 px。
- 解析类内容默认折叠，点击「查看解析」展开。
- 长公式链式一行展示，分号/换行处用 `<br>` 断行。
- 无新增导航按钮，仅顶部 Tab 一套。

## 权威依据核对
- 数字与表述严格依据 `c1s4-transcript.md` 及 `c1s4-textbook-analysis.md`：
  - 实验 5 步与教材 p26 一致；
  - 超声波声速 **340 m/s**；
  - 区间测速例题对应复习题 8（限速 100 km/h、区间 8 km）。

## 自查
- `node --check` 对提取的 inline JS 校验通过。
- `ls -la content/physics_g8_v1_c1_s4/explain.html` 确认文件存在（20039 字节，权限 600）。

## 未改动
- 未修改 `index.html`（其知识讲解卡片已指向 explain.html）。
- 未进行任何 git 操作。

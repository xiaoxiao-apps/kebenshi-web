# c1s1 批次3+4 开发报告

## 完成内容

### 批次3：新交互
1. **视错觉引入**：`explain.html` 开头新增 SVG 互动卡，点击“哪根小棒更长”后揭晓一样长，并可用“量一量”按钮加框验证。
2. **身上的尺估测**：`experiment.html` 新增实验三，展示人体尺参照，随机出题并计算相对误差。
3. **单位换算科学记数法链条**：`explain.html` 单位卡升级为完整七级换算表，新增 4 题填空判分。
4. **量级卡片**：`explain.html` 新增“一些长度/一些时间”可切换卡片组，共 16 项数据。

### 批次4：收尾
5. **quiz 扩充到 9 题**：保留原 5 题，新增身高脚长、硬币测法多选、1s 摆累积法、读数找错等多选/单选。
6. **实测任务单**：`experiment.html` 新增实验四，测课本/作业本长宽厚及脉搏/步频时间，自动算平均值。
7. **特殊测量法模块**：`explain.html` 新增累积法、辅助法、化曲为直卡片，配 SVG 示意图。
8. **删死代码**：确认 `content/physics_g8_v1_c1_s1/app.js` 无引用后，用 `trash` 删除。
9. **summary.html**：导图新增“估测与特殊测量法”分支。

## 技术注意
- 多选题交互改为选择指定数量后自动判分。
- 修复 `experiment.js` 中变量 `SR` 未定义的错误。
- 全部 JS 通过 `new Function` 语法检查。

## 文件变更
- `content/physics_g8_v1_c1_s1/explain.html`（大幅扩展）
- `content/physics_g8_v1_c1_s1/experiment.html`（实验三、四）
- `content/physics_g8_v1_c1_s1/quiz.html`（9 题+多选逻辑）
- `content/physics_g8_v1_c1_s1/summary.html`（导图分支）
- `content/physics_g8_v1_c1_s1/experiment.js`（语法修复）
- `content/physics_g8_v1_c1_s1/app.js`（已删除）

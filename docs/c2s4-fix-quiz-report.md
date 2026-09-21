# c2s4 quiz.html 重置按钮范围调整报告

- 删除 scorebar 内全局 `<button id="resetBtn">🔄 重置</button>` 及其 JS 绑定变量。
- 第 3 题（判断题）卡片内新增 `<button id="resetQ3Btn">🔄 重置本题</button>`，仅重置 Q3 作答状态，不影响其他题与分数栏。
- 自查：head/tail 正常；`</html>` 出现 1 次；`resetBtn` 已无；内联 JS `node --check` 通过。

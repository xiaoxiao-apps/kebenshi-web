# c3s2 R13 验收报告：熔化+凝固单连续实验流

改动文件：exp-melt.html / exp-melt.js / exp-melt-core.js / exp-melt-chart.js（?v=r13 缓存刷新）

- 顶部「熔化/凝固」tab 已删（grep 零残留），标题+布局不塌
- 点燃酒精灯 → 48℃ 熔化平台 → 全熔 toast「已完全熔化！熄灭酒精灯可观察凝固过程」+「熄灯观察凝固」按钮出现（?v=r13 实测，截图 c3s2-r13-prompt.png）
- 点击快捷按钮 → mode='freeze'、灯灭 → 冷却 → 48℃ 凝固平台 → 固态；凝固点注解（48℃）正常显示
- 图表：recordData 加 heat 标记；逐段暖色(加热)/冷色(冷却)取色，旧数据无标记按加热色兜底；LIVE_WINDOW 10→60 使两平台同屏；右上角「加热/冷却」双色图例（截图 c3s2-r13-twocolor.png）
- 记录表：连续单表+「阶段」列（熔化 28 行/凝固 46 行实测），渲染全量 dataLog（≤120 条），重置清空（截图 c3s2-r13-table.png）
- 「预熔完成」→「直接跳到液态」常显；点击=跳液态 56℃（mp+8）、熄灯、mode='freeze'，重置后直点可复现凝固平台（实测）
- node --check 三 JS 文件通过；browser errors 0 条；服务 8931 未新起

状态：✅ 全部验收项通过

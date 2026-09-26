# c3s2 温度-时间曲线系统 fix round 2 报告

## 改动
1. 新建 `exp-melt-chart.js`：自适应纵轴刻度、10/12 min 滚动横轴、熔点/凝固平台虚线、hover 气泡、放大悬浮窗（拖拽/resize/Tab/Esc）、教材图像切换与分段卡。
2. `exp-melt.html`：小图区加动态标题行+放大按钮；#textbook-chart-box/#segment-card 移入悬浮窗；引入 `exp-melt-chart.js`。
3. `exp-melt.js`：删除旧 `drawChart/resizeChart/chartCanvas/chartCtx`，改调 `initChart()/redrawChart()`。
4. `exp-melt-stage3.css`：追加标题行、悬浮窗、Tab、tooltip、resize 手柄、手机适配样式。
5. `exp-melt-compare.js`：迁出教材图像函数；`enterCompareMode` 与 `bindCompareEvents` 加 `typeof` 防护。

## 自查
- `node --check` 全部 JS 通过。
- HTML head/tail/DOCTYPE/`</html>`=1 通过。
- 本地 `http://127.0.0.1:8765` 已运行，服务根为仓库根。

## 浏览器实测（errors=0）
- 快进至 15 min：小图/大图最后一点温度一致；横轴滚动窗口 `[tMax-10,tMax]`/`[tMax-12,tMax]`；纵轴刻度像素非空。
- 切石蜡：标题变为「石蜡温度时间曲线」。
- 悬浮窗：打开可见、resize 后 canvas 宽高同步、标题栏拖拽改 left/top、关闭/Esc 可关。
- hover：tooltip 显示「时间 X min / 温度 X.X ℃」。
- 教材图像 Tab：4 按钮切换正确；EF/FG/GH 分段卡文本正确。
- 对比馆模式切换无报错。
- 390px 视口悬浮窗全屏适配、无横向溢出。

## 补单
- `computeYRange` 修复：空数据初始态纳入 `state.sampleTemp`；晶体纳入熔点/凝固点；非晶体纳入 softStart/softEnd；最低 span 20℃，海波/石蜡初始点均落在绘图区内。
- 横轴标签改到绘图区内侧右上方、纵轴标签改到内侧左上方，与刻度数字不同行，任意宽度/位数下不重叠。
- 横轴刻度间隔自适应：窄屏自动放宽到 2 min，保证 10/12 min 窗口不少于 5 个刻度且相邻数字不重叠。

## 截图清单
- `docs/c3s2-fixr2-chart-small.png` 数据面板小图
- `docs/c3s2-fixr2-chart-float.png` 悬浮窗实时曲线+hover 气泡
- `docs/c3s2-fixr2-chart-textbook.png` 教材图像 Tab+分段卡
- `docs/c3s2-fixr2-chart-mobile.png` 390px 视口悬浮窗

# c2s3 验收修复轮报告

## Bug 1：exp-candle / exp-road 画布全黑
- 修改：`exp-candle.js`、`exp-road.js` 各增加 `function draw(){ drawScene(); }`，修复 `resize()` 中 `draw is not defined`。
- 验证：浏览器访问两页 errors 零条，canvas 非空白像素 > 0。

## Bug 2：返回导航断链
- 修改：`experiment.html` 顶栏 back-btn 加 `data-back`；`exp-back.js` 在 `from` 合法时给 `.nav-card` 追加 `from/tab` 参数。
- 验证：`experiment.html?from=explain&tab=t3` 的 back-btn 指向 `explain.html#t3`，4 张 nav-card 均带参数；exp-echo 返回按钮文字为「返回知识讲解」、href=`explain.html#t3`；explain.html#t3 激活 t3；无参 experiment.html 保持返回本节。

## 自查结果
1. `node --check`：exp-candle.js / exp-road.js / exp-back.js 均通过。
2. `experiment.html`：head-3 见 DOCTYPE，tail-2 见 `</html>`，`</html>` 计数=1。
3. curl 服务端新代码标记：`exp-candle.js`=1，`exp-road.js`=1，`experiment.html` data-back=1，`exp-back.js` hasFromParam=3。
4. 浏览器实测：
   - exp-candle / exp-road errors=0，canvas nonBlank=298520。
   - 链路测试：nav-card 带参、back-btn 指向 explain.html#t3、exp-echo 返回知识讲解、explain.html 激活 t3。
   - 反向对照：无参 experiment.html back-btn 保持 index.html，nav-card 无追加参数。

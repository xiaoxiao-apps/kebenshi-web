# c2s3 修复轮4·单1/3 缓存击穿报告

## 改动
- 给 5 个 HTML 的本地资源引用统一加版本号 `?v=20260920r4`：
  - `index.html`、`explain.html`、`summary.html`、`exp-echo.html`、`exp-candle.html`
- 涉及 `common.css`、`<a>` 页内导航、`fullscreen.js`、`exp-common.js`、`exp-back.js`、`exp-echo.js`、`exp-candle.js`。
- 未改动 `exp-huanqiu.html`、`experiment.html`、`quiz.html`。

## 音频代码复核
- `exp-echo.js` / `exp-candle.js` 的 `soundBtn`/`playBtn` id 与 HTML 一致，均有 click 绑定。
- AudioContext 均在用户手势（click）内创建；已兼容 `webkitAudioContext`。
- 无外部音频依赖，均为 Oscillator 合成。
- 未发现会导致真机无声的隐患，未改动 JS。

## 自查结果
- HTML 三重自查：5 文件 DOCTYPE、闭合 `</html>` 正常。
- 版本号统计：5 文件引用数 = 版本号标记数（index 5/5、explain 5/5、summary 2/2、exp-echo 6/6、exp-candle 6/6）。
- curl 验证：`exp-echo.html` 中 `exp-echo.js?v=20260920r4` 命中。
- 浏览器验证：`performance.getEntriesByType('resource')` 显示 `exp-echo.js?v=20260920r4`。
- 页面 errors：0。

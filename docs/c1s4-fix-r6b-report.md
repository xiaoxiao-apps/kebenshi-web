# C1S4 修复报告 R6b（2026-09-16）

改动文件：仅 `content/physics_g8_v1_c1_s4/exp-sensor.html`

## 5a 自动往返不实时读数
- `loop()` 原来直接改 `carX` 后调 `setCar`，measured=true 时读数会实时跟着小车变 → 改为统一走 `setCar(nx)`。
- `setCar` 增加守卫：`measured && nx !== measuredX` → `measured=false`（位置一变读数即清空回 `-- m`）。
- `emitPulse` 完成时记录 `measuredX = carX`，读数固定；发射期间暂停自动往返（按钮变「继续」），保证读数对应发射时刻位置。
- 初始 SVG 屏显文字同步改为 `-- m`（原为 0.20 m，与未测量态不符）。

## 5b 颜色说明对齐动画
- timeline 文案改为「红色 = 发射脉冲/时刻」「蓝色 = 接收脉冲/时刻」，文字分别染 `#e74c3c`/`#2980b9`。
- 两个色点：绿 `var(--green)` → 红 `#e74c3c`；青 `var(--cyan)` → 蓝 `#2980b9`（与脉冲 stroke 一致）。
- 屏幕读数 `fill="var(--green)"` → `fill="#4a8c3f"`（SVG paint 属性里的 var() 在多数浏览器不生效，属隐性 bug，顺带修掉；全文件 SVG/canvas 颜色已无 var()）。

## 6 返回按钮泛化
- 优先级：① URL `?from=explain|experiment|index`（正则严格匹配参数边界，防 `from=evil`）→ 对应页；② `document.referrer` 同源且同目录且文件名为三者之一 → 该页；③ 默认 `experiment.html`。
- 按钮文字跟随：返回讲解 / 返回探索区 / 返回本节；静态 HTML 默认文字同步改为「返回探索区」。
- 实际链路验证：experiment.html 无参链接（走②）、explain.html 带 `?from=explain`（走①），均正确回源。

## 自查
- `head -3` = DOCTYPE ✓；`tail -2` = `</body></html>` ✓；`grep -c "</html>"` = 1 ✓。
- inline JS 提取 → `node --check` 通过 ✓；from 参数正则 5 组用例 node 实测通过 ✓。
- `curl http://localhost:8642/.../exp-sensor.html` 200，新文案/hex 色/measuredX 守卫均在响应中 ✓。
- 未动其他文件，未用 git/rm。

# c3s2 修复轮 R5b 报告

## 改动
- `exp-melt.html`：四个含 `.custom-select` 的 `.slider-row` 追加 `select-row`。
- 内联 CSS 与 `exp-melt-stage3.css` 中 `.slider-row:has(.custom-select)` 全部改为 `.slider-row.select-row`。
- CSS 引用 `?v=5` → `?v=6` cache-bust。

## 自查结果
- HTML 三重：`<!DOCTYPE>` 首行、`</html>` 尾行、计数 1，全部通过。
- `grep -c ':has('`：html=0，css=0。
- `select-row`：html 命中 6（4 个 class + 2 条选择器），css 命中 2。
- curl 预览：`select-row`≥1，`v=6`=1，CSS 命中 `select-row`。
- 浏览器 errors=0。
- 1280×800 与 390×844 四个 `.custom-select-trigger` 的 `scrollWidth ≤ clientWidth+1`。
- 点击“火力”下拉，选项展开正常；选“大”后 trigger 同步为“大”，select value=high。

## 结论
`:has()` 依赖已根除，全浏览器兼容，下拉截断修复完成。

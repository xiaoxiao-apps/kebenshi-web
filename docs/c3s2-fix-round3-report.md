# c3s2 熔化凝固探究馆 Fix Round 3 报告

## 改动
1. `exp-melt.html`：mode-bar 只保留「熔化探究/凝固探究」两按钮；删除 `#compare-layer`、`#gallery-layer` 节点及对应 `<script>` 引用。
2. `exp-melt.js`：清理 btn-lamp/pause/reset 与 updateModeUI/updateUI 中 compare/gallery 全部分支。
3. `exp-melt-core.js`：删除 `hideCompareApparatus()` 及 enterMode 中 melt/freeze 两处调用。
4. `exp-melt-stage3.css`：删除 #compare-layer/#gallery-layer 及 .compare-*/.gallery-* 全部样式。
5. 手机 `@media(max-width:720px)` 内压缩 slider-row 列宽，修复环境温度数值被裁切。

## 验证
- `node --check` 4 个 JS 全绿；HTML 三重检查通过。
- 网络请求无 `exp-melt-compare.js`/`gallery.js`、无 404，errors=0。
- 物理回归：海波熔化 48℃ 平台 frac 0→1；海波凝固 48℃ 平台 frac 1→0；冰 0℃ 平台；石蜡持续升温。

## 孤儿文件
- `exp-melt-compare.js`、`exp-melt-gallery.js` 仍保留磁盘，已无页面引用。

## 截图
- `docs/c3s2-fixr3-melt.png`（熔化桌面全貌）
- `docs/c3s2-fixr3-freeze.png`（凝固桌面全貌）
- `docs/c3s2-fixr3-mobile.png`（390×844，环境温度数值完整可见）

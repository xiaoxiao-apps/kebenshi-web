# c3s1《温度》上线准备补丁报告（2026-09-22）

## 改动（4 项）
1. 新建 `content/physics_g8_v1_c3_s1/index.html`：实验核心版卡片页，节标题「第1节 温度」+「温度实验室」卡（缩略图+简介「温度计架 · 烧杯加热 · 加冰 · 体温计缩口」），点卡直进 exp-temp-lab.html；样式自包含内联，#0f1218 深色底，html/body 100% 高、overflow:hidden；预留阶段二卡片注释位。
2. 缩略图：`assets/thumb-templab.png`（cp 自 workspace/media/c3s1-templab-r3-scale-front.png），卡片页引用。
3. `exp-temp-lab.html` 加「‹ 返回」按钮：title-bar 后 fixed 左上角（top:8/left:10, z-index:50, 半透明+blur），href="index.html"；仅改该 html，未动 js/core/css/audio/three。
4. `app.js` AVAILABLE 表 c2s5 行后插入 `'physics_g8_v1_c3_s1': { title: '温度', file: 'content/physics_g8_v1_c3_s1/index.html' },`，仅此一行。

## 验证
- `node --check app.js` 通过。
- 浏览器 127.0.0.1:8901：物理→八年级 上册→「第1节 温度」无「即将上线」徽章→点进；卡片页缩略图 img.naturalWidth=1387>0、无滚动溢出；点卡进实验、点返回回卡片页，返回守恒闭合。全程 browser errors=0。
- iframe src 链路三次取值（contentWindow.location.href）：
  1. `.../content/physics_g8_v1_c3_s1/index.html`
  2. `.../content/physics_g8_v1_c3_s1/exp-temp-lab.html`
  3. `.../content/physics_g8_v1_c3_s1/index.html`

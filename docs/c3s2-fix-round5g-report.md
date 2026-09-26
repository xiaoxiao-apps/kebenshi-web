# c3s2 修复轮 R5g 报告

## 改动
- `exp-melt-core.js`：TOP_Y 15.0→20.2；ROD_TOP_Y 16.0→21.2；默认相机 (0,36,62) 看 (0,9,0)；SCENE_CENTER 7.0。
- `exp-melt.html`：四个 `?v=r5f` 升 `?v=r5g`。

## 自查
- `node --check exp-melt-core.js`：通过。
- HTML `?v=r5g`：4/4；curl `core.js?v=r5gverify`：命中 r5g≥1。
- 浏览器 errors=0；断言全绿：
  - TOP_Y−MID_Y = 8.7 ≥ 8；ROD_TOP_Y > TOP_Y。
  - 刻度出管口比例 = (19.9−14.6)/15.4 ≈ 0.344 ≥ 1/3。
  - 泡 y=4.76 ∈ 样品区 [3.35,5.95]；中夹 MID_Y=11.5 仍在试管身内。

## 物理回归
- 海波熔化：48℃ 平台（t=2,3），最终 meltedFrac=1。
- 海波凝固：预熔→凝固模式，48℃ 平台（t=1~4），最终 meltedFrac=0。

## 截图
- `docs/c3s2-r5g-wide.png`：全装置入框。
- `docs/c3s2-r5g-thermo.png`：管口+温度计同框，刻度明显高出管口。

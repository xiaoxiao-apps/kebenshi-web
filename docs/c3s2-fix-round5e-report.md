# c3s2 修复轮 R5e 报告

## 根因
three.js 透明物体按相机距离每帧重排。水体写深度、试管玻璃不写，视角变化时排序翻转，导致试管沉水部分被水体前壁深度挡掉。

## 改动
- `exp-melt-core.js`：全部透明材质 `depthWrite:false`（bathMat、样品液/ring/disc、温度计玻璃、火焰 cone/disc、bottomEdge）。
- 固定 `renderOrder`：火焰=0，烧杯玻璃组=1，水浴=2，样品液/ring/disc=3，试管玻璃+温度计玻璃=4。
- `exp-melt.html`：4 个 `?v=r5d` 升 `?v=r5e`。
- 未改几何/物理/相机常量。

## 自查结果
- `node --check` 通过；HTML `?v=r5e`=4；curl 8931 no-cache 命中 `r5e`。
- 浏览器 `?v=r5everify`：errors=0；`bathMesh.material.depthWrite===false`；wall=1、bath=2、sampleLiquid=3、tube=4、flame=0。
- 双视角截图：`docs/c3s2-r5e-high.png`（polar=π/3.2）、`docs/c3s2-r5e-low.png`（polar=π/2.15），试管壁与底半球同时可见，无穿帮。
- 物理回归：海波熔 48℃ 平台 `meltedFrac`→1；预熔+凝固模式 48℃ 平台 `meltedFrac`→0。

## 结论
透明排序问题根治，可进入下一轮验收。

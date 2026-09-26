# c3s2 修复轮 R5 报告

## 改动要点

1. **桌面下拉截断** (`exp-melt.html` / `exp-melt-stage3.css`)：桌面态 `.slider-row:has(.custom-select)` 改 `64px 1fr`；手机规则保留 `!important`。
2. **曲线悬浮窗平移** (`exp-melt-chart.js` / html / css)：新增 `floatPanRight`；画布 pointer 拖动 + wheel 平移；标题栏「最新」按钮 / 双击回弹；标题栏拖动、缩放、hover 气泡不变。
3. **烧杯比例** (`exp-melt-core.js`)：`BEAKER_R=4.2`、`BEAKER_H=9.8`；高/直径=1.167；ring、gauze、ceramic、edge、bath 联动。
4. **试管与温度计** (`exp-melt-core.js`)：试管底改下半球；`TUBE_CENTRE_Y=9.4`、`TUBE_H=7.5`；管顶 13.15 穿过夹环；温度计同轴 z=0、`THERMO_Y=6.8`，泡入样品区。
5. **物质入试管** (`exp-melt-core.js`)：`SAMPLE_BOTTOM_Y` 由 tube 常量派生（5.80）；颗粒/液柱/液面无残留绝对坐标；large 档在试管内。

## 自查结果

- `node --check` core.js / chart.js：通过。
- HTML 三重自查：通过；浏览器 live console errors = 0。
- 几何断言：烧杯比 1.17；试管底 4.25 在杯底 1.8~液面 9.0；管顶 13.15≥13.0；large 样品包围盒在管内；温度计泡在样品区。
- 物理回归：海波熔 48℃ 平台 frac 0→1（174 点）；冰 0℃ 平台（143 点）；石蜡无平台；海波凝 48℃ 平台 frac 1→0（420 点）。
- 下拉：1280×720、390×664 四个 trigger 均 `scrollWidth ≤ clientWidth`。
- 图表平移：拖动后 xmax 37→30.5，跟随暂停；点「最新」回弹 37。
- curl + grep -c 'r5'：4 个文件各命中 1 次。

# c3s2 修复轮 R5f 报告 — 试管按真实照片重渲染

## 改动
- `exp-melt-core.js` [r5f]
  - 新增 `TUBE_R=0.6`；圆柱段 `TUBE_H=11.4`；半球半径=TUBE_R；总高 12.0=10×直径 1.2
  - 试管最低点 L=2.6，圆柱底 3.2，中心 8.9，管顶 T=14.6
  - 管口外翻小圆唇 `TorusGeometry(TUBE_R*1.13, 0.07)`，renderOrder=4
  - 样品：`SAMPLE_RADIUS=0.5`、`SAMPLE_HEIGHT=2.6`，底部 3.35；颗粒/液柱/液面随 `SAMPLE_RADIUS` 联动
  - 夹具：`MID_Y=11.5`、`TOP_Y=15.0`、`ROD_TOP_Y=16.0`；夹环半径 `TUBE_R*1.25`（≈0.75），clampMid 随 `TUBE_R` 缩放
  - 温度计：`THERMO_Y=4.5`，玻璃管 0.14、泡 0.26、液柱 0.07，tubeLen 派生
  - `SCENE_CENTER=(0,6,0)`，默认相机距离 60
- `exp-melt.html`：4 处 `?v=r5e` 升 `?v=r5f`

## 自查
- `node --check`：通过
- `grep`：圆柱/半球/夹环无残留 `1.4`；HTML `?v=r5f`=4；curl 8931 core.js 命中 r5f
- 浏览器 `?v=r5fverify`：errors=0；断言（比例10.0、L=2.6、T=14.6、MID/TOP/ROD 关系、颗粒≤0.55、泡∈样品区且顶<TOP_Y）全部通过
- 物理回归：海波熔 plateau+frac→1、冰 0℃ plateau+frac→1、石蜡无 plateau、海波凝（preMeltComplete+freeze）frac→0+固态，均通过
- 截图：`docs/c3s2-r5f-wide.png` 全装置无裁切；`docs/c3s2-r5f-close.png` 口唇/直壁/U底/夹持/温度计同框

# c3s2 修复轮 R5d 报告

## 修改范围
- `content/physics_g8_v1_c3_s2/exp-melt-core.js`：调整几何常量与温度计吊挂长度
- `content/physics_g8_v1_c3_s2/exp-melt.html`：4 处 `?v=r5c` 升为 `?v=r5d`

## 关键几何（最终值）
- 烧杯：`BEAKER_R=3.4`，`BEAKER_H=8.5`，高/直径 = 1.25
- 水浴：`BATH_H=6.2` → 水面 `Y=8.0`
- 试管：`TUBE_H=9.0`，`TUBE_CENTRE_Y=8.0`，圆筒底 3.5，半球最低 2.1，管顶 12.5
- 夹具：`MID_Y=11.0`（夹试管上半段），`TOP_Y=15.5`，`ROD_TOP_Y=16.5`
- 温度计：`THERMO_Y=5.2`，泡位于样品区，顶端 15.2 < TOP_Y
- 相机：`SCENE_CENTER=(0,5,0)`

## 自查结果
- `node --check exp-melt-core.js`：通过
- HTML `?v=r5d` 计数：4
- `curl` 命中 core.js `r5d` 标记：1
- 浏览器 `?v=r5dverify`：console errors = 0
- 几何断言 6 项：全部通过
- 物理回归 4 组：全部通过
  - 海波熔化 48℃ 平台，frac→1
  - 冰熔化 0℃ 平台
  - 石蜡无固定熔点平台
  - 海波凝固 48℃ 平台，frac→0

## 截图
- `docs/c3s2-r5d-wide.png`：默认视角全装置
- `docs/c3s2-r5d-close.png`：近景烧杯试管夹持区

# c3s2 R9 修复报告

## 改动文件
- `exp-melt-core.js`、`exp-melt.js`、`exp-melt.html`

## 项1：水物态
- `BATH_MAX_TEMP = 100`；沸腾平台钳位 100.0℃。
- `updateBathVisual(dt)` 按 `state.bathTemp` 派生：
  - `T < 0`：冰白 `0xe8f6ff` + 顶面盘。
  - `0 ≤ T < 99.5`：液态 `0x64d8ff`。
  - `T ≥ 99.5`：液态 + 36 白气泡循环上升。
- 初始态/重置/模式切换联动；`animate` 每帧调用。
- 面板新增「水的物态」；`updateUI` 同步。

## 项2：烧杯嘴
- 删除旧细杆；改为实体鹰嘴：半圆槽管 + 三角侧翼，`0x88aaff` `DoubleSide`，`renderOrder=1`。
- 侧视：向外下倾实体唇槽；俯视：rim 上 V 凸口；无 z-fighting/穿帮。

## 验收
- 25℃ 液态 + 面板=液态 ✓
- bathTemp=-5℃ 冰白 + 顶盘 + 固态 ✓
- 大火加热至沸腾：100.0℃ 钳位 + 气泡 + 沸腾 ✓
- 熔化/凝固切换无报错 ✓
- `node --check` 通过；浏览器 errors=0 ✓

## 截图
- `docs/c3s2-r9-spout.png` 侧视嘴特写
- `docs/c3s2-r9-spout-top.png` 俯视 V 凸口
- `docs/c3s2-r9-water-states.png` 沸腾全景

# c3s2 R8 修复报告：初始物态随样品+室温定

## 修改内容
- `exp-melt-core.js`
  - 新增 `sampleBlock` 整块蜡块网格（`CylinderGeometry` + `MeshStandardMaterial`）。
  - 新增 `applyInitialPhase()`：晶体按 `ambTemp > meltingPoint` 置 `meltedFrac`；非晶体保持 0；随后更新物态名与视觉。
  - `resetPhysics()` 末尾改调 `applyInitialPhase()`，换样品/重置/首屏统一走此。
  - `updateSampleVisual()`：晶体分支隐藏 `sampleBlock`；非晶体分支显示蜡块（`blockH = SAMPLE_HEIGHT*(1-s)`），不再渲染颗粒，液层/液面逻辑保留。
- `exp-melt.js`
  - `init()` 中首屏调用 `applyInitialPhase()`。
  - `amb` 滑块 handler：仅 `simTime === 0` 时调用 `applyInitialPhase()`，实验中不瞬移物态。

## 自查
- `node --check exp-melt-core.js` ✅
- `node --check exp-melt.js` ✅
- 浏览器 console errors：0 条 ✅

## 验收结果
- 室温 25℃：海波=颗粒固态；石蜡=整块蜡块、无颗粒、无液面环；冰=液态水柱+液面，物态=液态。
- 设 `amb/sample/bath = -5℃` 并触发 `applyInitialPath`：冰=颗粒固态、物态=固态；石蜡仍为蜡块。
- 冰+25℃ 点开始加热：温度从 25℃ 上升，无报错。
- 凝固模式：冰+25℃ 初始仍为液态。
- 室温 40℃：海波仍为固态颗粒（40 < 48）。

## 截图
- `docs/c3s2-r8-paraffin-block.png`
- `docs/c3s2-r8-ice-liquid.png`
- `docs/c3s2-r8-ice-solid.png`

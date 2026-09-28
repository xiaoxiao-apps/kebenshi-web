# c3s3 汽化液化探究馆 R2 修复报告

## 项1：火柴棒位置修复

- **修改**：`exp-vapor-core.js` 中 `paperMatchGroup.position.set(0.9, -6.80, boxD / 2 + 4.1)`（原 y=-7.13, z=boxD/2+1.8）。
- **效果**：棍身完整露出桌面、头不再埋入桌面，与纸盒底面间距清晰；头仍朝纸盒/底火方向（rotation.y = Math.PI）。
- **验证**：浏览器默认视角与低角度截图均显示整根火柴平放、头不贴盒底、不沉桌面；对火柴头屏幕坐标调用 `checkPaperMatchClick`，`state.evap.paper.lit` 由 false 变 true，命中正常。
  - 默认视角：`...f1ac65b1...6c170fab-1398-49f8-a48a-1872ac6ffd1c.png`
  - 低角度：`...776f4d26...56135a75-bdc0-4f36-ac1c-90477a44624a.png`

## 项2：液化探究说明框同步修复

- **修改**：`exp-liquefy-core.js` 新增 `lqPrevHeating`、`lqHeatStartMs`；加热变真时记录 `performance.now()`；`updateLiquefyPhaseHint` 重写：未加热双保险隐藏（`hidden` + `display='none'`），加热时 `display=''`；idx 按 `0(<2.5s)→1→2(growing/flowing 或大量)→3(tube/falling 或 collectedPct>0)` 覆盖。
- **验证**：点燃前 `#lq-phase-hint` hidden/display=none/offsetParent=null；点燃后显示 block 并进入阶段1；加速后推进到阶段3；熄灭后重新隐藏。`resetLiquefy` 不再强制显示。

## 缓存版本与自查

- `exp-vapor.html` 中 `exp-vapor-core.js` 与 `exp-liquefy-core.js` 的 `?v=` 均升级到 `s48`。
- 两个 JS `node --check` 通过；HTML 头尾/闭合数正常；curl 服务验证新火柴位置命中1处、`lqHeatStartMs` 命中3处、`s48` 命中2处。

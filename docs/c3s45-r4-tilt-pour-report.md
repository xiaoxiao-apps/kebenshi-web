# c3_s4《升华凝华观察站》R4 浇淋姿态修复报告

## 修改摘要
只改 `exp-subl-pour.js` 与 `exp-subl.html`（版本 `?v=6→?v=7`）。

1. **浇淋位改为侧上方**：`POUR_POS` 从罐口正上方 `(0, RIM_Y+4.2, 0.6)` 改为右前侧上方 `(3.0, RIM_Y+3.4, 1.4)`。
2. **倾斜倒水姿态**：保留 `setFromUnitVectors(+Y → normalize(lidCenter-cupPos))`，因杯子在侧上方，杯口轴自然斜向罐盖，杯身与竖直夹角约 135.8°，处于 95°–140° 区间。
3. **抛物线水流**：`updateStream` 改用 `THREE.QuadraticBezierCurve3` + `TubeGeometry(20, 0.18, 8)`，每帧重建。
   - 起点：倾斜后杯口圆环世界最低点（`getRimLowest`）。
   - 控制点：起点沿杯口轴方向外推 1.5 世界单位。
   - 终点：罐盖中心 `(0, RIM_Y+0.05, 0)`。
   - 保留流动高光纹理与冷暖色。
4. **杯内水体**：保留液面恒水平、水位下降、向杯口偏移逻辑；倾斜态下通过原 `tiltFactor` 适配偏移，未穿杯壁。
5. **验收钩子**：向 `POUR.state` 暴露 `cupTiltDeg / cupOffset / mouthDot / streamCurve / streamStart / streamEnd / streamStartDist / streamEndDist / waterTiltX / waterTiltZ`。

## 钩子实测值（pour 中段，热水）

| 钩子 | 实测值 | 验收标准 | 结果 |
|---|---|---|---|
| `cupTiltDeg` | 135.76° | 95°–140° | ✅ |
| `cupOffset` | 3.31 | > 1.5 | ✅ |
| `mouthDot` | 1.000 | > 0.9 | ✅ |
| `streamMesh.geometry.type` | `TubeGeometry` | 曲线 | ✅ |
| `streamCurve.getPoints(8).length` | 9 | ≥3 点 | ✅ |
| `streamStartDist` | 0 | < 0.6 | ✅ |
| `streamEndDist` | 0 | < 0.8 | ✅ |
| `waterTiltX` / `waterTiltZ` | ~1e-17 | \|x\|,\|z\| < 0.05 | ✅ |

冷水浇淋复测：同参数全部通过。

## 未改动清单
- `exp-subl-frost.js` 未改动。
- `exp-subl-core.js` 未改动。
- 碘物理参数、粒子逻辑未改动。
- 盖面水膜/splash、罐壁水幕、桌面水洼、fade 归零、hover 浮窗、拖拽触发、按钮触发、动画期按钮禁用、归位逻辑全部保留。

## 自查
- `node --check exp-subl-pour.js`：通过。
- `curl http://localhost:8931/content/physics_g8_v1_c3_s4/exp-subl.html`：200。
- 浏览器钩子实测：热水/冷水均通过。
- 模式②「易拉罐制霜」切换回归：`SublimationFrost.ready=true`，无报错。
- Console errors（页面自身，不含测试脚本）：0。

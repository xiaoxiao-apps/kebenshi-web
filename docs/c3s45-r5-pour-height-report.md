# c3s45 R5 浇淋位高度修复报告

## 问题
R4 保留倾斜姿态（135.8°）后，原 POUR_POS=(3.0, RIM_Y+3.4, 1.4) 导致倾斜杯口最低点 y≈0.27，低于盖面 y=0.55，杯口插进罐口；水流贝塞尔弧整段在罐体内部（采样 minY=-0.2），水柱消失在罐中。

## 改法
- `exp-subl-pour.js` 第10行：`POUR_POS` 改为 `(4.6, RIM_Y+5.2, 2.2)`（水平距≈5.10，高于盖面≈5.15，方向仍≈45°斜下）。
- `updateStream`：控制点 scale 从 1.5 改为 1.8，并增加约束 `control.y ≥ RIM_Y+0.3`；采样 20 点，若 `minY < RIM_Y+0.05` 则整体上抬控制点，确保水流全程在罐外空中，终点落向盖中心。
- `exp-subl.html`：全部脚本 `?v=7` 统一升级为 `?v=8`。

## 未改动清单
- `exp-subl-frost.js`、`exp-subl-core.js`、碘物理参数、液面水平逻辑、盖面水膜/splash、罐壁水幕、桌面水洼、fade、hover 浮窗、拖拽/按钮触发、按钮禁用、归位、倾斜姿态计算均未改动。

## 自查
- `node --check exp-subl-pour.js`：通过。
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:8931/content/physics_g8_v1_c3_s4/exp-subl.html`：200。
- 浏览器 console errors：0。

## 验收钩子实测值（pour 中段）
| 钩子 | 实测值 | 阈值 | 结果 |
|---|---|---|---|
| rimLipMinY | 2.08 | ≥1.55 | ✅ |
| streamMinY | 0.55 | ≥0.50 | ✅ |
| streamEnd 距 (0,0.55,0) | 0.00 | <0.80 | ✅ |
| cupTiltDeg | 135.56° | [95,140] | ✅ |
| cupOffset | 5.10 | >1.5 | ✅ |
| mouthDot | 1.00 | >0.9 | ✅ |
| 液面 world euler \|x\|,\|z\| | ~0 | <0.05 | ✅ |

冷热两杯水均通过上述钩子。

## 回归验证
- 模式②「易拉罐制霜」切换正常，界面、3D 场景、温度计读数面板渲染无误。
- 冻帧肉眼：热水杯斜悬于罐口侧上方空中，杯口明显高于罐口，未插进罐内；水流弧线在罐外可见地落向盖面。

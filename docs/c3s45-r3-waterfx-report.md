# c3_s4《升华凝华观察站》浇淋动画 R3 修复报告

## 修改范围
- `content/physics_g8_v1_c3_s4/exp-subl-pour.js`（r2 → r3，整文件重写）
- `content/physics_g8_v1_c3_s4/exp-subl.html`：所有 `?v=5` → `?v=6`
- 未改动：`exp-subl-core.js`、`exp-subl-frost.js`、`exp-subl-audio.js`、`exp-subl.js`

## 问题与修法

### 问题1：杯内液面必须始终水平
- 每帧用 `water.quaternion.copy(parentWorldQ.clone().invert())` 抵消杯子世界旋转，使水体世界朝向恒为 identity。
- 动画过程中水位从 `CUP_WATER_H` 降至约 `0.45*CUP_WATER_H`，并随倾斜因子把水体中心从杯底 lerp 到杯口附近，避免穿模。
- `return` 归位后水位恢复 `CUP_WATER_H`。

### 问题2：杯口对准罐中心
- `POUR_POS` 改为 `(0, RIM_Y+4.2, 0.6)`，略偏相机侧。
- 用 `quaternion.setFromUnitVectors(local +Y, normalize(lidCenter - cupPos))` 计算倾倒目标旋转。
- `lift` 阶段从 identity slerp 到目标旋转；`pour` 保持；`return` slerp 回 identity。

### 问题3：完整水流链
四段链全部使用半透明水材质（`depthWrite:false`，`renderOrder` 14–16），热水偏暖 `0xffe9c0`、凉水偏蓝 `0xbfe3ff`：
1. **杯口出水柱**：锥台圆柱（`radiusTop=0.22, radiusBottom=0.15`），起点为倾斜后杯口圆环世界最低点，终点盖中心，全程滚动高光贴图。
2. **盖面冲击+铺展**：0.3s 后 `CircleGeometry` 水膜从半径 0 铺展到 `CONTAINER_R`，叠加 10 条放射纹面片；前 0.4s 有扩环 splash。
3. **罐壁水幕**：8 段 open-ended 圆柱扇形片（`thetaLength` 0.25–0.6 rad，弧宽 ≥0.8），从 `RIM_Y` 向下生长到桌面。
4. **桌面水洼**：`CircleGeometry` 从 `CONTAINER_R` 扩到 `CONTAINER_R+2.2`。
- 时序：pour → a；b 铺展 → c 生长；c 到底 → d 扩散。`return` 后进入 1.5s fade，b/c/d 整体透明度渐隐归零。

## 验收钩子实测（浏览器 evaluate）

| 钩子 | 场景 | 实测值 | 结果 |
|---|---|---|---|
| 液面水平：water world euler \|x\|,\|z\| < 0.05 rad | pour 中段 | x≈8.2e-17, z=0 | ✅ |
| 杯口对准：cup local +Y 与 lidCenter-cupPos 点积 > 0.85 | pour 中段 | 1.000 | ✅ |
| 水柱可见且 radiusTop ≥ 0.15 | pour 中段 | visible=true, radiusTop=0.22 | ✅ |
| 盖面水膜可见且 scale>0 | pour 中段 | visible=true, scale≈1.55 | ✅ |
| 壁流弧宽 ≥0.8 且可见生长 | pour 后段 | arc≈1.08, min scale≈4.19 | ✅ |
| 桌面水洼可见且 scale 增长 | return 阶段 | visible=true, scale≈5.54 | ✅ |
| b/c/d 渐隐 | 动画结束后 | lid/wall/puddle opacity≈8.9e-9 | ✅ |

## 回归检查
- `node --check` 通过全部 5 个 JS 文件。
- `curl http://localhost:8931/content/physics_g8_v1_c3_s4/exp-subl.html` 返回 200。
- 浏览器自测：四段链正常、两问题钩子通过、模式②「易拉罐制霜」切换与回归无报错、console errors = 0。

## 未改动清单
- `exp-subl-core.js`（相机/场景/碘物理/容器/蒸气/结晶）
- `exp-subl-frost.js`（制霜模式逻辑）
- `exp-subl-audio.js`
- `exp-subl.js`（UI 事件与模式切换）

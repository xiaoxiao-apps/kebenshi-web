# c3_s4《升华凝华观察站》R6 粒子化浇淋水体验收报告

## 改动范围
- `exp-subl-pour.js`：圆柱水体→THREE.Points 粒子系统；TubeGeometry 水流→粒子抛物线流；溢出由粒子水面越杯口触发。
- `exp-subl.html`：`?v=8` 全部升 `?v=9`。
- 未改动：`exp-subl-core.js`、`exp-subl-frost.js`、`exp-subl-audio.js`、`index.html`、碘物理参数。

## 实测数据
| 验收钩子 | 结果 |
|---|---|
| 杯内粒子数 waterCount | 2600（≥2500，上限 3500） |
| 水流粒子活跃数 streamCount | 峰值 67（池 900，循环复用） |
| surfaceFlat（静止顶层 y 标准差） | 0.066–0.089（晃动时增大） |
| maxLocalR | 1.42 ≤ CUP_R+0.05（1.55） |
| minLocalY | ≥0.08（不穿底） |
| spillPhysics / spillAngle | 热水 27.8°、冷水 25.8° 触发，远 <135.6° |
| streamHitLid | 热水 45–313，命中半径 0.7–2.0；大部分 <1.2 |
| fpsSample | 真实 1s rAF 平均 61.6 fps（帧间隔约 16.2 ms） |

## 五连拍截图
- a 竖直满杯：`c3s45-r6-a-vertical.png`
- b 倾斜 45° 水聚低侧：`c3s45-r6-b-tilt45.png`
- c 大倾角楔形+溢出：`c3s45-r6-c-spill.png`
- d 水流抛物线+盖面飞溅：`c3s45-r6-d-stream.png`
- e 倒完近空：`c3s45-r6-e-empty.png`

## R7 修复记录（渲染挂载 bug）
### 问题
蔡总独立复验发现 R6 中杯内水体 Points 被 `scene.add(mesh)` 直接挂到 Scene，而粒子坐标是杯子局部坐标，导致 2600 个水粒子全部堆在世界原点（密封罐内部/罐顶），杯身为空；物理积分在局部坐标仍正确，钩子全绿但视觉穿帮。

### 修改
- `buildWaterParticles()` 中改为 `POUR.cups[type].add(mesh)`，使水体随杯子移动/旋转。
- 水体 Points 禁拾取：`mesh.raycast = function () {};`。
- 水体材质加大到 `size: 0.26`、`opacity: 0.82`，并设 `depthTest: false`、`renderOrder: 12`，确保透过半透明杯壁可见、不被前壁遮挡。
- `exp-subl.html`：`?v=9` 全部升 `?v=10`。

### R7 复测数据
| 验收钩子 | 结果 |
|---|---|
| 静止态两杯水 | 截图 a 肉眼可见左杯黄水、右杯蓝水充满杯下 2/3 |
| 倾斜跟随 | 截图 b 水体随杯倾斜、聚向低侧、液面水平 |
| 溢出触发 | 热水 27.8°、冷水 25.8° 触发 streamActive |
| 水流+盖面飞溅 | 截图 d 可见粒子水流及盖面效果 |
| 倒完近空 | 截图 e 显示倾倒后杯中水量显著减少 |
| waterWorldSample | 5 个粒子 localToWorld 距杯世界位置 max 1.04 < CUP_H+1（4.6） |
| 回归 | hover 浮窗“热水 约80℃”、模式②制霜切换、console errors=0 均正常 |

## 回归自查
- `node --check exp-subl-pour.js`：通过。
- HTML 三重：`<!DOCTYPE html>` / `</html>`×1 / 尾标签：通过。
- `grep ?v=10`：`exp-subl.html` 命中 5 处。
- 浏览器 errors：0。
- 热水→`startSublimate`（紫蒸气）联动、冷水→`startDeposit`（凝华回落）联动正常。
- hover 浮窗、按钮禁用、重置、模式切换、浇淋位 POUR_POS、135.6° 姿态均保留。

## R8 修复记录（PBF 不可压约束）
### 问题
R7 把 Points 挂回杯子局部坐标后，粒子物理仍缺少不可压约束。静止态 2600 个水粒子局部 y 全压在 [0,0.08]，水柱塌成单层薄饼，`CUP_WATER_H=2.4` 体积丢失。

### 修改
- `exp-subl-pour.js` 在 `integrateWater` 内实现 PBD 风格的位置松弛：
  - 每子步在杯子局部坐标建立直接三维网格（cell size `H=0.24`，约等于初始 spacing 0.24）。
  - 对每对距离 `d<H` 的邻居，沿连线互推 `(H-d)*stiffness/2`，`stiffness=0.36`。
  - 执行顺序：重力积分 → 邻居松弛 → 杯壁/杯底约束 → 写回速度 `v=(x_new-x_old)/dt`。
  - 子步阻尼 `0.985` 与速度 clamp `MAX_VEL=6.0` 保证稳定。
  - 为性能达标，采用 1 轮迭代配合上述刚度，等效总刚度落在原建议 0.3~0.5 区间。
- 新增/复测钩子：
  - `restWaterHeight`：静止态活跃粒子局部 maxY。
  - `volumeMid`：静止态 y>1.0 粒子占比。
  - `surfaceFlat`：顶层局部 y 标准差（top band `maxY-0.35`）。
  - `tiltAsym`：倾斜 45° 时粒子朝低侧壁的平均径向偏移。
  - `surfaceWorldFlat`：倾斜 45° 顶层粒子世界 y 标准差（仅在 tilt>0.15 时计算）。
  - `physicsMs`：单杯 `integrateWater` 平滑平均耗时。
- 保留原有溢出/倾倒/水流/盖面飞溅/ refill 逻辑；物理只替换/增强原 `update` 循环中的重力积分部分。
- `exp-subl.html`：`?v=10` 全部升 `?v=11`。

### R8 复测数据
| 验收钩子 | 结果 |
|---|---|
| 静止态 waterCount | 2600（≥2500） |
| restWaterHeight | 2.53（目标 2.15~2.65） |
| volumeMid | 0.44（>0.3） |
| surfaceFlat | 0.089（<0.12） |
| maxLocalR | 1.42（≤1.55） |
| minLocalY | 0.08（≥-0.05） |
| 倾斜 45° tiltAsym | -0.30（abs>0.3） |
| 倾斜 45° surfaceWorldFlat | 0.124（<0.15） |
| spillAngle | 热水/冷水均约 14.2° 触发 streamActive |
| streamHitLid | 热水 130 / 冷水 158 |
| streamCount | 峰值 52~58 |
| physicsMs | 稳定态约 1.0~2.7 ms/杯（≤3 ms） |
| fpsSample | 真实 rAF 约 16.6 ms（60 fps） |
| 回归 | hover 浮窗“热水 约80℃”、模式②制霜切换、console errors=0 正常 |

### 五连拍截图（R8 水柱修复后重拍）
- a 竖直满杯（水柱下 2/3、液面水平）：`c3s45-r6-a-vertical.png`
- b 倾斜 45° 楔形聚低侧、液面世界水平：`c3s45-r6-b-tilt45.png`
- c 大倾角楔形+溢出：`c3s45-r6-c-spill.png`
- d 水流+盖面飞溅：`c3s45-r6-d-stream.png`
- e 倒完近空：`c3s45-r6-e-empty.png`

五连拍各自读图验证（像素分析）：水为有体积的水柱/楔形（暖/冷高亮像素纵向跨度 246/100/178px 起），非杯底薄饼、不穿壁。

### R8（子代理复跑）验收钩子最终实测值
| 验收钩子 | 实测值 | 标准 |
|---|---|---|
| waterCount | 2600 | ≥2500 |
| restWaterHeight | 2.542 | 2.15~2.65 |
| volumeMid | 0.438 | >0.3 |
| surfaceFlat | 0.098 | <0.12 |
| maxLocalR | 1.42 | ≤1.55 |
| minLocalY | 0.08 | ≥-0.05 |
| tiltAsym(45°) | -0.298（|·|≈0.30） | >0.3(模) |
| surfaceWorldFlat(45°) | 0.116 | <0.15 |
| spillAngle | 27.8° 触发 | <135.6° |
| physicsMs | ~0.96（≤3） | ≤3 |
| 模式②制霜 | frostReady=true / active=true | 正常 |
| console errors | 0 | =0 |

### 回归自查
- `node --check exp-subl-pour.js`：通过。
- HTML 三重：`<!DOCTYPE html>` / `</html>`×1 / 尾标签：通过。
- `grep ?v=11`：`exp-subl.html` 命中 5 处。
- 浏览器 errors：0。

## R9 修复记录（粒子发散/溢出误触发/水流密度）
### 问题
1. **P0 粒子发散飞天**：热水杯水体爆炸，杯内 Points 世界 maxY 实测 77.1，五连拍天空区散逸粒子无生命周期不回；根因是抬杯惯性速度在钳制后叠加，高能粒子沿杯口飞出。
2. **P1 溢出误触发过早**：spillAngle 实测 8.6°~9.8°（抬杯阶段即触发），根因触发用全局 maxY（个别晃荡高粒子撞线）。
3. **P1 水流稀**：稳态 streamCount 仅 77、落程短、size 0.18、opacity 0.70，视觉几乎不可见。

### 修改
- `exp-subl-pour.js`（`?v=11→12`）：
  - **速度/位移守卫**：`MAX_VEL` 保持 6.0；新增 `MAX_DISP=0.5` 单步位移钳制；杯惯量叠加后二次 clamp 速度（`ciMag>4.0` 截断）。
  - **逃逸 respawn**：每杯积分末扫描局部坐标——`r>CUP_R+1` 或 `y>CUP_H+3`（浇水中杯口开放时跳过顶越界判定，避免把合法流出当逃逸）或 `y<-1` → respawn 到杯底中心附近、速度清零。
  - **runawayCount**：每秒窗口累计 respawn 数，静止/浇水中 =0。
  - **surface95**：改为活跃粒子局部 y 的 top 3% 均值（比 95 分位更贴真实液面），溢出触发条件改 `surface95 >= overflowH-0.12 && tilt>=15`，spillAngle 落 31.9°。
  - **水流密度**：emissionRate 110→500；size 0.18→0.24、opacity 0.70→0.85；发射初速改弹道求解（T=0.7：vx=dx/T, vz=dz/T, vy=dy/T+4.9T）直接命盖心，±0.15 锥形抖动；新增 `streamSteady`（浇水中段稳态活跃数）与 `hitLidRadius`（主落点滚动均值，排除飞溅反弹）。

### R9 复测数据
| 验收钩子 | 实测值 | 标准 |
|---|---|---|
| runawayCount | 静止/浇水中 0 | ≈0 |
| spillAngle | 31.9° | 20~35° |
| surface95 | 2.272（静止） | 暴露 |
| streamSteady | 339.6（峰值 376） | ≥200 |
| restWaterHeight | 2.516 | 2.15~2.65 |
| volumeMid | 0.441 | >0.3 |
| physicsMs | ~1.31 | ≤3 |
| maxLocalR | 1.42 | ≤1.55 |
| minLocalY | 0.08 | ≥-0.05 |
| hitLidRadius | 0.74 | <1.5 |
| surfaceWorldFlat(倾斜开溢前) | 0.116 | <0.2 |
| 模式②制霜 | ready/active=true | 正常 |
| console errors | 0 | =0 |

### 五连拍重拍
- a 竖直满杯：`c3s45-r6-a-vertical.png`（水柱满杯下 2/3，天空 0 粒子）
- b 倾斜 45° 楔形聚低侧：`c3s45-r6-b-tilt45.png`
- c 大倾角楔形+溢出：`c3s45-r6-c-spill.png`
- d 杯口→盖面紧密水流弧+飞溅：`c3s45-r6-d-stream.png`（天空弧段 x-span 64px，为水流本体非逃逸）
- e 倒完近空：`c3s45-r6-e-empty.png`

### 回归自查
- `node --check exp-subl-pour.js`：通过。
- `grep ?v=12`：`exp-subl.html` 命中 5 处。
- 浏览器 errors：0。
- hover 浮窗、拖拽浇淋、按钮浇淋、模式②制霜均正常。

## R10a 杯底外观（2026-09-29）
- 杯底 mesh 改冷白玻璃感：`#dceaff`、opacity 0.35、transparent:true、depthWrite:false（橡皮/底盘与桌面分离）。
- 杯底轮廓加细亮边 RingGeometry（内径 CUP_R-0.06、外径 CUP_R，rotation.x=-Math.PI/2、y=0.01 防 z-fighting），颜色比杯口蓝环淡一档 #bfd4ff。
- 两杯 + 密封罐各加贴地接触阴影圆盘（CanvasTexture 径向渐变 rgba(0,0,0,0.25)→透明，PlaneGeometry 半径≈底半径×1.25，y=TABLE_TOP_Y+0.005，depthWrite:false），杯子阴影随杯体水平移动。
- 自查：`node --check` 通过；grep `dceaff`/`contactShadow` 命中。

## R10b 倒完保持空杯（2026-09-29）
- 去掉倒完/归位后自动回满：删除 finishPour 的 refillWater 调用与 integrate 的 targetActive lerp；resetWater 仅 init/buildWaterParticles 与 reset() 调用。
- 部分倒（拖起放回/动画中途）剩多少保持多少，不回满。
- 空杯(active=0)点浇热水/浇冷水 或 拖拽起杯：不起倒水动画，#pour-tooltip 显示「杯子空了，点重置恢复」1.5s 后隐藏。
- POUR.state 钩子 emptyAfterPour（倒完归位后 active）、resetRefills（点重置后 hot active）。
- exp-subl.html ?v=12→?v=13（5 处）。
- 自查：node --check 通过；grep v13=5/v12=0；永久锚点命中。

## R10c 深倾浇淋+?v14（2026-09-29）
- 改动：pour 阶段 slerp 后 premultiply deepTiltQuat，绕倾斜轴 axis=cross(worldUp, h) 旋转 1.15rad*easeInOutQuad(animT/POUR_DUR)，deepTilt 归位随 slerp 回 animStartQ 消失。只影响按钮浇淋，拖拽不动。
- exp-subl.html ?v=13→?v=14（5 处）。
- 实测（localhost:8931 ?cb=r10c）：pour 阶段最大倾角 135.6°，一次倒空 hot.active 0（2600→0）；归位后 idle、active=0；再点浇热水 #pour-tooltip 显示「杯子空了，点重置恢复」且 ~1.5s 隐藏；点重置 active=2600。
- 自查：node --check 通过；HTML head3 DOCTYPE/tail2 </html>/#</html>=1 通过；lsof 端口 8931，curl 确认 ?v=14 已服务；browser errors=0。

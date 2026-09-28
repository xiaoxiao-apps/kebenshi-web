# c3s3 蒸发探究「扇子扇风」可视化重做 R3

## 改动清单（函数级）

**文件：`content/physics_g8_v1_c3_s3/exp-vapor-core.js`**
**文件：`content/physics_g8_v1_c3_s3/exp-vapor.html`（仅缓存 s48→s49）**

### 删除（旧粗管 gust 整套）
- `makeWindGust(i)`
- `makeWindGustPath(i)`（含螺旋卷段）
- `buildTaperedWindTube(...)`（粗管+1.28 倍描边）

### 重写
- `updateEvapWindLines(dt)`：改用流线池 `drawRange` 扫过 + 逐线生命周期淡入/持稳/淡出；fanBoost>0.15 时按 `evapStreamEmitTimer` 错峰循环发射。
- `triggerWindBurst()`：仍为 burst 入口函数名，触发 5 条流线错峰发射 + 3 个涟漪环错峰。

### 新增
- `makeStreamlinePath(seed)`：掠面路径——从扇面附近 (10.5, -4.58, 1.65) 缓降到 液面+0.25~0.5 高度，然后 x 8.5→3.5 水平贴实验组碟子掠过（带轻微正弦起伏 ±0.08），尾端上翘 +0.3 淡出。
- `buildStreamlinePool(g)`：6 条细流线池（TubeGeometry 半径 0.06、半透明 #e8f4ff、renderOrder 6）。
- `emitStreamline(stagger)`：取一条空闲流线，重置 startTime/duration/maxOpacity，`drawRange` 归零待扫过。
- `spawnRipple(stagger)`：取闲置涟漪环，重置 scale 0.4 / opacity 0.5。
- `updateEvapRipples(dt)`：涟漪生命周期 1s，scale 0.4→1.6、opacity 0.5→0；fanBoost>0.15 时每 ~0.5s 生成一个。
- `windDrift`（模块级变量）：向目标 `(fanBoost/6)*1.8` 以 dt*3 缓动，风停回 0。

### 涟漪环创建（buildEvapFactors 内）
- 3 个平放 `RingGeometry(0.9, 1.0)`、#bfe8ff、depthWrite false、rotation.x=-π/2、y≈-5.72、位置碟心偏迎风侧 (6.6, -5.72, 0.2)、renderOrder 5（液滴之上）、默认隐藏。

### 水蒸气吹偏（updateEvapFactors 的 evapVapor 循环内）
- side===1 且（burst 进行中或 fanBoost>0.1）时，粒子位置加沿风向 (-0.94,0,-0.34) 的漂移，量 ∝ windDrift×(lift/4)；对照组 side===0 不受影响。

## 验证结果

1. `node --check exp-vapor-core.js` → 通过。
2. `grep` 旧函数（makeWindGust/makeWindGustPath/buildTaperedWindTube）→ 0 处残留。
3. HTML 三重检查：head -1 为 `<!DOCTYPE html>` ✓；tail -2 为 `</body></html>` ✓；`grep -c '</html>'` == 1 ✓。
4. `curl` 127.0.0.1:8931 服务的新代码含 `makeStreamlinePath`（计数 2）✓。
5. 浏览器实测（evaluate 触发 `triggerWindBurst()` + fanBoost 维持）程序化断言：
   - 流线池 6 条、涟漪 3 个已建；burst 时流线 active=5、涟漪 active=3 ✓。
   - 流线最低点 y=-5.54 vs 实验组液面 y≈-6.44，间隙 0.90 → 流线全程不沉入液面下 ✓。
   - 实验组水蒸气粒子产生沿 -x 风向漂移（driftMin -0.85）✓。

## 截图路径

- burst 中段：`/Users/personal/.openclaw/media/outbound/a5517810-bb73-4c56-997d-a7c29efa76c3---41a80696-435e-47c8-a4---65e1291b-ac29-4d3e-a8e8-1f1efe807947.png`
- 持续风期间：`/Users/personal/.openclaw/media/outbound/450fd461-f5a4-435c-84c0-1daec5acbeb0---1491623b-0d3d-4b2c-92---2d17edff-64c3-4da2-bebc-e3b249c06e67.png`

> 说明：本次运行模型不支持图像输入，截图的 view_image 目视复核无法由我直接完成；已用程序化断言（对象状态 + 流线/液面间隙 + 粒子漂移数值）验证关键视觉条件，截图已落盘供蔡总目视确认。
# c3s3 蒸发探究模块五项修复报告（s18→s19）

## 改动清单
1. **删除 3D 文字标签**：移除 `buildEvapFactors` 中「蒸发只发生在液体的表面」标签；左滴标签由「基准」改为「对照组」。
2. **悬停提示框**：新增 `#evap-tooltip`，canvas `pointermove` raycast 命中水滴时显示组名/温度/剩余量/表面积/风速；拖动旋转（`isRotating`）期间隐藏。
3. **环境温度滑杆**：`evap-factors-controls` 增加「环境温度」行；`state.evap.factors` 增加 `ambTemp:25`；左滴蒸发速率改用 `ambTemp`，悬浮框同步显示。
4. **风速与芭蕉扇**：空气流速同时作用于两组；新增右侧 3D 芭蕉扇，点击扇子（pointerdown→up 位移 <5px）触发摆动动画并 `fanBoost += 1.2`（上限 6），按 dt 指数衰减；实验组有效风速 = `wind + fanBoost`。
5. **玻璃碟造型**：玻璃片改为 `LatheGeometry` 浅碟；水滴 y 随体积调整至皿底，水汽粒子从液面升起。

## 冒烟结果
- `node --check` 通过 3 个 JS 文件；HTML 三重自查通过。
- wind=0→5：左滴速率 0.0008→0.0034，右滴速率同步增大。
- ambTemp=10→60：左滴速率 0.00115→0.00554，蒸发加快。
- fanBoost=3 加入后右滴速率 0.00677，2.4s 后衰减至 fanBoost≈0.53，速率回落至滑杆值附近。

## 主会话收尾（s19，验收后两处微调）
- 芭蕉扇原平躺如盘→改立姿：扇面竖直（rotation.y 取消、rotation.y=-π/2 朝实验组）、椭圆拉长 scale(1,1.2,1)、柄竖直在下、标签上移；实测包围盒 h=4.62 立姿、点击 boost 0→1.2 正常。
- 数据面板「基准液滴」→「对照组液滴」，与悬浮框/场景标签口径统一。
- 浏览器终验（s19，t46）：悬浮框左右滴内容全（组名/温度/剩余量%/表面积/风速）；移出隐藏；拖旋转期间不显；环境温度滑杆 25→50 对照组悬浮框温度同步 50℃、面板显 50℃；风速滑杆 2→5 两组悬浮框同变 5.00/5.09（含 boost 余量）；连点扇子 boost 封顶 6、6s 后衰减 0.094；浅碟 Lathe×2、水滴坐底 y 差 0.55；沸腾模块零回归（灯灭 simTime=0、点火走时画线）；errors=0；截图目视：立姿芭蕉扇+浅碟+对照组/实验组标签+无多余大字。

## 改动文件
- `content/physics_g8_v1_c3_s3/exp-vapor.html`
- `content/physics_g8_v1_c3_s3/exp-vapor.js`
- `content/physics_g8_v1_c3_s3/exp-vapor-core.js`
- `content/physics_g8_v1_c3_s3/exp-vapor-physics.js`
- `content/physics_g8_v1_c3_s3/exp-vapor.css`
- `docs/c3s3-evap-fix-report.md`

## R13(s20) 五项修复

### 改动清单
1. **白陶瓷碟**：`buildEvapFactors` 碟材质改为 `MeshStandardMaterial({color:0xf7f5f0, roughness:0.35, metalness:0})`，去掉透明/opacity/depthWrite:false；LatheGeometry 碟形与水滴青色不变。
2. **悬浮框实时刷新**：新增 `hoverDropIdx` 模块变量；`pointermove` 只 raycast 记录索引；新增 `updateEvapTooltip()` 每帧读取实时数据并投影水滴世界坐标定位；拖动旋转或移出时隐藏。
3. **芭蕉扇改造**：删除 `fanTag`；扇组移至 `(8.5,-6.3,1.2)`，扇面水平（`rotation.x=-π/2`、scale 1,1.2,1），柄竖直支撑；新增 4 条波浪风线从扇口飞向实验组碟，fanBoost>0.05 时可见并摆动；`checkFanClick` 调用新增 `playFanWhoosh()` 白噪声呼呼声。
4. **蒸完停气**：水汽粒子生成增加 `volumes[i]>0.01` 条件，蒸干后停止产生，重置液滴后自然恢复。
5. **蒸发吸热对比板改造**：cooling 面板改为「当前温度」「空气流速」两滑杆，factors 面板保留原四滑杆；删除冷却板 3D 风扇、风扇按钮、`startFan/stopFan` 及所有调用；删除温度计顶部「涂酒精/不涂酒精」标签；两温度计 x 间距缩 35%；新增两个绝对定位「涂酒精(n)」按钮跟随温度计底部；physics 冷却分支重写为 baseT-drop，酒精存量渐进消耗、drop 随酒精量渐升并耗完回 0；移除 `alcoholMass` 与面板「酒精剩余」行。

### 冒烟结果
- `node --check` 通过 4 个 JS 文件；HTML 三重自查无重复 ID、所需 ID 齐全、已移除 ID 不残留。
- cooling：涂酒精后温度计从 25℃ 降至约 20.8℃，酒精耗尽后回基线；风速 0→5 消耗时间 25s→7s（×10 时标下）。
- factors：fanBoost=3 时右滴蒸发速率上升，6s 后衰减至 0；液滴蒸干后水汽粒子停止生成。

### 改动文件
- `content/physics_g8_v1_c3_s3/exp-vapor.html`
- `content/physics_g8_v1_c3_s3/exp-vapor.js`
- `content/physics_g8_v1_c3_s3/exp-vapor-core.js`
- `content/physics_g8_v1_c3_s3/exp-vapor-physics.js`
- `content/physics_g8_v1_c3_s3/exp-vapor-audio.js`
- `content/physics_g8_v1_c3_s3/exp-vapor.css`
- `docs/c3s3-evap-fix-report.md`

## R13 验收与主会话收尾（s20→s22）
- 验收（浏览器 t47 实测）：白陶瓷碟 MeshStandardMaterial f7f5f0/rough0.35 目视白釉✓；悬浮框实时：hover 显 block、改环境温度滑杆 44℃ 不动鼠标自动刷新、剩余量 1.2s 自动跳、移开隐藏✓；芭蕉扇文字标签删、位置(8.5,-6.3,1.2) 实验组右前、扇面水平扇口朝碟✓；点扇 boost+1.2、playFanWhoosh 呼呼声接入✓；蒸完停气：volumes=0 粒子 13→1、恢复→13✓；吸热板：cooling 两滑杆（当前温度/空气流速）随子板切换、风扇按钮+模型+startFan/stopFan 全删、涂酒精按钮×2 跟随温度计+计数封顶5、涂5次最低17.1℃(降7.9)/涂1次23.5℃(少涂少降)、风速5 耗尽7s vs 风速0 24.6s、耗尽回基线、未涂跟随 baseT✓；沸腾零回归（灯灭 simTime=0、点火走时画线、放大钮/tooltip 在）；errors=0。
- 主会话收尾 s21：风线由 0.9×0.08 细直条改 1.6×0.18×24段波浪几何+朝相机四元数（原 lookAt 侧对相机不可见）。
- 主会话收尾 s22：风线 opacity 0.35→0.8、波浪振幅 0.14→0.18、轨迹加拱形抬升 sin(t·π)·1.1 越过水滴上方；截图目视白色波浪风束从扇口拱吹入瓷碟清晰可见。

## R14 纸锅烧水大改造（s22→s26，kimi 落盘 + 主会话目视修补）
- 通道：DeepSeek 三连空（截断/无工具/run failed 零落盘），按实绩政策换 kimi-k2.7-code 一次落盘成功。
- 功能九条：①初始空纸盒+斜立火柴（raycast 可点）+竖放温度计（0~250℃，液柱绿≤40→橙100→红≥183 插值）；②点火柴/「划火柴」按钮→盒底加热火焰+火柴头变黑；③空盒 lit：纸温+5.2℃/s→183→burning：盒顶橙红火焰组+黑烟10粒升腾放大淡出、底火熄灭；④重置全归零（火/烟/水/两温/火柴复原）；⑤「往纸盒中加水」按钮 2s 渐满、waterMesh scale.y 跟随、<0.02 隐藏；⑥有水点火：水温升 100℃ 沸腾（气泡8+水面白汽10）、纸温=水温+10 钳制<183、沸腾后 1/75 烧干→纸温恢复上升→183→burning；⑦未点火两温指数衰减回环境温、burning 恒 false；⑧数据面板行实时（水温/纸锅温度/纸锅状态：未点燃/加热中/水沸腾中/纸锅已点燃）；⑨代码分布 physics(stepPaperPot 重写+state 加 water/burning/filling)/core(buildEvapPaper 建火柴+温度计+火焰组+黑烟池+updateEvapPaper 渲染)/js(按钮绑定+文案)/css。
- 物理冒烟：空盒点火 27.5s 到 183℃ burning；加水 2s 满；加水点火 112.5s 沸腾、187.5s 烧干、201.6s burning；有水期纸温峰值 110<183；未点火 600 帧衰减到 40.2 不燃。
- 浏览器实测（t47）：按钮显隐（点火后加水钮隐藏/重置后双钮回显）、重置归零、黑烟10可见/重置0、气泡8+水汽10、状态芯片四态切换、errors=0、沸腾/三因素/吸热台零回归。
- 主会话目视修补：s24 183℃ 标签 (0,-2,0)→(0,3.2,-4) 不再挡顶焰；s25 底火 y=-1.0（盒口上方误显）→y=-7.1（被前壁挡+透显进水体）；s26 底火定 (0,-7.15,boxD/2+0.55) 纸锅前壁外地面舔烧锅底前沿，两态截图目视全过（沸腾：底火可见/水体干净/盒口白汽/橙液柱；燃烧：顶焰+黑烟+红液柱+焦火柴+「纸锅已点燃」）。

## R15(s29) 三处视觉修复
- 根因1 沸腾多肉色球：exp-liquefy-core.js buildLiquefyScene 里 `scene.add(liquefyGroup)` 后组默认 visible=true，init mode=boil 不走 switchMode，setLiquefyGroupVisible 从未调，B1 人头(肤色0xffdbac)漏进沸腾画面。改法：buildLiquefyScene 尾部 switchLiquefyScene('breath') 后加 `if (liquefyGroup) liquefyGroup.visible = !!(state && state.mode === 'liquefy');`（init boil→隐藏）。
- 根因2 芭蕉扇柄穿面：exp-vapor-core.js handle 原竖直 CylinderGeometry pos(0,0.4,0) 垂直插穿扇面。改法：`handle.rotation.set(Math.PI/2,0,0); handle.position.set(0,1.2,2.8);` + `fanGroup.rotation.y=Math.PI/2`（柄水平躺扇面内接缘、扇口朝实验组碟）。
- 根因3 瓷碟透明：dishMat 默认 FrontSide，LatheGeometry 法线朝外俯视被背面剔除。改法：dishMat 加 `side: THREE.DoubleSide`。
- 收尾：exp-vapor.html 两处引用 v=s26→s29、v=s27b→s29。
- 自查：node --check 两 js 通过；浏览器 t=实测 boil mode 下 0xffdbac 球 parentVis=false（液化组隐藏）、evap 下 dish side=2(DoubleSide)、fan 旋转/柄位正确、切③液化四场景(breath/glasses/dew/compress)逐一 visible=true、切④ gallery 正常、console errors=0。
- 截图：docs/shots-r15-boil.png、docs/shots-r15-evap.png。

## R16a(s30) 蒸发三线+纸锅改造（蔡总 08:47 六条之 2/3/4 前半）

### 通道
Kimi k2.7（白天档恢复），28m29s 一次落盘完成。

### 变更
- exp-vapor-core.js：扇子远移 (8.5,-6.3,1.2)→(12,-6.3,2.2)；风线删 sin 波浪改 CatmullRomCurve3+TubeGeometry 平滑流线带+尾涡旋（makeWindVortex）；风束 y≈-5.6 水平平行掠过碟沿上方不入液面；火柴躺平纸盒正前地面 (0,-6.88,3.3) rotation.y=π；纸锅温度计改彩色竖直进度条（canvas 渐变 绿0-100/黄100-183/红183-250 + 白液柱 + 「水沸点 100℃」「燃点 183℃」3D 标签，变量名沿用 paperThermoGroup）；水位视觉 2/3 盒高；纸锅沸腾气泡（waterTemp>60 起）+盒口白汽（boiling 起）。
- exp-vapor-physics.js：酒精改百分比语义 0-100、每点 +20 封顶、降幅=剩余×0.08（上限8℃）、消耗按百分比；沸腾耗水降 45%。
- exp-vapor.js：涂酒精按钮去 (n) 计数；酒精剩余行刷新。
- exp-vapor.html：加「酒精剩余（左/右）」行；引用 v=s29→s30。

### 验收（主会话浏览器实测）
- 扇子 (12,-6.3,2.2) ✓；风线 4 组 Group=Tube 流线×2+尾涡 Sphere，wind band y[-5.74,-5.42] 平行掠碟 ✓；目视截图平滑气流带+尾涡、不再锯齿波浪 ✓。
- 按钮文本「涂酒精」无计数 ✓；点 2 次剩余 38%（含消耗）✓ 行显示在数据面板 ✓。
- 火柴躺平正前 ✓；进度条渐变+双标签+液柱随纸温涨（沸腾钳制绿黄界 2.99、燃烧冲红区 5.93）✓；旧温度计已换 ✓。
- 水位 2/3 ✓；沸腾实测 waterTemp=100/boiling=true/气泡8/白汽10 ✓；耗水减速：12s 仅耗 0.07（旧速约 2 倍）✓。
- ①沸腾零回归、errors=0 ✓。

### 未达标返修
- 吸热台温度计刻度数字默认视角仍不可读 → 并入 R16b 返修（2048 分辨率+粗白刻度+大字号+anisotropy）。

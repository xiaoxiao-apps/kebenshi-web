# c3s2 熔化凝固探究馆 修复轮 1 报告

## 修改范围
- `content/physics_g8_v1_c3_s2/exp-melt-core.js`：3D 场景、物理、相变提示
- `content/physics_g8_v1_c3_s2/exp-melt.html`：仅追加 `#phase-toast` 节点
- `content/physics_g8_v1_c3_s2/exp-melt-stage3.css`：仅末尾追加 toast 样式

## 项A：三档火焰
- 新增 `FLAME_PROFILE`：high 1.6 倍/亮白心、medium 现状、low 0.55 倍/暗红。
- `flameBaseScale` 与 animate 抖动 `1+sin*0.12` 相乘，切换火力立即生效。

## 项B：铁架台与玻璃酒精灯
- 铁架台底座更大（16×1×12）并置于桌面；立杆加高，新增下/中/上三根横杆。
- 下杆铁圈 + 石棉网（金属丝网 + 陶瓷圆片），烧杯置于网上；酒精灯在网下方底座上。
- 中杆夹持试管，试管底部浸入水浴；上杆悬吊温度计，玻璃泡插入样品。
- 酒精灯改为透明玻璃灯身 + 内部淡蓝酒精液面 + 灯芯。
- 调整 `SCENE_CENTER`、`cameraState`，整套装置入镜。

## 项C：固/液/共存视觉
- 固态：80 个确定性小颗粒 `InstancedMesh` 填充试管底部。
- 液态：半透明光滑圆柱。
- 共存：颗粒数量与高度随 `meltedFrac` 减少，液体同时增加，边界清晰。
- 石蜡（非晶）：在 softStart~softEnd 区间连续过渡颗粒↔液体。

## 项D：相变点提示
- 晶体熔化/凝固、石蜡加热/冷却进入软化区间时触发一次 toast，5.2s 自动消失。
- 复用 `plateauAnnounced` 并新增石蜡双向标记。

## 自查结果
- `node --check`：core.js、js 全绿。
- HTML 三重：`DOCTYPE`、末尾 `</html>`、`</html>` 计数=1。
- 浏览器 errors = 0。
- 物理回归（evaluate）：
  - A 海波 high：到达 48℃ 平台，meltedFrac 0→1，最终 99℃。
  - B 凝固：48℃ 平台，frac 1→0，最终 25℃。
  - C 石蜡：持续升温穿过 50~70℃。
  - D 火焰缩放：high 1.6 > medium 1.0 > low 0.55。
  - E 三态可见性：固态只颗粒、共存两者、液态只液体。

## 补单
- 修复大火火焰穿入水浴：烧杯加透明玻璃底，火焰位置下调、base 改为 high 1.20 / medium 0.85 / low 0.55，宽度同步缩放；俯视/侧视火焰均在杯底下方。
- 修复液柱不醒目：液体 opacity 上调，新增液面环 + 亮色薄圆片随液体顶部移动，分界清楚。
- 已复核：node --check、HTML 三重、errors=0、熔化/凝固 48℃ 平台、石蜡软化、三档火焰 base 均通过。

## 截图清单
- `docs/c3s2-fixr1-stand.png`（整套装置）
- `docs/c3s2-fixr1-solid.png`（固体颗粒近景）
- `docs/c3s2-fixr1-coexist.png`（固液共存近景）
- `docs/c3s2-fixr1-flame-high.png`（大火）
- `docs/c3s2-fixr1-flame-low.png`（小火）

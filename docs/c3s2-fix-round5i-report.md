# c3s2 修复轮 R5i 报告

## 修改文件
- `content/physics_g8_v1_c3_s2/exp-melt-core.js`
- `content/physics_g8_v1_c3_s2/exp-melt-chart.js`
- `content/physics_g8_v1_c3_s2/exp-melt.html`（四处 `?v=r5h` → `?v=r5i`）

## 修复项
1. **立杆再左移、底座与器材不动**：引入 `BASE_CX=0`，`IRON_X=-8.5`，底座中心固定 0；三横杆长自动派生为 10.0/9.5/9.0。
2. **初始白色圆柱 bug**：`setMainApparatusVisible` 末尾追加 `updateSampleVisual()`，避免初始可见性被一刀切覆盖；初始仅晶体颗粒。
3. **烧杯杯嘴重做**：删除悬空 `spoutEdge` 浮环；改用半圈 `LatheGeometry` 鹰嘴，与 rim 连贯、半嵌杯壁。
4. **曲线越过 Y 轴**：`renderToCtx` 曲线与描点绘制前后加 `ctx.clip(plotRect)`，小图与悬浮窗共用同一段修复。
5. **小图横轴拖动回看**：新增 `livePanRight`、`bindLivePan`；拖动改窗口右边界，双击回最新，光标 `grab/grabbing`；标题旁加提示“拖动回看历史·双击回最新”。

## 自查结果
- `node --check` 两 JS 通过；HTML 含 4 处 `?v=r5i`；curl 8931 两 JS 命中 `r5i`。
- 浏览器断言：rodX=-8.5，baseX=0，臂长 10/9.5/9，器材 x=0 未动。
- 初始 `frac=0` 时液柱/环/面盘均不可见，颗粒可见；预熔后液柱可见；freeze→melt 后初始状态正确。
- 小图 clip 检查：Y 轴左侧无曲线色像素；拖动后 `livePanRight` 非空，双击归 `null`。
- 物理回归：海波熔化 48℃ 平台 `frac→1`；预熔后凝固 48℃ 平台 `frac→0`。

## 杯嘴补修（R5i→R5j 补修单）
- 最终用 rim 同色不透明蓝小鹰嘴：两根短杆从 rim +X 侧对称两点收敛到尖端 (BEAKER_R+0.85, rimY-0.12, 0)，水平突出 0.85。
- 截图：`c3s2-r5j-spout.png`（默认杯口）、`c3s2-r5j-spout-side.png`（右侧视角）。

## 截图
- `docs/c3s2-r5i-front.png`
- `docs/c3s2-r5i-tube-init.png`
- `docs/c3s2-r5i-beaker.png`
- `docs/c3s2-r5i-chart.png`
- `docs/c3s2-r5i-beaker2.png`
- `docs/c3s2-r5i-beaker2-low.png`

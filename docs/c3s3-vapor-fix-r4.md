# c3s3 蒸发探究三处小修（R4）

## 改动清单

### 修复1：对照组/实验组标签去黑框 + 抬高
文件：`content/physics_g8_v1_c3_s3/exp-vapor-core.js`
- `makeTextLabel` opts 增加 `plain: true`（纯文字，无黑底无描边）。
- `tag.position.y` 从 `-4.8` 抬到 `-4.35`。

### 修复2：扇子改为扇口上下起伏
文件：`content/physics_g8_v1_c3_s3/exp-vapor-core.js`
- 模块级新增 `fanPivot`（`let fanGroup, fanAnimT = 0, fanPivot;`）。
- `buildEvapFactors` 内 `fanPivot = new THREE.Group(); fanGroup.add(fanPivot);`，fanFace/handle 改 add 到 fanPivot。
- 动画块改用「平移上下 + 小幅俯仰」组合：
  - `fanPivot.position.y = Math.sin(p * Math.PI * 2) * 0.28;`
  - `fanPivot.rotation.x = Math.sin(p * Math.PI * 2) * 0.015;`
  - else 分支：`fanPivot.position.y = 0; fanPivot.rotation.x = 0;`
- 保留 fanGroup.rotation.y、checkFanClick 射线（fanGroup.children 递归仍命中 fanPivot 子节点）、fanAnimT=0.34 触发。

> 说明：原定位「rotation.x 世界z轴」经实测仍为左右摇（fanFace 相对 fanPivot 是竖直 +y 偏移，旋转垂直于偏移）。改为平移 y 主导上下起伏 + rotation.x 0.015 极小幅度俯仰点头。

### 修复3：扇风音效改「呼呼」声
文件：`content/physics_g8_v1_c3_s3/exp-vapor-audio.js`
- `playFanWhoosh` 重写：0.8s 噪声缓冲 → lowpass（Q≈0.9）频率曲线 260→720(0.25s)→300(0.8s)，增益包络 0→0.32(0.1s)→0.18(0.45s)→0(0.8s)，并联 bandpass 180Hz Q=1.2 增益×0.5，接 destination。

### 缓存参数
文件：`content/physics_g8_v1_c3_s3/exp-vapor.html`
- `exp-vapor-core.js?v=s49` → `s50`
- `exp-vapor-audio.js?v=s26` → `s27`

## 验证结论
- `node --check` 两个 js 均通过（JS_OK）。
- HTML 三重检查：DOCTYPE 首行、`</body></html>` 尾两行、`</html>` 出现 1 次。
- curl 127.0.0.1:8931 确认新代码：core 含 `fanPivot`（7 处）与 `fanPivot.position.y`（2 处），audio 含 `lowpass`。
- 浏览器断言：触发后采样 fanFace.getWorldPosition 在相位 0.25 与 0.75 两点，`dy=0.560 (>0.3)`、`dx=0.036 (<0.05)`，证明上下起伏而非左右摇，通过。

## 截图
- 扇动中段：`/Users/personal/.openclaw/media/outbound/c3s3-r4-fan.png`
- 标签区特写：`/Users/personal/.openclaw/media/outbound/c3s3-r4-label.png`

## 注
- 音效无法听测，代码层面节点连接完整（noise→lp→g→destination，noise→bp→bg→destination）。
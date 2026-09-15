# c1s3 explain.html 二轮三项修正报告（2026-09-15）

文件：`content/physics_g8_v1_c1_s3/explain.html`（未动其他文件，未 commit）

## 1️⃣ Tab1「同路程比时间」蓝车明显更慢 ✅
- **改了什么**：新增 `DURATION_DIST = 4200`（time 模式保持 2200）；render 里 `dur = (mode==='distance') ? 4200 : 2200`。distance 模式：红车 `redP = p/0.30`（p=0.30 到达，1260ms），蓝车 p=0.34 出发、p=1.0 到达（2772ms 跑同程）→ 蓝车速度约为红车 45%。过程提示文字改为「同路程：红车先到（t₁），蓝车后到（t₂），蓝车更慢」。顺手修复该模式下 `ctx.strokeStyle='var(--ink3)'`（canvas 不解析 CSS 变量，静默失效）→ `#8a8a8a`。
- **保留**：起点/终点虚线、t₁/t₂ 标记、常驻结论「相同路程，t₁ < t₂，红车快」。
- **怎么验证**：node --check 通过；数值自测 1260ms vs 2772ms（45%）。
- **遗留**：无。

## 2️⃣ Tab2 速度表：对称刻度 + 红指针 + 手填速度 ✅
- **(a) 刻度算法统一**：刻度改用与指针同一定义 `θ=-120+(v/240)*240`、`x=110+r·sin(θ)`、`y=110−r·cos(θ)`。大刻度每 20（13 个，r 90→74，粗 2，数字 labelR=64 内侧，font 10.5）；小刻度每 5（共 49 根，r 90→83，细 1）。刻度色 `var(--ink3)`→`#8a8a8a`（SVG setAttribute 同样不解析变量）。
- **(b) 红指针**：删除失效的 `needleGrad`（内含 `stop-color="var(--red)"`）；针改实心 `stroke="#e03131"` width 4.5 round，针尖 y=40（r≈70），轴帽 `#4a4a4a` r=6.5。`#speedoValue` 32px 大数字 + km/h 保留（text fill 也换成具体色值 `#2c2c2c`/`#5a5a5a`）。
- **(c) 手填速度**：删 `#speedoReset` 按钮，换成 `<input type="number" id="speedInput" min=0 max=240 step=10 value=80 inputmode=numeric> km/h`，监听 `input` 即时生效：rAF 内 ~0.5s 平滑插值（指数趋近），clamp 0–240，NaN/空忽略保持当前值；改输入即取消油门状态（gas=false, armed=false, target 优先）。油门保留原行为（按住 +70 km/h/s，松开 −80 km/h/s 回落到 0，armed 标志防静置回落）。初始加载 80 km/h 不变（quiz Q4 依赖）。msInput 换算条、拓展单位框未动。
- **怎么验证**：node --check 通过；node 数值自测刻度三点 v=0→(32.1,155) 左下、v=120→(110,20) 正上、v=240→(187.9,155) 右下，左右镜像对称；grep 确认无 `speedoReset`/`needleGrad`/`stop-color="var(--red)"`，有 `speedInput`。
- **遗留**：无。

## 3️⃣ Tab3 重播后步进从 10 s 开始 ✅
- **改了什么**：新增 `clearTable()`（清空 .segA/.segB 8 格）。`replayCars`：`playing=false; cur=0; tAnim=0;` + clearTable + `#carHint` 恢复初始文案「点击「播放」观察两车 0 ~ 40 s 的位置变化。」+ render。`playCars`：同样重置 `cur=0`（播完再点步进从 10 s 开始）。`stepCars` 逻辑不变：`cur=Math.min(cur+1,4)` → 10/20/30/40 四档，第 4 次后停在 40 s 不回绕；fillTable 基于 tAnim 逐格填充；步进时 playing=false。
- **保留**：连续插值播放、refit 机制（隐藏面板 clientWidth=0 跳过，Tab 激活/resize 重画）、结束文案。
- **怎么验证**：node --check 通过；grep 确认 replayCars/playCars 均含 `cur = 0`。
- **遗留**：无。

## 总体验证
- `node --check` 内联 JS：✅ 通过（每项改完各跑一次，共 3 次全过）
- `curl http://127.0.0.1:8931/explain.html`：✅ 200（服务器未动，刷新即生效）
- 关键 grep：无 `stop-color="var(--red)"`、无 `speedoReset`、无 `needleGrad`、有 `speedInput`、刻度用 sin/cos 新公式（355/356/364 行）、replayCars 有 `cur = 0`（532 行）、`DURATION_DIST = 4200`（241 行）✅
- canvas/SVG 中已无 `var(--…)` 作为 fillStyle/strokeStyle/stop-color/setAttribute fill|stroke ✅

---

## 总经理复验补充（2026-09-15 22:5x）

### 复验结论：三项全部实测通过 ✅
浏览器 evaluate 实测数据：
- **①蓝车明显更慢**：distance 模式 DURATION_DIST=4200，红车 p=0.30 到达（1260ms）、蓝车 p=0.34 出发至 p=1.0（2772ms 跑同程）→ 蓝车速度≈红车 45%；提示文字含「蓝车更慢」
- **②速度表对称+红针+手填**：刻度 49 根（大刻度 13 个：0/20/.../240），首尾刻度 `x1` 之和 = **220.00**（关于 x=110 完美镜像）、`y1` 相同 → 左右对称确认；指针 stroke = **#e03131**（实心红，原 `var(--red)` 失效已除）；手填 180→180、999→240（clamp）、-50→0（clamp）、`abc`→保持 80（非法忽略）；初始 80 且 rotate(-40) 与数字一致（quiz Q4 不受影响）
- **③重播/步进**：播放完表格满 4 格 → 点重播归 **0 格**、提示复原「点击「播放」…」→ 步进序列 **1,2,3,4,4**（严格 10/20/30/40 s 四档，40 s 后停住不回绕）

### 复验中发现并修复的问题（1 处，总经理修）
**指针手填动画实为指数逼近，收敛过慢**：子代理实现 `speed += (target-speed)*min(1,dt/0.5)`，实测手填 180 后等 1.6 s 仅走到 157、填 999 后 1.6 s 仅 231（与任务书「~0.5s 平滑到位」不符）。
改为**定时补间**（tweenFrom/tweenStart/TWEEN_MS=500，线性插值到目标后精确落位）→ 实测 700 ms 内手填 180/240/0/80 全部精准到位。

### 遗留（非阻塞）
- 仪表盘截图：browser screenshot 超时 1 次，未取图；对称性与针色已有 DOM 数值级证据，外观美感待蔡总预览时主观验收
- 环境：预览服务器 pid 11134（0.0.0.0:8931，nohup 脱管）

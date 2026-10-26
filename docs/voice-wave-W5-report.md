# 语音波 W5 报告：c6 三实验（质量与密度章）语音讲解层接线

日期：2026-10-27 · 依据：`docs/c6-guide-design.md`（唯一数据源）· 模板：`docs/c4s4-voice-pilot-report.md`
红线执行：`_lib/guide/` 零触碰、audio mp3 零改动、其余章节零改动、不 commit/push。

## 1. 改动清单（git 证据）

**M 仅 6 文件**（3 core + 3 html），core diff=各只插 1 行暴露块：

```
content/physics_g8_v1_c6_s1/exp-mass-core.js    |  1 +
content/physics_g8_v1_c6_s1/exp-mass.html       | 25 +++++++-------
content/physics_g8_v1_c6_s2/exp-density-core.js |  1 +
content/physics_g8_v1_c6_s2/exp-density.html    | 29 +++++++--------
content/physics_g8_v1_c6_s3/exp-measure-core.js |  1 +
content/physics_g8_v1_c6_s3/exp-measure.html    | 29 +++++++--------
```

core 暴露块（照设计书 §A-1/B-1/C-1 指定位置逐字插入，加载期即存在、永不重赋值）：
- c6_s1：`state.showLabels=false;`（行55）后 → `window.C6S1_STATE=state;`
- c6_s2：state 声明闭合 `};`（行70）后 → `window.C6S2_STATE=state;`
- c6_s3：state 声明闭合 `};`（行71）后 → `window.C6S3_STATE=state;`

**?? 仅 3 份新建 guide-data.js**：`content/physics_g8_v1_c6_s{1,2,3}/guide/guide-data.js`
（注：git status 中另有 21 个 c1/c2 html 的 M 与 `docs/mobile-wave-M4-report.md` 等 ?? 条目，为并行移动波 M4 的未提交改动，非 W5 产物，本波零触碰。）

html 五件套（三页同构，宿主 core script 之后；head 加 guide-core.css link；既有 `?v=20261024` 全部 bump `20261027n1`）：
```html
<div id="guide-layer"></div>
<script>window.GUIDE_CFG={state:window.C6SX_STATE};</script>
<script src="guide/guide-data.js?v=20261027n1"></script>
<script src="../_lib/guide/engine-core.js?v=20261027n1"></script>
<script src="../_lib/guide/vB-core.js?v=20261027n1"></script>
```
- c6_s1/c6_s2：guide-data 末尾 `GUIDE_CFG={state:…,mode:'refract'}`（单场景，照设计书 §A-5/B-5）。
- c6_s3：两阶段分 mode key s1/s2，`GUIDE_CFG={state:…,get mode(){return window.C6S3_STATE.stage;}}`（照设计书 §C-5 原文；引擎每帧轮询 mode，stage 切换自动 onModeEnter）。

## 2. 删橙色解说条（蔡总拍板）
三页 `#hint` div + 全部 hint CSS 规则（含 c6_s2/s3 的 `.hint-top/.hint-left-v` 选位类）整段删除。安全性核验：三 core 的 `hintEl` 全部使用点均有空守卫（`if(!hintEl) return` / `hintEl?…:null`，s1 行706~719、s2 行39/50/1248/1472、s3 行308/319/1116/1374），删 DOM 后零报错（三页浏览器实测 console 0 错佐证）。物理内容文案（读数面板 rp-note、密度表、数据表提示等）未动。c6_s2 `#toast`（鉴别判定反馈）属判分反馈非解说条，保留。

## 3. 移动兼容三件
- viewport 防缩放：三页加 `maximum-scale=1, user-scalable=no`
- `-webkit-tap-highlight-color:transparent`（html,body）
- canvas `touch-action:none`：三页原有 ✓（含 c6_s1 `#knead-cv`）
- 100vh→dvh：三页 `html.pseudo-fs body` 的 `height:100vh` 后补 `height:100dvh` 回退。如实记录：三页均为 fixed 布局（header fixed + scene-wrap fixed inset + ctrlbar fixed），主高度链不依赖 100vh，dvh 仅覆盖伪全屏 body。

## 4. delay 开场步回填（设计书 §E-2 授权，非改写）
afinfo 实测 intro 时长 +1s 回填 `delay:13000`（预估）：
- c6s1-intro 实测 7.728s → `delay:8728`
- c6s2-intro 实测 8.424s → `delay:9424`
- c6_s3 无 delay 型步骤；c6s3-s1-intro 7.704s / c6s3-s2-intro 6.408s（仅记录）。

## 5. 验收证据

### 5.1 node --check（6/6 通过）
`exp-mass-core.js`、`exp-density-core.js`、`exp-measure-core.js`、三份 `guide-data.js` 全部 CHECK_OK。

### 5.2 guide-data 冒烟（计数=设计书 §A/B/C，audio 零缺失，mp3 全存在）
```
c6_s1: mode=refract steps=8 errors=2 free=3 clips=14 | audios总数=14 引用clip=14 缺失=0 | GUIDE_CFG.state===window.C6S1_STATE? true mode=refract
c6_s2: mode=refract steps=8 errors=2 free=3 clips=14 | audios总数=14 引用clip=14 缺失=0 | GUIDE_CFG.state===window.C6S2_STATE? true mode=refract
c6_s3: mode=s1 steps=6 errors=1 free=2 clips=10 / mode=s2 steps=5 errors=1 free=1 clips=8 | audios总数=18 引用clip=18 缺失=0
```
46 条 clip（14+14+18）=设计书 §D 总数；映射 mp3 磁盘全存在（46/46）。

### 5.3 浏览器实测（Playwright headless Chromium，localhost:8848，脚本 /tmp/w5-c6s{1,2,3}.js）

**c6_s1 exp-mass.html：20/20 PASS**
启动层→intro 字幕+发声（intro mp3 200/206）✓；s1 delay:8728 开场步 ✓；s3 调平 ✓；f2 重力 free ✓；s4 左物右码 ✓；s5 加减砝码 ✓；s6 微调游码 ✓；s7 读数+mp3 加载 ✓；s8 结论条 after@6000 ✓；repeat s7 边沿重播 ✓；e2 纠错(游码归零)+err 样式 ✓；s2 旋螺母 ✓；e1 纠错(未调平读数，nut=-3.0+20g 砝码真 matched 态) ✓；浮标三态 voice→text→sleep→voice ✓；mp3 请求 18 条全 200/206 ✓；console 0 错 ✓；375×667 无横向溢出（sw=375）✓。

**c6_s2 exp-density.html：22/22 PASS**
启动层→intro ✓；s1 delay:9424 ✓；s2 称质量 ✓；s3 排水法 ✓；s4 入表 ✓；s5 过原点直线 ✓；s6 换种物质 ✓；s7 结论 after@6000 ✓；repeat s2 重播 ✓；场景 e4 f2 漂浮/f1 沉底 free ✓；e5 事件型 e1(未测全)/e2(未选材质) 点 #btn-submit 即时纠错+err 样式 ✓；s8 鉴别揭晓+mp3 ✓；f3 排水 free ✓；浮标三态 ✓；mp3 17 条全 200/206 ✓；console 0 错 ✓；375 无溢出 ✓。

**c6_s3 exp-measure.html：28/28 PASS**
启动层→s1 阶段 intro ✓；GUIDE_CFG.mode getter=stage ✓；s1 链全通：s1(加盐)/s2(记m₁)/s3(倾倒)/s4(读V)/s5(记m₂)/s6(结论 after@6000) ✓；s1-e1 俯视纠错+err ✓；s1-f2 选种/s1-f1 拖眼睛 free ✓；切 s2→s2 intro+mp3 ✓；s2 链全通：s1(测m)/s2(读V₁)/s3(沉底排水)/s4(读V₂)/s5(结论 after@6000) ✓；s2-e1 顺序纠错 ✓；s2-f1 换石头 free ✓；**两阶段干净重切：s2 intro 字幕 ✓、s1 intro 字幕稳定+mp3 重请求(3 条) ✓**；浮标三态 ✓；mp3 25 条全 200/206 ✓；console 0 错 ✓；375 无溢出 ✓。

**记录（引擎既定规范，非缺陷）**：带残留已测态切回阶段时，intro 发出后同帧被仍为真的 repeat steps 按 r5「要做哪步播哪步·无条件打断」顶掉（字幕/音频即刻切到当前状态步骤）；干净态（重置后）切阶段 intro 完整播出。引擎红线禁碰，未改。

### 5.4 原交互回归（/tmp/w5-regress.js：36/36 PASS，三页 console 全 0 错）
- c6_s1：选橡皮泥/游码滑杆(2.5g+标签)/螺母钮(-2.5→-2)/重力预设(月球1.6)/读数面板/标注开关/**画布真实拖拽砝码入右盘(panW=["50"]，balGeom 解析盘心落点)**/**画布拖物入左盘(onPan=true)**/重置全清 ✓
- c6_s2：材质钮(iron)/体积钮(30)/记录表注入/场景切换 e4→e5/e4 custom 预设+V/m 滑杆(8L,10kg)/双块切换/提交鉴别判定/重新出题(块签名变化)/读数面板/重置 ✓
- c6_s3：加盐(ρ=1.08)/放置烧杯记 m₁(166)/倾倒 50mL/平视确认 V/vConf=50/记 m₂(112)/readTable 闭环(m=54,V=50,ρ=1.08)/数据表 DOM 落值(#s1-c1=166.0)/切阶段 s2/setStone/石块记 m(45.1)/读 V₁(60)/沉石读 V₂(78)/换石块归档(rows=1)/读数面板/重置 ✓
  - 观察项：一次高频字幕并发场景下 #btn-table 首击被吞（二击正常；隔离复测单击正常，疑 animating 锁窗时序，与本次接线无关——core 零改动，仅记录）。

### 5.5 既有语音页回归（/tmp/w5-reg4.js）
- c4_s3/exp-mirror：console 0 错 ✓
- c4_s4/exp-refract：console 0 错，intro 字幕正常「欢迎来到光的折射实验台！…」✓

## 6. 文案一致性声明
三份 guide-data.js 的 intro/steps/errors/free 文案、trigger 表达式、audios 映射均自设计书 §A-5/B-5/C-5 逐字照抄；唯一差异=§E-2 授权的 delay 实测回填（13000→8728/9424）。mode key：s1/s2 用 `refract`（单场景照设计书），s3 用 `s1`/`s2` 双 key+GUIDE_CFG getter（照设计书 §C-5）。

（完）

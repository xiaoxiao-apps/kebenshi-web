# 语音批量铺路 W2 报告：c4s1 双实验（medium 直线传播 + shadow 光影成像）接线

> 日期：2026-10-27 ｜ 任务书：W2 ｜ 设计书：docs/c4s1-guide-design.md（唯一数据源，逐字照抄）
> 模板：docs/c4s4-voice-pilot-report.md §6「后续实验接线模板」；引擎热修 #3#4#5 已在 `_lib/guide/` 落地（本轮零触碰）。
> 红线全守：`_lib/guide/`、audio 目录、c4_s2~s5、c4_s3 零改动；未 commit/push。

## 0. 总判定

**PASS。静态验收全过；Playwright 浏览器实测 46/46 PASS（medium 20 项 + shadow 21 项 + 回归 5 项）；两页 console 双通道 0 报错；c4s4/c4s3 四变体回归 0 报错；两实验原有交互零退化。**

## 1. 改动面（git status 证据）

```
M content/physics_g8_v1_c4_s1/exp-medium-core.js   （仅 §A-1.3 暴露块，+14 行纯插入）
M content/physics_g8_v1_c4_s1/exp-medium.html      （五件套+hint删+bump+移动三件）
M content/physics_g8_v1_c4_s1/exp-shadow-core.js   （仅 §B-1.3 暴露块，+10 行纯插入）
M content/physics_g8_v1_c4_s1/exp-shadow.html      （同构）
?? content/physics_g8_v1_c4_s1/guide/              （guide-data-medium.js + guide-data-shadow.js；audio/ 为既有产物）
```

任务书要求「M 仅 4 文件、?? 仅 2 guide-data」✅（`?? guide/` 目录含既有 audio 25 条 + 本轮 2 个 guide-data；仓库另有 `?? .DS_Store`、c3/c4s2/c4s5 的 `?? guide/` 及 `?? docs/voice-wave-W1-report.md`、4 个 c3 core 的 M——均为并行波次/既有产物，非本轮触碰，如实记录）。

## 2. 状态暴露（验收项 1/3）

- **medium**：`window.__c4s1dbg={...};`（原 L435）之后、`})();` 之前插入 `mediaOnStage()` + `window.C4S1M={...}`，逐字照设计书 §A-1.3（含注释）。
- **shadow**：`window.__c4s2dbg={...};` 收尾 `};`（原 L552）之后、`initMedia(); setDefaultLayout(); ...`（原 L553）之前插入 `window.C4S1S={...}`，逐字照 §B-1.3（含注释）。
- `node --check` 两 core ✅；`git diff` 两 core **只有插入块，其余行零变化**（diff 见 §2.1/§2.2）。
- 浏览器实测暴露字段与设计书速查表逐一相符：
  - `C4S1M` 9 个 getter：`laserOn=false, pulseOn=false, paused=false, angleDeg=0, turbidity=0, activeCount=0, smokeOn=false, waterOn=false, glassOn=false`（开机空台账）✅
  - `C4S1S` 6 个 getter：`mode='pinhole', rayOn=true, candleLit=false, scene.missing='candleOff', imgM=null, handM=null`（开机默认账，与设计书 §B-1.2「开机 scene.missing='candleOff'」一致）✅
- shadow 删 `#hint` span 后 core 的 `updateHint()`（L344）有 `if(el&&...)` 空守卫，实测无报错 ✅。

### 2.1 exp-medium-core.js diff（全部）

```diff
@@ -433,4 +433,18 @@
 window.__c4s1dbg={...};（原行未动）
+
+/* 语音讲解层状态暴露（设计书 docs/c4s1-guide-design.md §A-1.3；只读 getter 门面，引擎轮询；对象永不重赋值） */
+function mediaOnStage(id){for(var i=0;i<media.length;i++){var m=media[i];if(m.id===id&&(m.state==='active'||m.state==='falling'))return true;}return false;}
+window.C4S1M={
+  get laserOn(){return pen.on;},
+  get pulseOn(){return pulse.on;},
+  get paused(){return paused;},
+  get angleDeg(){return Math.round(angle*180/Math.PI);},
+  get turbidity(){return turbidity;},
+  get activeCount(){var n=0;for(var i=0;i<media.length;i++){var s=media[i].state;if(s==='active'||s==='falling')n++;}return n;},
+  get smokeOn(){return mediaOnStage('smoke_box');},
+  get waterOn(){return mediaOnStage('water_tank');},
+  get glassOn(){return mediaOnStage('glass_brick');}
+};
 })();
```

### 2.2 exp-shadow-core.js diff（全部）

```diff
@@ -550,5 +550,15 @@
 };（__c4s2dbg 收尾，原行未动）
+
+/* 语音讲解层状态暴露（设计书 docs/c4s1-guide-design.md §B-1.3；只读 getter 门面，引擎轮询；对象永不重赋值） */
+window.C4S1S={
+  get mode(){return mode;},
+  get rayOn(){return rayOn;},
+  get candleLit(){var m=findById('candle');return !!(m&&m.lit&&(m.state==='active'||m.state==='falling'));},
+  get scene(){return computeScene();},
+  get imgM(){var sc=computePinholeScene();return sc&&sc.ok?sc.m:null;},
+  get handM(){var sc=computeHandScene();return sc&&sc.ok?sc.m:null;}
+};
 initMedia(); setDefaultLayout(); resize(); syncFull(); rafId=requestAnimationFrame(loop);
 })();
```

## 3. guide-data ×2（验收项 1）

`guide/guide-data-medium.js`（window.C4S1M_GUIDE）与 `guide/guide-data-shadow.js`（window.C4S1S_GUIDE）从设计书 §5 逐字照抄，各自末尾双赋值 `window.GUIDE_DATA=...`；mode key 均 `refract`。node 冒烟输出：

```
M===C4S1M_GUIDE: true   steps/errors/free/tasks: 6/2/3/0   audios keys: 12   audio字段缺失: 0
S===C4S1S_GUIDE: true   steps/errors/free/tasks: 7/2/3/0   audios keys: 13   audio字段缺失: 0
audio文件数: 25  缺失或<2000B: 无   （设计书 §0：12+13 clip ✅）
```

## 4. html 五件套 ×2（验收项 3）

两页同构（medium 贴 diff，shadow 仅 C4S1S/guide-data-shadow.js/exp-shadow-core.js 之差）：

- head 既有 `<style>` 后加 `<link rel="stylesheet" href="../_lib/guide/guide-core.css?v=20261027n1">`
- body 末尾 ctrlbar 后：`<div id="guide-layer">` → 宿主三件（props/sfx/core，`?v=20261024`→`20261027n1`）→ `window.GUIDE_CFG={state:window.C4S1M,mode:'refract'}` 内联（core 之后）→ `guide/guide-data-medium.js` → `engine-core.js` → `vB-core.js`，全带 `?v=20261027n1`
- **删橙色解说条**：medium 删 `<span class="hint">从左上卡槽拖器材…</span>` + `.hint{}` 规则；shadow 删 `<span id="hint" class="hint">点击蜡烛点燃…</span>` + `.hint{}` 规则。物理内容文案零删除（两页 hint 均为纯操作指引，由 intro 语音+字幕承担；shadow core 内 `updateHint/hintFor/画布内 tooltip` 属 core 逻辑红线外零触碰，`#hint` 元素缺失时空守卫静默）。
- **移动兼容三件**：viewport 补 `maximum-scale=1,user-scalable=no`；`html,body` 补 `-webkit-tap-highlight-color:transparent`；`canvas#scene` 补 `touch-action:none`；`.scene-wrap` 为 `position:fixed;top:34px;bottom:0` 布局，**无需 dvh 改动**（按任务书如实记录，同 c4s4 判例）。

## 5. 浏览器实测（验收项 4，Playwright chromium，http://localhost:8848，46/46 PASS）

音频断言=HTMLMediaElement.play/src 插桩计数（`__tl`）+字幕逐字比对（`.gvb-caption` show 态）；状态驱动=`__c4s1dbg.place/penOn`、`__c4s2dbg.lightOn` + 真实 PointerEvent 合成拖拽 + 真实 click/check/dispatch。

### 5.1 exp-medium.html（20/20）

| 项 | 结果 | 证据 |
|---|---|---|
| 5a 启动层→点击→intro 发声 | ✅ | `.gvb-start` 1280×800 flex；点击后字幕逐字=「欢迎来直线传播实验室！…」+ c4s1m-intro.mp3 play 计数≥1 |
| 5b m-s1 摆烟雾箱 | ✅ | 「烟雾箱摆好啦，接下来打开激光笔。」+ mp3 |
| 5b m-s2 开激光 | ✅ | 「看，烟雾里的光路，是一条笔直的线。」+ mp3 |
| 5b m-s3 换水箱 | ✅ | 「换到水里：光在水下也走直线。」+ mp3 |
| 5b m-s4 换玻璃砖 | ✅ | 「玻璃砖里，光路照样笔直。」+ mp3 |
| 5b m-s5 播放光点（真实 click #btn-play） | ✅ | 「放出光点，看它沿着直线一路跑过去。」+ mp3 |
| 5d m-concl（after:m-s5@6000） | ✅ | 「因此我们得出结论：光在同种均匀介质中沿直线传播。」+ mp3 |
| 5c m-e1（空台开灯 @2000 hold） | ✅ | 橙色(err)+shake 字幕=「不对哟～空气里的光路看不见，先摆上烟雾箱。」 |
| 5c m-e2（event:click:#btn-play 空台） | ✅ | 橙色字幕=「别急哟～桌上没器材，光点没处显形，先摆烟雾箱。」mp3 计数=2 |
| 5b m-f1（event:input:#rng-turbid + waterOn 闸门） | ✅ | 「水里加点牛奶，光路会更清楚哦。」+ mp3 |
| 5b m-f2（真实 rotate 拖拽至 -30°≥25 闸门） | ✅ | angleDeg=-30 + 「笔身歪一歪，光线还是一条直线。」+ mp3 |
| 5b m-f3（暂停+开灯闸门） | ✅ | 「暂停啦，慢慢看这条光的路线。」+ mp3 |
| 5e 浮标三态 | ✅ | mode-voice→mode-text（字幕有、playΔ=0 不发声）→mode-sleep（全静）→mode-voice |
| 5f repeat（m-s2 关灯 3.5s 重开） | ✅ | mp3 计数 4→6（重播生效） |
| 5g console | ✅ | error+pageerror 双通道 0 |
| 5g 移动 375×667 touch | ✅ | scrollWidth=375≤innerWidth=375；tap 启动层生效；console 0 |
| 回归 原有交互 | ✅ | 真实拖拽烟雾箱 640→720 state=active；cb-ray/静音🔇/全屏（pseudo-fs 路径 className 空=标准全屏成功）；C4S1M={smoke:true,laser:true,act:3} |
| 暴露对象字段 | ✅ | 9 getter 全数与设计书 §A-1.3 速查表相符 |

### 5.2 exp-shadow.html（21/21）

| 项 | 结果 | 证据 |
|---|---|---|
| 5a 启动层+intro | ✅ | 「欢迎来到光影成像实验室！…」+ c4s1s-intro.mp3 |
| 5b s-s1 点燃蜡烛 | ✅ | 「点着啦！光屏上的火焰像，居然是倒立的！」imgM=1.0696（设计书预估 ≈1.07 精确吻合） |
| 5b s-s2 真实拖近蜡烛 | ✅ | imgM 1.07→≥1.4（拖至 board-220）+「蜡烛靠近小孔，屏上的像变大了。」 |
| 5d s-concl（after:s-s2@6000，纯小孔路径可达） | ✅ | 「因此我们得出结论：光沿直线传播，穿过小孔成的是倒立的实像。」+ mp3 |
| 5b s-s3 真实拖远蜡烛 | ✅ | imgM≤0.7 +「蜡烛移远，像又缩小了，还是倒立的。」 |
| 5c s-e1（蜡烛拖过孔板 candlePos@1500） | ✅ | 橙色=「不对哟～带孔板要放在蜡烛和光屏中间。」missing=candlePos |
| 5b s-f1（event:input:#hole-slider + imgM 闸门） | ✅ | 「孔小像清晰，孔大像更亮，看出区别了吗？」 |
| 5b s-f2（关光线符号 + imgM 闸门） | ✅ | 「光线符号关了，两条光线在小孔处交叉，还记得吗？」 |
| 5f repeat（灭烛 3.5s 重点） | ✅ | s-s1 mp3 计数 4→6 |
| 5b s-s4 真实 check 切手影 | ✅ | 「手影模式！台灯和小手替换了蜡烛。」（600ms 飞行窗无双边沿，符合 §B4.1） |
| 5b s-s5 点灯出手影 | ✅ | 「台灯点亮，光幕上出现黑黑的手影。」handM=2.12 |
| 5b s-s6 真实拖手近灯 | ✅ | handM=2.87≥2.6 +「手越靠近台灯，影子变得越大！」 |
| 5b s-f3 真实拖手远灯 | ✅ | handM=1.68≤1.7 +「手离灯越远，影子就越小。」 |
| 5c s-e2（手拖出灯屏间 handNoImg@1500） | ✅ | 橙色=「不对哟～把手移到灯和屏之间，影子才会出现。」missing=handNoImg |
| 5e 浮标三态 | ✅ | text 态字幕有 playΔ=0；sleep 态静默；回 voice |
| 5g console / 移动 375×667 | ✅ | 双 0 报错；scrollWidth=375 零溢出 |
| 回归 原有交互 | ✅ | radio 切回 pinhole（mode='pinhole'）；重置（candleLit=false、missing='candleOff'）；孔径滑杆 30px+加钮 32px；静音🔇；全屏；`__c4s2dbg` 行为不变 |
| 暴露对象字段 | ✅ | 6 getter 全数与 §B-1.3 相符 |

### 5.3 回归（验收项 5，5/5）

c4s4 exp-refract、c4s3 exp-mirror-vA/vB/vC/vD 各加载+点启动层+驻留，console error+pageerror 双通道全 0 ✅（共享 `_lib/guide/` 未被破坏——本轮对其零触碰）。

## 6. 测试方法学备忘（沿用试点 §5 + 本轮新增）

1. **合成拖拽必须把 pointermove/pointerup 派发到 canvas**（core 的 pointermove 监听在 cv 上、pointerup 在 window 上；派发 target=window 时 move 全丢——本轮首跑拖拽全假阴性即此因，改用 cv.dispatchEvent 后全真）。
2. **命中盒重叠**：shadow 蜡烛拖到 board-90 后再拖远，pointerdown 会命中后绘制的孔板（hitActiveMedia 倒序扫描）——验收拖拽落点须避开器材重叠区（改用 board-220，m≈1.75 仍满足 ≥1.4 阈值）。
3. 字幕断言须等文本驻留 ≥450ms 再读（error 字幕上屏瞬间 textContent 可能尚未填充，MutationObserver 铁证：class 先于 text）。
4. 无头 chromium 需去掉 `--autoplay-policy=no-user-gesture-required` 才能复现「autoplay 被拦→启动层」真实路径（带了 flag 启动层不弹，5a 假阴性）。

## 7. 遗留/建议（不阻塞）

- 设计书 §B1 可选扩展 `s-concl2`（手影双结论）按设计书注明「验收后蔡总点头再加」，本轮未加。
- 设计书 §B4.4：孔径 ± 按钮不播报（s-f1 只绑滑杆），照设计书接受。
- shadow 页画布内 tooltip hint（core `drawTooltipHint`/`hintFor`）属 core 绘制逻辑非 DOM 解说条，红线内零触碰，保留。

=== DONE ===
报告路径：docs/voice-wave-W2-report.md

# c4s3 vB 语音版修复轮 r6 报告（delay 型步骤无限重播回归）

日期：2026-10-26　范围：`content/physics_g8_v1_c4_s3/`　结论：**修复完成，全部验收项通过，未 push**

## 1. 根因（照任务书 §0，已复核代码位置）

r4 给全部 steps 加 `repeat:true` 后，`delay:N` 型步骤进入无限重播：
`engine.js` tickSteps 的 delayMs 分支每帧调 `sched()`；`sched` 定时器一响就把 `stepSched[step.id]=null`，
下一帧又挂一个新的 N 毫秒定时器 → 每 2 秒重播一次；repeat 的 3s 冷却只在表达式型分支生效，
`sched` 回调里 repeat 分支直接 fire，管不到 delay 型。

- 症状 1：m2-s1「烛焰上这个亮点叫 S」每 2s 重播，音频全长 4.656s 被截断 → 只听到前半句
- 症状 2：m3-s1「潜艇藏在水下」同样每 2s 重播（音频 4.728s）
- 附带：`delay:2000` 早于 intro 音频（m2-intro 11.064s / m3-intro 12.720s），r5「新解说立即打断」把开场白 2 秒拦腰砍断

## 2. 改动（3 文件，符合红线）

### 2.1 `guide/engine.js` — delay 型 repeat 步骤「每次进模式只发一次」（4 处）

```diff
@@ -13,7 +13,7 @@
-var repPrev={},repLast={},fireCount={},seenCount={};
+var repPrev={},repLast={},fireCount={},seenCount={},delayFired={};
@@ -164,7 +164,11 @@ function tickSteps(mode){
     if(p.delayMs){
-      if(st.repeat)repPrev[st.id]=false;/* delay 型无电平，复位供 onModeEnter 重挂 */
+      if(st.repeat){
+        /* r6：delay 型 repeat 步骤每次进模式只发一次，发过（或已挂待）就不再重挂，杜绝 N 秒无限重播 */
+        if(delayFired[st.id])continue;
+        delayFired[st.id]=true;
+      }
       sched(st,mode,p.delayMs);continue;
     }
@@ -273,7 +277,7 @@ function clearRepeatState(){
-      delete fireCount[id];delete seenCount[id];delete repPrev[id];delete repLast[id];
+      delete fireCount[id];delete seenCount[id];delete repPrev[id];delete repLast[id];delete delayFired[id];
@@ -412,7 +416,7 @@ window.GuideEngine={
-    repPrev={};repLast={};fireCount={};seenCount={};/* r4：repeat 状态 */
+    repPrev={};repLast={};fireCount={};seenCount={};delayFired={};/* r4：repeat 状态；r6：delayFired */
```

`grep -n delayFired engine.js` → 5 处（16 / 169 / 170 / 280 / 419），≥4 达标。
向后兼容：`delayFired` 仅在 `st.repeat` 为真时读写 → 非 repeat 的 delay 步骤仍走原 `firedSteps` 路径；
非 delay 路径（表达式型 / after 型 / hold 型）一字未动。`delayFired` 由 `onModeEnter → clearRepeatState()` 清空，
故重进同一模式会重播一次开场步（预期行为）。

### 2.2 `guide/script.js` — 两条 delay 数值改为「等开场白讲完」（diff 恰 2 行）

```diff
-      {id:'m2-s1',repeat:true,trigger:"delay:2000",say:'烛焰上这个亮点叫 S，光从它射向四面八方。',audio:'c4s3-m2-s1'},
+      {id:'m2-s1',repeat:true,trigger:"delay:12000",say:'烛焰上这个亮点叫 S，光从它射向四面八方。',audio:'c4s3-m2-s1'},
-      {id:'m3-s1',repeat:true,trigger:"delay:2000",say:'潜艇藏在水下，靠潜望镜把光接力送进艇里。',audio:'c4s3-m3-s1'},
+      {id:'m3-s1',repeat:true,trigger:"delay:13500",say:'潜艇藏在水下，靠潜望镜把光接力送进艇里。',audio:'c4s3-m3-s1'},
```

say 文案 / audio id / id / repeat:true 全部原样；steps/errors/free/tasks/cSequence/audios/intro 零其他改动。
数据对账（node 直读 script.js）：`steps=23 errors=11 free=13`，与 r5 一致。

### 2.3 `exp-mirror-vB.html` — 仅缓存串 `?v=20261026g6` → `g7`（4 处：guide.css / script.js / engine.js / vB.js）

禁动文件全部未触碰：vB.js、guide.css、vA.js、vC.js、vD.js、hub.html、guide/audio/、生产页 exp-mirror.html。

## 3. 验收证据

### 3.1 静态
- `node --check engine.js && node --check script.js` → `SYNTAX_OK`
- `git status --short`：
  ```
   M content/physics_g8_v1_c4_s3/exp-mirror-vB.html
   M content/physics_g8_v1_c4_s3/guide/engine.js
   M content/physics_g8_v1_c4_s3/guide/script.js
  ?? .DS_Store
  ?? docs/c4s3-vb-r6-report.md   （本报告）
  ```
- script.js diff = 恰 2 行；engine.js diff = 仅 §2.1 四处；html diff = 4 行 g6→g7

### 3.2 浏览器实测（http://localhost:8848/content/physics_g8_v1_c4_s3/exp-mirror-vB.html）
驱动方式：playwright-core 1.62.1 + 缓存 Chromium（`--autoplay-policy=no-user-gesture-required --mute-audio`），
脚本置于 `/tmp/c4s3r6/`（不入库）。页内 150ms 采样 `.guide-caption.show > .guide-caption-text`，
并用 `HTMLMediaElement.prototype.play` 打点统计每条音频的真实播放次数（同文案重播也能抓到）。
启动层 `.gvb-start`：autoplay 被放行 → 本次未出现（`startLayer: absent(autoplay allowed)`），符合 r3 设计。

**a. M2 不循环重播（30s 采样）** — 字幕变化全记录仅 2 条：
```
150ms:   镜子里的像，光真的到过那儿吗？我们追一条光线：从烛焰…   （intro）
12150ms: 烛焰上这个亮点叫 S，光从它射向四面八方。                  （m2-s1）
```
`runs=1`（只出现一次），`firstDwell=5101ms ≥4s`（驻留到音频播完，未被自己重启打断）。
音频计数（22s 窗口）：`c4s3-m2-s1.mp3` 播放 **1 次** @12046ms。

**b. M2 开场白讲完不被砍** — intro 字幕 `firstTs=150ms`，`firstDwell=11551ms ≥8s`；
m2-s1 首次出现 `12150ms ≥11000ms`（m2-intro 音频 11.064s 讲完后才接上）。`c4s3-m2-intro.mp3` 播放 1 次 @45ms，未被打断。

**c. M3 不循环重播（30s 采样）** — 变化全记录仅 2 条：
```
61ms:    潜艇潜在水下，怎么看到水面上的船？答案藏在两块小镜子…    （intro）
13560ms: 潜艇藏在水下，靠潜望镜把光接力送进艇里。                  （m3-s1）
```
`runs=1`，`firstDwell=5251ms ≥4s`，`firstTs=13560ms ≥12000ms`；`c4s3-m3-s1.mp3` 播放 **1 次** @13532ms，intro 驻留 13199ms。

**d. 重进模式会重播一次** — M3 → M1（1.2s）→ M2，20s 窗口：m2-s1 字幕再现，`c4s3-m2-s1.mp3` 播放计数 **恰 1 次** @12044ms（重播生效且不循环）。

**e. r5 即时打断未回归** — M2 中 m2-s1 正播时置 `window.MRR.m2.showRay=true` → **102ms** 内字幕换成「光射到镜面反射出去，反射光进入眼睛」（≤1.5s 达标）。

**f. M1 repeat 未回归** — M1 中 `R.objLit=true` → 103ms 出「点燃啦！」；`R.matched=true` → 104ms 出「重合了！」；
等字幕自然消失（含 m1-concl 插播，实测消失后字幕为空）→ `matched=false` 800ms → `matched=true` → 105ms 再出「重合了！」。
音频打点：`c4s3-m1-s5.mp3` 播放 2 次（t=1055ms / t=7362ms）→ 重复播报仍生效。

**g. vB 页 console 0 报错** — 两轮实测（test.mjs / test2.mjs）`consoleErrors=0`，无 pageerror。

### 3.3 回归（vA / vC / vD，各页 HTTP 200、console 0 报错）
| 页 | 角标 | 专属 UI 实测 |
|---|---|---|
| vA | `A · 任务链` | 老师卡在位：`.guide-card-avatar 🧑‍🏫` / `.guide-card-main` / `.guide-bubble-text`「欢迎来成像探究台！…」/ `.guide-bubble-progress` / `.guide-options` |
| vC | `C · 分步引导` | 顶栏引导按钮在位：`← 上一步 [g-nav]`、`下一步 → [g-nav]`、`退出引导 [g-nav g-exit]`，进度 `第 1/8 步`，字幕 intro 显示中 |
| vD | `D · 字幕解说` | 字幕触发正常：置 `R.objLit=true` → `.guide-caption.show` 文本「点燃啦！火苗亮了，玻璃板里的像才看得清哦。」（`captionTriggerOK=true`） |

## 4. 遗留 / 说明
- script.js 顶部注释与 engine.js 头注释里仍写着 `delay:2000` 作为「语法示例」，非本次两条数据的描述；按红线「script diff 恰 2 行」未动注释。
- delay 数值取自 intro 音频实测时长 +约 1s 余量（12000 / 13500），若后续重录 intro 需同步这两个数。
- 未执行 git commit / push。

=== DONE ===
报告路径：docs/c4s3-vb-r6-report.md

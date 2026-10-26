# c4s3 vB 语音版修复轮 r5 验收报告（蔡总三条反馈：即时打断 / 点燃闸门 / 慢慢挪-差一点分工）

日期：2026-10-26 ｜ 版本：?v=20261026g5 → g6 ｜ 不 push、不 commit

## 0. 改动范围（红线遵守）

`git status --short`：

```
 M content/physics_g8_v1_c4_s3/exp-mirror-vB.html
 M content/physics_g8_v1_c4_s3/guide/engine.js
 M content/physics_g8_v1_c4_s3/guide/script.js
 M content/physics_g8_v1_c4_s3/guide/vB.js
?? .DS_Store   （会话前已存在，非本轮产物）
```

仅任务书允许的 4 文件。guide.css 零改动；vA/vC/vD/hub/audio/生产文件零触碰。

`git diff --stat`：4 files changed, 35 insertions(+), 45 deletions(-)

## 1. 反馈① vB.js · 即时打断（要做哪步播哪步）

- 删除 r2 解说队列全部逻辑：`QUEUE_MAX` 常量、`q` 数组、`enqueue()`、`hide()` 内队列消化、`render()` settle 回调内 `q.shift()`、`applyMode(sleep)` 内 `q.length=0`
- `say()` 统一为：新解说到达 → 无条件 `clearHide()+stopAudio()` → `showEntry()` 立即上屏（error 与 step/intro/free 同路径，原 error 特权分支删除因已无区别）
- 保持现状：audio ended → +400ms 隐藏、🔁 重播、启动层、三态循环、collapsed/sleep、MAX_DUR 兜底
- 残留对账：`grep 'enqueue|QUEUE_MAX|q.shift|q.length' vB.js` → **0 命中**（exit=1）

## 2. 反馈③支撑 engine.js · eq 移动手势计数

diff 仅两处（G 字段 + updateG eq 块，另含同级局部变量声明与 resetG 重置）：

```diff
 var lastDoCm=null,lastChangeSeenT=0,objChangeArmed=true;
+/* r5：等效蜡烛移动手势计数状态（镜像 objChangeCount，仅 placed 态跟踪） */
+var lastEqDo=null,eqChangeSeenT=0,eqChangeArmed=true,prevEqPlaced=false;

-     t:now(),lastObjChangeT:0,
+     t:now(),lastObjChangeT:0,eqMoveGestureCount:0,lastEqChangeT:0,
   lastDoCm=null;lastChangeSeenT=0;objChangeArmed=true;
+  lastEqDo=null;eqChangeSeenT=0;eqChangeArmed=true;prevEqPlaced=false;

+  /* r5 eqMoveGestureCount：等效蜡烛移动「手势」计数——镜像 objChangeCount，
+     仅 placed 态跟踪；刚放下种子赋值不计数，一次连续挪动只计 1 次，静默 350ms 重新武装 */
+  if(R.eqState==='placed'){
+    if(!prevEqPlaced){lastEqDo=R.eqDo;eqChangeArmed=true;}
+    else if(R.eqDo!==lastEqDo){
+      lastEqDo=R.eqDo;eqChangeSeenT=t;G.lastEqChangeT=t;
+      if(eqChangeArmed){G.eqMoveGestureCount++;eqChangeArmed=false;}
+    }
+    if(!eqChangeArmed&&t-eqChangeSeenT>350)eqChangeArmed=true;
+  }else{
+    lastEqDo=null;
+  }
+  prevEqPlaced=(R.eqState==='placed');
```

repeat/repPrev/3s 冷却/fireCount/sched/事件绑定零改动；向后兼容（新字段纯增量，init 走 resetG 自动重置）。

## 3. 反馈②③ script.js · 逐条对账（node 加载实测输出）

```
steps=23 errors=11 free=13
m1-s4b: {"id":"m1-s4b","repeat":true,"trigger":"R.eqState==='placed' && !R.matched && G.eqMoveGestureCount>=1 && (G.t-G.lastEqChangeT)<1600 && Math.abs(R.eqDo-R.doCm)>3","say":"差一点啦～像在板后跟物对称的位置，距离相等哦。","audio":"c4s3-m1-e4"}
m1-e4 gone: true
after6000: m1-concl=after:m1-s5@6000 | m2-concl=after:m2-s5@6000 | m3-s5=after:m3-s4@6000 | m3-concl=after:m3-s5@6000
free slider: event:input:#obj-slider:R.objLit
free diff-one gone: true
```

1. free M1 滑杆条加 `:R.objLit` 闸门 ✓（反馈②）
2. free「差了一点」整条删除 ✓
3. m1-s4 加 `(G.t-G.lastEqChangeT)>800` 静止窗 ✓（反馈③：静止→慢慢挪）
4. errors m1-e4 删除；m1-s4 后插入 m1-s4b（挪动手势→差一点，复用音频 c4s3-m1-e4）✓
5. 四条 after 延时 @1500→@6000（打断制下不再拦腰砍上条 5s 音频）✓
6. 其余 steps/errors/free/tasks/cSequence/audios/intro 一字未动（diff 仅上述行）✓

## 4. html

仅 guide 4 处引用 `?v=20261026g5 → g6`（guide.css / script.js / engine.js / vB.js），其余零改动。

## 5. 语法与浏览器实测

`node --check` vB.js / engine.js / script.js → **全过**。

浏览器：headless chromium（`--autoplay-policy=no-user-gesture-required` 放行音频，真实走播放/打断路径），`http://localhost:8848/content/physics_g8_v1_c4_s3/exp-mirror-vB.html`：

```json
{
  "b_noLitNoCaption": true,          // 未点燃 dispatch 滑杆 input，2s 内「物距在变」0 次出现
  "a_s1_caption": "点燃啦！火苗亮了，玻璃板里的像才看得清哦。",
  "a_interrupt_ok": true,            // s1 播中 1s 后置 matched=true
  "a_interrupt_delay_ms": 58,        // 58ms 字幕即换「重合了！」（≤1500ms，未等 s1 播完）
  "c_idle_says_manman": true,        // 放下静止 1.5s 内出「慢慢挪」
  "d_diffonce_count": 1,             // 连续挪动 10 次（100ms/次）期间「差一点啦～」恰好出现 1 次
  "d_manman_back": true,             // 停止挪动后「慢慢挪」回来
  "e_vb_console_errors": []          // vB 页 console 0 报错
}
```

## 6. 回归（vA / vC / vD）

```json
"vA": {"console_errors": [], "ui_present": true (.guide-card),  "badge_present": true}
"vC": {"console_errors": [], "ui_present": true (.guide-topbar), "badge_present": true}
"vD": {"console_errors": [], "ui_present": true (.guide-caption),"badge_present": true}
```

engine/script 共享改动为纯增量+数据条目调整，三页 0 报错、专属 UI 在位，行为不劣化。

## 7. 结论

蔡总三条反馈全部按规格落地并实测通过：①新解说即时打断上屏（58ms 实锤）②未点燃拖滑杆不再播报 ③静止说「慢慢挪」/每次挪动手势只说一次「差一点啦～」。未 commit、未 push，候蔡总体验。

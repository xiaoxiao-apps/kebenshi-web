# c4s3 vB 语音版修复轮 r2 验收报告（蔡总四条体验反馈）

日期：2026-10-26 · 版本标记：?v=20261026g3 · 纪律：不 commit / 不 push

## 0. 改动文件（红线内 5 个 + 本报告）
| 文件 | 改动 |
|---|---|
| guide/vB.js | 全量重写 268 行：三态浮标 / 解说队列 / 手势解锁补播 / 删喇叭钮 |
| guide/engine.js | 仅 §2.3 两处向后兼容小改（G.t / G.lastObjChangeT） |
| guide/script.js | 仅 m1-s1 say + m1-s2 trigger 两行 |
| guide/guide.css | 删 .guide-mute-btn 段（grep 确认全库仅 vB 引用）；.gvb-fab-zzz/.is-collapsed 改为 .gvb-fab-badge/.mode-sleep |
| exp-mirror-vB.html | 仅 4 处 ?v=20261026g2→g3 |
| docs/c4s3-vb-r2-report.md | 本报告（新文件） |

禁动文件零触碰：vA.js/vC.js/vD.js/hub.html/其余三变体页/生产文件均无 M。

## 1. 四条反馈修复对照
- **① 重开链接无欢迎语音**：playClip 失败路径 settle(true)→armUnlock()，挂一次性 `pointerdown`+`keydown`（once+capture）监听；手势时若 cur 仍在驻留窗口→重播当前条，否则页面加载 <8s→补播 intro；播放成功（playing 事件）或切 text/sleep 即 disarm。
- **② 语音没播完字幕就没了**：新解说到达时若 voice 态且有音频在播（curAudio!=null）→入队 q；当前条 ended/error/超时兜底后取队首上屏；队列上限 3，超出丢最旧、free 类最优先丢；**error 例外立即打断**（stopAudio+上屏，被打断条目不补播）。
- **③ 说话时机错位**：m1-s1 文案改为「点燃啦！火苗亮了，玻璃板里的像才看得清哦。」（音频已重生成，mp3 的 M 为本轮前置既有改动）；m1-s2 trigger 追加 `(G.t-G.lastObjChangeT)<1600`，只在物距刚变化 1.6s 内触发，点燃蜡烛不再抢话「蜡烛移远」。engine.js 配套仅加 G.t（每帧）与 G.lastObjChangeT（R.doCm 变化分支，canvas 拖蜡烛走同一分支）。
- **④ 喇叭钮砍掉，浮标三态**：#guide-mute 按钮及逻辑全删；localStorage 单键 `gvb-mode`（voice/text/sleep，默认 voice，旧键 gvb-collapsed/gvb-muted 不再读写自然忽略）；fab 角标 .gvb-fab-badge 循环 🔊→🔇→💤，title 分别「语音+字幕」「只字幕」「老师休眠中，点击唤醒」，sleep 态 opacity .45；text/sleep 切回 voice 时当前条仍在窗口内则重播。

## 2. 验收证据
### 2.1 node --check
vB.js / engine.js / script.js → `NODE_CHECK_OK`（三文件全过）

### 2.2 git status --short
```
 M content/physics_g8_v1_c4_s3/exp-mirror-vB.html
 M content/physics_g8_v1_c4_s3/guide/audio/c4s3-m1-s1.mp3   ← 本轮前置既有改动（m1-s1 音频重生成）
 M content/physics_g8_v1_c4_s3/guide/engine.js
 M content/physics_g8_v1_c4_s3/guide/guide.css
 M content/physics_g8_v1_c4_s3/guide/script.js
 M content/physics_g8_v1_c4_s3/guide/vB.js
 M docs/c4s3-guide-variants-design.md                        ← 本轮前已存在的 M（会话起始快照即有）
?? .DS_Store                                                 ← 系统文件，非本轮产物
```
本轮新增 M 严格限于红线 5 文件 + 本报告（新文件）。

### 2.3 script.js diff（仅两行）
```
-      {id:'m1-s1',...say:'点燃啦！看玻璃板里，出现了一支蜡烛的像。',...},
-      {id:'m1-s2',trigger:"R.objLit && !R.eqOn && G.objChangeCount>=1 && Math.abs(R.doCm-G.do0)>=2",...},
+      {id:'m1-s1',...say:'点燃啦！火苗亮了，玻璃板里的像才看得清哦。',...},
+      {id:'m1-s2',trigger:"R.objLit && !R.eqOn && G.objChangeCount>=1 && Math.abs(R.doCm-G.do0)>=2 && (G.t-G.lastObjChangeT)<1600",...},
```
其余 17 steps / 12 errors / 11 tasks / 14 free 零改动（diff 无其他 hunk）。

### 2.4 engine.js diff（仅 §2.3 两处）
```
@@ resetG
   G={recCount:0,do0:...,objChangeCount:0,
+     t:now(),lastObjChangeT:0,
      eqEverOn:false,...};
@@ updateG
   var t=now();
+  G.t=t;
   G.recCount=countRec();
@@ updateG 物距变化分支
-      lastDoCm=R.doCm;lastChangeSeenT=t;
+      lastDoCm=R.doCm;lastChangeSeenT=t;G.lastObjChangeT=t;
```
只增 G 字段，不改任何既有逻辑路径，vA/vC/vD 向后兼容（回归见 2.7）。

### 2.5 exp-mirror-vB.html diff（仅 ?v= 参数）
guide.css / script.js / engine.js / vB.js 四处 `?v=20261026g2`→`?v=20261026g3`，无其他改动。

### 2.6 vB.js grep 对账
| 项 | 结果 |
|---|---|
| `guide-mute` 引用 | 0 |
| `gvb-mode`（含 LS_MODE 单键读写） | 2+3 处 |
| 队列（enqueue/QUEUE_MAX） | 4 处 |
| 解锁（armUnlock/disarmUnlock/unlockHandler，pointerdown+keydown once+capture） | 13 处 |
| 旧键 gvb-collapsed/gvb-muted | 仅头部注释 1 处说明「弃用忽略」，无代码引用 |
| guide.css `guide-mute-btn` | 0（已删段）；`gvb-fab-badge/mode-sleep` 3 处 |

### 2.7 回归（playwright 无头 Chromium，http://localhost:8848）
| 页面 | console error / pageerror | UI 检查 |
|---|---|---|
| exp-mirror-vA.html | 0 | .guide-badge ✓ .guide-card ✓ |
| exp-mirror-vC.html | 0 | .guide-badge ✓ .guide-topbar ✓ |
| exp-mirror-vD.html | 0 | .guide-badge ✓ |
| exp-mirror-vB.html | 0 | .gvb-fab ✓ #guide-mute=0 ✓ |

### 2.8 vB 功能链路实测（playwright evaluate 派发事件）
**三态循环**（连点 fab 三次，DOM 实测）：
```
init:  cls=gvb-fab mode-voice badge=🔊 title=语音+字幕
点1:  cls=... mode-text  badge=🔇 title=只字幕          ls gvb-mode=text
点2:  cls=... mode-sleep badge=💤 title=老师休眠中，点击唤醒 ls gvb-mode=sleep
点3:  cls=... mode-voice badge=🔊 title=语音+字幕          ls gvb-mode=voice
```
**触发链路**（音频 stub 加速 ended，模拟真实播放完成）：
- 进页→canvas pointerdown/up 于 (R.objX, R.candleY−R.candleH·0.5) 点燃→字幕=「点燃啦！火苗亮了，玻璃板里的像才看得清哦。」 ✓（objLit=true）
- 紧接着 obj-slider value 8→11 + dispatchEvent input→字幕=「蜡烛移远，像也跟着移远，大小可没变哦。」 ✓（doCm=11）
- **负例**：重开页面只点燃不拖 slider→5s 轮询仅见「点燃啦！…」，从未出现「蜡烛移远」（G.objChangeCount=0）✓
**反馈② 队列/打断**：
- 真实音频环境（首轮实测）：intro 配音完整播完前，点燃触发的 m1-s1 入队等待，intro ended 后才上屏——「等播完」行为直接得证 ✓
- error 打断：intro 4s 配音播至 1.2s 时派发 #btn-rec click（未点燃）→300ms 内字幕立即切「不对哟～先点蜡烛点燃，才有像可以记录呀。」且 .err 橙底 ✓
**反馈① 解锁补播**：stub 首次 play() 以 NotAllowedError 拒绝→intro 字幕以纯文字驻留；真实鼠标点击（trusted gesture）→.gvb-speaking.on=true（play 计数 1→2），重播条播完后字幕正常退场 ✓

## 3. 结论
蔡总四条反馈全部修复并经浏览器实测验证；共享 engine.js 仅加字段向后兼容，vA/vC/vD 回归零报错零行为变化；红线外文件零触碰；不 commit / 不 push，候蔡总体验拍板。

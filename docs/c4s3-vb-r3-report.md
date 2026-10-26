# c4s3 vB 语音版 · 修复轮 r3 交付报告（蔡总三条反馈）

日期：2026-10-26 ｜ 版本标记：`?v=20261026g4` ｜ 状态：**已交付，未 commit / 未 push**

## 0. 一句话结论
蔡总三条反馈全部修复并经 headless Chromium 实测验证：① autoplay 被拦时弹显式全屏启动层，点一下即解锁补播（放行则永不出现）；② 浮标 voice 态纯净无叠加、text/sleep 态把 🔇/💤 叠在头像圆面右下；③ 三个模式的流程收官后自动播报结论（真实音频起播、排在上一条解说之后）。engine.js 本轮零改动，红线外文件零触碰，vA/vC/vD 回归 0 报错。

## 1. 改动清单（严格 4 文件）
| 文件 | 改动 |
|---|---|
| `guide/vB.js` | 启动层（showStartLayer/removeStartLayer + playClip 的 NotAllowedError 分支）；浮标叠加图标改为按需创建/摘除（setBadge）；applyMode 三态视觉与离 voice 态收启动层；头部注释更新为 r3 |
| `guide/script.js` | 仅追加 3 条结论 step（m1/m2/m3-concl）+ 3 条 audios 映射，其余一字未动 |
| `guide/guide.css` | 仅 `.gvb-*`：改写 `.gvb-fab-badge` 为圆面叠加白底小托、追加 `.gvb-start*` 启动层、移动端补 3 行 |
| `exp-mirror-vB.html` | 仅 4 处 `?v=20261026g3` → `g4` |

`git diff --stat`：exp-mirror-vB.html 8±、guide.css 38+、script.js 14±、vB.js 79±；**engine.js 不在 diff 中**。

## 2. 验收逐条证据

### 2.1 `node --check`（标准 1）
```
$ node --check guide/vB.js && node --check guide/script.js
SYNTAX_OK
```

### 2.2 `git status --short`（标准 2）
```
 M content/physics_g8_v1_c4_s3/exp-mirror-vB.html
 M content/physics_g8_v1_c4_s3/guide/guide.css
 M content/physics_g8_v1_c4_s3/guide/script.js
 M content/physics_g8_v1_c4_s3/guide/vB.js
?? .DS_Store
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m1-concl.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m2-concl.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m3-concl.mp3
```
恰好 4 个 M + 主会话预生成的 3 个 concl.mp3（未改动、未重新生成）+ 原有 .DS_Store。

### 2.3 script.js diff（标准 3）= 3 step + 3 audios，零其他
```
+ {id:'m1-concl',trigger:'after:m1-s5@1500',say:'因此我们得出结论：…',audio:'c4s3-m1-concl'}
+ {id:'m2-concl',trigger:'after:m2-s5@1500',say:'记住啦：…',audio:'c4s3-m2-concl'}
+ {id:'m3-concl',trigger:'after:m3-s5@1500',say:'所以说，潜望镜…',audio:'c4s3-m3-concl'}
+ 'c4s3-m1-concl':'guide/audio/c4s3-m1-concl.mp3',
+ 'c4s3-m2-concl':'guide/audio/c4s3-m2-concl.mp3',
+ 'c4s3-m3-concl':'guide/audio/c4s3-m3-concl.mp3'
```
（另有 4 行仅因追加而补尾逗号，内容不变。）运行时数据量对账：steps `9/7/6`（原 8/6/5 各 +1）、errors 12、tasks 11、free 14、audios **37**（原 34 +3）；三条 last_step 的 id/trigger/audio/say 与任务书逐字一致。

### 2.4 engine.js diff = 空（标准 4）
`git diff --name-only | grep engine` → 无输出 ✓（`after:ID@ms` 触发与本页解说队列均沿用 r2 现成实现）

### 2.5 exp-mirror-vB.html diff 仅 ?v=（标准 5）
4 处：guide.css / script.js / engine.js / vB.js 全部 g3→g4，无其他行变更 ✓

### 2.6 vB.js grep 对账（标准 6）
- 启动层：`el.className='gvb-start'`（vB.js:120）、`.gvb-start-card/icon/title/sub`（123-125）、`removeStartLayer`（135、257、264）
- 拦截判定：`p.catch(function(e){settle(true,!!(e&&e.name==='NotAllowedError'));})`（vB.js:111）→ `if(blocked&&!startUsed)showStartLayer(); else if(failed)armUnlock();`（102-103）
- voice 态无 badge 渲染：`fab.innerHTML='<span class="gvb-fab-face">🧑‍🏫</span>'`（badge 元素不再预置）+ `setBadge(mode==='voice'?null:…)`（254），null 分支把 badge 从 DOM 摘除（45-46）
- 🔇 叠加元素：`.gvb-fab-badge`（guide.css:185，`left:62%;top:62%;transform:translate(-50%,-50%);width/height:46%`，白底圆托 + `pointer-events:none`）

### 2.7 浏览器实测（标准 7，playwright headless Chromium，http://localhost:8848）

**a. 启动层**（默认 headless 环境 autoplay 被拦）
```
start_layer.appears_when_blocked = true
z_index = "80"   bg = rgba(15,23,42,0.6)   covers_viewport = {w:1280,h:720,vw:1280,vh:720}
text = "🔊\n点击开启语音讲解\n浏览器要求先点一下屏幕才允许播声音"
caption_while_layer_up = {show:true, display:"flex", text:"欢迎来成像探究台！…", speaking:false}  ← 字幕照常显示
点击后：removed = true, caption.speaking = true（intro 立刻补播）, intro.mp3 = 200/206
not_reshown_within_4s = true（一次生命周期只弹一次）
显式策略 --autoplay-policy=document-user-activation-required 复测：layer_appears=true → 点击 → removed=true, speaking=true
放行环境 --autoplay-policy=no-user-gesture-required：layer_absent = true，intro 直接播（speaking=true）✓
text/sleep 态被拦时 layer_count = 0（不弹启动层）✓
```

**b. 三态循环**（连点浮标，DOM 实测）
| 态 | fab.className | 子元素 | badge | opacity | title | ls |
|---|---|---|---|---|---|---|
| voice | `gvb-fab mode-voice` | 1 个 `gvb-fab-face` | **badge_count=0（无叠加物）** | 1 | 语音+字幕 | voice |
| text | `gvb-fab mode-text` | face + `gvb-fab-badge` | 🔇，rel_cx/cy=0.611、rel_w=0.425、inside=true（叠在圆面右下） | 1 | 只字幕 | text |
| sleep | `gvb-fab mode-sleep` | face + `gvb-fab-badge` | 💤，同款叠加位 | 0.45（未 hover 实测） | 老师休眠中，点击唤醒 | sleep |
| voice（第 4 击回到起点） | `gvb-fab mode-voice` | 1 个 face | badge_count=0 | 1 | 语音+字幕 | voice |

注：hover 状态下读到的 sleep opacity=0.8 来自既有 `.gvb-fab.mode-sleep:hover{opacity:.8}`，鼠标移开即 0.45（blocked_other_modes.sleep 无 hover 实测 = 0.45）。

**c. 结论链路**（测试性写入 `R.objLit` / `R.matched`，两阶段写入避免同帧吃掉 s5 边沿）
```
音频请求顺序：c4s3-m1-s1.mp3(200) → c4s3-m1-s5.mp3(200) → c4s3-m1-concl.mp3(200)
m1-s5 字幕：「重合了！像和物等大，到镜面距离也相等。」 → +900ms speaking=true（配音在播）
结论字幕：「因此我们得出结论：平面镜成的像，跟物体大小相等，像距等于物距，关于镜面对称，而且是虚像。」
        +900ms speaking=true，show=true，🔁 重播钮可见
concl_mp3_requested = true，concl_after_s5_order = true
M2 复测：c4s3-m2-concl.mp3(200)，字幕「记住啦：…所以是虚像。」speaking=true
M3 复测：c4s3-m3-concl.mp3(200)，字幕「所以说，潜望镜用两块四十五度的平面镜…景物啦。」speaking=true
音频 HTTP 失败数 = 0
```
结论条排在上一条解说之后播 = r2 解说队列自动生效（s5 音频 ended 后才取队首 concl），无需改 engine。

**d. console**：vB 页全程 `console_errors = []`（含启动层路径、三态切换、三条结论链路）✓

### 2.8 回归（标准 8）
| 页 | badge | 专属元素 | .gvb-* 泄漏 | 场景切换后报错 | console 错误 |
|---|---|---|---|---|---|
| vA | ✓ | `.guide-card` ✓ | 0 | 0 | [] |
| vC | ✓ | `.guide-topbar` ✓ | 0 | 0 | [] |
| vD | ✓ | `.guide-badge` ✓ | 0 | 0 | [] |
三页 M1→M2→M3→M1 切换后 UI 正常、0 报错；guide.css 删除的 5 行全部位于 `.gvb-*` 段（旧 badge 定位 + 段标题注释），上方 `.guide-*` 既有规则零改动。

## 3. 说明与已知边界
1. **启动层为何必须存在**：浏览器 autoplay 策略是平台红线，无声手势前 `play()` 必被拒；启动层是 H5 教材标准解法。真机/桌面浏览器若已放行（MEI 高或用户此前交互过），启动层根本不出现，体验无感。
2. **启动层在屏时字幕不倒计时**：被拦那条的 `scheduleHide` 被 `clearHide()` 取消，字幕留住直到用户点击（点击即 `render()` 接管，正常调度），避免"字幕先消失、启动层还挂着"的错位。
3. **兜底保留**：r2 的隐形 once 手势补播仍在——仅用于「启动层已弹过一次后又被拦」或「音频加载失败」两种情况；启动层在屏时不挂，避免解锁后重复起播。
4. **测试写入说明**：`R.matched` 需与 `R.objLit` 分两阶段写入，因为 engine 在同一帧内先发 m1-s1 再置 `G.everMatched`，同帧写两者会让 m1-s5 边沿永不触发（真实操作路径不受影响：点燃与重合本就相隔数秒）。
5. 未 commit / 未 push，候蔡总体验拍板。

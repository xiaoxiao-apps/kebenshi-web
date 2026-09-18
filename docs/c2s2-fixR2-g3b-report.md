# c2s2 第二轮修复 · G3b 批报告（响度实验 exp-loudness）

日期：2026-09-18 ｜ 范围：`content/physics_g8_v1_c2_s2/exp-loudness.html` + `exp-loudness.js`
（返回按钮、exp-back.js 未触碰；未 commit / 未 push；教材事实未改）

## 修复内容

### 1. 人物重绘（火柴人 → 圆润卡通小人）
- 旧：圆头+直线肢体火柴人，紫蓝 #5f6caf，与页面纸质风不搭。
- 新：SVG 卡通小孩——圆脸+棕色刘海+呆毛、笑眼高光、腮红、微笑嘴；绿色圆角上衣（#5aa24e）、棕色裤鞋（#8a6a45/#5d4630）、肤色手臂；脚下椭圆投影。配色取自 common.css 绿/棕系，与纸质背景协调。
- 画布背景同步由冷灰 #eef1f5 改为暖纸色 #f7f3e8 + 地面 #efe7d3，与人物和页面风格统一。

### 2. 距离滑块 → 人物水平位置（不再缩放）
- 删除 `scale(1 - ratio*0.65)` 缩放逻辑。
- 新增 `#personTrack` 轨道容器；`updatePerson()` 按 ratio=(dist-1)/9 计算 `translateX((ratio*2-1)*span)`，span=(轨道宽-人物宽)/2：近(1m)=靠左贴近音叉，远(10m)=靠右远离；人物宽度恒定 108px（移动端 92px）。
- 透明度仅轻微衰减（1→0.8）作距离暗示；音量仍随距离衰减（gain = min(1.1/dist^0.7, 1)，播放中拖滑块实时改 gain）。
- 坑：SVGElement 无 `offsetWidth`（undefined）导致首版 span 算错溢出轨道；改用 `getComputedStyle().width`，并加 ResizeObserver 在窗口/全屏变化时重算位置。
- 实测（桌面 1280px）：轨道 789.5–1111px；near left=789.2 / mid=896.2 / far=1003.2，宽度三次均 108px 不变。

### 3. 音频零延迟
- 页面加载即 `fetch()` 两个敲击音 + `AudioContext.decodeAudioData` 预解码为 AudioBuffer 缓存。
- 首次用户手势（pointerdown capture，一次性）`resume()` AudioContext 常驻。
- 点击轻敲/重敲：`AudioBufferSourceNode.start(0)` 立即出声；轻敲 gain×0.5、重敲 gain×1.0 区分响度；连点先 stop 旧源防叠音。
- 兜底：若点击时预解码未完成，临时 `new Audio()` 播一次并继续预载（不阻塞）。
- 实测（浏览器打点，pointerdown→src.start）：轻敲 0.5ms、重敲 0.4ms，无明显延迟；首击时 ctx 由 suspended 自动 resume。

### 4. 素材
- 沿用原引用，未换文件：重敲 `assets/audio/fork-a4-440hz-1.mp3`、轻敲 `assets/audio/fork-a4-440hz-2.mp3`（两文件均在 assets/audio/ 下确认存在）。

## 自查
- `node --check exp-loudness.js` ✅
- `python3 -m http.server 8712` 本地实测 ✅（页面 0 报错；轻敲/重敲点击后 forceVal/tryVal=2/2、findCard 解锁正常）；用完已 kill。
- 截图（docs/c2s2-qa/）：
  - `r2-g3b-loudness-near.png`（桌面，1m 人物靠左贴音叉）
  - `r2-g3b-loudness-far.png`（桌面，10m 人物靠右、大小不变）
  - `r2-g3b-loudness-mobile.png`（390px，上下堆叠布局正常）
- 交互链路未动：轻敲/重敲振幅动画、填空解锁（振幅/振幅）逻辑保持原样。

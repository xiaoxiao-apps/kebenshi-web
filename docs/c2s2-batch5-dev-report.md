# c2s2 batch5 开发报告 · 声音的特性

日期：2026-09-18
范围：`content/physics_g8_v1_c2_s2/` + `docs/`

## 完成项

1. `exp-instruments.html/.js` — 科学世界·乐音和乐器
   - 乐音概念卡：规则/无规律波形 SVG 对比。
   - 三 Tab 单显导航：打击、弦、管乐器。
   - 迷你仿真：鼓力度→响度；编钟大小、弦长、空气柱长度→音调（playbackRate）。
   - 贾湖骨笛资料卡：自绘内联 SVG，7 个音孔 + 两端开孔，文字严格按教材 P42。
   - 每 Tab 一个翻牌题。

2. `exp-ultrasound.html/.js` — 超声波与次声波的应用
   - 超声波翻牌×4：声呐、B 超、金属探伤、超声清洗。
   - 次声波卡×2：大象交流、自然灾害监测。
   - 底部返回 `exp-range.html` 频谱图链接。

3. `experiment.html` — 点亮「乐器百科」卡，新增「超声波应用」卡。

## 素材使用

- `assets/audio/taiko-hit.mp3`、`chinese-bell.mp3`、`violin-do-c4.mp3`、`flute-do-c4.mp3`、`dizi-sample.mp3`。
- 贾湖骨笛 SVG 参考 `/Users/personal/.openclaw/workspace/可交互教材/c2s2_photos/jiahu_c.jpg` 形态自绘，未嵌入照片。

## 质检

- `node --check exp-instruments.js` ✔
- `node --check exp-ultrasound.js` ✔
- 相对路径、音频由用户点击触发、双端适配（≤480px 单列）。
- 未修改 `app.js`，未做 `git commit`。

## 备注

- 音调仿真使用 HTMLAudioElement.playbackRate，不改变原始素材时长。
- 贾湖骨笛文字与教材 P42 转录稿一致：「8 000 多年前」「我国迄今发现的最早的管乐器」。

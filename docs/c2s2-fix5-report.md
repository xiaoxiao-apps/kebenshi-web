# c2s2 修复轮 F5 报告

## 修改文件
- `content/physics_g8_v1_c2_s2/exp-craft.html`
- `content/physics_g8_v1_c2_s2/exp-craft.js`
- `content/physics_g8_v1_c2_s2/exp-instruments.html`
- `content/physics_g8_v1_c2_s2/exp-instruments.js`
- `content/physics_g8_v1_c2_s2/quiz.html`

## 修复点
1. 水瓶琴：点击即播，自动停掉上一音并 `currentTime=0`，连续点击流畅。
2. 水瓶琴音色：换用 `assets/audio/bottle-1.wav` ~ `bottle-8.wav`，水多→低音 do，水少→高音 i。
3. 活塞哨子：改 `slide-tone.wav` 循环持续播放；点「吹气」/「⏹ 停止」切换；拖动实时改 `playbackRate`。
4. 乐器百科试听：长笛保持 `flute-do-c4.mp3`，笛子改 `dizi-note.mp3` 单音；滑块拖动实时变调。
5. 乐器分类卡：鼓→打击乐器；二胡/小提琴→弦乐器；箫/笛子→管乐器；删除非教材乐器描述。
6. Q1：新增「能/不能」人耳判断，与频率分别判分，讲解覆盖两问。
7. Q4：题目指定二胡（或吉他），示例要点更新为二胡发声/音调/响度。

## 验证
- `node --check exp-craft.js exp-instruments.js` 通过。
- 浏览器自查（桌面）：水瓶琴连点、活塞哨子吹气+拖动变调、乐器百科 slider 变调均正常。
- quiz Q1 两问分别判分并合成 ✅/❌，Q4 示例要点已更新。

## 未做
- 未 git commit，未改动其他文件。

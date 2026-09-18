# c2s2-fix2 修复报告

## 修改文件
- `content/physics_g8_v1_c2_s2/exp-intro.html`
- `content/physics_g8_v1_c2_s2/exp-intro.js`
- `content/physics_g8_v1_c2_s2/exp-ruler.js`

## 验收项修改

### 1. 蚊子音频暂停/重置
- `exp-intro.html` 动画区下方新增 `⏸ 暂停/重置` 按钮。
- `exp-intro.js` 改用 `mosqPlaying` 状态：播放中点击蚊子不重新触发；暂停按钮执行 `pause()` 并把 `currentTime=0`，再次点击蚊子可重新播放。

### 2. 翅膀频率视觉区分
- 蝴蝶：相位速度改为约 2 次/秒，扇动幅度大且缓慢。
- 蚊子：相位速度改为约 18 次/秒，叠加多层半透明残影翅膀 + 绿色振动线，呈现高频模糊感，快慢一眼可辨。

### 3. 钢尺场景逼真化
- `exp-ruler.js` 重新绘制：木质课桌（桌面透视 + 桌腿），银灰渐变金属钢尺压在桌边，刻度线清晰。
- 动画上直接标注 `伸出桌面：X cm` 并随 slider 实时更新；尺子上方画红色双向箭头指示伸出段。

### 4. 拨动音效修复
- 改用 `assets/audio/ruler-fixed.wav`，每次拨动只播放一次。
- `playbackRate = sqrt(20/L)`：短尺高音、长尺低音，与页面等效频率读数（625/L Hz）方向一致，播放过程中音高固定不滑动。

## 自查结果
- `node --check exp-intro.js` ✅
- `node --check exp-ruler.js` ✅
- `exp-intro.html` DOCTYPE / `</html>` 唯一 ✅
- 浏览器 390px 与桌面自查：两页按钮、canvas、标注均正常 ✅
- 未 git commit，未修改指定外文件

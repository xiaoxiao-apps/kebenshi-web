# c2s4 exp-wave 修复报告

## 改动文件
- `content/physics_g8_v1_c2_s4/exp-wave.html`
- `content/physics_g8_v1_c2_s4/exp-wave.js`

## 实现要点
- 初始态 canvas 仅画水平基线，无声，无自动播放。
- 按钮改为「音叉」「噪声」「停止」三按钮；「刮玻璃噪声」改为「噪声」。
- 点击「音叉」：滚动正弦波 + 440Hz 正弦音；点击「噪声」：随机杂乱波形 + 白噪声。
- 点击「停止」：停音频、停动画、canvas 恢复直线。
- AudioContext 单例，切换源时 stop 旧节点防叠音；rAF 循环，停止时 cancel。

## 自查结果
- `node --check exp-wave.js`：通过
- `exp-wave.html`：`head -1` 为 `<!DOCTYPE html>`，`tail -1` 为 `</html>`，`</html>` 出现 1 次
- `grep -n "刮玻璃" exp-wave.html exp-wave.js`：0 命中
- `grep -n "播放" exp-wave.html exp-wave.js`：仅提示文案与状态文字，无独立播放按钮残留
- 未修改 `explain.html`

# c2s2「声音的特性」实验区批次 3 开发报告

日期：2026-09-18 | 范围：`content/physics_g8_v1_c2_s2/`

## 本批交付（6 个新文件 + 1 更新）

| 文件 | 说明 |
|------|------|
| `exp-intro.html/.js` | 问题导入：蚊子 vs 蝴蝶，550 Hz / 6 Hz 双格动画 + 迷你频率轴 + 揭晓卡 |
| `exp-loudness.html/.js` | 响度与振幅：轻敲/重敲音叉弹乒乓球 + 距离衰减 gain |
| `exp-timbre.html/.js` | 音色对比：音叉/钢琴/长笛同屏波形 + 盲辨小游戏 |
| `experiment.html` | 点亮响度、音色卡片并新增蚊子蝴蝶入口 |

## 自查结果

- [x] 全部 JS 通过 `node --check`
- [x] 音频均挂用户点击事件，相对路径 `assets/audio/`
- [x] 沿用了 B2 的 `fullscreen-wrap`、揭晓卡、反馈样式
- [x] 桌面/390 px 双适配，按钮 ≥44 px
- [x] 数字事实（20~20 000 Hz、550/6 Hz、262 Hz）未改动
- [x] 未动 `app.js` 及范围外文件；未提交 git

## 待测试

真机 iOS Safari 音频自动播放、波形绘制性能、canvas 响应式截断。

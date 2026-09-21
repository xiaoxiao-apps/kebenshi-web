# c2s4 explain.html 图位修复报告

## 完成项
1. 图2.4-1 噪声来源：用 PIL 程序化绘制 4 格示意图，横向拼成长图。
   - 文件：`content/physics_g8_v1_c2_s4/img/noise-sources.jpg`
2. 波形 SVG：用 python3 随机游走生成噪声 path，同屏上方保留规则正弦波。
3. 图2.4-2 想想议议：PIL 绘制消声器 / 隔音墙 / 耳罩 三张小图插入对应卡片。
   - `img/muffler.jpg`、`img/wall.jpg`、`img/ear-defender.jpg`
4. 图2.4-3 禁止鸣喇叭标志：PIL 绘制国标风格红圈红斜杠+黑喇叭图标。
   - `img/no-horn.jpg`
5. 图2.4-4 高架桥隔音板：PIL 绘制道路+声屏障+居民区场景。
   - `img/sound-barrier.jpg`

## 来源说明
本次 `web_search` 不可用，所有图片均使用 python3 + PIL 程序化渲染为简洁矢量风格示意图，未留占位。

## 自查
- `explain.html` 261 行，首行 `<!DOCTYPE html>`，末行 `</html>`。
- 仅修改 `explain.html` 与新增 `img/*`；未改动其他文件，未 commit。

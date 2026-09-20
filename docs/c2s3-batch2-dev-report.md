# c2s3「声的利用」Batch2 实验区开发报告

## 文件清单

| 文件 | 行数 | 说明 |
|---|---|---|
| content/physics_g8_v1_c2_s3/experiment.html | 50 | 实验区导航页（4 张 nav-card） |
| content/physics_g8_v1_c2_s3/exp-echo.html | 90 | 回声定位测距交互页 |
| content/physics_g8_v1_c2_s3/exp-echo.js | 54 | 超声脉冲往返动画 + 练习①判分 |
| content/physics_g8_v1_c2_s3/exp-huanqiu.html | 72 | 圜丘回声交互页 |
| content/physics_g8_v1_c2_s3/exp-huanqiu.js | 52 | 俯视声波扩散/栏板反射动画 |
| content/physics_g8_v1_c2_s3/exp-candle.html | 67 | 扬声器与烛焰交互页 |
| content/physics_g8_v1_c2_s3/exp-candle.js | 38 | 声波波纹推动火焰颤动 |
| content/physics_g8_v1_c2_s3/exp-road.html | 67 | 音乐公路交互页 |
| content/physics_g8_v1_c2_s3/exp-road.js | 41 | 小车过凹槽 + 音符弹出动画 |
| docs/c2s3-batch2-dev-report.md | 33 | 本报告 |

## 物理语义与数字自查

1. **exp-echo：回声定位测距**
   - 动画表现声波从声源到目标再返回的往返过程，突出「往返、除以 2」。
   - 介质切换：空气 340 m/s / 海水 1 500 m/s；目标距离 2–40 m。
   - 实时显示往返时间 t 与目标距离 s = v × t ÷ 2。
   - 练习①原题判分：4 s、1 500 m/s，正确答案 B = 3 000 m，推导 1 500 m/s × 4 s ÷ 2 = 3 000 m。

2. **exp-huanqiu：圜丘回声**
   - canvas 俯视图：圆心天心石、外圈石栏板、半径约 11.5 m。
   - 天心石喊话：声波扩散 → 栏板反射 → 返回圆心，动画放慢并显示「约 0.07 s」。
   - 信息条说明回声与原声混在一起、声音格外响亮。
   - 对比按钮：站天心石以外，反射声波不汇聚回耳。

3. **exp-candle：扬声器与烛焰**
   - 点「播放音乐」后声波波纹推向烛焰、火焰随波纹颤动。
   - 音量（振幅）滑杆联动颤动幅度。
   - 结论卡：扬声器旁的烛焰发生颤动，说明声波能传递能量。

4. **exp-road：音乐公路**
   - 侧视路面等距横向凹槽，小车匀速行驶，每过一个凹槽上下振动一次并弹音符动画（无音频）。
   - 频率滑杆默认 sol = 392 Hz，显示 54 km/h = 15 m/s。
   - 实时计算相邻凹槽距离 = v ÷ f ≈ 0.038 m（约 3.8 cm），凹槽越密音调越高。

## 结构自查

- 所有实验页返回按钮统一 `<a class="back-btn" data-back href="experiment.html">‹ 返回实验区</a>`。
- 脚本顺序统一：fullscreen.js → exp-common.js → exp-back.js → 本页 js。
- `node --check` 通过所有 JS：exp-echo.js / exp-huanqiu.js / exp-candle.js / exp-road.js。
- 所有 HTML 的 `head -1` 为 `<!DOCTYPE html>`，`tail -1` 为 `</html>`，`grep -c "</html>"` = 1。
- 未引用任何音频/图片文件，未创建 assets/，音效全用视觉动画表达。
- 未动本批范围外任何文件（common.css、exp-back.js、explain.html、summary.html、quiz.html、index.html 均保持原样）。

## 结论

Batch2 全部 4 个实验区页面 + 导航页 + 批次报告已落盘，物理数字与教材分析稿一致，JS 语法与 HTML 结构自查通过。

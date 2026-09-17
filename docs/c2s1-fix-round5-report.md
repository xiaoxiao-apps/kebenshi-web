# c2s1 验收修复轮 5（蔡总三轮反馈 2 大项）

## ① 声音的传播
- 粒子一粒一粒排队过管：重写为状态机 in(罩内漂)/tube(管内流动)/out(已入泵)。
  抽气：in→tube(u 0→1)→out，管尾空出间距(0.15)才放下一粒进管；松开：out→tube(u 1→0)→in，
  泵口空出间距(0.88)才放下一粒回流。不再堆积在管中。
  实测：抽气中管内 6-8 粒 u 等间距（0.13/0.29/0.44/0.59/0.75/0.9）；真空时管空（全入泵）。
- 画布上泵体可直接按压：cv pointerdown 命中泵体矩形(含手柄区)→setPumping(true)，
  与按住抽气键完全同效。实测 canvasPress=true、按钮文案同步「抽气中…」、松开恢复。
- 下压动作效果：画布泵体按压时整体下移 3k+手柄行程变短；HTML 按钮加 .pressed 类
  （translateY(3px)+内阴影），画布按压时同步加/去。实测 btnPressed true→松开 false。
- 顺带修潜在 bug：页面加载时隐藏 Tab 的 canvas fit() 落设计宽回退、切 Tab 不 re-fit，
  导致内部坐标与 CSS 宽度错位（点击坐标偏）。切 Tab 内联脚本加 rAF 后 dispatch resize 一次。

## ② 声波与水波
- 水波点击夹回湖面边界：pointerdown 坐标按椭圆方程归一化 m>0.94 时缩回边界内。
  实测点 canvas 角落(0.98,0.95)→ripple 落在 m=0.94 边界上，不超出湖面。
- 水滴声改「夺」音：原高频「叮噜」改低频闷响——主 sine f0(380-460Hz)→f0*0.42 快下扫 70ms
  极短起音(「d」爆破) + 低八度体共振 sine f0/2 衰 120ms(胸腔感) + 6ms 噪声 highpass click(齿音头)。
  实测一次 tap = osc×2 + bufferSource×1。

## 自查（2026-09-17 18:26）
- node --check 三 js 全过；head DOCTYPE / tail </html> / grep -c=1 全过
- curl 8901 命中 t2Pump.pressed / re-fit 新代码
- 实测：排队 us 等间距、画布按压 pumping/btnPressed 同步、ripple m=0.94、夺音 osc2/bs1
- 截图：c2s1_fix5_tab2_pump.png（抽气中泵体下压+红面板）已落盘

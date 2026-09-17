# c2s1 验收修复轮 4（蔡总二轮反馈 3 项）

## ① 声音的产生
- 共鸣盒长度随 slider 联动：geo() 中 bw = W*(0.36+0.34*tension/100)，橡皮筋两端钉在盒顶随之伸缩；拉长变细（原 bandThick 保留）、缩短变粗。实测：slider 0→100 盒宽像素 252→470。
- 删拨动键旁 Hz 标注：HTML 删 span#t1Hz，tab1 删 syncHz/hzEl；振动提示改「绷得越紧，音调越高」。figcap 残留「音高读数越高」措辞同步改。grep t1Hz=0、音高读数=0。

## ② 声音的传播
- 图例/读数避让玻璃罩：drawHud 改右上（空气量+状态）+右下（粒子图例），textAlign right；罩区（左中）不再有任何文字。截图确认无重叠。
- 机械闹钟「叮铃铃」：原双方波+7Hz LFO 改为金属铃非谐 partials（2093/2637/3720/5274Hz 正弦叠置）+ 25Hz 方波快颤音（铃锤连续打铃感）。
- 管内粒子流动：原实现粒子在罩 clip 内画→管内段被裁掉看不见。拆两 pass：罩内粒子 clip 内、管内粒子 drawGlass 后 clip 外画。行程 u=(L-air)/L（L=该粒子离罩空气量）：抽气 u↑向泵移动、松开 u↓向罩回流、真空全到泵口。实测质心：抽气 +5.3（向泵）、松开 −3.3（向罩）。
- 真空仍振动：drawClock 的 bob/swing 去掉 air>0.5 条件，只要 playing 就震；真空提示改「闹钟仍在振动，但无声」。实测 air=0% 时闹钟区帧差 505（在震）。

## ③ 声波与水波
- 鼓竖直摆放鼓面朝右（同教材）：geo 改 rx=13k/ry=46k 竖椭圆鼓面、鼓身向左横卧（竖向木渐变+横木纹+双箍圈+斜腿支架），鼓面沿法向水平抖动，波源=鼓面右缘。截图确认形态同教材。
- 按钮重排：模式键（声波/水波）canvas 上方左排（.t3-modes），动作键（敲击/击打水面）canvas 下方居中（.t3-act）。实测 DOM 位置 modesAboveCanvas/actBelowCanvas/actCentered 全 true。
- 真实水滴声：原单 bandpass 噪改三段合成——撞击溅声(3ms 噪 highpass3k) + 「叮噜」共振(正弦 f0+300→f0*0.28 扫频 70ms 快衰) + 气泡余韵(bandpass Q9 噪 180ms)，f0 每滴随机 1100-1600Hz。实测一次 tap = osc+1、bufferSource+2。

## 自查（2026-09-17 17:47）
- node --check 三 js 全过；head DOCTYPE / tail </html> / grep -c=1 全过
- curl 8901 命中新文案（t3-modes、共鸣盒跟着橡皮筋一起变长）
- console 0 error（仅 QA getImageData 采样 warning）；390px 全新加载无溢出（scrollW=375=clientW）
- 截图：c2s1_fix4_tab1/tab2/tab3_drum/tab3_m.png 已落盘

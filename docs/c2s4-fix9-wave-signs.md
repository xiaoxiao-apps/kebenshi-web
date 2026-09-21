# c2s4 修复单A · 波形交互+真图替换（2026-09-21 r9，含补修）

## 改动
1. **exp-wave.js 波形横线重叠**：drawBase() 绿水平直线改 `if (!source)` 条件绘制。source==null→网格+标题+直线；source!=null→仅网格+标题+波形线（音叉绿/噪声红）；停止恢复直线；初始态不变。
2. **exp-wave.html 删 pill**：移除「声源 sourceVal」「状态 stateVal」两个 pill span；停止/音叉/噪声按钮保留。
3. **exp-wave.js 清理引用**：删 sourceVal/stateVal 的 getElementById 与全部 textContent 赋值，无 null 引用。
4. **img/no-horn.jpg（补修重裁）**：源 可交互教材/c2s45_photos/禁止鸣笛.jpg。灰度扫描自底向上首行 min<100 得 r=1002（黑外框底线），裁 box=(0,0,768,1005)；保留行内水印灰像素(中性120-254)抹白、998-1002 行框内填黑恢复外框底线；q85 覆盖仓库与 media/c2s45-verify/ 两副本（md5 一致 13c8f987…）。
5. **img/sound-barrier.jpg**：源 隔音板.jpeg 无水印，1024≤1600 直接 q85 覆盖。
6. **explain.html**：仅两 img src 加 ?v=20260921r9，其余未动。

## 验证
- 像素断言：成品底部10行灰度150-235灰条像素=0，PASS。
- view_image 目视（2轮）：无「昵图网/nipic/ID:」残留、黑外框底边连续、红圈喇叭+红底白字完整无变形；sound-barrier 主体完整。
- node --check exp-wave.js = OK；exp-wave.html/explain.html：head -1=<!DOCTYPE html>、tail 末行 </html>、grep -c "</html>"=1；grep sourceVal|stateVal：html=0、js=0。
- lsof 8124 LISTEN（Python）；curl exp-wave.html pill/sourceVal=0；curl explain.html 'v=20260921r9'=2；两 img URL 200 且与磁盘 md5 一致。

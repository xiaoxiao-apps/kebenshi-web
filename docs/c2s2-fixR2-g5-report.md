# c2s2 第二轮修复 G5 批报告（2026-09-18）

范围：exp-scope.html/js、exp-timbre.html/js（仅这 4 个文件）。

## 反馈五：示波器改预设频率按钮
- 撤掉连续滑杆（freqSlider/freqDisp 全清，grep 0 残留），改 110/220/440/880Hz 四档按钮组（.freq-btn，active 高亮）。
- 波形改正弦示意：显示窗口固定 1/55 s，周期数=频率/55 真实比例（110→2、220→4、440→8、880→16），满宽绘制，每周期 ≥64 采样点（pts=max(512, cycles×64)）。
- 播放保留：真实音叉采样（220/440/880 m4a）+ playbackRate 变调，preservesPitch=false；110Hz 用 fork-220×0.5，音高与所选一致；播放中切档自动换源换调。
- 验证：evaluate 数「中线上连续区段」=2/4/8/16 精确匹配；Network 见 fork-880.m4a、fork-220.m4a 均 200；播放/停止按钮态正确。

## 反馈六：音色三波形平滑化
- 弃 Analyser 实时波形（方块状根因），改谐波叠加示意：音叉=纯正弦；钢琴=基频+2/3/4 次谐波（1/0.5/0.3/0.18 递减）；长笛=基频+0.18×2 次谐波（略不对称近正弦）。4 周期、每周期 64 点、lineJoin/lineCap round。
- 保持满宽 + 峰值归一化（peakOf 先算峰值再画）；画布内分带标签（音叉/钢琴/长笛 + 播放中），删除原底部横排 .labels（与分带错位）。播放仍用真实采样文件。
- 验证：桌面+390px 截图三波均圆润可辨、疏密相同、高度对齐。

## 返回按钮来源感知（两页）
- 内联 initBack：无 ?from= 时解析 document.referrer，同源同目录且文件名 ∈ {explain.html, experiment.html} → 指回来源页，否则 index.html；静态默认 href/文字同步为 index.html「‹ 返回本节」；?from= 仍由 exp-back.js 优先处理不冲突。
- 验证：node 正反用例 7/7（含 evil 域、跨目录、根目录 explain 均回落 index）；浏览器实测 backHref=index.html、文字「‹ 返回本节」。

## 自查
- node --check 两 js 过；HTML 三重自查（DOCTYPE 首行/</html> 末行/grep -c=1）过。
- python3 -m http.server 8714 起→curl 四文件 200+新标记命中→用完 kill（lsof 确认无监听）。
- 截图 docs/c2s2-qa/：r2g5-scope-desktop.png（四档纵拼）、r2g5-scope-mobile.png、r2g5-timbre-desktop.png、r2g5-timbre-mobile.png。
- 页面 console errors 0；教材数字事实未动；未 commit/push。

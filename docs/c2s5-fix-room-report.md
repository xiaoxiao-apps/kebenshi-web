# c2s5 exp-room 修复报告

1. 默认不响铃：初始 `ringing=false`，按钮文字「开始响铃」，状态「未响铃」，不自动出声。
2. 复响修复：AudioContext 单例复用；开始响铃时 `resume()` 并重排 schedule；停止时清 timer 并 suspend；反复切换有声。
3. 音量随材料：mats 增加 gain 系数，材料切换时 `updateMatGain()` 实时更新 masterGain，无需重按响铃。
4. 机械闹钟铃声：双振荡器（2100/2600Hz triangle/sine）80ms 包络，110ms 交替，lookahead 调度。
5. 3D 真实感：亮米白背景+增强灯光；Canvas 木纹木箱；机械闹钟圆柱身+双半球铃+摆锤+支脚；分贝仪带屏幕与麦克风；HTML 背景改亮色。

自查结果：
- node --check exp-room.js：通过
- exp-room.html head/tail/</html> 计数：1
- ringing=false：第95行
- resume()：第119行
- DOM id 引用与 html 对齐
- 行数：exp-room.js 160 行，exp-room.html 96 行

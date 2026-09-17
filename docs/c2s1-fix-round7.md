# c2s1 修复轮7 — 蔡总验收反馈三项（2026-09-17 22:3x）

## 1. 真空罩：抽气声音不渐弱 + 重置后仍响
根因两处：
- LFO（铃锤颤音）直接加在 master gain 上 → master=0 时仍 ±0.45 振荡出声（重置/暂停后"还在响"）。
  修：LFO 改接独立 trem 节点（gain 0.55~1.45 调制），master 只管音量，0 即真静音。
- syncAudio 只在 setPlaying 瞬间调一次 → 抽气过程音量不跟空气量变。
  修：主循环 250ms 节流里 playing 时持续 syncAudio()，音量实时随空气量。
实测增益曲线：播放 0.09 → 抽气 81%:0.074 → 63%:0.06 → 42%:0.04 → 25%:0.026 → 6%:0.007 → 0%:0（渐弱至无声）；
重置后 gain=0、playing=false 立即静音。✅

## 2. 振动放大器：无鼓/音叉声音 + 鼓槌方向反
- 新增 WebAudio：drumSound(force)（sine 140+f→50Hz 下滑 + 噪声低通瞬态，响度随力度 slider）；
  forkSound()（512Hz 近纯音慢衰 + 2048Hz 弱泛音金属味）。敲一下/音叉点水按钮触发。
  实测：点击前 audio=false → 点击后 ctx running。✅
- 鼓槌掉头：枢轴仍在鼓右侧，杆/槌头画在负 x 方向（朝鼓），角度 0.35−swing*0.85，
  静止抬起、敲击瞬间槌头落到鼓面右缘。截图目检槌头朝鼓 ✅（鼓面右缘采样到槌头金色像素 66）。

## 3. 删骨传导交互 + 知识并入讲解
- experiment.html 删「骨传导体验站」导航卡；exp-bone.html/js 移入 content/archive/（不 rm，可恢复）。
  全仓 grep exp-bone 残留 0。
- explain.html「② 声音的传播」标签页新增详细节「骨传导：声音入耳的『第二条路』」：
  空气传导路径回顾 → 骨传导定义（不经过鼓膜和听小骨）→ 3 个实验（塞耳听音叉/听自己录音/吃脆饼干）
  → 2 应用卡（骨传导助听器/骨传导耳机）→ 要点绿框（两条路都到听觉神经；固体传声效果好）。
- t4 旧 tipbox 精简为指向 t2 详细节的导引。
- 截图目检渲染正常（c2s1_fix7_bone_explain.png）。

## 自查
- node --check exp-vacuum.js / exp-amp.js 过；curl 8901 命中新代码（第二条路/无 exp-bone）
- 截图：docs/qa_screenshots/c2s1_fix7_amp.png / c2s1_fix7_bone_explain.png
- 未 commit、未 rm、未动任务外文件

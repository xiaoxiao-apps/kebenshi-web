# c2s1 修复轮6-B 真空罩模拟对齐讲解版（子代理两度零落盘，助理亲自完成）

## 改动（仅 exp-vacuum.html / exp-vacuum.js）
- slider 抽气 → 按住抽气：HTML 按钮「▶播放闹铃 / 🫳按住抽气 / ⟲重置」+ 画布泵体可直接按住。
  按住才抽、松开即停（window pointerup/pointercancel + 画布 pointerup/leave 双保险，防 preventDefault 吞事件）。
- 粒子状态机 in/tube/out（同 explain-tab2.js）：抽气一粒一粒排队经气管入泵（管尾空 0.12 才放下一粒），
  松开一粒一粒回流（泵口空 0.9 才放下一粒）；真空时管空罩空。
  实测：抽气中管内 5-7 粒 u 等间距（0.17/0.33/0.5/0.66/0.83）；回流 7-9 粒等间距（0.01→0.91）。
- 泵体弹簧下压：欠阻尼弹簧 pressV（按住下压 4k+手柄行程 7k，松开弹回带过冲），无左右晃动；
  HTML 按钮 .pressed 下压样式同步。
- 铃声换机械闹钟「叮铃铃」：4 泛音 square（2093/2637/3136/4186）+ 28Hz 铃锤颤音 LFO；响度随空气量。
- 真空后闹钟**整机振动**（bodyShake 只跟 playing 走，介质只影响传声不影响声源）：实测真空帧差 278。
- 保留特色：罩外铃声波形面板（响度波纹）随空气量变平/恢复。
- HTML 空气量读数与粒子实时联动（主循环 250ms 节流 updateState）。

## 自查（2026-09-17 22:1x）
- node --check 过；DOCTYPE/</html>×1 过；curl 8901 命中 __vacParts/lastHud 新代码
- 实测：play→pumping→air 100→0（约5s）→真空 clockDiff 278→松开回流 air 73/tube 9
- 390px 无溢出（390=390）；截图 c2s1_fix6_vacuum.png / _m.png 落盘
- 未 commit、未 rm、未动其他文件

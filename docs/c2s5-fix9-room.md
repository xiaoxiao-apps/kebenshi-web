# c2s5 修复单C · exp-room.js r9 验证报告（五派·最终轮）

日期：2026-09-21 08:57 | 目标：content/physics_g8_v1_c2_s5/exp-room.js

## 执行说明
- 本轮开工时发现文件已被先行写入者更新（mtime 08:56:58，210 行），edit 因 oldText 不匹配中止。
- 按 segmented-file-write 规程：等待 20s 确认 mtime/size 稳定无漂移后，以磁盘实况逐项对照规格验收，规格已全部满足，未做重复改动。

## 逐项核对（规格 → 实况）
1. 文件头标记 `/* r9-lid-db-fix */`：第 2 行存在 ✓
2. refreshDb ringing 守卫：函数首行 `if(!ringing){`，未响铃时 dbVal=0.0~2.0 随机底噪、diffVal='--'、drawProbeScreen 同步小值、return；响铃时保留 baseDb/材料衰减逻辑 ✓
3. reset 恢复 '--'：resetBtn 监听器保留 `dbVal='--'; diffVal='--'; baseDb=null; drawProbeScreen(null)` ✓
4. outerBox 封闭盒已移除（grep outerBox = 0），替换为五块木纹板：
   - shellBottom 2.12×0.06×1.72（底）
   - shellXp/shellXn 0.04×1.2×1.64 @ x=±1.04（左右侧，顶到 y=1.2）
   - shellZp/shellZn 2.12×1.2×0.04 @ z=±0.84（前后侧，顶到 y=1.2，与内壁齐平）
   - 顶部敞开，复用 woodTex ✓
5. lidM 唯一顶盖 2.04×0.06×1.64 盖满口径（z 覆盖 -0.82~0.82，y 1.20~1.26）；铰链 lidP @(0,1.2,-0.82) 后方顶边，开合动画 `lidP.rotation.x=-lidT*Math.PI*0.55`（L205）保留；开盖后默认相机(5,4,6)俯角可见盒内 clock ✓
6. 不动项核验：walls planes、applyMat、音频通路（startRing/stopRing/scheduleRing）、相机拖拽、`__roomDebug`（L209）均原样 ✓

## 验证命令结果
- `node --check exp-room.js` → SYNTAX_OK
- `wc -l` → 210 行（≥197）
- `curl :8124/...exp-room.js | grep -c 'r9-lid-db-fix'` → 1
- `curl :8124/...exp-room.js | grep -c 'if(!ringing){'` → 1
- mtime/size 两次采样一致（1789952218 / 15947），无存活写入者漂移

结论：修复单C 全部条目已在盘并线上可达，验收通过。

# c2s5 修复单D · r10-lid-gain-fix（响铃音量与盒盖联动）

日期：2026-09-21 ｜ 文件：content/physics_g8_v1_c2_s5/exp-room.js + exp-room.html（标签1处）

## 逐条改动
1. **updateMatGain（L106）**：`var g=lidOpen?1.0:0.55*mats[curMat].g;` —— 开盖音量=处理前满音量且不随材料变化；关盖统一 0.55 系数×材料 g，保证开盖>关盖、关盖不同材料有差异。setTargetAtTime 逻辑不变。
2. **lidBtn click（L188）**：toggle lidOpen 与按钮文字后追加 `updateMatGain();` —— 开合盖即时生效音量。
3. **refreshDb 响铃分支（L155）**：`var att=lidOpen?0:(6+mats[curMat].a); var d=Math.max(35,ref-att+(Math.random()*2-1));` —— diff=ref-d 自动得出：开盖≈0、关盖无材料≈6、关盖带材料≈6+a。保留 `if(curMat==='none')baseDb=b;` 与 !ringing 守卫；dbVal/diffVal/drawProbeScreen 行不变。
4. **animate leak 不透明度（L201）**：`var leakF=lidOpen?1:(1-mats[curMat].a/20); leak.material.opacity=0.12*leakF*(1-ls/2.9);` —— 开盖漏声球不受材料抑制。
5. **exp-room.html L47**：标签「与材料差值」→「与处理前差值」（仅此一处）。
6. **文件头**：保留 `/* r9-lid-db-fix */`，其下追加 `/* r10-lid-gain-fix */`。

## 验证输出
- `node --check content/physics_g8_v1_c2_s5/exp-room.js` → CHECK_OK
- `curl -s http://localhost:8124/.../exp-room.js | grep -c 'r10-lid-gain-fix'` → 1（线上已是新版）
- `grep -n 'lidOpen?'` → L106（gain）/ L155（att）/ L201（leakF）3 处新增；L188、L206 为原有 ternary。

## 不动项确认
mats 表 a/g 值、音频通路（loadAlarm/startAlarmSrc/fallback beep）、响铃守卫、外壳五板、lidM 铰链动画、__roomDebug 均未改动。

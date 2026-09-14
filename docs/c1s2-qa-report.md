# c1s2「运动的描述」整节独立质检报告

> 质检员：独立子代理（不信任开发员自测，全部实测）
> 质检时间：2026-09-14 10:43 起
> 对象：http://localhost:8902/ （8页：index/explain/experiment/quiz/exp-motion/exp-reference/exp-train/exp-harvester）
> 权威依据：docs/c1s2-transcript.md（教材转录）、docs/c1s2-textbook-analysis.md §3.7（合规12条）
> 纪律：只查不改；缺陷即时增量落盘。

## 结论
**不通过**（存在 2 个 P1 功能/防剧透缺陷，无 P0）。缺陷总数 3：P0×0 / P1×2 / P2×0 / P3×1。
文案与教材转录逐字核对全部一致（机械运动/参照物定义、黑体结论、想想议议、练习4题、哈雷76年、梦天/天和图注、「一、机械运动」编号）；8 页 console 全干净；移动端 390px 无横向溢出。修复 D1、D2 后可复验放行。

## 缺陷清单
（增量记录，格式：页面 | 复现步骤 | 期望 vs 实际 | 级别 P0-P3）

- D1 | exp-train | 走完 SIT→FEEL→REVEAL→VERIFY 后，在 VERIFY 态点任一参照物 pill（如🚉站台）：立即跳到 CONCLUSION 态、pill 组隐藏（display:none），只剩「⟲ 再体验一次」；CONCLUSION 态再点另一 pill 无反应（handler 仅在 step===VERIFY 时 setStep，且 pill 已隐藏）。期望（设计§3.3）：VERIFY 为自由态，pill 选站台→「静止」、选旁车→「运动」可反复切换验证。实际：一次流程只能验证一个参照物，看另一个必须整局重玩 | P1

- D2 | exp-harvester | 页面加载后不交互，底部静态提示「结论：两车同快慢、同方向……运动和静止是相对的」直接可见（p.hint，opacity 1，首屏内 y≈895）。期望（§3.7 防剧透：结论卡只在交互后滑入）：核心结论交互前遮盖。实际：未点「出发」即泄露全节核心结论 | P1

- D3 | common.css | 过渡时长抽查：6 处 .15s、1 处 .12s（按钮/hover 微交互）、1 处 .35s（折叠 max-height）。期望（§3.7）：过渡 200-300ms。实际：微交互过渡低于下限（肉眼观感仍平滑，不阻塞） | P3

## §3.7 合规表逐条实测
1. 同类内容 Tab 单显：✅ explain 易错点三 tab 单显切换正常；quiz 五 tab 一次一题
2. 答案防剧透：❌ exp-harvester 静态结论 p.hint 首屏可见（D2）；其余（explain 揭晓卡、exp-motion 定义卡 op0、quiz ②④ cover、题3 徽章）均遮盖 ✅
3. 动画优于静态：✅ 5 处教材图全部 canvas/SVG 可操纵（彗星/街景/列车/收割机/对接）
4. 练习实时联动：✅ quiz1-4 均 pill/slider 实时反馈，无「检查」按钮
5. 导航只留顶部：✅ 8 页仅顶部 back-btn + tab/nav，无侧栏无浮动导航
6. 长公式分号断行：✅ 本节无长公式，三步法分步卡
7. input≤70px：✅ 全站无文本 input（仅 range slider），select 120px 非 input，合规
8. 200-300ms 过渡：⚠️ 状态/结论切换 .25s ✅；但 common.css 有 6 处 .15s、1 处 .12s（hover/按钮微交互）与 1 处 .35s（折叠展开）超出 200-300ms 区间（D3，P3）
9. 首屏提示条常驻：✅ 4 个 exp 页顶部常驻提示条（.hint 米色条）
10. 可点击元素指引：✅ exp-reference 首帧 #sun 带 pulse 描边；exp-harvester 首帧 pill.guide 脉冲
11. 浮动钮≤2：✅ 各 exp 页仅 ⛶ 全屏浮动钮 + 顶部返回链接（≤2）
12. 暖纸感配色：✅ body #faf8f5 暖纸底；c1s2 目录未引用 --primary（仅全局 styles.css 定义，c1s2 未用）；无冷蓝底

## 截图清单
- c1s2-qa-explain-desktop.jpg（交互后：航天tab+扶梯静止徽章）
- c1s2-qa-exp-motion-desktop.jpg（蜗牛回放 t=1.5s+定义卡揭示）
- c1s2-qa-exp-reference-desktop.jpg（双任务完成+金/青环）
- c1s2-qa-exp-train-desktop.jpg（CONCLUSION 态，旁车参照=运动）
- c1s2-qa-exp-harvester-desktop.jpg（收割机参照+印记开+t=5.0s）
- c1s2-qa-exp-harvester-desktop-1280.jpg（1280 回切无拉伸）
- c1s2-qa-quiz-desktop.jpg（基础题3判对反馈）
- c1s2-qa-quiz-mobile.jpg（390px tab 换行可达）
- c1s2-qa-exp-motion-mobile.jpg（390px 彗星场景）
- c1s2-qa-exp-harvester-mobile.jpg（390px pill 换行可达）
全部肉眼核验后落盘。

## 修复记录 D1/D2（2026-09-14）
- D1 exp-train.html：① info[VERIFY].text 改「📖 结论」；② setStep 删除 VERIFY 态隐藏 mainBtn 逻辑（pill 保持可见、按钮常驻）；③ pill handler 在 VERIFY 态改调 showConclusion() 实时刷新结论条，不再 setStep 推进状态机。CONCLUSION 仍仅由主按钮进入（卡滑入 .25s + ⟲ 再体验一次），结论文案未动。
- D2 exp-harvester.html：① 新增 .hint.locked{opacity:0;translateY(20px)} 初始类加在 #finalHint；② 新增 revealHint()，在 mainBtn click 与 pill click 现有 handler 各加一行调用，250ms ease 滑入后常驻；hint-bar 未动。
- 自测（browser，localhost:8902）：exp-train 走 SIT→FEEL→REVEAL→VERIFY，VERIFY 态 站台→静止/旁车→运动 往返3次 pill 不消失不跳态，「📖 结论」进 CONCLUSION、「⟲ 再体验一次」回初始；exp-harvester 首屏 #finalHint computed opacity=0，点「▶ 出发」后 opacity=1 滑入，切 pill 结论条联动正常（运稻车→双静止）；两页 window error 0、console 无 JS 报错（仅一次误导航 404，非页面问题）。截图：docs/qa_screenshots/c1s2-fix-d1.jpg、c1s2-fix-d2.jpg。
- D3 按总经理决策不修，common.css 未动。

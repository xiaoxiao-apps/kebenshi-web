# c2s1「声音的产生与传播」浏览器全量质检报告

- 日期：2026-09-17
- 服务：http://localhost:8901/content/physics_g8_v1_c2_s1/
- 范围：14 页（index/explain/experiment/quiz/summary + 9 个交互实验页）

## 1. index.html
- console errors: 0
- 导航：4 卡片链接齐全（explain/experiment/quiz/summary），href 均存在
- 截图：c2s1_index.png（桌面 1200px，卡片布局正常）
- ❌ 0 / ⚠️ 0
## 2. explain.html
- console errors: 0
- Tab 单显：依次点击 ②③④①，activeTabs 恒=1、activePanes 恒=1，切换正确
- 表2.1-1 十二格全对：331/340/346/500/1324/1500/1531/3230/3750/3810/5000/5200 ✅
- 文案：15 ℃时空气中的声速是340 m/s ✅；回声阈值「大于0.1 s」徽章 ✅
- 返回按钮「‹ 返回本节」存在
- 截图：c2s1_explain.png（Tab④+表2.1-1）
- ❌ 0 / ⚠️ 0
## 3. experiment.html
- console errors: 0
- 9 卡片链接齐全：exp-vibrate/vacuum/wave/amp/medium/speed/echo/bone/dual .html 均存在 ✅
- 返回按钮存在；截图 c2s1_experiment.png（9 卡片网格正常）
- ❌ 0 / ⚠️ 0
## 4. quiz.html
- console errors: 0
- 题干逐字比对 P36：①~⑥ 全部与 transcript P36「练习与应用」逐字一致（含⑥「约1.5 s后听到回声」及脚注①）✅
- 判分：④选「2 次」→ opt.right、计数 1/6；选「1 次」→ opt.wrong ✅
- ⑥输入 255 → 「✅ 正确！s = v·t ÷ 2 = 340 × 1.5 ÷ 2 = 255 m」；输入 300 → 「❌ 再想想：回声走过的路程是…」✅
- 防剧透：.answer 默认 hidden=true，点「示例要点」才展开 ✅
- 全序列 答→重置→再答：2/6 → 重置 0/6（答案收起、选项复位）→ 再答 255 → 1/6 且 ✅，无重复计数 ✅
- 截图：c2s1_quiz.png
- ❌ 0 / ⚠️ 0
## 5. summary.html
- console errors: 0
- 4 导图 Tab 单显：切 ①②③④ 各态 map-tab.on=1、map-panel.on=1 ✅
- 数值抽查：340、0.1 s 均出现；③ 声速分支含「15 ℃ 空气中声速 v = 340」✅
- 返回按钮存在
- ❌ 0 / ⚠️ 0
## 6. exp-vibrate.html
- console errors: 0
- slider 联动：振幅 60→90、松紧 50→20（适中→松），读数实时更新 ✅
- 按钮：拨动→「振动中嗡嗡作响 🔊」；按住→停止振动 ✅
- 截图：c2s1_exp_vibrate.png（振动中状态）
- ❌ 0 / ⚠️ 0
## 7. exp-vacuum.html
- console errors: 0
- slider 联动：空气量 100→30→0，状态「铃声正常🔔→铃声变小🔉→几乎无声🔇」，波形变平、显示「无声（真空）」✅
- 声音开关按钮：开→关 标签切换 ✅
- 截图：c2s1_exp_vacuum.png（0% 真空终态）
- ❌ 0 / ⚠️ 0
## 8. exp-wave.html
- console errors: 0
- 敲鼓→canvas 动画运行；暂停→canvas 冻结（frozen=true）、按钮变「▶ 继续」；继续→恢复 ✅
- slider 频率联动：90→「频率：高 — 疏密带排得密（波长短）」；10→「频率：低 — 排得疏（波长长）」✅
- 截图：c2s1_exp_wave.png（疏密波+水波分屏）
- ❌ 0 / ⚠️ 0
## 9. exp-amp.html
- console errors: 0
- slider 敲鼓力度 30→90 读数联动 ✅；敲一下/音叉点水按钮触发状态文案（纸屑跳/水花溅）✅
- 想一想判分：正确项「鼓面微小振动→碎纸屑跳动」opt.right + 「答对了！」；错项 opt.dim ✅
- 截图：c2s1_exp_amp.png
- ❌ 0 / ⚠️ 0
## 10. exp-medium.html
- console errors: 0
- 路径切换：空气路径/耳贴桌面 按钮切换，敲击后响度条联动（耳贴桌面 约68 dB 示意、文案「更响更清楚」）✅
- 翻卡：4 介质卡可翻面（真空卡显示「✗ 不能传声」），气体卡含「15 ℃ 空气中声速 340 m/s」✅
- 截图：c2s1_exp_medium.png（耳贴桌面+翻卡态）
- ❌ 0 / ⚠️ 0
## 11. exp-speed.html
- console errors: 0
- 原表核对：表2.1-1 十二格数值全对（331/340/346/500/1324/1500/1531/3230/3750/3810/5000/5200）✅
- 排序挑战：按 331→5200 顺序点满 12 槽 → 「🎉 全部排对！从最小 331 到最大 5 200 m/s」+ 规律揭晓 ✅
- 判错：重新排后先点 5200 → 「❌ 这张比第 1 名大，再找找更小的」且不入槽（已排 1/12 仅含 331）✅
- 截图：c2s1_exp_speed.png（重置后+❌反馈态）
- ❌ 0 / ⚠️ 0
## 12. exp-echo.html
- console errors: 0
- 正向 slider 联动：10 m→混响（<0.1 s 不分回声）；50 m→0.29 s 清晰回声；200 m→0.71 s（t=2d/340 计算正确）✅；阈值文案「晚于 0.1 s 才分得出回声」✅
- 反向判分：1.5 s 题输入 255 → 「✅ 正确！s = v·t ÷ 2 = 340 × 1.5 ÷ 2 = 约 255 m」；输入 100 → ❌ 引导 ✅；换一题→1.2 s 新题 ✅
- 空输入提交 → 「请先输入答案（单位 m）」守卫 ✅
- 截图：c2s1_exp_echo.png（反向挑战态）
- ❌ 0 / ⚠️ 0
## 13. exp-bone.html
- console errors: 0
- 塞耳开关：checkbox 切换「未塞耳：空气传声正常」↔「已塞耳：空气路径被堵住」✅
- 状态机：敲击+抵下巴（塞耳）→「🔊 能清楚听到音叉声！（…骨传导）」；未塞耳+移开→「🔇 音叉没在振动」衰减提示 ✅
- 四部位按钮（移开/下巴/前额/耳后）切换正常，传导路径图联动
- 截图：c2s1_exp_bone.png（移开终态+路径图）
- ❌ 0 / ⚠️ 0
## 14. exp-dual.html
- console errors: 0
- 数值：铁 5 200 m/s、空气 340 m/s ✅；临界 ≈36.4 m ✅
- 竞速计算抽查：100 m → Δt=0.275 s>0.1 s → 2 次；60 m → t₁=0.012 s、t₂=0.176 s、Δt=0.165 s（手算 60/5200=0.0115、60/340=0.1765 一致）→「听到 2 次敲打声（先铁管、后空气）」✅；短管 20 m → 合并 1 次 ✅
- slider/数值框/三预设按钮联动正常
- 截图：c2s1_exp_dual.png（60 m 竞速终态）
- ❌ 0 / ⚠️ 0
## 15. 移动端抽查（390×844，iPhone 12 模拟）
- index / explain / quiz / exp-echo / exp-dual：document.scrollWidth 均 = 390，无横向溢出 ✅
- 截图：c2s1_m_exp_dual.png、c2s1_m_quiz.png（布局单列自适应正常）

## 16. 导航链路
- index 4 卡片 → explain/experiment/quiz/summary 全部可达 ✅
- experiment 9 卡片 → 9 个 exp-*.html 全部可达 ✅
- 返回按钮：explain/experiment/quiz/summary → index.html；9 个 exp 页 → experiment.html（data-back 支持 referrer 回退）；实测 quiz→index、exp-vibrate→experiment 点击跳转正常 ✅

## 汇总表
| 级别 | 数量 |
|------|------|
| ❌ 阻断 | 0 |
| ⚠️ 非阻断 | 0 |

- 14 页 console errors 全部为 0，无 404
- C 类数字抽查全部通过：340 m/s（15℃）、>0.1 s 阈值、表2.1-1 十二格、练习⑥=255、铁 5200 vs 空气 340
- quiz ①~⑥ 题干与 transcript P36 逐字一致；判分/重置/防剧透全通过
- 截图 15 张存 docs/qa_screenshots/c2s1_*.png

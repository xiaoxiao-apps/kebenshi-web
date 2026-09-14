# c1s2 批4 开发报告（exp-motion + 全站打磨收尾）

日期：2026-09-14 · 开发员批4 · server 8902 复用未杀 · 未 git commit

## 一、exp-motion.html「位置在变吗——什么是机械运动」要点
- 首屏提示条常驻："点下方按钮，依次观察三种运动，找出它们的共同点"。
- 单主按钮状态机（按钮文字即进度）：▶ 观察彗星 → ▶ 观察猎豹 → ▶ 观察蜗牛 → 🤔 它们的共同点？→（三选一点选）→ 📖 看定义 → ⟲ 重新观察。播放中按钮变"⏳ 观察中…"并禁用，防连点。
- 点选过关：选"位置在变化"→ 绿框 450ms 后进入看定义；选错（颜色鲜艳/速度很快）→ 抖动 shake + 变红(--red/--red-bg) 650ms 自动复位，无弹窗。
- 三个 canvas 简笔场景（3-5s）：哈雷彗星夜空椭圆虚线轨迹+背阳彗尾，左上角标"哈雷彗星 · 约76年造访一次"；猎豹暖色草原飞奔（奔跑相位腿/速度线）；蜗牛叶上缓爬（螺旋壳/眼柄/叶脉）。
- 等时间间隔打点拖尾：每实例 9 点，播放中只显示已过时刻的点，播完/回放显示全部；当前时刻最近点描高亮环（暗示"位置随时间变化"）。
- slider scrub：实例播完后 tl-row 250ms 滑入成为该实例回放轴（t = x.x s 标签），拖动回看任意时刻，轨迹点同步高亮；播放中隐藏防误拖。
- 定义卡片防剧透：过关前隐藏；点"📖 看定义"后 250ms ease 从下方滑入，文案逐字教材第17页："在物理学中，我们把物体位置随时间的变化叫作机械运动（mechanical motion）。"
- 所有状态切换 250ms（stage 背景色、tl-row、quiz-area、def-card 均 transition/animation）；浮动钮仅全屏 1 个（+顶部 back-btn）。
- 自测：curl 200；browser 走完全部状态机，含故意选错一次（wrong 类生效+自动复位确认）；scrub 到 t=1.6s 标签正确；console 0 报错。

## 二、全站打磨修改清单（逐条，只修不重写）
1. exp-reference.html：场景底色 #e8f0f8（冷蓝）→ var(--brown-bg)，消除唯一冷蓝底。
2. experiment.html：收割机卡片 icon 为空（`<div class="icon quiz"></div>`）→ 补 🚜。
3. explain.html：易错点 tab 切换/揭晓为 display 硬切 → .tab-btn 加 transition .25s，.myth-card/.reveal .answer 加 mythIn 250ms 淡入动画。
4. exp-train.html：参照物 pill 区 show 硬切 → 加 pillsIn 250ms 动画。
5. exp-motion.html：点选区 show 硬切 → 加 quizIn 250ms 动画（新建时即含）。
6. common.css：全局 `input[type=range]{min-height:28px}`，quiz 题3 slider 触控高 16→28px（轨道视觉不变），harvester slider 同步受益。
7. exp-motion 猎豹终点跑出画面（t=3.0 时 x 超出右缘）→ 终点收到 W*0.86，播完仍可见。
8. 合规复核通过：6+2 页提示条（4 个 exp 页常驻 hint-bar）、导航仅顶部 back-btn+nav-grid、浮动钮≤2、无 --primary、CSS 变量全在白名单（grep 核验）、index 副标题与 experiment 四卡链接与实际文件一致。

## 三、移动端 390×844 抽查
- 8 页逐页 document.scrollWidth==clientWidth，无横向溢出。
- quiz 题3 slider 触控高 28px、宽 207px 拇指可达；harvester 印记开关高 39px 达标。
- 截图存 docs/qa_screenshots/：c1s2-m-index.jpg / c1s2-m-quiz.jpg（题3 slider 区）/ c1s2-m-exp-harvester.jpg / c1s2-m-exp-motion.jpg，肉眼确认无溢出无重叠。

## 四、8 页 console 复查
index/explain/experiment/quiz/exp-motion/exp-reference/exp-train/exp-harvester 逐页打开并交互（quiz 全题走完含 doneRow 点亮、exp-train 状态机、exp-motion 全状态机），console 均 0 报错、window error 0。

## 五、遗留问题
- exp-motion 彗星/蜗牛场景为简笔风，彗尾为静态锥形（未做粒子），符合"不追求写实"要求。
- quiz 题3 完成判定需三问 pill 都点过（设计如此，已验证 doneRow 正常点亮）。
- 无其他已知缺陷。

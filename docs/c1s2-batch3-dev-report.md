# c1s2 批3 开发报告：quiz.html + exp-harvester.html

日期：2026-09-14 ｜ 开发员：批3 ｜ 依据：docs/c1s2-textbook-analysis.md §3.4/§3.6 + c1s2-transcript.md「练习与应用」

## 产出文件
1. `content/physics_g8_v1_c1_s2/quiz.html`（约 560 行，页内 3 段 script）
2. `content/physics_g8_v1_c1_s2/exp-harvester.html`（约 380 行，页内 1 段 script）

## quiz.html 实现要点（§3.6）
- 顶部 pill 导航 5 组：①行李架 ②社戏连山 ③空间站对接 ④观光电梯 基础选择；各题独立卡片单显（.qcard.active 切换 + fadeIn 250ms），完成自动点亮导航 pill（绿）。
- 题1：四参照物行 × 静止/运动按钮；点错行抖动+提示、点对锁定该行；🧳徽章实时翻转（flip 动画）；4 行全对「完成」chip 自动亮绿。无检查按钮。
- 题2：选项 pill（4 个）+「船在前进中…」常驻情境提示条；答案默认遮盖（cover-card 虚线卡），点击揭晓并回判所选；揭晓后 pill 锁死、正确项高亮。
- 题3：canvas 联动工具——slider 0~100% 驱动 梦天靠近→对接→转位"T"字（easeInOut 插值）；▶播放/⏸/⟲重置；三问 pill，结论徽章随 slider 阶段实时变（运动红/静止绿/--wait 灰提示"尚未对接完成"）；三问都看过才记完成。全屏钮复用 FullscreenHelper。
- 题4：简答自评卡，参考答默认遮盖点击揭晓，揭晓后出现「😊 我明白了」自评钮，点击记完成。
- 基础选择 3 题（机械运动辨析/参照物说法/公交车静止参照物），沿用 c1s1 `.opt/.right/.wrong/.dim + .fb-text` 判分反馈样式。
- 全部完成显示 doneRow 汇总。

## exp-harvester.html 实现要点（§3.4）
- 首屏提示条常驻（hint-bar）；金黄稻田横向卷轴：暖色天空渐变+太阳+稻丛随世界坐标滚动（取模循环），无冷蓝底。
- 参照物三选 pill（地面/收割机/运稻车）：地面=镜头半速跟拍、两车都动背景滚动；收割机=相机锁定收割机居中、运稻车纹丝不动；运稻车反之。pill 切换 250ms 相机插值（camBlend easeInOut），不瞬移。
- 时间轴 slider（0~10s，核心）：拖到任意 t 两车跳到该时刻位置；播放中拖动自动暂停。
- 位置印记开关：每 1s 在两车下方打点；点坐标 = 车位置(s) − 参照物位置(s) + 参照物位置(t) − 相机，切换参照物时印记跟随坐标系变换——以收割机看运稻车的点原地重叠。图例半透明底置顶中，避免与点/太阳重叠。
- 主按钮状态机：▶ 出发 → ⏸ 暂停/▶ 继续 → 结束变「▶ 重新出发」；⟲ 重置回 t=0。
- 结论条实时联动：以 X 为参照物，收割机/运稻车 动/静徽章（静止 --green-hi，运动 --red）+ 一句解释。
- 首帧 pill 脉冲指引（.guide，点击后清除）；浮动钮仅 fullscreen + back（exp-back.js/fullscreen.js）。

## 工程合规
- CSS 仅用 common.css 白名单变量（含 --cyan-hi/--green-hi/--gold），无 --primary；局部样式全在页内 <style>。
- 未触碰其他文件（exp-train.html 未动）；未 git commit；8902 server 未杀。
- 骨架沿用 c1s1/c1s2：common.css + fullscreen.js + exp-common.js(fitCanvas/roundRectPath/getCssH) + exp-back.js。

## 自测记录
- curl：quiz.html 200、exp-harvester.html 200。
- quiz：题1 错→对全流程、徽章翻转、完成点亮；题2 选对+揭晓；题3 canvas 878px、t0/85/100 三问徽章联动、播放到 100% 自动停、重置归零、三问后记完成；题4 揭晓+自评；基础 3 题判分（错/对/对）；doneRow 出现。window error 监听 []，console error 空。
- harvester：出发→2.5s→暂停→scrub t=5→开印记→三轮参照物切换结论正确（地面双动/收割机双静/运稻车双静）→播到 10s 结束→重置；印记坐标系变换目视确认（以收割机看运稻车点原地重叠）。window error []，console error 空。
- 截图（结束态，肉眼确认无布局破损）：docs/qa_screenshots/c1s2-quiz-h.jpg、c1s2-harvester-h.jpg。
- 修复记录：①quiz 基础题 opts 数组括号笔误（node --check 捕获）；②题3 问①/问②结论与阶段语义不符→改为阶段感知文案+--wait 徽章；③卡片隐藏时 canvas 宽 0→showCard 派发 resize；④harvester 结论徽章逻辑反了（以收割机为参照物运稻车误显运动）→改为 refObj==='ground' 才双动；⑤印记图例与点重叠→移顶部居中半透明底；⑥scrub 后主按钮文案未更新→input 内 updateMainBtn。

## 遗留/说明
- 题3 canvas 为简化示意（舱体+太阳能板+地球弧线），非贴图。
- 未做 localStorage 进度记忆（与 c1s1 quiz 一致，无记忆）。

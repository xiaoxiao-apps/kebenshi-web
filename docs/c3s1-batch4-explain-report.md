# c3s1「温度」explain 整合批 G（第三派）报告

日期：2026-09-21 ｜ 执行：子代理 ｜ 范围：仅 `content/physics_g8_v1_c3_s1/` 内 explain.html 与 img/

## 一、真图替换（3 处占位 → 教材照片裁切）

来源：`可交互教材/c3s12_photos/`（A 级来源命中，未走 SVG 兜底）。
流程：view_image 定位 → PIL `exif_transpose`（照片 EXIF 旋转 90°，不校正会裁错）→ 裁切 → `rotate(90, expand=True)` 正立 → 抹除周边正文/页码（逐轮 view_image 复核边缘）→ 宽≤1200px、quality 80 落盘 img/。

| 图号 | 文件 | 尺寸 | 大小 | 说明 |
|---|---|---|---|---|
| 3.1-2 | img/fig312_homemade_thermometer.jpg | 390×445 | 12KB | 小瓶+色水+细管橡皮塞，含原图注，裁掉右侧"橡皮塞上插"正文残字 |
| 3.1-4 | img/fig314_measuring_water.jpg | 1200×490 | 62KB | 四烧杯测冷/温/热水+读数视线示意+原图注，裁掉顶行正文 |
| 3.1-5 | img/fig315_clinical_constriction.jpg | 550×560 | 32KB | 体温计+缩口圆特写+原图注两行，裁掉顶部"体/接/最初"残字 |

explain.html 三处 figbox 内插入 `<img src="img/...">`（alt 齐备），原 figcap 图注保留。

## 二、想一想按规则 10 改造（4 条逐条判断）

1. **自制温度计原理** → **直跳** `exp-expand.html?from=explain&tab=t1`。理由：热胀冷缩是微观体积变化，3D 微观动画能把"看不见"的分子运动可视化，交互确能帮助理解；details 换成 thinkbox（题干保留）+醒目棕色按钮。
2. **为何不能用水银温度计测太阳表面温度** → **保持折叠+详细答案**。理由：纯量程/沸点概念，讲清楚即可，无需交互。答案扩为四段：量程定义与实验室水银计约 -20～110℃、水银沸点 357℃ 超温汽化胀破、该用热电偶/辐射温度计、"量程匹配"类比记忆（匹配知识补充，符合规则 2 补充解读）。
3. **拿出来读数准不准** → **直跳** `exp-use.html?from=explain&tab=t3`。理由：对错需动手测了才信服，exp-use 正是"测量+拿出对比"交互。
4. **体温计为何可离体读数** → **直跳** `exp-clinical.html?from=explain&tab=t4`。理由：缩口断柱是动态过程，3D 演示比文字直观。

直跳写法参照 c2s3 惯例：题干保留在 `.thinkbox .q`，按钮 `.btn.btn-brown`（common.css 既有类），链接带 `from=explain&tab=tX`；exp-back.js 守恒逻辑未动，返回仍回 explain 对应 Tab。

## 三、压缩 img/thermometers_electronic.jpg

4032×3024 / 3.1MB → 1200×900 / 145KB（quality 80，覆盖原文件名，quiz.html 引用路径不变）。

## 四、自查结果

- HTML 首尾完整（`<!DOCTYPE html>` 起、`</html>` 止）；标签栈平衡校验 unclosed=[] mismatch=[]。
- grep 直跳链接 3 条均带 `from=explain&tab=`（t1/t3/t4）。
- `details.think` 仅剩 1 个（想一想2，折叠详细版），符合预期。
- `ls -la img/`：12KB / 62KB / 32KB / 145KB，全部 <500KB、宽≤1200px。
- 未触碰：quiz.html/quiz.js/experiment.html/exp-*/summary.html/index.html/4 共用文件/three.min.js；`c3s1_explain_tab` key 原样；无 git 操作。

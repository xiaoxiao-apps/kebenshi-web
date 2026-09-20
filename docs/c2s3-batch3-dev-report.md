# c2s3「声的利用」Batch3 练习区开发报告

- 日期：2026-09-19
- 范围：仅 `content/physics_g8_v1_c2_s3/quiz.html`（占位页整体替换）+ 本报告
- 未触碰：explain.html / experiment.html / exp-* / 根目录 app.js；未 git commit

## 文件

| 文件 | 行数 | 状态 |
|------|------|------|
| content/physics_g8_v1_c2_s3/quiz.html | 301 | 完成（原 29 行占位页替换） |

分 3 段落盘：108 → 155 → 301 行，每段 wc -l 严格递增；head -1 = `<!DOCTYPE html>`，tail -1 = `</html>`。

## 5 题覆盖与判分方式

1. **第①题（计算判分）**：超声测位仪回声测深。input（inputmode=decimal）+ 单位 m + 提交判分按钮；剥非数字后 parseFloat，|val−3000|≤10 判对；讲解强调 4 s 是往返时间须除以 2（s = v·t/2 = 1 500 m/s × 4 s ÷ 2 = 3 000 m）。
2. **第②题（match-row 分类判分）**：声传信息/传能量 4 例，每行两个按钮，选错即时标 wrong 并亮出正确项；4 行全答后 feedback 计分（全对 ✅ / 答对 N/4 ❌）。答案：(1)(2)(3) 信息，(4) 能量。
3. **第③题（开放题）**：生活举例。仅「示例要点」reveal-btn + answer（雷声知雨→信息；超声波加湿器/清洗眼镜→能量），附自查两要素（具体例子 + 信息还是能量）。
4. **第④题（开放题·查阅资料）**：古代建筑声学实例。示例要点卡：回音壁（贴光滑圆墙连续反射传远）、三音石（不同石块拍手回声次数不同）、圜丘天心石（回声约 0.07 s 返回与原声相混），鼓励查阅石琴、莺莺塔资料。
5. **第⑤题（计算判分 + 单位二选一）**：音乐公路凹槽间距。input + 单位按钮 m/cm（选中高亮）；选 m 时 |val−0.038|≤0.002 判对，选 cm 时 |val−3.8|≤0.2 判对；未选单位提示先选；讲解：54 km/h = 15 m/s，λ = v ÷ f = 15 m/s ÷ 392 Hz ≈ 0.038 m ≈ 3.8 cm。

## 页面结构

- 顶部 sticky scorebar「已答 N/5」+ 🔄 重置按钮 + doneBanner（全部完成后显示客观题得分 ①②⑤ 共 x/3 + 开放题③④自查提示）。
- reveal-btn 作答门禁：①②⑤未作答点击提示「✋ 请先作答本题」（1.5 s 恢复）；③④开放题直接可点。
- 保留 `<a class="back-btn" href="index.html">‹ 返回本节导航</a>`、尾部 `<script src="exp-back.js"></script>`；判分 JS 为自包含 IIFE，重置逻辑清空全部状态（answered/判分变量/输入框/feedback/right·wrong·sel·open 类/reveal 按钮文字）。

## 自查结果

| 项目 | 结果 |
|------|------|
| 题干逐字比对（脚本 vs transcript P48） | ①②③④⑤ 全部 VERBATIM_OK（去空白逐字符比对，④已剔除插图注释行） |
| 数字清单 | 4 s / 1 500 m/s / 3 000 m / 54 km/h / 392 Hz / 0.038 m / 3.8 cm / 约 0.07 s 均在页面出现，空格分节写法与转录一致 |
| 判分 JS 语法 | 抽取至 /tmp/qcheck.js（141 行）node --check 通过，临时文件已删 |
| 标签平衡 | div 55/55、button 18/18、script 2/2 |
| 结构元素 | qcard ×5、match-row(data-ans) ×4、back-btn ×1、exp-back.js 引用 ×1 |
| HTML 首尾 | head -1 `<!DOCTYPE html>`，tail -1 `</html>` |

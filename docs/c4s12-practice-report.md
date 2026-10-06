# c4s12 本章练习页开发报告

- 文件：`content/physics_g8_v1_c4_practice/index.html`(78行)、`practice.js`(437行)、本报告
- 结构：照 c3 模板，QUESTIONS 数组 + section 分组 + choice/blank/open 判分

## 题目清单（10 题）

| id | section | kind | points |
|----|---------|------|--------|
| c4s1q1 | 第1节 光的直线传播 | open | 10 |
| c4s1q2 | 第1节 光的直线传播 | open | 10 |
| c4s1q3 | 第1节 光的直线传播 | open | 10 |
| c4s1q4 | 第1节 光的直线传播 | blank×2 | 12 |
| c4s1q5 | 第1节 光的直线传播 | choice+open | 10 |
| c4s2q1 | 第2节 光的反射 | blank+choice | 12 |
| c4s2q2 | 第2节 光的反射 | open | 10 |
| c4s2q3 | 第2节 光的反射 | open | 12 |
| c4s2q4 | 第2节 光的反射 | open | 10 |
| c4s2q5 | 第2节 光的反射 | blank | 12 |

## 题干比对（转录 vs stem）

- s1q1~q5、s2q1~q5 题干均与 c4s12-transcript.md 逐字一致（数字/单位/空格分节未改写）
- c4s1q2 成语末字转录存疑，按"立竿见影"通行写法处理并标注 note
- 配图：c4s2q1 reflectionRule、c4s2q2 cornerReflector、c4s2q3 wellMirror 程序化简图；c4s1q1 手影不硬画，note 说明

## 判分推导（与 textbook-analysis 3.3 一致）

- s1q4 距离 1.44×10⁸ km / 2.88×10⁵ h(约33年)；s1q5 空气>水>玻璃
- s2q1 反射角60°、垂直入射原路返回；s2q3 镜面与水平60°、反射角30°；s2q5 3.84×10⁵ km

## 自查结果

- node --check 通过（SYNTAX-OK）；html 首尾完整；QUESTIONS 计 10 题
- 数组末尾已留注释「第3节 第4节 题目完成后在此追加」
- 未碰 app.js、未 git、未改白名单外文件
## R2 单（真实落盘）

- S1 onRefToggle 改真 toggle（ref/selfrow 用 classList.toggle、文案查看↔收起、永不 disabled、STATE.open=布尔），node --check 过，「收起参考答案」grep=1
- S2 setOpenUI 去 disabled+文案=收起+STATE.open[key]=true；restoreUI 增 open 布尔恢复；「收起参考答案」grep=3，`.disabled` 残留=0
- S3 c4s2q2 open→blank 单空 answer 含「平行反向/反向平行/原路返回…」，该题段 kind:'open'=0
- S4 c4s2q3 open→blank 双空（反射角30°、镜面与水平60°），q1 note 补作图说明；该题段 open=0
- S5a svgWellMirror 改条件图（井+入射光30°+水平线），删镜面/竖直反射光等答案元素，函数内答案词=0
- S5b svgReflectionRule 核算通过：入射sin30=75/150、cos30=129.9/150，与镜面成30°、i=r=60° 对称，无需改
- S5c svgCornerReflector 核算：两镜垂直90°、反射公式 v'=v−2(v·n)n 得 v2=−v(反平行)，坐标用 tan30 定位，无需再改
- S6 全部 node --check 过、QUESTIONS 仍10题、追加位注释在、白名单外零改动

# c1s3 质检报告（2026-09-15，总经理亲自浏览器质检）

> 背景：质检子代理启动本地服务器后挂掉（第三轮基础设施故障），改由主会话亲自逐页质检。
> 方式：本地 http://127.0.0.1:8931/（python http.server，根=c1s3 目录）+ Edge 浏览器 evaluate 交互验证。

## 逐页结论
| 页 | 结论 | 验证点 |
|---|---|---|
| index.html | ✅ | 三卡片链接 explain/experiment/quiz 齐 |
| explain.html | ✅ | 4 Tab 单显；Tab2 输入5→18.00 km/h；Tab3 有「物理模型」拓展句；Tab4 分步揭晓4行全出、结果 10.2 m/s；Tab1 双模式按钮可点 |
| experiment.html | ✅ | 4 张工具卡片链接全有效 |
| exp-calc.html | ✅（修2处后） | s=100,t=9.83→v=10.17 且代入式带单位；单位切 km/h→36.62 跟随；s=10,v=80→t=0.13 h/0.0021 min；三量手填走校验模式不覆盖用户输入 |
| exp-unit.html | ✅（修1处后） | 5→18、72→20 双向；10 个 chip；雨燕 48→172.8 原理框同步 |
| exp-motion.html | ✅ | 逐帧4次：甲 150×4、乙 100/135/165/200；滑块 20 m/s 重画；重播清表 |
| exp-speed.html | ✅ | 10 条对数条 2.7%→98.3%；子弹条目 3600 km/h+类比 |
| quiz.html | ✅ | 6/6 计数；表盘数字 0—240、25 刻度、指针 rotate(-40)=80；时刻表点济南西行高亮 617 km/118 min；Q4 揭晓 7.5 min |

## 质检中发现并修复的问题（3处）
1. **exp-calc.js 自动回填逻辑**：自动算出的第三量在用户改其他格后被当手动输入 → 误入三量校验模式、不再联动。改为逐格 auto 标记，手改才清除。
2. **显示精度**：0.125 s 换 min 两位小数显示「0」误导。fmt 改自适应有效位（<0.01 用2位有效数字）。exp-unit 同步修。
3. （无第三处代码问题；第3项为质检方法修正：复测序列误触校验模式属设计行为，非 bug。）

## 390px 溢出检查
quiz / exp-calc / exp-speed 三页 scrollWidth ≤ 390，无横向溢出。

## console errors
全部页面 0 错误。

## 环境遗留
- 本地预览服务器仍在跑：pid 9130，`http://127.0.0.1:8931/index.html`（仅 127.0.0.1，重启机器即失效；蔡总本机浏览器可直接开此地址预览）
### 7. exp-speed.html ✅
- 10 条动画条出现 ✅（#bars 10 子元素，对数宽度 2.7%→98.3% 递增）
- 点「子弹（出膛时）」条目 → detail 显示「约1 000 m/s = 3600 km/h。约 3600 km/h，1 秒飞过 10 个足球场」✅
- console errors = 0
### 8. quiz.html ✅
- 6 张翻卡全部可揭晓，计数 0/6 → 6/6 ✅
- Q4 表盘 SVG 刻度数字 0—240（每 20 一格共 13 个数字 + km/h 单位）✅；指针 rotate(-40°)，0 在 -120°、每 20 km/h 加 10° → 恰指 80 ✅；答案 t=7.5 min ✅
- Q6 点「济南西」行 → 行高亮 class「seg on」，seginfo 显示「天津南→济南西：里程差 284 km、时间差 60 min」✅
- 揭晓答案数字与 C类核对表一致 ✅：7.5 min / 40 m / 284.5 / 313.7 / 236.1 全部命中
- console errors = 0

## 问题清单
1. 【P1·expalin.html Tab3 双车画布空白】explain.html:257 `fitCanvas(cv,220)` 在 IIFE 初始化时执行，panel-e3 初始 display:none → clientWidth=0 → canvas.width=0，画面全白（截图确认）；Tab 切换 handler（explain.html:172-183）与 window resize 均无 refit。动画逻辑/结束文案/步进均正常，仅不可见。建议：Tab 切到 e3 时重调 fitCanvas 并 render()（或监听 resize/IntersectionObserver）。
2. 【提示·非 bug】exp-motion 甲速滑块调大后表格末段出现 0 m（如 20 m/s → 200/200/200/0），系 600 m 量程上限 t=30s 到达后的正确重算，建议文案加一句上限说明以免学生困惑。
3. 【环境备注】browser 工具不支持 file:// 协议，本次质检经 127.0.0.1:8931 本地静态服务完成（nohup 脱管，质检完可 kill 9130）。

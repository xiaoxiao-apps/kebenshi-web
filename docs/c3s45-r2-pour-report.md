# c3_s4《升华凝华观察站》R2 改造报告

## 改造项
- 阶段A：删除模式②「粒子实验室」全模块（5处清理）
- 阶段B：模式①碘演示改为「双水杯拖拽/按钮浇淋」交互

## 改动文件与行数
| 文件 | 行数 | 说明 |
|------|------|------|
| exp-subl.html | 177 | 删 pill②/soon-overlay，改 frost 为②，挂载 pour.js，?v=5 |
| exp-subl.js | 191 | 去 lab 分支；按钮改调 SublimationPour.playPour；接 init/reset/setMode |
| exp-subl-core.js | 336 | animate 调用 SublimationPour.update；加 coldTemp=20 |
| exp-subl-audio.js | 129 | 删 playLabSublime/playLabDeposit；新增 playPourWater |
| exp-subl-pour.js | 396 | 新建：双杯建模、蒸汽、hover、拖拽、倾倒动画、水流/壁流 |
| exp-subl-lab.js | — | trash 删除 |

## 语法/静态检查
- `node --check` 通过：html 以外的 5 个 JS 全部 OK
- `grep -i lab\|SublimationLab\|playLab` 在 s4 文件内零命中（label 等无关词除外）
- 无 CDN/外链
- 未 git commit

## 浏览器验收（?v=r2verify）
- 页面加载 errors=0
- pill 只剩「① 碘的演示」「② 易拉罐制霜」
- hover 热水杯 → 浮窗「热水 约80℃」；改 select 为 100℃ → 实时变「100℃」
- 点「浇热水」→ 水杯自动倾倒→紫蒸气升腾，state.phase='sublimate'，vapor→1.00
- 拖拽凉水杯到罐上释放→ 倾倒动画→凝华回落，state.phase='deposit'，vapor→0.00，wallCrystal→1.00
- 模式②制霜：搅拌→温度跌破0℃（验收时到 -3.7℃）→结论卡出现，回归零问题
- 返回模式①后水杯原位、蒸汽持续

## 未改动
- exp-subl-frost.js 实现未动
- 碘升华/凝华物理参数未动（仅触发方式改由浇淋动画触发）
- 根目录 app.js、c3_s4 与 docs 之外文件未改

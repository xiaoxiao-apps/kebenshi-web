# c3s3 阶段三 液化探究 开发报告（s26→s27b）

## 通道记录
- 首单 DeepSeek（01:59）：工具中断，纯文本侦察跑完零落盘。
- 重派 DeepSeek（02:01）：骨架落盘（exp-liquefy-core.js/exp-liquefy.js 签名+空实现）后工具中断。
- 续单 kimi（02:13）：接骨架填充完成全部实现。
- 主会话验收修补（s27→s27b）：修 B1 白气主循环钩子（见下）+补本报告。

## 变更文件
- exp-vapor.html：③tab 去 disabled 改「③ 液化探究」、#liquefy-panel/#data-liquefy 容器、双 script、v=s26→s27。
- exp-vapor.js：switchMode 加 liquefy 分支、init 调 initLiquefyDom()。
- exp-liquefy-core.js（新建 325 行）：buildLiquefyScene/updateLiquefy/switchLiquefyScene + B1/B2/B3/C 四场景 3D。
- exp-liquefy.js（新建 155 行）：场景切换、滑杆/按钮绑定、calcLiquefyHeat/renderHeatCompare、借道 updateEvapScene 钩子。
- exp-vapor.css：追加液化按钮/热量 bar 样式。

## 场景实现
- B1 冬天呼白气：人头侧面（sphere+cone 鼻口+mouth）呼出 90 粒 InstancedMesh 白雾，出口减速聚团；环境温度滑杆 -10~30℃，density=(30-T)/40 反比联动 opacity/scale。
- B2 眼镜蒙水珠：双圆环镜片+横梁；「从室外进屋」按钮触发水珠层 opacity 0→0.8 渐增+提示文字。
- B3 草叶露珠：草叶 plane 群；「夜→晨」按钮叶尖露珠 scale 0→可见、灯色变暖。
- C 压缩体积液化：石油气钢瓶+活塞下压 2s，橙色气体粒子聚成底部蓝色液层；火箭液氢液氧双罐并列；标签「压缩体积可以使气体液化」。
- D 液化放热对比：Q1=c·m·ΔT=2.65e5 J、Q2=L·m+Q1=2.52e6 J（L=2.26e6, c=4.2e3, m=1kg, 100→37℃）；双 bar（Q2 满幅/Q1≈10.5%）+结论「水蒸气烫伤更严重：多放出液化热」。

## 自查与验收
- node --check：exp-liquefy-core.js/exp-liquefy.js/exp-vapor.js 全过。
- 数值冒烟：Q1=2.65e+5、Q2=2.52e+6、ratio=9.54 ✓。
- 浏览器（t47）：③tab 启用、panel 显示、九按钮齐全、四场景切换、滑杆 -10 联动、热量 DOM 文案数值正确、errors=0。
- ①②零回归：boil/evap 组可见性、boil-panel、纸锅 sub-tab/paperPotMesh 全在。
- 主会话修补 s27b：B1 白气不显根因=exp-vapor-core.js 主循环仅 evap 模式调 updateEvapScene，liquefy 借道钩子不执行；改主循环分支为 `evap||liquefy||gallery` 后实测主循环推进粒子矩阵、滑杆联动 opacity 0.26@25℃→0.70@-10℃ ✓。

## 遗留
- 无功能遗留；B1 人头模型偏小（视觉可后续打磨）。

## R25b 收尾（2026-09-28）
- 液化底部提示串台：exp-vapor.js switchMode 强制 #lq-phase-hint 在非液化模式 display:none、液化模式 display:''，压住 liquefy-core update 循环移除 hidden 类导致的重显；exp-vapor.html 初始 class 保持 hidden。
- 长廊残留清理：exp-gallery-core.js/exp-gallery.js 已删除；exp-vapor.js 中 gallery 分支/变量已清空（grep gallery 零命中）。
- 12 物质沸点表迁移：summary.js「第3节 汽化和液化」blocks 末尾已追加「常见液体的沸点（1标准大气压）」表，含液态铁/铝/锡/铅/水银/水/酒精/液态氨/氧/氮/氢/氦；summary/index.html 无 v 参数，未改。
- 版本号：exp-vapor.html 全部引用 v=s45→s46。
- 自查：node --check exp-vapor.js/summary.js 通过；浏览器 v=s46 验证沸腾/蒸发底部无黑框、液化提示正常、tab 仅①②③、切换无报错、summary 第3节末尾出现沸点表、console errors=0。

## R25c 收尾（2026-09-28）
- 蒸发扇子风线改一次性 gust：exp-vapor-core.js 删循环风线，改 3 条 CatmullRomCurve3 长弧+末端 1.5~2 圈螺旋卷（中粗两端细、白色半透明带细暗边）；burst 状态机（triggerWindBurst，1.15~1.4s draw-on 渐显→扫过→渐隐），点一次扇子发一股、播完隐藏、连点重触发；fanBoost 物理衰减未动。
- 主会话验收：evaluate 触发 gust 慢放目视——长弧+螺旋卷从扇子侧扫向实验组盘子 ✓；播完 burst.active 归 false 不循环 ✓；蒸发态 #lq-phase-hint display:none ✓；console errors=0。

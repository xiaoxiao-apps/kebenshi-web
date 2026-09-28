# c3s3 阶段四 沸点长廊+应用馆 开发报告（s27b→s28）

## 通道记录
- 首单 DeepSeek（02:14）：完成钩子层+实现+自查（7m34s），但期间主会话误判其中断（02:16 磁盘尚无落盘=仍在读码阶段），多派 kimi 并发单。
- kimi 并发单（02:20）：落盘优先骨架覆盖回首单的两个 gallery 实现文件；主会话发现后立即 cancel。
- 实现单 DeepSeek（02:24）：钩子层（html/js/css 首单版本完好）基础上填回 exp-gallery-core.js/exp-gallery.js 实现+补借道钩子+别名对齐。
- 主会话验收（s28）：浏览器全验+目视截图+补本报告。

## 变更文件
- exp-vapor.html：④tab 去 disabled 改「④ 沸点长廊」、#gallery-panel 容器、双 script、v=s27b→s28（首单）。
- exp-vapor.js：init 调 initGalleryDom()/buildGalleryScene()、switchMode gallery 分支（panel 显隐+setGalleryGroupVisible+gallerySetTemp）（首单）。
- exp-vapor.css：.gallery-cards/.gallery-card/.gallery-card-badge/.card-gas/.card-liquid 等样式（首单）。
- exp-gallery-core.js（新建 204 行）：buildGalleryScene/updateGallery/gallerySetTemp/setGalleryVisible+别名 setGalleryGroupVisible；C 冰箱 3D（箱体+蒸发盘管蓝+冷凝盘管红+压缩机+制冷剂 InstancedMesh 闭环 4s+双标签）、D 热棒 3D（竖棒+冻土+散热片+液氨蓝升红降闭环 4s+双标签），冰箱 x=-8/热棒 x=+8 并列。
- exp-gallery.js（新建 73 行）：BOIL_POINTS 12 物质、initGalleryDom（滑块/◀▶步进绑定）、renderGalleryCards（卡片墙 innerHTML 渲染+液气徽章+边框变色）、文件尾 IIFE 借道 window.updateEvapScene 钩子推进 updateGallery。
- docs/c3s3-gallery-report.md：本报告（主会话补，实现单声称已写但磁盘缺失）。

## 功能与验收
- A 卡片墙：12 张（铁2750/铅1740/水银357/水100/酒精78/氨-33.5/氧-183/氮-196/氢-253/氦-269/锡2270/铝2467），浏览器实测 cardCount=12 ✓。
- B 滑块：-270~2800 步进1 默认25；四验收点实测全对（水101气/水99液/氧-150气/氧-200液）+2800 全气+-270 全液+温度文本联动+card-gas/card-liquid 边框类切换 ✓。
  （验收插曲：首轮测出「徽章不刷新」系主会话测试方法错误——cards 节点数组在 innerHTML 重渲染后失效；改每点重取 DOM 后全绿，非应用 bug。）
- C/D 双动画：两组 InstancedMesh 粒子，主循环实测位移（冰箱粒子 0.7s 位移明显、热棒粒子下降回流）；node 冒烟 300 帧位移 21.7、整周期回环偏差 0 ✓。
- 主循环钩子：exp-gallery.js 借道 updateEvapScene wrapper（core.js 主循环分支 s27b 已含 gallery）✓。
- 零回归：①沸腾/②蒸发（含纸锅）/③液化 切回全正常（组可见性+state.mode+paperPotMesh）✓；errors=0 ✓；node --check 三 js 全过 ✓。
- 目视截图：卡片网格+滑块+冰箱（白箱+蓝红盘管）+热棒（竖棒+散热片+冻土+蓝红粒子）+标签在位 ✓。

## 遗留（视觉打磨级，不阻塞）
- 3D 文字标签偏小（相机距离远）；④模式右侧数据面板为空框；冰箱/热棒模型较简。

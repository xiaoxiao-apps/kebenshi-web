# c3s1《温度》上线准备补丁报告（2026-09-22）

执行：子代理 c3s1_release_prep_r2 落盘 4 项改动后异常终止（未跑验证/未写报告），主会话接管验证与本报告。前序单 c3s1_release_prep 中途死亡零落盘。

## 改动（4 项）
1. 新建卡片页 `content/physics_g8_v1_c3_s1/index.html`：PhET 式实验卡片页（实验核心版首节），节标题「第1节 温度」+「温度实验室」卡（缩略图+简介），点卡直进 exp-temp-lab.html；样式全内联、iframe 内全屏无滚动条；阶段二卡片位以注释预留。
2. 缩略图 `content/physics_g8_v1_c3_s1/assets/thumb-templab.png`（136KB，取自 R3 验收截图 scale-front）。
3. 实验页返回按钮：exp-temp-lab.html 加 `#back-to-index`（fixed 左上、半透明、z-index 50），href=index.html；与温度计架（top:60px）不重叠。仅改该 html。
4. app.js AVAILABLE 登记 `'physics_g8_v1_c3_s1': { title: '温度', file: 'content/physics_g8_v1_c3_s1/index.html' }`（c2s5 行后）。node --check 过。

## 验证（主会话浏览器实测，本地 8901）
- 首页→物理→八年级上册→目录「第1节 温度」**无「即将上线」徽章**、可点（c3s2~c4s5 仍有徽章，未误伤）。
- iframe 链路三次取值（contentWindow.location）：
  1. 点目录条目 → `.../physics_g8_v1_c3_s1/index.html`
  2. 点卡片 → `.../physics_g8_v1_c3_s1/exp-temp-lab.html`
  3. 点「‹ 返回」→ `.../physics_g8_v1_c3_s1/index.html`（返回守恒闭合）
- 卡片页缩略图 img.naturalWidth>0；browser errors 0。

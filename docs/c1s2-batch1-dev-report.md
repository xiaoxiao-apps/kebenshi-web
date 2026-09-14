# c1s2 批1 开发报告

## 文件清单
content/physics_g8_v1_c1_s2/
├── common.css        (复制 c1s1，:root 追加 --cyan-hi、--green-hi)
├── exp-common.js     (复制 c1s1)
├── exp-back.js       (复制 c1s1)
├── fullscreen.js     (复制 c1s1)
├── index.html        (本节导航，3 卡：知识讲解/互动实验区/小练习)
├── experiment.html   (实验区入口，4 卡对应 4 个未来 exp 页)
└── explain.html      (知识讲解，6 块大纲内容)

## 复用 class 清单
- `.card`、`.chip`、`.tipbox`、`.steps`、`.mini-quiz`、`.myth-tabs/.tab-btn`、`.nav-grid/.nav-card`、`.page-header/.breadcrumb/.page-title/.page-subtitle`、`.back-btn`
- 新增局部 `<style>`：`.def-row/.def-card`、`.myth-deck/.myth-card`、`.badge`、`.reveal`

## 自测结果
- node --check 通过：exp-common.js / exp-back.js / fullscreen.js
- python3 -m http.server 8902 起后 curl 验证：index/explain/experiment/common.css/exp-common.js/exp-back.js/fullscreen.js 均 200
- server 已关闭

## 遗留问题
- quiz.html 及 4 个 exp 页（exp-motion/exp-reference/exp-train/exp-harvester）本批未建，链接指向未来文件名。

# c2s1 修复轮8 — 全屏「显示不全/没按钮」挨个排查修复（2026-09-17 23:0x）

子代理 edbf0ad1 完成根因 A/B 后静默死亡，主代理接管收尾（CSS/实测/标签 bug/报告）。

## 根因
1. exp-common.js getCssH 只认 cv.parentElement（scene-wrap），全屏 class/native 元素在外层 .fullscreen-wrap → 全屏画布仍 360/300px，显示不全。
2. .ctl-row/.anim-btns 在 .fullscreen-wrap 外 → native fullscreen 只渲染全屏子树，全屏里没有操作按钮。

## 修复
- exp-common.js getCssH：向上遍历祖先找全屏容器；全屏时 h=innerHeight，遍历容器 children 扣掉控件区 offsetHeight+上下 margin（首测发现只扣 offsetHeight 按钮行仍溢出 54px，补 margin 后通过）。
- exp-vibrate/amp/vacuum/wave 四页：ctl-row+anim-btns 整块移入 .fullscreen-wrap（子代理完成）。
- common.css：全屏态控件白底圆角可读样式（.fullscreen-wrap:fullscreen / .pseudo-fullscreen 下 ctl-row、anim-btns）。
- 顺手修真空罩波形面板标签：未播放时误显「无声（真空）」→ 现在显示「未播放」。

## 实测（browser，4 页全屏逐个）
| 页 | fullscreenElement | 画布高/innerH | 控件在视口内 | 全屏内点按钮 | 退出回 360 |
|---|---|---|---|---|---|
| vibrate | ✅ | 671/876 | ✅ | 拨动✅ | ✅ |
| amp | ✅ | 731/876 | ✅ | 敲一下✅ | ✅ |
| vacuum | ✅ | 737/876 | ✅ | 播放✅ | ✅ |
| wave | ✅ | 733/876 | ✅ | 敲鼓✅ | ✅ |
截图：docs/qa_screenshots/c2s1_fix8_vacuum_fs.png（全屏态目检：画布撑满+底部控制条清晰）。

## 无全屏钮的四页
exp-medium / exp-speed / exp-echo / exp-dual：grep+页面确认本无 ⛶/FullscreenHelper（DOM 交互页：拖拽排序/表单计算/点击听声，全屏无意义），设计如此，不改。

## 自查
node --check exp-common.js/exp-vacuum.js 过；4 HTML 三重自查过；curl 8901 命中新遍历代码与 CSS。未 commit、未 rm。

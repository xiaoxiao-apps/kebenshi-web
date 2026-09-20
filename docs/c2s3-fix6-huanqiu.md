# c2s3 fix6 圜丘回声 · 反射弧回程与清理

## 根因
反射弧更新循环遍历的是组对象，却把 `ra.r`/`ra.alpha` 直接写在组上而非组内弧，导致回程波不运动、不淡出，冻在栏板上且永远清理不掉。

## 改法
`exp-huanqiu.js` 改为双层循环更新组内每个弧；组记录 `dist/arrived`，到中心触发汇合脉冲；撞栏时 shakes 阻尼震动；`refGone` 用 `dist+margin` 判断是否越界。

## 验证
- `node --check` 通过；HTML 三重自查通过。
- curl md5 磁盘 == 服务；`exp-huanqiu.html` 缓存戳为 r6。
- 浏览器 errors=0。
- 实测反射弧最外弧半径 1 s 内 `147→410`；`arrived=true`；`dist=332`。
- 喊话 7.5 s 后 `__hqWaves.length===0`。
- 截图：`/tmp/huanqiu-wide.png`（canvas 帧取证）。

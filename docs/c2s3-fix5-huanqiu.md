# c2s3 圜丘声波栏板反弹修复轮5

## 改动
1. **外发波裁剪**：`drawArcGroup` 新增 `doClip` 参数，绘制外发波时 `ctx.save()`+`clipToRails()` 裁剪到两栏板内侧之间，波不再画到栏板外侧；`draw` 后 `ctx.restore()`。
2. **双侧独立撞栏**：`emitWave` 初始化 `hitLeft/hitRight`；`drawWaves` 中分别检测左右外发波前半径到达 `leftRailInnerX()/rightRailInnerX()`，互不影响，仅触发一次。
3. **反弹动画与闪光**：撞栏瞬间在栏板内侧撞击点画 0.5s 渐淡闪光；左右各生成一组反射弧（圆心=撞击点，朝台面中心方向 `Math.PI/3` 弧段），向中心传播并渐淡。
4. **调试钩子**：文件末尾暴露 `window.__hqWaves`。
5. **缓存戳**：`exp-huanqiu.html` 中 `exp-huanqiu.js?v=20260920r5`。

## 验证
- `node --check exp-huanqiu.js` 通过；HTML 三重自查通过。
- curl md5：js/html 磁盘与服务端一致。
- 浏览器 errors=0；点喊话后 `__hqWaves[0].hitLeft/hitRight` 均变 true，`reflectArcs.length=2`。
- 连点 2 次：`__hqWaves.length=2`，各含 2 组反射弧，无报错。
- 截图：宽屏 `/tmp/huanqiu-wide.png`、手机视口 `/tmp/huanqiu-mobile.png`，目视波未穿栏板、文字无重叠截断。

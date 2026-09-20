# c2s3 fix7 圜丘回声 · 偏心站位双侧栏板反射

## 根因
`drawWaves` 撞栏检测整体包在 `if(w.state === 'out')` 内。偏心站位时右栏更近、先命中并把 `state` 置为 `'reflect'`，导致左栏检测块永不执行，缺左反射弧。

## 改法
`exp-huanqiu.js`：撞栏检测门槛改为 `if(w.arcs[w.arcs.length-1].alpha > 0.01)`，外发波最外弧仍可见期间持续检测；保留块尾 `state='reflect'`、`hitLeft/hitRight` 防重复、clip、shakes、refGone/outGone 等全部逻辑。`exp-huanqiu.html` 缓存戳改 `?v=20260920r7`。

## 验证
- `node --check` 通过；HTML 三重自查通过。
- curl md5 磁盘 == 服务（js/html 均 match）。
- 浏览器 errors=0。
- 实测 A（outside，3 s）：`hitRight=true` 且 `hitLeft=true`，`sides` 含 `['right','left']`。
- 实测 B（center，3 s）：`sides` 仍为 `['left','right']` 双侧。
- 连点 2 次后约 8 s，`__hqWaves.length===0`。

## 截图
- `/Users/personal/.openclaw/workspace/media/keben_check/r7-wide.png`
- `/Users/personal/.openclaw/workspace/media/keben_check/r7-mobile.png`

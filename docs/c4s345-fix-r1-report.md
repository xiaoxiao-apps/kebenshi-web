# c4s345 批次1验收修复轮 R1 报告

## 修改项
- **F1 立姿三棱镜**：prism.png 已替换（640×578，aspect=1.1073，四角 α=0）。render 用 `wDraw=h*1.1073`，左/右斜面中点 `(x±0.25*wDraw, y-0.5*h)` 重锚光路；入射白光照左斜面，七色出射右斜面并在白屏竖向展开红上紫下。
- **F2 光源换太阳**：移除 `PROPS.desk_lamp`，改用 `PROPS.sun(c,x,y,{r:R.sunR,rays:12,hover:R.sunHover})`；太阳本体点击开关（`<R.sunR+8` 命中），`wasActive` 快照转移；`pointermove` 悬停反馈；托盘缩略图改内联 SVG 太阳；按钮文案改「点亮/熄灭」；hint 改点太阳相关。
- **F3 器材放大**：棱镜 `h=min(H*0.32,190)`、光屏 `h=min(H*0.55,300)`、太阳 `r=min(H*0.10,64)`；layout 与 tray spawn 两处同步。
- **F4 色散口径**：逐色偏折改为 `i*1.2°`（总展开 ~7.2°），基准偏折 `-24°` 使默认光带居中幕面；光幕拖远时光带线性变宽，`read-spread` 保留。

## 验证数据
| 场景 | 结果 |
|---|---|
| browser errors | 0 条 |
| 点太阳 500ms 两帧 diff | 217（循环活着） |
| 再点太阳 | sourceOn=false，光带消失 |
| 默认布局 bandY0/Y1/screenH | 374 / 436 / 300 px |
| 最远光幕 bandY0/Y1/screenH | 270 / 365 / 300 px；bandH=95 ≤ 330（1.1×幕高） |
| M2 三原色 | R128 G64 B255 读数与色块同步 |
| 截图 | `/tmp/c4s345-fixr1-r1v3.png` |

## R1.5 光带贴幕裁剪
- 改 `screenHits`/`draw M1`：计算光屏实际面 y 范围 `faceTop/faceBot`；七色光线命中幕内画到 `faceX`，未命中则延伸到画布右缘；光带矩形按幕面裁剪，越界时 `bandY0/Y1=null`、`read-spread=0px`。
- 验证：默认 bandY0/1/screenH=521/612/300（占幕高 30%）；光幕移到顶部/底部 band=null 不悬空；M2 三原色仍正常；截图 `/tmp/c4s345-fixr1-r1v8.png`。

## 自查清单
- [x] html `?v=8` 三处
- [x] `node --check` 通过 3 个 js
- [x] `grep desk_lamp` c4s5 目录 = 0
- [x] core/render/html ≤150/≤150/120 行
- [x] 四角 α=0，PNG optimize

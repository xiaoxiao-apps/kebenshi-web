# c4s1-exp2 器材库标准件升级单：PROPS.screen 2.5D 卷帘光屏

## 修改文件
- `content/_lib/v1/props.js`：PROPS.screen 改代码绘制，新增 PROPS.screenGeom
- `content/_lib/v1/gallery.html`：`props.js?v=35` → `?v=36`

## 几何常量（h = 屏中心高）
| 项 | 值 |
|---|---|
| 面宽 fw | 0.36h |
| 远边（左）高 | 0.91h |
| 近边（右）高 | 1.09h |
| 中心 cy | y - h/2 |
| 顶/底 case 厚 | 0.055h |
| case 外挑 | 0.05h |
| 拉杆长度 | 0.12h |
| 旋钮半径 | 0.022h |

## 兼容性
- `opt.h` / `opt.scale` / `opt.angle` / `opt.dir` 照旧生效
- `opt.w` 被忽略；屏几何全由 h 推导
- 锚点仍为底边中点

## 新增导出
- `PROPS.screenGeom(x, y, h)`：返回全局坐标 `{cx, cy, fw, pts:{TL,BL,BR,TR}, faceX}`
- 投影内容 clip 用 `PROPS.screenGeom(...).pts`

## 自查结果
- `node --check props.js`：通过
- `grep -n PROPS.screenGeom props.js`：命中 1 处定义
- `grep -n geomOf props.js`：命中 ≥2（screen 与 screenGeom 共用）
- `grep -c "spriteReady('screen')" props.js`：0
- `wc -l props.js`：496（增量 60）
- `gallery.html`：`props.js?v=36` 命中

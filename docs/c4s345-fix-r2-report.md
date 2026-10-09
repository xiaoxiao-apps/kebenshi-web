# c4s345 R2 修复报告（F5 立地三棱柱 · 水平彩虹条）

## 改动
- `exp-dispersion-render.js`：PRAT=367/640；prismFace 立柱侧视轮廓（lx=x-0.5w, rx=x+0.5w, beamY=柱身中线）；screenHits 重写为水平扇形（az=(incDeg*0.25+prismDeg*0.6+(i-3)*1.2)°，lateral=D·tan(az)，幕面横轴 xL/xR/xMid/tiltK，beamY 线性插值）；draw M1 白光入射/七色水平射线/横向渐变水平光带；删 bandY0/bandY1 竖直线逻辑。
- `exp-dispersion-core.js`：__dspDbg bandX0/bandX1/新增 faceW getter；SPRITE_VER=83。
- `exp-dispersion.html`：render/core `?v=9/10 → 11`。
- 系数 `(i-3)*4`→`1.2`：事实源 F4「逐色 ~i*1.2°（总~8°）」，旧 4° 使默认光带饱和到 full faceW（ratio 1.0），不符「默认≈六成」。

## 验证（node --check 均 OK）
- 语法：node --check render/core → CHECK-OK；grep bandY0/bandY1 → 无残留。
- 默认态：bandX0=1214, bandX1=1275 → bandW=61, faceW=108, ratio=0.565（0.6±0.15 内），bandC=-0.3（|偏移|≤0.1·faceW）。
- 光幕最远：screenX=1478 → bandW=90, ratio=0.833（≤1.1 内）。
- beamY 出幕面：bandX0=bandX1=null, read-spread='0px'。
- M2 回归：mode=m2 色块正常，bandX0/bandX1=null。
- 截图：/tmp/c4s345-r2-default.png（91KB，已落 /tmp）。
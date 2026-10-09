# c4s345 R3 修复报告

日期：2026-10-08 · 蔡总四条 F6-F9

## 改动
- F6：props.js 无改动（扭姿 prism.png 已由主会话入库，252×640）；render PRAT 367/640→252/640。
- F7：断链修复。render 删 R.prismDeg 字段；L36/L58 两处改读 R.prism.deg；grep prismDeg=0。
- F8：白幕换 PROPS.screen_wide（640×537，aspect 1.1918）；offFace 光线止于幕面边缘(xR/xL)不延伸右缘；
  光带水平矩形 bh=min(28,h*0.10)，hint 文案同改；__dspDbg 加 bandC/faceXMid。
- F9：screenHits 用 PROPS.screenWideGeom（幕面常量 x[0.119,0.911]/y[0.006,0.747]/faceW=0.792w 硬编码）；
  步长 1.2°→3°（**demo 夸张**：真实棱镜总展仅 2-3° 肉眼不可见，此处刻意放大）；幕高 h=min(H*0.58,320)。

## 验证（浏览器 localhost:8848?v=r3）
- ① 默认 band/faceW=153/302=0.507∈[0.45,0.7]；|bandC−faceXMid|=0px。
- ② F7：prism-slider 20°→bandC 位移 +89px；-20°→-88px（均≥15px）。
- ③ F8：inc-slider ±30°→bandC ±66px；画布右缘 x>screen.x+faceW(1412~1518) 采样 33920 像素，高饱和彩色像素=0。
- ④ 拖光幕至 W-40：band=228/faceW=302=0.755（≤faceW*1.1）；M2 切换无异常；canvas 有内容。

## 素材/版本
- sprites/prism.png 252×640、screen_wide.png 640×537（未重抠）。
- SPRITE_VER=83→84；三 script ?v=12、props.js ?v=82；gallery.html 追加 screen_wide 卡(badge=c4s345 新增)。

## 截图
- /tmp/c4s345-fixr3-canvas.png
# c4s345 R4 修复报告（蔡总 2026-10-08 23:49 三问）

## F10 棱镜角度=绕竖直轴自转
- props.js PROPS.prism：删 ctx.rotate（画面内倾斜），改 opt.angle=yaw→横向压缩 sq=0.45+0.55*cos(yaw)，占位框同步。
- render.js 传 angle=R.prism.deg*1.6；滑杆 ±35° 目视柱身明显变窄（35° 截图确认），光带横移 ±89px。

## F11 砍入射方向滑杆
- 评估结论：太阳无穷远入射方向固定；相对入射角已被棱镜旋转覆盖（同自由度冗余）。
- html 删整卡、core 删 incDeg/incS/incV 全部引用；验证 document.getElementById('inc-slider')===null。

## F12 色散学术严格化
- 横排七竖条保持正确：立地三棱柱三角截面在水平面→色散在水平面→竖幕横排；教科书竖彩虹=棱镜躺放截面正对读者的摆法（hint 已加说明句）。
- 竖直方向直线传播（柱轴方向=平行玻璃板无偏折）：bandY=exitY+D*tan(elev)，elev=太阳→出射点仰角。验证：拖太阳上移100px→bandY 567→677（下移110px，物理正确）且光源不被误关。
- 默认太阳与出射点同高（elev=0）→bandY=exitY=567=幕面中心区，光带/幕宽=0.507 居中。
- 七色单调展开 (i-3)*3°（红最小紫最大相对中心色对称展开=最小偏向位形自洽）。

## 主会话热修（子代理截断后续）
- core.js：太阳初始 y=出射高度（同高=默认水平光路）；光幕锚点改宽幕几何 0.6235*scH；hitScreen/clamp/tray spawn 全改 screenWideGeom 锚点。
- render.js：四向箭头挂幕面中心 0.6235；elev 基准 exitY。
- ?v=15；SPRITE_VER=85。

## 验证链
- 默认 ratio 0.507 / bandY=exitY / 像素带厚29px 贴出射高度
- 角度滑杆：光带位移89px + 柱身压缩目视确认
- inc-slider=null；拖太阳仰角联动110px；M2 回归正常；errors 0
- 截图 /tmp/c4s345-r4-default.png（默认态）、/tmp/c4s345-r4-prism35.png（35°转体）

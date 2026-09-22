# c3s1《温度实验室》R2 修复报告（2026-09-22）
1. 温度计架左竖排：.thermometer-rack 改 top60/left16/transform:none/width:auto；.rack-items 改 column；640px media 同步左竖排自适应。验证：截图四按钮竖叠左侧，与右面板无重叠。
2. 烧杯放大：beaker/杯口半径 3.2→4.8、水柱 3.0→4.55、heater 3.4→5.0、气泡随机半径 *2.6→*4.0（build+update 两处）、slot 环 2.0→3.2、snap 判定 4.5→6.2。验证：截图 6 支环 r3.2 间距≈3.3 不重叠；沸腾回归过。
3. 垃圾桶：html 加 #trash-bin（🗑️+label）；css 左下 bottom100/left24 默认暗、.lit 红框发光放大、pointer-events:none；js startDragTherm 加 .lit、onPointerUp(e) 移除并按 getBoundingClientRect 命中→removeThermometer（scene.remove+splice+清选中+playClick，不 snap）。验证：evaluate 删除前2→后1、面板行同步、computed pointerEvents=none。
4. 刻度清晰：canvas 128×1024→256×2048，坐标/lineWidth/font 全×2（156/192/248、y60 跨1928、8/4、76px、x12）；tex.anisotropy=getMaxAnisotropy()；strip 宽 lab0.62/clinical0.45、z 0.245/0.115。验证：截图刻度条清晰不溢出。
5. 自制改圆柱口服液瓶：bottle Cylinder(0.5,0.55,1.5) y0.75；水 Cylinder(0.42,0.46,1.2) y0.7；cork y1.6；straw y=1.7+1.6；liquid/tubeBottom=1.7、tubeLen2.8。验证：截图圆柱瓶身、塞管液柱衔接无悬空不穿桌。
6. 体温计缩口保持：inWater 分支改 retainedReading=Math.max(retained,waterTemp)、reading=峰值；离水/甩一甩原样。验证：evaluate 40→36 读数停40，甩后回环境温20。
7. 加冰按块数：ICE_CUBE_G=10、iceCubes 数组+spawnIceCube（Box0.7、r=√rand*3.6、y 贴水面）；addIce 加质量+spawn+playSplash；buildIce 仅初始化；resetState 清空；animate 换 updateIceCubes（熔化 pop、y 随水面）。验证：evaluate 连加5次→5块且 hypot 最大3.56<4.2 全在杯内；iceMass20→2块、0→清空；r-ice-mass 仍按克。
自查：node --check 两 JS 过；HTML head DOCTYPE/tail </html>/grep -c=1；curl 8901 命中 trash-bin/ICE_CUBE_G/4.8/removeThermometer/column/2048 均≥1；browser errors 0（前后两次）；断言全过含 500W→100℃、沸腾气泡15、reset 归零。截图 workspace/media/c3s1-templab-r2-*.png。

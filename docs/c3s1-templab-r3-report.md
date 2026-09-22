# c3s1 温度实验室 修复轮 R3 报告（2026-09-22）

1. **刻度镜面反**：buildTube 贴条改双张 stripFront/stripBack（同 geometry/texture），z 负（lab -0.24/-0.25、clinical -0.11/-0.12），stripBack rotation.y=π，材质均 FrontSide。验证：evaluate 断言 lab/clinical 各 2 张同 map plane，z 负、roty 0/π、side===THREE.FrontSide(0)；截图 front/back 两视角字均正、液柱在前。
2. **体温计水银泡**：clinical 分支删 SphereGeometry，改外层玻璃壳 Cylinder(0.18,0.18,0.6,16) y=0.3 + 内层水银柱 Cylinder(0.11,0.11,0.55,14) 银色 metalness0.85；neck 保留；液柱 baseColor 0xb8c4cc→0xc0c0c0。验证：evaluate 无水银泡 Sphere、汞柱参数/颜色 0xc0c0c0/metal0.85；近景截图无悬空无穿桌。实验室红球泡未动。
3. **超量程横杠**：updateUI 读数行 warn 时文本 `${name}: — 超量程`（无数字）+warn 类，否则 `xx.x ℃`。验证：reading=45→「体温计: — 超量程」含—且 warn=true；37→「37.0 ℃」无 warn。3D clamp/warn 未动。
4. **标题栏精简**：html title-bar 仅「温度实验室」、删 scope-tag 行、<title> 改「温度实验室」；js 删 timescale 回调与 resetAll 中 scope-tag 引用（select/state.timeScale 保留）；css .scope-tag 已删。验证：grep scope-tag html/js/css 零命中；curl 8901 html scope-tag=0、温度实验室=2；document.title==='温度实验室'。
5. **拖拽沉桌**：新增 clampDragPos(p)（y≥-6.1、x∈[-39,39]、z∈[-29,29]），onPointerMove 拖拽分支 copy 后调用。验证：clampDragPos(0,-100,0).y===-6.1、(-999,0,999)→(-39,29)；真实 pointermove 拖到屏底后 meshGroup.y===-6.1。

**回归**：addIce×5→iceCubes.length===5 且全在杯内半径<4.55；体温计 40→36 峰值保持 reading===40；removeThermometer 后数组 -1；500W stepPhysics 243 步到 100℃ 沸腾（kCool=1.5 未动）；256×2048 贴图+anisotropy>1 在；垃圾桶拖删点亮正常（pointerup 后 lit 移除）。
**静态**：node --check 两 JS 通过；HTML DOCTYPE/</html>/</body> 各 1；curl 8901 clampDragPos=2。浏览器 errors 0 条。
**截图**：media/c3s1-templab-r3-scale-front.png、media/c3s1-templab-r3-scale-back.png、media/c3s1-templab-r3-clinical-bulb.png

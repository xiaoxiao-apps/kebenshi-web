# c4s2 光的反射实验室 · 阶段一交付报告（r6）

日期：2026-09-30 ｜ 目录：content/physics_g8_v1_c4_s2/

## 文件清单与行数

| 文件 | 行数 | 说明 |
|---|---|---|
| index.html | 33 | 卡片页（前轮已落盘，本轮未动） |
| thumb.svg | 20 | 300×220 缩略图：镜面渐变+金虚线法线+红入射/反射光线+∠i∠r 青弧 |
| exp-reflect.html | 70 | 实验页：顶部栏（返回/标题/⛶全屏）+canvas#scene+hint 条+三分区 panel |
| exp-reflect-core.js | 79 | 控制层：布局/resize/交互/控件同步（node --check 过） |
| exp-reflect-render.js | 93 | 渲染层：器材2.5D+光路2D+脉冲（node --check 过） |
| exp-reflect-audio.js | 36 | WebAudio：playClick/playTick/playPulse+静音切换（node --check 过） |

拆分说明：原 core 超 150 行，按任务书拆 core+render 两文件，html 脚本顺序 audio→render→core（exp-reflect.html L60-62）。

## 交互清单

1. 拖拽：pointerdown 命中笔口/入射光线端点 30px 内→拖动，由指针相对 O 方位角算 angleI（clamp 0~80，core L66-77）
2. 滑块 #ang-slider（0-80 step1）input 实时同步
3. 步进钮 ◀/▶ ±1°
4. ▶ 播放光线：光点沿 EO→O→OF 匀速 1.6s 一次性跑完即停
5. 暂停/继续：冻结/恢复 rAF，恢复时补偿脉冲计时
6. 重置：回 45°
7. 复选框：法线/角度弧/读数 显隐（默认全勾）
8. 🔊/🔇 静音切换；⛶ 全屏；← 返回 index.html
9. 三向同步：拖拽/滑块/步进钮任一操作 → slider+ang-val+read-i+read-r 同值（core setAngleDeg）

## 物理断言自查（四条，代码行号依据）

1. **∠r≡∠i 同变量**：render L5 `angleI` 为唯一状态变量；反射光线终点 F() render L11 直接用 `R.angleI`，无独立反射角变量；读数 core L28 readI/readR 同写 `d°`。✓
2. **0° 沿法线原路返回**：angleI=0 时 E()/F() 退化为 (O.x, O.y-L)，入射与反射光线重合且方向相反（均沿 -y 法线），即垂直入射原路返回。render L10-11。✓
3. **两线分居法线两侧**：E.x=O.x−L·sin(ai)，F.x=O.x+L·sin(ai)，x 分量互为镜像取反（对法线镜像），ai>0 时严格分居两侧；青弧也左右分画（render L74-75）。✓
4. **法线垂直镜面**：法线为过 O 的竖直线 x=O.x（render L53 moveTo(O.x,…) lineTo(O.x,…)），镜面顶面为水平平行四边形（上边缘 y=O.y 水平），故法线⊥镜面。✓

## 阶段二挂载点

- **表面类型 select**：挂 panel 左区（exp-reflect.html L44-49 checkbox 组后追加 select#surface；render 里镜面渐变/粗糙度按 surface 分支）
- **平行光束**：挂 render R.draw 新增 drawBeam 分支——以 E()/F() 为基准平移 k 条平行光线，angleI 单变量即可整体联动
- **折纸板**：挂 render 纸板绘制段（L20-27）——加折叠态参数 foldAngle，F 半板绕法线轴做透视压缩（x 缩放 cos(fold)）演示三线共面
- **光路可逆**：挂脉冲方向反转——render L84-93 pulse 段加 `R.pulse.reverse` 标志，t 映射改为 OF→O→EO 即可

## 备注

- 术语逐字使用：法线/入射角/反射角/入射光线/反射光线（hint 条与读数区）
- 深色主题变量与规格一致；canvas devicePixelRatio 高清适配、resize 自适应
- core 调用音效处均 `if(window.playClick)` 式防御，audio 未加载不报错

## 阶段二增量记录（2026-09-30）

行数变化：html 70→82（+12）｜render 93→141（+48）｜core 79→129（+50）｜audio 36 未动；全部 edit 小步追加，无重写整文件。

1. **表面类型+粗糙度**：select#surface（平面镜/粗糙面）+ input#rough-slider（0-100 step5，平面镜时 disabled 置灰不隐藏）；镜面顶面 'rough' 分支画锅齿折线，振幅 jagAmp=mH*0.9*(rough/100)，确定性伪随机 jagF 用 sin(i*127.1+rough)（禁 Math.random，幂等重绘）；单光线粗糙面时 O 点局部斜面法线 localN 随 rough 微偏（限幅 ±26°），反射光按局部法线镜像
2. **平行光束+漫反射**：radio name=beam-mode 单光线（默认）/平行光束；beam 时 5 条沿 EO 方向平移分布（间距 L*0.18 覆盖镜面宽）；每条在各自命中点按 localN 反射（reflectDir 镜像公式），拖拽在 beam 下仍改 angleI 整束联动
3. **折纸板（三线共面）**：btn-fold+fold-state；F 半板（x>O.x）宽乘 cos(foldAngle)，90° 缩成一条竖线（F 标签 fc>0.1 才画）；foldAngle>0 时反射光线 OF 与 ∠r 弧不绘制（单光线/beam 两分支均守）；rAF 0.6s easeInOutQuad 缓动；hint 随展开/折起切换；折叠中滑杆/拖拽仍改 angleI（∠i 侧正常显示）
4. **光路可逆**：btn-reverse 切 R.pulse.reverse+自动播一次脉冲；reverse 时脉冲 F→O→E，激光笔移到 F 端笔口朝 O；btn-reset 同步复位 reverse=false；hint 更新可逆文案（updateHint 优先级：可逆>折叠>默认）

**物理断言自查**：
1. 漫反射逐条 obey 局部反射定律：每条光线均由 reflectDir(d,n)=d-2(d·n)n 镜像公式导出，反射角≡入射角（对局部法线），非乱射 ✓
2. rough=0 时 jagAmp=0→localN 处处 (0,-1)→ 5 条反射线仍平行（镜面反射） ✓
3. 折纸板 foldAngle>0 时反射光线 OF/beam 反射段/∠r 弧均不画（foldAngle===0 守卫） ✓
4. 光路可逆几何不变：E()/F() 与光线绘制不读 reverse，仅脉冲方向与笔位置受影响 ✓

阶段三（4.1 平面镜成像）另目录，不在本单范围。

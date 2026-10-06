# c4s2 r2 libA 镜面/纸板改造报告

## A1 paper_board 去底座重抠
- 原图 631×469 存档至 `content/_lib/v1/assets/raw/paper_board-src-20261006.png`
- cut 线 y=410，新图 631×410
- 末行 span=619，rgb≈(196,196,194) 纸面浅灰，无底座黑行

## A2 PROPS.paper_board 折叠分数重标
- 新高度 410，左半 clip：topF=0.0122 / botF=0.9976
- 右半压缩：foldTop=0.0902 / foldBot=0.9976（虚线同步改用变量）

## A3 PROPS.plane_mirror 改代码绘制 2.5D 躺镜
- 新契约：`PROPS.plane_mirror(ctx,x,y,{w,depth,rough})`，(x,y)=顶面中心
- 顶面梯形渐变 #e8eef5→#c9d4e0；rough 控制光泽/微面；描边 #64748b
- 函数内已移除 drawImage / spriteReady / PROPS.img 依赖
- gallery.html plane_mirror 改 rough=0 / rough=70 两变体，版本 v=39

## A4 c4s2 render.js 调用点适配
- `R.mirrorY = R.by + 2 - 0.75*depth`，`R.O={x:W/2,y:R.mirrorY}`
- paper_board 调用改为 `{h:R.boardH, fold:(R.fold||0)}`
- plane_mirror 调用改为 `{w:R.mirrorLen, depth:depth, rough:0}`

## 自查
- `node --check` props.js / render.js 均通过
- plane_mirror 函数体内无 drawImage / spriteReady / PROPS.img
- render.js 无旧 `scale(R.mirrorLen/305` 残留

## 页面层 B 单
- ∠r 弧修复为小弧：`c.arc(...,-Math.PI/2,angF,false)`
- 弧标签实时显示 ∠i/∠r=deg°；折起时隐藏 ∠r 侧
- 激光笔红钮判定开关激光；laserOn=false 时跳过光线/弧/脉冲
- 折纸板连续滑杆 0-85°，fold>0 隐藏反射光/F/∠r；hint 动态切状态
- 几何 layout 归位 core：mirrorDepth/mirrorY/O 统一计算，render 复用
- html 缓存 v=54(render/core v=2)

## 器材层 C 单
- 纸板顶边原左半 topY=33、折列 35、右半上扬至 9-20；逐列 [topY,409] 线性重采样到 [33,409]，全宽 topY=33±1
- props.js foldTop 由 0.0902 修正为 33/410=0.0805
- render draw 换序：plane_mirror 先（底座），paper_board 后（站上顶面），折痕下端与 O 点重合
- html render/core v=3

## 阶段二 D 单
- 平面镜/粗糙面切换：rough=0 时 slider disabled，透传给 PROPS.plane_mirror
- 漫反射：单光线 localTilt=sin(rough*127.1)*26°，反射方向用 reflectDir 对局部法线镜像；平行光束 5 条各自 tilt_i=sin(i*33.7+rough)*26°，smooth 时平行出射
- 光路可逆：btn-reverse 切换 pulse.reverse，笔移到 F 端；几何 E()/F() 不变
- hint 优先级：fold>reverse>rough>laserOff>默认
- html render/core v=5

## E 单补落
- D 单编辑 html 时第二次 edit 误用 `/Users/personal/` 绝对路径别名，实际未命中 `~/projects/keben_web` 工作目录文件；导致 surface/rough/beam-mode/btn-reverse 控件未落盘
- 本单已补齐：折纸板后加 surface+rough-slider（disabled，rough-val=0），radio beam-mode，btn-mute 前加 btn-reverse；html 84 行，grep 命中 5 处

## F 单
- F1 防穿底：clampTilt 限制 maxTilt=(78-∠i)/2；光线 clip 在 mirrorY+2 以上
- F2 纸板黑边：列复制 {5:8,618:621,619:622,625:623}，四列 lum>190
- F3 光线箭头：cb-arrow + rayArrow，55% 处 9px 红三角
- F4 粗糙面锯齿：plane_mirror 顶面远/近边按 teeth 折线化，微面 alpha 0.35
- F5 全屏兼容：reqFull/exitFull 带 webkit/moz 前缀+失败提示
- 版本：props.js?v=55，render/core v=6，gallery v=55

## G 单
- 根因：前面矩形顶边平直 nearY 裁平锯齿，亮/暗分界恒为直线
- 改法：rough 分支一次算 jag 数组，顶面用 jag 逆序，前面用 jag 正序作顶边；加 #556070 描边强化分界
- amp=0.06+0.16*rough/100；版本 props.js?v=56 / gallery v=56 / c4s2 html props v=56

## H 单
- H1 箭头随可逆：drawBeam 统一 src/dst，penPoseAt 接收点；F 标签按实际 rf 标
- H2 粗糙幅度收敛：teeth=8+floor(rough/8)，amp=0.015+0.045*rough/100
- H3 全屏 CSS 兜底：native 失败 400ms 后 .pseudo-fs body{position:fixed;inset:0;z-index:2147483000}
- H4 循环播放：pulse.loop=true；pause 冻结/恢复；reset 复位
- 版本：props.js?v=57，render/core v=8，gallery v=57

## I 单
- I1 beam 模式改太阳悬挂左上：drawSun 矢量橙黄渐变+12 光芒；隐藏激光笔、beam 禁用拖拽/ripple/金环、hint 改文案；p1 反向 R.L*1.35；beam 脉冲 5 条各跑各
- I2 fold>0 时 clip 宽度改为 R.O.x，折痕右侧光痕裁掉（含 beam 入射段）
- I3 标签：beam 时 E/F 均不画
- 版本：render/core v=9

## J 单
- J1 删 drawBeam 反射段 fold 守卫：clip 自动裁掉右侧，左侧命中点反射痕保留到折痕
- J2 脉冲段移到 clip 内（restore 前），避免 fold 时漏画到折痕右侧
- J3 ∠r 弧守卫保留不动
- 版本：render v=10

## K 单根因
- ① Safari 旧前缀大写 S：webkitRequestFullScreen / webkitCancelFullScreen 未查，native 未调用
- ② pseudo-fs CSS 用 inset（旧 Safari 不认）+ 304 缓存致旧 html 无 CSS，加 class 零视觉
- 改法：core 遍历大小写/MS 前缀；无 native 立即切 pseudo-fs；html 改 top/left+vw/vh 双规则；暴露 window.__fsCap
- 版本：core v=11

## L 单
- 根因：暂停态不清致播放死键；静态光路+脉冲金点存在感弱
- 改法：删除 html play/pause 按钮；core 删 paused/pauseAt 与两监听；reset 删暂停复位；hint 删「▶ 播放光脉冲」；脉冲机制保留给 reverse
- 版本：core v=13

## M 单
- 分组：入射角/折纸板/光源与面/显示/演示/系统，六卡均「上标签下控件」
- 改法：ctrlbar 改 flex-wrap+align-items:stretch；group 改 flex-column；新增 glabel/gctrl；17 个控件 id 全保留
- 版本：html 版式（core v=13 不变）

## N 单
- 改法：core 初始 laserOn=false、reset 也 false；render drawSun 设置 R.sunHit 与悬停金环；core 优先响应太阳点击开关
- 文案：beam 关提示「点太阳开关平行光」；header hint 改「点激光笔红钮/太阳开关光源」
- 版本：render/core v=14

## 物理断言
1. reflectRay 以 `r = d - 2(d·n)n` 镜像局部法线，逐条遵守反射定律
2. rough=0 时 tilt=0，beam 5 条反射方向全同（平行出射）
3. fold>0 时 drawBeam 内反射段被跳过
4. reverse 仅反转脉冲路径与 penSide，不改 E()/F()
5. clampTilt 保证反射光线不射向镜线以下

## 波及面
`content/_lib/v1/props.js`、`content/_lib/v1/gallery.html`、`content/_lib/v1/sprites/paper_board.png`、`content/_lib/v1/assets/raw/paper_board-src-20261006.png`、`content/_lib/v1/assets/raw/paper_board-pre-flat-20261006.png`、`content/_lib/v1/assets/raw/paper_board-pre-deedge-20261006.png`、`content/physics_g8_v1_c4_s2/exp-reflect-render.js`、`content/physics_g8_v1_c4_s2/exp-reflect-core.js`、`content/physics_g8_v1_c4_s2/exp-reflect.html`

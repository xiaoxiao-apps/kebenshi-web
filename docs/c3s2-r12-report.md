# c3s2 R12 修复报告

- 改动文件：仅 content/physics_g8_v1_c3_s2/exp-melt-core.js
- 项1 删热箭头：heatArrow/buildHeatArrow/updateHeatArrow 及全部调用（声明/build/两处 reset/setHeating/enterMode/preMeltComplete/animate 抖动）已删；grep 零命中；火焰保留
- 项2a 子步积分：stepPhysics 热循环拆为 n=ceil(dt/1) 个子步（每子步重算水浴+q 交换+晶/非晶分支），UI/记录每步只跑一次
- 项2b 物理钳制：q>=0 且 sampleTemp>bathTemp 时钳到水浴温度，冷却方向不受影响
- 项2c 温度计：核验发现柱顶映射有误（100℃ 冒顶 ~1.6 格），已按刻度几何精确对齐（柱顶=刻度位）；过程发现外部写入者同轮修复了同一函数，磁盘版本数学正确，采用磁盘为准，无冲突
- 回归（r12 页面 evaluate）：600×stepPhysics(1)（60 加速旧触发条件）maxTemp=100.0，末段恒 100 无震荡，dataLog 无 >100/锯齿
- 沸腾态核验：sample=bath=100.0，温度计柱顶与 100℃ 刻度 alignErr=0.000
- node --check 通过；browser errors 0 条
- 截图：docs/c3s2-r12-verify.png（整页沸腾态）、docs/c3s2-r12-thermo.png（温度计特写）
- 结论：R12 两项修复均达验收标准

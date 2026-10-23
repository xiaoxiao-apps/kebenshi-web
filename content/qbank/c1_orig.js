/* c1 题库 · P2 原创生产 · 2026-10-24 */
/* 第一章 机械运动 原创 23 题：选择7+多选1+填空6+实验5+计算4；易16中5难2 */
/* parts 判分结构与 practice.js 同构：choice/multi/blank；fig 键对应 QBANK_C1_ORIG_FIGS */
const QBANK_C1_ORIG = [

  { id:'c1s1b001', ch:1, sec:1, kp:['measure-ruler'], type:'choice', diff:1, freq:4, points:3,
    stem:'实验室新到一批不锈钢保温瓶，小衡用分度值为 1 mm 的钢直尺测量一个保温瓶的高度。下列记录结果中，符合读数要求的是（　　）',
    note:null, fig:null,
    parts:[
      { kind:'choice', opts:['24.6 cm','24.60 cm','24.603 cm','246 cm'], answer:1,
        analysis:'分度值 1 mm = 0.1 cm，读数应估读到分度值的下一位，即 0.01 cm（以 cm 为单位时保留两位小数）。<b>24.60 cm</b> 符合要求；24.6 cm 没有估读位；24.603 cm 多出一位，超出估读精度；246 cm 与保温瓶实际高度相差悬殊，属于错误记录。' }
    ],
    answer:null, analysis:null, src:'original', scene:'保温瓶高度测量' },

  { id:'c1s1b002', ch:1, sec:1, kp:['measure-watch'], type:'choice', diff:1, freq:4, points:3,
    stem:'体育课要用机械停表给步行赛计时。下列关于停表使用的说法中，正确的是（　　）',
    note:null, fig:null,
    parts:[
      { kind:'choice', opts:['使用前不必检查指针是否指在零刻度','计时结束后可以直接把读数记下来，停表怎么放着都无所谓','按下启动键的瞬间才开始走时，所以启动前指针位置无关紧要','读数时，小表盘记录的是分钟数，大表盘记录的是秒数'], answer:3,
        analysis:'机械停表使用前应检查并<b>校零</b>；用完应按复位键让指针归零，方便下次使用；启动前指针必须指零，否则读数要修正。停表读数时<b>小表盘记分钟、大表盘记秒</b>，D 正确。' }
    ],
    answer:null, analysis:null, src:'original', scene:'步行赛停表使用' },

  { id:'c1s1b003', ch:1, sec:1, kp:['unit-conv'], type:'blank', diff:1, freq:2, points:4,
    stem:'周末的公园里，小柯踩着轮滑鞋沿直道匀速滑行。他的速度是 5 m/s，这一段时间他滑过的路程是 1500 m。<br>（1）他的速度合多少千米每小时？（2）他滑过的路程合多少千米？',
    note:'两空均即时判分，等价写法（带不带单位）均认可。', fig:null,
    parts:[
      { kind:'blank', q:'（1）速度合多少 km/h？（2）路程合多少 km？', blanks:[
        { label:'速度（km/h）', answer:['18','18km/h','18 km/h','18千米每小时','18公里每小时'], unit:'km/h' },
        { label:'路程（km）', answer:['1.5','1.5km','1.5 km','1.5千米','1.5公里'], unit:'km' }],
        analysis:'1 m/s = 3.6 km/h，故 5 m/s = 5 × 3.6 = <b>18 km/h</b>；1 km = 1000 m，故 1500 m = 1500 ÷ 1000 = <b>1.5 km</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'轮滑公园直道' },

  { id:'c1s1b004', ch:1, sec:1, kp:['error'], type:'choice', diff:1, freq:2, points:3,
    stem:'体育中考前，小舒用刻度尺多次测量自己跳绳的长度。关于测量误差，下列说法正确的是（　　）',
    note:null, fig:null,
    parts:[
      { kind:'choice', opts:['误差就是测量时粗心犯下的错误，认真测量就能避免','多次测量求平均值可以把误差完全消除','选用分度值更小的刻度尺，可以减小误差','误差和错误一样，都可以想办法消除'], answer:2,
        analysis:'误差是测量值与真实值之间的差异，<b>只能减小、不能消除</b>；错误是操作不当造成的，可以也应该避免。减小误差的常用办法：<b>选用更精密（分度值更小）的仪器</b>、改进测量方法、多次测量求平均值。A、D 混淆了误差与错误，B 中"完全消除"说法错误。' }
    ],
    answer:null, analysis:null, src:'original', scene:'跳绳长度多次测量' },

  { id:'c1s1b005', ch:1, sec:1, kp:['measure-ruler'], type:'blank', diff:1, freq:4, points:4,
    stem:'小航把一块长方形木块立在刻度尺上测量它的长度，情形见下图简图（木块左端恰好对齐 2 cm 刻度线）。',
    note:'下图为程序化简图，刻度尺分度值为 1 cm，读数须估读到分度值的下一位。', fig:'rulerBlock',
    parts:[
      { kind:'blank', blanks:[
        { label:'木块右端对应的刻度值（cm）', answer:['5.4','5.40','5.4cm','5.40cm','5.4 cm','5.40 cm'], unit:'cm' },
        { label:'木块的长度（cm）', answer:['3.4','3.40','3.4cm','3.40cm','3.4 cm','3.40 cm'], unit:'cm' }],
        analysis:'由简图读出：木块右端在 5 cm 与 6 cm 刻度之间，约超过 5 cm 刻度 4 个小格，估读为 <b>5.4 cm</b>；左端对齐 2.0 cm 刻度线，故木块长度 = 5.4 cm − 2.0 cm = <b>3.4 cm</b>。起点不在零刻度线时，要用末端读数减去起始读数。' }
    ],
    answer:null, analysis:null, src:'original', scene:'木块长度尺读数' },

  { id:'c1s1b006', ch:1, sec:1, kp:['measure-watch'], type:'blank', diff:1, freq:4, points:4,
    stem:'亲子迷你马拉松赛场上，志愿者用机械停表给一对选手计时。计时结束时停表表盘的状态见下图简图（小表盘为分钟盘，大表盘为秒盘，分度值 0.1 s）。',
    note:'下图为程序化简图。判读方法：先看小表盘分钟指针是否越过两刻度间的中线，再读大表盘。', fig:'stopwatchDual',
    parts:[
      { kind:'blank', blanks:[
        { label:'大表盘秒针示数（s）', answer:['7.6','7.6s','7.6 s'], unit:'s' },
        { label:'停表记录的时间共合多少秒（s）', answer:['187.6','187.6s','187.6 s'], unit:'s' }],
        analysis:'小表盘分钟指针位于"3"和"4"之间且<b>未越过中线</b>，说明大表盘处于 0~30 s 区间，秒针示数直接读作 <b>7.6 s</b>；故停表记录的时间为 3 min 7.6 s = 3 × 60 s + 7.6 s = <b>187.6 s</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'亲子马拉松停表计时' },

  { id:'c1s1b007', ch:1, sec:1, kp:['measure-ruler','error'], type:'experiment', diff:2, freq:4, points:6,
    stem:'小铭想测出一枚圆形纪念币的直径。他先用刻度尺配合两个三角板按图夹住纪念币测量，再重复测了四次，数据记录如下表：<br>第1次 2.51 cm　第2次 2.62 cm　第3次 2.54 cm　第4次 2.51 cm',
    note:'下图为程序化简图（夹持测量示意）。两个小问均即时判分。', fig:'coinCaliper',
    parts:[
      { kind:'choice', q:'① 用两个三角板配合刻度尺夹住纪念币测量直径，这样做的主要目的是：',
        opts:['让纪念币更好看','把纪念币的直径平移到刻度尺上，便于准确读数','增大纪念币的直径，方便测量','避免纪念币在桌面上滚动'], answer:1,
        analysis:'圆形物体直径的端点位置不容易直接对准刻度，用两个三角板把纪念币竖直夹住，两板内侧之间的距离就等于直径，相当于把直径<b>平移</b>到刻度尺上，这是测圆径常用的<b>辅助法（卡尺法）</b>。' },
      { kind:'blank', q:'② 处理表中四次数据，纪念币的直径应记为多少？', blanks:[
        { label:'直径（cm）', answer:['2.52','2.52cm','2.52 cm'], unit:'cm' }],
        analysis:'第2次数据 2.62 cm 与其余三次相差悬殊，属于读数失误造成的<b>错误数据</b>，应剔除；对其余三次求平均：(2.51 + 2.54 + 2.51) cm ÷ 3 = 7.56 cm ÷ 3 = <b>2.52 cm</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'纪念币直径测量' },

  { id:'c1s2b008', ch:1, sec:2, kp:['mech-motion'], type:'choice', diff:1, freq:3, points:3,
    stem:'清晨的湿地公园里能看到、闻到、听到许多现象。下列现象中，属于机械运动的是（　　）',
    note:null, fig:null,
    parts:[
      { kind:'choice', opts:['湖边的芦苇慢慢长高','白鹭掠过湖面飞向远方','荷花的清香飘入鼻腔','晨雾在阳光下渐渐散去'], answer:1,
        analysis:'机械运动是指物体的<b>位置随时间发生变化</b>。白鹭飞行时位置不断变化，属于机械运动；芦苇长高是生长现象，清香飘入鼻腔是分子扩散现象，晨雾散去是物态变化现象，它们都不是物体整体的位置变化。' }
    ],
    answer:null, analysis:null, src:'original', scene:'湿地公园现象辨析' },

  { id:'c1s2b009', ch:1, sec:2, kp:['reference'], type:'choice', diff:1, freq:4, points:3,
    stem:'景区里一只热气球载着游客缓缓升空。若说吊篮里的游客是静止的，所选的参照物可能是（　　）',
    note:null, fig:null,
    parts:[
      { kind:'choice', opts:['地面','吊篮','迎面飞来的一只小鸟','草坪上的工作人员'], answer:1,
        analysis:'游客与<b>吊篮</b>之间的位置没有变化，以吊篮为参照物游客是静止的；地面、小鸟、工作人员与游客之间的位置都在不断变化，以它们为参照物游客都是运动的。' }
    ],
    answer:null, analysis:null, src:'original', scene:'热气球升空观景' },

  { id:'c1s2b010', ch:1, sec:2, kp:['reference'], type:'multi', diff:2, freq:4, points:4,
    stem:'校运动会 4×100 m 接力赛交接区里，甲、乙两名运动员并肩同速奔跑，正在完成交接棒。以下列哪些物体为参照物，手持接力棒的甲运动员是静止的？（多选）',
    note:'本题为多选题，选择完毕后点击提交按钮判分。', fig:null,
    parts:[
      { kind:'multi', opts:['甲手中的接力棒','并肩同速奔跑的乙运动员','脚下的跑道','终点处的计时员'], answer:[0,1],
        analysis:'接力棒始终在甲手中，与甲的位置不变 → <b>静止</b>；交接时甲、乙并肩同速奔跑，两人之间的相对位置不变 → 以乙为参照物甲也<b>静止</b>。跑道和计时员相对甲的位置在不断变化，以它们为参照物甲是运动的。' }
    ],
    answer:null, analysis:null, src:'original', scene:'接力赛交接棒' },

  { id:'c1s2b011', ch:1, sec:2, kp:['reference'], type:'choice', diff:1, freq:4, points:3,
    stem:'写字楼的观光电梯正在上行，轿厢四壁是透明玻璃。站在轿厢里的小邱觉得自己是静止的，他选择的参照物可能是（　　）',
    note:null, fig:null,
    parts:[
      { kind:'choice', opts:['电梯轿厢的地板','玻璃外掠过的楼层','楼下大厅的门卫','街对面的公交站'], answer:0,
        analysis:'小邱与<b>轿厢地板</b>之间的位置没有变化，以地板（或轿厢）为参照物他是静止的；楼层、门卫、公交站相对他的位置都在不断变化，以它们为参照物小邱都是运动的。' }
    ],
    answer:null, analysis:null, src:'original', scene:'观光电梯上行' },

  { id:'c1s3b012', ch:1, sec:3, kp:['speed-calc'], type:'blank', diff:1, freq:5, points:4,
    stem:'外卖骑手小骆沿平直的街道匀速骑行，某段配送路程长 1200 m，他用了 4 min 骑完。<br>（1）他这段骑行的速度是多少米每秒？（2）合多少千米每小时？',
    note:'两空均即时判分，等价写法（带不带单位）均认可。', fig:null,
    parts:[
      { kind:'blank', q:'（1）速度是多少 m/s？（2）合多少 km/h？', blanks:[
        { label:'速度（m/s）', answer:['5','5m/s','5 m/s'], unit:'m/s' },
        { label:'速度（km/h）', answer:['18','18km/h','18 km/h','18千米每小时','18公里每小时'], unit:'km/h' }],
        analysis:'t = 4 min = 240 s；v = s ÷ t = 1200 m ÷ 240 s = <b>5 m/s</b>；换算：5 m/s = 5 × 3.6 km/h = <b>18 km/h</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'外卖电动车配送' },

  { id:'c1s3b013', ch:1, sec:3, kp:['graph-st'], type:'choice', diff:2, freq:4, points:3,
    stem:'某校巴沿平直道路从始发点开往终点站，它的路程—时间图像见下图简图（6~8 min 图线水平，为中途站点停靠）。根据图像，下列说法正确的是（　　）',
    note:'下图为程序化简图。', fig:'busStGraph',
    parts:[
      { kind:'choice', opts:['6~8 min 内校巴行驶了 400 m','校巴在站点停靠了 4 min','0~6 min 内校巴的速度为 200 m/min','全程的平均速度为 300 m/min'], answer:2,
        analysis:'由图像：6~8 min 图线水平，路程保持 1200 m 不变，校巴<b>静止停靠 2 min</b>，A、B 均错；0~6 min 内 v = 1200 m ÷ 6 min = <b>200 m/min</b>，C 正确；8~12 min 内行驶 2400 − 1200 = 1200 m，用时 4 min，速度为 300 m/min；全程平均速度 = 2400 m ÷ 12 min = 200 m/min，D 错。' }
    ],
    answer:null, analysis:null, src:'original', scene:'校巴线路接送s-t图' },

  { id:'c1s3b014', ch:1, sec:3, kp:['speed-calc','speed-avg'], type:'blank', diff:1, freq:5, points:6,
    stem:'滑雪集训队在一段笔直的初级道上训练。小霁从坡顶滑到坡底共用 30 s，全程 180 m；教练测得她通过后 120 m 只用了 15 s。',
    note:'三空均即时判分，等价写法（带不带单位）均认可。', fig:null,
    parts:[
      { kind:'blank', q:'（1）全程平均速度？（2）后 120 m 平均速度？（3）前 60 m 平均速度？', blanks:[
        { label:'全程平均速度（m/s）', answer:['6','6m/s','6 m/s'], unit:'m/s' },
        { label:'后120m平均速度（m/s）', answer:['8','8m/s','8 m/s'], unit:'m/s' },
        { label:'前60m平均速度（m/s）', answer:['4','4m/s','4 m/s'], unit:'m/s' }],
        analysis:'全程：v = 180 m ÷ 30 s = <b>6 m/s</b>；后 120 m：v₂ = 120 m ÷ 15 s = <b>8 m/s</b>；前 60 m 用时 = 30 s − 15 s = 15 s，v₁ = 60 m ÷ 15 s = <b>4 m/s</b>。前段慢、后段快，说明她越滑越快，做的是变速运动，各段平均速度并不相同。' }
    ],
    answer:null, analysis:null, src:'original', scene:'滑雪坡道分段计时' },

  { id:'c1s3b015', ch:1, sec:3, kp:['speed-calc'], type:'blank', diff:1, freq:5, points:4,
    stem:'滑雪场缆车匀速运行，吊椅一个挨一个，相邻两把吊椅之间的距离是 30 m。山脚下的观察者数了数：每隔 12 s 就有一把吊椅经过他面前的支架。',
    note:'两空均即时判分，等价写法（带不带单位）均认可。', fig:null,
    parts:[
      { kind:'blank', q:'（1）缆车运行的速度是多少 m/s？（2）合多少 km/h？', blanks:[
        { label:'速度（m/s）', answer:['2.5','2.5m/s','2.5 m/s'], unit:'m/s' },
        { label:'速度（km/h）', answer:['9','9km/h','9 km/h','9千米每小时','9公里每小时'], unit:'km/h' }],
        analysis:'相邻两把吊椅经过同一支架的时间间隔 12 s，正是缆车走过一个椅间距 30 m 所用的时间，故 v = s ÷ t = 30 m ÷ 12 s = <b>2.5 m/s</b>；换算：2.5 m/s = 2.5 × 3.6 km/h = <b>9 km/h</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'滑雪缆车间距测速' },

  { id:'c1s3b016', ch:1, sec:3, kp:['speed-calc','speed-avg'], type:'calc', diff:2, freq:5, points:7,
    stem:'一艘轮渡垂直横渡江面把乘客送到对岸，航道宽 900 m。某天它去程用了 3 min；返程顺水，只用了 2 min。（轮渡往返均看作匀速直线运动）',
    note:'两空加一小问均即时判分。计算须写出过程。', fig:null,
    parts:[
      { kind:'blank', q:'（1）轮渡去程的速度是多少 m/s？（2）往返全程的平均速度是多少 m/s？', blanks:[
        { label:'去程速度（m/s）', answer:['5','5m/s','5 m/s'], unit:'m/s' },
        { label:'往返平均速度（m/s）', answer:['6','6m/s','6 m/s'], unit:'m/s' }],
        analysis:'去程：t₁ = 3 min = 180 s，v₁ = s ÷ t₁ = 900 m ÷ 180 s = <b>5 m/s</b>。往返全程：总路程 = 2 × 900 m = 1800 m，总时间 = 180 s + 120 s = 300 s，平均速度 = 1800 m ÷ 300 s = <b>6 m/s</b>。' },
      { kind:'choice', q:'（3）返程速度是 7.5 m/s，往返平均速度 6 m/s 却不等于 (5 + 7.5) ÷ 2 = 6.25 m/s，这是因为：',
        opts:['平均速度必须用总路程除以总时间，与"速度的平均"不是一回事','去程和返程的路程不相等，所以不能求平均','计时员按错了表，6 m/s 是错误数据','轮渡往返过程中一直在变速，无法计算平均速度'], answer:0,
        analysis:'平均速度的定义是<b>总路程 ÷ 总时间</b>：1800 m ÷ 300 s = 6 m/s。而 (5 + 7.5) ÷ 2 只是两段速度的算术平均，只有在两段<b>用时相等</b>时才碰巧与平均速度一致，本题去、返用时不同，两者自然不等。这正是"平均速度不是速度的平均值"的典型例证。' }
    ],
    answer:null, analysis:null, src:'original', scene:'轮渡横渡往返' },

  { id:'c1s3b017', ch:1, sec:3, kp:['speed-calc'], type:'calc', diff:3, freq:5, points:7,
    stem:'某高速公路一段路实行区间测速：起点和终点处各有一个记录门架，两个门架之间的路程为 3 km，该路段限速 100 km/h。系统按车辆通过两个门架的时间间隔计算区间平均速度，超过限速即认定超速。一辆轿车通过该区间用时 1 min 40 s。',
    note:'两空加一小问均即时判分。计算须写出过程。', fig:null,
    parts:[
      { kind:'choice', q:'（1）该轿车在区间内的平均速度是否超过限速？',
        opts:['超速了','没有超速','恰好等于限速，无法判断','条件不足，无法判断'], answer:0,
        analysis:'见（2）的算式：区间平均速度为 108 km/h，大于限速 100 km/h，<b>超速了</b>。' },
      { kind:'blank', q:'（2）区间平均速度是多少 km/h？（3）要不超速，通过区间至少需要多少秒？', blanks:[
        { label:'平均速度（km/h）', answer:['108','108km/h','108 km/h'], unit:'km/h' },
        { label:'最短用时（s）', answer:['108','108s','108 s'], unit:'s' }],
        analysis:'t = 1 min 40 s = 100 s = 100/3600 h = 1/36 h；v = s ÷ t = 3 km ÷ (1/36) h = <b>108 km/h</b> ＞ 100 km/h，超速。要不超速，须 v ≤ 100 km/h，即 t ≥ s ÷ v = 3 km ÷ 100 km/h = 0.03 h = <b>108 s</b>，通过区间至少要 108 s。' }
    ],
    answer:null, analysis:null, src:'original', scene:'高速区间测速' },

  { id:'c1s3b018', ch:1, sec:3, kp:['speed-calc','unit-conv'], type:'calc', diff:1, freq:5, points:6,
    stem:'一架物流无人机满载货物后沿水平直线匀速飞向配送点。它飞完前一段 480 m 的航路用时 32 s。',
    note:'三空均即时判分。计算须写出过程。', fig:null,
    parts:[
      { kind:'blank', q:'（1）无人机的飞行速度是多少 m/s？（2）合多少 km/h？（3）以该速度再飞 2 min，还能飞多少米？', blanks:[
        { label:'速度（m/s）', answer:['15','15m/s','15 m/s'], unit:'m/s' },
        { label:'速度（km/h）', answer:['54','54km/h','54 km/h'], unit:'km/h' },
        { label:'再飞的路程（m）', answer:['1800','1800m','1800 m','1800米'], unit:'m' }],
        analysis:'（1）v = s ÷ t = 480 m ÷ 32 s = <b>15 m/s</b>；（2）15 m/s = 15 × 3.6 km/h = <b>54 km/h</b>；（3）t′ = 2 min = 120 s，s′ = v·t′ = 15 m/s × 120 s = <b>1800 m</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'无人机送货航线' },

  { id:'c1s3b019', ch:1, sec:3, kp:['graph-st','speed-calc'], type:'calc', diff:3, freq:5, points:8,
    stem:'小潭和小池沿同一条滨河步道同向晨跑，两人都从起点出发做匀速直线运动。运动 APP 只画出了小潭的路程—时间图线（见下图简图）；小池的数据是文字记录：比小潭晚 50 s 出发，速度恒为 3 m/s。',
    note:'下图为程序化简图（小潭的 s-t 图线，只画到 120 s）。三空均即时判分，计算须写出过程。', fig:'paceStGraph',
    parts:[
      { kind:'blank', q:'（1）小潭的速度是多少 m/s？（2）小池出发后经过多少秒追上小潭？（3）追上处距起点多少米？', blanks:[
        { label:'小潭速度（m/s）', answer:['2','2m/s','2 m/s'], unit:'m/s' },
        { label:'追上用时（s）', answer:['100','100s','100 s'], unit:'s' },
        { label:'追上处距起点（m）', answer:['300','300m','300 m','300米'], unit:'m' }],
        analysis:'（1）由图线取点：t = 100 s 时 s = 200 m，v潭 = 200 m ÷ 100 s = <b>2 m/s</b>（图线过原点且为直线，是匀速运动）。（2）设小池出发后 t s 追上，此时小潭已跑 (t + 50) s；追上时两人路程相等：3 m/s × t = 2 m/s × (t + 50)，即 3t = 2t + 100，解得 t = <b>100 s</b>。（3）追上处距起点 s = 3 m/s × 100 s = <b>300 m</b>（验算：小潭 2 m/s × 150 s = 300 m，一致）。' }
    ],
    answer:null, analysis:null, src:'original', scene:'跑步APP配速追及' },

  { id:'c1s4b020', ch:1, sec:4, kp:['speed-avg'], type:'experiment', diff:1, freq:5, points:6,
    stem:'体育课上，同学们要测出自己 50 m 短跑的平均速度。发令后小壮跑完全程，电子计时器显示成绩为 8 s。',
    note:'三个小问均即时判分。', fig:null,
    parts:[
      { kind:'choice', q:'① 该实验依据的原理是：',
        opts:['v = s ÷ t','s = v ÷ t','t = s × v','v = t ÷ s'], answer:0,
        analysis:'平均速度不能直接测出，要先测出<b>路程 s 和时间 t</b>，再按 <b>v = s ÷ t</b> 算出。' },
      { kind:'choice', q:'② 完成该实验需要的测量器材是：',
        opts:['刻度尺和停表','卷尺和停表','天平和停表','温度计和卷尺'], answer:1,
        analysis:'50 m 跑道较长，用<b>卷尺</b>量路程（刻度尺量程不够）；用<b>停表</b>（或电子计时器）测时间。' },
      { kind:'blank', q:'③ 小壮 50 m 短跑的平均速度是多少 m/s？', blanks:[
        { label:'平均速度（m/s）', answer:['6.25','6.25m/s','6.25 m/s'], unit:'m/s' }],
        analysis:'v = s ÷ t = 50 m ÷ 8 s = <b>6.25 m/s</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'操场50m短跑测速' },

  { id:'c1s4b021', ch:1, sec:4, kp:['speed-avg'], type:'experiment', diff:1, freq:5, points:7,
    stem:'快递分拣中心的传送带匀速运行。技术员小樊想测出传送带的运行速度：他在带侧标出相距 2.4 m 的 A、B 两条标线，当一只包裹经过 A 线时按下停表，包裹到达 B 线时停表，示数为 4 s。',
    note:'三个小问均即时判分。', fig:null,
    parts:[
      { kind:'blank', q:'① 传送带运行的速度是多少 m/s？', blanks:[
        { label:'传送带速度（m/s）', answer:['0.6','0.6m/s','0.6 m/s'], unit:'m/s' }],
        analysis:'包裹随传送带一起匀速运动，它的速度就是传送带的速度：v = s ÷ t = 2.4 m ÷ 4 s = <b>0.6 m/s</b>。' },
      { kind:'choice', q:'② 以传送带为参照物，随带一起匀速前进的包裹是：',
        opts:['运动的','静止的','先运动后静止','无法判断'], answer:1,
        analysis:'包裹与传送带之间没有相对滑动，位置不变，以传送带为参照物包裹是<b>静止</b>的——这也是选包裹当"计时标记"的原因。' },
      { kind:'blank', q:'③ 另一只包裹以同样速度经过一段 6 m 长的分拣通道，需要多少秒？', blanks:[
        { label:'通过时间（s）', answer:['10','10s','10 s'], unit:'s' }],
        analysis:'t = s ÷ v = 6 m ÷ 0.6 m/s = <b>10 s</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'快递分拣传送带' },

  { id:'c1s4b022', ch:1, sec:4, kp:['speed-avg','unit-conv'], type:'experiment', diff:1, freq:5, points:7,
    stem:'小妤每天乘地铁上学。她想测出列车在相邻两站之间运行的平均速度：从手机地图查得两站间轨道里程为 1.8 km，她用手表计时，列车从甲站启动到乙站停稳共用时 2 min 30 s（里程按站间轨道长度计算，停站时间不计）。',
    note:'两个小问均即时判分。', fig:null,
    parts:[
      { kind:'choice', q:'① 她的方案中，路程和时间的获取方式分别是：',
        opts:['路程用卷尺沿轨道量，时间用手表计时','路程查站间轨道里程数据，时间用手表计时','路程和时间都用手表上的软件直接读出','方案不可行，站间里程无法获得'], answer:1,
        analysis:'两站间轨道长达 1.8 km，无法用卷尺直接量，只能<b>查阅站间里程数据</b>；时间用<b>手表（或停表）</b>记录从启动到停稳的时长。这是"已知长度 + 计时"的间接测速方案。' },
      { kind:'blank', q:'② 列车站间运行的平均速度是多少 m/s？合多少 km/h？', blanks:[
        { label:'平均速度（m/s）', answer:['12','12m/s','12 m/s'], unit:'m/s' },
        { label:'平均速度（km/h）', answer:['43.2','43.2km/h','43.2 km/h'], unit:'km/h' }],
        analysis:'s = 1.8 km = 1800 m；t = 2 min 30 s = 150 s；v = s ÷ t = 1800 m ÷ 150 s = <b>12 m/s</b>；换算：12 m/s = 12 × 3.6 km/h = <b>43.2 km/h</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'地铁区间平均速度' },

  { id:'c1s4b023', ch:1, sec:4, kp:['speed-avg','speed-calc'], type:'experiment', diff:2, freq:5, points:8,
    stem:'小铄骑自行车上学，沿途经过一段上坡和一段下坡。她分段记录数据：上坡段路程 400 m、用时 80 s；下坡段路程 900 m、用时 120 s。（两段均沿直线骑行，途中未停留）',
    note:'三个小问均即时判分，计算须写出过程。', fig:null,
    parts:[
      { kind:'blank', q:'① 上坡段的平均速度是多少 m/s？② 下坡段的平均速度是多少 m/s？③ 全程的平均速度是多少 m/s？', blanks:[
        { label:'上坡段速度（m/s）', answer:['5','5m/s','5 m/s'], unit:'m/s' },
        { label:'下坡段速度（m/s）', answer:['7.5','7.5m/s','7.5 m/s'], unit:'m/s' },
        { label:'全程平均速度（m/s）', answer:['6.5','6.5m/s','6.5 m/s'], unit:'m/s' }],
        analysis:'上坡：v₁ = 400 m ÷ 80 s = <b>5 m/s</b>；下坡：v₂ = 900 m ÷ 120 s = <b>7.5 m/s</b>；全程：总路程 = 400 m + 900 m = 1300 m，总时间 = 80 s + 120 s = 200 s，v = 1300 m ÷ 200 s = <b>6.5 m/s</b>。' },
      { kind:'choice', q:'④ 全程平均速度 6.5 m/s 与 (5 + 7.5) ÷ 2 = 6.25 m/s 不相等，对此正确的理解是：',
        opts:['平均速度必须用总路程除以总时间，一般不等于各段速度的平均值','两次计时必有一次按错了表，数据不可信','上坡路程短，所以全程平均速度偏大','变速骑行的平均速度无法计算'], answer:0,
        analysis:'平均速度 = <b>总路程 ÷ 总时间</b> = 1300 m ÷ 200 s = 6.5 m/s，这是定义式，任何情况下都成立；各段速度的算术平均值 6.25 m/s 没有物理依据，只有各段<b>用时相等</b>时两者才碰巧相同，本题两段用时不同，结果自然不等。' }
    ],
    answer:null, analysis:null, src:'original', scene:'骑行上学分段测速' },

];
const QBANK_C1_ORIG_FIGS = {

  /* c1s1b005：刻度尺（分度值1cm，带mm刻线）测木块，左端对齐2cm、右端在5.4cm处 */
  rulerBlock: function() {
    let s = '';
    const x0 = 40, cw = 50; // 1 cm = 50 px
    s += `<rect x="${x0}" y="92" width="${cw * 8}" height="34" fill="#f2ede2" stroke="#9aa4b5" rx="3"/>`;
    for (let mm = 0; mm <= 80; mm++) {
      const x = x0 + mm * cw / 10;
      if (mm % 10 === 0) {
        s += `<line x1="${x}" y1="92" x2="${x}" y2="112" stroke="#2c2c2c" stroke-width="1.5"/>`;
        s += `<text x="${x}" y="140" fill="#9aa4b5" font-size="12" text-anchor="middle">${mm / 10}</text>`;
      } else {
        s += `<line x1="${x}" y1="92" x2="${x}" y2="${mm % 5 === 0 ? 104 : 99}" stroke="#2c2c2c" stroke-width="0.8"/>`;
      }
    }
    s += `<text x="${x0 + cw * 8 + 16}" y="112" fill="#9aa4b5" font-size="12">cm</text>`;
    const bx1 = x0 + 2 * cw, bx2 = x0 + 5.4 * cw;
    s += `<rect x="${bx1}" y="52" width="${bx2 - bx1}" height="36" fill="#e08e5e" stroke="#b06a3e" rx="3"/>`;
    s += `<text x="${(bx1 + bx2) / 2}" y="42" text-anchor="middle" font-size="12" fill="#9aa4b5">木块</text>`;
    return `<svg viewBox="0 0 480 156" role="img" aria-label="刻度尺测量木块长度简图">${s}</svg>`;
  },

  /* c1s1b006：机械停表双盘（小盘分钟针在3与4之间未过半，大盘秒针指7.6s，分度值0.1s） */
  stopwatchDual: function() {
    let s = '';
    // 小表盘（分钟）：0~5 min 顺时针，每 1 min = 60°
    const mx = 66, my = 66, mr = 46;
    s += `<circle cx="${mx}" cy="${my}" r="${mr}" fill="#101820" stroke="#c9d4dd" stroke-width="3"/>`;
    for (let m = 0; m < 5; m++) {
      const a = m * 60 * Math.PI / 180;
      s += `<line x1="${mx + (mr - 8) * Math.sin(a)}" y1="${my - (mr - 8) * Math.cos(a)}" x2="${mx + mr * Math.sin(a)}" y2="${my - mr * Math.cos(a)}" stroke="#7fd4ff" stroke-width="1.5"/>`;
      s += `<text x="${mx + (mr - 20) * Math.sin(a)}" y="${my - (mr - 20) * Math.cos(a) + 4}" fill="#7fd4ff" font-size="11" text-anchor="middle">${m}</text>`;
    }
    // 分钟针：3 min 过 7.6 s → 180° + 7.6/60×60° ≈ 187.6°（未越过 3~4 中线 210°）
    s += `<line x1="${mx}" y1="${my}" x2="${mx}" y2="${my - mr + 12}" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round" transform="rotate(187.6 ${mx} ${my})"/>`;
    s += `<circle cx="${mx}" cy="${my}" r="4" fill="#5a6672"/>`;
    s += `<text x="${mx}" y="${my + 22}" fill="#7fd4ff" font-size="10" text-anchor="middle">min</text>`;
    // 大表盘（秒）：0~30 s 一周，每 1 s = 12°，分度 0.1 s
    const bx = 210, by = 80, br = 70;
    s += `<circle cx="${bx}" cy="${by}" r="${br}" fill="#101820" stroke="#c9d4dd" stroke-width="3"/>`;
    for (let i = 0; i < 30; i++) {
      const a = i * 12 * Math.PI / 180;
      const major = i % 5 === 0;
      s += `<line x1="${bx + (br - (major ? 10 : 5)) * Math.sin(a)}" y1="${by - (br - (major ? 10 : 5)) * Math.cos(a)}" x2="${bx + br * Math.sin(a)}" y2="${by - br * Math.cos(a)}" stroke="#7fd4ff" stroke-width="${major ? 1.5 : 0.7}"/>`;
      if (major) s += `<text x="${bx + (br - 22) * Math.sin(a)}" y="${by - (br - 22) * Math.cos(a) + 4}" fill="#7fd4ff" font-size="11" text-anchor="middle">${i}</text>`;
    }
    // 秒针：7.6 s → 7.6/30×360° = 91.2°
    s += `<line x1="${bx}" y1="${by}" x2="${bx}" y2="${by - br + 10}" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round" transform="rotate(91.2 ${bx} ${by})"/>`;
    s += `<circle cx="${bx}" cy="${by}" r="5" fill="#5a6672"/>`;
    s += `<text x="${bx}" y="${by + 28}" fill="#7fd4ff" font-size="11" text-anchor="middle">s（分度值 0.1 s）</text>`;
    return `<svg viewBox="0 0 300 160" role="img" aria-label="机械停表双表盘简图">${s}</svg>`;
  },

  /* c1s1b007：两个三角板夹住纪念币、立在刻度尺上（辅助法示意） */
  coinCaliper: function() {
    let s = '';
    const x0 = 40, cw = 40; // 1 cm = 40 px
    s += `<rect x="${x0}" y="96" width="${cw * 7}" height="28" fill="#f2ede2" stroke="#9aa4b5" rx="3"/>`;
    for (let cm = 0; cm <= 7; cm++) {
      const x = x0 + cm * cw;
      s += `<line x1="${x}" y1="96" x2="${x}" y2="${cm % 1 === 0 ? 112 : 104}" stroke="#2c2c2c" stroke-width="1.2"/>`;
      s += `<text x="${x}" y="138" fill="#9aa4b5" font-size="11" text-anchor="middle">${cm}</text>`;
      for (let k = 1; k < 10; k++) {
        const xm = x + k * cw / 10;
        if (cm < 7) s += `<line x1="${xm}" y1="96" x2="${xm}" y2="${k === 5 ? 107 : 102}" stroke="#2c2c2c" stroke-width="0.6"/>`;
      }
    }
    s += `<text x="${x0 + cw * 7 + 16}" y="114" fill="#9aa4b5" font-size="11">cm</text>`;
    // 纪念币：直径 2.5 cm，立于 2.0~4.5 cm 之间
    const cx = x0 + 3.25 * cw, cy = 96 - 1.25 * cw, r = 1.25 * cw;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#d4a017" stroke="#a67c00" stroke-width="2"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r - 12}" fill="none" stroke="#a67c00" stroke-width="1"/>`;
    // 左右三角板（直角边贴尺面、内侧面贴币）
    const lx = x0 + 2 * cw, rx = x0 + 4.5 * cw;
    s += `<polygon points="${lx},96 ${lx},20 ${lx - 34},96" fill="rgba(127,212,255,.25)" stroke="#7fd4ff" stroke-width="1.5"/>`;
    s += `<polygon points="${rx},96 ${rx},20 ${rx + 34},96" fill="rgba(127,212,255,.25)" stroke="#7fd4ff" stroke-width="1.5"/>`;
    return `<svg viewBox="0 0 360 150" role="img" aria-label="三角板夹持纪念币测直径简图">${s}</svg>`;
  },

  /* c1s3b013：校巴 s-t 图像（0~6min 行驶 1200m，6~8min 停靠，8~12min 行驶至 2400m） */
  busStGraph: function() {
    let s = '';
    const ox = 56, oy = 150, ux = 30, uy = 0.05; // x:30px/min, y:0.05px/m
    // 网格
    for (let t = 2; t <= 12; t += 2) s += `<line x1="${ox + t * ux}" y1="${oy}" x2="${ox + t * ux}" y2="${oy - 2400 * uy}" stroke="rgba(154,164,181,.18)" stroke-width="1"/>`;
    for (let d = 600; d <= 2400; d += 600) s += `<line x1="${ox}" y1="${oy - d * uy}" x2="${ox + 12 * ux}" y2="${oy - d * uy}" stroke="rgba(154,164,181,.18)" stroke-width="1"/>`;
    // 坐标轴
    s += `<line x1="${ox}" y1="${oy}" x2="${ox + 12 * ux + 18}" y2="${oy}" stroke="#9aa4b5" stroke-width="1.5"/>`;
    s += `<line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy - 2400 * uy - 16}" stroke="#9aa4b5" stroke-width="1.5"/>`;
    s += `<text x="${ox + 12 * ux + 16}" y="${oy + 20}" fill="#9aa4b5" font-size="11" text-anchor="end">t/min</text>`;
    s += `<text x="${ox - 8}" y="${oy - 2400 * uy - 12}" fill="#9aa4b5" font-size="11" text-anchor="end">s/m</text>`;
    for (let t = 0; t <= 12; t += 2) s += `<text x="${ox + t * ux}" y="${oy + 16}" fill="#9aa4b5" font-size="10" text-anchor="middle">${t}</text>`;
    for (let d = 0; d <= 2400; d += 600) s += `<text x="${ox - 8}" y="${oy - d * uy + 4}" fill="#9aa4b5" font-size="10" text-anchor="end">${d}</text>`;
    // 图线：0→6min 到 1200m；6→8min 水平；8→12min 到 2400m
    s += `<polyline points="${ox},${oy} ${ox + 6 * ux},${oy - 1200 * uy} ${ox + 8 * ux},${oy - 1200 * uy} ${ox + 12 * ux},${oy - 2400 * uy}" fill="none" stroke="#7fd4ff" stroke-width="2.5"/>`;
    // 停靠段标注（条件信息）
    s += `<text x="${ox + 7 * ux}" y="${oy - 1200 * uy - 10}" fill="#ffd479" font-size="10" text-anchor="middle">站点停靠</text>`;
    return `<svg viewBox="0 0 440 180" role="img" aria-label="校巴路程时间图像简图">${s}</svg>`;
  },

  /* c1s3b019：小潭的 s-t 图线（2 m/s，只画到 120 s，未达追及点，图内无答案读数） */
  paceStGraph: function() {
    let s = '';
    const ox = 56, oy = 150, ux = 3, uy = 0.5; // x:3px/s, y:0.5px/m
    for (let t = 20; t <= 120; t += 20) s += `<line x1="${ox + t * ux}" y1="${oy}" x2="${ox + t * ux}" y2="${oy - 240 * uy}" stroke="rgba(154,164,181,.18)" stroke-width="1"/>`;
    for (let d = 40; d <= 240; d += 40) s += `<line x1="${ox}" y1="${oy - d * uy}" x2="${ox + 120 * ux}" y2="${oy - d * uy}" stroke="rgba(154,164,181,.18)" stroke-width="1"/>`;
    s += `<line x1="${ox}" y1="${oy}" x2="${ox + 120 * ux + 18}" y2="${oy}" stroke="#9aa4b5" stroke-width="1.5"/>`;
    s += `<line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy - 240 * uy - 16}" stroke="#9aa4b5" stroke-width="1.5"/>`;
    s += `<text x="${ox + 120 * ux + 16}" y="${oy + 20}" fill="#9aa4b5" font-size="11" text-anchor="end">t/s</text>`;
    s += `<text x="${ox - 8}" y="${oy - 240 * uy - 12}" fill="#9aa4b5" font-size="11" text-anchor="end">s/m</text>`;
    for (let t = 0; t <= 120; t += 20) s += `<text x="${ox + t * ux}" y="${oy + 16}" fill="#9aa4b5" font-size="10" text-anchor="middle">${t}</text>`;
    for (let d = 0; d <= 240; d += 40) s += `<text x="${ox - 8}" y="${oy - d * uy + 4}" fill="#9aa4b5" font-size="10" text-anchor="end">${d}</text>`;
    // 小潭图线：过原点，2 m/s，画至 (120 s, 240 m)
    s += `<polyline points="${ox},${oy} ${ox + 120 * ux},${oy - 240 * uy}" fill="none" stroke="#7de8a8" stroke-width="2.5"/>`;
    s += `<text x="${ox + 96 * ux + 6}" y="${oy - 208 * uy}" fill="#7de8a8" font-size="11">小潭</text>`;
    return `<svg viewBox="0 0 450 180" role="img" aria-label="小潭路程时间图线简图">${s}</svg>`;
  }

};

if(typeof window!=="undefined"){window.QBANK_C1_ORIG=QBANK_C1_ORIG;window.QBANK_C1_ORIG_FIGS=QBANK_C1_ORIG_FIGS;}

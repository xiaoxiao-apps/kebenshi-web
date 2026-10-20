/* ===== 本章练习题库（第一章 机械运动） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / multi=多选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 题源：c1_s1/quiz.html（9 题）+ c1_s2/quiz.html（教材①~④联动 4 题 + 基础选择 3 题）
 *      + c1_s3/quiz.html（练习与应用 6 题，揭晓答案式→填空判分）+ c1_s4/quiz.html（练习与应用 5 题）。
 *      题干/选项/正确答案/解析原样迁移，仅拆分交互联动题为小问（note 说明）；共 27 题，总分 288 分（各题 points 之和）。
 * multi 类型说明：c1s1q7、c1s1q9 原题为多选（选齐对应项数自动判定），在样板 choice/blank/open 之外
 *      最小增补 multi 一种 part 类型，样板既有判分逻辑零改动。
 * 分值规则对齐样板：单 part 题 10 分，多 part/多空题 12 分。
 */
const QUESTIONS = [
  // —— 第1节 长度和时间的测量（c1_s1/quiz.html 9 题） ——
  { id:'c1s1q1', section:'第1节 长度和时间的测量', no:'第1题', points:10,
    stem:'一把刻度尺的分度值是 1 mm，用它测量物体长度时，下列读数正确的是（　　）',
    parts:[
      { kind:'choice', opts:['2.3 cm','2.35 cm','2.350 cm','2 cm'], answer:1,
        analysis:'分度值是 1 mm，读数时要估读到分度值的下一位，即 0.1 mm = 0.01 cm。所以应读到小数点后两位，<b>2.35 cm</b> 正确。' }
    ] },

  { id:'c1s1q2', section:'第1节 长度和时间的测量', no:'第2题', points:10,
    stem:'关于刻度尺的使用，下列说法正确的是（　　）',
    parts:[
      { kind:'choice', opts:['读数时视线应斜着看刻度','物体的一端必须对齐 0 刻度','读数时要估读到分度值的下一位','选择刻度尺时只看量程就行'], answer:2,
        analysis:'读数时视线要与刻度尺垂直；物体左端可以不对齐 0 刻度，用末端刻度减去起始刻度即可；选择刻度尺时要同时考虑量程和分度值。<b>读数时要估读到分度值的下一位</b>是正确的。' }
    ] },

  { id:'c1s1q3', section:'第1节 长度和时间的测量', no:'第3题', points:10,
    stem:'机械停表小表盘指针在"1"和"2"之间，且过了 1 和 2 的中线；大表盘指针指在 7.5 s 处，则读数为（　　）',
    parts:[
      { kind:'choice', opts:['1 min 7.5 s','1 min 37.5 s','2 min 37.5 s','0 min 37.5 s'], answer:1,
        analysis:'小表盘读分钟：指针在 1 和 2 之间，取 1 min。因为指针过了中线，说明大表盘已进入 30~60 s 段，即 30 + 7.5 = 37.5 s。最终读数为 <b>1 min 37.5 s</b>。' }
    ] },

  { id:'c1s1q4', section:'第1节 长度和时间的测量', no:'第4题', points:10,
    stem:'某同学测同一支铅笔长度，得到 4 个数据：18.52 cm、18.50 cm、18.90 cm、18.51 cm。下列处理正确的是（　　）',
    parts:[
      { kind:'choice', opts:['直接求平均为 18.61 cm','剔除 18.90 cm 后再求平均','保留所有数据，平均为 18.58 cm','多次测量可以消除误差'], answer:1,
        analysis:'18.90 cm 与其余数据相差过大，是错误数据，应先剔除；再求 (18.52+18.50+18.51)/3 ≈ 18.51 cm。误差不可避免，多次测量只能减小误差，<b>不能消除误差</b>。' }
    ] },

  { id:'c1s1q5', section:'第1节 长度和时间的测量', no:'第5题', points:10,
    stem:'"一日之计在于晨"，其中"一日"等于多少秒？（　　）',
    parts:[
      { kind:'choice', opts:['3600 s','12 000 s','24 000 s','86 400 s'], answer:3,
        analysis:'1 日 = 24 h，1 h = 60 min = 3600 s，所以 1 日 = 24 × 3600 s = <b>86 400 s</b>。' }
    ] },

  { id:'c1s1q6', section:'第1节 长度和时间的测量', no:'第6题', points:10,
    stem:'身高大约是脚长的几倍？（常识选择）',
    parts:[
      { kind:'choice', opts:['约 5 倍','约 7 倍','约 9 倍','约 12 倍'], answer:1,
        analysis:'一般来说，人的身高大约是脚长的 7 倍左右。你可以用尺子量一量自己的身高和脚长验证一下。' }
    ] },

  { id:'c1s1q7', section:'第1节 长度和时间的测量', no:'第7题（多选）', points:10,
    stem:'测量硬币的直径，下列哪些方法可行？（多选）',
    note:'本题为多选题，选齐 3 项后自动提交判分。',
    parts:[
      { kind:'multi', opts:['用刻度尺直接对准硬币直径读数','用两个三角板夹住硬币，量两三角板间距','用棉线绕硬币一周，量出周长再算直径','把硬币在纸上滚一圈，量出痕迹长度再算直径'], answer:[1,2,3],
        analysis:'<b>辅助法</b>（三角板夹硬币）可行；<b>化曲为直</b>测周长再算直径也可行；<b>滚圆法</b>也是常用方法。但直接用刻度尺对准圆心读直径容易不准，一般不采用。' }
    ] },

  { id:'c1s1q8', section:'第1节 长度和时间的测量', no:'第8题', points:10,
    stem:'测量单摆周期时，为了减小误差，较好的做法是（　　）',
    parts:[
      { kind:'choice', opts:['只测 1 个周期','测 30 个周期的总时间，再除以 30','用力推小球让它摆快一点','用肉眼估计一个周期'], answer:1,
        analysis:'采用<b>累积法</b>：测 30 个周期的总时间再除以 30，可以减小人眼判断起点/终点的误差。' }
    ] },

  { id:'c1s1q9', section:'第1节 长度和时间的测量', no:'第9题（多选·图题）', points:10,
    stem:'指出图中小明测量铅笔长度时的错误：',
    note:'本题为多选题，选齐 2 项后自动提交判分。下图为程序化简图复现（原题插图同款布局）。',
    fig:'pencilRuler', figCap:'简图复现：刻度尺 0~5 cm，铅笔左端未对齐 0 刻度线，视线斜向看尺',
    parts:[
      { kind:'multi', opts:['铅笔左端没有对齐 0 刻度线','刻度尺没有放正','视线没有垂直于尺面','读数时没写单位'], answer:[0,2],
        analysis:'图中有两个明显错误：① 铅笔左端没有对齐 0 刻度线（应把一端对齐零刻度线或某一整刻度）；② 视线斜着看，没有与尺面垂直。即使改正了这些错误，仍会有误差，因为误差不可避免。' }
    ] },

  // —— 第2节 运动的描述（c1_s2/quiz.html：教材①~④联动 4 题 + 基础选择 3 题） ——
  { id:'c1s2q1', section:'第2节 运动的描述', no:'练习与应用 第①题', points:12,
    stem:'列车在平直的轨道上行驶。若分别以火车头、车厢的座椅、树木、房屋为参照物，行李架上的物品相对于哪些参照物是静止的，相对于哪些参照物是运动的？',
    note:'本题在节页为逐行点选联动题，此处拆为 4 个小判断，每问即时判分。提示：物品和列车一起前进，它跟谁的位置不变，就相对谁静止。',
    parts:[
      { kind:'choice', q:'① 以火车头为参照物，行李架上的物品：', opts:['静止','运动'], answer:0,
        analysis:'物品和火车头一起前进，位置不变 → <b>静止</b>。' },
      { kind:'choice', q:'② 以车厢的座椅为参照物，行李架上的物品：', opts:['静止','运动'], answer:0,
        analysis:'物品随车厢一起动，和座椅位置不变 → <b>静止</b>。' },
      { kind:'choice', q:'③ 以树木为参照物，行李架上的物品：', opts:['静止','运动'], answer:1,
        analysis:'列车驶过，物品和树木位置不断变化 → <b>运动</b>。' },
      { kind:'choice', q:'④ 以房屋为参照物，行李架上的物品：', opts:['静止','运动'], answer:1,
        analysis:'列车驶过，物品和房屋位置不断变化 → <b>运动</b>。' }
    ] },

  { id:'c1s2q2', section:'第2节 运动的描述', no:'练习与应用 第②题', points:10,
    stem:'鲁迅的《社戏》中有这样的描写：「淡黑的起伏的连山，仿佛是踊跃的铁的兽脊似的，都远远地向船尾跑去了……」其中「山……向船尾跑去了」所选的参照物是什么？',
    parts:[
      { kind:'choice', opts:['河岸','船（和船上的乘客）','岸边的房屋','远处的连山'], answer:1,
        analysis:'参照物是 <b>船（或船上的人）</b>。船在前进中，乘客以船为标准、认为船不动，连山相对船的位置不断向后变化，所以说山「向船尾跑去了」。这正是运动和静止的<b>相对性</b>。' }
    ] },

  { id:'c1s2q3', section:'第2节 运动的描述', no:'练习与应用 第③题（空间站对接）', points:12,
    stem:'中国空间站的梦天实验舱与天和核心舱成功对接，转位后形成空间站「T」字基本构型。结合对接过程（对接前梦天靠近天和→对接完成两舱相接→转位成「T」字构型），逐个回答三个问题。',
    note:'本题在节页为对接动画联动题，此处以文字呈现三个小问，每问即时判分。提示：位置在变 → 运动；位置不变 → 静止。',
    parts:[
      { kind:'choice', q:'① 对接前（靠近过程中），以天和为参照物，梦天：', opts:['运动','静止'], answer:0,
        analysis:'靠近过程中，梦天与天和的位置在变 → <b>运动</b>。' },
      { kind:'choice', q:'② 对接完成后，仍以天和为参照物，梦天：', opts:['运动','静止'], answer:1,
        analysis:'对接后两舱连为一体，相对位置不变 → <b>静止</b>。' },
      { kind:'choice', q:'③ 以地面指挥中心为参照物，梦天：', opts:['运动','静止'], answer:0,
        analysis:'空间站绕地球飞行，梦天相对地面的位置一直在变 → <b>运动</b>（任何阶段都如此）。' }
    ] },

  { id:'c1s2q4', section:'第2节 运动的描述', no:'练习与应用 第④题', points:10,
    stem:'当你乘坐观光电梯观察电梯外的建筑物时，你是如何判断观光电梯是在上行还是在下行的？请利用参照物的概念，说出你判断的根据。',
    note:'本题为开放说理题，作答后对照参考答案自评计分。',
    parts:[
      { kind:'open',
        ref:'参考答案：以电梯外的<b>建筑物</b>为参照物。若建筑物相对自己在<b>向下</b>移动，说明电梯在<b>上行</b>；若建筑物相对自己在<b>向上</b>移动，说明电梯在<b>下行</b>。判断依据：看建筑物与电梯（或自己）之间的<b>相对位置如何变化</b>。',
        analysis:'判分：参照物=电梯外的建筑物；依据=看建筑物与自己的相对位置如何变化（向下移→上行，向上移→下行）。' }
    ] },

  { id:'c1s2q5', section:'第2节 运动的描述', no:'基础选择 第1题', points:10,
    stem:'下列现象中属于机械运动的是（　　）',
    parts:[
      { kind:'choice', opts:['五四运动','候鸟迁徙','心潮澎湃','星光闪烁'], answer:1,
        analysis:'机械运动是指物体<b>位置随时间的变化</b>。候鸟迁徙时位置不断变化，属于机械运动；「五四运动」是社会运动，「心潮澎湃」是心理活动，「星光闪烁」主要是大气折射现象，都不是物体的位置变化。' }
    ] },

  { id:'c1s2q6', section:'第2节 运动的描述', no:'基础选择 第2题', points:10,
    stem:'关于参照物，下列说法正确的是（　　）',
    parts:[
      { kind:'choice', opts:['参照物必须是静止不动的物体','只能选地面作参照物','参照物可以根据需要任意选择','研究物体运动时可以不选参照物'], answer:2,
        analysis:'参照物是假定不动、作为标准的物体，可以<b>根据需要任意选择</b>；选不同参照物，同一物体的运动情况结论一般不同。研究运动必须先选参照物，地面只是常用选择之一。' }
    ] },

  { id:'c1s2q7', section:'第2节 运动的描述', no:'基础选择 第3题', points:10,
    stem:'小明坐在行驶的公交车上，说他是静止的，所选的参照物可能是（　　）',
    parts:[
      { kind:'choice', opts:['路边的树木','公交车的车厢','迎面驶来的汽车','路边的行人'], answer:1,
        analysis:'小明和公交车车厢之间的位置没有变化，以<b>车厢</b>为参照物他是静止的；而树木、迎面汽车、行人相对他位置都在变，以它们为参照物小明是运动的。' }
    ] },

  // —— 第3节 运动的快慢（c1_s3/quiz.html 练习与应用 6 题，原为揭晓答案式，此处填空/选择即时判分） ——
  { id:'c1s3q1', section:'第3节 运动的快慢', no:'练习与应用 练习1', points:12,
    stem:'某老师晨练时，在 45 min 内步行走 4.5 km。他在这段时间内行走的速度是多少千米每小时？相当于多少米每秒？',
    note:'两空均即时判分，等价写法（带不带单位）均认可。',
    parts:[
      { kind:'blank', q:'① 行走的速度是多少千米每小时？相当于多少米每秒？', blanks:[
        { label:'速度（km/h）', answer:['6','6km/h','6 km/h','6千米每小时','6公里每小时'], unit:'km/h' },
        { label:'速度（m/s）', answer:['1.7','1.67','约1.7','约1.67','1.7m/s','1.67m/s','1.7 m/s','1.67 m/s'], unit:'m/s' }],
        analysis:'t = 45 min = 0.75 h；v = s ÷ t = 4.5 km ÷ 0.75 h = <b>6 km/h</b>；6 km/h = 6 ÷ 3.6 m/s ≈ <b>1.7 m/s</b>（≈1.67 m/s）。' }
    ] },

  { id:'c1s3q2', section:'第3节 运动的快慢', no:'练习与应用 练习2（图1.3-2）', points:10,
    stem:'图1.3-2中显示某汽车行驶的速度。若按此速度匀速行驶 10 km，则汽车行驶的时间是多少分？',
    note:'下图为程序化简图复现（原图细节以印刷原书为准）。填空即时判分。',
    fig:'speedDial', figCap:'图1.3-2 简图复现：汽车速度表，主刻度 0~240、每大格 20，单位 km/h，指针指 80',
    parts:[
      { kind:'blank', blanks:[
        { label:'行驶的时间', answer:['7.5','7.5min','7.5 min','7.5分','0.125','0.125h','0.125 h','0.125小时'], unit:'min' }],
        analysis:'读表盘：主刻度 0—240、每大格 20，单位 km/h，指针指 <b>80</b> → v = 80 km/h；t = s ÷ v = 10 km ÷ 80 km/h = 0.125 h = <b>7.5 min</b>。' }
    ] },

  { id:'c1s3q3', section:'第3节 运动的快慢', no:'练习与应用 练习3', points:10,
    stem:'在平直的公路上，某同学观察到大巴车上的速度显示屏开始显示 72 km/h。他用电子表测出大巴车由第1根路灯杆行驶到第6根路灯杆的时间为 10 s。若路灯杆之间是等距的，则相邻两路灯杆之间的距离是多少？',
    parts:[
      { kind:'blank', blanks:[
        { label:'相邻两路灯杆之间的距离', answer:['40','40m','40 m','40米'], unit:'m' }],
        analysis:'换算：v = 72 km/h = 72 ÷ 3.6 m/s = 20 m/s；路程：s = v·t = 20 m/s × 10 s = 200 m；第1根到第6根共 5 个间隔：d = 200 m ÷ 5 = <b>40 m</b>。' }
    ] },

  { id:'c1s3q4', section:'第3节 运动的快慢', no:'练习与应用 练习4', points:12,
    stem:'由北京南站到上海虹桥站的某次高速列车运行信息如下表所示。（1）列车由北京南站驶往上海虹桥站全程的平均速度是多少？（2）列车在哪个路段运行得最快？在哪个路段运行得最慢？',
    note:'信息表见下表（逐字）。①填空 + ②③单选均即时判分。',
    fig:'trainTable', figCap:'表：某次高速列车运行信息',
    parts:[
      { kind:'blank', q:'（1）全程的平均速度是多少？', blanks:[
        { label:'全程平均速度', answer:['284.5','约284.5','284.5km/h','284.4','284.46','284.6','284.7','284.4km/h','284.46km/h','284.5 km/h'], unit:'km/h' }],
        analysis:'全程：s = 1318 km，t = 4 h 38 min ≈ 4.633 h；v = 1318 ÷ 4.633 ≈ <b>284.5 km/h</b>。' },
      { kind:'choice', q:'（2）列车在哪个路段运行得最快？',
        opts:['北京南→天津南','天津南→济南西','济南西→南京南','南京南→上海虹桥'], answer:2,
        analysis:'分段：北京南→天津南 122 km/31 min ≈ 236.1 km/h；天津南→济南西 284 km/60 min = 284 km/h；济南西→南京南 617 km/118 min ≈ <b>313.7 km/h（最快）</b>；南京南→上海虹桥 295 km/63 min ≈ 281.0 km/h。' },
      { kind:'choice', q:'（3）列车在哪个路段运行得最慢？',
        opts:['北京南→天津南','天津南→济南西','济南西→南京南','南京南→上海虹桥'], answer:0,
        analysis:'同分段比较，最慢为 <b>北京南→天津南</b>（≈236.1 km/h）。' }
    ] },

  { id:'c1s3q5', section:'第3节 运动的快慢', no:'练习与应用 练习5（拓展）', points:12,
    stem:'声音在空气中的传播速度约为 340 m/s。雷雨时，小明看到闪电后经过 3 s 才听到雷声。闪电发生处距小明大约多少米？合多少千米？（光的传播时间忽略不计）',
    note:'两空均即时判分，等价写法（带不带单位）均认可。',
    parts:[
      { kind:'blank', blanks:[
        { label:'距离（m）', answer:['1020','1020m','1020 m','1020米'], unit:'m' },
        { label:'合（km）', answer:['1.02','1.02km','1.02 km','1.02千米','1.02公里'], unit:'km' }],
        analysis:'光的传播时间忽略不计，声音传播时间 t = 3 s，速度 v = 340 m/s；由 v = s/t 得 s = v·t = 340 m/s × 3 s = <b>1020 m</b>；1020 m = <b>1.02 km</b>，即闪电处距小明约 1020 m（1.02 km）。' }
    ] },

  { id:'c1s3q6', section:'第3节 运动的快慢', no:'练习与应用 练习6（拓展）', points:12,
    stem:'某客机巡航速度约为 900 km/h，合多少米每秒？某轮船以 20 kn（节，1 kn = 1.852 km/h）的速度航行，合多少千米每小时？',
    note:'两空均即时判分，等价写法（带不带单位）均认可。',
    parts:[
      { kind:'blank', blanks:[
        { label:'客机（m/s）', answer:['250','250m/s','250 m/s'], unit:'m/s' },
        { label:'轮船（km/h）', answer:['37.04','37','37.0','约37','约37.04','37.04km/h','37km/h','37.04 km/h','37 km/h'], unit:'km/h' }],
        analysis:'客机：900 km/h ÷ 3.6 = <b>250 m/s</b>；轮船：20 kn × 1.852 km/h = <b>37.04 km/h</b>（约 37 km/h）。' }
    ] },

  // —— 第4节 速度的测量（c1_s4/quiz.html 练习与应用 5 题） ——
  { id:'c1s4q1', section:'第4节 速度的测量', no:'练习与应用 练习1', points:12,
    stem:'要测量某同学从滑梯顶端滑到底端的平均速度，需要测量哪些物理量？用什么测量工具？',
    note:'本题在节页为下拉选择联动题，此处拆为 3 个单选小问，每问即时判分。',
    parts:[
      { kind:'choice', q:'① 需要测量的物理量是：',
        opts:['路程 s 和时间 t','速度 v 和时间 t','路程 s 和速度 v','质量 m 和时间 t'], answer:0,
        analysis:'求平均速度需要测的是<b>路程 s 和时间 t</b>，再依据 v = s/t 计算。' },
      { kind:'choice', q:'② 测路程用的工具是：',
        opts:['刻度尺 / 卷尺','秒表 / 手表','天平','温度计','弹簧测力计'], answer:0,
        analysis:'测路程用 <b>刻度尺（或卷尺）</b>。' },
      { kind:'choice', q:'③ 测时间用的工具是：',
        opts:['刻度尺 / 卷尺','秒表 / 手表','天平','温度计'], answer:1,
        analysis:'测时间用 <b>秒表（或手表）</b>；再依据 <b>v = s / t</b> 计算平均速度。' }
    ] },

  { id:'c1s4q2', section:'第4节 速度的测量', no:'练习与应用 练习2（频闪照片示意图）', points:12,
    stem:'某同学利用如图所示的装置测量小球在斜面上运动的速度。让小球从 A 点由静止开始沿斜面运动，并记录小球在 A、B、C 三个位置的时刻。小球在 AB、BC、AC 各段运动的平均速度分别是多少？',
    note:'下图为程序化简图复现（原题插图同款布局：刻度尺 0~100 cm，A 在 100 cm 处、B 在 75 cm 处、C 在 0 处）。填空即时判分。',
    fig:'inclineRuler', figCap:'简图复现：频闪照片示意图（位置对应刻度尺），A=100 cm（00:00.00）、B=75 cm（00:01.00）、C=0（00:02.00）',
    parts:[
      { kind:'blank', q:'① AB 段：时间 tAB 与平均速度 vAB 分别是多少？', blanks:[
        { label:'tAB', answer:['1','1.0','1.00','1s','1.00s','1 s'], unit:'s' },
        { label:'vAB', answer:['25','25cm/s','25 cm/s'], unit:'cm/s' }],
        analysis:'sAB = 100 − 75 = <b>25 cm</b>（由图上刻度读出）；tAB = 00:01.00 − 00:00.00 = <b>1.00 s</b>；vAB = 25 cm / 1.00 s = <b>25 cm/s</b>。' },
      { kind:'blank', q:'② BC 段：平均速度 vBC 是多少？', blanks:[
        { label:'vBC', answer:['75','75cm/s','75 cm/s'], unit:'cm/s' }],
        analysis:'sBC = 75 − 0 = <b>75 cm</b>；tBC = <b>1.00 s</b>；vBC = 75 cm / 1.00 s = <b>75 cm/s</b>。' },
      { kind:'blank', q:'③ AC 段：时间 tAC 与平均速度 vAC 分别是多少？', blanks:[
        { label:'tAC', answer:['2','2.0','2.00','2s','2.00s','2 s'], unit:'s' },
        { label:'vAC', answer:['50','50cm/s','50 cm/s'], unit:'cm/s' }],
        analysis:'sAC = 100 − 0 = <b>100 cm</b>；tAC = <b>2.00 s</b>（由图上时刻算出）；vAC = 100 cm / 2.00 s = <b>50 cm/s</b>。' }
    ] },

  { id:'c1s4q3', section:'第4节 速度的测量', no:'练习与应用 练习3（图1.4-2）', points:12,
    stem:'在用图 1.4-2 中的装置测量小车的速度时，甲同学测得小车通过斜面全程的速度 v1 和通过上半段路程的速度 v2 不同；甲同学和乙同学用同一装置测得的 v2 也不同。请写出以上两种情况中测得的速度不同的原因。',
    note:'本题在节页为点选原因判定，此处拆为两个单选小问（对应两种情况，选项相同），每问即时判分。',
    parts:[
      { kind:'choice', q:'① 甲同学测得 v1 与 v2 不同的原因是：',
        opts:['不同同学的测量存在误差，导致结果不同','小车做变速运动，不同路段的平均速度本来就不相同','两人用的测量工具不同，所以结果不同','小车每次从同一位置释放，速度应该完全相同'], answer:1,
        analysis:'小车沿斜面下滑时速度越来越快，做的是<b>变速运动</b>。全程的平均速度 v1 与上半段的平均速度 v2 对应的是<b>不同路段</b>，因此这两个速度本来就不同。' },
      { kind:'choice', q:'② 甲、乙同学用同一装置测得 v2 不同的原因是：',
        opts:['不同同学的测量存在误差，导致结果不同','小车做变速运动，不同路段的平均速度本来就不相同','两人用的测量工具不同，所以结果不同','小车每次从同一位置释放，速度应该完全相同'], answer:0,
        analysis:'即使测量同一装置、同一路段，不同同学用手表计时、用刻度尺读数时也会存在<b>测量误差</b>，导致算出的 v2 不完全相同。多次测量取平均值可以减小这种误差。' }
    ] },

  { id:'c1s4q4', section:'第4节 速度的测量', no:'练习与应用 练习4', points:10,
    stem:'已知学校操场的跑道长度为 l。想估测自己正常步行的速度 v，并进一步估测家到学校的路程 s：可以先用手表测出沿跑道走一圈所用的时间，再用手表测出从家走到学校所用的时间。下列测量与表示方法正确的是？',
    parts:[
      { kind:'choice',
        opts:['测出走一圈所用时间 t，则 v = l / t；再测出从家走到学校所用时间 t′，则 s = v · t′ = (l / t) · t′',
              '测出走一圈所用时间 t，则 v = t / l；再测出从家走到学校所用时间 t′，则 s = t′ / v',
              '不需要测时间，用刻度尺直接量出家到学校的距离就是 s，v 与 l、时间都无关',
              '测出走一圈所用时间 t，则 v = l · t；再测出从家走到学校所用时间 t′，则 s = l · t′'], answer:0,
        analysis:'需要测量的物理量：<b>操场跑道长度 l</b>、<b>沿跑道步行一圈所用时间 t</b>、<b>从家走到学校所用时间 t′</b>。步行速度 <b>v = l / t</b>（路程除以时间）；家到学校路程 <b>s = v · t′ = (l / t) · t′</b>（速度乘以时间）。' }
    ] },

  { id:'c1s4q5', section:'第4节 速度的测量', no:'练习与应用 练习5', points:10,
    stem:'有些公路旁每隔 1 km 就立着一个里程碑。请你利用里程碑估测自行车的速度，写出你的估测方法。',
    note:'本题为开放方法题，作答后对照参考答案自评计分。',
    parts:[
      { kind:'open',
        ref:'参考答案：<br>① 骑自行车沿公路前进，当经过某一里程碑时<b>开始计时</b>，同时数记经过的里程碑数；<br>② 若记录了经过 <b>n</b> 个相邻里程碑所用时间为 <b>t</b>，则行驶的路程 <b>s = n × 1 km = n km</b>；<br>③ 自行车的平均速度 <b>v = s / t = n km / t</b>（若 t 用小时作单位，结果单位就是 km/h）；<br>④ 例如：经过 1 个里程碑用时 5 min（即 1/12 h），则 v = 1 km ÷ (1/12) h = <b>12 km/h</b>。',
        analysis:'方法=数里程碑（n 个间隔 × 1 km 得路程）+ 手表计时，v = s/t；示例：1 个里程碑 5 min ≈ 12 km/h。' }
    ] },

]; // 闭合 QUESTIONS 数组（共 27 题：第1节×9、第2节×7、第3节×6、第4节×5；总分 288）

/* ===== 状态与持久化 ===== */
const STORAGE_KEY = 'c1_practice_state_v1';
let STATE = { scores: {}, done: {}, choice: {}, blank: {}, open: {}, multi: {} };

function initState() {
  const defaults = { scores: {}, done: {}, choice: {}, blank: {}, open: {}, multi: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    STATE = Object.assign({}, defaults, saved);
  } catch (e) { STATE = defaults; }
  ['scores', 'done', 'choice', 'blank', 'open', 'multi'].forEach(k => { if (!STATE[k]) STATE[k] = {}; });
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); } catch (e) {}
}
function findQ(qid) { return QUESTIONS.find(q => q.id === qid); }
function partPoints(q, pi) {
  const n = q.parts && q.parts.length ? q.parts.length : 1;
  return Math.round(q.points / n);
}
function norm(s) {
  return String(s == null ? '' : s).replace(/[＋]/g, '+').replace(/[－]/g, '-').replace(/[。．]/g, '').replace(/\s/g, '').trim();
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function $1(sel, el) { return (el || document).querySelector(sel); }
function $all(sel, el) { return Array.from((el || document).querySelectorAll(sel)); }

/* ===== 程序化插图 ===== */
const FIGURES = {
  pencilRuler: svgPencilRuler,
  speedDial: svgSpeedDial,
  trainTable: htmlTrainTable,
  inclineRuler: svgInclineRuler
};

/* c1s1q9 简图：刻度尺+铅笔+斜视线（自 c1_s1/quiz.html 第9题原插图移植，配色适配深色底） */
function svgPencilRuler() {
  let s = '';
  // 刻度尺
  s += `<rect x="50" y="50" width="320" height="44" fill="#f2ede2" stroke="#9aa4b5" rx="3"/>`;
  s += `<line x1="50" y1="50" x2="50" y2="94" stroke="#2c2c2c"/><line x1="370" y1="50" x2="370" y2="94" stroke="#2c2c2c"/>`;
  const xs = [50, 121.43, 192.86, 264.29, 335.71, 370];
  const labels = ['0', '1', '2', '3', '4', '5 cm'];
  xs.forEach((x, i) => {
    s += `<line x1="${x}" y1="50" x2="${x}" y2="70" stroke="#2c2c2c"/>`;
    s += `<text x="${x}" y="108" fill="#9aa4b5" font-size="11" text-anchor="middle" dominant-baseline="middle">${labels[i]}</text>`;
  });
  // 铅笔（左端在 x=40，未对齐 0 刻度）
  s += `<rect x="40" y="108" width="280" height="20" fill="#e08e5e" rx="3"/>`;
  s += `<polygon points="320,108 340,118 320,128" fill="#d4a017"/>`;
  s += `<circle cx="40" cy="118" r="4" fill="#b8860b"/>`;
  s += `<text x="175" y="160" text-anchor="middle" font-size="12" fill="#9aa4b5">铅笔</text>`;
  // 斜视线（未垂直尺面）
  s += `<line x1="360" y1="20" x2="320" y2="105" stroke="#ff7a6e" stroke-width="1.5" stroke-dasharray="5,4"/>`;
  s += `<text x="350" y="15" text-anchor="end" font-size="12" fill="#ff7a6e" font-weight="700">视线</text>`;
  return `<svg viewBox="0 0 420 180" role="img" aria-label="简图复现：刻度尺0至5厘米，铅笔左端未对齐0刻度线，视线斜向看尺">${s}</svg>`;
}

/* c1s3q2 图1.3-2 简图：汽车速度表（0~240 km/h、每大格 20，指针指 80），自 c1_s3/quiz.html 原表盘移植 */
function svgSpeedDial() {
  let s = `<circle cx="100" cy="100" r="92" fill="#101820" stroke="#c9d4dd" stroke-width="6"/>`;
  for (let v = 0; v <= 240; v += 10) {
    const major = v % 20 === 0;
    s += `<line x1="100" y1="${major ? 14 : 18}" x2="100" y2="26" stroke="#7fd4ff" stroke-width="${major ? 2 : 1}" transform="rotate(${v - 120} 100 100)"/>`;
    if (major) {
      const a = (v - 120) * Math.PI / 180;
      s += `<text x="${(100 + 60 * Math.sin(a)).toFixed(1)}" y="${(104 - 60 * Math.cos(a)).toFixed(1)}" fill="#7fd4ff" font-size="12" font-weight="700" text-anchor="middle">${v}</text>`;
    }
  }
  s += `<line x1="100" y1="100" x2="100" y2="26" stroke="#e74c3c" stroke-width="5" stroke-linecap="round" transform="rotate(-40 100 100)"/>`;
  s += `<circle cx="100" cy="100" r="12" fill="#5a6672"/>`;
  s += `<text x="100" y="140" fill="#7fd4ff" font-size="11" text-anchor="middle">km/h</text>`;
  return `<svg viewBox="0 0 200 200" role="img" aria-label="图1.3-2简图复现：汽车速度表，主刻度0至240，每大格20，单位千米每小时，指针指80">${s}</svg>`;
}

/* c1s3q4 列车运行信息表（自 c1_s3/quiz.html 练习4 原表逐字） */
function htmlTrainTable() {
  const rows = [
    ['1', '北京南', '\\', '12:00', '0', '0'],
    ['2', '天津南', '12:31', '12:33', '31分', '122 km'],
    ['3', '济南西', '13:33', '13:35', '1小时33分', '406 km'],
    ['4', '南京南', '15:33', '15:35', '3小时33分', '1 023 km'],
    ['5', '上海虹桥', '16:38', '\\', '4小时38分', '1 318 km']
  ];
  return `<table class="dtab"><thead><tr><th>站序</th><th>站名</th><th>到时</th><th>发时</th><th>运行时间</th><th>里程</th></tr></thead><tbody>`
    + rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')
    + `</tbody></table>`;
}

/* c1s4q2 简图：频闪照片示意图（刻度尺 0~100 cm，A=100/B=75/C=0 与对应时刻），自 c1_s4/quiz.html 练习2 原插图移植 */
function svgInclineRuler() {
  let s = `<rect x="40" y="80" width="404" height="28" rx="4" fill="rgba(255,255,255,.1)" stroke="#9aa4b5"/>`;
  s += `<text x="260" y="70" text-anchor="middle" font-size="12" fill="#9aa4b5">频闪照片示意图（位置对应刻度尺）</text>`;
  for (let cm = 0; cm <= 100; cm += 2) {
    const x = 40 + cm * 4;
    const big = cm % 10 === 0;
    s += `<line x1="${x}" y1="80" x2="${x}" y2="${big ? 92 : 86}" stroke="#9aa4b5" stroke-width="${big ? 1.5 : 1}"/>`;
    if (big) s += `<text x="${x}" y="103" text-anchor="middle" font-size="10" fill="#9aa4b5">${cm}</text>`;
  }
  s += `<text x="470" y="103" text-anchor="middle" font-size="11" fill="#9aa4b5">cm</text>`;
  const pts = [
    { x: 440, fill: '#e74c3c', edge: '#ff9d93', name: 'A', t: '00:00.00' },
    { x: 340, fill: '#f39c12', edge: '#ffd479', name: 'B', t: '00:01.00' },
    { x: 40,  fill: '#27ae60', edge: '#7de8a8', name: 'C', t: '00:02.00' }
  ];
  pts.forEach(p => {
    s += `<circle cx="${p.x}" cy="70" r="10" fill="${p.fill}" stroke="${p.edge}" stroke-width="2"/>`;
    s += `<text x="${p.x}" y="55" text-anchor="middle" font-size="13" font-weight="700" fill="${p.edge}">${p.name}</text>`;
    s += `<text x="${p.x}" y="132" text-anchor="middle" font-size="11" fill="#9aa4b5">${p.t}</text>`;
  });
  return `<svg viewBox="0 0 520 150" role="img" aria-label="简图复现：频闪照片示意图，刻度尺0至100厘米，A在100厘米处时刻0分0秒，B在75厘米处时刻1秒，C在0处时刻2秒">${s}</svg>`;
}

/* ===== 渲染引擎 ===== */
function renderFig(fig, figCap) {
  if (!fig || !FIGURES[fig]) return '';
  return `<div class="figbox">${FIGURES[fig]()}<div class="figcap">${esc(figCap || '')}</div></div>`;
}
function renderPart(q, pi) {
  const p = q.parts[pi];
  const key = `${q.id}_${pi}`;
  const head = p.q ? `<div class="pp"><b>${esc(p.q)}</b></div>` : '';
  if (p.kind === 'choice') {
    const opts = p.opts.map((opt, idx) =>
      `<button class="opt" data-qid="${q.id}" data-pi="${pi}" data-idx="${idx}">${['A','B','C','D','E'][idx]}. ${esc(opt)}</button>`
    ).join('');
    return `<div class="part" data-key="${key}">${head}<div class="opts">${opts}</div><div class="fb" data-role="fb"></div></div>`;
  }
  if (p.kind === 'multi') {
    const opts = p.opts.map((opt, idx) =>
      `<button class="opt mopt" data-qid="${q.id}" data-pi="${pi}" data-idx="${idx}">${['A','B','C','D'][idx]}. ${esc(opt)}</button>`
    ).join('');
    return `<div class="part" data-key="${key}">${head}<div class="multi-hint">多选题 · 共选 ${p.answer.length} 项，选齐后自动提交判分</div><div class="opts">${opts}</div><div class="fb" data-role="fb"></div></div>`;
  }
  if (p.kind === 'blank') {
    const rows = p.blanks.map((b, bi) =>
      `<div class="blankrow"><span>${esc(b.label)}：</span><input type="text" class="blank-inp" data-bi="${bi}" data-qid="${q.id}" data-pi="${pi}" placeholder="作答"${b.unit ? ` aria-label="${esc(b.label)}"` : ''}><span>${esc(b.unit || '')}</span></div>`
    ).join('');
    return `<div class="part" data-key="${key}">${head}${rows}<button class="btn blank-check" data-qid="${q.id}" data-pi="${pi}">提交答案</button><div class="fb" data-role="fb"></div></div>`;
  }
  if (p.kind === 'open') {
    return `<div class="part" data-key="${key}">${head}
      <button class="btn ghost ref-toggle" data-qid="${q.id}" data-pi="${pi}">查看参考答案</button>
      <div class="ref">${p.ref}</div>
      <div class="selfrow">
        <button class="btn gold self-score" data-qid="${q.id}" data-pi="${pi}" data-ratio="1">满分</button>
        <button class="btn self-score" data-qid="${q.id}" data-pi="${pi}" data-ratio="0.5">半分</button>
        <button class="btn ghost self-score" data-qid="${q.id}" data-pi="${pi}" data-ratio="0">0分</button>
      </div>
      <div class="fb" data-role="fb"></div>
    </div>`;
  }
  return '';
}
function renderQuestion(q) {
  return `<div class="qcard" id="${q.id}">
    <div class="qno"><b>${esc(q.no)}</b><span>(${q.points}分)</span></div>
    <div class="stem">${esc(q.stem)}</div>
    ${q.note ? `<div class="qnote">${esc(q.note)}</div>` : ''}
    ${renderFig(q.fig, q.figCap)}
    ${q.parts.map((_, pi) => renderPart(q, pi)).join('')}
  </div>`;
}
function renderQuiz() {
  const root = document.getElementById('quizRoot');
  if (!root) return;
  const order = [];
  const groups = {};
  QUESTIONS.forEach(q => {
    if (!groups[q.section]) { groups[q.section] = []; order.push(q.section); }
    groups[q.section].push(q);
  });
  root.innerHTML = order.map(sec =>
    `<section class="sec">`
    + `<div class="sec-head"><h2>${esc(sec)}</h2><span class="chip">${groups[sec].length} 题</span></div>`
    + groups[sec].map(renderQuestion).join('')
    + `</section>`
  ).join('');
  bindEvents();
  restoreUI();
  updateProgress();
}

/* ===== 判分与交互 ===== */
function showFb(el, ok, html) {
  const fb = $1('[data-role="fb"]', el);
  if (!fb) return;
  fb.className = 'fb ' + (ok ? 'ok' : 'err');
  fb.innerHTML = (ok ? '✅ 回答正确' : '❌ 回答错误') + '<div class="an"><b>解析：</b>' + html + '</div>';
}
function setChoiceUI(el, part, chosenIdx) {
  const correctIdx = part.answer;
  $all('.opt', el).forEach(btn => {
    const idx = +btn.dataset.idx;
    btn.disabled = true;
    btn.classList.remove('ok', 'err', 'dim');
    if (idx === correctIdx) btn.classList.add('ok');
    else if (idx === chosenIdx) btn.classList.add('err');
    else btn.classList.add('dim');
  });
  showFb(el, chosenIdx === correctIdx, part.analysis);
}
function sameSet(a, b) {
  const x = (a || []).slice().sort(), y = (b || []).slice().sort();
  return x.length === y.length && x.every((v, i) => v === y[i]);
}
function setMultiUI(el, part, chosen) {
  const correct = part.answer;
  $all('.opt', el).forEach(btn => {
    const idx = +btn.dataset.idx;
    btn.disabled = true;
    btn.classList.remove('ok', 'err', 'dim', 'sel');
    if (correct.includes(idx)) btn.classList.add('ok');
    else if ((chosen || []).includes(idx)) btn.classList.add('err');
    else btn.classList.add('dim');
  });
  showFb(el, sameSet(chosen, correct), part.analysis);
}
function setBlankUI(el, part, vals) {
  const inputs = $all('.blank-inp', el);
  let allOk = true;
  inputs.forEach((inp, bi) => {
    inp.value = (vals && vals[bi]) || '';
    const accepted = part.blanks[bi].answer.map(norm);
    const ok = accepted.includes(norm(inp.value));
    inp.classList.toggle('ok', ok);
    inp.classList.toggle('err', !ok);
    inp.readOnly = true;
    if (!ok) allOk = false;
  });
  const btn = $1('.blank-check', el);
  if (btn) btn.disabled = true;
  showFb(el, allOk, part.analysis);
}
function setOpenUI(el, score, full) {
  $1('.ref', el).classList.add('show');
  $1('.selfrow', el).classList.add('show');
  const tbtn = $1('.ref-toggle', el);
  if (tbtn) tbtn.textContent = '收起参考答案';
  const key = el.dataset.key;
  if (key) STATE.open[key] = true;
  const ratio = full ? score / full : 0;
  $all('.self-score', el).forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('done');
    if (Math.abs(+btn.dataset.ratio - ratio) < 1e-6) btn.classList.add('done');
  });
  const label = score === full ? '满分' : (score === Math.round(full / 2) ? '半分' : '0分');
  showFb(el, score > 0, '已自评：' + label + '。');
}
function restoreUI() {
  Object.keys(STATE.done).forEach(key => {
    if (!STATE.done[key]) return;
    const sep = key.lastIndexOf('_');
    const qid = key.slice(0, sep), pi = +key.slice(sep + 1);
    const q = findQ(qid);
    if (!q) return;
    const part = q.parts[pi];
    const el = $1(`.part[data-key="${key}"]`);
    if (!el) return;
    if (part.kind === 'choice') setChoiceUI(el, part, STATE.choice[key]);
    else if (part.kind === 'multi') setMultiUI(el, part, STATE.multi[key]);
    else if (part.kind === 'blank') setBlankUI(el, part, STATE.blank[key]);
    else if (part.kind === 'open') setOpenUI(el, (STATE.scores[qid] || {})[pi] || 0, partPoints(q, pi));
  });
  Object.keys(STATE.open).forEach(key => {
    if (!STATE.open[key] || STATE.done[key]) return;
    const el = $1(`.part[data-key="${key}"]`);
    if (!el) return;
    $1('.ref', el).classList.add('show');
    $1('.selfrow', el).classList.add('show');
    const tbtn = $1('.ref-toggle', el);
    if (tbtn) tbtn.textContent = '收起参考答案';
  });
}

function bindEvents() {
  $all('.opt').forEach(btn => btn.addEventListener('click', btn.classList.contains('mopt') ? onMultiClick : onChoiceClick));
  $all('.blank-check').forEach(btn => btn.addEventListener('click', onBlankCheck));
  $all('.ref-toggle').forEach(btn => btn.addEventListener('click', onRefToggle));
  $all('.self-score').forEach(btn => btn.addEventListener('click', onSelfScore));
}
function onChoiceClick(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi, idx = +btn.dataset.idx;
  const q = findQ(qid), part = q.parts[pi];
  const key = `${qid}_${pi}`;
  STATE.choice[key] = idx;
  STATE.done[key] = true;
  STATE.scores[qid] = STATE.scores[qid] || {};
  STATE.scores[qid][pi] = (idx === part.answer) ? partPoints(q, pi) : 0;
  saveState();
  setChoiceUI(btn.closest('.part'), part, idx);
  updateProgress();
}
/* multi：点选/再点取消，选齐 answer.length 项后自动提交判分（集合全等=正确），交互与原题源多选一致 */
const MULTI_SEL = {};
function onMultiClick(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi, idx = +btn.dataset.idx;
  const key = `${qid}_${pi}`;
  if (STATE.done[key]) return;
  const q = findQ(qid), part = q.parts[pi];
  if (!MULTI_SEL[key]) MULTI_SEL[key] = [];
  const sel = MULTI_SEL[key];
  const pos = sel.indexOf(idx);
  if (pos >= 0) { sel.splice(pos, 1); btn.classList.remove('sel'); }
  else { sel.push(idx); btn.classList.add('sel'); }
  if (sel.length === part.answer.length) {
    const ok = sameSet(sel, part.answer);
    STATE.multi[key] = sel.slice();
    STATE.done[key] = true;
    STATE.scores[qid] = STATE.scores[qid] || {};
    STATE.scores[qid][pi] = ok ? partPoints(q, pi) : 0;
    saveState();
    setMultiUI(btn.closest('.part'), part, sel.slice());
    updateProgress();
  }
}
function onBlankCheck(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi;
  const q = findQ(qid), part = q.parts[pi];
  const el = btn.closest('.part');
  const inputs = $all('.blank-inp', el);
  const vals = [];
  let allOk = true;
  inputs.forEach((inp, bi) => {
    vals[bi] = inp.value;
    const accepted = part.blanks[bi].answer.map(norm);
    const ok = accepted.includes(norm(inp.value));
    inp.classList.toggle('ok', ok);
    inp.classList.toggle('err', !ok);
    inp.readOnly = true;
    if (!ok) allOk = false;
  });
  const key = `${qid}_${pi}`;
  STATE.blank[key] = vals;
  STATE.done[key] = true;
  STATE.scores[qid] = STATE.scores[qid] || {};
  STATE.scores[qid][pi] = allOk ? partPoints(q, pi) : 0;
  saveState();
  btn.disabled = true;
  setBlankUI(el, part, vals);
  updateProgress();
}
function onRefToggle(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi;
  const el = btn.closest('.part');
  const shown = $1('.ref', el).classList.toggle('show');
  $1('.selfrow', el).classList.toggle('show');
  btn.textContent = shown ? '收起参考答案' : '查看参考答案';
  STATE.open[`${qid}_${pi}`] = shown;
  saveState();
}
function onSelfScore(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi, ratio = +btn.dataset.ratio;
  const q = findQ(qid), part = q.parts[pi];
  const key = `${qid}_${pi}`;
  const full = partPoints(q, pi);
  STATE.done[key] = true;
  STATE.open[key] = true;
  STATE.scores[qid] = STATE.scores[qid] || {};
  STATE.scores[qid][pi] = Math.round(full * ratio);
  saveState();
  const el = btn.closest('.part');
  $all('.self-score', el).forEach(b => { b.disabled = true; b.classList.remove('done'); });
  btn.classList.add('done');
  const label = ratio === 1 ? '满分' : (ratio === 0.5 ? '半分' : '0分');
  showFb(el, ratio > 0, '自评得分：' + label + '。' + part.analysis);
  updateProgress();
}
function updateProgress() {
  let doneCount = 0, total = 0;
  QUESTIONS.forEach(q => {
    const allDone = q.parts.every((_, pi) => STATE.done[`${q.id}_${pi}`]);
    if (allDone) doneCount++;
    q.parts.forEach((_, pi) => {
      total += ((STATE.scores[q.id] || {})[pi] || 0);
    });
  });
  const progBar = document.getElementById('progBar');
  const progTxt = document.getElementById('progTxt');
  const totalScore = document.getElementById('totalScore');
  if (progBar) progBar.style.width = (doneCount / QUESTIONS.length * 100) + '%';
  if (progTxt) progTxt.textContent = `已完成 ${doneCount} / ${QUESTIONS.length} 题`;
  if (totalScore) {
    totalScore.style.display = 'inline';
    totalScore.textContent = `总分 ${total} 分`;
  }
  const root = document.getElementById('quizRoot');
  let summary = document.getElementById('allDoneSummary');
  if (doneCount === QUESTIONS.length && root && !summary) {
    summary = document.createElement('div');
    summary.id = 'allDoneSummary';
    summary.className = 'qcard';
    summary.innerHTML = `<div class="stem">🎉 本章练习全部完成！</div><div class="pp">${QUESTIONS.length} / ${QUESTIONS.length} 题已作答，当前总得分 <b style="color:#ffd479">${total} 分</b>。继续加油！</div>`;
    root.appendChild(summary);
  } else if (summary) {
    summary.querySelector('b').textContent = total + ' 分';
  }
}

function bindRedo() {
  const btn = document.getElementById('redoBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!window.confirm('确定重做本章练习吗？当前全部作答记录与得分将被清空。')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    location.reload();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initState();
  renderQuiz();
  bindRedo();
});

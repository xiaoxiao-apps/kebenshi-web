/* ===== 本章练习题库（第一章 机械运动） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / multi=多选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 题目：围绕各节知识点编写的原创题（第1节 9 题、第2节 7 题、第3节 6 题、第4节 5 题），
 *      交互联动型题拆分为小问（note 说明）；共 27 题，总分 288 分（各题 points 之和）。
 * multi 类型说明：c1s1q7、c1s1q9 为多选题（选择完毕后点提交按钮判分），在样板 choice/blank/open 之外
 *      最小增补 multi 一种 part 类型，样板既有判分逻辑零改动。
 * 分值规则对齐样板：单 part 题 10 分，多 part/多空题 12 分。
 */
const QUESTIONS = [
  // —— 第1节 长度和时间的测量（9 题） ——
  { id:'c1s1q1', section:'长度和时间的测量', no:'第1题', points:10,
    stem:'课桌的高度大约在几十厘米左右。现用一把分度值为 1 cm 的木尺去测量课桌高度，要求估读到分度值的下一位，下列记录结果符合读数要求的是（　　）',
    parts:[
      { kind:'choice', opts:['75 cm','75.2 cm','75.23 cm','752 cm'], answer:1,
        analysis:'分度值为 1 cm 时，应估读到 0.1 cm，即以 cm 为单位时结果须保留一位小数。<b>75.2 cm</b> 符合要求；75 cm 没有估读；75.23 cm 多写了一位，超出了分度值允许的估读精度；752 cm 与课桌实际高度相差悬殊，属于错误记录。' }
    ] },

  { id:'c1s1q2', section:'长度和时间的测量', no:'第2题', points:10,
    stem:'下列关于刻度尺使用方法的说法中，符合操作要求的是（　　）',
    parts:[
      { kind:'choice', opts:['读数时视线可以斜着看刻度线','被测物体的一端必须与 0 刻度线对齐','读数时应估读到分度值的下一位','挑选刻度尺时只需考虑量程即可'], answer:2,
        analysis:'读数时视线应与尺面垂直；起始端可以对齐任一整刻度线，用末端刻度减去起始刻度即为长度；选尺时量程和分度值都要兼顾。只有<b>读数时应估读到分度值的下一位</b>正确。' }
    ] },

  { id:'c1s1q3', section:'长度和时间的测量', no:'第3题', points:10,
    stem:'观察一块机械停表：小表盘指针位于"2"和"3"之间，并且已越过两刻度的中线；大表盘指针指向 16.5 s。停表显示的时间是（　　）',
    parts:[
      { kind:'choice', opts:['2 min 16.5 s','2 min 46.5 s','3 min 46.5 s','1 min 46.5 s'], answer:1,
        analysis:'小表盘记录分钟：指针在 2 与 3 之间且已过半，说明大表盘处于 30~60 s 区间，秒数应读作 30 s + 16.5 s = 46.5 s。故停表读数为 <b>2 min 46.5 s</b>。' }
    ] },

  { id:'c1s1q4', section:'长度和时间的测量', no:'第4题', points:10,
    stem:'下面是某小组用卷尺对实验桌长度重复测量四次的记录：120.3 cm、119.8 cm、123.5 cm、120.2 cm。四位同学就如何处理这批数据发表了看法，其中合理的是（　　）',
    parts:[
      { kind:'choice', opts:['四个数据一视同仁，求平均得 120.95 cm 作为结果','123.5 cm 与另外三次读数偏差悬殊，属于错误数据，剔除后取平均，结果记为 120.1 cm','多测几次求平均能把误差彻底消除，所以测的次数越多越准','119.8 cm 最接近整数，实验桌长度就记 119.8 cm'], answer:1,
        analysis:'123.5 cm 与其余三次读数相差 3 cm 以上，是读数或操作失误造成的<b>错误数据</b>，应当剔除，再对其余三次求平均：(120.3+119.8+120.2)/3 = 360.3/3 = <b>120.1 cm</b>。错误可以剔除，但误差只能减小、<b>不能彻底消除</b>；把错误数据一并平均（120.95 cm）或单取某个顺眼的数据（119.8 cm）都不合理。' }
    ] },

  { id:'c1s1q5', section:'长度和时间的测量', no:'第5题', points:10,
    stem:'人们常用"分秒必争"提醒自己珍惜时间。把"1 日"换算成秒，结果是（　　）',
    parts:[
      { kind:'choice', opts:['3600 s','12 000 s','24 000 s','86 400 s'], answer:3,
        analysis:'1 日 = 24 h；1 h = 60 min = 3600 s。逐级换算：1 日 = 24 × 3600 s = <b>86 400 s</b>。' }
    ] },

  { id:'c1s1q6', section:'长度和时间的测量', no:'第6题', points:10,
    stem:'用身体部位作"随身尺"是常见的估测办法。一般情况下，人的身高约为脚长的多少倍（常识估测）（　　）',
    parts:[
      { kind:'choice', opts:['约 5 倍','约 7 倍','约 9 倍','约 12 倍'], answer:1,
        analysis:'经验表明，成年人的身高约为脚长的 7 倍。不妨用尺子量出自己的身高和脚长，验证这个比例。' }
    ] },

  { id:'c1s1q7', section:'长度和时间的测量', no:'第7题（多选）', points:10,
    stem:'小杰想测出家里圆形茶盘盖的直径，下列方法中可行的是（多选）',
    note:'本题为多选题，选择完毕后点击提交按钮判分。',
    parts:[
      { kind:'multi', opts:['把刻度尺横盖在盖面上，直接对着读数当直径','用两个三角板把盖子竖夹在中间，量两板内侧间的距离','用细棉线沿盖边绕一周，量出线长再算出直径','在盖子边缘做记号，让盖子在纸上滚一周，量出两记号间的长度再算直径'], answer:[1,2,3],
        analysis:'两块三角板夹住盖子属于<b>辅助法</b>，位置固定、读数准确，可行；棉线绕一周量周长再算直径是<b>化曲为直</b>，可行；滚动一周量痕迹长度是<b>滚圆法</b>，同样常用。而盖面上圆心的位置难以确定，直接横尺读数容易偏大偏小，一般不采用。' }
    ] },

  { id:'c1s1q8', section:'长度和时间的测量', no:'第8题', points:10,
    stem:'科技小组想测出电动机轴上一个小轮子转动一周所用的时间（估计不到 1 s）。手边只有一块停表，下列方案中最能减小计时误差的是（　　）',
    parts:[
      { kind:'choice', opts:['盯着轮子，只在它转一周的瞬间按一次停表','让轮子连续转动，测出 40 周的总时间，再除以 40','把电源电压调高让轮子转得飞快，再测一周的时间','放弃停表，跟着轮子默数节拍来估一周的时间'], answer:1,
        analysis:'轮子转一周的时间太短，起止瞬间的判断偏差占的比重很大。改用<b>累积法</b>（测多算少）：测出 40 周的总时间再除以 40，把同一份起止判断偏差摊薄到 40 周上，单周时间的误差就大为减小。转一周只按一次表、调高转速（周期更短更难掐准）、默数估测都只会让误差更大。' }
    ] },

  { id:'c1s1q9', section:'长度和时间的测量', no:'第9题（多选·图题）', points:10,
    stem:'下图简图中，小芸把一支蜡笔靠在刻度尺旁准备测量它的长度。对照图中情形，她的哪些做法不妥当？选出所有不妥当的项（多选）：',
    note:'本题为多选题，选择完毕后点击提交按钮判分。下图为程序化简图。',
    fig:'pencilRuler',
    parts:[
      { kind:'multi', opts:['刻度尺的零刻度线一端没有靠齐蜡笔的左端','刻度尺没有贴着蜡笔放直放正','读数时视线斜着，没有与尺面保持垂直','她选的刻度尺量程不够，装不下整支蜡笔'], answer:[0,2],
        analysis:'从简图可找出两处不妥：① 蜡笔左端没有对齐零刻度线（若从零刻度线以外的整刻度线量起，也须用末端读数减去起始读数）；② 视线是斜的，读数时应与尺面垂直。图中刻度尺已贴着蜡笔放直放正，且蜡笔整体在 5 cm 量程之内，后两项说法不成立。' }
    ] },

  // —— 第2节 运动的描述（联动型 4 题 + 基础选择 3 题） ——
  { id:'c1s2q1', section:'运动的描述', no:'第①题', points:12,
    stem:'一列动车正在平直的轨道上匀速行驶。车厢行李架上放着一只旅行背包。若分别以车头、车内座椅、铁道旁的大树、田野里的农舍为参照物，背包相对于哪些参照物静止、相对于哪些参照物运动？逐问判断：',
    note:'本题拆为 4 个小判断，每问即时判分。提示：背包随列车一起前进，它与哪个参照物的位置不变，就相对那个参照物静止。',
    parts:[
      { kind:'choice', q:'① 以车头为参照物，背包：', opts:['静止','运动'], answer:0,
        analysis:'背包随列车与车头一同前进，二者位置始终不变 → <b>静止</b>。' },
      { kind:'choice', q:'② 以车内座椅为参照物，背包：', opts:['静止','运动'], answer:0,
        analysis:'背包和座椅同在车厢里，相对位置不变 → <b>静止</b>。' },
      { kind:'choice', q:'③ 以铁道旁的大树为参照物，背包：', opts:['静止','运动'], answer:1,
        analysis:'列车不断驶过，背包与大树之间的距离持续变化 → <b>运动</b>。' },
      { kind:'choice', q:'④ 以田野里的农舍为参照物，背包：', opts:['静止','运动'], answer:1,
        analysis:'列车向前行驶，背包与农舍的位置一直在变 → <b>运动</b>。' }
    ] },

  { id:'c1s2q2', section:'运动的描述', no:'第②题', points:10,
    stem:'坐在夜航的客船上向外望，会看到这样一幕：两岸连绵的青山“唰唰”地朝船尾方向退去。要描述“青山向船尾退去”，所选的参照物是（　　）',
    parts:[
      { kind:'choice', opts:['河岸','客船（或船上的乘客）','岸边的房屋','远处连绵的青山'], answer:1,
        analysis:'乘客以<b>客船（或自己）</b>为标准，默认船不动；船实际在前进，青山相对船的位置不断向后移动，于是看起来是“青山向船尾退去”。这体现了运动和静止的<b>相对性</b>。' }
    ] },

  { id:'c1s2q3', section:'运动的描述', no:'第③题（货运飞船交会对接）', points:12,
    stem:'某货运飞船与在轨运行的空间站完成了一次交会对接。按时间顺序：① 对接前飞船逐步靠近空间站；② 对接完成后两者连为一体飞行；③ 之后飞船转位，与空间站组成新的构型。请逐问判断：',
    note:'本题以文字呈现三个小问，每问即时判分。提示：相对位置在变 → 运动；相对位置不变 → 静止。',
    parts:[
      { kind:'choice', q:'① 对接前（靠近过程中），以空间站为参照物，货运飞船：', opts:['运动','静止'], answer:0,
        analysis:'靠近阶段，飞船与空间站之间的距离不断减小，相对位置在变 → <b>运动</b>。' },
      { kind:'choice', q:'② 对接完成后，仍以空间站为参照物，货运飞船：', opts:['运动','静止'], answer:1,
        analysis:'对接后两者连为一体、共同飞行，相对位置保持不变 → <b>静止</b>。' },
      { kind:'choice', q:'③ 以地面测控中心为参照物，货运飞船：', opts:['运动','静止'], answer:0,
        analysis:'组合体绕地球高速飞行，飞船相对地面的位置始终在变 → <b>运动</b>（对接前后皆如此）。' }
    ] },

  { id:'c1s2q4', section:'运动的描述', no:'第④题', points:10,
    stem:'你乘商场的观光扶梯上楼时，并没有低头看台阶，却能判断出扶梯在向上运行还是向下运行。请运用参照物的知识，说明你的判断方法。',
    note:'本题为开放说理题，作答后对照参考答案自评计分。',
    parts:[
      { kind:'open',
        ref:'参考答案：以扶梯外的<b>楼层（护栏、柜台等固定景物）</b>为参照物。若这些景物相对自己在<b>向下</b>移动，说明扶梯在<b>上行</b>；若景物相对自己在<b>向上</b>移动，说明扶梯在<b>下行</b>。判断依据：看景物与自己之间的<b>相对位置如何变化</b>。',
        analysis:'判分：参照物=扶梯外的固定景物（楼层/护栏等）；依据=景物与自己的相对位置变化方向（景物向下移→上行，向上移→下行）。' }
    ] },

  { id:'c1s2q5', section:'运动的描述', no:'基础选择 第1题', points:10,
    stem:'下列现象中，属于机械运动的是（　　）',
    parts:[
      { kind:'choice', opts:['辛亥革命','大雁南飞','思绪万千','歌声悠扬'], answer:1,
        analysis:'机械运动指物体的<b>位置随时间发生变化</b>。大雁南飞时位置不断变化，属于机械运动；“辛亥革命”是社会变革事件，“思绪万千”是心理活动，“歌声悠扬”描述的是声音现象，都不涉及物体位置的变化。' }
    ] },

  { id:'c1s2q6', section:'运动的描述', no:'基础选择 第2题', points:10,
    stem:'下列关于参照物的说法中，正确的是（　　）',
    parts:[
      { kind:'choice', opts:['参照物一定要选绝对静止的物体','参照物只能选择地面','参照物可以根据研究需要任意选择','描述物体的运动时可以不选参照物'], answer:2,
        analysis:'参照物是被<b>假定为不动</b>、用来作比较标准的物体，可以根据需要任意选择；选择不同的参照物，对同一物体运动的描述结论一般不同。研究运动必须先选定参照物，地面只是其中最常用的一种。' }
    ] },

  { id:'c1s2q7', section:'运动的描述', no:'基础选择 第3题', points:10,
    stem:'小华乘地铁出行，列车正在隧道里行驶。若说小华是静止的，所选的参照物可能是（　　）',
    parts:[
      { kind:'choice', opts:['隧道壁上的灯箱','他乘坐的车厢','对面轨道驶来的列车','站台上的候车乘客'], answer:1,
        analysis:'小华与<b>车厢</b>之间的位置没有变化，以车厢为参照物他是静止的；灯箱、对面列车、站台乘客相对他的位置都在变化，以它们为参照物小华都是运动的。' }
    ] },

  // —— 第3节 运动的快慢（6 题） ——
  { id:'c1s3q1', section:'运动的快慢', no:'练习1', points:12,
    stem:'张大爷每天清晨沿公园步道健走，某天他用 40 min 走完了 3.6 km。他这段时间健走的平均速度是多少千米每小时？合多少米每秒？',
    note:'两空均即时判分，等价写法（带不带单位）均认可。',
    parts:[
      { kind:'blank', q:'① 健走的平均速度是多少千米每小时？合多少米每秒？', blanks:[
        { label:'速度（km/h）', answer:['5.4','5.4km/h','5.4 km/h','5.4千米每小时','5.4公里每小时'], unit:'km/h' },
        { label:'速度（m/s）', answer:['1.5','1.50','1.5m/s','1.5 m/s'], unit:'m/s' }],
        analysis:'t = 40 min = 2/3 h；v = s ÷ t = 3.6 km ÷ (2/3) h = <b>5.4 km/h</b>；再换算：5.4 km/h = 5.4 ÷ 3.6 m/s = <b>1.5 m/s</b>。' }
    ] },

  { id:'c1s3q2', section:'运动的快慢', no:'练习2', points:10,
    stem:'一辆汽车在高速公路上行驶，车内速度表的指针位置见下图简图。若汽车按表显速度匀速行驶 9 km，行驶时间是多少分？',
    note:'下图为程序化简图。填空即时判分。',
    fig:'speedDial',
    parts:[
      { kind:'blank', blanks:[
        { label:'行驶的时间', answer:['9','9min','9 min','9分','0.15','0.15h','0.15 h','0.15小时'], unit:'min' }],
        analysis:'先读表盘：主刻度 0—240、每大格 20，单位 km/h，指针指 <b>60</b>，即 v = 60 km/h；再由 t = s ÷ v = 9 km ÷ 60 km/h = 0.15 h = <b>9 min</b>。' }
    ] },

  { id:'c1s3q3', section:'运动的快慢', no:'练习3', points:10,
    stem:'一辆观光巴士在平直公路上匀速行驶，车内速度显示屏显示 54 km/h。小雨用手机秒表测出巴士从第 1 根路灯杆驶到第 5 根路灯杆共用时 12 s。若路灯杆间距相等，相邻两根路灯杆之间的距离是多少？',
    parts:[
      { kind:'blank', blanks:[
        { label:'相邻两路灯杆之间的距离', answer:['45','45m','45 m','45米'], unit:'m' }],
        analysis:'先统一单位：v = 54 km/h = 54 ÷ 3.6 m/s = 15 m/s；总路程：s = v·t = 15 m/s × 12 s = 180 m；第 1 根到第 5 根之间有 4 个间隔，故 d = 180 m ÷ 4 = <b>45 m</b>。' }
    ] },

  { id:'c1s3q4', section:'运动的快慢', no:'练习4', points:12,
    stem:'某次高速列车由临江站开往滨海站，沿途停靠及运行信息见下表。（1）列车由临江站驶往滨海站全程的平均速度是多少？（2）列车在哪个路段运行得最快？在哪个路段运行得最慢？',
    note:'信息表见下表。①填空 + ②③单选均即时判分。',
    fig:'trainTable',
    parts:[
      { kind:'blank', q:'（1）全程的平均速度是多少？', blanks:[
        { label:'全程平均速度', answer:['230','230km/h','230 km/h','230.0','230千米每小时','230公里每小时'], unit:'km/h' }],
        analysis:'全程：s = 989 km，t = 4 h 18 min = 4.3 h；v = 989 ÷ 4.3 = <b>230 km/h</b>。' },
      { kind:'choice', q:'（2）列车在哪个路段运行得最快？',
        opts:['临江→云山','云山→双河','双河→江州','江州→滨海'], answer:2,
        analysis:'逐段算速度：临江→云山 90 km/30 min = 180 km/h；云山→双河 248 km/62 min = 240 km/h；双河→江州 338 km/78 min = <b>260 km/h（最快）</b>；江州→滨海 313 km/80 min ≈ 234.8 km/h。' },
      { kind:'choice', q:'（3）列车在哪个路段运行得最慢？',
        opts:['临江→云山','云山→双河','双河→江州','江州→滨海'], answer:0,
        analysis:'比较各段结果，最慢的是 <b>临江→云山</b>（180 km/h）。' }
    ] },

  { id:'c1s3q5', section:'运动的快慢', no:'练习5（拓展）', points:12,
    stem:'声音在空气中的传播速度约为 340 m/s。雷雨天，小磊看到窗外一道闪电，过了 4 s 才听到雷声。闪电发生处距小磊大约多少米？合多少千米？（光的传播时间忽略不计）',
    note:'两空均即时判分，等价写法（带不带单位）均认可。',
    parts:[
      { kind:'blank', blanks:[
        { label:'距离（m）', answer:['1360','1360m','1360 m','1360米'], unit:'m' },
        { label:'合（km）', answer:['1.36','1.36km','1.36 km','1.36千米','1.36公里'], unit:'km' }],
        analysis:'光速极快，传播时间可忽略，声音传播时间 t = 4 s，v = 340 m/s；由 v = s/t 得 s = v·t = 340 m/s × 4 s = <b>1360 m</b>；1360 m = <b>1.36 km</b>，即闪电处距小磊约 1360 m（1.36 km）。' }
    ] },

  { id:'c1s3q6', section:'运动的快慢', no:'练习6（拓展）', points:12,
    stem:'一架客机的巡航速度约为 864 km/h，合多少米每秒？一艘货轮以 15 kn（节，1 kn = 1.852 km/h）的速度航行，合多少千米每小时？',
    note:'两空均即时判分，等价写法（带不带单位）均认可。',
    parts:[
      { kind:'blank', blanks:[
        { label:'客机（m/s）', answer:['240','240m/s','240 m/s'], unit:'m/s' },
        { label:'货轮（km/h）', answer:['27.78','27.8','约27.78','约27.8','27.78km/h','27.8km/h','27.78 km/h','27.8 km/h'], unit:'km/h' }],
        analysis:'客机：864 km/h ÷ 3.6 = <b>240 m/s</b>；货轮：15 kn × 1.852 km/h = <b>27.78 km/h</b>（约 27.8 km/h）。' }
    ] },

  // —— 第4节 速度的测量（5 题） ——
  { id:'c1s4q1', section:'速度的测量', no:'练习1', points:12,
    stem:'小林想测出一辆玩具小车从斜面顶端滑到底端的平均速度。他需要测量哪些物理量？分别选用什么测量工具？',
    note:'本题拆为 3 个单选小问，每问即时判分。',
    parts:[
      { kind:'choice', q:'① 需要测量的物理量是：',
        opts:['路程 s 和时间 t','速度 v 和时间 t','路程 s 和速度 v','质量 m 和时间 t'], answer:0,
        analysis:'平均速度不能直接测，要先测出<b>路程 s 和时间 t</b>，再依据 v = s/t 算出。' },
      { kind:'choice', q:'② 测路程应选用的工具是：',
        opts:['刻度尺 / 卷尺','秒表 / 手表','天平','温度计','弹簧测力计'], answer:0,
        analysis:'斜面长度属长度量，用 <b>刻度尺（或卷尺）</b>测量。' },
      { kind:'choice', q:'③ 测时间应选用的工具是：',
        opts:['刻度尺 / 卷尺','秒表 / 手表','天平','温度计'], answer:1,
        analysis:'时间用 <b>秒表（或手表）</b>测量；最后依据 <b>v = s / t</b> 算出平均速度。' }
    ] },

  { id:'c1s4q2', section:'速度的测量', no:'练习2（频闪照片示意图）', points:12,
    stem:'小组同学用频闪照相的方法研究小球沿斜面下滑的运动，拍下小球先后经过 A、B、C 三个位置，并在旁边放一把刻度尺、记下每个位置对应的时刻（见下图简图）。小球在 AB、BC、AC 各段运动的平均速度分别是多少？',
    note:'下图为程序化简图：刻度尺 0~100 cm，A、B、C 的位置由简图读出。填空即时判分。',
    fig:'inclineRuler',
    parts:[
      { kind:'blank', q:'① AB 段：时间 tAB 与平均速度 vAB 分别是多少？', blanks:[
        { label:'tAB', answer:['1.3','1.30','1.3s','1.30s','1.3 s'], unit:'s' },
        { label:'vAB', answer:['20','20cm/s','20 cm/s'], unit:'cm/s' }],
        analysis:'sAB = 90 − 64 = <b>26 cm</b>（由简图刻度读出）；tAB = 00:01.30 − 00:00.00 = <b>1.30 s</b>；vAB = 26 cm / 1.30 s = <b>20 cm/s</b>。' },
      { kind:'blank', q:'② BC 段：平均速度 vBC 是多少？', blanks:[
        { label:'vBC', answer:['45','45cm/s','45 cm/s'], unit:'cm/s' }],
        analysis:'sBC = 64 − 10 = <b>54 cm</b>；tBC = <b>1.20 s</b>；vBC = 54 cm / 1.20 s = <b>45 cm/s</b>。' },
      { kind:'blank', q:'③ AC 段：时间 tAC 与平均速度 vAC 分别是多少？', blanks:[
        { label:'tAC', answer:['2.5','2.50','2.5s','2.50s','2.5 s'], unit:'s' },
        { label:'vAC', answer:['32','32cm/s','32 cm/s'], unit:'cm/s' }],
        analysis:'sAC = 90 − 10 = <b>80 cm</b>；tAC = <b>2.50 s</b>（由简图时刻算出）；vAC = 80 cm / 2.50 s = <b>32 cm/s</b>。' }
    ] },

  { id:'c1s4q3', section:'速度的测量', no:'练习3', points:12,
    stem:'小林组做"测量小车沿斜面下滑的平均速度"实验，得到一组数据：上半段路程的平均速度为 0.30 m/s，全程的平均速度为 0.40 m/s；随后甲、乙两位同学用同一套装置、从同一位置释放小车，各测一次下半段路程的平均速度，分别得到 0.58 m/s 和 0.62 m/s。请分析下面两个现象：',
    note:'本题拆为两个单选小问，每问即时判分。',
    parts:[
      { kind:'choice', q:'① 上半段 0.30 m/s 与全程 0.40 m/s 不相等，原因是：',
        opts:['小车下滑时越滑越快，不同路段的平均速度本来就不相同','一定是哪次计时按错了表，两个数值理应相等','上半段路程比全程短，路程短速度就小','斜面在两次测量之间被垫高了'], answer:0,
        analysis:'小车沿斜面下滑做的是<b>变速运动</b>（越来越快），上半段、下半段、全程是<b>不同的路段</b>，各自的平均速度本来就不相等，0.30 m/s < 0.40 m/s 正是这一点的体现。速度大小与所取路程的长短无关。' },
      { kind:'choice', q:'② 甲、乙测同一下半段却得到 0.58 m/s 和 0.62 m/s，主要原因是：',
        opts:['同一段路程做变速运动，平均速度不可能相同','计时起止点的判断和刻度读数都不可避免地存在误差，误差不可消除','两人用的斜面不一样，装置不同结果自然不同','下半段路程太短，根本无法测出速度'], answer:1,
        analysis:'同一装置、同一路段、同一释放位置，两次结果的差异来自<b>测量误差</b>：掐表的反应快慢、读数视角都因人而异，误差客观存在、只能减小不能消除，所以 0.58 m/s 与 0.62 m/s 略有不同是正常的，取平均值可以让结果更接近真实值。' }
    ] },

  { id:'c1s4q4', section:'速度的测量', no:'练习4', points:10,
    stem:'公园湖边有一段笔直的木栈道，入口处标示牌写明了它的总长度 L。小乐想借助这段栈道测出自己正常步行的速度 v，并进一步估出从小区门口到超市的路程 s（这段路没有现成的长度数据）。下列方案中可行的是（　　）',
    parts:[
      { kind:'choice',
        opts:['用手表测出沿栈道从这头走到那头所用的时间 t，由 v = L / t 算出步行速度；再测出从小区门口走到超市所用的时间 t₁，由 s = v · t₁ 算出路程',
              '凭感觉直接估一个步行速度 v，不用去栈道走，再乘以走路的分钟数就得 s',
              '拿卷尺把栈道长度 L 量一遍，L 就是从小区门口到超市的路程 s',
              '只测从小区门口走到超市的时间 t₁，不借助栈道，s 也能算出来'], answer:0,
        analysis:'v 不能凭空估、s 也不能直接量（没有那么长的尺），思路是<b>间接测量</b>：先用长度已知的栈道和手表，由 <b>v = L / t</b> 测出步行速度；再把这段路上的用时 t₁ 代入 <b>s = v · t₁</b>，路程就估出来了。只测 t₁ 而不知道 v，或把栈道长度当作别处的路程，都不成立。' }
    ] },

  { id:'c1s4q5', section:'速度的测量', no:'练习5', points:10,
    stem:'一段平直公路旁等间距地立着一排路灯杆，相邻两杆间的距离 d 是已知的。你坐在匀速行驶的公交车上，手里只有一块手表。请设计一个方案，利用这些路灯杆估测公交车的速度，写出测量步骤和计算式。',
    note:'本题为开放方法题，作答后对照参考答案自评计分。',
    parts:[
      { kind:'open',
        ref:'参考答案：<br>① 当公交车恰好经过某一路灯杆时<b>按下手表开始计时</b>，并把这一根记作第 1 根；<br>② 一边计时一边数经过的路灯杆，数到第 <b>n</b> 根时<b>停止计时</b>，读出手表用时 <b>t</b>；<br>③ 第 1 根到第 n 根之间共有 <b>(n−1)</b> 个间隔，行驶路程 <b>s = (n−1) · d</b>；<br>④ 公交车速度 <b>v = s / t = (n−1) · d / t</b>；<br>⑤ 举例：设 d = 45 m，从第 1 根数到第 21 根（20 个间隔，s = 900 m）用时 60 s，则 v = 900 m ÷ 60 s = <b>15 m/s</b>（合 54 km/h）。',
        analysis:'方法=数路灯杆间隔得路程 s = (n−1)·d + 手表计时 t，v = s/t；示例：20 个间隔 × 45 m = 900 m，60 s → 15 m/s（54 km/h）。' }
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

/* c1s1q9 简图：刻度尺+蜡笔+斜视线（程序化绘制，配色适配深色底） */
function svgPencilRuler() {
  let s = '';
  // 刻度尺
  s += `<rect x="50" y="50" width="320" height="44" fill="#f2ede2" stroke="#9aa4b5" rx="3"/>`;
  s += `<line x1="50" y1="50" x2="50" y2="94" stroke="#2c2c2c"/><line x1="370" y1="50" x2="370" y2="94" stroke="#2c2c2c"/>`;
  const xs = [50, 114, 178, 242, 306, 370];
  const labels = ['0', '1', '2', '3', '4', '5 cm'];
  xs.forEach((x, i) => {
    s += `<line x1="${x}" y1="50" x2="${x}" y2="70" stroke="#2c2c2c"/>`;
    s += `<text x="${x}" y="108" fill="#9aa4b5" font-size="11" text-anchor="middle" dominant-baseline="middle">${labels[i]}</text>`;
  });
  // 铅笔（左端在 x=40，未对齐 0 刻度）
  s += `<rect x="40" y="122" width="280" height="20" fill="#e08e5e" rx="3"/>`;
  s += `<polygon points="320,122 340,132 320,142" fill="#d4a017"/>`;
  s += `<circle cx="40" cy="132" r="4" fill="#b8860b"/>`;
  s += `<text x="175" y="164" text-anchor="middle" font-size="12" fill="#9aa4b5">蜡笔</text>`;
  // 斜视线（未垂直尺面）
  s += `<line x1="388" y1="40" x2="330" y2="127" stroke="#ff7a6e" stroke-width="1.5" stroke-dasharray="5,4"/>`;
  s += `<text x="392" y="28" text-anchor="end" font-size="12" fill="#ff7a6e" font-weight="700">视线</text>`;
  return `<svg viewBox="0 0 420 180" role="img" aria-label="刻度尺测量蜡笔长度简图">${s}</svg>`;
}

/* c1s3q2 简图：汽车速度表（0~240 km/h、每大格 20，指针指 60） */
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
  s += `<line x1="100" y1="100" x2="100" y2="26" stroke="#e74c3c" stroke-width="5" stroke-linecap="round" transform="rotate(-60 100 100)"/>`;
  s += `<circle cx="100" cy="100" r="12" fill="#5a6672"/>`;
  s += `<text x="100" y="140" fill="#7fd4ff" font-size="11" text-anchor="middle">km/h</text>`;
  return `<svg viewBox="0 0 200 200" role="img" aria-label="汽车速度表简图">${s}</svg>`;
}

/* c1s3q4 列车运行信息表（程序化绘制） */
function htmlTrainTable() {
  const rows = [
    ['1', '临江', '\\', '09:00', '0', '0'],
    ['2', '云山', '09:30', '09:32', '30分', '90 km'],
    ['3', '双河', '10:34', '10:37', '1小时34分', '338 km'],
    ['4', '江州', '11:55', '11:58', '2小时55分', '676 km'],
    ['5', '滨海', '13:18', '\\', '4小时18分', '989 km']
  ];
  return `<table class="dtab"><thead><tr><th>站序</th><th>站名</th><th>到时</th><th>发时</th><th>运行时间</th><th>里程</th></tr></thead><tbody>`
    + rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')
    + `</tbody></table>`;
}

/* c1s4q2 简图：频闪照片示意图（刻度尺 0~100 cm，A=90/B=64/C=10 与对应时刻，程序化绘制） */
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
    { x: 400, fill: '#e74c3c', edge: '#ff9d93', name: 'A', t: '00:00.00' },
    { x: 296, fill: '#f39c12', edge: '#ffd479', name: 'B', t: '00:01.30' },
    { x: 80,  fill: '#27ae60', edge: '#7de8a8', name: 'C', t: '00:02.50' }
  ];
  pts.forEach(p => {
    s += `<circle cx="${p.x}" cy="70" r="10" fill="${p.fill}" stroke="${p.edge}" stroke-width="2"/>`;
    s += `<text x="${p.x}" y="55" text-anchor="middle" font-size="13" font-weight="700" fill="${p.edge}">${p.name}</text>`;
    s += `<text x="${p.x}" y="132" text-anchor="middle" font-size="11" fill="#9aa4b5">${p.t}</text>`;
  });
  return `<svg viewBox="0 0 520 150" role="img" aria-label="频闪照片与刻度尺简图">${s}</svg>`;
}

/* ===== 渲染引擎 ===== */
function renderFig(fig) {
  if (!fig || !FIGURES[fig]) return '';
  return `<div class="figbox">${FIGURES[fig]()}</div>`;
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
    return `<div class="part" data-key="${key}">${head}<div class="multi-hint">多选题 · 选择完毕后点提交判分</div><div class="opts">${opts}</div><button class="btn multi-submit" data-qid="${q.id}" data-pi="${pi}">提交</button><div class="fb" data-role="fb"></div></div>`;
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
    ${renderFig(q.fig)}
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
  const sbtn = $1('.multi-submit', el);
  if (sbtn) sbtn.disabled = true;
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
  $all('.multi-submit').forEach(btn => btn.addEventListener('click', onMultiSubmit));
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
/* multi：点选/再点取消，选择完毕后点提交按钮判分（集合全等=正确），判分后锁定 */
const MULTI_SEL = {};
function onMultiClick(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi, idx = +btn.dataset.idx;
  const key = `${qid}_${pi}`;
  if (STATE.done[key]) return;
  if (!MULTI_SEL[key]) MULTI_SEL[key] = [];
  const sel = MULTI_SEL[key];
  const pos = sel.indexOf(idx);
  if (pos >= 0) { sel.splice(pos, 1); btn.classList.remove('sel'); }
  else { sel.push(idx); btn.classList.add('sel'); }
}
function onMultiSubmit(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi;
  const key = `${qid}_${pi}`;
  if (STATE.done[key]) return;
  const q = findQ(qid), part = q.parts[pi];
  const sel = (MULTI_SEL[key] || []).slice();
  const ok = sameSet(sel, part.answer);
  STATE.multi[key] = sel;
  STATE.done[key] = true;
  STATE.scores[qid] = STATE.scores[qid] || {};
  STATE.scores[qid][pi] = ok ? partPoints(q, pi) : 0;
  saveState();
  setMultiUI(btn.closest('.part'), part, sel);
  updateProgress();
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
  const mask = document.getElementById('redoModal');
  if (!mask) return;
  const close = () => mask.classList.remove('show');
  btn.addEventListener('click', () => mask.classList.add('show'));
  mask.addEventListener('click', (e) => { if (e.target === mask) close(); });
  const cancel = document.getElementById('redoCancel');
  if (cancel) cancel.addEventListener('click', close);
  const ok = document.getElementById('redoOk');
  if (ok) ok.addEventListener('click', () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    location.reload();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initState();
  renderQuiz();
  bindRedo();
});

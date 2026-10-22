/* ===== 本章练习题库（第一章 机械运动） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / multi=多选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 题目：围绕各节知识点编写的原创题（第1节 9 题、第2节 7 题、第3节 6 题、第4节 5 题），
 *      交互联动型题拆分为小问（note 说明）；共 27 题，总分 288 分（各题 points 之和）。
 * multi 类型说明：c1s1q7、c1s1q9 为多选题（选齐对应项数自动判定），在样板 choice/blank/open 之外
 *      最小增补 multi 一种 part 类型，样板既有判分逻辑零改动。
 * 分值规则对齐样板：单 part 题 10 分，多 part/多空题 12 分。
 */
const QUESTIONS = [
  // —— 第1节 长度和时间的测量（9 题） ——
  { id:'c1s1q1', section:'第1节 长度和时间的测量', no:'第1题', points:10,
    stem:'一把刻度尺的分度值为 1 mm，用它测量物体的长度时，下列记录结果符合读数规范的是（　　）',
    parts:[
      { kind:'choice', opts:['3.4 cm','3.46 cm','3.460 cm','3 cm'], answer:1,
        analysis:'分度值为 1 mm 时，读数应估读到分度值的下一位，即 0.1 mm（0.01 cm），结果要保留到小数点后两位。四个选项中只有 <b>3.46 cm</b> 符合要求。' }
    ] },

  { id:'c1s1q2', section:'第1节 长度和时间的测量', no:'第2题', points:10,
    stem:'下列关于刻度尺使用方法的说法中，符合操作要求的是（　　）',
    parts:[
      { kind:'choice', opts:['读数时视线可以斜着看刻度线','被测物体的一端必须与 0 刻度线对齐','读数时应估读到分度值的下一位','挑选刻度尺时只需考虑量程即可'], answer:2,
        analysis:'读数时视线应与尺面垂直；起始端可以对齐任一整刻度线，用末端刻度减去起始刻度即为长度；选尺时量程和分度值都要兼顾。只有<b>读数时应估读到分度值的下一位</b>正确。' }
    ] },

  { id:'c1s1q3', section:'第1节 长度和时间的测量', no:'第3题', points:10,
    stem:'观察一块机械停表：小表盘指针位于"2"和"3"之间，并且已越过两刻度的中线；大表盘指针指向 16.5 s。停表显示的时间是（　　）',
    parts:[
      { kind:'choice', opts:['2 min 16.5 s','2 min 46.5 s','3 min 46.5 s','1 min 46.5 s'], answer:1,
        analysis:'小表盘记录分钟：指针在 2 与 3 之间且已过半，说明大表盘处于 30~60 s 区间，秒数应读作 30 s + 16.5 s = 46.5 s。故停表读数为 <b>2 min 46.5 s</b>。' }
    ] },

  { id:'c1s1q4', section:'第1节 长度和时间的测量', no:'第4题', points:10,
    stem:'小红用同一把刻度尺对一支铅笔的长度连续测量 4 次，记录为：17.26 cm、17.24 cm、17.62 cm、17.25 cm。下列数据处理方式正确的是（　　）',
    parts:[
      { kind:'choice', opts:['把 4 个数据直接求平均，得 17.34 cm','先剔除 17.62 cm，再求其余 3 个数据的平均值','全部数据都保留，求平均得 17.30 cm','多次测量能把误差彻底消除'], answer:1,
        analysis:'17.62 cm 与另外三次读数偏差明显过大，属于操作不当造成的错误数据，应剔除后再求平均：(17.26+17.24+17.25)/3 = 17.25 cm。误差客观存在，多次测量只能减小它，<b>不能消除它</b>。' }
    ] },

  { id:'c1s1q5', section:'第1节 长度和时间的测量', no:'第5题', points:10,
    stem:'人们常用"分秒必争"提醒自己珍惜时间。把"1 日"换算成秒，结果是（　　）',
    parts:[
      { kind:'choice', opts:['3600 s','12 000 s','24 000 s','86 400 s'], answer:3,
        analysis:'1 日 = 24 h；1 h = 60 min = 3600 s。逐级换算：1 日 = 24 × 3600 s = <b>86 400 s</b>。' }
    ] },

  { id:'c1s1q6', section:'第1节 长度和时间的测量', no:'第6题', points:10,
    stem:'用身体部位作"随身尺"是常见的估测办法。一般情况下，人的身高约为脚长的多少倍（常识估测）（　　）',
    parts:[
      { kind:'choice', opts:['约 5 倍','约 7 倍','约 9 倍','约 12 倍'], answer:1,
        analysis:'经验表明，成年人的身高约为脚长的 7 倍。不妨用尺子量出自己的身高和脚长，验证这个比例。' }
    ] },

  { id:'c1s1q7', section:'第1节 长度和时间的测量', no:'第7题（多选）', points:10,
    stem:'小杰想测出家里圆形茶盘盖的直径，下列方法中可行的是（多选）',
    note:'本题为多选题，选齐 3 项后自动提交判分。',
    parts:[
      { kind:'multi', opts:['把刻度尺横盖在盖面上，直接对着读数当直径','用两个三角板把盖子竖夹在中间，量两板内侧间的距离','用细棉线沿盖边绕一周，量出线长再算出直径','在盖子边缘做记号，让盖子在纸上滚一周，量出两记号间的长度再算直径'], answer:[1,2,3],
        analysis:'两块三角板夹住盖子属于<b>辅助法</b>，位置固定、读数准确，可行；棉线绕一周量周长再算直径是<b>化曲为直</b>，可行；滚动一周量痕迹长度是<b>滚圆法</b>，同样常用。而盖面上圆心的位置难以确定，直接横尺读数容易偏大偏小，一般不采用。' }
    ] },

  { id:'c1s1q8', section:'第1节 长度和时间的测量', no:'第8题', points:10,
    stem:'用停表测量单摆摆动一次所用的时间时，为减小测量误差，下列做法较合适的是（　　）',
    parts:[
      { kind:'choice', opts:['只测 1 个周期，直接用这个时间','测出连续摆动 20 次的总时间，再除以 20','把摆球推得更用力，让它摆得快些','不用停表，靠目测估出 1 个周期的时间'], answer:1,
        analysis:'这是<b>累积法</b>（测多算少）：把 20 次全摆动的时间合并测量再均分，能把判断起止时刻的误差摊薄到每个周期上，显著减小误差。' }
    ] },

  { id:'c1s1q9', section:'第1节 长度和时间的测量', no:'第9题（多选·图题）', points:10,
    stem:'下图简图中，小刚正用刻度尺测量铅笔的长度，他的操作存在哪些错误？选出所有错误项（多选）：',
    note:'本题为多选题，选齐 2 项后自动提交判分。下图为程序化简图。',
    fig:'pencilRuler', figCap:'简图：刻度尺 0~5 cm，铅笔左端未对齐 0 刻度线，视线斜向看尺',
    parts:[
      { kind:'multi', opts:['铅笔左端没有对齐 0 刻度线','刻度尺没有放正','视线没有垂直于尺面','读数时没写单位'], answer:[0,2],
        analysis:'简图中可找出两处错误：① 铅笔左端未与 0 刻度线对齐——起始端应对齐零刻度线或某一整刻度线；② 斜着眼睛看尺，视线没有与尺面垂直。即便改正这两处，测量结果仍然会有误差，因为误差不可避免。' }
    ] },

  // —— 第2节 运动的描述（联动型 4 题 + 基础选择 3 题） ——
  { id:'c1s2q1', section:'第2节 运动的描述', no:'第①题', points:12,
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

  { id:'c1s2q2', section:'第2节 运动的描述', no:'第②题', points:10,
    stem:'坐在夜航的客船上向外望，会看到这样一幕：两岸连绵的青山“唰唰”地朝船尾方向退去。要描述“青山向船尾退去”，所选的参照物是（　　）',
    parts:[
      { kind:'choice', opts:['河岸','客船（或船上的乘客）','岸边的房屋','远处连绵的青山'], answer:1,
        analysis:'乘客以<b>客船（或自己）</b>为标准，默认船不动；船实际在前进，青山相对船的位置不断向后移动，于是看起来是“青山向船尾退去”。这体现了运动和静止的<b>相对性</b>。' }
    ] },

  { id:'c1s2q3', section:'第2节 运动的描述', no:'第③题（货运飞船交会对接）', points:12,
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

  { id:'c1s2q4', section:'第2节 运动的描述', no:'第④题', points:10,
    stem:'你乘商场的观光扶梯上楼时，并没有低头看台阶，却能判断出扶梯在向上运行还是向下运行。请运用参照物的知识，说明你的判断方法。',
    note:'本题为开放说理题，作答后对照参考答案自评计分。',
    parts:[
      { kind:'open',
        ref:'参考答案：以扶梯外的<b>楼层（护栏、柜台等固定景物）</b>为参照物。若这些景物相对自己在<b>向下</b>移动，说明扶梯在<b>上行</b>；若景物相对自己在<b>向上</b>移动，说明扶梯在<b>下行</b>。判断依据：看景物与自己之间的<b>相对位置如何变化</b>。',
        analysis:'判分：参照物=扶梯外的固定景物（楼层/护栏等）；依据=景物与自己的相对位置变化方向（景物向下移→上行，向上移→下行）。' }
    ] },

  { id:'c1s2q5', section:'第2节 运动的描述', no:'基础选择 第1题', points:10,
    stem:'下列现象中，属于机械运动的是（　　）',
    parts:[
      { kind:'choice', opts:['辛亥革命','大雁南飞','思绪万千','歌声悠扬'], answer:1,
        analysis:'机械运动指物体的<b>位置随时间发生变化</b>。大雁南飞时位置不断变化，属于机械运动；“辛亥革命”是社会变革事件，“思绪万千”是心理活动，“歌声悠扬”描述的是声音现象，都不涉及物体位置的变化。' }
    ] },

  { id:'c1s2q6', section:'第2节 运动的描述', no:'基础选择 第2题', points:10,
    stem:'下列关于参照物的说法中，正确的是（　　）',
    parts:[
      { kind:'choice', opts:['参照物一定要选绝对静止的物体','参照物只能选择地面','参照物可以根据研究需要任意选择','描述物体的运动时可以不选参照物'], answer:2,
        analysis:'参照物是被<b>假定为不动</b>、用来作比较标准的物体，可以根据需要任意选择；选择不同的参照物，对同一物体运动的描述结论一般不同。研究运动必须先选定参照物，地面只是其中最常用的一种。' }
    ] },

  { id:'c1s2q7', section:'第2节 运动的描述', no:'基础选择 第3题', points:10,
    stem:'小华乘地铁出行，列车正在隧道里行驶。若说小华是静止的，所选的参照物可能是（　　）',
    parts:[
      { kind:'choice', opts:['隧道壁上的灯箱','他乘坐的车厢','对面轨道驶来的列车','站台上的候车乘客'], answer:1,
        analysis:'小华与<b>车厢</b>之间的位置没有变化，以车厢为参照物他是静止的；灯箱、对面列车、站台乘客相对他的位置都在变化，以它们为参照物小华都是运动的。' }
    ] },

  // —— 第3节 运动的快慢（6 题） ——
  { id:'c1s3q1', section:'第3节 运动的快慢', no:'练习1', points:12,
    stem:'张大爷每天清晨沿公园步道健走，某天他用 40 min 走完了 3.6 km。他这段时间健走的平均速度是多少千米每小时？合多少米每秒？',
    note:'两空均即时判分，等价写法（带不带单位）均认可。',
    parts:[
      { kind:'blank', q:'① 健走的平均速度是多少千米每小时？合多少米每秒？', blanks:[
        { label:'速度（km/h）', answer:['5.4','5.4km/h','5.4 km/h','5.4千米每小时','5.4公里每小时'], unit:'km/h' },
        { label:'速度（m/s）', answer:['1.5','1.50','1.5m/s','1.5 m/s'], unit:'m/s' }],
        analysis:'t = 40 min = 2/3 h；v = s ÷ t = 3.6 km ÷ (2/3) h = <b>5.4 km/h</b>；再换算：5.4 km/h = 5.4 ÷ 3.6 m/s = <b>1.5 m/s</b>。' }
    ] },

  { id:'c1s3q2', section:'第3节 运动的快慢', no:'练习2', points:10,
    stem:'一辆汽车在高速公路上行驶，车内速度表的指针位置见下图简图。若汽车按表显速度匀速行驶 9 km，行驶时间是多少分？',
    note:'下图为程序化简图。填空即时判分。',
    fig:'speedDial', figCap:'简图：汽车速度表，主刻度 0~240、每大格 20，单位 km/h，指针指 60',
    parts:[
      { kind:'blank', blanks:[
        { label:'行驶的时间', answer:['9','9min','9 min','9分','0.15','0.15h','0.15 h','0.15小时'], unit:'min' }],
        analysis:'先读表盘：主刻度 0—240、每大格 20，单位 km/h，指针指 <b>60</b>，即 v = 60 km/h；再由 t = s ÷ v = 9 km ÷ 60 km/h = 0.15 h = <b>9 min</b>。' }
    ] },

  { id:'c1s3q3', section:'第3节 运动的快慢', no:'练习3', points:10,
    stem:'一辆观光巴士在平直公路上匀速行驶，车内速度显示屏显示 54 km/h。小雨用手机秒表测出巴士从第 1 根路灯杆驶到第 5 根路灯杆共用时 12 s。若路灯杆间距相等，相邻两根路灯杆之间的距离是多少？',
    parts:[
      { kind:'blank', blanks:[
        { label:'相邻两路灯杆之间的距离', answer:['45','45m','45 m','45米'], unit:'m' }],
        analysis:'先统一单位：v = 54 km/h = 54 ÷ 3.6 m/s = 15 m/s；总路程：s = v·t = 15 m/s × 12 s = 180 m；第 1 根到第 5 根之间有 4 个间隔，故 d = 180 m ÷ 4 = <b>45 m</b>。' }
    ] },

  { id:'c1s3q4', section:'第3节 运动的快慢', no:'练习4', points:12,
    stem:'某次高速列车由临江站开往滨海站，沿途停靠及运行信息见下表。（1）列车由临江站驶往滨海站全程的平均速度是多少？（2）列车在哪个路段运行得最快？在哪个路段运行得最慢？',
    note:'信息表见下表。①填空 + ②③单选均即时判分。',
    fig:'trainTable', figCap:'表：某次高速列车运行信息',
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

  { id:'c1s3q5', section:'第3节 运动的快慢', no:'练习5（拓展）', points:12,
    stem:'声音在空气中的传播速度约为 340 m/s。雷雨天，小磊看到窗外一道闪电，过了 4 s 才听到雷声。闪电发生处距小磊大约多少米？合多少千米？（光的传播时间忽略不计）',
    note:'两空均即时判分，等价写法（带不带单位）均认可。',
    parts:[
      { kind:'blank', blanks:[
        { label:'距离（m）', answer:['1360','1360m','1360 m','1360米'], unit:'m' },
        { label:'合（km）', answer:['1.36','1.36km','1.36 km','1.36千米','1.36公里'], unit:'km' }],
        analysis:'光速极快，传播时间可忽略，声音传播时间 t = 4 s，v = 340 m/s；由 v = s/t 得 s = v·t = 340 m/s × 4 s = <b>1360 m</b>；1360 m = <b>1.36 km</b>，即闪电处距小磊约 1360 m（1.36 km）。' }
    ] },

  { id:'c1s3q6', section:'第3节 运动的快慢', no:'练习6（拓展）', points:12,
    stem:'一架客机的巡航速度约为 864 km/h，合多少米每秒？一艘货轮以 15 kn（节，1 kn = 1.852 km/h）的速度航行，合多少千米每小时？',
    note:'两空均即时判分，等价写法（带不带单位）均认可。',
    parts:[
      { kind:'blank', blanks:[
        { label:'客机（m/s）', answer:['240','240m/s','240 m/s'], unit:'m/s' },
        { label:'货轮（km/h）', answer:['27.78','27.8','约27.78','约27.8','27.78km/h','27.8km/h','27.78 km/h','27.8 km/h'], unit:'km/h' }],
        analysis:'客机：864 km/h ÷ 3.6 = <b>240 m/s</b>；货轮：15 kn × 1.852 km/h = <b>27.78 km/h</b>（约 27.8 km/h）。' }
    ] },

  // —— 第4节 速度的测量（5 题） ——
  { id:'c1s4q1', section:'第4节 速度的测量', no:'练习1', points:12,
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

  { id:'c1s4q2', section:'第4节 速度的测量', no:'练习2（频闪照片示意图）', points:12,
    stem:'小组同学用频闪照相的方法研究小球沿斜面下滑的运动，拍下小球先后经过 A、B、C 三个位置，并在旁边放一把刻度尺、记下每个位置对应的时刻（见下图简图）。小球在 AB、BC、AC 各段运动的平均速度分别是多少？',
    note:'下图为程序化简图：刻度尺 0~100 cm，A 在 90 cm 处、B 在 64 cm 处、C 在 10 cm 处。填空即时判分。',
    fig:'inclineRuler', figCap:'简图：频闪照片示意图（位置对应刻度尺），A=90 cm（00:00.00）、B=64 cm（00:01.30）、C=10 cm（00:02.50）',
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

  { id:'c1s4q3', section:'第4节 速度的测量', no:'练习3', points:12,
    stem:'用斜面装置测量小车的速度时出现了两种情况：情况一，甲同学测得小车通过斜面全程的速度 v1 与通过上半段路程的速度 v2 不相等；情况二，甲、乙两位同学用同一套装置测同一上半段路程，得到的 v2 也不相同。请分别选出两种情况中速度不同的原因。',
    note:'本题拆为两个单选小问（对应两种情况，选项相同），每问即时判分。',
    parts:[
      { kind:'choice', q:'① 情况一中，v1 与 v2 不同的原因是：',
        opts:['不同同学的测量存在误差，导致结果不同','小车做变速运动，不同路段的平均速度本来就不相同','两人用的测量工具不同，所以结果不同','小车每次从同一位置释放，速度应该完全相同'], answer:1,
        analysis:'小车沿斜面下滑时越滑越快，做的是<b>变速运动</b>。全程平均速度 v1 与上半段平均速度 v2 对应的是<b>不同路段</b>，本来就不相等。' },
      { kind:'choice', q:'② 情况二中，两人测得的 v2 不同的原因是：',
        opts:['不同同学的测量存在误差，导致结果不同','小车做变速运动，不同路段的平均速度本来就不相同','两人用的测量工具不同，所以结果不同','小车每次从同一位置释放，速度应该完全相同'], answer:0,
        analysis:'同装置、同路段的两次测量，不同同学在按表计时、读刻度时都会有<b>测量误差</b>，算出的 v2 因此不完全相同。多次测量取平均值可以减小这种误差。' }
    ] },

  { id:'c1s4q4', section:'第4节 速度的测量', no:'练习4', points:10,
    stem:'已知社区广场环形步道的周长为 l。小周想估测自己正常步行的速度 v，再进一步估测从家到菜市场的路程 s。做法：先用手表测出沿步道走完一圈所用的时间，再用手表测出从家走到菜市场所用的时间。下列测量与表示方法正确的是？',
    parts:[
      { kind:'choice',
        opts:['测出走完一圈所用时间 t，则 v = l / t；再测出从家走到菜市场所用时间 t′，则 s = v · t′ = (l / t) · t′',
              '测出走完一圈所用时间 t，则 v = t / l；再测出从家走到菜市场所用时间 t′，则 s = t′ / v',
              '不必测时间，用刻度尺直接量出从家到菜市场的距离就是 s，v 与 l、时间都无关',
              '测出走完一圈所用时间 t，则 v = l · t；再测出从家走到菜市场所用时间 t′，则 s = l · t′'], answer:0,
        analysis:'需要测的物理量有三个：<b>环形步道周长 l</b>、<b>走完一圈所用时间 t</b>、<b>从家走到菜市场所用时间 t′</b>。步行速度 <b>v = l / t</b>（路程除以时间）；家到菜市场的路程 <b>s = v · t′ = (l / t) · t′</b>（速度乘以时间）。' }
    ] },

  { id:'c1s4q5', section:'第4节 速度的测量', no:'练习5', points:10,
    stem:'郊外绿道旁每隔 1 km 就立着一块里程牌。请利用这些里程牌估测自己骑自行车的速度，写出估测方法。',
    note:'本题为开放方法题，作答后对照参考答案自评计分。',
    parts:[
      { kind:'open',
        ref:'参考答案：<br>① 骑车沿绿道前行，经过某一块里程牌时<b>按下手表开始计时</b>，并记下出发时的牌数；<br>② 设又经过了 <b>n</b> 块里程牌（即跨过 n 个 1 km 间隔）后停止计时，用时 <b>t</b>，则骑行路程 <b>s = n × 1 km = n km</b>；<br>③ 平均速度 <b>v = s / t = n km / t</b>（t 用小时作单位时，结果单位就是 km/h）；<br>④ 举例：跨过 1 块里程牌用时 4 min（即 1/15 h），则 v = 1 km ÷ (1/15) h = <b>15 km/h</b>。',
        analysis:'方法=数里程牌（n 个间隔 × 1 km 得路程）+ 手表计时，v = s/t；示例：1 个间隔 4 min = 15 km/h。' }
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

/* c1s1q9 简图：刻度尺+铅笔+斜视线（程序化绘制，配色适配深色底） */
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
  return `<svg viewBox="0 0 420 180" role="img" aria-label="简图：刻度尺0至5厘米，铅笔左端未对齐0刻度线，视线斜向看尺">${s}</svg>`;
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
  return `<svg viewBox="0 0 200 200" role="img" aria-label="简图：汽车速度表，主刻度0至240，每大格20，单位千米每小时，指针指60">${s}</svg>`;
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
  return `<svg viewBox="0 0 520 150" role="img" aria-label="简图：频闪照片示意图，刻度尺0至100厘米，A在90厘米处时刻0分0秒，B在64厘米处时刻1.30秒，C在10厘米处时刻2.50秒">${s}</svg>`;
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
/* multi：点选/再点取消，选齐 answer.length 项后自动提交判分（集合全等=正确） */
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

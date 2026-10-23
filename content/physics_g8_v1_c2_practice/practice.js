/* ===== 本章练习题库（第二章 声现象） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 内容：全部 29 题为本站原创题（2026-10 质量线 W2 轮完成原创化改写；考点、
 *   数据结构、id、分值、答案键与判分逻辑保持不变）：
 *   第1节 声音的产生与传播×6 + 第2节 声音的特性×5 + 第3节 声的利用×5
 *   + 第4节 噪声的危害和控制×5 + 第5节 跨学科实践（知识梳理）×8；总分 304 分（各题 points 之和）。
 * 题型：配对/判断/多选类考点按小问拆为多个 choice part（每小问独立判分，
 *   partPoints=round(points/parts.length)，分值取可整除数保证总分=Σpoints）。
 * 分值规则对齐 c6_practice 样板：单 part 题 10 分；多 part 题 12 分（5 part 题 10 分）。
 * 全文件字符串（含注释）不含任何外部出版物引用字眼与页码/插图号；题目自包含，所需数据在题面给出。
 */
const QUESTIONS = [
  // —— 第1节 声音的产生与传播（6 题；2026-10 W2 原创化改写） ——
  { id:'c2s1q1', section:'第1节 声音的产生与传播', no:'第1题', points:10,
    stem:'把塑料尺的一半伸出桌边，一只手按住尺子在桌面上的部分，另一只手向下拨动伸出端。我们听到了声音，同时看到尺子伸出端变"虚"了，这是塑料尺在振动。请你另外举一个例子说明：你在听到声音的同时，是如何判断发声物体在振动的？',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（任选其一即可）：<br>· 把敲响的音叉靠近悬挂的乒乓球，球被反复弹开；<br>· 讲话时用手轻按喉头，能感到声带在振动；<br>· 敲鼓时，鼓面上的碎纸屑随之跳动；<br>· 手机来电响铃时贴在桌面上，能感到桌面发麻。<br><b>核心方法</b>：把不易观察的微小振动，转化为容易观察的物体运动（转换法）。',
      analysis:'判分：举出具体实例 + 说明据此判断发声物体在振动；核心方法=转换法（把微小振动转化为容易观察的运动）。' }] },

  { id:'c2s1q2', section:'第1节 声音的产生与传播', no:'第2题', points:10,
    stem:'游泳课上，王教练在泳池深水区把两块石块用力碰击，作为让学生集合的信号。小白当时整个头部正浸没在水里，仍然清楚地听到了碰击声。这声碰击声主要经过什么物质传到小白耳中？这个现象说明了什么？',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：石块碰击声经过<b>池水</b>传到水下的小白耳中——声音先在<b>水（液体）</b>中传播，再到达耳朵。这说明水（液体）能够传播声音，是可以传声的<b>介质</b>。',
      analysis:'判分：指出声音经水传到水下人的耳中 → 水（液体）能够传声、是传声介质。' }] },

  { id:'c2s1q3', section:'第1节 声音的产生与传播', no:'第3题', points:10,
    stem:'学校科技馆要做一块“声速”展板，资料员列出了下列数据：铝 5 000 m/s、海水（25 ℃）1 531 m/s、煤油 1 324 m/s、空气（15 ℃）340 m/s、空气（25 ℃）346 m/s。展板文字声称：“声速的大小与介质的种类有关，一般固体中最大、气体中最小；同种介质中声速还与温度有关。”请你从上表中分别为这两句声称找出支持数据，并再写出一条你从表中读出的关于声速的信息。',
    note:'本题为开放归纳题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 支持“与介质种类有关、固&gt;液&gt;气”：铝 5 000 &gt; 海水 1 531、煤油 1 324 &gt; 空气 340 m/s——固体中声速最大，液体次之，气体最小；<br>② 支持“与温度有关”：空气 15 ℃ 时 340 m/s、25 ℃ 时 346 m/s——同是空气，温度越高声速越大；<br>③ 再写一条（示例）：15 ℃ 时空气中的声速约为 <b>340 m/s</b>；或“不同液体中声速也不同（海水 1 531 &gt; 煤油 1 324 m/s）”。',
      analysis:'判分：两句声称各找到表中数据支持（种类→固液气对比数据；温度→空气两温度对比数据）+ 再写出一条正确信息即可。' }] },

  { id:'c2s1q4', section:'第1节 声音的产生与传播', no:'第4题', points:10,
    stem:'小区旧楼改造时，工人用锤子在一根很长的空铝合金窗框的一端敲了一下。小雨把耳朵贴在窗框的另一端，听到了先后两声敲击声；她站起来离窗框几米远再听，工人又敲了一下，这次却只听到一声。耳朵贴在窗框上时能听到两声的主要原因是什么？',
    note:'单选即时判分；「站起来只听一声」的道理对照判分后解析自查。',
    parts:[
      { kind:'choice', q:'耳朵贴在窗框上时能听到两声的主要原因是什么？',
        opts:['敲击声被窗框反射回来一次，形成回声','声音在固体中比在空气中传播得快，两声先后到达人耳的间隔超过 0.1 s','工人实际上敲了两下','声音在固体中比在空气中传播得慢，两声叠加'], answer:1,
        analysis:'正确答案：声音在<b>固体中比空气中传播得快</b>。敲击声沿两条路径传来：一条经<b>窗框</b>（固体，约 5 000 m/s），一条经<b>空气</b>（约 340 m/s）。窗框足够长时，两列声音到达耳朵的间隔大于 0.1 s，人耳就能分辨出先后两次声音。站起来后声音主要经空气传来，沿窗框传来的那一声与它间隔太短（且已离开窗框），人耳分辨不出，所以只听到一声。' }
    ] },

  { id:'c2s1q5', section:'第1节 声音的产生与传播', no:'第5题', points:10,
    stem:'小杰发现：在浴室里唱歌，声音听起来比在卧室里更响亮、更饱满。这是为什么？',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：浴室空间小，墙面多为瓷砖等坚硬光滑的材料，歌声遇到墙壁被<b>反射</b>回来，反射声与原声到达人耳的时间差<b>小于 0.1 s</b>，人耳分辨不出回声，反射声与原声<b>混在一起</b>使原声加强，所以听起来格外响亮。卧室里窗帘、床品等松软物体吸收声音，宽敞的房间里反射声也较弱，所以不如浴室响亮。',
      analysis:'判分：指出反射声与原声到达人耳的时间差小于 0.1 s、混在一起使原声加强。' }] },

  { id:'c2s1q6', section:'第1节 声音的产生与传播', no:'第6题', points:10,
    stem:'向前传播的声音遇到障碍物能反射回来。周末郊游时，小林站在一处山崖前大喊一声，约 1.8 s 后听到了回声。此时气温为 15 ℃，空气中的声速取 340 m/s，小林距山崖大约多少米？',
    note:'填空即时判分，「306」「约306」等写法均认可。',
    parts:[
      { kind:'blank', blanks:[
        { label:'小林距山崖大约', answer:['306','306m','306 m','306米','约306','约306m','约306米','约306 m'], unit:'m' }],
        analysis:'声音从小林传到山崖再<b>反射回来</b>，1.8 s 内声音走过的总路程是小林到山崖距离的 <b>2 倍</b>。v=340 m/s（15 ℃ 空气），t=1.8 s，s=v·t÷2=340 m/s×1.8 s÷2=<b>约 306 m</b>。' }
    ] },

  // —— 第2节 声音的特性（5 题；2026-10 W2 原创化改写） ——
  { id:'c2s2q1', section:'第2节 声音的特性', no:'第1题', points:12,
    stem:'蝉是靠腹部发音膜的振动发声的。若一只蝉的发音膜在 2 s 内振动了 660 次，它发声的频率是多少？人耳能不能听到？',
    note:'①填空 + ②单选，均即时判分（每空6分）。',
    parts:[
      { kind:'blank', q:'① 频率是多少？', blanks:[
        { label:'频率', answer:['330','330Hz','330hz','330 Hz','330赫兹','330赫'], unit:'Hz' }],
        analysis:'频率 = 振动次数 ÷ 时间 = 660 次 ÷ 2 s = <b>330 Hz</b>。' },
      { kind:'choice', q:'② 人耳能不能听到？',
        opts:['能','不能'], answer:0,
        analysis:'多数人耳能听到的频率范围是 <b>20~20 000 Hz</b>，330 Hz 在这个范围内，所以<b>能听到</b>。' }
    ] },

  { id:'c2s2q2', section:'第2节 声音的特性', no:'第2题', points:12,
    stem:'日常口语里常用“高”“低”来形容声音，如“男高音”“女低音”“放声高歌”“轻声耳语”。这 4 个词语中的“高”“低”各描述的是声音的哪个特性？请逐一点选。',
    note:'四个词语逐一单选即时判分（每题3分）。',
    parts:[
      { kind:'choice', q:'① “男高音”',
        opts:['音调','响度'], answer:0,
        analysis:'<b>男高音</b>、<b>女低音</b>里的“高”“低”指的是声音的高低，描述的是<b>音调</b>。' },
      { kind:'choice', q:'② “女低音”',
        opts:['音调','响度'], answer:0,
        analysis:'<b>男高音</b>、<b>女低音</b>里的“高”“低”指的是声音的高低，描述的是<b>音调</b>。' },
      { kind:'choice', q:'③ “放声高歌”',
        opts:['音调','响度'], answer:1,
        analysis:'<b>放声高歌</b>、<b>轻声耳语</b>里的“高”“低”指的是声音的大小强弱，描述的是<b>响度</b>。' },
      { kind:'choice', q:'④ “轻声耳语”',
        opts:['音调','响度'], answer:1,
        analysis:'<b>放声高歌</b>、<b>轻声耳语</b>里的“高”“低”指的是声音的大小强弱，描述的是<b>响度</b>。' }
    ] },

  { id:'c2s2q3', section:'第2节 声音的特性', no:'第3题', points:10,
    stem:'竹笛和扬琴的音域相近。当竹笛和扬琴演奏同一首乐曲中音高相同的音符时，我们凭声音的哪个特性就能分辨出哪件是竹笛、哪件是扬琴？两者发出声音的波形有什么相同和不同之处？',
    note:'单选即时判分；「波形相同与不同之处」对照判分后解析自查。',
    parts:[
      { kind:'choice', q:'凭声音的哪个特性分辨这两种乐器？',
        opts:['音调','响度','音色'], answer:2,
        analysis:'应选<b>音色</b>：竹笛靠空气柱振动发声，扬琴靠琴弦振动发声，材料与结构不同，发出声音的音色不同。波形上的相同点：<b>疏密程度相同</b>，说明频率相同、音调相同；不同点：<b>波的形状不同</b>，说明音色不同。' }
    ] },

  { id:'c2s2q4', section:'第2节 声音的特性', no:'第4题', points:10,
    stem:'观察一把小提琴（或吉他）。它是靠什么振动发出声音的？演奏时又是怎样改变音调和响度的？',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例：小提琴）：<br>· 发声体：<b>琴弦的振动</b>发出声音，并通过琴身共鸣箱放大；<br>· 改变音调：按弦改变参与振动的弦的<b>长度</b>，或调弦轴改变弦的<b>松紧</b>——弦越短、越紧，振动越快，音调越高；反之音调越低；<br>· 改变响度：改变运弓（拨弦）的<b>力度</b>——力度越大，弦的振幅越大，响度越大；反之响度越小。<br>也可以用吉他回答：琴弦振动发声；按品格改变弦长来改变音调；拨弦力度改变响度。',
      analysis:'判分：指出发声体=琴弦振动；分别说明改变音调（弦长/松紧→频率）与改变响度（力度→振幅）的方法。' }] },

  { id:'c2s2q5', section:'第2节 声音的特性', no:'第5题', points:10,
    stem:'小玉想利用家里的材料，给弟弟做一件能发出高低不同声音的简易乐器，用它吹奏或弹出一段简单的旋律。写出你的制作方案：选用什么材料、怎样制作、怎样让它发出音调不同的声音。',
    note:'本题为开放实践题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（两个制作方案，任选其一）：<br><b>方案一：吸管排箫</b>——取 6~8 根粗吸管，剪成<b>长短不同</b>的一排，用胶带把下端对齐粘牢；对着管口吹气就能发声。声音来自管内<b>空气柱的振动</b>：吸管越短，空气柱振动越快，音调越高；越长音调越低。微调各管长度即可排出“1，2，3，4，5，6，7”的音阶。<br><b>方案二：橡皮筋琴</b>——把粗细不同的几根橡皮筋绷在空纸盒上，纸盒起共鸣放大作用。拨动橡皮筋发声：橡皮筋越<b>细、绷得越紧、振动部分越短</b>，振动越快，音调越高；反之音调越低。用<b>更大的力</b>拨动，橡皮筋振幅更大，响度更大。',
      analysis:'判分：写出完整制作方案（材料+过程）+ 说清发声的振动源与改变音调的原理（排箫=空气柱振动、柱短音高；橡皮筋琴=橡皮筋振动、细紧短音高）。' }] },

  // —— 第3节 声的利用（5 题；2026-10 W2 原创化改写） ——
  { id:'c2s3q1', section:'第3节 声的利用', no:'第1题', points:10,
    stem:'科考船向海底垂直发射一束超声波探测鱼群，经过 8 s 后收到回波。若海水中声音的平均传播速度为 1 500 m/s，则此处海水约有多深？',
    parts:[
      { kind:'blank', blanks:[
        { label:'海水深度约', answer:['6000','6000m','6000 m','6 000','6000米','约6000','约6000m','约6000米'], unit:'m' }],
        analysis:'8 s 是超声波<b>往返</b>（海面→海底→海面）的总时间，计算深度只用单程时间：s=v·t/2=1 500 m/s×8 s÷2=<b>6 000 m</b>。⚠️ 关键：回声测距必须把往返时间<b>除以 2</b>，否则会错算成 12 000 m。' }
    ] },

  { id:'c2s3q2', section:'第3节 声的利用', no:'第2题', points:12,
    stem:'下列事例中，各是利用声传递信息还是利用声传递能量？请逐一分析。',
    note:'四个事例逐一单选即时判分（每题3分）。',
    parts:[
      { kind:'choice', q:'① 铁路检修员用超声波探伤仪检查钢轨内部有无裂纹。',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'探伤是靠声波反射回来的信号获知钢轨内部的“消息”，属于<b>声传递信息</b>。' },
      { kind:'choice', q:'② 兽医通过听诊器听小动物的心跳声判断病情。',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'听诊器听心跳是靠声音获得身体状况的“消息”，属于<b>声传递信息</b>。' },
      { kind:'choice', q:'③ 监测站通过仪器接收到的次声波信号判断台风的方向和强度。',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'判断台风的方向和强度是靠声波携带的“消息”，属于<b>声传递信息</b>。' },
      { kind:'choice', q:'④ 眼镜店用超声波清洗机震落镜片上的污渍。',
        opts:['传递信息','传递能量'], answer:1,
        analysis:'超声波清洗是声波对污渍做功、把它震落，属于<b>声传递能量</b>。' }
    ] },

  { id:'c2s3q3', section:'第3节 声的利用', no:'第3题', points:10,
    stem:'除了上面两题中列举的事例，请你根据对周围生活的观察，再举一个利用声音的例子，并说明这个例子中应用了声音的什么性质。',
    note:'本题为开放举例题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例，答案不唯一）：<br>· 听到雷声知道要下雨了 → 利用<b>声传递信息</b>；<br>· 超声波加湿器、超声波清洗眼镜 → 利用<b>声传递能量</b>。<br>✍️ 自查：你的回答要有两个要素——①一个生活中利用声音的具体例子；②说明它是<b>传递信息</b>还是<b>传递能量</b>。',
      analysis:'判分：例子具体 + 正确说明是传递信息还是传递能量（两要素齐全）。' }] },

  { id:'c2s3q4', section:'第3节 声的利用', no:'第4题', points:10,
    stem:'声音在传播过程中遇到障碍物会发生反射。现代场馆里有许多巧妙利用声反射的设施：如音乐厅舞台上方悬挂的一块块反射板、体育比赛转播时架在场边的抛物面集音器等。请你查阅资料，向同学们介绍一种利用声反射的现代设施，并说明其中的声学道理。',
    note:'本题为开放查阅资料题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（供参考，任选其一）：<br>· <b>舞台反射板</b>：音乐厅舞台上方悬挂的一块块倾斜板面，把演员发出的声音<b>反射</b>向观众席，让观众听到的声音更清晰、响亮，也让台上的演员互相听得清；<br>· <b>抛物面集音器</b>：凹形的抛物面能把来自远处、方向一致的声波经反射<b>会聚</b>到焦点处的话筒上，所以能清楚收录远处球场上的声音；<br>· <b>隧道/长廊回声</b>：在长长的隧道里喊话，声波被两端与侧壁多次反射，形成回声甚至混响。<br>🔍 建议动手查一查：体育馆顶棚的吸声与反射设计、天坛圜丘台心石发声格外洪亮的原理，整理后讲给同学听。',
      analysis:'判分：介绍至少一种利用声反射的设施/场所实例 + 说明其中应用的声学道理（声音的反射或会聚）。' }] },

  { id:'c2s3q5', section:'第3节 声的利用', no:'第5题', points:10,
    stem:'汽车在铺设有等间距伸缩缝的水泥路面上匀速行驶时，车轮每压过一条伸缩缝，车身就上下振动一次，连续压过便发出有节奏的“咯噔”声。当汽车以 72 km/h 的速度行驶时，测得这声音的频率为 4 Hz。相邻两条伸缩缝之间的距离大约是多少？',
    note:'填空即时判分：「5」「约5 m」「5米」等写法均认可。',
    parts:[
      { kind:'blank', blanks:[
        { label:'相邻两条伸缩缝之间的距离约', answer:['5','5m','5 m','5米','约5','约5m','约5 m','约5米','5.0','5.0m','5.0 m'], unit:'' }],
        analysis:'<b>发声原理</b>：车轮每压过一条伸缩缝，车身就上下振动一次，连续压过形成周期性振动而发声。<b>频率与间距的关系</b>：振动频率=车速÷相邻伸缩缝间距，即 f=v/d——间距越小（缝越密），频率越高。<b>本题计算</b>：v=72 km/h=72÷3.6 m/s=<b>20 m/s</b>；d=v÷f=20 m/s÷4 Hz=<b>5 m</b>。' }
    ] },

  // —— 第4节 噪声的危害和控制（5 题；2026-10 W2 原创化改写） ——
  { id:'c2s4q1', section:'第4节 噪声的危害和控制', no:'第1题', points:10,
    stem:'今天从放学到回到家，你听到了哪些噪声？请记录至少两种，写清它们来自哪里；再选出对你影响最大的一种，提出一条减小它的方案，并说明这条方案属于控制噪声的哪个途径（防止噪声产生 / 阻断噪声传播 / 防止噪声进入耳朵）。',
    note:'本题为开放调查题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例，答案不唯一）：<br>· 记录示例：①马路上的汽车鸣笛声——来自<b>交通运输</b>；②沿街商铺的促销喇叭声——来自<b>社会生活</b>；③家里抽油烟机的运转声——来自<b>家用电器</b>；<br>· 方案示例：对汽车鸣笛声，建议在路段设置禁鸣标志、路旁种植绿化带——种植绿化带属于<b>阻断噪声传播</b>；对促销喇叭声，建议商家调低音量或关闭喇叭——属于<b>防止噪声产生</b>。<br>✍️ 自查：你的回答要有两个要素——①记录<b>至少两种噪声及其来源</b>；②对影响最大的一种给出<b>具体方案并指出所属途径</b>。',
      analysis:'判分：记录两种以上噪声源 + 对一种给出有效方案并正确指出"防止产生/阻断传播/防止入耳"途径归属。' }] },

  { id:'c2s4q2', section:'第4节 噪声的危害和控制', no:'第2题', points:10,
    stem:'准备两份难度相同的口算题（各 10 道）。先在安静的卧室里完成第一份，记下所用时间和做错的题数；再到播放着大音量音乐的客厅里完成第二份，同样记下时间和错题数。比较两次的结果，有什么不同？这说明噪声对人有什么影响？',
    note:'本题为开放实践测量题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例结论，个体差异大，以自己实测为准）：<br>· 通常在大音量音乐的环境里，口算<b>用时更长、错题更多</b>；<br>· 这说明噪声不仅干扰听觉，还会使人<b>注意力难以集中、情绪烦躁</b>，降低学习和工作效率，影响人的生理与心理状态。<br>✍️ 自查：你的回答要有两个要素——①两种环境的实测记录齐全（时间+错题数）；②指出噪声对注意力/效率的影响及含义。',
      analysis:'判分：两种环境实测记录齐全 + 指出噪声使人注意力下降、效率降低，影响生理心理状态。' }] },

  { id:'c2s4q3', section:'第4节 噪声的危害和控制', no:'第3题', points:12,
    stem:'某中学教学楼紧邻一处地铁施工工地，施工噪声常常干扰上课。在下列做法中，哪些是有效、合理的？哪些无效或不合理？对后者请简单说明理由。（1）上课时关闭教室门窗，窗口挂上厚窗帘。（2）把朝向工地的窗户打开，让空气流通。（3）用教室音箱大音量播放乐曲来盖过施工声。（4）与施工方协商，把强噪声工序挪到非上课时段。',
    note:'四个做法逐一单选即时判分（每题3分）；「说明理由」部分对照判分后解析自查。',
    parts:[
      { kind:'choice', q:'① 上课时关闭教室门窗，窗口挂上厚窗帘。',
        opts:['有效合理','无效或不合理'], answer:0,
        analysis:'有效且合理：关闭门窗、挂厚窗帘能在噪声的传播路径上<b>阻挡和吸收部分声波</b>，属于<b>阻断噪声传播</b>，可减小传入教室的施工噪声。' },
      { kind:'choice', q:'② 把朝向工地的窗户打开，让空气流通。',
        opts:['有效合理','无效或不合理'], answer:1,
        analysis:'无效且不合理：打开朝向工地的窗户，施工噪声<b>畅通无阻地传入教室</b>，反而使教室内噪声更大。' },
      { kind:'choice', q:'③ 用教室音箱大音量播放乐曲来盖过施工声。',
        opts:['有效合理','无效或不合理'], answer:1,
        analysis:'无效且不合理：播放乐曲等于在教室里<b>又增加了一个强声源</b>，教室内总的声音反而更大，不能减弱噪声的干扰。' },
      { kind:'choice', q:'④ 与施工方协商，把强噪声工序挪到非上课时段。',
        opts:['有效合理','无效或不合理'], answer:0,
        analysis:'有效且合理：让强噪声工序避开上课时间，是从<b>声源处</b>入手（<b>防止噪声产生</b>），上课时教室内自然安静。' }
    ] },

  { id:'c2s4q4', section:'第4节 噪声的危害和控制', no:'第4题', points:10,
    stem:'完成一则“噪声日记”：记下今天最让你受不了的一次噪声——它出现在什么时间、什么地点？当时你的身体和情绪有什么反应？它的声源属于哪一类（交通、施工、家用电器、社会生活等）？再结合这次记录说明：为什么人们把噪声称作“隐形的健康杀手”？',
    note:'本题为开放感受题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例，答案不唯一）：<br>· 日记示例：清晨六点多，小区旁工地开始打桩（<b>施工噪声</b>），把我从睡梦中惊醒，之后心烦意乱、再难入睡，一上午注意力都集中不起来；<br>· 危害说明：长期处在强噪声环境中，会<b>损伤听力</b>，还会影响<b>睡眠、情绪</b>，甚至诱发头痛、血压升高等问题——它不像外伤那样看得见，却在悄悄损害健康，所以被称为“隐形的健康杀手”。<br>✍️ 自查：你的回答要有两个要素——①日记要素齐全（时间地点+身体情绪反应+声源类别）；②结合记录说明噪声对健康的危害。',
      analysis:'判分：噪声日记要素齐全（时间地点/感受反应/声源类别）+ 说明噪声危害健康（听力/睡眠/情绪等）两要素齐全。' }] },

  { id:'c2s4q5', section:'第4节 噪声的危害和控制', no:'第5题', points:10,
    stem:'某工厂的空压机工作时噪声很大，厂区里的工人深受其扰。技术改造时，工厂把空压机房改成双层墙、夹层中填充吸声材料，通风窗也换成了双层玻璃窗。请从减少噪声危害的角度，谈谈这样改造的道理。',
    note:'本题为开放简答题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>· 空压机运转产生的噪声通过<b>空气和墙体</b>向机房四周传播；<br>· 双层墙、夹层吸声材料和双层玻璃窗都处在噪声的<b>传播路径</b>上，能够<b>阻挡、反射和吸收部分声波</b>，使传出机房的噪声大大减弱；<br>· 从控制噪声的途径看，这属于在<b>传播过程中阻断噪声传播</b>，从而保护厂区里的工人。<br>✍️ 自查：你的回答要有两个要素——①说明双层墙/吸声材料是在<b>传播过程中阻断噪声</b>；②指出最终效果是<b>减弱传出的噪声、保护工人</b>。',
      analysis:'判分：指出双层墙与吸声材料在传播过程中阻断（阻挡/反射/吸收）噪声 + 效果是减弱传出机房的噪声、保护工人。' }] },

  // —— 第5节 跨学科实践：制作隔音房间模型（8 题；2026-10 W2 原创化改写） ——
  { id:'c2s5q1', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第1题', points:10,
    stem:'把下列句子补充完整：声音源于物体的____；声音要靠____才能传播，真空中声音无法传播。',
    note:'两空一并提交即时判分（每空5分，全对得分）。',
    parts:[
      { kind:'blank', blanks:[
        { label:'声音源于物体的', answer:['振动'], unit:'' },
        { label:'声音要靠什么才能传播', answer:['介质'], unit:'' }],
        analysis:'声音源于物体的<b>振动</b>；声音要靠<b>介质</b>才能传播，真空中声音无法传播。' }
    ] },

  { id:'c2s5q2', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第2题', points:12,
    stem:'判断下面两条说法是对还是错。',
    note:'两个说法逐一单选即时判分（每题6分）。',
    parts:[
      { kind:'choice', q:'① 声速的大小既与介质的种类有关，也与介质的温度有关。',
        opts:['正确','错误'], answer:0,
        analysis:'<b>正确</b>：声速的大小既与介质的种类有关（一般固体&gt;液体&gt;气体），也与介质的温度有关（空气温度越高声速越大）。' },
      { kind:'choice', q:'② 声音传播途中碰到障碍物时只会被吸收，不会发生反射。',
        opts:['正确','错误'], answer:1,
        analysis:'<b>错误</b>：声音传播途中碰到障碍物时<b>会发生反射</b>（回声就是声的反射）。该说法把“会反射”说成“不会反射”，所以错误。' }
    ] },

  { id:'c2s5q3', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第3题', points:12,
    stem:'把下面三条描述分别对应到声音的哪一个特性。',
    note:'三条描述逐一单选即时判分（每题4分）。',
    parts:[
      { kind:'choice', q:'① 声音的高低，取决于发声体振动的频率。',
        opts:['音调','响度','音色'], answer:0,
        analysis:'<b>音调</b>：声音的高低，取决于发声体振动的频率——频率越高，音调越高。' },
      { kind:'choice', q:'② 声音的大小强弱，与发声体振动的幅度及听者距发声体的远近有关。',
        opts:['音调','响度','音色'], answer:1,
        analysis:'<b>响度</b>：声音的大小强弱，与发声体振动的幅度及听者距发声体的远近有关——振幅越大、距离越近，响度越大。' },
      { kind:'choice', q:'③ 不同发声体发出声音各具特色，可据此分辨是哪种发声体。',
        opts:['音调','响度','音色'], answer:2,
        analysis:'<b>音色</b>：不同发声体发出声音各具特色，可据此分辨是哪种发声体。' }
    ] },

  { id:'c2s5q4', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第4题', points:10,
    stem:'演出中，鼓手先轻轻点了一下鼓面，随后又用很大的力擂响同一面鼓。前后两次发出的声音，主要发生了变化的特性是哪个？它由什么因素决定？',
    parts:[
      { kind:'choice', q:'前后两次声音主要变化的特性是哪个？',
        opts:['音调','响度','音色'], answer:1,
        analysis:'变化的是<b>响度</b>：用力越大，鼓面振动的<b>幅度</b>越大，声音的响度越大；轻点时振幅小，响度小。前后两次鼓面振动的快慢基本相同（音调不变）、鼓本身没变（音色不变）。响度由<b>振幅</b>决定，还与听者<b>距发声体的远近</b>有关。' }
    ] },

  { id:'c2s5q5', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第5题', points:10,
    stem:'声的利用可以分成两大类：靠声波带回“消息”，或靠声波对物体做功。请判断下面五个实例各属于哪一类。',
    note:'五个实例逐一单选即时判分（每题2分）。',
    parts:[
      { kind:'choice', q:'① 汽车倒车雷达利用超声波探测车尾与障碍物的距离',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'声可以传递信息：如<b>倒车雷达</b>、声呐探鱼、叩诊——靠声波带回的“消息”探知物体的位置或内部情况。' },
      { kind:'choice', q:'② 渔船用声呐探测鱼群的位置',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'声可以传递信息：如倒车雷达、<b>声呐探鱼</b>、叩诊——靠声波带回的“消息”探知物体的位置或内部情况。' },
      { kind:'choice', q:'③ 医生用手指叩击患者腹部，凭发出的声音判断病情',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'声可以传递信息：如倒车雷达、声呐探鱼、<b>叩诊</b>——靠声音的变化获得身体状况的“消息”。' },
      { kind:'choice', q:'④ 超声波加湿器把水“打碎”成细雾，增加室内空气湿度',
        opts:['传递信息','传递能量'], answer:1,
        analysis:'声可以传递能量：如<b>超声波加湿器</b>、超声除锈——声波对物体<b>做功</b>，把水打成细雾。' },
      { kind:'choice', q:'⑤ 用超声波振动除去金属零件表面的锈层',
        opts:['传递信息','传递能量'], answer:1,
        analysis:'声可以传递能量：如超声波加湿器、<b>超声除锈</b>——声波对锈层<b>做功</b>，把它从零件表面剥离。' }
    ] },

  { id:'c2s5q6', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第6题', points:12,
    stem:'某小区的“安静小区”改造方案中列出了四条措施：A. 小区内禁止汽车鸣笛　B. 在道路两旁种植灌木绿化带　C. 定期向小区道路洒水压尘　D. 给临路住户换装双层玻璃窗。其中哪些属于控制噪声的措施？（多选判定）',
    note:'本考点为多选；本页对四条措施逐一作「属于/不属于」单选判定（每题3分），判分等价。',
    parts:[
      { kind:'choice', q:'① A. 小区内禁止汽车鸣笛',
        opts:['属于控制噪声的措施','不属于'], answer:0,
        analysis:'属于：禁止鸣笛是从<b>声源处</b>入手，<b>防止噪声产生</b>——控制噪声三途径（防止产生/阻断传播/防止入耳）之一。' },
      { kind:'choice', q:'② B. 在道路两旁种植灌木绿化带',
        opts:['属于控制噪声的措施','不属于'], answer:0,
        analysis:'属于：绿化带能吸收、反射部分声波，在<b>传播过程中阻断噪声传播</b>——控制噪声三途径之一。' },
      { kind:'choice', q:'③ C. 定期向小区道路洒水压尘',
        opts:['属于控制噪声的措施','不属于'], answer:1,
        analysis:'不属于：洒水压尘是为了减少<b>扬尘</b>，改善空气质量，与减弱噪声无关。' },
      { kind:'choice', q:'④ D. 给临路住户换装双层玻璃窗',
        opts:['属于控制噪声的措施','不属于'], answer:0,
        analysis:'属于：双层玻璃窗在噪声传入室内的路径上<b>阻断噪声传播</b>，使住户听到的噪声减弱——控制噪声三途径之一。' }
    ] },

  { id:'c2s5q7', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第7题', points:10,
    stem:'在“制作隔音房间模型”的实践活动中，第三组先在模型里放一个正在响铃的小闹钟并盖上盖子；接着又给模型做了两项改进：窗口挂上一小片棉布窗帘、内壁四周衬上一层毛毡。改进后，模型外听到的铃声明显变小了。这两项改进属于控制噪声的哪个途径？为什么？',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：棉布窗帘和毛毡都是松软多孔的<b>吸声材料</b>，它们处在闹钟声向外传播的<b>路径</b>上，能吸收、削弱传播中的声波，减少传出模型外的声能——这属于在<b>传播过程中阻断噪声传播</b>。<br>✍️ 自查：你的回答要点——① 指出这是"阻断噪声传播"；② 结合"吸声材料装在声音传播路径上"说明它作用于声音的传播过程。',
      analysis:'判分：结论=阻断噪声传播（吸声材料在声音传播过程中吸收、削弱声波）。' }] },

  { id:'c2s5q8', section:'第5节 跨学科实践：制作隔音房间模型', no:'综合 第8题', points:10,
    stem:'爸爸习惯在深夜看足球赛直播，解说声和欢呼声常常吵得全家人和楼上楼下的邻居休息不好。请从声源处、传播过程中和接收处三个角度，各提出一条措施，帮爸爸既看好球又尽量不影响别人休息。',
    note:'本题为开放综合题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（答案不唯一，言之有理即可）：<br>· <b>声源处减弱</b>：把电视音量调小，或改戴耳机看球——让声音不再通过空气大面积向外辐射；<br>· <b>传播过程中阻断</b>：看球时关好客厅门窗、拉上厚窗帘，阻断声音向卧室和楼外传播；<br>· <b>接收处防护</b>：家人休息时戴耳塞、关好自己卧室的门窗，防止噪声进入耳朵。<br>✍️ 自查：你的回答要同时覆盖"防止噪声产生 / 阻断噪声传播 / 防止噪声进入耳朵"三个方面，且结合深夜看球场景具体说明。',
      analysis:'判分：同时覆盖声源处（防止产生）/传播过程中（阻断传播）/接收处（防止入耳）三方面且结合深夜看球场景。' }] },

]; // 闭合 QUESTIONS 数组（共 29 题：第1节×6、第2节×5、第3节×5、第4节×5、第5节×8；总分 304）

/* ===== 状态与持久化 ===== */
const STORAGE_KEY = 'c2_practice_state_v1';
let STATE = { scores: {}, done: {}, choice: {}, blank: {}, open: {} };

function initState() {
  const defaults = { scores: {}, done: {}, choice: {}, blank: {}, open: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    STATE = Object.assign({}, defaults, saved);
  } catch (e) { STATE = defaults; }
  ['scores', 'done', 'choice', 'blank', 'open'].forEach(k => { if (!STATE[k]) STATE[k] = {}; });
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

/* ===== 程序化插图（本章无配图，保留渲染入口与样板一致） ===== */
const FIGURES = {};

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
      `<button class="opt" data-qid="${q.id}" data-pi="${pi}" data-idx="${idx}">${['A','B','C','D'][idx]}. ${esc(opt)}</button>`
    ).join('');
    return `<div class="part" data-key="${key}">${head}<div class="opts">${opts}</div><div class="fb" data-role="fb"></div></div>`;
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
  $all('.opt').forEach(btn => btn.addEventListener('click', onChoiceClick));
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

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
    stem:'游泳馆里进行花样游泳表演时，运动员整个头部没入水中，仍能跟上乐曲的节奏完成动作。请你以这件事为例说明：水是可以传播声音的介质。',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：运动员头部没入水中后，池边音响放出的乐曲声经过<b>水</b>传到她的耳中，所以她仍能踩着节奏完成动作——说明水（液体）能够传播声音，是可以传声的介质。',
      analysis:'判分：指出乐曲声经水传入水下运动员耳中 → 水（液体）能够传声、是传声介质。' }] },

  { id:'c2s1q3', section:'第1节 声音的产生与传播', no:'第3题', points:10,
    stem:'下面列出了一些介质中的声速数据：铁棒 5 200 m/s、水 1 500 m/s、空气（0 ℃）331 m/s、空气（15 ℃）340 m/s、空气（25 ℃）346 m/s。从这些数据中，你能获得关于声速的哪些信息？',
    note:'本题为开放归纳题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 声速的大小跟<b>介质的种类</b>有关：不同介质中声速一般不同；<br>② 一般情况下 <b>固体 &gt; 液体 &gt; 气体</b>（如铁棒 5 200 &gt; 水 1 500 &gt; 空气 340 m/s）；<br>③ 声速还跟<b>温度</b>有关：空气 0 ℃ 331、15 ℃ 340、25 ℃ 346 m/s，温度越高声速越大；<br>④ 15 ℃ 时空气中的声速是 <b>340 m/s</b>。',
      analysis:'判分：答出关于声速的正确信息即可（介质种类有关 / 固液气大小关系 / 温度影响 / 15 ℃ 空气中 340 m/s）。' }] },

  { id:'c2s1q4', section:'第1节 声音的产生与传播', no:'第4题', points:10,
    stem:'工人师傅检修铁路时，把耳朵贴在长铁轨的一端，让另一名工人在铁轨的另一端用锤子敲一下。你认为他能听到几次敲击声？请说出其中的道理。',
    note:'单选即时判分；「说出道理」部分对照判分后解析自查。',
    parts:[
      { kind:'choice', q:'他能听到几次敲击声？',
        opts:['1 次','2 次','3 次'], answer:1,
        analysis:'正确答案：<b>2 次</b>。敲击声沿两条路径传来：一条经<b>铁轨</b>（固体，约 5 200 m/s），一条经<b>空气</b>（约 340 m/s）。声音在钢铁中传播比在空气中<b>快得多</b>，铁轨足够长时，两列声音到达耳朵的间隔大于 0.1 s，人耳就能分辨出先后<b>两次</b>敲击声：先听到沿铁轨传来的，后听到沿空气传来的。' }
    ] },

  { id:'c2s1q5', section:'第1节 声音的产生与传播', no:'第5题', points:10,
    stem:'小杰发现：在浴室里唱歌，声音听起来比在卧室里更响亮、更饱满。这是为什么？',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：浴室空间小，墙面多为瓷砖等坚硬光滑的材料，歌声遇到墙壁被<b>反射</b>回来，反射声与原声到达人耳的时间差<b>小于 0.1 s</b>，人耳分辨不出回声，反射声与原声<b>混在一起</b>使原声加强，所以听起来格外响亮。卧室里窗帘、床品等松软物体吸收声音，宽敞的房间里反射声也较弱，所以不如浴室响亮。',
      analysis:'判分：指出反射声与原声到达人耳的时间差小于 0.1 s、混在一起使原声加强。' }] },

  { id:'c2s1q6', section:'第1节 声音的产生与传播', no:'第6题', points:10,
    stem:'向前传播的声音遇到障碍物能反射回来。周末郊游时，小林站在一处山崖前大喊一声，约 1.5 s 后听到了回声。此时气温为 15 ℃，空气中的声速取 340 m/s，小林距山崖大约多少米？',
    note:'填空即时判分，「255」「约255」等写法均认可。',
    parts:[
      { kind:'blank', blanks:[
        { label:'小林距山崖大约', answer:['255','255m','255 m','255米','约255','约255m','约255米','约255 m'], unit:'m' }],
        analysis:'声音从小林传到山崖再<b>反射回来</b>，1.5 s 内声音走过的总路程是小林到山崖距离的 <b>2 倍</b>。v=340 m/s（15 ℃ 空气），t=1.5 s，s=v·t÷2=340 m/s×1.5 s÷2=<b>约 255 m</b>。' }
    ] },

  // —— 第2节 声音的特性（5 题；2026-10 W2 原创化改写） ——
  { id:'c2s2q1', section:'第2节 声音的特性', no:'第1题', points:12,
    stem:'蝉是靠腹部发音膜的振动发声的。若一只蝉的发音膜在 2 s 内振动了 700 次，它发声的频率是多少？人耳能不能听到？',
    note:'①填空 + ②单选，均即时判分（每空6分）。',
    parts:[
      { kind:'blank', q:'① 频率是多少？', blanks:[
        { label:'频率', answer:['350','350Hz','350hz','350 Hz','350赫兹','350赫'], unit:'Hz' }],
        analysis:'频率 = 振动次数 ÷ 时间 = 700 次 ÷ 2 s = <b>350 Hz</b>。' },
      { kind:'choice', q:'② 人耳能不能听到？',
        opts:['能','不能'], answer:0,
        analysis:'多数人耳能听到的频率范围是 <b>20~20 000 Hz</b>，350 Hz 在这个范围内，所以<b>能听到</b>。' }
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
    stem:'学校艺术节上要举行小型音乐会，要求大家用自制乐器登台演奏，比一比谁的乐器有新意、谁演奏得好。写出你的制作过程。下面两个制作方案也许能给你启发。',
    note:'本题为开放实践题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（两个制作方案）：<br><b>方案一：水瓶琴</b>——找 8 只相同的玻璃瓶排成一排，分别灌入<b>高低不同</b>的水，反复微调水量直到音阶准确；用筷子轻敲瓶口边沿，就能敲出“1，2，3，4，5，6，7，i”一串音。敲击发声时是瓶壁和水一起振动：水多→整体振动慢→音调低；水少→振动快→音调高，所以<b>水最多的瓶子音最低（do）</b>、水最少的音最高（i）。<br><b>方案二：活塞哨子</b>——取一段两端开口的塑料管或竹管，在筷子上缠些棉花或碎布制成“活塞”，蘸水后从下端塞入管内，嘴吹管的上端就能吹响；上下推拉活塞改变管内空气柱的长度，音调随之改变。哨音来自管内<b>空气柱的振动</b>：空气柱越长振动越慢、音调越低；越短音调越高。',
      analysis:'判分：写出完整制作过程 + 说清发声的振动源与改变音调的原理（水瓶琴=瓶和水振动、水多音低；哨子=空气柱振动、柱长音低）。' }] },

  // —— 第3节 声的利用（5 题；2026-10 W2 原创化改写） ——
  { id:'c2s3q1', section:'第3节 声的利用', no:'第1题', points:10,
    stem:'科考船向海底垂直发射一束超声波探测鱼群，经过 6 s 后收到回波。若海水中声音的平均传播速度为 1 500 m/s，则此处海水约有多深？',
    parts:[
      { kind:'blank', blanks:[
        { label:'海水深度约', answer:['4500','4500m','4500 m','4 500','4500米','约4500','约4500m','约4500米'], unit:'m' }],
        analysis:'6 s 是超声波<b>往返</b>（海面→海底→海面）的总时间，计算深度只用单程时间：s=v·t/2=1 500 m/s×6 s÷2=<b>4 500 m</b>。⚠️ 关键：回声测距必须把往返时间<b>除以 2</b>，否则会错算成 9 000 m。' }
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
    stem:'声音在传播过程中遇到障碍物会发生反射。我国古代建筑师利用这一特点建造了许多奇妙的建筑，例如北京天坛的回音壁、重庆潼南大佛寺的石琴、山西永济普救寺的莺莺塔等。请你查阅资料，向同学们介绍并展示我国古代建筑应用声学知识的实例。',
    note:'本题为开放查阅资料题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（供参考）：<br>· <b>回音壁</b>：围墙内壁光滑、整体呈圆形，声波贴着墙面连续反射前行，能传到很远处——两人隔着墙贴壁轻声说话也能彼此听清；<br>· <b>三音石</b>：皇穹宇到回音壁大门之间的石路，站在不同位置的石板上拍手，可分别听到一次、两次、三次回声；<br>· <b>圜丘天心石</b>：站在天心石上发声，回声约 0.07 s 就返回台面中心，与原声叠在一起，听起来格外洪亮。<br>🔍 建议动手查一查：重庆潼南大佛寺的石琴、山西永济普救寺的莺莺塔，整理后讲给同学听。',
      analysis:'判分：介绍至少一个我国古代建筑实例 + 说明其中应用的声学道理（声音的反射）。' }] },

  { id:'c2s3q5', section:'第3节 声的利用', no:'第5题', points:10,
    stem:'有些地方的公路上铺设有“音乐路面”。路面上分布着许多横向凹槽，汽车每经过一个凹槽，车身就会上下振动一次；凹槽分布得比较密时，汽车行进中的振动就很快，于是发出声音。凹槽的疏密可以按照乐曲的音调高低来设计：假设某音乐路面规定的行驶速度是 72 km/h，设定的乐曲中第一个音符“la”的频率为 440 Hz，汽车奏出这个音符时，相邻凹槽之间的距离约是多少？',
    note:'填空即时判分：以米或厘米作答均认可（约 0.043~0.047 m 或 4.3~4.7 cm 区间内的写法，如「0.045」「约0.045 m」「4.5」「约4.5 cm」）。',
    parts:[
      { kind:'blank', blanks:[
        { label:'相邻凹槽之间的距离', answer:['0.045','0.045m','0.045 m','约0.045','约0.045m','约0.045 m','0.043','0.044','0.046','0.047','0.043m','0.044m','0.046m','0.047m','4.5','4.5cm','4.5 cm','约4.5','约4.5cm','约4.5 cm','4.3cm','4.4cm','4.6cm','4.7cm','4.3','4.4','4.6','4.7'], unit:'' }],
        analysis:'<b>发声原理</b>：汽车每经过一个凹槽就上下振动一次，连续经过凹槽形成周期性振动而发声（汽车成了"振动源"）。<b>频率与间距的关系</b>：振动频率=车速÷相邻凹槽间距，即 f=v/λ——间距越小（凹槽越密），频率越高，音调越高。<b>本题计算</b>：v=72 km/h=72÷3.6 m/s=<b>20 m/s</b>；λ=v/f=20÷440 m≈<b>0.045 m≈4.5 cm</b>。<b>本质</b>：音乐路面把"乐曲的音符序列"编码成"凹槽间距序列"，匀速行驶的汽车就是读取这段"编码"的<b>播放器</b>。' }
    ] },

  // —— 第4节 噪声的危害和控制（5 题；2026-10 W2 原创化改写） ——
  { id:'c2s4q1', section:'第4节 噪声的危害和控制', no:'第1题', points:10,
    stem:'调查一下学校周围或者你居住的小区里存在哪些噪声。针对这些噪声，应该采取什么样的控制措施？与小组同学交流调查结果，比一比谁的调查更详细、谁提出的措施更可行。',
    note:'本题为开放调查题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例，答案不唯一）：<br>· <b>操场课间</b>：喧哗声、体育器材碰撞声 → 属于<b>防止噪声进入耳朵</b>：必要时戴耳塞，或规定活动区域远离教学楼；<br>· <b>校门口马路</b>：汽车鸣笛声 → 属于<b>阻断噪声传播</b>：设置禁鸣标志、在校门口路段植树或安装隔音屏障；<br>· <b>家中厨房</b>：抽油烟机、破壁机运转声 → 属于<b>防止噪声产生</b>：选购低噪声电器，使用时关厨房门以阻断传播。<br>✍️ 自查：你的回答要有两个要素——①列出<b>具体的噪声源</b>；②针对每个噪声源给出<b>控制噪声的有效措施</b>（从"防止噪声产生 / 阻断噪声传播 / 防止噪声进入耳朵"三途径中说明）。',
      analysis:'判分：噪声源具体 + 措施有效且对应"防止产生/阻断传播/防止入耳"三途径。' }] },

  { id:'c2s4q2', section:'第4节 噪声的危害和控制', no:'第2题', points:10,
    stem:'先在安静的房间里坐一会儿，数出你的脉搏在 1 min 内跳动的次数；再到声音很大的环境（例如课间放着音乐的操场）里，同样数出 1 min 内脉搏跳动的次数。两种情况下你的脉搏有变化吗？',
    note:'本题为开放实践测量题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例结论，个体差异大，以自己实测为准）：<br>· 在声音过大的环境中，人的脉搏通常会<b>略微加快</b>；<br>· 这说明噪声不仅影响听觉，还会影响<b>人体的生理状态</b>。<br>✍️ 自查：你的回答要有两个要素——①分别记录在<b>安静环境</b>和<b>声音过大环境</b>中 1 min 的脉搏次数；②指出噪声对脉搏可能产生的影响及含义。',
      analysis:'判分：两种环境实测记录齐全 + 指出噪声会使脉搏加快、影响生理状态。' }] },

  { id:'c2s4q3', section:'第4节 噪声的危害和控制', no:'第3题', points:12,
    stem:'临街的一间教室想减弱马路环境噪声的干扰。在下列做法中，哪些是有效、合理的？哪些无效或不合理？对后者请简单说明理由。（1）老师用更大的声音讲课。（2）全班每位学生上课都戴防噪声耳罩。（3）在教室四周种一排树。（4）在教室里安装噪声监测装置。',
    note:'四个做法逐一单选即时判分（每题3分）；「说明理由」部分对照判分后解析自查。',
    parts:[
      { kind:'choice', q:'① 老师用更大的声音讲课。',
        opts:['有效合理','无效或不合理'], answer:1,
        analysis:'无效且不合理：老师提高音量虽能让学生听得清些，但教室内的总噪声反而增大，本质上是用更大的声源响度去对抗环境噪声，对保持教室安静没有帮助。' },
      { kind:'choice', q:'② 全班每位学生上课都戴防噪声耳罩。',
        opts:['有效合理','无效或不合理'], answer:1,
        analysis:'能隔声但不合理：耳罩确实可以<b>防止噪声进入耳朵</b>，但同时会把老师的讲课声也挡在耳外，影响听课，因此不是合理方案。' },
      { kind:'choice', q:'③ 在教室四周种一排树。',
        opts:['有效合理','无效或不合理'], answer:0,
        analysis:'有效且合理：树木能吸收、反射部分声波，<b>阻断噪声传播</b>，从而减少马路噪声传入教室。' },
      { kind:'choice', q:'④ 在教室里安装噪声监测装置。',
        opts:['有效合理','无效或不合理'], answer:1,
        analysis:'无效：监测装置只能测出噪声的大小，<b>不能减弱噪声</b>，因此不能让教室免受环境噪声干扰。' }
    ] },

  { id:'c2s4q4', section:'第4节 噪声的危害和控制', no:'第4题', points:10,
    stem:'噪声给人们的生活和学习带来许多影响。结合你自己的经历，说说噪声带给你的感受，并找出这些噪声的来源。',
    note:'本题为开放感受题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例，答案不唯一）：<br>· <b>感受</b>：噪声让人心烦意乱、注意力难以集中，长时间处在强噪声中还会影响听力和睡眠；<br>· <b>来源</b>：交通噪声（汽车、地铁）、建筑施工噪声、家用电器噪声、校园与社区的人群喧哗等。<br>✍️ 自查：你的回答要有两个要素——①描述噪声给你带来的<b>真实感受</b>；②指出具体噪声的<b>来源</b>。',
      analysis:'判分：真实感受 + 具体噪声来源两要素齐全。' }] },

  { id:'c2s4q5', section:'第4节 噪声的危害和控制', no:'第5题', points:10,
    stem:'穿过居民区的高架路两侧，常常竖立着一道道隔音板。请从减少噪声危害的角度，谈谈这样做有什么道理。',
    note:'本题为开放简答题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>· 高架路上车辆行驶产生噪声，噪声向道路两侧传播；<br>· 隔音板竖立在噪声的传播路径上，可以<b>阻挡、反射和吸收部分声波</b>，使传入居民区的噪声减弱；<br>· 从控制噪声的途径看，这属于在<b>传播过程中阻断噪声传播</b>。<br>✍️ 自查：你的回答要有两个要素——①说明隔音板是通过<b>阻断噪声传播</b>来减弱噪声；②指出最终效果是<b>减弱传入居民区的噪声</b>。',
      analysis:'判分：指出隔音板在传播过程中阻断（阻挡/反射/吸收）噪声 + 效果是减弱传入居民区的噪声。' }] },

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
    stem:'“声音的大小强弱，与发声体振动的幅度及听者距发声体的远近有关。”这句话描述的是声音的哪个特性？',
    parts:[
      { kind:'choice', opts:['音调','响度','音色'], answer:1,
        analysis:'描述的是<b>响度</b>：声音的大小强弱，与发声体振动的幅度及听者距发声体的远近有关。' }
    ] },

  { id:'c2s5q5', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第5题', points:10,
    stem:'下面五个应用实例，分别属于利用声传递信息还是利用声传递能量？',
    note:'五个实例逐一单选即时判分（每题2分）。',
    parts:[
      { kind:'choice', q:'① 回声定位',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'声可以传递信息：如<b>回声定位</b>、B 超、超声检测——靠声波探知物体的位置或内部情况。' },
      { kind:'choice', q:'② B超',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'声可以传递信息：如回声定位、<b>B 超</b>、超声检测——靠声波探知物体的位置或内部情况。' },
      { kind:'choice', q:'③ 超声检测',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'声可以传递信息：如回声定位、B 超、<b>超声检测</b>——靠声波探知物体的位置或内部情况。' },
      { kind:'choice', q:'④ 超声波清洗',
        opts:['传递信息','传递能量'], answer:1,
        analysis:'声可以传递能量：如<b>超声波清洗</b>、超声波碎石——声波对物体做功。' },
      { kind:'choice', q:'⑤ 超声波碎石',
        opts:['传递信息','传递能量'], answer:1,
        analysis:'声可以传递能量：如超声波清洗、<b>超声波碎石</b>——声波对物体做功。' }
    ] },

  { id:'c2s5q6', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第6题', points:12,
    stem:'要想减弱噪声的危害，可以从下面哪些方面着手？（多选）A. 防止噪声产生　B. 阻断噪声传播　C. 防止噪声进入耳朵　D. 提高声音频率',
    note:'本考点为多选；本页对四个选项逐一作「属于/不属于」单选判定（每题3分），判分等价。',
    parts:[
      { kind:'choice', q:'① A. 防止噪声产生',
        opts:['属于控制噪声的方面','不属于'], answer:0,
        analysis:'控制噪声可以从<b>防止噪声产生、阻断噪声传播和防止噪声进入耳朵</b>三个方面着手，本项属于。' },
      { kind:'choice', q:'② B. 阻断噪声传播',
        opts:['属于控制噪声的方面','不属于'], answer:0,
        analysis:'控制噪声可以从<b>防止噪声产生、阻断噪声传播和防止噪声进入耳朵</b>三个方面着手，本项属于。' },
      { kind:'choice', q:'③ C. 防止噪声进入耳朵',
        opts:['属于控制噪声的方面','不属于'], answer:0,
        analysis:'控制噪声可以从<b>防止噪声产生、阻断噪声传播和防止噪声进入耳朵</b>三个方面着手，本项属于。' },
      { kind:'choice', q:'④ D. 提高声音频率',
        opts:['属于控制噪声的方面','不属于'], answer:1,
        analysis:'提高声音频率<b>不能</b>控制噪声，不属于控制噪声的三个方面。' }
    ] },

  { id:'c2s5q7', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第7题', points:10,
    stem:'在制作隔音房间模型的实践活动中，我们在模型内壁贴上海绵来减弱传入的声音。这种做法属于控制噪声的哪个途径？',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：海绵贴在模型内壁，用来吸收、削弱正在传播的声音，属于<b>阻断噪声传播</b>。<br>✍️ 自查：你的回答要点——① 指出这是"阻断噪声传播"；② 结合"吸声材料装在房间内壁"说明它作用于声音的传播过程。',
      analysis:'判分：结论=阻断噪声传播（吸声材料作用于声音传播过程）。' }] },

  { id:'c2s5q8', section:'第5节 跨学科实践：制作隔音房间模型', no:'综合 第8题', points:10,
    stem:'周末你想在家练钢琴，又不想打扰楼上楼下的邻居。请分别从声源处、传播过程中和接收处三个角度，各提出一条减小干扰的措施。',
    note:'本题为开放综合题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（答案不唯一，言之有理即可）：<br>· <b>声源处减弱</b>：把钢琴音量调低，或在琴脚下垫减振垫，减少振动向楼体传递；<br>· <b>传播过程中阻断</b>：练琴时关好门窗，在墙面与门窗缝隙处加铺隔音、吸音材料，阻断噪声外传；<br>· <b>接收处防护</b>：提醒家人在需要时戴上耳塞、关好自己房间的门窗，防止噪声进入耳朵。<br>✍️ 自查：你的回答要同时覆盖"防止噪声产生 / 阻断噪声传播 / 防止噪声进入耳朵"三个方面，且结合练琴场景具体说明。',
      analysis:'判分：同时覆盖声源处（防止产生）/传播过程中（阻断传播）/接收处（防止入耳）三方面且结合练琴场景。' }] },

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

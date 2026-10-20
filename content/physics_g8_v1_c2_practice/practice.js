/* ===== 本章练习题库（第二章 声现象） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 题源：各节 quiz.html「练习与应用/知识梳理」原题整合迁移，共 29 题：
 *   第1节 声音的产生与传播×6 + 第2节 声音的特性×5 + 第3节 声的利用×5
 *   + 第4节 噪声的危害和控制×5 + 第5节 跨学科实践（知识梳理）×8；总分 304 分（各题 points 之和）。
 * 题型映射：原 quiz 的配对/判断/多选题按小问拆为多个 choice part（每小问独立判分，
 *   partPoints=round(points/parts.length)，分值取可整除数保证总分=Σpoints）。
 * 分值规则对齐 c6_practice 样板：单 part 题 10 分；多 part 题 12 分（5 part 题 10 分）。
 * 原 quiz 中指向本节仿真页的相对链接（exp-dual/exp-echo/exp-craft）不迁移（章级页相对路径不可达）。
 * 用户可见字符串零「教材 P××」页码字眼；图号（图2.3-11 等）照原题保留。
 */
const QUESTIONS = [
  // —— 第1节 声音的产生与传播（练习与应用 第1~6 题，6 题；源：c2_s1/quiz.html） ——
  { id:'c2s1q1', section:'第1节 声音的产生与传播', no:'练习与应用 第1题', points:10,
    stem:'用手拨动绷紧的橡皮筋，我们听到了声音，同时看到橡皮筋变"胖"变"虚"了，这是橡皮筋在振动。请你另外举例说明：你在听到声音的同时，是如何判断物体在发生振动的？',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（任选其一即可）：<br>· 发声的音叉旁放一个乒乓球，球被反复弹开；<br>· 说话时用手轻按喉部，感到声带在振动；<br>· 敲鼓时鼓面上的纸屑（豆粒）随之跳动；<br>· 手机响铃时贴在桌面上，能感到桌面发麻。<br><b>核心方法</b>：把不易观察的微小振动，转化为容易观察的物体运动（转换法）。',
      analysis:'判分：举出具体实例 + 说明据此判断物体在振动；核心方法=转换法（把微小振动转化为容易观察的运动）。' }] },

  { id:'c2s1q2', section:'第1节 声音的产生与传播', no:'练习与应用 第2题', points:10,
    stem:'花样游泳融合了游泳、舞蹈和音乐，有"水上芭蕾"之称。请你以花样游泳为例说明：水是可以传播声音的介质。',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：花样游泳运动员大部分时间头部没入水中，仍能听到水池扬声器放出的音乐，并随音乐的节奏完成动作。音乐声是经过<b>水</b>传到运动员耳中的——说明水（液体）能够传播声音，是可以传声的介质。',
      analysis:'判分：指出音乐经水传入水下运动员耳中 → 水（液体）能够传声、是传声介质。' }] },

  { id:'c2s1q3', section:'第1节 声音的产生与传播', no:'练习与应用 第3题', points:10,
    stem:'阅读课本中关于声速的"小资料"，你能从中获得关于声速的哪些信息？',
    note:'本题为开放归纳题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 声速的大小跟<b>介质的种类</b>有关：不同介质中声速一般不同；<br>② 一般情况下 <b>固体 &gt; 液体 &gt; 气体</b>（如铁棒 5 200 &gt; 水 1 500 &gt; 空气 340 m/s）；<br>③ 声速还跟<b>温度</b>有关：空气 0 ℃ 331、15 ℃ 340、25 ℃ 346 m/s，温度越高声速越大；<br>④ 15 ℃ 时空气中的声速是 <b>340 m/s</b>。',
      analysis:'判分：答出关于声速的正确信息即可（介质种类有关 / 固液气大小关系 / 温度影响 / 15 ℃ 空气中 340 m/s）。' }] },

  { id:'c2s1q4', section:'第1节 声音的产生与传播', no:'练习与应用 第4题', points:10,
    stem:'将耳朵贴在长铁管的一端，让别人敲一下铁管的另一端，你认为会听到几次敲打的声音？请说出其中的道理。',
    note:'单选即时判分；「说出道理」部分对照判分后解析自查。',
    parts:[
      { kind:'choice', q:'会听到几次敲打的声音？',
        opts:['1 次','2 次','3 次'], answer:1,
        analysis:'正确答案：<b>2 次</b>。敲击声沿两条路径传来：一条经<b>铁管</b>（固体，5 200 m/s），一条经<b>空气</b>（340 m/s）。声音在铁中传播比在空气中<b>快得多</b>，铁管足够长时，两次声音到达耳朵的间隔大于 0.1 s，人耳就能分辨出先后<b>两次</b>敲打声：先听到沿铁管传来的，后听到沿空气传来的。' }
    ] },

  { id:'c2s1q5', section:'第1节 声音的产生与传播', no:'练习与应用 第5题', points:10,
    stem:'在室内讲话比旷野里响亮，这是为什么？',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：室内空间小，讲话声遇到墙壁、天花板等障碍物被<b>反射</b>回来，反射声与原声到达人耳的时间差<b>小于 0.1 s</b>，人耳分辨不出回声，反射声与原声<b>混在一起</b>使原声加强，所以听起来更响亮。旷野里声音向四周扩散出去，几乎<b>没有障碍物反射</b>回来，所以不如室内响亮。',
      analysis:'判分：指出反射声（回声）与原声到达人耳时间差小于 0.1 s、混在一起使原声加强。' }] },

  { id:'c2s1q6', section:'第1节 声音的产生与传播', no:'练习与应用 第6题', points:10,
    stem:'向前传播的声音遇到障碍物能反射回来。一个同学向着远处的山崖大喊一声，约1.5 s后听到回声，那么该同学距山崖大约多少米？',
    note:'提示：查表 2.1-1，15 ℃ 空气中声速 340 m/s（本套书题目解答所需的数据，如能在"小资料"中查询，题目中就不再给出）。填空即时判分，「255」「约255」等写法均认可。',
    parts:[
      { kind:'blank', blanks:[
        { label:'该同学距山崖大约', answer:['255','255m','255 m','255米','约255','约255m','约255米','约255 m'], unit:'m' }],
        analysis:'声音从同学传到山崖再<b>反射回来</b>，1.5 s 内声音走过的总路程是同学到山崖距离的 <b>2 倍</b>。v=340 m/s（15 ℃ 空气，查表 2.1-1），t=1.5 s，s=v·t÷2=340 m/s×1.5 s÷2=<b>约 255 m</b>。' }
    ] },

  // —— 第2节 声音的特性（练习与应用 第1~5 题，5 题；源：c2_s2/quiz.html） ——
  { id:'c2s2q1', section:'第2节 声音的特性', no:'练习与应用 第1题', points:12,
    stem:'某种昆虫靠翅的振动发声。如果这种昆虫的翅在 2 s 内振动了 700 次，频率是多少？人耳能不能听到？',
    note:'①填空 + ②单选，均即时判分（每空6分）。',
    parts:[
      { kind:'blank', q:'① 频率是多少？', blanks:[
        { label:'频率', answer:['350','350Hz','350hz','350 Hz','350赫兹','350赫'], unit:'Hz' }],
        analysis:'频率 = 振动次数 ÷ 时间 = 700 次 ÷ 2 s = <b>350 Hz</b>。' },
      { kind:'choice', q:'② 人耳能不能听到？',
        opts:['能','不能'], answer:0,
        analysis:'多数人耳能听到的频率范围是 <b>20~20 000 Hz</b>，350 Hz 在这个范围内，所以<b>能听到</b>。' }
    ] },

  { id:'c2s2q2', section:'第2节 声音的特性', no:'练习与应用 第2题', points:12,
    stem:'生活中经常用“高”“低”来形容声音，如“女高音”“男低音”“引吭高歌”“低声细语”。这 4 个词语中的“高”“低”描述的各是声音的哪些特性？请逐一点选。',
    note:'四个词语逐一单选即时判分（每题3分）。',
    parts:[
      { kind:'choice', q:'① “女高音”',
        opts:['音调','响度'], answer:0,
        analysis:'<b>女高音</b>、<b>男低音</b>描述的是<b>音调</b>（声音的高低）。' },
      { kind:'choice', q:'② “男低音”',
        opts:['音调','响度'], answer:0,
        analysis:'<b>女高音</b>、<b>男低音</b>描述的是<b>音调</b>（声音的高低）。' },
      { kind:'choice', q:'③ “引吭高歌”',
        opts:['音调','响度'], answer:1,
        analysis:'<b>引吭高歌</b>、<b>低声细语</b>描述的是<b>响度</b>（声音的大小/强弱）。' },
      { kind:'choice', q:'④ “低声细语”',
        opts:['音调','响度'], answer:1,
        analysis:'<b>引吭高歌</b>、<b>低声细语</b>描述的是<b>响度</b>（声音的大小/强弱）。' }
    ] },

  { id:'c2s2q3', section:'第2节 声音的特性', no:'练习与应用 第3题', points:10,
    stem:'曲笛是一种竹笛，它的音域和二胡接近。当曲笛和二胡演奏同一个音高时，我们可以根据声音的哪个特性来区分这两种乐器？它们发出的波形有什么相同和不同之处？',
    note:'单选即时判分；「波形相同与不同之处」对照判分后解析自查。',
    parts:[
      { kind:'choice', q:'根据声音的哪个特性来区分这两种乐器？',
        opts:['音调','响度','音色'], answer:2,
        analysis:'应选<b>音色</b>：曲笛和二胡的制作材料、结构不同，所以发出声音的音色不同。波形上的相同点：<b>疏密程度相同</b>，说明频率相同、音调相同；不同点：<b>波的形状不同</b>，说明音色不同。' }
    ] },

  { id:'c2s2q4', section:'第2节 声音的特性', no:'练习与应用 第4题', points:10,
    stem:'观察二胡（或吉他）。它是由什么振动发出声音的？又是怎样改变音调和响度的？',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例：二胡）：<br>· 发声体：<b>琴弦的振动</b>发出声音，并通过共鸣筒放大；<br>· 改变音调：改变弦的<b>长度</b>（按不同把位）和<b>松紧</b>——弦越短、越紧，振动越快，音调越高；反之音调越低；<br>· 改变响度：改变<b>拉弓力度</b>——力度越大，弦的振幅越大，响度越大；反之响度越小。<br>也可以用吉他回答：琴弦振动发声；按品格改变弦长来改变音调；拨弦力度改变响度。',
      analysis:'判分：指出发声体=琴弦振动；分别说明改变音调（弦长/松紧→频率）与改变响度（力度→振幅）的方法。' }] },

  { id:'c2s2q5', section:'第2节 声音的特性', no:'练习与应用 第5题', points:10,
    stem:'在班里举行的小型音乐会上，用自己制作的乐器进行演奏，看看谁的乐器有新意，谁演奏得好。写出你的制作过程。看看以下制作方案能否给你启发。',
    note:'本题为开放实践题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（两个制作方案）：<br><b>方案一：水瓶琴</b>——准备 8 个相同的玻璃瓶，向瓶中灌入<b>不同高度</b>的水，仔细调节水的高度使音阶准确，用筷子或敲击棒轻轻敲击瓶口边缘，就能发出“1，2，3，4，5，6，7，i”的声音。敲击时主要是瓶子和水一起振动：水越多，整体振动越慢，音调越低；水越少，振动越快，音调越高——<b>装水最多的瓶子音最低（do）</b>，装水最少的音最高（i）。<br><b>方案二：活塞哨子</b>——在筷子上捆一些棉花或碎布做一个“活塞”，用水蘸湿后从下面插入两端开口的塑料管或竹管中，用嘴吹管的上端发出哨音；上下推拉活塞，改变管中空气柱的长度，音调就会改变。声音由管内<b>空气柱振动</b>产生：空气柱越长，振动越慢，音调越低；越短则音调越高。',
      analysis:'判分：写出完整制作过程 + 说清发声的振动源与改变音调的原理（水瓶琴=瓶和水振动、水多音低；哨子=空气柱振动、柱长音低）。' }] },

  // —— 第3节 声的利用（练习与应用 第1~5 题，5 题；源：c2_s3/quiz.html） ——
  { id:'c2s3q1', section:'第3节 声的利用', no:'练习与应用 第1题', points:10,
    stem:'用超声测位仪向海底垂直发射声波，经过4 s后收到回波。若海水中声音的平均传播速度为1 500 m/s，则此处海水约有多深？',
    parts:[
      { kind:'blank', blanks:[
        { label:'海水深度约', answer:['3000','3000m','3000 m','3 000','3000米','约3000','约3000m','约3000米'], unit:'m' }],
        analysis:'4 s 是声波<b>往返</b>（海面→海底→海面）的总时间，计算深度只用单程时间：s=v·t/2=1 500 m/s×4 s÷2=<b>3 000 m</b>。⚠️ 关键：回声测距必须把往返时间<b>除以 2</b>，否则会错算成 6 000 m。' }
    ] },

  { id:'c2s3q2', section:'第3节 声的利用', no:'练习与应用 第2题', points:12,
    stem:'请你分析下列事例是利用声传递能量，还是利用声传递信息。',
    note:'四个事例逐一单选即时判分（每题3分）。',
    parts:[
      { kind:'choice', q:'① 用超声波给金属工件探伤。',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'探伤是靠声音获得"消息"，属于<b>声传递信息</b>。' },
      { kind:'choice', q:'② 医生通过听诊器给病人诊病。',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'听诊器诊病是靠声音获得"消息"，属于<b>声传递信息</b>。' },
      { kind:'choice', q:'③ 通过声学仪器接收到的次声波等信息判断地震的方位和强度。',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'判断地震的方位和强度是靠声音获得"消息"，属于<b>声传递信息</b>。' },
      { kind:'choice', q:'④ 利用超声波排除人体内的结石。',
        opts:['传递信息','传递能量'], answer:1,
        analysis:'超声波排除结石：声波把结石震碎、对结石做功，属于<b>声传递能量</b>。' }
    ] },

  { id:'c2s3q3', section:'第3节 声的利用', no:'练习与应用 第3题', points:10,
    stem:'除了课本中的事例，请你根据对周围生活的观察，再举一个利用声音的例子，并说明这个例子中应用了声音的什么性质。',
    note:'本题为开放举例题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例，答案不唯一）：<br>· 听到雷声知道要下雨了 → 利用<b>声传递信息</b>；<br>· 超声波加湿器、超声波清洗眼镜 → 利用<b>声传递能量</b>。<br>✍️ 自查：你的回答要有两个要素——①一个生活中利用声音的具体例子；②说明它是<b>传递信息</b>还是<b>传递能量</b>。',
      analysis:'判分：例子具体 + 正确说明是传递信息还是传递能量（两要素齐全）。' }] },

  { id:'c2s3q4', section:'第3节 声的利用', no:'练习与应用 第4题', points:10,
    stem:'声音在传播过程中遇到障碍物会发生反射。我国古代建筑师利用这一特点建造了许多神奇的建筑。例如北京天坛的回音壁、重庆潼南大佛寺的石琴、山西永济普救寺的莺莺塔（图2.3-11）等。请你查阅资料，向同学们介绍并展示我国古代建筑应用声学知识的实例。',
    note:'本题为开放查阅资料题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（供参考）：<br>· <b>回音壁</b>：墙面光滑、呈圆形，声音贴着墙面不断反射，能传到很远的地方，两人隔墙贴壁说话也能听清；<br>· <b>三音石</b>：从皇穹宇到回音壁大门的石路，站在不同位置的石块上拍手，能分别听到一次、两次、三次回声；<br>· <b>圜丘天心石</b>：站在天心石上发声，回声约 0.07 s 返回台面中心，与原声混在一起，听起来格外洪亮。<br>🔍 建议动手查一查：重庆潼南大佛寺的石琴、山西永济普救寺的莺莺塔，整理后讲给同学听。',
      analysis:'判分：介绍至少一个我国古代建筑实例 + 说明其中应用的声学道理（声音的反射）。' }] },

  { id:'c2s3q5', section:'第3节 声的利用', no:'练习与应用 第5题', points:10,
    stem:'我国有些地方修筑了“音乐公路”。当汽车以一定速度匀速行驶时，就会奏出一段悦耳的乐曲。音乐公路的路面上分布着许多横向凹槽，如图2.3-12所示。汽车每经过一个凹槽，就会上下振动一次。路面上凹槽的分布比较密，汽车行进时振动很快，于是就发出了声音。凹槽的疏密可以根据乐曲的音调高低来设计，假设某音乐公路规定的行驶速度是54 km/h，设定乐曲为《歌唱祖国》，第一个音符“sol”的频率为392 Hz，汽车发出这个音时，所对应的相邻凹槽之间的距离是多少？',
    note:'填空即时判分：以米或厘米作答均认可（约 0.036~0.040 m 或 3.6~4.0 cm 区间内的写法，如「0.038」「约0.038 m」「3.8」「约3.8 cm」）。',
    parts:[
      { kind:'blank', blanks:[
        { label:'相邻凹槽之间的距离', answer:['0.038','0.038m','0.038 m','约0.038','约0.038m','约0.038 m','0.036','0.037','0.039','0.04','0.04m','0.036m','0.037m','0.039m','0.04 m','3.8','3.8cm','3.8 cm','约3.8','约3.8cm','约3.8 cm','3.6cm','3.7cm','3.9cm','4cm','3.6','3.7','3.9','4'], unit:'' }],
        analysis:'<b>发声原理</b>：汽车每经过一个凹槽就上下振动一次，连续经过凹槽形成周期性振动而发声（汽车成了"振动源"）。<b>频率与间距的关系</b>：振动频率=车速÷相邻凹槽间距，即 f=v/λ——间距越小（凹槽越密），频率越高，音调越高。<b>本题计算</b>：v=54 km/h=54÷3.6 m/s=<b>15 m/s</b>；λ=v/f=15/392 m≈0.038 m≈<b>3.8 cm</b>。<b>本质</b>：音乐公路把"乐曲的音符序列"编码成"凹槽间距序列"，匀速行驶的汽车就是读取这段"编码"的<b>播放器</b>。' }
    ] },

  // —— 第4节 噪声的危害和控制（练习与应用 第1~5 题，5 题；源：c2_s4/quiz.html） ——
  { id:'c2s4q1', section:'第4节 噪声的危害和控制', no:'练习与应用 第1题', points:10,
    stem:'调查校园里或者你家周围有什么样的噪声。应该采取什么样的控制措施？与班里的同学交流，看看谁的调查更详细，采取的措施更好。',
    note:'本题为开放调查题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例，答案不唯一）：<br>· <b>校园操场</b>：课间喧哗、体育器材碰撞声 → 属于<b>防止噪声进入耳朵</b>：必要时戴耳塞，或规定活动区域远离教学楼；<br>· <b>校门口道路</b>：汽车鸣笛声 → 属于<b>阻断噪声传播</b>：设置禁鸣标志、在校门口路段植树或安装隔音屏障；<br>· <b>家中厨房</b>：抽油烟机、破壁机运转声 → 属于<b>防止噪声产生</b>：选购低噪声电器，使用时关厨房门以阻断传播。<br>✍️ 自查：你的回答要有两个要素——①列出<b>具体的噪声源</b>；②针对每个噪声源给出<b>控制噪声的有效措施</b>（从"防止噪声产生 / 阻断噪声传播 / 防止噪声进入耳朵"三途径中说明）。',
      analysis:'判分：噪声源具体 + 措施有效且对应"防止产生/阻断传播/防止入耳"三途径。' }] },

  { id:'c2s4q2', section:'第4节 噪声的危害和控制', no:'练习与应用 第2题', points:10,
    stem:'在安静的环境里，测量你的脉搏在1 min内跳动的次数。在声音过大的环境里，你的脉搏有变化吗？测量一下。',
    note:'本题为开放实践测量题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例结论，个体差异大，以自己实测为准）：<br>· 在噪声过大的环境中，人的脉搏通常会<b>略微加快</b>；<br>· 这说明噪声不仅影响听觉，还会对<b>人体的生理状态</b>产生影响。<br>✍️ 自查：你的回答要有两个要素——①分别记录在<b>安静环境</b>和<b>声音过大环境</b>中 1 min 的脉搏次数；②指出噪声对脉搏可能产生的影响及含义。',
      analysis:'判分：两种环境实测记录齐全 + 指出噪声会使脉搏加快、影响生理状态。' }] },

  { id:'c2s4q3', section:'第4节 噪声的危害和控制', no:'练习与应用 第3题', points:12,
    stem:'为了使教室内免受环境噪声干扰，采取下面的哪些方法是有效、合理的？如果你认为无效或不合理，请简单说明理由。（1）老师讲话声音大一些。（2）每位学生都戴一个防噪声耳罩。（3）在教室周围植树。（4）教室内安装噪声监测装置。',
    note:'四个方法逐一单选即时判分（每题3分）；「说明理由」部分对照判分后解析自查。',
    parts:[
      { kind:'choice', q:'① 老师讲话声音大一些。',
        opts:['有效合理','无效或不合理'], answer:1,
        analysis:'无效且不合理：老师讲课声音大，虽然学生听得清些，但教室内的总噪声反而增大，本质上是通过提高声源响度来对抗环境噪声，对保护教室安静没有帮助。' },
      { kind:'choice', q:'② 每位学生都戴一个防噪声耳罩。',
        opts:['有效合理','无效或不合理'], answer:1,
        analysis:'能隔声但不合理：耳罩可以<b>防止噪声进入耳朵</b>，但同时会把老师的讲课声音也挡住，影响听课，因此不是合理方案。' },
      { kind:'choice', q:'③ 在教室周围植树。',
        opts:['有效合理','无效或不合理'], answer:0,
        analysis:'有效且合理：树木可以吸收、反射部分声波，<b>阻断噪声传播</b>，从而减少外界噪声进入教室。' },
      { kind:'choice', q:'④ 教室内安装噪声监测装置。',
        opts:['有效合理','无效或不合理'], answer:1,
        analysis:'无效：噪声监测装置只能测量噪声大小，<b>不能减弱噪声</b>，因此不能使教室免受环境噪声干扰。' }
    ] },

  { id:'c2s4q4', section:'第4节 噪声的危害和控制', no:'练习与应用 第4题', points:10,
    stem:'噪声严重影响人们的生活。请你说说你的感受并找到这些噪声的来源。',
    note:'本题为开放感受题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（示例，答案不唯一）：<br>· <b>感受</b>：噪声让人烦躁、注意力难集中，长时间暴露会影响听力和睡眠；<br>· <b>来源</b>：交通噪声（汽车、地铁）、建筑施工噪声、家用电器噪声、校园/社区人群喧哗等。<br>✍️ 自查：你的回答要有两个要素——①描述噪声给你带来的<b>真实感受</b>；②指出具体噪声的<b>来源</b>。',
      analysis:'判分：真实感受 + 具体噪声来源两要素齐全。' }] },

  { id:'c2s4q5', section:'第4节 噪声的危害和控制', no:'练习与应用 第5题', points:10,
    stem:'住宅区的高架桥两侧常安装隔音板（图2.4-4），请你从减少噪声危害的角度谈谈这样做有什么道理。',
    note:'本题为开放简答题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>· 高架桥上车辆行驶产生噪声，噪声向两侧传播；<br>· 隔音板设置在噪声传播路径上，可以<b>阻挡、反射和吸收部分声波</b>，使传入住宅区的噪声减弱；<br>· 从控制噪声的途径看，这属于在<b>传播过程中阻断噪声传播</b>。<br>✍️ 自查：你的回答要有两个要素——①说明隔音板是通过<b>阻断噪声传播</b>来减弱噪声；②指出最终效果是<b>减弱传入住宅区的噪声</b>。',
      analysis:'判分：指出隔音板在传播过程中阻断（阻挡/反射/吸收）噪声 + 效果是减弱传入住宅区的噪声。' }] },

  // —— 第5节 跨学科实践：制作隔音房间模型（知识梳理 1~8 题，8 题；源：c2_s5/quiz.html） ——
  { id:'c2s5q1', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第1题', points:10,
    stem:'声音是由物体的____产生的；声音的传播需要____，真空不能传声。',
    note:'两空一并提交即时判分（每空5分，全对得分）。',
    parts:[
      { kind:'blank', blanks:[
        { label:'声音是由物体的（　）产生的', answer:['振动'], unit:'' },
        { label:'声音的传播需要', answer:['介质'], unit:'' }],
        analysis:'声音是由物体的<b>振动</b>产生的；声音的传播需要<b>介质</b>，真空不能传声。' }
    ] },

  { id:'c2s5q2', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第2题', points:12,
    stem:'判断下列说法是否正确。',
    note:'两个说法逐一单选即时判分（每题6分）。',
    parts:[
      { kind:'choice', q:'① 声速跟介质的种类和温度有关。',
        opts:['正确','错误'], answer:0,
        analysis:'<b>正确</b>：声速跟介质的种类和温度有关（知识梳理原文）。' },
      { kind:'choice', q:'② 声音在传播过程中遇到障碍物会被吸收，不会发生反射。',
        opts:['正确','错误'], answer:1,
        analysis:'<b>错误</b>：声音在传播过程中遇到障碍物会<b>发生反射</b>。该说法把"会反射"说成"不会反射"，所以错误。' }
    ] },

  { id:'c2s5q3', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第3题', points:12,
    stem:'将下列描述与声音的特性配对。',
    note:'三条描述逐一单选即时判分（每题4分）。',
    parts:[
      { kind:'choice', q:'① 声音的高低，由发声体振动的频率决定。',
        opts:['音调','响度','音色'], answer:0,
        analysis:'<b>音调</b>：声音的高低，由发声体振动的频率决定。' },
      { kind:'choice', q:'② 声音的强弱，与发声体振动的幅度以及距发声体的远近有关。',
        opts:['音调','响度','音色'], answer:1,
        analysis:'<b>响度</b>：声音的强弱，与发声体振动的幅度以及距发声体的远近有关。' },
      { kind:'choice', q:'③ 不同发声体发出声音的特有品质，可以用来辨别不同的发声体。',
        opts:['音调','响度','音色'], answer:2,
        analysis:'<b>音色</b>：不同发声体发出声音的特有品质，可以用来辨别不同的发声体。' }
    ] },

  { id:'c2s5q4', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第4题', points:10,
    stem:'“声音的强弱，与发声体振动的幅度以及距发声体的远近有关。”这句话描述的是声音的哪个特性？',
    parts:[
      { kind:'choice', opts:['音调','响度','音色'], answer:1,
        analysis:'描述的是<b>响度</b>：声音的强弱，与发声体振动的幅度以及距发声体的远近有关（知识梳理原文）。' }
    ] },

  { id:'c2s5q5', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第5题', points:10,
    stem:'下列应用实例中，哪些是利用声传递信息，哪些是利用声传递能量？',
    note:'五个实例逐一单选即时判分（每题2分）。',
    parts:[
      { kind:'choice', q:'① 回声定位',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'声可以传递信息：如<b>回声定位</b>、B超、超声检测等。' },
      { kind:'choice', q:'② B超',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'声可以传递信息：如回声定位、<b>B超</b>、超声检测等。' },
      { kind:'choice', q:'③ 超声检测',
        opts:['传递信息','传递能量'], answer:0,
        analysis:'声可以传递信息：如回声定位、B超、<b>超声检测</b>等。' },
      { kind:'choice', q:'④ 超声波清洗',
        opts:['传递信息','传递能量'], answer:1,
        analysis:'声可以传递能量：如<b>超声波清洗</b>、超声波碎石等。' },
      { kind:'choice', q:'⑤ 超声波碎石',
        opts:['传递信息','传递能量'], answer:1,
        analysis:'声可以传递能量：如超声波清洗、<b>超声波碎石</b>等。' }
    ] },

  { id:'c2s5q6', section:'第5节 跨学科实践：制作隔音房间模型', no:'知识梳理 第6题', points:12,
    stem:'控制噪声可以从以下哪些方面着手？（多选）A. 防止噪声产生　B. 阻断噪声传播　C. 防止噪声进入耳朵　D. 提高声音频率',
    note:'原题为多选；本页对四个选项逐一作「属于/不属于」单选判定（每题3分），判分等价。',
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
    stem:'结合本节制作隔音房间模型的项目经验，模型内壁贴上海绵属于控制噪声的哪个途径？',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：海绵安装在模型内壁，用来吸收和削弱传播中的声音，属于<b>阻断噪声传播</b>。<br>✍️ 自查：你的回答要点——① 指出这是"阻断噪声传播"；② 结合"材料放在房间内部/内壁"说明它作用于声音的传播过程。',
      analysis:'判分：结论=阻断噪声传播（吸声材料作用于声音传播过程）。' }] },

  { id:'c2s5q8', section:'第5节 跨学科实践：制作隔音房间模型', no:'综合 第8题', points:10,
    stem:'生活中，如果我们在家练习钢琴，怎样尽量减小对邻居的干扰？请从声源处、传播过程中和接收处三个角度各说一条措施。',
    note:'本题为开放综合题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（答案不唯一，言之有理即可）：<br>· <b>声源处减弱</b>：调低钢琴音量，或在钢琴下垫减振垫，减少振动向外传递；<br>· <b>传播过程中阻断</b>：关闭门窗，在墙面、门窗缝隙加装隔音/吸音材料，阻断噪声传播；<br>· <b>接收处防护</b>：邻居在需要时佩戴耳塞、关闭自己门窗，防止噪声进入耳朵。<br>✍️ 自查：你的回答要同时覆盖"防止噪声产生 / 阻断噪声传播 / 防止噪声进入耳朵"三个方面，且结合练琴场景具体说明。',
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

/* c2 题库 · P2 原创生产 · 2026-10-24 */
const QBANK_C2_ORIG = [
  { id:'c2s1b001', ch:2, sec:1,
    kp:['sound-produce'], type:'choice', diff:1, freq:4, points:3,
    stem:'端午节龙舟赛上，鼓手在船头用力擂响大鼓，鼓点指挥着桨手们整齐划桨。岸上观众听到的鼓声，是由下列哪个物体振动产生的？',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'鼓声是由哪个物体振动产生的？',
        opts:['鼓槌','鼓面','鼓身内的空气','河面的水'], answer:1,
        analysis:'擂鼓时鼓槌敲击鼓面，<b>鼓面</b>振动发声；鼓槌只是敲击工具，鼓身内的空气随鼓面振动被带动传播声音，但声源是鼓面。<b>答案</b>：鼓面。' }
    ],
    answer:null, analysis:null, src:'original', scene:'龙舟赛擂鼓' },

  { id:'c2s1b002', ch:2, sec:1,
    kp:['sound-transmit'], type:'blank', diff:1, freq:4, points:4,
    stem:'航天员出舱执行任务时，两人即使面对面，也不能直接靠喊话交流，而必须借助无线电通话。这是因为舱外空间几乎是____，声音在其中无法传播；这也说明声音的传播需要依靠____。',
    note:null, fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'舱外空间几乎是', answer:['真空'], unit:'' },
        { label:'声音的传播需要依靠', answer:['介质','媒介物质'], unit:'' }],
        analysis:'舱外是接近<b>真空</b>的环境，没有传声的物质；声音的传播必须依靠<b>介质</b>（固体、液体、气体），真空不能传声，所以航天员要靠无线电（电磁波）交流。' }
    ],
    answer:null, analysis:null, src:'original', scene:'航天员出舱通话' },

  { id:'c2s1b003', ch:2, sec:1,
    kp:['sound-produce'], type:'blank', diff:1, freq:4, points:2,
    stem:'新年撞钟时，撞木撞向大钟后已经弹开，钟声却还持续一段时间，这就是常说的“余音”。余音未止，说明大钟仍在____；当它停下来时，大钟的____也随之停止。',
    note:null, fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'余音未止说明大钟仍在', answer:['振动'], unit:'' },
        { label:'它停下来时大钟的什么也随之停止', answer:['发声','发出声音'], unit:'' }],
        analysis:'撞木弹开后大钟仍在<b>振动</b>，所以有余音；振动停止，<b>发声</b>也停止——声音是由物体的振动产生的。' }
    ],
    answer:null, analysis:null, src:'original', scene:'古寺撞钟余音' },

  { id:'c2s1b004', ch:2, sec:1,
    kp:['sound-transmit'], type:'experiment', diff:2, freq:4, points:6,
    stem:'科学社团用电铃、带密封盖的玻璃罩、抽气机和铁架台做实验：把正在发声的电铃悬在玻璃罩内，导线穿过罩底密封接到罩外电源。<br>① 开动抽气机逐渐抽出罩内空气，听到的铃声会越来越____；<br>② 打开阀门让空气重新进入罩内，铃声又会越来越____；<br>③ 由①②的现象再进一步推理：若罩内空气能被完全抽尽，将听不到铃声。由此可以得出什么结论？',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'①② 两处现象分别填什么？', blanks:[
        { label:'① 抽气时铃声越来越', answer:['小','弱','变小','变弱','越来越小','越来越弱','轻'], unit:'' },
        { label:'② 进气时铃声越来越', answer:['大','响','变大','变响','越来越大','越来越响','强'], unit:'' }],
        analysis:'罩内空气越抽越稀薄，传声的介质越来越少，铃声越来越<b>小</b>；空气重新进入后介质变多，铃声又越来越<b>大</b>。' },
      { kind:'choice', q:'③ 由现象进一步推理，可以得出的结论是？',
        opts:['声音的传播需要介质，真空不能传声','抽气后电铃停止了振动','声音在玻璃中传播得更快','铃声的音调变低了'], answer:0,
        analysis:'空气越少铃声越小，在此趋势上<b>推理</b>：完全没有空气（真空）时将完全听不到铃声——说明<b>声音的传播需要介质，真空不能传声</b>。实验中“完全抽尽空气”无法真正做到，结论是在实验基础上推理得出的，这是科学推理法。<b>答案</b>：声音的传播需要介质，真空不能传声。' }
    ],
    answer:null, analysis:null, src:'original', scene:'科学社团真空罩电铃实验' },

  { id:'c2s1b005', ch:2, sec:1,
    kp:['speed-sound'], type:'calc', diff:1, freq:3, points:6,
    stem:'夏天的雷雨夜，小航在阳台上看到一次闪电后，经过 3 s 才听到雷声。已知空气中声速取 340 m/s，光的传播时间可以忽略不计。这次打雷处距小航大约多少米？',
    note:null, fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'打雷处距小航约', answer:['1020','1020m','1020 m','1020米','约1020','约1020m','约1020 m','约1020米'], unit:'m' }],
        analysis:'光速远大于声速，看到闪电的时刻可认为就是打雷发生的时刻，3 s 是雷声传播的时间。s=v·t=340 m/s×3 s=<b>1020 m</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'雷雨夜估测闪电距离' },

  { id:'c2s1b006', ch:2, sec:1,
    kp:['echo-calc'], type:'calc', diff:1, freq:4, points:6,
    stem:'一座空旷的大仓库里，工人站在靠近后墙处拍了一下手，0.4 s 后听到从前墙反射回来的回声。已知空气中声速取 340 m/s，这座仓库前后方向的长度大约是多少米？',
    note:null, fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'仓库长度约', answer:['68','68m','68 m','68米','约68','约68m','约68 m','约68米'], unit:'m' }],
        analysis:'0.4 s 是声音<b>往返</b>（后墙→前墙→后墙）的总时间，仓库长度只对应单程。s=v·t÷2=340 m/s×0.4 s÷2=<b>68 m</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'仓库拍手回声测长' },

  { id:'c2s2b007', ch:2, sec:2,
    kp:['pitch-loud-timbre'], type:'choice', diff:1, freq:5, points:3,
    stem:'某智能门锁支持“声纹开锁”：只有登记过的主人对它说出开锁口令，门锁才会识别打开；别人即使模仿主人的腔调说出同样的口令，门锁也不开。声纹识别主要是根据声音的哪个特性来区分不同人的？',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'声纹识别主要依据哪个特性？',
        opts:['音调','响度','音色','声速'], answer:2,
        analysis:'不同人的声带结构不同，发出声音的<b>音色</b>各具特色。模仿者可以说得音调、响度相近，但音色难以完全一致，门锁靠音色辨别“是不是本人”。<b>答案</b>：音色。' }
    ],
    answer:null, analysis:null, src:'original', scene:'声纹门锁识别' },

  { id:'c2s2b008', ch:2, sec:2,
    kp:['pitch-loud-timbre'], type:'choice', diff:1, freq:5, points:3,
    stem:'爷爷年纪大了听力下降，家人给他配了助听器。戴上助听器后，家人的说话声变得“洪亮”了，爷爷听得清清楚楚。助听器主要改变了声音的哪个特性？',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'助听器主要改变了哪个特性？',
        opts:['音调','响度','音色','频率'], answer:1,
        analysis:'“洪亮”指声音的大小强弱，即<b>响度</b>。助听器把声音的幅度放大，使传入耳中的声响度增大；说话人的音调、音色并没有改变。<b>答案</b>：响度。' }
    ],
    answer:null, analysis:null, src:'original', scene:'爷爷的助听器' },

  { id:'c2s2b009', ch:2, sec:2,
    kp:['pitch-loud-timbre'], type:'choice', diff:2, freq:5, points:3,
    stem:'录音棚的电脑屏幕上显示出话筒先后录到的三段声音的波形图（横轴为时间，每格时间间隔相同，纵轴表示振动幅度）。关于这三段声音，下列判断正确的是？',
    note:null, fig:'waveCompare',
    parts:[
      { kind:'choice', q:'关于甲、乙、丙三段声音，正确的判断是？',
        opts:['甲和乙的音调相同，响度不同','甲和丙的音调相同，响度不同','乙和丙的音调和响度都相同','甲和乙的音调不同，音色相同'], answer:0,
        analysis:'波形疏密反映频率（音调），波的高低反映振幅（响度）。甲、乙每格内波的个数相同——频率相同、<b>音调相同</b>；乙的波更高——振幅更大、<b>响度更大</b>。丙每格内波的个数是甲的两倍——音调比甲高。<b>答案</b>：甲和乙的音调相同，响度不同。' }
    ],
    answer:null, analysis:null, src:'original', scene:'录音棚波形对比' },

  { id:'c2s2b010', ch:2, sec:2,
    kp:['pitch-loud-timbre'], type:'experiment', diff:3, freq:5, points:8,
    stem:'生日会上，小玥把 4 个相同的玻璃杯一字排开，杯里装入多少不同的水，做成一套“杯子乐器”。<br>（1）她用勺子逐一轻敲杯壁，此时声音主要是由____振动产生的；装水越多的杯子，发出声音的音调越____。<br>（2）她改用嘴贴着杯口向杯内水平吹气发声，此时声音主要是由杯内____振动产生的；装水越多的杯子，发出声音的音调越____。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'（1）轻敲杯壁发声', blanks:[
        { label:'声音主要由什么振动产生', answer:['杯子和水','杯子与水','杯壁和水','杯壁与水','杯子和杯中的水','杯壁及水'], unit:'' },
        { label:'装水越多的杯子音调越', answer:['低','越低'], unit:'' }],
        analysis:'轻敲时发声体是<b>杯子和水</b>整体：装水越多，整体越不容易振动，振动越慢（频率越低），音调越<b>低</b>。' },
      { kind:'blank', q:'（2）向杯口吹气发声', blanks:[
        { label:'声音主要由杯内什么振动产生', answer:['空气柱','空气','杯内空气柱','杯中空气柱'], unit:'' },
        { label:'装水越多的杯子音调越', answer:['高','越高'], unit:'' }],
        analysis:'吹气时发声体是杯内<b>空气柱</b>：装水越多，水面越高，空气柱越短，振动越快（频率越高），音调越<b>高</b>。⚠️ 敲与吹的发声体不同，结论正好相反。' }
    ],
    answer:null, analysis:null, src:'original', scene:'生日会杯子乐器' },

  { id:'c2s2b011', ch:2, sec:2,
    kp:['pitch-loud-timbre'], type:'experiment', diff:2, freq:5, points:6,
    stem:'放学路上，小柯拿一张硬纸片沿一把木梳的齿面轻划：纸片划得快时，听到的声音音调高；划得慢时，音调变低。他和同学又用齿更密和齿更疏的两把木梳做了对比。<br>（1）这个实验说明：声音的音调与发声体振动的____有关；<br>（2）纸片划过时，真正振动发声的是____；<br>（3）用同样的速度划过两把木梳，齿更密的木梳发声的音调更高——这说明齿越密时，其振动情况如何？',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'（1）（2）两空分别填什么？', blanks:[
        { label:'音调与发声体振动的什么有关', answer:['快慢','频率','快慢（频率）','频率（快慢）'], unit:'' },
        { label:'真正振动发声的是什么', answer:['梳齿','梳子的齿','梳齿和纸片'], unit:'' }],
        analysis:'（1）划得快时梳齿振动快、频率高、音调高——音调由振动的<b>快慢（频率）</b>决定；（2）纸片划过时拨动的是<b>梳齿</b>，梳齿振动发声。' },
      { kind:'choice', q:'（3）划动速度相同时，齿越密，梳齿振动？',
        opts:['越快，频率越高','越慢，频率越低','快慢不变，只是响度变大','完全不振动'], answer:0,
        analysis:'划动速度相同时，齿越密，单位时间内纸片拨过的齿数越多，梳齿振动越<b>快</b>（频率越高），音调越高。<b>答案</b>：越快，频率越高。' }
    ],
    answer:null, analysis:null, src:'original', scene:'梳子与硬纸片探究音调' },

  { id:'c2s2b012', ch:2, sec:2,
    kp:['pitch-loud-timbre','ultra-infra'], type:'blank', diff:1, freq:5, points:5,
    stem:'花园里，蝴蝶和蜜蜂都从耳边飞过：蜜蜂飞行时能听到明显的“嗡嗡”声，蝴蝶飞过却几乎没有声音。资料显示：蝴蝶飞行时翅膀每 5 s 振动约 10 次；蜜蜂飞行时翅膀每分钟振动约 26 400 次。<br>（1）蝴蝶翅膀振动的频率约为____Hz；蜜蜂翅膀振动的频率约为____Hz。<br>（2）人能听到蜜蜂的“嗡嗡”声、听不到蝴蝶飞行的声音，主要原因是？',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'（1）两处频率各是多少？', blanks:[
        { label:'蝴蝶翅膀振动频率约', answer:['2','2Hz','2 Hz','2赫兹'], unit:'Hz' },
        { label:'蜜蜂翅膀振动频率约', answer:['440','440Hz','440 Hz','440赫兹'], unit:'Hz' }],
        analysis:'频率=振动次数÷时间。蝴蝶：10 次÷5 s=<b>2 Hz</b>；蜜蜂：26 400 次÷60 s=<b>440 Hz</b>。' },
      { kind:'choice', q:'（2）听得到蜜蜂、听不到蝴蝶的主要原因？',
        opts:['蝴蝶翅膀振动太慢，频率低于 20 Hz，不在人耳听觉范围内','蝴蝶翅膀振动太剧烈，声音响度过大损伤听力','蜜蜂的翅膀振动不产生声音','蝴蝶飞行时翅膀不振动'], answer:0,
        analysis:'人耳能听到的频率范围约为 <b>20~20 000 Hz</b>。蝴蝶翅膀振动频率仅 2 Hz，低于 20 Hz，属于<b>次声</b>范围，人耳听不到；蜜蜂 440 Hz 在听觉范围内，所以能听到。<b>答案</b>：蝴蝶翅膀振动频率低于 20 Hz，不在人耳听觉范围内。' }
    ],
    answer:null, analysis:null, src:'original', scene:'花园里蜜蜂与蝴蝶' },

  { id:'c2s3b013', ch:2, sec:3,
    kp:['ultra-infra'], type:'choice', diff:1, freq:2, points:3,
    stem:'溶洞探险的队员发现，蝙蝠在漆黑的洞穴里飞行自如，从不撞到岩壁。原来蝙蝠飞行时会发出一种特殊的波，靠它遇到岩壁反射回来的信号“看清”前方。关于蝙蝠发出的这种波，下列说法正确的是？',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'关于蝙蝠发出的波，正确的说法是？',
        opts:['是超声波，频率高于 20 000 Hz，人耳听不到','是次声波，频率低于 20 Hz','是普通人耳能听到的声音','它的传播不需要介质'], answer:0,
        analysis:'蝙蝠发出的是<b>超声波</b>：频率高于 20 000 Hz，超出人耳听觉范围，人听不到；蝙蝠靠超声波反射回来的信号判断前方障碍物（回声定位）。声波传播仍然需要介质。<b>答案</b>：是超声波，频率高于 20 000 Hz，人耳听不到。' }
    ],
    answer:null, analysis:null, src:'original', scene:'溶洞探险与蝙蝠' },

  { id:'c2s3b014', ch:2, sec:3,
    kp:['ultra-infra'], type:'blank', diff:1, freq:2, points:2,
    stem:'地震、火山喷发、台风等自然灾害发生前后，常常伴随产生一种人耳听不到的声波。监测站的仪器能提前接收到这种声波，从而对灾害作出预警。这种声波的频率低于____Hz，人们把它叫做____。',
    note:null, fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'频率低于', answer:['20','20Hz','20 Hz'], unit:'Hz' },
        { label:'这种声波叫做', answer:['次声波','次声'], unit:'' }],
        analysis:'频率低于 <b>20 Hz</b> 的声波叫<b>次声波</b>。地震、台风等灾害会产生次声波，且次声波传播距离远、衰减慢，仪器接收后可用于灾害预警。' }
    ],
    answer:null, analysis:null, src:'original', scene:'地震预警监测次声' },

  { id:'c2s3b015', ch:2, sec:3,
    kp:['echo-calc','ultra-infra'], type:'calc', diff:1, freq:4, points:6,
    stem:'检修工人把超声测距仪探头伸到一口枯井的井口，竖直向下发射一束超声波，经过 0.2 s 接收到从井底反射回来的信号。已知井内空气中声速取 340 m/s，这口井的深度大约是多少米？',
    note:'超声测距仪发射的信号人耳听不到。', fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'井深约', answer:['34','34m','34 m','34米','约34','约34m','约34 m','约34米'], unit:'m' }],
        analysis:'0.2 s 是超声波<b>往返</b>（井口→井底→井口）的总时间。s=v·t÷2=340 m/s×0.2 s÷2=<b>34 m</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'枯井井深超声检测' },

  { id:'c2s3b016', ch:2, sec:3,
    kp:['echo-calc'], type:'calc', diff:3, freq:4, points:8,
    stem:'自驾游车队在山路上行驶，一辆汽车以 15 m/s 的速度匀速驶向前方一处陡峭的岩壁。司机按了一次喇叭，经过 2 s 听到了从岩壁反射回来的回声。已知空气中声速取 340 m/s。<br>（1）这 2 s 内，声音传播的路程是多少米？<br>（2）这 2 s 内，汽车前进的距离是多少米？<br>（3）司机按喇叭时，汽车距岩壁多少米？',
    note:null, fig:'carCliffEcho',
    parts:[
      { kind:'blank', blanks:[
        { label:'（1）声音传播的路程', answer:['680','680m','680 m','680米'], unit:'m' },
        { label:'（2）汽车前进的距离', answer:['30','30m','30 m','30米'], unit:'m' },
        { label:'（3）按喇叭时汽车距岩壁', answer:['355','355m','355 m','355米'], unit:'m' }],
        analysis:'（1）s声=v声·t=340 m/s×2 s=<b>680 m</b>；（2）s车=v车·t=15 m/s×2 s=<b>30 m</b>；（3）设按喇叭时车距岩壁 s：声音去程走 s，反射回来时汽车已前进 30 m，回程走 s−30。s声=s+(s−30)=2s−30，得 s=(s声+s车)÷2=(680+30)÷2=<b>355 m</b>。' }
    ],
    answer:null, analysis:null, src:'original', scene:'山路行车鸣笛回声' },

  { id:'c2s4b017', ch:2, sec:4,
    kp:['noise-control'], type:'multi', diff:1, freq:4, points:4,
    stem:'某小区广场舞的音乐声常影响临街住户休息，社区组织住户代表和舞队协商，大家提出了以下四条建议。其中属于在“传播过程中阻断噪声”的措施有哪些？（多选）',
    note:'四个选项中有不止一个符合题意，全部选对才得分。', fig:null,
    parts:[
      { kind:'choice', q:'属于在传播过程中阻断噪声的措施有？',
        opts:['临街住户家中窗户加装密封条和厚窗帘','舞队把音箱音量调小','广场与住宅楼之间加装一道隔声屏障','把跳舞时间改到住户大多外出的时段'], answer:[0,2],
        analysis:'控制噪声三途径：声源处防止产生 / 传播过程中阻断 / 人耳处防止进入。A 密封条厚窗帘、C 隔声屏障都处在声音传播的<b>路径</b>上，属于<b>传播过程中阻断</b>；B 调小音量、D 错开时段都是在<b>声源处</b>想办法。<b>答案</b>：A、C。' }
    ],
    answer:null, analysis:null, src:'original', scene:'广场舞噪声协商' },

  { id:'c2s4b018', ch:2, sec:4,
    kp:['noise-control'], type:'choice', diff:1, freq:4, points:3,
    stem:'图书馆阅览室里，一位同学用手机外放短视频，视频里的乐曲旋律优美、音量也不大，管理员还是上前劝阻。从环境保护的角度看，下列说法正确的是？',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'关于外放的乐曲是否属于噪声，正确的说法是？',
        opts:['乐曲旋律优美，任何时候都不属于噪声','音量不大，不可能妨碍他人，不属于噪声','只要有人正在专心阅读，它就妨碍了他人，属于噪声','手机放出的声音一定是噪声'], answer:2,
        analysis:'从环境保护角度看，凡是<b>妨碍人们正常休息、学习和工作</b>的声音，以及对人们要听的声音产生干扰的声音，都属于噪声——优美乐曲在需要安静的阅览室同样构成干扰。<b>答案</b>：只要妨碍了他人，就属于噪声。' }
    ],
    answer:null, analysis:null, src:'original', scene:'图书馆手机外放' },

  { id:'c2s5b019', ch:2, sec:5,
    kp:['sound-transmit'], type:'experiment', diff:2, freq:4, points:6,
    stem:'兄妹俩用两个纸杯和一根棉线制作“土电话”：在两个纸杯底部各扎一个小孔，把棉线穿过小孔并在杯内打结固定，一人对着一只杯口说话，另一人把另一只杯口罩在耳朵上听。<br>（1）通话时棉线应当处于什么状态，对方才能清楚听到声音？<br>（2）此时声音主要靠什么传播到听者耳中？<br>（3）通话时若用手捏住棉线中间，听者几乎听不到声音，原因是？',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'（1）通话时棉线应当处于什么状态？',
        opts:['自然松弛','拉直绷紧','缠成线圈','沾水变湿'], answer:1,
        analysis:'棉线<b>拉直绷紧</b>后才能把杯底的振动沿线传过去，松弛的棉线传不了振动。<b>答案</b>：拉直绷紧。' },
      { kind:'choice', q:'（2）声音主要靠什么传播到听者耳中？',
        opts:['杯中的空气','说话时的手势','棉线','纸杯外的空气'], answer:2,
        analysis:'说话使杯底振动，振动沿<b>棉线</b>（固体）传到另一只杯底，再带动杯内空气振动入耳——说明固体能传声。<b>答案</b>：棉线。' },
      { kind:'choice', q:'（3）用手捏住棉线中间就听不到声音，原因是？',
        opts:['手把声音反射回了说话者一侧','棉线松弛后变成了气体','声音在棉线中传播得更快了','手阻止了棉线的振动，振动无法继续传播'], answer:3,
        analysis:'声音靠物体的<b>振动</b>传播：手捏住棉线，阻碍了线的振动，振动传不过去，听者就几乎听不到声音。<b>答案</b>：手阻止了棉线的振动。' }
    ],
    answer:null, analysis:null, src:'original', scene:'兄妹土电话' },

  { id:'c2s5b020', ch:2, sec:5,
    kp:['sound-produce'], type:'experiment', diff:1, freq:4, points:6,
    stem:'手工小组改装一只小音箱：拆掉面网后，在朝上的喇叭纸盆上撒了一些泡沫小球。接通音乐，喇叭发声，小球在纸盆上不停地跳动；断开音乐，小球安静下来。<br>（1）小球跳动说明喇叭发声时纸盆在____；<br>（2）把不易直接观察的纸盆运动，变成容易观察的小球跳动，这种方法叫____法；<br>（3）断开音乐后，纸盆不再来回运动，发声也随即____。',
    note:null, fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'（1）小球跳动说明纸盆在', answer:['振动'], unit:'' },
        { label:'（2）这种方法叫', answer:['转换','转化','转换法','转化法'], unit:'法' },
        { label:'（3）不再振动后发声随即', answer:['停止','停下','消失'], unit:'' }],
        analysis:'（1）发声时纸盆<b>振动</b>，把泡沫小球弹跳起来；（2）把微小的振动放大成容易观察的现象，用的是<b>转换法</b>；（3）振动停止，发声也<b>停止</b>——说明声音是由物体的振动产生的。' }
    ],
    answer:null, analysis:null, src:'original', scene:'音箱纸盆泡沫小球' },

  { id:'c2s5b021', ch:2, sec:5,
    kp:['pitch-loud-timbre','sound-transmit'], type:'blank', diff:1, freq:5, points:4,
    stem:'地铁站台广播响起：“列车即将进站，请乘客们站在安全线以内候车。”站在后排的乘客也能听清广播内容，车站同时提醒把随身音响的音量调小。<br>（1）广播声从扬声器传到人耳，靠的主要介质是____；<br>（2）调小音量主要改变声音的____。',
    note:null, fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'（1）传播的主要介质是', answer:['空气'], unit:'' },
        { label:'（2）调小音量主要改变声音的', answer:['响度'], unit:'' }],
        analysis:'（1）站台上扬声器与人耳之间充满<b>空气</b>，广播声靠空气传播；（2）音量大小对应声音的强弱，即<b>响度</b>——调小音量就是减小响度。' }
    ],
    answer:null, analysis:null, src:'original', scene:'地铁站台广播' },
];
const QBANK_C2_ORIG_FIGS = {
  waveCompare: function(){
    const W=420,H=210,pad=18,rowH=58;
    let g='';
    for(let x=pad;x<=W-pad;x+=60){ g+='<line x1="'+x+'" y1="'+pad+'" x2="'+x+'" y2="'+(H-pad)+'" stroke="#e3e8ef" stroke-width="1"/>'; }
    function wave(y0,cycles,amp,label){
      let p=[];
      for(let i=0;i<=240;i++){
        const x=pad+i*(W-2*pad)/240;
        const y=y0-amp*Math.sin(2*Math.PI*cycles*i/240);
        p.push((i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1));
      }
      return '<path d="'+p.join('')+'" fill="none" stroke="#2f6fed" stroke-width="2"/>'
        +'<text x="'+(pad-10)+'" y="'+(y0+5)+'" font-size="15" fill="#333" text-anchor="end">'+label+'</text>';
    }
    g+=wave(pad+rowH*0.5+8,6,14,'甲');
    g+=wave(pad+rowH*1.5+8,6,30,'乙');
    g+=wave(pad+rowH*2.5+8,12,14,'丙');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="甲乙丙三段声音的波形图">'+g+'</svg>';
  },
  carCliffEcho: function(){
    const W=460,H=170;
    let s='<defs><marker id="arC2a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L7 3 L0 6 Z" fill="#2f6fed"/></marker>'
      +'<marker id="arC2b" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L7 3 L0 6 Z" fill="#e2574c"/></marker></defs>';
    s+='<rect x="400" y="20" width="34" height="120" fill="#c9d4e3" stroke="#8fa3bd" stroke-width="2"/>';
    s+='<text x="417" y="14" font-size="13" fill="#555" text-anchor="middle">岩壁</text>';
    s+='<line x1="20" y1="140" x2="440" y2="140" stroke="#666" stroke-width="2"/>';
    s+='<circle cx="98" cy="140" r="12" fill="none" stroke="#333" stroke-width="3"/><circle cx="168" cy="140" r="12" fill="none" stroke="#333" stroke-width="3"/>';
    s+='<path d="M80 128 L80 104 L118 104 L142 78 L186 78 L192 104 L188 128 Z" fill="#f4b942" stroke="#a67c00" stroke-width="2"/>';
    s+='<text x="132" y="164" font-size="13" fill="#555" text-anchor="middle">汽车（匀速驶向岩壁）</text>';
    s+='<path d="M204 92 L392 92" fill="none" stroke="#2f6fed" stroke-width="2" stroke-dasharray="7 5" marker-end="url(#arC2a)"/>';
    s+='<path d="M392 112 L204 112" fill="none" stroke="#e2574c" stroke-width="2" stroke-dasharray="7 5" marker-end="url(#arC2b)"/>';
    s+='<text x="298" y="84" font-size="12" fill="#2f6fed" text-anchor="middle">喇叭声传向岩壁</text>';
    s+='<text x="298" y="130" font-size="12" fill="#e2574c" text-anchor="middle">回声返回</text>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="汽车驶向岩壁鸣笛听回声示意图">'+s+'</svg>';
  }
};

if(typeof window!=="undefined"){window.QBANK_C2_ORIG=QBANK_C2_ORIG;window.QBANK_C2_ORIG_FIGS=QBANK_C2_ORIG_FIGS;}

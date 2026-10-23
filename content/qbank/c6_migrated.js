/* c6 题库 · P1m 存量迁移 · 2026-10-24 · 迁移自 content/physics_g8_v1_c6_practice/practice.js（R-fix 终版，共22题）
 * 铁律：stem/note/points/parts（含 opts/answer/blanks/analysis/unit）逐字照抄，一字不改；
 *      新增 id/ch/sec/origId/kp/type/diff/freq/src/scene 标签字段。
 * type 归类：实验探究情景=experiment、计算题=calc、纯读数填空=blank、其余按 parts[0].kind；
 *      practice.js 的 kind:'open'（开放说理/方法题）按实质归入 blank（文字作答）或 experiment（实验方案设计）。
 * freq 取 kp[0]（主考点）在码表中的频度。
 */
var QBANK_C6_MIG = [

  // —— 第1节 质量（5 题） ——
  { id:'c6s1p001', ch:6, sec:1, origId:'c6s1q1',
    kp:['mass-prop'], type:'blank', diff:1, freq:3, points:10,
    stem:'小帆看潜水纪录片时注意到：潜水员穿着沉重的潜水服在岸上行动十分吃力，潜入水中后却显得灵活轻盈。潜水服从岸上到水下，它的质量有没有改变？为什么？',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    fig:null,
    parts:[{ kind:'open',
      ref:'参考要点：<br>① <b>没有改变</b>；<br>② 质量不随<b>位置</b>改变——潜水服的位置变了（岸上→水下），但所含<b>物质的多少没有变</b>，所以质量不变。「吃力/轻盈」的差别来自重力与水中浮托作用的不同，不是质量变化。',
      analysis:'判分：结论答「不变」；依据答「质量不随位置改变，所含物质的多少没变」。' }],
    answer:null, analysis:null, src:'migrated', scene:'潜水服从岸上到水下质量是否改变' },

  { id:'c6s1p002', ch:6, sec:1, origId:'c6s1q2',
    kp:['mass-prop'], type:'blank', diff:1, freq:3, points:10,
    stem:'把一块质量为 85 g 的蜡块敲成碎块，碎块的总质量是多少？这些碎块受热熔化成蜡液后的质量又是多少？你判断的依据是什么？',
    note:'前两空即时判分（每空5分），依据为开放说理，对照参考要点自评计分。',
    fig:null,
    parts:[
      { kind:'blank', q:'① 碎块的总质量是多少？② 碎块熔化成蜡液后的质量又是多少？', blanks:[
        { label:'碎块的总质量', answer:['85','85g','85 g','85克'], unit:'g' },
        { label:'熔化成蜡液后的质量', answer:['85','85g','85 g','85克'], unit:'g' }],
        analysis:'敲碎改变的只是<b>形状</b>，熔化改变的只是<b>物态</b>，所含物质的多少都没变 → 两空均 <b>85 g</b>。' },
      { kind:'open', q:'③ 你判断的依据是什么？',
        ref:'参考要点：质量不随<b>形状、物态</b>改变——蜡块敲成碎块（形状变）、碎块熔化成蜡液（物态变），所含物质的多少都没有变，所以质量都还是 85 g。',
        analysis:'判分：依据答「质量不随形状/物态改变，所含物质的多少没变」。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'蜡块敲碎再熔化的质量判断' },

  { id:'c6s1p003', ch:6, sec:1, origId:'c6s1q3',
    kp:['balance-use'], type:'blank', diff:1, freq:4, points:10,
    stem:'值日生小楷为下节实验课做准备，把一台刚从器材柜里取出的托盘天平放到水平桌面上，并把游码移到标尺左端的零刻度线处。横梁静止后，指针指在分度盘中央刻度线的左侧。为了让天平平衡，他该如何操作横梁上的平衡螺母？',
    note:'填空即时判分，「向右」的各种等价表述均认可。',
    fig:null,
    parts:[
      { kind:'blank', q:'平衡螺母该往哪边旋？', blanks:[
        { label:'调节方向', answer:['向右','向右调','向右调节','向右旋','向右拧','向右边调','向右边调节','向右端调','向指针偏转的反方向调','向指针偏转的反方向调节','向指针偏转反方向调','向指针偏转的反方向旋','向较高的一端调','向较高一端调','向高端调','把平衡螺母向右调','将平衡螺母向右调','平衡螺母向右调','平衡螺母向右调节'], unit:'' }],
        analysis:'指针停在分度盘左侧，说明横梁左端偏重 → 应把平衡螺母<b>向右旋</b>（朝指针偏转的反方向、也就是横梁翘起的那一端调），直到指针指在分度盘中央刻度线处。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'天平指针偏左调平衡螺母方向' },

  { id:'c6s1p004', ch:6, sec:1, origId:'c6s1q4',
    kp:['balance-use'], type:'blank', diff:2, freq:4, points:12,
    stem:'小岚想用托盘天平测出杯中豆浆的质量。她先测空杯：天平平衡时共用 3 个砝码——100 g、20 g、5 g 各 1 个，游码在标尺上的位置见下方简图。空杯的质量是多少？接着她把豆浆倒入杯中，测得杯和豆浆的总质量是 236.8 g。杯中豆浆的质量是多少？',
    note:'下方标尺简图为程序化绘制（标尺 0~5 g）。两空均即时判分（每空6分），等价写法（带不带单位）均认可。',
    fig:'fig616',
    parts:[
      { kind:'blank', q:'① 空杯的质量是多少？', blanks:[
        { label:'空杯的质量', answer:['128.2','128.2g','128.2 g','128.2克'], unit:'g' }],
        analysis:'天平读数=盘中砝码总质量+游码对应质量：m=100 g+20 g+5 g+3.2 g=<b>128.2 g</b>（游码对齐 3.2 g 见简图）。' },
      { kind:'blank', q:'② 杯中豆浆的质量是多少？', blanks:[
        { label:'豆浆的质量', answer:['108.6','108.6g','108.6 g','108.6克'], unit:'g' }],
        analysis:'m豆浆=m总−m杯=236.8 g−128.2 g=<b>108.6 g</b>（差值法）。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'天平游码读数差值法测杯中豆浆质量' },

  { id:'c6s1p005', ch:6, sec:1, origId:'c6s1q5',
    kp:['balance-use','mass-prop'], type:'experiment', diff:2, freq:4, points:10,
    stem:'小舟有一盒规格完全相同的图钉，手边只有一台托盘天平（含砝码）。他怎样测出一枚图钉的质量？又怎样估计出整盒图钉的数量？写出你的方法。',
    note:'开放方法题，作答后对照参考要点自评计分。',
    fig:null,
    parts:[{ kind:'open',
      ref:'参考要点（累积法/测多算少）：<br>① 一枚图钉质量太小，直接测误差大——先用天平测出 <b>n 枚（如 25 枚）图钉的总质量 m</b>，一枚质量 <b>m₀=m/n</b>（总质量÷枚数）；<br>② 再用天平测出<b>整盒图钉的总质量 M</b>，盒内数量 <b>N=M/m₀</b>（总质量÷一枚质量）。',
      analysis:'判分：答出累积法（测多算少）思路；含「总质量÷枚数」与「总质量÷一枚质量」两步语义即给分。' }],
    answer:null, analysis:null, src:'migrated', scene:'累积法测一枚图钉质量与整盒数量' },

  // —— 第2节 密度（7 题） ——
  { id:'c6s2p001', ch:6, sec:2, origId:'c6s2q1',
    kp:['mv-graph','density-prop'], type:'experiment', diff:2, freq:3, points:12,
    stem:'科技小组探究某种金属材料的质量与体积的关系，测得六组实验数据（见下表）。请把这六组数据描在坐标纸上（纵轴 m/g 取 0~120、横轴 V/cm³ 取 0~50）并作出 m-V 图像。由图像你能得出什么结论？',
    note:'①作图对照参考要点自评，②结论填空即时判分。',
    fig:'s2q1Table',
    parts:[
      { kind:'open', q:'① 作图：在坐标纸上作出 m-V 图像。',
        ref:'参考要点：<br>① 以体积 V 为横轴、质量 m 为纵轴，把表中六个数据点（12, 32.4）（16, 43.3）（20, 54.0）（28, 75.5）（32, 86.5）（40, 108.0）逐一描在坐标网格上；<br>② 六个点大致分布在<b>一条过原点的直线</b>上，用直线把它们连起来（作 m-V 图像）。',
        analysis:'逐点比值 m/V=2.700/2.706/2.700/2.696/2.703/2.700 g/cm³ ≈ 恒定 2.7 g/cm³（与密度表中铝的密度一致）→ 图像为过原点的直线。' },
      { kind:'blank', q:'② 由图像你能得出什么结论？', blanks:[
        { label:'该物质的质量与体积成', answer:['正比','成正比','正比例','正比关系','正比例关系'], unit:'' }],
        analysis:'图像是过原点的直线 → <b>同种物质的质量与它的体积成正比</b>（比值 m/V≈2.7 g/cm³ 恒定）。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'六组数据描点作m-V图像得正比结论' },

  { id:'c6s2p002', ch:6, sec:2, origId:'c6s2q2',
    kp:['density-calc','density-app'], type:'calc', diff:2, freq:5, points:12,
    stem:'材料兴趣小组测得一小块铂样品的质量为 63.75 g，体积为 3 cm³。这块铂的密度是多少？小组还查到：目前能制成的一种气凝胶，密度只有 3 kg/m³，是世界上最轻的固体材料之一。铂的密度大约是这种气凝胶的多少倍？',
    note:'两空均即时判分，等价写法（g/cm³ 与 ×10³ kg/m³ 双轨、倍数取两位有效数字或从宽近似）均认可。',
    fig:null,
    parts:[
      { kind:'blank', q:'① 这块铂的密度是多少？', blanks:[
        { label:'铂的密度 ρ', answer:['21.25','21.25g/cm³','21.25g/cm3','21.25 g/cm³','21.25×10³kg/m³','21.25×10^3kg/m³','21.25x10^3kg/m3','21.25×10³ kg/m³','21250kg/m³','21250 kg/m³','2.125×10⁴kg/m³'], unit:'' }],
        analysis:'ρ=m/V=63.75 g/3 cm³=<b>21.25 g/cm³</b>，化为国际单位即 <b>2.125×10⁴ kg/m³</b>（1 g/cm³=1×10³ kg/m³）。' },
      { kind:'blank', q:'② 铂的密度大约是这种气凝胶的多少倍？', blanks:[
        { label:'倍数约为', answer:['7083','7083.3','7.1×10³','7.08×10³','7.083×10³','约7083','约7.1×10³','约7×10³','7×10³','7083倍','7.1×10³倍','7.1×10^3','7.08×10^3','7083x','≈7.1×10³','≈7083'], unit:'倍' }],
        analysis:'倍数=2.125×10⁴ kg/m³÷3 kg/m³≈<b>7.1×10³ 倍</b>（约 7083 倍）。解题关键是先统一单位：21.25 g/cm³=2.125×10⁴ kg/m³，再做除法（结果保留两位有效数字即可）。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'铂样品密度计算与气凝胶倍数比较' },

  { id:'c6s2p003', ch:6, sec:2, origId:'c6s2q3',
    kp:['density-calc'], type:'calc', diff:1, freq:5, points:10,
    stem:'小宇家的鱼缸大致是长方体，长、宽、水深分别约为 1.5 m、0.4 m、0.35 m。把水加满时，缸里的水最多有多少千克？',
    note:null,
    fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'最多装水', answer:['210','210kg','210 kg','210千克'], unit:'kg' }],
        analysis:'鱼缸容积 V=1.5×0.4×0.35=<b>0.21 m³</b>；加满时水的体积等于容积，m=ρ水V=1.0×10³ kg/m³×0.21 m³=<b>210 kg</b>（m=ρV 变形应用）。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'长方体鱼缸加满水的质量' },

  { id:'c6s2p004', ch:6, sec:2, origId:'c6s2q4',
    kp:['density-app','density-calc'], type:'calc', diff:2, freq:2, points:10,
    stem:'估一估：你家客厅里究竟装着多少千克的空气？请说明你打算测量哪些数据、需要查阅什么资料，并写出完整的估算过程和结果。',
    note:'本题为开放估算题，作答后对照参考要点自评计分。',
    fig:null,
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 要测的数据：客厅的<b>长、宽、高</b>（示例约 6 m×4.5 m×2.8 m），V=6×4.5×2.8≈<b>76 m³</b>；<br>② 要查的资料：密度表里空气的密度 ρ=<b>1.29 kg/m³</b>；<br>③ 估算：m=ρV≈1.29 kg/m³×75.6 m³≈<b>98 kg</b>——数量级为<b>一百千克</b>；<br>④ 解读：一屋子空气的质量接近一个成年人的质量。空气密度很小，但房间体积大，总质量依然可观。自家客厅尺寸取 60~100 m³ 的合理值，算出 77~129 kg 都算对。',
      analysis:'方法要点：量长宽高求体积 V，查 ρ空气=1.29 kg/m³，代入 m=ρV；结果落在 10² kg 量级（示例约 98 kg）即为合理。' }],
    answer:null, analysis:null, src:'migrated', scene:'估算客厅里空气的质量' },

  { id:'c6s2p005', ch:6, sec:2, origId:'c6s2q5',
    kp:['density-app','density-calc'], type:'calc', diff:2, freq:2, points:10,
    stem:'游泳课上，小桐深吸一口气后发现自己能稳稳地漂在水面上。教练解释说，这是因为人体的平均密度与水十分接近。请借助这个事实估出你自己身体的体积：写出你采用的数据、算式和结果。',
    note:'本题为开放估算题，答案随自身质量，作答后对照参考要点自评核对算式。',
    fig:null,
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 采用的数据：ρ人≈ρ水=<b>1.0×10³ kg/m³</b>，加上自己的实际质量 m；<br>② 把 ρ=m/V 变形为 <b>V=m/ρ</b>——以质量 42 kg 的同学为例：V=42 kg÷(1.0×10³ kg/m³)=<b>0.042 m³</b>，也就是 42 dm³（约 42 L）；<br>③ 结果检查：一个中学生的体积在几十升（0.03~0.06 m³）量级即为合理。',
      analysis:'方法用 V=m/ρ、ρ 取 1.0×10³ kg/m³ 即可；数值随自身质量而定（开放答案，自评核对算式与量级）。' }],
    answer:null, analysis:null, src:'migrated', scene:'借人体密度近水估自身身体体积' },

  { id:'c6s2p006', ch:6, sec:2, origId:'c6s2q6',
    kp:['density-prop'], type:'blank', diff:1, freq:3, points:10,
    stem:'木雕师傅把一段粗大的樟木装上机床，车削成一只小巧的木碗，刨掉的木料比留下来的还多。跟原来那段樟木相比，做木碗的这块木头的密度有没有变化？说说你的理由。',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    fig:null,
    parts:[{ kind:'open',
      ref:'参考要点：<br>① <b>没有变化</b>；<br>② 密度是物质本身的一种<b>特性</b>——同一种木头（材质、物态、温度都不变）的质量与体积之比是确定的；<br>③ 车削只是把木料变小、改变了<b>形状</b>：木碗的质量和体积都比原来的木段小，但两者<b>同比例减小</b>，比值 ρ=m/V 仍然是樟木的密度。只有换了材料、或改变了温度与物态（例如烧成木炭），密度才会变化。',
      analysis:'结论答「不变」；理由：密度是物质特性，不随物体的大小、形状改变——削小以后质量与体积同比例减小，比值不变。' }],
    answer:null, analysis:null, src:'migrated', scene:'樟木车削成木碗密度是否变化' },

  { id:'c6s2p007', ch:6, sec:2, origId:'c6s2q7',
    kp:['density-prop'], type:'blank', diff:1, freq:3, points:10,
    stem:'超市货架上放着同一品牌的两种桶装食用油：大桶净含量 5 L，小桶净含量 1 L。小旭拎了拎大桶说："大桶的油多、明显压手，可见大桶里油的密度比小桶里的大。"你同意他的说法吗？请说明理由。',
    note:'本题为开放辨析说理题，作答后对照参考要点自评计分。',
    fig:null,
    parts:[{ kind:'open',
      ref:'参考要点：<br>① <b>不同意</b>；<br>② 两桶装的是同一种食用油，密度是物质本身的<b>特性</b>，只由油的种类（以及温度、物态）决定，与"取了多少"无关；<br>③ 大桶里油的质量是小桶的 5 倍，体积同样是 5 倍，比值 ρ=m/V 完全相同——"压手"说明的是<b>质量更大</b>，不是密度更大；<br>④ ρ=m/V 只是密度的<b>量度式（定义式）</b>，不能读成"质量越大密度越大"；要真正改变密度，得换一种物质（比如换成水或蜂蜜）。',
      analysis:'结论答「不同意」；核心论据：密度是物质特性，同种油的质量与体积同倍数增大、比值不变，"压手"反映的是质量而不是密度。' }],
    answer:null, analysis:null, src:'migrated', scene:'大小桶食用油压手与密度关系辨析' },

  // —— 第3节 测量液体和固体的密度（5 题） ——
  { id:'c6s3p001', ch:6, sec:3, origId:'c6s3q1',
    kp:['cylinder-use'], type:'choice', diff:1, freq:4, points:12,
    stem:'下方简图画出了三位同学读量筒中液面刻度时的视线位置。谁的读数方法是对的？另外，实验室要量取约 38 mL 的盐水，桌上只剩下下面两种规格的量筒，你会挑哪一种？为什么？',
    note:'下方简图为程序化绘制（甲/乙/丙为三种视线位置）。两小问均单选即时判分，②的「为什么」说理见判分后解析。',
    fig:'readSight3',
    parts:[
      { kind:'choice', q:'① 三位同学中，谁的读数方法是正确的？',
        opts:['甲','乙','丙'], answer:1,
        analysis:'<b>乙正确</b>：读量筒刻度时，<b>视线要与凹液面最低处相平</b>。像甲那样俯视，读数偏大；像丙那样仰视，读数偏小。' },
      { kind:'choice', q:'② 要量取约 38 mL 的盐水，应选哪一种量筒？',
        opts:['50 mL（分度值 1 mL）','250 mL（分度值 5 mL）'], answer:0,
        analysis:'选 <b>50 mL</b> 量筒：待量液体约 38 mL，<b>不超过 50 mL 量程又比较接近它</b>，且分度值只有 1 mL，读数更精确；250 mL 量程远超需要、分度值 5 mL，估读误差明显变大。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'量筒读数视线正误与量程规格选择' },

  { id:'c6s3p002', ch:6, sec:3, origId:'c6s3q2',
    kp:['density-calc'], type:'calc', diff:1, freq:5, points:12,
    stem:'超市里有一种瓶身标注净含量"1.8 L"的饮用水瓶。用这样的瓶子装水，最多能装多少千克？换成装植物油呢？植物油的密度取 0.9×10³ kg/m³。（1 L = 1 dm³）',
    note:'两空均即时判分（每空6分），等价写法（带不带单位）均认可。',
    fig:null,
    parts:[
      { kind:'blank', q:'① 用它装水，最多能装多少千克？', blanks:[
        { label:'最多装水', answer:['1.8','1.8kg','1.8 kg','1.8千克'], unit:'kg' }],
        analysis:'V=1.8 L=1.8 dm³=1.8×10⁻³ m³；m水=ρ水V=1.0×10³ kg/m³×1.8×10⁻³ m³=<b>1.8 kg</b>（ρ水=1.0×10³ kg/m³，查密度表）。' },
      { kind:'blank', q:'② 用它装植物油，最多能装多少千克？', blanks:[
        { label:'最多装植物油', answer:['1.62','1.62kg','1.62 kg','1.62千克'], unit:'kg' }],
        analysis:'m油=ρ油V=0.9×10³ kg/m³×1.8×10⁻³ m³=<b>1.62 kg</b>（m=ρV）。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'1.8L饮用水瓶装水与装植物油质量' },

  { id:'c6s3p003', ch:6, sec:3, origId:'c6s3q3',
    kp:['density-app','density-calc'], type:'calc', diff:2, freq:2, points:12,
    stem:'航模社的零件盒里有一只看不出拼接痕迹的铝合金零件。小林用天平测得它的质量为 81 g，再用排水法在量筒中测得它的体积为 40 cm³。已知铝的密度是 2.7 g/cm³。请通过计算判断：这只零件的内部有没有空腔？',
    note:'①单选即时判分；②展示计算过程后对照参考要点自评计分。',
    fig:null,
    parts:[
      { kind:'choice', q:'① 这只零件：',
        opts:['内部有空腔（中空）','整体是实心的'], answer:0,
        analysis:'零件密度 ρ=m/V=81 g/40 cm³=<b>2.025 g/cm³</b>，比铝的密度 2.7 g/cm³ 小 → 内部<b>有空腔</b>。' },
      { kind:'open', q:'② 写出你的计算判断过程。',
        ref:'参考要点（两种证法均认）：<br><b>证法一（比密度）</b>：零件密度 ρ=m/V=81 g/40 cm³=<b>2.025 g/cm³</b>；2.025 g/cm³ < ρ铝=2.7 g/cm³ → 零件<b>内部有空腔</b>。<br><b>证法二（比体积）</b>：若 81 g 全部是实心铝，体积应为 V=m/ρ=81 g÷2.7 g/cm³=<b>30 cm³</b> < 实测的 40 cm³，多出的 10 cm³ 就是空腔 → <b>中空</b>。',
        analysis:'鉴别思路：算出零件的密度与铝的密度比较（或算实心铝应有的体积与实测体积比较）；2.025 g/cm³<2.7 g/cm³ → 内部有空腔。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'铝合金零件比密度判断内部是否空腔' },

  { id:'c6s3p004', ch:6, sec:3, origId:'c6s3q4',
    kp:['density-exp-s','balance-use','cylinder-use'], type:'experiment', diff:2, freq:5, points:12,
    stem:'小硕要测定一块金属块的密度，实验分两步。第一步用天平测质量：天平平衡时，右盘中的砝码与游码位置见下方简图甲，金属块的质量 m 是多少？第二步用量筒测体积：先在量筒中倒入适量水，液面位置见简图乙；把金属块完全浸没后水面升高，见简图丙，金属块的体积 V 是多少？根据测量结果，这块金属的密度是多少？',
    note:'下方简图为程序化绘制（甲为天平测质量、乙丙为量筒测体积），读数均从简图中读出。三空均即时判分（每空4分）。',
    fig:'balanceCyl3',
    parts:[
      { kind:'blank', q:'① 金属块的质量 m 是多少？', blanks:[
        { label:'质量 m', answer:['46.8','46.8g','46.8 g','46.8克'], unit:'g' }],
        analysis:'天平读数=盘中砝码总质量+游码对应质量：m=20 g+20 g+5 g+1.8 g=<b>46.8 g</b>（游码位置见简图甲）。' },
      { kind:'blank', q:'② 金属块的体积 V 是多少？', blanks:[
        { label:'体积 V', answer:['6','6cm³','6cm3','6 cm³','6立方厘米','6毫升','6mL'], unit:'cm³' }],
        analysis:'排水法：V=V₂−V₁=28 mL−22 mL=6 mL=<b>6 cm³</b>。' },
      { kind:'blank', q:'③ 该金属块的密度是多少？', blanks:[
        { label:'密度 ρ', answer:['7.8','7.8g/cm³','7.8g/cm3','7.8 g/cm³','7.8克每立方厘米','7.8×10³kg/m³','7.8×10^3kg/m3','7800kg/m³'], unit:'g/cm³' }],
        analysis:'ρ=m/V=46.8 g/6 cm³=<b>7.8 g/cm³</b>（=7.8×10³ kg/m³，铁）。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'天平量筒排水法测金属块密度三联图读数' },

  { id:'c6s3p005', ch:6, sec:3, origId:'c6s3q5',
    kp:['density-exp-l','density-calc'], type:'experiment', diff:2, freq:5, points:10,
    stem:'小雨想测出盒装酸奶的密度。她先把整盒酸奶放上天平，测得总质量为 272.0 g；再往量筒中倒入 40 mL 酸奶，测得剩余部分的总质量为 229.6 g。这种盒装酸奶的密度是多少？',
    note:null,
    fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'酸奶的密度 ρ', answer:['1.06','1.06g/cm³','1.06g/cm3','1.06 g/cm³','1.06×10³kg/m³','1.06×10^3kg/m3','1060kg/m³','1.06克每立方厘米'], unit:'g/cm³' }],
        analysis:'差值法：倒入量筒的酸奶 m=272.0 g−229.6 g=<b>42.4 g</b>；V=40 mL=40 cm³；ρ=m/V=42.4 g/40 cm³=<b>1.06 g/cm³</b>（=1.06×10³ kg/m³，两种单位写法均认可）。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'差值法测盒装酸奶密度' },

  // —— 第4节 密度的应用（5 题） ——
  { id:'c6s4p001', ch:6, sec:4, origId:'c6s4q1',
    kp:['density-calc','density-app'], type:'calc', diff:2, freq:5, points:10,
    stem:'修校园操场需要 350 m³ 沙子。如果用载质量为 5 t 的卡车来运，一共需要运多少车？沙子的密度取 1.6×10³ kg/m³。',
    note:null,
    fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'需要运', answer:['112','112车','112 车'], unit:'车' }],
        analysis:'沙子总质量 m=ρV=1.6×10³ kg/m³×350 m³=5.6×10⁵ kg=<b>560 t</b>；运输车数 n=560 t÷5 t=<b>112 车</b>（m=ρV 变形 + 除法取整）。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'操场350立方米沙子按5吨卡车算运输车数' },

  { id:'c6s4p002', ch:6, sec:4, origId:'c6s4q2',
    kp:['density-calc','density-app'], type:'calc', diff:3, freq:5, points:10,
    stem:'一卷铜芯电线质量为 178 kg，铜芯的横截面积是 20 mm²。这卷电线里铜芯的长度是多少？',
    note:null,
    fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'铜芯的长度 L', answer:['1000','1000m','1000 m','1000米'], unit:'m' }],
        analysis:'ρ铜=8.9×10³ kg/m³（查密度表）；铜芯体积 V=m/ρ=178 kg÷(8.9×10³ kg/m³)=<b>2×10⁻² m³</b>；S=20 mm²=20×10⁻⁶ m²；由 V=SL 得 L=V/S=<b>1000 m</b>（V=m/ρ 变形 + 柱体 V=SL 逆用；单位换算是判分关键步骤）。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'铜芯电线按质量与横截面积求长度' },

  { id:'c6s4p003', ch:6, sec:4, origId:'c6s4q3',
    kp:['density-app','density-calc'], type:'experiment', diff:3, freq:2, points:12,
    stem:'实验台上放着一块长方形的薄铜片，它薄得用刻度尺很难直接量准厚度。手边只有一台天平（含砝码）和一把刻度尺，你有办法测出这块铜片的厚度吗？请把方案写清楚。',
    note:'①单选即时判分；②方案对照参考要点自评计分。',
    fig:null,
    parts:[
      { kind:'choice', q:'① 只用天平和刻度尺，能不能测出铜片的厚度？',
        opts:['能测出来','测不出来'], answer:0,
        analysis:'<b>能测出</b>：先用天平测质量、结合铜的密度算出体积，再用刻度尺量出长和宽，厚度就能从体积反推出来。' },
      { kind:'open', q:'② 把你的测量方案写出来。',
        ref:'参考要点（四步齐全）：<br>① 用天平测出铜片的<b>质量 m</b>；<br>② 查密度表得 <b>ρ铜=8.9×10³ kg/m³</b>，算出体积 <b>V=m/ρ铜</b>；<br>③ 用刻度尺测出铜片的<b>长 a、宽 b</b>；<br>④ 由 V=a·b·d 反推厚度 <b>d=V/(a·b)</b>。',
        analysis:'思路：V=m/ρ 间接求体积，再由 V=abd 反推厚度；自评核对「测 m→算 V→尺量 a、b→d=V/(ab)」四步齐全。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'天平加刻度尺间接测薄铜片厚度方案' },

  { id:'c6s4p004', ch:6, sec:4, origId:'c6s4q4',
    kp:['density-calc','density-app'], type:'calc', diff:2, freq:5, points:12,
    stem:'一卷工业包装用的薄钢带，标签上印有下表所示的规格信息。若钢带的密度按铁的密度 7.9×10³ kg/m³ 计算，请根据表中数据算出这卷钢带的质量，再对照标签上的标称质量，看两者是否一致。',
    note:'①计算质量填空 + ②判断单选，均即时判分（每空6分）。',
    fig:'s4q4Table',
    parts:[
      { kind:'blank', q:'① 根据表中数据计算钢带的质量 m：', blanks:[
        { label:'计算质量 m', answer:['316','316g','316 g','316克','0.316','0.316kg','0.316千克'], unit:'g' }],
        analysis:'V=0.25 m×20 m×8×10⁻⁶ m=<b>4×10⁻⁵ m³</b>；m=ρV=7.9×10³ kg/m³×4×10⁻⁵ m³=0.316 kg=<b>316 g</b>（宽 250 mm=0.25 m、厚 8 μm=8×10⁻⁶ m，单位换算是判分关键）。' },
      { kind:'choice', q:'② 算出的质量与标签上的标称值是否一致？',
        opts:['一致','不一致'], answer:0,
        analysis:'计算得 316 g，与标签标称的 316 g <b>一致</b>（m=ρV 的应用）。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'薄钢带规格表算质量并与标称值核对' },

  { id:'c6s4p005', ch:6, sec:4, origId:'c6s4q5',
    kp:['density-calc','density-app'], type:'calc', diff:3, freq:5, points:10,
    stem:'小帆参观博物馆时看到一对唐代青铜奔马复制品。展签介绍：原件中最重的一尊质量约 63.2 t，青铜密度按 7.9×10³ kg/m³ 计。博物馆想制作一尊体积是原件万分之一的等比例模型用于教学，若用密度为 1.35×10³ kg/m³ 的石膏来制作，大约需要多少千克的石膏？',
    note:'填空即时判分，≈1.08 kg/1.1 kg 量级（两位有效数字从宽）均认可。',
    fig:null,
    parts:[
      { kind:'blank', blanks:[
        { label:'需用石膏的质量约为', answer:['1.08','1.1','1.08kg','1.1kg','1.08 kg','1.1 kg','1.08千克','1.1千克','约1.08','约1.1'], unit:'kg' }],
        analysis:'原件体积 V马=m/ρ=6.32×10⁴ kg÷(7.9×10³ kg/m³)=<b>8 m³</b>；模型体积 V模=V马÷10⁴=8×10⁻⁴ m³；m石膏=ρ石膏V模=1.35×10³ kg/m³×8×10⁻⁴ m³=<b>1.08 kg</b>（V=m/ρ + m=ρV 两式连用；「万分之一」是体积比而非质量比，判分防错点）。' }
    ],
    answer:null, analysis:null, src:'migrated', scene:'青铜奔马万分之一体积石膏模型用料' }

];

/* ===== 程序化插图（自 practice.js 逐字复制，函数体一字不改；含依赖辅助函数 panelBox / sightPanel） ===== */
function panelBox(dx, dy, title, inner) {
  return `<g transform="translate(${dx},${dy})">`
    + `<rect x="4" y="4" width="222" height="152" fill="none" stroke="rgba(255,255,255,.08)" rx="8"/>`
    + `<text x="14" y="24" fill="#ffd479" font-size="14" font-weight="700">${title}</text>`
    + inner + `</g>`;
}

function htmlS2q1Table() {
  // c6s2q1 数据表（六组数据；N6 数值重派 2026-10-22，比值落在密度表铝线 2.7 g/cm³ 上）
  const no = ['1','2','3','4','5','6'];
  const v  = ['12','16','20','28','32','40'];
  const m  = ['32.4','43.3','54.0','75.5','86.5','108.0'];
  const row = (name, arr) => `<tr><th>${name}</th>${arr.map(x => `<td>${x}</td>`).join('')}</tr>`;
  return `<table class="dtab"><tbody>`
    + row('序号', no) + row('体积V/cm³', v) + row('质量m/g', m)
    + `</tbody></table>`;
}

function htmlS4q4Table() {
  // c6s4q4 规格表（RF6 脱钩重派 2026-10-24：载体换薄钢带，标称质量与 m=ρ铁V 重算一致）
  return `<table class="dtab"><tbody>`
    + `<tr><th>品名</th><td>工业包装用 薄钢带</td></tr>`
    + `<tr><th>规格</th><td>250 mm × 20 m 质量316 g</td></tr>`
    + `<tr><th>使用原料</th><td>钢带8 μm × 250 mm</td></tr>`
    + `</tbody></table>`;
}

/* 天平标尺简图（0~5 g，主刻 1 g、副刻 0.2 g 族，游码对齐 3.2 g），确定性绘制，挂 c6s1q4 */
function svgFig616() {
  const x0 = 34, step = 70; // 主刻度间距：1 g = 70px；副刻度 0.2 g = 14px
  let s = `<line x1="20" y1="88" x2="398" y2="88" stroke="#9aa4b5" stroke-width="1.5"/>`;
  for (let i = 0; i <= 25; i++) {
    const x = x0 + i * (step / 5);
    const major = i % 5 === 0;
    s += `<line x1="${x}" y1="${major ? 72 : 80}" x2="${x}" y2="88" stroke="${major ? '#9aa4b5' : '#6b7686'}" stroke-width="${major ? 1.5 : 1}"/>`;
    if (major) s += `<text x="${x - 3}" y="106" fill="#9aa4b5" font-size="11">${i / 5}</text>`;
  }
  s += `<text x="402" y="106" fill="#9aa4b5" font-size="11">g</text>`;
  const xr = x0 + 3.2 * step;
  s += `<rect x="${xr - 6}" y="62" width="12" height="20" fill="#ffd479" rx="2"/>`;
  return `<svg viewBox="0 0 440 120" role="img" aria-label="天平标尺简图">${s}</svg>`;
}

/* 量筒读数三视线简图（甲=俯视/乙=视线与液面相平/丙=仰视），确定性绘制 */
function sightPanel(menY, eyeY, tag) {
  let s = '';
  // 量筒筒身与刻度
  s += `<rect x="108" y="30" width="36" height="102" fill="none" stroke="#9aa4b5" stroke-width="1.5" rx="2"/>`;
  for (let i = 0; i <= 9; i++) {
    const y = 36 + i * 10;
    s += `<line x1="${i % 2 === 0 ? 132 : 137}" y1="${y}" x2="144" y2="${y}" stroke="#6b7686" stroke-width="1"/>`;
  }
  // 液体与液面
  s += `<rect x="109.5" y="${menY}" width="33" height="${132 - menY - 1.5}" fill="rgba(90,215,255,.22)"/>`;
  s += `<line x1="108" y1="${menY}" x2="144" y2="${menY}" stroke="#5ad7ff" stroke-width="2"/>`;
  s += `<text x="150" y="${menY + 4}" fill="#5ad7ff" font-size="10">液面</text>`;
  // 眼睛（圆+瞳孔）
  s += `<circle cx="52" cy="${eyeY}" r="9" fill="none" stroke="#ffd479" stroke-width="1.5"/>`;
  s += `<circle cx="55" cy="${eyeY}" r="3" fill="#ffd479"/>`;
  // 虚线视线：眼→液面处筒壁
  s += `<line x1="61" y1="${eyeY}" x2="108" y2="${menY}" stroke="#ffd479" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  s += `<text x="18" y="${eyeY - 14}" fill="#ffd479" font-size="10">眼睛</text>`;
  s += `<text x="66" y="${(eyeY + menY) / 2 - 6}" fill="#9aa4b5" font-size="10">${tag}</text>`;
  return s;
}
function svgReadSight3() {
  const s = panelBox(0, 0, '甲', sightPanel(76, 44, ''))
    + panelBox(233, 0, '乙', sightPanel(76, 76, ''))
    + panelBox(466, 0, '丙', sightPanel(76, 108, ''));
  return `<svg viewBox="0 0 700 170" role="img" aria-label="量筒读数视线简图">${s}</svg>`;
}

/* 天平与量筒三联简图（甲=砝码20 g+20 g+5 g、游码对齐1.8 g；乙=量筒22 mL；丙=金属块浸没后28 mL），确定性绘制 */
function svgBalanceCyl3() {
  // 甲：砝码 + 游码标尺
  let pA = '';
  pA += `<rect x="18" y="40" width="46" height="34" fill="rgba(255,255,255,.08)" stroke="#9aa4b5" stroke-width="1.5" rx="3"/><text x="26" y="62" fill="#eef2f8" font-size="12">20 g</text>`;
  pA += `<rect x="72" y="48" width="38" height="26" fill="rgba(255,255,255,.08)" stroke="#9aa4b5" stroke-width="1.5" rx="3"/><text x="78" y="66" fill="#eef2f8" font-size="12">20 g</text>`;
  pA += `<rect x="118" y="54" width="30" height="20" fill="rgba(255,255,255,.08)" stroke="#9aa4b5" stroke-width="1.5" rx="3"/><text x="124" y="69" fill="#eef2f8" font-size="12">5 g</text>`;
  pA += `<text x="158" y="52" fill="#9aa4b5" font-size="10">砝码</text>`;
  // 游码标尺 0-5 g（主刻 1 g、副刻 0.2 g 族），游码对齐 1.8 g
  pA += `<line x1="20" y1="118" x2="206" y2="118" stroke="#9aa4b5" stroke-width="1.5"/>`;
  for (let i = 0; i <= 25; i++) {
    const x = 24 + i * 7;
    const major = i % 5 === 0;
    pA += `<line x1="${x}" y1="${major ? 110 : 113}" x2="${x}" y2="118" stroke="#9aa4b5" stroke-width="${major ? 1.5 : 1}"/>`;
    if (major) pA += `<text x="${x - 3}" y="132" fill="#9aa4b5" font-size="10">${i / 5}</text>`;
  }
  pA += `<text x="208" y="132" fill="#9aa4b5" font-size="10">g</text>`;
  pA += `<rect x="${24 + 1.8 * 35 - 4}" y="102" width="8" height="14" fill="#ffd479" rx="2"/>`;
  // 乙/丙：量筒（0~30 mL，1 mL = 3px；乙 22 mL；丙 金属块浸没后 28 mL）
  function cylPanel(mL, block) {
    const yFor = v => 128 - v * 3;
    let s = `<rect x="92" y="30" width="40" height="104" fill="none" stroke="#9aa4b5" stroke-width="1.5" rx="2"/>`;
    for (let v = 0; v <= 30; v++) {
      const y = yFor(v);
      const major = v % 5 === 0;
      s += `<line x1="${major ? 118 : 124}" y1="${y}" x2="132" y2="${y}" stroke="#6b7686" stroke-width="${major ? 1.2 : 1}"/>`;
      if (major) s += `<text x="136" y="${y + 3}" fill="#9aa4b5" font-size="9">${v}</text>`;
    }
    s += `<text x="136" y="34" fill="#9aa4b5" font-size="9">mL</text>`;
    const menY = yFor(mL);
    s += `<rect x="93.5" y="${menY}" width="37" height="${132.5 - menY}" fill="rgba(90,215,255,.22)"/>`;
    if (block) s += `<rect x="100" y="108" width="26" height="24" fill="#8b96a8" stroke="#6b7686" rx="2"/><text x="103" y="124" fill="#0b0e13" font-size="9">金属块</text>`;
    s += `<line x1="92" y1="${menY}" x2="132" y2="${menY}" stroke="#5ad7ff" stroke-width="2"/>`;
    return s;
  }
  const pB = cylPanel(22, false);   // 乙：水面 22 mL
  const pC = cylPanel(28, true);    // 丙：浸没后水面升至 28 mL
  const s = panelBox(0, 0, '甲', pA) + panelBox(233, 0, '乙', pB) + panelBox(466, 0, '丙', pC);
  return `<svg viewBox="0 0 700 170" role="img" aria-label="天平与量筒测量简图">${s}</svg>`;
}

var QBANK_C6_MIG_FIGS = {
  fig616: svgFig616,
  s2q1Table: htmlS2q1Table,
  readSight3: svgReadSight3,
  balanceCyl3: svgBalanceCyl3,
  s4q4Table: htmlS4q4Table
};

if (typeof window !== "undefined") { window.QBANK_C6_MIG = QBANK_C6_MIG; window.QBANK_C6_MIG_FIGS = QBANK_C6_MIG_FIGS; }

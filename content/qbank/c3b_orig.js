/* c3b 题库（第三章 s3~s4 汽化液化+升华凝华）· P2 原创生产 · 2026-10-24 */
const QBANK_C3B_ORIG = [

  { id:'c3s3b001', ch:3, sec:3,
    kp:['liquefy'], type:'choice', diff:2, freq:4, points:3,
    stem:'关于玻璃上“出汗”的两个现象：① 盛夏开空调的房间里，窗玻璃上会出现小水珠；② 寒冬开暖风的汽车里，前挡风玻璃内也会蒙上一层小水珠。下列分析正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'小水珠出现的位置和成因，分析正确的是？',
      opts:['现象①的小水珠在玻璃外表面——室外的湿热水蒸气碰到被空调冷却的玻璃，液化成小水珠','现象①的小水珠在玻璃内表面——室内的水蒸气遇到冷玻璃液化','现象②的小水珠在挡风玻璃外表面——车外冷空气在玻璃上液化','两个现象的小水珠都是玻璃自身的冰受热熔化形成的'], answer:0,
      analysis:'液化发生的条件：温度较高的水蒸气遇到冷的物体表面。现象①中空调把室内玻璃吹冷，室外盛夏空气湿热，室外水蒸气碰到玻璃外表面液化，水珠挂在外侧；现象②中车内开暖风，车内水蒸气多且温度高，碰到被车外严寒冷却的挡风玻璃，水珠出现在<b>内表面</b>。口诀：水珠总出现在温度较高、水蒸气较多的一侧。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'空调房与暖风车窗玻璃出汗位置对比' },

  { id:'c3s3b002', ch:3, sec:3,
    kp:['evaporate'], type:'blank', diff:1, freq:3, points:6,
    stem:'周末，小雨把洗好的校服晾在阳台上：她用衣架把衣服完全撑开，挂在既能晒到太阳、又常有穿堂风的位置。请根据影响蒸发快慢的因素填空。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'晾衣做法分别利用了影响蒸发快慢的哪些因素？', blanks:[
      { label:'① 把衣服完全撑开，是因为增大了液体的', answer:['表面积'], unit:'' },
      { label:'② 挂在能晒到太阳的位置，是因为提高了液体的', answer:['温度'], unit:'' },
      { label:'③ 挂在有穿堂风的位置，是因为加快了液体表面的', answer:['空气流动','空气流动速度','气流速度'], unit:'' }],
      analysis:'影响蒸发快慢的三个因素：液体温度越高、表面积越大、表面空气流动越快，蒸发就越快。撑开衣服增大<b>表面积</b>；晒太阳提高<b>温度</b>；穿堂风加快表面<b>空气流动</b>。三条一齐用上，校服干得最快。' }],
    answer:null, analysis:null, src:'original',
    scene:'阳台撑开晾晒校服' },

  { id:'c3s3b003', ch:3, sec:3,
    kp:['boil-pressure','liquefy'], type:'blank', diff:1, freq:4, points:6,
    stem:'妈妈用高压锅炖排骨：锅体密封，加热时锅内水面上方的气压比外界大气压高，炖熟食物比普通锅快得多。限压阀被顶起时，阀口还会冒出一团“白气”。请填空并选择。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 气压对沸点的影响：', blanks:[
        { label:'锅内气压增大，水的沸点', answer:['升高','变大','变高'], unit:'' }],
        analysis:'液体的沸点随气压增大而<b>升高</b>。高压锅内气压高于外界大气压，水的沸点升高到 100℃ 以上，食物在更高的温度下炖煮，熟得更快。' },
      { kind:'choice', q:'② 高压锅炖食物更快，根本原因是？',
        opts:['锅内水的沸点升高，食物在更高温度下被炖煮','锅内气压大，把食物“压”熟了','锅内水蒸发更快，带走热量更多','锅壁更厚，保温效果更好'], answer:0,
        analysis:'炖煮快慢取决于食物所处的温度。锅内气压升高使沸点升高，水沸腾时温度高于 100℃，食物在更高温度下熟得快。气压本身并不直接“压熟”食物，故 A 正确。' },
      { kind:'blank', q:'③ 限压阀口的“白气”：', blanks:[
        { label:'“白气”是水蒸气遇冷发生哪种物态变化形成的小水珠', answer:['液化'], unit:'' }],
        analysis:'从阀口冲出的高温水蒸气是无色透明的，遇到外面较冷的空气放热<b>液化</b>成大量小水珠，悬浮在空中就是我们看到的“白气”。' }],
    answer:null, analysis:null, src:'original',
    scene:'高压锅炖排骨与限压阀白气' },

  { id:'c3s3b004', ch:3, sec:3,
    kp:['melt-boil-exp'], type:'experiment', diff:1, freq:5, points:8,
    stem:'小舟小组用烧杯、铁架台、石棉网、酒精灯和温度计探究水沸腾时温度变化的特点。从水温 90℃ 起，每隔 1 min 记录一次温度，直到水持续沸腾，记录结果见下表。请依据数据回答。',
    note:'配图为程序化绘制的数据表简图。', fig:'boilDataTable',
    parts:[
      { kind:'blank', q:'① 水的沸点：', blanks:[
        { label:'本实验中水的沸点是', answer:['99'], unit:'℃' }],
        analysis:'从第 5 min 起温度保持 99℃ 不再升高，且水持续吸热、剧烈汽化，说明水已沸腾，沸点为 <b>99℃</b>。' },
      { kind:'blank', q:'② 开始沸腾的时刻：', blanks:[
        { label:'水从第几分钟开始沸腾', answer:['5','第5'], unit:'min' }],
        analysis:'第 5 min 起温度到达 99℃ 并保持不变，沸腾从第 <b>5</b> min 开始。' },
      { kind:'choice', q:'③ 水沸腾过程中温度的特点：',
        opts:['持续吸热，但温度保持不变','持续吸热，温度也持续升高','不再吸热，温度保持不变','吸热越来越少，温度缓慢下降'], answer:0,
        analysis:'沸腾是剧烈的汽化现象，需要持续吸热；但表中第 5~8 min 温度始终停在 99℃，说明沸腾过程<b>吸热而温度不变</b>，吸收的热量全部用于把水变成水蒸气。' },
      { kind:'choice', q:'④ 关于烧杯内气泡的观察，沸腾时的特征是：',
        opts:['气泡在上升过程中越来越大，到水面破裂','气泡在上升过程中越来越小，未到水面就消失','水面平静，完全没有气泡','只有杯底附着许多小气泡，不上升'], answer:0,
        analysis:'沸腾前，上层水温较低，气泡上升途中水蒸气重新液化，气泡越来越小（B 是沸腾前的特征）；沸腾时上下水温一致且都在沸点，气泡上升途中不断有水汽化补充，<b>气泡越来越大</b>，到水面破裂放出水蒸气。' }],
    answer:null, analysis:null, src:'original',
    scene:'烧杯探究水沸腾温度特点' },

  { id:'c3s3b005', ch:3, sec:3,
    kp:['melt-boil-curve','melt-boil-exp','boil-pressure'], type:'experiment', diff:3, freq:5, points:8,
    stem:'甲、乙两个小组在同一间教室里、用完全相同的装置同时加热水做沸腾实验，两杯水的初温相同，只有水量不同。两组各自把数据描点画成了温度—时间图像，合画在同一坐标系中，见下图（A、B 为两条图线）。请依据图像综合分析。',
    note:'配图为程序化绘制的两族沸腾曲线简图。', fig:'boilCurves2',
    parts:[
      { kind:'blank', q:'① 沸点读数：', blanks:[
        { label:'两组实验中水的沸点都是', answer:['98'], unit:'℃' }],
        analysis:'两条图线各自的水平平台都停在 98℃，平台对应的温度就是沸点，故沸点为 <b>98℃</b>。同地同气压下，沸点与水量无关，两组相同。' },
      { kind:'choice', q:'② 由沸点数值可以对当地气压作出什么判断？',
        opts:['当地大气压低于 1 标准大气压，因为水的沸点低于 100℃','当地大气压高于 1 标准大气压，因为水加热后温度升高了','当地大气压恰好等于 1 标准大气压','气压与沸点无关，无法判断'], answer:0,
        analysis:'1 标准大气压下水的沸点是 100℃；气压越低，沸点越低。实验中沸点只有 98℃，低于 100℃，说明当地大气压<b>低于 1 标准大气压</b>。' },
      { kind:'choice', q:'③ 哪一组用的水更多？判断依据是什么？',
        opts:['A 图线那组——相同热源下加热到沸腾用时更长，说明水的质量更大','B 图线那组——它先沸腾，说明水更多','两组一样多——初温相同','无法从图像判断'], answer:0,
        analysis:'两组装置相同、热源相同，单位时间供给的热量相等。A 图线从开始加热到进入平台（沸腾）用了 8 min，B 只用了 4 min；升高相同的温度，加热时间越长说明吸收热量越多、水的质量越大，故 <b>A 图线那组水量更多</b>。' },
      { kind:'blank', q:'④ 沸腾过程的特点：', blanks:[
        { label:'沸腾过程中水持续吸热，温度', answer:['不变','保持不变'], unit:'' }],
        analysis:'两条图线的平台段都是水平线：水沸腾后虽然持续吸热，温度却<b>保持不变</b>，吸收的热量全部用于汽化。' }],
    answer:null, analysis:null, src:'original',
    scene:'双组水量不同沸腾图像对比' },

  { id:'c3s3b006', ch:3, sec:3,
    kp:['liquefy','phase-change'], type:'experiment', diff:1, freq:5, points:6,
    stem:'水烧开后，小凡观察壶嘴上方：紧挨壶嘴的一小段几乎透明、看不到“白气”，离壶嘴稍远的地方反而“白气”更浓。他又把一块干燥而凉的玻璃片举到“白气”中，一会儿玻璃片变得潮湿了。请分析回答。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① “白气”的本质：', blanks:[
        { label:'“白气”其实是悬浮的大量', answer:['小水珠','小水滴'], unit:'' },
        { label:'它是壶里冒出的水蒸气遇冷发生哪种物态变化形成的', answer:['液化'], unit:'' }],
        analysis:'水蒸气本身是无色透明、看不见的。壶嘴冒出的高温水蒸气离开壶嘴后遇冷空气放热，<b>液化</b>成大量<b>小水珠</b>悬浮在空中，这才是看到的“白气”。' },
      { kind:'choice', q:'② 紧挨壶嘴处反而看不到“白气”，原因是：',
        opts:['壶嘴附近温度高，水蒸气还没有放冷液化，仍是看不见的气体','壶嘴附近的水蒸气太少','“白气”比空气重，都沉到了下方','壶嘴处的水蒸气发生的是升华'], answer:0,
        analysis:'液化需要水蒸气遇冷。紧挨壶嘴的一段空气被壶嘴烤得很热，水蒸气温度高、无法放热液化，仍以气态存在，所以看不见；离壶嘴越远气温越低，液化越明显，“白气”越浓。故 A 正确。' },
      { kind:'choice', q:'③ 凉玻璃片变潮湿，这一现象说明了什么？',
        opts:['说明“白气”是液态的小水珠，碰到更冷的玻璃片进一步聚集成大些的水珠','说明玻璃片自己在渗水','说明水蒸气是白色的气体','说明玻璃片发生了熔化'], answer:0,
        analysis:'玻璃片干燥而凉，“白气”中的小水珠碰到它放热聚集，片上变得潮湿——直接证明“白气”由<b>液态小水珠</b>组成，而不是气态水蒸气。' }],
    answer:null, analysis:null, src:'original',
    scene:'壶嘴白气位置观察与玻璃片验证' },

  { id:'c3s3b007', ch:3, sec:3,
    kp:['thermometer'], type:'calc', diff:2, freq:4, points:6,
    stem:'小航家里有一支刻度均匀但示数不准的老温度计：把它插入冰水混合物中，示数为 4℃；插入 1 标准大气压下的沸水中，示数为 94℃。他用这支温度计测一杯温水，示数为 31℃。请计算：',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 温水的实际温度：', blanks:[
        { label:'这杯温水的实际温度是', answer:['30','30℃'], unit:'℃' }],
        analysis:'冰水混合物实际 0℃、沸水实际 100℃，对应示数 4℃ 和 94℃，即示数上 (94−4)=90 格代表实际 100℃，每格代表 100/90 = 10/9 ℃。示数 31℃ 距起点格数 31−4 = 27 格，实际温度 = 27 × 10/9 = <b>30℃</b>。' },
      { kind:'blank', q:'② 示数恰好等于实际值的温度：', blanks:[
        { label:'当实际温度为多少摄氏度时，这支温度计的示数恰好与实际温度相等', answer:['40','40℃'], unit:'℃' }],
        analysis:'设实际温度（也是示数）为 t：(t−4) × 10/9 = t，即 10(t−4) = 9t，10t−40 = 9t，解得 t = <b>40℃</b>。验证：示数 40 距起点 36 格，36 × 10/9 = 40℃，相符。' }],
    answer:null, analysis:null, src:'original',
    scene:'示数不准老温度计校正计算' },

  { id:'c3s3b008', ch:3, sec:3,
    kp:['phase-change'], type:'blank', diff:1, freq:5, points:6,
    stem:'清晨的早市上：① 热汤面出锅，碗口上方飘着一团“白气”；② 摊主把一盆水泼在摊位前的地面上，过一会儿地面就干了；③ 冷饮杯里的冰块越来越小。请写出这三个现象对应的物态变化名称。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'三个现象各属于哪种物态变化？', blanks:[
      { label:'① 碗口的“白气”', answer:['液化'], unit:'' },
      { label:'② 地面上的水变干', answer:['汽化','蒸发'], unit:'' },
      { label:'③ 杯里的冰块越来越小', answer:['熔化'], unit:'' }],
      analysis:'① “白气”是热汤冒出的水蒸气遇冷<b>液化</b>成的小水珠；② 地面上的水变成水蒸气散到空气中，属于<b>汽化</b>（蒸发是汽化的一种方式）；③ 冰吸热变成水，由固态变液态，属于<b>熔化</b>。' }],
    answer:null, analysis:null, src:'original',
    scene:'早市摊位三种水的现象辨析' },

  { id:'c3s3b009', ch:3, sec:3,
    kp:['evaporate'], type:'experiment', diff:2, freq:3, points:8,
    stem:'小林想探究蒸发快慢与哪些因素有关。他取三块相同的玻璃片，各滴一滴质量相同的水：甲片放在室内无风处；乙片放在室内无风处、旁边用小风扇对着吹；丙片放在加热台上（温度较高）、周围空气静止。观察三滴水消失的先后。装置见下图。',
    note:'配图为程序化绘制的三组对比装置简图。', fig:'evapSets',
    parts:[
      { kind:'choice', q:'① 要探究蒸发快慢与液体温度的关系，应对比哪两片？',
        opts:['甲和丙','甲和乙','乙和丙','任意两片都可以'], answer:0,
        analysis:'探究温度因素时，只能让温度不同、其他条件（空气流动、表面积、水量）全部相同：甲（室温、无风）与丙（温度高、无风）恰好只差温度，应选<b>甲和丙</b>。' },
      { kind:'blank', q:'② 甲、乙对比探究的因素：', blanks:[
        { label:'对比甲和乙，探究的是蒸发快慢与液体表面什么因素的关系', answer:['空气流动','空气流动速度','空气流速','气流速度'], unit:'' }],
        analysis:'甲无风、乙有风扇吹，两片温度和水量都相同，唯一不同的是液体表面的<b>空气流动</b>快慢，所以甲乙对比探究蒸发与空气流动速度的关系。' },
      { kind:'choice', q:'③ 本实验每次只让一个因素不同、其余因素保持相同，这种方法叫：',
        opts:['控制变量法','理想实验法','类比法','放大法'], answer:0,
        analysis:'多个因素可能影响蒸发快慢时，每次只改变一个因素、控制其余因素不变，逐一研究，这是物理学中常用的<b>控制变量法</b>。' },
      { kind:'choice', q:'④ 若想再探究蒸发快慢与液体表面积的关系，应增加的操作是：',
        opts:['另取一片玻璃，把一滴同样质量的水摊开，与甲片在同样无风、同温条件下对比','把甲片的水换成酒精再实验','把乙片的风扇调到更大挡位','把丙片的加热温度调得更高'], answer:0,
        analysis:'探究表面积因素，应控制温度、空气流动、水量都相同，只让表面积不同：取同样一滴水<b>摊开</b>增大表面积，与甲（水滴自然鼓起、表面积小）在同温无风条件下对比即可。其余选项改变的是别的因素。' }],
    answer:null, analysis:null, src:'original',
    scene:'玻璃片三组水滴蒸发控制变量探究' },

  { id:'c3s3b010', ch:3, sec:3,
    kp:['evaporate','phase-change'], type:'calc', diff:1, freq:3, points:6,
    stem:'体育课结束后，小宇把毛巾浸透水再拧干擦脸。他称了一下：干毛巾的质量是 150 g，浸透拧好后整条湿毛巾的质量是 550 g。他把湿毛巾挂在通风处，一段时间后整条毛巾的质量变为 200 g。请计算：',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 浸水拧好后毛巾吸收的水：', blanks:[
        { label:'毛巾里吸收的水的质量是', answer:['400','400g'], unit:'g' }],
        analysis:'吸收的水 = 湿毛巾总质量 − 干毛巾质量 = 550 g − 150 g = <b>400 g</b>。' },
      { kind:'blank', q:'② 晾晒过程中蒸发掉的水：', blanks:[
        { label:'这段时间里蒸发掉的水的质量是', answer:['350','350g'], unit:'g' }],
        analysis:'蒸发掉的水 = 晾晒前总质量 − 晾晒后总质量 = 550 g − 200 g = <b>350 g</b>。（此时毛巾里还剩 200 g − 150 g = 50 g 水，所以还没完全干。）' },
      { kind:'choice', q:'③ 毛巾里的水变成水蒸气跑掉，属于哪种物态变化？',
        opts:['汽化','液化','熔化','凝华'], answer:0,
        analysis:'液态水变成气态水蒸气，属于<b>汽化</b>；发生在液体表面、在任何温度下缓慢进行的汽化叫蒸发。汽化要吸热，这也是湿毛巾能带来凉意的原因。' }],
    answer:null, analysis:null, src:'original',
    scene:'体育课湿毛巾晾晒质量差计算' },

  { id:'c3s4b001', ch:3, sec:4,
    kp:['phase-change','liquefy'], type:'choice', diff:1, freq:5, points:3,
    stem:'生日派对上，小杰把几块干冰放进盛着温水的大玻璃杯里：杯中立刻翻腾起大量白色雾气，雾气还顺着杯壁往下“流”，像小瀑布一样垂到桌面上。下列关于白色雾气的说法正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'杯中翻腾的白色雾气是怎样形成的？',
      opts:['干冰升华时从周围吸收大量热，使空气中的水蒸气遇冷液化成大量小水珠','干冰升华变成的二氧化碳气体就是白雾','温水剧烈沸腾溅起的细小水花','干冰先熔化成液体、再汽化形成的气体'], answer:0,
      analysis:'干冰是固态二氧化碳，常温常压下直接<b>升华</b>成气体并吸收大量热，使周围温度骤降；空气中的水蒸气遇冷<b>液化</b>成大量小水珠，这才是看到的白雾——它不是二氧化碳气体（无色），也不是水花。白雾温度低、密度比空气大，所以会下沉“流淌”。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'生日派对干冰杯白雾瀑布效果' },

  { id:'c3s4b002', ch:3, sec:4,
    kp:['phase-change'], type:'choice', diff:1, freq:5, points:3,
    stem:'一种休闲零食“冻干水果”的制作过程是：先把新鲜水果速冻，让果肉里的水全部结成冰；再把冻硬的水果放进真空低温舱里，冰不经熔化直接变成水蒸气被抽走，水果就变得又轻又脆。制作中水经历的物态变化依次是：',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'冻干过程中，水先后经历的两种物态变化是？',
      opts:['凝固和升华','熔化和汽化','升华和液化','凝固和熔化'], answer:0,
      analysis:'第一步：液态水冻成固态冰，是<b>凝固</b>（放热）；第二步：冰不经过液态直接变成水蒸气，是<b>升华</b>（吸热）。低温真空环境让升华在较低温度下也能进行，果肉细胞不被高温破坏，营养和形状都保留下来。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'冻干水果零食制作工艺' },

  { id:'c3s4b003', ch:3, sec:4,
    kp:['phase-change'], type:'blank', diff:1, freq:5, points:6,
    stem:'数九寒天的东北：① 清晨屋外瓦片上结了一层白霜；② 挂在院子里冻得硬邦邦的湿衣服，过了几天也慢慢干了；③ 屋里窗玻璃上开出了漂亮的“冰花”。请填空。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'三个现象分别对应什么物态变化或位置？', blanks:[
      { label:'① 霜是空气中的水蒸气遇冷直接变成小冰晶，属于', answer:['凝华'], unit:'' },
      { label:'② 冰冻的衣服变干，是冰直接变成水蒸气，属于', answer:['升华'], unit:'' },
      { label:'③ 冰花结在窗玻璃的哪一侧', answer:['内','内侧','里面'], unit:'' }],
      analysis:'① 水蒸气不经过液态直接变成固态小冰晶，是<b>凝华</b>（放热）；② 冰不熔化直接变成水蒸气，是<b>升华</b>（吸热），所以冰冻的衣服也会慢慢变干；③ 凝华需要水蒸气遇足够冷的表面——寒冬屋内暖和、水蒸气多，屋外空气干冷且水蒸气极少，所以冰花开在玻璃<b>内侧</b>。' }],
    answer:null, analysis:null, src:'original',
    scene:'数九寒天东北瓦霜冻衣与窗冰花' },

  { id:'c3s4b004', ch:3, sec:4,
    kp:['phase-change'], type:'choice', diff:1, freq:5, points:3,
    stem:'下面是四个常见现象：① 衣柜里的樟脑丸放久了越来越小，衣服上却没有留下任何湿迹；② 冰箱冷冻室的内壁上结了一层白霜；③ 初冬清晨草地上出现露水；④ 从冰箱取出的冰镇饮料瓶外壁很快“出汗”。其中属于凝华现象的是：',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'四个现象中，属于凝华的是哪些？',
      opts:['只有②','①和②','②和③','③和④'], answer:0,
      analysis:'凝华：气态直接变成固态。② 冷冻室里的水蒸气碰到极冷的内壁直接变成小冰晶（白霜），是<b>凝华</b>；① 樟脑丸由固态直接变气态跑掉，是升华；③ 露是水蒸气液化成的小水珠；④ 瓶壁“出汗”是空气中水蒸气遇冷液化成的小水珠。故只有②是凝华，选 A。' }],
    answer:null, analysis:null, src:'original',
    scene:'樟脑丸冰箱霜露与饮料瓶四现象辨析' }
];

/* ===== 程序化插图（确定性 SVG，无随机数） ===== */
const QBANK_C3B_ORIG_FIGS = {
  boilDataTable: function() {
    const times = [0,1,2,3,4,5,6,7,8];
    const temps = [90,92,94,96,98,99,99,99,99];
    const padL = 52, padT = 40, cw = 44, rh = 24;
    const xOf = i => padL + 46 + i * cw;
    const rowY = r => padT + 12 + r * rh;
    let s = `<rect x="${padL}" y="${padT}" width="${46 + times.length * cw}" height="${2 * rh}" fill="none" stroke="#6b7686" stroke-width="1.5"/>`;
    s += `<line x1="${padL + 46}" y1="${padT}" x2="${padL + 46}" y2="${padT + 2 * rh}" stroke="#6b7686" stroke-width="1"/>`;
    s += `<line x1="${padL}" y1="${rowY(1) - rh / 2 + rh / 2}" x2="${padL + 46 + times.length * cw}" y2="${padT + rh}" stroke="#6b7686" stroke-width="1"/>`;
    times.forEach((t, i) => {
      if (i > 0) s += `<line x1="${xOf(i) - cw / 2}" y1="${padT}" x2="${xOf(i) - cw / 2}" y2="${padT + rh}" stroke="#6b7686" stroke-width=".8" opacity=".6"/>`;
      s += `<text x="${xOf(i)}" y="${rowY(0) + 5}" fill="#d7dee9" font-size="12" text-anchor="middle">${t}</text>`;
      s += `<text x="${xOf(i)}" y="${rowY(1) + 5}" fill="#d7dee9" font-size="12" text-anchor="middle">${temps[i]}</text>`;
    });
    s += `<text x="${padL + 23}" y="${rowY(0) + 5}" fill="#9aa4b5" font-size="11" text-anchor="middle">时间</text>`;
    s += `<text x="${padL + 23}" y="${rowY(1) + 5}" fill="#9aa4b5" font-size="11" text-anchor="middle">温度/℃</text>`;
    s += `<text x="${padL + 23}" y="${padT - 12}" fill="#d7dee9" font-size="12" text-anchor="middle" font-weight="700">min</text>`;
    return `<svg viewBox="0 0 480 120" role="img" aria-label="水沸腾实验记录数据表">${s}</svg>`;
  },
  boilCurves2: function() {
    const padL = 44, padR = 20, padT = 24, padB = 44;
    const W = 380, H = 230;
    const x0 = padL, x1 = W - padR, y0 = H - padB, y1 = padT;
    const tMax = 12, TMin = 90, TMax = 100;
    const xFor = t => x0 + (t / tMax) * (x1 - x0);
    const yFor = T => y0 - ((T - TMin) / (TMax - TMin)) * (y0 - y1);
    let s = `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="#6b7686" stroke-width="1.5"/>`;
    s += `<line x1="${x0}" y1="${y1}" x2="${x0}" y2="${y0}" stroke="#6b7686" stroke-width="1.5"/>`;
    s += `<text x="${x1}" y="${y0 + 18}" fill="#9aa4b5" font-size="11" text-anchor="end">时间/min</text>`;
    s += `<text x="14" y="${y1 + 8}" fill="#9aa4b5" font-size="11">温度/℃</text>`;
    for (let t = 0; t <= 12; t += 2) {
      const x = xFor(t);
      s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + 5}" stroke="#6b7686" opacity=".8"/>`;
      s += `<text x="${x}" y="${y0 + 18}" fill="#9aa4b5" font-size="10" text-anchor="middle">${t}</text>`;
    }
    for (let T = 90; T <= 100; T += 2) {
      const y = yFor(T);
      s += `<line x1="${x0}" y1="${y}" x2="${x0 - 6}" y2="${y}" stroke="#6b7686"/>`;
      s += `<text x="${x0 - 10}" y="${y + 4}" fill="#9aa4b5" font-size="10" text-anchor="end">${T}</text>`;
    }
    const A = [[0,90],[2,92],[4,94],[6,96],[8,98],[12,98]];
    const B = [[0,90],[1,92],[2,94],[3,96],[4,98],[12,98]];
    const poly = (pts, color) => `<polyline points="${pts.map(([t,T]) => `${xFor(t)},${yFor(T)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += poly(A, '#ffd479');
    s += poly(B, '#5ad7ff');
    s += `<line x1="${x0}" y1="${yFor(98)}" x2="${x1}" y2="${yFor(98)}" stroke="#9aa4b5" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>`;
    s += `<text x="${xFor(10.6)}" y="${yFor(98) - 8}" fill="#ffd479" font-size="12" font-weight="700" text-anchor="middle">A</text>`;
    s += `<text x="${xFor(10.6)}" y="${yFor(98) + 16}" fill="#5ad7ff" font-size="12" font-weight="700" text-anchor="middle">B</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="甲乙两组水沸腾温度时间图像">${s}</svg>`;
  },
  evapSets: function() {
    const plate = (cx, label, sub, dropRx, heat) => {
      let g = `<g>`;
      g += `<ellipse cx="${cx}" cy="110" rx="42" ry="9" fill="none" stroke="#9aa4b5" stroke-width="2"/>`;
      g += `<ellipse cx="${cx}" cy="106" rx="${dropRx}" ry="4" fill="#5ad7ff" opacity=".55"/>`;
      if (heat) {
        g += `<rect x="${cx - 46}" y="126" width="92" height="16" rx="3" fill="none" stroke="#ff7a6e" stroke-width="2"/>`;
        g += `<path d="M ${cx - 14},122 q 3,-6 0,-10 M ${cx},122 q 3,-7 0,-12 M ${cx + 14},122 q 3,-6 0,-10" fill="none" stroke="#ff7a6e" stroke-width="1.6" stroke-linecap="round"/>`;
      }
      g += `<text x="${cx}" y="170" fill="#d7dee9" font-size="13" text-anchor="middle" font-weight="700">${label}</text>`;
      g += `<text x="${cx}" y="188" fill="#9aa4b5" font-size="11" text-anchor="middle">${sub}</text>`;
      g += `</g>`;
      return g;
    };
    let fan = `<g>`;
    fan += `<rect x="196" y="30" width="34" height="26" rx="4" fill="none" stroke="#ffd479" stroke-width="2"/>`;
    fan += `<circle cx="213" cy="43" r="8" fill="none" stroke="#ffd479" stroke-width="1.6"/>`;
    fan += `<path d="M 213,60 v14 M 204,74 h18" stroke="#ffd479" stroke-width="2" fill="none"/>`;
    fan += `<path d="M 236,38 q 8,5 0,10 M 244,36 q 10,7 0,14" fill="none" stroke="#ffd479" stroke-width="1.4" stroke-linecap="round"/>`;
    fan += `<text x="213" y="22" fill="#9aa4b5" font-size="10" text-anchor="middle">小风扇</text>`;
    fan += `</g>`;
    return `<svg viewBox="0 0 420 200" role="img" aria-label="甲乙丙三片玻璃片水滴蒸发对比装置简图">
      ${plate(80, '甲', '室内无风处', 7, false)}
      ${plate(213, '乙', '室内·风扇吹', 7, false)}
      ${plate(346, '丙', '加热台·空气静止', 7, true)}
      ${fan}
    </svg>`;
  }
};

if(typeof window!=="undefined"){window.QBANK_C3B_ORIG=QBANK_C3B_ORIG;window.QBANK_C3B_ORIG_FIGS=QBANK_C3B_ORIG_FIGS;}

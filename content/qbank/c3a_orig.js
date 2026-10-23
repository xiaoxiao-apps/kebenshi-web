/* c3 题库 · P2 原创生产 · 2026-10-24 · c3a（s1温度 + s2熔化和凝固）原创15题 */
const QBANK_C3A_ORIG = [

  { id:'c3s1b001', ch:3, sec:1,
    kp:['thermometer'], type:'choice', diff:1, freq:4, points:3,
    stem:'实验课上，小珂要用实验室温度计测量一杯温水的温度。下列做法正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'关于测量过程，下列说法正确的是',
      opts:['温度计的玻璃泡全部浸入水中，且不接触烧杯底和杯壁，待示数稳定后再读数',
            '为了方便看清刻度，把温度计从水中拿出来，举到眼前仔细读数',
            '玻璃泡一浸入水中就立刻读数，免得水温发生变化',
            '读数时视线可以斜着看液柱上表面，只要看清刻度就行'],
      answer:0,
      analysis:'实验室温度计的使用规则：玻璃泡要<b>全部浸入</b>被测液体中，不碰容器底和容器壁；浸入后要<b>等示数稳定</b>再读数；读数时玻璃泡<b>不能离开</b>被测液体（实验室温度计没有缩口，离开后示数会变），视线要与液柱上表面<b>相平</b>。B、C、D 都违反规则。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'实验室测温水温度的操作规范' },

  { id:'c3s1b002', ch:3, sec:1,
    kp:['thermometer'], type:'choice', diff:1, freq:4, points:3,
    stem:'妈妈给发烧的小诺测体温：测量前她先把体温计用力甩了几下，测量后把体温计从腋下取出来读数。关于体温计，下列说法正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'关于体温计的原理和使用，下列说法正确的是',
      opts:['体温计玻璃泡上方有一段很细的缩口，离开人体后液柱在缩口处断开，示数不变，所以可以取出来读数',
            '使用前用力甩几下，是为了把玻璃管壁上储存的热量甩掉',
            '体温计的量程足够宽，也可以用来测量沸水的温度',
            '体温计取出后如果不马上读数，示数会迅速下降到室温'],
      answer:0,
      analysis:'体温计的特殊构造是玻璃泡上方的<b>缩口</b>：水银受热膨胀能通过缩口上升，遇冷收缩时液柱在缩口处断开，使示数保持在最高值，因此可以离开人体读数。使用前甩几下是让升上去的水银<b>回到玻璃泡</b>，不是甩热量；体温计量程只有 35~42℃，<b>不能</b>测沸水；取出后由于缩口存在，示数不会自行下降。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'家用体温计测体温与缩口原理' },

  { id:'c3s1b003', ch:3, sec:1,
    kp:['thermometer'], type:'blank', diff:1, freq:4, points:4,
    stem:'初冬的清晨，小岚用挂在院墙上的一支寒暑表记录气温（见图，单位为摄氏度）。请读出此时寒暑表的示数，并写出常用液体温度计的制作原理。',
    note:'配图为程序化简图。', fig:'hanShuBiao',
    parts:[{ kind:'blank', q:'读数与原理', blanks:[
      { label:'寒暑表示数', answer:['-14','负14','零下14','负14摄氏度','零下14摄氏度','-14℃'], unit:'℃' },
      { label:'制作原理', answer:['热胀冷缩','液体的热胀冷缩','液体热胀冷缩','液体受热膨胀遇冷收缩'], unit:'' }],
      analysis:'图中温度计每小格代表 1℃，每 10℃ 标一个数字。液柱上表面停在 0℃ 下方第 14 小格处，示数为 <b>-14℃</b>，读作“零下14摄氏度”（负温度要先看液柱在 0℃ 刻线下方）。常用液体温度计是根据液体<b>热胀冷缩</b>的性质制成的。' }],
    answer:null, analysis:null, src:'original', scene:'初冬清晨用寒暑表记录气温' },

  { id:'c3s1b004', ch:3, sec:1,
    kp:['thermometer'], type:'experiment', diff:1, freq:4, points:8,
    stem:'物理社团制作了一支液体温度计：装满红色水的小瓶用橡皮塞密封，塞上插一根细玻璃管。现在要给玻璃管标定摄氏温标，请把下面的标定步骤补充完整。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 标 0℃：把装置放入____中，待液柱稳定后，在液面位置标上 0℃。', blanks:[
        { label:'①处应填', answer:['冰水混合物','冰水混合','冰和水混合'], unit:'' }],
        analysis:'摄氏温标规定：<b>冰水混合物</b>的温度为 0℃。' },
      { kind:'blank', q:'② 标 100℃：把装置放入____下的沸水中，待液柱稳定后，在液面位置标上 100℃。', blanks:[
        { label:'②处应填', answer:['标准大气压','1个标准大气压','一个标准大气压'], unit:'' }],
        analysis:'摄氏温标规定：<b>标准大气压</b>下沸水的温度为 100℃。' },
      { kind:'blank', q:'③ 分度：把 0℃ 与 100℃ 两标记之间的距离____，每一等份就是 1℃。', blanks:[
        { label:'③处应填', answer:['均匀分成100等份','平均分成100等份','等分成100份','均匀分成一百等份'], unit:'' }],
        analysis:'0℃ 到 100℃ 之间共 100 摄氏度，把这段距离<b>均匀分成 100 等份</b>，每份代表 1℃。' },
      { kind:'blank', q:'④ 这支温度计能指示温度，是利用了瓶内液体____的性质。', blanks:[
        { label:'④处应填', answer:['热胀冷缩','受热膨胀遇冷收缩'], unit:'' }],
        analysis:'温度升高时瓶内液体膨胀、液柱上升；温度降低时液体收缩、液柱下降——利用的是液体<b>热胀冷缩</b>的性质。' } ],
    answer:null, analysis:null, src:'original', scene:'社团自制温度计标定刻度' },

  { id:'c3s1b005', ch:3, sec:1,
    kp:['thermometer'], type:'calc', diff:2, freq:4, points:6,
    stem:'学校器材室里有一支旧温度计，它的刻度整体发生了偏移，但刻度线仍然均匀：把它放入冰水混合物中，示数为 6℃；放入标准大气压下的沸水中，示数为 98℃。请计算：<br>(1) 用这支温度计测某杯水，示数为 29℃，这杯水的实际温度是多少？<br>(2) 用它测实际温度为 50℃ 的热水，温度计的示数会是多少？',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'(1) 实际温度', blanks:[
        { label:'实际温度', answer:['25','25℃','25摄氏度'], unit:'℃' }],
        analysis:'这支温度计示数从 6℃ 到 98℃ 共 (98−6)=92 个小格，对应实际温度 0~100℃，所以每小格代表 100÷92 ℃。示数 29℃ 比 6℃ 高出 (29−6)=23 格，实际温度 = 23÷92×100℃ = <b>25℃</b>。' },
      { kind:'blank', q:'(2) 温度计示数', blanks:[
        { label:'温度计示数', answer:['52','52℃','52摄氏度'], unit:'℃' }],
        analysis:'实际温度 50℃ 是 0~100℃ 的一半，液柱应停在 6℃ 与 98℃ 两刻线的正中间：示数 = 6 + (98−6)×(50÷100) = 6 + 46 = <b>52℃</b>。' } ],
    answer:null, analysis:null, src:'original', scene:'器材室刻度偏移旧温度计的校正' },

  { id:'c3s2b006', ch:3, sec:2,
    kp:['crystal'], type:'choice', diff:1, freq:3, points:3,
    stem:'实验室整理时，同学们在器材架上找到这些材料：冰块、海波、锡粒、松香、石蜡、碎玻璃。若按“熔化时有没有确定的熔化温度”把它们分成两类，下列分组正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'正确的分组是',
      opts:['冰块、海波、锡粒为一类（熔化时温度不变），松香、石蜡、碎玻璃为另一类（熔化时持续变软、温度不断升高）',
            '冰块、松香、海波为一类，锡粒、石蜡、碎玻璃为另一类',
            '锡粒、石蜡、冰块为一类，海波、松香、碎玻璃为另一类',
            '六种材料熔化时都有确定的熔化温度，无法分成两类'],
      answer:0,
      analysis:'有确定熔化温度的固体是<b>晶体</b>：冰、海波、锡（各种金属）都是晶体；没有确定熔化温度、熔化时先变软再变稀的是<b>非晶体</b>：松香、石蜡、玻璃都是非晶体。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'实验室器材架材料分类' },

  { id:'c3s2b007', ch:3, sec:2,
    kp:['phase-change'], type:'choice', diff:1, freq:5, points:3,
    stem:'炎炎夏日，小甜把晾凉的开水倒进冰格，放入冰箱冷冻室自制冰棍。几个小时后，冰格里的水变成了硬邦邦的冰块。关于这个过程，下列说法正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'关于水变成冰的过程，下列说法正确的是',
      opts:['这是凝固现象，凝固过程要向外界放热',
            '这是熔化现象，需要不断吸热',
            '这是液化现象，液化过程要放热',
            '只要冷冻室温度够低，水不放热也能结冰'],
      answer:0,
      analysis:'物质从<b>液态变成固态</b>叫凝固，水结冰正是凝固现象；凝固过程必须不断<b>放热</b>——冷冻室温度低，水把热量传给周围，温度降到凝固点并继续放热才会结冰。熔化是固态变液态，液化是气态变液态，B、C 错；任何凝固都要放热，D 错。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'冰箱冷冻室自制冰棍' },

  { id:'c3s2b008', ch:3, sec:2,
    kp:['melt-boil-curve','crystal'], type:'choice', diff:1, freq:5, points:3,
    stem:'手工蜡烛坊里，融化的烛蜡（石蜡）被倒入模具后放在空气中冷却。图中是石蜡冷却时温度随时间变化的图像。依据图像，下列说法正确的是哪一项？',
    note:'配图为程序化简图（只画条件曲线，不含结论标注）。', fig:'waxFreezeCurve',
    parts:[{ kind:'choice', q:'依据图像，下列说法正确的是',
      opts:['图线没有水平段，温度一路下降，说明石蜡没有确定的凝固温度，是非晶体',
            '图线中下降最慢的一段就是凝固过程，可见石蜡凝固时温度几乎不变，是晶体',
            '石蜡冷却时温度不断降低，说明它在凝固过程中不断吸热',
            '由图像可知，石蜡的凝固温度约为 60℃'],
      answer:0,
      analysis:'晶体凝固图像上应有一段<b>水平平台</b>（放热但温度不变，平台温度即凝固点）。图中石蜡的温度随时间<b>持续下降、没有平台</b>，说明它没有确定的凝固温度，属于<b>非晶体</b>；冷却过程整体在放热而不是吸热；没有平台也就谈不上确定的凝固温度。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'手工蜡烛坊石蜡冷却图像' },

  { id:'c3s2b009', ch:3, sec:2,
    kp:['crystal','phase-change'], type:'blank', diff:1, freq:3, points:6,
    stem:'小宇查阅资料得知：标准大气压下，冰是晶体。请完成下面的填空：<br>(1) 标准大气压下冰的熔点是____；<br>(2) 冰在熔化过程中要不断____，此时它的温度____。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'冰的熔化特点', blanks:[
      { label:'冰的熔点', answer:['0','0℃','零摄氏度','0摄氏度'], unit:'℃' },
      { label:'吸放热', answer:['吸热','吸收热量'], unit:'' },
      { label:'温度变化', answer:['保持不变','不变'], unit:'' }],
      analysis:'标准大气压下冰（晶体）的熔点为 <b>0℃</b>。晶体熔化的两个条件：达到熔点、继续<b>吸热</b>；熔化过程中虽持续吸热，温度却<b>保持不变</b>，直到全部熔化成水。' }],
    answer:null, analysis:null, src:'original', scene:'查阅资料认识冰的熔化特点' },

  { id:'c3s2b010', ch:3, sec:2,
    kp:['melt-boil-curve','crystal'], type:'blank', diff:2, freq:5, points:6,
    stem:'实验小组把加热熔化后的海波缓缓冷却，每隔一段时间记录一次温度，描点得到图中所示的温度—时间图像。请依据图像回答：<br>(1) 海波的凝固点是____；<br>(2) 海波的凝固过程大约持续了____min；<br>(3) 凝固过程中海波处于____状态，虽持续放热但温度保持不变。',
    note:'配图为程序化简图（坐标含刻度，不含结论标注）。', fig:'hypoFreezeCurve',
    parts:[{ kind:'blank', q:'读凝固图像', blanks:[
      { label:'凝固点', answer:['48','48℃','48摄氏度'], unit:'℃' },
      { label:'凝固持续时间', answer:['4','4min','4分钟'], unit:'min' },
      { label:'凝固时的状态', answer:['固液共存','固液共存态','固态和液态共存'], unit:'' }],
      analysis:'图像中 4~8 min 出现一段<b>水平平台</b>，说明海波是晶体，凝固时放热而温度不变，平台对应的温度就是凝固点，读坐标轴得 <b>48℃</b>。平台从第 4 min 开始（开始凝固）到第 8 min 结束（全部变成固态），凝固持续 8−4=<b>4 min</b>。平台段海波一部分已凝固、一部分还是液态，处于<b>固液共存</b>状态。' }],
    answer:null, analysis:null, src:'original', scene:'海波熔液冷却凝固曲线' },

  { id:'c3s2b011', ch:3, sec:2,
    kp:['phase-change','liquefy'], type:'blank', diff:2, freq:5, points:6,
    stem:'铸造车间里，工人把高温的铁水浇进模具，冷却后打开模具，就得到一件铁艺雕塑。浇注时模具口附近常冒出一股股白色“雾气”（“雾气”是悬浮在空气中的小水滴）。请完成填空：<br>(1) 铁水变成固态雕塑属于____现象，这个过程要____热；<br>(2) 白色“雾气”是模具附近空气中的水蒸气遇热后又遇冷，____成小水滴形成的。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'铸造中的物态变化', blanks:[
      { label:'铁水变雕塑', answer:['凝固'], unit:'' },
      { label:'吸放热', answer:['放','放热','放出热量'], unit:'' },
      { label:'雾气的形成', answer:['液化'], unit:'' }],
      analysis:'铁水从<b>液态变成固态</b>是凝固现象，凝固要<b>放</b>热。白色“雾气”不是水蒸气（水蒸气看不见），而是空气中气态的水蒸气遇到较冷环境<b>液化</b>成的大量小水滴，液化同样要放热。' }],
    answer:null, analysis:null, src:'original', scene:'铸造车间浇铸铁艺雕塑' },

  { id:'c3s2b012', ch:3, sec:2,
    kp:['melt-boil-exp','phase-change'], type:'experiment', diff:1, freq:5, points:6,
    stem:'小组按下面的做法探究冰的熔化特点：烧杯中放入碎冰，插入温度计，不用酒精灯加热，让冰在室温下自行熔化，每隔相同时间记录一次温度，同时留意烧杯里的情况。请回答下面的问题。',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'(1) 实验选用碎冰而不是大冰块，主要原因是',
        opts:['碎冰与周围空气接触更充分，受热均匀，熔化过程更平稳、便于观察记录',
              '碎冰的温度比大冰块更低，更容易熔化',
              '碎冰不是晶体，熔化更快',
              '大冰块不会熔化'],
        answer:0,
        analysis:'碎冰颗粒小、与空气接触面积大，<b>受热均匀</b>，各部分几乎同时缓慢熔化，温度变化和状态变化都便于观察记录；碎冰和大冰块都是晶体、温度相同。<b>答案：A</b>' },
      { kind:'blank', q:'(2) 冰不用酒精灯加热、在室温下也能熔化，说明冰熔化时需要从周围空气中____。', blanks:[
        { label:'(2)处应填', answer:['吸热','吸收热量'], unit:'' }],
        analysis:'室温高于 0℃，热量从空气传给冰——冰熔化必须<b>吸热</b>，不用酒精灯时空气就是热源。这样做还能让冰熔化得慢，便于记录。' },
      { kind:'blank', q:'(3) 实验中一边看温度计示数，一边还要注意观察烧杯中冰的____变化；每隔相同时间记录一次数据，这样做的目的是____。', blanks:[
        { label:'观察对象', answer:['状态','物态'], unit:'' },
        { label:'等间隔记录的目的', answer:['便于比较相同时间内温度的变化规律','便于找出温度随时间变化的规律','方便描点画出温度时间图像','便于比较温度变化规律'], unit:'' }],
        analysis:'探究熔化特点要同时盯住两条线索：温度计的<b>示数</b>和物质的<b>状态</b>（固态→固液共存→液态）。每隔<b>相同时间</b>记录一次，数据在时间轴上间隔均匀，才便于比较温度变化快慢、描点画出规律图像。' } ],
    answer:null, analysis:null, src:'original', scene:'小组探究冰熔化特点实验' },

  { id:'c3s2b013', ch:3, sec:2,
    kp:['melt-boil-exp','crystal'], type:'experiment', diff:2, freq:5, points:8,
    stem:'小瑞小组想探究“晶体与非晶体熔化规律有什么不同”，选用了海波和石蜡做对比实验：两支相同的试管中分别装入海波和石蜡，一起放进盛有热水的同一烧杯中加热（水浴法），用搅拌器不断搅拌，每隔 1 min 同时记录两支试管中物质的温度。请回答下面的问题。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'(1) 采用水浴法（把试管放进热水中）加热，而不用酒精灯直接烤试管，好处是____。', blanks:[
        { label:'水浴法的好处', answer:['受热均匀','使物质受热均匀','物质受热均匀且温度升高较慢便于记录','受热均匀且升温缓慢'], unit:'' }],
        analysis:'水浴加热时试管四周都被热水包围，物质<b>受热均匀</b>，而且升温比较缓慢，温度变化容易观察、便于逐分钟记录；直接用火焰烤则局部过热、升温太快。' },
      { kind:'blank', q:'(2) 加热过程中要不断用搅拌器搅拌，目的是____。', blanks:[
        { label:'搅拌的目的', answer:['使物质各部分受热均匀','让物质均匀受热','使内部受热均匀'], unit:'' }],
        analysis:'搅拌能让试管内上下、内外的物质温度一致，<b>各部分均匀受热</b>，温度计测到的才是整体的温度。' },
      { kind:'blank', q:'(3) 为了让对比公平，除了用同一杯热水、相同的试管外，还应控制海波和石蜡的____相同（写出一个即可）。', blanks:[
        { label:'应控制的变量', answer:['质量','初温','颗粒大小'], unit:'' }],
        analysis:'对比实验要控制变量：两种物质的<b>质量</b>（或初温、颗粒粗细）应相同，这样温度变化的差异才只由物质种类决定。' },
      { kind:'choice', q:'(4) 实验结果最可能是下列哪一种？',
        opts:['海波熔化时有一段温度保持不变的过程，石蜡熔化时温度持续上升——说明海波是晶体、石蜡是非晶体',
              '石蜡熔化时温度保持不变，海波熔化时温度持续上升——说明石蜡是晶体',
              '两种物质熔化时温度都保持不变，都是晶体',
              '两种物质熔化时温度都持续上升，都不是晶体'],
        answer:0,
        analysis:'海波是晶体，熔化时达到熔点后继续吸热但<b>温度保持不变</b>，图像上有水平平台；石蜡是非晶体，熔化时先变软后变稀，<b>温度持续上升</b>，没有平台。对比结果正好说明两类固体熔化规律不同。<b>答案：A</b>' } ],
    answer:null, analysis:null, src:'original', scene:'海波与石蜡熔化对比实验' },

  { id:'c3s2b014', ch:3, sec:2,
    kp:['crystal','phase-change'], type:'calc', diff:1, freq:3, points:6,
    stem:'爸爸维修电路板时，用电烙铁给焊锡（锡的合金，属晶体，熔点为 232℃）加热。通电后焊锡块的温度从 22℃ 开始上升，平均每分钟约升高 30℃。请计算并回答：<br>(1) 通电后至少经过多少分钟，焊锡才能达到熔点、开始熔化？<br>(2) 焊锡在熔化过程中继续吸热，它的温度将怎样变化？',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'(1) 加热时间', blanks:[
        { label:'所需时间', answer:['7','7min','7分钟'], unit:'min' }],
        analysis:'焊锡要升高的温度：232℃ − 22℃ = 210℃。每分钟升高 30℃，所需时间 t = 210 ÷ 30 = <b>7 min</b>。即通电至少 7 分钟焊锡才达到熔点开始熔化。' },
      { kind:'choice', q:'(2) 熔化过程中焊锡的温度',
        opts:['保持在 232℃ 不变，直到全部熔化完才继续升高',
              '继续不断升高，吸热越多温度越高',
              '先升高后降低',
              '立即降低到室温'],
        answer:0,
        analysis:'焊锡是晶体，熔化时虽然持续<b>吸热</b>，温度却<b>保持在熔点 232℃ 不变</b>，处于固液共存状态；全部熔化后再吸热，液态焊锡的温度才会继续升高。<b>答案：A</b>' } ],
    answer:null, analysis:null, src:'original', scene:'电烙铁焊接电路板加热焊锡' },

  { id:'c3s2b015', ch:3, sec:2,
    kp:['melt-boil-exp','melt-boil-curve'], type:'experiment', diff:3, freq:5, points:8,
    stem:'科技馆“物质的奥秘”展台上，展出一组对某种未知固体持续、均匀加热的实验数据表（见图），每隔 1 min 记录一次温度。请依据数据表完成下面的探究。',
    note:'配图为程序化数据表（只列测量数据，不含结论）。', fig:'mysteryDataTable',
    parts:[
      { kind:'choice', q:'(1) 这种物质是晶体还是非晶体？',
        opts:['是晶体——第 4~8 min 持续吸热但温度保持 80℃ 不变，说明它有确定的熔化温度',
              '是非晶体——加热全程温度都在变化',
              '是非晶体——数据表中有一段时间温度没有升高',
              '仅凭这组数据无法判断'],
        answer:0,
        analysis:'数据表中第 4 min 起温度到达 80℃ 后，第 4~8 min 连续 5 次读数都是 80℃——加热（持续吸热）而温度不变，这段“平台”说明该物质有<b>确定的熔化温度</b>，是<b>晶体</b>。<b>答案：A</b>' },
      { kind:'blank', q:'(2) 这种物质的熔点是____。', blanks:[
        { label:'熔点', answer:['80','80℃','80摄氏度'], unit:'℃' }],
        analysis:'晶体熔化时保持不变的温度就是熔点：平台段温度为 <b>80℃</b>。' },
      { kind:'blank', q:'(3) 熔化过程大约持续了____min。', blanks:[
        { label:'熔化持续时间', answer:['4','4min','4分钟'], unit:'min' }],
        analysis:'第 4 min 温度刚达到 80℃（开始熔化），第 8 min 仍是 80℃、第 9 min 已升到 85℃（熔化结束继续升温），熔化过程约持续 8 − 4 = <b>4 min</b>。' },
      { kind:'choice', q:'(4) 第 7 min 时，物质处于什么状态？',
        opts:['固液共存状态', '全部是固态', '全部是液态', '气态'],
        answer:0,
        analysis:'第 7 min 落在 4~8 min 的平台段内，物质正在熔化：一部分已熔成液态、一部分仍是固态，处于<b>固液共存</b>状态。<b>答案：A</b>' },
      { kind:'blank', q:'(5) 熔化过程中物质持续____热，温度____。', blanks:[
        { label:'吸放热', answer:['吸','吸热','吸收热量'], unit:'' },
        { label:'温度变化', answer:['保持不变','不变'], unit:'' }],
        analysis:'晶体熔化的特点：<b>持续吸热，温度保持不变</b>——吸收的热量全部用于把固态“拆解”成液态，而不是升高温度。' } ],
    answer:null, analysis:null, src:'original', scene:'科技馆未知物质熔化数据表探究' },

];

const QBANK_C3A_ORIG_FIGS = {

  hanShuBiao: function () {
    const cx = 90, topY = 26, bottomY = 190, bulbR = 11, min = -30, max = 50;
    const px = (bottomY - topY) / (max - min);
    const yFor = v => bottomY - (v - min) * px;
    let ticks = '';
    for (let v = min; v <= max; v += 1) {
      const y = yFor(v).toFixed(1);
      const major = v % 10 === 0;
      const x2 = cx + (major ? 19 : 11);
      ticks += `<line x1="${cx + 7}" y1="${y}" x2="${x2}" y2="${y}" stroke="#6b7686" stroke-width="${major ? 1.5 : 1}" opacity="${major ? 1 : .55}"/>`;
      if (major) ticks += `<text x="${cx + 25}" y="${(yFor(v) + 4).toFixed(1)}" fill="#9aa4b5" font-size="11">${v}</text>`;
    }
    const liqTop = yFor(-14);
    return `<svg viewBox="0 0 220 230" role="img" aria-label="寒暑表简图">
      <rect x="${cx - 7}" y="${topY - 4}" width="14" height="${bottomY - topY + 4}" rx="7" fill="none" stroke="#9aa4b5" stroke-width="2"/>
      <circle cx="${cx}" cy="${bottomY}" r="${bulbR}" fill="#e05d5d" stroke="#9aa4b5" stroke-width="2"/>
      <rect x="${cx - 3}" y="${liqTop.toFixed(1)}" width="6" height="${(bottomY - liqTop).toFixed(1)}" fill="#e05d5d"/>
      <line x1="${cx + 7}" y1="${yFor(0).toFixed(1)}" x2="${cx + 26}" y2="${yFor(0).toFixed(1)}" stroke="#5ad7ff" stroke-width="1.5"/>
      ${ticks}
      <text x="110" y="222" fill="#d7dee9" font-size="13" text-anchor="middle" font-weight="700">寒暑表（单位：℃）</text>
    </svg>`;
  },

  waxFreezeCurve: function () {
    const x0 = 52, y0 = 24, w = 300, h = 150, tMax = 12, TMin = 20, TMax = 80;
    const X = t => x0 + t / tMax * w, Y = T => y0 + (TMax - T) / (TMax - TMin) * h;
    const pts = [[0, 75], [2, 62], [4, 52], [6, 44], [8, 37], [10, 32], [12, 28]];
    let path = `M ${X(pts[0][0])},${Y(pts[0][1])}`;
    for (let i = 1; i < pts.length; i++) {
      const [tp, Tp] = pts[i - 1], [tc, Tc] = pts[i];
      const mx = (X(tp) + X(tc)) / 2;
      path += ` C ${mx},${Y(Tp)} ${mx},${Y(Tc)} ${X(tc)},${Y(Tc)}`;
    }
    let xt = '', yt = '';
    for (let t = 0; t <= 12; t += 2) xt += `<line x1="${X(t)}" y1="${y0 + h}" x2="${X(t)}" y2="${y0 + h + 5}" stroke="#6b7686"/><text x="${X(t)}" y="${y0 + h + 18}" fill="#9aa4b5" font-size="10" text-anchor="middle">${t}</text>`;
    for (let T = 20; T <= 80; T += 10) yt += `<line x1="${x0 - 5}" y1="${Y(T)}" x2="${x0}" y2="${Y(T)}" stroke="#6b7686"/><text x="${x0 - 9}" y="${Y(T) + 4}" fill="#9aa4b5" font-size="10" text-anchor="end">${T}</text>`;
    return `<svg viewBox="0 0 390 225" role="img" aria-label="石蜡冷却温度时间图像">
      ${yt}${xt}
      <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + h}" stroke="#9aa4b5" stroke-width="1.5"/>
      <line x1="${x0}" y1="${y0 + h}" x2="${x0 + w}" y2="${y0 + h}" stroke="#9aa4b5" stroke-width="1.5"/>
      <path d="${path}" fill="none" stroke="#ffd479" stroke-width="2.5"/>
      <text x="${x0 + w}" y="${y0 - 8}" fill="#9aa4b5" font-size="11" text-anchor="end">温度/℃</text>
      <text x="${x0 + w + 4}" y="${y0 + h + 18}" fill="#9aa4b5" font-size="11" text-anchor="end">时间/min</text>
      <text x="195" y="218" fill="#d7dee9" font-size="12" text-anchor="middle">石蜡冷却时的温度—时间图像</text>
    </svg>`;
  },

  hypoFreezeCurve: function () {
    const x0 = 52, y0 = 24, w = 300, h = 150, tMax = 12, TMin = 30, TMax = 70;
    const X = t => x0 + t / tMax * w, Y = T => y0 + (TMax - T) / (TMax - TMin) * h;
    const pts = [[0, 62], [2, 55], [4, 48], [8, 48], [10, 42], [12, 36]];
    const poly = pts.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ');
    let xt = '', yt = '';
    for (let t = 0; t <= 12; t += 2) xt += `<line x1="${X(t)}" y1="${y0 + h}" x2="${X(t)}" y2="${y0 + h + 5}" stroke="#6b7686"/><text x="${X(t)}" y="${y0 + h + 18}" fill="#9aa4b5" font-size="10" text-anchor="middle">${t}</text>`;
    for (let T = 30; T <= 70; T += 10) yt += `<line x1="${x0 - 5}" y1="${Y(T)}" x2="${x0}" y2="${Y(T)}" stroke="#6b7686"/><text x="${x0 - 9}" y="${Y(T) + 4}" fill="#9aa4b5" font-size="10" text-anchor="end">${T}</text>`;
    return `<svg viewBox="0 0 390 225" role="img" aria-label="海波凝固温度时间图像">
      ${yt}${xt}
      <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + h}" stroke="#9aa4b5" stroke-width="1.5"/>
      <line x1="${x0}" y1="${y0 + h}" x2="${x0 + w}" y2="${y0 + h}" stroke="#9aa4b5" stroke-width="1.5"/>
      <polyline points="${poly}" fill="none" stroke="#5ad7ff" stroke-width="2.5"/>
      <text x="${x0 + w}" y="${y0 - 8}" fill="#9aa4b5" font-size="11" text-anchor="end">温度/℃</text>
      <text x="${x0 + w + 4}" y="${y0 + h + 18}" fill="#9aa4b5" font-size="11" text-anchor="end">时间/min</text>
      <text x="195" y="218" fill="#d7dee9" font-size="12" text-anchor="middle">海波冷却时的温度—时间图像</text>
    </svg>`;
  },

  mysteryDataTable: function () {
    const times = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const temps = [60, 65, 70, 75, 80, 80, 80, 80, 85, 90];
    const lw = 110, cw = 40, rh = 34, x0 = 10, y0 = 14;
    let s = `<svg viewBox="0 0 ${x0 * 2 + lw + cw * times.length} ${y0 + rh * 3 + 30}" role="img" aria-label="未知固体加热实验数据表">`;
    const rows = [['加热时间/min', times], ['温度/℃', temps]];
    rows.forEach((r, ri) => {
      const y = y0 + ri * rh;
      s += `<rect x="${x0}" y="${y}" width="${lw}" height="${rh}" fill="rgba(90,215,255,.08)" stroke="#6b7686"/>`;
      s += `<text x="${x0 + lw / 2}" y="${y + rh / 2 + 5}" fill="#d7dee9" font-size="12" text-anchor="middle">${r[0]}</text>`;
      r[1].forEach((v, ci) => {
        const cx0 = x0 + lw + ci * cw;
        s += `<rect x="${cx0}" y="${y}" width="${cw}" height="${rh}" fill="none" stroke="#6b7686"/>`;
        s += `<text x="${cx0 + cw / 2}" y="${y + rh / 2 + 5}" fill="#9aa4b5" font-size="12" text-anchor="middle">${v}</text>`;
      });
    });
    s += `<text x="${x0 + (lw + cw * times.length) / 2}" y="${y0 + rh * 2 + 24}" fill="#d7dee9" font-size="12" text-anchor="middle">对未知固体持续均匀加热，每 1 min 记录一次温度</text>`;
    s += '</svg>';
    return s;
  }
};

if(typeof window!=="undefined"){window.QBANK_C3A_ORIG=QBANK_C3A_ORIG;window.QBANK_C3A_ORIG_FIGS=QBANK_C3A_ORIG_FIGS;}

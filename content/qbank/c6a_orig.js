/* c6 题库 · P2 原创生产 · 2026-10-24 · c6a（s1质量 + s2密度概念）原创14题 */
var QBANK_C6A_ORIG = [

  { id:'c6s1b001', ch:6, sec:1,
    kp:['mass-prop'], type:'choice', diff:1, freq:3, points:3,
    stem:'航天员把一袋密封的太空食品从地面带到空间站，食用前又用加热装置把它热了一遍。整个过程食品（含包装）始终密封没有泄漏。关于这袋太空食品的质量，下列说法正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'关于质量的变化，下列说法正确的是',
      opts:['位置从地面变到空间站，食品变轻了，所以质量变小',
            '加热过程质量不变，但位置改变会让质量变小',
            '无论运输还是加热，食品所含物质的多少都没有变，质量不变',
            '空间站里处于失重环境，食品的质量变为零'],
      answer:2,
      analysis:'质量是物体<b>所含物质的多少</b>，它不随物体的<b>形状、物态、位置、温度</b>改变。运输改变了位置、加热改变了温度，但密封袋内物质的多少没有变，所以质量<b>不变</b>。失重只是重力表现的变化，不是质量消失。<b>答案：C</b>' }],
    answer:null, analysis:null, src:'original', scene:'航天员带太空食品上空间站' },

  { id:'c6s1b002', ch:6, sec:1,
    kp:['balance-use'], type:'choice', diff:1, freq:4, points:3,
    stem:'面包店里新装了一台托盘天平，面点师傅用它称量面粉。在称量过程中，下列操作正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'称量过程中的正确操作是',
      opts:['为了省事，把面粉直接倒在左盘上、砝码放在右盘里称量',
            '用镊子夹取砝码，先试加质量大的砝码，再依次试加质量小的',
            '称量中发现指针略偏，随手调节平衡螺母让横梁重新平衡',
            '加减最小砝码时，直接用手拿最方便'],
      answer:1,
      analysis:'粉末状物品不能直接放盘上，应垫<b>称量纸或用容器</b>盛放（A 错）；称量过程中<b>不能再调平衡螺母</b>，只能加减砝码或移动游码（C 错）；砝码必须用<b>镊子</b>夹取，防止手上的汗渍腐蚀砝码（D 错）；加砝码按<b>先大后小</b>的顺序试加（B 正确）。<b>答案：B</b>' }],
    answer:null, analysis:null, src:'original', scene:'面包店托盘天平称面粉的操作规范' },

  { id:'c6s1b003', ch:6, sec:1,
    kp:['mass-prop'], type:'blank', diff:1, freq:3, points:4,
    stem:'小雨帮妈妈到快递驿站寄一箱家乡特产，驿站电子秤上显示这箱物品的质量为 2.5 kg。请完成下面的单位换算与估测。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'换算与估测', blanks:[
      { label:'2.5 kg 合多少克', answer:['2500','2500g','2500 g','2500克'], unit:'g' },
      { label:'箱内一个苹果的质量约为200（填单位）', answer:['g','克'], unit:'' }],
      analysis:'1 kg = 1000 g，所以 2.5 kg = 2.5 × 1000 g = <b>2500 g</b>；一个苹果的质量约 0.2 kg，即约 <b>200 g</b>（填 kg、t 都明显偏大，mg 偏小）。' }],
    answer:null, analysis:null, src:'original', scene:'快递驿站电子秤称重与质量单位换算' },

  { id:'c6s1b004', ch:6, sec:1,
    kp:['balance-use'], type:'experiment', diff:1, freq:4, points:6,
    stem:'中药房的药师要用托盘天平称出 8.4 g 药粉。他已经把天平放在水平台上、游码移到标尺左端零刻度线处并调好了横梁平衡。请把接下来的称量步骤补充完整。',
    note:'称取指定质量的药品，是先定砝码和游码、再向盘中加药品。',
    fig:null,
    parts:[
      { kind:'blank', q:'① 先在右盘里放入 ____ g 的砝码。', blanks:[
        { label:'①砝码质量', answer:['5','5g','5 g','5克'], unit:'g' }],
        analysis:'砝码盒中最小的砝码是 5 g。8.4 g 的整数砝码部分用 <b>5 g</b>，剩下不足 5 g 的部分交给游码。' },
      { kind:'blank', q:'② 再把标尺上的游码移到 ____ g 处。', blanks:[
        { label:'②游码位置', answer:['3.4','3.4g','3.4 g'], unit:'g' }],
        analysis:'8.4 g − 5 g = 3.4 g，把游码移到 <b>3.4 g</b> 处，此时右盘一侧相当于 8.4 g。' },
      { kind:'blank', q:'③ 然后向左盘中慢慢添加药粉，直到横梁恢复平衡。③处应填哪个盘？', blanks:[
        { label:'③加药粉的盘', answer:['左','左边','左盘','左侧'], unit:'' }],
        analysis:'天平称量遵循<b>左物右码</b>：药粉（物）加在<b>左盘</b>，加到横梁平衡时，药粉质量就等于砝码加游码的 8.4 g。' } ],
    answer:null, analysis:null, src:'original', scene:'中药房用天平称取8.4g药粉' },

  { id:'c6s2b005', ch:6, sec:2,
    kp:['density-prop'], type:'choice', diff:1, freq:3, points:3,
    stem:'手工课上有三个体积完全相同的实心块：木块、铁块和铝块。用天平称量发现：铁块最重、铝块次之、木块最轻。据此判断，下列说法正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'关于三种材料的密度，下列说法正确的是',
      opts:['体积相同时铁块质量最大，说明铁的质量与体积的比值最大，铁的密度最大',
            '三个块的体积相同，所以三种材料的密度也相同',
            '木块最轻，说明木头这种物质没有密度',
            '密度只由质量决定，质量越大密度一定越大'],
      answer:0,
      analysis:'密度是<b>质量与体积的比值</b>。体积相同时，质量越大，比值越大，密度越大，所以 ρ铁 &gt; ρ铝 &gt; ρ木（A 正确，B 错）；一切物质都有密度，木头只是密度小（C 错）；比较密度必须<b>同时</b>看质量和体积，只说质量大不能断定密度大（D 错）。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'手工课同体积木块铁块铝块轻重比较' },

  { id:'c6s2b006', ch:6, sec:2,
    kp:['density-app'], type:'blank', diff:1, freq:2, points:4,
    stem:'秋收时节，爷爷用盐水选种：把稻种倒进配好浓度的盐水里，饱满的谷粒沉到盆底，干瘪的和被虫蛀过的谷粒浮在液面上，一捞就分开了。请用密度的知识解释选种的道理。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'盐水选种的原理（横线上填「大于」或「小于」）', blanks:[
      { label:'饱满谷粒密度与盐水密度比较', answer:['大于','大','比盐水大','大于盐水'], unit:'' },
      { label:'干瘪虫蛀谷粒密度与盐水密度比较', answer:['小于','小','比盐水小','小于盐水'], unit:'' }],
      analysis:'密度<b>大于</b>盐水的谷粒下沉，密度<b>小于</b>盐水的谷粒上浮。干瘪、虫蛀的谷粒内部有空隙，同样大小质量更小、密度更小，所以浮起来——调好盐水浓度就能把饱满与干瘪的谷粒分开。' }],
    answer:null, analysis:null, src:'original', scene:'爷爷用盐水选种分饱满与干瘪谷粒' },

  { id:'c6s2b007', ch:6, sec:2,
    kp:['mv-graph'], type:'choice', diff:2, freq:3, points:3,
    stem:'烹饪兴趣小组测出了甲、乙两种调味汁的质量与体积数据，并把数据描点画成如图所示的 m-V 图像（两条图线都过坐标原点）。根据图像判断，下列分析正确的是哪一项？',
    note:'配图为程序化绘制的 m-V 图像。', fig:'mvGraphAB',
    parts:[{ kind:'choice', q:'根据图像，下列分析正确的是',
      opts:['取相同体积时甲的质量更大，甲的质量与体积的比值更大，甲的密度大于乙',
            '取相同质量时，甲的体积更大',
            '甲、乙的质量与体积的比值相同，两种汁的密度一样大',
            '乙图线更靠近横轴，说明乙的密度大于甲'],
      answer:0,
      analysis:'m-V 图像中，过原点直线的<b>陡峭程度</b>反映质量与体积的比值（即密度）：图线越陡，同体积对应的质量越大，密度越大。由图像，同体积时 m甲 &gt; m乙，所以 <b>ρ甲 &gt; ρ乙</b>（A 正确，C、D 错）；从图上读 V = 40 cm³ 时 m甲 = 48 g、m乙 = 36 g，得 ρ甲 = 1.2 g/cm³、ρ乙 = 0.9 g/cm³。相同质量时，密度大的甲体积反而<b>更小</b>（B 错）。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'烹饪小组用m-V图像比较两种调味汁密度' },

  { id:'c6s2b008', ch:6, sec:2,
    kp:['cylinder-use'], type:'choice', diff:1, freq:4, points:3,
    stem:'化学兴趣小组要一次量出 36 mL 的水。实验室现有四种量筒：10 mL（分度值 0.2 mL）、50 mL（分度值 1 mL）、100 mL（分度值 2 mL）、200 mL（分度值 5 mL）。选用哪一种最合适？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'最合适的量筒是',
      opts:['10 mL 量筒，分度值最小，读数最精确',
            '50 mL 量筒',
            '100 mL 量筒',
            '200 mL 量筒，量程最大，装得下就行'],
      answer:1,
      analysis:'选量筒的原则：量程要<b>略大于</b>所量体积（保证一次量完），在量程满足的前提下分度值<b>越小越精确</b>。36 mL 用 10 mL 量筒得分 4 次量取，累计误差大（A 错）；50 mL 量筒量程够且分度值只有 1 mL，最合适（B 正确）；100 mL、200 mL 量程过大、分度值粗，读数误差大（C、D 错）。<b>答案：B</b>' }],
    answer:null, analysis:null, src:'original', scene:'化学小组量取36mL水的量筒量程选择' },

  { id:'c6s2b009', ch:6, sec:2,
    kp:['cylinder-use'], type:'experiment', diff:1, freq:4, points:6,
    stem:'小芳用一个量筒（分度值 2 mL）和水来测一颗小玻璃弹珠的体积：先在量筒中倒入适量的水，放在水平台面上，水面位置如图甲；再把弹珠沿筒壁轻轻滑入量筒，弹珠完全浸没后水面升到图乙位置。请完成下面的读数与计算。',
    note:'配图为程序化简图，读数时视线应与凹液面底部相平。', fig:'cylDisplace',
    parts:[
      { kind:'blank', q:'①② 读出两次水面位置', blanks:[
        { label:'①图甲中水的体积V1', answer:['30','30mL','30 mL','30毫升'], unit:'mL' },
        { label:'②图乙中水面到达的刻度V2', answer:['38','38mL','38 mL','38毫升'], unit:'mL' }],
        analysis:'量筒分度值为 2 mL。图甲凹液面底部正对 30 mL 刻线，V1 = <b>30 mL</b>；图乙液面在 30 mL 上方第 4 个小格处（32、34、36、38），V2 = <b>38 mL</b>。' },
      { kind:'blank', q:'③ 弹珠的体积 V = ____', blanks:[
        { label:'③弹珠体积', answer:['8','8cm³','8 cm³','8立方厘米','8mL','8 mL','8毫升'], unit:'cm³' }],
        analysis:'排水法：V = V2 − V1 = 38 mL − 30 mL = 8 mL，而 1 mL = 1 cm³，所以弹珠体积为 <b>8 cm³</b>。' } ],
    answer:null, analysis:null, src:'original', scene:'量筒排水法测玻璃弹珠的体积' },

  { id:'c6s2b010', ch:6, sec:2,
    kp:['density-prop'], type:'blank', diff:1, freq:3, points:4,
    stem:'小杰的铅笔盒里有一大一小两枚铁钉（同种铁材料）。他用天平称了称、又用量筒测了测：大铁钉比小铁钉更重，占的空间也更大。请按要求填空。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'密度概念辨析', blanks:[
      { label:'大铁钉的密度____小铁钉的密度（填：大于/小于/等于）', answer:['等于','相等','一样','一样大'], unit:'' },
      { label:'这说明同种物质的密度不随____和体积的变化而变化', answer:['质量','m','物质的质量'], unit:'' }],
      analysis:'密度是物质本身的一种<b>特性</b>。同种物质，质量与体积的比值一定：大铁钉质量大、体积也大，比值与小铁钉相同，所以两枚铁钉的密度<b>相等</b>；密度不随<b>质量</b>、体积的改变而改变。' }],
    answer:null, analysis:null, src:'original', scene:'一大一小同种铁钉的密度比较' },

  { id:'c6s2b011', ch:6, sec:2,
    kp:['density-exp-s'], type:'experiment', diff:2, freq:5, points:8,
    stem:'妈妈想知道家里鸡蛋的密度，小舟设计了如下实验：<br>① 用调好的天平测出一枚鸡蛋的质量：横梁平衡时，右盘中砝码为 20 g、20 g、10 g 各一个，游码在标尺上对应 5 g；<br>② 在量筒中倒入 40 mL 的水，把这枚鸡蛋轻轻放入量筒，鸡蛋完全浸没后水面升到 90 mL 处。<br>请回答下面的问题。',
    note:'1 mL = 1 cm³。', fig:null,
    parts:[
      { kind:'blank', q:'① 鸡蛋的质量 m = ____', blanks:[
        { label:'鸡蛋质量', answer:['55','55g','55 g','55克'], unit:'g' }],
        analysis:'m = 砝码 + 游码 = 20 g + 20 g + 10 g + 5 g = <b>55 g</b>。' },
      { kind:'blank', q:'② 鸡蛋的体积 V = ____', blanks:[
        { label:'鸡蛋体积', answer:['50','50cm³','50 cm³','50立方厘米','50mL','50 mL','50毫升'], unit:'cm³' }],
        analysis:'排水法：V = 90 mL − 40 mL = 50 mL = <b>50 cm³</b>。' },
      { kind:'blank', q:'③ 鸡蛋的密度 ρ = ____', blanks:[
        { label:'鸡蛋密度', answer:['1.1','1.1g/cm³','1.1 g/cm³','1.1×10³','1.1×10³kg/m³','1.1x10³kg/m³','1.1×10^3kg/m³','1100','1100kg/m³','1.1*10^3','1.1*10³'], unit:'g/cm³' }],
        analysis:'ρ = m/V = 55 g ÷ 50 cm³ = <b>1.1 g/cm³</b>（合 1.1×10³ kg/m³）。' },
      { kind:'choice', q:'④ 若小舟先把鸡蛋放入水中测体积，取出后蛋壳表面沾着水，就立刻放到天平上测质量，这样测出的密度会怎样？',
        opts:['偏大，因为沾水后所测质量偏大，而体积测量准确',
            '偏小，因为沾水后鸡蛋体积变小了',
            '不变，沾的水很少，可以忽略',
            '偏小，因为沾水后所测质量偏大'],
        answer:0,
        analysis:'先测体积再测质量，蛋壳表面<b>沾的水</b>被一起称了进去，所测 m 偏大；体积读数不受影响，由 ρ = m/V 可知测出的密度<b>偏大</b>。所以实验应先测质量、再测体积。<b>答案：A</b>' } ],
    answer:null, analysis:null, src:'original', scene:'厨房用天平和量筒测鸡蛋密度' },

  { id:'c6s2b012', ch:6, sec:2,
    kp:['density-exp-l'], type:'experiment', diff:3, freq:5, points:8,
    stem:'小醋想测出家中食用醋的密度，设计了两种方案：<br>方案A：① 用天平测出烧杯和醋的总质量 m₁；② 把烧杯中的一部分醋倒入量筒，读出量筒中醋的体积 V；③ 用天平测出烧杯和剩余醋的总质量 m₂。<br>方案B：① 用天平测出空烧杯的质量 m₀；② 把量筒中体积为 V 的醋全部倒入烧杯，测出烧杯和醋的总质量 m₃。<br>实验中按方案A测得：m₁ = 152 g，量筒中醋的体积 V = 60 mL，m₂ = 86 g。请回答下面的问题。',
    note:'1 mL = 1 cm³。', fig:null,
    parts:[
      { kind:'blank', q:'① 按方案A，倒入量筒中醋的质量 m = ____', blanks:[
        { label:'倒入量筒中醋的质量', answer:['66','66g','66 g','66克'], unit:'g' }],
        analysis:'差值法：m = m₁ − m₂ = 152 g − 86 g = <b>66 g</b>。这部分质量正好对应量筒中体积为 V 的醋。' },
      { kind:'blank', q:'② 食用醋的密度 ρ = ____', blanks:[
        { label:'醋的密度', answer:['1.1','1.1g/cm³','1.1 g/cm³','1.1×10³','1.1×10³kg/m³','1.1x10³kg/m³','1.1×10^3kg/m³','1100','1100kg/m³','1.1*10^3','1.1*10³'], unit:'g/cm³' }],
        analysis:'ρ = m/V = 66 g ÷ 60 cm³ = <b>1.1 g/cm³</b>（合 1.1×10³ kg/m³）。' },
      { kind:'choice', q:'③ 若改用方案B，测得的密度与真实值相比会怎样？',
        opts:['偏小，因为量筒中的醋不能全部倒进烧杯，筒壁残留使所测质量偏小，而体积仍按 V 计算',
            '偏大，因为烧杯本身有质量',
            '不变，两种方案测出的结果完全一样',
            '偏大，因为醋倒入烧杯后体积变大了'],
        answer:0,
        analysis:'方案B把量筒中的醋往烧杯倒时，<b>筒壁会残留</b>一部分醋，测得的 m₃ − m₀ 小于体积为 V 的那部分醋的真实质量；而计算时体积仍取 V，由 ρ = m/V 知结果<b>偏小</b>。方案A用「总质量 − 剩余质量」的差值法，量筒中醋的质量测得准确，误差更小。<b>答案：A</b>' },
      { kind:'choice', q:'④ 两种方案中更合理的是哪一种？为什么？',
        opts:['方案A，因为它避免了液体在量筒壁残留造成的质量测量误差',
            '方案B，因为它少测了一个物理量，操作更简单',
            '方案A，因为它不需要使用量筒',
            '方案B，因为空烧杯的质量更容易测准'],
        answer:0,
        analysis:'方案A中倒入量筒的醋的质量由 <b>m₁ − m₂</b> 得到，即使烧杯壁沾有少量醋，沾的部分也留在「剩余」里被扣掉了，质量与体积一一对应，误差小；方案B存在量筒残留问题，质量偏小。所以<b>方案A更合理</b>。<b>答案：A</b>' } ],
    answer:null, analysis:null, src:'original', scene:'两种方案对比测食用醋的密度' },

  { id:'c6s2b013', ch:6, sec:2,
    kp:['density-calc'], type:'calc', diff:1, freq:5, points:6,
    stem:'工艺厂用铝浇铸校运动会纪念徽章，每枚徽章是实心铝件，测得其质量为 54 g。已知铝的密度 ρ铝 = 2.7×10³ kg/m³（即 2.7 g/cm³）。请计算：',
    note:'1 mL = 1 cm³。', fig:null,
    parts:[
      { kind:'blank', q:'(1) 每枚徽章的体积是多少？', blanks:[
        { label:'每枚徽章的体积', answer:['20','20cm³','20 cm³','20立方厘米','2×10⁻⁵','2×10⁻⁵m³','0.00002'], unit:'cm³' }],
        analysis:'V = m/ρ = 54 g ÷ 2.7 g/cm³ = <b>20 cm³</b>（合 2×10⁻⁵ m³）。' },
      { kind:'blank', q:'(2) 浇铸 25 枚这样的徽章，共需要多少千克的铝？', blanks:[
        { label:'25枚共需铝的质量', answer:['1.35','1.35kg','1.35 kg','1.35千克','1350','1350g'], unit:'kg' }],
        analysis:'25 枚的总质量 m总 = 54 g × 25 = 1350 g = <b>1.35 kg</b>（也可先算总体积 20 cm³ × 25 = 500 cm³，再 m = ρV = 2.7 g/cm³ × 500 cm³ = 1350 g）。' } ],
    answer:null, analysis:null, src:'original', scene:'工艺厂浇铸铝制纪念徽章' },

  { id:'c6s2b014', ch:6, sec:2,
    kp:['density-calc'], type:'calc', diff:2, freq:5, points:6,
    stem:'医院里一只容积为 0.4 m³ 的氧气瓶，刚充装好时瓶内氧气的密度为 3 kg/m³。抢救病人用去了瓶内氧气质量的一半后（钢瓶容积不变），请回答：',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'(1) 刚充装好时，瓶内氧气的质量是多少？', blanks:[
        { label:'充装好时氧气的质量', answer:['1.2','1.2kg','1.2 kg','1.2千克'], unit:'kg' }],
        analysis:'m = ρV = 3 kg/m³ × 0.4 m³ = <b>1.2 kg</b>。' },
      { kind:'choice', q:'(2) 用去一半后，瓶内剩余氧气的密度变为多少？',
        opts:['0.75 kg/m³', '1.5 kg/m³', '3 kg/m³', '6 kg/m³'],
        answer:1,
        analysis:'气体总会充满整个钢瓶，用去一半后剩余氧气的<b>体积不变</b>（仍为 0.4 m³），质量变为原来的一半：m剩 = 1.2 kg ÷ 2 = 0.6 kg。ρ剩 = m剩/V = 0.6 kg ÷ 0.4 m³ = <b>1.5 kg/m³</b>，即密度减半。<b>答案：B</b>' } ],
    answer:null, analysis:null, src:'original', scene:'医院氧气瓶用去一半氧气后的密度' }
];

var QBANK_C6A_ORIG_FIGS = {

  /* 甲乙两种调味汁的 m-V 图像：过原点直线，ρ甲=1.2 g/cm³、ρ乙=0.9 g/cm³，图内只给坐标信息 */
  mvGraphAB: function () {
    const ox = 60, oy = 250;                 // 原点
    const pxV = 5.2, pxM = 3.5;              // 1 cm³=5.2px，1 g=3.5px
    const X = v => ox + v * pxV, Y = m => oy - m * pxM;
    let s = '';
    // 网格
    for (let v = 10; v <= 50; v += 10) s += `<line x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(60)}" stroke="#2a3140" stroke-width="1"/>`;
    for (let m = 10; m <= 60; m += 10) s += `<line x1="${X(0)}" y1="${Y(m)}" x2="${X(50)}" y2="${Y(m)}" stroke="#2a3140" stroke-width="1"/>`;
    // 坐标轴
    s += `<line x1="${ox}" y1="${oy}" x2="${X(54)}" y2="${oy}" stroke="#9aa4b5" stroke-width="1.5"/>`;
    s += `<line x1="${ox}" y1="${oy}" x2="${ox}" y2="${Y(64)}" stroke="#9aa4b5" stroke-width="1.5"/>`;
    for (let v = 10; v <= 50; v += 10) { s += `<line x1="${X(v)}" y1="${oy}" x2="${X(v)}" y2="${oy + 5}" stroke="#9aa4b5"/>`; s += `<text x="${X(v) - 6}" y="${oy + 18}" fill="#9aa4b5" font-size="11">${v}</text>`; }
    for (let m = 10; m <= 60; m += 10) { s += `<line x1="${ox - 5}" y1="${Y(m)}" x2="${ox}" y2="${Y(m)}" stroke="#9aa4b5"/>`; s += `<text x="${ox - 26}" y="${Y(m) + 4}" fill="#9aa4b5" font-size="11">${m}</text>`; }
    s += `<text x="${X(50) - 6}" y="${oy + 34}" fill="#9aa4b5" font-size="12">V/cm³</text>`;
    s += `<text x="${ox + 8}" y="${Y(62)}" fill="#9aa4b5" font-size="12">m/g</text>`;
    s += `<text x="${ox - 8}" y="${oy + 16}" fill="#9aa4b5" font-size="11">O</text>`;
    // 甲图线（陡）：过原点与 (50,60)
    s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(50)}" y2="${Y(60)}" stroke="#ffd479" stroke-width="2.5"/>`;
    s += `<circle cx="${X(40)}" cy="${Y(48)}" r="3.5" fill="#ffd479"/>`;
    s += `<text x="${X(43)}" y="${Y(52)}" fill="#ffd479" font-size="13" font-weight="bold">甲</text>`;
    // 乙图线（缓）：过原点与 (50,45)
    s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(50)}" y2="${Y(45)}" stroke="#5ad7ff" stroke-width="2.5"/>`;
    s += `<circle cx="${X(40)}" cy="${Y(36)}" r="3.5" fill="#5ad7ff"/>`;
    s += `<text x="${X(43)}" y="${Y(40)}" fill="#5ad7ff" font-size="13" font-weight="bold">乙</text>`;
    return `<svg viewBox="0 0 360 300" role="img" aria-label="甲乙两种调味汁的质量体积图像">${s}</svg>`;
  },

  /* 排水法测弹珠体积：图甲水面 30 mL，图乙弹珠浸没后 38 mL（量筒 0~50 mL，分度值 2 mL） */
  cylDisplace: function () {
    function cylPanel(dx, mL, withBead, tag) {
      const yFor = v => 210 - v * 3.6;       // 0 mL→y210，50 mL→y30
      let s = `<rect x="${dx + 40}" y="26" width="50" height="188" fill="none" stroke="#9aa4b5" stroke-width="1.5" rx="3"/>`;
      for (let v = 0; v <= 50; v += 2) {
        const y = yFor(v), major = v % 10 === 0;
        s += `<line x1="${dx + (major ? 72 : 79)}" y1="${y}" x2="${dx + 90}" y2="${y}" stroke="#6b7686" stroke-width="${major ? 1.2 : 1}"/>`;
        if (major) s += `<text x="${dx + 95}" y="${y + 4}" fill="#9aa4b5" font-size="10">${v}</text>`;
      }
      s += `<text x="${dx + 95}" y="30" fill="#9aa4b5" font-size="10">mL</text>`;
      const menY = yFor(mL);
      s += `<rect x="${dx + 41.5}" y="${menY}" width="47" height="${212.5 - menY}" fill="rgba(90,215,255,.22)"/>`;
      if (withBead) s += `<circle cx="${dx + 65}" cy="198" r="11" fill="#8b96a8" stroke="#6b7686" stroke-width="1.2"/>`;
      s += `<line x1="${dx + 40}" y1="${menY}" x2="${dx + 90}" y2="${menY}" stroke="#5ad7ff" stroke-width="2"/>`;
      s += `<text x="${dx + 52}" y="232" fill="#eef2f8" font-size="13">${tag}</text>`;
      return s;
    }
    const s = cylPanel(0, 30, false, '图甲') + cylPanel(180, 38, true, '图乙');
    return `<svg viewBox="0 0 340 240" role="img" aria-label="量筒排水法测弹珠体积简图">${s}</svg>`;
  }
};

if(typeof window!=="undefined"){window.QBANK_C6A_ORIG=QBANK_C6A_ORIG;window.QBANK_C6A_ORIG_FIGS=QBANK_C6A_ORIG_FIGS;}

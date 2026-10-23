/* c6 题库 · P2 原创生产 · 2026-10-24 · c6b（s3密度测量 + s4密度应用）原创14题 */
var QBANK_C6B_ORIG = [

  { id:'c6s3b001', ch:6, sec:3,
    kp:['density-exp-s'], type:'experiment', diff:1, freq:5, points:7,
    stem:'野外研学时，小磊捡到一块鹅卵石，带回实验室用天平和量筒测它的密度。<br>测质量：天平平衡时，右盘中有一个 50 g 砝码，游码在标尺 2 g 刻度线处。<br>测体积：先在量筒中倒入适量水，凹液面底部对着 30 mL 刻线；再用细线拴住鹅卵石，把它缓缓浸没在水中，凹液面底部升到 50 mL 刻线处。',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'本实验中，测量鹅卵石质量与体积的先后顺序应该是',
        opts:['先用天平测质量，再用量筒测体积',
              '先用量筒测体积，再用天平测质量',
              '先后顺序无所谓，结果完全一样',
              '必须同时测出质量和体积'],
        answer:0,
        analysis:'若先测体积，鹅卵石从水中取出时会<b>沾水</b>，再放到天平上称，测得的质量偏大，由 ρ = m/V 算出的密度也偏大。所以应<b>先测质量、再测体积</b>。<b>答案：A</b>' },
      { kind:'blank', q:'读数与计算', blanks:[
        { label:'鹅卵石的质量m', answer:['52','52g','52 g','52克'], unit:'g' },
        { label:'鹅卵石的体积V', answer:['20','20cm³','20 cm³','20立方厘米','20mL','20 mL'], unit:'cm³' },
        { label:'鹅卵石的密度ρ', answer:['2.6','2.6g/cm³','2.6 g/cm³','2.6克每立方厘米','2.6×10³kg/m³','2.6×10³ kg/m³','2600kg/m³'], unit:'g/cm³' }],
        analysis:'质量 m = 砝码 + 游码 = 50 g + 2 g = <b>52 g</b>；排水法测体积 V = 50 mL − 30 mL = 20 mL = <b>20 cm³</b>；密度 ρ = m/V = 52 g ÷ 20 cm³ = <b>2.6 g/cm³</b>（合 2.6×10³ kg/m³）。' } ],
    answer:null, analysis:null, src:'original', scene:'研学捡鹅卵石测密度' },

  { id:'c6s3b002', ch:6, sec:3,
    kp:['density-exp-l'], type:'experiment', diff:2, freq:5, points:8,
    stem:'家政课上，小悦用天平、烧杯和量筒测酱油的密度，步骤如下：<br>① 向烧杯中倒入适量酱油，用天平测出烧杯和酱油的总质量 m₁——天平平衡时，右盘中砝码为 50 g、20 g、5 g 各一个，游码在标尺 1.6 g 刻度线处；<br>② 把烧杯中的一部分酱油倒入量筒，量筒中凹液面底部恰好对着 36 mL 刻线；<br>③ 再用天平测出烧杯和剩余酱油的总质量 m₂ = 33.4 g。',
    note:'这种「测总质量—倒出一部分—测剩余质量」的方法叫差值法。',
    fig:null,
    parts:[
      { kind:'blank', q:'读数与计算', blanks:[
        { label:'烧杯和酱油的总质量m₁', answer:['76.6','76.6g','76.6 g'], unit:'g' },
        { label:'倒入量筒中酱油的质量m', answer:['43.2','43.2g','43.2 g'], unit:'g' },
        { label:'酱油的密度ρ', answer:['1.2','1.2g/cm³','1.2 g/cm³','1.2×10³kg/m³','1.2×10³ kg/m³','1200kg/m³'], unit:'g/cm³' }],
        analysis:'m₁ = 50 g + 20 g + 5 g + 1.6 g = <b>76.6 g</b>；倒入量筒的酱油质量 m = m₁ − m₂ = 76.6 g − 33.4 g = <b>43.2 g</b>；V = 36 mL = 36 cm³，ρ = m/V = 43.2 g ÷ 36 cm³ = <b>1.2 g/cm³</b>。' },
      { kind:'choice', q:'同桌提出另一种方案：先把烧杯中的酱油全部倒入量筒测体积 V，再把量筒中的酱油全部倒回空烧杯测质量 m。与小悦的差值法相比，该方案的问题是',
        opts:['量筒内壁会残留酱油，使测得的质量偏小，算出的密度偏小',
              '量筒内壁会残留酱油，使测得的密度偏大',
              '残留酱油不影响测量结果，两种方案完全等价',
              '该方案根本测不出酱油的体积'],
        answer:0,
        analysis:'把量筒中的酱油倒回烧杯时，量筒内壁会<b>挂壁残留</b>一部分酱油，导致所称质量 m <b>偏小</b>，而体积 V 的测量值不变，由 ρ = m/V 可知密度<b>偏小</b>。差值法用 m₁ − m₂ 得到的正是倒入量筒那部分酱油的质量，避免了这一误差。<b>答案：A</b>' } ],
    answer:null, analysis:null, src:'original', scene:'家政课差值法测酱油密度' },

  { id:'c6s3b003', ch:6, sec:3,
    kp:['density-exp-l','cylinder-use'], type:'experiment', diff:1, freq:5, points:7,
    stem:'物理实验中，小晨用差值法测配制好的盐水的密度：<br>① 用天平测出烧杯和盐水的总质量——天平平衡时，右盘中砝码为 50 g 一个、20 g 两个，游码在标尺 4.2 g 刻度线处；<br>② 把烧杯中的一部分盐水倒入量筒，量筒中凹液面底部恰好对着 40 mL 刻线；<br>③ 用天平测出烧杯和剩余盐水的总质量为 48.2 g。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'读数与计算', blanks:[
      { label:'烧杯和盐水的总质量', answer:['94.2','94.2g','94.2 g'], unit:'g' },
      { label:'倒入量筒中盐水的质量', answer:['46','46.0','46g','46.0 g','46 g','46克'], unit:'g' },
      { label:'盐水的密度ρ', answer:['1.15','1.15g/cm³','1.15 g/cm³','1.15×10³kg/m³','1.15×10³ kg/m³','1150kg/m³'], unit:'g/cm³' }],
      analysis:'总质量 = 50 g + 20 g + 20 g + 4.2 g = <b>94.2 g</b>；量筒中盐水质量 m = 94.2 g − 48.2 g = <b>46 g</b>；V = 40 mL = 40 cm³，ρ = m/V = 46 g ÷ 40 cm³ = <b>1.15 g/cm³</b>（合 1.15×10³ kg/m³）。' }],
    answer:null, analysis:null, src:'original', scene:'实验室差值法测盐水密度' },

  { id:'c6s3b004', ch:6, sec:3,
    kp:['density-exp-s'], type:'experiment', diff:3, freq:5, points:8,
    stem:'手工社用蜡做了一个实心小摆件（不吸水、不溶于水），小婉想测出它的密度。<br>她用天平测质量：天平平衡时，右盘中砝码为 10 g、5 g 各一个，游码在标尺 3 g 刻度线处。<br>她想用排水法测体积，把摆件放进量筒后却发现摆件漂在水面上。老师又给她提供了一根细钢针。她先在量筒中倒入适量水，凹液面底部对着 40 mL 刻线，然后用细钢针把摆件全部压入水中，凹液面底部升到 60 mL 刻线处。',
    note:'压入摆件时，细钢针浸入水中的体积很小，可忽略不计。',
    fig:null,
    parts:[
      { kind:'blank', q:'① 从密度的角度说明，为什么不能直接用排水法测出摆件的体积？', blanks:[
        { label:'①原因', answer:['蜡的密度小于水','蜡的密度比水小','密度小于水','密度比水小','摆件密度小于水会漂浮','密度小于水，摆件漂浮不能浸没'], unit:'' }],
        analysis:'蜡的密度<b>小于</b>水，摆件放入水中会<b>漂浮</b>，只有部分浸入水中，排开水的体积小于摆件本身的体积，所以直接排水法测不出体积。' },
      { kind:'blank', q:'② 若细钢针没有把摆件全部压入水中（摆件还露出一部分）就读数，测得的密度与实际值相比会怎样？', blanks:[
        { label:'②密度偏差', answer:['偏大','变大','比实际大','测量值偏大'], unit:'' }],
        analysis:'摆件没有全部浸没时，两次液面差只等于<b>浸入部分</b>的体积，测得的 V <b>偏小</b>；质量 m 的测量不受影响，由 ρ = m/V 可知测得的密度<b>偏大</b>。' },
      { kind:'blank', q:'③④ 计算摆件的体积和密度', blanks:[
        { label:'③摆件的体积V', answer:['20','20cm³','20 cm³','20立方厘米','20mL','20 mL'], unit:'cm³' },
        { label:'④摆件的密度ρ', answer:['0.9','0.9g/cm³','0.9 g/cm³','0.9×10³kg/m³','0.9×10³ kg/m³','900kg/m³'], unit:'g/cm³' }],
        analysis:'质量 m = 10 g + 5 g + 3 g = <b>18 g</b>；体积 V = 60 mL − 40 mL = 20 mL = <b>20 cm³</b>；密度 ρ = m/V = 18 g ÷ 20 cm³ = <b>0.9 g/cm³</b>。' } ],
    answer:null, analysis:null, src:'original', scene:'针压法测漂浮蜡摆件的密度' },

  { id:'c6s3b005', ch:6, sec:3,
    kp:['balance-use'], type:'choice', diff:1, freq:4, points:3,
    stem:'小航用托盘天平测量一盒牛奶的质量。天平平衡时，右盘中砝码为 200 g、50 g 各一个，标尺上游码的位置如图所示。这盒牛奶的质量是多少？',
    note:'图为天平标尺的局部示意，标尺单位为克（g），读数以游码左侧对准的刻线为准。',
    fig:'riderScale',
    parts:[{ kind:'choice', q:'这盒牛奶的质量是',
      opts:['250 g','252.6 g','254.6 g','272.6 g'],
      answer:1,
      analysis:'物体的质量 = 右盘砝码总质量 + 游码示数。砝码共 200 g + 50 g = 250 g；标尺每大格 1 g、分成 5 小格，分度值 0.2 g，游码左侧对着 <b>2.6 g</b>。所以 m = 250 g + 2.6 g = <b>252.6 g</b>。忘加游码会误选 250 g。<b>答案：B</b>' }],
    answer:null, analysis:null, src:'original', scene:'天平测盒装牛奶质量的读数' },

  { id:'c6s3b006', ch:6, sec:3,
    kp:['cylinder-use'], type:'choice', diff:1, freq:4, points:3,
    stem:'实验员要量取 20 mL 蒸馏水。他把量筒平稳放在桌面上，边倒水边从上方俯视刻度，当看到凹液面底部正好与 20 mL 刻线重合时停止倒水。他实际量取到的水的体积与 20 mL 相比如何？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'实际量取的水的体积',
      opts:['恰好等于 20 mL','大于 20 mL','小于 20 mL','无法判断'],
      answer:2,
      analysis:'俯视时视线斜向下穿过量筒，看到的液面位置比实际液面<b>偏高</b>，读数偏大。当读数显示 20 mL 时，实际液面还<b>不到</b> 20 mL 刻线，所以量取的水<b>小于 20 mL</b>（口诀：俯视读数偏大、实际偏少；仰视读数偏小、实际偏多）。<b>答案：C</b>' }],
    answer:null, analysis:null, src:'original', scene:'俯视量筒量取20mL水的误差' },

  { id:'c6s3b007', ch:6, sec:3,
    kp:['density-exp-s','cylinder-use'], type:'experiment', diff:1, freq:5, points:7,
    stem:'小峻在溪边捡到一块放不进量筒的大石块，他借助溢水杯测石块的密度：<br>① 用天平测石块的质量——天平平衡时，右盘中砝码为 100 g 两个、50 g 一个、5 g 一个，游码在标尺 3 g 刻度线处；<br>② 把溢水杯装满水，将石块缓缓浸没在溢水杯中，用空烧杯接住全部溢出的水；<br>③ 把溢出的水全部倒入量筒，凹液面底部恰好对着 100 mL 刻线。',
    note:'溢水杯中的水原本是满的，石块浸没后排开的水全部溢出。',
    fig:null,
    parts:[
      { kind:'blank', q:'① 读出石块的质量', blanks:[
        { label:'石块的质量m', answer:['258','258g','258 g','258克'], unit:'g' }],
        analysis:'m = 砝码 + 游码 = 100 g + 100 g + 50 g + 5 g + 3 g = <b>258 g</b>。' },
      { kind:'choice', q:'② 关于溢出水的体积与石块体积的关系，下列说法正确的是',
        opts:['溢出水的体积等于石块的体积',
              '溢出水的体积大于石块的体积',
              '溢出水的体积小于石块的体积',
              '溢出水的体积与石块的体积没有关系'],
        answer:0,
        analysis:'溢水杯原本<b>装满水</b>，石块<b>完全浸没</b>后排开的水全部溢出，所以溢出水的体积<b>等于</b>石块的体积——这是排水法的变形，适用于放不进量筒的大物体。<b>答案：A</b>' },
      { kind:'blank', q:'③ 计算石块的密度', blanks:[
        { label:'石块的密度ρ', answer:['2.58','2.58g/cm³','2.58 g/cm³','2.58×10³kg/m³','2.58×10³ kg/m³','2580kg/m³'], unit:'g/cm³' }],
        analysis:'V = 100 mL = 100 cm³，ρ = m/V = 258 g ÷ 100 cm³ = <b>2.58 g/cm³</b>（合 2.58×10³ kg/m³）。' } ],
    answer:null, analysis:null, src:'original', scene:'溢水杯测溪边大石块的密度' },

  { id:'c6s4b008', ch:6, sec:4,
    kp:['density-calc'], type:'blank', diff:1, freq:5, points:4,
    stem:'冰雪公园里有一尊实心冰雕，所用冰的体积为 0.5 m³，冰的密度为 0.9×10³ kg/m³。这尊冰雕搬进展厅后完全熔化成水（不计蒸发损失），请完成下面的计算。水的密度取 1.0×10³ kg/m³。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'计算', blanks:[
      { label:'冰雕的质量m', answer:['450','450kg','450 kg','450千克'], unit:'kg' },
      { label:'冰全部熔化成水后的体积V水', answer:['0.45','0.45m³','0.45 m³','0.45立方米'], unit:'m³' }],
      analysis:'m = ρ冰V = 0.9×10³ kg/m³ × 0.5 m³ = <b>450 kg</b>；熔化前后<b>质量不变</b>，仍为 450 kg，所以 V水 = m/ρ水 = 450 kg ÷ (1.0×10³ kg/m³) = <b>0.45 m³</b>——冰化成水后体积变小。' }],
    answer:null, analysis:null, src:'original', scene:'冰雪公园冰雕的质量与熔化体积' },

  { id:'c6s4b009', ch:6, sec:4,
    kp:['density-app'], type:'calc', diff:2, freq:2, points:7,
    stem:'一枚铜质工艺球，外形看不出任何拼接痕迹。质检员用天平测得它的质量为 356 g，再用排水法测得它的体积为 50 cm³。铜的密度取 8.9×10³ kg/m³。请通过计算判断并作答。',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'这枚工艺球是实心还是空心的？',
        opts:['实心的','空心的','无法判断','可能是实心也可能是空心，条件不足'],
        answer:1,
        analysis:'球的平均密度 ρ球 = m/V = 356 g ÷ 50 cm³ = 7.12 g/cm³ <b>小于</b>铜的密度 8.9 g/cm³，说明球内含有空腔，是<b>空心</b>的。<b>答案：B</b>' },
      { kind:'blank', q:'计算铜材料实际占有的体积和空心部分的体积', blanks:[
        { label:'铜材料的体积V铜', answer:['40','40cm³','40 cm³','40立方厘米'], unit:'cm³' },
        { label:'空心部分的体积V空', answer:['10','10cm³','10 cm³','10立方厘米'], unit:'cm³' }],
        analysis:'V铜 = m/ρ铜 = 356 g ÷ 8.9 g/cm³ = <b>40 cm³</b>；空心部分体积 V空 = V − V铜 = 50 cm³ − 40 cm³ = <b>10 cm³</b>。' } ],
    answer:null, analysis:null, src:'original', scene:'质检铜工艺球判断空心并求空腔体积' },

  { id:'c6s4b010', ch:6, sec:4,
    kp:['density-app'], type:'calc', diff:1, freq:2, points:6,
    stem:'一间教室长 10 m、宽 8 m、高 2.5 m。空气的密度取 1.29 kg/m³。请估算教室内空气的质量，并完成下面的作答。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 教室的容积是多少？', blanks:[
        { label:'①教室容积V', answer:['200','200m³','200 m³','200立方米'], unit:'m³' }],
        analysis:'V = 长 × 宽 × 高 = 10 m × 8 m × 2.5 m = <b>200 m³</b>。' },
      { kind:'blank', q:'② 教室里空气的质量约为多少千克？', blanks:[
        { label:'②空气质量m', answer:['258','258kg','258 kg','258千克'], unit:'kg' }],
        analysis:'m = ρV = 1.29 kg/m³ × 200 m³ = <b>258 kg</b>——教室里空气的质量比两名成年人还重，可见「看不见」的空气也有可观的质量。' },
      { kind:'choice', q:'③ 打开门窗通风后（室内外温度相同），教室内的空气质量会怎样变化？',
        opts:['空气流动起来了，质量变大',
              '教室容积不变、空气密度不变，质量基本不变',
              '一部分空气流到室外，质量明显变小',
              '空气看不见，无法比较质量'],
        answer:1,
        analysis:'通风只是让空气<b>流动更新</b>，教室容积不变、温度相同时空气密度也不变，充满教室的空气总质量<b>基本不变</b>。<b>答案：B</b>' } ],
    answer:null, analysis:null, src:'original', scene:'估算教室里空气的质量' },

  { id:'c6s4b011', ch:6, sec:4,
    kp:['density-calc','density-prop'], type:'experiment', diff:1, freq:5, points:7,
    stem:'鉴定中心收到一枚金色饰品，送检人想知道它是不是纯金打造。鉴定员用天平测得饰品的质量为 70 g，再用排水法测体积：量筒中水的凹液面底部原本对着 30 mL 刻线，把饰品用细线拴住完全浸没后，凹液面底部升到 34 mL 刻线处。纯金的密度为 19.3 g/cm³。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'①② 求饰品的体积和密度', blanks:[
        { label:'①饰品的体积V', answer:['4','4cm³','4 cm³','4立方厘米','4mL','4 mL'], unit:'cm³' },
        { label:'②饰品的密度ρ', answer:['17.5','17.5g/cm³','17.5 g/cm³','17.5×10³kg/m³','17.5×10³ kg/m³','17500kg/m³'], unit:'g/cm³' }],
        analysis:'V = 34 mL − 30 mL = 4 mL = <b>4 cm³</b>；ρ = m/V = 70 g ÷ 4 cm³ = <b>17.5 g/cm³</b>。' },
      { kind:'choice', q:'③ 根据密度判断，这枚饰品是纯金打造的吗？',
        opts:['是，金色饰品就是纯金的',
              '不是，饰品密度小于纯金的密度，内部掺有密度较小的其他金属',
              '无法判断，密度不能用来鉴别物质',
              '是，因为饰品的密度与纯金密度相差不大'],
        answer:1,
        analysis:'密度是物质的<b>特性</b>，可以用来鉴别物质。饰品密度 17.5 g/cm³ <b>明显小于</b>纯金的 19.3 g/cm³，说明它<b>不是纯金</b>——内部掺入了密度比金小的其他金属（如银、铜），使整体密度变小。<b>答案：B</b>' } ],
    answer:null, analysis:null, src:'original', scene:'鉴定中心测金色饰品密度辨纯度' },

  { id:'c6s4b012', ch:6, sec:4,
    kp:['mv-graph'], type:'choice', diff:2, freq:3, points:3,
    stem:'实验小组分别测出甲、乙两种实心金属块的多组质量和体积数据，画成如图所示的 m-V 图像（两条图线都过坐标原点）。已知铝的密度为 2.7 g/cm³、铁的密度为 7.9 g/cm³。根据图像判断，下列分析正确的是哪一项？',
    note:'配图为程序化绘制的 m-V 图像。', fig:'mvGraphMetal',
    parts:[{ kind:'choice', q:'根据图像，下列判断正确的是',
      opts:['甲是铁，乙是铝',
            '甲是铝，乙是铁',
            '甲、乙都是铝',
            '图像信息不足，无法判断'],
      answer:1,
      analysis:'m-V 图像中过原点直线的<b>陡峭程度</b>反映密度大小。由图读取 V = 20 cm³ 时：m甲 = 54 g，m乙 = 158 g，则 ρ甲 = 54 g ÷ 20 cm³ = <b>2.7 g/cm³</b>（铝），ρ乙 = 158 g ÷ 20 cm³ = <b>7.9 g/cm³</b>（铁）。所以<b>甲是铝、乙是铁</b>。<b>答案：B</b>' }],
    answer:null, analysis:null, src:'original', scene:'m-V图像鉴别甲乙两种金属材料' },

  { id:'c6s4b013', ch:6, sec:4,
    kp:['mass-prop'], type:'blank', diff:1, freq:3, points:4,
    stem:'铁匠铺里，师傅把一块烧红的铁块反复锻打，打成一口铁锅，随后又把它放入水中淬火冷却。请判断锻打和淬火前后，这口铁锅所含物质的多少（即质量）如何变化。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'判断质量的变化（填「变大」「变小」或「不变」）', blanks:[
      { label:'铁块锻打成铁锅后质量的变化', answer:['不变','没有变化','保持不变'], unit:'' },
      { label:'铁锅淬火冷却后质量的变化', answer:['不变','没有变化','保持不变'], unit:'' }],
      analysis:'质量是物体<b>所含物质的多少</b>，不随<b>形状、物态、位置、温度</b>改变。锻打只是改变了铁的形状，淬火只是改变了铁的温度，铁的多少都没有变，所以两空都填<b>不变</b>。' }],
    answer:null, analysis:null, src:'original', scene:'铁匠锻打铁块成锅质量不变' },

  { id:'c6s4b014', ch:6, sec:4,
    kp:['density-prop'], type:'blank', diff:1, freq:3, points:4,
    stem:'一瓶食用油标签上印有密度 0.9×10³ kg/m³。妈妈炒菜用去了半瓶；到了冬天，厨房里温度降低，瓶内剩下的油受冷后体积略有收缩（油没有凝固，也没有再添加）。请判断这两种情况下瓶内食用油的密度如何变化。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'判断密度的变化（填「变大」「变小」或「不变」）', blanks:[
      { label:'用去半瓶后，剩余油的密度', answer:['不变','没有变化','保持不变','仍是0.9×10³kg/m³'], unit:'' },
      { label:'受冷体积收缩后，瓶内油的密度', answer:['变大','增大','略微变大'], unit:'' }],
      analysis:'密度是物质的<b>特性</b>，同种物质（同状态、同温度）密度相同，用去一半后剩下的油密度<b>不变</b>，仍是 0.9×10³ kg/m³；受冷后质量不变、体积<b>变小</b>，由 ρ = m/V 可知密度<b>变大</b>。' }],
    answer:null, analysis:null, src:'original', scene:'食用油用去一半与受冷收缩的密度变化' }
];

var QBANK_C6B_ORIG_FIGS = {

  /* 天平标尺局部：0~5 g，每大格 1 g 分 5 小格（分度值 0.2 g），游码左侧停在 2.6 g——只画条件，不标答案总质量 */
  riderScale: function () {
    const ox = 40, y = 60, px = 52;          // 标尺起点、基线、1 g = 52 px
    const X = g => ox + g * px;
    let s = `<rect x="${ox - 10}" y="${y - 26}" width="${5 * px + 60}" height="80" fill="#20242e" stroke="#3a4150" rx="6"/>`;
    s += `<line x1="${X(0)}" y1="${y}" x2="${X(5)}" y2="${y}" stroke="#9aa4b5" stroke-width="2"/>`;
    for (let i = 0; i <= 25; i++) {
      const g = i * 0.2, major = i % 5 === 0, h = major ? 14 : 7;
      s += `<line x1="${X(g)}" y1="${y - h}" x2="${X(g)}" y2="${y}" stroke="${major ? '#c8d0dd' : '#6b7686'}" stroke-width="${major ? 1.5 : 1}"/>`;
      if (major) s += `<text x="${X(g) - 4}" y="${y + 18}" fill="#9aa4b5" font-size="11">${g}</text>`;
    }
    s += `<text x="${X(5) + 10}" y="${y + 5}" fill="#9aa4b5" font-size="11">g</text>`;
    const rx = X(2.6);
    s += `<path d="M ${rx} ${y - 22} L ${rx + 9} ${y - 36} L ${rx - 9} ${y - 36} Z" fill="#ffd479" stroke="#e8b84a" stroke-width="1"/>`;
    s += `<rect x="${rx - 5}" y="${y - 36}" width="10" height="8" fill="#ffd479"/>`;
    return `<svg viewBox="0 0 360 120" role="img" aria-label="天平标尺与游码位置示意">${s}</svg>`;
  },

  /* 甲乙两种金属的 m-V 图像：过原点直线，甲过(20,54)、乙过(20,158)，图内只画坐标与图线，不标密度值 */
  mvGraphMetal: function () {
    const ox = 60, oy = 250;                 // 原点
    const pxV = 10, pxM = 1.4;               // 1 cm³=10px，1 g=1.4px
    const X = v => ox + v * pxV, Y = m => oy - m * pxM;
    let s = '';
    for (let v = 5; v <= 25; v += 5) s += `<line x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(160)}" stroke="#2a3140" stroke-width="1"/>`;
    for (let m = 10; m <= 160; m += 10) s += `<line x1="${X(0)}" y1="${Y(m)}" x2="${X(25)}" y2="${Y(m)}" stroke="#2a3140" stroke-width="${m % 20 === 0 ? 1 : 0.5}"/>`;
    s += `<line x1="${ox}" y1="${oy}" x2="${X(26)}" y2="${oy}" stroke="#9aa4b5" stroke-width="1.5"/>`;
    s += `<line x1="${ox}" y1="${oy}" x2="${ox}" y2="${Y(165)}" stroke="#9aa4b5" stroke-width="1.5"/>`;
    for (let v = 5; v <= 25; v += 5) { s += `<line x1="${X(v)}" y1="${oy}" x2="${X(v)}" y2="${oy + 5}" stroke="#9aa4b5"/>`; s += `<text x="${X(v) - 5}" y="${oy + 18}" fill="#9aa4b5" font-size="11">${v}</text>`; }
    for (let m = 20; m <= 160; m += 20) { s += `<line x1="${ox - 5}" y1="${Y(m)}" x2="${ox}" y2="${Y(m)}" stroke="#9aa4b5"/>`; s += `<text x="${ox - 32}" y="${Y(m) + 4}" fill="#9aa4b5" font-size="10">${m}</text>`; }
    s += `<text x="${X(25) - 14}" y="${oy + 34}" fill="#9aa4b5" font-size="12">V/cm³</text>`;
    s += `<text x="${ox + 8}" y="${Y(163)}" fill="#9aa4b5" font-size="12">m/g</text>`;
    s += `<text x="${ox - 12}" y="${oy + 16}" fill="#9aa4b5" font-size="11">O</text>`;
    // 甲：过 (20,54)，延伸到 (25,67.5)
    s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(25)}" y2="${Y(67.5)}" stroke="#ffd479" stroke-width="2.5"/>`;
    s += `<circle cx="${X(20)}" cy="${Y(54)}" r="3.5" fill="#ffd479"/>`;
    s += `<text x="${X(21)}" y="${Y(58)}" fill="#ffd479" font-size="13" font-weight="bold">甲</text>`;
    // 乙：过 (20,158)，陡线只画到 (20,158)
    s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(20)}" y2="${Y(158)}" stroke="#5ad7ff" stroke-width="2.5"/>`;
    s += `<circle cx="${X(20)}" cy="${Y(158)}" r="3.5" fill="#5ad7ff"/>`;
    s += `<text x="${X(19) - 20}" y="${Y(150)}" fill="#5ad7ff" font-size="13" font-weight="bold">乙</text>`;
    return `<svg viewBox="0 0 380 300" role="img" aria-label="甲乙两种金属的质量体积图像">${s}</svg>`;
  }
};

if(typeof window!=="undefined"){window.QBANK_C6B_ORIG=QBANK_C6B_ORIG;window.QBANK_C6B_ORIG_FIGS=QBANK_C6B_ORIG_FIGS;}

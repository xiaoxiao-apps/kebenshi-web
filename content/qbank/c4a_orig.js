/* c4 题库 · P2 原创生产 · 2026-10-24 · c4a（s1光的直线传播 + s2光的反射 + s3平面镜成像）原创20题 */
var QBANK_C4A_ORIG = [

  { id:'c4s1b001', ch:4, sec:1,
    kp:['light-line'], type:'choice', diff:1, freq:3, points:3,
    stem:'天文社组织观看月全食。小珂说："月食发生时，太阳、地球、月球差不多排成一条直线。"下列对月食成因的解释，正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'关于月食的成因，下列说法正确的是',
      opts:['地球运行到太阳和月球之间，不透明的地球挡住了射向月球的太阳光，月球进入地球的影子而变暗',
            '月球运行到太阳和地球之间，月球挡住了太阳光，使地球上的人看不到月亮',
            '月球自己不再发光了，所以看起来变暗',
            '地球大气层把照向月球的太阳光全部折射走了'],
      answer:0,
      analysis:'月食是<b>地球</b>运行到太阳与月球之间、三者近似成一直线时，不透明的地球挡住了射向月球的太阳光，月球走进地球的影子里而变暗——本质是<b>光沿直线传播</b>。B 描述的是<b>日食</b>（月球居中）；月球本身不发光，靠反射太阳光，C、D 说法错误。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'天文社观看月全食的成因辨析' },

  { id:'c4s1b002', ch:4, sec:1,
    kp:['light-line'], type:'blank', diff:1, freq:3, points:3,
    stem:'老艺人表演皮影戏：一盏灯把不透明的皮制小人照在白色幕布上，幕布上就出现小人的暗影。请补充：幕布上出现暗影，是因为光在均匀空气中____传播，被不透明的小人挡住后，小人背后得不到光照的区域就形成了暗影。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'皮影暗影的成因', blanks:[
      { label:'光在空气中如何传播', answer:['沿直线','沿着直线','直线'], unit:'' }],
      analysis:'光在同种均匀介质（空气）中<b>沿直线</b>传播。不透明的小人挡住了部分沿直线射向幕布的光，被挡区域得不到光照，就在幕布上留下与小人轮廓对应的暗影，这正是皮影戏的原理。' }],
    answer:null, analysis:null, src:'original', scene:'老艺人表演皮影戏的暗影成因' },

  { id:'c4s1b003', ch:4, sec:1,
    kp:['light-line'], type:'experiment', diff:2, freq:3, points:6,
    stem:'小舟用一个易拉罐做小孔成像观察仪：把罐底去掉、蒙上半透明塑料薄膜当作屏，罐盖中央扎一个小孔。他把小孔对准窗外一棵被太阳照亮的树，在薄膜上看到了树的像（装置见图）。请完成下面的探究。',
    note:'配图为程序化简图，只画装置结构，不画屏上的像。', fig:'pinhole',
    parts:[
      { kind:'blank', q:'① 薄膜上看到的树像是____（选填"正立"或"倒立"）的实像。', blanks:[
        { label:'像的正倒', answer:['倒立','倒'], unit:'' }],
        analysis:'小孔成像中，来自树顶的光沿直线穿过小孔射到屏的下方，来自树底的光射到屏的上方，上下左右都对调，所以薄膜上成的是<b>倒立</b>的实像。' },
      { kind:'blank', q:'② 小孔成像这一现象，说明光在同种均匀介质中____传播。', blanks:[
        { label:'光的传播特点', answer:['沿直线','沿着直线','直线'], unit:'' }],
        analysis:'正是因为光<b>沿直线</b>传播，物体各点发出的光穿过小孔后才能一一对应地在屏上重新排布，形成倒立的实像。' },
      { kind:'choice', q:'③ 把小孔扎得更大一些（其他条件不变），薄膜上的像会怎样变化？',
        opts:['像变得更大','像变得更模糊','像由倒立变成正立','像完全消失'], answer:1,
        analysis:'孔太大时，物体每一点发出的光会在屏上形成一个个较大的光斑，相邻光斑互相重叠，像就<b>变得模糊</b>。像的大小由物距、屏到孔的距离决定，与孔的大小无关，A 错；成像的正倒、成因都不变，C、D 错。<b>答案：B</b>' } ],
    answer:null, analysis:null, src:'original', scene:'用易拉罐自制小孔成像观察仪' },

  { id:'c4s1b004', ch:4, sec:1,
    kp:['light-line'], type:'choice', diff:1, freq:3, points:3,
    stem:'夏天的树荫下，地面上常常洒满许多圆形的光斑。关于这些圆形光斑，下列说法正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'树荫下圆形光斑的成因与性质是',
      opts:['是树叶缝隙当作"小孔"、太阳通过小孔在地面成的像，属于小孔成像，说明光沿直线传播',
            '是树叶把阳光染成了圆形',
            '是地面自己发出的光',
            '是阳光经树叶反射后形成的虚像'],
      answer:0,
      analysis:'树叶之间不规则的缝隙相当于许多"小孔"，太阳通过这些"小孔"在地面上成像，形成一个个圆形光斑——这就是<b>小孔成像</b>，光斑是太阳的<b>实像</b>（形状与太阳相同、与缝隙形状无关），说明光<b>沿直线传播</b>。B、C、D 均不符合原理。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'夏天树荫下地面圆形光斑辨析' },

  { id:'c4s2b005', ch:4, sec:2,
    kp:['reflect-law'], type:'blank', diff:1, freq:5, points:4,
    stem:'一束光射到平放在桌面的平面镜上（光路见图）。请完成：①若入射光线与镜面的夹角为 50°，则反射角为____度；②保持入射光线不变，转动镜面使入射光线与镜面的夹角增大到 60°，则此时入射角为____度。',
    note:'配图为程序化简图，只画镜面、法线与入射光线，不标反射角数值。', fig:'reflectAngle',
    parts:[
      { kind:'blank', q:'① 入射光线与镜面夹角 50° 时，反射角', blanks:[
        { label:'反射角', answer:['40','40°','40度'], unit:'°' }],
        analysis:'入射角是入射光线与<b>法线</b>的夹角。入射光线与镜面成 50°，则入射角 = 90° − 50° = 40°。由反射定律，反射角 = 入射角 = <b>40°</b>。' },
      { kind:'blank', q:'② 入射光线与镜面夹角增大到 60° 时，入射角', blanks:[
        { label:'入射角', answer:['30','30°','30度'], unit:'°' }],
        analysis:'入射光线不变、转动镜面，使入射光线与镜面夹角变为 60°，则入射角 = 90° − 60° = <b>30°</b>。（可见镜面转动会改变入射角与反射角的大小。）' } ],
    answer:null, analysis:null, src:'original', scene:'激光束射向桌面平面镜的反射角计算' },

  { id:'c4s2b006', ch:4, sec:2,
    kp:['reflect-law'], type:'choice', diff:1, freq:5, points:3,
    stem:'自行车尾部装有一个红色尾灯，内部由许多组互相垂直的小平面镜组成。夜里被汽车大灯一照，它就把光"送回"汽车方向，格外醒目。关于尾灯的工作原理，下列说法正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'自行车尾灯能让来车方向格外醒目，是因为',
      opts:['光在互相垂直的两块小平面镜上先后发生两次反射，最终沿与入射方向平行且相反的方向射回光源处',
            '尾灯自己会发出红光',
            '尾灯把光折射回了汽车方向',
            '尾灯只是漫反射，把光均匀地散向各个方向'],
      answer:0,
      analysis:'互相垂直的两块平面镜组成<b>角反射器</b>：光先在一块镜面反射（反射角=入射角），再在另一块镜面反射，两次反射后出射光与入射光<b>平行且方向相反</b>，即沿来路射回。所以不论车灯从哪个角度照来，反射光都回到司机眼中，格外醒目。尾灯本身不发光，靠反射车灯的光，B、C 错；D 描述的是漫反射，不是角反射器的定向回射。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'自行车红色尾灯的角反射器原理' },

  { id:'c4s2b007', ch:4, sec:2,
    kp:['reflect-law'], type:'multi', diff:2, freq:5, points:4,
    stem:'多媒体教室里，无论坐在哪个角落，同学们都能看清投影银幕上的画面；而如果用一盏灯照在光滑的大理石地面上，只有站在某个特定方向的人才觉得刺眼。下列关于这两种现象的说法，正确的有哪几项？（多选）',
    note:null, fig:null,
    parts:[{ kind:'multi', q:'关于镜面反射与漫反射，下列说法正确的是',
      opts:['银幕表面粗糙，光射上去发生漫反射，反射光散向各个方向，所以各个角落都能看清',
            '大理石地面光滑，光射上去发生镜面反射，反射光集中射向某个方向，处在这个方向的人才觉得刺眼',
            '漫反射不遵守光的反射定律，只有镜面反射才遵守',
            '无论是镜面反射还是漫反射，每一条光线都遵守光的反射定律'],
      answer:[0,1,3],
      analysis:'粗糙银幕使平行入射的光发生<b>漫反射</b>，反射光散向四面八方，各角落的观众都能收到，A 对；光滑大理石使光发生<b>镜面反射</b>，反射光集中在特定方向，B 对。<b>漫反射同样遵守反射定律</b>——每条光线都满足"反射角=入射角"，只是表面凹凸不平使各点的法线方向不同，反射光才散向各方，C 错、D 对。<b>答案：A、B、D</b>' }],
    answer:null, analysis:null, src:'original', scene:'多媒体教室银幕与大理石地面的反射对比' },

  { id:'c4s2b008', ch:4, sec:2,
    kp:['reflect-law'], type:'experiment', diff:2, freq:5, points:8,
    stem:'小衡用一块可沿中线向后折转的白色硬纸板、平面镜和激光笔，探究光的反射规律（装置竖放，镜面立在纸板中线上）。请完成下面的探究。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 实验选用白色硬纸板，是为了能在纸板上清晰地显示____的传播路径。', blanks:[
        { label:'纸板的作用', answer:['光线','光束','光路'], unit:'' }],
        analysis:'白色纸板反光柔和、衬度高，激光照上去能看到清晰的亮线，便于显示<b>光（光线）</b>的传播路径并记录角度。' },
      { kind:'blank', q:'② 让一束光贴着纸板沿某一角度射向镜面O点，在纸板上看到反射光；把纸板的右半部分向后折转，折转后的右半部分上看不到反射光。这一现象说明：反射光线、入射光线与法线在____。', blanks:[
        { label:'三线关系', answer:['同一平面内','同一平面','一个平面内'], unit:'' }],
        analysis:'反射光只在入射光所在的那半个纸板上出现，把另一半向后折转（离开原平面）就看不到反射光，说明<b>反射光线、入射光线和法线在同一平面内</b>。' },
      { kind:'choice', q:'③ 实验中多次改变入射光的角度，分别测出入射角和反射角，这样做的目的是',
        opts:['使光路更好看','多次实验寻找普遍规律，避免结论的偶然性','让反射光更亮一些','减小激光笔的耗电'], answer:1,
        analysis:'只做一次实验得到的结论可能具有偶然性。<b>多次改变入射角、测出对应的反射角</b>，才能归纳出"反射角总等于入射角"这一<b>普遍规律</b>。<b>答案：B</b>' },
      { kind:'blank', q:'④ 让激光逆着原来反射光的方向射向镜面O点，发现新的反射光逆着原来入射光的方向射出。这说明在反射现象中，光路是____。', blanks:[
        { label:'光路特点', answer:['可逆的','可逆','可以逆转的'], unit:'' }],
        analysis:'逆着原反射光方向入射，光将逆着原入射光方向反射出去，说明反射现象中<b>光路是可逆的</b>。' } ],
    answer:null, analysis:null, src:'original', scene:'用可折转白色硬纸板探究光的反射规律' },

  { id:'c4s2b009', ch:4, sec:2,
    kp:['reflect-law'], type:'calc', diff:2, freq:5, points:8,
    stem:'野外测量队用一块平面镜把太阳光反射到远处的目标点上（光路见图）。某时刻光束与镜面成 55° 角射到镜面上的O点。请计算：<br>(1) 此时的反射角是多少度？<br>(2) 保持入射光束方向不变，把镜面绕过O点的竖直轴转动 20°，使入射角增大，此时反射光线相对转动前转过了多少度？',
    note:'配图为程序化简图，只画镜面、入射光线与已知角度，不标反射光。', fig:'mirrorRotate',
    parts:[
      { kind:'blank', q:'(1) 反射角', blanks:[
        { label:'反射角', answer:['35','35°','35度'], unit:'°' }],
        analysis:'入射角是入射光线与法线的夹角：光束与镜面成 55°，入射角 = 90° − 55° = 35°。由反射定律，反射角 = 入射角 = <b>35°</b>。' },
      { kind:'blank', q:'(2) 反射光线转过的角度', blanks:[
        { label:'反射光线转过角度', answer:['40','40°','40度'], unit:'°' }],
        analysis:'入射光方向不变、镜面转动 20°，法线随镜面同向转动 20°，入射角变为 35°+20° = 55°，反射角也变为 55°。转动前反射光与入射光夹角为 35°+35° = 70°，转动后为 55°+55° = 110°，所以反射光线转过了 110°−70° = <b>40°</b>。结论：入射光不变时，镜面转动 θ，反射光线转动 2θ。' } ],
    answer:null, analysis:null, src:'original', scene:'野外测量队平面镜反射阳光的镜面转动计算' },

  { id:'c4s2b010', ch:4, sec:2,
    kp:['reflect-law'], type:'experiment', diff:1, freq:5, points:6,
    stem:'实验室里，小度把手电筒的光束射向竖直立在量角器圆心处的平面镜，探究"反射角与入射角的关系"。她三次让光束分别以与镜面成 70°、50°、30° 的角度射向镜面，每次都记下反射光的位置。请完成下面的问题。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 第三次实验中，她测得的反射角是____°。', blanks:[
        { label:'第三次的反射角', answer:['60','60°','60度'], unit:'°' }],
        analysis:'光束与镜面成 30° 时，入射角 = 90° − 30° = 60°。反射定律：反射角<b>等于</b>入射角，故第三次反射角也是 <b>60°</b>。' },
      { kind:'choice', q:'② 根据三次数据可以得出的结论是',
        opts:['反射角总等于入射角','反射角总是入射角的一半','入射角越大，反射角越小','反射角与入射角没有任何关系'], answer:0,
        analysis:'三组数据都满足"反射角=入射角"，多次实验归纳出的结论是<b>反射角总等于入射角</b>。<b>答案：A</b>' },
      { kind:'blank', q:'③ 当入射角逐渐增大时，反射光线会逐渐____（选填"靠近"或"远离"）法线。', blanks:[
        { label:'反射光线的变化', answer:['远离','偏离'], unit:'' }],
        analysis:'反射角始终等于入射角。入射角增大，反射角随之增大，入射光线与反射光线都<b>远离</b>法线（但分居法线两侧的关系不变）。' } ],
    answer:null, analysis:null, src:'original', scene:'手电筒光束配量角器探究反射角与入射角关系' },

  { id:'c4s3b011', ch:4, sec:3,
    kp:['mirror-image'], type:'choice', diff:1, freq:5, points:3,
    stem:'鞋店里有一面竖直放置的试鞋镜。小美站在镜前试鞋，然后向镜子走近了两步。关于她在镜中的像，下列说法正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'小美走近试鞋镜的过程中，她在镜中的像',
      opts:['大小不变，像到镜面的距离变小','大小变大，像到镜面的距离变小','大小变小，像到镜面的距离变大','大小不变，像到镜面的距离不变'],
      answer:0,
      analysis:'平面镜成像特点：像与物<b>大小相等</b>、像与物到镜面的距离<b>相等</b>、成<b>正立的虚像</b>。人走近镜子时，人本身大小没变，像的大小也<b>不变</b>；人到镜面的距离变小，像到镜面的距离也<b>变小</b>。"感觉像变大"只是视角变大的错觉。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'鞋店试鞋镜前走近时像的变化' },

  { id:'c4s3b012', ch:4, sec:3,
    kp:['mirror-image'], type:'experiment', diff:1, freq:5, points:8,
    stem:'物理课上，同学们用一块薄玻璃板、两支完全相同的蜡烛、白纸和刻度尺，在水平桌面上探究平面镜成像的特点。请完成下面的探究。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 实验用薄玻璃板代替平面镜，主要是为了便于确定____。', blanks:[
        { label:'用玻璃板的目的', answer:['像的位置','像的位置和大小','像的位置与大小'], unit:'' }],
        analysis:'玻璃板既能<b>反射</b>光成像，又能<b>透光</b>，透过玻璃板能看到后面的蜡烛，便于把另一支蜡烛移到与像完全重合的位置，从而确定<b>像的位置</b>（进而比较大小）。' },
      { kind:'blank', q:'② 把点燃的蜡烛A立在玻璃板前，再将未点燃的相同蜡烛B放到玻璃板后移动，直到B与A的像完全重合。用两支完全相同的蜡烛，是为了比较像与物的____关系。', blanks:[
        { label:'相同蜡烛的目的', answer:['大小','大小关系'], unit:'' }],
        analysis:'B 与 A 的像完全重合，说明像与 B 一样大；又因为 B 与 A 完全相同，所以像与物<b>大小相等</b>——用相同蜡烛正是为了比较像与物的<b>大小</b>关系。' },
      { kind:'blank', q:'③ 移去蜡烛B，在其位置竖放一张白纸（光屏），在白纸上____（选填"能"或"不能"）直接承接到蜡烛A的像，这说明平面镜成的是虚像。', blanks:[
        { label:'光屏能否承接', answer:['不能','承接不到'], unit:'' }],
        analysis:'平面镜成的是<b>虚像</b>：它不是实际光线会聚而成的，而是反射光反向延长线的交点，所以光屏（白纸）上<b>不能</b>直接承接。' },
      { kind:'choice', q:'④ 实验中多次改变蜡烛A到玻璃板的距离，每次都重新确定像的位置并测量，这样做的目的是',
        opts:['使蜡烛烧得慢一些','多次实验寻找普遍规律，避免结论的偶然性','让像更亮更清楚','节省实验时间'], answer:1,
        analysis:'只凭一组数据下结论有偶然性。<b>多次改变物距、重复实验</b>，才能得出"像与物到镜面距离始终相等"等<b>普遍规律</b>。<b>答案：B</b>' } ],
    answer:null, analysis:null, src:'original', scene:'薄玻璃板与相同蜡烛探究平面镜成像特点' },

  { id:'c4s3b013', ch:4, sec:3,
    kp:['mirror-image'], type:'choice', diff:1, freq:5, points:3,
    stem:'小柯用纸筒和两块小平面镜制作了一个简易潜望镜，藏在矮墙后就能观察到墙外的情况。关于潜望镜，下列说法正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'关于潜望镜的原理与成像，下列说法正确的是',
      opts:['筒内两块平面镜都与水平方向成 45° 角，光经过两次反射进入人眼，看到的是与物体等大的正立虚像',
            '筒内只需一块平面镜，光经一次反射就能进入人眼',
            '看到的像比实际物体小，因为光在筒内走了弯路',
            '潜望镜利用的是光的折射现象'],
      answer:0,
      analysis:'潜望镜筒内上下各有一块与水平方向成 <b>45°</b> 角的平面镜：水平射入的光被第一块镜面向下反射，再被第二块镜面水平反射进入人眼，共发生<b>两次反射</b>，利用的是光的<b>反射</b>（平面镜成像），B、D 错。平面镜成<b>正立、等大</b>的虚像，像的大小与光路弯折无关，C 错。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'纸筒自制简易潜望镜的原理' },

  { id:'c4s3b014', ch:4, sec:3,
    kp:['mirror-image'], type:'blank', diff:1, freq:5, points:6,
    stem:'舞蹈房里，整面墙都装着大练功镜。小雅对着练功镜练习动作。请补充：①她在镜中看到的自己是光的反射形成的____像；②镜中像的大小与她本人的大小____；③她抬起右手时，镜中的像抬起的是____手。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'练功镜成像特点', blanks:[
      { label:'①像的虚实', answer:['虚','虚像'], unit:'' },
      { label:'②像与物的大小', answer:['相等','一样大','相同'], unit:'' },
      { label:'③像抬起哪只手', answer:['左','左手'], unit:'' }],
      analysis:'平面镜成的是<b>虚像</b>（反射光反向延长线的交点，光屏承接不到）；像与物<b>大小相等</b>；像与物关于镜面<b>对称</b>，左右对调，所以人抬右手时，镜中的像抬的是<b>左手</b>。' }],
    answer:null, analysis:null, src:'original', scene:'舞蹈房大练功镜前练习动作' },

  { id:'c4s3b015', ch:4, sec:3,
    kp:['mirror-image'], type:'calc', diff:3, freq:5, points:8,
    stem:'卧室衣帽间里立着一面竖直的穿衣镜。小泽站在镜前 3 m 处整理着装，随后以 0.5 m/s 的速度垂直走向镜面，走了 2 s。请计算：<br>① 他刚站定时，镜中的像与他本人相距多少米？<br>② 走了 2 s 后，镜中的像与他本人相距多少米？<br>③ 在他走向镜面的过程中，像相对于他本人的速度是多少米每秒？',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'(1) 刚站定时像与人的距离', blanks:[
        { label:'像与人的距离', answer:['6','6m','6米'], unit:'m' }],
        analysis:'平面镜成像中像与物到镜面距离相等：人距镜 3 m，像距镜也是 3 m，所以像与人相距 3 m + 3 m = <b>6 m</b>。' },
      { kind:'blank', q:'(2) 走了 2 s 后像与人的距离', blanks:[
        { label:'像与人的距离', answer:['4','4m','4米'], unit:'m' }],
        analysis:'2 s 内人向镜面前进 s = vt = 0.5 m/s × 2 s = 1 m，此时人距镜 3 m − 1 m = 2 m，像距镜也是 2 m，像与人相距 2 m + 2 m = <b>4 m</b>。' },
      { kind:'blank', q:'(3) 像相对于人的速度', blanks:[
        { label:'像相对于人的速度', answer:['1','1m/s','1 m/s','1米每秒'], unit:'m/s' }],
        analysis:'人以 0.5 m/s 走向镜面，由对称性，像也以 0.5 m/s 走向镜面，两者相向"靠近"，像相对于人的速度 = 0.5 m/s + 0.5 m/s = <b>1 m/s</b>。验证：2 s 内像与人的距离从 6 m 减到 4 m，缩小了 2 m，相对速度 = 2 m ÷ 2 s = 1 m/s，一致。' } ],
    answer:null, analysis:null, src:'original', scene:'衣帽间穿衣镜前匀速走近的计算' },

  { id:'c4s3b016', ch:4, sec:3,
    kp:['mirror-image'], type:'blank', diff:1, freq:5, points:6,
    stem:'中秋夜晚，一轮明月倒映在平静的池塘里。请补充：①水中明亮的"月亮"是光的____形成的；②它是____像；③月亮逐渐升高时，水中"月亮"的大小____。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'水中的月亮', blanks:[
      { label:'①成因', answer:['反射','镜面反射'], unit:'' },
      { label:'②像的虚实', answer:['虚','虚像'], unit:'' },
      { label:'③像的大小变化', answer:['不变'], unit:'' }],
      analysis:'平静的水面相当于平面镜，水中的"月亮"是月光经水面<b>反射</b>形成的<b>虚像</b>。由平面镜成像特点，像与物大小相等：月亮本身大小不变，所以水中"月亮"的大小也<b>不变</b>；月亮升高时只是像到水面的距离变大，与池中水的深浅也无关。' }],
    answer:null, analysis:null, src:'original', scene:'中秋夜平静池塘倒映明月' },

  { id:'c4s3b017', ch:4, sec:3,
    kp:['mirror-image'], type:'experiment', diff:1, freq:5, points:6,
    stem:'小循小组在"探究平面镜成像特点"实验中，把点燃的蜡烛先后放在玻璃板前不同位置，用刻度尺测出每次蜡烛（物）和它的像到玻璃板的距离，记录如下表：<br>第1次：物距 5 cm，像距 5 cm；第2次：物距 10 cm，像距 10 cm；第3次：物距 15 cm，像距 15 cm。<br>请根据表中数据完成下面的问题。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 分析三次数据可得：像到平面镜的距离与物到平面镜的距离____。', blanks:[
        { label:'像距与物距的关系', answer:['相等','一样大','相同'], unit:'' }],
        analysis:'三次实验中像距都等于物距（5=5、10=10、15=15），结论：平面镜所成的像与物到镜面的距离<b>相等</b>。' },
      { kind:'blank', q:'② 用刻度尺把蜡烛和它像的位置连起来，发现这条连线与镜面____。', blanks:[
        { label:'连线与镜面的关系', answer:['垂直'], unit:'' }],
        analysis:'实验测量表明：像与物的连线与镜面<b>垂直</b>。与"像距=物距"合起来即：像与物关于镜面<b>对称</b>。' },
      { kind:'choice', q:'③ 第3次实验后，把蜡烛向玻璃板移近一段距离，蜡烛所成像的大小将',
        opts:['变大','变小','不变','先变大后变小'], answer:2,
        analysis:'平面镜所成的像与物<b>大小相等</b>，像的大小只由物体本身大小决定，与物距无关。移近玻璃板，蜡烛大小没变，像的大小<b>不变</b>。<b>答案：C</b>' } ],
    answer:null, analysis:null, src:'original', scene:'成像实验物距像距三组数据分析' },

  { id:'c4s3b018', ch:4, sec:3,
    kp:['mirror-image'], type:'blank', diff:1, freq:5, points:4,
    stem:'小蕊站在梳妆台前 2 m 处梳头。请补充：①镜中她的像与她本人相距____m；②她向镜面走近 0.5 m 后，像到镜面的距离为____m。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'梳妆镜成像距离', blanks:[
      { label:'①像与人的距离', answer:['4','4m','4米'], unit:'m' },
      { label:'②像到镜面的距离', answer:['1.5','1.5m','1.5米'], unit:'m' }],
      analysis:'①像与物到镜面距离相等：人距镜 2 m，像距镜 2 m，像与人相距 2 m + 2 m = <b>4 m</b>。②走近 0.5 m 后，人距镜 2 m − 0.5 m = 1.5 m，像到镜面的距离也是 <b>1.5 m</b>。' }],
    answer:null, analysis:null, src:'original', scene:'梳妆台前梳头的像距计算' },

  { id:'c4s2b019', ch:4, sec:2,
    kp:['reflect-law'], type:'calc', diff:3, freq:5, points:8,
    stem:'科技馆的"光学迷宫"展项里，两块平面镜 M1、M2 互相垂直放置（简图见图）。一束激光以 30° 的入射角射到 M1 镜面上，经 M1 反射后射到 M2 上，再经 M2 反射后射出。请计算：<br>(1) 这束光射到 M2 上时的入射角是多少度？<br>(2) 经 M2 反射后的出射光线与最初的入射光线是什么位置关系？',
    note:'配图为程序化简图，只画两镜位置与入射光及已知角度，不画后两段反射光。', fig:'perpMirror',
    parts:[
      { kind:'blank', q:'(1) 射到 M2 上的入射角', blanks:[
        { label:'M2上的入射角', answer:['60','60°','60度'], unit:'°' }],
        analysis:'光在 M1 上以 30° 入射、以 30° 反射，反射光线与 M1 镜面的夹角 = 90° − 30° = 60°。由于 M1 与 M2 <b>互相垂直</b>，这段反射光、M1、M2 围成一个直角三角形：该光线与 M2 镜面的夹角 = 90° − 60° = 30°，所以它在 M2 上的入射角（与 M2 法线的夹角）= 90° − 30° = <b>60°</b>。' },
      { kind:'blank', q:'(2) 出射光线与最初入射光线的位置关系', blanks:[
        { label:'位置关系', answer:['平行且方向相反','平行反向','反向平行','平行','沿原路反向射出','与入射光线平行且反向'], unit:'' }],
        analysis:'在 M2 上以 60° 入射、以 60° 反射。几何上可以证明：两镜垂直时，两次反射使光线方向恰好偏转 180°，出射光线与最初的入射光线<b>平行且方向相反</b>（沿来路返回）。这正是角反射器"回射"的原理——不论入射方向如何，出射光总与入射光反向平行。' } ],
    answer:null, analysis:null, src:'original', scene:'科技馆光学迷宫两块垂直镜面的双重反射' },

  { id:'c4s3b020', ch:4, sec:3,
    kp:['mirror-image'], type:'choice', diff:1, freq:5, points:3,
    stem:'物理课上，老师请同学们在下列四个"影"或"像"中，找出属于平面镜成像的那一个。下列判断正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'下列"影"或"像"中，属于平面镜成像的是',
      opts:['阳光下地面上人的黑影','电影银幕上放出的画面','人在平静湖面看到自己的倒影','放大镜下看到的放大的字'],
      answer:2,
      analysis:'A 是影子——光沿直线传播被人体遮挡形成的暗区，不是像；B 银幕上的画面是投影机投出的<b>实像</b>（能在屏上承接）；C 平静的湖面相当于平面镜，"倒影"是平面镜成的<b>正立等大虚像</b>，正确；D 是光的<b>折射</b>（凸透镜）成的像。<b>答案：C</b>' }],
    answer:null, analysis:null, src:'original', scene:'辨别影、实像与平面镜虚像的例子' }

];

var QBANK_C4A_ORIG_FIGS = {
  pinhole: function(){
    let s = '';
    s += '<rect x="150" y="120" width="150" height="90" fill="#3a4250" stroke="#9aa4b5" stroke-width="2"/>';
    s += '<text x="185" y="170" fill="#d7dee9" font-size="12">易拉罐</text>';
    s += '<line x1="150" y1="120" x2="150" y2="210" stroke="#9aa4b5" stroke-width="3"/>';
    s += '<circle cx="150" cy="165" r="4" fill="#ffd479"/>';
    s += '<text x="118" y="150" fill="#ffd479" font-size="11">小孔</text>';
    s += '<line x1="300" y1="118" x2="300" y2="212" stroke="#5ad7ff" stroke-width="3"/>';
    s += '<text x="306" y="170" fill="#5ad7ff" font-size="11">薄膜(屏)</text>';
    s += '<line x1="60" y1="130" x2="146" y2="163" stroke="#ff7a6e" stroke-width="2"/>';
    s += '<line x1="60" y1="200" x2="146" y2="167" stroke="#ff7a6e" stroke-width="2"/>';
    s += '<text x="30" y="118" fill="#ff7a6e" font-size="11">树(物)</text>';
    s += '<line x1="60" y1="120" x2="60" y2="210" stroke="#6b8f5a" stroke-width="4"/>';
    return '<svg viewBox="0 0 460 300" role="img" aria-label="小孔成像装置简图">' + s + '</svg>';
  },
  reflectAngle: function(){
    const OX = 230, OY = 210;
    let s = '';
    s += '<line x1="40" y1="'+OY+'" x2="420" y2="'+OY+'" stroke="#9aa4b5" stroke-width="4"/>';
    s += '<text x="330" y="'+(OY+22)+'" fill="#6b7686" font-size="11">镜面</text>';
    s += '<line x1="'+OX+'" y1="50" x2="'+OX+'" y2="'+OY+'" stroke="#ffd479" stroke-width="1.5" stroke-dasharray="5 4"/>';
    s += '<text x="'+(OX+6)+'" y="64" fill="#ffd479" font-size="11">N(法线)</text>';
    const a = 50*Math.PI/180;
    const ix = OX - 140*Math.cos(a), iy = OY - 140*Math.sin(a);
    s += '<line x1="'+ix.toFixed(1)+'" y1="'+iy.toFixed(1)+'" x2="'+OX+'" y2="'+OY+'" stroke="#ff7a6e" stroke-width="2.5"/>';
    s += '<text x="'+(ix-30).toFixed(1)+'" y="'+(iy+4).toFixed(1)+'" fill="#ff7a6e" font-size="11">入射光线</text>';
    s += '<text x="'+(OX-52)+'" y="'+(OY-14)+'" fill="#9aa4b5" font-size="11">50°</text>';
    s += '<text x="'+OX+'" y="'+(OY+14)+'" fill="#d7dee9" font-size="11">O</text>';
    return '<svg viewBox="0 0 460 300" role="img" aria-label="光的反射光路简图">' + s + '</svg>';
  },
  mirrorRotate: function(){
    const OX = 230, OY = 220;
    let s = '';
    s += '<line x1="80" y1="'+OY+'" x2="410" y2="'+OY+'" stroke="#9aa4b5" stroke-width="4"/>';
    s += '<text x="330" y="'+(OY+20)+'" fill="#6b7686" font-size="11">镜面(可绕O转)</text>';
    const a = 55*Math.PI/180;
    const ix = OX - 150*Math.cos(a), iy = OY - 150*Math.sin(a);
    s += '<line x1="'+ix.toFixed(1)+'" y1="'+iy.toFixed(1)+'" x2="'+OX+'" y2="'+OY+'" stroke="#ff7a6e" stroke-width="2.5"/>';
    s += '<text x="'+(ix-58).toFixed(1)+'" y="'+(iy+2).toFixed(1)+'" fill="#ff7a6e" font-size="11">入射光线(不变)</text>';
    s += '<text x="'+(OX-64)+'" y="'+(OY-12)+'" fill="#ffd479" font-size="11">55°</text>';
    s += '<circle cx="'+OX+'" cy="'+OY+'" r="3" fill="#ffd479"/>';
    s += '<text x="'+(OX+4)+'" y="'+(OY+16)+'" fill="#d7dee9" font-size="11">O</text>';
    return '<svg viewBox="0 0 460 300" role="img" aria-label="转动镜面反射简图">' + s + '</svg>';
  },
  perpMirror: function(){
    const O = {x:280, y:210};
    let s = '';
    s += '<line x1="'+O.x+'" y1="60" x2="'+O.x+'" y2="'+O.y+'" stroke="#9aa4b5" stroke-width="4"/>';
    s += '<line x1="120" y1="'+O.y+'" x2="'+O.x+'" y2="'+O.y+'" stroke="#9aa4b5" stroke-width="4"/>';
    s += '<text x="'+(O.x+6)+'" y="90" fill="#6b7686" font-size="11">镜M2</text>';
    s += '<text x="150" y="'+(O.y+18)+'" fill="#6b7686" font-size="11">镜M1</text>';
    const a = 30*Math.PI/180;
    const S = {x: O.x-150*Math.cos(a), y: O.y-150*Math.sin(a)};
    s += '<line x1="'+S.x.toFixed(1)+'" y1="'+S.y.toFixed(1)+'" x2="'+O.x+'" y2="'+O.y+'" stroke="#ff7a6e" stroke-width="2.5"/>';
    s += '<text x="'+(S.x-10).toFixed(1)+'" y="'+S.y.toFixed(1)+'" fill="#ff7a6e" font-size="11">入射光</text>';
    s += '<text x="'+(O.x-70)+'" y="'+(O.y-40)+'" fill="#ffd479" font-size="11">入射角30°</text>';
    s += '<circle cx="'+O.x+'" cy="'+O.y+'" r="3" fill="#ffd479"/>';
    return '<svg viewBox="0 0 460 300" role="img" aria-label="两块垂直平面镜反射简图">' + s + '</svg>';
  }
};

if(typeof window!=="undefined"){window.QBANK_C4A_ORIG=QBANK_C4A_ORIG;window.QBANK_C4A_ORIG_FIGS=QBANK_C4A_ORIG_FIGS;}

/* c5 题库 · P2 原创生产 · 2026-10-24 · c5a（s1透镜 + s2生活中的透镜）原创14题 */
var QBANK_C5A_ORIG = [

  { id:'c5s1b001', ch:5, sec:1,
    kp:['lens-identify'], type:'choice', diff:1, freq:3, points:3,
    stem:'天文社团架起一台自制的折射式简易望远镜：纸筒前端装着物镜，靠近眼睛的一端装着目镜，用它能看清远处月球的环形山。关于这台望远镜的两块镜片，下列说法正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'关于物镜和目镜的镜片类型，下列说法正确的是',
      opts:['物镜和目镜都是凸透镜',
            '物镜是凸透镜，目镜是凹透镜',
            '物镜是凹透镜，目镜是凸透镜',
            '物镜和目镜都是凹透镜'],
      answer:0,
      analysis:'简易折射式望远镜的<b>物镜</b>让远处物体在焦点附近成倒立、缩小的实像，<b>目镜</b>再把这个像当"物体"放大观察（相当于放大镜）——两者都要能会聚光，都是<b>凸透镜</b>。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'天文社团折射式简易望远镜的镜片辨析' },

  { id:'c5s1b002', ch:5, sec:1,
    kp:['lens-identify'], type:'choice', diff:1, freq:3, points:3,
    stem:'光学器材厂的质检台上并排摆着四块透明光学元件，它们的纵截面形状见下图。其中属于凸透镜的是哪一块？',
    note:'图为四块光学元件的纵截面示意（A、B、C、D）。', fig:'lensCross4',
    parts:[{ kind:'choice', q:'图中属于凸透镜的是',
      opts:['A','B','C','D'],
      answer:0,
      analysis:'凸透镜的特征是<b>中间厚、边缘薄</b>。图中 A 两侧都向外鼓出，中间最厚、上下两端最薄，是（双）凸透镜；B 两侧都向内凹，中间薄、边缘厚，是凹透镜；C 一面平、一面凹，也属凹透镜家族；D 两面平行、厚度均匀，是玻璃砖，对光既不会聚也不发散。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'光学器材厂质检台按纵截面分拣透镜' },

  { id:'c5s1b003', ch:5, sec:1,
    kp:['lens-identify','real-virtual'], type:'blank', diff:1, freq:3, points:4,
    stem:'清晨的荷塘边，小蕊发现一片荷叶上悬着一颗圆圆的露珠。她隔着露珠看叶片上的细脉，细脉被放大了。请根据这一现象填空。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'露珠相当于哪一种透镜？看到的像是什么性质的像？', blanks:[
      { label:'露珠相当于', answer:['凸透镜','凸透','会聚透镜'], unit:'' },
      { label:'看到的像', answer:['虚像','正立放大的虚像','正立、放大的虚像','放大虚像'], unit:'' }],
      analysis:'圆圆的露珠<b>中间厚、边缘薄</b>，相当于一个<b>凸透镜</b>；叶脉离露珠很近（物距小于焦距），此时凸透镜起放大镜作用，成<b>正立、放大的虚像</b>——虚像不能用光屏承接，只能用眼睛透过露珠看到。' }],
    answer:null, analysis:null, src:'original', scene:'荷叶露珠当放大镜观察叶脉' },

  { id:'c5s1b004', ch:5, sec:1,
    kp:['image-exp'], type:'experiment', diff:1, freq:5, points:6,
    stem:'小岩想测出爷爷那把老放大镜（凸透镜）的焦距。他把放大镜正对窗外的远处楼房，在透镜另一侧移动白屏，直到屏上出现楼房清晰的像，再用刻度尺量出白屏到透镜的距离。请回答下列问题。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'(1) 白屏上远处楼房的像有什么特点？', blanks:[
        { label:'像的特点', answer:['倒立缩小的实像','倒立、缩小的实像','倒立缩小实像'], unit:'' }],
        analysis:'远处楼房的物距远大于二倍焦距，凸透镜成<b>倒立、缩小的实像</b>，能被白屏承接。' },
      { kind:'blank', q:'(2) 物距很大时，像的位置非常接近凸透镜的哪个特殊位置？（即白屏此时大致处在什么地方）', blanks:[
        { label:'白屏的位置', answer:['焦点','焦点处','焦点附近','焦点的位置','近焦点处'], unit:'' }],
        analysis:'物体在很远处时，所成实像的位置非常接近<b>焦点</b>，像距≈焦距。量出白屏到透镜的距离，就近似得到这把放大镜的焦距（若测得约 10 cm，则焦距约 10 cm）。' },
      { kind:'choice', q:'(3) 换一块凹透镜，还能用"白屏承接远处物体的像"的方法测焦距吗？',
        opts:['不能，凹透镜对光有发散作用，不能在屏上成实像',
              '能，凹透镜同样能在屏上成倒立的像',
              '能，只要把白屏换得更大一些',
              '不能，因为凹透镜不透光'],
        answer:0,
        analysis:'凹透镜对光起<b>发散</b>作用，让光线散开，不能把光会聚到屏上成实像，所以这种方法对凹透镜<b>不适用</b>。凹透镜能透光，只是不"聚"光。<b>答案：A</b>' } ],
    answer:null, analysis:null, src:'original', scene:'窗边用远处楼房成像法估测放大镜焦距' },

  { id:'c5s2b001', ch:5, sec:2,
    kp:['real-virtual'], type:'multi', diff:1, freq:3, points:4,
    stem:'复习课上，同学们列举了四个生活中常见的光学成像现象。其中成的是虚像的有哪些？（多选）',
    note:null, fig:null,
    parts:[{ kind:'multi', q:'下列现象中，成虚像的是',
      opts:['用放大镜看到药盒说明书上放大的字',
            '汽车凸面后视镜里看到的车后景物',
            '电影院放映机投在银幕上的画面',
            '自拍时手机感光元件上记录的人脸'],
      answer:[0,1],
      analysis:'<b>虚像</b>不能用光屏承接，只能逆着出射光用眼睛看到：放大镜成的正立放大的像是<b>虚像</b>（A 对）；凸面后视镜里的像是反射光反向延长线会聚而成的<b>虚像</b>（B 对）。银幕上的画面能被银幕承接（C 是实像）；手机感光元件相当于光屏，能记录下来的必是<b>实像</b>（D 错）。<b>答案：AB</b>' }],
    answer:null, analysis:null, src:'original', scene:'生活光学成像现象的虚实归类' },

  { id:'c5s2b002', ch:5, sec:2,
    kp:['image-rule'], type:'choice', diff:1, freq:5, points:3,
    stem:'运动会上，小屿举着镜头可伸缩的相机拍摄径赛。跑道上的运动员正从远处朝镜头方向跑来。为了让运动员的像始终清晰地成在感光元件上，小屿应该怎样调节镜头？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'运动员靠近相机时，正确的调节方式是',
      opts:['把镜头向前伸出，增大镜头与感光元件间的距离',
            '把镜头向后缩进，减小镜头与感光元件间的距离',
            '保持镜头不动，把相机举高一些',
            '保持镜头不动，人向后退两步'],
      answer:0,
      analysis:'成实像时遵循"<b>物近像远像变大</b>"：运动员靠近镜头（物距减小），像距要变大，像才能重新清晰地落在感光元件上，所以应把镜头<b>向前伸出</b>、增大镜头与感光元件的距离（D 虽然也增大了物距，但属于躲开被摄物体，不是调相机的做法）。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'运动会拍摄迎面跑来的运动员时调焦' },

  { id:'c5s2b003', ch:5, sec:2,
    kp:['lens-app'], type:'choice', diff:1, freq:4, points:3,
    stem:'下面四种常见的光学器具中，利用凸透镜成"倒立、放大的实像"工作的是哪一种？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'成倒立、放大实像的光学器具是',
      opts:['投影仪','照相机','放大镜','近视眼镜'],
      answer:0,
      analysis:'<b>投影仪</b>：投影片位于一倍焦距与二倍焦距之间（f<u<2f），成<b>倒立、放大的实像</b>投到屏幕上。照相机成倒立缩小的实像；放大镜成正立放大的虚像；近视眼镜是凹透镜，成正立缩小的虚像。<b>答案：A</b>' }],
    answer:null, analysis:null, src:'original', scene:'四种光学器具成像特点识别' },

  { id:'c5s2b004', ch:5, sec:2,
    kp:['lens-app'], type:'blank', diff:1, freq:4, points:4,
    stem:'野外徒步时，小舟用一块焦距为 12 cm 的放大镜查看地图上的一处小字标注。请根据放大镜的使用条件填空。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'地图上的字到放大镜的距离应满足什么条件？看到的像有什么特点？', blanks:[
      { label:'字到放大镜的距离', answer:['小于12cm','小于12 cm','12cm以内','焦距以内','小于焦距','一倍焦距以内','小于12厘米'], unit:'' },
      { label:'像的特点', answer:['正立放大的虚像','正立、放大的虚像','正立放大虚像'], unit:'' }],
      analysis:'放大镜是凸透镜，被观察的物体必须放在<b>一倍焦距以内</b>（此题即距放大镜<b>小于 12 cm</b>），才能成<b>正立、放大的虚像</b>；物距一旦达到或超过焦距，就看不到放大的虚像了。' }],
    answer:null, analysis:null, src:'original', scene:'野外徒步用放大镜查看地图小字' },

  { id:'c5s2b005', ch:5, sec:2,
    kp:['image-rule'], type:'experiment', diff:2, freq:5, points:8,
    stem:'教室里新装了一台投影仪，投影片到镜头的距离可以在小范围内调节。开机试投时，画面清晰地呈现在屏幕上，但画面偏小，没有铺满整块屏幕。安装师傅先把投影仪向远离屏幕的方向挪了一段距离，画面铺满了屏幕，却变得模糊了。请结合凸透镜成像规律回答下列问题。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'(1) 把投影仪向远离屏幕的方向挪动，增大了什么？画面为什么会变大？', blanks:[
        { label:'挪动投影仪增大的是', answer:['像距','镜头到屏幕的距离','像到透镜的距离'], unit:'' }],
        analysis:'屏幕上的画面是投影片经镜头所成的实像，投影仪离屏幕更远，就是增大了<b>像距</b>；成实像时"物近像远像变大"，像距变大，画面随之变大。' },
      { kind:'choice', q:'(2) 画面变模糊后，应怎样调节镜头才能让画面重新清晰？',
        opts:['调节镜头使它靠近投影片一些（减小物距）',
              '调节镜头使它远离投影片一些（增大物距）',
              '把镜头拆下来擦一擦再原样装回',
              '不用再调节，等镜头温度升高自然就清晰了'],
        answer:0,
        analysis:'像距已经变大，要让像重新清晰地落在屏幕上，须按"物近像远像变大"把<b>物距调小</b>——即让镜头<b>靠近投影片</b>一些。B 会让像距需求更大、更模糊；C、D 与成像位置无关。<b>答案：A</b>' },
      { kind:'blank', q:'(3) 用一句话概括本实验用到的凸透镜成实像的动态规律。', blanks:[
        { label:'动态规律', answer:['物近像远像变大','物近像远，像变大','物体靠近透镜，像远离透镜，像变大','物距减小像距增大像变大'], unit:'' }],
        analysis:'凸透镜成实像时：<b>物近像远像变大</b>（物距减小，像距增大，像变大）；反之"物远像近像变小"。' } ],
    answer:null, analysis:null, src:'original', scene:'教室新装投影仪画面偏小的调节探究' },

  { id:'c5s2b006', ch:5, sec:2,
    kp:['lens-app','image-exp'], type:'experiment', diff:1, freq:4, points:8,
    stem:'科技小组用两个纸筒自制了一台"照相机"：外筒前端固定一块凸透镜，内筒末端蒙一张半透明薄纸当作"胶片"，内筒可以在外筒里前后拉动。他们把镜头对准窗外远处的教学楼进行观察。请回答下列问题。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'(1) 半透明薄纸上呈现的教学楼的像有什么特点？', blanks:[
        { label:'像的特点', answer:['倒立缩小的实像','倒立、缩小的实像','倒立缩小实像'], unit:'' }],
        analysis:'远处的教学楼物距远大于二倍焦距，凸透镜成<b>倒立、缩小的实像</b>，能被半透明薄纸（相当于胶片）承接——这正是照相机的成像原理。' },
      { kind:'choice', q:'(2) 把"照相机"逐渐靠近教学楼，薄纸上的像变模糊了。要重新得到清晰的像，应该怎么做？',
        opts:['把内筒向外拉出一些，增大镜头到薄纸的距离',
              '把内筒向里推进一些，减小镜头到薄纸的距离',
              '保持内筒不动，把眼睛离薄纸更远一些',
              '换一块焦距更大的凸透镜，其它都不动'],
        answer:0,
        analysis:'靠近教学楼即<b>物距减小</b>，由"物近像远像变大"，像距要变大，应把内筒<b>向外拉出</b>、增大镜头到薄纸的距离，像才重新清晰（此时像也比原来大）。<b>答案：A</b>' },
      { kind:'blank', q:'(3) 薄纸上的像能被承接，说明它是实像。实像与虚像的一个关键区别是什么？', blanks:[
        { label:'关键区别', answer:['实像能用光屏承接，虚像不能','实像能被光屏承接虚像不能','实像是光实际会聚而成的，虚像不是','实像由实际光线会聚而成，可用光屏承接；虚像不能'], unit:'' }],
        analysis:'实像是<b>光实际会聚</b>而成的，能用光屏（薄纸、银幕、感光元件）承接；虚像不是实际光线的会聚点，<b>光屏承接不到</b>，只能用眼睛逆着出射光观察。' } ],
    answer:null, analysis:null, src:'original', scene:'双纸筒自制照相机观察远处教学楼' },

  { id:'c5s2b007', ch:5, sec:2,
    kp:['eye-glass'], type:'blank', diff:1, freq:4, points:6,
    stem:'眼镜店柜台上放着两副刚配好、还没贴标签的眼镜：一副是老花镜，一副是近视镜。店员小宛只凭观察和简单操作就把它们区分开了。请填空。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'区分老花镜与近视镜', blanks:[
      { label:'老花镜的镜片类型', answer:['凸透镜','凸透','会聚透镜'], unit:'' },
      { label:'近视镜的镜片类型', answer:['凹透镜','凹透','发散透镜'], unit:'' },
      { label:'正对太阳能会聚出最小亮斑的那副，镜片是', answer:['凸透镜','凸透','会聚透镜'], unit:'' }],
      analysis:'老花镜（远视镜）用<b>凸透镜</b>会聚光，帮助像前移回到视网膜上；近视镜用<b>凹透镜</b>发散光，帮助像后移回到视网膜上。区分方法：①摸——中间厚边缘薄的是老花镜；②隔镜看字——放大的是老花镜、缩小的是近视镜；③正对太阳——能把阳光<b>会聚成最小亮斑</b>（焦点）的是<b>凸透镜</b>，即老花镜。' }],
    answer:null, analysis:null, src:'original', scene:'眼镜店柜台区分老花镜与近视镜' },

  { id:'c5s2b008', ch:5, sec:2,
    kp:['eye-glass'], type:'calc', diff:2, freq:4, points:6,
    stem:'眼镜片的"度数"与焦距有这样的关系：度数 = 100 / 焦距（焦距的单位用米）。近视镜片度数为负值，计算焦距时取其绝对值。妈妈新配的眼镜镜片上标着"-250 度"。请解答下列问题。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'(1) 妈妈的镜片是凸透镜还是凹透镜？', blanks:[
        { label:'镜片类型', answer:['凹透镜','凹透'], unit:'' }],
        analysis:'度数为<b>负值</b>（-250 度）表示这是<b>近视镜片</b>，近视镜用<b>凹透镜</b>（发散光，使像后移回到视网膜上）。' },
      { kind:'blank', q:'(2) 这块镜片的焦距是多少厘米？', blanks:[
        { label:'焦距', answer:['40','40cm','40 cm','0.4m','0.4 m'], unit:'cm' }],
        analysis:'由 度数 = 100 / f（f 以米为单位），取绝对值：f = 100 / 250 = <b>0.4 m = 40 cm</b>。' },
      { kind:'choice', q:'(3) 若改配"-400 度"的镜片，与"-250 度"相比，新镜片的焦距和发散能力如何变化？',
        opts:['焦距变为 25 cm，焦距更短、发散能力更强',
              '焦距变为 25 cm，焦距更短、发散能力更弱',
              '焦距变为 62.5 cm，焦距更长、发散能力更强',
              '焦距不变，只是镜片更厚'],
        answer:0,
        analysis:'f = 100 / 400 = 0.25 m = <b>25 cm</b>。度数越高（绝对值越大），<b>焦距越短</b>，透镜对光的偏折（发散）能力<b>越强</b>。<b>答案：A</b>' } ],
    answer:null, analysis:null, src:'original', scene:'按近视镜片度数计算焦距' },

  { id:'c5s2b009', ch:5, sec:2,
    kp:['image-rule'], type:'calc', diff:3, freq:5, points:8,
    stem:'学校礼堂用投影仪放映宣传片。一张投影片上人物的图案高 4.0 cm，放映时屏幕上图案的像高 80 cm，此时镜头到屏幕的距离（像距）为 240 cm，镜头的焦距为 8 cm。凸透镜成实像时满足：像高 / 物高 = 像距 / 物距。请解答下列问题。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'(1) 屏幕上图案的放大倍数是多少？', blanks:[
        { label:'放大倍数', answer:['20','20倍','20 倍'], unit:'倍' }],
        analysis:'放大倍数 = 像高 / 物高 = 80 cm / 4.0 cm = <b>20 倍</b>。' },
      { kind:'blank', q:'(2) 投影片到镜头的距离（物距）是多少厘米？', blanks:[
        { label:'物距', answer:['12','12cm','12 cm'], unit:'cm' }],
        analysis:'由 像高/物高 = 像距/物距：物距 = 像距 ÷ 放大倍数 = 240 cm / 20 = <b>12 cm</b>。' },
      { kind:'blank', q:'(3) 用焦距检验：这个物距落在哪个范围内，所以屏幕上成的是倒立、放大的实像？', blanks:[
        { label:'物距范围', answer:['8cm到16cm之间','大于8cm小于16cm','f<u<2f','一倍焦距与二倍焦距之间','大于焦距小于二倍焦距','8<u<16','8cm<u<16cm'], unit:'' }],
        analysis:'f = 8 cm，2f = 16 cm。算得物距 u = 12 cm，满足 <b>8 cm < 12 cm < 16 cm</b>，即物距在<b>一倍焦距与二倍焦距之间</b>（f<u<2f），此时凸透镜成<b>倒立、放大的实像</b>——与投影仪的成像条件完全一致。' } ],
    answer:null, analysis:null, src:'original', scene:'礼堂放映宣传片时按放大倍数算物距' },

  { id:'c5s2b010', ch:5, sec:2,
    kp:['lens-app'], type:'calc', diff:2, freq:4, points:6,
    stem:'小区门口的监控摄像头镜头相当于一个凸透镜，感光元件相当于"胶片"。一位身高 1.6 m 的住户站在镜头前，他的像在感光元件上的高度为 8 mm，此时镜头到感光元件的距离（像距）为 10 mm。凸透镜成实像时满足：像高 / 物高 = 像距 / 物距。请解答下列问题。',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'(1) 感光元件上住户的像是怎样的？',
        opts:['倒立、缩小的实像',
              '正立、缩小的虚像',
              '倒立、放大的实像',
              '正立、等大的实像'],
        answer:0,
        analysis:'像能被感光元件（相当于光屏）承接，必是<b>实像</b>；像高 8 mm 远小于物高 1.6 m，是<b>缩小</b>的；凸透镜所成实像都是<b>倒立</b>的。即<b>倒立、缩小的实像</b>——照相机原理。<b>答案：A</b>' },
      { kind:'blank', q:'(2) 这位住户到镜头的距离是多少米？', blanks:[
        { label:'物距', answer:['2','2m','2 m','2米','2000mm'], unit:'m' }],
        analysis:'统一单位：物高 1.6 m = 1600 mm。由 像高/物高 = 像距/物距：物距 = 物高 × 像距 ÷ 像高 = 1600 mm × 10 mm ÷ 8 mm = <b>2000 mm = 2 m</b>。' } ],
    answer:null, analysis:null, src:'original', scene:'小区监控摄像头拍摄住户的距离计算' }

];

var QBANK_C5A_ORIG_FIGS = {

  lensCross4: function () {
    const panel = (x, tag, shape) =>
      `<g transform="translate(${x},0)">`
      + `<rect x="6" y="14" width="88" height="140" rx="8" fill="none" stroke="#3a4356" stroke-width="1"/>`
      + shape
      + `<text x="50" y="176" fill="#d7dee9" font-size="14" text-anchor="middle" font-weight="700">${tag}</text>`
      + `</g>`;
    const glass = 'fill="#5ad7ff" fill-opacity="0.18" stroke="#9aa4b5" stroke-width="2"';
    const A = `<path d="M50,24 Q84,84 50,144 Q16,84 50,24 Z" ${glass}/>`;
    const B = `<path d="M34,24 Q48,84 34,144 L66,144 Q52,84 66,24 Z" ${glass}/>`;
    const C = `<path d="M40,24 L72,24 Q58,84 72,144 L40,144 Z" ${glass}/>`;
    const D = `<path d="M36,24 L64,24 L64,144 L36,144 Z" ${glass}/>`;
    const s = panel(0,'A',A) + panel(100,'B',B) + panel(200,'C',C) + panel(300,'D',D);
    return `<svg viewBox="0 0 400 190" role="img" aria-label="四块光学元件的纵截面示意图">${s}</svg>`;
  }

};

if(typeof window!=="undefined"){window.QBANK_C5A_ORIG=QBANK_C5A_ORIG;window.QBANK_C5A_ORIG_FIGS=QBANK_C5A_ORIG_FIGS;}

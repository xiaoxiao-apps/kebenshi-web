/* ===== 本章练习题库（第五章 透镜及其应用） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 收录 22 题：第1节×6、第2节×5、第3节×7、第4节×4（第5节为跨学科实践，不设练习题）。
 * 全部题目为原创编写与改编，配图均为程序化简图。
 */
const QUESTIONS = [
  { id:'c5s1q1', section:'第1节 透镜', no:'第1题', points:10,
    stem:'早在西汉时期，我们的祖先就在《淮南万毕术》中写下"削冰令圆，举以向日，以艾承其影，则火生"——把冰磨成圆形透镜对着太阳，用艾草承接聚光便可取火，这被公认为我国利用冰透镜会聚日光取火的最早记录。现在请你在纸上作图：设 F 为冰凸透镜的焦点，一束平行于主光轴的太阳光射向冰透镜，完成它经折射后的光路。',
    note:'本题为开放作图题：请自行在纸上画出光路，完成后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 削圆的冰透镜相当于一个<b>凸透镜</b>，对光起<b>会聚</b>作用；<br>② 平行于主光轴的太阳光经冰透镜折射后<b>会聚于焦点 F</b>——把折射光线画成射向 F 并在 F 处相交；<br>③ "以艾承其影"就是把艾草置于焦点 F 处，会聚的阳光让该处温度不断升高，达到艾草的燃点便"火生"。',
      analysis:'凸透镜的会聚作用；三条特殊光线之「平行于主光轴的光经凸透镜折射后过焦点」。' }] },

  { id:'c5s1q2', section:'第1节 透镜', no:'第2题', points:10,
    stem:'下面四幅简图各画出一个透镜和两条入射光线及其折射光线。哪一幅图的光路画得正确？请说明你的理由。',
    note:'下图四幅均为程序化简图。选择后对照解析中的理由自查。',
    fig:'lensPaths4',
    parts:[{ kind:'choice', q:'哪一幅图的光路画得正确？',
      opts:['甲','乙','丙','丁'], answer:0,
      analysis:'<b>甲画得正确</b>。判据有两条：凸透镜会聚光、凹透镜发散光；再结合三条特殊光线。<br>① 甲：凸透镜让平行于主光轴的入射光折射后会聚于焦点 F——符合「平行过焦点」，<b>正确</b>；<br>② 乙：凸透镜让过焦点 F 的入射光折射后应<b>平行于主光轴</b>出射，图中却画成发散——错误；<br>③ 丙：凹透镜使光发散，本就自同侧 F 发散而来的入射光折射后应<b>更加发散</b>，不会变成平行光——错误；<br>④ 丁：凹透镜让平行入射光折射后<b>发散</b>，发散光线的反向延长线才过同侧虚焦点，光线本身不可能实际会聚于 F——错误。' }] },

  { id:'c5s1q3', section:'第1节 透镜', no:'第3题', points:10,
    stem:'下面甲、乙两图中，一束会聚的入射光穿过虚线框后变成图中所示的折射光线。请根据光线方向的变化，判断虚线框内应放置哪种类型的透镜，并把它画出来。',
    note:'下图两幅均为程序化简图：甲=会聚入射光过框后发散出射，乙=会聚入射光过框后平行出射。本题为开放作图题，作答后对照参考答案自评计分。',
    fig:'lensBox2',
    parts:[{ kind:'open',
      ref:'参考答案：<br><b>判断方法</b>：把折射光线与入射光线作比较——折射后比入射<b>更发散</b>（会聚程度被削弱），框内应画<b>凹透镜</b>；折射后<b>更会聚</b>，则画<b>凸透镜</b>。<br>① 甲：会聚的入射光过框后转为发散，折射相对入射更发散 → 画<b>凹透镜</b>；<br>② 乙：会聚的入射光过框后变成平行光，会聚趋势被"顶了回去"，折射仍比入射更发散 → 画<b>凹透镜</b>。',
      analysis:'凸透镜=会聚透镜、凹透镜=发散透镜；依据折射光线相对入射光线更会聚还是更发散来判定框内透镜类型（甲、乙两图均应画凹透镜）。' }] },
  { id:'c5s1q4', section:'第1节 透镜', no:'第4题', points:12,
    stem:'用同种材料制成的凸透镜甲和乙，焦距分别是 2.5 cm 和 4 cm。让一束平行光沿平行于主光轴的方向分别射向两个透镜。① 请在纸上画出光通过每个透镜之后的折射光线；② 哪一个凸透镜使光偏折得更显著？',
    note:'本题配图不硬画，请自行在纸上作图。①为开放作图自评，②为单选即时判分。',
    parts:[
      { kind:'open', q:'① 作图：在笔记本上画出平行光分别通过凸透镜甲（f=2.5 cm）和凸透镜乙（f=4 cm）后的折射光线。',
        ref:'参考要点：<br>① 平行于主光轴的光束经凸透镜折射后<b>会聚于各自的焦点</b>；<br>② 甲的焦距为 2.5 cm，会聚点离透镜<b>近</b>；乙的焦距为 4 cm，会聚点离透镜<b>远</b>；<br>③ 甲的折射光线偏折角度更大（光线"拐"得更急）。',
        analysis:'三条特殊光线之「平行过焦点」；焦距越小会聚作用越强，光线偏折越显著。' },
      { kind:'choice', q:'② 哪个凸透镜使光偏折得更显著些？',
        opts:['焦距2.5 cm的甲透镜','焦距4 cm的乙透镜','一样显著'], answer:0,
        analysis:'f甲=2.5 cm < f乙=4 cm。凸透镜的焦距越小，对光的会聚作用越强——所以<b>焦距 2.5 cm 的甲透镜使光偏折得更显著</b>。' }
    ] },

  { id:'c5s1q5', section:'第1节 透镜', no:'第5题', points:10,
    stem:'小明想让一只小灯泡发出的光经过凸透镜后变成一束平行光。灯泡应该摆在凸透镜的什么位置？不妨动手试一试。解决这个问题的过程中，你用到了前面学过的哪条光学知识？',
    note:'①填空即时判分（等价写法均可）；②开放题对照参考要点自评计分。',
    parts:[
      { kind:'blank', q:'① 小灯泡应放在凸透镜的什么位置？', blanks:[
        { label:'小灯泡的位置', answer:['焦点','焦点处','焦点上','焦点F','焦点F处','F','F处','F点','f处','焦点的位置','一倍焦距处'], unit:'' }],
        analysis:'把小灯泡摆在凸透镜的<b>焦点（F）</b>处：射向焦点的光经凸透镜折射后平行于主光轴出射，于是得到所需的平行光束。' },
      { kind:'open', q:'② 解决这个问题时，你利用了前面学过的什么知识？',
        ref:'参考要点：<br>① 用到了<b>光路可逆</b>；<br>② 前面学过：平行于主光轴的光经凸透镜折射后通过焦点；把光路倒过来，从焦点射出的光折射后便<b>平行于主光轴</b>出射；<br>③ 因此把灯泡放在焦点位置即可得到平行光。',
        analysis:'光路可逆 + 特殊光线「过焦点的光折射后平行出射」。' }
    ] },

  { id:'c5s1q6', section:'第1节 透镜', no:'第6题', points:10,
    stem:'一则新闻里，某住户的阳台在一个烈日当空的周末起了火。消防勘察发现，起火点位于窗台上一只灌满水的透明玻璃瓶正下方：阳光经水瓶会聚后烤燃了下方的纸箱。水瓶引发火灾利用了什么光学道理？周末去山林里徒步时，喝剩的瓶装水应该怎么处理？请说明理由。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 灌满水的透明玻璃瓶<b>中间厚、边缘薄，相当于一个凸透镜</b>，对太阳光起<b>会聚</b>作用；<br>② 阳光被会聚在焦点附近，该处<b>温度急剧升高</b>，达到纸箱的燃点便将其引燃，酿成火灾；<br>③ 山林徒步时，喝剩的瓶装水应<b>随身带走、不遗留不乱丢</b>——否则它在阳光直射下同样会会聚光线，引燃枯草落叶，造成森林火灾。',
      analysis:'与用放大镜会聚阳光烤焦纸片同理——凸透镜会聚作用的生活实例（阳光防火）。' }] },

  { id:'c5s2q1', section:'第2节 生活中的透镜', no:'第1题', points:10,
    stem:'一台数码相机的镜头相当于一个凸透镜，拍照时被摄景物离镜头较远，像成在感光元件（相当于胶片）上。感光元件上得到的像有什么特点？',
    parts:[{ kind:'choice',
      opts:['倒立、缩小的实像','倒立、放大的实像','正立、放大的虚像','正立、缩小的实像'], answer:0,
      analysis:'拍照时景物离镜头较远（u>2f），凸透镜在胶片（感光元件）上成<b>倒立、缩小的实像</b>——这正是照相机的工作原理。' }] },

  { id:'c5s2q2', section:'第2节 生活中的透镜', no:'第2题', points:10,
    stem:'凸透镜是许多光学仪器的核心元件。比较照相机和投影仪所成的像：它们有哪些相同之处？又有哪些不同之处？',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br><b>相同点</b>：两者成的都是<b>倒立的实像</b>——由光实际会聚而成、能被胶片或光屏承接、物与像分居凸透镜两侧。<br><b>不同点</b>：照相机成<b>缩小</b>的像（u>2f，f<v<2f）；投影仪成<b>放大</b>的像（f<u<2f，v>2f）。',
      analysis:'共同点是同属实像、都倒立；差别在于物距落在哪个区（三区成像规律）。' }] },
  { id:'c5s2q3', section:'第2节 生活中的透镜', no:'第3题', points:10,
    stem:'不少博物馆会在做工精巧的展品前架设一块大凸透镜，方便游客看清细节。游客透过这块凸透镜看到的展品像是怎样的？',
    parts:[{ kind:'choice',
      opts:['正立、放大的虚像','倒立、缩小的实像','倒立、放大的实像','正立、等大的实像'], answer:0,
      analysis:'展品放在凸透镜的焦距以内（u<f），凸透镜此时相当于一个<b>放大镜</b>，成<b>正立、放大的虚像</b>。' }] },

  { id:'c5s2q4', section:'第2节 生活中的透镜', no:'第4题', points:10,
    stem:'用自制的简易模型照相机（两个纸筒套在一起、一端装凸透镜、另一端蒙半透明薄膜）拍摄窗外的树，如果想让薄膜上的像更大一些，应该怎样操作？',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 让模型照相机<b>靠近窗外的树</b>（减小物距）；<br>② 同时<b>拉长纸筒、增大凸透镜与薄膜间的距离</b>（增大像距），直到薄膜上的像重新清晰；<br>③ 规律：成实像时"<b>物近像远像变大</b>"。',
      analysis:'成实像时物距减小、像距增大、像变大（第3节动态规律的前置体验）。' }] },

  { id:'c5s2q5', section:'第2节 生活中的透镜', no:'第5题', points:10,
    stem:'我们在生活中看到的像既有实像也有虚像：电影幕布上放的是实像，穿衣镜里照出的是虚像。除这两例外，请你各举一个自己见到过的实像和虚像的例子。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（各举一例、合理即可）：<br><b>实像</b>——投影仪投在幕布上的像 / 照相机胶片（传感器）上的像 / 小孔成像；<br><b>虚像</b>——平面镜中的像 / 放大镜看到的像 / 平静水面中的"倒影"。',
      analysis:'判据在于光是否实际会聚、光屏能否承接：承接得到的是实像，承接不到的是虚像。' }] },

  { id:'c5s3q1', section:'第3节 凸透镜成像的规律', no:'第1题', points:10,
    stem:'照相机、投影仪、放大镜都离不开凸透镜。请分别说说这三种仪器各是利用凸透镜成像规律的哪一种情况来工作的。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① <b>照相机</b>：景物位于二倍焦距以外（u>2f），镜头（凸透镜）在胶片（感光元件）上成<b>倒立、缩小的实像</b>；<br>② <b>投影仪</b>：投影片位于一倍焦距与二倍焦距之间（f<u<2f），在屏幕上成<b>倒立、放大的实像</b>，机内平面镜只负责改变光路方向；<br>③ <b>放大镜</b>：被观察物体位于一倍焦距以内（u<f），成<b>正立、放大的虚像</b>。',
      analysis:'三区成像规律与三种仪器一一对应：u>2f 缩小实像、f<u<2f 放大实像、u<f 放大虚像。' }] },

  { id:'c5s3q2', section:'第3节 凸透镜成像的规律', no:'第2题', points:10,
    stem:'在家找一个圆柱形玻璃杯，灌入大半杯水，再把一支铅笔横放在杯子的一侧。透过杯子看这支铅笔，把笔从紧贴杯壁的位置开始慢慢向远处移动，你会看到什么现象？先猜想，再实际做一做验证。',
    note:'本题为开放题，建议实际做一做后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 灌水的圆柱形玻璃杯相当于一个<b>凸透镜</b>；<br>② 笔紧贴杯壁（u<f）时：看到<b>正立、放大的虚像</b>；<br>③ 笔逐渐移远、越过焦点（u>f）后：像<b>变倒</b>（成倒立的实像，先是放大的）；<br>④ 继续移远、超过二倍焦距（u>2f）：像变为<b>倒立、缩小</b>。整个过程：正立放大虚像 → 焦点附近像模糊消失（不成像）→ 倒立实像（先放大后缩小）。',
      analysis:'圆柱水杯=凸透镜；笔移动=物距连续增大，依次穿过三区，成像情况随之切换。' }] },
  { id:'c5s3q3', section:'第3节 凸透镜成像的规律', no:'第3题', points:10,
    stem:'小华用放大镜观察花坛里的花。想让看到的像更大一些，他应该怎么调整放大镜与花之间的距离？',
    parts:[{ kind:'choice',
      opts:['适当增大放大镜与景物间的距离（仍在焦距内）','减小放大镜与景物间的距离','把放大镜远离眼睛到任意距离都行','换焦距更小的放大镜贴近景物'], answer:0,
      analysis:'放大镜成正立放大虚像的前提是 u<f。在焦距以内<b>适当增大物距</b>（把放大镜稍稍拉远一点），虚像就变大——但物距一旦超过焦距，便不再成虚像。' }] },

  { id:'c5s3q4', section:'第3节 凸透镜成像的规律', no:'第4题', points:10,
    stem:'在光具座上，小科先用焦距为 24 cm 的凸透镜甲做实验，调节后在光屏上得到烛焰缩小的实像。接着他想换用焦距为 14 cm 的凸透镜乙继续实验。若发光体和光屏的位置都不动，还想在光屏上重新得到清晰的像，透镜乙应放在透镜甲的左侧还是右侧？',
    parts:[{ kind:'choice',
      opts:['右侧（靠近光屏一侧）','左侧（靠近发光体一侧）'], answer:0,
      analysis:'甲成缩小实像 → u>2f甲=48 cm，像距 24 cm<v甲<48 cm。换成 f乙=14 cm 后，<b>焦距变小、会聚能力变强</b>，像将向透镜靠近（v乙<v甲）；发光体与光屏都不动，要让像重新落回光屏上，就得把透镜<b>向光屏方向移</b>——也就是放在透镜甲的<b>右侧</b>。' }] },

  { id:'c5s3q5', section:'第3节 凸透镜成像的规律', no:'第5题', points:12,
    stem:'实验小组在光具座上探究凸透镜成像的规律。器材有：一个凸透镜、光屏、高度为 2.0 cm 且带刻度的发光物体。实验中物距从 6.0 cm 开始，每次增加 3.0 cm，下表是小组记录的物距、像距、像的高度和正倒情况。',
    note:'数据表见下图（表中"/"表示光屏上承接不到像）。三空各4分，即时判分。',
    fig:'imgDataTable',
    parts:[
      { kind:'blank', q:'(1) 怎样判断表中所成的像是放大的还是缩小的？', blanks:[
        { label:'判断方法：把像的高度与___比较', answer:['物体高度','光源高度','光源的高度','物体的高度','物高','2.0cm','2.0','2cm','2.0厘米'], unit:'' }],
        analysis:'把<b>像的高度与发光物体（光源）的高度 2.0 cm 作比较</b>：像高>2.0 cm 为放大，像高<2.0 cm 为缩小。也可以比较像距与物距：v>u 放大、v<u 缩小（如 u=18.0 时 v=90.0、像高 10.0 cm，为放大）。' },
      { kind:'blank', q:'(2) 该凸透镜的焦距 f 是多少？', blanks:[
        { label:'焦距 f', answer:['15','15.0','15cm','15.0cm'], unit:'cm' }],
        analysis:'表中 u=30.0 cm 时 v=30.0 cm，成倒立、等大（像高 2.0 cm）的实像，u=v=2f → f=15 cm。全表验证：1/u+1/v≈1/15（如 u=24.0、v=40.0：1/24+1/40≈0.067）。' },
      { kind:'blank', q:'(3) 该凸透镜在什么条件下成虚像？', blanks:[
        { label:'物距___时成虚像', answer:['小于15cm','小于15.0cm','小于15','小于焦距','小于1倍焦距','小于一倍焦距','小于f','u<15cm','u<15','u<f','小于15厘米'], unit:'' }],
        analysis:'表中前三列 u=6.0/9.0/12.0 cm 时像为正立（光屏承接不到，为虚像），u=15.0 cm（=f）时不成像 → 成虚像的条件是<b>物距小于 15 cm（小于焦距 f）</b>。' }
    ] },
  { id:'c5s3q6', section:'第3节 凸透镜成像的规律', no:'第6题', points:10,
    stem:'探究凸透镜成像规律的实验中，光屏上已经出现烛焰清晰的像。这时小林不小心用手指挡在了凸透镜的前面，遮住了一部分透镜。光屏上会发生什么现象？三位同学各持己见：①屏上会出现手指的影子；②像会缺一块；③像仍然完整，只是变暗。谁的判断正确？为什么？',
    note:'①单选即时判分，②说理对照参考答案自评。',
    parts:[
      { kind:'choice', q:'① 谁的判断正确？',
        opts:['①屏上会出现手指的影子','②像会缺一块','③像仍然完整，只是变暗'], answer:2,
        analysis:'正确的是<b>③像仍完整、只是变暗</b>。成像是物体发出的全部光线共同完成的：物体上每一点发出的光经过透镜<b>各个部分</b>后都会会聚到对应的像点；遮住一部分只减少了透光量，像依旧完整，但会变暗。' },
      { kind:'open', q:'② 为什么？请说明理由。',
        ref:'参考要点：<br>① 物体上任一点发出的光射向透镜的<b>整个表面</b>，经透镜各部分折射后都会会聚到同一个像点；<br>② 手指遮住一部分后，<b>其余部分照样能把物体各点发出的光会聚起来</b>，仍在原位置成<b>完整的像</b>；<br>③ 只是穿过透镜的<b>光变少了</b>，会聚到像上的光随之减少，所以像<b>变暗</b>；<br>④ 手指离透镜很近，又不在成像的物距位置上，屏上既不会有手指的影子，也不会出现手指的像。',
        analysis:'遮住部分镜面→透光减少→像完整但变暗；不会缺角，也不会出现手指的影或像。' }
    ] },

  { id:'c5s3q7', section:'第3节 凸透镜成像的规律', no:'第7题', points:10,
    stem:'小刚站在江边想给对岸的电视塔拍一张全景，可无论怎么调节相机，取景框里始终只能装下塔身的一部分。请利用本节学过的成像知识，帮他想出一个能拍到全景的办法，并说明其中的道理。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br><b>办法</b>：让相机<b>向后退、远离电视塔（增大物距）</b>；或者换用<b>焦距更短</b>的镜头。<br><b>理由</b>：凸透镜成实像时，<b>物远像近像变小</b>——物距增大后，胶片（感光元件）上的像变小，整座塔的像就能全部收进取景框内，于是拍到了全景。',
      analysis:'本质是"让像变小以收全景物"：成实像时物距增大→像距减小、像变小（拍摄时相机自动调小像距使像清晰）。' }] },

  { id:'c5s4q1', section:'第4节 眼睛和眼镜', no:'第1题', points:12,
    stem:'眼睛的晶状体和角膜合在一起，作用相当于一个凸透镜。① 看远处物体和看近处物体时，这个"凸透镜"的焦距有什么不同？② 近视眼应佩戴什么透镜来矫正？③ 远视眼又应佩戴什么透镜来矫正？',
    note:'三个小问均为单选，即时判分（每空4分）。',
    parts:[
      { kind:'choice', q:'① 看远处物体时，晶状体（这个"凸透镜"）与看近处时相比：',
        opts:['较薄，焦距较大','较厚，焦距较小','较薄，焦距较小','较厚，焦距较大'], answer:0,
        analysis:'看远处时睫状体放松、晶状体比较<b>薄</b>，对光的偏折能力弱，<b>焦距较大</b>；看近处时睫状体收缩、晶状体变厚，偏折能力变强、焦距变小，近处物体的光仍会聚在视网膜上。' },
      { kind:'choice', q:'② 近视眼应利用什么透镜矫正？',
        opts:['凹透镜','凸透镜'], answer:0,
        analysis:'近视眼的晶状体太厚、折光能力太强（或眼球前后方向过长），远处物体的光会聚在视网膜<b>前方</b>；佩戴<b>凹透镜</b>让光先适当发散，像便后移回到视网膜上。' },
      { kind:'choice', q:'③ 远视眼应利用什么透镜矫正？',
        opts:['凸透镜','凹透镜'], answer:0,
        analysis:'远视眼的晶状体太薄、折光能力太弱（或眼球前后方向过短），近处物体的光会聚在视网膜<b>后方</b>；佩戴<b>凸透镜</b>使光提前会聚，像前移回到视网膜上。' }
    ] },

  { id:'c5s4q2', section:'第4节 眼睛和眼镜', no:'第2题', points:12,
    stem:'为了弄清近视眼的矫正原理，小雨利用光具座上的蜡烛、凸透镜和光屏做实验：固定蜡烛和凸透镜的位置，移动光屏，在屏上得到了清晰的像。（1）要模拟近视眼看不清远处物体的情形，光屏该怎样移动？（2）接着模拟远视眼的矫正：移动光屏后保持发光物体和凸透镜位置不变，应在发光物体和凸透镜之间放一个什么透镜，光屏上才能重新出现清晰的像？',
    note:'两小问均为单选，即时判分（每空6分）。',
    parts:[
      { kind:'choice', q:'(1) 模拟近视眼看不清远处物体时，光屏应怎样移动？',
        opts:['向凸透镜方向移动（靠近透镜）','远离凸透镜移动','保持不动'], answer:0,
        analysis:'近视眼的像成在视网膜<b>前方</b>。实验中蜡烛与凸透镜固定，像的位置不变，把光屏<b>向凸透镜方向移动</b>到像所在的位置，才能承接到清晰的像——光屏模拟"前移的视网膜"，即近视眼看远处物体时像落在视网膜前、屏（视网膜）上模糊。' },
      { kind:'choice', q:'(2) 模拟远视眼的矫正：在发光物体和凸透镜之间放置一个什么透镜，才能使光屏上再次出现清晰的像？',
        opts:['凸透镜','凹透镜'], answer:0,
        analysis:'远视眼靠佩戴<b>凸透镜</b>矫正：凸透镜对光起会聚作用，使光<b>提前会聚</b>，像前移重新落在光屏（模拟视网膜）上，屏上再次呈现清晰的像。' }
    ] },

  { id:'c5s4q3', section:'第4节 眼睛和眼镜', no:'第3题', points:10,
    stem:'小亮留意到：奶奶看药盒上的小字时总要戴上眼镜，看远处的公交站牌时却把眼镜摘下来。小亮由此断定奶奶戴的是老花镜。他的判断依据是什么？请说说理由。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 看药盒小字=看<b>近处</b>，要戴上眼镜才看得清；看远处站牌=看<b>远处</b>，不戴眼镜反而清楚；<br>② 这说明奶奶的眼睛<b>远处清楚、近处模糊</b>——属于远视眼（老花眼），近处物体的光会聚在视网膜后方；<br>③ 远视眼需佩戴<b>凸透镜</b>矫正，老花镜正是凸透镜，所以小亮断定奶奶戴的是老花镜。',
      analysis:'远视眼（老花）"远清近糊"+老花镜=凸透镜；与近视眼（近清远糊、戴凹透镜）恰好对照。' }] },

  { id:'c5s4q4', section:'第4节 眼睛和眼镜', no:'第4题', points:10,
    stem:'每年 6 月 6 日是全国爱眼日。结合你的观察和了解，说说生活中有哪些不良用眼习惯容易导致近视，并提出两条保护视力、预防近视的具体措施。',
    note:'本题为开放题，言之有理即可，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br><b>不良用眼习惯</b>——长时间近距离盯着屏幕或书本；在过强或过暗的光线下看书写字；躺着、走路或乘车时看书；连续用眼不休息等。<br><b>预防措施（答出两条即可）</b>——①保持正确的读写姿势，眼与书本距离约 33 cm（一尺）；②连续用眼 40~50 min 后远眺放松；③不在过强或过暗的光线下看书；④坚持做眼保健操、定期检查视力、多参加户外活动。',
      analysis:'护眼常识开放题；"6月6日全国爱眼日"为公认日期事实。' }] },

]; // 闭合 QUESTIONS 数组（共22题：第1节×6、第2节×5、第3节×7、第4节×4）

/* ===== 状态与持久化 ===== */
const STORAGE_KEY = 'c5_practice_state_v1';
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

/* ===== 程序化插图 ===== */
const FIGURES = {
  lensPaths4: svgLensPaths4,
  lensBox2: svgLensBox2,
  imgDataTable: htmlImgDataTable
};

function lensShape(cx, cy, h, convex) {
  if (convex) return `<path d="M ${cx} ${cy - h/2} Q ${cx+9} ${cy} ${cx} ${cy+h/2} Q ${cx-9} ${cy} ${cx} ${cy-h/2} Z" fill="rgba(90,215,255,.18)" stroke="#5ad7ff" stroke-width="1.5"/>`;
  return `<path d="M ${cx-8} ${cy - h/2} Q ${cx-3} ${cy} ${cx-8} ${cy+h/2} L ${cx+8} ${cy+h/2} Q ${cx+3} ${cy} ${cx+8} ${cy-h/2} Z" fill="rgba(90,215,255,.18)" stroke="#5ad7ff" stroke-width="1.5"/>`;
}
function panelBox(dx, dy, title, inner) {
  return `<g transform="translate(${dx},${dy})">`
    + `<rect x="4" y="4" width="222" height="142" fill="none" stroke="rgba(255,255,255,.08)" rx="8"/>`
    + `<text x="14" y="24" fill="#ffd479" font-size="14" font-weight="700">${title}</text>`
    + inner + `</g>`;
}
function axis(y) {
  return `<line x1="16" y1="${y}" x2="214" y2="${y}" stroke="#6b7686" stroke-width="1" stroke-dasharray="4 3"/>`;
}
function ray(pts, color) {
  let s = '';
  for (let i = 0; i < pts.length - 1; i++) {
    s += `<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[i+1][0]}" y2="${pts[i+1][1]}" stroke="${color}" stroke-width="2"/>`;
  }
  return s;
}
function focal(x, y) {
  return `<circle cx="${x}" cy="${y}" r="3" fill="#ffd479"/><text x="${x-4}" y="${y+18}" fill="#ffd479" font-size="11">F</text>`;
}

function svgLensPaths4() {
  // 甲：凸透镜，平行入射会聚于F（正确）
  let pA = axis(80) + lensShape(100, 80, 84, true)
    + ray([[25,60],[100,60]], '#ff7a6e') + ray([[100,60],[200,88.6]], '#5ad7ff')
    + ray([[25,100],[100,100]], '#ff7a6e') + ray([[100,100],[200,71.4]], '#5ad7ff')
    + focal(170, 80) + `<text x="30" y="52" fill="#ff7a6e" font-size="10">平行光</text>`;
  // 乙：凸透镜，过F入射折射后发散（错，应平行出射）
  let pB = axis(80) + lensShape(120, 80, 84, true)
    + ray([[50,80],[120,60]], '#ff7a6e') + ray([[120,60],[205,40]], '#5ad7ff')
    + ray([[50,80],[120,100]], '#ff7a6e') + ray([[120,100],[205,120]], '#5ad7ff')
    + focal(50, 80) + `<text x="66" y="48" fill="#ff7a6e" font-size="10">过F入射</text>`;
  // 丙：凹透镜，自同侧F发散入射折射后平行（错，应更发散）
  let pC = axis(80) + lensShape(110, 80, 84, false)
    + ray([[40,80],[110,60]], '#ff7a6e') + ray([[110,60],[200,60]], '#5ad7ff')
    + ray([[40,80],[110,100]], '#ff7a6e') + ray([[110,100],[200,100]], '#5ad7ff')
    + focal(40, 80) + `<text x="56" y="48" fill="#ff7a6e" font-size="10">自F发散入射</text>`;
  // 丁：凹透镜，平行入射实际会聚于F（错，应发散、反向延长过虚焦点）
  let pD = axis(80) + lensShape(90, 80, 84, false)
    + ray([[20,60],[90,60]], '#ff7a6e') + ray([[90,60],[200,87.5]], '#5ad7ff')
    + ray([[20,100],[90,100]], '#ff7a6e') + ray([[90,100],[200,72.5]], '#5ad7ff')
    + focal(170, 80) + `<text x="26" y="52" fill="#ff7a6e" font-size="10">平行光</text>`;
  const s = panelBox(0, 0, '甲', pA) + panelBox(230, 0, '乙', pB)
    + panelBox(0, 150, '丙', pC) + panelBox(230, 150, '丁', pD);
  return `<svg viewBox="0 0 460 300" role="img" aria-label="四幅透镜光路简图">${s}</svg>`;
}

function svgLensBox2() {
  const box = `<rect x="95" y="28" width="30" height="100" fill="none" stroke="#9aa4b5" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  const inc = ray([[20,48],[95,64]], '#ff7a6e') + ray([[20,112],[95,96]], '#ff7a6e');
  // 甲：会聚入射，过框后发散出射
  let pA = box + inc + ray([[125,64],[205,38]], '#5ad7ff') + ray([[125,96],[205,122]], '#5ad7ff')
    + `<text x="26" y="42" fill="#ff7a6e" font-size="10">会聚入射</text><text x="150" y="32" fill="#5ad7ff" font-size="10">发散出射</text>`;
  // 乙：会聚入射，过框后平行出射
  let pB = box + inc + ray([[125,64],[205,64]], '#5ad7ff') + ray([[125,96],[205,96]], '#5ad7ff')
    + `<text x="26" y="42" fill="#ff7a6e" font-size="10">会聚入射</text><text x="150" y="56" fill="#5ad7ff" font-size="10">平行出射</text>`;
  const s = panelBox(0, 0, '甲', pA) + panelBox(230, 0, '乙', pB);
  return `<svg viewBox="0 0 460 160" role="img" aria-label="虚线框放透镜的两幅光路简图">${s}</svg>`;
}

function htmlImgDataTable() {
  // f=15 cm、物高 2.0 cm；v=uf/(u-f)、h=2.0*v/u，四舍五入保留一位小数（u=6/9/12<f 虚像、u=15=f 不成像）
  const u  = ['6.0','9.0','12.0','15.0','18.0','21.0','24.0','27.0','30.0','33.0','36.0','39.0','42.0'];
  const v  = ['/','/','/','/','90.0','52.5','40.0','33.8','30.0','27.5','25.7','24.4','23.3'];
  const h  = ['/','/','/','/','10.0','5.0','3.3','2.5','2.0','1.7','1.4','1.3','1.1'];
  const io = ['正','正','正','/','倒','倒','倒','倒','倒','倒','倒','倒','倒'];
  const row = (name, arr) => `<tr><th>${name}</th>${arr.map(x => `<td>${x}</td>`).join('')}</tr>`;
  return `<table class="dtab"><tbody>`
    + row('物距/cm', u) + row('像距/cm', v) + row('像的高度/cm', h) + row('像的正倒', io)
    + `</tbody></table>`;
}

/* ===== 渲染引擎 ===== */
function renderFig(fig) {
  if (!fig || !FIGURES[fig]) return '';
  return `<div class="figbox">${FIGURES[fig]()}</div>`;
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
    ${renderFig(q.fig)}
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
  // F12：恢复匹配改整数分比较 score===Math.round(full*ratio)（替代浮点 ratio 比较；full=5 时半分=3，旧式 0.6≠0.5 丢失「半分」done 高亮）
  $all('.self-score', el).forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('done');
    if (score === Math.round(full * (+btn.dataset.ratio))) btn.classList.add('done');
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

document.addEventListener('DOMContentLoaded', () => {
  initState();
  renderQuiz();
});

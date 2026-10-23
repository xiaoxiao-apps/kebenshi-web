/* c4b 题库（第四章 s4~s5 折射+色散+看不见的光）· P2 原创生产 · 2026-10-24 */
var QBANK_C4B_ORIG = [

  { id:'c4s4b001', ch:4, sec:4,
    kp:['refract'], type:'choice', diff:1, freq:4, points:3,
    stem:'老渔民阿海在清澈的浅滩叉鱼：他瞄得清清楚楚，一条鱼就悬在前下方不远处一动不动。可鱼叉贴着瞄准线扎过去，每次都从鱼身边擦过。配图为他瞄准时的光路简图。',
    note:'配图为程序化绘制的光路简图。', fig:'spearFish',
    parts:[{ kind:'choice', q:'要想叉中鱼，他应该怎样调整？其中道理是？',
      opts:['瞄准看到的鱼的下方叉去——鱼反射的光从水中斜射入空气时发生折射，人逆着折射光线看去，看到的是位置比实际偏高的虚像','瞄准看到的鱼的上方叉去——鱼在水中时看起来比实际位置更深','仍然对准看到的鱼叉——看到的位置就是鱼的实际位置','用力甩叉让鱼叉在水中拐弯去追鱼——鱼叉入水后也会跟着光一起弯折'], answer:0,
      analysis:'鱼反射的光从水中斜射入空气，在水面处发生折射，折射光线远离法线；人眼逆着折射光线看去，觉得光是从折射光线反向延长线的交点发出的，看到的是比实际位置<b>偏高</b>的虚像。所以要叉中真实的鱼，必须瞄准看到的鱼的<b>下方</b>。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'渔民浅滩叉鱼瞄准' },

  { id:'c4s4b002', ch:4, sec:4,
    kp:['refract'], type:'calc', diff:2, freq:4, points:6,
    stem:'某游泳池注水后，池底一颗鹅卵石正上方的水面看起来比实际水面"浅"。资料介绍：从正上方附近观察时，看起来的深度（视深）与实际深度之比约为 3∶4。小潜趴在池边观察，这颗鹅卵石看起来的深度约为 1.2 m。配图是池底鹅卵石位置的截面简图。',
    note:'配图为程序化绘制的泳池截面简图。', fig:'poolPebble',
    parts:[
      { kind:'blank', q:'① 鹅卵石的实际深度：', blanks:[
        { label:'实际深度', answer:['1.6','1.6m','1.6米'], unit:'m' }],
        analysis:'视深∶实际深度 = 3∶4，实际深度 = 视深 ÷ 3 × 4 = 1.2 m ÷ 3 × 4 = <b>1.6 m</b>。这就是"池水看起来变浅"的原因：池底反射的光从水中斜射入空气发生折射，人眼逆着折射光线看去，觉得池底变高了。' },
      { kind:'blank', q:'② 视深与实际深度相差多少：', blanks:[
        { label:'相差', answer:['0.4','0.4m','0.4米'], unit:'m' }],
        analysis:'相差 = 1.6 m − 1.2 m = <b>0.4 m</b>。不会游泳的人若按看到的深度下水，实际水深比估计的深 0.4 m，非常危险，这正是泳池边"水深危险"警示牌的物理依据。' }],
    answer:null, analysis:null, src:'original',
    scene:'泳池池底鹅卵石视深估算' },

  { id:'c4s4b003', ch:4, sec:4,
    kp:['refract'], type:'choice', diff:1, freq:4, points:3,
    stem:'晚餐时，小蓓把一根直筷子斜插进盛着汤的碗里，从侧面看：筷子在水面处好像"折断"了，水里的部分还显得比水面上的部分粗大、错位。她把筷子拿出来，筷子明明是完好笔直的。',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'筷子"折断"错觉形成的原因是？',
      opts:['水下部分反射的光从水中斜射入空气时发生折射，人眼逆着折射光线看去，看到的水下部分是位置偏高的虚像','筷子在水里真的被泡弯了，拿出来后又弹直了','水面像镜子一样把筷子反射成了两段','光在水中沿曲线传播，把筷子的像"画"弯了'], answer:0,
      analysis:'光在同种均匀介质中沿直线传播，水中部分并不弯。水下筷子反射的光从水斜射入空气时发生<b>折射</b>，折射光线远离法线；人眼逆着折射光线看去，看到水下部分的位置比实际<b>偏高</b>，与水上部分错开，筷子就像在水面处"折断"了。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'汤碗中斜插筷子错位' },

  { id:'c4s4b004', ch:4, sec:4,
    kp:['refract'], type:'blank', diff:2, freq:4, points:6,
    stem:'盛夏的戈壁滩上，旅行队远远望见前方"路面"上出现一片波光粼粼的"湖水"，可无论怎么走都到不了跟前；有时还能看见远处景物的"倒影"悬在半空。气象员解释：贴近滚烫沙面的空气温度很高、密度很小，上层空气较凉、密度较大，空气在竖直方向上并不均匀。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'① 光在不均匀空气中的传播：', blanks:[
      { label:'光在同种<b>均匀</b>介质中沿直线传播；这片空气上下密度不同、并不均匀，光在其中传播时路径会', answer:['弯折','弯曲','偏折','发生弯折'], unit:'' }],
      analysis:'光沿直线传播的条件是<b>同种均匀</b>介质。贴近沙面的空气热而稀、上层凉而密，介质不均匀，远处景物射向地面的光在传播途中不断<b>弯折</b>，路径变成弯曲的。' },
      { kind:'blank', q:'② 海市蜃楼成像性质：', blanks:[
      { label:'人眼逆着弯折过来的光线看去，看到的"湖面"和"倒影"是远处景物的', answer:['虚像','虚'], unit:'' }],
      analysis:'人眼总是认为光沿直线射来，逆着弯折的光线看去，就觉得光是从它们的反向延长线交汇处发出的——那是实际并不存在的发光点，成的是<b>虚像</b>。"湖面"其实是天空的虚像，"倒影"是远处景物的虚像，这就是海市蜃楼。' }],
    answer:null, analysis:null, src:'original',
    scene:'戈壁沙漠海市蜃楼' },

  { id:'c4s4b005', ch:4, sec:4,
    kp:['light-line'], type:'blank', diff:2, freq:3, points:4,
    stem:'午后，小昱把一张硬纸片举在阳光下，纸片中央用针扎了一个很小的正方形孔。他在纸片下方的白纸上看到一个明亮的圆形光斑；把纸片离白纸远一些，光斑变大但仍是圆形，而且边缘反而更模糊了一点。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'光斑形状与成因：', blanks:[
      { label:'白纸上圆形光斑其实是哪个物体的像', answer:['太阳','太阳的像'], unit:'' },
      { label:'这个现象说明光在同种均匀介质中沿什么方式传播', answer:['直线','沿直线'], unit:'' }],
      analysis:'小孔足够小时，太阳上每一点发出的光穿过小孔后在白纸上各对应一个光点，全体光点组合成太阳的像——太阳是圆的，所以光斑是<b>圆形</b>，与小孔是正方形无关。这正是光沿<b>直线</b>传播的证据（小孔成像）。纸片离白纸越远，像越大、边缘越模糊。' }],
    answer:null, analysis:null, src:'original',
    scene:'方形小孔阳光下成像光斑' },

  { id:'c4s4b006', ch:4, sec:4,
    kp:['refract'], type:'choice', diff:1, freq:4, points:3,
    stem:'游泳队训练时，小潜潜到池底，抬头斜看岸上教练手中的标杆。他觉得标杆的样子和平时站在岸上看完全不同。',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'关于小潜在水下看到的标杆，下列说法正确的是？',
      opts:['看到的标杆比实际位置偏高、也显得更长——标杆反射的光从空气斜射入水中发生折射，折射光线靠近法线，人眼逆着光线看去觉得物体变高变远','看到的标杆和岸上看一模一样，位置大小都不变','看到的标杆比实际位置偏低，因为光在水中传播得慢','标杆的光进入水中后被水面全部反射回去，所以什么也看不见'], answer:0,
      analysis:'这与"叉鱼"是同一道理的逆过程：光从空气斜射入水中时折射光线<b>靠近法线</b>，水下的人眼逆着折射光线看去，觉得岸上物体的位置比实际<b>偏高</b>，视角也被放大，标杆显得更长。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'潜水员水下仰看岸边标杆' },

  { id:'c4s4b007', ch:4, sec:4,
    kp:['reflect-law','mirror-image','refract'], type:'choice', diff:1, freq:5, points:3,
    stem:'傍晚的湖边，小岚同时看到两样东西：① 平静湖面上有一棵柳树的"倒影"，风一吹水面起波纹，倒影就碎了；② 湖水看起来比实际浅，能清楚看见近岸水底的石块。',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'对这两个现象的成因，判断正确的是？',
      opts:['①是光的反射形成的等大虚像（水面相当于平面镜），②是光的折射形成的、比实际位置偏高的虚像','①和②都是光的反射形成的','①是光的折射形成的，②是光的反射形成的','①是光的直线传播形成的影子，②是光的反射形成的'], answer:0,
      analysis:'平静的水面相当于<b>平面镜</b>，柳树倒影是光的<b>反射</b>形成的正立等大<b>虚像</b>，像到水面距离等于物到水面距离；水面起波纹后各处不再平整，反射光散乱，倒影就碎了。看到水底石块变浅，是石块反射的光从水斜射入空气时发生<b>折射</b>，人眼看到的是位置偏高的虚像。两者成因不同，故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'湖边倒影与湖水变浅成因对比' },

  { id:'c4s4b008', ch:4, sec:4,
    kp:['refract'], type:'blank', diff:1, freq:4, points:6,
    stem:'实验台上，一束激光从空气斜射入装水的玻璃水槽，在水面处发生偏折后进入水中，装置如配图所示（图中只画出空气与水的界面、法线和射向水面的入射光线，未标任何角度数值，折射光线的方向需你自行判断）。',
    note:'配图为程序化绘制的光路简图，只含界面、法线与入射光线，不含折射光线，也不标角度数值。', fig:'refractRay',
    parts:[
      { kind:'blank', q:'① 折射角与入射角的关系：', blanks:[
        { label:'光从空气斜射入水中时，折射角比入射角', answer:['小','小些','偏小'], unit:'' }],
        analysis:'光从空气斜射入水（或玻璃）中时，折射光线<b>靠近法线</b>，折射角<b>小于</b>入射角。反之，光从水中斜射入空气时折射光线远离法线，折射角大于入射角。' },
      { kind:'blank', q:'② 入射角增大时折射角的变化：', blanks:[
        { label:'入射角逐渐增大时，折射角也随之', answer:['增大','变大','增大但总小于入射角'], unit:'' }],
        analysis:'折射角随入射角的增大而<b>增大</b>，但在光从空气射入水中的情形下，折射角始终小于入射角。' },
      { kind:'blank', q:'③ 光路的可逆性：', blanks:[
        { label:'若让光逆着原来在水中的那条光线方向、从水中射向水面，出射光会沿图中原来那束光的方向射出，说明折射时光路是', answer:['可逆','可逆的'], unit:'' }],
        analysis:'在折射现象中光路同样<b>可逆</b>：逆着原折射光线入射，光就沿原入射光线方向射出。反射、折射都遵守光路可逆。' }],
    answer:null, analysis:null, src:'original',
    scene:'激光斜射入水槽折射光路' },

  { id:'c4s4b009', ch:4, sec:4,
    kp:['refract'], type:'experiment', diff:1, freq:4, points:8,
    stem:'小舟把一枚硬币放在空的不透明搪瓷盆底部，慢慢往后退，退到某个位置时硬币刚好被盆沿挡住、完全看不见。她保持眼睛和碗的位置不动，让同伴沿着盆壁缓缓往盆里注水。注水过程中，原本看不见的硬币又重新"浮"了出来。',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'① 后退到某一位置时看不见硬币，原因是：',
        opts:['光在同种均匀的空气中沿直线传播，硬币反射的光被碗沿挡住，无法到达眼睛','硬币在暗处不发光，所以看不见','硬币反射的光在空气中发生了折射，偏离了眼睛','碗把硬币的光全部吸收了'], answer:0,
        analysis:'空碗时硬币反射的光只能在空气中沿<b>直线</b>传播，位置合适时被不透明的碗沿挡住，光线到不了眼睛，所以看不见。' },
      { kind:'blank', q:'② 注水后又能看见硬币：', blanks:[
        { label:'硬币反射的光从水中斜射入空气时在水面处发生', answer:['折射','偏折'], unit:'' }],
        analysis:'注水后，硬币反射的光先从水中传播到水面，在<b>水面处发生折射</b>，折射光线远离法线并绕过碗沿进入眼睛，硬币重新可见。' },
      { kind:'choice', q:'③ 看到的硬币位置与实际位置的关系及成因：',
        opts:['看到的比实际位置偏高，因为人眼逆着折射光线看去，觉得光是从折射光线反向延长线的交点发出的','看到的比实际位置偏低，因为光在水中传播变慢了','看到的位置与实际相同，只是变亮了','看到的是硬币的实像，能用光屏接收到'], answer:0,
        analysis:'人眼总以为光是沿直线射来的，逆着折射光线看去，觉得光是从它们的<b>反向延长线交点</b>发出的，那个交点比硬币实际位置<b>高</b>，所以看到的是位置偏高的<b>虚像</b>（虚像不能用光屏接收）。故 A 正确。' },
      { kind:'choice', q:'④ 这个实验说明的物理规律是：',
        opts:['光从一种介质斜射入另一种介质时传播方向会发生偏折','光在任何情况下都沿直线传播','光在水面只能发生反射，不能进入空气','光从水中进入空气时速度变慢'], answer:0,
        analysis:'硬币"浮起"的本质是光从水<b>斜射入空气</b>时传播方向发生<b>偏折</b>（折射）。若垂直射向水面则方向不变，这也是"垂直看池底仍觉得变浅但不错位"的原因。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'搪瓷盆注水硬币浮起' },

  { id:'c4s4b010', ch:4, sec:4,
    kp:['refract'], type:'experiment', diff:1, freq:4, points:8,
    stem:'兴趣小组用激光笔、半圆形玻璃砖和量角圆盘探究光从空气斜射入玻璃时折射角与入射角的关系。他们改变入射角的大小做了五次实验，把每次的入射角和折射角记录在表格中（数据见配图）。',
    note:'配图为程序化绘制的实验记录数据表，表中数据均为已知条件。', fig:'refractTable',
    parts:[
      { kind:'blank', q:'① 变化幅度比较：', blanks:[
        { label:'入射角从 20° 增大到 60°（增大 40°）的过程中，折射角从 13° 增大到 35°（只增大 22°），可见折射角增大的幅度比入射角', answer:['小','小些','偏小'], unit:'' }],
        analysis:'由表：入射角 20°→60° 增大 60−20 = 40°，折射角 13°→35° 只增大 35−13 = 22°；40° > 22°，所以折射角增大的幅度比入射角<b>小</b>。这与"光从空气斜射入玻璃时折射角总小于入射角"是一致的。' },
      { kind:'blank', q:'② 折射角与入射角的大小关系：', blanks:[
        { label:'光从空气斜射入玻璃中时，折射角总', answer:['小于','小于入射角'], unit:'' }],
        analysis:'五次数据中折射角 13°、25°、30°、35° 都小于对应的入射角 20°、40°、50°、60°，说明光从空气斜射入玻璃中折射光线靠近法线，折射角<b>小于</b>入射角。' },
      { kind:'choice', q:'③ 入射角为 0°（垂直射向玻璃表面）时，光的传播方向：',
        opts:['不改变，仍沿原方向直线进入玻璃','偏折得最厉害，几乎贴着表面传播','被全部反射回空气中','先偏折后再回到原方向'], answer:0,
        analysis:'表中第一组数据显示入射角 0° 时折射角也是 0°：光<b>垂直</b>射向界面时传播方向<b>不改变</b>（此时虽然速度改变，但不发生偏折）。故 A 正确。' },
      { kind:'choice', q:'④ 用半圆形玻璃砖、让激光沿着半径方向射到圆心处，这样做的目的是：',
        opts:['光在圆心处进入玻璃后，从圆弧面射出时正好垂直界面、不再发生偏折，便于在圆盘上直接读出折射角','半圆形玻璃砖比普通玻璃砖便宜','圆弧面能把光全部反射回来，使光路更亮','半圆形是为了让激光的速度变快'], answer:0,
        analysis:'激光沿半径方向到达圆心发生折射，折射光线继续沿半径射到圆弧面上，此时它与圆弧面<b>垂直</b>，射出时不再偏折，因此圆盘上直接标出的就是玻璃中的折射角，读数方便准确。故 A 正确。' },
      { kind:'choice', q:'⑤ 若让激光逆着"入射角 50°"那次的折射光线方向、从玻璃中射向圆心，出射光将：',
        opts:['沿第 4 次入射光线的方向射出，说明折射时光路可逆','沿法线方向射出','被玻璃全部吸收','与第 4 次入射光线平行但方向相同'], answer:0,
        analysis:'光路<b>可逆</b>：逆着原折射光线（30°）入射，光就沿原入射光线方向射出，出射角等于原来的入射角 <b>50°</b>。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'半圆玻璃砖探究折射角与入射角' },

  { id:'c4s4b011', ch:4, sec:4,
    kp:['refract'], type:'calc', diff:1, freq:4, points:6,
    stem:'工厂质检员用一束激光垂直穿过一块厚 0.2 m 的玻璃板检查内部气泡。查资料得知：光在真空中的速度为 3×10⁸ m/s，在这种玻璃中的速度约为 2×10⁸ m/s。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 速度比较：', blanks:[
        { label:'光在玻璃中的传播速度比在真空中', answer:['小','慢','小些'], unit:'' }],
        analysis:'2×10⁸ m/s < 3×10⁸ m/s，光在玻璃中的速度比真空中<b>小</b>（约为真空中的 2/3）。介质越"密"，光速越小，这也是光斜射入玻璃时向法线偏折的原因。' },
      { kind:'blank', q:'② 激光穿过玻璃板所需时间：', blanks:[
        { label:'所需时间', answer:['1×10⁻⁹','1e-9','1.0×10⁻⁹','10⁻⁹','1×10^-9'], unit:'s' }],
        analysis:'垂直穿过时方向不变，路程等于厚度 0.2 m。t = s/v = 0.2 m ÷ (2×10⁸ m/s) = <b>1×10⁻⁹ s</b>（1 纳秒）。' },
      { kind:'choice', q:'③ 同样这束光垂直穿过 0.2 m 厚的水层（光在水中速度 2.25×10⁸ m/s）与穿过这块玻璃相比：',
        opts:['在水中用时更短，因为光在水中的速度更大','在水中用时更长，因为水比玻璃"稀"','用时相同，因为厚度一样','无法比较'], answer:0,
        analysis:'厚度相同，路程相同；水中速度 2.25×10⁸ m/s 大于玻璃中 2×10⁸ m/s，由 t = s/v 知水中用时 0.2÷2.25×10⁸ ≈ 8.9×10⁻¹⁰ s <b>更短</b>。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'激光垂直穿过玻璃板质检' },

  { id:'c4s4b012', ch:4, sec:4,
    kp:['refract'], type:'calc', diff:3, freq:4, points:8,
    stem:'某景观水池实际水深 1.8 m，池底铺着白色瓷砖。资料给出：从水面上方近处观察时，视深与实际深度之比约为 3∶4；光在真空中的速度为 3×10⁸ m/s，在水中的速度约为 2.25×10⁸ m/s。请依次完成下面三问。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 站在池边看池底瓷砖，觉得水深：', blanks:[
        { label:'视深', answer:['1.35','1.35m','1.35米'], unit:'m' }],
        analysis:'视深 = 实际深度 × 3/4 = 1.8 m × 3 ÷ 4 = <b>1.35 m</b>。池底反射的光从水斜射入空气发生折射，人眼逆着折射光线看去，觉得池底变高了 0.45 m。' },
      { kind:'blank', q:'② 池底一束光竖直向上传播到水面所需时间：', blanks:[
        { label:'时间', answer:['8×10⁻⁹','8e-9','8.0×10⁻⁹','8×10^-9'], unit:'s' }],
        analysis:'竖直传播路程为实际水深 1.8 m（不是视深）。t = s/v = 1.8 m ÷ (2.25×10⁸ m/s) = <b>8×10⁻⁹ s</b>。' },
      { kind:'blank', q:'③ 光在水中的速度是真空中的几分之几：', blanks:[
        { label:'比值（用小数表示）', answer:['0.75','3/4','0.75倍'], unit:'' }],
        analysis:'2.25×10⁸ ÷ 3×10⁸ = <b>0.75</b>，即光在水中速度是真空中的 3/4。' },
      { kind:'choice', q:'④ 关于这三问，下列综合判断正确的是：',
        opts:['池水看起来变浅是折射造成的错觉，实际水深仍是 1.8 m，不能按看到的 1.35 m 判断能否安全下水','池水实际深度就是 1.35 m，因为看到的就是真实的','光在水中比在真空中快，所以池底的光先到水面','视深与实际深度之比与水的多少有关，池子越大比值越小'], answer:0,
        analysis:'看到的"浅"是折射形成的<b>虚像</b>造成的错觉，实际水深仍是 <b>1.8 m</b>；光在水中比真空中<b>慢</b>（0.75 倍）；视深与实际深度之比由介质决定，与池子大小无关。安全警示必须依据实际水深。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'景观水池视深与光传播时间综合' },

  { id:'c4s5b001', ch:4, sec:5,
    kp:['disperse'], type:'choice', diff:1, freq:2, points:3,
    stem:'夏日阵雨过后放晴，小虹背对太阳站在空旷的场地上，看见天空中出现了一道弯弯的彩色光带，外侧偏红、内侧偏紫。',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'关于彩虹的形成，下列说法正确的是？',
      opts:['空中的小水珠相当于许多小三棱镜，太阳光经过水珠时发生色散，分解成各种颜色的光','彩虹是水珠本身发出的彩色光','彩虹是天空中的云彩被染上了颜色','彩虹是太阳光在水珠表面只发生反射形成的黑白影像'], answer:0,
      analysis:'太阳光是复色光。悬浮在空中的小水珠相当于<b>三棱镜</b>，太阳光射入水珠发生折射、在水珠内表面反射后再折射出来时，各种色光偏折程度不同而被分开——这就是<b>色散</b>，形成外红内紫的彩色光带。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'雨后天空彩虹' },

  { id:'c4s5b002', ch:4, sec:5,
    kp:['ir-uv'], type:'choice', diff:1, freq:2, points:3,
    stem:'超市收银台前，收银员把一张纸币放进验钞机，机器里发出一片肉眼几乎看不见的淡紫色光，纸币上立刻显现出发亮的防伪标记；同一台机器旁的取暖器则吹出热风。',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'关于这两种设备用到的不可见光，判断正确的是？',
      opts:['验钞机用的是紫外线，能使纸币上的荧光物质发光；取暖器主要利用红外线的热效应','验钞机用的是红外线，取暖器用的是紫外线','两者都用紫外线，因为紫外线看得见','两者都用红外线，因为红外线能使荧光物质发光'], answer:0,
      analysis:'<b>紫外线</b>能使荧光物质发光，验钞机据此让防伪标记显现；<b>红外线</b>的<b>热效应</b>显著，取暖器、烤箱、浴霸都利用它。两种光都是人眼看不见的。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'超市验钞机与取暖器' },

  { id:'c4s5b003', ch:4, sec:5,
    kp:['ir-uv'], type:'choice', diff:1, freq:2, points:3,
    stem:'学校医务室用一种灯给诊疗室空气消毒；体育老师则提醒同学们：夏天在烈日下待太久容易晒伤皮肤，长时间直视强烈的太阳光还会伤害眼睛。',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'下列关于红外线和紫外线的说法，正确的是？',
      opts:['紫外线能灭菌消毒，但过量照射会伤害皮肤和眼睛；红外线热效应显著，可用于遥控、夜视和加热','紫外线对人体完全无害，可以随便照射','红外线能使荧光物质发光，所以验钞机用红外线','红外线和紫外线都能被人眼直接看见，只是颜色很淡'], answer:0,
      analysis:'紫外线的用处：灭菌消毒、使荧光物质发光、促进人体合成维生素 D；但<b>过量</b>紫外线会损伤皮肤和眼睛，故需要防晒。红外线的用处：遥控、夜视、加热（<b>热效应</b>显著）、红外测温。两者人眼都<b>看不见</b>。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'医务室消毒灯与烈日防晒' },

  { id:'c4s5b004', ch:4, sec:5,
    kp:['disperse'], type:'blank', diff:1, freq:2, points:6,
    stem:'小玥用放大镜贴近电视机屏幕观察，发现画面其实由许许多多密集排列的红、绿、蓝小亮点组成；这些亮点有的亮有的暗，组合出了屏幕上五彩缤纷的画面。她又在美术课上用颜料调出了各种颜色。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 色光的三原色：', blanks:[
        { label:'色光的三原色是红、绿、', answer:['蓝','蓝光'], unit:'' }],
        analysis:'<b>色光</b>的三原色是<b>红、绿、蓝</b>，按不同比例混合可以得到各种颜色的光；电视、手机屏幕就是用这三种亮点混色的。' },
      { kind:'blank', q:'② 三原色光等量混合：', blanks:[
        { label:'红、绿、蓝三种色光等量混合在一起，得到的是', answer:['白光','白色光','白'], unit:'' }],
        analysis:'三原色光<b>等量</b>混合得到<b>白光</b>——这也反过来说明白光是由多种色光组成的复色光。' },
      { kind:'blank', q:'③ 颜料三原色：', blanks:[
        { label:'颜料的三原色是品红、黄、', answer:['青','青色'], unit:'' }],
        analysis:'<b>颜料</b>三原色是<b>品红、黄、青</b>，与色光三原色不同；颜料等量混合越混越暗，最终趋于黑色（颜料靠反射光显色，混得越多吸收越多）。' },
      { kind:'choice', q:'④ 屏幕上的白色画面是怎样形成的？',
        opts:['该处红、绿、蓝三种小亮点同时发光且亮度相当，混合成白光进入眼睛','屏幕上的白色部分是透光的空洞，背后有灯光照亮','白色亮点是另外单独的一种原色','屏幕上涂了白色颜料'], answer:0,
        analysis:'白色画面处三种原色亮点<b>同时全亮</b>，等量混合成<b>白光</b>；只亮一种就显那种颜色，两种亮就显混合色（如红+绿=黄）。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'放大镜观察电视屏三原色亮点' },

  { id:'c4s5b005', ch:4, sec:5,
    kp:['ir-uv'], type:'blank', diff:1, freq:2, points:6,
    stem:'晚上小朔躺在沙发上用遥控器换台：他把遥控器对准电视机按了一下，频道变了；后来他故意把遥控器对着身后的白墙按，频道居然也变了。他又用手机摄像头对准遥控器前端按键，屏幕上能看到一个亮点在闪。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 遥控器发出的光：', blanks:[
        { label:'遥控器发出的是人眼看不见的光', answer:['红外线','红外','红外光'], unit:'' }],
        analysis:'电视遥控器发出的是<b>红外线</b>，用它携带编码信号；人眼看不见，所以按遥控器时看不到光束。' },
      { kind:'blank', q:'② 对着白墙按也能换台的原因：', blanks:[
        { label:'红外线射到白墙表面发生了', answer:['反射','光的反射'], unit:'' }],
        analysis:'红外线也是光，同样遵守<b>反射</b>规律。它射到白墙后被反射，其中一部分正好射向电视机的接收窗，所以仍能换台。' },
      { kind:'choice', q:'③ 手机摄像头能"看见"遥控器前端亮点，说明：',
        opts:['摄像头的感光元件能感应到部分红外线，而人眼不能','红外线其实是紫色的光','遥控器同时在发射可见光','摄像头把红外线变成了声音'], answer:0,
        analysis:'手机摄像头的感光元件对近红外有响应，能把红外线显示成<b>亮点</b>；人眼却<b>看不见</b>红外线。这也是检修遥控器是否工作的常用办法。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'遥控器红外换台与手机摄像头观察' },

  { id:'c4s5b006', ch:4, sec:5,
    kp:['ir-uv'], type:'blank', diff:1, freq:2, points:6,
    stem:'野外救援队在夜间搜寻走失的登山者：完全无光的树林里，队员戴上一种特制眼镜，能在屏幕上看到人的轮廓呈亮色、树木岩石呈暗色；另一台设备不发出任何光，只对着人体额头一照，几秒就读出体温数值。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 夜视设备利用的光：', blanks:[
        { label:'这种夜视设备靠接收物体自身发出的什么光成像', answer:['红外线','红外','红外光'], unit:'' }],
        analysis:'一切物体都在不停地辐射<b>红外线</b>，温度越高辐射越强。人体温度高于周围树木岩石，辐射的红外线更强，在屏幕上就呈亮色——这是热成像式夜视仪的原理，无需任何照明。' },
      { kind:'blank', q:'② 红外测温的原理：', blanks:[
        { label:'物体的温度越高，向外辐射的红外线越', answer:['强','多','强些'], unit:'' }],
        analysis:'物体温度越高，辐射的红外线越<b>强</b>。红外测温仪接收人体辐射的红外线并换算成温度，因此不接触、不发光也能快速测温。' },
      { kind:'choice', q:'③ 关于这类设备，下列说法正确的是？',
        opts:['它在漆黑环境中也能工作，因为不依赖可见光，靠物体自身辐射的红外线成像','它必须先用强光照亮目标才能成像','它利用的是紫外线使人体发光','它靠接收声音来判断人的位置'], answer:0,
        analysis:'热成像夜视仪与红外测温都不需要可见光照明，靠接收物体<b>自身辐射的红外线</b>工作，所以漆黑环境中照常使用。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'夜间救援热成像夜视仪与红外测温' },

  { id:'c4s5b007', ch:4, sec:5,
    kp:['disperse','ir-uv'], type:'experiment', diff:2, freq:2, points:8,
    stem:'兴趣小组在暗室里让一束窄窄的太阳光通过三棱镜，投射到竖直放置的白色光屏上，屏上出现一条彩色光带（装置见配图）。他们在光屏上选了三个位置放三支相同的温度计：①彩色光带的一端、②彩色光带的另一端、③光带之外那块看起来什么光也没有的屏面。三支温度计初温相同，照射相同时间后读数分别为：①升高 2.0 ℃、②升高 3.2 ℃、③升高 4.5 ℃。',
    note:'配图为程序化绘制的三棱镜分光装置简图，光带不涂颜色，图内只标出三个测温位置①②③，不含任何温度或颜色标注。', fig:'prismSpectrum',
    parts:[
      { kind:'blank', q:'① 屏上出现彩色光带的现象叫做：', blanks:[
        { label:'太阳光通过三棱镜被分解成各种颜色的光，这种现象叫', answer:['色散','光的色散'], unit:'' }],
        analysis:'太阳光（白光）是<b>复色光</b>，通过三棱镜时各种色光偏折程度不同而被分解成红、橙、黄、绿、蓝、靛、紫的彩色光带，这就是<b>色散</b>。' },
      { kind:'blank', q:'② 光带两端颜色：', blanks:[
        { label:'偏折程度较小的一端是', answer:['红光','红'], unit:'' },
        { label:'偏折程度较大的一端是', answer:['紫光','紫'], unit:'' }],
        analysis:'三棱镜对<b>红光</b>偏折最小、对<b>紫光</b>偏折最大，所以光带上端（偏折小）是红光，下端（偏折大）是紫光。' },
      { kind:'choice', q:'③ 三支温度计中升温最多的是③（红光外侧看不见的区域），这说明了什么？',
        opts:['红光外侧存在人眼看不见的光，它的热效应比可见光更强，这种光就是红外线','③处离三棱镜最近，所以温度高','屏面本身会发热，与光无关','温度计放错了位置，数据不可信'], answer:0,
        analysis:'③处没有任何可见光，升温却最多（4.5 ℃ > 3.2 ℃ > 2.0 ℃），说明那里存在<b>看不见的光</b>——<b>红外线</b>，它位于光谱红光的外侧，<b>热效应</b>显著。这正是当年发现红外线的实验思路。故 A 正确。' },
      { kind:'choice', q:'④ 实验中要求三支温度计相同、初温相同、照射时间相同，目的是：',
        opts:['控制变量，使升温多少只由所在区域的光决定，结论才可靠','让实验做得快一些','使三支温度计读数完全一样','为了避免温度计被打碎'], answer:0,
        analysis:'这是典型的<b>控制变量法</b>：只有温度计规格、初温、照射时间等条件都相同，比较升温才有意义，才能把差异归因于所处区域的光不同。故 A 正确。' },
      { kind:'choice', q:'⑤ 若把一块涂了荧光物质的板放在彩色光带偏折最大那一端之外的屏面上，板上微微发光，这说明该处还存在：',
        opts:['紫外线，它能使荧光物质发光','红外线，它能使荧光物质发光','只有可见光，没有别的光','什么光也没有'], answer:0,
        analysis:'偏折最大的一端是紫光，紫光之外存在<b>紫外线</b>，人眼看不见，但能使<b>荧光物质发光</b>，验钞机、防伪标记就利用了这一性质。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'三棱镜色散与红光外侧热效应测温' },

  { id:'c4s5b008', ch:4, sec:5,
    kp:['ir-uv'], type:'experiment', diff:3, freq:2, points:8,
    stem:'小昱想弄清两个问题：① 隔着普通窗玻璃后，紫外线还能不能照到卡片上？② 涂防晒霜到底有没有用？他准备了紫外线灯、一张遇紫外线会变色的荧光卡片、一块普通窗玻璃、两片相同的透明塑料片和两种防晒霜（A、B）。请你帮他把实验方案补充完整并分析结果。已知他做了三步：第一步只用紫外线灯照卡片，卡片明显变色；第二步把窗玻璃挡在灯和卡片之间，卡片几乎不变色；第三步在两片塑料片上分别均匀涂上 A、B 两种防晒霜，挡在灯前照卡片，涂 A 的几乎不变色，涂 B 的明显变色。',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'① 第一步（不挡任何东西直接照）在整个实验中的作用是：',
        opts:['作为对照，确认紫外线灯工作正常、卡片遇紫外线确实会变色','多余的一步，可以省略','用来测量紫外线的温度','为了让卡片先"预热"'], answer:0,
        analysis:'探究实验必须设置<b>对照</b>：先证明"有紫外线时卡片会变色"，后面"隔着某物几乎不变色"才能说明该物阻挡了紫外线。故 A 正确。' },
      { kind:'blank', q:'② 由第二步可以得出的结论：', blanks:[
        { label:'由第二步可知，普通窗玻璃对紫外线', answer:['能阻挡','阻挡','能挡住','基本能挡住','有阻挡作用'], unit:'' }],
        analysis:'隔着窗玻璃卡片<b>几乎不变色</b>，说明透过玻璃到达卡片的紫外线很少——普通窗玻璃<b>能阻挡</b>大部分紫外线。所以隔着关闭的玻璃窗晒太阳，几乎晒不黑，但也难以借助阳光合成维生素 D。' },
      { kind:'blank', q:'③ 由第三步可以得出的结论：', blanks:[
        { label:'阻挡紫外线效果更好、更值得选用的是防晒霜', answer:['A','A霜','防晒霜A'], unit:'' }],
        analysis:'卡片变色越明显，说明透过的紫外线越多、防护越差。涂 A 的几乎不变色→透过的紫外线少→<b>A 的防护效果更好</b>；涂 B 的明显变色→防护差。' },
      { kind:'choice', q:'④ 第三步中"两片塑料片相同、涂抹同样均匀、卡片相同、照射时间和距离相同"，这些做法体现了：',
        opts:['控制变量法，只让防晒霜的种类不同','等效替代法','理想实验法','放大法'], answer:0,
        analysis:'比较两种防晒霜的效果，只能让<b>防晒霜种类</b>这一个因素不同，其余条件全部相同，这是<b>控制变量法</b>。故 A 正确。' },
      { kind:'choice', q:'⑤ 若还想探究"防晒霜涂得厚薄是否影响防护效果"，下列方案最合理的是：',
        opts:['用同一种防晒霜，在两片相同的塑料片上分别涂薄薄一层和厚厚一层，其余条件完全相同，比较卡片变色程度','换两种不同品牌的防晒霜各涂一层比较','把防晒霜直接涂在卡片上再照','只用紫外线灯照卡片，看变色程度'], answer:0,
        analysis:'要研究<b>厚薄</b>的影响，就必须只改变厚度这一变量：同一种防晒霜、同样的塑料片和卡片、同样的照射条件，分别涂薄层和厚层比较卡片变色程度。故 A 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'紫外线穿透玻璃与防晒霜对比探究' },

];

var QBANK_C4B_ORIG_FIGS = {
  spearFish: function() {
    const W = 330, H = 230, wy = 96;
    let s = `<rect x="0" y="${wy}" width="${W}" height="${H - wy}" fill="#1d3a52" opacity=".55"/>`;
    s += `<line x1="0" y1="${wy}" x2="${W}" y2="${wy}" stroke="#7fb3d5" stroke-width="2"/>`;
    s += `<text x="8" y="${wy - 8}" fill="#9aa4b5" font-size="11">空气</text>`;
    s += `<text x="8" y="${wy + 18}" fill="#9aa4b5" font-size="11">水</text>`;
    // 鱼（水下实际位置）
    const fx = 104, fy = 176;
    s += `<ellipse cx="${fx}" cy="${fy}" rx="26" ry="12" fill="#e8a33d"/>`;
    s += `<path d="M ${fx - 26} ${fy} L ${fx - 42} ${fy - 11} L ${fx - 42} ${fy + 11} Z" fill="#e8a33d"/>`;
    s += `<circle cx="${fx + 15}" cy="${fy - 4}" r="2.4" fill="#22293a"/>`;
    s += `<text x="${fx - 6}" y="${fy + 30}" fill="#d7dee9" font-size="12" text-anchor="middle">鱼</text>`;
    // 眼睛（岸上）
    const ex = 262, ey = 40;
    s += `<path d="M ${ex - 16} ${ey} Q ${ex} ${ey - 11} ${ex + 16} ${ey} Q ${ex} ${ey + 11} ${ex - 16} ${ey}" fill="none" stroke="#d7dee9" stroke-width="2"/>`;
    s += `<circle cx="${ex}" cy="${ey}" r="4.5" fill="#d7dee9"/>`;
    s += `<text x="${ex}" y="${ey - 18}" fill="#d7dee9" font-size="12" text-anchor="middle">渔民的眼睛</text>`;
    // 法线与光路（鱼→水面→眼睛）
    const px = 196;
    s += `<line x1="${px}" y1="${wy - 46}" x2="${px}" y2="${wy + 46}" stroke="#9aa4b5" stroke-width="1" stroke-dasharray="5 4"/>`;
    s += `<line x1="${fx + 12}" y1="${fy - 8}" x2="${px}" y2="${wy}" stroke="#f2d16b" stroke-width="2"/>`;
    s += `<line x1="${px}" y1="${wy}" x2="${ex - 10}" y2="${ey + 8}" stroke="#f2d16b" stroke-width="2"/>`;
    s += `<circle cx="${px}" cy="${wy}" r="3" fill="#f2d16b"/>`;
    s += `<text x="${px + 6}" y="${wy - 30}" fill="#9aa4b5" font-size="11">法线</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="渔民叉鱼时的水面、鱼与眼睛位置光路简图">${s}</svg>`;
  },

  poolPebble: function() {
    const W = 330, H = 210, wy = 56, by = 172;
    let s = `<rect x="26" y="${wy}" width="${W - 52}" height="${by - wy}" fill="#1d3a52" opacity=".5"/>`;
    s += `<path d="M 14 ${wy - 10} L 14 ${by + 14} L ${W - 14} ${by + 14} L ${W - 14} ${wy - 10}" fill="none" stroke="#6b7686" stroke-width="3"/>`;
    s += `<line x1="14" y1="${wy}" x2="${W - 14}" y2="${wy}" stroke="#7fb3d5" stroke-width="2"/>`;
    s += `<text x="${W - 22}" y="${wy - 8}" fill="#9aa4b5" font-size="11" text-anchor="end">水面</text>`;
    // 池底鹅卵石
    const px = 150;
    s += `<ellipse cx="${px}" cy="${by - 6}" rx="15" ry="8" fill="#c3ccd9"/>`;
    s += `<ellipse cx="${px - 6}" cy="${by - 8}" rx="6" ry="4" fill="#e6ebf2" opacity=".8"/>`;
    s += `<text x="${px + 26}" y="${by - 2}" fill="#d7dee9" font-size="12">鹅卵石</text>`;
    s += `<text x="${px - 60}" y="${by + 30}" fill="#9aa4b5" font-size="11">池底</text>`;
    // 观察方向（近正上方）
    s += `<line x1="${px}" y1="${wy - 34}" x2="${px}" y2="${wy - 4}" stroke="#9aa4b5" stroke-width="1" stroke-dasharray="4 4"/>`;
    s += `<path d="M ${px} ${wy - 34} l -5 9 l 10 0 Z" fill="#9aa4b5"/>`;
    s += `<text x="${px}" y="${wy - 40}" fill="#d7dee9" font-size="11" text-anchor="middle">从上方向下观察</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="游泳池截面简图，池底有一颗鹅卵石">${s}</svg>`;
  },

  refractRay: function() {
    const W = 320, H = 240, iy = 120, ix = 168;
    let s = `<rect x="0" y="${iy}" width="${W}" height="${H - iy}" fill="#1d3a52" opacity=".45"/>`;
    s += `<line x1="0" y1="${iy}" x2="${W}" y2="${iy}" stroke="#7fb3d5" stroke-width="2"/>`;
    s += `<text x="10" y="${iy - 10}" fill="#9aa4b5" font-size="12">空气</text>`;
    s += `<text x="10" y="${iy + 22}" fill="#9aa4b5" font-size="12">水</text>`;
    s += `<text x="${W - 12}" y="${iy - 10}" fill="#9aa4b5" font-size="11" text-anchor="end">界面（水面）</text>`;
    // 法线
    s += `<line x1="${ix}" y1="26" x2="${ix}" y2="${H - 20}" stroke="#9aa4b5" stroke-width="1.2" stroke-dasharray="6 5"/>`;
    s += `<text x="${ix + 6}" y="34" fill="#9aa4b5" font-size="11">法线</text>`;
    // 入射光线（空气中，射向界面）
    s += `<line x1="52" y1="44" x2="${ix}" y2="${iy}" stroke="#f2d16b" stroke-width="2.4"/>`;
    s += `<path d="M ${ix} ${iy} l -13 -3 l 6 -9 Z" fill="#f2d16b"/>`;
    s += `<text x="46" y="38" fill="#d7dee9" font-size="12" text-anchor="end">入射光线</text>`;
    // 入射角弧标记（无数值）
    s += `<path d="M ${ix} ${iy - 44} A 44 44 0 0 0 ${ix - 30} ${iy - 32}" fill="none" stroke="#e8a33d" stroke-width="1.6"/>`;
    s += `<text x="${ix - 52}" y="${iy - 44}" fill="#e8a33d" font-size="11">入射角</text>`;
    s += `<circle cx="${ix}" cy="${iy}" r="3" fill="#f2d16b"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="激光从空气射向水面的入射光线与法线简图">${s}</svg>`;
  },

  refractTable: function() {
    const inc = [0, 20, 40, 50, 60];
    const ref = [0, 13, 25, 30, 35];
    const padL = 30, padT = 40, cw = 48, rh = 26, labW = 74;
    const xOf = i => padL + labW + i * cw + cw / 2;
    const rowY = r => padT + r * rh + rh / 2 + 5;
    let s = `<rect x="${padL}" y="${padT}" width="${labW + inc.length * cw}" height="${2 * rh}" fill="none" stroke="#6b7686" stroke-width="1.5"/>`;
    s += `<line x1="${padL + labW}" y1="${padT}" x2="${padL + labW}" y2="${padT + 2 * rh}" stroke="#6b7686" stroke-width="1"/>`;
    s += `<line x1="${padL}" y1="${padT + rh}" x2="${padL + labW + inc.length * cw}" y2="${padT + rh}" stroke="#6b7686" stroke-width="1"/>`;
    inc.forEach((v, i) => {
      if (i > 0) {
        s += `<line x1="${padL + labW + i * cw}" y1="${padT}" x2="${padL + labW + i * cw}" y2="${padT + 2 * rh}" stroke="#6b7686" stroke-width=".8" opacity=".6"/>`;
      }
      s += `<text x="${xOf(i)}" y="${rowY(0)}" fill="#d7dee9" font-size="12" text-anchor="middle">${v}</text>`;
      s += `<text x="${xOf(i)}" y="${rowY(1)}" fill="#d7dee9" font-size="12" text-anchor="middle">${ref[i]}</text>`;
    });
    s += `<text x="${padL + labW / 2}" y="${rowY(0)}" fill="#9aa4b5" font-size="11" text-anchor="middle">入射角/°</text>`;
    s += `<text x="${padL + labW / 2}" y="${rowY(1)}" fill="#9aa4b5" font-size="11" text-anchor="middle">折射角/°</text>`;
    s += `<text x="${padL + labW / 2}" y="${padT - 14}" fill="#d7dee9" font-size="12" text-anchor="middle" font-weight="700">光从空气射入玻璃</text>`;
    return `<svg viewBox="0 0 ${padL * 2 + labW + inc.length * cw} 130" role="img" aria-label="光从空气射入玻璃的入射角与折射角记录表">${s}</svg>`;
  },

  prismSpectrum: function() {
    const W = 360, H = 230;
    let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#12161f" opacity=".35"/>`;
    // 三棱镜
    s += `<path d="M 96 62 L 158 168 L 34 168 Z" fill="#2f4f6d" opacity=".55" stroke="#9fb4cc" stroke-width="1.6"/>`;
    s += `<text x="96" y="188" fill="#9aa4b5" font-size="11" text-anchor="middle">三棱镜</text>`;
    // 入射白光
    s += `<line x1="12" y1="96" x2="88" y2="112" stroke="#eef2f7" stroke-width="2.4"/>`;
    s += `<text x="14" y="86" fill="#d7dee9" font-size="11">太阳光</text>`;
    // 出射光带（不涂颜色，扇形中性表示，铺到光屏上）
    s += `<path d="M 150 124 L 312 34 L 312 126 L 150 136 Z" fill="#eef2f7" opacity=".18"/>`;
    s += `<path d="M 150 124 L 312 34 M 150 136 L 312 126" fill="none" stroke="#9fb4cc" stroke-width="1" stroke-dasharray="4 4"/>`;
    // 光屏
    s += `<line x1="312" y1="20" x2="312" y2="200" stroke="#c3ccd9" stroke-width="3"/>`;
    s += `<text x="322" y="198" fill="#9aa4b5" font-size="11">光屏</text>`;
    // 三个测温位置（①光带一端 ②另一端 ③光带外侧屏面）
    const marks = [[300, 52, '①'], [300, 112, '②'], [300, 162, '③']];
    marks.forEach(m => {
      s += `<circle cx="${m[0]}" cy="${m[1]}" r="7" fill="none" stroke="#e8a33d" stroke-width="1.8"/>`;
      s += `<text x="${m[0] - 18}" y="${m[1] + 4}" fill="#e8a33d" font-size="12" text-anchor="end">${m[2]}</text>`;
    });
    s += `<text x="${W / 2}" y="222" fill="#9aa4b5" font-size="11" text-anchor="middle">①②在光带上、③在光带外的屏面上（三支温度计所在位置）</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="三棱镜分光装置与三个测温位置简图">${s}</svg>`;
  }
};

if(typeof window!=="undefined"){window.QBANK_C4B_ORIG=QBANK_C4B_ORIG;window.QBANK_C4B_ORIG_FIGS=QBANK_C4B_ORIG_FIGS;}

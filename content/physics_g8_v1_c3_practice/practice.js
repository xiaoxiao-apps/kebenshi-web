/* ===== 本章练习题库（第三章 物态变化） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 第3、4、5节题目完成后在数组末尾【追加位】直接追加新题对象即可，页面自动渲染。
 * 版权：全部题目为本站原创编写或情景化改写（质量线 W3，2026-10），题干、选项与解析独立成文。
 */
const QUESTIONS = [
  { id:'c3s1q1', section:'第1节 温度', no:'第1题', points:10,
    stem:'校园科技节上，甲、乙两个展位各展出一支自制的“瓶式温度计”：两个一模一样的小玻璃瓶里装着同样多的红色水，瓶口的橡皮塞上各插一根吸管——甲的吸管较粗，乙的吸管较细（见下图）。当周围温度发生同样大小的变化时，你认为哪一支温度计的反应更灵敏？',
    note:'配图为程序化简图。',
    fig:'twoBottles', figCap:'两支自制温度计简图（甲：吸管较粗；乙：吸管较细）',
    parts:[{ kind:'choice',
      opts:['甲——吸管较粗的那支更灵敏','乙——吸管较细的那支更灵敏','两支的灵敏程度完全相同'], answer:1,
      analysis:'瓶子相同、水量相同，温度变化量相同时，两瓶中水膨胀（或收缩）的体积变化量也相同。同样的体积变化挤进吸管里，吸管越细，液柱高度的变化就越大，现象越容易被观察到，所以细吸管的乙更灵敏。' }] },

  { id:'c3s1q2', section:'第1节 温度', no:'第2题', points:10,
    stem:'读出图中两支温度计的示数（单位均为摄氏度），分别填入下面的横栏。',
    note:'配图为程序化简图，供温度计读数训练使用。',
    fig:'thermPair1', figCap:'温度计读数简图（甲、乙分度值均为 2℃）',
    parts:[{ kind:'blank', blanks:[
      { label:'甲温度计示数', answer:['24'], unit:'℃' },
      { label:'乙温度计示数', answer:['-6'], unit:'℃' }],
      analysis:'读数先认清分度值：两支温度计每小格都代表 2℃。甲的液柱面停在 0℃ 上方第 12 小格处，示数为 24℃，读作“24摄氏度”；乙的液柱面在 0℃ 下方第 3 小格处，示数为 -6℃，读作“负6摄氏度”或“零下6摄氏度”。读数时视线要与液柱面相平。' }] },

  { id:'c3s1q3', section:'第1节 温度', no:'第3题', points:10,
    stem:'小诺家有一支电子体温计：笔状机身的前端是金属测温探头，测温结果显示在液晶屏幕上。请参照实验室用液体温度计的使用要点，为这支电子体温计编写一份使用注意事项。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 测量前先看清量程（这类体温计的测量范围一般为 35~42℃）和显示精度，确认待测温度不会超出量程；<br>② 让金属探头与测量部位（口腔、腋下等）充分接触，测量期间不要挪开，待示数稳定（多数会发出提示音）后再读取；<br>③ 读数时视线正对液晶显示屏；<br>④ 使用前后把探头擦拭干净并消毒，轻拿轻放、避免摔碰，用毕关机收好。',
      analysis:'把实验室温度计的使用规则迁移过来：先观察量程与分度值 → 感温部分（这里是探头）与被测对象充分接触 → 待示数稳定后再读数 → 按规范读数并注意清洁保养。' }] },

  { id:'c3s1q4', section:'第1节 温度', no:'第4题', points:10,
    stem:'科学研究发现：不论采用什么方法降温，任何物体的温度都不可能低于 -273.15℃。现规定以 -273.15℃ 作为新温标的零度，且新温标每 1 度的大小与摄氏温度每 1℃ 相同（新温标的温度记作 T）。若摄氏温度为 t，则 T 与 t 满足的换算关系是：T = t + ______。',
    parts:[{ kind:'blank', blanks:[
      { label:'横线处应填', answer:['273.15'], unit:'' }],
      analysis:'按新规定，-273.15℃ 对应 T = 0；又因两种温标每一度的大小相同，温度的差值可以一一对应，于是 T = t + 273.15。验证：0℃ 对应 T = 273.15；人体温度 37℃ 对应 T = 310.15。' }] },

  { id:'c3s2q1', section:'第2节 熔化和凝固', no:'第1题', points:12,
    stem:'探究小组对某种固态物质持续均匀加热，记录温度随时间的变化，绘制成下图所示的图像。请根据图像的特征回答：这种物质是不是晶体？它的熔点是多少？从开始熔化到完全熔化，大约持续了多长时间？',
    note:'配图为程序化绘制的熔化图像简图（含水平平台段）。',
    fig:'meltCurve', figCap:'某物质熔化过程的温度-时间图像（分度：纵轴每小格 5℃，横轴每小格 1 min）',
    parts:[
      { kind:'choice', q:'① 这种物质是晶体吗？判断依据是什么？',
        opts:['是晶体——图像中出现水平平台，熔化过程中温度保持不变','不是晶体——熔化过程中温度一直在不断升高','仅凭这张图像无法作出判断'], answer:0,
        analysis:'图像中段出现一段与时间轴平行的水平线（平台），说明该物质熔化时虽然持续吸热，温度却停在一个固定值不变，即有确定的熔化温度，符合晶体的特征。' },
      { kind:'blank', q:'② 它的熔点是多少？', blanks:[
        { label:'熔点', answer:['80'], unit:'℃' }],
        analysis:'晶体熔化时保持不变的那个温度就是熔点。读图可知，水平平台段对应的温度为 80℃，所以熔点为 80℃。' },
      { kind:'blank', q:'③ 从开始熔化到完全熔化，大约持续了多长时间？', blanks:[
        { label:'熔化持续时间', answer:['4'], unit:'min' }],
        analysis:'平台起点在第 3 min（开始熔化），终点在第 7 min（完全熔化），熔化过程大约持续 7 min - 3 min = 4 min。' } ] },

  { id:'c3s2q2', section:'第2节 熔化和凝固', no:'第2题', points:12,
    stem:'下图中，甲是同一种物质的熔化图像，乙是它的凝固图像。仔细观察两条曲线，你能从中获得哪些物理信息？请尽量多写几条。',
    note:'配图为程序化简图（甲：熔化图像带平台；乙：凝固图像带平台，两平台温度相同）。本题为开放题，作答后对照参考要点自评计分。',
    fig:'meltFreeze', figCap:'甲：熔化图像；乙：凝固图像（同一物质，平台温度均为 80℃）',
    parts:[{ kind:'open',
      ref:'参考要点（答出主要几条即可得满分）：<br>① 两条曲线都出现水平平台，说明该物质是<b>晶体</b>；<br>② 甲为熔化图像：熔化前不断吸热升温；到达熔点后虽继续吸热，温度却保持不变（固液共存）；完全熔化后温度才继续升高；<br>③ 乙为凝固图像：凝固前不断放热降温；到达凝固点后继续放热而温度保持不变；完全凝固后温度再下降；<br>④ 两图的平台温度都是 80℃，说明<b>同一种物质的凝固点与熔点相同</b>；<br>⑤ 熔化过程吸热，凝固过程放热。',
      analysis:'读熔化/凝固图像抓三点：一看有无平台——区分晶体与非晶体；二看平台对应的温度——熔点等于凝固点；三看各段的吸热/放热情况与物质状态的变化。' }] },

  { id:'c3s2q3', section:'第2节 熔化和凝固', no:'第3题', points:10,
    stem:'图中给出了两支温度计（单位均为摄氏度）：甲是实验室温度计，乙是体温计。请分别写出它们的示数。',
    note:'配图为程序化简图。注意两支温度计的分度值并不相同。',
    fig:'thermPair2', figCap:'温度计读数简图（甲实验室温度计分度值 1℃；乙体温计分度值 0.1℃）',
    parts:[{ kind:'blank', blanks:[
      { label:'甲温度计示数', answer:['38'], unit:'℃' },
      { label:'乙体温计示数', answer:['36.5','36.50'], unit:'℃' }],
      analysis:'甲的分度值是 1℃，液柱面正对 38 刻线，示数为 38℃；乙是体温计，分度值为 0.1℃，液柱面停在 36℃ 之后第 5 小格处，示数为 36.5℃。体温计的玻璃泡上方有一段很细的缩口，离开人体后液柱不会自行退回，所以可以拿下来从容读数。' }] },

  { id:'c3s2q4', section:'第2节 熔化和凝固', no:'第4题', points:8,
    stem:'熔化要吸热，凝固要放热。请从日常生活或生产中，举出人们利用这两个热效应的例子，并简单说明其中的道理。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（答出任意 2~3 个合理例子即可得满分）：<br>① 夏天往饮料里加冰块——冰熔化时吸收饮料的热量，饮料凉得更快更透；<br>② 北方冬天往菜窖里放几桶水——水结冰（凝固）时放出热量，窖内温度不至于降得太低，蔬菜不易冻坏；<br>③ 病人发烧时额头敷冰袋或贴退热贴——冰熔化吸热，带走体表的热量；<br>④ 冷链运输中用冰块给食品保鲜——冰熔化吸热，维持箱内低温；<br>⑤ 铸造车间把炽热的钢水注入模具——钢水凝固放热，冷却成形为工件。',
      analysis:'判断标准：所举例子中确实发生了熔化（固态→液态，吸热）或凝固（液态→固态，放热），并且人们正是利用了这一吸热/放热效应。' }] },

  { id:'c3s2q5', section:'第2节 熔化和凝固', no:'第5题', points:8,
    stem:'隆冬的一个夜晚，气温降到约 -5℃，院子里的水洼都结了冰。小杰把一杯酒精与水的混合液放在院子里，过了很久取回来，却发现混合液丝毫没有凝固。针对这个现象，你能提出什么猜想？再根据你的猜想举出一个可能的应用实例。',
    note:'本题为开放题（给参考思路），作答后对照自评计分。',
    parts:[{ kind:'open',
      ref:'参考思路：<br><b>猜想</b>：酒精掺入水中后，混合液的凝固点比纯水（0℃）更低——夜里约 -5℃ 仍高于混合液的凝固点，所以水洼结了冰，混合液却长时间不凝固。（支撑：固态酒精的熔点约为 -117℃，酒精本身极难凝固，掺进水中会拉低整体的凝固点）<br><b>应用实例</b>：寒冬给汽车发动机水箱加注酒精-水混合防冻液，把冷却液的凝固点降到环境温度以下，防止冷却液结冰膨胀而胀裂水箱。<br>（其他合理的猜想与应用，只要自洽即可得分）',
      analysis:'本题指向“凝固点可以改变”的拓展认识：同一种纯净物的熔点/凝固点是固定的，混合物却不同——掺入别的物质会改变其凝固点，道理类似冬天在冰雪路面上撒盐促熔。' }] },

  { id:'c3s3q1', section:'第3节 汽化和液化', no:'第1题', points:8,
    stem:'深秋的清晨，公园的草叶上挂着一颗颗晶莹的露珠；到了中午，在阳光和风的作用下，草叶又变干了。从“露珠出现”到“露珠消失”，先后发生了哪些物态变化？',
    note:'本题为客观题，选择后即时判分。',
    parts:[{ kind:'choice',
      opts:['先发生液化，后发生汽化','先发生汽化，后发生液化','先发生凝固，后发生熔化','先发生熔化，后发生凝固'], answer:0,
      analysis:'夜间气温下降，空气中的水蒸气遇冷液化成小水滴附着在草叶上，形成露珠；中午温度升高、空气流动加快，小水滴汽化（蒸发）成水蒸气散去，草叶变干。所以先后发生的是液化和汽化。' }] },

  { id:'c3s3q2', section:'第3节 汽化和液化', no:'第2题', points:10,
    stem:'家里炖肉汤时，妈妈先用大火把汤烧至沸腾，随后调成小火，让汤面保持微微沸腾继续炖。小蕾担心地问：“火调小了，汤的温度会不会跟着降下来，把肉炖不熟？”汤沸腾后改用小火，汤的温度会降低吗？请用物理知识说明理由。',
    note:'本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>不会降低。<br>液体沸腾过程中，温度保持在沸点不变。改用小火后，只要汤还能持续从火焰吸热，就仍然维持沸腾状态，温度依旧等于沸点，不会下降。改小火只是降低了供热速率——够维持沸腾即可，还能节省燃气。',
      analysis:'沸腾的特点：达到沸点后继续吸热，但温度保持不变。大火、小火改变的只是单位时间供热的多少；只要供热量仍能满足汽化的需要，沸腾就持续进行，汤的温度始终停在沸点。' }] },

  { id:'c3s3q3', section:'第3节 汽化和液化', no:'第3题', points:10,
    stem:'暑假里，小明在乡下看到奶奶用老办法给剩饭剩菜“土法保鲜”：在阴凉通风处放一盆水，盆里立两块高出水面的砖头，砖头上搁一只比盆口小些的篮子，篮子里放饭菜，再用一块薄纱布袋把篮子整个罩住，让纱布袋的下边缘浸在盆里的水中。这样处理的饭菜，在大热天里不容易很快变质。请分析其中的物理道理。',
    note:'装置示意（文字描述）：一盆水中立着两块砖，砖上搁着盛饭菜的篮子，篮子外罩纱布袋，袋边浸入水中。本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>① 盆中和纱布袋上的水不断蒸发，蒸发要从周围环境吸热，使篮子附近的温度降低；<br>② 纱布袋边缘浸在水里，水沿布向上浸润，使整个布袋始终保持潮湿，蒸发得以持续进行；<br>③ 潮湿的纱布袋罩住篮子，一方面降低了饭菜周围的温度，另一方面阻挡了空气流动，减慢饭菜表面水分的蒸发，饭菜就不容易变质。',
      analysis:'核心原理有两条：水蒸发吸热、给周围环境降温；罩上布袋减小饭菜表面空气的流动、减慢蒸发。这套土办法同时用到了汽化吸热和影响蒸发快慢的两个因素（温度、空气流动）。' }] },

  { id:'c3s3q4', section:'第3节 汽化和液化', no:'第4题', points:10,
    stem:'炎热的夏天，爸爸从冰箱冷藏室拿出一罐冰镇饮料放在餐桌上。没过多久，小美发现罐壁外面“冒汗”变湿了，她立刻拿纸巾去擦。这样能把罐壁彻底擦干吗？为什么？',
    note:'本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>不能彻底擦干。<br>刚从冷藏室拿出的饮料罐温度远低于室温，空气中的水蒸气碰到冰冷的罐壁，会液化成小水珠附着在上面，罐壁因此“冒汗”。擦掉已有的水珠后，周围空气中仍有大量水蒸气，它们会继续在冷罐壁上液化，所以边擦边“出汗”，擦不干。只有等罐子温度升到接近室温、液化不再发生时，才能真正擦干。',
      analysis:'罐壁变湿的本质：空气中的水蒸气遇冷液化。液化发生的条件是水蒸气接触到温度明显更低的物体；只要罐壁仍比室温低得多，液化就持续进行，擦干只是暂时的。' }] },

  { id:'c3s3q5', section:'第3节 汽化和液化', no:'第5题', points:12,
    stem:'新疆吐鲁番素有“火洲”之称，夏季酷热、常年少雨，寸水寸金。当地先民修建了巧妙的引水工程——坎儿井，把天山的冰雪融水引到绿洲，输水途中水的蒸发和渗漏都大大减少。坎儿井由竖井、暗渠和明渠组成：暗渠是主体，即开凿在地下的输水通道，宽约 1.2 m；竖井的深浅随地势和地下水位而定，最深的超过 90 m；夏季暗渠中的水温比外界低 5~10 ℃。请结合影响蒸发快慢的因素，分析坎儿井为什么能减少输水过程中水的蒸发。',
    note:'结构示意（文字描述）：从山脚到绿洲，一排竖井向下贯通一条倾斜的地下暗渠，暗渠引地下水顺坡流淌，出地面后经明渠灌入农田。本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>坎儿井靠地下暗渠输水，从三方面抑制蒸发：<br>① 暗渠深埋地下，阳光晒不到，水温比外界低 5~10 ℃——液体温度低，蒸发就慢；<br>② 暗渠是狭窄封闭的地下通道，水面上的空气几乎不流动——液面空气流动越慢，蒸发越慢；<br>③ 暗渠内不见阳光、通道封闭，水面与干燥热空气的接触也大为减少。三个因素共同作用，使输水途中的蒸发损失大大减小。',
      analysis:'蒸发快慢由液体温度、液体表面积和液面上方空气流动速度共同决定。坎儿井对应地做到了：水温低（地下避晒）、空气流动慢（封闭通道）、暴露的水面小，因此蒸发被显著抑制。' }] },

  { id:'c3s4q1', section:'第4节 升华和凝华', no:'第1题', points:10,
    stem:'演示“碘的升华”实验时，老师没有用酒精灯火焰直接烧烤装有碘颗粒的玻璃容器，而是向容器浇热水（或把它浸在热水中）来加热。请查一查碘的熔点和酒精灯火焰的温度，说明老师这样做的原因。',
    note:'本题为简答题，作答后对照参考答案自评计分。参考数据：碘的熔点约为 113.7℃，酒精灯外焰温度可达 400~500℃。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>① 酒精灯外焰温度可达 400~500℃，远高于碘的熔点（约 113.7℃）。直接用火焰加热，碘会先熔化成液态碘、再汽化成碘蒸气，就观察不到“固态直接变气态”的升华过程了；<br>② 热水的温度最高不超过 100℃，始终低于碘的熔点。用热水加热时碘不会熔化，吸热后直接升华为紫色的碘蒸气，现象单纯、便于观察。',
      analysis:'关键在加热温度与碘的熔点的关系：只有让受热温度始终低于熔点，碘才能保持固态并直接升华为碘蒸气，从而排除“先熔化后汽化”对观察的干扰。' }] },

  { id:'c3s4q2', section:'第4节 升华和凝华', no:'第2题', points:10,
    stem:'放在衣柜里的樟脑丸，过些日子就会“不翼而飞”；北方隆冬，结了冰的湿衣服挂在室外，冰并没有化成水，衣服却也一天天变干了。请说明：为什么这两个现象都属于升华？',
    note:'本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>① 樟脑丸本来是固态，“消失”时并没有熔化成液体流下来，而是直接由固态变成气态散发到空气中——固态直接变气态就是升华；<br>② 衣服上的冰也是固态，隆冬室外气温低于 0℃，冰达不到熔点、不能熔化，衣服却慢慢干了，说明冰不经液态、直接变成水蒸气跑掉了——同样是升华。',
      analysis:'判断依据只有一条：物质是否“从固态直接变为气态”而没有经过液态。两例中都找不到液态的痕迹（樟脑丸没有留下液体，结冰天的气温低于冰的熔点），因此都是升华现象。' }] },

  { id:'c3s4q3', section:'第4节 升华和凝华', no:'第3题', points:10,
    stem:'阅读材料：把二氧化碳气体加压、降温到一定程度，它会变成白色的、状似积雪的固体。这种固体在常温下不经过熔化就直接变成气体，因此得名“干冰”。干冰升华时会吸收大量的热，制冷本领很强——把它播撒到云层中，能促使云里的水蒸气迅速遇冷凝结成小水滴或小冰晶，创造降水条件，这就是人工降雨。',
    note:'本题为阅读分析题，作答后对照参考答案自评计分。',
    parts:[
      { kind:'blank', q:'① 干冰在常温下不经熔化就直接变成气体，这种物态变化叫作______（填名称），此过程要______（选填“吸热”或“放热”）。', blanks:[
        { label:'物态变化名称', answer:['升华'], unit:'' },
        { label:'吸热或放热', answer:['吸热'], unit:'' }],
        analysis:'物质从固态直接变为气态属于升华；升华与熔化、汽化一样，都需要吸收热量。' },
      { kind:'open', q:'② 请结合材料中的信息，说明干冰为什么能用于人工降雨。', ref:'参考答案：<br>① 干冰撒入云层后迅速升华变成气体，升华过程吸收大量的热，使云层中空气的温度急剧下降；<br>② 云中的水蒸气遇冷后，液化凝结成小水滴，或凝华成小冰晶；<br>③ 小水滴、小冰晶不断聚集、长大，最终降落下来形成降雨——这就是干冰人工降雨的道理。', analysis:'人工降雨的三步链条：干冰升华吸热、云层降温 → 水蒸气遇冷液化成小水滴或凝华成小冰晶 → 水滴、冰晶聚集变大后降落成雨。' }
    ] },

  { id:'c3s4q4', section:'第4节 升华和凝华', no:'第4题', points:12,
    stem:'做一个小实验：往易拉罐里装入碎冰块，再撒入适量的盐，用筷子搅拌大约半分钟；用温度计测量罐内冰盐混合物的温度，会发现它低于 0 ℃。静置一会儿再观察易拉罐的外壁，罐的下部和底部竟然挂上了一层白霜。',
    note:'实验情景（文字描述）：易拉罐内装冰块与食盐，搅拌后罐内温度低于 0℃，罐外壁下部与底部结出白霜。本题含填空与简答，作答后对照参考答案自评计分。',
    parts:[
      { kind:'blank', q:'① 冰与盐混合物的温度______ 0 ℃（选填“高于”“等于”或“低于”）。', blanks:[
        { label:'混合物温度与0℃的关系', answer:['低于'], unit:'' }],
        analysis:'冰里掺入盐并搅拌后，冰的熔点被降低，冰在低于 0℃ 时就开始熔化；熔化要吸热，于是混合物的温度被拉到 0℃ 以下。' },
      { kind:'open', q:'② 易拉罐外壁的白霜是怎样形成的？请说明其中涉及的物态变化。', ref:'参考答案：<br>① 冰中加盐搅拌后，冰熔化大量吸热，罐内混合物和罐壁的温度都降到 0℃ 以下；<br>② 空气中的水蒸气碰到温度极低的罐壁，不经液态、直接由气态变成固态的小冰晶，附着在罐的下部和底部，这就是白霜；<br>③ 气态直接变为固态的物态变化叫<b>凝华</b>。', analysis:'白霜并非“水先液化、再结冰”，而是水蒸气遇到远低于 0℃ 的罐壁直接凝华成的固态小冰晶。因果链：冰加盐熔化吸热降温 → 罐壁低于 0℃ → 水蒸气遇冷凝华 → 白霜。' }
    ] },

  { id:'c3s4q5', section:'第4节 升华和凝华', no:'第5题', points:10,
    stem:'浪费水资源的现象在生活中并不少见：水龙头滴水不修、用完水不关紧、洗手时让水长流……请再写出你观察到的浪费水现象，并针对这些现象提出几条切实可行的节水建议。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（浪费现象与节水建议各答出 2~3 条即可）：<br>浪费水的现象举例：① 刷牙、抹肥皂的间隙水龙头一直开着；② 开着长流水冲洗碗筷、蔬菜；③ 洗菜水、洗衣水用完就倒掉，不再利用；④ 水管、水箱漏水长期无人修理。<br>节水建议：① 随手关紧水龙头，杜绝长流水；② 一水多用——淘米水浇花洗菜、洗衣水冲厕所；③ 选用节水型器具（节水龙头、节水马桶），农业上推广滴灌、喷灌；④ 定期检查水管水箱，发现漏水及时报修。',
      analysis:'开放题没有唯一答案，关键是能从生活实际出发找出浪费现象，并给出可操作的节水办法。地球上可供人类直接利用的淡水资源只占约 0.3%，节约用水意义重大。' }] },

  { id:'c3s5q1', section:'第5节 跨学科实践', no:'第1题', points:10,
    stem:'周末家里煮饺子，锅里的水烧开后，妈妈立刻把大火调成小火，让水保持微微沸腾。小舟不解地问：“火调这么小，水都不怎么翻滚了，饺子会不会煮不熟呀？”请从物理学的角度解释：水沸腾之后，为什么把大火改成小火反而更合理？',
    note:'本题为简答开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 水沸腾后温度<b>保持在沸点不变</b>——再大的火也不会让水温更高，因此大火并不能把饺子煮得更快；<br>② 维持沸腾只需要水能持续吸热，小火的供热已足够让水保持沸腾，饺子照样能煮熟；<br>③ 继续用大火只会加快水的汽化，锅里的水很快烧干，还白白浪费燃气，所以水开后改小火更合理。',
      analysis:'抓住两个得分点：其一，沸腾时温度停在沸点，大火升不了温、对煮熟饺子没有额外帮助；其二，大火只加快汽化，费水费燃气，小火足以维持沸腾。' }] },

  { id:'c3s5q2', section:'第5节 跨学科实践', no:'第2题', points:10,
    stem:'厨房里常有这样的提醒：揭开沸腾汤锅的锅盖时，手和脸要避开涌出的水蒸气，当心烫伤。温度相同的水蒸气和水，为什么被水蒸气烫到往往比被开水烫到伤得更重？',
    note:'本题为简答开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 温度相同的水蒸气碰上皮肤时，要先<b>液化</b>成同温度的热水；<br>② 液化过程会<b>放出大量的热</b>，这部分热量额外传给了皮肤；<br>③ 因此，相同质量的水蒸气比同温度的水多释放一份液化热，皮肤吸收的总热量更多，烫伤也就更严重。',
      analysis:'关键在“液化放热”这一步：水蒸气变成同温度的水时会额外放出热量，这份热量叠加在它降温放出的热量之上，皮肤受到的总热量更多，所以伤得更重。' }] },

]; // 闭合 QUESTIONS 数组（现含第1~5节共21题）
// =====【追加位】第4/5节：完成后在数组末尾直接追加新题对象，页面自动渲染 =====

/* ===== 状态与持久化 ===== */
const STORAGE_KEY = 'c3_practice_state_v1';
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
  return String(s == null ? '' : s).replace(/[＋]/g, '+').replace(/[－]/g, '-').replace(/[。．]/g, '').trim();
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function $1(sel, el) { return (el || document).querySelector(sel); }
function $all(sel, el) { return Array.from((el || document).querySelectorAll(sel)); }

/* ===== 程序化插图 ===== */
const FIGURES = {
  twoBottles: svgTwoBottles,
  thermPair1: svgThermPair1,
  thermPair2: svgThermPair2,
  meltCurve: svgMeltCurve,
  meltFreeze: svgMeltFreeze
};

function svgTwoBottles() {
  const bottle = (cx, label, strokeW) => {
    const bodyW = 60, bodyH = 90, neckW = 16, neckH = 28;
    const left = cx - bodyW / 2, top = 55;
    const path = `M ${left},${top} L ${left},${top + bodyH - bodyW / 2} A ${bodyW / 2},${bodyW / 2} 0 0 0 ${left + bodyW},${top + bodyH - bodyW / 2} L ${left + bodyW},${top} L ${cx + neckW / 2},${top} L ${cx + neckW / 2},${top - neckH} L ${cx - neckW / 2},${top - neckH} L ${cx - neckW / 2},${top} Z`;
    const liqH = 45, liqTop = top + bodyH - liqH - 6;
    const liquid = `M ${left + 4},${liqTop + liqH} L ${left + 4},${liqTop} L ${left + bodyW - 4},${liqTop} L ${left + bodyW - 4},${liqTop + liqH} A ${bodyW / 2 - 4},${bodyW / 2 - 4} 0 0 1 ${left + 4},${liqTop + liqH} Z`;
    return `<g>
      <path d="${path}" fill="none" stroke="#9aa4b5" stroke-width="2"/>
      <path d="${liquid}" fill="rgba(90,215,255,.25)" stroke="#5ad7ff" stroke-width="1.5"/>
      <line x1="${cx}" y1="${top - neckH}" x2="${cx}" y2="12" stroke="#ffd479" stroke-width="${strokeW}" stroke-linecap="round"/>
      <text x="${cx}" y="165" fill="#d7dee9" font-size="13" text-anchor="middle" font-weight="700">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 420 180" role="img" aria-label="两支自制温度计简图">
    ${bottle(110, '甲（吸管较粗）', 5)}
    ${bottle(310, '乙（吸管较细）', 2.5)}
    <text x="210" y="24" fill="#9aa4b5" font-size="12" text-anchor="middle">玻璃小瓶相同、水量相同</text>
  </svg>`;
}

function svgThermometer(cx, label, value, step, min, max, opts) {
  opts = opts || {};
  const topY = 22, bottomY = 150, bulbR = 10;
  const pxPerDeg = (bottomY - topY - bulbR) / (max - min);
  const yFor = v => bottomY - (v - min) * pxPerDeg;
  const zeroY = yFor(0);
  const labelStep = step < 1 ? 1 : (step === 1 ? 5 : 10);
  let ticks = '', labels = '';
  for (let v = min; v <= max + 1e-9; v += step) {
    const y = yFor(v);
    const major = Math.abs(v % labelStep) < step / 2;
    const x2 = cx + (major ? 18 : 11);
    ticks += `<line x1="${cx + 6}" y1="${y}" x2="${x2}" y2="${y}" stroke="#6b7686" stroke-width="${major ? 1.5 : 1}" opacity="${major ? 1 : .6}"/>`;
    if (major) {
      labels += `<text x="${cx + 24}" y="${y + 4}" fill="#9aa4b5" font-size="10">${Math.round(v * 10) / 10}</text>`;
    }
  }
  const valY = yFor(value);
  const fillY = Math.min(zeroY, valY), fillH = Math.abs(valY - zeroY);
  const liquid = value >= 0
    ? `<rect x="${cx - 3}" y="${fillY}" width="6" height="${fillH}" fill="#ff7a6e" opacity=".9"/>`
    : `<rect x="${cx - 3}" y="${zeroY}" width="6" height="${fillH}" fill="#5ad7ff" opacity=".9"/>`;
  const tip = `<text x="${cx}" y="${valY - 8}" fill="#ffd479" font-size="11" text-anchor="middle" font-weight="700">${value}℃</text>`;
  return `<g>
    <line x1="${cx}" y1="${topY}" x2="${cx}" y2="${bottomY}" stroke="#9aa4b5" stroke-width="3" stroke-linecap="round"/>
    <line x1="${cx}" y1="${topY}" x2="${cx}" y2="${bottomY}" stroke="#0b0e13" stroke-width="1"/>
    <circle cx="${cx}" cy="${bottomY + bulbR - 2}" r="${bulbR}" fill="#ff7a6e" opacity=".9"/>
    ${ticks}${labels}${liquid}${tip}
    <text x="${cx}" y="${bottomY + 34}" fill="#d7dee9" font-size="12" text-anchor="middle" font-weight="700">${label}</text>
  </g>`;
}

function svgThermPair1() {
  return `<svg viewBox="0 0 520 240" role="img" aria-label="温度计读数简图：甲24℃，乙-6℃，分度值2℃">
    ${svgThermometer(120, '甲', 24, 2, -10, 40)}
    ${svgThermometer(380, '乙', -6, 2, -10, 40)}
  </svg>`;
}

function svgThermPair2() {
  return `<svg viewBox="0 0 520 240" role="img" aria-label="温度计读数简图：甲38℃，乙36.5℃">
    ${svgThermometer(120, '甲 实验室温度计', 38, 1, 35, 42)}
    ${svgThermometer(380, '乙 体温计', 36.5, 0.1, 35, 42)}
  </svg>`;
}

function svgMeltCurve() {
  const padL = 44, padR = 20, padT = 24, padB = 44;
  const W = 360, H = 220;
  const x0 = padL, x1 = W - padR, y0 = H - padB, y1 = padT;
  const tMax = 10, TMin = 0, TMax = 100;
  const xFor = t => x0 + (t / tMax) * (x1 - x0);
  const yFor = T => y0 - (T / (TMax - TMin)) * (y0 - y1);
  let s = `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="#6b7686" stroke-width="1.5"/>`;
  s += `<line x1="${x0}" y1="${y1}" x2="${x0}" y2="${y0}" stroke="#6b7686" stroke-width="1.5"/>`;
  s += `<text x="${x1}" y="${y0 + 18}" fill="#9aa4b5" font-size="11" text-anchor="end">时间/min</text>`;
  s += `<text x="14" y="${y1 + 8}" fill="#9aa4b5" font-size="11">温度/℃</text>`;
  for (let t = 0; t <= 10; t++) {
    const x = xFor(t);
    s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + 5}" stroke="#6b7686" opacity=".8"/>`;
    if (t % 5 === 0) s += `<text x="${x}" y="${y0 + 18}" fill="#9aa4b5" font-size="10" text-anchor="middle">${t}</text>`;
  }
  for (let T = 0; T <= 100; T += 5) {
    const y = yFor(T);
    s += `<line x1="${x0}" y1="${y}" x2="${x0 - (T % 10 === 0 ? 6 : 3)}" y2="${y}" stroke="#6b7686" opacity="${T % 10 === 0 ? 1 : .5}"/>`;
    if (T % 10 === 0) s += `<text x="${x0 - 10}" y="${y + 4}" fill="#9aa4b5" font-size="10" text-anchor="end">${T}</text>`;
  }
  const p0 = [xFor(0), yFor(30)], p1 = [xFor(3), yFor(80)], p2 = [xFor(7), yFor(80)], p3 = [xFor(10), yFor(95)];
  s += `<polyline points="${p0.join(',')} ${p1.join(',')} ${p2.join(',')} ${p3.join(',')}" fill="none" stroke="#ffd479" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  s += `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="#5ad7ff" stroke-width="1" stroke-dasharray="3 3"/>`;
  s += `<text x="${xFor(5)}" y="${yFor(80) - 10}" fill="#5ad7ff" font-size="11" text-anchor="middle">熔点 80℃（3~7 min）</text>`;
  s += `<circle cx="${p1[0]}" cy="${p1[1]}" r="3" fill="#ffd479"/><circle cx="${p2[0]}" cy="${p2[1]}" r="3" fill="#ffd479"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="熔化曲线简图：80℃水平平台">${s}</svg>`;
}

function svgMeltFreeze() {
  const axis = (x0, y0, x1, y1) => `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="#6b7686" stroke-width="1.5"/><line x1="${x0}" y1="${y1}" x2="${x0}" y2="${y0}" stroke="#6b7686" stroke-width="1.5"/><text x="${x1}" y="${y0 + 16}" fill="#9aa4b5" font-size="10" text-anchor="end">时间/min</text><text x="${x0 - 6}" y="${y1}" fill="#9aa4b5" font-size="10">温度/℃</text>`;
  const tMax = 10, TMax = 100;
  const W = 460, H = 220;
  const padL = 40, padB = 40, top = 24, right = 210;
  const xFor = (t, off) => off + (t / tMax) * (right - padL);
  const yFor = T => H - padB - (T / TMax) * (H - padB - top);
  let s = '';
  const off1 = 10;
  s += axis(off1 + padL, yFor(0), off1 + right, top);
  for (let t = 0; t <= 10; t++) {
    const x = xFor(t, off1 + padL);
    s += `<line x1="${x}" y1="${yFor(0)}" x2="${x}" y2="${yFor(0) + 4}" stroke="#6b7686" opacity=".7"/>`;
    if (t % 5 === 0) s += `<text x="${x}" y="${yFor(0) + 16}" fill="#9aa4b5" font-size="9" text-anchor="middle">${t}</text>`;
  }
  for (let T = 0; T <= 100; T += 10) {
    const y = yFor(T);
    s += `<line x1="${off1 + padL}" y1="${y}" x2="${off1 + padL - 5}" y2="${y}" stroke="#6b7686" opacity=".7"/>`;
    s += `<text x="${off1 + padL - 8}" y="${y + 3}" fill="#9aa4b5" font-size="9" text-anchor="end">${T}</text>`;
  }
  const ptsA = [[0, 30], [3, 80], [7, 80], [10, 95]].map(([t, T]) => `${xFor(t, off1 + padL)},${yFor(T)}`).join(' ');
  s += `<polyline points="${ptsA}" fill="none" stroke="#ffd479" stroke-width="2.5" stroke-linejoin="round"/>`;
  s += `<line x1="${xFor(3, off1 + padL)}" y1="${yFor(80)}" x2="${xFor(7, off1 + padL)}" y2="${yFor(80)}" stroke="#5ad7ff" stroke-width="1" stroke-dasharray="3 3"/>`;
  s += `<text x="${xFor(5, off1 + padL)}" y="${yFor(80) - 8}" fill="#5ad7ff" font-size="10" text-anchor="middle">80℃</text>`;
  s += `<text x="${xFor(5, off1 + padL)}" y="${yFor(0) + 30}" fill="#d7dee9" font-size="12" text-anchor="middle" font-weight="700">甲 熔化图像</text>`;
  const off2 = 240;
  s += axis(off2 + padL, yFor(0), off2 + right, top);
  for (let t = 0; t <= 10; t++) {
    const x = xFor(t, off2 + padL);
    s += `<line x1="${x}" y1="${yFor(0)}" x2="${x}" y2="${yFor(0) + 4}" stroke="#6b7686" opacity=".7"/>`;
    if (t % 5 === 0) s += `<text x="${x}" y="${yFor(0) + 16}" fill="#9aa4b5" font-size="9" text-anchor="middle">${t}</text>`;
  }
  for (let T = 0; T <= 100; T += 10) {
    const y = yFor(T);
    s += `<line x1="${off2 + padL}" y1="${y}" x2="${off2 + padL - 5}" y2="${y}" stroke="#6b7686" opacity=".7"/>`;
    s += `<text x="${off2 + padL - 8}" y="${y + 3}" fill="#9aa4b5" font-size="9" text-anchor="end">${T}</text>`;
  }
  const ptsB = [[0, 95], [3, 80], [7, 80], [10, 30]].map(([t, T]) => `${xFor(t, off2 + padL)},${yFor(T)}`).join(' ');
  s += `<polyline points="${ptsB}" fill="none" stroke="#5ad7ff" stroke-width="2.5" stroke-linejoin="round"/>`;
  s += `<line x1="${xFor(3, off2 + padL)}" y1="${yFor(80)}" x2="${xFor(7, off2 + padL)}" y2="${yFor(80)}" stroke="#ffd479" stroke-width="1" stroke-dasharray="3 3"/>`;
  s += `<text x="${xFor(5, off2 + padL)}" y="${yFor(80) - 8}" fill="#ffd479" font-size="10" text-anchor="middle">80℃</text>`;
  s += `<text x="${xFor(5, off2 + padL)}" y="${yFor(0) + 30}" fill="#d7dee9" font-size="12" text-anchor="middle" font-weight="700">乙 凝固图像</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="熔化与凝固双图">${s}</svg>`;
}

/* ===== 渲染引擎 ===== */
function renderFig(fig, figCap) {
  if (!fig || !FIGURES[fig]) return '';
  return `<div class="figbox">${FIGURES[fig]()}<div class="figcap">${esc(figCap || '')}</div></div>`;
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
      `<div class="blankrow"><span>${esc(b.label)}：</span><input type="text" class="blank-inp" data-bi="${bi}" data-qid="${q.id}" data-pi="${pi}" placeholder="数值"${b.unit ? ` aria-label="${esc(b.label)}"` : ''}><span>${esc(b.unit || '')}</span></div>`
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
    ${renderFig(q.fig, q.figCap)}
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
  $1('.ref-toggle', el).disabled = true;
  const ratio = full ? score / full : 0;
  $all('.self-score', el).forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('done');
    if (Math.abs(+btn.dataset.ratio - ratio) < 1e-6) btn.classList.add('done');
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
  $1('.ref', el).classList.add('show');
  $1('.selfrow', el).classList.add('show');
  btn.disabled = true;
  STATE.open[`${qid}_${pi}`] = true;
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

/* ===== 本章练习题库（第三章 物态变化） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 第3、4、5节题目完成后在数组末尾【追加位】直接追加新题对象即可，页面自动渲染。
 * 依据：docs/c3s1-transcript.md（P62~63 练习与应用 4 题）、docs/c3s2-transcript.md（P68~69 练习与应用 5 题）。
 */
const QUESTIONS = [
  { id:'c3s1q1', section:'第1节 温度', no:'教材 P62 练习与应用 第1题', points:10,
    stem:'在进行实践活动展示时，两位同学都带来了自制的温度计（如图所示）。他们所用的玻璃小瓶相同，里面都装同样多的水，在小瓶口的橡皮塞中各插进一根吸管。观察这两支自制温度计的构造，你认为哪一支温度计对温度的反应更灵敏？',
    note:'图为程序化简图（对应教材图 3.1-9），原图细节以教材印刷为准。',
    fig:'twoBottles', figCap:'两支自制温度计简图（甲：吸管较粗；乙：吸管较细）',
    parts:[{ kind:'choice',
      opts:['甲（吸管较粗的）更灵敏','乙（吸管较细的）更灵敏','两支一样灵敏'], answer:1,
      analysis:'瓶相同、水量相同，温度变化相同时瓶中水的体积变化量相同；吸管越细，同样的体积变化引起的液柱高度变化越大，现象越明显，反应越灵敏。' }] },

  { id:'c3s1q2', section:'第1节 温度', no:'教材 P62 练习与应用 第2题（重绘简图）', points:10,
    stem:'图中各温度计（温度计单位都是摄氏度）的示数分别是多少？',
    note:'原题配图为教材图 3.1-10（甲实验室温度计、乙寒暑表、丙体温计）；转录未含原图具体示数，本页以程序化简图重绘供读数训练，原题实际示数以教材印刷为准。',
    fig:'thermPair1', figCap:'温度计读数简图（甲、乙分度值均为 2℃）',
    parts:[{ kind:'blank', blanks:[
      { label:'甲温度计示数', answer:['24'], unit:'℃' },
      { label:'乙温度计示数', answer:['-6'], unit:'℃' }],
      analysis:'甲：液柱面在 0℃ 上方第 12 个小格处，示数为 24℃，读作"24摄氏度"；乙：液柱面在 0℃ 下方第 3 个小格处，示数为 -6℃，读作"负6摄氏度"或"零下6摄氏度"。读数关键：先认清分度值（一个小格代表的值），再看液柱面位置，视线与液面相平。' }] },

  { id:'c3s1q3', section:'第1节 温度', no:'教材 P62 练习与应用 第3题', points:10,
    stem:'图 3.1-11 是一种电子体温计，其金属部分是探头。请参考实验室用温度计的使用要点，编写使用电子体温计的注意事项。',
    note:'题干按转录整理（转录原文"其金属部分是水银计的探头"疑有衍字），以教材印刷为准。本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 测量前看清它的量程（新型体温计刻度范围通常为 35~42℃）和显示精度，确认被测温度不超量程；<br>② 让探头与测量部位（口腔、腋下等）充分接触，测量过程中不要拿开，待示数稳定（通常有提示音）后再读数；<br>③ 读数时视线正对液晶显示屏；<br>④ 使用前后将探头擦拭清洁（消毒），轻拿轻放，避免摔碰；用毕关机妥善存放。',
      analysis:'参照实验室用温度计要点迁移：看清量程与分度值 → 玻璃泡（探头）全部浸入（充分接触）被测对象 → 待示数稳定再读数 → 规范读数。' }] },

  { id:'c3s1q4', section:'第1节 温度', no:'教材 P63 练习与应用 第4题', points:10,
    stem:'科学研究表明，无论采用什么方法降温，温度也不可能比 -273.15℃ 更低。以这个温度为零度来规定一种表示温度的方法，每一度的大小与摄氏温度相同（该方法的温度记为 T）。若摄氏温度为 t，则 T 与 t 的换算关系是：T = t + ______。',
    parts:[{ kind:'blank', blanks:[
      { label:'横线处应填', answer:['273.15'], unit:'' }],
      analysis:'-273.15℃ 对应新规定的 0 度，而每一度的大小与摄氏温度相同，即温度差 1℃ 等于新温标 1 度，所以 T = t + 273.15。例如 0℃ 对应 273.15，37℃ 对应 310.15。' }] },

  { id:'c3s2q1', section:'第2节 熔化和凝固', no:'教材 P68 练习与应用 第1题（图 3.2-8）', points:12,
    stem:'用实验探究固体熔化过程温度随时间变化的图像。图 3.2-8 是加热某种物质使其熔化的图像。根据图像的特征可以判断这种物质是不是晶体？它的熔点是多少？从开始熔化到完全熔化，大约持续了多长时间？',
    note:'下图为程序化重绘的熔化图像简图（带水平平台），对应教材图 3.2-8，原图具体数值以教材印刷为准。',
    fig:'meltCurve', figCap:'图 3.2-8 简图：加热某物质使其熔化的 T-t 图像（分度：纵轴每小格 5℃，横轴每小格 1 min）',
    parts:[
      { kind:'choice', q:'① 这种物质是晶体吗？判断依据是？',
        opts:['是晶体——熔化图像有水平平台，熔化时温度保持不变','不是晶体——熔化时温度持续上升','无法判断'], answer:0,
        analysis:'图像中有一段与时间轴平行的水平线段（平台），说明该物质熔化时尽管不断吸热，温度却保持不变，有固定的熔化温度，所以是晶体。' },
      { kind:'blank', q:'② 它的熔点是多少？', blanks:[
        { label:'熔点', answer:['80'], unit:'℃' }],
        analysis:'水平平台对应的温度就是熔点。读图：平台段纵坐标为 80℃，所以熔点为 80℃。' },
      { kind:'blank', q:'③ 从开始熔化到完全熔化，大约持续了多长时间？', blanks:[
        { label:'熔化持续时间', answer:['4'], unit:'min' }],
        analysis:'平台从第 3 min 开始、到第 7 min 结束，熔化过程持续约 7 min - 3 min = 4 min。' } ] },

  { id:'c3s2q2', section:'第2节 熔化和凝固', no:'教材 P69 练习与应用 第2题（图 3.2-9）', points:12,
    stem:'图 3.2-9 甲、乙分别是某物质的熔化和凝固图像。你能从中获得哪些信息？',
    note:'下图为程序化重绘简图（甲：熔化图像带平台；乙：凝固图像带平台，平台温度与甲相同），对应教材图 3.2-9，原图细节以教材印刷为准。本题为开放题，作答后对照参考要点自评计分。',
    fig:'meltFreeze', figCap:'图 3.2-9 简图：甲熔化图像、乙凝固图像（同一物质，平台温度均为 80℃）',
    parts:[{ kind:'open',
      ref:'参考要点（答出主要几条即可得满分）：<br>① 两图都有水平平台，说明该物质是<b>晶体</b>；<br>② 甲是熔化图像：熔化前吸热升温，达到熔点后继续吸热但温度不变（固液共存），全部熔化后温度再升高；<br>③ 乙是凝固图像：凝固前放热降温，达到凝固点后继续放热但温度不变，全部凝固后温度再降低；<br>④ 两图平台温度相同（80℃），说明<b>同一种物质的凝固点和它的熔点相同</b>；<br>⑤ 熔化过程吸热、凝固过程放热。',
      analysis:'读熔化/凝固图像三看：一看有无平台（晶体/非晶体），二看平台温度（熔点=凝固点），三看各段吸/放热与状态变化。' }] },

  { id:'c3s2q3', section:'第2节 熔化和凝固', no:'教材 P69 练习与应用 第3题（图 3.2-10）', points:10,
    stem:'图中各温度计（温度计单位都是摄氏度）的示数分别是多少？',
    note:'⚠️ 转录中本题图注（"一种电子体温计：其金属部分是水银计的探头"）与题干文字（温度计读数）可能对应有误，原题插图以教材印刷为准；本页以程序化简图（实验室温度计 + 体温计各一支）供读数训练。',
    fig:'thermPair2', figCap:'温度计读数简图（甲实验室温度计分度值 1℃；乙体温计分度值 0.1℃）',
    parts:[{ kind:'blank', blanks:[
      { label:'甲温度计示数', answer:['38'], unit:'℃' },
      { label:'乙体温计示数', answer:['36.5','36.50'], unit:'℃' }],
      analysis:'甲：分度值 1℃，液柱面在 38 处，示数 38℃；乙：体温计分度值 0.1℃，液柱面在 36℃ 后第 5 小格，示数 36.5℃。体温计有缩口，可以离开人体读数。' }] },

  { id:'c3s2q4', section:'第2节 熔化和凝固', no:'教材 P69 练习与应用 第4题', points:8,
    stem:'日常生活中有哪些利用熔化吸热、凝固放热的例子？',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（教材实例 + 生活常见例）：<br>① 夏天在饮料中加冰块降温——冰熔化吸热，使饮料温度下降得更多；<br>② 北方冬天在菜窖里放几桶水——水凝固成冰时放热，使菜窖内温度不会太低；<br>③ 发烧时额头敷冰袋（或退热贴）降温——冰熔化吸热；<br>④ 冷藏食品运输时用冰块保鲜——冰熔化吸热维持低温；<br>⑤ 钢水浇铸成工件——钢水凝固放热成形。<br>（答出任意 2~3 个合理例子即可得满分）',
      analysis:'判断标准：例子中确实存在熔化（固→液，吸热）或凝固（液→固，放热）过程，且人们利用了这一热效应。' }] },

  { id:'c3s2q5', section:'第2节 熔化和凝固', no:'教材 P69 练习与应用 第5题', points:8,
    stem:'冬天，室外已经结冰。某同学把酒精和水的混合液体放到室外（温度大约为 -5℃），经过相当长一段时间后，从室外取回混合液体时，却发现混合液体没有凝固。就这个现象你能提出什么猜想？根据这个猜想举出一个可能应用的例子。',
    note:'本题为开放题（给参考思路），作答后对照自评计分。',
    parts:[{ kind:'open',
      ref:'参考思路：<br><b>猜想</b>：酒精和水混合后，混合液的凝固点比纯水的凝固点（0℃）低——室外约 -5℃ 高于混合液的凝固点，所以相当长时间后混合液仍不凝固。（依据：表中固态酒精的熔点为 -117℃，酒精很难凝固，掺入水中拉低了整体的凝固点）<br><b>应用例子</b>：冬天在汽车发动机的冷却水箱里加酒精（或用酒精-水混合防冻液），降低冷却液的凝固点，防止低温下冷却液凝固胀坏水箱。<br>（其他合理猜想与应用，只要自洽即可得分）',
      analysis:'本题是"凝固点可变"的拓展思考：同种物质熔点/凝固点固定，但混合物不同——掺入其他物质会改变凝固点（类似冬天撒盐化雪）。' }] },

  { id:'c3s3q1', section:'第3节 汽化和液化', no:'教材 P76 练习与应用 第1题', points:8,
    stem:'清晨在校园里，我们经常会看到绿叶上有晶莹的露珠，而课间活动时露珠又不见了。在上述现象中，发生了哪些物态变化？',
    note:'本题为客观题，选择后即时判分。',
    parts:[{ kind:'choice',
      opts:['先液化，后汽化','先汽化，后液化','先凝固，后熔化','先熔化，后凝固'], answer:0,
      analysis:'露珠是空气中的水蒸气遇冷液化形成的小水滴；课间活动时露珠消失，是小水滴汽化（蒸发）变成了水蒸气。所以先后发生了液化和汽化。' }] },

  { id:'c3s3q2', section:'第3节 汽化和液化', no:'教材 P76 练习与应用 第2题', points:10,
    stem:'在煎中药时，人们一般先用武火（大火）使药液迅速沸腾，再改用文火（小火）使药液保持沸腾。改用文火使药液保持沸腾时，药液的温度会降低吗？为什么？',
    note:'本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>不会降低。<br>液体沸腾时温度保持在沸点不变；改用文火后，只要药液能够继续吸热，就会保持沸腾，温度仍等于沸点，不会下降。改用文火只是为了维持继续吸热，节省燃料。',
      analysis:'沸腾的特点是：达到沸点后继续吸热，温度保持不变。改用小火只是减少了供热速率，但只要仍能提供汽化所需的热量，液体就会继续沸腾，温度不变。' }] },

  { id:'c3s3q3', section:'第3节 汽化和液化', no:'教材 P76 练习与应用 第3题（图 3.3-10）', points:10,
    stem:'在炎热、干燥的夏天，以前有人用以下方法保存剩饭、剩菜。在通风的地方放一盆水，在盆里放两块高出水面的砖头，砖头上搁一只比盆小一点的篮子。篮子里放剩饭、剩菜，再把一个薄毛巾或纱布袋罩在篮子上，并使其边缘浸入水里（图3.3-10）。用这种方法保存的食物，不容易因气温过高而很快变质。试分析其中的物理原理。',
    note:'图3.3-10 无图片素材，题干后附文字描述占位：一盆水中立着砖头，砖头上放一只盛饭菜的篮子，篮子上罩着边缘浸入水中的纱布（毛巾）袋。原图细节以教材印刷为准。本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>① 盆中的水蒸发时会从周围环境吸热，使篮子附近的温度降低；<br>② 毛巾（或纱布）边缘浸入水中，水会沿毛巾上升，使毛巾保持湿润；<br>③ 湿润的毛巾罩在篮子上，既降低了饭菜周围的温度，又减小了饭菜表面空气的流动，从而减慢了饭菜中水分的蒸发和食物的变质。',
      analysis:'核心物理原理：水蒸发吸热降温 + 覆盖物减小空气流动从而减慢蒸发。这种保存方法同时利用了汽化吸热和影响蒸发快慢的因素。' }] },

  { id:'c3s3q4', section:'第3节 汽化和液化', no:'教材 P76 练习与应用 第4题', points:10,
    stem:'夏天，某同学从冰箱的冷藏室里取出一瓶水。不一会儿，他发现瓶壁变湿了。如果马上用毛巾擦，能将瓶壁擦干吗？为什么？',
    note:'本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>不能擦干。<br>从冰箱冷藏室取出的水瓶温度较低，空气中的水蒸气遇到温度低的瓶壁会液化成小水珠，所以瓶壁变湿。擦去已有的水珠后，空气中仍有大量水蒸气，会继续遇到冷的瓶壁而液化成小水珠，因此马上用毛巾擦不能擦干。只要瓶壁温度仍明显低于室温，液化现象就会持续发生。',
      analysis:'瓶壁变湿是空气中水蒸气遇冷液化的结果；液化需要水蒸气遇到温度较低的物体。只要瓶子温度仍低，水蒸气就会持续液化，所以擦不干。' }] },

  { id:'c3s3q5', section:'第3节 汽化和液化', no:'教材 P76 练习与应用 第5题（图 3.3-11）', points:12,
    stem:'吐鲁番是全国有名的“火炉”，常年高温少雨。当地流行使用坎儿井，它大大减少了输水过程中水的蒸发和渗漏。坎儿井由明渠、暗渠和竖井组成（图3.3-11）。暗渠即地下水道，是坎儿井的主体，宽约1.2 m。井的深度因地势和地下水位的高低不同而有深有浅，最深的井深度超过90 m。井内的水在夏季比外界低5~10 ℃。请你分析一下坎儿井是如何减少水的蒸发的。',
    note:'图3.3-11 无图片素材，题干后附文字描述占位：坎儿井剖面示意图，标注山地、竖井、明渠、暗渠、含水层（水源），箭头表示地下水流向。原图细节以教材印刷为准。本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>坎儿井的输水主体是暗渠（地下水道），主要从三方面减少蒸发：<br>① 暗渠在地下，不受阳光直射，水温比外界低 5~10 ℃——温度低，蒸发慢；<br>② 暗渠是封闭的地下通道，水面附近空气流动很慢——减慢了液面上方空气的流动，蒸发减慢；<br>③ 暗渠中水面不见光，也减小了水与空气接触的剧烈程度。这些因素共同作用，使坎儿井输水过程中水的蒸发大大减少。',
      analysis:'影响蒸发快慢的因素：液体温度、液体表面积、液体表面空气流动速度。坎儿井通过降低水温、减小空气流动、避免阳光直射来减慢蒸发。' }] },
  { id:'c3s4q1', section:'第4节 升华和凝华', no:'教材 P80 练习与应用 第1题', points:10,
    stem:'观察碘的升华时，为什么利用浇热水或浸在热水中的方式而不用酒精灯直接加热装有碘颗粒的玻璃容器呢？请查查碘的熔点和酒精灯火焰的温度，说明原因。',
    note:'本题为简答题，作答后对照参考答案自评计分。参考数据：碘的熔点约为 113.7℃，酒精灯外焰温度可达 400~500℃。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>① 酒精灯火焰温度（外焰可达 400~500℃）远高于碘的熔点（约 113.7℃），若用酒精灯直接加热，碘会先熔化成液态碘再汽化，观察不到“固态直接变气态”的升华现象；<br>② 热水温度最高不超过 100℃，低于碘的熔点，浇热水（或浸在热水中）加热时碘不会熔化，碘吸热后直接升华为紫色碘蒸气，便于观察升华现象。',
      analysis:'核心：加热温度是否超过碘的熔点。低于熔点加热才能保证固态碘直接升华为碘蒸气，排除先熔化后汽化的干扰。' }] },

  { id:'c3s4q2', section:'第4节 升华和凝华', no:'教材 P80 练习与应用 第2题', points:10,
    stem:'衣柜里的樟脑片，过一段时间就不见了；北方寒冷的冬天，晾在室外结冰的衣服也慢慢变干。你如何说明这些都是升华现象？',
    note:'本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>① 樟脑片是固态的，过一段时间“不见了”，并没有变成液态流下来，说明它由固态直接变成了气态散发到空气中，这就是升华；<br>② 结冰的衣服上的冰是固态的，北方冬天室外温度常低于 0℃，冰不能熔化成水，衣服却也慢慢变干了，说明冰直接由固态变成了气态的水蒸气，也是升华。',
      analysis:'判断依据：物质是否“固态直接变气态”而没有经过液态。两例都没有液态痕迹（樟脑片没有流下液体、结冰天气温低于熔点冰不熔化），故都是升华。' }] },

  { id:'c3s4q3', section:'第4节 升华和凝华', no:'教材 P80 练习与应用 第3题', points:10,
    stem:'二氧化碳气体若被加压、降温到一定程度，就会形成白色的、像雪一样的固体。这种固体在常温下不经熔化就会直接变成气体，被称为干冰。干冰具有很好的制冷作用，可用于人工降雨。这是由于干冰在常温下会迅速变为气体并吸热，促使水蒸气遇冷凝结成小水滴或小冰晶，从而达到降水条件。',
    note:'本题为阅读分析题，作答后对照参考答案自评计分。',
    parts:[
      { kind:'blank', q:'① 干冰是固态二氧化碳，它在常温下不经熔化直接变成气体，这种现象叫作______（填物态变化名称），此过程要______（选填“吸热”或“放热”）。', blanks:[
        { label:'物态变化名称', answer:['升华'], unit:'' },
        { label:'吸热或放热', answer:['吸热'], unit:'' }],
        analysis:'固态直接变为气态是升华；像熔化、汽化一样，升华也要吸热。' },
      { kind:'open', q:'② 请结合题中信息，说明干冰为什么能用于人工降雨。', ref:'参考答案：<br>① 干冰在常温下会迅速升华变为气体，升华时吸收大量的热，使周围空气温度急剧下降；<br>② 高空中的水蒸气遇冷，液化凝结成小水滴，或凝华成小冰晶；<br>③ 小水滴、小冰晶不断聚集变大后降落到地面，形成降雨，从而达到人工降雨的目的。', analysis:'人工降雨三步：干冰升华吸热降温 → 水蒸气遇冷液化成小水滴或凝华成小冰晶 → 聚集变大降落成雨。' }
    ] },

  { id:'c3s4q4', section:'第4节 升华和凝华', no:'教材 P80 练习与应用 第4题（图 3.4-6、图 3.4-7）', points:12,
    stem:'如图3.4-6所示，将冰块放于易拉罐中并加入适量的盐。用筷子搜拌大约半分钟，用温度计测量罐中冰与盐水混合物的温度，可以看到混合物的温度低于0 ℃。这时观察易拉罐的下部和底部，会发现白霜（图3.4-7）。',
    note:'图3.4-6、图3.4-7 无图片素材，文字描述：一只手用筷子搜拌放在蓝色布上的易拉罐（罐内有冰块和盐）；易拉罐底部外壁结有一层白霜。本题含填空与简答，作答后对照参考答案自评计分。',
    parts:[
      { kind:'blank', q:'① 冰与盐混合物的温度______ 0 ℃（选填“高于”“等于”或“低于”）。', blanks:[
        { label:'混合物温度与0℃的关系', answer:['低于'], unit:'' }],
        analysis:'冰中加盐并搜拌后，冰的熔点降低，冰熔化吸热，使混合物温度降到 0℃ 以下。' },
      { kind:'open', q:'② 易拉罐外壁的白霜是怎样形成的？请说明其中涉及的物态变化。', ref:'参考答案：<br>① 冰中加盐后搜拌，冰熔化吸热，使罐内混合物和罐壁温度降到 0℃ 以下；<br>② 空气中的水蒸气遇到温度很低的罐壁，由气态直接变成固态的小冰晶，附着在罐的下部和底部，形成白霜；<br>③ 这种气态直接变成固态的过程是<b>凝华</b>。', analysis:'白霜不是水先液化再结冰，而是水蒸气遇很冷的罐壁直接凝华成固态小冰晶。关键链条：冰加盐降温低于0℃ → 水蒸气遇冷凝华 → 白霜。' }
    ] },

  { id:'c3s4q5', section:'第4节 升华和凝华', no:'教材 P80 练习与应用 第5题', points:10,
    stem:'生活中，有很多情况会造成水资源的浪费。比如，水龙头漏水，用水后水龙头未关紧，用水不节制等。你在生活中还发现哪些浪费水的现象？请你提出几条节约用水的建议。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（答出合理的浪费现象与节水建议各 2~3 条即可）：<br>浪费水的现象举例：① 刷牙、涂肥皂时水龙头一直开着；② 用自来水长流冲洗碗筷、蔬菜；③ 洗菜、洗衣的水用完直接倒掉；④ 水管、水箱漏水不及时修理。<br>节水建议：① 随手关紧水龙头，避免长流水；② 一水多用：淘米水洗菜、洗衣水冲厕；③ 采用节水器具（节水龙头、节水马桶），推广滴灌等节水灌溉技术；④ 定期检查维修水管、水箱，发现漏水及时报修。',
      analysis:'开放题无唯一答案，核心是能从生活实际发现浪费现象，并提出可行的节水措施；可直接利用的淡水资源仅占 0.3%，节约用水意义重大。' }] },

  { id:'c3s5q1', section:'第5节 跨学科实践', no:'新拟题（教材 P82~P83 煮饺子实例）', points:10,
    stem:'煮饺子时，水沸腾后妈妈把大火改成了小火，保持水微微沸腾继续煮。小明问：“火小了水不就不那么‘开’了吗，饺子会不会煮不熟？”请从物理学的角度解释：水沸腾后为什么应将大火改为小火？',
    note:'本题为简答开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 水沸腾后温度<b>保持在沸点不变</b>，大火并不能提高水温，因此不能使饺子更快煮熟；<br>② 水沸腾只需继续吸热即可维持，小火供热已足够让水保持沸腾；<br>③ 继续大火只会加快水的汽化，使水很快烧干，还浪费燃料（和水），所以水沸腾后应把大火改为小火。',
      analysis:'两个得分点：沸腾时温度保持沸点不变（大火升温无用）；大火只加快汽化浪费燃料。' }] },

  { id:'c3s5q2', section:'第5节 跨学科实践', no:'新拟题（教材 P83 水蒸气烫伤实例）', points:10,
    stem:'教材提醒：揭锅盖时要避开水蒸气，以免烫伤。同样温度的水蒸气和水，为什么被水蒸气烫伤往往比被开水烫伤更严重？',
    note:'本题为简答开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 水蒸气与开水温度相同时，接触皮肤后，水蒸气要先<b>液化</b>成同温度的热水；<br>② 液化过程要<b>放出大量的热</b>，这部分热量额外传递给皮肤；<br>③ 相同质量的水蒸气比同温度的水多放出液化放出的热量，所以烫伤更严重。',
      analysis:'关键在“液化放热”：水蒸气→同温度水多一步放热过程，额外热量叠加在同温水的热量之上。' }] },

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
    summary.innerHTML = `<div class="stem">🎉 本章练习全部完成！</div><div class="pp">9 / 9 题已作答，当前总得分 <b style="color:#ffd479">${total} 分</b>。继续加油！</div>`;
    root.appendChild(summary);
  } else if (summary) {
    summary.querySelector('b').textContent = total + ' 分';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initState();
  renderQuiz();
});

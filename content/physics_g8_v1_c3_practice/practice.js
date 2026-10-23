/* ===== 本章练习题库（第三章 物态变化） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 第3、4、5节题目完成后在数组末尾【追加位】直接追加新题对象即可，页面自动渲染。
 * 版权：全部题目为本站原创编写或情景化改写（质量线 W3，2026-10），题干、选项与解析独立成文。
 */
const QUESTIONS = [
  { id:'c3s1q1', section:'第1节 温度', no:'第1题', points:10,
    stem:'科技活动周里，小航用同样的材料做了两支“液柱温度计”：两个规格完全相同的玻璃瓶中装入等量的红色水，瓶口用橡皮塞密封，各插一根吸管——甲插的是一根粗吸管，乙插的是一根细吸管（见下图）。他把两支装置同时放进同一杯温水中。下列关于他看到的现象的说法，正确的是哪一项？',
    note:'配图为程序化简图。',
    fig:'twoBottles',
    parts:[{ kind:'choice',
      opts:['乙细吸管中的液柱升得更高——膨胀的体积相同时，管子越细液柱升高越多','甲粗吸管中的液柱升得更高——管子越粗装的液体越多，变化越明显','两支吸管中的液柱升得一样高——瓶子相同、水量相同，膨胀也相同'], answer:0,
      analysis:'两支装置的瓶子相同、水量相同，放进同一杯温水中升高相同的温度，瓶内水膨胀的体积也相同。同样多的膨胀体积被挤进吸管：粗吸管横截面大，液柱升得少；细吸管横截面小，同样体积对应的液柱高度大。所以乙的液柱升得更高，对温度变化也更灵敏。' }] },

  { id:'c3s1q2', section:'第1节 温度', no:'第2题', points:10,
    stem:'读出图中两支温度计的示数（单位均为摄氏度），分别填入下面的横栏。',
    note:'配图为程序化简图，供温度计读数训练使用。',
    fig:'thermPair1',
    parts:[{ kind:'blank', blanks:[
      { label:'甲温度计示数', answer:['26'], unit:'℃' },
      { label:'乙温度计示数', answer:['-4'], unit:'℃' }],
      analysis:'读数先认清分度值：两支温度计每小格都代表 2℃。甲的液柱面停在 0℃ 上方第 13 小格处，示数为 26℃，读作“26摄氏度”；乙的液柱面在 0℃ 下方第 2 小格处，示数为 -4℃，读作“负4摄氏度”或“零下4摄氏度”。读数时视线要与液柱面相平。' }] },

  { id:'c3s1q3', section:'第1节 温度', no:'第3题', points:10,
    stem:'小雨觉得身上发烫，拿出一支电子体温计（笔状机身、前端是金属测温探头、示数显示在液晶屏上）给自己测体温。她的操作是这样的：①开机后把探头夹在腋下，只等了十来秒、见液晶屏还有数字在跳动就急着记下了读数；②为了看得清楚，她把探头从腋下抽出来对着光看屏幕；③测完随手把体温计搁进抽屉，既没擦拭也没关机。请逐条指出小雨操作中不恰当的地方，并说明正确的做法。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 读数太早：金属探头要与腋下皮肤紧密接触，必须等到示数不再变化、完全稳定（多数电子体温计会发出“嘀”的提示音）后再记录，数字还在跳动时读到的会偏低；<br>② 抽出来看屏幕：应等示数稳定并锁定后再取出读数，取出过早探头离开人体、示数还会变化，测量就不准；关键是先保证探头与皮肤充分接触、待稳定；<br>③ 用完不处理：使用前后都应把探头擦拭干净并消毒，轻拿轻放，测完关机、妥善收好。',
      analysis:'把液体温度计的使用规则迁移到电子体温计上：感温部分（探头）与被测部位充分接触 → 待示数稳定后再读数 → 用毕清洁、消毒、收好。核心是“读数要等稳定”，其余都是围绕测得准、用得卫生的规范。' }] },

  { id:'c3s1q4', section:'第1节 温度', no:'第4题', points:10,
    stem:'小航学习了温度的测量后，打算自己规定一套温标：他把温度计插入冰水混合物中，在液柱到达的位置标上“100 度”；再插入标准大气压下的沸水中，在液柱到达的位置标上“200 度”；然后把两标记之间均匀分成 100 等份，每 1 份就是这种温标的 1 度。可见它的 1 度与摄氏温度的 1℃ 一样大，只是零度起点不同（这种温标的温度记作 T）。若摄氏温度为 t，则 T 与 t 满足的换算关系是：T = t + ______。',
    parts:[{ kind:'blank', blanks:[
      { label:'横线处应填', answer:['100'], unit:'' }],
      analysis:'冰水混合物为 0℃，标准大气压下沸水为 100℃。小航把这两个温度分别标成 100 度和 200 度，两者每度大小又相同，所以他的温标读数总比摄氏读数大 100，即 T = t + 100。验证：0℃ 对应 T = 100；100℃ 对应 T = 200；室温 25℃ 对应 T = 125。' }] },

  { id:'c3s2q1', section:'第2节 熔化和凝固', no:'第1题', points:12,
    stem:'小瑞小组在实验中对某种固态物质持续、均匀地加热，每隔一段时间记录一次温度，并把数据描点画成下图所示的温度—时间图像。请依据图像分析：这种物质属不属于晶体？它的熔点是多少？熔化过程一共经历了多长时间？',
    note:'配图为程序化绘制的熔化图像简图（含水平平台段）。',
    fig:'meltCurve',
    parts:[
      { kind:'choice', q:'① 这种物质是晶体吗？判断的依据是什么？',
        opts:['是晶体——图像中有一段水平平台，熔化时虽持续吸热温度却保持不变','不是晶体——加热过程中它的温度一直在不断升高','仅凭这一条熔化曲线还无法作出判断'], answer:0,
        analysis:'图像中段出现一段与时间轴平行的水平线（平台），说明该物质熔化时虽然持续吸热，温度却停在一个固定值不变，即有确定的熔化温度，这正是晶体的特征。' },
      { kind:'blank', q:'② 它的熔点是多少？', blanks:[
        { label:'熔点', answer:['60'], unit:'℃' }],
        analysis:'晶体熔化时保持不变的那个温度就是熔点。读图可知，水平平台段对应的温度为 60℃，所以熔点为 60℃。' },
      { kind:'blank', q:'③ 熔化过程一共经历了多长时间？', blanks:[
        { label:'熔化持续时间', answer:['4'], unit:'min' }],
        analysis:'平台起点在第 2 min（开始熔化），终点在第 6 min（完全熔化），熔化过程一共持续 6 min − 2 min = 4 min。' } ] },

  { id:'c3s2q2', section:'第2节 熔化和凝固', no:'第2题', points:12,
    stem:'下图是对同一种物质绘制的两幅图像：甲记录它持续吸热熔化时温度随时间的变化，乙记录它持续放热凝固时温度随时间的变化。请依据两幅图像回答：(1) 哪一幅是熔化图像、哪一幅是凝固图像？判断的依据是什么？(2) 这种物质的熔点和凝固点各是多少？二者有什么关系？(3) 两幅图像各自的水平平台段，物质在吸热还是放热？处于什么状态？',
    note:'配图为程序化简图（甲：熔化图像带平台；乙：凝固图像带平台，两平台温度相同）。本题为开放题，作答后对照参考要点自评计分。',
    fig:'meltFreeze',
    parts:[{ kind:'open',
      ref:'参考要点（答出主要几条即可得满分）：<br>(1) 甲是熔化图像——温度总体在升高（先升温、平台吸热熔化、再升温）；乙是凝固图像——温度总体在降低（先降温、平台放热凝固、再降温）；<br>(2) 甲、乙两图的平台都在 60℃，所以熔点为 60℃、凝固点也为 60℃——同一种晶体的凝固点与熔点相同；<br>(3) 甲的平台段持续吸热而温度不变、物质处于固液共存态；乙的平台段持续放热而温度不变、物质同样处于固液共存态；<br>补充：两图都有水平平台，说明这种物质是<b>晶体</b>。',
      analysis:'读熔化/凝固图像抓三点：一看温度总体升高还是降低——升高吸热为熔化、降低放热为凝固；二看平台对应的温度——熔点等于凝固点；三看平台段——吸热或放热而温度不变，处于固液共存。' }] },

  { id:'c3s2q3', section:'第2节 熔化和凝固', no:'第3题', points:10,
    stem:'图中给出了两支温度计（单位均为摄氏度）：甲是实验室温度计，乙是体温计。请分别写出它们的示数。',
    note:'配图为程序化简图。注意两支温度计的分度值并不相同。',
    fig:'thermPair2',
    parts:[{ kind:'blank', blanks:[
      { label:'甲温度计示数', answer:['39'], unit:'℃' },
      { label:'乙体温计示数', answer:['37.2','37.20'], unit:'℃' }],
      analysis:'甲的分度值是 1℃，液柱面正对 39 刻线，示数为 39℃；乙是体温计，分度值为 0.1℃，液柱面停在 37℃ 之后第 2 小格处，示数为 37.2℃。体温计的玻璃泡上方有一段很细的缩口，离开人体后液柱不会自行退回，所以可以拿下来从容读数。' }] },

  { id:'c3s2q4', section:'第2节 熔化和凝固', no:'第4题', points:8,
    stem:'请分别说明下面两种做法所依据的物理道理：(1) 夏季运送疫苗时，医务人员会在保温箱内放入冰袋，让疫苗全程处于低温；(2) 北方入冬前，菜农常在存放蔬菜的地窖里摆上几大桶水，防止窖内的菜被冻坏。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>(1) 冰袋在保温箱内会不断熔化，熔化要从箱内吸收热量，使箱内温度维持在较低水平，疫苗就不易变质——这是利用“熔化吸热”；<br>(2) 当窖内气温降到 0℃ 以下时，桶里的水会凝固结冰，凝固过程放出热量，减缓窖内温度的下降，蔬菜就不容易被冻坏——这是利用“凝固放热”。',
      analysis:'判断的关键：看物质发生的是熔化（固→液，吸热）还是凝固（液→固，放热），以及人们怎样利用这份吸热或放热。冰袋熔化吸热用来降温保鲜，水桶凝固放热用来保温防冻。' }] },

  { id:'c3s2q5', section:'第2节 熔化和凝固', no:'第5题', points:8,
    stem:'隆冬的一个夜里，气温降到了约 -6℃，村口池塘里的淡水一夜之间冻得结结实实。小晨在海边渔村却发现，同样低温下大盆里的海水丝毫没有结冰。针对这个现象，你能对“盐水的凝固温度”提出什么猜想？再根据你的猜想举出一个生活或生产中的应用实例。',
    note:'本题为开放题（给参考思路），作答后对照自评计分。',
    parts:[{ kind:'open',
      ref:'参考思路：<br><b>猜想</b>：海水里溶解了大量盐分，盐水的凝固点比淡水（纯水 0℃）更低——约 -6℃ 的寒夜里，淡水已到凝固点而冻实，却仍高于海水的凝固点，所以海水不结冰。（支撑：溶解了别的物质的水，凝固点会下降）<br><b>应用实例</b>：寒冬在结冰的路面上撒融雪盐（工业盐），让冰雪在 0℃ 以下也能熔化，方便交通；或给汽车水箱加注防冻液，把冷却液的凝固点降到环境温度以下，防止结冰胀裂水箱。<br>（其他合理的猜想与应用，只要自洽即可得分）',
      analysis:'本题指向“凝固点可以改变”的拓展认识：纯净物的凝固点是固定的，水中溶解了其他物质形成溶液后，凝固点会随之降低。海水不冻、融雪盐除冰、防冻液防冻，用的都是这个道理。' }] },

  { id:'c3s3q1', section:'第3节 汽化和液化', no:'第1题', points:8,
    stem:'寒冷的冬天，戴眼镜的小林从室外走进开着暖气的房间，镜片上立刻蒙了一层白雾，什么也看不清；过了一会儿，白雾又自己消失了，镜片重新变得透亮。从“镜片起雾”到“白雾消失”，水先后经历了哪些物态变化？',
    note:'本题为客观题，选择后即时判分。',
    parts:[{ kind:'choice',
      opts:['先发生汽化，后发生液化','先发生液化，后发生汽化','先发生凝固，后发生熔化','先发生熔化，后发生凝固'], answer:1,
      analysis:'刚从寒冷室外进屋时镜片温度很低，房间里温暖的水蒸气遇到冷镜片，液化成许多小水珠附着在镜面上，形成“白雾”；过一会儿镜片温度升高，小水珠又汽化成水蒸气散到空气中，“白雾”随之消失。所以先后发生的是液化和汽化。' }] },

  { id:'c3s3q2', section:'第3节 汽化和液化', no:'第2题', points:10,
    stem:'家里炖肉汤时，妈妈先用大火把汤烧至沸腾，随后调成小火，让汤面保持微微沸腾继续炖。小蕾担心地问：“火调小了，汤的温度会不会跟着降下来，把肉炖不熟？”汤沸腾后改用小火，汤的温度会降低吗？请用物理知识说明理由。',
    note:'本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>不会降低。<br>液体沸腾过程中，温度保持在沸点不变。改用小火后，只要汤还能持续从火焰吸热，就仍然维持沸腾状态，温度依旧等于沸点，不会下降。改小火只是降低了供热速率——够维持沸腾即可，还能节省燃气。',
      analysis:'沸腾的特点：达到沸点后继续吸热，但温度保持不变。大火、小火改变的只是单位时间供热的多少；只要供热量仍能满足汽化的需要，沸腾就持续进行，汤的温度始终停在沸点。' }] },

  { id:'c3s3q3', section:'第3节 汽化和液化', no:'第3题', points:10,
    stem:'盛夏酷暑，小玥的奶奶有个给饮用水降温的老办法：把水盛进瓦罐里，用一块浸透水的布把罐身整个包裹起来，再放到通风阴凉的地方。过一阵子，罐里的水就变得清凉可口。请分析这种降温方法所依据的物理道理。',
    note:'情景示意（文字描述）：瓦罐盛水，外壁裹着湿布，置于通风阴凉处，罐中水逐渐变凉。本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>① 湿布上的水不断蒸发，蒸发要从周围吸收热量——它带走了罐壁和罐中水的热量，使水温下降；<br>② 放在通风处，湿布表面的空气流动快，水蒸发得更快、吸热也更快，降温效果更好；<br>③ 选择阴凉处，避免阳光直射把罐子和水重新晒热，蒸发致冷的成果得以保持。于是罐中的水变得清凉。',
      analysis:'核心原理是蒸发致冷：液体蒸发时要从周围吸热。通风加快了湿布上水的蒸发、吸热更快；阴凉处又避免了日晒回热，两者配合，罐中水的温度就不断降低。' }] },

  { id:'c3s3q4', section:'第3节 汽化和液化', no:'第4题', points:10,
    stem:'闷热的三伏天，小杰发现厨房里那根输送凉水的金属水管外壁挂满了小水珠，日子久了，管子下方的地面竟积起一滩水。妈妈拿干抹布把管壁擦了一遍，可没过多久，水珠又冒了出来。金属水管外壁为什么会“出汗”？妈妈这样能把管壁彻底擦干吗？请用物理知识说明。',
    note:'本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>水管里输送的是凉水，管壁温度比周围空气低得多，空气中的水蒸气遇到冰凉的外壁，便液化成小水珠附着上去，这就是水管“出汗”的原因。<br>不能彻底擦干：擦掉已有的水珠后，管子周围的空气里仍有大量水蒸气，管壁又依旧冰凉，水蒸气会继续在管壁上液化，所以边擦边“出汗”。只有等管内水温升高、管壁温度接近室温，液化不再发生时，才能真正把管壁擦干。',
      analysis:'“出汗”的本质是空气中的水蒸气遇冷液化。液化的条件是水蒸气接触到温度明显更低的物体；只要管壁仍比室温低得多、空气又潮湿，液化就持续进行，擦干只是暂时的。' }] },

  { id:'c3s3q5', section:'第3节 汽化和液化', no:'第5题', points:12,
    stem:'干旱的西北地区水资源紧缺。为节约农业用水，农技人员推广了两项措施：一是把从前大水漫灌的浇地方式改成“滴灌”，让水通过管道一滴一滴地渗到作物根部；二是在作物行间裸露的地面上覆盖一层塑料地膜。实地测算表明，这两项措施能大大减少灌溉水的蒸发损失。请结合影响蒸发快慢的因素，分析它们为什么能节水。',
    note:'情景示意（文字描述）：滴灌把水少量、集中地送到作物根部，避免大面积漫灌；裸露地面则被塑料地膜覆盖。本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>蒸发的快慢由液体温度、液体表面积和液面上方空气流动速度共同决定。<br>① 滴灌让水只少量、集中地渗到根部，不像大水漫灌那样把水大面积摊开，暴露在空气中的水面积极小——表面积小，蒸发就慢，损失的水少；<br>② 覆盖地膜，一方面挡住了阳光对土壤水面的直接照射，使水温较低；另一方面把地表封住，阻隔了土壤水面上方的空气流动。温度低、空气流动慢，蒸发都随之减慢。<br>两项措施共同作用，使灌溉水的蒸发损失大大减小，因而节水。',
      analysis:'对照蒸发快慢的三个因素：滴灌减小了暴露的水面面积；覆膜既降低了土壤水的温度，又阻挡了空气流动。两方面都抑制了蒸发，所以能节水。' }] },

  { id:'c3s4q1', section:'第4节 升华和凝华', no:'第1题', points:10,
    stem:'做碘的升华实验时，小辰小组先用酒精灯火焰直接烧烤装有碘颗粒的密闭玻璃容器（俗称“碘锤”）底部，容器里很快出现紫色蒸气，可他们同时发现容器底部还积起了少量液态碘，实验现象并不“干净”。老师改用一个办法：把碘锤浸在热水里加热（热水温度不超过 100℃），结果容器里始终只有紫色碘蒸气，一点液态碘也没有。请对照下面的参考数据说明：① 直接用火焰烧烤，为什么会出现液态碘？② 改用热水加热，为什么就只发生升华、始终看不到液态碘？',
    note:'本题为简答题，作答后对照参考答案自评计分。参考数据：碘的熔点约为 113.7℃；酒精灯外焰温度可达 400~500℃。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>① 酒精灯外焰温度高达 400~500℃，远高于碘的熔点（约 113.7℃）。火焰直接烧烤时，容器底部受热处温度超过熔点，碘便先熔化成液态碘，液态碘再汽化成紫色蒸气，于是既有蒸气又有液体，升华现象不纯；<br>② 热水温度最高不超过 100℃，始终低于碘的熔点。用热水加热，碘的温度升不到熔点、不会熔化，只能不断吸热直接由固态升华为紫色的碘蒸气，所以看不到液态碘。',
      analysis:'关键看加热温度与碘熔点的关系：直接烧烤时局部温度超过熔点，碘先熔化再汽化；水浴加热的温度上限（不超过 100℃）低于熔点，碘达不到熔点便不熔化，只能直接升华。要让受热温度始终低于熔点，才能看到纯粹的升华。' }] },

  { id:'c3s4q2', section:'第4节 升华和凝华', no:'第2题', points:10,
    stem:'下面是两个生活观察：① 卫生间里放的一盒固体清香剂，过了几个星期明显“瘦”了一圈，盒子里却没有留下任何液体；② 用久了的白炽灯泡，钨丝比新灯泡时明显变细了（钨丝在高温下会直接变成钨蒸气）。请判断这两个现象各属于哪种物态变化，并说明你判断的共同依据。',
    note:'本题为简答题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'参考答案：<br>① 固体清香剂本来是固态，“瘦”下去是它直接由固态变成气态散发到空气中，盒中始终没有出现液体——这属于升华；<br>② 钨丝在高温下不经熔化、直接由固态变成钨蒸气跑掉，所以灯丝越来越细——这也属于升华。<br>共同依据：两者都是物质从固态直接变为气态、中间没有出现液态；只要“固态→气态”而没有经过液态，就是升华。',
      analysis:'判断升华的依据只有一条：物质是否“从固态直接变为气态”而没有经过液态。两个现象里都找不到液态的痕迹（清香剂没留下液体、钨丝不是熔化成液钨），因此都是升华。' }] },

  { id:'c3s4q3', section:'第4节 升华和凝华', no:'第3题', points:10,
    stem:'阅读材料：干冰是二氧化碳的固态形式，看上去像一块块白色的霜。它有个特别的性质——在常温下不会熔化成液体，而是直接变成气体，同时从周围吸收大量的热，使周围温度骤降。正因如此，物流公司给疫苗做冷链运输时，会用干冰代替普通冰袋来冷藏；舞台剧组则用干冰烟雾机向台面喷出白色的“仙境雾气”。',
    note:'本题为阅读分析题，作答后对照参考答案自评计分。',
    parts:[
      { kind:'blank', q:'① 干冰在常温下由固态直接变成气态，这种物态变化叫作______（填名称），此过程要______（选填“吸热”或“放热”）。', blanks:[
        { label:'物态变化名称', answer:['升华'], unit:'' },
        { label:'吸热或放热', answer:['吸热'], unit:'' }],
        analysis:'物质从固态直接变为气态属于升华；升华与熔化、汽化一样，都需要吸收热量。' },
      { kind:'open', q:'② 请结合材料说明：为什么用干冰冷藏能让运输箱内保持干燥、不留水渍？舞台上白色的“雾气”又是怎样形成的？', ref:'参考答案：<br>① 普通冰袋熔化时会流出一摊水，而干冰在常温下直接升华成二氧化碳气体，不经过熔化、不产生任何液体，所以运输箱内始终干燥、不留水渍；<br>② 干冰升华时吸收大量的热，使周围空气温度骤降，空气中的水蒸气遇冷液化成无数小水珠悬浮在空中，这就是舞台上看到的白色“雾气”。要注意：白“雾”并不是二氧化碳气体本身（二氧化碳气体无色透明），而是水蒸气液化成的小水珠。', analysis:'两项应用同一个道理：升华吸热。冷链保鲜利用“升华不产生液体”，制冷又不留水渍；舞台烟雾则利用“升华吸热降温→周围水蒸气遇冷液化成小水珠”。可见白色“雾气”是液化出的小水珠，并非二氧化碳。' }
    ] },

  { id:'c3s4q4', section:'第4节 升华和凝华', no:'第4题', points:12,
    stem:'小航在家做了一个小实验：往一只易拉罐里装入大半罐碎冰块，再撒入两勺食盐，用筷子搅拌大约半分钟。他把温度计插进罐里的冰盐混合物中，读数竟降到了 0℃ 以下。把罐子静置一会儿后再看，易拉罐外壁的下部和底部竟挂上了一层白霜。',
    note:'实验情景（文字描述）：易拉罐内装碎冰与食盐，搅拌后罐内温度低于 0℃，罐外壁下部与底部结出白霜。本题含填空与简答，作答后对照参考答案自评计分。',
    parts:[
      { kind:'blank', q:'① 冰与盐混合物的温度______ 0℃（选填“高于”“等于”或“低于”）。', blanks:[
        { label:'混合物温度与0℃的关系', answer:['低于'], unit:'' }],
        analysis:'冰里掺入盐并搅拌后，冰的熔点被降低，冰在低于 0℃ 时就开始熔化；熔化要吸热，于是混合物的温度被拉到 0℃ 以下。' },
      { kind:'open', q:'② 易拉罐外壁的白霜是怎样形成的？请说明其中涉及的物态变化。', ref:'参考答案：<br>① 冰中加盐搅拌后，冰熔化大量吸热，罐内混合物和罐壁的温度都降到 0℃ 以下；<br>② 空气中的水蒸气碰到温度极低的罐壁，不经液态、直接由气态变成固态的小冰晶，附着在罐的下部和底部，这就是白霜；<br>③ 气态直接变为固态的物态变化叫<b>凝华</b>。', analysis:'白霜并非“水先液化、再结冰”，而是水蒸气遇到远低于 0℃ 的罐壁直接凝华成的固态小冰晶。因果链：冰加盐熔化吸热降温 → 罐壁低于 0℃ → 水蒸气遇冷凝华 → 白霜。' }
    ] },

  { id:'c3s4q5', section:'第4节 升华和凝华', no:'第5题', points:10,
    stem:'学校水房有一个水龙头关不紧，一直在滴水。小曼测算发现：它平均每小时滴下的水约有 250 mL。请据此估算：这个水龙头一昼夜（按 24 小时计）大约要白白流掉多少升水？照这样一年（按 365 天计）下来又会浪费多少？针对这种现象，请你提出几条切实可行的节水建议。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（估算与建议各答出 2~3 条即可）：<br><b>估算</b>：一昼夜浪费 250 mL × 24 = 6000 mL = 6 L；一年浪费 6 L × 365 = 2190 L ≈ 2.2 m³，相当于好几吨水白白流掉。<br><b>节水建议</b>：① 发现水龙头、水管、水箱漏水及时报修，别让小水珠长流；② 用完随手把水龙头关紧，杜绝“长流水”；③ 一水多用——淘米水浇花、洗衣水冲厕所；④ 选用节水型龙头、马桶，农业上推广滴灌、喷灌。',
      analysis:'先用“每小时滴水量 × 时间”把浪费量算出来（6 L/天、约 2.2 m³/年），体会“滴水成河”；再从堵漏、关紧、一水多用、节水器具几方面提出可操作的建议。地球上可供人类直接利用的淡水只占约 0.3%，节约用水意义重大。' }] },

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
  return `<g>
    <line x1="${cx}" y1="${topY}" x2="${cx}" y2="${bottomY}" stroke="#9aa4b5" stroke-width="3" stroke-linecap="round"/>
    <line x1="${cx}" y1="${topY}" x2="${cx}" y2="${bottomY}" stroke="#0b0e13" stroke-width="1"/>
    <circle cx="${cx}" cy="${bottomY + bulbR - 2}" r="${bulbR}" fill="#ff7a6e" opacity=".9"/>
    ${ticks}${labels}${liquid}
    <text x="${cx}" y="${bottomY + 34}" fill="#d7dee9" font-size="12" text-anchor="middle" font-weight="700">${label}</text>
  </g>`;
}

function svgThermPair1() {
  return `<svg viewBox="0 0 520 240" role="img" aria-label="温度计读数简图">
    ${svgThermometer(120, '甲', 26, 2, -10, 40)}
    ${svgThermometer(380, '乙', -4, 2, -10, 40)}
  </svg>`;
}

function svgThermPair2() {
  return `<svg viewBox="0 0 520 240" role="img" aria-label="温度计读数简图">
    ${svgThermometer(120, '甲 实验室温度计', 39, 1, 35, 42)}
    ${svgThermometer(380, '乙 体温计', 37.2, 0.1, 35, 42)}
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
  const p0 = [xFor(0), yFor(20)], p1 = [xFor(2), yFor(60)], p2 = [xFor(6), yFor(60)], p3 = [xFor(10), yFor(85)];
  s += `<polyline points="${p0.join(',')} ${p1.join(',')} ${p2.join(',')} ${p3.join(',')}" fill="none" stroke="#ffd479" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  s += `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="#5ad7ff" stroke-width="1" stroke-dasharray="3 3"/>`;
  s += `<circle cx="${p1[0]}" cy="${p1[1]}" r="3" fill="#ffd479"/><circle cx="${p2[0]}" cy="${p2[1]}" r="3" fill="#ffd479"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="熔化曲线简图">${s}</svg>`;
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
  const ptsA = [[0, 20], [2, 60], [8, 60], [10, 85]].map(([t, T]) => `${xFor(t, off1 + padL)},${yFor(T)}`).join(' ');
  s += `<polyline points="${ptsA}" fill="none" stroke="#ffd479" stroke-width="2.5" stroke-linejoin="round"/>`;
  s += `<line x1="${xFor(2, off1 + padL)}" y1="${yFor(60)}" x2="${xFor(8, off1 + padL)}" y2="${yFor(60)}" stroke="#5ad7ff" stroke-width="1" stroke-dasharray="3 3"/>`;
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
  const ptsB = [[0, 85], [2, 60], [8, 60], [10, 20]].map(([t, T]) => `${xFor(t, off2 + padL)},${yFor(T)}`).join(' ');
  s += `<polyline points="${ptsB}" fill="none" stroke="#5ad7ff" stroke-width="2.5" stroke-linejoin="round"/>`;
  s += `<line x1="${xFor(2, off2 + padL)}" y1="${yFor(60)}" x2="${xFor(8, off2 + padL)}" y2="${yFor(60)}" stroke="#ffd479" stroke-width="1" stroke-dasharray="3 3"/>`;
  s += `<text x="${xFor(5, off2 + padL)}" y="${yFor(0) + 30}" fill="#d7dee9" font-size="12" text-anchor="middle" font-weight="700">乙 凝固图像</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="熔化与凝固双图">${s}</svg>`;
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

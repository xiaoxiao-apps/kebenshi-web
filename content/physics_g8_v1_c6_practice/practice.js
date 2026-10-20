/* ===== 本章练习题库（第六章 质量与密度） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 本单收录 17 题：第2节×7、第3节×5、第4节×5；第1节 5 题（P143 练习与应用）待核图定稿后串行续单补入，QUESTIONS 结构已预留。
 * 依据：c6章级页-设计书.md §2（题面/数字逐字，P148/P151/P156 练习与应用；
 *      第3、4节判分值=c6s34-textbook-analysis.md §4 权威值；第2节判分值为设计书推导值）。
 * 页码溯源只进本注释与数据行注释（P6 新规：用户可见字符串零「教材」「P1xx」字眼）。
 */
const QUESTIONS = [
  // —— 第2节 密度（P148 练习与应用，7 题；判分推导值见各题注释） ——
  { id:'c6s2q1', section:'第2节 密度', no:'练习与应用 第1题（图6.2-4）', points:12,
    stem:'某小组在探究某物质的质量与体积的关系时，得到了如下表所示的实验数据。请你根据实验数据在图6.2-4中作出图像。由图像你能得出什么结论？',
    note:'数据表见下表（六点逐字）；作图以印刷原书坐标为准（图6.2-4：纵轴 m/g 0-35、横轴 V/cm³ 0-70 坐标网格）。①作图对照参考要点自评，②结论填空即时判分。',
    fig:'s2q1Table', figCap:'表：某物质的体积与质量实验数据（六点）',
    parts:[
      { kind:'open', q:'① 作图：根据实验数据在图6.2-4中作出 m-V 图像。',
        ref:'参考要点：<br>① 以体积 V 为横轴、质量 m 为纵轴，把表中六个数据点（10, 4.9）（15, 7.4）（25, 12.6）（35, 17.4）（45, 22.6）（60, 30.1）逐一描在坐标网格上；<br>② 六个点大致分布在<b>一条过原点的直线</b>上，用直线把它们连起来（作 m-V 图像）。',
        analysis:'逐点比值 m/V=0.49/0.493/0.504/0.497/0.502/0.502 g/cm³ ≈ 恒定 0.5 g/cm³ → 图像为过原点的直线。' },
      { kind:'blank', q:'② 由图像你能得出什么结论？', blanks:[
        { label:'该物质的质量与体积成', answer:['正比','成正比','正比例','正比关系','正比例关系'], unit:'' }],
        analysis:'图像是过原点的直线 → <b>同种物质的质量与它的体积成正比</b>（呼应本节探究结论「铝块的质量与体积成正比」；比值≈0.5 g/cm³ 恒定）。' }
    ] },

  { id:'c6s2q2', section:'第2节 密度', no:'练习与应用 第2题', points:12,
    stem:'金属锇是迄今人们发现的地球上密度最大的金属。225.9 g 金属锇的体积为 10 cm³，它的密度是多少？中子星的密度可达 2×10¹⁸ kg/m³，中子星的密度约为金属锇的多少倍？',
    note:'两空均即时判分，等价写法（g/cm³ 与 ×10³ kg/m³ 双轨、≈号数值从宽）均认可。',
    parts:[
      { kind:'blank', q:'① 金属锇的密度是多少？', blanks:[
        { label:'锇的密度 ρ', answer:['22.59','22.59g/cm³','22.59g/cm3','22.59 g/cm³','22.59×10³kg/m³','22.59×10^3kg/m³','22.59x10^3kg/m3','22.59×10³ kg/m³','22590kg/m³','22590 kg/m³','2.259×10⁴kg/m³'], unit:'' }],
        analysis:'ρ=m/V=225.9 g/10 cm³=<b>22.59 g/cm³=22.59×10³ kg/m³</b>（1 g/cm³=1×10³ kg/m³）。' },
      { kind:'blank', q:'② 中子星的密度约为金属锇的多少倍？', blanks:[
        { label:'倍数约为', answer:['8.9×10¹³','8.85×10¹³','9×10¹³','8.9x10^13','8.85x10^13','9x10^13','8.9×10^13','9×10^13','8.85×10^13','约8.9×10¹³','约9×10¹³','≈8.9×10¹³','≈9×10¹³'], unit:'倍' }],
        analysis:'倍数=2×10¹⁸/(22.59×10³)≈<b>8.85×10¹³≈9×10¹³ 倍</b>（数量级判分：10¹³~10¹⁴ 区间且系数 8~9 均给分）。大数除法考数量级。' }
    ] },

  { id:'c6s2q3', section:'第2节 密度', no:'练习与应用 第3题', points:10,
    stem:'一个澡盆大致是长方体，其长、宽、高分别约为 1.2 m、0.5 m、0.3 m。它最多能装多少千克的水？',
    parts:[
      { kind:'blank', blanks:[
        { label:'最多能装水', answer:['180','180kg','180 kg','180千克'], unit:'kg' }],
        analysis:'V=1.2×0.5×0.3=<b>0.18 m³</b>；m=ρ水V=1.0×10³ kg/m³×0.18 m³=<b>180 kg</b>。「最多」=装满时水的体积等于澡盆容积（m=ρV 变形应用）。' }
    ] },

  { id:'c6s2q4', section:'第2节 密度', no:'练习与应用 第4题', points:10,
    stem:'猜一猜你们教室里空气的质量有多少。几克？几十克？还是几千克、几十千克？测出你们教室的长、宽、高，算一算里面空气的质量。你猜得对吗？',
    note:'本题为开放估算题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 查密度表得空气密度 ρ=<b>1.29 kg/m³</b>；<br>② 测出教室的长、宽、高（典型如约 9 m×7 m×3.5 m），V≈220 m³；<br>③ m=ρV≈1.29 kg/m³×220 m³≈<b>280 kg</b>——数量级是<b>几百千克</b>；<br>④ 对照自己猜的选项：通常人们会猜小（几千克/几十千克），实际是几百千克量级——猜小的原因是对「空气也有可观质量」缺乏直觉。尺寸取不同合理值（150~250 m³）算出 200~320 kg 均算对。',
      analysis:'数量级答案=几百千克（10²~10³ kg）；算式须用 ρ空气=1.29 kg/m³ 与自测教室体积（m=ρV）。' }] },

  { id:'c6s2q5', section:'第2节 密度', no:'练习与应用 第5题', points:10,
    stem:'人体的密度跟水的密度差不多，根据你的质量估算一下自己身体的体积。',
    note:'本题为开放估算题，答案随自身质量，作答后对照参考要点自评核对算式。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 取 ρ人≈ρ水=<b>1.0×10³ kg/m³</b>；<br>② 用 V=m/ρ——如质量 50 kg 的同学：V=50 kg/(1.0×10³ kg/m³)=<b>0.05 m³=50 dm³</b>（=50 L）；<br>③ 用自己的实际质量代入，算式正确、结果合理即可。',
      analysis:'方法=V=m/ρ、ρ 取 1.0×10³ kg/m³；数值随自身质量（答案开放，自评核对算式）。' }] },

  { id:'c6s2q6', section:'第2节 密度', no:'练习与应用 第6题', points:10,
    stem:'把一大块冰制成一个冰雕作品，冰块的密度会不会发生变化？说说你的理由。',
    note:'本题为开放说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① <b>不会变化</b>；<br>② 密度是物质本身的一种<b>性质（特性）</b>——同种物质（冰，同温同态）的质量与体积之比是一定的；<br>③ 冰雕只是改变了冰的<b>形状</b>，质量和体积同比例变化（物质种类、物态、温度都没变），比值 ρ=m/V 不变，仍为 0.9×10³ kg/m³。',
      analysis:'结论=不变；理由=密度是物质特性、不随形状/大小改变（呼应「同种物质的质量与体积之比是一定的」）。' }] },

  { id:'c6s2q7', section:'第2节 密度', no:'练习与应用 第7题', points:10,
    stem:'在学习了公式 ρ=m/V 后，某同学认为根据公式可以推出"物体的质量越大，密度越大；物体的体积越大，密度越小"的结论。你认为这种推论正确吗？说说你的理由。',
    note:'本题为开放辨析说理题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① <b>不正确</b>；<br>② ρ=m/V 是密度的<b>定义式/量度式</b>，不是决定式——密度由物质本身决定，与 m、V 无关；<br>③ 对同种物质，m 增大时 V 同比例增大，比值 ρ 不变（质量与体积成正比）；不能从数学形式上把比值关系误读为正反比依赖关系；<br>④ 不同物质间比较密度也不能只看 m 或 V 单一量。',
      analysis:'结论=不正确；核心论据=密度是物质特性、比值恒定（m 与 V 同增同减）。' }] },

  // —— 第3节 测量液体和固体的密度（P151 练习与应用，5 题；判分值=§4 权威值，核图定稿） ——
  { id:'c6s3q1', section:'第3节 测量液体和固体的密度', no:'练习与应用 第①题（图6.3-4）', points:12,
    stem:'使用量筒测量液体的体积，读数时会出现如图6.3-4所示的三种情况，其中正确的是哪一种？在测量体积约为80 mL的液体时，我们应当选择规格是"100 mL"的还是"500 mL"的量筒？为什么？',
    note:'图6.3-4 已核图定稿（甲=俯视/乙=视线与液面相平/丙=仰视），下图为程序化简图复现（原图细节以印刷原书为准）。两小问均单选即时判分，②的「为什么」说理见判分后解析。',
    fig:'readSight3', figCap:'图6.3-4 三种读数情况简图复现：甲=俯视，乙=视线与液面相平，丙=仰视',
    parts:[
      { kind:'choice', q:'① 读数时正确的是哪一种情况？',
        opts:['甲','乙','丙'], answer:1,
        analysis:'<b>乙正确</b>。量筒读数时<b>视线要与液面相平</b>；甲俯视会使读数偏大、丙仰视会使读数偏小。' },
      { kind:'choice', q:'② 测量体积约为 80 mL 的液体，应当选择哪种规格的量筒？',
        opts:['100 mL（分度值 1 mL）','500 mL（分度值 5 mL）'], answer:0,
        analysis:'选 <b>100 mL</b> 量筒。理由：待测液体约 80 mL，<b>接近 100 mL 量程且不超过</b>，分度值更小（1 mL）、读数误差更小；500 mL 量程过大、分度值 5 mL，误差大。' }
    ] },

  { id:'c6s3q2', section:'第3节 测量液体和固体的密度', no:'练习与应用 第②题', points:12,
    stem:'有一个容积为"2.5 L"的塑料瓶，用它装水，最多装多少千克？用它装植物油呢？取植物油的密度为0.9×10³ kg/m³。（1 L = 1 dm³）',
    note:'两空均即时判分（每空6分），等价写法（带不带单位）均认可。',
    parts:[
      { kind:'blank', q:'① 用它装水，最多装多少千克？', blanks:[
        { label:'最多装水', answer:['2.5','2.5kg','2.5 kg','2.5千克'], unit:'kg' }],
        analysis:'V=2.5 L=2.5 dm³=2.5×10⁻³ m³；m水=ρ水V=1.0×10³ kg/m³×2.5×10⁻³ m³=<b>2.5 kg</b>（ρ水=1.0×10³ kg/m³ 查密度表）。' },
      { kind:'blank', q:'② 用它装植物油，最多装多少千克？', blanks:[
        { label:'最多装植物油', answer:['2.25','2.25kg','2.25 kg','2.25千克'], unit:'kg' }],
        analysis:'m油=ρ油V=0.9×10³ kg/m³×2.5×10⁻³ m³=<b>2.25 kg</b>（m=ρV）。' }
    ] },

  { id:'c6s3q3', section:'第3节 测量液体和固体的密度', no:'练习与应用 第③题', points:12,
    stem:'有一个表面光滑、浑然一体的铜制工艺品，它的质量为89 g，体积为20 cm³。请你通过计算判断这个工艺品是不是中空的。',
    note:'①单选即时判分；②展示计算过程后对照参考要点自评计分。',
    parts:[
      { kind:'choice', q:'① 这个工艺品：',
        opts:['是中空的','是实心的'], answer:0,
        analysis:'ρ=m/V=89 g/20 cm³=<b>4.45 g/cm³</b> < ρ铜=8.9 g/cm³ → <b>中空</b>。' },
      { kind:'open', q:'② 写出你的计算判断过程。',
        ref:'参考要点（两种证法均认）：<br><b>证法一（比密度）</b>：ρ=m/V=89 g/20 cm³=<b>4.45 g/cm³</b>；4.45 g/cm³ < ρ铜=8.9 g/cm³ → 工艺品<b>是中空的</b>。<br><b>证法二（比体积）</b>：若为实心铜，89 g 对应体积 V=m/ρ=89 g/(8.9 g/cm³)=<b>10 cm³</b> < 20 cm³，多出的 10 cm³ 即空心部分 → <b>中空</b>。',
        analysis:'鉴别思路：算出工艺品密度与铜的密度比较（或算实心应有体积与实际体积比较）；4.45 g/cm³<8.9 g/cm³ → 中空。' }
    ] },

  { id:'c6s3q4', section:'第3节 测量液体和固体的密度', no:'练习与应用 第④题（图6.3-5）', points:12,
    stem:'为确定某种金属块的密度，首先用天平测量金属块的质量。当天平平衡时，放在右盘中的砝码和游码的位置如图6.3-5甲所示，则金属块的质量m是多少？然后用量筒测量金属块的体积。将水倒入量筒，液面达到的位置如图6.3-5乙所示，再把金属块完全浸没在量筒的水中，水面升高，如图6.3-5丙所示，则该金属块的体积V是多少？根据测量结果可知该金属块的密度是多少？',
    note:'图6.3-5 已核图定稿（甲：砝码 5 g、10 g、20 g+游码对齐 4 g；乙：25 mL；丙：30 mL），下图为程序化简图复现（原图细节以印刷原书为准）。三空均即时判分（每空4分）。',
    fig:'balanceCyl3', figCap:'图6.3-5 简图复现：甲=砝码 20 g、10 g、5 g+游码对齐标尺 4 g；乙=量筒液面 25 mL；丙=金属块完全浸没后液面升至 30 mL',
    parts:[
      { kind:'blank', q:'① 金属块的质量 m 是多少？', blanks:[
        { label:'质量 m', answer:['39','39g','39 g','39克'], unit:'g' }],
        analysis:'天平读数=盘中砝码总质量+游码对应质量：m=20 g+10 g+5 g+4 g=<b>39 g</b>。' },
      { kind:'blank', q:'② 金属块的体积 V 是多少？', blanks:[
        { label:'体积 V', answer:['5','5cm³','5cm3','5 cm³','5立方厘米','5毫升','5mL'], unit:'cm³' }],
        analysis:'排水法：V=V₂−V₁=30 mL−25 mL=5 mL=<b>5 cm³</b>。' },
      { kind:'blank', q:'③ 该金属块的密度是多少？', blanks:[
        { label:'密度 ρ', answer:['7.8','7.8g/cm³','7.8g/cm3','7.8 g/cm³','7.8克每立方厘米','7.8×10³kg/m³','7.8×10^3kg/m3','7800kg/m³'], unit:'g/cm³' }],
        analysis:'ρ=m/V=39 g/5 cm³=<b>7.8 g/cm³</b>（=7.8×10³ kg/m³，铁）。' }
    ] },

  { id:'c6s3q5', section:'第3节 测量液体和固体的密度', no:'练习与应用 第⑤题', points:10,
    stem:'某同学想测量盒装牛奶的密度。他把一盒牛奶放在天平上，测出总质量为270.0 g；把牛奶倒入量筒30 mL后，测得剩余部分的质量为238.5 g。这种盒装牛奶的密度是多少？',
    parts:[
      { kind:'blank', blanks:[
        { label:'牛奶的密度 ρ', answer:['1.05','1.05g/cm³','1.05g/cm3','1.05 g/cm³','1.05×10³kg/m³','1.05×10^3kg/m3','1050kg/m³','1.05克每立方厘米'], unit:'g/cm³' }],
        analysis:'差值法：倒出牛奶 m=270.0 g−238.5 g=<b>31.5 g</b>；V=30 mL=30 cm³；ρ=m/V=31.5 g/30 cm³=<b>1.05 g/cm³</b>（=1.05×10³ kg/m³，两种单位写法均认可）。' }
    ] },

  // —— 第4节 密度的应用（P156 练习与应用，5 题；判分值=§4 权威值） ——
  { id:'c6s4q1', section:'第4节 密度的应用', no:'练习与应用 第①题', points:10,
    stem:'建筑工地需用沙子400 m³，若用载质量为4 t的卡车运送，需运多少车？取沙子的密度为1.6×10³ kg/m³。',
    parts:[
      { kind:'blank', blanks:[
        { label:'需运', answer:['160','160车','160 车'], unit:'车' }],
        analysis:'m=ρV=1.6×10³ kg/m³×400 m³=6.4×10⁵ kg=<b>640 t</b>；n=640 t/(4 t)=<b>160 车</b>（m=ρV 公式变形一 + 除法取整）。' }
    ] },

  { id:'c6s4q2', section:'第4节 密度的应用', no:'练习与应用 第②题', points:10,
    stem:'一捆铜线的质量为89 kg，铜线的横截面积是25 mm²。这捆铜线的长度是多少？',
    parts:[
      { kind:'blank', blanks:[
        { label:'铜线的长度 L', answer:['400','400m','400 m','400米'], unit:'m' }],
        analysis:'ρ铜=8.9×10³ kg/m³（查密度表）；V=m/ρ=89 kg/(8.9×10³ kg/m³)=<b>1×10⁻² m³</b>；S=25 mm²=25×10⁻⁶ m²；L=V/S=<b>400 m</b>（V=m/ρ 公式变形二 + 柱体 V=SL 逆用；单位换算是判分关键步骤）。' }
    ] },

  { id:'c6s4q3', section:'第4节 密度的应用', no:'练习与应用 第③题', points:12,
    stem:'用天平和尺能不能得出一块长方形铝箔的厚度？如果能，写出你的办法。',
    note:'①单选即时判分；②办法对照参考要点自评计分。',
    parts:[
      { kind:'choice', q:'① 用天平和尺能不能得出一块长方形铝箔的厚度？',
        opts:['能','不能'], answer:0,
        analysis:'<b>能</b>——用天平间接求出体积，再用尺量出长宽算厚度。' },
      { kind:'open', q:'② 如果能，写出你的办法。',
        ref:'参考要点（四步齐全）：<br>① 用天平测出铝箔的<b>质量 m</b>；<br>② 查密度表得 <b>ρ铝</b>，算出体积 <b>V=m/ρ铝</b>；<br>③ 用尺测出铝箔的<b>长 a、宽 b</b>；<br>④ 厚度 <b>d=V/(a·b)</b>。',
        analysis:'V=m/ρ 间接求体积（金箔例题同款思路逆向）；自评核对「测m→算V→尺测a、b→d=V/(ab)」四步齐全。' }
    ] },

  { id:'c6s4q4', section:'第4节 密度的应用', no:'练习与应用 第④题', points:12,
    stem:'生活中铝箔的应用非常广泛。下表给出的是厨房中使用的某厚质铝箔的长度、宽度和厚度等相关信息。假设铝箔由纯铝制作，请你根据表中的数据，判断它的质量是否与标称的相同。',
    note:'信息表见下表（逐字）。①计算质量填空 + ②判断单选，均即时判分（每空6分）。',
    fig:'s4q4Table', figCap:'表：某厚质铝箔的相关信息',
    parts:[
      { kind:'blank', q:'① 根据表中数据计算铝箔的质量 m：', blanks:[
        { label:'计算质量 m', answer:['162','162g','162 g','162克','0.162','0.162kg','0.162千克'], unit:'g' }],
        analysis:'V=0.30 m×20 m×10×10⁻⁶ m=<b>6×10⁻⁵ m³</b>；m=ρ铝V=2.7×10³ kg/m³×6×10⁻⁵ m³=0.162 kg=<b>162 g</b>（宽度 300 mm=0.30 m、厚度 10 μm=10×10⁻⁶ m，单位换算是判分关键）。' },
      { kind:'choice', q:'② 它的质量是否与标称的相同？',
        opts:['相同','不相同'], answer:0,
        analysis:'计算质量 162 g 与标称 162 g <b>相同</b>（m=ρV 公式变形一）。' }
    ] },

  { id:'c6s4q5', section:'第4节 密度的应用', no:'练习与应用 第⑤题（图6.4-8）', points:10,
    stem:'我国唐代的"黄河铁牛"是世界桥梁史上的瑰宝，巨大的铁牛（图6.4-8）起到固定索桥的作用。若最大的一尊铁牛的质量为72 t，要用密度为1.35×10³ kg/m³的石膏制作一个体积是铁牛万分之一的模型，需用石膏的质量约为多少？假设铁牛的密度为7.9×10³ kg/m³。',
    note:'本题配图（图6.4-8 卧姿铁牛雕塑照片）不硬画，配图以印刷原书为准。填空即时判分，≈1.23 kg/1.2 kg 量级（两位有效数字从宽）均认可。',
    parts:[
      { kind:'blank', blanks:[
        { label:'需用石膏的质量约为', answer:['1.23','1.2','1.23kg','1.2kg','1.23 kg','1.2 kg','1.23千克','1.2千克','约1.23','约1.2'], unit:'kg' }],
        analysis:'V牛=m/ρ=7.2×10⁴ kg/(7.9×10³ kg/m³)≈<b>9.11 m³</b>；V模=V牛/10⁴≈9.11×10⁻⁴ m³；m石膏=ρ石膏V模=1.35×10³ kg/m³×9.11×10⁻⁴ m³≈<b>1.23 kg</b>（V=m/ρ + m=ρV 两变形连用；「万分之一」是体积比而非质量比，判分防错点）。' }
    ] },

]; // 闭合 QUESTIONS 数组（本单 17 题：第2节×7、第3节×5、第4节×5；第1节 5 题待核图后续单补入）

/* ===== 状态与持久化 ===== */
const STORAGE_KEY = 'c6_practice_state_v1';
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
  s2q1Table: htmlS2q1Table,
  readSight3: svgReadSight3,
  balanceCyl3: svgBalanceCyl3,
  s4q4Table: htmlS4q4Table
};

function panelBox(dx, dy, title, inner) {
  return `<g transform="translate(${dx},${dy})">`
    + `<rect x="4" y="4" width="222" height="152" fill="none" stroke="rgba(255,255,255,.08)" rx="8"/>`
    + `<text x="14" y="24" fill="#ffd479" font-size="14" font-weight="700">${title}</text>`
    + inner + `</g>`;
}

function htmlS2q1Table() {
  // c6s2q1 数据表（P148 题1，六点逐字）
  const no = ['1','2','3','4','5','6'];
  const v  = ['10','15','25','35','45','60'];
  const m  = ['4.9','7.4','12.6','17.4','22.6','30.1'];
  const row = (name, arr) => `<tr><th>${name}</th>${arr.map(x => `<td>${x}</td>`).join('')}</tr>`;
  return `<table class="dtab"><tbody>`
    + row('序号', no) + row('体积V/cm³', v) + row('质量m/g', m)
    + `</tbody></table>`;
}

function htmlS4q4Table() {
  // c6s4q4 信息表（P156 题4，逐字）
  return `<table class="dtab"><tbody>`
    + `<tr><th>品名</th><td>食品用 厚质铝箔</td></tr>`
    + `<tr><th>规格</th><td>30 cm × 20 m 质量162 g</td></tr>`
    + `<tr><th>使用原料</th><td>铝箔10 μm × 300 mm</td></tr>`
    + `</tbody></table>`;
}

/* 图6.3-4 量筒读数三视线（核图定稿：甲=俯视/乙=视线与液面相平/丙=仰视），确定性绘制 */
function sightPanel(menY, eyeY, tag) {
  let s = '';
  // 量筒筒身与刻度
  s += `<rect x="108" y="30" width="36" height="102" fill="none" stroke="#9aa4b5" stroke-width="1.5" rx="2"/>`;
  for (let i = 0; i <= 9; i++) {
    const y = 36 + i * 10;
    s += `<line x1="${i % 2 === 0 ? 132 : 137}" y1="${y}" x2="144" y2="${y}" stroke="#6b7686" stroke-width="1"/>`;
  }
  // 液体与液面
  s += `<rect x="109.5" y="${menY}" width="33" height="${132 - menY - 1.5}" fill="rgba(90,215,255,.22)"/>`;
  s += `<line x1="108" y1="${menY}" x2="144" y2="${menY}" stroke="#5ad7ff" stroke-width="2"/>`;
  s += `<text x="150" y="${menY + 4}" fill="#5ad7ff" font-size="10">液面</text>`;
  // 眼睛（圆+瞳孔）
  s += `<circle cx="52" cy="${eyeY}" r="9" fill="none" stroke="#ffd479" stroke-width="1.5"/>`;
  s += `<circle cx="55" cy="${eyeY}" r="3" fill="#ffd479"/>`;
  // 虚线视线：眼→液面处筒壁
  s += `<line x1="61" y1="${eyeY}" x2="108" y2="${menY}" stroke="#ffd479" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  s += `<text x="18" y="${eyeY - 14}" fill="#ffd479" font-size="10">眼睛</text>`;
  s += `<text x="66" y="${(eyeY + menY) / 2 - 6}" fill="#9aa4b5" font-size="10">${tag}</text>`;
  return s;
}
function svgReadSight3() {
  const s = panelBox(0, 0, '甲', sightPanel(76, 44, '俯视'))
    + panelBox(233, 0, '乙', sightPanel(76, 76, '相平'))
    + panelBox(466, 0, '丙', sightPanel(76, 108, '仰视'));
  return `<svg viewBox="0 0 700 170" role="img" aria-label="图6.3-4三种读数情况简图复现：甲俯视，乙视线与液面相平，丙仰视">${s}</svg>`;
}

/* 图6.3-5（核图定稿：甲=砝码20 g+10 g+5 g、游码对齐4 g；乙=量筒25 mL；丙=金属块浸没后30 mL），确定性绘制 */
function svgBalanceCyl3() {
  // 甲：砝码 + 游码标尺
  let pA = '';
  pA += `<rect x="18" y="40" width="46" height="34" fill="rgba(255,255,255,.08)" stroke="#9aa4b5" stroke-width="1.5" rx="3"/><text x="26" y="62" fill="#eef2f8" font-size="12">20 g</text>`;
  pA += `<rect x="72" y="48" width="38" height="26" fill="rgba(255,255,255,.08)" stroke="#9aa4b5" stroke-width="1.5" rx="3"/><text x="78" y="66" fill="#eef2f8" font-size="12">10 g</text>`;
  pA += `<rect x="118" y="54" width="30" height="20" fill="rgba(255,255,255,.08)" stroke="#9aa4b5" stroke-width="1.5" rx="3"/><text x="124" y="69" fill="#eef2f8" font-size="12">5 g</text>`;
  pA += `<text x="158" y="52" fill="#9aa4b5" font-size="10">砝码</text>`;
  // 游码标尺 0-5 g，游码对齐 4 g
  pA += `<line x1="20" y1="118" x2="206" y2="118" stroke="#9aa4b5" stroke-width="1.5"/>`;
  for (let i = 0; i <= 5; i++) {
    const x = 24 + i * 35;
    pA += `<line x1="${x}" y1="110" x2="${x}" y2="118" stroke="#9aa4b5" stroke-width="1.5"/>`;
    pA += `<text x="${x - 3}" y="132" fill="#9aa4b5" font-size="10">${i}</text>`;
  }
  pA += `<text x="208" y="132" fill="#9aa4b5" font-size="10">g</text>`;
  pA += `<rect x="${24 + 4 * 35 - 4}" y="102" width="8" height="14" fill="#ffd479" rx="2"/>`;
  pA += `<text x="120" y="98" fill="#ffd479" font-size="10">游码对齐 4 g</text>`;
  // 乙/丙：量筒（乙 25 mL；丙 金属块浸没后 30 mL）
  function cylPanel(menY, label, block) {
    let s = `<rect x="92" y="30" width="40" height="104" fill="none" stroke="#9aa4b5" stroke-width="1.5" rx="2"/>`;
    for (let i = 0; i <= 9; i++) {
      const y = 38 + i * 10;
      s += `<line x1="${i % 5 === 0 ? 118 : 123}" y1="${y}" x2="132" y2="${y}" stroke="#6b7686" stroke-width="1"/>`;
    }
    s += `<rect x="93.5" y="${menY}" width="37" height="${134 - menY - 1.5}" fill="rgba(90,215,255,.22)"/>`;
    if (block) s += `<rect x="100" y="106" width="26" height="24" fill="#8b96a8" stroke="#6b7686" rx="2"/><text x="103" y="122" fill="#0b0e13" font-size="9">金属块</text>`;
    s += `<line x1="92" y1="${menY}" x2="132" y2="${menY}" stroke="#5ad7ff" stroke-width="2"/>`;
    s += `<line x1="132" y1="${menY}" x2="152" y2="${menY}" stroke="#5ad7ff" stroke-width="1" stroke-dasharray="3 3"/>`;
    s += `<text x="154" y="${menY + 4}" fill="#5ad7ff" font-size="11">${label}</text>`;
    return s;
  }
  const pB = cylPanel(80, '25 mL', false);   // 乙：水面 25 mL
  const pC = cylPanel(60, '30 mL', true);    // 丙：浸没后水面升至 30 mL
  const s = panelBox(0, 0, '甲', pA) + panelBox(233, 0, '乙', pB) + panelBox(466, 0, '丙', pC);
  return `<svg viewBox="0 0 700 170" role="img" aria-label="图6.3-5简图复现：甲砝码20g、10g、5g加游码对齐4g，乙量筒液面25mL，丙金属块完全浸没后液面升至30mL">${s}</svg>`;
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
  const tbtn = $1('.ref-toggle', el);
  if (tbtn) tbtn.textContent = '收起参考答案';
  const key = el.dataset.key;
  if (key) STATE.open[key] = true;
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

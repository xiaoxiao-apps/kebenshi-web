/* c5b 题库（第五章 s3~s5 成像规律+眼睛眼镜+显微镜望远镜）· P2 原创生产 · 2026-10-24 */
var QBANK_C5B_ORIG = [

  { id:'c5s3b001', ch:5, sec:3,
    kp:['image-rule'], type:'choice', diff:1, freq:5, points:3,
    stem:'科技节展台上，社团把一块发光的 LED“F”字屏立在光具座一端，正对焦距为 10 cm 的凸透镜，屏到透镜的距离为 30 cm。移动另一侧的光屏，直到屏上出现清晰的像。光屏上“F”的样子是下图中的哪一种？',
    note:'图中透镜两侧已标出焦点 F 和两倍焦距点 2F 的位置。', fig:'ledFScreen',
    parts:[{ kind:'choice', q:'光屏上所成像的形状是？',
      opts:['正立、放大的“F”','倒立（上下颠倒）、放大的“F”','倒立（上下颠倒）、缩小的“F”','正立、缩小的“F”'], answer:2,
      analysis:'u=30 cm &gt; 2f=20 cm，凸透镜成<b>倒立、缩小的实像</b>，实像能被光屏承接。实像上下、左右都颠倒，相当于把“F”旋转 180°，即选项 C 的形状。' }],
    answer:null, analysis:null, src:'original',
    scene:'LED字屏光具座成像辨形状' },

  { id:'c5s3b002', ch:5, sec:3,
    kp:['image-rule'], type:'multi', diff:3, freq:5, points:4,
    stem:'光具座上依次立着 LED 字屏、焦距为 10 cm 的凸透镜和光屏。先把字屏放在距透镜 30 cm 处，移动光屏得到清晰的像；再把字屏移到 25 cm 处，重新移动光屏又得到清晰的像。下图标出了透镜和字屏的两个位置。关于这两次成像，下列说法正确的有哪些？',
    note:null, fig:'benchTwoPos',
    parts:[{ kind:'multi', q:'关于两次成像，正确的说法有哪些？（多选）',
      opts:['两次都能在光屏上承接到像','两次所成的像都是倒立的','第二次的像比第一次的像大','第二次成像时像到透镜的距离比第一次小'], answer:[0,1,2],
      analysis:'两次物距都大于 f（30 cm、25 cm 均大于 10 cm），都成实像，都能被光屏承接，实像都是<b>倒立</b>的，A、B 正确。物距从 30 cm 减到 25 cm，成实像时“物近像远像变大”，所以第二次的像更<b>大</b>、像距更<b>大</b>，C 正确、D 错误。' }],
    answer:null, analysis:null, src:'original',
    scene:'字屏两位置移动像大小比较' },

  { id:'c5s3b003', ch:5, sec:3,
    kp:['image-exp','image-rule'], type:'choice', diff:1, freq:5, points:3,
    stem:'实验小组在光具座上做凸透镜成像实验：焦距 10 cm 的凸透镜固定在 50 cm 刻度线处，点燃的蜡烛立在 25 cm 刻度线处，光屏移到合适位置后承接到烛焰清晰的像。这时一位同学用一块不透光的黑纸，把凸透镜的上半部分完全遮住。遮住后光屏上的像会怎样？',
    note:null, fig:'halfCovered',
    parts:[{ kind:'choice', q:'遮住透镜上半部分后，光屏上的像：',
      opts:['只剩下像的下半部分','只剩下像的上半部分','像仍然是完整的，但比原来暗一些','像立即消失，光屏上什么也看不到'], answer:2,
      analysis:'u=50−25=25 cm，在 f 与 2f 之间，成倒立放大的实像。物体上每一点发出的光经过透镜的<b>各个部分</b>都会会聚到对应的像点，遮住上半部分只是让透过透镜的光变少，下半部分仍然能把整个物体的光会聚成<b>完整的像</b>，只是像变<b>暗</b>。' }],
    answer:null, analysis:null, src:'original',
    scene:'黑纸遮住透镜上半部分观察像' },

  { id:'c5s3b004', ch:5, sec:3,
    kp:['lens-app'], type:'choice', diff:1, freq:4, points:3,
    stem:'小诚用一枚焦距为 8 cm 的放大镜观察邮票上的细小花纹，想看到一个正立、放大的像。关于邮票到放大镜的距离，下列做法正确的是哪一项？',
    note:null, fig:null,
    parts:[{ kind:'choice', q:'要想看到正立、放大的像，邮票应放在：',
      opts:['距放大镜大于 16 cm 处','距放大镜 8 cm 到 16 cm 之间','距放大镜小于 8 cm 处','放在哪都一样，像总是正立放大的'], answer:2,
      analysis:'放大镜成正立、放大的<b>虚像</b>，条件是物体位于凸透镜<b>一倍焦距以内</b>。焦距是 8 cm，所以邮票到放大镜的距离必须<b>小于 8 cm</b>，故 C 正确。' }],
    answer:null, analysis:null, src:'original',
    scene:'放大镜观察邮票物距选择' },

  { id:'c5s3b005', ch:5, sec:3,
    kp:['image-exp'], type:'blank', diff:1, freq:5, points:6,
    stem:'实验课上，老师让同学们把探究凸透镜成像规律的光源从点燃的蜡烛换成了发光的 LED 字屏（屏上是透光的“F”字）。换用之后，大家发现实验好做多了。请根据两种光源的特点填空。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'与点燃的蜡烛相比，LED 字屏做光源有哪些好处？', blanks:[
      { label:'① 蜡烛的火焰会被气流吹得晃动，像也跟着抖动；LED 字屏发光不晃动，成的像更', answer:['稳定','清晰','清楚'], unit:'' },
      { label:'② 点燃的蜡烛会越烧越短，像的位置慢慢上移；LED 字屏自身高度固定，像的位置也', answer:['不变','保持不动','不动'], unit:'' },
      { label:'③ 蜡烛燃烧有明火和烟，LED 字屏没有明火，使用更安全、更', answer:['环保','干净','清洁'], unit:'' }],
      analysis:'烛焰易受气流影响而晃动、燃烧中自身变短，都会让像抖动或移动，不便于观察比较；LED 字屏发光<b>稳定</b>、高度<b>不变</b>，成像位置固定、更易看清，而且无明火无烟，更安全<b>环保</b>。' }],
    answer:null, analysis:null, src:'original',
    scene:'光源改进LED字屏替代烛焰' },

  { id:'c5s4b006', ch:5, sec:4,
    kp:['eye-glass'], type:'blank', diff:1, freq:4, points:6,
    stem:'小杰原来坐在教室第三排，看黑板上的字很清楚；这学期调到最后一排后，他觉得黑板上的字发虚、看不清，可把书本凑到眼前看却毫无问题。医生检查后说他眼睛的折光系统出了问题。请根据眼睛成像的知识填空。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'小杰的眼睛出了什么问题？怎样矫正？', blanks:[
      { label:'① 眼球里的角膜和晶状体共同作用，相当于一个', answer:['凸透','凸'], unit:'透镜'},
      { label:'② 小杰看远处物体时，像成在了视网膜的', answer:['前方','前面'], unit:'' },
      { label:'③ 他患的是近视眼，应佩戴用哪种透镜做成的眼镜来矫正', answer:['凹透','凹'], unit:'透镜' }],
      analysis:'角膜和晶状体相当于<b>凸透镜</b>，视网膜相当于光屏。看近处书本清楚、看远处黑板模糊，是典型的<b>近视</b>：晶状体折光能力太强（或眼球前后径过长），远处物体的像成在视网膜<b>前方</b>。凹透镜对光有发散作用，佩戴<b>凹透镜</b>可使像后移，重新落回视网膜上。' }],
    answer:null, analysis:null, src:'original',
    scene:'近视同学换座位看黑板发虚' },

  { id:'c5s5b007', ch:5, sec:5,
    kp:['lens-app'], type:'blank', diff:1, freq:4, points:6,
    stem:'生物课上，同学们用显微镜观察洋葱表皮装片。显微镜镜筒的两端各有一组凸透镜：靠近标本的叫物镜，靠近眼睛的叫目镜。标本经物镜先成一次像，这个像再经目镜第二次成像，最终进入眼睛。请填空。',
    note:null, fig:null,
    parts:[{ kind:'blank', q:'显微镜两次成像各有什么特点？', blanks:[
      { label:'① 物镜焦距很短，标本放在物镜一倍焦距和二倍焦距之间，物镜成一个倒立、', answer:['放大'], unit:'的实像' },
      { label:'② 这个实像恰好落在目镜的焦点以内，目镜的作用相当于一个', answer:['放大镜'], unit:'' },
      { label:'③ 经过目镜再次放大后，眼睛最终看到的是正立、放大的', answer:['虚'], unit:'像（填“虚”或“实”）' }],
      analysis:'显微镜的物镜像投影仪一样，把标本成一个<b>倒立、放大的实像</b>；这个实像落在目镜焦点以内，目镜相当于<b>放大镜</b>，对它再放大一次，最终看到的是正立、放大的<b>虚像</b>。两次放大相乘，所以显微镜能把细胞放大几百倍。' }],
    answer:null, analysis:null, src:'original',
    scene:'显微镜观察洋葱表皮装片' },

  { id:'c5s3b008', ch:5, sec:3,
    kp:['image-exp'], type:'experiment', diff:1, freq:5, points:6,
    stem:'小铭在光具座上做凸透镜成像实验：凸透镜焦距为 10 cm，固定在 50 cm 刻度线处。他把点燃的蜡烛放在 45 cm 刻度线处，无论怎样左右移动光屏，屏上都找不到烛焰的像；他检查后发现烛焰中心、透镜中心和光屏中心都在同一高度。请分析回答。',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'① 光屏上找不到像的原因是：',
        opts:['此时蜡烛在焦点上，恰好不成像','此时蜡烛在一倍焦距以内，成的是虚像，虚像不能被光屏承接','蜡烛离透镜太近，光还没有到达光屏','光屏移动的范围不够大，再往远处移就能找到像'], answer:1,
        analysis:'蜡烛在 45 cm 处，物距 u=50−45=5 cm，小于焦距 10 cm。u&lt;f 时凸透镜成正立、放大的<b>虚像</b>，虚像不是实际光线会聚而成的，<b>不能被光屏承接</b>，所以无论怎样移动光屏都找不到像。' },
      { kind:'choice', q:'② 想看到烛焰正立、放大的像，撤去光屏后，眼睛应该：',
        opts:['位于蜡烛同侧，透过蜡烛观察','位于蜡烛异侧，透过透镜观察','位于透镜正上方，垂直向下观察','无论在哪一侧都看不到像'], answer:1,
        analysis:'u&lt;f 成的虚像不能用光屏承接，只能透过透镜用眼睛观察：眼睛应位于<b>蜡烛异侧</b>（原来放光屏的一侧），透过透镜就能看到正立、放大的虚像——这正是放大镜的用法。' },
      { kind:'choice', q:'③ 想在光屏上得到倒立、等大的实像，蜡烛应移到哪个刻度线处？',
        opts:['40 cm 处','35 cm 处','30 cm 处','25 cm 处'], answer:2,
        analysis:'倒立、等大的实像要求 u=2f=20 cm。透镜在 50 cm 刻度线处，蜡烛应放在 50−20=<b>30 cm</b> 刻度线处。' }],
    answer:null, analysis:null, src:'original',
    scene:'光屏找不到像的排因探究' },

  { id:'c5s3b009', ch:5, sec:3,
    kp:['image-exp','image-rule'], type:'experiment', diff:2, freq:5, points:8,
    stem:'小组用焦距为 10 cm 的凸透镜做成像实验，把每次的物距 u、像距 v 和像的特点记录在下表中。第三次实验时像距一栏被墨水弄脏了，只留下一个“？”。请依据表中数据回答。',
    note:'配图为程序化绘制的数据记录表。', fig:'imgDataTable',
    parts:[
      { kind:'choice', q:'① 第一次实验（u=30 cm）所成像的特点是：',
        opts:['倒立、缩小的实像','倒立、放大的实像','正立、放大的虚像','倒立、等大的实像'], answer:0,
        analysis:'u=30 cm &gt; 2f=20 cm，成<b>倒立、缩小的实像</b>，此时像距 f&lt;v&lt;2f，与表中 v=15 cm 相符。' },
      { kind:'blank', q:'② 补全数据：', blanks:[
        { label:'第三次实验（u=15 cm）被弄脏的像距 v 应为', answer:['30','30cm'], unit:'cm' }],
        analysis:'第一次实验 u=30 cm 时 v=15 cm。光路是可逆的，把物、像位置对调后成像依然成立：u=15 cm 时 v=<b>30 cm</b>。' },
      { kind:'blank', q:'③ 归纳规律：', blanks:[
        { label:'对比四次数据可得：凸透镜成实像时，物距逐渐减小，像距逐渐增大，像逐渐变', answer:['大'], unit:'' }],
        analysis:'对比第一、二、四次数据：物距从 30 cm 减到 13 cm，像距从 15 cm 增到 43 cm，像由缩小变等大再变放大——成实像时“物近像远像变<b>大</b>”。' },
      { kind:'choice', q:'④ 第五次实验把蜡烛放在 u=8 cm 处，此时移动光屏找不到像，原因是：',
        opts:['蜡烛离透镜太近，光太弱','物距小于焦距，成的是虚像，虚像不能被光屏承接','物距恰好等于焦距，不成像','光屏放错了位置，应放在透镜同侧'], answer:1,
        analysis:'u=8 cm &lt; f=10 cm，凸透镜成正立、放大的<b>虚像</b>。虚像不是实际光线会聚而成，光屏放在任何位置都无法承接，只能透过透镜用眼睛观察。' }],
    answer:null, analysis:null, src:'original',
    scene:'物距像距数据表补全归纳' },

  { id:'c5s4b010', ch:5, sec:4,
    kp:['eye-glass'], type:'experiment', diff:1, freq:4, points:6,
    stem:'兴趣小组用注水气球皮做成一个“水透镜”（注水越多，水透镜越凸、折光能力越强），配合蜡烛和光屏在光具座上模拟眼睛：水透镜相当于晶状体，光屏相当于视网膜。调好后，光屏上呈现出烛焰清晰的像。接着小组向水透镜里再注入一些水，光屏上的像立刻变得模糊了。请分析回答。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 注水后像的位置变化：', blanks:[
        { label:'要把光屏向靠近水透镜的方向移动才能重新得到清晰的像，说明注水后像成在了原来光屏位置的', answer:['前方','前面'], unit:'' }],
        analysis:'注水后水透镜更凸、折光能力更强、焦距变短，光线会聚得更早，像成在原光屏位置的<b>前方</b>——这正是近视眼看远处物体时的情形。' },
      { kind:'choice', q:'② 这个装置注水后模拟的是哪种视力缺陷？',
        opts:['近视眼','远视眼','正常眼','无法模拟视力缺陷'], answer:0,
        analysis:'晶状体变厚、折光能力过强，远处物体的像成在视网膜前方，是<b>近视眼</b>的成因。' },
      { kind:'choice', q:'③ 保持光屏不动，想让它重新承接到清晰的像，应在水透镜前加装：',
        opts:['一块凸透镜，使光先会聚一些','一块凹透镜，使光先发散一些','一块平板玻璃，挡住部分光','什么也不用加，等待片刻像自然清晰'], answer:1,
        analysis:'像成在光屏前方，需要让光线<b>推迟会聚</b>。凹透镜对光有发散作用，加在水透镜前可使光先适当发散，经水透镜后会聚点后移，恰好重新落在光屏上——这就是近视眼镜的矫正原理。' }],
    answer:null, analysis:null, src:'original',
    scene:'水透镜注水模拟近视矫正' },

  { id:'c5s5b011', ch:5, sec:5,
    kp:['lens-app'], type:'experiment', diff:1, freq:4, points:6,
    stem:'学校科技社发下望远镜制作套件：纸筒两个、焦距分别为 30 cm 和 5 cm 的凸透镜各一块。说明书提示：焦距长的一块做物镜，对着远处景物；焦距短的一块做目镜，贴近眼睛。小宇按提示装好后，透过目镜看向窗外的教学楼。请回答。',
    note:null, fig:null,
    parts:[
      { kind:'choice', q:'① 物镜（焦距 30 cm 的凸透镜）对远处教学楼所成像的特点是：',
        opts:['倒立、缩小的实像','倒立、放大的实像','正立、放大的虚像','正立、等大的实像'], answer:0,
        analysis:'远处景物到物镜的距离远大于二倍焦距，物镜相当于照相机镜头，成<b>倒立、缩小的实像</b>，这个实像落在目镜的焦点以内。' },
      { kind:'blank', q:'② 目镜的作用：', blanks:[
        { label:'物镜所成的实像落在目镜焦点以内，目镜相当于一个', answer:['放大镜'], unit:'' }],
        analysis:'目镜焦距只有 5 cm，物镜成的实像恰落在它的<b>焦点以内</b>，目镜就相当于一个<b>放大镜</b>，把这个实像再次放大成虚像供眼睛观察。' },
      { kind:'choice', q:'③ 小宇透过目镜看到的教学楼的像是：',
        opts:['正立的，比直接看时大','倒立的，视角比直接看时大','正立的，和直接看时一样大','倒立的，比直接看时小'], answer:1,
        analysis:'物镜成倒立的实像，目镜对这个实像成正立放大的虚像，“正立”是相对实像而言，所以最终看到的像相对教学楼本身是<b>倒立</b>的；望远镜的作用是增大<b>视角</b>，让远处的景物看起来更大更清楚。' }],
    answer:null, analysis:null, src:'original',
    scene:'套件组装望远镜看教学楼' },

  { id:'c5s3b012', ch:5, sec:3,
    kp:['real-virtual','lens-identify'], type:'experiment', diff:1, freq:3, points:6,
    stem:'校园科技开放日上，九（2）班设了一个“找像小站”：桌上摆着小孔成像盒、平面镜、凸透镜等器材，参观者要完成三个闯关任务。请帮他们回答。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 第一关——分清真虚：', blanks:[
        { label:'实像与虚像的一个重要区别：实像能用', answer:['光屏','屏','白纸屏'], unit:'承接，虚像不能' }],
        analysis:'实像是实际光线会聚而成的，可以用<b>光屏</b>承接；虚像不是实际光线会聚而成，只能用眼睛观察，光屏上承接不到。' },
      { kind:'choice', q:'② 第二关——挑出实像：下列现象中成的是实像的是：',
        opts:['小孔成像盒的半透明纸上出现的倒立像','平面镜里看到的自己的像','放大镜贴近字帖看到的放大的字','水中的月亮'], answer:0,
        analysis:'小孔成像是实际光线通过小孔后在半透明纸上会聚成的<b>倒立实像</b>，能被屏承接；平面镜的像、放大镜看到的字、水中的月亮都是<b>虚像</b>，光屏承接不到。' },
      { kind:'choice', q:'③ 第三关——辨透镜：桌上有两块没贴标签的透镜，透过其中一块看近处的字，发现字被放大了；透过另一块看，字反而缩小了。下列判断正确的是：',
        opts:['看到字放大的是凸透镜，看到字缩小的是凹透镜','看到字放大的是凹透镜，看到字缩小的是凸透镜','两块都是凸透镜，只是焦距不同','两块都是凹透镜，只是厚度不同'], answer:0,
        analysis:'隔着透镜看近处（一倍焦距以内）的字：凸透镜成正立、放大的<b>虚像</b>；凹透镜对光发散，只能成正立、缩小的<b>虚像</b>。所以放大的是<b>凸透镜</b>，缩小的是<b>凹透镜</b>。' }],
    answer:null, analysis:null, src:'original',
    scene:'科技开放日找像小站闯关' },

  { id:'c5s4b013', ch:5, sec:4,
    kp:['eye-glass'], type:'calc', diff:2, freq:4, points:6,
    stem:'眼镜的“度数”与镜片焦距之间有这样的关系：度数 = 100 ÷ 焦距（焦距以米为单位）。凸透镜的度数用正数表示，凹透镜的度数用负数表示。小林新配的眼镜镜片上标着“−200 度”。请计算并回答。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 镜片的焦距：', blanks:[
        { label:'这片镜片的焦距是', answer:['0.5','0.5m'], unit:'m' }],
        analysis:'由 度数 = 100 ÷ f（f 以米为单位）得 f = 100 ÷ 200 = <b>0.5 m</b>。度数取绝对值参与计算，正负号只表示透镜种类。' },
      { kind:'choice', q:'② 由度数的正负可以判断，这块镜片是：',
        opts:['凹透镜，矫正近视眼','凸透镜，矫正远视眼','凹透镜，矫正远视眼','凸透镜，矫正近视眼'], answer:0,
        analysis:'−200 度中的负号表示<b>凹透镜</b>，凹透镜对光有发散作用，用于矫正<b>近视眼</b>。' },
      { kind:'blank', q:'③ 复查时医生说小林近视加深了，需要换配“−400 度”的镜片：', blanks:[
        { label:'新镜片的焦距是', answer:['0.25','0.25m'], unit:'m' }],
        analysis:'f = 100 ÷ 400 = <b>0.25 m</b>。度数加深，焦距变短，镜片的发散能力更强。' }],
    answer:null, analysis:null, src:'original',
    scene:'眼镜度数与焦距换算' },

  { id:'c5s3b014', ch:5, sec:3,
    kp:['image-rule','image-exp'], type:'calc', diff:2, freq:5, points:6,
    stem:'光具座的刻度从最左端 0 cm 开始向右增大。小越把焦距为 10 cm 的凸透镜固定在 50 cm 刻度线处，把高 2 cm 的 LED 字屏立在 35 cm 刻度线处，再移动光屏，当光屏位于 80 cm 刻度线处时，屏上恰好呈现清晰的像。已知凸透镜成实像时满足：像高 ÷ 物高 = 像距 ÷ 物距。请计算。',
    note:null, fig:null,
    parts:[
      { kind:'blank', q:'① 物距：', blanks:[
        { label:'此时物距 u 为', answer:['15','15cm'], unit:'cm' }],
        analysis:'物距是物体到透镜的距离：u = 50 − 35 = <b>15 cm</b>。' },
      { kind:'blank', q:'② 像距：', blanks:[
        { label:'此时像距 v 为', answer:['30','30cm'], unit:'cm' }],
        analysis:'像距是光屏（像）到透镜的距离：v = 80 − 50 = <b>30 cm</b>。f&lt;u&lt;2f 时像距 v&gt;2f，30 cm &gt; 20 cm，与成像规律相符。' },
      { kind:'blank', q:'③ 像的高度：', blanks:[
        { label:'光屏上所成像的高度是', answer:['4','4cm'], unit:'cm' }],
        analysis:'由 像高÷物高 = 像距÷物距 得：像高 = 物高 × (v÷u) = 2 cm × (30÷15) = 2 × 2 = <b>4 cm</b>，是倒立、放大的实像。' }],
    answer:null, analysis:null, src:'original',
    scene:'光具座刻度算物距像距像高' },
];

var QBANK_C5B_ORIG_FIGS = {

  ledFScreen: function() {
    let s = '';
    s += `<line x1="20" y1="140" x2="460" y2="140" stroke="#6b7686" stroke-width="2"/>`;
    for (let x = 30; x <= 450; x += 20) s += `<line x1="${x}" y1="140" x2="${x}" y2="145" stroke="#6b7686" stroke-width="1"/>`;
    s += `<rect x="52" y="70" width="16" height="52" fill="#2c3a52" stroke="#8fa3c0"/>`;
    s += `<rect x="56" y="122" width="8" height="18" fill="#5b6b84"/>`;
    s += `<text x="60" y="62" fill="#ffd479" font-size="20" font-weight="700" text-anchor="middle">F</text>`;
    s += `<text x="60" y="162" fill="#9aa4b5" font-size="11" text-anchor="middle">LED 字屏</text>`;
    s += `<ellipse cx="240" cy="96" rx="10" ry="46" fill="rgba(140,190,255,.22)" stroke="#8fc4ff" stroke-width="2"/>`;
    s += `<path d="M234 54 L240 46 L246 54 M234 138 L240 146 L246 138" stroke="#8fc4ff" stroke-width="2" fill="none"/>`;
    s += `<text x="240" y="162" fill="#9aa4b5" font-size="11" text-anchor="middle">凸透镜 O</text>`;
    s += `<rect x="398" y="60" width="8" height="80" fill="#e8edf5" stroke="#8fa3c0"/>`;
    s += `<rect x="398" y="140" width="8" height="0" fill="none"/>`;
    s += `<line x1="402" y1="140" x2="402" y2="150" stroke="#5b6b84" stroke-width="3"/>`;
    s += `<text x="402" y="162" fill="#9aa4b5" font-size="11" text-anchor="middle">光屏</text>`;
    const marks = [[190,'F'],[140,'2F'],[290,'F'],[340,'2F']];
    marks.forEach(m => {
      s += `<line x1="${m[0]}" y1="134" x2="${m[0]}" y2="146" stroke="#ffd479" stroke-width="1.5"/>`;
      s += `<text x="${m[0]}" y="130" fill="#ffd479" font-size="10" text-anchor="middle">${m[1]}</text>`;
    });
    s += `<line x1="70" y1="30" x2="230" y2="30" stroke="#9aa4b5" stroke-width="1" marker-start="url(#a1)" marker-end="url(#a1)"/>`;
    s += `<text x="150" y="24" fill="#d7dee9" font-size="11" text-anchor="middle">物距 30 cm</text>`;
    s += `<text x="440" y="40" fill="#9aa4b5" font-size="11" text-anchor="end">f = 10 cm</text>`;
    s = `<defs><marker id="a1" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M1 1 L7 4 L1 7" fill="none" stroke="#9aa4b5"/></marker></defs>` + s;
    return `<svg viewBox="0 0 480 175" role="img" aria-label="光具座上LED字屏、凸透镜与光屏的位置示意图">${s}</svg>`;
  },

  benchTwoPos: function() {
    const L = 260, px = 3.4;
    let s = '';
    s += `<line x1="20" y1="130" x2="460" y2="130" stroke="#6b7686" stroke-width="2"/>`;
    s += `<ellipse cx="${L}" cy="88" rx="9" ry="42" fill="rgba(140,190,255,.22)" stroke="#8fc4ff" stroke-width="2"/>`;
    s += `<text x="${L}" y="150" fill="#9aa4b5" font-size="11" text-anchor="middle">凸透镜 O</text>`;
    [[10,'F'],[20,'2F']].forEach(m => {
      const xl = L - m[0]*px, xr = L + m[0]*px;
      s += `<line x1="${xl}" y1="125" x2="${xl}" y2="135" stroke="#ffd479"/>`;
      s += `<text x="${xl}" y="121" fill="#ffd479" font-size="10" text-anchor="middle">${m[1]}</text>`;
      s += `<line x1="${xr}" y1="125" x2="${xr}" y2="135" stroke="#ffd479"/>`;
      s += `<text x="${xr}" y="121" fill="#ffd479" font-size="10" text-anchor="middle">${m[1]}</text>`;
    });
    const p1 = L - 30*px, p2 = L - 25*px;
    s += `<rect x="${p1-7}" y="42" width="14" height="44" fill="#2c3a52" stroke="#8fa3c0"/>`;
    s += `<text x="${p1}" y="34" fill="#ffd479" font-size="15" font-weight="700" text-anchor="middle">F</text>`;
    s += `<line x1="${p1}" y1="86" x2="${p1}" y2="130" stroke="#8fc4ff" stroke-dasharray="3 3"/>`;
    s += `<text x="${p1-16}" y="104" fill="#8fc4ff" font-size="11" text-anchor="middle">位置①</text>`;
    s += `<rect x="${p2-6}" y="94" width="12" height="36" fill="#2c3a52" stroke="#8fa3c0" opacity=".85"/>`;
    s += `<line x1="${p2}" y1="94" x2="${p2}" y2="130" stroke="#ffb08f" stroke-dasharray="3 3"/>`;
    s += `<text x="${p2+22}" y="104" fill="#ffb08f" font-size="11" text-anchor="middle">位置②</text>`;
    s += `<text x="${p1}" y="168" fill="#d7dee9" font-size="11" text-anchor="middle">距透镜 30 cm</text>`;
    s += `<text x="${p2+8}" y="152" fill="#d7dee9" font-size="11" text-anchor="middle">距透镜 25 cm</text>`;
    s += `<rect x="380" y="52" width="8" height="78" fill="#e8edf5" stroke="#8fa3c0"/>`;
    s += `<text x="384" y="150" fill="#9aa4b5" font-size="11" text-anchor="middle">光屏</text>`;
    s += `<text x="440" y="30" fill="#9aa4b5" font-size="11" text-anchor="end">f = 10 cm</text>`;
    return `<svg viewBox="0 0 480 178" role="img" aria-label="LED字屏先后位于距透镜30厘米和25厘米处的光具座示意图">${s}</svg>`;
  },

  halfCovered: function() {
    let s = '';
    s += `<line x1="20" y1="140" x2="460" y2="140" stroke="#6b7686" stroke-width="2"/>`;
    s += `<line x1="96" y1="100" x2="96" y2="140" stroke="#e8edf5" stroke-width="4"/>`;
    s += `<path d="M96 100 C86 90 90 78 96 72 C102 78 106 90 96 100 Z" fill="#ffb454"/>`;
    s += `<path d="M96 96 C91 90 93 83 96 79 C99 83 101 90 96 96 Z" fill="#ffe08a"/>`;
    s += `<text x="96" y="160" fill="#9aa4b5" font-size="11" text-anchor="middle">蜡烛</text>`;
    s += `<ellipse cx="240" cy="96" rx="10" ry="46" fill="rgba(140,190,255,.22)" stroke="#8fc4ff" stroke-width="2"/>`;
    s += `<path d="M230 96 A10 46 0 0 1 250 96 L250 50 A10 46 0 0 0 230 50 Z" fill="#3a4356"/>`;
    s += `<rect x="229" y="50" width="22" height="47" fill="#3a4356" stroke="#5b6b84"/>`;
    s += `<line x1="231" y1="56" x2="249" y2="50" stroke="#6b7686" stroke-width=".8"/>`;
    s += `<line x1="231" y1="66" x2="249" y2="60" stroke="#6b7686" stroke-width=".8"/>`;
    s += `<line x1="231" y1="76" x2="249" y2="70" stroke="#6b7686" stroke-width=".8"/>`;
    s += `<line x1="231" y1="86" x2="249" y2="80" stroke="#6b7686" stroke-width=".8"/>`;
    s += `<text x="240" y="160" fill="#9aa4b5" font-size="11" text-anchor="middle">凸透镜（上半部被黑纸遮住）</text>`;
    s += `<rect x="382" y="56" width="8" height="84" fill="#e8edf5" stroke="#8fa3c0"/>`;
    s += `<text x="386" y="160" fill="#9aa4b5" font-size="11" text-anchor="middle">光屏</text>`;
    return `<svg viewBox="0 0 480 175" role="img" aria-label="蜡烛、上半部被黑纸遮住的凸透镜与光屏的示意图">${s}</svg>`;
  },

  imgDataTable: function() {
    const rows = [
      ['1','30','15','倒立、缩小的实像'],
      ['2','20','20','倒立、等大的实像'],
      ['3','15','?','倒立、放大的实像'],
      ['4','13','43','倒立、放大的实像']
    ];
    const cols = [70,110,110,170];
    const padL = 10, padT = 34, rh = 26;
    const W = cols.reduce((a,b)=>a+b,0);
    let s = `<rect x="${padL}" y="${padT}" width="${W}" height="${rh*(rows.length+1)}" fill="none" stroke="#6b7686" stroke-width="1.5"/>`;
    let cx = padL;
    cols.forEach((w,i) => {
      if (i>0) s += `<line x1="${cx}" y1="${padT}" x2="${cx}" y2="${padT+rh*(rows.length+1)}" stroke="#6b7686" stroke-width="1"/>`;
      cx += w;
    });
    for (let r=1; r<=rows.length; r++) s += `<line x1="${padL}" y1="${padT+r*rh}" x2="${padL+W}" y2="${padT+r*rh}" stroke="#6b7686" stroke-width="1"/>`;
    const heads = ['实验次数','物距 u/cm','像距 v/cm','像的特点'];
    cx = padL;
    heads.forEach((h,i) => {
      s += `<text x="${cx+cols[i]/2}" y="${padT+rh/2+4}" fill="#d7dee9" font-size="12" font-weight="700" text-anchor="middle">${h}</text>`;
      cx += cols[i];
    });
    rows.forEach((row,ri) => {
      cx = padL;
      row.forEach((cell,ci) => {
        const dirty = (ri===2 && ci===2);
        if (dirty) {
          s += `<ellipse cx="${cx+cols[ci]/2}" cy="${padT+(ri+1.5)*rh}" rx="16" ry="9" fill="#2b3242" opacity=".9"/>`;
          s += `<text x="${cx+cols[ci]/2}" y="${padT+(ri+1.5)*rh+5}" fill="#ffd479" font-size="13" font-weight="700" text-anchor="middle">?</text>`;
        } else {
          s += `<text x="${cx+cols[ci]/2}" y="${padT+(ri+1.5)*rh+4}" fill="#d7dee9" font-size="12" text-anchor="middle">${cell}</text>`;
        }
        cx += cols[ci];
      });
    });
    s += `<text x="${padL+W/2}" y="20" fill="#d7dee9" font-size="12" font-weight="700" text-anchor="middle">凸透镜成像实验记录表（f = 10 cm）</text>`;
    return `<svg viewBox="0 0 480 175" role="img" aria-label="凸透镜成像实验数据记录表">${s}</svg>`;
  }
};

if(typeof window!=="undefined"){window.QBANK_C5B_ORIG=QBANK_C5B_ORIG;window.QBANK_C5B_ORIG_FIGS=QBANK_C5B_ORIG_FIGS;}

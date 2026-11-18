/* content/physics_g8_v1_c7_s1/guide/guide-data.js — 第七章第1节「力 · 力的实验室」五场景语音四段式（C7V3-R2 融合版）
   modes: deform(①形变站) / motion(②运动站) / door(③推门工坊+你来画) / mutual(④相互舞台) / meter(⑤测力计工作台)
   状态源=window.C7S1_STATE（exp-force-lab-core.js），引擎轮询 R.mode；trigger 按新页面 state 字段重写。
   旧 clip say/fix/note 文本与 audio 文件名原样不变；intro c7e1/c7e3 逐字=设计书 v3 §6 新文本，c7e2/c7e5-intro 保留旧文本；
   新 clip c7n20 文本=设计书 v3 §6 逐字。c7e4-intro/c7e5-f1 对应旧 UI 已融合或删除，仅存 audios 映射不挂 trigger。 */
window.C7S1_GUIDE={
  bench:{
    intro:{text:'欢迎来到侧视实验台！上下拖拽弹簧下方的悬挂物，按压或拉伸；或用砝码加减，换不同质量的砝码。',audio:'c7b-01'},
    steps:[
      {id:'c7b-02',repeat:true,trigger:'R.bench.pull===true',say:'用手下拉悬挂物，弹簧被拉长，弹性限度内，拉力越大，伸长量越大。',audio:'c7b-02'},
      {id:'c7b-03',repeat:true,trigger:'R.bench.press===true',say:'用手上压悬挂物，弹簧被压缩，松手后回到原样，这就是弹性。',audio:'c7b-03'},
      {id:'c7b-04',repeat:true,trigger:'R.bench.weightAdd===true',say:'换更大砝码，弹簧伸得更长，质量越大重力越大，G等于mg，弹性限度内拉力越大伸长量越大。',audio:'c7b-04'},
      {id:'c7b-16',repeat:true,trigger:'R.bench.hangG===true',say:'砝码静止时，重力与弹簧拉力等大反向，二力平衡。',audio:'c7b-16'},
      {id:'c7b-05',repeat:true,trigger:'R.bench.overLimit===true',say:'超过弹性限度了！弹簧弯折，松手也回不到原样，这是永久变形。',audio:'c7b-05'},
      {id:'c7b-06',repeat:true,trigger:'R.bench.material===true',say:'换材质就是换劲度系数，钢更硬，铝更软，铝挂两百克就超弹性限度。',audio:'c7b-06'},
      {id:'c7b-07',repeat:true,trigger:'R.bench.tilt===true',say:'架子倾斜，悬挂物仍然世界竖直，重力方向竖直向下。',audio:'c7b-07'},
      {id:'c7b-08',repeat:true,trigger:'R.bench.flat===true',say:'支架放平，悬挂物还是竖直下垂，重力方向始终竖直向下，不随支架摆放改变。',audio:'c7b-08'},
      {id:'c7b-09',repeat:true,trigger:'R.bench.axisM===true',say:'横轴换质量，纵轴重力，G等于mg，斜率等于g除以k；横轴换力，斜率等于k分之一。',audio:'c7b-09'},
      {id:'c7b-10',repeat:true,trigger:'R.bench.overRange===true',say:'指针打满红闪，超过量程5牛会损坏测力计，测量前要先估计被测力的大小。',audio:'c7b-10'},
      {id:'c7b-11',repeat:true,trigger:'R.bench.bdragRelease===true',say:'松手指针回零，撤去拉力弹簧恢复原长，弹力随之消失，这是弹性。',audio:'c7b-11'},
      {id:'c7b-17',repeat:true,trigger:'R.bench.balanceEnter===true',say:'这是弹簧测力计，加砝码读G等于mg，也可以下拉挂钩感受拉力的大小。',audio:'c7b-17'},
      {id:'c7b-14',repeat:true,trigger:'R.bench.eye===true',say:'点读数按钮，视线垂直刻度面才读得准，斜视读数会导致读数错误。',audio:'c7b-14'},
      {id:'c7b-15',repeat:true,trigger:'R.bench.reset===true',say:'重置后弹簧回到原长，不受力时弹性物体恢复原状，可以重新开始探究。',audio:'c7b-15'}
      {id:'c7b-18',repeat:true,trigger:'R.bench.diagram===true',say:'力的示意图打开了。砝码静止：重力与弹簧拉力等大反向同体，是平衡力；手拉弹簧：手与弹簧之间的力等大反向异体，是相互作用力。',audio:'c7b-18'},
    ],
    errors:[],free:[],tasks:[]
  },
  road:{
    intro:{text:'欢迎来到侧视马路！拖动小人顶住车，推车启动；按住小人不动，车凭惯性前滑。',audio:'c7r-01'},
    steps:[
      {id:'c7r-03',repeat:true,trigger:'R.road.pushStart===true && R.road.diagram!==true',say:'海绵被压凹，车从静止往前走，一个力同时产生两种效果，力能改变物体形状，也能改变物体运动状态。',audio:'c7r-03'},
      {id:'c7r-02',repeat:true,trigger:'R.road.pushNormal===true',say:'人推车，车也同时给人一个向后的推力，人却没后退，普通鞋时地面摩擦把这个反作用力平衡了。这说明力的作用是相互的。',audio:'c7r-02'},
      {id:'c7r-14',repeat:true,trigger:'R.road.staticHold===true',say:'推力小于最大静摩擦力，车顶得住，不动。',audio:'c7r-14'},
      {id:'c7r-04',repeat:true,trigger:'R.road.release===true',say:'松手，不再推，车只受摩擦和刹车减速。力不是维持运动的原因。',audio:'c7r-04'},
      {id:'c7r-05',repeat:true,trigger:'R.road.slide===true',say:'手已离开车，车不再受推力；重力沿坡面的分力使车加速下滑，入水后水的阻力使它减速，直到池底停住。力是改变物体运动状态的原因，运动不需要力来维持。',audio:'c7r-05'},
      {id:'c7r-08',repeat:true,trigger:'R.road.brake===true',say:'踩刹车车就减速，刹车摩擦力改变了车的运动状态，力是改变运动状态的原因。',audio:'c7r-08'},
      {id:'c7r-09',repeat:true,trigger:'R.road.iceLock===true',say:'轮滑鞋，刹车锁定为最大。推车时人整体向后滑离车，这是相互作用。',audio:'c7r-09'},
      {id:'c7r-10',repeat:true,trigger:'R.road.iceSlide===true',say:'轮滑鞋，手与车已脱离，人靠惯性滑行，缓慢停下。',audio:'c7r-10'},
      {id:'c7r-11',repeat:true,trigger:'R.road.wheel===true',say:'在方向盘的不同位置、沿不同方向施加力，转动效果不同：力的作用点和方向影响力的作用效果，这就是力的三要素。',audio:'c7r-11'},
      {id:'c7r-12',repeat:true,trigger:'R.road.shoeIce===true',say:'换上轮滑鞋，摩擦变小，一推车人就向后滑，车对人的反作用力不再被平衡，力的作用是相互的。',audio:'c7r-12'},
      {id:'c7r-13',repeat:true,trigger:'R.road.shoeNormal===true',say:'换回普通鞋，摩擦变大，推车站得稳，反作用力被地面摩擦平衡，相互的力依然存在。',audio:'c7r-13'}
      {id:'c7r-18',repeat:true,trigger:'R.road.diagram===true',say:'力的示意图打开了。推车时看红蓝两箭：推力与反作用力同时存在、等大反向、同一接触点、作用在两个物体上，力的作用是相互的。',audio:'c7r-18'},
      {id:'c7r-19',repeat:true,trigger:'R.road.pushStart===true && R.road.diagram===true',say:'示意图上红蓝两箭同时出现、一样长、方向相反、尾点重合：作用力与反作用力等大反向共点、作用在两个物体上，力的作用是相互的。',audio:'c7r-19'},
    ],
    errors:[],free:[],tasks:[]
  },

  deform:{
    intro:{text:'欢迎来到力的实验室！五个站点一路玩过去，形变站看力怎么改变形状，运动站看力怎么改变运动，推门工坊学怎么描述力，相互舞台发现力的秘密，最后到测力计工作台学会测量力。',audio:'c7e1-intro'},
    steps:[
      {id:'c7e1-s1',repeat:true,queue:true,trigger:'R.mode===\'deform\' && R.f.clayReleased===true',say:'看，按得越重，橡皮泥的凹坑越深，而且松手后凹坑不回原样，橡皮泥是形变后不恢复的物体。',audio:'c7e1-s1'},
      {id:'c7e1-s2',repeat:true,queue:true,trigger:'R.mode===\'deform\' && R.f.springReleased===true',say:'换弹簧就不一样了，拉它变长、压它变短，形状也变了！但注意，松手后弹簧会回到原样，这就给下一节的弹力埋下伏笔咯。',audio:'c7e1-s2'},
      {id:'c7e4-s1',repeat:true,queue:true,trigger:'R.mode===\'deform\' && R.f.restored===true && R.f.lastTool!==\'clay\' && R.f.permanent===false',say:'弹簧、直尺、橡皮筋松手后都回到原样，这种受力形变、不受力又恢复的性质叫弹性。',audio:'c7e4-s1'},
      {id:'c7e4-s2',repeat:true,queue:true,trigger:'R.mode===\'deform\' && R.f.released===true && R.f.lastTool===\'clay\'',say:'橡皮泥就不行了，按成什么样就是什么样，不能自动恢复的形变叫塑性形变。',audio:'c7e4-s2'},
      {id:'c7e4-s3',repeat:true,queue:true,trigger:'R.mode===\'deform\' && R.f.permanent===true',say:'打开超限度开关再使劲拉，松手后弹簧回不到原样了！弹性是有限度的，超过弹性限度就会永久变形。',audio:'c7e4-s3'},
      {id:'c7e4-s4',repeat:false,queue:true,trigger:'after:c7e4-s1@1500',say:'能自动恢复的物体有弹性，形变的物体要恢复原状时产生的力叫弹力。下一节的弹簧测力计就用这个原理！',audio:'c7e4-s4'},
      {id:'c7n6',repeat:false,queue:true,trigger:'R.mode===\'deform\' && R.f.tool===\'bottle\'',say:'最后这件器材是个硬邦邦的玻璃瓶，插着一根细管。使劲捏它，瓶子好像什么都没变。别急，盯住细管里的水柱看。',audio:'c7n6'},
      {id:'c7n7',repeat:false,queue:true,trigger:'R.mode===\'deform\' && R.f.tool===\'bottle\' && R.f.ts.bottle.def>=0.4',say:'手一捏，水柱升高了！瓶子的形变小得肉眼看不见，细管却把这个微小形变放大了。记住：再坚硬的物体，受力也会发生形变。',audio:'c7n7'}
    ],
    errors:[
      {id:'c7e4-e1',interval:15000,trigger:'R.mode===\'deform\' && R.f.dragging===true && (G.t-R.f.dragT)>6000',fix:'还没松手呢，器材还被你拉着。点松手按钮，看看它恢不恢复。',audio:'c7e4-e1'}
    ],
    free:[
      {trigger:'R.mode===\'deform\' && R.f.triedCount>=2',note:'把四位选手都试一遍，先猜谁恢复、谁不恢复，再验证，看猜得准不准。',audio:'c7e4-f1'}
    ],
    tasks:[]
  },
  motion:{
    steps:[
      {id:'c7e1-s3',repeat:true,queue:true,trigger:'R.mode===\'motion\' && R.b.done===true && R.b.change===\'near\'',say:'来到运动舞台！小铁球本来静止，磁体一靠近，它动起来了，力让它从静止变为运动。',audio:'c7e1-s3'},
      {id:'c7e1-s4',repeat:true,queue:true,trigger:'R.mode===\'motion\' && R.b.done===true && R.b.change===\'side\'',say:'把磁体放在侧面，球的运动方向拐了弯。变快、变慢、变方向，都是运动状态改变。记住，力可以改变物体的运动状态！',audio:'c7e1-s4'}
    ],
    errors:[
      {id:'c7e1-e1',interval:15000,trigger:'R.mode===\'motion\' && R.b.armed===true && R.b.released===false && (G.t-R.b.armT)>5000',fix:'哎，还没点释放按钮呢，小球不会动哦。点一下释放，再观察现象。',audio:'c7e1-e1'}
    ],
    free:[
      {trigger:'R.mode===\'motion\' && R.b.triedCount>=2',note:'试试磁体的三种放法，对比小球各是哪种运动变化，印象会更深刻。',audio:'c7e1-f1'}
    ],
    tasks:[]
  },
  door:{
    intro:{text:'欢迎来到推门工坊！三个滑杆控制作用点、方向和大小，试试怎么推门最省力；推完还有个小考验，动手画一幅标准的力的示意图。',audio:'c7e2-intro'},
    steps:[
      {id:'c7e2-s1',repeat:true,queue:true,trigger:'R.mode===\'door\' && R.board===\'door\' && R.e.nearTried===true && R.e.farTried===true',say:'靠近门轴推，使好大劲门也爱动不动；离门轴远一点推，轻松多了。力作用的位置，也就是作用点，真的很要紧！',audio:'c7e2-s1'},
      {id:'c7e2-s2',repeat:true,queue:true,trigger:'R.mode===\'door\' && R.board===\'door\' && R.e.parTried===true',say:'再换方向试试，垂直门面推最管用，顺着门面推等于白推。方向也会影响力的作用效果。',audio:'c7e2-s2'},
      {id:'c7e2-s3',repeat:true,queue:true,trigger:'R.mode===\'door\' && R.board===\'door\' && R.e.bigTried===true',say:'大小呢，力越大门转得越快。看图上这条带箭头的线段，长短是大小、箭头是方向、起点是作用点，这就是力的示意图。',audio:'c7e2-s3'},
      {id:'c7e2-s4',repeat:false,queue:true,trigger:'after:c7e2-s3@2500',say:'大小、方向、作用点，合起来叫力的三要素，任何一个变了，力的作用效果就跟着变。记住它！',audio:'c7e2-s4'},
      {id:'c7n1',repeat:true,queue:true,trigger:'event:click:#btn-board-draw',say:'现在轮到你当小老师！图里吊灯被绳子吊着，绳对灯有4牛竖直向上的拉力。想一想：起点画在哪、方向朝哪、线段画多长？在图上点出你的答案。',audio:'c7n1'},
      {id:'c7n2',repeat:true,queue:true,trigger:'R.mode===\'door\' && R.board===\'draw\' && R.d.judged===true && R.d.wrongCount===0',say:'画得漂亮！起点在灯上，方向竖直向上，长度对应4牛，力的示意图三要素一个不差。',audio:'c7n2'},
      {id:'c7n3',repeat:true,queue:true,trigger:'R.mode===\'door\' && R.board===\'draw\' && R.d.judged===true && R.d.wrongCount>0',say:'再想想：力的示意图，起点要画在受力物体上，也就是灯上；方向要沿力竖直向上；线段长短要和力的大小对应。起点、方向、长度，哪一步都不能马虎。',audio:'c7n3'}
    ],
    errors:[
      {id:'c7e2-e1',interval:15000,trigger:'R.mode===\'door\' && R.board===\'door\' && R.e.open>=0.98 && R.e.pushing===true',fix:'门已经开到底啦，先把它关上再练，不然看不出推的效果哦。',audio:'c7e2-e1'}
    ],
    free:[
      {trigger:'R.mode===\'door\' && R.board===\'door\' && R.e.successCount>=2',note:'把作用点滑到门边，再换几个方向试试，体会哪种组合最省力。',audio:'c7e2-f1'}
    ],
    tasks:[]
  },
  mutual:{
    intro:{text:'欢迎来到相互舞台！把两辆磁车往中间推一推再松手，看看会发生什么；还可以点车上的磁体翻个磁极，再试一次，对比两种结果。',audio:'c7e3-intro'},
    steps:[
      {id:'c7e3-s1',repeat:true,queue:true,trigger:'R.mode===\'mutual\' && R.cstep===1 && R.m.flip===false && R.m.settled===true',say:'看，两辆车同时弹开了！谁也没碰谁，却都动了，说明它们都受到了对方的力。',audio:'c7e3-s1'},
      {id:'c7e3-s2',repeat:false,queue:true,trigger:'after:c7e3-s1@1500',say:'一个物体对另一个物体施力时，同时也受到对方的力。物体间力的作用是相互的，记住它！',audio:'c7e3-s2'},
      {id:'c7n20',repeat:false,queue:true,trigger:'R.mode===\'mutual\' && R.cstep===1 && R.m.flip===true',say:'磁极翻过来了，现在是异名磁极相对。松手看，异名相吸，两辆车被拉到了一起。',audio:'c7n20'},
      {id:'c7n4',repeat:true,queue:true,trigger:'event:click:#btn-c-step2',say:'磁车对弹说明两车都受了力，可这两个力一样大吗？别猜，把两只弹簧测力计钩在一起拉一拉，让读数说话。',audio:'c7n4'},
      {id:'c7n5',repeat:false,queue:true,trigger:'R.mode===\'mutual\' && R.cstep===2 && (R.p.maxT>=3.5 || R.p.pulls>=2)',say:'看，不管用多大劲拉，两只表的读数始终相等、方向相反。一个物体施力的同时，也受到对方大小相等的力，这就是力的相互性。',audio:'c7n5'}
    ],
    errors:[
      {id:'c7e3-e1',interval:15000,trigger:'R.mode===\'mutual\' && R.cstep===1 && R.m.needReset===true',fix:'小车还没复位呢，先点复位按钮，把两车放回原位再释放。',audio:'c7e3-e1'}
    ],
    free:[
      {trigger:'R.mode===\'mutual\' && R.cstep===1 && R.m.released===true && R.m.settled===false',note:'观察两辆车的速度读数牌，它们同时变化，说明两车同时受力、同时改变运动状态。',audio:'c7e3-f1'}
    ],
    tasks:[]
  },
  meter:{
    intro:{text:'欢迎来到测力计工作台！竖直挂钩码、水平拖木块都能测。先调零、认清量程和分度值，再动手。测完还要当一回考官，抓一抓错误操作的虫子。',audio:'c7e5-intro'},
    steps:[
      {id:'c7e5-s1',repeat:true,trigger:'R.mode===\'meter\' && (G.t-G.modeEnterT)>2500 && R.s.orient===\'v\' && R.s.v.zeroed===false',say:'指针没指零，点调零按钮把它对齐，不调零的话读数全是错的。',audio:'c7e5-s1'},
      {id:'c7e5-s2',repeat:true,queue:true,trigger:'R.mode===\'meter\' && R.s.orient===\'v\' && R.s.v.zeroed===true && R.s.v.count>=1 && R.s.v.settled===true',say:'钩码一个个挂上去，指针一步步走，弹簧越伸越长。弹性限度内，拉力越大，弹簧伸长量越大，这就是弹簧测力计的原理。',audio:'c7e5-s2'},
      {id:'c7e5-s3',repeat:false,queue:true,trigger:'after:c7e5-s2@2500',say:'钩码挂稳、指针停住再读数，看指针指到哪个刻度，别忘了单位是牛。',audio:'c7e5-s3'},
      {id:'c7e5-s4',repeat:true,queue:true,trigger:'R.mode===\'meter\' && R.s.orient===\'h\' && R.s.h.zeroed===true',say:'换成水平方向拉，用法要变，得在水平方向重新调零再测。再感受1牛、3牛、5牛的拉力，记住这个手感！',audio:'c7e5-s4'},
      {id:'c7n10',repeat:false,queue:true,trigger:'R.mode===\'meter\' && R.s.extTouched===true',say:'注意面板上这个数：伸长量等于现在长度减去原长。原理说的是拉力越大伸长量越大，不是长度越长。这一个字的差别，考试最爱挖坑。',audio:'c7n10'},
      {id:'c7n8',repeat:false,queue:true,trigger:'R.mode===\'meter\' && R.s.examOpen===true',say:'现在你来当考官。这四种用测力计的做法里藏着错误，把它们揪出来，还要说得出为什么错。',audio:'c7n8'},
      {id:'c7n9a',repeat:false,queue:true,trigger:'R.mode===\'meter\' && R.s.exam.c1.judged===true',say:'没调零就测量，指针不在零刻度，读出来的数就不是真实的力。先调零，再测量。',audio:'c7n9a'},
      {id:'c7n9b',repeat:false,queue:true,trigger:'R.mode===\'meter\' && R.s.exam.c2.judged===true',say:'超过了量程硬拉，弹簧会被拉坏，超过弹性限度就回不来了。测量前先看量程。',audio:'c7n9b'},
      {id:'c7n9c',repeat:false,queue:true,trigger:'R.mode===\'meter\' && R.s.exam.c3.judged===true',say:'斜着拉挂钩，弹簧轴线方向和力的方向不一致，读数会偏小，还容易让指针卡壳。要沿测力计的轴线方向拉。',audio:'c7n9c'}
    ],
    errors:[
      {id:'c7e5-e1',interval:8000,trigger:'R.mode===\'meter\' && R.s.overload===true',fix:'哎呀，超过5牛了！加在测力计上的力不允许超过最大测量值，否则会损坏它。快减掉一个钩码。',audio:'c7e5-e1'}
    ],
    free:[],
    tasks:[]
  },
  audios:{
    'c7e1-intro':'guide/audio/c7e1-intro.mp3?v=20261111',
    'c7e1-s1':'guide/audio/c7e1-s1.mp3?v=20261111','c7e1-s2':'guide/audio/c7e1-s2.mp3?v=20261111',
    'c7e1-s3':'guide/audio/c7e1-s3.mp3?v=20261111','c7e1-s4':'guide/audio/c7e1-s4.mp3?v=20261111',
    'c7e1-e1':'guide/audio/c7e1-e1.mp3?v=20261111','c7e1-f1':'guide/audio/c7e1-f1.mp3?v=20261111',
    'c7e2-intro':'guide/audio/c7e2-intro.mp3?v=20261111',
    'c7e2-s1':'guide/audio/c7e2-s1.mp3?v=20261111','c7e2-s2':'guide/audio/c7e2-s2.mp3?v=20261111',
    'c7e2-s3':'guide/audio/c7e2-s3.mp3?v=20261111','c7e2-s4':'guide/audio/c7e2-s4.mp3?v=20261111',
    'c7e2-e1':'guide/audio/c7e2-e1.mp3?v=20261111','c7e2-f1':'guide/audio/c7e2-f1.mp3?v=20261111',
    'c7e3-intro':'guide/audio/c7e3-intro.mp3?v=20261111',
    'c7e3-s1':'guide/audio/c7e3-s1.mp3?v=20261111','c7e3-s2':'guide/audio/c7e3-s2.mp3?v=20261111',
    'c7e3-e1':'guide/audio/c7e3-e1.mp3?v=20261111','c7e3-f1':'guide/audio/c7e3-f1.mp3?v=20261111',
    'c7e4-intro':'guide/audio/c7e4-intro.mp3?v=20261111',
    'c7e4-s1':'guide/audio/c7e4-s1.mp3?v=20261111','c7e4-s2':'guide/audio/c7e4-s2.mp3?v=20261111',
    'c7e4-s3':'guide/audio/c7e4-s3.mp3?v=20261111','c7e4-s4':'guide/audio/c7e4-s4.mp3?v=20261111',
    'c7e4-e1':'guide/audio/c7e4-e1.mp3?v=20261111','c7e4-f1':'guide/audio/c7e4-f1.mp3?v=20261111',
    'c7e5-intro':'guide/audio/c7e5-intro.mp3?v=20261111',
    'c7e5-s1':'guide/audio/c7e5-s1.mp3?v=20261111','c7e5-s2':'guide/audio/c7e5-s2.mp3?v=20261111',
    'c7e5-s3':'guide/audio/c7e5-s3.mp3?v=20261111','c7e5-s4':'guide/audio/c7e5-s4.mp3?v=20261111',
    'c7e5-e1':'guide/audio/c7e5-e1.mp3?v=20261111','c7e5-f1':'guide/audio/c7e5-f1.mp3?v=20261111',
    'c7n1':'guide/audio/c7n1.mp3?v=20261111','c7n2':'guide/audio/c7n2.mp3?v=20261111',
    'c7n3':'guide/audio/c7n3.mp3?v=20261111','c7n4':'guide/audio/c7n4.mp3?v=20261111',
    'c7n5':'guide/audio/c7n5.mp3?v=20261111','c7n6':'guide/audio/c7n6.mp3?v=20261111',
    'c7n7':'guide/audio/c7n7.mp3?v=20261111','c7n8':'guide/audio/c7n8.mp3?v=20261111',
    'c7n9a':'guide/audio/c7n9a.mp3?v=20261111','c7n9b':'guide/audio/c7n9b.mp3?v=20261111',
    'c7n9c':'guide/audio/c7n9c.mp3?v=20261111','c7n10':'guide/audio/c7n10.mp3?v=20261111',
    'c7n20':'guide/audio/c7n20.mp3?v=20261111',
    'c7r-01':'guide/audio/c7r-01.mp3?v=20261118x','c7r-02':'guide/audio/c7r-02.mp3?v=20261118z6',
    'c7r-03':'guide/audio/c7r-03.mp3?v=20261118z6','c7r-04':'guide/audio/c7r-04.mp3?v=20261118x',
    'c7r-05':'guide/audio/c7r-05.mp3?v=20261118z7',    'c7r-08':'guide/audio/c7r-08.mp3?v=20261118z6',
    'c7r-09':'guide/audio/c7r-09.mp3?v=20261118x','c7r-10':'guide/audio/c7r-10.mp3?v=20261118x',
    'c7r-11':'guide/audio/c7r-11.mp3?v=20261118z7','c7r-12':'guide/audio/c7r-12.mp3?v=20261118z6',
    'c7r-13':'guide/audio/c7r-13.mp3?v=20261118z6','c7r-14':'guide/audio/c7r-14.mp3?v=20261118x',
    'c7b-01':'guide/audio/c7b-01.mp3?v=20261118z4','c7b-02':'guide/audio/c7b-02.mp3?v=20261118z',
    'c7b-03':'guide/audio/c7b-03.mp3?v=20261118z','c7b-04':'guide/audio/c7b-04.mp3?v=20261118z6',
    'c7b-05':'guide/audio/c7b-05.mp3?v=20261118z','c7b-06':'guide/audio/c7b-06.mp3?v=20261118z4',
    'c7b-07':'guide/audio/c7b-07.mp3?v=20261118z','c7b-08':'guide/audio/c7b-08.mp3?v=20261118z6',
    'c7b-09':'guide/audio/c7b-09.mp3?v=20261118z','c7b-10':'guide/audio/c7b-10.mp3?v=20261118z6',
    'c7b-11':'guide/audio/c7b-11.mp3?v=20261118z6','c7b-14':'guide/audio/c7b-14.mp3?v=20261118z5',
    'c7b-15':'guide/audio/c7b-15.mp3?v=20261118z6','c7b-16':'guide/audio/c7b-16.mp3?v=20261118z4',
    'c7b-17':'guide/audio/c7b-17.mp3?v=20261118z5',
    'c7r-18':'guide/audio/c7r-18.mp3?v=20261118z7','c7r-19':'guide/audio/c7r-19.mp3?v=20261118z7',
    'c7b-18':'guide/audio/c7b-18.mp3?v=20261118z7',
  }
};

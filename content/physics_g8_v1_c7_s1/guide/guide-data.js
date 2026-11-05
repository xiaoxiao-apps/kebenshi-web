/* content/physics_g8_v1_c7_s1/guide/guide-data.js — 第七章第1节「力 · 力的探究工坊」三场景语音四段式（C7V2-D2a 融合版）
   modes: effect(场景① 效果舞台 c7e1) / elements(场景② 推门工坊 c7e2) / mutual(场景③ 相互舞台 c7e3)
   trigger 按 exp-workshop-core.js 新页面 state 字段重写；旧 clip 的 say/fix/note 文本与 audio 文件名原样不变。
   intro 换新文本（audio 同名覆盖，主会话已产）；新增 c7n1-n5（文本=设计书 §4 逐字）。
   文案=屏幕字幕（特级教师现场讲课，重逻辑链与「从现象看本质」因果律） */
window.C7S1_GUIDE={
  effect:{
    intro:{text:'欢迎来到力的探究工坊！一张工作台三个站点，先看力能改变什么，再学怎么把力画出来，最后发现力的一个大秘密——它是相互的。',audio:'c7e1-intro'},
    steps:[
      {id:'c7e1-s1',repeat:true,queue:true,trigger:'R.mode===\'effect\' && R.a.clayReleased===true',say:'看，按得越重，橡皮泥的凹坑越深，而且松手后凹坑不回原样，橡皮泥是形变后不恢复的物体。',audio:'c7e1-s1'},
      {id:'c7e1-s2',repeat:true,queue:true,trigger:'R.mode===\'effect\' && R.a.springReleased===true',say:'换弹簧就不一样了，拉它变长、压它变短，形状也变了！但注意，松手后弹簧会回到原样，这就给下一节的弹力埋下伏笔咯。',audio:'c7e1-s2'},
      {id:'c7e1-s3',repeat:true,queue:true,trigger:'R.mode===\'effect\' && R.b.done===true && R.b.change===\'near\'',say:'来到运动舞台！小铁球本来静止，磁体一靠近，它动起来了，力让它从静止变为运动。',audio:'c7e1-s3'},
      {id:'c7e1-s4',repeat:true,queue:true,trigger:'R.mode===\'effect\' && R.b.done===true && R.b.change===\'side\'',say:'把磁体放在侧面，球的运动方向拐了弯。变快、变慢、变方向，都是运动状态改变。记住，力可以改变物体的运动状态！',audio:'c7e1-s4'}
    ],
    errors:[
      {id:'c7e1-e1',interval:15000,trigger:'R.mode===\'effect\' && R.b.armed===true && R.b.released===false && (G.t-R.b.armT)>5000',fix:'哎，还没点释放按钮呢，小球不会动哦。点一下释放，再观察现象。',audio:'c7e1-e1'}
    ],
    free:[
      {trigger:'R.mode===\'effect\' && R.b.triedCount>=2',note:'试试磁体的三种放法，对比小球各是哪种运动变化，印象会更深刻。',audio:'c7e1-f1'}
    ],
    tasks:[]
  },
  elements:{
    intro:{text:'欢迎来到推门工坊！三个滑杆控制作用点、方向和大小，试试怎么推门最省力；推完还有个小考验，动手画一幅标准的力的示意图。',audio:'c7e2-intro'},
    steps:[
      {id:'c7e2-s1',repeat:true,queue:true,trigger:'R.mode===\'elements\' && R.e.nearTried===true && R.e.farTried===true',say:'靠近门轴推，使好大劲门也爱动不动；离门轴远一点推，轻松多了。力作用的位置，也就是作用点，真的很要紧！',audio:'c7e2-s1'},
      {id:'c7e2-s2',repeat:true,queue:true,trigger:'R.mode===\'elements\' && R.e.parTried===true',say:'再换方向试试，垂直门面推最管用，顺着门面推等于白推。方向也会影响力的作用效果。',audio:'c7e2-s2'},
      {id:'c7e2-s3',repeat:true,queue:true,trigger:'R.mode===\'elements\' && R.e.bigTried===true',say:'大小呢，力越大门转得越快。看图上这条带箭头的线段，长短是大小、箭头是方向、起点是作用点，这就是力的示意图。',audio:'c7e2-s3'},
      {id:'c7e2-s4',repeat:false,queue:true,trigger:'after:c7e2-s3@2500',say:'大小、方向、作用点，合起来叫力的三要素，任何一个变了，力的作用效果就跟着变。记住它！',audio:'c7e2-s4'},
      {id:'c7n1',repeat:true,queue:true,trigger:'event:click:#btn-board-draw',say:'现在轮到你当小老师！图里吊灯被绳子吊着，绳对灯有4牛竖直向上的拉力。想一想：起点画在哪、方向朝哪、线段画多长？在图上点出你的答案。',audio:'c7n1'},
      {id:'c7n2',repeat:true,queue:true,trigger:'event:click:#btn-draw-check:R.d.judged===true && R.d.wrongCount===0',say:'画得漂亮！起点在灯上，方向竖直向上，长度对应4牛，力的示意图三要素一个不差。',audio:'c7n2'},
      {id:'c7n3',repeat:true,queue:true,trigger:'event:click:#btn-draw-check:R.d.judged===true && R.d.wrongCount>0',say:'再想想：力的示意图，起点要画在受力物体上，也就是灯上；方向要沿力竖直向上；线段长短要和力的大小对应。起点、方向、长度，哪一步都不能马虎。',audio:'c7n3'}
    ],
    errors:[
      {id:'c7e2-e1',interval:15000,trigger:'R.mode===\'elements\' && R.e.open>=0.98 && R.e.pushing===true',fix:'门已经开到底啦，先把它关上再练，不然看不出推的效果哦。',audio:'c7e2-e1'}
    ],
    free:[
      {trigger:'R.mode===\'elements\' && R.e.successCount>=2',note:'把作用点滑到门边，再换几个方向试试，体会哪种组合最省力。',audio:'c7e2-f1'}
    ],
    tasks:[]
  },
  mutual:{
    intro:{text:'欢迎来到相互舞台！先看两辆磁车互相弹开，再让两只弹簧测力计钩在一起对拉，看看两个物体之间的力，到底谁大谁小。',audio:'c7e3-intro'},
    steps:[
      {id:'c7e3-s1',repeat:true,queue:true,trigger:'R.mode===\'mutual\' && R.cstep===1 && R.m.settled===true',say:'看，两辆车同时弹开了！谁也没碰谁，却都动了，说明它们都受到了对方的力。',audio:'c7e3-s1'},
      {id:'c7e3-s2',repeat:false,queue:true,trigger:'after:c7e3-s1@1500',say:'一个物体对另一个物体施力时，同时也受到对方的力。物体间力的作用是相互的，记住它！',audio:'c7e3-s2'},
      {id:'c7n4',repeat:true,queue:true,trigger:'event:click:#btn-c-step2',say:'磁车对弹说明两车都受了力，可这两个力一样大吗？别猜，把两只弹簧测力计钩在一起拉一拉，让读数说话。',audio:'c7n4'},
      {id:'c7n5',repeat:false,queue:true,trigger:'R.mode===\'mutual\' && R.cstep===2 && (R.p.maxT>=3.5 || R.p.pulls>=2)',say:'看，不管用多大劲拉，两只表的读数始终相等、方向相反。一个物体施力的同时，也受到对方大小相等的力，这就是力的相互性。',audio:'c7n5'}
    ],
    errors:[
      {id:'c7e3-e1',queue:true,trigger:'event:click:#btn-c-release:R.m.released===true',fix:'小车还没复位呢，先点复位按钮，把两车放回原位再释放。',audio:'c7e3-e1'}
    ],
    free:[
      {trigger:'R.mode===\'mutual\' && R.cstep===1 && R.m.released===true && R.m.settled===false',note:'观察两辆车的速度读数牌，它们同时变化，说明两车同时受力、同时改变运动状态。',audio:'c7e3-f1'}
    ],
    tasks:[]
  },
  audios:{
    'c7e1-intro':'guide/audio/c7e1-intro.mp3?v=20261106',
    'c7e1-s1':'guide/audio/c7e1-s1.mp3?v=20261106','c7e1-s2':'guide/audio/c7e1-s2.mp3?v=20261106',
    'c7e1-s3':'guide/audio/c7e1-s3.mp3?v=20261106','c7e1-s4':'guide/audio/c7e1-s4.mp3?v=20261106',
    'c7e1-e1':'guide/audio/c7e1-e1.mp3?v=20261106','c7e1-f1':'guide/audio/c7e1-f1.mp3?v=20261106',
    'c7e2-intro':'guide/audio/c7e2-intro.mp3?v=20261106',
    'c7e2-s1':'guide/audio/c7e2-s1.mp3?v=20261106','c7e2-s2':'guide/audio/c7e2-s2.mp3?v=20261106',
    'c7e2-s3':'guide/audio/c7e2-s3.mp3?v=20261106','c7e2-s4':'guide/audio/c7e2-s4.mp3?v=20261106',
    'c7e2-e1':'guide/audio/c7e2-e1.mp3?v=20261106','c7e2-f1':'guide/audio/c7e2-f1.mp3?v=20261106',
    'c7e3-intro':'guide/audio/c7e3-intro.mp3?v=20261106',
    'c7e3-s1':'guide/audio/c7e3-s1.mp3?v=20261106','c7e3-s2':'guide/audio/c7e3-s2.mp3?v=20261106',
    'c7e3-e1':'guide/audio/c7e3-e1.mp3?v=20261106','c7e3-f1':'guide/audio/c7e3-f1.mp3?v=20261106',
    'c7n1':'guide/audio/c7n1.mp3?v=20261106','c7n2':'guide/audio/c7n2.mp3?v=20261106',
    'c7n3':'guide/audio/c7n3.mp3?v=20261106','c7n4':'guide/audio/c7n4.mp3?v=20261106',
    'c7n5':'guide/audio/c7n5.mp3?v=20261106'
  }
};

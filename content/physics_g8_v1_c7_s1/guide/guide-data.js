/* content/physics_g8_v1_c7_s1/guide/guide-data.js — 第七章第1节「力」三实验语音四段式
   modes: effect(E1 观察站 c7e1) / elements(E2 推门工坊 c7e2) / mutual(E3 相互作用台 c7e3)
   文案=屏幕字幕（主会话 clip 表逐字，与 audio mp3 语义一致） */
window.C7S1_GUIDE={
  effect:{
    intro:{text:'欢迎来到力的作用效果观察站！这一站有两个舞台，形变舞台和运动舞台。先去形变舞台，按按橡皮泥、拉拉弹簧，看看力怎么改变物体的形状！',audio:'c7e1-intro'},
    steps:[
      {id:'c7e1-s1',repeat:true,queue:true,trigger:'R.scene===\'a\' && R.a.clayReleased===true',say:'看，按得越重，橡皮泥的凹坑越深，而且松手后凹坑不回原样，橡皮泥是形变后不恢复的物体。',audio:'c7e1-s1'},
      {id:'c7e1-s2',repeat:true,queue:true,trigger:'R.scene===\'a\' && R.a.springReleased===true',say:'换弹簧就不一样了，拉它变长、压它变短，形状也变了！但注意，松手后弹簧会回到原样，这就给下一节的弹力埋下伏笔咯。',audio:'c7e1-s2'},
      {id:'c7e1-s3',repeat:true,queue:true,trigger:'R.scene===\'b\' && R.b.done===true && R.b.change===\'near\'',say:'来到运动舞台！小铁球本来静止，磁体一靠近，它动起来了，力让它从静止变为运动。',audio:'c7e1-s3'},
      {id:'c7e1-s4',repeat:true,queue:true,trigger:'R.scene===\'b\' && R.b.done===true && R.b.change===\'side\'',say:'把磁体放在侧面，球的运动方向拐了弯。变快、变慢、变方向，都是运动状态改变。记住，力可以改变物体的运动状态！',audio:'c7e1-s4'}
    ],
    errors:[
      {id:'c7e1-e1',interval:15000,trigger:'R.scene===\'b\' && R.b.armed===true && R.b.released===false && (G.t-R.b.armT)>5000',fix:'哎，还没点释放按钮呢，小球不会动哦。点一下释放，再观察现象。',audio:'c7e1-e1'}
    ],
    free:[
      {trigger:'R.scene===\'b\' && R.b.triedCount>=2',note:'试试磁体的三种放法，对比小球各是哪种运动变化，印象会更深刻。',audio:'c7e1-f1'}
    ],
    tasks:[]
  },
  elements:{
    intro:{text:'欢迎来到三要素推门工坊！这扇门上有三个滑杆，作用点、方向、大小，都归你调。试试看，怎么推门最省力？',audio:'c7e2-intro'},
    steps:[
      {id:'c7e2-s1',repeat:true,queue:true,trigger:'R.e.nearTried===true && R.e.farTried===true',say:'靠近门轴推，使好大劲门也爱动不动；离门轴远一点推，轻松多了。力作用的位置，也就是作用点，真的很要紧！',audio:'c7e2-s1'},
      {id:'c7e2-s2',repeat:true,queue:true,trigger:'R.e.parTried===true',say:'再换方向试试，垂直门面推最管用，顺着门面推等于白推。方向也会影响力的作用效果。',audio:'c7e2-s2'},
      {id:'c7e2-s3',repeat:true,queue:true,trigger:'R.e.bigTried===true',say:'大小呢，力越大门转得越快。看图上这条带箭头的线段，长短是大小、箭头是方向、起点是作用点，这就是力的示意图。',audio:'c7e2-s3'},
      {id:'c7e2-s4',repeat:false,queue:true,trigger:'after:c7e2-s3@2500',say:'大小、方向、作用点，合起来叫力的三要素，任何一个变了，力的作用效果就跟着变。记住它！',audio:'c7e2-s4'}
    ],
    errors:[
      {id:'c7e2-e1',interval:15000,trigger:'R.e.open>=0.98 && R.e.pushing===true',fix:'门已经开到底啦，先把它关上再练，不然看不出推的效果哦。',audio:'c7e2-e1'}
    ],
    free:[
      {trigger:'R.e.successCount>=2',note:'把作用点滑到门边，再换几个方向试试，体会哪种组合最省力。',audio:'c7e2-f1'}
    ],
    tasks:[]
  },
  mutual:{
    intro:{text:'欢迎来到相互作用台！两辆小车各带一块磁体，同名磁极相对。点释放，看看会发生什么！',audio:'c7e3-intro'},
    steps:[
      {id:'c7e3-s1',repeat:true,queue:true,trigger:'R.m.settled===true',say:'看，两辆车同时弹开了！谁也没碰谁，却都动了，说明它们都受到了对方的力。',audio:'c7e3-s1'},
      {id:'c7e3-s2',repeat:false,queue:true,trigger:'after:c7e3-s1@1500',say:'一个物体对另一个物体施力时，同时也受到对方的力。物体间力的作用是相互的，记住它！',audio:'c7e3-s2'}
    ],
    errors:[
      {id:'c7e3-e1',queue:true,trigger:'event:click:#btn-release:R.m.released===true',fix:'小车还没复位呢，先点复位按钮，把两车放回原位再释放。',audio:'c7e3-e1'}
    ],
    free:[
      {trigger:'R.m.released===true && R.m.settled===false',note:'观察两辆车的速度读数牌，它们同时变化，说明两车同时受力、同时改变运动状态。',audio:'c7e3-f1'}
    ],
    tasks:[]
  },
  audios:{
    'c7e1-intro':'guide/audio/c7e1-intro.mp3?v=20261104',
    'c7e1-s1':'guide/audio/c7e1-s1.mp3?v=20261104','c7e1-s2':'guide/audio/c7e1-s2.mp3?v=20261104',
    'c7e1-s3':'guide/audio/c7e1-s3.mp3?v=20261104','c7e1-s4':'guide/audio/c7e1-s4.mp3?v=20261104',
    'c7e1-e1':'guide/audio/c7e1-e1.mp3?v=20261104','c7e1-f1':'guide/audio/c7e1-f1.mp3?v=20261104',
    'c7e2-intro':'guide/audio/c7e2-intro.mp3?v=20261104',
    'c7e2-s1':'guide/audio/c7e2-s1.mp3?v=20261104','c7e2-s2':'guide/audio/c7e2-s2.mp3?v=20261104',
    'c7e2-s3':'guide/audio/c7e2-s3.mp3?v=20261104','c7e2-s4':'guide/audio/c7e2-s4.mp3?v=20261104',
    'c7e2-e1':'guide/audio/c7e2-e1.mp3?v=20261104','c7e2-f1':'guide/audio/c7e2-f1.mp3?v=20261104',
    'c7e3-intro':'guide/audio/c7e3-intro.mp3?v=20261104',
    'c7e3-s1':'guide/audio/c7e3-s1.mp3?v=20261104','c7e3-s2':'guide/audio/c7e3-s2.mp3?v=20261104',
    'c7e3-e1':'guide/audio/c7e3-e1.mp3?v=20261104','c7e3-f1':'guide/audio/c7e3-f1.mp3?v=20261104'
  }
};

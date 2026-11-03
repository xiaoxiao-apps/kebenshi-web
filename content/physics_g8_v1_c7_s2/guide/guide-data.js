/* content/physics_g8_v1_c7_s2/guide/guide-data.js — 弹力（E4 弹性与弹性限度 / E5 弹簧测力计）
   clip 文本=屏幕字幕原文（语音同文），audio id→路径映射在 audios 单点 */
window.C7S2_GUIDE={
  elastic:{
    intro:{text:'欢迎来到弹性与弹性限度探究器！四位选手，弹簧、直尺、橡皮筋、橡皮泥。拉一拉再松手，谁能恢复原状？',audio:'c7e4-intro'},
    steps:[
      {id:'c7e4-s1',repeat:true,queue:true,trigger:'R.e.restored===true && R.e.lastTool!==\'clay\' && R.e.permanent===false',say:'弹簧、直尺、橡皮筋松手后都回到原样，这种受力形变、不受力又恢复的性质叫弹性。',audio:'c7e4-s1'},
      {id:'c7e4-s2',repeat:true,queue:true,trigger:'R.e.released===true && R.e.lastTool===\'clay\'',say:'橡皮泥就不行了，按成什么样就是什么样，不能自动恢复的形变叫塑性形变。',audio:'c7e4-s2'},
      {id:'c7e4-s3',repeat:true,queue:true,trigger:'R.e.permanent===true',say:'打开超限度开关再使劲拉，松手后弹簧回不到原样了！弹性是有限度的，超过弹性限度就会永久变形。',audio:'c7e4-s3'},
      {id:'c7e4-s4',repeat:false,queue:true,trigger:'after:c7e4-s1@1500',say:'能自动恢复的物体有弹性，形变的物体要恢复原状时产生的力叫弹力。下一节的弹簧测力计就用这个原理！',audio:'c7e4-s4'}
    ],
    errors:[
      {id:'c7e4-e1',interval:15000,trigger:'R.e.pulling===true && R.e.pull>0 && (G.t-R.e.pullT)>6000',fix:'还没松手呢，器材还被你拉着。点松手按钮，看看它恢不恢复。',audio:'c7e4-e1'}
    ],
    free:[
      {trigger:'R.e.triedCount>=2',note:'把四位选手都试一遍，先猜谁恢复、谁不恢复，再验证，看猜得准不准。',audio:'c7e4-f1'}
    ],
    tasks:[]
  },
  springmeter:{
    intro:{text:'欢迎来到弹簧测力计实验室！先看量程，0到5牛，再认清每个小格代表多少牛。挂钩码之前，别忘了检查指针指不指零！',audio:'c7e5-intro'},
    steps:[
      {id:'c7e5-s1',repeat:true,trigger:'(G.t-G.modeEnterT)>2500 && R.scene===\'v\' && R.s.v.zeroed===false',say:'指针没指零，点调零按钮把它对齐，不调零的话读数全是错的。',audio:'c7e5-s1'},
      {id:'c7e5-s2',repeat:true,queue:true,trigger:'R.scene===\'v\' && R.s.v.zeroed===true && R.s.v.stack.length>=1 && R.s.v.settled===true',say:'钩码一个个挂上去，指针一步步走，弹簧越伸越长。弹性限度内，拉力越大，弹簧伸长量越大，这就是弹簧测力计的原理。',audio:'c7e5-s2'},
      {id:'c7e5-s3',repeat:false,queue:true,trigger:'after:c7e5-s2@2500',say:'钩码挂稳、指针停住再读数，看指针指到哪个刻度，别忘了单位是牛。',audio:'c7e5-s3'},
      {id:'c7e5-s4',repeat:true,queue:true,trigger:'R.scene===\'h\' && R.s.h.zeroed===true',say:'换成水平方向拉，用法要变，得在水平方向重新调零再测。再感受1牛、3牛、5牛的拉力，记住这个手感！',audio:'c7e5-s4'}
    ],
    errors:[
      {id:'c7e5-e1',interval:8000,trigger:'R.s.overload===true',fix:'哎呀，超过5牛了！加在测力计上的力不允许超过最大测量值，否则会损坏它。快减掉一个钩码。',audio:'c7e5-e1'}
    ],
    free:[
      {trigger:'R.s.feelUsed>=1',note:'点感受1牛、3牛、5牛按钮，对照手掂钩码的感觉，看看是不是一致。',audio:'c7e5-f1'}
    ],
    tasks:[]
  },
  audios:{
    'c7e4-intro':'guide/audio/c7e4-intro.mp3?v=20261104',
    'c7e4-s1':'guide/audio/c7e4-s1.mp3?v=20261104','c7e4-s2':'guide/audio/c7e4-s2.mp3?v=20261104',
    'c7e4-s3':'guide/audio/c7e4-s3.mp3?v=20261104','c7e4-s4':'guide/audio/c7e4-s4.mp3?v=20261104',
    'c7e4-e1':'guide/audio/c7e4-e1.mp3?v=20261104','c7e4-f1':'guide/audio/c7e4-f1.mp3?v=20261104',
    'c7e5-intro':'guide/audio/c7e5-intro.mp3?v=20261104',
    'c7e5-s1':'guide/audio/c7e5-s1.mp3?v=20261104','c7e5-s2':'guide/audio/c7e5-s2.mp3?v=20261104',
    'c7e5-s3':'guide/audio/c7e5-s3.mp3?v=20261104','c7e5-s4':'guide/audio/c7e5-s4.mp3?v=20261104',
    'c7e5-e1':'guide/audio/c7e5-e1.mp3?v=20261104','c7e5-f1':'guide/audio/c7e5-f1.mp3?v=20261104'
  }
};

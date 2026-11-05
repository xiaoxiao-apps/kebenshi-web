/* content/physics_g8_v1_c7_s2/guide/guide-data.js — 弹力实验室（场景①形变研究所 elastic / 场景②测力计工作台 meter）
   clip 文本=屏幕字幕原文（语音同文），audio id→路径映射在 audios 单点；
   旧 clip（c7e4/c7e5 系列）say/fix/note 文本与 audio 文件名不变，trigger 按新页面状态字段重写；
   intro 换新文本（audio 同名覆盖）；新 clip c7n6~c7n10 文本逐字=设计书 v2 §4 新增表 */
window.C7S2_GUIDE={
  elastic:{
    intro:{text:'欢迎来到形变研究所！五种器材随你捏、拉、压，弹簧、直尺、橡皮筋、橡皮泥，还有一个看起来纹丝不动的玻璃瓶。看看谁的形变会恢复，谁的不会。',audio:'c7e4-intro'},
    steps:[
      {id:'c7e4-s1',repeat:true,queue:true,trigger:'R.e.restored===true && R.e.lastTool!==\'clay\' && R.e.permanent===false',say:'弹簧、直尺、橡皮筋松手后都回到原样，这种受力形变、不受力又恢复的性质叫弹性。',audio:'c7e4-s1'},
      {id:'c7e4-s2',repeat:true,queue:true,trigger:'R.e.released===true && R.e.lastTool===\'clay\'',say:'橡皮泥就不行了，按成什么样就是什么样，不能自动恢复的形变叫塑性形变。',audio:'c7e4-s2'},
      {id:'c7e4-s3',repeat:true,queue:true,trigger:'R.e.permanent===true',say:'打开超限度开关再使劲拉，松手后弹簧回不到原样了！弹性是有限度的，超过弹性限度就会永久变形。',audio:'c7e4-s3'},
      {id:'c7e4-s4',repeat:false,queue:true,trigger:'after:c7e4-s1@1500',say:'能自动恢复的物体有弹性，形变的物体要恢复原状时产生的力叫弹力。下一节的弹簧测力计就用这个原理！',audio:'c7e4-s4'},
      {id:'c7n6',repeat:false,queue:true,trigger:'R.e.tool===\'bottle\'',say:'最后这件器材是个硬邦邦的玻璃瓶，插着一根细管。使劲捏它，瓶子好像什么都没变。别急，盯住细管里的水柱看。',audio:'c7n6'},
      {id:'c7n7',repeat:false,queue:true,trigger:'R.e.tool===\'bottle\' && R.e.ts.bottle.def>=0.4',say:'手一捏，水柱升高了！瓶子的形变小得肉眼看不见，细管却把这个微小形变放大了。记住：再坚硬的物体，受力也会发生形变。',audio:'c7n7'}
    ],
    errors:[
      {id:'c7e4-e1',interval:15000,trigger:'R.e.pulling===true && R.e.force>0 && (G.t-R.e.pullT)>6000',fix:'还没松手呢，器材还被你拉着。点松手按钮，看看它恢不恢复。',audio:'c7e4-e1'}
    ],
    free:[
      {trigger:'R.e.triedCount>=2',note:'把四位选手都试一遍，先猜谁恢复、谁不恢复，再验证，看猜得准不准。',audio:'c7e4-f1'}
    ],
    tasks:[]
  },
  meter:{
    intro:{text:'欢迎来到测力计工作台！竖直挂钩码、水平拖木块都能测。先调零、认清量程和分度值，再动手。测完还要当一回考官，抓一抓错误操作的虫子。',audio:'c7e5-intro'},
    steps:[
      {id:'c7e5-s1',repeat:true,trigger:'(G.t-G.modeEnterT)>2500 && R.s.orient===\'v\' && R.s.v.zeroed===false',say:'指针没指零，点调零按钮把它对齐，不调零的话读数全是错的。',audio:'c7e5-s1'},
      {id:'c7e5-s2',repeat:true,queue:true,trigger:'R.s.orient===\'v\' && R.s.v.zeroed===true && R.s.v.count>=1 && R.s.v.settled===true',say:'钩码一个个挂上去，指针一步步走，弹簧越伸越长。弹性限度内，拉力越大，弹簧伸长量越大，这就是弹簧测力计的原理。',audio:'c7e5-s2'},
      {id:'c7e5-s3',repeat:false,queue:true,trigger:'after:c7e5-s2@2500',say:'钩码挂稳、指针停住再读数，看指针指到哪个刻度，别忘了单位是牛。',audio:'c7e5-s3'},
      {id:'c7e5-s4',repeat:true,queue:true,trigger:'R.s.orient===\'h\' && R.s.h.zeroed===true',say:'换成水平方向拉，用法要变，得在水平方向重新调零再测。再感受1牛、3牛、5牛的拉力，记住这个手感！',audio:'c7e5-s4'},
      {id:'c7n10',repeat:false,queue:true,trigger:'R.s.extTouched===true',say:'注意面板上这个数：伸长量等于现在长度减去原长。原理说的是拉力越大伸长量越大，不是长度越长。这一个字的差别，考试最爱挖坑。',audio:'c7n10'},
      {id:'c7n8',repeat:false,queue:true,trigger:'R.s.examOpen===true',say:'现在你来当考官。这四种用测力计的做法里藏着错误，把它们揪出来，还要说得出为什么错。',audio:'c7n8'},
      {id:'c7n9a',repeat:false,queue:true,trigger:'R.s.exam.c1.judged===true',say:'没调零就测量，指针不在零刻度，读出来的数就不是真实的力。先调零，再测量。',audio:'c7n9a'},
      {id:'c7n9b',repeat:false,queue:true,trigger:'R.s.exam.c2.judged===true',say:'超过了量程硬拉，弹簧会被拉坏，超过弹性限度就回不来了。测量前先看量程。',audio:'c7n9b'},
      {id:'c7n9c',repeat:false,queue:true,trigger:'R.s.exam.c3.judged===true',say:'斜着拉挂钩，弹簧轴线方向和力的方向不一致，读数会偏小，还容易让指针卡壳。要沿测力计的轴线方向拉。',audio:'c7n9c'}
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
    'c7e4-intro':'guide/audio/c7e4-intro.mp3?v=20261106',
    'c7e4-s1':'guide/audio/c7e4-s1.mp3?v=20261106','c7e4-s2':'guide/audio/c7e4-s2.mp3?v=20261106',
    'c7e4-s3':'guide/audio/c7e4-s3.mp3?v=20261106','c7e4-s4':'guide/audio/c7e4-s4.mp3?v=20261106',
    'c7e4-e1':'guide/audio/c7e4-e1.mp3?v=20261106','c7e4-f1':'guide/audio/c7e4-f1.mp3?v=20261106',
    'c7e5-intro':'guide/audio/c7e5-intro.mp3?v=20261106',
    'c7e5-s1':'guide/audio/c7e5-s1.mp3?v=20261106','c7e5-s2':'guide/audio/c7e5-s2.mp3?v=20261106',
    'c7e5-s3':'guide/audio/c7e5-s3.mp3?v=20261106','c7e5-s4':'guide/audio/c7e5-s4.mp3?v=20261106',
    'c7e5-e1':'guide/audio/c7e5-e1.mp3?v=20261106','c7e5-f1':'guide/audio/c7e5-f1.mp3?v=20261106',
    'c7n6':'guide/audio/c7n6.mp3?v=20261106','c7n7':'guide/audio/c7n7.mp3?v=20261106',
    'c7n8':'guide/audio/c7n8.mp3?v=20261106',
    'c7n9a':'guide/audio/c7n9a.mp3?v=20261106','c7n9b':'guide/audio/c7n9b.mp3?v=20261106',
    'c7n9c':'guide/audio/c7n9c.mp3?v=20261106',
    'c7n10':'guide/audio/c7n10.mp3?v=20261106'
  }
};

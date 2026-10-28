/* content/physics_g8_v1_c6_s1/guide/guide-data.js */
window.C6S1_GUIDE={
  refract:{
    intro:{text:'欢迎来到天平实验室！这个实验我们学着用天平测质量。先调平，再左物右码，跟我来！',audio:'c6s1-intro'},
    steps:[
      {id:'c6s1-s1',repeat:true,queue:true,trigger:'delay:10200',say:'好，第一步，天平放水平台，游码拨到左端零刻度。',audio:'c6s1-s1'},
      {id:'c6s1-s2',repeat:true,queue:true,trigger:'R.leveled===false && R.rider===0',say:'接下来旋平衡螺母，让指针指到分度盘中线。',audio:'c6s1-s2'},
      {id:'c6s1-s3',repeat:true,queue:true,trigger:'R.leveled===true',say:'太棒了，指针指中线，横梁调平啦！我们接着称。',audio:'c6s1-s3'},
      {id:'c6s1-s4a',repeat:true,queue:true,trigger:'R.leveled===true && R.obj===null@5800',say:'好，第二步，先在下方选一个被测物，橡皮泥、冰水烧杯，或者铅笔。',audio:'c6s1-s4a'},
      {id:'c6s1-s4b',repeat:true,queue:true,trigger:'R.leveled===true && R.obj!==null && R.onPan===false@1200',say:'选好啦！把它拖起来，轻轻放到天平的左侧托盘。',audio:'c6s1-s4b'},
      {id:'c6s1-s4',repeat:true,queue:true,trigger:'R.obj!==null && R.onPan===true',say:'好，物体放左盘，砝码放右盘，记住左物右码。',audio:'c6s1-s4'},
      {id:'c6s1-s5',repeat:true,queue:true,trigger:'R.onPan===true && R.panW.length>=1 && R.matched===false',say:'右盘加减砝码，由大到小试。不平衡就再调调。',audio:'c6s1-s5'},
      {id:'c6s1-s6',repeat:true,queue:true,trigger:'R.onPan===true && R.rider>0 && R.matched===false',say:'还差一点？微调游码，直到横梁再次平衡。',audio:'c6s1-s6'},
      {id:'c6s1-s7',repeat:true,queue:true,trigger:'R.matched===true && R.leveled===true',say:'平衡啦！读数等于砝码总质量加游码，游码看左边缘。',audio:'c6s1-s7'},
      {id:'c6s1-s8',repeat:false,queue:true,trigger:'after:c6s1-s7@6000',say:'通过实验我们发现：m等于砝码总质量加游码示数。记住它哦！',audio:'c6s1-s8'}
    ],
    errors:[
      {id:'c6s1-e1',queue:true,interval:15000,trigger:'R.matched===true && R.leveled===false',fix:'不对哟～还没调平，读数是错的，先调平再称。',audio:'c6s1-e1'},
      {id:'c6s1-e2',queue:true,interval:20000,trigger:'R.leveled===false && R.rider>0 && (G.t-G.modeEnterT)>28000',fix:'不对哟～调平前，先把游码移回零刻度线。',audio:'c6s1-e2'}
    ],
    free:[
      {trigger:'R.obj===\'clay\' && R.kneaded && R.seen.shape',note:'形状变了，读数不变——质量不随形状改变。',audio:'c6s1-f1'},
      {trigger:'R.leveled===true && Math.abs(R.g-9.8)>0.05',note:'换到别处重力变了，质量可不变哟。',audio:'c6s1-f2'},
      {trigger:'R.obj===\'ice\' && R.meltedOnce===true',note:'冰化成水物态变了，总质量不变。',audio:'c6s1-f3'}
    ],
    tasks:[]
  },
  audios:{
    'c6s1-intro':'guide/audio/c6s1-intro.mp3?v=20261027g1',
    'c6s1-s1':'guide/audio/c6s1-s1.mp3?v=20261027g1','c6s1-s2':'guide/audio/c6s1-s2.mp3?v=20261027g1',
    'c6s1-s3':'guide/audio/c6s1-s3.mp3?v=20261027g1','c6s1-s4':'guide/audio/c6s1-s4.mp3?v=20261027g1',
    'c6s1-s4a':'guide/audio/c6s1-s4a.mp3?v=20261027r4','c6s1-s4b':'guide/audio/c6s1-s4b.mp3?v=20261027r4',
    'c6s1-s5':'guide/audio/c6s1-s5.mp3?v=20261027g1','c6s1-s6':'guide/audio/c6s1-s6.mp3?v=20261027g1',
    'c6s1-s7':'guide/audio/c6s1-s7.mp3?v=20261027g1','c6s1-s8':'guide/audio/c6s1-s8.mp3?v=20261027g1',
    'c6s1-e1':'guide/audio/c6s1-e1.mp3','c6s1-e2':'guide/audio/c6s1-e2.mp3',
    'c6s1-f1':'guide/audio/c6s1-f1.mp3','c6s1-f2':'guide/audio/c6s1-f2.mp3',
    'c6s1-f3':'guide/audio/c6s1-f3.mp3'
  }
};
window.GUIDE_CFG={state:window.C6S1_STATE,mode:'refract'};
window.GUIDE_DATA=window.C6S1_GUIDE;

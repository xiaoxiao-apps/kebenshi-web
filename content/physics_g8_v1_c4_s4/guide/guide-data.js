'use strict';
/* c4s4 光的折射 · 语音讲解数据（设计书 docs/c4s4-guide-design.md §5 逐字搬入）*/
window.C4S4_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到光的折射实验台！空碗里的硬币看不见，倒水后又出现了——光在水面拐了弯。点亮激光笔，一起揭开折射的秘密吧。',
      audio:'c4s4-intro'
    },
    steps:[
      {id:'s1',repeat:true,trigger:"R.laserOn===true && R.medium==='water'",say:'灯亮啦！激光斜射进水里，光路在水面拐了个弯。',audio:'c4s4-s1'},
      {id:'s2',repeat:true,trigger:"R.laserOn===true && R.medium==='glass'",say:'换成玻璃砖啦！光弯得更狠，玻璃偏折本领比水强。',audio:'c4s4-s2'},
      {id:'s3',repeat:true,trigger:"event:input:#slider-i:R.laserOn===true",say:'入射角一变，折射角跟着变，但总是比入射角小。',audio:'c4s4-s3'},
      {id:'s4',repeat:true,trigger:"R.iDeg===0 && R.laserOn===true@1500",say:'垂直入射不拐弯，入射角折射角都是零度。',audio:'c4s4-s4'},
      {id:'s5',repeat:true,trigger:"R.showNormal===true",say:'虚线是法线，过入射点垂直界面，角都以它为准。',audio:'c4s4-s5'},
      {id:'s6',repeat:true,trigger:"R.showAngles===true",say:'蓝弧是入射角i，浅蓝是折射角r，比比谁大？',audio:'c4s4-s6'},
      {id:'s7',repeat:true,trigger:"R.showReflect===true && R.laserOn===true",say:'还有一条淡淡的光——界面处折射和反射同时发生。',audio:'c4s4-s7'},
      {id:'s8',repeat:true,trigger:"R.reverse===true && R.laserOn===true",say:'光路可逆！光逆着折射光线射入，会逆着入射光线射出。',audio:'c4s4-s8'},
      {id:'concl',repeat:true,trigger:"after:s8@6000",say:'因此我们得出结论：光从空气斜射入水或玻璃时，向法线偏折，折射角小于入射角；入射角增大折射角也增大，折射中光路可逆。',audio:'c4s4-concl'}
    ],
    errors:[
      {id:'e1',trigger:"event:click:#chk-angles:R.showAngles===false && R.laserOn===false",fix:'不对哟～先点亮激光笔，有了光路才好研究角呀。',audio:'c4s4-e1'},
      {id:'e2',trigger:"event:input:#slider-i:R.laserOn===false",fix:'不对哟～先点亮激光笔，光都没射出去，看不到折射哟。',audio:'c4s4-e2'},
      {id:'e3',trigger:"event:click:#chk-angles:R.showAngles===false && R.laserOn===true && R.showNormal===false",fix:'不对哟～先勾「法线标注」，两个角都以法线为基准呢。',audio:'c4s4-e3'}
    ],
    free:[
      {trigger:"event:click:#btn-water:R.laserOn===true && R.medium==='glass'",note:'换回水槽啦，光在水面弯得温和了一点。',audio:'c4s4-f1'},
      {trigger:"R.medium==='glass' && R.laserOn===false",note:'玻璃砖就位，点亮激光笔就能看到光路。',audio:'c4s4-f2'},
      {trigger:"R.showReflect===true && R.laserOn===false",note:'微弱反射线要亮着灯才现身，开下激光笔吧。',audio:'c4s4-f3'},
      {trigger:"event:click:#btn-reset",note:'回到起点：水槽、入射角四十度、激光关闭。',audio:'c4s4-f4'}
    ],
    tasks:[]
  },
  audios:{
    'c4s4-intro':'guide/audio/c4s4-intro.mp3',
    'c4s4-s1':'guide/audio/c4s4-s1.mp3',
    'c4s4-s2':'guide/audio/c4s4-s2.mp3',
    'c4s4-s3':'guide/audio/c4s4-s3.mp3',
    'c4s4-s4':'guide/audio/c4s4-s4.mp3',
    'c4s4-s5':'guide/audio/c4s4-s5.mp3',
    'c4s4-s6':'guide/audio/c4s4-s6.mp3',
    'c4s4-s7':'guide/audio/c4s4-s7.mp3',
    'c4s4-s8':'guide/audio/c4s4-s8.mp3',
    'c4s4-concl':'guide/audio/c4s4-concl.mp3',
    'c4s4-e1':'guide/audio/c4s4-e1.mp3',
    'c4s4-e2':'guide/audio/c4s4-e2.mp3',
    'c4s4-e3':'guide/audio/c4s4-e3.mp3',
    'c4s4-f1':'guide/audio/c4s4-f1.mp3',
    'c4s4-f2':'guide/audio/c4s4-f2.mp3',
    'c4s4-f3':'guide/audio/c4s4-f3.mp3',
    'c4s4-f4':'guide/audio/c4s4-f4.mp3'
  }
};
window.GUIDE_DATA=window.C4S4_GUIDE;

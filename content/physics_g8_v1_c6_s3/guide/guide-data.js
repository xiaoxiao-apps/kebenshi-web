/* content/physics_g8_v1_c6_s3/guide/guide-data.js */
window.C6S3_GUIDE={
  s1:{
    intro:{text:'先配一杯盐水：用天平测质量，量筒测体积，再用ρ等于m除以V算密度。',audio:'c6s3-s1-intro'},
    steps:[
      {id:'c6s3-s1-s1',repeat:true,trigger:'R.s1.rho>1.01',say:'盐溶化了，盐水密度比清水大。',audio:'c6s3-s1-s1'},
      {id:'c6s3-s1-s2',repeat:true,trigger:'R.s1.m1!==null',say:'记下m₁：烧杯和盐水的总质量。',audio:'c6s3-s1-s2'},
      {id:'c6s3-s1-s3',repeat:true,trigger:'R.s1.pouring===true',say:'沿壁缓倒，把部分盐水倒入量筒。',audio:'c6s3-s1-s3'},
      {id:'c6s3-s1-s4',repeat:true,trigger:'R.s1.vConf!==null',say:'平视凹液面最低处，读出体积V。',audio:'c6s3-s1-s4'},
      {id:'c6s3-s1-s5',repeat:true,trigger:'R.s1.m2!==null',say:'再称杯和剩余盐水m₂，m等于m₁减m₂。',audio:'c6s3-s1-s5'},
      {id:'c6s3-s1-s6',repeat:true,trigger:'after:c6s3-s1-s5@6000',say:'因此我们得出结论：盐水密度ρ等于m除以V。',audio:'c6s3-s1-s6'}
    ],
    errors:[
      {id:'c6s3-s1-e1',trigger:'R.s1.cylMl>0.5 && (R.s1.eyeT<0.15||R.s1.eyeT>0.85)',fix:'不对哟～要平视凹液面最低处再读数。',audio:'c6s3-s1-e1'}
    ],
    free:[
      {trigger:'R.eyeDrag===true && R.stage===\'s1\'',note:'上下拖眼睛，视线与凹液面相平再读数。',audio:'c6s3-s1-f1'},
      {trigger:'R.s1.rho>=1.05',note:'ρ达到1.05，空瘪粒上浮，能选种啦！',audio:'c6s3-s1-f2'}
    ],
    tasks:[]
  },
  s2:{
    intro:{text:'不规则的小石块：天平测质量，排水法测体积，V等于V₂减V₁。',audio:'c6s3-s2-intro'},
    steps:[
      {id:'c6s3-s2-s1',repeat:true,trigger:'R.s2.cur.m!==null',say:'石块的质量m测好了。',audio:'c6s3-s2-s1'},
      {id:'c6s3-s2-s2',repeat:true,trigger:'R.s2.cur.v1!==null',say:'量筒装适量水，平视读出V₁。',audio:'c6s3-s2-s2'},
      {id:'c6s3-s2-s3',repeat:true,trigger:'R.s2.stone!==null && R.s2.stone.loc===\'cyl\' && !R.s2.stone.sinkTw && R.s2.cur.v2===null',say:'石块沉底，水位升高的体积就是它的体积。',audio:'c6s3-s2-s3'},
      {id:'c6s3-s2-s4',repeat:true,trigger:'R.s2.cur.v2!==null',say:'读出总体积V₂，V等于V₂减V₁。',audio:'c6s3-s2-s4'},
      {id:'c6s3-s2-s5',repeat:true,trigger:'after:c6s3-s2-s4@6000',say:'因此我们得出结论：石块密度ρ等于m除以V。',audio:'c6s3-s2-s5'}
    ],
    errors:[
      {id:'c6s3-s2-e1',trigger:'R.s2.cur.v2!==null && R.s2.cur.m===null',fix:'不对哟～应先测质量，沾水再称m会偏大。',audio:'c6s3-s2-e1'}
    ],
    free:[
      {trigger:'R.s2.rows.length>=1',note:'换块石头再测：同种物质，密度一定。',audio:'c6s3-s2-f1'}
    ],
    tasks:[]
  },
  audios:{
    'c6s3-s1-intro':'guide/audio/c6s3-s1-intro.mp3',
    'c6s3-s1-s1':'guide/audio/c6s3-s1-s1.mp3','c6s3-s1-s2':'guide/audio/c6s3-s1-s2.mp3',
    'c6s3-s1-s3':'guide/audio/c6s3-s1-s3.mp3','c6s3-s1-s4':'guide/audio/c6s3-s1-s4.mp3',
    'c6s3-s1-s5':'guide/audio/c6s3-s1-s5.mp3','c6s3-s1-s6':'guide/audio/c6s3-s1-s6.mp3',
    'c6s3-s1-e1':'guide/audio/c6s3-s1-e1.mp3',
    'c6s3-s1-f1':'guide/audio/c6s3-s1-f1.mp3','c6s3-s1-f2':'guide/audio/c6s3-s1-f2.mp3',
    'c6s3-s2-intro':'guide/audio/c6s3-s2-intro.mp3',
    'c6s3-s2-s1':'guide/audio/c6s3-s2-s1.mp3','c6s3-s2-s2':'guide/audio/c6s3-s2-s2.mp3',
    'c6s3-s2-s3':'guide/audio/c6s3-s2-s3.mp3','c6s3-s2-s4':'guide/audio/c6s3-s2-s4.mp3',
    'c6s3-s2-s5':'guide/audio/c6s3-s2-s5.mp3','c6s3-s2-e1':'guide/audio/c6s3-s2-e1.mp3',
    'c6s3-s2-f1':'guide/audio/c6s3-s2-f1.mp3'
  }
};
window.GUIDE_CFG={state:window.C6S3_STATE,get mode(){return window.C6S3_STATE.stage;}};
window.GUIDE_DATA=window.C6S3_GUIDE;

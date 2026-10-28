/* content/physics_g8_v1_c6_s3/guide/guide-data.js */
window.C6S3_GUIDE={
  s1:{
    intro:{text:'欢迎来到盐水密度实验！我们要测出盐水的密度。先用天平测质量，量筒测体积，跟我来！',audio:'c6s3-s1-intro'},
    steps:[
      {id:'c6s3-s1-s0',repeat:true,trigger:'delay:10200',say:'好，第一步，先配制盐水：把盐罐拖起来，悬在烧杯口上方，盐就会慢慢溶进水里。',audio:'c6s3-s1-s0'},
      {id:'c6s3-s1-s1',repeat:true,trigger:'R.s1.rho>1.01',say:'好，盐溶化啦！盐水密度比清水大，我们来测一测。',audio:'c6s3-s1-s1'},
      {id:'c6s3-s1-s1a',repeat:true,trigger:'R.s1.m1===null && R.s1.beaker.loc===\'bench\' && (R.s1.rho>1.01 || G.t-G.modeEnterT>9000)',say:'第二步，把烧杯拖到天平左侧托盘，等横梁平稳后，点天平上方的「记录 m₁」。',audio:'c6s3-s1-s1a'},
      {id:'c6s3-s1-s2',repeat:true,trigger:'R.s1.m1!==null',say:'好，m₁记下了，就是烧杯和盐水的总质量。',audio:'c6s3-s1-s2'},
      {id:'c6s3-s1-s2a',repeat:true,trigger:'R.s1.m1!==null && R.s1.cylMl<0.5 && !R.s1.pouring && R.s1.beaker.loc!==\'drag\'',say:'第三步，把烧杯拖到量筒口上方悬住，让一部分盐水沿壁倒进量筒，倒三四十毫升就行。',audio:'c6s3-s1-s2a'},
      {id:'c6s3-s1-s3',repeat:true,trigger:'R.s1.pouring===true',say:'对，沿壁缓倒，注意看量筒液面在上升。',audio:'c6s3-s1-s3'},
      {id:'c6s3-s1-s3a',repeat:true,trigger:'R.s1.cylMl>0.5 && R.s1.vConf===null && R.s1.beaker.loc!==\'drag\' && Math.abs(R.s1.eyeT-0.5)>0.077',say:'第四步读体积：在右边特写区上下拖动眼睛，让视线跟凹液面最低处相平——俯视读数偏大、仰视偏小；平视后点「✓ 确认读数」。',audio:'c6s3-s1-s3a'},
      {id:'c6s3-s1-s4',repeat:true,trigger:'R.s1.vConf!==null',say:'好，平视凹液面最低处，体积V读出来了。',audio:'c6s3-s1-s4'},
      {id:'c6s3-s1-s4a',repeat:true,trigger:'R.s1.vConf!==null && R.s1.m2===null',say:'第五步，把烧杯和剩余盐水放回天平左盘，横梁平稳后点「记录 m₂」。',audio:'c6s3-s1-s4a'},
      {id:'c6s3-s1-s5',repeat:true,trigger:'R.s1.m2!==null',say:'好，m₂也有了：量筒里盐水的质量m等于m₁减m₂，密度ρ等于m除以V，已经自动算好填进表。',audio:'c6s3-s1-s5'},
      {id:'c6s3-s1-s6',repeat:true,trigger:'after:c6s3-s1-s5@11500',say:'通过实验我们发现：盐水密度ρ等于m除以V。记住它哦！',audio:'c6s3-s1-s6'}
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
    intro:{text:'欢迎来到小石块密度实验！我们用天平测质量，排水法测体积，跟我来！',audio:'c6s3-s2-intro'},
    steps:[
      {id:'c6s3-s2-s0',repeat:true,trigger:'delay:8200',say:'好，第一步先测质量：把石块拖到天平左盘，等横梁平稳，质量会自动记下来。',audio:'c6s3-s2-s0'},
      {id:'c6s3-s2-s1',repeat:true,trigger:'R.s2.cur.m!==null',say:'好，石块质量m测好啦！接下来测体积。',audio:'c6s3-s2-s1'},
      {id:'c6s3-s2-s1a',repeat:true,trigger:'R.s2.cur.m!==null && !R.s2.injected',say:'第二步，点一下空量筒，注入约六十毫升适量的水。',audio:'c6s3-s2-s1a'},
      {id:'c6s3-s2-s2a',repeat:true,trigger:'R.s2.injected && R.s2.cur.v1===null && !(R.s2.stone&&R.s2.stone.loc===\'cyl\') && Math.abs(R.s2.eyeT-0.5)>0.077',say:'第三步，把特写区眼睛拖到平视，读出V₁，再点「✓ 确认读数」。',audio:'c6s3-s2-s2a'},
      {id:'c6s3-s2-s2',repeat:true,trigger:'R.s2.cur.v1!==null',say:'好，V₁读出来了。',audio:'c6s3-s2-s2'},
      {id:'c6s3-s2-s3a',repeat:true,trigger:'R.s2.cur.v1!==null && R.s2.stone!==null && R.s2.stone.loc===\'bench\'',say:'第四步，把石块拖进量筒。',audio:'c6s3-s2-s3a'},
      {id:'c6s3-s2-s3',repeat:true,trigger:'R.s2.stone!==null && R.s2.stone.loc===\'cyl\' && !R.s2.stone.sinkTw',say:'看，石块沉底啦，说明它密度比水大；水位升高的体积就是它的体积。',audio:'c6s3-s2-s3'},
      {id:'c6s3-s2-s4a',repeat:true,trigger:'R.s2.stone!==null && R.s2.stone.loc===\'cyl\' && !R.s2.stone.sinkTw && R.s2.cur.v2===null && Math.abs(R.s2.eyeT-0.5)>0.077',say:'第五步，水面平稳后平视读出V₂，点确认；石块体积V等于V₂减V₁。',audio:'c6s3-s2-s4a'},
      {id:'c6s3-s2-s4',repeat:true,trigger:'R.s2.cur.v2!==null',say:'好，V₂读出，V等于V₂减V₁。',audio:'c6s3-s2-s4'},
      {id:'c6s3-s2-s5',repeat:true,trigger:'after:c6s3-s2-s4@4900',say:'通过实验我们发现：石块密度ρ等于m除以V。还能点「换石块」再测。',audio:'c6s3-s2-s5'}
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
    'c6s3-s1-intro':'guide/audio/c6s3-s1-intro.mp3?v=20261027g1',
    'c6s3-s1-s0':'guide/audio/c6s3-s1-s0.mp3?v=20261027r4',
    'c6s3-s1-s1':'guide/audio/c6s3-s1-s1.mp3?v=20261027g1',
    'c6s3-s1-s1a':'guide/audio/c6s3-s1-s1a.mp3?v=20261027r4',
    'c6s3-s1-s2':'guide/audio/c6s3-s1-s2.mp3?v=20261027r4','c6s3-s1-s2a':'guide/audio/c6s3-s1-s2a.mp3?v=20261027r4',
    'c6s3-s1-s3':'guide/audio/c6s3-s1-s3.mp3?v=20261027r4','c6s3-s1-s3a':'guide/audio/c6s3-s1-s3a.mp3?v=20261027r4',
    'c6s3-s1-s4':'guide/audio/c6s3-s1-s4.mp3?v=20261027r4','c6s3-s1-s4a':'guide/audio/c6s3-s1-s4a.mp3?v=20261027r4',
    'c6s3-s1-s5':'guide/audio/c6s3-s1-s5.mp3?v=20261027r4','c6s3-s1-s6':'guide/audio/c6s3-s1-s6.mp3?v=20261027g1',
    'c6s3-s1-e1':'guide/audio/c6s3-s1-e1.mp3',
    'c6s3-s1-f1':'guide/audio/c6s3-s1-f1.mp3','c6s3-s1-f2':'guide/audio/c6s3-s1-f2.mp3',
    'c6s3-s2-intro':'guide/audio/c6s3-s2-intro.mp3?v=20261027g1',
    'c6s3-s2-s0':'guide/audio/c6s3-s2-s0.mp3?v=20261027r4',
    'c6s3-s2-s1':'guide/audio/c6s3-s2-s1.mp3?v=20261027r4','c6s3-s2-s1a':'guide/audio/c6s3-s2-s1a.mp3?v=20261027r4',
    'c6s3-s2-s2a':'guide/audio/c6s3-s2-s2a.mp3?v=20261027r4','c6s3-s2-s2':'guide/audio/c6s3-s2-s2.mp3?v=20261027r4',
    'c6s3-s2-s3a':'guide/audio/c6s3-s2-s3a.mp3?v=20261027r4','c6s3-s2-s3':'guide/audio/c6s3-s2-s3.mp3?v=20261027r4',
    'c6s3-s2-s4a':'guide/audio/c6s3-s2-s4a.mp3?v=20261027r4','c6s3-s2-s4':'guide/audio/c6s3-s2-s4.mp3?v=20261027r4',
    'c6s3-s2-s5':'guide/audio/c6s3-s2-s5.mp3?v=20261027r4','c6s3-s2-e1':'guide/audio/c6s3-s2-e1.mp3',
    'c6s3-s2-f1':'guide/audio/c6s3-s2-f1.mp3'
  }
};
window.GUIDE_CFG={state:window.C6S3_STATE,get mode(){return window.C6S3_STATE.stage;}};
window.GUIDE_DATA=window.C6S3_GUIDE;

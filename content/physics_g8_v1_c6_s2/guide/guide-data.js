/* content/physics_g8_v1_c6_s2/guide/guide-data.js */
window.C6S2_GUIDE={
  refract:{
    intro:{text:'欢迎来到密度实验室！密度是物质的身份数值，ρ等于m除以V。先称质量，再测体积，跟我来！',audio:'c6s2-intro'},
    steps:[
      {id:'c6s2-s1',repeat:true,trigger:'delay:11300',say:'好，先在下方选材质和大小，把物块拖去天平和量筒。',audio:'c6s2-s1'},
      {id:'c6s2-s2',repeat:true,trigger:'R.scene===\'e3\' && R.e3.mKnown===true',say:'称出质量m啦！接下来拖进量筒测体积。',audio:'c6s2-s2'},
      {id:'c6s2-s3',repeat:true,trigger:'R.scene===\'e3\' && R.e3.vKnown===true',say:'好，用排水法，水位差就是物块的体积。',audio:'c6s2-s3'},
      {id:'c6s2-s4',repeat:true,trigger:'R.scene===\'e3\' && R.e3.records.length>=1',say:'m和V都齐啦！它们的比值自动记入表格。',audio:'c6s2-s4'},
      {id:'c6s2-s5',repeat:true,trigger:'R.scene===\'e3\' && R.e3.records.length>=2',say:'看，同种物质的点连成一条过原点的直线。',audio:'c6s2-s5'},
      {id:'c6s2-s6',repeat:true,trigger:'R.scene===\'e3\' && R.e3.records.some(function(a){return R.e3.records.some(function(b){return a.mat!==b.mat;});})',say:'好，接下来换种物质再测，看看比值一样吗。',audio:'c6s2-s6'},
      {id:'c6s2-s7',repeat:true,trigger:'after:c6s2-s6@6000',say:'通过实验我们发现：同种物质质量与体积成正比。记住它哦！',audio:'c6s2-s7'},
      {id:'c6s2-s8',repeat:true,trigger:'R.scene===\'e5\' && R.e5.blocks.some(function(b){return b.solved;})',say:'太棒了，算出密度查表对号，物质身份揭晓！',audio:'c6s2-s8'}
    ],
    errors:[
      {id:'c6s2-e1',trigger:'event:click:#btn-submit:R.scene===\'e5\'&&(!R.e5.blocks[R.e5.sel].mKnown||!R.e5.blocks[R.e5.sel].vKnown)',fix:'不对哟～先称质量再测体积，都测完才能鉴别。',audio:'c6s2-e1'},
      {id:'c6s2-e2',trigger:'event:click:#btn-submit:R.scene===\'e5\'&&R.e5.blocks[R.e5.sel].mKnown&&R.e5.blocks[R.e5.sel].vKnown&&!R.e5.blocks[R.e5.sel].guess',fix:'不对哟～先查密度表，选个材质再提交。',audio:'c6s2-e2'}
    ],
    free:[
      {trigger:'R.scene===\'e4\' && !R.e4.dual && R.e4.single && (R.e4.single.m/R.e4.single.v)>=1',note:'这块密度比水大，沉底了。',audio:'c6s2-f1'},
      {trigger:'R.scene===\'e4\' && !R.e4.dual && R.e4.single && (R.e4.single.m/R.e4.single.v)<1',note:'密度比水小，它漂起来啦！',audio:'c6s2-f2'},
      {trigger:'R.scene===\'e5\' && R.e5.blocks.some(function(b){return b.loc===\'cyl\';})',note:'水位升高了多少，体积就是多少。',audio:'c6s2-f3'}
    ],
    tasks:[]
  },
  audios:{
    'c6s2-intro':'guide/audio/c6s2-intro.mp3?v=20261027g1',
    'c6s2-s1':'guide/audio/c6s2-s1.mp3?v=20261027g1','c6s2-s2':'guide/audio/c6s2-s2.mp3?v=20261027g1',
    'c6s2-s3':'guide/audio/c6s2-s3.mp3?v=20261027g1','c6s2-s4':'guide/audio/c6s2-s4.mp3?v=20261027g1',
    'c6s2-s5':'guide/audio/c6s2-s5.mp3?v=20261027g1','c6s2-s6':'guide/audio/c6s2-s6.mp3?v=20261027g1',
    'c6s2-s7':'guide/audio/c6s2-s7.mp3?v=20261027g1','c6s2-s8':'guide/audio/c6s2-s8.mp3?v=20261027g1',
    'c6s2-e1':'guide/audio/c6s2-e1.mp3','c6s2-e2':'guide/audio/c6s2-e2.mp3',
    'c6s2-f1':'guide/audio/c6s2-f1.mp3','c6s2-f2':'guide/audio/c6s2-f2.mp3',
    'c6s2-f3':'guide/audio/c6s2-f3.mp3'
  }
};
window.GUIDE_CFG={state:window.C6S2_STATE,mode:'refract'};
window.GUIDE_DATA=window.C6S2_GUIDE;

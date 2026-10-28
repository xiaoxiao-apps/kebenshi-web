/* content/physics_g8_v1_c5_s1/guide/guide-data.js */
/* 语音R2接线波C1：设计书 docs/c5-guide-design-part1.md §A-5 逐字搬入；
   delay 回填（afinfo 实测+1s 取整百）：b-s1 13000→10300（b-intro 9.312s）、f-s1 13000→10600（f-intro 9.624s） */
window.C5S1_GUIDE={
  bench:{
    intro:{text:'欢迎来到透镜光学台！凸透镜会聚光，凹透镜发散光。拖出光源和透镜，看看光路怎么变～',audio:'c5s1-b-intro'},
    steps:[
      {id:'c5s1-b-s1',repeat:true,trigger:'delay:10300',say:'从左上角托盘拖出光源，点一下本体点亮它。',audio:'c5s1-b-s1'},
      {id:'c5s1-b-s2',repeat:true,trigger:'R.bench.source!==null && (R.bench.source.type===\'bulb\' ? R.bench.source.on!==true : !(R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))',say:'点光源上的红色按钮开光，光沿直线传播。',audio:'c5s1-b-s2'},
      {id:'c5s1-b-s3',repeat:true,trigger:'R.bench.lens===null && R.bench.source!==null && (R.bench.source.type===\'bulb\' ? R.bench.source.on===true : (R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))',say:'没有透镜时光沿直线走，把透镜拖到主轴上。',audio:'c5s1-b-s3'},
      {id:'c5s1-b-s4',repeat:true,trigger:'R.bench.lens!==null && R.bench.lens.kind===\'convex\' && R.bench.source!==null && (R.bench.source.type===\'bulb\' ? R.bench.source.on===true : (R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))',say:'平行光经凸透镜，会聚在另一侧的焦点F。',audio:'c5s1-b-s4'},
      {id:'c5s1-b-s5',repeat:true,trigger:'R.bench.lens!==null && R.bench.lens.kind===\'concave\' && R.bench.source!==null && (R.bench.source.type===\'bulb\' ? R.bench.source.on===true : (R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))',say:'凹透镜让光发散，反向延长线交在虚焦点。',audio:'c5s1-b-s5'},
      {id:'c5s1-b-s6',repeat:true,trigger:'R.bench.source!==null && R.bench.source.type===\'bulb\' && R.bench.source.on===true && R.bench.source.snapped===true && R.bench.lens!==null',say:'焦点发出的光出来变平行光，光路可逆！',audio:'c5s1-b-s6'},
      {id:'c5s1-b-s7',repeat:true,trigger:'after:c5s1-b-s6@6000',say:'因此我们得出结论：凸透镜会聚光，凹透镜发散光。',audio:'c5s1-b-s7'}
    ],
    errors:[
      {id:'c5s1-b-e1',trigger:'event:change:#cb-virtual:R.bench.lens!==null&&R.bench.lens.kind===\'concave\'&&!document.getElementById(\'cb-virtual\').checked',fix:'不对哟～没有虚线就看不到虚焦点啦，勾回来吧。',audio:'c5s1-b-e1'},
      {id:'c5s1-b-e2',trigger:'R.bench.source!==null && R.bench.source.type===\'pens\' && R.bench.lens!==null && R.bench.source.x>=R.bench.lens.x',fix:'不对哟～光源要放在透镜左边，拖回来吧。',audio:'c5s1-b-e2'}
    ],
    free:[
      {trigger:'event:input:#rng-f:R.bench.lens!==null',note:'焦距越短，会聚作用越强哦。',audio:'c5s1-b-f1'},
      {trigger:'event:input:#rng-d:R.bench.lens!==null',note:'直径只改通光量，不改焦距哦。',audio:'c5s1-b-f2'},
      {trigger:'event:click:#btn-flow',note:'蓝色脉冲在指示光的传播方向。',audio:'c5s1-b-f3'},
      {trigger:'R.bench.source!==null && R.bench.source.type===\'bulb\' && R.bench.source.on===true && R.bench.lens!==null',note:'过光心的光，传播方向不变。',audio:'c5s1-b-f4'}
    ],
    tasks:[]
  },
  focal:{
    intro:{text:'阳光可以看作平行光！平行光经凸透镜会聚于焦点。移动光屏，找最小最亮的光斑测焦距。',audio:'c5s1-f-intro'},
    steps:[
      {id:'c5s1-f-s1',repeat:true,trigger:'delay:10600',say:'阳光可看作平行光，移动光屏找最小最亮的光斑。',audio:'c5s1-f-s1'},
      {id:'c5s1-f-s2',repeat:true,trigger:'R.focal.screen.atF===true',say:'光斑最小最亮！屏到透镜的距离就是焦距f。',audio:'c5s1-f-s2'},
      {id:'c5s1-f-s3',repeat:true,trigger:'after:c5s1-f-s2@6000',say:'因此我们得出结论：光斑到透镜的距离就是焦距f。',audio:'c5s1-f-s3'}
    ],
    errors:[],
    free:[
      {trigger:'event:click:#btn-table',note:'读数面板能随时查看屏透镜距离和光斑状态。',audio:'c5s1-f-f1'},
      {trigger:'(G.t-G.modeEnterT)>12000 && R.focal.screen.atF===false',note:'还没到焦点哦，光斑又大又暗，继续移动光屏。',audio:'c5s1-f-f2'},
      {trigger:'event:input:#rng-f:R.scene===\'focal\'',note:'焦距变了，焦点位置也跟着变，重新找找光屏位置。',audio:'c5s1-f-f3'}
    ],
    tasks:[]
  },
  audios:{
    'c5s1-b-intro':'guide/audio/c5s1-b-intro.mp3',
    'c5s1-b-s1':'guide/audio/c5s1-b-s1.mp3','c5s1-b-s2':'guide/audio/c5s1-b-s2.mp3',
    'c5s1-b-s3':'guide/audio/c5s1-b-s3.mp3','c5s1-b-s4':'guide/audio/c5s1-b-s4.mp3',
    'c5s1-b-s5':'guide/audio/c5s1-b-s5.mp3','c5s1-b-s6':'guide/audio/c5s1-b-s6.mp3',
    'c5s1-b-s7':'guide/audio/c5s1-b-s7.mp3',
    'c5s1-b-e1':'guide/audio/c5s1-b-e1.mp3','c5s1-b-e2':'guide/audio/c5s1-b-e2.mp3',
    'c5s1-b-f1':'guide/audio/c5s1-b-f1.mp3','c5s1-b-f2':'guide/audio/c5s1-b-f2.mp3',
    'c5s1-b-f3':'guide/audio/c5s1-b-f3.mp3','c5s1-b-f4':'guide/audio/c5s1-b-f4.mp3',
    'c5s1-f-intro':'guide/audio/c5s1-f-intro.mp3',
    'c5s1-f-s1':'guide/audio/c5s1-f-s1.mp3','c5s1-f-s2':'guide/audio/c5s1-f-s2.mp3',
    'c5s1-f-s3':'guide/audio/c5s1-f-s3.mp3',
    'c5s1-f-f1':'guide/audio/c5s1-f-f1.mp3','c5s1-f-f2':'guide/audio/c5s1-f-f2.mp3',
    'c5s1-f-f3':'guide/audio/c5s1-f-f3.mp3'
  }
};
window.GUIDE_CFG={state:window.C5S1_STATE,get mode(){return window.C5S1_STATE.scene;}};
window.GUIDE_DATA=window.C5S1_GUIDE;

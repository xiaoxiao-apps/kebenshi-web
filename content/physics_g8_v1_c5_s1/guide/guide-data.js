/* content/physics_g8_v1_c5_s1/guide/guide-data.js */
/* 语音R2接线波C1：设计书 docs/c5-guide-design-part1.md §A-5 逐字搬入；
   delay 回填（afinfo 实测+1s 取整百）：b-s1 13000→10300（b-intro 9.312s）、f-s1 13000→10600（f-intro 9.624s）
   R8-2（蔡总 2026-10-29 01:17 条1）：focal 场景 f-s1/f-s2/f-s3/f-f2 加 queue:true，f-s2/f-s3 改 repeat:false
   （根治 f-s2 电平+repeat 每 3s 自我复读、连带 f-s3 定时器反复重排）；bench 场景删凸/凹分开两条结论，
   改 b-s8 一条统一结论（凸凹全测完才发火，旗标 everConvex/everConcave 由 core 置位） */
/* R9-2（蔡总 2026-10-29 09:40 条1a/条5e延伸）：①bench 首条引导 b-s1 裸 delay:10300 → 电平边沿型
   '(G.t-G.modeEnterT)>10300 && R.bench.source===null' + queue:true（欢迎词真播完才播、已拖光源永久闭嘴）；
   ②f-s2/f-s3 音频重录去掉裸字母 f（屏幕 say 保留符号）。core 侧同轮补画凸透镜左侧物方焦点 F′ */
window.C5S1_GUIDE={
  bench:{
    intro:{text:'欢迎来到透镜光学台！凸透镜会聚光，凹透镜发散光。拖出光源和透镜，看看光路怎么变～',audio:'c5s1-b-intro'},
    steps:[
      /* R9-2（蔡总 2026-10-29 09:40 条1a）：b-s1 裸 delay:10300 → 电平边沿型+queue。
         病根同 c5s1-f-s1/c5s2 三场景 s1：delay 分支不求值条件、从进页起算，欢迎词（b-intro 9.312s，
         且要等用户点「开启语音」才开口）没说完就到点抢播；且用户已拖出光源后到点照播=过期引导。
         门 R.bench.source===null：已拖光源则此条永久闭嘴；queue:true=等欢迎词真播完再播。 */
      {id:'c5s1-b-s1',repeat:true,queue:true,trigger:'(G.t-G.modeEnterT)>10300 && R.bench.source===null',say:'从左上角托盘拖出光源，点一下本体点亮它。',audio:'c5s1-b-s1'},
      {id:'c5s1-b-s2',repeat:true,trigger:'R.bench.source!==null && (R.bench.source.type===\'bulb\' ? R.bench.source.on!==true : !(R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))',say:'点光源上的红色按钮开光，光沿直线传播。',audio:'c5s1-b-s2'},
      {id:'c5s1-b-s3',repeat:true,trigger:'R.bench.lens===null && R.bench.source!==null && (R.bench.source.type===\'bulb\' ? R.bench.source.on===true : (R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))',say:'没有透镜时光沿直线走，把透镜拖到主轴上。',audio:'c5s1-b-s3'},
      {id:'c5s1-b-s4',repeat:true,queue:true,trigger:'R.bench.lens!==null && R.bench.lens.kind===\'convex\' && R.bench.source!==null && (R.bench.source.type===\'bulb\' ? R.bench.source.on===true : (R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))',say:'平行光通过凸透镜汇聚到一点，我们把这一点称之为凸透镜的焦点，焦点到凸透镜中心的距离称之为焦距。',audio:'c5s1-b-s4'},
      {id:'c5s1-b-s5',repeat:true,queue:true,trigger:'R.bench.lens!==null && R.bench.lens.kind===\'concave\' && R.bench.source!==null && (R.bench.source.type===\'bulb\' ? R.bench.source.on===true : (R.bench.source.on[0]||R.bench.source.on[1]||R.bench.source.on[2]))',say:'凹透镜让光发散，反向延长线交在虚焦点。',audio:'c5s1-b-s5'},
      {id:'c5s1-b-s6',repeat:true,queue:true,trigger:'R.bench.source!==null && R.bench.source.type===\'bulb\' && R.bench.source.on===true && R.bench.source.snapped===true && R.bench.lens!==null',say:'焦点发出的光出来变平行光，光路可逆！',audio:'c5s1-b-s6'},
      /* R8-2（蔡总 2026-10-29 01:17 条1b）：R7 拆的「凸/凹分开两条结论」删掉，改「凸凹全测完再播一条统一结论」；
         everConvex/everConcave 由 core 在光源点亮+透镜就位+光路真的画出来时置位（state.bench 直暴露 → R.bench.*） */
      {id:'c5s1-b-s8',repeat:false,queue:true,trigger:'R.bench.everConvex===true && R.bench.everConcave===true',say:'通过刚才的实验我们发现：凸透镜对光有会聚作用，凹透镜对光有发散作用。记住它哦！',audio:'c5s1-b-s8'}
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
      /* R8-2（蔡总 01:17 条1a）：f-s2 自我复读根治——旧 repeat:true + 电平 trigger（光屏停在焦点上条件持续为真）
         → 引擎 REP_COOLDOWN=3000 每 3s 重播一次自己打断自己；且每重播 fireCount[f-s2]+1 → f-s3 的 after@6000
         定时器被反复重排 → 结论总落在 f-s2 播到一半时插入。光屏到位=一次性事件 → repeat:false + queue:true，
         f-s2 只发火一次 → f-s3 定时器只排一次（6s > f-s2 音频 5.208s 有余量） */
      {id:'c5s1-f-s1',repeat:true,queue:true,trigger:'(G.t-G.modeEnterT)>10600 && R.focal.screen.atF===false',say:'阳光可看作平行光，移动光屏找最小最亮的光斑。',audio:'c5s1-f-s1'},/* R8主会话热修：delay型改电平型+atF===false门——实测打桩秒到焦点时，delay:10600 的开场引导会在 s2「光斑最小最亮」之后才播=过期引导（delay 分支不求值 expr 无法加门，改电平边沿型）；已找到焦点则此引导永不播（蔡总「做到哪步播哪步，过去的不再播」）；未找到焦点超10.6s照播 */
      /* R9-2（蔡总 09:40 条5e延伸）：f-s2/f-s3 音频重录=TTS 文本去掉裸字母 f（「焦距f」→「焦距」），
         屏幕 say 保留符号 f 不动（屏上 F/2F/f 标注是教材写法，只改读音） */
      {id:'c5s1-f-s2',repeat:false,queue:true,trigger:'R.focal.screen.atF===true',say:'光斑最小最亮！屏到透镜的距离就是焦距f。',audio:'c5s1-f-s2'},
      {id:'c5s1-f-s3',repeat:false,queue:true,trigger:'after:c5s1-f-s2@6000',say:'因此我们得出结论：光斑到透镜的距离就是焦距f。',audio:'c5s1-f-s3'}
    ],
    errors:[],
    free:[
      {trigger:'event:click:#btn-table',note:'读数面板能随时查看屏透镜距离和光斑状态。',audio:'c5s1-f-f1'},
      /* R8-2：f-f2 是电平型解说（非用户动作）→ 加 queue:true 不掐在播条；f-f1/f-f3 是 event 型用户动作 → 不加 queue（一操作立即打断） */
      {trigger:'(G.t-G.modeEnterT)>12000 && R.focal.screen.atF===false',queue:true,note:'还没到焦点哦，光斑又大又暗，继续移动光屏。',audio:'c5s1-f-f2'},
      {trigger:'event:input:#rng-f:R.scene===\'focal\'',note:'焦距变了，焦点位置也跟着变，重新找找光屏位置。',audio:'c5s1-f-f3'}
    ],
    tasks:[]
  },
  audios:{
    'c5s1-b-intro':'guide/audio/c5s1-b-intro.mp3',
    'c5s1-b-s1':'guide/audio/c5s1-b-s1.mp3','c5s1-b-s2':'guide/audio/c5s1-b-s2.mp3',
    'c5s1-b-s3':'guide/audio/c5s1-b-s3.mp3','c5s1-b-s4':'guide/audio/c5s1-b-s4.mp3?v=20261028v7',
    'c5s1-b-s5':'guide/audio/c5s1-b-s5.mp3','c5s1-b-s6':'guide/audio/c5s1-b-s6.mp3',
    /* R8-2：R7 的凸/凹两条分开结论音频键删除（mp3 文件留盘不删）；统一结论音频新录 */
    'c5s1-b-s8':'guide/audio/c5s1-b-s8.mp3?v=20261029v2',
    'c5s1-b-e1':'guide/audio/c5s1-b-e1.mp3','c5s1-b-e2':'guide/audio/c5s1-b-e2.mp3',
    'c5s1-b-f1':'guide/audio/c5s1-b-f1.mp3','c5s1-b-f2':'guide/audio/c5s1-b-f2.mp3',
    'c5s1-b-f3':'guide/audio/c5s1-b-f3.mp3','c5s1-b-f4':'guide/audio/c5s1-b-f4.mp3',
    'c5s1-f-intro':'guide/audio/c5s1-f-intro.mp3',
    'c5s1-f-s1':'guide/audio/c5s1-f-s1.mp3','c5s1-f-s2':'guide/audio/c5s1-f-s2.mp3?v=20261029v4',
    'c5s1-f-s3':'guide/audio/c5s1-f-s3.mp3?v=20261029v4',
    'c5s1-f-f1':'guide/audio/c5s1-f-f1.mp3','c5s1-f-f2':'guide/audio/c5s1-f-f2.mp3',
    'c5s1-f-f3':'guide/audio/c5s1-f-f3.mp3'
  }
};
window.GUIDE_CFG={state:window.C5S1_STATE,get mode(){return window.C5S1_STATE.scene;}};
window.GUIDE_DATA=window.C5S1_GUIDE;

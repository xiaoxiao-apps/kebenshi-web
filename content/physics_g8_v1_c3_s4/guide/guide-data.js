'use strict';
/* c3s4 升华凝华观察站 · B 语音版数据（§D/§4；G1波按A5-G3引导语规范改写文案）。R=window.C3S4_STATE（§D-1 Proxy 暴露）。
   f2 引用 window.SublimationPour.state（POUR 已暴露 exp-subl-pour.js:1348-1350；trigger 经
   new Function 求值可访问全局作用域）。state.mode 恒 'iodine'，GUIDE_CFG.mode='refract' 强制单场景 key。 */
window.C3S4_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到升华凝华观察站！碘不经过液态就能固态气态来回变，是真的吗？先猜一猜，再动手验证，跟我来！',
      audio:'c3s4-intro'
    },
    steps:[
      {id:'s1',repeat:true,trigger:"R.guessDone===true",say:'猜好啦？那就点「浇热水」，看碘怎么变身。',audio:'c3s4-s1'},
      {id:'s2',trigger:"R.phase==='sublimate' && R.vapor<0.35",say:'热水一浇，碘直接冒出紫色蒸气，没化成液体！',audio:'c3s4-s2'},
      {id:'s3',repeat:true,trigger:'after:s2@5200',say:'这就是升华：固态直接变气态，还要吸热。',audio:'c3s4-s3'},/* Q6防互踢：s2实测4.896s→5200ms后接播；sublimAnnounced旧trigger弃用（页面旗标保留供UI定义卡） */
      {id:'s4',trigger:"R.phase==='deposit' && R.wallCrystal<0.25",say:'浇冷水啦，紫色蒸气变淡，要变回固态了。',audio:'c3s4-s4'},
      {id:'s5',repeat:true,trigger:'after:s4@4800',say:'器壁挂上亮晶晶的碘晶体，这叫凝华，放热。',audio:'c3s4-s5'},/* Q6防互踢：s4实测4.440s→4800ms后接播 */
      {id:'s6',repeat:true,trigger:"R.phase==='deposit' && R.vapor<=0.05 && R.wallCrystal>0.25",say:'蒸气散尽啦！全程固气互变没有液态，你发现了吗？',audio:'c3s4-s6'},
      /* R3-K3（蔡总反馈9）：结论改「现象→本质命名」完整句式，超25字上限拆4条 after 链；
         延时=前条 mp3 afinfo 实测+300（s7:5.064s→5400 / s8:3.672s→4000 / s9:4.920s→5200）；
         与 s3/s5 即时命名刻意差异化：结论带主语+完整现象句+「这种现象叫做」正式定义句式 */
      {id:'s7',repeat:true,trigger:'after:s6@6000',say:'固态碘受热，不经过液态直接变成紫色碘蒸气。',audio:'c3s4-s7'},
      {id:'s8',repeat:true,trigger:'after:s7@5400',say:'这种现象叫做升华，升华要吸热。',audio:'c3s4-s8'},
      {id:'s9',repeat:true,trigger:'after:s8@4000',say:'碘蒸气遇冷，不经过液态直接变成固态碘晶体。',audio:'c3s4-s9'},
      {id:'s10',repeat:true,trigger:'after:s9@5200',say:'这种现象叫做凝华，凝华要放热。',audio:'c3s4-s10'}
    ],
    errors:[
      {id:'e1',trigger:"event:click:#btn-cold:R.vapor<=0 && R.phase!=='sublimate'",fix:'不对哟～还没有碘蒸气呢，先点「浇热水」吧。',audio:'c3s4-e1'},
      {id:'e2',trigger:"R.paused===true && R.phase!=='idle'@2000",fix:'不对哟～时间暂停了，点「开始」变化才继续哦。',audio:'c3s4-e2'}
    ],
    free:[
      {trigger:"event:change:#hot-select",note:'热水越热升华越快，换个温度再试试？',audio:'c3s4-f1'},
      {trigger:"window.SublimationPour.state.animPhase==='pour' && window.SublimationPour.state.animType==='hot'",note:'热水正浇在容器上，热量传进去，碘要升华咯。',audio:'c3s4-f2'},
      {trigger:"event:change:#iodine-select",note:'碘颗粒的量变啦，越多蒸气越浓，换个量看看？',audio:'c3s4-f3'}
    ]
  },
  audios:{
    'c3s4-intro':'guide/audio/c3s4-intro.mp3?v=20261027g1',
    'c3s4-s1':'guide/audio/c3s4-s1.mp3',
    'c3s4-s2':'guide/audio/c3s4-s2.mp3',
    'c3s4-s3':'guide/audio/c3s4-s3.mp3',
    'c3s4-s4':'guide/audio/c3s4-s4.mp3',
    'c3s4-s5':'guide/audio/c3s4-s5.mp3',
    'c3s4-s6':'guide/audio/c3s4-s6.mp3?v=20261027g1',
    'c3s4-s7':'guide/audio/c3s4-s7.mp3?v=20261028v1',
    'c3s4-s8':'guide/audio/c3s4-s8.mp3?v=20261028v1',
    'c3s4-s9':'guide/audio/c3s4-s9.mp3?v=20261028v1',
    'c3s4-s10':'guide/audio/c3s4-s10.mp3?v=20261028v1',
    'c3s4-e1':'guide/audio/c3s4-e1.mp3',
    'c3s4-e2':'guide/audio/c3s4-e2.mp3',
    'c3s4-f1':'guide/audio/c3s4-f1.mp3?v=20261027g1',
    'c3s4-f2':'guide/audio/c3s4-f2.mp3',
    'c3s4-f3':'guide/audio/c3s4-f3.mp3?v=20261027g1'
  }
};
window.GUIDE_DATA=window.C3S4_GUIDE;

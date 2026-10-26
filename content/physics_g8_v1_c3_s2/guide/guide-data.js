'use strict';
/* c3s2 熔化凝固探究馆 · B 语音版数据（§B/§4）。R=window.C3S2_STATE（§B-1 Proxy 暴露）。
   mode 由引擎轮询 R.mode 自动切（melt→freeze 转场自动播 freeze intro）。
   熔化晶体线 s1→s2→s3→s4；熔化石蜡线 s1→s4（s4 用 hold 表达式双路覆盖：晶体全熔旗标 或 石蜡变软旗标，
   持续6s才播）。石蜡熔化无自动凝固（meltedFrac 恒 0），需 btn-pre-melt 进 freeze（S2-core:1023-1043）走 s7→s9；
   凝固晶体线 s5→s6→s8。 */
window.C3S2_GUIDE={
  melt:{
    intro:{
      text:'欢迎来到熔化凝固探究馆！海波和石蜡要在水浴里加热，看晶体怎么熔化、非晶体怎么变软。点燃酒精灯，开始记温度吧！',
      audio:'c3s2-intro-melt'
    },
    steps:[
      {id:'s1',repeat:true,trigger:"R.heating===true && R.phaseName==='固态'",say:'酒精灯点着啦，水浴传热，样品温度慢慢升。',audio:'c3s2-s1'},
      {id:'s2',repeat:true,trigger:"R.phaseName==='固液共存' && R.sample!=='paraffin'",say:'到熔点啦！晶体边吸热边熔化，温度停住不动。',audio:'c3s2-s2'},
      {id:'s3',repeat:true,trigger:"R.fullyMeltedAnnounced===true",say:'全化成液体啦，温度又开始往上升咯。',audio:'c3s2-s3'},
      {id:'s4',repeat:true,trigger:"(R.fullyMeltedAnnounced===true || (R.sample==='paraffin' && R.paraffinHeatAnnounced===true))@6000",say:'因此我们得出结论：晶体熔化要吸热，但有固定熔点，熔化中温度不变；非晶体像石蜡，没有熔点，边熔化边升温。',audio:'c3s2-s4'}
    ],
    errors:[
      {id:'e1',trigger:"R.paused===true && R.heating===true@3000",fix:'不对哟～还暂停着呢，点「开始」实验才会跑哦。',audio:'c3s2-e1'},
      {id:'e2',trigger:"R.heating===false && R.simTime>0 && R.meltedFrac<=0 && R.sampleTemp<=R.ambTemp+1@5000",fix:'灯灭啦，样品到不了熔点哟～重新点燃酒精灯吧。',audio:'c3s2-e2'}
    ],
    free:[
      {trigger:"event:input:#amb-slider:R.mode==='melt'",note:'环境温度一变，散热快慢跟着变，升温节奏不同啦。',audio:'c3s2-f1'},
      {trigger:"R.sample==='paraffin' && R.paraffinHeatAnnounced===true",note:'石蜡没有熔点，边吸热边变软变稀，温度一直升。',audio:'c3s2-f2'}
    ]
  },
  freeze:{
    intro:{
      text:'灯熄啦，进入凝固阶段！晶体凝固时温度也会保持不变吗？石蜡呢？盯紧温度计。',
      audio:'c3s2-intro-freeze'
    },
    steps:[
      {id:'s5',repeat:true,trigger:"R.phaseName==='固液共存' && R.sample!=='paraffin'",say:'到凝固点啦！边放热边凝固，温度也不变。',audio:'c3s2-s5'},
      {id:'s6',repeat:true,trigger:'after:s5@6000',say:'同一种晶体，凝固点和熔点相同，都是那个温度。',audio:'c3s2-s6'},
      {id:'s7',repeat:true,trigger:"R.sample==='paraffin' && R.mode==='freeze' && R.phaseName==='变稠变硬'",say:'石蜡没有凝固点，边放热边变稠，温度一直降。',audio:'c3s2-s7'},
      {id:'s8',repeat:true,trigger:'after:s6@6000',say:'因此我们得出结论：晶体凝固要放热，有固定凝固点，凝固中温度不变，凝固点和熔点相同。',audio:'c3s2-s8'},
      {id:'s9',repeat:true,trigger:'after:s7@6000',say:'因此我们得出结论：非晶体凝固没有固定温度，边放热边变稠变硬，温度持续下降。',audio:'c3s2-s9'}
    ],
    errors:[],
    free:[
      {trigger:"R.freezeAnnotationShown===true",note:'看标注：海波凝固点48℃，跟熔点一模一样。',audio:'c3s2-f3'}
    ]
  },
  audios:{
    'c3s2-intro-melt':'guide/audio/c3s2-intro-melt.mp3',
    'c3s2-intro-freeze':'guide/audio/c3s2-intro-freeze.mp3',
    'c3s2-s1':'guide/audio/c3s2-s1.mp3',
    'c3s2-s2':'guide/audio/c3s2-s2.mp3',
    'c3s2-s3':'guide/audio/c3s2-s3.mp3',
    'c3s2-s4':'guide/audio/c3s2-s4.mp3',
    'c3s2-s5':'guide/audio/c3s2-s5.mp3',
    'c3s2-s6':'guide/audio/c3s2-s6.mp3',
    'c3s2-s7':'guide/audio/c3s2-s7.mp3',
    'c3s2-s8':'guide/audio/c3s2-s8.mp3',
    'c3s2-s9':'guide/audio/c3s2-s9.mp3',
    'c3s2-e1':'guide/audio/c3s2-e1.mp3',
    'c3s2-e2':'guide/audio/c3s2-e2.mp3',
    'c3s2-f1':'guide/audio/c3s2-f1.mp3',
    'c3s2-f2':'guide/audio/c3s2-f2.mp3',
    'c3s2-f3':'guide/audio/c3s2-f3.mp3'
  }
};
window.GUIDE_DATA=window.C3S2_GUIDE;

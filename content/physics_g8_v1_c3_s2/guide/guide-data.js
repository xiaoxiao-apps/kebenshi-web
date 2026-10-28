'use strict';
/* c3s2 熔化凝固探究馆 · B 语音版数据（§B/§4；G1波按A5-G3引导语规范改写文案）。R=window.C3S2_STATE（§B-1 Proxy 暴露）。
   mode 由引擎轮询 R.mode 自动切（melt→freeze 转场自动播 freeze intro）。
   R2：steps 头部 s0（event:input:#sample-select）衔接「先选样品再点灯」；熔化晶体线 s1→s2→s3→s4a；熔化石蜡线 s1→s4b
   （s4a/s4b 按 R.sample 分流，hold@6000 才播；样品无关文案，冰亦走 s4a）。石蜡熔化无自动凝固（meltedFrac 恒 0），
   需 btn-pre-melt 进 freeze（S2-core:1023-1043）走 s7→s9；凝固晶体线 s5→s6→s8。 */
window.C3S2_GUIDE={
  melt:{
    intro:{
      text:'欢迎来到熔化凝固探究馆！先在右侧选好样品：海波是晶体，石蜡是非晶体，冰也是晶体。选好样品，点燃酒精灯，跟我来！',
      audio:'c3s2-intro-melt'
    },
    steps:[
      {id:'s0',repeat:true,trigger:"event:input:#sample-select",say:'好，样品选定了！接下来点燃酒精灯，开始加热吧。',audio:'c3s2-s0'},
      {id:'s1',repeat:true,trigger:"R.heating===true && R.phaseName==='固态'",say:'酒精灯点着啦！水浴传热，样品温度慢慢升，盯紧温度计。',audio:'c3s2-s1'},
      {id:'s2',repeat:true,trigger:"R.phaseName==='固液共存' && R.sample!=='paraffin'",say:'到熔点啦！晶体边吸热边熔化，温度停住不动，看到了吗？',audio:'c3s2-s2'},
      {id:'s3',repeat:true,trigger:"R.fullyMeltedAnnounced===true",say:'全化成液体啦！接下来看温度，它又开始往上升咯。',audio:'c3s2-s3'},
      {id:'s4a',repeat:true,trigger:"R.sample!=='paraffin' && R.fullyMeltedAnnounced===true@6000",say:'通过刚才的实验，我们发现：晶体熔化时要吸热，但温度保持在熔点不变。记住它哦！',audio:'c3s2-s4a'},
      {id:'s4b',repeat:true,trigger:"R.sample==='paraffin' && R.paraffinHeatAnnounced===true@6000",say:'通过刚才的实验，我们发现：石蜡是非晶体，没有熔点，边吸热边变软，温度一直上升。记住它哦！',audio:'c3s2-s4b'}
    ],
    errors:[
      {id:'e1',trigger:"R.paused===true && R.heating===true@3000",fix:'不对哟～还暂停着呢，点「继续」按钮恢复，实验才会跑哦。',audio:'c3s2-e1'},
      {id:'e2',trigger:"R.heating===false && R.simTime>0 && R.meltedFrac<=0 && R.sampleTemp<=R.ambTemp+1@5000",fix:'灯灭啦，样品到不了熔点哟～重新点燃酒精灯吧。',audio:'c3s2-e2'}
    ],
    free:[
      {trigger:"event:input:#amb-slider:R.mode==='melt'",note:'环境温度一变，升温节奏就不同，换个数值再试试？',audio:'c3s2-f1'},
      {trigger:"R.sample==='paraffin' && R.paraffinHeatAnnounced===true",note:'石蜡没有熔点，边吸热边变软，温度一直升，接着看吧。',audio:'c3s2-f2'}
    ]
  },
  freeze:{
    intro:{
      text:'灯熄啦，进入凝固阶段！晶体凝固时温度也不变吗？石蜡呢？盯紧温度计找答案，跟我来！',
      audio:'c3s2-intro-freeze'
    },
    steps:[
      {id:'s5',repeat:true,trigger:"R.phaseName==='固液共存' && R.sample!=='paraffin'",say:'到凝固点啦！边放热边凝固，温度也不变，看到了吗？',audio:'c3s2-s5'},
      {id:'s6',repeat:true,trigger:'after:s5@6000',say:'好，记住啦：同种晶体凝固点和熔点相同，都是那个温度。',audio:'c3s2-s6'},
      {id:'s7',repeat:true,trigger:"R.sample==='paraffin' && R.mode==='freeze' && R.phaseName==='变稠变硬'",say:'石蜡没有凝固点，边放热边变稠，温度一直降，看到了吗？',audio:'c3s2-s7'},
      {id:'s8',repeat:true,trigger:'after:s6@6000',say:'通过刚才的实验，我们发现：晶体凝固放热、温度不变，凝固点就是熔点。记住它哦！',audio:'c3s2-s8'},
      {id:'s9',repeat:true,trigger:'after:s7@6000',say:'通过刚才的实验，我们发现：非晶体凝固没有固定温度，边放热边变硬。记住它哦！',audio:'c3s2-s9'}
    ],
    errors:[],
    free:[
      {trigger:"R.freezeAnnotationShown===true",note:'看到标注啦！海波凝固点48℃，跟熔点一模一样。',audio:'c3s2-f3'}
    ]
  },
  audios:{
    'c3s2-intro-melt':'guide/audio/c3s2-intro-melt.mp3?v=20261027r4',
    'c3s2-intro-freeze':'guide/audio/c3s2-intro-freeze.mp3?v=20261027g1',
    'c3s2-s0':'guide/audio/c3s2-s0.mp3?v=20261027r4',
    'c3s2-s1':'guide/audio/c3s2-s1.mp3?v=20261027g1',
    'c3s2-s2':'guide/audio/c3s2-s2.mp3?v=20261027g1',
    'c3s2-s3':'guide/audio/c3s2-s3.mp3?v=20261027g1',
    'c3s2-s4a':'guide/audio/c3s2-s4a.mp3?v=20261027r4',
    'c3s2-s4b':'guide/audio/c3s2-s4b.mp3?v=20261027r4',
    'c3s2-s5':'guide/audio/c3s2-s5.mp3?v=20261027g1',
    'c3s2-s6':'guide/audio/c3s2-s6.mp3?v=20261027g1',
    'c3s2-s7':'guide/audio/c3s2-s7.mp3?v=20261027g1',
    'c3s2-s8':'guide/audio/c3s2-s8.mp3?v=20261027g1',
    'c3s2-s9':'guide/audio/c3s2-s9.mp3?v=20261027g1',
    'c3s2-e1':'guide/audio/c3s2-e1.mp3?v=20261027r2',
    'c3s2-e2':'guide/audio/c3s2-e2.mp3',
    'c3s2-f1':'guide/audio/c3s2-f1.mp3?v=20261027g1',
    'c3s2-f2':'guide/audio/c3s2-f2.mp3?v=20261027g1',
    'c3s2-f3':'guide/audio/c3s2-f3.mp3?v=20261027g1'
  }
};
window.GUIDE_DATA=window.C3S2_GUIDE;

'use strict';
/* c3s1 温度实验室 · B 语音版数据（docs/c3-guide-design.md §A/§4 逐条搬入；G1波按A5-G3引导语规范改写文案）
   R=window.C3S1_STATE（§A-1 暴露：state+paused/thermometers 不可枚举 getter）。
   s3 为 event 型 step，依赖 §0.5 引擎微补丁（bindEventTriggers 的 steps 分发）。 */
window.C3S1_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到温度实验室！凭感觉判冷热不可靠，这个实验我们用温度计把0℃和100℃定下来。先插上温度计，跟我来！',
      audio:'c3s1-intro'
    },
    steps:[
      {id:'s1',repeat:true,trigger:"R.thermometers.length>=1",say:'温度计插进水里啦！等示数稳定再读数，你看到了吗？',audio:'c3s1-s1'},
      {id:'s2',repeat:true,trigger:"R.thermometers.some(t=>t.type==='clinical'&&!t.inWater)",say:'咦，体温计离开水读数却不降，缩口在起作用，发现了吗？',audio:'c3s1-s2'},
      {id:'s3',repeat:true,trigger:"event:click:#clinical-shake:R.thermometers.some(t=>t.type==='clinical'&&!t.inWater)",say:'甩一甩，水银退回玻璃泡，读数就复位啦。',audio:'c3s1-s3'},
      {id:'s4',repeat:true,trigger:"R.heating===true && R.heatPower>0",say:'开始加热啦！水温一点点往上爬，盯紧读数看它怎么升。',audio:'c3s1-s4'},
      {id:'s5',repeat:true,trigger:"R.iceMass>0 && R.waterTemp<=0.5",say:'看，冰水混合物！温度稳稳停在0℃，你看到了吗？',audio:'c3s1-s5'},
      {id:'s6',repeat:true,trigger:"R.heating && R.waterTemp>=99.5",say:'沸腾啦！气泡涌到水面，温度停在100℃不动咯。',audio:'c3s1-s6'},
      {id:'s7',repeat:true,trigger:'after:s6@6000',say:'通过刚才的实验，我们发现：冰水混合物0℃、沸水100℃，测温要用温度计。记住它哦！',audio:'c3s1-s7'},
      {id:'s8',repeat:true,trigger:"R.heating===false && R.simTime>0 && R.iceMass<=0",say:'加热关闭啦。好，接下来我们看看水温怎么随时间慢慢降下来。',audio:'c3s1-s8'}
    ],
    errors:[
      {id:'e1',trigger:"event:click:#btn-heat:R.heatPower===0 && !R.heating",fix:'不对哟～功率还是0，先把加热功率调大，再开加热呀。',audio:'c3s1-e1'},
      {id:'e2',trigger:"R.paused===true && (R.heating===true || R.iceMass>0)@3000",fix:'不对哟～时间还暂停着呢，点「继续」按钮恢复，温度才会动哦。',audio:'c3s1-e2'}
    ],
    free:[
      {trigger:"event:input:#power-slider:R.heating===true",note:'加热功率越大，水温升得越快，换个功率再试试？',audio:'c3s1-f1'},
      {trigger:"R.iceMass>0 && R.waterTemp>5",note:'冰在吸热熔化，水温往下掉，盯着读数看变化吧。',audio:'c3s1-f2'},
      {trigger:"event:input:#amb-slider:R.simTime>0",note:'环境温度一变，水最后凉到的温度也变，再拖拖看？',audio:'c3s1-f3'},
      {trigger:"R.selectedThermometer!=null && R.thermometers.some(t=>t.id===R.selectedThermometer && t.type!=='clinical')",note:'观察温度计架：不同温度计量程不同——实验室的能测零下20到110摄氏度，电子的零下30到120，瓶式的没有刻度。测之前先想想会不会超量程哦！',audio:'c3s1-f4'},
      {trigger:"R.selectedThermometer!=null && R.thermometers.some(t=>t.id===R.selectedThermometer && t.type==='clinical')",note:'你选的是体温计！量程只有35到42摄氏度，分度值0.1度，缩口让它离开人体读数也不降。测之前一定先看当前温度超没超量程，超过42度会把玻璃管胀破！',audio:'c3s1-f5'},
      {trigger:"R.thermometers.some(t=>t.type==='clinical' && t.inWater) && R.waterTemp>=42",note:'哎呀，水温超过体温计的量程42摄氏度啦！快把它拿出来，换成实验室温度计吧！',audio:'c3s1-f6'},
      {trigger:"event:click:#btn-ice",cooldown:1000,note:'加冰啦！冰块吸热熔化，注意看水温有什么变化。',audio:'c3s1-f7'}
    ]
  },
  audios:{
    'c3s1-intro':'guide/audio/c3s1-intro.mp3?v=20261027g1',
    'c3s1-s1':'guide/audio/c3s1-s1.mp3?v=20261027g1',
    'c3s1-s2':'guide/audio/c3s1-s2.mp3?v=20261027g1',
    'c3s1-s3':'guide/audio/c3s1-s3.mp3',
    'c3s1-s4':'guide/audio/c3s1-s4.mp3?v=20261027g1',
    'c3s1-s5':'guide/audio/c3s1-s5.mp3?v=20261027g1',
    'c3s1-s6':'guide/audio/c3s1-s6.mp3?v=20261027g1',
    'c3s1-s7':'guide/audio/c3s1-s7.mp3?v=20261027g1',
    'c3s1-s8':'guide/audio/c3s1-s8.mp3',
    'c3s1-e1':'guide/audio/c3s1-e1.mp3',
    'c3s1-e2':'guide/audio/c3s1-e2.mp3?v=20261027r2',
    'c3s1-f1':'guide/audio/c3s1-f1.mp3?v=20261027g1',
    'c3s1-f2':'guide/audio/c3s1-f2.mp3?v=20261027g1',
    'c3s1-f3':'guide/audio/c3s1-f3.mp3?v=20261027g1',
    'c3s1-f4':'guide/audio/c3s1-f4.mp3',
    'c3s1-f5':'guide/audio/c3s1-f5.mp3',
    'c3s1-f6':'guide/audio/c3s1-f6.mp3',
    'c3s1-f7':'guide/audio/c3s1-f7.mp3'
  }
};
window.GUIDE_DATA=window.C3S1_GUIDE;

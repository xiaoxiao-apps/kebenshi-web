'use strict';
/* c3s1 温度实验室 · B 语音版数据（docs/c3-guide-design.md §A/§4 逐条搬入；文案逐字照抄，禁改写）
   R=window.C3S1_STATE（§A-1 暴露：state+paused/thermometers 不可枚举 getter）。
   s3 为 event 型 step，依赖 §0.5 引擎微补丁（bindEventTriggers 的 steps 分发）。 */
window.C3S1_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到温度实验室！凭感觉判冷热不可靠，要用温度计。插上温度计读读数，加热看升温，加冰看看0℃，烧开看看100℃，把摄氏温标定下来吧！',
      audio:'c3s1-intro'
    },
    steps:[
      {id:'s1',repeat:true,trigger:"R.thermometers.length>=1",say:'温度计插进水里啦！等示数稳定了再读数哦。',audio:'c3s1-s1'},
      {id:'s2',repeat:true,trigger:"R.thermometers.some(t=>t.type==='clinical'&&!t.inWater)",say:'体温计离开水，读数却不降，缩口在起作用。',audio:'c3s1-s2'},
      {id:'s3',repeat:true,trigger:"event:click:#clinical-shake:R.thermometers.some(t=>t.type==='clinical'&&!t.inWater)",say:'甩一甩，水银退回玻璃泡，读数就复位啦。',audio:'c3s1-s3'},
      {id:'s4',repeat:true,trigger:"R.heating===true && R.heatPower>0",say:'开始加热啦，水温一点点往上爬，盯紧读数。',audio:'c3s1-s4'},
      {id:'s5',repeat:true,trigger:"R.iceMass>0 && R.waterTemp<=0.5",say:'冰水混合物！温度稳稳停在0℃不动。',audio:'c3s1-s5'},
      {id:'s6',repeat:true,trigger:"R.heating && R.waterTemp>=99.5",say:'沸腾啦！气泡涌到水面，温度停在100℃。',audio:'c3s1-s6'},
      {id:'s7',repeat:true,trigger:'after:s6@6000',say:'因此我们得出结论：标准大气压下，冰水混合物是0℃，沸水是100℃；测温度不能靠感觉，要用温度计。',audio:'c3s1-s7'}
    ],
    errors:[
      {id:'e1',trigger:"event:click:#btn-heat:R.heatPower===0 && !R.heating",fix:'不对哟～功率还是0，先把加热功率调大，再开加热呀。',audio:'c3s1-e1'},
      {id:'e2',trigger:"R.paused===true && (R.heating===true || R.iceMass>0)@3000",fix:'不对哟～时间还暂停着呢，点「开始」，温度才会动哦。',audio:'c3s1-e2'}
    ],
    free:[
      {trigger:"event:input:#power-slider:R.heating===true",note:'加热功率越大，水温升得越快。',audio:'c3s1-f1'},
      {trigger:"R.iceMass>0 && R.waterTemp>5",note:'冰在吸热熔化，水温一点点往下掉。',audio:'c3s1-f2'},
      {trigger:"event:input:#amb-slider:R.simTime>0",note:'环境温度一变，水最后凉到的温度也跟着变。',audio:'c3s1-f3'}
    ]
  },
  audios:{
    'c3s1-intro':'guide/audio/c3s1-intro.mp3',
    'c3s1-s1':'guide/audio/c3s1-s1.mp3',
    'c3s1-s2':'guide/audio/c3s1-s2.mp3',
    'c3s1-s3':'guide/audio/c3s1-s3.mp3',
    'c3s1-s4':'guide/audio/c3s1-s4.mp3',
    'c3s1-s5':'guide/audio/c3s1-s5.mp3',
    'c3s1-s6':'guide/audio/c3s1-s6.mp3',
    'c3s1-s7':'guide/audio/c3s1-s7.mp3',
    'c3s1-e1':'guide/audio/c3s1-e1.mp3',
    'c3s1-e2':'guide/audio/c3s1-e2.mp3',
    'c3s1-f1':'guide/audio/c3s1-f1.mp3',
    'c3s1-f2':'guide/audio/c3s1-f2.mp3',
    'c3s1-f3':'guide/audio/c3s1-f3.mp3'
  }
};
window.GUIDE_DATA=window.C3S1_GUIDE;

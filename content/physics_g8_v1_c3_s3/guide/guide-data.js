'use strict';
/* c3s3 汽化液化探究馆 · B 语音版数据（§C/§4）。R=window.C3S3_STATE（§C-1 Proxy 暴露）。
   「气泡」均为物理沸腾气泡（bubbleRegime S3-phys:29-34），与 UI 无关，解说正常讲。
   R.liquefy.* 全部带 R.liquefy&& 守卫（init 早于引擎 tick，防御 bfcache）。
   evap 子台用 R.evapSub 闸门；「涂酒精」按钮无 id（§0.4.6），用 alcohol[0] 电平引导（f5）。 */
window.C3S3_GUIDE={
  boil:{
    intro:{
      text:'欢迎来到汽化液化探究馆！先烧水：沸腾前的气泡和沸腾时有什么不同？水烧开后温度还升吗？点燃酒精灯找答案。',
      audio:'c3s3-intro-boil'
    },
    steps:[
      {id:'s1',repeat:true,trigger:"R.heating===true && !R.boiling && R.waterTemp<60",say:'点火啦！水开始吸热升温，盯紧温度计。',audio:'c3s3-s1'},
      {id:'s2',repeat:true,trigger:"R.bubbleRegime==='collapse'",say:'杯底冒出小气泡，上升遇冷又变小消失了。',audio:'c3s3-s2'},
      {id:'s3',repeat:true,trigger:"R.heating && !R.boiling && R.waterTemp>=60 && R.waterTemp<85",say:'响水不开！气泡破裂最吵的时候，还没沸腾。',audio:'c3s3-s3'},
      {id:'s4',repeat:true,trigger:"R.heating && !R.boiling && R.waterTemp>=85",say:'开水不响～声音反而变小，马上就要沸腾啦。',audio:'c3s3-s4'},
      {id:'s5',repeat:true,trigger:"R.boiling===true",say:'沸腾啦！气泡上升越变越大，到水面破裂。',audio:'c3s3-s5'},
      {id:'s6',repeat:true,trigger:'after:s5@6000',say:'继续吸热，温度却停在沸点不变，看曲线平了！',audio:'c3s3-s6'},
      {id:'s7',repeat:true,trigger:'after:s6@6000',say:'因此我们得出结论：水沸腾前温度不断升高；沸腾后继续吸热，温度保持在沸点不变。',audio:'c3s3-s7'}
    ],
    errors:[
      {id:'e1',trigger:"R.paused===true && R.heating===true@3000",fix:'不对哟～时间暂停着呢，点「开始」水温才会升哦。',audio:'c3s3-e1'}
    ],
    free:[
      {trigger:"event:input:#amb-slider:R.heating===true",note:'环境温度一拖，水温也跟着跳，重新加热看看。',audio:'c3s3-f1'},
      {trigger:"R.lid==='sealed' && R.heating && !R.boiling",note:'密封盖压住蒸气，气压升高，要到102.5℃才沸。',audio:'c3s3-f2'},
      {trigger:"R.heating===false && R.waterTemp<95 && R.waterTemp>R.ambTemp+3",note:'灯熄了，水慢慢凉下来，向环境温度靠过去。',audio:'c3s3-f3'}
    ]
  },
  evap:{
    intro:{
      text:'沸腾要到沸点才发生，蒸发却任何温度都在进行。这里有三个小台子：拖滑杆比蒸发快慢，涂酒精感受蒸发致冷，还能纸锅烧水！切子标签玩起来。',
      audio:'c3s3-intro-evap'
    },
    steps:[
      {id:'s8',repeat:true,trigger:"R.evapSub==='factors' && R.evap.factors.temp>35",say:'液体温度调高了，蒸发一下子变快啦。',audio:'c3s3-s8'},
      {id:'s9',repeat:true,trigger:"R.evapSub==='factors' && R.evap.factors.area>1.5",say:'表面积摊大了，蒸发更快，衣服摊开干得快。',audio:'c3s3-s9'},
      {id:'s10',repeat:true,trigger:"R.evapSub==='factors' && R.evap.factors.wind>2",say:'空气流速加快，蒸发更快，有风天干得快。',audio:'c3s3-s10'},
      {id:'s11',repeat:true,trigger:"R.evapSub==='factors' && R.evap.factors.slowShown===true",say:'咦，这回对照组反而快！三个因素被你调低了。',audio:'c3s3-s11'},
      {id:'s12',repeat:true,trigger:"R.evapSub==='cooling' && R.evap.cooling.alcohol[0]>0",say:'酒精涂上啦，它要开始蒸发，温度计有好戏看。',audio:'c3s3-s12'},
      {id:'s13',repeat:true,trigger:"R.evap.cooling.conclusionShown===true",say:'涂酒精的示数更低！蒸发吸热，有致冷作用。',audio:'c3s3-s13'},
      {id:'s14',repeat:true,trigger:"R.evapSub==='paper' && R.evap.paper.lit && R.evap.paper.water>0 && !R.evap.paper.boiling && !R.evap.paper.burning",say:'火苗舔着纸锅，水在升温，纸却烧不着！',audio:'c3s3-s14'},
      {id:'s15',repeat:true,trigger:"R.evap.paper.boiling===true",say:'纸锅里的水沸腾啦！水温压住纸温，到不了着火点。',audio:'c3s3-s15'},
      {id:'s16',repeat:true,trigger:'after:s15@6000',say:'因此我们得出结论：蒸发在任何温度下都能发生；温度越高、表面积越大、空气流动越快，蒸发越快；蒸发吸热，有致冷作用。',audio:'c3s3-s16'}
    ],
    errors:[
      {id:'e2',trigger:"event:click:#paper-match-btn:R.evap.paper.water===0 && !R.evap.paper.lit",fix:'不对哟～纸锅还没加水呢，空烧马上就着火啦。',audio:'c3s3-e2'},
      {id:'e3',trigger:"R.evap.paper.burning===true",fix:'哎呀烧着啦！没水吸热，纸温冲到183℃着火点。',audio:'c3s3-e3'}
    ],
    free:[
      {trigger:"R.evapSub==='factors' && R.evap.factors.fastShown===true && R.evap.factors.volumes[1]<0.7",note:'右边液滴干得快，温度高表面积大，占了优势。',audio:'c3s3-f4'},
      {trigger:"R.evapSub==='cooling' && R.evap.cooling.alcohol[0]<=0",note:'点温度计下面的「涂酒精」，对比才看得出来了。',audio:'c3s3-f5'},
      {trigger:"event:click:#paper-water-btn:!R.evap.paper.lit",note:'水加好啦，纸锅贴着水，温度就被水压住了。',audio:'c3s3-f6'}
    ]
  },
  liquefy:{
    intro:{
      text:'水蒸气看不见，怎么把它变回水？加热水产生蒸气，让它上升遇到冷玻璃片，看它液化成水珠，一点点收集起来。点燃酒精灯开始吧。',
      audio:'c3s3-intro-liquefy'
    },
    steps:[
      {id:'s17',repeat:true,trigger:"R.heating===true && !R.boiling",say:'点灯加热，水吸热汽化，变成看不见的水蒸气。',audio:'c3s3-s17'},
      {id:'s18',repeat:true,trigger:"R.heating===true && R.waterTemp>=70",say:'水蒸气升上去，碰到上方冰冷的玻璃片啦。',audio:'c3s3-s18'},
      {id:'s19',repeat:true,trigger:"R.liquefy && R.liquefy.collectedPct>0",say:'看！蒸气遇冷液化成小水珠，挂在玻璃片上。',audio:'c3s3-s19'},
      {id:'s20',repeat:true,trigger:"R.liquefy && R.liquefy.collectedPct>=50",say:'水珠越聚越大，顺着玻璃片流下来收集啦。',audio:'c3s3-s20'},
      {id:'s21',repeat:true,trigger:'after:s20@6000',say:'因此我们得出结论：气态的水蒸气遇冷放热，液化成小水珠，降低温度是液化的途径之一，液化还要放热。',audio:'c3s3-s21'}
    ],
    errors:[
      {id:'e4',trigger:"event:click:#lq-lamp-btn:R.paused===true",fix:'不对哟～时间暂停着呢，点「开始」再点灯呀。',audio:'c3s3-e4'},
      {id:'e5',trigger:"R.heating===false && R.waterTemp<=R.ambTemp+2 && (!R.liquefy || R.liquefy.collectedPct===0)@8000",fix:'还没产生水蒸气哟～先点燃酒精灯把水烧热。',audio:'c3s3-e5'}
    ],
    free:[
      {trigger:"R.liquefy && R.liquefy.collectedPct>=100",note:'收集满啦！这些水全是水蒸气液化变回来的。',audio:'c3s3-f7'},
      {trigger:"R.heating===false && R.liquefy && R.liquefy.collectedPct>0 && R.liquefy.collectedPct<100",note:'灯熄了，水蒸气断了源，液化慢慢停下来。',audio:'c3s3-f8'}
    ]
  },
  audios:{
    'c3s3-intro-boil':'guide/audio/c3s3-intro-boil.mp3',
    'c3s3-intro-evap':'guide/audio/c3s3-intro-evap.mp3',
    'c3s3-intro-liquefy':'guide/audio/c3s3-intro-liquefy.mp3',
    'c3s3-s1':'guide/audio/c3s3-s1.mp3',
    'c3s3-s2':'guide/audio/c3s3-s2.mp3',
    'c3s3-s3':'guide/audio/c3s3-s3.mp3',
    'c3s3-s4':'guide/audio/c3s3-s4.mp3',
    'c3s3-s5':'guide/audio/c3s3-s5.mp3',
    'c3s3-s6':'guide/audio/c3s3-s6.mp3',
    'c3s3-s7':'guide/audio/c3s3-s7.mp3',
    'c3s3-s8':'guide/audio/c3s3-s8.mp3',
    'c3s3-s9':'guide/audio/c3s3-s9.mp3',
    'c3s3-s10':'guide/audio/c3s3-s10.mp3',
    'c3s3-s11':'guide/audio/c3s3-s11.mp3',
    'c3s3-s12':'guide/audio/c3s3-s12.mp3',
    'c3s3-s13':'guide/audio/c3s3-s13.mp3',
    'c3s3-s14':'guide/audio/c3s3-s14.mp3',
    'c3s3-s15':'guide/audio/c3s3-s15.mp3',
    'c3s3-s16':'guide/audio/c3s3-s16.mp3',
    'c3s3-s17':'guide/audio/c3s3-s17.mp3',
    'c3s3-s18':'guide/audio/c3s3-s18.mp3',
    'c3s3-s19':'guide/audio/c3s3-s19.mp3',
    'c3s3-s20':'guide/audio/c3s3-s20.mp3',
    'c3s3-s21':'guide/audio/c3s3-s21.mp3',
    'c3s3-e1':'guide/audio/c3s3-e1.mp3',
    'c3s3-e2':'guide/audio/c3s3-e2.mp3',
    'c3s3-e3':'guide/audio/c3s3-e3.mp3',
    'c3s3-e4':'guide/audio/c3s3-e4.mp3',
    'c3s3-e5':'guide/audio/c3s3-e5.mp3',
    'c3s3-f1':'guide/audio/c3s3-f1.mp3',
    'c3s3-f2':'guide/audio/c3s3-f2.mp3',
    'c3s3-f3':'guide/audio/c3s3-f3.mp3',
    'c3s3-f4':'guide/audio/c3s3-f4.mp3',
    'c3s3-f5':'guide/audio/c3s3-f5.mp3',
    'c3s3-f6':'guide/audio/c3s3-f6.mp3',
    'c3s3-f7':'guide/audio/c3s3-f7.mp3',
    'c3s3-f8':'guide/audio/c3s3-f8.mp3'
  }
};
window.GUIDE_DATA=window.C3S3_GUIDE;

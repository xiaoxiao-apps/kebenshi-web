'use strict';
/* c3s3 汽化液化探究馆 · B 语音版数据（§C/§4；G1波按A5-G3引导语规范改写文案）。R=window.C3S3_STATE（§C-1 Proxy 暴露）。
   「气泡」均为物理沸腾气泡（bubbleRegime S3-phys:29-34），与 UI 无关，解说正常讲。
   R.liquefy.* 全部带 R.liquefy&& 守卫（init 早于引擎 tick，防御 bfcache）。
   evap 子台用 R.evapSub 闸门；「涂酒精」按钮无 id（§0.4.6），用 alcohol[0] 电平引导（f5）。 */
window.C3S3_GUIDE={
  boil:{
    intro:{
      text:'欢迎来到汽化液化探究馆！先烧水：沸腾前后气泡有什么不同？水开后温度还升吗？点燃酒精灯找答案，跟我来！',
      audio:'c3s3-intro-boil'
    },
    steps:[
      {id:'s1',repeat:true,trigger:"R.heating===true && !R.boiling && R.waterTemp<60",say:'点火啦！水开始吸热升温，盯紧温度计看变化哦。',audio:'c3s3-s1'},
      {id:'s2',repeat:true,trigger:"R.bubbleRegime==='collapse'",say:'杯底冒出小气泡，上升遇冷又消失了，你看到了吗？',audio:'c3s3-s2'},
      {id:'s3',repeat:true,trigger:"R.heating && !R.boiling && R.waterTemp>=60 && R.waterTemp<85",say:'响水不开！气泡破裂最吵的时候还没沸腾，接着听。',audio:'c3s3-s3'},
      {id:'s4',repeat:true,trigger:"R.heating && !R.boiling && R.waterTemp>=85",say:'开水不响～听，声音反而变小啦，马上就要沸腾咯。',audio:'c3s3-s4'},
      {id:'s5',repeat:true,trigger:"R.boiling===true",say:'沸腾啦！气泡上升越变越大，到水面破裂，看到了吗？',audio:'c3s3-s5'},
      {id:'s6',repeat:true,trigger:'after:s5@6000',say:'继续吸热，温度却停在沸点不变，快看曲线平啦！',audio:'c3s3-s6'},
      {id:'s7',repeat:true,trigger:'after:s6@6000',say:'通过刚才的实验，我们发现：沸腾前升温，沸腾后吸热但温度停在沸点。记住它哦！',audio:'c3s3-s7'}
    ],
    errors:[
      {id:'e1',trigger:"R.paused===true && R.heating===true@3000",fix:'不对哟～时间暂停着呢，点「开始」水温才会升哦。',audio:'c3s3-e1'}
    ],
    free:[
      {trigger:"event:input:#amb-slider:R.heating===true",note:'环境温度一拖，水温跟着跳，重新加热再看看？',audio:'c3s3-f1'},
      {trigger:"R.lid==='sealed' && R.heating && !R.boiling",note:'密封盖压住蒸气，气压升高，要到102.5℃才沸，接着看。',audio:'c3s3-f2'},
      {trigger:"R.heating===false && R.waterTemp<95 && R.waterTemp>R.ambTemp+3",note:'灯熄了，水慢慢凉下来，看它向环境温度靠过去。',audio:'c3s3-f3'}
    ]
  },
  evap:{
    intro:{
      text:'沸腾要到沸点，蒸发却任何温度都在进行。三个小台子：比蒸发快慢、涂酒精感受致冷、纸锅烧水。切子标签玩起来！',
      audio:'c3s3-intro-evap'
    },
    steps:[
      {id:'s8',repeat:true,trigger:"R.evapSub==='factors' && R.evap.factors.temp>35",say:'液体温度调高，蒸发变快啦！再试试调大表面积吧。',audio:'c3s3-s8'},
      {id:'s9',repeat:true,trigger:"R.evapSub==='factors' && R.evap.factors.area>1.5",say:'表面积摊大，蒸发更快！接下来再试试调大风速吧。',audio:'c3s3-s9'},
      {id:'s10',repeat:true,trigger:"R.evapSub==='factors' && R.evap.factors.wind>2",say:'空气流速加快，蒸发更快，有风天干得快，发现了吗？',audio:'c3s3-s10'},
      /* s11已删（蔡总R2·B3-F1）：「对照组反而快」教学内容并入左胜free f10；mp3/audios项保留不引用 */
      {id:'s12',repeat:true,trigger:"R.evapSub==='cooling' && R.evap.cooling.alcohol[0]>0",say:'酒精涂上啦！它开始蒸发，盯紧温度计看好戏哦。',audio:'c3s3-s12'},
      {id:'s13',repeat:true,trigger:"R.evap.cooling.conclusionShown===true",say:'涂酒精的示数更低！蒸发吸热致冷，你看到了吗？',audio:'c3s3-s13'},
      {id:'s14',repeat:true,trigger:"R.evapSub==='paper' && R.evap.paper.lit && R.evap.paper.water>0 && !R.evap.paper.boiling && !R.evap.paper.burning",say:'火苗舔着纸锅，水在升温纸却烧不着，神奇吧？接着看！',audio:'c3s3-s14'},
      {id:'s15',repeat:true,trigger:"R.evap.paper.boiling===true",say:'纸锅里的水沸腾啦！水温压住纸温，到不了着火点。',audio:'c3s3-s15'},
      {id:'s16',repeat:true,trigger:'after:s15@6000',say:'通过刚才的实验，我们发现：蒸发任何温度都发生，越热、越大、越快风就越快，还吸热致冷。记住它哦！',audio:'c3s3-s16'}
    ],
    errors:[
      {id:'e2',trigger:"event:click:#paper-match-btn:R.evap.paper.water===0 && !R.evap.paper.lit",fix:'不对哟～纸锅还没加水呢，空烧马上就着火啦。',audio:'c3s3-e2'},
      {id:'e3',trigger:"R.evap.paper.burning===true && !R.evap.paper.burnVoiceSaid",fix:'哎呀烧着啦！没水吸热，纸温冲到183℃着火点。',audio:'c3s3-e3'}/* 只播一遍：burnVoiceSaid由physics燃烧2.5s后置位（留首播窗口） */
    ],
    free:[
      {trigger:"R.evapSub==='factors' && R.evap.factors.winner===1 && performance.now()-G.modeEnterT>13000",note:'右边液滴干得快！它先只剩 5% 啦——温度高、表面积大、风更大，蒸发当然更快，换个条件再试试？',audio:'c3s3-f4'},
      {trigger:"R.evapSub==='factors' && R.evap.factors.winner===0 && performance.now()-G.modeEnterT>13000",note:'左边液滴干得快！它先只剩 5% 了，右边三个条件被调低啦，调回去再比一次？',audio:'c3s3-f10'},
      {trigger:"R.evapSub==='cooling' && R.evap.cooling.alcohol[0]<=0",note:'点温度计下面的「涂酒精」，对比才看得出来了。',audio:'c3s3-f5'},
      {trigger:"event:click:#paper-water-btn:!R.evap.paper.lit",note:'水加好啦！纸锅贴着水，温度被压住，接着点火看看。',audio:'c3s3-f6'},
      {trigger:"event:click:#evap-fan-hit",cooldown:1000,note:'扇动扇子，加快空气流动，蒸发变快了。',audio:'c3s3-f9'}/* Q4扇子语音：core checkFanClick命中派发 */
    ]
  },
  liquefy:{
    intro:{
      text:'水蒸气看不见，怎么变回水？加热水产生蒸气，让它遇冷玻璃片液化成水珠收集起来。点燃酒精灯开始吧！',
      audio:'c3s3-intro-liquefy'
    },
    steps:[
      {id:'s17',repeat:true,trigger:"R.heating===true && !R.boiling",say:'点灯加热，水汽化变成看不见的水蒸气，接着看上方。',audio:'c3s3-s17'},
      {id:'s18',repeat:true,trigger:"R.heating===true && R.waterTemp>=70",say:'水蒸气升上去，碰到冰冷的玻璃片啦，盯紧看哦。',audio:'c3s3-s18'},
      {id:'s19',repeat:true,trigger:"R.liquefy && R.liquefy.collectedPct>0",say:'看！蒸气遇冷液化成小水珠挂上来了，你看到了吗？',audio:'c3s3-s19'},
      {id:'s20',repeat:true,trigger:"R.liquefy && R.liquefy.collectedPct>=50",say:'太棒了，水珠越聚越大，顺玻璃片流下来收集啦！',audio:'c3s3-s20'},
      {id:'s21',repeat:true,trigger:'after:s20@6000',say:'通过刚才的实验，我们发现：水蒸气遇冷放热，液化成小水珠。记住它哦！',audio:'c3s3-s21'}
    ],
    errors:[
      {id:'e4',trigger:"event:click:#lq-lamp-btn:R.paused===true",fix:'不对哟～时间暂停着呢，点「开始」再点灯呀。',audio:'c3s3-e4'},
      {id:'e5',trigger:"R.heating===false && R.waterTemp<=R.ambTemp+2 && (!R.liquefy || R.liquefy.collectedPct===0)@8000",fix:'还没产生水蒸气哟～先点燃酒精灯把水烧热。',audio:'c3s3-e5'}
    ],
    free:[
      {trigger:"R.liquefy && R.liquefy.collectedPct>=100",note:'收集满啦！这些水全是水蒸气液化变回来的，厉害吧？',audio:'c3s3-f7'},
      {trigger:"R.heating===false && R.liquefy && R.liquefy.collectedPct>0 && R.liquefy.collectedPct<100",note:'灯熄了，蒸气断了源，液化慢慢停，再点灯看看？',audio:'c3s3-f8'}
    ]
  },
  audios:{
    'c3s3-intro-boil':'guide/audio/c3s3-intro-boil.mp3?v=20261027g1',
    'c3s3-intro-evap':'guide/audio/c3s3-intro-evap.mp3?v=20261027g1',
    'c3s3-intro-liquefy':'guide/audio/c3s3-intro-liquefy.mp3?v=20261027g1',
    'c3s3-s1':'guide/audio/c3s3-s1.mp3?v=20261027g1',
    'c3s3-s2':'guide/audio/c3s3-s2.mp3?v=20261027g1',
    'c3s3-s3':'guide/audio/c3s3-s3.mp3?v=20261027g1',
    'c3s3-s4':'guide/audio/c3s3-s4.mp3?v=20261027g1',
    'c3s3-s5':'guide/audio/c3s3-s5.mp3?v=20261027g1',
    'c3s3-s6':'guide/audio/c3s3-s6.mp3?v=20261027g1',
    'c3s3-s7':'guide/audio/c3s3-s7.mp3?v=20261027g1',
    'c3s3-s8':'guide/audio/c3s3-s8.mp3?v=20261027g1',
    'c3s3-s9':'guide/audio/c3s3-s9.mp3?v=20261027g1',
    'c3s3-s10':'guide/audio/c3s3-s10.mp3?v=20261027g1',
    'c3s3-s11':'guide/audio/c3s3-s11.mp3?v=20261027g1',
    'c3s3-s12':'guide/audio/c3s3-s12.mp3?v=20261027g1',
    'c3s3-s13':'guide/audio/c3s3-s13.mp3?v=20261027g1',
    'c3s3-s14':'guide/audio/c3s3-s14.mp3?v=20261027g1',
    'c3s3-s15':'guide/audio/c3s3-s15.mp3?v=20261027g1',
    'c3s3-s16':'guide/audio/c3s3-s16.mp3?v=20261027g1',
    'c3s3-s17':'guide/audio/c3s3-s17.mp3?v=20261027g1',
    'c3s3-s18':'guide/audio/c3s3-s18.mp3?v=20261027g1',
    'c3s3-s19':'guide/audio/c3s3-s19.mp3?v=20261027g1',
    'c3s3-s20':'guide/audio/c3s3-s20.mp3?v=20261027g1',
    'c3s3-s21':'guide/audio/c3s3-s21.mp3?v=20261027g1',
    'c3s3-e1':'guide/audio/c3s3-e1.mp3',
    'c3s3-e2':'guide/audio/c3s3-e2.mp3',
    'c3s3-e3':'guide/audio/c3s3-e3.mp3',
    'c3s3-e4':'guide/audio/c3s3-e4.mp3',
    'c3s3-e5':'guide/audio/c3s3-e5.mp3',
    'c3s3-f1':'guide/audio/c3s3-f1.mp3?v=20261027g1',
    'c3s3-f2':'guide/audio/c3s3-f2.mp3?v=20261027g1',
    'c3s3-f3':'guide/audio/c3s3-f3.mp3?v=20261027g1',
    'c3s3-f4':'guide/audio/c3s3-f4.mp3?v=20261027r4',
    'c3s3-f5':'guide/audio/c3s3-f5.mp3?v=20261027g1',
    'c3s3-f6':'guide/audio/c3s3-f6.mp3?v=20261027g1',
    'c3s3-f7':'guide/audio/c3s3-f7.mp3?v=20261027g1',
    'c3s3-f8':'guide/audio/c3s3-f8.mp3?v=20261027g1',
    'c3s3-f9':'guide/audio/c3s3-f9.mp3',
    'c3s3-f10':'guide/audio/c3s3-f10.mp3?v=20261027r4'
  }
};
window.GUIDE_DATA=window.C3S3_GUIDE;

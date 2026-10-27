'use strict';
/* c4s1「光影成像实验室」exp-shadow.html · 语音讲解层数据（B 版标配）
   设计书：docs/c4s1-guide-design.md §B/§4/§5，文案逐字照抄禁改写。
   状态源：window.C4S1S（exp-shadow-core.js L552 后暴露的只读 getter 门面）。
   R.mode('pinhole'|'hand') 是普通状态字段；引擎 mode 由 GUIDE_CFG.mode='refract' 钉死，
   切手影不会触发 onModeEnter/intro 重播。全部 steps repeat:true。 */
window.C4S1S_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到光影成像实验室！点亮蜡烛，看看屏上的火焰像长什么样；拖近拖远蜡烛，像会跟着变；再切到手影模式，拿小手玩光影。',
      audio:'c4s1s-intro'
    },
    steps:[
      {id:'s-s1',repeat:true,trigger:"R.candleLit===true && R.imgM!==null",say:'点着啦！光屏上的火焰像，居然是倒立的！',audio:'c4s1s-s1'},
      {id:'s-s2',repeat:true,trigger:"R.imgM!==null && R.imgM>=1.4",say:'蜡烛靠近小孔，屏上的像变大了。',audio:'c4s1s-s2'},
      {id:'s-s3',repeat:true,trigger:"R.imgM!==null && R.imgM<=0.7",say:'蜡烛移远，像又缩小了，还是倒立的。',audio:'c4s1s-s3'},
      {id:'s-s4',repeat:true,trigger:"R.mode==='hand'",say:'手影模式！台灯和小手替换了蜡烛。',audio:'c4s1s-s4'},
      {id:'s-s5',repeat:true,trigger:"R.mode==='hand' && R.handM!==null",say:'台灯点亮，光幕上出现黑黑的手影。',audio:'c4s1s-s5'},
      {id:'s-s6',repeat:true,trigger:"R.handM!==null && R.handM>=2.6",say:'手越靠近台灯，影子变得越大！',audio:'c4s1s-s6'},
      {id:'s-concl',repeat:true,trigger:"R.mode==='pinhole' && R.imgM>=1.4@6000",say:'因此我们得出结论：光沿直线传播，穿过小孔成的是倒立的实像。',audio:'c4s1s-concl'}
    ],
    errors:[
      {id:'s-e1',trigger:"R.mode==='pinhole' && R.scene && (R.scene.missing==='candlePos' || R.scene.missing==='boardPos')@1500",fix:'不对哟～带孔板要放在蜡烛和光屏中间。',audio:'c4s1s-e1'},
      {id:'s-e2',trigger:"R.mode==='hand' && R.scene && R.scene.missing==='handNoImg'@1500",fix:'不对哟～把手移到灯和屏之间，影子才会出现。',audio:'c4s1s-e2'}
    ],
    free:[
      {trigger:"event:input:#hole-slider:R.imgM!==null",note:'孔小像清晰，孔大像更亮，看出区别了吗？',audio:'c4s1s-f1'},
      {trigger:"R.rayOn===false && R.imgM!==null",note:'光线符号关了，两条光线在小孔处交叉，还记得吗？',audio:'c4s1s-f2'},
      {trigger:"R.handM!==null && R.handM<=1.7",note:'手离灯越远，影子就越小。',audio:'c4s1s-f3'}
    ],
    tasks:[]
  },
  audios:{
    'c4s1s-intro':'guide/audio/c4s1s-intro.mp3',
    'c4s1s-s1':'guide/audio/c4s1s-s1.mp3',
    'c4s1s-s2':'guide/audio/c4s1s-s2.mp3',
    'c4s1s-s3':'guide/audio/c4s1s-s3.mp3',
    'c4s1s-s4':'guide/audio/c4s1s-s4.mp3',
    'c4s1s-s5':'guide/audio/c4s1s-s5.mp3',
    'c4s1s-s6':'guide/audio/c4s1s-s6.mp3',
    'c4s1s-concl':'guide/audio/c4s1s-concl.mp3?v=20261027r2',
    'c4s1s-e1':'guide/audio/c4s1s-e1.mp3',
    'c4s1s-e2':'guide/audio/c4s1s-e2.mp3',
    'c4s1s-f1':'guide/audio/c4s1s-f1.mp3',
    'c4s1s-f2':'guide/audio/c4s1s-f2.mp3',
    'c4s1s-f3':'guide/audio/c4s1s-f3.mp3'
  }
};
/* 引擎接线：engine-core.js 在加载时捕获 window.GUIDE_DATA（无 c4s1 回退），本文件必须先于引擎加载 */
window.GUIDE_DATA=window.C4S1S_GUIDE;

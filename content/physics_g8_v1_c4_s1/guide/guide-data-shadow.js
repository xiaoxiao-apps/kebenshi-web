'use strict';
/* c4s1「光影成像实验室」exp-shadow.html · 语音讲解层数据（B 版标配）
   设计书：docs/c4s1-guide-design.md §B/§4/§5，文案逐字照抄禁改写。
   状态源：window.C4S1S（exp-shadow-core.js L552 后暴露的只读 getter 门面）。
   R.mode('pinhole'|'hand') 是普通状态字段；引擎 mode 由 GUIDE_CFG.mode='refract' 钉死，
   切手影不会触发 onModeEnter/intro 重播。全部 steps repeat:true。
   R3-W4（蔡总反馈11）L3：新增 s-concl-hand——手影模式玩过（handM>=2.6 持续4s）后补结论性话语，
   与 pinhole 的 s-concl 按 R.mode 天然互斥；切模式经 GUIDE_SCENE.change 清 repLast 可再触发。
   小孔结论升级（C4 标可选）R6 轮已按蔡总 2026-10-28 21:36 拍板「需要」落地：改「现象→本质」完整句式。 */
window.C4S1S_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到光影成像实验室！点亮蜡烛，看看屏上的火焰像长什么样；拖近拖远蜡烛，像会跟着变；再切到手影模式，拿小手玩光影。',
      audio:'c4s1s-intro'
    },
    steps:[
      {id:'s-s1',repeat:true,trigger:"R.candleLit===true && R.imgM!==null",say:'点着啦！屏上的火焰像是倒立的！接下来拖近蜡烛看看。',audio:'c4s1s-s1'},
      {id:'s-s2',repeat:true,trigger:"R.imgM!==null && R.imgM>=1.4 && (G.t-R.candleDragT)<2000 && (G.t-R.candleDragT)<(G.t-R.screenDragT)",say:'蜡烛靠近小孔，像变大啦！再移远试试，会怎样？',audio:'c4s1s-s2'},
      {id:'s-s3',repeat:true,trigger:"R.imgM!==null && R.candleX<R.candleX0-4 && (G.t-R.candleDragT)<2000",say:'蜡烛移远，像缩小了，还是倒立的。接下来切到手影模式吧。',audio:'c4s1s-s3'},
      {id:'s-s3b',repeat:true,trigger:"R.imgM!==null && (G.t-R.screenDragT)<2000 && (G.t-R.screenDragT)<(G.t-R.candleDragT)",say:'移动光屏也能改变像：离小孔越远，成的像越大；越近，像越小。',audio:'c4s1s-s3b'},
      {id:'s-s4',repeat:true,trigger:"R.mode==='hand'",say:'手影模式！台灯和小手替换了蜡烛。点亮台灯看看。',audio:'c4s1s-s4'},
      {id:'s-s5',repeat:true,trigger:"R.mode==='hand' && R.handM!==null",say:'光幕上出现黑黑的手影！把手移近台灯试试。',audio:'c4s1s-s5'},
      {id:'s-s6',repeat:true,trigger:"R.handM!==null && R.handM>=2.6",say:'手越靠近台灯，影子越大！换个距离再试试？',audio:'c4s1s-s6'},
      {id:'s-concl-hand',repeat:true,trigger:"R.mode==='hand' && R.handM!==null && R.handM>=2.6@4000",say:'因此我们得出结论：光沿直线传播，当光被不透明的小手挡住时，后面就会形成影子。手影游戏就是利用这个原理做的。',audio:'c4s1s-concl-hand'},
      {id:'s-concl',repeat:true,queue:true,trigger:"R.mode==='pinhole' && R.imgM>=1.4 && R.candleDragT>R.screenDragT@6000",say:'通过刚才的实验现象我们可以看到：蜡烛火焰的光沿直线传播，穿过小孔后在光屏上形成倒立的实像。这说明光在同种均匀介质中是沿直线传播的。',audio:'c4s1s-concl'}/* R6（蔡总21:36拍板）：结论改「现象→本质」完整句式（同c3s4 R3-K3句式）；queue对齐R5契约6=结论等前条播完不互掐；mp3文本全角冒号换逗号防edge-tts截断，屏幕字幕保留冒号 */
    ],
    errors:[
      {id:'s-e1',trigger:"R.mode==='pinhole' && R.scene && (R.scene.missing==='candlePos' || R.scene.missing==='boardPos')@1500",fix:'不对哟～蜡烛要放在带孔板的左边哦。',audio:'c4s1s-e1'},
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
    'c4s1s-s1':'guide/audio/c4s1s-s1.mp3?v=20261027g1',
    'c4s1s-s2':'guide/audio/c4s1s-s2.mp3?v=20261027g1',
    'c4s1s-s3':'guide/audio/c4s1s-s3.mp3?v=20261027g1',
    'c4s1s-s3b':'guide/audio/c4s1s-s3b.mp3',
    'c4s1s-s4':'guide/audio/c4s1s-s4.mp3?v=20261027g1',
    'c4s1s-s5':'guide/audio/c4s1s-s5.mp3?v=20261027g1',
    'c4s1s-s6':'guide/audio/c4s1s-s6.mp3?v=20261027g1',
    'c4s1s-concl-hand':'guide/audio/c4s1s-concl-hand.mp3?v=20261028v1',
    'c4s1s-concl':'guide/audio/c4s1s-concl.mp3?v=20261028v6',
    'c4s1s-e1':'guide/audio/c4s1s-e1.mp3?v=20261027r4',
    'c4s1s-e2':'guide/audio/c4s1s-e2.mp3',
    'c4s1s-f1':'guide/audio/c4s1s-f1.mp3',
    'c4s1s-f2':'guide/audio/c4s1s-f2.mp3',
    'c4s1s-f3':'guide/audio/c4s1s-f3.mp3'
  }
};
/* 引擎接线：engine-core.js 在加载时捕获 window.GUIDE_DATA（无 c4s1 回退），本文件必须先于引擎加载 */
window.GUIDE_DATA=window.C4S1S_GUIDE;

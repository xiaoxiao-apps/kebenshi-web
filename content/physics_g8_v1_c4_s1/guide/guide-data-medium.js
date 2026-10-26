'use strict';
/* c4s1「光在介质中的直线传播」exp-medium.html · 语音讲解层数据（B 版标配）
   设计书：docs/c4s1-guide-design.md §A/§4/§5，文案逐字照抄禁改写。
   状态源：window.C4S1M（exp-medium-core.js L435 后暴露的只读 getter 门面）。
   trigger 约定（engine-core.js parseTrigger）：
     "R.xxx" 表达式 / "expr@2000" 持续满足 / "after:id@6000" 依赖步后延时 /
     "event:click:#btn-play:EXPR"、"event:input:#rng-turbid:EXPR" 事件即时判态。
   mode key 统一 'refract'（单模式页，GUIDE_CFG.mode 钉死）。全部 steps repeat:true。 */
window.C4S1M_GUIDE={
  refract:{
    intro:{
      text:'欢迎来直线传播实验室！先把烟雾箱拖出来、打开激光笔，光路就看得见；再换水箱、玻璃砖比一比，按播放光点送光点跑一圈。',
      audio:'c4s1m-intro'
    },
    steps:[
      {id:'m-s1',repeat:true,trigger:"R.smokeOn===true && R.laserOn===false",say:'烟雾箱摆好啦，接下来打开激光笔。',audio:'c4s1m-s1'},
      {id:'m-s2',repeat:true,trigger:"R.smokeOn===true && R.laserOn===true",say:'看，烟雾里的光路，是一条笔直的线。',audio:'c4s1m-s2'},
      {id:'m-s3',repeat:true,trigger:"R.waterOn===true && R.laserOn===true",say:'换到水里：光在水下也走直线。',audio:'c4s1m-s3'},
      {id:'m-s4',repeat:true,trigger:"R.glassOn===true && R.laserOn===true",say:'玻璃砖里，光路照样笔直。',audio:'c4s1m-s4'},
      {id:'m-s5',repeat:true,trigger:"R.pulseOn===true",say:'放出光点，看它沿着直线一路跑过去。',audio:'c4s1m-s5'},
      {id:'m-concl',repeat:true,trigger:'after:m-s5@6000',say:'因此我们得出结论：光在同种均匀介质中沿直线传播。',audio:'c4s1m-concl'}
    ],
    errors:[
      {id:'m-e1',trigger:"R.laserOn===true && R.activeCount===0@2000",fix:'不对哟～空气里的光路看不见，先摆上烟雾箱。',audio:'c4s1m-e1'},
      {id:'m-e2',trigger:"event:click:#btn-play:R.activeCount===0",fix:'别急哟～桌上没器材，光点没处显形，先摆烟雾箱。',audio:'c4s1m-e2'}
    ],
    free:[
      {trigger:"event:input:#rng-turbid:R.waterOn===true",note:'水里加点牛奶，光路会更清楚哦。',audio:'c4s1m-f1'},
      {trigger:"R.laserOn===true && Math.abs(R.angleDeg)>=25",note:'笔身歪一歪，光线还是一条直线。',audio:'c4s1m-f2'},
      {trigger:"R.paused===true && R.laserOn===true",note:'暂停啦，慢慢看这条光的路线。',audio:'c4s1m-f3'}
    ],
    tasks:[]
  },
  audios:{
    'c4s1m-intro':'guide/audio/c4s1m-intro.mp3',
    'c4s1m-s1':'guide/audio/c4s1m-s1.mp3',
    'c4s1m-s2':'guide/audio/c4s1m-s2.mp3',
    'c4s1m-s3':'guide/audio/c4s1m-s3.mp3',
    'c4s1m-s4':'guide/audio/c4s1m-s4.mp3',
    'c4s1m-s5':'guide/audio/c4s1m-s5.mp3',
    'c4s1m-concl':'guide/audio/c4s1m-concl.mp3',
    'c4s1m-e1':'guide/audio/c4s1m-e1.mp3',
    'c4s1m-e2':'guide/audio/c4s1m-e2.mp3',
    'c4s1m-f1':'guide/audio/c4s1m-f1.mp3',
    'c4s1m-f2':'guide/audio/c4s1m-f2.mp3',
    'c4s1m-f3':'guide/audio/c4s1m-f3.mp3'
  }
};
/* 引擎接线：engine-core.js 在加载时捕获 window.GUIDE_DATA（无 c4s1 回退），本文件必须先于引擎加载 */
window.GUIDE_DATA=window.C4S1M_GUIDE;

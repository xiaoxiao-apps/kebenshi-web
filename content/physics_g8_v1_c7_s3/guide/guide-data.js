/* content/physics_g8_v1_c7_s3/guide/guide-data.js — 重力（E6 重力质量关系 / E7 竖直向下与小地球）
   clip 文本=屏幕字幕原文（语音同文），audio id→路径映射在 audios 单点 */
window.C7S3_GUIDE={
  gravity:{
    intro:{text:'欢迎来到重力质量关系探究馆！把钩码逐个挂到测力计上，挂稳后点记录，数据进表格、图上自动描点。',audio:'c7e6-intro'},
    steps:[
      {id:'c7e6-s1',repeat:true,queue:true,trigger:'R.records.length>=1',say:'又记下一组数据！看，质量变大，重力也跟着变大。它们到底什么关系？继续挂、继续记。',audio:'c7e6-s1'},
      {id:'c7e6-s2',repeat:true,queue:true,trigger:'R.records.length>=3',say:'图上的点连成了一条过原点的直线，重力跟质量成正比！',audio:'c7e6-s2'},
      {id:'c7e6-s3',repeat:false,queue:true,trigger:'R.concluded===true',say:'重力跟质量的比值约等于9.8牛每千克，用g表示，公式是G等于mg。粗略计算时g可以取10。',audio:'c7e6-s3'}
    ],
    errors:[
      {id:'c7e6-e1',interval:15000,trigger:'R.pendRecord===true',fix:'钩码挂上了还没记录哦，数据没进表格。点一下记录按钮。',audio:'c7e6-e1'}
    ],
    free:[
      {trigger:'R.g10===true',note:'打开粗略g取10的开关对比一下，算出的重力差多少？什么时候用粗略值方便？',audio:'c7e6-f1'}
    ],
    tasks:[]
  },
  plumb:{
    intro:{text:'欢迎来到竖直向下与下工坊！场景A是铅垂线，场景B是小地球。先把墙面倾斜，看看铅垂线跟不跟着歪？',audio:'c7e7-intro'},
    steps:[
      {id:'c7e7-s1',repeat:true,queue:true,trigger:'R.scene===\'a\' && R.a.tiltChanged>=1',say:'墙怎么歪，铅垂线都永远竖直向下，重力的方向是竖直向下，可不是垂直于表面哦！',audio:'c7e7-s1'},
      {id:'c7e7-s2',repeat:true,queue:true,trigger:'R.scene===\'b\' && R.b.spot!==null',say:'点点地球上的不同位置，小人的重力箭头永远指向地心。我们脚下的下，其实是指向地心的方向。',audio:'c7e7-s2'},
      {id:'c7e7-s3',repeat:false,queue:true,trigger:'R.scene===\'b\' && R.b.spot===\'sa\'',say:'重力方向竖直向下，在球形的地球上，各地的下都指向地心，所以南美洲的人也站得稳稳的。记住它！',audio:'c7e7-s3'}
    ],
    errors:[
      {id:'c7e7-e1',interval:15000,trigger:'R.scene===\'b\' && R.b.spot===null',fix:'还没在地球上选位置呢，点一点地球上的位置，小人就站上去啦。',audio:'c7e7-e1'}
    ],
    free:[
      {trigger:'R.scene===\'a\' && (R.a.tilt>=29 || R.a.tilt<=-29)',note:'把墙面倾角拉到最大，对比铅垂线和垂直墙面的虚线，两条线的差别一眼就看出来了。',audio:'c7e7-f1'}
    ],
    tasks:[]
  },
  audios:{
    'c7e6-intro':'guide/audio/c7e6-intro.mp3?v=20261104',
    'c7e6-s1':'guide/audio/c7e6-s1.mp3?v=20261104','c7e6-s2':'guide/audio/c7e6-s2.mp3?v=20261104',
    'c7e6-s3':'guide/audio/c7e6-s3.mp3?v=20261104',
    'c7e6-e1':'guide/audio/c7e6-e1.mp3?v=20261104','c7e6-f1':'guide/audio/c7e6-f1.mp3?v=20261104',
    'c7e7-intro':'guide/audio/c7e7-intro.mp3?v=20261104',
    'c7e7-s1':'guide/audio/c7e7-s1.mp3?v=20261104','c7e7-s2':'guide/audio/c7e7-s2.mp3?v=20261104',
    'c7e7-s3':'guide/audio/c7e7-s3.mp3?v=20261104',
    'c7e7-e1':'guide/audio/c7e7-e1.mp3?v=20261104','c7e7-f1':'guide/audio/c7e7-f1.mp3?v=20261104'
  }
};

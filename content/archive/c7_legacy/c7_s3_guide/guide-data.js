/* content/physics_g8_v1_c7_s3/guide/guide-data.js — 重力探究馆（双mode：gravity 场景①大小站 / direction 场景②方向站）C7V3-R2 版
   clip 文本=屏幕字幕原文（语音同文），audio id→路径映射在 audios 单点。
   c7e6-intro 逐字=设计书 v3 §6 新文本；新 clip c7n17/c7n18（环境滑块 #rng-env 切换播报，文本=§6 逐字）；
   旧 c7e6/c7e7 系列文本与 audio 文件名不变，trigger 按新页面 state 字段核验重映射。
   c7e6-f1 对应旧「粗略 g 取 10」开关已删除，仅存 audios 映射不挂 trigger。 */
window.C7S3_GUIDE={
  gravity:{
    intro:{text:'欢迎来到重力探究馆！把砝码从托盘拖到测力计上，挂稳后点旁边的记录，让数据表和图像自己说话；再拨环境滑块去月球称一称。',audio:'c7e6-intro'},
    steps:[
      {id:'c7e6-s1',repeat:true,queue:true,trigger:'(R.scene===\'gravity\') && (R.onMoon?R.recordsMoon:R.recordsEarth).length>=1',say:'又记下一组数据！看，质量变大，重力也跟着变大。它们到底什么关系？继续挂、继续记。',audio:'c7e6-s1'},
      {id:'c7e6-s2',repeat:true,queue:true,trigger:'(R.scene===\'gravity\') && (R.onMoon?R.recordsMoon:R.recordsEarth).length>=3',say:'图上的点连成了一条过原点的直线，重力跟质量成正比！',audio:'c7e6-s2'},
      {id:'c7e6-s3',repeat:false,queue:true,trigger:'R.scene===\'gravity\' && R.concludedEarth===true',say:'重力跟质量的比值约等于9.8牛每千克，用g表示，公式是G等于mg。粗略计算时g可以取10。',audio:'c7e6-s3'},
      {id:'c7n13',repeat:false,queue:true,trigger:'R.scene===\'gravity\' && (R.onMoon?R.recordsMoon:R.recordsEarth).length>=2',say:'看G除以m这一列，不管挂几个钩码，商永远是9.8。重力与质量的比值是个定值，这才叫成正比，g就等于G除以m。',audio:'c7n13'},
      {id:'c7n14',repeat:false,queue:true,trigger:'R.scene===\'gravity\' && (R.onMoon?R.recordsMoon:R.recordsEarth).length>=3',say:'这条直线必须过原点：不挂钩码时质量是零，重力也是零。图像过原点，正比例关系才完整。',audio:'c7n14'},
      {id:'c7n17',repeat:true,queue:true,trigger:'event:change:#rng-env:R.onMoon===true',say:'到月球了！这里的吸引只有地球的六分之一。同一个钩码再挂上去测一测，看看读数怎么变，质量那一栏变不变。',audio:'c7n17'},
      {id:'c7n18',repeat:true,queue:true,trigger:'event:change:#rng-env:R.onMoon===false',say:'回到地球！吸引又变强了，读数回来了。对比两次，重力随位置变，质量纹丝不动。',audio:'c7n18'},
      {id:'c7n11',repeat:false,queue:true,trigger:'R.scene===\'gravity\' && R.onMoon===true && R.recordsMoon.length>=1',say:'把同一个钩码带到月球上再称一次。看，测力计读数变成了地球上的六分之一，可质量那一栏，纹丝不动。',audio:'c7n11'},
      {id:'c7n12',repeat:false,queue:true,trigger:'R.scene===\'gravity\' && R.onMoon===true && R.concludedMoon===true',say:'质量是物体本身的属性，不随位置改变；重力是天体对物体的吸引，随位置改变。月球引力约为地球的六分之一，所以G变小，m不变。',audio:'c7n12'}
    ],
    errors:[
      {id:'c7e6-e1',interval:15000,trigger:'R.scene===\'gravity\' && R.pendRecord===true',fix:'钩码挂上了还没记录哦，数据没进表格。点一下记录按钮。',audio:'c7e6-e1'}
    ],
    free:[],
    tasks:[]
  },
  direction:{
    intro:{text:'重力到底朝哪个方向？先看铅垂线，再帮工人查查墙砌直了没有，最后一镜飞到太空，看看全世界的下都指向哪里。',audio:'c7e7-intro'},
    steps:[
      {id:'c7e7-s1',repeat:true,queue:true,trigger:'R.scene===\'direction\' && R.dir.tiltChanged>=1',say:'墙怎么歪，铅垂线都永远竖直向下，重力的方向是竖直向下，可不是垂直于表面哦！',audio:'c7e7-s1'},
      {id:'c7e7-s2',repeat:true,queue:true,trigger:'R.scene===\'direction\' && R.dir.zoomT>=0.8 && R.dir.spot!==null',say:'点点地球上的不同位置，小人的重力箭头永远指向地心。我们脚下的下，其实是指向地心的方向。',audio:'c7e7-s2'},
      {id:'c7e7-s3',repeat:false,queue:true,trigger:'R.scene===\'direction\' && R.dir.zoomT>=0.8 && R.dir.spot===\'sa\'',say:'重力方向竖直向下，在球形的地球上，各地的下都指向地心，所以南美洲的人也站得稳稳的。记住它！',audio:'c7e7-s3'},
      {id:'c7n15',repeat:false,queue:true,trigger:'R.scene===\'direction\' && R.dir.wallCheck===true',say:'工人师傅用铅垂线查墙：墙面和铅垂线平行，墙就是竖直的。竖直向下的知识，就用在工地上。',audio:'c7n15'},
      {id:'c7n16',repeat:false,queue:true,trigger:'R.scene===\'direction\' && R.dir.zoomT>=0.9 && R.dir.spot!==null',say:'镜头拉远——中国、南美、澳洲，所有人脚下的「下」，都指向地心。竖直向下，就是指向地心的方向，所以南美洲的人稳稳当当，不会掉进太空。',audio:'c7n16'}
    ],
    errors:[
      {id:'c7e7-e1',interval:15000,trigger:'R.scene===\'direction\' && R.dir.zoomT>=0.8 && R.dir.spot===null',fix:'还没在地球上选位置呢，点一点地球上的位置，小人就站上去啦。',audio:'c7e7-e1'}
    ],
    free:[
      {trigger:'R.scene===\'direction\' && R.dir.zoomT<0.3 && (R.dir.tilt>=29 || R.dir.tilt<=-29)',note:'把墙面倾角拉到最大，对比铅垂线和垂直墙面的虚线，两条线的差别一眼就看出来了。',audio:'c7e7-f1'}
    ],
    tasks:[]
  },
  audios:{
    'c7e6-intro':'guide/audio/c7e6-intro.mp3?v=20261111',
    'c7e6-s1':'guide/audio/c7e6-s1.mp3?v=20261111',
    'c7e6-s2':'guide/audio/c7e6-s2.mp3?v=20261111',
    'c7e6-s3':'guide/audio/c7e6-s3.mp3?v=20261111',
    'c7e6-e1':'guide/audio/c7e6-e1.mp3?v=20261111',
    'c7e6-f1':'guide/audio/c7e6-f1.mp3?v=20261111',
    'c7e7-intro':'guide/audio/c7e7-intro.mp3?v=20261111',
    'c7e7-s1':'guide/audio/c7e7-s1.mp3?v=20261111',
    'c7e7-s2':'guide/audio/c7e7-s2.mp3?v=20261111',
    'c7e7-s3':'guide/audio/c7e7-s3.mp3?v=20261111',
    'c7e7-e1':'guide/audio/c7e7-e1.mp3?v=20261111',
    'c7e7-f1':'guide/audio/c7e7-f1.mp3?v=20261111',
    'c7n11':'guide/audio/c7n11.mp3?v=20261111',
    'c7n12':'guide/audio/c7n12.mp3?v=20261111',
    'c7n13':'guide/audio/c7n13.mp3?v=20261111',
    'c7n14':'guide/audio/c7n14.mp3?v=20261111',
    'c7n15':'guide/audio/c7n15.mp3?v=20261111',
    'c7n16':'guide/audio/c7n16.mp3?v=20261111',
    'c7n17':'guide/audio/c7n17.mp3?v=20261111',
    'c7n18':'guide/audio/c7n18.mp3?v=20261111'
  }
};

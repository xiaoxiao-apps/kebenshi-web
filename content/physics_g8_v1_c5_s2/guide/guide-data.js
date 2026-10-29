/* content/physics_g8_v1_c5_s2/guide/guide-data.js */
/* R9-2（蔡总 2026-10-29 09:40 条1a/条2/条5e延伸）：①三场景首条引导 c-s1/p-s1/m-s1 裸 delay → 电平边沿型+queue:true
   （delay 分支不求值条件、从进页起算=欢迎词没说完就催操作，且操作完成后到点照播=过期引导；门=结果未达成/未操作过）；
   ②删照相机结论条 c-s4（拍板「只删照相机」，投影仪 p-s4/放大镜 m-s4 保留）；③含裸字母的 4 条 TTS 文本改中文读法后重录。
   本轮 core 未碰（光线画法 R8-2 已对），只升 guide-data.js?v= */
window.C5S2_GUIDE={
  cam:{
    intro:{text:'模型照相机：前筒嵌凸透镜，后筒蒙薄膜当底片。u大于2f，成倒立缩小的实像。',audio:'c5s2-c-intro'},
    steps:[
      /* R9-2（蔡总 2026-10-29 09:40 条2，拍板「只删照相机结论」）：原第 4 条照相机结论条 + 其 audios map 键一并删除
         （mp3 文件留盘不删）；规律由 c-s2「对上焦啦！倒立、缩小的实像」+ free c-f1「物近、像远、像变大」承担。
         投影仪 p-s4 / 放大镜 m-s4 两条结论保留不动。
         条1a 同病（裸 delay 过期引导）：c-s1 delay:10000 → 电平边沿型 + queue，门 R.cam.focused===false=已对上焦则永久闭嘴 */
      {id:'c5s2-c-s1',repeat:true,queue:true,trigger:'(G.t-G.modeEnterT)>10000 && R.cam.focused===false',say:'拖动后面的纸筒调筒距，直到薄膜上的F变清晰。',audio:'c5s2-c-s1'},
      {id:'c5s2-c-s2',repeat:true,trigger:'R.cam.focused===true',say:'对上焦啦！倒立、缩小的实像。',audio:'c5s2-c-s2'},
      {id:'c5s2-c-s3',repeat:true,trigger:'R.cam.everDragLed===true && R.cam.focused===false && R.cam.u<22',say:'物移近了像会变大，拉长后筒重新对焦。',audio:'c5s2-c-s3'}
    ],
    errors:[
      {id:'c5s2-c-e1',trigger:'(R.cam.vTube<=9.05||R.cam.vTube>=14.95) && R.cam.focused===false',fix:'不对哟～筒到头还不清晰，微调物距再试试。',audio:'c5s2-c-e1'}
    ],
    free:[
      {trigger:'R.cam.focused===true && R.cam.everDragLed===true && R.cam.u<22',note:'物近、像远、像变大，规律就是这个～',audio:'c5s2-c-f1'}
    ],
    tasks:[]
  },
  proj:{
    intro:{text:'投影仪：投影片放在f和2f之间，幕布上成倒立放大的实像。先调焦找到清晰的像！',audio:'c5s2-p-intro'},
    steps:[
      /* R9-2 条1a 同病：p-s1 裸 delay:10500 → 电平边沿型+queue，门 R.proj.focused===false */
      {id:'c5s2-p-s1',repeat:true,queue:true,trigger:'(G.t-G.modeEnterT)>10500 && R.proj.focused===false',say:'拖动调焦滑杆或透镜，让幕布上出现清晰的像。',audio:'c5s2-p-s1'},
      {id:'c5s2-p-s2',repeat:true,trigger:'R.proj.focused===true',say:'清晰啦！幕布上是倒立、放大的实像。',audio:'c5s2-p-s2'},
      {id:'c5s2-p-s3',repeat:true,trigger:'R.proj.flipped===true',say:'投影片倒插，屏幕上的像就正立啦。',audio:'c5s2-p-s3'},
      {id:'c5s2-p-s4',repeat:true,trigger:'after:c5s2-p-s3@6000',say:'因此我们得出结论：投影仪成倒立放大的实像。',audio:'c5s2-p-s4'}
    ],
    errors:[
      {id:'c5s2-p-e1',trigger:'R.proj.u>=9.4 && R.proj.focused===false',fix:'不对哟～透镜拖太远啦，往回慢慢移看幕布对焦。',audio:'c5s2-p-e1'}
    ],
    free:[
      {trigger:'R.proj.everFlip===true && R.proj.flipped===false',note:'正着插回去，屏上的像又颠倒啦。',audio:'c5s2-p-f1'}
    ],
    tasks:[]
  },
  mag:{
    intro:{text:'放大镜就是凸透镜：u小于f，透过透镜看到正立放大的虚像，和物体在同一侧。',audio:'c5s2-m-intro'},
    steps:[
      /* R9-2 条1a 同病：m-s1 裸 delay:9200 → 电平边沿型+queue，门 R.mag.everDrag===false（未拖过放大镜才播） */
      {id:'c5s2-m-s1',repeat:true,queue:true,trigger:'(G.t-G.modeEnterT)>9200 && R.mag.everDrag===false',say:'拖动放大镜远离物体，看虚像越来越大。',audio:'c5s2-m-s1'},
      {id:'c5s2-m-s2',repeat:true,trigger:'R.mag.everDrag===true',say:'透过透镜看：正立放大的虚像，和物体同侧。',audio:'c5s2-m-s2'},
      {id:'c5s2-m-s3',repeat:true,trigger:'R.mag.everScreen===true',say:'屏上没有像——虚像不能用光屏承接。',audio:'c5s2-m-s3'},
      {id:'c5s2-m-s4',repeat:true,trigger:'after:c5s2-m-s3@6000',say:'因此我们得出结论：放大镜成正立放大的虚像。',audio:'c5s2-m-s4'}
    ],
    errors:[
      {id:'c5s2-m-e1',trigger:'R.mag.u>=6.95',fix:'不对哟～放大镜要在焦点以内用，往回拉一点。',audio:'c5s2-m-e1'}
    ],
    free:[
      {trigger:'R.mag.u>=6.8 && R.mag.u<6.95',note:'越接近焦点，虚像越大也越淡哦。',audio:'c5s2-m-f1'}
    ],
    tasks:[]
  },
  audios:{
    /* R9-2（蔡总 09:40 条5e延伸）：4 条含裸字母的 intro/引导重录，TTS 文本 u/f/2f→物距/焦距/二倍焦距、c-s1 去 F；
       屏幕 say/text 原文保留符号不动（?v=20261029v4 防缓存） */
    'c5s2-c-intro':'guide/audio/c5s2-c-intro.mp3?v=20261029v4',
    'c5s2-c-s1':'guide/audio/c5s2-c-s1.mp3?v=20261029v4','c5s2-c-s2':'guide/audio/c5s2-c-s2.mp3',
    /* R9-2 条2：照相机结论条的音频键已删除（mp3 文件留盘不删） */
    'c5s2-c-s3':'guide/audio/c5s2-c-s3.mp3',
    'c5s2-c-e1':'guide/audio/c5s2-c-e1.mp3','c5s2-c-f1':'guide/audio/c5s2-c-f1.mp3',
    'c5s2-p-intro':'guide/audio/c5s2-p-intro.mp3?v=20261029v4',
    'c5s2-p-s1':'guide/audio/c5s2-p-s1.mp3','c5s2-p-s2':'guide/audio/c5s2-p-s2.mp3',
    'c5s2-p-s3':'guide/audio/c5s2-p-s3.mp3','c5s2-p-s4':'guide/audio/c5s2-p-s4.mp3',
    'c5s2-p-e1':'guide/audio/c5s2-p-e1.mp3','c5s2-p-f1':'guide/audio/c5s2-p-f1.mp3',
    'c5s2-m-intro':'guide/audio/c5s2-m-intro.mp3?v=20261029v4',
    'c5s2-m-s1':'guide/audio/c5s2-m-s1.mp3','c5s2-m-s2':'guide/audio/c5s2-m-s2.mp3',
    'c5s2-m-s3':'guide/audio/c5s2-m-s3.mp3','c5s2-m-s4':'guide/audio/c5s2-m-s4.mp3',
    'c5s2-m-e1':'guide/audio/c5s2-m-e1.mp3','c5s2-m-f1':'guide/audio/c5s2-m-f1.mp3'
  }
};
window.GUIDE_CFG={state:window.C5S2_STATE,get mode(){return window.C5S2_STATE.scene;}};
window.GUIDE_DATA=window.C5S2_GUIDE;

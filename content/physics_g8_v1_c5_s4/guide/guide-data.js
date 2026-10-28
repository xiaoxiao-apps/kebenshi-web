/* content/physics_g8_v1_c5_s4/guide/guide-data.js */
window.C5S4_GUIDE={
  normal:{
    intro:{text:'欢迎来到眼睛成像实验室！晶状体相当于凸透镜，视网膜是光屏，睫状体自动调节厚薄，跟我看！',audio:'c5s4-n-intro'},
    steps:[
      {id:'c5s4-n1',repeat:true,trigger:'delay:10700',say:'拖左侧的小树远近变化，看晶状体自动变厚变薄。',audio:'c5s4-n1'},
      {id:'c5s4-n2',repeat:true,trigger:'R.uK<1.6 && R.glass===null',say:'看近处：睫状体收缩，晶状体变厚，像仍然清晰。',audio:'c5s4-n2'},
      {id:'c5s4-n3',repeat:true,trigger:'after:c5s4-n2@6000',say:'因此我们得出结论：睫状体调节厚薄，远近都清晰。',audio:'c5s4-n3'}
    ],
    errors:[
      {id:'c5s4-en1',trigger:'R.glass!==null',fix:'不对哟～正常眼不用戴眼镜，戴上像反而模糊啦。',audio:'c5s4-en1'}
    ],
    free:[
      {trigger:'R.showFlow===true',note:'光流开啦：蓝色脉冲标出光进眼睛的路线。',audio:'c5s4-fn1'}
    ],
    tasks:[]
  },
  myopia:{
    intro:{text:'近视眼：晶状体太厚折光太强，远处的像落在视网膜前。看，远处模糊、近处清楚，凹透镜能矫正！',audio:'c5s4-m-intro'},
    steps:[
      {id:'c5s4-m1',repeat:true,trigger:'!R.sharp && R.imgWhere===\'视网膜前\' && (G.t-G.modeEnterT)>11600',say:'看远处时，像会聚在视网膜前，只剩模糊光斑。',audio:'c5s4-m1'},
      {id:'c5s4-m2',repeat:true,trigger:'R.sharp===true && R.uK<1.6 && R.glass===null',say:'把树拖近就清晰啦：近视看近清楚、看远模糊。',audio:'c5s4-m2'},
      {id:'c5s4-m3',repeat:true,trigger:'R.glass===\'concave\' && R.sharp===true',say:'矫正成功！凹透镜先发散，像被拉回视网膜上。',audio:'c5s4-m3'},
      {id:'c5s4-m4',repeat:true,trigger:'after:c5s4-m3@6000',say:'因此我们得出结论：近视要戴凹透镜做的眼镜。',audio:'c5s4-m4'}
    ],
    errors:[
      {id:'c5s4-em1',trigger:'R.glass===\'convex\'',fix:'不对哟～近视该戴凹透镜，凸透镜让像更散哦。',audio:'c5s4-em1'}
    ],
    free:[
      {trigger:'R.auto===false',note:'自动关啦：拖厚度滑杆，看会聚点前后移动。',audio:'c5s4-fm1'},
      {trigger:'R.showFlow===true',note:'光流开啦：看清光怎样先经凹透镜发散。',audio:'c5s4-fm2'}
    ],
    tasks:[]
  },
  hyper:{
    intro:{text:'远视眼就是老花眼：晶状体太薄折光太弱，近处的像落在视网膜后。凸透镜老花镜来帮忙，试试！',audio:'c5s4-h-intro'},
    steps:[
      {id:'c5s4-h1',repeat:true,trigger:'!R.sharp && R.imgWhere===\'视网膜后\' && (G.t-G.modeEnterT)>11000',say:'会聚点落在视网膜后，近处的物体看不清啦。',audio:'c5s4-h1'},
      {id:'c5s4-h2',repeat:true,trigger:'R.sharp===true && R.uK>1.95 && R.glass===null && (G.t-G.modeEnterT)>11000',say:'看远处是清晰的；把树拖近，试试模糊光斑。',audio:'c5s4-h2'},
      {id:'c5s4-h3',repeat:true,trigger:'R.glass===\'convex\' && R.sharp===true',say:'矫正成功！凸透镜先会聚，像前移回视网膜。',audio:'c5s4-h3'},
      {id:'c5s4-h4',repeat:true,trigger:'after:c5s4-h3@6000',say:'因此我们得出结论：远视戴凸透镜，老花镜就是它。',audio:'c5s4-h4'}
    ],
    errors:[
      {id:'c5s4-eh1',trigger:'R.glass===\'concave\'',fix:'不对哟～远视该戴凸透镜，把凹镜拖回托盘换一片。',audio:'c5s4-eh1'}
    ],
    free:[
      {trigger:'R.auto===false',note:'自动关啦：拖滑杆调厚薄，自己找清晰像点。',audio:'c5s4-fh1'},
      {trigger:'R.showFlow===true',note:'光流开啦：看清光怎样先经凸透镜会聚。',audio:'c5s4-fh2'}
    ],
    tasks:[]
  },
  audios:{
    'c5s4-n-intro':'guide/audio/c5s4-n-intro.mp3',
    'c5s4-n1':'guide/audio/c5s4-n1.mp3','c5s4-n2':'guide/audio/c5s4-n2.mp3','c5s4-n3':'guide/audio/c5s4-n3.mp3',
    'c5s4-en1':'guide/audio/c5s4-en1.mp3','c5s4-fn1':'guide/audio/c5s4-fn1.mp3',
    'c5s4-m-intro':'guide/audio/c5s4-m-intro.mp3',
    'c5s4-m1':'guide/audio/c5s4-m1.mp3','c5s4-m2':'guide/audio/c5s4-m2.mp3',
    'c5s4-m3':'guide/audio/c5s4-m3.mp3','c5s4-m4':'guide/audio/c5s4-m4.mp3',
    'c5s4-em1':'guide/audio/c5s4-em1.mp3','c5s4-fm1':'guide/audio/c5s4-fm1.mp3','c5s4-fm2':'guide/audio/c5s4-fm2.mp3',
    'c5s4-h-intro':'guide/audio/c5s4-h-intro.mp3',
    'c5s4-h1':'guide/audio/c5s4-h1.mp3','c5s4-h2':'guide/audio/c5s4-h2.mp3',
    'c5s4-h3':'guide/audio/c5s4-h3.mp3','c5s4-h4':'guide/audio/c5s4-h4.mp3',
    'c5s4-eh1':'guide/audio/c5s4-eh1.mp3','c5s4-fh1':'guide/audio/c5s4-fh1.mp3','c5s4-fh2':'guide/audio/c5s4-fh2.mp3'
  }
};
window.GUIDE_CFG={state:window.C5S4_STATE};/* 多场景页不设 mode key：引擎每帧轮询 R.mode（=st.cond 不可枚举 getter，normal/myopia/hyper） */
window.GUIDE_DATA=window.C5S4_GUIDE;

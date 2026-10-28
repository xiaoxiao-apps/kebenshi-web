/* content/physics_g8_v1_c5_s5/guide/guide-data.js */
window.C5S5_GUIDE={
  refract:{
    intro:{text:'欢迎来到望远镜实验室！物镜成实像，目镜当放大镜，把远处物体的视角放大。先调镜筒距离对焦，跟我来！',audio:'c5s5-intro'},
    steps:[
      {id:'c5s5-s1',repeat:true,trigger:'delay:12000',say:'先拖镜筒滑杆，调物镜和目镜之间的距离。',audio:'c5s5-s1'},
      {id:'c5s5-s2',repeat:true,trigger:'R.matched===true && R.near===false && (G.t-G.modeEnterT)>12000',say:'对焦成功！间距刚好约等于f物加f目。',audio:'c5s5-s2'},
      {id:'c5s5-s3',repeat:true,trigger:'after:c5s5-s2@6000',say:'因此我们得出结论：物镜成像、目镜放大，视角变大。',audio:'c5s5-s3'},
      {id:'c5s5-s4',repeat:true,trigger:'R.matched===false && R.near===false',say:'像模糊啦，慢慢拖动镜筒重新对焦。',audio:'c5s5-s4'},
      {id:'c5s5-s5',repeat:true,trigger:'R.near===true && R.matched===false',say:'换看较近的物体，间距要稍大一些，重新调。',audio:'c5s5-s5'},
      {id:'c5s5-s6',repeat:true,trigger:'R.near===true && R.matched===true',say:'对焦成功！看近物时间距比焦距之和稍大。',audio:'c5s5-s6'},
      {id:'c5s5-s7',repeat:true,trigger:'R.fObj/R.fEye!==2',say:'换镜片啦！放大倍率等于f物除以f目。',audio:'c5s5-s7'}
    ],
    errors:[
      {id:'c5s5-e1',trigger:'!R.matched && Math.abs(R.L-(R.near?R.fObj*1.2+R.fEye:R.fObj+R.fEye))>4@3000',fix:'不对哟～间距偏太多了，慢慢往f物加f目靠。',audio:'c5s5-e1'}
    ],
    free:[
      {trigger:'R.flow===true',note:'光流开啦：看光怎样过物镜、目镜，进入眼睛。',audio:'c5s5-f1'},
      {trigger:'R.showLabels===true',note:'标注开啦：焦距和镜筒距离L都标出来了。',audio:'c5s5-f2'}
    ],
    tasks:[]
  },
  audios:{
    'c5s5-intro':'guide/audio/c5s5-intro.mp3',
    'c5s5-s1':'guide/audio/c5s5-s1.mp3','c5s5-s2':'guide/audio/c5s5-s2.mp3',
    'c5s5-s3':'guide/audio/c5s5-s3.mp3','c5s5-s4':'guide/audio/c5s5-s4.mp3',
    'c5s5-s5':'guide/audio/c5s5-s5.mp3','c5s5-s6':'guide/audio/c5s5-s6.mp3',
    'c5s5-s7':'guide/audio/c5s5-s7.mp3',
    'c5s5-e1':'guide/audio/c5s5-e1.mp3',
    'c5s5-f1':'guide/audio/c5s5-f1.mp3','c5s5-f2':'guide/audio/c5s5-f2.mp3'
  }
};
window.GUIDE_CFG={state:window.C5S5_STATE,mode:'refract'};/* 单场景：mode key 照实设（照 c6s1/c6s2 先例） */
window.GUIDE_DATA=window.C5S5_GUIDE;

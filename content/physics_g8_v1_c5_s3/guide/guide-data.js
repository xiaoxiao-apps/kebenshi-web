/* content/physics_g8_v1_c5_s3/guide/guide-data.js */
/* 语音R2接线波C1：设计书 docs/c5-guide-design-part2.md §B-5 逐字搬入；
   回填（afinfo 实测）：s1 delay 13000→9400（intro 8.424s+1s 取整百）；
   s3 闸门 22000→16400（=s1 delay 9400+s1 音频 4.968s+2s 取整百） */
window.C5S3_GUIDE={
  refract:{
    intro:{text:'光具座探究成像规律：拖光源改物距u，拖光屏找像，f和2f是两条分界线。',audio:'c5s3-intro'},
    steps:[
      {id:'c5s3-s1',repeat:true,trigger:'delay:9400',say:'拖动F光源改变物距u，拖光屏找清晰的像。',audio:'c5s3-s1'},
      {id:'c5s3-s2',repeat:true,trigger:'R.u-R.f>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))>0.6',say:'屏上像模糊啦，拖屏或点寻像找清晰像。',audio:'c5s3-s2'},
      {id:'c5s3-s3',repeat:true,trigger:'R.u>2*R.f && R.u-R.f>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))<=0.6 && (G.t-G.modeEnterT)>16400',say:'现在u大于2f：倒立、缩小的实像。',audio:'c5s3-s3'},
      {id:'c5s3-s4',repeat:true,trigger:'R.u-R.f>0.25 && R.u<2*R.f && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))<=0.6',say:'f和2f之间：倒立、放大的实像。',audio:'c5s3-s4'},
      {id:'c5s3-s5',repeat:true,trigger:'Math.abs(R.u-2*R.f)<=0.25',say:'u等于2f：倒立等大的实像，大小分界。',audio:'c5s3-s5'},
      {id:'c5s3-s6',repeat:true,trigger:'Math.abs(R.u-R.f)<=0.25',say:'u等于f不成像，一倍焦距分虚实。',audio:'c5s3-s6'},
      {id:'c5s3-s7',repeat:true,trigger:'R.f-R.u>0.25',say:'u小于f：正立放大的虚像，物像同侧。',audio:'c5s3-s7'},
      {id:'c5s3-s8',repeat:true,trigger:'R.screenOn===false && R.f-R.u>0.25',say:'撤去光屏，用眼从屏侧观察虚像。',audio:'c5s3-s8'},
      {id:'c5s3-s9',repeat:true,trigger:'R.rows.length>=1 && R.rows.length<3',say:'记下一笔啦！跨三个区每区记一笔。',audio:'c5s3-s9'},
      {id:'c5s3-s10',repeat:true,trigger:'R.rows.length>=3',say:'三组数据齐了，开规律卡对照归纳。',audio:'c5s3-s10'},
      {id:'c5s3-s11',repeat:true,trigger:'after:c5s3-s10@6000',say:'因此我们得出结论：一倍焦距分虚实，二倍焦距分大小。',audio:'c5s3-s11'}
    ],
    errors:[
      {id:'c5s3-e1',trigger:'event:click:#btn-record:R.u-R.f>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))>0.6',fix:'不对哟～屏上像还模糊，先寻像再记录哦。',audio:'c5s3-e1'},
      {id:'c5s3-e2',trigger:'event:click:#btn-auto:Math.abs(R.u-R.f)<=0.25',fix:'不对哟～u等于f不成像，寻像也没用呀。',audio:'c5s3-e2'},
      {id:'c5s3-e3',trigger:'event:click:#btn-auto:R.f-R.u>0.25',fix:'不对哟～虚像屏接不到，撤屏用眼睛看。',audio:'c5s3-e3'}
    ],
    free:[
      {trigger:'R.hand===true && R.u-R.f>0.25',note:'遮住透镜一部分，像仍完整只是变暗。',audio:'c5s3-f1'},
      {trigger:'event:click:#btn-auto:R.u-R.f>0.25',note:'寻像按钮会自动把屏滑到清晰像位。',audio:'c5s3-f2'},
      {trigger:'R.hand===true && R.f-R.u>0.25',note:'遮挡时虚像也完整，只是变暗哟。',audio:'c5s3-f3'},
      {trigger:'R.obj===\'candle\'',note:'换成蜡烛作物体啦，像变烛焰图案。',audio:'c5s3-f4'}
    ],
    tasks:[]
  },
  audios:{
    'c5s3-intro':'guide/audio/c5s3-intro.mp3',
    'c5s3-s1':'guide/audio/c5s3-s1.mp3','c5s3-s2':'guide/audio/c5s3-s2.mp3',
    'c5s3-s3':'guide/audio/c5s3-s3.mp3','c5s3-s4':'guide/audio/c5s3-s4.mp3',
    'c5s3-s5':'guide/audio/c5s3-s5.mp3','c5s3-s6':'guide/audio/c5s3-s6.mp3',
    'c5s3-s7':'guide/audio/c5s3-s7.mp3','c5s3-s8':'guide/audio/c5s3-s8.mp3',
    'c5s3-s9':'guide/audio/c5s3-s9.mp3','c5s3-s10':'guide/audio/c5s3-s10.mp3',
    'c5s3-s11':'guide/audio/c5s3-s11.mp3',
    'c5s3-e1':'guide/audio/c5s3-e1.mp3','c5s3-e2':'guide/audio/c5s3-e2.mp3',
    'c5s3-e3':'guide/audio/c5s3-e3.mp3',
    'c5s3-f1':'guide/audio/c5s3-f1.mp3','c5s3-f2':'guide/audio/c5s3-f2.mp3',
    'c5s3-f3':'guide/audio/c5s3-f3.mp3','c5s3-f4':'guide/audio/c5s3-f4.mp3'
  }
};
window.GUIDE_CFG={state:window.C5S3_STATE,mode:'refract'};
window.GUIDE_DATA=window.C5S3_GUIDE;

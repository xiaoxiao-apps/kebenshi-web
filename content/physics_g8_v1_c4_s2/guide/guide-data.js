'use strict';
/* c4s2 光的反射 · 语音讲解层数据（B 版标配；设计书 docs/c4s2-guide-design.md §1~§4 逐条搬入，文案禁改写）
   模式 key 统一 'refract'（c4s2 为单实验页，引擎 init 后固定 curMode='refract'，无 R.mode 轮询）。
   trigger 存字符串，引擎 new Function 求值；R=window.RFX（render:4 定义，core 原地 mutate，已核实稳定）。
   G.* 为引导层私有字段：G.t / G.modeEnterT / G.angChangeCount / G.lastAngChangeT（监听 R.angleI，350ms 武装，规范§3.2）。
   特殊 trigger 约定（同 c4s3 引擎）：
     "after:c4s2-s1@6000"               = 依赖步触发后延时 6s（规范§2.4，禁 <6000）
     "event:input:#ang-slider:EXPR"     = 滑杆 input capture 即时判态（需引擎适配 A3/A4：tickSteps 跳过 evt 型，事件分发扩展到 steps）
   s1 闸门 15500 = intro 预估 14.5s + 1s 余量，落地必须 afinfo 实测替换（规范§2.3/§4.4）。 */
window.C4S2_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到光的反射实验室！桌上有激光笔、平面镜和白纸板。点开激光，拖一拖、折一折，反射定律的秘密等你亲手找出来！',
      audio:'c4s2-intro'
    },
    steps:[
      {id:'c4s2-s1',repeat:true,trigger:"R.laserOn===true && R.beamMode==='single' && R.fold===0 && R.rough===0 && !R.pulse.reverse && (G.t-G.modeEnterT)>15500",say:'激光开啦！这束红光射向平面镜，叫入射光线。',audio:'c4s2-s1'},
      {id:'c4s2-s2',repeat:true,trigger:'after:c4s2-s1@6000',say:'光打在镜面的 O 点——入射点；反射光也从 O 射出，这条光线叫做反射光线。',audio:'c4s2-s2'},
      {id:'c4s2-s3',repeat:true,trigger:"event:input:#ang-slider:R.laserOn===true && R.beamMode==='single' && R.fold===0 && !R.pulse.reverse",say:'拖动滑杆改入射角，看反射角马上跟着变！',audio:'c4s2-s3'},
      {id:'c4s2-s4',repeat:true,trigger:"R.laserOn===true && R.showNormal===true && R.beamMode==='single' && R.fold===0 && R.rough===0 && !R.pulse.reverse && G.angChangeCount>=1 && (G.t-G.lastAngChangeT)>800",say:'金色虚线是法线，垂直镜面，两个角都从它量起。',audio:'c4s2-s4'},
      {id:'c4s2-s5',repeat:true,trigger:'after:c4s2-s4@6000',say:'看角弧：∠r 和 ∠i 相等，反射角=入射角！',audio:'c4s2-s5'},
      {id:'c4s2-s6',repeat:true,trigger:"R.fold>0 && R.laserOn===true && R.beamMode==='single' && !R.pulse.reverse",say:'纸板一折，反射光线所在的平面没有了，光照不到这个平面上，所以就看不到反射光线了。这说明入射光、反射光和法线三线共面。',audio:'c4s2-s6'},
      {id:'c4s2-s7',repeat:true,trigger:"R.pulse.reverse===true && R.laserOn===true && R.fold===0",say:'光路可逆！沿原反射光路射入，光就沿原入射路射出。',audio:'c4s2-s7'},
      {id:'c4s2-s8',repeat:true,trigger:"R.beamMode==='beam' && R.laserOn===true && R.rough===0 && R.fold===0 && !R.pulse.reverse",say:'平行光照镜面，反射光仍平行——这是镜面反射。',audio:'c4s2-s8'},
      {id:'c4s2-s9',repeat:true,trigger:"R.rough>0 && R.laserOn===true && R.fold===0 && !R.pulse.reverse",say:'表面变粗糙，反射光散向四面八方——漫反射。',audio:'c4s2-s9'},
      {id:'c4s2-concl',repeat:true,trigger:'after:c4s2-s9@6000',say:'记住啦：三线共面、分居法线两侧、反射角等于入射角；镜面反射和漫反射都遵守反射定律，光路还可逆！',audio:'c4s2-concl'}
    ],
    errors:[
      {id:'c4s2-e1',trigger:"event:input:#ang-slider:R.laserOn===false",fix:'不对哟～先点激光笔的红钮开光，再改入射角呀。',audio:'c4s2-e1'},
      {id:'c4s2-e2',trigger:"event:click:#btn-reverse:R.laserOn===false",fix:'不对哟～光还没开呢，先开光源再演示光路可逆。',audio:'c4s2-e2'},
      {id:'c4s2-e3',trigger:"event:change:#surface:R.laserOn===false",fix:'不对哟～先打开光源，再换粗糙面看漫反射哦。',audio:'c4s2-e3'}
    ],
    free:[
      {trigger:"R.dragFb===true && R.laserOn===true && R.beamMode==='single'",note:'拖着激光笔转，入射角实时在变哦。',audio:'c4s2-f1'},
      {trigger:"R.laserOn===true && R.angleI<0.02 && R.beamMode==='single' && R.fold===0 && !R.pulse.reverse",note:'垂直入射：两个角都是 0°，光沿原路返回。',audio:'c4s2-f2'},
      {trigger:"R.showArrow===true && R.laserOn===true",note:'箭头标出传播方向：从 E 经 O 到 F。',audio:'c4s2-f3'},
      {trigger:"event:input:#rough-slider:R.rough>0 && R.laserOn===true",note:'越粗糙，各点法线方向越乱，反射光散得越开。',audio:'c4s2-f4'}
    ],
    tasks:[]
  },
  /* §4 音频 clip 清单 18 条（1 intro + 10 steps + 3 errors + 4 free + 0 tasks，五类 audio 零缺失）；文件名=clip id+'.mp3' */
  audios:{
    'c4s2-intro':'guide/audio/c4s2-intro.mp3',
    'c4s2-s1':'guide/audio/c4s2-s1.mp3',
    'c4s2-s2':'guide/audio/c4s2-s2.mp3?v=20261027r2',
    'c4s2-s3':'guide/audio/c4s2-s3.mp3',
    'c4s2-s4':'guide/audio/c4s2-s4.mp3',
    'c4s2-s5':'guide/audio/c4s2-s5.mp3',
    'c4s2-s6':'guide/audio/c4s2-s6.mp3?v=20261027r2',
    'c4s2-s7':'guide/audio/c4s2-s7.mp3',
    'c4s2-s8':'guide/audio/c4s2-s8.mp3',
    'c4s2-s9':'guide/audio/c4s2-s9.mp3',
    'c4s2-concl':'guide/audio/c4s2-concl.mp3',
    'c4s2-e1':'guide/audio/c4s2-e1.mp3',
    'c4s2-e2':'guide/audio/c4s2-e2.mp3',
    'c4s2-e3':'guide/audio/c4s2-e3.mp3',
    'c4s2-f1':'guide/audio/c4s2-f1.mp3',
    'c4s2-f2':'guide/audio/c4s2-f2.mp3',
    'c4s2-f3':'guide/audio/c4s2-f3.mp3',
    'c4s2-f4':'guide/audio/c4s2-f4.mp3'
  }
};
window.GUIDE_DATA=window.C4S2_GUIDE;

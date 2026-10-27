'use strict';
/* c4s5 光的色散实验室 · 语音讲解层数据（设计书 docs/c4s5-guide-design.md §1~§4 逐字搬入，禁改写）
   状态源=window.DSP（exp-dispersion-render.js L4 定义，稳定 mutate）；页面接线：
   window.GUIDE_CFG={state:window.DSP,mode:'refract'};window.GUIDE_DATA=window.C4S5_GUIDE;
   trigger 约定（engine-core.js）：
     "after:c4s5-s1@6000"              = 依赖步触发后延时 6s（规范 §2.4，延时≥6s）
     "event:input:#prism-slider:EXPR"  = 滑杆 input capture 即时判态（EXPR 只读稳定 R 字段/DOM 新值）
     "event:change:#cb-rays:EXPR"      = 勾选变更即时判态（capture 时 .checked 已是新值）
   ⚠ 禁把 steps 改成 expr@hold 形式：engine tickSteps 的 repeat+hold 分支永不触发（设计书 -1.5 第 1 条）。 */
window.C4S5_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到色散实验室！一束白光穿过三棱镜，居然在墙上变出七色光带！白光为什么藏着这么多颜色？点亮光源一探究竟吧。',
      audio:'c4s5-intro'
    },
    steps:[
      {id:'c4s5-s1',repeat:true,trigger:"R.mode==='m1' && R.sourceOn===true",say:'点亮啦！一束白光直射向三棱镜。快看墙上！',audio:'c4s5-s1'},
      {id:'c4s5-s2',repeat:true,trigger:'after:c4s5-s1@6000',say:'看！白光散开成红橙黄绿蓝靛紫七色光带啦。你看到了吗？',audio:'c4s5-s2'},
      {id:'c4s5-s3',repeat:true,trigger:'after:c4s5-s2@8000',say:'为什么会分开？各色光偏折程度不一样呀。打开标签看得清。',audio:'c4s5-s3'},
      {id:'c4s5-s4',repeat:true,trigger:"R.mode==='m1' && R.sourceOn===true && R.showLabels===true",say:'紫光偏折最大，红光偏折最小。拖动棱镜再试试。',audio:'c4s5-s4'},
      {id:'c4s5-s5',repeat:true,trigger:"R.mode==='m1' && R.sourceOn===true && Math.abs(R.prism.x-R.W*0.30)>30",say:'棱镜离墙远了，光带宽窄跟着变。接下来切到三原色！',audio:'c4s5-s5'},
      {id:'c4s5-s6',repeat:true,trigger:"R.mode==='m2'",say:'切到三原色啦！红绿蓝就是色光三原色。拉拉滑杆试试。',audio:'c4s5-s6'},
      {id:'c4s5-s7',repeat:true,trigger:'after:c4s5-s6@6000',say:'记住：红绿蓝三色拉到最满，混出来就是白光！',audio:'c4s5-s7'},
      {id:'c4s5-s8',repeat:true,trigger:"R.mode==='m2' && R.R===255 && R.G===255 && R.B===0",say:'神奇吧？红光加绿光，居然混出了黄光！换个配比再试试。',audio:'c4s5-s8'},
      {id:'c4s5-s9',repeat:true,trigger:'after:c4s5-s8@6000',say:'通过刚才的实验，我们发现：白光既能被棱镜色散，也能用色光重新混合出来。记住它哦！',audio:'c4s5-s9'}
    ],
    errors:[
      {id:'c4s5-e1',trigger:"event:input:#prism-slider:R.mode==='m1' && R.sourceOn===false",fix:'不对哟～先点亮光源，才看得见光带往哪儿偏呀。',audio:'c4s5-e1'},
      {id:'c4s5-e2',trigger:"event:change:#cb-rays:R.mode==='m1' && R.sourceOn===true && document.getElementById('cb-rays').checked===false",fix:'不对哟～勾上「光线」才看得到七条光路，勾回来就有。',audio:'c4s5-e2'},
      {id:'c4s5-e3',trigger:"event:input:#r-num:!(/^\\d+$/.test(document.getElementById('r-num').value.trim()) && +document.getElementById('r-num').value.trim()<=255)",fix:'不对哟～只能输入 0 到 255 的整数，红框的不算哦。',audio:'c4s5-e3'}
    ],
    free:[
      {trigger:"event:input:#prism-slider:R.mode==='m1' && R.sourceOn===true",note:'棱镜角度一变，光带整体跟着偏移。',audio:'c4s5-f1'},
      {trigger:"R.mode==='m2' && R.R===255 && R.G===0 && R.B===255",note:'红光加蓝光，混出品红色，好艳丽！',audio:'c4s5-f2'},
      {trigger:"R.mode==='m2' && R.R===0 && R.G===255 && R.B===255",note:'绿光加蓝光，混出青色，清清爽爽。',audio:'c4s5-f3'},
      {trigger:"R.mode==='m2' && R.R===0 && R.G===0 && R.B===0",note:'三色都归零，一点光也没有，黑漆漆。',audio:'c4s5-f4'}
    ],
    tasks:[]
  },
  audios:{
    'c4s5-intro':'guide/audio/c4s5-intro.mp3',
    'c4s5-s1':'guide/audio/c4s5-s1.mp3?v=20261027g1',
    'c4s5-s2':'guide/audio/c4s5-s2.mp3?v=20261027g1',
    'c4s5-s3':'guide/audio/c4s5-s3.mp3?v=20261027g1',
    'c4s5-s4':'guide/audio/c4s5-s4.mp3?v=20261027g1',
    'c4s5-s5':'guide/audio/c4s5-s5.mp3?v=20261027g1',
    'c4s5-s6':'guide/audio/c4s5-s6.mp3?v=20261027g1',
    'c4s5-s7':'guide/audio/c4s5-s7.mp3',
    'c4s5-s8':'guide/audio/c4s5-s8.mp3?v=20261027g1',
    'c4s5-s9':'guide/audio/c4s5-s9.mp3?v=20261027g1',
    'c4s5-e1':'guide/audio/c4s5-e1.mp3',
    'c4s5-e2':'guide/audio/c4s5-e2.mp3',
    'c4s5-e3':'guide/audio/c4s5-e3.mp3',
    'c4s5-f1':'guide/audio/c4s5-f1.mp3',
    'c4s5-f2':'guide/audio/c4s5-f2.mp3',
    'c4s5-f3':'guide/audio/c4s5-f3.mp3',
    'c4s5-f4':'guide/audio/c4s5-f4.mp3'
  }
};
window.GUIDE_DATA=window.C4S5_GUIDE;

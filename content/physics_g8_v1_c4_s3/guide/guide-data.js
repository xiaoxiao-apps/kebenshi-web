'use strict';
/* content/physics_g8_v1_c4_s3/guide/guide-data.js
   语音R2波W-A：自 guide/script.js（旧四变体共享数据）直搬 m1/m2/m3 的 intro/steps/errors/free，删 tasks/cSequence。
   trigger DSL 与 _lib/guide/engine-core.js 同源；G.* 私有字段（objChangeCount/lastObjChangeT/eqMoveGestureCount/recCount/matchedEdgeCount/angleWasOff/eqEverOn/everLit）由现引擎 resetG/updateG 维护。
   intro/concl 6条骨架文案按G1引导语风格重制（TTS 20261028v1）；m2-s1/m3-s1 delay 按新 intro 实测时长回填（13.824s→14800 / 12.552s→13600）。 */
window.C4S3_GUIDE={
  m1:{
    intro:{
      text:'欢迎来到成像探究台！这个实验我们要弄清楚，平面镜成的像跟物体到底有啥关系。先点燃蜡烛，再拿没点燃的等效蜡烛去找像的位置，跟我来！',
      audio:'c4s3-m1-intro'
    },
    steps:[
      {id:'m1-s1',repeat:true,trigger:"R.objLit===true && R.eqState==='off'",say:'点燃啦！火苗亮了，玻璃板里的像才看得清哦。',audio:'c4s3-m1-s1'},
      {id:'m1-s2',repeat:true,trigger:"R.objLit && !R.eqOn && G.objChangeCount>=1 && Math.abs(R.doCm-G.do0)>=2 && (G.t-G.lastObjChangeT)<1600",say:'蜡烛移远，像也跟着移远，大小可没变哦。',audio:'c4s3-m1-s2'},
      {id:'m1-s3',repeat:true,trigger:"R.eqOn===true && (R.eqState==='tray'||R.eqState==='held')",say:'等效蜡烛拿出来了，把它拖到玻璃板后面去。',audio:'c4s3-m1-s3'},
      {id:'m1-s4',repeat:true,trigger:"R.eqState==='placed' && !R.matched && R.eqDo>=0 && (G.t-G.lastEqChangeT)>800",say:'慢慢挪，让它跟板里的像完全重合。',audio:'c4s3-m1-s4'},
      {id:'m1-s4b',repeat:true,trigger:"R.eqState==='placed' && !R.matched && G.eqMoveGestureCount>=1 && (G.t-G.lastEqChangeT)<1600 && Math.abs(R.eqDo-R.doCm)>3",say:'差一点啦～像在板后跟物对称的位置，距离相等哦。',audio:'c4s3-m1-e4'},
      {id:'m1-s5',repeat:true,trigger:"R.matched===true",say:'重合了！像和物等大，到镜面距离也相等。',audio:'c4s3-m1-s5'},
      {id:'m1-s6',repeat:true,trigger:"G.recCount===1",say:'记下第一组！物距和像距是不是相等呀？',audio:'c4s3-m1-s6'},
      {id:'m1-s7',repeat:true,trigger:"G.recCount===2",say:'换个物距再做一次，规律还成立吗？',audio:'c4s3-m1-s7'},
      {id:'m1-s8',repeat:true,trigger:"G.recCount>=3",say:'三组数据都说明：等大、等距、对称、虚像！',audio:'c4s3-m1-s8'},
      {id:'m1-concl',repeat:true,trigger:'after:m1-s5@6000',say:'通过刚才的实验，我们发现：平面镜成的像，跟物体大小相等，像距等于物距，关于镜面对称，而且是虚像。记住它哦！',audio:'c4s3-m1-concl'}
    ],
    errors:[
      {id:'m1-e1',trigger:"R.eqState==='placed' && R.eqDo<0",fix:'不对哟～等效蜡烛要放到玻璃板后面，像在那边呢。',audio:'c4s3-m1-e1'},
      {id:'m1-e2',trigger:"event:click:#btn-rec:R.objLit===false",fix:'不对哟～先点蜡烛点燃，才有像可以记录呀。',audio:'c4s3-m1-e2'},
      {id:'m1-e3',trigger:"event:input:#obj-slider:R.objLit && !R.eqOn && !G.eqEverOn && G.objChangeCount>=2",fix:'别急哟～先开「等效蜡烛」找到像的位置，再换物距。',audio:'c4s3-m1-e3'},
      {id:'m1-e5',trigger:"event:click:#btn-rec:G.recCount>=3",fix:'记录表满啦～点「清除」腾出空行再记吧。',audio:'c4s3-m1-e5'}
    ],
    free:[
      {trigger:"event:input:#obj-slider:R.objLit",note:'物距在变，像距跟着变，两支蜡烛始终对称。',audio:'c4s3-m1-f1'},
      {trigger:"R.showAux===true",note:'辅助线连出像和物，连线跟板面垂直呢。',audio:'c4s3-m1-f2'},
      {trigger:"R.objLit===false && G.everLit",note:'蜡烛灭了，像也跟着消失了。',audio:'c4s3-m1-f3'},
      {trigger:"R.matched===true && G.matchedEdgeCount>=2",note:'又重合了，等大等距的规律一直都在。',audio:'c4s3-m1-f4'}
    ]
  },
  m2:{
    intro:{
      text:'欢迎来到虚像原理台！这个实验我们要弄清楚，镜子里的像光到底有没有到过那儿。先打开光线显示，追一条从烛焰S点出发的反射光，跟我来！',
      audio:'c4s3-m2-intro'
    },
    steps:[
      {id:'m2-s1',repeat:true,trigger:"delay:14800",say:'烛焰上这个亮点叫 S，光从它射向四面八方。',audio:'c4s3-m2-s1'},
      {id:'m2-s2',repeat:true,trigger:"R.m2.showRay===true",say:'光射到镜面反射出去，反射光进入眼睛。',audio:'c4s3-m2-s2'},
      {id:'m2-s3',repeat:true,trigger:"R.m2.showExt===true && R.m2.showRay",say:'把反射光线反向延长，它们全交在 S′ 一点！',audio:'c4s3-m2-s3'},
      {id:'m2-s4',repeat:true,trigger:"R.m2.eye.inBeam===true",say:'眼睛逆着反射光看去，S′ 的像一下子亮了。',audio:'c4s3-m2-s4'},
      {id:'m2-s5',repeat:true,trigger:"R.m2.screenAtSp===true",say:'光屏承接不到！S′ 没有光真正到达，是虚像。',audio:'c4s3-m2-s5'},
      {id:'m2-s6',repeat:true,trigger:"R.m2.showSym===true",say:'看，S 和 S′ 关于镜面对称，距离相等。',audio:'c4s3-m2-s6'},
      {id:'m2-concl',repeat:true,trigger:'after:m2-s5@6000',say:'通过刚才的实验，我们发现：平面镜的像，是反射光线反向延长线交出来的，没有光真正到达那里，所以是虚像。记住它哦！',audio:'c4s3-m2-concl'}
    ],
    errors:[
      {id:'m2-e1',trigger:"R.m2.screen.state!=='tray' && !R.m2.showRay",fix:'不对哟～先打开「入射-反射线」，再拖光屏去试。',audio:'c4s3-m2-e1'},
      {id:'m2-e2',trigger:"R.m2.showExt===true && !R.m2.showRay@2000",fix:'不对哟～先开入射-反射线，反向延长线才有依托呀。',audio:'c4s3-m2-e2'},
      {id:'m2-e3',trigger:"R.m2.eye.state==='placed' && !R.m2.showRay",fix:'没有光线可接收，眼睛看不到像哟～先开光线显示。',audio:'c4s3-m2-e3'},
      {id:'m2-e4',trigger:"R.m2.screen.state==='placed' && !R.m2.screenAtSp && R.m2.showExt@2000",fix:'把光屏放到虚线交点 S′ 那里，看能不能承接到像。',audio:'c4s3-m2-e4'}
    ],
    free:[
      {trigger:"R.m2.dragS===true",note:'S 移到哪，S′ 就对称地跟到哪。',audio:'c4s3-m2-f1'},
      {trigger:"R.m2.showNormal===true",note:'法线垂直镜面，反射角等于入射角。',audio:'c4s3-m2-f2'},
      {trigger:"R.m2.eye.state==='placed' && !R.m2.eye.inBeam && R.m2.showRay",note:'眼睛在光束外，接收不到反射光，像变暗了。',audio:'c4s3-m2-f3'},
      {trigger:"R.m2.screen.state==='placed' && !R.m2.screenAtSp",note:'光屏立在这儿，上面什么像也没有。',audio:'c4s3-m2-f4'},
      {trigger:"R.m2.showSym===true",note:'对称标注画出来了，S 和 S′ 等距。',audio:'c4s3-m2-f5'}
    ]
  },
  m3:{
    intro:{
      text:'欢迎来到潜望镜台！这个实验我们要弄清楚，潜艇藏在水下怎么看到水面上的船。先把两块小镜子装进潜望镜的卡槽里，跟我来！',
      audio:'c4s3-m3-intro'
    },
    steps:[
      {id:'m3-s1',repeat:true,trigger:"delay:13600",say:'潜艇藏在水下，靠潜望镜把光接力送进艇里。',audio:'c4s3-m3-s1'},
      {id:'m3-s2',repeat:true,trigger:"(R.m3.top.state==='slot' || R.m3.bottom.state==='slot')",say:'装好一面镜子啦，再把另一面也装进卡槽。',audio:'c4s3-m3-s2'},
      {id:'m3-s3',repeat:true,trigger:"R.m3.top.state==='slot' && R.m3.bottom.state==='slot'",say:'两面镜子都到位，角度保持 45° 刚刚好。',audio:'c4s3-m3-s3'},
      {id:'m3-s4',repeat:true,trigger:"R.m3.showPath===true && R.m3.inEye",say:'光两次转折，走 Z 字形，水平射向眼睛啦。',audio:'c4s3-m3-s4'},
      {id:'m3-s5',repeat:true,trigger:"after:m3-s4@6000",say:'瞧右上角，眼睛看到的是水面小船正立的像！',audio:'c4s3-m3-s5'},
      {id:'m3-concl',repeat:true,trigger:"after:m3-s5@6000",say:'通过刚才的实验，我们发现：潜望镜用两块四十五度的平面镜，让光两次反射，水下的人就能看到水面上的景物啦。记住它哦！',audio:'c4s3-m3-concl'}
    ],
    errors:[
      {id:'m3-e1',trigger:"R.m3.showPath===true && (R.m3.top.state!=='slot' || R.m3.bottom.state!=='slot')",fix:'不对哟～先把两块镜子都装进卡槽，光才有得反射。',audio:'c4s3-m3-e1'},
      {id:'m3-e2',trigger:"R.m3.path && R.m3.path.wall",fix:'光打到管壁上去啦～把角度调回 45° 试试。',audio:'c4s3-m3-e2'},
      {id:'m3-e3',trigger:"R.m3.top.state==='placed' || R.m3.bottom.state==='placed'@1500",fix:'镜子没进卡槽哟～把它拖到卡槽圆圈里才算装好。',audio:'c4s3-m3-e3'}
    ],
    free:[
      {trigger:"Math.abs(R.m3.angle-45)>0.5",note:'角度一变，光就不走 Z 字形路线了。',audio:'c4s3-m3-f1'},
      {trigger:"R.m3.angle===45 && G.angleWasOff",note:'回到 45°，光路又通了。',audio:'c4s3-m3-f2'},
      {trigger:"R.m3.top.state==='held' || R.m3.bottom.state==='held'",note:'镜子在你手里，卡槽还空着呢。',audio:'c4s3-m3-f3'},
      {trigger:"R.m3.showPath===false && R.m3.inEye",note:'镜子装好了，开「显示光路」能看到光的走法。',audio:'c4s3-m3-f4'}
    ]
  },
  audios:{
    'c4s3-m1-intro':'guide/audio/c4s3-m1-intro.mp3?v=20261028v1',
    'c4s3-m1-concl':'guide/audio/c4s3-m1-concl.mp3?v=20261028v1',
    'c4s3-m2-intro':'guide/audio/c4s3-m2-intro.mp3?v=20261028v1',
    'c4s3-m2-concl':'guide/audio/c4s3-m2-concl.mp3?v=20261028v1',
    'c4s3-m3-intro':'guide/audio/c4s3-m3-intro.mp3?v=20261028v1',
    'c4s3-m3-concl':'guide/audio/c4s3-m3-concl.mp3?v=20261028v1',
    'c4s3-m1-s1':'guide/audio/c4s3-m1-s1.mp3',
    'c4s3-m1-s2':'guide/audio/c4s3-m1-s2.mp3',
    'c4s3-m1-s3':'guide/audio/c4s3-m1-s3.mp3',
    'c4s3-m1-s4':'guide/audio/c4s3-m1-s4.mp3',
    'c4s3-m1-s5':'guide/audio/c4s3-m1-s5.mp3',
    'c4s3-m1-s6':'guide/audio/c4s3-m1-s6.mp3',
    'c4s3-m1-s7':'guide/audio/c4s3-m1-s7.mp3',
    'c4s3-m1-s8':'guide/audio/c4s3-m1-s8.mp3',
    'c4s3-m1-e1':'guide/audio/c4s3-m1-e1.mp3',
    'c4s3-m1-e2':'guide/audio/c4s3-m1-e2.mp3',
    'c4s3-m1-e3':'guide/audio/c4s3-m1-e3.mp3',
    'c4s3-m1-e4':'guide/audio/c4s3-m1-e4.mp3',
    'c4s3-m1-e5':'guide/audio/c4s3-m1-e5.mp3',
    'c4s3-m1-f1':'guide/audio/c4s3-m1-f1.mp3',
    'c4s3-m1-f2':'guide/audio/c4s3-m1-f2.mp3',
    'c4s3-m1-f3':'guide/audio/c4s3-m1-f3.mp3',
    'c4s3-m1-f4':'guide/audio/c4s3-m1-f4.mp3',
    'c4s3-m2-s1':'guide/audio/c4s3-m2-s1.mp3',
    'c4s3-m2-s2':'guide/audio/c4s3-m2-s2.mp3',
    'c4s3-m2-s3':'guide/audio/c4s3-m2-s3.mp3',
    'c4s3-m2-s4':'guide/audio/c4s3-m2-s4.mp3',
    'c4s3-m2-s5':'guide/audio/c4s3-m2-s5.mp3',
    'c4s3-m2-s6':'guide/audio/c4s3-m2-s6.mp3',
    'c4s3-m2-e1':'guide/audio/c4s3-m2-e1.mp3',
    'c4s3-m2-e2':'guide/audio/c4s3-m2-e2.mp3',
    'c4s3-m2-e3':'guide/audio/c4s3-m2-e3.mp3',
    'c4s3-m2-e4':'guide/audio/c4s3-m2-e4.mp3',
    'c4s3-m2-f1':'guide/audio/c4s3-m2-f1.mp3',
    'c4s3-m2-f2':'guide/audio/c4s3-m2-f2.mp3',
    'c4s3-m2-f3':'guide/audio/c4s3-m2-f3.mp3',
    'c4s3-m2-f4':'guide/audio/c4s3-m2-f4.mp3',
    'c4s3-m2-f5':'guide/audio/c4s3-m2-f5.mp3',
    'c4s3-m3-s1':'guide/audio/c4s3-m3-s1.mp3',
    'c4s3-m3-s2':'guide/audio/c4s3-m3-s2.mp3',
    'c4s3-m3-s3':'guide/audio/c4s3-m3-s3.mp3',
    'c4s3-m3-s4':'guide/audio/c4s3-m3-s4.mp3',
    'c4s3-m3-s5':'guide/audio/c4s3-m3-s5.mp3',
    'c4s3-m3-e1':'guide/audio/c4s3-m3-e1.mp3',
    'c4s3-m3-e2':'guide/audio/c4s3-m3-e2.mp3',
    'c4s3-m3-e3':'guide/audio/c4s3-m3-e3.mp3',
    'c4s3-m3-f1':'guide/audio/c4s3-m3-f1.mp3',
    'c4s3-m3-f2':'guide/audio/c4s3-m3-f2.mp3',
    'c4s3-m3-f3':'guide/audio/c4s3-m3-f3.mp3',
    'c4s3-m3-f4':'guide/audio/c4s3-m3-f4.mp3'
  }
};
window.GUIDE_DATA=window.C4S3_GUIDE;

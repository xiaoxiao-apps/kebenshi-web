'use strict';
/* c4s3 平面镜成像 · 四变体讲解层共享数据（设计书 docs/c4s3-guide-variants-design.md §0~§7 逐条搬入；文案逐字照抄，禁改写）
   trigger 存字符串，由 engine.js 用 new Function 求值；G.* 为引导层私有进度字段（§0.3），engine 维护，不污染 window.MRR。
   特殊 trigger 约定：
     "delay:2000"            = 进模式后延时 2s 触发一次（§1 m2-s1 / m3-s1）
     "expr@2000"             = 条件须持续 2s 才触发（§2 m1-e4 / m2-e4 / m3-e3）
     "event:click:#btn-rec:EXPR"  = 点击时即时判态（§2 m1-e2 / m1-e5）
     "event:input:#obj-slider:EXPR" = 滑杆 input 时即时判态（§2 m1-e3 / §7 M1 物距自由玩）
     "event:input:#obj-slider"      = 纯事件无表达式（§7 M1 物距自由玩）
     "after:m3-s4@1500"      = m3-s4 触发后延时 1.5s（§1 m3-s5，同一状态拆两条避免塞两个知识点）
   canvas 高亮目标存字段路径（如 "R.m2.S"），坐标运行时取（§5）。 */
window.C4S3_SCRIPT={
  m1:{
    intro:{
      text:'欢迎来成像探究台！桌上立着薄玻璃板，点一支蜡烛放板前，再拿一支没点燃的去找像的位置——像和物到底啥关系？动手试试就知道。',
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
      {id:'m1-concl',repeat:true,trigger:'after:m1-s5@6000',say:'因此我们得出结论：平面镜成的像，跟物体大小相等，像距等于物距，关于镜面对称，而且是虚像。',audio:'c4s3-m1-concl'}
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
    ],
    tasks:[
      {id:'m1-t1',stage:'predict',q:'点燃蜡烛后，玻璃板里的像跟蜡烛比，大小会怎样？',options:['一样大','比蜡烛小','比蜡烛大'],answer:0,done:"R.objLit===true",praise:'对啦！像和物始终等大，记住咯～',retry:'咦？去点燃蜡烛，仔细比比像和蜡烛的大小再选～'},
      {id:'m1-t2',stage:'predict',q:'把蜡烛往远离玻璃板的方向移，像会变小吗？',options:['会变小','不变，还是等大','会变大'],answer:1,done:"Math.abs(R.doCm-G.do0)>=3",praise:'厉害！远近只改位置不改大小，「近大远小」是错觉～',retry:'拖蜡烛移远一点，盯着像的大小看，再选一次～'},
      {id:'m1-t3',stage:'act',q:'用等效蜡烛找到像的确切位置！',options:null,answer:null,done:"R.matched===true",praise:'完美重合！这里就是像的位置，等效替代法 get√',retry:'慢慢挪等效蜡烛，跟板里的像对齐就成功啦～'},
      {id:'m1-t4',stage:'verify',q:'看重合时的读数：像距和物距什么关系？',options:['相等','像距更大','物距更大'],answer:0,done:"R.eqOn && G.recCount>=1",praise:'没错！像距=物距，这就是对称～',retry:'看看「物距/像距」两个读数，或记录表里的两列数～'},
      {id:'m1-t5',stage:'verify',q:'换不同物距做三次，结论会变吗？',options:['每次都成立','有时不成立'],answer:0,done:"G.recCount>=3",praise:'三组数据一个结论，这才叫实验验证！',retry:'改物距→重合→再记录，凑满三行看看规律稳不稳～'}
    ]
  },
  m2:{
    intro:{
      text:'镜子里的像，光真的到过那儿吗？我们追一条光线：从烛焰的 S 点出发，看它怎么反射、怎么「骗」过眼睛，变成虚像 S′。',
      audio:'c4s3-m2-intro'
    },
    steps:[
      {id:'m2-s1',repeat:true,trigger:"delay:12000",say:'烛焰上这个亮点叫 S，光从它射向四面八方。',audio:'c4s3-m2-s1'},
      {id:'m2-s2',repeat:true,trigger:"R.m2.showRay===true",say:'光射到镜面反射出去，反射光进入眼睛。',audio:'c4s3-m2-s2'},
      {id:'m2-s3',repeat:true,trigger:"R.m2.showExt===true && R.m2.showRay",say:'把反射光线反向延长，它们全交在 S′ 一点！',audio:'c4s3-m2-s3'},
      {id:'m2-s4',repeat:true,trigger:"R.m2.eye.inBeam===true",say:'眼睛逆着反射光看去，S′ 的像一下子亮了。',audio:'c4s3-m2-s4'},
      {id:'m2-s5',repeat:true,trigger:"R.m2.screenAtSp===true",say:'光屏承接不到！S′ 没有光真正到达，是虚像。',audio:'c4s3-m2-s5'},
      {id:'m2-s6',repeat:true,trigger:"R.m2.showSym===true",say:'看，S 和 S′ 关于镜面对称，距离相等。',audio:'c4s3-m2-s6'},
      {id:'m2-concl',repeat:true,trigger:'after:m2-s5@6000',say:'记住啦：平面镜的像，是反射光线反向延长线交出来的，没有光真正到达那里，所以是虚像。',audio:'c4s3-m2-concl'}
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
    ],
    tasks:[
      {id:'m2-t1',stage:'predict',q:'S 发出的光经镜面反射后进眼睛，人觉得光是从哪来的？',options:['镜面','反射光线反向延长线的交点 S′','S 本身'],answer:1,done:"R.m2.showRay && R.m2.showExt",praise:'对！眼睛爱沿直线倒推，S′ 就是这么「看」出来的～',retry:'打开入射-反射线，再开反向延长线，看虚线交在哪～'},
      {id:'m2-t2',stage:'predict',q:'把光屏放到 S′ 处，能承接到像吗？',options:['能','不能'],answer:1,done:"R.m2.screenAtSp===true",praise:'承接不到！没有光真到 S′，所以叫虚像～',retry:'从托盘拖光屏，放到虚线交点 S′ 上试试看～'},
      {id:'m2-t3',stage:'verify',q:'眼睛在反射光束外面时，还能看到 S′ 的像吗？',options:['能','不能，眼睛要在光束内'],answer:1,done:"R.m2.eye.inBeam===true",praise:'眼睛进光束，像才点亮——看见虚像也是有条件的！',retry:'把眼睛拖进反射光束里和拖出去，对比像的亮暗～'}
    ]
  },
  m3:{
    intro:{
      text:'潜艇潜在水下，怎么看到水面上的船？答案藏在两块小镜子里。把它们装进潜望镜，调好角度，光会走 Z 字形接力跑到你眼睛里。',
      audio:'c4s3-m3-intro'
    },
    steps:[
      {id:'m3-s1',repeat:true,trigger:"delay:13500",say:'潜艇藏在水下，靠潜望镜把光接力送进艇里。',audio:'c4s3-m3-s1'},
      {id:'m3-s2',repeat:true,trigger:"(R.m3.top.state==='slot' || R.m3.bottom.state==='slot')",say:'装好一面镜子啦，再把另一面也装进卡槽。',audio:'c4s3-m3-s2'},
      {id:'m3-s3',repeat:true,trigger:"R.m3.top.state==='slot' && R.m3.bottom.state==='slot'",say:'两面镜子都到位，角度保持 45° 刚刚好。',audio:'c4s3-m3-s3'},
      {id:'m3-s4',repeat:true,trigger:"R.m3.showPath===true && R.m3.inEye",say:'光两次转折，走 Z 字形，水平射向眼睛啦。',audio:'c4s3-m3-s4'},
      {id:'m3-s5',repeat:true,trigger:"after:m3-s4@6000",say:'瞧右上角，眼睛看到的是水面小船正立的像！',audio:'c4s3-m3-s5'},
      {id:'m3-concl',repeat:true,trigger:'after:m3-s5@6000',say:'所以说，潜望镜用两块四十五度的平面镜，让光两次反射，水下的人就能看到水面上的景物啦。',audio:'c4s3-m3-concl'}
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
    ],
    tasks:[
      {id:'m3-t1',stage:'predict',q:'潜望镜里的平面镜，装成多少度角才能把光接力送到眼睛？',options:['30°','45°','60°'],answer:1,done:"R.m3.top.state==='slot' && R.m3.bottom.state==='slot' && R.m3.angle===45",praise:'45° 正解！两次转折后光刚好水平射出～',retry:'装好镜子后拖角度滑杆试试别的角度，光会怎样？'},
      {id:'m3-t2',stage:'predict',q:'光在潜望镜管里一共被反射几次？',options:['1次','2次','3次'],answer:1,done:"R.m3.showPath===true && R.m3.inEye",praise:'两次反射，走个 Z 字形，数对啦！',retry:'打开「显示光路」，跟着光线数一数转折点～'},
      {id:'m3-t3',stage:'verify',q:'艇里的人通过潜望镜看到的水面小船，像是正立还是倒立？',options:['正立','倒立'],answer:0,done:"R.m3.inEye===true",praise:'正立的像！跟直接看水面方向一致，潜艇兵不晕～',retry:'看右上角「潜望镜里看到的」小窗，船是正的还是倒的？'}
    ]
  },
  /* §5 C 版「跟我做」引导序列：M1 8 步 + M2 6 步 + M3 6 步 = 20 步
     target.kind: dom=控件 outline 脉冲圈 | canvas=聚光灯挖洞 | wedge=反射光束多边形区域
     canvas 坐标全部取自 R 实时字段（字段路径），resize 自适应；done 复用 §5 步骤对应的 R/G 状态表达式 */
  cSequence:{
    m1:[
      {target:{kind:'canvas',cx:'R.objX',cy:'R.candleY-R.candleH*0.5',r:'R.candleH*0.6'},focus:'点这里，把蜡烛点燃',done:'R.objLit'},
      {target:{kind:'canvas',holes:[{cx:'R.objX',cy:'R.candleY-R.candleH*0.5',r:'R.candleH*0.6'},{cx:'R.mirrorX+R.doCm*R.k',cy:'R.candleY-R.candleH*0.5',r:'R.candleH*0.6'}],flash:true,dom:'#obj-slider'},focus:'拖动蜡烛改变物距，盯着像看它怎么动、变不变大',done:'G.objChangeCount>=1'},
      {target:{kind:'dom',el:'#btn-eq'},focus:'点「等效蜡烛」，请出测量工具',done:'R.eqOn'},
      {target:{kind:'canvas',pad:10,holes:[{rect:'R.eqTray.card'},{cx:'R.mirrorX+R.doCm*R.k',cy:'R.candleY-R.candleH*0.5',r:'R.candleH*0.5'}]},focus:'从托盘拖出等效蜡烛，放到玻璃板后面',done:"R.eqState==='placed'"},
      {target:{kind:'canvas',cx:'R.mirrorX+R.doCm*R.k',cy:'R.candleY-R.candleH*0.5',r:'R.candleH*0.6'},focus:'左右微调，直到和像完全重合（拼成一支完整蜡烛）',done:'R.matched'},
      {target:{kind:'dom',el:'#btn-rec',fallback:'#btn-table'},focus:'打开记录表，点「记录数据」存下这一组',done:'G.recCount>=1'},
      {target:{kind:'dom',el:'#obj-slider'},focus:'换个物距，重复第 4~6 步，再记两组',done:'G.recCount>=3'},
      {target:{kind:'dom',el:'#cb-aux'},focus:'开辅助线，看像物连线与板面垂直的对称关系',done:'R.showAux===true'}
    ],
    m2:[
      {target:{kind:'canvas',cx:'R.m2.S.x',cy:'R.m2.S.y',r:26},focus:'先认识物点 S，光从它出发',done:null},
      {target:{kind:'dom',el:'#cb-ray'},focus:'勾选「入射-反射线」，看光怎么反射',done:'R.m2.showRay'},
      {target:{kind:'dom',el:'#cb-ext'},focus:'再勾「反向延长线」，看虚线交出的 S′',done:'R.m2.showExt'},
      {target:{kind:'wedge'},focus:'把眼睛拖进反射光束里，像会点亮',done:'R.m2.eye.inBeam'},
      {target:{kind:'canvas',holes:[{cx:'R.m2.tray.slots[0].x',cy:'R.m2.tray.slots[0].y',r:34},{cx:'R.m2.Sp.x',cy:'R.m2.Sp.y',r:28}]},focus:'把光屏拖到 S′，试试能不能承接到像',done:'R.m2.screenAtSp'},
      {target:{kind:'dom',el:'#cb-sym'},focus:'勾「对称标注」看 S/S′ 对称；「法线」看反射角关系',done:'R.m2.showSym'}
    ],
    m3:[
      {target:{kind:'canvas',rect:'R.m3.tray.card',pad:10},focus:'托盘里有两块平面镜',done:"R.m3.top.state!=='tray' || R.m3.bottom.state!=='tray'"},
      {target:{kind:'canvas',cx:'R.m3.topSlot.x',cy:'R.m3.topSlot.y',r:'R.m3.topSlot.r+6'},focus:'拖一块镜子装进上面的卡槽',done:"R.m3.top.state==='slot'"},
      {target:{kind:'canvas',cx:'R.m3.bottomSlot.x',cy:'R.m3.bottomSlot.y',r:'R.m3.bottomSlot.r+6'},focus:'另一块装进下面的卡槽',done:"R.m3.bottom.state==='slot'"},
      {target:{kind:'dom',el:'#angle-slider'},focus:'确认角度是 45.0°（默认已是；拖动感受非45°光打管壁）',done:null},
      {target:{kind:'dom',el:'#cb-path'},focus:'打开「显示光路」，看两次转折',done:'R.m3.showPath===true && R.m3.inEye'},
      {target:{kind:'canvas',rect:{x:'R.W-252',y:36,w:216,h:104},pad:6},focus:'看这里——眼睛看到的是正立的像',done:null}
    ]
  },
  /* §4 B 版音频 clip 清单：34 条（3 intro + 19 步骤 + 12 纠错）；clip id → 文件名 = id + '.mp3'，存 guide/audio/ */
  audios:{
    'c4s3-m1-intro':'guide/audio/c4s3-m1-intro.mp3',
    'c4s3-m2-intro':'guide/audio/c4s3-m2-intro.mp3',
    'c4s3-m3-intro':'guide/audio/c4s3-m3-intro.mp3',
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
    'c4s3-m3-s1':'guide/audio/c4s3-m3-s1.mp3',
    'c4s3-m3-s2':'guide/audio/c4s3-m3-s2.mp3',
    'c4s3-m3-s3':'guide/audio/c4s3-m3-s3.mp3',
    'c4s3-m3-s4':'guide/audio/c4s3-m3-s4.mp3',
    'c4s3-m3-s5':'guide/audio/c4s3-m3-s5.mp3',
    'c4s3-m3-e1':'guide/audio/c4s3-m3-e1.mp3',
    'c4s3-m3-e2':'guide/audio/c4s3-m3-e2.mp3',
    'c4s3-m3-e3':'guide/audio/c4s3-m3-e3.mp3',
    'c4s3-m1-concl':'guide/audio/c4s3-m1-concl.mp3',
    'c4s3-m2-concl':'guide/audio/c4s3-m2-concl.mp3',
    'c4s3-m3-concl':'guide/audio/c4s3-m3-concl.mp3',
    'c4s3-m1-f1':'guide/audio/c4s3-m1-f1.mp3',
    'c4s3-m1-f2':'guide/audio/c4s3-m1-f2.mp3',
    'c4s3-m1-f3':'guide/audio/c4s3-m1-f3.mp3',
    'c4s3-m1-f4':'guide/audio/c4s3-m1-f4.mp3',
    'c4s3-m2-f1':'guide/audio/c4s3-m2-f1.mp3',
    'c4s3-m2-f2':'guide/audio/c4s3-m2-f2.mp3',
    'c4s3-m2-f3':'guide/audio/c4s3-m2-f3.mp3',
    'c4s3-m2-f4':'guide/audio/c4s3-m2-f4.mp3',
    'c4s3-m2-f5':'guide/audio/c4s3-m2-f5.mp3',
    'c4s3-m3-f1':'guide/audio/c4s3-m3-f1.mp3',
    'c4s3-m3-f2':'guide/audio/c4s3-m3-f2.mp3',
    'c4s3-m3-f3':'guide/audio/c4s3-m3-f3.mp3',
    'c4s3-m3-f4':'guide/audio/c4s3-m3-f4.mp3'
  }
};

/* content/physics_g8_v1_c6_s2/guide/guide-data.js */
window.C6S2_GUIDE={
  refract:{
    intro:{text:'欢迎来到密度实验室！密度是物质的身份数值，ρ等于m除以V。先称质量，再测体积，跟我来！',audio:'c6s2-intro'},
    steps:[
      {id:'c6s2-s1',repeat:true,queue:true,trigger:'delay:11300',say:'好，先在下方选材质和大小，把物块拖去天平和量筒。',audio:'c6s2-s1'},
      {id:'c6s2-s2',repeat:true,trigger:'R.scene===\'e3\' && R.e3.mKnown===true && R.e3.vKnown===false',say:'称出质量啦！接下来拖进量筒测体积。',audio:'c6s2-s2'},/* R8主会话热修：加 vKnown===false 排除带——先投筒(vPending)再称质量的补救路径下，mKnown 与 vKnown 同帧变真，旧 trigger 使 s2/s4 双真、数组序 s2 抢先播「接下来拖进量筒测体积」=过期引导（体积已自动补记）；排除后该路径直接播 s4「质量和体积都齐啦」（蔡总「做到哪步播哪步」）；正常顺序（称完质量、体积未测）s2 照播 */
      {id:'c6s2-s3',repeat:true,queue:true,trigger:'R.scene===\'e3\' && R.e3.vKnown===true',say:'好，用排水法，水位差就是物块的体积。',audio:'c6s2-s3'},
      {id:'c6s2-s4',repeat:true,queue:true,trigger:'R.scene===\'e3\' && R.e3.records.length>=1',say:'质量和体积都齐啦！它们的比值会自动记入表格。',audio:'c6s2-s4'},
      /* R8-3（蔡总条4c：打完第1个点就该主动引导换体积，不等用户手动点）：record 入表后双测仍齐(mKnown&&vKnown===true)→真→立即发声引导；点新体积 e3Select 清双测→假；同材质第2、3个体积各提示一次(n>=1&&n<3) */
      {id:'c6s2-s4a',repeat:true,queue:true,trigger:'R.scene===\'e3\' && (function(){var E=R.e3,n=0;for(var i=0;i<E.records.length;i++)if(E.records[i].mat===E.mat)n++;return n>=1&&n<3&&E.mKnown===true&&E.vKnown===true;})()',say:'好，再换这种材质的另一个体积，先称质量、再用量筒测体积，跟刚才一样。',audio:'c6s2-s4a'},
      {id:'c6s2-s5',repeat:true,queue:true,trigger:'R.scene===\'e3\' && R.e3.records.length>=2',say:'看，同种物质的点连成一条过原点的直线。',audio:'c6s2-s5'},
      /* R2-a：同材质三体积全测完→密度定义结论（严谨版；密度定义只由本条给出，s7 只讲成正比不重复定义） */
      {id:'c6s2-s5a',repeat:true,queue:true,trigger:'R.scene===\'e3\' && (function(){var E=R.e3,vs={};E.records.forEach(function(r){if(r.mat===E.mat)vs[r.v]=1;});return Object.keys(vs).length>=3;})()',say:'看，这种材质的三个体积我们都测过了。数据告诉我们：同一种物质，质量与体积的比值是不变的。这个不变的比值，就叫做这种物质的密度，用字母ρ表示，ρ等于m除以V。科学家还发现，不同物质，这个比值一般不同。',audio:'c6s2-s5a'},
      {id:'c6s2-s6',repeat:true,queue:true,trigger:'R.scene===\'e3\' && R.e3.records.some(function(a){return R.e3.records.some(function(b){return a.mat!==b.mat;});})',say:'好，接下来换种物质再测，看看比值一样吗。',audio:'c6s2-s6'},
      {id:'c6s2-s7',repeat:false,queue:true,trigger:'after:c6s2-s6@6000',say:'通过实验我们发现：同种物质质量与体积成正比。记住它哦！',audio:'c6s2-s7'},
      {id:'c6s2-s8',repeat:true,trigger:'R.scene===\'e5\' && R.e5.blocks.some(function(b){return b.solved;})',say:'太棒了，算出密度查表对号，物质身份揭晓！',audio:'c6s2-s8'},
      /* R2-b（蔡总：密度水槽场景开场白；木块初始在桌面，放入水中后才播因果）：hold 700ms 等 600ms 飞入动画结束 */
      {id:'c6s2-e4-open',repeat:true,trigger:'R.scene===\'e4\'@700',say:'这个场景，我们研究物体在水中的浮沉。水槽旁边有一块物体，先把它放进水槽里试试。',audio:'c6s2-e4-open'},
      /* R2-e（蔡总：鉴别场景开场白+步骤引导）：闸门 G.e5OpenSaid 由 core switchScene 延时置真（E5_OPEN_GATE_MS），保证开场白播完才放步骤 */
      {id:'c6s2-e5-open',repeat:true,trigger:'R.scene===\'e5\'@700',say:'这个场景我们来当小侦探：桌上有三块神秘物体，要通过测密度鉴别它们是什么物质。先选第一块。',audio:'c6s2-e5-open'},
      {id:'c6s2-e5-s1',repeat:true,trigger:'R.scene===\'e5\' && G.e5OpenSaid===true && !R.e5.blocks[R.e5.sel].mKnown',say:'把选中的神秘块拖到天平左盘，称出它的质量。',audio:'c6s2-e5-s1'},
      {id:'c6s2-e5-s2',repeat:true,trigger:'R.scene===\'e5\' && G.e5OpenSaid===true && R.e5.blocks[R.e5.sel].mKnown && !R.e5.blocks[R.e5.sel].vKnown',say:'质量称好啦！再把它投进量筒，水位上升了多少，体积就是多少。',audio:'c6s2-e5-s2'},
      {id:'c6s2-e5-s3',repeat:true,queue:true,trigger:'R.scene===\'e5\' && G.e5OpenSaid===true && R.e5.blocks[R.e5.sel].mKnown && R.e5.blocks[R.e5.sel].vKnown && !R.e5.blocks[R.e5.sel].guess',say:'质量和体积都有了，密度等于质量除以体积。打开密度表对照数值，选一个材质。',audio:'c6s2-e5-s3'},
      {id:'c6s2-e5-s4',repeat:true,trigger:'R.scene===\'e5\' && G.e5OpenSaid===true && !!R.e5.blocks[R.e5.sel].guess && !R.e5.blocks[R.e5.sel].solved',say:'选好啦，点「提交鉴别」，看看你判断得对不对。',audio:'c6s2-e5-s4'}
    ],
    errors:[
      /* R7-B 蔡总第7条：先把物块投进量筒（还没称质量）→ 顺序纠错 */
      {id:'c6s2-e0',interval:15000,trigger:'R.scene===\'e3\' && R.e3.mKnown===false && R.e3.block.loc===\'cyl\'',fix:'不对哟～应该先测质量，再用量筒测体积哦。',audio:'c6s2-e0'},
      {id:'c6s2-e1',queue:true,trigger:'event:click:#btn-submit:R.scene===\'e5\'&&(!R.e5.blocks[R.e5.sel].mKnown||!R.e5.blocks[R.e5.sel].vKnown)',fix:'不对哟～先称质量再测体积，都测完才能鉴别。',audio:'c6s2-e1'},
      {id:'c6s2-e2',queue:true,trigger:'event:click:#btn-submit:R.scene===\'e5\'&&R.e5.blocks[R.e5.sel].mKnown&&R.e5.blocks[R.e5.sel].vKnown&&!R.e5.blocks[R.e5.sel].guess',fix:'不对哟～先查密度表，选个材质再提交。',audio:'c6s2-e2'}
    ],
    free:[
      /* R2-c（蔡总：先现象后因果，逐材质）：统一模板=单块&&水中&&浮沉稳定(settled)&&材质==X；旧 f1/f2 按比值硬编码已删。
         边沿：入水/换材质 e4Settle 置 settled=false→350/520ms 现象稳定 true→发声，每个材质都产生新边沿（冰不再静默、铝不再切换瞬间抢播）
         R8-3：free=拖动/点击即时反馈，全部去 queue（上轮误加），保证放入水中当帧即响不被排队 */
      {trigger:'R.scene===\'e4\' && !R.e4.dual && !R.e4.stack && R.e4.single && R.e4.single.loc===\'tank\' && R.e4.single.settled===true && R.e4.single.preset===\'wood\'',note:'看，它飘起来了，说明木块的密度比水小。',audio:'c6s2-e4-wood'},
      {trigger:'R.scene===\'e4\' && !R.e4.dual && !R.e4.stack && R.e4.single && R.e4.single.loc===\'tank\' && R.e4.single.settled===true && R.e4.single.preset===\'ice\'',note:'看，冰块也飘起来了，说明冰的密度比水小。',audio:'c6s2-e4-ice'},
      {trigger:'R.scene===\'e4\' && !R.e4.dual && !R.e4.stack && R.e4.single && R.e4.single.loc===\'tank\' && R.e4.single.settled===true && R.e4.single.preset===\'aluminum\'',note:'看，它沉底了，说明铝的密度比水大。',audio:'c6s2-e4-al'},
      {trigger:'R.scene===\'e4\' && !R.e4.dual && !R.e4.stack && R.e4.single && R.e4.single.loc===\'tank\' && R.e4.single.settled===true && R.e4.single.preset===\'pvc\'',note:'看，它沉底了，说明PVC的密度比水大。',audio:'c6s2-e4-pvc'},
      {trigger:'R.scene===\'e4\' && !R.e4.dual && !R.e4.stack && R.e4.single && R.e4.single.loc===\'tank\' && R.e4.single.settled===true && R.e4.single.preset===\'brick\'',note:'看，它沉底了，说明砖的密度比水大。',audio:'c6s2-e4-brick'},
      {trigger:'R.scene===\'e4\' && !R.e4.dual && !R.e4.stack && R.e4.single && R.e4.single.loc===\'tank\' && R.e4.single.settled===true && R.e4.single.preset===\'custom\' && R.e4.single.m/R.e4.single.v<1',note:'看，它飘在水面上，说明这块物体的密度比水小。',audio:'c6s2-e4-cu'},
      {trigger:'R.scene===\'e4\' && !R.e4.dual && !R.e4.stack && R.e4.single && R.e4.single.loc===\'tank\' && R.e4.single.settled===true && R.e4.single.preset===\'custom\' && R.e4.single.m/R.e4.single.v>=1',note:'看，它沉到了水底，说明这块物体的密度比水大。',audio:'c6s2-e4-cd'},
      {trigger:'R.scene===\'e5\' && R.e5.blocks.some(function(b){return b.loc===\'cyl\';})',note:'水位升高了多少，体积就是多少。',audio:'c6s2-f3'}
    ],
    tasks:[]
  },
  audios:{
    'c6s2-intro':'guide/audio/c6s2-intro.mp3?v=20261027g1',
    'c6s2-s1':'guide/audio/c6s2-s1.mp3?v=20261027g1','c6s2-s2':'guide/audio/c6s2-s2.mp3?v=20261028v7',
    'c6s2-s3':'guide/audio/c6s2-s3.mp3?v=20261027g1','c6s2-s4':'guide/audio/c6s2-s4.mp3?v=20261028v7',
    'c6s2-s4a':'guide/audio/c6s2-s4a.mp3?v=20261027r4','c6s2-s5':'guide/audio/c6s2-s5.mp3?v=20261027g1',
    'c6s2-s5a':'guide/audio/c6s2-s5a.mp3?v=20261027r4','c6s2-s6':'guide/audio/c6s2-s6.mp3?v=20261027g1',
    'c6s2-s7':'guide/audio/c6s2-s7.mp3?v=20261027g1','c6s2-s8':'guide/audio/c6s2-s8.mp3?v=20261027g1',
    'c6s2-e0':'guide/audio/c6s2-e0.mp3?v=20261028v7',
    'c6s2-e1':'guide/audio/c6s2-e1.mp3','c6s2-e2':'guide/audio/c6s2-e2.mp3',
    'c6s2-e4-open':'guide/audio/c6s2-e4-open.mp3?v=20261027r4',
    'c6s2-e4-wood':'guide/audio/c6s2-e4-wood.mp3?v=20261027r4','c6s2-e4-ice':'guide/audio/c6s2-e4-ice.mp3?v=20261027r4',
    'c6s2-e4-al':'guide/audio/c6s2-e4-al.mp3?v=20261027r4','c6s2-e4-pvc':'guide/audio/c6s2-e4-pvc.mp3?v=20261027r4',
    'c6s2-e4-brick':'guide/audio/c6s2-e4-brick.mp3?v=20261027r4','c6s2-e4-cu':'guide/audio/c6s2-e4-cu.mp3?v=20261027r4',
    'c6s2-e4-cd':'guide/audio/c6s2-e4-cd.mp3?v=20261027r4',
    'c6s2-e5-open':'guide/audio/c6s2-e5-open.mp3?v=20261027r4','c6s2-e5-s1':'guide/audio/c6s2-e5-s1.mp3?v=20261028v7',
    'c6s2-e5-s2':'guide/audio/c6s2-e5-s2.mp3?v=20261028v7','c6s2-e5-s3':'guide/audio/c6s2-e5-s3.mp3?v=20261028v7',
    'c6s2-e5-s4':'guide/audio/c6s2-e5-s4.mp3?v=20261027r4',
    'c6s2-f3':'guide/audio/c6s2-f3.mp3'
  }
};
window.GUIDE_CFG={state:window.C6S2_STATE,mode:'refract'};
window.GUIDE_DATA=window.C6S2_GUIDE;

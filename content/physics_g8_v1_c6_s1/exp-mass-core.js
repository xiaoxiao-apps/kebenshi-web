// 第六章 c6s1「质量」实验页 core —— 单场景「天平实验室」
// 天平为绝对主体：称量教学（调平/左物右码/游码/读数）+ 形状（揉捏）/物态（熔化）/位置（重力滑杆）三条不变性线索融合
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
// ===== 单点常量（器材尺寸=H 比例，layout() 一次写入 L，绘制只读） =====
var COMPACT_H=600;       // 小窗紧凑档阈值
var K_TILT=0.6;          // 质量差(g)→横梁倾角(°)，clamp ±8
var BAL_EPS=0.1;         // 平衡判定阈值（g）：|m右+游码−m左| ≤ 0.1
var CAP_G=200;           // 本天平称量（g）——要求①「被测物体的质量不能超过称量」
var NUT_STEP=0.5;        // 平衡螺母每次左旋/右旋（°）
var NUT_INIT=-2.5;       // 初始未调平螺母偏置（°）
var NUT_LIM=4;           // 螺母偏置范围 ±（°）
var LEV_EPS=0.3;         // 调平达成阈值（°）
var MELT_RATE=[0,14,26,40];   // 冰熔化速度（%/s），下标=热源档位 0-3
var G_EARTH=9.8,G_MOON=1.6;   // 重力预设（N/kg）
var V_CLAMP=800;         // 抛落初速上限（px/s）
var HINT_MS=6000;        // hint 自动淡出（ms）
var STACK_K=90;          // 砝码堆叠重排平移时间常数（ms，≈200ms 到位）
var WEIGHT_G={'100':100,'50':50,'20':20,'20b':20,'10':10,'5':5};
var WEIGHT_IDS=['100','50','20','20b','10','5'];   // 与 weight_set 盒内阵列顺序一致
// 被测物三选（蔡总二轮拍板清单；质量设定值=可配常量，非教材数值）
var OBJECTS={
  clay:{name:'橡皮泥',g:15},
  ice:{name:'冰水烧杯',g:60},
  pencil:{name:'铅笔',g:8}
};

var cv=document.getElementById('scene'),ctx=cv?cv.getContext('2d'):null;
var ctrlEl=document.querySelector('.ctrlbar');
var hintEl=document.getElementById('hint');
var W=960,H=520,DPR=1,ctrlBandH=150;
var L={};                // 布局常量唯一写点=layout()
var G=null;              // balance_pan 每帧返回的几何对象（命中/堆叠同源）
var glowFx=[];           // 点击 300ms 光晕反馈
var state={
  g:G_EARTH,             // 当前重力（滑杆 0.5-12.0）
  obj:null,              // 'clay'|'ice'|'pencil'
  onPan:false,onHeat:false,
  morph:0,kneaded:false, // 橡皮泥揉捏（0球-1饼-2条 连续）
  ice:100,heatLevel:0,meltedOnce:false,
  objPos:{x:0,y:0},
  rider:0,nut:NUT_INIT,tilt:NUT_INIT,leveled:false,matched:false,
  panW:[],               // 右盘砝码 id（恒按 g 降序=大在下小在上）
  loose:[],              // 桌面停驻砝码 {id,x}
  falls:[],              // 下坠中砝码 {id,x,y,vy,dest}
  wPos:{},               // 砝码渲染位（底面中心）{id:{x,y}}——堆叠重排动画用
  bal:{x:0,y:0,vy:0,falling:false,moved:false,squash:0},
  drag:null,             // {kind:'weight'|'obj'|'bal', id,x,y,vx,vy,t, sx,sy, pending,wasOnPan,wasOnHeat}
  modal:false,           // R3 揉捏窗打开=锁画布输入
  objDrop:null,          // 被测物落盘 120ms 短下坠插值 {x,y,t0}
  refuseRing:null,       // 未调平拒落后保持可见的落点提示圈 {x,y,t0}
  seen:{shape:false,state:false,pos:false},alldone:false
};
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function wSize(g){ var w=L.wU*Math.pow(g/100,1/3); return {w:w,h:w*0.55}; }   // 与 weight_single 几何同源

function layout(){
  // PROPS.bench 库桌：topRatio 避让控制栏，benchTopY=一切落物的落地线
  L.benchTopRatio=Math.min(0.80,(H-ctrlBandH-8)/H);
  L.benchTop=Math.round(H*L.benchTopRatio);
  L.pxPerM=H*0.22;                 // PX_PER_M 单点常量：重力加速度 g(N/kg)→像素加速度 g×pxPerM
  // ===== R6 天平黄金比例（蔡总 2026-10-19 18:08 拍板）=====
  // balance_pan 组件 h ≠ 渲染总高：总高 = baseH(0.065h)+立柱(0.52h)+梁半厚(0.016h) = 0.601h
  L.topMargin=44;                  // 顶部解说条留白
  L.availH=L.benchTop-L.topMargin; // 舞台可用高（桌面线以上、去顶部留白）
  var BAL_RENDER_K=0.601;          // 组件 h→渲染总高系数（0.065+0.52+0.016）
  L.balH=Math.max(110,Math.round(L.availH*0.618/BAL_RENDER_K));   // 渲染总高=可用高×0.618
  L.baseHW=Math.round(L.balH*0.36);            // 底座半宽（baseW=0.72h）
  L.balX0=Math.round(W*0.36);      // 天平居中偏左
  L.boxW=Math.max(72,Math.round(W*0.10));   // 砝码盒做小（蔡总）
  L.boxX=Math.round(W*0.80);
  L.wU=Math.max(16,Math.round(L.balH*0.055));   // weight_single 基准宽 u（蔡总：砝码小一点）
  L.heatW=Math.round(H*0.16);      // 热源宽（天平右下方）
  L.heatX=Math.min(L.balX0+Math.round(L.balH*0.66),L.boxX-L.boxW/2-12-L.heatW/2);
  L.beakerH=Math.round(H*0.17);    // 冰水烧杯高
  // 天平 x 可拖范围：底座不越出画布左右各 ≥12px，且不与砝码盒重叠（收窄 clamp）
  L.balMinX=Math.max(40,L.baseHW+12);
  L.balMaxX=Math.max(L.balMinX,Math.min(W-L.baseHW-12,L.boxX-L.boxW/2-12-L.baseHW));
  if(!state.bal.moved){ state.bal.x=L.balX0; }
  state.bal.x=clamp(state.bal.x,L.balMinX,L.balMaxX);
  if(!state.bal.falling&&!state.drag) state.bal.y=L.benchTop;
}
function resize(){
  if(!cv||!ctx) return;
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl(); layout();
  draw();
}
function localPt(e){ var r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; }
function heatBoxTop(){ return L.benchTop-L.heatW*0.58*0.55; }   // heat_source 顶盘 y（组件几何同源）
// 砝码盒内六枚砝码位（与 weight_set v2 内部几何同源，用于拖动命中）
function boxSlots(){
  var w=L.boxW,x=L.boxX,y=L.benchTop;
  var boxH=w*0.32,pad=w*0.05,inL=x-w/2+pad,inW=w-2*pad,by=y-boxH*0.28;
  return WEIGHT_IDS.map(function(id,i){
    return {id:id,cx:inL+inW*(i+0.5)/WEIGHT_IDS.length,r:inW/WEIGHT_IDS.length*0.34,
      hgt:boxH*(0.30+0.34*WEIGHT_G[id]/100),by:by};
  });
}
// ===== 质量算式（读数面板/读数卡共用） =====
function massR(){ var s=0; state.panW.forEach(function(id){ s+=WEIGHT_G[id]; }); return s; }
function massL(){ return (state.obj&&state.onPan)?OBJECTS[state.obj].g:0; }
function diff(){ return massR()+state.rider-massL(); }
function expr(){
  var parts=state.panW.map(function(id){ return WEIGHT_G[id]+' g'; });
  if(state.rider>0) parts.push(state.rider.toFixed(1)+' g');
  return parts.join(' + ')+' = '+(massR()+state.rider).toFixed(1)+' g';
}
// ===== 右盘堆叠目标位（panW 恒 g 降序=大在下小在上；底面中心坐标） =====
function panH2(){ return Math.max(4,L.balH*0.03); }   // balance_pan 盘厚（组件几何同源）
function stackTargets(){
  var out={},pr=G?G.panR:null;
  if(!pr) return out;
  var cyTop=pr.y-panH2(),acc=0;
  state.panW.forEach(function(id){
    var sz=wSize(WEIGHT_G[id]);
    out[id]={x:pr.x,y:cyTop-acc};
    acc+=sz.h;
  });
  return out;
}
function stackTopY(){   // 右盘当前堆叠顶面 y（下坠砝码落点）
  var pr=G?G.panR:null; if(!pr) return L.benchTop;
  var acc=0; state.panW.forEach(function(id){ acc+=wSize(WEIGHT_G[id]).h; });
  return pr.y-panH2()-acc;
}
function drawGlows(){
  var now=performance.now();
  glowFx=glowFx.filter(function(g){ return now-g.t0<300; });
  glowFx.forEach(function(g){
    var t=(now-g.t0)/300;
    ctx.beginPath(); ctx.arc(g.x,g.y,8+t*22,0,Math.PI*2);
    ctx.strokeStyle='rgba('+(g.c||'255,200,80')+','+(0.7*(1-t)).toFixed(2)+')';
    ctx.lineWidth=3*(1-t)+1; ctx.stroke();
  });
}
// ===== 天平本体（可拖；抛落压扁 1 帧缓冲） =====
function drawBalance(){
  var b=state.bal,sx=1,sy=1;
  if(b.squash){
    var t=(performance.now()-b.squash)/140;
    if(t>=1) b.squash=0;
    else{ var s=Math.sin(Math.PI*t)*0.05; sx=1+s; sy=1-s; }
  }
  ctx.save();
  if(sx!==1){ ctx.translate(b.x,b.y); ctx.scale(sx,sy); ctx.translate(-b.x,-b.y); }
  G=PROPS.balance_pan(ctx,b.x,b.y,{h:L.balH,tilt:state.tilt,rider:state.rider,
    panL:function(c,cx,cyTop,hw){ drawObjOnPan(c,cx,cyTop,hw); },
    panR:function(c,cx,cyTop,hw){ drawPanStack(c); }});
  ctx.restore();
}
// 右盘砝码堆（渲染位 wPos 向目标位 lerp=重排 200ms 平移动画）
function drawPanStack(c){
  state.panW.forEach(function(id){
    var p=state.wPos[id]; if(!p) return;
    PROPS.weight_single(c,p.x,p.y,{g:WEIGHT_G[id],u:L.wU});
  });
}
// ===== 砝码盒（missing=已拖出的 id 不画） =====
function drawBox(){
  PROPS.weight_set(ctx,L.boxX,L.benchTop,{w:L.boxW,open:true,missing:missingIds()});
  ctx.fillStyle='#8a7c66'; ctx.font='13px "Yuanti SC","PingFang SC",sans-serif'; ctx.textAlign='center';
  ctx.fillText('砝码盒（按住拖出 → 右盘）',L.boxX,L.benchTop+16);
}
// ===== 桌面停驻 / 下坠中 / 手中 砝码（全走 weight_single，同款 g 下坠物理） =====
function drawLoose(){
  state.loose.forEach(function(o){
    var p=state.wPos[o.id]||{x:o.x,y:L.benchTop};
    PROPS.weight_single(ctx,p.x,p.y,{g:WEIGHT_G[o.id],u:L.wU});
  });
}
function drawFalls(){
  state.falls.forEach(function(f){
    PROPS.weight_single(ctx,f.x,f.y,{g:WEIGHT_G[f.id],u:L.wU});
  });
}
function drawHeld(){
  var d=state.drag; if(!d) return;
  if(d.kind==='weight'){
    PROPS.weight_single(ctx,d.x,d.y,{g:WEIGHT_G[d.id],u:L.wU,held:true});
  }
}
// ===== R1 落点提示圈：拖动进目标列→淡色圈；未调平拒落→红调圈保持 2.5s =====
function dropRing(t,ok){
  var r=(t.r||L.heatW*0.42)*1.2;
  ctx.save();
  ctx.beginPath(); ctx.arc(t.x,t.y,r,0,Math.PI*2);
  ctx.fillStyle=ok?'rgba(120,160,90,.18)':'rgba(220,80,60,.14)'; ctx.fill();
  ctx.setLineDash([6,5]); ctx.lineWidth=1.6;
  ctx.strokeStyle=ok?'rgba(120,160,90,.65)':'rgba(220,80,60,.6)'; ctx.stroke();
  ctx.restore();
}
function drawDropHints(){
  var d=state.drag,now=performance.now();
  if(d&&!d.pending&&(d.kind==='obj'||d.kind==='weight')){
    var tgt=null,ok=false;
    if(d.kind==='weight'&&overPan({x:d.x,y:d.y},G?G.panR:null)){ tgt=G.panR; ok=state.leveled; }
    else if(d.kind==='obj'){
      if(overPan({x:d.x,y:d.y},G?G.panL:null)){ tgt=G.panL; ok=state.leveled&&OBJECTS[state.obj].g<=CAP_G; }
      else if(overHeat({x:d.x,y:d.y})){ tgt={x:L.heatX,y:heatBoxTop()}; ok=true; }
    }
    if(tgt) dropRing(tgt,ok);
  }
  if(state.refuseRing){
    if(now-state.refuseRing.t0>2500) state.refuseRing=null;
    else dropRing(state.refuseRing,false);
  }
}
// ===== 被测物（橡皮泥/冰水烧杯/铅笔）：桌面+热源+左盘示意 0.4×+拖动 =====
function objSize(kind){
  if(kind==='clay') return Math.round(H*0.12);
  if(kind==='ice') return L.beakerH;
  return Math.round(H*0.09);   // pencil：material_block wood 拉长态
}
function waterFrac(){ return (100-state.ice)/100*0.62; }
function drawPencil(c,x,y,s){
  c.save(); c.translate(x,y); c.scale(2.3,0.42);
  PROPS.material_block(c,0,0,{size:Math.round(s),mat:'wood'});
  c.restore();
}
// 自由态被测物（底面中心 x,y；sc=1 桌面 / 0.4 盘上示意）
function drawObjFree(c,x,y,kind,sc){
  if(kind==='clay'){
    PROPS.clay(c,x,y,{size:Math.max(10,Math.round(objSize('clay')*sc)),morph:state.morph});
  }else if(kind==='ice'){
    PROPS.beaker_ice(c,x,y,{h:Math.max(14,Math.round(L.beakerH*sc)),ice:state.ice,water:waterFrac()});
  }else if(kind==='pencil'){
    drawPencil(c,x,y,objSize('pencil')*sc);
  }
}
function drawObjOnPan(c,cx,cyTop,hw){   // balance_pan 左盘挂载回调：示意缩放 0.4×（蔡总：托盘上的物体就是个示意）
  if(!state.obj||!state.onPan) return;
  var x=cx,y=cyTop,od=state.objDrop;
  if(od){   // 120ms 短下坠插值（落感）
    var t=(performance.now()-od.t0)/120;
    if(t>=1) state.objDrop=null;
    else{ var k=t*t; x=od.x+(cx-od.x)*k; y=od.y+(cyTop-od.y)*k; }
  }
  if(state.obj==='clay'){
    PROPS.clay(c,x,y,{size:Math.max(10,Math.round(hw*1.05)),morph:state.morph});
  }else if(state.obj==='ice'){
    PROPS.beaker_ice(c,x,y,{h:Math.max(14,Math.round(hw*1.5)),ice:state.ice,water:waterFrac()});
  }else{
    c.save(); c.translate(x,y); c.scale(2.3,0.42);
    PROPS.material_block(c,0,0,{size:Math.round(hw*0.85),mat:'wood'});
    c.restore();
  }
}
function objHome(){   // 桌面出生位（天平左侧）
  return {x:clamp(state.bal.x-Math.round(L.balH*0.62),Math.round(W*0.06),Math.round(W*0.30)),y:L.benchTop};
}
function drawObjs(){
  if(!state.obj) return;
  var d=state.drag;
  if(d&&d.kind==='obj'){   // 被测物一律跟手拖动（橡皮泥揉捏改走放大窗）
    if(d.pending&&(d.wasOnPan||d.wasOnHeat)) return;   // 未提交拖动：仍画在盘上/热源上
    drawObjFree(ctx,d.x,d.y,state.obj,1);
    return;
  }
  if(state.onPan||state.onHeat) return;   // 盘上=panL 回调；热源上=drawHeat
  drawObjFree(ctx,state.objPos.x,state.objPos.y,state.obj,1);
  ctx.fillStyle='#8a7c66'; ctx.font='13px "Yuanti SC","PingFang SC",sans-serif'; ctx.textAlign='center';
  var cap=state.obj==='clay'?'橡皮泥 '+OBJECTS.clay.g+' g（点它=放大揉捏窗；拖到左盘称量）'
    :state.obj==='ice'?'冰水烧杯 共 '+OBJECTS.ice.g+' g（拖到热源加热 / 拖到左盘称量）'
    :'铅笔 '+OBJECTS.pencil.g+' g（拖到左盘称量）';
  ctx.fillText(cap,state.objPos.x,state.objPos.y+18);
}
// ===== 热源（仅选中冰水烧杯时出现，天平右下方——蔡总原话位置；点本体循环档位 0-3） =====
function drawHeat(){
  PROPS.heat_source(ctx,L.heatX,L.benchTop,{w:L.heatW,level:state.heatLevel});
  if(state.onHeat&&!(state.drag&&state.drag.kind==='obj')){
    PROPS.beaker_ice(ctx,L.heatX,heatBoxTop()+2,{h:L.beakerH,ice:state.ice,water:waterFrac()});
  }
  ctx.fillStyle='#8a7c66'; ctx.font='13px "Yuanti SC","PingFang SC",sans-serif'; ctx.textAlign='center';
  ctx.fillText('热源 档位 '+state.heatLevel+'（点本体调档）　冰 '+Math.round(state.ice)+' %',L.heatX,L.benchTop+18);
}
// ===== 盒外砝码 id 汇总（weight_set missing 入参） =====
function missingIds(){
  var m=state.panW.slice();
  state.loose.forEach(function(o){ m.push(o.id); });
  state.falls.forEach(function(f){ m.push(f.id); });
  var d=state.drag;
  if(d&&d.kind==='weight'&&m.indexOf(d.id)<0) m.push(d.id);
  return m;
}
// ===== 主绘制 =====
function draw(){
  if(!ctx) return;
  ctx.clearRect(0,0,W,H);
  PROPS.bench(ctx,W,H,{topRatio:L.benchTopRatio});
  if(state.obj==='ice') drawHeat();
  drawBalance();
  drawBox();
  drawLoose(); drawFalls();
  drawObjs();
  drawDropHints();
  drawHeld();
  drawGlows();
}
// ===== 命中检测（优先级：盒内砝码 > 右盘砝码 > 盘上被测物 > 热源上烧杯 > 桌面被测物 > 停驻砝码 > 热源 > 天平本体） =====
function outsideBox(id){
  if(state.panW.indexOf(id)>=0) return true;
  if(state.loose.some(function(o){return o.id===id;})) return true;
  if(state.falls.some(function(f){return f.id===id;})) return true;
  var d=state.drag; return !!(d&&d.kind==='weight'&&d.id===id);
}
function boxWeightAt(p){
  var slots=boxSlots();
  for(var i=0;i<slots.length;i++){
    var s=slots[i];
    if(outsideBox(s.id)) continue;
    if(p.x>=s.cx-s.r*1.7&&p.x<=s.cx+s.r*1.7&&p.y>=s.by-s.hgt-s.r*1.2&&p.y<=s.by+s.r*0.7) return s.id;
  }
  return null;
}
function wHit(p,id){
  var q=state.wPos[id]; if(!q) return false;
  var sz=wSize(WEIGHT_G[id]);
  return Math.abs(p.x-q.x)<=sz.w/2+6&&p.y>=q.y-sz.h-6&&p.y<=q.y+4;
}
function panWeightAt(p){
  for(var i=state.panW.length-1;i>=0;i--){ if(wHit(p,state.panW[i])) return state.panW[i]; }
  return null;
}
function looseWeightAt(p){
  for(var i=state.loose.length-1;i>=0;i--){ if(wHit(p,state.loose[i].id)) return state.loose[i].id; }
  return null;
}
// ===== R1/R2/R4 列吸附判据（唯一落点判据）：x 在目标列内 且 松手点在目标上方 → 吸附落入 =====
function overPan(p,pn){ return !!(pn&&Math.abs(p.x-pn.x)<pn.r*1.6&&p.y<pn.y+10); }
function overHeat(p){ return state.obj==='ice'&&Math.abs(p.x-L.heatX)<L.heatW/2+8&&p.y<heatBoxTop()+10; }
// 热源本体点击命中（仅用于点本体调档/悬停光标，非落点判据）
function heatBodyAt(p){
  return state.obj==='ice'&&Math.abs(p.x-L.heatX)<L.heatW/2+8&&p.y>=heatBoxTop()-6&&p.y<=L.benchTop+4;
}
function objDeskAt(p){
  if(!state.obj||state.onPan||state.onHeat) return false;
  var x=state.objPos.x,y=state.objPos.y,s=objSize(state.obj);
  if(state.obj==='clay') return Math.abs(p.x-x)<s*0.7&&p.y>y-s*1.15&&p.y<y+8;
  if(state.obj==='ice') return Math.abs(p.x-x)<s*0.5&&p.y>y-s-8&&p.y<y+8;
  return Math.abs(p.x-x)<s*1.3&&p.y>y-s*0.55-8&&p.y<y+8;
}
// 盘上被测物本体命中（取回用，紧凑盒；橡皮泥走 clayAt 以支持 click=开揉捏窗）
function objPanAt(p){
  if(!state.obj||!state.onPan||!G||!G.panL) return false;
  var pn=G.panL,s=Math.round(pn.r*1.6);
  return Math.abs(p.x-pn.x)<pn.r*1.3&&p.y>pn.y-s-12&&p.y<pn.y+8;
}
// R3 橡皮泥命中（盘上/桌面）：返回 'pan'|'desk'|null
function clayAt(p){
  if(state.obj!=='clay'||state.onHeat) return null;
  if(state.onPan){
    if(!G||!G.panL) return null;
    var pn=G.panL,s=Math.max(10,Math.round(pn.r*1.05));
    if(Math.abs(p.x-pn.x)<pn.r*1.3&&p.y>pn.y-s*1.2-14&&p.y<pn.y+8) return 'pan';
    return null;
  }
  var x=state.objPos.x,y=state.objPos.y,s2=objSize('clay');
  if(Math.abs(p.x-x)<s2*0.7&&p.y>y-s2*1.15&&p.y<y+8) return 'desk';
  return null;
}
function beakerOnHeatAt(p){
  if(!(state.obj==='ice'&&state.onHeat)) return false;
  return Math.abs(p.x-L.heatX)<L.beakerH*0.45&&p.y>heatBoxTop()-L.beakerH-6&&p.y<heatBoxTop()+6;
}
function balAt(p){
  if(!G) return false;
  var b=state.bal,base=G.base;
  if(p.x>=base.x-6&&p.x<=base.x+base.w+6&&p.y>=base.y-4&&p.y<=base.y+base.h+6) return true;
  return Math.abs(p.x-b.x)<L.balH*0.07&&p.y>=G.beamY-8&&p.y<=b.y;   // 立柱区
}
// ===== 拖动开始 =====
function startWeightDrag(id,p,from){
  if(from==='loose') state.loose=state.loose.filter(function(o){return o.id!==id;});
  if(from==='pan') state.panW=state.panW.filter(function(x){return x!==id;});
  var q=state.wPos[id]||{x:p.x,y:p.y};
  state.drag={kind:'weight',id:id,x:q.x,y:q.y,t:performance.now(),vx:0,vy:0};
  if(window.playPick) playPick();
}
function startObjDrag(p,pending){
  state.drag={kind:'obj',x:p.x,y:p.y,sx:p.x,sy:p.y,t:performance.now(),vx:0,vy:0,
    pending:!!pending,wasOnPan:state.onPan,wasOnHeat:state.onHeat};
  if(window.playPick) playPick();
}
function startBalDrag(p){
  var b=state.bal;
  state.drag={kind:'bal',dx:p.x-b.x,dy:p.y-b.y,x:p.x,y:p.y,t:performance.now(),vx:0,vy:0};
  b.falling=false;
  if(window.playPick) playPick();
}
// ===== 释放：砝码（右盘上方→按 g 下坠落盘；盒区→回盒；否则落桌面停驻） =====
function startFall(id,x,y,dest){ state.falls.push({id:id,x:x,y:y,vy:0,dest:dest}); }
function releaseWeight(p){
  var d=state.drag,id=d.id; state.drag=null;
  var overBox=Math.abs(p.x-L.boxX)<L.boxW/2+14&&p.y>L.benchTop-L.boxW*0.32-26&&p.y<L.benchTop+14;
  if(overBox){ delete state.wPos[id]; if(window.playDrop) playDrop(); afterAct(); return; }   // 重置回盒
  if(!state.leveled){
    if(overPan(p,G?G.panR:null)) state.refuseRing={x:G.panR.x,y:G.panR.y,r:G.panR.r,t0:performance.now()};
    sayFlash(LEVEL_MSG); delete state.wPos[id]; if(window.playDrop) playDrop(); afterAct(); return;
  }
  if(overPan(p,G?G.panR:null)){ startFall(id,d.x,d.y,'pan'); }
  else{ startFall(id,d.x,Math.min(d.y,L.benchTop),'bench'); }
  afterAct();
}
function insertPan(id,landX,landY){
  state.panW.push(id);
  state.panW.sort(function(a,b){ return WEIGHT_G[b]-WEIGHT_G[a]; });   // 稳定排序：大在下小在上，同 g 保持放入序
  state.wPos[id]={x:landX,y:landY};   // 从落点 lerp 到堆叠位=重排 200ms 平移动画
  glowFx.push({x:landX,y:landY-8,t0:performance.now()});
  if(window.playDrop) playDrop();
  afterAct();
}
// ===== 释放：被测物（左盘/热源/桌面） =====
function releaseObj(p){
  var d=state.drag; state.drag=null;
  if(state.leveled&&overPan(p,G?G.panL:null)&&objMassOK()){
    state.onPan=true; state.onHeat=false;
    state.objDrop={x:d.x,y:d.y,t0:performance.now()};   // 120ms 短下坠插值增强落感
    glowFx.push({x:G.panL.x,y:G.panL.y-10,t0:performance.now(),c:'255,180,120'});
    if(window.playDrop) playDrop();
  }else if(overHeat(p)){
    state.onHeat=true; state.onPan=false;
    if(window.playDrop) playDrop();
  }else{
    state.onPan=false; state.onHeat=false;
    state.objPos={x:clamp(p.x,Math.round(W*0.05),Math.round(W*0.95)),y:L.benchTop};
    if(!state.leveled&&overPan(p,G?G.panL:null)){
      state.refuseRing={x:G.panL.x,y:G.panL.y,r:G.panL.r,t0:performance.now()};
      sayFlash(LEVEL_MSG);
    }
    else if(window.playDrop) playDrop();
  }
  afterAct();
}
// ===== 释放：天平本体（抛落：v0=拖速 clamp ±800，a=g×PX_PER_M） =====
function releaseBal(){
  var d=state.drag,b=state.bal; state.drag=null;
  b.x=clamp(d.x-d.dx,L.balMinX,L.balMaxX);
  if(b.y<L.benchTop-0.5){ b.falling=true; b.vy=clamp(d.vy,-V_CLAMP,V_CLAMP); }
  else{ b.y=L.benchTop; b.squash=performance.now(); if(window.playDrop) playDrop(); }
  afterAct();
}
// ===== 指针事件 =====
var LEVEL_MSG='先调平天平：游码归零 + 旋转平衡螺母，使指针指在分度盘的中线处，才能开始称量。';
cv.addEventListener('pointerdown',function(ev){
  if(!ctx||state.modal) return;
  ev.preventDefault();
  try{ cv.setPointerCapture(ev.pointerId); }catch(e){}
  var p=localPt(ev);
  var id=boxWeightAt(p);
  if(id){ startWeightDrag(id,p,'box'); poke(); draw(); return; }
  id=panWeightAt(p);
  if(id){ startWeightDrag(id,p,'pan'); poke(); draw(); return; }
  if(clayAt(p)){ startObjDrag(p,true); poke(); draw(); return; }   // R3：橡皮泥按下=拖动候选，pointerup 位移<6px 视为 click=开揉捏窗
  if(state.obj&&state.obj!=='clay'&&state.onPan&&objPanAt(p)){ state.onPan=false; state.objDrop=null; state.objPos=objHome(); startObjDrag(p); poke(); draw(); return; }
  if(beakerOnHeatAt(p)){ state.onHeat=false; startObjDrag(p); poke(); draw(); return; }
  if(state.obj!=='clay'&&objDeskAt(p)){ startObjDrag(p); poke(); draw(); return; }
  id=looseWeightAt(p);
  if(id){ startWeightDrag(id,p,'loose'); poke(); draw(); return; }
  if(heatBodyAt(p)){   // 热源本体点击：档位循环 0→1→2→3→0
    state.heatLevel=(state.heatLevel+1)%4;
    glowFx.push({x:L.heatX,y:L.benchTop-L.heatW*0.2,t0:performance.now(),c:'255,120,80'});
    if(state.heatLevel>0&&window.playLight) playLight(); else if(window.playClick) playClick();
    poke(); draw(); return;
  }
  if(balAt(p)){ startBalDrag(p); bMoved(); poke(); draw(); return; }
  if(window.playClick) playClick();
  poke(); draw();
});
function bMoved(){ state.bal.moved=true; }
cv.addEventListener('pointermove',function(ev){
  if(!ctx||state.modal) return;
  var p=localPt(ev),d=state.drag,now=performance.now();
  if(!d){
    var hover=boxWeightAt(p)||panWeightAt(p)||looseWeightAt(p)||clayAt(p)
      ||((state.obj&&state.obj!=='clay'&&(objDeskAt(p)||(state.onPan&&objPanAt(p))||beakerOnHeatAt(p)))?'o':null)
      ||(heatBodyAt(p)?'h':null)||(balAt(p)?'b':null);
    cv.style.cursor=hover?'pointer':'';
    return;
  }
  var dt=Math.max(8,now-d.t);
  d.vy=0.65*d.vy+0.35*((p.y-d.y)/dt*1000);
  d.vx=0.65*d.vx+0.35*((p.x-d.x)/dt*1000);
  d.t=now;
  if(d.kind==='weight'){ d.x=p.x; d.y=p.y; }
  else if(d.kind==='bal'){
    var b=state.bal;
    b.x=clamp(p.x-d.dx,L.balMinX,L.balMaxX);
    b.y=clamp(p.y-d.dy,Math.round(H*0.18),L.benchTop);
    d.x=p.x; d.y=p.y; bMoved();
  }else if(d.kind==='obj'){
    if(d.pending){   // R3：位移≥6px 才提交拖动（橡皮泥盘上取走延迟到此刻，click 语义留给揉捏窗）
      var ex=p.x-d.sx,ey=p.y-d.sy;
      if(ex*ex+ey*ey>=36){
        d.pending=false;
        if(state.obj==='clay'){
          if(d.wasOnPan){ state.onPan=false; state.objDrop=null; }
          if(d.wasOnHeat) state.onHeat=false;
        }
      }
    }
    d.x=p.x; d.y=p.y;   // 橡皮泥与其它被测物一样跟手拖动（揉捏改走放大窗）
  }
  draw();
});
cv.addEventListener('pointerup',function(ev){
  if(state.modal) return;
  var d=state.drag; if(!d) return;
  var p=localPt(ev);
  if(d.kind==='weight') releaseWeight(p);
  else if(d.kind==='obj'){
    if(d.pending){ state.drag=null; if(state.obj==='clay') openKnead(); }   // <6px=click：橡皮泥开揉捏窗
    else releaseObj(p);
  }
  else if(d.kind==='bal') releaseBal();
  draw();
});
cv.addEventListener('pointercancel',function(){ if(state.modal) return; state.drag=null; draw(); });
// ===== hint 橙色解说条：6s 自动淡出、任何新操作重新唤出；结论优先展示 =====
var hintT=null,hintOverride=null;
function showHint(msg){
  if(!hintEl) return;
  hintEl.textContent=msg; hintEl.style.opacity='1';
  if(hintT) clearTimeout(hintT);
  hintT=setTimeout(function(){ hintT=null; if(hintEl) hintEl.style.opacity='0'; },HINT_MS);
}
function sayConcl(msg){ hintOverride={msg:msg,t0:performance.now()}; showHint(msg); }
function sayFlash(msg){
  if(!hintEl) return;
  showHint(msg); hintEl.style.borderColor='#dc2626';
  setTimeout(function(){ if(hintEl) hintEl.style.borderColor=''; },1800);
}
function poke(){   // 任何新操作：未到期结论保持，否则教当前可做操作
  if(hintOverride&&performance.now()-hintOverride.t0<HINT_MS){ showHint(hintOverride.msg); return; }
  hintOverride=null; showHint(guideText());
}
function guideText(){
  if(!state.leveled) return '第一步 调平：①把游码移到标尺左端零刻度线处（滑杆归零）；②点「◀ 螺母 / 螺母 ▶」旋转平衡螺母，使指针指在分度盘的中线处。使用前三要求：被测质量不能超过称量（本天平 '+CAP_G+' g）；加减砝码要用镊子（按住拖出）、不能用手接触；潮湿的物体和化学药品不能直接放到托盘中。';
  if(!state.obj) return '调平完成 ✓ 第二步 选被测物：点下方「被测物」卡选 橡皮泥 / 冰水烧杯 / 铅笔，再把它拖到左盘。';
  if(!state.onPan){
    if(state.obj==='clay') return '点橡皮泥弹出放大揉捏窗，随意揉捏后点「完成」；再把它拖到左盘称量，看读数变不变。';
    if(state.obj==='ice') return '把冰水烧杯拖到右下方热源上加热（点热源本体调档 0-3），冰会渐渐熔化成水；也可先拖到左盘称量。';
    return '把铅笔拖到左盘称量。';
  }
  if(!state.matched) return '第三步 左物右码：从砝码盒按住拖出砝码到右盘（由大到小试加，落盘自动大在下小在上堆好），再微调游码滑杆（0–5 g），直到指针指在分度盘中线处。';
  return '横梁平衡 ✓ m物 = 盘中砝码总质量 + 游码示数 = '+expr()+'。继续探究：橡皮泥捏变形再称 / 冰水熔化后再称 / 拖右侧重力滑杆换环境——看质量变不变。';
}
// ===== 三条不变性线索判定（形状/物态/位置）→ 结论 hint → 总结论（教材 P140 原文） =====
function checkClues(){
  var s=state.seen;
  if(!s.shape&&state.kneaded&&state.obj==='clay'&&state.onPan&&state.matched){
    s.shape=true; sayConcl('形状变了，质量不变——橡皮泥称量读数仍是 '+OBJECTS.clay.g+' g。');
  }
  if(!s.state&&state.meltedOnce&&state.obj==='ice'&&state.onPan&&state.matched){
    s.state=true; sayConcl('物态变了，质量不变——杯+内容物总质量始终 '+OBJECTS.ice.g+' g。');
  }
  if(!s.pos&&state.leveled&&Math.abs(state.g-G_EARTH)>0.05&&(!state.obj||!state.onPan||state.matched)){
    s.pos=true; sayConcl('重力环境（位置）变了，质量不变——托盘天平比较的是质量，m₁g = m₂g 两边把 g 约掉了。');
  }
  if(s.shape&&s.state&&s.pos&&!state.alldone){
    state.alldone=true;
    setTimeout(function(){ sayConcl('物体的质量不随它的形状、物态和位置而改变。'); },1800);
  }
}
function objMassOK(){
  if(OBJECTS[state.obj].g>CAP_G){ sayFlash('被测质量超过称量（'+CAP_G+' g）——要求①，不能称量。'); return false; }
  return true;
}
function afterAct(){ updateReadouts(); updatePanel(); }
// ===== 读数卡（控制栏内联）+ 读数面板（幽灵化浮层） =====
function el(id){ return document.getElementById(id); }
function beamText(){ var t=state.tilt; return t<-0.3?'左倾（物重）':(t>0.3?'右倾（码重）':'平衡 ✓'); }
function updateReadouts(){
  var re=el('rd-expr'),rb=el('rd-beam');
  if(re) re.textContent=state.matched?'m = '+expr()+' ✓':(state.onPan?'m = 调节中…':'m = —');
  if(rb) rb.textContent='横梁 '+beamText();
}
var panelOn=false;
function openPanel(){
  panelOn=!panelOn;
  var p=el('panel-read'),b=el('btn-panel');
  if(p) p.classList.toggle('show',panelOn);
  if(b) b.classList.toggle('on',panelOn);
  updatePanel();
}
function gEnvName(){ return Math.abs(state.g-G_EARTH)<0.05?'地球':(Math.abs(state.g-G_MOON)<0.05?'月球':'自定义'); }
function objStatusText(){   // R5：面板实时显示被测物+状态后缀（不要求已放盘）
  if(!state.obj) return '—';
  var d=state.drag,suf;
  if(state.onHeat) suf='（加热中）';
  else if(state.onPan) suf='（左盘）';
  else if(d&&d.kind==='obj'&&!d.pending) suf='（拖动中）';
  else suf='（桌面）';
  return OBJECTS[state.obj].name+suf;
}
function updatePanel(){
  if(!panelOn) return;
  var o=el('pe-obj'),w=el('pe-wts'),r=el('pe-rider'),m=el('pe-mass'),bm=el('pe-beam'),gg=el('pe-g');
  if(o) o.textContent=objStatusText();
  if(w) w.textContent=state.panW.length?massR()+' g（'+state.panW.map(function(id){return WEIGHT_G[id];}).join('+')+'）':'—';
  if(r) r.textContent=state.rider.toFixed(1)+' g';
  if(m) m.textContent=state.matched?expr():'—';
  if(bm) bm.textContent=beamText();
  if(gg) gg.textContent=state.g.toFixed(1)+' N/kg · '+gEnvName();
}
// ===== 动画 tick：下坠物理（a=g×PX_PER_M）/熔化/堆叠重排 lerp/横梁插值 =====
var lastT=performance.now(),readT=0;
function tick(){
  var now=performance.now(),dt=Math.min(50,now-lastT); lastT=now;
  var dts=dt/1000,a=state.g*L.pxPerM;
  for(var i=state.falls.length-1;i>=0;i--){
    var f=state.falls[i];
    f.vy+=a*dts; f.y+=f.vy*dts;
    var landY=f.dest==='pan'?stackTopY():L.benchTop;
    if(f.y>=landY){
      state.falls.splice(i,1);
      if(f.dest==='pan') insertPan(f.id,f.x,landY);
      else{
        state.loose.push({id:f.id,x:clamp(f.x,20,W-20)});
        state.wPos[f.id]={x:f.x,y:landY};
        glowFx.push({x:f.x,y:landY-6,t0:now});
        if(window.playDrop) playDrop();
      }
    }
  }
  var b=state.bal;
  if(b.falling){
    b.vy+=a*dts; b.y+=b.vy*dts;
    if(b.y>=L.benchTop){ b.y=L.benchTop; b.falling=false; b.vy=0; b.squash=now; if(window.playDrop) playDrop(); }
  }
  var tg=stackTargets(),k=Math.min(1,dt/STACK_K);
  Object.keys(tg).forEach(function(id){
    var q=state.wPos[id];
    if(!q){ state.wPos[id]={x:tg[id].x,y:tg[id].y}; return; }
    q.x+=(tg[id].x-q.x)*k; q.y+=(tg[id].y-q.y)*k;
  });
  state.loose.forEach(function(o){   // 停驻砝码跟随落地线（resize 后自动贴回 benchTopY）
    var q=state.wPos[o.id];
    if(!q){ state.wPos[o.id]={x:o.x,y:L.benchTop}; return; }
    q.x+=(o.x-q.x)*k; q.y+=(L.benchTop-q.y)*k;
  });
  if(!state.leveled&&!state.onPan&&!state.panW.length&&state.rider===0&&Math.abs(state.nut)<LEV_EPS){
    state.leveled=true; if(window.playMatch) playMatch(); poke();
  }
  var tgt=clamp(diff()*K_TILT+state.nut,-8,8);
  if(Math.abs(tgt-state.tilt)>0.005) state.tilt+=(tgt-state.tilt)*Math.min(1,dt/140); else state.tilt=tgt;
  var bal=state.leveled&&state.obj&&state.onPan&&Math.abs(diff())<=BAL_EPS;
  if(bal&&!state.matched){ state.matched=true; if(window.playMatch) playMatch(); }
  else if(!bal&&state.matched){ state.matched=false; }
  if(state.obj==='ice'&&state.onHeat&&state.heatLevel>0&&state.ice>0){
    state.ice=Math.max(0,state.ice-MELT_RATE[state.heatLevel]*dts);
    if(state.ice<=0&&!state.meltedOnce){
      state.meltedOnce=true;
      sayConcl('冰全部熔化成水了——把烧杯拖回左盘再称一称，看读数变不变。');
    }
  }
  checkClues();
  if(now-readT>200){ readT=now; updateReadouts(); updatePanel(); }
  draw();
  requestAnimationFrame(tick);
}
// ===== 被测物三选（物理按压两态单选；再点=取下） =====
function syncObjBtns(){
  ['clay','ice','pencil'].forEach(function(k){
    var b=el('btn-obj-'+k);
    if(b) b.classList.toggle('on',state.obj===k);
  });
}
function selectObj(kind){
  state.objDrop=null;
  if(state.obj===kind){   // 再点=取下
    state.obj=null; state.onPan=false; state.onHeat=false; state.drag=null;
  }else{
    state.obj=kind; state.onPan=false; state.onHeat=false; state.matched=false;
    state.objPos=objHome();
    state.morph=0;
    if(window.playClick) playClick();
  }
  syncObjBtns(); afterAct(); poke(); draw();
}
['clay','ice','pencil'].forEach(function(k){
  var b=el('btn-obj-'+k);
  if(b) b.addEventListener('click',function(){ selectObj(k); });
});
// ===== 调平：平衡螺母钮 + 游码滑杆 =====
function nutTurn(dir){
  state.nut=clamp(state.nut+dir*NUT_STEP,-NUT_LIM,NUT_LIM);
  if(window.playTick) playTick();
  afterAct(); poke(); draw();
}
var btnNutL=el('btn-nut-l'),btnNutR=el('btn-nut-r');
if(btnNutL) btnNutL.addEventListener('click',function(){ nutTurn(-1); });
if(btnNutR) btnNutR.addEventListener('click',function(){ nutTurn(1); });
var rngRider=el('rng-rider'),lblRider=el('lbl-rider');
if(rngRider) rngRider.addEventListener('input',function(){
  state.rider=+rngRider.value;
  if(lblRider) lblRider.textContent='游码 '+state.rider.toFixed(1)+' g';
  if(window.playTick) playTick();
  afterAct(); poke();
});
// ===== 重力滑杆卡（位置线索）：连续滑杆 + 地球/月球两预设钮 =====
function syncG(){
  var rg=el('rng-g'),lg=el('lbl-g'),be=el('btn-g-earth'),bm=el('btn-g-moon');
  if(rg) rg.value=state.g;
  if(lg) lg.textContent='g = '+state.g.toFixed(1)+' N/kg';
  if(be) be.classList.toggle('on',Math.abs(state.g-G_EARTH)<0.05);
  if(bm) bm.classList.toggle('on',Math.abs(state.g-G_MOON)<0.05);
}
function setG(v){ state.g=v; syncG(); if(window.playClick) playClick(); poke(); }
var rngG=el('rng-g');
if(rngG) rngG.addEventListener('input',function(){
  state.g=+rngG.value; syncG(); poke();
});
var btnGE=el('btn-g-earth'),btnGM=el('btn-g-moon');
if(btnGE) btnGE.addEventListener('click',function(){ setG(G_EARTH); });
if(btnGM) btnGM.addEventListener('click',function(){ setG(G_MOON); });
// ===== 系统四件套：读数面板 / 重置 / 声音 / 全屏（照 c5s1 路线） =====
var btnPanel=el('btn-panel');
if(btnPanel) btnPanel.addEventListener('click',function(){ openPanel(); if(window.playClick) playClick(); });
function resetAll(){
  state.g=G_EARTH;
  state.obj=null; state.onPan=false; state.onHeat=false; state.morph=0; state.kneaded=false;
  state.ice=100; state.heatLevel=0; state.meltedOnce=false;
  state.rider=0; state.nut=NUT_INIT; state.tilt=NUT_INIT; state.leveled=false; state.matched=false;
  state.panW=[]; state.loose=[]; state.falls=[]; state.wPos={};
  state.bal={x:L.balX0,y:L.benchTop,vy:0,falling:false,moved:false,squash:0};
  state.drag=null; state.objDrop=null; state.refuseRing=null;
  state.seen={shape:false,state:false,pos:false}; state.alldone=false;
  hintOverride=null; glowFx=[];
  if(rngRider) rngRider.value=0;
  if(lblRider) lblRider.textContent='游码 0.0 g';
  syncG(); syncObjBtns(); afterAct(); poke(); draw();
}
var btnReset=el('btn-reset');
if(btnReset) btnReset.addEventListener('click',function(){ resetAll(); if(window.playClick) playClick(); });
var btnMute=el('btn-mute');
if(btnMute) btnMute.addEventListener('click',function(){ window.muted=!window.muted; btnMute.textContent=window.muted?'🔇':'🔊'; if(window.playClick) playClick(); });
var btnFull=el('btn-full');
function pickFn(o,names){for(var i=0;i<names.length;i++){var fn=o[names[i]];if(typeof fn==='function')return fn;}return null;}
function fullEl(){return document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement;}
function syncFull(){if(btnFull)btnFull.textContent=(fullEl()||document.documentElement.classList.contains('pseudo-fs'))?'退出全屏':'全屏';}
function reqFull(){
  var d=document.documentElement,f=pickFn(d,['requestFullscreen','webkitRequestFullscreen','webkitRequestFullScreen','mozRequestFullScreen','msRequestFullscreen']);
  if(!f){d.classList.add('pseudo-fs');syncFull();return;}
  var r=f.call(d);if(r&&r.catch)r.catch(function(){d.classList.add('pseudo-fs');syncFull();});
  setTimeout(function(){if(!fullEl()&&!document.documentElement.classList.contains('pseudo-fs')){d.classList.add('pseudo-fs');syncFull();}},400);
}
function exitFull(){
  var f=pickFn(document,['exitFullscreen','webkitExitFullscreen','webkitCancelFullScreen','mozCancelFullScreen','msExitFullscreen']);
  if(f)f.call(document);document.documentElement.classList.remove('pseudo-fs');syncFull();
}
if(btnFull) btnFull.addEventListener('click',function(){if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();});
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(ev){document.addEventListener(ev,function(){syncFull();setTimeout(resize,60);});});
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); draw(); }).observe(ctrlEl);
}
// ===== R3 橡皮泥放大揉捏窗（点画布橡皮泥=开窗；morph 与主场景同源；完成=关窗同步形态） =====
var kneadMask=el('knead-mask'),kneadCv=el('knead-cv'),kctx=kneadCv?kneadCv.getContext('2d'):null;
var kneadSize=0,kDrag=null;
function drawKnead(){
  if(!kctx) return;
  kctx.clearRect(0,0,kneadSize,kneadSize);
  PROPS.clay(kctx,kneadSize/2,Math.round(kneadSize*0.68),{size:Math.round(kneadSize*0.45),morph:state.morph});
}
function openKnead(){
  if(!kneadCv||!kctx||!kneadMask) return;
  state.modal=true;
  kneadSize=Math.min(420,Math.round(window.innerWidth*0.6));
  var dpr=window.devicePixelRatio||1;
  kneadCv.style.width=kneadSize+'px'; kneadCv.style.height=kneadSize+'px';
  kneadCv.width=Math.round(kneadSize*dpr); kneadCv.height=Math.round(kneadSize*dpr);
  kctx.setTransform(dpr,0,0,dpr,0,0);
  kneadMask.classList.add('show');
  drawKnead();
  if(window.playClick) playClick();
}
function closeKnead(){
  if(!kneadMask) return;
  state.modal=false; kDrag=null;
  kneadMask.classList.remove('show');
  state.kneaded=true;
  draw();
  if(state.onPan){
    checkClues();
    if(!state.seen.shape) showHint('形状变了——重新调砝码/游码使横梁平衡，看称量读数变不变。');
  }else showHint('把它拖到左盘称量，看读数变不变。');
}
if(kneadCv){
  kneadCv.addEventListener('pointerdown',function(ev){
    ev.preventDefault();
    try{ kneadCv.setPointerCapture(ev.pointerId); }catch(e){}
    kDrag={x:ev.offsetX,y:ev.offsetY,lastTick:0};
  });
  kneadCv.addEventListener('pointermove',function(ev){
    if(!kDrag) return;
    var nx=ev.offsetX,ny=ev.offsetY,ddx=nx-kDrag.x,ddy=ny-kDrag.y,now=performance.now();
    if(Math.abs(ddy)>=Math.abs(ddx)){ var t=Math.min(1,Math.abs(ddy)/(kneadSize*0.15)); state.morph+=(1-state.morph)*t*0.5; }
    else{ var t2=Math.min(1,Math.abs(ddx)/(kneadSize*0.20)); state.morph+=(2-state.morph)*t2*0.5; }
    state.morph=clamp(state.morph,0,2);
    kDrag.x=nx; kDrag.y=ny;
    if(now-kDrag.lastTick>140){ kDrag.lastTick=now; if(window.playTick) playTick(); }
    drawKnead();
  });
  kneadCv.addEventListener('pointerup',function(){ kDrag=null; });
  kneadCv.addEventListener('pointercancel',function(){ kDrag=null; });
}
var btnKneadDone=el('knead-done'),btnKneadX=el('knead-x');
if(btnKneadDone) btnKneadDone.addEventListener('click',closeKnead);
if(btnKneadX) btnKneadX.addEventListener('click',closeKnead);
// ===== 调试通道 =====
window.__c6dbg={ get state(){return state;}, get W(){return W;}, get H(){return H;}, get L(){return L;},
  level:function(){ state.nut=0; state.leveled=true; afterAct(); draw(); },
  melt:function(){ state.ice=0; state.meltedOnce=true; checkClues(); draw(); },
  morph:function(v){ state.morph=clamp(v,0,2); state.kneaded=state.morph>0.15; draw(); },
  setG:function(v){ setG(v); },
  reset:function(){ resetAll(); } };
// ===== boot =====
layout(); resize();
syncObjBtns(); syncG(); updateReadouts(); updatePanel();
showHint(guideText());
requestAnimationFrame(tick);
})();

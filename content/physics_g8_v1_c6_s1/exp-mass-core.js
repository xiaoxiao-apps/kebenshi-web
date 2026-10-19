// 第六章 c6s1「质量」实验页 core —— 单场景「天平实验室」
// 天平为绝对主体：称量教学（调平/左物右码/游码/读数）+ 形状（揉捏）/物态（熔化）/位置（重力滑杆）三条不变性线索融合
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
// ===== 单点常量（器材尺寸=H 比例，layout() 一次写入 L，绘制只读） =====
var COMPACT_H=600;       // 小窗紧凑档阈值
var K_TILT=0.6;          // 质量差(g)→横梁倾角(°)，clamp ±8
var TILT_EPS=0.1;        // R20 平衡灵敏度窗（°）：|tiltTarget|≤0.1=真天平指针对准分度盘中线（蔡总：平衡只有那唯一的点）
var CAP_G=200;           // 本天平称量（g）——要求①「被测物体的质量不能超过称量」
var NUT_STEP=0.5;        // 平衡螺母每次左旋/右旋（°）
var NUT_INIT=-2.5;       // 初始未调平螺母偏置（°）
var NUT_LIM=4;           // 螺母偏置范围 ±（°）
var LEV_EPS=0.3;         // 调平达成阈值（°）
var MELT_RATE1=26;       // R22 单档熔化/制冰速率（%/s）——原 MELT_RATE 多档已随循环档位删除
var G_EARTH=9.8,G_MOON=1.6;   // 重力预设（N/kg）
var V_CLAMP=800;         // 抛落初速上限（px/s）
var HINT_MS=6000;        // hint 自动淡出（ms）
var STACK_K=90;          // 砝码堆叠重排平移时间常数（ms，≈200ms 到位）
var WEIGHT_G={'100':100,'50':50,'20':20,'20b':20,'10':10,'5':5};
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
var BOXG=null;           // R11 weight_set 每帧返回 {w,boxH,slots}（盒内命中同源，禁页面复制公式）
var glowFx=[];           // 点击 300ms 光晕反馈
var state={
  g:G_EARTH,             // 当前重力（滑杆 0.5-12.0）
  obj:null,              // 'clay'|'ice'|'pencil'
  onPan:false,onHeat:false,
  morph:0,kneaded:false, // 橡皮泥揉捏（0球-1饼-2条 连续）
  ice:100,meltedOnce:false,
  heatX:0,heating:false,freezing:false,   // R22 底座可挪 x + 加热/制冰互斥布尔（heatX 初值由 layout 写）
  objPos:{x:0,y:0},
  rider:0,nut:NUT_INIT,tilt:NUT_INIT,leveled:false,matched:false,
  panW:[],               // 右盘砝码 id（恒按 g 降序=大在下小在上）
  loose:[],              // 桌面停驻砝码 {id,x}
  falls:[],              // 下坠中砝码 {id,x,y,vy,dest}
  wPos:{},               // 砝码渲染位（底面中心）{id:{x,y}}——堆叠重排动画用
  bal:{x:0,y:0,vy:0,falling:false,moved:false,squash:0},
  drag:null,             // {kind:'weight'|'obj'|'bal'|'heat'|'rider', id,x,y,vx,vy,t, sx,sy,dx,dy, pending,wasOnPan,wasOnHeat,lastTick}
  modal:false,           // R3 揉捏窗打开=锁画布输入
  objDrop:null,          // 被测物落盘 120ms 短下坠插值 {x,y,t0}
  seen:{shape:false,state:false,pos:false},alldone:false
};
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
// R11 砝码几何与盒内槽位单源（weightGeom 立方根律：w=u×(g/100)^⅓, h=w×0.55）——同一枚盒内外同尺寸
function wSize(g){
  var w=PROPS.weightGeom?PROPS.weightGeom(g,L.wU).w:L.wU*Math.pow(g/100,1/3);
  return {w:w,h:w*0.55};
}

function layout(){
  // R27 wood_desk 库桌（蔡总 10-09 定版 2.5D，禁复用 bench）：桌带厚度锁 109px（props-library 约定）
  L.fy=H-ctrlBandH;                  // 桌面立板下边界=控制栏顶
  L.benchTop=L.fy-109;               // 桌面顶面线 by=一切落物的停驻线
  L.pxPerM=H*0.22;                 // PX_PER_M 单点常量：重力加速度 g(N/kg)→像素加速度 g×pxPerM
  // ===== R6 天平黄金比例（蔡总 2026-10-19 18:08 拍板）=====
  // balance_pan 组件 h ≠ 渲染总高：总高 = baseH(0.065h)+立柱(0.52h)+梁半厚(0.016h) = 0.601h
  L.topMargin=44;                  // 顶部解说条留白
  L.availH=L.benchTop-L.topMargin; // 舞台可用高（桌面线以上、去顶部留白）
  var BAL_RENDER_K=0.601;          // 组件 h→渲染总高系数（0.065+0.52+0.016）
  L.balH=Math.max(110,Math.round(L.availH*0.618/BAL_RENDER_K));   // 渲染总高=可用高×0.618
  L.baseHW=Math.round(L.balH*0.36);            // 底座半宽（baseW=0.72h）
  L.balX0=Math.round(W*0.36);      // 天平居中偏左
  L.boxW=Math.max(96,Math.round(W*0.13));   // R11/R12 砝码太小→盒放大（蔡总）
  L.boxX=Math.round(W*0.80);
  // R11 u 与 weight_set 盒内槽位同公式：u=(w−2×0.05w)/4.9=0.1837w → 盒内外同一枚砝码同尺寸
  L.wU=Math.round(L.boxW*0.1837);
  L.heatW=Math.round(H*0.16);      // 热源宽（天平右下方）
  L.heatX=Math.min(L.balX0+Math.round(L.balH*0.66),L.boxX-L.boxW/2-12-L.heatW/2);
  L.beakerH=Math.round(H*0.17);    // 冰水烧杯高
  // 天平 x 可拖范围：底座不越出画布左右各 ≥12px，且不与砝码盒重叠（收窄 clamp）
  L.balMinX=Math.max(40,L.baseHW+12);
  L.balMaxX=Math.max(L.balMinX,Math.min(W-L.baseHW-12,L.boxX-L.boxW/2-12-L.baseHW));
  if(!state.bal.moved){ state.bal.x=L.balX0; }
  state.bal.x=clamp(state.bal.x,L.balMinX,L.balMaxX);
  if(!state.bal.falling&&!state.drag) state.bal.y=L.benchTop;
  if(!state.heatX) state.heatX=L.heatX;      // R22 首帧取布局默认位，此后跟随拖动
  state.heatX=clamp(state.heatX,60,W-60);
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
// ===== 质量算式（读数面板/读数卡共用） =====
function massR(){ var s=0; state.panW.forEach(function(id){ s+=WEIGHT_G[id]; }); return s; }
function massL(){ return (state.obj&&state.onPan)?OBJECTS[state.obj].g:0; }
function diff(){ return massR()+state.rider-massL(); }
// R20 横梁目标倾角单源（tick 插值与 matched 判据共用）：质量差×K_TILT+螺母偏置
function tiltTarget(){ return clamp(diff()*K_TILT+state.nut,-8,8); }
function expr(){
  var parts=state.panW.map(function(id){ return WEIGHT_G[id]+' g'; });
  if(state.rider>0) parts.push(state.rider.toFixed(1)+' g');
  return parts.join(' + ')+' = '+(massR()+state.rider).toFixed(1)+' g';
}
// ===== 右盘堆叠目标位（panW 恒 g 降序=大在下小在上；底面中心坐标） =====
// R24 基准=pr.y（盘椭圆中心，库件 v4 语义）：首枚砝码底坐盘心、向上累加，杜绝悬浮
function stackTargets(){
  var out={},pr=G?G.panR:null;
  if(!pr) return out;
  var acc=0;
  state.panW.forEach(function(id){
    var sz=wSize(WEIGHT_G[id]);
    out[id]={x:pr.x,y:pr.y-acc};
    acc+=sz.h;
  });
  return out;
}
function stackTopY(){   // 右盘当前堆叠顶面 y（下坠砝码落点）
  var pr=G?G.panR:null; if(!pr) return L.benchTop;
  var acc=0; state.panW.forEach(function(id){ acc+=wSize(WEIGHT_G[id]).h; });
  return pr.y-acc;
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
    panL:function(c,cx,cy,hw){ drawObjOnPan(c,cx,cy,hw); },   // R24 库件 v4：cy=盘椭圆中心
    panR:function(c,cx,cy,hw){ drawPanStack(c); }});
  ctx.restore();
}
// 右盘砝码堆（渲染位 wPos 向目标位 lerp=重排 200ms 平移动画）
function drawPanStack(c){
  state.panW.forEach(function(id){
    var p=state.wPos[id]; if(!p) return;
    PROPS.weight_single(c,p.x,p.y,{g:WEIGHT_G[id],u:L.wU});
  });
}
// ===== 砝码盒（missing=已拖出的 id 不画；R11 存 BOXG.slots 供盒内命中同源） =====
function drawBox(){
  BOXG=PROPS.weight_set(ctx,L.boxX,L.benchTop,{w:L.boxW,open:true,missing:missingIds()});
  ctx.fillStyle='#8a7c66'; ctx.font='13px "Yuanti SC","PingFang SC",sans-serif'; ctx.textAlign='center';
  ctx.fillText('砝码盒（按住拖出 → 右盘）',L.boxX,L.benchTop+16);
}
// ===== 桌面停驻 / 下坠中 / 手中 砝码（全走 weight_single，同款 g 下坠物理） =====
function drawLoose(){
  state.loose.forEach(function(o){
    var p=state.wPos[o.id]||{x:o.x,y:L.benchTop+(o.dy||0)};
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
// ===== R1 落点提示圈：拖动进目标列→淡色圈（超称量=红调） =====
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
  var d=state.drag;
  if(d&&!d.pending&&(d.kind==='obj'||d.kind==='weight')){
    var tgt=null,ok=false;
    // R13：未调平不再拒落——落点圈只按超称量判红
    if(d.kind==='weight'&&overPan({x:d.x,y:d.y},G?G.panR:null)){ tgt=G.panR; ok=true; }
    else if(d.kind==='obj'){
      if(overPan({x:d.x,y:d.y},G?G.panL:null)){ tgt=G.panL; ok=OBJECTS[state.obj].g<=CAP_G; }
      else if(overHeat({x:d.x,y:d.y})){ tgt={x:state.heatX,y:heatBoxTop()}; ok=true; }
    }
    if(tgt) dropRing(tgt,ok);
  }
}
// ===== 被测物（橡皮泥/冰水烧杯/铅笔）：桌面+热源+左盘示意 0.4×+拖动 =====
function objSize(kind){
  if(kind==='clay') return Math.round(H*0.12);
  if(kind==='ice') return L.beakerH;
  return Math.round(H*0.09);   // pencil：R23 矢量真铅笔基准 s（长 s×2.4 高 s×0.30）
}
function waterFrac(){ return (100-state.ice)/100*0.62; }
// R23 矢量真铅笔（蔡总：不是方盒）：锚点底面中心(x,y)，总长 s×2.4、杆高 s×0.30，横放
// 左→右：石墨笔尖 / 三段削面木锥 / 六棱杆橙黄漆（上棱亮线+下棱暗线）/ 铁皮箍两道环 / 粉橡皮头
function drawPencil(c,x,y,s){
  var Lp=Math.max(24,s*2.4),h=Math.max(6,s*0.30),x0=x-Lp/2;
  var tipW=Lp*0.16,bodyW=Lp*0.585,ferW=Lp*0.10,eraW=Lp-tipW-bodyW-ferW;
  var bodyX=x0+tipW,ferX=bodyX+bodyW,eraX=ferX+ferW;
  c.save(); c.lineJoin='round';
  // 削尖木锥（三段削面：锥体+两道棱线）
  c.beginPath(); c.moveTo(x0,y-h*0.5); c.lineTo(x0+tipW,y-h); c.lineTo(x0+tipW,y); c.closePath();
  c.fillStyle='#e6c07a'; c.fill();
  c.strokeStyle='rgba(150,110,55,.55)'; c.lineWidth=Math.max(0.7,h*0.04);
  c.beginPath(); c.moveTo(x0,y-h*0.5); c.lineTo(x0+tipW,y-h*0.68);
  c.moveTo(x0,y-h*0.5); c.lineTo(x0+tipW,y-h*0.32); c.stroke();
  // 石墨笔尖（小三角）
  c.beginPath(); c.moveTo(x0,y-h*0.5); c.lineTo(x0+tipW*0.30,y-h*0.60); c.lineTo(x0+tipW*0.30,y-h*0.40); c.closePath();
  c.fillStyle='#374151'; c.fill();
  // 六棱杆：主面橙黄漆 + 上棱亮线 + 下棱暗线
  c.fillStyle='#f59e0b'; c.fillRect(bodyX,y-h,bodyW,h);
  c.strokeStyle='rgba(255,235,180,.65)'; c.lineWidth=Math.max(1,h*0.14);
  c.beginPath(); c.moveTo(bodyX,y-h*0.80); c.lineTo(bodyX+bodyW,y-h*0.80); c.stroke();
  c.strokeStyle='rgba(140,80,10,.35)'; c.lineWidth=Math.max(1,h*0.16);
  c.beginPath(); c.moveTo(bodyX,y-h*0.18); c.lineTo(bodyX+bodyW,y-h*0.18); c.stroke();
  c.strokeStyle='rgba(90,55,10,.5)'; c.lineWidth=Math.max(0.8,h*0.05);
  c.strokeRect(bodyX,y-h,bodyW,h);
  // 尾端铁皮箍（两道环）
  c.fillStyle='#9ca3af'; c.fillRect(ferX,y-h,ferW,h);
  c.strokeStyle='rgba(60,64,72,.6)'; c.lineWidth=Math.max(0.8,h*0.07);
  c.beginPath(); c.moveTo(ferX+ferW*0.33,y-h); c.lineTo(ferX+ferW*0.33,y);
  c.moveTo(ferX+ferW*0.66,y-h); c.lineTo(ferX+ferW*0.66,y); c.stroke();
  // 粉橡皮头（圆端）
  c.beginPath(); c.moveTo(eraX,y-h);
  c.lineTo(eraX+Math.max(1,eraW-h*0.5),y-h);
  c.arc(eraX+Math.max(1,eraW-h*0.5),y-h*0.5,h*0.5,-Math.PI/2,Math.PI/2);
  c.lineTo(eraX,y); c.closePath();
  c.fillStyle='#f472b6'; c.fill();
  c.strokeStyle='rgba(150,50,90,.5)'; c.lineWidth=Math.max(0.8,h*0.05); c.stroke();
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
function drawObjOnPan(c,cx,cy,hw){   // R24 balance_pan 左盘挂载回调（cy=盘心）：示意缩放 0.4×，物底坐盘心
  if(!state.obj||!state.onPan) return;
  var x=cx,y=cy,od=state.objDrop;
  if(od){   // 120ms 短下坠插值（落感）
    var t=(performance.now()-od.t0)/120;
    if(t>=1) state.objDrop=null;
    else{ var k=t*t; x=od.x+(cx-od.x)*k; y=od.y+(cy-od.y)*k; }
  }
  if(state.obj==='clay'){
    PROPS.clay(c,x,y,{size:Math.max(10,Math.round(hw*1.05)),morph:state.morph});
  }else if(state.obj==='ice'){
    PROPS.beaker_ice(c,x,y,{h:Math.max(14,Math.round(hw*1.5)),ice:state.ice,water:waterFrac()});
  }else{
    drawPencil(c,x,y,hw*0.5);   // R23 托盘示意态同款真铅笔（长度=1.2×hw 恰卧盘内）
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
// ===== 热源（仅选中冰水烧杯时出现，天平右下方；R22 底座可拖动 + 正面两钮 🔥加热/❄制冰 互斥·单档） =====
function heatBtnPos(){   // 两钮圆心（底座前缘左右各一，r=9）
  var hw=L.heatW,hh=hw*0.58,by=L.benchTop-hh*0.30;
  return {heat:{x:state.heatX-hw*0.24,y:by,r:9},freeze:{x:state.heatX+hw*0.24,y:by,r:9}};
}
function drawHeatBtn(b,icon,on,bg){
  ctx.save();
  ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
  ctx.fillStyle=bg; ctx.fill();
  ctx.strokeStyle=on?'#fde047':'rgba(20,22,26,.7)'; ctx.lineWidth=on?2.6:1.2; ctx.stroke();
  ctx.font='11px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(icon,b.x,b.y+0.5);
  ctx.restore();
}
function drawHeat(){
  PROPS.heat_source(ctx,state.heatX,L.benchTop,{w:L.heatW,level:state.heating?1:0});
  if(state.onHeat&&!(state.drag&&state.drag.kind==='obj')){
    var bx=state.heatX,byTop=heatBoxTop()+2;
    PROPS.beaker_ice(ctx,bx,byTop,{h:L.beakerH,ice:state.ice,water:waterFrac()});
    if(state.freezing){   // R22 制冰中：烧杯位置叠淡蓝霜晕
      var cy=byTop-L.beakerH*0.5;
      var gr=ctx.createRadialGradient(bx,cy,4,bx,cy,L.beakerH*0.9);
      gr.addColorStop(0,'rgba(147,197,253,.25)'); gr.addColorStop(1,'rgba(147,197,253,0)');
      ctx.fillStyle=gr;
      ctx.beginPath(); ctx.arc(bx,cy,L.beakerH*0.9,0,Math.PI*2); ctx.fill();
    }
  }
  var bp=heatBtnPos();
  drawHeatBtn(bp.heat,'🔥',state.heating,'rgba(220,90,50,.92)');
  drawHeatBtn(bp.freeze,'❄',state.freezing,'rgba(96,150,220,.92)');
  ctx.fillStyle='#8a7c66'; ctx.font='13px "Yuanti SC","PingFang SC",sans-serif'; ctx.textAlign='center';
  ctx.fillText('热源（按住拖动挪位 · 点🔥加热 / ❄制冰）　冰 '+Math.round(state.ice)+' %',state.heatX,L.benchTop+18);
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
  PROPS.wood_desk(ctx,W,H,{by:L.benchTop,fy:L.fy});   // R27 库定版 2.5D 木桌（禁复用 bench）
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
// R11 盒内命中=消费 weight_set v3 返回 slots（{id,cx,cy,r,hgt}，cy=底面y），禁页面复制盒内公式
function boxWeightAt(p){
  if(!BOXG||!BOXG.slots) return null;
  for(var i=0;i<BOXG.slots.length;i++){
    var s=BOXG.slots[i];
    if(outsideBox(s.id)) continue;
    if(p.x>=s.cx-s.r*1.7&&p.x<=s.cx+s.r*1.7&&p.y>=s.cy-s.hgt-s.r*1.2&&p.y<=s.cy+s.r*0.7) return s.id;
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
function overHeat(p){ return state.obj==='ice'&&Math.abs(p.x-state.heatX)<L.heatW/2+8&&p.y<heatBoxTop()+10; }
// 热源底座本体命中（R22 按下=拖动候选；两钮命中优先于它）
function heatBodyAt(p){
  return state.obj==='ice'&&Math.abs(p.x-state.heatX)<L.heatW/2+8&&p.y>=heatBoxTop()-6&&p.y<=L.benchTop+4;
}
// R22 两钮命中：'heat'|'freeze'|null（命中优先于底座拖动）
function heatBtnAt(p){
  if(state.obj!=='ice') return null;
  var bp=heatBtnPos();
  var d1=p.x-bp.heat.x,e1=p.y-bp.heat.y;
  if(d1*d1+e1*e1<=144) return 'heat';
  var d2=p.x-bp.freeze.x,e2=p.y-bp.freeze.y;
  if(d2*d2+e2*e2<=144) return 'freeze';
  return null;
}
// R21 梁上红游码命中：游码柄（±12×±16）或标尺带（按下即跳到该处再拖）
function riderAt(p){
  if(!G||!G.rider) return false;
  var r=G.rider;
  return (Math.abs(p.x-r.g2x(state.rider))<12&&Math.abs(p.y-r.y)<16)
    ||(p.x>=r.x0-4&&p.x<=r.x1+4&&Math.abs(p.y-r.y)<12);
}
function objDeskAt(p){
  if(!state.obj||state.onPan||state.onHeat) return false;
  var x=state.objPos.x,y=state.objPos.y,s=objSize(state.obj);
  if(state.obj==='clay') return Math.abs(p.x-x)<s*0.7&&p.y>y-s*1.15&&p.y<y+8;
  if(state.obj==='ice') return Math.abs(p.x-x)<s*0.5&&p.y>y-s-8&&p.y<y+8;
  return Math.abs(p.x-x)<s*1.2&&p.y>y-s*0.30-10&&p.y<y+8;   // R23 铅笔命中盒=新外形（宽 s×2.4 高 s×0.30）
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
  return Math.abs(p.x-state.heatX)<L.beakerH*0.45&&p.y>heatBoxTop()-L.beakerH-6&&p.y<heatBoxTop()+6;
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
// R22 热源底座拖动（落桌面：y 恒 benchTop，只挪 x）
function startHeatDrag(p){
  state.drag={kind:'heat',dx:p.x-state.heatX,x:p.x,y:p.y,t:performance.now(),vx:0,vy:0};
  if(window.playPick) playPick();
}
// R21 游码连续拖动（0.1g 步进）：画布 x → g，同步控制栏滑杆与标签，playTick 节流 140ms
function setRiderFromX(px){
  if(!G||!G.rider) return;
  var r=G.rider,v=clamp(Math.round((px-r.x0)/(r.x1-r.x0)*5*10)/10,0,5);
  if(v===state.rider) return;
  state.rider=v;
  if(rngRider) rngRider.value=String(v);
  if(lblRider) lblRider.textContent='游码 '+v.toFixed(1)+' g';
  var d=state.drag,now=performance.now();
  if(d&&d.kind==='rider'){
    if(now-d.lastTick>140){ d.lastTick=now; if(window.playTick) playTick(); }
  }else if(window.playTick) playTick();
  afterAct();
}
function startRiderDrag(p){
  state.drag={kind:'rider',x:p.x,y:p.y,t:performance.now(),vx:0,vy:0,lastTick:performance.now()};
  setRiderFromX(p.x);   // 标尺带按下即跳到该处
}
// ===== 释放：砝码（盒列吸附→回盒；右盘上方→按 g 下坠落盘；否则落桌面停驻） =====
function startFall(id,x,y,dest){ state.falls.push({id:id,x:x,y:y,vy:0,dest:dest}); }
function releaseWeight(p){
  var d=state.drag,id=d.id; state.drag=null;
  // R11 列吸附（与 overPan 同哲学）：盒列内、任意上方高度松手→回盒
  var overBox=Math.abs(p.x-L.boxX)<L.boxW/2+14&&p.y<L.benchTop+14;
  if(overBox){ delete state.wPos[id]; if(window.playDrop) playDrop(); afterAct(); return; }   // 重置回盒
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
// ===== 释放：被测物（左盘/热源/桌面；R13 未调平也可放盘，读数红色警示） =====
function releaseObj(p){
  var d=state.drag; state.drag=null;
  if(overPan(p,G?G.panL:null)&&objMassOK()){
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
    if(window.playDrop) playDrop();
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
  var hb=heatBtnAt(p);
  if(hb){   // R22 两钮：互斥开关（按一个关另一个，再按同一个=关）
    if(hb==='heat'){ state.heating=!state.heating; state.freezing=false; }
    else{ state.freezing=!state.freezing; state.heating=false; }
    var bp=heatBtnPos();
    glowFx.push({x:(hb==='heat'?bp.heat:bp.freeze).x,y:bp.heat.y-14,t0:performance.now(),c:hb==='heat'?'255,120,80':'147,197,253'});
    if(state.heating&&window.playLight) playLight(); else if(window.playClick) playClick();
    poke(); draw(); return;
  }
  if(heatBodyAt(p)){ startHeatDrag(p); poke(); draw(); return; }   // R22 底座本体=拖动挪位
  if(riderAt(p)){ startRiderDrag(p); poke(); draw(); return; }     // R21 游码命中优先于天平本体拖动
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
      ||(heatBtnAt(p)?'n':null)||(heatBodyAt(p)?'h':null)||(riderAt(p)?'r':null)||(balAt(p)?'b':null);
    cv.style.cursor=hover?'pointer':'';
    return;
  }
  var dt=Math.max(8,now-d.t);
  d.vy=0.65*d.vy+0.35*((p.y-d.y)/dt*1000);
  d.vx=0.65*d.vx+0.35*((p.x-d.x)/dt*1000);
  d.t=now;
  if(d.kind==='weight'){ d.x=p.x; d.y=p.y; }
  else if(d.kind==='heat'){   // R22 底座拖动：clamp [60,W−60]，y 恒落桌面
    state.heatX=clamp(p.x-d.dx,60,W-60);
    d.x=p.x; d.y=p.y;
  }
  else if(d.kind==='rider'){ setRiderFromX(p.x); d.x=p.x; d.y=p.y; }   // R21 连续 0.1g
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
  else if(d.kind==='heat'){ state.drag=null; if(window.playDrop) playDrop(); afterAct(); }
  else if(d.kind==='rider'){ state.drag=null; afterAct(); }
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
  if(state.obj&&state.onPan&&!state.leveled) return '未调平也能称量，但先调平再读数才准确；当前读数为红色警示值。调平：游码归零 + 点「◀ 螺母 / 螺母 ▶」使指针指在分度盘中线处。';
  if(!state.leveled) return '第一步 调平：①把游码移到标尺左端零刻度线处（拖梁上红色游码或滑杆归零）；②点「◀ 螺母 / 螺母 ▶」旋转平衡螺母，使指针指在分度盘的中线处。使用前三要求：被测质量不能超过称量（本天平 '+CAP_G+' g）；加减砝码要用镊子（按住拖出）、不能用手接触；潮湿的物体和化学药品不能直接放到托盘中。';
  if(!state.obj) return '调平完成 ✓ 第二步 选被测物：点下方「被测物」卡选 橡皮泥 / 冰水烧杯 / 铅笔，再把它拖到左盘。';
  if(!state.onPan){
    if(state.obj==='clay') return '点橡皮泥弹出放大揉捏窗，随意揉捏后点「完成」；再把它拖到左盘称量，看读数变不变。';
    if(state.obj==='ice') return '把冰水烧杯拖到右下方热源上，点🔥加热熔化成水、点❄制冰冻回（热源可按住拖动挪位）；也可先拖到左盘称量。';
    return '把铅笔拖到左盘称量。';
  }
  if(!state.matched) return '第三步 左物右码：从砝码盒按住拖出砝码到右盘（由大到小试加，落盘自动大在下小在上堆好），再微调游码（拖梁上红色游码，0.1 g 连续可调；或用滑杆），直到指针指在分度盘中线处——平衡只有那唯一的点。';
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
  if(!s.pos&&Math.abs(state.g-G_EARTH)>0.05&&(!state.obj||!state.onPan||state.matched)&&state.leveled){
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
// ===== 读数面板（幽灵化浮层，唯一读数出口；控制栏读数卡已删 R14） =====
function el(id){ return document.getElementById(id); }
// R10 平衡=可读数的唯一点：matched 是唯一「平衡 ✓」判据；未 matched 且倾角在 ±0.3° 内只报临界文案，禁显示平衡
function beamText(){
  if(state.matched) return '平衡 ✓';
  var t=state.tilt;
  return t<-0.3?'左倾（物重）':(t>0.3?'右倾（码重）':'接近平衡…');
}
// R13 未调平下的平衡=错误读数（实时算，调平后红色自动消）：bad 时读数元素加 .bad 类（CSS 在 exp-mass.html）
function badRead(){ return !!(state.matched&&!state.leveled); }
var BAD_SUF='（读数错误，天平初始状态未调平）';
function updateReadouts(){
  var bad=badRead();
  var re=el('rd-expr'),rb=el('rd-beam');   // R14 后元素已删，null-guard 保底
  if(re){
    re.textContent=state.matched?(bad?'m = '+expr()+BAD_SUF:'m = '+expr()+' ✓'):(state.onPan?'m = 调节中…':'m = —');
    re.classList.toggle('bad',bad);
  }
  if(rb){ rb.textContent='横梁 '+beamText(); rb.classList.toggle('bad',bad); }
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
  var bad=badRead();   // R13：bad=matched 且未调平 → pe-mass/pe-beam 红色 .bad + 括号提示
  var o=el('pe-obj'),w=el('pe-wts'),r=el('pe-rider'),m=el('pe-mass'),bm=el('pe-beam'),gg=el('pe-g');
  if(o) o.textContent=objStatusText();
  if(w) w.textContent=state.panW.length?massR()+' g（'+state.panW.map(function(id){return WEIGHT_G[id];}).join('+')+'）':'—';
  if(r) r.textContent=state.rider.toFixed(1)+' g';
  if(m){ m.textContent=state.matched?expr()+(bad?BAD_SUF:''):'—'; m.classList.toggle('bad',bad); }
  if(bm){ bm.textContent=beamText(); bm.classList.toggle('bad',bad); }
  if(gg) gg.textContent=state.g.toFixed(1)+' N/kg · '+gEnvName();
}
// ===== 动画 tick：下坠物理（a=g×PX_PER_M）/熔化制冰/堆叠重排 lerp/横梁插值 =====
// R28 桌面停驻禁重合：落点 x 与已有停驻砝码重叠（|dx|<(wA+wB)/2×0.7）→ 摞上该 x 列当前顶（链式）
function benchStackY(x,id){
  var wA=wSize(WEIGHT_G[id]).w,top=L.benchTop;
  state.loose.forEach(function(o){
    var szB=wSize(WEIGHT_G[o.id]);
    if(Math.abs(x-o.x)>=(wA+szB.w)/2*0.7) return;
    var q=state.wPos[o.id],oy=(q?q.y:L.benchTop+(o.dy||0))-szB.h;
    if(oy<top) top=oy;
  });
  return top;
}
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
        var lx=clamp(f.x,20,W-20),ly=benchStackY(lx,f.id);   // R28 摞放落点
        state.loose.push({id:f.id,x:lx,dy:ly-L.benchTop});
        state.wPos[f.id]={x:lx,y:ly};
        glowFx.push({x:lx,y:ly-6,t0:now});
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
  state.loose.forEach(function(o){   // 停驻砝码跟随落地线（resize 后贴回 benchTop+摞高 dy）
    var q=state.wPos[o.id];
    if(!q){ state.wPos[o.id]={x:o.x,y:L.benchTop+(o.dy||0)}; return; }
    q.x+=(o.x-q.x)*k; q.y+=(L.benchTop+(o.dy||0)-q.y)*k;
  });
  if(!state.onPan&&!state.panW.length&&state.rider===0&&Math.abs(state.nut)<LEV_EPS&&!state.leveled){
    state.leveled=true; if(window.playMatch) playMatch(); poke();
  }
  var tgt=tiltTarget();   // R20 单源：tick 插值与 matched 判据同吃 tiltTarget()
  if(Math.abs(tgt-state.tilt)>0.005) state.tilt+=(tgt-state.tilt)*Math.min(1,dt/140); else state.tilt=tgt;
  // R20 平衡=横梁实际倾角归零的唯一点（蔡总：平衡只有那唯一的点）：质量差不再作判据，
  // 未调平时须把游码调到倾角归零才 matched，读数=砝码+游码实际值（badRead 红字警示沿用）
  var bal=state.obj&&state.onPan&&Math.abs(tiltTarget())<=TILT_EPS;
  if(bal&&!state.matched){ state.matched=true; if(window.playMatch) playMatch(); }
  else if(!bal&&state.matched){ state.matched=false; }
  if(state.obj==='ice'&&state.onHeat){
    if(state.heating&&state.ice>0){   // R22 单档加热熔化
      state.ice=Math.max(0,state.ice-MELT_RATE1*dts);
      if(state.ice<=0){
        state.heating=false;
        if(!state.meltedOnce){
          state.meltedOnce=true;
          sayConcl('冰全部熔化成水了——把烧杯拖回左盘再称一称，看读数变不变。点❄可冻回冰块。');
        }else showHint('全化成水了，点❄可冻回。');
      }
    }
    if(state.freezing){   // R22 制冰：冻回 100% 自动停
      if(state.ice<100){
        state.ice=Math.min(100,state.ice+MELT_RATE1*dts);
        if(state.ice>=100){ state.freezing=false; if(window.playMatch) playMatch(); }
      }else state.freezing=false;
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
  state.ice=100; state.meltedOnce=false;
  state.heatX=L.heatX; state.heating=false; state.freezing=false;
  state.rider=0; state.nut=NUT_INIT; state.tilt=NUT_INIT; state.leveled=false; state.matched=false;
  state.panW=[]; state.loose=[]; state.falls=[]; state.wPos={};
  state.bal={x:L.balX0,y:L.benchTop,vy:0,falling:false,moved:false,squash:0};
  state.drag=null; state.objDrop=null;
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

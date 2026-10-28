(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
// 布局常量集中定义（core 唯一写点，render 只读）
// ===== 单位制改革：cm↔px 全部走单点 cmPx()；器材 H 比例化（@H520 观感与旧默认一致，全屏等比放大） =====
function cmPx(){ return H*0.096; }   // 单点换算：≈50px/cm @H520
var F_MIN_CM=1.2,F_MAX_CM=4.8,F_DEF_CM=2.0;   // f 滑杆范围与默认（cm，旧 60~240px@50px/cm 同语义）；默认 2cm（初始态②）
var F_SNAPS_CM=[2,3];      // 滑杆吸附刻度点（2cm/3cm）
var F_SNAP_TOL_CM=0.08;    // 滑杆吸附阈值（cm）
var FOCUS_TOL_CM=0.12;     // 灯泡/光屏 焦点判定阈值（cm，≈6px@H520）
function focusTol(){ return FOCUS_TOL_CM*cmPx(); }
var fCmV=F_DEF_CM;         // 当前焦距（cm），滑杆唯一写点
var fPx=100;               // 焦距 px 缓存（beginView/setF 单点换算，运行期覆盖）
var D_MIN_CM=2.4,D_MAX_CM=6.0,D_DEF_CM=4.0;   // 直径（=孔径）滑杆（cm）：默认 4.0cm=0.384H
var dCmV=D_DEF_CM;         // 当前直径（cm），滑杆唯一写点；与 f 解耦（直径不改焦距、只改通光量）
var dPx=200;               // 直径 px 缓存（beginView/setD 单点换算，运行期覆盖）
// 几何断言：默认直径 4.0cm=0.384H → 孔径半宽 0.192H；三线半跨 RAY_OFF=0.135H；0.135 < 0.192 任意 H 成立 = 三线全进孔径（比例化后与窗口无关）
// PEN_H(0.085H) < RAY_OFF(0.135H) 任意 H 成立 = 三笔互不重叠；RAY_OFF 未动，三线进孔径断言（0.135<0.192）不变
var BULB_H,PEN_H,PEN_W,RAY_OFF,SUN_R,SPOT_BASE,SPOT_FADE,SUN_SPAN;   // H 比例缓存（proportions() 赋值）
function proportions(){
  BULB_H=H*0.12;           // 灯泡场上绘制高（原 64px@H520；锚点=底面中心，光晕中心对轴）
  PEN_H=H*0.085;           // 激光笔绘制高（44px@H520；缩小组避免"大炮"观感）
  PEN_W=324*(PEN_H/90);    // 激光笔绘制宽（sprite 324x90 等比联动）
  RAY_OFF=H*0.135;         // 三条入射光高度偏移 axisY±0.135H（原 70px@H520）
  SUN_R=H*0.10;            // 场景二太阳半径（c4s5 先例 sunR=0.10H 同比例，不封顶）
  SPOT_BASE=H*0.012; SPOT_FADE=H*0.58;   // 光斑半径基数/亮度衰减距离（原 6px/300px@H520）
  SUN_SPAN=H*0.154;        // 太阳平行光竖直铺开 ±（原 80px@H520）
}
var SPOT_K=0.35;           // 光斑半径斜率保持（随 d px 自然缩放）
var PENS_X=110;            // 激光笔组落位中心 x
var NOZ_FX=0.4799,NOZ_FY=0.65;       // 出光点 nozzle 换算（锚点=镜头环连通域中心实测，c4s1 同源）
var BTN_FX=0.77006,BTN_FY=0.35;      // 笔身红钮位置
var COMPACT_H=600;         // 小窗紧凑档阈值：canvas 逻辑高 H<600 触发（resize 内判定）
var ctrlBandH=150;         // 底部控制栏实测高（替代旧 CTRL_BAND 写死；量高+ResizeObserver 动态维护）
var BULB_X_FRAC=0.34;      // 灯泡初始落位 x（分数）
var BULB_HS=[-2,-1,0,1,2];           // 灯泡 5 条光线扇形系数（0=过光心沿轴）
var SC_H_FRAC=0.60;        // 光屏高 =0.60H（c4s1 同源先例）；屏面中心对齐光轴
var SCREEN_MIN_DX=30;      // 光屏在透镜右侧至少 30px
var SC_X_FRAC=0.50;        // 场景二 预置凸透镜 x（分数）
var SC_SCREEN_X_FRAC=0.78; // 场景二 光屏初始 x（分数，轴上偏右）
var SUN_X_FRAC=0.08,SUN_Y_FRAC=0.18;   // 场景二 太阳固定悬浮左上（不可拖、进入即亮）
var SUN_RAYS=5;            // 太阳平行光 5 条，竖直铺开 ±SUN_SPAN 等距
var FOCAL_D_DEF_CM=4.0;    // 场景二 预置透镜直径（cm，同走 cm 语义；与场景一状态完全隔离）
var ANIM_DUR=600;          // 场景切换飞入飞出动画时长（ms，两向对称）
var COL_RAY='#dc2626';     // 场景一光线红（实线/虚线同源）
var COL_FLOW='#2563eb';    // 光流脉冲点蓝
var COL_SUN='#f59e0b';     // 场景二太阳平行光金黄
var rayCol=COL_RAY;        // 当前绘制场景的光线色（render 入口写点）
var COL_DIM='#854d0e';     // 白底标注尺寸线琥珀深色

var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
// 控制栏实际高度实测：折行/紧凑档/全屏均自动重测（DOM 真高，非估算）
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
var W=960,H=520,DPR=1,axisY=260;
var showFocus=true,showVirtual=true,showLabels=false;   // 标注默认关
// 双场景状态：scene='bench'自由光学台 / 'focal'测焦距；两场景各自 lens/source/screen/f/d 完全隔离
var state={
  scene:'bench',
  animating:false,anim:null,   // anim={to,t0}；animating 期间锁全部输入
  bench:{f:F_DEF_CM,d:D_DEF_CM,lens:null,source:null,everConvex:false,everConcave:false},   // f/d 均为 cm 语义（px 换算走 cmPx()）；ever* = R8-2 统一结论旗标
  focal:{f:F_DEF_CM,d:FOCAL_D_DEF_CM,lens:null,screen:null}
};
window.C5S1_STATE=state;   // 语音讲解层状态暴露（设计书 §A-1 最小方案：稳定对象直接引用，无需 getter 聚合）
function cur(){ return state[state.scene]; }   // 当前场景子状态（交互/面板/气泡读写点）
function setF(v){ fCmV=v; fPx=v*cmPx(); cur().f=v; }   // 焦距单点写（cm，px 缓存同步）
function setD(v){ dCmV=v; dPx=v*cmPx(); cur().d=v; }   // 直径单点写（cm，px 缓存同步）
var VS=state.bench;          // 当前渲染视图（render 入口写点；动画期间先后指向两场景）
var drag=null,startPt=null,glowFx=[];
var showFlow=false,flowT0=0;   // 光流动画：默认关（静态实线）；开=虚线脉冲沿光路流动
var toolbox=null,toastTimer=null;
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
function sunX(){ return Math.round(W*SUN_X_FRAC); }
function sunY(){ return Math.round(H*SUN_Y_FRAC); }

function layout(){
  axisY=Math.round(H*0.5);
  // F4②：托盘从画布底部带移到左上角并整体缩小（件 100→80 档、卡 456×132→366×106）。
  // 命中检测/槽位坐标/拖放落位全部走本函数单源重算（toolbox.create 每次 resize/RO 重建），无硬编码旧坐标残留。
  // 遮挡核查：卡底边 12+106=118px < 最上支激光笔顶（H=360 最劣 ≈120.7px，H≥520 更宽裕）→ 不遮笔组与主光路；场景二太阳在 y=0.18H 但托盘只在场景一渲染（drawTray 仅 renderBench 调用）
  var cardH=106;
  var card={x:16,y:12,w:366,h:cardH,r:10,fill:'rgba(255,255,255,0.88)',stroke:'#c9c0ae'};
  var nat={pens:{w:56,h:56},bulb:{w:56,h:56},lens_convex:{w:56,h:56},lens_concave:{w:56,h:56}};
  var ids=['pens','bulb','lens_convex','lens_concave'],items=[];   // 托盘四件（光屏只在场景二存在，不入托盘）
  for(var i=0;i<ids.length;i++) items.push({id:ids[i],x:card.x+48+i*90,y:card.y+53});
  var fit=(H<COMPACT_H)?Math.min(80,Math.round(H*0.15)):80;   // 紧凑档托盘再缩；常规档 80（F4 缩小档）
  toolbox=PROPS.toolbox.create({card:card,items:items,fit:fit,nat:nat});
}

function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  // 紧凑档判定：H<600 加 .compact（CSS 缩字号/内边距/滑杆宽），H≥600 恢复常规档；切档后立即重量 ctrlBandH
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl(); proportions();
  layout();
  var B=state.bench,F=state.focal;   // 两场景布局缓存全部重算
  if(B.lens) B.lens.x=clampLensX(B.lens.x);
  clampSource();
  if(F.lens) F.lens.x=clampLensX(F.lens.x);
  if(F.screen) F.screen.x=clampScreenX(F.screen.x);
  draw();
}
function clampLensX(x){ return Math.max(W*0.30,Math.min(W*0.70,x)); }
function clampPensX(x){ return Math.max(60,Math.min(W*0.35,x)); }
function clampBulbX(x){
  x=Math.max(60,Math.min(W*0.70,x));   // 左界 60=贴边余量（clampPensX 同款），灯泡可拖到台左缘
  var L=state.bench.lens;   // 灯泡只在场景一
  if(L&&x>L.x-40&&x<L.x+40) x=(x<L.x)?L.x-40:L.x+40;   // 排除透镜占位±40px
  return x;
}
function clampScreenX(x){   // 光屏只在场景二：始终相对场景二透镜 clamp
  var L=state.focal.lens;
  var lo=L?L.x+SCREEN_MIN_DX:Math.round(W*0.55);
  return Math.max(lo,Math.min(W-40,x));
}
function clampSource(){
  var s=state.bench.source; if(!s) return;
  if(s.type==='pens') s.x=clampPensX(s.x);
  else s.x=clampBulbX(s.x);
}

// ===== 几何换算 =====
function offOf(i){ return (i-1)*RAY_OFF; }
function penBottomY(i){ var s=VS.source; return axisY+(s.yOff||0)+offOf(i)+NOZ_FY*PEN_H; }
function nozzleOf(i){ var s=VS.source; return {x:s.x+NOZ_FX*PEN_W,y:axisY+(s.yOff||0)+offOf(i)}; }
function btnOf(i){ var s=VS.source; return {x:s.x+(BTN_FX-0.5)*PEN_W,y:axisY+(s.yOff||0)+offOf(i),r:Math.max(6,PEN_H/90*12)}; }
function anyLit(){ var s=VS.source; return !!s&&s.type==='pens'&&(s.on[0]||s.on[1]||s.on[2]); }
function fCm(){ return fCmV; }
function xFocus(){ return VS.lens?VS.lens.x+fPx:NaN; }          // 透射侧会聚焦点
function bulbAtF(){ var s=VS.source,L=VS.lens;
  return !!L&&L.kind==='convex'&&!!s&&s.type==='bulb'&&s.on&&Math.abs(Math.abs(s.x-L.x)-fPx)<=focusTol(); }
function spotOK(){ return VS===state.focal&&!!VS.lens&&VS.lens.kind==='convex'&&!!VS.screen; }   // 光斑只在场景二（太阳进入即亮）

// ===== 绘制 =====
function drawBg(){
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#faf8f3'); g.addColorStop(1,'#f5f2ec');   // 亮底，同 gallery 桌面色
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}
function drawAxis(){
  ctx.save();
  ctx.strokeStyle='rgba(26,26,26,.45)'; ctx.lineWidth=1; ctx.setLineDash([14,5,3,5]);
  ctx.beginPath(); ctx.moveTo(0,axisY); ctx.lineTo(W,axisY); ctx.stroke();
  ctx.restore();
}
function drawTray(){
  toolbox.drawCard(ctx);
  var slots=toolbox.slots;
  for(var i=0;i<slots.length;i++){
    var s=slots[i];   // F4②：托盘缩至 80 档，缩略图绘制尺寸同步 ×0.8（36→29/70→56/64→51，锚点偏移同比）
    if(s.id==='pens') PROPS.laser_pen(ctx,s.x,s.y+14,{h:29});
    else if(s.id==='bulb') PROPS.bulb(ctx,s.x,s.y+31,{h:56});
    else if(s.id==='lens_convex') PROPS.lens_convex(ctx,s.x,s.y,{h:51});   // 库件中心锚：直接对槽心
    else if(s.id==='lens_concave') PROPS.lens_concave(ctx,s.x,s.y,{h:51});
  }
}
function beam(x0,y0,x1,y1){
  ctx.save(); ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1);
  if(showFlow){   // 光流开：底线减淡 + 蓝色虚线脉冲从光源向传播方向流动（x0→x1）
    ctx.globalAlpha=.3; ctx.strokeStyle=rayCol; ctx.lineWidth=2; ctx.stroke();
    ctx.globalAlpha=1; ctx.setLineDash([6,12]);
    ctx.lineDashOffset=-((performance.now()-flowT0)*0.06)%18;
    ctx.strokeStyle=COL_FLOW; ctx.lineWidth=2.4; ctx.stroke();
  }else{
    ctx.strokeStyle=rayCol; ctx.lineWidth=2; ctx.stroke();
  }
  ctx.restore();
}
function beamDash(x0,y0,x1,y1){
  ctx.save(); ctx.lineCap='round'; ctx.setLineDash([7,6]); ctx.globalAlpha=.75;
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1);
  ctx.strokeStyle='#dc2626'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.restore();
}
function refractEnd(xL,yi,m,dir){
  var dx=(dir>0?W+30:-30)-xL;
  if(Math.abs(m)>1e-9){
    var dxc=m>0?(H+20-yi)/m:(-20-yi)/m;
    if(dxc*dir>0&&Math.abs(dxc)<Math.abs(dx)) dx=dxc;
  }
  return {x:xL+dx,y:yi+m*dx};
}
// 近轴薄透镜折射：入射高度 yi、入射斜率 mIn（canvas 坐标），凸/凹 + dir 决定会聚/发散
function refractSlope(yi,mIn,kind,dir){
  var hc=yi-axisY;
  return kind==='convex' ? (mIn-dir*hc/fPx) : (mIn+dir*hc/fPx);
}
// 单条光线：从 (x0,y0) 打到透镜面 xL、入射高度 yi、入射斜率 mIn、传播方向 dir
function traceRay(x0,y0,xL,yi,mIn,dir){
  beam(x0,y0,xL,yi);
  var L=VS.lens;
  if(Math.abs(yi-axisY)>dPx/2){   // 孔径裁切：入射高度超孔径一半的光线直穿不折射
    var e0=refractEnd(xL,yi,mIn,dir);
    beam(xL,yi,e0.x,e0.y);
    return;
  }
  var m=refractSlope(yi,mIn,L.kind,dir);
  if(Math.abs(m)<1e-9){ beam(xL,yi,dir>0?W+2:-2,yi); return; }
  var e=refractEnd(xL,yi,m,dir);
  beam(xL,yi,e.x,e.y);
  if(L.kind==='concave'&&showVirtual){
    var back=dir>0?(xL-fPx):(xL+fPx);
    beamDash(xL,yi,back,axisY);
  }
}
// R8-2（蔡总 2026-10-29 01:17 条1b）：统一结论旗标——「真的看到了光路」才置位（光源点亮 + 透镜就位 + 本帧确实在画经该透镜的折射光路），
// 不是把透镜拖出来就置位。state.bench 经 window.C5S1_STATE 直暴露 → guide-data 用 R.bench.everConvex/everConcave 读。
function markRaySeen(L){
  if(VS!==state.bench||!L) return;
  if(L.kind==='convex') state.bench.everConvex=true;
  else if(L.kind==='concave') state.bench.everConcave=true;
}
function drawRays(){
  if(VS===state.focal){ drawSunRays(); return; }
  var s=VS.source; if(!s) return;
  var L=VS.lens;
  if(s.type==='pens'){
    if(L&&(s.on[0]||s.on[1]||s.on[2])) markRaySeen(L);   // R8-2：至少一支笔亮 + 透镜就位 = 看到光路
    for(var i=0;i<3;i++){
      if(!s.on[i]) continue;
      var nz=nozzleOf(i),yi=nz.y;
      if(!L){ beam(nz.x,yi,W+2,yi); }
      else traceRay(nz.x,yi,L.x,yi,0,1);
      ctx.save();
      ctx.fillStyle='#dc2626'; ctx.beginPath(); ctx.arc(nz.x,yi,3,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }else if(s.type==='bulb'){
    drawBulbRays();
  }
}
// 场景二：太阳右侧射出 5 条金黄水平平行光（±80px 等距），孔径裁切适用
function drawSunRays(){
  var L=VS.lens,x0=sunX()+SUN_R*1.6,step=SUN_SPAN*2/(SUN_RAYS-1);
  for(var i=0;i<SUN_RAYS;i++){
    var yi=axisY+(i-(SUN_RAYS-1)/2)*step;
    if(!L){ beam(x0,yi,W+2,yi); continue; }
    traceRay(x0,yi,L.x,yi,0,1);
  }
}
function drawBulbRays(){
  var s=VS.source,L=VS.lens;
  if(!s.on) return;
  markRaySeen(L);   // R8-2：灯泡亮 + 透镜就位 = 看到光路（L 为 null 时 markRaySeen 内自动跳过）
  var bx=s.x,by=axisY, dir=L?(L.x>=bx?1:-1):1;
  var half=L?Math.min(dPx*0.42,H*0.154):H*0.154;   // 扇形半跨随孔径/H 比例
  for(var k=0;k<BULB_HS.length;k++){
    var yi=by+BULB_HS[k]*half/2;   // 打在透镜面上的高度（含过光心 BULB_HS=0）
    if(!L){
      var slope=(yi-by)/(W*0.7-bx);
      beam(bx,by,W+2,by+slope*(W+2-bx));
      continue;
    }
    var mIn=(yi-by)/(L.x-bx);
    if(Math.abs(mIn)>4){ mIn=4*(mIn>0?1:-1); yi=by+mIn*(L.x-bx); }  // 近轴钳制
    traceRay(bx,by,L.x,yi,mIn,dir);
  }
}
function drawLens(){
  var L=VS.lens; if(!L) return;
  // (x,axisY)=光心，透镜垂直居中骑光轴（库件已去底座）；opt.f 矢量通道：凸度随滑杆联动；h=直径(孔径)
  if(L.kind==='convex') PROPS.lens_convex(ctx,L.x,axisY,{h:dPx,f:fCm()});
  else PROPS.lens_concave(ctx,L.x,axisY,{h:dPx,f:fCm()});   // 凹透镜同传 f：凹度随虚焦距联动
}
function drawBulb(){
  var s=VS.source; if(!s||s.type!=='bulb') return;
  if(s.on){   // 白底点亮反馈：半透明 radialGradient 光晕（库内加性混合在白底不可见，core 自绘）
    var r=BULB_H*0.95;
    var g=ctx.createRadialGradient(s.x,axisY,2,s.x,axisY,r);
    g.addColorStop(0,'rgba(255,196,50,.42)'); g.addColorStop(.6,'rgba(255,196,50,.16)'); g.addColorStop(1,'rgba(255,196,50,0)');
    ctx.save(); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(s.x,axisY,r,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  PROPS.bulb(ctx,s.x,axisY+BULB_H*0.62,{h:BULB_H,on:s.on});   // 光晕中心(锚-h*0.62)对准主光轴
}
function screenH(){ return Math.round(H*SC_H_FRAC); }
function screenY(){ return axisY+screenH()/2; }   // PROPS.screen 锚点 y：screenGeom.cy=y-h/2=axisY → 屏面中心骑光轴
function drawSun(){ PROPS.sun(ctx,sunX(),sunY(),{r:SUN_R}); }   // 进入即亮，无开关
function drawScreen(){
  var sc=VS.screen; if(!sc) return;
  PROPS.screen(ctx,sc.x,screenY(),{h:screenH()});
  if(spotOK()) drawSpot(sc);
}
function drawSpot(sc){
  var d=Math.abs(sc.x-xFocus());
  var r=SPOT_BASE+d*SPOT_K;                 // 光斑半径 r = 0.012H + |xScreen−xF| * 0.35
  var a=Math.max(.25,1-d/SPOT_FADE);        // 亮度 alpha = max(.25, 1 − |xScreen−xF|/0.58H)
  ctx.save(); ctx.globalAlpha=a;
  var g=ctx.createRadialGradient(sc.x,axisY,1,sc.x,axisY,r);
  g.addColorStop(0,'rgba(255,176,30,.97)'); g.addColorStop(.55,'rgba(255,150,40,.6)'); g.addColorStop(1,'rgba(255,140,30,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sc.x,axisY,r,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
function checkSpotFocus(){
  var sc=state.focal.screen; if(!sc||VS!==state.focal) return;
  var hit=spotOK()&&Math.abs(sc.x-xFocus())<=focusTol();
  if(hit&&!sc.atF){
    sc.atF=true;
    showToast('光斑最小最亮！光屏到透镜的距离就是焦距 f = '+fCm().toFixed(1)+' cm');
    if(window.playMatch) playMatch();
  }else if(!hit&&sc.atF){ sc.atF=false; }
}
function showToast(msg){
  var t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){ t.classList.remove('show'); toastTimer=null; },3200);
}
function arrowHead(x,y,dir){
  ctx.save(); ctx.translate(x,y); ctx.rotate(dir);
  ctx.fillStyle=COL_DIM; ctx.beginPath();
  ctx.moveTo(0,0); ctx.lineTo(-7,-3.5); ctx.lineTo(-7,3.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function dimLine(x0,x1,label){
  var y=axisY+24;
  ctx.save();
  ctx.strokeStyle=COL_DIM; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke();
  arrowHead(x0,y,x0<x1?Math.PI:0); arrowHead(x1,y,x0<x1?0:Math.PI);
  ctx.fillStyle=COL_DIM; ctx.font='14px "Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif'; ctx.textAlign='center';
  ctx.fillText(label,(x0+x1)/2,y+15);
  ctx.restore();
}
// 标注层（btn-labels 开时）：器材名/主光轴/O，深色 12px，位置避让器材本体
function haloText(t,x,y){ctx.save();ctx.lineWidth=4;ctx.lineJoin='round';ctx.strokeStyle='rgba(255,255,255,.85)';ctx.strokeText(t,x,y);ctx.restore();ctx.fillText(t,x,y);}
function drawLabels(){
  ctx.save();
  ctx.fillStyle='#1a1a1a'; ctx.font='600 18px "Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif';
  var L=VS.lens,s=VS.source,sc=VS.screen;
  ctx.textAlign='right'; haloText('主光轴',W-10,axisY-8);
  ctx.textAlign='center';
  if(L){
    haloText(L.kind==='convex'?'凸透镜':'凹透镜',L.x,axisY+dPx/2+18);
    ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(L.x,axisY,3.5,0,Math.PI*2); ctx.stroke();
    haloText('O',L.x,axisY-10);
  }
  if(s&&s.type==='pens'){
    var topY=axisY+(s.yOff||0)-RAY_OFF+NOZ_FY*PEN_H-PEN_H;
    haloText('激光笔组',s.x,topY-6);
  }else if(s&&s.type==='bulb'){
    haloText('小灯泡',s.x,axisY+BULB_H*0.62-BULB_H-8);
  }
  if(sc) haloText('光屏',sc.x,axisY-0.455*screenH()-8);
  ctx.restore();
}
function drawAnnotations(){
  if(showLabels) drawLabels();
  var L=VS.lens; if(!L) return;
  var xL=L.x;
  if(showFocus){
    ctx.save();
    ctx.font='14px "Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif'; ctx.textAlign='center';
    var fLabel='f = '+fCm().toFixed(1)+' cm';
    if(L.kind==='convex'){
      var fx=xL+fPx;   // PhET 式 F：黄实心点+深色环+深色 F 字
      ctx.beginPath(); ctx.arc(fx,axisY,8,0,Math.PI*2);
      ctx.fillStyle='#ffc81e'; ctx.fill();
      ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='#1a1a1a'; ctx.font='700 16px "Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif'; haloText('F',fx,axisY-14); ctx.font='14px "Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif';
      dimLine(xL,fx,fLabel);
    }else{
      var vx=xL-fPx;   // 虚焦点同式但空心环区分
      ctx.beginPath(); ctx.arc(vx,axisY,8,0,Math.PI*2);
      ctx.fillStyle='#f5f2ec'; ctx.fill();
      ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=2; ctx.stroke();
      ctx.beginPath(); ctx.arc(vx,axisY,4.5,0,Math.PI*2);
      ctx.strokeStyle='#ffc81e'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='#1a1a1a'; ctx.font='700 16px "Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif'; haloText('F',vx,axisY-14); ctx.font='14px "Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif';
      dimLine(vx,xL,fLabel);
    }
    ctx.restore();
  }
  var s=VS.source;
  if(s&&((s.type==='pens'&&s.on[1])||(s.type==='bulb'&&s.on))){
    ctx.save();
    ctx.fillStyle='rgba(26,26,26,.8)'; ctx.font='13px "Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif'; ctx.textAlign='left';
    ctx.fillText('过光心方向不变',xL+10,axisY-8);
    ctx.restore();
  }
}
function drawPens(){
  var s=VS.source; if(!s||s.type!=='pens') return;
  for(var i=0;i<3;i++){
    PROPS.laser_pen(ctx,s.x,penBottomY(i),{h:PEN_H,angle:0,dir:1,beam:false});
    var b=btnOf(i);
    ctx.save();
    if(s.on[i]){
      var g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
      g.addColorStop(0,'rgba(160,25,25,1)'); g.addColorStop(1,'rgba(160,25,25,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
    }else{
      var g2=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
      g2.addColorStop(0,'rgba(255,70,70,1)'); g2.addColorStop(1,'rgba(255,70,70,0)');
      ctx.fillStyle=g2; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,190,190,0.55)';
      ctx.beginPath(); ctx.arc(b.x-b.r*0.3,b.y-b.r*0.3,b.r*0.35,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
}
function drawGlowFx(){
  var now=performance.now();
  for(var i=glowFx.length-1;i>=0;i--){
    var f=glowFx[i],t=(now-f.t0)/300;
    if(t>=1){ glowFx.splice(i,1); continue; }
    ctx.save();
    ctx.globalAlpha=1-t;
    var c0=f.c||'255,120,100';
    var g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,18+22*t);
    g.addColorStop(0,'rgba('+c0+',.55)'); g.addColorStop(1,'rgba('+c0+',0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(f.x,f.y,18+22*t,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}
// 场景视图渲染入口：VS/fPx/dPx/rayCol 单点切换，两场景状态完全隔离
function beginView(S,rayC){ VS=S; fCmV=S.f; dCmV=S.d; fPx=fCmV*cmPx(); dPx=dCmV*cmPx(); rayCol=rayC; ctx.save(); }
function endView(){ ctx.restore(); }
function renderBench(dy){
  beginView(state.bench,COL_RAY); ctx.translate(0,dy);
  drawAxis(); drawTray(); drawRays(); drawLens(); drawAnnotations();
  drawPens(); drawBulb(); drawGlowFx();
  endView();
}
function renderFocal(dy){
  beginView(state.focal,COL_SUN); ctx.translate(0,dy);
  drawAxis(); drawSun(); drawRays(); drawLens(); drawScreen(); drawAnnotations();
  endView();
}
function draw(){
  drawBg();
  var a=state.anim;
  if(!a){
    if(state.scene==='bench') renderBench(0); else renderFocal(0);
  }else{   // 飞入飞出：离场物件 y 偏移 -H*ease(t)，入场物件 +H*(1-ease(t)) 归位，两向对称
    var e=easeInOut(Math.min(1,(performance.now()-a.t0)/ANIM_DUR));
    if(a.to==='focal'){ renderBench(-H*e); renderFocal(H*(1-e)); }
    else { renderFocal(-H*e); renderBench(H*(1-e)); }
  }
  checkSpotFocus(); updatePanel();
}

function updatePanel(){
  var pn=document.getElementById('panel-read'); if(!pn||!pn.classList.contains('show')) return;
  var S=cur(),L=S.lens,sc=S.screen;
  var spot=state.scene==='focal'&&!!L&&L.kind==='convex'&&!!sc;
  var pd=document.getElementById('pr-dist'),pf=document.getElementById('pr-f'),ps=document.getElementById('pr-spot');
  if(pd) pd.textContent=(sc&&L)?((sc.x-L.x)/cmPx()).toFixed(1)+' cm':'—';
  if(pf) pf.textContent=(L&&L.kind==='convex')?(fCm().toFixed(1)+' cm'):'—';
  if(ps){
    if(!spot) ps.textContent='—';
    else{ var d=Math.abs(sc.x-xFocus());
      ps.textContent=sc.atF?('最小最亮（f='+fCm().toFixed(1)+' cm）'):('光斑偏大，距焦点 '+(d/cmPx()).toFixed(1)+' cm'); }
  }
}

// ===== 命中检测 =====
function localPt(e){ var r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; }
function hitBtn(p){
  var s=cur().source; if(!s||s.type!=='pens') return -1;
  for(var i=0;i<3;i++){ var b=btnOf(i); if(Math.hypot(p.x-b.x,p.y-b.y)<b.r+5) return i; }
  return -1;
}
function hitBulb(p){
  var s=cur().source; if(!s||s.type!=='bulb') return false;
  return Math.abs(p.x-s.x)<30&&p.y>axisY-BULB_H-10&&p.y<axisY+16;
}
function hitScreen(p){   // 光屏只在场景二
  var sc=state.scene==='focal'?state.focal.screen:null; if(!sc) return false;
  var g=PROPS.screenGeom(sc.x,screenY(),screenH());   // 命中走库件几何
  return Math.abs(p.x-g.faceX)<g.fw/2+14&&p.y>g.pts.TL.y-10&&p.y<g.pts.BR.y+16;
}
function hitLens(p){
  var L=cur().lens; if(!L) return false;
  return Math.abs(p.x-L.x)<dPx*0.22+14 && Math.abs(p.y-axisY)<dPx/2+10;
}
function hitPens(p){
  var s=cur().source; if(!s||s.type!=='pens') return false;
  var yOff=s.yOff||0;
  var top=axisY+yOff-RAY_OFF+NOZ_FY*PEN_H-PEN_H;   // 最上支笔顶
  var bot=axisY+yOff+RAY_OFF+NOZ_FY*PEN_H;         // 最下支笔底
  return p.x>=s.x-PEN_W/2-10 && p.x<=s.x+PEN_W/2+10 && p.y>=top-8 && p.y<=bot+8;
}
function inCtrlArea(p){ return toolbox.pointInCard(p)||p.y>H-ctrlBandH; }

// ===== 交互（动画期间锁全部输入） =====
cv.addEventListener('pointerdown',function(e){
  if(state.animating) return;
  var p=localPt(e); startPt=p; drag=null;
  var B=state.bench;
  if(state.scene==='bench'&&toolbox.pointInCard(p)){
    var slot=toolbox.hitSlot(p);
    if(slot&&(slot.id==='pens'||slot.id==='bulb')){
      var t=slot.id;
      if(B.source&&B.source.type!==t) B.source=null;   // 光源互斥：拖新光源=收回旧光源
      if(!B.source){
        if(t==='pens') B.source={type:'pens',x:PENS_X,yOff:0,on:[false,false,false]};
        else B.source={type:'bulb',x:Math.round(W*BULB_X_FRAC),on:false,snapped:false};
      }
      drag={k:t}; if(window.playPick) playPick();
    }else if(slot&&(slot.id==='lens_convex'||slot.id==='lens_concave')){
      var kind=slot.id==='lens_convex'?'convex':'concave';
      if(!B.lens) B.lens={kind:kind,x:Math.round(W*0.5)};
      else B.lens.kind=kind;   // 另一类型=原位换型；同类型=移动已有件
      drag={k:'lens'}; syncSlider(); if(window.playPick) playPick();
    }
  }
  if(!drag){
    var bi=hitBtn(p);
    if(bi>=0) drag={k:'btn',i:bi};
    else if(hitBulb(p)) drag={k:'bulb'};
    else if(hitLens(p)) drag={k:'lens'};
    else if(hitScreen(p)) drag={k:'screen'};
    else if(hitPens(p)) drag={k:'pens'};
  }
  if(drag){ cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; draw(); }
});
cv.addEventListener('pointermove',function(e){
  if(state.animating) return;
  var p=localPt(e);
  if(!drag){
    cv.style.cursor=(hitBtn(p)>=0||hitBulb(p)||hitScreen(p)||hitLens(p)||hitPens(p)||(state.scene==='bench'&&toolbox.pointInCard(p)&&toolbox.hitSlot(p)))?'pointer':'';
    return;
  }
  var S=cur();
  if(drag.k==='lens'&&S.lens){
    S.lens.x=clampLensX(p.x);
    if(state.scene==='focal') S.screen.x=clampScreenX(S.screen.x);
    if(S.source&&S.source.type==='bulb') S.source.x=clampBulbX(S.source.x);
  }
  else if(drag.k==='pens'&&S.source){
    S.source.x=clampPensX(p.x);
    S.source.yOff=Math.max(-60,Math.min(60,p.y-axisY));
  }
  else if(drag.k==='bulb'&&S.source){
    var bx=clampBulbX(p.x),L=S.lens,s=S.source;
    if(L&&L.kind==='convex'){   // F 磁吸：前/后焦点 ±focusTol() 内对齐并闪一次光晕
      var f1=L.x-fPx,f2=L.x+fPx,near=(Math.abs(bx-f1)<=Math.abs(bx-f2))?f1:f2;
      if(Math.abs(bx-near)<=focusTol()){
        bx=near;
        if(!s.snapped){ s.snapped=true; glowFx.push({x:bx,y:axisY,t0:performance.now(),c:'255,214,120'}); }
      }else s.snapped=false;
    }
    s.x=bx;
  }
  else if(drag.k==='screen'&&S.screen){ S.screen.x=clampScreenX(p.x); }
  draw();
});
function endDrag(e){
  if(!drag) return;
  var p=localPt(e),S=cur();
  if(drag.k==='btn'){
    if(Math.hypot(p.x-startPt.x,p.y-startPt.y)<5){
      var s=S.source,i=drag.i;
      s.on[i]=!s.on[i];
      var b=btnOf(i); glowFx.push({x:b.x,y:b.y,t0:performance.now()});
      if(window.playClick) playClick();
    }
  }else if(drag.k==='bulb'&&Math.hypot(p.x-startPt.x,p.y-startPt.y)<5&&!toolbox.pointInCard(startPt)){
    var sb=S.source;   // 点灯泡本体=开关（300ms 光晕+音效，同激光笔）
    sb.on=!sb.on;
    glowFx.push({x:sb.x,y:axisY,t0:performance.now(),c:'255,214,120'});
    if(window.playClick) playClick();
  }else if(drag.k==='pens'){
    var movedP=Math.hypot(p.x-startPt.x,p.y-startPt.y)>=5;
    if(movedP&&inCtrlArea(p)){ S.source=null; if(window.playDrop) playDrop(); }
    else{ S.source.x=PENS_X; S.source.yOff=0; if(movedP&&window.playDrop) playDrop(); }
  }else if(drag.k==='bulb'){
    var movedSrc=Math.hypot(p.x-startPt.x,p.y-startPt.y)>=5;
    if(movedSrc&&inCtrlArea(p)){ S.source=null; if(window.playDrop) playDrop(); }
    else if(movedSrc&&window.playDrop) playDrop();
  }else if(drag.k==='screen'){
    var movedSc=Math.hypot(p.x-startPt.x,p.y-startPt.y)>=5;   // 光屏为场景二常驻件，不可收回
    if(movedSc&&window.playDrop) playDrop();
  }else if(drag.k==='lens'){
    var movedL=Math.hypot(p.x-startPt.x,p.y-startPt.y)>=5;
    if(movedL&&inCtrlArea(p)&&state.scene==='bench'){ S.lens=null; if(window.playDrop) playDrop(); }   // 场景二预置透镜不可收回
    else if(S.lens){ S.lens.x=clampLensX(S.lens.x); if(movedL&&window.playDrop) playDrop(); }
  }
  drag=null; cv.style.cursor=''; syncSlider(); draw();
}
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',endDrag);

// ===== 控制条（全部控件在场景切换动画期间锁定） =====
// 焦点钮（物理按压两态，默认开）：toggle F 点显隐
var btnFocus=document.getElementById('btn-focus');
if(btnFocus) btnFocus.addEventListener('click',function(){
  if(state.animating) return;
  showFocus=!showFocus; btnFocus.classList.toggle('on',showFocus);
  if(window.playClick) playClick(); draw();
});
// 标注钮（物理按压两态，默认关）
var btnLabels=document.getElementById('btn-labels');
if(btnLabels) btnLabels.addEventListener('click',function(){
  if(state.animating) return;
  showLabels=!showLabels; btnLabels.classList.toggle('on',showLabels);
  if(window.playClick) playClick(); draw();
});
// 光流钮（物理按压两态，默认关）：开=虚线脉冲流动，关=静态实线
var btnFlow=document.getElementById('btn-flow');
if(btnFlow) btnFlow.addEventListener('click',function(){
  if(state.animating) return;
  showFlow=!showFlow; btnFlow.classList.toggle('on',showFlow);
  if(showFlow) flowT0=performance.now();
  if(window.playClick) playClick(); draw();
});
var cbVirtual=document.getElementById('cb-virtual');
if(cbVirtual) cbVirtual.addEventListener('change',function(){ if(state.animating){ cbVirtual.checked=showVirtual; return; } showVirtual=cbVirtual.checked; draw(); });
// f 滑杆+◀▶步进钮（步长 0.5cm，clamp 同滑杆，2/3cm 吸附点保留；凸/凹透镜均可调——凹透镜 f=虚焦距，虚焦点与反向延长虚线交点实时跟随）
var rngF=document.getElementById('rng-f'),lblF=document.getElementById('lbl-f');
var btnFDown=document.getElementById('btn-f-down'),btnFUp=document.getElementById('btn-f-up');
function snapF(v){
  for(var i=0;i<F_SNAPS_CM.length;i++){ if(Math.abs(v-F_SNAPS_CM[i])<=F_SNAP_TOL_CM) return F_SNAPS_CM[i]; }
  return v;
}
function syncSlider(){
  if(rngF) rngF.value=fCmV;
  if(lblF) lblF.textContent='f = '+fCmV.toFixed(1)+' cm';
  if(rngD) rngD.value=dCmV;
  if(lblD) lblD.textContent='Ø '+dCmV.toFixed(1)+' cm';
}
if(rngF) rngF.addEventListener('input',function(){
  if(state.animating){ rngF.value=fCmV; return; }
  setF(snapF(+rngF.value)); syncSlider(); draw();
});
function nudgeF(dir){
  if(state.animating) return;
  setF(snapF(Math.max(F_MIN_CM,Math.min(F_MAX_CM,fCmV+dir*0.5))));
  syncSlider(); draw();
}
if(btnFDown) btnFDown.addEventListener('click',function(){ nudgeF(-1); if(window.playClick) playClick(); });
if(btnFUp) btnFUp.addEventListener('click',function(){ nudgeF(1); if(window.playClick) playClick(); });
// 直径滑杆（=孔径，2.4~6.0cm 步进 0.1cm；与 f 解耦——直径不改焦距、只改通光量；凸/凹在场均可调；仅场景一显示）
var rngD=document.getElementById('rng-d'),lblD=document.getElementById('lbl-d');
if(rngD) rngD.addEventListener('input',function(){
  if(state.animating){ rngD.value=dCmV; return; }
  setD(Math.max(D_MIN_CM,Math.min(D_MAX_CM,+rngD.value))); syncSlider(); draw();
});
// 读数面板（物理按压两态；关面板不清数据，reset 才清）
var btnTable=document.getElementById('btn-table'),panelRead=document.getElementById('panel-read');
if(btnTable&&panelRead) btnTable.addEventListener('click',function(){
  if(state.animating) return;
  var show=!panelRead.classList.contains('show');
  panelRead.classList.toggle('show',show); btnTable.classList.toggle('on',show);
  if(window.playClick) playClick();
  updatePanel();
});
// 重置：场景一回初始态②（凸透镜预置居中 f=2cm/直径200+F 标记+光源关+托盘满）；场景二回场景二初始态（不回场景一）
function resetBench(){
  var B=state.bench;
  B.source=null; glowFx=[];
  B.lens={kind:'convex',x:clampLensX(Math.round(W*0.5))};
  B.f=F_DEF_CM; B.d=D_DEF_CM; setF(F_DEF_CM); setD(D_DEF_CM);
  B.everConvex=false; B.everConcave=false;   // R8-2：统一结论旗标随重置清零——否则重置后 intro 一播完 b-s8 电平立真即刻复播=「开屏即结论」
  showFocus=true; showVirtual=true; showLabels=false; showFlow=false;
  if(btnFocus) btnFocus.classList.add('on');
  if(btnLabels) btnLabels.classList.remove('on');
  if(btnFlow) btnFlow.classList.remove('on');
  if(cbVirtual) cbVirtual.checked=true;
  var t=document.getElementById('toast'); if(t) t.classList.remove('show');
}
function resetFocal(){
  var F=state.focal;
  F.lens={kind:'convex',x:clampLensX(Math.round(W*SC_X_FRAC))};
  F.screen={x:clampScreenX(Math.round(W*SC_SCREEN_X_FRAC)),atF:false};
  F.f=F_DEF_CM; F.d=FOCAL_D_DEF_CM; setF(F.f); setD(F.d);
  var t=document.getElementById('toast'); if(t) t.classList.remove('show');
}
var btnReset=document.getElementById('btn-reset');
if(btnReset) btnReset.addEventListener('click',function(){
  if(state.animating) return;
  if(state.scene==='bench') resetBench(); else resetFocal();
  syncSlider(); if(window.playClick) playClick(); draw();
  window.GUIDE_RESET&&window.GUIDE_RESET.all();
});
// ===== 场景切换钮（两态：☀️ 测焦距 / 🔦 返回光学台）+ 飞入飞出动画 =====
var btnScene=document.getElementById('btn-scene');
var grpD=document.getElementById('grp-d'),grpShow=document.getElementById('grp-show');
function syncSceneUI(){
  var focal=state.scene==='focal';
  if(btnScene){ btnScene.textContent=focal?'🔦 返回光学台':'☀️ 测焦距'; btnScene.classList.toggle('on',focal); }
  // 场景二只留焦距卡+系统卡+场景钮：直径卡/显示开关卡 CSS 淡出滑上
  if(grpD) grpD.classList.toggle('flyout',focal);
  if(grpShow) grpShow.classList.toggle('flyout',focal);
}
function switchScene(){
  if(state.animating) return;
  cur().f=fCmV; cur().d=dCmV;                    // 活跃值（cm）存回当前场景
  state.scene=(state.scene==='bench')?'focal':'bench';
  var T=cur(); setF(T.f); setD(T.d);             // 载入目标场景（两场景状态完全隔离）
  state.animating=true; state.anim={to:state.scene,t0:performance.now()};
  syncSceneUI(); syncSlider();
  if(window.playClick) playClick();
  if(window.GUIDE_SCENE) window.GUIDE_SCENE.change();   // EG4c：切场景立即静音+清在途调度（B6 推荐③）
}
if(btnScene) btnScene.addEventListener('click',switchScene);
var btnMute=document.getElementById('btn-mute');
if(btnMute) btnMute.addEventListener('click',function(){ if(state.animating) return; window.muted=!window.muted; btnMute.textContent=window.muted?'🔇':'🔊'; if(window.playClick) playClick(); });
// 全屏（c4s3 路线：documentElement + html.pseudo-fs 降级）
var btnFull=document.getElementById('btn-full');
function pickFn(el,names){for(var i=0;i<names.length;i++){var fn=el[names[i]];if(typeof fn==='function')return fn;}return null;}
function fullEl(){return document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement;}
function syncFull(){btnFull.textContent=(fullEl()||document.documentElement.classList.contains('pseudo-fs'))?'退出全屏':'全屏';}
function reqFull(){
  var el=document.documentElement,f=pickFn(el,['requestFullscreen','webkitRequestFullscreen','webkitRequestFullScreen','mozRequestFullScreen','msRequestFullscreen']);
  if(!f){document.documentElement.classList.add('pseudo-fs');syncFull();return;}
  var r=f.call(el);if(r&&r.catch)r.catch(function(){document.documentElement.classList.add('pseudo-fs');syncFull();});
  setTimeout(function(){if(!fullEl()&&!document.documentElement.classList.contains('pseudo-fs')){document.documentElement.classList.add('pseudo-fs');syncFull();}},400);
}
function exitFull(){
  var f=pickFn(document,['exitFullscreen','webkitExitFullscreen','webkitCancelFullScreen','mozCancelFullScreen','msExitFullscreen']);
  if(f)f.call(document);document.documentElement.classList.remove('pseudo-fs');syncFull();
}
if(btnFull) btnFull.addEventListener('click',function(){if(state.animating)return;if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();if(window.playClick) playClick();});
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(ev){document.addEventListener(ev,function(){syncFull();setTimeout(resize,60);});});

// ===== sprite 重绘钩子（加性回调，仅注册有 sprite 文件的件；透镜已统一矢量无 sprite） =====
['laser_pen','bulb'].forEach(function(id){
  PROPS.onSprite(id,function(){ draw(); });
});

// ===== 动画 tick（场景切换飞入飞出 + 开关光晕 300ms 渐隐 + 光流脉冲） =====
function tick(){
  if(state.animating){
    if(performance.now()-state.anim.t0>=ANIM_DUR){
      state.animating=false; state.anim=null;
      syncSlider();   // 动画结束按新场景重载滑杆
    }
    draw();
  }else if(glowFx.length||showFlow) draw();
  requestAnimationFrame(tick);
}

window.addEventListener('resize',resize);
// 控制栏高度监听：折行/紧凑档/全屏导致 ctrlbar 尺寸变化 → 重测 ctrlBandH → 重排托盘位并重绘
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); if(toolbox){ layout(); draw(); } }).observe(ctrlEl);
}
state.bench.lens={kind:'convex',x:480};   // 场景一初始态②：凸透镜预置居中（resize 内 clampLensX 校正），光源关、托盘满
layout(); resize();
state.focal.lens={kind:'convex',x:clampLensX(Math.round(W*SC_X_FRAC))};      // 场景二预置凸透镜（与场景一完全隔离）
state.focal.screen={x:clampScreenX(Math.round(W*SC_SCREEN_X_FRAC)),atF:false};
syncSceneUI(); syncSlider(); draw(); requestAnimationFrame(tick);

window.__c5s1dbg={ get state(){return state;}, get W(){return W;}, get H(){return H;}, get axisY(){return axisY;}, get fPx(){return fPx;},
  place:function(kind){ state.bench.lens={kind:kind||'convex',x:Math.round(W*0.5)}; if(state.scene==='bench'){fPx=state.bench.f;dPx=state.bench.d;} syncSlider(); draw(); },
  pens:function(on){ state.bench.source={type:'pens',x:PENS_X,yOff:0,on:[!!on,!!on,!!on]}; draw(); },
  bulb:function(on,x){ state.bench.source={type:'bulb',x:x?clampBulbX(x):Math.round(W*BULB_X_FRAC),on:!!on,snapped:false}; draw(); },
  screen:function(x){ state.focal.screen={x:x?clampScreenX(x):Math.round(W*SC_SCREEN_X_FRAC),atF:false}; draw(); },
  setF:function(v){ setF(Math.max(F_MIN_CM,Math.min(F_MAX_CM,v))); syncSlider(); draw(); } };
})();

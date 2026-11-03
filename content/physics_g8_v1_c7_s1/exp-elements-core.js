/* exp-elements-core.js — c7s1 E2 三要素推门工坊（单场景）
   物理语义：转动效果 ∝ 大小×方向有效分量(cosθ)×作用点力臂；示意图=起点作用点/箭头方向/长∝大小 */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var TWEEN_MS=380,PUSH_K=0.16,TAU_MIN=0.28;   // 开门角速度增益 / 最小有效力矩（低于=爱动不动）
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var hintEl=document.getElementById('hint');
var W=960,H=520,DPR=1,ctrlBandH=110,COMPACT_H=600,dirty=true;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(v,n){ return (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }

var state={
  e:{pointMark:0.75,angle:0,F:5,pushing:false,open:0,openTw:null,omega:0,eff:0,
     nearTried:false,farTried:false,parTried:false,bigTried:false,
     successCount:0,pushStartOpen:0,pushT:0,fullWarned:false}
};
window.C7S1_STATE=state;

var L={};
function layout(){
  L.fy=H-ctrlBandH;
  L.door={x:Math.round(W*0.36),y:L.fy-14,w:Math.min(170,Math.round(H*0.34)),h:Math.min(250,Math.round(H*0.52))};
  L.dial={x:Math.round(W*0.72),y:Math.round(H*0.30),r:Math.min(74,Math.round(H*0.16))};
}
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl(); layout(); placeHint(); repositionPanels();
  dirty=true;
}
function rrPath(x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x,y+h,r); ctx.closePath();
}
function ghostCard(x,y,w,h){
  rrPath(x,y,w,h,10);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=1.5; ctx.stroke();
}
function drawArrow(x0,y0,x1,y1,color,lw){
  var dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy); if(d<4) return;
  var ux=dx/d,uy=dy/d,hd=Math.max(8,d*0.20);
  ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=lw||4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1-ux*hd*0.8,y1-uy*hd*0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1,y1);
  ctx.lineTo(x1-ux*hd-uy*hd*0.5,y1-uy*hd+ux*hd*0.5);
  ctx.lineTo(x1-ux*hd+uy*hd*0.5,y1-uy*hd-ux*hd*0.5);
  ctx.closePath(); ctx.fill(); ctx.restore();
}

/* ===== 物理：有效力矩=大小×cos(方向偏角)×力臂(作用点) ===== */
function torque(){
  var E=state.e;
  return E.F*Math.cos(E.angle*Math.PI/180)*E.pointMark;
}
function effText(t){
  if(t<TAU_MIN) return '爱动不动';
  if(t<1.6) return '慢';
  if(t<4) return '中等';
  return '快';
}
function eTick(now,dtMs){
  var E=state.e,bsy=false;
  E.eff=torque();
  if(E.openTw){
    var p=clamp((now-E.openTw.t0)/600,0,1);
    E.open=E.openTw.f0+(E.openTw.f1-E.openTw.f0)*easeInOut(p);
    if(p>=1){ E.open=E.openTw.f1; E.openTw=null; } else bsy=true;
    E.omega=0; dirty=true; return bsy;
  }
  if(E.pushing&&E.eff>=TAU_MIN&&E.open<1){
    E.omega=PUSH_K*E.eff;
    E.open=clamp(E.open+E.omega*dtMs/1000,0,1);
    bsy=true; dirty=true;
  }else{
    if(E.omega!==0){ E.omega=0; dirty=true; }
  }
  return bsy;
}
function pushToggle(){
  var E=state.e;
  E.pushing=!E.pushing;
  var btn=document.getElementById('btn-push');
  if(btn){ btn.textContent=E.pushing?'停止推门':'开始推门'; btn.classList.toggle('on',E.pushing); }
  if(E.pushing){
    E.pushStartOpen=E.open; E.pushT=performance.now();
    if(E.pointMark<0.3&&E.F>=5) E.nearTried=true;
    if(Math.abs(E.angle)>70&&E.F>=5) E.parTried=true;
  }else{
    var d=E.open-E.pushStartOpen;
    if(d>0.05&&E.pointMark>0.7) E.farTried=true;
    if(d>0.1) E.successCount++;
    if(d>0.3) E.bigTried=true;
    if(E.F>=8&&Math.abs(E.angle)<30&&E.pointMark>0.5&&d>0.1) E.bigTried=true;
  }
  if(window.playClick) playClick();
  updateHint(); updatePanel(); dirty=true;
}
function closeDoor(){
  var E=state.e;
  if(E.pushing) pushToggle();
  E.openTw={t0:performance.now(),f0:E.open,f1:0};
  E.fullWarned=false;
  if(window.playClick) playClick();
  updateHint(); dirty=true;
}

/* ===== 绘制 ===== */
function render(){
  var E=state.e;
  // 暖白室内墙亮底 + 地板
  ctx.fillStyle='#faf6ee'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#eee5d3'; ctx.fillRect(0,L.fy-14,W,H-L.fy+14);
  ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,L.fy-14); ctx.lineTo(W,L.fy-14); ctx.stroke();
  // 门（合页轴心+作用点返回）
  var dg=PROPS.door(ctx,L.door.x,L.door.y,{w:L.door.w,h:L.door.h,open:E.open,pointMark:E.pointMark});
  // 力示意图箭头：起点=作用点，方向=角度，长∝大小（三滑杆联动实时重画）
  var aLen=18+E.F*13,rad=E.angle*Math.PI/180;
  var ax=dg.point.x+aLen*Math.cos(rad),ay=dg.point.y-aLen*Math.sin(rad);
  drawArrow(dg.point.x,dg.point.y,ax,ay,'#e03131',4.5);
  ctx.fillStyle='#e03131'; ctx.font='bold 14px sans-serif'; ctx.textAlign='left';
  ctx.fillText('F='+fmt(E.F,1)+'N',ax+8,ay+4);
  // 方向角度盘（右上，指针=当前方向；0°=垂直门面最管用）
  var D=L.dial;
  ghostCard(D.x-D.r-16,D.y-D.r-30,D.r*2+32,D.r*2+52);
  ctx.save();
  ctx.strokeStyle='#c9bfa8'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(D.x,D.y,D.r,Math.PI,Math.PI*2); ctx.stroke();
  for(var t=-90;t<=90;t+=30){
    var tr=t*Math.PI/180;
    ctx.strokeStyle='#b7ab90'; ctx.lineWidth=1.2;
    ctx.beginPath();
    ctx.moveTo(D.x+Math.cos(tr)*(D.r-8),D.y-Math.sin(tr)*(D.r-8));
    ctx.lineTo(D.x+Math.cos(tr)*D.r,D.y-Math.sin(tr)*D.r);
    ctx.stroke();
  }
  ctx.fillStyle='#8a7c66'; ctx.font='11px sans-serif'; ctx.textAlign='center';
  ctx.fillText('垂直门面(0°)最管用 · 顺门面(±90°)白推',D.x,D.y+20);
  var ar=E.angle*Math.PI/180;
  drawArrow(D.x,D.y,D.x+Math.cos(ar)*(D.r-14),D.y-Math.sin(ar)*(D.r-14),'#ea580c',3.5);
  ctx.restore();
  // 转动快慢反馈牌
  var eff=E.eff,txt=(E.pushing&&eff>=TAU_MIN)?('门转动：'+effText(eff)):(E.open>=1?'门已开到底':'未在推门');
  ghostCard(dg.hinge.x-10,L.door.y-L.door.h-40,196,28);
  ctx.fillStyle=E.pushing?'#b45309':'#64748b'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  ctx.fillText(txt,dg.hinge.x,L.door.y-L.door.h-21);
  // 三要素注记（作用点=黑点、力臂虚线到轴）
  ctx.save(); ctx.strokeStyle='rgba(100,116,139,.7)'; ctx.lineWidth=1.4; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(dg.hinge.x,dg.hinge.y); ctx.lineTo(dg.point.x,dg.point.y); ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#475569'; ctx.font='12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('力臂（作用点离轴 '+Math.round(E.pointMark*100)+'%）',(dg.hinge.x+dg.point.x)/2,dg.hinge.y+18);
  ctx.fillText('门轴（合页）',dg.hinge.x,dg.hinge.y-L.door.h*0.30);
}
function draw(){ ctx.clearRect(0,0,W,H); render(); updatePanel(); }

/* ===== hint ===== */
function placeHint(){
  if(!hintEl) return;
  measureCtrl();
  hintEl.style.top=''; hintEl.style.bottom='';
  var hr=hintEl.getBoundingClientRect(),cr=ctrlEl?ctrlEl.getBoundingClientRect():null;
  if(cr&&hr.height&&hr.bottom>cr.top+1&&hr.top<cr.bottom){
    hintEl.style.top='auto'; hintEl.style.bottom=(ctrlBandH+10)+'px';
  }
}
var hintTimer=null,hintOverride=null;
function updateHint(){
  if(!hintEl) return;
  clearTimeout(hintTimer);
  placeHint();
  hintEl.textContent=hintOverride||hintText(); hintOverride=null;
  hintEl.style.opacity='1';
  hintTimer=setTimeout(function(){ if(hintEl) hintEl.style.opacity='0'; },8000);
}
function hintText(){
  var E=state.e;
  if(E.open>=1) return '门已开到底啦——点「关上门」再练。试试：作用点滑到离轴近/远各推一次，方向换到±90°再推，对比转动快慢';
  if(E.nearTried&&E.farTried) return '体验到了：靠近门轴推爱动不动，离轴远推轻松——作用点影响力的作用效果';
  if(E.parTried) return '顺着门面推等于白推，垂直门面推最管用——方向也影响力的作用效果';
  if(E.pushing) return '正在推门：转动'+effText(E.eff)+'。红色箭头就是力的示意图：长短=大小、箭头=方向、起点=作用点';
  return '调三个滑杆（作用点/方向/大小），点「开始推门」看门转动快慢，图上红箭头=力的示意图实时重画';
}

/* ===== 读数面板（幽灵化+pickSlot） ===== */
function rectInterArea(a,r){
  var x0=Math.max(a.x,r.x),y0=Math.max(a.y,r.y),x1=Math.min(a.x+a.w,r.x+r.w),y1=Math.min(a.y+a.h,r.y+r.h);
  return (x1>x0&&y1>y0)?(x1-x0)*(y1-y0):0;
}
function pickSlot(needW,needH,avoidRects){
  var m=12,botY=H-ctrlBandH-10;
  var slots=[
    {name:'tl',x:m,y:m},
    {name:'tr',x:Math.max(m,W-needW-m),y:m},
    {name:'bl',x:m,y:Math.max(m,botY-needH)},
    {name:'br',x:Math.max(m,W-needW-m),y:Math.max(m,botY-needH)}
  ];
  var best=slots[0],bestArea=Infinity;
  for(var i=0;i<slots.length;i++){
    var rect={x:slots[i].x,y:slots[i].y,w:needW,h:needH},area=0;
    (avoidRects||[]).forEach(function(r){ if(r) area+=rectInterArea(rect,r); });
    if(area===0) return slots[i];
    if(area<bestArea){ bestArea=area; best=slots[i]; }
  }
  return best;
}
function sceneAvoidRects(){
  var D=L.dial;
  return [
    {x:0,y:H-ctrlBandH,w:W,h:ctrlBandH+40},
    {x:L.door.x-L.door.w/2-30,y:L.door.y-L.door.h-50,w:L.door.w+140,h:L.door.h+60},
    {x:D.x-D.r-20,y:D.y-D.r-34,w:D.r*2+40,h:D.r*2+60}
  ];
}
function placeReadPanel(){
  var el=document.getElementById('panel-read'); if(!el) return;
  var slot=pickSlot(el.offsetWidth||260,el.offsetHeight||160,sceneAvoidRects());
  el.style.left=slot.x+'px'; el.style.top=slot.y+'px';
}
var openP=null;
function repositionPanels(){ if(openP==='read') placeReadPanel(); }
function openPanel(){
  openP=(openP==='read')?null:'read';
  document.getElementById('panel-read').classList.toggle('show',openP==='read');
  document.getElementById('btn-table').classList.toggle('on',openP==='read');
  if(openP==='read'){ updatePanel(); placeReadPanel(); }
}
function setText(id,t){ var el=document.getElementById(id); if(el&&el.textContent!==t) el.textContent=t; }
function updatePanel(){
  var E=state.e;
  setText('rd-point',Math.round(E.pointMark*100)+' %（'+(E.pointMark>0.6?'离轴远':(E.pointMark<0.3?'靠近轴':'中间'))+'）');
  setText('rd-dir','与门面夹角 '+(90-Math.abs(E.angle))+'°');
  setText('rd-size',fmt(E.F,1)+' N');
  setText('rd-eff','力矩 '+fmt(E.eff,2)+' → '+effText(E.eff));
  setText('rd-open',Math.round(E.open*100)+' %');
}

/* ===== 控制栏接线 ===== */
var rngPoint=document.getElementById('rng-point'),rngDir=document.getElementById('rng-dir'),rngSize=document.getElementById('rng-size');
if(rngPoint) rngPoint.addEventListener('input',function(){
  state.e.pointMark=parseFloat(rngPoint.value)/100;
  setText('lbl-point',rngPoint.value+' %');
  updatePanel(); dirty=true;
});
if(rngDir) rngDir.addEventListener('input',function(){
  state.e.angle=parseFloat(rngDir.value);
  setText('lbl-dir',(90-Math.abs(state.e.angle))+'°');
  updatePanel(); dirty=true;
});
if(rngSize) rngSize.addEventListener('input',function(){
  state.e.F=parseFloat(rngSize.value);
  setText('lbl-size',fmt(state.e.F,1)+' N');
  updatePanel(); dirty=true;
});
var btnPush=document.getElementById('btn-push');
if(btnPush) btnPush.addEventListener('click',function(){ pushToggle(); });
var btnClose=document.getElementById('btn-close');
if(btnClose) btnClose.addEventListener('click',function(){ closeDoor(); });
var btnTable=document.getElementById('btn-table');
if(btnTable) btnTable.addEventListener('click',function(){ openPanel(); if(window.playClick)playClick(); });
var btnReset=document.getElementById('btn-reset');
if(btnReset) btnReset.addEventListener('click',function(){
  var E=state.e;
  if(E.pushing) pushToggle();
  E.pointMark=0.75; E.angle=0; E.F=5; E.open=0; E.openTw=null; E.omega=0;
  E.nearTried=E.farTried=E.parTried=E.bigTried=false; E.successCount=0; E.fullWarned=false;
  if(rngPoint)rngPoint.value=75; if(rngDir)rngDir.value=0; if(rngSize)rngSize.value=5;
  setText('lbl-point','75 %'); setText('lbl-dir','90°'); setText('lbl-size','5.0 N');
  var b=document.getElementById('btn-push'); if(b){b.textContent='开始推门';b.classList.remove('on');}
  updateHint(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
  window.GUIDE_RESET&&window.GUIDE_RESET.all();
});
var btnMute=document.getElementById('btn-mute');
if(btnMute) btnMute.addEventListener('click',function(){ window.muted=!window.muted; btnMute.textContent=window.muted?'🔇':'🔊'; if(window.playClick)playClick(); });
var btnFull=document.getElementById('btn-full');
function pickFn(el,names){for(var i=0;i<names.length;i++){var fn=el[names[i]];if(typeof fn==='function')return fn;}return null;}
function fullEl(){return document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement;}
function syncFull(){if(btnFull)btnFull.textContent=(fullEl()||document.documentElement.classList.contains('pseudo-fs'))?'退出全屏':'全屏';}
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
if(btnFull) btnFull.addEventListener('click',function(){if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();if(window.playClick)playClick();});
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(ev){document.addEventListener(ev,function(){syncFull();setTimeout(resize,60);});});

/* ===== tick ===== */
var lastNow=0;
function tick(){
  var now=performance.now(),dt=lastNow?Math.min(64,now-lastNow):16; lastNow=now;
  var bsy=eTick(now,dt);
  if(bsy||dirty){ dirty=false; draw(); }
  requestAnimationFrame(tick);
}
layout(); resize(); updateHint(); updatePanel(); draw();
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); placeHint(); repositionPanels(); dirty=true; }).observe(ctrlEl);
}
requestAnimationFrame(tick);
window.__c7dbg={
  get state(){ return state; }, get W(){ return W; }, get H(){ return H; }, get layout(){ return L; },
  torque:torque,
  set:function(o){ var E=state.e; if(o.pointMark!=null)E.pointMark=o.pointMark; if(o.angle!=null)E.angle=o.angle; if(o.F!=null)E.F=o.F;
    if(rngPoint)rngPoint.value=E.pointMark*100; if(rngDir)rngDir.value=E.angle; if(rngSize)rngSize.value=E.F; dirty=true; }
};
})();

/* exp-mutual-core.js — c7s1 E3 相互作用台（单场景）
   物理语义：两磁车同名极相对，释放后同时受对方斥力、同时反向弹开（力的作用是相互的） */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var REP_K=900000,V_MAX=420,FRICTION=0.35,STOP_V=6;   // 斥力积分常数（教学示意）
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var hintEl=document.getElementById('hint');
var W=960,H=520,DPR=1,ctrlBandH=110,COMPACT_H=600,dirty=true;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(v,n){ return (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }

var state={
  m:{released:false,running:false,settled:false,relT:0,
     lx:0,rx:0,lv:0,rv:0,gap0:120}
};
window.C7S1_STATE=state;

var L={};
function layout(){
  L.fy=H-ctrlBandH;
  L.floorY=L.fy-16;
  L.cartW=Math.min(150,Math.round(W*0.16));
  state.m.gap0=Math.round(L.cartW*1.05);
  homePos();
}
function homePos(){
  var M=state.m;
  M.lx=Math.round(W/2-M.gap0/2-L.cartW*0.05);
  M.rx=Math.round(W/2+M.gap0/2+L.cartW*0.05);
  M.lv=0; M.rv=0;
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
  var ux=dx/d,uy=dy/d,hd=Math.max(8,d*0.22);
  ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=lw||3.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1-ux*hd*0.8,y1-uy*hd*0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1,y1);
  ctx.lineTo(x1-ux*hd-uy*hd*0.5,y1-uy*hd+ux*hd*0.5);
  ctx.lineTo(x1-ux*hd+uy*hd*0.5,y1-uy*hd-ux*hd*0.5);
  ctx.closePath(); ctx.fill(); ctx.restore();
}

/* ===== 物理：斥力 a=K/gap²，双车对称反向；碰画面边缘停 ===== */
function mTick(now,dtMs){
  var M=state.m;
  if(!M.running) return false;
  var dt=Math.min(32,dtMs)/1000,steps=2,h=dt/steps;
  for(var s=0;s<steps;s++){
    var gap=Math.max(24,M.rx-M.lx);
    var a=Math.min(1600,REP_K/(gap*gap));
    M.lv-=a*h; M.rv+=a*h;                     // 左车向左、右车向右（同时受力）
    M.lv*=(1-FRICTION*h); M.rv*=(1-FRICTION*h);
    M.lx+=M.lv*h; M.rx+=M.rv*h;
    var minL=L.cartW*0.55+14,maxR=W-L.cartW*0.55-14;
    if(M.lx<minL){ M.lx=minL; M.lv=0; }
    if(M.rx>maxR){ M.rx=maxR; M.rv=0; }
  }
  var stopped=(Math.abs(M.lv)<STOP_V&&Math.abs(M.rv)<STOP_V)||
    (M.lx<=L.cartW*0.55+15&&M.rx>=W-L.cartW*0.55-15);
  if(stopped||(now-M.relT)>6000){
    M.running=false; M.settled=true; M.lv=0; M.rv=0;
    if(window.playMatch) playMatch();
    updateHint(); updatePanel();
  }
  dirty=true;
  return true;
}
function release(){
  var M=state.m;
  if(M.released){   // 未复位再点释放 → guide e1 纠错语音接管，这里只轻提示
    hintOverride='小车还没复位呢，先点「复位」再释放';
    updateHint();
    if(window.playDrop) playDrop();
    return;
  }
  M.released=true; M.running=true; M.settled=false; M.relT=performance.now();
  if(window.playClick) playClick();
  updateHint(); updatePanel(); dirty=true;
}
function resetCarts(){
  var M=state.m;
  homePos();
  M.released=false; M.running=false; M.settled=false;
  if(window.playDrop) playDrop();
  updateHint(); updatePanel(); dirty=true;
}

/* ===== 绘制（浅灰白桌面亮底） ===== */
function cartY(){ return L.floorY; }
function render(){
  var M=state.m;
  ctx.fillStyle='#f4f4f2'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#e3e1dc'; ctx.fillRect(0,L.floorY,W,H-L.floorY);
  ctx.strokeStyle='rgba(0,0,0,.10)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,L.floorY); ctx.lineTo(W,L.floorY); ctx.stroke();
  var cy=cartY(),cw=L.cartW;
  // 两磁车（左车头朝右、右车头朝左，同名极 N-N 相对）
  var cl=PROPS.magnet_cart(ctx,M.lx,cy,{w:cw,dir:'right'});
  var cr=PROPS.magnet_cart(ctx,M.rx,cy,{w:cw,dir:'left'});
  var mw=Math.min(96,cw*0.62);
  PROPS.bar_magnet(ctx,cl.mounts.magnet.x,cl.mounts.magnet.y-mw*0.16,{label:true,w:mw,angle:0});      // 左车：S左N右 → N 朝向右车
  PROPS.bar_magnet(ctx,cr.mounts.magnet.x,cr.mounts.magnet.y-mw*0.16,{label:true,w:mw,angle:180});     // 右车翻转：N 朝向左车（同名极相对）
  ctx.fillStyle='#8a7c66'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('同名磁极相对（N ↔ N）',W/2,cy-cl.h-70);
  // 速度箭头 + 双车速度读数牌
  var vl=Math.abs(M.lv),vr=Math.abs(M.rv);
  if(M.released){
    if(vl>4) drawArrow(M.lx-cw*0.5,cy-cl.h-24,M.lx-cw*0.5-clamp(vl/V_MAX,0,1)*80,cy-cl.h-24,'#2563eb',4);
    if(vr>4) drawArrow(M.rx+cw*0.5,cy-cr.h-24,M.rx+cw*0.5+clamp(vr/V_MAX,0,1)*80,cy-cr.h-24,'#2563eb',4);
    ghostCard(M.lx-64,cy+14,128,26);
    ctx.fillStyle='#1e293b'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('左车 v='+fmt(vl/40,1),M.lx,cy+32);
    ghostCard(M.rx-64,cy+14,128,26);
    ctx.fillText('右车 v='+fmt(vr/40,1),M.rx,cy+32);
  }
  if(M.settled){
    ghostCard(W/2-150,cy-cl.h-118,300,28);
    ctx.fillStyle='#b45309'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('两车同时弹开：都受到了对方的力',W/2,cy-cl.h-99);
  }
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
  var M=state.m;
  if(M.settled) return '两车同时弹开、速度读数牌同时变化——谁也没碰谁，却都受到了对方的力。点「复位」可再来一次';
  if(M.running) return '观察：两车反向弹开，双车速度读数牌同时在变';
  return '两辆磁车同名磁极（N↔N）相对静止。点「释放」看会发生什么';
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
  var M=state.m,cw=L.cartW;
  return [
    {x:0,y:H-ctrlBandH,w:W,h:ctrlBandH+40},
    {x:M.lx-cw/2-90,y:L.floorY-160,w:(M.rx-M.lx)+cw+180,h:200}
  ];
}
function placeReadPanel(){
  var el=document.getElementById('panel-read'); if(!el) return;
  var slot=pickSlot(el.offsetWidth||240,el.offsetHeight||120,sceneAvoidRects());
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
  var M=state.m;
  setText('rd-vl',fmt(Math.abs(M.lv)/40,1)+'（向左）');
  setText('rd-vr',fmt(Math.abs(M.rv)/40,1)+'（向右）');
  setText('rd-st',M.settled?'已弹开停稳':(M.running?'弹开中…':'静止（同名极相对）'));
}

/* ===== 控制栏接线 ===== */
var btnRelease=document.getElementById('btn-release');
if(btnRelease) btnRelease.addEventListener('click',function(){ release(); });
var btnResetCart=document.getElementById('btn-reset-cart');
if(btnResetCart) btnResetCart.addEventListener('click',function(){ resetCarts(); });
var btnTable=document.getElementById('btn-table');
if(btnTable) btnTable.addEventListener('click',function(){ openPanel(); if(window.playClick)playClick(); });
var btnReset=document.getElementById('btn-reset');
if(btnReset) btnReset.addEventListener('click',function(){
  resetCarts();
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
  var bsy=mTick(now,dt);
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
  release:release, reset:resetCarts
};
})();

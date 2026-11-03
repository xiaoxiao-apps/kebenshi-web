/* exp-elastic-core.js — c7s2 E4 弹性与弹性限度探究器（单场景，白亮底）
   物理语义：弹性体（弹簧/直尺/橡皮筋）松手后恢复原状；橡皮泥塑性形变不恢复；
   超限度开关+拉力≥75% 时松手 → 弹簧超过弹性限度，永久变形（permSpring 残留伸长） */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var REL_MS=420;                       // 松手复原/定形 tween（easeOut 单调，禁回弹）
var DESK_BAND=109;                    // 桌带厚度锁 109px（库定版）
var OVER_PULL=75,PERM_K=0.55;         // 超限度阈值（拉力%）与永久变形残留系数
var TOOL_CN={spring:'弹簧',ruler:'直尺',band:'橡皮筋',clay:'橡皮泥'};
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var hintEl=document.getElementById('hint');
var W=960,H=520,DPR=1,ctrlBandH=110,COMPACT_H=600,dirty=true;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function easeOut(t){ return 1-Math.pow(1-t,3); }

var state={
  e:{tool:'spring',pull:0,over:false,pulling:false,pullT:0,
     released:false,restored:false,permanent:false,lastTool:null,
     tried:{},triedCount:0,relTw:null,
     ts:{spring:{def:0,perm:0,pull:0},ruler:{def:0,perm:0,pull:0},
         band:{def:0,perm:0,pull:0},clay:{def:0,perm:0,pull:0}}}
};
window.C7S2_STATE=state;
function TS(){ return state.e.ts[state.e.tool]; }
function defOf(t){ return state.e.ts[t].def; }

var L={};
function layout(){
  L.fy=H-ctrlBandH;
  L.by=Math.max(40,L.fy-DESK_BAND);
  L.seat=PROPS.seatY(L.by,64,26);
  L.cx=Math.round(W*0.5);
  L.beamY=Math.round(Math.max(H*0.14,54));
  L.springH0=clamp(Math.round(L.seat-56-L.beamY),110,200);
  L.rulerLen=Math.min(240,Math.round(W*0.26));
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
function springH(H0,st){   // spring_vertical 总高同公式（顶环固定 → 底钩 y=顶+H）
  var ringR=Math.max(4,H0*0.028),hookL=H0*0.10,coil0=H0-hookL-ringR*2-4;
  return coil0*(1+0.45*st)+hookL+ringR*2+4;
}

/* ===== 交互 ===== */
function setTool(t){
  var E=state.e;
  if(E.relTw) return;                 // tween 中禁切换
  E.tool=t; E.pull=E.ts[t].pull;
  var rng=document.getElementById('rng-pull');
  if(rng) rng.value=String(E.pull);
  syncPullLabel();
  syncToolBtns();
  updateHint(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
}
function syncToolBtns(){
  ['spring','ruler','band','clay'].forEach(function(t){
    var b=document.getElementById('btn-tool-'+t);
    if(b) b.classList.toggle('on',state.e.tool===t);
  });
}
function syncPullLabel(){
  var el=document.getElementById('lbl-pull');
  if(el) el.textContent=state.e.pull+' %';
}
function onPull(){
  var E=state.e,ts=TS();
  if(E.relTw) return;
  E.pull=+document.getElementById('rng-pull').value;
  ts.pull=E.pull;
  ts.def=ts.perm+(E.pull/100)*(1-ts.perm);   // 形变=永久残留之上再加拉伸
  E.pulling=E.pull>0;
  if(E.pull>0){ E.pullT=performance.now(); E.released=false; E.restored=false; }
  syncPullLabel(); updateHint(); updatePanel(); dirty=true;
}
function release(){
  var E=state.e,ts=TS();
  if(E.relTw) return;
  if(!E.released||ts.pull>0){
    // 松手：弹性体 def→0；橡皮泥 def 冻结=塑性；超限度弹簧 def→残留
    var permNew=0;
    if(E.tool==='clay') permNew=ts.def;
    else if(E.tool==='spring'&&E.over&&E.pull>=OVER_PULL) permNew=ts.def*PERM_K;
    E.relTw={t0:performance.now(),tool:E.tool,from:ts.def,to:permNew};
    ts.pull=0; E.pull=0;
    var rng=document.getElementById('rng-pull'); if(rng) rng.value='0';
    syncPullLabel();
    if(window.playClick) playClick();
  }else{
    hintOverride='现在拉力是 0，先拖「拉力」滑杆把它拉一拉，再点松手';
    updateHint();
  }
  dirty=true;
}
function relFinish(tw){
  var E=state.e,tsd=E.ts[tw.tool];
  tsd.def=tw.to; tsd.perm=tw.to;
  E.relTw=null; E.released=true; E.lastTool=tw.tool;
  E.restored=(tw.to===0&&tw.tool!=='clay');
  if(tw.tool==='spring'&&tw.to>0) E.permanent=true;   // permanent 仅指超限度弹簧永久变形
  E.tried[tw.tool]=1; E.triedCount=Object.keys(E.tried).length;
  if(E.restored){ if(window.playMatch) playMatch(); }
  else if(window.playDrop) playDrop();
  if(tw.tool==='clay') hintOverride='橡皮泥松手后保持压扁的样子——不能自动恢复，这是塑性形变';
  else if(tw.to>0) hintOverride='超过弹性限度了！弹簧松手后回不到原长，留下了永久变形';
  else hintOverride=TOOL_CN[tw.tool]+'松手后恢复原状——这种性质叫弹性';
  updateHint(); updatePanel(); dirty=true;
}
function onOver(){
  var E=state.e;
  E.over=document.getElementById('chk-over').checked;
  if(E.over) hintOverride='超限度开关已打开：拉力拉到 '+OVER_PULL+'% 以上再松手，弹簧会超过弹性限度、永久变形';
  updateHint(); dirty=true;
  if(window.playClick) playClick();
}
function resetAll(){
  var E=state.e;
  ['spring','ruler','band','clay'].forEach(function(t){ E.ts[t]={def:0,perm:0,pull:0}; });
  E.pull=0; E.pulling=false; E.released=false; E.restored=false; E.permanent=false;
  E.lastTool=null; E.relTw=null; E.tried={}; E.triedCount=0;
  var rng=document.getElementById('rng-pull'); if(rng) rng.value='0';
  syncPullLabel(); updateHint(); updatePanel(); dirty=true;
}

/* ===== 绘制 ===== */
function drawStand(cx){   // 试验台架：底座+立杆+横梁（弹簧/橡皮筋悬挂用）
  var seatY=L.seat,beamY=L.beamY;
  ctx.save();
  ctx.fillStyle='#9aa1ab'; ctx.strokeStyle='#7d838c'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(cx-70,seatY-10,140,10,3); ctx.fill(); ctx.stroke();   // 底座
  ctx.beginPath(); ctx.roundRect(cx-6,beamY-6,12,seatY-beamY-4,3); ctx.fill(); ctx.stroke();   // 立杆
  ctx.beginPath(); ctx.roundRect(cx-110,beamY-14,220,10,3); ctx.fill(); ctx.stroke();   // 横梁
  ctx.restore();
}
function stationLabel(){
  ctx.fillStyle='#8a7c66'; ctx.font='600 14px sans-serif'; ctx.textAlign='center';
  ctx.fillText('当前器材：'+TOOL_CN[state.e.tool],L.cx,L.beamY-26);
}
function verdictCard(){
  var E=state.e;
  if(!E.released) return;
  var txt=E.restored?'松手后恢复原状 → 弹性':(E.lastTool==='clay'?'松手后不恢复 → 塑性形变':'超过弹性限度 → 永久变形');
  var col=E.restored?'#15803d':'#b91c1c';
  var vy=Math.min(L.seat+16,H-ctrlBandH-46);
  ghostCard(L.cx-130,vy,260,28);
  ctx.fillStyle=col; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText(txt,L.cx,vy+19);
}
function drawSpring(){
  var st=defOf('spring'),H0=L.springH0,cx=L.cx;
  drawStand(cx);
  var hh=springH(H0,st);
  var g=PROPS.spring_vertical(ctx,cx,L.beamY+hh-2,{stretch:st,h:H0});
  if(st>0.01){   // 拉力箭头：底钩竖直向下
    var aLen=22+st*70;
    drawArrow(g.hook.x,g.hook.y+6,g.hook.x,g.hook.y+6+aLen,'#dc2626',4);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F 拉',g.hook.x+10,g.hook.y+10+aLen*0.6);
  }
  if(state.e.ts.spring.perm>0){   // 永久变形标示：变形后原长虚线
    var y0=L.beamY+springH(H0,state.e.ts.spring.perm)-2;
    ctx.save(); ctx.strokeStyle='rgba(37,99,235,.7)'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(cx-70,y0); ctx.lineTo(cx+70,y0); ctx.stroke(); ctx.restore();
    ctx.fillStyle='#2563eb'; ctx.font='11px sans-serif'; ctx.textAlign='left';
    ctx.fillText('永久变形后的原长',cx+74,y0+4);
  }
}
function drawRuler(){
  var b=defOf('ruler'),cx=L.cx,len=L.rulerLen;
  var x0=cx-len/2,y0=L.seat-24;
  ctx.save();   // 垫块（夹持台）
  ctx.fillStyle='#b08a5a'; ctx.strokeStyle='#8a6a42'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(x0-16,y0-4,34,L.seat-y0+4,3); ctx.fill(); ctx.stroke();
  ctx.restore();
  var g=PROPS.ruler_flex(ctx,x0,y0,{bend:b,len:len});
  if(b>0.02){
    var aLen=18+b*56;
    drawArrow(g.tip.x,g.tip.y+10,g.tip.x,g.tip.y+10+aLen,'#dc2626',4);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F 压',g.tip.x+10,g.tip.y+16+aLen*0.6);
  }
}
function drawBand(){
  var st=defOf('band'),cx=L.cx;
  drawStand(cx);
  var armY=L.beamY+Math.round((L.seat-L.beamY)*0.42);
  var w0=Math.min(110,Math.round(W*0.12));
  var wb=w0*(1+0.9*st);
  ctx.save();   // 两侧挂桩
  ctx.fillStyle='#9aa1ab'; ctx.strokeStyle='#7d838c'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(cx-6,armY-4,12,L.seat-armY+4,3); ctx.fill(); ctx.stroke();
  ctx.restore();
  var cyB=armY+Math.round(w0*0.21*(1-0.45*st))+8;
  var g=PROPS.rubber_band(ctx,cx,cyB,{stretch:st,w:w0});
  if(st>0.02){   // 两侧向外拉箭头
    var aLen=16+st*48;
    drawArrow(cx-wb/2-4,cyB,cx-wb/2-4-aLen,cyB,'#dc2626',4);
    drawArrow(cx+wb/2+4,cyB,cx+wb/2+4+aLen,cyB,'#dc2626',4);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('F 拉',cx-wb/2-aLen*0.5,cyB-10);
    ctx.fillText('F 拉',cx+wb/2+aLen*0.5,cyB-10);
  }
}
function drawClay(){
  var p=defOf('clay'),cx=L.cx;
  var size=Math.min(96,Math.round(H*0.17));
  var g=PROPS.plasticine(ctx,cx,L.seat,{size:size,press:p});
  if(p>0.02){   // 手指按压（sprite 指尖坐凹陷底）
    PROPS.hand_press(ctx,g.tip.x,g.tip.y+2,{h:Math.round(size*1.5)});
    drawArrow(cx+size*0.9,L.seat-size*0.9,cx+size*0.9,L.seat-size*0.9+16+p*40,'#dc2626',4);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F 压',cx+size*0.9+10,L.seat-size*0.55);
  }
}
function render(){
  var E=state.e;
  ctx.fillStyle='#fdfcf7'; ctx.fillRect(0,0,W,H);          // E4 白亮底
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  stationLabel();
  if(E.tool==='spring') drawSpring();
  else if(E.tool==='ruler') drawRuler();
  else if(E.tool==='band') drawBand();
  else drawClay();
  verdictCard();
}
function draw(){ ctx.clearRect(0,0,W,H); render(); updatePanel(); }

/* ===== 松手 tween ===== */
function eTick(now){
  var tw=state.e.relTw;
  if(!tw) return false;
  var p=clamp((now-tw.t0)/REL_MS,0,1);
  state.e.ts[tw.tool].def=tw.from+(tw.to-tw.from)*easeOut(p);
  dirty=true;
  if(p>=1) relFinish(tw);
  return true;
}

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
  var E=state.e,ts=TS();
  if(E.released&&E.restored) return TOOL_CN[E.lastTool]+'恢复了原状。换一种器材再拉一拉，先猜谁会恢复';
  if(E.released&&E.lastTool==='clay') return '橡皮泥保持压扁的形状——塑性形变。点「重置」或换器材继续';
  if(E.released&&E.permanent) return '弹簧留下了永久变形：弹性是有限度的。关掉超限度开关、点「重置」可再来';
  if(E.pull>0) return '正在用力拉（'+E.pull+'%），点「松手」看它恢不恢复原状';
  return '选一种器材，拖「拉力」滑杆让它形变，再点「松手」对比';
}

/* ===== 读数面板 ===== */
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
  return [
    {x:0,y:H-ctrlBandH,w:W,h:ctrlBandH+40},
    {x:L.cx-160,y:L.beamY-40,w:320,h:L.seat-L.beamY+60}
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
  var E=state.e,ts=TS();
  setText('rd-tool',TOOL_CN[E.tool]);
  setText('rd-pull',E.pull+' %');
  setText('rd-def',Math.round(ts.def*100)+' %');
  var after='—';
  if(E.released) after=E.restored?'恢复原状（弹性）':(E.lastTool==='clay'?'塑性形变（不恢复）':'永久变形（超弹性限度）');
  setText('rd-after',after);
}

/* ===== 控制栏接线 ===== */
['spring','ruler','band','clay'].forEach(function(t){
  var b=document.getElementById('btn-tool-'+t);
  if(b) b.addEventListener('click',function(){ setTool(t); });
});
var rngPull=document.getElementById('rng-pull');
if(rngPull){ rngPull.addEventListener('input',onPull); rngPull.addEventListener('change',onPull); }
var btnRelease=document.getElementById('btn-release');
if(btnRelease) btnRelease.addEventListener('click',release);
var chkOver=document.getElementById('chk-over');
if(chkOver) chkOver.addEventListener('change',onOver);
var btnTable=document.getElementById('btn-table');
if(btnTable) btnTable.addEventListener('click',function(){ openPanel(); if(window.playClick)playClick(); });
var btnReset=document.getElementById('btn-reset');
if(btnReset) btnReset.addEventListener('click',function(){
  resetAll();
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
layout(); resize(); syncToolBtns(); syncPullLabel(); updateHint(); updatePanel(); draw();
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); placeHint(); repositionPanels(); dirty=true; }).observe(ctrlEl);
}
requestAnimationFrame(tick);
window.__c7dbg={
  get state(){ return state; }, get W(){ return W; }, get H(){ return H; }, get layout(){ return L; },
  setTool:setTool, release:release, reset:resetAll
};
})();

/* exp-plumb-core.js — c7s3 E7 竖直向下与小地球（双场景：A 墙面倾角 暖白亮底 / B 小地球 深蓝太空暗底）
   物理语义：重力方向恒竖直向下（plumb_line 件内固定竖直，不随墙面倾斜）；
   球形地球上各地的"下"=指向地心（person_pin 径向站立，箭头恒指球心） */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var DESK_BAND=109;
var SPOTS=[
  {id:'cn',lat:30,lon:30,label:'中国'},      // 风格化坐标（earth_globe 可见性 cos(lon)>0.02，非真实经纬）
  {id:'sa',lat:-25,lon:-45,label:'南美'},
  {id:'au',lat:-30,lon:60,label:'澳洲'},
  {id:'np',lat:85,lon:0,label:'北极'}
];
var SPOT_CN={cn:'中国',sa:'南美',au:'澳洲',np:'北极'};
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var hintEl=document.getElementById('hint');
var W=960,H=520,DPR=1,ctrlBandH=110,COMPACT_H=600,dirty=true;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function srand(n){ var x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); }

var state={
  scene:'a',
  a:{tilt:0,tiltChanged:0},
  b:{spot:null}
};
window.C7S3_STATE=state;
var GEO=null;   // 每帧缓存：{globe:{center,spots},wall:{anchor,nx,ny,plumbLen}}

var L={};
function layout(){
  L.fy=H-ctrlBandH;
  L.by=Math.max(40,L.fy-DESK_BAND);
  L.seat=PROPS.seatY(L.by,64,26);
  L.wallX=Math.round(W*0.42);
  L.wallH=Math.min(250,Math.round(L.seat-H*0.12));
  L.wallW=Math.max(20,Math.round(L.wallH*0.10));
  L.globeR=Math.min(150,Math.round((H-ctrlBandH)*0.34),Math.round(W*0.20));
  L.globeX=Math.round(W*0.5);
  L.globeY=Math.round((H-ctrlBandH)*0.50);
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

/* ===== 交互 ===== */
function onTilt(){
  var v=+document.getElementById('rng-tilt').value;
  state.a.tilt=v;
  if(Math.abs(v)>=1&&state.a.tiltChanged===0) state.a.tiltChanged=1;
  document.getElementById('lbl-tilt').textContent=v+'°';
  updateHint(); updatePanel(); dirty=true;
}
function setSpot(id){
  if(state.scene!=='b') setScene('b');
  state.b.spot=id;
  hintOverride='小人站上'+SPOT_CN[id]+'啦：它的重力箭头指向地心——这就是'+SPOT_CN[id]+'的"下"';
  updateHint(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
}
function setScene(sn){
  if(state.scene===sn) return;
  state.scene=sn;
  syncSceneBtns();
  hintOverride=sn==='a'?'回到墙面场景：拖倾角滑杆把墙弄歪，看铅垂线跟不跟着歪':'小地球场景：点地球上（或下方按钮）选一个位置，让小人站上去';
  updateHint(); updatePanel(); dirty=true;
  if(window.GUIDE_SCENE&&window.GUIDE_SCENE.change) window.GUIDE_SCENE.change();
  if(window.playClick) playClick();
}
function syncSceneBtns(){
  var a=document.getElementById('btn-scene-a'),b=document.getElementById('btn-scene-b');
  if(a) a.classList.toggle('on',state.scene==='a');
  if(b) b.classList.toggle('on',state.scene==='b');
}
function syncSpotBtns(){
  SPOTS.forEach(function(s){
    var b=document.getElementById('btn-sp-'+s.id);
    if(b) b.classList.toggle('on',state.b.spot===s.id);
  });
}
function resetAll(){
  state.a.tilt=0; state.a.tiltChanged=0; state.b.spot=null;
  var rng=document.getElementById('rng-tilt'); if(rng) rng.value='0';
  var lbl=document.getElementById('lbl-tilt'); if(lbl) lbl.textContent='0°';
  syncSpotBtns();
  updateHint(); updatePanel(); dirty=true;
}

/* ===== 场景 A：墙面倾角 + 铅垂线恒竖直（暖白亮底） ===== */
function drawSceneA(){
  ctx.fillStyle='#f9f4cd'; ctx.fillRect(0,0,W,H);
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  var th=state.a.tilt*Math.PI/180,px=L.wallX,py=L.seat,Hw=L.wallH,w=L.wallW;
  // 墙板（绕底边中心旋转）
  ctx.save();
  ctx.translate(px,py); ctx.rotate(th);
  var gr=ctx.createLinearGradient(-w/2,0,w/2,0);
  gr.addColorStop(0,'#c8b394'); gr.addColorStop(0.5,'#dcc9ab'); gr.addColorStop(1,'#b39c7c');
  ctx.fillStyle=gr; ctx.strokeStyle='#8a7355'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.roundRect(-w/2,-Hw,w,Hw,3); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='rgba(90,70,45,.35)'; ctx.lineWidth=1;
  for(var i=1;i<6;i++){ var yy=-Hw*i/6;
    ctx.beginPath(); ctx.moveTo(-w/2+2,yy); ctx.lineTo(w/2-2,yy); ctx.stroke(); }
  ctx.restore();
  // 顶锚（旋转后世界坐标）与面前缘点
  var ax=px+Hw*Math.sin(th),ay=py-Hw*Math.cos(th);
  var fx=px+(w/2)*Math.cos(th)+ (Hw-14)*Math.sin(th);
  var fy2=py+(w/2)*Math.sin(th)-(Hw-14)*Math.cos(th);
  // 铅垂线（件内恒竖直）
  var plumbLen=Math.min(170,py-ay-40);
  var g=PROPS.plumb_line(ctx,ax,ay,{len:plumbLen});
  // 垂直墙面虚线（法向 (cosθ,sinθ)，从面前缘点向外）
  var nx=Math.cos(th),ny=Math.sin(th),nLen=Math.min(120,plumbLen*0.8);
  ctx.save();
  ctx.strokeStyle='#2563eb'; ctx.lineWidth=2; ctx.setLineDash([7,5]);
  ctx.beginPath(); ctx.moveTo(fx,fy2); ctx.lineTo(fx+nx*nLen,fy2+ny*nLen); ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#2563eb'; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
  ctx.fillText('垂直墙面的方向',fx+nx*nLen*0.55+8,fy2+ny*nLen*0.55);
  // 夹角弧（竖直向下参考线 vs 垂直墙面法向）= 90°−θ
  var arcR=Math.min(52,nLen*0.6);
  ctx.save();
  ctx.strokeStyle='rgba(100,116,139,.9)'; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(fx,fy2); ctx.lineTo(fx,fy2+nLen); ctx.stroke();   // 竖直参考线
  ctx.fillStyle='#64748b'; ctx.font='11px sans-serif'; ctx.textAlign='left';
  ctx.fillText('竖直',fx+5,fy2+nLen-4);
  ctx.strokeStyle='#b45309'; ctx.lineWidth=2;
  var a0=Math.min(th,Math.PI/2),a1=Math.max(th,Math.PI/2);
  ctx.beginPath(); ctx.arc(fx,fy2,arcR,a0,a1); ctx.stroke();
  var mid=(th+Math.PI/2)/2;
  ctx.fillStyle='#b45309'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('夹角 '+(90-state.a.tilt)+'°',fx+Math.cos(mid)*(arcR+24),fy2+Math.sin(mid)*(arcR+24)+4);
  ctx.restore();
  // 铅垂线标签
  ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  ctx.fillText('铅垂线：恒竖直向下',ax+14,ay+plumbLen*0.45);
  // 结论卡
  ghostCard(W*0.60,H*0.14,W*0.36,58);
  ctx.fillStyle='#1e293b'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  ctx.fillText('墙面倾角 '+state.a.tilt+'°，铅垂线纹丝不动：',W*0.60+14,H*0.14+24);
  ctx.fillText('重力的方向是竖直向下，不垂直于墙面',W*0.60+14,H*0.14+44);
  GEO={wall:{anchor:{x:ax,y:ay},plumbLen:plumbLen}};
}

/* ===== 场景 B：小地球（深蓝太空暗底+星星） ===== */
function drawStars(){
  for(var i=0;i<80;i++){
    var x=srand(i*1.3+0.7)*W,y=srand(i*2.9+1.3)*(H-ctrlBandH);
    var r=0.6+srand(i*5.1+2.1)*1.5,a=0.35+srand(i*7.7+3.3)*0.6;
    ctx.fillStyle='rgba(255,255,255,'+a.toFixed(2)+')';
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
}
function drawSceneB(){
  ctx.fillStyle='#0b1d3a'; ctx.fillRect(0,0,W,H);
  drawStars();
  var r=L.globeR,cx=L.globeX,cy=L.globeY;
  var g=PROPS.earth_globe(ctx,cx,cy,{r:r,spots:SPOTS.map(function(s){ return {lat:s.lat,lon:s.lon,label:s.label}; })});
  // 选中位置：小人径向站立（局部向下=指向地心）+ 红色指向地心虚线
  var sel=null;
  g.spots.forEach(function(sp,i){ if(SPOTS[i].id===state.b.spot&&sp.visible) sel=sp; });
  if(sel){
    var ang=Math.atan2(sel.y-cy,sel.x-cx);
    ctx.save();
    ctx.strokeStyle='rgba(220,38,38,.85)'; ctx.lineWidth=2; ctx.setLineDash([6,5]);
    ctx.beginPath(); ctx.moveTo(sel.x,sel.y); ctx.lineTo(cx,cy); ctx.stroke();
    ctx.restore();
    ctx.fillStyle='#f87171'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
    ctx.fillText('指向地心',(sel.x+cx)/2+16,(sel.y+cy)/2);
    ctx.save();
    ctx.translate(sel.x,sel.y); ctx.rotate(ang+Math.PI/2);
    PROPS.person_pin(ctx,0,0,{arrow:'down',h:Math.max(36,Math.round(r*0.36))});
    ctx.restore();
  }
  // 暗底说明卡（半透明深色）
  ctx.save();
  rrPath(cx-r-10,Math.max(8,cy-r-52),2*r+20,34,10);
  ctx.fillStyle='rgba(10,25,50,0.55)'; ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.30)'; ctx.lineWidth=1.2; ctx.stroke();
  ctx.fillStyle='#dbeafe'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('各地的"下"都指向地心 → 南美洲的人也站得稳稳的',cx,Math.max(8,cy-r-52)+22);
  ctx.restore();
  ctx.fillStyle='rgba(219,234,254,.85)'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
  ctx.fillText(sel?('当前：'+SPOT_CN[state.b.spot]+' —— 重力箭头竖直向下=指向地心'):'点地球上的红点，或用下方按钮选一个位置',cx,cy+r+30);
  GEO={globe:g};
}

function render(){
  if(state.scene==='a') drawSceneA();
  else drawSceneB();
}
function draw(){ ctx.clearRect(0,0,W,H); render(); updatePanel(); }

/* ===== 画布点选（场景 B：点红点选位置） ===== */
cv.addEventListener('pointerdown',function(ev){
  if(state.scene!=='b'||!GEO||!GEO.globe) return;
  var wr=cv.getBoundingClientRect();
  var mx=(ev.clientX-wr.left)*(W/wr.width),my=(ev.clientY-wr.top)*(H/wr.height);
  for(var i=0;i<GEO.globe.spots.length;i++){
    var sp=GEO.globe.spots[i];
    if(!sp.visible) continue;
    if(Math.hypot(mx-sp.x,my-sp.y)<20){ setSpot(SPOTS[i].id); syncSpotBtns(); return; }
  }
});

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
  if(state.scene==='a'){
    if(state.a.tiltChanged) return '墙歪了 '+state.a.tilt+'°，铅垂线仍然竖直——重力方向竖直向下，不垂直于墙面';
    return '拖「墙面倾角」滑杆把墙弄歪，看铅垂线跟不跟着歪';
  }
  if(state.b.spot) return '换个位置再试试：不管站在地球哪里，"下"都指向地心';
  return '点地球上的红点（或用下方按钮），让小人站上去，看它的重力箭头指哪';
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
  if(state.scene==='a')
    return [{x:0,y:H-ctrlBandH,w:W,h:ctrlBandH+40},
            {x:L.wallX-140,y:L.seat-L.wallH-30,w:300,h:L.wallH+50},
            {x:W*0.60,y:H*0.14,w:W*0.36,h:58}];
  return [{x:0,y:H-ctrlBandH,w:W,h:ctrlBandH+40},
          {x:L.globeX-L.globeR-20,y:L.globeY-L.globeR-60,w:2*L.globeR+40,h:2*L.globeR+100}];
}
function placeReadPanel(){
  var el=document.getElementById('panel-read'); if(!el) return;
  var slot=pickSlot(el.offsetWidth||240,el.offsetHeight||130,sceneAvoidRects());
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
  setText('rd-scene',state.scene==='a'?'A · 墙面与铅垂线':'B · 小地球');
  setText('rd-tilt',state.a.tilt+'°');
  setText('rd-plumb','恒竖直向下');
  setText('rd-spot',state.b.spot?SPOT_CN[state.b.spot]:'未选择');
  setText('rd-gdir',state.scene==='a'?'竖直向下（不随墙面倾斜）':(state.b.spot?'指向地心':'—'));
}

/* ===== 控制栏接线 ===== */
var ba=document.getElementById('btn-scene-a'),bb=document.getElementById('btn-scene-b');
if(ba) ba.addEventListener('click',function(){ setScene('a'); });
if(bb) bb.addEventListener('click',function(){ setScene('b'); });
var rngTilt=document.getElementById('rng-tilt');
if(rngTilt){ rngTilt.addEventListener('input',onTilt); rngTilt.addEventListener('change',onTilt); }
SPOTS.forEach(function(s){
  var b=document.getElementById('btn-sp-'+s.id);
  if(b) b.addEventListener('click',function(){ setSpot(s.id); syncSpotBtns(); });
});
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
function tick(){
  if(dirty){ dirty=false; draw(); }
  requestAnimationFrame(tick);
}
layout(); resize(); syncSceneBtns(); syncSpotBtns(); updateHint(); updatePanel(); draw();
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); placeHint(); repositionPanels(); dirty=true; }).observe(ctrlEl);
}
requestAnimationFrame(tick);
window.__c7dbg={
  get state(){ return state; }, get W(){ return W; }, get H(){ return H; }, get layout(){ return L; },
  setScene:setScene, setSpot:setSpot, reset:resetAll
};
})();

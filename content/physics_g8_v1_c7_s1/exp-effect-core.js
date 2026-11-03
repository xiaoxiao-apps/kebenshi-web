/* exp-effect-core.js — c7s1 E1 力的作用效果观察站（形变舞台/运动舞台，飞入飞出切换）
   物理语义：力使物体形变（橡皮泥塑性不复原/弹簧弹性复原）；力改变运动状态（静→动/加速/拐弯） */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var ANIM_DUR=600,TWEEN_MS=380;
var BALL_K=52000,BALL_VMAX=340,BALL_V0=110,BALL_R=13,BALL_RUN_MS=6000;   // 磁吸积分常数（教学示意，非真实磁学）
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var hintEl=document.getElementById('hint');
var W=960,H=520,DPR=1,ctrlBandH=110,COMPACT_H=600,dirty=true;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
function easeOut(t){ return 1-Math.pow(1-t,3); }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(v,n){ return (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }

/* ===== 状态（两舞台隔离；R 暴露给 guide 触发器） ===== */
var state={
  scene:'a',animating:false,anim:null,
  a:{press:0,pressPerm:0,stretch:0,stTw:null,clayReleased:false,springReleased:false},
  b:{mode:'near',released:false,done:false,running:false,armed:false,armT:0,relT:0,doneT:0,
     tried:{},triedCount:0,bx:0,by:0,vx:0,vy:0,trail:[],tLast:0,change:''}
};
window.C7S1_STATE=state;
var PLACE_CN={near:'静止旁靠近',along:'沿运动方向',side:'运动侧旁'};
var CHANGE_CN={near:'由静止变为运动',along:'速度变快（加速）',side:'运动方向拐弯'};

/* ===== 布局 ===== */
var L={};
function layout(){
  L.fy=H-ctrlBandH;
  L.by=Math.max(40,L.fy-109);
  L.seat=PROPS.seatY(L.by,64,26);
  L.a={clay:{x:Math.round(W*0.24),y:L.seat},spring:{x:Math.round(W*0.52),y:L.seat+8}};
  var tw=Math.min(600,Math.round(W*0.74)),th=Math.min(170,Math.round(H*0.36));
  L.b={table:{x:Math.round(W*0.5),y:L.fy-6,w:tw,h:th}};
}
function reflow(){ if(!state.b.running){ bResetPos(); } }
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl(); layout(); reflow(); placeHint(); repositionPanels();
  dirty=true;
}

/* ===== 绘制基础 ===== */
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
function drawArrow(x0,y0,x1,y1,color,lw){   // 通用箭头（速度矢量/力矢量共用）
  var dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy); if(d<4) return;
  var ux=dx/d,uy=dy/d,hd=Math.max(7,d*0.24);
  ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=lw||3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1-ux*hd*0.8,y1-uy*hd*0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1,y1);
  ctx.lineTo(x1-ux*hd-uy*hd*0.5,y1-uy*hd+ux*hd*0.5);
  ctx.lineTo(x1-ux*hd+uy*hd*0.5,y1-uy*hd-ux*hd*0.5);
  ctx.closePath(); ctx.fill(); ctx.restore();
}

/* ===== 舞台A：形变舞台（白桌面亮底） ===== */
function aPress(){ return Math.max(state.a.press/100,state.a.pressPerm); }
function renderA(){
  ctx.fillStyle='#fbf9f4'; ctx.fillRect(0,-H*2,W,H*5);
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  var A=state.a,now=performance.now();
  // 橡皮泥 + 手指按压 sprite 联动
  var pG=PROPS.plasticine(ctx,L.a.clay.x,L.a.clay.y,{size:Math.min(96,H*0.20),press:aPress()});
  if(aPress()>0.02) PROPS.hand_press(ctx,pG.tip.x,pG.tip.y+2,{h:Math.min(150,H*0.30)});
  ctx.fillStyle='#8a7c66'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('橡皮泥',L.a.clay.x,L.a.clay.y+22);
  // 水平弹簧（拉压滑杆）
  var sG=PROPS.spring_horizontal(ctx,L.a.spring.x,L.a.spring.y,{stretch:A.stretch,h:Math.min(80,H*0.16)});
  ctx.fillStyle='#8a7c66'; ctx.fillText('弹簧',L.a.spring.x+40,L.a.spring.y+22);
  // 松手结果注记
  if(A.clayReleased){
    ghostCard(L.a.clay.x-96,L.a.clay.y-pG.h-64,192,26);
    ctx.fillStyle='#b45309'; ctx.font='600 13px sans-serif';
    ctx.fillText('松手后：凹坑不回原样',L.a.clay.x,L.a.clay.y-pG.h-46);
  }
  if(A.springReleased){
    ghostCard(sG.ring.x-110,sG.axisY-56,220,26);
    ctx.fillStyle='#15803d'; ctx.font='600 13px sans-serif';
    ctx.fillText('松手后：弹簧回到原样',sG.ring.x,sG.axisY-38);
  }
}

/* ===== 舞台B：运动舞台（木框浅蓝桌面亮底） ===== */
function bTableTop(){ return PROPS_ball_top; }
var PROPS_ball_top=null;   // ball_track_table 返回几何缓存（render 时写入，物理用）
function magnetPos(){   // 三放法磁体位（台面内世界坐标，bar_magnet 中心）
  var t=PROPS_ball_top; if(!t) return {x:W*0.7,y:H*0.5};
  if(state.b.mode==='near') return {x:t.r-64,y:t.b-34};
  if(state.b.mode==='along') return {x:t.r-56,y:t.b-26};
  return {x:(t.l+t.r)/2+40,y:t.t+34};
}
function bResetPos(){
  var t=PROPS_ball_top,B=state.b;
  if(!t){ B.bx=W*0.3; B.by=H*0.5; return; }
  B.bx=(B.mode==='near')?t.l+56:(t.l+40);
  B.by=t.b-BALL_R-8;
  B.vx=0; B.vy=0; B.trail=[]; B.released=false; B.running=false; B.done=false; B.change='';
}
function renderB(){
  ctx.fillStyle='#eef6fc'; ctx.fillRect(0,-H*2,W,H*5);
  ctx.fillStyle='#d8cbb4'; ctx.fillRect(0,L.fy-6,W,H*3);   // 地板带
  var B=state.b;
  var tg=PROPS.ball_track_table(ctx,L.b.table.x,L.b.table.y,{w:L.b.table.w,h:L.b.table.h});
  PROPS_ball_top=tg.top;
  if(!B.running&&!B.released) bResetPos();
  var mp=magnetPos();
  // 磁体（同名端朝向球路径示意）
  PROPS.bar_magnet(ctx,mp.x,mp.y,{label:true,w:Math.min(96,L.b.table.w*0.16),angle:B.mode==='side'?90:0});
  ctx.fillStyle='#8a5a2b'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('磁体',mp.x,mp.y+(B.mode==='side'?62:30));
  // 虚线轨迹
  if(B.trail.length>1){
    ctx.save(); ctx.strokeStyle='#e0655a'; ctx.lineWidth=2; ctx.setLineDash([6,5]);
    ctx.beginPath(); ctx.moveTo(B.trail[0].x,B.trail[0].y);
    for(var i=1;i<B.trail.length;i++) ctx.lineTo(B.trail[i].x,B.trail[i].y);
    ctx.stroke(); ctx.restore();
  }
  // 小球 + 速度箭头
  PROPS.iron_ball(ctx,B.bx,B.by+BALL_R,{r:BALL_R});
  var sp=Math.hypot(B.vx,B.vy);
  if(sp>8){
    var al=clamp(sp/BALL_VMAX,0.15,1)*72;
    drawArrow(B.bx,B.by,B.bx+B.vx/sp*al,B.by+B.vy/sp*al,'#2563eb',3.4);
    ctx.fillStyle='#2563eb'; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
    ctx.fillText('v='+fmt(sp/40,1),B.bx+B.vx/sp*al+6,B.by+B.vy/sp*al);
  }
  // 现象注记
  if(B.done&&B.change){
    ghostCard(tg.top.l+8,tg.top.t+6,190,26);
    ctx.fillStyle='#b45309'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
    ctx.fillText('运动变化：'+CHANGE_CN[B.change],tg.top.l+18,tg.top.t+24);
  }
}

/* ===== 舞台B 物理推进（简化磁吸：a=K/d² 方向指向磁体，速度封顶） ===== */
function bTick(now,dtMs){
  var B=state.b;
  if(!B.running) return false;
  var t=PROPS_ball_top; if(!t){ B.running=false; return false; }
  var dt=Math.min(32,dtMs)/1000,steps=2,h=dt/steps;
  for(var s=0;s<steps;s++){
    var mp=magnetPos(),dx=mp.x-B.bx,dy=mp.y-B.by,d=Math.max(20,Math.hypot(dx,dy));
    var a=Math.min(900,BALL_K/(d*d));
    B.vx+=a*dx/d*h; B.vy+=a*dy/d*h;
    var sp=Math.hypot(B.vx,B.vy);
    if(sp>BALL_VMAX){ B.vx*=BALL_VMAX/sp; B.vy*=BALL_VMAX/sp; }
    B.bx+=B.vx*h; B.by+=B.vy*h;
  }
  // 台面边界：碰缘停
  var hitEdge=(B.bx<t.l+BALL_R||B.bx>t.r-BALL_R||B.by<t.t+BALL_R||B.by>t.b-BALL_R);
  var mp2=magnetPos(),arrived=Math.hypot(mp2.x-B.bx,mp2.y-B.by)<30;
  var last=B.trail[B.trail.length-1];
  if(!last||Math.hypot(B.bx-last.x,B.by-last.y)>7) B.trail.push({x:B.bx,y:B.by});
  if(hitEdge){ B.bx=clamp(B.bx,t.l+BALL_R,t.r-BALL_R); B.by=clamp(B.by,t.t+BALL_R,t.b-BALL_R); }
  if(arrived||hitEdge||(now-B.relT)>BALL_RUN_MS){
    B.running=false; B.done=true; B.doneT=now; B.change=B.mode;
    B.tried[B.mode]=true;
    B.triedCount=Object.keys(B.tried).length;
    if(window.playMatch) playMatch();
    updateHint(); updatePanel();
  }
  dirty=true;
  return true;
}
function bRelease(){
  var B=state.b,t=PROPS_ball_top;
  if(!t) return;
  bResetPos();
  if(B.mode==='along'||B.mode==='side'){ B.vx=BALL_V0; }   // 沿运动方向/侧旁：球先有初速度
  B.released=true; B.running=true; B.relT=performance.now();
  B.trail=[{x:B.bx,y:B.by}];
  B.armed=false;
  if(window.playClick) playClick();
  updateHint(); updatePanel(); dirty=true;
}
function bSetMode(m){
  var B=state.b;
  if(B.mode===m) return;
  B.mode=m; B.armed=true; B.armT=performance.now();
  bResetPos();
  syncPlaceBtns(); updateHint(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
}

/* ===== 舞台A 交互 ===== */
function releaseA(){
  var A=state.a,p=A.press/100;
  if(p>A.pressPerm) A.pressPerm=p;
  if(p>0.05&&!A.clayReleased){ A.clayReleased=true; if(window.playMatch) playMatch(); }
  if(Math.abs(A.stretch)>0.05){
    A.springReleased=true;
    A.stTw={t0:performance.now(),f0:A.stretch,f1:0};   // 弹簧复原动画
    if(window.playDrop) playDrop();
  }
  A.press=0;
  var el=document.getElementById('rng-press'); if(el) el.value=0;
  setText('lbl-press','0 %');
  syncABtns(); updateHint(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
}
function aTick(now){
  var A=state.a,bsy=false;
  if(A.stTw){
    var p=clamp((now-A.stTw.t0)/TWEEN_MS,0,1);
    A.stretch=A.stTw.f0+(A.stTw.f1-A.stTw.f0)*easeOut(p);
    if(p>=1){ A.stretch=0; A.stTw=null; setText('lbl-spring','0 %'); var el=document.getElementById('rng-spring'); if(el)el.value=0; }
    else bsy=true;
    dirty=true;
  }
  return bsy;
}

/* ===== 场景切换（飞入飞出，第24条①；禁「模式」用语） ===== */
var SCENES=['a','b'];
function renderScene(s){ ctx.save(); if(s==='a') renderA(); else renderB(); ctx.restore(); }
function draw(){
  ctx.clearRect(0,0,W,H);
  var a=state.anim;
  if(!a){ renderScene(state.scene); }
  else{
    var e=easeInOut(clamp((performance.now()-a.t0)/ANIM_DUR,0,1));
    ctx.save(); ctx.translate(0,-H*e); renderScene(a.from); ctx.restore();
    ctx.save(); ctx.translate(0,H*(1-e)); renderScene(a.to); ctx.restore();
  }
  updatePanel();
}
function syncGroups(){
  var s=state.scene;
  ['grp-a-press','grp-a-spring','grp-a-rel'].forEach(function(id){
    document.getElementById(id).classList.toggle('flyout',s!=='a');
  });
  ['grp-b-place','grp-b-run'].forEach(function(id){
    document.getElementById(id).classList.toggle('flyout',s!=='b');
  });
  SCENES.forEach(function(k){
    document.getElementById('sec-'+k).style.display=(s===k)?'block':'none';
    document.getElementById('btn-scene-'+k).classList.toggle('on',s===k);
  });
}
function switchScene(to){
  if(state.animating||to===state.scene) return;
  state.anim={from:state.scene,to:to,t0:performance.now()};
  state.scene=to; state.animating=true;
  window.GUIDE_SCENE&&window.GUIDE_SCENE.change();
  hideToast(); syncGroups(); placeHint(); repositionPanels(); updateHint();
  if(window.playClick) playClick();
  dirty=true;
}

/* ===== hint 橙色解说条 ===== */
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
  if(state.animating){ hintEl.style.opacity='0'; return; }
  placeHint();
  hintEl.textContent=hintOverride||hintText(); hintOverride=null;
  hintEl.style.opacity='1';
  hintTimer=setTimeout(function(){ if(hintEl&&!state.animating) hintEl.style.opacity='0'; },8000);
}
function hintText(){
  if(state.scene==='a'){
    var A=state.a;
    if(A.clayReleased&&A.springReleased) return '对比看到了：橡皮泥形变后不恢复，弹簧形变后恢复原样——弹簧这种性质下一节叫弹性';
    if(aPress()>0.02) return '按得越重凹坑越深；再拉压右边弹簧看圈距变化，然后点「松手」对比两者';
    return '拖「按压力」滑杆按橡皮泥，拖「拉压弹簧」滑杆拉伸/压缩弹簧，点「松手」看谁恢复原样';
  }
  var B=state.b;
  if(B.done) return '现象：'+CHANGE_CN[B.change]+'。换个磁体放法再释放，对比三种运动变化';
  if(B.running) return '观察虚线轨迹与速度箭头：'+CHANGE_CN[B.mode];
  return '选一种磁体放法（静止旁靠近/沿运动方向/运动侧旁），点「释放」看小铁球的运动怎么被力改变';
}
var toastT=null;
function toast(msg){
  var t=document.getElementById('c7toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('show'); },2600);
}
function hideToast(){ var t=document.getElementById('c7toast'); if(t) t.classList.remove('show'); }

/* ===== 读数面板（幽灵化+pickSlot 选空位） ===== */
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
  var rs=[{x:0,y:H-ctrlBandH,w:W,h:ctrlBandH+40}];
  if(state.scene==='a'){
    rs.push({x:L.a.clay.x-110,y:L.a.clay.y-H*0.34,w:220,h:H*0.34+30});
    rs.push({x:L.a.spring.x-60,y:L.a.spring.y-120,w:280,h:150});
  }else{
    var t=L.b.table;
    rs.push({x:t.x-t.w/2-8,y:t.y-t.h-8,w:t.w+16,h:t.h+16});
  }
  return rs;
}
function placeReadPanel(){
  var el=document.getElementById('panel-read'); if(!el) return;
  var slot=pickSlot(el.offsetWidth||260,el.offsetHeight||150,sceneAvoidRects());
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
  if(state.scene==='a'){
    var A=state.a;
    setText('rd-press',fmt(aPress()*100,0)+' %');
    setText('rd-dent',aPress()>0.02?('凹陷 '+fmt(aPress()*100,0)+' %'+(A.clayReleased?'（松手不回原样）':'')):'—');
    setText('rd-stretch',Math.abs(A.stretch)>0.02?((A.stretch>0?'伸长 ':'压缩 ')+fmt(Math.abs(A.stretch)*100,0)+' %'):(A.springReleased?'已恢复原长':'原长'));
    setText('rd-after',(A.clayReleased?'橡皮泥：不恢复 ':'')+(A.springReleased?'弹簧：恢复':'—'));
  }else{
    var B=state.b;
    setText('rd-place',PLACE_CN[B.mode]);
    setText('rd-vel',B.released?('v = '+fmt(Math.hypot(B.vx,B.vy)/40,1)+' 单位'):'0（静止待发）');
    setText('rd-change',B.done?CHANGE_CN[B.change]:(B.running?'进行中…':'—'));
  }
}

/* ===== 控制栏接线 ===== */
function syncPlaceBtns(){
  ['near','along','side'].forEach(function(m){
    var el=document.getElementById('btn-place-'+m);
    if(el) el.classList.toggle('on',state.b.mode===m);
  });
}
function syncABtns(){
  var el=document.getElementById('rng-press'); if(el) el.value=state.a.press;
}
var rngPress=document.getElementById('rng-press'),rngSpring=document.getElementById('rng-spring');
if(rngPress) rngPress.addEventListener('input',function(){
  if(state.animating) return;
  state.a.press=parseFloat(rngPress.value);
  setText('lbl-press',state.a.press+' %');
  updatePanel(); dirty=true;
});
if(rngSpring) rngSpring.addEventListener('input',function(){
  if(state.animating) return;
  state.a.stretch=parseFloat(rngSpring.value)/100;
  state.a.stTw=null;
  setText('lbl-spring',rngSpring.value+' %');
  updatePanel(); dirty=true;
});
var btnRelA=document.getElementById('btn-release-a');
if(btnRelA) btnRelA.addEventListener('click',function(){ if(state.animating)return; releaseA(); });
['near','along','side'].forEach(function(m){
  var el=document.getElementById('btn-place-'+m);
  if(el) el.addEventListener('click',function(){ if(state.animating)return; bSetMode(m); });
});
var btnRelB=document.getElementById('btn-release-b');
if(btnRelB) btnRelB.addEventListener('click',function(){ if(state.animating)return; bRelease(); });
var btnResetB=document.getElementById('btn-reset-b');
if(btnResetB) btnResetB.addEventListener('click',function(){ if(state.animating)return; bResetPos(); updateHint(); updatePanel(); dirty=true; if(window.playClick)playClick(); });
SCENES.forEach(function(k){
  var el=document.getElementById('btn-scene-'+k);
  if(el) el.addEventListener('click',function(){ switchScene(k); });
});
var btnTable=document.getElementById('btn-table');
if(btnTable) btnTable.addEventListener('click',function(){ if(state.animating)return; openPanel(); if(window.playClick)playClick(); });
var btnReset=document.getElementById('btn-reset');
if(btnReset) btnReset.addEventListener('click',function(){
  if(state.animating) return;
  if(state.scene==='a'){
    var A=state.a;
    A.press=0; A.pressPerm=0; A.stretch=0; A.stTw=null; A.clayReleased=false; A.springReleased=false;
    if(rngPress)rngPress.value=0; if(rngSpring)rngSpring.value=0;
    setText('lbl-press','0 %'); setText('lbl-spring','0 %');
  }else{
    state.b.tried={}; state.b.triedCount=0; state.b.armed=false;
    bResetPos(); syncPlaceBtns();
  }
  hideToast(); updateHint(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
  window.GUIDE_RESET&&window.GUIDE_RESET.all();
});
var btnMute=document.getElementById('btn-mute');
if(btnMute) btnMute.addEventListener('click',function(){ window.muted=!window.muted; btnMute.textContent=window.muted?'🔇':'🔊'; if(window.playClick)playClick(); });
/* 全屏（documentElement + html.pseudo-fs 降级，c5s1 路线） */
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
if(btnFull) btnFull.addEventListener('click',function(){if(state.animating)return;if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();if(window.playClick)playClick();});
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(ev){document.addEventListener(ev,function(){syncFull();setTimeout(resize,60);});});

/* ===== 动画 tick ===== */
var lastNow=0;
function busy(){
  var now=performance.now(),dt=lastNow?now-lastNow:16; lastNow=now;
  if(state.animating){
    if(now-state.anim.t0>=ANIM_DUR){ state.animating=false; state.anim=null; updateHint(); }
    return true;
  }
  var b=false;
  if(state.scene==='a'&&aTick(now)) b=true;
  if(state.scene==='b'&&bTick(now,dt)) b=true;
  return b;
}
function tick(){
  if(busy()||dirty){ dirty=false; draw(); }
  requestAnimationFrame(tick);
}

/* ===== init ===== */
layout(); resize();
renderScene('b');   // 预热一帧拿台面几何（bResetPos 依赖 PROPS_ball_top）
renderScene(state.scene);
bResetPos();
syncGroups(); syncPlaceBtns(); syncABtns(); updateHint(); updatePanel(); draw();
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); reflow(); placeHint(); repositionPanels(); dirty=true; }).observe(ctrlEl);
}
requestAnimationFrame(tick);
/* 调试通道（验收直读模型） */
window.__c7dbg={
  get state(){ return state; }, get W(){ return W; }, get H(){ return H; }, get layout(){ return L; },
  scene:function(to){ switchScene(to); },
  pickSlotProbe:function(){ var el=document.getElementById('panel-read');
    return {slot:pickSlot(el.offsetWidth||260,el.offsetHeight||150,sceneAvoidRects()),avoid:sceneAvoidRects()}; }
};
})();

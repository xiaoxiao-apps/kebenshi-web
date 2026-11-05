/* exp-workshop-core.js — c7s1「力的探究工坊」（C7V2-D2a：旧 E1/E2/E3 三页合一，飞入飞出切换）
   场景① 效果舞台：一张工作台双角区——左角形变区（橡皮泥按压+水平弹簧拉压并排，松手对比恢复/不恢复）
                    右角运动区（小铁球+条形磁体三放法：由静到动/加速/拐弯，虚线轨迹+速度箭头）
   场景② 推门工坊：门+三滑杆（作用点/方向/大小）+力的示意图箭头实时联动；子板「你来画」四步判分（起点/方向/长度/标注）
   场景③ 相互舞台：第一步磁车对弹（定性）；第二步两只弹簧测力计串联对拉（定量：两读数始终相等、方向箭头相反）
   物理语义：力使物体形变；力改变物体的运动状态；力的三要素与示意图规范；物体间力的作用是相互的
   蔡总第4条：本页无橙色提示条（无任何提示条 DOM 与 CSS），文字提示全部走 guide 字幕条 */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var ANIM_DUR=600,TWEEN_MS=380;
var BALL_K=52000,BALL_VMAX=340,BALL_V0=110,BALL_R=13,BALL_RUN_MS=6000;   // 磁吸积分常数（教学示意，非真实磁学）
var REP_K=900000,CART_VMAX=420,FRICTION=0.35,STOP_V=6;                   // 磁车斥力积分常数（教学示意）
var PUSH_K=0.16,TAU_MIN=0.28;                                            // 开门角速度增益 / 最小有效力矩
var PULL_TMAX=5,PULL_TCOUNT=2.0,RELAX_MS=420;                            // 对拉：满量程 5N / 计入一次「拉过」的峰值门槛
var DRAW_TOL_DEG=12,DRAW_DRAG_MIN=10;                                    // 你来画：竖直向上容差 / 拖动判定阈值
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var W=960,H=520,DPR=1,ctrlBandH=110,COMPACT_H=600,dirty=true;

function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
function easeOut(t){ return 1-Math.pow(1-t,3); }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(v,n){ return (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }
function setText(id,t){ var el=document.getElementById(id); if(el&&el.textContent!==t) el.textContent=t; }
function inRect(p,r){ return p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h; }

/* ===== 状态（R 暴露给 guide 触发器；mode 由引擎每帧轮询） ===== */
var state={
  mode:'effect',      /* 引擎轮询：effect / elements / mutual */
  board:'door',       /* elements 子板：door 推门 / draw 你来画 */
  cstep:1,            /* mutual 子步：1 磁车对弹 / 2 测力计对拉 */
  view:'effect',      /* 渲染视图 key：effect / door / draw / cart / pull */
  animating:false,anim:null,
  a:{press:0,pressPerm:0,stretch:0,stTw:null,clayReleased:false,springReleased:false},
  b:{mode:'near',released:false,done:false,running:false,armed:false,armT:0,relT:0,doneT:0,
     tried:{},triedCount:0,bx:0,by:0,vx:0,vy:0,trail:[],change:''},
  e:{pointMark:0.75,angle:0,F:5,pushing:false,open:0,openTw:null,omega:0,eff:0,
     nearTried:false,farTried:false,parTried:false,bigTried:false,
     successCount:0,pushStartOpen:0,pushT:0},
  d:{start:null,dirAngle:null,dirLocked:false,dragging:false,liveLen:null,lastDist:0,
     lenN:0,label:'',judged:false,wrongCount:0,items:null,tries:0},
  m:{released:false,running:false,settled:false,relT:0,lx:0,rx:0,lv:0,rv:0,gap0:120},
  p:{g:0,T:0,maxT:0,pulls:0,peakT:0,drag:null,dragX0:0,dragG0:0,relaxTw:null,pulled:false}
};
window.C7S1_STATE=state;
var PLACE_CN={near:'静止旁靠近',along:'沿运动方向',side:'运动侧旁'};
var CHANGE_CN={near:'由静止变为运动',along:'速度变快（加速）',side:'运动方向拐弯'};
var LABELS=[{k:'F=4N',t:'F=4N'},{k:'4N',t:'4N'},{k:'F',t:'F'}];

function viewOf(){
  if(state.mode==='effect') return 'effect';
  if(state.mode==='elements') return state.board==='draw'?'draw':'door';
  return state.cstep===2?'pull':'cart';
}

/* ===== 布局 ===== */
var L={};
function layout(){
  L.fy=H-ctrlBandH;
  L.by=Math.max(40,L.fy-109);
  L.seat=PROPS.seatY(L.by,64,26);
  layoutEffect(); layoutDoor(); layoutDraw(); layoutCart(); layoutPull();
}
function layoutEffect(){
  var tw=clamp(Math.round(W*0.50),300,640);
  var th=clamp(Math.round(Math.min(L.by-46,H*0.34)),110,200);
  var tx=Math.round(W-20-tw/2),ty=Math.round(L.by+52);
  var zL=18,zR=Math.max(zL+140,Math.round(tx-tw/2-22)),zW=zR-zL;
  var s=clamp(Math.round(zW*0.26),44,92);
  var clayX=Math.round(zL+Math.max(s*0.74,zW*0.20));
  var springX=Math.round(zL+zW*0.55);
  var len=clamp(Math.round((zR-springX-30)/1.6),44,150);
  L.ef={tw:tw,th:th,tx:tx,ty:ty,zL:zL,zR:zR,zW:zW,divX:Math.round((zR+(tx-tw/2))/2),
        clay:{x:clayX,y:L.seat,size:s},
        spring:{x:springX,y:L.seat+8,len:len,h:clamp(Math.round(H*0.13),42,74)},
        ballTop:null};
}
function layoutDoor(){
  L.door={x:Math.round(W*0.36),y:L.fy-14,w:Math.min(170,Math.round(H*0.34)),h:Math.min(250,Math.round(H*0.52))};
  L.dial={x:Math.round(W*0.72),y:Math.round(H*0.30),r:Math.min(74,Math.round(H*0.16))};
}
function layoutDraw(){
  var top=44,avail=Math.max(180,L.fy-top);
  var lampW=clamp(Math.round(W*0.16),90,170);
  var cx=Math.round(W*0.56);
  var ceilY=Math.round(top+avail*0.06);
  var shadeTop=ceilY+Math.round(avail*0.28);
  var shadeH=Math.round(lampW*0.40),bulbR=Math.round(lampW*0.14);
  var unit=clamp(Math.round(avail*0.075),14,30);
  var lamp={x:Math.round(cx-lampW/2),y:shadeTop,w:lampW,h:shadeH+bulbR*2+6};
  var rulerX=Math.max(28,Math.round(lamp.x-78));
  var rulerB=Math.min(Math.round(L.fy-18),lamp.y+lamp.h+Math.round(avail*0.16));
  L.dr={top:top,avail:avail,cx:cx,ceilY:ceilY,shadeTop:shadeTop,shadeH:shadeH,bulbR:bulbR,
        lampW:lampW,unit:unit,lamp:lamp,rulerX:rulerX,rulerB:rulerB,rulerT:rulerB-unit*4};
}
function layoutCart(){
  L.floorY=L.fy-16;
  L.cartW=Math.min(150,Math.round(W*0.16));
  state.m.gap0=Math.round(L.cartW*1.05);
  homeCarts();
}
function layoutPull(){
  var mh=clamp(Math.round(Math.min(W*0.22,(L.fy-96)*0.54)),110,190);
  L.pu={h:mh,cy:Math.round(34+(L.fy-34)*0.52),cx:Math.round(W/2),
        gMax:clamp(Math.round(W*0.10),56,120),bw:mh*0.21,cardY:40};
}
function homeCarts(){
  var M=state.m;
  M.lx=Math.round(W/2-M.gap0/2-L.cartW*0.05);
  M.rx=Math.round(W/2+M.gap0/2+L.cartW*0.05);
  M.lv=0; M.rv=0;
}
function resetBall(){
  var t=L.ef&&L.ef.ballTop,B=state.b;
  if(!t){ B.bx=W*0.62; B.by=H*0.5; return; }
  B.bx=t.l+((B.mode==='near')?56:40);
  B.by=t.b-BALL_R-8;
  B.vx=0; B.vy=0; B.trail=[]; B.released=false; B.running=false; B.done=false; B.change='';
}
function reflow(){ if(state.mode==='effect'&&!state.b.running) resetBall(); }
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl(); layout(); reflow(); repositionPanels();
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
function drawArrow(x0,y0,x1,y1,color,lw){
  var dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy); if(d<4) return;
  var ux=dx/d,uy=dy/d,hd=Math.max(7,d*0.24);
  ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=lw||3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1-ux*hd*0.8,y1-uy*hd*0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1,y1);
  ctx.lineTo(x1-ux*hd-uy*hd*0.5,y1-uy*hd+ux*hd*0.5);
  ctx.lineTo(x1-ux*hd+uy*hd*0.5,y1-uy*hd-ux*hd*0.5);
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function mark(ok,x,y,r){   /* 判分 ✓/✗（画布内联标记，非提示条） */
  ctx.save(); ctx.lineWidth=Math.max(2.4,r*0.30); ctx.lineCap='round';
  ctx.strokeStyle=ok?'#15803d':'#dc2626';
  if(ok){ ctx.beginPath(); ctx.moveTo(x-r*0.55,y); ctx.lineTo(x-r*0.12,y+r*0.48); ctx.lineTo(x+r*0.62,y-r*0.46); ctx.stroke(); }
  else{ ctx.beginPath(); ctx.moveTo(x-r*0.5,y-r*0.5); ctx.lineTo(x+r*0.5,y+r*0.5);
        ctx.moveTo(x+r*0.5,y-r*0.5); ctx.lineTo(x-r*0.5,y+r*0.5); ctx.stroke(); }
  ctx.restore();
}

/* ============================================================ 场景① 效果舞台 */
function aPress(){ return Math.max(state.a.press/100,state.a.pressPerm); }
function magnetPos(){
  var t=L.ef.ballTop; if(!t) return {x:W*0.8,y:H*0.5};
  if(state.b.mode==='near') return {x:t.r-64,y:t.b-34};
  if(state.b.mode==='along') return {x:t.r-56,y:t.b-26};
  return {x:(t.l+t.r)/2+40,y:t.t+34};
}
function renderEffect(){
  var E=L.ef,A=state.a,B=state.b;
  ctx.fillStyle='#fbf9f4'; ctx.fillRect(0,-H*2,W,H*5);
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  /* 双角区分隔（虚线）+ 区名 */
  ctx.save(); ctx.strokeStyle='rgba(120,110,90,.30)'; ctx.lineWidth=1.4; ctx.setLineDash([6,6]);
  ctx.beginPath(); ctx.moveTo(E.divX,L.by-8); ctx.lineTo(E.divX,Math.max(46,L.by-E.th-40)); ctx.stroke();
  ctx.restore();
  ctx.textAlign='center'; ctx.font='600 14px sans-serif';
  ctx.fillStyle='#8a7c66'; ctx.fillText('① 形变区',(E.zL+E.zR)/2,Math.max(40,L.by-E.th-52));
  ctx.fillStyle='#5b7a94'; ctx.fillText('② 运动区',E.tx,Math.max(40,E.ty-E.th-16));

  /* --- 左角：橡皮泥（按压力滑杆→凹痕实时） --- */
  var pG=PROPS.plasticine(ctx,E.clay.x,E.clay.y,{size:E.clay.size,press:aPress()});
  if(aPress()>0.02) PROPS.hand_press(ctx,pG.tip.x,pG.tip.y+2,{h:Math.min(150,H*0.30)});
  ctx.fillStyle='#8a7c66'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('橡皮泥',E.clay.x,E.clay.y+22);
  /* --- 左角：水平弹簧（拉压滑杆→长度实时） --- */
  var sG=PROPS.spring_horizontal(ctx,E.spring.x,E.spring.y,{stretch:A.stretch,len:E.spring.len,h:E.spring.h});
  ctx.fillStyle='#8a7c66'; ctx.fillText('弹簧',E.spring.x+E.spring.len*0.5,E.spring.y+22);
  /* 松手对比注记（并排一目了然，埋第2节弹力伏笔） */
  if(A.clayReleased){
    ghostCard(E.clay.x-104,E.clay.y-pG.h-70,208,26);
    ctx.fillStyle='#b45309'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('松手后：凹坑不回原样',E.clay.x,E.clay.y-pG.h-52);
  }
  if(A.springReleased){
    ghostCard(sG.ring.x-118,sG.axisY-60,236,26);
    ctx.fillStyle='#15803d'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('松手后：弹簧回到原样',sG.ring.x,sG.axisY-42);
  }

  /* --- 右角：木框浅蓝桌面（教材图7.1-4 同色系）+ 小铁球 + 条形磁体 --- */
  var tg=PROPS.ball_track_table(ctx,E.tx,E.ty,{w:E.tw,h:E.th});
  L.ef.ballTop=tg.top;
  var t=tg.top;
  if(!B.running&&!B.released) resetBall();
  var mp=magnetPos();
  PROPS.bar_magnet(ctx,mp.x,mp.y,{label:true,w:Math.min(96,E.tw*0.18),angle:B.mode==='side'?90:0});
  ctx.fillStyle='#8a5a2b'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('磁体',mp.x,mp.y+(B.mode==='side'?62:30));
  if(B.trail.length>1){
    ctx.save(); ctx.strokeStyle='#e0655a'; ctx.lineWidth=2; ctx.setLineDash([6,5]);
    ctx.beginPath(); ctx.moveTo(B.trail[0].x,B.trail[0].y);
    for(var i=1;i<B.trail.length;i++) ctx.lineTo(B.trail[i].x,B.trail[i].y);
    ctx.stroke(); ctx.restore();
  }
  PROPS.iron_ball(ctx,B.bx,B.by+BALL_R,{r:BALL_R});
  var sp=Math.hypot(B.vx,B.vy);
  if(sp>8){
    var al=clamp(sp/BALL_VMAX,0.15,1)*72;
    drawArrow(B.bx,B.by,B.bx+B.vx/sp*al,B.by+B.vy/sp*al,'#2563eb',3.4);
    ctx.fillStyle='#2563eb'; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
    ctx.fillText('v='+fmt(sp/40,1),B.bx+B.vx/sp*al+6,B.by+B.vy/sp*al);
  }
  if(B.done&&B.change){
    ghostCard(t.l+8,t.t+6,206,26);
    ctx.fillStyle='#b45309'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
    ctx.fillText('运动变化：'+CHANGE_CN[B.change],t.l+18,t.t+24);
  }
}
function ballTick(now,dtMs){
  var B=state.b,t=L.ef.ballTop;
  if(!B.running||!t) return false;
  var dt=Math.min(32,dtMs)/1000,steps=2,h=dt/steps;
  for(var s=0;s<steps;s++){
    var mp=magnetPos(),dx=mp.x-B.bx,dy=mp.y-B.by,d=Math.max(20,Math.hypot(dx,dy));
    var a=Math.min(900,BALL_K/(d*d));
    B.vx+=a*dx/d*h; B.vy+=a*dy/d*h;
    var sp=Math.hypot(B.vx,B.vy);
    if(sp>BALL_VMAX){ B.vx*=BALL_VMAX/sp; B.vy*=BALL_VMAX/sp; }
    B.bx+=B.vx*h; B.by+=B.vy*h;
  }
  var hitEdge=(B.bx<t.l+BALL_R||B.bx>t.r-BALL_R||B.by<t.t+BALL_R||B.by>t.b-BALL_R);
  var mp2=magnetPos(),arrived=Math.hypot(mp2.x-B.bx,mp2.y-B.by)<30;
  var last=B.trail[B.trail.length-1];
  if(!last||Math.hypot(B.bx-last.x,B.by-last.y)>7) B.trail.push({x:B.bx,y:B.by});
  if(hitEdge){ B.bx=clamp(B.bx,t.l+BALL_R,t.r-BALL_R); B.by=clamp(B.by,t.t+BALL_R,t.b-BALL_R); }
  if(arrived||hitEdge||(now-B.relT)>BALL_RUN_MS){
    B.running=false; B.done=true; B.doneT=now; B.change=B.mode;
    B.tried[B.mode]=true; B.triedCount=Object.keys(B.tried).length;
    if(window.playMatch) playMatch();
    updatePanel();
  }
  dirty=true;
  return true;
}
function ballRelease(){
  var B=state.b;
  if(!L.ef.ballTop) return;
  resetBall();
  if(B.mode==='along'||B.mode==='side') B.vx=BALL_V0;   // 沿运动方向/侧旁：球先有初速度
  B.released=true; B.running=true; B.relT=performance.now();
  B.trail=[{x:B.bx,y:B.by}]; B.armed=false;
  if(window.playClick) playClick();
  updatePanel(); dirty=true;
}
function ballSetMode(m){
  var B=state.b;
  if(B.mode===m) return;
  B.mode=m; B.armed=true; B.armT=performance.now();
  resetBall(); syncPlaceBtns(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
}
function releaseA(){
  var A=state.a,p=A.press/100;
  if(p>A.pressPerm) A.pressPerm=p;
  if(p>0.05&&!A.clayReleased){ A.clayReleased=true; if(window.playMatch) playMatch(); }
  if(Math.abs(A.stretch)>0.05){
    A.springReleased=true;
    A.stTw={t0:performance.now(),f0:A.stretch,f1:0};   // 弹簧复原动画（弹性体撤力回原状）
    if(window.playDrop) playDrop();
  }
  A.press=0;
  var el=document.getElementById('rng-press'); if(el) el.value=0;
  setText('lbl-press','0 %');
  updatePanel(); dirty=true;
  if(window.playClick) playClick();
}
function aTick(now){
  var A=state.a,bsy=false;
  if(A.stTw){
    var p=clamp((now-A.stTw.t0)/TWEEN_MS,0,1);
    A.stretch=A.stTw.f0+(A.stTw.f1-A.stTw.f0)*easeOut(p);
    if(p>=1){ A.stretch=0; A.stTw=null; setText('lbl-spring','0 %');
      var el=document.getElementById('rng-spring'); if(el) el.value=0; }
    else bsy=true;
    dirty=true;
  }
  return bsy;
}

/* ============================================================ 场景② 推门工坊（子板 door） */
function torque(){ var E=state.e; return E.F*Math.cos(E.angle*Math.PI/180)*E.pointMark; }
function effText(t){
  if(t<TAU_MIN) return '爱动不动';
  if(t<1.6) return '慢';
  if(t<4) return '中等';
  return '快';
}
function doorTick(now,dtMs){
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
  }else if(E.omega!==0){ E.omega=0; dirty=true; }
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
  updatePanel(); dirty=true;
}
function closeDoor(){
  var E=state.e;
  if(E.pushing) pushToggle();
  E.openTw={t0:performance.now(),f0:E.open,f1:0};
  if(window.playClick) playClick();
  dirty=true;
}
function renderDoor(){
  var E=state.e;
  ctx.fillStyle='#faf6ee'; ctx.fillRect(0,-H*2,W,H*5);
  ctx.fillStyle='#eee5d3'; ctx.fillRect(0,L.fy-14,W,H*3);
  ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,L.fy-14); ctx.lineTo(W,L.fy-14); ctx.stroke();
  var dg=PROPS.door(ctx,L.door.x,L.door.y,{w:L.door.w,h:L.door.h,open:E.open,pointMark:E.pointMark});
  /* 力的示意图箭头：起点=作用点、方向=角度、长∝大小（三滑杆联动实时重画） */
  var aLen=18+E.F*13,rad=E.angle*Math.PI/180;
  var ax=dg.point.x+aLen*Math.cos(rad),ay=dg.point.y-aLen*Math.sin(rad);
  drawArrow(dg.point.x,dg.point.y,ax,ay,'#e03131',4.5);
  ctx.fillStyle='#e03131'; ctx.font='bold 14px sans-serif'; ctx.textAlign='left';
  ctx.fillText('F='+fmt(E.F,1)+'N',ax+8,ay+4);
  /* 方向角度盘（0°=垂直门面最管用） */
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
  /* 转动快慢反馈牌 */
  var eff=E.eff,txt=(E.pushing&&eff>=TAU_MIN)?('门转动：'+effText(eff)):(E.open>=1?'门已开到底':'未在推门');
  ghostCard(dg.hinge.x-10,L.door.y-L.door.h-40,196,28);
  ctx.fillStyle=E.pushing?'#b45309':'#64748b'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  ctx.fillText(txt,dg.hinge.x,L.door.y-L.door.h-21);
  /* 力臂虚线（作用点离轴距离） */
  ctx.save(); ctx.strokeStyle='rgba(100,116,139,.7)'; ctx.lineWidth=1.4; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(dg.hinge.x,dg.hinge.y); ctx.lineTo(dg.point.x,dg.point.y); ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#475569'; ctx.font='12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('力臂（作用点离轴 '+Math.round(E.pointMark*100)+'%）',(dg.hinge.x+dg.point.x)/2,dg.hinge.y+18);
  ctx.fillText('门轴（合页）',dg.hinge.x,dg.hinge.y-L.door.h*0.30);
}

/* ============================================================ 场景② 子板「你来画」（四步判分） */
function drawBoardReset(){
  var D=state.d;
  D.start=null; D.dirAngle=null; D.dirLocked=false; D.dragging=false; D.liveLen=null; D.lastDist=0;
  D.lenN=0; D.label=''; D.judged=false; D.wrongCount=0; D.items=null;
  syncDrawBtns(); updatePanel(); dirty=true;
}
function drawArrowLen(){ return (state.d.lenN||2)*L.dr.unit; }
function drawJudge(){
  var D=state.d,lm=L.dr.lamp;
  var it={};
  it.start=!!(D.start&&D.start.x>=lm.x-6&&D.start.x<=lm.x+lm.w+6&&
              D.start.y>=lm.y-6&&D.start.y<=lm.y+lm.h+6);
  it.dir=(D.dirLocked&&D.dirAngle!=null&&Math.abs(D.dirAngle-90)<=DRAW_TOL_DEG);
  it.len=(D.lenN===4);
  it.label=(D.label==='F=4N');
  D.items=it;
  D.wrongCount=(it.start?0:1)+(it.dir?0:1)+(it.len?0:1)+(it.label?0:1);
  D.judged=true; D.tries++;
  if(D.wrongCount===0&&window.playMatch) playMatch();
  else if(window.playDrop) playDrop();
  updatePanel(); dirty=true;
}
function renderDraw(){
  var D=state.d,R0=L.dr;
  ctx.fillStyle='#fbf9f4'; ctx.fillRect(0,-H*2,W,H*5);
  /* 情境卡（题目给定条件） */
  ghostCard(16,R0.top-10,Math.min(430,W*0.62),52);
  ctx.fillStyle='#334155'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  ctx.fillText('情境：绳吊着的吊灯静止不动，',30,R0.top+10);
  ctx.fillText('绳对灯的拉力 F = 4 N，方向竖直向上。画出这个力。',30,R0.top+30);
  /* 天花板（斜纹）+ 吊绳 */
  ctx.fillStyle='#d8cbb4'; ctx.fillRect(0,R0.ceilY-26,W,26);
  ctx.save(); ctx.strokeStyle='rgba(120,100,70,.45)'; ctx.lineWidth=1.4;
  ctx.beginPath();
  for(var hx=-30;hx<W;hx+=18){ ctx.moveTo(hx,R0.ceilY-26); ctx.lineTo(hx+26,R0.ceilY); }
  ctx.stroke(); ctx.restore();
  ctx.strokeStyle='#8a7c66'; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(R0.cx,R0.ceilY); ctx.lineTo(R0.cx,R0.shadeTop); ctx.stroke();
  /* 吊灯（灯罩+灯泡，受力物体） */
  var lp=R0.lamp,hw=R0.lampW/2;
  ctx.save();
  var gl=ctx.createLinearGradient(0,R0.shadeTop,0,R0.shadeTop+R0.shadeH);
  gl.addColorStop(0,'#f0d9a8'); gl.addColorStop(1,'#c9a86a');
  ctx.fillStyle=gl; ctx.strokeStyle='#8a6a45'; ctx.lineWidth=1.6;
  ctx.beginPath();
  ctx.moveTo(R0.cx-hw*0.56,R0.shadeTop);
  ctx.lineTo(R0.cx+hw*0.56,R0.shadeTop);
  ctx.lineTo(R0.cx+hw,R0.shadeTop+R0.shadeH);
  ctx.lineTo(R0.cx-hw,R0.shadeTop+R0.shadeH);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  var by=R0.shadeTop+R0.shadeH;
  var bg=ctx.createRadialGradient(R0.cx,by+R0.bulbR*0.7,1,R0.cx,by+R0.bulbR*0.7,R0.bulbR*1.5);
  bg.addColorStop(0,'#fff8dc'); bg.addColorStop(1,'#f2c14e');
  ctx.fillStyle=bg;
  ctx.beginPath(); ctx.arc(R0.cx,by+R0.bulbR*0.8,R0.bulbR,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#c99a2e'; ctx.lineWidth=1.3; ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#8a7c66'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('吊灯（受力物体）',R0.cx,lp.y+lp.h+22);
  /* 起点待定时：灯的虚线框提示落点范围 */
  if(!D.start){
    ctx.save(); ctx.strokeStyle='rgba(37,99,235,.55)'; ctx.lineWidth=1.6; ctx.setLineDash([6,5]);
    rrPath(lp.x-6,lp.y-6,lp.w+12,lp.h+12,10); ctx.stroke(); ctx.restore();
  }
  /* 单位标尺（每格 = 1 N） */
  ctx.save();
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(R0.rulerX,R0.rulerT); ctx.lineTo(R0.rulerX,R0.rulerB); ctx.stroke();
  ctx.font='11px sans-serif'; ctx.fillStyle='#64748b'; ctx.textAlign='left';
  for(var u=0;u<=4;u++){
    var uy=R0.rulerB-u*R0.unit;
    ctx.beginPath(); ctx.moveTo(R0.rulerX-7,uy); ctx.lineTo(R0.rulerX+7,uy); ctx.stroke();
    if(u>0) ctx.fillText(u+' N',R0.rulerX+11,uy+4);
  }
  ctx.fillText('每格 = 1 N',R0.rulerX-7,R0.rulerB+18);
  ctx.restore();
  /* 学生作答的力箭头（起点/方向/长度/标注四要素实时联动） */
  if(D.start){
    var ang=(D.dirAngle==null?90:D.dirAngle)*Math.PI/180;
    var len=(D.dragging&&D.liveLen!=null)?D.liveLen:drawArrowLen();
    var ex=D.start.x+len*Math.cos(ang),ey=D.start.y-len*Math.sin(ang);
    drawArrow(D.start.x,D.start.y,ex,ey,D.judged&&!D.items.dir?'#dc2626':'#e03131',4.5);
    ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.arc(D.start.x,D.start.y,4.5,0,Math.PI*2); ctx.fill();
    if(D.label){
      ctx.fillStyle='#e03131'; ctx.font='bold 14px sans-serif'; ctx.textAlign='left';
      ctx.fillText(D.label,ex+10,ey+4);
    }
  }
  /* 四步进度（画布内 UI 状态牌） */
  var steps=[
    {t:'① 起点',ok:!!D.start},
    {t:'② 方向',ok:D.dirLocked},
    {t:'③ 长度',ok:D.lenN>0},
    {t:'④ 标注',ok:!!D.label}
  ];
  var sx=16,sy=L.fy-40;
  ghostCard(sx-4,sy-18,392,30);
  ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  var ox=sx+8;
  for(var i=0;i<steps.length;i++){
    ctx.fillStyle=steps[i].ok?'#15803d':'#94a3b8';
    ctx.fillText(steps[i].t+(steps[i].ok?' ✓':' …'),ox,sy+2);
    ox+=96;
  }
  /* 判分结果：逐项 ✓/✗ + 错项点破 */
  if(D.judged&&D.items){
    var rows=[
      {k:'start',n:'起点',ok:D.items.start,bad:'起点要画在受力物体（灯）上'},
      {k:'dir',n:'方向',ok:D.items.dir,bad:'方向要沿力竖直向上'},
      {k:'len',n:'长度',ok:D.items.len,bad:'4 N 对应 4 格'},
      {k:'label',n:'标注',ok:D.items.label,bad:'标注要写 F=4N（力+数值+单位）'}
    ];
    var bads=rows.filter(function(r){return !r.ok;});
    var cw=Math.min(430,W-40),ch=40+bads.length*20;
    var cx0=Math.max(16,W-cw-18),cy0=R0.top-10;
    ghostCard(cx0,cy0,cw,ch);
    ctx.textAlign='left'; ctx.font='600 14px sans-serif';
    ctx.fillStyle=D.wrongCount?'#b91c1c':'#15803d';
    ctx.fillText(D.wrongCount?('判分：4 项中 '+D.wrongCount+' 项要改'):('判分：四项全对 ✓'),cx0+14,cy0+22);
    for(var j=0;j<bads.length;j++){
      ctx.fillStyle='#7f1d1d'; ctx.font='13px sans-serif';
      ctx.fillText('✗ '+bads[j].n+'：'+bads[j].bad,cx0+14,cy0+42+j*20);
    }
    /* 图上就地标记 */
    if(D.start) mark(D.items.start,D.start.x-16,D.start.y+2,9);
    if(D.dirLocked&&D.start){
      var a2=(D.dirAngle||0)*Math.PI/180,l2=drawArrowLen()*0.55;
      mark(D.items.dir,D.start.x+l2*Math.cos(a2)+18,D.start.y-l2*Math.sin(a2),9);
    }
  }
}
function drawDown(p){
  var D=state.d;
  if(!(D.start&&Math.hypot(p.x-D.start.x,p.y-D.start.y)<44)){   /* 第一步：点起点（落点是否在灯上由判分说） */
    D.start={x:p.x,y:p.y};
    D.dirLocked=false; D.dirAngle=null; D.lastDist=0;
    D.judged=false; D.items=null; D.wrongCount=0;
    if(window.playClick) playClick();
    updatePanel();
  }
  D.dragging=true; D.liveLen=null;      /* 第二步：从起点拖出方向 */
  dirty=true;
}
function drawMove(p){
  var D=state.d;
  if(!D.dragging||!D.start) return;
  var dx=p.x-D.start.x,dy=D.start.y-p.y,dist=Math.hypot(dx,dy);
  D.lastDist=dist;
  if(dist<2) return;
  D.dirAngle=Math.atan2(dy,dx)*180/Math.PI;
  D.liveLen=clamp(dist,L.dr.unit*0.6,L.dr.unit*4.4);   /* 拖动中给实时预览，松手后长度以选定档位为准 */
  dirty=true;
}
function drawUp(){
  var D=state.d;
  if(!D.dragging) return;
  D.dragging=false;
  if(D.dirAngle!=null&&D.lastDist>=DRAW_DRAG_MIN){
    D.dirLocked=true; D.judged=false; D.items=null; D.wrongCount=0;
    if(window.playClick) playClick();
  }
  D.liveLen=null; D.lastDist=0;
  syncDrawBtns(); updatePanel(); dirty=true;
}

/* ============================================================ 场景③ 相互舞台 · 第一步 磁车对弹 */
function cartTick(now,dtMs){
  var M=state.m;
  if(!M.running) return false;
  var dt=Math.min(32,dtMs)/1000,steps=2,h=dt/steps;
  for(var s=0;s<steps;s++){
    var gap=Math.max(24,M.rx-M.lx);
    var a=Math.min(1600,REP_K/(gap*gap));
    M.lv-=a*h; M.rv+=a*h;                     // 左车向左、右车向右（同时受对方的力）
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
    updatePanel();
  }
  dirty=true;
  return true;
}
function cartRelease(){
  var M=state.m;
  if(M.released){ if(window.playDrop) playDrop(); return; }   /* 未复位再点释放 → guide c7e3-e1 纠错语音接管 */
  M.released=true; M.running=true; M.settled=false; M.relT=performance.now();
  if(window.playClick) playClick();
  updatePanel(); dirty=true;
}
function cartReset(){
  var M=state.m;
  homeCarts();
  M.released=false; M.running=false; M.settled=false;
  if(window.playDrop) playDrop();
  updatePanel(); dirty=true;
}
function renderCart(){
  var M=state.m,cy=L.floorY,cw=L.cartW;
  ctx.fillStyle='#f4f4f2'; ctx.fillRect(0,-H*2,W,H*5);
  ctx.fillStyle='#e3e1dc'; ctx.fillRect(0,L.floorY,W,H*3);
  ctx.strokeStyle='rgba(0,0,0,.10)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,L.floorY); ctx.lineTo(W,L.floorY); ctx.stroke();
  var cl=PROPS.magnet_cart(ctx,M.lx,cy,{w:cw,dir:'right'});
  var cr=PROPS.magnet_cart(ctx,M.rx,cy,{w:cw,dir:'left'});
  var mw=Math.min(96,cw*0.62);
  PROPS.bar_magnet(ctx,cl.mounts.magnet.x,cl.mounts.magnet.y-mw*0.16,{label:true,w:mw,angle:0});    // 左车 N 朝右
  PROPS.bar_magnet(ctx,cr.mounts.magnet.x,cr.mounts.magnet.y-mw*0.16,{label:true,w:mw,angle:180});   // 右车 N 朝左（同名极相对）
  ctx.fillStyle='#8a7c66'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('同名磁极相对（N ↔ N）',W/2,cy-cl.h-70);
  var vl=Math.abs(M.lv),vr=Math.abs(M.rv);
  if(M.released){
    if(vl>4) drawArrow(M.lx-cw*0.5,cy-cl.h-24,M.lx-cw*0.5-clamp(vl/CART_VMAX,0,1)*80,cy-cl.h-24,'#2563eb',4);
    if(vr>4) drawArrow(M.rx+cw*0.5,cy-cr.h-24,M.rx+cw*0.5+clamp(vr/CART_VMAX,0,1)*80,cy-cr.h-24,'#2563eb',4);
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

/* ============================================================ 场景③ 第二步 双测力计对拉 */
function pullGeom(){
  var P=L.pu,g=state.p.g;
  var JA=P.cx-g/2;                 /* 左表挂钩（连接端） */
  var JB=P.cx+g/2;                 /* 右表顶环（连接端） */
  return {JA:JA,JB:JB,cy:P.cy,h:P.h,
          leftHandle:{x:JA-P.h,y:P.cy},      /* 左表顶环=左手拉端 */
          rightHandle:{x:JB+P.h,y:P.cy},     /* 右表挂钩=右手拉端 */
          leftBox:{x:JA-P.h-16,y:P.cy-P.bw-14,w:P.h+32,h:P.bw*2+28},
          rightBox:{x:JB-16,y:P.cy-P.bw-14,w:P.h+32,h:P.bw*2+28}};
}
function pullSetG(g){
  var P=state.p;
  P.g=clamp(g,0,L.pu.gMax);
  P.T=P.g/L.pu.gMax*PULL_TMAX;
  if(P.T>P.maxT) P.maxT=P.T;
  if(P.T>P.peakT) P.peakT=P.T;
  if(P.T>0.2) P.pulled=true;
  updatePanel(); dirty=true;
}
function pullDown(p){
  var G=pullGeom(),P=state.p;
  var side=null;
  if(Math.hypot(p.x-G.leftHandle.x,p.y-G.leftHandle.y)<26||inRect(p,G.leftBox)) side='left';
  else if(Math.hypot(p.x-G.rightHandle.x,p.y-G.rightHandle.y)<26||inRect(p,G.rightBox)) side='right';
  if(!side) return;
  P.relaxTw=null; P.drag=side; P.dragX0=p.x; P.dragG0=P.g; P.peakT=P.T;
  if(window.playClick) playClick();
}
function pullMove(p){
  var P=state.p;
  if(!P.drag) return;
  var dx=(P.drag==='right')?(p.x-P.dragX0):(P.dragX0-p.x);   /* 任一侧向外拖都增大拉力 */
  pullSetG(P.dragG0+dx);
}
function pullUp(){
  var P=state.p;
  if(!P.drag) return;
  P.drag=null;
  if(P.peakT>=PULL_TCOUNT) P.pulls++;
  P.peakT=P.T;
  updatePanel(); dirty=true;
}
function pullRelax(){
  var P=state.p;
  if(P.peakT>=PULL_TCOUNT||P.T>=PULL_TCOUNT) P.pulls++;
  P.relaxTw={t0:performance.now(),f0:P.g};
  P.peakT=0;
  if(window.playDrop) playDrop();
}
function pullTick(now){
  var P=state.p;
  if(!P.relaxTw) return false;
  var t=clamp((now-P.relaxTw.t0)/RELAX_MS,0,1);
  P.g=P.relaxTw.f0*(1-easeOut(t));
  P.T=P.g/L.pu.gMax*PULL_TMAX;
  if(t>=1){ P.g=0; P.T=0; P.relaxTw=null; }
  updatePanel(); dirty=true;
  return true;
}
function renderPull(){
  var P=L.pu,S=state.p,G=pullGeom();
  ctx.fillStyle='#f4f4f2'; ctx.fillRect(0,-H*2,W,H*5);
  ctx.fillStyle='#e3e1dc'; ctx.fillRect(0,L.fy-16,W,H*3);
  ctx.strokeStyle='rgba(0,0,0,.10)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,L.fy-16); ctx.lineTo(W,L.fy-16); ctx.stroke();
  /* 两只弹簧测力计（水平态：顶环在左、挂钩在右）串联，连接端在中央 */
  PROPS.spring_meter(ctx,G.JA,G.cy,{orientation:'h',h:P.h,reading:S.T});
  PROPS.spring_meter(ctx,G.rightHandle.x,G.cy,{orientation:'h',h:P.h,reading:S.T});
  /* 连接挂扣（左表挂钩 ↔ 右表顶环） */
  ctx.save(); ctx.strokeStyle='#5b6068'; ctx.lineWidth=Math.max(2.4,P.h*0.018); ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(G.JA,G.cy); ctx.lineTo(G.JB,G.cy); ctx.stroke();
  ctx.lineWidth=Math.max(1.8,P.h*0.012);
  ctx.beginPath(); ctx.arc(G.JA-4,G.cy,Math.max(4,P.h*0.028),0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(G.JB+4,G.cy,Math.max(4,P.h*0.028),0,Math.PI*2); ctx.stroke();
  ctx.restore();
  /* 两端拉手（拖任一侧向外） */
  [['leftHandle','向左拖'],['rightHandle','向右拖']].forEach(function(h){
    var pt=G[h[0]];
    ctx.save();
    ctx.strokeStyle=S.drag===h[0].replace('Handle','')?'#2563eb':'rgba(100,116,139,.75)';
    ctx.lineWidth=2; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.arc(pt.x,pt.y,15,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
    ctx.fillStyle='#64748b'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
    ctx.fillText(h[1],pt.x,pt.y+34);
  });
  /* 相互作用力箭头：等大、反向、作用在连接处两侧 */
  var al=26+S.T*11;
  if(S.T>0.05){
    drawArrow(G.JA-4,G.cy-P.bw-18,G.JA-4+al,G.cy-P.bw-18,'#e03131',4);
    ctx.fillStyle='#e03131'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
    ctx.fillText('右表对左表的拉力 F₁',G.JA-4+al/2,G.cy-P.bw-30);
    drawArrow(G.JB+4,G.cy+P.bw+18,G.JB+4-al,G.cy+P.bw+18,'#2563eb',4);
    ctx.fillStyle='#2563eb';
    ctx.fillText('左表对右表的拉力 F₂',G.JB+4-al/2,G.cy+P.bw+40);
  }
  /* 两读数牌并排（始终相等） */
  var cw=168,cy0=P.cardY,gapS=14;
  ghostCard(P.cx-cw-gapS/2,cy0,cw,46);
  ghostCard(P.cx+gapS/2,cy0,cw,46);
  ctx.textAlign='center'; ctx.font='600 12px sans-serif'; ctx.fillStyle='#64748b';
  ctx.fillText('左表读数 F₁',P.cx-cw/2-gapS/2,cy0+18);
  ctx.fillText('右表读数 F₂',P.cx+cw/2+gapS/2,cy0+18);
  ctx.font='bold 19px sans-serif';
  ctx.fillStyle=S.drag==='left'?'#2563eb':'#1e293b';
  ctx.fillText(fmt(S.T,1)+' N',P.cx-cw/2-gapS/2,cy0+39);
  ctx.fillStyle=S.drag==='right'?'#2563eb':'#1e293b';
  ctx.fillText(fmt(S.T,1)+' N',P.cx+cw/2+gapS/2,cy0+39);
  if(S.T>0.05){
    ghostCard(P.cx-124,cy0+54,248,26);
    ctx.fillStyle='#b45309'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('F₁ = F₂ = '+fmt(S.T,1)+' N（始终相等）',P.cx,cy0+72);
  }
  ctx.fillStyle='#8a7c66'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('两只弹簧测力计连在一起对拉',P.cx,G.cy+P.h*0.21+64);
}

/* ============================================================ 视图调度（飞入飞出，禁「模式」用语） */
var VIEWS=['effect','door','draw','cart','pull'];
function renderView(v){
  ctx.save();
  if(v==='effect') renderEffect();
  else if(v==='door') renderDoor();
  else if(v==='draw') renderDraw();
  else if(v==='cart') renderCart();
  else renderPull();
  ctx.restore();
}
function draw(){
  ctx.clearRect(0,0,W,H);
  var a=state.anim;
  if(!a) renderView(state.view);
  else{
    var e=easeInOut(clamp((performance.now()-a.t0)/ANIM_DUR,0,1));
    ctx.save(); ctx.translate(0,-H*e); renderView(a.from); ctx.restore();
    ctx.save(); ctx.translate(0,H*(1-e)); renderView(a.to); ctx.restore();
  }
  updatePanel();
}
function flyTo(to){
  if(state.animating||to===state.view) return;
  state.anim={from:state.view,to:to,t0:performance.now()};
  state.view=to; state.animating=true;
  window.GUIDE_SCENE&&window.GUIDE_SCENE.change();   /* 掐掉上一视图语音（切场景另有引擎 mode 沿补发 intro） */
  syncGroups(); repositionPanels(); dirty=true;
}
function goScene(m){
  if(state.animating||m===state.mode) return;
  state.mode=m;
  if(window.playClick) playClick();
  flyTo(viewOf());
}
function goBoard(b){
  if(state.animating||b===state.board) return;
  state.board=b;
  if(window.playClick) playClick();
  flyTo(viewOf());
}
function goStep(s){
  if(state.animating||s===state.cstep) return;
  state.cstep=s;
  if(window.playClick) playClick();
  flyTo(viewOf());
}

/* ===== 控制栏分组可见性 ===== */
var GROUP_VIEWS={
  'grp-scene':VIEWS,'grp-sys':VIEWS,
  'grp-a-press':['effect'],'grp-a-spring':['effect'],'grp-a-rel':['effect'],
  'grp-b-place':['effect'],'grp-b-run':['effect'],
  'grp-board':['door','draw'],
  'grp-e-point':['door'],'grp-e-dir':['door'],'grp-e-size':['door'],'grp-e-act':['door'],
  'grp-d-len':['draw'],'grp-d-label':['draw'],'grp-d-act':['draw'],
  'grp-c-step':['cart','pull'],'grp-c-run':['cart'],'grp-p-run':['pull']
};
function syncGroups(){
  var v=state.view;
  for(var id in GROUP_VIEWS){
    var el=document.getElementById(id);
    if(el) el.classList.toggle('flyout',GROUP_VIEWS[id].indexOf(v)<0);
  }
  ['effect','elements','mutual'].forEach(function(m){
    var el=document.getElementById('btn-scene-'+m);
    if(el) el.classList.toggle('on',state.mode===m);
  });
  var bd=document.getElementById('btn-board-door'),bw=document.getElementById('btn-board-draw');
  if(bd) bd.classList.toggle('on',state.board==='door');
  if(bw) bw.classList.toggle('on',state.board==='draw');
  var s1=document.getElementById('btn-c-step1'),s2=document.getElementById('btn-c-step2');
  if(s1) s1.classList.toggle('on',state.cstep===1);
  if(s2) s2.classList.toggle('on',state.cstep===2);
  var secs={effect:'sec-effect',door:'sec-door',draw:'sec-draw',cart:'sec-cart',pull:'sec-pull'};
  for(var k in secs){
    var se=document.getElementById(secs[k]);
    if(se) se.style.display=(k===v)?'block':'none';
  }
  syncPlaceBtns(); syncDrawBtns();
}
function syncPlaceBtns(){
  ['near','along','side'].forEach(function(m){
    var el=document.getElementById('btn-place-'+m);
    if(el) el.classList.toggle('on',state.b.mode===m);
  });
}
function syncDrawBtns(){
  var D=state.d;
  for(var n=1;n<=4;n++){
    var el=document.getElementById('btn-len-'+n);
    if(el) el.classList.toggle('on',D.lenN===n);
  }
  LABELS.forEach(function(o){
    var id='btn-lab-'+(o.k==='F=4N'?'f4n':(o.k==='4N'?'4n':'f'));
    var el=document.getElementById(id);
    if(el) el.classList.toggle('on',D.label===o.k);
  });
  var chk=document.getElementById('btn-draw-check');
  if(chk) chk.disabled=!(D.start&&D.dirLocked);
}

/* ===== 读数面板（幽灵化 + pickSlot 选空位） ===== */
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
function avoidRects(){
  var rs=[{x:0,y:H-ctrlBandH,w:W,h:ctrlBandH+40}],E=L.ef;
  if(state.view==='effect'){
    rs.push({x:E.zL-6,y:L.by-E.th-70,w:E.zW+12,h:E.th+120});
    rs.push({x:E.tx-E.tw/2-8,y:E.ty-E.th-30,w:E.tw+16,h:E.th+40});
  }else if(state.view==='door'){
    var D=L.dial;
    rs.push({x:L.door.x-L.door.w/2-30,y:L.door.y-L.door.h-50,w:L.door.w+140,h:L.door.h+60});
    rs.push({x:D.x-D.r-20,y:D.y-D.r-34,w:D.r*2+40,h:D.r*2+60});
  }else if(state.view==='draw'){
    var R0=L.dr;
    rs.push({x:12,y:R0.top-14,w:Math.min(440,W*0.64),h:60});
    rs.push({x:R0.cx-R0.lampW/2-30,y:R0.ceilY-30,w:R0.lampW+60,h:R0.lamp.h+90});
    rs.push({x:12,y:L.fy-64,w:400,h:52});
  }else if(state.view==='cart'){
    var M=state.m;
    rs.push({x:M.lx-L.cartW/2-90,y:L.floorY-170,w:(M.rx-M.lx)+L.cartW+180,h:220});
  }else{
    var G=pullGeom();
    rs.push({x:L.pu.cx-200,y:L.pu.cardY-6,w:400,h:96});
    rs.push({x:G.leftHandle.x-24,y:G.cy-L.pu.h*0.21-50,w:(G.rightHandle.x-G.leftHandle.x)+48,h:L.pu.h*0.42+120});
  }
  return rs;
}
function placeReadPanel(){
  var el=document.getElementById('panel-read'); if(!el) return;
  var slot=pickSlot(el.offsetWidth||260,el.offsetHeight||170,avoidRects());
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
function updatePanel(){
  var v=state.view;
  if(v==='effect'){
    var A=state.a,B=state.b;
    setText('rd-press',fmt(aPress()*100,0)+' %');
    setText('rd-dent',aPress()>0.02?('凹陷 '+fmt(aPress()*100,0)+' %'+(A.clayReleased?'（松手不回原样）':'')):'—');
    setText('rd-stretch',Math.abs(A.stretch)>0.02?((A.stretch>0?'伸长 ':'压缩 ')+fmt(Math.abs(A.stretch)*100,0)+' %'):(A.springReleased?'已恢复原长':'原长'));
    setText('rd-after',(A.clayReleased?'橡皮泥：不恢复 ':'')+(A.springReleased?'弹簧：恢复':'—'));
    setText('rd-place',PLACE_CN[B.mode]);
    setText('rd-vel',B.released?('v = '+fmt(Math.hypot(B.vx,B.vy)/40,1)+' 单位'):'0（静止待发）');
    setText('rd-change',B.done?CHANGE_CN[B.change]:(B.running?'进行中…':'—'));
  }else if(v==='door'){
    var E=state.e;
    setText('rd-point',Math.round(E.pointMark*100)+' %（'+(E.pointMark>0.6?'离轴远':(E.pointMark<0.3?'靠近轴':'中间'))+'）');
    setText('rd-dir','与门面夹角 '+(90-Math.abs(E.angle))+'°');
    setText('rd-size',fmt(E.F,1)+' N');
    setText('rd-eff','力矩 '+fmt(E.eff,2)+' → '+effText(E.eff));
    setText('rd-open',Math.round(E.open*100)+' %');
  }else if(v==='draw'){
    var D=state.d;
    setText('rd-d-start',D.start?(D.judged&&D.items?(D.items.start?'在灯上 ✓':'不在灯上 ✗'):'已点（x'+Math.round(D.start.x)+'）'):'未点');
    setText('rd-d-dir',D.dirLocked?(Math.round(D.dirAngle)+'°'+(D.judged&&D.items?(D.items.dir?' 竖直向上 ✓':' 不竖直 ✗'):'')):'未拖');
    setText('rd-d-len',D.lenN?(D.lenN+' 格 = '+D.lenN+' N'+(D.judged&&D.items?(D.items.len?' ✓':' ✗'):'')):'未选');
    setText('rd-d-label',D.label||(D.judged&&D.items&&!D.items.label?'未标 ✗':'未选'));
    setText('rd-d-res',D.judged?(D.wrongCount?('4 项中 '+D.wrongCount+' 项要改'):'四项全对 ✓'):'—');
  }else if(v==='cart'){
    var M=state.m;
    setText('rd-vl',fmt(Math.abs(M.lv)/40,1)+'（向左）');
    setText('rd-vr',fmt(Math.abs(M.rv)/40,1)+'（向右）');
    setText('rd-st',M.settled?'已弹开停稳':(M.running?'弹开中…':'静止（同名极相对）'));
  }else{
    var S=state.p;
    setText('rd-pl',fmt(S.T,1)+' N');
    setText('rd-pr',fmt(S.T,1)+' N');
    setText('rd-prel',S.T>0.05?('F₁ = F₂（始终相等）'):'未对拉');
    setText('rd-pdir',S.T>0.05?'相反（F₁ 向右、F₂ 向左）':'—');
  }
}

/* ===== 控制栏接线 ===== */
function on(id,ev,fn){ var el=document.getElementById(id); if(el) el.addEventListener(ev,fn); }
function guard(fn){ return function(){ if(state.animating) return; fn(); }; }
var rngPress=document.getElementById('rng-press'),rngSpring=document.getElementById('rng-spring');
var rngPoint=document.getElementById('rng-point'),rngDir=document.getElementById('rng-dir'),rngSize=document.getElementById('rng-size');
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
on('btn-release-a','click',guard(releaseA));
['near','along','side'].forEach(function(m){ on('btn-place-'+m,'click',guard(function(){ ballSetMode(m); })); });
on('btn-release-b','click',guard(ballRelease));
on('btn-reset-b','click',guard(function(){ resetBall(); updatePanel(); dirty=true; if(window.playClick)playClick(); }));
if(rngPoint) rngPoint.addEventListener('input',function(){
  state.e.pointMark=parseFloat(rngPoint.value)/100;
  setText('lbl-point',rngPoint.value+' %'); updatePanel(); dirty=true;
});
if(rngDir) rngDir.addEventListener('input',function(){
  state.e.angle=parseFloat(rngDir.value);
  setText('lbl-dir',(90-Math.abs(state.e.angle))+'°'); updatePanel(); dirty=true;
});
if(rngSize) rngSize.addEventListener('input',function(){
  state.e.F=parseFloat(rngSize.value);
  setText('lbl-size',fmt(state.e.F,1)+' N'); updatePanel(); dirty=true;
});
on('btn-push','click',guard(pushToggle));
on('btn-close','click',guard(closeDoor));
on('btn-board-door','click',function(){ goBoard('door'); });
on('btn-board-draw','click',function(){ goBoard('draw'); });
for(var n=1;n<=4;n++){
  (function(k){
    on('btn-len-'+k,'click',guard(function(){
      state.d.lenN=k; state.d.judged=false; state.d.items=null; state.d.wrongCount=0;
      syncDrawBtns(); updatePanel(); dirty=true; if(window.playClick) playClick();
    }));
  })(n);
}
LABELS.forEach(function(o){
  var id='btn-lab-'+(o.k==='F=4N'?'f4n':(o.k==='4N'?'4n':'f'));
  on(id,'click',guard(function(){
    state.d.label=o.k; state.d.judged=false; state.d.items=null; state.d.wrongCount=0;
    syncDrawBtns(); updatePanel(); dirty=true; if(window.playClick) playClick();
  }));
});
on('btn-draw-check','click',guard(function(){
  if(!(state.d.start&&state.d.dirLocked)) return;
  drawJudge();
}));
on('btn-draw-clear','click',guard(function(){ drawBoardReset(); if(window.playClick) playClick(); }));
on('btn-c-step1','click',function(){ goStep(1); });
on('btn-c-step2','click',function(){ goStep(2); });
on('btn-c-release','click',guard(cartRelease));
on('btn-c-reset','click',guard(cartReset));
on('btn-p-relax','click',guard(pullRelax));
['effect','elements','mutual'].forEach(function(m){ on('btn-scene-'+m,'click',function(){ goScene(m); }); });
on('btn-table','click',guard(function(){ openPanel(); if(window.playClick)playClick(); }));
on('btn-reset','click',guard(function(){
  if(state.mode==='effect'){
    var A=state.a,B=state.b;
    A.press=0; A.pressPerm=0; A.stretch=0; A.stTw=null; A.clayReleased=false; A.springReleased=false;
    if(rngPress)rngPress.value=0; if(rngSpring)rngSpring.value=0;
    setText('lbl-press','0 %'); setText('lbl-spring','0 %');
    B.tried={}; B.triedCount=0; B.armed=false; resetBall(); syncPlaceBtns();
  }else if(state.mode==='elements'){
    var E=state.e;
    if(E.pushing) pushToggle();
    E.pointMark=0.75; E.angle=0; E.F=5; E.open=0; E.openTw=null; E.omega=0;
    E.nearTried=E.farTried=E.parTried=E.bigTried=false; E.successCount=0;
    if(rngPoint)rngPoint.value=75; if(rngDir)rngDir.value=0; if(rngSize)rngSize.value=5;
    setText('lbl-point','75 %'); setText('lbl-dir','90°'); setText('lbl-size','5.0 N');
    var pb=document.getElementById('btn-push'); if(pb){pb.textContent='开始推门';pb.classList.remove('on');}
    drawBoardReset();
  }else{
    cartReset();
    var P=state.p;
    P.g=0; P.T=0; P.maxT=0; P.pulls=0; P.peakT=0; P.drag=null; P.relaxTw=null; P.pulled=false;
  }
  updatePanel(); dirty=true;
  if(window.playClick) playClick();
  window.GUIDE_RESET&&window.GUIDE_RESET.all();
}));
on('btn-mute','click',function(){ window.muted=!window.muted; var b=document.getElementById('btn-mute'); if(b)b.textContent=window.muted?'🔇':'🔊'; if(window.playClick)playClick(); });

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
on('btn-full','click',guard(function(){ if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull(); else reqFull(); if(window.playClick)playClick(); }));
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(ev){document.addEventListener(ev,function(){syncFull();setTimeout(resize,60);});});

/* ===== 画布指针（你来画 = 点起点/拖方向；对拉 = 拖任一侧） ===== */
function canvasXY(ev){
  var r=cv.getBoundingClientRect();
  return {x:(ev.clientX-r.left)*(W/Math.max(1,r.width)),y:(ev.clientY-r.top)*(H/Math.max(1,r.height))};
}
cv.addEventListener('pointerdown',function(ev){
  if(state.animating) return;
  var p=canvasXY(ev);
  if(state.view==='draw'){ drawDown(p); }
  else if(state.view==='pull'){ pullDown(p); }
  else return;
  if(cv.setPointerCapture&&ev.pointerId!=null){ try{ cv.setPointerCapture(ev.pointerId); }catch(e){} }
});
cv.addEventListener('pointermove',function(ev){
  if(state.animating) return;
  var p=canvasXY(ev);
  if(state.view==='draw') drawMove(p);
  else if(state.view==='pull') pullMove(p);
});
['pointerup','pointercancel','pointerleave'].forEach(function(ev){
  cv.addEventListener(ev,function(){
    if(state.view==='draw') drawUp();
    else if(state.view==='pull') pullUp();
  });
});

/* ===== 动画 tick ===== */
var lastNow=0;
function busy(){
  var now=performance.now(),dt=lastNow?Math.min(64,now-lastNow):16; lastNow=now;
  if(state.animating){
    if(now-state.anim.t0>=ANIM_DUR){ state.animating=false; state.anim=null; repositionPanels(); }
    return true;
  }
  var b=false;
  if(state.view==='effect'){ if(aTick(now)) b=true; if(ballTick(now,dt)) b=true; }
  else if(state.view==='door'){ if(doorTick(now,dt)) b=true; }
  else if(state.view==='pull'){ if(pullTick(now)) b=true; }
  return b;
}
function tick(){
  if(busy()||dirty){ dirty=false; draw(); }
  requestAnimationFrame(tick);
}

/* ===== init ===== */
layout(); resize();
state.view=viewOf();
renderView('effect');      /* 预热一帧拿台面几何（resetBall 依赖 L.ef.ballTop） */
resetBall();
renderView(state.view);
syncGroups(); updatePanel(); draw();
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); reflow(); repositionPanels(); dirty=true; }).observe(ctrlEl);
}
requestAnimationFrame(tick);
/* 调试通道（验收直读模型） */
window.__c7dbg={
  get state(){ return state; }, get W(){ return W; }, get H(){ return H; }, get layout(){ return L; },
  scene:goScene, board:goBoard, step:goStep,
  judge:drawJudge, pullTo:function(t){ pullSetG(t/PULL_TMAX*L.pu.gMax); },
  pickSlotProbe:function(){ var el=document.getElementById('panel-read');
    return {slot:pickSlot(el.offsetWidth||260,el.offsetHeight||170,avoidRects()),avoid:avoidRects()}; }
};
})();

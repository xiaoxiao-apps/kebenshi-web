/* exp-springmeter-core.js — c7s2 E5 弹簧测力计实验室（双场景：竖直 v / 水平 h，浅蓝灰亮底）
   物理语义：F=G=mg（g=9.8 N/kg）；挂码后指针短振荡（欠阻尼余弦，≤1.5s 停稳再读数）；
   初始指针偏零 → 必须调零；合力+零位偏差 >5N 拦截报错（超量程会损坏测力计）；
   水平使用需重新调零；感受1N/3N/5N 拉力手感；参考线=0刻度原长虚线+当前平衡位虚线 */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var G_VAL=9.8;                        // N/kg（教材值，禁改 10）
var F_MAX=5;                          // 量程 0-5N
var OSC_TAU=0.22,OSC_HZ=2.2,OSC_LIFE=1500;   // 短振荡：衰减常数/频率/寿命（≤1.5s 停稳）
var ZERO_OFF={v:0.35,h:0.25};         // 初始指针偏零（N）
var OVERLOAD_MS=3000;                 // 超量程报错态时长
var FEEL_GO=800,FEEL_HOLD=2000,FEEL_BACK=600;
var DESK_BAND=109;
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var hintEl=document.getElementById('hint');
var W=960,H=520,DPR=1,ctrlBandH=110,COMPACT_H=600,dirty=true;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(v,n){ return (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }
function easeOut(t){ return 1-Math.pow(1-t,3); }
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }

var state={
  scene:'v',
  s:{overload:false,overloadT:0,feelUsed:0,feel:null,
     v:{stack:[],off:ZERO_OFF.v,zeroed:false,settled:true,osc:null,zeroTw:null},
     h:{stack:[],off:ZERO_OFF.h,zeroed:false,settled:true,osc:null,zeroTw:null}}
};
window.C7S2_STATE=state;
function SC(){ return state.s[state.scene]; }
function stackG(sc){ var t=0; sc.stack.forEach(function(g){ t+=g; }); return t; }
function forceOf(sc){ return stackG(sc)/1000*G_VAL; }
function maxStackH(){ return PROPS.weightGeom(250).h*2+8; }   // 布局预留：两只 250g 叠挂

var L={};
function layout(){
  L.fy=H-ctrlBandH;
  L.by=Math.max(40,L.fy-DESK_BAND);
  L.seat=PROPS.seatY(L.by,64,26);
  L.beamY=Math.round(Math.max(H*0.10,44));
  L.meterH=clamp(Math.round(L.seat-L.beamY-maxStackH()-26),150,230);
  L.cx=Math.round(W*0.5);
  L.anchorYv=L.beamY+L.meterH;                       // 竖直态底钩锚（顶环挂横梁）
  L.hx=clamp(Math.round(W*0.60),L.meterH+70,W-50);
  L.hy=Math.round(L.seat-6-maxStackH());             // 水平态底钩锚（钩码垂到桌面上方）
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
/* 刻度窗指针位置（局部坐标同 spring_meter 公式）：v 态=世界 y，h 态=世界 x 偏移 */
function ptrLocal(v){
  var Hm=L.meterH,winT=-Hm*0.805,winB=-Hm*0.14;
  return winT+(winB-winT)*(clamp(v,0,F_MAX)/F_MAX);
}

/* ===== 显示读数（力 + 零位偏差 + 振荡/感受动画） ===== */
function oscVal(sc,now){
  if(!sc.osc) return 0;
  var t=(now-sc.osc.t0)/1000;
  if(t*1000>=OSC_LIFE){ sc.osc=null; sc.settled=true; updatePanel(); return 0; }
  dirty=true;
  return sc.osc.A*Math.exp(-t/OSC_TAU)*Math.cos(2*Math.PI*OSC_HZ*t);
}
function feelVal(now){
  var f=state.s.feel;
  if(!f) return null;
  var t=now-f.t0;
  if(t<FEEL_GO){ dirty=true; return f.from+(f.to-f.from)*easeInOut(t/FEEL_GO); }
  if(t<FEEL_GO+FEEL_HOLD){ dirty=true; return f.to; }
  if(t<FEEL_GO+FEEL_HOLD+FEEL_BACK){ dirty=true; return f.to+(f.back-f.to)*easeInOut((t-FEEL_GO-FEEL_HOLD)/FEEL_BACK); }
  state.s.feel=null; updatePanel();
  return null;
}
function displayNow(now){
  var sc=SC(),fv=feelVal(now);
  if(fv!=null) return clamp(fv,0,F_MAX);
  return clamp(forceOf(sc)+sc.off+oscVal(sc,now),0,F_MAX);
}

/* ===== 交互 ===== */
function addWeight(g){
  var S=state.s,sc=SC(),now=performance.now();
  S.feel=null;
  var Fnew=(stackG(sc)+g)/1000*G_VAL;
  if(Fnew+sc.off>F_MAX){   // 超量程拦截（e1 语音闸）
    S.overload=true; S.overloadT=now;
    hintOverride='哎呀，超过 5 牛了！加在测力计上的力不允许超过最大测量值，点「减一个」';
    updateHint(); updatePanel(); dirty=true;
    if(window.playDrop) playDrop();
    return;
  }
  var hookY=state.scene==='v'?L.anchorYv:L.hy;
  var th=0; sc.stack.forEach(function(w){ th+=PROPS.weightGeom(w).h; });
  th+=PROPS.weightGeom(g).h;
  if(hookY+th>L.seat-4){
    hintOverride='钩码快挂到桌面啦，先「减一个」再挂';
    updateHint();
    if(window.playDrop) playDrop();
    return;
  }
  sc.stack.push(g);
  sc.settled=false;
  sc.osc={t0:now,A:Math.min(0.5,0.22+g/1000*G_VAL*0.10)};
  if(!sc.zeroed) hintOverride='指针走啦——不过还没调零，读数里混着零位偏差哦';
  else hintOverride='钩码挂上了，指针短振荡后停稳再读数';
  updateHint(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
}
function removeWeight(){
  var sc=SC(),now=performance.now();
  state.s.feel=null;
  if(!sc.stack.length){ hintOverride='钩上已经没有钩码啦'; updateHint(); return; }
  sc.stack.pop();
  sc.settled=false;
  sc.osc={t0:now,A:0.25};
  updateHint(); updatePanel(); dirty=true;
  if(window.playDrop) playDrop();
}
function zeroAdjust(){
  var sc=SC(),now=performance.now();
  state.s.feel=null;
  if(sc.zeroed){ hintOverride='已经调过零啦，指针正指 0 刻度'; updateHint(); return; }
  sc.zeroTw={t0:now,from:sc.off,to:0};
  hintOverride='调零完成：指针对齐 0 刻度，之后的读数才准';
  updateHint(); dirty=true;
  if(window.playClick) playClick();
}
function feel(n){
  var S=state.s,sc=SC(),now=performance.now();
  if(S.overload) return;
  var cur=clamp(forceOf(sc)+sc.off,0,F_MAX);
  S.feel={t0:now,from:cur,to:n,back:cur};
  S.feelUsed++;
  hintOverride='这就是 '+n+' 牛的拉力，记住这个手感！';
  updateHint(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
}
function setScene(sn){
  if(state.scene===sn) return;
  state.scene=sn; state.s.feel=null;
  syncSceneBtns();
  if(sn==='h') hintOverride='换成水平方向使用：用法要变，先在水平方向重新调零再测';
  else hintOverride='回到竖直场景';
  updateHint(); updatePanel(); dirty=true;
  if(window.GUIDE_SCENE&&window.GUIDE_SCENE.change) window.GUIDE_SCENE.change();
  if(window.playClick) playClick();
}
function syncSceneBtns(){
  var v=document.getElementById('btn-scene-v'),h=document.getElementById('btn-scene-h');
  if(v) v.classList.toggle('on',state.scene==='v');
  if(h) h.classList.toggle('on',state.scene==='h');
}
function resetAll(){
  var S=state.s;
  S.overload=false; S.feelUsed=0; S.feel=null;
  ['v','h'].forEach(function(k){
    S[k]={stack:[],off:ZERO_OFF[k],zeroed:false,settled:true,osc:null,zeroTw:null};
  });
  updateHint(); updatePanel(); dirty=true;
}

/* ===== 绘制 ===== */
function drawStandV(){
  ctx.save();
  ctx.fillStyle='#9aa1ab'; ctx.strokeStyle='#7d838c'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(L.cx-70,L.seat-10,140,10,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(L.cx-L.meterH*0.105-24,L.beamY-6,12,L.seat-L.beamY-4,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(L.cx-L.meterH*0.105-60,L.beamY-14,L.meterH*0.105+76,10,3); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function drawStackV(hookX,hookY){
  var sc=SC(),y=hookY;
  sc.stack.forEach(function(g){
    var gh=PROPS.weightGeom(g);
    y+=gh.h;
    PROPS.hook_weight(ctx,hookX,y,{g:g});
  });
  return y;
}
function drawRefLines(vert,anchorX,anchorY,disp){
  var nat=document.getElementById('chk-ref-nat'),eq=document.getElementById('chk-ref-eq');
  var showNat=nat&&nat.checked,showEq=eq&&eq.checked;
  if(!showNat&&!showEq) return;
  ctx.save(); ctx.lineWidth=1.6;
  var p0=ptrLocal(0),pE=ptrLocal(disp);
  if(vert){
    var xL=anchorX-L.meterH*0.21*0.30-58,xR=anchorX-L.meterH*0.21*0.30-4;
    if(showNat){ ctx.strokeStyle='#2563eb'; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(xL,anchorY+p0); ctx.lineTo(xR,anchorY+p0); ctx.stroke();
      ctx.fillStyle='#2563eb'; ctx.font='11px sans-serif'; ctx.textAlign='right'; ctx.setLineDash([]);
      ctx.fillText('0 刻度（原长）',xR,anchorY+p0-5); }
    if(showEq){ ctx.strokeStyle='#16a34a'; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(xL,anchorY+pE); ctx.lineTo(xR+L.meterH*0.21*0.60+62,anchorY+pE); ctx.stroke();
      ctx.fillStyle='#16a34a'; ctx.font='11px sans-serif'; ctx.textAlign='left'; ctx.setLineDash([]);
      ctx.fillText('平衡位 '+fmt(disp,2)+' N',anchorX+L.meterH*0.21*0.30+6,anchorY+pE-5); }
  }else{
    var half=L.meterH*0.21*0.30;
    var yT=anchorY-half-16,yB=anchorY+half+16;
    if(showNat){ ctx.strokeStyle='#2563eb'; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(anchorX+p0,yT); ctx.lineTo(anchorX+p0,yB); ctx.stroke();
      ctx.fillStyle='#2563eb'; ctx.font='11px sans-serif'; ctx.textAlign='center'; ctx.setLineDash([]);
      ctx.fillText('0 刻度（原长）',anchorX+p0,yT-4); }
    if(showEq){ ctx.strokeStyle='#16a34a'; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(anchorX+pE,yT); ctx.lineTo(anchorX+pE,yB); ctx.stroke();
      ctx.fillStyle='#16a34a'; ctx.font='11px sans-serif'; ctx.textAlign='center'; ctx.setLineDash([]);
      ctx.fillText('平衡位 '+fmt(disp,2)+' N',anchorX+pE,yT-4); }
  }
  ctx.restore();
}
function drawReadCard(x,y,disp,sc){
  ghostCard(x-96,y,192,30);
  ctx.fillStyle='#1e293b'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  var txt=sc.settled?('读数 F = '+fmt(disp,2)+' N'):('指针振荡中… 停稳再读');
  ctx.fillText(txt,x,y+20);
  if(!sc.zeroed&&!state.s.feel){
    ctx.fillStyle='#b91c1c'; ctx.font='600 12px sans-serif';
    ctx.fillText('⚠ 指针未调零',x,y+46);
  }
}
function drawSceneV(now){
  var sc=SC(),disp=displayNow(now);
  drawStandV();
  var g=PROPS.spring_meter(ctx,L.cx,L.anchorYv,{reading:disp,h:L.meterH,orientation:'v'});
  var botY=drawStackV(g.hook.x,g.hook.y);
  drawRefLines(true,L.cx,L.anchorYv,disp);
  if(state.s.feel){   // 感受拉力：钩下红箭头
    var y0=(sc.stack.length?botY:g.hook.y)+8;
    drawArrow(L.cx,y0,L.cx,y0+34+disp*10,'#dc2626',4.5);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F = '+fmt(disp,1)+' N（手拉感受）',L.cx+12,y0+30);
  }
  drawReadCard(L.cx+Math.round(L.meterH*0.105)+110,L.beamY+8,disp,sc);
}
function drawSceneH(now){
  var sc=SC(),disp=displayNow(now);
  // 水平态：底钩锚 (hx,hy)，壳体向左延展；木垫块支撑壳体
  var bw=L.meterH*0.21,bx=L.hx-L.meterH*0.475;   // 壳体中心世界 x
  ctx.save();
  ctx.fillStyle='#b08a5a'; ctx.strokeStyle='#8a6a42'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(bx-bw*0.45,L.hy+bw/2,bw*0.9,L.seat-L.hy-bw/2,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(bx-bw*0.75,L.seat-8,bw*1.5,8,2); ctx.fill(); ctx.stroke();
  ctx.restore();
  var g=PROPS.spring_meter(ctx,L.hx,L.hy,{reading:disp,h:L.meterH,orientation:'h'});
  var botY=drawStackV(g.hook.x,g.hook.y);
  drawRefLines(false,L.hx,L.hy,disp);
  if(state.s.feel){
    var x0=g.hook.x+8;
    drawArrow(x0,L.hy+6,x0+40+disp*12,L.hy+6,'#dc2626',4.5);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F = '+fmt(disp,1)+' N（水平拉）',x0+16,L.hy-8);
  }
  drawReadCard(L.hx-L.meterH*0.5,L.hy-bw/2-58,disp,sc);
  ctx.fillStyle='#8a7c66'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('水平使用：先重新调零，再测拉力',L.hx-L.meterH*0.4,L.beamY+14);
}
function render(now){
  ctx.fillStyle='#eef2f6'; ctx.fillRect(0,0,W,H);          // E5 浅蓝灰亮底
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  if(state.scene==='v') drawSceneV(now);
  else drawSceneH(now);
  if(state.s.overload){   // 超量程红闪警示框
    var a=0.35+0.35*Math.sin(now/120);
    ctx.save(); ctx.strokeStyle='rgba(220,38,38,'+a.toFixed(2)+')'; ctx.lineWidth=5;
    ctx.strokeRect(3,3,W-6,H-6); ctx.restore();
    ghostCard(W/2-160,L.beamY+Math.round(H*0.06),320,30);
    ctx.fillStyle='#b91c1c'; ctx.font='600 14px sans-serif'; ctx.textAlign='center';
    ctx.fillText('超过量程 5N！会损坏测力计，快减掉一个钩码',W/2,L.beamY+Math.round(H*0.06)+20);
  }
}
function draw(){ var now=performance.now(); ctx.clearRect(0,0,W,H); render(now); updatePanel(); }

/* ===== tick（振荡/感受/调零/超量程计时） ===== */
function sTick(now){
  var S=state.s,sc=SC(),busy=false;
  if(sc.osc){ oscVal(sc,now); busy=true; }
  if(S.feel){ feelVal(now); busy=true; }
  if(sc.zeroTw){
    var p=clamp((now-sc.zeroTw.t0)/300,0,1);
    sc.off=sc.zeroTw.from+(sc.zeroTw.to-sc.zeroTw.from)*easeOut(p);
    if(p>=1){ sc.zeroTw=null; sc.zeroed=true; sc.off=0; updatePanel(); }
    busy=true;
  }
  if(S.overload&&now-S.overloadT>OVERLOAD_MS){ S.overload=false; updatePanel(); }
  if(S.overload) busy=true;
  if(!sc.settled&&!sc.osc){ sc.settled=true; updateHint(); updatePanel(); }
  return busy;
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
  var S=state.s,sc=SC();
  if(S.overload) return '超过 5N 啦！点「减一个」把钩码取下来';
  if(!sc.zeroed) return '先看量程 0～5N、认清小格，再检查指针——它没指零，点「调零」';
  if(!sc.stack.length) return '调零完成！点 +50g / +100g / +250g 把钩码逐个挂上挂钩';
  if(!sc.settled) return '指针在轻轻振荡，停稳后再读数';
  return '读数 = 指针指的刻度（单位 N）。试试「感受1N/3N/5N」，或换水平场景重新调零再测';
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
    state.scene==='v'
      ? {x:L.cx-L.meterH*0.3,y:L.beamY-20,w:L.meterH*0.6+40,h:L.seat-L.beamY+40}
      : {x:L.hx-L.meterH-30,y:L.hy-L.meterH*0.21,w:L.meterH+80,h:L.seat-L.hy+60}
  ];
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
  var S=state.s,sc=SC(),now=performance.now();
  var m=stackG(sc),F=forceOf(sc),fv=S.feel?feelVal(now):null;
  setText('rd-scene',state.scene==='v'?'竖直使用':'水平使用');
  setText('rd-mass',m+' g');
  setText('rd-force',fmt(F,2)+' N');
  setText('rd-read',fmt(fv!=null?fv:clamp(F+sc.off,0,F_MAX),2)+' N'+(sc.zeroed?'':'（含零位偏差）'));
  var st=S.overload?'超量程拦截！':(sc.settled?(sc.zeroed?'已调零 · 可读数':'未调零 · 读数不准'):'振荡中 · 停稳再读');
  setText('rd-status',st);
}

/* ===== 控制栏接线 ===== */
var bv=document.getElementById('btn-scene-v'),bh=document.getElementById('btn-scene-h');
if(bv) bv.addEventListener('click',function(){ setScene('v'); });
if(bh) bh.addEventListener('click',function(){ setScene('h'); });
var w50=document.getElementById('btn-w50'),w100=document.getElementById('btn-w100'),w250=document.getElementById('btn-w250');
if(w50) w50.addEventListener('click',function(){ addWeight(50); });
if(w100) w100.addEventListener('click',function(){ addWeight(100); });
if(w250) w250.addEventListener('click',function(){ addWeight(250); });
var bu=document.getElementById('btn-unload');
if(bu) bu.addEventListener('click',function(){ removeWeight(); });
var bz=document.getElementById('btn-zero');
if(bz) bz.addEventListener('click',function(){ zeroAdjust(); });
var f1=document.getElementById('btn-feel1'),f3=document.getElementById('btn-feel3'),f5=document.getElementById('btn-feel5');
if(f1) f1.addEventListener('click',function(){ feel(1); });
if(f3) f3.addEventListener('click',function(){ feel(3); });
if(f5) f5.addEventListener('click',function(){ feel(5); });
['chk-ref-nat','chk-ref-eq'].forEach(function(id){
  var el=document.getElementById(id);
  if(el) el.addEventListener('change',function(){ dirty=true; if(window.playClick)playClick(); });
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
var lastNow=0;
function tick(){
  var now=performance.now(),dt=lastNow?Math.min(64,now-lastNow):16; lastNow=now;
  var bsy=sTick(now);
  if(bsy||dirty){ dirty=false; draw(); }
  requestAnimationFrame(tick);
}
layout(); resize(); syncSceneBtns(); updateHint(); updatePanel(); draw();
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); placeHint(); repositionPanels(); dirty=true; }).observe(ctrlEl);
}
requestAnimationFrame(tick);
window.__c7dbg={
  get state(){ return state; }, get W(){ return W; }, get H(){ return H; }, get layout(){ return L; },
  addWeight:addWeight, removeWeight:removeWeight, zero:zeroAdjust, feel:feel, setScene:setScene, reset:resetAll
};
})();

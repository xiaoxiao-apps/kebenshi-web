/* exp-elastic-lab-core.js — c7s2 弹力实验室（两场景融合：①形变研究所 elastic ②测力计工作台 meter）
   场景①：5 器材单选（弹簧spring_horizontal/直尺ruler_flex/橡皮筋rubber_band/橡皮泥plasticine/玻璃瓶细管glass_bottle_tube）
          统一滑杆（拉力/按压力/捏力）→形变实时；松手→弹性体复原、橡皮泥不复原；超限度开关→弹簧永久变形
   场景②：竖直挂钩码（0-5个100g步进）↔水平拖木块（拖力滑杆）同场景切换；调零/量程分度标注/感受1N3N5N；
          伸长量面板（原长虚线+实时 伸长量=现长−原长）；考官角落4张错误操作图示卡判分
   物理语义：F=G=mg（g=9.8 N/kg）；指针短振荡停稳再读数；初始指针偏零须调零；合力+零位偏差>5N 超量程拦截 */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var REL_MS=420;                       // 松手复原/定形 tween（easeOut 单调，禁回弹）
var DESK_BAND=109;                    // 桌带厚度锁 109px（库定版）
var OVER_PULL=75,PERM_K=0.55;         // 超限度阈值（力%）与永久变形残留系数
var G_VAL=9.8;                        // N/kg（教材值，禁改 10）
var F_MAX=5;                          // 测力计量程 0-5N
var OSC_TAU=0.22,OSC_HZ=2.2,OSC_LIFE=1500;   // 短振荡：衰减常数/频率/寿命（≤1.5s 停稳）
var ZERO_OFF={v:0.35,h:0.25};         // 初始指针偏零（N）
var OVERLOAD_MS=3000;                 // 超量程报错态时长
var FEEL_GO=800,FEEL_HOLD=2000,FEEL_BACK=600;
var EXT_L0=10.0,EXT_K=0.6;            // 伸长量面板：弹簧原长 cm、每牛伸长 cm/N（模拟数据，实时联动）
var FLY_MS=560;                       // 场景飞入飞出总时长
var W_G=100;                          // 钩码单个克数
var TOOL_CN={spring:'弹簧',ruler:'直尺',band:'橡皮筋',clay:'橡皮泥',bottle:'玻璃瓶细管'};
var FORCE_CN={spring:'拉力',ruler:'按压力',band:'拉力',clay:'按压力',bottle:'捏力'};
var TOOLS=['spring','ruler','band','clay','bottle'];
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var W=960,H=520,DPR=1,ctrlBandH=110,COMPACT_H=600,dirty=true;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(v,n){ return (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }
function easeOut(t){ return 1-Math.pow(1-t,3); }
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }

var state={
  mode:'elastic',                     // 引擎轮询 R.mode 切 elastic/meter 两套引导
  fly:null,                           // 飞入飞出 {t0,from,to,swapped}
  toast:null,                         // 画布白卡短提示 {text,until}
  e:{tool:'spring',force:0,over:false,pulling:false,pullT:0,
     released:false,restored:false,permanent:false,lastTool:null,
     tried:{},triedCount:0,relTw:null,
     ts:{spring:{def:0,perm:0,pull:0},ruler:{def:0,perm:0,pull:0},
         band:{def:0,perm:0,pull:0},clay:{def:0,perm:0,pull:0},
         bottle:{def:0,perm:0,pull:0}}},
  s:{orient:'v',feelUsed:0,feel:null,overload:false,overloadT:0,
     examOpen:false,examDone:0,extTouched:false,
     exam:{c1:{judged:false,wrong:0},c2:{judged:false,wrong:0},
           c3:{judged:false,wrong:0},c4:{judged:false,wrong:0}},
     v:{count:0,off:ZERO_OFF.v,zeroed:false,settled:true,osc:null,zeroTw:null},
     h:{pull:0,off:ZERO_OFF.h,zeroed:false,settled:true,osc:null,zeroTw:null}}
};
window.C7S2_STATE=state;
function TS(){ return state.e.ts[state.e.tool]; }
function defOf(t){ return state.e.ts[t].def; }
function SC(){ return state.s[state.s.orient]; }
function forceOf(sc){ return state.s.orient==='v'?sc.count*W_G/1000*G_VAL:sc.pull; }

var L={};
function layout(){
  L.fy=H-ctrlBandH;
  L.by=Math.max(40,L.fy-DESK_BAND);
  L.seat=PROPS.seatY(L.by,64,26);
  L.cx=Math.round(W*0.5);
  L.beamY=Math.round(Math.max(H*0.12,50));
  L.springLen=clamp(Math.round(W*0.24),130,220);
  L.rulerLen=Math.min(240,Math.round(W*0.26));
  L.bottleW=Math.min(120,Math.max(90,Math.round(W*0.12)));
  L.bottleH=clamp(Math.round((L.seat-L.beamY)*0.92),170,300);
  L.bottleY=L.seat+10;
  // 玻璃瓶原水面基线：离屏调用标准件取 squeeze=0 的 waterTopY（不硬编码件内比例）
  L.bottleBase=PROPS.glass_bottle_tube(offCtx,L.cx,L.bottleY,L.bottleW,L.bottleH,{squeeze:0}).waterTopY;
  // 测力计竖直态：底钩锚+钩码堆预留
  L.meterH=clamp(Math.round(L.seat-L.beamY-5*(16+W_G*0.16)-30),120,200);
  L.anchorYv=L.beamY+L.meterH;
  L.maxFit=Math.max(0,Math.floor((L.seat-4-L.anchorYv)/(16+W_G*0.16)));
  // 测力计水平态
  L.hx=clamp(Math.round(W*0.40),L.meterH+70,Math.max(L.meterH+70,W-260));
  L.hy=L.seat-28;
}
var offCv=document.createElement('canvas'); offCv.width=8; offCv.height=8;
var offCtx=offCv.getContext('2d');
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl(); layout(); repositionPanels();
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
function toast(text){ state.toast={text:text,until:performance.now()+2600}; dirty=true; }
function drawToast(now){
  var t=state.toast;
  if(!t) return;
  if(now>t.until){ state.toast=null; return; }
  dirty=true;
  ctx.save();
  ctx.font='600 14px sans-serif';
  var tw=ctx.measureText(t.text).width+36;
  var tx=Math.round((W-tw)/2),ty=L.beamY+Math.round(H*0.05);
  ghostCard(tx,ty,tw,32);
  ctx.fillStyle='#334155'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(t.text,W/2,ty+16);
  ctx.restore();
}

/* ===== 场景① 形变研究所：交互 ===== */
function setTool(t){
  var E=state.e;
  if(E.relTw) return;                 // tween 中禁切换
  E.tool=t; E.force=E.ts[t].pull;
  var rng=document.getElementById('rng-force');
  if(rng) rng.value=String(E.force);
  syncForceLabel(); syncToolBtns(); updatePanelE(); dirty=true;
  if(window.playClick) playClick();
}
function syncToolBtns(){
  TOOLS.forEach(function(t){
    var b=document.getElementById('btn-tool-'+t);
    if(b) b.classList.toggle('on',state.e.tool===t);
  });
}
function syncForceLabel(){
  var g=document.getElementById('lbl-force-g'),el=document.getElementById('lbl-force');
  if(g) g.textContent=FORCE_CN[state.e.tool]+'（形变）';
  if(el) el.textContent=state.e.force+' %';
}
function onForce(){
  var E=state.e,ts=TS();
  if(E.relTw) return;
  E.force=+document.getElementById('rng-force').value;
  ts.pull=E.force;
  ts.def=ts.perm+(E.force/100)*(1-ts.perm);   // 形变=永久残留之上再叠加
  E.pulling=E.force>0;
  if(E.force>0){ E.pullT=performance.now(); E.released=false; E.restored=false; }
  syncForceLabel(); updatePanelE(); dirty=true;
}
function release(){
  var E=state.e,ts=TS();
  if(E.relTw) return;
  if(!E.released||ts.pull>0){
    // 松手：弹性体 def→0；橡皮泥 def 冻结=塑性；超限度弹簧 def→残留；玻璃瓶水柱回落
    var permNew=0;
    if(E.tool==='clay') permNew=ts.def;
    else if(E.tool==='spring'&&E.over&&E.pull>=OVER_PULL) permNew=ts.def*PERM_K;
    E.relTw={t0:performance.now(),tool:E.tool,from:ts.def,to:permNew};
    ts.pull=0; E.force=0;
    var rng=document.getElementById('rng-force'); if(rng) rng.value='0';
    syncForceLabel();
    if(window.playClick) playClick();
  }else{
    toast('现在'+FORCE_CN[E.tool]+'是 0，先拖滑杆让它形变，再点松手');
  }
  dirty=true;
}
function relFinish(tw){
  var E=state.e,tsd=E.ts[tw.tool];
  tsd.def=tw.to; tsd.perm=tw.to;
  E.relTw=null; E.released=true; E.lastTool=tw.tool;
  E.restored=(tw.to===0&&tw.tool!=='clay');
  if(tw.tool==='spring'&&tw.to>0) E.permanent=true;
  E.tried[tw.tool]=1; E.triedCount=Object.keys(E.tried).length;
  if(E.restored){ if(window.playMatch) playMatch(); }
  else if(window.playDrop) playDrop();
  updatePanelE(); dirty=true;
}
function onOver(){
  state.e.over=document.getElementById('chk-over').checked;
  if(state.e.over) toast('超限度开关已打开：拉力拉到 '+OVER_PULL+'% 以上再松手，弹簧会超过弹性限度、永久变形');
  dirty=true;
  if(window.playClick) playClick();
}
function resetE(){
  var E=state.e;
  TOOLS.forEach(function(t){ E.ts[t]={def:0,perm:0,pull:0}; });
  E.force=0; E.pulling=false; E.released=false; E.restored=false; E.permanent=false;
  E.lastTool=null; E.relTw=null; E.tried={}; E.triedCount=0;
  var rng=document.getElementById('rng-force'); if(rng) rng.value='0';
  syncForceLabel(); updatePanelE(); dirty=true;
}

/* ===== 场景① 绘制 ===== */
function drawStand(cx){   // 试验台架：底座+立杆+横梁（橡皮筋悬挂用）
  ctx.save();
  ctx.fillStyle='#9aa1ab'; ctx.strokeStyle='#7d838c'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(cx-70,L.seat-10,140,10,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(cx-6,L.beamY-6,12,L.seat-L.beamY-4,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(cx-110,L.beamY-14,220,10,3); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function stationLabel(){
  ctx.fillStyle='#8a7c66'; ctx.font='600 14px sans-serif'; ctx.textAlign='center';
  ctx.fillText('当前器材：'+TOOL_CN[state.e.tool],L.cx,L.beamY-26);
}
function verdictCardE(){
  var E=state.e;
  if(!E.released) return;
  var txt=E.restored?'松手后恢复原状 → 弹性':(E.lastTool==='clay'?'松手后不恢复 → 塑性形变':'超过弹性限度 → 永久变形');
  var col=E.restored?'#15803d':'#b91c1c';
  var vy=Math.min(L.seat+16,H-ctrlBandH-46);
  ghostCard(L.cx-130,vy,260,28);
  ctx.fillStyle=col; ctx.font='600 13px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
  ctx.fillText(txt,L.cx,vy+19);
}
function drawSpringTool(){
  var st=defOf('spring'),len=L.springLen,cx=L.cx;
  var sx=Math.round(cx-len*0.55),sy=L.seat+12;
  var g=PROPS.spring_horizontal(ctx,sx,sy,{stretch:st,len:len,h:80});
  if(st>0.01){   // 拉力箭头：拉环向右
    var aLen=22+st*70;
    drawArrow(g.ring.x+9,g.ring.y,g.ring.x+9+aLen,g.ring.y,'#dc2626',4);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F 拉',g.ring.x+14+aLen*0.5,g.ring.y-10);
  }
  // 原长位置虚线（自然长右端）
  var x0=sx+Math.max(8,80*0.16)/2+4, xNat=x0+len+7;
  ctx.save(); ctx.strokeStyle='rgba(37,99,235,.6)'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(xNat,g.axisY-26); ctx.lineTo(xNat,g.axisY+26); ctx.stroke(); ctx.restore();
  ctx.fillStyle='#2563eb'; ctx.font='11px sans-serif'; ctx.textAlign='center';
  ctx.fillText('原长位置',xNat,g.axisY-32);
  if(state.e.ts.spring.perm>0||st>0.01){
    var xCur=g.ring.x;
    if(Math.abs(xCur-xNat)>6){
      ctx.save(); ctx.strokeStyle='#16a34a'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(xNat,g.axisY+34); ctx.lineTo(xCur,g.axisY+34); ctx.stroke(); ctx.restore();
      ctx.fillStyle='#16a34a'; ctx.font='600 11px sans-serif'; ctx.textAlign='center';
      ctx.fillText(state.e.ts.spring.perm>0?'松手后没回去：永久变形':'伸长',(xNat+xCur)/2,g.axisY+48);
    }
  }
  if(state.e.over&&state.e.tool==='spring'&&state.e.ts.spring.pull>=OVER_PULL){
    ctx.fillStyle='#b91c1c'; ctx.font='700 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('⚠ 已超过弹性限度！',L.cx,L.beamY-8);
  }
}
function drawRulerTool(){
  var b=defOf('ruler'),cx=L.cx,len=L.rulerLen;
  var x0=cx-len/2,y0=L.seat-24;
  ctx.save();   // 垫块（夹持台）
  ctx.fillStyle='#b08a5a'; ctx.strokeStyle='#8a6a42'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(x0-16,y0-4,34,L.seat-y0+4,3); ctx.fill(); ctx.stroke();
  ctx.restore();
  var g=PROPS.ruler_flex(ctx,x0,y0,{bend:b,len:len});
  if(b>0.02){
    var aLen=18+b*56;
    drawArrow(g.tip.x,g.tip.y-24,g.tip.x,g.tip.y-24+aLen,'#dc2626',4);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F 压',g.tip.x+10,g.tip.y-14+aLen*0.6);
  }
}
function drawBandTool(){
  var st=defOf('band'),cx=L.cx;
  drawStand(cx);
  var armY=L.beamY+Math.round((L.seat-L.beamY)*0.42);
  var w0=Math.min(110,Math.round(W*0.12));
  var wb=w0*(1+0.9*st);
  ctx.save();   // 中柱
  ctx.fillStyle='#9aa1ab'; ctx.strokeStyle='#7d838c'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(cx-6,armY-4,12,L.seat-armY+4,3); ctx.fill(); ctx.stroke();
  ctx.restore();
  var cyB=armY+Math.round(w0*0.21*(1-0.45*st))+8;
  PROPS.rubber_band(ctx,cx,cyB,{stretch:st,w:w0});
  if(st>0.02){   // 两侧向外拉箭头
    var aLen=16+st*48;
    drawArrow(cx-wb/2-4,cyB,cx-wb/2-4-aLen,cyB,'#dc2626',4);
    drawArrow(cx+wb/2+4,cyB,cx+wb/2+4+aLen,cyB,'#dc2626',4);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('F 拉',cx-wb/2-aLen*0.5,cyB-10);
    ctx.fillText('F 拉',cx+wb/2+aLen*0.5,cyB-10);
  }
}
function drawClayTool(){
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
function drawBottleTool(){
  var sq=defOf('bottle'),cx=L.cx,bw=L.bottleW,bh=L.bottleH,by=L.bottleY;
  var r=PROPS.glass_bottle_tube(ctx,cx,by,bw,bh,{squeeze:sq});
  var bodyCy=by-bh*0.28;
  // 原水面基线（蓝虚线）
  ctx.save(); ctx.strokeStyle='rgba(37,99,235,.7)'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(cx-bw*0.85,L.bottleBase); ctx.lineTo(cx+bw*0.85,L.bottleBase); ctx.stroke(); ctx.restore();
  ctx.fillStyle='#2563eb'; ctx.font='11px sans-serif'; ctx.textAlign='left';
  ctx.fillText('原水面',cx+bw*0.9,L.bottleBase+4);
  // 当前水柱顶面（绿虚线，实时联动）
  if(sq>0.01){
    ctx.save(); ctx.strokeStyle='#16a34a'; ctx.lineWidth=1.8; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(cx-bw*0.85,r.waterTopY); ctx.lineTo(cx+bw*0.85,r.waterTopY); ctx.stroke(); ctx.restore();
    ctx.fillStyle='#16a34a'; ctx.font='600 11px sans-serif'; ctx.textAlign='left';
    ctx.fillText('水柱顶面',cx+bw*0.9,r.waterTopY+4);
    // 上升幅度双箭头
    var mx=cx-bw*0.62;
    ctx.save(); ctx.strokeStyle='#b91c1c'; ctx.fillStyle='#b91c1c'; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(mx,r.waterTopY+3); ctx.lineTo(mx,L.bottleBase-3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx,r.waterTopY+3); ctx.lineTo(mx-3.5,r.waterTopY+9); ctx.lineTo(mx+3.5,r.waterTopY+9); ctx.closePath(); ctx.fill();
    ctx.font='600 11px sans-serif'; ctx.textAlign='right';
    ctx.fillText('水柱上升',mx-6,(r.waterTopY+L.bottleBase)/2);
    ctx.restore();
  }
  // 捏力箭头（两侧向内，实时随捏力变长）
  if(sq>0.02){
    var aLen=14+sq*34,ex=bw*0.5+6;
    drawArrow(cx-ex-aLen-8,bodyCy,cx-ex,bodyCy,'#dc2626',4);
    drawArrow(cx+ex+aLen+8,bodyCy,cx+ex,bodyCy,'#dc2626',4);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('捏',cx-ex-aLen*0.5-8,bodyCy-12);
    ctx.fillText('捏',cx+ex+aLen*0.5+8,bodyCy-12);
  }
}
function drawElasticScene(){
  var E=state.e;
  stationLabel();
  if(E.tool==='spring') drawSpringTool();
  else if(E.tool==='ruler') drawRulerTool();
  else if(E.tool==='band') drawBandTool();
  else if(E.tool==='clay') drawClayTool();
  else drawBottleTool();
  verdictCardE();
}

/* ===== 场景② 测力计工作台：显示读数 ===== */
function oscVal(sc,now){
  if(!sc.osc) return 0;
  var t=(now-sc.osc.t0)/1000;
  if(t*1000>=OSC_LIFE){ sc.osc=null; sc.settled=true; updatePanelM(); return 0; }
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
  state.s.feel=null; updatePanelM();
  return null;
}
function displayNow(now){
  var sc=SC(),fv=feelVal(now);
  if(fv!=null) return clamp(fv,0,F_MAX);
  return clamp(forceOf(sc)+sc.off+oscVal(sc,now),0,F_MAX);
}
/* 刻度窗指针位置（局部坐标同 spring_meter 件公式）：v 态=世界 y 偏移，h 态=世界 x 偏移 */
function ptrLocal(v){
  var Hm=L.meterH,winT=-Hm*0.805,winB=-Hm*0.14;
  return winT+(winB-winT)*(clamp(v,0,F_MAX)/F_MAX);
}

/* ===== 场景② 交互 ===== */
function setOrient(o){
  if(state.s.orient===o) return;
  state.s.orient=o; state.s.feel=null;
  syncOrientBtns(); repositionPanels(); updatePanelM(); dirty=true;
  if(window.GUIDE_SCENE&&window.GUIDE_SCENE.change) window.GUIDE_SCENE.change();
  if(window.playClick) playClick();
}
function syncOrientBtns(){
  var v=document.getElementById('btn-orient-v'),h=document.getElementById('btn-orient-h');
  if(v) v.classList.toggle('on',state.s.orient==='v');
  if(h) h.classList.toggle('on',state.s.orient==='h');
}
function addWeight(){
  var S=state.s,sc=S.v,now=performance.now();
  if(S.orient!=='v') return;
  S.feel=null;
  var cap=Math.min(5,L.maxFit);
  if(sc.count>=cap){
    toast(sc.count>=5?'最多挂 5 个钩码（4.9N），再挂就超量程啦':'桌面放不下更多钩码了，先减一个');
    if(window.playDrop) playDrop();
    return;
  }
  sc.count++;
  sc.settled=false;
  sc.osc={t0:now,A:Math.min(0.5,0.22+W_G/1000*G_VAL*0.10)};
  updatePanelM(); dirty=true;
  if(window.playClick) playClick();
}
function removeWeight(){
  var S=state.s,sc=S.v,now=performance.now();
  if(S.orient!=='v') return;
  S.feel=null;
  if(!sc.count){ toast('挂钩上已经没有钩码啦'); return; }
  sc.count--;
  sc.settled=false;
  sc.osc={t0:now,A:0.25};
  updatePanelM(); dirty=true;
  if(window.playDrop) playDrop();
}
function onMeterPull(){
  var S=state.s,sc=S.h,now=performance.now();
  if(S.orient!=='h') return;
  S.feel=null;
  var val=(+document.getElementById('rng-mpull').value)/10;
  if(val+sc.off>F_MAX){   // 超量程拦截（e1 语音闸）
    S.overload=true; S.overloadT=now;
    var ok=Math.max(0,Math.round((F_MAX-sc.off)*10));
    document.getElementById('rng-mpull').value=String(ok);
    syncMPullLabel();
    updatePanelM(); dirty=true;
    if(window.playDrop) playDrop();
    return;
  }
  sc.pull=val;
  syncMPullLabel(); updatePanelM(); dirty=true;
}
function syncMPullLabel(){
  var el=document.getElementById('lbl-mpull');
  if(el) el.textContent=fmt((+document.getElementById('rng-mpull').value)/10,1)+' N';
}
function zeroAdjust(){
  var sc=SC(),now=performance.now();
  state.s.feel=null;
  if(sc.zeroed){ toast('已经调过零啦，指针正指 0 刻度'); return; }
  sc.zeroTw={t0:now,from:sc.off,to:0};
  toast('调零完成：指针对齐 0 刻度，之后的读数才准');
  dirty=true;
  if(window.playClick) playClick();
}
function feel(n){
  var S=state.s,sc=SC(),now=performance.now();
  if(S.overload) return;
  var cur=clamp(forceOf(sc)+sc.off,0,F_MAX);
  S.feel={t0:now,from:cur,to:n,back:cur};
  S.feelUsed++;
  toast('这就是 '+n+' 牛的拉力，记住这个手感！');
  updatePanelM(); dirty=true;
  if(window.playClick) playClick();
}
function resetM(){
  var S=state.s;
  S.feelUsed=0; S.feel=null; S.overload=false; S.extTouched=false;
  S.v={count:0,off:ZERO_OFF.v,zeroed:false,settled:true,osc:null,zeroTw:null};
  S.h={pull:0,off:ZERO_OFF.h,zeroed:false,settled:true,osc:null,zeroTw:null};
  ['c1','c2','c3','c4'].forEach(function(k){ S.exam[k]={judged:false,wrong:0}; });
  S.examDone=0; S.examOpen=false;
  var rng=document.getElementById('rng-mpull'); if(rng) rng.value='0';
  syncMPullLabel(); syncExamDom(); closeExam(false);
  updatePanelM(); dirty=true;
}
function resetAll(){ resetE(); resetM(); }

/* ===== 场景② 绘制 ===== */
function drawStandV(){
  ctx.save();
  ctx.fillStyle='#9aa1ab'; ctx.strokeStyle='#7d838c'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(L.cx-70,L.seat-10,140,10,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(L.cx-L.meterH*0.105-24,L.beamY-6,12,L.seat-L.beamY-4,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(L.cx-L.meterH*0.105-60,L.beamY-14,L.meterH*0.105+76,10,3); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function drawWeights(hookX,hookY,count){
  var y=hookY,wgh=16+W_G*0.16;
  for(var i=0;i<count;i++){ y+=wgh; PROPS.hook_weight(ctx,hookX,y,{g:W_G}); }
  return y;
}
function drawRefLinesV(disp){   // 原长虚线参考线+当前位置线（伸长量显式化，常显）
  var bw=L.meterH*0.21;
  var xR=L.cx-bw/2-6,xL=xR-64;
  var p0=L.anchorYv+ptrLocal(0),pE=L.anchorYv+ptrLocal(disp);
  ctx.save(); ctx.lineWidth=1.6;
  ctx.strokeStyle='#2563eb'; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(xL,p0); ctx.lineTo(xR,p0); ctx.stroke();
  ctx.setLineDash([]); ctx.fillStyle='#2563eb'; ctx.font='11px sans-serif'; ctx.textAlign='right';
  ctx.fillText('原长位置（0刻度）',xR,p0-5);
  if(Math.abs(pE-p0)>3){
    ctx.strokeStyle='#16a34a'; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(xL,pE); ctx.lineTo(L.cx+bw/2+64,pE); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle='#16a34a'; ctx.textAlign='left';
    ctx.fillText('当前位置（伸长了）',L.cx+bw/2+6,pE-5);
    // 伸长量双向箭头
    var ax=xL+10;
    ctx.strokeStyle='#b45309'; ctx.fillStyle='#b45309'; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(ax,p0+2); ctx.lineTo(ax,pE-2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax,pE-2); ctx.lineTo(ax-3.5,pE-8); ctx.lineTo(ax+3.5,pE-8); ctx.closePath(); ctx.fill();
    ctx.font='600 11px sans-serif'; ctx.textAlign='left';
    ctx.fillText('伸长量',ax+5,(p0+pE)/2+4);
  }
  ctx.restore();
}
function drawRefLinesH(disp){
  var bw=L.meterH*0.21;
  var yT=L.hy-bw/2-20,yB=L.hy+bw/2+20;
  var p0=L.hx+ptrLocal(0),pE=L.hx+ptrLocal(disp);
  ctx.save(); ctx.lineWidth=1.6;
  ctx.strokeStyle='#2563eb'; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(p0,yT); ctx.lineTo(p0,yB); ctx.stroke();
  ctx.setLineDash([]); ctx.fillStyle='#2563eb'; ctx.font='11px sans-serif'; ctx.textAlign='center';
  ctx.fillText('原长位置（0刻度）',p0,yT-5);
  if(Math.abs(pE-p0)>3){
    ctx.strokeStyle='#16a34a'; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(pE,yT); ctx.lineTo(pE,yB); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle='#16a34a';
    ctx.fillText('当前位置',pE,yB+13);
  }
  ctx.restore();
}
function drawReadCard(x,y,disp,sc){
  ghostCard(x-100,y,200,48);
  ctx.fillStyle='#1e293b'; ctx.font='600 13px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
  var txt=sc.settled?('读数 F = '+fmt(disp,2)+' N'):('指针振荡中… 停稳再读');
  ctx.fillText(txt,x,y+19);
  ctx.fillStyle='#64748b'; ctx.font='11px sans-serif';
  ctx.fillText('量程 0～5N · 分度值 0.2N',x,y+38);
  if(!sc.zeroed&&!state.s.feel){
    ctx.fillStyle='#b91c1c'; ctx.font='600 12px sans-serif';
    ctx.fillText('⚠ 指针未调零',x,y+62);
  }
}
function drawMeterV(now){
  var sc=SC(),disp=displayNow(now);
  drawStandV();
  var g=PROPS.spring_meter(ctx,L.cx,L.anchorYv,{reading:disp,h:L.meterH,orientation:'v'});
  drawWeights(g.hook.x,g.hook.y,sc.count);
  drawRefLinesV(disp);
  if(state.s.feel){   // 感受拉力：钩下红箭头
    var y0=(sc.count?L.anchorYv+sc.count*(16+W_G*0.16):g.hook.y)+8;
    drawArrow(L.cx,y0,L.cx,y0+34+disp*10,'#dc2626',4.5);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F = '+fmt(disp,1)+' N（手拉感受）',L.cx+12,y0+30);
  }
  drawReadCard(L.cx+Math.round(L.meterH*0.105)+118,L.beamY+8,disp,sc);
}
function drawMeterH(now){
  var sc=SC(),disp=displayNow(now);
  var bw=L.meterH*0.21,bx=L.hx-L.meterH*0.475;   // 壳体中心世界 x
  ctx.save();   // 木垫块支撑壳体
  ctx.fillStyle='#b08a5a'; ctx.strokeStyle='#8a6a42'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(bx-bw*0.45,L.hy+bw/2,bw*0.9,L.seat-L.hy-bw/2,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(bx-bw*0.75,L.seat-8,bw*1.5,8,2); ctx.fill(); ctx.stroke();
  ctx.restore();
  var g=PROPS.spring_meter(ctx,L.hx,L.hy,{reading:disp,h:L.meterH,orientation:'h'});
  // 绳+木块（拖力实时联动：弹簧伸长→木块右移）
  var blkW=70,blkH=44,blkX=L.hx+64+disp*5,blkY=L.seat-blkH;
  ctx.save();
  ctx.strokeStyle='#5b6068'; ctx.lineWidth=2.4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(g.hook.x,g.hook.y); ctx.lineTo(blkX,blkY+blkH*0.42); ctx.stroke();
  var gW=ctx.createLinearGradient(0,blkY,0,blkY+blkH);
  gW.addColorStop(0,'#c89b6a'); gW.addColorStop(1,'#a2764a');
  ctx.fillStyle=gW; ctx.strokeStyle='#7c5a34'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.roundRect(blkX,blkY,blkW,blkH,5); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='rgba(124,90,52,.5)'; ctx.lineWidth=1;   // 木纹
  ctx.beginPath(); ctx.moveTo(blkX+8,blkY+14); ctx.lineTo(blkX+blkW-8,blkY+14);
  ctx.moveTo(blkX+8,blkY+30); ctx.lineTo(blkX+blkW-8,blkY+30); ctx.stroke();
  ctx.fillStyle='#5b4630'; ctx.font='600 11px sans-serif'; ctx.textAlign='center';
  ctx.fillText('木块',blkX+blkW/2,blkY+blkH/2+4);
  ctx.restore();
  // 拖力箭头（水平向右，长度∝读数）
  drawArrow(blkX+blkW+6,blkY+blkH*0.42,blkX+blkW+6+30+disp*12,blkY+blkH*0.42,'#dc2626',4.5);
  ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  ctx.fillText('F 拖 = '+fmt(disp,1)+' N',blkX+blkW+12,blkY-8);
  drawRefLinesH(disp);
  drawReadCard(L.hx-L.meterH*0.5,L.hy-bw/2-74,disp,sc);
  ctx.fillStyle='#8a7c66'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('水平使用：先重新调零，再沿水平方向匀速拖木块',L.hx-L.meterH*0.15,L.beamY+14);
}
function drawMeterScene(now){
  if(state.s.orient==='v') drawMeterV(now);
  else drawMeterH(now);
  if(state.s.overload){   // 超量程红闪警示框
    var a=0.35+0.35*Math.sin(now/120);
    ctx.save(); ctx.strokeStyle='rgba(220,38,38,'+a.toFixed(2)+')'; ctx.lineWidth=5;
    ctx.strokeRect(3,3,W-6,H-6); ctx.restore();
    ghostCard(W/2-170,L.beamY+Math.round(H*0.06),340,30);
    ctx.fillStyle='#b91c1c'; ctx.font='600 14px sans-serif'; ctx.textAlign='center';
    ctx.fillText('超过量程 5N！会损坏测力计，快把拖力减回 5N 以内',W/2,L.beamY+Math.round(H*0.06)+20);
  }
}

/* ===== 飞入飞出场景切换 ===== */
function flyTo(to){
  if(state.fly||state.mode===to) return;
  state.fly={t0:performance.now(),from:state.mode,to:to,swapped:false};
  if(window.playClick) playClick();
  dirty=true;
}
function flyTick(now){
  var f=state.fly;
  if(!f) return false;
  if(!f.swapped&&now-f.t0>=FLY_MS/2){
    f.swapped=true;
    state.mode=f.to;
    syncModeUI(); repositionPanels();
  }
  dirty=true;
  if(now-f.t0>=FLY_MS){ state.fly=null; }
  return true;
}
function syncModeUI(){
  var m=state.mode;
  document.body.classList.toggle('mode-elastic',m==='elastic');
  document.body.classList.toggle('mode-meter',m==='meter');
  var fly=document.getElementById('btn-fly');
  if(fly) fly.textContent=m==='elastic'?'去测力计工作台 ➡️':'⬅️ 回形变研究所';
  var panE=document.getElementById('panel-read-e'),panM=document.getElementById('panel-read-m');
  if(panE) panE.classList.toggle('show',openP==='read'&&m==='elastic');
  if(panM) panM.classList.toggle('show',openP==='read'&&m==='meter');
}

/* ===== 主绘制 ===== */
function render(now){
  var f=state.fly,xoff=0;
  if(f){
    var p=clamp((now-f.t0)/FLY_MS,0,1);
    xoff=p<0.5?-W*easeOut(p*2):W*(1-easeOut((p-0.5)*2));
  }
  ctx.fillStyle=state.mode==='elastic'?'#fdfcf7':'#eef2f6';
  ctx.fillRect(0,0,W,H);
  ctx.save();
  ctx.translate(xoff,0);
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  if(state.mode==='elastic') drawElasticScene();
  else drawMeterScene(now);
  drawToast(now);
  ctx.restore();
}
function draw(now){ ctx.clearRect(0,0,W,H); render(now); updatePanelE(); updatePanelM(); updatePanelExt(); }

/* ===== 松手/振荡/感受/调零/超量程 tick ===== */
function eTick(now){
  var tw=state.e.relTw;
  if(!tw) return false;
  var p=clamp((now-tw.t0)/REL_MS,0,1);
  state.e.ts[tw.tool].def=tw.from+(tw.to-tw.from)*easeOut(p);
  dirty=true;
  if(p>=1) relFinish(tw);
  return true;
}
function sTick(now){
  var S=state.s,sc=SC(),busy=false;
  if(sc.osc){ oscVal(sc,now); busy=true; }
  if(S.feel){ feelVal(now); busy=true; }
  if(sc.zeroTw){
    var p=clamp((now-sc.zeroTw.t0)/300,0,1);
    sc.off=sc.zeroTw.from+(sc.zeroTw.to-sc.zeroTw.from)*easeOut(p);
    if(p>=1){ sc.zeroTw=null; sc.zeroed=true; sc.off=0; updatePanelM(); }
    busy=true;
  }
  if(S.overload&&now-S.overloadT>OVERLOAD_MS){ S.overload=false; updatePanelM(); }
  if(S.overload) busy=true;
  if(!sc.settled&&!sc.osc){ sc.settled=true; updatePanelM(); }
  return busy;
}

/* ===== 读数面板（幽灵化 pickSlot） ===== */
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
  var rects=[{x:0,y:H-ctrlBandH,w:W,h:ctrlBandH+40}];
  if(state.mode==='elastic'){
    rects.push({x:L.cx-160,y:L.beamY-40,w:320,h:L.seat-L.beamY+60});
  }else if(state.s.orient==='v'){
    rects.push({x:L.cx-L.meterH*0.3,y:L.beamY-20,w:L.meterH*0.6+40,h:L.seat-L.beamY+40});
  }else{
    rects.push({x:L.hx-L.meterH-30,y:L.hy-L.meterH*0.21,w:L.meterH+80,h:L.seat-L.hy+60});
  }
  if(state.mode==='meter'){
    var ext=document.getElementById('panel-ext');
    if(ext) rects.push({x:ext.offsetLeft,y:ext.offsetTop,w:ext.offsetWidth,h:ext.offsetHeight});
  }
  return rects;
}
function placePanel(el,defW,defH){
  if(!el) return;
  var slot=pickSlot(el.offsetWidth||defW,el.offsetHeight||defH,sceneAvoidRects());
  el.style.left=slot.x+'px'; el.style.top=slot.y+'px';
}
var openP=null;
function repositionPanels(){
  if(openP==='read'){
    placePanel(document.getElementById('panel-read-e'),240,120);
    placePanel(document.getElementById('panel-read-m'),250,150);
  }
  if(state.mode==='meter') placePanel(document.getElementById('panel-ext'),230,110);
}
function openPanel(){
  openP=(openP==='read')?null:'read';
  var m=state.mode;
  var pe=document.getElementById('panel-read-e'),pm=document.getElementById('panel-read-m');
  if(pe) pe.classList.toggle('show',openP==='read'&&m==='elastic');
  if(pm) pm.classList.toggle('show',openP==='read'&&m==='meter');
  document.getElementById('btn-table').classList.toggle('on',openP==='read');
  if(openP==='read'){ updatePanelE(); updatePanelM(); repositionPanels(); }
}
function setText(id,t){ var el=document.getElementById(id); if(el&&el.textContent!==t) el.textContent=t; }
function updatePanelE(){
  if(state.mode!=='elastic') return;
  var E=state.e,ts=TS();
  setText('rd-tool',TOOL_CN[E.tool]);
  setText('rd-force',FORCE_CN[E.tool]+' '+E.force+' %');
  setText('rd-def',Math.round(ts.def*100)+' %');
  var after='—';
  if(E.released) after=E.restored?'恢复原状（弹性）':(E.lastTool==='clay'?'塑性形变（不恢复）':'永久变形（超弹性限度）');
  setText('rd-after',after);
}
function updatePanelM(){
  if(state.mode!=='meter') return;
  var S=state.s,sc=SC(),now=performance.now();
  setText('rd-orient',S.orient==='v'?'竖直挂钩码':'水平拖木块');
  setText('rd-load',S.orient==='v'?(sc.count+' 个钩码（'+sc.count*W_G+' g）'):('拖力 '+fmt(sc.pull,1)+' N'));
  var F=forceOf(sc),fv=S.feel?feelVal(now):null;
  setText('rd-f',fmt(F,2)+' N');
  setText('rd-read',fmt(fv!=null?fv:clamp(F+sc.off,0,F_MAX),2)+' N'+(sc.zeroed?'':'（含零位偏差）'));
  var st=S.overload?'超量程拦截！':(sc.settled?(sc.zeroed?'已调零 · 可读数':'未调零 · 读数不准'):'振荡中 · 停稳再读');
  setText('rd-status',st);
}
function updatePanelExt(){
  if(state.mode!=='meter') return;
  var disp=displayNow(performance.now());
  var dL=EXT_K*disp;
  setText('ext-l0',fmt(EXT_L0,1)+' cm');
  setText('ext-l',fmt(EXT_L0+dL,1)+' cm');
  setText('ext-dl',fmt(dL,1)+' cm');
}

/* ===== 考官角落 ===== */
var EXAM_REASON={
  c1:'没调零就测量：指针不在零刻度，读出来的数混着零位偏差，不是真实的力。先调零，再测量。',
  c2:'超量程硬拉：超过 5N 弹簧会被拉坏，超过弹性限度就回不来了。测量前先看量程。',
  c3:'斜着拉挂钩：弹簧轴线方向和力的方向不一致，读数会偏小，还容易让指针卡壳。要沿测力计的轴线方向拉。',
  c4:'倒挂拉外壳：外壳自重会混进读数，测出的力偏大，也不方便调零读数。要正挂使用、沿轴线方向拉。'
};
var EXAM_NAME={c1:'① 未调零就测',c2:'② 超量程硬拉',c3:'③ 斜着拉挂钩',c4:'④ 倒挂拉外壳'};
function drawExamCanvases(){
  function c2d(id){ var c=document.getElementById(id); return c?c.getContext('2d'):null; }
  // 卡1：未调零（指针偏零+红圈点破）
  var a=c2d('xc-c1-cv');
  if(a){
    a.clearRect(0,0,160,130);
    var r1=PROPS.spring_meter(a,74,120,{reading:0.45,h:100});
    a.save(); a.strokeStyle='#dc2626'; a.lineWidth=2;
    a.beginPath(); a.arc(r1.reading.x,r1.reading.y,8,0,Math.PI*2); a.stroke();
    a.fillStyle='#dc2626'; a.font='600 11px sans-serif'; a.textAlign='left';
    a.fillText('指针没指0',r1.reading.x+11,r1.reading.y+4);
    a.restore();
  }
  // 卡2：超量程硬拉（指针打满+大拉力箭头）
  var b=c2d('xc-c2-cv');
  if(b){
    b.clearRect(0,0,160,130);
    PROPS.spring_meter(b,80,104,{reading:5,h:88});
    drawArrowOn(b,80,106,80,126,'#dc2626',4);
    b.fillStyle='#dc2626'; b.font='700 11px sans-serif'; b.textAlign='center';
    b.fillText('使劲拉过 5N',80,20);
  }
  // 卡3：斜着拉挂钩
  var c=c2d('xc-c3-cv');
  if(c){
    c.clearRect(0,0,160,130);
    var r3=PROPS.spring_meter(c,64,100,{reading:2,h:84});
    drawArrowOn(c,r3.hook.x,r3.hook.y,r3.hook.x+42,r3.hook.y+20,'#dc2626',4);
    c.fillStyle='#dc2626'; c.font='600 11px sans-serif'; c.textAlign='left';
    c.fillText('斜拉',r3.hook.x+44,r3.hook.y+16);
  }
  // 卡4：倒挂拉壳（测力计旋转180°，顶环朝下，手拉外壳）
  var d=c2d('xc-c4-cv');
  if(d){
    d.clearRect(0,0,160,130);
    d.save(); d.translate(80,16); d.rotate(Math.PI);
    PROPS.spring_meter(d,0,0,{reading:2,h:84});
    d.restore();
    // 倒置后壳体占 y 16..100，顶环在世界 (80, ≈98)：从环下方画向下拉壳箭头
    drawArrowOn(d,80,102,80,122,'#dc2626',4);
    d.fillStyle='#dc2626'; d.font='600 11px sans-serif'; d.textAlign='left';
    d.fillText('拉外壳',92,118);
  }
}
function drawArrowOn(c,x0,y0,x1,y1,color,lw){
  var dx=x1-x0,dy=y1-y0,dd=Math.hypot(dx,dy); if(dd<3) return;
  var ux=dx/dd,uy=dy/dd,hd=Math.max(6,dd*0.3);
  c.save(); c.strokeStyle=color; c.fillStyle=color; c.lineWidth=lw||3; c.lineCap='round';
  c.beginPath(); c.moveTo(x0,y0); c.lineTo(x1-ux*hd*0.8,y1-uy*hd*0.8); c.stroke();
  c.beginPath(); c.moveTo(x1,y1);
  c.lineTo(x1-ux*hd-uy*hd*0.5,y1-uy*hd+ux*hd*0.5);
  c.lineTo(x1-ux*hd+uy*hd*0.5,y1-uy*hd-ux*hd*0.5);
  c.closePath(); c.fill(); c.restore();
}
function syncExamDom(){
  var S=state.s;
  ['c1','c2','c3','c4'].forEach(function(k){
    var card=document.getElementById('xc-'+k); if(!card) return;
    var ex=S.exam[k];
    card.classList.toggle('done',ex.judged);
    var fb=card.querySelector('.xc-fb');
    if(fb) fb.textContent=ex.judged?EXAM_REASON[k]:'';
    card.querySelectorAll('.xc-btns button').forEach(function(b){ b.disabled=ex.judged; });
  });
  setText('exam-score','已抓到 '+S.examDone+' / 4 只虫子');
  var done=document.getElementById('exam-done');
  if(done) done.style.display=S.examDone>=4?'block':'none';
}
function judgeExam(k,ok){
  var S=state.s,ex=S.exam[k];
  if(ex.judged) return;
  var card=document.getElementById('xc-'+k); if(!card) return;
  var fb=card.querySelector('.xc-fb');
  if(ok){   // 判「有错误」= 判对
    ex.judged=true; S.examDone++;
    if(window.playMatch) playMatch();
    syncExamDom(); dirty=true;
  }else{    // 判「操作正确」= 判错
    ex.wrong++;
    if(fb) fb.textContent='再想想：'+EXAM_NAME[k]+'这种做法藏着错误，仔细看看图示再判一次。';
    card.classList.add('shake');
    setTimeout(function(){ card.classList.remove('shake'); },500);
    if(window.playDrop) playDrop();
  }
}
function openExam(){
  state.s.examOpen=true;
  var ov=document.getElementById('exam-overlay');
  if(ov) ov.classList.add('show');
  syncExamDom();
  if(window.playClick) playClick();
}
function closeExam(sync){
  state.s.examOpen=false;
  var ov=document.getElementById('exam-overlay');
  if(ov) ov.classList.remove('show');
  if(sync!==false&&window.playClick) playClick();
}

/* ===== 控制栏接线 ===== */
TOOLS.forEach(function(t){
  var b=document.getElementById('btn-tool-'+t);
  if(b) b.addEventListener('click',function(){ setTool(t); });
});
var rngForce=document.getElementById('rng-force');
if(rngForce){ rngForce.addEventListener('input',onForce); rngForce.addEventListener('change',onForce); }
var btnRelease=document.getElementById('btn-release');
if(btnRelease) btnRelease.addEventListener('click',release);
var chkOver=document.getElementById('chk-over');
if(chkOver) chkOver.addEventListener('change',onOver);
var btnFly=document.getElementById('btn-fly');
if(btnFly) btnFly.addEventListener('click',function(){ flyTo(state.mode==='elastic'?'meter':'elastic'); });
var bov=document.getElementById('btn-orient-v'),boh=document.getElementById('btn-orient-h');
if(bov) bov.addEventListener('click',function(){ setOrient('v'); });
if(boh) boh.addEventListener('click',function(){ setOrient('h'); });
var baw=document.getElementById('btn-addw'),brw=document.getElementById('btn-remw');
if(baw) baw.addEventListener('click',addWeight);
if(brw) brw.addEventListener('click',removeWeight);
var rngM=document.getElementById('rng-mpull');
if(rngM){ rngM.addEventListener('input',onMeterPull); rngM.addEventListener('change',onMeterPull); }
var bz=document.getElementById('btn-zero');
if(bz) bz.addEventListener('click',zeroAdjust);
var f1=document.getElementById('btn-feel1'),f3=document.getElementById('btn-feel3'),f5=document.getElementById('btn-feel5');
if(f1) f1.addEventListener('click',function(){ feel(1); });
if(f3) f3.addEventListener('click',function(){ feel(3); });
if(f5) f5.addEventListener('click',function(){ feel(5); });
var bex=document.getElementById('btn-exam');
if(bex) bex.addEventListener('click',openExam);
var bexc=document.getElementById('btn-exam-close');
if(bexc) bexc.addEventListener('click',function(){ closeExam(); });
['c1','c2','c3','c4'].forEach(function(k){
  var card=document.getElementById('xc-'+k); if(!card) return;
  var bo=card.querySelector('[data-ok]'),bb=card.querySelector('[data-bad]');
  if(bo) bo.addEventListener('click',function(){ judgeExam(k,false); });
  if(bb) bb.addEventListener('click',function(){ judgeExam(k,true); });
});
var extP=document.getElementById('panel-ext');
if(extP) extP.addEventListener('click',function(){
  if(!state.s.extTouched){ state.s.extTouched=true; }
  extP.classList.add('touched');
  if(window.playClick) playClick();
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
  var now=performance.now(); lastNow=now;
  var busy=eTick(now)||flyTick(now);
  busy=sTick(now)||busy;
  if(state.toast&&now>state.toast.until){ state.toast=null; dirty=true; }
  if(state.toast) dirty=true;
  if(busy||dirty){ dirty=false; draw(now); }
  requestAnimationFrame(tick);
}
layout(); resize(); syncToolBtns(); syncForceLabel(); syncOrientBtns(); syncMPullLabel();
syncModeUI(); drawExamCanvases(); syncExamDom(); updatePanelE(); updatePanelM(); updatePanelExt();
draw(performance.now());
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); repositionPanels(); dirty=true; }).observe(ctrlEl);
}
requestAnimationFrame(tick);
window.__c7dbg={
  get state(){ return state; }, get W(){ return W; }, get H(){ return H; }, get layout(){ return L; },
  setTool:setTool, release:release, flyTo:flyTo, addWeight:addWeight, removeWeight:removeWeight,
  zero:zeroAdjust, feel:feel, setOrient:setOrient, openExam:openExam, judgeExam:judgeExam, reset:resetAll
};
})();

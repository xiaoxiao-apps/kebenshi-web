/* exp-gravity-core.js — c7s3 E6 重力质量关系探究馆（单场景，浅蓝灰亮底+图表白区）
   物理语义：G=mg（g=9.8 N/kg，粗略档 10）；钩码步进挂→短振荡停稳→点记录入表→G-m 图实时描点；
   ≥3 组数据 → 过原点拟合 k=Σ(Gm)/Σ(m²) ≈ g，出结论牌；分矢量开关：重力G箭头（竖直向下）/拉力F箭头 */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var G_STD=9.8,G_ROUGH=10,F_MAX=5;
var OSC_TAU=0.22,OSC_HZ=2.2,OSC_LIFE=1500;   // 短振荡（同 E5 参数，≤1.5s 停稳）
var DESK_BAND=109;
var M_MMAX=0.55,G_GMAX=5.5;                  // G-m 图固定标度（kg / N）
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var hintEl=document.getElementById('hint');
var W=960,H=520,DPR=1,ctrlBandH=110,COMPACT_H=600,dirty=true;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(v,n){ return (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }
function easeOut(t){ return 1-Math.pow(1-t,3); }

var state={
  g10:false,vecG:true,vecF:true,
  stack:[],settled:true,osc:null,
  records:[],concluded:false,pendRecord:false
};
window.C7S3_STATE=state;
function gVal(){ return state.g10?G_ROUGH:G_STD; }
function stackG(){ var t=0; state.stack.forEach(function(g){ t+=g; }); return t; }
function massKg(){ return stackG()/1000; }
function forceNow(){ return massKg()*gVal(); }
function maxStackH(){ return PROPS.weightGeom(250).h*2+8; }

var L={};
function layout(){
  L.fy=H-ctrlBandH;
  L.by=Math.max(40,L.fy-DESK_BAND);
  L.seat=PROPS.seatY(L.by,64,26);
  L.beamY=Math.round(Math.max(H*0.10,44));
  L.meterH=clamp(Math.round(L.seat-L.beamY-maxStackH()-26),150,230);
  L.cx=Math.round(W*0.20);
  L.anchorY=L.beamY+L.meterH;
  var x0=Math.round(W*0.40),x1=Math.round(W*0.985),y0=Math.round(H*0.09),y1=L.by-16;
  var ymid=Math.round(y0+(y1-y0)*0.42);
  L.table={x0:x0,x1:x1,y0:y0,y1:ymid};
  L.graph={x0:x0,x1:x1,y0:ymid+10,y1:y1};
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
function oscVal(now){
  if(!state.osc) return 0;
  var t=(now-state.osc.t0)/1000;
  if(t*1000>=OSC_LIFE){
    state.osc=null; state.settled=true; updatePend(); dirty=true;
    return 0;
  }
  dirty=true;
  return state.osc.A*Math.exp(-t/OSC_TAU)*Math.cos(2*Math.PI*OSC_HZ*t);
}
function addWeight(g){
  var now=performance.now();
  var Fnew=(stackG()+g)/1000*gVal();
  if(Fnew>F_MAX){
    hintOverride='超过量程 5N 啦！这个钩码挂不上去，换小一点的';
    updateHint(); updatePanel(); dirty=true;
    if(window.playDrop) playDrop();
    return;
  }
  state.stack.push(g);
  state.settled=false; state.pendRecord=false;
  state.osc={t0:now,A:Math.min(0.5,0.22+g/1000*gVal()*0.10)};
  hintOverride='挂上 '+g+'g，指针停稳后点「记录」';
  updateHint(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
}
function removeWeight(){
  if(!state.stack.length){ hintOverride='钩上没有钩码啦'; updateHint(); return; }
  var now=performance.now();
  state.stack.pop();
  state.settled=false; state.pendRecord=false;
  state.osc={t0:now,A:0.25};
  updateHint(); updatePanel(); dirty=true;
  if(window.playDrop) playDrop();
}
function curUnrecorded(){   // 当前 (m,G) 是否已入表
  var m=massKg(),G=forceNow();
  return !state.records.some(function(r){ return Math.abs(r.m-m)<1e-9&&Math.abs(r.G-G)<1e-9; });
}
function updatePend(){
  state.pendRecord=state.settled&&state.stack.length>0&&curUnrecorded();
  updatePanel();
}
function record(){
  if(!state.settled){ hintOverride='指针还在振荡，停稳再记录'; updateHint(); return; }
  if(!state.stack.length){ hintOverride='先挂钩码，测出重力再记录'; updateHint(); return; }
  if(!curUnrecorded()){ hintOverride='这组数据已经记录过啦，换个钩码组合再记'; updateHint(); return; }
  state.records.push({m:massKg(),G:forceNow(),t:performance.now()});
  if(state.records.length>=3) state.concluded=true;
  state.pendRecord=false;
  hintOverride=state.concluded
    ?'结论出来啦：重力跟质量成正比，比值 g≈'+fmt(fitK(),1)+' N/kg'
    :'记下一组！继续挂钩码、继续记录，凑够 3 组看图上的规律';
  updateHint(); updatePanel(); dirty=true;
  if(window.playMatch) playMatch(); else if(window.playClick) playClick();
}
function clearRecords(){
  state.records=[]; state.concluded=false; state.pendRecord=false;
  updatePend(); updateHint(); dirty=true;
  if(window.playClick) playClick();
}
function fitK(){   // 过原点最小二乘：k=Σ(Gm)/Σ(m²)
  var smm=0,smg=0;
  state.records.forEach(function(r){ smm+=r.m*r.m; smg+=r.G*r.m; });
  return smm>0?smg/smm:0;
}
function resetAll(){
  state.stack=[]; state.settled=true; state.osc=null;
  state.records=[]; state.concluded=false; state.pendRecord=false;
  state.g10=false;
  var c=document.getElementById('chk-g10'); if(c) c.checked=false;
  updateHint(); updatePanel(); dirty=true;
}

/* ===== 绘制 ===== */
function drawStand(){
  var bw=L.meterH*0.21;
  ctx.save();
  ctx.fillStyle='#9aa1ab'; ctx.strokeStyle='#7d838c'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(L.cx-70,L.seat-10,140,10,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(L.cx-bw/2-26,L.beamY-6,12,L.seat-L.beamY-4,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(L.cx-bw/2-42,L.beamY-14,bw/2+58,10,3); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function drawStation(now){
  drawStand();
  var F=forceNow(),disp=clamp(F+oscVal(now),0,F_MAX);
  var g=PROPS.spring_meter(ctx,L.cx,L.anchorY,{reading:disp,h:L.meterH,orientation:'v'});
  // 钩码叠挂
  var y=g.hook.y;
  state.stack.forEach(function(w){
    var wh=PROPS.weightGeom(w);
    y+=wh.h;
    PROPS.hook_weight(ctx,L.cx,y,{g:w});
  });
  // 分矢量：拉力F（蓝，向上，钩处）+ 重力G（红，竖直向下，钩码组底部）
  if(state.vecF&&state.stack.length){
    drawArrow(g.hook.x+26,g.hook.y+16,g.hook.x+26,g.hook.y+16-30-F*7,'#2563eb',4);
    ctx.fillStyle='#2563eb'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F='+fmt(F,2)+'N',g.hook.x+34,g.hook.y-4);
  }
  if(state.vecG&&state.stack.length){
    drawArrow(L.cx-26,y+6,L.cx-26,y+6+30+F*7,'#dc2626',4.5);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='right';
    ctx.fillText('G='+fmt(F,2)+'N',L.cx-34,y+30);
  }
  // 读数牌
  ghostCard(L.cx+Math.round(L.meterH*0.105)+96,L.beamY+8,180,30);
  ctx.fillStyle='#1e293b'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText(state.settled?('G = '+fmt(F,2)+' N'):('指针振荡中… 停稳再读'),L.cx+Math.round(L.meterH*0.105)+186,L.beamY+27);
  if(state.pendRecord){
    ctx.fillStyle='#b45309'; ctx.font='600 12px sans-serif';
    ctx.fillText('● 有新数据待记录，点「记录」',L.cx+Math.round(L.meterH*0.105)+186,L.beamY+52);
  }
}
function drawTable(){
  var T=L.table,pw=T.x1-T.x0,ph=T.y1-T.y0;
  ghostCard(T.x0,T.y0,pw,ph);
  var cx=T.x0+12,cw=pw-24;
  var colX=[cx+6,cx+cw*0.34,cx+cw*0.62,cx+cw*0.98];
  ctx.save();
  ctx.fillStyle='#b45309'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  ctx.fillText('数据记录表（点「记录」入表）',cx,T.y0+20);
  var headY=T.y0+38;
  ctx.fillStyle='#64748b'; ctx.font='600 11px sans-serif';
  ctx.textAlign='left'; ctx.fillText('次数',colX[0],headY);
  ctx.textAlign='right'; ctx.fillText('m/kg',colX[1],headY);
  ctx.fillText('G/N',colX[2],headY); ctx.fillText('G÷m',colX[3],headY);
  ctx.strokeStyle='rgba(0,0,0,.14)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(cx,headY+5); ctx.lineTo(cx+cw,headY+5); ctx.stroke();
  if(!state.records.length){
    ctx.fillStyle='#94a3b8'; ctx.font='11px sans-serif'; ctx.textAlign='center';
    ctx.fillText('挂钩码 → 停稳 → 点「记录」',cx+cw/2,headY+24);
    ctx.restore(); return;
  }
  var rowH=Math.min(22,(T.y1-headY-12)/Math.max(5,state.records.length));
  state.records.forEach(function(r,i){
    var y=headY+18+i*rowH; if(y>T.y1-5) return;
    ctx.fillStyle='#1e293b'; ctx.font='11px sans-serif';
    ctx.textAlign='left'; ctx.fillText(String(i+1),colX[0],y);
    ctx.textAlign='right';
    ctx.fillText(fmt(r.m,3),colX[1],y);
    ctx.fillText(fmt(r.G,2),colX[2],y);
    ctx.fillText(fmt(r.G/r.m,2),colX[3],y);
  });
  ctx.restore();
}
function drawGraph(now){
  var G=L.graph,pw=G.x1-G.x0,ph=G.y1-G.y0,padL=40,padB=28,padT=24,padR=14;
  var ox=G.x0+padL,oy=G.y1-padB,iw=pw-padL-padR,ih=ph-padB-padT;
  ghostCard(G.x0,G.y0,pw,ph);
  ctx.save();
  ctx.fillStyle='rgba(255,255,255,0.72)'; ctx.fillRect(ox,oy-ih,iw,ih);   // 图表白区
  ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=1;
  for(var m=0;m<=M_MMAX+1e-9;m+=0.1){ var x=ox+iw*m/M_MMAX;
    ctx.beginPath(); ctx.moveTo(x,oy-ih); ctx.lineTo(x,oy); ctx.stroke(); }
  for(var g=0;g<=G_GMAX;g+=1){ var y=oy-ih*g/G_GMAX;
    ctx.beginPath(); ctx.moveTo(ox,y); ctx.lineTo(ox+iw,y); ctx.stroke(); }
  ctx.strokeStyle='#64748b'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(ox,oy-ih); ctx.lineTo(ox,oy); ctx.lineTo(ox+iw,oy); ctx.stroke();
  ctx.fillStyle='#64748b'; ctx.font='11px sans-serif'; ctx.textAlign='center';
  for(m=0;m<=M_MMAX+1e-9;m+=0.1) ctx.fillText(fmt(m,1),ox+iw*m/M_MMAX,oy+15);
  ctx.textAlign='right';
  for(g=0;g<=G_GMAX;g+=1) ctx.fillText(String(g),ox-5,oy-ih*g/G_GMAX+4);
  ctx.textAlign='left'; ctx.fillText('G/N',ox-30,oy-ih-8);
  ctx.textAlign='right'; ctx.fillText('m/kg',ox+iw,oy+28);
  // 描点（200ms scale-in）
  state.records.forEach(function(r){
    var p=r.t?clamp((now-r.t)/200,0,1):1,rad=4.6*easeOut(p);
    var x=ox+iw*clamp(r.m,0,M_MMAX)/M_MMAX,y=oy-ih*clamp(r.G,0,G_GMAX)/G_GMAX;
    ctx.save(); ctx.globalAlpha=p;
    ctx.beginPath(); ctx.arc(x,y,rad,0,Math.PI*2);
    ctx.fillStyle='#2563eb'; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=1.2; ctx.stroke();
    ctx.restore();
  });
  // ≥2 点：过原点拟合线 G=km
  if(state.records.length>=2){
    var k=fitK();
    ctx.save(); ctx.beginPath(); ctx.rect(ox,oy-ih,iw,ih); ctx.clip();
    ctx.strokeStyle='#dc2626'; ctx.lineWidth=2; ctx.globalAlpha=0.75;
    ctx.beginPath(); ctx.moveTo(ox,oy);
    ctx.lineTo(ox+iw,oy-ih*clamp(k*M_MMAX,0,G_GMAX)/G_GMAX); ctx.stroke();
    ctx.restore();
    ctx.fillStyle='#dc2626'; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
    ctx.fillText('斜率 k=G/m≈'+fmt(k,2)+' N/kg',ox+8,oy-ih+16);
  }
  // ≥3 点结论牌
  if(state.concluded){
    var k2=fitK();
    ghostCard(G.x0+pw*0.30,G.y1-52,pw*0.66,34);
    ctx.fillStyle='#15803d'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('结论：重力跟质量成正比，G/m≈'+fmt(k2,1)+' N/kg → G=mg',G.x0+pw*0.63,G.y1-30);
  }
  ctx.restore();
}
function render(now){
  ctx.fillStyle='#eef2f6'; ctx.fillRect(0,0,W,H);          // E6 浅蓝灰亮底
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  drawTable();
  drawGraph(now);
  drawStation(now);
  ctx.fillStyle='#8a7c66'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('g = '+fmt(gVal(),1)+' N/kg'+(state.g10?'（粗略值）':''),L.cx,L.beamY-22);
}
function draw(){ var now=performance.now(); ctx.clearRect(0,0,W,H); render(now); updatePanel(); }

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
  if(state.concluded) return '结论已出：G=mg，g≈'+fmt(fitK(),1)+' N/kg。试试打开「粗略 g=10」对比读数差多少';
  if(state.pendRecord) return '钩码挂稳了，点「记录」把这组 m、G 记入表格';
  if(!state.stack.length) return '把钩码逐个挂到测力计上，挂稳后点「记录」';
  return '继续挂钩码或点「记录」——凑够 3 组数据，看 G-m 图上的规律';
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
    {x:L.table.x0,y:L.table.y0,w:L.table.x1-L.table.x0,h:L.graph.y1-L.table.y0},
    {x:L.cx-90,y:L.beamY-30,w:180,h:L.seat-L.beamY+50}
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
  var m=massKg(),G=forceNow();
  setText('rd-mass',stackG()+' g（'+fmt(m,3)+' kg）');
  setText('rd-g',fmt(G,2)+' N（g='+fmt(gVal(),1)+'）');
  setText('rd-ratio',m>0?fmt(G/m,2)+' N/kg':'—');
  setText('rd-count',String(state.records.length));
  setText('rd-status',!state.settled?'振荡中 · 停稳再读':(state.pendRecord?'有新数据待记录':(state.concluded?'结论已得出':'挂稳可读')));
}

/* ===== 控制栏接线 ===== */
var w50=document.getElementById('btn-w50'),w100=document.getElementById('btn-w100'),w250=document.getElementById('btn-w250');
if(w50) w50.addEventListener('click',function(){ addWeight(50); });
if(w100) w100.addEventListener('click',function(){ addWeight(100); });
if(w250) w250.addEventListener('click',function(){ addWeight(250); });
var bu=document.getElementById('btn-unload');
if(bu) bu.addEventListener('click',function(){ removeWeight(); });
var br=document.getElementById('btn-record');
if(br) br.addEventListener('click',record);
var bc=document.getElementById('btn-clear');
if(bc) bc.addEventListener('click',clearRecords);
var cg=document.getElementById('chk-g10');
if(cg) cg.addEventListener('change',function(){
  state.g10=cg.checked;
  updatePend();
  hintOverride=state.g10?'粗略档 g=10：同一堆钩码，算出的重力变大了，对比一下差多少':'精确档 g=9.8';
  updateHint(); dirty=true;
  if(window.playClick) playClick();
});
var cvg=document.getElementById('chk-vec-g'),cvf=document.getElementById('chk-vec-f');
if(cvg) cvg.addEventListener('change',function(){ state.vecG=cvg.checked; dirty=true; });
if(cvf) cvf.addEventListener('change',function(){ state.vecF=cvf.checked; dirty=true; });
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
  var bsy=false;
  if(state.osc) bsy=true;
  if(state.records.some(function(r){ return r.t&&now-r.t<220; })) bsy=true;
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
  addWeight:addWeight, removeWeight:removeWeight, record:record, clear:clearRecords, reset:resetAll
};
})();

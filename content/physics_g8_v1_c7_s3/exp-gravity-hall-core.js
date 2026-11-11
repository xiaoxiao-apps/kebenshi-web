/* exp-gravity-hall-core.js — c7s3 重力探究馆（两场景：①大小站 ②方向站）
   场景①：托盘拖砝码挂测力计→读数=G→浮钮记录入m/G表→G-m图实时描点连线+比值列+地月滑块
   场景②：铅垂线+斜面+工人查墙+一镜到底缩放到太空（zoomT>0.45 → body[data-stage=dark]） */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var G_STD=9.8,F_MAX=5;
var OSC_TAU=0.22,OSC_HZ=2.2,OSC_LIFE=1500;
var DESK_BAND=109;
var M_MMAX=0.55,G_GMAX=5.5;
var TRAY_GS=[50,100,250];           // 托盘砝码规格（g）
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var W=960,H=520,DPR=1,ctrlBandH=110,COMPACT_H=600,dirty=true;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(v,n){ return (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }
function easeOut(t){ return 1-Math.pow(1-t,3); }
function easeInOut(t){ return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }
function lerp(a,b,t){ return a+(b-a)*t; }

var state={
  scene:'gravity',
  onMoon:false,
  stack:[],settled:true,osc:null,
  recordsEarth:[],recordsMoon:[],
  concludedEarth:false,concludedMoon:false,
  pendRecord:false,
  drag:null,                          // 砝码拖挂 {g,x,y,src:'tray'|'hang',x0,y0}
  ui:{recBtn:null,clearBtn:null},     // 画布浮钮命中区（记录/清空）
  dir:{tilt:0,tiltChanged:0,wallCheck:false,zoomT:0,zooming:false,zoomDir:0,spot:null}
};
window.C7S3_STATE=state;

function gVal(){ return G_STD; }
function moonFactor(){ return state.onMoon?1/6:1; }
function stackG(){ var t=0; state.stack.forEach(function(g){ t+=g; }); return t; }
function massKg(){ return stackG()/1000; }
function forceNow(){ return massKg()*gVal()*moonFactor(); }
function records(){ return state.onMoon?state.recordsMoon:state.recordsEarth; }
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
  L.wallX=Math.round(W*0.38);
  L.wallH=Math.min(250,Math.round(L.seat-H*0.12));
  L.wallW=Math.max(20,Math.round(L.wallH*0.10));
  L.tray={x:clamp(Math.round(L.cx+L.meterH*0.105+120),L.cx+90,Math.round(W*0.40)-70)};
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
  measureCtrl(); layout();
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

/* ===== 场景①交互 ===== */
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
  if(state.scene!=='gravity') return;
  var now=performance.now();
  var Fnew=(stackG()+g)/1000*gVal()*moonFactor();
  if(Fnew>F_MAX&&Fnew>0.001){
    if(window.playDrop) playDrop();
    return;
  }
  state.stack.push(g);
  state.settled=false; state.pendRecord=false;
  state.osc={t0:now,A:Math.min(0.5,0.22+g/1000*gVal()*moonFactor()*0.10)};
  dirty=true;
  if(window.playClick) playClick();
}
function removeWeight(){
  if(state.scene!=='gravity') return;
  if(!state.stack.length) return;
  var now=performance.now();
  state.stack.pop();
  state.settled=false; state.pendRecord=false;
  state.osc={t0:now,A:0.25};
  dirty=true;
  if(window.playDrop) playDrop();
}
function curUnrecorded(){
  var m=massKg(),G=forceNow(),recs=records();
  return !recs.some(function(r){ return Math.abs(r.m-m)<1e-9&&Math.abs(r.G-G)<1e-9; });
}
function updatePend(){
  state.pendRecord=state.settled&&state.stack.length>0&&curUnrecorded();
}
function record(){
  if(state.scene!=='gravity') return;
  if(!state.settled||!state.stack.length||!curUnrecorded()) return;
  var recs=records();
  recs.push({m:massKg(),G:forceNow(),moon:state.onMoon,t:performance.now()});
  if(recs.length>=3){
    if(state.onMoon) state.concludedMoon=true;
    else state.concludedEarth=true;
  }
  state.pendRecord=false;
  dirty=true;
  if(window.playMatch) playMatch(); else if(window.playClick) playClick();
}
function clearRecords(){
  if(state.onMoon) state.recordsMoon=[];
  else state.recordsEarth=[];
  state.concludedEarth=false; state.concludedMoon=false; state.pendRecord=false;
  updatePend(); dirty=true;
  if(window.playClick) playClick();
}
function fitK(recs){
  var smm=0,smg=0;
  recs.forEach(function(r){ smm+=r.m*r.m; smg+=r.G*r.m; });
  return smm>0?smg/smm:0;
}
function resetAll(){
  state.stack=[]; state.settled=true; state.osc=null;
  state.recordsEarth=[]; state.recordsMoon=[];
  state.concludedEarth=false; state.concludedMoon=false; state.pendRecord=false;
  state.onMoon=false; state.drag=null;
  state.dir={tilt:0,tiltChanged:0,wallCheck:false,zoomT:0,zooming:false,zoomDir:0,spot:null};
  syncUI();
  dirty=true;
}

/* ===== 场景②交互 ===== */
var SPOTS=[
  {id:'cn',lat:30,lon:30,label:'中国'},
  {id:'sa',lat:-25,lon:-45,label:'南美'},
  {id:'au',lat:-30,lon:60,label:'澳洲'}
];
function onTilt(){
  var el=document.getElementById('rng-tilt');
  if(!el) return;
  var v=+el.value;
  state.dir.tilt=v;
  if(Math.abs(v)>=1&&state.dir.tiltChanged===0) state.dir.tiltChanged=1;
  var lbl=document.getElementById('lbl-tilt');
  if(lbl) lbl.textContent=v+'°';
  dirty=true;
}
function wallCheck(){
  state.dir.wallCheck=!state.dir.wallCheck;
  var btn=document.getElementById('btn-wall-check');
  if(btn) btn.classList.toggle('on',state.dir.wallCheck);
  dirty=true;
  if(window.playClick) playClick();
}
function zoomOut(){
  if(state.dir.zooming) return;
  state.dir.zooming=true;
  state.dir.zoomDir=state.dir.zoomT<0.5?1:-1;
  dirty=true;
  if(window.playClick) playClick();
}
function updateZoom(now){
  if(!state.dir.zooming) return;
  var speed=0.008;
  if(state.dir.zoomDir>0){
    state.dir.zoomT=Math.min(1,state.dir.zoomT+speed);
    if(state.dir.zoomT>=1){ state.dir.zooming=false; syncZoomBtn(); }
  } else {
    state.dir.zoomT=Math.max(0,state.dir.zoomT-speed);
    if(state.dir.zoomT<=0){ state.dir.zooming=false; syncZoomBtn(); }
  }
  document.body.dataset.stage=(state.dir.zoomT>0.45)?'dark':'light';
  dirty=true;
}
function setSpot(id){
  state.dir.spot=id;
  dirty=true;
  if(window.playClick) playClick();
}

/* ===== 场景切换 ===== */
function switchScene(sc){
  if(state.scene===sc) return;
  state.scene=sc;
  state.drag=null;
  if(window.GUIDE_CFG) window.GUIDE_CFG.mode=sc==='gravity'?'gravity':'direction';
  document.body.dataset.stage=(sc==='direction'&&state.dir.zoomT>0.45)?'dark':'light';
  syncUI();
  dirty=true;
  if(window.playClick) playClick();
}
function syncUI(){
  var btnS1=document.getElementById('btn-s1'),btnS2=document.getElementById('btn-s2');
  if(btnS1) btnS1.classList.toggle('active',state.scene==='gravity');
  if(btnS2) btnS2.classList.toggle('active',state.scene==='direction');
  var g1=['grp-env'];
  var g2=['grp-dir'];
  g1.forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display=state.scene==='gravity'?'':'none'; });
  g2.forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display=state.scene==='direction'?'':'none'; });
  var rngEnv=document.getElementById('rng-env');
  if(rngEnv) rngEnv.value=state.onMoon?'1':'0';
  var rngTilt=document.getElementById('rng-tilt');
  var lblTilt=document.getElementById('lbl-tilt');
  if(rngTilt) rngTilt.value=String(state.dir.tilt);
  if(lblTilt) lblTilt.textContent=state.dir.tilt+'°';
  var btnWC=document.getElementById('btn-wall-check');
  if(btnWC) btnWC.classList.toggle('on',state.dir.wallCheck);
  syncZoomBtn();
}
function syncZoomBtn(){
  var btnZO=document.getElementById('btn-zoom-out');
  if(!btnZO) return;
  var out=state.dir.zoomT>0.5;
  btnZO.textContent=out?'🔙 拉近':'🚀 拉远';
  btnZO.classList.toggle('on',out);
}

/* ===== 场景①绘制 ===== */
function drawStand(){
  var bw=L.meterH*0.21;
  ctx.save();
  ctx.fillStyle='#9aa1ab'; ctx.strokeStyle='#7d838c'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(L.cx-70,L.seat-10,140,10,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(L.cx-bw/2-26,L.beamY-6,12,L.seat-L.beamY-4,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(L.cx-bw/2-42,L.beamY-14,bw/2+58,10,3); ctx.fill(); ctx.stroke();
  ctx.restore();
}
var offCv=document.createElement('canvas'); offCv.width=8; offCv.height=8;
var offCtx=offCv.getContext('2d');
function stackBottom(g){
  var y=g.hookY;
  state.stack.forEach(function(w){ y+=PROPS.weightGeom(w).h; });
  return y;
}
function trayPos(i){ return L.tray.x+(i-1)*52; }
function drawStation(now){
  drawStand();
  var F=forceNow(),disp=clamp(F+oscVal(now),0,F_MAX);
  var g=PROPS.spring_meter(ctx,L.cx,L.beamY,{F:disp,h:L.meterH,orientation:'v'});
  var y=g.hookY;
  state.stack.forEach(function(w){
    var wh=PROPS.weightGeom(w);
    PROPS.hook_weight(ctx,g.hookX,y+wh.h,{g:w});
    y+=wh.h;
  });
  if(state.stack.length){
    drawArrow(L.cx-26,y+6,L.cx-26,y+6+30+F*7,'#dc2626',4.5);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='right';
    ctx.fillText('G='+fmt(F,2)+'N',L.cx-34,y+30);
  }
  ghostCard(L.cx+Math.round(L.meterH*0.105)+96,L.beamY+8,180,30);
  ctx.fillStyle='#1e293b'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  var bodyLabel=state.onMoon?'🌙 月球':'🌍 地球';
  ctx.fillText(bodyLabel+' G = '+fmt(F,2)+' N',L.cx+Math.round(L.meterH*0.105)+186,L.beamY+27);
  /* 砝码托盘（拖到挂钩上） */
  ctx.save();
  ctx.fillStyle='#b08a5a'; ctx.strokeStyle='#8a6a42'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(L.tray.x-78,L.seat-8,156,8,2); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#8a7c66'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('砝码托盘（拖到挂钩上）',L.tray.x,L.seat+16);
  TRAY_GS.forEach(function(gw,i){
    if(state.drag&&state.drag.src==='tray'&&state.drag.g===gw) return;   // 拖走的不再画在托盘
    PROPS.hook_weight(ctx,trayPos(i),L.seat-10,{g:gw});
  });
  /* 拖拽中的砝码 + snap 指示圈 */
  if(state.drag){
    var snapY=stackBottom(g)+16;
    var near=Math.hypot(state.drag.x-g.hookX,state.drag.y-snapY)<40&&state.drag.src==='tray';
    if(state.drag.src==='tray'){
      ctx.save(); ctx.strokeStyle=near?'rgba(22,163,74,.85)':'rgba(100,116,139,.5)';
      ctx.lineWidth=1.6; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.arc(g.hookX,snapY,18,0,Math.PI*2); ctx.stroke(); ctx.restore();
    }
    PROPS.hook_weight(ctx,state.drag.x,state.drag.y+PROPS.weightGeom(state.drag.g).h/2,{g:state.drag.g});
  }
  /* 记录浮钮：挂稳后弹出在测力计旁，点完隐去 */
  state.ui.recBtn=null;
  if(state.pendRecord){
    var bx=L.cx+Math.round(L.meterH*0.105)+146,by2=L.beamY+46,bw=80,bh=32;
    state.ui.recBtn={x:bx,y:by2,w:bw,h:bh};
    ctx.save();
    rrPath(bx,by2,bw,bh,10);
    ctx.fillStyle='#2563eb'; ctx.fill();
    ctx.shadowColor='rgba(37,99,235,.4)'; ctx.shadowBlur=8;
    ctx.fillStyle='#fff'; ctx.font='700 14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('📝 记录',bx+bw/2,by2+bh/2+1);
    ctx.restore();
    ctx.textBaseline='alphabetic';
  }
}
function drawTable(){
  var T=L.table,pw=T.x1-T.x0,ph=T.y1-T.y0;
  ghostCard(T.x0,T.y0,pw,ph);
  var cx=T.x0+12,cw=pw-24;
  var colX=[cx+6,cx+cw*0.26,cx+cw*0.48,cx+cw*0.72,cx+cw*0.90];
  ctx.save();
  ctx.fillStyle='#334155'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  var title=state.onMoon?'月球数据记录表':'地球数据记录表';
  ctx.fillText(title,cx,T.y0+20);
  /* 清空钮（表格右上角） */
  var cbx=T.x1-58,cby=T.y0+6;
  state.ui.clearBtn={x:cbx,y:cby,w:50,h:22};
  rrPath(cbx,cby,50,22,7);
  ctx.fillStyle='rgba(100,116,139,.14)'; ctx.fill();
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle='#475569'; ctx.font='600 11px sans-serif'; ctx.textAlign='center';
  ctx.fillText('清空',cbx+25,cby+15);
  var headY=T.y0+38;
  ctx.fillStyle='#64748b'; ctx.font='600 11px sans-serif';
  ctx.textAlign='left'; ctx.fillText('次数',colX[0],headY);
  ctx.textAlign='right'; ctx.fillText('m/kg',colX[1],headY);
  ctx.fillText('G/N',colX[2],headY);
  ctx.fillText('G÷m',colX[3],headY);
  ctx.fillText('天体',colX[4],headY);
  ctx.strokeStyle='rgba(0,0,0,.14)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(cx,headY+5); ctx.lineTo(cx+cw,headY+5); ctx.stroke();
  var recs=records();
  if(!recs.length){
    ctx.fillStyle='#94a3b8'; ctx.font='11px sans-serif'; ctx.textAlign='center';
    ctx.fillText('拖砝码挂上 → 停稳 → 点测力计旁「记录」',cx+cw/2,headY+24);
    ctx.restore(); return;
  }
  var rowH=Math.min(22,(T.y1-headY-12)/Math.max(5,recs.length));
  recs.forEach(function(r,i){
    var y=headY+18+i*rowH; if(y>T.y1-5) return;
    ctx.fillStyle='#1e293b'; ctx.font='11px sans-serif';
    ctx.textAlign='left'; ctx.fillText(String(i+1),colX[0],y);
    ctx.textAlign='right';
    ctx.fillText(fmt(r.m,3),colX[1],y);
    ctx.fillText(fmt(r.G,2),colX[2],y);
    ctx.fillStyle='#15803d'; ctx.font='600 11px sans-serif';
    ctx.fillText(fmt(r.G/r.m,2),colX[3],y);
    ctx.fillStyle='#64748b'; ctx.font='11px sans-serif';
    ctx.fillText(r.moon?'🌙':'🌍',colX[4],y);
  });
  ctx.restore();
}
function drawGraph(now){
  var G=L.graph,pw=G.x1-G.x0,ph=G.y1-G.y0,padL=40,padB=28,padT=24,padR=14;
  var ox=G.x0+padL,oy=G.y1-padB,iw=pw-padL-padR,ih=ph-padB-padT;
  ghostCard(G.x0,G.y0,pw,ph);
  ctx.save();
  ctx.fillStyle='rgba(255,255,255,0.72)'; ctx.fillRect(ox,oy-ih,iw,ih);
  ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=1;
  for(var m=0;m<=M_MMAX+1e-9;m+=0.1){ var x=ox+iw*m/M_MMAX;
    ctx.beginPath(); ctx.moveTo(x,oy-ih); ctx.lineTo(x,oy); ctx.stroke(); }
  for(var gv=0;gv<=G_GMAX;gv+=1){ var gy=oy-ih*gv/G_GMAX;
    ctx.beginPath(); ctx.moveTo(ox,gy); ctx.lineTo(ox+iw,gy); ctx.stroke(); }
  ctx.strokeStyle='#64748b'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(ox,oy-ih); ctx.lineTo(ox,oy); ctx.lineTo(ox+iw,oy); ctx.stroke();
  ctx.fillStyle='#64748b'; ctx.font='11px sans-serif'; ctx.textAlign='center';
  for(m=0;m<=M_MMAX+1e-9;m+=0.1) ctx.fillText(fmt(m,1),ox+iw*m/M_MMAX,oy+15);
  ctx.textAlign='right';
  for(gv=0;gv<=G_GMAX;gv+=1) ctx.fillText(String(gv),ox-5,oy-ih*gv/G_GMAX+4);
  ctx.textAlign='left'; ctx.fillText('G/N',ox-30,oy-ih-8);
  ctx.textAlign='right'; ctx.fillText('m/kg',ox+iw,oy+28);

  function drawPoints(recs,color){
    recs.forEach(function(r){
      var p=r.t?clamp((now-r.t)/200,0,1):1,rad=4.6*easeOut(p);
      var px=ox+iw*clamp(r.m,0,M_MMAX)/M_MMAX,py=oy-ih*clamp(r.G,0,G_GMAX)/G_GMAX;
      ctx.save(); ctx.globalAlpha=p;
      ctx.beginPath(); ctx.arc(px,py,rad,0,Math.PI*2);
      ctx.fillStyle=color; ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=1.2; ctx.stroke();
      ctx.restore();
    });
  }
  function drawLine(recs,color,label){
    if(recs.length<2) return;
    var k=fitK(recs);
    ctx.save(); ctx.beginPath(); ctx.rect(ox,oy-ih,iw,ih); ctx.clip();
    ctx.strokeStyle=color; ctx.lineWidth=2; ctx.globalAlpha=0.75;
    ctx.beginPath(); ctx.moveTo(ox,oy);
    ctx.lineTo(ox+iw,oy-ih*clamp(k*M_MMAX,0,G_GMAX)/G_GMAX); ctx.stroke();
    ctx.restore();
    ctx.fillStyle=color; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
    ctx.fillText(label+' k≈'+fmt(k,2)+' N/kg',ox+8,oy-ih+16);
  }
  drawPoints(state.recordsEarth,'#2563eb');
  drawLine(state.recordsEarth,'#2563eb','🌍地球');
  drawPoints(state.recordsMoon,'#7c3aed');
  drawLine(state.recordsMoon,'#7c3aed','🌙月球');

  if(state.concludedEarth){
    var kE=fitK(state.recordsEarth);
    ghostCard(G.x0+pw*0.25,G.y1-52,pw*0.70,34);
    ctx.fillStyle='#15803d'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    var txt='结论：G与m成正比，g≈'+fmt(kE,1)+' N/kg → G=mg';
    if(state.concludedMoon){
      var kM=fitK(state.recordsMoon);
      txt='地球 g≈'+fmt(kE,1)+'，月球 g≈'+fmt(kM,1)+' N/kg — 质量不变，重力随天体变';
    }
    ctx.fillText(txt,G.x0+pw*0.60,G.y1-30);
  } else if(state.concludedMoon){
    var kM2=fitK(state.recordsMoon);
    ghostCard(G.x0+pw*0.25,G.y1-52,pw*0.70,34);
    ctx.fillStyle='#15803d'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('月球 g≈'+fmt(kM2,1)+' N/kg，约地球的 1/6',G.x0+pw*0.60,G.y1-30);
  }
  ctx.restore();
}
function renderGravity(now){
  ctx.fillStyle='#eef2f6'; ctx.fillRect(0,0,W,H);
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  drawTable();
  drawGraph(now);
  drawStation(now);
  ctx.fillStyle='#8a7c66'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  var gtxt='g = '+fmt(gVal(),1)+' N/kg';
  if(state.onMoon) gtxt='🌙 月球：g_月 ≈ '+fmt(gVal()/6,2)+' N/kg（地球的1/6）';
  ctx.fillText(gtxt,L.cx,L.beamY-22);
}

/* ===== 场景②绘制 ===== */
function srand(n){ var x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); }
function drawStars(alpha){
  ctx.save(); ctx.globalAlpha=alpha;
  for(var i=0;i<80;i++){
    var x=srand(i*1.3+0.7)*W,y=srand(i*2.9+1.3)*(H-ctrlBandH);
    var r=0.6+srand(i*5.1+2.1)*1.5,a=0.35+srand(i*7.7+3.3)*0.6;
    ctx.fillStyle='rgba(255,255,255,'+a.toFixed(2)+')';
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
function renderDirection(now){
  var zt=easeInOut(clamp(state.dir.zoomT,0,1));
  var bgR=Math.round(lerp(249,11,zt)),bgG=Math.round(lerp(244,29,zt)),bgB=Math.round(lerp(205,58,zt));
  ctx.fillStyle='rgb('+bgR+','+bgG+','+bgB+')';
  ctx.fillRect(0,0,W,H);
  if(zt>0.1) drawStars(zt);

  var scale=lerp(1,0.35,zt);
  var panX=lerp(0,W*0.5-L.globeX,zt);
  var panY=lerp(0,(H-ctrlBandH)*0.5-L.globeY,zt);

  ctx.save();
  ctx.translate(W*0.5,(H-ctrlBandH)*0.5);
  ctx.scale(scale,scale);
  ctx.translate(-W*0.5+panX/scale*0,-( H-ctrlBandH)*0.5+panY/scale*0);
  ctx.translate(0,0);

  if(zt<0.85){
    var nearAlpha=clamp(1-zt*1.3,0,1);
    ctx.globalAlpha=nearAlpha;
    drawNearScene(now);
    ctx.globalAlpha=1;
  }
  ctx.restore();

  if(zt>0.15){
    var farAlpha=clamp((zt-0.15)/0.5,0,1);
    ctx.save(); ctx.globalAlpha=farAlpha;
    drawSpaceScene(now);
    ctx.restore();
  }
}
function drawNearScene(now){
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  var th=state.dir.tilt*Math.PI/180;
  var px=L.wallX,py=L.seat,Hw=L.wallH,ww=L.wallW;

  ctx.save();
  ctx.translate(px,py); ctx.rotate(th);
  var gr=ctx.createLinearGradient(-ww/2,0,ww/2,0);
  gr.addColorStop(0,'#c8b394'); gr.addColorStop(0.5,'#dcc9ab'); gr.addColorStop(1,'#b39c7c');
  ctx.fillStyle=gr; ctx.strokeStyle='#8a7355'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.roundRect(-ww/2,-Hw,ww,Hw,3); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='rgba(90,70,45,.35)'; ctx.lineWidth=1;
  for(var i=1;i<6;i++){ var yy=-Hw*i/6;
    ctx.beginPath(); ctx.moveTo(-ww/2+2,yy); ctx.lineTo(ww/2-2,yy); ctx.stroke(); }
  ctx.restore();

  var ax=px+Hw*Math.sin(th),ay=py-Hw*Math.cos(th);
  var fx=px+(ww/2)*Math.cos(th)+(Hw-14)*Math.sin(th);
  var fy2=py+(ww/2)*Math.sin(th)-(Hw-14)*Math.cos(th);
  var plumbLen=Math.min(170,py-ay-40);
  PROPS.plumb_line(ctx,ax,ay,{len:plumbLen});

  var nx=Math.cos(th),ny=Math.sin(th),nLen=Math.min(120,plumbLen*0.8);
  /* 虚线：垂直于墙（≠重力方向） */
  ctx.save();
  ctx.strokeStyle='#2563eb'; ctx.lineWidth=2; ctx.setLineDash([7,5]);
  ctx.beginPath(); ctx.moveTo(fx,fy2); ctx.lineTo(fx+nx*nLen,fy2+ny*nLen); ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#2563eb'; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
  ctx.fillText('垂直于墙 ≠ 重力方向',fx+nx*nLen*0.55+8,fy2+ny*nLen*0.55);

  var arcR=Math.min(52,nLen*0.6);
  ctx.save();
  /* 实线：竖直向下（=重力方向） */
  ctx.strokeStyle='#dc2626'; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(fx,fy2); ctx.lineTo(fx,fy2+nLen); ctx.stroke();
  ctx.fillStyle='#dc2626'; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
  ctx.fillText('竖直向下 = 重力方向',fx+5,fy2+nLen-4);
  ctx.strokeStyle='#64748b'; ctx.lineWidth=2;
  var a0=Math.min(th,Math.PI/2),a1=Math.max(th,Math.PI/2);
  ctx.beginPath(); ctx.arc(fx,fy2,arcR,a0,a1); ctx.stroke();
  var mid=(th+Math.PI/2)/2;
  ctx.fillStyle='#334155'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('夹角 '+(90-Math.abs(state.dir.tilt))+'°',fx+Math.cos(mid)*(arcR+24),fy2+Math.sin(mid)*(arcR+24)+4);
  ctx.restore();

  ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  ctx.fillText('铅垂线：恒竖直向下',ax+14,ay+plumbLen*0.45);

  if(state.dir.wallCheck){
    var isStraight=Math.abs(state.dir.tilt)<=2;
    var checkX=W*0.68,checkY=H*0.18;
    ghostCard(checkX-10,checkY-10,224,70);
    ctx.fillStyle=isStraight?'#15803d':'#dc2626';
    ctx.font='700 16px sans-serif'; ctx.textAlign='left';
    ctx.fillText(isStraight?'✓ 墙是竖直的！':'✗ 墙歪了 '+state.dir.tilt+'°',checkX,checkY+18);
    ctx.fillStyle='#64748b'; ctx.font='12px sans-serif';
    ctx.fillText('铅垂线与墙面'+(isStraight?'平行':'不平行'),checkX,checkY+38);
    ctx.fillStyle='#334155'; ctx.font='600 12px sans-serif';
    ctx.fillText('应用：工人砌墙吊铅垂线，就是查墙竖直不竖直',checkX,checkY+56);
  }
}
function drawSpaceScene(now){
  var r=L.globeR,cx=L.globeX,cy=L.globeY;
  var g=PROPS.earth_globe(ctx,cx,cy,{r:r,spots:SPOTS.map(function(s){ return {lat:s.lat,lon:s.lon,label:s.label}; })});

  g.spots.forEach(function(sp,i){
    if(!sp.visible) return;
    var ang=Math.atan2(sp.y-cy,sp.x-cx);
    var isSelected=state.dir.spot===SPOTS[i].id;
    ctx.save();
    ctx.translate(sp.x,sp.y); ctx.rotate(ang+Math.PI/2);
    PROPS.person_pin(ctx,0,0,{arrow:'down',h:Math.max(28,Math.round(r*0.30))});
    ctx.restore();
    drawArrow(sp.x,sp.y,sp.x+(cx-sp.x)*0.6,sp.y+(cy-sp.y)*0.6,isSelected?'#f87171':'rgba(220,38,38,0.5)',isSelected?3:2);
    if(isSelected){
      ctx.fillStyle='#f87171'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
      ctx.fillText(SPOTS[i].label+'：指向地心',(sp.x+cx)/2,(sp.y+cy)/2-10);
    }
  });

  ctx.save();
  rrPath(cx-r-10,Math.max(8,cy-r-52),2*r+20,34,10);
  ctx.fillStyle='rgba(10,25,50,0.55)'; ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.30)'; ctx.lineWidth=1.2; ctx.stroke();
  ctx.fillStyle='#dbeafe'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('各地的「下」都指向地心 → 南美洲的人也站得稳稳的',cx,Math.max(8,cy-r-52)+22);
  ctx.restore();
}

/* ===== 画布指针（场景①：砝码拖挂+记录/清空浮钮；场景②太空：点红点选位置） ===== */
function canvasXY(ev){
  var wr=cv.getBoundingClientRect();
  return {x:(ev.clientX-wr.left)*(W/wr.width),y:(ev.clientY-wr.top)*(H/wr.height)};
}
function gravityDown(p){
  /* 记录浮钮 */
  var rb=state.ui.recBtn;
  if(rb&&state.pendRecord&&p.x>=rb.x&&p.x<=rb.x+rb.w&&p.y>=rb.y&&p.y<=rb.y+rb.h){
    record(); return true;
  }
  /* 清空钮（表格角） */
  var cb=state.ui.clearBtn;
  if(cb&&records().length&&p.x>=cb.x&&p.x<=cb.x+cb.w&&p.y>=cb.y&&p.y<=cb.y+cb.h){
    clearRecords(); return true;
  }
  /* 已挂砝码（最下一个）拖离=取下 */
  if(state.stack.length){
    var F=forceNow(),disp=clamp(F,0,F_MAX);
    var g=PROPS.spring_meter(offCtx,L.cx,L.beamY,{F:disp,h:L.meterH,orientation:'v'});
    var yBot=stackBottom(g),wg=state.stack[state.stack.length-1];
    var wh=PROPS.weightGeom(wg);
    if(Math.abs(p.x-g.hookX)<wh.w&&p.y>=yBot-wh.h-6&&p.y<=yBot+8){
      state.drag={g:wg,x:p.x,y:p.y-yBot+wh.h/2,src:'hang',x0:p.x,y0:p.y,taken:false};
      return true;
    }
  }
  /* 托盘砝码 */
  for(var i=0;i<TRAY_GS.length;i++){
    var gw=TRAY_GS[i],wg2=PROPS.weightGeom(gw);
    if(Math.abs(p.x-trayPos(i))<wg2.w+8&&Math.abs(p.y-(L.seat-10-wg2.h/2))<wg2.h){
      state.drag={g:gw,x:p.x,y:p.y,src:'tray',x0:p.x,y0:p.y};
      if(window.playClick) playClick();
      return true;
    }
  }
  return false;
}
cv.addEventListener('pointerdown',function(ev){
  var p=canvasXY(ev);
  if(state.scene==='gravity'){
    if(!gravityDown(p)) return;
  }else{
    if(state.dir.zoomT<0.5) return;
    var r=L.globeR,cx=L.globeX,cy=L.globeY,hit=false;
    for(var i=0;i<SPOTS.length;i++){
      var lat=SPOTS[i].lat*Math.PI/180,lon=SPOTS[i].lon*Math.PI/180;
      var sx=cx+r*Math.cos(lat)*Math.sin(lon);
      var sy=cy-r*Math.sin(lat);
      if(Math.cos(lat)*Math.cos(lon)<0.02) continue;
      if(Math.hypot(p.x-sx,p.y-sy)<24){ setSpot(SPOTS[i].id); hit=true; break; }
    }
    if(!hit) return;
  }
  if(cv.setPointerCapture&&ev.pointerId!=null){ try{ cv.setPointerCapture(ev.pointerId); }catch(e){} }
});
cv.addEventListener('pointermove',function(ev){
  if(!state.drag) return;
  var p=canvasXY(ev);
  state.drag.x=p.x; state.drag.y=p.y;
  if(state.drag.src==='hang'&&!state.drag.taken&&Math.hypot(p.x-state.drag.x0,p.y-state.drag.y0)>60){
    state.drag.taken=true;
    removeWeight();
    state.drag=null;
  }
  dirty=true;
});
['pointerup','pointercancel','pointerleave'].forEach(function(ev){
  cv.addEventListener(ev,function(){
    if(!state.drag) return;
    var d=state.drag;
    state.drag=null;
    if(d.src==='tray'){
      var F=forceNow(),disp=clamp(F,0,F_MAX);
      var g=PROPS.spring_meter(offCtx,L.cx,L.beamY,{F:disp,h:L.meterH,orientation:'v'});
      var snapY=stackBottom(g)+16;
      if(Math.hypot(d.x-g.hookX,d.y-snapY)<40) addWeight(d.g);
      else if(window.playDrop) playDrop();
    }
    dirty=true;
  });
});

/* ===== 主渲染 ===== */
function render(now){
  if(state.scene==='gravity') renderGravity(now);
  else renderDirection(now);
}
function draw(){
  var now=performance.now();
  var st=(state.scene==='direction'&&state.dir.zoomT>0.45)?'dark':'light';
  if(document.body.dataset.stage!==st) document.body.dataset.stage=st;
  ctx.clearRect(0,0,W,H); updateZoom(now); render(now);
}

/* ===== 控制栏接线 ===== */
var btnS1=document.getElementById('btn-s1'),btnS2=document.getElementById('btn-s2');
if(btnS1) btnS1.addEventListener('click',function(){ switchScene('gravity'); });
if(btnS2) btnS2.addEventListener('click',function(){ switchScene('direction'); });

var rngEnv=document.getElementById('rng-env');
if(rngEnv) rngEnv.addEventListener('change',function(){
  state.onMoon=(+rngEnv.value)===1;
  state.settled=true; state.osc=null; state.drag=null;
  updatePend(); dirty=true;
  if(window.playClick)playClick();
});

var rngTilt=document.getElementById('rng-tilt');
if(rngTilt){ rngTilt.addEventListener('input',onTilt); rngTilt.addEventListener('change',onTilt); }
var btnWC=document.getElementById('btn-wall-check');
if(btnWC) btnWC.addEventListener('click',wallCheck);
var btnZO=document.getElementById('btn-zoom-out');
if(btnZO) btnZO.addEventListener('click',zoomOut);

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
  var now=performance.now();
  var bsy=false;
  if(state.osc) bsy=true;
  if(state.dir.zooming) bsy=true;
  var allRecs=state.recordsEarth.concat(state.recordsMoon);
  if(allRecs.some(function(r){ return r.t&&now-r.t<220; })) bsy=true;
  if(bsy||dirty){ dirty=false; draw(); }
  requestAnimationFrame(tick);
}
layout(); resize(); syncUI(); draw();
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); dirty=true; }).observe(ctrlEl);
}
requestAnimationFrame(tick);
window.__c7dbg={
  get state(){ return state; }, get W(){ return W; }, get H(){ return H; }, get layout(){ return L; },
  addWeight:addWeight, removeWeight:removeWeight, record:record, clear:clearRecords, reset:resetAll,
  switchScene:switchScene, setSpot:setSpot
};
})();

(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
// 本页 cm↔px 单点换算：f=8cm 固定、物像光路约 40cm，c5s1 的 0.096 装不下 → 本页比例常数（单点 H 比例法照 c5s1，禁裸 px）
function cmPx(){ return H*0.030; }
var F_CM=8;                // 模型照相机凸透镜焦距固定 8cm（教材 5~10cm 区间）
var FOCUS_TOL_CM=0.6;      // 薄膜对焦容差：|v筒−v像|≤0.6cm 判清晰（照 c5s1 focusTol 先例）
var U_MIN=17,U_MAX=30,U_DEF=22;   // 物距 clamp（cm，u>2f 倒立缩小实像区间）
var V_MIN=9,V_MAX=15,V_DEF=13;    // 筒距=透镜-薄膜（cm，两筒套接伸缩行程；下限保内筒不穿出外筒前端）
var OBJ_H_CM=3.7;          // 物高 cm=裁后 F 板可视高（2*LED_FH*hLed*LED_P/cmPx，物点=F 板上缘与像高自洽）
// G1 探针标定见设计书§10 G1（f_led_on.png 800×800 逐行非透明宽扫描：F板上缘≈46、竖笔下缘=343、359 起立杆、565 起底座）
var LED_P=0.43;            // 裁切比 P=F板下缘行/总高=344/800：源矩形 (0,0,natW,natH*P)，P 以下残杆/底座清零不画
var LED_CY=0.57;           // F 板竖直中心在裁切区内比例（(46+343)/2/343）
var LED_FH=0.43;           // F 板可视半高/裁切高（(343−46)/2/343）
var LED_XC=0.52;           // F 板水平中心比例（(315+522)/2/800）
var LED_WF=0.26;           // F 板可视宽/natW（(522−315)/800，装配体包围盒用）
var U2_MIN=9,U2_MAX=14,U2_DEF=12;   // 场景2 物距 clamp（保 f<u<2f 放大倒立实像区间）
var PROJ_TOL_CM=3.0;       // 场景2 对焦容差：|v像−光程|≤3cm 判清晰（u 拖 1px 像距动 ~6px，容差放宽保可玩）
var U3_MIN=2,U3_MAX=7.8,U3_DEF=5;   // 场景3 物距 clamp：上限=F_CM−0.2=7.8（G10 放大镜恒在焦点以内用）
var ANIM_DUR=600;          // 场景切换飞入飞出时长（ms，两向对称）
var COL_RAY='#dc2626';
var COL_FLOW='#3b82f6';    // G6 蓝色流动虚线（照 c5s1，绑光路开关同现）
var COL_DIM='#854d0e';
// G9 screen 锚点标定（解析 props.js geomOf）：屏面中心 cy=−h/2（h=opt.h）、底杆中心在锚点、拉杆下伸 0.12h
var SCR_AX=0.42;           // PROPS.screen 的 y 传 axisY+0.42*h 使屏面中心骑光轴（设计书§10 G9 标定）
var COMPACT_H=600;
var ctrlBandH=150;
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
var W=960,H=520,DPR=1,axisY=260;
var showRays=true,showLabels=false;
// 三场景状态完全隔离：cam=模型照相机；proj=投影仪；mag=放大镜（阶段2 全交互上线）
var state={
  scene:'cam',
  animating:false,anim:null,   // anim={from,to,t0}；animating 期间锁全部输入
  cam:{u:U_DEF,vTube:V_DEF,focused:false,everFocused:false,everDragLed:false,chalH0:0,chalDone:false},
  proj:{u:U2_DEF,mirrorOn:false,flipped:false,focused:false,everFocused:false,everMirror:false,everFlip:false,pfSet:false},
  mag:{u:U3_DEF,everDrag:false,screenX:null,everScreen:false}
};
function cur(){ return state[state.scene]; }
var drag=null,startPt=null,glowFx=[];
var toastTimer=null;
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
// H 比例缓存（proportions() 赋值）
var hLed,tubeDia,tubeLf,tubeLb,lensH,scrH;
function proportions(){   // G5 比例表（照 c5s1 模式，单点 H 比例法；cmPx 保持 H*0.030 场景级）
  hLed=H*0.30;                 // F 光源裁切绘制基准高（F 板可视高=2*LED_FH*hLed*LED_P≈0.11H）
  lensH=H*0.13;                // 透镜孔径
  tubeDia=H*0.16;              // 外筒直径（剖面画法）
  scrH=Math.round(H*0.32);     // 屏/幕高（场景2 光幕、场景3 光屏）
  tubeLf=Math.round(8*cmPx()); // 前筒（外筒）长 8cm：透镜端环固定
  tubeLb=Math.round(9*cmPx()); // 后筒（内筒）长 9cm：薄膜端环随 vTube 平移
}
function layout(){
  // 零桌面（c5s1 排版）：光轴居控制条上方可见带居中，器材全部骑光轴
  axisY=Math.round((H-ctrlBandH)*0.52);
  // G4 场景1 托盘已删（器材全预置、整机可拖）；仅场景3 托盘保留光屏一件（slot 只缩略图不放文字标签）
  var cardH=100;
  var fit=(H<COMPACT_H)?Math.min(72,Math.round(H*0.14)):72;
  var cardM={x:16,y:H-ctrlBandH-12-cardH,w:110,h:cardH,r:10,fill:'rgba(255,255,255,0.88)',stroke:'#c9c0ae'};
  toolboxMag=PROPS.toolbox.create({card:cardM,items:[{id:'screen',x:cardM.x+55,y:cardM.y+55}],fit:fit,nat:{screen:{w:280,h:467}}});
}
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl(); proportions(); layout();
  var C=state.cam;
  C.u=clampU(C.u); C.vTube=clampV(C.vTube);
  state.proj.u=clampU2(state.proj.u); state.mag.u=clampU3(state.mag.u);
  draw();
}
function clampU(u){ return Math.max(U_MIN,Math.min(U_MAX,u)); }
function clampV(v){ return Math.max(V_MIN,Math.min(V_MAX,v)); }
function clampU2(u){ return Math.max(U2_MIN,Math.min(U2_MAX,u)); }
function clampU3(u){ return Math.max(U3_MIN,Math.min(U3_MAX,u)); }
var toolboxMag=null;   // 场景3 托盘（仅备光屏一件，layout 构建）
// ===== 场景1 几何（G2/G3）：F 固定+筒伸缩，xLens=装配体内相对量（F→透镜=u）；canvas y 向下，倒立实像画轴下方 =====
function ledCropH(){ return hLed*LED_P; }   // G1 裁切高（源矩形 0..natH*LED_P）
function ledCW(){                            // 裁切区绘制宽 cw=ch*natW/(natH*P)（同源比例修变形）
  var img=PROPS.spriteReady('f_led_on')?PROPS.img('f_led_on'):null;
  return img?ledCropH()*img.naturalWidth/(img.naturalHeight*LED_P):ledCropH()/LED_P;
}
function ledVisW(){ return ledCW()*LED_WF; }          // F 板可视宽（装配体包围盒用）
function ledTop(){ return axisY-ledCropH()*LED_FH; }  // F 板可视上缘
function xLed(){   // G2：装配体包围盒（F 板左缘→薄膜右缘）水平居中于 W*0.46（按默认 u/v 定位，F 固定）
  return Math.round(W*0.46+ledVisW()/4-((U_DEF+V_DEF)*cmPx()+tubeDia*0.14)/2);
}
function xLens(){ return xLed()+Math.round(state.cam.u*cmPx()); }
function filmX(){ return xLens()+Math.round(state.cam.vTube*cmPx()); }
function vImg(){ var u=state.cam.u; return u*F_CM/(u-F_CM); }   // v像=u*f/(u−f)
function imgHCm(){ return OBJ_H_CM*vImg()/state.cam.u; }
function isFocused(){ return Math.abs(state.cam.vTube-vImg())<=FOCUS_TOL_CM; }
// ===== 场景2 投影仪几何（G7/G8；cm↔px 铁律）：光幕固定右端骑轴；镜位=光幕光程折算 → 镜态折线光程=水平光程（K3 两态读数一致） =====
function xLed2(){ return Math.round(W*0.08); }          // 投影片固定机身内左位（G8）
function xLens2(){ return xLed2()+Math.round(state.proj.u*cmPx()); }   // 透镜机身内可拖=调焦
function xScr2(){ return Math.round(W*0.86); }          // G7 光幕固定右端（G9 标定骑轴）
function ceilBandH(){ return Math.round(H*0.05); }
function hScr(){ return Math.round(H*0.16); }
function yHit(){ return Math.round(ceilBandH()+hScr()*0.45); }   // 天花板屏面受光点 y
function xMir(){ return xScr2()-Math.round(axisY-yHit()); }      // 45° 镜位：折线光程=水平光程（K3）
function vImg2(){ var u=state.proj.u; return u*F_CM/(u-F_CM); }
function pathCm2(){ return (xScr2()-xLens2())/cmPx(); }   // 光程（两态相同）：透镜→光幕；镜态折线经 xMir 推导等长
function imgHCm2(){ return OBJ_H_CM*vImg2()/state.proj.u; }
function isFocused2(){ return Math.abs(vImg2()-pathCm2())<=PROJ_TOL_CM; }
// ===== 场景3 放大镜几何（u<f → v像 负值=同侧正立虚像；拖过 f 变正值=实像，xImg3 单点统一） =====
function xLed3(){ return Math.round(W*0.22); }
function xLens3(){ return xLed3()+Math.round(state.mag.u*cmPx()); }
function vImg3(){ var u=state.mag.u; return u*F_CM/(u-F_CM); }
function imgHCm3(){ return OBJ_H_CM*Math.abs(vImg3())/state.mag.u; }
function xImg3(){ return xLens3()+Math.round(vImg3()*cmPx()); }
function xEye(){ return Math.min(Math.round(W*0.82),W-64); }
// ===== 绘制：背景/窗/桌/轴 =====
function drawBg(){
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#faf8f3'); g.addColorStop(1,'#f5f2ec');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}
function drawAxis(){
  ctx.save();
  ctx.strokeStyle='rgba(26,26,26,.45)'; ctx.lineWidth=1; ctx.setLineDash([14,5,3,5]);
  ctx.beginPath(); ctx.moveTo(0,axisY); ctx.lineTo(W,axisY); ctx.stroke();
  ctx.restore();
}
function drawTray(){
  if(state.scene!=='mag'||!toolboxMag) return;   // G4：场景1 托盘已删（整机拖）；场景3 托盘仅备光屏一件
  toolboxMag.drawCard(ctx);
  var sm=toolboxMag.slots[0];
  // G9：缩略图同锚点标定（屏面中心对槽心 → y=槽心+0.42h）
  if(sm&&state.mag.screenX===null&&!(drag&&drag.k==='screen')) PROPS.screen(ctx,sm.x,sm.y+Math.round(SCR_AX*76),{h:76});
}
function arrowHead(x0,y0,x1,y1){   // G6：段末小三角箭头沿传播方向
  var a=Math.atan2(y1-y0,x1-x0),s=7;
  ctx.save(); ctx.translate(x1,y1); ctx.rotate(a); ctx.fillStyle=COL_RAY;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-s,-s*0.45); ctx.lineTo(-s,s*0.45); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function beam(x0,y0,x1,y1){
  ctx.save(); ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1);
  ctx.strokeStyle=COL_RAY; ctx.lineWidth=2; ctx.stroke();
  arrowHead(x0,y0,x1,y1);
  // G6：蓝色流动虚线叠在实线上（setLineDash+lineDashOffset 照 c5s1 L163，绑光路开关同现同灭）
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1);
  ctx.setLineDash([10,8]);
  ctx.lineDashOffset=-(performance.now()*0.06)%18;
  ctx.strokeStyle=COL_FLOW; ctx.lineWidth=2.4; ctx.stroke();
  ctx.restore();
}
function beamDash(x0,y0,x1,y1){   // 反向延长虚线（c5s1 beamDash 写法照搬）：静态不流动
  ctx.save(); ctx.lineCap='round'; ctx.setLineDash([7,6]); ctx.lineDashOffset=0; ctx.globalAlpha=.75;
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1);
  ctx.strokeStyle=COL_RAY; ctx.lineWidth=1.5; ctx.stroke();
  ctx.restore();
}
// ===== 场景1 光路（G6）：单物点（F 板上缘）两线——平行光（水平入射→折射过后焦点）+过光心光（直穿）；薄膜偏离像位→两线岔开=弥散 =====
function drawRaysCam(){
  var x0=xLed(),xl=xLens(),fx=filmX(),fpx=F_CM*cmPx();
  var y0=axisY-OBJ_H_CM/2*cmPx();                 // 物点=F 板上缘
  var mCen=(y0-axisY)/(xl-x0);
  beam(x0,y0,xl,y0);                              // 平行光：水平入射
  beam(xl,y0,fx,y0+(axisY-y0)/fpx*(fx-xl));       // 折射后过后焦点射向像点
  beam(x0,y0,xl,axisY);                           // 过光心光：直穿
  beam(xl,axisY,fx,axisY+mCen*(fx-xl));
}
// F 图案（中心锚）：竖笔+两横臂；倒立实像=镜像+上下翻转=scale(-1,-1) 变换后画同一图案
function fPath(h){
  var w=h*0.62;
  ctx.beginPath();
  ctx.moveTo(-w*0.5,-h/2); ctx.lineTo(-w*0.5,h/2);
  ctx.moveTo(-w*0.5,-h/2); ctx.lineTo(w*0.5,-h/2);
  ctx.moveTo(-w*0.5,0); ctx.lineTo(w*0.28,0);
  ctx.stroke();
}
// 薄膜上的像：对上=清晰倒立缩小 F；偏离=弥散模糊圆（模糊度∝偏差）
function drawFilmImage(){
  var fx=filmX(),hpx=imgHCm()*cmPx(),blur=Math.abs(state.cam.vTube-vImg())*cmPx()*0.35;
  ctx.save();
  if(!isFocused()){
    ctx.globalAlpha=0.28;
    var g=ctx.createRadialGradient(fx,axisY,1,fx,axisY,tubeDia*0.34+blur);
    g.addColorStop(0,'rgba(255,196,50,.9)'); g.addColorStop(1,'rgba(255,196,50,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(fx,axisY,tubeDia*0.34+blur,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }
  ctx.translate(fx-2,axisY); ctx.scale(-1,-1);   // 倒立实像：镜像+上下翻转
  ctx.lineCap='round'; ctx.lineWidth=Math.max(2,hpx*0.16); ctx.strokeStyle='#f59e0b';
  if(isFocused()){ fPath(hpx); ctx.stroke(); }
  else{
    for(var i=0;i<4;i++){
      ctx.save(); ctx.globalAlpha=0.28;
      ctx.translate((i-1.5)*blur*0.7,(i%2?1:-1)*blur*0.5);
      fPath(hpx); ctx.stroke(); ctx.restore();
    }
  }
  ctx.restore();
}
// 剖面画法：筒腔留空让光路真实可见；伸缩=两筒断面段相对平移（前筒含透镜端环、后筒含薄膜端环）
function drawTubeSection(ctx,x0,x1,axisY,dia){
  var wallT=Math.max(2,dia*0.09),half=dia/2,rx=Math.max(3,dia*0.11);
  ctx.save();
  ctx.fillStyle='#c9a876'; ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=1.5;
  ctx.fillRect(x0,axisY-half,x1-x0,wallT); ctx.strokeRect(x0,axisY-half,x1-x0,wallT);
  ctx.fillRect(x0,axisY+half-wallT,x1-x0,wallT); ctx.strokeRect(x0,axisY+half-wallT,x1-x0,wallT);
  ctx.fillStyle='rgba(201,168,118,.30)';
  [x0,x1].forEach(function(ex){
    ctx.beginPath(); ctx.ellipse(ex,axisY,rx,half,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  });
  ctx.restore();
}
function drawCamera(){
  var xl=xLens(),fx=filmX();
  drawTubeSection(ctx,fx-tubeLb,fx,axisY,tubeDia*0.82);   // 后筒（内筒）：薄膜端环
  drawTubeSection(ctx,xl,xl+tubeLf,axisY,tubeDia);       // 前筒（外筒）：透镜端环
}
function drawLensFilm(){
  var xl=xLens(),fx=filmX();
  PROPS.lens_convex(ctx,xl,axisY,{h:lensH,f:F_CM});   // opt.f 矢量通道，f 固定 8cm
  ctx.save();                                          // 半透明薄膜=代码画圆面（动态内容③）
  ctx.fillStyle='rgba(255,255,255,.5)'; ctx.strokeStyle='#d8d2c4'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.ellipse(fx,axisY,tubeDia*0.14,tubeDia*0.40,0,0,Math.PI*2);
  ctx.fill(); ctx.stroke(); ctx.restore();
}
// F 光源（G1）：源矩形 (0,0,natW,natH*LED_P) 只取 F 板，残杆/底座清零；cw=ch*natW/(natH*P) 同源比例修变形；F 板竖直中心=yc 骑光轴
function drawLedCropped(x,yc){
  var id='f_led_on';
  if(!PROPS.spriteReady(id)) return;
  var img=PROPS.img(id),ch=ledCropH(),cw=ch*img.naturalWidth/(img.naturalHeight*LED_P);
  ctx.drawImage(img,0,0,img.naturalWidth,img.naturalHeight*LED_P,x-cw*LED_XC,yc-ch*LED_CY,cw,ch);
}
function drawLed(){ drawLedCropped(xLed(),axisY); }
// filmPeep 薄膜观察窗（G2 贴邻）：窗锚=薄膜 x+40、y=axisY−窗高−20；引线=薄膜上缘→窗左缘单段直线+小箭头（删大跨度折线）
function drawFilmPeep(){
  var bw=150,bh=110,fx=filmX();
  var bx=Math.min(fx+40,W-bw-8),wy=Math.max(24,axisY-bh-20);
  ctx.save();
  ctx.strokeStyle='#b45309'; ctx.fillStyle='#b45309'; ctx.lineWidth=1.5;
  var lx0=fx,ly0=axisY-tubeDia*0.5-4,lx1=bx+2,ly1=wy+bh*0.5;
  ctx.beginPath(); ctx.moveTo(lx0,ly0); ctx.lineTo(lx1,ly1); ctx.stroke();
  var la=Math.atan2(ly1-ly0,lx1-lx0);
  ctx.save(); ctx.translate(lx1,ly1); ctx.rotate(la);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-8,-4); ctx.lineTo(-8,4); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(bx+12,wy); ctx.arcTo(bx+bw,wy,bx+bw,wy+bh,12); ctx.arcTo(bx+bw,wy+bh,bx,wy+bh,12);
  ctx.arcTo(bx,wy+bh,bx,wy,12); ctx.arcTo(bx,wy,bx+bw,wy,12); ctx.closePath();
  ctx.fillStyle='rgba(255,255,255,.55)'; ctx.fill();
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2; ctx.stroke();
  var cx=bx+bw/2,cy=wy+bh/2-4,blur=Math.abs(state.cam.vTube-vImg())*cmPx()*0.35;
  var hp=Math.min(bh-40,imgHCm()*cmPx()*2.2);
  if(isFocused()){
    ctx.translate(cx,cy); ctx.scale(-1,-1);
    ctx.lineCap='round'; ctx.lineWidth=Math.max(2,hp*0.16); ctx.strokeStyle='#f59e0b';
    fPath(hp); ctx.stroke();
  }else{
    var r=hp*0.3+blur;
    var g=ctx.createRadialGradient(cx,cy,1,cx,cy,r+6);
    g.addColorStop(0,'rgba(255,196,50,.85)'); g.addColorStop(1,'rgba(255,196,50,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,r+6,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
  ctx.save(); ctx.fillStyle='#8a7c66'; ctx.font='12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('薄膜上的像',bx+bw/2,wy-8);
  ctx.restore();
}
function drawGlowFx(){
  for(var i=glowFx.length-1;i>=0;i--){
    var f=glowFx[i],t=(performance.now()-f.t0)/300;
    if(t>=1){ glowFx.splice(i,1); continue; }
    ctx.save(); ctx.globalAlpha=1-t;
    var c0=f.c||'255,120,100';
    var g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,18+22*t);
    g.addColorStop(0,'rgba('+c0+',.55)'); g.addColorStop(1,'rgba('+c0+',0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(f.x,f.y,18+22*t,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}
function dimLine(x0,x1,y,text){
  ctx.save();
  ctx.strokeStyle=COL_DIM; ctx.fillStyle=COL_DIM; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x0+6,y-3); ctx.lineTo(x0+6,y+3); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x1-6,y-3); ctx.lineTo(x1-6,y+3); ctx.closePath(); ctx.fill();
  ctx.font='12px sans-serif'; ctx.textAlign='center';
  ctx.fillText(text,(x0+x1)/2,y-6);
  ctx.restore();
}
function drawLabelsCam(){
  var xl=xLens(),fx=filmX(),fpx=F_CM*cmPx();
  dimLine(xLed(),xl,axisY+tubeDia*0.5+30,'u='+state.cam.u.toFixed(1)+' cm');
  dimLine(xl,fx,axisY-tubeDia*0.5-24,'v筒='+state.cam.vTube.toFixed(1)+' cm');
  ctx.save();
  ctx.fillStyle='#b45309'; ctx.font='12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('F',xl-fpx,axisY+tubeDia*0.5+16); ctx.fillText('F',xl+fpx,axisY+tubeDia*0.5+16);
  ctx.fillStyle=COL_DIM;
  ctx.fillText('F 光源（物）',xLed(),ledTop()-8);
  ctx.fillText('凸透镜 f=8cm',xl,axisY-lensH/2-10);
  ctx.fillText('薄膜',fx,axisY+tubeDia*0.5+16);   // G2：观察窗贴薄膜右上，标注移轴下避让引线
  ctx.restore();
  ctx.save(); ctx.fillStyle='#f59e0b';
  ctx.beginPath(); ctx.arc(xl-fpx,axisY,3,0,Math.PI*2); ctx.arc(xl+fpx,axisY,3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
// ===== 场景2 投影仪：亮底会议室（天花板白带=背景层非器材）+器材全预置 mounted =====
function drawCeiling(){
  ctx.save();
  ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,W,ceilBandH());
  ctx.strokeStyle='rgba(0,0,0,.10)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,ceilBandH()+0.5); ctx.lineTo(W,ceilBandH()+0.5); ctx.stroke();
  var g=ctx.createLinearGradient(0,ceilBandH(),0,ceilBandH()+H*0.05);
  g.addColorStop(0,'rgba(0,0,0,.05)'); g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g; ctx.fillRect(0,ceilBandH(),W,H*0.05);
  ctx.restore();
}
function drawCeilScreen(){   // screen_wide 倒挂天花板（幕面朝下受光）
  ctx.save(); ctx.translate(xMir(),ceilBandH()); ctx.scale(1,-1);
  PROPS.screen_wide(ctx,0,0,{h:hScr()});
  ctx.restore();
}
function drawRightScreen(){  // G7/G9：光幕固定右端 x=W*0.86，屏面中心骑光轴（y=axisY+0.42h）
  PROPS.screen(ctx,xScr2(),axisY+Math.round(SCR_AX*scrH),{h:scrH});
}
// G8 黑盒机身：深灰圆角矩形包投影片+透镜（左缘=投影片−20、右缘=透镜+30、高=tubeDia*1.5 骑轴）；镜头筒=右端面伸出短筒（两段矩形环）指向光幕
function drawProjBody(){
  var xl=xLens2(),x0=xLed2()-20,x1=xl+30,hh=tubeDia*1.5,r=10;
  ctx.save();
  ctx.fillStyle='#3f4650';
  ctx.beginPath();
  ctx.moveTo(x0+r,axisY-hh/2); ctx.arcTo(x1,axisY-hh/2,x1,axisY+hh/2,r); ctx.arcTo(x1,axisY+hh/2,x0,axisY+hh/2,r);
  ctx.arcTo(x0,axisY+hh/2,x0,axisY-hh/2,r); ctx.arcTo(x0,axisY-hh/2,x1,axisY-hh/2,r); ctx.closePath(); ctx.fill();
  var b1w=Math.round(2.0*cmPx()),b2w=Math.round(1.4*cmPx()),r1=hh*0.30,r2=hh*0.21;
  ctx.fillStyle='#2f353d'; ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=1.5;
  ctx.fillRect(x1,axisY-r1,b1w,r1*2); ctx.strokeRect(x1,axisY-r1,b1w,r1*2);
  ctx.fillRect(x1+b1w,axisY-r2,b2w,r2*2); ctx.strokeRect(x1+b1w,axisY-r2,b2w,r2*2);
  ctx.restore();
}
function drawMirror45(){
  if(!state.proj.mirrorOn) return;
  ctx.save(); ctx.translate(xMir(),axisY); ctx.rotate(-Math.PI/4);   // 45° 安放：水平光反射竖直向上
  PROPS.plane_mirror(ctx,0,0,{w:Math.round(8*cmPx()),depth:Math.round(0.8*cmPx()),rough:0});
  ctx.restore();
}
function drawLed2(){   // 投影片语义：倒插=整图翻转 180°（scale(1,-1) 绕 F 板中心）
  var x=xLed2(),yc=axisY,f=state.proj.flipped?-1:1;
  ctx.save(); ctx.translate(x,yc); ctx.scale(1,f); ctx.translate(-x,-yc);
  drawLedCropped(x,axisY);
  ctx.restore();
}
// G6/G7：单物点（F 板上缘）两线——平行光+过光心光；mirrorOn=45° 镜折向上 (dx,dy)→(−dy,−dx)；off=水平直射光幕
function drawRaysProj(){
  var x0=xLed2(),xl=xLens2(),m=vImg2()/state.proj.u,half=OBJ_H_CM/2*cmPx();
  var y0=axisY-half,yS=axisY+half*m,Sx=xl+Math.round(vImg2()*cmPx());   // 像点=倒立（轴下方）
  beam(x0,y0,xl,y0); beam(x0,y0,xl,axisY);
  var outs=[[xl,y0,Sx-xl,yS-y0],[xl,axisY,Sx-xl,yS-axisY]];
  for(var j=0;j<2;j++){
    var ax=outs[j][0],ay=outs[j][1],dx=outs[j][2],dy=outs[j][3];
    if(state.proj.mirrorOn){
      var t=(xMir()+axisY-ax-ay)/(dx+dy);
      if(t<=0){ beam(ax,ay,Sx,yS); continue; }
      var qx=ax+dx*t,qy=ay+dy*t,rx=-dy,ry=-dx;
      if(ry>=0){ beam(ax,ay,qx,qy); continue; }
      var t2=(yHit()-qy)/ry;
      beam(ax,ay,qx,qy); beam(qx,qy,qx+rx*t2,yHit());   // 镜前段+折向上段
    }else{
      var t3=(xScr2()-ax)/dx;
      beam(ax,ay,ax+dx*t3,ay+dy*t3);
    }
  }
}
// 天花板/右端屏上的像：对上=清晰放大倒立（倒插→正立）F；偏离=弥散（模糊度∝|v像−光程|）
function drawProjImage(cx,cy){
  var hpx=imgHCm2()*cmPx(),blur=Math.abs(vImg2()-pathCm2())*cmPx()*0.35,s=state.proj.flipped?1:-1,sharp=isFocused2();
  ctx.save();
  if(!sharp){
    ctx.globalAlpha=0.28;
    var g=ctx.createRadialGradient(cx,cy,1,cx,cy,hpx*0.5+blur);
    g.addColorStop(0,'rgba(255,196,50,.9)'); g.addColorStop(1,'rgba(255,196,50,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,hpx*0.5+blur,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }
  ctx.translate(cx,cy); ctx.scale(s,s);   // 实像倒立；投影片倒插时净效果=正立（常考点）
  ctx.lineCap='round'; ctx.lineWidth=Math.max(2,hpx*0.16); ctx.strokeStyle='#f59e0b';
  if(sharp){ fPath(hpx); ctx.stroke(); }
  else{
    for(var i=0;i<4;i++){
      ctx.save(); ctx.globalAlpha=0.28;
      ctx.translate((i-1.5)*blur*0.7,(i%2?1:-1)*blur*0.5);
      fPath(hpx); ctx.stroke(); ctx.restore();
    }
  }
  ctx.restore();
}
function drawLabelsProj(){
  var xl=xLens2(),fpx=F_CM*cmPx(),yB=axisY+tubeDia*0.75,yT=axisY-tubeDia*0.75;   // 机身下/上缘（G8 高=tubeDia*1.5）
  dimLine(xLed2(),xl,yB+30,'u='+state.proj.u.toFixed(1)+' cm');
  ctx.save();
  ctx.fillStyle='#b45309'; ctx.font='12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('F',xl-fpx,yB+16); ctx.fillText('F',xl+fpx,yB+16);
  ctx.fillStyle=COL_DIM;
  ctx.fillText('投影片（F 光源）'+(state.proj.flipped?'·倒插':'·正插'),xLed2(),yT-12);
  ctx.fillText('凸透镜 f=8cm（拖动=调焦）',xl,yT-28);
  if(state.proj.mirrorOn){
    ctx.fillText('45° 平面镜',xMir(),yB+16);
    ctx.fillText('天花板屏',xMir(),ceilBandH()+hScr()+16);
  }else ctx.fillText('光幕',xScr2(),axisY-Math.round(scrH*0.55)-8);
  ctx.restore();
  ctx.save(); ctx.fillStyle='#f59e0b';
  ctx.beginPath(); ctx.arc(xl-fpx,axisY,3,0,Math.PI*2); ctx.arc(xl+fpx,axisY,3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
// ===== 场景3 放大镜：亮底+F 小物体+拖透镜改 u+右侧 observer_eye 固定=人眼 =====
// G6/G10：单物点（F 板上缘）两线；u 恒<f（clamp≤7.8）→ 出射发散光射入人眼、反向延长虚线交于同侧正立虚像点（跨 f 实像分支已删）
function drawMagRays(){
  var x0=xLed3(),xl=xLens3(),v=vImg3(),half=OBJ_H_CM/2*cmPx(),xE=xEye();
  var y0=axisY-half,yS=axisY+half*(v/state.mag.u),Sx=xl+Math.round(v*cmPx());   // 虚像点（同侧正立）
  beam(x0,y0,xl,y0); beam(x0,y0,xl,axisY);   // 入射：平行光+过光心光
  var outs=[[xl,y0,yS-y0],[xl,axisY,yS-axisY]];
  for(var j=0;j<2;j++){
    var ax=outs[j][0],ay=outs[j][1],dx=Sx-ax,dy=outs[j][2];
    var tf=(xE-ax)/(-dx);
    beam(ax,ay,ax-dx*tf,ay-dy*tf);   // 出射发散光实际射向人眼
    beamDash(ax,ay,Sx,yS);           // 反向延长虚线过虚像点
  }
}
function drawMagImage(){   // G10：恒为正立虚像（虚线轮廓）；u→f 虚像渐大直至画出画外
  var ix=xImg3(),hpx=imgHCm3()*cmPx();
  if(ix<10||ix>W-10||hpx>H*3) return;
  ctx.save(); ctx.translate(ix,axisY);
  ctx.lineCap='round'; ctx.lineWidth=Math.max(2,hpx*0.16); ctx.strokeStyle='#f59e0b';
  ctx.setLineDash([6,5]); ctx.globalAlpha=.85;
  fPath(hpx); ctx.stroke();
  ctx.restore();
}
function drawMagScreen(x){ PROPS.screen(ctx,x,axisY+Math.round(SCR_AX*scrH),{h:scrH}); }   // G5/G9：屏高 0.32H、屏面中心骑轴
function drawLabelsMag(){
  var xl=xLens3(),fpx=F_CM*cmPx();
  dimLine(xLed3(),xl,axisY+tubeDia*0.5+30,'u='+state.mag.u.toFixed(1)+' cm');
  ctx.save();
  ctx.fillStyle='#b45309'; ctx.font='12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('F',xl-fpx,axisY+tubeDia*0.5+16); ctx.fillText('F',xl+fpx,axisY+tubeDia*0.5+16);
  ctx.fillStyle=COL_DIM;
  ctx.fillText('物体（F 小光源）',xLed3(),ledTop()-8);
  ctx.fillText('放大镜 f=8cm',xl,axisY-lensH/2-10);
  if(xImg3()>60) ctx.fillText('虚像（同侧·正立·放大）',xImg3(),Math.max(20,axisY-imgHCm3()*cmPx()/2-14));
  ctx.fillText('人眼',xEye(),axisY-Math.round(H*0.085));
  ctx.restore();
  ctx.save(); ctx.fillStyle='#f59e0b';
  ctx.beginPath(); ctx.arc(xl-fpx,axisY,3,0,Math.PI*2); ctx.arc(xl+fpx,axisY,3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
// ===== 场景视图渲染入口：飞入飞出=旧场景上方飞出/新场景下方飞入 =====
function renderCam(dy){
  ctx.save(); ctx.translate(0,dy);
  drawAxis(); drawTray(); drawCamera();
  if(showRays) drawRaysCam();
  drawLensFilm(); drawFilmImage(); drawFilmPeep(); drawLed();
  if(showLabels) drawLabelsCam();
  drawGlowFx();
  ctx.restore();
}
function renderProj(dy){
  ctx.save(); ctx.translate(0,dy);
  // G7：默认水平光路+正前方光幕；天花板带/天花板屏仅「＋平面镜」按钮态出现
  if(state.proj.mirrorOn){ drawCeiling(); drawCeilScreen(); }else drawRightScreen();
  drawAxis();
  drawProjBody();          // G8 黑盒机身先画，投影片/光路/透镜叠上
  drawLed2();
  if(showRays) drawRaysProj();
  drawMirror45();
  PROPS.lens_convex(ctx,xLens2(),axisY,{h:lensH,f:F_CM});
  if(state.proj.mirrorOn) drawProjImage(xMir(),yHit());
  else drawProjImage(xScr2(),axisY);
  if(showLabels) drawLabelsProj();
  drawGlowFx();
  ctx.restore();
}
function renderMag(dy){
  ctx.save(); ctx.translate(0,dy);
  drawAxis(); drawTray();
  if(showRays) drawMagRays();
  PROPS.lens_convex(ctx,xLens3(),axisY,{h:lensH,f:F_CM});
  drawMagImage();
  var sx=(drag&&drag.k==='screen')?drag.sx:state.mag.screenX;
  if(sx!=null) drawMagScreen(sx);
  drawLedCropped(xLed3(),axisY);
  PROPS.observer_eye(ctx,xEye(),axisY-Math.round(H*0.02),{h:Math.round(H*0.11)});
  if(showLabels) drawLabelsMag();
  drawGlowFx();
  ctx.restore();
}
function renderScene(s,dy){ if(s==='cam') renderCam(dy); else if(s==='proj') renderProj(dy); else renderMag(dy); }
function draw(){
  drawBg();
  var a=state.anim;
  if(!a) renderScene(state.scene,0);
  else{
    var e=easeInOut(Math.min(1,(performance.now()-a.t0)/ANIM_DUR));
    renderScene(a.from,-H*e); renderScene(a.to,H*(1-e));
  }
  updatePanel(); updateBubblePos();
}
// ===== 气泡解说：状态机分支+锚点，边缘翻转、器材跟随、×关闭同分支不再自动重弹（照 c5s1） =====
var bubbleEl=document.getElementById('bubble'),bubbleTxt=document.getElementById('bubble-txt'),bubbleArr=document.getElementById('bubble-arrow');
var hintSt={key:null,ax:0,ay:0,dismissed:null,fadeT:null};
function hintBranch(){
  var C=state.cam;
  var P=state.proj,Mg=state.mag;
  if(state.scene==='proj'){   // 首屏链（G7 默认水平光路）：＋平面镜看光路方向变像性质不变(K3)→调焦→正倒插(常考点)
    if(!P.everMirror) return {key:'p-mirror',ax:(xLed2()+xLens2())/2,ay:axisY-tubeDia*0.75-46,text:'投影仪：光直行穿过凸透镜，像成在正前方的光幕上。点「＋平面镜」——光路在镜面 45° 折向上、像改成在天花板屏。对比读数面板：u、v、像的性质完全相同——平面镜只改变光路方向，不改变像的性质'};
    if(!P.everFocused) return {key:'p-focus',ax:xLens2(),ay:axisY-tubeDia*0.75-46,text:'拖凸透镜（或动「调焦」滑杆）调物距 u（预置 f<u<2f）：调到屏上出现清晰的放大倒立像——这就是投影仪的调焦'};
    if(!P.everFlip) return {key:'p-flip',ax:P.mirrorOn?xMir():xScr2(),ay:P.mirrorOn?yHit()+56:axisY+40,text:'屏上的像是倒立的！怎样让屏幕上的像正过来？试试「倒插投影片」（常考点）'};
    return {key:'p-done',ax:W*0.5,ay:H-ctrlBandH-70,text:'对了！投影片倒插，屏上的像就正立了。f<u<2f 成放大倒立实像=投影仪原理；45° 平面镜只负责把光路「折」向天花板'};
  }
  if(state.scene==='mag'){   // 首屏链（G10 恒 u<f）：贴近拖远看虚像渐大→拖屏承接验证虚像(K5)
    if(!Mg.everDrag) return {key:'m-drag',ax:xLens3(),ay:axisY-lensH/2-24,text:'放大镜：贴近物体（u<f）看到同侧正立放大的虚像。拖透镜慢慢远离物体，看虚像怎样越来越大（放大镜恒在焦点以内使用）'};
    if(!Mg.everScreen) return {key:'m-screen',ax:Math.max(90,xImg3()),ay:axisY-40,text:'虚像能用光屏承接吗？从托盘把光屏拖到透镜左侧虚像的位置试试'};
    return {key:'m-done',ax:W*0.5,ay:H-ctrlBandH-70,text:'屏上没有像：虚像处光并没有实际会聚，屏承接不了，且物像同在透镜一侧。放大镜=u<f 成正立放大虚像'};
  }
  if(!C.everFocused) return {key:'c-focus',ax:filmX(),ay:axisY-tubeDia-14,text:'模型照相机：前纸筒嵌凸透镜、后纸筒蒙半透明薄膜。拖后纸筒（或调「相机焦距」滑杆）改薄膜到透镜的距离，直到薄膜上的 F 变清晰（想想做做：拉筒调距=调像距）'};
  if(!C.everDragLed) return {key:'c-led',ax:xLed(),ay:ledTop()-14,text:'对上焦了！拖整个相机改物距 u：物近（u 小）→像变大、像距也变大，要拉长后筒才能重新对上'};
  if(!C.chalDone){ return {key:'c-chal',ax:filmX(),ay:axisY-tubeDia-14,text:'想让薄膜上的像变大一些，应该怎么操作？（练习4：先移物、再调筒，做对会有确认）'}; }
  if(hintSt.dismissed!=='c-done') return {key:'c-done',ax:filmX(),ay:axisY-tubeDia-14,text:'做对了！物近（u 小）像变大、像距变大，拉长后筒（v筒 变大）承接清晰像——这就是练习4 的答案'};
  return {key:'c-scene',ax:W*0.5,ay:H-ctrlBandH-70,text:'照相机场景通关。点页底分段钮切换投影仪/放大镜场景，返回照相机状态原样恢复'};
}
function updateHint(){
  if(!bubbleEl||state.animating){ hideBubble(); return; }
  var o=hintBranch();
  if(o.key==='c-chal'&&!state.cam.chalH0) state.cam.chalH0=imgHCm();   // 挑战基线像高
  if(o.key===hintSt.key){ hintSt.ax=o.ax; hintSt.ay=o.ay; positionBubble(); return; }
  hintSt.key=o.key; hintSt.ax=o.ax; hintSt.ay=o.ay;
  if(hintSt.dismissed===o.key){ hideBubble(); return; }
  if(bubbleEl.style.display==='block'){
    bubbleEl.classList.remove('show');
    if(hintSt.fadeT) clearTimeout(hintSt.fadeT);
    hintSt.fadeT=setTimeout(showBubbleNow,150);
  }else showBubbleNow();
}
function showBubbleNow(){
  var o=hintBranch(); if(!bubbleEl||!bubbleTxt||o.key!==hintSt.key||hintSt.dismissed===o.key) return;
  bubbleTxt.textContent=o.text;
  bubbleEl.style.display='block';
  positionBubble();
  requestAnimationFrame(function(){ bubbleEl.classList.add('show'); });
}
function hideBubble(){ if(bubbleEl){ bubbleEl.classList.remove('show'); bubbleEl.style.display='none'; } }
function hintReset(){ hintSt.key=null; }
function positionBubble(){
  if(!bubbleEl||!bubbleArr||bubbleEl.style.display!=='block') return;
  var r=cv.getBoundingClientRect(),kx=r.width/W,ky=r.height/H;
  var ax=hintSt.ax*kx,ay=hintSt.ay*ky;
  var bw=bubbleEl.offsetWidth,bh=bubbleEl.offsetHeight;
  var above=ay-bh-22>42;
  var left=Math.max(8,Math.min(r.width-bw-8,ax-bw/2));
  bubbleEl.style.left=Math.round(left)+'px';
  bubbleEl.style.top=Math.round(above?ay-bh-18:ay+18)+'px';
  bubbleEl.classList.toggle('arr-b',above);
  bubbleEl.classList.toggle('arr-t',!above);
  bubbleArr.style.left=Math.round(Math.max(14,Math.min(bw-32,ax-left-9)))+'px';
}
function updateBubblePos(){ if(!state.animating) updateHint(); }
var bubbleX=document.getElementById('bubble-x');
if(bubbleX) bubbleX.addEventListener('click',function(){ hintSt.dismissed=hintSt.key; hideBubble(); });
// ===== 读数面板（幽灵化三级色阶浮层） =====
function updatePanel(){
  var pn=document.getElementById('panel-read'); if(!pn||!pn.classList.contains('show')) return;
  var pu=document.getElementById('pr-u'),pv=document.getElementById('pr-v'),pnat=document.getElementById('pr-nat'),pnote=document.getElementById('pr-note');
  var ths=pn.querySelectorAll('table.rec th');
  if(state.scene==='proj'){   // 场景2：装/取镜两态读数完全相同（K3 考点）
    if(ths[1]) ths[1].textContent='像距 v';
    if(pu) pu.textContent=state.proj.u.toFixed(1)+' cm';
    if(pv) pv.textContent=vImg2().toFixed(1)+' cm（光程 '+pathCm2().toFixed(1)+' cm）';
    if(pnat) pnat.textContent='倒立/放大/实像'+(isFocused2()?'（清晰）':'（弥散）');
    if(pnote) pnote.textContent='平面镜只改光路方向，不改像的性质';
    return;
  }
  if(state.scene==='mag'){   // 场景3（G10：u 恒<f，只有虚像态）：u、|v|、正立/放大/虚像、物像同侧标注
    if(ths[1]) ths[1].textContent='像距 |v|';
    if(pu) pu.textContent=state.mag.u.toFixed(1)+' cm';
    if(pv) pv.textContent=Math.abs(vImg3()).toFixed(1)+' cm（虚像·物像同侧）';
    if(pnat) pnat.textContent='正立/放大/虚像（物像同侧）';
    if(pnote) pnote.textContent='虚像=光不实际会聚、屏承接不了';
    return;
  }
  if(ths[1]) ths[1].textContent='筒距 v筒';
  if(pnote) pnote.textContent='实像=光实际会聚、薄膜能承接';
  var C=state.cam;
  if(pu) pu.textContent=C.u.toFixed(1)+' cm';
  if(pv) pv.textContent=C.vTube.toFixed(1)+' cm（v像='+vImg().toFixed(1)+' cm）';
  if(pnat) pnat.textContent='倒立/缩小/实像'+(isFocused()?'（清晰）':'（弥散）');
}
function showToast(msg){
  var t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){ t.classList.remove('show'); toastTimer=null; },3200);
}
// ===== 命中检测 =====
function localPt(e){ var r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; }
function hitTube(p){   // 后筒可拖区：前筒长 90% 处到薄膜端
  return p.x>xLens()+tubeLf*0.9&&p.x<filmX()+16&&Math.abs(p.y-axisY)<tubeDia*0.75;
}
function camBBox(){   // G2/G3：装配体包围盒=F 板可视左缘→薄膜右缘（含筒径半高）
  return {x0:xLed()-ledVisW()/2-8,x1:filmX()+tubeDia*0.14+8,y0:axisY-tubeDia*0.5-14,y1:axisY+tubeDia*0.5+14};
}
function hitCam(p){ var b=camBBox(); return p.x>=b.x0&&p.x<=b.x1&&p.y>=b.y0&&p.y<=b.y1; }   // G3 整相机拖命中
function hitLensAt(xl,p){ return Math.abs(p.x-xl)<lensH*0.22+10&&Math.abs(p.y-axisY)<lensH/2+14; }
function hitMagScreen(p){ return state.mag.screenX!==null&&Math.abs(p.x-state.mag.screenX)<44&&p.y>axisY-H*0.17-10&&p.y<axisY+H*0.17+10; }
function hitMagTray(p){ return !!toolboxMag&&state.mag.screenX===null&&toolboxMag.pointInCard(p)&&!!toolboxMag.hitSlot(p); }
// ===== 对焦边检+挑战判定 =====
function checkFocus(){
  var C=state.cam,f=isFocused();
  if(f&&!C.focused){
    C.focused=true; C.everFocused=true;
    glowFx.push({x:filmX(),y:axisY,t0:performance.now(),c:'255,214,120'});
    if(window.playMatch) playMatch();
    showToast('清晰！倒立缩小的实像成在薄膜上');
    updateHint();
  }else if(!f&&C.focused){ C.focused=false; updateHint(); }
  if(!C.chalDone&&C.chalH0&&C.focused&&imgHCm()>C.chalH0*1.1){
    C.chalDone=true;
    if(window.playMatch) playMatch();
    updateHint();
  }
}
// 场景2 对焦边检（装/取镜不改变判定：折线光程=右屏光程，K3）
function checkFocus2(){
  var P=state.proj,f=isFocused2();
  if(f&&!P.focused){
    P.focused=true; P.everFocused=true;
    glowFx.push({x:P.mirrorOn?xMir():xScr2(),y:P.mirrorOn?yHit():axisY,t0:performance.now(),c:'255,214,120'});
    if(window.playMatch) playMatch();
    showToast('清晰！放大倒立的实像成在屏上（f<u<2f）');
    updateHint();
  }else if(!f&&P.focused){ P.focused=false; updateHint(); }
}
// ===== 交互（动画期间锁全部输入） =====
cv.addEventListener('pointerdown',function(e){
  if(state.animating) return;
  var p=localPt(e); startPt=p; drag=null;
  if(state.scene==='proj'){
    if(hitLensAt(xLens2(),p)) drag={k:'lens2',dx:p.x-xLens2()};
  }else if(state.scene==='mag'){
    if(hitMagTray(p)){ drag={k:'screen',sx:p.x}; if(window.playPick) playPick(); }
    else if(hitMagScreen(p)) drag={k:'screen',sx:state.mag.screenX};
    else if(hitLensAt(xLens3(),p)) drag={k:'lens3',dx:p.x-xLens3()};
  }else{   // G3/G4：后筒优先（拖筒改 vTube）；其余装配体包围盒整拖改 u（托盘已删）
    if(hitTube(p)) drag={k:'tube',dx:p.x-filmX()};
    else if(hitCam(p)) drag={k:'cam',dx:p.x-xLens()};
  }
  if(drag){ cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; updateHint(); draw(); }
});
cv.addEventListener('pointermove',function(e){
  if(state.animating) return;
  var p=localPt(e);
  if(!drag){
    var hov=false;
    if(state.scene==='cam') hov=hitCam(p);   // 装配体整体=拖拽靶（含后筒）
    else if(state.scene==='proj') hov=hitLensAt(xLens2(),p);
    else hov=hitLensAt(xLens3(),p)||hitMagTray(p)||hitMagScreen(p);
    cv.style.cursor=hov?'pointer':'';
    return;
  }
  if(drag.k==='lens2'){ state.proj.u=clampU2((p.x-drag.dx-xLed2())/cmPx()); state.proj.pfSet=true; syncPfSlider(); checkFocus2(); draw(); return; }
  if(drag.k==='lens3'){
    var u3=clampU3((p.x-drag.dx-xLed3())/cmPx());
    state.mag.u=u3; state.mag.everDrag=true;
    if(u3>=U3_MAX-0.05&&!drag.lim){   // G10：拖到上限气泡（clamp 在 f−0.2，不允许跨 f）
      drag.lim=true;
      showToast('放大镜要在焦点以内用；跨过焦点的世界去『探究凸透镜成像的规律』一节玩');
    }
    if(u3<U3_MAX-0.3) drag.lim=false;
    draw(); return;
  }
  if(drag.k==='screen'){ drag.sx=Math.max(30,Math.min(W-60,p.x)); draw(); return; }
  var C=state.cam;
  if(drag.k==='tube'){ C.vTube=clampV((p.x-drag.dx-xLens())/cmPx()); syncCamSlider(); }   // G3 拖筒→滑杆跟走
  else if(drag.k==='cam'){ C.u=clampU((p.x-drag.dx-xLed())/cmPx()); C.everDragLed=true; } // G3 整拖改 u（F 固定、透镜跟手）
  checkFocus(); draw();
});
function endDrag(e){
  if(!drag) return;
  var p=localPt(e),moved=Math.hypot(p.x-startPt.x,p.y-startPt.y)>=5;
  if(drag.k==='screen'){   // 放到虚像侧→吸附就位：屏上无像+K5 结论；否则回托盘
    var Mg=state.mag;
    if(p.x<xLens3()-20&&vImg3()<0){
      Mg.screenX=Math.max(34,xImg3()); Mg.everScreen=true;
      if(window.playDrop) playDrop();
      showToast('屏上没有像：虚像处光不实际会聚，屏承接不了');
    }else Mg.screenX=null;
    drag=null; cv.style.cursor=''; updateHint(); draw(); return;
  }
  if(moved&&window.playDrop) playDrop();
  drag=null; cv.style.cursor='';
  if(state.scene==='cam') checkFocus();
  else if(state.scene==='proj') checkFocus2();
  updateHint(); draw();
}
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',endDrag);
// ===== 控制条（动画期间锁全部输入） =====
var btnRays=document.getElementById('btn-rays');
if(btnRays) btnRays.addEventListener('click',function(){
  if(state.animating) return;
  showRays=!showRays; btnRays.classList.toggle('on',showRays);
  if(window.playClick) playClick(); draw();
});
var btnLabels=document.getElementById('btn-labels');
if(btnLabels) btnLabels.addEventListener('click',function(){
  if(state.animating) return;
  showLabels=!showLabels; btnLabels.classList.toggle('on',showLabels);
  if(window.playClick) playClick(); draw();
});
var btnPanel=document.getElementById('btn-panel'),panelRead=document.getElementById('panel-read');
if(btnPanel&&panelRead) btnPanel.addEventListener('click',function(){
  if(state.animating) return;
  var show=!panelRead.classList.contains('show');
  panelRead.classList.toggle('show',show); btnPanel.classList.toggle('on',show);
  if(window.playClick) playClick();
  updatePanel();
});
// G3「相机焦距」滑杆（range=vTube V_MIN..V_MAX step0.1）↔ 画布拖后筒双向联动
var rngCamf=document.getElementById('rng-camf'),lblCamf=document.getElementById('lbl-camf');
function syncCamSlider(){ if(rngCamf) rngCamf.value=state.cam.vTube.toFixed(1); }
if(rngCamf){
  rngCamf.min=V_MIN; rngCamf.max=V_MAX; rngCamf.step=0.1; rngCamf.value=state.cam.vTube;
  rngCamf.addEventListener('input',function(){
    if(state.animating||state.scene!=='cam') return;
    state.cam.vTube=clampV(parseFloat(rngCamf.value));
    checkFocus(); draw();
  });
}
// G8「调焦」滑杆（range=透镜 x 语义 u cm）↔ 画布拖透镜双向联动
var rngPf=document.getElementById('rng-pf');
function syncPfSlider(){ if(rngPf) rngPf.value=state.proj.u.toFixed(1); }
if(rngPf){
  rngPf.min=U2_MIN; rngPf.max=U2_MAX; rngPf.step=0.1; rngPf.value=state.proj.u;
  rngPf.addEventListener('input',function(){
    if(state.animating||state.scene!=='proj') return;
    state.proj.u=clampU2(parseFloat(rngPf.value)); state.proj.pfSet=true;
    checkFocus2(); draw();
  });
}
function resetCam(){
  var C=state.cam;
  C.u=U_DEF; C.vTube=V_DEF; C.focused=false; C.everFocused=false; C.everDragLed=false; C.chalH0=0; C.chalDone=false;
  glowFx=[];
  showRays=true; showLabels=false;
  if(btnRays) btnRays.classList.add('on');
  if(btnLabels) btnLabels.classList.remove('on');
  var t=document.getElementById('toast'); if(t) t.classList.remove('show');
  hintSt.dismissed=null; syncCamSlider();
}
function resetProj(){
  var P=state.proj;
  P.u=U2_DEF; P.mirrorOn=false; P.flipped=false; P.focused=false; P.everFocused=false; P.everMirror=false; P.everFlip=false; P.pfSet=false;
  glowFx=[];
  showRays=true; showLabels=false;
  if(btnRays) btnRays.classList.add('on');
  if(btnLabels) btnLabels.classList.remove('on');
  var t=document.getElementById('toast'); if(t) t.classList.remove('show');
  hintSt.dismissed=null; syncProjBtns(); syncPfSlider();
}
function resetMag(){
  var Mg=state.mag;
  Mg.u=U3_DEF; Mg.everDrag=false; Mg.screenX=null; Mg.everScreen=false;
  glowFx=[];
  showRays=true; showLabels=false;
  if(btnRays) btnRays.classList.add('on');
  if(btnLabels) btnLabels.classList.remove('on');
  var t=document.getElementById('toast'); if(t) t.classList.remove('show');
  hintSt.dismissed=null;
}
var btnReset=document.getElementById('btn-reset');
if(btnReset) btnReset.addEventListener('click',function(){
  if(state.animating) return;
  if(state.scene==='cam') resetCam();
  else if(state.scene==='proj') resetProj();
  else resetMag();
  if(window.playClick) playClick(); updateHint(); draw();
});
// ===== 场景2 动作卡（G7）：「＋平面镜」物理两态钮（默认关=水平光路）+ 倒插投影片（两态通用） =====
var btnMirror=document.getElementById('btn-mirror'),btnFlip=document.getElementById('btn-flip');
function syncProjBtns(){
  if(btnMirror){ btnMirror.textContent=state.proj.mirrorOn?'取下平面镜':'＋平面镜'; btnMirror.classList.toggle('on',state.proj.mirrorOn); }
  if(btnFlip){ btnFlip.textContent=state.proj.flipped?'正插投影片':'倒插投影片'; btnFlip.classList.toggle('on',state.proj.flipped); }
}
if(btnMirror) btnMirror.addEventListener('click',function(){
  if(state.animating||state.scene!=='proj') return;
  state.proj.mirrorOn=!state.proj.mirrorOn; state.proj.everMirror=true;
  if(window.playClick) playClick();
  showToast(state.proj.mirrorOn?'＋平面镜：光路 45° 折向上、像成天花板屏——对比读数面板 u/v/像性质完全相同（K3）':'取下镜：光直行、像成正前方光幕（读数不变）——平面镜只改光路方向，不改像的性质');
  syncProjBtns(); updateHint(); draw();
});
if(btnFlip) btnFlip.addEventListener('click',function(){
  if(state.animating||state.scene!=='proj') return;
  state.proj.flipped=!state.proj.flipped; state.proj.everFlip=true;
  if(window.playClick) playClick();
  showToast(state.proj.flipped?'倒插：屏上的像正过来了':'正插：屏上的像倒立');
  syncProjBtns(); updateHint(); draw();
});
// ===== 三场景切换（分段三钮物理按压两态）+ 飞入飞出动画（照 c5s1 定版） =====
var btnSc={cam:document.getElementById('btn-sc1'),proj:document.getElementById('btn-sc2'),mag:document.getElementById('btn-sc3')};
function syncSceneUI(){
  for(var k in btnSc){ if(btnSc[k]) btnSc[k].classList.toggle('on',state.scene===k); }
  var g2=document.getElementById('grp-act2');
  if(g2) g2.style.display=(state.scene==='proj')?'':'none';   // 动作卡仅场景2 出现
  if(lblCamf) lblCamf.style.display=(state.scene==='cam')?'':'none';   // G3 相机焦距滑杆仅场景1 出现
  syncProjBtns(); syncCamSlider(); syncPfSlider();
}
function switchScene(to){
  if(state.animating||to===state.scene) return;
  var from=state.scene;
  state.scene=to;                       // 三场景子状态完全隔离，返回原样恢复
  state.animating=true; state.anim={from:from,to:to,t0:performance.now()};
  hideBubble();
  syncSceneUI();
  if(window.playClick) playClick();
}
for(var sk in btnSc){ (function(k){ if(btnSc[k]) btnSc[k].addEventListener('click',function(){ switchScene(k); }); })(sk); }
var btnMute=document.getElementById('btn-mute');
if(btnMute) btnMute.addEventListener('click',function(){ if(state.animating) return; window.muted=!window.muted; btnMute.textContent=window.muted?'🔇':'🔊'; if(window.playClick) playClick(); });
// 全屏（c4s3 路线：documentElement + html.pseudo-fs 降级，CSS/JS 照 c5s1）
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
if(btnFull) btnFull.addEventListener('click',function(){if(state.animating)return;if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();});
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(ev){document.addEventListener(ev,function(){syncFull();setTimeout(resize,60);});});
// ===== sprite 重绘钩子（加性回调，仅注册有 sprite 文件的件） =====
['f_led_on','f_led_off','paper_tube','paper_tube_inner','screen_wide','observer_eye'].forEach(function(id){
  PROPS.onSprite(id,function(){ draw(); });
});
// ===== 动画 tick（飞入飞出 + 对焦光晕 300ms 渐隐） =====
function tick(){
  if(state.animating){
    if(performance.now()-state.anim.t0>=ANIM_DUR){
      state.animating=false; state.anim=null;
      hintReset(); updateHint();   // 动画结束按新场景分支重弹气泡
    }
    draw();
  }else if(glowFx.length||showRays) draw();   // G6：光路开关开启时持续供帧（流动虚线动画）
  requestAnimationFrame(tick);
}
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); if(toolboxMag){ layout(); draw(); } }).observe(ctrlEl);
}
layout(); resize();
syncSceneUI(); updateHint(); draw(); requestAnimationFrame(tick);
window.__c5s2dbg={ get state(){return state;}, get W(){return W;}, get H(){return H;}, get axisY(){return axisY;},
  setU:function(v){ state.cam.u=clampU(v); checkFocus(); updateHint(); draw(); },
  setV:function(v){ state.cam.vTube=clampV(v); syncCamSlider(); checkFocus(); updateHint(); draw(); },
  vImg:vImg, focused:isFocused,
  setU2:function(v){ state.proj.u=clampU2(v); syncPfSlider(); checkFocus2(); updateHint(); draw(); },
  vImg2:vImg2, pathCm2:pathCm2, focused2:isFocused2,
  setU3:function(v){ state.mag.u=clampU3(v); updateHint(); draw(); },
  vImg3:vImg3 };
})();

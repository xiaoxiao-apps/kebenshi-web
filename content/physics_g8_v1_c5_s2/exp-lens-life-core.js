(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
// 本页 cm↔px 单点换算：f=8cm 固定、物像光路约 40cm，c5s1 的 0.096 装不下 → 本页比例常数（单点 H 比例法照 c5s1，禁裸 px）
function cmPx(){ return H*0.030; }
var F_CM=8;                // 模型照相机凸透镜焦距固定 8cm（教材 5~10cm 区间）
var FOCUS_TOL_CM=0.6;      // 薄膜对焦容差：|v筒−v像|≤0.6cm 判清晰（照 c5s1 focusTol 先例）
var U_MIN=17,U_MAX=30,U_DEF=22;   // 物距 clamp（cm，u>2f 倒立缩小实像区间）
var V_MIN=9,V_MAX=15,V_DEF=13;    // 筒距=透镜-薄膜（cm，两筒套接伸缩行程；下限保内筒不穿出外筒前端）
var OBJ_H_CM=3.0;          // 物高（F 发光区）cm；像高=3.0*v像/u cm
var ANIM_DUR=600;          // 场景切换飞入飞出时长（ms，两向对称）
var COL_RAY='#dc2626';
var COL_DIM='#854d0e';
var COMPACT_H=600;
var ctrlBandH=150;
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
var W=960,H=520,DPR=1,axisY=260,fy=470,by=361;
var showRays=true,showLabels=false;
// 三场景状态完全隔离：cam=模型照相机全交互；proj/mag 阶段2 填（本阶段空舞台）
var state={
  scene:'cam',
  animating:false,anim:null,   // anim={from,to,t0}；animating 期间锁全部输入
  cam:{u:U_DEF,vTube:V_DEF,focused:false,everFocused:false,everDragLed:false,chalH0:0,chalDone:false},
  proj:{},
  mag:{}
};
function cur(){ return state[state.scene]; }
var drag=null,startPt=null,glowFx=[];
var toolbox=null,toastTimer=null;
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
// H 比例缓存（proportions() 赋值）
var hLed,tubeH,tubeDia,lensH,seatLed,seatTube;
function proportions(){
  hLed=H*0.33;                 // F 光源 sprite 绘制高（F 发光区中心=底面上 0.75h）
  tubeH=10*cmPx()/0.862;       // 外筒 sprite 有效长 0.862w → 前筒长 10cm
  tubeDia=0.325*tubeH;         // 筒身直径（sprite 实测 0.325h）
  lensH=4.5*cmPx();            // 透镜孔径 4.5cm
}
function layout(){
  // fy 先算（控制条顶=canvas 逻辑坐标）→ by=fy−109 锁常量 → seatY 坐深居中（c4s3/c5s1 常量法）
  var cbR=ctrlEl?ctrlEl.getBoundingClientRect():null,cvR=cv.getBoundingClientRect();
  fy=(cbR&&cvR&&cvR.height>0)?Math.round(H*(cbR.top-cvR.top)/cvR.height):Math.round(H*0.91);
  by=fy-109;
  seatLed=PROPS.seatY(by,64,H*0.077);
  axisY=Math.round(seatLed-0.75*hLed);    // F 发光区中心骑光轴（光源立桌面）
  seatTube=axisY+tubeDia/2+0.3375*tubeH;  // paper_tube 锚点=sprite 底 → 筒身中心骑光轴
  var cardH=100;
  var card={x:16,y:H-ctrlBandH-12-cardH,w:110,h:cardH,r:10,fill:'rgba(255,255,255,0.88)',stroke:'#c9c0ae'};
  var nat={f_led:{w:800,h:800}};
  var items=[{id:'f_led',x:card.x+55,y:card.y+55}];   // 场景1 器材全预置，托盘仅备 F 光源一件
  var fit=(H<COMPACT_H)?Math.min(72,Math.round(H*0.14)):72;
  toolbox=PROPS.toolbox.create({card:card,items:items,fit:fit,nat:nat});
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
  draw();
}
function clampU(u){ return Math.max(U_MIN,Math.min(U_MAX,u)); }
function clampV(v){ return Math.max(V_MIN,Math.min(V_MAX,v)); }
// ===== 几何换算（canvas y 向下）：物在透镜左 x=x_lens−u*cmPx；倒立实像画轴下方 =====
function xLens(){ return Math.round(W*0.62); }
function xLed(){ return xLens()-state.cam.u*cmPx(); }
function filmX(){ return xLens()+state.cam.vTube*cmPx(); }
function vImg(){ var u=state.cam.u; return u*F_CM/(u-F_CM); }   // v像=u*f/(u−f)
function imgHCm(){ return OBJ_H_CM*vImg()/state.cam.u; }
function isFocused(){ return Math.abs(state.cam.vTube-vImg())<=FOCUS_TOL_CM; }
// ===== 绘制：背景/窗/桌/轴 =====
function drawBg(){
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#faf8f3'); g.addColorStop(1,'#f5f2ec');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}
// 场景1 左侧「明亮窗户」背景层（背景非器材）：较暗室内对明亮室外语义
function drawWindow(){
  var x0=W*0.09,x1=W*0.37,y0=H*0.07,y1=by-6;
  var g=ctx.createLinearGradient(0,y0,0,y1);
  g.addColorStop(0,'#e8f6ff'); g.addColorStop(1,'#cfe8ff');
  ctx.save();
  ctx.fillStyle=g; ctx.fillRect(x0,y0,x1-x0,y1-y0);
  var rg=ctx.createRadialGradient((x0+x1)/2,(y0+y1)/2,10,(x0+x1)/2,(y0+y1)/2,(x1-x0)*0.9);
  rg.addColorStop(0,'rgba(255,255,240,.55)'); rg.addColorStop(1,'rgba(255,255,240,0)');
  ctx.fillStyle=rg; ctx.fillRect(x0-40,y0-40,x1-x0+80,y1-y0+80);
  ctx.strokeStyle='#8a7c66'; ctx.lineWidth=6; ctx.strokeRect(x0,y0,x1-x0,y1-y0);
  ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo((x0+x1)/2,y0); ctx.lineTo((x0+x1)/2,y1);
  ctx.moveTo(x0,(y0+y1)/2); ctx.lineTo(x1,(y0+y1)/2); ctx.stroke();
  ctx.restore();
}
function drawDesk(){ PROPS.wood_desk(ctx,W,H,{by:by,fy:fy}); }
function drawAxis(){
  ctx.save();
  ctx.strokeStyle='rgba(26,26,26,.45)'; ctx.lineWidth=1; ctx.setLineDash([14,5,3,5]);
  ctx.beginPath(); ctx.moveTo(0,axisY); ctx.lineTo(W,axisY); ctx.stroke();
  ctx.restore();
}
function drawTray(){
  toolbox.drawCard(ctx);
  var s=toolbox.slots[0];
  if(s) PROPS.f_led(ctx,s.x,s.y+36,{h:72});   // slot 只放缩略图不放文字标签
}
function beam(x0,y0,x1,y1){
  ctx.save(); ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1);
  ctx.strokeStyle=COL_RAY; ctx.lineWidth=2; ctx.stroke();
  ctx.restore();
}
// ===== 场景1 光路：物点(F 发光区上/下缘)发平行光+过光心光，会聚于像点；薄膜偏离像位→弥散 =====
function rayEnds(y0){
  var xl=xLens(),fpx=F_CM*cmPx(),fx=filmX();
  var mPar=(axisY-y0)/fpx, yPar=y0+mPar*(fx-xl);          // 平行光折射后过后焦点
  var mCen=(y0-axisY)/(xl-xLed()), yCen=axisY+mCen*(fx-xl); // 过光心直进
  return {yPar:yPar,yCen:yCen,mCen:mCen};
}
function drawRaysCam(){
  var x0=xLed(),xl=xLens(),fx=filmX(),half=OBJ_H_CM/2*cmPx();
  var ys=[axisY-half,axisY+half];
  for(var i=0;i<2;i++){
    var y0=ys[i],r=rayEnds(y0);
    beam(x0,y0,xl,y0); beam(xl,y0,fx,r.yPar);       // 平行光支
    beam(x0,y0,xl,axisY); beam(xl,axisY,fx,r.yCen); // 光心支
  }
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
// 照相机装配：前筒(外筒 sprite)+后筒(内筒 sprite 经 innerX 反向语义=两筒相对平移伸缩；内筒先画外筒后画遮挡照 props.js)+前端透镜+末端薄膜
function drawCamera(){
  var xl=xLens(),xF=xl+0.431*tubeH,xR=filmX()-0.322*tubeH;
  PROPS.paper_tube(ctx,xF,seatTube,{h:tubeH,innerX:xR-xF});
}
function drawLensFilm(){
  var xl=xLens(),fx=filmX();
  PROPS.lens_convex(ctx,xl,axisY,{h:lensH,f:F_CM});   // opt.f 矢量通道，f 固定 8cm
  ctx.save();                                          // 半透明薄膜=代码画圆面（动态内容③）
  ctx.fillStyle='rgba(255,255,255,.5)'; ctx.strokeStyle='#d8d2c4'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.ellipse(fx,axisY,tubeDia*0.16,tubeDia*0.48,0,0,Math.PI*2);
  ctx.fill(); ctx.stroke(); ctx.restore();
}
function drawLed(){
  PROPS.f_led(ctx,xLed(),seatLed,{h:hLed,lit:true});   // 放窗前=明亮景物
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
  ctx.fillText('F 光源（物）',xLed(),seatLed-hLed-8);
  ctx.fillText('凸透镜 f=8cm',xl,axisY-lensH/2-10);
  ctx.fillText('薄膜',fx,axisY-tubeDia*0.5-40);
  ctx.restore();
  ctx.save(); ctx.fillStyle='#f59e0b';
  ctx.beginPath(); ctx.arc(xl-fpx,axisY,3,0,Math.PI*2); ctx.arc(xl+fpx,axisY,3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
// ===== 场景视图渲染入口：飞入飞出=旧场景上方飞出/新场景下方飞入 =====
function renderCam(dy){
  ctx.save(); ctx.translate(0,dy);
  drawWindow(); drawAxis(); drawTray(); drawCamera();
  if(showRays) drawRaysCam();
  drawLensFilm(); drawFilmImage(); drawLed();
  if(showLabels) drawLabelsCam();
  drawGlowFx();
  ctx.restore();
}
function renderEmpty(dy){   // 场景2/3 本阶段空舞台：wood_desk+hint 气泡，交互阶段2 填
  ctx.save(); ctx.translate(0,dy);
  drawAxis();
  ctx.restore();
}
function renderScene(s,dy){ if(s==='cam') renderCam(dy); else renderEmpty(dy); }
function draw(){
  drawBg(); drawDesk();
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
  if(state.scene==='proj') return {key:'s2-empty',ax:W*0.5,ay:axisY-60,text:'投影仪场景阶段2 上线：投影片·凸透镜·平面镜·天花板屏，f<u<2f 放大倒立实像'};
  if(state.scene==='mag') return {key:'s3-empty',ax:W*0.5,ay:axisY-60,text:'放大镜场景阶段2 上线：u<f 正立放大虚像，贴近观察调距离看细节'};
  if(!C.everFocused) return {key:'c-focus',ax:filmX(),ay:axisY-tubeDia-14,text:'模型照相机：前纸筒嵌凸透镜、后纸筒蒙半透明薄膜。拖后纸筒改薄膜到透镜的距离，直到薄膜上的 F 变清晰（想想做做：拉筒调距=调像距）'};
  if(!C.everDragLed) return {key:'c-led',ax:xLed(),ay:seatLed-hLed-14,text:'对上焦了！拖 F 光源改物距 u：物近（u 小）→像变大、像距也变大，要拉长后筒才能重新对上'};
  if(!C.chalDone){ return {key:'c-chal',ax:filmX(),ay:axisY-tubeDia-14,text:'想让薄膜上的像变大一些，应该怎么操作？（练习4：先移物、再调筒，做对会有确认）'}; }
  if(hintSt.dismissed!=='c-done') return {key:'c-done',ax:filmX(),ay:axisY-tubeDia-14,text:'做对了！物近（u 小）像变大、像距变大，拉长后筒（v筒 变大）承接清晰像——这就是练习4 的答案'};
  return {key:'c-scene',ax:W*0.5,ay:H-ctrlBandH-70,text:'照相机场景通关。点页底分段钮切换投影仪/放大镜场景（阶段2 上线），返回照相机状态原样恢复'};
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
  var o=hintBranch(); if(o.key!==hintSt.key||hintSt.dismissed===o.key) return;
  bubbleTxt.textContent=o.text;
  bubbleEl.style.display='block';
  positionBubble();
  requestAnimationFrame(function(){ bubbleEl.classList.add('show'); });
}
function hideBubble(){ if(bubbleEl){ bubbleEl.classList.remove('show'); bubbleEl.style.display='none'; } }
function hintReset(){ hintSt.key=null; }
function positionBubble(){
  if(!bubbleEl||bubbleEl.style.display!=='block') return;
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
  var pu=document.getElementById('pr-u'),pv=document.getElementById('pr-v'),pnat=document.getElementById('pr-nat');
  if(state.scene!=='cam'){   // 场景2/3 读数阶段2 填，先占位
    if(pu) pu.textContent='—'; if(pv) pv.textContent='—'; if(pnat) pnat.textContent='—';
    return;
  }
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
function hitTube(p){   // 后筒可拖区：外筒右段到薄膜端
  var xF=xLens()+0.431*tubeH;
  return p.x>xF+0.2*tubeH&&p.x<filmX()+16&&Math.abs(p.y-axisY)<tubeDia*0.75;
}
function hitLed(p){
  return Math.abs(p.x-xLed())<hLed*0.16+14&&p.y>seatLed-hLed-16&&p.y<seatLed+8;
}
function inCtrlArea(p){ return (toolbox&&toolbox.pointInCard(p))||p.y>H-ctrlBandH; }
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
// ===== 交互（动画期间锁全部输入） =====
cv.addEventListener('pointerdown',function(e){
  if(state.animating) return;
  var p=localPt(e); startPt=p; drag=null;
  if(state.scene!=='cam') return;
  if(toolbox.pointInCard(p)&&toolbox.hitSlot(p)){ drag={k:'led'}; if(window.playPick) playPick(); }
  else if(hitTube(p)) drag={k:'tube',dx:p.x-filmX()};
  else if(hitLed(p)) drag={k:'led'};
  if(drag){ cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; updateHint(); draw(); }
});
cv.addEventListener('pointermove',function(e){
  if(state.animating) return;
  var p=localPt(e);
  if(!drag){
    cv.style.cursor=(state.scene==='cam'&&(hitTube(p)||hitLed(p)||(toolbox.pointInCard(p)&&toolbox.hitSlot(p))))?'pointer':'';
    return;
  }
  var C=state.cam;
  if(drag.k==='tube') C.vTube=clampV((p.x-drag.dx-xLens())/cmPx());
  else if(drag.k==='led'){ C.u=clampU((xLens()-p.x)/cmPx()); C.everDragLed=true; }
  checkFocus(); draw();
});
function endDrag(e){
  if(!drag) return;
  var p=localPt(e),moved=Math.hypot(p.x-startPt.x,p.y-startPt.y)>=5;
  if(moved&&window.playDrop) playDrop();
  drag=null; cv.style.cursor=''; checkFocus(); updateHint(); draw();
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
function resetCam(){
  var C=state.cam;
  C.u=U_DEF; C.vTube=V_DEF; C.focused=false; C.everFocused=false; C.everDragLed=false; C.chalH0=0; C.chalDone=false;
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
  if(window.playClick) playClick(); updateHint(); draw();
});
// ===== 三场景切换（分段三钮物理按压两态）+ 飞入飞出动画（照 c5s1 定版） =====
var btnSc={cam:document.getElementById('btn-sc1'),proj:document.getElementById('btn-sc2'),mag:document.getElementById('btn-sc3')};
function syncSceneUI(){
  for(var k in btnSc){ if(btnSc[k]) btnSc[k].classList.toggle('on',state.scene===k); }
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
function syncFull(){btnFull.textContent=(fullEl()||document.documentElement.classList.contains('pseudo-fs'))?'退出全屏':'全屏';}
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
['f_led_on','f_led_off','paper_tube','paper_tube_inner'].forEach(function(id){
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
  }else if(glowFx.length) draw();
  requestAnimationFrame(tick);
}
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); if(toolbox){ layout(); draw(); } }).observe(ctrlEl);
}
layout(); resize();
syncSceneUI(); updateHint(); draw(); requestAnimationFrame(tick);
window.__c5s2dbg={ get state(){return state;}, get W(){return W;}, get H(){return H;}, get axisY(){return axisY;},
  setU:function(v){ state.cam.u=clampU(v); checkFocus(); updateHint(); draw(); },
  setV:function(v){ state.cam.vTube=clampV(v); checkFocus(); updateHint(); draw(); },
  vImg:vImg, focused:isFocused };
})();

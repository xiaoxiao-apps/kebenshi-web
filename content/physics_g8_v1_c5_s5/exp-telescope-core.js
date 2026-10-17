(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
// ===== 单位制：cm 语义单点换算 S=px/cm（layout 按 W 重算）；教材语义——远处物体 u≫f物，中间像在物镜焦点附近 =====
var TUBE_MIN_CM=22,TUBE_MAX_CM=52,TUBE_DEF_CM=30;   // 镜筒长度滑杆范围（覆盖 f物30+f目15 及较近档 1.2*30+15=51）
var MATCH_TOL_CM=0.6;                                // 对焦匹配判定带 |L−Lmatch|≤0.6cm
var NEAR_U_K=6;                                      // 较近档物距语义 u=6*f物 → v=u*f/(u−f)=1.2*f物（匹配距离稍大）
var COMPACT_H=600;                                   // 小窗紧凑档阈值（照 c5s1/c5s3）
var COL_RAY='#dc2626';
var COL_FLOW='#2563eb';
var COL_IMG='#b45309';                               // 中间像实箭头琥珀深色
var FONT='"Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif';
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var W=960,H=520,DPR=1,axisY=260,S=10,xObjLens=288,ctrlBandH=150,eyeRoom=80;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
var st={
  fObj:20,fEye:10,L:TUBE_DEF_CM,near:false,
  objOn:false,eyeOn:false,
  wasMatch:false,everMatch:false,angleSeen:false,
  flow:false
};
var drag=null,startPt=null,toolbox=null,trayCard=null,glowFx=[],toastTimer=null;
var flowT0=performance.now();
// ===== 几何换算（cm→px 全部走 S 单点） =====
function vObjCm(){ return st.near?(NEAR_U_K*st.fObj/(NEAR_U_K-1)):st.fObj; }   // 中间像距 v=uf/(u−f)；最远档 u→∞ ⇒ v=f物
function lMatchCm(){ return vObjCm()+st.fEye; }                                // 匹配镜筒距离：最远≈f物+f目；较近稍大
function isMatch(){ return st.objOn&&st.eyeOn&&Math.abs(st.L-lMatchCm())<=MATCH_TOL_CM; }
function magK(){ return st.fObj/st.fEye; }                                     // 放大倍率=f物÷f目
function xEyeLens(){ return xObjLens+st.L*S; }
function xImg(){ return xObjLens+vObjCm()*S; }
function eyeXY(){ return {x:Math.min(W-30,xEyeLens()+eyeRoom*0.55),y:axisY-H*0.045,h:Math.max(30,H*0.09)}; }
function objAp(){ return H*0.34; }   // 物镜孔径显示高
function eyeAp(){ return H*0.22; }   // 目镜孔径显示高（更小）
function hImg(){ return st.near?H*0.065:H*0.05; }   // 中间像高（倒立缩小实像，显示语义）
function groundY(){ return axisY+H*0.20; }
function objScale(){ return st.near?1.25:1; }
function objX(){ return st.near?W*0.115:W*0.07; }
function objTopY(){ return groundY()-H*0.30*objScale(); }
function clampL(v){ return Math.max(TUBE_MIN_CM,Math.min(TUBE_MAX_CM,Math.round(v*2)/2)); }
function layout(){
  axisY=Math.round(H*0.5);
  xObjLens=Math.round(W*0.30);
  eyeRoom=Math.max(70,W*0.075);
  S=(W*0.94-xObjLens-eyeRoom)/TUBE_MAX_CM;   // 单点换算：最长镜筒不出画布右缘
  // 托盘左下（照 c5s3 J8）：控制条上方 10px，slot 只放缩略图
  var cardH=124;
  var card={x:14,y:H-ctrlBandH-cardH-10,w:300,h:cardH,r:10,fill:'rgba(243,233,215,0.95)',stroke:'#b45309'};
  var nat={obj_lens:{w:56,h:56},eye_lens:{w:56,h:56}};
  var ids=['obj_lens','eye_lens'],items=[];
  for(var i=0;i<ids.length;i++) items.push({id:ids[i],x:card.x+80+i*140,y:card.y+64});
  var fit=(H<COMPACT_H)?Math.min(100,Math.round(H*0.19)):100;
  trayCard=card;
  toolbox=PROPS.toolbox.create({card:card,items:items,fit:fit,nat:nat});
}
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl(); layout();   // resize/全屏必重算一切缓存像素坐标（S/xObjLens/托盘）
  draw();
}
// ===== 绘制 =====
function drawBg(){
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#faf8f3'); g.addColorStop(1,'#f5f2ec');   // 亮底（照 c5s1）
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}
function drawAxis(){
  ctx.save();
  ctx.strokeStyle='rgba(26,26,26,.45)'; ctx.lineWidth=1; ctx.setLineDash([14,5,3,5]);
  ctx.beginPath(); ctx.moveTo(0,axisY); ctx.lineTo(W,axisY); ctx.stroke();
  ctx.restore();
}
function drawGround(){
  ctx.save();
  ctx.strokeStyle='rgba(90,80,60,.35)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(0,groundY()); ctx.lineTo(W*0.24,groundY()); ctx.stroke();
  ctx.restore();
}
function treeShape(c,x,baseY,h,col){   // 树剪影（代码画）：树干+三层树冠
  c.save(); c.fillStyle=col;
  c.fillRect(x-h*0.045,baseY-h*0.34,h*0.09,h*0.34);
  for(var i=0;i<3;i++){
    var ty=baseY-h*0.28-i*h*0.24,tw=h*(0.42-i*0.09),th=h*0.34;
    c.beginPath(); c.moveTo(x,ty-th); c.lineTo(x+tw/2,ty); c.lineTo(x-tw/2,ty); c.closePath(); c.fill();
  }
  c.restore();
}
function bldgShape(c,x,baseY,h,col){   // 楼剪影（代码画）：主体+窗格
  c.save(); c.fillStyle=col;
  var w=h*0.5;
  c.fillRect(x-w/2,baseY-h,w,h);
  c.fillStyle='rgba(250,248,243,.55)';
  for(var r=0;r<3;r++) for(var q=0;q<2;q++) c.fillRect(x-w*0.3+q*w*0.32,baseY-h*0.86+r*h*0.26,w*0.18,h*0.14);
  c.restore();
}
function drawObject(){   // 远处物体：左端树+楼剪影（物距≫f物 语义；较近档更大更靠右）
  var k=objScale(),gy=groundY();
  bldgShape(ctx,objX()+H*0.10*objScale(),gy,H*0.26*k,'rgba(71,85,105,.75)');
  treeShape(ctx,objX(),gy,H*0.34*k,'#3f6212');
  ctx.save();
  ctx.fillStyle='rgba(26,26,26,.75)'; ctx.font='14px '+FONT; ctx.textAlign='center';
  ctx.fillText(st.near?'较近的物体':'最远处的物体',objX()+H*0.05*objScale(),gy+18);
  ctx.restore();
}
function haloText(t,x,y){ ctx.save(); ctx.lineWidth=4; ctx.lineJoin='round'; ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.strokeText(t,x,y); ctx.restore(); ctx.fillText(t,x,y); }
function drawLenses(){
  ctx.save();
  ctx.fillStyle='#1a1a1a'; ctx.font='600 16px '+FONT; ctx.textAlign='center';
  if(st.objOn){
    PROPS.lens_convex(ctx,xObjLens,axisY,{h:objAp(),f:st.fObj});   // 库件矢量通道：凸度随 f 联动
    haloText('物镜 f物='+st.fObj+'cm',xObjLens,axisY+objAp()/2+20);
  }
  if(st.eyeOn){
    PROPS.lens_convex(ctx,xEyeLens(),axisY,{h:eyeAp(),f:st.fEye});
    haloText('目镜 f目='+st.fEye+'cm',xEyeLens(),axisY+eyeAp()/2+20);
  }
  ctx.restore();
}
function drawObserver(){   // 眼（库内件 observer_eye）在目镜后
  if(!st.eyeOn) return;
  var e=eyeXY();
  PROPS.observer_eye(ctx,e.x,e.y,{h:e.h});
}
function drawMidImage(){   // 中间像=倒立缩小实像（实箭头代码画，轴下）
  if(!st.objOn) return;
  var x=xImg(),h=hImg();
  ctx.save();
  ctx.strokeStyle=COL_IMG; ctx.fillStyle=COL_IMG; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x,axisY); ctx.lineTo(x,axisY+h-8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x,axisY+h+2); ctx.lineTo(x-6,axisY+h-9); ctx.lineTo(x+6,axisY+h-9); ctx.closePath(); ctx.fill();
  ctx.font='13px '+FONT; ctx.textAlign='center';
  haloText('中间像（倒立缩小实像）',x,axisY+h+20);
  ctx.restore();
}
function beam(x0,y0,x1,y1){   // 照 c5s1：光流开=底线减淡+蓝虚线脉冲流动；关=静态实线
  ctx.save(); ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1);
  if(st.flow){
    ctx.globalAlpha=.3; ctx.strokeStyle=COL_RAY; ctx.lineWidth=2; ctx.stroke();
    ctx.globalAlpha=1; ctx.setLineDash([6,12]);
    ctx.lineDashOffset=-((performance.now()-flowT0)*0.06)%18;
    ctx.strokeStyle=COL_FLOW; ctx.lineWidth=2.4; ctx.stroke();
  }else{
    ctx.strokeStyle=COL_RAY; ctx.lineWidth=2; ctx.stroke();
  }
  ctx.restore();
}
function drawRays(){   // 示意光路：物顶两线经物镜会聚中间像顶；装目镜后再经目镜入眼
  if(!st.objOn) return;
  var tx=objX()+H*0.02*objScale(),ty=objTopY();
  var ap=objAp(),xI=xImg(),yI=axisY+hImg();
  beam(tx,ty,xObjLens,axisY-ap*0.34);   // ① 上部入射 → 折射会聚像顶
  beam(xObjLens,axisY-ap*0.34,xI,yI);
  beam(tx,ty,xObjLens,axisY);           // ② 过光心方向不变
  beam(xObjLens,axisY,xI,yI);
  if(!st.eyeOn) return;
  var e=eyeXY(),xE=xEyeLens();
  beam(xI,yI,xE,axisY);                 // 中间像顶 → 目镜光心 → 眼
  beam(xE,axisY,e.x-e.h*0.45,e.y);
  beam(xI,yI,xE,axisY+eyeAp()*0.30);    // 中间像顶 → 目镜下部 → 发散入眼（目镜相当于放大镜）
  beam(xE,axisY+eyeAp()*0.30,e.x-e.h*0.45,e.y+e.h*0.10);
}
function arrowHead(x,y,dir){
  ctx.save(); ctx.translate(x,y); ctx.rotate(dir);
  ctx.fillStyle=COL_IMG; ctx.beginPath();
  ctx.moveTo(0,0); ctx.lineTo(-7,-3.5); ctx.lineTo(-7,3.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawDim(){   // 镜筒距离尺寸线（两镜之间，双箭头+读数）
  if(!st.objOn||!st.eyeOn) return;
  var x0=xObjLens,x1=xEyeLens(),y=axisY+objAp()/2+44;
  ctx.save();
  ctx.strokeStyle=COL_IMG; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke();
  arrowHead(x0,y,Math.PI); arrowHead(x1,y,0);
  ctx.fillStyle=COL_IMG; ctx.font='14px '+FONT; ctx.textAlign='center';
  var ok=isMatch();
  haloText('镜筒距离 L='+st.L.toFixed(1)+' cm'+(ok?'（已对焦）':''),(x0+x1)/2,y+16);
  ctx.restore();
}
function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function drawEyePeep(){   // 眼视图气泡窗（照 c5s3 eyePeep 先例）：实时画最终正立放大像；离焦=模糊变淡
  if(!st.eyeOn) return;
  var e=eyeXY(),ww=168,wh=118;
  var wx=Math.max(6,Math.min(W-ww-6,e.x-ww*0.35));
  var wy=Math.max(40,e.y-e.h/2-wh-18);
  ctx.save();
  ctx.fillStyle='rgba(255,255,255,0.78)'; ctx.strokeStyle='#d97706'; ctx.lineWidth=2;
  roundRect(wx,wy,ww,wh,12); ctx.fill(); ctx.stroke();
  ctx.beginPath();   // 窗底箭头指眼
  ctx.moveTo(e.x-8,wy+wh); ctx.lineTo(e.x+8,wy+wh); ctx.lineTo(e.x,wy+wh+12); ctx.closePath();
  ctx.fillStyle='rgba(255,255,255,0.78)'; ctx.fill(); ctx.stroke();
  ctx.fillStyle='#b45309'; ctx.textAlign='center'; ctx.font='600 15px '+FONT;
  ctx.fillText('眼视图',wx+ww/2,wy+17);
  var cx=wx+ww/2,base=wy+wh-12;
  if(!st.objOn){
    ctx.fillStyle='#64748b'; ctx.font='15px '+FONT;
    ctx.fillText('还需装上物镜',cx,wy+wh/2+8);
    ctx.restore(); return;
  }
  var defoc=Math.abs(st.L-lMatchCm());   // 离焦度（cm）：模糊+变淡
  var blur=Math.min(6,defoc*0.9);
  ctx.globalAlpha=Math.max(.4,1-defoc*0.07);
  if(blur>0.4&&typeof ctx.filter==='string') ctx.filter='blur('+blur.toFixed(1)+'px)';
  var m=magK(),th=Math.max(wh*0.20,Math.min(wh*0.66,wh*0.24*m));   // 最终正立放大像：树高随倍率
  treeShape(ctx,cx,base,th*1.9,'#3f6212');
  bldgShape(ctx,cx+ww*0.28,base,th*1.3,'rgba(71,85,105,.75)');
  ctx.filter='none'; ctx.globalAlpha=1;
  ctx.fillStyle='#b45309'; ctx.font='13px '+FONT;
  ctx.fillText(defoc<=MATCH_TOL_CM?'正立放大的像（已对焦）':'像模糊——调镜筒长度对焦',cx,wy+34);
  ctx.restore();
}
function drawTray(){   // 器材托盘：物镜/目镜两缩略图（均库内件 lens_convex）
  toolbox.drawCard(ctx);
  ctx.save(); ctx.fillStyle='#8a6d3b'; ctx.textAlign='left'; ctx.font='15px '+FONT;
  ctx.fillText('器材托盘',trayCard.x+8,trayCard.y+16); ctx.restore();
  var slots=toolbox.slots,cardH=trayCard.h,bot=trayCard.y+cardH-14;
  for(var i=0;i<slots.length;i++){
    var s=slots[i];
    var th=Math.min(s.h*0.8,cardH-40);
    ctx.save();
    if((s.id==='obj_lens'&&st.objOn)||(s.id==='eye_lens'&&st.eyeOn)) ctx.globalAlpha=0.30;   // 已上轴=缩略图压淡
    PROPS.lens_convex(ctx,s.x,bot-th/2,{h:th,f:s.id==='obj_lens'?st.fObj:st.fEye});
    ctx.restore();
    ctx.save(); ctx.fillStyle='#8a6d3b'; ctx.font='14px '+FONT; ctx.textAlign='center';
    ctx.fillText(s.id==='obj_lens'?'物镜':'目镜',s.x,bot+13);
    ctx.restore();
  }
}
function drawGlowFx(){   // 对焦光晕 300ms 渐隐（照 c5s3 glowFx 先例）
  for(var i=glowFx.length-1;i>=0;i--){
    var f=glowFx[i],t=(performance.now()-f.t0)/300;
    if(t>=1){ glowFx.splice(i,1); continue; }
    ctx.save(); ctx.globalAlpha=1-t;
    var c0=f.c||'255,214,120';
    var g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,18+22*t);
    g.addColorStop(0,'rgba('+c0+',.55)'); g.addColorStop(1,'rgba('+c0+',0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(f.x,f.y,18+22*t,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}
function draw(){
  drawBg(); drawAxis(); drawGround(); drawObject();
  drawRays(); drawLenses(); drawMidImage(); drawDim(); drawObserver();
  drawTray(); drawGlowFx(); drawEyePeep();
  updatePanel(); sayHint();
}
// ===== 读数面板：f物/f目/镜筒距离/放大倍率=f物÷f目 实时 =====
function updatePanel(){
  var pn=document.getElementById('panel-read'); if(!pn||!pn.classList.contains('show')) return;
  var po=document.getElementById('pr-fobj'),pe=document.getElementById('pr-feye'),pt=document.getElementById('pr-tube'),pm=document.getElementById('pr-mag');
  if(po) po.textContent=st.objOn?(st.fObj+' cm'):'—（未上轴）';
  if(pe) pe.textContent=st.eyeOn?(st.fEye+' cm'):'—（未上轴）';
  if(pt) pt.textContent=(st.objOn&&st.eyeOn)?(st.L.toFixed(1)+' cm'+(isMatch()?'（已对焦）':'')):'—';
  if(pm) pm.textContent=(st.objOn&&st.eyeOn)?(magK().toFixed(magK()%1?2:0)+' 倍（f物÷f目）'):'—';
}
// ===== hint 状态机（橙色居中解说条，照 c5s3 I7）：当前可见分支同步教已产生视觉后果的操作 =====
var toastEl=document.getElementById('toast'),toastTxt=document.getElementById('toast-txt'),toastXEl=document.getElementById('toast-x');
var hintSt={key:null,dismissed:null};
var ANGLE_SVG='<svg width="212" height="60" viewBox="0 0 212 60" xmlns="http://www.w3.org/2000/svg">'
 +'<line x1="6" y1="15" x2="150" y2="15" stroke="#b45309" stroke-width="1" opacity=".5"/>'
 +'<path d="M12 9 L18 15 L12 21 L15 15 Z" fill="#3f6212"/><line x1="148" y1="15" x2="14" y2="10" stroke="#dc2626" stroke-width="1.4"/><line x1="148" y1="15" x2="14" y2="20" stroke="#dc2626" stroke-width="1.4"/><circle cx="152" cy="15" r="4" fill="#334155"/>'
 +'<text x="160" y="19" font-size="12" fill="#5b3a00">裸眼视角小</text>'
 +'<line x1="6" y1="45" x2="150" y2="45" stroke="#b45309" stroke-width="1" opacity=".5"/>'
 +'<path d="M8 33 L20 45 L8 57 L13 45 Z" fill="#3f6212"/><line x1="148" y1="45" x2="10" y2="32" stroke="#dc2626" stroke-width="1.4"/><line x1="148" y1="45" x2="10" y2="58" stroke="#dc2626" stroke-width="1.4"/><circle cx="152" cy="45" r="4" fill="#334155"/>'
 +'<text x="160" y="49" font-size="12" fill="#5b3a00">望远镜视角大</text></svg>';
function hintBranch(){
  if(!st.objOn) return {key:'h-noobj',text:'望远镜由两块凸透镜组成。从下方器材托盘把「物镜」拖出来——拖出即自动挂上光轴。它负责把远处物体的光会聚成中间像。'};
  if(!st.eyeOn) return {key:'h-noeye',text:'物镜已上轴：远处物体的光在物镜焦点附近成倒立、缩小的实像（橙色实箭头=中间像）。再把「目镜」拖上光轴——中间像落在目镜焦点内，目镜的作用相当于放大镜。'};
  if(!st.everMatch) return {key:'h-tune',text:'拖「镜筒长度」滑杆（或直接拖动目镜）调两镜间距。观察最远处物体时，匹配距离≈f物+f目='+lMatchCm().toFixed(0)+' cm——到位会有对焦光晕和提示音。'};
  if(!st.angleSeen) return {key:'h-angle',html:'视角对比：'+ANGLE_SVG+'<div>裸眼看远处物体，视角很小；望远镜把远处物体的像拉近放大，进入眼睛的光张角变大——视角越大，看到的像越大。</div>'};
  return {key:'h-free',text:'放大倍率=f物÷f目='+magK().toFixed(magK()%1?2:0)+' 倍。换器材卡的 f物/f目 看倍率变化；切「物距较近」后匹配距离稍大一些，要重新调镜筒长度；开「光流」看光的传播方向。'};
}
function hideToast(){ if(toastEl) toastEl.classList.remove('show'); }
function sayHint(){
  if(!toastEl||toastTimer) return;   // 事件 toast 占用期间不抢
  var o=hintBranch(); hintSt.key=o.key;
  if(o.key==='h-angle') st.angleSeen=true;
  if(hintSt.dismissed===o.key){ hideToast(); return; }
  if(o.html){ if(toastTxt.innerHTML!==o.html) toastTxt.innerHTML=o.html; }
  else{ if(toastTxt.textContent!==o.text) toastTxt.textContent=o.text; }
  if(!toastEl.classList.contains('show')) toastEl.classList.add('show');
}
function showToast(msg){   // 事件 toast：覆盖解说条 4s，到时回落当前 hint
  if(!toastEl) return;
  if(toastTimer) clearTimeout(toastTimer);
  toastTxt.textContent=msg; toastEl.classList.add('show');
  toastTimer=setTimeout(function(){ toastTimer=null; sayHint(); },4000);
}
if(toastXEl) toastXEl.addEventListener('click',function(){ hintSt.dismissed=hintSt.key; hideToast(); });
// ===== 对焦判定（边缘触发：光晕+音效，照 c5s3 glowFx/playMatch 先例） =====
function checkMatch(){
  var m=isMatch();
  if(m&&!st.wasMatch){
    st.everMatch=true;
    glowFx.push({x:xEyeLens(),y:axisY,t0:performance.now(),c:'255,214,120'});
    glowFx.push({x:xImg(),y:axisY,t0:performance.now(),c:'255,214,120'});
    if(window.playMatch) playMatch();
    showToast('对焦成功！镜筒距离 '+st.L.toFixed(1)+' cm ≈ f物+f目——从目镜后看到清晰、正立、放大的像（眼视图窗）');
  }
  st.wasMatch=m;
}
function setL(v){ st.L=clampL(v); syncSlider(); checkMatch(); }
// ===== 命中检测 =====
function localPt(e){ var r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; }
function hitLensObj(p){ return st.objOn&&Math.abs(p.x-xObjLens)<objAp()*0.22+14&&Math.abs(p.y-axisY)<objAp()/2+10; }
function hitLensEye(p){ return st.eyeOn&&Math.abs(p.x-xEyeLens())<eyeAp()*0.25+14&&Math.abs(p.y-axisY)<eyeAp()/2+10; }
function inTray(p){ return toolbox.pointInCard(p); }
// ===== 交互：托盘拖出即成品挂光轴；拖目镜=调镜筒长度；透镜拖回托盘=收回 =====
cv.addEventListener('pointerdown',function(e){
  var p=localPt(e); startPt=p; drag=null;
  if(inTray(p)){
    var slot=toolbox.hitSlot(p);
    if(slot&&slot.id==='obj_lens'&&!st.objOn){ st.objOn=true; drag={k:'obj'}; if(window.playPick) playPick(); checkMatch(); }
    else if(slot&&slot.id==='eye_lens'&&!st.eyeOn){ st.eyeOn=true; drag={k:'eye'}; if(window.playPick) playPick(); checkMatch(); }
  }
  if(!drag){
    if(hitLensEye(p)) drag={k:'tube'};      // 拖目镜=直接调两镜间距（核心交互）
    else if(hitLensObj(p)) drag={k:'obj'};  // 物镜固定位，拖动仅用于收回
  }
  if(drag){ cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; sayHint(); draw(); }
});
cv.addEventListener('pointermove',function(e){
  var p=localPt(e);
  if(!drag){
    cv.style.cursor=(hitLensObj(p)||hitLensEye(p)||(inTray(p)&&toolbox.hitSlot(p)))?'pointer':'';
    return;
  }
  if(drag.k==='tube'){
    setL((p.x-xObjLens)/S);
    draw();
  }
});
function endDrag(e){
  if(!drag) return;
  var p=localPt(e);
  var moved=Math.hypot(p.x-startPt.x,p.y-startPt.y)>=5;
  if(moved&&inTray(p)){   // 拖回托盘=收回（目镜含拖 tube 态松手在托盘）
    if(drag.k==='tube'){ if(st.eyeOn){ st.eyeOn=false; st.wasMatch=false; if(window.playDrop) playDrop(); } }
    else if(drag.k==='eye'){ if(st.eyeOn){ st.eyeOn=false; st.wasMatch=false; if(window.playDrop) playDrop(); } }
    else if(drag.k==='obj'){ if(st.objOn){ st.objOn=false; st.wasMatch=false; if(window.playDrop) playDrop(); } }
  }else if(moved&&(drag.k==='tube'||drag.k==='obj'||drag.k==='eye')){
    if(window.playDrop) playDrop();
  }
  drag=null; cv.style.cursor=''; syncSlider(); sayHint(); draw();
}
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',endDrag);
// ===== 控制条 =====
var selFobj=document.getElementById('sel-fobj'),selFeye=document.getElementById('sel-feye');
if(selFobj) selFobj.addEventListener('change',function(){
  st.fObj=+selFobj.value; st.wasMatch=false;
  if(window.playClick) playClick();
  checkMatch(); sayHint(); draw();
});
if(selFeye) selFeye.addEventListener('change',function(){
  st.fEye=+selFeye.value; st.wasMatch=false;
  if(window.playClick) playClick();
  checkMatch(); sayHint(); draw();
});
var rngT=document.getElementById('rng-tube'),lblT=document.getElementById('lbl-tube');
function syncSlider(){
  if(rngT) rngT.value=st.L;
  if(lblT) lblT.textContent='L = '+st.L.toFixed(1)+' cm';
}
if(rngT) rngT.addEventListener('input',function(){ setL(+rngT.value); draw(); });
function nudgeL(d){ setL(st.L+d*0.5); if(window.playClick) playClick(); draw(); }
var bTd=document.getElementById('btn-tube-down'),bTu=document.getElementById('btn-tube-up');
if(bTd) bTd.addEventListener('click',function(){ nudgeL(-1); });
if(bTu) bTu.addEventListener('click',function(){ nudgeL(1); });
// 动作卡：物距最远/较近互斥两态钮
var bFar=document.getElementById('btn-far'),bNear=document.getElementById('btn-near');
function syncDistUI(){
  if(bFar) bFar.classList.toggle('on',!st.near);
  if(bNear) bNear.classList.toggle('on',st.near);
}
function setNear(v){
  if(st.near===v) return;
  st.near=v; st.wasMatch=false;
  syncDistUI(); checkMatch();
  if(window.playClick) playClick();
  showToast(v?'切到较近的物体：像距变大，两块凸透镜间的距离要稍大一些（匹配≈'+lMatchCm().toFixed(0)+' cm），重新调镜筒长度':'切到最远处的物体：匹配距离≈f物+f目='+lMatchCm().toFixed(0)+' cm');
  sayHint(); draw();
}
if(bFar) bFar.addEventListener('click',function(){ setNear(false); });
if(bNear) bNear.addEventListener('click',function(){ setNear(true); });
// 显示卡：光流开关（lineDashOffset 先例照 c5s1）
var bFlow=document.getElementById('btn-flow');
if(bFlow) bFlow.addEventListener('click',function(){
  st.flow=!st.flow; bFlow.classList.toggle('on',st.flow);
  if(st.flow) flowT0=performance.now();
  if(window.playClick) playClick(); draw();
});
// 系统卡四件套：读数面板/重置/声音(sfx.js 统一绑定 btn-mute)/全屏
var bTable=document.getElementById('btn-table'),panelRead=document.getElementById('panel-read');
if(bTable&&panelRead) bTable.addEventListener('click',function(){
  var show=!panelRead.classList.contains('show');
  panelRead.classList.toggle('show',show); bTable.classList.toggle('on',show);
  if(window.playClick) playClick();
  updatePanel();
});
var bReset=document.getElementById('btn-reset');
if(bReset) bReset.addEventListener('click',function(){
  st.fObj=20; st.fEye=10; st.L=TUBE_DEF_CM; st.near=false;
  st.objOn=false; st.eyeOn=false;
  st.wasMatch=false; st.everMatch=false; st.angleSeen=false; st.flow=false;
  glowFx=[];
  if(selFobj) selFobj.value='20';
  if(selFeye) selFeye.value='10';
  if(bFlow) bFlow.classList.remove('on');
  syncDistUI(); syncSlider();
  hintSt.key=null; hintSt.dismissed=null;
  if(toastTimer){ clearTimeout(toastTimer); toastTimer=null; }
  if(window.playClick) playClick();
  sayHint(); draw();
});
// ===== 全屏（照抄 c5s3 exp-image-law 现成实现：documentElement + html.pseudo-fs 降级） =====
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
if(btnFull) btnFull.addEventListener('click',function(){if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();});
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(ev){document.addEventListener(ev,function(){syncFull();setTimeout(resize,60);});});
// ===== sprite 重绘钩子（加性回调表，仅注册有 sprite 文件的件；透镜矢量无 sprite） =====
['observer_eye'].forEach(function(id){
  PROPS.onSprite(id,function(){ draw(); });
});
// ===== 动画 tick：光晕 300ms 渐隐 + 光流脉冲逐帧重绘 =====
function tick(){
  if(glowFx.length||st.flow) draw();
  requestAnimationFrame(tick);
}
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); if(toolbox){ layout(); draw(); } }).observe(ctrlEl);
}
// ===== 初始化：托盘+远处物体+空光轴，等用户拖出两镜 =====
layout(); resize();
syncDistUI(); syncSlider(); syncFull();
if(panelRead&&bTable){ panelRead.classList.add('show'); bTable.classList.add('on'); }
sayHint(); draw(); requestAnimationFrame(tick);
window.__c5s5dbg={
  get st(){return st;}, get W(){return W;}, get H(){return H;}, get S(){return S;}, get axisY(){return axisY;}, get xObjLens(){return xObjLens;},
  lMatch:lMatchCm, vObj:vObjCm, mag:magK, isMatch:isMatch,
  mount:function(o,e){ st.objOn=o!==false; st.eyeOn=e!==false; checkMatch(); sayHint(); draw(); },
  setL:function(v){ setL(v); draw(); },
  setF:function(fo,fe){ st.fObj=fo||20; st.fEye=fe||10; if(selFobj)selFobj.value=String(st.fObj); if(selFeye)selFeye.value=String(st.fEye); st.wasMatch=false; checkMatch(); syncSlider(); sayHint(); draw(); },
  near:function(v){ setNear(!!v); }
};
})();

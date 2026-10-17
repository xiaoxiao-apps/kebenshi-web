(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
// ===== 单位制：cm 语义单点换算；cmPx 上界 H*0.096，随轨全长适配收缩（100cm 光具座横贯画布） =====
var RAIL_CM=100,U_LENS_CM=35;       // 滑轨总长 / 透镜固定刻度位（cm，zero='left'）
var HO_CM=3.0;                       // 物高（教材：高度为3.0 cm且带有刻度的发光物体）
var D_CM=7;                          // 透镜孔径（cm）：HO*2 < D 保证顶点平行光线全进孔径
var SC_H_CM=9;                       // 光屏面高（cm）
var F_MIN_CM=2,F_MAX_CM=12,F_DEF_CM=10,F_SNAPS_CM=[10,20],F_SNAP_TOL_CM=0.15;   // f 滑杆：2~12cm 连续+10/20cm 吸附点
var EPS_CM=0.25;                     // u=f 不成像判定带 |u−f|≤eps
var SHARP_TOL_CM=0.6;                // 清晰判据 |v屏−v像|≤0.6cm
var U_MIN_CM=4,U_MAX_CM=30;          // 物距可拖范围
var V_MIN_CM=3,V_MAX_CM=58;          // 屏位 v 范围（透镜右侧，受轨右端限）
var COMPACT_H=600;                   // 小窗紧凑档阈值（照 c5s1）
var ANIM_DUR=520;                    // 自动寻像/撤屏动画时长 ms
var COL_RAY='#dc2626';
var FONT='\"Yuanti SC\",\"YouYuan\",\"PingFang SC\",\"Microsoft YaHei\",sans-serif';
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var W=960,H=520,DPR=1,axisY=200,S=9,railX0=20,xLens=335,ctrlBandH=150;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function cmPx(){ return Math.min(H*0.096,(W-40)/RAIL_CM); }   // 单点换算 px/cm（H*0.096 上界+整轨适配）
function hoPx(){ return HO_CM*S; }
function fPxV(){ return st.f*S; }
function dPxV(){ return D_CM*S; }
function scHPx(){ return SC_H_CM*S; }
function xOfU(u){ return xLens-u*S; }
function xOfV(v){ return xLens+v*S; }
var st={
  u:30,f:F_DEF_CM,vSc:15,            // 初始态：u=30(>2f)、f=10、屏在清晰像位 v=15 → 进页即见倒立缩小实像
  obj:'F',lit:true,
  screenOn:true,screenA:1,eye:false,eyeA:0,eyeOff:0,eyeX:null,
  hand:false,marks:true,rays:true,
  rows:[],anim:null,
  fTip:false,touched:false,snapI:0,wasSharp:true
};
var drag=null,startPt=null,toolbox=null,toastTimer=null,glowFx=[];
function layout(){
  axisY=Math.round(H*0.40);
  S=cmPx(); railX0=20; xLens=railX0+U_LENS_CM*S;
  // 托盘左上角（滑轨横贯中部，托盘不入轨区）；slot 只放缩略图
  var cardH=112;
  var card={x:14,y:12,w:252,h:cardH,r:10,fill:'rgba(255,255,255,0.88)',stroke:'#c9c0ae'};
  var nat={f_led:{w:56,h:56},candle:{w:56,h:56}};
  var ids=['f_led','candle'],items=[];
  for(var i=0;i<ids.length;i++) items.push({id:ids[i],x:card.x+68+i*112,y:card.y+56});
  var fit=(H<COMPACT_H)?Math.min(100,Math.round(H*0.19)):100;
  toolbox=PROPS.toolbox.create({card:card,items:items,fit:fit,nat:nat});
}
function clampU(u){ return Math.max(U_MIN_CM,Math.min(U_MAX_CM,u)); }
function clampV(v){ return Math.max(V_MIN_CM,Math.min(V_MAX_CM,v)); }
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl(); layout();
  st.u=clampU(st.u); st.vSc=clampV(st.vSc);
  draw();
}
function showToast(msg){
  var t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){ t.classList.remove('show'); toastTimer=null; },3600);
}
// ===== 物理引擎：薄透镜成像（主会话已手推象限，canvas y 向下，禁自改符号） =====
// 实像 u>f：v=u*f/(u−f)>0，像 x=x_lens+v*cmPx，m=v/u，像顶 y=axisY+ho*m*cmPx（倒立=轴下），F 图案镜像+上下翻转
// 虚像 u<f：v=u*f/(u−f)<0，像 x=x_lens+v*cmPx（同侧左），m=|v|/u，像顶 y=axisY−ho*m*cmPx（正立），不镜像，反向延长虚线
// |u−f|≤eps：不成像——出射光平行、屏上无像
function vImg(){ return st.u*st.f/(st.u-st.f); }          // v = uf/(u−f)
function imgKind(){ if(Math.abs(st.u-st.f)<=EPS_CM) return 'none'; return st.u>st.f?'real':'virtual'; }
function mag(){ var k=imgKind(); if(k==='none') return NaN; if(k==='real') return vImg()/st.u; return Math.abs(vImg())/st.u; }
function imgX(){ return xLens+vImg()*S; }
function imgH(){ return hoPx()*mag(); }
function isSharp(){ return imgKind()==='real'&&Math.abs(st.vSc-vImg())<=SHARP_TOL_CM; }
function beam(x0,y0,x1,y1){
  ctx.save(); ctx.lineCap='round'; ctx.strokeStyle=COL_RAY; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke(); ctx.restore();
}
function beamDash(x0,y0,x1,y1){   // 反向延长虚线（照 c5s1）
  ctx.save(); ctx.lineCap='round'; ctx.setLineDash([7,6]); ctx.globalAlpha=.75;
  ctx.strokeStyle='#dc2626'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke(); ctx.restore();
}
function refractEnd(xL,yi,m,dir){
  var dx=(dir>0?W+30:-30)-xL;
  if(Math.abs(m)>1e-9){
    var dxc=m>0?(H+20-yi)/m:(-20-yi)/m;
    if(dxc*dir>0&&Math.abs(dxc)<Math.abs(dx)) dx=dxc;
  }
  return {x:xL+dx,y:yi+m*dx};
}
function refractSlope(yi,mIn,dir){   // 近轴薄透镜折射（凸，dir=+1 右行）：m = mIn − dir*(yi−axisY)/fPx
  var hc=yi-axisY;
  return mIn-dir*hc/fPxV();
}
function traceRay(x0,y0,xL,yi,mIn,dir){
  beam(x0,y0,xL,yi);
  if(Math.abs(yi-axisY)>dPxV()/2){   // 孔径裁切：超孔径光线直穿不折射（照 c5s1）
    var e0=refractEnd(xL,yi,mIn,dir);
    beam(xL,yi,e0.x,e0.y);
    return;
  }
  var m=refractSlope(yi,mIn,dir);
  if(Math.abs(m)<1e-9){ beam(xL,yi,dir>0?W+2:-2,yi); return; }   // u=f：出射平行
  var e=refractEnd(xL,yi,m,dir);
  beam(xL,yi,e.x,e.y);
  if(imgKind()==='virtual'){   // 虚像：折射光线反向延长虚线汇聚到像顶
    beamDash(xL,yi,imgX(),axisY-imgH());
  }
}
function drawRays(){
  if(!st.rays||!st.lit) return;
  var px0=xOfU(st.u),py0=axisY-hoPx();   // 物顶点（轴外物点，y≠axisY 推广）
  ctx.save();
  if(st.hand) ctx.globalAlpha=0.55;      // 遮挡：通光量减半
  traceRay(px0,py0,xLens,py0,0,1);       // ① 平行主轴入射 → 折射过另一侧焦点
  var mC=(axisY-py0)/(xLens-px0);
  traceRay(px0,py0,xLens,axisY,mC,1);    // ② 过光心不改变方向
  var f1=xLens-fPxV();
  if(f1>px0+2){                          // ③ 过同侧焦点 → 折射后平行主轴（仅 u>f 时存在）
    var mF=(axisY-py0)/(f1-px0),yi=py0+mF*(xLens-px0);
    if(Math.abs(yi-axisY)<=dPxV()/2) traceRay(px0,py0,xLens,yi,mF,1);
  }
  ctx.restore();
}
// ===== 绘制：亮底+光轴+cm 刻度；三件骑光轴（F3 去桌面/滑轨，排版照 c5s1） =====
function drawBg(){
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#faf8f3'); g.addColorStop(1,'#f5f2ec');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}
function drawAxis(){   // 主光轴点划线（照 c5s1）
  ctx.save();
  ctx.strokeStyle='rgba(26,26,26,.45)'; ctx.lineWidth=1; ctx.setLineDash([14,5,3,5]);
  ctx.beginPath(); ctx.moveTo(0,axisY); ctx.lineTo(W,axisY); ctx.stroke();
  ctx.restore();
}
function drawRuler(){   // cm 刻度语义留光轴：5cm 小刻度线+20cm 数字（F/2F 点由 drawMarks 负责）
  ctx.save();
  ctx.strokeStyle='rgba(90,80,60,.55)'; ctx.lineWidth=1; ctx.textAlign='center';
  ctx.fillStyle='rgba(90,80,60,.8)';
  ctx.font=Math.max(9,Math.round(1.05*S))+'px '+FONT;
  for(var cm=0;cm<=RAIL_CM;cm+=5){
    var x=railX0+cm*S;
    if(x>W-4) break;
    ctx.beginPath(); ctx.moveTo(x,axisY); ctx.lineTo(x,axisY+(cm%10===0?7:4.5)); ctx.stroke();
    if(cm%20===0) ctx.fillText(String(cm),x,axisY+7+Math.max(10,1.2*S));
  }
  ctx.restore();
}
function drawObject(){   // F 形 LED 光源（默认）/ 蜡烛（托盘换用）；包围盒中心骑光轴（F3）
  var x=xOfU(st.u),bot=axisY+hoPx();
  if(st.obj==='candle') PROPS.candle(ctx,x,bot,{h:hoPx()*2,lit:st.lit});
  else PROPS.f_led(ctx,x,bot,{h:hoPx()*2,lit:st.lit});
}
function drawLens(){   // 凸透镜中固定；f 滑杆联动 opt.f 凸度；(x,axisY)=光心骑光轴
  PROPS.lens_convex(ctx,xLens,axisY,{h:dPxV(),f:st.f});
}
function drawHand(){   // 🖐 遮挡：hand_palm 掌心压透镜上半孔径（像仍完整、通光量 0.5，F9）
  if(!st.hand) return;
  if(!(PROPS.spriteReady&&PROPS.spriteReady('hand_palm'))) return;
  var img=PROPS.img('hand_palm');
  var h=dPxV()*0.6,w=h*img.naturalWidth/img.naturalHeight;
  ctx.drawImage(img,xLens-w/2,axisY-dPxV()*0.25-h/2,w,h);
}
function drawScreen(){
  if(st.screenA<=0.02) return;
  var x=xOfV(st.vSc),y=axisY+scHPx()/2;
  ctx.save(); ctx.globalAlpha=st.screenA;
  PROPS.screen(ctx,x,y,{h:scHPx()});
  ctx.restore();
}
function eyeXY(){   // F7 人眼位：st.eyeX 可拖（null=默认屏位），纯观察不改像计算
  return {x:(st.eyeX===null?xOfV(st.vSc):st.eyeX)+st.eyeOff,y:axisY-Math.round(1.2*S),h:Math.max(30,Math.round(4.5*S))};
}
function drawEye(){   // 撤屏后 observer_eye 飞入屏位（库件，(x,y)=包围盒中心）
  if(!st.eye||st.eyeA<=0.02) return;
  var e=eyeXY();
  ctx.save(); ctx.globalAlpha=st.eyeA;
  PROPS.observer_eye(ctx,e.x,e.y,{h:e.h});
  ctx.restore();
}
function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function drawEyePeep(){   // eyePeep 眼视图窗：撤屏态实时画眼睛观察内容（F7）
  if(!st.eye||st.eyeA<=0.6) return;
  var e=eyeXY(),ww=150,wh=110;
  var wx=Math.max(6,Math.min(W-ww-6,e.x-ww/2));
  var wy=Math.max(6,e.y-e.h/2-wh-16);
  ctx.save(); ctx.globalAlpha=Math.min(1,st.eyeA);
  ctx.fillStyle='rgba(255,255,255,0.72)'; ctx.strokeStyle='#d97706'; ctx.lineWidth=2;
  roundRect(wx,wy,ww,wh,12); ctx.fill(); ctx.stroke();
  ctx.beginPath();   // 窗底箭头指眼
  ctx.moveTo(e.x-8,wy+wh); ctx.lineTo(e.x+8,wy+wh); ctx.lineTo(e.x,wy+wh+12); ctx.closePath();
  ctx.fillStyle='rgba(255,255,255,0.72)'; ctx.fill(); ctx.stroke();
  ctx.fillStyle='#b45309'; ctx.textAlign='center';
  ctx.font='600 12px '+FONT;
  ctx.fillText('眼视图',wx+ww/2,wy+16);
  var k=imgKind(),cx=wx+ww/2,cy=wy+wh/2+8;
  if(k==='none'){
    ctx.fillStyle='#64748b'; ctx.font='13px '+FONT;
    ctx.fillText('不成像',cx,cy+4);
  }else if(k==='virtual'){   // 正立放大 F：高=HO_CM*|m| 按比例缩放到窗内，随 u 连续变
    var hp=Math.min(72,HO_CM*Math.abs(mag())*S*0.9);
    ctx.save(); ctx.translate(cx,cy+hp/2); ctx.scale(hp,hp); fPattern(ctx); ctx.restore();
  }else{   // u≥f 撤屏态：倒立实像小图
    var hr=Math.min(44,HO_CM*Math.abs(mag())*S*0.45);
    ctx.save(); ctx.translate(cx,cy-hr/2-6); ctx.scale(-hr,-hr); fPattern(ctx); ctx.restore();
    ctx.fillStyle='#b45309'; ctx.font='11px '+FONT;
    ctx.fillText('空中实像',cx,wy+wh-8);
  }
  ctx.restore();
}
// ===== 像的渲染：F 图案镜像(scale(-1,1))+上下翻转=实像；虚像正立不镜像；蜡烛→简笔火焰图案 =====
function fPattern(c){
  c.fillStyle='#f59e0b';
  c.beginPath(); c.rect(-0.16,-1,0.16,1); c.fill();        // 竖笔
  c.beginPath(); c.rect(-0.16,-1,0.52,0.17); c.fill();     // 上横
  c.beginPath(); c.rect(-0.16,-0.56,0.38,0.16); c.fill();  // 中横
  c.strokeStyle='rgba(120,53,15,.55)'; c.lineWidth=0.02;
  c.beginPath(); c.rect(-0.16,-1,0.52,0.17); c.rect(-0.16,-0.56,0.38,0.16); c.stroke();
}
function flamePattern(c){
  c.fillStyle='#f59e0b';
  c.beginPath(); c.moveTo(0,-0.05);
  c.bezierCurveTo(0.30,-0.30,0.22,-0.72,0,-1);
  c.bezierCurveTo(-0.22,-0.72,-0.30,-0.30,0,-0.05);
  c.closePath(); c.fill();
  c.fillStyle='#fde68a';
  c.beginPath(); c.moveTo(0,-0.14);
  c.bezierCurveTo(0.13,-0.33,0.09,-0.55,0,-0.72);
  c.bezierCurveTo(-0.09,-0.55,-0.13,-0.33,0,-0.14);
  c.closePath(); c.fill();
}
function drawPattern(x,hI,inverted,alpha,blur){   // yBase=axisY；倒立=轴下，正立=轴上
  if(!(hI>1.5)||x<-80||x>W+80) return;
  ctx.save();
  ctx.globalAlpha=Math.max(0,Math.min(1,alpha))*(st.hand?0.5:1);
  if(blur>0.4&&typeof ctx.filter==='string') ctx.filter='blur('+blur.toFixed(1)+'px)';
  ctx.translate(x,axisY);
  var k=inverted?-hI:hI;
  ctx.scale(k,k);   // 实像 scale(−,−)=镜像+上下翻转；虚像正立不镜像
  if(st.obj==='candle') flamePattern(ctx); else fPattern(ctx);
  ctx.restore();
}
function drawImageOnScreen(){   // 屏上像：清晰判据内=清晰；偏离=弥散模糊像（模糊度∝|v屏−v像|，drawSpot 推广）
  if(st.screenA<=0.02||imgKind()!=='real') return;
  var vI=vImg(),dv=Math.abs(st.vSc-vI);
  if(dv<=SHARP_TOL_CM) drawPattern(xOfV(st.vSc),hoPx()*(vI/st.u),true,1,0);
  else{
    var blur=Math.min(16,1.5+dv*S*0.20),a=Math.max(.28,1-dv/16);
    drawPattern(xOfV(st.vSc),hoPx()*(st.vSc/st.u),true,a,blur);
  }
}
function drawVirtualImage(){   // 撤屏+u<f：同侧正立放大虚像呈现
  if(st.screenOn||imgKind()!=='virtual') return;
  drawPattern(imgX(),imgH(),false,1,0);
}
function drawMarks(){   // F/2F 双侧刻度点常驻（显示开关可关）
  if(!st.marks) return;
  ctx.save();
  ctx.fillStyle='#b45309'; ctx.textAlign='center';
  ctx.font='600 '+Math.max(11,Math.round(1.35*S))+'px '+FONT;
  var fs=[-2,-1,1,2];
  for(var i=0;i<4;i++){
    var x=xLens+fs[i]*fPxV();
    if(x<8||x>W-8) continue;
    ctx.beginPath(); ctx.arc(x,axisY,Math.max(2.5,S*0.32),0,Math.PI*2); ctx.fill();
    ctx.fillText(Math.abs(fs[i])===1?'F':'2F',x,axisY-Math.max(7,0.9*S));
  }
  ctx.restore();
}
function drawTray(){
  toolbox.drawCard(ctx);
  var slots=toolbox.slots;
  for(var i=0;i<slots.length;i++){
    var s=slots[i];
    if(s.id==='candle') PROPS.candle(ctx,s.x,s.y+s.h/2,{h:s.h,lit:true});
    else PROPS.f_led(ctx,s.x,s.y+s.h/2,{h:s.h,lit:true});
  }
}
function draw(){
  drawBg(); drawAxis(); drawRuler(); drawMarks();
  drawRays(); drawLens(); drawHand(); drawObject();
  drawScreen(); drawImageOnScreen(); drawEye(); drawVirtualImage();
  drawTray(); drawGlowFx(); drawEyePeep();
  updatePanel(); updateBubblePos();
}
function drawGlowFx(){   // 对焦光晕（照 c5s2：300ms 渐隐，F6）
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
function checkSharpEdge(){   // isSharp 假→真时刻 push 光晕（屏上像位）；自动寻像到位同路径触发
  var s=isSharp();
  if(s&&!st.wasSharp) glowFx.push({x:xOfV(st.vSc),y:axisY,t0:performance.now(),c:'255,214,120'});
  st.wasSharp=s;
}
// ===== 气泡 hint 状态机（照 c5s1：分支+锚点、边缘翻转、×关闭同分支不再自动重弹） =====
var bubbleEl=document.getElementById('bubble'),bubbleTxt=document.getElementById('bubble-txt'),bubbleArr=document.getElementById('bubble-arrow');
var hintSt={key:null,ax:0,ay:0,dismissed:null,fadeT:null};
function hintBranch(){
  var k=imgKind(),x=xOfU(st.u),xSc=xOfV(st.vSc);
  if(st.hand) return {key:'hand',ax:xLens,ay:axisY-dPxV()/2-16,text:'练习6：遮挡透镜一部分，屏上的像仍完整，只是变暗——物上每点发出的光经未遮挡部分仍能会聚成完整的像，只是通光量减少。'};
  if(st.fTip) return {key:'ftip',ax:xLens,ay:axisY-dPxV()/2-16,text:'练习4：焦距变小、会聚能力变强、像距变小——透镜乙(f=10cm)应放在透镜甲(f=20cm)的右侧（靠光屏一侧），光屏上才能重新得到清晰的像。屏上像已模糊，重调屏位验证。'};
  if(!st.screenOn&&k==='virtual') return {key:'vsee',ax:imgX(),ay:axisY-imgH()-14,text:'从光屏一侧向透镜看去：正立、放大的虚像，与物体同侧、屏上接不到。虚线是折射光线的反向延长线。'};
  if(!st.screenOn) return {key:'nosee',ax:xLens,ay:axisY-dPxV()/2-16,text:'光屏已撤。u＜f 时用眼在屏侧观察虚像；u＞f 时实像成在空中（原屏位附近）。点「装回光屏」恢复。'};
  if(k==='none') return {key:'nof',ax:x,ay:axisY-hoPx()-18,text:'u=f：折射光线平行射出，不成像——实像与虚像的分界（一倍焦距分虚实）。向两侧再拖一点点看看。'};
  if(k==='virtual') return {key:'vgo',ax:xSc,ay:axisY-scHPx()/2-14,text:'u＜f，屏上接不到像。教材原句：「当在光屏上看不到发光物体的像时，可以撤去光屏，从光屏一侧向凸透镜方向看去，观察发光物体的像。」点「撤屏观察」试试。'};
  if(Math.abs(st.u-2*st.f)<=EPS_CM) return {key:'e2f',ax:x,ay:axisY-hoPx()-18,text:'u=2f：v=2f，成倒立、等大的实像——大小的分界（二倍焦距分大小）。'};
  if(!isSharp()) return {key:'sharp',ax:xSc,ay:axisY-scHPx()/2-14,text:'屏上像模糊：|v屏−v像|＞0.6cm。拖光屏或点「自动寻像」找清晰像。当前理论像距 v='+vImg().toFixed(1)+' cm。'};
  if(st.rows.length===0) return {key:'rec1',ax:x,ay:axisY-hoPx()-18,text:'清晰像到手！点「记一笔」把 u、v 与像的性质写进记录表；再拖光源跨 u＞2f、f＜u＜2f、u＜f 三区，每区记一笔。'};
  return {key:'law1',ax:xLens,ay:axisY-dPxV()/2-16,text:'点「规律结论卡」对照凸透镜成像规律。托盘可换蜡烛作物体——F 形比蜡烛好：像稳定、可判断左右相反、安全环保、高度不变。'};
}
function updateHint(){
  if(!bubbleEl) { return; }
  var o=hintBranch();
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
function updateBubblePos(){ if(!st.anim) updateHint(); }
var bubbleX=document.getElementById('bubble-x');
if(bubbleX) bubbleX.addEventListener('click',function(){ hintSt.dismissed=hintSt.key; hideBubble(); });
// ===== 读数浮层：u/v/m/像性质实时 =====
function natureText(){
  var k=imgKind();
  if(k==='none') return '不成像（实虚分界）';
  if(k==='virtual') return '正立、放大的虚像（同侧）';
  var m=mag(),sz=Math.abs(m-1)<=0.03?'等大':(m>1?'放大':'缩小');
  var tail=st.screenOn?(isSharp()?'，屏上清晰':'，屏上模糊（Δv='+Math.abs(st.vSc-vImg()).toFixed(1)+'cm）'):'，屏已撤';
  return '倒立、'+sz+'的实像'+tail;
}
function updatePanel(){
  var pn=document.getElementById('panel-read'); if(!pn||!pn.classList.contains('show')) return;
  var k=imgKind();
  var pu=document.getElementById('pr-u'),pv=document.getElementById('pr-v'),pm=document.getElementById('pr-m'),pt=document.getElementById('pr-nat');
  if(pu) pu.textContent=st.u.toFixed(1)+' cm';
  if(pv) pv.textContent=(k==='real')?(vImg().toFixed(1)+' cm（异侧）'):((k==='virtual')?(Math.abs(vImg()).toFixed(1)+' cm（虚像，同侧）'):'∞（出射平行光）');
  if(pm) pm.textContent=(k==='none')?'—':(mag().toFixed(2)+' ×');
  if(pt) pt.textContent=natureText();
}
// ===== 记录表：表头 物距/cm｜虚实｜大小｜正倒｜像高/cm｜像距/cm；同 u 覆盖；关面板不清数据、reset 才清 =====
var TB_US=[4.0,6.0,8.0,10.0,12.0,14.0,16.0,18.0,20.0,22.0,24.0,26.0,28.0];   // 练习5 数据表 13 行（f=10cm 自洽）
var TB_V =[null,null,null,null,60.4,35.6,26.6,22.3,20.0,18.4,17.3,16.6,15.7]; // 像距/cm（前四空）
var TB_H =[null,null,null,null,15.1,7.6,5.0,3.7,3.0,2.5,2.1,1.9,1.7];          // 像高/cm（前四空）
var TB_ZD=['正','正','正',null,'倒','倒','倒','倒','倒','倒','倒','倒','倒'];   // 正倒（正正正空+倒×9）
function textbookRows(){
  var rows=[];
  for(var i=0;i<TB_US.length;i++){
    var u=TB_US[i],xu,size;
    if(u<10){ xu='虚像'; size='放大'; }
    else if(u===10){ xu='\\'; size='\\'; }
    else { xu='实像'; size=(u<20?'放大':(u===20?'等大':'缩小')); }
    rows.push({u:u.toFixed(1),xu:xu,da:size,zd:TB_ZD[i]===null?'\\':TB_ZD[i],
      h:TB_H[i]===null?'\\':TB_H[i].toFixed(1),v:TB_V[i]===null?'\\':TB_V[i].toFixed(1)});
  }
  return rows;
}
function recordCurrent(){
  var k=imgKind(),u=st.u.toFixed(1),xu,size,zd,h,v;
  if(k==='none'){ xu='\\'; size='\\'; zd='\\'; h='\\'; v='\\'; }
  else if(k==='virtual'){ xu='虚像'; size='放大'; zd='正'; h=(HO_CM*mag()).toFixed(1); v='\\'; }
  else{
    var m=mag(); xu='实像'; zd='倒';
    size=Math.abs(m-1)<=0.03?'等大':(m>1?'放大':'缩小');
    h=(HO_CM*m).toFixed(1); v=st.vSc.toFixed(1);
  }
  var row={u:u,xu:xu,da:size,zd:zd,h:h,v:v};
  for(var i=0;i<st.rows.length;i++){ if(st.rows[i].u===u){ st.rows[i]=row; renderRec(); return; } }   // 同 u 覆盖
  st.rows.push(row);
  st.rows.sort(function(a,b){ return parseFloat(a.u)-parseFloat(b.u); });
  renderRec();
}
function renderRec(){
  var tb=document.getElementById('rec-body'); if(!tb) return;
  var htm='';
  for(var i=0;i<st.rows.length;i++){
    var r=st.rows[i];
    htm+='<tr><td>'+r.u+'</td><td>'+r.xu+'</td><td>'+r.da+'</td><td>'+r.zd+'</td><td>'+r.h+'</td><td>'+r.v+'</td></tr>';
  }
  tb.innerHTML=htm||'<tr><td colspan="6" style="color:#94a3b8;font-weight:400">暂无记录——点「记一笔」写入当前状态</td></tr>';
}
// ===== 交互：拖 F 光源跨三区实时成像；拖屏调 v；托盘蜡烛拖上滑轨替换物体 =====
function localPt(e){ var r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; }
function hitObj(p){
  var x=xOfU(st.u),hw=Math.max(18,2.2*S);
  return Math.abs(p.x-x)<hw&&p.y>axisY-hoPx()-16&&p.y<axisY+hoPx()*0.7+16;
}
function hitScreen(p){
  if(!st.screenOn||st.screenA<=0.5) return false;
  var g=PROPS.screenGeom(xOfV(st.vSc),axisY+scHPx()/2,scHPx());   // 命中走库件几何（照 c5s1）
  return Math.abs(p.x-g.faceX)<g.fw/2+14&&p.y>g.pts.TL.y-10&&p.y<g.pts.BR.y+16;
}
function hitEye(p){   // F7 人眼命中区=眼包围盒（纯观察位拖拽）
  if(!st.eye||st.eyeA<=0.5) return false;
  var e=eyeXY();
  return Math.abs(p.x-e.x)<e.h*0.8&&Math.abs(p.y-e.y)<e.h*0.62+6;
}
function inCtrlArea(p){ return toolbox.pointInCard(p)||p.y>H-ctrlBandH; }
cv.addEventListener('pointerdown',function(e){
  if(st.anim) return;
  var p=localPt(e); startPt=p; drag=null;
  if(toolbox.pointInCard(p)){
    var slot=toolbox.hitSlot(p);
    if(slot&&(slot.id==='f_led'||slot.id==='candle')){   // 换用物体：物高语义不变 3.0cm，F 图案像↔火焰图案像
      st.obj=(slot.id==='candle')?'candle':'F';
      drag={k:'obj'}; st.touched=true;
      if(window.playPick) playPick();
      showToast(st.obj==='candle'?'已换蜡烛作物体：像变为烛焰图案（正倒缩放）':'已换回 F 形光源：可判断像的左右是否相反');
    }
  }
  if(!drag){
    if(hitObj(p)) drag={k:'obj'};
    else if(hitScreen(p)) drag={k:'sc'};
    else if(hitEye(p)) drag={k:'eye'};
  }
  if(drag){ st.touched=true; cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; updateHint(); draw(); }
});
cv.addEventListener('pointermove',function(e){
  if(st.anim) return;
  var p=localPt(e);
  if(!drag){
    cv.style.cursor=(hitObj(p)||hitScreen(p)||hitEye(p)||(toolbox.pointInCard(p)&&toolbox.hitSlot(p)))?'pointer':'';
    return;
  }
  if(drag.k==='obj'){
    var u=(xLens-p.x)/S;
    var snaps=[st.f,2*st.f];   // f/2f 分界磁吸（±0.2cm 对齐，气泡点破分界）
    st.snapI=0;
    for(var i=0;i<snaps.length;i++){ if(Math.abs(u-snaps[i])<=0.2){ u=snaps[i]; st.snapI=i+1; break; } }
    st.u=clampU(u); st.fTip=false;
  }else if(drag.k==='sc'){
    st.vSc=clampV((p.x-xLens)/S); st.fTip=false;
  }else if(drag.k==='eye'){
    st.eyeX=Math.max(50,Math.min(W-50,p.x));   // 眼纯观察位：不改任何像的计算
  }
  draw();
});
function endDrag(e){
  if(!drag) return;
  var p=localPt(e);
  var moved=Math.hypot(p.x-startPt.x,p.y-startPt.y)>=5;
  if(drag.k==='obj'){
    if(moved){
      if(window.playDrop) playDrop();
      if(st.obj==='candle'&&toolbox.pointInCard(p)){   // 蜡烛拖回托盘=换回 F 形光源
        st.obj='F'; showToast('蜡烛已拖回托盘：换回 F 形光源');
      }
      if(Math.abs(st.u-2*st.f)<=EPS_CM) showToast('u=2f：等大分界——倒立、等大的实像，v=2f');
      else if(Math.abs(st.u-st.f)<=EPS_CM) showToast('u=f：实虚分界——折射光平行射出，不成像');
    }else if(!toolbox.pointInCard(startPt)&&st.obj==='candle'){
      st.obj='F'; showToast('蜡烛拖回：换回 F 形光源');   // 拖回换回（点蜡烛本体亦可切回）
      if(window.playClick) playClick();
    }
  }else if(drag.k==='sc'){
    if(moved&&window.playDrop) playDrop();
    if(moved&&isSharp()){ showToast('清晰像！v屏='+st.vSc.toFixed(1)+' cm'); if(window.playMatch) playMatch(); }
  }
  drag=null; cv.style.cursor=''; updateHint(); draw();
}
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',endDrag);
// ===== 控制条 =====
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
// 焦距滑杆：f 2~12cm 连续 + 10/20cm 吸附点；改 f→清晰位随动、屏像模糊引导重调（练习4 气泡）
var rngF=document.getElementById('rng-f'),lblF=document.getElementById('lbl-f');
function snapF(v){
  for(var i=0;i<F_SNAPS_CM.length;i++){ if(Math.abs(v-F_SNAPS_CM[i])<=F_SNAP_TOL_CM) return F_SNAPS_CM[i]; }
  return v;
}
function setF(v){
  st.f=Math.max(F_MIN_CM,Math.min(F_MAX_CM,snapF(v)));
  if(rngF) rngF.value=st.f;
  if(lblF) lblF.textContent='f = '+st.f.toFixed(1)+' cm';
}
function onFChange(v){ setF(v); st.fTip=true; st.touched=true; updateHint(); draw(); }
if(rngF) rngF.addEventListener('input',function(){ if(st.anim){ rngF.value=st.f; return; } onFChange(+rngF.value); });
function nudgeF(d){ if(st.anim) return; onFChange(st.f+d*0.5); if(window.playClick) playClick(); }
var bFd=document.getElementById('btn-f-down'),bFu=document.getElementById('btn-f-up');
if(bFd) bFd.addEventListener('click',function(){ nudgeF(-1); });
if(bFu) bFu.addEventListener('click',function(){ nudgeF(1); });
// 物理按压两态钮（显示卡）
function twoState(id,getv,setv,after){
  var b=document.getElementById(id); if(!b) return;
  b.addEventListener('click',function(){
    if(st.anim) return;
    setv(!getv()); b.classList.toggle('on',getv());
    if(window.playClick) playClick();
    if(after) after();
    updateHint(); draw();
  });
}
twoState('btn-marks',function(){return st.marks;},function(v){st.marks=v;});
twoState('btn-rays',function(){return st.rays;},function(v){st.rays=v;});
twoState('btn-hand',function(){return st.hand;},function(v){st.hand=v;if(v) showToast('练习6：像仍完整，只是变暗——通光量减少');});
// ===== 三浮层互斥：统一入口 openPanel（F8） =====
function openPanel(name){   // name∈read/rec/law/null：开一个自动关另外两个，按钮 .on 同步
  var map={read:['panel-read','btn-read'],rec:['panel-rec','btn-table'],law:['panel-law','btn-law']};
  for(var k in map){
    var pn=document.getElementById(map[k][0]),b=document.getElementById(map[k][1]);
    if(pn) pn.classList.toggle('show',k===name);
    if(b) b.classList.toggle('on',k===name);
  }
}
[['btn-read','read'],['btn-table','rec'],['btn-law','law']].forEach(function(pr){
  var b=document.getElementById(pr[0]);
  if(b) b.addEventListener('click',function(){
    if(st.anim) return;
    openPanel(b.classList.contains('on')?null:pr[1]);
    if(window.playClick) playClick();
  });
});
var recX=document.getElementById('rec-x'),lawX=document.getElementById('law-x');
if(recX) recX.addEventListener('click',function(){ openPanel(null); });
if(lawX) lawX.addEventListener('click',function(){ openPanel(null); });
// 记一笔 / 教材数据 / 清空
var bRec1=document.getElementById('btn-record');
if(bRec1) bRec1.addEventListener('click',function(){
  if(st.anim) return;
  recordCurrent();
  openPanel('rec');   // 记一笔自动开记录表（走互斥入口）
  showToast('已记录：u='+st.u.toFixed(1)+' cm，'+natureText());
  if(window.playClick) playClick();
  updateHint(); draw();
});
var bTB=document.getElementById('btn-textbook');
if(bTB) bTB.addEventListener('click',function(){
  st.rows=textbookRows(); renderRec();
  openPanel('rec');
  showToast('已载入教材练习5数据表 13 行（f=10cm）——对照找规律');
  if(window.playClick) playClick();
});
var bClr=document.getElementById('btn-clear');
if(bClr) bClr.addEventListener('click',function(){ st.rows=[]; renderRec(); if(window.playClick) playClick(); });
// 自动寻像：屏动画滑到 v 像位锁清晰
var bAuto=document.getElementById('btn-auto');
if(bAuto) bAuto.addEventListener('click',function(){
  if(st.anim) return;
  st.touched=true; st.fTip=false;
  var k=imgKind();
  if(k!=='real'){
    showToast(k==='none'?'u=f 不成像：折射光平行射出，屏上无像（实虚分界）':'虚像屏上接不到——点「撤屏观察」用眼从屏侧看');
    if(window.playClick) playClick(); updateHint(); draw(); return;
  }
  var vT=Math.min(V_MAX_CM,vImg());
  st.anim={kind:'auto',t0:performance.now(),from:st.vSc,to:vT};
  if(window.playClick) playClick();
});
function finishAuto(a){
  if(isSharp()){ showToast('自动寻像到位：清晰像 v='+vImg().toFixed(1)+' cm，'+natureText()); if(window.playMatch) playMatch(); }
  else showToast('理论像距 v='+vImg().toFixed(1)+' cm 超出滑轨，屏已到最右——像成在滑轨外');
  updateHint(); draw();
}
// 撤屏观察 / 装回光屏（两态钮）：屏淡出、observer_eye 飞入屏位、虚像呈现
var bNs=document.getElementById('btn-noscreen');
if(bNs) bNs.addEventListener('click',function(){
  if(st.anim) return;
  st.touched=true;
  if(st.screenOn){
    st.screenOn=false; bNs.textContent='装回光屏'; bNs.classList.add('on');
    st.anim={kind:'out',t0:performance.now()};
    if(imgKind()==='virtual') showToast('教材操作：撤去光屏，从光屏一侧向凸透镜方向看去');
  }else{
    st.screenOn=true; bNs.textContent='撤屏观察'; bNs.classList.remove('on');
    st.anim={kind:'in',t0:performance.now()};
  }
  if(window.playClick) playClick();
  hideBubble(); hintSt.dismissed=null;
});
// 复位（记录表数据只有 reset 才清）
var bReset=document.getElementById('btn-reset');
if(bReset) bReset.addEventListener('click',function(){
  if(st.anim) return;
  st.u=30; setF(F_DEF_CM); st.vSc=15;
  st.obj='F'; st.lit=true;
  st.screenOn=true; st.screenA=1; st.eye=false; st.eyeA=0; st.eyeOff=0; st.eyeX=null;
  st.hand=false; st.marks=true; st.rays=true;
  st.rows=[]; st.fTip=false; st.touched=false; st.snapI=0;
  renderRec();
  ['btn-hand'].forEach(function(id){ var b=document.getElementById(id); if(b) b.classList.remove('on'); });
  ['btn-marks','btn-rays'].forEach(function(id){ var b=document.getElementById(id); if(b) b.classList.add('on'); });
  if(bNs){ bNs.textContent='撤屏观察'; bNs.classList.remove('on'); }
  openPanel('read');
  st.wasSharp=isSharp();
  var t=document.getElementById('toast'); if(t) t.classList.remove('show');
  hintSt.key=null; hintSt.dismissed=null;
  if(window.playClick) playClick();
  updateHint(); draw();
});
var btnMute=document.getElementById('btn-mute');
if(btnMute) btnMute.addEventListener('click',function(){ window.muted=!window.muted; btnMute.textContent=window.muted?'🔇':'🔊'; if(window.playClick) playClick(); });
// ===== 全屏（c5s1 路线：documentElement + html.pseudo-fs 降级） =====
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
if(btnFull) btnFull.addEventListener('click',function(){if(st.anim)return;if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();});
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(ev){document.addEventListener(ev,function(){syncFull();setTimeout(resize,60);});});
// ===== sprite 重绘钩子（仅注册有 sprite 文件的件；透镜矢量无 sprite） =====
['f_led','f_led_off','candle','candle_unlit','hand_palm','observer_eye'].forEach(function(id){
  PROPS.onSprite(id,function(){ draw(); });
});
// ===== 动画 tick：自动寻像滑屏 + 撤屏淡出/眼飞入（两向对称） =====
function tick(){
  checkSharpEdge();
  if(st.anim){
    var a=st.anim,t=Math.min(1,(performance.now()-a.t0)/ANIM_DUR),e=easeInOut(t);
    if(a.kind==='auto'){
      st.vSc=a.from+(a.to-a.from)*e;
      if(t>=1){ st.anim=null; finishAuto(a); }
    }else if(a.kind==='out'){
      st.screenA=1-e; st.eye=true; st.eyeA=e; st.eyeOff=(W+40-xOfV(st.vSc))*(1-e);
      if(t>=1){ st.anim=null; st.screenA=0; st.eyeA=1; st.eyeOff=0; updateHint(); }
    }else if(a.kind==='in'){
      st.screenA=e; st.eyeA=1-e; st.eyeOff=(W+40-xOfV(st.vSc))*e;
      if(t>=1){ st.anim=null; st.eye=false; st.eyeA=0; st.eyeOff=0; st.screenA=1; st.eyeX=null; updateHint(); }
    }
    draw();
  }else if(glowFx.length) draw();
  requestAnimationFrame(tick);
}
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); if(toolbox){ layout(); draw(); } }).observe(ctrlEl);
}
// ===== 初始化：u=30cm(>2f)、f=10cm、屏在清晰像位 v=15cm——进页即见倒立缩小实像 =====
setF(F_DEF_CM);
layout(); resize();
openPanel('read');
st.wasSharp=isSharp();
renderRec(); syncFull();
updateHint(); draw(); requestAnimationFrame(tick);
window.__c5s3dbg={
  get st(){return st;}, get W(){return W;}, get H(){return H;}, get axisY(){return axisY;}, get S(){return S;}, get xLens(){return xLens;},
  vImg:vImg, imgKind:imgKind, mag:mag,
  setU:function(u){ st.u=clampU(u); st.touched=true; st.fTip=false; updateHint(); draw(); },
  setV:function(v){ st.vSc=clampV(v); st.fTip=false; updateHint(); draw(); },
  setF:function(f){ onFChange(f); },
  auto:function(){ document.getElementById('btn-auto').click(); },
  noscreen:function(){ document.getElementById('btn-noscreen').click(); },
  hand:function(){ document.getElementById('btn-hand').click(); },
  record:function(){ document.getElementById('btn-record').click(); },
  textbook:function(){ document.getElementById('btn-textbook').click(); },
  rows:function(){ return st.rows; }
};
})();

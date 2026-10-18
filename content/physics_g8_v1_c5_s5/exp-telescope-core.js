(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
// ===== 单位制：cm 语义单点换算 S=px/cm（layout 按 W 重算）；教材语义——远处物体 u≫f物，中间像在物镜焦点附近 =====
var TUBE_STROKE_CM=5;                                // R14 滑杆动态范围=lMatch±5（行程 10cm），min/max 由 syncTubeRange 随 f物/f目/物距联动设置
var TUBE_LMAX_CM=56;                                 // R14 比例尺换算上限=最不利组合（较近档 1.2*f物30+f目15=51）+5 行程
var INNER_LEN_CM=10;                                 // R14 内筒（目镜段）定长 10cm，左端始终深插外筒腔内
var MATCH_TOL_CM=0.6;                                // 对焦匹配判定带 |L−Lmatch|≤0.6cm
var NEAR_U_K=6;                                      // 较近档物距语义 u=6*f物 → v=u*f/(u−f)=1.2*f物（匹配距离稍大）
var COMPACT_H=600;                                   // 小窗紧凑档阈值（照 c5s1/c5s3）
var COL_RAY='#dc2626';
var COL_FLOW='#2563eb';
var COL_IMG='#b45309';                               // 中间像实箭头琥珀深色
var FONT='"Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif';
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var W=960,H=520,DPR=1,axisY=260,S=10,xObjLens=288,eyeRoom=80;
var st={
  fObj:20,fEye:10,L:30,near:false,   // L 初始=默认组合匹配距离 f物20+f目10（syncTubeRange 再校准）
  wasMatch:true,everMatch:false,angleSeen:false,
  flow:false
};
var drag=null,startPt=null,glowFx=[],toastTimer=null;
var flowT0=performance.now();
// ===== 几何换算（cm→px 全部走 S 单点） =====
function vObjCm(){ return st.near?(NEAR_U_K*st.fObj/(NEAR_U_K-1)):st.fObj; }   // 中间像距 v=uf/(u−f)；最远档 u→∞ ⇒ v=f物
function lMatchCm(){ return vObjCm()+st.fEye; }                                // 匹配镜筒距离：最远≈f物+f目；较近稍大
function isMatch(){ return Math.abs(st.L-lMatchCm())<=MATCH_TOL_CM; }
function magK(){ return st.fObj/st.fEye; }                                     // 放大倍率=f物÷f目
function xEyeLens(){ return xObjLens+st.L*S; }
function xImg(){ return xObjLens+vObjCm()*S; }
function eyeXY(){ return {x:Math.min(W-30,xEyeLens()+eyeRoom*0.55),y:axisY,h:Math.max(34,H*0.11)}; }   // R13 眼归光轴：中线沿轴直穿入眼；加大显示高容斜射光束
function objAp(){ return (tubeDiaO()-2*Math.max(3,tubeDiaO()*0.065))*0.9; }   // R14 物镜口径≈外筒腔径×0.9，嵌筒口卡圈
function eyeAp(){ return H*0.22; }   // 目镜孔径显示高（更小）
function tubeDiaO(){ return H*0.44; }   // R14 外筒剖面直径（定高比例，物镜口径由腔径反推）
function tubeDiaI(){ return eyeAp()*1.2+18; }   // 内筒剖面直径（目镜段；腔径须容物镜会聚光束通过）
function tubeBottomY(){ return axisY+tubeDiaO()/2; }   // 外壳最低点：标签/尺寸线避让
function hImg(){ return st.near?H*0.065:H*0.05; }   // 中间像高（倒立缩小实像，显示语义）
function groundY(){ return axisY+H*0.16; }   // R6：地面上收——物体上/中/下三端水平光线全部落在物镜孔径内
function objScale(){ return st.near?1.15:1; }
function objX(){ return st.near?W*0.115:W*0.07; }
function objTopY(){ return groundY()-H*0.28*objScale(); }
function clampL(v){ return Math.max(lMatchCm()-TUBE_STROKE_CM,Math.min(lMatchCm()+TUBE_STROKE_CM,Math.round(v*2)/2)); }   // R14 行程=lMatch±5
function layout(){
  axisY=Math.round(H*0.5);
  xObjLens=Math.round(W*0.30);
  eyeRoom=Math.max(70,W*0.075);
  S=(W*0.94-xObjLens-eyeRoom)/TUBE_LMAX_CM;   // 单点换算：最长组合全行程（56cm）不出画布右缘
}
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  layout();   // resize/全屏必重算一切缓存像素坐标（S/xObjLens/eyeRoom 单点）
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
  bldgShape(ctx,objX()+H*0.10*objScale(),gy,H*0.22*k,'rgba(71,85,105,.75)');
  treeShape(ctx,objX(),gy,H*0.28*k,'#3f6212');
  ctx.save();
  ctx.fillStyle='rgba(26,26,26,.75)'; ctx.font='14px '+FONT; ctx.textAlign='center';
  ctx.fillText(st.near?'较近的物体':'最远处的物体',objX()+H*0.05*objScale(),gy+18);
  ctx.restore();
}
function haloText(t,x,y){ ctx.save(); ctx.lineWidth=4; ctx.lineJoin='round'; ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.strokeText(t,x,y); ctx.restore(); ctx.fillText(t,x,y); }
// ===== R7 单筒望远镜剖面外壳（程序化五件套，照 c5s2 drawTubeSection 先例）：外筒=物镜段固定，内筒=目镜段随滑杆平滑缩进/伸出；筒腔开放光路可见 =====
var hatchP=null;
function hatchPat(){   // ③ 剖面线：断面 45° 细斜线（离屏 pattern 缓存一次）
  if(!hatchP){
    var pc=document.createElement('canvas'); pc.width=pc.height=7;
    var p=pc.getContext('2d');
    p.strokeStyle='rgba(70,50,22,0.5)'; p.lineWidth=1;
    p.beginPath(); p.moveTo(-1,8); p.lineTo(8,-1); p.moveTo(-1,1); p.lineTo(1,-1); p.moveTo(6,8); p.lineTo(8,6); p.stroke();
    hatchP=ctx.createPattern(pc,'repeat');
  }
  return hatchP;
}
function wallBand(x0,x1,y,h){   // 筒壁断面：①线性渐变（上高光下阴影）+③剖面线+②深色描边
  var g=ctx.createLinearGradient(0,y,0,y+h);
  g.addColorStop(0,'#e9d4ab'); g.addColorStop(0.4,'#c9a876'); g.addColorStop(1,'#8f6a3c');
  ctx.fillStyle=g; ctx.fillRect(x0,y,x1-x0,h);
  ctx.fillStyle=hatchPat(); ctx.fillRect(x0,y,x1-x0,h);
  ctx.strokeStyle='#3b2c14'; ctx.lineWidth=1.5; ctx.strokeRect(x0,y,x1-x0,h);
}
function mouthRing(x,half){   // ④ 筒口椭圆环
  ctx.beginPath(); ctx.ellipse(x,axisY,Math.max(3,half*0.22),half,0,0,Math.PI*2);
  ctx.fillStyle='rgba(201,168,118,0.30)'; ctx.fill();
  ctx.strokeStyle='#3b2c14'; ctx.lineWidth=1.5; ctx.stroke();
}
function seatRing(x,halfLens,halfCav){   // ⑤ 镜座卡圈：镜片嵌在筒口卡圈内（上下夹座抱镜片边缘接筒壁）
  ctx.fillStyle='#5b4a2a';
  ctx.fillRect(x-3,axisY-halfCav,6,Math.max(2,halfCav-halfLens));
  ctx.fillRect(x-3,axisY+halfLens,6,Math.max(2,halfCav-halfLens));
  mouthRing(x,halfLens+3);
}
function drawTelescope(){   // R7 五件套保留（渐变/深描边/剖面线/椭圆环/卡圈）；R14 筒比例公式化
  var Do=tubeDiaO(),Di=tubeDiaI(),hO=Do/2,hI=Di/2;
  var wo=Math.max(3,Do*0.065),wi=Math.max(2.5,Di*0.07);
  var xo0=xObjLens-Do*0.06;                       // 外筒左端=物镜卡圈位
  var xi1=xEyeLens()+Di*0.10;                     // 内筒右端=目镜卡圈位+少量
  var xi0=xEyeLens()-INNER_LEN_CM*S;              // R14 内筒定长 10cm：左端始终深插外筒腔内
  var xo1=Math.max(xImg()+2*S,xi0+4*S);           // R14 外筒右端=max(xI+2cm, xi0+4cm)——任意滑杆行程下内外筒搭接≥4cm 公式保证
  ctx.save();
  wallBand(xo0,xo1,axisY-hO,wo);            // 外筒上壁
  wallBand(xo0,xo1,axisY+hO-wo,wo);         // 外筒下壁
  mouthRing(xo0,hO); mouthRing(xo1,hO);     // 外筒前后筒口环
  wallBand(xi0,xi1,axisY-hI,wi);            // 内筒上壁（嵌在外筒腔内，随 L 伸缩）
  wallBand(xi0,xi1,axisY+hI-wi,wi);         // 内筒下壁
  mouthRing(xi1,hI);                        // 内筒后筒口环（目镜端）
  seatRing(xObjLens,objAp()/2,hO-wo);       // 物镜卡圈（外筒前口）
  seatRing(xEyeLens(),eyeAp()/2,hI-wi);     // 目镜卡圈（内筒后口）
  ctx.restore();
}
function drawLenses(){
  ctx.save();
  ctx.fillStyle='#1a1a1a'; ctx.font='600 16px '+FONT; ctx.textAlign='center';
  PROPS.lens_convex(ctx,xObjLens,axisY,{h:objAp(),f:st.fObj});   // 库件矢量通道：凸度随 f 联动
  haloText('物镜 f物='+st.fObj+'cm',xObjLens,tubeBottomY()+18);
  PROPS.lens_convex(ctx,xEyeLens(),axisY,{h:eyeAp(),f:st.fEye});
  haloText('目镜 f目='+st.fEye+'cm',xEyeLens(),tubeBottomY()+18);
  ctx.restore();
}
function drawObserver(){   // 眼（库内件 observer_eye）在目镜后
  var e=eyeXY();
  PROPS.observer_eye(ctx,e.x,e.y,{h:e.h});
}
function drawMidImage(){   // 中间像=倒立缩小实像（实箭头代码画，轴下）
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
function drawRays(){   // R13 标准教材画法：物镜段三平行线会聚成倒立中间像（保留）；目镜段薄透镜作图法——像端点 a 线直穿光心方向不变 + b 线平行于轴入射折射后过像方焦点（对焦态两出射线严格平行斜射入眼，离焦微发散方向不反）；交叉只在中间像点与目镜光心两处；无悬空段（每段两端落在物体/镜面/像点/眼上）
  var gx=objX(),ty=objTopY(),gy=groundY();
  var xI=xImg(),yI=axisY+hImg(),xE=xEyeLens(),e=eyeXY();
  var ex0=e.x-e.h*0.35;                    // 眼前缘（出射线终点=入眼）
  var d=xE-xI,dy=yI-axisY,fEp=st.fEye*S;   // d=像面到目镜距离；对焦态 d=fEp
  // ① 物镜段保留：物上/中/下三端水平平行光入物镜；中线沿轴直穿物镜→中间像面→目镜→眼
  beam(gx,ty,xObjLens,ty);
  beam(gx,gy,xObjLens,gy);
  beam(gx,axisY,ex0,axisY);
  // ② 物镜折射会聚成倒立中间像：上端线→像下端（箭头尖），下端线→像上端（轴上）
  beam(xObjLens,ty,xI,yI);
  beam(xObjLens,gy,xI,axisY);
  // ③ 目镜段·像下端点 P(xI,yI) 的 a 线：直穿目镜光心，方向不变
  beam(xI,yI,xE,axisY);
  var sa=-dy/d;                            // a 线斜率（过光心方向不变）
  beam(xE,axisY,ex0,axisY+sa*(ex0-xE));
  // ④ 像下端点 P 的 b 线：平行于光轴入射目镜，折射后必过像方焦点——对焦态出射与 a 严格平行；离焦微发散、方向不反
  beam(xI,yI,xE,yI);
  var sb=-dy/fEp;                          // b 出射斜率（平行入射线出射过像方焦点）
  beam(xE,yI,ex0,yI+sb*(ex0-xE));
  // 像上端点在光轴上：其 a/b 线均与光轴重合，由①中线直穿覆盖，不画重复段
}
function arrowHead(x,y,dir){
  ctx.save(); ctx.translate(x,y); ctx.rotate(dir);
  ctx.fillStyle=COL_IMG; ctx.beginPath();
  ctx.moveTo(0,0); ctx.lineTo(-7,-3.5); ctx.lineTo(-7,3.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawDim(){   // 镜筒距离尺寸线（两镜之间，双箭头+读数）
  var x0=xObjLens,x1=xEyeLens(),y=tubeBottomY()+40;
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
  var e=eyeXY(),ww=168,wh=150;   // R8：窗高 118→150，标题 wy+17/状态 wy+34 之下为图像区（自 wy+44 起）
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
  var cx=wx+ww/2,base=wy+wh-10;
  var defoc=Math.abs(st.L-lMatchCm());   // 离焦度（cm）：模糊+变淡
  var blur=Math.min(6,defoc*0.9);
  ctx.globalAlpha=Math.max(.4,1-defoc*0.07);
  if(blur>0.4&&typeof ctx.filter==='string') ctx.filter='blur('+blur.toFixed(1)+'px)';
  // 图像区钳制：树/楼高度上限=wh-54（wy+44 起到底），任何倍率下与文字禁重叠
  var m=magK(),imgMax=wh-54;
  var treeH=Math.max(imgMax*0.34,Math.min(imgMax,imgMax*0.40*m));
  var bldgH=Math.min(imgMax*0.72,treeH*0.7);
  treeShape(ctx,cx,base,treeH,'#3f6212');
  bldgShape(ctx,cx+ww*0.28,base,bldgH,'rgba(71,85,105,.75)');
  ctx.filter='none'; ctx.globalAlpha=1;
  ctx.fillStyle='#b45309'; ctx.font='13px '+FONT;
  ctx.fillText(defoc<=MATCH_TOL_CM?'正立放大的像（已对焦）':'像模糊——调镜筒长度对焦',cx,wy+34);
  ctx.restore();
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
  drawTelescope(); drawRays(); drawLenses(); drawMidImage(); drawDim(); drawObserver();
  drawGlowFx(); drawEyePeep();
  updatePanel(); sayHint();
}
// ===== 读数面板：f物/f目/镜筒距离/放大倍率=f物÷f目 实时 =====
function updatePanel(){
  var pn=document.getElementById('panel-read'); if(!pn||!pn.classList.contains('show')) return;
  var po=document.getElementById('pr-fobj'),pe=document.getElementById('pr-feye'),pt=document.getElementById('pr-tube'),pm=document.getElementById('pr-mag');
  if(po) po.textContent=st.fObj+' cm';
  if(pe) pe.textContent=st.fEye+' cm';
  if(pt) pt.textContent=st.L.toFixed(1)+' cm'+(isMatch()?'（已对焦）':'');
  if(pm) pm.textContent=magK().toFixed(magK()%1?2:0)+' 倍（f物÷f目）';
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
  if(!st.everMatch) return {key:'h-tune',text:'望远镜已装好：物镜、目镜都挂在镜筒上。拖「镜筒长度」滑杆（或直接拖动目镜）调两镜间距——观察最远处物体时，匹配距离≈f物+f目='+lMatchCm().toFixed(0)+' cm，到位会有对焦光晕和提示音。'};
  if(!st.angleSeen) return {key:'h-angle',html:'视角对比：'+ANGLE_SVG+'<div>裸眼看远处物体，视角很小；望远镜把远处物体的像拉近放大，进入眼睛的光张角变大——视角越大，看到的像越大。</div>'};
  return {key:'h-free',text:'放大倍率=f物÷f目='+magK().toFixed(magK()%1?2:0)+' 倍。换器材卡的 f物/f目 看倍率变化；切「物距较近」后匹配距离稍大一些，要重新调镜筒长度；眼旁的「眼视图」气泡=人眼最终看到的像；开「光流」看光的传播方向。'};
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
function hitLensEye(p){ return Math.abs(p.x-xEyeLens())<eyeAp()*0.25+14&&Math.abs(p.y-axisY)<eyeAp()/2+10; }
// ===== 交互：拖目镜=调镜筒长度（核心交互，R5 后两镜常驻光轴） =====
cv.addEventListener('pointerdown',function(e){
  var p=localPt(e); startPt=p; drag=null;
  if(hitLensEye(p)) drag={k:'tube'};
  if(drag){ cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; sayHint(); draw(); }
});
cv.addEventListener('pointermove',function(e){
  var p=localPt(e);
  if(!drag){
    cv.style.cursor=hitLensEye(p)?'pointer':'';
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
  if(moved&&drag.k==='tube'&&window.playDrop) playDrop();
  drag=null; cv.style.cursor=''; syncSlider(); sayHint(); draw();
}
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',endDrag);
// ===== 控制条 =====
var selFobj=document.getElementById('sel-fobj'),selFeye=document.getElementById('sel-feye');
if(selFobj) selFobj.addEventListener('change',function(){
  st.fObj=+selFobj.value; st.wasMatch=false;
  syncTubeRange();   // R14 滑杆范围随 f物 联动
  if(window.playClick) playClick();
  checkMatch(); sayHint(); draw();
});
if(selFeye) selFeye.addEventListener('change',function(){
  st.fEye=+selFeye.value; st.wasMatch=false;
  syncTubeRange();   // R14 滑杆范围随 f目 联动
  if(window.playClick) playClick();
  checkMatch(); sayHint(); draw();
});
var rngT=document.getElementById('rng-tube'),lblT=document.getElementById('lbl-tube');
function syncSlider(){
  if(rngT) rngT.value=st.L;
  if(lblT) lblT.textContent='L = '+st.L.toFixed(1)+' cm';
}
function syncTubeRange(){   // R14 滑杆动态范围：f物/f目/物距变化时设 rng-tube 的 min=lMatch−5 / max=lMatch+5（行程 10cm），并把 L 收回范围内
  if(rngT){ rngT.min=lMatchCm()-TUBE_STROKE_CM; rngT.max=lMatchCm()+TUBE_STROKE_CM; }
  st.L=clampL(st.L);
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
  syncTubeRange();   // R14 lMatch 随物距变，滑杆范围联动
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
  st.fObj=20; st.fEye=10; st.near=false;
  syncTubeRange();               // R14 范围回默认组合 lMatch±5
  st.L=clampL(lMatchCm());   // 重置回初始态：两镜在轴+最远物距+镜筒在匹配点
  st.wasMatch=isMatch(); st.everMatch=false; st.angleSeen=false; st.flow=false;
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
// ===== 初始化：两镜已在轴+最远物距+镜筒在匹配点 =====
layout(); resize();
syncDistUI(); syncTubeRange(); syncSlider(); syncFull();   // R14 初始滑杆范围=lMatch±5、value=lMatch
if(panelRead&&bTable){ panelRead.classList.add('show'); bTable.classList.add('on'); }
sayHint(); draw(); requestAnimationFrame(tick);
window.__c5s5dbg={
  get st(){return st;}, get W(){return W;}, get H(){return H;}, get S(){return S;}, get axisY(){return axisY;}, get xObjLens(){return xObjLens;},
  lMatch:lMatchCm, vObj:vObjCm, mag:magK, isMatch:isMatch,
  setL:function(v){ setL(v); draw(); },
  setF:function(fo,fe){ st.fObj=fo||20; st.fEye=fe||10; if(selFobj)selFobj.value=String(st.fObj); if(selFeye)selFeye.value=String(st.fEye); st.wasMatch=false; syncTubeRange(); checkMatch(); syncSlider(); sayHint(); draw(); },
  near:function(v){ setNear(!!v); }
};
})();

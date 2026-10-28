(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
// ===== 单位制：cm 语义单点换算 S=px/cm（layout 按 W 重算）；教材语义——远处物体 u≫f物 平行光入射；R19 折射光线过目镜前焦点 P2，出射恒平行主轴 =====
var TUBE_STROKE_CM=5;                                // R14 滑杆动态范围=lMatch±5（行程 10cm），min/max 由 syncTubeRange 随 f物/f目/物距联动设置
var TUBE_LMAX_CM=56;                                 // R14 比例尺换算上限=最不利组合（较近档 1.2*f物30+f目15=51）+5 行程
var MATCH_TOL_CM=0.6;                                // 对焦匹配判定带 |L−Lmatch|≤0.6cm
var NEAR_U_K=6;                                      // 较近档物距语义 u=6*f物 → v=u*f/(u−f)=1.2*f物（匹配距离稍大）
var COMPACT_H=600;                                   // 小窗紧凑档阈值（照 c5s1/c5s3）
var COL_RAY='#dc2626';
var COL_FLOW='#2563eb';
var COL_IMG='#b45309';                               // 尺寸线/箭头琥珀深色
var FONT='"Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif';
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var W=960,H=520,DPR=1,axisY=260,S=10,xObjLens=288,eyeRoom=80;
var st={
  fObj:20,fEye:10,L:30,near:false,   // L 初始=默认组合匹配距离 f物20+f目10（syncTubeRange 再校准）
  wasMatch:true,everMatch:false,angleSeen:false,
  flow:false,
  showLabels:false
};
/* guide 语音层暴露（B版标配）：不可枚举 getter 聚合派生量，零干扰 st 本体 */
(function(){
  Object.defineProperty(st,'matched',{enumerable:false,get:function(){return isMatch();}});
  window.C5S5_STATE=st;
})();
var drag=null,startPt=null,glowFx=[];
var flowT0=performance.now();
// ===== 几何换算（cm→px 全部走 S 单点） =====
function vObjCm(){ return st.near?(NEAR_U_K*st.fObj/(NEAR_U_K-1)):st.fObj; }   // 像距 v=uf/(u−f)；最远档 u→∞ ⇒ v=f物（供 lMatch 用）
function lMatchCm(){ return vObjCm()+st.fEye; }                                // 匹配镜筒距离：最远≈f物+f目；较近稍大
function isMatch(){ return Math.abs(st.L-lMatchCm())<=MATCH_TOL_CM; }
function magK(){ return st.fObj/st.fEye; }                                     // 放大倍率=f物÷f目
function xEyeLens(){ return xObjLens+st.L*S; }
function xP2(){ return xEyeLens()-st.fEye*S; }                                 // R19 光路交叉点 P2=目镜前焦点（随镜筒滑杆与 f目 select 移动）；对焦态与物镜焦点 F物 重合
function xFobj(){ return xObjLens+st.fObj*S; }                                 // R19 物镜焦点 F物 刻度位（xObjLens+f物×S）；R18 外筒右端基准 xo1=xFobj+4cm
function innerLenCm(){ return st.fEye+5; }                                     // R18 INNER_LEN 公式：内筒（目镜段）长=(f目+5)cm，只随 f目 select 变、不随滑杆变
function eyeXY(){ return {x:Math.min(W-30,xEyeLens()+eyeRoom*1.3),y:axisY,h:Math.max(40,H*0.15)}; }   // R20 眼距再拉远 eyeRoom*1.3（封顶 W-30）；R17 显示高加大——R26 后上/下两个入眼点间距随眼高全落在眼前缘
function objAp(){ return (tubeDiaO()-2*Math.max(2.5,tubeDiaO()*0.05))*0.9; }   // R20 物镜口径=外筒腔径×0.9 公式随动（壁厚 wo=max(2.5,Do*0.05) 同步），嵌筒口卡圈
function tubeDiaO(){ return H*0.17; }   // R20 瘦身保持：外筒剖面直径 Do=H×0.17（细长筒）
function tubeDiaI(){ var Do=tubeDiaO(),wo=Math.max(2.5,Do*0.05); return Do-2*wo-3; }   // R25 嵌套直径链（由外向内推导）：内筒外径=外筒内腔−3px（每侧 1.5px 滑动间隙=贴合镶嵌）
function eyeAp(){ var Di=tubeDiaI(),wi=Math.max(2,Di*0.06); return Di-2*wi-3; }   // R25 目镜孔径=内筒内腔−3px（wi=max(2,Di*0.06)）
function tubeBottomY(){ return axisY+tubeDiaO()/2; }   // 外壳最低点：标签/尺寸线避让
function objHalf(){ return Math.max(H*0.045,Math.min(H*0.055,eyeAp()/2-2)); }   // R25 物体半幅=H×0.055（低窗随 eyeAp 收拢，下限 H×0.045）；最劣光束半高=半幅×比率 f目/(f物−5)≤1.0，+2px 余量≤eyeAp/2（全组合 f物×f目×滑杆×窗宽 node 数值验证过）
function groundY(){ return axisY+objHalf(); }   // R25 物体下端=轴+objHalf（两端收拢，删钳制后全行程装得进目镜孔径）
function objScale(){ return st.near?1.15:1; }
function objX(){ return st.near?W*0.115:W*0.07; }
function objTopY(){ return axisY-objHalf(); }   // R25 物体上端=轴−objHalf
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
function drawObject(){   // 远处物体：左端树+楼剪影（物距≫f物 语义）；R25 两端收拢——树顶=objTopY(轴−objHalf)、树基=groundY(轴+objHalf)，上/下两端光线端点全落物体上
  var k=objScale(),gy=groundY(),objH=gy-objTopY();
  bldgShape(ctx,objX()+H*0.10*k,gy,objH*0.78,'rgba(71,85,105,.75)');
  treeShape(ctx,objX(),gy,objH,'#3f6212');
  ctx.save();
  ctx.fillStyle='rgba(26,26,26,.75)'; ctx.font='14px '+FONT; ctx.textAlign='center';
  ctx.fillText(st.near?'较近的物体':'最远处的物体',objX()+H*0.05*k,gy+18);
  ctx.restore();
}
function haloText(t,x,y){ if(!st.showLabels) return; ctx.save(); ctx.lineWidth=4; ctx.lineJoin='round'; ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.strokeText(t,x,y); ctx.restore(); ctx.fillText(t,x,y); }
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
function drawTelescope(){   // R7 五件套保留（渐变/深描边/剖面线/椭圆环/卡圈）；R18 外筒钉死+内筒随滑杆整体平移
  var Do=tubeDiaO(),Di=tubeDiaI(),hO=Do/2,hI=Di/2;
  var wo=Math.max(2.5,Do*0.05),wi=Math.max(2,Di*0.06);   // R20 瘦身壁厚
  var xo0=xObjLens-Do*0.06;                       // R18 外筒左端=物镜卡圈位（钉死）
  var xo1=xObjLens+st.fObj*S+4*S;                 // R18 外筒右端=xObjLens+f物×S+4cm（=xFobj()+4cm）——只随 f物 select 变、禁随镜筒滑杆变
  var xi1=xEyeLens()+Di*0.10;                     // 内筒右端=目镜卡圈位+少量
  var xi0=Math.min(xEyeLens()-innerLenCm()*S,xo1-4*S);   // R18 内筒长=(f目+5)cm 随滑杆整体平移（目镜动内筒动，外筒不动）；min 兜底=搭接恒≥4cm
  // R18 约束自检（f物∈{20,30}×f目∈{10,15}×滑杆 lMatch±5 全组合，node 数值验证过）：
  //   ① P 恒在外筒腔内：xo0<xP<xo1（xo1=xP+4cm 恒成立）
  //   ② 内外筒搭接≥4cm：xi0≤xo1−4cm（min 兜底保证；最远档 L=lMatch+5 取等号，较近档上端由兜底接管）
  //   ③ 目镜不埋外筒：xEyeLens>xo1 ⇔ L>f物+4；最小 L=lMatch−5 ⇒ 需 f目>9，f目∈{10,15} 恒成立（较近档 lMatch 更大）
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
function drawRays(){   // R19 光学定律版：交叉点=P2=目镜前焦点（跟目镜走）；物体上/下两端水平平行光入物镜→折射后两线折向 P2、直线穿过 P2 交叉（上端线穿到轴下/下端线穿到轴上）→发散到目镜两个入射点→目镜折射后出射两光线恒平行于主轴水平入眼（过前焦点的光线经透镜出射平行于主轴=真实定律，对焦/离焦皆平行，禁画发散出射）；R26 删轴上中线（与光轴虚线重合），6 条=2入射+2过P2+2出射，无入射点钳制（两端收拢到轴±objHalf，全滑杆行程×全 select 组合下目镜面高度恒在目镜孔径内，node 数值验证过），无多余线段、无悬空段（端点全落在物体端点/物镜面/P2/目镜面/眼前缘）
  var gx=objX(),xE=xEyeLens(),e=eyeXY();
  var ex0=e.x-e.h*0.35;                      // 眼前缘（出射线终点=入眼；上/下两个入眼点，间距随眼高）
  var xp=xP2(),d1=xp-xObjLens,d2=xE-xp;      // d1=物镜到 P2；d2=P2 到目镜=恒 f目×S
  var hs=[objTopY()-axisY,groundY()-axisY];  // R26 上/下两端入射高度=轴±objHalf（相对轴，画布坐标上负下正）
  for(var i=0;i<2;i++){
    var y0=axisY+hs[i];
    beam(gx,y0,xObjLens,y0);                 // ① 入射：水平平行光入物镜
    var h1=-hs[i]*d2/d1;                     // ②③ 折向 P2 并直线穿过交叉（到轴另一侧），目镜面处高度=过 P2 直线的延续
    beam(xObjLens,y0,xE,axisY+h1);
    beam(xE,axisY+h1,ex0,axisY+h1);          // ④ 出射：恒平行于主轴水平入眼（斜率恒 0）
  }
}
function arrowHead(x,y,dir){
  ctx.save(); ctx.translate(x,y); ctx.rotate(dir);
  ctx.fillStyle=COL_IMG; ctx.beginPath();
  ctx.moveTo(0,0); ctx.lineTo(-7,-3.5); ctx.lineTo(-7,3.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawDim(){   // 镜筒距离尺寸线（两镜之间，双箭头+读数）；R32：整体随标注开关（关=线+读数全隐）
  if(!st.showLabels) return;
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
  drawTelescope(); drawRays(); drawLenses(); drawDim(); drawObserver();
  drawGlowFx(); drawEyePeep();
  updatePanel();
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
// ===== 对焦判定（边缘触发：光晕+音效，照 c5s3 glowFx/playMatch 先例） =====
function checkMatch(){
  var m=isMatch();
  if(m&&!st.wasMatch){
    st.everMatch=true;
    glowFx.push({x:xP2(),y:axisY,t0:performance.now(),c:'255,214,120'});   // R19 对焦光晕画在 P2（目镜前焦点=对焦态与 F物 刻度重合处）
    if(window.playMatch) playMatch();
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
  if(drag){ cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; draw(); }
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
  drag=null; cv.style.cursor=''; syncSlider(); draw();
}
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',endDrag);
// ===== 控制条 =====
var selFobj=document.getElementById('sel-fobj'),selFeye=document.getElementById('sel-feye');
if(selFobj) selFobj.addEventListener('change',function(){
  st.fObj=+selFobj.value; st.wasMatch=false;
  syncTubeRange();   // R14 滑杆范围随 f物 联动
  if(window.playClick) playClick();
  checkMatch(); draw();
});
if(selFeye) selFeye.addEventListener('change',function(){
  st.fEye=+selFeye.value; st.wasMatch=false;
  syncTubeRange();   // R14 滑杆范围随 f目 联动
  if(window.playClick) playClick();
  checkMatch(); draw();
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
  draw();
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
// 显示卡：标注开关（R31）——总开关覆盖 物镜f=/目镜f=/镜筒距离L= 三条 canvas 标注；drawDim 尺寸线图形保留
var bLabels=document.getElementById('btn-labels');
if(bLabels) bLabels.addEventListener('click',function(){
  st.showLabels=!st.showLabels; bLabels.classList.toggle('on',st.showLabels);
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
  if(window.playClick) playClick();
  draw();
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
if(btnFull) btnFull.addEventListener('click',function(){if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();if(window.playClick) playClick();});
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
draw(); requestAnimationFrame(tick);
window.__c5s5dbg={
  get st(){return st;}, get W(){return W;}, get H(){return H;}, get S(){return S;}, get axisY(){return axisY;}, get xObjLens(){return xObjLens;},
  lMatch:lMatchCm, vObj:vObjCm, mag:magK, isMatch:isMatch,
  setL:function(v){ setL(v); draw(); },
  setF:function(fo,fe){ st.fObj=fo||20; st.fEye=fe||10; if(selFobj)selFobj.value=String(st.fObj); if(selFeye)selFeye.value=String(st.fEye); st.wasMatch=false; syncTubeRange(); checkMatch(); syncSlider(); draw(); },
  near:function(v){ setNear(!!v); }
};
})();

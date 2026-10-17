(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
// 本页 cm↔px 单点换算：f=8cm 固定、物像光路约 40cm，c5s1 的 0.096 装不下 → 本页比例常数（单点 H 比例法照 c5s1，禁裸 px）
function cmPx(){ return H*0.030; }
var F_CM=8;                // 模型照相机凸透镜焦距固定 8cm（教材 5~10cm 区间）
var FOCUS_TOL_CM=0.6;      // 薄膜对焦容差：|v筒−v像|≤0.6cm 判清晰（照 c5s1 focusTol 先例）
var U_MIN=17,U_MAX=30,U_DEF=22;   // 物距 clamp（cm，u>2f 倒立缩小实像区间）
var V_MIN=9,V_MAX=15,V_DEF=13;    // 筒距=透镜-薄膜（cm，两筒套接伸缩行程；下限保内筒不穿出外筒前端）
var OBJ_H_CM=4.1;          // 物高 cm=F 板可视高（K1：hLed 语义=F 板可视高=OBJ_H_CM*cmPx 自洽，物点=F 板上缘与像高自洽）
// K1 探针 f_led_panel.png rows105-710/cols198-606，蔡总 23:14 授权 wan2.7 重生成无底座
var PANEL_XC=0.502;        // F 板水平中心比例（(198+606)/2/800=0.5025）
var PANEL_YC=0.509;        // F 板竖直中心比例（(105+710)/2/800）
var PANEL_WF=0.51;         // F 板可视宽/natW（(606-198)/800）
var PANEL_HF=0.756;        // F 板可视高/natH（(710-105)/800）
var F2_CM=5;               // H2 场景2 投影仪专用短焦：真实投影仪短焦强放大（f<u<2f 放大实像）
var U2_MIN=7,U2_MAX=9.5,U2_DEF=7.8;   // 物理映射恢复后对焦点 u*≈7.1；默认 7.8=轻弥散起步（blur≈12px 糊而形辨，蔡总 01:06 截图重糊成块教训）
var PROJ_TOL_CM=0.6;       // H2 场景2 对焦容差：|v像−屏距|≤0.6cm 判清晰
var U3_MIN=2,U3_MAX=7.0,U3_DEF=5;   // H3 场景3 物距 clamp：上限 7.0<f（u<f 纯放大镜，D2 已拍）
var ANIM_DUR=600;          // 场景切换飞入飞出时长（ms，两向对称）
var PEEP_K=2.2;            // H1 薄膜观察窗放大倍率：窗内像高=真实像高×PEEP_K（放大观察语义）
var COL_RAY='#dc2626';
var COL_FLOW='#2563eb';    // H8 光线颜色统一 c5s1 基准：蓝色流动虚线（绑光路开关同现）
var COL_DIM='#854d0e';
var flowT0=0;              // H8 流动相位起点：开光路时置 performance.now()（照 c5s1）
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
  proj:{u:U2_DEF,flipped:false,focused:false,everFocused:false,everFlip:false,pfSet:false},
  mag:{u:U3_DEF,everDrag:false,screenX:null,everScreen:false}   // J5：眼改常量固定位（xEye/yEye），拖拽/观察锥已删
};
function cur(){ return state[state.scene]; }
var drag=null,startPt=null,glowFx=[];
var toastTimer=null;
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
// H 比例缓存（proportions() 赋值）
var hLed,tubeDia,tubeLf,tubeLb,lensH,scrH;
function proportions(){   // G5 比例表（照 c5s1 模式，单点 H 比例法；cmPx 保持 H*0.030 场景级）
  hLed=Math.round(OBJ_H_CM*cmPx());   // K1：hLed 语义=F 板可视高（=物高 4.1cm≈0.123H，与光路物点自洽；调用点语义不变）
  lensH=H*0.13;                // 透镜孔径
  tubeDia=H*0.16;              // 外筒直径（剖面画法）
  scrH=Math.round(H*0.32);     // 屏/幕高（场景2 光幕、场景3 光屏）
  tubeLf=Math.round(8*cmPx()); // 前筒（外筒）长 8cm：透镜端环固定
  tubeLb=Math.round(9*cmPx()); // 后筒（内筒）长 9cm：薄膜端环随 vTube 平移
}
function layout(){
  // 零桌面（c5s1 排版）：光轴居控制条上方可见带居中，器材全部骑光轴
  axisY=Math.round((H-ctrlBandH)*0.52);
  // H7 托盘卡 300×124 暖米黄+琥珀描边；场景3 托盘仅备光屏一件（slot 只缩略图不放文字标签）
  var cardH=124;
  var fit=Math.min(Math.round(cardH*0.8),cardH-16);   // H7 探针标定：缩略图高=0.8*卡高、超 cardH−16 等比缩小（bbox⊂卡，/tmp/c5s23_fx2c_probe A3）
  var cardM={x:16,y:H-ctrlBandH-12-cardH,w:300,h:cardH,r:10,fill:'rgba(243,233,215,0.95)',stroke:'#b45309'};
  toolboxMag=PROPS.toolbox.create({card:cardM,items:[{id:'screen',x:cardM.x+150,y:cardM.y+Math.round(cardH/2)}],fit:fit,nat:{screen:{w:280,h:467}}});
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
function panelCH(){ return hLed/PANEL_HF; }   // K1：整图绘制高 ch=boxH/PANEL_HF（boxH=hLed=F 板可视高，源矩形=全图不裁切）
function panelCW(){                            // K1：整图绘制宽 cw=ch*natW/natH 同源不变形（800×800 探针→cw=ch；F 板可视宽=cw*PANEL_WF=boxH*(606-198)/(710-105) 同源宽高比）
  var img=PROPS.spriteReady('f_led_panel')?PROPS.img('f_led_panel'):null;
  return img?panelCH()*img.naturalWidth/img.naturalHeight:panelCH();
}
function ledVisW(){ return panelCW()*PANEL_WF; }   // F 板可视宽（装配体包围盒用）
function ledTop(){ return axisY-hLed/2; }          // F 板可视上缘（hLed=板可视高、中心锚）
function xLed(){   // G2：装配体包围盒（F 板左缘→薄膜右缘）水平居中于 W*0.46（按默认 u/v 定位，F 固定）
  return Math.round(W*0.46+ledVisW()/4-((U_DEF+V_DEF)*cmPx()+tubeDia*0.14)/2);
}
function xLens(){ return xLed()+Math.round(state.cam.u*cmPx()); }
function filmX(){ return xLens()+Math.round(state.cam.vTube*cmPx()); }
function vImg(){ var u=state.cam.u; return u*F_CM/(u-F_CM); }   // v像=u*f/(u−f)
function imgHCm(){ return OBJ_H_CM*vImg()/state.cam.u; }
function isFocused(){ return Math.abs(state.cam.vTube-vImg())<=FOCUS_TOL_CM; }
// ===== 场景2 投影仪几何（H2 短焦重设计；cm↔px 铁律）：投影片（机身内固定左位）→透镜（x 可拖=调焦）→幕布（固定右端） =====
// I2 探针标定（/tmp/c5s23_fx2d_probe.js）：span 28cm 时对焦方程 u²−Su+5S=0 在 u∈[7,9.5] 无解（需 u=6.52 出 clamp）→ 取 S=24：u*=7.10 可对焦
// J4 随 bodyL 语义重标：外壳左壁 bodyL=xLed2−8、F 绘制位=bodyL+6 紧贴左内壁内衬；光路 span 常量 24cm=F(xLed2)→幕布(xScr2) 不变
function xLed2(){ return xScr2()-Math.round(24*cmPx()); }   // 投影片光路起点（span 24cm 标定，K2 不变）
// 蔡总 01:06 图示+物理链修复：透镜位=投影片+u（真实投影仪移透镜=物距屏距反向同变，v屏=24−u 自洽，对焦点 u*≈7.1）；u∈[7,9.5]→透镜在机身 56-76% 中右段（图示位）；拖拽/滑杆双向联动经 uFromX2 不变
function sheetBW(){ return Math.round(panelCW()*PANEL_WF)+8; }   // 投影片片框宽=板可视宽+8（蔡总 01:06 片框）
function lensX2(u){ return xLed2()+Math.round(u*cmPx()); }
function uFromX2(x){ return (x-xLed2())/cmPx(); }
function xLens2(){ return lensX2(state.proj.u); }   // 调焦=透镜在机身内滑动（物理映射）
function bodyL(){ return xLed2()-Math.round(panelCW()*0.255+4)+Math.round(sheetBW()*0.65); }   // 蔡总 01:06 图示：投影片 65% 露在机身左缘外（片左缘=锚−0.255cw−4）
function bodyR(){ return xLed2()+Math.round(12.5*cmPx()); }   // 蔡总 01:06 图示：机身右壁=透镜行程右缘 9.5cm+3cm 余量（透镜占机身 56-76% 中右段）；壳固定不随 u 动
function barrelL(){ return bodyR(); }                          // 镜筒根=机身右端面（固定）
function barrelR(){ return bodyR()+Math.round(2.6*cmPx()); }   // 筒口（两级阶梯总长 2.6cm 常量）
function barrelDia(){ return Math.round(tubeDia*1.4); }        // 筒径基准（两级阶梯筒高=其 0.62/0.40）
function xScr2(){ return Math.round(W*0.70); }          // J4 构图：幕布 x=W*0.70（G9 标定骑轴；bbox 中心探针见 /tmp/c5s23_fx2e_probe）
function hScr2(){ return Math.round(H*0.40); }          // J3 幕布加大 0.40H：全域最劣像+弥散 0.3604H≤0.92*0.40H=0.368H（探针 /tmp/c5s23_fx2e_probe）
function vImg2(){ var u=state.proj.u; return u*F2_CM/(u-F2_CM); }
function vScr2(){ return (xScr2()-xLens2())/cmPx(); }   // 屏距=透镜→幕布（cm）
function imgHCm2(){ return OBJ_H_CM*vImg2()/state.proj.u; }
function isFocused2(){ return Math.abs(vImg2()-vScr2())<=PROJ_TOL_CM; }
// ===== 场景3 放大镜几何（H3/I2：物 W*0.40，u<f → 同侧正立虚像，u→f 像退向无穷远出画布左缘） =====
function xLed3(){ return Math.round(W*0.40); }
function xLens3(){ return xLed3()+Math.round(state.mag.u*cmPx()); }
function vImg3(){ var u=state.mag.u; return u*F_CM/(u-F_CM); }
function imgHCm3(){ return OBJ_H_CM*Math.abs(vImg3())/state.mag.u; }
function xImg3(){ return xLens3()+Math.round(vImg3()*cmPx()); }
function eyeH(){ return Math.round(H*0.11); }   // 人眼绘制高
// J5：眼改常量固定位（拖拽/观察锥/动态默认位全删）：x=0.80W、y=轴上方 0.055H
function xEye(){ return Math.round(W*0.80); }
function yEye(){ return axisY-Math.round(H*0.055); }
// J10/L2：虚像面亮度∝1/像面积，u→f 像无穷大→趋于不可见（衔接 u=f 不成像）；蔡总 00:31：对齐第三节虚像变虚强度（0.85 系数/底 0.15，同 c5s3 公式）
function dimAlpha(){ return Math.max(0.15,Math.min(1,1-0.85*Math.pow(state.mag.u/F_CM,2))); }
// L2 虚像弥散：blur=8(u/f)²（与 dimAlpha 的 0.85*Math.pow(u/f,2) 同底同源），>0.4px 才上 ctx.filter，随 save/restore 复位
function dimBlur(){ return 8*Math.pow(state.mag.u/F_CM,2); }
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
  var c=toolboxMag.card;
  ctx.save(); ctx.fillStyle='#8a6d3b'; ctx.font='15px sans-serif'; ctx.textAlign='left';
  ctx.fillText('器材托盘',c.x+10,c.y+16);   // H7 角标
  ctx.restore();
  var sm=toolboxMag.slots[0];
  // H7/G9：缩略图用 slot 实高（fit 重算防出卡界）；锚点标定：屏面中心对槽心 → y=槽心+0.42h
  if(sm&&state.mag.screenX===null&&!(drag&&drag.k==='screen')) PROPS.screen(ctx,sm.x,sm.y+Math.round(SCR_AX*sm.h),{h:sm.h});
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
  if(showRays){   // H8 流动实现逐字照 c5s1 L157-172：底线减淡 + 蓝色虚线脉冲从光源向传播方向流动（x0→x1）
    ctx.globalAlpha=.3; ctx.strokeStyle=COL_RAY; ctx.lineWidth=2; ctx.stroke();
    ctx.globalAlpha=1; ctx.setLineDash([6,12]);
    ctx.lineDashOffset=-((performance.now()-flowT0)*0.06)%18;
    ctx.strokeStyle=COL_FLOW; ctx.lineWidth=2.4; ctx.stroke();
  }else{
    ctx.strokeStyle=COL_RAY; ctx.lineWidth=2; ctx.stroke();
  }
  arrowHead(x0,y0,x1,y1);   // H8：箭头保留 COL_RAY
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
  // J1：膜上像 clamp tubeDia*0.34 + 椭圆 ctx.clip 硬保证——clip=可见膜面同尺寸（蔡总 17:56 图一，与 drawLensFilm 膜椭圆同值）；放大观察交给 filmPeep 窗
  var fx=filmX(),hpx=Math.min(imgHCm()*cmPx(),tubeDia*0.34),blur=Math.abs(state.cam.vTube-vImg())*cmPx()*0.35;
  ctx.save();
  ctx.beginPath(); ctx.ellipse(fx-2,axisY,tubeDia*0.14,tubeDia*0.40,0,0,Math.PI*2); ctx.clip();
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
// K1 F 光源=无底座灯箱 f_led_panel（蔡总 23:14 授权 wan2.7 重生成）：整图绘制不裁切；lit=①离屏 source-atop 暖罩 30%（原 0.55 降）②主画布 lighter+shadowBlur 沿 F 轮廓=笔画发光叠两层；大径向光晕已删
var ledLitCv=null,ledLitKey='';
function drawLedCropped(x,yc,lit){
  var id='f_led_panel';
  if(!PROPS.spriteReady(id)) return;
  var img=PROPS.img(id),ch=panelCH(),cw=panelCW();   // ch=boxH/PANEL_HF（boxH=hLed=F 板可视高）；cw 同源不变形
  var dx=x-cw*PANEL_XC,dy=yc-ch*PANEL_YC;            // 锚=板中心 (x,yc)
  if(lit){
    var key=cw.toFixed(1)+'x'+ch.toFixed(1);
    if(!ledLitCv||ledLitKey!==key){
      ledLitCv=document.createElement('canvas');
      ledLitCv.width=Math.max(1,Math.round(cw)); ledLitCv.height=Math.max(1,Math.round(ch)); ledLitKey=key;
      var oc=ledLitCv.getContext('2d');
      oc.drawImage(img,0,0,img.naturalWidth,img.naturalHeight,0,0,cw,ch);
      oc.globalCompositeOperation='source-atop';   // 只罩 F 板不透明像素=板面暖亮（K1：30%）
      oc.fillStyle='rgba(255,214,120,0.30)'; oc.fillRect(0,0,cw,ch);
    }
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    ctx.shadowColor='rgba(255,214,120,0.85)'; ctx.shadowBlur=ch*0.18;   // K1：shadow 沿 F 轮廓=笔画发光
    ctx.drawImage(ledLitCv,dx,dy); ctx.drawImage(ledLitCv,dx,dy);       // 叠两层增强
    ctx.restore();
    ctx.drawImage(ledLitCv,dx,dy);   // K1 热修：光晕后 source-over 重描 F 面板，防 lighter 把奶白面板吹成纯白丢笔画
  }else{
    ctx.drawImage(img,0,0,img.naturalWidth,img.naturalHeight,dx,dy,cw,ch);
  }
}
function drawLed(){ drawLedCropped(xLed(),axisY,true); }   // 场景1/3 恒点亮；场景2 投影片=断电态（无灯泡，靠强光照板成像）
// I1 filmPeep 放大观察窗 300×210：锚位随薄膜防出画布；窗内倍率自适应 k=min(PEEP_K,(bh−46)/真实像高)——窗内像高永≤bh−46 不出窗；清晰/弥散与 drawFilmImage 同源（blur 同式）
function drawFilmPeep(){
  var bw=300,bh=210,fx=filmX();
  var bx=Math.min(fx+40,W-bw-8),wy=Math.max(8,axisY-bh-20);
  ctx.save();
  ctx.strokeStyle='#b45309'; ctx.fillStyle='#b45309'; ctx.lineWidth=1.5;
  var lx0=fx,ly0=axisY-tubeDia*0.5-4,lx1=bx+2,ly1=wy+bh*0.5;   // 引线：薄膜上缘→窗左缘单段+箭头
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
  var cx=bx+bw/2,cy=wy+bh/2+8,blur=Math.abs(state.cam.vTube-vImg())*cmPx()*0.35;
  var k=Math.min(PEEP_K,(bh-46)/Math.max(1,imgHCm()*cmPx()));   // I1：窗内倍率自适应，像高=imgHCm()*cmPx()*k 永≤bh−46
  var hp=imgHCm()*cmPx()*k;
  if(!isFocused()){
    ctx.globalAlpha=0.28;
    var g=ctx.createRadialGradient(cx,cy,1,cx,cy,hp*0.3+blur+6);
    g.addColorStop(0,'rgba(255,196,50,.85)'); g.addColorStop(1,'rgba(255,196,50,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,hp*0.3+blur+6,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }
  ctx.save();
  ctx.translate(cx,cy); ctx.scale(-1,-1);   // 倒立实像：镜像+上下翻转（同 drawFilmImage）
  ctx.lineCap='round'; ctx.lineWidth=Math.max(2,hp*0.16); ctx.strokeStyle='#f59e0b';
  if(isFocused()){ fPath(hp); ctx.stroke(); }
  else{
    for(var i=0;i<4;i++){
      ctx.save(); ctx.globalAlpha=0.28;
      ctx.translate((i-1.5)*blur*0.7,(i%2?1:-1)*blur*0.5);
      fPath(hp); ctx.stroke(); ctx.restore();
    }
  }
  ctx.restore();
  ctx.fillStyle='#b45309'; ctx.font='16px sans-serif'; ctx.textAlign='center';
  ctx.fillText('薄膜上的像（放大观察）',bx+bw/2,wy+16);   // I8：窗题 16px（I1 溢出提示已删——倍率自适应永不出窗）
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
  ctx.font='16px sans-serif'; ctx.textAlign='center';
  ctx.fillText(text,(x0+x1)/2,y-6);
  ctx.restore();
}
function drawLabelsCam(){
  var xl=xLens(),fx=filmX(),fpx=F_CM*cmPx();
  dimLine(xLed(),xl,axisY+tubeDia*0.5+30,'u='+state.cam.u.toFixed(1)+' cm');
  dimLine(xl,fx,axisY-tubeDia*0.5-24,'v筒='+state.cam.vTube.toFixed(1)+' cm');
  ctx.save();
  ctx.fillStyle='#b45309'; ctx.font='700 18px sans-serif'; ctx.textAlign='center';   // I8：F 标记 18px 粗
  ctx.fillText('F',xl-fpx,axisY+tubeDia*0.5+16); ctx.fillText('F',xl+fpx,axisY+tubeDia*0.5+16);
  ctx.font='16px sans-serif';
  ctx.fillStyle=COL_DIM;
  ctx.fillText('F 光源（物）',xLed(),ledTop()-8);
  ctx.fillText('凸透镜 f=8cm',xl,axisY-lensH/2-10);
  ctx.fillText('薄膜',fx,axisY+tubeDia*0.5+16);   // G2：观察窗贴薄膜右上，标注移轴下避让引线
  ctx.restore();
  ctx.save(); ctx.fillStyle='#f59e0b';
  ctx.beginPath(); ctx.arc(xl-fpx,axisY,3,0,Math.PI*2); ctx.arc(xl+fpx,axisY,3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
// ===== 场景2 投影仪（H2）：水平光路+幕布固定右端；平面镜/天花板整套已删 =====
function drawRightScreen(){  // H2/G9/I2：幕布固定右端 x=W*0.76、高 hScr2，屏面中心骑光轴（y=axisY+0.42h）
  PROPS.screen(ctx,xScr2(),axisY+Math.round(SCR_AX*hScr2()),{h:hScr2()});
}
// L1 机身（蔡总 00:31：实心黑箱不像投影仪）：外壳改剖面壳体=左壁竖带+上壁两段横带（投影片位开插片槽口）+下壁横带，内腔留空（F 投影片/光路在腔内可见）；圆角外缘+顶缘高光+左壁散热缝+电源指示点；镜筒段（barrel 壁+口环）保持不动
function drawProjBody(){   // 蔡总 01:06 图示：实心深色圆角机身+右端面两级实心阶梯镜筒（光路/投影片/透镜叠在机身之上）
  var x0=bodyL(),x1=bodyR(),hh=tubeDia*1.5,r=12;
  var top=axisY-hh/2,bot=axisY+hh/2;
  ctx.save();   // 机身：实心填充+圆角+描边+顶缘高光
  ctx.fillStyle='#3a434e'; ctx.strokeStyle='#262c34'; ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.moveTo(x0+r,top); ctx.arcTo(x1,top,x1,bot,r); ctx.arcTo(x1,bot,x0,bot,r);
  ctx.arcTo(x0,bot,x0,top,r); ctx.arcTo(x0,top,x1,top,r); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.10)'; ctx.fillRect(x0+r,top+3,Math.max(0,x1-x0-2*r),2);   // 顶缘高光
  ctx.restore();
  var d=barrelDia(),bl=barrelL(),br=barrelR();
  var s1w=Math.round((br-bl)*0.55),h1=Math.round(d*0.62),h2=Math.round(d*0.40);   // 两级阶梯：一级高 0.62d、二级高 0.40d（二级更右伸）
  ctx.save();
  ctx.fillStyle='#2f353d'; ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=1.5;
  ctx.fillRect(bl,axisY-h1/2,s1w,h1); ctx.strokeRect(bl,axisY-h1/2,s1w,h1);
  ctx.fillRect(bl+s1w,axisY-h2/2,br-bl-s1w,h2); ctx.strokeRect(bl+s1w,axisY-h2/2,br-bl-s1w,h2);
  ctx.restore();
}
function drawLed2(){   // 蔡总 01:06 图示：投影片半插机身左缘+深色片框（先画框再叠板）；锚=板中心=xLed2；倒插=整图翻转 180°
  var x=xLed2(),yc=axisY,f=state.proj.flipped?-1:1;
  var bw=sheetBW(),bh=hLed+10;
  ctx.save(); ctx.translate(x,yc); ctx.scale(1,f); ctx.translate(-x,-yc);
  ctx.fillStyle='#2b323b'; ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=1.5;   // 片框（板叠其上露边框）
  ctx.fillRect(x-bw/2,yc-bh/2,bw,bh); ctx.strokeRect(x-bw/2,yc-bh/2,bw,bh);
  drawLedCropped(x,axisY);
  ctx.restore();
}
// H2/H8：单物点（F 板上缘）两线——平行光折射过像点+过光心直穿；K2：入射段起点不变、透镜后段起点改筒口 barrelR（视觉=光从镜头出）延长至幕布；像点=倒立（轴下方）
function drawRaysProj(){
  var x0=xLed2(),xl=xLens2(),brx=barrelR(),v=vImg2(),m=v/state.proj.u,half=OBJ_H_CM/2*cmPx();
  var y0=axisY-half,yS=axisY+half*m,Sx=xl+Math.round(v*cmPx());
  beam(x0,y0,xl,y0); beam(x0,y0,xl,axisY);
  var outs=[[brx,y0,Sx-brx,yS-y0],[brx,axisY,Sx-brx,yS-axisY]];
  for(var j=0;j<2;j++){
    var ax=outs[j][0],ay=outs[j][1],dx=outs[j][2],dy=outs[j][3];
    var t=(xScr2()-ax)/dx;   // 过像点延长到幕布
    beam(ax,ay,ax+dx*t,ay+dy*t);
  }
}
// 幕布上的像（H2 骑轴）：对上=清晰放大倒立（倒插→正立）F；偏离=弥散（模糊度∝|v像−屏距|）；J3：画像前加幕面矩形 clip 硬保证（幕面 clip 硬保证，像+弥散永在幕内）
function drawProjImage(cx,cy){
  var hpx=imgHCm2()*cmPx(),blur=Math.min(Math.abs(vImg2()-vScr2())*cmPx()*0.35,cmPx()*0.8),s=state.proj.flipped?1:-1,sharp=isFocused2();   // 弥散 blur 上限 0.8cm：糊而形辨不碎块（蔡总 01:06）
  var hw=hScr2()*0.18;   // 幕半宽=0.18h（props.js geomOf fw=0.36h）
  ctx.save();
  ctx.beginPath(); ctx.rect(xScr2()-hw*0.86,axisY-hScr2()*0.46,hw*2*0.86,hScr2()*0.92); ctx.clip();
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
  ctx.restore();   // J3 幕面 clip 外层
}
function drawLabelsProj(){
  var xl=xLens2(),fpx=F2_CM*cmPx(),yB=axisY+tubeDia*0.75,yT=axisY-tubeDia*0.75;   // 机身下/上缘（G8 高=tubeDia*1.5）
  dimLine(xLed2(),xl,yB+30,'u='+state.proj.u.toFixed(1)+' cm');
  ctx.save();
  ctx.fillStyle='#b45309'; ctx.font='700 18px sans-serif'; ctx.textAlign='center';   // I8：F 标记 18px 粗
  ctx.fillText('F',xl-fpx,yB+16); ctx.fillText('F',xl+fpx,yB+16);
  ctx.font='16px sans-serif';
  ctx.fillStyle=COL_DIM;
  ctx.fillText('投影片（F 光源）'+(state.proj.flipped?'·倒插':'·正插'),xLed2(),yT-12);
  ctx.fillText('凸透镜 f='+F2_CM+'cm（拖动=调焦）',xl,yT-28);
  ctx.fillText('幕布',xScr2(),axisY-Math.round(hScr2()*0.55)-8);
  ctx.restore();
  ctx.save(); ctx.fillStyle='#f59e0b';
  ctx.beginPath(); ctx.arc(xl-fpx,axisY,3,0,Math.PI*2); ctx.arc(xl+fpx,axisY,3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
// ===== 场景3 放大镜：亮底+F 小物体+拖透镜改 u+右侧 observer_eye 固定=人眼 =====
// H3/H8：两物点（F 板上缘+下缘）各两线（平行光折射过像点+过光心直穿）共 4 线，全带箭头+流动；出射发散光实际射向人眼、反向延长虚线交于同侧正立虚像点
function drawMagRays(){
  var x0=xLed3(),xl=xLens3(),v=vImg3(),half=OBJ_H_CM/2*cmPx(),xE=xEye();
  var Sx=xl+Math.round(v*cmPx()),m=v/state.mag.u;   // 虚像点 x（同侧）；m<0=正立
  var pts=[axisY-half,axisY+half];
  for(var k=0;k<2;k++){
    var y0=pts[k],yS=axisY-(y0-axisY)*m;   // canvas y 向下：m=v/u<0 → yS 与 y0 同侧=正立虚像
    beam(x0,y0,xl,y0); beam(x0,y0,xl,axisY);   // 入射：平行光+过光心光
    var outs=[[xl,y0,Sx-xl,yS-y0],[xl,axisY,Sx-xl,yS-axisY]];
    for(var j=0;j<2;j++){
      var ax=outs[j][0],ay=outs[j][1],dx=outs[j][2],dy=outs[j][3];
      var tf=(xE-ax)/(-dx);
      beam(ax,ay,ax-dx*tf,ay-dy*tf);   // 出射发散光实际射向人眼
      beamDash(ax,ay,Sx,yS);           // 反向延长虚线过虚像点
    }
  }
}
function drawMagImage(){   // H3：恒正立虚像（虚线轮廓）；出画布左缘→左缘向左箭头+「像退向无穷远」提示
  var ix=xImg3(),hpx=imgHCm3()*cmPx();
  if(ix<10){
    ctx.save();
    ctx.strokeStyle=COL_DIM; ctx.fillStyle=COL_DIM; ctx.lineWidth=2;
    var ay=Math.max(24,Math.min(axisY-H*0.16,H-ctrlBandH-30));
    ctx.beginPath(); ctx.moveTo(46,ay); ctx.lineTo(12,ay); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6,ay); ctx.lineTo(16,ay-5); ctx.lineTo(16,ay+5); ctx.closePath(); ctx.fill();
    ctx.font='16px sans-serif'; ctx.textAlign='left';
    ctx.fillText('像越来越大，退向无穷远',14,ay-10);
    ctx.restore();
    return;
  }
  if(ix>W-10||hpx>H*3) return;
  ctx.save(); ctx.translate(ix,axisY);
  ctx.lineCap='round'; ctx.lineWidth=Math.max(2,hpx*0.16); ctx.strokeStyle='#f59e0b';
  ctx.setLineDash([6,5]); ctx.globalAlpha=.85*dimAlpha();   // J10：虚像变虚——面亮度∝1/像面积，u→f 越来越淡
  var blur=dimBlur();   // L2 蔡总 00:31：对齐第三节——变淡同时走 ctx.filter 弥散（save/restore 复位）
  if(blur>0.4&&typeof ctx.filter==='string') ctx.filter='blur('+blur.toFixed(1)+'px)';
  fPath(hpx); ctx.stroke();
  ctx.restore();
}
// J5 eyePeep 眼视图窗 260×180 锚眼正上方=薄膜窗同款语义：正立 F（fPath 不镜像）、高=真实虚像高×k 自适应永不出窗、透明度=J10 变虚同源（虚像恒清晰轮廓、只变淡）；引线=眼顶→窗底单段+箭头
function drawEyePeep(){
  var bw=260,bh=180,ex=xEye(),ey=yEye(),eh=eyeH();
  var bx=Math.max(8,Math.min(W-bw-8,ex-130)),by=Math.max(8,ey-eh-190);   // 防出画布 clamp
  var real=imgHCm3()*cmPx(),k=Math.min(PEEP_K,(bh-46)/Math.max(1,real)),hp=real*k;
  ctx.save();
  ctx.strokeStyle='#b45309'; ctx.fillStyle='#b45309'; ctx.lineWidth=1.5;
  var lx0=ex,ly0=ey-eh/2,lx1=bx+bw/2,ly1=by+bh;
  ctx.beginPath(); ctx.moveTo(lx0,ly0); ctx.lineTo(lx1,ly1); ctx.stroke();
  var la=Math.atan2(ly1-ly0,lx1-lx0);
  ctx.save(); ctx.translate(lx1,ly1); ctx.rotate(la);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-8,-4); ctx.lineTo(-8,4); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(bx+12,by); ctx.arcTo(bx+bw,by,bx+bw,by+bh,12); ctx.arcTo(bx+bw,by+bh,bx,by+bh,12);
  ctx.arcTo(bx,by+bh,bx,by,12); ctx.arcTo(bx,by,bx+bw,by,12); ctx.closePath();
  ctx.fillStyle='rgba(255,255,255,.55)'; ctx.fill();
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2; ctx.stroke();
  ctx.save();
  ctx.translate(bx+bw/2,by+bh/2+8);
  ctx.globalAlpha=dimAlpha();   // J10：透明度与变虚同源
  ctx.lineCap='round'; ctx.lineWidth=Math.max(2,hp*0.16); ctx.strokeStyle='#f59e0b';
  ctx.setLineDash([6,5]);
  var blur=dimBlur();   // L2 蔡总 00:31：窗内 F 与虚像同式弥散（save/restore 复位）
  if(blur>0.4&&typeof ctx.filter==='string') ctx.filter='blur('+blur.toFixed(1)+'px)';
  fPath(hp); ctx.stroke();   // 正立虚像：fPath 不镜像
  ctx.restore();
  ctx.fillStyle='#b45309'; ctx.font='16px sans-serif'; ctx.textAlign='center';
  ctx.fillText('眼视图（放大观察）',bx+bw/2,by+16);   // I8：窗题 16px
  ctx.restore();
}
function drawMagScreen(x){ PROPS.screen(ctx,x,axisY+Math.round(SCR_AX*scrH),{h:scrH}); }   // G5/G9：屏高 0.32H、屏面中心骑轴
function drawLabelsMag(){
  var xl=xLens3(),fpx=F_CM*cmPx();
  dimLine(xLed3(),xl,axisY+tubeDia*0.5+30,'u='+state.mag.u.toFixed(1)+' cm');
  ctx.save();
  ctx.fillStyle='#b45309'; ctx.font='700 18px sans-serif'; ctx.textAlign='center';   // I8：F 标记 18px 粗
  ctx.fillText('F',xl-fpx,axisY+tubeDia*0.5+16); ctx.fillText('F',xl+fpx,axisY+tubeDia*0.5+16);
  ctx.font='16px sans-serif';
  ctx.fillStyle=COL_DIM;
  ctx.fillText('物体（F 小光源）',xLed3(),ledTop()-8);
  ctx.fillText('放大镜 f=8cm',xl,axisY-lensH/2-10);
  if(xImg3()>60) ctx.fillText('虚像（同侧·正立·放大）',xImg3(),Math.max(20,axisY-imgHCm3()*cmPx()/2-14));
  ctx.fillText('人眼',xEye(),yEye()-eyeH()/2-10);   // J5：眼固定位
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
  drawRightScreen();         // H2：幕布常显右端（平面镜/天花板已删）
  drawAxis();
  drawProjBody();          // G8 黑盒机身先画，投影片/光路/透镜叠上
  drawLed2();
  if(showRays) drawRaysProj();
  PROPS.lens_convex(ctx,xLens2(),axisY,{h:lensH,f:F2_CM});
  drawProjImage(xScr2(),axisY);
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
  drawLedCropped(xLed3(),axisY,true);
  PROPS.observer_eye(ctx,xEye(),yEye(),{h:eyeH()});   // J5：眼常量固定位（拖拽已删）
  drawEyePeep();
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
  updatePanel();
}
// ===== I7 橙色解说条：hint 状态机（分支判定+dismissed 语义）保留、输出端改 #toast 解说条；×关闭同分支不再自动重弹 =====
var toastEl=document.getElementById('toast'),toastTxt=document.getElementById('toast-txt'),toastXEl=document.getElementById('toast-x');
var hintSt={key:null,dismissed:null};
function hintBranch(){
  var C=state.cam;
  var P=state.proj,Mg=state.mag;
  if(state.scene==='proj'){   // H2 首屏链：拖调焦滑杆找清晰像→倒插投影片看像正立（常考点）→完
    if(!P.everFocused) return {key:'p-focus',text:'投影仪：拖「调焦」滑杆（或直接拖凸透镜）改物距 u——找到幕布上出现清晰放大倒立像的位置（真实投影仪用短焦透镜强放大，这就是调焦）'};
    if(!P.everFlip) return {key:'p-flip',text:'幕布上的像是倒立的！怎样让屏幕上的像正过来？试试「倒插投影片」（常考点）'};
    return {key:'p-done',text:'对了！投影片倒插，幕布上的像就正立了。f<u<2f 成放大倒立实像=投影仪原理'};
  }
  if(state.scene==='mag'){   // 首屏链（G10 恒 u<f）：贴近拖远看虚像渐大→拖屏承接验证虚像(K5)
    if(!Mg.everDrag) return {key:'m-drag',text:'放大镜：贴近物体（u<f）看到同侧正立放大的虚像。拖透镜慢慢远离物体，看虚像怎样越来越大（放大镜恒在焦点以内使用）'};
    if(Mg.u>=F_CM*0.85) return {key:'m-dim',text:'虚像越来越大、也越来越淡：同样的光摊到更大的像面上，面亮度下降；拖到焦点上就不成像了'};   // J10：u≥0.85f 变虚文案
    if(!Mg.everScreen) return {key:'m-screen',text:'虚像能用光屏承接吗？从托盘把光屏拖到透镜左侧虚像的位置试试'};
    return {key:'m-done',text:'屏上没有像：虚像处光并没有实际会聚，屏承接不了，且物像同在透镜一侧。放大镜=u<f 成正立放大虚像'};
  }
  if(!C.everFocused) return {key:'c-focus',text:'模型照相机：前纸筒嵌凸透镜、后纸筒蒙半透明薄膜。拖后纸筒（或调「相机焦距」滑杆）改薄膜到透镜的距离，直到薄膜上的 F 变清晰（想想做做：拉筒调距=调像距）'};
  if(!C.everDragLed) return {key:'c-led',text:'对上焦了！拖整个相机改物距 u：物近（u 小）→像变大、像距也变大，要拉长后筒才能重新对上'};
  if(!C.chalDone){ return {key:'c-chal',text:'挑战：想让薄膜上的像变大一些，应该怎么操作？先移物、再调筒，做对会有确认'}; }
  if(hintSt.dismissed!=='c-done') return {key:'c-done',text:'做对了！物近（u 小）像变大、像距变大，拉长后筒（v筒 变大）承接清晰像——这就是挑战的答案'};
  return {key:'c-scene',text:'照相机场景通关。点页底分段钮切换投影仪/放大镜场景，返回照相机状态原样恢复'};
}
function toastHide(){ if(toastEl){ toastEl.classList.remove('show'); toastEl.classList.remove('narrow'); } }
// J7：当前场景器材包围盒（canvas 坐标，常量直算）——解说条与之相交→加 .narrow 收窄换行避让
function sceneBBox(){
  if(state.scene==='proj'){
    return {x0:Math.min(bodyL(),xLed2()-Math.round(sheetBW()*0.5)),x1:xScr2()+hScr2()*0.18,y0:axisY-hScr2()*0.5,y1:axisY+hScr2()*0.5};   // s2：片左缘..幕右缘（蔡总 01:06 片半插外露入 bbox）
  }
  if(state.scene==='mag'){
    var bx=Math.max(8,Math.min(W-268,xEye()-130));
    return {x0:xLed3()-ledVisW()/2,x1:bx+260,y0:Math.min(axisY-H*0.2,Math.max(8,yEye()-eyeH()-190)),y1:axisY+H*0.2};   // s3：物左缘..眼视图窗右缘；轮5热修 y0 并入眼视图窗顶——窗被解说条压到才让路（蔡总 19:25 复验窄窗压窗不避让）
  }
  var px=Math.min(filmX()+40,W-308);
  return {x0:xLed()-ledVisW()/2,x1:px+300,y0:Math.min(axisY-tubeDia,Math.max(8,axisY-230)),y1:axisY+tubeDia};   // s1：F 左缘..filmPeep 窗右缘；轮5热修 y0 并入窗顶(axisY−230)——窗被解说条压到才让路
}
function checkToastFit(){
  if(!toastEl) return;
  if(!toastEl.classList.contains('show')){ toastEl.classList.remove('narrow'); return; }
  var tr=toastEl.getBoundingClientRect(),cr=cv.getBoundingClientRect(),s=cr.width/W,b=sceneBBox();
  var ax=cr.left+b.x0*s,ay=cr.top+b.y0*s,bx=cr.left+b.x1*s,by=cr.top+b.y1*s;   // canvas 坐标→屏幕坐标（乘 canvas rect/W）
  toastEl.classList.toggle('narrow',ax<tr.right&&bx>tr.left&&ay<tr.bottom&&by>tr.top);
}
function sayHint(){   // 持久 hint：当前分支文案写入解说条；已×关闭同分支/动画中=隐藏
  if(!toastEl||state.animating){ toastHide(); return; }
  var o=hintBranch();
  hintSt.key=o.key;
  if(o.key==='c-chal'&&!state.cam.chalH0) state.cam.chalH0=imgHCm();   // 挑战基线像高
  if(hintSt.dismissed===o.key){ toastHide(); return; }
  if(toastTimer){ clearTimeout(toastTimer); toastTimer=null; }
  toastTxt.textContent=o.text; toastEl.classList.add('show');
  checkToastFit();   // J7：文案写入后立即检测一次
}
if(toastXEl) toastXEl.addEventListener('click',function(){ hintSt.dismissed=hintSt.key; toastHide(); });
// ===== 读数面板（幽灵化三级色阶浮层） =====
function updatePanel(){
  var pn=document.getElementById('panel-read'); if(!pn||!pn.classList.contains('show')) return;
  var pu=document.getElementById('pr-u'),pv=document.getElementById('pr-v'),pnat=document.getElementById('pr-nat'),pnote=document.getElementById('pr-note');
  var ths=pn.querySelectorAll('table.rec th');
  if(state.scene==='proj'){   // 场景2（H2）：像距 v 与屏距对照，清晰=|v像−屏距|≤0.6
    if(ths[1]) ths[1].textContent='像距 v';
    if(pu) pu.textContent=state.proj.u.toFixed(1)+' cm';
    if(pv) pv.textContent=vImg2().toFixed(1)+' cm（屏距 '+vScr2().toFixed(1)+' cm）';
    if(pnat) pnat.textContent='倒立/放大/实像'+(isFocused2()?'（清晰）':'（弥散）');
    if(pnote) pnote.textContent='短焦透镜 f<u<2f：强放大实像直接投上幕布';
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
function showToast(msg){   // I7 事件 toast：覆盖显示 4s 后回落当前 hint 解说
  if(!toastEl||!toastTxt) return;
  if(toastTimer) clearTimeout(toastTimer);
  toastTxt.textContent=msg; toastEl.classList.add('show');
  checkToastFit();   // J7：事件 toast 写入后立即检测一次
  toastTimer=setTimeout(function(){ toastTimer=null; sayHint(); },4000);
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
// J5：眼拖拽命中已删——眼为常量固定位（xEye/yEye）
// ===== 对焦边检+挑战判定 =====
function checkFocus(){
  var C=state.cam,f=isFocused();
  if(f&&!C.focused){
    C.focused=true; C.everFocused=true;
    glowFx.push({x:filmX(),y:axisY,t0:performance.now(),c:'255,214,120'});
    if(window.playMatch) playMatch();
    showToast('清晰！倒立缩小的实像成在薄膜上');
    sayHint();
  }else if(!f&&C.focused){ C.focused=false; sayHint(); }
  if(!C.chalDone&&C.chalH0&&C.focused&&imgHCm()>C.chalH0*1.1){
    C.chalDone=true;
    if(window.playMatch) playMatch();
    sayHint();
  }
}
// 场景2 对焦边检（H2：|v像−屏距|≤0.6）
function checkFocus2(){
  var P=state.proj,f=isFocused2();
  if(f&&!P.focused){
    P.focused=true; P.everFocused=true;
    glowFx.push({x:xScr2(),y:axisY,t0:performance.now(),c:'255,214,120'});
    if(window.playMatch) playMatch();
    showToast('清晰！放大倒立的实像成在幕布上（f<u<2f）');
    sayHint();
  }else if(!f&&P.focused){ P.focused=false; sayHint(); }
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
  if(drag){ cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; sayHint(); draw(); }
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
  if(drag.k==='lens2'){ state.proj.u=clampU2(uFromX2(p.x-drag.dx)); state.proj.pfSet=true; syncPfSlider(); checkFocus2(); draw(); return; }   // K2：拖拽 x→u 经筒内行程逆映射（双向联动不变）
  if(drag.k==='lens3'){
    var u3=clampU3((p.x-drag.dx-xLed3())/cmPx());
    state.mag.u=u3; state.mag.everDrag=true;
    if(u3>=U3_MAX-0.05&&!drag.lim){   // H3：拖到上限气泡（u 上限 7.0<f=8，放大镜恒在焦点以内用）
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
  if(drag.k==='screen'){   // H3：释放点在托盘卡内→回收；否则留光轴（y 自动骑轴）；虚像区释放→K5 照旧
    var Mg=state.mag;
    if(toolboxMag&&toolboxMag.pointInCard(p)){
      Mg.screenX=null;
    }else{
      Mg.screenX=Math.max(34,Math.min(W-60,p.x));
      if(p.x<xLens3()-20){
        Mg.everScreen=true;
        if(window.playDrop) playDrop();
        showToast('屏上没有像：虚像处光不实际会聚，屏承接不了');
      }
    }
    drag=null; cv.style.cursor=''; sayHint(); draw(); return;
  }
  if(moved&&window.playDrop) playDrop();
  drag=null; cv.style.cursor='';
  if(state.scene==='cam') checkFocus();
  else if(state.scene==='proj') checkFocus2();
  sayHint(); draw();
}
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',endDrag);
// ===== 控制条（动画期间锁全部输入） =====
var btnRays=document.getElementById('btn-rays');
if(btnRays) btnRays.addEventListener('click',function(){
  if(state.animating) return;
  showRays=!showRays; btnRays.classList.toggle('on',showRays);
  if(showRays) flowT0=performance.now();   // H8：开光路时流动相位归零
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
  toastHide();
  hintSt.dismissed=null; syncCamSlider();
}
function resetProj(){
  var P=state.proj;
  P.u=U2_DEF; P.flipped=false; P.focused=false; P.everFocused=false; P.everFlip=false; P.pfSet=false;
  glowFx=[];
  showRays=true; showLabels=false;
  if(btnRays) btnRays.classList.add('on');
  if(btnLabels) btnLabels.classList.remove('on');
  toastHide();
  hintSt.dismissed=null; syncProjBtns(); syncPfSlider();
}
function resetMag(){
  var Mg=state.mag;
  Mg.u=U3_DEF; Mg.everDrag=false; Mg.screenX=null; Mg.everScreen=false;
  glowFx=[];
  showRays=true; showLabels=false;
  if(btnRays) btnRays.classList.add('on');
  if(btnLabels) btnLabels.classList.remove('on');
  toastHide();
  hintSt.dismissed=null;
}
var btnReset=document.getElementById('btn-reset');
if(btnReset) btnReset.addEventListener('click',function(){
  if(state.animating) return;
  if(state.scene==='cam') resetCam();
  else if(state.scene==='proj') resetProj();
  else resetMag();
  if(window.playClick) playClick(); sayHint(); draw();
});
// ===== 场景2 动作卡（H2）：倒插投影片（平面镜钮已删） =====
var btnFlip=document.getElementById('btn-flip');
function syncProjBtns(){
  if(btnFlip){ btnFlip.textContent=state.proj.flipped?'正插投影片':'倒插投影片'; btnFlip.classList.toggle('on',state.proj.flipped); }
}
if(btnFlip) btnFlip.addEventListener('click',function(){
  if(state.animating||state.scene!=='proj') return;
  state.proj.flipped=!state.proj.flipped; state.proj.everFlip=true;
  if(window.playClick) playClick();
  showToast(state.proj.flipped?'倒插：屏上的像正过来了':'正插：屏上的像倒立');
  syncProjBtns(); sayHint(); draw();
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
  toastHide();
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
['f_led_panel','paper_tube','paper_tube_inner','observer_eye'].forEach(function(id){
  PROPS.onSprite(id,function(){ draw(); });
});
// ===== 动画 tick（飞入飞出 + 对焦光晕 300ms 渐隐） =====
var fitFrame=0;
function tick(){
  if(++fitFrame%10===0) checkToastFit();   // J7：每 10 帧检测解说条与器材包围盒相交→narrow
  if(state.animating){
    if(performance.now()-state.anim.t0>=ANIM_DUR){
      state.animating=false; state.anim=null;
      hintSt.key=null; sayHint();   // 动画结束按新场景分支刷新解说条
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
flowT0=performance.now();   // H8：初始流动相位
syncSceneUI(); sayHint(); draw(); requestAnimationFrame(tick);
window.__c5s2dbg={ get state(){return state;}, get W(){return W;}, get H(){return H;}, get axisY(){return axisY;},
  setU:function(v){ state.cam.u=clampU(v); checkFocus(); sayHint(); draw(); },
  setV:function(v){ state.cam.vTube=clampV(v); syncCamSlider(); checkFocus(); sayHint(); draw(); },
  vImg:vImg, focused:isFocused,
  setU2:function(v){ state.proj.u=clampU2(v); syncPfSlider(); checkFocus2(); sayHint(); draw(); },
  vImg2:vImg2, vScr2:vScr2, focused2:isFocused2,
  bodyL:bodyL, bodyR:bodyR, xScr2:xScr2, hScr2:hScr2, imgHCm2:imgHCm2, xLed2:xLed2, xLens2:xLens2,   // J2/J3/J4 探针口
  barrelL:barrelL, barrelR:barrelR, barrelDia:barrelDia, lensX2:lensX2,   // K2 探针口（筒通道/行程映射断言用）
  setU3:function(v){ state.mag.u=clampU3(v); sayHint(); draw(); },
  vImg3:vImg3, xEye:xEye, yEye:yEye, dimAlpha:dimAlpha, imgHCm3:imgHCm3, sceneBBox:sceneBBox };   // J5/J10 探针口
})();

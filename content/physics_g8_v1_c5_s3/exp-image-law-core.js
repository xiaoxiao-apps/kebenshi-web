(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
// ===== 单位制：cm 语义单点换算；刻度以透镜为 0 点（I3），轨超长部分出画 =====
var HO_CM=3.0;                       // 物高（教材：高度为3.0 cm且带有刻度的发光物体）
var D_CM=7;                          // 透镜孔径（cm）：HO*2 < D 保证顶点平行光线全进孔径
var SC_H_CM=12;                      // 光屏面高（cm）：探针 f=10 可达清晰态最大像高=3*45.1/12.85≈10.5cm<12，像永不出屏
var F_MIN_CM=2,F_MAX_CM=12,F_DEF_CM=10,F_SNAPS_CM=[10,20],F_SNAP_TOL_CM=0.15;   // f 滑杆：2~12cm 连续+10/20cm 吸附点
var EPS_CM=0.25;                     // u=f 不成像判定带 |u−f|≤eps
var SHARP_TOL_CM=0.6;                // 清晰判据 |v屏−v像|≤0.6cm
var U_MIN_CM=4,U_MAX_CM=28;          // H4 物距可拖范围=教材全域 4..28
var V_MIN_CM=3,V_MAX_CM=58;          // 屏位 v 范围（透镜右侧，受轨右端限）
var COMPACT_H=600;                   // 小窗紧凑档阈值（照 c5s1）
var ANIM_DUR=520;                    // 自动寻像/撤屏动画时长 ms
var COL_RAY='#dc2626';
var COL_FLOW='#2563eb';              // H8 流动蓝统一 c5s1 基准
var VIS_K=1.6;                       // 物像同倍显示放大；上轮 6 为子代理私改违规格，回正
var FONT='\"Yuanti SC\",\"YouYuan\",\"PingFang SC\",\"Microsoft YaHei\",sans-serif';
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var W=960,H=520,DPR=1,axisY=200,S=9,xLens=335,ctrlBandH=150;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function cmPx(){ return H*0.024; }   // H4 起标 S=H*0.024：可见 span≈W/S≈77cm、教材 u 全域 4~28 可拖
// I6 显示坐标自洽：一切竖直显示量（物高/像高/屏面高/孔径）同乘 VIS_K；水平位置（xOfU/xOfV/fPxV）仍真 cm*S
// 探针 W1440/H766：hoPx=88.2≥0.09H(68.9)、dPxV=205.9≥0.15H(114.9)、scHPx=353.0；像高px=hoPx*|m|≤scHPx ⟺ |m|≤SC_H_CM/HO_CM=4
function hoPx(){ return HO_CM*S*VIS_K; }        // 显示物高=3.0cm*1.6=4.8cm 视觉（读数仍真 cm HO_CM）
function fPxV(){ return st.f*S; }               // 焦距=水平距离，不乘 VIS_K（F/2F 标记与刻度同系）
function dPxV(){ return D_CM*S*VIS_K; }         // 显示孔径（同倍）
function scHPx(){ return SC_H_CM*S*VIS_K; }     // 显示屏面高=SC_H_CM 视觉（像永不出屏）
function xOfU(u){ return xLens-u*S; }
function xOfV(v){ return xLens+v*S; }
var st={
  u:21,f:F_DEF_CM,vSc:19.1,           // 初始态：u=21(>2f=20)、f=10、屏在清晰像位 v=210/11≈19.1 → 进页即见倒立缩小实像
  obj:'F',lit:true,
  screenOn:true,screenA:1,eye:false,eyeA:0,eyeOff:0,eyeX:null,
  hand:false,handA:0,marks:true,rays:true,
  rows:[],anim:null,
  fTip:false,touched:false,snapI:0,wasSharp:true,eyeTip:false,eyeTipShown:false
};
var drag=null,startPt=null,toolbox=null,trayCard=null,toastTimer=null,glowFx=[];
function layout(){
  axisY=Math.round(H*0.40);
  S=cmPx(); xLens=Math.round(W*0.42);   // I2 主体居中：0.40W→0.42W（探针 W1440/H766 默认 u=21/v=19.1 构图 bbox 中心 0.365W→0.385W；
                                        // 再右移即压缩屏行程 vMaxDyn 45.4→43.8cm，故止于 0.42W，残余偏左源自默认态 u=21 物在左远端）
  // J8 托盘左下：控制条上方 10px（滑轨横贯中部，托盘不入轨区、与器材 bbox 零相交——探针见 /tmp/c5s23_fx3e_probe）；slot 只放缩略图
  var cardH=124;
  var card={x:14,y:H-ctrlBandH-cardH-10,w:300,h:cardH,r:10,fill:'rgba(243,233,215,0.95)',stroke:'#b45309'};   // H7 暖米黄托盘卡+琥珀描边
  var nat={f_led:{w:56,h:56},candle:{w:56,h:56}};
  var ids=['f_led','candle'],items=[];
  for(var i=0;i<ids.length;i++) items.push({id:ids[i],x:card.x+80+i*140,y:card.y+64});
  var fit=(H<COMPACT_H)?Math.min(100,Math.round(H*0.19)):100;
  trayCard=card;
  toolbox=PROPS.toolbox.create({card:card,items:items,fit:fit,nat:nat});
}
function clampU(u){ return Math.max(U_MIN_CM,Math.min(U_MAX_CM,u)); }
function vMaxDyn(){ return Math.max(V_MIN_CM+1,Math.min(V_MAX_CM,(W-30-xLens)/S)); }   // G11 屏拖动态上界：屏不出画布右缘（物理 vImg 不 clamp）
function clampV(v){ return Math.max(V_MIN_CM,Math.min(vMaxDyn(),v)); }
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
var flowT0=performance.now();
function exitCut(xL,yi,ex,ey,dir){   // K4 撤屏态：出射光只画透镜右侧 ~40px 发散示意段（起点透镜、终点=起点+方向*40px）
  if(!st.screenOn&&dir>0){ var L=Math.hypot(ex-xL,ey-yi); if(L>40){ ex=xL+(ex-xL)*40/L; ey=yi+(ey-yi)*40/L; } }
  return {x:ex,y:ey};
}
function beam(x0,y0,x1,y1){   // H8 逐字照 c5s1 L157-168：showFlow(=st.rays 光路开关绑定) 时底线减淡+蓝虚线脉冲流动；非流动实线；箭头保留
  ctx.save(); ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1);
  if(st.rays){
    ctx.globalAlpha=.3; ctx.strokeStyle=COL_RAY; ctx.lineWidth=2; ctx.stroke();
    ctx.globalAlpha=1; ctx.setLineDash([6,12]);
    ctx.lineDashOffset=-((performance.now()-flowT0)*0.06)%18;
    ctx.strokeStyle=COL_FLOW; ctx.lineWidth=2.4; ctx.stroke();
  }else{
    ctx.strokeStyle=COL_RAY; ctx.lineWidth=2; ctx.stroke();
  }
  var a=Math.atan2(y1-y0,x1-x0),L=8;   // G6 段末箭头
  ctx.setLineDash([]);
  ctx.fillStyle=COL_RAY; ctx.beginPath();
  ctx.moveTo(x1,y1); ctx.lineTo(x1-L*Math.cos(a-0.42),y1-L*Math.sin(a-0.42)); ctx.lineTo(x1-L*Math.cos(a+0.42),y1-L*Math.sin(a+0.42));
  ctx.closePath(); ctx.fill();
  ctx.restore();
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
  if(Math.abs(yi-axisY)>dPxV()/2){   // 孔径裁切（dPxV 已含 VIS_K，保顶点光线进孔径）：超孔径光线直穿不折射（照 c5s1）
    var e0=refractEnd(xL,yi,mIn,dir),c0=exitCut(xL,yi,e0.x,e0.y,dir);
    beam(xL,yi,c0.x,c0.y);
    return;
  }
  var m=refractSlope(yi,mIn,dir);
  if(Math.abs(m)<1e-9){ var cp=exitCut(xL,yi,dir>0?W+2:-2,yi,dir); beam(xL,yi,cp.x,cp.y); return; }   // u=f：出射平行
  var e=refractEnd(xL,yi,m,dir),c=exitCut(xL,yi,e.x,e.y,dir);
  beam(xL,yi,c.x,c.y);
  if(imgKind()==='virtual'){   // K4 虚像：反向延长虚线到虚像保留（撤屏态同）
    beamDash(xL,yi,imgX(),axisY-imgH());
  }
}
function drawRays(){
  if(!st.rays||!st.lit) return;
  var px0=xOfU(st.u),py0=axisY-hoPx();   // G6 单物点（物顶一点）；K4 入眼光线裁切链已全删
  ctx.save();
  if(st.handA>0) ctx.globalAlpha=1-0.45*st.handA;   // H6 遮挡：通光量连续渐减
  traceRay(px0,py0,xLens,py0,0,1);       // ① 平行主轴入射 → 折射过像方焦点
  var mC=(axisY-py0)/(xLens-px0);
  traceRay(px0,py0,xLens,axisY,mC,1);    // ② 过光心直穿不改方向
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
function drawRuler(){   // I3 刻度以透镜为 0 点：cm=(x−xLens)/S，左负右正；5cm 小刻度线两侧都有、10cm 数字（16px）；F/2F 标记位置仍由 drawMarks 按 ±f/±2f 相对透镜
  ctx.save();
  ctx.strokeStyle='rgba(90,80,60,.55)'; ctx.lineWidth=1; ctx.textAlign='center';
  ctx.fillStyle='rgba(90,80,60,.85)';
  ctx.font='16px '+FONT;
  var cA=Math.ceil(-xLens/S/5)*5,cB=Math.floor((W-xLens)/S/5)*5;
  for(var cm=cA;cm<=cB;cm+=5){
    var x=xLens+cm*S,big=(cm%10===0);
    ctx.beginPath(); ctx.moveTo(x,axisY); ctx.lineTo(x,axisY+(big?7:4.5)); ctx.stroke();
    if(big) ctx.fillText(cm<0?'-'+Math.abs(cm):String(cm),x,axisY+7+Math.max(14,Math.round(0.95*S)));
  }
  ctx.restore();
}
// K1 f_led_panel.png（800×800，无底座纯 F 发光面）探针 rows105-710/cols198-606（设计书§14 L280）：
// 板中心行 407.5/800=0.509、板高 605/800=0.756、板中心列 402/800=0.502、板宽 408/800=0.51；整图绘制不裁切
var PANEL_XC=0.502,PANEL_YC=0.509,PANEL_WF=0.51,PANEL_HF=0.756;
var ledLitCv=null,ledLitKey='';
function ledLitCanvas(img,dw,dh){   // K1 离屏整图：source-atop 暖罩 30%（蔡总 23:14；按尺寸键缓存）
  var key=Math.round(dw)+'x'+Math.round(dh);
  if(!ledLitCv||ledLitKey!==key){
    if(!ledLitCv) ledLitCv=document.createElement('canvas');
    ledLitCv.width=Math.max(1,Math.round(dw)); ledLitCv.height=Math.max(1,Math.round(dh)); ledLitKey=key;
  }
  var oc=ledLitCv.getContext('2d');
  oc.clearRect(0,0,ledLitCv.width,ledLitCv.height);
  oc.globalCompositeOperation='source-over';
  oc.drawImage(img,0,0,dw,dh);
  oc.globalCompositeOperation='source-atop';
  oc.fillStyle='rgba(255,214,120,0.8)';   // 整 F 形填暖色=剪影光晕源（不保原色，防板面照白；蔡总 00:05）
  oc.fillRect(0,0,ledLitCv.width,ledLitCv.height);
  return ledLitCv;
}
function drawLedPanel(x,yc,boxH,litOn){   // K1 整图绘制+锚点：(x,yc)=F 板中心；板高=boxH；lit=暖罩层+lighter shadowBlur 沿 F 笔画发光层（两层，删大径向光晕）
  if(!PROPS.spriteReady('f_led_panel')) return;
  var img=PROPS.img('f_led_panel');
  var dh=boxH/PANEL_HF,dw=dh*img.naturalWidth/img.naturalHeight;
  var dx=x-dw*PANEL_XC,dy=yc-dh*PANEL_YC;
  if(litOn){
    var lc=ledLitCanvas(img,dw,dh);   // 剪影光晕源
    ctx.save(); ctx.globalCompositeOperation='lighter';
    ctx.shadowColor='rgba(255,214,120,0.85)'; ctx.shadowBlur=dh*0.16;
    ctx.drawImage(lc,dx,dy);   // 光晕层：剪影画一层，光晕贴 F 轮廓（蔡总 00:05：不照白）
    ctx.restore();
    ctx.drawImage(img,dx,dy,dw,dh);   // 本体正常叠上：笔画清晰、内部不照白
  }else{
    ctx.drawImage(img,dx,dy,dw,dh);
  }
}
function drawObject(){   // F 形 LED 光源（K1 f_led_panel 整图）/ 蜡烛（托盘换用，绘制分支不动）
  var x=xOfU(st.u),bot=axisY+hoPx();
  if(st.obj==='candle') PROPS.candle(ctx,x,bot,{h:hoPx()*2,lit:st.lit});
  else drawLedPanel(x,axisY,2*hoPx(),st.lit);
}
function drawLens(){   // 凸透镜中固定；f 滑杆联动 opt.f 凸度；(x,axisY)=光心骑光轴
  PROPS.lens_convex(ctx,xLens,axisY,{h:dPxV(),f:st.f});   // 孔径显示系（dPxV 已含 VIS_K，与物高同倍）
}
function drawHand(){   // K5 遮光板剖面卡纸：竖直薄板立透镜正前方（右缘距透镜 ap*0.14≈28.8px≥8px 零重叠）盖上半孔径；米白纸面+灰褐描边+顶缘捏手；st.handA 淡入淡出/通光量系数不变
  if(st.handA<=0.01) return;
  var ap=dPxV();                               // 绘制孔径（显示系，已含 VIS_K）
  var w=Math.max(6,Math.round(ap*0.09)),h=ap*0.55;
  var bx=xLens-ap*0.14-w,by=axisY-ap*0.275-h/2;   // 板中心 x=xLens−ap*0.14−w/2（右缘距透镜 ap*0.14）、y=axisY−ap*0.275（板跨 [axisY−0.55ap, axisY]）
  ctx.save(); ctx.globalAlpha=st.handA;
  ctx.fillStyle='#f5efe0'; ctx.strokeStyle='#8a7c66'; ctx.lineWidth=1.5;
  roundRect(bx+w/2-w*1.1,by-h*0.18,w*2.2,h*0.18,Math.min(4,w*0.55)); ctx.fill(); ctx.stroke();   // 顶缘捏手：板顶中央向上小圆头矩形（同纸色）
  roundRect(bx,by,w,h,2); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function drawScreen(){
  if(st.screenA<=0.02) return;
  // G9 锚点标定：props.js screen geomOf 解析 cy=−h/2 → 屏面中心在锚点上方 0.5h 处（设计书§10 ≈−0.42h 为目测近似，以解析值为准）；
  // 锚 y 传 axisY+scHPx()/2=axisY+0.5h 使屏面中心骑光轴；hitScreen/screenGeom 走同锚点同偏移
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
  if(!st.screenOn &&imgKind()==='virtual'){   // G15 眼下方标注
    ctx.fillStyle='#8a6d3b'; ctx.textAlign='center'; ctx.font='16px '+FONT;
    ctx.fillText('眼接住发散出射光，脑沿反向延长看到正立放大虚像',Math.max(160,Math.min(W-160,e.x)),e.y+e.h/2+16);
  }
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
  ctx.font='600 16px '+FONT;
  ctx.fillText('眼视图',wx+ww/2,wy+16);
  var k=imgKind(),cx=wx+ww/2,cy=wy+wh/2+8;
  if(!st.lit){
    ctx.fillStyle='#64748b'; ctx.font='16px '+FONT;
    ctx.fillText('光源关闭',cx,cy+4);
  }else if(k==='none'){
    ctx.fillStyle='#64748b'; ctx.font='16px '+FONT;
    ctx.fillText('不成像',cx,cy+4);
  }else if(k==='virtual'){   // G13 正立放大 F：高=窗高*0.7*clamp(|m|/4,0.25,1)，每帧随 u 连续变；窗内容不随眼位变（G15 核对✓）；J10 同乘 dimAlpha 变虚
    var hp=wh*0.7*Math.max(0.25,Math.min(1,Math.abs(mag())/4));
    ctx.save(); ctx.globalAlpha*=dimAlpha(); ctx.translate(cx,cy+hp/2); ctx.scale(hp,hp); fPattern(ctx); ctx.restore();
  }else{   // u≥f 撤屏态：倒立实像小图（同随 |m| 连续缩放）
    var hr=wh*0.5*Math.max(0.25,Math.min(1,Math.abs(mag())/4));
    ctx.save(); ctx.translate(cx,cy-hr/2-6); ctx.scale(-hr,-hr); fPattern(ctx); ctx.restore();
    ctx.fillStyle='#b45309'; ctx.font='15px '+FONT;
    ctx.fillText('空中实像',cx,wy+wh-8);
  }
  ctx.restore();
}
// ===== 像的渲染：F 图案镜像(scale(-1,1))+上下翻转=实像；虚像正立不镜像；蜡烛→简笔火焰图案 =====
function fPattern(c){   // I5 像图案=描边 F：几何照 c5s2 fPath（w=h*0.62，竖+上横+中横三笔 stroke、lineCap round）；
  var w=0.62;           // 单位系 h=1，fPath 的 y∈[-0.5,0.5] 整体平移 −0.5 → y∈[-1,0]，底缘落光轴（drawPattern 已 translate 到 axisY）
  c.save();
  c.lineCap='round'; c.lineJoin='round'; c.lineWidth=0.16; c.strokeStyle='#f59e0b';
  c.beginPath();
  c.moveTo(-w/2,-1);   c.lineTo(-w/2,0);          // 竖笔
  c.moveTo(-w/2,-1);   c.lineTo(w/2,-1);          // 上横
  c.moveTo(-w/2,-0.5); c.lineTo(w*0.28,-0.5);     // 中横
  c.stroke();
  c.restore();
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
  ctx.globalAlpha=Math.max(0,Math.min(1,alpha))*(1-0.5*st.handA);   // H6 像亮度系数=1−0.5*handA 连续
  if(blur>0.4&&typeof ctx.filter==='string') ctx.filter='blur('+blur.toFixed(1)+'px)';
  ctx.translate(x,axisY);
  var k=inverted?-hI:hI;
  ctx.scale(k,k);   // 实像 scale(−,−)=镜像+上下翻转；虚像正立不镜像
  if(st.obj==='candle') flamePattern(ctx); else fPattern(ctx);
  ctx.restore();
}
function drawImageOnScreen(){   // 屏上像：清晰判据内=清晰；偏离=弥散模糊像（模糊度∝|v屏−v像|，drawSpot 推广）
  if(!st.lit||st.screenA<=0.02||imgKind()!=='real') return;
  var vI=vImg(),dv=Math.abs(st.vSc-vI);
  if(dv<=SHARP_TOL_CM) drawPattern(xOfV(st.vSc),hoPx()*(vI/st.u),true,1,0);
  else{
    var blur=Math.min(16,1.5+dv*S*0.20),a=Math.max(.28,1-dv/16);
    drawPattern(xOfV(st.vSc),hoPx()*(st.vSc/st.u),true,a,blur);
  }
}
function dimAlpha(){   // K3 虚像变虚：面亮度∝1/像面积加强曲线（蔡总 23:14：越大越虚要明显）
  return Math.max(0.15,Math.min(1,1-0.85*Math.pow(st.u/st.f,2)));
}
function drawVirtualImage(){   // G13 虚像常显：u<f 即画同侧正立虚像，不绑撤屏；J8 虚线框已删；K3 双通道=dimAlpha+blur=8*(u/f)²
  if(!st.lit||imgKind()!=='virtual') return;
  var ix=imgX(),ih=imgH();
  if(ix<-80||ix>W+80) return;   // 出画交给 drawOffArrow 指示
  drawPattern(ix,ih,false,dimAlpha(),8*Math.pow(st.u/st.f,2));
}
function drawOffArrow(){   // G11 像 v 超画布缘：画布缘出画箭头+读数照显（读数面板 v 值不 clamp 物理）
  if(!st.lit||imgKind()==='none') return;
  var ix=imgX();
  ctx.save(); ctx.fillStyle='#dc2626'; ctx.font='600 16px '+FONT;
  if(imgKind()==='real'&&(ix>W-6||vImg()>vMaxDyn())){   // H4 v像超屏行程：屏 clamp 在 vMaxDyn，右缘出画箭头（读数不 clamp 物理）
    ctx.textAlign='right';
    ctx.beginPath(); ctx.moveTo(W-6,axisY); ctx.lineTo(W-18,axisY-7); ctx.lineTo(W-18,axisY+7); ctx.closePath(); ctx.fill();
    ctx.fillText('实像出画 → v='+vImg().toFixed(1)+' cm',W-22,axisY-12);
  }else if(imgKind()==='virtual'&&ix<6){
    ctx.textAlign='left';
    ctx.beginPath(); ctx.moveTo(6,axisY); ctx.lineTo(18,axisY-7); ctx.lineTo(18,axisY+7); ctx.closePath(); ctx.fill();
    ctx.fillText('← 虚像出画 |v|='+Math.abs(vImg()).toFixed(1)+' cm',22,axisY-12);
  }
  ctx.restore();
}
function drawMarks(){   // F/2F 双侧刻度点常驻（显示开关可关）
  if(!st.marks) return;
  ctx.save();
  ctx.fillStyle='#b45309'; ctx.textAlign='center';
  ctx.font='700 18px '+FONT;   // I8 F/2F 标注投屏可读
  var fs=[-2,-1,1,2];
  for(var i=0;i<4;i++){
    var x=xLens+fs[i]*fPxV();
    if(x<8||x>W-8) continue;
    ctx.beginPath(); ctx.arc(x,axisY,Math.max(2.5,S*0.32),0,Math.PI*2); ctx.fill();
    ctx.fillText(Math.abs(fs[i])===1?'F':'2F',x,axisY-Math.max(7,0.9*S));
  }
  ctx.restore();
}
function drawTray(){   // H7 暖米黄卡+「器材托盘」角标；缩略图归一化防出界（探针断言 bbox⊂卡片矩形）
  toolbox.drawCard(ctx);
  ctx.save(); ctx.fillStyle='#8a6d3b'; ctx.textAlign='left'; ctx.font='15px '+FONT;
  ctx.fillText('器材托盘',trayCard.x+8,trayCard.y+16); ctx.restore();
  var slots=toolbox.slots,cardH=trayCard.h,bot=trayCard.y+cardH-8;
  for(var i=0;i<slots.length;i++){
    var s=slots[i];
    var th=Math.min(s.h*0.8,cardH-16);   // 超高时等比缩
    if(s.id==='candle') PROPS.candle(ctx,s.x,bot,{h:th,lit:true});
    else drawLedPanel(s.x,bot-th/2,th,true);   // K1 缩略图：板中心=bot−th/2 使板底缘对齐 bot；lit 恒 true=带光效版
  }
}
function draw(){
  drawBg(); drawAxis(); drawRuler(); drawMarks();
  drawRays(); drawLens(); drawHand(); drawObject();
  drawScreen(); drawImageOnScreen(); drawEye(); drawVirtualImage(); drawOffArrow();
  drawTray(); drawGlowFx(); drawEyePeep();
  updatePanel(); if(!st.anim) sayHint();   // I7 解说条随 hint 状态机刷新（动画期间不抢，动画末帧由 tick 调 sayHint）
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
// ===== I7 解说条 hint 状态机：分支逻辑不变，输出端由气泡改橙色居中解说条（#toast）；× 关闭=同分支不再自动重弹 =====
var toastEl=document.getElementById('toast'),toastTxt=document.getElementById('toast-txt'),toastXEl=document.getElementById('toast-x');
var hintSt={key:null,dismissed:null};
function hintBranch(){
  var k=imgKind();
  if(!st.lit) return {key:'litoff',text:'光源已关闭：无光线、无像。点「💡 光源」按钮，或点画布上的 F 光源/蜡烛重新点亮（点蜡烛可点亮/熄灭）。'};
  if(st.hand&&imgKind()==='virtual') return {key:'handv',text:'遮挡透镜一部分，虚像同样仍完整、只是变暗——物上每点的光经未遮挡部分折射、反向延长仍交成完整虚像，只是通光量减少。'};   // J8 遮挡+虚像（与实像结论对称）
  if(st.hand) return {key:'hand',text:'遮挡透镜一部分：屏上的像仍完整、只是变暗——通光量减少。物上每点发出的光经未遮挡部分仍能会聚成完整的像。'};
  if(st.fTip) return {key:'ftip',text:'焦距变小、会聚能力变强、像距变小——透镜乙(f=10cm)应放在透镜甲(f=20cm)的右侧（靠光屏一侧），光屏上才能重新得到清晰的像。屏上像已模糊，重调屏位验证。'};
  if(st.eyeTip) return {key:'eyed3',text:'虚像的位置和大小只由物距和焦距决定，与眼的位置无关；眼挪动变的只是视角（离像近看起来大）。'};   // G15 D3
  if(!st.screenOn &&k==='virtual') return {key:'vsee',text:'从光屏一侧向透镜看去：正立、放大的虚像，与物体同侧、屏上接不到。虚线是折射光线的反向延长线。'};
  if(!st.screenOn) return {key:'nosee',text:'光屏已撤。u＜f 时用眼在屏侧观察虚像；u＞f 时实像成在空中（原屏位附近）。点「装回」恢复。'};
  if(k==='real'&&vImg()>vMaxDyn()) return {key:'vover',text:'像距 v='+vImg().toFixed(1)+' cm 超出光屏行程，屏上是弥散像——真实光台也受台面长度限制，数据见记录表'};
  if(k==='none') return {key:'nof',text:'u=f：折射光线平行射出，不成像——实像与虚像的分界（一倍焦距分虚实）。向两侧再拖一点点看看。'};
  if(k==='virtual'&&st.u>=st.f*0.85) return {key:'vdim',text:'虚像越来越大、也越来越淡：同样的光摊到更大的像面上，面亮度下降；u=f 不成像。'};   // J10 近焦解说
  if(k==='virtual') return {key:'vgo',text:'u＜f，屏上接不到像。此时可以撤去光屏，从光屏一侧向凸透镜方向看去，就能观察到发光物体的虚像。点「撤屏」试试。'};
  if(Math.abs(st.u-2*st.f)<=EPS_CM) return {key:'e2f',text:'u=2f：v=2f，成倒立、等大的实像——大小的分界（二倍焦距分大小）。'};
  if(!isSharp()) return {key:'sharp',text:'屏上像模糊：|v屏−v像|＞0.6cm。拖光屏或点「寻像」找清晰像。当前理论像距 v='+vImg().toFixed(1)+' cm。'};
  if(st.rows.length===0) return {key:'rec1',text:'清晰像到手！点「记录」把 u、v 与像的性质写进记录表；再拖光源跨 u＞2f、f＜u＜2f、u＜f 三区，每区记一笔。「💡 光源」按钮或点画布 F 可关灯/开灯；换蜡烛后点蜡烛可点亮/熄灭。'};
  return {key:'law1',text:'点「规律卡」对照凸透镜成像规律。托盘可换蜡烛作物体——F 形比蜡烛好：像稳定、可判断左右相反、安全环保、高度不变。'};
}
function hideToast(){ if(toastEl) toastEl.classList.remove('show'); }
function sayHint(){   // hint 输出端：解说条持久显示当前分支文案（事件 toast 占用期间不抢）
  if(!toastEl||toastTimer) return;
  var o=hintBranch(); hintSt.key=o.key;
  if(hintSt.dismissed===o.key){ hideToast(); return; }
  if(toastTxt.textContent!==o.text) toastTxt.textContent=o.text;
  if(!toastEl.classList.contains('show')) toastEl.classList.add('show');
  checkToastNarrow();   // J7 立即检测一次
}
function showToast(msg){   // 事件 toast：覆盖解说条 4s，到时回落当前 hint 文案
  if(!toastEl) return;
  if(toastTimer) clearTimeout(toastTimer);
  toastTxt.textContent=msg; toastEl.classList.add('show');
  toastTimer=setTimeout(function(){ toastTimer=null; sayHint(); },4000);
  checkToastNarrow();   // J7 立即检测一次
}
// J7 解说条动态长度：默认 max-width 70% 单行；与器材包围盒相交→加 .narrow（46% 换行 2-3 行），脱离恢复；top 4%（html）
function sceneBBox(){   // 本页器材包围盒：物左缘..max(屏,眼)右缘，y=axisY±max(hoPx*VIS_K, scHPx*0.5)
  var x0=xOfU(st.u)-hoPx()*0.7;   // 物左缘（F 板显示半宽≈0.69*hoPx）
  var x1=xOfV(st.vSc)+scHPx()*0.12;   // 屏右缘（面宽+底座余量）
  if(st.eye&&st.eyeA>0.5){ var e=eyeXY(); x1=Math.max(x1,e.x+e.h*0.6); }
  var hy=Math.max(hoPx()*VIS_K,scHPx()*0.5);
  return {x0:x0,y0:axisY-hy,x1:x1,y1:axisY+hy};
}
var toastChkI=0;
function checkToastNarrow(){
  if(!toastEl||!toastEl.classList.contains('show')) return;
  var tr=toastEl.getBoundingClientRect(),cr=cv.getBoundingClientRect();
  if(!tr.width) return;
  var b=sceneBBox();
  var hit=!(tr.right-cr.left<b.x0||tr.left-cr.left>b.x1||tr.bottom-cr.top<b.y0||tr.top-cr.top>b.y1);
  toastEl.classList.toggle('narrow',hit);
}
if(toastXEl) toastXEl.addEventListener('click',function(){ hintSt.dismissed=hintSt.key; hideToast(); });
// ===== 读数浮层：u/v/m/像性质实时 =====
function natureText(){
  if(!st.lit) return '光源关闭';
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
var TB_US=[4.0,6.0,8.0,10.0,12.0,14.0,16.0,18.0,20.0,22.0,24.0,26.0,28.0];   // 教材数据表 13 行（f=10cm 自洽）
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
  var x=xOfU(st.u),hw=Math.max(24,2.2*S);   // H4 命中区半宽≥24px
  return Math.abs(p.x-x)<hw&&p.y>axisY-hoPx()-16&&p.y<axisY+hoPx()+16;   // G12 裁切后 F 板骑轴：命中区=板高±16
}
function hitScreen(p){
  if(!st.screenOn||st.screenA<=0.5) return false;
  var g=PROPS.screenGeom(xOfV(st.vSc),axisY+scHPx()/2,scHPx());   // 命中走库件几何（照 c5s1）
  return Math.abs(p.x-g.faceX)<Math.max(24,g.fw/2+14)&&p.y>g.pts.TL.y-10&&p.y<g.pts.BR.y+16;   // H4 命中区半宽≥24px
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
    else if(hitEye(p)){ drag={k:'eye'}; if(!st.eyeTipShown){ st.eyeTipShown=true; st.eyeTip=true; } }   // G15 首次拖眼气泡 D3
    else st.eyeTip=false;
  }
  if(drag){ st.touched=true; cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; sayHint(); draw(); }
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
    var v=(p.x-xLens)/S;
    if(imgKind()==='real'){ var vi=vImg(); if(Math.abs(v-vi)<=0.3) v=vi+(v-vi)*0.35; }   // G14 软吸附：|v屏−v像|≤0.3cm 微磁吸不跳变
    st.vSc=clampV(v); st.fTip=false;
    if(isSharp()&&!st.wasSharp){   // G14 边缘触发：上一帧 !isSharp 且本帧 isSharp → 过程音效+光晕+toast
      st.wasSharp=true;
      glowFx.push({x:xOfV(st.vSc),y:axisY,t0:performance.now(),c:'255,214,120'});
      if(window.playMatch) playMatch();
      showToast('清晰像！v屏='+st.vSc.toFixed(1)+' cm');
    }
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
    }else if(!toolbox.pointInCard(startPt)){
      if(st.obj==='candle'){   // K6 点蜡烛=点亮/熄灭蜡烛（换回 F 仅拖回托盘一条路径）
        st.lit=!st.lit; syncLitBtn();
        if(window.playClick) playClick();
        showToast(st.lit?'🕯 蜡烛已点亮：光线恢复、像恢复':'蜡烛已熄灭：无光线、无像——点蜡烛可重新点亮');
      }else{   // G12 画布点 F 光源切换亮/灭
        st.lit=!st.lit; syncLitBtn();
        if(window.playClick) playClick();
        showToast(st.lit?'💡 光源已点亮':'光源已关闭：无光线、无像——点「💡 光源」或点画布 F 重新点亮');
      }
    }
  }else if(drag.k==='sc'){
    if(moved&&window.playDrop) playDrop();   // G14：清晰音效/toast 已移入 pointermove 边缘触发，pointerup 不再响（防双响）
  }
  drag=null; cv.style.cursor=''; sayHint(); draw();
}
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',endDrag);
// ===== 控制条 =====
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
// 焦距滑杆：f 2~12cm 连续 + 10/20cm 吸附点；改 f→清晰位随动、屏像模糊引导重调（焦距变化解说）
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
function onFChange(v){ setF(v); st.fTip=true; st.touched=true; sayHint(); draw(); }
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
    sayHint(); draw();
  });
}
twoState('btn-marks',function(){return st.marks;},function(v){st.marks=v;});
twoState('btn-rays',function(){return st.rays;},function(v){st.rays=v;if(v)flowT0=performance.now();});   // H8 开光路置 flowT0
twoState('btn-hand',function(){return st.hand;},function(v){st.hand=v;if(v) showToast('遮挡透镜一部分：屏上的像仍完整、只是变暗——通光量减少');});
function syncLitBtn(){ var b=document.getElementById('btn-lit'); if(b) b.classList.toggle('on',st.lit); }
twoState('btn-lit',function(){return st.lit;},function(v){st.lit=v;showToast(v?'💡 光源已点亮：光线恢复、像恢复':'光源已关闭：无光线、无像，读数面板显示「光源关闭」');});   // G12 物理两态钮
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
  sayHint(); draw();
});
var bTB=document.getElementById('btn-textbook');
if(bTB) bTB.addEventListener('click',function(){
  st.rows=textbookRows(); renderRec();
  openPanel('rec');
  showToast('已载入参考数据表 13 行（f=10cm）——对照找规律');
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
    showToast(k==='none'?'u=f 不成像：折射光平行射出，屏上无像（实虚分界）':'虚像屏上接不到——点「撤屏」用眼从屏侧看');
    if(window.playClick) playClick(); sayHint(); draw(); return;
  }
  var vT=clampV(vImg());
  st.anim={kind:'auto',t0:performance.now(),from:st.vSc,to:vT};
  if(window.playClick) playClick();
});
function finishAuto(a){
  if(isSharp()){ showToast('寻像到位：清晰像 v='+vImg().toFixed(1)+' cm，'+natureText()); if(window.playMatch) playMatch(); }
  else showToast('理论像距 v='+vImg().toFixed(1)+' cm 超出滑轨，屏已到最右——像成在滑轨外');
  sayHint(); draw();
}
// 撤屏观察 / 装回光屏（两态钮）：屏淡出、observer_eye 飞入屏位、虚像呈现
var bNs=document.getElementById('btn-noscreen');
if(bNs) bNs.addEventListener('click',function(){
  if(st.anim) return;
  st.touched=true;
  if(st.screenOn){
    st.screenOn=false; bNs.textContent='装回'; bNs.classList.add('on');
    st.anim={kind:'out',t0:performance.now()};
    if(imgKind()==='virtual') showToast('实验操作：撤去光屏，从光屏一侧向凸透镜方向看去');
  }else{
    st.screenOn=true; bNs.textContent='撤屏'; bNs.classList.remove('on');
    st.anim={kind:'in',t0:performance.now()};
  }
  if(window.playClick) playClick();
  hintSt.dismissed=null; sayHint();   // I7 撤屏/装回后重新武装解说条
});
// 复位（记录表数据只有 reset 才清）
var bReset=document.getElementById('btn-reset');
if(bReset) bReset.addEventListener('click',function(){
  if(st.anim) return;
  st.u=21; setF(F_DEF_CM); st.vSc=19.1;
  st.obj='F'; st.lit=true;
  st.screenOn=true; st.screenA=1; st.eye=false; st.eyeA=0; st.eyeOff=0; st.eyeX=null;
  st.hand=false; st.handA=0; st.marks=true; st.rays=true;
  st.rows=[]; st.fTip=false; st.touched=false; st.snapI=0; st.eyeTip=false; st.eyeTipShown=false;
  renderRec();
  ['btn-hand'].forEach(function(id){ var b=document.getElementById(id); if(b) b.classList.remove('on'); });
  ['btn-marks','btn-rays'].forEach(function(id){ var b=document.getElementById(id); if(b) b.classList.add('on'); });
  syncLitBtn();
  if(bNs){ bNs.textContent='撤屏'; bNs.classList.remove('on'); }
  openPanel('read');
  st.wasSharp=isSharp();
  hideToast(); hintSt.key=null; hintSt.dismissed=null;
  if(window.playClick) playClick();
  sayHint(); draw();
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
if(btnFull) btnFull.addEventListener('click',function(){if(st.anim)return;if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();if(window.playClick) playClick();});
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(ev){document.addEventListener(ev,function(){syncFull();setTimeout(resize,60);});});
// ===== sprite 重绘钩子（仅注册有 sprite 文件的件；透镜矢量无 sprite） =====
['f_led_panel','candle','candle_unlit','observer_eye'].forEach(function(id){   // K1 f_led_panel 无底座灯箱 sprite；H6 遮挡手掌 sprite 引用清零（板改代码画）
  PROPS.onSprite(id,function(){ draw(); });
});
// ===== 动画 tick：自动寻像滑屏 + 撤屏淡出/眼飞入（两向对称） =====
// J9 淡入淡出 ±0.06/帧→±0.028/帧（≈600ms）：蔡总 18:51「太快效果不明显」；tick fading 条件不变
var HAND_FADE=0.028;
function tick(){
  // F4③加固：主体 try/catch——单帧异常 console.error 留痕、不杀 rAF（探针 b4：修复前一次异常即断链=整页卡死根因）
  try{
  checkSharpEdge();
  if(st.anim){
    var a=st.anim,t=Math.min(1,(performance.now()-a.t0)/ANIM_DUR),e=easeInOut(t);
    if(a.kind==='auto'){
      st.vSc=a.from+(a.to-a.from)*e;
      if(t>=1){ st.anim=null; finishAuto(a); }
    }else if(a.kind==='out'){
      st.screenA=1-e; st.eye=true; st.eyeA=e; st.eyeOff=(W+40-xOfV(st.vSc))*(1-e);
      if(t>=1){ st.anim=null; st.screenA=0; st.eyeA=1; st.eyeOff=0; sayHint(); }
    }else if(a.kind==='in'){
      st.screenA=e; st.eyeA=1-e; st.eyeOff=(W+40-xOfV(st.vSc))*e;
      if(t>=1){ st.anim=null; st.eye=false; st.eyeA=0; st.eyeOff=0; st.screenA=1; st.eyeX=null; sayHint(); }
    }
    draw();
  }else{
    var fading=(st.hand&&st.handA<1)||(!st.hand&&st.handA>0);   // H6 遮光板淡入淡出 ±HAND_FADE/帧（J9 ≈600ms），到 0 才停绘
    if(fading) st.handA=Math.max(0,Math.min(1,st.handA+(st.hand?HAND_FADE:-HAND_FADE)));
    if(glowFx.length||(st.rays&&st.lit)||fading) draw();   // G6 流动虚线需逐帧重绘
  }
  if(++toastChkI>=10){ toastChkI=0; checkToastNarrow(); }   // J7 每 10 帧解说条与器材包围盒相交检测
  }catch(err){ console.error('[c5s3] tick 单帧异常（已捕获，rAF 继续）:',err); }
  requestAnimationFrame(tick);
}
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); if(toolbox){ layout(); draw(); } }).observe(ctrlEl);
}
// F4③加固（探针 a2/a3 根因）：iframe 预加载期 0 尺寸初始化后，壳层 display:none→block 展开不触发 window.resize，
// W/H 无更新路径（旧 RO 只挂 ctrlbar，layout 用旧 W/H）→ 主体按 640×360 兜底坐标绘制=空白/错位。
// RO 挂 canvas 本体：0 尺寸→正常尺寸转换必经 resize()（内部重算 W/H+layout+draw，转换后必重绘）。
if(window.ResizeObserver){
  new ResizeObserver(function(){
    var r=cv.getBoundingClientRect();
    if(r.width>0&&r.height>0&&(Math.abs(r.width-W)>1||Math.abs(r.height-H)>1)) resize();
  }).observe(cv);
}
// ===== 初始化：u=21cm(>2f)、f=10cm、屏在清晰像位 v=19.1cm——进页即见倒立缩小实像 =====
setF(F_DEF_CM);
layout(); resize();
openPanel('read');
st.wasSharp=isSharp();
renderRec(); syncFull();
sayHint(); draw(); requestAnimationFrame(tick);
window.__c5s3dbg={
  get st(){return st;}, get W(){return W;}, get H(){return H;}, get axisY(){return axisY;}, get S(){return S;}, get xLens(){return xLens;},
  vImg:vImg, imgKind:imgKind, mag:mag,
  setU:function(u){ st.u=clampU(u); st.touched=true; st.fTip=false; sayHint(); draw(); },
  setV:function(v){ st.vSc=clampV(v); st.fTip=false; sayHint(); draw(); },
  setF:function(f){ onFChange(f); },
  auto:function(){ document.getElementById('btn-auto').click(); },
  noscreen:function(){ document.getElementById('btn-noscreen').click(); },
  hand:function(){ document.getElementById('btn-hand').click(); },
  record:function(){ document.getElementById('btn-record').click(); },
  textbook:function(){ document.getElementById('btn-textbook').click(); },
  rows:function(){ return st.rows; }
};
})();

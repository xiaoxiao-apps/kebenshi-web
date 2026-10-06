'use strict';
/* c4s2 光的反射 · 渲染层：器材层(PROPS标准件) + 光路2D层(平面正交)；draw() 每次幂等重绘 */
(function(){
var R = window.RFX = {
  angleI: 45*Math.PI/180,          // 唯一角度状态变量；∠r≡∠i（反射角恒等于入射角，无独立反射角变量）
  W:0,H:0, O:{x:0,y:0}, L:200, by:0, mirrorY:0, mirrorLen:0, boardH:0,
  penW:0,penH:0,
  pulse:{active:false,t0:0,dur:1600,reverse:false,loop:false},
  showNormal:true, showArc:true, showRead:true,
  beamMode:'single', rough:0,
  dragFb:false, ripple:{t0:0,x:0,y:0},
  ctx:null
};
// 正面 2.5D 构图：镜面线水平(mirrorY)，法线竖直向上；E 左上 / F 右上，几何全由 angleI 单变量导出
function E(){ var a=R.angleI,L=R.L; return { x:R.O.x-L*Math.sin(a), y:R.O.y-L*Math.cos(a) }; } // 竖直分量向上(-cos)
function F(){ var a=R.angleI,L=R.L; return { x:R.O.x+L*Math.sin(a), y:R.O.y-L*Math.cos(a) }; }
R.E=E; R.F=F;
// 入射方向(dx,dy)对法线(nx,ny)镜像 → 反射方向（反射定律：反射角=入射角）；阶段二粗糙面/光路可逆用
function reflectDir(dx,dy,nx,ny){ var s=2*(dx*nx+dy*ny); return {x:dx-s*nx, y:dy-s*ny}; }
R.reflectDir=reflectDir;
// 笔口(右端)对齐 pt、瞄 O；中心=pt 沿 O→pt 方向回退笔口偏移
R.penPoseAt=function(pt){
  var O=R.O, th=Math.atan2(O.y-pt.y, O.x-pt.x);
  var tx=R.penW*0.4799, ty=-R.penH*0.65;
  var ca=Math.cos(th), sa=Math.sin(th);
  return { x:pt.x-(tx*ca-ty*sa), y:pt.y-(tx*sa+ty*ca), angle:th*180/Math.PI };
};
R.penPose=function(side){ return R.penPoseAt(side==='F'?F():E()); };
R.draw=function(){
  var c=R.ctx; if(!c) return;
  var W=R.W,H=R.H,L=R.L,a=R.angleI;
  var b=PROPS.bench(c,W,H,{tone:'cool'}); R.by=b.benchTopY;
  R.boardH=H*0.52;                                       // 白纸板高≈0.52H
  R.mirrorLen=Math.min(W*0.42,H*0.5);                    // 平放镜面板水平长
  R.penH=Math.min(H*0.075,56); R.penW=R.penH*(324/90);
  // layout 已在 core 中统一计算
  var depth=R.mirrorDepth, O=R.O, e=E(), f=F();
  // 器材层：平面镜先画底座，纸板后画站上底座顶面（折痕下端与 O 重合）
  PROPS.plane_mirror(c,O.x,R.mirrorY,{w:R.mirrorLen, depth:depth, rough:R.rough});
  PROPS.paper_board(c,O.x,R.mirrorY,{h:R.boardH, fold:(R.fold||0)});
  // 光线安全 clip：镜线以下永不画光；折痕左侧为有效光路平面，fold>0 时右侧折离
  c.save(); c.beginPath(); c.rect(0,0,(R.fold>0?R.O.x:W),R.mirrorY+2); c.clip();
  // 法线：过 O 竖直金色虚线向上≈0.58H（高出纸板顶≈0.06H，与折痕区分）；N 标顶端
  if(R.showNormal){
    c.save(); c.strokeStyle='#e0a20a'; c.lineWidth=1.6; c.setLineDash([7,5]);
    c.beginPath(); c.moveTo(O.x,O.y); c.lineTo(O.x,O.y-H*0.58); c.stroke();
    c.setLineDash([]);
    c.fillStyle='#e0a20a'; c.font='13px sans-serif';
    c.fillText('N',O.x+4,O.y-H*0.58+4);
    c.restore();
  }
  // 入射/反射光线：红芯实线+外晕（沿 laser_pen beam 风格），分居法线两侧
  function ray(x1,y1,x2,y2){
    c.strokeStyle='rgba(255,59,48,0.22)'; c.lineWidth=7; c.lineCap='round';
    c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
    c.strokeStyle='#e03131'; c.lineWidth=2.4;
    c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
  }
  function localNormalTilt(seed){ return Math.sin(seed*127.1)*26*Math.PI/180; }
  function clampTilt(tilt){
    var degI=R.angleI*180/Math.PI;
    var maxTilt=Math.max(0,(78-degI)/2)*Math.PI/180;
    return Math.max(-maxTilt,Math.min(maxTilt,tilt));
  }
  function reflectRay(pt,incDir,tilt,len){
    tilt=clampTilt(tilt);
    var n={x:Math.sin(tilt), y:-Math.cos(tilt)};
    var s=2*(incDir.x*n.x+incDir.y*n.y);
    var r={x:incDir.x-s*n.x, y:incDir.y-s*n.y};
    return {x:pt.x+r.x*len, y:pt.y+r.y*len};
  }
  function arrowAt(x1,y1,x2,y2,t){ // t=0..1 位置
    var dx=x2-x1, dy=y2-y1, ang=Math.atan2(dy,dx), L=Math.hypot(dx,dy);
    if(L<2) return;
    var cx=x1+dx*t, cy=y1+dy*t, s=9;
    c.save(); c.translate(cx,cy); c.rotate(ang);
    c.fillStyle='#ff3b30';
    c.beginPath(); c.moveTo(s,0); c.lineTo(-s*0.6,s*0.5); c.lineTo(-s*0.6,-s*0.5); c.closePath(); c.fill();
    c.restore();
  }
  function rayArrow(x1,y1,x2,y2,dir){
    ray(x1,y1,x2,y2);
    if(R.showArrow) arrowAt(x1,y1,x2,y2,0.55);
  }
  function drawSun(){
    var S={x:W*0.13,y:H*0.15}, rs=Math.min(W,H)*0.045;
    R.sunHit={x:S.x,y:S.y,r:rs*1.7};
    PROPS.sun(c,S.x,S.y,{r:rs,rays:12,hover:R.sunHover});
  }
  function drawBeam(){
    if(!R.laserOn) return;
    var incDir={x:Math.sin(a), y:Math.cos(a)}; // E→O 方向（canvas y 向下，cos 为正）
    if(R.beamMode==='single'){
      var tilt=(R.rough>0?clampTilt(localNormalTilt(R.rough)):0);
      var rev=R.pulse.reverse;
      var rf=reflectRay(O,incDir,tilt,R.L);
      var src=(rev?rf:e), dst=(rev?e:rf);
      rayArrow(src.x,src.y,O.x,O.y);
      rayArrow(O.x,O.y,dst.x,dst.y);
    }else{
      var n=5;
      for(var i=0;i<n;i++){
        var x=O.x+(i-2)*R.mirrorLen*0.16;
        var tilt=(R.rough>0?clampTilt(localNormalTilt(i*33.7+R.rough)):0);
        var p0={x:x,y:O.y};
        var p1={x:x-incDir.x*R.L*1.35, y:p0.y-incDir.y*R.L*1.35};
        var p2=reflectRay(p0,incDir,tilt,R.L);
        var src=(R.pulse.reverse?p2:p1), dst=(R.pulse.reverse?p1:p2);
        rayArrow(src.x,src.y,p0.x,p0.y);
        rayArrow(p0.x,p0.y,dst.x,dst.y);
      }
    }
  }
  if(R.beamMode==='beam'){ drawSun(); }
  else{
    R.sunHit=null;
    var penSide=(R.pulse.reverse?'F':'E');
    var penSrc=E();
    if(R.pulse.reverse){ var tlt=(R.rough>0?clampTilt(localNormalTilt(R.rough)):0); penSrc=!(R.fold>0)?reflectRay(O,{x:Math.sin(a),y:Math.cos(a)},tlt,R.L):O; }
    var pen=R.penPoseAt(penSrc); PROPS.laser_pen(c,pen.x,pen.y,{h:R.penH, angle:pen.angle, beam:false});
  }
  drawBeam();
  // ∠i/∠r 青弧：只以主光线（中心）为准；∠r 弧按主法线显示等于∠i
  if(R.laserOn && R.showArc && a>0.02){
    var angE=Math.atan2(e.y-O.y,e.x-O.x), angF=Math.atan2(f.y-O.y,f.x-O.x);
    var ar=Math.min(46,L*0.28);
    var deg=Math.round(R.angleI*180/Math.PI);
    c.strokeStyle='#2aa7d8'; c.fillStyle='#2aa7d8'; c.lineWidth=1.8;
    c.beginPath(); c.arc(O.x,O.y,ar,-Math.PI/2,angE,true); c.stroke();   // ∠i（法线左侧）
    var mi=(angE-Math.PI/2)/2, rr=ar+15;
    c.font='14px sans-serif';
    c.fillText('∠i='+deg+'°',O.x+rr*Math.cos(mi)-8,O.y+rr*Math.sin(mi)+4);
    if(!(R.fold>0)){
      c.beginPath(); c.arc(O.x,O.y,ar,-Math.PI/2,angF,false); c.stroke(); // ∠r（法线右侧）
      var mr=(angF-Math.PI/2)/2;
      c.fillText('∠r='+deg+'°',O.x+rr*Math.cos(mr)-8,O.y+rr*Math.sin(mr)+4);
    }
  }
  // 播放脉冲光点：中心条 E→O→F 或反向 F→O→E，loop 时循环（必须画在 clip 内）
  if(R.laserOn && R.pulse.active){
    var raw=(performance.now()-R.pulse.t0)/R.pulse.dur;
    var t=R.pulse.loop?raw%1:Math.min(1,raw);
    if(!R.pulse.loop && raw>=1){t=1;R.pulse.active=false;}
    var rev=R.pulse.reverse;
    if(R.beamMode==='beam'){
      var n=5;
      for(var i=0;i<n;i++){
        var x=O.x+(i-2)*R.mirrorLen*0.16;
        var p0={x:x,y:O.y};
        var p1={x:x-incDir.x*R.L*1.35, y:p0.y-incDir.y*R.L*1.35};
        var p2=reflectRay(p0,{x:Math.sin(a),y:Math.cos(a)},(R.rough>0?clampTilt(localNormalTilt(i*33.7+R.rough)):0),R.L);
        var src=(rev?p2:p1), dst=(rev?p1:p2);
        var tb=t<0.5?t*2:(t-0.5)*2;
        var p;
        if(t<0.5){ p={x:src.x+(p0.x-src.x)*tb, y:src.y+(p0.y-src.y)*tb}; }
        else{ p={x:p0.x+(dst.x-p0.x)*tb, y:p0.y+(dst.y-p0.y)*tb}; }
        c.fillStyle='rgba(224,162,10,0.32)'; c.beginPath(); c.arc(p.x,p.y,10,0,7); c.fill();
        c.fillStyle='#e0a20a'; c.beginPath(); c.arc(p.x,p.y,4.5,0,7); c.fill();
      }
    }else{
      var rf=reflectRay(O,{x:Math.sin(a),y:Math.cos(a)},(R.rough>0?clampTilt(localNormalTilt(R.rough)):0),R.L);
      if(!rev){ if(t<0.5){var k2=t*2; p={x:e.x+(O.x-e.x)*k2,y:e.y+(O.y-e.y)*k2};} else{var k3=(t-0.5)*2; p={x:O.x+(rf.x-O.x)*k3,y:O.y+(rf.y-O.y)*k3};} }
      else{ if(t<0.5){var k2=t*2; p={x:rf.x+(O.x-rf.x)*k2,y:rf.y+(O.y-rf.y)*k2};} else{var k3=(t-0.5)*2; p={x:O.x+(e.x-O.x)*k3,y:O.y+(e.y-O.y)*k3};} }
      c.fillStyle='rgba(224,162,10,0.32)'; c.beginPath(); c.arc(p.x,p.y,10,0,7); c.fill();
      c.fillStyle='#e0a20a'; c.beginPath(); c.arc(p.x,p.y,4.5,0,7); c.fill();
    }
  }
  c.restore();   // 光线 clip 段收尾（save/restore 配对，防 clip 跨帧残留裁掉镜前面/O 标签）
  // 入射点 O + 标签
  c.fillStyle='#1f2937'; c.beginPath(); c.arc(O.x,O.y,4,0,7); c.fill();
  c.fillStyle='#111827'; c.font='13px sans-serif';
  c.fillText('O',O.x+7,O.y+14);
  if(R.beamMode!=='beam'){
    c.fillText('E',e.x-6,e.y+16);
    var rfF=reflectRay(O,{x:Math.sin(a),y:Math.cos(a)},(R.rough>0?clampTilt(localNormalTilt(R.rough)):0),R.L);
    c.fillText('F',rfF.x+2,rfF.y-8);
  }
  // 拖拽反馈：激光笔 2px 描边
  if(R.dragFb){
    c.strokeStyle='#e0a20a'; c.lineWidth=2;
    c.beginPath(); c.arc(e.x,e.y,9,0,7); c.stroke();
  }
  // 点击波纹 300ms 渐隐
  if(R.ripple.t0){
    var k=1-(performance.now()-R.ripple.t0)/300;
    if(k<=0){R.ripple.t0=0;}
    else{c.strokeStyle='rgba(37,99,235,'+(0.5*k).toFixed(2)+')'; c.lineWidth=2;
      c.beginPath(); c.arc(R.ripple.x,R.ripple.y,20*(1-k)+6,0,7); c.stroke();}
  }
};
})();
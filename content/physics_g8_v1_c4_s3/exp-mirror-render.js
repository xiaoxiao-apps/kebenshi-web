'use strict';
/* c4s3 平面镜成像 · 渲染层（M1 成像探究台；布局常量全部由 core.layout() 写入 MRR，本层只读，禁双处硬编码） */
(function(){
var R=window.MRR={W:0,H:0,by:0,fy:0,ctx:null,mirrorX:0,k:20,
  doCm:8,eqDo:14,objX:0,eqX:0,objLit:false,matched:false,showAux:false,eqOn:false,eqState:'off',eqTray:null,eqScale:0,eqHeldX:0,eqHeldY:0,
  candleH:150,glassH:250,glassY:0,candleY:0,
  hoverObj:false,hoverEq:false,eqLift:false,
  /* M2 虚像原理 */
  m2:{mirrorX:0,mirrorY:0,mirrorH:0,candle:{x:0,y:0,h:0},S:{x:0,y:0},Sp:{x:0,y:0},screen:{x:0,y:0,h:0,state:'tray',heldX:0,heldY:0},
    eye:{x:0,y:0,rx:18,ry:12,inBeam:false,dragEye:false,state:'tray',heldX:0,heldY:0},
    trayState:'tray',tray:null,heldItem:null,eyeAlpha:0.45,imgAlpha:0.45,
    showRay:false,showExt:false,showNormal:false,showSym:false,screenAtSp:false,animT:0,dragS:false,dragScreen:false,rayT0:0,flowT:0,wedgePoly:[]},
  m3:{angle:45,showPath:false,top:null,bottom:null,tray:null,inEye:false,flowT:0,rayT0:0,animT:0,pathT0:0,tube:null,topSlot:null,bottomSlot:null,eyePos:{x:0,y:0},objPos:{x:0,y:0},mirrorW:70,path:null,bgCv:null},
  ripple:{t0:0,x:0,y:0},lightFx:null,imgAlpha:0.4};
function flameGlow(c,x,y,a){
  var g=c.createRadialGradient(x,y,2,x,y,30);
  g.addColorStop(0,'rgba(255,190,80,'+a.toFixed(2)+')');g.addColorStop(1,'rgba(255,190,80,0)');
  c.fillStyle=g;c.beginPath();c.arc(x,y,30,0,7);c.fill();
}
/* 桌面刻度尺：以玻璃板面为 0 位，cm 刻度，5cm 长齿带数字；max 动态 */
function drawRuler(c){
  var y=R.by+57,k=R.k,mx=R.mirrorX;
  var maxL=Math.max(5,Math.floor((R.mirrorX-16)/k)),maxR=Math.max(5,Math.floor((R.W-R.mirrorX-16)/k));
  var labelStep=(k<16)?5:((k<30)?2:5);
  c.save();
  c.strokeStyle='rgba(90,60,20,0.6)';c.fillStyle='rgba(90,60,20,0.72)';c.lineWidth=1;
  c.beginPath();c.moveTo(Math.max(2,mx-maxL*k),y);c.lineTo(Math.min(R.W-2,mx+maxR*k),y);c.stroke();
  c.font='9px sans-serif';c.textAlign='center';
  for(var i=-maxL;i<=maxR;i++){
    var x=mx+i*k;if(x<3||x>R.W-3)continue;
    var big=(i%5===0);
    c.beginPath();c.moveTo(x,y);c.lineTo(x,y-(big?9:5));c.stroke();
    if(i%labelStep===0)c.fillText(i===0?'0':String(Math.abs(i)),x,y+11);/* 热修：标签统一按 labelStep 等距（原 big每5+else每2混排→数值间距不均匀，蔡总 R9 点名） */
  }
  c.fillText('cm',Math.min(R.W-12,mx+maxR*k+14),y+11);
  c.restore();
}
function distToRay(px,py,ox,oy,dx,dy){
  var t=(px-ox)*dx+(py-oy)*dy;
  if(t<0)return 1e9;
  var cx=ox+dx*t,cy=oy+dy*t;
  return Math.hypot(px-cx,py-cy);
}
function drawM2(c){
  var W=R.W,H=R.H,m=R.m2;
  var mx=m.mirrorX,my=m.mirrorY,mh=m.mirrorH;
  c.fillStyle='#fcfaf2';c.fillRect(0,0,W,H);
  c.save();c.strokeStyle='#1f2937';c.lineWidth=2;
  c.beginPath();c.moveTo(mx,my-mh/2);c.lineTo(mx,my+mh/2);c.stroke();
  c.strokeStyle='#94a3b8';c.lineWidth=1;
  for(var yy=my-mh/2+8;yy<my+mh/2;yy+=12){c.beginPath();c.moveTo(mx+1,yy);c.lineTo(mx+7,yy-6);c.stroke();}
  c.fillStyle='#334155';c.font='bold 13px sans-serif';c.textAlign='right';
  c.fillText('平面镜',mx-8,my-mh/2-8);c.restore();
  /* 物蜡烛（镜前）+ 虚像蜡烛（镜后，翻转半透明，眼睛在光束内变亮） */
  PROPS.candle(c,m.candle.x,m.candle.y,{h:m.candle.h,lit:true});
  var targetAlpha=m.eye.inBeam?0.85:0.45;
  m.imgAlpha+=(targetAlpha-m.imgAlpha)*0.12;
  c.save();c.globalAlpha=m.imgAlpha;
  PROPS.candle(c,m.Sp.x,m.candle.y,{h:m.candle.h,lit:true,dir:'left'});/* 热修：Sp.x 已是对称点，原式 Sp.x+(Sp.x-candle.x) 双倍距离把虚像蜡烛画出屏幕外 */
  c.restore();
  if(m.eye.inBeam){c.save();c.strokeStyle='rgba(255,190,80,0.35)';c.lineWidth=3;c.beginPath();c.ellipse(m.Sp.x,m.candle.y-m.candle.h*0.5,m.candle.h*0.4,m.candle.h*0.55,0,0,7);c.stroke();c.restore();}
  /* S/S′ 火焰点 + 虚像标注 */
  c.save();c.fillStyle='#ff3b30';c.beginPath();c.arc(m.S.x,m.S.y,4,0,7);c.fill();
  c.fillStyle='#1f2937';c.textAlign='right';c.font='bold 14px sans-serif';c.fillText('S',m.S.x-8,m.S.y+5);
  c.fillStyle='#2563eb';c.beginPath();c.arc(m.Sp.x,m.Sp.y,4,0,7);c.fill();
  c.textAlign='left';c.fillText('S′',m.Sp.x+10,m.Sp.y+5);
  c.fillStyle='#64748b';c.font='12px sans-serif';c.textAlign='center';
  c.fillText('虚像',m.Sp.x,m.Sp.y-16);c.restore();
  /* M2 托盘 */
  if(m.tray){
    m.tray.drawCard(c);
  }
  if(m.tray&&m.screen.state==='tray'){
    var s0=m.tray.slots[0];
    PROPS.screen(c,s0.x,s0.y,{h:s0.h});
  }
  if(m.tray&&m.eye.state==='tray'){
    var s1=m.tray.slots[1];
    PROPS.observer_eye(c,s1.x,s1.y,{h:40,dir:'left'});
  }

  /* 5 条扇形光线 */
  var nRays=5,flow=m.flowT,eye=m.eye;
  var ys=[];for(var i=0;i<nRays;i++)ys.push(my-mh*0.45+i*(mh*0.9/(nRays-1)));
  var rSegs=[],ipPts=[];
  if(m.screen.state==='held'||m.screen.state==='placed')PROPS.screen(c,m.screen.state==='held'?m.screen.heldX:m.screen.x,m.screen.state==='held'?m.screen.heldY:m.screen.y,{h:m.screen.h});
  ys.forEach(function(iy,ri){
    var sx=m.S.x,sy=m.S.y;
    var dx=mx-sx,dy=iy-sy,len=Math.hypot(dx,dy);
    if(len<1)return;
    var rDir={x:-dx/len,y:dy/len};
    var ex=mx+rDir.x*Math.min(W,H)*0.45,ey=iy+rDir.y*Math.min(W,H)*0.45;
    rSegs.push({ix:ri,x:mx,y:iy,ex:ex,ey:ey,rDir:rDir});
    ipPts.push({x:mx,y:iy});
    var hitEye=m.showRay&&eye.inBeam&&distToRay(eye.x,eye.y,mx,iy,rDir.x,rDir.y)<=12;
    var t=m.showRay?Math.min(2,Math.max(0,m.animT)):0;
    function ray(x1,y1,x2,y2,w,color,extraW){
      c.save();c.shadowBlur=6;c.shadowColor=color;
      c.strokeStyle='rgba(255,59,48,0.25)';c.lineWidth=(w+3)+(extraW||0);c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
      c.shadowBlur=0;c.strokeStyle=color;c.lineWidth=w+(extraW||0);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.restore();
    }
    if(m.showNormal){
      c.save();c.setLineDash([5,4]);c.strokeStyle='#64748b';c.lineWidth=1.2;
      c.beginPath();c.moveTo(mx,iy-40);c.lineTo(mx,iy+40);c.stroke();c.restore();
    }
    if(t>0){
      var ti=Math.min(1,t);
      ray(sx+(mx-sx)*ti,sy+(iy-sy)*ti,sx,sy,2,'#ff3b30',hitEye?1.5:0);
      if(t>1){var tr=t-1;ray(mx,iy,mx+(ex-mx)*tr,iy+(ey-iy)*tr,2,'#ff3b30',hitEye?1.5:0);}
    }
    if(m.showExt&&t>=2){
      c.save();c.setLineDash([6,5]);c.strokeStyle='#2563eb';c.lineWidth=hitEye?2.6:1.8;
      c.beginPath();c.moveTo(mx,iy);c.lineTo(m.Sp.x,m.Sp.y);c.stroke();c.restore();
    }
    /* 流动光粒子（沿入射→反射路径） */
    if((m.showRay||m.showExt)&&t>=2){
      var total=len+Math.hypot(ex-mx,ey-iy);
      for(var kk=0;kk<3;kk++){
        var phase=((flow/1200)+(kk/3))%1;
        var d=phase*total;
        var px,py;
        if(d<len){var r=d/len;px=sx+dx*r;py=sy+dy*r;}
        else{var r=(d-len)/(total-len||1);px=mx+(ex-mx)*r;py=iy+(ey-iy)*r;}
        c.save();c.fillStyle='rgba(255,240,180,0.9)';c.shadowBlur=8;c.shadowColor='#ff3b30';
        c.beginPath();c.arc(px,py,3.5,0,7);c.fill();c.restore();
      }
    }
  });
  /* 可见区楔形淡色填充（仅上下边缘反射光线围成，远端渐变淡出） */
  m.wedgePoly=[];
  if(m.showRay&&rSegs.length>=2){
    var top=rSegs[0],bot=rSegs[rSegs.length-1];
    var far=Math.max(W,H)*0.55;
    var eTop={x:top.x+top.rDir.x*far,y:top.y+top.rDir.y*far};
    var eBot={x:bot.x+bot.rDir.x*far,y:bot.y+bot.rDir.y*far};
    m.wedgePoly=[{x:top.x,y:top.y},{x:eTop.x,y:eTop.y},{x:eBot.x,y:eBot.y},{x:bot.x,y:bot.y}];
    var axEnd=(eTop.x+eBot.x)/2;
    var g=c.createLinearGradient(mx,my,axEnd,my);
    g.addColorStop(0,'rgba(255,190,80,0.10)');g.addColorStop(1,'rgba(255,190,80,0)');
    c.save();c.fillStyle=g;c.beginPath();
    c.moveTo(top.x,top.y);c.lineTo(eTop.x,eTop.y);
    c.lineTo(eBot.x,eBot.y);c.lineTo(bot.x,bot.y);c.closePath();
    c.fill();c.restore();
  }
  /* S′ 脉冲光环 */
  if(m.showExt){
    var rr=8+Math.sin(flow/400)*3;
    c.save();c.strokeStyle='rgba(37,99,235,0.5)';c.lineWidth=2;
    c.beginPath();c.arc(m.Sp.x,m.Sp.y,rr,0,7);c.stroke();c.restore();
  }
  /* 对称标注：S—S′ 连线 + 镜面垂直标记 + 等距箭头 + 距离读数 */
  if(m.showSym){
    var sx=m.S.x,sy=m.S.y,ix=m.Sp.x,iy=m.Sp.y,mx2=m.mirrorX;
    c.save();c.strokeStyle='#2563eb';c.lineWidth=1.6;c.setLineDash([6,5]);
    c.beginPath();c.moveTo(sx,sy);c.lineTo(ix,iy);c.stroke();c.restore();
    c.save();c.strokeStyle='#2563eb';c.lineWidth=1.6;
    c.beginPath();c.moveTo(mx2+9,sy);c.lineTo(mx2+9,sy-9);c.lineTo(mx2,sy-9);c.stroke();c.restore();
    var dist=Math.abs(sx-mx2)/R.k;
    function arrow(x1,y1,x2,y2){
      c.save();c.strokeStyle='#2563eb';c.lineWidth=1.4;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
      var a=Math.atan2(y2-y1,x2-x1);c.translate(x2,y2);c.rotate(a);c.beginPath();c.moveTo(-5,-3);c.lineTo(0,0);c.lineTo(-5,3);c.stroke();c.restore();
    }
    c.save();c.fillStyle='#2563eb';c.font='bold 12px sans-serif';c.textAlign='center';
    arrow(sx,sy-24,mx2-6,sy-24);arrow(ix,sy-24,mx2+6,sy-24);/* 热修：右侧箭头改为从 S′指向镜面（原从镜面指向 S′），与左侧同向都指镜面=等距标注惯例，蔡总 R16 点名 */
    c.fillText(dist.toFixed(1)+' cm',(sx+mx2)/2,sy-30);c.fillText(dist.toFixed(1)+' cm',(ix+mx2)/2,sy-30);
    c.restore();
  }

  /* 观察眼 sprite（瞳孔朝向镜面） */
  if(m.eye.state==='held'){
    var edir=m.eye.heldX<m.mirrorX?'right':'left';
    PROPS.observer_eye(c,m.eye.heldX,m.eye.heldY,{h:56,dir:edir});
  }else if(m.eye.state==='placed'){
    var edir=m.eye.x<m.mirrorX?'right':'left';
    if(m.eye.inBeam){
      c.save();c.strokeStyle='rgba(255,190,80,0.55)';c.lineWidth=3;
      c.beginPath();c.ellipse(m.eye.x,m.eye.y,38,30,0,0,7);c.stroke();c.restore();
    }
    PROPS.observer_eye(c,m.eye.x,m.eye.y,{h:56,dir:edir});
  }
}
function rayM3(c,p1,p2,flow,idx,cap){ /* R23 cap=弧长上限，undefined=整段现状 */
  var dx=p2.x-p1.x,dy=p2.y-p1.y,len=Math.hypot(dx,dy)||1;
  var ux=dx/len,uy=dy/len;
  var t=R.m3.animT||0;
  var frac=(cap===undefined)?Math.min(1,t/2):Math.min(len,cap)/len;
  c.save();c.shadowBlur=6;c.shadowColor='#ff3b30';
  c.strokeStyle='rgba(255,59,48,0.25)';c.lineWidth=5;c.lineCap='round';
  c.beginPath();c.moveTo(p1.x,p1.y);c.lineTo(p1.x+dx*frac,p1.y+dy*frac);c.stroke();
  c.strokeStyle='#ff3b30';c.lineWidth=2.5;
  c.beginPath();c.moveTo(p1.x,p1.y);c.lineTo(p1.x+dx*frac,p1.y+dy*frac);c.stroke();
  c.restore();
  if(t>=1.5&&flow){
    for(var k=0;k<3;k++){
      var phase=((flow/900)+(idx+k)/3)%1;
      var d=phase*len;
      if(cap!==undefined&&d>cap)continue; /* R23 粒子只保留弧长<cap */
      var px=p1.x+ux*d,py=p1.y+uy*d;
      c.save();c.fillStyle='rgba(255,240,180,0.9)';c.shadowBlur=8;c.shadowColor='#ff3b30';
      c.beginPath();c.arc(px,py,3.5,0,7);c.fill();c.restore();
    }
  }
}
function buildM3Background(){
  var m=R.m3,t=m.tube,W=R.W,H=R.H;
  if(!m.bgCv){m.bgCv=document.createElement('canvas');m.bgCv.width=W;m.bgCv.height=H;}
  var b=m.bgCv.getContext('2d');
  // 1 天空
  var sk=b.createLinearGradient(0,0,0,t.y_w);sk.addColorStop(0,'#dbeafe');sk.addColorStop(1,'#eff6ff');b.fillStyle=sk;b.fillRect(0,0,W,t.y_w);
  // 2 海水
  var sea=b.createLinearGradient(0,t.y_w,0,H);sea.addColorStop(0,'#7dd3fc');sea.addColorStop(1,'#1e6091');b.fillStyle=sea;b.fillRect(0,t.y_w,W,H-t.y_w);
  // 3 潜艇艇体 sprite
  PROPS.submarine_hull(b,(t.x_hl+t.x_hr)/2,(t.y_hull+t.y_hb)/2,{w:t.hullW});
  // 4 潜望镜管外壁/内腔
  var x_l=t.x_l,x_r=t.x_r,x_e=t.x_e,y1=t.y1,y2=t.y2,w=t.w,wall=t.wall;
  b.save();b.strokeStyle='#94a3b8';b.lineWidth=wall+8;b.lineJoin='round';b.lineCap='butt';
  b.beginPath();b.moveTo(x_l,y1);b.lineTo(x_r,y1);b.lineTo(x_r,y2);b.lineTo(x_e,y2);b.stroke();b.restore();
  b.save();b.strokeStyle='#e2e8f0';b.lineWidth=w;b.lineJoin='round';b.lineCap='butt';
  b.beginPath();b.moveTo(x_l,y1);b.lineTo(x_r,y1);b.lineTo(x_r,y2);b.lineTo(x_e,y2);b.stroke();b.restore(); /* R24 蔡总：管口改平口敞开（原 round cap 圆头+悬浮矩形窗突兀），光线从敞口进 */
  // 5 指挥塔
  var towerTop=t.y_hull-34,tw=t.towerW;
  b.save();b.fillStyle='#f8fafc';b.strokeStyle='#334155';b.lineWidth=3;b.lineJoin='round';
  var tx_l=x_r-tw/2,tx_r=x_r+tw/2;
  b.beginPath();b.moveTo(tx_l+12,t.y_hull);b.lineTo(tx_l,towerTop);b.lineTo(tx_r,towerTop);b.lineTo(tx_r-12,t.y_hull);b.closePath();b.fill();b.stroke();
  b.strokeStyle='#94a3b8';b.lineWidth=1.5;b.beginPath();b.moveTo(tx_l+18,t.y_hull);b.lineTo(tx_l+6,towerTop);b.moveTo(tx_r-18,t.y_hull);b.lineTo(tx_r-6,towerTop);b.stroke();b.restore();
  // 6 法兰 junction（管-塔顶、管-水面）
  b.save();b.strokeStyle='#334155';b.lineWidth=3;b.lineCap='round';
  [{y:towerTop},{y:t.y_w}].forEach(function(j){
    b.beginPath();b.moveTo(x_r-(w/2+7),j.y);b.lineTo(x_r+(w/2+7),j.y);b.stroke();
  });b.restore();
}
function drawWave(c,y,t,amp,wlen,phase,lw,col){
  c.save();c.strokeStyle=col;c.lineWidth=lw;c.lineCap='round';
  c.beginPath();
  for(var x=0;x<=R.W;x+=8){var yy=y+Math.sin((x+phase)/wlen+t)*amp;c.lineTo(x,yy);}
  c.stroke();c.restore();
}
function drawBoat(c,x,y,scale,mastH){
  var s=scale||1;
  c.save();c.translate(x,y);c.scale(s,s);
  c.fillStyle='#1e3a5f';c.strokeStyle='#1e3a5f';c.lineWidth=2;c.lineJoin='round';
  c.beginPath();c.moveTo(-22,0);c.lineTo(22,0);c.lineTo(18,-10);c.lineTo(-18,-10);c.closePath();c.fill();c.stroke();
  var mh=mastH||(y-R.m3.tube.y1); /* 热修：桅高改显式参数（inset 局部坐标下旧式 y-tube.y1 为负→帆画到水面下，蔡总目视链 R21 复验抓到）；主场景不传=原行为 */
  c.strokeStyle='#1e3a5f';c.lineWidth=2;c.beginPath();c.moveTo(0,-10);c.lineTo(0,-mh);c.stroke();
  c.fillStyle='#e2e8f0';c.strokeStyle='#1e3a5f';c.lineWidth=1.5;
  var sailTop=-mh+4,sailBot=-mh+22;
  c.beginPath();c.moveTo(2,sailTop);c.lineTo(14,sailTop+10);c.lineTo(2,sailBot);c.closePath();c.fill();c.stroke();
  c.restore();
}
function drawM3(c){
  var W=R.W,H=R.H,m=R.m3,t=m.tube;
  c.fillStyle='#fcfaf2';c.fillRect(0,0,W,H);
  if(!t)return;
  if(!m.bgCv||m.bgCv.width!==W||m.bgCv.height!==H)buildM3Background();
  if(m.bgCv)c.drawImage(m.bgCv,0,0);
  var x_l=t.x_l,x_r=t.x_r,x_e=t.x_e,y1=t.y1,y2=t.y2,w=t.w;
  // 波浪
  var f=m.flowT||0;
  drawWave(c,t.y_w,f/900,4,90,0,2,'#ffffff');
  drawWave(c,t.y_w+2,f/1400,6,140,40,2.5,'#38bdf8');
  // 小船
  drawBoat(c,m.objPos.x,m.objPos.y,1);
  c.save();c.fillStyle='#1e3a5f';c.font='bold 12px sans-serif';c.textAlign='right';
  c.fillText('水面船只',m.objPos.x-26,m.objPos.y-12);c.restore();
  // 卡槽虚线
  c.save();c.strokeStyle='#cbd5e1';c.lineWidth=1.5;c.setLineDash([5,4]);
  [m.topSlot,m.bottomSlot].forEach(function(s){c.beginPath();c.arc(s.x,s.y,s.r,0,7);c.stroke();});
  c.restore();
  // 托盘
  if(m.tray)m.tray.drawCard(c);
  if(m.tray){
    m.tray.slots.forEach(function(s,i){if((i===0&&m.top.state==='tray')||(i===1&&m.bottom.state==='tray'))PROPS.mirror_plate(c,s.x,s.y+12,{len:44});}); /* R22 薄镜片缩略图：水平不旋转 */
  }
  // 镜子
  var theta=m.angle*Math.PI/180;
  function drawMirrorAt(x,y,isTop){c.save();c.translate(x,y);c.rotate(isTop?theta+Math.PI:theta);PROPS.mirror_plate(c,0,0,{len:m.mirrorW*1.3});c.restore();} /* R23 蔡总：上镜镜面背面反了→上镜 +π 翻转（斜纹背面朝右上、镜面朝左下受光）；R22 薄镜片三态共用 */
  function mirrorPos(mr,slot){return (mr.state==='held'&&Math.hypot(mr.heldX-slot.x,mr.heldY-slot.y)>slot.r)?{x:mr.heldX,y:mr.heldY}:{x:slot.x,y:slot.y};}
  if(m.top.state==='slot')drawMirrorAt(m.topSlot.x,m.topSlot.y,true);
  else if(m.top.state==='held')drawMirrorAt(mirrorPos(m.top,m.topSlot).x,mirrorPos(m.top,m.topSlot).y,true);
  else if(m.top.state==='placed')drawMirrorAt(m.top.x,m.top.y,true);
  if(m.bottom.state==='slot')drawMirrorAt(m.bottomSlot.x,m.bottomSlot.y,false);
  else if(m.bottom.state==='held')drawMirrorAt(mirrorPos(m.bottom,m.bottomSlot).x,mirrorPos(m.bottom,m.bottomSlot).y,false);
  else if(m.bottom.state==='placed')drawMirrorAt(m.bottom.x,m.bottom.y,false);
  // 光路（R23 顺序传递：水面船只→镜筒→眼睛，约2.2秒走完）
  if(m.showPath&&m.path){
    var ff=m.flowT;
    var segs=m.path.wall?[[m.path.p0,m.path.i1],[m.path.i1,m.path.wall]]:[[m.path.p0,m.path.i1],[m.path.i1,m.path.i2],[m.path.i2,{x:m.path.ex,y:m.eyePos.y}]];
    var lens=segs.map(function(s){return Math.hypot(s[1].x-s[0].x,s[1].y-s[0].y)||0;});
    var L=lens.reduce(function(a,b){return a+b;},0);
    var now=performance.now();
    if(!m.pathT0)m.pathT0=now;
    var prog=Math.min(1,(now-m.pathT0)/2200);
    var drawn=prog*L,sofar=0;
    for(var si=0;si<segs.length;si++){
      var capI=Math.max(0,Math.min(lens[si],drawn-sofar));
      if(capI<=0)continue;
      rayM3(c,segs[si][0],segs[si][1],ff,si,prog>=1?undefined:capI);
      sofar+=lens[si];
    }
    if(m.path.wall&&prog>=1){ /* 爆点闪光等光传到管壁才出 */
      c.save();c.fillStyle='#f97316';c.shadowBlur=10;c.shadowColor='#f97316';
      c.beginPath();c.arc(m.path.wall.x,m.path.wall.y,4,0,7);c.fill();
      for(var a=0;a<6;a++){var ang=a*Math.PI/3;c.beginPath();c.moveTo(m.path.wall.x+Math.cos(ang)*6,m.path.wall.y+Math.sin(ang)*6);c.lineTo(m.path.wall.x+Math.cos(ang)*14,m.path.wall.y+Math.sin(ang)*14);c.strokeStyle='#f97316';c.lineWidth=2;c.stroke();}
      c.restore();
    }
  }
  // 眼睛
  PROPS.observer_eye(c,m.eyePos.x,m.eyePos.y,{h:48,dir:'left'});
  // 画中画 inset（inEye 时）
  if(m.inEye){
    var ix=W-252,iy=36,iw=216,ih=104,waterY=iy+66;
    c.save();c.fillStyle='rgba(255,255,255,0.88)';c.strokeStyle='#334155';c.lineWidth=1.5;
    c.beginPath();c.roundRect(ix,iy,iw,ih,8);c.fill();c.stroke();c.restore();
    c.save();c.strokeStyle='#38bdf8';c.lineWidth=1.5;c.beginPath();c.moveTo(ix+8,waterY);c.lineTo(ix+iw-8,waterY);c.stroke();c.restore();
    var bx=ix+iw/2,by=waterY+2;
    drawBoat(c,bx,by,0.7,40);/* 热修：inset 传显式桅高 40（与主场景桅高一致） */
    c.save();c.fillStyle='#334155';c.font='bold 11px sans-serif';c.textAlign='center';
    c.fillText('潜望镜里看到的',ix+iw/2,iy+14);
    c.font='bold 12px sans-serif';c.textAlign='right';
    c.fillText('正立的像',bx-20,by-14);c.restore();
  }
}
R.draw=function(){
  var c=R.ctx,W=R.W,H=R.H;if(!c||!W)return;
  if(R.mode==='m2'){drawM2(c);return;}
  if(R.mode==='m3'){drawM3(c);return;}
  c.clearRect(0,0,W,H);
  c.fillStyle='#f0ecc6';c.fillRect(0,0,W,R.fy);        /* 纯色背景墙（蔡总 2026-10-10 拍板：本实验弃透视房间，墙色沿用库调色板） */
  c.fillStyle='#9aa0a6';c.fillRect(0,R.fy,W,H-R.fy);   /* 灰地面带 */
  PROPS.wood_desk(c,W,H,{by:R.by,fy:R.fy,x0:0,x1:W});
  var imgX=R.mirrorX+R.doCm*R.k;          /* 虚像=物关于板面严格镜像：像距=物距 */
  var fY=R.candleY-R.candleH*0.88;        /* 火焰近似高度 */
  /* 刻度尺：在底部 matched 分支绘制 */
  /* 虚像：点燃才出现完整蜡烛像（含火焰）；重合时 alpha→1 形成“拼成一支”效果 */
  if(R.objLit){
    var target=(R.matched)?1.0:0.4;
    R.imgAlpha+=(target-R.imgAlpha)*0.15;
    c.save();c.globalAlpha=R.imgAlpha;
    PROPS.candle(c,imgX,R.candleY,{h:R.candleH,lit:R.objLit});
    c.restore();
    flameGlow(c,imgX,fY,0.18);
    c.font='bold 13px sans-serif';c.textAlign='center';
    c.fillStyle='rgba(100,116,139,0.95)';
    c.fillText('虚像',imgX,R.candleY-R.candleH-10);
  }
  /* 刻度尺仅在重合瞬间出现 */
  if(R.matched)drawRuler(c);
  /* 托盘卡片常显；缩略图只在 tray 态画，避免与收回动画重叠 */
  if(R.eqState!=='off'&&R.eqTray){
    R.eqTray.drawCard(c);
    c.font='bold 12px sans-serif';c.textAlign='center';c.fillStyle='#475569';
    var tc=R.eqTray.card;c.fillText('等效蜡烛',tc.x+tc.w/2,tc.y+tc.h-8);
  }
  if(R.eqState==='tray'&&R.eqTray){
    var slot=R.eqTray.slots[0];
    PROPS.candle(c,slot.x,slot.y+slot.h/2,{h:slot.h,lit:false});
  }
  /* held/stowing/falling：绘制指针处放大中的等效蜡烛 */
  if(R.eqState==='held'||R.eqState==='stowing'||R.eqState==='falling'){
    var hHeld=R.candleH*R.eqScale;
    if(hHeld>2)PROPS.candle(c,R.eqHeldX,R.eqHeldY,{h:hHeld,lit:false});
  }
  /* 等效蜡烛（板后未点燃）：从托盘拖出落地后才绘制 */
  if(R.eqState==='placed'){
    if(R.matched){
      var gm=c.createRadialGradient(R.eqX,R.candleY-R.candleH*0.5,4,R.eqX,R.candleY-R.candleH*0.5,R.candleH*0.7);
      gm.addColorStop(0,'rgba(34,197,94,0.35)');gm.addColorStop(1,'rgba(34,197,94,0)');
      c.fillStyle=gm;c.beginPath();c.arc(R.eqX,R.candleY-R.candleH*0.5,R.candleH*0.7,0,7);c.fill();
    }
    PROPS.candle(c,R.eqX,R.candleY,{h:R.candleH,lit:false});
  }
  /* 玻璃板：最后画=视觉上位于板后件之前、物蜡烛之后 */
  PROPS.glass_plate(c,R.mirrorX,R.glassY,{h:R.glassH});
  /* 辅助线：物—像连线虚线 + 与板面垂直标记（小直角） */
  if(R.showAux){
    var ay=R.candleY-R.candleH*0.55;
    c.save();c.strokeStyle='#2563eb';c.lineWidth=1.6;c.setLineDash([6,5]);
    c.beginPath();c.moveTo(R.objX,ay);c.lineTo(imgX,ay);c.stroke();
    c.setLineDash([]);
    c.beginPath();c.moveTo(R.mirrorX+9,ay);c.lineTo(R.mirrorX+9,ay-9);c.lineTo(R.mirrorX,ay-9);c.stroke();
    c.restore();
  }
  /* 物蜡烛（板前）：opt.lit 双 sprite 切换 */
  if(R.objLit)flameGlow(c,R.objX,fY,0.35);
  PROPS.candle(c,R.objX,R.candleY,{h:R.candleH,lit:R.objLit});
  /* 点燃 300ms 渐隐光晕 */
  if(R.lightFx){
    var kf=1-(performance.now()-R.lightFx.t0)/300;
    if(kf<=0)R.lightFx=null;
    else flameGlow(c,R.lightFx.x,R.lightFx.y,0.6*kf);
  }
  if(R.ripple.t0){
    var kk=1-(performance.now()-R.ripple.t0)/300;
    if(kk<=0)R.ripple.t0=0;
    else{c.strokeStyle='rgba(37,99,235,'+(0.5*kk).toFixed(2)+')';c.lineWidth=2;
      c.beginPath();c.arc(R.ripple.x,R.ripple.y,20*(1-kk)+6,0,7);c.stroke();}
  }
};
})();

(function(global){
'use strict';
const PROPS = global.PROPS = global.PROPS || {};
const rand = PROPS.rand || function(seed){
  const s = Math.sin(seed * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

/* ============================================================
 * props-mech.js — 第七章「力」力学器材标准件 v1（2026-11-20 C7V6-L1 增补第七章实验绘制器材9件；2026-11-22 C7V6-D1 删21件未用件；C7V6-D2 删16件仅死页(exp-force-lab/exp-gravity-hall)引用件+DAMP/weightGeom，活页引用件 person_side/stand_side 等零改动）
 * 约定同 props-optics/props-density：IIFE 挂 global.PROPS；(x,y)=底面中心锚点
 * （吊挂件=底钩锚点向上画；旋转件=中心锚点）；有挂载点的件返回几何含 mounts:{锚名:{x,y}}（世界坐标）。
 * 件清单：L1九件(见 MECH_L1_IDS)
 * ============================================================ */

// MECH_IDS: 本文件件名清单（gallery 与下游 B 单索引用）
PROPS.MECH_IDS = [];  // C7V6-D2：原单A16件全部仅死页引用已删；清单=下方 L1 九件 concat


/* ================================================================================
 * C7V6-L1 新增9件第七章实验绘制器材（来源: physics_g8_v1_c7_s1/exp-road-core.js、
 * exp-bench-core.js 打磨版内联绘制代码逐字提取；2026-11-20 入册 v1，不升版）
 * 变体白名单=尺寸/角度/朝向/挡位/挂载参数；确定性绘制（无 Math.random，正弦伪随机）
 * ================================================================================ */

// 共享小工具（l1 前缀防与旧37件冲突）
function l1rr(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function l1circ(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);}
function l1txt(ctx,t,x,y,color,size,align){ctx.save();ctx.fillStyle=color||'#28323d';ctx.font='600 '+(size||11)+'px "PingFang SC","Microsoft YaHei",sans-serif';ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillText(t,x,y);ctx.restore();}
function l1shade(hex,amt){var n=parseInt(hex.slice(1),16);var c=function(v){return Math.max(0,Math.min(255,v))};return 'rgb('+c((n>>16)+amt)+','+c(((n>>8)&255)+amt)+','+c((n&255)+amt)+')';}
function l1clamp(v,a,b){return Math.max(a,Math.min(b,v));}

PROPS.MECH_L1_IDS=['dial_side','car_side','person_side','sponge_pad','brake_pedal','stand_side','weight_cyl','spring_helix','meter_side'];
PROPS.MECH_IDS=PROPS.MECH_IDS.concat(PROPS.MECH_L1_IDS);

/* dial_side: 方向盘（来源 C7V6 exp-road-core.drawWheel：圆环+水平直径杠+中心竖直半辐条；车内小盘与弹窗大盘同一件）
 * (x,y)=轮盘圆心（旋转件圆心锚点，规则13例外）；opt.r 半径 / opt.scale 倍率 / opt.angle 弧度 / opt.color 默认'#2b2f36'
 * 变体白名单: r/scale/angle/color
 */
PROPS.dial_side=function(ctx,x,y,opt){
  opt=opt||{};
  var r=(opt.r||40)*(opt.scale||1);
  ctx.save();
  ctx.translate(x,y);ctx.rotate(opt.angle||0);
  ctx.strokeStyle=opt.color||'#2b2f36';ctx.lineWidth=Math.max(3,r*0.14);
  l1circ(ctx,0,0,r);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.moveTo(0,0);ctx.lineTo(0,r);ctx.stroke();
  ctx.restore();
  return {r:r,center:{x:x,y:y}};
};

/* car_side: 侧视轿车+车轮（来源 C7V6 exp-road-core.drawCar/drawOneWheel；车头朝右，渐变车体+座舱+车窗+灯+保险杠+车内方向盘）
 * (x,y)=轮地接触线中心（底面中心锚点）；opt.w/h 车尺寸；opt.angle 车姿态弧度（绕锚点旋转，斜面物理由页面驱动）；opt.wheelR 轮半径；
 * opt.wheels=[{x,y,sx,sy}] 世界坐标悬架轮(x,y=轮心,sx,sy=支柱顶；缺省=±0.32w 两轮静态)；opt.dialAngle 方向盘角；
 * opt.com={x,y}|null 重心标记(车身旋转坐标系内绘制)；opt.comLabel 是否绘制'重心'白字(不随车旋转)
 * 返回 {sw:{x,y,r} 方向盘命中圆, com}；变体白名单: w/h/angle/wheelR/wheels/dialAngle/com/comLabel
 */
PROPS.car_side=function(ctx,x,y,opt){
  opt=opt||{};
  var w=opt.w,h=opt.h,gy=y,x0=x-w/2;
  function oneWheel(cx0,cy0,r){ctx.fillStyle='#2b2f36';l1circ(ctx,cx0,cy0,r);ctx.fill();ctx.fillStyle='#c7ced6';l1circ(ctx,cx0,cy0,r*0.52);ctx.fill();ctx.fillStyle='#6b7684';l1circ(ctx,cx0,cy0,r*0.16);ctx.fill();}
  ctx.save();
  if(opt.angle){ctx.translate(x,gy);ctx.rotate(opt.angle);ctx.translate(-x,-gy);}
  ctx.fillStyle='rgba(20,30,45,.20)';
  ctx.beginPath();ctx.ellipse(x,gy+3,w*0.5,5,0,0,Math.PI*2);ctx.fill();
  var bodyY=gy-h*0.80,bodyH=h*0.72;
  var bg=ctx.createLinearGradient(0,bodyY-h*0.62,0,gy);
  bg.addColorStop(0,'#e05555');bg.addColorStop(1,'#b03030');
  ctx.fillStyle=bg;
  ctx.beginPath();
  ctx.moveTo(x0+w*0.16,bodyY+4);
  ctx.quadraticCurveTo(x0+w*0.22,bodyY-h*0.60,x0+w*0.36,bodyY-h*0.62);
  ctx.lineTo(x0+w*0.60,bodyY-h*0.62);
  ctx.quadraticCurveTo(x0+w*0.73,bodyY-h*0.56,x0+w*0.80,bodyY+4);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#bfe3f2';
  l1rr(ctx,x0+w*0.26,bodyY-h*0.50,w*0.19,h*0.42,5);ctx.fill();
  l1rr(ctx,x0+w*0.48,bodyY-h*0.50,w*0.15,h*0.42,5);ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x0+w*0.655,bodyY-h*0.48);ctx.lineTo(x0+w*0.735,bodyY-h*0.02);
  ctx.lineTo(x0+w*0.665,bodyY-h*0.02);ctx.closePath();ctx.fill();
  ctx.fillStyle=bg;l1rr(ctx,x0,bodyY,w,bodyH,h*0.20);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.16)';l1rr(ctx,x0+w*0.05,bodyY+bodyH*0.12,w*0.9,bodyH*0.16,h*0.08);ctx.fill();
  ctx.strokeStyle='rgba(60,20,20,.45)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(x0+w*0.46,bodyY+4);ctx.lineTo(x0+w*0.46,bodyY+bodyH-6);ctx.stroke();
  ctx.fillStyle='rgba(60,20,20,.5)';l1rr(ctx,x0+w*0.36,bodyY+bodyH*0.30,w*0.06,3,1.5);ctx.fill();
  ctx.fillStyle='#ffe08a';l1rr(ctx,x0+w-9,bodyY+bodyH*0.22,9,bodyH*0.26,4);ctx.fill();
  ctx.fillStyle='#f43f5e';l1rr(ctx,x0,bodyY+bodyH*0.22,6,bodyH*0.26,3);ctx.fill();
  ctx.fillStyle='#3f4650';l1rr(ctx,x0+w-6,gy-h*0.20,8,h*0.10,3);ctx.fill();l1rr(ctx,x0-2,gy-h*0.20,8,h*0.10,3);ctx.fill();
  var swx=x0+w*0.62,swy=bodyY-h*0.16,swr=Math.max(8,h*0.14);
  PROPS.dial_side(ctx,swx,swy,{r:swr,angle:opt.dialAngle||0});
  var sw={x:swx,y:swy,r:swr};
  if(opt.com){
    var c=opt.com;
    ctx.fillStyle='#fff';l1circ(ctx,c.x,c.y,5);ctx.fill();
    ctx.strokeStyle='#28323d';ctx.lineWidth=2;l1circ(ctx,c.x,c.y,5);ctx.stroke();
    ctx.beginPath();ctx.moveTo(c.x-8,c.y);ctx.lineTo(c.x+8,c.y);ctx.moveTo(c.x,c.y-8);ctx.lineTo(c.x,c.y+8);ctx.stroke();
  }
  ctx.restore();
  var wr=opt.wheelR||20;
  var wheels=opt.wheels||[
    {x:x-w*0.32,y:gy-wr,sx:x-w*0.32,sy:gy-2*wr},
    {x:x+w*0.32,y:gy-wr,sx:x+w*0.32,sy:gy-2*wr}];
  wheels.forEach(function(wt){
    ctx.strokeStyle='#555';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(wt.sx,wt.sy);ctx.lineTo(wt.x,wt.y);ctx.stroke();
    oneWheel(wt.x,wt.y,wr);
  });
  if(opt.comLabel&&opt.com){
    ctx.save();ctx.fillStyle='#fff';ctx.font='600 11px sans-serif';ctx.textAlign='center';
    ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=3;
    ctx.fillText('重心',opt.com.x,opt.com.y-12);ctx.restore();
  }
  return {sw:sw,com:opt.com||null};
};

/* person_side: 侧视推手人（来源 C7V6 exp-road-core.drawPerson/drawPersonSpr；有机体sprite优先，未加载回退贝塞尔卡通人）
 * (x,y)=双足地面中心（底面中心锚点，站立于y线）；opt.h 人高；opt.dir 1朝右/-1朝左；opt.ice 轮滑变体（鞋↔轮滑靴sprite交叉淡变）；
 * opt.eng 0..1 站立↔推手过渡；opt.hand={x,y} 世界坐标手目标（肩轴定长手臂IK，sprite路径用）；opt.cp 世界坐标接触点（回退路径用，null=自然摆臂）；
 * opt.handOff/cpOff={dx,dy} 相对锚点目标（展柜用）；opt.armLen 上臂长；opt.pushing/walking/sliding 回退姿态；opt.spriteBase 默认'assets/'（相对页面目录，404自动回退矢量身体）
 * onLoad(cb)：sprite加载完成钩子（页面置dirty）；变体白名单: h/dir/ice/eng/hand(Off)/cp(Off)/armLen/pushing/walking/sliding/spriteBase
 */
var L1_SPR_CACHE={},L1_PERSON_CBS=[];
function l1mkSpr(base,file,nw,nh,v){
  var key=base+'|'+file;
  if(!L1_SPR_CACHE[key]){
    var img=new Image();
    img.onload=function(){L1_PERSON_CBS.forEach(function(f){try{f()}catch(e){}});};
    img.src=base+file+'?v='+(v||'20261117');
    L1_SPR_CACHE[key]={img:img,nw:nw,nh:nh};
  }
  return L1_SPR_CACHE[key];
}
/* 脚本初始化即建 person sprite（与旧 core mkSpr 脚本初始化时机一致，消首帧/探针时序差）；cache key=base|file，页面同 base 引用复用 */
l1mkSpr('assets/','boy_stand.png',154,800);l1mkSpr('assets/','boy_skate.png',172,820);
l1mkSpr('assets/','boy_push_body.png',418,652,'20261117g');l1mkSpr('assets/','boy_skatepush_body.png',403,657,'20261117v');
l1mkSpr('assets/','boy_arm.png',231,61,'20261117g');l1mkSpr('assets/','boy_arm_far.png',234,54,'20261117h');
PROPS.person_side=function(ctx,x,y,opt){
  opt=opt||{};
  var base=opt.spriteBase||'assets/';
  var SPR={
    stand:l1mkSpr(base,'boy_stand.png',154,800),
    skate:l1mkSpr(base,'boy_skate.png',172,820),
    push:l1mkSpr(base,'boy_push_body.png',418,652,'20261117g'),
    skatepush:l1mkSpr(base,'boy_skatepush_body.png',403,657,'20261117v'),
    arm:l1mkSpr(base,'boy_arm.png',231,61,'20261117g'),
    armFar:l1mkSpr(base,'boy_arm_far.png',234,54,'20261117h')
  };
  SPR.arm.rig={pivX:0,pivY:30,tipX:230,tipY:13};
  SPR.armFar.rig={pivX:0,pivY:26.5,tipX:233,tipY:24.5};
  var SPR_K_BODY=800,PUSH_FOOT_F=0.4498,SKATEPUSH_FOOT_F=0.6234;
  var ph=opt.h||160,d=opt.dir===-1?-1:1,ice=!!opt.ice;
  function sstep(t){return t*t*(3-2*t);}
  var e=sstep(opt.eng||0);
  function sprOK(s){return s.img.complete&&s.img.naturalWidth>0;}
  function personSprOK(){return sprOK(SPR.stand)&&sprOK(SPR.skate)&&sprOK(SPR.push)&&sprOK(SPR.skatepush)&&sprOK(SPR.arm)&&sprOK(SPR.armFar);}
  function sprW(s,k){return (s.img.naturalWidth||s.nw)*k;}
  function sprH(s,k){return (s.img.naturalHeight||s.nh)*k;}
  function drawArmSpr(s,sx,sy,tx,ty,k,alpha){
    var r=s.rig,dist=Math.hypot(tx-sx,ty-sy),targetAng=Math.atan2(ty-sy,tx-sx);
    var spanWorld=(r.tipX-r.pivX)*k,kx=dist/spanWorld,kxu=k*kx;
    var iAng=Math.atan2((r.tipY-r.pivY)*k,dist);
    var nw=s.img.naturalWidth||s.nw,nh=s.img.naturalHeight||s.nh;
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.translate(sx,sy);ctx.rotate(targetAng-iAng);
    ctx.drawImage(s.img,-r.pivX*kxu,-r.pivY*k,nw*kxu,nh*k);
    ctx.restore();
  }
  function drawBodySpr(s,kb,alpha,footF){
    var bw=sprW(s,kb),bh=sprH(s,kb);
    ctx.globalAlpha=alpha;
    ctx.drawImage(s.img,-bw*(footF||0.5),y-bh,bw,bh);
    ctx.globalAlpha=1;
  }
  var hand=opt.hand||(opt.handOff?{x:x+opt.handOff.dx,y:y+opt.handOff.dy}:null);
  if(personSprOK()){
    var kb=ph/SPR_K_BODY;
    ctx.save();
    ctx.translate(x,0);ctx.scale(d,1);
    var armOn=e>=0.02,shxL=0,shY=0,tipX=0,tipY=0;
    if(armOn){
      shxL=ph*(ice?0.0406+(0.1641-0.0406)*e:0.055);
      shY=y-ph*(ice?0.789+(0.5588-0.789)*e:0.66+(0.575-0.66)*e);
      var sp=hand||{x:x+d*ph*0.5,y:y-ph*0.5};
      var tx=(sp.x-x)*d,ty=sp.y;
      var ikAng=Math.atan2(ty-shY,tx-shxL),ikDist=Math.hypot(tx-shxL,ty-shY);
      var armLen0=opt.armLen||ph*0.36;
      var ang=Math.PI/2+(ikAng-Math.PI/2)*e;
      var len=armLen0+(ikDist-armLen0)*e;
      tipX=shxL+Math.cos(ang)*len;tipY=shY+Math.sin(ang)*len;
      drawArmSpr(SPR.armFar,shxL+2,shY+3,tipX,tipY,kb,0.9*e);
    }
    ctx.save();ctx.scale(-1,1);
    if(ice){
      if(e<0.02)drawBodySpr(SPR.skate,kb,1);
      else if(e>0.98)drawBodySpr(SPR.skatepush,kb,1,SKATEPUSH_FOOT_F);
      else{drawBodySpr(SPR.skate,kb,1-e);drawBodySpr(SPR.skatepush,kb,e,SKATEPUSH_FOOT_F);}
    }else if(e<0.02)drawBodySpr(SPR.stand,kb,1);
    else if(e>0.98)drawBodySpr(SPR.push,kb,1,PUSH_FOOT_F);
    else{drawBodySpr(SPR.stand,kb,1-e);drawBodySpr(SPR.push,kb,e,PUSH_FOOT_F);}
    ctx.restore();
    if(armOn){
      var tSl=sprH(SPR.arm,kb);
      var pw=tSl*1.6,phh=tSl*1.25;
      ctx.save();ctx.globalAlpha=e;ctx.fillStyle='#f9d624';
      l1rr(ctx,shxL-pw/2,shY-phh/2,pw,phh,phh*0.45);ctx.fill();
      ctx.restore();
      drawArmSpr(SPR.arm,shxL,shY,tipX,tipY,kb,e);
    }
    ctx.restore();
    return {sprite:true,hand:hand};
  }
  /* —— 精灵未加载：贝塞尔写实卡通人（来源 exp-road-core.drawPerson 回退主体 + strokeLimb/drawArm/drawFoot，逐字）—— */
  var pushing=!!opt.pushing,walking=!!opt.walking,sliding=!!opt.sliding;
  var cp=opt.cp||(opt.cpOff?{x:x+opt.cpOff.dx,y:y+opt.cpOff.dy}:null);
  var gy=y;
  var topY=gy-ph,headR=ph*0.10,headY=topY+headR*1.42;
  var shY=gy-ph*(pushing?0.60:0.66),hipY=topY+ph*0.56,tw=ph*0.115;
  var shx=ph*0.055;
  var lean=pushing?ph*0.055:(sliding?-ph*0.045:0);
  var fOff=walking?ph*0.115:ph*0.05;
  var handL=cp?{x:(cp.x-x)*d,y:cp.y}:null;
  function strokeLimb(x0,y0,x1,y1,x2,y2,w2,col,bend){
    ctx.strokeStyle='rgba(15,25,35,.28)';ctx.lineWidth=w2+2;
    ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1+bend,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.strokeStyle=col;ctx.lineWidth=w2;
    ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1+bend,y1);ctx.lineTo(x2,y2);ctx.stroke();
  }
  function drawArmF(sx,sy,hx,hy,far){
    var dx=hx-sx,dy=hy-sy,ln=Math.hypot(dx,dy)||1;
    var cx2=(sx+hx)/2-dy/ln*ph*0.018,cy2=(sy+hy)/2+dx/ln*ph*0.018;
    ctx.strokeStyle=far?'#d9a066':'#f0c08a';ctx.lineWidth=ph*0.04;
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(cx2,cy2,hx,hy);ctx.stroke();
    ctx.strokeStyle=far?'#2f568f':'#3f6fb5';ctx.lineWidth=ph*0.052;
    ctx.beginPath();ctx.moveTo(sx,sy);
    ctx.quadraticCurveTo(sx+(cx2-sx)*0.5,sy+(cy2-sy)*0.5,sx+(hx-sx)*0.42,sy+(hy-sy)*0.42);ctx.stroke();
  }
  function drawFootF(fx,fgy,fice,back){
    var w=ph*0.115,hgt=ph*0.045,x0=fx-w*0.42,y0=fgy-hgt;
    if(fice){
      var wr=ph*0.017,wy=fgy-wr;
      ctx.fillStyle='#b36a00';l1rr(ctx,x0-1,wy-wr*1.15,w+6,wr*1.1,2);ctx.fill();
      for(var i=0;i<4;i++){
        var wx=x0+2+i*(w+2)/3.4;
        ctx.fillStyle='#2b2f36';l1circ(ctx,wx,wy,wr);ctx.fill();
        ctx.strokeStyle=back?'rgba(0,0,0,.35)':'#111';ctx.lineWidth=1.4;l1circ(ctx,wx,wy,wr);ctx.stroke();
        ctx.fillStyle='#ff9f1c';l1circ(ctx,wx,wy,wr*0.42);ctx.fill();
      }
      ctx.fillStyle=back?'#d97f0e':'#ff9f1c';
      ctx.beginPath();
      ctx.moveTo(x0,y0-hgt*0.55);
      ctx.bezierCurveTo(x0+w*0.2,y0-hgt*0.7,x0+w*0.75,y0-hgt*0.35,x0+w+4,y0+hgt*0.1);
      ctx.lineTo(x0+w+4,wy-wr*1.1);ctx.lineTo(x0-1,wy-wr*1.1);
      ctx.closePath();ctx.fill();
      ctx.strokeStyle='#7a4a00';ctx.lineWidth=1.4;ctx.stroke();
      ctx.fillStyle='#fff8ec';l1rr(ctx,x0+w*0.1,y0-hgt*0.18,w*0.55,2.4,1.2);ctx.fill();
    }else{
      ctx.fillStyle=back?'#4a382b':'#5b4636';
      ctx.beginPath();
      ctx.moveTo(x0,fgy-1);
      ctx.bezierCurveTo(x0,y0-hgt*0.5,x0+w*0.5,y0-hgt*0.35,x0+w+3,fgy-2);
      ctx.lineTo(x0+w+3,fgy-1);ctx.closePath();ctx.fill();
      ctx.fillStyle='#2c2119';l1rr(ctx,x0-1,fgy-3,w+5,3,1.4);ctx.fill();
    }
  }
  ctx.save();
  ctx.translate(x,0);ctx.scale(d,1);
  ctx.lineCap='round';ctx.lineJoin='round';
  strokeLimb(-tw*0.35,hipY,-fOff*0.55,hipY+(gy-hipY)*0.52,-fOff*0.95,gy-ph*0.055,ph*0.062,'#26333b',ph*0.02);
  drawFootF(-fOff*0.95,gy,ice,true);
  var sg=ctx.createLinearGradient(-tw,shY,tw*1.3,hipY);
  sg.addColorStop(0,'#2f568f');sg.addColorStop(0.45,'#3f6fb5');sg.addColorStop(1,'#2f568f');
  ctx.fillStyle=sg;
  ctx.beginPath();
  ctx.moveTo(-tw*0.92+lean*0.6,shY-ph*0.05);
  ctx.bezierCurveTo(-tw*1.1+lean*0.3,shY+ph*0.06,-tw*0.95,hipY-ph*0.04,-tw*0.8,hipY+ph*0.035);
  ctx.bezierCurveTo(-tw*0.2,hipY+ph*0.055,tw*0.4,hipY+ph*0.055,tw*0.85,hipY+ph*0.03);
  ctx.bezierCurveTo(tw*1.02,hipY-ph*0.05,tw*1.08+lean,shY+ph*0.05,tw*0.95+lean,shY-ph*0.048);
  ctx.bezierCurveTo(tw*0.3+lean,shY-ph*0.075,-tw*0.3+lean,shY-ph*0.075,-tw*0.92+lean*0.6,shY-ph*0.05);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(20,35,60,.35)';ctx.lineWidth=1.2;ctx.stroke();
  ctx.strokeStyle='rgba(20,35,60,.16)';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(-tw*0.2+lean*0.7,shY+ph*0.02);ctx.quadraticCurveTo(-tw*0.05,shY+ph*0.10,-tw*0.3,hipY-ph*0.02);ctx.stroke();
  ctx.beginPath();ctx.moveTo(tw*0.45+lean*0.5,shY+ph*0.05);ctx.quadraticCurveTo(tw*0.35,shY+ph*0.12,tw*0.5,hipY-ph*0.03);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.13)';
  ctx.beginPath();ctx.moveTo(tw*0.1+lean*0.8,shY-ph*0.02);
  ctx.quadraticCurveTo(tw*0.85+lean*0.8,shY+ph*0.02,tw*0.6,hipY-ph*0.05);
  ctx.quadraticCurveTo(tw*0.25,shY+ph*0.08,tw*0.1+lean*0.8,shY-ph*0.02);ctx.closePath();ctx.fill();
  ctx.fillStyle='#d9a066';l1rr(ctx,-tw*0.22+lean,shY-ph*0.085,tw*0.5,ph*0.05,3);ctx.fill();
  ctx.fillStyle='#f0c08a';l1rr(ctx,-tw*0.2+lean,shY-ph*0.09,tw*0.46,ph*0.04,3);ctx.fill();
  ctx.strokeStyle='rgba(20,35,60,.4)';ctx.lineWidth=1.3;
  ctx.beginPath();ctx.moveTo(-tw*0.35+lean,shY-ph*0.052);ctx.lineTo(tw*0.05+lean,shY-ph*0.028);ctx.lineTo(tw*0.42+lean,shY-ph*0.055);ctx.stroke();
  strokeLimb(tw*0.35,hipY,fOff*0.62,hipY+(gy-hipY)*0.5,fOff,gy-ph*0.055,ph*0.066,'#37474f',ph*0.024);
  drawFootF(fOff,gy,ice,false);
  if(handL){
    var hx=handL.x,hy=handL.y;
    drawArmF(shx-tw*0.1,shY+ph*0.012,hx-ph*0.012,hy+ph*0.022,true);
    drawArmF(shx+tw*0.12,shY,hx,hy,false);
    ctx.fillStyle='#f0c08a';l1circ(ctx,hx,hy,ph*0.030);ctx.fill();
    ctx.strokeStyle='rgba(120,80,40,.5)';ctx.lineWidth=1;l1circ(ctx,hx,hy,ph*0.030);ctx.stroke();
    ctx.beginPath();ctx.moveTo(hx+ph*0.02,hy-ph*0.012);ctx.lineTo(hx+ph*0.034,hy-ph*0.004);ctx.stroke();
  }else{
    var sw2=walking?ph*0.075:ph*0.015;
    drawArmF(shx-tw*0.15,shY+ph*0.01,-sw2*0.7-ph*0.02,hipY-ph*0.01,true);
    drawArmF(shx+tw*0.15,shY,sw2+ph*0.03,hipY-ph*0.02,false);
    ctx.fillStyle='#f0c08a';
    l1circ(ctx,-sw2*0.7-ph*0.02,hipY-ph*0.01,ph*0.027);ctx.fill();
    l1circ(ctx,sw2+ph*0.03,hipY-ph*0.02,ph*0.028);ctx.fill();
  }
  var hdx=lean*1.15+ph*0.012;
  ctx.fillStyle='#d9a066';
  ctx.beginPath();ctx.ellipse(hdx-headR*0.72,headY+headR*0.18,headR*0.2,headR*0.3,-0.2,0,Math.PI*2);ctx.fill();
  var fg=ctx.createRadialGradient(hdx+headR*0.35,headY-headR*0.3,headR*0.2,hdx,headY,headR*1.5);
  fg.addColorStop(0,'#f7d3a5');fg.addColorStop(1,'#f0c08a');
  ctx.fillStyle=fg;
  ctx.beginPath();
  ctx.moveTo(hdx-headR*0.85,headY-headR*0.15);
  ctx.bezierCurveTo(hdx-headR*1.02,headY-headR*1.35,hdx+headR*0.72,headY-headR*1.58,hdx+headR*0.94,headY-headR*0.35);
  ctx.bezierCurveTo(hdx+headR*1.02,headY+headR*0.15,hdx+headR*0.92,headY+headR*0.55,hdx+headR*0.5,headY+headR*0.98);
  ctx.bezierCurveTo(hdx+headR*0.1,headY+headR*1.18,hdx-headR*0.5,headY+headR*0.85,hdx-headR*0.72,headY+headR*0.35);
  ctx.bezierCurveTo(hdx-headR*0.85,headY+headR*0.1,hdx-headR*0.87,headY-headR*0.05,hdx-headR*0.85,headY-headR*0.15);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(120,80,40,.35)';ctx.lineWidth=1.1;ctx.stroke();
  ctx.fillStyle='#5a3d26';
  ctx.beginPath();
  ctx.moveTo(hdx-headR*0.92,headY+headR*0.02);
  ctx.bezierCurveTo(hdx-headR*1.18,headY-headR*1.2,hdx-headR*0.2,headY-headR*1.78,hdx+headR*0.62,headY-headR*1.3);
  ctx.bezierCurveTo(hdx+headR*0.95,headY-headR*1.08,hdx+headR*1.02,headY-headR*0.7,hdx+headR*0.98,headY-headR*0.42);
  ctx.bezierCurveTo(hdx+headR*0.6,headY-headR*0.82,hdx+headR*0.05,headY-headR*0.95,hdx-headR*0.4,headY-headR*0.62);
  ctx.bezierCurveTo(hdx-headR*0.66,headY-headR*0.42,hdx-headR*0.82,headY-headR*0.2,hdx-headR*0.92,headY+headR*0.02);
  ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(40,25,12,.5)';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.ellipse(hdx+headR*0.42,headY-headR*0.08,headR*0.2,headR*0.24,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#33241a';l1circ(ctx,hdx+headR*0.47,headY-headR*0.05,Math.max(1.5,headR*0.11));ctx.fill();
  ctx.fillStyle='#fff';l1circ(ctx,hdx+headR*0.5,headY-headR*0.1,Math.max(0.8,headR*0.04));ctx.fill();
  ctx.strokeStyle='#3a2c20';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(hdx+headR*0.26,headY-headR*0.42);ctx.quadraticCurveTo(hdx+headR*0.45,headY-headR*0.52,hdx+headR*0.62,headY-headR*0.4);ctx.stroke();
  ctx.lineWidth=1.3;
  ctx.beginPath();ctx.moveTo(hdx+headR*0.82,headY+headR*0.12);ctx.quadraticCurveTo(hdx+headR*0.92,headY+headR*0.28,hdx+headR*0.76,headY+headR*0.32);ctx.stroke();
  ctx.beginPath();ctx.arc(hdx+headR*0.45,headY+headR*0.42,headR*0.3,0.2,Math.PI*0.66);ctx.stroke();
  ctx.fillStyle='rgba(230,120,110,.28)';
  ctx.beginPath();ctx.ellipse(hdx+headR*0.62,headY+headR*0.3,headR*0.16,headR*0.1,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
  return {sprite:false};
};
PROPS.person_side.onLoad=function(cb){L1_PERSON_CBS.push(cb);};

/* sponge_pad: 小车接触海绵（来源 C7V6 exp-road-core.drawSponge；米黄多孔+按压凹陷+标签）
 * (x,y)=车身接触面点（侧挂锚点，海绵中心=锚点+(dir*2-宽半)）；opt.def 0..1 压缩量（物理由页面驱动）；opt.s 车高标度(w0=s*0.17,h0=s*0.32)；opt.dir ±1；opt.label!==false 绘制'海绵'白字
 * 变体白名单: def/s/dir/label
 */
PROPS.sponge_pad=function(ctx,x,y,opt){
  opt=opt||{};
  var d=opt.dir||1,def=opt.def||0,s=opt.s||100;
  var w0=s*0.17,h0=s*0.32;
  var w=w0*(1+def*0.45),h=h0*(1-def*0.55);
  var px=x-w*0.5+d*2,py=y-h/2;
  ctx.save();
  var sg=ctx.createLinearGradient(px,py,px,py+h);
  sg.addColorStop(0,'#fbf0cc');sg.addColorStop(1,'#f6e3a8');
  ctx.fillStyle=sg;l1rr(ctx,px,py,w,h,4);ctx.fill();
  ctx.strokeStyle='#d3b063';ctx.lineWidth=1.5;l1rr(ctx,px,py,w,h,4);ctx.stroke();
  ctx.fillStyle='#e2c988';
  for(var i=0;i<7;i++){
    var hx=px+w*(0.14+((i*37)%72)/100),hy=py+h*(0.14+((i*53)%68)/100);
    ctx.beginPath();ctx.ellipse(hx,hy,1.1+(i%3)*0.55,0.9+(i%2)*0.5,0,0,Math.PI*2);ctx.fill();
  }
  if(def>0.08){
    ctx.strokeStyle='rgba(160,120,50,.5)';ctx.lineWidth=1.4;
    ctx.beginPath();
    ctx.moveTo(px+(d>0?1:w-1),py+h*0.18);
    ctx.quadraticCurveTo(px+(d>0?1:w-1)+d*def*w*0.3,py+h*0.5,px+(d>0?1:w-1),py+h*0.82);
    ctx.stroke();
  }
  if(opt.label!==false){
    ctx.font='600 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    ctx.shadowColor='rgba(255,255,255,.9)';ctx.shadowBlur=3;ctx.fillStyle='#8a6a20';
    ctx.fillText('海绵',px+w/2,py+h+3);
  }
  ctx.restore();
  return {w:w,h:h,x:px,y:py};
};

/* brake_pedal: 刹车竖直滑轨+踏板滑块（来源 C7V6 exp-road-core.drawBrake；面板+滑槽+刻度松紧+梯形防滑踏板）
 * (x,y)=滑槽顶左（侧挂锚点）；opt.w/h 滑槽面板尺寸；opt.frac 0..1 滑块位置（刹车量物理由页面驱动）；opt.dis 轮滑锁定置灰；opt.valTxt 底部'刹车力 N'行文本；opt.hintTxt 提示行（缺省按dis自动）
 * 变体白名单: w/h/frac/dis/valTxt/hintTxt
 */
PROPS.brake_pedal=function(ctx,x,y,opt){
  opt=opt||{};
  var w=opt.w||68,h=opt.h||160,dis=!!opt.dis;
  var frac=l1clamp(opt.frac||0,0,1);
  var ty0=y+10,th=h-20;
  var ky=ty0+frac*th;
  ctx.save();
  ctx.fillStyle='rgba(255,255,255,.88)';l1rr(ctx,x-10,y-28,w+20,h+66,12);ctx.fill();
  ctx.strokeStyle='rgba(100,116,139,.4)';ctx.lineWidth=1;l1rr(ctx,x-10,y-28,w+20,h+66,12);ctx.stroke();
  ctx.fillStyle='#28323d';ctx.font='700 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillText('刹车踏板',x+w/2,y-10);
  if(dis)ctx.globalAlpha=0.35;
  var cx0=x+w/2;
  ctx.fillStyle='#b6c2cf';l1rr(ctx,cx0-8,ty0-4,16,th+8,8);ctx.fill();
  ctx.fillStyle='#8c9bab';l1rr(ctx,cx0-4,ty0,8,th,4);ctx.fill();
  ctx.strokeStyle='rgba(40,50,61,.35)';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(cx0-12,ty0);ctx.lineTo(cx0-20,ty0);ctx.moveTo(cx0-12,ty0+th);ctx.lineTo(cx0-20,ty0+th);ctx.stroke();
  ctx.font='600 9px sans-serif';ctx.fillStyle='#6b7885';ctx.textAlign='right';
  ctx.fillText('松',cx0-22,ty0+3);ctx.fillText('紧',cx0-22,ty0+th+3);
  ctx.save();ctx.translate(cx0,ky);
  var scale=w/68;
  var padW=46*scale,padH=34*scale,ins=padW*0.06,pr=padH*0.16;
  var px0=-padW/2,py0=-padH/2;
  var padGrad=ctx.createLinearGradient(0,py0,0,py0+padH);
  padGrad.addColorStop(0,'#f8f9fa');padGrad.addColorStop(0.5,'#e8ebec');padGrad.addColorStop(1,'#c9ced2');
  ctx.beginPath();
  ctx.moveTo(px0+pr,py0);
  ctx.arcTo(px0+padW,py0,px0+padW-ins,py0+padH,pr);
  ctx.arcTo(px0+padW-ins,py0+padH,px0+ins,py0+padH,pr);
  ctx.arcTo(px0+ins,py0+padH,px0,py0,pr);
  ctx.arcTo(px0,py0,px0+padW,py0,pr);
  ctx.closePath();
  ctx.fillStyle=padGrad;ctx.fill();
  ctx.strokeStyle='#3f4650';ctx.lineWidth=2;ctx.stroke();
  var rowH=padH*0.09,vpad=padH*0.15,step=(padH-2*vpad)/5;
  var lcolW=padW*0.42,rcolW=padW*0.30,gap=padW*0.06,lm=(padW-(lcolW+gap+rcolW))/2;
  var lx0=px0+lm,rx0=px0+lm+lcolW+gap;
  ctx.fillStyle='#17181a';
  for(var i=0;i<5;i++){
    var cy=py0+vpad+step*(i+0.5);
    l1rr(ctx,lx0,cy-rowH/2,lcolW,rowH,rowH/2);ctx.fill();
    l1rr(ctx,rx0,cy-rowH/2,rcolW,rowH,rowH/2);ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha=1;
  ctx.fillStyle='#28323d';ctx.font='700 13px sans-serif';ctx.textAlign='center';
  ctx.fillText(opt.valTxt||'',cx0,y+h+16);
  ctx.font='600 9px sans-serif';ctx.fillStyle=dis?'#dc2626':'#6b7885';
  ctx.fillText(opt.hintTxt||(dis?'轮滑锁定=最大':'拖动滑钮=刹车力'),cx0,y+h+30);
  ctx.restore();
  return {x:x,y:y,w:w,h:h,knob:{x:cx0,y:ky}};
};

/* stand_side: 侧视铁架台（来源 C7V6 exp-bench-core.drawStand；底座+立杆+左挑横杆+端环，整体随斜面倾斜）
 * (x,y)=底座底面中心（底面中心锚点）；opt.rh 立杆高 / opt.aw 横杆长 / opt.baseW 底座宽 / opt.tilt 倾斜弧度（内部rotate(-tilt)）
 * 返回 {top立杆顶,hang横杆挂点}；变体白名单: rh/aw/baseW/tilt
 */
PROPS.stand_side=function(ctx,x,y,opt){
  opt=opt||{};
  var rh=opt.rh||260,aw=opt.aw||90,baseW=opt.baseW||180,a=opt.tilt||0;
  ctx.save();ctx.translate(x,y);ctx.rotate(-a);
  ctx.fillStyle='#3f4954';l1rr(ctx,-baseW/2,-9,baseW,18,5);ctx.fill();
  ctx.fillStyle='#5b6672';l1rr(ctx,-baseW/2+10,-14,baseW-20,7,3);ctx.fill();
  ctx.strokeStyle='#5b6672';ctx.lineWidth=14;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(0,-rh);ctx.stroke();
  ctx.strokeStyle='#828d99';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-3.5,-14);ctx.lineTo(-3.5,-rh+5);ctx.stroke();
  ctx.strokeStyle='#5b6672';ctx.lineWidth=11;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(3,-rh+5);ctx.lineTo(-aw,-rh+5);ctx.stroke();
  ctx.fillStyle='#3f4954';l1circ(ctx,-aw,-rh+5,9);ctx.fill();
  ctx.fillStyle='#828d99';l1circ(ctx,-aw,-rh+5,4);ctx.fill();
  ctx.restore();
  return {top:{x:x-rh*Math.sin(a),y:y-rh*Math.cos(a)},hang:{x:x-rh*Math.sin(a)-aw*Math.cos(a),y:y-rh*Math.cos(a)+aw*Math.sin(a)}};
};

/* weight_cyl: 圆柱钩码（来源 C7V6 exp-bench-core.drawWeights；顶部挂环衔接簧底钩+身印克重；同规格视觉相同）
 * (x,y)=圆柱顶面中心（悬挂件顶锚点，向下绘制）；opt.mass 克重（50/100/150/200/250）；opt.w/h 显式尺寸（页面布局挤压优先，质量比仍由克重定）；缺省按 opt.u 50g基准{w,h}以(mass/50)^(1/3)派生
 * 返回 {w,h,hookTop}；变体白名单: mass/w/h/u
 */
PROPS.weight_cyl=function(ctx,x,y,opt){
  opt=opt||{};
  var mass=opt.mass||50;
  if(mass<=0)return null;
  var w=opt.w,h=opt.h;
  if(w==null||h==null){var u=opt.u||{w:41,h:30},s=Math.pow(mass/50,1/3);w=u.w*s;h=u.h*s;}
  var hr=5,stub=6,ry=w*0.10,yb=y+h;
  var g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);
  g.addColorStop(0,'#e8edf1');g.addColorStop(0.5,'#b9c2ca');g.addColorStop(1,'#87929b');
  var x0=x-w/2,x1=x+w/2;
  ctx.fillStyle=g;ctx.beginPath();
  ctx.moveTo(x0,y);ctx.lineTo(x0,yb);
  ctx.ellipse(x,yb,w/2,ry,0,Math.PI,0,true);
  ctx.lineTo(x1,y);
  ctx.ellipse(x,y,w/2,ry,0,0,Math.PI,true);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#dfe6ec';ctx.beginPath();ctx.ellipse(x,y,w/2,ry,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#6f7b85';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(x,yb,w/2,ry,0,0,Math.PI);ctx.stroke();
  var cy=y-stub-hr+2;
  ctx.strokeStyle='#5f6b75';ctx.lineWidth=Math.max(1.4,w*0.03);
  ctx.beginPath();ctx.moveTo(x,y+2);ctx.lineTo(x,cy+hr);ctx.stroke();
  ctx.beginPath();ctx.arc(x,cy,hr,0,Math.PI*2);ctx.stroke();
  l1txt(ctx,mass+'g',x,y+h*0.5+1,'#333',Math.max(8,Math.min(13,Math.round(h*0.37))),'center');
  return {w:w,h:h,hookTop:{x:x,y:y-stub}};
};

/* spring_helix: 参数化螺旋弹簧（来源 C7V6 exp-bench-core.helix；P(θ)=(x+sw·sinθ, ya+pitch·θ/2π+e·cosθ)，前后股深度排序：后股压暗+前股高光芯）
 * (x,y)=顶端锚点（悬挂件向下绘制）；opt.ext 伸长量px（底端=y+ext；弹性/塑性弯曲态由页面物理经ext驱动，件本体无状态）；opt.sw 旋半径；opt.color 材质色；opt.k 材质刚度（线宽光泽随k）；opt.turns 匝数默认12
 * 返回 {top,bottom}；变体白名单: ext/sw/color/k/turns
 */
PROPS.spring_helix=function(ctx,x,y,opt){
  opt=opt||{};
  var y0=y,y1=y+(opt.ext==null?120:opt.ext);
  var sw=opt.sw||36,color=opt.color||'#b9c5d1';
  var k=opt.k==null?1:opt.k,turns=opt.turns||12;
  var lead=6;
  var lw=sw*0.07*(0.9+k*0.06),gl=Math.round(10+k*16);
  var ya=y0+lead,yb=y1-lead,span=Math.max(0,yb-ya);
  var e=sw*0.32,pitch=span/turns;
  if(pitch<lw*0.75)pitch=lw*0.75;
  var tt=Math.max(1,span/pitch),thEnd=tt*2*Math.PI;
  var step=Math.min(0.12,1.8/Math.max(sw,1)),N=Math.ceil(thEnd/step);
  function PX(th){return x+sw*Math.sin(th);}
  function PY(th){return ya+pitch*th/(2*Math.PI)+e*Math.cos(th);}
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  ctx.strokeStyle=color;ctx.lineWidth=lw;
  ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(PX(0),PY(0));
  ctx.moveTo(PX(thEnd),PY(thEnd));ctx.lineTo(x,y1);ctx.stroke();
  var pts=[],j,th;
  for(j=0;j<=N;j++){th=Math.min(j*step,thEnd);pts.push([PX(th),PY(th),Math.cos(th)>=0]);}
  function strokeRun(run,front){
    if(run.length<2)return;
    ctx.beginPath();ctx.moveTo(run[0][0],run[0][1]);
    for(var z=1;z<run.length;z++)ctx.lineTo(run[z][0],run[z][1]);
    ctx.stroke();
    if(front){
      ctx.strokeStyle=l1shade(color,gl+10);ctx.lineWidth=lw*0.35;
      ctx.beginPath();ctx.moveTo(run[0][0],run[0][1]);
      for(var z2=1;z2<run.length;z2++)ctx.lineTo(run[z2][0],run[z2][1]);
      ctx.stroke();
      ctx.strokeStyle=color;ctx.lineWidth=lw;
    }
  }
  function pass(front){
    var run=[],q;
    ctx.strokeStyle=front?color:l1shade(color,-gl-24);
    ctx.lineWidth=front?lw:lw*0.9;
    for(q=0;q<pts.length;q++){
      if(pts[q][2]===front)run.push(pts[q]);
      else{strokeRun(run,front);run=[];}
    }
    strokeRun(run,front);
  }
  pass(false);pass(true);
  ctx.restore();
  return {top:{x:x,y:y0},bottom:{x:x,y:y1}};
};

/* meter_side: 侧视教材测力计（来源 C7V6 exp-bench-core C7V6 参照图sprite本体+参数化覆盖件，及程序化回退体；全要素：刻度/指针/调零螺丝/吊环/拉杆/挂钩）
 * (x,y)=本体顶面中心（悬挂件顶锚点，向下绘制）；opt.mode='balance' 参照图sprite本体（img未加载自动回退程序化体）| 'spring' 程序化体（半透壳露内簧+调零螺丝）；
 * opt.bodyH 本体高；opt.r 读数N；opt.range 量程默认5；opt.flash 超限红闪秒；opt.img 页面已加载Image（可选，避免双图竞态）；opt.blRef 弹簧ext参考高（zoom用，=场景L.BL）
 * 返回 {bodyW,py,hookY,tabTop,ext,ready}；变体白名单: mode/bodyH/r/range/flash/img/blRef
 */
var L1_METER_CBS=[];
var L1_METER_IMG=new Image();
L1_METER_IMG.onload=function(){L1_METER_CBS.forEach(function(f){try{f()}catch(e){}});};
L1_METER_IMG.src='assets/meter_body.png?v=20261117';
var L1_MB={spring_top:0.3750,strip_top:0.4406,zero:0.4501,five:0.9024,slot_x0:0.4561,slot_x1:0.5501,face_cx:0.4992};
var L1_TAB_WF=0.4777,L1_TAB_HF=0.376,L1_HOLE_YF=0.1418,L1_HOLE_RF=0.074,L1_WIRE_U=649;
function l1meterSlot(hx,bodyW){return {l:hx+(L1_MB.slot_x0-0.5)*bodyW,r:hx+(L1_MB.slot_x1-0.5)*bodyW};}
function l1meterSpring(ctx,hx,top,bodyW,bodyH,py){
  var y0=top+L1_MB.spring_top*bodyH,y1=py-2,sl=l1meterSlot(hx,bodyW);
  var lw=Math.max(1,bodyW*0.012),l=sl.l+lw,r=sl.r-lw,c=(sl.l+sl.r)/2;
  ctx.save();
  ctx.strokeStyle='#4a4a4a';ctx.lineWidth=lw;ctx.lineJoin='round';ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(c,y0);
  if(y1-y0<4)ctx.lineTo(c,Math.max(y0+1,y1));
  else{
    var seg=(y1-y0)/14;
    for(var i=0;i<14;i++)ctx.lineTo(i%2===0?r:l,y0+seg*(i+1));
    ctx.lineTo(c,y1);
  }
  ctx.stroke();ctx.restore();
}
function l1meterRod(ctx,hx,top,bodyW,bodyH,py,ext){
  var tabTop=top+bodyH-0.02*bodyH+ext;
  ctx.save();
  ctx.strokeStyle='#8595a8';ctx.lineWidth=Math.max(1.4,bodyW*0.022);ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(hx,py);ctx.lineTo(hx,tabTop+1);ctx.stroke();
  ctx.restore();
}
function l1meterPointer(ctx,hx,top,bodyW,bodyH,py){
  var sl=l1meterSlot(hx,bodyW),e=0.06*bodyW,th=Math.max(2,bodyH*0.006);
  ctx.save();
  ctx.fillStyle='#d92b2b';ctx.fillRect(sl.l-e,py-th/2,(sl.r-sl.l)+e*2,th);
  ctx.fillStyle='#20242a';ctx.fillRect(hx-0.025*bodyW,py+th/2,0.05*bodyW,0.012*bodyH);
  ctx.restore();
}
function l1meterTabHook(ctx,hx,top,bodyW,bodyH,ext){
  var tabW=L1_TAB_WF*bodyW,tabH=L1_TAB_HF*bodyW;
  var tabTop=top+bodyH-0.02*bodyH+ext,tabX=hx-tabW/2;
  var rb=Math.min(tabW/2,tabH),by=tabTop+tabH,u=bodyW/L1_WIRE_U;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tabX,tabTop);ctx.lineTo(tabX+tabW,tabTop);
  ctx.lineTo(tabX+tabW,by-rb);
  ctx.arcTo(tabX+tabW,by,tabX+tabW-rb,by,rb);
  ctx.lineTo(tabX+rb,by);
  ctx.arcTo(tabX,by,tabX,by-rb,rb);
  ctx.closePath();
  ctx.fillStyle='rgb(220,218,221)';ctx.fill();
  ctx.fillStyle='rgb(202,200,203)';ctx.fillRect(tabX,tabTop,tabW,tabH*0.12);
  ctx.fillStyle='#fff';l1circ(ctx,hx,tabTop+L1_HOLE_YF*bodyW,L1_HOLE_RF*bodyW);ctx.fill();
  function wire(){
    ctx.beginPath();
    ctx.moveTo(hx,by+4*u);
    ctx.bezierCurveTo(hx-60*u,by+40*u,hx-151*u,by+120*u,hx-151*u,by+178*u);
    ctx.bezierCurveTo(hx-151*u,by+260*u,hx-90*u,by+331*u,hx-32*u,by+331*u);
    ctx.bezierCurveTo(hx+40*u,by+331*u,hx+128*u,by+270*u,hx+128*u,by+208*u);
  }
  ctx.lineCap='round';
  ctx.strokeStyle='#3f3f3f';ctx.lineWidth=0.0123*bodyW;wire();ctx.stroke();
  ctx.strokeStyle='#fff';ctx.lineWidth=0.0062*bodyW;wire();ctx.stroke();
  ctx.restore();
  return by+0.51*bodyW;
}
function l1meterFlash(ctx,hx,top,bodyW,bodyH,flash){
  if(!(flash>0)||Math.floor(flash*10)%2!==0)return;
  ctx.save();ctx.fillStyle='rgba(220,38,38,.28)';
  l1rr(ctx,hx-bodyW/2,top,bodyW,bodyH,8);ctx.fill();ctx.restore();
}
PROPS.meter_side=function(ctx,x,y,opt){
  opt=opt||{};
  var img=opt.img||L1_METER_IMG;
  var ready=img.complete&&img.naturalWidth>0;
  var bodyH=opt.bodyH||260,range=opt.range||5,r=opt.r||0,flash=opt.flash||0;
  var blRef=opt.blRef||bodyH;
  function bwF(bh){return bh*(img.naturalWidth||165)/(img.naturalHeight||800);}
  function extF(bh){return bh*(1-86/blRef)*l1clamp(r,0,range)/range;}
  if((opt.mode||'balance')==='balance'&&ready){
    var bw=bwF(bodyH),e=extF(bodyH);
    ctx.drawImage(img,x-bw/2,y,bw,bodyH);
    var z=y+L1_MB.zero*bodyH,f=y+L1_MB.five*bodyH;
    var py=z+(f-z)*l1clamp(r,0,range)/range;
    l1meterSpring(ctx,x,y,bw,bodyH,py);
    l1meterRod(ctx,x,y,bw,bodyH,py,e);
    l1meterPointer(ctx,x,y,bw,bodyH,py);
    var hookY=l1meterTabHook(ctx,x,y,bw,bodyH,e);
    l1meterFlash(ctx,x,y,bw,bodyH,flash);
    return {bodyW:bw,py:py,hookY:hookY,tabTop:y+bodyH-0.02*bodyH+e,ext:e,ready:true};
  }
  var bw2=l1clamp(Math.round(bodyH*0.40),44,64);
  var bt=y;
  ctx.strokeStyle='#3f4954';ctx.lineWidth=3.4;ctx.lineCap='round';
  l1circ(ctx,x,bt-9,7.5);ctx.stroke();
  ctx.fillStyle='#8595a8';l1rr(ctx,x-6,bt-2,12,5,2);ctx.fill();
  ctx.fillStyle='#3f4954';l1rr(ctx,x+bw2/2-2,bt+6,10,7,2.5);ctx.fill();
  ctx.strokeStyle='#828d99';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(x+bw2/2+1,bt+9.5);ctx.lineTo(x+bw2/2+6,bt+9.5);ctx.stroke();
  ctx.fillStyle='rgba(244,246,248,.55)';l1rr(ctx,x-bw2/2,bt,bw2,bodyH,8);ctx.fill();
  var flashing=flash>0&&Math.floor(flash*10)%2===0;
  ctx.strokeStyle=flashing?'#dc2626':'#8595a8';ctx.lineWidth=flashing?3.5:2.2;
  l1rr(ctx,x-bw2/2,bt,bw2,bodyH,8);ctx.stroke();
  l1txt(ctx,'条型测力计',x,bt+11,'#28323d',9.5,'center');
  l1txt(ctx,'J14003 · 量程5N',x,bt+22,'#6b7885',7.5,'center');
  var sTop=bt+62,sLen=bodyH-86;
  var py2=sTop+sLen*l1clamp(r,0,range)/range;
  PROPS.spring_helix(ctx,x,bt+26,{ext:(py2-2)-(bt+26),sw:11,color:'#b9c5d1',k:1.1,turns:7});
  ctx.fillStyle='rgba(255,255,255,.8)';l1rr(ctx,x-12,sTop-10,24,sLen+18,4);ctx.fill();
  ctx.strokeStyle='#8595a8';ctx.lineWidth=2.6;
  var hookY2=bt+bodyH+8+(bodyH-86)*l1clamp(r,0,range)/range;
  ctx.beginPath();ctx.moveTo(x,py2-2);ctx.lineTo(x,hookY2);ctx.stroke();
  l1txt(ctx,'N',x-bw2/2+9,sTop-6,'#6b7885',8,'center');
  l1txt(ctx,'gf',x+bw2/2-11,sTop-6,'#6b7885',8,'center');
  for(var i=0;i<=10;i++){
    var yy=sTop+sLen*i/10,major=i%2===0;
    ctx.strokeStyle='#334155';ctx.lineWidth=major?1.6:1;
    ctx.beginPath();ctx.moveTo(x-bw2/2+3,yy);ctx.lineTo(x-bw2/2+(major?13:8),yy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+bw2/2-3,yy);ctx.lineTo(x+bw2/2-(major?13:8),yy);ctx.stroke();
    if(major){
      l1txt(ctx,String(i/2),x-bw2/2+15,yy,i===0?'#dc2626':'#334155',8.5);
      l1txt(ctx,String(Math.round(i*51)),x+bw2/2-15,yy,i===0?'#dc2626':'#334155',7.5,'right');
    }
  }
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x-bw2/2+3,sTop);ctx.lineTo(x-bw2/2+14,sTop);ctx.stroke();
  l1txt(ctx,'分度0.1N',x,sTop+sLen+11,'#6b7885',7,'center');
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2.4;
  ctx.beginPath();ctx.moveTo(x-bw2/2+3,py2);ctx.lineTo(x+bw2/2-3,py2);ctx.stroke();
  ctx.fillStyle='#dc2626';l1circ(ctx,x-bw2/2+6,py2,2.6);ctx.fill();
  ctx.strokeStyle='#8595a8';ctx.lineWidth=2.8;
  ctx.beginPath();ctx.moveTo(x,hookY2);
  ctx.arc(x+4,hookY2+2,4,Math.PI,0,true);ctx.stroke();
  return {bodyW:bw2,py:py2,hookY:hookY2,tabTop:null,ext:(bodyH-86)*l1clamp(r,0,range)/range,ready:false};
};
PROPS.meter_side.IMG=L1_METER_IMG;
PROPS.meter_side.G={MB:L1_MB,TAB_WF:L1_TAB_WF,TAB_HF:L1_TAB_HF,HOLE_YF:L1_HOLE_YF,HOLE_RF:L1_HOLE_RF,WIRE_U:L1_WIRE_U,slot:l1meterSlot};
PROPS.meter_side.onLoad=function(cb){L1_METER_CBS.push(cb);};

})(typeof window !== 'undefined' ? window : globalThis);

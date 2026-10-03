(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
PROPS.SPRITE_VER=53;
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var W=960,H=520,DPR=1;
var A_MAX=35*Math.PI/180,PI2=Math.PI*2;
var pen={x:150,y:0,h:70,on:false};
var showRay=true,paused=false,pulse={on:false,t0:0};
var rafId=0,lastDeg=99;
var q={}; location.search.replace(/[?&]([^=&]+)=([^&]*)/g,function(_,k,v){q[k]=decodeURIComponent(v);});
var initialAngle=0,angle=0;
if(q.ang){ initialAngle=Math.max(-A_MAX,Math.min(A_MAX,parseFloat(q.ang)*Math.PI/180)); angle=initialAngle; }
// 蔡总 2026-10-04: 初始状态=空实验台+笔关闭; ?on/?place 参数自动逻辑下线(复验走 __c4s1dbg.place)
var NAT={laser_pen:{w:324,h:90},smoke_box:{w:800,h:516},water_tank:{w:800,h:310},glass_brick:{w:800,h:631}};
var BTN_FX=0.77006,BTN_FY=0.35;
var toolbox=PROPS.toolbox.create({card:{x:16,y:16,w:220,h:92,r:10,fill:'#dce6f2',stroke:'#b8c6da'},items:[{id:'glass_brick',x:40,y:58},{id:'water_tank',x:110,y:58},{id:'smoke_box',x:180,y:58}],fit:56,nat:NAT});
var media=[];
var dragInfo=null,startPt=null;
var GRAVITY=2600;

function typeOf(id){ return {smoke_box:'smoke',water_tank:'water',glass_brick:'glass'}[id]; }
function nOf(id){ return {smoke_box:1,water_tank:1.33,glass_brick:1.5}[id]; }

function benchTopY(){ return H*0.80; }
function benchH(){ return H*0.04; }
function rand(seed){ var x=Math.sin(seed)*10000; return x-Math.floor(x); }
function easeOut(t){ return 1-Math.pow(1-Math.min(1,t),3); }

function stageSize(id){
  if(id==='water_tank'){ var w=Math.round(W*0.34); var h=Math.round(NAT[id].h*(w/NAT[id].w)); return {w:w,h:h}; }
  var h=Math.round(H*0.30),w=Math.round(NAT[id].w*h/NAT[id].h);
  return {w:w,h:h};
}
function setActiveSize(m){ var s=stageSize(m.id); m.w=s.w; m.h=s.h; }

function bbox(m){ return {L:m.x-m.w/2,R:m.x+m.w/2,T:m.y-m.h,B:m.y}; }

function initMedia(){
  media=[];
  toolbox.slots.forEach(function(s){
    var m={id:s.id,t:typeOf(s.id),n:nOf(s.id),state:'stored',spawn:performance.now(),liftT:0};
    m.w=s.w; m.h=s.h;
    var pos=toolbox.storedPos(s.id);
    m.storedX=Math.round(pos.x); m.storedY=Math.round(pos.y);
    m.x=m.storedX; m.y=m.storedY;
    media.push(m);
  });
}

function penMetrics(){ var s=pen.h/90,w=324*s,h=90*s; return {w:w,h:h,ax:w*0.4799,ay:-h*0.65,bx:(BTN_FX-0.5)*w,by:-(1-BTN_FY)*h}; }
function emitPt(){ var m=penMetrics(),c=Math.cos(angle),s=Math.sin(angle); return {x:pen.x+m.ax*c-m.ay*s,y:pen.y+m.ax*s+m.ay*c}; }
function btnWorld(){ var m=penMetrics(),c=Math.cos(angle),s=Math.sin(angle); return {x:pen.x+m.bx*c-m.by*s,y:pen.y+m.bx*s+m.by*c,r:Math.max(5,m.h/90*12)}; }

function resize(){ DPR=window.devicePixelRatio||1; var r=cv.getBoundingClientRect(); W=Math.max(640,r.width); H=Math.max(360,r.height); cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); pen.y=Math.min(benchTopY(),Math.max(120,pen.y)); draw(); }

function rectOf(m){
  var L=m.x-m.w/2,R=m.x+m.w/2,T=m.y-m.h,B=m.y;
  if(m.t==='smoke') return {xL:L+m.w*0.06,xR:L+m.w*0.94,yTop:T+m.h*0.42,yBot:T+m.h*0.95};
  if(m.t==='glass') return {xL:L+m.w*0.03,xR:R-m.w*0.03,yTop:T+m.h*0.03,yBot:B-m.h*0.03};
  var TK=PROPS.TANK; return {xL:m.x-m.w*(0.5-TK.insetL),xR:m.x+m.w*(0.5-TK.insetR),yTop:m.y-(1-TK.front)*m.h,yBot:m.y};
}
function ptInRect(p,r){ return p.x>=r.xL && p.x<=r.xR && p.y>=r.yTop && p.y<=r.yBot; }
// 蔡总 2026-10-04: 液面上方是空气,光路不可见→水介质矩形=液面到内底
var WATER_LVL=0.6;
function mediumRectOf(m){
  var r=rectOf(m);
  if(m.t==='water'){
    var TK=PROPS.TANK, yf=TK.front+(1-WATER_LVL)*(TK.bot-TK.front);
    r={xL:r.xL,xR:r.xR,yTop:m.y-(1-yf)*m.h,yBot:r.yBot};
  }
  return r;
}
function rayRectEntry(p,a,r){
  var c=Math.cos(a),s=Math.sin(a),tMin=Infinity;
  if(c>1e-6){ var t=(r.xL-p.x)/c,yy=p.y+t*s; if(t>1e-3 && yy>=r.yTop && yy<=r.yBot && t<tMin) tMin=t; }
  else if(c<-1e-6){ var t=(r.xR-p.x)/c,yy=p.y+t*s; if(t>1e-3 && yy>=r.yTop && yy<=r.yBot && t<tMin) tMin=t; }
  if(s>1e-6){ var t=(r.yTop-p.y)/s,xx=p.x+t*c; if(t>1e-3 && xx>=r.xL && xx<=r.xR && t<tMin) tMin=t; }
  else if(s<-1e-6){ var t=(r.yBot-p.y)/s,xx=p.x+t*c; if(t>1e-3 && xx>=r.xL && xx<=r.xR && t<tMin) tMin=t; }
  return tMin===Infinity?null:tMin;
}
function rectExit(p,a,r){
  var c=Math.cos(a),s=Math.sin(a),tMin=Infinity,side='';
  if(c>1e-6){ var t=(r.xR-p.x)/c; if(t>1e-3 && t<tMin){tMin=t;side='r';} }
  else if(c<-1e-6){ var t=(r.xL-p.x)/c; if(t>1e-3 && t<tMin){tMin=t;side='l';} }
  if(s>1e-6){ var t=(r.yBot-p.y)/s; if(t>1e-3 && t<tMin){tMin=t;side='b';} }
  else if(s<-1e-6){ var t=(r.yTop-p.y)/s; if(t>1e-3 && t<tMin){tMin=t;side='t';} }
  return {pt:{x:p.x+c*tMin,y:p.y+s*tMin},side:side};
}
function refractIn(a,n){ if(n<=1) return a; var si=Math.sin(a)/n; return Math.asin(Math.max(-1,Math.min(1,si))); }
function boundaryEnd(p,a){
  var x1=W-16,k=Math.tan(a),y1=p.y+(x1-p.x)*k;
  if(y1<10){ y1=10; x1=p.x+(y1-p.y)/(k||1e-6); } else if(y1>H-10){ y1=H-10; x1=p.x+(y1-p.y)/(k||1e-6); }
  return {x:x1,y:y1};
}
function computePath(p0,a0){
  var segs=[],p=p0,ang=a0,internal=0;
  while(internal<3){
    var c=Math.cos(ang),s=Math.sin(ang);
    p={x:p.x+c*1e-3,y:p.y+s*1e-3};
    var inside=null;
    for(var i=0;i<media.length;i++){ var m=media[i]; if(m.state!=='active') continue; var r=mediumRectOf(m); if(ptInRect(p,r)){ inside={m:m,r:r}; break; } }
    if(inside){
      var ia=refractIn(ang,inside.m.n),ex=rectExit(p,ia,inside.r);
      segs.push({a:p,b:ex.pt,t:inside.m.t,n:inside.m.n,m:inside.m});
      p=ex.pt; internal++; continue;
    }
    var best=null,tMin=Infinity;
    for(var i=0;i<media.length;i++){ var m=media[i]; if(m.state!=='active') continue; var r=mediumRectOf(m); var t=rayRectEntry(p,ang,r); if(t!=null && t<tMin){ tMin=t; best={m:m,r:r}; } }
    if(!best){ segs.push({a:p,b:boundaryEnd(p,ang),t:'air',n:1,m:null}); break; }
    var en={x:p.x+c*tMin,y:p.y+s*tMin};
    segs.push({a:p,b:en,t:'air',n:1,m:null});
    var ia=refractIn(ang,best.m.n),ex=rectExit(en,ia,best.r);
    segs.push({a:en,b:ex.pt,t:best.m.t,n:best.m.n,m:best.m});
    p=ex.pt; ang=a0; internal++;
  }
  if(internal>=3) segs.push({a:p,b:boundaryEnd(p,ang),t:'air',n:1,m:null});
  return segs;
}

function localPt(e){ var r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; }
function spot(x,y,R,c,h){ var g=ctx.createRadialGradient(x,y,0,x,y,R); g.addColorStop(0,c); g.addColorStop(1,h); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,R,0,PI2); ctx.fill(); }

// 蒸汽雾：参照 可交互教材/器材制作库.md 条目9（软边sprite贴片雾，c3s4 蔡总验收版）2D 适配：
// N 软边贴片 + 四段生命周期(淡入/持/淡出防popping) + 低alpha靠重叠出浓度 + 出生区偏盒中下自下而上弥漫
var VAPOR_TEX=null;
function vaporTex(){
  if(VAPOR_TEX) return VAPOR_TEX;
  var cv=document.createElement('canvas'); cv.width=cv.height=128;
  var c=cv.getContext('2d');
  var g=c.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(232,236,240,0.90)');
  g.addColorStop(0.45,'rgba(216,223,230,0.45)');
  g.addColorStop(1,'rgba(216,223,230,0)');
  c.fillStyle=g; c.fillRect(0,0,128,128);
  VAPOR_TEX=cv; return cv;
}
function seededV(i){ var x=Math.sin(i*12.9898+78.233)*43758.5453; return x-Math.floor(x); }
// 蔡总 2026-10-03:烟雾沿盒内壁环流运动+行移密度波(时而密时而疏)
function updateSmokePuffs(m){
  var r=rectOf(m),rw=r.xR-r.xL,rh=r.yBot-r.yTop,t=performance.now()*0.001;
  if(!m.puffs){
    m.puffs=[];
    for(var i=0;i<90;i++){
      m.puffs.push({
        u0:seededV(i*11),
        sp:0.010+0.014*seededV(i*11+2),
        rad:0.08+0.60*seededV(i*11+1),
        sway:seededV(i*11+5)*6.283,
        sz:0.14+0.20*seededV(i*11+6),
        wph:seededV(i*11+4)*6.283
      });
    }
  }
  var cx=(r.xL+r.xR)/2, cy=(r.yTop+r.yBot)/2;
  var ix=r.xL+0.06*rw, iy=r.yTop+0.06*rh, iw=rw*0.88, ih=rh*0.88;
  var per=2*(iw+ih);
  for(var i=0;i<m.puffs.length;i++){
    var p=m.puffs[i];
    var u=(p.u0+t*p.sp)%1;
    var d=u*per, lx, ly;
    if(d<iw){lx=ix+d;ly=iy;}
    else if(d<iw+ih){lx=ix+iw;ly=iy+(d-iw);}
    else if(d<2*iw+ih){lx=ix+iw-(d-iw-ih);ly=iy+ih;}
    else {lx=ix;ly=iy+ih-(d-2*iw-ih);}
    p.x=lx+(cx-lx)*p.rad*0.8+Math.sin(t*0.6+p.sway)*0.02*rw;
    p.y=ly+(cy-ly)*p.rad*0.8+Math.cos(t*0.5+p.sway)*0.02*rh;
    var wave=0.5+0.5*Math.sin(6.283*(2*u-t*0.10)+p.wph*0.25);
    p.e=0.30+0.70*wave;
    p.r=p.sz*rh*(0.8+0.4*wave);
  }
}
function smokeDensity(x,y,m){
  if(!m.puffs) return 0;
  var d=0.08;
  for(var i=0;i<m.puffs.length;i++){
    var p=m.puffs[i]; if(!p.e||p.e<=0) continue;
    var dx=x-p.x,dy=y-p.y,rr=0.7*p.r;
    d+=0.30*p.e*Math.exp(-(dx*dx+dy*dy)/(2*rr*rr));
  }
  return Math.min(1,d);
}
function drawSmokeDrift(m){
  updateSmokePuffs(m);
  var r=rectOf(m),rw=r.xR-r.xL,rh=r.yBot-r.yTop;
  var tex=vaporTex();
  ctx.save(); ctx.beginPath(); ctx.rect(r.xL,r.yTop,rw,rh); ctx.clip();
  var tb=performance.now()*0.001;
  ctx.fillStyle='rgba(190,196,202,'+(0.12+0.05*Math.sin(tb*0.35)).toFixed(3)+')'; ctx.fillRect(r.xL,r.yTop,rw,rh);
  for(var i=0;i<m.puffs.length;i++){
    var p=m.puffs[i]; if(!p.e||p.e<=0) continue;
    ctx.globalAlpha=0.50*p.e;
    ctx.drawImage(tex,p.x-p.r,p.y-p.r,p.r*2,p.r*2);
  }
  ctx.globalAlpha=1;
  ctx.restore();
}
function drawBeamSeg(p0,p1,t,m){
  if(t==='air') return;
  var dx=p1.x-p0.x,dy=p1.y-p0.y,a=Math.atan2(dy,dx),len=Math.hypot(dx,dy);
  var h=m?m.h:300;
  ctx.save(); ctx.lineCap='round'; ctx.translate(p0.x,p0.y); ctx.rotate(a);
  if(t==='smoke'){
    for(var i=0;i<24;i++){
      var u=i/24*len,v=(i+1)/24*len;
      var mx=(u+v)/2;
      var worldX=p0.x+Math.cos(a)*mx,worldY=p0.y+Math.sin(a)*mx;
      var sd=0; for(var j=0;j<media.length;j++) if(media[j].t==='smoke' && media[j].state==='active'){ sd=Math.max(sd,smokeDensity(worldX,worldY,media[j])); }
      var alphaMul=0.25+0.75*Math.min(1,sd*1.6);
      var coreW=sd<0.25?0.8:1.0;
      var mul=alphaMul*Math.pow(0.94,Math.floor(i/4));
      ctx.strokeStyle='rgba(255,120,110,'+(0.50*mul)+')'; ctx.lineWidth=0.10*h*mul+3; ctx.beginPath(); ctx.moveTo(u,0); ctx.lineTo(v,0); ctx.stroke();
      ctx.strokeStyle='rgba(230,40,30,'+(0.95*mul)+')'; ctx.lineWidth=coreW*(0.030*h*mul+1.5); ctx.beginPath(); ctx.moveTo(u,0); ctx.lineTo(v,0); ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,'+(0.90*mul)+')'; ctx.lineWidth=coreW*(0.010*h*mul+0.5); ctx.beginPath(); ctx.moveTo(u,0); ctx.lineTo(v,0); ctx.stroke();
      if(sd>0.6){
        ctx.strokeStyle='rgba(255,190,180,'+(0.10*sd)+')'; ctx.lineWidth=0.16*h;
        ctx.beginPath(); ctx.moveTo(u,0); ctx.lineTo(v,0); ctx.stroke();
      }
    }
  } else if(t==='water'){
    // 蔡总 2026-10-03: 光路均匀(不再先粗后细); 散射比玻璃砖大一点, 随浊度增大
    var tb=typeof turbidity!=='undefined'?turbidity:0;
    ctx.strokeStyle='rgba(255,150,140,'+(0.35+0.30*tb)+')'; ctx.lineWidth=0.06*h*(1+1.5*tb)+4; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len,0); ctx.stroke();
    ctx.strokeStyle='rgba(225,35,25,.95)'; ctx.lineWidth=0.030*h+1.5; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len,0); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=0.010*h+0.5; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len,0); ctx.stroke();
  } else if(t==='glass'){
    ctx.strokeStyle='rgba(255,90,80,.55)'; ctx.lineWidth=0.014*h; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len,0); ctx.stroke();
    spot(0,0,0.02*h,'rgba(255,255,255,1)','rgba(255,60,50,0)'); spot(0,0,0.06*h,'rgba(255,90,80,.65)','rgba(255,90,80,0)');
    spot(len,0,0.02*h,'rgba(255,255,255,1)','rgba(255,60,50,0)'); spot(len,0,0.06*h,'rgba(255,90,80,.65)','rgba(255,90,80,0)');
  }
  ctx.restore();
}
function arrow(x,y,a){ ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.strokeStyle='#22c55e'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(-9,-5); ctx.lineTo(0,0); ctx.lineTo(-9,5); ctx.stroke(); ctx.restore(); }
function drawArrows(segs){ if(!showRay) return; for(var i=0;i<segs.length;i++){ var s=segs[i]; if(s.t==='air') continue; arrow((s.a.x+s.b.x)/2,(s.a.y+s.b.y)/2,Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x)); } }
function drawPulse(segs){
  if(!pen.on || !pulse.on) return;
  var e=performance.now()-pulse.t0,s=e*0.45,pos=null;
  for(var i=0;i<segs.length;i++){ var p0=segs[i].a,p1=segs[i].b,L=Math.hypot(p1.x-p0.x,p1.y-p0.y)*segs[i].n; if(segs[i].t==='air'){ s-=L; continue; } if(s<=L){ var u=s/L; pos={x:p0.x+(p1.x-p0.x)*u,y:p0.y+(p1.y-p0.y)*u}; break; } s-=L; }
  if(!pos){ pulse.on=false; return; }
  spot(pos.x,pos.y,12,'rgba(255,100,80,.35)','rgba(255,100,80,0)');
  ctx.fillStyle='#ff6b5b'; ctx.beginPath(); ctx.arc(pos.x,pos.y,6,0,PI2); ctx.fill();
}
function drawPen(){
  PROPS.laser_pen(ctx,pen.x,pen.y,{h:pen.h,angle:angle*180/Math.PI,dir:1,beam:false});
  var b=btnWorld();
  ctx.save();
  if(pen.on){ spot(b.x,b.y,b.r-1,'rgba(160,25,25,1)','rgba(160,25,25,0)'); }
  else { spot(b.x,b.y,b.r,'rgba(255,70,70,1)','rgba(255,70,70,0)'); ctx.fillStyle='rgba(255,190,190,0.55)'; ctx.beginPath(); ctx.arc(b.x-b.r*0.3,b.y-b.r*0.3,b.r*0.35,0,PI2); ctx.fill(); }
  ctx.restore();
}
function drawMedia(){
  var now=performance.now(), dragM=dragInfo && dragInfo.k==='med'?dragInfo.m:null;
  for(var i=0;i<media.length;i++){
    var m=media[i],lift=0;
    if(m.liftT){ var t=(now-m.liftT)/120; if(t>=1) m.liftT=0; else lift=-5*easeOut(Math.min(1,t)); }
    var h=m.h, y=m.y+lift;
    if(m===dragM && (dragM.state==='active'||dragM.state==='falling')){
      ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(m.x,m.y+4,m.w*0.4,8,0,0,PI2); ctx.fill();
      y-=4;
    }
    if(m.id==='water_tank') PROPS.water_tank(ctx,m.x,y,{h:h,water:WATER_LVL,turbid:turbidity}); // 蔡总2026-10-04:水量3/5够只能少不能多(参照图0.77→取0.6)
    else PROPS[m.id](ctx,m.x,y,{h:h});
  }
}

var turbidity=0; // 蔡总 2026-10-03 浊度滑杆 0..1
function updateTurbidUI(){
  var grp=document.getElementById('grp-turbid'); if(!grp) return;
  var on=false;
  for(var i=0;i<media.length;i++) if(media[i].id==='water_tank' && (media[i].state==='active'||media[i].state==='falling')) on=true;
  grp.style.display=on?'':'none';
}
(function(){
  var rng=document.getElementById('rng-turbid');
  if(rng) rng.addEventListener('input',function(){ turbidity=rng.value/100; var v=document.getElementById('turbid-val'); if(v) v.textContent=rng.value; });
})();
function draw(){
  updateTurbidUI();
  PROPS.bench(ctx,W,H);
  toolbox.drawCard(ctx);
  var p0=emitPt(),segs=computePath(p0,angle);
  drawMedia();
  for(var i=0;i<media.length;i++) if(media[i].t==='smoke' && media[i].state==='active') drawSmokeDrift(media[i]);
  if(pen.on){ for(var i=0;i<segs.length;i++) drawBeamSeg(segs[i].a,segs[i].b,segs[i].t,segs[i].m); }
  drawPen();
  if(pen.on){ var e=emitPt(); spot(e.x,e.y,4,'rgba(255,80,70,1)','rgba(255,80,70,0)'); }
  if(pen.on) drawArrows(segs);
  drawPulse(segs);
}

function loop(){ if(paused) return; draw(); rafId=requestAnimationFrame(loop); }

function supportY(m){
  var support=benchTopY(),b=bbox(m);
  for(var j=0;j<media.length;j++){
    var o=media[j]; if(o===m || (o.state!=='active' && o.state!=='falling')) continue;
    var ob=bbox(o);
    if(b.L<ob.R && b.R>ob.L) support=Math.min(support, o.y-o.h);
  }
  return support;
}

function constrain(m){
  m.x=Math.max(m.w/2+6,Math.min(W-m.w/2-6,m.x));
  var floor=benchTopY(),ceil=Math.min(m.h+6,floor);
  m.y=Math.max(ceil,Math.min(floor,m.y));
}
function overlapsAny(m,skip){
  var b=bbox(m);
  for(var i=0;i<media.length;i++){
    if(i===skip || media[i].state!=='active') continue;
    var o=bbox(media[i]);
    if(b.L<o.R && b.R>o.L && b.T<o.B && b.B>o.T) return true;
  }
  return false;
}
function rectInCard(r){ return toolbox.rectInCard(r); }

function hitActiveMedia(p){
  for(var i=media.length-1;i>=0;i--){
    var m=media[i];
    if(m.state!=='active' && m.state!=='falling') continue;
    if(p.x>=m.x-m.w/2-12 && p.x<=m.x+m.w/2+12 && p.y>=m.y-m.h-12 && p.y<=m.y+12) return m;
  }
  return null;
}
cv.addEventListener('pointerdown',function(e){
  var p=localPt(e);
  var m=null;
  if(toolbox.pointInCard(p)){
    var slot=toolbox.hitSlot(p);
    if(slot){ for(var idx=media.length-1;idx>=0;idx--){ if(media[idx].id===slot.id && media[idx].state==='stored'){ m=media[idx]; break; } } }
  }
  if(!m) m=hitActiveMedia(p);
  if(m){
    if(m.state==='stored'){ m.state='active'; setActiveSize(m); constrain(m); m.liftT=performance.now(); }
    else if(m.state==='falling'){ m.state='active'; m.vy=0; }
    m.grab={dx:p.x-m.x,dy:p.y-m.y}; dragInfo={k:'med',m:m};
  } else {
    var b=btnWorld(); if(Math.hypot(p.x-b.x,p.y-b.y)<b.r+5) dragInfo={k:'btn'};
    else { var ept=emitPt(); if(Math.hypot(p.x-ept.x,p.y-ept.y)<32) dragInfo={k:'rotate'};
    else if(Math.hypot(p.x-pen.x,p.y-pen.y)<60) dragInfo={k:'movePen',ox:pen.x-p.x,oy:pen.y-p.y}; }
  }
  startPt={x:p.x,y:p.y}; if(dragInfo){ cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; }
});
cv.addEventListener('pointermove',function(e){
  if(!dragInfo) return; var p=localPt(e),d=dragInfo;
  if(d.k==='btn') return;
  if(d.k==='rotate'){ var a=Math.atan2(p.y-pen.y,p.x-pen.x); angle=Math.max(-A_MAX,Math.min(A_MAX,a)); var deg=Math.round(angle*180/Math.PI); if(deg!==lastDeg && window.playTick){ lastDeg=deg; playTick(); } }
  else if(d.k==='movePen'){ pen.x=Math.max(40,Math.min(W-40,p.x+d.ox)); pen.y=Math.max(100,Math.min(benchTopY(),p.y+d.oy)); }
  else if(d.k==='med'){
    var m=d.m, nx=p.x-m.grab.dx, ny=p.y-m.grab.dy;
    m.x=nx; m.y=ny; constrain(m);
  }
  draw();
});
window.addEventListener('pointerup',function(e){
  if(!dragInfo) return;
  if(dragInfo.k==='med'){
    var m=dragInfo.m, p=localPt(e);
    if(toolbox.pointInCard(p) || rectInCard(bbox(m))){
      var now=performance.now();
      var dist=Math.hypot(m.x-m.storedX,m.y-m.storedY);
      m.ret={x0:m.x,y0:m.y,x1:m.storedX,y1:m.storedY,t0:now,dur:Math.min(1000,dist/0.35)};
      m.state='returning';
    } else {
      m.state='falling'; m.vy=0;
    }
  }
  if(dragInfo.k==='btn'){ var p=localPt(e); if(Math.hypot(p.x-startPt.x,p.y-startPt.y)<5){ pen.on=!pen.on; if(window.playClick) playClick(); } }
  dragInfo=null; cv.style.cursor='grab'; draw();
});

function resetMedia(){ initMedia(); maybeFromQuery(); }
function maybeFromQuery(){ /* 2026-10-04 下线:初始空台,复验用 __c4s1dbg.place */ }

var cbRay=document.getElementById('cb-ray'); if(cbRay) cbRay.addEventListener('change',function(){ showRay=cbRay.checked; });
var btnPlay=document.getElementById('btn-play'); if(btnPlay) btnPlay.addEventListener('click',function(){ pen.on=true; pulse.on=true; pulse.t0=performance.now(); if(window.playClick) playClick(); });
var btnPause=document.getElementById('btn-pause'); if(btnPause) btnPause.addEventListener('click',function(){ paused=!paused; btnPause.textContent=paused?'继续':'暂停'; if(window.playClick) playClick(); if(!paused) rafId=requestAnimationFrame(loop); });
var btnReset=document.getElementById('btn-reset'); if(btnReset) btnReset.addEventListener('click',function(){ angle=initialAngle; lastDeg=99; pen.on=false; pulse.on=false; pen.x=150; pen.y=benchTopY()-14; resetMedia(); if(window.playClick) playClick(); });
var btnMute=document.getElementById('btn-mute'); if(btnMute) btnMute.addEventListener('click',function(){ window.muted=!window.muted; btnMute.textContent=window.muted?'🔇':'🔊'; if(window.playClick) playClick(); });
var btnFull=document.getElementById('btn-full'); if(btnFull) btnFull.addEventListener('click',function(){ var el=document.documentElement; if(el.requestFullscreen) el.requestFullscreen(); else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen(); if(window.playClick) playClick(); });
document.addEventListener('fullscreenchange',function(){ setTimeout(resize,60); });

['laser_pen','smoke_box','water_tank','glass_brick'].forEach(function(id){
  PROPS.onSprite(id,function(){ if(!paused) draw(); });
});

window.addEventListener('resize',resize);
initMedia(); resize(); pen.y=benchTopY()-14; maybeFromQuery(); rafId=requestAnimationFrame(loop); requestAnimationFrame(tick);

function tick(){
  var now=performance.now(),act=false,dt=1/60;
  for(var i=0;i<media.length;i++){
    var m=media[i];
    if(m.state==='returning'){
      var t=(now-m.ret.t0)/m.ret.dur;
      if(t>=1){ m.state='stored'; m.x=m.ret.x1; m.y=m.ret.y1; var slot=null; for(var k=0;k<toolbox.slots.length;k++) if(toolbox.slots[k].id===m.id){slot=toolbox.slots[k];break;} if(slot){m.w=slot.w; m.h=slot.h;} delete m.ret; }
      else { m.x=m.ret.x0+(m.ret.x1-m.ret.x0)*t; m.y=m.ret.y0+(m.ret.y1-m.ret.y0)*t; }
      act=true;
    }
    if(m.state==='falling'){
      m.vy=(m.vy||0)+GRAVITY*dt; m.y+=m.vy*dt;
      var support=supportY(m);
      if(m.y>=support){ m.y=support; m.vy=0; m.state='active'; }
      act=true;
    }
    if(m.state==='active' && m.t!=='laser_pen'){
      var dragM=dragInfo && dragInfo.k==='med'?dragInfo.m:null;
      if(m!==dragM){
        var support=supportY(m);
        if(m.y<support-1){ m.state='falling'; m.vy=0; act=true; }
      }
    }
    if(m.liftT && now-m.liftT<120) act=true;
    if(m.t==='smoke' && (m.state==='active'||m.state==='falling')) act=true;
  }
  if(act) draw();
  requestAnimationFrame(tick);
}

window.__c4s1dbg={ get media(){return media;}, get pen(){return pen;}, get W(){return W;}, get H(){return H;}, get benchY(){return benchTopY();}, emitPt:emitPt, computePath:computePath, rectOf:rectOf, segs:function(){return computePath(emitPt(),angle);}, place:function(id){ for(var i=0;i<media.length;i++) if(media[i].id===id){ var m=media[i]; m.state='active'; setActiveSize(m); m.x=Math.round(W/2); m.y=benchTopY(); constrain(m); return true; } return false; }, penOn:function(v){ pen.on=!!v; } };
})();

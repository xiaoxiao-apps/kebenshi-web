(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
PROPS.SPRITE_VER=81;
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var W=960,H=520,DPR=1;
var PI2=Math.PI*2;
var q={}; location.search.replace(/[?&]([^=&]+)=([^&]*)/g,function(_,k,v){q[k]=decodeURIComponent(v);});
// 点光源=灯罩开口中心(frac 相对 sprite 宽高, 探针见 docs 报告): fx/fy 从 sprite 左上角量
var LAMP_BULB={fx:0.40,fy:0.39};
var NAT={candle:{w:175,h:465},desk_lamp:{w:311,h:539},hand_shadow:{w:785,h:798},board1:{w:328,h:487},screen:{w:283,h:467},laser_pen:{w:324,h:90}};
var TYPE={candle:'candle',desk_lamp:'lamp',hand_shadow:'hand',board1:'board',screen:'screen',laser_pen:'laser'};
var LOCKED={candle:1,board1:1,screen:1};
// 托盘: 6槽两行三列, 卡放左上
var SLOTS=[
  {id:'candle',x:40,y:60},{id:'desk_lamp',x:110,y:60},{id:'hand_shadow',x:180,y:60},
  {id:'screen',x:40,y:122},{id:'board1',x:110,y:122},{id:'laser_pen',x:180,y:122}
];
var toolbox=PROPS.toolbox.create({card:{x:16,y:16,w:292,h:150,r:10,fill:'#dce6f2',stroke:'#b8c6da'},items:SLOTS,fit:56,nat:NAT});
var media=[];
var dragInfo=null,startPt=null,lastTick=0,fx=[];
var GRAVITY=2600;
var rafId=0;
var rayOn=true;
var holeR=14;
var mode='pinhole';
var flys=[];

function isBoard(id){ return TYPE[id]==='board'; }
function renderName(id){ if(isBoard(id)) return 'board_with_hole'; return id; }

function benchTopY(){ return H*0.80; }
function axisY(){ return Math.round(benchTopY()-H*0.30); } // axisH=0.30H, axisY=benchTopY()-axisH
function easeOut(t){ return 1-Math.pow(1-Math.min(1,t),3); }
function easeOutCubic(t){ return 1-Math.pow(1-Math.min(1,t),3); }
function easeInQuad(t){ t=Math.min(1,t); return t*t; }

function stageSize(id){
  if(id==='laser_pen'){ var w=Math.round(W*0.16); return {w:w,h:Math.round(NAT[id].h*w/NAT[id].w)}; }
  var hh=id==='screen'?0.60: id==='desk_lamp'?0.34: isBoard(id)?0.417: id==='candle'?0.32: id==='hand_shadow'?0.22:0.30;
  var h=Math.round(H*hh), w=Math.round(NAT[id].w*h/NAT[id].h);
  return {w:w,h:h};
}
function setStageSize(m){ var s=stageSize(m.id); m.w=s.w; m.h=s.h; }
function lampBulbWorldY(){ var ls=stageSize('desk_lamp'); return benchTopY()-(1-LAMP_BULB.fy)*ls.h; }
function bbox(m){ return {L:m.x-m.w/2,R:m.x+m.w/2,T:m.y-m.h,B:m.y}; }

function initMedia(){
  media=[];
  toolbox.slots.forEach(function(s){
    var m={id:s.id,t:TYPE[s.id],state:'stored',lit:false,spawn:performance.now(),liftT:0};
    m.w=s.w; m.h=s.h;
    var pos=toolbox.storedPos(s.id);
    m.storedX=Math.round(pos.x); m.storedY=Math.round(pos.y);
    m.x=m.storedX; m.y=m.storedY;
    media.push(m);
  });
}
function setDefaultLayout(){
  mode='pinhole';
  var ids=['candle','board1','screen','desk_lamp','hand_shadow','laser_pen'];
  ids.forEach(function(id){ var m=findById(id); if(m) m.lit=false; });
  function activeAt(id,fx,fy){ var m=findById(id); if(!m) return; m.state='active'; setStageSize(m); m.x=Math.round(W*fx); m.y=Math.round(fy); constrain(m); }
  activeAt('candle',0.22,benchTopY());
  activeAt('board1',0.50,benchTopY());
  activeAt('screen',0.80,benchTopY());
  ['desk_lamp','hand_shadow','laser_pen'].forEach(function(id){
    var m=findById(id); if(!m) return; m.state='stored'; m.x=m.storedX; m.y=m.storedY; var s=toolboxSlot(id); if(s){m.w=s.w;m.h=s.h;}
  });
}
function toolboxSlot(id){ for(var i=0;i<toolbox.slots.length;i++) if(toolbox.slots[i].id===id) return toolbox.slots[i]; return null; }
function switchMode(to){
  if(to===mode) return;
  var now=performance.now();
  var exitIds=mode==='pinhole'?['candle','board1']:(mode==='hand'?['desk_lamp','hand_shadow']:[]);
  var enterIds=to==='pinhole'?['candle','board1']:(to==='hand'?['desk_lamp','hand_shadow']:[]);
  exitIds.forEach(function(id){
    var m=findById(id); if(!m) return;
    flys=flys.filter(function(f){return f.m!==m;});
    m.state='flying';
    flys.push({m:m,x0:m.x,y0:m.y,x1:m.x,y1:-m.h-40,t0:now,dur:600,phase:'out'});
  });
  enterIds.forEach(function(id){
    var m=findById(id); if(!m) return;
    flys=flys.filter(function(f){return f.m!==m;});
    var tx=Math.round(W*(id==='candle'||id==='desk_lamp'?0.22:0.50));
    var ty;
    if(id==='hand_shadow'){
      var hs=stageSize('hand_shadow'); ty=Math.round(lampBulbWorldY()+hs.h/2);
    } else { ty=Math.round(benchTopY()); }
    m.state='flying'; setStageSize(m); m.x=tx; m.y=H+m.h+40;
    flys.push({m:m,x0:tx,y0:H+m.h+40,x1:tx,y1:ty,t0:now,dur:600,phase:'in'});
  });
  mode=to;
  if(window.playClick) playClick();
  draw();
}

function resize(){
  var oldW=W, oldH=H;
  DPR=window.devicePixelRatio||1; var r=cv.getBoundingClientRect(); W=Math.max(640,r.width); H=Math.max(360,r.height);
  media.forEach(function(m){
    if(m.state==='flying') return;
    if(m.state==='active'||m.state==='falling'){
      setStageSize(m);
      if(LOCKED[m.id]){ m.x=Math.round(m.x*W/oldW); m.y=benchTopY(); }
      else if(m.t==='hand'){ m.x=Math.round(m.x*W/oldW); m.y=Math.round(m.y*H/oldH); }
      constrain(m);
    }
  });
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); draw();
}

function constrain(m){
  m.x=Math.max(m.w/2+6,Math.min(W-m.w/2-6,m.x));
  if(LOCKED[m.id]){ m.y=benchTopY(); return; }
  var floor=benchTopY(),ceil=Math.min(m.h+6,floor);
  m.y=Math.max(ceil,Math.min(floor,m.y));
}
function overlapsAny(m,skip){
  var b=bbox(m);
  for(var i=0;i<media.length;i++){
    if(media[i]===skip || media[i].state!=='active') continue;
    var o=bbox(media[i]);
    if(b.L<o.R && b.R>o.L && b.T<o.B && b.B>o.T) return true;
  }
  return false;
}
function supportY(m){
  var support=benchTopY(),b=bbox(m);
  for(var j=0;j<media.length;j++){
    var o=media[j]; if(o===m || o.t==='hand' || (o.state!=='active' && o.state!=='falling')) continue;
    var ob=bbox(o);
    if(b.L<ob.R && b.R>ob.L) support=Math.min(support, o.y-o.h);
  }
  return support;
}
function findById(id){ for(var i=0;i<media.length;i++) if(media[i].id===id) return media[i]; return null; }
function activeOrFalling(id){ var m=findById(id); return m && (m.state==='active'||m.state==='falling'); }

function localPt(e){ var r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; }
function hitActiveMedia(p){
  for(var i=media.length-1;i>=0;i--){
    var m=media[i];
    if(m.state==='flying' || (m.state!=='active' && m.state!=='falling')) continue;
    if(p.x>=m.x-m.w/2-12 && p.x<=m.x+m.w/2+12 && p.y>=m.y-m.h-12 && p.y<=m.y+12) return m;
  }
  return null;
}

function bulbPos(m){
  var fx=LAMP_BULB.fx;
  if(m.id==='desk_lamp' && mode==='hand') fx=1-LAMP_BULB.fx;
  return {x:m.x+(fx-0.5)*m.w, y:m.y-(1-LAMP_BULB.fy)*m.h};
}
function handCenter(m){ return {x:m.x, y:m.y-m.h*0.5}; }
function boardHolePos(m){ var s=m.h/487; return {x:m.x+(PROPS.BOARD_HOLE.cx-0.5)*m.w, y:m.y-m.h+PROPS.BOARD_HOLE.cy*m.h, s:s}; }
function realFlameH(m){ return m.h*0.23; }
function realFlameBaseY(m){ return m.y-m.h*(1-0.258); }
function flamePos(m){ var fh=realFlameH(m); return {x:m.x, y:realFlameBaseY(m)-fh, h:fh, baseY:realFlameBaseY(m)}; }
function screenGeom(m){ return PROPS.screenGeom(m.x,m.y,m.h); }
function overlapArea(a,b){
  var ba=bbox(a),bb=bbox(b);
  var iw=Math.max(0,Math.min(ba.R,bb.R)-Math.max(ba.L,bb.L));
  var ih=Math.max(0,Math.min(ba.B,bb.B)-Math.max(ba.T,bb.T));
  return iw*ih;
}
function resolveOverlap(m){
  var ma=m.w*m.h;
  for(var i=0;i<media.length;i++){
    var o=media[i]; if(o===m||o.state!=='active') continue;
    var oa=o.w*o.h, ov=overlapArea(m,o);
    if(ov>0.5*Math.min(ma,oa)){
      var ba=bbox(m),bb=bbox(o), cxm=(ba.L+ba.R)/2, cxo=(bb.L+bb.R)/2;
      var push=Math.max(ba.R-bb.L,bb.R-ba.L)+2;
      m.x+=(cxm<cxo? -push:push); constrain(m);
    }
  }
}
function drawFeedback(now){
  for(var i=fx.length-1;i>=0;i--){
    var f=fx[i], age=(now-f.t0)/300;
    if(age>=1){ fx.splice(i,1); continue; }
    var a=1-age; ctx.save();
    if(f.t==='lamp'){
      ctx.strokeStyle='rgba(255,204,0,'+a+')'; ctx.lineWidth=2;
      var r=10+age*28;
      ctx.beginPath(); ctx.arc(f.x,f.y,r,0,PI2); ctx.stroke();
    } else {
      ctx.fillStyle='rgba(255,120,0,'+a+')';
      var r2=6+age*14;
      ctx.beginPath(); ctx.arc(f.x,f.y,r2,0,PI2); ctx.fill();
    }
    ctx.restore();
  }
}
function drawOpticalAxis(){
  // axisH=0.30H, axisY=benchTopY()-axisH
  var c=0;
  for(var i=0;i<media.length;i++) if(LOCKED[media[i].id] && media[i].state==='active') c++;
  if(c<3) return;
  var ay=axisY();
  ctx.save();
  ctx.strokeStyle='rgba(100,116,139,.5)';
  ctx.lineWidth=1.5;
  ctx.setLineDash([6,6]);
  ctx.beginPath(); ctx.moveTo(0,ay); ctx.lineTo(W,ay); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}
// 计算手影场景: 返回 {src,hand,screen,sx,m,SyC,ok} 或 null
function computeHandScene(){
  var lamp=findById('desk_lamp'), hand=findById('hand_shadow'), screen=findById('screen');
  if(!lamp || lamp.state!=='active' || !hand || hand.state!=='active' || !screen || screen.state!=='active') return null;
  if(!lamp.lit) return {missing:'lampOff',lamp:lamp,hand:hand,screen:screen};
  var P=bulbPos(lamp), Ht=handCenter(hand), sg=screenGeom(screen);
  var Sx=sg.faceX;
  if(Ht.x<=P.x || Ht.x>=Sx) return {missing:'handNoImg',lamp:lamp,hand:hand,screen:screen};
  var m=(Sx-P.x)/(Ht.x-P.x);
  if(!isFinite(m) || m<=0) return {missing:'handNoImg',lamp:lamp,hand:hand,screen:screen};
  var Sy=P.y+(Ht.y-P.y)*m;
  return {mode:'hand',missing:null,lamp:lamp,hand:hand,screen:screen,P:P,Ht:Ht,Sx:Sx,m:m,Sy:Sy,sg:sg,ok:true};
}
// 计算小孔成像场景: 蜡烛+孔板+屏
function computePinholeScene(){
  var candle=findById('candle'), board=findActiveBoard(), screen=findById('screen');
  if(!candle || candle.state!=='active' || !board || !screen || screen.state!=='active') return null;
  if(!candle.lit) return {mode:'pinhole',missing:'candleOff',candle:candle,board:board,screen:screen};
  var F=flamePos(candle), hp=boardHolePos(board), sg=screenGeom(screen);
  var u=hp.x-F.x, v=sg.faceX-hp.x;
  if(u<=0) return {mode:'pinhole',missing:'candlePos',candle:candle,board:board,screen:screen,u:u,v:v,hp:hp,sg:sg,F:F};
  if(v<=0) return {mode:'pinhole',missing:'boardPos',candle:candle,board:board,screen:screen,u:u,v:v,hp:hp,sg:sg,F:F};
  var m=v/u, hi=F.h*m;
  var holeD=holeR*2*hp.s;
  var blurD=holeD*(u+v)/u;
  var bright=Math.min(1,Math.max(0.35,Math.pow(holeD/16,2)));
  var blurEff=blurD*Math.pow(Math.min(1,Math.max(0,(holeR-6)/34)),1.35);
  return {mode:'pinhole',missing:null,candle:candle,board:board,screen:screen,F:F,hp:hp,sg:sg,u:u,v:v,m:m,hi:hi,holeD:holeD,blurD:blurD,blurEff:blurEff,bright:bright,ok:true};
}
function findActiveBoard(){ for(var i=0;i<media.length;i++) if(media[i].state==='active' && media[i].t==='board') return media[i]; return null; }
function computeScene(){ return computePinholeScene() || computeHandScene(); }
function clipToScreen(sg){
  ctx.beginPath();
  ctx.moveTo(sg.pts.TL.x,sg.pts.TL.y); ctx.lineTo(sg.pts.TR.x,sg.pts.TR.y);
  ctx.lineTo(sg.pts.BR.x,sg.pts.BR.y); ctx.lineTo(sg.pts.BL.x,sg.pts.BL.y);
  ctx.closePath(); ctx.clip();
}
function trapezoidY(sg, x, yLocal01){
  var t=(x-sg.pts.TL.x)/(sg.pts.TR.x-sg.pts.TL.x+0.001);
  var yT=sg.pts.TL.y+t*(sg.pts.TR.y-sg.pts.TL.y);
  var yB=sg.pts.BL.y+t*(sg.pts.BR.y-sg.pts.BL.y);
  return yT+yLocal01*(yB-yT);
}
function getFlameImg(){
  if(!PROPS._flameBuf){
    if(!PROPS.spriteReady('candle')) return null;
    var img=PROPS.img('candle');
    var natW=175, natH=465;
    var sx=Math.round(0.36*natW), sy=Math.round(0.028*natH);
    var sw=Math.round((0.651-0.36)*natW), sh=Math.round((0.258-0.028)*natH);
    var c=document.createElement('canvas'); c.width=sw; c.height=sh;
    var c2=c.getContext('2d');
    c2.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    PROPS._flameBuf={cv:c,w:sw,h:sh,img:img};
  }
  return PROPS._flameBuf;
}
function drawCandleWithFlame(m,now){
  PROPS.candle(ctx,m.x,m.y,{h:m.h,lit:false});
  if(!m.lit) return;
  var buf=getFlameImg(); if(!buf) return;
  var fh=realFlameH(m), fw=fh*buf.w/buf.h;
  var baseY=realFlameBaseY(m);
  var rot=Math.sin(now/230)*0.045+Math.sin(now/97)*0.018;
  ctx.save();
  ctx.translate(m.x,baseY); ctx.rotate(rot);
  ctx.drawImage(buf.cv, -fw/2, -fh, fw, fh);
  ctx.restore();
}
function drawShadow(sc){
  ctx.save(); clipToScreen(sc.sg);
  if(sc.mode==='hand'){
    var handH=sc.hand.h*sc.m, handCy=sc.hand.y-sc.hand.h*0.5;
    var SyC=sc.P.y+(handCy-sc.P.y)*sc.m;
    ctx.globalAlpha=0.92;
    PROPS.hand_shadow(ctx,sc.sg.faceX,SyC+handH*0.5,{h:handH});
    ctx.globalAlpha=1;
  } else {
    var F=sc.F, hp=sc.hp, sg=sc.sg;
    var hi=sc.hi, cx=sg.faceX;
    var tipY=F.tipY!==undefined?F.tipY:F.y;
    var baseY=F.baseY!==undefined?F.baseY:(F.y+F.h);
    var tipImgY=hp.y+(hp.y-tipY)*sc.m;
    var baseImgY=hp.y+(hp.y-baseY)*sc.m;
    var midY=(tipImgY+baseImgY)/2;
    var buf=getFlameImg(); if(!buf){ ctx.restore(); return; }
    var iw=hi*buf.w/buf.h, ih=hi;
    var n=Math.min(12,Math.max(1,Math.round(sc.blurEff/2.5)));
    var layerA=Math.min(0.20, sc.bright*2.2/n);
    for(var i=0;i<n;i++){
      var ang=i*2.399963, rad=(sc.blurEff/2)*Math.sqrt((i+0.5)/n);
      ctx.save();
      ctx.translate(cx+Math.cos(ang)*rad, midY+Math.sin(ang)*rad); ctx.scale(1,-1);
      ctx.globalAlpha=layerA;
      ctx.drawImage(buf.cv, -iw/2, -ih/2, iw, ih);
      ctx.restore();
    }
    ctx.globalAlpha=1;
  }
  ctx.restore();
}
function drawRays(sc){
  if(!rayOn || sc.mode!=='pinhole') return; ctx.save();
  ctx.strokeStyle='rgba(245,158,11,0.85)'; ctx.lineWidth=2; ctx.setLineDash([]);
    var F=sc.F, hp=sc.hp, sg=sc.sg, cx=sg.faceX;
    var tipY=F.tipY!==undefined?F.tipY:F.y;
    var baseY=F.baseY!==undefined?F.baseY:(F.y+F.h);
    var tipImgY=hp.y+(hp.y-tipY)*sc.m;
    var baseImgY=hp.y+(hp.y-baseY)*sc.m;
    ctx.beginPath(); ctx.moveTo(F.x,tipY); ctx.lineTo(cx,tipImgY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(F.x,baseY); ctx.lineTo(cx,baseImgY); ctx.stroke();
  ctx.restore();
}
function drawReadout(sc){
  var x=W-16,y=70;
  ctx.save(); ctx.font='13px -apple-system,sans-serif';
  var lines,sub;
  if(sc.mode==='hand'){
    lines=['放大率 m=×'+sc.m.toFixed(1),'手距灯 u='+Math.hypot(sc.Ht.x-sc.P.x,sc.Ht.y-sc.P.y).toFixed(0)+' px'];
    sub='手近灯 → 影变大';
  } else {
    lines=['物距 u='+sc.u.toFixed(0)+' px','像距 v='+sc.v.toFixed(0)+' px','放大率 m=×'+sc.m.toFixed(1),'孔径='+holeR+'px'];
    sub='孔小像清、孔大像亮';
  }
  var tw=0; for(var i=0;i<lines.length;i++) tw=Math.max(tw,ctx.measureText(lines[i]).width);
  tw=Math.max(tw,ctx.measureText(sub).width);
  var w=tw+26,h=58+lines.length*18;
  ctx.fillStyle='rgba(255,255,255,0.94)'; ctx.strokeStyle='rgba(0,0,0,0.12)';
  ctx.beginPath(); ctx.moveTo(x-w+8,y); ctx.lineTo(x-8,y); ctx.quadraticCurveTo(x,y,x,y+8); ctx.lineTo(x,y+h-8); ctx.quadraticCurveTo(x,y+h,x-8,y+h); ctx.lineTo(x-w+8,y+h); ctx.quadraticCurveTo(x-w,y+h,x-w,y+h-8); ctx.lineTo(x-w,y+8); ctx.quadraticCurveTo(x-w,y,x-w+8,y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#1f2937'; ctx.textAlign='right';
  for(i=0;i<lines.length;i++) ctx.fillText(lines[i],x-12,y+19+i*18);
  ctx.fillStyle='#64748b'; ctx.font='11px -apple-system,sans-serif'; ctx.fillText(sub,x-12,y+23+lines.length*18);
  ctx.restore();
}
function updateHint(msg){ var el=document.getElementById('hint'); if(el && msg!==el.textContent) el.textContent=msg; }
function hintFor(sc){
  var lamp=findById('desk_lamp'),hand=findById('hand_shadow'),screen=findById('screen');
  var candle=findById('candle'), board=findActiveBoard();
  if(mode==='pinhole'){
    if(!screen||screen.state!=='active') return '点击蜡烛点燃，光幕出现火焰光斑；左右拖蜡烛/光屏改物距像距';
    if(!candle||candle.state!=='active' || !board || board.state!=='active') return '点击蜡烛点燃，光幕出现火焰光斑；左右拖蜡烛/光屏改物距像距';
    if(!candle.lit) return '点击蜡烛点燃，光幕出现火焰光斑；左右拖蜡烛/光屏改物距像距';
    if(sc && (sc.missing==='candlePos'||sc.missing==='boardPos')) return '把带孔板放到蜡烛和屏之间';
    return '移动蜡烛、孔板或屏幕，观察小孔成像';
  }
  if(mode==='hand'){
    if(!screen||screen.state!=='active') return '点击台灯点亮，光锥罩住手，光幕现黑手影；上下左右拖手看影子移动';
    if(!lamp||lamp.state!=='active' || !hand || hand.state!=='active') return '点击台灯点亮，光锥罩住手，光幕现黑手影；上下左右拖手看影子移动';
    if(!lamp.lit) return '点击台灯点亮，光锥罩住手，光幕现黑手影；上下左右拖手看影子移动';
    if(sc&&sc.missing==='handNoImg') return '把手移到灯和屏之间，才能成像';
    return '上下左右拖手，观察光幕上黑手影的移动与大小';
  }
  return '';
}
function drawTooltipHint(){
  var sc=computeScene();
  updateHint(hintFor(sc));
}
function drawMedia(){
  var now=performance.now(), dragM=dragInfo&&dragInfo.k==='med'?dragInfo.m:null;
  for(var i=0;i<media.length;i++){
    var m=media[i]; if(m.state==='stored') continue;
    var lift=0;
    if(m.liftT){ var t=(now-m.liftT)/120; if(t>=1) m.liftT=0; else lift=-5*easeOut(Math.min(1,t)); }
    var h=m.h, y=m.y+lift;
    if(m===dragM&&(dragM.state==='active')){
      ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(m.x,m.y+4,m.w*0.4,8,0,0,PI2); ctx.fill();
      y-=4;
      ctx.save(); ctx.strokeStyle='rgba(37,99,235,.5)'; ctx.lineWidth=2; ctx.strokeRect(m.x-m.w/2+1,y-m.h+1,m.w-2,m.h-2); ctx.restore();
    }
    var rn=renderName(m.id);
    if(rn==='desk_lamp') PROPS.desk_lamp(ctx,m.x,y,{h:h,lit:m.lit,glow:m.lit,dir:mode==='hand'?'left':1});
    else if(rn==='candle') drawCandleWithFlame(m,now);
    else if(rn==='hand_shadow') PROPS.hand_shadow(ctx,m.x,y,{h:h,skin:true});
    else if(rn==='screen') PROPS.screen(ctx,m.x,y,{h:h});
    else if(rn==='board_with_hole') PROPS.board_with_hole(ctx,m.x,y,{h:h,holeR:holeR});
    else if(rn==='laser_pen') PROPS.laser_pen(ctx,m.x,y,{h:h,dir:1});
  }
}
function drawLightCone(sc){
  if(!sc || sc.mode!=='hand' || !sc.lamp.lit) return;
  var P=sc.P, hand=sc.hand, sg=sc.sg;
  var handX=hand.x, handTop=hand.y-hand.h, handBot=hand.y;
  var faceX=sg.faceX;
  if(handX<=P.x || handX>=faceX) return;
  var m=(faceX-P.x)/(handX-P.x);
  var topFar=P.y+(handTop-P.y)*m, botFar=P.y+(handBot-P.y)*m;
  ctx.save();
  var g=ctx.createLinearGradient(P.x,P.y,faceX,(topFar+botFar)/2);
  g.addColorStop(0,'rgba(253,224,71,0.22)'); g.addColorStop(1,'rgba(253,224,71,0.06)');
  ctx.fillStyle=g;
  ctx.beginPath(); ctx.moveTo(P.x,P.y); ctx.lineTo(handX,handTop); ctx.lineTo(faceX,topFar); ctx.lineTo(faceX,botFar); ctx.lineTo(handX,handBot); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(253,224,71,0.45)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(P.x,P.y); ctx.lineTo(handX,handTop); ctx.lineTo(faceX,topFar); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(P.x,P.y); ctx.lineTo(handX,handBot); ctx.lineTo(faceX,botFar); ctx.stroke();
  ctx.restore();
}
function draw(){
  var now=performance.now();
  updateCtrlVisibility();
  PROPS.bench(ctx,W,H,{tone:'cool'});
  drawMedia();
  drawOpticalAxis();
  drawFeedback(performance.now());
  var sc=computeScene();
  if(sc&&sc.ok){ drawLightCone(sc); drawShadow(sc); drawRays(sc); drawReadout(sc); }
  drawTooltipHint();
}
function loop(){
  try{ draw(); }catch(err){
    if(!loop._errSeen||loop._errSeen!==String(err&&err.message)){ loop._errSeen=String(err&&err.message); console.error('draw error:',err); }
  }
  rafId=requestAnimationFrame(loop);
}
cv.addEventListener('pointerdown',function(e){
  var p=localPt(e);
  var m=hitActiveMedia(p);
  if(m){
    if(m.state==='stored'){ m.state='active'; setStageSize(m); constrain(m); m.liftT=performance.now(); }
    else if(m.state==='falling'){ m.state='active'; m.vy=0; }
    m.grab={dx:p.x-m.x,dy:p.y-m.y}; dragInfo={k:'med',m:m};
  }
  startPt={x:p.x,y:p.y}; if(dragInfo){ try{cv.setPointerCapture(e.pointerId);}catch(err){} cv.style.cursor='grabbing'; }
});
cv.addEventListener('pointermove',function(e){
  if(!dragInfo||dragInfo.k!=='med') return; var p=localPt(e),d=dragInfo,m=d.m;
  m.x=p.x-m.grab.dx; m.y=p.y-m.grab.dy; constrain(m);
  if(window.playTick){ var now=performance.now(); if(now-lastTick>80){ lastTick=now; playTick(); } }
  draw();
});
window.addEventListener('pointerup',function(e){
  if(!dragInfo || dragInfo.k!=='med'){ dragInfo=null; cv.style.cursor='grab'; draw(); return; }
  var m=dragInfo.m, p=localPt(e);
  var wasActive=(m.state==='active'||m.state==='falling');
  var dist=Math.hypot(p.x-startPt.x,p.y-startPt.y);
  if(LOCKED[m.id]){
    m.state='active'; m.vy=0;
  } else if(m.t==='hand'){
    m.state='active'; m.vy=0;
  } else {
    m.state='falling'; m.vy=0;
  }
  if(dist<5 && wasActive && (m.t==='lamp'||m.t==='candle')){
    m.lit=!m.lit; if(window.playClick) playClick();
    fx.push({x:m.x,y:m.y-m.h-18,t0:performance.now(),t:m.t});
  }
  dragInfo=null; cv.style.cursor='grab'; draw();
});

function resetAll(){
  var cbRay=document.getElementById('cb-ray'); if(cbRay) cbRay.checked=true;
  rayOn=true; holeR=14;
  if(holeSlider) holeSlider.value=14; if(holeVal) holeVal.textContent='14px';
  initMedia(); setDefaultLayout();
  draw();
}
var cbRayEl=document.getElementById('cb-ray'); if(cbRayEl) cbRayEl.addEventListener('change',function(){ rayOn=cbRayEl.checked; draw(); });
var grpHole=document.getElementById('grp-hole'), holeSlider=document.getElementById('hole-slider'), holeVal=document.getElementById('hole-val'), holeMinus=document.getElementById('hole-minus'), holePlus=document.getElementById('hole-plus');
function setHole(v){ holeR=Math.min(40,Math.max(8,Math.round(v/2)*2)); if(holeSlider) holeSlider.value=holeR; if(holeVal) holeVal.textContent=holeR+'px'; draw(); }
if(holeSlider) holeSlider.addEventListener('input',function(){ setHole(+holeSlider.value); if(window.playTick){ var n=performance.now(); if(n-lastTick>80){ lastTick=n; playTick(); } } });
if(holeMinus) holeMinus.addEventListener('click',function(){ setHole(holeR-2); if(window.playClick) playClick(); });
if(holePlus) holePlus.addEventListener('click',function(){ setHole(holeR+2); if(window.playClick) playClick(); });
function updateCtrlVisibility(){ var brd=findActiveBoard(); if(grpHole) grpHole.style.display=(mode==='pinhole'&&brd?'flex':'none'); }
var modeRadios=document.querySelectorAll('input[name="mode"]');
modeRadios.forEach(function(r){ r.addEventListener('change',function(){ if(r.checked) switchMode(r.value); }); });
var btnReset=document.getElementById('btn-reset'); if(btnReset) btnReset.addEventListener('click',function(){ resetAll(); if(window.playClick) playClick(); });
var btnMute=document.getElementById('btn-mute'); if(btnMute) btnMute.addEventListener('click',function(){ window.muted=!window.muted; btnMute.textContent=window.muted?'🔇':'🔊'; if(window.playClick) playClick(); });
var btnFull=document.getElementById('btn-full');
function syncFullBtn(){ var fs=document.fullscreenElement||document.webkitFullscreenElement; if(btnFull){ btnFull.textContent=fs?'退出全屏':'全屏'; } }
if(btnFull) btnFull.addEventListener('click',function(){
  var fs=document.fullscreenElement||document.webkitFullscreenElement;
  if(fs){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); }
  else { var el=document.documentElement; if(el.requestFullscreen) el.requestFullscreen(); else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen(); }
  if(window.playClick) playClick(); syncFullBtn();
});
document.addEventListener('fullscreenchange',function(){ setTimeout(resize,60); syncFullBtn(); });

['candle','desk_lamp','hand_shadow','board_with_hole','screen','laser_pen'].forEach(function(id){
  PROPS.onSprite(id,function(){ draw(); });
});
window.addEventListener('resize',resize);

function tick(){
  var now=performance.now(),act=false,dt=1/60;
  for(var fi=fx.length-1;fi>=0;fi--){ if(now-fx[fi].t0>=300) fx.splice(fi,1); }
  if(fx.length) act=true;
  for(var fi=flys.length-1;fi>=0;fi--){
    var f=flys[fi], t=(now-f.t0)/f.dur, m=f.m;
    if(t>=1){
      var hasNewer=flys.some(function(ff){return ff.m===m && ff!==f;});
      if(!hasNewer){
        if(f.phase==='out'){
          m.state='stored'; m.x=m.storedX; m.y=m.storedY;
          var slot=toolboxSlot(m.id); if(slot){m.w=slot.w;m.h=slot.h;}
        } else {
          m.state='active'; m.x=f.x1; m.y=f.y1; if(m.id!=='hand_shadow') constrain(m);
        }
      }
      flys.splice(fi,1); act=true; continue;
    }
    var e=f.phase==='in'?easeOutCubic(t):easeInQuad(t);
    m.x=f.x0+(f.x1-f.x0)*e; m.y=f.y0+(f.y1-f.y0)*e; act=true;
  }
  for(var i=0;i<media.length;i++){
    var m=media[i];
    if(m.state==='returning'){
      var t=(now-m.ret.t0)/m.ret.dur;
      if(t>=1){ m.state='stored'; m.x=m.ret.x1; m.y=m.ret.y1; var slot=null; for(var k=0;k<toolbox.slots.length;k++) if(toolbox.slots[k].id===m.id){slot=toolbox.slots[k];break;} if(slot){m.w=slot.w;m.h=slot.h;} delete m.ret; }
      else { m.x=m.ret.x0+(m.ret.x1-m.ret.x0)*t; m.y=m.ret.y0+(m.ret.y1-m.ret.y0)*t; }
      act=true;
    }
    if(m.state==='falling' && m.t!=='hand'){
      m.vy=(m.vy||0)+GRAVITY*dt; m.y+=m.vy*dt;
      var support=supportY(m);
      if(m.y>=support){ m.y=support; m.vy=0; m.state='active'; resolveOverlap(m); }
      act=true;
    }
    if(m.state==='active' && m.t!=='hand' && !LOCKED[m.id]){
      var dragM=dragInfo&&dragInfo.k==='med'?dragInfo.m:null;
      if(m!==dragM){
        var support=supportY(m);
        if(m.y<support-1){ m.state='falling'; m.vy=0; act=true; }
      }
    }
    if(m.liftT&&now-m.liftT<120) act=true;
  }
  if(act) draw();
  requestAnimationFrame(tick);
}

window.__c4s2dbg={
  get media(){return media;}, get W(){return W;}, get H(){return H;}, get benchY(){return benchTopY();},
  place:function(id){ var m=findById(id); if(!m) return false; m.state='active'; setStageSize(m); m.x=Math.round(W/2); m.y=benchTopY(); if(LOCKED[id]) m.y=benchTopY(); constrain(m); draw(); return true; },
  lightOn:function(id,v){ var m=findById(id); if(!m||m.state!=='active') return false; m.lit=!!v; draw(); return true; },
  get u(){ var l=findById('desk_lamp'),h=findById('hand_shadow'); if(!l||l.state!=='active'||!h||h.state!=='active') return null; return Math.hypot(handCenter(h).x-bulbPos(l).x, handCenter(h).y-bulbPos(l).y); },
  get v(){ var l=findById('desk_lamp'),s=findById('screen'); if(!l||l.state!=='active'||!s||s.state!=='active') return null; return screenPlane(s).sx-bulbPos(l).x; }
};
initMedia(); setDefaultLayout(); resize(); syncFullBtn(); rafId=requestAnimationFrame(loop); requestAnimationFrame(tick);
})();
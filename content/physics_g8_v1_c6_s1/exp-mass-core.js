// 第六章 c6s1「质量」实验页 core（E1 托盘天平称量 + E2 质量不变三站）
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
// ===== 单点常量（第24条③：器材尺寸=H 比例，layout() 一次写入 L，绘制只读） =====
var ANIM_DUR=600;        // 场景切换飞入飞出（ms，第24条①）
var COMPACT_H=600;       // 小窗紧凑档阈值
var K_TILT=0.6;          // 质量差(g)→横梁倾角(°)，clamp ±8（第7条物理保真）
var BAL_EPS=0.1;         // 平衡判定阈值（g）：|m右+游码−m左| ≤ 0.1
var CAP_G=200;           // 本天平称量（g）——要求①「被测物体的质量不能超过称量」
var NUT_STEP=0.5;        // 平衡螺母每次左旋/右旋（°）
var NUT_INIT=-2.5;       // 初始未调平螺母偏置（°）
var NUT_LIM=4;           // 螺母偏置范围 ±（°）
var LEV_EPS=0.3;         // 调平达成阈值（°）
var MORPH_MS=300;        // 橡皮泥捏形 morph（ms）
var MELT_RATE=[0,14,26,40];   // 站B 冰熔化速度（%/s），下标=热源档位 0-3
// 被测物三选（功能等价件；质量设定值=可配常量，非教材数值）
var OBJECTS={
  eraser:{name:'橡皮',g:15},
  pencil:{name:'铅笔',g:8},
  salt:{name:'盐水小瓶',g:130}
};
var WEIGHT_G={'100':100,'50':50,'20':20,'20b':20,'10':10,'5':5};
var WEIGHT_IDS=['100','50','20','20b','10','5'];   // 与 weight_set 盒内阵列顺序一致
var STATION_M={A:15,B:160,C:15};      // E2 三站天平钉住读数（g）
var STA_PANW={A:['10','5'],B:['100','50','10'],C:['10','5']};   // 三站右盘配平砝码
var STA_NAME={A:'站A · 形状',B:'站B · 物态',C:'站C · 位置'};
var STA_OBJ={A:'橡皮泥',B:'烧杯+冰（熔化成水）',C:'橡皮泥（玩偶手持）'};

var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var hintEl=document.getElementById('hint');
var W=960,H=520,DPR=1,ctrlBandH=150;
var L={};                // 布局常量唯一写点=layout()
var glowFx=[];           // 点击 300ms 光晕反馈
// 场景状态：'e1' 天平称量 / 'A' 形状 / 'B' 物态 / 'C' 位置；各场景完全隔离，切换锁 animating
var state={
  scene:'e1',animating:false,anim:null,   // anim={from,to,t0}
  e1:{obj:null,panW:[],pick:null,rider:0,nut:NUT_INIT,tilt:NUT_INIT,leveled:false,matched:false},
  A:{shape:0,seen:{0:true},done:false,morph:0},
  B:{ice:100,level:0,done:false},
  C:{arm:1,done:false},
  e2done:false
};
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }

function layout(){
  L.benchTop=Math.round(Math.min(H*0.80,H-ctrlBandH-8));   // 桌面线：永不与控制栏相压
  L.balH=Math.round(H*0.30);                 // 天平高=0.30H（任务书单点常量）
  L.balX=Math.round(W*0.40); L.balY=L.benchTop;
  L.boxW=Math.max(120,Math.min(Math.round(W*0.20),Math.round(H*0.34)));
  L.boxX=Math.round(W*0.78); L.boxY=L.benchTop;
  L.heatW=Math.round(H*0.16);                // 站B 热源宽
  L.heatX=Math.round(W*0.72); L.heatY=L.benchTop;
  L.beakerH=Math.round(H*0.19);              // 站B 烧杯高
  L.dollSc=Math.max(0.85,H/520);             // 站C 玩偶缩放
  L.dollX=Math.round(W*0.68); L.dollY=Math.round(H*0.66);
}
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl(); layout(); bgKey='';
  draw();
}
function localPt(e){ var r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; }
// 天平几何同源计算（与 balance_pan 组件内部常量一致）：返回左右盘挂点
function balGeom(x,y,h,tiltDeg){
  var baseH=Math.max(8,h*0.065);
  var pivotY=y-baseH-h*0.52;
  var beamLen=h*0.86,panDrop=h*0.26,panW=beamLen*0.22,panH=Math.max(4,h*0.03);
  var t=tiltDeg*Math.PI/180,cosT=Math.cos(t),sinT=Math.sin(t);
  function end(s){
    var ex=x+s*(beamLen/2-h*0.02)*cosT;
    var ey=pivotY+s*(beamLen/2-h*0.02)*sinT;
    return {x:ex,y:ey+panDrop,hw:panW/2,ph:panH};
  }
  return {pivotY:pivotY,left:end(-1),right:end(1)};
}
// 砝码盒内六枚砝码位（与 weight_set 内部几何同源，用于点选命中）
function boxSlots(){
  var w=L.boxW,x=L.boxX,y=L.boxY;
  var boxH=w*0.32,pad=w*0.05,inL=x-w/2+pad,inW=w-2*pad,by=y-boxH*0.28;
  return WEIGHT_IDS.map(function(id,i){
    var g=WEIGHT_G[id];
    return {id:id,cx:inL+inW*(i+0.5)/WEIGHT_IDS.length,r:inW/WEIGHT_IDS.length*0.34,
      hgt:boxH*(0.30+0.34*g/100),by:by};
  });
}
// ===== 站C 空间站舱内背景：程序化绘制（结构背景件规则：离屏 bgCv 缓存、禁 sprite） =====
var bgCv=null,bgKey='';
function spaceBg(){
  if(bgCv&&bgKey===W+'x'+H) return bgCv;
  bgCv=document.createElement('canvas');
  bgCv.width=Math.round(W*DPR); bgCv.height=Math.round(H*DPR);
  var c=bgCv.getContext('2d'); c.setTransform(DPR,0,0,DPR,0,0);
  c.fillStyle='#e9edf2'; c.fillRect(0,0,W,H);                       // 浅灰白舱壁
  c.strokeStyle='rgba(0,0,0,.06)'; c.lineWidth=1;
  for(var i=1;i<6;i++){ var px=W*i/6; c.beginPath(); c.moveTo(px,0); c.lineTo(px,H*0.80); c.stroke(); }
  c.strokeStyle='rgba(0,0,0,.05)';
  for(var j=1;j<4;j++){ var py=H*0.80*j/4; c.beginPath(); c.moveTo(0,py); c.lineTo(W,py); c.stroke(); }
  c.fillStyle='rgba(255,255,255,.92)';                               // 舱内灯带
  c.fillRect(W*0.1,6,W*0.8,H*0.022);
  var gl=c.createLinearGradient(0,0,0,H*0.14);
  gl.addColorStop(0,'rgba(255,255,240,.5)'); gl.addColorStop(1,'rgba(255,255,240,0)');
  c.fillStyle=gl; c.fillRect(W*0.08,6,W*0.84,H*0.14);
  [[0.20,0.30],[0.80,0.26]].forEach(function(o,k){                  // 舷窗圆窗蓝天
    var cx=W*o[0],cy=H*o[1],R=H*0.13;
    c.beginPath(); c.arc(cx,cy,R,0,Math.PI*2);
    var gs=c.createRadialGradient(cx,cy-R*0.3,R*0.1,cx,cy,R);
    gs.addColorStop(0,'#9cc8ee'); gs.addColorStop(1,'#2b6cb0');
    c.fillStyle=gs; c.fill();
    c.fillStyle='rgba(255,255,255,.9)';
    for(var s=0;s<7;s++){ var a=s*2.4+k*3.1; c.beginPath();
      c.arc(cx+Math.cos(a)*R*0.6,cy+Math.sin(a)*R*0.5,1.6,0,Math.PI*2); c.fill(); }
    if(k===1){ c.beginPath(); c.arc(cx,cy+R*1.25,R*0.85,0,Math.PI*2);  // 地球弧
      c.fillStyle='#5aa469'; c.fill();
      c.beginPath(); c.arc(cx,cy+R*1.25,R*0.85,0,Math.PI*2);
      c.strokeStyle='rgba(120,200,255,.8)'; c.lineWidth=2.5; c.stroke(); }
    c.beginPath(); c.arc(cx,cy,R,0,Math.PI*2);
    c.strokeStyle='#b8bdc4'; c.lineWidth=R*0.12; c.stroke();
    c.strokeStyle='#8a9099'; c.lineWidth=1.5; c.stroke();
  });
  c.fillStyle='#cfd6de'; c.fillRect(0,H*0.80,W,H*0.035);            // 舱内桌台（与 benchTop 同线）
  c.fillStyle='#aab2bb'; c.fillRect(0,H*0.835,W,H*0.165);
  bgKey=W+'x'+H;
  return bgCv;
}
// ===== 盘上挂载绘制（白名单：balance_pan 托盘 ← 砝码/被测物，页面层绘制） =====
function drawPanWeights(c,cx,cyTop,hw,ids){
  var by=cyTop;
  ids.forEach(function(id){
    var g=WEIGHT_G[id];
    var r=hw*(0.28+0.26*g/100),hgt=hw*(0.16+0.30*g/100);
    var grd=c.createLinearGradient(cx-r,0,cx+r,0);
    grd.addColorStop(0,'#9ca3af'); grd.addColorStop(0.4,'#e5e7eb'); grd.addColorStop(1,'#7d838c');
    c.fillStyle=grd;
    c.beginPath(); c.rect(cx-r,by-hgt,r*2,hgt); c.fill();
    c.beginPath(); c.ellipse(cx,by-hgt,r,r*0.34,0,0,Math.PI*2);
    c.fillStyle='#e5e7eb'; c.fill();
    c.strokeStyle='#6b7280'; c.lineWidth=1; c.stroke();
    c.fillStyle='#374151'; c.font=Math.max(8,r*0.62)+'px sans-serif'; c.textAlign='center';
    c.fillText(String(g),cx,by-hgt*0.35);
    by-=hgt;
  });
}
function drawObject(c,cx,cyTop,hw,kind){
  if(kind==='eraser') PROPS.clay(c,cx,cyTop,{size:Math.round(hw*1.05),shape:0});
  else if(kind==='pencil'){   // material_block wood 拉长态=铅笔（功能等价件）
    c.save(); c.translate(cx,cyTop); c.scale(2.3,0.42);
    PROPS.material_block(c,0,0,{size:Math.round(hw*0.9),mat:'wood'});
    c.restore();
  }else if(kind==='salt'){    // material_block ice 淡蓝半透明=盐水小瓶（功能等价件）
    PROPS.material_block(c,cx,cyTop,{size:Math.round(hw*0.8),mat:'ice'});
  }
}
function drawGlows(){
  var now=performance.now();
  glowFx=glowFx.filter(function(g){ return now-g.t0<300; });
  glowFx.forEach(function(g){
    var t=(now-g.t0)/300;
    ctx.beginPath(); ctx.arc(g.x,g.y,8+t*22,0,Math.PI*2);
    ctx.strokeStyle='rgba('+(g.c||'255,200,80')+','+(0.7*(1-t)).toFixed(2)+')';
    ctx.lineWidth=3*(1-t)+1; ctx.stroke();
  });
}
// ===== 场景一 E1：用托盘天平测量质量（整台可操作，Q4 拍板） =====
function e1MassR(){ var e=state.e1,s=0; e.panW.forEach(function(id){ s+=WEIGHT_G[id]; }); return s; }
function e1MassL(){ var e=state.e1; return e.obj?OBJECTS[e.obj].g:0; }
function e1Diff(){ return e1MassR()+state.e1.rider-e1MassL(); }
function drawE1(oy){
  ctx.save(); ctx.translate(0,oy||0);
  PROPS.bench(ctx,W,H,{});
  var e=state.e1;
  PROPS.balance_pan(ctx,L.balX,L.balY,{h:L.balH,tilt:e.tilt,rider:e.rider,
    panL:function(c,cx,cyTop,hw){ if(e.obj) drawObject(c,cx,cyTop,hw,e.obj); },
    panR:function(c,cx,cyTop,hw){ drawPanWeights(c,cx,cyTop,hw,e.panW); }});
  PROPS.weight_set(ctx,L.boxX,L.boxY,{w:L.boxW,open:true,pick:e.pick});
  // 盒标签
  ctx.fillStyle='#8a7c66'; ctx.font='13px "Yuanti SC","PingFang SC",sans-serif'; ctx.textAlign='center';
  ctx.fillText('砝码盒（点击=镊子夹取）',L.boxX,L.boxY+16);
  if(e.pick){
    ctx.fillStyle='#b45309'; ctx.font='bold 14px "Yuanti SC","PingFang SC",sans-serif';
    ctx.fillText('镊子已夹起 '+WEIGHT_G[e.pick]+' g 砝码 → 点右盘放入',L.boxX,L.boxY-L.boxW*0.32-L.boxW*0.30);
  }
  ctx.restore();
}
// 盒内砝码命中（pick 的跳过——已被镊子夹走）
function boxWeightAt(p){
  var e=state.e1,slots=boxSlots();
  for(var i=0;i<slots.length;i++){
    var s=slots[i];
    if(e.pick===s.id||(e.pick==='20'&&s.id==='20b')) continue;
    if(e.panW.indexOf(s.id)>=0) continue;
    if(p.x>=s.cx-s.r*1.4&&p.x<=s.cx+s.r*1.4&&p.y>=s.by-s.hgt-s.r&&p.y<=s.by+s.r*0.6) return s.id;
  }
  return null;
}
// 右盘已入盘砝码命中（取回盒；返回盘内下标）
function panWeightAt(p){
  var g=balGeom(L.balX,L.balY,L.balH,state.e1.tilt),rp=g.right;
  var ids=state.e1.panW;
  if(!ids.length) return -1;
  var topH=0; ids.forEach(function(id){ var gg=WEIGHT_G[id]; topH+=rp.hw*(0.16+0.30*gg/100); });
  if(p.x>=rp.x-rp.hw*1.2&&p.x<=rp.x+rp.hw*1.2&&p.y>=rp.y-topH-12&&p.y<=rp.y+rp.ph+6) return ids.length-1;
  return -1;
}
function nearPan(p,pn){ return Math.abs(p.x-pn.x)<pn.hw*1.3&&Math.abs(p.y-pn.y)<pn.hw*0.9+10; }
// E1 命中总入口：返回可点目标描述（cursor/hover 共用）
function e1Hit(p){
  var e=state.e1,g=balGeom(L.balX,L.balY,L.balH,e.tilt);
  if(boxWeightAt(p)) return {k:'box'};
  if(panWeightAt(p)>=0) return {k:'panw'};
  if(nearPan(p,g.right)) return {k:'panR'};
  if(nearPan(p,g.left)) return {k:'panL'};
  return null;
}
function e1Click(p){
  var e=state.e1,g=balGeom(L.balX,L.balY,L.balH,e.tilt);
  if(e.pick){
    if(nearPan(p,g.right)){                     // 镊子夹砝码 → 点右盘放入（左物右码）
      e.panW.push(e.pick); e.pick=null;
      glowFx.push({x:g.right.x,y:g.right.y-8,t0:performance.now()});
      if(window.playDrop) playDrop();
      afterE1(); return;
    }
    var sw=boxWeightAt(p);
    if(sw){ e.pick=sw; if(window.playPick) playPick(); afterE1(); return; }   // 换夹另一枚
    e.pick=null; if(window.playClick) playClick(); afterE1(); return;         // 点空白=放回盒
  }
  var id=boxWeightAt(p);
  if(id){                                       // 点砝码盒中砝码=镊子夹取（要求②语义）
    if(e.panW.indexOf(id)>=0){ return; }
    e.pick=id;
    var slots=boxSlots(),sl=slots.filter(function(s){return s.id===id;})[0];
    glowFx.push({x:sl.cx,y:sl.by-sl.hgt/2,t0:performance.now()});
    if(window.playPick) playPick();
    afterE1(); return;
  }
  var wi=panWeightAt(p);
  if(wi>=0){                                    // 再点已入盘砝码=取回盒
    e.panW.splice(wi,1);
    glowFx.push({x:g.right.x,y:g.right.y-10,t0:performance.now(),c:'150,200,255'});
    if(window.playDrop) playDrop();
    afterE1(); return;
  }
}
function afterE1(){ updateHint(); updatePanel(); }
// ===== 被测物选择（控制栏三选钮；未调平拒绝放置） =====
function placeObj(kind){
  var e=state.e1;
  if(state.animating) return;
  if(!e.leveled){ flashHint('先调平天平：游码归零 + 旋转平衡螺母，使指针指在分度盘的中线处，才能开始称量。'); return; }
  if(e.obj===kind){ e.obj=null; }               // 再点=取下
  else{ e.obj=kind; e.matched=false;
    var g=balGeom(L.balX,L.balY,L.balH,e.tilt);
    glowFx.push({x:g.left.x,y:g.left.y-10,t0:performance.now(),c:'255,180,120'});
    if(window.playDrop) playDrop(); }
  syncObjBtns(); afterE1();
}
var flashT=null;
function flashHint(msg){
  if(!hintEl) return;
  if(flashT) clearTimeout(flashT);
  hintEl.textContent=msg; hintEl.style.borderColor='#dc2626';
  flashT=setTimeout(function(){ flashT=null; hintEl.style.borderColor=''; updateHint(); },1800);
}
function syncObjBtns(){
  var e=state.e1;
  ['eraser','pencil','salt'].forEach(function(k){
    var b=document.getElementById('btn-obj-'+k);
    if(b) b.classList.toggle('on',e.obj===k);
  });
}
// ===== 场景二 E2：质量不随形状、物态、位置改变（三站，站间飞入飞出） =====
// 简化读数态天平：tilt=0 恒平、右盘固定配平砝码、读数钉住=设定质量
function drawStationBalance(panLfn,st){
  PROPS.balance_pan(ctx,L.balX,L.balY,{h:L.balH,tilt:0,rider:0,
    panL:panLfn,
    panR:function(c,cx,cyTop,hw){ drawPanWeights(c,cx,cyTop,hw,STA_PANW[st]); }});
  // 幽灵化读数牌（钉住不变）
  var tx=L.balX,ty=L.balY+H*0.055,tw=Math.max(180,L.balH*0.9);
  ctx.save();
  ctx.beginPath();
  var rr2=Math.min(16,tw/2);
  ctx.moveTo(tx-tw/2+rr2,ty-30); ctx.arcTo(tx+tw/2,ty-30,tx+tw/2,ty,rr2);
  ctx.arcTo(tx+tw/2,ty,tx-tw/2,ty,rr2); ctx.arcTo(tx-tw/2,ty,tx-tw/2,ty-30,rr2);
  ctx.arcTo(tx-tw/2,ty-30,tx+tw/2,ty-30,rr2); ctx.closePath();
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.fill();
  ctx.fillStyle='#b45309'; ctx.font='bold 15px "Yuanti SC","PingFang SC",sans-serif'; ctx.textAlign='center';
  ctx.fillText('天平读数 '+STATION_M[st]+' g（钉住不变）',tx,ty-10);
  ctx.restore();
}
function stationCaption(st){
  ctx.save();
  ctx.fillStyle='#b45309'; ctx.font='bold 17px "Yuanti SC","PingFang SC",sans-serif'; ctx.textAlign='left';
  ctx.fillText(STA_NAME[st]+'　'+(state[st].done?'结论：质量不变 ✓':'操作中…'),14,30+17);
  ctx.restore();
}
function drawA(oy){
  ctx.save(); ctx.translate(0,oy||0);
  PROPS.bench(ctx,W,H,{});
  var A=state.A;
  drawStationBalance(function(c,cx,cyTop,hw){
    var t=A.morph?(performance.now()-A.morph)/MORPH_MS:1;
    var sq=t<1?Math.sin(Math.PI*Math.min(1,t)):0;
    c.save(); c.translate(cx,cyTop); c.scale(1+0.28*sq,1-0.28*sq);
    PROPS.clay(c,0,0,{size:Math.round(hw*1.1),shape:A.shape});
    c.restore();
  },'A');
  // 桌面提示块：形态名
  ctx.fillStyle='#8a7c66'; ctx.font='14px "Yuanti SC","PingFang SC",sans-serif'; ctx.textAlign='center';
  ctx.fillText('橡皮泥形态：'+['球','饼','条'][A.shape]+'（点「捏一捏」或点橡皮泥变形）',Math.round(W*0.68),L.benchTop-14);
  stationCaption('A');
  ctx.restore();
}
function drawB(oy){
  ctx.save(); ctx.translate(0,oy||0);
  PROPS.bench(ctx,W,H,{});
  var B=state.B;
  var boxTop=L.heatY-L.heatW*0.58*0.55;   // heat_source 顶盘 y（组件几何同源）
  PROPS.heat_source(ctx,L.heatX,L.heatY,{w:L.heatW,level:B.level});
  PROPS.beaker_ice(ctx,L.heatX,boxTop+2,{h:L.beakerH,ice:B.ice,water:(100-B.ice)/100*0.62});
  ctx.fillStyle='#8a7c66'; ctx.font='14px "Yuanti SC","PingFang SC",sans-serif'; ctx.textAlign='center';
  ctx.fillText('冰 ' + Math.round(B.ice) + ' %　（点热源本体或拖档位滑杆加热）',L.heatX,L.benchTop+30);
  drawStationBalance(function(c,cx,cyTop,hw){
    PROPS.beaker_ice(c,cx,cyTop,{h:Math.round(hw*1.25),ice:B.ice,water:(100-B.ice)/100*0.62});
  },'B');
  stationCaption('B');
  ctx.restore();
}
function dollHand(){   // 玩偶举起手的持物点（doll 组件几何同源）
  var Hd=110*L.dollSc,headR=Hd*0.18,headCy=L.dollY-Hd+headR;
  var bodyTop=headCy+headR*0.92,bodyW=Hd*0.34;
  return {x:L.dollX+bodyW/2+Hd*0.145,y:bodyTop-Hd*0.155,Hd:Hd};
}
function drawC(oy){
  ctx.save(); ctx.translate(0,oy||0);
  ctx.drawImage(spaceBg(),0,0,W,H);
  var C=state.C;
  drawStationBalance(function(c,cx,cyTop,hw){
    PROPS.clay(c,cx,cyTop,{size:Math.round(hw*1.1),shape:0});
  },'C');
  var bob=Math.sin(performance.now()/700)*4;   // 舱内轻飘
  ctx.save(); ctx.translate(0,bob);
  PROPS.doll(ctx,L.dollX,L.dollY,{scale:L.dollSc,arm:C.arm});
  var hd=dollHand();
  if(C.arm){   // 手持被测物（橡皮泥小球）
    PROPS.clay(ctx,hd.x,hd.y+hd.Hd*0.10,{size:Math.round(hd.Hd*0.20),shape:0});
  }
  ctx.restore();
  ctx.fillStyle='#64748b'; ctx.font='14px "Yuanti SC","PingFang SC",sans-serif'; ctx.textAlign='center';
  ctx.fillText('空间站舱内（点玩偶举手展示被测物）',L.dollX,L.dollY+24);
  stationCaption('C');
  ctx.restore();
}
// E2 命中：站A 橡皮泥（盘上）/ 站B 热源本体 / 站C 玩偶
function e2Hit(p){
  var st=state.scene;
  if(st==='A'){
    var g=balGeom(L.balX,L.balY,L.balH,0);
    if(nearPan(p,g.left)) return {k:'clay'};
  }else if(st==='B'){
    var boxTopB=L.heatY-L.heatW*0.58*0.55;
    if(p.x>=L.heatX-L.heatW/2&&p.x<=L.heatX+L.heatW/2&&p.y>=boxTopB&&p.y<=L.heatY+4) return {k:'heat'};
  }else if(st==='C'){
    var Hd=110*L.dollSc;
    if(p.x>=L.dollX-Hd*0.3&&p.x<=L.dollX+Hd*0.35&&p.y>=L.dollY-Hd-10&&p.y<=L.dollY+10) return {k:'doll'};
  }
  return null;
}
function e2Click(p){
  var h=e2Hit(p); if(!h) return;
  if(h.k==='clay'){ knead(); }
  else if(h.k==='heat'){   // heat_source 本体带开关点击：档位循环 0→1→2→3→0
    var B=state.B;
    B.level=(B.level+1)%4;
    glowFx.push({x:L.heatX,y:L.heatY-L.heatW*0.2,t0:performance.now(),c:'255,120,80'});
    if(B.level>0&&window.playLight) playLight(); else if(window.playClick) playClick();
    syncHeatUI(); updateHint();
  }
  else if(h.k==='doll'){
    var C=state.C;
    C.arm=C.arm?0:1;
    var hd=dollHand();
    glowFx.push({x:hd.x,y:hd.y,t0:performance.now(),c:'160,210,255'});
    if(window.playClick) playClick();
    if(!C.done){ C.done=true; if(window.playMatch) playMatch(); checkE2(); }
    updateHint(); updatePanel();
  }
}
function knead(){
  if(state.animating) return;
  var A=state.A;
  A.shape=(A.shape+1)%3; A.seen[A.shape]=true; A.morph=performance.now();
  var g=balGeom(L.balX,L.balY,L.balH,0);
  glowFx.push({x:g.left.x,y:g.left.y-14,t0:performance.now(),c:'230,150,110'});
  if(window.playClick) playClick();
  if(A.seen[0]&&A.seen[1]&&A.seen[2]&&!A.done){ A.done=true; if(window.playMatch) playMatch(); checkE2(); }
  updateHint(); updatePanel();
}
function checkE2(){
  if(state.A.done&&state.B.done&&state.C.done&&!state.e2done){
    state.e2done=true;
    setTimeout(function(){ if(state.scene!=='e1') flashHint('总结论：物体的质量不随它的形状、物态和位置而改变。'); },1600);
  }
}
// ===== 主绘制（场景切换飞入飞出：旧场景向上飞出、新场景自下飞入，600ms ease-in-out） =====
function drawScene(name,oy){
  if(name==='e1') drawE1(oy);
  else if(name==='A') drawA(oy);
  else if(name==='B') drawB(oy);
  else if(name==='C') drawC(oy);
}
function draw(){
  ctx.clearRect(0,0,W,H);
  if(state.animating&&state.anim){
    var t=Math.min(1,(performance.now()-state.anim.t0)/ANIM_DUR),e=easeInOut(t);
    drawScene(state.anim.from,-H*e);
    drawScene(state.anim.to,H*(1-e));
  }else drawScene(state.scene,0);
  drawGlows();
}
// ===== 场景切换（animating 锁全部输入；各场景状态完全隔离、返回原样恢复） =====
var SCENE_BTNS={e1:'btn-e1',A:'btn-sta',B:'btn-stb',C:'btn-stc'};
function switchScene(to){
  if(state.animating||to===state.scene) return;
  state.anim={from:state.scene,to:to,t0:performance.now()};
  state.scene=to; state.animating=true;
  if(window.playClick) playClick();
  syncSceneUI(); syncCtrlUI(); updatePanel();
}
function syncSceneUI(){
  Object.keys(SCENE_BTNS).forEach(function(k){
    var b=document.getElementById(SCENE_BTNS[k]);
    if(b) b.classList.toggle('on',state.scene===k);
  });
  var e1=state.scene==='e1';
  flyout('grp-obj',!e1);
  flyout('grp-level',!e1);
  flyout('grp-knead',state.scene!=='A');
  flyout('grp-heat',state.scene!=='B');
}
function flyout(id,out){ var g=document.getElementById(id); if(g) g.classList.toggle('flyout',out); }
// ===== hint 橙色居中解说条（当前可见分支教当前可做的操作） =====
function e1Expr(){
  var e=state.e1,parts=e.panW.map(function(id){ return WEIGHT_G[id]+' g'; });
  if(e.rider>0) parts.push(e.rider.toFixed(1)+' g');
  var m=e1MassR()+e.rider;
  return {expr:parts.join(' + ')+' = '+m.toFixed(1)+' g',m:m};
}
function hintText(){
  var s=state.scene;
  if(s==='e1'){
    var e=state.e1;
    if(!e.leveled) return '第一步 调平：①把游码移到标尺左端零刻度线处（滑杆归零）；②点「◀ 螺母 / 螺母 ▶」旋转平衡螺母，使指针指在分度盘的中线处，横梁平衡。使用前记住三要求：被测质量不能超过称量（本天平 '+CAP_G+' g）；加减砝码要用镊子、不能用手接触；潮湿的物体和化学药品不能直接放到托盘中。';
    if(!e.obj) return '调平完成 ✓ 第二步 左物右码：在下方「被测物」卡点选橡皮 / 铅笔 / 盐水小瓶，放上左盘。';
    var d=Math.abs(e1Diff());
    if(e.matched){
      var r=e1Expr();
      return '横梁平衡 ✓ 第三步 读数：m物 = 盘中砝码总质量 + 游码示数 = '+r.expr+'。与被测物设定质量一致 ✓（单位换算：1 g = 10⁻³ kg，1 mg = 10⁻⁶ kg，1 t = 10³ kg）';
    }
    if(d>2) return '加减砝码：点砝码盒中砝码 = 镊子夹取（由大到小试加），再点右盘放入；点盘中砝码可取回盒。横梁仍'+(e1Diff()<0?'左倾（物重）':'右倾（码重）')+'。';
    return '接近平衡：微调游码滑杆（0–5 g，每步 0.2 g），使指针重新指在分度盘中线处。';
  }
  if(s==='A'){
    return state.A.done
      ? '站A 结论：形状变了（球→饼→条），质量不变——天平读数始终 '+STATION_M.A+' g。'+(state.e2done?'总结论：物体的质量不随它的形状、物态和位置而改变。':'')
      : '站A · 形状：点「✋ 捏一捏」（或直接点左盘橡皮泥），把橡皮泥从球捏成饼、再捏成条，观察天平读数是否变化。';
  }
  if(s==='B'){
    return state.B.done
      ? '站B 结论：物态变了（冰熔化成水），质量不变——杯+内容物总质量始终 '+STATION_M.B+' g。'+(state.e2done?'总结论：物体的质量不随它的形状、物态和位置而改变。':'')
      : '站B · 物态：点热源本体（或拖「档位」滑杆 0–3）加热，杯中的冰渐渐熔化成水——观察天平读数全程不变。';
  }
  return state.C.done
    ? '站C 结论：位置变了（地面→空间站），质量不变——天平读数始终 '+STATION_M.C+' g。'+(state.e2done?'总结论：物体的质量不随它的形状、物态和位置而改变。':'')
    : '站C · 位置：玩偶把被测物从地面带进了空间站舱内。点玩偶举手展示被测物——天平读数依然不变。';
}
function updateHint(){ if(!hintEl||flashT) return; hintEl.textContent=hintText(); }
// ===== 读数面板（openPanel 单入口互斥；幽灵化，行随场景切换） =====
var panelOn=false;
function openPanel(force){
  panelOn=force!==undefined?force:!panelOn;
  var p=document.getElementById('panel-read'),b=document.getElementById('btn-panel');
  if(p) p.classList.toggle('show',panelOn);
  if(b) b.classList.toggle('on',panelOn);
  updatePanel();
}
function beamText(){
  var t=state.e1.tilt;
  return t<-0.3?'左倾（物重）':(t>0.3?'右倾（码重）':'平衡 ✓');
}
function updatePanel(){
  var tb1=document.getElementById('tb-e1'),tb2=document.getElementById('tb-e2');
  if(!tb1||!tb2) return;
  var e1=state.scene==='e1';
  tb1.style.display=e1?'':'none'; tb2.style.display=e1?'none':'';
  if(e1){
    var e=state.e1,r=e1Expr();
    document.getElementById('pe-obj').textContent=e.obj?OBJECTS[e.obj].name:'—';
    document.getElementById('pe-wts').textContent=e.panW.length?e1MassR()+' g（'+e.panW.map(function(id){return WEIGHT_G[id];}).join('+')+'）':'—';
    document.getElementById('pe-rider').textContent=e.rider.toFixed(1)+' g';
    document.getElementById('pe-mass').textContent=e.matched?r.expr:'—';
    document.getElementById('pe-beam').textContent=beamText();
  }else{
    var st=state.scene;
    document.getElementById('p2-sta').textContent=STA_NAME[st];
    document.getElementById('p2-obj').textContent=STA_OBJ[st];
    document.getElementById('p2-read').textContent=STATION_M[st]+' g（钉住不变）';
    document.getElementById('p2-concl').textContent=state[st].done?'不变 ✓':'观察中…';
  }
}
// ===== 指针事件（animating 锁全部输入；点击类操作 300ms 光晕反馈） =====
cv.addEventListener('pointerdown',function(ev){
  if(state.animating) return;
  var p=localPt(ev);
  if(state.scene==='e1') e1Click(p);
  else e2Click(p);
  draw();
});
cv.addEventListener('pointermove',function(ev){
  if(state.animating){ cv.style.cursor=''; return; }
  var p=localPt(ev);
  var h=state.scene==='e1'?e1Hit(p):e2Hit(p);
  cv.style.cursor=h?'pointer':'';
});
// ===== 控制栏接线 =====
['eraser','pencil','salt'].forEach(function(k){
  var b=document.getElementById('btn-obj-'+k);
  if(b) b.addEventListener('click',function(){ placeObj(k); });
});
function nutTurn(dir){
  if(state.animating) return;
  var e=state.e1;
  e.nut=clamp(e.nut+dir*NUT_STEP,-NUT_LIM,NUT_LIM);
  if(!e.obj&&!e.panW.length&&e.rider===0&&Math.abs(e.nut)<LEV_EPS){
    if(!e.leveled){ e.leveled=true; if(window.playMatch) playMatch(); }
  }
  if(window.playTick) playTick();
  afterE1();
}
var btnNutL=document.getElementById('btn-nut-l'),btnNutR=document.getElementById('btn-nut-r');
if(btnNutL) btnNutL.addEventListener('click',function(){ nutTurn(-1); });
if(btnNutR) btnNutR.addEventListener('click',function(){ nutTurn(1); });
var rngRider=document.getElementById('rng-rider'),lblRider=document.getElementById('lbl-rider');
if(rngRider) rngRider.addEventListener('input',function(){
  if(state.animating){ rngRider.value=state.e1.rider; return; }
  state.e1.rider=+rngRider.value;
  if(lblRider) lblRider.textContent='游码 '+state.e1.rider.toFixed(1)+' g';
  if(window.playTick) playTick();
  afterE1();
});
var rngHeat=document.getElementById('rng-heat'),lblHeat=document.getElementById('lbl-heat');
function syncHeatUI(){
  if(rngHeat) rngHeat.value=state.B.level;
  if(lblHeat) lblHeat.textContent='档位 '+state.B.level;
}
if(rngHeat) rngHeat.addEventListener('input',function(){
  if(state.animating){ rngHeat.value=state.B.level; return; }
  state.B.level=+rngHeat.value;
  syncHeatUI();
  if(state.B.level>0&&window.playTick) playTick();
  updateHint();
});
var btnKnead=document.getElementById('btn-knead');
if(btnKnead) btnKnead.addEventListener('click',function(){ knead(); });
var btnE1=document.getElementById('btn-e1'),btnSta=document.getElementById('btn-sta'),
    btnStb=document.getElementById('btn-stb'),btnStc=document.getElementById('btn-stc');
if(btnE1) btnE1.addEventListener('click',function(){ switchScene('e1'); });
if(btnSta) btnSta.addEventListener('click',function(){ switchScene('A'); });
if(btnStb) btnStb.addEventListener('click',function(){ switchScene('B'); });
if(btnStc) btnStc.addEventListener('click',function(){ switchScene('C'); });
var btnPanel=document.getElementById('btn-panel');
if(btnPanel) btnPanel.addEventListener('click',function(){ if(state.animating) return; openPanel(); if(window.playClick) playClick(); });
// 重置：回当前场景初始态（各场景隔离，互不影响）
function resetScene(){
  var s=state.scene;
  if(s==='e1'){
    state.e1={obj:null,panW:[],pick:null,rider:0,nut:NUT_INIT,tilt:NUT_INIT,leveled:false,matched:false};
    syncObjBtns();
    if(rngRider) rngRider.value=0;
    if(lblRider) lblRider.textContent='游码 0.0 g';
  }else if(s==='A'){ state.A={shape:0,seen:{0:true},done:false,morph:0}; }
  else if(s==='B'){ state.B={ice:100,level:0,done:false}; syncHeatUI(); }
  else if(s==='C'){ state.C={arm:1,done:false}; }
  state.e2done=state.A.done&&state.B.done&&state.C.done;
  glowFx=[];
  updateHint(); updatePanel();
}
var btnReset=document.getElementById('btn-reset');
if(btnReset) btnReset.addEventListener('click',function(){ if(state.animating) return; resetScene(); if(window.playClick) playClick(); });
var btnMute=document.getElementById('btn-mute');
if(btnMute) btnMute.addEventListener('click',function(){ if(state.animating) return; window.muted=!window.muted; btnMute.textContent=window.muted?'🔇':'🔊'; if(window.playClick) playClick(); });
// 全屏（c5s1 路线：documentElement + html.pseudo-fs 降级）
var btnFull=document.getElementById('btn-full');
function pickFn(el,names){for(var i=0;i<names.length;i++){var fn=el[names[i]];if(typeof fn==='function')return fn;}return null;}
function fullEl(){return document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement;}
function syncFull(){btnFull.textContent=(fullEl()||document.documentElement.classList.contains('pseudo-fs'))?'退出全屏':'全屏';}
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
// ===== 控制栏同步（滑杆/按钮态回写） =====
function syncCtrlUI(){ syncObjBtns(); syncHeatUI();
  if(rngRider) rngRider.value=state.e1.rider;
  if(lblRider) lblRider.textContent='游码 '+state.e1.rider.toFixed(1)+' g';
}
// ===== 动画 tick（横梁连续插值/冰熔化/飞入飞出/光晕） =====
var lastT=performance.now(),panelT=0;
function tick(){
  var now=performance.now(),dt=Math.min(50,now-lastT); lastT=now;
  if(state.animating&&state.anim&&now-state.anim.t0>=ANIM_DUR){
    state.animating=false; state.anim=null;
    updateHint(); syncCtrlUI();
  }
  var e=state.e1;
  if(!e.leveled&&!e.obj&&!e.panW.length&&e.rider===0&&Math.abs(e.nut)<LEV_EPS){
    e.leveled=true; if(window.playMatch) playMatch(); updateHint();
  }
  var tgt=clamp(e1Diff()*K_TILT+e.nut,-8,8);
  if(Math.abs(tgt-e.tilt)>0.005) e.tilt+=(tgt-e.tilt)*Math.min(1,dt/140); else e.tilt=tgt;
  var bal=e.leveled&&e.obj&&Math.abs(e1Diff())<=BAL_EPS;
  if(bal&&!e.matched){ e.matched=true; if(window.playMatch) playMatch(); updateHint(); updatePanel(); }
  else if(!bal&&e.matched){ e.matched=false; updateHint(); updatePanel(); }
  var B=state.B;
  if(state.scene==='B'&&B.level>0&&B.ice>0){
    B.ice=Math.max(0,B.ice-MELT_RATE[B.level]*dt/1000);
    if(B.ice<=0&&!B.done){ B.done=true; if(window.playMatch) playMatch(); checkE2(); updateHint(); updatePanel(); }
  }
  if(panelOn&&now-panelT>200){ panelT=now; updatePanel(); }
  draw();
  requestAnimationFrame(tick);
}
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); bgKey=''; draw(); }).observe(ctrlEl);
}
// 调试通道（规格书 §5.9）
window.__c6dbg={ get state(){return state;}, get W(){return W;}, get H(){return H;}, get L(){return L;},
  scene:function(s){ switchScene(s); },
  setE1:function(o){ var e=state.e1; if(o.obj!==undefined)e.obj=o.obj; if(o.rider!==undefined)e.rider=o.rider;
    if(o.nut!==undefined){e.nut=o.nut;e.leveled=Math.abs(o.nut)<LEV_EPS;} if(o.panW!==undefined)e.panW=o.panW.slice();
    syncCtrlUI(); updateHint(); draw(); },
  level:function(){ state.e1.nut=0; state.e1.leveled=true; afterE1(); draw(); },
  melt:function(){ state.B.ice=0; state.B.done=true; checkE2(); updateHint(); draw(); },
  reset:function(){ resetScene(); } };
layout(); resize();
syncSceneUI(); syncCtrlUI(); updateHint(); updatePanel();
requestAnimationFrame(tick);
})();

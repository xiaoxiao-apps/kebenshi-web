/* ============================================================
 * exp-force-table-core.js — C7V4-R9「一张桌子」桌面骨架 + 五区布局 + 静态器材摆放
 * 设计书：八下-第7章-设计书-v4-返工.md §2（布局）/ §3.1（常量）/ §7.1（加载遮罩）
 * 本单只画静态：无物理、无拖拽、无交互（R10 起做）；蔡总明令：页面无场景切换按钮
 * 图层序（§2.5）：1 舞台底色 → 2 分区暗示 → 3 固定承载件 → 4 器材层
 *   （5 人物动态 / 6 力矢 / 7 UI 控制 / 8 字幕 / 9 练习本浮层：本单只留空壳，见文末）
 * 坐标铁律：全部按画布百分比重算（ZONES 常量 = 设计书 §2.2），禁止硬编码像素
 * ============================================================ */
(function(){
'use strict';
var cv=document.getElementById('scene');
var ctx=cv.getContext('2d');
var W=960,H=600,DPR=1,k=1;                  /* k=全局视觉倍率（随画布缩放） */
var dirty=true, firstFrameDone=false, interactive=false;

/* 稳定状态对象：guide 引擎轮询用（GUIDE_CFG.state，原地 mutate 勿重赋值）；mode='table' 单场景 */
var STATE=window.C7_TABLE_STATE={mode:'table',v:'R9-static'};

/* ===== 五区常量表（设计书 §2.2，百分比制，以画布为 100%）===== */
var ZONES={
  Z1:{x0:8, y0:8, x1:32,y1:36,name:'后左·铁架台区'},
  Z2:{x0:34,y0:24,x1:66,y1:58,name:'中前·轨道区'},
  Z3:{x0:68,y0:8, x1:92,y1:38,name:'后右·门区'},
  Z4:{x0:8, y0:62,x1:34,y1:90,name:'前左·滑板双人区'},
  Z5:{x0:66,y0:62,x1:92,y1:90,name:'前右·气球区'},
  ZT:{x0:20,y0:92,x1:80,y1:98,name:'底部工具架'}
};
function zoneRect(id){
  var z=ZONES[id];
  return {x:z.x0/100*W, y:z.y0/100*H, w:(z.x1-z.x0)/100*W, h:(z.y1-z.y0)/100*H};
}
function zoneCenter(id){ var r=zoneRect(id); return {x:r.x+r.w/2, y:r.y+r.h/2}; }
/* zonePt: 区内归一坐标(fx 0..1 左→右, fy 0..1 上→下)→画布像素（摆放单源，全部器材定位走它） */
function zonePt(id,fx,fy){ var r=zoneRect(id); return {x:r.x+r.w*fx, y:r.y+r.h*fy}; }
var DEBUG_ZONES=(function(){ try{ return new URLSearchParams(location.search).get('zones')==='1'; }catch(e){ return false; } })();

/* ===== 画布与响应式（§2.1）：16:10 基准、桌面占~75%高、留白左右≤8% 上下≤5%、DPR 适配 ===== */
var TABLE={l:0.04,r:0.96,t:0.06,b:0.875,edge:0.90};   /* 台面归一边界（占画布百分比：宽92%、高~81.5%含桌沿） */
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  k=Math.max(0.5,Math.min(W/1440,H/860));              /* 全局倍率：以 1440×860 设计基准等比 */
  layout();
  dirty=true;
}
/* drawScaled: 无尺寸 opt 的件按锚点缩放绘制（锚=底面中心，translate 后 scale 再画 0,0） */
function drawScaled(fn,x,y,s,opt){
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
  var r=fn(ctx,0,0,opt||{});
  ctx.restore(); return r;
}

/* ===== 布局表 L：每次 resize 全量按百分比重算（验收7：无残留）===== */
var L={};
function layout(){
  var z1=zoneRect('Z1'),z2=zoneRect('Z2'),z3=zoneRect('Z3'),z4=zoneRect('Z4'),z5=zoneRect('Z5'),zt=zoneRect('ZT');
  L.trayW=z1.w*0.36;
  L.standH=z1.h*0.94;
  L.trackW=z2.w*0.84;
  L.cartW=L.trackW*0.96*0.30;
  L.woodS=z2.h*0.40/104;
  L.boxS=z2.h*0.26/60;
  L.frameW=z3.w*0.60; L.frameH=z3.h*0.90;
  L.doorW=L.frameW*0.76; L.doorH=L.frameH*0.84;
  L.boardW=z4.w*0.42; L.figH=z4.h*0.60;
  L.balloonR=z5.h*0.26; L.pumpH=z5.h*0.34;
  L.meterH=Math.min(zt.y+zt.h*0.7-(0.795*H),H*0.17);  /* 测力计顶不高于画布 79.5%（Z2/Z5 之间空带内） */
  L.hookS=Math.max(0.6,z1.h/300);
}

/* ===== 层1：舞台底色（暖白桌面+浅木纹+环境阴影，table_25d 等价绘制，百分比单源）===== */
function drawStage(){
  /* 房间背景（墙面暖调渐变） */
  var gW=ctx.createLinearGradient(0,0,0,H);
  gW.addColorStop(0,'#f7f3ea'); gW.addColorStop(0.7,'#efe8d8'); gW.addColorStop(1,'#e4dac4');
  ctx.fillStyle=gW; ctx.fillRect(0,0,W,H);
  var tl=TABLE.l*W,tr=TABLE.r*W,tt=TABLE.t*H,tb=TABLE.b*H,eb=TABLE.edge*H;
  /* 环境阴影（桌面四周软影） */
  ctx.save();
  ctx.fillStyle='rgba(120,95,55,0.16)'; ctx.filter='blur('+(14*k)+'px)';
  ctx.beginPath(); ctx.roundRect(tl+6*k,tb,tr-tl,eb-tb+16*k,10*k); ctx.fill();
  ctx.restore();
  /* 桌沿厚度（前沿立面） */
  ctx.fillStyle='#b5844e'; ctx.strokeStyle='#7c5a30'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.roundRect(tl,tb,tr-tl,eb-tb,[0,0,12*k,12*k]); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='rgba(255,240,215,0.5)'; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(tl+4*k,tb+1.5); ctx.lineTo(tr-4*k,tb+1.5); ctx.stroke();
  /* 台面（暖白木纹渐变，2.5D 斜俯视=上缘略暗模拟纵深） */
  var gT=ctx.createLinearGradient(0,tt,0,tb);
  gT.addColorStop(0,'#e9dbbf'); gT.addColorStop(0.18,'#f3ead9'); gT.addColorStop(0.62,'#eee1c9'); gT.addColorStop(1,'#e7d7ba');
  ctx.fillStyle=gT; ctx.strokeStyle='#7c5a30'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.roundRect(tl,tt,tr-tl,tb-tt,10*k); ctx.fill(); ctx.stroke();
  /* 浅木纹（八道沿宽度长线，确定性微弯，clip 于台面） */
  ctx.save();
  ctx.beginPath(); ctx.roundRect(tl,tt,tr-tl,tb-tt,10*k); ctx.clip();
  ctx.strokeStyle='rgba(160,120,70,0.13)'; ctx.lineWidth=1.2;
  for(var i=1;i<=8;i++){
    var gy=tt+(tb-tt)*i/9;
    ctx.beginPath(); ctx.moveTo(tl-4,gy);
    ctx.quadraticCurveTo((tl+tr)/2,gy+(i%2?3:-3)*k,tr+4,gy);
    ctx.stroke();
  }
  ctx.restore();
}

/* ===== 层2：分区暗示（极淡色块，不抢戏）+ ?zones=1 调试参考线 ===== */
var ZONE_TINT={Z1:'151,110,60',Z2:'90,120,150',Z3:'151,110,60',Z4:'90,120,150',Z5:'150,90,110',ZT:'110,100,80'};
function drawZoneHints(){
  var id;
  for(id in ZONES){
    var r=zoneRect(id);
    ctx.fillStyle='rgba('+ZONE_TINT[id]+',0.035)';
    ctx.beginPath(); ctx.roundRect(r.x,r.y,r.w,r.h,10*k); ctx.fill();
  }
  /* 工具架底板（ZT 横条：深一档木板，右侧固定位/左侧归位槽的地基） */
  var zt=zoneRect('ZT');
  ctx.fillStyle='rgba(181,132,78,0.30)'; ctx.strokeStyle='rgba(124,90,48,0.5)'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(zt.x,zt.y+zt.h*0.25,zt.w,zt.h*0.75,6*k); ctx.fill(); ctx.stroke();
  if(!DEBUG_ZONES) return;
  ctx.save();
  ctx.strokeStyle='rgba(224,162,10,0.75)'; ctx.lineWidth=1.4; ctx.setLineDash([6,4]);
  for(id in ZONES){
    var q=zoneRect(id);
    ctx.strokeRect(q.x,q.y,q.w,q.h);
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(122,92,30,0.85)';
    ctx.font='600 '+Math.max(11,14*k)+'px sans-serif';
    ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.fillText(id+' '+ZONES[id].name,q.x+5,q.y+4);
    ctx.setLineDash([6,4]);
  }
  ctx.restore();
}

/* ===== 层3：固定承载件（铁架台/门框/轨道，§2.5）===== */
var trk=null;                                /* track_25d 返回（mounts.start/end/axis 供小车落位） */
function drawCarriers(){
  /* Z1 铁架台（后左，底座贴区底缘） */
  var p=zonePt('Z1',0.20,0.99);
  PROPS.iron_stand_25d(ctx,p.x,p.y,{h:L.standH});
  /* Z3 门框（后右，墙套框先画，门扇在层4盖入） */
  p=zonePt('Z3',0.5,0.99);
  PROPS.door_frame_25d(ctx,p.x,p.y,{w:L.frameW,h:L.frameH});
  /* Z2 轨道（中前，沿区中轴横放） */
  p=zonePt('Z2',0.5,0.45);
  trk=PROPS.track_25d(ctx,p.x,p.y,{w:L.trackW});
}

/* ===== 层4：器材层（静态摆放，§2.3 全清单；本单无物理无拖拽）===== */
function drawProps(){
  var p;
  /* --- Z1：托盘（内摆弹簧/橡皮筋/橡皮泥/玻璃瓶细管）+ 钩码组 --- */
  p=zonePt('Z1',0.75,0.98);
  var tray=PROPS.tray_25d(ctx,p.x,p.y,{w:L.trayW,slots:4});
  var slots=tray.mounts.slots;
  PROPS.spring_25d(ctx,slots[0].x,slots[0].y,{h:L.trayW*0.34});
  PROPS.rubber_band_25d(ctx,slots[1].x,slots[1].y,{w:L.trayW*0.20});
  PROPS.clay_25d(ctx,slots[2].x,slots[2].y,{s:L.trayW*0.0024});
  PROPS.bottle_tube_25d(ctx,slots[3].x,slots[3].y,{w:L.trayW*0.15,h:L.trayW*0.40});
  /* 钩码组（Z1 桌面前侧两枚：50g+100g，drawScaled 按区缩放） */
  p=zonePt('Z1',0.44,0.99);  drawScaled(PROPS.weight_hook_25d,p.x,p.y,L.hookS,{g:50});
  p=zonePt('Z1',0.52,0.985); drawScaled(PROPS.weight_hook_25d,p.x,p.y,L.hookS*1.15,{g:100});
  /* --- Z2：小车（轨道上，行车线 t=0.32）+ 木块/箱子（轨道旁） --- */
  if(trk){
    var m=trk.mounts;
    PROPS.cart_25d(ctx,m.start.x+m.axis.x*m.len*0.32,m.start.y,{w:L.cartW});
  }
  p=zonePt('Z2',0.16,0.92); PROPS.wood_block_25d(ctx,p.x,p.y,{s:L.woodS});
  p=zonePt('Z2',0.80,0.92); PROPS.box_25d(ctx,p.x,p.y,{s:L.boxS});
  /* --- Z3：门扇（盖入门框，门轴在左；三推点标记保留=后续力臂演示） --- */
  p=zonePt('Z3',0.5,0.995);
  PROPS.door_25d(ctx,p.x,p.y,{w:L.doorW,h:L.doorH});
  /* --- Z4：滑板×2 + 踩板小人×2（一胖一瘦，站上板面 deck） --- */
  p=zonePt('Z4',0.28,0.82);
  var b1=PROPS.skateboard_25d(ctx,p.x,p.y,{w:L.boardW});
  PROPS.figure_25d(ctx,b1.mounts.deck.x,b1.mounts.deck.y,{h:L.figH,variant:'fat'});
  p=zonePt('Z4',0.72,0.82);
  var b2=PROPS.skateboard_25d(ctx,p.x,p.y,{w:L.boardW});
  PROPS.figure_25d(ctx,b2.mounts.deck.x,b2.mounts.deck.y,{h:L.figH,variant:'thin'});
  /* --- Z5：气球（静置微鼓）+ 打气嘴（旁位，nozzle 朝气球） --- */
  p=zonePt('Z5',0.38,0.80);
  PROPS.balloon_25d(ctx,p.x,p.y,{r:L.balloonR,inflate:0.85});
  p=zonePt('Z5',0.74,0.90);
  PROPS.pump_25d(ctx,p.x,p.y,{h:L.pumpH});
  /* --- ZT：测力计×2（右侧固定位）+ 归位槽×3（左侧半透明占位框，R10 吸附用） --- */
  p=zonePt('ZT',0.62,0.72); PROPS.meter_25d(ctx,p.x,p.y,{h:L.meterH,needle:0});
  p=zonePt('ZT',0.74,0.72); PROPS.meter_25d(ctx,p.x,p.y,{h:L.meterH,needle:0});
  drawReturnSlots();
}
/* 归位槽（§2.4 左侧：已取下器材回归位，本单画半透明占位框） */
function drawReturnSlots(){
  var zt=zoneRect('ZT'),sw=zt.w*0.10,sh=zt.h*0.52,i;
  ctx.save();
  ctx.strokeStyle='rgba(122,92,30,0.45)'; ctx.lineWidth=1.4; ctx.setLineDash([5,4]);
  ctx.fillStyle='rgba(255,250,235,0.22)';
  for(i=0;i<3;i++){
    var sx=zt.x+zt.w*(0.05+i*0.12),sy=zt.y+zt.h*0.34;
    ctx.beginPath(); ctx.roundRect(sx,sy,sw,sh,4*k); ctx.fill(); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.fillStyle='rgba(122,92,30,0.55)';
  ctx.font='500 '+Math.max(9,11*k)+'px sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('归位槽',zt.x+zt.w*0.17,zt.y+zt.h*0.16);
  ctx.restore();
}

/* ===== 层5-9 空壳（§2.5 z 顺序预留，R10+ 实装；勿在实装前塞内容）===== */
function drawPeopleLayer(){ /* 层5 人物/动态层：小人动作、气球飞行轨迹虚线（R12+） */ }
function drawForceLayer(){ /* 层6 力矢/箭头层：推力/速度/喷气箭头（R11+） */ }
function drawCanvasUILayer(){ /* 层7 UI 控制层：画布内读数牌/滑杆（R10+；HTML 控件在 header） */ }
function drawSubtitleLayer(){ /* 层8 字幕/提示层：跟手点评、自动消散提示（§5，R13+） */ }
function drawWorkbookLayer(){ /* 层9 练习本浮层：半透遮罩+画板（§6，R15 移植 v3 判分） */ }

/* ===== 总装：一帧 = 层1→9 顺序绘制 ===== */
function draw(){
  ctx.clearRect(0,0,W,H);
  drawStage();          /* 1 舞台底色 */
  drawZoneHints();      /* 2 分区暗示（含 ?zones=1 调试参考线） */
  drawCarriers();       /* 3 固定承载件 */
  drawProps();          /* 4 器材层 */
  drawPeopleLayer();    /* 5 */
  drawForceLayer();     /* 6 */
  drawCanvasUILayer();  /* 7 */
  drawSubtitleLayer();  /* 8 */
  drawWorkbookLayer();  /* 9 */
  if(!firstFrameDone){ firstFrameDone=true; hideMask(); }
}

/* ===== P1 加载遮罩淡出（§7.1）：首帧核心元素绘制完成后触发；.35s ease-out（CSS）；结束后解锁交互 ===== */
var maskEl=document.getElementById('load-mask');
function hideMask(){
  if(!maskEl) return;
  requestAnimationFrame(function(){
    maskEl.classList.add('hide');
    var done=function(){ maskEl.removeEventListener('transitionend',done); interactive=true; STATE.ready=true; };
    maskEl.addEventListener('transitionend',done);
  });
}
/* 交互解锁 hook（本单无交互；R10 拖拽/吸附在此判 interactive 再放行） */
function canInteract(){ return interactive; }

/* ===== rAF 主循环（静态页：dirty 驱动重绘，resize/全屏后全量重算无残留）===== */
function tick(){ if(dirty){ dirty=false; draw(); } requestAnimationFrame(tick); }

/* ===== UI：重置 / 全屏（🔊 由 sfx.js 统一绑定 id=btn-mute；无场景切换按钮=蔡总明令）===== */
function on(id,ev,fn){ var el=document.getElementById(id); if(el) el.addEventListener(ev,fn); }
on('btn-reset','click',function(){
  STATE.mode='table';                        /* 原地 mutate（引擎约定）；R10+ 增加器材复位逻辑 */
  layout(); dirty=true;
  if(window.playClick) window.playClick();
});
function fullEl(){ return document.fullscreenElement||document.webkitFullscreenElement||null; }
function syncFull(){ var b=document.getElementById('btn-full'); if(b) b.textContent=(fullEl()||document.documentElement.classList.contains('pseudo-fs'))?'退出全屏':'全屏'; }
on('btn-full','click',function(){
  var el=document.documentElement;
  if(fullEl()||el.classList.contains('pseudo-fs')){
    var x=document.exitFullscreen||document.webkitExitFullscreen;
    if(fullEl()&&x) x.call(document);
    el.classList.remove('pseudo-fs');
  }else{
    var f=el.requestFullscreen||el.webkitRequestFullscreen;
    if(!f){ el.classList.add('pseudo-fs'); }
    else{ var r=f.call(el); if(r&&r.catch) r.catch(function(){ el.classList.add('pseudo-fs'); });
      setTimeout(function(){ if(!fullEl()&&!el.classList.contains('pseudo-fs')) el.classList.add('pseudo-fs'); },400); }
  }
  syncFull();
});
document.addEventListener('fullscreenchange',function(){ syncFull(); resize(); });
document.addEventListener('webkitfullscreenchange',function(){ syncFull(); resize(); });

/* ===== 启动 ===== */
window.addEventListener('resize',resize);
window.addEventListener('orientationchange',function(){ setTimeout(resize,120); });
resize();
requestAnimationFrame(tick);

/* 复验/调试出口（主会话 browser 用，勿删） */
window.C7_TABLE_DEBUG={ZONES:ZONES,zoneRect:zoneRect,zoneCenter:zoneCenter,zonePt:zonePt,get L(){return L;},get WH(){return{W:W,H:H,k:k};},canInteract:canInteract};
})();

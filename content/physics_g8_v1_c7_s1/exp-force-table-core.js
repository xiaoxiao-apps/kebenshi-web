/* ============================================================
 * exp-force-table-core.js — C7V4-R10「一张桌子」锚位系统 + 拖放状态机（R9 骨架 efff154 之上加交互层）
 * 设计书：八下-第7章-设计书-v4-返工.md §2（布局）/ §4 全节（锚位/状态机/热替换/三用位/吸附/摞叠）
 * 本单只做"能被拖、能吸附、能归位、能摞上跟着走"：无物理（弹簧振荡/翻倒/滑落属 R11-R14）
 * 状态机六态（§4.3）：idle → hover → grabbing → dragging → release → settle
 * 调试：?zones=1 分区参考线；?anchors=1 锚位十字+id+吸附圈
 * 图层序（§2.5）：1 舞台底色 → 2 分区暗示 → 3 固定承载件 → 4 器材层（注册表驱动+拖放）
 *   （5 人物动态 / 6 力矢 / 7 UI 控制 / 8 字幕 / 9 练习本浮层：仍空壳）
 * 坐标铁律：全部按画布百分比重算（ZONES/ANCHORS 常量 = 设计书 §2.2/§4.2），禁止硬编码像素
 * ============================================================ */
(function(){
'use strict';
var cv=document.getElementById('scene');
var ctx=cv.getContext('2d');
var W=960,H=600,DPR=1,k=1;                  /* k=全局视觉倍率（随画布缩放） */
var dirty=true, firstFrameDone=false, interactive=false;

/* 稳定状态对象：guide 引擎轮询用（GUIDE_CFG.state，原地 mutate 勿重赋值）；mode='table' 单场景 */
var STATE=window.C7_TABLE_STATE={mode:'table',v:'R12-phys',linked:false,lastPushPoint:null,springF:0,bandF:0,clayDent:0,bottleSqueeze:0,cart:{F:0,v:0,a:0},hint:null};   /* R12 §3.6/§3.8：cart F/v/a + hint 供 R14 测力计/R15 字幕取用 */

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
  physRecalcBasis();                                   /* R11：cmPx 变→形变像素量按新基准重算 */
  dirty=true;
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
  PHYS.cmPx=H*0.0096;                                  /* §3.1 cmPx=H×0.0096（H=画布逻辑高，随 resize 重算） */
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
  /* Z1 铁架台（后左，底座贴区底缘；mounts.hook 供 A1/A2 锚位捕获） */
  var p=zonePt('Z1',0.20,0.99);
  standGeo=PROPS.iron_stand_25d(ctx,p.x,p.y,{h:L.standH});
  /* Z3 门框（后右，墙套框先画，门扇在层4盖入） */
  p=zonePt('Z3',0.5,0.99);
  PROPS.door_frame_25d(ctx,p.x,p.y,{w:L.frameW,h:L.frameH});
  /* Z2 轨道（中前，沿区中轴横放） */
  p=zonePt('Z2',0.5,0.45);
  trk=PROPS.track_25d(ctx,p.x,p.y,{w:L.trackW});
}

/* ============================================================
 * R10 锚位系统 + 拖放状态机（设计书 §4 全节）
 * ============================================================ */

/* ===== 目标一：ANCHORS 锚位常量表（§4.2 十九条逐条；坐标=画布百分比）=====
 * xPct/yPct=规格基准位；承载件几何在首帧绘制时捕获（captureAnchors），
 * 有 mounts 实测位的锚位以实测为准（铁架台挂钩/托盘槽/轨道线/门推点/板面/气球嘴/测力计位），
 * 保证吸附十字与器材画面对齐（R6 教训：热区必须对齐实际绘制矩形）。 */
var ANCHORS={};
(function(){
  var defs=[
    {id:'A1', xPct:20,yPct:14,snapPx:16,accepts:['spring','rubber_band'],hang:true},   /* 铁架台顶挂：弹簧/橡皮筋顶端（hang=顶对齐） */
    {id:'A2', xPct:20,yPct:28,snapPx:16,accepts:['spring','rubber_band'],hang:true},   /* 铁架台底挂：底端挂钩 */
    {id:'A3', xPct:12,yPct:32,snapPx:12,accepts:['spring']},                    /* 托盘槽1 */
    {id:'A4', xPct:16,yPct:32,snapPx:12,accepts:['rubber_band']},               /* 托盘槽2 */
    {id:'A5', xPct:20,yPct:32,snapPx:12,accepts:['clay']},                      /* 托盘槽3 */
    {id:'A6', xPct:24,yPct:32,snapPx:12,accepts:['bottle_tube']},               /* 托盘槽4 */
    {id:'A7', xPct:22,yPct:16,snapPx:14,accepts:['meter'],hang:true},           /* 测力计竖挂（顶挂环，hang=顶对齐） */
    {id:'A8', xPct:50,yPct:36,snapPx:14,accepts:['meter']},                     /* 测力计横拉 */
    {id:'A9', xPct:42,yPct:42,snapPx:14,accepts:['meter']},                     /* 对拉左 */
    {id:'A10',xPct:58,yPct:42,snapPx:14,accepts:['meter']},                     /* 对拉右 */
    {id:'A11',xPct:50,yPct:41,snapPx:10,accepts:['cart'],line:true},            /* 轨道线：y=41% 基准，运行时锁定轨道行车线，小车 x 沿线自由 */
    {id:'A12',xPct:72,yPct:24,snapPx:20,accepts:['pointer']},                   /* 门推点近轴 */
    {id:'A13',xPct:80,yPct:24,snapPx:20,accepts:['pointer']},                   /* 门推点中轴 */
    {id:'A14',xPct:88,yPct:24,snapPx:20,accepts:['pointer']},                   /* 门推点远轴 */
    {id:'A15',xPct:18,yPct:78,snapPx:18,accepts:['figure']},                    /* 滑板左人 */
    {id:'A16',xPct:28,yPct:78,snapPx:18,accepts:['figure']},                    /* 滑板右人 */
    {id:'A17',xPct:79,yPct:78,snapPx:14,accepts:['balloon']},                   /* 气球位 */
    {id:'A18',xPct:65,yPct:95,snapPx:12,accepts:['meter']},                     /* 工具架测力计1 */
    {id:'A19',xPct:72,yPct:95,snapPx:12,accepts:['meter']}                      /* 工具架测力计2 */
  ];
  for(var i=0;i<defs.length;i++){
    var d=defs[i];
    ANCHORS[d.id]={id:d.id,xPct:d.xPct,yPct:d.yPct,snapPx:d.snapPx,accepts:d.accepts,line:!!d.line,hang:!!d.hang,x:null,y:null};
  }
})();
/* anchorAt(id)：换算像素坐标（随 layout/首帧几何捕获重算；未捕获前回退百分比基准位） */
function anchorAt(id){
  var a=ANCHORS[id];
  return {x:(a.x!=null?a.x:a.xPct/100*W), y:(a.y!=null?a.y:a.yPct/100*H)};
}
function anchorAccepts(a,type){ return a.accepts.indexOf(type)>=0; }
var DEBUG_ANCHORS=(function(){ try{ return new URLSearchParams(location.search).get('anchors')==='1'; }catch(e){ return false; } })();
var DEBUG_PHYS=(function(){ try{ return new URLSearchParams(location.search).get('physics')==='1'; }catch(e){ return false; } })();

/* ===== 物品注册表 ITEMS（§2.3 可拖清单；homePct=初始底面中心百分比位）=====
 * kind: item=可拖器材 / carrier=可拖且顶面可摞 / fixed=承载件不拖（门扇仅推点热区，见目标五）
 * 悬挂语义：anchor='top' 吸附时锚点对齐物品顶端挂环（弹簧/测力计），默认对齐底面中心（§4.1） */
var ITEMS=[
  {id:'spring',      type:'spring',       prop:'spring_25d',      kind:'item',    homeAnchor:'A3', anchor:'top',
   opt:function(it){ if(it.anchorId==='A1'&&it.ph){ return {h:Math.max(20,it.ph.L0px+it.ph.ext)}; } return it.anchorId==='A1'?{h:Math.max(20,anchorAt('A2').y-anchorAt('A1').y)}:{h:L.trayW*0.34}; }},
  {id:'rubber_band', type:'rubber_band',  prop:'rubber_band_25d', kind:'item',    homeAnchor:'A4', anchor:'top',
   opt:function(it){ var w0=it.anchorId==='A1'?Math.max(16,(anchorAt('A2').y-anchorAt('A1').y)*0.30):L.trayW*0.20; if(it.anchorId==='A1'&&it.ph){ w0+= it.ph.ext*0.9; } return {w:w0}; }},
  {id:'clay',        type:'clay',         prop:'clay_25d',        kind:'item',    homeAnchor:'A5', opt:function(){ return {s:L.trayW*0.0024}; }},
  {id:'bottle_tube', type:'bottle_tube',  prop:'bottle_tube_25d', kind:'item',    homeAnchor:'A6', opt:function(){ return {w:L.trayW*0.15,h:L.trayW*0.40}; }},
  {id:'hook50',      type:'weight_hook',  prop:'weight_hook_25d', kind:'item',    homePct:{x:31.2,y:35.6}, stackable:true,
   opt:function(){ return {g:50}; }, size:function(){ return {w:34*L.hookS*k+14,h:40*L.hookS*k+10}; }},
  {id:'hook100',     type:'weight_hook',  prop:'weight_hook_25d', kind:'item',    homePct:{x:35.2,y:35.4}, stackable:true,
   opt:function(){ return {g:100}; }, size:function(){ return {w:40*L.hookS*1.15*k+14,h:44*L.hookS*1.15*k+10}; }},
  {id:'cart',        type:'cart',         prop:'cart_25d',        kind:'carrier', homeAnchor:'A11', homeT:0.32,
   opt:function(){ return {w:L.cartW}; }},
  {id:'wood_block',  type:'wood_block',   prop:'wood_block_25d',  kind:'carrier', homePct:{x:39.1,y:53.1},
   opt:function(){ return {s:L.woodS}; }},
  {id:'box',         type:'box',          prop:'box_25d',         kind:'carrier', homePct:{x:59.8,y:53.1}, stackable:true,
   opt:function(){ return {s:L.boxS}; }},
  {id:'door',        type:'door',         prop:'door_25d',        kind:'fixed',   homePct:{x:80,y:37.7},
   opt:function(){ return {w:L.doorW,h:L.doorH}; }},
  {id:'figure_fat',  type:'figure',       prop:'figure_25d',      kind:'item',    homeAnchor:'A15',
   opt:function(){ return {h:L.figH,variant:'fat'}; }},
  {id:'figure_thin', type:'figure',       prop:'figure_25d',      kind:'item',    homeAnchor:'A16',
   opt:function(){ return {h:L.figH,variant:'thin'}; }},
  {id:'balloon',     type:'balloon',      prop:'balloon_25d',     kind:'item',    homeAnchor:'A17',
   opt:function(){ return {r:L.balloonR,inflate:0.85}; }},
  {id:'meter1',      type:'meter',        prop:'meter_25d',       kind:'item',    homeAnchor:'A18', anchor:'top',
   opt:function(){ return {h:L.meterH,needle:0}; }},
  {id:'meter2',      type:'meter',        prop:'meter_25d',       kind:'item',    homeAnchor:'A19', anchor:'top',
   opt:function(){ return {h:L.meterH,needle:0}; }}
];
var ITEM_BY_ID={};
(function(){ for(var i=0;i<ITEMS.length;i++){ var it=ITEMS[i];
  it.x=0; it.y=0; it.w=0; it.h=0;          /* 运行时几何（每帧绘制后回写，命中判定用） */
  it.dx=0; it.dy=0; it.mnt=null;           /* 实际绘制位 / props mounts 实测 */
  it.anchorId=it.homeAnchor||null; it.anchorId2=null; it.parent=null;   /* 初始即锁 home 锚位（§4.2 摆放清单） */
  it.state='idle'; it.linked=false; it.flying=false;
  ITEM_BY_ID[it.id]=it; } })();
function isDraggable(it){ return it.kind!=='fixed'; }

/* captureAnchors：绘制期捕获承载件 mounts → 覆盖锚位像素坐标（对齐实际绘制位）
 * 覆盖原则：凡有实测 mounts 的锚位用实测（R6 教训：热区必须对齐实际绘制矩形）；无实测的保持 §4.2 百分比基准 */
var standGeo=null;
function captureAnchors(){
  var a,i;
  if(trayGeo&&trayGeo.mounts&&trayGeo.mounts.slots){
    var sl=trayGeo.mounts.slots;
    for(i=0;i<4;i++){ a=ANCHORS['A'+(3+i)]; if(sl[i]){ a.x=sl[i].x; a.y=sl[i].y; } }   /* A3~A6 托盘槽实测 */
  }
  if(standGeo&&standGeo.mounts){
    a=ANCHORS.A1; a.x=standGeo.mounts.hook.x; a.y=standGeo.mounts.hook.y;               /* A1=横臂右段挂钩实测 */
    a=ANCHORS.A2; a.x=standGeo.mounts.hook.x;                                           /* A2=顶挂正下方悬挂列（y 保持 §4.2 28%） */
  }
  if(trk&&trk.mounts){
    a=ANCHORS.A11;
    if(a.y==null) a.x=trk.mounts.start.x+trk.mounts.len*0.32;  /* x=轨道线初始落位（仅首帧；line 锚 x 不作为锁定坐标） */
    a.y=trk.mounts.start.y;                                    /* y=轨道行车线实测（§4.2 y=41% 基准的实测线） */
  }
  if(doorGeo&&doorGeo.mounts){
    var pp=[doorGeo.mounts.pushNear,doorGeo.mounts.pushMid,doorGeo.mounts.pushFar];
    for(i=0;i<3;i++){ a=ANCHORS['A'+(12+i)]; if(pp[i]){ a.x=pp[i].x; a.y=pp[i].y; } }    /* A12~A14 门推点实测 */
  }
  if(b1Geo&&b1Geo.mounts){ a=ANCHORS.A15; a.x=b1Geo.mounts.deck.x; a.y=b1Geo.mounts.deck.y; }
  if(b2Geo&&b2Geo.mounts){ a=ANCHORS.A16; a.x=b2Geo.mounts.deck.x; a.y=b2Geo.mounts.deck.y; }
  var zt=zoneRect('ZT');
  a=ANCHORS.A18; a.x=zt.x+zt.w*0.62; a.y=zt.y+zt.h*0.72;                                /* 工具架固定位（§4.2 65%/72%,95% 的实测 drawing 位） */
  a=ANCHORS.A19; a.x=zt.x+zt.w*0.74; a.y=zt.y+zt.h*0.72;
}
/* syncItemsToAnchors：吸附锁定/复位/resize 后把物品 base 对齐锚位像素（锚位随 layout 重算即跟随；line 锚只锁 y） */
function syncItemsToAnchors(){
  for(var i=0;i<ITEMS.length;i++){
    var it=ITEMS[i];
    if(it.anchorId){
      var p=anchorAt(it.anchorId);
      if(ANCHORS[it.anchorId].line) it.y=p.y;
      else setItemPos(it,p.x,p.y);
    }
  }
}
window.addEventListener('resize',function(){ syncItemsToAnchors(); });
/* setItemPos：按 anchor 语义落 base（§4.1：器材锚=底面中心；悬挂件顶端为挂点 → top 语义件 base=锚位y+高） */
function setItemPos(it,x,y){
  var a=it.anchorId?ANCHORS[it.anchorId]:null;
  if(a&&a.hang){ it.x=x; it.y=y+(it.h||0); }                  /* hang 锚（A1/A2/A7）：顶挂环对齐锚位，base=锚位y+高 */
  else { it.x=x; it.y=y; }                                    /* 其余锚/槽/架：底面中心对齐锚位（§4.1） */
}

/* ===== 层4：器材层（R10 起物品注册表驱动：状态机视觉 + 摞叠跟随 + 热替换补间）===== */
function drawProps(){
  var p=zonePt('Z1',0.75,0.98);
  trayGeo=PROPS.tray_25d(ctx,p.x,p.y,{w:L.trayW,slots:4});   /* 托盘=固定承载摆件；槽位 mounts 供 A3~A6 捕获 */
  p=zonePt('Z4',0.28,0.82); b1Geo=PROPS.skateboard_25d(ctx,p.x,p.y,{w:L.boardW});
  p=zonePt('Z4',0.72,0.82); b2Geo=PROPS.skateboard_25d(ctx,p.x,p.y,{w:L.boardW});
  p=zonePt('Z5',0.74,0.90); PROPS.pump_25d(ctx,p.x,p.y,{h:L.pumpH});
  drawReturnSlots();                                          /* ZT 左侧归位槽占位框（§2.4） */
  captureAnchors();
  var i;
  for(i=0;i<ITEMS.length;i++){                                /* 锚位锁定件随锚位像素对齐（resize/全屏后跟随重算；line 锚只锁 y）
                                                                 * 跳过拖动中/补间中的件：拖离锚位时不得被拽回（release 判定后才落新锁） */
    var q=ITEMS[i];
    if(q.anchorId&&q!==drag.item&&!isTweening(q)){
      var ap=anchorAt(q.anchorId);
      if(ANCHORS[q.anchorId].line){ if(!q.homeT2) q.y=ap.y; }   /* 复位帧（homeT2）等 drawItemRaw 按 homeT 落位，不抢跑 */
      else setItemPos(q,ap.x,ap.y);
    }
  }
  for(i=0;i<ITEMS.length;i++){ if(ITEMS[i]!==drag.dragItem) drawItem(ITEMS[i]); }
  if(drag.dragItem) drawItem(drag.dragItem);                  /* 拖动件最后画=盖在最上（§2.5 层4内子序） */
  drawLinkedCheck();
  doorPushTick();
  if(DEBUG_ANCHORS) drawAnchorDebug();
}
/* drawItem：单件绘制 + §4.3 状态机视觉（hover 描边1.5px亮度+8% / grabbing 放大1.04阴影加深 / dragging 半透明0.9） */
function drawItem(it){
  if(!it.w&&!it.h&&it.id!=='cart'){                            /* 首帧初始位（小车走 drawItemRaw 轨道落位，不在此初始化） */
    if(it.homePct){ it.x=it.homePct.x/100*W; it.y=it.homePct.y/100*H; }
    else if(it.homeAnchor){ var hp=anchorAt(it.homeAnchor); it.x=hp.x; it.y=hp.y; }
  }
  var st=it.state;
  if(st==='hover'){                                         /* 亮度+8% + 描边高亮 1.5px（§4.3 hover 行） */
    ctx.save(); ctx.filter='brightness(1.08)';
    var g=drawItemRaw(it);
    ctx.restore();
    outlineGeo(g,it.w,it.h,1.5);
  }else if(st==='grabbing'||st==='dragging'){               /* grabbing 放大1.04阴影加深；dragging 半透明0.9（§4.3） */
    ctx.save();
    if(st==='grabbing'){ ctx.shadowColor='rgba(60,40,10,0.55)'; ctx.shadowBlur=16*k; ctx.shadowOffsetY=5*k; }
    ctx.globalAlpha=(st==='dragging')?0.9:1;
    ctx.translate(it.x,it.y);
    var sc=(st==='grabbing')?1.04:1;
    ctx.scale(sc,sc); ctx.translate(-it.x,-it.y);
    drawItemRaw(it);
    ctx.restore();
  }else{
    drawItemRaw(it);
  }
  if(it.type==='spring'&&it.ph&&it.ph.flashT0) drawSpringFlash(it,performance.now());   /* R11：超弹性限度红闪 */
  if(it.type==='bottle_tube'&&it.ph) drawBottleLiquid(it);                              /* R11：细管液柱 h₀+dh */
}
/* drawItemRaw：真实绘制并回写几何（w/h/mounts 实测），绘制位=base（悬挂/竖挂姿态由 setItemPos+opt 已算好） */
var trayGeo=null,doorGeo=null,b1Geo=null,b2Geo=null;
function drawItemRaw(it){
  var dx=it.x,dy=it.y,opt=it.opt?it.opt(it):{},g;
  if(it.id==='rubber_band'&&it.anchorId==='A1'){              /* 悬挂拉伸：环心挂于 A1 下方（顶缘对齐挂点） */
    dy=anchorAt('A1').y+(opt.w||20)*0.28;
  }
  if(it.id==='cart'&&it.anchorId==='A11'&&trk&&trk.mounts&&it!==drag.dragItem&&!it.parent&&!isTweening(it)){   /* 锁 A11 时小车 y 锁轨道行车线（§4.1）；R12：桌面自由态（anchorId=null）不再锁线 */
    dy=trk.mounts.start.y; it.y=dy;
    if(!it.x||it.homeT2){ it.x=dx=trk.mounts.start.x+trk.mounts.len*(it.homeT!=null?it.homeT:0.32); it.homeT2=false; }   /* 初始/复位帧落位 t=0.32（§2.3） */
  }
  if(it.prop==='weight_hook_25d'){ g=drawScaledRet(PROPS[it.prop],dx,dy,(it.id==='hook100'?L.hookS*1.15:L.hookS),opt); }
  else if(it.type==='clay'&&it.ph&&it.ph.dent>0){             /* R11 §3.4 塑性凹陷：体积守恒竖squash+侧向鼓出 */
    var dFrac=Math.min(PHYS.clay.dentCap,it.ph.dentCm/3);      /* 凹陷/原高3cm，上限60% */
    var sy=1-dFrac, sx=1/Math.sqrt(sy);                        /* sx²·sy≈1 体积守恒 */
    ctx.save(); ctx.translate(dx,dy); ctx.scale(sx,sy); ctx.translate(-dx,-dy);
    g=PROPS[it.prop](ctx,dx,dy,opt);
    ctx.restore();
  }
  else if(it.ph&&it.ph.r12&&(it.ph.rot||it.ph.tilt||it.ph.side)){   /* R12：翻倒旋转(绕前底边 §3.8) + 滑倾(绕底心) + 侧偏(≤8° §3.6) */
    var rotAll=it.ph.rot+it.ph.tilt+it.ph.side,sgn=it.ph.rot>=0?1:-1,pvx,pvy;
    if(it.ph.rot){ pvx=dx+sgn*(it.w||0)/2; pvy=dy; }           /* 翻倒：绕前底边（推方向一侧底角） */
    else { pvx=dx; pvy=dy; }                                    /* 滑倾/侧偏：绕底面中心 */
    ctx.save(); ctx.translate(pvx,pvy); ctx.rotate(rotAll); ctx.translate(-pvx,-pvy);
    g=PROPS[it.prop](ctx,dx,dy,opt);
    ctx.restore();
  }
  else { g=PROPS[it.prop](ctx,dx,dy,opt); }
  it.dx=dx; it.dy=dy;
  if(g){
    if(g.w&&g.h){ it.w=g.w; it.h=g.h; }
    else if(it.size){ var sz=it.size(); it.w=sz.w; it.h=sz.h; }
    if(g.mounts) it.mnt=g.mounts;
    if(it.id==='door') doorGeo=g;
  }
  return g;
}
/* drawScaledRet：drawScaled 的带返回值版（钩码 mounts/w/h 回写用） */
function drawScaledRet(fn,x,y,s,opt){
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
  var r=fn(ctx,0,0,opt||{});
  ctx.restore();
  if(r){ r={w:(r.w||0)*s,h:(r.h||0)*s,base:{x:x,y:y},mounts:r.mounts}; }
  return r;
}
/* outlineGeo：离屏 alpha 扩边法画 1.5px 描边高亮（§4.3 hover；不依赖 props 内部路径）
 * 离屏同尺寸同 DPR：①剪影四向偏移 lw 印出扩边 alpha → ②source-in 上橙色 → ③destination-out 抠掉原轮廓 → ④边环 1:1 印回 */
var hlCv=null,hlCtx=null;
function outlineGeo(g,w,h,lw){
  var it=hoverItem||drag.dragItem;
  if(!it||!w||!h) return;
  if(!hlCv){ hlCv=document.createElement('canvas'); hlCtx=hlCv.getContext('2d'); }
  if(hlCv.width!==cv.width||hlCv.height!==cv.height){ hlCv.width=cv.width; hlCv.height=cv.height; }
  hlCtx.setTransform(1,0,0,1,0,0); hlCtx.clearRect(0,0,hlCv.width,hlCv.height);
  hlCtx.setTransform(DPR,0,0,DPR,0,0);
  var opt=it.opt?it.opt(it):{},s=(it.id==='hook100'?L.hookS*1.15:L.hookS),d,ang;
  function stamp(ox,oy){                                      /* 在离屏 (dx+ox,dy+oy) 处画一遍物品剪影 */
    if(it.prop==='weight_hook_25d'){
      hlCtx.save(); hlCtx.translate(it.dx+ox,it.dy+oy); hlCtx.scale(s,s); PROPS[it.prop](hlCtx,0,0,opt); hlCtx.restore();
    }else{
      PROPS[it.prop](hlCtx,it.dx+ox,it.dy+oy,opt);
    }
  }
  for(d=0;d<4;d++){                                           /* ① 扩边 alpha */
    ang=d*Math.PI/2;
    stamp(Math.cos(ang)*lw,Math.sin(ang)*lw);
  }
  hlCtx.globalCompositeOperation='source-in';                 /* ② 上色 */
  hlCtx.fillStyle='rgba(255,170,40,0.95)';
  hlCtx.setTransform(1,0,0,1,0,0);
  hlCtx.fillRect(0,0,hlCv.width,hlCv.height);
  hlCtx.setTransform(DPR,0,0,DPR,0,0);
  hlCtx.globalCompositeOperation='destination-out';           /* ③ 抠掉原轮廓，只留 lw 宽边环 */
  stamp(0,0);
  hlCtx.globalCompositeOperation='source-over';
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);                              /* ④ 像素级 1:1 印回（两边同 DPR 变换） */
  ctx.drawImage(hlCv,0,0);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.restore();
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

/* ============================================================
 * 目标二：拖放状态机（§4.3 六态：idle → hover → grabbing → dragging → release → settle）
 * 指针统一走 canvas pointerdown/move/up（含 touch；html 已 touch-action:none）
 * 命中=base+w/h 包围盒 + 命中容差 10px（§4.6 8~12px 取中）
 * ============================================================ */
var drag={item:null,ox:0,oy:0,moved:false,downT:0};
var hoverItem=null, pushHover=null;
var STATE_GRAB_TO_DRAG_MS=16;                                 /* grabbing 1 帧后入 dragging（§4.3） */
function hitTest(px,py){
  var TOL=10;                                                 /* §4.6 命中容差 8~12px，取 10px */
  for(var i=ITEMS.length-1;i>=0;i--){
    var it=ITEMS[i];
    if(!isDraggable(it)||it.flying) continue;                 /* R12：翻倒动画期 flying=true 不可抓（目标五） */
    if(it.ph&&it.ph.toppled){                                 /* R12：翻倒件 hitTest 用旋转后包围盒近似（绕前底边倒 90°，中心偏移 (w+h)/2） */
      var cx=it.x+it.ph.toppleDir*((it.w||0)+(it.h||0))/2;
      if(px>=cx-(it.h||0)/2-TOL&&px<=cx+(it.h||0)/2+TOL&&py>=it.y-(it.w||0)-TOL&&py<=it.y+TOL) return it;
      continue;
    }
    if(px>=it.x-it.w/2-TOL&&px<=it.x+it.w/2+TOL&&py>=it.y-it.h-TOL&&py<=it.y+TOL) return it;
  }
  return null;
}
/* 门推点热区（目标五：A12~A14 仅 hover 高亮 + 记录 lastPushPoint，本单不转门=物理属 R13） */
function doorPushHit(px,py){
  var d=ITEM_BY_ID.door;
  if(!d.mnt) return null;
  var pts=[[d.mnt.pushNear,'A12'],[d.mnt.pushMid,'A13'],[d.mnt.pushFar,'A14']],i;
  for(i=0;i<3;i++){
    if(pts[i][0]&&Math.abs(px-pts[i][0].x)<=ANCHORS[pts[i][1]].snapPx&&Math.abs(py-pts[i][0].y)<=ANCHORS[pts[i][1]].snapPx)
      return {id:pts[i][1],x:pts[i][0].x,y:pts[i][0].y};
  }
  return null;
}
function setCursor(c){ if(cv.style.cursor!==c) cv.style.cursor=c; }   /* cursor 落点=canvas style（§4.3 hover/grabbing 行） */
function setState(it,st){ if(it&&it.state!==st){ it.state=st; dirty=true; } }
function setHover(it){
  if(hoverItem===it) return;
  if(hoverItem&&hoverItem.state==='hover') setState(hoverItem,'idle');   /* settle→idle：高亮消失（§4.3） */
  hoverItem=it;
  if(it&&it.state==='idle') setState(it,'hover');
  if(!drag.item) setCursor(it?'grab':(pushHover?'pointer':'default'));
}

/* ===== 补间引擎（吸附/热替换/回稳共用；无物理积分，纯几何插值）===== */
var tweens=[];
function easeOut(t){ return 1-Math.pow(1-t,3); }
/* easeOutOvershoot：吸附 0.2s ease-out 末尾过冲 ~3px 再收（§4.6 允许过冲 2~4px） */
function easeOutOvershoot(t){ return 1+2.72*Math.pow(t-1,3)+1.72*Math.pow(t-1,2); }
function addTween(o){ o.t0=performance.now(); o.done=false; tweens.push(o); return o; }
function isTweening(it){ for(var i=0;i<tweens.length;i++){ if(tweens[i].it===it&&!tweens[i].done) return true; } return false; }
function killTweensOf(it){ for(var i=tweens.length-1;i>=0;i--){ if(tweens[i].it===it) tweens[i].done=true; } }
function stepTweens(now){
  /* grabbing 1 帧后入 dragging（§4.3；rAF 每帧检查） */
  if(drag.item&&drag.item.state==='grabbing'&&now-drag.downT>=STATE_GRAB_TO_DRAG_MS){
    setState(drag.item,'dragging'); setCursor('grabbing');
  }
  var alive=false,i;
  for(i=0;i<tweens.length;i++){
    var tw=tweens[i];
    if(tw.done) continue;
    alive=true;
    var t=Math.min(1,(now-tw.t0)/tw.dur),e=tw.ease(t);
    var nx=tw.x0+(tw.x1-tw.x0)*e,ny=tw.y0+(tw.y1-tw.y0)*e;
    moveChildren(tw.it,nx-tw.it.x,ny-tw.it.y);                /* 载体补间（吸附/飞回）时背上摞件同步跟随（目标六） */
    tw.it.x=nx; tw.it.y=ny;
    if(tw.step) tw.step(tw.it,e);
    if(t>=1){ tw.done=true; if(tw.onEnd) tw.onEnd(tw.it); }
  }
  if(alive) dirty=true;
  for(i=tweens.length-1;i>=0;i--){ if(tweens[i].done) tweens.splice(i,1); }
}

/* ============================================================
 * R11 铁架台区四件形变器材物理（设计书 §3.1-§3.5）
 * 只动 spring/rubber_band/clay/bottle_tube；小车/木块/门/滑板/气球属 R12-R13，测力计读数属 R14，本单不碰
 * ============================================================ */
var PHYS={
  g:9.8,                    /* §3.1 重力加速度 m/s² */
  dt:1/60,                  /* §3.1 步长 s（与 rAF 同步） */
  eps:0.3,                  /* §3.1 稳定阈值 px/帧（|v|<ε 视为停稳） */
  cmPx:1,                   /* §3.1 =H×0.0096，layout() 内赋值 */
  spring:{k:100,F_yield:4.5,zeta:0.20,wn:12,L0cm:8,resRatio:0.30},      /* §3.2：k=100N/m(80~120中)、ζ=0.20(0.15~0.25中)、ωₙ=12(8~15中)、F_yield=4.5N、residual=超限30% */
  band:{k1:30,k2:15,zeta:0.40,wn:8,L0cm:6,unload:0.7,permPull:0.005,permCap:0.03}, /* §3.3：加载F=k₁ΔL+k₂ΔL²、卸载×0.7迟滞、ζ=0.40(0.35~0.5中)、残余≤3%L₀(单次~0.5%) */
  clay:{coef:0.04,pressK:1000,dentCap:0.60,rebound:0},                  /* §3.4：d=coef·√F(cm/√N)、回弹率0、上限60%原高 */
  bottle:{h0cm:5,kSqueeze:2.5,zeta:0.30,wn:10,areaRatio:40},            /* §3.5：h₀=5cm、k_squeeze=2.5cm/单位、ζ=0.30(0.25~0.4中)、截面积比≈40(放大量语义) */
  /* ===== R12 扩展参数组（§3.6-§3.10，轨道区/桌面区平动+翻倒+摞叠）===== */
  cart:{m:0.5,Fmax:8,muTrack:0.03,muTable:0.2,eEdge:0.5,sideMaxDeg:8,Kc:100,couplGapPx:50}, /* §3.6：m=0.5kg、F_push_max=8N(超过截断)、μ_track=0.03(0.02~0.05取中)、μ_table=0.2(0.15~0.25取中)、e_edge=0.5(0.4~0.6取中)、侧偏≤8°不脱轨、Kc=手-车耦合刚度N/m、couplGap=脱手间隙 */
  block:{m:0.15,muS:0.25,muK:0.25,arrowCmPerMs:3,tiltMaxDeg:10},       /* §3.7：木块 μ=0.25(静摩擦阈值F>μN才启动/动摩擦同值)、速度箭头比例取「1(m/s)=3cm」视觉直映(F=ma 等效力换算的另一取法，此处取直接比例)、滑倾上限10°；m=0.15kg(设计书未给，本单取值：阈值F=μmg≈0.37N 轻推不动语义成立) */
  stack:{muStack:0.35,eFall:0.3,maxLayers:3,boxM:0.2,hook50M:0.05,hook100M:0.1} /* §3.9/§3.10：滑落判据 a_carrier>μ_stack·g(μ_stack=0.35)、坠落回弹 e≈0.3、摞高≤3层(超3层 STATE hint)、box=0.2kg/hook50=0.05kg/hook100=0.1kg(m_total 合成 §3.6) */
};
/* 形变件 ph 动态量：ext=超自然长伸长px / v=px/s / residual=永久形变px / oscillating=解析衰减中 / asleep=静止零开销
 * clay: dent=凹陷px(持久) pressDepth=按压位移px；bottle: dh=液柱偏移px(+=升) squeeze=捏强度 */
function physInit(it){
  if(it.type==='spring'||it.type==='rubber_band'){
    var cfg=it.type==='spring'?PHYS.spring:PHYS.band;
    it.ph={L0cm:cfg.L0cm,L0px:cfg.L0cm*PHYS.cmPx,ext:0,v:0,residual:0,permanent:0,
           oscillating:false,t0:0,A0:0,asleep:true,F:0,maxExt:0,flashed:false,flashT0:0,loading:true};
  }else if(it.type==='clay'){
    it.ph={dent:0,dentCm:0,pressDepth:0,F:0,asleep:true};
  }else if(it.type==='bottle_tube'){
    it.ph={h0px:PHYS.bottle.h0cm*PHYS.cmPx,dh:0,v:0,squeeze:0,oscillating:false,t0:0,A0:0,asleep:true};
  }
}
(function(){ for(var i=0;i<ITEMS.length;i++){ var t=ITEMS[i].type;
  if(t==='spring'||t==='rubber_band'||t==='clay'||t==='bottle_tube') physInit(ITEMS[i]); } })();
/* resize：cmPx 变→按新基准重算像素量，不残留旧像素值（验收·目标六） */
function physRecalcBasis(){
  for(var i=0;i<ITEMS.length;i++){ var it=ITEMS[i],ph=it.ph; if(!ph) continue;
    if(it.type==='spring'||it.type==='rubber_band'){
      ph.L0px=ph.L0cm*PHYS.cmPx;                             /* 自然长按新 cmPx 重算 */
      ph.ext=ph.residual; ph.oscillating=false; ph.asleep=true; ph.v=0;   /* 振荡/拉伸中断，回落平衡位（残留旧像素清零） */
    }else if(it.type==='bottle_tube'){ ph.h0px=PHYS.bottle.h0cm*PHYS.cmPx; ph.dh=0; ph.oscillating=false; ph.asleep=true; }
    else if(it.type==='clay'){ ph.dent=ph.dentCm*PHYS.cmPx; }  /* 凹陷持久，按新 cmPx 重算像素 */
  }
  physRebaseR12();                                             /* R12：清帧间差分基准（速度 m/s 与像素无关，不残留旧值） */
}
/* 解析欠阻尼：x(τ)=A0·e^(-ζωₙτ)·cos(ωₙ√(1-ζ²)·τ)（§3.2 落码，验收3 grep 证明） */
function physOsc(A0,zeta,wn,tau){
  var wd=wn*Math.sqrt(1-zeta*zeta);                         /* 阻尼固有频率 ωₙ√(1-ζ²) */
  return A0*Math.exp(-zeta*wn*tau)*Math.cos(wd*tau);        /* e^(-ζωₙt)·cos(ωₙ√(1-ζ²)t) */
}
/* physicsStep：只对四件激活自由度积分，asleep 件零开销（目标一） */
function physicsStep(now){
  var i,active=false;
  for(i=0;i<ITEMS.length;i++){
    var it=ITEMS[i],ph=it.ph; if(!ph) continue;
    if(it.type==='spring'||it.type==='rubber_band'){
      if(ph.oscillating){
        var cfg=it.type==='spring'?PHYS.spring:PHYS.band;
        var tau=(now-ph.t0)/1000;
        var x=physOsc(ph.A0,cfg.zeta,cfg.wn,tau);           /* 弹性回缩位移（相对平衡=自然长+residual） */
        var xPrev=ph.ext-ph.residual;
        ph.v=(x-xPrev)/PHYS.dt;                             /* px/s 近似（帧间差分） */
        ph.ext=ph.residual+x;
        if(it.type==='rubber_band') physBandForce(it,ph.v>0);   /* 迟滞=橡胶内耗 §3.3：伸=加载/缩=卸载×0.7 */
        else physSpringForce(it);                              /* 弹簧回弹力 F=k·ΔL 写入 STATE（供 R14 测力计） */
        if(Math.abs(ph.v*PHYS.dt)<PHYS.eps&&Math.abs(x)<0.5){ ph.ext=ph.residual; ph.v=0; ph.oscillating=false; ph.asleep=true; } /* |v|<0.3px/帧 且 |x-x_eq|<0.5px→asleep */
        active=true;
      }
      if(ph.flashT0&&now-ph.flashT0>300) ph.flashT0=0;      /* 红闪 0.3s */
    }else if(it.type==='bottle_tube'){
      if(ph.oscillating){
        var tau2=(now-ph.t0)/1000;
        var dh=physOsc(ph.A0,PHYS.bottle.zeta,PHYS.bottle.wn,tau2);
        var dhPrev=ph.dh; ph.v=(dh-dhPrev)/PHYS.dt; ph.dh=dh;
        if(Math.abs(ph.v*PHYS.dt)<PHYS.eps&&Math.abs(dh)<0.5){ ph.dh=0; ph.v=0; ph.oscillating=false; ph.asleep=true; } /* 回 h₀ 无余差 */
        active=true;
      }
    }
    /* clay 塑性：无振荡，dent 持久，仅按压中更新（见 pointermove） */
  }
  if(active) dirty=true;
  physStepR12(now);                                            /* R12 接缝：cart/木块/box/钩码积分入口（上方 R11 四形变分支一行未改） */
  if(DEBUG_PHYS) dirty=true;
}
/* ============================================================
 * R12 轨道区/桌面区平动物理（设计书 §3.6-§3.10）
 * cart 推力加速+惯性滑行+桌缘/轨道端碰撞回弹+翻倒；wood_block 滑动+静摩擦阈值+翻倒+速度箭头；
 * box/钩码 摞叠随动(R10 moveChildren 不动)+滑落+坠落+砝码质量合成。
 * 门转动/滑板动量/气球反冲属 R13，测力计读数属 R14，本单不碰；R11 四形变分支一行不改。
 * ============================================================ */
var R12_MASS={cart:0.5,wood_block:0.15,box:0.2,hook50:0.05,hook100:0.1};   /* §3.6/§3.10 kg：block 0.15 为本单取值(见 PHYS.block 注释) */
function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function sign(v){ return v>0?1:(v<0?-1:0); }
function cartOnTrack(it){ return it.anchorId==='A11'; }        /* §3.6 在轨道上判据=锁 A11（μ=0.03），否则桌面 μ=0.2 */
/* 载重合成（§3.6/§3.10）：m_total=m_self+Σ摞件(递归，box 0.2/hook50 0.05/hook100 0.1/木块 0.15) */
function computeTotalMass(it){
  var m=R12_MASS[it.id]||0;
  for(var i=0;i<ITEMS.length;i++){ var c=ITEMS[i]; if(c.parent===it) m+=computeTotalMass(c); }
  return m;
}
/* §3.8 翻倒判据通用函数（cart/wood_block/box 共用）：F·h > m·g·(w/2) 时绕前底边翻转
 * F=水平推力N、h=作用点高度m(自底面)、m=总质量kg、w=底宽m；返回 {over:是否翻转, ratio:F·h/(m·g·w/2)} */
function toppleCrit(F,h,m,w){
  var res=m*PHYS.g*(w/2);
  return {over:Math.abs(F)*h>res, ratio:res>0?Math.abs(F)*h/res:0};
}
/* R12 ph 初始化（slidable 五件；R11 physInit 四形变分支不动） */
function physInitR12(it){
  if(!R12_MASS[it.id]) return;
  it.ph={r12:true,slidable:true,vx:0,vy:0,a:0,F:0,rot:0,tilt:0,side:0,mode:null,asleep:true,
         toppled:false,toppleDir:1,toppleT0:0,mTotal:R12_MASS[it.id],
         prevX:it.x,frameV:0,frameVPrev:0,grabOffX:0,pushH:0,tier:null,
         slip:false,groundY:0,bounced:0};
}
(function(){ for(var i=0;i<ITEMS.length;i++) physInitR12(ITEMS[i]); })();
/* resize：速度单位 m/s 与像素无关，仅清帧间差分基准防 a_est 尖峰（沿 R11 physRebase 语义，不残留旧像素值） */
function physRebaseR12(){
  for(var i=0;i<ITEMS.length;i++){ var ph=ITEMS[i].ph; if(ph&&ph.r12){ ph.prevX=ITEMS[i].x; ph.frameV=0; ph.frameVPrev=0; } }
}
/* ===== 推模式（phys.mode='push'）：轨道小车 pointerdown 直进；木块/箱子沿 R11 进入条件（位移<6px 且按住>150ms）===== */
function startPush(it,p){
  var ph=it.ph;
  phys.mode='push'; phys.item=it; phys.pressCand=false;
  drag.item=null;                                              /* 推≠拖：车不跟手，力由手-车间隙折算（目标五） */
  killTweensOf(it); setState(it,'grabbing'); setCursor('grabbing');
  ph.asleep=false; ph.mode='push'; ph.slip=false; ph.vx=0; ph.vy=0;
  it.parent=null;                                              /* R12：被推摞件即脱离载体（防 R10 随动与推积分双重位移） */
  phys.startPointerX=p.x; phys.startPointerY=p.y; phys.lastX=p.x; phys.lastY=p.y; phys.downT=performance.now();
  ph.grabOffX=p.x-it.x;                                        /* 接触点相对体心偏移（推跟手用） */
  ph.pushH=Math.max(0,it.y-p.y);                               /* 作用点高度 h（自底面，px） */
  var Hh=it.h||1;
  ph.tier=(ph.pushH>=Hh*2/3)?'top':((ph.pushH>Hh/3)?'mid':'bottom');   /* §3.8 三段分档 */
  ph.mTotal=computeTotalMass(it);                              /* §3.6 载重合成：载物加速变慢 */
  STATE.hint=(ph.tier==='top')?'推顶部：F·h>m·g·(w/2) 即翻倒——作用点不同，效果完全不同'
            :(ph.tier==='mid')?'推中部：既滑又倾（倾角随力矩渐增，有上限）'
            :'推底部：'+(it.type==='cart'?'顺推加速 a=F/m':'需 F>μ·N 克服静摩擦才启动');
  dirty=true;
}
/* §3.8 翻倒动画：绕前底边（推方向一侧底角）加速倒下 0.45s→90°；flying 期间不可抓；倒下后静止不自动立起 */
function startTopple(it,dir){
  var ph=it.ph;
  ph.mode='topple'; ph.toppleDir=dir; ph.toppleT0=performance.now();
  ph.vx=0; ph.vy=0; ph.F=0; ph.a=0; ph.tilt=0; ph.side=0;
  it.flying=true;                                              /* 翻倒动画期 flying 语义沿用（目标五） */
  if(phys.item===it){ phys.mode=null; phys.item=null; }        /* 推手中断 */
  setState(it,'idle'); toIdle(it);
  STATE.hint='翻倒：F·h>m·g·(w/2)，绕前底边翻转（不自动立起，可拖拽扶正）';
  dirty=true;
}
function toppleTick(it,now){
  var ph=it.ph,t=Math.min(1,(now-ph.toppleT0)/450);
  ph.rot=ph.toppleDir*(Math.PI/2)*t*t;                         /* 角加速倒下（重力矩语义的简化时间基） */
  if(t>=1){ ph.rot=ph.toppleDir*Math.PI/2; ph.mode=null; ph.toppled=true; it.flying=false; ph.asleep=true; }  /* 倒下后静止 */
  return true;
}
/* ===== 推力积分（§3.6）：F=手-车耦合折算(Kc·间隙,截断±8N)；a=F/m_total；逆推同一积分自然减速到 0 再反向 ===== */
function pushTick(it,now){
  var ph=it.ph,dt=PHYS.dt,pxM=PHYS.cmPx*100;                  /* px/m = cmPx×100 */
  ph.asleep=false;                                             /* 推手中：唤醒（积分内睡眠判定接管） */
  ph.mTotal=computeTotalMass(it);                              /* §3.6/§3.9：载重每帧合成（箱/钩码滑落后 m_total 即时变小） */
  var gapPx=phys.lastX-(it.x+ph.grabOffX);                     /* 手与接触点间隙：顺推为正、逆推为负 */
  var F=(Math.abs(gapPx)<=PHYS.cart.couplGapPx)?clamp(PHYS.cart.Kc*gapPx/pxM,-PHYS.cart.Fmax,PHYS.cart.Fmax):0;   /* 超间隙=脱手 F=0；上限 8N 截断 §3.6 */
  ph.F=F;
  var hM=ph.pushH/pxM,wM=(it.w||10)/pxM;
  if(ph.tier==='top'&&toppleCrit(F,hM,ph.mTotal,wM).over){ startTopple(it,sign(F)||1); return; }   /* §3.8 h≥2H/3 且判据满足→翻倒 */
  if(it.type==='cart'&&cartOnTrack(it)) ph.side=clamp((phys.lastY-phys.startPointerY)*0.35,-PHYS.cart.sideMaxDeg,PHYS.cart.sideMaxDeg)*Math.PI/180;  /* §3.6 侧推拐弯：侧偏角≤8°，y 保持轨道线不脱轨 */
  if((it.type==='wood_block'||it.type==='box')&&Math.abs(ph.vx)<1e-4&&Math.abs(F)<=PHYS.block.muS*ph.mTotal*PHYS.g){ ph.a=0; return; }  /* §3.7 静摩擦阈值：推底 F>μN 才启动，轻推不动 */
  var mu=(it.type==='cart')?(cartOnTrack(it)?PHYS.cart.muTrack:PHYS.cart.muTable):PHYS.block.muK;
  var dir=(ph.vx!==0)?sign(ph.vx):sign(F);
  var a=F/ph.mTotal-mu*PHYS.g*dir;                             /* a=F/m − μ·g（运动/将动方向 opposing） */
  if(ph.vx===0&&a*dir<0) a=0;                                  /* 静置且合力不足以动 → 不动 */
  var vPrev=ph.vx;
  ph.vx+=a*dt; ph.a=a;
  if(vPrev!==0&&ph.vx*vPrev<0&&Math.abs(F)<1e-6) ph.vx=0;      /* 摩擦致停（无推力时不许穿越 0 抖振） */
  if(ph.tier==='mid'){                                         /* §3.8 H/3<h<2H/3：滑+倾，倾角随力矩比渐增有上限 */
    var tr=toppleCrit(F,hM,ph.mTotal,wM).ratio;
    ph.tilt=sign(F)*Math.min(tr,1)*PHYS.block.tiltMaxDeg*Math.PI/180;
  }
  ph.mode='slide';
  integrateBody(it,dt,pxM);
  ph.mode='push';
}
/* ===== 惯性滑行（§3.6/§3.7）：松手后 a_fric=−μ·g（轨 0.03/桌 0.2/木块箱 0.25）+ 边缘碰撞 v'=−e·v + |v|<0.3px/帧 asleep ===== */
function slideTick(it,dt,pxM){
  var ph=it.ph;
  var mu=(it.type==='cart')?(cartOnTrack(it)?PHYS.cart.muTrack:PHYS.cart.muTable):PHYS.block.muK;
  var sp=Math.hypot(ph.vx,ph.vy);
  if(sp>0){
    var dec=mu*PHYS.g*dt;                                      /* Δv=μ·g·dt 逐帧扣减 */
    var ns=Math.max(0,sp-dec);
    ph.vx*=ns/sp; ph.vy*=ns/sp;
    ph.a=-mu*PHYS.g*(sp>0?1:0);
  }else ph.a=0;
  ph.side*=0.92;                                               /* 松手后侧偏角逐帧回正（y 保持轨道线，不脱轨 §3.6） */
  integrateBody(it,dt,pxM);
}
/* 位置积分+边界碰撞（桌缘/轨道端挡板 v'=−e·v，e=0.5 §3.6；坠落 e=0.3 §3.9 分走 fallTick）+ 睡眠判定 */
function integrateBody(it,dt,pxM){
  var ph=it.ph,b=bodyBounds(it),ox=it.x,oy=it.y;
  it.x+=ph.vx*dt*pxM; it.y+=ph.vy*dt*pxM;
  if(b){
    if(it.x<b.xmin){ it.x=b.xmin; ph.vx=-PHYS.cart.eEdge*ph.vx; if(Math.abs(ph.vx)<0.08) ph.vx=0; }   /* 桌缘/轨道端碰撞回弹 v'=−e·v，多次碰撞衰减；死区防贴挡板抖振 */
    else if(it.x>b.xmax){ it.x=b.xmax; ph.vx=-PHYS.cart.eEdge*ph.vx; if(Math.abs(ph.vx)<0.08) ph.vx=0; }
    if(b.ymin!=null){
      if(it.y<b.ymin){ it.y=b.ymin; ph.vy=-PHYS.cart.eEdge*ph.vy; if(Math.abs(ph.vy)<0.08) ph.vy=0; }
      else if(it.y>b.ymax){ it.y=b.ymax; ph.vy=-PHYS.cart.eEdge*ph.vy; if(Math.abs(ph.vy)<0.08) ph.vy=0; }
    }
  }
  if(it.x!==ox||it.y!==oy) moveChildren(it,it.x-ox,it.y-oy);   /* R12 目标四：物理滑行时载体随动沿 R10 moveChildren 原样 */
  if(Math.abs(ph.vx*dt*pxM)<PHYS.eps&&Math.abs(ph.vy*dt*pxM)<PHYS.eps&&ph.mode!=='fall'){   /* |v|<ε=0.3px/帧 → asleep 静止零开销 */
    ph.vx=0; ph.vy=0; ph.a=0; ph.asleep=true; ph.mode=null; ph.tilt=0; ph.side=0;
    if(it.id==='cart'){ STATE.cart.F=0; STATE.cart.v=0; STATE.cart.a=0; }
  }
}
function bodyBounds(it){
  if(it.type==='cart'&&cartOnTrack(it)&&trk&&trk.mounts){
    var m=trk.mounts;                                          /* 轨道端挡板：与 R10 拖拽 clamp 同界（§4.1 行车线） */
    return {xmin:m.start.x-L.cartW*0.4,xmax:m.end.x+L.cartW*0.4,ymin:null};   /* y 由 drawItemRaw 锁行车线 */
  }
  var tl=TABLE.l*W+8,tr=TABLE.r*W-8,tt=TABLE.t*H+it.h,tb=TABLE.b*H;
  return {xmin:tl+(it.w||0)/2,xmax:tr-(it.w||0)/2,ymin:tt,ymax:tb};            /* 桌面区：左右桌缘+前后沿挡板 */
}
/* ===== 摞叠滑落/坠落（§3.9/§3.10）：a_carrier>μ_stack·g → 脱离 parent，获载体当时速度，自由落体 g=9.8 落桌弹一下(e=0.3)再停 ===== */
function detachSlip(child,carrier,vcx){
  var gy=child.y,p=carrier;
  while(p){ gy=p.y; p=p.parent; }                              /* 落点=摞链最底载体基面（桌面/轨道面高度） */
  var ph=child.ph;
  child.parent=null;                                           /* 脱离载体（R10 moveChildren 不再带动） */
  ph.slip=true; ph.mode='fall'; ph.vx=vcx; ph.vy=0;
  ph.groundY=gy; ph.asleep=false; ph.bounced=0;
  STATE.hint='载体加速度 a>μ_stack·g（0.35×9.8），上层箱滑落';
  dirty=true;
}
function fallTick(it,dt,pxM){
  var ph=it.ph,ox=it.x,oy=it.y;
  ph.vy+=PHYS.g*dt;                                            /* 坠落 g=9.8 m/s²（px 换算用 cmPx） */
  it.x+=ph.vx*dt*pxM; it.y+=ph.vy*dt*pxM;
  var b=bodyBounds(it);
  if(b){ if(it.x<b.xmin){ it.x=b.xmin; ph.vx=-PHYS.cart.eEdge*ph.vx; } else if(it.x>b.xmax){ it.x=b.xmax; ph.vx=-PHYS.cart.eEdge*ph.vx; } }
  if(it.x!==ox||it.y!==oy) moveChildren(it,it.x-ox,it.y-oy);   /* 坠落件背上的摞件同步随动 */
  if(it.y>=ph.groundY){                                        /* 落到桌面高度 */
    it.y=ph.groundY;
    if(ph.vy>0.6&&ph.bounced<2){ ph.vy=-PHYS.stack.eFall*ph.vy; ph.bounced++; }   /* 弹一下 e≈0.3 小回弹 */
    else { ph.vy=0; ph.mode='slide'; ph.asleep=(Math.abs(ph.vx*dt*pxM)<PHYS.eps); } /* 再停→转普通木块物理（摩擦减速） */
  }
}
/* ===== physStepR12：只对激活件积分，asleep 零开销（沿 R11 physicsStep 骨架）；帧间 a_est 供滑落判据 ===== */
function physStepR12(now){
  var i,active=false,dt=PHYS.dt,pxM=PHYS.cmPx*100;
  if(phys.mode==='push'&&phys.item&&phys.item.ph) pushTick(phys.item,now);
  for(i=0;i<ITEMS.length;i++){
    var it=ITEMS[i],ph=it.ph;
    if(!ph||!ph.r12) continue;
    var vxFrame=(it.x-ph.prevX)/dt/pxM;                        /* 帧间速度 m/s（拖拽/推/滑一律可测，供滑落判据） */
    ph.prevX=it.x;
    if(ph.mode==='topple'){ active=toppleTick(it,now)||active; }
    else if(ph.mode==='fall'){ fallTick(it,dt,pxM); active=true; }
    else if(ph.mode==='slide'&&!(phys.mode==='push'&&phys.item===it)){ slideTick(it,dt,pxM); active=true; }
    if(it.parent&&it.parent.ph&&it.parent.ph.r12&&!isTweening(it)&&it.state!=='settle'){   /* 摞叠随动件：每帧测载体水平加速度（自身补间/settle 期不判，防摞放动画误滑落） */
      var aC=(vxFrame-ph.frameVPrev)/dt;                       /* 随动时 v_child≈v_carrier → 帧速差分=载体加速度近似 */
      if(Math.abs(aC)>PHYS.stack.muStack*PHYS.g){ detachSlip(it,it.parent,vxFrame); active=true; }   /* §3.9 滑落判据 a>μ_stack·g */
    }
    ph.frameVPrev=ph.frameV; ph.frameV=vxFrame;
    if(it.id==='cart'){                                        /* STATE.cart：F/v/a 写入（供 R14/R15 取用，目标五） */
      STATE.cart.F=+(ph.F||0).toFixed(3); STATE.cart.v=+(ph.vx||0).toFixed(3); STATE.cart.a=+(ph.a||0).toFixed(3);
    }
    if(!ph.asleep||ph.mode) active=true;
  }
  if(active) dirty=true;
}
/* 推模式松手（endDrag 接缝）：保留当前 v → 惯性滑行摩擦减速（§3.6 松手后） */
function releasePush(it){
  var ph=it.ph;
  ph.F=0; ph.mode=(Math.abs(ph.vx)>0||Math.abs(ph.side)>1e-4)?'slide':null;   /* 保留 v→惯性滑行；仅剩侧偏也进滑行帧衰减回正 */
  if(!ph.mode) ph.asleep=true;
  ph.tilt=0;                                                   /* 滑倾随推力撤除回正（侧偏 side 保留至滑行衰减） */
  setState(it,'idle'); toIdle(it);
  dirty=true;
}
/* 桌面整件拖拽松手甩速→初速度（目标五接缝：resolveRelease 内调用；有横向甩速则转惯性滑行） */
function startFlickSlide(it){
  var ph=it.ph,pxM=PHYS.cmPx*100;
  if(performance.now()-(drag.lt||0)>120) return false;         /* 松手前停顿>120ms=无甩速 */
  var vx=(drag.vx||0)/pxM,vy=(drag.vy||0)/pxM;
  if(Math.hypot(vx,vy)*dtFramePx(pxM)<PHYS.eps) return false;  /* |v|<0.3px/帧 → 不滑 */
  ph.vx=clamp(vx,-2.5,2.5); ph.vy=clamp(vy,-2.5,2.5);          /* 甩速封顶 2.5m/s 防飞出 */
  ph.mode='slide'; ph.asleep=false; ph.slip=false; ph.bounced=0;
  it.parent=null;                                              /* 甩出=脱离原载体随动，转独立平动 */
  if(it.type!=='cart'||!cartOnTrack(it)) ph.groundY=it.y;
  setState(it,'idle');
  dirty=true;
  return true;
}
function dtFramePx(pxM){ return PHYS.dt*pxM; }
/* §3.10 摞高检查：>3 层写 STATE 不稳提示（不做塔倒物理）；startStack 落定后调用 */
function stackDepthBelow(it){ var n=1,p=it.parent; while(p){ n++; p=p.parent; } return n; }
function stackDepthAbove(it){
  var n=0;
  for(var i=0;i<ITEMS.length;i++){ if(ITEMS[i].parent===it) n=Math.max(n,stackDepthAbove(ITEMS[i])); }
  return n+1;
}
function checkStackDepth(it){
  var depth=stackDepthBelow(it)+stackDepthAbove(it)-1;
  if(depth>PHYS.stack.maxLayers) STATE.hint='摞高超过 3 层，不稳（规格上限 ≤3 层）';
}
/* 弹簧拉力 F=k·ΔL（§3.2，k=100N/m，ΔL=弹性段米数）；写入 STATE 供字幕/测力计单用 */
function physSpringForce(it){
  var ph=it.ph, xElastic=(ph.ext-ph.residual);                 /* 弹性可恢复段（残余生已扣除） */
  var dL_m=xElastic/(PHYS.cmPx*100);                           /* px→cm→m */
  ph.F=PHYS.spring.k*dL_m;
  STATE.springF=ph.F;
  return ph.F;
}
/* 橡皮筋非线性力 F=k₁ΔL+k₂ΔL²（ΔL单位cm）；卸载×0.7=迟滞（橡胶内耗 §3.3） */
function physBandForce(it,loading){
  var ph=it.ph, dL=(ph.ext-ph.residual)/PHYS.cmPx;             /* 弹性段 cm */
  if(dL<0) dL=0;
  var F=PHYS.band.k1*dL+PHYS.band.k2*dL*dL;                    /* 加载曲线 */
  if(!loading) F*=PHYS.band.unload;                            /* 迟滞=橡胶内耗 §3.3：卸载劲度 0.7·加载 */
  ph.F=F; STATE.bandF=F;
  return F;
}
/* 拉伸模式跟手：设置总伸长 ext，算力，弹簧超限判定红闪+永久形变 residual（§3.2） */
function physStretchMove(it,ext){
  var ph=it.ph;
  ph.ext=ext; ph.asleep=false; ph.oscillating=false;
  if(ext>ph.maxExt) ph.maxExt=ext;
  if(it.type==='spring'){
    var F=physSpringForce(it);
    var xElastic=ext-ph.residual, xYield=PHYS.spring.F_yield/(PHYS.spring.k)*(PHYS.cmPx*100); /* F_yield→弹性段px=4.5cm·cmPx */
    if(F>=PHYS.spring.F_yield){                                 /* 超弹性限度：tint 红闪0.3s + residual=超限部分30% */
      if(!ph.flashed){ ph.flashed=true; ph.flashT0=performance.now(); }
      var over=xElastic-xYield; if(over>0) ph.residual=over*PHYS.spring.resRatio;
    }
  }else{
    physBandForce(it,true);                                    /* 拉伸=加载 */
  }
}
/* 松手：欠阻尼振荡回稳；橡皮筋累计残余伸长≤3%（单次~0.5%）（§3.3） */
function physStretchRelease(it,now){
  var ph=it.ph, cfg=it.type==='spring'?PHYS.spring:PHYS.band;
  if(it.type==='rubber_band'){
    if(ph.maxExt-ph.residual>1){                                /* 本次确有拉伸才累计 */
      ph.permanent=Math.min(ph.L0px*PHYS.band.permCap, ph.permanent+ph.L0px*PHYS.band.permPull);
    }
    ph.residual=ph.permanent;                                  /* 残余=平衡位偏移 */
  }
  ph.A0=ph.ext-ph.residual;                                    /* 相对平衡的初始振幅 */
  if(Math.abs(ph.A0)<0.5){ ph.ext=ph.residual; ph.asleep=true; ph.oscillating=false; }
  else { ph.t0=now; ph.oscillating=true; ph.asleep=false; ph.loading=false; }
  ph.maxExt=0; ph.flashed=false;
  STATE.springF=0; STATE.bandF=0;
}
/* 弹簧红闪 overlay（tint 红 0.3s）：core 内叠绘红辉光窄列，不改 props-mech.js */
function drawSpringFlash(it,now){
  var ph=it.ph; if(!ph||!ph.flashT0) return;
  var t=(now-ph.flashT0)/300; if(t>=1){ return; }
  var pulse=Math.sin(t*Math.PI);                               /* 0→1→0 脉冲 */
  ctx.save();
  ctx.shadowColor='rgba(255,30,20,'+(0.9*pulse).toFixed(3)+')';
  ctx.shadowBlur=18*k;
  ctx.fillStyle='rgba(255,45,30,'+(0.32*pulse).toFixed(3)+')';
  var wcol=Math.max(8,(it.w||12)*0.62);
  ctx.fillRect(it.x-wcol/2,it.y-(it.h||0),wcol,it.h||0);
  ctx.restore();
}
/* 玻璃瓶细管液柱 overlay（§3.5）：默认液面在 h₀=5cm（props 内固定），core 叠绘当前 h₀+dh
 * dh>0=液柱升(捏)画红柱补高；dh<0=微振荡下探用玻璃色盖掉默认柱上部。tube 几何按 bottle_tube_25d 公式复算 */
function drawBottleLiquid(it){
  var ph=it.ph; if(!ph) return;
  var bopt=it.opt(it), w=bopt.w, h=bopt.h, x=it.x, y=it.y;
  var waterTopY=y-h*0.55;                                      /* h₀ 液面顶（与 props 一致） */
  var tw=Math.max(2.5,w*0.04), cw=Math.max(1.6,tw*0.6);
  var dh=ph.dh, curTop=waterTopY-dh;                           /* dh+=升 → curTop 更小(更高) */
  ctx.save();
  if(dh>=0.3){
    ctx.fillStyle='#d8483c';
    ctx.beginPath();
    ctx.moveTo(x-cw,curTop);
    ctx.quadraticCurveTo(x,curTop+cw*0.9,x+cw,curTop);         /* 凹弯月顶 */
    ctx.lineTo(x+cw,waterTopY+cw*0.6); ctx.lineTo(x-cw,waterTopY+cw*0.6);
    ctx.closePath(); ctx.fill();
  }else if(dh<-0.3){
    ctx.fillStyle='rgba(226,241,251,0.85)';                    /* 液面低于 h₀：盖掉默认柱上部（空管玻璃色） */
    ctx.fillRect(x-cw,waterTopY-cw*0.3,cw*2,(waterTopY-curTop)+cw*0.3);
  }
  ctx.restore();
}

/* ===== R11 形变交互层：底钩拉伸(弹簧/橡皮筋) + 按压(橡皮泥) + 捏(玻璃瓶) =====
 * 与 R10 drag 并存：拉伸=命中底钩区(±12px)直接进；按压/捏=pointerdown 后位移<6px 且按住>150ms 才进，否则走 R10 整件拖拽 */
var phys={mode:null,item:null,startPointerX:0,startPointerY:0,lastX:0,lastY:0,startExt:0,downT:0,movedPx:0,pressCand:false};
function isDeforming(it){ return phys.item===it&&phys.mode!=null; }   /* 形变进行中（拉伸/按压/捏）；振荡衰减中 mode=null→可被热替换 */
function nearBottomHook(it,p){
  var by=(it.dy!=null?it.dy:it.y), hw=Math.max(14,(it.w||20)/2+8);
  return Math.abs(p.y-by)<=12&&Math.abs(p.x-it.x)<=hw;              /* 底钩/环底 ±12px（用实际绘制基线 dy） */
}
function startStretch(it,p){
  phys.mode='stretch'; phys.item=it; phys.pressCand=false;
  phys.startPointerX=p.x; phys.startPointerY=p.y; phys.lastX=p.x; phys.lastY=p.y;
  var ph=it.ph; ph.oscillating=false; ph.asleep=false; ph.loading=true;
  phys.startExt=ph.ext;
  killTweensOf(it); setState(it,'grabbing'); setCursor('grabbing');
  dirty=true;
}
function stretchMove(p){
  var it=phys.item,ph=it.ph;
  phys.lastX=p.x; phys.lastY=p.y;
  var ext=phys.startExt+(p.y-phys.startPointerY);                     /* 下拉→伸长；跟手 */
  if(ext<0) ext=0;
  ext=Math.min(ext,ph.L0px*1.6);                                      /* 防 runaway */
  physStretchMove(it,ext);
}
function promotePress(it){
  if(it.ph&&it.ph.r12){                                        /* R12：木块/箱子升格进推模式（进入条件沿 R11：<6px 且 >150ms） */
    startPush(it,{x:phys.startPointerX,y:phys.startPointerY});
    return;
  }
  phys.pressCand=false; drag.item=null; killTweensOf(it); setState(it,'idle');
  phys.mode=(it.type==='clay')?'press':'squeeze'; phys.item=it;
  phys.lastX=phys.startPointerX; phys.lastY=phys.startPointerY;
  setCursor('grabbing'); dirty=true;
}
function pressMove(p){ phys.lastX=p.x; phys.lastY=p.y; }              /* 橡皮泥/玻璃瓶：时间基增长在 physInputTick 里算 */
function releasePress(it){ it.ph.F=0; setState(it,'idle'); toIdle(it); }   /* 橡皮泥：凹陷完全保留(回弹率0 §3.4)，state 回 idle，dent 持久 */
function releaseSqueeze(it,now){
  var ph=it.ph; ph.A0=ph.dh; ph.t0=now; ph.squeeze=0;
  if(Math.abs(ph.A0)<0.5){ ph.dh=0; ph.asleep=true; ph.oscillating=false; }
  else { ph.oscillating=true; ph.asleep=false; }                      /* 松手液柱回落+微振荡，最终回 h₀ 无余差 */
  setState(it,'idle'); toIdle(it);
}
function physUpdateSqueeze(it,now){
  var ph=it.ph,bopt=it.opt(it),w=bopt.w,h=bopt.h;
  var s=Math.abs(phys.lastX-phys.startPointerX)/w+0.0012*(now-phys.downT);   /* squeeze 随按住时长/横向拖入增长 */
  if(s>1.5) s=1.5;
  var dhPx=PHYS.bottle.kSqueeze*s*PHYS.cmPx;                          /* Δh=k_squeeze·squeeze（截面积比≈40 放大量语义 §3.5） */
  var maxPx=h*0.38; if(dhPx>maxPx) dhPx=maxPx;                        /* 防溢出管顶 */
  ph.dh=dhPx; ph.squeeze=s; ph.asleep=false; ph.oscillating=false;
  STATE.bottleSqueeze=s;
}
/* 每帧：按压候选升格(150ms) + press/squeeze 时间基增长 */
function physInputTick(now){
  if(phys.pressCand&&drag.item){
    if(phys.movedPx>6) phys.pressCand=false;                          /* 位移>6px→放弃形变，走 R10 拖拽 */
    else if(now-phys.downT>=150) promotePress(drag.item);             /* 按住>150ms 且<6px→进形变模式 */
  }
  if(phys.mode==='press'&&phys.item){
    var pressCm=Math.max(0,phys.lastY-phys.startPointerY)/PHYS.cmPx+0.0008*(now-phys.downT);
    physSetClayDent(phys.item,pressCm);
  }
  if(phys.mode==='squeeze'&&phys.item) physUpdateSqueeze(phys.item,now);
}
function physSetClayDent(it,pressCm){
  var ph=it.ph;
  var F=PHYS.clay.pressK*pressCm;                                     /* 按压位移→力(N) */
  var dCm=PHYS.clay.coef*Math.sqrt(F);                                /* d ∝ F^0.5，系数0.04 cm/√N（§3.4） */
  dCm=Math.min(dCm,PHYS.clay.dentCap*3);                              /* 上限60%原高(3cm)=1.8cm */
  if(dCm>ph.dentCm){ ph.dentCm=dCm; ph.dent=dCm*PHYS.cmPx; }          /* 塑性单调：只加深不回弹 */
  ph.F=F; ph.pressDepth=pressCm*PHYS.cmPx; STATE.clayDent=ph.dentCm;
}

/* ===== 指针事件（pointerdown/move/up，含 touch）===== */
function evPt(e){ var r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; }
cv.addEventListener('pointerdown',function(e){
  if(!canInteract()) return;
  var p=evPt(e),hit=doorPushHit(p.x,p.y),it;
  if(hit){                                                    /* 门推点：点击仅记录 lastPushPoint（R13 用），不抓门扇 */
    STATE.lastPushPoint={id:hit.id,x:hit.x,y:hit.y};
    if(window.playClick) window.playClick();
    return;
  }
  it=hitTest(p.x,p.y);
  if(!it) return;
  /* R11：弹簧/橡皮筋悬挂 A1 时命中底钩区(±12px)→底钩拉伸模式，跳过整件拖拽（目标二/三） */
  if((it.type==='spring'||it.type==='rubber_band')&&it.anchorId==='A1'&&it.ph&&nearBottomHook(it,p)){
    try{ cv.setPointerCapture(e.pointerId); }catch(err){}
    startStretch(it,p); e.preventDefault(); return;
  }
  var wasToppled=(it.ph&&it.ph.r12&&it.ph.toppled);
  if(wasToppled){                                              /* R12：翻倒件被拖起=扶正，倾角清零（目标二/三：不自动立起，拖起时清） */
    it.ph.toppled=false; it.ph.rot=0; it.ph.tilt=0; it.ph.side=0; it.ph.asleep=true; it.ph.vx=0; it.ph.vy=0; it.ph.mode=null;
  }
  /* R12 目标五：锁 A11 轨道上的小车 pointerdown 拖动=推力物理（F 由 pointer 位移折算），不走 R10 整件拖拽；翻倒态例外=走拖拽扶正 */
  if(it.type==='cart'&&cartOnTrack(it)&&it.ph&&!it.flying&&!wasToppled){
    try{ cv.setPointerCapture(e.pointerId); }catch(err){}
    startPush(it,p); e.preventDefault(); return;
  }
  try{ cv.setPointerCapture(e.pointerId); }catch(err){}
  killTweensOf(it);
  drag.item=it; drag.moved=false; drag.downT=performance.now();
  drag.ox=p.x-it.x; drag.oy=p.y-it.y;
  drag.vx=0; drag.vy=0; drag.lx=p.x; drag.ly=p.y; drag.lt=performance.now();   /* R12：甩速跟踪基线 */
  setHover(null);
  setState(it,'grabbing'); setCursor('grabbing');             /* idle/hover → grabbing（§4.3） */
  /* R11：橡皮泥/玻璃瓶按压候选——位移<6px 且按住>150ms 才进形变模式，否则走 R10 整件拖拽（目标六）
   * R12：木块/箱子同条件升格进推模式（目标五：避免抢 R10 拖放手感） */
  if(((it.type==='clay'||it.type==='bottle_tube')&&it.ph)||(it.ph&&it.ph.r12&&(it.type==='wood_block'||it.type==='box'))){
    phys.pressCand=true; phys.item=it; phys.mode=null; phys.downT=performance.now();
    phys.startPointerX=p.x; phys.startPointerY=p.y; phys.lastX=p.x; phys.lastY=p.y; phys.movedPx=0;
  }
  e.preventDefault();
});
cv.addEventListener('pointermove',function(e){
  if(!canInteract()) return;
  var p=evPt(e);
  /* R11 形变模式优先于 R10 拖拽 */
  if(phys.mode==='stretch'){ stretchMove(p); dirty=true; return; }
  if(phys.mode==='press'||phys.mode==='squeeze'){ pressMove(p); dirty=true; return; }
  if(phys.mode==='push'){ phys.lastX=p.x; phys.lastY=p.y; dirty=true; return; }   /* R12 推模式：只记手位，力在 pushTick 折算（件不跟手） */
  /* R11 按压候选：位移≤6px 按住不动（不移动整件，等 150ms 升格）；>6px 落回 R10 拖拽 */
  if(phys.pressCand&&drag.item){
    phys.movedPx=Math.hypot(p.x-phys.startPointerX,p.y-phys.startPointerY);
    phys.lastX=p.x; phys.lastY=p.y;
    if(phys.movedPx<=6){ dirty=true; return; }
    phys.pressCand=false;
  }
  if(drag.item){
    var it=drag.item,nx=p.x-drag.ox,ny=p.y-drag.oy;
    var nowT=performance.now(),dtE=Math.max(8,nowT-(drag.lt||nowT));   /* R12：甩速采样（px/s，指数平滑），松手转惯性滑行用 */
    drag.vx=0.6*(drag.vx||0)+0.4*((p.x-(drag.lx!=null?drag.lx:p.x))/dtE*1000);
    drag.vy=0.6*(drag.vy||0)+0.4*((p.y-(drag.ly!=null?drag.ly:p.y))/dtE*1000);
    drag.lx=p.x; drag.ly=p.y; drag.lt=nowT;
    if(!drag.moved&&(Math.abs(nx-it.x)>2||Math.abs(ny-it.y)>2)){ drag.moved=true; setState(it,'dragging'); }
    if(it.state==='dragging'){
      var dx=nx-it.x,dy=ny-it.y;
      it.x=nx; it.y=ny;
      if(it.id==='cart'&&trk&&trk.mounts){                    /* 轨道约束：小车 y 锁行车线，x 沿线自由（§4.1） */
        var m=trk.mounts;
        it.y=m.start.y;
        it.x=Math.max(m.start.x-L.cartW*0.4,Math.min(m.end.x+L.cartW*0.4,it.x));
        dy=it.y-(ny);
      }
      moveChildren(it,dx,dy);                                 /* 摞叠跟随：拖下层上层同位移（目标六） */
    }
    dirty=true;
    return;
  }
  var dh=doorPushHit(p.x,p.y);
  if((dh&&dh.id)!==(pushHover&&pushHover.id)){ pushHover=dh; dirty=true; }
  if(dh){ setHover(null); setCursor('pointer'); return; }      /* 门推点热区：cursor:pointer（目标五），不进入器材 hover */
  setHover(hitTest(p.x,p.y));
});
function endDrag(e){
  try{ cv.releasePointerCapture(e.pointerId); }catch(err){}
  /* R11 形变模式松手：弹簧/橡皮筋→欠阻尼回稳；橡皮泥→凹陷冻结；玻璃瓶→液柱回落微振荡 */
  if(phys.mode==='stretch'){ var si=phys.item; physStretchRelease(si,performance.now()); toIdle(si); phys.mode=null; phys.item=null; return; }
  if(phys.mode==='press'){ var ci=phys.item; releasePress(ci); phys.mode=null; phys.item=null; return; }
  if(phys.mode==='squeeze'){ var bi=phys.item; releaseSqueeze(bi,performance.now()); phys.mode=null; phys.item=null; return; }
  if(phys.mode==='push'){ var pi=phys.item; releasePush(pi); phys.mode=null; phys.item=null; return; }   /* R12：推松手→惯性滑行（§3.6） */
  if(phys.pressCand){ phys.pressCand=false; phys.item=null; }   /* 未升格候选：落回 R10 轻点释放 */
  var it=drag.item;
  if(!it) return;
  drag.item=null;
  setState(it,'release');                                     /* dragging → release（§4.3） */
  resolveRelease(it);
}
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',endDrag);

/* ===== 目标三：释放判定 → 吸附（§4.6：0.2s ease-out + 末尾过冲 0.12s 回稳）=====
 * 吸附点=§4.2「可挂/可放对象」列语义：底面中心（§4.1 器材锚）与顶端挂环（悬挂件）双候选，任一入吸附距离即成交 */
function snapCandidates(it){
  var arr=[{x:it.x,y:it.y,top:false}];
  if(it.anchor==='top'&&it.h) arr.push({x:it.x,y:it.y-it.h,top:true});
  return arr;
}
function resolveRelease(it){
  var best=null,bd=1e9,i,j;                                   /* 吸附距离=§4.2 snapPx 绝对像素（§4.6），不随视觉倍率 k 缩放 */
  var cands=snapCandidates(it);
  for(i in ANCHORS){
    var a=ANCHORS[i];
    if(!anchorAccepts(a,it.type)) continue;
    var occ=occupiedBy(a.id,it);
    if(occ&&(!(a.id==='A1'||a.id==='A2')||isDeforming(occ))) continue;   /* §4.4 仅 A1/A2 允许热替换抢占；R11 目标六：占位件形变进行中不抢占，振荡衰减中允许 */
    var ax=anchorAt(a.id);
    for(j=0;j<cands.length;j++){
      var d=Math.hypot(ax.x-cands[j].x,ax.y-cands[j].y);
      if(d<=a.snapPx&&d<bd){ bd=d; best={id:a.id,top:cands[j].top}; }
    }
  }
  if(best){ startSnap(it,best.id,best.top); return; }
  var st=stackTarget(it);                                     /* 无锚位 → 摞叠判定（目标六） */
  if(st){ startStack(it,st.carrier,st.x,st.y); return; }
  it.anchorId=null; it.anchorId2=null;                         /* 自由落定=脱离原锚位锁（§4.3 release：无吸附目标→原地落定） */
  if(it.ph&&it.ph.slidable&&startFlickSlide(it)) return;       /* R12 目标五：桌面拖拽松手有横向甩速→转惯性滑行（甩速→初速度） */
  setState(it,'settle');
  addTween({it:it,x0:it.x,y0:it.y,x1:it.x,y1:it.y,dur:120,ease:easeOut,onEnd:toIdle});
}
function occupiedBy(aid,except){
  for(var i=0;i<ITEMS.length;i++){
    var o=ITEMS[i];
    if(o===except||!o.anchorId) continue;
    if(o.anchorId===aid) return o;
    if(aid==='A1'&&o.anchorId==='A2') return o;               /* 弹簧/橡皮筋悬挂同时占 A1+A2（一件两位） */
    if(aid==='A2'&&o.anchorId==='A1') return o;
  }
  return null;
}
function startSnap(it,aid,useTop){
  var p=anchorAt(aid),tx,ty;
  if(aid==='A11'){ tx=it.x; ty=p.y; }                         /* 轨道线：y 锁线、x 留释放位 */
  else if(ANCHORS[aid].hang){ tx=p.x; ty=p.y+(it.h||0); }     /* hang 锚：顶挂环对齐，base=锚位y+高 */
  else { tx=p.x; ty=p.y; }                                    /* 底面中心对齐锚位（§4.1） */
  var other=occupiedBy(aid,it);
  if(other) hotSwap(other,it);                                /* 目标四：热替换（飞回 0.25s 与本件吸附并行） */
  it.anchorId=aid; it.parent=null;
  if(it.ph&&it.ph.r12){ it.ph.vx=0; it.ph.vy=0; it.ph.mode=null; it.ph.asleep=true; it.ph.slip=false; it.ph.bounced=0; }   /* R12：吸附落锁=运动清零（静止零开销） */
  if(aid==='A1'&&(it.id==='spring'||it.id==='rubber_band')) it.anchorId2='A2';
  setState(it,'settle');                                      /* release → settle（吸附动画期） */
  addTween({it:it,x0:it.x,y0:it.y,x1:tx,y1:ty,dur:200,ease:easeOutOvershoot,           /* §4.6：0.18~0.25s 取 0.2s ease-out，末尾过冲 ~3px（2~4px 内） */
    onEnd:function(o){
      addTween({it:o,x0:o.x,y0:o.y,x1:tx,y1:ty,dur:120,ease:easeOut,onEnd:function(o2){ setItemPos(o2,p.x,p.y); toIdle(o2); }});   /* §4.6：过冲 0.12s 内回稳，收在精确锚位 */
    }});
  dirty=true;
}
/* ===== 目标四：热替换（§4.4 铁架台区；被替换件 0.25s 飞回托盘槽，飞行期不可再抓）===== */
function hotSwap(outItem,inItem){
  var home=outItem.homeAnchor||null;
  if(home&&occupiedBy(home,outItem)) home=null;               /* 家槽被占则只飞回槽位坐标不落锁（托盘槽单 occupancy） */
  outItem.flying=true;                                        /* 飞回动画期间不可再抓（hitTest 跳过） */
  outItem.anchorId=null; outItem.anchorId2=null;
  var p=home?anchorAt(home):null;
  var tx=p?p.x:(outItem.homePct?outItem.homePct.x/100*W:outItem.x);
  var ty=p?p.y+((home&&ANCHORS[home].hang)?(outItem.h||0):0):(outItem.homePct?outItem.homePct.y/100*H:outItem.y);
  setState(outItem,'settle');
  addTween({it:outItem,x0:outItem.x,y0:outItem.y,x1:tx,y1:ty,dur:250,ease:easeOut,       /* §4.4：0.25s 飞回，避免瞬切 */
    onEnd:function(o){
      o.flying=false;
      if(home){ o.anchorId=home; setItemPos(o,tx,ty); }
      toIdle(o);
    }});
}
/* ===== 目标六：摞叠放置（§4.7：底心入载体顶面 12px 内 且 水平偏移 < 载体宽 40% → 吸附摞放）===== */
function carrierTop(c){
  if(c.mnt&&c.mnt.top) return {x:c.mnt.top.x,y:c.mnt.top.y,w:c.w};
  return {x:c.x,y:c.y-c.h,w:c.w};                             /* 无 top mount 的载体（木块）：顶面≈base 上沿 */
}
function stackTarget(it){
  if(!it.stackable) return null;
  var sp={x:it.x,y:it.y},best=null,i;                         /* 可摞物底心（§4.7） */
  for(i=0;i<ITEMS.length;i++){
    var c=ITEMS[i];
    if(c===it||c.kind!=='carrier'||c.flying) continue;
    var tp=carrierTop(c);
    if(Math.abs(sp.y-tp.y)<=12*k&&Math.abs(sp.x-tp.x)<c.w*0.4){ best={carrier:c,x:tp.x,y:tp.y}; }
  }
  return best;
}
function startStack(it,carrier,x,y){
  it.parent=carrier; it.anchorId=null; it.anchorId2=null;
  if(it.ph&&it.ph.r12){ it.ph.vx=0; it.ph.vy=0; it.ph.mode=null; it.ph.asleep=true; it.ph.slip=false; it.ph.bounced=0; }   /* R12：摞放落定=运动清零，随动交给 R10 moveChildren */
  setState(it,'settle');
  addTween({it:it,x0:it.x,y0:it.y,x1:x,y1:y,dur:200,ease:easeOutOvershoot,              /* 摞放同 §4.6 吸附参数 */
    onEnd:function(o){ o.x=x; o.y=y; toIdle(o); checkStackDepth(o); }});                  /* R12 §3.10：落定后摞高>3 层写 STATE hint */
}
function moveChildren(parent,dx,dy){
  for(var i=0;i<ITEMS.length;i++){
    var c=ITEMS[i];
    if(c.parent===parent){ c.x+=dx; c.y+=dy; }
  }
}
function toIdle(it){ it.state='idle'; if(hoverItem===it) hoverItem=null; dirty=true; }   /* settle → idle */

/* ===== 目标五：测力计对拉 linked 检查 + 钩连线示意（R14 再加读数）===== */
function drawLinkedCheck(){
  var a=occupiedBy('A9',null),b=occupiedBy('A10',null);
  var i,lk=(a&&b&&a!==b&&a.type==='meter'&&b.type==='meter');
  for(i=0;i<ITEMS.length;i++) ITEMS[i].linked=false;
  if(lk){
    a.linked=true; b.linked=true;
    var ha=(a.mnt&&a.mnt.hook)||{x:a.x,y:a.y},hb=(b.mnt&&b.mnt.hook)||{x:b.x,y:b.y};
    ctx.save();
    ctx.strokeStyle='rgba(90,70,40,0.85)'; ctx.lineWidth=Math.max(2,3*k); ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(ha.x,ha.y); ctx.lineTo(hb.x,hb.y); ctx.stroke();
    ctx.restore();
  }
  STATE.linked=lk;
}
/* ===== 门推点 hover 高亮（目标五：hover 高亮 + cursor:pointer，本单不转门）===== */
function doorPushTick(){
  if(!pushHover) return;
  var a=ANCHORS[pushHover.id],r=a.snapPx*0.7;
  ctx.save();
  ctx.strokeStyle='rgba(224,140,30,0.9)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(pushHover.x,pushHover.y,r,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='rgba(224,140,30,0.22)'; ctx.fill();
  ctx.restore();
}
/* ===== ?anchors=1 调试层：19 锚位十字 + id + 吸附半径圈（蔡总复验用，默认关）===== */
function drawAnchorDebug(){
  ctx.save();
  ctx.lineWidth=1.2; ctx.font='600 '+Math.max(10,12*k)+'px sans-serif';
  ctx.textAlign='left'; ctx.textBaseline='bottom';
  for(var id in ANCHORS){
    var a=ANCHORS[id],p=anchorAt(id);
    ctx.strokeStyle='rgba(220,60,60,0.85)';
    ctx.beginPath();
    ctx.moveTo(p.x-7,p.y); ctx.lineTo(p.x+7,p.y);
    ctx.moveTo(p.x,p.y-7); ctx.lineTo(p.x,p.y+7);
    ctx.stroke();
    ctx.strokeStyle='rgba(220,60,60,0.30)';
    ctx.beginPath(); ctx.arc(p.x,p.y,a.snapPx*Math.max(0.6,k),0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='rgba(150,30,30,0.9)';
    ctx.fillText(a.id,p.x+9,p.y-4);
  }
  ctx.restore();
}

/* ===== ?physics=1 调试层：四形变件 x/v/d/h + R12 cart/block/box 的 v/a/θ/滑落/m_total（蔡总复验用，默认关）===== */
function drawPhysicsDebug(){
  var sp=ITEM_BY_ID.spring,bd=ITEM_BY_ID.rubber_band,cl=ITEM_BY_ID.clay,bt=ITEM_BY_ID.bottle_tube;
  function f(n,d){ return (n||0).toFixed(d); }
  function r12line(it){                                        /* R12 slidable 件单行 */
    var ph=it.ph,deg=((ph.rot+ph.tilt+ph.side)*180/Math.PI);
    return ' v='+f(ph.vx,2)+','+f(ph.vy,2)+'m/s a='+f(ph.a,2)+' F='+f(ph.F,2)+'N θ='+f(deg,1)+'°'
      +' mT='+f(ph.mTotal,2)+'kg '+(ph.mode||'-')+(ph.asleep?' Z':'')+(ph.toppled?' TOPPLED':'')+(ph.slip?' SLIP':'')
      +(it.parent?(' par='+it.parent.id):'')+(it.id==='cart'?(cartOnTrack(it)?' track':' table'):'');
  }
  var lines=[
    'spring  ext='+f(sp.ph.ext,1)+'px v='+f(sp.ph.v,1)+' res='+f(sp.ph.residual,1)+' F='+f(sp.ph.F,2)+'N'+(sp.ph.oscillating?' osc':'')+(sp.ph.asleep?' Z':''),
    'band    ext='+f(bd.ph.ext,1)+'px v='+f(bd.ph.v,1)+' perm='+f(bd.ph.permanent,1)+' F='+f(bd.ph.F,2)+'N'+(bd.ph.oscillating?' osc':'')+(bd.ph.asleep?' Z':''),
    'clay    dent='+f(cl.ph.dentCm,2)+'cm('+f(cl.ph.dent,1)+'px) F='+f(cl.ph.F,0)+'N',
    'bottle  dh='+f(bt.ph.dh,1)+'px v='+f(bt.ph.v,1)+' sqz='+f(bt.ph.squeeze,2)+(bt.ph.oscillating?' osc':'')+(bt.ph.asleep?' Z':''),
    'cart   '+r12line(ITEM_BY_ID.cart),
    'block  '+r12line(ITEM_BY_ID.wood_block),
    'box    '+r12line(ITEM_BY_ID.box),
    'hint: '+(STATE.hint||'-')
  ];
  ctx.save();
  ctx.font='600 '+Math.max(10,12*k)+'px monospace'; ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(20,20,20,0.55)'; ctx.fillRect(6,6,430,lines.length*15+10);
  ctx.fillStyle='#8CFF5A';
  for(var i=0;i<lines.length;i++) ctx.fillText(lines[i],12,11+i*15);
  ctx.restore();
}

/* ===== 层5-9 空壳（§2.5 z 顺序预留，R10+ 实装；勿在实装前塞内容）===== */
function drawPeopleLayer(){ /* 层5 人物/动态层：小人动作、气球飞行轨迹虚线（R12+） */ }
function drawForceLayer(){ /* 层6 力矢/箭头层：推力/速度/喷气箭头 */
  /* R12 §3.7：木块/箱子运动中实时 v 矢量箭头——长度比例取「1(m/s)=3cm」视觉直映（PHYS.block.arrowCmPerMs；F=ma 等效力换算的另一取法未用，见 PHYS.block 注释） */
  var ids=['wood_block','box'],i;
  for(i=0;i<ids.length;i++){
    var it=ITEM_BY_ID[ids[i]],ph=it.ph;
    if(!ph||!ph.r12||ph.asleep||ph.toppled||ph.mode==='fall') continue;
    var sp=Math.hypot(ph.vx,ph.vy);
    if(sp*PHYS.dt*PHYS.cmPx*100<PHYS.eps) continue;           /* |v|<ε 不画 */
    var lenPx=Math.max(10,sp*PHYS.block.arrowCmPerMs*PHYS.cmPx);
    var ux=ph.vx/sp,uy=ph.vy/sp;
    var sx=it.x+ux*(it.w||10)/2,sy=it.y-(it.h||10)/2+uy*(it.h||10)/4;   /* 自体侧缘沿 v 方向出发 */
    var ex=sx+ux*lenPx,ey=sy+uy*lenPx,hl=Math.min(10,lenPx*0.35);
    ctx.save();
    ctx.strokeStyle='rgba(224,83,42,0.9)'; ctx.fillStyle='rgba(224,83,42,0.9)';
    ctx.lineWidth=Math.max(2,2.5*k); ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex-ux*hl*0.6,ey-uy*hl*0.6); ctx.stroke();
    ctx.beginPath();                                        /* 箭头头部 */
    ctx.moveTo(ex,ey);
    ctx.lineTo(ex-ux*hl-uy*hl*0.5,ey-uy*hl+ux*hl*0.5);
    ctx.lineTo(ex-ux*hl+uy*hl*0.5,ey-uy*hl-ux*hl*0.5);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
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
  if(DEBUG_PHYS) drawPhysicsDebug();   /* R11 ?physics=1：四件 x/v/d/h 调试层（最上） */
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

/* ===== rAF 主循环（dirty 驱动重绘；补间进行中 stepTweens 置 dirty 续帧）===== */
function tick(){ var now=performance.now(); physInputTick(now); physicsStep(now); stepTweens(now); if(dirty){ dirty=false; draw(); } requestAnimationFrame(tick); }

/* ===== UI：重置 / 全屏（🔊 由 sfx.js 统一绑定 id=btn-mute；无场景切换按钮=蔡总明令）===== */
function on(id,ev,fn){ var el=document.getElementById(id); if(el) el.addEventListener(ev,fn); }
/* resetItems：全物品回初始位（锚位件回 home 锚位并落锁，自由件回 homePct）；清摞叠/linked/补间 */
function resetItems(){
  tweens.length=0;
  drag.item=null; hoverItem=null; pushHover=null;
  phys.mode=null; phys.item=null; phys.pressCand=false;      /* R11：清形变交互 */
  for(var i=0;i<ITEMS.length;i++){
    var it=ITEMS[i];
    it.parent=null; it.flying=false; it.linked=false; it.anchorId2=null; it.state='idle';
    killTweensOf(it);
    if(it.ph) physInit(it);                                  /* R11：四形变件动态量归零（ext/residual/dent/dh…） */
    if(R12_MASS[it.id]) physInitR12(it);                     /* R12：cart/木块/箱/钩码动态量归零（v/θ/toppled/slip…） */
    it.anchorId=it.homeAnchor||null;
    if(it.id==='cart'){ it.x=0; it.y=0; it.homeT2=true; }      /* 复位帧由 drawItemRaw 按 homeT=0.32 重新落线 */
    else if(it.homeAnchor){ var p=anchorAt(it.homeAnchor); setItemPos(it,p.x,p.y); }
    else if(it.homePct){ it.x=it.homePct.x/100*W; it.y=it.homePct.y/100*H; }
  }
  STATE.linked=false; STATE.lastPushPoint=null;
  STATE.hint=null; STATE.cart.F=0; STATE.cart.v=0; STATE.cart.a=0;   /* R12：复位清 hint/cart 读数 */
}
on('btn-reset','click',function(){
  STATE.mode='table';                        /* 原地 mutate（引擎约定） */
  layout(); resetItems(); dirty=true;
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
window.C7_TABLE_DEBUG={ZONES:ZONES,zoneRect:zoneRect,zoneCenter:zoneCenter,zonePt:zonePt,get L(){return L;},get WH(){return{W:W,H:H,k:k};},canInteract:canInteract,
  ANCHORS:ANCHORS,anchorAt:anchorAt,ITEMS:ITEMS,ITEM_BY_ID:ITEM_BY_ID,
  PHYS:PHYS,phys:phys,isDeforming:isDeforming,
  getPhys:function(){ function r(id){ var p=ITEM_BY_ID[id].ph; return p?{ext:+(p.ext||0).toFixed(2),v:+(p.v||0).toFixed(2),residual:+(p.residual||0).toFixed(2),permanent:+(p.permanent||0).toFixed(2),F:+(p.F||0).toFixed(3),dentCm:+(p.dentCm||0).toFixed(3),dh:+(p.dh||0).toFixed(2),squeeze:+(p.squeeze||0).toFixed(3),oscillating:!!p.oscillating,asleep:!!p.asleep}:null; }
    function r12(id){ var it=ITEM_BY_ID[id],p=it.ph; return (p&&p.r12)?{vx:+p.vx.toFixed(3),vy:+p.vy.toFixed(3),a:+p.a.toFixed(3),F:+p.F.toFixed(3),thetaDeg:+((p.rot+p.tilt+p.side)*180/Math.PI).toFixed(2),mTotal:+p.mTotal.toFixed(3),mode:p.mode,asleep:!!p.asleep,toppled:!!p.toppled,slip:!!p.slip,tier:p.tier,parent:it.parent?it.parent.id:null,onTrack:id==='cart'?cartOnTrack(it):null}:null; }
    return {spring:r('spring'),rubber_band:r('rubber_band'),clay:r('clay'),bottle_tube:r('bottle_tube'),cmPx:+PHYS.cmPx.toFixed(3),
      cart:r12('cart'),wood_block:r12('wood_block'),box:r12('box'),hook50:r12('hook50'),hook100:r12('hook100'),hint:STATE.hint}; },
  getState:function(){ var o={},i; for(i=0;i<ITEMS.length;i++){ o[ITEMS[i].id]={state:ITEMS[i].state,anchorId:ITEMS[i].anchorId,parent:ITEMS[i].parent?ITEMS[i].parent.id:null,linked:ITEMS[i].linked,x:Math.round(ITEMS[i].x),y:Math.round(ITEMS[i].y)}; } return o; },
  get linked(){ return !!STATE.linked; }, get lastPushPoint(){ return STATE.lastPushPoint; }};
})();

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
var STATE=window.C7_TABLE_STATE={mode:'table',v:'R10-drag',linked:false,lastPushPoint:null};

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

/* ===== 物品注册表 ITEMS（§2.3 可拖清单；homePct=初始底面中心百分比位）=====
 * kind: item=可拖器材 / carrier=可拖且顶面可摞 / fixed=承载件不拖（门扇仅推点热区，见目标五）
 * 悬挂语义：anchor='top' 吸附时锚点对齐物品顶端挂环（弹簧/测力计），默认对齐底面中心（§4.1） */
var ITEMS=[
  {id:'spring',      type:'spring',       prop:'spring_25d',      kind:'item',    homeAnchor:'A3', anchor:'top',
   opt:function(it){ return it.anchorId==='A1'?{h:Math.max(20,anchorAt('A2').y-anchorAt('A1').y)}:{h:L.trayW*0.34}; }},
  {id:'rubber_band', type:'rubber_band',  prop:'rubber_band_25d', kind:'item',    homeAnchor:'A4', anchor:'top',
   opt:function(it){ return it.anchorId==='A1'?{w:Math.max(16,(anchorAt('A2').y-anchorAt('A1').y)*0.30)}:{w:L.trayW*0.20}; }},
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
}
/* drawItemRaw：真实绘制并回写几何（w/h/mounts 实测），绘制位=base（悬挂/竖挂姿态由 setItemPos+opt 已算好） */
var trayGeo=null,doorGeo=null,b1Geo=null,b2Geo=null;
function drawItemRaw(it){
  var dx=it.x,dy=it.y,opt=it.opt?it.opt(it):{},g;
  if(it.id==='rubber_band'&&it.anchorId==='A1'){              /* 悬挂拉伸：环心挂于 A1 下方（顶缘对齐挂点） */
    dy=anchorAt('A1').y+(opt.w||20)*0.28;
  }
  if(it.id==='cart'&&trk&&trk.mounts&&it!==drag.dragItem&&!it.parent&&!isTweening(it)){   /* 未拖时小车 y 锁轨道行车线（§4.1 轨道锚点） */
    dy=trk.mounts.start.y; it.y=dy;
    if(!it.x||it.homeT2){ it.x=dx=trk.mounts.start.x+trk.mounts.len*(it.homeT!=null?it.homeT:0.32); it.homeT2=false; }   /* 初始/复位帧落位 t=0.32（§2.3） */
  }
  if(it.prop==='weight_hook_25d'){ g=drawScaledRet(PROPS[it.prop],dx,dy,(it.id==='hook100'?L.hookS*1.15:L.hookS),opt); }
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
    if(!isDraggable(it)||it.flying) continue;
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
  try{ cv.setPointerCapture(e.pointerId); }catch(err){}
  killTweensOf(it);
  drag.item=it; drag.moved=false; drag.downT=performance.now();
  drag.ox=p.x-it.x; drag.oy=p.y-it.y;
  setHover(null);
  setState(it,'grabbing'); setCursor('grabbing');             /* idle/hover → grabbing（§4.3） */
  e.preventDefault();
});
cv.addEventListener('pointermove',function(e){
  if(!canInteract()) return;
  var p=evPt(e);
  if(drag.item){
    var it=drag.item,nx=p.x-drag.ox,ny=p.y-drag.oy;
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
  var it=drag.item;
  if(!it) return;
  drag.item=null;
  try{ cv.releasePointerCapture(e.pointerId); }catch(err){}
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
    if(occ&&!(a.id==='A1'||a.id==='A2')) continue;             /* §4.4：仅铁架台悬挂位 A1/A2 允许热替换抢占；托盘槽等单 occupancy 直接跳过 */
    var ax=anchorAt(a.id);
    for(j=0;j<cands.length;j++){
      var d=Math.hypot(ax.x-cands[j].x,ax.y-cands[j].y);
      if(d<=a.snapPx&&d<bd){ bd=d; best={id:a.id,top:cands[j].top}; }
    }
  }
  if(best){ startSnap(it,best.id,best.top); return; }
  var st=stackTarget(it);                                     /* 无锚位 → 摞叠判定（目标六） */
  if(st){ startStack(it,st.carrier,st.x,st.y); return; }
  it.anchorId=null; it.anchorId2=null;                         /* 自由落定=脱离原锚位锁（§4.3 release：无吸附目标→原地落定，本单无重力，留 R11+） */
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
  setState(it,'settle');
  addTween({it:it,x0:it.x,y0:it.y,x1:x,y1:y,dur:200,ease:easeOutOvershoot,              /* 摞放同 §4.6 吸附参数 */
    onEnd:function(o){ o.x=x; o.y=y; toIdle(o); }});
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

/* ===== rAF 主循环（dirty 驱动重绘；补间进行中 stepTweens 置 dirty 续帧）===== */
function tick(){ stepTweens(performance.now()); if(dirty){ dirty=false; draw(); } requestAnimationFrame(tick); }

/* ===== UI：重置 / 全屏（🔊 由 sfx.js 统一绑定 id=btn-mute；无场景切换按钮=蔡总明令）===== */
function on(id,ev,fn){ var el=document.getElementById(id); if(el) el.addEventListener(ev,fn); }
/* resetItems：全物品回初始位（锚位件回 home 锚位并落锁，自由件回 homePct）；清摞叠/linked/补间 */
function resetItems(){
  tweens.length=0;
  drag.item=null; hoverItem=null; pushHover=null;
  for(var i=0;i<ITEMS.length;i++){
    var it=ITEMS[i];
    it.parent=null; it.flying=false; it.linked=false; it.anchorId2=null; it.state='idle';
    killTweensOf(it);
    it.anchorId=it.homeAnchor||null;
    if(it.id==='cart'){ it.x=0; it.y=0; it.homeT2=true; }      /* 复位帧由 drawItemRaw 按 homeT=0.32 重新落线 */
    else if(it.homeAnchor){ var p=anchorAt(it.homeAnchor); setItemPos(it,p.x,p.y); }
    else if(it.homePct){ it.x=it.homePct.x/100*W; it.y=it.homePct.y/100*H; }
  }
  STATE.linked=false; STATE.lastPushPoint=null;
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
  getState:function(){ var o={},i; for(i=0;i<ITEMS.length;i++){ o[ITEMS[i].id]={state:ITEMS[i].state,anchorId:ITEMS[i].anchorId,parent:ITEMS[i].parent?ITEMS[i].parent.id:null,linked:ITEMS[i].linked,x:Math.round(ITEMS[i].x),y:Math.round(ITEMS[i].y)}; } return o; },
  get linked(){ return !!STATE.linked; }, get lastPushPoint(){ return STATE.lastPushPoint; }};
})();

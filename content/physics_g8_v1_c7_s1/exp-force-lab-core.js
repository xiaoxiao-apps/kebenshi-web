/* exp-force-lab-core.js — c7s1「力的实验室」（C7V3-R2：五场景融合，飞入飞出切换）
   站点：①形变站 ②运动站 ③推门工坊(门/你来画) ④相互舞台(磁车/对拉) ⑤测力计工作台
   蔡总指令：无提示条；文字提示全走字幕；「站点/测量方式/位型」用语约定；直操优先
   C7V3-R5：浮卡遮挡修复——画布浮卡/伸长量面板统一定位（可拖动+localStorage位置记忆，
   默认停靠不挡区域标题/模式按钮的桌面空区）；场景⑤ meterH +20% */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var ANIM_DUR=600,TWEEN_MS=380;
var OVER_DEF=0.82,PERM_K=0.55;                       // 形变站：超限阈值（形变比例）与永久残留系数
var G_VAL=9.8,F_MAX=5,W_G=100,TRAY_N=5;              // 测力计：g=9.8 N/kg、量程、钩码克数、托盘容量
var OSC_TAU=0.22,OSC_HZ=2.2,OSC_LIFE=1500;           // 指针短振荡（≤1.5s 停稳）
var ZERO_OFF={v:0.35,h:0.25},OVERLOAD_MS=3000;       // 初始偏零（N）/超量程报错态时长
var EXT_L0=10.0,EXT_K=0.6;                           // 伸长量面板：原长 cm、每牛伸长 cm/N
var BALL_K=52000,BALL_VMAX=340,BALL_V0=110,BALL_R=13,BALL_RUN_MS=6000,ROLL_MS=560;  // 磁吸积分常数（教学示意）
var REP_K=900000,ATT_K=420000,CART_VMAX=420,FRICTION=0.35,STOP_V=6;                // 磁车斥/吸积分常数（教学示意）
var PUSH_K=0.10,TAU_MIN=0.45;                        // 开门角速度增益 / 最小有效力矩（阈值抬高）
var PULL_TMAX=5,PULL_TCOUNT=2.0,RELAX_MS=420;        // 对拉：满量程 5N / 计入一次「拉过」的峰值门槛
var DRAW_TOL_DEG=12,DRAW_DRAG_MIN=10;                // 你来画：竖直向上容差 / 拖动判定阈值
var DZ=PROPS.DAMP.zeta,DW=PROPS.DAMP.omega;          // 阻尼回弹参数（库定版）
var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var W=960,H=520,DPR=1,ctrlBandH=110,COMPACT_H=600,dirty=true;

function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
function easeOut(t){ return 1-Math.pow(1-t,3); }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(v,n){ return (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }
function setText(id,t){ var el=document.getElementById(id); if(el&&el.textContent!==t) el.textContent=t; }
function inRect(p,r){ return p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h; }

/* ===== 状态（R 暴露给 guide 触发器；mode 由引擎每帧轮询） ===== */
var state={
  mode:'deform',      /* 引擎轮询：deform / motion / door / mutual / meter */
  board:'door',       /* door 子板：door 推门 / draw 你来画 */
  cstep:1,            /* mutual 子步：1 磁车对弹 / 2 测力计对拉 */
  view:'deform',      /* 渲染视图 key：deform/motion/door/draw/cart/pull/meterv/meterh */
  animating:false,anim:null,modeEnterT:0,
  f:{tool:'spring',dragging:false,dragT:0,dragTool:null,overFlash:0,released:false,restored:false,
     permanent:false,lastTool:null,tried:{},triedCount:0,
     clayReleased:false,springReleased:false,bandReleased:false,bottleReleased:false,
     ts:{spring:{def:0,perm:0,over:false,rb:null,pulling:false},
         band:{def:0,perm:0,over:false,rb:null,pulling:false},
         clay:{def:0,perm:0,over:false,rb:null,pulling:false},
         bottle:{def:0,perm:0,over:false,rb:null,pulling:false}}},
  b:{mode:'near',released:false,done:false,running:false,armed:false,armT:0,relT:0,doneT:0,
     rolling:false,rollT:0,tried:{},triedCount:0,bx:0,by:0,vx:0,vy:0,trail:[],change:''},
  e:{pointMark:0.75,angle:0,F:5,pushing:false,open:0,openTw:null,omega:0,eff:0,
     nearTried:false,farTried:false,parTried:false,bigTried:false,
     successCount:0,pushStartOpen:0,pushT:0},
  d:{start:null,dirAngle:null,dirLocked:false,dragging:false,liveLen:null,lastDist:0,
     lenN:0,label:'',judged:false,wrongCount:0,items:null,tries:0},
  m:{dragging:false,dragX0:0,dragRx0:0,downPt:null,moved:false,compressed:false,
     released:false,running:false,settled:false,flip:false,attracted:false,needReset:false,
     relT:0,lx:0,rx:0,lv:0,rv:0,gap0:120},
  p:{g:0,T:0,maxT:0,pulls:0,peakT:0,drag:null,dragX0:0,dragG0:0,relaxTw:null,pulled:false},
  s:{orient:'v',overload:false,overloadT:0,examOpen:false,examDone:0,extTouched:false,
     exam:{c1:{judged:false,wrong:0},c2:{judged:false,wrong:0},
           c3:{judged:false,wrong:0},c4:{judged:false,wrong:0}},
     v:{count:0,off:ZERO_OFF.v,zeroed:false,settled:true,osc:null,zeroTw:null,drag:null},
     h:{pull:0,off:ZERO_OFF.h,zeroed:false,settled:true,osc:null,zeroTw:null,drag:false,dragX0:0,dragPull0:0}}
};
window.C7S1_STATE=state;
var TOOL_CN={spring:'弹簧',band:'橡皮筋',clay:'橡皮泥',bottle:'玻璃瓶细管'};
var PLACE_CN={near:'静止旁靠近',along:'沿运动方向',side:'运动侧旁'};
var CHANGE_CN={near:'由静止变为运动',along:'速度变快（加速）',side:'运动方向拐弯'};
var VIEWS=['deform','motion','door','draw','cart','pull','meterv','meterh'];

function viewOf(){
  if(state.mode==='deform') return 'deform';
  if(state.mode==='motion') return 'motion';
  if(state.mode==='door') return state.board==='draw'?'draw':'door';
  if(state.mode==='mutual') return state.cstep===2?'pull':'cart';
  return state.s.orient==='h'?'meterh':'meterv';
}

/* ===== 布局 ===== */
var L={};
function measureZones(){
  var zs=document.querySelectorAll('.zone'),minB=H,maxR=null;
  for(var i=0;i<zs.length;i++){
    var z=zs[i],st=getComputedStyle(z);
    if(st.display==='none'||st.visibility==='hidden') continue;
    var r=z.getBoundingClientRect();
    if(r.width===0&&r.height===0) continue;
    var wrapR=document.getElementById('scene-wrap').getBoundingClientRect();
    var top=r.top-wrapR.top,left=r.left-wrapR.left;
    if(top<minB) minB=top;
    var rr={x:left,y:top,w:r.width,h:r.height};
    if(!maxR) maxR={x:rr.x,y:rr.y,w:rr.w,h:rr.h};
    else{
      var x0=Math.min(maxR.x,rr.x),y0=Math.min(maxR.y,rr.y);
      var x1=Math.max(maxR.x+maxR.w,rr.x+rr.w),y1=Math.max(maxR.y+maxR.h,rr.y+rr.h);
      maxR={x:x0,y:y0,w:x1-x0,h:y1-y0};
    }
  }
  L.zoneB=(minB===H)?(L.fy-90):Math.max(120,minB-8);
  L.zoneR=maxR;
}
function layout(){
  L.fy=H-ctrlBandH;
  L.by=Math.max(40,L.fy-109);
  L.seat=PROPS.seatY(L.by,64,26);
  measureZones();
  layoutDeform(); layoutMotion(); layoutDoor(); layoutDraw(); layoutCart(); layoutPull(); layoutMeter();
}
var offCv=document.createElement('canvas'); offCv.width=8; offCv.height=8;
var offCtx=offCv.getContext('2d');
function layoutDeform(){
  var hangX=Math.round(W*0.18),wallX=Math.round(W*0.84),bx=Math.round(W*0.52);
  var beamY=Math.max(L.zoneB+14,Math.round(H*0.15));
  var shelfY=beamY+Math.round((L.seat-beamY)*0.45);
  var claySize=clamp(Math.round(H*0.15),56,92);
  var bandW0=Math.min(110,Math.round(W*0.11));
  var bottleW=Math.min(120,Math.max(90,Math.round(W*0.12)));
  var bottleH=clamp(Math.round((L.seat-beamY)*0.86),150,280);
  // 玻璃瓶原水面基线：离屏调用标准件取 squeeze=0 的 waterTopY（不硬编码件内比例）
  var bottleBase=PROPS.glass_bottle_tube(offCtx,bx,L.seat+10,bottleW,bottleH,{squeeze:0}).waterTopY;
  var titleY=Math.max(L.zoneB+18,beamY-30);
  L.df={hangX:hangX,wallX:wallX,bx:bx,beamY:beamY,shelfY:shelfY,titleY:titleY,
        claySize:claySize,bandW0:bandW0,bottleW:bottleW,bottleH:bottleH,bottleBase:bottleBase};
}
function layoutMotion(){
  var tw=clamp(Math.round(W*0.62),380,660);
  var th=clamp(Math.round(Math.min(L.by-46,H*0.34)),110,190);
  var tx=Math.round(W/2),ty=Math.round(L.by+52);
  var tg=PROPS.ball_track_table(offCtx,tx,ty,{w:tw,h:th});
  L.mo={tx:tx,ty:ty,tw:tw,th:th,top:tg.top,ramp:tg.ramp};
}
function layoutDoor(){
  L.door={x:Math.round(W*0.36),y:L.fy-14,w:Math.min(170,Math.round(H*0.34)),h:Math.min(250,Math.round(H*0.52))};
  L.tq={x:W-224,y:L.zoneB+14,w:200,h:16};
}
function layoutDraw(){
  var top=Math.max(L.zoneB+8,44),avail=Math.max(160,L.fy-top-8);
  var lampW=clamp(Math.round(W*0.16),90,170);
  var cx=Math.round(W*0.56);
  var ceilY=Math.round(top+avail*0.06);
  var shadeTop=ceilY+Math.round(avail*0.28);
  var shadeH=Math.round(lampW*0.40),bulbR=Math.round(lampW*0.14);
  var unit=clamp(Math.round(avail*0.075),14,30);
  var lamp={x:Math.round(cx-lampW/2),y:shadeTop,w:lampW,h:shadeH+bulbR*2+6};
  var rulerX=Math.max(28,Math.round(lamp.x-78));
  var rulerB=Math.min(Math.round(L.fy-18),lamp.y+lamp.h+Math.round(avail*0.16));
  L.dr={top:top,avail:avail,cx:cx,ceilY:ceilY,shadeTop:shadeTop,shadeH:shadeH,bulbR:bulbR,
        lampW:lampW,unit:unit,lamp:lamp,rulerX:rulerX,rulerB:rulerB,rulerT:rulerB-unit*4};
}
function layoutCart(){
  L.floorY=L.fy-16;
  L.cartW=Math.min(150,Math.round(W*0.16));
  state.m.gap0=Math.round(L.cartW*1.05);
  homeCarts();
}
function layoutPull(){
  var mh=clamp(Math.round(Math.min(W*0.20,(L.fy-96)*0.52)),110,180);
  L.pu={h:mh,LX:Math.round(W*0.14),cy:Math.round(Math.max(L.zoneB+mh*0.6,(L.fy+L.zoneB)/2)),
        gMax:clamp(Math.round(W*0.13),90,170),cardY:Math.max(L.zoneB+8,40)};
}
function layoutMeter(){
  var beamY=Math.max(L.zoneB+10,Math.round(H*0.13));
  /* R5 视觉优化：表体比例 +20%（clamp 上下限 110/190→132/228），双列刻度更清晰；
     挂钩联动逻辑不变（挂码容量仍由 hangWeight 按 seat 剩余高度自适应限容） */
  var meterH=clamp(Math.round((L.seat-beamY-TRAY_N*32-46)*1.2),132,228);
  L.mt={beamY:beamY,cx:Math.round(W*0.38),meterH:meterH,
        trayX:Math.round(W*0.74),
        hx:clamp(Math.round(W*0.34),meterH+80,Math.max(meterH+80,W-300)),hy:L.seat-30};
}
function homeCarts(){
  var M=state.m;
  M.lx=Math.round(W/2-M.gap0/2-L.cartW*0.05);
  M.rx=Math.round(W/2+M.gap0/2+L.cartW*0.05);
  M.lv=0; M.rv=0;
}
function resetBall(){
  var mo=L.mo,B=state.b;
  if(!mo){ B.bx=W*0.62; B.by=H*0.5; return; }
  var t=mo.top,rp=mo.ramp;
  if(B.mode==='near'){ B.bx=rp.x1+16; B.by=t.b-BALL_R-4; }
  else{ B.bx=rp.x0+10; B.by=rp.y0+8; }
  B.vx=0; B.vy=0; B.trail=[]; B.released=false; B.running=false; B.done=false;
  B.rolling=false; B.change='';
}
function reflow(){ if(state.mode==='motion'&&!state.b.running&&!state.b.rolling) resetBall(); }
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl(); layout(); reflow(); repositionPanels();
  dirty=true;
}

/* ===== 绘制基础 ===== */
function rrPath(x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x,y+h,r); ctx.closePath();
}
function ghostCard(x,y,w,h){
  rrPath(x,y,w,h,10);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=1.5; ctx.stroke();
}
/* ===== 浮卡统一定位（C7V3-R5）：可拖动+localStorage位置记忆，默认停靠角落避开标题带/按钮带 ===== */
var CARD_MEM_KEY='c7s1_forceLab_cardPos_v1';
var cardMem={},cardDrag=null;
try{ cardMem=JSON.parse(localStorage.getItem(CARD_MEM_KEY)||'{}')||{}; }catch(e){ cardMem={}; }
function saveCardMem(){ try{ localStorage.setItem(CARD_MEM_KEY,JSON.stringify(cardMem)); }catch(e){} }
function cardTopSafe(){ return (L.zoneR?(L.zoneR.y+L.zoneR.h):44)+6; }   /* 顶部 zone 控件带下沿 */
function cardDefaultPos(key,w,h){
  /* 默认坐标选择理由（R5 验收：不落在区域标题 y 带、不落在模式按钮 rect 内）：
     · 区域标题带 titleY≈zoneB+18、模式按钮带 zoneR 均在画布上部（y<150），默认卡取 y≈L.by-70
       （桌面上沿 by 之上、器材作用区之下：悬挂弹簧/墙面搁板/木块拖拽带最低到 seat≈by+45），上下都不沾；
     · 画布底部 by..fy 为 wood_desk 全宽立面围板，浮卡不得停靠（会盖住桌面前沿），故不用 br/bl 贴底角；
     · deform → 右下：玻璃瓶（桌面位，bx±bottleW）右侧的桌面空区；
     · meter  → 左下：立柱底座（cx±70）/水平位型（hx 起）左侧的桌面空区（右下被砝码托盘 trayX±70 占用）；
     · ext（伸长量面板，DOM）→ 左上但压到 zone 按钮带之下（原版落在静态流位置=左上角，正好盖住
       「竖直挂钩码/水平拖木块」模式切换按钮，R5 缺陷②）。 */
  if(key==='deform') return {x:Math.min(W-w-16,L.df?L.df.bx+L.df.bottleW+30:W-w-16),y:Math.max(cardTopSafe(),L.by-h-10)};
  if(key==='meter')  return {x:16,y:Math.max(cardTopSafe(),L.by-h-10)};
  return {x:14,y:cardTopSafe()};
}
function cardRect(key,w,h){
  var p=cardMem[key]||cardDefaultPos(key,w,h);
  var top=cardTopSafe();
  var x=clamp(p.x,8,Math.max(8,W-w-8));
  var y=clamp(p.y,top,Math.max(top,L.fy-h-8));
  return {x:x,y:y,w:w,h:h,key:key};
}
function activeCardRect(){   /* 当前视图可拖的画布浮卡 */
  if(state.view==='deform') return cardRect('deform',200,54);
  if(state.view==='meterv'||state.view==='meterh') return cardRect('meter',208,74);
  return null;
}
function cardGrip(x,y){   /* 右下角拖动提示点 */
  ctx.fillStyle='#94a3b8'; ctx.font='10px sans-serif'; ctx.textAlign='right';
  ctx.fillText('⠿ 拖动',x,y);
}
function drawArrow(x0,y0,x1,y1,color,lw){
  var dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy); if(d<4) return;
  var ux=dx/d,uy=dy/d,hd=Math.max(7,d*0.24);
  ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=lw||3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1-ux*hd*0.8,y1-uy*hd*0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1,y1);
  ctx.lineTo(x1-ux*hd-uy*hd*0.5,y1-uy*hd+ux*hd*0.5);
  ctx.lineTo(x1-ux*hd+uy*hd*0.5,y1-uy*hd-ux*hd*0.5);
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function mark(ok,x,y,r){   /* 判分 ✓/✗（画布内联标记） */
  ctx.save(); ctx.lineWidth=Math.max(2.4,r*0.30); ctx.lineCap='round';
  ctx.strokeStyle=ok?'#15803d':'#dc2626';
  if(ok){ ctx.beginPath(); ctx.moveTo(x-r*0.55,y); ctx.lineTo(x-r*0.12,y+r*0.48); ctx.lineTo(x+r*0.62,y-r*0.46); ctx.stroke(); }
  else{ ctx.beginPath(); ctx.moveTo(x-r*0.5,y-r*0.5); ctx.lineTo(x+r*0.5,y+r*0.5);
        ctx.moveTo(x+r*0.5,y-r*0.5); ctx.lineTo(x-r*0.5,y+r*0.5); ctx.stroke(); }
  ctx.restore();
}

/* ============================================================ 站点① 形变站 */
function FT(){ return state.f.ts[state.f.tool]; }
function springAnchor(){
  var df=L.df;
  var hNow=PROPS.spring_vertical(offCtx,0,0,{stretch:FT().def,h:clamp(Math.round((L.seat-df.beamY)*0.72),100,200)}).h;
  return {h0:clamp(Math.round((L.seat-df.beamY)*0.72),100,200),anchorY:df.beamY+hNow,hNow:hNow};
}
function bandCy(){
  var wNow=L.df.bandW0*(1+0.9*FT().def);
  return L.df.beamY+4+wNow/2;
}
function deformGeom(){   /* 各器材当前作用点（拖拽命中/箭头/手部锚定统一走这里） */
  var df=L.df,f=state.f,g={};
  var sa=springAnchor();
  g.spring={ring:{x:df.hangX,y:sa.anchorY-6},scale:0.45*sa.h0,axis:'y',dir:-1};
  var cyB=bandCy();
  g.band={ring:{x:df.hangX,y:cyB+L.df.bandW0*0.21},scale:0.9*df.bandW0,axis:'y',dir:1};
  g.clay={tip:{x:df.wallX,y:df.shelfY-df.claySize*0.55},scale:0.6*df.claySize,axis:'y',dir:1};
  g.bottle={grip:{x:df.bx+df.bottleW*0.5+8,y:L.seat+10-df.bottleH*0.28},scale:0.75*df.bottleW,axis:'x'};
  return g;
}
function renderDeform(){
  var df=L.df,f=state.f,now=performance.now();
  ctx.fillStyle='#fbf9f4'; ctx.fillRect(0,-H*2,W,H*5);
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  /* 试验台架：底座+立柱+横梁（悬挂位） */
  ctx.save();
  ctx.fillStyle='#9aa1ab'; ctx.strokeStyle='#7d838c'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(df.hangX-70,L.seat-10,140,10,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(df.hangX-6,df.beamY-6,12,L.seat-df.beamY-4,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(df.hangX-96,df.beamY-14,192,10,3); ctx.fill(); ctx.stroke();
  ctx.restore();
  /* 墙面位：墙板+搁板 */
  ctx.save();
  ctx.fillStyle='#e7dcc8'; ctx.strokeStyle='#c9b99a'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.roundRect(df.wallX-64,df.beamY-20,128,L.seat-df.beamY+14,4); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#b08a5a'; ctx.strokeStyle='#8a6a42';
  ctx.beginPath(); ctx.roundRect(df.wallX-56,df.shelfY,112,8,2); ctx.fill(); ctx.stroke();
  ctx.restore();
  /* 区域标题（等高、无序号） */
  ctx.font='600 14px sans-serif'; ctx.textAlign='center';
  ctx.fillStyle='#8a7c66';
  ctx.fillText('悬挂位',df.hangX,df.titleY);
  ctx.fillText('桌面位',df.bx,df.titleY);
  ctx.fillText('墙面位',df.wallX,df.titleY);
  /* --- 悬挂位：弹簧（选中实画，未选中淡化） --- */
  var on=f.tool==='spring';
  ctx.globalAlpha=on?1:0.28;
  var sa=springAnchor();
  var sg=PROPS.spring_vertical(ctx,df.hangX,sa.anchorY,{stretch:FT2('spring'),h:sa.h0});
  if(on&&FT2('spring')>0.01){
    drawArrow(df.hangX,sg.hook.y+6,df.hangX,sg.hook.y+6+18+FT2('spring')*46,'#dc2626',3.6);
    ctx.fillStyle='#dc2626'; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F 拉',df.hangX+8,sg.hook.y+34);
  }
  ctx.globalAlpha=1;
  /* --- 悬挂位：橡皮筋（竖放悬挂） --- */
  on=f.tool==='band';
  ctx.globalAlpha=on?1:0.28;
  var cyB=bandCy(),w0=df.bandW0,st=FT2('band');
  ctx.save();
  ctx.translate(df.hangX,cyB); ctx.rotate(Math.PI/2);
  PROPS.rubber_band(ctx,0,0,{stretch:st,w:w0});
  ctx.restore();
  if(on&&st>0.01){
    var bBot=cyB+w0*0.42*(1-0.45*st)/2;
    drawArrow(df.hangX,bBot+6,df.hangX,bBot+6+16+st*40,'#dc2626',3.6);
    ctx.fillStyle='#dc2626'; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F 拉',df.hangX+8,bBot+26);
  }
  ctx.globalAlpha=1;
  /* --- 墙面位：橡皮泥+手 --- */
  on=f.tool==='clay';
  ctx.globalAlpha=on?1:0.28;
  var cg=PROPS.plasticine(ctx,df.wallX,df.shelfY,{size:df.claySize,press:FT2('clay')});
  if(on&&FT2('clay')>0.02) PROPS.hand_press(ctx,cg.tip.x,cg.tip.y+2,{h:Math.round(df.claySize*1.5)});
  ctx.globalAlpha=1;
  /* --- 桌面位：玻璃瓶细管 --- */
  on=f.tool==='bottle';
  ctx.globalAlpha=on?1:0.28;
  var sq=FT2('bottle');
  var bg=PROPS.glass_bottle_tube(ctx,df.bx,L.seat+10,df.bottleW,df.bottleH,{squeeze:sq});
  ctx.save(); ctx.strokeStyle='rgba(37,99,235,.7)'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(df.bx-df.bottleW*0.85,df.bottleBase); ctx.lineTo(df.bx+df.bottleW*0.85,df.bottleBase); ctx.stroke(); ctx.restore();
  ctx.fillStyle='#2563eb'; ctx.font='11px sans-serif'; ctx.textAlign='left';
  ctx.fillText('原水面',df.bx+df.bottleW*0.9,df.bottleBase+4);
  if(on&&sq>0.01){
    ctx.save(); ctx.strokeStyle='#16a34a'; ctx.lineWidth=1.8; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(df.bx-df.bottleW*0.85,bg.waterTopY); ctx.lineTo(df.bx+df.bottleW*0.85,bg.waterTopY); ctx.stroke(); ctx.restore();
    ctx.fillStyle='#16a34a'; ctx.font='600 11px sans-serif'; ctx.textAlign='left';
    ctx.fillText('水柱顶面',df.bx+df.bottleW*0.9,bg.waterTopY+4);
    var mx=df.bx-df.bottleW*0.62;
    ctx.save(); ctx.strokeStyle='#b91c1c'; ctx.fillStyle='#b91c1c'; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(mx,bg.waterTopY+3); ctx.lineTo(mx,df.bottleBase-3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx,bg.waterTopY+3); ctx.lineTo(mx-3.5,bg.waterTopY+9); ctx.lineTo(mx+3.5,bg.waterTopY+9); ctx.closePath(); ctx.fill();
    ctx.font='600 11px sans-serif'; ctx.textAlign='right';
    ctx.fillText('水柱上升',mx-6,(bg.waterTopY+df.bottleBase)/2);
    ctx.restore();
    var bodyCy=L.seat+10-df.bottleH*0.28,ex=df.bottleW*0.5+6,aLen=14+sq*34;
    drawArrow(df.bx-ex-aLen-8,bodyCy,df.bx-ex,bodyCy,'#dc2626',3.6);
    drawArrow(df.bx+ex+aLen+8,bodyCy,df.bx+ex,bodyCy,'#dc2626',3.6);
    ctx.fillStyle='#dc2626'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
    ctx.fillText('捏',df.bx-ex-aLen*0.5-8,bodyCy-12);
    ctx.fillText('捏',df.bx+ex+aLen*0.5+8,bodyCy-12);
  }
  ctx.globalAlpha=1;
  /* 超限红闪 */
  if(f.overFlash>0&&now<f.overFlash){
    var pulse=0.5+0.5*Math.sin(now/90);
    ctx.save(); ctx.strokeStyle='rgba(220,38,38,'+(0.35+0.45*pulse).toFixed(2)+')'; ctx.lineWidth=3;
    ctx.strokeRect(8,L.zoneB-4,W-16,L.fy-L.zoneB-2); ctx.restore();
    ctx.fillStyle='#b91c1c'; ctx.font='700 14px sans-serif'; ctx.textAlign='center';
    ctx.fillText('⚠ 超过弹性限度！',W/2,L.zoneB+22);
  }
  /* 长度三栏浮卡（L₀/L/L′） */
  lengthCard();
}
function FT2(t){ return state.f.ts[t].def; }
function lengthCard(){
  var f=state.f,ts=f.ts;
  /* R5：浮卡可拖动+位置记忆；原固定右上（W-216, zoneB+10）压住「墙面位」区域标题（缺陷①），
     默认改停右下桌面空区（见 cardDefaultPos 坐标理由） */
  var cr=cardRect('deform',200,54),x=cr.x,y=cr.y;
  ghostCard(x,y,200,54);
  ctx.font='600 12px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  var L0,Lnow,Lafter,unit='cm';
  if(f.tool==='spring'||f.tool==='band'){ L0=10.0; Lnow=10.0*(1+0.45*ts[f.tool].def); }
  else if(f.tool==='clay'){ L0=4.0; Lnow=4.0*(1-0.35*ts.clay.def); }
  else { L0=12.0; Lnow=12.0+8.0*ts.bottle.def; unit='cm'; }
  Lafter=f.tried[f.tool]?(f.tool==='clay'?'不恢复':(ts[f.tool].perm>0.005?fmt(permLen(f.tool),1):'恢复原状')):'—';
  ctx.fillStyle='#64748b'; ctx.fillText(TOOL_CN[f.tool]+' 长度',x+12,y+17);
  ctx.fillStyle='#334155';
  ctx.fillText('L₀='+fmt(L0,1)+unit,x+12,y+35);
  ctx.fillText('L='+fmt(Lnow,1)+unit,x+84,y+35);
  ctx.fillStyle='#2563eb';
  ctx.fillText('L′='+Lafter,x+150,y+35);
  ctx.fillStyle='#94a3b8'; ctx.font='10px sans-serif'; ctx.textAlign='left';
  ctx.fillText('（L′=松手后）',x+12,y+50);
  cardGrip(x+192,y+50);
}
function permLen(t){
  var ts=state.f.ts[t];
  if(t==='spring'||t==='band') return 10.0*(1+0.45*ts.perm);
  if(t==='clay') return 4.0*(1-0.35*ts.perm);
  return 12.0+8.0*ts.perm;
}
/* 形变站直操：按住器材拖动=施力，松手=撤力（弹性体阻尼回弹） */
function deformDown(p){
  var f=state.f,g=deformGeom(),t=f.tool,hit=null;
  if(t==='spring'&&Math.abs(p.x-L.df.hangX)<40&&p.y>L.df.beamY) hit={pt:g.spring.ring};
  else if(t==='band'&&Math.abs(p.x-L.df.hangX)<40&&p.y>L.df.beamY) hit={pt:g.band.ring};
  else if(t==='clay'&&Math.hypot(p.x-L.df.wallX,p.y-L.df.shelfY)<L.df.claySize*0.9) hit={pt:g.clay.tip};
  else if(t==='bottle'&&Math.abs(p.x-L.df.bx)<L.df.bottleW*0.8&&p.y>L.seat-L.df.bottleH) hit={pt:g.bottle.grip};
  if(!hit) return false;
  f.dragging=true; f.dragT=performance.now(); f.dragTool=t;
  f.drag0={x:p.x,y:p.y};
  if(window.playClick) playClick();
  return true;
}
function deformMove(p){
  var f=state.f;
  if(!f.dragging) return false;
  var g=deformGeom(),t=f.dragTool,ts=f.ts[t],delta=0;
  if(t==='bottle') delta=(p.x-f.drag0.x)*(p.x>L.df.bx?-1:1)/g.bottle.scale;
  else if(t==='clay') delta=(p.y-f.drag0.y)/g.clay.scale;
  else if(t==='spring') delta=(p.y-f.drag0.y)/g.spring.scale;
  else delta=(p.y-f.drag0.y)/g.band.scale;
  var d=clamp(delta,0,1);
  ts.pulling=d>0.01;
  ts.def=ts.perm+d*(1-ts.perm);
  ts.over=d>=OVER_DEF;
  if(ts.over) f.overFlash=performance.now()+400;
  if(d>0.01){ f.released=false; f.restored=false; }
  updatePanel(); dirty=true;
  return true;
}
function deformUp(){
  var f=state.f;
  if(!f.dragging) return false;
  f.dragging=false;
  var t=f.dragTool,ts=f.ts[t],now=performance.now();
  f.dragTool=null;
  ts.pulling=false;
  var permNew=0;
  if(t==='clay') permNew=ts.def;                       // 橡皮泥：凹痕冻结=塑性
  else if((t==='spring'||t==='band')&&ts.over&&ts.def>=OVER_DEF) permNew=ts.def*PERM_K;  // 超限：永久残留
  ts.over=false; f.overFlash=0;
  if(t==='clay'||Math.abs(ts.def-permNew)<0.005){ relFinish2(t,permNew); }
  else{ ts.rb={t0:now,A:ts.def,perm:permNew}; f.released=true; }
  updatePanel(); dirty=true;
  return true;
}
function relFinish2(t,perm){
  var f=state.f,ts=f.ts[t];
  ts.def=perm; ts.perm=perm; ts.rb=null;
  f.released=true; f.lastTool=t;
  f.restored=(perm===0&&t!=='clay');
  if((t==='spring'||t==='band')&&perm>0) f.permanent=true;
  f.tried[t]=1; f.triedCount=Object.keys(f.tried).length;
  if(t==='clay') f.clayReleased=true;
  else if(t==='spring') f.springReleased=true;
  else if(t==='band') f.bandReleased=true;
  else f.bottleReleased=true;
  if(f.restored){ if(window.playMatch) playMatch(); }
  else if(window.playDrop) playDrop();
  updatePanel(); dirty=true;
}
function deformTick(now){
  var f=state.f,bsy=false;
  ['spring','band','clay','bottle'].forEach(function(t){
    var ts=f.ts[t];
    if(!ts.rb) return;
    var el=(now-ts.rb.t0)/1000;
    var env=Math.exp(-DZ*DW*el);
    if(env<0.02||el>2.5){ relFinish2(t,ts.rb.perm); return; }
    ts.def=ts.rb.perm+(ts.rb.A-ts.rb.perm)*env*Math.cos(DW*el);
    ts.def=clamp(ts.def,0,1);
    bsy=true; dirty=true;
  });
  return bsy;
}
function setTool(t){
  var f=state.f;
  if(f.dragging) return;
  f.tool=t;
  syncToolBtns(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
}
function syncToolBtns(){
  ['spring','band','clay','bottle'].forEach(function(t){
    var b=document.getElementById('btn-tool-'+t);
    if(b) b.classList.toggle('on',state.f.tool===t);
  });
}
function resetF(){
  var f=state.f;
  ['spring','band','clay','bottle'].forEach(function(t){ f.ts[t]={def:0,perm:0,over:false,rb:null,pulling:false}; });
  f.dragging=false; f.dragTool=null; f.overFlash=0; f.released=false; f.restored=false;
  f.permanent=false; f.lastTool=null; f.tried={}; f.triedCount=0;
  f.clayReleased=false; f.springReleased=false; f.bandReleased=false; f.bottleReleased=false;
  syncToolBtns(); updatePanel(); dirty=true;
}

/* ============================================================ 站点② 运动站 */
function magnetPos(){
  var mo=L.mo,B=state.b;
  if(!mo) return {x:W*0.8,y:H*0.5};
  var t=mo.top;
  if(B.mode==='near') return {x:t.r-64,y:t.b-34};
  if(B.mode==='along') return {x:t.r-56,y:t.b-26};
  return {x:(t.l+t.r)/2+40,y:t.t+34};
}
function renderMotion(){
  var mo=L.mo,B=state.b;
  ctx.fillStyle='#fbf9f4'; ctx.fillRect(0,-H*2,W,H*5);
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  var tg=PROPS.ball_track_table(ctx,mo.tx,mo.ty,{w:mo.tw,h:mo.th});
  L.mo.top=tg.top; L.mo.ramp=tg.ramp;
  var t=tg.top,rp=tg.ramp;
  if(!B.running&&!B.released&&!B.rolling) resetBall();
  /* 斜槽小标签 */
  ctx.fillStyle='#8a7c66'; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
  ctx.fillText('斜面槽',rp.x0+4,rp.y0-10);
  var mp=magnetPos();
  PROPS.bar_magnet(ctx,mp.x,mp.y,{label:true,w:Math.min(96,mo.tw*0.16),angle:B.mode==='side'?90:0});
  ctx.fillStyle='#8a5a2b'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('磁体',mp.x,mp.y+(B.mode==='side'?62:30));
  if(B.trail.length>1){
    ctx.save(); ctx.strokeStyle='#e0655a'; ctx.lineWidth=2; ctx.setLineDash([6,5]);
    ctx.beginPath(); ctx.moveTo(B.trail[0].x,B.trail[0].y);
    for(var i=1;i<B.trail.length;i++) ctx.lineTo(B.trail[i].x,B.trail[i].y);
    ctx.stroke(); ctx.restore();
  }
  PROPS.iron_ball(ctx,B.bx,B.by+BALL_R,{r:BALL_R});
  var sp=Math.hypot(B.vx,B.vy);
  if(sp>8){
    var al=clamp(sp/BALL_VMAX,0.15,1)*72;
    drawArrow(B.bx,B.by,B.bx+B.vx/sp*al,B.by+B.vy/sp*al,'#2563eb',3.4);
    ctx.fillStyle='#2563eb'; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
    ctx.fillText('v='+fmt(sp/40,1),B.bx+B.vx/sp*al+6,B.by+B.vy/sp*al);
  }
}
function ballTick(now,dtMs){
  var B=state.b,mo=L.mo;
  if(!mo) return false;
  var t=mo.top,rp=mo.ramp;
  /* 滚下动画：坡顶→坡底（u² 匀加速插值） */
  if(B.rolling){
    var p=clamp((now-B.rollT)/ROLL_MS,0,1);
    var u=p*p;   // 匀加速：位移∝t²
    B.bx=rp.x0+10+(rp.x1+16-(rp.x0+10))*u;
    B.by=rp.y0+8+(t.b-BALL_R-4-(rp.y0+8))*u;
    dirty=true;
    if(p>=1){
      B.rolling=false; B.running=true; B.relT=now;
      var dx=rp.x1-rp.x0,dy=rp.y1-rp.y0,dd=Math.hypot(dx,dy);
      B.vx=dx/dd*BALL_V0; B.vy=dy/dd*BALL_V0;
      B.trail=[{x:B.bx,y:B.by}];
    }
    return true;
  }
  if(!B.running) return false;
  var dt=Math.min(32,dtMs)/1000,steps=2,h=dt/steps;
  for(var s=0;s<steps;s++){
    var mp=magnetPos(),dx2=mp.x-B.bx,dy2=mp.y-B.by,d=Math.max(20,Math.hypot(dx2,dy2));
    var a=Math.min(900,BALL_K/(d*d));
    B.vx+=a*dx2/d*h; B.vy+=a*dy2/d*h;
    var sp=Math.hypot(B.vx,B.vy);
    if(sp>BALL_VMAX){ B.vx*=BALL_VMAX/sp; B.vy*=BALL_VMAX/sp; }
    B.bx+=B.vx*h; B.by+=B.vy*h;
  }
  var hitEdge=(B.bx<t.l+BALL_R||B.bx>t.r-BALL_R||B.by<t.t+BALL_R||B.by>t.b-BALL_R);
  var mp2=magnetPos(),arrived=Math.hypot(mp2.x-B.bx,mp2.y-B.by)<30;
  var last=B.trail[B.trail.length-1];
  if(!last||Math.hypot(B.bx-last.x,B.by-last.y)>7) B.trail.push({x:B.bx,y:B.by});
  if(hitEdge){ B.bx=clamp(B.bx,t.l+BALL_R,t.r-BALL_R); B.by=clamp(B.by,t.t+BALL_R,t.b-BALL_R); }
  if(arrived||hitEdge||(now-B.relT)>BALL_RUN_MS){
    B.running=false; B.done=true; B.doneT=now; B.change=B.mode;
    B.tried[B.mode]=true; B.triedCount=Object.keys(B.tried).length;
    if(window.playMatch) playMatch();
    updatePanel();
  }
  dirty=true;
  return true;
}
function ballRelease(){
  var B=state.b;
  if(!L.mo||B.rolling||B.running) return;
  resetBall();
  if(B.mode==='along'||B.mode==='side'){   // 先滚下斜槽获得初速度，再进磁吸积分
    B.released=true; B.rolling=true; B.rollT=performance.now();
    B.trail=[{x:B.bx,y:B.by}];
  }else{
    B.vx=0; B.vy=0;
    B.released=true; B.running=true; B.relT=performance.now();
    B.trail=[{x:B.bx,y:B.by}];
  }
  B.armed=false;
  if(window.playClick) playClick();
  updatePanel(); dirty=true;
}
function ballSetMode(m){
  var B=state.b;
  if(B.mode===m) return;
  B.mode=m; B.armed=true; B.armT=performance.now();
  resetBall(); syncPlaceBtns(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
}
function syncPlaceBtns(){
  ['near','along','side'].forEach(function(m){
    var b=document.getElementById('btn-place-'+m);
    if(b) b.classList.toggle('on',state.b.mode===m);
  });
}
function resetB(){
  resetBall(); state.b.armed=false; state.b.tried=state.b.tried||{};
  updatePanel(); dirty=true;
  if(window.playClick) playClick();
}

/* ============================================================ 站点③ 推门工坊（子板 door） */
function torque(){ var E=state.e; return E.F*Math.cos(E.angle*Math.PI/180)*E.pointMark; }
function doorTick(now,dtMs){
  var E=state.e,bsy=false;
  E.eff=torque();
  if(E.openTw){
    var p=clamp((now-E.openTw.t0)/600,0,1);
    E.open=E.openTw.f0+(E.openTw.f1-E.openTw.f0)*easeInOut(p);
    if(p>=1){ E.open=E.openTw.f1; E.openTw=null; } else bsy=true;
    E.omega=0; dirty=true; return bsy;
  }
  if(E.pushing&&E.eff>=TAU_MIN&&E.open<1){
    E.omega=PUSH_K*E.eff;
    E.open=clamp(E.open+E.omega*dtMs/1000,0,1);
    bsy=true; dirty=true;
  }else if(E.omega!==0){ E.omega=0; dirty=true; }
  return bsy;
}
function pushToggle(){
  var E=state.e;
  E.pushing=!E.pushing;
  var btn=document.getElementById('btn-push');
  if(btn){ btn.textContent=E.pushing?'停止推门':'开始推门'; btn.classList.toggle('on',E.pushing); }
  if(E.pushing){
    E.pushStartOpen=E.open; E.pushT=performance.now();
    if(E.pointMark<0.3&&E.F>=5) E.nearTried=true;
    if(Math.abs(E.angle)>70&&E.F>=5) E.parTried=true;
  }else{
    var d=E.open-E.pushStartOpen;
    if(d>0.05&&E.pointMark>0.7) E.farTried=true;
    if(d>0.1) E.successCount++;
    if(d>0.3) E.bigTried=true;
    if(E.F>=8&&Math.abs(E.angle)<30&&E.pointMark>0.5&&d>0.1) E.bigTried=true;
  }
  if(window.playClick) playClick();
  updatePanel(); dirty=true;
}
function closeDoor(){
  var E=state.e;
  if(E.pushing) pushToggle();
  E.openTw={t0:performance.now(),f0:E.open,f1:0};
  if(window.playClick) playClick();
  dirty=true;
}
function renderDoor(){
  var E=state.e;
  ctx.fillStyle='#faf6ee'; ctx.fillRect(0,-H*2,W,H*5);
  ctx.fillStyle='#eee5d3'; ctx.fillRect(0,L.fy-14,W,H*3);
  ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,L.fy-14); ctx.lineTo(W,L.fy-14); ctx.stroke();
  var dg=PROPS.door(ctx,L.door.x,L.door.y,{w:L.door.w,h:L.door.h,open:E.open,pointMark:E.pointMark});
  /* 力的箭头：起点=作用点、方向=角度、长∝大小（三滑杆联动实时重画） */
  var aLen=18+E.F*13,rad=E.angle*Math.PI/180;
  var ax=dg.point.x+aLen*Math.cos(rad),ay=dg.point.y-aLen*Math.sin(rad);
  drawArrow(dg.point.x,dg.point.y,ax,ay,'#e03131',4.5);
  ctx.fillStyle='#e03131'; ctx.font='bold 14px sans-serif'; ctx.textAlign='left';
  ctx.fillText('F='+fmt(E.F,1)+'N',ax+8,ay+4);
  /* 门轴俯视角度弧：0°=垂直门面、90°=顺门面、力方向红射线、夹角标注 */
  var hx=dg.hinge.x,hy=dg.hinge.y,ar=52;
  ghostCard(hx-ar-26,hy-ar-46,ar*2+96,ar+72);
  ctx.save();
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=1.3; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(hx-ar-14,hy); ctx.lineTo(hx+ar+14,hy); ctx.stroke();   // 水平虚线=垂直门面0°
  ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx,hy-ar-10); ctx.stroke();          // 竖直虚线=顺门面90°
  ctx.setLineDash([]);
  ctx.strokeStyle='#cbd5e1'; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.arc(hx,hy,ar,Math.PI,Math.PI*2); ctx.stroke();
  var aRad=E.angle*Math.PI/180;
  drawArrow(hx,hy,hx+Math.cos(aRad)*(ar+8),hy-Math.sin(aRad)*(ar+8),'#e03131',3.2);
  var mid=(Math.PI+aRad)/2;
  ctx.strokeStyle='rgba(37,99,235,.8)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(hx,hy,ar*0.55,Math.PI,Math.PI+aRad,aRad<0); ctx.stroke();
  ctx.fillStyle='#2563eb'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('夹角 '+Math.abs(E.angle)+'°',hx+Math.cos(mid)*(ar*0.55+22),hy+Math.sin(mid)*(ar*0.55+22)+4);
  ctx.fillStyle='#64748b'; ctx.font='11px sans-serif';
  ctx.fillText('门轴（俯视）',hx,hy+18);
  ctx.fillText('0°垂直门面',hx-ar-10,hy-ar-14); ctx.textAlign='center';
  ctx.fillText('90°顺门面',hx,hy-ar-16);
  ctx.restore();
  /* 实时力矩条：量程0..10、门槛红虚线、达标蓝/未达标灰 */
  var Q=L.tq,tau=E.eff,frac=clamp(tau/10,0,1);
  ghostCard(Q.x-10,Q.y-22,Q.w+20,Q.h+40);
  ctx.fillStyle='#e2e8f0';
  rrPath(Q.x,Q.y,Q.w,Q.h,5); ctx.fill();
  ctx.fillStyle=tau>=TAU_MIN?'#2563eb':'#94a3b8';
  if(frac>0.004){ rrPath(Q.x,Q.y,Math.max(6,Q.w*frac),Q.h,5); ctx.fill(); }
  ctx.save(); ctx.strokeStyle='#dc2626'; ctx.lineWidth=1.6; ctx.setLineDash([3,3]);
  var thrX=Q.x+Q.w*(TAU_MIN/10);
  ctx.beginPath(); ctx.moveTo(thrX,Q.y-4); ctx.lineTo(thrX,Q.y+Q.h+4); ctx.stroke(); ctx.restore();
  ctx.fillStyle='#334155'; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
  ctx.fillText('力矩 τ='+fmt(tau,2)+(tau>=TAU_MIN?'（推得动）':'（推不动）'),Q.x,Q.y+Q.h+16);
  /* 力臂虚线（作用点离轴距离） */
  ctx.save(); ctx.strokeStyle='rgba(100,116,139,.7)'; ctx.lineWidth=1.4; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(dg.hinge.x,dg.hinge.y); ctx.lineTo(dg.point.x,dg.point.y); ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#475569'; ctx.font='12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('力臂（作用点离轴 '+Math.round(E.pointMark*100)+'%）',(dg.hinge.x+dg.point.x)/2,dg.hinge.y+18);
}
function resetE(){
  var E=state.e;
  E.pointMark=0.75; E.angle=0; E.F=5; E.pushing=false; E.open=0; E.openTw=null; E.omega=0; E.eff=0;
  E.nearTried=false; E.farTried=false; E.parTried=false; E.bigTried=false; E.successCount=0;
  var rp=document.getElementById('rng-point'); if(rp) rp.value='75';
  var rd=document.getElementById('rng-dir'); if(rd) rd.value='0';
  var rs=document.getElementById('rng-size'); if(rs) rs.value='5';
  setText('lbl-point','75 %'); setText('lbl-dir','0°'); setText('lbl-size','5.0 N');
  var btn=document.getElementById('btn-push'); if(btn){ btn.textContent='开始推门'; btn.classList.remove('on'); }
  updatePanel(); dirty=true;
}

/* ============================================================ 站点③ 子板「你来画」（拖拽式） */
function drawBoardReset(){
  var D=state.d;
  D.start=null; D.dirAngle=null; D.dirLocked=false; D.dragging=false; D.liveLen=null; D.lastDist=0;
  D.lenN=0; D.label=''; D.judged=false; D.wrongCount=0; D.items=null;
  updatePanel(); dirty=true;
}
function renderDraw(){
  var D=state.d,R0=L.dr;
  ctx.fillStyle='#fbf9f4'; ctx.fillRect(0,-H*2,W,H*5);
  /* 情境卡（题目给定条件） */
  ghostCard(16,R0.top-10,Math.min(440,W*0.62),72);
  ctx.fillStyle='#334155'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  ctx.fillText('情境：绳吊着的吊灯静止不动，',30,R0.top+10);
  ctx.fillText('绳对灯的拉力 F = 4 N，方向竖直向上。画出这个力。',30,R0.top+30);
  ctx.fillStyle='#64748b'; ctx.font='12px sans-serif';
  ctx.fillText('本题只画绳对灯的拉力，重力不画。',30,R0.top+50);
  /* 天花板：先画文字，再画带（盖住字下半，露出上半即标签） */
  ctx.fillStyle='#8a7c66'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('天花板',R0.cx,R0.ceilY-32);
  ctx.fillStyle='#d8cbb4'; ctx.fillRect(0,R0.ceilY-26,W,26);
  ctx.save(); ctx.strokeStyle='rgba(120,100,70,.45)'; ctx.lineWidth=1.4;
  ctx.beginPath();
  for(var hx=-30;hx<W;hx+=18){ ctx.moveTo(hx,R0.ceilY-26); ctx.lineTo(hx+26,R0.ceilY); }
  ctx.stroke(); ctx.restore();
  ctx.strokeStyle='#8a7c66'; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(R0.cx,R0.ceilY); ctx.lineTo(R0.cx,R0.shadeTop); ctx.stroke();
  /* 吊灯（灯罩+灯泡，受力物体） */
  var lp=R0.lamp,hw=R0.lampW/2;
  ctx.save();
  var gl=ctx.createLinearGradient(0,R0.shadeTop,0,R0.shadeTop+R0.shadeH);
  gl.addColorStop(0,'#f0d9a8'); gl.addColorStop(1,'#c9a86a');
  ctx.fillStyle=gl; ctx.strokeStyle='#8a6a45'; ctx.lineWidth=1.6;
  ctx.beginPath();
  ctx.moveTo(R0.cx-hw*0.56,R0.shadeTop);
  ctx.lineTo(R0.cx+hw*0.56,R0.shadeTop);
  ctx.lineTo(R0.cx+hw,R0.shadeTop+R0.shadeH);
  ctx.lineTo(R0.cx-hw,R0.shadeTop+R0.shadeH);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  var by=R0.shadeTop+R0.shadeH;
  var bg2=ctx.createRadialGradient(R0.cx,by+R0.bulbR*0.7,1,R0.cx,by+R0.bulbR,R0.bulbR*1.3);
  bg2.addColorStop(0,'#fffbe8'); bg2.addColorStop(1,'#f5d97a');
  ctx.fillStyle=bg2;
  ctx.beginPath(); ctx.arc(R0.cx,by+R0.bulbR,R0.bulbR,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#b08a3e'; ctx.lineWidth=1.2; ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#8a7c66'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('吊灯',R0.cx,lp.y+lp.h+18);
  /* 格尺（每格1N，实时升显：已画段蓝粗线，达到格数刻度绿） */
  var u=R0.unit,liveN=D.dragging&&D.liveLen?clamp(Math.round(D.liveLen/u),0,4):(D.lenN||0);
  ctx.save();
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(R0.rulerX,R0.rulerB); ctx.lineTo(R0.rulerX,R0.rulerT-10); ctx.stroke();
  for(var g2=1;g2<=4;g2++){
    var gy=R0.rulerB-u*g2;
    ctx.strokeStyle=g2<=liveN?'#16a34a':'#cbd5e1'; ctx.lineWidth=g2<=liveN?2.4:1.4;
    ctx.beginPath(); ctx.moveTo(R0.rulerX-8,gy); ctx.lineTo(R0.rulerX+8,gy); ctx.stroke();
    ctx.fillStyle=g2<=liveN?'#16a34a':'#94a3b8'; ctx.font='11px sans-serif'; ctx.textAlign='left';
    ctx.fillText(g2+'N',R0.rulerX+12,gy+4);
  }
  ctx.restore();
  if(D.dragging&&D.liveLen&&D.liveLen>4){
    ctx.strokeStyle='#2563eb'; ctx.lineWidth=4; ctx.lineCap='round';
    var lx=R0.rulerX+30;
    ctx.beginPath(); ctx.moveTo(lx,R0.rulerB); ctx.lineTo(lx,R0.rulerB-D.liveLen); ctx.stroke();
  }
  /* 已落定的箭头（起点→竖直向上，长=lenN格） */
  if(D.start&&(D.lenN>0||D.dragging)){
    var len=D.dragging&&D.liveLen?D.liveLen:(D.lenN||2)*u;
    var ex=D.start.x,ey=D.start.y-len;
    drawArrow(D.start.x,D.start.y,ex,ey,'#e03131',4.5);
    ctx.fillStyle='#e03131'; ctx.font='bold 14px sans-serif'; ctx.textAlign='left';
    ctx.fillText(D.label||('F='+Math.round(len/u)+'N'),ex+10,ey+4);
    ctx.fillStyle='#334155'; ctx.font='11px sans-serif';
    ctx.fillText('起点',D.start.x+8,D.start.y+14);
  }else if(D.dragging&&D.liveLen!=null){
    ctx.fillStyle='#64748b'; ctx.font='12px sans-serif'; ctx.textAlign='left';
    ctx.fillText('拖动中：长度 '+fmt(D.liveLen/u,1)+' 格',D.start?D.start.x+12:D.drag0x+12,(D.start?D.start.y:D.drag0y)-8);
  }
  /* 判分就地标记 */
  if(D.judged&&D.items){
    var it=D.items;
    mark(it.start,D.start?D.start.x+34:D.cx,D.start?D.start.y:D.lp_y,8);
    mark(it.dir,D.start?D.start.x+8:D.cx,D.start?D.start.y-(D.lenN||2)*u/2:R0.shadeTop,8);
    mark(it.len,R0.rulerX+30,R0.rulerB-u*(D.lenN||2)/2,8);
    mark(it.label,D.start?D.start.x+70:D.cx,D.start?D.start.y-(D.lenN||2)*u-14:R0.shadeTop-14,8);
  }
  /* 一行轻量自动反馈（底部居中） */
  if(D.judged){
    var txt;
    if(D.wrongCount===0) txt='判分：四项全对 ✓';
    else{
      var it2=D.items,first=!it2.start?['起点','起点没落在吊灯上']:!it2.dir?['方向','方向不是竖直向上']:!it2.len?['线段长度','长度不是 4 格（F=4N）']:['标注','标注要写 F=4N'];
      txt='✗ '+first[0]+'：'+first[1];
    }
    ctx.font='600 14px sans-serif'; ctx.textAlign='center';
    var tw2=ctx.measureText(txt).width+40;
    ghostCard(W/2-tw2/2,L.fy-38,tw2,30);
    ctx.fillStyle=D.wrongCount===0?'#15803d':'#b91c1c';
    ctx.fillText(txt,W/2,L.fy-18);
  }
}
function drawDown(p){
  var D=state.d,R0=L.dr;
  if(D.judged) return false;
  D.start={x:p.x,y:p.y}; D.dragging=true; D.liveLen=null; D.lastDist=0;
  D.dirAngle=null; D.dirLocked=false;
  dirty=true;
  return true;
}
function drawMove(p){
  var D=state.d;
  if(!D.dragging) return false;
  var dx=p.x-D.start.x,dy=p.y-D.start.y,dist=Math.hypot(dx,dy);
  D.liveLen=dist;
  D.lastDist=dist;
  if(dist>DRAW_DRAG_MIN){
    /* 方向角：以竖直向上为 90°（同旧约定 dirAngle=atan2 换算） */
    var ang=Math.atan2(-dy,dx)*180/Math.PI;
    D.dirAngle=ang;
  }
  dirty=true;
  return true;
}
function drawUp(){
  var D=state.d;
  if(!D.dragging) return false;
  D.dragging=false;
  var u=L.dr.unit;
  if(D.lastDist<DRAW_DRAG_MIN){   // 只点没拖=只落起点
    D.liveLen=null; dirty=true; return true;
  }
  D.lenN=clamp(Math.round(D.lastDist/u),1,4);
  D.dirLocked=true;
  D.label='F='+D.lenN+'N';
  D.liveLen=null;
  drawJudge();
  return true;
}
function drawJudge(){
  var D=state.d,lm=L.dr.lamp;
  var it={};
  it.start=!!(D.start&&D.start.x>=lm.x-6&&D.start.x<=lm.x+lm.w+6&&
              D.start.y>=lm.y-6&&D.start.y<=lm.y+lm.h+6);
  it.dir=(D.dirLocked&&D.dirAngle!=null&&Math.abs(D.dirAngle-90)<=DRAW_TOL_DEG);
  it.len=(D.lenN===4);
  it.label=(D.label==='F=4N');
  D.items=it;
  D.wrongCount=(it.start?0:1)+(it.dir?0:1)+(it.len?0:1)+(it.label?0:1);
  D.judged=true; D.tries++;
  if(D.wrongCount===0&&window.playMatch) playMatch();
  else if(window.playDrop) playDrop();
  updatePanel(); dirty=true;
}

/* ============================================================ 站点④ 相互舞台 · 子步1 磁车（拖挤+翻极） */
function cartGeom(){
  var M=state.m,cw=L.cartW;
  return {cw:cw,gap:M.rx-M.lx-cw*1.1,contact:cw*1.06};
}
function renderCart(){
  var M=state.m,cw=L.cartW;
  ctx.fillStyle='#faf6ee'; ctx.fillRect(0,-H*2,W,H*5);
  ctx.fillStyle='#eee5d3'; ctx.fillRect(0,L.floorY-4,W,H*3);
  ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,L.floorY-4); ctx.lineTo(W,L.floorY-4); ctx.stroke();
  var lg=PROPS.magnet_cart(ctx,M.lx,L.floorY,{w:cw});
  /* 左车磁体：N 朝右（固定） */
  PROPS.bar_magnet(ctx,lg.mounts.magnet.x,lg.mounts.magnet.y,{label:true,w:cw*0.52,angle:0});
  var rg=PROPS.magnet_cart(ctx,M.rx,L.floorY,{w:cw});
  /* 右车磁体：flip=false 同名相对（N朝左=angle180 使 N 朝左）；flip=true 异名（S朝左） */
  PROPS.bar_magnet(ctx,rg.mounts.magnet.x,rg.mounts.magnet.y,{label:true,w:cw*0.52,angle:M.flip?0:180});
  ctx.fillStyle='#8a7c66'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText(M.flip?'异名磁极相对（N ↔ S）':'同名磁极相对（N ↔ N）',W/2,L.zoneB+20);
  /* 拖拽提示/状态 */
  if(!M.settled&&!M.running){
    ctx.fillStyle='#64748b'; ctx.font='12px sans-serif';
    ctx.fillText('拖右车挤近后松手 · 轻点右车磁体可翻极',W/2,L.zoneB+40);
  }
  if(M.settled&&M.attracted){
    ctx.fillStyle='#15803d'; ctx.font='600 13px sans-serif';
    ctx.fillText('两车吸在一起：异名磁极相互吸引',W/2,L.zoneB+40);
  }
  if(M.needReset&&!M.running){
    ctx.fillStyle='#64748b'; ctx.font='12px sans-serif';
    ctx.fillText('小车已停住，点「复位小车」再来一次',W/2,L.zoneB+40);
  }
  /* 速度数字卡 */
  var sp=Math.abs(M.lv),sp2=Math.abs(M.rv);
  if(sp>4||sp2>4){
    ghostCard(W/2-118,L.floorY-cw*0.9,236,30);
    ctx.fillStyle='#334155'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('左车 v='+fmt(sp/40,1)+' · 右车 v='+fmt(sp2/40,1),W/2,L.floorY-cw*0.9+20);
  }
}
function cartDown(p){
  var M=state.m,rgx=M.rx,rw=L.cartW;
  if(M.running) return false;
  if(p.x>=rgx-rw*0.3&&p.x<=rgx+rw*1.3&&p.y>=L.floorY-rw*1.1&&p.y<=L.floorY+8){
    M.dragging=true; M.dragX0=p.x; M.dragRx0=M.rx; M.downPt={x:p.x,y:p.y}; M.moved=false;
    /* 磁体区判定：翻极热区=右车磁体附近 */
    M.onMagnet=(p.x>=rgx+rw*0.2&&p.x<=rgx+rw*1.0&&p.y<=L.floorY-rw*0.35);
    return true;
  }
  return false;
}
function cartMove(p){
  var M=state.m;
  if(!M.dragging) return false;
  if(Math.abs(p.x-M.dragX0)>6||Math.abs(p.y-M.downPt.y)>6) M.moved=true;
  if(M.moved){
    var minRx=M.lx+L.cartW*1.1+L.cartW*0.28;   // 最多挤到磁体几乎相触
    M.rx=clamp(M.dragRx0+(p.x-M.dragX0),minRx,W-L.cartW*0.2);
    var g=cartGeom();
    M.compressed=g.gap<g.contact*0.72;
    dirty=true;
  }
  return true;
}
function cartUp(){
  var M=state.m;
  if(!M.dragging) return false;
  M.dragging=false;
  if(!M.moved&&M.onMagnet){   // 轻点磁体=翻极
    M.flip=!M.flip; M.settled=false; M.attracted=false; M.needReset=false;
    M.released=false; M.running=false;
    homeCarts();
    if(window.playClick) playClick();
    updatePanel(); dirty=true;
    return true;
  }
  if(M.moved){
    if(M.compressed){
      M.released=true; M.running=true; M.relT=performance.now();
      M.settled=false; M.attracted=false; M.needReset=false;
      M.lv=0; M.rv=0;
      if(window.playClick) playClick();
    }else{
      M.rx=M.dragRx0;   // 没挤够：弹回原位
      M.compressed=false;
    }
    updatePanel(); dirty=true;
  }
  return true;
}
function cartTick(now,dtMs){
  var M=state.m;
  if(!M.running) return false;
  var cw=L.cartW,g=cartGeom();
  var dt=Math.min(32,dtMs)/1000;
  var gap=Math.max(8,M.rx-M.lx-cw*1.1);
  if(M.flip){   // 异名相吸
    var a=Math.min(1600,ATT_K/(gap*gap));
    M.lv+=a*dt; M.rv-=a*dt;
  }else{         // 同名相斥：弹开
    var a2=Math.min(1600,REP_K/(gap*gap));
    M.lv-=a2*dt; M.rv+=a2*dt;
  }
  M.lv=clamp(M.lv,-CART_VMAX,CART_VMAX); M.rv=clamp(M.rv,-CART_VMAX,CART_VMAX);
  M.lx+=M.lv*dt; M.rx+=M.rv*dt;
  /* 摩擦衰减 */
  M.lv*=Math.pow(1-FRICTION,dt*4); M.rv*=Math.pow(1-FRICTION,dt*4);
  /* 墙边界 */
  if(M.lx<cw*0.2){ M.lx=cw*0.2; M.lv=0; }
  if(M.rx>W-cw*1.2){ M.rx=W-cw*1.2; M.rv=0; }
  /* 吸到一起 */
  if(M.flip&&gap<=g.contact){
    M.rx=M.lx+cw*1.1+g.contact; M.lv=0; M.rv=0;
    M.running=false; M.settled=true; M.attracted=true;
    if(window.playMatch) playMatch();
    updatePanel(); dirty=true; return false;
  }
  if(Math.abs(M.lv)<STOP_V&&Math.abs(M.rv)<STOP_V&&now-M.relT>500){
    M.lv=0; M.rv=0; M.running=false; M.settled=true; M.needReset=!M.flip;
    if(!M.flip&&window.playMatch) playMatch();
    updatePanel();
  }
  dirty=true;
  return true;
}
function cartReset(){
  var M=state.m;
  M.released=false; M.running=false; M.settled=false; M.attracted=false;
  M.needReset=false; M.compressed=false; M.dragging=false;
  homeCarts();
  if(window.playClick) playClick();
  updatePanel(); dirty=true;
}

/* ============================================================ 站点④ 子步2 测力计对拉 */
function pullGeom2(){
  var P=state.p,pu=L.pu,Hm=pu.h;
  var stemY0=0.872*Hm;
  var d=P.T/5*0.594*Hm;
  var gap0=Math.max(40,Hm*0.42);
  var RX0=pu.LX+2*stemY0+gap0;
  var g=clamp(P.g,0,pu.gMax);
  var RX=RX0+g+d;
  var cy=pu.cy;
  var leftTip={x:pu.LX+stemY0+d,y:cy-0.0463*Hm};
  var rightTip={x:RX-stemY0-d,y:cy+0.0463*Hm};
  return {Hm:Hm,stemY0:stemY0,d:d,gap0:gap0,RX0:RX0,RX:RX,cy:cy,g:g,
          leftTip:leftTip,rightTip:rightTip,
          midX:(leftTip.x+rightTip.x)/2,midY:(leftTip.y+rightTip.y)/2};
}
function renderPull(){
  var P=state.p,G=pullGeom2(),pu=L.pu;
  ctx.fillStyle='#faf6ee'; ctx.fillRect(0,-H*2,W,H*5);
  ctx.fillStyle='#eee5d3'; ctx.fillRect(0,L.fy-14,W,H*3);
  /* 左立柱（吊环固定在立柱横梁上）+底座 */
  ctx.save();
  ctx.fillStyle='#9aa1ab'; ctx.strokeStyle='#7d838c'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(pu.LX-6,G.cy,12,L.fy-16-G.cy,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(pu.LX-46,L.fy-20,92,10,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(pu.LX-34,G.cy-10,68,10,3); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#8a7c66'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('立柱固定',pu.LX,L.fy-26);
  /* 左表：水平位型（吊环顶=锚点 (LX, cy)），挂钩朝右 */
  PROPS.spring_meter(ctx,pu.LX,G.cy,{F:P.T,orientation:'h',h:G.Hm});
  /* 右表：竖直件旋转 π/2 → 吊环顶在 (RX, cy)、挂钩朝左 */
  ctx.save();
  ctx.translate(G.RX,G.cy); ctx.rotate(Math.PI/2);
  PROPS.spring_meter(ctx,0,0,{F:P.T,orientation:'v',h:G.Hm});
  ctx.restore();
  /* 双钩互挂件 */
  var span=Math.hypot(G.rightTip.x-G.leftTip.x,G.rightTip.y-G.leftTip.y);
  var t01=clamp(P.T/5,0,1);
  var sLink=clamp(span/(1.132-0.1288*t01),24,150);
  PROPS.hook_link(ctx,G.midX,G.midY,{tension:t01,s:sLink});
  /* 拖拽提示：右环虚线圆 */
  if(!P.pulled&&P.g<1){
    ctx.save(); ctx.strokeStyle='rgba(37,99,235,.7)'; ctx.lineWidth=1.6; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.arc(G.RX+G.Hm*0.1,G.cy,20,0,Math.PI*2); ctx.stroke(); ctx.restore();
    ctx.fillStyle='#2563eb'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
    ctx.fillText('向右拖',G.RX+G.Hm*0.1,G.cy-26);
  }
  /* 相互作用箭头对（F₁ 向左、F₂ 向右） */
  if(P.T>0.05){
    var al=20+P.T*12;
    drawArrow(G.leftTip.x-14,G.leftTip.y-26,G.leftTip.x-14-al,G.leftTip.y-26,'#7c3aed',3.4);
    drawArrow(G.rightTip.x+14,G.rightTip.y+26,G.rightTip.x+14+al,G.rightTip.y+26,'#7c3aed',3.4);
    ctx.fillStyle='#7c3aed'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('F₁',G.leftTip.x-14-al/2,G.leftTip.y-34);
    ctx.fillText('F₂',G.rightTip.x+14+al/2,G.rightTip.y+44);
  }
  /* 读数牌：F₁=F₂ */
  var cxm=(pu.LX+G.RX)/2;
  ghostCard(cxm-110,pu.cardY,220,32);
  ctx.fillStyle='#334155'; ctx.font='600 14px sans-serif'; ctx.textAlign='center';
  ctx.fillText('F₁ = F₂ = '+fmt(P.T,1)+' N',cxm,pu.cardY+21);
  if(P.pulls>0){
    ctx.fillStyle='#15803d'; ctx.font='600 12px sans-serif';
    ctx.fillText('已拉过 '+P.pulls+' 次，两表读数次次相等',cxm,pu.cardY+52);
  }
}
function pullDown(p){
  var P=state.p,G=pullGeom2();
  var nearRight=(Math.abs(p.x-G.RX)<G.Hm*0.4&&Math.abs(p.y-G.cy)<G.Hm*0.5);
  if(!nearRight) return false;
  P.drag=true; P.dragX0=p.x; P.dragG0=P.g;
  if(window.playClick) playClick();
  return true;
}
function pullMove(p){
  var P=state.p;
  if(!P.drag) return false;
  P.g=clamp(P.dragG0+(p.x-P.dragX0),0,L.pu.gMax);
  P.T=clamp(P.g/L.pu.gMax*PULL_TMAX,0,PULL_TMAX);
  if(P.T>P.peakT) P.peakT=P.T;
  if(P.T>P.maxT) P.maxT=P.T;
  updatePanel(); dirty=true;
  return true;
}
function pullUp(){
  var P=state.p;
  if(!P.drag) return false;
  P.drag=false;
  if(P.peakT>=PULL_TCOUNT){ P.pulls++; P.pulled=true; if(window.playMatch) playMatch(); }
  P.peakT=0;
  updatePanel(); dirty=true;
  return true;
}
function pullRelax(){
  var P=state.p;
  if(P.drag) return;
  P.relaxTw={t0:performance.now(),g0:P.g};
  if(window.playClick) playClick();
  dirty=true;
}
function pullTick(now){
  var P=state.p,bsy=false;
  if(P.relaxTw){
    var p=clamp((now-P.relaxTw.t0)/RELAX_MS,0,1);
    P.g=P.relaxTw.g0*(1-easeOut(p));
    P.T=clamp(P.g/L.pu.gMax*PULL_TMAX,0,PULL_TMAX);
    if(p>=1){ P.g=0; P.T=0; P.relaxTw=null; }
    bsy=true; updatePanel(); dirty=true;
  }
  return bsy;
}
function resetM2(){
  var M=state.m;
  M.released=false; M.running=false; M.settled=false; M.attracted=false; M.needReset=false;
  M.compressed=false; M.dragging=false; M.flip=false;
  homeCarts();
  var P=state.p;
  P.g=0; P.T=0; P.maxT=0; P.pulls=0; P.peakT=0; P.drag=false; P.relaxTw=null; P.pulled=false;
  updatePanel(); dirty=true;
}

/* ============================================================ 站点⑤ 测力计工作台 */
function SC(){ return state.s[state.s.orient]; }
function forceOf(sc){ return state.s.orient==='v'?sc.count*W_G/1000*G_VAL:sc.pull; }
function oscVal(sc,now){
  if(!sc.osc) return 0;
  var t=(now-sc.osc.t0)/1000;
  if(t*1000>=OSC_LIFE){ sc.osc=null; sc.settled=true; updatePanel(); return 0; }
  dirty=true;
  return sc.osc.A*Math.exp(-t/OSC_TAU)*Math.cos(2*Math.PI*OSC_HZ*t);
}
function displayNow(now){
  var sc=SC();
  return clamp(forceOf(sc)+sc.off+oscVal(sc,now),0,F_MAX);
}
/* 指针位置（沿体轴自吊环顶）：ptrOff(v)=0.211H+(v/5)*0.594H */
function ptrOff(v,Hm){ return 0.211*Hm+(clamp(v,0,F_MAX)/F_MAX)*0.594*Hm; }
function setOrient(o){
  if(state.s.orient===o) return;
  state.s.orient=o;
  state.s.overload=false;
  syncOrientBtns(); repositionPanels(); updatePanel(); dirty=true;
  if(window.GUIDE_SCENE&&window.GUIDE_SCENE.change) window.GUIDE_SCENE.change();
  if(window.playClick) playClick();
}
function syncOrientBtns(){
  var v=document.getElementById('btn-orient-v'),h=document.getElementById('btn-orient-h');
  if(v) v.classList.toggle('on',state.s.orient==='v');
  if(h) h.classList.toggle('on',state.s.orient==='h');
}
function hangWeight(){
  var S=state.s,sc=S.v,now=performance.now();
  var cap=Math.min(TRAY_N,L.mt?Math.max(0,Math.floor((L.seat-4-(L.mt.beamY+L.mt.meterH))/(16+W_G*0.16))):TRAY_N);
  if(sc.count>=cap){
    if(window.playDrop) playDrop();
    return false;
  }
  sc.count++;
  sc.settled=false;
  sc.osc={t0:now,A:Math.min(0.5,0.22+W_G/1000*G_VAL*0.10)};
  updatePanel(); dirty=true;
  if(window.playClick) playClick();
  return true;
}
function unhangWeight(){
  var S=state.s,sc=S.v,now=performance.now();
  if(!sc.count) return false;
  sc.count--;
  sc.settled=false;
  sc.osc={t0:now,A:0.25};
  updatePanel(); dirty=true;
  if(window.playDrop) playDrop();
  return true;
}
function meterPullTo(val,fromUser){
  var S=state.s,sc=S.h,now=performance.now();
  if(val+sc.off>F_MAX){   // 超量程拦截
    S.overload=true; S.overloadT=now;
    val=Math.max(0,F_MAX-sc.off);
    if(window.playDrop) playDrop();
  }
  sc.pull=val;
  var rng=document.getElementById('rng-mpull');
  if(rng) rng.value=String(Math.round(val*10));
  syncMPullLabel(); updatePanel(); dirty=true;
}
function syncMPullLabel(){
  var el=document.getElementById('lbl-mpull');
  if(el) el.textContent=fmt((+document.getElementById('rng-mpull').value)/10,1)+' N';
}
function zeroAdjust(){
  var sc=SC(),now=performance.now();
  if(sc.zeroed){ return; }
  sc.zeroTw={t0:now,from:sc.off,to:0};
  dirty=true;
  if(window.playClick) playClick();
}
function zeroTick(now){
  var S=state.s,bsy=false;
  ['v','h'].forEach(function(k){
    var sc=S[k];
    if(!sc.zeroTw) return;
    var p=clamp((now-sc.zeroTw.t0)/300,0,1);
    sc.off=sc.zeroTw.from+(sc.zeroTw.to-sc.zeroTw.from)*easeOut(p);
    if(p>=1){ sc.off=0; sc.zeroed=true; sc.zeroTw=null; }
    bsy=true; dirty=true;
  });
  if(S.overload&&now-S.overloadT>OVERLOAD_MS){ S.overload=false; dirty=true; }
  return bsy;
}
function drawStandV(){
  var mt=L.mt;
  ctx.save();
  ctx.fillStyle='#9aa1ab'; ctx.strokeStyle='#7d838c'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(mt.cx-70,L.seat-10,140,10,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(mt.cx-mt.meterH*0.105-24,mt.beamY-6,12,L.seat-mt.beamY-4,3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(mt.cx-mt.meterH*0.105-60,mt.beamY-14,mt.meterH*0.105+76,10,3); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function drawWeights(hookX,hookY,count){
  var y=hookY,wgh=16+W_G*0.16;
  for(var i=0;i<count;i++){
    PROPS.hook_weight(ctx,hookX,y+wgh,{g:W_G});
    y+=wgh;
  }
  return y;
}
function renderMeterV(now){
  var mt=L.mt,S=state.s,sc=S.v;
  ctx.fillStyle='#fbf9f4'; ctx.fillRect(0,-H*2,W,H*5);
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  drawStandV();
  var disp=displayNow(now);
  var g=PROPS.spring_meter(ctx,mt.cx,mt.beamY,{F:disp,orientation:'v',h:mt.meterH});
  drawWeights(g.hookX,g.hookY,sc.count);
  /* 砝码托盘 */
  var trayN=TRAY_N-sc.count;
  ctx.save();
  ctx.fillStyle='#b08a5a'; ctx.strokeStyle='#8a6a42'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(mt.trayX-70,L.seat-8,140,8,2); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#8a7c66'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('砝码托盘（100g/个 · 拖到挂钩上）',mt.trayX,L.seat+16);
  for(var i=0;i<trayN;i++){
    var xi=mt.trayX+(i-(trayN-1)/2)*30;
    PROPS.hook_weight(ctx,xi,L.seat-10,{g:W_G});
  }
  /* 拖拽中的砝码 */
  if(sc.drag){
    PROPS.hook_weight(ctx,sc.drag.x,sc.drag.y,{g:W_G});
    var snapY=g.hookY+sc.count*32+16;
    var near=Math.hypot(sc.drag.x-g.hookX,sc.drag.y-snapY)<40;
    ctx.save(); ctx.strokeStyle=near?'rgba(22,163,74,.8)':'rgba(100,116,139,.5)';
    ctx.lineWidth=1.6; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.arc(g.hookX,snapY,18,0,Math.PI*2); ctx.stroke(); ctx.restore();
  }
  drawRefLinesV(g,disp,now);
  drawReadCard(disp,now);
  if(S.overload){
    var pulse=0.5+0.5*Math.sin(now/90);
    ctx.save(); ctx.strokeStyle='rgba(220,38,38,'+(0.4+0.5*pulse).toFixed(2)+')'; ctx.lineWidth=3.5;
    ctx.strokeRect(6,L.zoneB-4,W-12,L.fy-L.zoneB-2); ctx.restore();
    ctx.fillStyle='#b91c1c'; ctx.font='700 14px sans-serif'; ctx.textAlign='center';
    ctx.fillText('⚠ 超过量程 5N！先减小拉力',W/2,L.zoneB+22);
  }
}
function drawRefLinesV(g,disp,now){
  var mt=L.mt,sc=state.s.v;
  /* 0 刻度线（未调零时指针偏离处红线提示） */
  var x=g.bodyTop?g.bodyTop.x:mt.cx;
  var zeroY=mt.beamY+ptrOff(0,mt.meterH);
  ctx.save(); ctx.strokeStyle='rgba(37,99,235,.55)'; ctx.lineWidth=1.4; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(mt.cx-mt.meterH*0.16,zeroY); ctx.lineTo(mt.cx+mt.meterH*0.16,zeroY); ctx.stroke(); ctx.restore();
  ctx.fillStyle='#2563eb'; ctx.font='11px sans-serif'; ctx.textAlign='left';
  ctx.fillText('0 刻度',mt.cx+mt.meterH*0.17,zeroY+4);
  if(!sc.zeroed&&!sc.zeroTw){
    var offY=mt.beamY+ptrOff(sc.off+forceOf(sc),mt.meterH);
    ctx.fillStyle='#b91c1c'; ctx.font='600 12px sans-serif'; ctx.textAlign='right';
    ctx.fillText('指针没指 0：先调零',mt.cx-mt.meterH*0.17,offY+4);
  }
}
function drawReadCard(disp,now){
  var mt=L.mt,sc=SC();
  /* R5：读数浮卡可拖动+位置记忆；默认停左下桌面空区（右下被砝码托盘占用，见 cardDefaultPos） */
  var cr=cardRect('meter',208,74),x=cr.x,y=cr.y;
  ghostCard(x,y,208,74);
  ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  ctx.fillStyle='#334155';
  var load=state.s.orient==='v'?sc.count+' 个钩码（'+(sc.count*W_G)+'g）':fmt(sc.pull,1)+' N 拖力';
  ctx.fillText('载荷：'+load,x+12,y+20);
  var F=state.s.orient==='v'?sc.count*W_G/1000*G_VAL:sc.pull;
  ctx.fillText('F=G=mg='+fmt(F,2)+' N',x+12,y+40);
  ctx.fillStyle='#2563eb'; ctx.font='bold 15px sans-serif';
  ctx.fillText('指针读数 '+fmt(disp,2)+' N',x+12,y+62);
  if(!sc.zeroed){
    ctx.fillStyle='#b91c1c'; ctx.font='600 11px sans-serif'; ctx.textAlign='left';
    ctx.fillText('⚠ 指针未调零',x+150,y+20);
  }
  cardGrip(x+200,y+70);
}
function renderMeterH(now){
  var mt=L.mt,S=state.s,sc=S.h;
  ctx.fillStyle='#fbf9f4'; ctx.fillRect(0,-H*2,W,H*5);
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
  var disp=displayNow(now);
  var g=PROPS.spring_meter(ctx,mt.hx,mt.hy,{F:disp,orientation:'h',h:mt.meterH});
  /* 木块（挂钩连着绳，绳连木块） */
  var blkW=70,blkH=44,blkX=g.hookX+26,blkY=L.seat-blkH;
  ctx.save();
  ctx.strokeStyle='#8a7c66'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(g.hookX,g.hookY); ctx.lineTo(blkX,blkY+blkH/2); ctx.stroke();
  var gw=ctx.createLinearGradient(0,blkY,0,blkY+blkH);
  gw.addColorStop(0,'#d9b98c'); gw.addColorStop(1,'#b08a5a');
  ctx.fillStyle=gw; ctx.strokeStyle='#8a6a45'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.roundRect(blkX,blkY,blkW,blkH,4); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='rgba(138,106,69,.5)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(blkX+8,blkY+12); ctx.lineTo(blkX+blkW-8,blkY+12);
  ctx.moveTo(blkX+8,blkY+26); ctx.lineTo(blkX+blkW-8,blkY+26); ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#8a7c66'; ctx.font='600 12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('木块（向右拖）',blkX+blkW/2,blkY-8);
  /* 吊环固定端注记 */
  ctx.fillStyle='#64748b'; ctx.font='11px sans-serif'; ctx.textAlign='left';
  ctx.fillText('吊环端手持固定',mt.hx-10,mt.hy-24);
  if(sc.pull>0.05){
    drawArrow(blkX+blkW+8,blkY+blkH/2,blkX+blkW+8+18+sc.pull*10,blkY+blkH/2,'#dc2626',4);
    ctx.fillStyle='#dc2626'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F 拖='+fmt(sc.pull,1)+'N',blkX+blkW+14,blkY+blkH/2-12);
  }
  /* 水平位型 0 刻度参考线：'h' 旋转−90°后体轴沿世界 +x，指针 x=锚x+ptrOff */
  var zxx=mt.hx+ptrOff(0,mt.meterH);
  ctx.save(); ctx.strokeStyle='rgba(37,99,235,.55)'; ctx.lineWidth=1.4; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(zxx,mt.hy-mt.meterH*0.16); ctx.lineTo(zxx,mt.hy+mt.meterH*0.16); ctx.stroke(); ctx.restore();
  ctx.fillStyle='#2563eb'; ctx.font='11px sans-serif'; ctx.textAlign='center';
  ctx.fillText('0 刻度',zxx,mt.hy+mt.meterH*0.16+14);
  if(!sc.zeroed&&!sc.zeroTw){
    ctx.fillStyle='#b91c1c'; ctx.font='600 12px sans-serif'; ctx.textAlign='left';
    ctx.fillText('指针没指 0：先调零',zxx+12,mt.hy-mt.meterH*0.16-6);
  }
  drawReadCard(disp,now);
  if(S.overload){
    var pulse=0.5+0.5*Math.sin(now/90);
    ctx.save(); ctx.strokeStyle='rgba(220,38,38,'+(0.4+0.5*pulse).toFixed(2)+')'; ctx.lineWidth=3.5;
    ctx.strokeRect(6,L.zoneB-4,W-12,L.fy-L.zoneB-2); ctx.restore();
    ctx.fillStyle='#b91c1c'; ctx.font='700 14px sans-serif'; ctx.textAlign='center';
    ctx.fillText('⚠ 超过量程 5N！先减小拉力',W/2,L.zoneB+22);
  }
}
function meterDown(p){
  var S=state.s,mt=L.mt;
  if(S.orient==='v'){
    var sc=S.v;
    /* 命中托盘砝码 */
    var trayN=TRAY_N-sc.count;
    for(var i=0;i<trayN;i++){
      var xi=mt.trayX+(i-(trayN-1)/2)*30;
      if(Math.abs(p.x-xi)<18&&Math.abs(p.y-(L.seat-26))<26){
        sc.drag={src:'tray',x:p.x,y:p.y};
        if(window.playClick) playClick();
        return true;
      }
    }
    /* 命中已挂砝码（取下） */
    var disp=displayNow(performance.now());
    var g=PROPS.spring_meter(offCtx,mt.cx,mt.beamY,{F:disp,orientation:'v',h:mt.meterH});
    for(var j=0;j<sc.count;j++){
      var wy=g.hookY+j*32+16;
      if(Math.abs(p.x-g.hookX)<20&&Math.abs(p.y-wy)<20){
        sc.drag={src:'hang',x:p.x,y:p.y,hx0:g.hookX,hy0:wy};
        if(window.playClick) playClick();
        return true;
      }
    }
    return false;
  }
  /* 水平：直拖木块 */
  var sc2=S.h;
  var g2=PROPS.spring_meter(offCtx,mt.hx,mt.hy,{F:displayNow(performance.now()),orientation:'h',h:mt.meterH});
  var blkX=g2.hookX+26,blkY=L.seat-44;
  if(p.x>=blkX-10&&p.x<=blkX+80&&p.y>=blkY-10&&p.y<=blkY+54){
    sc2.drag=true; sc2.dragX0=p.x; sc2.dragPull0=sc2.pull;
    if(window.playClick) playClick();
    return true;
  }
  return false;
}
function meterMove(p){
  var S=state.s,mt=L.mt;
  if(S.orient==='v'){
    var sc=S.v;
    if(!sc.drag) return false;
    sc.drag.x=p.x; sc.drag.y=p.y;
    if(sc.drag.src==='hang'&&Math.hypot(p.x-sc.drag.hx0,p.y-sc.drag.hy0)>60){
      unhangWeight();
      var trayN=TRAY_N-sc.count;
      sc.drag={src:'tray',x:p.x,y:p.y};
    }
    dirty=true;
    return true;
  }
  var sc2=S.h;
  if(!sc2.drag) return false;
  meterPullTo(clamp(sc2.dragPull0+(p.x-sc2.dragX0)/12,0,6.5),true);
  return true;
}
function meterUp(){
  var S=state.s,mt=L.mt;
  if(S.orient==='v'){
    var sc=S.v;
    if(!sc.drag) return false;
    var disp=displayNow(performance.now());
    var g=PROPS.spring_meter(offCtx,mt.cx,mt.beamY,{F:disp,orientation:'v',h:mt.meterH});
    var snapY=g.hookY+sc.count*32+16;
    if(sc.drag.src==='tray'&&Math.hypot(sc.drag.x-g.hookX,sc.drag.y-snapY)<40){
      hangWeight();
    }else if(sc.drag.src==='tray'){
      if(window.playDrop) playDrop();
    }
    sc.drag=null;
    dirty=true;
    return true;
  }
  var sc2=S.h;
  if(!sc2.drag) return false;
  sc2.drag=false;
  return true;
}
function resetS(){
  var S=state.s;
  S.overload=false; S.extTouched=false;
  S.v={count:0,off:ZERO_OFF.v,zeroed:false,settled:true,osc:null,zeroTw:null,drag:null};
  S.h={pull:0,off:ZERO_OFF.h,zeroed:false,settled:true,osc:null,zeroTw:null,drag:false,dragX0:0,dragPull0:0};
  ['c1','c2','c3','c4'].forEach(function(k){ S.exam[k]={judged:false,wrong:0}; });
  S.examDone=0; S.examOpen=false;
  var rng=document.getElementById('rng-mpull'); if(rng) rng.value='0';
  syncMPullLabel(); syncExamDom(); closeExam(false);
  updatePanel(); dirty=true;
}
function updateExt(){
  var S=state.s,sc=S.v;
  var F=sc.count*W_G/1000*G_VAL;
  var dl=EXT_K*F,l=EXT_L0+dl;
  setText('ext-l0',fmt(EXT_L0,1)+' cm');
  setText('ext-l',fmt(l,1)+' cm');
  setText('ext-dl','ΔL='+fmt(dl,1)+' cm');
}

/* ===== 考官角落（4 张错误操作图示卡） ===== */
var EXAM_REASON={
  c1:{ok:'这张图操作正确',bad:'对啦：没调零就测，读数会整体偏大或偏小。用前先看指针是否指 0，不指 0 要调零。'},
  c2:{ok:'这张图操作正确',bad:'对啦：拉力超过量程 5N，弹簧会被拉坏、刻度不再准确。测前先估力，超量程换更大量程的测力计。'},
  c3:{ok:'这张图操作正确',bad:'对啦：斜着拉挂钩，弹簧会蹭外壳、读数偏小。要让拉力方向沿弹簧轴线。'},
  c4:{ok:'这张图操作正确',bad:'对啦：倒挂拉外壳，外壳本身有重量，读数不等于拉力。要挂环固定、拉挂钩。'}
};
function judgeExam(k,ok){
  var S=state.s,c=S.exam[k];
  if(c.judged) return;
  c.judged=true;
  if(ok){ c.wrong=1; if(window.playDrop) playDrop(); }
  else{ S.examDone++; if(window.playMatch) playMatch(); }
  syncExamDom();
  if(S.examDone>=4){
    var d=document.getElementById('exam-done'); if(d) d.style.display='block';
  }
  updatePanel(); dirty=true;
}
function syncExamDom(){
  var S=state.s;
  ['c1','c2','c3','c4'].forEach(function(k){
    var c=S.exam[k],card=document.getElementById('xc-'+k);
    if(!card) return;
    card.classList.toggle('done',c.judged&&c.wrong===0);
    var fb=card.querySelector('.xc-fb');
    var btns=card.querySelectorAll('.xc-btns button');
    for(var i=0;i<btns.length;i++) btns[i].disabled=c.judged;
    if(fb){
      if(!c.judged) fb.textContent='';
      else if(c.wrong===0) fb.textContent='✓ 抓到虫子！'+EXAM_REASON[k].bad;
      else{ fb.textContent='✗ 这只不是虫子（其实操作是对的或你判反了）。'+EXAM_REASON[k].bad; card.classList.add('shake');
            setTimeout(function(){ card.classList.remove('shake'); },500); }
    }
  });
  setText('exam-score','已抓到 '+S.examDone+' / 4 只虫子');
}
function openExam(){
  state.s.examOpen=true;
  var o=document.getElementById('exam-overlay'); if(o) o.classList.add('show');
  drawExamCanvases(); syncExamDom();
  if(window.playClick) playClick();
}
function closeExam(){
  state.s.examOpen=false;
  var o=document.getElementById('exam-overlay'); if(o) o.classList.remove('show');
}
function drawExamCanvases(){
  drawExamC('xc-c1-cv',function(c2){
    var g=PROPS.spring_meter(c2,58,14,{F:0.45,orientation:'v',h:100});
    c2.save(); c2.strokeStyle='#dc2626'; c2.lineWidth=1.6;
    c2.beginPath(); c2.arc(58,14+21.1+5.3,9,0,Math.PI*2); c2.stroke(); c2.restore();
    c2.fillStyle='#b91c1c'; c2.font='600 10px sans-serif'; c2.textAlign='left';
    c2.fillText('指针没指0',74,44);
  });
  drawExamC('xc-c2-cv',function(c2){
    PROPS.spring_meter(c2,52,12,{F:5,orientation:'v',h:92});
    drawArrowOn(c2,52,110,52,126,'#dc2626',3);
    c2.fillStyle='#b91c1c'; c2.font='600 10px sans-serif'; c2.textAlign='left';
    c2.fillText('使劲拉过 5N',76,70);
  });
  drawExamC('xc-c3-cv',function(c2){
    PROPS.spring_meter(c2,52,12,{F:2,orientation:'v',h:88});
    var hy=12+0.872*88+2/5*0.594*88;
    drawArrowOn(c2,56,hy,98,hy+16,'#dc2626',3);
    c2.fillStyle='#b91c1c'; c2.font='600 10px sans-serif'; c2.textAlign='left';
    c2.fillText('斜着拉',100,hy-4);
  });
  drawExamC('xc-c4-cv',function(c2){
    c2.save(); c2.translate(46,14); c2.rotate(Math.PI);
    PROPS.spring_meter(c2,0,0,{F:2,orientation:'v',h:88});
    c2.restore();
    drawArrowOn(c2,46,106,46,124,'#dc2626',3);
    c2.fillStyle='#b91c1c'; c2.font='600 10px sans-serif'; c2.textAlign='left';
    c2.fillText('拉外壳',58,118);
  });
}
function drawExamC(id,fn){
  var el=document.getElementById(id);
  if(!el) return;
  var c2=el.getContext('2d');
  c2.clearRect(0,0,el.width,el.height);
  fn(c2);
}
function drawArrowOn(c2,x0,y0,x1,y1,color,lw){
  var dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy); if(d<3) return;
  var ux=dx/d,uy=dy/d,hd=Math.max(6,d*0.24);
  c2.save(); c2.strokeStyle=color; c2.fillStyle=color; c2.lineWidth=lw||3; c2.lineCap='round';
  c2.beginPath(); c2.moveTo(x0,y0); c2.lineTo(x1-ux*hd*0.8,y1-uy*hd*0.8); c2.stroke();
  c2.beginPath(); c2.moveTo(x1,y1);
  c2.lineTo(x1-ux*hd-uy*hd*0.5,y1-uy*hd+ux*hd*0.5);
  c2.lineTo(x1-ux*hd+uy*hd*0.5,y1-uy*hd-ux*hd*0.5);
  c2.closePath(); c2.fill(); c2.restore();
}

/* ============================================================ 视图调度（飞入飞出） */
function effText(t){
  if(t<TAU_MIN) return '推不动';
  if(t<1.6) return '慢';
  if(t<4) return '中等';
  return '快';
}
function renderView(v){
  ctx.save();
  if(v==='deform') renderDeform();
  else if(v==='motion') renderMotion();
  else if(v==='door') renderDoor();
  else if(v==='draw') renderDraw();
  else if(v==='cart') renderCart();
  else if(v==='pull') renderPull();
  else if(v==='meterv') renderMeterV(performance.now());
  else renderMeterH(performance.now());
  ctx.restore();
}
function draw(){
  ctx.clearRect(0,0,W,H);
  var a=state.anim;
  if(!a) renderView(state.view);
  else{
    var e=easeInOut(clamp((performance.now()-a.t0)/ANIM_DUR,0,1));
    ctx.save(); ctx.translate(0,-H*e); renderView(a.from); ctx.restore();
    ctx.save(); ctx.translate(0,H*(1-e)); renderView(a.to); ctx.restore();
  }
  updatePanel();
}
function flyTo(to){
  if(state.animating||to===state.view) return;
  state.anim={from:state.view,to:to,t0:performance.now()};
  state.view=to; state.animating=true;
  window.GUIDE_SCENE&&window.GUIDE_SCENE.change();   /* 掐掉上一视图语音（引擎按新 mode 补发 intro） */
  syncUI(); repositionPanels(); dirty=true;
}
function goScene(m){
  if(state.animating||m===state.mode) return;
  state.mode=m; state.modeEnterT=performance.now();
  if(window.playClick) playClick();
  flyTo(viewOf());
}
function goBoard(b){
  if(state.animating||b===state.board) return;
  state.board=b;
  if(window.playClick) playClick();
  flyTo(viewOf());
}
function goStep(s){
  if(state.animating||s===state.cstep) return;
  state.cstep=s;
  if(window.playClick) playClick();
  flyTo(viewOf());
}

/* ===== UI 同步（body data-* 驱动浮区显隐 + 按钮态 + 面板小节） ===== */
function syncUI(){
  var bd=document.body;
  bd.dataset.scene=state.mode;
  bd.dataset.board=state.board;
  bd.dataset.cstep=String(state.cstep);
  bd.dataset.orient=state.s.orient;
  ['deform','motion','door','mutual','meter'].forEach(function(m){
    var el=document.getElementById('btn-scene-'+m);
    if(el) el.classList.toggle('on',state.mode===m);
  });
  var b1=document.getElementById('btn-board-door'),b2=document.getElementById('btn-board-draw');
  if(b1) b1.classList.toggle('on',state.board==='door');
  if(b2) b2.classList.toggle('on',state.board==='draw');
  var c1=document.getElementById('btn-c-step1'),c2=document.getElementById('btn-c-step2');
  if(c1) c1.classList.toggle('on',state.cstep===1);
  if(c2) c2.classList.toggle('on',state.cstep===2);
  var secs={deform:'sec-deform',motion:'sec-motion',door:'sec-door',draw:'sec-draw',
            cart:'sec-cart',pull:'sec-pull',meterv:'sec-meter',meterh:'sec-meter'};
  for(var k in secs){
    var se=document.getElementById(secs[k]);
    if(se) se.style.display=(k===state.view)?'block':'none';
  }
  syncToolBtns(); syncPlaceBtns(); syncOrientBtns();
}

/* ===== 读数面板（幽灵化 + pickSlot 选空位） ===== */
function rectInterArea(a,r){
  var x0=Math.max(a.x,r.x),y0=Math.max(a.y,r.y),x1=Math.min(a.x+a.w,r.x+r.w),y1=Math.min(a.y+a.h,r.y+r.h);
  return (x1>x0&&y1>y0)?(x1-x0)*(y1-y0):0;
}
function pickSlot(needW,needH,avoidRects){
  var m=12,botY=H-ctrlBandH-10;
  var slots=[
    {name:'tl',x:m,y:m},
    {name:'tr',x:Math.max(m,W-needW-m),y:m},
    {name:'bl',x:m,y:Math.max(m,botY-needH)},
    {name:'br',x:Math.max(m,W-needW-m),y:Math.max(m,botY-needH)}
  ];
  var best=slots[0],bestArea=Infinity;
  for(var i=0;i<slots.length;i++){
    var rect={x:slots[i].x,y:slots[i].y,w:needW,h:needH},area=0;
    (avoidRects||[]).forEach(function(r){ if(r) area+=rectInterArea(rect,r); });
    if(area===0) return slots[i];
    if(area<bestArea){ bestArea=area; best=slots[i]; }
  }
  return best;
}
var extRect=null;   /* 伸长量面板（DOM）当前 rect，R5：供读数面板 pickSlot 避让 */
function avoidRects(){
  var rs=[{x:0,y:H-ctrlBandH,w:W,h:ctrlBandH+40}];
  if(L.zoneR) rs.push(L.zoneR);
  var v=state.view;
  if(v==='deform'){
    var df=L.df;
    rs.push({x:df.hangX-100,y:df.beamY-40,w:200,h:L.seat-df.beamY+50});
    rs.push({x:df.bx-df.bottleW,y:df.beamY-40,w:df.bottleW*2,h:L.seat-df.beamY+50});
    rs.push({x:df.wallX-70,y:df.beamY-40,w:140,h:L.seat-df.beamY+50});
    var cd=cardRect('deform',200,54);
    rs.push({x:cd.x-4,y:cd.y-4,w:cd.w+8,h:cd.h+8});   // 长度三栏浮卡（R5：实时卡位）
  }else if(v==='motion'){
    var mo=L.mo;
    rs.push({x:mo.tx-mo.tw/2-10,y:mo.ty-mo.th-40,w:mo.tw+20,h:mo.th+60});
  }else if(v==='door'){
    rs.push({x:L.door.x-L.door.w/2-30,y:L.door.y-L.door.h-50,w:L.door.w+140,h:L.door.h+60});
    rs.push({x:L.tq.x-14,y:L.tq.y-26,w:L.tq.w+28,h:L.tq.h+48});
  }else if(v==='draw'){
    var R0=L.dr;
    rs.push({x:12,y:R0.top-14,w:Math.min(450,W*0.64),h:80});
    rs.push({x:R0.cx-R0.lampW/2-30,y:R0.ceilY-40,w:R0.lampW+60,h:R0.lamp.h+100});
  }else if(v==='cart'){
    var M=state.m;
    rs.push({x:M.lx-L.cartW/2-90,y:L.floorY-170,w:(M.rx-M.lx)+L.cartW+180,h:220});
  }else if(v==='pull'){
    var G=pullGeom2();
    rs.push({x:L.pu.LX-40,y:L.pu.cy-L.pu.h*0.3-60,w:(G.RX-L.pu.LX)+L.pu.h+80,h:L.pu.h*0.6+120});
  }else{
    var mt=L.mt;
    rs.push({x:mt.cx-mt.meterH*0.3-80,y:mt.beamY-40,w:mt.meterH*0.6+160,h:L.seat-mt.beamY+60});
    rs.push({x:mt.trayX-80,y:mt.beamY,w:160,h:L.seat-mt.beamY+30});
    var cm=cardRect('meter',208,74);
    rs.push({x:cm.x-4,y:cm.y-4,w:cm.w+8,h:cm.h+8});     // 读数数字卡（R5：实时卡位）
    if(extRect) rs.push({x:extRect.x-4,y:extRect.y-4,w:extRect.w+8,h:extRect.h+8});   // 伸长量面板（R5）
  }
  return rs;
}
function placeReadPanel(){
  var el=document.getElementById('panel-read'); if(!el) return;
  var slot=pickSlot(el.offsetWidth||260,el.offsetHeight||170,avoidRects());
  el.style.left=slot.x+'px'; el.style.top=slot.y+'px';
}
function placeExtPanel(){
  /* R5：伸长量面板统一定位——原版无 left/top（静态流位置=左上角），正好盖住 zone 里的
     「竖直挂钩码/水平拖木块」模式切换按钮（缺陷②）；现默认压到按钮带之下，且可拖+位置记忆 */
  var el=document.getElementById('panel-ext'); if(!el) return;
  var w=el.offsetWidth||210,h=el.offsetHeight||130;
  var top=cardTopSafe();
  var p=cardMem['ext']||cardDefaultPos('ext',w,h);
  var x=clamp(p.x,8,Math.max(8,W-w-8));
  var y=clamp(p.y,top,Math.max(top,L.fy-h-8));
  el.style.left=x+'px'; el.style.top=y+'px';
  extRect={x:x,y:y,w:w,h:h};
}
var openP=null;
function repositionPanels(){ measureZones(); placeExtPanel(); if(openP==='read') placeReadPanel(); }
function openPanel(){
  openP=(openP==='read')?null:'read';
  document.getElementById('panel-read').classList.toggle('show',openP==='read');
  document.getElementById('btn-table').classList.toggle('on',openP==='read');
  if(openP==='read'){ updatePanel(); placeReadPanel(); }
}
function updatePanel(){
  var v=state.view;
  if(v==='deform'){
    var f=state.f,ts=f.ts[f.tool];
    setText('rd-tool',TOOL_CN[f.tool]);
    setText('rd-def',ts.def>0.005?('形变 '+fmt(ts.def*100,0)+' %'+(ts.over?'（超限度）':'')):'无形变');
    setText('rd-force',f.dragging?'施力中（拖拽）':'未施力');
    setText('rd-after',!f.released?'—':(f.lastTool==='clay'?'不恢复（塑性）':(ts.perm>0.005?'永久变形（超限）':'恢复原状（弹性）')));
  }else if(v==='motion'){
    var B=state.b;
    setText('rd-place',PLACE_CN[B.mode]);
    setText('rd-vel',(B.running||B.rolling)?('v = '+fmt(Math.hypot(B.vx,B.vy)/40,1)+' 单位'):'0（静止待发）');
    setText('rd-change',B.done?CHANGE_CN[B.change]:(B.running||B.rolling?'进行中…':'—'));
  }else if(v==='door'){
    var E=state.e;
    setText('rd-point',Math.round(E.pointMark*100)+' %（'+(E.pointMark>0.6?'离轴远':(E.pointMark<0.3?'靠近轴':'中间'))+'）');
    setText('rd-dir','与门面夹角 '+(90-Math.abs(E.angle))+'°');
    setText('rd-size',fmt(E.F,1)+' N');
    setText('rd-eff','力矩 '+fmt(E.eff,2)+' → '+effText(E.eff));
    setText('rd-open',Math.round(E.open*100)+' %');
  }else if(v==='draw'){
    var D=state.d;
    setText('rd-d-start',D.start?(D.judged&&D.items?(D.items.start?'在灯上 ✓':'不在灯上 ✗'):'已点（x'+Math.round(D.start.x)+'）'):'未点');
    setText('rd-d-dir',D.dirLocked?(Math.round(D.dirAngle)+'°'+(D.judged&&D.items?(D.items.dir?' 竖直向上 ✓':' 不竖直 ✗'):'')):(D.dragging?'拖动中…':'未拖'));
    setText('rd-d-len',D.lenN?(D.lenN+' 格 = '+D.lenN+' N'+(D.judged&&D.items?(D.items.len?' ✓':' ✗'):'')):'未定');
    setText('rd-d-label',D.label||(D.judged&&D.items&&!D.items.label?'未标 ✗':'未定'));
    setText('rd-d-res',D.judged?(D.wrongCount?('4 项中 '+D.wrongCount+' 项要改'):'四项全对 ✓'):'—');
  }else if(v==='cart'){
    var M=state.m;
    setText('rd-vl',fmt(Math.abs(M.lv)/40,1)+'（向左）');
    setText('rd-vr',fmt(Math.abs(M.rv)/40,1)+'（向右）');
    setText('rd-poles',M.flip?'异名（N ↔ S）相吸':'同名（N ↔ N）相斥');
    setText('rd-st',M.settled?(M.attracted?'已吸在一起':'已弹开停稳'):(M.running?'运动中…':(M.compressed?'挤压中…':'静止')));
  }else if(v==='pull'){
    var P=state.p;
    setText('rd-pl',fmt(P.T,1)+' N');
    setText('rd-pr',fmt(P.T,1)+' N');
    setText('rd-prel',P.T>0.05?'F₁ = F₂':'未对拉');
    setText('rd-pn',P.pulls+' 次（峰值 '+fmt(P.maxT,1)+' N）');
  }else{
    var S=state.s,sc=SC(),now=performance.now();
    setText('rd-orient',S.orient==='v'?'竖直挂钩码':'水平拖木块');
    setText('rd-load',S.orient==='v'?sc.count+' 个钩码（'+(sc.count*W_G)+'g）':fmt(sc.pull,1)+' N 拖力');
    setText('rd-f','F=G=mg='+fmt(forceOf(sc),2)+' N');
    setText('rd-read',fmt(displayNow(now),2)+' N');
    setText('rd-status',(S.overload?'⚠ 超量程！':(!sc.zeroed?'指针未调零':(sc.osc?'指针振荡中…':'停稳可读'))));
    updateExt();
  }
}

/* ===== 控制栏接线 ===== */
function on(id,ev,fn){ var el=document.getElementById(id); if(el) el.addEventListener(ev,fn); }
function guard(fn){ return function(){ if(state.animating) return; fn(); }; }
['deform','motion','door','mutual','meter'].forEach(function(m){ on('btn-scene-'+m,'click',function(){ goScene(m); }); });
['spring','band','clay','bottle'].forEach(function(t){ on('btn-tool-'+t,'click',guard(function(){ setTool(t); })); });
['near','along','side'].forEach(function(m){ on('btn-place-'+m,'click',guard(function(){ ballSetMode(m); })); });
on('btn-release-b','click',guard(ballRelease));
on('btn-reset-b','click',guard(resetB));
on('btn-board-door','click',function(){ goBoard('door'); });
on('btn-board-draw','click',function(){ goBoard('draw'); });
var rngPoint=document.getElementById('rng-point'),rngDir=document.getElementById('rng-dir'),rngSize=document.getElementById('rng-size');
if(rngPoint) rngPoint.addEventListener('input',function(){
  state.e.pointMark=parseFloat(rngPoint.value)/100;
  setText('lbl-point',rngPoint.value+' %'); updatePanel(); dirty=true;
});
if(rngDir) rngDir.addEventListener('input',function(){
  state.e.angle=parseFloat(rngDir.value);
  setText('lbl-dir',state.e.angle+'°'); updatePanel(); dirty=true;
});
if(rngSize) rngSize.addEventListener('input',function(){
  state.e.F=parseFloat(rngSize.value);
  setText('lbl-size',fmt(state.e.F,1)+' N'); updatePanel(); dirty=true;
});
on('btn-push','click',guard(pushToggle));
on('btn-close','click',guard(closeDoor));
on('btn-draw-clear','click',guard(function(){ drawBoardReset(); if(window.playClick) playClick(); }));
on('btn-c-step1','click',function(){ goStep(1); });
on('btn-c-step2','click',function(){ goStep(2); });
on('btn-c-reset','click',guard(cartReset));
on('btn-p-relax','click',guard(pullRelax));
on('btn-orient-v','click',guard(function(){ setOrient('v'); }));
on('btn-orient-h','click',guard(function(){ setOrient('h'); }));
var rngM=document.getElementById('rng-mpull');
if(rngM) rngM.addEventListener('input',function(){
  if(state.animating||state.s.orient!=='h') return;
  meterPullTo((+rngM.value)/10,true);
});
on('btn-zero','click',guard(zeroAdjust));
on('btn-exam','click',guard(openExam));
on('btn-exam-close','click',function(){ closeExam(); if(window.playClick) playClick(); });
['c1','c2','c3','c4'].forEach(function(k){
  var card=document.getElementById('xc-'+k);
  if(!card) return;
  var okB=card.querySelector('[data-ok]'),badB=card.querySelector('[data-bad]');
  if(okB) okB.addEventListener('click',function(){ judgeExam(k,true); });
  if(badB) badB.addEventListener('click',function(){ judgeExam(k,false); });
});
on('btn-table','click',guard(function(){ openPanel(); if(window.playClick)playClick(); }));
on('btn-reset','click',guard(function(){
  if(state.mode==='deform') resetF();
  else if(state.mode==='motion'){ state.b.tried={}; state.b.triedCount=0; resetB(); }
  else if(state.mode==='door'){ resetE(); drawBoardReset(); }
  else if(state.mode==='mutual') resetM2();
  else resetS();
  updatePanel(); dirty=true;
  if(window.playClick) playClick();
  window.GUIDE_RESET&&window.GUIDE_RESET.all();
}));
on('btn-mute','click',function(){ window.muted=!window.muted; var b=document.getElementById('btn-mute'); if(b)b.textContent=window.muted?'🔇':'🔊'; if(window.playClick)playClick(); });
on('panel-ext','click',function(){ state.s.extTouched=true; var el=document.getElementById('panel-ext'); if(el) el.classList.add('touched'); });
/* R5：伸长量面板标题条拖拽（位置记忆 localStorage） */
(function(){
  var el=document.getElementById('panel-ext'); if(!el) return;
  var title=el.querySelector('.rp-title'); if(!title) return;
  title.style.cursor='move'; title.style.touchAction='none';
  title.style.userSelect='none'; title.style.webkitUserSelect='none';
  var d=null;
  title.addEventListener('pointerdown',function(ev){
    var r=el.getBoundingClientRect();
    d={dx:ev.clientX-r.left,dy:ev.clientY-r.top};
    if(title.setPointerCapture&&ev.pointerId!=null){ try{ title.setPointerCapture(ev.pointerId); }catch(e){} }
    ev.preventDefault();
  });
  title.addEventListener('pointermove',function(ev){
    if(!d) return;
    var wr=document.getElementById('scene-wrap').getBoundingClientRect();
    cardMem['ext']={x:ev.clientX-wr.left-d.dx,y:ev.clientY-wr.top-d.dy};
    placeExtPanel();
    if(openP==='read') placeReadPanel();
  });
  title.addEventListener('pointerup',function(){ if(d){ d=null; saveCardMem(); } });
  title.addEventListener('pointercancel',function(){ if(d){ d=null; saveCardMem(); } });
})();

/* 全屏（documentElement + html.pseudo-fs 降级，c5s1 路线） */
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
on('btn-full','click',guard(function(){ if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull(); else reqFull(); if(window.playClick)playClick(); }));
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(ev){document.addEventListener(ev,function(){syncFull();setTimeout(resize,60);});});

/* ===== 画布指针（直操：形变拖拽/你来画/磁车/对拉/砝码木块） ===== */
function canvasXY(ev){
  var r=cv.getBoundingClientRect();
  return {x:(ev.clientX-r.left)*(W/Math.max(1,r.width)),y:(ev.clientY-r.top)*(H/Math.max(1,r.height))};
}
function pDown(v,p){
  if(v==='deform') return deformDown(p);
  if(v==='draw') return drawDown(p);
  if(v==='cart') return cartDown(p);
  if(v==='pull') return pullDown(p);
  if(v==='meterv'||v==='meterh') return meterDown(p);
  return false;
}
function pMove(v,p){
  if(v==='deform') return deformMove(p);
  if(v==='draw') return drawMove(p);
  if(v==='cart') return cartMove(p);
  if(v==='pull') return pullMove(p);
  if(v==='meterv'||v==='meterh') return meterMove(p);
  return false;
}
function pUp(v){
  if(v==='deform') return deformUp();
  if(v==='draw') return drawUp();
  if(v==='cart') return cartUp();
  if(v==='pull') return pullUp();
  if(v==='meterv'||v==='meterh') return meterUp();
  return false;
}
cv.addEventListener('pointerdown',function(ev){
  if(state.animating) return;
  var p=canvasXY(ev);
  var cr=activeCardRect();   /* R5：浮卡拖动优先于器材直操（卡在最上层绘制） */
  if(cr&&inRect(p,cr)){
    cardDrag={key:cr.key,dx:p.x-cr.x,dy:p.y-cr.y};
    if(cv.setPointerCapture&&ev.pointerId!=null){ try{ cv.setPointerCapture(ev.pointerId); }catch(e){} }
    ev.preventDefault();
    return;
  }
  if(!pDown(state.view,p)) return;
  if(cv.setPointerCapture&&ev.pointerId!=null){ try{ cv.setPointerCapture(ev.pointerId); }catch(e){} }
});
cv.addEventListener('pointermove',function(ev){
  if(state.animating) return;
  var p=canvasXY(ev);
  if(cardDrag){
    cardMem[cardDrag.key]={x:p.x-cardDrag.dx,y:p.y-cardDrag.dy};
    if(openP==='read') placeReadPanel();
    dirty=true;
    return;
  }
  pMove(state.view,p);
});
['pointerup','pointercancel','pointerleave'].forEach(function(ev){
  cv.addEventListener(ev,function(){
    if(cardDrag){ saveCardMem(); cardDrag=null; if(openP==='read') placeReadPanel(); return; }
    pUp(state.view);
  });
});

/* ===== 动画 tick ===== */
var lastNow=0;
function busy(){
  var now=performance.now(),dt=lastNow?Math.min(64,now-lastNow):16; lastNow=now;
  if(state.animating){
    if(now-state.anim.t0>=ANIM_DUR){ state.animating=false; state.anim=null; repositionPanels(); }
    return true;
  }
  var b=false;
  if(state.view==='deform'){ if(deformTick(now)) b=true; }
  else if(state.view==='motion'){ if(ballTick(now,dt)) b=true; }
  else if(state.view==='door'){ if(doorTick(now,dt)) b=true; }
  else if(state.view==='cart'){ if(cartTick(now,dt)) b=true; }
  else if(state.view==='pull'){ if(pullTick(now)) b=true; }
  else{ if(zeroTick(now)) b=true;
        var sc=SC();
        if(sc.osc){ oscVal(sc,now); b=true; }
  }
  return b;
}
function tick(){
  if(busy()||dirty){ dirty=false; draw(); }
  requestAnimationFrame(tick);
}

/* ===== init ===== */
if(document.body.dataset.scene==='meter'){ state.mode='meter'; }
state.modeEnterT=performance.now();
layout(); resize();
state.view=viewOf();
renderView('motion');      /* 预热一帧拿台面几何（resetBall 依赖 L.mo.top） */
resetBall();
renderView(state.view);
syncUI(); updatePanel(); draw();
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); reflow(); repositionPanels(); dirty=true; }).observe(ctrlEl);
}
requestAnimationFrame(tick);
/* 调试通道（验收直读模型） */
window.__c7dbg={
  get state(){ return state; }, get W(){ return W; }, get H(){ return H; }, get layout(){ return L; },
  scene:goScene, board:goBoard, step:goStep,
  setTool:setTool, place:ballSetMode, releaseB:ballRelease,
  push:pushToggle, judge:drawJudge, flipMagnet:function(){ state.m.flip=!state.m.flip; homeCarts(); dirty=true; },
  pullTo:function(t){ state.p.g=clamp(t/PULL_TMAX*L.pu.gMax,0,L.pu.gMax); state.p.T=clamp(t,0,PULL_TMAX); updatePanel(); dirty=true; },
  hangWeight:hangWeight, zero:zeroAdjust, setOrient:setOrient,
  openExam:openExam, judgeExam:judgeExam,
  reset:function(){ resetF(); resetB(); resetE(); drawBoardReset(); resetM2(); resetS(); },
  pickSlotProbe:function(){ var el=document.getElementById('panel-read');
    return {slot:pickSlot(el.offsetWidth||260,el.offsetHeight||170,avoidRects()),avoid:avoidRects()}; }
};
})();

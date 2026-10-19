/* exp-density-core.js — c6s2 密度实验室（三场景：E3 探究m·V / E4 密度水槽 / E5 物质鉴别） */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
/* ===== 常量（core 单点定义，layout/render 只读） ===== */
var ANIM_DUR=600;                 // 场景切换飞入飞出（第24条①）
var TWEEN_MS=350;                 // 浮沉/水位单调过渡（P6：300-400ms，禁回弹）
var DESK_BAND=109;                // R27：wood_desk 桌带厚度锁 109px（蔡总 10-09 定版；by=fy−109，fy=地板线=H−ctrlBandH）
var RHO_WATER=1.0;                // 水密度 kg/L（=1.0×10³ kg/m³，教材表值）
var TANK_BASE_L=100,TANK_FULL_L=120;   // E4 基础水位/满缸刻度（水位=基础+排水）
var TKF=PROPS.TANK.front;   // 水面前缘 frac（库内单点，props.js 同源）
var TKB=PROPS.TANK.bot;     // 缸底 frac（库内单点）
var TANK_ASPECT=1.30;             // 水槽 sprite 宽高比（sprite 加载后按实测重算）
/* 教材表6.2-1 密度值照录（g/cm³ 数值 = kg/L 数值，禁改） */
var RHO={gold:19.3,copper:8.9,iron:7.9,aluminum:2.7,ice:0.9,wax:0.9,wood:0.5};
var MATCN={gold:'金',copper:'铜',iron:'铁',aluminum:'铝',ice:'冰(0℃)',wax:'蜡',wood:'干松木',pvc:'PVC',brick:'砖',styrofoam:'泡沫',custom:'自定义'};
var E3_VOLS=[10,20,30];                        // E3 大小三档（cm³，可配）
var E3_COL={aluminum:'#2563eb',iron:'#dc2626',wood:'#16a34a'};   // 描点/拟合线换材质换色
var E4_RHO={wood:0.4,ice:0.9,aluminum:2.7,pvc:1.4,brick:2.0};    // E4 预设池：木0.4为PhET值（教材干松木0.5）；PVC/砖为PhET值非教材表值
var E4_VMIN=1,E4_VMAX=10,E4_MMIN=0.5,E4_MMAX=20;                 // E4 滑杆范围（V 1-10L / 自定义 m 0.5-20kg）
/* E4.2 漂浮阻尼微晃（R8 蔡总：一周期就够）：单阻尼余弦 y=yEq+(y0-yEq)e^(-t/τ)cos(ωt)，1 周期、520ms 收敛（单调衰减不回弹） */
var E4_BOB_MS=520,E4_BOB_CYCLES=1,E4_BOB_TAU=0.22;               // 总时长/周期数(ω=2πf,f=cycles/T)/衰减时常（单块与摞叠共用，无第二处硬编码）
var E4_BOB_W=2*Math.PI*E4_BOB_CYCLES/(E4_BOB_MS/1000);           // 角频率 rad/s
var E4_SPLASH_MS=300;                                             // 入水微溅涟漪寿命（2-3 扩散弧）
var E5_POOL=['gold','copper','iron','aluminum','ice','wood'];      // E5 出题池（教材表值；蜡与冰同密度会歧义不入池）
var E5_CYL_CAP=8000,E5_CYL_DIV=1000,E5_CYL_BASE=1500;              // E5 量筒 mL（底水1500，最大 1500+5000<8000）
var E3_VMAX=70,E3_MMAX=250;       // E3 作图板固定标度（兼容调试样例 V≤60/m≤30.1 与铁30cm³=237g）
var E3_W_SET=[100,50,20,20,10,5]; // 砝码盒配置（weight_set 同源；总205g+游码5g）
var E3_CYL_CAP=60,E3_CYL_DIV=10,E3_CYL_BASE=20;   // E3 量筒 cm³(=mL)：底水20，浸没块最大30→50<60
var E3_CONV_MS=600,E3_BLINK_HZ=1.5;               // 箭头汇聚时长(ms)/忽闪频率(Hz)——蔡总创意：忽闪→平移汇聚→交点浮现
var E3_BLOCK_K=0.40;              // E3 物块示意缩放系数（蔡总：左盘物块太大→0.4×）

var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var hintEl=document.getElementById('hint');
var W=960,H=520,DPR=1,ctrlBandH=150,COMPACT_H=600,dirty=true;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
/* ===== 通则A：hint 逐场景选位（E3/E5 顶部居中、E4 左侧竖排；任何场景不得与控制栏矩形相交） ===== */
function placeHint(){
  if(!hintEl) return;
  var cls=(state.scene==='e4')?'hint-left-v':'hint-top';
  if(hintEl.className!==cls) hintEl.className=cls;
  hintEl.style.top=''; hintEl.style.bottom='';
  measureCtrl();
  var hr=hintEl.getBoundingClientRect(),cr=ctrlEl?ctrlEl.getBoundingClientRect():null;
  if(cr&&hr.height&&hr.bottom>cr.top+1&&hr.top<cr.bottom){   // 与控制栏相交 → 抬到控制栏上方 10px
    hintEl.style.top='auto'; hintEl.style.bottom=(ctrlBandH+10)+'px';
  }
}
function hintRectCanvas(){   // hint 当前可见时的画布坐标矩形（供 pickSlot avoidRects；已淡出则不避让）
  if(!hintEl||hintEl.style.opacity==='0') return null;
  var r=hintEl.getBoundingClientRect(); if(!r.width||!r.height) return null;
  var wr=cv.getBoundingClientRect();
  return {x:r.left-wr.left,y:r.top-wr.top,w:r.width,h:r.height};
}
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
function easeOut(t){ return 1-Math.pow(1-t,3); }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(v,n){ return (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }
function cbrt(v){ return Math.pow(v,1/3); }

/* ===== 状态（三场景完全隔离，返回原样恢复） ===== */
var state={
  scene:'e3',animating:false,anim:null,showLabels:false,   // R34：标注开关默认关（重置不影响）
  e3:{mat:'aluminum',v:20,records:[],dropT:0,
      block:{loc:'source',x:0,y:0},mKnown:false,vKnown:false,converged:false,
      cylFrac:E3_CYL_BASE/E3_CYL_CAP,cylTw:null,arw:null,drag:null},
  e4:{dual:false,sel:0,single:null,duals:null,lvl:TANK_BASE_L,drag:null,
      splashes:[],stack:null},
  e5:{blocks:[],sel:0,cylTw:null,cylFrac:E5_CYL_BASE/E5_CYL_CAP,fade:null,drag:null}
};
var hintT0=0,HINT_LIFE=6000;   // hint 6s 自动淡出，新操作（updateHint）再唤出
function e4Blocks(){ return state.e4.dual?state.e4.duals:[state.e4.single]; }

/* ===== 布局（layout() 单点算，绘制只读） ===== */
var L={};
function attachBalG(B){   // R19 消费 v3 + R24 消费 v4：天平几何 PROPS.balGeom 单源（本地副本清零）；panDx/panTop/panHW 全由返回对象派生
  var G=PROPS.balGeom(B.x,B.y,B.h,0);
  B.g=G; B.panDx=B.x-G.panL.x; B.panTop=G.panL.y; B.panHW=G.panL.r;   // R24：panTop=盘椭圆中心（v4 挂载语义，panL.y 本就是盘心；_.panH 旧偏移用法清零）
}
function layout(){
  /* R29 坐深对齐：by=桌带顶线仅供 wood_desk 绘制；器材落地/停驻线一律 L.seat=坐深居中（进深带 [by,by+64]，span=26，seat−by=45） */
  L.fy=H-ctrlBandH;
  L.by=Math.max(40,L.fy-DESK_BAND);
  L.seatSpan=26;
  L.seat=PROPS.seatY(L.by,64,L.seatSpan);
  // E3：天平(左)+物块源(台面)+量筒(排水测V)+右侧≈32%常驻绘制区（上半记录表/下半作图板）
  var e3x0=Math.round(W*0.655),e3x1=Math.round(W*0.985),e3y0=Math.round(H*0.09),e3y1=L.by-16;
  var e3ymid=Math.round(e3y0+(e3y1-e3y0)*0.42);
  L.e3={
    bal:{x:Math.round(W*0.185),y:L.seat,h:Math.round(H*0.44)},
    src:{x:Math.round(W*0.335),y:L.seat},
    cyl:{x:Math.round(W*0.485),y:L.seat,h:Math.max(160,L.seat-Math.round(H*0.12))},
    panel:{x0:e3x0,x1:e3x1,y0:e3y0,y1:e3y1},
    table:{x0:e3x0,x1:e3x1,y0:e3y0,y1:e3ymid},
    graph:{x0:e3x0,x1:e3x1,y0:e3ymid+10,y1:e3y1}
  };
  attachBalG(L.e3.bal);
  var tankH=Math.max(140,L.seat-Math.round(H*0.185));
  var tankW=tankH*TANK_ASPECT;
  L.e4={
    scale:{x:Math.round(W*0.5),y:Math.round(H*0.15),w:Math.min(460,Math.round(W*0.55))},
    tank:{x:Math.round(W*0.5),y:L.seat,h:tankH,w:tankW,innerHalf:tankW*0.39},
    benchY:L.seat
  };
  // E5：密度表固定卡占画布右缘≤26%（x≳0.74W），器材一律收到 0.72W 左侧不被覆盖
  L.e5={
    bal:{x:Math.round(W*0.155),y:L.seat,h:Math.round(H*0.40)},
    cyl:{x:Math.round(W*0.665),y:L.seat,h:Math.max(170,L.seat-Math.round(H*0.10))},
    benchY:L.seat
  };
  attachBalG(L.e5.bal);
  // R19：砝码盒改排天平底座右侧（底座半宽=0.36h，balGeom base.w 同源）+24px 间距；盒右缘不入量筒区，spot 三位随新盒位重排避让
  L.e5.boxW=Math.round(H*0.15);   // boxW 沿用本页现公式（=weight_set opt.w）
  var cylHalfW=Math.max(15,L.e5.cyl.h*0.09)+8;   // 量筒半宽（w=max(30,h*0.18)）+间隙
  L.e5.boxX=clamp(L.e5.bal.x+Math.round(L.e5.bal.h*0.36)+Math.round(L.e5.boxW/2)+24,
    Math.round(L.e5.boxW/2)+12, Math.min(W-Math.round(L.e5.boxW/2)-12, L.e5.cyl.x-cylHalfW-Math.round(L.e5.boxW/2)-12));
  var sHalf=Math.ceil(H*0.045*cbrt(5)/2)+10;   // 神秘块最大半宽（v≤5L）+间隙
  var spMin=L.e5.boxX+Math.round(L.e5.boxW/2)+sHalf;
  var spMax=Math.round(Math.max(spMin+20,L.e5.cyl.x-cylHalfW-sHalf));
  L.e5.spotBounds={min:spMin,max:spMax};
  e5ComputeSpots(e5MaxV());   // R32修4：三位等距居中，间距=本题最大块边长×1.35（域宽不足按域收窄）
}
function e5MaxV(){ var mv=0; state.e5.blocks.forEach(function(b){ if(b.v>mv) mv=b.v; }); return mv||5; }
function e5ComputeSpots(maxV){
  var bd=L.e5.spotBounds; if(!bd) return;
  var mid=Math.round((bd.min+bd.max)/2);
  var maxSide=Math.max(14,H*0.045*cbrt(maxV||5));   // e5Side 同式：本题最大块边长
  var gap=Math.min(Math.round(maxSide*1.35),Math.max(20,Math.round((bd.max-bd.min)/2)));
  L.e5.spot=[mid-gap,mid,mid+gap];
}
function tankSurfYAt(lvlL){   // 水位体积(L)→水面屏幕y（water_tank 内腔 frac 同源）
  var t=L.e4.tank;
  var yf=TKF+(1-clamp(lvlL/TANK_FULL_L,0,1))*(TKB-TKF);
  return t.y-(1-yf)*t.h;
}
function tankBotY(){ return L.e4.tank.y-(1-TKB)*L.e4.tank.h; }
function e4Side(b){ return Math.max(16,L.e4.tank.h*0.30*cbrt(b.v/5)); }
function e5Side(b){ return Math.max(14,H*0.045*cbrt(b.v)); }   // E5 未知块示意缩放（0.4×级，与量筒内一致，不再巨大）
function e3Side(){ return Math.max(12,H*0.05*E3_BLOCK_K*cbrt(state.e3.v)); }   // E3 物块示意缩放 0.4×
/* R35 蔡总 00:08：接触面禁错位=前面共面（顶块前面与底块前面同 x 连续 y，top.x=bot.x、top.y=bot.y−sBot）；
   6b 同心偏移（顶块底面中心坐底块顶面平行四边形中心，每层右移半格）视觉阶梯错位已废 */
function stackOffset(s){
  return {x:0, y:0};
}

function reflow(){   // resize/全屏重算一切（第17条）：块位置回域
  var b3=state.e3.block;
  if(b3.loc==='source'){ b3.x=L.e3.src.x; b3.y=L.e3.src.y; }
  else if(b3.loc==='pan'){ b3.x=L.e3.bal.g.panL.x; b3.y=L.e3.bal.panTop; }
  else if(b3.loc==='cyl'){ b3.x=L.e3.cyl.x; b3.y=L.e3.cyl.y; }
  var t=L.e4.tank;
  e4Blocks().forEach(function(b,i){
    if(!b) return;
    if(b.loc==='tank'){ b.x=clamp(b.x,t.x-t.innerHalf+e4Side(b)/2,t.x+t.innerHalf-e4Side(b)/2); b.y=e4RestY(b); }
    else { b.y=L.e4.benchY; b.benchOn=null; b.x=clamp(b.x,60,W-60); }   // resize 回位=拆台面摞（同 E5 R28 语义）
  });
  if(state.e4.stack) e4StackReflow();
  state.e5.blocks.forEach(function(b,i){
    if(b.loc==='bench'){ b.x=L.e5.spot[i]; b.stackOn=null; }   // resize 回位=拆摞（R28 链只在桌面停驻期有效）
    if(b.loc==='cyl') b.x=L.e5.cyl.x;
    if(b.loc==='pan') b.x=L.e5.bal.g.panL.x;
    b.y=L.e5.benchY;
  });
}
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl(); layout(); reflow(); placeHint(); repositionPanels();
  dirty=true;
}
/* 背景延展绘制：飞入飞出时场景 translate，背景上下延展不留白。R27：桌面=库定版 PROPS.wood_desk（bench 禁用）；墙色三场景各自保留（E3 暖白/E4E5 天蓝） */
function paintBg(wall,side){
  ctx.fillStyle=wall; ctx.fillRect(0,-H*2,W,H*2);
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});   // R29：桌带顶线仅供绘制，器材坐 L.seat
  ctx.fillStyle=side; ctx.fillRect(0,H,W,H*2);
}
function rrPath(x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function ghostCard(x,y,w,h){   // 幽灵化读数牌（rgba .45、圆角、禁 blur/阴影/硬边框）
  rrPath(x,y,w,h,10);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=1.5; ctx.stroke();
}

/* ===== 场景一 E3：探究物质的质量与体积的关系（m-V 描点作图，连线自动·过原点比例线） ===== */
function e3Rho(){ return RHO[state.e3.mat]; }
function e3Mass(){ return e3Rho()*state.e3.v; }   // g，m=ρV（教材表值：铝2.7/铁7.9/干松木0.5）
function weightsFor(m){   // 简化读数态：右盘砝码贪心配平 + 游码补差
  var ws=[],rest=m;
  E3_W_SET.forEach(function(g){ if(rest>=g-1e-9){ ws.push(g); rest-=g; } });
  var rider=clamp(Math.round(rest*10)/10,0,5);
  rest-=rider;
  if(rest>0.05) ws.push(Math.round(rest*10)/10);   // 盒总205g+游码5g<铁30cm³的237g：溢出画示意砝码（报告注明）
  return {ws:ws,rider:rider};
}
function drawPanWeights(c,cx,pyC,hw,list){   // 盘上砝码堆（R24：pyC=盘椭圆中心，砝码底面中心坐盘心；balance_pan panR 挂载白名单：砝码页面层绘制）
  var n=list.length; if(!n) return;
  list.forEach(function(g,i){
    var w=Math.max(6,Math.min(hw*0.9,4+g*0.09)),h=5+g*0.09;
    var x=cx+(i-(n-1)/2)*(w+2),y=pyC;
    var gr=c.createLinearGradient(x-w/2,0,x+w/2,0);
    gr.addColorStop(0,'#9ca3af'); gr.addColorStop(0.5,'#e5e7eb'); gr.addColorStop(1,'#7d838c');
    c.fillStyle=gr; c.fillRect(x-w/2,y-h,w,h);
    c.strokeStyle='rgba(80,85,92,0.7)'; c.lineWidth=1; c.strokeRect(x-w/2,y-h,w,h);
    c.beginPath(); c.ellipse(x,y-h,w/2,w*0.18,0,0,Math.PI*2);
    c.fillStyle='#e5e7eb'; c.fill(); c.stroke();
  });
}
/* ===== E3 排水法量筒（测V）+ 常驻记录表（canvas 绘制，自动入表） ===== */
function e3CylW(){ return E3_CYL_BASE+(state.e3.block.loc==='cyl'?state.e3.v:0); }   // 筒内水量cm³=底水+入筒块体积
function e3CylTargetFrac(){ return clamp(e3CylW()/E3_CYL_CAP,0,1); }
function e3SetCyl(f1){ state.e3.cylTw={t0:performance.now(),f0:state.e3.cylFrac,f1:f1}; dirty=true; }
/* ===== R15：漂浮块（ρ<水）入筒由筒底系线拽住全浸悬浮（蔡总方案，物理自洽——系线不改变排水量，水位差=V 读数逻辑不变） ===== */
function cylInner(C){   // 量筒内腔几何（cylinder_grad v3 同公式：w/wall/内腔四边，页面仅此处换算）
  var w=Math.max(30,C.h*0.18),wall=Math.max(2,w*0.055);
  return {w:w,inL:C.x-w/2+wall,inR:C.x+w/2-wall,inTop:C.y-C.h+wall*2.2,inBot:C.y-wall*2.2};
}
function drawCylTether(C,frac,color){   // 悬浮位 clamp：块顶低于水面≥6px、块底高于筒内底≥10px；系线先画（块之下层、水体之上层）
  var gi=cylInner(C),bw=(gi.inR-gi.inL)*0.62,bh=bw;
  var wy=gi.inBot-(gi.inBot-gi.inTop)*clamp(frac,0,1);
  var yTop=clamp(wy+6,gi.inTop,Math.max(gi.inTop,gi.inBot-10-bh));
  ctx.strokeStyle='#64748b'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(C.x,gi.inBot); ctx.lineTo(C.x,yTop+bh); ctx.stroke();   // 系线：筒内底中心→块底中心
  ctx.fillStyle=color;
  ctx.fillRect(C.x-bw/2,yTop,bw,bh);
  ctx.strokeStyle='rgba(0,0,0,0.28)'; ctx.lineWidth=1;
  ctx.strokeRect(C.x-bw/2,yTop,bw,bh);
}
function drawE3Cyl(){   // 体积改排水法实测（蔡总二轮拍板）：块全浸没→水位差=V读数；漂浮材质走 R15 系线悬浮（沉底材质沿用 inside 占位）
  var C=L.e3.cyl,E=state.e3,inCyl=(E.block.loc==='cyl'),inFloat=inCyl&&RHO[E.mat]<RHO_WATER;
  PROPS.cylinder_grad(ctx,C.x,C.y,{h:C.h,cap:E3_CYL_CAP,div:E3_CYL_DIV,
    water:E.cylFrac,inside:(inCyl&&!inFloat)?'#9aa7b4':null});
  if(inFloat) drawCylTether(C,E.cylFrac,'#9aa7b4');
  var vTxt=inCyl?('V = '+E.v+' cm³（水位差 '+E3_CYL_BASE+'→'+e3CylW()+'）'):('底水 '+E3_CYL_BASE+' cm³');
  ghostCard(C.x-98,C.y-C.h-42,196,28);
  ctx.fillStyle='#1e293b'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText(vTxt,C.x,C.y-C.h-23);
}
function drawE3Table(){   // 上半常驻记录表：材质/m g/V cm³/m÷V 四列（canvas 绘制，非浮层摆设）
  var T=L.e3.table,E=state.e3,pw=T.x1-T.x0,ph=T.y1-T.y0;
  ghostCard(T.x0,T.y0,pw,ph);
  var cx=T.x0+10,cw=pw-20;
  var colX=[cx+4,cx+cw*0.55,cx+cw*0.77,cx+cw*0.99];
  ctx.save();
  ctx.fillStyle='#b45309'; ctx.font='600 13px sans-serif'; ctx.textAlign='left';
  ctx.fillText('记录表（自动入表）',cx,T.y0+20);
  var headY=T.y0+38;
  ctx.fillStyle='#64748b'; ctx.font='600 11px sans-serif';
  ctx.textAlign='left'; ctx.fillText('材质',colX[0],headY);
  ctx.textAlign='right'; ctx.fillText('m/g',colX[1],headY); ctx.fillText('V/cm³',colX[2],headY); ctx.fillText('m÷V',colX[3],headY);
  ctx.strokeStyle='rgba(0,0,0,.14)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(cx,headY+5); ctx.lineTo(cx+cw,headY+5); ctx.stroke();
  if(!E.records.length){
    ctx.fillStyle='#94a3b8'; ctx.font='11px sans-serif'; ctx.textAlign='center';
    ctx.fillText('称出 m、测出 V 后自动描点入表',cx+cw/2,headY+24);
    ctx.restore(); return;
  }
  var rowH=Math.min(20,(T.y1-headY-12)/Math.max(5,E.records.length));
  E.records.forEach(function(r,i){
    var y=headY+17+i*rowH; if(y>T.y1-5) return;
    ctx.beginPath(); ctx.arc(colX[0]+3,y-3,3.2,0,Math.PI*2);
    ctx.fillStyle=E3_COL[r.mat]||'#2563eb'; ctx.fill();
    ctx.fillStyle='#1e293b'; ctx.font='11px sans-serif';
    ctx.textAlign='left'; ctx.fillText((r.mat==='wood')?'木':MATCN[r.mat],colX[0]+11,y);
    ctx.textAlign='right';
    ctx.fillText(fmt(r.m,1),colX[1],y); ctx.fillText(String(r.v),colX[2],y); ctx.fillText(fmt(r.ratio,2),colX[3],y);
  });
  ctx.restore();
}
function e3BlinkA(now){ return 0.35+0.65*(0.5+0.5*Math.sin(2*Math.PI*E3_BLINK_HZ*now/1000)); }   // 忽闪 1.5Hz
function drawArrowH(x,y,len,a){   // 横向忽闪箭头：尖端(x,y)指向右（→交点汇聚）
  ctx.save(); ctx.globalAlpha=a; ctx.strokeStyle='#ea580c'; ctx.fillStyle='#ea580c'; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(x-len,y); ctx.lineTo(x-7,y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-9,y-4.6); ctx.lineTo(x-9,y+4.6); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawArrowV(x,y,len,a){   // 纵向忽闪箭头：尖端(x,y)指向上（→交点汇聚）
  ctx.save(); ctx.globalAlpha=a; ctx.strokeStyle='#ea580c'; ctx.fillStyle='#ea580c'; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(x,y+len); ctx.lineTo(x,y+7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-4.6,y+9); ctx.lineTo(x+4.6,y+9); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawE3Graph(){   // 下半 m-V 作图板：网格+轴+描点(200ms scale-in 淡入)+过原点比例线+双箭头汇聚描点(蔡总创意)
  var G=L.e3.graph,E=state.e3,now=performance.now();
  var pw=G.x1-G.x0,ph=G.y1-G.y0,padL=34,padB=26,padT=22,padR=12;
  var ox=G.x0+padL,oy=G.y1-padB,iw=pw-padL-padR,ih=ph-padB-padT;
  ghostCard(G.x0,G.y0,pw,ph);
  ctx.save();
  ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=1;
  for(var v=0;v<=E3_VMAX;v+=10){ var x=ox+iw*v/E3_VMAX;
    ctx.beginPath(); ctx.moveTo(x,oy-ih); ctx.lineTo(x,oy); ctx.stroke(); }
  for(var m=0;m<=E3_MMAX;m+=50){ var y=oy-ih*m/E3_MMAX;
    ctx.beginPath(); ctx.moveTo(ox,y); ctx.lineTo(ox+iw,y); ctx.stroke(); }
  ctx.strokeStyle='#64748b'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(ox,oy-ih); ctx.lineTo(ox,oy); ctx.lineTo(ox+iw,oy); ctx.stroke();
  ctx.fillStyle='#64748b'; ctx.font='11px sans-serif'; ctx.textAlign='center';
  for(v=0;v<=E3_VMAX;v+=10) ctx.fillText(String(v),ox+iw*v/E3_VMAX,oy+15);
  ctx.textAlign='right';
  for(m=0;m<=E3_MMAX;m+=50) ctx.fillText(String(m),ox-5,oy-ih*m/E3_MMAX+4);
  ctx.textAlign='left'; ctx.fillText('m/g',ox-24,oy-ih-6);
  ctx.textAlign='right'; ctx.fillText('V/cm³',ox+iw,oy+27);
  // 描点（逐点 200ms scale-in 淡入）
  E.records.forEach(function(r){
    var p=r.t?clamp((now-r.t)/200,0,1):1,rad=4.6*easeOut(p);
    var x=ox+iw*clamp(r.v,0,E3_VMAX)/E3_VMAX,y=oy-ih*clamp(r.m,0,E3_MMAX)/E3_MMAX;
    ctx.save(); ctx.globalAlpha=p;
    ctx.beginPath(); ctx.arc(x,y,rad,0,Math.PI*2);
    ctx.fillStyle=E3_COL[r.mat]||'#2563eb'; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=1.2; ctx.stroke();
    ctx.restore();
  });
  // 同材质≥2点：最小二乘过原点比例线 m=kV，k=Σ(mV)/Σ(V²)，换材质换色
  ['aluminum','iron','wood'].forEach(function(mat){
    var rs=E.records.filter(function(r){ return r.mat===mat; });
    if(rs.length<2) return;
    var svv=0,smv=0; rs.forEach(function(r){ svv+=r.v*r.v; smv+=r.m*r.v; });
    var k=smv/svv,yEnd=k*E3_VMAX;
    ctx.save(); ctx.beginPath(); ctx.rect(ox,oy-ih,iw,ih); ctx.clip();
    ctx.strokeStyle=E3_COL[mat]; ctx.lineWidth=2; ctx.globalAlpha=0.75;
    ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+iw,oy-ih*yEnd/E3_MMAX); ctx.stroke();
    ctx.restore();
  });
  // 图例
  var lx=G.x0+padL+4,ly=G.y0+13;
  ['aluminum','iron','wood'].forEach(function(mat,i){
    var has=E.records.some(function(r){ return r.mat===mat; });
    ctx.globalAlpha=has?1:0.32;
    ctx.beginPath(); ctx.arc(lx+i*58,ly,4,0,Math.PI*2); ctx.fillStyle=E3_COL[mat]; ctx.fill();
    ctx.fillStyle='#1e293b'; ctx.font='11px sans-serif'; ctx.textAlign='left';
    ctx.fillText(MATCN[mat]==='干松木'?'木':MATCN[mat],lx+i*58+7,ly+4);
    ctx.globalAlpha=1;
  });
  // ===== 蔡总创意核心项：双箭头汇聚描点动画 =====
  var px=ox+iw*clamp(E.v,0,E3_VMAX)/E3_VMAX, py=oy-ih*clamp(e3Mass(),0,E3_MMAX)/E3_MMAX;
  if(E.arw){   // 汇聚阶段：两箭同时平移向交点(V,m)（600ms ease）→汇聚→箭头消失、数据点浮现
    var e=easeInOut(clamp((now-E.arw.t0)/E3_CONV_MS,0,1));
    var ax=(ox-3)+(px-(ox-3))*e, vy=(oy+3)+(py-(oy+3))*e;
    drawArrowH(ax,py,26,1);
    drawArrowV(px,vy,26,1);
  }else if(!E.converged){   // 忽闪阶段：称出m→y轴忽闪箭头；测出V→x轴忽闪箭头（顺序无关）
    var ba=e3BlinkA(now);
    if(E.mKnown) drawArrowH(ox-3,py,26,ba);
    if(E.vKnown) drawArrowV(px,oy+3,26,ba);
  }
  ctx.restore();
}
function renderE3(){
  paintBg('#f9f4cd','rgb(160,160,160)');
  var b=L.e3.bal,E=state.e3,g=b.g,side=e3Side();
  var onPan=(E.block.loc==='pan');
  var dropP=1;
  if(E.dropT){ dropP=clamp((performance.now()-E.dropT)/250,0,1); if(dropP>=1) E.dropT=0; else dirty=true; }
  var dyOff=(1-easeOut(dropP))*H*0.18;
  drawE3Table();   // 常驻上半记录表
  drawE3Graph();   // 常驻下半作图板（含双箭头汇聚）
  drawE3Cyl();     // 排水法测V量筒
  var wf=onPan?weightsFor(e3Mass()):{ws:[],rider:0};
  PROPS.weight_set(ctx,Math.round(W*0.055),b.y,{w:Math.round(H*0.16),open:true});
  PROPS.balance_pan(ctx,b.x,b.y,{h:b.h,tilt:0,rider:wf.rider,riderShow:onPan,
    panL:function(c,cx,py){ if(onPan) PROPS.material_block(c,cx,py-dyOff,{size:side,mat:E.mat}); },   // R24：v4 回调 py=盘椭圆中心，块底面中心坐盘心
    panR:function(c,cx,py,panR){ if(onPan) drawPanWeights(c,cx,py,panR,wf.ws); }
  });
  if(onPan){
    ghostCard(b.x-92,b.y+16,184,30);
    ctx.fillStyle='#1e293b'; ctx.font='600 14px sans-serif'; ctx.textAlign='center';
    ctx.fillText('称量读数  m = '+fmt(e3Mass(),1)+' g',b.x,b.y+36);
  }
  // R7 拖动进入列 → 淡色落点提示圈（虚线边）
  if(E.drag){
    var pn=e3PanL(),cy=e3CylMouth(),bp={x:E.block.x,y:E.block.y};
    var tgt=overPan(bp,pn)?{x:pn.x,y:pn.y,rx:pn.r*1.5}:(overCyl(bp,cy)?{x:cy.x,y:cy.y,rx:Math.min(cy.r,36)}:null);
    if(tgt){
      ctx.save();
      ctx.beginPath(); ctx.ellipse(tgt.x,tgt.y,tgt.rx,tgt.rx*0.40,0,0,Math.PI*2);
      ctx.fillStyle='rgba(120,160,90,.18)'; ctx.fill();
      ctx.strokeStyle='rgba(120,160,90,.65)'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]); ctx.stroke();
      ctx.restore();
    }
  }
  // 源位/拖拽态物块（不在盘、不在筒时）
  if(E.block.loc==='source'||E.block.loc==='drag'){
    var sx=(E.block.loc==='drag')?E.block.x:L.e3.src.x;
    var sy=(E.block.loc==='drag')?E.block.y:(L.e3.src.y-dyOff);
    PROPS.material_block(ctx,sx,sy,{size:side,mat:E.mat,label:state.showLabels?(MATCN[E.mat]+'块 '+E.v+'cm³'):null});   // R34 gate③：E3 块标签
  }
}
function e3Select(mat,v){   // 换材质/体积：新块落回源位、清空双测量、量筒退水（重测入口）
  var E=state.e3;
  if(mat) E.mat=mat;
  if(v) E.v=v;
  E.block.loc='source'; E.block.x=L.e3.src.x; E.block.y=L.e3.src.y;
  E.mKnown=false; E.vKnown=false; E.converged=false; E.arw=null;
  e3SetCyl(E3_CYL_BASE/E3_CYL_CAP);
  E.dropT=performance.now(); dirty=true;
  if(window.playDrop) playDrop();
  syncE3Btns(); updateHint(); updatePanel();
}
function e3CheckBoth(){   // 双测齐（顺序无关）→ 触发双箭头汇聚动画
  var E=state.e3;
  if(E.mKnown&&E.vKnown&&!E.converged){ E.converged=true; E.arw={t0:performance.now()}; dirty=true; }
}
function e3AutoRecord(){   // 汇聚完成→数据点浮现+自动入表（重测同材质同体积=覆盖旧行不重复）
  var E=state.e3,m=e3Mass();
  var rec={mat:E.mat,v:E.v,m:m,ratio:m/E.v,t:performance.now()};
  var dup=E.records.findIndex(function(r){ return r.mat===rec.mat&&r.v===rec.v; });
  if(dup>=0) E.records[dup]=rec; else E.records.push(rec);
  dirty=true; if(window.playMatch) playMatch();
  updatePanel(); updateHint();
}
function e3BlockPos(){   // 物块绘制锚点（底面中心）按 loc
  var b=state.e3.block,B=L.e3;
  if(b.loc==='pan') return {x:B.bal.g.panL.x,y:B.bal.panTop};
  if(b.loc==='cyl') return {x:B.cyl.x,y:B.cyl.y};
  if(b.loc==='drag') return {x:b.x,y:b.y};
  return {x:B.src.x,y:B.src.y};
}
function e3Hit(p){   // 纯命中：块在筒内走筒口取回区；否则块本体外扩10px（倒序无关，单块）
  var b=state.e3.block;
  if(b.loc==='cyl'){
    var C=L.e3.cyl,w=Math.max(30,C.h*0.18);
    return (Math.abs(p.x-C.x)<w/2+26&&p.y>C.y-C.h-30&&p.y<C.y+6);
  }
  if(b.loc==='drag') return false;
  var pos=e3BlockPos(),s=e3Side();
  return (p.x>=pos.x-s/2-10&&p.x<=pos.x+s/2+s*0.22+10&&p.y>=pos.y-s-10&&p.y<=pos.y+10);
}
/* R7 列吸附（替换旧小盒窄判据）：x 在盘/筒列内且高于落点即吸附落入 */
function overPan(p,pn){ return !!pn&&Math.abs(p.x-pn.x)<pn.r*1.6&&p.y<pn.y+10; }
function overCyl(p,cy){ return !!cy&&Math.abs(p.x-cy.x)<cy.r&&p.y<cy.baseY+10; }
function e3PanL(){ var B=L.e3.bal; return {x:B.g.panL.x,y:B.panTop,r:B.panHW}; }
function e3CylMouth(){ var C=L.e3.cyl; return {x:C.x,y:C.y-C.h,r:Math.max(30,C.h*0.18)/2+28,baseY:C.y}; }
function e3Drop(b){   // 放手：天平左盘列=称m / 量筒列=排水测V / 其它=回源位
  var B=L.e3,pn=e3PanL(),cy=e3CylMouth();
  if(overPan(b,pn)){
    b.loc='pan'; b.x=pn.x; b.y=B.bal.panTop; e3SetCyl(e3CylTargetFrac());
    if(!state.e3.mKnown){ state.e3.mKnown=true; if(window.playMatch)playMatch(); e3CheckBoth(); }
    else if(window.playDrop)playDrop();
  }else if(overCyl(b,cy)){
    b.loc='cyl'; b.x=B.cyl.x; b.y=B.cyl.y; e3SetCyl(e3CylTargetFrac());
    if(!state.e3.vKnown){ state.e3.vKnown=true; if(window.playMatch)playMatch(); e3CheckBoth(); }
    else if(window.playDrop)playDrop();
  }else{
    b.loc='source'; b.x=B.src.x; b.y=B.src.y; e3SetCyl(e3CylTargetFrac());
    if(window.playDrop)playDrop();
  }
  dirty=true; updatePanel(); updateHint();
}
function e3Tick(){   // rAF 推进：量筒水位插值 + 箭头汇聚计时 + 忽闪续帧
  var now=performance.now(),E=state.e3,bsy=false;
  if(E.cylTw){
    var p=clamp((now-E.cylTw.t0)/TWEEN_MS,0,1);
    E.cylFrac=E.cylTw.f0+(E.cylTw.f1-E.cylTw.f0)*easeInOut(p);
    if(p>=1){ E.cylFrac=E.cylTw.f1; E.cylTw=null; } else bsy=true;
  }
  if(E.arw){ if(now-E.arw.t0>=E3_CONV_MS){ e3AutoRecord(); E.arw=null; } else bsy=true; }
  if((E.mKnown||E.vKnown)&&!E.converged) bsy=true;   // 忽闪箭头需持续重绘
  return bsy;
}
/* ===== 场景二 E4：密度水槽（借鉴 PhET Intro；水位=基础+排水，浮沉 P6 规格） ===== */
var tankOK=false;   // water_tank sprite 就位标记（renderE4 每帧刷新）
function mkE4Block(preset,v,m,loc){
  return {preset:preset,mat:preset==='custom'?'styrofoam':preset,v:v,m:m,
    x:L.e4.tank.x,y:L.e4.benchY,loc:loc||'tank',tw:null,benchOn:null};   // benchOn=台面摞叠宿主（R32修4）
}
function e4Rho(b){ return b.m/b.v; }   // kg/L = ρ=m/V
/* R25 除根：浸没比一律按绘制位置派生（掉入/按住/松手/水面再动全同源，两路径不可能不一致） */
function e4SubFrac(b){   // 实际浸没比例=浸没高/边长：浸没高=clamp(块底y−水面y,0,side)；出缸横向域外=0
  if(b.loc!=='tank') return 0;
  var t=L.e4.tank,side=e4Side(b);
  if(Math.abs(b.x-t.x)>t.innerHalf) return 0;
  var surfY=tankSurfYAt(state.e4.lvl);
  return clamp((b.y-surfY)/side,0,1);
}
function e4Displaced(b){ return b.loc!=='tank'?0:b.v*e4SubFrac(b); }   // V排=浸没部分体积（按住全浸=V、漂浮=ρV、离水=0 自动统一）
function e4LvlTarget(){   // 目标水位=基础+Σ各块排水（摞叠两块同式求和，无特殊分支）
  var l=TANK_BASE_L;
  e4Blocks().forEach(function(b){ if(b) l+=e4Displaced(b); });
  return l;
}
function e4FinalY(b,lvlL){   // 物理终态：ρ<1漂浮（底=水面+浸没比×边长）/ ρ≥1沉底静止
  var rho=e4Rho(b),side=e4Side(b);
  if(rho<RHO_WATER) return tankSurfYAt(lvlL)+(rho/RHO_WATER)*side;
  return tankBotY();
}
function e4RestY(b){ return e4FinalY(b,e4LvlTarget()); }
function e4Splash(x){   // 入水微溅：记录涟漪（屏幕 x，水面 y 取当前水位；tankOK 才溅）
  if(!tankOK) return;
  state.e4.splashes.push({x:x,y:tankSurfYAt(state.e4.lvl),t0:performance.now()});
  if(state.e4.splashes.length>8) state.e4.splashes.shift();
}
function e4Settle(b,splash){   // 放手/改参数：漂浮→每帧动平衡派生+阻尼微晃偏移(R25) / 沉底→350ms 单调到池底（P6 禁回弹）
  var now=performance.now();
  b.tw=null; b.bob=null;
  if(e4Rho(b)>=RHO_WATER) b.tw={t0:now,y0:b.y,y1:tankBotY()};
  else if(b.loc==='tank') b.bob={t0:now,off0:b.y-e4FinalY(b,state.e4.lvl)};   // bob 只存偏移量，yEq 不快照（水面再动块必跟随）
  if(splash) e4Splash(b.x);
  dirty=true;
}
var e4LastNow=0;
function e4Tick(){   // rAF 推进：沉底单调 / 漂浮每帧由动平衡派生(R25) / 水位每帧重算+平滑 / 涟漪 cull（P1 禁跳变）
  var now=performance.now(),busy=false,E=state.e4,S=E.stack;
  var dtMs=e4LastNow?Math.min(64,now-e4LastNow):16; e4LastNow=now;
  var dragB=E.drag?E.drag.b:null;
  e4Blocks().forEach(function(b){
    if(!b||(S&&(b===S.top||b===S.bot))) return;   // 摞叠成员由锚点驱动
    if(b.tw){   // 沉底：单调 easeInOut 到池底
      var p=clamp((now-b.tw.t0)/TWEEN_MS,0,1);
      b.y=b.tw.y0+(b.tw.y1-b.tw.y0)*easeInOut(p);
      if(p>=1){ b.y=b.tw.y1; b.tw=null; } else { busy=true; dirty=true; }
      return;
    }
    if(b.loc!=='tank'||b===dragB) return;   // 按住中：y 跟手（pointermove 写入），排水按位置实时算
    if(e4Rho(b)<RHO_WATER){   // R25：漂浮块 y 每帧=当前水位平衡位+bob 衰减偏移（不限于静止分支）
      var yEq=e4FinalY(b,E.lvl),off=0;
      if(b.bob){
        var t=(now-b.bob.t0)/1000,T=E4_BOB_MS/1000;
        if(t>=T) b.bob=null;
        else { off=b.bob.off0*Math.exp(-t/E4_BOB_TAU)*Math.cos(E4_BOB_W*t); busy=true; dirty=true; }
      }
      var ny=yEq+off;
      if(Math.abs(b.y-ny)>0.005){ b.y=ny; dirty=true; }
    }
  });
  if(S){   // 摞叠刚体：漂浮=平衡+bob 偏移每帧派生 / 沉底=单调
    if(S.tw){
      var sp=clamp((now-S.tw.t0)/TWEEN_MS,0,1);
      S.y=S.tw.y0+(S.tw.y1-S.tw.y0)*easeInOut(sp);
      if(sp>=1){ S.y=S.tw.y1; S.tw=null; } else { busy=true; dirty=true; }
    }else{   // 漂浮摞叠：每帧=当前水位平衡位+bob 偏移（拖任一块前已 e4Unstack，锚点不会被拖走）
      var seq=e4StackEq(E.lvl).ybot,soff=0;
      if(S.bob){
        var st=(now-S.bob.t0)/1000,ST=E4_BOB_MS/1000;
        if(st>=ST) S.bob=null;
        else { soff=S.bob.off0*Math.exp(-st/E4_BOB_TAU)*Math.cos(E4_BOB_W*st); busy=true; dirty=true; }
      }
      var sny=seq+soff;
      if(Math.abs(S.y-sny)>0.005){ S.y=sny; dirty=true; }
    }
    e4StackPos();
  }
  var lt=e4LvlTarget();   // R25：水位每帧按绘制位置重算 + 指数平滑趋近（τ=90ms≈350ms 收敛，禁跳变）
  if(Math.abs(E.lvl-lt)>0.005){
    E.lvl+=(lt-E.lvl)*(1-Math.exp(-dtMs/90));
    if(Math.abs(E.lvl-lt)<=0.02) E.lvl=lt;
    busy=true; dirty=true;
  }
  if(E.splashes.length){
    var keep=E.splashes.filter(function(s){ return now-s.t0<E4_SPLASH_MS; });
    if(keep.length!==E.splashes.length) E.splashes=keep;
    if(E.splashes.length){ busy=true; dirty=true; }
  }
  return busy;
}
function drawE4Splash(){   // 入水微溅涟漪：3 圈外扩扁椭圆弧（水面透视），300ms 淡出
  var now=performance.now();
  ctx.save();
  state.e4.splashes.forEach(function(s){
    var p=clamp((now-s.t0)/E4_SPLASH_MS,0,1),a=1-p;
    for(var k=0;k<3;k++){
      var rr=(5+k*4)+p*(22+k*9);
      ctx.strokeStyle='rgba(255,255,255,'+(0.7*a*(1-k*0.22)).toFixed(3)+')';
      ctx.lineWidth=Math.max(0.6,1.7*(1-p)-k*0.3);
      ctx.beginPath(); ctx.ellipse(s.x,s.y,rr,rr*0.34,0,0,Math.PI*2); ctx.stroke();
    }
  });
  ctx.restore();
}
/* ===== E4.3 双块摞叠物理（PhET 同族·实算）：刚体摞叠 ρ̄=(mA+mB)/(VA+VB)，漂浮 V排=M/ρ水、沉底整块没 ===== */
function e4OtherBlock(b){ if(!state.e4.dual) return null; var d=state.e4.duals; return (b===d[0])?d[1]:((b===d[1])?d[0]:null); }
function e4OnTop(A,B){   // R32修1：水平重叠(0.85容差) + 释放在 B 顶面上方(≤顶面+10px) → 可摞（自由落下即摞，禁精确对准；旧 nearTop 下限窗已删）
  var sA=e4Side(A),sB=e4Side(B),bTopY=B.y-sB;
  return Math.abs(A.x-B.x)<=(sA+sB)/2*0.85 && A.y<bTopY+10;
}
function e4CanStack(A,B){   // A 摞到 B 上：'float'/'sink'/false（B 已沉底且 A 漂 → 不可摞，A 滑落）
  if(e4Rho(B)>=RHO_WATER&&e4Rho(A)<RHO_WATER) return false;
  var M=A.m+B.m,V=A.v+B.v;
  return (M/V<RHO_WATER)?'float':'sink';
}
function e4StackEq(lvlL){   // 摞叠平衡：底块底面屏幕 y（ybot）+ 是否沉底；缺省用终态水位，R16 跟随传入当前水位
  var S=state.e4.stack,A=S.top,B=S.bot,M=A.m+B.m,V=A.v+B.v;
  var lvl=(lvlL===undefined)?e4LvlTarget():lvlL,surfY=tankSurfYAt(lvl),sA=e4Side(A),sB=e4Side(B);
  if(M/V>=RHO_WATER) return {ybot:tankBotY(),sunk:true,surfY:surfY};
  var Vsub=M/RHO_WATER,hsub=(Vsub<=B.v)?sB*(Vsub/B.v):sB+sA*((Vsub-B.v)/A.v);
  return {ybot:surfY+hsub,sunk:false,surfY:surfY};
}
function e4StackPos(){   // 由摞叠锚点 S.y(底块底面) 派生两块位置（刚体：顶块底面中心=底块顶面平行四边形中心，R32修3 接触偏移）
  var S=state.e4.stack; if(!S) return;
  var sB=e4Side(S.bot),so=stackOffset(sB);
  S.bot.x=S.x; S.bot.y=S.y;
  S.top.x=S.x+so.x; S.top.y=S.y-sB+so.y;
}
function e4StackSettle(splash){   // 摞叠落定：漂浮=每帧平衡派生+bob 偏移 / 沉底=单调；两块个体动画清零改由摞叠驱动
  var S=state.e4.stack,eq=e4StackEq(state.e4.lvl),now=performance.now();
  S.top.tw=S.top.bob=S.bot.tw=S.bot.bob=null; S.tw=null; S.bob=null;
  if(eq.sunk) S.tw={t0:now,y0:S.y,y1:eq.ybot};
  else S.bob={t0:now,off0:S.y-eq.ybot};
  if(splash) e4Splash(S.x);
  e4StackPos(); dirty=true;
}
function e4StackReflow(){   // resize：摞叠锚点回域并按新几何snap到平衡（不动画）
  var S=state.e4.stack; if(!S) return;
  var t=L.e4.tank,sB=e4Side(S.bot);
  S.x=clamp(S.x,t.x-t.innerHalf+sB/2+2,t.x+t.innerHalf-sB/2-2);
  var eq=e4StackEq(); S.y=eq.ybot; S.tw=null; S.bob=null; e4StackPos();
}
function e4Unstack(grabbed){   // 拖走拆摞叠：grabbed→bench(离水)，另一块原位落定（此刻水位已排除 grabbed 才正确）
  var S=state.e4.stack; if(!S) return;
  var other=(grabbed===S.top)?S.bot:S.top;
  state.e4.stack=null;
  S.top.tw=S.top.bob=S.bot.tw=S.bot.bob=null;
  grabbed.loc='bench'; other.loc='tank';
  e4Settle(other,false);
}
function drawE4Block(b,isSel){
  var side=e4Side(b),sf=tankOK?e4SubFrac(b):0;
  PROPS.material_block(ctx,b.x,b.y,{size:side,mat:b.mat,label:state.showLabels?fmt(b.m,1)+' kg':null});   // R34 gate①：E4 块质量 label
  if(sf>0.003){   // 浸没部分叠淡蓝 tint 读作"在水中"（按实际浸没比裁剪，水槽前壁不透明素材的页面层补偿）
    var topY=b.y-side,subTop=b.y-sf*side;
    ctx.save();
    ctx.beginPath(); ctx.rect(b.x-side/2-2,subTop,side*1.25+4,b.y-subTop); ctx.clip();
    ctx.fillStyle='rgba(105,185,238,0.30)';
    ctx.fillRect(b.x-side/2-6,topY-14,side*1.3+12,side+28);
    ctx.restore();
  }
  if(isSel){   // R8 选中反馈轻量两件套（蔡总：橙色包围框太影响观感，删）：块体提亮 + 正下方 6px 灰蓝小三角指向块
    ctx.save();
    ctx.fillStyle='rgba(255,255,255,.10)';
    ctx.fillRect(b.x-side/2,b.y-side,side,side);
    ctx.fillStyle='#64748b';
    ctx.beginPath(); ctx.moveTo(b.x,b.y+6); ctx.lineTo(b.x-4,b.y+13); ctx.lineTo(b.x+4,b.y+13); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
function renderE4(){
  paintBg('#e8f1f8','#9aa8b8');
  var t=L.e4.tank,E=state.e4,bs=e4Blocks(),sel=bs[E.sel]||bs[0];
  tankOK=PROPS.spriteReady('water_tank');   // sprite 未就位不画水面附属（tint/水位线），防悬空
  if(E.stack) e4StackPos();   // 摞叠时块位由锚点派生（静态重绘也保持刚体）
  var scaleV=E.stack?((E.stack.top.m+E.stack.bot.m)/(E.stack.top.v+E.stack.bot.v)):(sel?e4Rho(sel):null);
  PROPS.density_scale(ctx,L.e4.scale.x,L.e4.scale.y,{w:L.e4.scale.w,value:scaleV});
  PROPS.water_tank(ctx,t.x,t.y,{h:t.h,water:clamp(E.lvl/TANK_FULL_L,0,1)});
  var order=bs.filter(Boolean).slice().sort(function(a,b){ return b.y-a.y; });   // R36：y 降序=屏幕下方（底块）先画，2.5D 画家算法接触面才干净
  order.forEach(function(b){ drawE4Block(b,b===sel); });
  if(!tankOK) return;
  drawE4Splash();   // 水面微溅涟漪（入水瞬间）
  var surfY=tankSurfYAt(E.lvl);   // 水位标签：红线刻+实时读数（R8：文字抬到水面线上方16px+白底胶囊，与水面线/缸壁分离；x 域内 clamp 右留白≥8px）
  ctx.strokeStyle='rgba(220,38,38,0.8)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(t.x+t.w/2+6,surfY); ctx.lineTo(t.x+t.w/2+26,surfY); ctx.stroke();
  ctx.font='600 14px sans-serif'; ctx.textAlign='left';
  var ltxt='水位 '+fmt(E.lvl,1)+' L',ltw=ctx.measureText(ltxt).width;
  var lcy=surfY-16,lx=t.x+t.w/2+30,capW=ltw+12,capH=20;
  if(lx+capW>W-8) lx=Math.max(8,W-8-capW);
  rrPath(lx-6,lcy-capH/2,capW,capH,capH/2);
  ctx.fillStyle='rgba(255,255,255,.82)'; ctx.fill();
  ctx.strokeStyle='#cbd5e1'; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle='#b91c1c';
  ctx.fillText(ltxt,lx,lcy+5);
}
function e4Hit(p){   // 纯命中（无副作用），返回 index 或 -1
  var bs=e4Blocks();
  for(var i=bs.length-1;i>=0;i--){
    var b=bs[i]; if(!b) continue;
    var s=e4Side(b);
    if(p.x>=b.x-s/2-8&&p.x<=b.x+s/2+s*0.22+8&&p.y>=b.y-s-8&&p.y<=b.y+8) return i;
  }
  return -1;
}
function E4SelSet(i){
  if(state.e4.sel!==i){ state.e4.sel=i; dirty=true; updatePanel(); syncE4Ctrl(); updateHint(); }
}
/* R32修4：E4 台面停驻禁相交——落点与已有台面块水平重叠(修1容差)→摞其上(benchOn 链式算列顶+修3接触偏移)；仅视觉重叠→推到最近不重叠侧 */
function e4BenchTop(o){   // 台面列顶：顺 benchOn 链上溯
  var top=o,bs=e4Blocks(),again=true;
  while(again){ again=false;
    for(var i=0;i<bs.length;i++){ var q=bs[i];
      if(q&&q!==top&&q.loc==='bench'&&q.benchOn===top){ top=q; again=true; break; } } }
  return top;
}
function e4BenchPlace(b){
  var sA=e4Side(b),host=null,push=null;
  e4Blocks().forEach(function(o){
    if(!o||o===b||o.loc!=='bench'||o.benchOn) return;   // 只与列底比（列顶由链上溯）
    var sO=e4Side(o),dx=Math.abs(b.x-o.x);
    if(dx<=(sA+sO)/2*0.85) host=e4BenchTop(o);
    else if(!push&&dx<(sA+sO)/2+2) push=o;
  });
  if(host){
    b.benchOn=host;
    var so=stackOffset(e4Side(host));
    b.x=host.x+so.x; b.y=host.y-e4Side(host)+so.y;
  }else{
    b.benchOn=null; b.y=L.e4.benchY;
    if(push){ var sP=e4Side(push);
      b.x=clamp(push.x+(b.x<push.x?-1:1)*((sA+sP)/2+2),50,W-50); }
  }
}
function e4BenchRefresh(){   // 改参数致边长变化后重摆台面摞叠链
  e4Blocks().forEach(function(b){
    if(!b||b.loc!=='bench'||!b.benchOn) return;
    var h=b.benchOn;
    if(h.loc==='bench'){ var so=stackOffset(e4Side(h)); b.x=h.x+so.x; b.y=h.y-e4Side(h)+so.y; }
    else { b.benchOn=null; b.y=L.e4.benchY; }
  });
}
function e4Drop(b,px,py){   // 放手：摞到另块顶=摞叠 / 入水=浮沉(+微溅) / 台面=静置或摞上已有台面块（R32修4，可再拖）
  var t=L.e4.tank,s=e4Side(b),other=e4OtherBlock(b);
  b.tw=null; b.bob=null;
  if(other&&other.loc==='tank'&&!state.e4.stack&&e4OnTop(b,other)){   // E4.3 摞叠判定
    var kind=e4CanStack(b,other);
    if(kind){
      b.loc='tank';
      state.e4.stack={top:b,bot:other,x:other.x,y:other.y};
      e4StackSettle(true);
      if(window.playDrop) playDrop();
      updatePanel(); updateHint(); dirty=true; return;
    }
    b.loc='tank';   // 唯一物理例外（R32修2）：底块已沉底且本块漂→浮力托起，侧向滑脱上浮，hint 解释一句
    hintOverride='漂浮的块摞不到已沉底的块顶上——浮力把它托起滑脱了。其余组合都能摞：大摞小、小摞大、双浮、双沉';
    var dirx=(b.x<other.x?-1:1),sO=e4Side(other);
    b.x=clamp(other.x+dirx*(sO/2+s/2+8),t.x-t.innerHalf+s/2+2,t.x+t.innerHalf-s/2-2);
    e4Settle(b,true);
    if(window.playDrop) playDrop();
    updatePanel(); updateHint(); dirty=true; return;
  }
  if(Math.abs(b.x-t.x)<t.innerHalf&&b.y>t.y-t.h-80&&b.y<t.y+10){
    b.loc='tank';
    b.x=clamp(b.x,t.x-t.innerHalf+s/2+2,t.x+t.innerHalf-s/2-2);
    e4Settle(b,true);
  }else{
    b.loc='bench'; b.y=L.e4.benchY; b.x=clamp(b.x,50,W-50);   // 水位每帧由 e4Tick 重算趋近，无需快照
    e4BenchPlace(b);   // R32修4：重叠→摞其上 / 视觉相交→推开，禁相交停驻
  }
  if(window.playDrop) playDrop();
  dirty=true; updatePanel(); updateHint();
}
function e4Sel(){ return e4Blocks()[state.e4.sel]||e4Blocks()[0]; }
function e4ApplyPreset(preset){   // 预设=体积自由、质量派生 m=ρV（P3 联动公式单点）；自定义=双自由
  var b=e4Sel(); if(!b) return;
  b.preset=preset;
  if(preset==='custom'){ b.mat='styrofoam'; }
  else { b.mat=preset; b.m=E4_RHO[preset]*b.v; }
  e4AfterChange();
}
function e4AfterChange(){
  var b=e4Sel(); if(!b) return;
  var S=state.e4.stack;
  if(S&&e4CanStack(S.top,S.bot)===false){   // 改参数致不可摞 → 拆散，两块均留水中各自落定
    var A=S.top,B=S.bot;
    state.e4.stack=null; A.tw=A.bob=B.tw=B.bob=null;
    A.loc='tank'; B.loc='tank';
    e4Settle(A,false); e4Settle(B,false);
    syncE4Ctrl(); dirty=true; updatePanel(); updateHint(); return;
  }
  if(S) e4StackSettle(false);
  else if(b.loc==='tank') e4Settle(b);   // 台面块只等每帧水位重算，无快照
  e4BenchRefresh();   // R32修4：边长变化后台面摞叠链重摆
  syncE4Ctrl(); dirty=true; updatePanel(); updateHint();
}
function e4ToggleDual(){   // 单块/双块切换钮（右下常驻；命名走「场景」用语）
  var E=state.e4;
  E.dual=!E.dual;
  if(E.dual){
    // 开场默认摆「同体积异质量」认知冲突：木2kg/5L漂浮 vs 铝13.5kg/5L沉底，不配文字
    E.duals=[mkE4Block('wood',5,2,'tank'),mkE4Block('aluminum',5,13.5,'tank')];
    E.duals[0].x=L.e4.tank.x-L.e4.tank.innerHalf*0.5;
    E.duals[1].x=L.e4.tank.x+L.e4.tank.innerHalf*0.5;
    E.duals[0].y=E.duals[1].y=L.e4.benchY-L.e4.tank.h*0.75;
    E.lvl=TANK_BASE_L; E.sel=0; E.stack=null;
    E.duals.forEach(function(b){ e4Settle(b,true); });
  }else{
    E.duals=null;
    var b=E.single;
    if(b.loc==='tank') e4Settle(b); else e4AfterChange();
  }
  syncE4Ctrl(); updateHint(); updatePanel(); dirty=true;
  if(window.playClick) playClick();
}
function resetE4(){   // 初始态：单块木预设（0.4kg/L×5L=2kg）静置漂浮、水位102L
  var E=state.e4;
  E.dual=false; E.duals=null; E.sel=0; E.drag=null; E.splashes=[]; E.stack=null;
  E.single=mkE4Block('wood',5,2,'tank');
  E.lvl=TANK_BASE_L+E.single.v*e4Rho(E.single);   // 平衡水位=100+Vρ（漂浮解析终态）
  E.single.y=e4FinalY(E.single,E.lvl); E.single.tw=null; E.single.bob=null;
  syncE4Ctrl(); updatePanel(); updateHint(); dirty=true;
}
/* ===== 场景三 E5：物质鉴别（借鉴 PhET Mystery；单位一档 kg/L，数值=g/cm³，1 g/cm³=1×10³ kg/m³） ===== */
var E5_INCOL={gold:'#e6b422',copper:'#b0683a',iron:'#5b6068',aluminum:'#c9ced5',ice:'rgba(190,222,240,0.92)',wood:'#c89b5f'};
function e5CylW(){   // 量筒水量 mL = 基础 + Σ入筒块体积（水位差=V）
  var w=E5_CYL_BASE;
  state.e5.blocks.forEach(function(b){ if(b.loc==='cyl') w+=b.v*1000; });
  return w;
}
function e5CylTargetFrac(){ return clamp(e5CylW()/E5_CYL_CAP,0,1); }
function e5SetCyl(f1){ state.e5.cylTw={t0:performance.now(),f0:state.e5.cylFrac,f1:f1}; dirty=true; }
var qSeed=7;
function e5Rnd(){ qSeed+=13; return PROPS.rand(qSeed); }   // 出题抽池走库内确定性伪随机（seed 每轮递增）
function genE5(){   // 出题：密度表值池随机抽3材质×随机体积(1-5L整数)反推质量（所有 ρ 出自教材三表，禁表外值）
  qSeed=Math.floor(Date.now()%99991)+7;
  var pool=E5_POOL.slice(),bs=[],i,j,tp;
  for(i=pool.length-1;i>0;i--){ j=Math.floor(e5Rnd()*(i+1)); tp=pool[i];pool[i]=pool[j];pool[j]=tp; }
  var mats=[],vols=[];   // R32修4：先抽满三题体积→按本题最大块边长重算 spot 间距→再摆块
  for(i=0;i<3;i++){ mats.push(pool[i]); vols.push(1+Math.floor(e5Rnd()*5)); }
  e5ComputeSpots(Math.max.apply(null,vols));
  for(i=0;i<3;i++){
    bs.push({id:i+1,mat:mats[i],v:vols[i],m:Math.round(RHO[mats[i]]*vols[i]*100)/100,
      mKnown:false,vKnown:false,revealed:false,solved:false,guess:'',verdict:'',vok:'',
      loc:'bench',x:L.e5.spot[i],y:L.e5.benchY,stackOn:null});
  }
  state.e5.blocks=bs; state.e5.sel=0;
  state.e5.cylFrac=E5_CYL_BASE/E5_CYL_CAP; state.e5.cylTw=null;
  syncE5Sel(); dirty=true;
}
function newE5(){   // 重新出题：题组淡出/淡入各300ms（中途换题）
  state.e5.fade={t0:performance.now(),done:false};
  dirty=true;
  if(window.playClick) playClick();
}
function e5Tick(){
  var now=performance.now(),busy=false,E=state.e5;
  if(E.cylTw){
    var p=clamp((now-E.cylTw.t0)/TWEEN_MS,0,1);
    E.cylFrac=E.cylTw.f0+(E.cylTw.f1-E.cylTw.f0)*easeInOut(p);
    if(p>=1) E.cylTw=null; else { busy=true; dirty=true; }
  }
  if(E.fade){
    var q=clamp((now-E.fade.t0)/600,0,1);
    if(q>=0.5&&!E.fade.done){ E.fade.done=true; genE5(); }
    if(q>=1) E.fade=null; else { busy=true; dirty=true; }
  }
  return busy;
}
function e5Sel(){ return state.e5.blocks[state.e5.sel]||state.e5.blocks[0]; }
/* R28：E5 摞放（禁重合叠影）——stackOn 链派生位置，绘制前解析 */
function e5ById(id){ var r=null; state.e5.blocks.forEach(function(o){ if(o.id===id) r=o; }); return r; }
function e5Anchor(b,seen){   // bench 块由 stackOn 链派生落位（宿主顶面中心）；断链/成环自清回落桌面语义由释放分支兜底
  if(b.loc!=='bench'||!b.stackOn) return;
  var o=e5ById(b.stackOn);
  if(!o||o===b||o.loc!=='bench'||(seen&&seen.indexOf(o)>=0)){ b.stackOn=null; b.y=L.e5.benchY; return; }
  e5Anchor(o,(seen||[b]).concat([o]));
  var so=stackOffset(e5Side(o));   // R32修3：顶块底面中心=宿主顶面平行四边形中心
  b.x=o.x+so.x; b.y=o.y-e5Side(o)+so.y;
}
function e5Hit(p){   // 纯命中（无副作用），返回 index 或 -1
  var bs=state.e5.blocks;
  for(var i=bs.length-1;i>=0;i--){
    var b=bs[i],s=e5Side(b);
    if(b.loc==='cyl') continue;   // 筒内块由筒口命中区取回
    var bx=b.x,by=(b.loc==='pan')?L.e5.bal.panTop:b.y;
    if(p.x>=bx-s/2-8&&p.x<=bx+s/2+s*0.22+8&&p.y>=by-s-8&&p.y<=by+8) return i;
  }
  return -1;
}
function e5CylHit(p){   // 点筒口取回筒内块
  var C=L.e5.cyl,w=Math.max(30,C.h*0.18);
  var b=state.e5.blocks.filter(function(o){ return o.loc==='cyl'; })[0];
  if(!b) return null;
  if(Math.abs(p.x-C.x)<w/2+24&&p.y>C.y-C.h-30&&p.y<C.y) return b;
  return null;
}
function renderE5(){
  paintBg('#e8f1f8','#9aa8b8');
  var E=state.e5,B=L.e5,now=performance.now();
  var alpha=1;
  if(E.fade){ var fp=clamp((now-E.fade.t0)/600,0,1); alpha=fp<0.5?1-fp*2:(fp-0.5)*2; }
  var cylB=E.blocks.filter(function(o){ return o.loc==='cyl'; })[0];
  var panB=E.blocks.filter(function(o){ return o.loc==='pan'; })[0];
  // 托盘天平（简化读数态：称量即读数，砝码堆示意）+ 砝码盒（R19：盒位/盒宽读 layout 常量）
  PROPS.weight_set(ctx,B.boxX,B.benchY,{w:B.boxW,open:true});
  PROPS.balance_pan(ctx,B.bal.x,B.bal.y,{h:B.bal.h,tilt:0,riderShow:false,
    panL:function(c,cx,py){ if(panB&&!(E.drag&&E.drag.b===panB)) drawE5BlockOn(c,cx,py,panB); },   // R24：py=盘心，神秘块底面中心坐盘心
    panR:function(c,cx,py,panR){ if(panB) drawPanWeights(c,cx,py,panR,[20,20,10]); }
  });
  if(panB){
    ghostCard(B.bal.x-96,B.bal.y+16,192,30);
    ctx.fillStyle='#1e293b'; ctx.font='600 14px sans-serif'; ctx.textAlign='center';
    ctx.fillText('称量读数  m = '+fmt(panB.m,2)+' kg',B.bal.x,B.bal.y+36);
  }
  // 量筒（排水测 V：水位连续插值；漂浮材质走 R15 系线悬浮全浸，沉底材质沿用 inside 占位）
  var cylFloat=cylB&&RHO[cylB.mat]<RHO_WATER;
  PROPS.cylinder_grad(ctx,B.cyl.x,B.cyl.y,{h:B.cyl.h,cap:E5_CYL_CAP,div:E5_CYL_DIV,
    water:E.cylFrac,inside:(cylB&&!cylFloat)?(cylB.revealed?E5_INCOL[cylB.mat]:'#9ca3af'):null});
  if(cylFloat) drawCylTether(B.cyl,E.cylFrac,cylB.revealed?E5_INCOL[cylB.mat]:'#9ca3af');
  var vTxt=cylB?('V = '+fmt((e5CylW()-E5_CYL_BASE)/1000,1)+' L（水位差）'):('底水 '+(E5_CYL_BASE/1000)+' L');
  ghostCard(B.cyl.x-86,B.cyl.y-B.cyl.h-44,172,30);
  ctx.fillStyle='#1e293b'; ctx.font='600 14px sans-serif'; ctx.textAlign='center';
  ctx.fillText(vTxt,B.cyl.x,B.cyl.y-B.cyl.h-24);
  // 台面神秘块（mystery「?」；揭晓后显真实材质色）
  ctx.save(); ctx.globalAlpha=alpha;
  E.blocks.forEach(function(b){   // R36：anchor 解析与绘制分离——先全部按 stackOn 链派生落位（R28 禁重合叠影）
    if(E.drag&&E.drag.b===b) return;
    if(b.loc==='pan'||b.loc==='cyl') return;   // 盘上块走 panL 挂载；筒内块由 inside 占位色呈现
    e5Anchor(b);
  });
  var order5=E.blocks.filter(function(b){   // R36：y 降序=屏幕下方（底块）先画，颠倒摞叠接触面同正确
    if(E.drag&&E.drag.b===b) return false;
    return b.loc!=='pan'&&b.loc!=='cyl';
  }).slice().sort(function(a,b){ return b.y-a.y; });
  order5.forEach(function(b){
    drawE5BlockOn(ctx,b.x,b.y,b);
  });
  if(E.drag&&E.drag.b) drawE5BlockOn(ctx,E.drag.b.x,E.drag.b.y,E.drag.b);
  ctx.restore();
}
function drawE5BlockOn(c,x,yb,b){   // (x,yb)=底面中心（第13条锚点），调用方决定落位
  var s=e5Side(b),E=state.e5;
  PROPS.material_block(c,x,yb,{size:s,mat:b.mat,mystery:!b.revealed});   // 神秘块「?」在库内绘制，非标注不 gate（R34）
  if(state.showLabels){   // R34 gate②：E5 块编号标签
    c.fillStyle='#1e293b'; c.font='600 13px sans-serif'; c.textAlign='center';
    c.fillText('块'+b.id+(b.revealed?' · '+MATCN[b.mat]:''),x,yb-s-14);
  }
  if(E.blocks[E.sel]===b){   // R8/R9 同款轻量选中反馈（橙色包围框删净）：块体提亮 + 正下方灰蓝小三角
    c.save();
    c.fillStyle='rgba(255,255,255,.10)';
    c.fillRect(x-s/2,yb-s,s,s);
    c.fillStyle='#64748b';
    c.beginPath(); c.moveTo(x,yb+6); c.lineTo(x-4,yb+13); c.lineTo(x+4,yb+13); c.closePath(); c.fill();
    c.restore();
  }
}
function e5Drop(b){   // 放手：天平区=称m / 量筒区=排水测V（优先）/ 命中另块顶=摞上（R28）/ 其它=回台面
  var B=L.e5,C=B.cyl;
  var panLx=B.bal.g.panL.x;
  b.tw=null;
  if(Math.abs(b.x-panLx)<B.bal.panHW+34&&Math.abs(b.y-B.bal.panTop)<B.bal.h*0.42){
    b.loc='pan'; b.mKnown=true; b.x=panLx; b.y=B.benchY; b.stackOn=null;
    if(window.playDrop) playDrop();
  }else if(Math.abs(b.x-C.x)<Math.max(30,C.h*0.18)/2+26&&b.y>C.y-C.h-60&&b.y<C.y+10){
    state.e5.blocks.forEach(function(o){ if(o!==b&&o.loc==='cyl'){ o.loc='bench'; o.stackOn=null; o.x=L.e5.spot[o.id-1]; o.y=B.benchY; } });
    b.loc='cyl'; b.vKnown=true; b.x=C.x; b.y=B.benchY; b.stackOn=null;
    e5SetCyl(e5CylTargetFrac());
    if(window.playDrop) playDrop();
  }else{
    var sA=e5Side(b),host=null;   // R32修1 摞放判定：水平重叠(0.85容差)+释放在列顶顶面上方(≤顶面+10px)，自由落下即摞、禁精确对准（旧 ±30px 竖窗已删）
    state.e5.blocks.forEach(function(o){
      if(host||o===b||o.loc!=='bench') return;
      var hasTop=state.e5.blocks.some(function(q){ return q!==b&&q.stackOn===o.id&&q.loc==='bench'; });
      if(hasTop) return;   // 链式取列顶
      var sO=e5Side(o);
      if(Math.abs(b.x-o.x)<=(sA+sO)/2*0.85&&b.y<o.y-sO+10) host=o;
    });
    if(host){ var so=stackOffset(e5Side(host));   // R32修3：落定=顶面平行四边形中心
      b.loc='bench'; b.stackOn=host.id; b.x=host.x+so.x; b.y=host.y-e5Side(host)+so.y;
    }else{
      b.loc='bench'; b.stackOn=null; b.y=B.benchY;
      var bx=clamp(b.x,50,W*0.72);   // R32修4：禁相交停驻——与台面列底视觉重叠→推到最近不重叠侧（两轮防连环）
      for(var pass=0;pass<2;pass++) state.e5.blocks.forEach(function(o){
        if(o===b||o.loc!=='bench'||o.stackOn) return;
        var sO=e5Side(o),dx=bx-o.x;
        if(Math.abs(dx)<(sA+sO)/2+2) bx=clamp(o.x+(dx<0?-1:1)*((sA+sO)/2+2),50,W*0.72);
      });
      b.x=bx;
    }
    if(window.playDrop) playDrop();
  }
  syncE5Sel(); dirty=true; updatePanel(); updateHint();
}
function syncE5Sel(){   // 选中块联动：鉴别下拉/判定随块走
  var b=e5Sel(),sm=document.getElementById('sel-e5mat');
  if(sm) sm.value=b?b.guess:'';
  updatePanel(); updateHint();
}
/* R9 判错反馈：错误提示音（SFX.tone 页面内合成，禁改 sfx.js）+ 提交钮红光晃两下 */
function playWrong(){
  if(window.SFX&&SFX.tone){ SFX.tone(196,'square',0.12,0.12); SFX.tone(147,'square',0.20,0.12,0.10); }
}
var wrongT=null;
function shakeSubmit(){   // 挂 #btn-submit.wrong（html：红光 box-shadow + btnWrong 晃动×2 = .40s×2）
  var el=document.getElementById('btn-submit'); if(!el) return;
  el.classList.remove('wrong');
  void el.offsetWidth;   // 强制 reflow，连点也能重启动画
  el.classList.add('wrong');
  clearTimeout(wrongT);
  wrongT=setTimeout(function(){ el.classList.remove('wrong'); },820);   // 两次动画=0.40s×2
}
function submitE5(){   // 提交判定：对=✓揭晓材质色；错=错误音+提交钮红光晃动，不给答案可重试
  var b=e5Sel(); if(!b) return;
  if(b.solved){ b.verdict='已鉴别：'+MATCN[b.mat]; b.vok='ok'; updatePanel(); return; }
  if(!b.mKnown||!b.vKnown){ b.verdict='先称质量、再测体积'; b.vok='no'; toast('先把块'+b.id+'放上天平称 m，再投入量筒测 V'); updatePanel(); return; }
  if(!b.guess){ b.verdict='先查密度表选材质'; b.vok='no'; hintOverride='先在下方选一个材质'; playWrong(); shakeSubmit(); updatePanel(); updateHint(); return; }
  if(b.guess===b.mat){
    b.solved=true; b.revealed=true;
    b.verdict='✓ 正确！块'+b.id+'是'+MATCN[b.mat]; b.vok='ok';
    if(window.playMatch) playMatch();
  }else{
    b.verdict='✗ 再算算密度'; b.vok='no';
    playWrong(); shakeSubmit();
  }
  dirty=true; updatePanel(); updateHint();
}
/* ===== 全局：DOM 引用 + draw 派发 + 场景切换飞入飞出 + 指针路由 ===== */
var selE4mat=document.getElementById('sel-e4mat');
var rngV=document.getElementById('rng-v'),rngM=document.getElementById('rng-m');
var lblV=document.getElementById('lbl-v'),lblM=document.getElementById('lbl-m');
var btnDual=document.getElementById('btn-dual');
var btnTable=document.getElementById('btn-table'),btnDtable=document.getElementById('btn-dtable');
var SCENES=['e3','e4','e5'];
function renderScene(s){ ctx.save(); if(s==='e3')renderE3(); else if(s==='e4')renderE4(); else renderE5(); ctx.restore(); }
function draw(){
  ctx.clearRect(0,0,W,H);
  var a=state.anim;
  if(!a){ renderScene(state.scene); }
  else{   // 飞入飞出：离场 -H·e、入场 +H(1-e) 归位，两向对称（第24条①）
    var e=easeInOut(clamp((performance.now()-a.t0)/ANIM_DUR,0,1));
    ctx.save(); ctx.translate(0,-H*e); renderScene(a.from); ctx.restore();
    ctx.save(); ctx.translate(0,H*(1-e)); renderScene(a.to); ctx.restore();
  }
  updatePanel();
}
function syncGroups(){
  var s=state.scene;
  document.getElementById('grp-mat').classList.toggle('flyout',s!=='e3');
  document.getElementById('grp-size').classList.toggle('flyout',s!=='e3');
  ['grp-e4mat','grp-e4mv','grp-e4blk'].forEach(function(id){
    document.getElementById(id).classList.toggle('flyout',s!=='e4');
  });
  document.getElementById('grp-e5').classList.toggle('flyout',s!=='e5');
  SCENES.forEach(function(k){
    document.getElementById('sec-'+k).style.display=(s===k)?'block':'none';
    document.getElementById('btn-scene-'+k).classList.toggle('on',s===k);
  });
}
function switchScene(to){
  if(state.animating||to===state.scene) return;
  state.anim={from:state.scene,to:to,t0:performance.now()};   // animating 期间锁全部输入
  state.scene=to; state.animating=true;
  hideToast(); syncGroups(); placeHint(); repositionPanels(); updateHint();
  if(window.playClick) playClick();
  dirty=true;
}
function ptOf(ev){ var r=cv.getBoundingClientRect(); return {x:ev.clientX-r.left,y:ev.clientY-r.top}; }
var lastTick=0;
cv.addEventListener('pointerdown',function(ev){
  if(state.animating) return;
  var p=ptOf(ev);
  if(state.scene==='e3'){
    if(e3Hit(p)){
      var b3=state.e3.block,pos=e3BlockPos();
      state.e3.drag={b:b3,dx:pos.x-p.x,dy:pos.y-p.y};
      b3.loc='drag'; b3.x=pos.x; b3.y=pos.y;
      if(window.playPick) playPick();
      try{ cv.setPointerCapture(ev.pointerId); }catch(err){}
      dirty=true; updateHint();
    }
  }else if(state.scene==='e4'){
    var i=e4Hit(p);
    if(i>=0){
      E4SelSet(i);
      var b=e4Blocks()[i];
      if(state.e4.stack&&(b===state.e4.stack.top||b===state.e4.stack.bot)) e4Unstack(b);   // E4.3 拆开摞叠
      e4Blocks().forEach(function(o){   // R32修4：拖走台面摞叠底块→顶块塌落桌面
        if(o&&o!==b&&o.benchOn===b){ o.benchOn=null; o.y=L.e4.benchY; if(window.playDrop) playDrop(); }
      });
      b.benchOn=null;   // 拖走顶块→自身脱链，松手按落点重新判定
      state.e4.drag={b:b,dx:b.x-p.x,dy:b.y-p.y};
      b.tw=null; b.bob=null;   // R25：按住中 loc 保持 tank——y 跟手、排水按 e4SubFrac 实时算（按住全浸水位连续升到 100+V）
      if(window.playPick) playPick();
      try{ cv.setPointerCapture(ev.pointerId); }catch(err){}
      dirty=true; updatePanel(); updateHint();
    }
  }else if(state.scene==='e5'){
    var cb=e5CylHit(p);
    var j=cb?-1:e5Hit(p);
    var b5=cb||(j>=0?state.e5.blocks[j]:null);
    if(b5){
      if(j>=0) state.e5.sel=j;
      state.e5.blocks.forEach(function(o){   // R28：拖走底块→其上摞块塌落桌面；拖走顶块→自身 stackOn 清空
        if(o!==b5&&o.stackOn===b5.id){ o.stackOn=null; o.y=L.e5.benchY; if(window.playDrop) playDrop(); }
      });
      b5.stackOn=null;
      var bx=(b5.loc==='pan')?L.e5.bal.g.panL.x:b5.x;
      var by=(b5.loc==='pan')?L.e5.bal.panTop:b5.y;
      if(cb){ cb.loc='bench'; cb.y=L.e5.benchY; e5SetCyl(e5CylTargetFrac()); bx=p.x; by=p.y; }
      state.e5.drag={b:b5,dx:bx-p.x,dy:by-p.y};
      b5.x=p.x+(bx-p.x); b5.y=p.y+(by-p.y);
      syncE5Sel();
      if(window.playPick) playPick();
      try{ cv.setPointerCapture(ev.pointerId); }catch(err){}
      dirty=true;
    }
  }
});
cv.addEventListener('pointermove',function(ev){
  if(state.animating) return;
  var p=ptOf(ev);
  var dr=(state.scene==='e3')?state.e3.drag:((state.scene==='e4')?state.e4.drag:(state.scene==='e5'?state.e5.drag:null));
  if(dr&&dr.b){
    dr.b.x=p.x+dr.dx; dr.b.y=p.y+dr.dy;
    var now=performance.now();
    if(window.playTick&&now-lastTick>110){ lastTick=now; playTick(); }
    dirty=true;
  }else{
    var hov=(state.scene==='e3')?e3Hit(p):((state.scene==='e4')?e4Hit(p)>=0:(state.scene==='e5'?(e5Hit(p)>=0||!!e5CylHit(p)):false));
    cv.style.cursor=hov?'pointer':'default';
  }
});
function endDrag(){
  if(state.e3.drag){ var b3=state.e3.drag.b; state.e3.drag=null; e3Drop(b3); }
  if(state.e4.drag){ var b=state.e4.drag.b; state.e4.drag=null; e4Drop(b); }
  if(state.e5.drag){ var b5=state.e5.drag.b; state.e5.drag=null; e5Drop(b5); }
  dirty=true;
}
window.addEventListener('pointerup',endDrag);
window.addEventListener('pointercancel',endDrag);
/* ===== 控制栏同步 ===== */
function setText(id,t){ var el=document.getElementById(id); if(el&&el.textContent!==t) el.textContent=t; }
function syncE3Btns(){
  ['aluminum','iron','wood'].forEach(function(m){
    var el=document.getElementById('btn-mat-'+m);
    if(el) el.classList.toggle('on',state.e3.mat===m);
  });
  E3_VOLS.forEach(function(v){
    var el=document.getElementById('btn-v'+v);
    if(el) el.classList.toggle('on',state.e3.v===v);
  });
}
function syncE4Ctrl(){
  var b=e4Sel(); if(!b) return;
  if(selE4mat) selE4mat.value=b.preset;
  var custom=b.preset==='custom';
  if(rngV) rngV.value=b.v;
  if(lblV) lblV.textContent='V = '+fmt(b.v,1)+' L';
  if(rngM){ rngM.disabled=!custom; rngM.value=clamp(b.m,E4_MMIN,E4_MMAX); }
  if(lblM) lblM.textContent='m = '+fmt(b.m,1)+' kg';   // R17：ρV 派生括号后缀已删，预设/自定义同一显示
  if(btnDual) btnDual.classList.toggle('on',state.e4.dual);
}
/* ===== 读数面板/记录表/密度表（幽灵化浮层，openPanel 单入口互斥） ===== */
/* ===== 通则B：pickSlot 面板自适应选空位（蔡总：自行判定屏幕哪里有空位，禁钉死一处） ===== */
function rectInterArea(a,r){
  var x0=Math.max(a.x,r.x),y0=Math.max(a.y,r.y),x1=Math.min(a.x+a.w,r.x+r.w),y1=Math.min(a.y+a.h,r.y+r.h);
  return (x1>x0&&y1>y0)?(x1-x0)*(y1-y0):0;
}
function pickSlot(needW,needH,avoidRects){   // 候选槽：左上→右上→左下(控制栏上方)→右下(控制栏上方)；取首个零相交，全相交取重叠面积最小
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
function balAvoidRect(B){   // 天平器材包围盒（PROPS.balGeom 同源：横梁+挂盘横展，panDx+panHW 为最外缘）
  var g=B.g,halfW=B.panDx+B.panHW+6,y0=g.beamY-B.h*0.08;
  return {x:B.x-halfW,y:y0,w:halfW*2,h:(B.y+4)-y0};
}
function sceneAvoidRects(scene){   // 避让矩形一律取自 L.e3/L.e4/L.e5 实际绘制区常量（禁像素猜测）+ hint + 控制栏
  var rs=[{x:0,y:H-ctrlBandH,w:W,h:ctrlBandH+40}];
  var hr=hintRectCanvas(); if(hr) rs.push(hr);
  if(scene==='e3'){
    var P=L.e3.panel,C=L.e3.cyl;
    rs.push({x:P.x0,y:P.y0,w:P.x1-P.x0,h:P.y1-P.y0});          // 右侧记录表+作图板整区
    rs.push(balAvoidRect(L.e3.bal));                             // 天平
    rs.push({x:C.x-100,y:C.y-C.h-46,w:200,h:C.h+50});           // 量筒+读数牌
  }else if(scene==='e4'){
    var t=L.e4.tank,sc=L.e4.scale;
    rs.push({x:t.x-t.w/2-8,y:t.y-t.h-8,w:t.w+16,h:t.h+16});     // 水槽包围盒
    rs.push({x:sc.x-sc.w/2-8,y:sc.y-34,w:sc.w+16,h:68});        // 密度标尺
  }else{
    var C5=L.e5.cyl,sp=L.e5.spot;
    rs.push(balAvoidRect(L.e5.bal));                             // 天平
    rs.push({x:C5.x-90,y:C5.y-C5.h-48,w:180,h:C5.h+52});        // 量筒+读数牌
    rs.push({x:sp[0]-46,y:L.e5.benchY-70,w:(sp[2]-sp[0])+92,h:74});   // 神秘块器材区
    var dEl=document.getElementById('panel-dtable');             // 密度表卡：右上固定本位恒避让（开=DOM实测，合=按CSS本位估算）→ 读数面板自然落左上
    if(dEl&&dEl.classList.contains('show')){
      var dr=dEl.getBoundingClientRect(),wr=cv.getBoundingClientRect();
      rs.push({x:dr.left-wr.left,y:dr.top-wr.top,w:dr.width,h:dr.height});
    }else{
      var dw=Math.min(246,Math.max(180,Math.round(W*0.26)));
      rs.push({x:W-12-dw,y:12,w:dw,h:360});
    }
  }
  return rs;
}
function placeReadPanel(){   // pickSlot 实选写入 left/top（清 right/bottom 内联），面板实测尺寸
  var el=document.getElementById('panel-read'); if(!el) return null;
  var slot=pickSlot(el.offsetWidth||280,el.offsetHeight||260,sceneAvoidRects(state.scene));
  el.style.right='auto'; el.style.bottom='auto';
  el.style.left=slot.x+'px'; el.style.top=slot.y+'px';
  return slot;
}
function repositionPanels(){ if(openP==='read') placeReadPanel(); }   // resize/场景切换/控制栏换行后经 pickSlot 重算
var openP=null;
function openPanel(name){
  openP=(openP===name)?null:name;
  document.getElementById('panel-read').classList.toggle('show',openP==='read');
  document.getElementById('panel-dtable').classList.toggle('show',openP==='dtable');
  btnTable.classList.toggle('on',openP==='read');
  btnDtable.classList.toggle('on',openP==='dtable');
  if(openP==='read'){ updatePanel(); placeReadPanel(); }   // 先填内容后量尺寸再 pickSlot
}
function updatePanel(){
  var s=state.scene;
  if(s==='e3'){
    var E=state.e3;
    setText('e3-mat',MATCN[E.mat]+'块');
    setText('e3-v',E.v+' cm³');
    setText('e3-m',fmt(e3Mass(),1)+' g');
    setText('e3-ratio',fmt(e3Rho(),2)+' g/cm³');
  }else if(s==='e4'){
    var b=e4Sel(); if(!b) return;
    var rho=e4Rho(b),S=state.e4.stack;
    if(S){   // 摞叠读数：整块 ρ̄=(mA+mB)/(VA+VB) → 漂浮 V排=M/ρ水 / 沉底 V排=VA+VB
      var M=S.top.m+S.bot.m,V=S.top.v+S.bot.v,rb=M/V;
      setText('e4-badge','摞叠（顶'+(MATCN[S.top.mat]||S.top.mat)+'/底'+(MATCN[S.bot.mat]||S.bot.mat)+'）');
      setText('e4-mat','整块平均');
      setText('e4-m',fmt(M,1)+' kg（总）');
      setText('e4-v',fmt(V,1)+' L（总）');
      setText('e4-rho',fmt(rb,2)+' kg/L → '+(rb<RHO_WATER?'漂浮':'沉底'));
      setText('e4-sub',rb<RHO_WATER?('V排=M/ρ水='+fmt(M,1)+' L'):('整块没 V排='+fmt(V,1)+' L'));
      setText('e4-level',fmt(state.e4.lvl,1)+' L');
    }else{
      setText('e4-badge',state.e4.dual?('块 '+('AB'[state.e4.sel]||'A')+'（双块）'):'单块');
      setText('e4-mat',MATCN[b.preset]||b.preset);
      setText('e4-m',fmt(b.m,1)+' kg');
      setText('e4-v',fmt(b.v,1)+' L');
      setText('e4-rho',fmt(rho,2)+' kg/L = '+fmt(rho*1000,0)+' kg/m³');
      setText('e4-sub',b.loc==='tank'?fmt(e4SubFrac(b)*100,0)+' %':'—（未入水）');   // R25：按绘制位置实时浸没比（与排水同源）
      setText('e4-level',fmt(state.e4.lvl,1)+' L');
    }
  }else{
    var b5=e5Sel(); if(!b5) return;
    setText('e5-blk','块 '+b5.id);
    setText('e5-m',b5.mKnown?fmt(b5.m,2)+' kg':'未称量');
    setText('e5-v',b5.vKnown?fmt(b5.v,1)+' L':'未测量');
    setText('e5-rho',(b5.mKnown&&b5.vKnown)?fmt(b5.m/b5.v,2)+' kg/L':'—');
    var vd=document.getElementById('e5-verdict');
    if(vd){ vd.textContent=b5.verdict||'—'; vd.className=b5.vok||''; }
  }
}
/* ===== hint 橙色解说条：当前可见分支教当前可做的操作（placeHint 逐场景选位；hintOverride 一次性定向提示） ===== */
var hintTimer=null,hintOverride=null;
function updateHint(){
  if(!hintEl) return;
  clearTimeout(hintTimer);
  if(state.animating){ hintEl.style.opacity='0'; return; }
  placeHint();
  hintEl.textContent=hintOverride||hintText(); hintOverride=null;
  hintEl.style.opacity='1'; hintT0=performance.now();   // 新操作唤出；6s 后自动淡出（E4.1 不挡密度标尺）
  hintTimer=setTimeout(function(){ if(hintEl&&!state.animating) hintEl.style.opacity='0'; },HINT_LIFE);
}
function hintText(){
  var s=state.scene;
  if(s==='e3'){
    var E=state.e3;
    var any2=['aluminum','iron','wood'].some(function(m){
      return E.records.filter(function(r){ return r.mat===m; }).length>=2;
    });
    if(any2) return '结论（教材P145）：同种物质的质量与体积成正比，质量与体积之比是一定的；不同物质这个比值一般也不同。换材质对比，或去「水槽」场景';
    var tNote=(E.block.loc==='cyl'&&RHO[E.mat]<RHO_WATER)?'筒底细线把木块拽住全浸——木块自己会浮，不系线就测不准排水体积。':'';
    if(E.converged) return tNote+'双箭头已汇聚到 (V, m) 交点 → 数据点浮现并自动入表。换大小/材质再多测几块，同材质≥2点自动画过原点比例线';
    if(E.mKnown&&E.vKnown) return tNote+'质量 m 与体积 V 都测好了，正在汇聚描点……';
    if(E.mKnown) return '已称得质量 m（左盘）。再把物块拖入右侧量筒，用排水法测体积 V';
    if(E.vKnown) return tNote+'已测得体积 V（量筒排水）。再把物块拖到天平左盘称质量 m';
    return '猜想（教材P144）：铝块体积是另一个的2倍、3倍……质量也是2倍、3倍……吗？——下方「材质/大小」钮选块，先把它拖到天平左盘称 m，再拖入量筒排水测 V（顺序不限），双测齐后自动汇聚描点入表';
  }
  if(s==='e4'){
    var b=e4Sel(); if(!b) return '';
    var S=state.e4.stack;
    if(state.e4.drag) return '松手放入水中：ρ物<ρ水 漂浮（浸没比=ρ物/ρ水），ρ物≥ρ水 沉底；拖到另一块顶上可摞叠——整块浮沉看 ρ̄=(mA+mB)/(VA+VB)';
    if(S){
      var M=S.top.m+S.bot.m,V=S.top.v+S.bot.v,rb=M/V;
      if(rb<RHO_WATER) return '摞叠漂浮：ρ̄='+fmt(rb,2)+'<1 → 漂浮，V排=M/ρ水='+fmt(M,1)+' L（底块先全浸、顶块部分浸）。拖走顶块可拆开';
      return '摞叠沉底：ρ̄='+fmt(rb,2)+'≥1 → 整块沉底，V排=VA+VB='+fmt(V,1)+' L。拖走任一块可拆开';
    }
    var rho=e4Rho(b);
    if(b.loc==='tank'&&rho<RHO_WATER) return '漂浮平衡：浸没比=ρ物/ρ水='+fmt(rho,2)+'/1.0='+fmt(rho*100,0)+'%。水位=基础100L+排水='+fmt(state.e4.lvl,1)+' L。可把另一块拖到它顶上摞叠';
    if(b.loc==='tank') return 'ρ='+fmt(rho,2)+' kg/L ≥ 水1.0 → 沉底静止。密度标尺红标=选中块ρ。可把另一块摞到顶上比 ρ̄';
    return '把块拖入水槽看浮沉与水位；点击块选中（块体提亮+下方小三角），下方换材质/体积/质量，「单块/双块」摆同体积异质量对比；双块时可把一块拖到另一块顶上摞叠';
  }
  var b5=e5Sel(); if(!b5) return '';
  if(b5.solved) return '鉴别正确！块'+b5.id+'是'+MATCN[b5.mat]+'。点「重新出题」换题，或点选其它块继续鉴别';
  if(!b5.mKnown) return '第1步：把神秘块拖到天平左盘称质量 m（点击块=选中，块体提亮+下方小三角）';
  if(!b5.vKnown) return '第2步：把块'+b5.id+'投入量筒，水位差就是它的体积 V';
  return '第3步：ρ = m÷V = '+fmt(b5.m/b5.v,2)+' kg/L。打开「密度表」对照，在「读数面板」选材质后点「提交鉴别」';
}
var toastT=null;
function toast(msg){
  var t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('show'); },2600);
}
function hideToast(){ var t=document.getElementById('toast'); if(t) t.classList.remove('show'); }
/* ===== 控制栏接线 ===== */
['aluminum','iron','wood'].forEach(function(m){
  var el=document.getElementById('btn-mat-'+m);
  if(el) el.addEventListener('click',function(){ if(state.animating)return; if(window.playClick)playClick(); e3Select(m,null); });
});
E3_VOLS.forEach(function(v){
  var el=document.getElementById('btn-v'+v);
  if(el) el.addEventListener('click',function(){ if(state.animating)return; if(window.playClick)playClick(); e3Select(null,v); });
});
if(selE4mat) selE4mat.addEventListener('change',function(){ if(state.animating){syncE4Ctrl();return;} e4ApplyPreset(selE4mat.value); if(window.playClick)playClick(); });
if(rngV) rngV.addEventListener('input',function(){
  if(state.animating){ syncE4Ctrl(); return; }
  var b=e4Sel(); if(!b) return;
  b.v=parseFloat(rngV.value);
  if(b.preset!=='custom') b.m=E4_RHO[b.preset]*b.v;   // 预设联动 m=ρV（P3 单点公式）
  e4AfterChange();
});
if(rngM) rngM.addEventListener('input',function(){
  if(state.animating){ syncE4Ctrl(); return; }
  var b=e4Sel(); if(!b||b.preset!=='custom') return;
  b.m=parseFloat(rngM.value);
  e4AfterChange();
});
if(btnDual) btnDual.addEventListener('click',function(){ if(state.animating)return; e4ToggleDual(); });
var btnNewq=document.getElementById('btn-newq');
if(btnNewq) btnNewq.addEventListener('click',function(){ if(state.animating)return; newE5(); });
if(btnDtable) btnDtable.addEventListener('click',function(){ if(state.animating)return; openPanel('dtable'); if(window.playClick)playClick(); });
var selE5matEl=document.getElementById('sel-e5mat');
if(selE5matEl) selE5matEl.addEventListener('change',function(){ var b=e5Sel(); if(b){ b.guess=selE5matEl.value; b.verdict=''; b.vok=''; updatePanel(); } });
var btnSubmit=document.getElementById('btn-submit');
if(btnSubmit) btnSubmit.addEventListener('click',function(){ if(state.animating)return; submitE5(); });
if(btnTable) btnTable.addEventListener('click',function(){ if(state.animating)return; openPanel('read'); if(window.playClick)playClick(); });
/* R34 标注开关：默认关；toggle 两态 class 同步 + playClick + dirty（重置不影响 showLabels） */
var btnLabels=document.getElementById('btn-labels');
if(btnLabels) btnLabels.addEventListener('click',function(){
  if(state.animating) return;
  state.showLabels=!state.showLabels;
  btnLabels.classList.toggle('on',state.showLabels);
  if(window.playClick) playClick();
  dirty=true;
});
/* E5.2 密度表右侧固定卡：固体/液体双 tab 切换（dt-solid/dt-liquid 互斥显隐，默认固体） */
var dtTabSolid=document.getElementById('dt-tab-solid'),dtTabLiquid=document.getElementById('dt-tab-liquid');
var dtSolid=document.getElementById('dt-solid'),dtLiquid=document.getElementById('dt-liquid');
function dtTab(which){
  var solid=(which!=='liquid');
  if(dtSolid) dtSolid.style.display=solid?'block':'none';
  if(dtLiquid) dtLiquid.style.display=solid?'none':'block';
  if(dtTabSolid) dtTabSolid.classList.toggle('on',solid);
  if(dtTabLiquid) dtTabLiquid.classList.toggle('on',!solid);
}
if(dtTabSolid) dtTabSolid.addEventListener('click',function(){ dtTab('solid'); if(window.playClick)playClick(); });
if(dtTabLiquid) dtTabLiquid.addEventListener('click',function(){ dtTab('liquid'); if(window.playClick)playClick(); });
dtTab('solid');
SCENES.forEach(function(k){
  var el=document.getElementById('btn-scene-'+k);
  if(el) el.addEventListener('click',function(){ switchScene(k); });
});
function resetE3(){
  var E=state.e3;
  E.mat='aluminum'; E.v=20; E.records=[]; E.dropT=performance.now();
  E.block.loc='source'; E.block.x=L.e3.src.x; E.block.y=L.e3.src.y;
  E.mKnown=false; E.vKnown=false; E.converged=false; E.arw=null;
  E.cylFrac=E3_CYL_BASE/E3_CYL_CAP; E.cylTw=null;
  syncE3Btns(); updatePanel(); updateHint(); dirty=true;
}
var btnReset=document.getElementById('btn-reset');
if(btnReset) btnReset.addEventListener('click',function(){
  if(state.animating) return;
  if(state.scene==='e3') resetE3(); else if(state.scene==='e4') resetE4(); else { genE5(); hideToast(); }
  if(window.playClick) playClick();
  dirty=true;
});
var btnMute=document.getElementById('btn-mute');
if(btnMute) btnMute.addEventListener('click',function(){ if(state.animating)return; window.muted=!window.muted; btnMute.textContent=window.muted?'🔇':'🔊'; if(window.playClick)playClick(); });
/* 全屏（c5s1 路线：documentElement + html.pseudo-fs 降级） */
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
if(btnFull) btnFull.addEventListener('click',function(){if(state.animating)return;if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();});
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(ev){document.addEventListener(ev,function(){syncFull();setTimeout(resize,60);});});
/* ===== 动画 tick ===== */
function busy(){
  if(state.animating){
    if(performance.now()-state.anim.t0>=ANIM_DUR){ state.animating=false; state.anim=null; updateHint(); }
    return true;
  }
  if(state.scene==='e3'){
    if(state.e3.dropT) return true;
    if(e3Tick()) return true;
  }
  var now=performance.now();
  if(state.e3.records.some(function(r){ return r.t&&now-r.t<220; })) return true;
  if(e4Tick()) return true;
  if(e5Tick()) return true;
  return false;
}
function tick(){
  if(busy()||dirty){ dirty=false; draw(); }
  requestAnimationFrame(tick);
}
/* ===== init ===== */
PROPS.onSprite('water_tank',function(){
  var img=PROPS.img('water_tank');
  if(img.naturalWidth>0){ TANK_ASPECT=img.naturalWidth/img.naturalHeight; layout(); reflow(); dirty=true; }
});
layout(); resize();
resetE4(); genE5();
state.e3.dropT=performance.now();
syncGroups(); syncE3Btns(); syncE4Ctrl(); updateHint(); draw();
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); reflow(); placeHint(); repositionPanels(); dirty=true; }).observe(ctrlEl);
}
requestAnimationFrame(tick);
/* 调试通道（P12：验收走 __c6dbg，模型直读） */
window.__c6dbg={
  get state(){ return state; }, get W(){ return W; }, get H(){ return H; }, get layout(){ return L; },
  scene:function(to){ switchScene(to); },
  e3inject:function(rows){   // 教材练习1样例数据灌入作图板（仅调试通道，不进学生页面）
    (rows||[]).forEach(function(r){
      state.e3.records.push({mat:r.mat||'wood',v:r.v,m:r.m,ratio:r.m/r.v,t:0});
    });
    dirty=true;
  },
  e3fitK:function(mat){
    var rs=state.e3.records.filter(function(r){ return r.mat===(mat||'wood'); });
    var svv=0,smv=0; rs.forEach(function(r){ svv+=r.v*r.v; smv+=r.m*r.v; });
    return svv?smv/svv:null;
  },
  e4sub:function(i){ var b=e4Blocks()[i||0]; return (b&&b.loc==='tank')?+e4SubFrac(b).toFixed(4):null; },   // R25：位置派生实际浸没比
  e4level:function(){ return state.e4.lvl; },
  e4dual:function(p1,v1,m1,p2,v2,m2){   // 验收：摆双块(preset/V L/m kg)入水，免拖拽
    var E=state.e4;
    E.dual=true; E.stack=null; E.sel=0;
    E.duals=[mkE4Block(p1,v1,m1,'tank'),mkE4Block(p2,v2,m2,'tank')];
    E.duals[0].x=L.e4.tank.x-L.e4.tank.innerHalf*0.5; E.duals[1].x=L.e4.tank.x+L.e4.tank.innerHalf*0.5;
    E.duals[0].y=E.duals[1].y=L.e4.benchY-L.e4.tank.h*0.75;
    E.lvl=TANK_BASE_L;
    E.duals.forEach(function(b){ e4Settle(b,false); });
    syncE4Ctrl(); updatePanel(); dirty=true; return true;
  },
  e4stackMake:function(){   // 验收：把 duals[0] 摞到 duals[1] 顶（刚体），返回摞叠物理量
    var E=state.e4; if(!E.dual) return null;
    var A=E.duals[0],B=E.duals[1];
    if(e4CanStack(A,B)===false) return {slid:true,note:'底块已沉底且顶块漂→滑落'};
    A.loc='tank'; E.stack={top:A,bot:B,x:B.x,y:B.y};
    e4StackSettle(false); updatePanel(); dirty=true;
    var M=A.m+B.m,V=A.v+B.v,rb=M/V;
    return {rhoBar:+rb.toFixed(4),sunk:rb>=RHO_WATER,vdisp:+((rb>=RHO_WATER)?V:M).toFixed(4),lvlTarget:+e4LvlTarget().toFixed(4),topMat:A.mat,botMat:B.mat};
  },
  e4stack:function(){ var S=state.e4.stack; if(!S) return null; var M=S.top.m+S.bot.m,V=S.top.v+S.bot.v,rb=M/V;
    return {rhoBar:+rb.toFixed(4),sunk:rb>=RHO_WATER,vdisp:+((rb>=RHO_WATER)?V:M).toFixed(4),lvlTarget:+e4LvlTarget().toFixed(4)}; },
  e4bobParam:function(){ return {ms:E4_BOB_MS,cycles:E4_BOB_CYCLES,tau:E4_BOB_TAU,w:+E4_BOB_W.toFixed(4),splashMs:E4_SPLASH_MS,tweenMs:TWEEN_MS}; },
  e4bobY:function(t){ return Math.exp(-t/E4_BOB_TAU)*Math.cos(E4_BOB_W*t); },   // 归一阻尼曲线(t秒)：验收查单调衰减/≤2周期/收敛0
  e5blocks:function(){ return state.e5.blocks.map(function(b){ return {id:b.id,mat:b.mat,v:b.v,m:b.m,mKnown:b.mKnown,vKnown:b.vKnown,solved:b.solved}; }); },
  e5gen:function(){ genE5(); },
  pickSlotProbe:function(needW,needH){   // 验收：当前场景 avoidRects 与 pickSlot 实选槽位（默认按读数面板实测尺寸）
    var el=document.getElementById('panel-read');
    var w=needW||(el?el.offsetWidth:0)||280,h=needH||(el?el.offsetHeight:0)||260;
    var rs=sceneAvoidRects(state.scene);
    return {scene:state.scene,need:{w:w,h:h},slot:pickSlot(w,h,rs),avoidRects:rs};
  },
  hintPos:function(){ if(!hintEl) return null; var r=hintEl.getBoundingClientRect(),wr=cv.getBoundingClientRect();
    return {cls:hintEl.className,x:Math.round(r.left-wr.left),y:Math.round(r.top-wr.top),w:Math.round(r.width),h:Math.round(r.height),opacity:hintEl.style.opacity}; }
};
})();

/* exp-measure-core.js — c6s3 密度测量台（单场景两阶段：s1 测盐水的密度 / s2 测小石块的密度） */
/* 物理自洽样例：①ρ=1.12≥1.05(HOLLOW_CRIT) → 空瘪粒上浮、饱满粒沉底；②m₁=162.0 m₂=110.0 → m=52.0 V=50.0 → ρ=1.04；
   ③排水法 V₁=60 V₂=78 → V=18 m=48 → ρ=2.67；④三视线偏差方向恒为 俯>真>仰（eyeApparent() 线性模型，任意液位成立） */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';   // 第23条：observer_eye 是 sprite 件
/* ===== 常量（core 单点定义，layout/render 只读；几何断言任意 H 成立：器材尺度一律经 cmPx() 随 H 缩放） ===== */
var XFADE_MS=300;                 // 阶段切换轻量交叉淡入淡出（器材常驻，无 600ms 飞入飞出；蔡总拍板）
var TWEEN_MS=350;                 // 液位/倾角单调过渡（P6：禁回弹震荡）
var INJECT_MS=1000;               // 阶段二注水约 1s（连续插值）
var SINK_MS=420;                  // 石块沉底单调插值（终态严格=筒底不回弹）
var GRAIN_MS=1200;                // 空瘪粒上浮 t 0→1 约 1.2s（seed_grains 内部 smoothstep，页面线性驱动 t）
var DESK_BAND=109;                // wood_desk 桌带厚度锁 109px（蔡总 10-09 定版；by=fy−109，fy=H−ctrlBandH）
var CUP_MASS=58.0;                // 空烧杯质量 g（样例自洽：ρ=1.04 Vb=100 → m₁=162.0）
var BEAKER_CAP=140,BEAKER_INIT_ML=100;   // 烧杯容量/初始清水体积 mL（water frac=vol/140）
var CYL_CAP=100,CYL_DIV=10;       // 量筒规格（任务书契约：cap=100 div=10）
var RHO_MIN=1.00,RHO_MAX=1.20;    // 盐水密度区间（清水起点 1.00、常温饱和语义上限 1.20，连续插值禁跳变）
var HOLLOW_CRIT=1.05;             // 空瘪粒临界（与 seed_grains 组件内常量同值，页面只做 hint/判定语义）
var SALT_RATE=22;                 // 加盐速率 %/s（拖盐罐悬于杯口时）
var POUR_RATE=45;                 // 倾倒速率 mL/s（学生控量，约 40~60 mL 合理区间）
var INJECT_ML=60;                 // 阶段二注水目标 V₁（合理区间中部）
var STONE_RHO_MIN=2.5,STONE_RHO_MAX=2.8; // 石块密度区间（花岗岩族教材表值邻域）
var STONE_V_MIN=15,STONE_V_MAX=20;       // 石块体积默认区间 cm³ → m 约 40~55 g
var STONE_IN_CYL_K=0.75;                 // F6 石块入筒态绘制压缩系数：绘制 size=内腔宽×0.75（≤内腔宽不穿壁）；仅绘制层，体积/水位/ρ 按真实 V
var EYE_RANGE=13*Math.PI/180;     // F4 眼睛弧线半角 ±13°（42°→13°，蔡总拍板「4选a」：弧线收窄、视觉仍是上下移动）
var EYE_MAX_DEV=0.5;              // F4 最大视线偏差 ±0.5 mL（6→0.5，严格小数位级、不超一个分度值 5 mL 的 1/10）
var ALIGN_TOL=2*Math.PI/180;      // F4 平视判定容差 ±2°（3°→2°；|θ|≤2° 时「看到的读数」=「真实读数」完全相等）
var EYE_R_K=0.2250;               // sin(13°)=0.22495…≈0.2250（偏差换算单点常量：dev=EYE_MAX_DEV·sinθ/EYE_R_K，θ=±13° 时 |dev|=0.5·sin13°/0.2250≈±0.500）
/* ===== G 轮常量（2026-10-20 修复轮2：布局单源+成对不相交） ===== */
var EYE_ARC_R=60;                 // G2 单源：特写眼弧半径 cm（原 0.40×bc.h 随卡高漂移→固定；任意液位×θ 眼盒不触文字带）
var EYE_SPRITE_HALF=22;           // observer_eye sprite 半高 cm（h=cmPx(44)）
var CU_BAND_H=50;                 // G2 特写卡顶部文字带高 cm（标题14+看到19+真实12 三行+行距，左对齐塞带内）
var CU_TOP_CLEAR=EYE_ARC_R*Math.sin(EYE_RANGE)+EYE_SPRITE_HALF+2.5;   // G2 筒顶距文字带底净空 cm=13.5+22+2.5=38（单源派生自 EYE_ARC_R）
var TABLE_BAND=118;               // G3a 数据表面板顶部预留带基准 cm（面板顶槽12px+实测高+余量；init 实测更大取实测）
var DESK_GAP=2,DESK_GAP_MIN=1,DESK_K_MIN=0.7;   // G1 packDesk：间隙起步/溢出压缩后最小间隙 cm / 高度收敛系数下限
var TABLE_PANEL_H=0;              // G3a init getBoundingClientRect 实测 panel-table 高 px（0=未测到，走 TABLE_BAND 基准）

var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var hintEl=document.getElementById('hint');
var W=960,H=520,DPR=1,ctrlBandH=150,COMPACT_H=600,dirty=true;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function cmPx(v){ return v*H/520; }        // 桌面器材尺度统一换算（禁绝对 px）
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(v,n){ return (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }
function easeOut(t){ return 1-Math.pow(1-t,3); }
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
function cbrt(v){ return Math.pow(v,1/3); }
function rnd(s){ var x=Math.sin(s*127.1+311.7)*43758.5453; return x-Math.floor(x); }   // 确定性伪随机（不用随机数）
function mixRgb(a,b,t){ return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]; }
function rgba(c,al){ return 'rgba('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+','+al+')'; }
/* ===== 状态（两阶段完全隔离、返回原样恢复：切走再切回，数据表/水位/加盐量/石块位置全部原样） ===== */
var state={
  stage:'s1',animating:false,anim:null,showLabels:false,   // R34：标注默认关（重置不影响）
  eyeT:0.5,eyeDrag:false,eyeAlignBeep:false,               // 三视线组件共用（两阶段同一组件）
  bal:{tilt:0,tw:null},                                    // 天平横梁倾角（简化读数态：放置后单调归零）
  s1:{rho:RHO_MIN,beakerVol:BEAKER_INIT_ML,cylMl:0,
      m1:null,m2:null,vConf:null,done:false,
      beaker:{loc:'bench',x:0,y:0},jar:{loc:'bench',x:0,y:0,pour:0,pourTw:null},
      pouring:false,grainT:0,grainT0:0,grainFrom:0,grainTo:0,drag:null},
  s2:{seed:7,stone:null,rows:[],cur:{m:null,v1:null,v2:null,done:false},injected:false,waterMl:0,
      waterTw:null,drag:null,firstHintShown:false}
};
/* ===== 布局（layout() 单点算，绘制只读；R29 坐深居中：器材停驻线一律 L.seat=PROPS.seatY(by,64,26)） ===== */
var L={};
function attachBalG(B){   // 天平几何 PROPS.balGeom 单源（c6s2 R19/R24 先例）：panTop=盘椭圆中心，挂载件底面中心与盘心重合
  var G=PROPS.balGeom(B.x,B.y,B.h,0);
  B.g=G; B.panDx=B.x-G.panL.x; B.panTop=G.panL.y; B.panHW=G.panL.r;
}
function layout(){
  L.fy=H-ctrlBandH;
  L.by=Math.max(40,L.fy-DESK_BAND);
  L.seatSpan=26;
  L.seat=PROPS.seatY(L.by,64,L.seatSpan);
  L.bal={x:Math.round(W*0.155),y:L.seat,h:Math.round(H*0.42)};
  attachBalG(L.bal);
  // 三视线读数特写区（右侧浮层幽灵卡，两阶段共用同一组件；先算——packDesk 右界依赖 cu.x0）
  var x0=Math.round(W*0.668),x1=Math.round(W*0.988),y0=Math.round(H*0.075);
  var y1=Math.min(Math.round(H*0.74),L.by-14);
  L.cu={x0:x0,y0:y0,x1:x1,y1:y1};
  /* G2 特写卡：顶部文字带 bandH=cmPx(50)（标题+看到的+真实读数三行，绘制层塞带内）；
     筒顶下移 bandH+cmPx(CU_TOP_CLEAR=38)，CU_TOP_CLEAR=EYE_ARC_R·sin13°(13.5)+sprite 半高(22)+2.5（单源派生）；
     几何断言（构造成立，任意液位×任意 θ）：眼顶最高=液面−cmPx(13.5+22)=液面−cmPx(35.5)
       ≥ 筒顶−cmPx(35.5) ≥ 文字带底+cmPx(38−35.5)=文字带底+cmPx(2.5) → 眼包围盒∩文字带=∅ */
  var bandH=Math.round(cmPx(CU_BAND_H));
  var bcY=y1-Math.round(cmPx(16));
  L.cu.bc={x:Math.round(x0+(x1-x0)*0.66),y:bcY,
           h:Math.max(100,Math.round(bcY-(y0+bandH+Math.round(cmPx(CU_TOP_CLEAR)))))};
  L.cu.eyeR=Math.round(cmPx(EYE_ARC_R));   // G2 固定半径单源（原 0.40×bc.h）
  L.cu.btn={x:Math.round(x0+(x1-x0)*0.26),y:Math.round(y1-cmPx(34)),w:Math.round(cmPx(96)),h:Math.round(cmPx(28))};
  /* G3a 顶部预留带：数据表面板（pickSlot 顶槽 y=12，DOM px 不随 H 缩放）实测高单源预留；
     面板未打开也预留（禁实验中跳变）；实测+余量 > cmPx(118) 取实测。
     断言：量筒顶=L.seat−L.cyl.h ≥ tableBand+cmPx(2) ≥ 12+面板实测高+cmPx(6) → 筒身不穿面板，任意 W/H */
  L.tableBand=Math.max(Math.round(cmPx(TABLE_BAND)),Math.round(12+TABLE_PANEL_H+cmPx(6)));
  var cylH0=Math.max(160,Math.round(L.seat-H*0.14));
  var cylH=Math.max(90,Math.min(cylH0,Math.round(L.seat-(L.tableBand+cmPx(2)))));
  packDesk(cylH,x0);
}
/* G1 packDesk：桌面器材打包布局单源函数（除根：旧 0.40/0.545/0.622 固定 W 比例 x 与 H 比例宽度独立缩放必撞）。
   顺序：天平（x=0.155W 固定不动）→ 量筒 → 烧杯 → 盐罐（阶段一）；阶段二尾件=石块位。
   每件 x=前件右缘+gap+自身半宽；半宽单源=库件 width 公式：cyl max(30,h·0.18)/2、beaker 0.78h/2、jar (0.66h·1.14)/2、stone cmPx(19.5)+2。
   溢出收敛：打包总右缘 > cu.x0−cmPx(4) 时先压 gap 至 cmPx(1)，仍溢出对桌面器材高度统一乘 k=min(1,可用宽/需求宽)（下限 0.7，触底记 L.desk.overflow）。
   几何断言（构造成立）：任意相邻两件水平间距=gap ≥ cmPx(1)，任意 W/H；
   F6 断言保留：石块位=筒右缘+gap+石块半宽 → 石块包围盒与量筒包围盒水平间距=gap ≥ cmPx(1)；
   石块 vs 烧杯/盐罐不查：分属阶段二/阶段一，各自阶段对方隐藏（仅 300ms 交叉淡入淡出瞬时同屏，可接受） */
function packDesk(cylH,cuX0){
  var balRight=L.bal.x+L.bal.panDx+L.bal.panHW+6;    // 天平右缘（balAvoidRect 同源）
  var avail=Math.round(cuX0-cmPx(4))-balRight;       // 桌面可用宽（右界=特写区左缘−cmPx(4)）
  var stHW=cmPx(19.5)+2;                             // stone 最大半宽（stoneSize 上限 cmPx(39)）+裕量
  function needW(g,k){                               // 需求宽=max(阶段一 cyl+beaker+jar, 阶段二 cyl+stone)+间隙
    var wc=Math.max(30,cylH*k*0.18),wb=cmPx(128)*k*0.78,wj=cmPx(96)*k*0.66*1.14,ws=stHW*k*2;
    return Math.max(wc+wb+wj,wc+ws)+g*3;
  }
  var gap=cmPx(DESK_GAP),k=1,overflow=false;
  if(needW(gap,k)>avail){
    gap=cmPx(DESK_GAP_MIN);
    k=Math.min(1,avail/needW(gap,1));
    if(k<DESK_K_MIN){ k=DESK_K_MIN; overflow=true; }
  }
  L.cyl={x:0,y:L.seat,h:Math.round(cylH*k)};
  L.beaker={x:0,y:L.seat,h:Math.round(cmPx(128)*k)};
  L.jar={x:0,y:L.seat,h:Math.round(cmPx(96)*k)};
  var hc=cylW(L.cyl)/2,hb=L.beaker.h*0.78/2,hj=L.jar.h*0.66*1.14/2,hs=stHW*k;
  L.cyl.x=Math.round(balRight+gap+hc);
  L.beaker.x=Math.round(L.cyl.x+hc+gap+hb);
  L.jar.x=Math.round(L.beaker.x+hb+gap+hj);
  var stMax=Math.round(cuX0-cmPx(50));               // 石块位上界=特写区左缘−cmPx(50)（拖拽回域同界）
  L.stoneSpot={x:clamp(Math.round(L.cyl.x+hc+gap+hs),0,Math.max(0,stMax)),y:L.seat};
  L.desk={balRight:Math.round(balRight),gap:gap,k:k,overflow:overflow,
          hw:{cyl:hc,beaker:hb,jar:hj,stone:hs}};    // 半宽单源导出（拖拽回域 clamp/dbg 同读）
}
/* G1 拖拽回域 clamp 单源（endDrag/reflow 共用；禁旧比例常量）：
   下界=天平右缘+自身半宽+cmPx(1)（不落天平上），上界=特写区左缘−自身半宽（石块沿用 −cmPx(50) 与 stoneSpot 上界同源） */
function benchClampX(hw,x,useStoneHi){
  var lo=Math.round(L.desk.balRight+hw+cmPx(1));
  var hi=Math.round(useStoneHi?(L.cu.x0-cmPx(50)):(L.cu.x0-hw-1));
  return clamp(x,lo,Math.max(lo,hi));
}
function cylW(C){ return Math.max(30,C.h*0.18); }   // cylinder_grad 同公式（w=max(30,h*0.18)），页面仅此处换算
function cylInner(C){   // 量筒内腔几何（cylinder_grad 同公式：w/wall/内腔四边）
  var w=cylW(C),wall=Math.max(2,w*0.055);
  return {w:w,inL:C.x-w/2+wall,inR:C.x+w/2-wall,inTop:C.y-C.h+wall*2.2,inBot:C.y-wall*2.2};
}
/* ===== hint 解说条（placeHint 选位：顶部居中优先，与控制栏相交则抬起；R7：pointer-events:none 在 CSS） ===== */
function placeHint(){
  if(!hintEl) return;
  var cls='hint-top';
  if(hintEl.className!==cls) hintEl.className=cls;
  hintEl.style.top=''; hintEl.style.bottom='';
  measureCtrl();
  var hr=hintEl.getBoundingClientRect(),cr=ctrlEl?ctrlEl.getBoundingClientRect():null;
  if(cr&&hr.height&&hr.bottom>cr.top+1&&hr.top<cr.bottom){   // 与控制栏相交 → 抬到控制栏上方 10px
    hintEl.style.top='auto'; hintEl.style.bottom=(ctrlBandH+10)+'px';
  }
}
function hintRectCanvas(){   // hint 可见时的画布坐标矩形（pickSlot avoidRects；已淡出不避让）
  if(!hintEl||hintEl.style.opacity==='0') return null;
  var r=hintEl.getBoundingClientRect(); if(!r.width||!r.height) return null;
  var wr=cv.getBoundingClientRect();
  return {x:r.left-wr.left,y:r.top-wr.top,w:r.width,h:r.height};
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
/* ===== 物理单源（ρ=m/V 及派生全在此处，禁第二套公式；数据表/读数牌/密度牌同读这些函数） ===== */
function s1(){ return state.s1; }
function s2(){ return state.s2; }
function stone(){ return state.s2.stone; }
/* 盐水液体色映射（单点函数：ρ→黄绿渐变；ρ=1.00 时返回 undefined=库件默认蓝系清水色） */
var BRINE_TOP=[201,214,106],BRINE_BOT=[166,188,64],BRINE_LINE=[238,246,196];
var CLEAR_TOP=[150,200,240],CLEAR_BOT=[120,180,230],CLEAR_LINE=[232,247,255];
function brineLC(rho){
  var t=clamp((rho-RHO_MIN)/(RHO_MAX-RHO_MIN),0,1);
  if(t<0.02) return undefined;   // 清水=库件默认蓝系（阶段二清水不传参同语义）
  return {top:rgba(mixRgb(CLEAR_TOP,BRINE_TOP,t),0.55+0.2*t),
          bottom:rgba(mixRgb(CLEAR_BOT,BRINE_BOT,t),0.45+0.3*t),
          line:rgba(mixRgb(CLEAR_LINE,BRINE_LINE,t),0.9+0.05*t)};
}
function saltPct(){ return clamp((s1().rho-RHO_MIN)/(RHO_MAX-RHO_MIN)*100,0,100); }   // 加盐量 0~100
function setSaltRho(r){   // 加盐量↑ → ρ 单调递增（连续插值禁跳变）；驱动种粒浮沉目标
  var S=s1();
  S.rho=clamp(r,RHO_MIN,RHO_MAX);
  var tgt=(S.rho>=HOLLOW_CRIT)?1:0;
  if(tgt!==S.grainTo){ S.grainFrom=S.grainT; S.grainTo=tgt; S.grainT0=performance.now(); dirty=true; }
}
function brineMass(volMl){ return CUP_MASS+s1().rho*volMl; }   // 杯+盐水总质量 g（m₁/m₂ 同源：m₁=brineMass(Vb)、m₂=brineMass(Vb−V倒)）
/* 石块（确定性生成：同 seed 同形同参数，禁随机数）：ρ∈[2.5,2.8]、V∈[15,20] → m=ρV≈40~55 g */
function mkStone(seed){
  var V=STONE_V_MIN+rnd(seed*13+5)*(STONE_V_MAX-STONE_V_MIN);
  var rho=STONE_RHO_MIN+rnd(seed*29+3)*(STONE_RHO_MAX-STONE_RHO_MIN);
  return {seed:seed,V:V,rho:rho,m:rho*V,loc:'bench',x:0,y:0,sinkP:1,wet:0,sinkTw:null};
}
function stoneSize(st){ return cmPx(30+9*((st.V-STONE_V_MIN)/(STONE_V_MAX-STONE_V_MIN))); }   // 台面展示尺寸随 V 连续
function newStone(){   // 换石块重测：不同 seed/体积、同材质族（ρ 仍 2.5~2.8）
  var S=s2();
  S.seed=S.seed+1;
  S.stone=mkStone(S.seed);
  S.stone.x=L.stoneSpot.x; S.stone.y=L.stoneSpot.y;
  S.cur={m:null,v1:null,v2:null};
  dirty=true;
}
/* 天平简化读数态（c6s12 Q4 折中先例）：放置后横梁倾角单调归零；R10/R20 平衡判据=实际倾角归零的唯一点才显示平衡读数 */
function balSettle(){ state.bal.tw={t0:performance.now(),from:state.bal.tilt||-3.2,to:0}; state.bal.tilt=state.bal.tw.from; dirty=true; }
function balTick(now){
  var tw=state.bal.tw; if(!tw) return false;
  var t=clamp((now-tw.t0)/TWEEN_MS,0,1);
  state.bal.tilt=tw.from+(tw.to-tw.from)*easeOut(t);   // easeOut 单调衰减不回弹
  if(t>=1){ state.bal.tilt=0; state.bal.tw=null; measureTick(); }   // 倾角归零唯一点→读数稳定落格（R10/R20）
  dirty=true; return true;
}
function balLeveled(){ return state.bal.tilt===0&&!state.bal.tw; }
/* 盘上被测物质量（读数语义单点）：阶段一=杯和盐水（当前杯中余量）、阶段二=石块 */
function massOnPanFor(stg){
  if(stg==='s1') return s1().beaker.loc==='pan'?brineMass(s1().beakerVol):null;
  var st=stone(); return (st&&st.loc==='pan')?st.m:null;
}
function massOnPan(){ return massOnPanFor(state.stage); }
/* 量筒当前液体体积 mL（两阶段隔离；特写区大图与主筒同读此值）——读取函数见绘制层 cylMlFor/cylMlNow */
function s2WaterTween(now){   // 注水/沉石/换石块回水的连续插值驱动（单调，禁跳变）
  var tw=s2().waterTw; if(!tw) return false;
  var t=clamp((now-tw.t0)/tw.ms,0,1);
  s2().waterMl=tw.from+(tw.to-tw.from)*easeInOut(t);
  if(t>=1){ s2().waterMl=tw.to; s2().waterTw=null; }
  dirty=true; return true;
}
function s2SetWater(ml,ms){ s2().waterTw={t0:performance.now(),from:s2().waterMl||0,to:clamp(ml,0,CYL_CAP),ms:ms||INJECT_MS}; dirty=true; }

/* ===== 绘制：器材层（R36 画家算法按 y 降序；拖拽件恒最后画=最上层） ===== */
function drawBeaker(x,y,h,tiltAng){   // beaker_ice 封装单入口：盐水色 ρ 映射 + 种粒画在 contents（液体中，非玻璃外）
  var S=s1();
  ctx.save();
  if(tiltAng){ ctx.translate(x,y); ctx.rotate(tiltAng); x=0; y=0; }
  PROPS.beaker_ice(ctx,x,y,{h:h,ice:0,water:clamp(S.beakerVol/BEAKER_CAP,0,1),liquidColor:brineLC(S.rho),
    contents:function(c,rect){   // Q6 选种联动：种粒画在液体里；level=1 使组件液面与宿主水位 wy 对齐
      var gh=Math.max(8,rect.yBot-rect.wy);
      if(S.beakerVol<=0.5) return;
      PROPS.seed_grains(c,rect.x,rect.yBot,{rho:S.rho,level:1,w:rect.halfAt(rect.yBot)*1.5,h:gh,count:12,t:S.grainT,seed:3});
    }});
  ctx.restore();
}
function drawJar(x,y){ return PROPS.salt_jar(ctx,x,y,{saltLevel:100-saltPct()*0.8,pour:s1().jar.pour,h:L.jar.h}); }
function drawStoneAt(st,x,y,size){ PROPS.stone(ctx,x,y,{size:size,seed:st.seed,wet:st.wet}); }
function cylMlFor(stg){ return stg==='s1'?s1().cylMl:(s2().waterMl||0); }
function cylFracFor(stg){ return clamp(cylMlFor(stg)/CYL_CAP,0,1); }
function cylMlNow(){ return cylMlFor(state.stage); }
function cylFracNow(){ return cylFracFor(state.stage); }
function drawMainCyl(stg){   // 主量筒：阶段一装盐水（liquidColor ρ 映射）、阶段二装清水（默认蓝系不传参）
  var st=stone(),inCyl=(stg==='s2'&&st&&st.loc==='cyl');
  PROPS.cylinder_grad(ctx,L.cyl.x,L.cyl.y,{h:L.cyl.h,cap:CYL_CAP,div:CYL_DIV,water:cylFracFor(stg),
    liquidColor:stg==='s1'?brineLC(s1().rho):undefined,
    contents:inCyl?function(c,rect){   // 石块画在 contents：水体之下、筒壁高光之上（沉底终态严格=inBot 不回弹）
      var size=(rect.inR-rect.inL)*STONE_IN_CYL_K;   // F6 入筒态压缩绘制：size=内腔宽×0.75 不穿壁；仅绘制层压缩——体积/水位/ρ 仍按真实 st.V（排水恒等式不受影响）
      var sinkY=rect.wy+(rect.inBot-rect.wy)*st.sinkP;
      PROPS.stone(c,rect.x,sinkY,{size:size,seed:st.seed,wet:st.wet});
    }:null});
  if(stg==='s2'&&s2().cur.v1!=null&&s2().cur.v2!=null){   // 排水法差值 V₂−V₁ 高亮标注（读数类，不受标注开关 gate）
    var gi=cylInner(L.cyl),yA=gi.inBot-(gi.inBot-gi.inTop)*clamp(s2().cur.v1/CYL_CAP,0,1);
    var yB=gi.inBot-(gi.inBot-gi.inTop)*clamp(s2().cur.v2/CYL_CAP,0,1);
    ctx.strokeStyle='#dc2626'; ctx.lineWidth=1.6; ctx.setLineDash([5,3]);
    ctx.beginPath(); ctx.moveTo(gi.inL-8,yA); ctx.lineTo(gi.inR+8,yA); ctx.moveTo(gi.inL-8,yB); ctx.lineTo(gi.inR+8,yB); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(gi.inL-14,yA); ctx.lineTo(gi.inL-14,yB); ctx.stroke();
    ctx.fillStyle='#b91c1c'; ctx.font='bold '+Math.round(cmPx(13))+'px sans-serif';
    ctx.textAlign='right'; ctx.textBaseline='middle';
    ctx.fillText('V₂−V₁='+fmt(s2().cur.v2-s2().cur.v1,1),gi.inL-18,(yA+yB)/2);
  }
}
function drawBalance(){   // 天平本体（共用器材常驻，不参与阶段淡入淡出；盘上被测物由外层画家排序单独画，R24 语义=底面中心坐盘心）
  var B=L.bal;
  PROPS.balance_pan(ctx,B.x,B.y,{h:B.h,tilt:state.bal.tilt,rider:0,riderShow:true});
}
/* F2/F3 显式「记录」按钮家族（参照 hitConfirm/doConfirm 机制）：烧杯上盘且横梁水平才绘制（未上盘/未平衡=不出现，非置灰）；
   按钮叠在天平读数幽灵卡正下方 cmPx(2)（G3b panUIRects 单源堆叠，整体锚定立柱顶上方不压横梁）；文案随当前该记哪个动态换「记录 m₁ / 记录 m₂」 */
function recTarget(){   // 'm1'|'m2'|null：m₁ 未记→'m1'；m₁ 已记且量筒已有盐水→'m2'（F3 覆盖式重记，后记覆盖前记）
  if(state.animating||effStage()!=='s1') return null;
  var S=s1();
  if(S.beaker.loc!=='pan'||!balLeveled()) return null;
  if(S.m1===null) return 'm1';
  return S.cylMl>0.05?'m2':null;
}
/* G3b② panUIRects：盘区 m 读数牌 + 记录按钮单源堆叠函数（draw/hit/dbg.rects 同读，禁第二套坐标）。
   m 牌在上、记录钮在下，垂直间距=cmPx(2)；整体锚定天平立柱顶（B.y−B.h）上方、bal.x 居中；
   两矩形高单源实测（th/bh 常量派生 cmPx），成对不相交：牌底=钮顶−cmPx(2) 构造成立。
   配合 G3b①（ρ盐水牌仅烧杯在桌面时绘制）+ G3b③（烧杯 caption 上盘后隐藏）→ 盘区不再三块叠罗汉。 */
function panUIRects(){
  var B=L.bal,rec=recTarget();
  var tw=Math.round(cmPx(176)),th=Math.round(cmPx(34)),gapV=cmPx(2),bw=Math.round(cmPx(120)),bh=Math.round(cmPx(30));
  var stackH=th+(rec?gapV+bh:0);
  var x=clamp(Math.round(B.x-tw/2),4,Math.max(4,Math.round(W-tw-4)));
  var y=Math.max(4,Math.round(B.y-B.h-cmPx(8)-stackH));
  return {rec:rec,tag:{x:x,y:y,w:tw,h:th},
          btn:rec?{x:x+tw/2,y:Math.round(y+th+gapV+bh/2),w:bw,h:bh}:null};   // btn.x/.y=中心（同确认钮语义）
}
function drawBalReadout(){   // 天平读数牌（幽灵卡）：R13 未调平=红字+括号说明；R10/R20 横梁实际倾角归零的唯一点才显示平衡读数
  var G=panUIRects(),t=G.tag,mOn=massOnPanFor(effStage());
  ghostCard(t.x,t.y,t.w,t.h);
  ctx.textAlign='center'; ctx.textBaseline='middle';
  var my=t.y+t.h/2;
  if(mOn===null){
    ctx.fillStyle='#64748b'; ctx.font=Math.round(cmPx(13))+'px sans-serif';
    ctx.fillText('托盘天平（简化读数态）',t.x+t.w/2,my);
  }else if(!balLeveled()){
    ctx.fillStyle='#dc2626'; ctx.font='bold '+Math.round(cmPx(14))+'px sans-serif';
    ctx.fillText('横梁调平中…（读数未稳定）',t.x+t.w/2,my);
  }else{
    var tag=(effStage()==='s1')?(G.rec==='m2'?'m₂':'m₁'):'m';
    ctx.fillStyle='#1e293b'; ctx.font='bold '+Math.round(cmPx(16))+'px sans-serif';
    ctx.fillText(tag+' = '+fmt(mOn,1)+' g',t.x+t.w/2,my);
  }
  drawRecordBtn(G);
}
function drawRecordBtn(G){   // F2 记录按钮（确认钮同族样式：绿底可点）
  if(!G.rec||!G.btn) return;
  var b=G.btn;
  rrPath(b.x-b.w/2,b.y-b.h/2,b.w,b.h,8);
  ctx.fillStyle='rgba(22,163,74,0.9)'; ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='bold '+Math.round(cmPx(14))+'px sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(G.rec==='m1'?'记录 m₁':'记录 m₂',b.x,b.y);
}
function hitRecord(p){ var G=panUIRects(); return !!G.btn&&inRect(p,G.btn.x-G.btn.w/2,G.btn.y-G.btn.h/2,G.btn.w,G.btn.h); }
function doRecord(){   // F2 入表唯一路径：点「记录」→ fillCell + playTick + 落格高亮 300ms（flash 在 fillCell 内置）
  var tg=recTarget(); if(!tg) return;
  var S=s1();
  if(window.playTick)playTick();
  if(tg==='m1'){
    S.m1=brineMass(S.beakerVol);
    fillCell('s1-c1',fmt(S.m1,1)); openTable();
  }else{   // F3 m₂ 覆盖式重记：重算 m=m₁−m₂ 与 ρ=(m₁−m₂)/V（V 取当前已确认读数，s1TryFinish 单源）
    S.m2=brineMass(S.beakerVol);
    fillCell('s1-c2',fmt(S.m2,1)); s1TryFinish(); openTable();
  }
  updatePanel(); updateHint(); dirty=true;
}
function drawPourStream(){   // 倾倒盐水流（beaker 口→量筒口，确定性伪随机液滴；禁随机数）
  var S=s1(),b=S.beaker;
  var gi=cylInner(L.cyl),tx=(gi.inL+gi.inR)/2,ty=gi.inTop-4;
  var mx=b.x-L.beaker.h*0.78*0.42,my=b.y-L.beaker.h*0.92;
  ctx.strokeStyle=rgba(mixRgb(CLEAR_BOT,BRINE_BOT,clamp((S.rho-RHO_MIN)/0.2,0,1)),0.75);
  ctx.lineWidth=cmPx(5); ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(mx,my); ctx.quadraticCurveTo((mx+tx)/2,Math.min(my,ty)-cmPx(10),tx,ty); ctx.stroke();
  var now=performance.now()/240;
  for(var k=0;k<3;k++){
    var t=((now+rnd(k*7+2))%1);
    var px=mx+(tx-mx)*t,py=my+(ty-my)*t*t+cmPx(4)*t;
    ctx.beginPath(); ctx.arc(px,py,cmPx(2.2),0,Math.PI*2);
    ctx.fillStyle=rgba(mixRgb(CLEAR_TOP,BRINE_TOP,0.6),0.8); ctx.fill();
  }
}
function caption(x,y,txt){   // 器材附属说明文字（R34：标注开关 gate 的只有这类 caption；读数类不 gate）
  if(!state.showLabels) return;
  ctx.fillStyle='#8a7c66'; ctx.font=Math.round(cmPx(12))+'px sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillText(txt,x,y);
}

/* ===== 三视线读数特写区（方案乙=拖动眼睛，蔡总拍板；两阶段共用同一组件） =====
   几何模型（单点，特写/确认动作同源）：眼在大量筒左侧弧线上，θ=(eyeT*2−1)*13°（0=水平=平视；F4 蔡总拍板「4选a」最大偏差 ±0.5 mL）；
   看到的读数 = 真实读数 − EYE_MAX_DEV·sinθ/sin13° → θ<0（眼高于液面=俯视）读数偏大、θ>0（仰视）偏小；|θ|≤2° 平视合一（eyeApparent 早退分支）；
   偏差方向恒为 俯>真>仰，任意液位采样成立（trueV 只平移不缩放；θ=±13° 时偏差=±0.5·sin13°/0.2250≈±0.500 mL） */
function effStage(){
  if(!state.anim) return state.stage;
  var t=clamp((performance.now()-state.anim.t0)/XFADE_MS,0,1);
  return t<0.5?state.anim.from:state.anim.to;
}
function stageAlpha(stg){   // 阶段包络：交叉淡入淡出 300ms（前半淡出旧阶段、后半淡入新阶段；器材常驻无飞入飞出）
  if(!state.anim) return state.stage===stg?1:0;
  var t=clamp((performance.now()-state.anim.t0)/XFADE_MS,0,1);
  var cur=t<0.5?state.anim.from:state.anim.to;
  if(stg!==cur) return 0;
  return t<0.5?(1-2*t):(2*t-1);
}
function eyeTheta(){ return (state.eyeT*2-1)*EYE_RANGE; }
function cuSurf(){   // 特写大筒液面点（water=0 时 wy=inBot，与 cylinder_grad 同源公式）
  var bc=L.cu.bc,gi=cylInner(bc),f=cylFracFor(effStage());
  return {x:bc.x,y:f>0.005?gi.inBot-(gi.inBot-gi.inTop)*f:gi.inBot,gi:gi};
}
function eyePos(){
  var s=cuSurf(),R=L.cu.eyeR,th=eyeTheta();
  return {x:s.x-R*Math.cos(th),y:s.y+R*Math.sin(th)};
}
function eyeAligned(){ return Math.abs(eyeTheta())<=ALIGN_TOL; }
function eyeApparent(){
  var trueV=cylMlFor(effStage());
  if(Math.abs(eyeTheta())<=ALIGN_TOL) return trueV;   // F4 平视合一：|θ|≤2° 时「看到的读数」=「真实读数」（两值完全相等）
  return clamp(trueV-EYE_MAX_DEV*Math.sin(eyeTheta())/EYE_R_K,0,CYL_CAP);
}
function confirmTarget(){   // 当前待确认读数的阶段步骤（null=不显示确认钮）
  if(state.animating) return null;
  if(effStage()==='s1'){ var S=s1(); return (S.cylMl>0.5&&S.vConf===null&&!S.done)?'s1v':null; }
  var T=s2(),st=stone();
  if(T.cur.v1==null&&T.injected&&(T.waterMl||0)>0.5&&!(st&&st.loc==='cyl')) return 'v1';   // 石块已入筒时禁确认 V₁（否则 V₁=V₂ → V=0，数据完整性）
  if(st&&st.loc==='cyl'&&!st.sinkTw&&T.cur.v1!=null&&T.cur.v2==null) return 'v2';
  return null;
}
function cuBandRect(){   // G2 文字带矩形单源（绘制/dbg.rects 同读）：卡顶 bandH=cmPx(50)
  return {x:L.cu.x0,y:L.cu.y0,w:L.cu.x1-L.cu.x0,h:Math.round(cmPx(CU_BAND_H))};
}
function drawCloseup(){
  var cu=L.cu,bc=cu.bc;
  ghostCard(cu.x0,cu.y0,cu.x1-cu.x0,cu.y1-cu.y0);
  /* G2 顶部文字带三行左对齐（行距≈cmPx(2.5)，bandH=cmPx(50) 内塞下：标题14/看到19/真实12）；
     筒顶=带底+cmPx(38)（layout CU_TOP_CLEAR）→ 满液时眼弧最高位仍低于带底，眼盒∩文字带=∅ 任意液位×θ */
  var tx=cu.x0+cmPx(12);
  ctx.textAlign='left'; ctx.textBaseline='middle';
  ctx.fillStyle='#b45309'; ctx.font='bold '+Math.round(cmPx(14))+'px sans-serif';
  ctx.fillText('读数特写 · 视线与液面相平',tx,cu.y0+cmPx(7));
  ctx.fillStyle='#1e293b'; ctx.font='bold '+Math.round(cmPx(19))+'px sans-serif';
  ctx.fillText('看到的 '+fmt(eyeApparent(),1)+' mL',tx,cu.y0+cmPx(26));   // 大字=看到的读数
  ctx.fillStyle='#64748b'; ctx.font=Math.round(cmPx(12))+'px sans-serif';
  ctx.fillText('真实读数 '+fmt(cylMlFor(effStage()),1)+' mL',tx,cu.y0+cmPx(44));   // 小字=真实读数（双值同帧对比，不出题不判分）
  var st=stone(),inCyl=(effStage()==='s2'&&st&&st.loc==='cyl');
  ctx.save(); ctx.beginPath(); ctx.rect(cu.x0,cu.y0,cu.x1-cu.x0,cu.y1-cu.y0); ctx.clip();
  PROPS.cylinder_grad(ctx,bc.x,bc.y,{h:bc.h,cap:CYL_CAP,div:CYL_DIV,water:cylFracFor(effStage()),
    liquidColor:effStage()==='s1'?brineLC(s1().rho):undefined,
    contents:inCyl?function(c,rect){
      var size=(rect.inR-rect.inL)*STONE_IN_CYL_K;   // F6 同主筒：入筒态压缩绘制系数单源
      var sinkY=rect.wy+(rect.inBot-rect.wy)*st.sinkP;
      PROPS.stone(c,rect.x,sinkY,{size:size,seed:st.seed,wet:st.wet});
    }:null});
  ctx.restore();
  var s=cuSurf(),e=eyePos(),hx=s.x-cylW(bc)/2;   // 视线虚线：眼→液面左缘（弯月面读数点）
  ctx.strokeStyle=eyeAligned()?'rgba(21,128,61,0.85)':'rgba(100,116,139,0.7)';
  ctx.lineWidth=1.6; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(hx,s.y); ctx.stroke();
  ctx.setLineDash([]);
  if(eyeAligned()){   // 平视对齐轻微视觉反馈（音效 playTick 在拖动进入容差时触发一次）
    ctx.beginPath(); ctx.arc(hx,s.y,cmPx(7),0,Math.PI*2);
    ctx.strokeStyle='rgba(21,128,61,0.6)'; ctx.lineWidth=2; ctx.stroke();
  }
  PROPS.observer_eye(ctx,e.x,e.y,{h:Math.round(cmPx(44)),dir:'right'});   // sprite 件：眼在筒左侧朝右；沿弧线上下拖动（θ 拖动映射语义不变）
  drawConfirmBtn();
}
function drawConfirmBtn(){
  var tg=confirmTarget(); if(!tg) return;
  var b=L.cu.btn,ok=eyeAligned();
  rrPath(b.x-b.w/2,b.y-b.h/2,b.w,b.h,8);
  ctx.fillStyle=ok?'rgba(22,163,74,0.9)':'rgba(148,163,184,0.55)'; ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='bold '+Math.round(cmPx(14))+'px sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(ok?'✓ 确认读数':'先平视液面',b.x,b.y);
}
/* ===== 总装 draw()：底色→共用器材→阶段器材（画家算法 y 降序）→拖拽件→读数 UI→特写区 ===== */
function paintBg(){   // §4 底色：亮底实验室浅暖墙 #f6f1e7 渐变 + wood_desk 木纹桌面（全章禁暗底）
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#f9f5ec'); g.addColorStop(0.7,'#f6f1e7'); g.addColorStop(1,'#efe7d8');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  PROPS.wood_desk(ctx,W,H,{by:L.by,fy:L.fy});
}
function beakerPos(){   // 烧杯当前位置（读数牌/密度牌跟随）
  var S=s1();
  if(S.beaker.loc==='pan') return {x:L.bal.g.panL.x,y:L.bal.panTop};
  return {x:S.beaker.x,y:S.beaker.y};
}
function brineTagRect(){   // G3b ρ牌几何单源（draw/dbg.rects 同读）
  var p=beakerPos(),cw=cmPx(150),ch=cmPx(30);
  // F5：基线上抬 cmPx(2)（原 cmPx(10) 净空不够，质量/密度牌压杯口椭圆）；tx 既有 clamp 保证不与特写区相交
  var tx=clamp(p.x-cw/2,4,L.cu.x0-cw-8),ty=Math.max(38,p.y-L.beaker.h-ch-cmPx(10)-cmPx(2));
  return {x:Math.round(tx),y:Math.round(ty),w:Math.round(cw),h:Math.round(ch)};
}
function drawBrineTag(){   // 盐水密度读数牌（实时 ρ 保留 2 位小数；鲜艳色只给密度读数与液体，§4）
  if(s1().beaker.loc!=='bench') return;   // G3b①：只在烧杯位于桌面（配盐阶段）绘制；上盘后隐藏（ρ 值仍在读数面板/数据表，不丢信息）——根除盘区 m 牌/记录钮/ρ牌互压
  var r=brineTagRect();
  ghostCard(r.x,r.y,r.w,r.h);
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#b45309'; ctx.font='bold '+Math.round(cmPx(15))+'px sans-serif';
  ctx.fillText('ρ盐水 = '+fmt(s1().rho,2)+' g/cm³',r.x+r.w/2,r.y+r.h/2);
}
function drawDragged(){
  var S=s1(),T=s2();
  if(S.drag&&S.drag.what==='beaker'){
    drawBeaker(S.beaker.x,S.beaker.y,L.beaker.h,S.pouring?-0.85:0);
  }else if(S.drag&&S.drag.what==='jar'){
    drawJar(S.jar.x,S.jar.y);
  }
  if(T.drag){ var st=stone(); if(st) drawStoneAt(st,st.x,st.y,stoneSize(st)); }
}
function drawCaptions(a1,a2){
  /* G1 caption 排布（打包布局后器材左移、间距变窄，F5 两行不够分）：
     行1=托盘天平（短）+食盐（短，jar 在最右，二者水平不相交）；
     行2=烧杯/小石块（分属两阶段不同时可见）；行3=量筒长文案独占（跨越多件正下方，任何行1/行2短文案不与其同行）。
     G3b③：烧杯 caption 仅 loc==='bench' 绘制——上盘后隐藏（盘区已有 m 牌，避免叠字） */
  caption(L.bal.x,L.seat+6,'托盘天平');
  if(a1>0){
    ctx.save(); ctx.globalAlpha=a1;
    if(s1().jar.loc==='bench') caption(s1().jar.x,L.seat+6,'食盐');
    if(s1().beaker.loc==='bench') caption(s1().beaker.x,L.seat+6+cmPx(15),'烧杯 · 盐水（选种用）');
    ctx.restore();
  }
  if(a2>0){
    ctx.save(); ctx.globalAlpha=a2;
    var st=stone();
    if(st&&st.loc==='bench') caption(st.x,L.seat+6+cmPx(15),'小石块（形状不规则 · 不吸水）');
    ctx.restore();
  }
  caption(L.cyl.x,L.seat+6+cmPx(30),'量筒：单位 mL · 最大测量值 100 mL · 分度值 5 mL');
}
function draw(){
  paintBg();
  drawBalance();
  var a1=stageAlpha('s1'),a2=stageAlpha('s2');
  if(a1>0){ ctx.save(); ctx.globalAlpha=a1; drawMainCyl('s1'); ctx.restore(); }
  if(a2>0){ ctx.save(); ctx.globalAlpha=a2; drawMainCyl('s2'); ctx.restore(); }
  var items=[];
  if(a1>0){
    var S=s1();
    if(S.beaker.loc==='bench') items.push({y:S.beaker.y,a:a1,d:function(){ drawBeaker(S.beaker.x,S.beaker.y,L.beaker.h,0); }});
    if(S.beaker.loc==='pan') items.push({y:L.bal.panTop,a:a1,d:function(){ drawBeaker(L.bal.g.panL.x,L.bal.panTop,Math.min(L.beaker.h,L.bal.panHW*2.4),0); }});
    if(S.jar.loc==='bench') items.push({y:S.jar.y,a:a1,d:function(){ drawJar(S.jar.x,S.jar.y); }});
  }
  if(a2>0){
    var st=stone();
    if(st&&st.loc==='bench') items.push({y:st.y,a:a2,d:function(){ drawStoneAt(st,st.x,st.y,stoneSize(st)); }});
    if(st&&st.loc==='pan') items.push({y:L.bal.panTop,a:a2,d:function(){ drawStoneAt(st,L.bal.g.panL.x,L.bal.panTop,Math.min(stoneSize(st),L.bal.panHW*1.7)); }});
  }
  items.sort(function(p,q){ return q.y-p.y; });   // R36：绘制前按 y 降序（画家算法）
  items.forEach(function(it){ ctx.save(); ctx.globalAlpha=it.a; it.d(); ctx.restore(); });
  if(a1>0&&s1().pouring){ ctx.save(); ctx.globalAlpha=a1; drawPourStream(); ctx.restore(); }
  drawDragged();
  drawBalReadout();
  if(a1>0){ ctx.save(); ctx.globalAlpha=a1; drawBrineTag(); ctx.restore(); }
  drawCloseup();
  drawCaptions(a1,a2);
}

/* ===== 交互层：拖拽/加盐/倾倒/浸没（P7 抓取放下语义；可拖件 cursor:pointer；禁绿箭头/虚线圈） ===== */
function inRect(p,x,y,w,h){ return p.x>=x&&p.x<=x+w&&p.y>=y&&p.y<=y+h; }
function beakerBox(){
  var p=beakerPos(),h=(s1().beaker.loc==='pan')?Math.min(L.beaker.h,L.bal.panHW*2.4):L.beaker.h,w=h*0.78;
  return {x:p.x-w/2,y:p.y-h,w:w,h:h};
}
function jarBox(){ var h=L.jar.h,w=h*0.66; return {x:s1().jar.x-w/2,y:s1().jar.y-h,w:w,h:h}; }
function stoneBox(){
  var st=stone(); if(!st) return null;
  if(st.loc==='pan'){ var s=Math.min(stoneSize(st),L.bal.panHW*1.7); return {x:L.bal.g.panL.x-s/2,y:L.bal.panTop-s*0.7,w:s,h:s*0.7}; }
  if(st.loc==='cyl'){ var gi=cylInner(L.cyl),sw=(gi.inR-gi.inL)*STONE_IN_CYL_K; return {x:gi.inL,y:gi.inBot-sw*0.7,w:gi.inR-gi.inL,h:sw*0.7}; }   // F6 命中盒与压缩绘制同系数
  var sz=stoneSize(st); return {x:st.x-sz/2,y:st.y-sz*0.7,w:sz,h:sz*0.7};
}
function hitBeaker(p){ return state.stage==='s1'&&!state.animating&&inRect(p,beakerBox().x,beakerBox().y,beakerBox().w,beakerBox().h); }
function hitJar(p){ var b=jarBox(); return state.stage==='s1'&&!state.animating&&inRect(p,b.x,b.y,b.w,b.h); }
function hitStone(p){ var b=stoneBox(); return state.stage==='s2'&&!state.animating&&b&&inRect(p,b.x,b.y,b.w,b.h); }
function hitEye(p){ if(state.animating) return false; var e=eyePos(),r=cmPx(30); return Math.abs(p.x-e.x)<r&&Math.abs(p.y-e.y)<r; }
function hitConfirm(p){ if(!confirmTarget()) return false; var b=L.cu.btn; return inRect(p,b.x-b.w/2,b.y-b.h/2,b.w,b.h); }
function hitCylEmpty(p){   // 阶段二点空量筒=注水（水位连续插值约 1s）
  if(state.stage!=='s2'||state.animating||s2().injected) return false;
  return Math.abs(p.x-L.cyl.x)<cylW(L.cyl)&&p.y>L.cyl.y-L.cyl.h&&p.y<L.cyl.y;
}
function overPan(p){ return Math.abs(p.x-L.bal.g.panL.x)<L.bal.panHW+cmPx(14)&&Math.abs(p.y-L.bal.panTop)<cmPx(46); }
/* F1 悬空判定（两处语义一致）：源容器口 y 必须高于目标容器口 y 至少 cmPx(MOUTH_LIFT)=悬空于口部上方；
   水平=源口中心 x 落在目标口部范围内（烧杯口±0.45倍杯口宽 / 量筒口±0.6倍筒口宽）；
   贴桌面平移经过一律不触发（源口与目标口几乎同高时垂直条件天然不满足）；MOUTH_BAND=悬空带上限，超出视为非口部上方；
   触发/停止仍走连续插值（pour 角 tween、液面连续），禁跳变 */
var MOUTH_LIFT=3,MOUTH_BAND=70;   // 悬空阈值 cm / 悬空带上限 cm（均经 cmPx() 随 H 缩放）
function overCylMouth(p){   // 倾倒区：烧杯口悬空于量筒口上方（p=烧杯口近似点）
  var my=L.cyl.y-L.cyl.h;   // 量筒口 y
  return p.y<my-cmPx(MOUTH_LIFT)&&p.y>my-cmPx(MOUTH_BAND)&&Math.abs(p.x-L.cyl.x)<cylW(L.cyl)*0.6;
}
function nearBeakerMouth(p){   // 加盐区：盐罐口悬空于烧杯口上方（p=盐罐口近似点）
  var b=beakerBox(),mx=b.x+b.w/2;   // 烧杯口中心/口宽=b.w
  return p.y<b.y-cmPx(MOUTH_LIFT)&&p.y>b.y-cmPx(MOUTH_BAND)&&Math.abs(p.x-mx)<b.w*0.45;
}
function ptOf(ev){ var r=cv.getBoundingClientRect(); return {x:ev.clientX-r.left,y:ev.clientY-r.top}; }
cv.addEventListener('pointerdown',function(ev){
  if(state.animating) return;
  var p=ptOf(ev);
  if(hitRecord(p)){ doRecord(); return; }   // F2 记录按钮（画布按钮家族，先于拖拽命中）
  if(hitConfirm(p)){ doConfirm(); return; }
  if(hitEye(p)){ state.eyeDrag=true; if(window.playPick)playPick(); try{cv.setPointerCapture(ev.pointerId);}catch(e){} dirty=true; return; }
  if(hitCylEmpty(p)){ s2().injected=true; s2SetWater(INJECT_ML,INJECT_MS); if(window.playDrop)playDrop(); updateHint(); return; }
  if(state.stage==='s1'){
    var S=s1();
    if(S.drag) return;
    if(hitJar(p)){
      S.drag={what:'jar',dx:S.jar.x-p.x,dy:S.jar.y-p.y};
      if(window.playPick)playPick();
      try{cv.setPointerCapture(ev.pointerId);}catch(e){}
      dirty=true; updateHint(); return;
    }
    if(hitBeaker(p)){
      S.drag={what:'beaker',dx:beakerPos().x-p.x,dy:beakerPos().y-p.y};
      S.beaker.loc='drag'; S.beaker.x=p.x+S.drag.dx; S.beaker.y=p.y+S.drag.dy;
      if(window.playPick)playPick();
      try{cv.setPointerCapture(ev.pointerId);}catch(e){}
      dirty=true; updateHint(); return;
    }
  }else{
    var st=stone();
    if(!st||s2().drag) return;
    if(hitStone(p)){
      if(st.loc==='cyl'){   // 从筒中取出：水位连续回落到 V₁（物理=取出石块排水量消失）
        var T=s2();
        if(T.cur.v1!=null){ s2SetWater(T.cur.v1,TWEEN_MS*2); }
        else if(st.vBase!=null){ s2SetWater(st.vBase,TWEEN_MS*2); }   // 未读 V₁ 就取出：回落到浸没前基准（排水量消失）
        T.cur.v2=null; st.sinkP=1; st.sinkTw=null;
        renderS2Table(-1);
      }
      s2().drag={dx:(st.loc==='pan'?L.bal.g.panL.x:st.x)-p.x,dy:(st.loc==='pan'?L.bal.panTop:st.y)-p.y};
      st.loc='drag'; st.x=p.x+s2().drag.dx; st.y=p.y+s2().drag.dy;
      if(window.playPick)playPick();
      try{cv.setPointerCapture(ev.pointerId);}catch(e){}
      dirty=true; updateHint();
    }
  }
});
var lastMoveT=0;
cv.addEventListener('pointermove',function(ev){
  var p=ptOf(ev),now=performance.now();
  if(state.eyeDrag){   // 方案乙：眼沿弧线上下拖动，视线实时随动（θ=atan2 投影回 eyeT）
    var s=cuSurf(),dx=s.x-p.x,dy=p.y-s.y;
    var th=(dx>1)?Math.atan2(dy,dx):(dy>0?EYE_RANGE:-EYE_RANGE);
    state.eyeT=clamp((clamp(th,-EYE_RANGE,EYE_RANGE)/EYE_RANGE+1)/2,0,1);
    if(eyeAligned()&&!state.eyeAlignBeep){ state.eyeAlignBeep=true; if(window.playTick)playTick(); }   // 平视对齐轻微反馈
    if(!eyeAligned()) state.eyeAlignBeep=false;
    dirty=true; return;
  }
  var S=s1();
  if(S.drag){
    if(S.drag.what==='jar'){ S.jar.x=p.x+S.drag.dx; S.jar.y=p.y+S.drag.dy; }
    else{ S.beaker.x=p.x+S.drag.dx; S.beaker.y=p.y+S.drag.dy; }
    if(window.playTick&&now-lastMoveT>130){ lastMoveT=now; playTick(); }
    dirty=true; return;
  }
  if(s2().drag){
    var st=stone();
    st.x=p.x+s2().drag.dx; st.y=p.y+s2().drag.dy;
    if(window.playTick&&now-lastMoveT>130){ lastMoveT=now; playTick(); }
    dirty=true; return;
  }
  var hov=hitConfirm(p)||hitRecord(p)||hitEye(p)||hitCylEmpty(p)||(state.stage==='s1'?(hitBeaker(p)||hitJar(p)):hitStone(p));
  cv.style.cursor=hov?'pointer':'default';
});
function endDrag(){
  state.eyeDrag=false;
  var S=s1();
  if(S.drag&&S.drag.what==='jar'){   // 盐罐落回台面（任意位置），倾倒角回正
    S.drag=null; S.jar.loc='bench';
    S.jar.x=benchClampX(L.desk.hw.jar,S.jar.x); S.jar.y=L.seat;   // G1：回域=packDesk 半宽单源
    S.jar.pourTw={t0:performance.now(),from:S.jar.pour};
    if(window.playDrop)playDrop();
  }else if(S.drag&&S.drag.what==='beaker'){
    S.drag=null; S.pouring=false;
    var p={x:S.beaker.x,y:S.beaker.y};
    if(overPan(p)){
      S.beaker.loc='pan'; balSettle();
      if(window.playDrop)playDrop();
    }else{
      S.beaker.loc='bench';
      S.beaker.x=benchClampX(L.desk.hw.beaker,p.x); S.beaker.y=L.seat;   // G1：回域=packDesk 半宽单源
      if(window.playDrop)playDrop();
    }
  }
  if(s2().drag){
    var st=stone(); s2().drag=null;
    var p2={x:st.x,y:st.y};
    if(overPan(p2)){
      st.loc='pan'; balSettle();
      if(window.playDrop)playDrop();
    }else if(Math.abs(p2.x-L.cyl.x)<cylW(L.cyl)*1.2&&p2.y<L.cyl.y&&p2.y>L.cyl.y-L.cyl.h-cmPx(70)){
      submergeStone();   // 拖入量筒→沉底（ρ石>ρ水，不漂浮不吸水）
    }else{
      st.loc='bench';
      st.x=benchClampX(L.desk.hw.stone,p2.x,true); st.y=L.seat;   // G1：回域=packDesk 半宽单源（上界与 stoneSpot 同源）
      if(window.playDrop)playDrop();
    }
  }
  updatePanel(); updateHint(); dirty=true;
}
window.addEventListener('pointerup',endDrag);
window.addEventListener('pointercancel',endDrag);
/* 浸没石块：沉底单调插值（终态严格=筒底不回弹）；水位=原水位+V石·浸没进度，任意帧成立、终帧 V₂=V₁+V石 */
function submergeStone(){
  var st=stone(),T=s2();
  st.loc='cyl'; st.sinkP=0;
  st.vBase=T.waterMl||0;   // 浸没起点水位（排水基准）
  st.sinkTw={t0:performance.now()};
  if(window.playDrop)playDrop();
  updateHint(); dirty=true;
}
function stoneSinkTick(now){
  var st=stone(); if(!st||!st.sinkTw) return false;
  var t=clamp((now-st.sinkTw.t0)/SINK_MS,0,1),p=easeOut(t);
  st.sinkP=p; st.wet=p;   // wet 0→1 湿水态色加深
  s2().waterMl=clamp(st.vBase+st.V*p,0,CYL_CAP);   // 排水恒等式逐帧：水位=原水位+已浸没体积
  if(t>=1){ st.sinkTw=null; st.sinkP=1; s2().waterMl=st.vBase+st.V; if(window.playTick)playTick(); }
  dirty=true; return true;
}
/* 连续动作 tick：加盐（拖盐罐悬于杯口）/ 倾倒（拖烧杯悬于筒口，学生控量）——dt 驱动连续插值禁跳变 */
function actionTick(now,dt){
  var S=s1(),act=false;
  if(state.stage==='s1'&&!state.animating){
    if(S.drag&&S.drag.what==='jar'){
      var mouthNear=nearBeakerMouth({x:S.jar.x,y:S.jar.y-L.jar.h*0.85});
      var tgtP=mouthNear?1:0;
      if(S.jar.pour!==tgtP){ S.jar.pourTw={t0:now,from:S.jar.pour,to:tgtP}; }
      if(mouthNear&&S.rho<RHO_MAX){ setSaltRho(S.rho+SALT_RATE*dt/100); act=true; }   // ρ 单调递增封顶 1.20
    }
    if(S.jar.pourTw){
      var pt=clamp((now-S.jar.pourTw.t0)/TWEEN_MS,0,1);
      S.jar.pour=S.jar.pourTw.from+((S.jar.pourTw.to==null?0:S.jar.pourTw.to)-S.jar.pourTw.from)*easeOut(pt);
      if(pt>=1) S.jar.pourTw=null;
      act=true;
    }
    if(S.drag&&S.drag.what==='beaker'){
      // F3 前置锁：m₁ 未记录 → 悬于筒口也不触发倾倒（教材 P149 顺序：先测杯和盐水总质量 m₁，再倒入量筒）
      var canPour=(S.m1!==null)&&overCylMouth({x:S.beaker.x,y:S.beaker.y-L.beaker.h*0.8})&&S.beakerVol>0.05;
      if(canPour!==S.pouring){ S.pouring=canPour; updateHint(); }
      if(canPour){
        var mv=Math.min(POUR_RATE*dt,S.beakerVol);
        S.beakerVol-=mv; S.cylMl+=mv; act=true;
        // 读数后又加液→V/ρ 作废重读；F3：done 一并撤销（重记 m₂+重读 V 再闭环，分次倒液场景 m 与 V 天然对齐）
        if(S.vConf!==null||S.done){ S.vConf=null; S.done=false; fillCell('s1-c4','—',true); fillCell('s1-c5','—',true); updateHint(); }
      }
    }
    if(S.grainTo!==S.grainT){   // 种粒浮沉 t 线性驱动（组件内 smoothstep，约 1.2s，禁回弹震荡 P6）
      var gt=clamp((now-S.grainT0)/GRAIN_MS,0,1);
      S.grainT=S.grainFrom+(S.grainTo-S.grainFrom)*gt;
      if(gt>=1) S.grainT=S.grainTo;
      act=true;
    }
  }
  return act;
}
/* ===== 测量落格（F2：阶段一=显式「记录」按钮入表，放上托盘只稳读数不入表；阶段二石块保留自动落格；平衡判据 R10/R20=倾角归零唯一点） ===== */
function fillCell(id,val,empty){
  var el=document.getElementById(id); if(!el) return;
  el.textContent=val;
  if(empty) el.classList.add('empty'); else el.classList.remove('empty');
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');   // 落格高亮 300ms（CSS cellFlash）
}
function measureTick(){   // 由 balTick 归零瞬间/endDrag 触发（事件驱动，不进 busy 循环）
  if(!balLeveled()) return;
  if(effStage()==='s1'){ updateHint(); dirty=true; return; }   // F2：读数稳定→「记录」按钮出现（recTarget 判定），点击才入表
  var st=stone(),T=s2();
  if(st&&st.loc==='pan'&&T.cur.m===null){
    T.cur.m=st.m; renderS2Table([0]); openTable();
    if(window.playTick)playTick(); updatePanel(); updateHint();
  }
}
/* 差值法 m=m₁−m₂ 与 ρ=m/V（单源：m₂=brineMass(Vb−V倒) → m₁−m₂=ρ配·V倒 → ρ表=ρ配 恒等，|ρ表−ρ配|≤0.01）
   F3：m₂ 覆盖式重记 → 每次记录/确认都重算 c3=m₁−m₂ 与 c5=ρ（V 取当前已确认读数）；toast 只在首次完成时报一次 */
function s1TryFinish(){
  var S=s1();
  if(S.m1!==null&&S.m2!==null) fillCell('s1-c3',fmt(S.m1-S.m2,1));
  if(S.m1!==null&&S.m2!==null&&S.vConf!==null){
    var m=S.m1-S.m2,rho=m/S.vConf,first=!S.done;
    fillCell('s1-c5',fmt(rho,2));
    S.done=true;
    if(first) toast('测得盐水密度 ρ=m/V='+fmt(m,1)+' g ÷ '+fmt(S.vConf,1)+' cm³ = '+fmt(rho,2)+' g/cm³');
    updateHint();
  }
}
function s2CurCalc(){
  var c=s2().cur;
  if(c.v1!=null&&c.v2!=null&&c.m!=null) return {v:c.v2-c.v1,rho:c.m/(c.v2-c.v1)};
  return {v:(c.v1!=null&&c.v2!=null)?c.v2-c.v1:null,rho:null};
}
function s2TryFinish(){
  var c=s2().cur,r=s2CurCalc();
  if(r.rho!=null&&!c.done){
    c.done=true;
    toast('排水法：V=V₂−V₁='+fmt(r.v,1)+' cm³，ρ=m/V='+fmt(c.m,1)+'/'+fmt(r.v,1)+'='+fmt(r.rho,2)+' g/cm³');
    updateHint();
  }
}
function renderS2Table(flashCols){   // 记录表（教材「记录在自己设计的表格中」→ 五列；换石块多行对比）
  var tb=document.getElementById('s2-rows'); if(!tb) return;
  var rows=s2().rows.map(function(r){ return {m:r.m,v1:r.v1,v2:r.v2,v:r.v2-r.v1,rho:r.m/(r.v2-r.v1)}; });
  var c=s2().cur,rc=s2CurCalc();
  rows.push({m:c.m,v1:c.v1,v2:c.v2,v:rc.v,rho:rc.rho});
  function cell(v,n){ return v==null?'<td class="empty">—</td>':'<td>'+fmt(v,n)+'</td>'; }
  var html='';
  rows.forEach(function(r){ html+='<tr>'+cell(r.m,1)+cell(r.v1,1)+cell(r.v2,1)+cell(r.v,1)+cell(r.rho,2)+'</tr>'; });
  tb.innerHTML=html;
  var tr=tb.rows[tb.rows.length-1];
  if(tr&&(flashCols||[]).length) flashCols.forEach(function(ci){
    if(tr.cells[ci]){ tr.cells[ci].classList.remove('flash'); void tr.cells[ci].offsetWidth; tr.cells[ci].classList.add('flash'); }
  });
}
function doConfirm(){   // 特写区「确认读数」：视线与液面相平才有效（不出题不判分，现象自己说话）
  var tg=confirmTarget(); if(!tg) return;
  if(!eyeAligned()){ toast('读数时视线要与液面相平——俯视读数偏大、仰视读数偏小（教材 P149）'); return; }
  if(window.playTick)playTick();
  if(tg==='s1v'){
    var S=s1(); S.vConf=S.cylMl;
    fillCell('s1-c4',fmt(S.vConf,1)); openTable(); s1TryFinish();
  }else if(tg==='v1'){
    s2().cur.v1=s2().waterMl; renderS2Table([1]); openTable();
  }else if(tg==='v2'){
    s2().cur.v2=s2().waterMl; renderS2Table([2,3,4]); s2TryFinish(); openTable();
  }
  updatePanel(); updateHint(); dirty=true;
}
/* ===== 读数面板/数据表浮层（幽灵化，openPanel 单入口互斥；位置 pickSlot 选空位禁硬编码，R9 通则） ===== */
function rectInterArea(a,r){
  var x0=Math.max(a.x,r.x),y0=Math.max(a.y,r.y),x1=Math.min(a.x+a.w,r.x+r.w),y1=Math.min(a.y+a.h,r.y+r.h);
  return (x1>x0&&y1>y0)?(x1-x0)*(y1-y0):0;
}
function pickSlot(needW,needH,avoidRects){   // 候选槽：左上→右上→左下(控制栏上方)→右下；取首个零相交，全相交取重叠面积最小
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
function balAvoidRect(){   // 天平器材包围盒（balGeom 同源：横梁+挂盘横展）
  var B=L.bal,halfW=B.panDx+B.panHW+6,y0=B.g.beamY-B.h*0.08;
  return {x:B.x-halfW,y:y0,w:halfW*2,h:(B.y+4)-y0};
}
function sceneAvoidRects(){   // 避让矩形一律取自 layout() 实际绘制区常量（禁像素猜测）
  var rs=[{x:0,y:H-ctrlBandH,w:W,h:ctrlBandH+40}];
  var hr=hintRectCanvas(); if(hr) rs.push(hr);
  rs.push(balAvoidRect());
  rs.push({x:L.cyl.x-90,y:L.cyl.y-L.cyl.h-52,w:180,h:L.cyl.h+56});   // 主量筒+差值标注
  rs.push({x:L.cu.x0,y:L.cu.y0,w:L.cu.x1-L.cu.x0,h:L.cu.y1-L.cu.y0}); // 三视线特写区
  rs.push({x:L.beaker.x-cmPx(80),y:L.seat-L.beaker.h-cmPx(46),w:cmPx(170),h:L.beaker.h+cmPx(50)});   // 烧杯+密度牌
  rs.push({x:L.stoneSpot.x-cmPx(40),y:L.seat-cmPx(60),w:cmPx(80),h:cmPx(64)});                       // 石块台面位
  return rs;
}
function placePanel(id){
  var el=document.getElementById(id); if(!el) return null;
  var slot=pickSlot(el.offsetWidth||300,el.offsetHeight||240,sceneAvoidRects());
  el.style.right='auto'; el.style.bottom='auto';
  el.style.left=slot.x+'px'; el.style.top=slot.y+'px';
  return slot;
}
function repositionPanels(){ if(openP==='read') placePanel('panel-read'); if(openP==='table') placePanel('panel-table'); }
var openP=null;
function syncPanelSections(){   // 面板内容随阶段切换（两阶段各自独立表，互不清空）
  var s1on=(state.stage==='s1');
  var e1=document.getElementById('sec-s1'),e2=document.getElementById('sec-s2');
  if(e1) e1.style.display=s1on?'block':'none';
  if(e2) e2.style.display=s1on?'none':'block';
  var t1=document.getElementById('tbl-s1'),t2=document.getElementById('tbl-s2');
  if(t1) t1.style.display=s1on?'block':'none';
  if(t2) t2.style.display=s1on?'none':'block';
  setText('tb-title',s1on?'数据表（教材 P149）':'记录表（自己设计的表格）');
}
function openPanel(name){
  openP=(openP===name)?null:name;
  document.getElementById('panel-read').classList.toggle('show',openP==='read');
  document.getElementById('panel-table').classList.toggle('show',openP==='table');
  var br=document.getElementById('btn-read'),bt=document.getElementById('btn-table');
  if(br) br.classList.toggle('on',openP==='read');
  if(bt) bt.classList.toggle('on',openP==='table');
  syncPanelSections();
  if(openP==='read'){ updatePanel(); placePanel('panel-read'); }
  if(openP==='table'){ renderS2Table([]); placePanel('panel-table'); }
}
function openTable(){ if(openP!=='table') openPanel('table'); }   // 首次落格自动打开数据表（落格高亮可见）
function setText(id,t){ var el=document.getElementById(id); if(el&&el.textContent!==t) el.textContent=t; }
function updatePanel(){
  var S=s1(),T=s2(),st=stone(),r=s2CurCalc();
  setText('s1p-rho',fmt(S.rho,2)+' g/cm³'+(S.rho>=HOLLOW_CRIT?'（可选种）':''));
  setText('s1p-m1',S.m1!==null?fmt(S.m1,1)+' g':'未测');
  setText('s1p-m2',S.m2!==null?fmt(S.m2,1)+' g':'未测');
  setText('s1p-m',(S.m1!==null&&S.m2!==null)?fmt(S.m1-S.m2,1)+' g':'—');
  setText('s1p-v',S.vConf!==null?fmt(S.vConf,1)+' cm³':'—');
  setText('s1p-rhot',(S.m1!==null&&S.m2!==null&&S.vConf!==null)?fmt((S.m1-S.m2)/S.vConf,2)+' g/cm³':'—');
  setText('s2p-id',st?('石块 #'+st.seed+'（ρ设定 '+fmt(st.rho,2)+'）'):'—');
  setText('s2p-m',T.cur.m!==null?fmt(T.cur.m,1)+' g':'未测');
  setText('s2p-v1',T.cur.v1!==null?fmt(T.cur.v1,1)+' cm³':'未读');
  setText('s2p-v2',T.cur.v2!==null?fmt(T.cur.v2,1)+' cm³':'未读');
  setText('s2p-v',r.v!==null?fmt(r.v,1)+' cm³':'—');
  setText('s2p-rho',r.rho!==null?fmt(r.rho,2)+' g/cm³':'—');
}
/* ===== hint 橙色解说条：当前可见分支教当前可做的操作（知识点保真：教材原文照录，禁改） ===== */
var hintTimer=null,hintOverride=null,HINT_LIFE=8000;
function updateHint(){
  if(!hintEl) return;
  clearTimeout(hintTimer);
  if(state.animating){ hintEl.style.opacity='0'; return; }
  placeHint();
  hintEl.textContent=hintOverride||hintText(); hintOverride=null;
  hintEl.style.opacity='1';
  hintTimer=setTimeout(function(){ if(hintEl&&!state.animating) hintEl.style.opacity='0'; },HINT_LIFE);
}
function hintText(){
  if(state.stage==='s1'){
    var S=s1();
    if(S.drag&&S.drag.what==='jar') return '把盐罐悬空在烧杯口正上方加盐（口部高于杯口才算数，贴桌面平移经过不会加盐）：加盐越多 ρ盐水 越大（1.00→1.20 g/cm³）。ρ≥1.05 后空瘪粒上浮、饱满粒沉底——「清除水面漂浮的空粒、瘪粒，就可以选出较好的种子」（教材 P149 选种）';
    if(S.drag&&S.drag.what==='beaker'&&S.m1===null) return '先把烧杯放上天平左盘，读数稳定后点「记录 m₁」入表（教材 P149 顺序：先测出杯和盐水的总质量 m₁，再倒入量筒）——m₁ 未记录前，悬于筒口上方不会倾倒';
    if(S.pouring) return '倾倒中……松开或把烧杯移离筒口即停止；倒入约 40~60 mL 为宜';
    if(S.done) return '完成（教材 P149 思路）：首先测出盐水的质量和体积，然后通过公式 ρ=m/V 就能计算出盐水的密度。可继续倒液/重记 m₂ 复测（后记覆盖前记），或切「测石块」阶段，或按重置再测一遍';
    if(S.m1!==null&&S.m2!==null&&S.vConf!==null) return '正在算 ρ=m/V……';
    if(S.m1!==null&&S.vConf!==null&&S.m2===null) return 'V 已读。把烧杯（含剩余盐水）放回天平左盘，读数稳定后点「记录 m₂」——量筒中盐水的质量 m=m₁−m₂ 自动算出（差值法；m₂ 可多次记录，后记覆盖前记）';
    if(S.m1!==null&&S.cylMl>0.05&&S.vConf===null) return '读 V（量筒使用②：读数时视线要与液面相平）：在右侧特写区上下拖动眼睛，俯视读数偏大、仰视偏小；平视后按「✓ 确认读数」';
    if(S.m1!==null&&S.cylMl<=0.05) return 'm₁ 已记录。把烧杯拖到量筒口正上方悬空倾倒盐水——按住持续倒、移开即停，倒入约 40~60 mL';
    if(S.rho>RHO_MIN) return '盐水已配好（ρ='+fmt(S.rho,2)+' g/cm³'+(S.rho>=HOLLOW_CRIT?'，可完成选种':'，未到选种临界 1.05，可继续加盐')+'）。把烧杯拖到天平左盘，读数稳定后点「记录 m₁」';
    return '阶段一（教材 P149）：自己用盐和水配制一杯盐水，测出它的质量和体积。① 拖盐罐悬空到烧杯口上方加盐配盐水（选种：ρ≥1.05 空瘪粒上浮）② 拖烧杯上天平左盘，读数稳定后点「记录 m₁」入表';
  }
  var T=s2(),st=stone();
  if(T.cur.m===null) return '第1步（教材 P150）：用天平测量小石块的质量——把石块拖到天平左盘，读数稳定后自动记录在自己设计的表格中';
  if(!T.injected) return '第2步：点击量筒注水（约 60 mL 适量水），然后在右侧特写区读 V₁';
  if(T.cur.v1===null) return '读 V₁：上下拖动眼睛使视线与液面相平（量筒使用②），按「✓ 确认读数」记录量筒中水的体积 V₁';
  if(st&&st.loc!=='cyl'&&T.cur.v2===null) return '第3步：把小石块拖入量筒——ρ石>ρ水，石块沉底且不吸水，水位升高的体积就是石块的体积（排水法，教材 P150 图6.3-3）';
  if(T.cur.v2===null) return '石块已浸没沉底。在特写区平视读出「水和小石块的总体积 V₂」并确认——V=V₂−V₁ 自动算出';
  if(T.cur.m!==null&&T.cur.v2!==null&&!T.cur.done) return '把石块拖上天平左盘补测质量 m，即可算出 ρ=m/V';
  return '完成（教材 P150 三步）：测质量 m → 排水法测体积 V=V₂−V₁ → ρ=m/V。按「换石块」再测一块：同种物质密度一定（呼应第2节）';
}
var toastT=null;
function toast(msg){
  var t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('show'); },3200);
}
function hideToast(){ var t=document.getElementById('toast'); if(t) t.classList.remove('show'); }
/* ===== 阶段切换（两态钮「测盐水 ⇄ 测石块」；轻量交叉淡入淡出 300ms + animating 锁输入；两阶段状态完全隔离） ===== */
function setStage(to){
  if(state.animating||to===state.stage) return;
  state.anim={from:state.stage,to:to,t0:performance.now()};
  state.stage=to; state.animating=true;
  hideToast(); syncGroups(); placeHint(); repositionPanels();
  if(to==='s2'&&!s2().firstHintShown){   // 首次切到阶段二：教材 P150 原句过渡
    s2().firstHintShown=true;
    hintOverride='想一想：对于形状不规则的固体，又该如何测量它的密度呢？（教材 P150）——第1步：把小石块拖到天平左盘测质量 m';
  }
  updateHint();
  if(window.playClick) playClick();
  dirty=true;
}
function syncGroups(){
  var b1=document.getElementById('btn-stage-s1'),b2=document.getElementById('btn-stage-s2');
  if(b1) b1.classList.toggle('on',state.stage==='s1');
  if(b2) b2.classList.toggle('on',state.stage==='s2');
  var bn=document.getElementById('btn-newstone');
  if(bn) bn.style.display=(state.stage==='s2')?'':'none';
  syncPanelSections();
}
/* ===== 重置（两阶段独立重置，不清对方数据表；回到各自初始态） ===== */
function resetS1(){
  var S=s1();
  S.rho=RHO_MIN; S.beakerVol=BEAKER_INIT_ML; S.cylMl=0;
  S.m1=null; S.m2=null; S.vConf=null; S.done=false; S.pouring=false; S.drag=null;
  S.beaker.loc='bench'; S.beaker.x=L.beaker.x; S.beaker.y=L.seat;
  S.jar.loc='bench'; S.jar.x=L.jar.x; S.jar.y=L.seat; S.jar.pour=0; S.jar.pourTw=null;
  S.grainT=0; S.grainFrom=0; S.grainTo=0; S.grainT0=0;
  state.bal.tilt=0; state.bal.tw=null;
  ['s1-c1','s1-c2','s1-c3','s1-c4','s1-c5'].forEach(function(id){
    var el=document.getElementById(id); if(el){ el.textContent='—'; el.classList.add('empty'); }
  });
  updatePanel(); updateHint(); dirty=true;
}
function resetS2(){
  var T=s2();
  T.rows=[]; T.cur={m:null,v1:null,v2:null,done:false};
  T.injected=false; T.waterMl=0; T.waterTw=null; T.drag=null; T.firstHintShown=false;
  T.seed=7; T.stone=mkStone(7); T.stone.x=L.stoneSpot.x; T.stone.y=L.stoneSpot.y;
  state.bal.tilt=0; state.bal.tw=null;
  renderS2Table([]); updatePanel(); updateHint(); dirty=true;
}
/* 换石块重测（可选钮）：完成行入多行对比（最多留 2 行历史），新石块=不同 seed/体积、同材质族 ρ 2.5~2.8 */
function changeStone(){
  var T=s2(),st=stone();
  if(T.cur.m!=null&&T.cur.v1!=null&&T.cur.v2!=null) T.rows.push({m:T.cur.m,v1:T.cur.v1,v2:T.cur.v2,seed:st?st.seed:0});
  if(T.rows.length>2) T.rows.shift();
  if(st&&st.loc==='cyl'&&T.cur.v1!=null) s2SetWater(T.cur.v1,TWEEN_MS*2);   // 取出石块：水位连续回落 V₁
  else if(st&&st.loc==='cyl'&&st.vBase!=null) s2SetWater(st.vBase,TWEEN_MS*2);   // 未读 V₁：回落浸没前基准
  T.cur={m:null,v1:null,v2:null,done:false};
  newStone(); renderS2Table([]); updatePanel(); updateHint();
  if(window.playClick) playClick();
  dirty=true;
}
function reflow(){   // resize/全屏重算一切：台面件回域（G1：clamp 界=packDesk 半宽单源，禁写死像素/旧比例常量）
  var S=s1();
  if(S.beaker.loc==='bench'){ S.beaker.x=benchClampX(L.desk.hw.beaker,S.beaker.x||L.beaker.x); S.beaker.y=L.seat; }
  if(S.jar.loc==='bench'){ S.jar.x=benchClampX(L.desk.hw.jar,S.jar.x||L.jar.x); S.jar.y=L.seat; }
  var st=stone();
  if(st&&st.loc==='bench'){ st.x=benchClampX(L.desk.hw.stone,st.x||L.stoneSpot.x,true); st.y=L.seat; }
}
/* ===== 控制栏接线 ===== */
var btnStageS1=document.getElementById('btn-stage-s1'),btnStageS2=document.getElementById('btn-stage-s2');
if(btnStageS1) btnStageS1.addEventListener('click',function(){ if(state.animating)return; setStage('s1'); });
if(btnStageS2) btnStageS2.addEventListener('click',function(){ if(state.animating)return; setStage('s2'); });
var btnTable=document.getElementById('btn-table');
if(btnTable) btnTable.addEventListener('click',function(){ if(state.animating)return; openPanel('table'); if(window.playClick)playClick(); });
var btnNewstone=document.getElementById('btn-newstone');
if(btnNewstone) btnNewstone.addEventListener('click',function(){ if(state.animating)return; changeStone(); });
var btnRead=document.getElementById('btn-read');
if(btnRead) btnRead.addEventListener('click',function(){ if(state.animating)return; openPanel('read'); if(window.playClick)playClick(); });
/* R34 标注开关：默认关；只 gate 器材 caption，不 gate 读数类（面板/记录表/解说条）；重置不影响 */
var btnLabels=document.getElementById('btn-labels');
if(btnLabels) btnLabels.addEventListener('click',function(){
  if(state.animating) return;
  state.showLabels=!state.showLabels;
  btnLabels.classList.toggle('on',state.showLabels);
  if(window.playClick) playClick();
  dirty=true;
});
var btnReset=document.getElementById('btn-reset');
if(btnReset) btnReset.addEventListener('click',function(){
  if(state.animating) return;
  if(state.stage==='s1') resetS1(); else resetS2();
  hideToast();
  if(window.playClick) playClick();
  dirty=true;
});
/* F3 阶段一重置钮（与「重置」并存，语义差异：「重置」=只重置当前所选阶段（阶段二时含石块/多行表）；
   「重置阶段一」=不论当前在哪个阶段，都把阶段一回初始态（清水 ρ=1.00、种粒全沉、空量筒、空数据表、盐罐/烧杯回初始位），阶段二数据不动 */
var btnResetS1=document.getElementById('btn-reset-s1');
if(btnResetS1) btnResetS1.addEventListener('click',function(){
  if(state.animating) return;
  resetS1(); hideToast();
  if(window.playClick) playClick();
  dirty=true;
});
var btnMute=document.getElementById('btn-mute');
if(btnMute) btnMute.addEventListener('click',function(){ if(state.animating)return; window.muted=!window.muted; btnMute.textContent=window.muted?'🔇':'🔊'; if(window.playClick)playClick(); });
/* 全屏（c5s1/c6s2 路线：documentElement + html.pseudo-fs 降级） */
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
/* ===== 动画 tick（rAF 驱动：阶段包络/天平均衡/液位/沉石/加盐/倾倒/种粒浮沉） ===== */
var lastNow=performance.now();
function busy(now){
  var dt=clamp((now-lastNow)/1000,0,0.05); lastNow=now;
  var act=false;
  if(state.animating){
    if(now-state.anim.t0>=XFADE_MS){ state.animating=false; state.anim=null; updateHint(); }
    return true;   // 切换窗口内锁全部输入（animating 门在 pointerdown/move 与各钮）
  }
  if(balTick(now)) act=true;
  if(s2WaterTween(now)) act=true;
  if(stoneSinkTick(now)) act=true;
  if(actionTick(now,dt)) act=true;
  return act;
}
function tick(now){
  var n=now||performance.now();
  if(busy(n)||dirty){ dirty=false; draw(); }
  requestAnimationFrame(tick);
}
/* ===== init ===== */
function measureTablePanel(){   // G3a：init 实测数据表面板高（display:none→临时显示隐藏测），供 TABLE_BAND 预留；面板未打开也预留禁跳变
  var el=document.getElementById('panel-table'); if(!el) return 0;
  var t1=document.getElementById('tbl-s1'),t2=document.getElementById('tbl-s2');
  var wasShow=el.classList.contains('show'),d1=t1?t1.style.display:'',d2=t2?t2.style.display:'';
  el.style.visibility='hidden'; el.classList.add('show');
  if(t1) t1.style.display='block';
  if(t2) t2.style.display='block';   // 两表叠放量上限（s2 多行+注脚更高，预留取最不利）
  var h=el.getBoundingClientRect().height||0;
  if(t1) t1.style.display=d1;
  if(t2) t2.style.display=d2;
  if(!wasShow) el.classList.remove('show');
  el.style.visibility='';
  return h;
}
TABLE_PANEL_H=measureTablePanel();
layout();
resetS1(); resetS2();
resize();
syncGroups(); syncFull(); updatePanel(); renderS2Table([]); updateHint(); draw();
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); layout(); reflow(); placeHint(); repositionPanels(); dirty=true; }).observe(ctrlEl);
}
requestAnimationFrame(tick);
/* ===== 调试通道（P11/P12：验收走有效通道+磁盘 grep，禁合成拖拽断言） ===== */
window.__c6dbg={
  get state(){ return state; }, get W(){ return W; }, get H(){ return H; }, get layout(){ return L; },
  get stage(){ return state.stage; },
  setStage:function(to){ setStage(to); return state.stage; },
  setSalt:function(rho){ setSaltRho(rho); S1Flash(); return +s1().rho.toFixed(3); },   // 灌任意加盐量：密度牌/液体色/种粒三处同源自洽
  setStone:function(o){
    o=o||{}; var T=s2();
    if(o.seed!=null) T.seed=Math.round(o.seed);
    T.stone=mkStone(T.seed);
    if(o.V!=null){ T.stone.V=clamp(o.V,5,60); if(o.rho!=null) T.stone.rho=clamp(o.rho,1.5,4); T.stone.m=T.stone.rho*T.stone.V; }
    T.stone.x=L.stoneSpot.x; T.stone.y=L.stoneSpot.y;
    T.cur={m:null,v1:null,v2:null,done:false};
    renderS2Table([]); updatePanel(); dirty=true;
    return {seed:T.stone.seed,V:+T.stone.V.toFixed(2),rho:+T.stone.rho.toFixed(3),m:+T.stone.m.toFixed(1)};
  },
  water:function(ml){   // 读/写当前阶段量筒液体体积 mL
    if(ml==null) return +cylMlNow().toFixed(2);
    if(state.stage==='s1'){ s1().cylMl=clamp(ml,0,CYL_CAP); }
    else { s2().injected=true; s2().waterTw=null; s2().waterMl=clamp(ml,0,CYL_CAP); }
    dirty=true; return +cylMlNow().toFixed(2);
  },
  place:function(item,where){   // 免拖拽放置：beaker|stone → pan|bench|cyl
    if(item==='beaker'){
      var S=s1();
      if(where==='pan'){ S.beaker.loc='pan'; balSettle(); }
      else { S.beaker.loc='bench'; S.beaker.x=L.beaker.x; S.beaker.y=L.seat; }
      S.pouring=false;
    }else if(item==='stone'){
      var st=stone(); if(!st) return false;
      if(st.loc==='cyl'&&where!=='cyl'){   // 与 pointerdown 取出路径同语义：水位回落 V₁（未读则浸没基准）
        var T=s2();
        if(T.cur.v1!=null) s2SetWater(T.cur.v1,TWEEN_MS*2);
        else if(st.vBase!=null) s2SetWater(st.vBase,TWEEN_MS*2);
        T.cur.v2=null; st.sinkTw=null; st.sinkP=1;
      }
      if(where==='pan'){ st.loc='pan'; balSettle(); }
      else if(where==='cyl'){ submergeStone(); }
      else { st.loc='bench'; st.x=L.stoneSpot.x; st.y=L.seat; }
    }else return false;
    dirty=true; return true;
  },
  pour:function(ml){   // 阶段一免拖拽倾倒：从烧杯转移 ml 到量筒（连续插值同 tick 路径的终态；F3 前置锁不在调试通道生效——验收直灌用）
    var S=s1(),mv=clamp(ml,0,S.beakerVol);
    S.beakerVol-=mv; S.cylMl+=mv;
    if(S.vConf!==null||S.done){ S.vConf=null; S.done=false; fillCell('s1-c4','—',true); fillCell('s1-c5','—',true); }
    updateHint(); dirty=true; return +S.cylMl.toFixed(2);
  },
  record:function(){   // F2 记录按钮免点击通道：等价 doRecord（recTarget 判定同按钮可见性）
    var tg=recTarget(); doRecord();
    return {target:tg,m1:s1().m1==null?null:+s1().m1.toFixed(1),m2:s1().m2==null?null:+s1().m2.toFixed(1)};
  },
  eyeTo:function(t){ state.eyeT=clamp(t,0,1); dirty=true;
    return {thetaDeg:+(eyeTheta()*180/Math.PI).toFixed(2),aligned:eyeAligned(),apparent:+eyeApparent().toFixed(2),trueV:+cylMlFor(effStage()).toFixed(2)}; },
  confirmRead:function(){ doConfirm(); return {target:confirmTarget(),aligned:eyeAligned()}; },
  reset:function(stg){ if((stg||state.stage)==='s1') resetS1(); else resetS2(); dirty=true; return true; },
  readTable:function(){
    var S=s1(),T=s2(),r=s2CurCalc();
    return {s1:{m1:S.m1,m2:S.m2,m:(S.m1!=null&&S.m2!=null)?+(S.m1-S.m2).toFixed(1):null,
                V:S.vConf,rho:(S.m1!=null&&S.m2!=null&&S.vConf!=null)?+((S.m1-S.m2)/S.vConf).toFixed(3):null,
                rhoCfg:+S.rho.toFixed(3)},
            s2:{rows:T.rows,cur:{m:T.cur.m,v1:T.cur.v1,v2:T.cur.v2,
                v:r.v!=null?+r.v.toFixed(2):null,rho:r.rho!=null?+r.rho.toFixed(3):null}}};
  },
  grab:function(item){   // 件位置/状态直读（验收免合成拖拽）
    if(item==='eye') return {eyeT:state.eyeT,thetaDeg:+(eyeTheta()*180/Math.PI).toFixed(2),aligned:eyeAligned(),apparent:+eyeApparent().toFixed(2),trueV:+cylMlFor(effStage()).toFixed(2)};
    if(item==='beaker'){ var b=beakerPos(); return {loc:s1().beaker.loc,x:Math.round(b.x),y:Math.round(b.y),volMl:+s1().beakerVol.toFixed(1)}; }
    if(item==='jar') return {loc:s1().jar.loc,x:Math.round(s1().jar.x),y:Math.round(s1().jar.y),pour:+s1().jar.pour.toFixed(2),saltPct:+saltPct().toFixed(1)};
    if(item==='stone'){ var st=stone(); return st?{loc:st.loc,x:Math.round(st.x),y:Math.round(st.y),seed:st.seed,V:+st.V.toFixed(2),rho:+st.rho.toFixed(3),m:+st.m.toFixed(1),sinkP:+st.sinkP.toFixed(3),wet:+st.wet.toFixed(2)}:null; }
    return null;
  },
  hintText:function(){ return hintEl?hintEl.textContent:null; },
  geoProbe:function(){   // F6 几何探针：石块初始位间距断言 + 入筒压缩系数数值（桩测走有效通道）
    var gi=cylInner(L.cyl),cylR=L.cyl.x+cylW(L.cyl)/2,stHalfMax=cmPx(19.5);
    return {stoneSpotX:L.stoneSpot.x,stoneSizeMax:+cmPx(39).toFixed(1),cylRight:+cylR.toFixed(1),
            gapSpotVsCyl:+(L.stoneSpot.x-stHalfMax-cylR).toFixed(1),gapMinRequired:+cmPx(1).toFixed(1),
            cuX0:L.cu.x0,innerW:+(gi.inR-gi.inL).toFixed(1),inCylDrawW:+((gi.inR-gi.inL)*STONE_IN_CYL_K).toFixed(1),K:STONE_IN_CYL_K,
            inTop:+gi.inTop.toFixed(1),inBot:+gi.inBot.toFixed(1)};
  },
  pickSlotProbe:function(needW,needH){
    var w=needW||300,h=needH||240,rs=sceneAvoidRects();
    return {need:{w:w,h:h},slot:pickSlot(w,h,rs),avoidRects:rs};
  },
  rects:function(){   // G 轮验收：命名矩形表（画布坐标；tablePanel=DOM 实测换算；null=当前态不绘制）
    function rd(r){ return r?{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.w),h:Math.round(r.h)}:null; }
    var e=eyePos(),band=cuBandRect(),G=panUIRects(),cw=cylW(L.cyl);
    var tp=null,el=document.getElementById('panel-table');
    if(el){ var r=el.getBoundingClientRect(),wr=cv.getBoundingClientRect();
      if(r.width&&r.height) tp={x:r.left-wr.left,y:r.top-wr.top,w:r.width,h:r.height}; }
    return {
      cyl:rd({x:L.cyl.x-cw/2,y:L.cyl.y-L.cyl.h,w:cw,h:L.cyl.h}),
      beaker:rd(beakerBox()),
      jar:rd(jarBox()),
      stone:rd(stoneBox()),
      tablePanel:rd(tp),
      eyeBand:rd(band),
      eye:rd({x:e.x-cmPx(EYE_SPRITE_HALF),y:e.y-cmPx(EYE_SPRITE_HALF),w:cmPx(44),h:cmPx(44)}),
      textBlock:rd({x:L.cu.x0+cmPx(12),y:band.y,w:band.w-cmPx(12),h:band.h}),
      mTag:rd(G.tag),
      recBtn:G.btn?rd({x:G.btn.x-G.btn.w/2,y:G.btn.y-G.btn.h/2,w:G.btn.w,h:G.btn.h}):null,
      rhoTag:(effStage()==='s1'&&s1().beaker.loc==='bench')?rd(brineTagRect()):null,
      desk:{balRight:L.desk.balRight,gap:+L.desk.gap.toFixed(1),k:+L.desk.k.toFixed(3),overflow:L.desk.overflow,tableBand:L.tableBand,panelH:TABLE_PANEL_H}
    };
  }
};
function S1Flash(){ updatePanel(); dirty=true; }
})();

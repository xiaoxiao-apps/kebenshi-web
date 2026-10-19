/* exp-density-core.js — c6s2 密度实验室（三场景：E3 探究m·V / E4 密度水槽 / E5 物质鉴别） */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
/* ===== 常量（core 单点定义，layout/render 只读） ===== */
var ANIM_DUR=600;                 // 场景切换飞入飞出（第24条①）
var TWEEN_MS=350;                 // 浮沉/水位单调过渡（P6：300-400ms，禁回弹）
var BENCH_TOP=0.80;               // bench 台面高度比例
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
var E5_POOL=['gold','copper','iron','aluminum','ice','wood'];      // E5 出题池（教材表值；蜡与冰同密度会歧义不入池）
var E5_CYL_CAP=8000,E5_CYL_DIV=1000,E5_CYL_BASE=1500;              // E5 量筒 mL（底水1500，最大 1500+5000<8000）
var E3_VMAX=70,E3_MMAX=250;       // E3 作图板固定标度（兼容调试样例 V≤60/m≤30.1 与铁30cm³=237g）
var E3_W_SET=[100,50,20,20,10,5]; // 砝码盒配置（weight_set 同源；总205g+游码5g）

var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var hintEl=document.getElementById('hint');
var W=960,H=520,DPR=1,ctrlBandH=150,COMPACT_H=600,dirty=true;
function benchTopY(){ return Math.round(H*BENCH_TOP); }
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
function easeOut(t){ return 1-Math.pow(1-t,3); }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function fmt(v,n){ return (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }
function cbrt(v){ return Math.pow(v,1/3); }

/* ===== 状态（三场景完全隔离，返回原样恢复） ===== */
var state={
  scene:'e3',animating:false,anim:null,
  e3:{mat:'aluminum',v:20,records:[],dropT:0},
  e4:{dual:false,sel:0,single:null,duals:null,lvl:TANK_BASE_L,tw:null,lvlTw:null,drag:null},
  e5:{blocks:[],sel:0,cylTw:null,fade:null,drag:null}
};
function e4Blocks(){ return state.e4.dual?state.e4.duals:[state.e4.single]; }

/* ===== 布局（layout() 单点算，绘制只读） ===== */
var L={};
function balGeom(bx,by,h){   // balance_pan 几何同源换算（挂盘位置，供挂载件与命中区）
  var baseH=Math.max(8,h*0.065),beamLen=h*0.86;
  var pivotY=by-baseH-h*0.52,panDrop=h*0.26,panH=Math.max(4,h*0.03),panW=beamLen*0.22;
  return {h:h,beamLen:beamLen,pivotY:pivotY,panTopY:pivotY+panDrop-panH,panHW:panW/2,panDx:beamLen/2-h*0.02};
}
function layout(){
  var by=benchTopY();
  L.e3={
    bal:{x:Math.round(W*0.185),y:by,h:Math.round(H*0.44)},
    meas:{x:Math.round(W*0.40),y:by},
    graph:{x0:Math.round(W*0.575),x1:Math.round(W*0.985),y0:Math.round(H*0.10),y1:by-16}
  };
  L.e3.bal.g=balGeom(L.e3.bal.x,L.e3.bal.y,L.e3.bal.h);
  var tankH=Math.max(140,by-Math.round(H*0.185));
  var tankW=tankH*TANK_ASPECT;
  L.e4={
    scale:{x:Math.round(W*0.5),y:Math.round(H*0.15),w:Math.min(460,Math.round(W*0.55))},
    tank:{x:Math.round(W*0.5),y:by,h:tankH,w:tankW,innerHalf:tankW*0.39},
    benchY:by
  };
  L.e5={
    bal:{x:Math.round(W*0.17),y:by,h:Math.round(H*0.40)},
    cyl:{x:Math.round(W*0.84),y:by,h:Math.max(170,by-Math.round(H*0.10))},
    spot:[Math.round(W*0.38),Math.round(W*0.50),Math.round(W*0.62)],
    benchY:by
  };
  L.e5.bal.g=balGeom(L.e5.bal.x,L.e5.bal.y,L.e5.bal.h);
}
function tankSurfYAt(lvlL){   // 水位体积(L)→水面屏幕y（water_tank 内腔 frac 同源）
  var t=L.e4.tank;
  var yf=TKF+(1-clamp(lvlL/TANK_FULL_L,0,1))*(TKB-TKF);
  return t.y-(1-yf)*t.h;
}
function tankBotY(){ return L.e4.tank.y-(1-TKB)*L.e4.tank.h; }
function e4Side(b){ return Math.max(16,L.e4.tank.h*0.30*cbrt(b.v/5)); }
function e5Side(b){ return Math.max(16,H*0.10*cbrt(b.v)); }
function e3Side(){ return Math.max(14,H*0.05*cbrt(state.e3.v)); }

function reflow(){   // resize/全屏重算一切（第17条）：块位置回域
  var t=L.e4.tank;
  e4Blocks().forEach(function(b,i){
    if(!b) return;
    if(b.loc==='tank'){ b.x=clamp(b.x,t.x-t.innerHalf+e4Side(b)/2,t.x+t.innerHalf-e4Side(b)/2); b.y=e4RestY(b); }
    else { b.y=L.e4.benchY; b.x=clamp(b.x,60,W-60); }
  });
  state.e5.blocks.forEach(function(b,i){
    if(b.loc==='bench') b.x=L.e5.spot[i];
    if(b.loc==='cyl') b.x=L.e5.cyl.x;
    if(b.loc==='pan') b.x=L.e5.bal.x-L.e5.bal.g.panDx;
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
  measureCtrl(); layout(); reflow();
  dirty=true;
}
/* 背景延展绘制：飞入飞出时场景 translate，背景上下延展不留白 */
function paintBg(wall,side,tone){
  ctx.fillStyle=wall; ctx.fillRect(0,-H*2,W,H*2);
  PROPS.bench(ctx,W,H,{tone:tone});
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
function drawPanWeights(c,cx,byTop,hw,list){   // 盘上砝码堆（balance_pan panR 挂载白名单：砝码页面层绘制）
  var n=list.length; if(!n) return;
  list.forEach(function(g,i){
    var w=Math.max(6,Math.min(hw*0.9,4+g*0.09)),h=5+g*0.09;
    var x=cx+(i-(n-1)/2)*(w+2),y=byTop;
    var gr=c.createLinearGradient(x-w/2,0,x+w/2,0);
    gr.addColorStop(0,'#9ca3af'); gr.addColorStop(0.5,'#e5e7eb'); gr.addColorStop(1,'#7d838c');
    c.fillStyle=gr; c.fillRect(x-w/2,y-h,w,h);
    c.strokeStyle='rgba(80,85,92,0.7)'; c.lineWidth=1; c.strokeRect(x-w/2,y-h,w,h);
    c.beginPath(); c.ellipse(x,y-h,w/2,w*0.18,0,0,Math.PI*2);
    c.fillStyle='#e5e7eb'; c.fill(); c.stroke();
  });
}
function drawE3Measure(){   // 测量区：同规格块 + 刻度尺量边长（体积路径=刻度尺，报告注明）
  var M=L.e3.meas,E=state.e3,side=e3Side(),aCm=cbrt(E.v);
  var pxPerCm=side/aCm;
  PROPS.material_block(ctx,M.x,M.y,{size:side,mat:E.mat,label:MATCN[E.mat]+'块'});
  // 刻度尺（页面层简笔：库内暂无 ruler 标准件，见报告器材修改需求）
  var rx0=M.x-side*1.6,rLen=pxPerCm*5,ry=M.y+8;
  ctx.fillStyle='rgba(250,244,220,0.95)'; ctx.fillRect(rx0,ry,rLen,12);
  ctx.strokeStyle='#8a7c66'; ctx.lineWidth=1; ctx.strokeRect(rx0,ry,rLen,12);
  for(var i=0;i<=50;i++){
    var xx=rx0+pxPerCm*i/10,major=i%10===0;
    if(xx>rx0+rLen) break;
    ctx.beginPath(); ctx.moveTo(xx,ry); ctx.lineTo(xx,ry+(major?7:4));
    ctx.strokeStyle='#5b4a32'; ctx.lineWidth=major?1.2:0.8; ctx.stroke();
  }
  // 尺寸线（块边长）+ 读数
  var dy=M.y-side-10;
  ctx.strokeStyle='#b45309'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(M.x-side/2,dy); ctx.lineTo(M.x+side/2,dy); ctx.stroke();
  [-1,1].forEach(function(s){
    ctx.beginPath(); ctx.moveTo(M.x+s*side/2,dy); ctx.lineTo(M.x+s*side/2,dy+7); ctx.stroke();
  });
  ctx.fillStyle='#b45309'; ctx.font='600 13px sans-serif'; ctx.textAlign='center';
  ctx.fillText('边长 a ≈ '+fmt(aCm,2)+' cm → V = a³ = '+E.v+' cm³',M.x,dy-6);
}
function drawE3Graph(){   // 作图板：白底浅灰网格（教材图6.2-2 语义），描点 200ms ease-out，同材质≥2点自动过原点比例线
  var G=L.e3.graph,E=state.e3,now=performance.now();
  var pw=G.x1-G.x0,ph=G.y1-G.y0,padL=40,padB=28,padT=26,padR=12;
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
  ctx.fillStyle='#64748b'; ctx.font='12px sans-serif'; ctx.textAlign='center';
  for(v=0;v<=E3_VMAX;v+=10) ctx.fillText(String(v),ox+iw*v/E3_VMAX,oy+16);
  ctx.textAlign='right';
  for(m=0;m<=E3_MMAX;m+=50) ctx.fillText(String(m),ox-6,oy-ih*m/E3_MMAX+4);
  ctx.textAlign='left'; ctx.fillText('m/g',ox-30,oy-ih-8);
  ctx.textAlign='right'; ctx.fillText('V/cm³',ox+iw,oy+16+14);
  // 描点（逐点 200ms pop）
  E.records.forEach(function(r){
    var p=r.t?clamp((now-r.t)/200,0,1):1,rad=4.5*easeOut(p);
    var x=ox+iw*clamp(r.v,0,E3_VMAX)/E3_VMAX,y=oy-ih*clamp(r.m,0,E3_MMAX)/E3_MMAX;
    ctx.beginPath(); ctx.arc(x,y,rad,0,Math.PI*2);
    ctx.fillStyle=E3_COL[r.mat]||'#2563eb'; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=1.2; ctx.stroke();
  });
  // 同材质≥2点：自动拟合直线（最小二乘过原点比例线 m=kV，k=Σ(mV)/Σ(V²)）
  ['aluminum','iron','wood'].forEach(function(mat){
    var rs=E.records.filter(function(r){ return r.mat===mat; });
    if(rs.length<2) return;
    var svv=0,smv=0;
    rs.forEach(function(r){ svv+=r.v*r.v; smv+=r.m*r.v; });
    var k=smv/svv,yEnd=k*E3_VMAX;
    ctx.save();
    ctx.beginPath(); ctx.rect(ox,oy-ih,iw,ih); ctx.clip();
    ctx.strokeStyle=E3_COL[mat]; ctx.lineWidth=2; ctx.globalAlpha=0.75;
    ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+iw,oy-ih*yEnd/E3_MMAX); ctx.stroke();
    ctx.restore();
  });
  // 图例
  var lx=G.x0+padL+6,ly=G.y0+14;
  ['aluminum','iron','wood'].forEach(function(mat,i){
    var has=E.records.some(function(r){ return r.mat===mat; });
    ctx.globalAlpha=has?1:0.35;
    ctx.beginPath(); ctx.arc(lx+i*64,ly,4,0,Math.PI*2);
    ctx.fillStyle=E3_COL[mat]; ctx.fill();
    ctx.fillStyle='#1e293b'; ctx.font='12px sans-serif'; ctx.textAlign='left';
    ctx.fillText(MATCN[mat]==='干松木'?'木':MATCN[mat],lx+i*64+8,ly+4);
    ctx.globalAlpha=1;
  });
  ctx.restore();
}
function renderE3(){
  paintBg('#f9f4cd','rgb(160,160,160)','warm');
  var b=L.e3.bal,E=state.e3,side=e3Side(),wf=weightsFor(e3Mass());
  var dropP=1;
  if(E.dropT){ dropP=clamp((performance.now()-E.dropT)/250,0,1); if(dropP>=1) E.dropT=0; else dirty=true; }
  var dyOff=(1-easeOut(dropP))*H*0.18;
  drawE3Graph();
  drawE3Measure();
  PROPS.weight_set(ctx,Math.round(W*0.055),b.y,{w:Math.round(H*0.16),open:true});
  PROPS.balance_pan(ctx,b.x,b.y,{h:b.h,tilt:0,rider:wf.rider,riderShow:true,
    panL:function(c,cx,pyTop){ PROPS.material_block(c,cx,pyTop-dyOff,{size:side,mat:E.mat}); },
    panR:function(c,cx,pyTop,panR){ drawPanWeights(c,cx,pyTop,panR,wf.ws); }
  });
  var mTxt='称量读数  m = '+fmt(e3Mass(),1)+' g';
  ghostCard(b.x-90,b.y+16,180,30);
  ctx.fillStyle='#1e293b'; ctx.font='600 14px sans-serif'; ctx.textAlign='center';
  ctx.fillText(mTxt,b.x,b.y+36);
}
function e3Select(mat,v){
  var E=state.e3;
  if(mat) E.mat=mat;
  if(v) E.v=v;
  E.dropT=performance.now(); dirty=true;
  if(window.playDrop) playDrop();
  syncE3Btns(); updateHint(); updatePanel();
}
function e3Record(){   // 「记录」钮：m/V/m÷V 入表（同材质同体积去重替换）
  var E=state.e3,m=e3Mass();
  var rec={mat:E.mat,v:E.v,m:m,ratio:m/E.v,t:performance.now()};
  var dup=E.records.findIndex(function(r){ return r.mat===rec.mat&&r.v===rec.v; });
  if(dup>=0) E.records[dup]=rec; else E.records.push(rec);
  e3RecRev++; dirty=true;
  if(window.playClick) playClick();
  updatePanel(); updateHint();
}
var e3RecRev=0,e3RecShown=-1;
/* ===== 场景二 E4：密度水槽（借鉴 PhET Intro；水位=基础+排水，浮沉 P6 规格） ===== */
var tankOK=false;   // water_tank sprite 就位标记（renderE4 每帧刷新）
function mkE4Block(preset,v,m,loc){
  return {preset:preset,mat:preset==='custom'?'styrofoam':preset,v:v,m:m,
    x:L.e4.tank.x,y:L.e4.benchY,loc:loc||'tank',tw:null};
}
function e4Rho(b){ return b.m/b.v; }   // kg/L = ρ=m/V
function e4Displaced(b){ return b.loc==='tank'?b.v*Math.min(1,e4Rho(b)/RHO_WATER):0; }   // V排=浸没部分体积
function e4LvlTarget(){
  var l=TANK_BASE_L;
  e4Blocks().forEach(function(b){ if(b&&b.loc==='tank') l+=e4Displaced(b); });
  return l;
}
function e4FinalY(b,lvlL){   // 物理终态：ρ<1漂浮（底=水面+浸没比×边长）/ ρ≥1沉底静止
  var rho=e4Rho(b),side=e4Side(b);
  if(rho<RHO_WATER) return tankSurfYAt(lvlL)+(rho/RHO_WATER)*side;
  return tankBotY();
}
function e4RestY(b){ return e4FinalY(b,e4LvlTarget()); }
function e4Settle(b){   // 放手/改参数：350ms 单调过渡（easeInOut 插值，禁回弹震荡）
  var l1=e4LvlTarget(),now=performance.now();
  b.tw={t0:now,y0:b.y,y1:e4FinalY(b,l1)};
  state.e4.lvlTw={t0:now,l0:state.e4.lvl,l1:l1};
  dirty=true;
}
function e4Tick(){   // rAF 推进：浮沉 y 与水位同帧连续插值（P1 禁跳变、P5 读数随插值刷新）
  var now=performance.now(),busy=false;
  e4Blocks().forEach(function(b){
    if(b&&b.tw){
      var p=clamp((now-b.tw.t0)/TWEEN_MS,0,1);
      b.y=b.tw.y0+(b.tw.y1-b.tw.y0)*easeInOut(p);
      if(p>=1) b.tw=null; else { busy=true; dirty=true; }
    }
  });
  var lt=state.e4.lvlTw;
  if(lt){
    var q=clamp((now-lt.t0)/TWEEN_MS,0,1);
    state.e4.lvl=lt.l0+(lt.l1-lt.l0)*easeInOut(q);
    if(q>=1){ state.e4.lvl=lt.l1; state.e4.lvlTw=null; } else { busy=true; dirty=true; }
  }
  return busy;
}
function drawE4Block(b,isSel){
  var side=e4Side(b),surfY=tankSurfYAt(state.e4.lvl);
  PROPS.material_block(ctx,b.x,b.y,{size:side,mat:b.mat,label:fmt(b.m,1)+' kg'});
  if(b.loc==='tank'&&tankOK){   // 浸没部分叠淡蓝 tint 读作"在水中"（水槽前壁不透明素材的页面层补偿）
    var topY=b.y-side,subTop=Math.max(topY,surfY);
    if(subTop<b.y-1){
      ctx.save();
      ctx.beginPath(); ctx.rect(b.x-side/2-2,subTop,side*1.25+4,b.y-subTop); ctx.clip();
      ctx.fillStyle='rgba(105,185,238,0.30)';
      ctx.fillRect(b.x-side/2-6,topY-14,side*1.3+12,side+28);
      ctx.restore();
    }
  }
  if(isSel){   // 选中态描边（P7 点选反馈，琥珀色非 PhET 粉）
    ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2.5;
    rrPath(b.x-side/2-5,b.y-side-5,side+10+side*0.21,side+10,8); ctx.stroke();
  }
}
function renderE4(){
  paintBg('#e8f1f8','#9aa8b8','cool');
  var t=L.e4.tank,E=state.e4,bs=e4Blocks(),sel=bs[E.sel]||bs[0];
  tankOK=PROPS.spriteReady('water_tank');   // sprite 未就位不画水面附属（tint/水位线），防悬空
  PROPS.density_scale(ctx,L.e4.scale.x,L.e4.scale.y,{w:L.e4.scale.w,value:sel?e4Rho(sel):null});
  PROPS.water_tank(ctx,t.x,t.y,{h:t.h,water:clamp(E.lvl/TANK_FULL_L,0,1)});
  bs.forEach(function(b){ if(b) drawE4Block(b,b===sel); });
  if(!tankOK) return;
  var surfY=tankSurfYAt(E.lvl);   // 水位标签：红线刻+实时读数（P1 排水通道）
  ctx.strokeStyle='rgba(220,38,38,0.8)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(t.x+t.w/2+6,surfY); ctx.lineTo(t.x+t.w/2+26,surfY); ctx.stroke();
  ctx.fillStyle='#b91c1c'; ctx.font='600 14px sans-serif'; ctx.textAlign='left';
  ctx.fillText('水位 '+fmt(E.lvl,1)+' L',t.x+t.w/2+30,surfY+5);
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
function e4Drop(b,px,py){   // 放手：入水=浮沉动画 / 台面=静置（可再拖）
  var t=L.e4.tank,s=e4Side(b);
  b.tw=null;
  if(Math.abs(b.x-t.x)<t.innerHalf&&b.y>t.y-t.h-80&&b.y<t.y+10){
    b.loc='tank';
    b.x=clamp(b.x,t.x-t.innerHalf+s/2+2,t.x+t.innerHalf-s/2-2);
    e4Settle(b);
  }else{
    b.loc='bench'; b.y=L.e4.benchY; b.x=clamp(b.x,50,W-50);
    var l1=e4LvlTarget();
    state.e4.lvlTw={t0:performance.now(),l0:state.e4.lvl,l1:l1};
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
  if(b.loc==='tank') e4Settle(b);
  else { state.e4.lvlTw={t0:performance.now(),l0:state.e4.lvl,l1:e4LvlTarget()}; }
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
    E.lvl=TANK_BASE_L; E.lvlTw=null; E.sel=0;
    E.duals.forEach(e4Settle);
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
  E.dual=false; E.duals=null; E.sel=0; E.drag=null;
  E.single=mkE4Block('wood',5,2,'tank');
  E.lvl=TANK_BASE_L+e4Displaced(E.single); E.lvlTw=null;
  E.single.y=e4FinalY(E.single,E.lvl); E.single.tw=null;
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
  for(i=0;i<3;i++){
    var mat=pool[i],v=1+Math.floor(e5Rnd()*5);
    bs.push({id:i+1,mat:mat,v:v,m:Math.round(RHO[mat]*v*100)/100,
      mKnown:false,vKnown:false,revealed:false,solved:false,guess:'',verdict:'',vok:'',
      loc:'bench',x:L.e5.spot[i],y:L.e5.benchY});
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
function e5Hit(p){   // 纯命中（无副作用），返回 index 或 -1
  var bs=state.e5.blocks;
  for(var i=bs.length-1;i>=0;i--){
    var b=bs[i],s=e5Side(b);
    if(b.loc==='cyl') continue;   // 筒内块由筒口命中区取回
    var bx=b.x,by=(b.loc==='pan')?L.e5.bal.g.panTopY:b.y;
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
  paintBg('#e8f1f8','#9aa8b8','cool');
  var E=state.e5,B=L.e5,now=performance.now();
  var alpha=1;
  if(E.fade){ var fp=clamp((now-E.fade.t0)/600,0,1); alpha=fp<0.5?1-fp*2:(fp-0.5)*2; }
  var cylB=E.blocks.filter(function(o){ return o.loc==='cyl'; })[0];
  var panB=E.blocks.filter(function(o){ return o.loc==='pan'; })[0];
  // 托盘天平（简化读数态：称量即读数，砝码堆示意）+ 砝码盒
  PROPS.weight_set(ctx,Math.round(W*0.05),B.benchY,{w:Math.round(H*0.15),open:true});
  PROPS.balance_pan(ctx,B.bal.x,B.bal.y,{h:B.bal.h,tilt:0,riderShow:false,
    panL:function(c,cx,pyTop){ if(panB&&!(E.drag&&E.drag.b===panB)) drawE5BlockOn(c,cx,pyTop,panB); },
    panR:function(c,cx,pyTop,panR){ if(panB) drawPanWeights(c,cx,pyTop,panR,[20,20,10]); }
  });
  if(panB){
    ghostCard(B.bal.x-96,B.bal.y+16,192,30);
    ctx.fillStyle='#1e293b'; ctx.font='600 14px sans-serif'; ctx.textAlign='center';
    ctx.fillText('称量读数  m = '+fmt(panB.m,2)+' kg',B.bal.x,B.bal.y+36);
  }
  // 量筒（排水测 V：水位连续插值）
  PROPS.cylinder_grad(ctx,B.cyl.x,B.cyl.y,{h:B.cyl.h,cap:E5_CYL_CAP,div:E5_CYL_DIV,
    water:E.cylFrac,inside:cylB?(cylB.revealed?E5_INCOL[cylB.mat]:'#9ca3af'):null});
  var vTxt=cylB?('V = '+fmt((e5CylW()-E5_CYL_BASE)/1000,1)+' L（水位差）'):('底水 '+(E5_CYL_BASE/1000)+' L');
  ghostCard(B.cyl.x-86,B.cyl.y-B.cyl.h-44,172,30);
  ctx.fillStyle='#1e293b'; ctx.font='600 14px sans-serif'; ctx.textAlign='center';
  ctx.fillText(vTxt,B.cyl.x,B.cyl.y-B.cyl.h-24);
  // 台面神秘块（mystery「?」；揭晓后显真实材质色）
  ctx.save(); ctx.globalAlpha=alpha;
  E.blocks.forEach(function(b){
    if(E.drag&&E.drag.b===b) return;
    if(b.loc==='pan'||b.loc==='cyl') return;   // 盘上块走 panL 挂载；筒内块由 inside 占位色呈现
    drawE5BlockOn(ctx,b.x,b.y,b);
  });
  if(E.drag&&E.drag.b) drawE5BlockOn(ctx,E.drag.b.x,E.drag.b.y,E.drag.b);
  ctx.restore();
}
function drawE5BlockOn(c,x,yb,b){   // (x,yb)=底面中心（第13条锚点），调用方决定落位
  var s=e5Side(b),E=state.e5;
  PROPS.material_block(c,x,yb,{size:s,mat:b.mat,mystery:!b.revealed});
  c.fillStyle='#1e293b'; c.font='600 13px sans-serif'; c.textAlign='center';
  c.fillText('块'+b.id+(b.revealed?' · '+MATCN[b.mat]:''),x,yb-s-14);
  if(E.blocks[E.sel]===b){
    c.strokeStyle='#f59e0b'; c.lineWidth=2.5;
    rrPath(x-s/2-5,yb-s-5,s+10+s*0.21,s+10,8); c.stroke();
  }
}
function e5Drop(b){   // 放手：天平区=称m / 量筒区=排水测V / 其它=回台面
  var B=L.e5,g=B.bal.g,C=B.cyl;
  var panLx=B.bal.x-g.panDx;
  b.tw=null;
  if(Math.abs(b.x-panLx)<g.panHW+34&&Math.abs(b.y-g.panTopY)<g.h*0.42){
    b.loc='pan'; b.mKnown=true; b.x=panLx; b.y=B.benchY;
    if(window.playDrop) playDrop();
  }else if(Math.abs(b.x-C.x)<Math.max(30,C.h*0.18)/2+26&&b.y>C.y-C.h-60&&b.y<C.y+10){
    state.e5.blocks.forEach(function(o){ if(o!==b&&o.loc==='cyl'){ o.loc='bench'; o.x=L.e5.spot[o.id-1]; } });
    b.loc='cyl'; b.vKnown=true; b.x=C.x; b.y=B.benchY;
    e5SetCyl(e5CylTargetFrac());
    if(window.playDrop) playDrop();
  }else{
    b.loc='bench'; b.x=clamp(b.x,50,W*0.72); b.y=B.benchY;
    if(window.playDrop) playDrop();
  }
  syncE5Sel(); dirty=true; updatePanel(); updateHint();
}
function syncE5Sel(){   // 选中块联动：鉴别下拉/判定随块走
  var b=e5Sel(),sm=document.getElementById('sel-e5mat');
  if(sm) sm.value=b?b.guess:'';
  updatePanel(); updateHint();
}
function submitE5(){   // 提交判定：对=✓揭晓材质色；错=提示「再算算密度」不给答案可重试
  var b=e5Sel(); if(!b) return;
  if(b.solved){ b.verdict='已鉴别：'+MATCN[b.mat]; b.vok='ok'; updatePanel(); return; }
  if(!b.mKnown||!b.vKnown){ b.verdict='先称质量、再测体积'; b.vok='no'; toast('先把块'+b.id+'放上天平称 m，再投入量筒测 V'); updatePanel(); return; }
  if(!b.guess){ b.verdict='先查密度表选材质'; b.vok='no'; updatePanel(); return; }
  if(b.guess===b.mat){
    b.solved=true; b.revealed=true;
    b.verdict='✓ 正确！块'+b.id+'是'+MATCN[b.mat]; b.vok='ok';
    if(window.playMatch) playMatch();
  }else{
    b.verdict='✗ 再算算密度'; b.vok='no';
    if(window.playClick) playClick();
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
  hideToast(); syncGroups(); updateHint();
  if(window.playClick) playClick();
  dirty=true;
}
function ptOf(ev){ var r=cv.getBoundingClientRect(); return {x:ev.clientX-r.left,y:ev.clientY-r.top}; }
var lastTick=0;
cv.addEventListener('pointerdown',function(ev){
  if(state.animating) return;
  var p=ptOf(ev);
  if(state.scene==='e4'){
    var i=e4Hit(p);
    if(i>=0){
      E4SelSet(i);
      var b=e4Blocks()[i];
      state.e4.drag={b:b,dx:b.x-p.x,dy:b.y-p.y};
      b.tw=null;
      if(b.loc==='tank'){ b.loc='bench'; state.e4.lvlTw={t0:performance.now(),l0:state.e4.lvl,l1:e4LvlTarget()}; }
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
      var bx=(b5.loc==='pan')?(L.e5.bal.x-L.e5.bal.g.panDx):b5.x;
      var by=(b5.loc==='pan')?L.e5.bal.g.panTopY:b5.y;
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
  var dr=(state.scene==='e4')?state.e4.drag:(state.scene==='e5'?state.e5.drag:null);
  if(dr&&dr.b){
    dr.b.x=p.x+dr.dx; dr.b.y=p.y+dr.dy;
    var now=performance.now();
    if(window.playTick&&now-lastTick>110){ lastTick=now; playTick(); }
    dirty=true;
  }else{
    var hov=(state.scene==='e4')?e4Hit(p)>=0:(state.scene==='e5'?(e5Hit(p)>=0||!!e5CylHit(p)):false);
    cv.style.cursor=hov?'pointer':'default';
  }
});
function endDrag(){
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
  if(lblM) lblM.textContent='m = '+fmt(b.m,1)+' kg'+(custom?'':'（=ρV 派生）');
  if(btnDual) btnDual.classList.toggle('on',state.e4.dual);
}
/* ===== 读数面板/记录表/密度表（幽灵化浮层，openPanel 单入口互斥） ===== */
var openP=null;
function openPanel(name){
  openP=(openP===name)?null:name;
  document.getElementById('panel-read').classList.toggle('show',openP==='read');
  document.getElementById('panel-dtable').classList.toggle('show',openP==='dtable');
  btnTable.classList.toggle('on',openP==='read');
  btnDtable.classList.toggle('on',openP==='dtable');
  if(openP==='read') updatePanel();
}
function updatePanel(){
  var s=state.scene;
  if(s==='e3'){
    var E=state.e3;
    setText('e3-mat',MATCN[E.mat]+'块');
    setText('e3-v',E.v+' cm³');
    setText('e3-m',fmt(e3Mass(),1)+' g');
    setText('e3-ratio',fmt(e3Rho(),2)+' g/cm³');
    if(e3RecShown!==e3RecRev){
      e3RecShown=e3RecRev;
      var tb=document.getElementById('rec-body');
      if(tb){
        if(!E.records.length) tb.innerHTML='<tr><td colspan="4" id="rec-empty">还没有记录——选好物块称量后点「记录」</td></tr>';
        else tb.innerHTML=E.records.map(function(r,i){
          var cn=(r.mat==='wood')?'木':MATCN[r.mat];
          return '<tr><td>'+cn+'块'+(i+1)+'</td><td>'+fmt(r.m,1)+'</td><td>'+r.v+'</td><td>'+fmt(r.ratio,2)+'</td></tr>';
        }).join('');
      }
    }
  }else if(s==='e4'){
    var b=e4Sel(); if(!b) return;
    var rho=e4Rho(b);
    setText('e4-badge',state.e4.dual?('块 '+('AB'[state.e4.sel]||'A')+'（双块）'):'单块');
    setText('e4-mat',MATCN[b.preset]||b.preset);
    setText('e4-m',fmt(b.m,1)+' kg');
    setText('e4-v',fmt(b.v,1)+' L');
    setText('e4-rho',fmt(rho,2)+' kg/L = '+fmt(rho*1000,0)+' kg/m³');
    setText('e4-sub',b.loc==='tank'?fmt(Math.min(1,rho/RHO_WATER)*100,0)+' %':'—（未入水）');
    setText('e4-level',fmt(state.e4.lvl,1)+' L');
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
/* ===== hint 橙色居中解说条：当前可见分支教当前可做的操作 ===== */
function updateHint(){
  if(!hintEl) return;
  if(state.animating){ hintEl.style.opacity='0'; return; }
  hintEl.style.opacity='1';
  hintEl.textContent=hintText();
}
function hintText(){
  var s=state.scene;
  if(s==='e3'){
    var E=state.e3;
    var any2=['aluminum','iron','wood'].some(function(m){
      return E.records.filter(function(r){ return r.mat===m; }).length>=2;
    });
    if(any2) return '结论（教材P145）：同种物质的质量与体积成正比，质量与体积之比是一定的；不同物质这个比值一般也不同。换材质对比，或去「密度水槽」场景';
    if(E.records.length) return '打开「读数面板」点「记录」入表；作图板自动描点，同材质≥2点自动画过原点比例线。换大小再多测几块';
    return '猜想（教材P144）：如果一个铝块的体积是另一个的2倍、3倍……它的质量也是另一个的2倍、3倍……吗？——用下方「材质/大小」钮选块，天平自动称量读数 m';
  }
  if(s==='e4'){
    var b=e4Sel(); if(!b) return '';
    if(state.e4.drag) return '松手放入水中：ρ物<ρ水 漂浮（浸没体积比=ρ物/ρ水），ρ物≥ρ水 沉底';
    var rho=e4Rho(b);
    if(b.loc==='tank'&&rho<RHO_WATER) return '漂浮平衡：浸没比=ρ物/ρ水='+fmt(rho,2)+'/1.0='+fmt(rho*100,0)+'%。水位=基础100L+排水体积='+fmt(state.e4.lvl,1)+' L';
    if(b.loc==='tank') return 'ρ='+fmt(rho,2)+' kg/L ≥ 水1.0 → 沉底静止。密度标尺红标=选中块ρ，实物参照刻度：人1 / 玻璃2.5 / 钛4.5 / 钢7.9 / 铜8.9';
    return '把块拖入水槽看浮沉与水位变化；点击块选中（琥珀描边），下方控制栏换材质预设 / 体积 / 质量，「单块/双块」摆同体积异质量对比';
  }
  var b5=e5Sel(); if(!b5) return '';
  if(b5.solved) return '鉴别正确！块'+b5.id+'是'+MATCN[b5.mat]+'。点「重新出题」换题，或点选其它块继续鉴别';
  if(!b5.mKnown) return '第1步：把神秘块拖到天平左盘称质量 m（点击块=选中，琥珀描边）';
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
document.getElementById('btn-rec').addEventListener('click',function(){ if(state.animating)return; e3Record(); });
document.getElementById('btn-rec-clear').addEventListener('click',function(){
  if(state.animating)return;
  state.e3.records=[]; e3RecRev++; dirty=true; updatePanel(); updateHint();
  if(window.playClick) playClick();
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
document.getElementById('btn-newq').addEventListener('click',function(){ if(state.animating)return; newE5(); });
if(btnDtable) btnDtable.addEventListener('click',function(){ if(state.animating)return; openPanel('dtable'); if(window.playClick)playClick(); });
var selE5matEl=document.getElementById('sel-e5mat');
if(selE5matEl) selE5matEl.addEventListener('change',function(){ var b=e5Sel(); if(b){ b.guess=selE5matEl.value; b.verdict=''; b.vok=''; updatePanel(); } });
document.getElementById('btn-submit').addEventListener('click',function(){ if(state.animating)return; submitE5(); });
if(btnTable) btnTable.addEventListener('click',function(){ if(state.animating)return; openPanel('read'); if(window.playClick)playClick(); });
SCENES.forEach(function(k){
  var el=document.getElementById('btn-scene-'+k);
  if(el) el.addEventListener('click',function(){ switchScene(k); });
});
function resetE3(){
  var E=state.e3;
  E.mat='aluminum'; E.v=20; E.records=[]; E.dropT=performance.now();
  e3RecRev++; syncE3Btns(); updatePanel(); updateHint(); dirty=true;
}
document.getElementById('btn-reset').addEventListener('click',function(){
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
  if(state.e3.dropT) return true;
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
  new ResizeObserver(function(){ measureCtrl(); layout(); reflow(); dirty=true; }).observe(ctrlEl);
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
    e3RecRev++; dirty=true;
  },
  e3fitK:function(mat){
    var rs=state.e3.records.filter(function(r){ return r.mat===(mat||'wood'); });
    var svv=0,smv=0; rs.forEach(function(r){ svv+=r.v*r.v; smv+=r.m*r.v; });
    return svv?smv/svv:null;
  },
  e4sub:function(i){ var b=e4Blocks()[i||0]; return (b&&b.loc==='tank')?Math.min(1,e4Rho(b)/RHO_WATER):null; },
  e4level:function(){ return state.e4.lvl; },
  e5blocks:function(){ return state.e5.blocks.map(function(b){ return {id:b.id,mat:b.mat,v:b.v,m:b.m,mKnown:b.mKnown,vKnown:b.vKnown,solved:b.solved}; }); },
  e5gen:function(){ genE5(); }
};
})();

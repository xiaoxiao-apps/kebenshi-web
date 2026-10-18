(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var FONT='"Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif';

// ===== 光学模型（全部以 D=晶状体→视网膜距离 为单位，resize 时由像素几何重算） =====
// R2 平行光口径：物体上/中/下三端各一条水平平行线入眼（教材图5.4-2 画法）
// f(t) = FK_MAX - t*(FK_MAX-FK_MIN)：t=晶状体厚度 0(薄)~1(厚)；f=1×D 时平行光恰会聚视网膜
var FK_MAX=1.25,FK_MIN=0.75,SHARP_TOL=0.03;    // R10：手动滑杆全行程 f∈[0.75D,1.25D] 盖三态与矫正组合；清晰判定 |xConv-xRet| <= SHARP_TOL*D
var U_FAR_K=2.7;                              // 物体绘制位置（×D）；仅视觉表意，不进光路
var GLASS_F_K={concave:-3.94,convex:4.48};     // R16 重标定（u=∞ 串联 BFL：gK=(xL-xC)/D=0.83/1.34≈0.6194，Fc=[Fe(1+gK)-gK]/(Fe-1)）——近视0.82D+凹 / 远视1.35D+凸 会聚点恰回视网膜(v=D)；四组合由追迹公式自然得出，禁写死分支
var COND_OFF={normal:0,myopia:0.25,hyper:-0.25};          // 手动档晶状体基线偏移
// R22 手动档滑杆锁向（%）：近视锁左（有效厚度=滑杆+0.25，下限0.68>清晰带上缘0.56，永远够不着清晰，须凹透镜）；远视锁右（有效上限0.32<清晰带下缘0.44，须凸透镜）；正常不锁
var COND_RNG={normal:[0,100],myopia:[43,100],hyper:[0,57]};
// R16 自动档目标焦距（×D）：正常 f=D 清晰；近视 f=0.82D→会聚点视网膜前约0.18D；远视 f=1.35D→视网膜后约0.35D（夸张化，明确落在视网膜右侧一截）
var COND_F={normal:1.00,myopia:0.82,hyper:1.35};
var COND_NAME={normal:'正常眼',myopia:'近视眼',hyper:'远视眼'};

var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var ctrlBandH=150,COMPACT_H=600;
var W=960,H=520,DPR=1,axisY=260;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }

var st={
  cond:'normal',auto:true,tCmd:0.32,
  glass:null,            // 'concave'|'convex'|null（挂眼前）
  showFlow:false,flowT0:0
};
var drag=null,startPt=null,dragGhost=null,glowFx=[],toolbox=null,toastTimer=null;

// ===== 几何缓存（layout 单点重算，resize/全屏必走） =====
var G={};
function layout(){
  axisY=Math.round(H*0.5);
  var R=Math.round(Math.min(H*0.28,W*0.17));
  var ex=Math.round(W*0.70),ey=axisY;
  var xL=Math.round(ex-R*0.42),xRet=Math.round(ex+R*0.92);   // R15：与 drawEyeball 视网膜弧带半径 0.92R 严格同值，吸附点=弧带中心线；D=xRet-xL 自动重算
  var D=xRet-xL;
  var xC=Math.round(ex-R*1.25);        // R4：眼球左缘外留 ~0.25R 空隙，镜片禁与巩膜圆重叠
  var lensH=Math.round(R*0.9);
  var hObj=Math.round(R*0.38);
  var xFar=Math.max(60,Math.round(xL-U_FAR_K*D));
  G={R:R,ex:ex,ey:ey,xL:xL,xRet:xRet,D:D,xC:xC,lensH:lensH,hObj:hObj,xFar:xFar};
  // 托盘（toolbox 托盘件，照 c5s1）
  var cardH=132;
  var card={x:16,y:H-ctrlBandH-12-cardH,w:292,h:cardH,r:10,fill:'rgba(255,255,255,0.88)',stroke:'#c9c0ae'};
  var nat={lens_concave:{w:56,h:56},lens_convex:{w:56,h:56}};
  var items=[{id:'lens_concave',x:card.x+78,y:card.y+72},{id:'lens_convex',x:card.x+206,y:card.y+72}];
  var fit=(H<COMPACT_H)?Math.min(100,Math.round(H*0.19)):100;
  toolbox=PROPS.toolbox.create({card:card,items:items,fit:fit,nat:nat});
}
function xObj(){ return G.xFar; }
function objTopY(){ return axisY-G.hObj; }
function objBottomY(){ return axisY+G.hObj; }
function gK(){ return (G.xL-G.xC)/G.D; }                 // 矫正镜间距（×D）
function tActNow(){
  if(st.auto){
    // R10：自动档目标=fEyeK()=COND_F[cond]（平行光清晰目标 f=D），由 f 反解 t
    var cf=COND_F[st.cond]||COND_F.normal;
    return clamp01((FK_MAX-cf)/(FK_MAX-FK_MIN));
  }
  return clamp01(st.tCmd+COND_OFF[st.cond]);
}
function clamp01(v){ return Math.max(0,Math.min(1,v)); }
function fEyeK(){
  if(st.auto) return COND_F[st.cond]||COND_F.normal;   // R16：自动档直取目标焦距（远视1.35D超手动滑杆行程；视觉厚度由 tActNow 的 clamp01 钉最薄）
  return FK_MAX-clamp01(st.tCmd+COND_OFF[st.cond])*(FK_MAX-FK_MIN);
}

// ===== 近轴光线追迹（画布像素，y 向下；折射 m' = m - (y-axisY)/fPx） =====
// R2：3 条水平平行光线自物体顶/中/底端出发（m 初始=0）；中端线=光轴过光心不变
function traceRays(){
  var fEyePx=fEyeK()*G.D;
  var x0=xObj();
  var ys=[objTopY(),axisY,objBottomY()];
  var fc=st.glass?GLASS_F_K[st.glass]*G.D:0;
  var rays=[];
  for(var i=0;i<ys.length;i++){
    var yi=ys[i];
    var m=0,yC=yi,y=yi;
    if(st.glass){
      yC=yi;                              // 水平线在矫正镜面命中高度=出发高度
      m=m-(yC-axisY)/fc;                  // 矫正镜折射
      y=yC+m*(G.xL-G.xC);                 // 传到晶状面
    }
    m=m-(y-axisY)/fEyePx;                 // 晶状体折射
    rays.push({yi:yi,yC:yC,yL:y,m:m});
  }
  // R3：会聚点=光线两两求交（取 0/2 号，对称光线交点在光轴上）
  var a=rays[0],b=rays[2],xConv,yConv;
  if(Math.abs(a.m-b.m)<1e-9){ xConv=Infinity; yConv=axisY; }
  else{ xConv=G.xL+(b.yL-a.yL)/(a.m-b.m); yConv=a.yL+a.m*(xConv-G.xL); }
  return {rays:rays,xConv:xConv,yConv:yConv,fEyePx:fEyePx};
}
// R3 焦点语义轴上化：sharp 判定 = |xConv-xRet| <= SHARP_TOL*D
function imgInfo(tr){
  tr=tr||traceRays();
  var diff=tr.xConv-G.xRet;               // >0 视网膜后、<0 视网膜前
  var sharp=isFinite(tr.xConv)&&Math.abs(diff)<=SHARP_TOL*G.D;
  return {xConv:tr.xConv,diff:diff,sharp:sharp,where:sharp?'视网膜上':(diff>0?'视网膜后':'视网膜前')};
}

// ===== 绘制 =====
function drawBg(){
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#faf8f3'); g.addColorStop(1,'#f5f2ec');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}
function drawAxis(){
  ctx.save();
  ctx.strokeStyle='rgba(26,26,26,.28)'; ctx.lineWidth=1; ctx.setLineDash([14,5,3,5]);
  ctx.beginPath(); ctx.moveTo(0,axisY); ctx.lineTo(W,axisY); ctx.stroke();
  ctx.restore();
}
function drawTree(x,baseY,h){
  ctx.save();
  ctx.fillStyle='#5d7a52';
  ctx.fillRect(x-h*0.05,baseY-h*0.42,h*0.10,h*0.42);           // 树干
  ctx.fillStyle='#4a6842';
  for(var i=0;i<3;i++){                                          // 三层树冠
    var ty=baseY-h*0.30-i*h*0.24,tw=h*(0.44-i*0.10),th=h*0.34;
    ctx.beginPath();
    ctx.moveTo(x,ty-th); ctx.lineTo(x+tw/2,ty); ctx.lineTo(x-tw/2,ty);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function drawObject(){
  // R2：树以光轴为垂直中心——中端在 axisY、顶端 axisY-hObj、底端 axisY+hObj
  var x=xObj(),h=G.hObj*2;
  drawTree(x,axisY+G.hObj,h);
  ctx.save();                                                     // 三条平行光出发端点（顶/中/底）
  ctx.fillStyle='#f59e0b';
  var ys=[objTopY(),axisY,objBottomY()];
  for(var i=0;i<ys.length;i++){ ctx.beginPath(); ctx.arc(x,ys[i],3,0,Math.PI*2); ctx.fill(); }
  ctx.restore();
}
function drawEyeball(){
  var R=G.R,ex=G.ex,ey=G.ey;
  ctx.save();
  var g=ctx.createRadialGradient(ex-R*0.2,ey-R*0.25,R*0.2,ex,ey,R);
  g.addColorStop(0,'rgba(255,255,255,0.92)'); g.addColorStop(1,'rgba(223,233,243,0.88)');
  ctx.fillStyle=g; ctx.strokeStyle='#8aa2b8'; ctx.lineWidth=Math.max(2,R*0.018);
  ctx.beginPath(); ctx.arc(ex,ey,R,0,Math.PI*2); ctx.fill(); ctx.stroke();   // 巩膜圆
  // 视网膜弧（后内壁橙红感光层）
  ctx.strokeStyle='#e07b39'; ctx.lineWidth=Math.max(4,R*0.075); ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(ex,ey,R*0.92,-Math.PI*0.32,Math.PI*0.32); ctx.stroke();
  ctx.restore();
}
function drawCrystal(){
  // 晶状体双凸=库件矢量通道：视觉凸度随厚度参数联动（结构件规则：位置/厚度动态）
  var t=tActNow();
  var fVis=6-5*t;                                                  // t=1→f=1 最凸；t=0→f=6 最薄
  PROPS.lens_convex(ctx,G.xL,axisY,{h:G.lensH,f:fVis});
}
function drawGlassMounted(){
  if(!st.glass) return;
  var h=Math.round(G.R*0.95);
  if(st.glass==='concave') PROPS.lens_concave(ctx,G.xC,axisY,{h:h,f:2});
  else PROPS.lens_convex(ctx,G.xC,axisY,{h:h,f:2});
}
function beamSeg(x0,y0,x1,y1){
  ctx.save(); ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1);
  if(st.showFlow){
    ctx.globalAlpha=.3; ctx.strokeStyle='#dc2626'; ctx.lineWidth=2; ctx.stroke();
    ctx.globalAlpha=1; ctx.setLineDash([6,12]);
    ctx.lineDashOffset=-((performance.now()-st.flowT0)*0.06)%18;
    ctx.strokeStyle='#2563eb'; ctx.lineWidth=2.4; ctx.stroke();
  }else{
    ctx.strokeStyle='#dc2626'; ctx.lineWidth=2; ctx.stroke();
  }
  ctx.restore();
}
function drawRays(tr){
  var x0=xObj();
  var xEnd=G.xRet+G.R*0.14;                                        // 画到视网膜稍后（会聚点在后可见交叉）
  for(var i=0;i<tr.rays.length;i++){
    var r=tr.rays[i];
    if(st.glass){
      beamSeg(x0,r.yi,G.xC,r.yC);
      beamSeg(G.xC,r.yC,G.xL,r.yL);
    }else{
      beamSeg(x0,r.yi,G.xL,r.yL);
    }
    var yEnd=r.yL+r.m*(xEnd-G.xL);
    beamSeg(G.xL,r.yL,xEnd,yEnd);
  }
  // R16：会聚点在视网膜后（远视自动 f=1.35D→后约0.35D）——实光线到视网膜仍未会聚，虚线延长至后方轴上会聚点（加粗当主角引线）
  var info=imgInfo(tr);
  if(!info.sharp&&info.diff>0&&isFinite(tr.xConv)&&tr.xConv<W+40){
    ctx.save(); ctx.setLineDash([6,6]); ctx.strokeStyle='rgba(220,38,38,.75)'; ctx.lineWidth=2;
    for(var j=0;j<tr.rays.length;j+=2){
      var rj=tr.rays[j];
      var yR=rj.yL+rj.m*(G.xRet-G.xL);
      ctx.beginPath(); ctx.moveTo(G.xRet,yR); ctx.lineTo(tr.xConv,axisY); ctx.stroke();
    }
    ctx.restore();
  }
}
function drawRetinaImage(tr){
  var info=imgInfo(tr);
  if(info.sharp){
    // R10：清晰态会聚点强制吸附视网膜表面交点 G.xRet（轴上）；黄晕圆心=像点圆心=吸附点
    var cx=G.xRet,cy=axisY;
    ctx.save();
    var g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(5,G.R*0.06));
    g.addColorStop(0,'rgba(255,196,50,.95)'); g.addColorStop(1,'rgba(255,176,30,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,Math.max(5,G.R*0.06),0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#b45309';
    ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2); ctx.fill();      // 清晰像点
    ctx.restore();
    return {x:cx,y:cy,r:4};
  }
  // R11：会聚点在视网膜前（近视自动 f=0.82D→前约0.18D）——轴上画会聚光斑
  if(isFinite(tr.xConv)&&tr.xConv>G.xL&&tr.xConv<G.xRet){
    ctx.save();
    var gc=ctx.createRadialGradient(tr.xConv,axisY,0,tr.xConv,axisY,Math.max(4,G.R*0.05));
    gc.addColorStop(0,'rgba(255,196,50,.9)'); gc.addColorStop(1,'rgba(255,176,30,0)');
    ctx.fillStyle=gc; ctx.beginPath(); ctx.arc(tr.xConv,axisY,Math.max(4,G.R*0.05),0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#b45309';
    ctx.beginPath(); ctx.arc(tr.xConv,axisY,2.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  // R16：会聚点在视网膜后（远视）——后方轴上会聚点补画同款黄晕+实心点当主角（与清晰态同规格）
  var behind=isFinite(tr.xConv)&&info.diff>0;
  if(behind){
    ctx.save();
    var gb=ctx.createRadialGradient(tr.xConv,axisY,0,tr.xConv,axisY,Math.max(5,G.R*0.06));
    gb.addColorStop(0,'rgba(255,196,50,.95)'); gb.addColorStop(1,'rgba(255,176,30,0)');
    ctx.fillStyle=gb; ctx.beginPath(); ctx.arc(tr.xConv,axisY,Math.max(5,G.R*0.06),0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#b45309';
    ctx.beginPath(); ctx.arc(tr.xConv,axisY,3,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  // 视网膜上=模糊光斑（半径随光线散开程度）；有后方会聚点时降亮度当配角
  var yR0=tr.rays[0].yL+tr.rays[0].m*(G.xRet-G.xL);
  var yR2=tr.rays[2].yL+tr.rays[2].m*(G.xRet-G.xL);
  var spread=Math.abs(yR0-yR2)/2;
  var r=Math.max(G.R*0.05,spread*0.9);
  ctx.save();
  if(behind) ctx.globalAlpha=0.45;
  var g2=ctx.createRadialGradient(G.xRet,axisY,1,G.xRet,axisY,r);
  g2.addColorStop(0,'rgba(255,176,30,.9)'); g2.addColorStop(.55,'rgba(255,150,40,.5)'); g2.addColorStop(1,'rgba(255,140,30,0)');
  ctx.fillStyle=g2; ctx.beginPath(); ctx.arc(G.xRet,axisY,r,0,Math.PI*2); ctx.fill();
  ctx.restore();
  return {x:G.xRet,y:axisY,r:r};
}
function drawLabels(){
  ctx.save();
  ctx.fillStyle='#1a1a1a'; ctx.font='600 15px '+FONT; ctx.textAlign='center';
  haloText('晶状体',G.xL,axisY-G.lensH/2-10);
  haloText('视网膜',G.xRet+G.R*0.10,axisY-G.R*0.55);
  if(st.glass) haloText(st.glass==='concave'?'凹透镜':'凸透镜',G.xC,axisY-G.R*0.62);
  ctx.restore();
}
function haloText(t,x,y){
  ctx.save();
  ctx.lineWidth=4; ctx.lineJoin='round'; ctx.strokeStyle='rgba(255,255,255,.85)';
  ctx.strokeText(t,x,y); ctx.restore(); ctx.fillText(t,x,y);
}
function drawTray(){
  toolbox.drawCard(ctx);
  ctx.save();
  ctx.fillStyle='#8a7c66'; ctx.font='14px '+FONT; ctx.textAlign='left';
  ctx.fillText('器材 · 矫正镜（拖到眼前）',toolbox.card.x+12,toolbox.card.y+20);
  ctx.restore();
  var slots=toolbox.slots;
  for(var i=0;i<slots.length;i++){
    var s=slots[i];
    if(s.id==='lens_concave'){ if(st.glass==='concave') slotEmpty(s); else PROPS.lens_concave(ctx,s.x,s.y,{h:64,f:2}); }
    else if(s.id==='lens_convex'){ if(st.glass==='convex') slotEmpty(s); else PROPS.lens_convex(ctx,s.x,s.y,{h:64,f:2}); }
  }
}
function slotEmpty(s){
  ctx.save();
  ctx.setLineDash([5,4]); ctx.strokeStyle='rgba(138,124,102,.5)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(s.x,s.y,26,0,Math.PI*2); ctx.stroke();
  ctx.restore();
}
function drawGhost(){
  if(!dragGhost) return;
  ctx.save(); ctx.globalAlpha=.75;
  if(dragGhost.kind==='concave') PROPS.lens_concave(ctx,dragGhost.x,dragGhost.y,{h:Math.round(G.R*0.95),f:2});
  else PROPS.lens_convex(ctx,dragGhost.x,dragGhost.y,{h:Math.round(G.R*0.95),f:2});
  ctx.restore();
}
function drawGlowFx(){
  var now=performance.now();
  for(var i=glowFx.length-1;i>=0;i--){
    var f=glowFx[i],t=(now-f.t0)/300;
    if(t>=1){ glowFx.splice(i,1); continue; }
    ctx.save();
    ctx.globalAlpha=1-t;
    var c0=f.c||'255,214,120';
    var g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,18+22*t);
    g.addColorStop(0,'rgba('+c0+',.55)'); g.addColorStop(1,'rgba('+c0+',0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(f.x,f.y,18+22*t,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}
var wasSharp=null,retinaPt=null,suppressClick=false;
function draw(){
  drawBg(); drawAxis();
  drawObject();
  drawEyeball();
  var tr=traceRays();
  drawRays(tr);
  drawCrystal();
  drawGlassMounted();
  retinaPt=drawRetinaImage(tr);
  drawLabels();
  drawTray();
  drawGhost();
  drawGlowFx();
  var info=imgInfo(tr);
  if(info.sharp&&!wasSharp){                                          // 边缘触发：变清晰=成功音效+光晕
    glowFx.push({x:G.xRet,y:retinaPt?retinaPt.y:axisY,t0:performance.now(),c:'255,214,120'});
    if(window.playMatch) playMatch();
  }
  wasSharp=info.sharp;
  updatePanel(); updateBubblePos();
}

// ===== 读数面板 =====
function lensWord(){ var t=tActNow(); return t<0.34?'薄':(t>0.66?'厚':'中等'); }
function glassWord(){ return st.glass?(st.glass==='concave'?'凹透镜':'凸透镜'):'无'; }
function updatePanel(){
  var pn=document.getElementById('panel-read'); if(!pn||!pn.classList.contains('show')) return;
  var info=imgInfo();
  var el=function(id){ return document.getElementById(id); };
  el('pr-cond').textContent=COND_NAME[st.cond];
  // R22：手动档锁区提示——读数面板补一句「够不着清晰」的锁向说明
  var lockNote='';
  if(!st.auto&&st.cond==='myopia') lockNote='（手动 · 已偏厚到极限，再薄也够不着清晰，需凹透镜）';
  else if(!st.auto&&st.cond==='hyper') lockNote='（手动 · 已偏薄到极限，再厚也够不着清晰，需凸透镜）';
  else lockNote=st.auto?'（自动调节）':'（手动）';
  el('pr-lens').textContent=lensWord()+lockNote;
  el('pr-glass').textContent=glassWord();
  el('pr-img').textContent=info.sharp?'清晰像点 · 视网膜上':('模糊光斑 · 会聚在'+info.where);
}

// ===== 首屏 hint 橙色居中解说条（状态机分支，照 c5s3；× 关闭=同分支不再自动重弹） =====
var toastEl=document.getElementById('toast'),toastTxt=document.getElementById('toast-txt'),toastXEl=document.getElementById('toast-x');
var hintSt={key:null,dismissed:null};
function hintBranch(){
  if(st.cond==='normal'&&st.glass) return {key:'n-glass',text:'正常眼戴上眼镜反而模糊了：凹透镜使平行光先发散、凸透镜使平行光先会聚，会聚点偏离视网膜。这就是为什么不该随便戴别人的眼镜（点镜片看解说，拖回左下托盘可取下）'};
  if(st.cond==='myopia'&&st.glass==='concave') return {key:'m-ok',text:'矫正成功！凹透镜使平行光先发散，再经晶状体会聚，会聚点重新拉回视网膜上——近视眼镜就是凹透镜。试试关「自动」拖滑杆，看晶状体厚薄怎样移动会聚点'};
  if(st.cond==='hyper'&&st.glass==='convex') return {key:'h-ok',text:'矫正成功！凸透镜使平行光先会聚，再经晶状体会聚，会聚点重新拉回视网膜上——远视眼镜（老花镜）就是凸透镜。试试切换眼况，或关「自动」拖滑杆'};
  if(st.glass) return {key:'g-wrong',text:'拖错镜型了：会聚点偏得离视网膜更远、光斑更散。近视要凹透镜、远视要凸透镜——把它拖回左下托盘，换另一片试试'};
  if(!st.auto){
    if(st.cond==='myopia') return {key:'manual',text:'自动调节已关：晶状体已偏厚到极限，再薄也够不着清晰——这就是近视，需要凹透镜。拖滑杆看会聚点在视网膜前来回移动'};
    if(st.cond==='hyper') return {key:'manual',text:'自动调节已关：晶状体已偏薄到极限，再厚也够不着清晰——这就是远视，需要凸透镜。拖滑杆看会聚点在视网膜后来回移动'};
    return {key:'manual',text:'自动调节已关：睫状体不再帮忙，拖「晶状体厚度」滑杆手动控制。看会聚点在光轴上怎样于视网膜前后来回移动，找到清晰像点'};
  }
  if(st.cond==='myopia') return {key:'myopia',text:'近视眼：晶状体整体偏厚、折光能力太强，来自远处物体的平行光会聚在视网膜前，到达视网膜已是模糊光斑。把左下托盘的凹透镜拖到眼前试试'};
  if(st.cond==='hyper') return {key:'hyper',text:'远视眼：晶状体整体偏薄、折光能力太弱，平行光还没会聚成一点就到了视网膜（会聚点在视网膜后，虚线延长可见）。把左下托盘的凸透镜拖到眼前试试'};
  return {key:'init',text:'正常眼看远处物体：来自物体的光可看作平行光，睫状体放松、晶状体较薄，平行光恰好会聚在视网膜上成清晰像点（点眼球或物体可看知识解说）。关「自动」拖滑杆看晶状体厚薄怎样移动会聚点，或把眼况切成「近视」「远视」'};
}
function hideToast(){ if(toastEl) toastEl.classList.remove('show'); }
function sayHint(){
  if(!toastEl||toastTimer) return;
  var o=hintBranch(); hintSt.key=o.key;
  if(hintSt.dismissed===o.key){ hideToast(); return; }
  if(toastTxt.textContent!==o.text) toastTxt.textContent=o.text;
  if(!toastEl.classList.contains('show')) toastEl.classList.add('show');
  checkToastNarrow();
}
function showToast(msg){
  if(!toastEl) return;
  if(toastTimer) clearTimeout(toastTimer);
  toastTxt.textContent=msg; toastEl.classList.add('show');
  toastTimer=setTimeout(function(){ toastTimer=null; sayHint(); },4000);
}
function checkToastNarrow(){
  if(!toastEl||!toastEl.classList.contains('show')) return;
  var tr=toastEl.getBoundingClientRect(),cr=cv.getBoundingClientRect();
  var exPx=cr.left+G.ex*(cr.width/W),eyTop=cr.top+(G.ey-G.R)*(cr.height/H);
  var rr=G.R*(cr.width/W);
  var hit=!(tr.right<exPx-rr||tr.left>exPx+rr||tr.bottom<eyTop);
  toastEl.classList.toggle('narrow',hit);
}
if(toastXEl) toastXEl.addEventListener('click',function(){ hintSt.dismissed=hintSt.key; hideToast(); });

// ===== 知识气泡（数字逐字，教材 P127）：点物体/晶状体/矫正镜触发，锚定跟随 =====
var bubbleEl=document.getElementById('bubble'),bubbleTxt=document.getElementById('bubble-txt'),bubbleArr=document.getElementById('bubble-arrow');
var bubSt={ax:0,ay:0};
function showBubble(text,ax,ay){
  bubSt.ax=ax; bubSt.ay=ay;
  bubbleTxt.textContent=text;
  bubbleEl.style.display='block';
  positionBubble();
  requestAnimationFrame(function(){ bubbleEl.classList.add('show'); });
}
function hideBubble(){ if(bubbleEl){ bubbleEl.classList.remove('show'); bubbleEl.style.display='none'; } }
function positionBubble(){
  if(!bubbleEl||bubbleEl.style.display!=='block') return;
  var r=cv.getBoundingClientRect(),kx=r.width/W,ky=r.height/H;
  var ax=bubSt.ax*kx,ay=bubSt.ay*ky;
  var bw=bubbleEl.offsetWidth,bh=bubbleEl.offsetHeight;
  var above=ay-bh-22>42;
  var left=Math.max(8,Math.min(r.width-bw-8,ax-bw/2));
  bubbleEl.style.left=Math.round(left)+'px';
  bubbleEl.style.top=Math.round(above?ay-bh-18:ay+18)+'px';
  bubbleEl.classList.toggle('arr-b',above);
  bubbleEl.classList.toggle('arr-t',!above);
  bubbleArr.style.left=Math.round(Math.max(14,Math.min(bw-32,ax-left-9)))+'px';
}
function updateBubblePos(){ if(bubbleEl&&bubbleEl.style.display==='block') positionBubble(); }
var bubbleX=document.getElementById('bubble-x');
if(bubbleX) bubbleX.addEventListener('click',hideBubble);
function knowledgeTap(p){
  // 晶状体区
  if(Math.abs(p.x-G.xL)<G.R*0.30&&Math.abs(p.y-axisY)<G.lensH*0.62){
    showBubble('眼球好像一架照相机。晶状体和角膜的共同作用相当于一个凸透镜，睫状体改变晶状体的形状来调节折光能力。正常眼的远点在无限远处：看很远处的物体时睫状体放松，晶状体最薄。',G.xL,axisY-G.lensH/2-8);
    return true;
  }
  // 矫正镜区
  if(st.glass&&Math.abs(p.x-G.xC)<G.R*0.28&&Math.abs(p.y-axisY)<G.R*0.55){
    var t=st.glass==='concave'
      ?'近视眼看远处物体，像成在视网膜的前面，应该佩戴用凹透镜制成的近视眼镜，使像相对晶状体后移到视网膜上。'
      :'远视眼折光能力太弱，像成在视网膜的后面，应该佩戴用凸透镜制成的远视眼镜，使像相对晶状体前移到视网膜上。老花镜就是凸透镜：看书报时戴、看远处电视时摘。';
    showBubble(t,G.xC,axisY-G.R*0.6);
    return true;
  }
  // 物体区（R2：物体以光轴为垂直中心）
  var xo=xObj();
  if(Math.abs(p.x-xo)<G.R*0.5&&p.y>axisY-G.hObj*1.5&&p.y<axisY+G.hObj*1.5){
    showBubble('正常眼的远点在无限远处：看很远处的物体时睫状体放松，晶状体最薄，平行光恰好会聚在视网膜上。',xo,axisY-G.hObj*1.2);
    return true;
  }
  return false;
}

// ===== 命中检测 =====
function localPt(e){ var r=cv.getBoundingClientRect(); return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}; }
function hitGlassMounted(p){ return !!st.glass&&Math.abs(p.x-G.xC)<G.R*0.30&&Math.abs(p.y-axisY)<G.R*0.6; }

// ===== 交互 =====
cv.addEventListener('pointerdown',function(e){
  var p=localPt(e); startPt=p; drag=null; dragGhost=null;
  if(toolbox.pointInCard(p)){
    var slot=toolbox.hitSlot(p);
    if(slot&&(slot.id==='lens_concave'||slot.id==='lens_convex')){
      var kind=slot.id==='lens_concave'?'concave':'convex';
      drag={k:'glass',kind:kind};
      dragGhost={kind:kind,x:p.x,y:p.y};
      if(window.playPick) playPick();
    }
  }else if(hitGlassMounted(p)){
    drag={k:'glass',kind:st.glass,fromEye:true};
    dragGhost={kind:st.glass,x:p.x,y:p.y};
    if(window.playPick) playPick();
  }
  if(drag){ cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; draw(); }
});
cv.addEventListener('pointermove',function(e){
  var p=localPt(e);
  if(!drag){
    cv.style.cursor=(hitGlassMounted(p)||(toolbox.pointInCard(p)&&toolbox.hitSlot(p)))?'pointer':'';
    return;
  }
  if(drag.k==='glass'){ dragGhost.x=p.x; dragGhost.y=p.y; }
  draw();
});
function endDrag(e){
  if(!drag) return;
  var p=localPt(e);
  if(drag.k==='glass'){
    var moved=Math.hypot(p.x-startPt.x,p.y-startPt.y)>=5;
    if(moved) suppressClick=true;
    var backInTray=toolbox.pointInCard(p)||toolbox.rectInCard({L:p.x-30,R:p.x+30,T:p.y-30,B:p.y+30});
    if(moved&&backInTray){
      st.glass=null;                                                 // 拖回托盘=取下
      if(window.playDrop) playDrop();
    }else if(moved){
      st.glass=drag.kind;
      if(window.playDrop) playDrop();
      glowFx.push({x:G.xC,y:axisY,t0:performance.now(),c:'150,200,255'});
      if(st.cond==='normal') showToast('正常眼戴上'+(st.glass==='concave'?'凹':'凸')+'透镜：像不再落在视网膜上，反而变模糊了——不该随便戴别人的眼镜');
      else if((st.cond==='myopia'&&st.glass==='concave')||(st.cond==='hyper'&&st.glass==='convex')){
        if(window.SFX) SFX.tone(660,'sine',0.12,0.12);
      }else{
        showToast('拖错镜型了：光斑更散。近视用凹透镜、远视用凸透镜');
      }
    }
  }
  drag=null; dragGhost=null; cv.style.cursor='';
  syncUI(); sayHint(); draw();
}
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',endDrag);
cv.addEventListener('click',function(e){                           // 静态点击=知识气泡/关闭
  if(drag) return;
  if(suppressClick){ suppressClick=false; return; }                // 拖拽落点后不误触知识气泡
  var p=localPt(e);
  if(toolbox.pointInCard(p)||hitGlassMounted(p)) return;
  if(knowledgeTap(p)){ glowFx.push({x:p.x,y:p.y,t0:performance.now(),c:'255,214,120'}); if(window.playClick) playClick(); }
  else hideBubble();
});

// ===== 控制条 =====
var selCond=document.getElementById('sel-cond');
var btnAuto=document.getElementById('btn-auto');
var btnFlow=document.getElementById('btn-flow');
var rngT=document.getElementById('rng-t'),lblT=document.getElementById('lbl-t');
var btnTDown=document.getElementById('btn-t-down'),btnTUp=document.getElementById('btn-t-up');
var btnTable=document.getElementById('btn-table'),panelRead=document.getElementById('panel-read');
var btnReset=document.getElementById('btn-reset');

// R22：按眼况设滑杆范围并把当前 tCmd 夹进新范围（切眼况/重置必走）
function applyRng(){
  var r=COND_RNG[st.cond]||COND_RNG.normal;
  if(rngT){ rngT.min=r[0]; rngT.max=r[1]; }
  st.tCmd=Math.max(r[0]/100,Math.min(r[1]/100,st.tCmd));
}
function syncUI(){
  if(selCond) selCond.value=st.cond;
  if(btnAuto) btnAuto.classList.toggle('on',st.auto);
  if(btnFlow) btnFlow.classList.toggle('on',st.showFlow);
  var t=tActNow();
  var rr=COND_RNG[st.cond]||COND_RNG.normal,cur=Math.round(st.tCmd*100);
  if(rngT){ rngT.value=Math.round(clamp01(st.auto?t:(t-(COND_OFF[st.cond]||0)))*100); rngT.disabled=st.auto; }
  if(btnTDown) btnTDown.disabled=st.auto||cur<=rr[0];              // R22：到锁向端点自动禁用
  if(btnTUp) btnTUp.disabled=st.auto||cur>=rr[1];
  if(lblT) lblT.textContent=(t<0.34?'薄':(t>0.66?'厚':'中等'))+(st.auto?'（自动）':'');
}
if(selCond) selCond.addEventListener('change',function(){
  st.cond=selCond.value;
  applyRng();                                                      // R22：切眼况→设范围+夹值，syncUI 同步滑杆与标签
  if(window.playClick) playClick();
  hideBubble(); syncUI(); sayHint(); draw();
});
if(btnAuto) btnAuto.addEventListener('click',function(){
  st.auto=!st.auto;
  if(!st.auto) st.tCmd=clamp01(tActNow()-(COND_OFF[st.cond]||0));   // 关自动=滑杆从当前厚度接手
  if(window.playClick) playClick();
  syncUI(); sayHint(); draw();
});
function setT(v){
  st.tCmd=clamp01(v);
  syncUI(); draw();
}
if(rngT) rngT.addEventListener('input',function(){
  if(st.auto){ rngT.value=Math.round(tActNow()*100); return; }
  setT(+rngT.value/100);
});
function nudgeT(dir){
  if(st.auto) return;
  setT(st.tCmd+dir*0.04);
  if(window.playClick) playClick();
}
if(btnTDown) btnTDown.addEventListener('click',function(){ nudgeT(-1); });
if(btnTUp) btnTUp.addEventListener('click',function(){ nudgeT(1); });
if(btnFlow) btnFlow.addEventListener('click',function(){
  st.showFlow=!st.showFlow;
  if(st.showFlow) st.flowT0=performance.now();
  if(window.playClick) playClick();
  syncUI(); draw();
});
if(btnTable&&panelRead) btnTable.addEventListener('click',function(){
  var show=!panelRead.classList.contains('show');
  panelRead.classList.toggle('show',show); btnTable.classList.toggle('on',show);
  if(window.playClick) playClick();
  updatePanel();
});
if(btnReset) btnReset.addEventListener('click',function(){
  st.cond='normal'; st.auto=true; st.tCmd=0.32; st.glass=null;
  st.showFlow=false; wasSharp=true;                                // 初始态本就清晰，不触发成功音
  applyRng();                                                      // R22：重置回正常眼不锁范围
  hideBubble(); hintSt.dismissed=null;
  if(window.playClick) playClick();
  syncUI(); sayHint(); draw();
});

// ===== 全屏（照 c5s3 现成路线：documentElement + html.pseudo-fs 降级） =====
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
if(btnFull) btnFull.addEventListener('click',function(){if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();});
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(ev){document.addEventListener(ev,function(){syncFull();setTimeout(resize,60);});});

// ===== resize（全屏/窗口变化必重算一切缓存像素坐标） =====
function resize(){
  DPR=window.devicePixelRatio||1;
  var r=cv.getBoundingClientRect();
  W=Math.max(640,r.width); H=Math.max(360,r.height);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(ctrlEl) ctrlEl.classList.toggle('compact',H<COMPACT_H);
  measureCtrl();
  layout();
  draw();
}
window.addEventListener('resize',resize);
if(window.ResizeObserver&&ctrlEl){
  new ResizeObserver(function(){ measureCtrl(); if(toolbox){ layout(); draw(); } }).observe(ctrlEl);
}

// ===== 动画 tick（光流脉冲 + 300ms 渐隐光晕） =====
function tick(){
  if(glowFx.length||st.showFlow) draw();
  requestAnimationFrame(tick);
}

layout();
wasSharp=true;                       // 初始态（正常眼+自动+远处）本就清晰，加载不触发成功音/光晕
applyRng();                          // R22：初始化滑杆范围
resize(); syncUI(); sayHint(); draw(); requestAnimationFrame(tick);

window.__c5s4dbg={
  get st(){return st;}, get G(){return G;}, get W(){return W;}, get H(){return H;},
  set:function(o){ Object.assign(st,o); syncUI(); sayHint(); draw(); },
  info:imgInfo,tAct:tActNow,tr:traceRays,fEyeK:fEyeK
};
})();

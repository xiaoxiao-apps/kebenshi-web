(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var FONT='"Yuanti SC","YouYuan","PingFang SC","Microsoft YaHei",sans-serif';

// ===== 光学模型（全部以 D=晶状体→视网膜距离 为单位，resize 时由像素几何重算） =====
// X4/R32 三条平行光口径（教材图5.4-2 画法，回归 preW3）：树顶/中/底三部位各发一条水平平行线入眼，经晶状体后会聚于像点；像高恒定小像 G.R*0.28（蔡总 2026-10-26 口径：拖树全程像大小不变，仅像点位置随眼况/调焦移动）
// 物理内核保留 W3：自动调焦 fK_req=uK/(1+uK)（内部计算层），钳到该眼况调节范围 frNow()；戴镜时对串联系统等效反解；会聚点 xConv=薄透镜成像解（物顶平行轴线+光心方向线求交，内部解算不绘制）
var SHARP_TOL=0.03;                            // 清晰判定 |xConv-xRet| <= SHARP_TOL*D
var UK_MIN=0.9,UK_MAX=2.7;                     // W3 树可拖动范围（×D，无量纲物距系数；禁存像素）
var GLASS_F_K={concave:-2.61,convex:4.48};     // W3 重标定凹镜（旧-3.94按近视自然态0.82D标定，新调节范围薄极限0.64D够不着→回归必败）：-2.61使近视戴凹镜在远端2.7D以放松态(fe≈0.64)清晰；凸镜4.48新范围下 fe_needed(2.7D)=0.818∈[0.66,1.05] 免改；戴镜自动档按串联光线对反解等效 f（fReqK）
// X4/R33 正常眼厚极限 0.53→0.45：req(0.9)=0.4737 全覆盖→拖树全行程恒清晰（蔡总原话②「随便怎么拖，像都在视网膜上」）；W3「正常近点1.13D、uK<1.13 blur」语义作废。近视远点1.78D；远视清晰阈值1.94D——两关键点仍在拖动行程 [0.9,2.7] 内
// X4/R34 远视戴凸镜 fe_needed(0.9)≈0.479<裸厚极限0.66 被钳→blur（蔡总原话③），换焦度无解；戴镜态调节范围走 frNow() 单源=[0.45,1.05]，裸 hyper [0.66,1.05] 不动（保住「远视看不清近处」演示）
var COND_FRNG={normal:[0.45,1.00],myopia:[0.42,0.64],hyper:[0.66,1.05]};
var COND_NAME={normal:'正常眼',myopia:'近视眼',hyper:'远视眼'};

var cv=document.getElementById('scene'),ctx=cv.getContext('2d');
var ctrlEl=document.querySelector('.ctrlbar');
var ctrlBandH=150,COMPACT_H=600;
var W=960,H=520,DPR=1,axisY=260;
function measureCtrl(){ if(ctrlEl){ var r=ctrlEl.getBoundingClientRect(); if(r.height>0) ctrlBandH=Math.round(r.height); } }

var st={
  cond:'normal',auto:true,tCmd:0.32,uK:UK_MAX,
  glass:null,            // 'concave'|'convex'|null（挂眼前）
  showFlow:false,flowT0:0
};
/* guide 语音层暴露（B版标配）：不可枚举 getter 聚合派生量，零干扰 st 本体 */
(function(){
  Object.defineProperty(st,'mode',{enumerable:false,get:function(){return st.cond;}});
  Object.defineProperty(st,'sharp',{enumerable:false,get:function(){return imgInfo().sharp;}});
  Object.defineProperty(st,'imgWhere',{enumerable:false,get:function(){return imgInfo().where;}});
  window.C5S4_STATE=st;
})();
var drag=null,startPt=null,dragGhost=null,glowFx=[],toolbox=null;

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
  G={R:R,ex:ex,ey:ey,xL:xL,xRet:xRet,D:D,xC:xC,lensH:lensH,hObj:hObj};
  // 托盘（toolbox 托盘件，照 c5s1）
  var cardH=132;
  var card={x:16,y:H-ctrlBandH-12-cardH,w:292,h:cardH,r:10,fill:'rgba(255,255,255,0.88)',stroke:'#c9c0ae'};
  var nat={lens_concave:{w:56,h:56},lens_convex:{w:56,h:56}};
  var items=[{id:'lens_concave',x:card.x+78,y:card.y+72},{id:'lens_convex',x:card.x+206,y:card.y+72}];
  var fit=(H<COMPACT_H)?Math.min(100,Math.round(H*0.19)):100;
  toolbox=PROPS.toolbox.create({card:card,items:items,fit:fit,nat:nat});
}
function xObj(){ return Math.max(60,Math.round(G.xL-st.uK*G.D)); }  // W3：像素位置由无量纲 uK 派生，resize/全屏不漂
function objTopY(){ return axisY-G.hObj; }
function objBottomY(){ return axisY+G.hObj; }
function clampUK(v){ return Math.max(UK_MIN,Math.min(UK_MAX,v)); }
function gK(){ return (G.xL-G.xC)/G.D; }                 // 矫正镜间距（×D）
function clamp01(v){ return Math.max(0,Math.min(1,v)); }
// X4/R34 调节范围单源：远视戴**凸**镜走加宽档 [0.45,1.05]，其余走 COND_FRNG——fReqK/tActNow/fEyeK/lockNote 四处引用一律经此函数，禁 COND_FRNG[st.cond] 直引
// R7-A1（蔡总第4条）：加宽档收窄到 convex——远视戴凹透镜走裸 hyper [0.66,1.05]，串联反解 fe_needed 够不着→钳→blur=戴凹更模糊（物理正确）；近视戴凹路径不受影响（myopia 无加宽，原样）
function frNow(){ if(st.glass==='convex'&&st.cond==='hyper') return [0.45,1.05]; return COND_FRNG[st.cond]||COND_FRNG.normal; }
// W3 自动调焦目标 fK：裸眼=fK_req=uK/(1+uK) 反解；戴镜（近视/远视）=串联系统反解——物顶解算光线对（平行轴线+光心方向线）在视网膜面等高解出晶状体 fe=(A+q)/(q+1/uK+g/(uK·fcK)+A−1/fcK)，A=1−g/fcK，q=g²/(uK·fcK)（fcK→∞ 退化为裸眼式；uK→∞ 与旧 R16 BFL 标定一致）；解无效回退裸眼值；最后钳到 frNow() 调节范围。
// 正常眼戴镜不做串联补偿（按裸眼 f_req 调 t）：会聚点必偏离视网膜——保住「不该随便戴别人的眼镜」既有演示与 W3 回归（若补偿，正常眼会自动调节抵消镜片，模糊演示失效）
function fReqK(){
  var req=st.uK/(1+st.uK);
  if(st.glass&&st.cond!=='normal'){
    var fcK=GLASS_F_K[st.glass],g=gK(),A=1-g/fcK,q=g*g/(st.uK*fcK);
    var fe=(A+q)/(q+1/st.uK+g/(st.uK*fcK)+A-1/fcK);
    if(fe>0.2&&fe<3) req=fe;
  }
  var fr=frNow();
  return Math.max(fr[0],Math.min(fr[1],req));
}
function tActNow(){
  // t=晶状体厚度参数 0(薄)~1(厚)，光路/drawCrystal/滑杆三处同源；
  // 自动档=fReqK() 按态归一（薄极限→0，厚极限→1）；手动档=tCmd 全行程直接映射 frNow()（R22 锁区由范围本身承接：近视 fK_max=0.64<远物所需0.73，怎么调都够不着）
  var fr=frNow();
  if(st.auto) return (fr[1]-fReqK())/(fr[1]-fr[0]);
  return st.tCmd;
}
function fEyeK(){
  var fr=frNow();
  if(st.auto) return fReqK();
  return fr[1]-st.tCmd*(fr[1]-fr[0]);     // 手动档：tCmd=0→薄极限、1→厚极限
}

// ===== 近轴光线追迹（画布像素，y 向下） =====
// X4/R32 物理内核（W3 逐字保留，仅供解算会聚点、不绘制）：物顶解算光线对 ①平行主轴 ②射向晶状体光心，戴镜先在镜面串联折射，求交=像点 xConv
function imgConv(fEyePx){
  var x0=xObj(),y0=objTopY();
  var fc=st.glass?GLASS_F_K[st.glass]*G.D:0;
  var m0s=[0,(axisY-y0)/(G.xL-x0)];
  var rs=[];
  for(var i=0;i<2;i++){
    var m=m0s[i],yC=y0,y=y0;
    if(st.glass){
      yC=y0+m*(G.xC-x0);                    // 在矫正镜面命中高度（光心方向线带斜率，非水平）
      m=m-(yC-axisY)/fc;                    // 矫正镜折射
      y=yC+m*(G.xL-G.xC);                   // 传到晶状面
    }else{
      y=y0+m*(G.xL-x0);                     // 光心方向线带斜率，须先传播到晶状面（平行光线 m=0 时不变）
    }
    m=m-(y-axisY)/fEyePx;                   // 晶状体折射
    rs.push({yL:y,m:m});
  }
  var a=rs[0],b=rs[1],xConv,yConv;
  if(Math.abs(a.m-b.m)<1e-9){ xConv=Infinity; yConv=axisY; }
  else{ xConv=G.xL+(b.yL-a.yL)/(a.m-b.m); yConv=a.yL+a.m*(xConv-G.xL); }
  return {xConv:xConv,yConv:yConv};
}
// X4/R32 绘制口径（蔡总原话①，教材图5.4-2）：三条水平平行光自树顶/中/底（m0=0）；戴镜时每线在镜面串联折射（yC/m 结构逐线套用）；
// 晶状体折射后三线会聚于像点 xConv（像点位置=imgConv 物理解；像高恒定小像 G.R*0.28（蔡总 2026-10-26 口径：拖树全程像大小不变，仅像点位置随眼况/调焦移动）；绘制的光线就是本函数算出的线，禁另画一套；任意两线求交即 xConv、第三线同过该点）
function traceRays(){
  var fEyePx=fEyeK()*G.D;
  var ys=[objTopY(),axisY,objBottomY()];
  var fc=st.glass?GLASS_F_K[st.glass]*G.D:0;
  var cv=imgConv(fEyePx);
  var vPx=cv.xConv-G.xL;                    // 像距（px）；<0=虚像（折射后发散，反向延长会聚）
  var rays=[];
  for(var i=0;i<ys.length;i++){
    var yi=ys[i];
    var m=0,yC=yi,y=yi;
    if(st.glass){
      yC=yi;                                // 水平线在矫正镜面命中高度=出发高度
      m=m-(yC-axisY)/fc;                    // 矫正镜折射
      y=yC+m*(G.xL-G.xC);                   // 传到晶状面
    }
    m=(isFinite(vPx)&&Math.abs(vPx)>1e-6)?-(y-axisY)/vPx:0;   // 晶状体折射：折向像点（三线交于 xConv 轴上一点）
    rays.push({yi:yi,yC:yC,yL:y,m:m});
  }
  return {rays:rays,xConv:cv.xConv,yConv:cv.yConv,fEyePx:fEyePx};
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
  // R2：树以光轴为垂直中心——中端在 axisY、顶端 axisY-hObj、底端 axisY+hObj；三条平行光出发端点（顶/中/底）标发光点
  var x=xObj(),h=G.hObj*2;
  drawTree(x,axisY+G.hObj,h);
  ctx.save();
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
  var t=clamp01(tActNow());                                         // R23：视觉层截断——禁画负 f/超范围镜形（光路用未截断 t_eff）
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
  // R16：会聚点在视网膜后（裸远视看近自动钳薄极限 f=0.66D 等）——实光线到视网膜仍未会聚，虚线延长至后方轴上会聚点（三线都延长，加粗当主角引线）
  var info=imgInfo(tr);
  if(!info.sharp&&info.diff>0&&isFinite(tr.xConv)&&tr.xConv<W+40){
    ctx.save(); ctx.setLineDash([6,6]); ctx.strokeStyle='rgba(220,38,38,.75)'; ctx.lineWidth=2;
    for(var j=0;j<tr.rays.length;j++){
      var rj=tr.rays[j];
      var yR=rj.yL+rj.m*(G.xRet-G.xL);
      ctx.beginPath(); ctx.moveTo(G.xRet,yR); ctx.lineTo(tr.xConv,axisY); ctx.stroke();
    }
    ctx.restore();
  }
}
// R24：会聚点迷你倒立树剪影——与物体树同造型绕光轴倒转（树冠朝轴下/树根朝轴上=倒立实像语义），代码画
// Y1 像高恒定小像 G.R*0.28（蔡总 2026-10-26 口径：拖树全程像大小不变，仅像点位置随眼况/调焦移动）
function imgHeightK(xConv){
  return G.R*0.28;
}
function drawImgTree(x,h){
  if(!isFinite(x)) return;
  h=h||G.R*0.28;
  ctx.save();
  ctx.translate(0,2*axisY); ctx.scale(1,-1);                       // 绕光轴镜像
  drawTree(x,axisY+h/2,h);
  ctx.restore();
}
function drawRetinaImage(tr){
  var info=imgInfo(tr);
  var hImg=imgHeightK(tr.xConv);                                    // Y1：像高恒定小像 G.R*0.28（蔡总 2026-10-26 口径：拖树全程像大小不变，仅像点位置随眼况/调焦移动）
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
    drawImgTree(cx,hImg);                                           // R24：小像立视网膜线上
    return {x:cx,y:cy,r:4};
  }
  // R11：会聚点在视网膜前（如近视眼看远自动钳厚极限 f=0.64D，2.7D 远物成像 0.84D）——轴上画会聚光斑
  if(isFinite(tr.xConv)&&tr.xConv>G.xL&&tr.xConv<G.xRet){
    ctx.save();
    var gc=ctx.createRadialGradient(tr.xConv,axisY,0,tr.xConv,axisY,Math.max(4,G.R*0.05));
    gc.addColorStop(0,'rgba(255,196,50,.9)'); gc.addColorStop(1,'rgba(255,176,30,0)');
    ctx.fillStyle=gc; ctx.beginPath(); ctx.arc(tr.xConv,axisY,Math.max(4,G.R*0.05),0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#b45309';
    ctx.beginPath(); ctx.arc(tr.xConv,axisY,2.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
    drawImgTree(tr.xConv,hImg);                                     // R24：小像清晰画在视网膜前会聚点
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
    drawImgTree(tr.xConv,hImg);                                     // R24：小像立视网膜后虚线延长交点处
  }
  // 视网膜上=模糊光斑（半径随光线散开程度）；离焦态主角=会聚点小像，光斑降亮度当配角（R24）
  // X4/R32：三平行光回归后取顶/底两线（rays[0]/rays[2]）在视网膜面高度差（照 preW3 口径）
  var yR0=tr.rays[0].yL+tr.rays[0].m*(G.xRet-G.xL);
  var yR2=tr.rays[2].yL+tr.rays[2].m*(G.xRet-G.xL);
  var spread=Math.abs(yR0-yR2)/2;
  var r=Math.max(G.R*0.05,spread*0.9);
  ctx.save();
  ctx.globalAlpha=0.45;
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
  // X4 lockNote 复算（手动档=frNow() 全行程滑杆）：近视 f≤0.64D，远物(2.7D)需0.73D→怎么调都够不着，近物(0.9D)需0.47D→可清晰；远视裸 f≥0.66D，近物够不着、远物(≥1.94D)可清晰；正常 [0.45,1.00] 覆盖 req(0.9)=0.4737~req(∞)→全行程恒清晰、无锁区（R33）；远视戴镜 [0.45,1.05] 全行程无锁（R34）
  var lockNote='';
  if(st.auto&&st.glass&&st.cond==='hyper') lockNote='（自动调节 · 戴镜已矫正，远近都清晰）';
  else if(!st.auto&&st.cond==='myopia') lockNote='（手动 · 看远再怎么调薄也够不着清晰，需凹透镜；把树拖近可调清晰）';
  else if(!st.auto&&st.cond==='hyper') lockNote='（手动 · 看近再怎么调厚也够不着清晰，需凸透镜；把树拖远可调清晰）';
  else lockNote=st.auto?'（自动调节）':'（手动）';
  el('pr-lens').textContent=lensWord()+lockNote;
  el('pr-glass').textContent=glassWord();
  el('pr-img').textContent=info.sharp?'清晰像点 · 视网膜上':('模糊光斑 · 会聚在'+info.where);
}

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
function hitObj(p){
  // W3 树拖命中区（照 s3 hitObj：半宽≥24px、上下冠幅±16）；右缘钳到 xC−8px 防与镜片挂载区冲突（R4）
  var x=xObj(),hw=Math.max(24,G.hObj*0.5);
  return p.x>x-hw&&p.x<Math.min(x+hw,G.xC-8)&&p.y>axisY-G.hObj-16&&p.y<axisY+G.hObj+16;
}

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
  if(!drag&&hitObj(p)) drag={k:'obj'};      // W3：优先级 托盘/挂载 > 树，obj 放最后（R4）
  if(drag){ cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; draw(); }
});
cv.addEventListener('pointermove',function(e){
  var p=localPt(e);
  if(!drag){
    cv.style.cursor=(hitGlassMounted(p)||hitObj(p)||(toolbox.pointInCard(p)&&toolbox.hitSlot(p)))?'pointer':'';
    return;
  }
  if(drag.k==='glass'){ dragGhost.x=p.x; dragGhost.y=p.y; }
  else if(drag.k==='obj'){
    st.uK=clampUK((G.xL-p.x)/G.D);          // W3：像素→无量纲 uK；树近=物距小=晶状体变厚
    syncSlider();
  }
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
      if((st.cond==='myopia'&&st.glass==='concave')||(st.cond==='hyper'&&st.glass==='convex')){
        if(window.SFX) SFX.tone(660,'sine',0.12,0.12);
      }
    }
  }else if(drag.k==='obj'){
    if(Math.hypot(p.x-startPt.x,p.y-startPt.y)>=5) suppressClick=true;   // W3：拖树位移≥5px 后不误触知识气泡
  }
  drag=null; dragGhost=null; cv.style.cursor='';
  syncUI(); draw();
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

// W3：滑杆单向显示联动（规格⑤）——只写 value+label，value 未变跳过（防移动端 thumb 抖）；auto 档 disabled 由 syncUI 维持；手动档保持双向（用户是唯一写入者）
function syncSlider(){
  if(!rngT) return;
  var t=tActNow();
  var v=Math.round(clamp01(t)*100);
  if(+rngT.value!==v) rngT.value=v;
  if(lblT){
    var s=(t<0.34?'薄':(t>0.66?'厚':'中等'))+(st.auto?'（自动）':'');
    if(lblT.textContent!==s) lblT.textContent=s;
  }
}
function syncUI(){
  if(selCond) selCond.value=st.cond;
  if(btnAuto) btnAuto.classList.toggle('on',st.auto);
  if(btnFlow) btnFlow.classList.toggle('on',st.showFlow);
  var cur=Math.round(st.tCmd*100);
  if(rngT) rngT.disabled=st.auto;
  if(btnTDown) btnTDown.disabled=st.auto||cur<=0;                  // W3：全行程滑杆，仅端点禁用（R22 锁区语义由 COND_FRNG 范围本身承接）
  if(btnTUp) btnTUp.disabled=st.auto||cur>=100;
  syncSlider();
}
if(selCond) selCond.addEventListener('change',function(){
  st.cond=selCond.value;
  if(window.playClick) playClick();
  hideBubble(); syncUI(); draw();
  window.GUIDE_SCENE&&window.GUIDE_SCENE.change();
});
if(btnAuto) btnAuto.addEventListener('click',function(){
  st.auto=!st.auto;
  if(!st.auto) st.tCmd=clamp01(tActNow());                         // W3 关自动=滑杆从当前厚度接手（t 同标度直传，无偏移）
  if(window.playClick) playClick();
  syncUI(); draw();
});
function setT(v){
  st.tCmd=clamp01(v);
  syncUI(); draw();
}
if(rngT) rngT.addEventListener('input',function(){
  if(st.auto){ syncSlider(); return; }                             // W3：自动档滑杆单向显示（disabled，此分支为兜底）
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
  st.cond='normal'; st.auto=true; st.tCmd=0.32; st.glass=null; st.uK=UK_MAX;   // W3：树复位远端
  st.showFlow=false; wasSharp=true;                                // 初始态本就清晰，不触发成功音
  hideBubble();
  if(window.playClick) playClick();
  syncUI(); draw();
  window.GUIDE_RESET&&window.GUIDE_RESET.all();
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
if(btnFull) btnFull.addEventListener('click',function(){if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();if(window.playClick) playClick();});   // G7 家族补全屏音效（范本 c4_s1）
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
wasSharp=true;                       // 初始态（正常眼+自动+树在远端）本就清晰，加载不触发成功音/光晕
resize(); syncUI(); draw(); requestAnimationFrame(tick);

window.__c5s4dbg={
  get st(){return st;}, get G(){return G;}, get W(){return W;}, get H(){return H;},
  set:function(o){ Object.assign(st,o); syncUI(); draw(); },
  info:imgInfo,tAct:tActNow,tr:traceRays,fEyeK:fEyeK,fReqK:fReqK,frNow:frNow,imgConv:imgConv,COND_FRNG:COND_FRNG,SHARP_TOL:SHARP_TOL
};
})();

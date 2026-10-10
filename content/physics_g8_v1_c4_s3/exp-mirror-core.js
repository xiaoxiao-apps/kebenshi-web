'use strict';
/* c4s3 平面镜成像 · 控制层（M1 成像探究台；批次2阶段1） */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
PROPS.SPRITE_VER=88;
var cv=document.getElementById('scene'),wrap=document.getElementById('scene-wrap');
var R=window.MRR;
if(!R.m2)R.m2={};
R.ctx=cv.getContext('2d');
var objS=document.getElementById('obj-slider');
var angleS=document.getElementById('angle-slider'),readAngle=document.getElementById('read-angle'),cbPath=document.getElementById('cb-path');
var readDo=document.getElementById('read-do'),readDi=document.getElementById('read-di');
var cbAux=document.getElementById('cb-aux'),cbRay=document.getElementById('cb-ray'),cbExt=document.getElementById('cb-ext'),cbNorm=document.getElementById('cb-norm'),cbSym=document.getElementById('cb-sym');
var btnEq=document.getElementById('btn-eq');
var btnRec=document.getElementById('btn-rec'),btnClear=document.getElementById('btn-clear'),btnTable=document.getElementById('btn-table');
var hintEl=document.getElementById('hint');
var recPanel=document.getElementById('rec-panel');
var recRows=[].slice.call(document.querySelectorAll('#rec-table tbody tr'));
var dragging=null,downPt=null,downMoved=false,loopOn=false;
var K=20;R.k=K;
R.m2.showSym=false;
if(!R.m3)R.m3={angle:45,showPath:false,top:null,bottom:null,tray:null,inEye:false,flowT:0,rayT0:0,animT:0,pathT0:0};
['glass_plate','candle','candle_unlit','observer_eye','screen','submarine_hull'].forEach(function(id){PROPS.onSprite(id,function(){if(!loopOn)R.draw();});});

function doMax(){return Math.max(4,Math.floor((R.mirrorX-16)/K));}
function eqMax(){return Math.max(4,Math.floor((R.W-R.mirrorX-16)/K));}
function syncM2Candle(){
  var m=R.m2;
  m.S.x=m.candle.x;
  m.S.y=Math.round(m.candle.y-m.candle.h*0.88);
  m.Sp.x=2*m.mirrorX-m.S.x;
  m.Sp.y=m.S.y;
}
function layoutM2(){
  var m=R.m2;
  m.mirrorX=Math.round(R.W*0.5);
  m.mirrorY=Math.round(R.H*0.5);
  m.mirrorH=Math.min(R.H*0.5,R.W*0.35);
  m.candle.h=Math.round(Math.min(R.H*0.22,110));
  m.candle.x=Math.round(m.mirrorX-R.W*0.18);
  m.candle.y=Math.min(R.H-60,Math.round(m.mirrorY+m.mirrorH*0.25));
  syncM2Candle();
  var tw=170,th=110,tx=24,ty=24;
  m.tray=PROPS.toolbox.create({card:{x:tx,y:ty,w:tw,h:th,r:8,fill:'#e8eef5',stroke:'#b8c6da'},items:[{id:'screen',x:tx+tw*0.30,y:ty+th*0.55},{id:'eye',x:tx+tw*0.72,y:ty+th*0.55}],fit:52,nat:{screen:{w:60,h:160},eye:{w:492,h:464}}});
  m.screen.x=Math.round(m.mirrorX+R.W*0.18);
  m.screen.y=m.mirrorY;
  m.screen.h=Math.round(Math.min(R.H*0.22,130));
  m.eye.x=Math.round(m.mirrorX+R.W*0.28);
  m.eye.y=Math.max(40,Math.round(R.H*0.30));
  m.eye.inBeam=false;
  if(m.trayState!=='off'){m.trayState='tray';m.screen.state='tray';m.eye.state='tray';m.heldItem=null;}
}
function layoutM3(){
  var m=R.m3,W=R.W,H=R.H;
  var x_r=Math.round(W*0.56),headLen=Math.round(W*0.06),eyeLen=Math.round(W*0.035),x_l=x_r-headLen,x_e=x_r+eyeLen,eyeX=Math.round(W*0.63)+26,y_w=Math.round(H*0.24),y1=y_w-40,y2=Math.round(H*0.62),x_hl=Math.round(W*0.14),x_hr=Math.round(W*0.96),towerW=64,w=48,wall=12; // R24 蔡总：目镜再减半 0.035W、眼睛位置锁 R23 现位（0.63W+26）不随筒缩；校验 eyeX+40<x_hr
  var HULL_RATIO=5.136; // sprite 实测 bbox 宽高比 1813x353
  var hullW=x_hr-x_hl,hullH=Math.round(hullW/HULL_RATIO);
  var y_hull=y2-Math.round(hullH*0.60),y_hb=y_hull+hullH; // R23 校验：hullW=0.82W→hullH≈0.16W（艇高约243px@H842，比原大四成）；y_hull≈0.62H-0.096W>y_w+40（艇顶在水面下）、y_hb≈619<H-110（不压控制栏）@H842
  m.tube={x_l:x_l,x_r:x_r,x_e:x_e,y1:y1,y2:y2,y_w:y_w,y_hull:y_hull,y_hb:y_hb,x_hl:x_hl,x_hr:x_hr,towerW:towerW,w:w,wall:wall,hullW:hullW,hullH:hullH};
  m.topSlot={x:x_r,y:y1,r:30};
  m.bottomSlot={x:x_r,y:y2,r:30};
  m.objPos={x:Math.round(W*0.13),y:y_w}; // R22：小船固定左侧水面，p0={objPos.x,y1} 不动，空气段变长物理正确
  m.eyePos={x:eyeX,y:y2}; // R24：眼睛位置固定不随目镜筒缩短（蔡总点名）
  m.mirrorW=Math.round(w*1.45);
  m.bgCv=null;
  var tw=170,th=110,tx=24,ty=24;
  m.tray=PROPS.toolbox.create({card:{x:tx,y:ty,w:tw,h:th,r:8,fill:'#e8eef5',stroke:'#b8c6da'},items:[{id:'plane_mirror',x:tx+tw*0.30,y:ty+th*0.55},{id:'plane_mirror',x:tx+tw*0.72,y:ty+th*0.55}],fit:52,nat:{plane_mirror:{w:300,h:42}}});
  if(!m.top){m.top={state:'tray',x:0,y:0,heldX:0,heldY:0};m.bottom={state:'tray',x:0,y:0,heldX:0,heldY:0};m.heldItem=null;}
  m.inEye=false;
}
/* 重合判定：等效蜡烛与虚像 x 重合（容差≤6px）；was 先记快照后转移再分支 */
function checkMatch(){
  var was=R.matched;
  R.matched=R.objLit&&R.eqState==='placed'&&Math.abs(R.eqX-(R.mirrorX+R.doCm*K))<=6;
  if(R.matched&&!was){if(window.playMatch)window.playMatch();updateHint();}
  else if(!R.matched&&was){updateHint();}
}
function setObjPx(px){
  var lo=Math.max(16,R.mirrorX-doMax()*K),hi=R.mirrorX-3*K;
  R.objX=Math.max(lo,Math.min(hi,px));
  R.doCm=(R.mirrorX-R.objX)/K;
  syncSlider();checkMatch();updateReadout();
}
function setEqPx(px){
  var lo=16,hi=Math.min(R.W-16,R.mirrorX+eqMax()*K);
  R.eqX=Math.max(lo,Math.min(hi,px));
  R.eqDo=(R.eqX-R.mirrorX)/K;
  checkMatch();
}
function syncSlider(){
  var v=Math.round(Math.max(3,Math.min(doMax(),R.doCm)));
  if(objS.value!==String(v))objS.value=String(v);
}
function updateReadout(){
  if(R.eqOn){
    readDo.textContent=R.doCm.toFixed(1);
    readDi.textContent=Math.abs(R.eqDo).toFixed(1);/* 像距=等效蜡烛到镜面距离（可跨板） */
    btnRec.disabled=false;
  }else{
    readDo.textContent='—';readDi.textContent='—';
    btnRec.disabled=true;
  }
}
function recCellAbsEqDo(){
  return String(Math.round(Math.abs(R.eqDo)*10)/10);
}
function updateHint(){
  if(!hintEl)return;
  if(R.mode==='m2'){
    if(R.m2.screen.state==='tray'&&R.m2.eye.state==='tray'){hintEl.textContent='从左上托盘拖出光屏和观察眼使用';return;}
    if(R.m2.screenAtSp){hintEl.textContent='光屏上承接不到像——平面镜成的是虚像';return;}
    if(R.m2.eye.inBeam){hintEl.textContent='眼睛逆着反射光线看去，觉得光好像是从 S′ 发出的——这就是平面镜成的虚像';return;}
    if(!R.m2.showRay){hintEl.textContent='M2：打开「光线显示」看反射光线，再打开「反向延长线」看反射光线反向延长线交于 S′';return;}
    if(!R.m2.eye.inBeam){hintEl.textContent='像依然存在于 S′（与有没有人看无关）；你的眼睛不在反射光束内，接收不到反射光所以看不见——把眼睛拖到反射光路上试试';return;}
    if(!R.m2.showExt){hintEl.textContent='拖动眼睛到反射光路上——眼睛在光束内才能看到虚像（像会点亮）；再打开「反向延长线」看它们交于 S′';return;}/* 热修：可发现性——光线开、眼睛在束外时虚像变暗，原文案未引导拖眼睛（只排在 showExt 之后），提到此分支 */
    if(!R.m2.dragScreen){hintEl.textContent='把光屏拖到 S′ 位置试试，观察光屏上能否看到像；再拖动眼睛，看看眼睛在哪能看到虚像';return;}
    hintEl.textContent='光屏放在 S′ 处也承接不到像，因为 S′ 并不是实际光线会聚点；把眼睛放进反射光束内才能看到虚像';
    return;
  }
  if(R.mode==='m3'){
    var m=R.m3;
    if(m.top.state==='tray'||m.bottom.state==='tray'){hintEl.textContent='M3：潜水艇潜在水下，从左上托盘拖两块平面镜装进潜望镜卡槽';return;}
    if(m.top.state!=='slot'||m.bottom.state!=='slot'){hintEl.textContent='把平面镜拖进潜望镜上下两个卡槽，角度滑杆会同步调整两面镜子';return;}
    if(m.inEye){hintEl.textContent='两面镜子都成 45° 时，光线两次转折后水平射出，眼睛正好看到窗外的景物——艇里的人直接看看不到水面，是潜望镜用两面镜子把光接力送下来的';return;}
    if(Math.abs(m.angle-45)>0.01){hintEl.textContent='镜子角度不是 45°，光线射到管壁上了——调回 45° 试试';return;}
    hintEl.textContent='打开「光路」开关看光线在两块平面镜之间的两次转折';
    return;
  }
  if(R.matched){hintEl.textContent='与像完全重合：像与物等大、到镜面距离相等';return;}
  if(!R.eqOn){hintEl.textContent='①点击蜡烛点燃 ②拖物蜡烛改变物距，看虚像对称移动 ③点击「等效蜡烛」引入测量工具';return;}
  if(R.eqState==='tray'||R.eqState==='held'||R.eqState==='stowing'||R.eqState==='falling'){hintEl.textContent='从托盘把等效蜡烛拖到玻璃板后面，去找像的位置';return;}
  if(R.eqState==='placed'){hintEl.textContent='拖动未点燃蜡烛去与虚像重合，重合处就是像的位置；向上拖可拿起收回托盘';return;}
  hintEl.textContent='虚像与物始终关于玻璃板面对称：像距=物距、等大、连线与板面垂直。拖到与虚像完全重合，两支蜡烛会拼成一支完整蜡烛';
}
function recFill(){
  for(var i=0;i<recRows.length;i++){
    var d=recRows[i].querySelector('.c-do');
    if(d.textContent==='—'){
      d.textContent=String(Math.round(R.doCm*10)/10);
      recRows[i].querySelector('.c-di').textContent=recCellAbsEqDo();
      if(window.playClick)window.playClick();
      if(hintEl)hintEl.textContent='已记录第'+(i+1)+'行（纯观察记录，不判分）';
      return;
    }
  }
  if(hintEl)hintEl.textContent='记录表已满，请先点「清除」再记录';
}
function recClear(){
  recRows.forEach(function(tr){
    tr.querySelector('.c-do').textContent='—';
    tr.querySelector('.c-di').textContent='—';
  });
  updateHint();
}
function layout(){
  var r=wrap.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
  R.W=Math.max(280,r.width);R.H=r.height;
  cv.width=Math.round(R.W*dpr);cv.height=Math.round(R.H*dpr);
  R.ctx.setTransform(dpr,0,0,dpr,0,0);
  var cbEl=document.querySelector('.ctrlbar');
  var cbR=cbEl?cbEl.getBoundingClientRect():null,cvR=cv.getBoundingClientRect();
  R.fy=(cbR&&cvR&&cvR.height>0)?Math.round(R.H*(cbR.top-cvR.top)/cvR.height):Math.round(R.H*0.91);
  R.by=R.fy-109;
  R.mirrorX=Math.round(R.W*0.5);
  R.candleH=Math.round(R.H*0.32);
  R.glassH=Math.round(R.H*0.50);
  R.glassY=PROPS.seatY(R.by,64,24);
  R.candleY=PROPS.seatY(R.by,64,12);
  if(R.candleY-R.candleH<0)R.candleH=Math.round(R.candleY);
  layoutM2();layoutM3();
  var trayW=150,trayH=150,trayX=24,trayY=24;
  R.eqTray=PROPS.toolbox.create({card:{x:trayX,y:trayY,w:trayW,h:trayH,r:8,fill:'#e8eef5',stroke:'#b8c6da'},items:[{id:'candle',x:trayX+trayW/2,y:trayY+trayH/2}],fit:100,nat:{candle:{w:175,h:465}}});
  R.objX=R.mirrorX-R.doCm*K;
  R.eqX=R.mirrorX+R.eqDo*K;
  objS.setAttribute('max',doMax());
  syncSlider();updateReadout();updateHint();
  if(!loopOn)R.draw();
}
window.addEventListener('resize',layout);
objS.addEventListener('input',function(){
  var v=Math.max(3,Math.min(doMax(),+this.value));
  setObjPx(R.mirrorX-v*K);
  if(window.playTick)window.playTick();
  if(!loopOn)R.draw();
});
cbAux.addEventListener('change',function(){R.showAux=this.checked;if(!loopOn)R.draw();});
function m2StartAnim(){R.m2.rayT0=performance.now();R.m2.flowT=performance.now();startLoop();}
if(cbRay)cbRay.addEventListener('change',function(){
  R.m2.showRay=this.checked;
  if(R.m2.showRay&&!R.m2.rayPlayed){R.m2.rayPlayed=true;m2StartAnim();}else if(R.m2.showRay){R.m2.flowT=performance.now();startLoop();}
  updateHint();/* 热修：开关切换后刷新 hint（原缺此调用→hint 停在旧文案，眼睛引导不显示） */
  if(!loopOn)R.draw();
});
if(cbExt)cbExt.addEventListener('change',function(){
  R.m2.showExt=this.checked;
  if(R.m2.showExt){R.m2.flowT=performance.now();startLoop();}
  updateHint();/* 热修：同上 */
  if(!loopOn)R.draw();
});
if(cbNorm)cbNorm.addEventListener('change',function(){R.m2.showNormal=this.checked;updateHint();if(!loopOn)R.draw();});/* 热修：补 updateHint */
if(cbSym)cbSym.addEventListener('change',function(){R.m2.showSym=this.checked;if(!loopOn)R.draw();});
if(angleS)angleS.addEventListener('input',function(){
  var v=Math.max(30,Math.min(60,+this.value));
  if(Math.abs(v-45)<=0.5)v=45;
  R.m3.angle=v;this.value=v;if(readAngle)readAngle.textContent=v.toFixed(1);
  checkM3(false);updateHint();if(!loopOn)R.draw();if(window.playTick)window.playTick();
});
if(cbPath)cbPath.addEventListener('change',function(){R.m3.showPath=this.checked;if(R.m3.showPath){R.m3.rayT0=performance.now();R.m3.pathT0=performance.now();startLoop();}updateHint();if(!loopOn)R.draw();}); /* R23 开光路重置顺序传递计时 */
btnEq.addEventListener('click',function(ev){
  clickFx(ev);
  var next=(R.eqState==='off')?'tray':'off';
  R.eqState=next;R.eqOn=(next!=='off');
  R.eqScale=0;R.eqFall=null;R.eqStow=null;R.eqLift=false;
  btnEq.classList.toggle('on',R.eqOn);
  if(R.eqState==='tray'){if(window.playClick)window.playClick();}
  else{R.matched=false;if(window.playClick)window.playClick();}
  updateReadout();updateHint();
  if(!loopOn)R.draw();
});
if(btnTable)btnTable.addEventListener('click',function(ev){
  clickFx(ev);
  var showing=recPanel.classList.contains('show');/* 热修：R.recPanel 不存在（面板挂在局部 recPanel），引用错名致点击抛错面板不显 */
  recPanel.classList.toggle('show',!showing);
  btnTable.classList.toggle('on',!showing);
  if(window.playClick)window.playClick();
});
btnRec.addEventListener('click',function(ev){clickFx(ev);recFill();});
btnClear.addEventListener('click',function(ev){clickFx(ev);recClear();if(window.playClick)window.playClick();});
function setMode(m){
  R.mode=m;document.body.className='mode-'+m;
  if(m==='m2'){layoutM2();R.m2.showRay=false;R.m2.showExt=false;R.m2.showNormal=false;R.m2.showSym=false;R.m2.animT=0;R.m2.heldItem=null;
    if(cbRay)cbRay.checked=false;if(cbExt)cbExt.checked=false;if(cbNorm)cbNorm.checked=false;if(cbSym)cbSym.checked=false;
  }
  if(m==='m3'){layoutM3();R.m3.angle=45;R.m3.showPath=false;R.m3.rayT0=0;R.m3.animT=0;R.m3.path=null;R.m3.inEye=false;R.m3.bgCv=null;
    if(angleS){angleS.value=45;}if(readAngle)readAngle.textContent='45.0';
    if(cbPath)cbPath.checked=false;
  }
  updateHint();if(!loopOn)R.draw();
}
document.getElementById('mode-m1').addEventListener('click',function(ev){clickFx(ev);setMode('m1');if(window.playClick)window.playClick();});
document.getElementById('mode-m2').addEventListener('click',function(ev){clickFx(ev);setMode('m2');if(window.playClick)window.playClick();});
document.getElementById('mode-m3').addEventListener('click',function(ev){clickFx(ev);setMode('m3');if(window.playClick)window.playClick();});
function clickFx(ev){R.ripple={t0:performance.now(),x:ev.clientX,y:ev.clientY};startLoop();}
function startLoop(){if(!loopOn){loopOn=true;requestAnimationFrame(loop);}}
function loop(){
  try{R.draw();}catch(err){console.error('mirror draw:',err);}
  var alphaTarget=(R.eqOn&&R.matched)?1.0:0.4;
  var alphaNeed=R.objLit&&Math.abs(alphaTarget-R.imgAlpha)>0.01;
  var animNeed=false;
  if(R.lightFx){var kf=1-(performance.now()-R.lightFx.t0)/300;if(kf<=0)R.lightFx=null;else animNeed=true;}
  if(R.ripple.t0){var kk=1-(performance.now()-R.ripple.t0)/300;if(kk<=0)R.ripple.t0=0;else animNeed=true;}
  if(R.eqState==='held'){
    R.eqScale+=(1-R.eqScale)*0.15;
    if(Math.abs(1-R.eqScale)>0.01)animNeed=true;else R.eqScale=1;
  }
  if(R.eqState==='stowing'){
    var t=(performance.now()-R.eqStow.t0)/200;
    if(t>=1){R.eqState='tray';R.eqStow=null;R.eqScale=0.35;}
    else{
      var e=t*t;
      R.eqHeldX=R.eqStow.x0+(R.eqStow.x1-R.eqStow.x0)*e;
      R.eqHeldY=R.eqStow.y0+(R.eqStow.y1-R.eqStow.y0)*e;
      R.eqScale=1-(1-0.35)*e;
      animNeed=true;
    }
  }
  if(R.mode==='m2'){
    var anyOn=R.m2.showRay||R.m2.showExt||R.m2.showNormal;
    R.m2.flowT=performance.now();
    if(R.m2.rayT0){
      var rt=(performance.now()-R.m2.rayT0)/600;
      R.m2.animT=Math.min(2,rt);
      animNeed=animNeed||rt<2.2;
    }
    if(anyOn||R.m2.eye.dragEye)animNeed=true;
    var ta=R.m2.eye.inBeam?0.85:(R.m2.showRay?0.18:0.45);
    if(Math.abs(R.m2.imgAlpha-ta)>0.01)animNeed=true;
  }
  if(R.mode==='m3'){
    R.m3.flowT=performance.now();
    if(R.m3.showPath)animNeed=true;
    if(R.m3.rayT0){
      var rt3=(performance.now()-R.m3.rayT0)/600;
      R.m3.animT=Math.min(2,rt3);
      animNeed=animNeed||rt3<2.2;
    }
  }
  if(R.eqState==='falling'){
    var t=(performance.now()-R.eqFall.t0)/350;
    if(t>=1){R.eqState='placed';R.eqDo=(R.eqX-R.mirrorX)/K;R.eqOn=true;R.eqFall=null;checkMatch();updateReadout();animNeed=true;if(window.playDrop)window.playDrop();}/* 落地即判重合；续跑 alpha lerp */
    else{
      var e=t*t;
      var tx=R.eqFall.x0+(R.eqFall.x1-R.eqFall.x0)*e;
      var ty=R.eqFall.y0+(R.eqFall.y1-R.eqFall.y0)*e;
      R.eqX=tx;R.eqHeldY=ty;R.eqScale=1;R.eqHeldX=tx;
      if(t>0.85&&!R.eqFall.playedDrop){if(window.playDrop)window.playDrop();R.eqFall.playedDrop=true;}
      animNeed=true;
    }
  }
  if(alphaNeed||animNeed)requestAnimationFrame(loop);
  else loopOn=false;
}
function toggleLit(){
  var wasLit=R.objLit;
  R.objLit=!wasLit;
  if(R.objLit){
    if(window.playLight)window.playLight();
    R.lightFx={t0:performance.now(),x:R.objX,y:R.candleY-R.candleH*0.88};
  }else{if(window.playSnuff)window.playSnuff();R.imgAlpha=0.4;}
  updateHint();
}
function pos(ev){var r=cv.getBoundingClientRect();return{x:ev.clientX-r.left,y:ev.clientY-r.top};}
function hitObj(p){return Math.abs(p.x-R.objX)<Math.max(18,R.candleH*0.14)&&p.y>=R.candleY-R.candleH-12&&p.y<=R.candleY+8;}
function hitEq(p){return Math.abs(p.x-R.eqX)<Math.max(18,R.candleH*0.14)&&p.y>=R.candleY-R.candleH-12&&p.y<=R.candleY+8;}
function hitM2S(p){var m=R.m2;return Math.abs(p.x-m.candle.x)<Math.max(16,m.candle.h*0.12)&&p.y>=m.candle.y-m.candle.h-12&&p.y<=m.candle.y+8;}
function hitM2Screen(p){var m=R.m2,g=PROPS.screenGeom(m.screen.x,m.screen.y,m.screen.h);return Math.abs(p.x-g.cx)<g.fw/2+10&&p.y>g.cy-m.screen.h*0.5&&p.y<g.cy+m.screen.h*0.5;}
function hitM2Eye(p){var m=R.m2;var dx=p.x-m.eye.x,dy=p.y-m.eye.y;return (dx*dx)/(m.eye.rx*m.eye.rx)+(dy*dy)/(m.eye.ry*m.eye.ry)<=1.5;}
function hitM3Mirror(p,mr){var x=(mr.state==='held')?mr.heldX:mr.x,y=(mr.state==='held')?mr.heldY:mr.y;return Math.hypot(p.x-x,p.y-y)<=34;}
function m3HitSlot(p){var m=R.m3;if(!m.tray)return null;return m.tray.hitSlot(p);}
cv.addEventListener('pointermove',function(ev){
  var p=pos(ev);
  if(R.mode==='m2'){
    var m=R.m2,hS=hitM2S(p),hSc=hitM2Screen(p),hE=hitM2Eye(p),hTray=m.tray&&m.tray.hitSlot(p);
    cv.style.cursor=(hS||hSc||hE||hTray||m.dragS||m.dragScreen||m.eye.dragEye||m.heldItem)?'pointer':'default';
    if(!dragging)return;
    if(Math.hypot(p.x-downPt.x,p.y-downPt.y)>3)downMoved=true;
    if(!downMoved)return;
    if(dragging==='m2s'){m.candle.x=Math.max(30,Math.min(m.mirrorX-30,p.x));m.candle.y=Math.max(30,Math.min(R.H-30,p.y));syncM2Candle();checkEyeInBeam();checkScreenAtSp();updateHint();}
    if(dragging==='screen'){m.screen.heldX=p.x;m.screen.heldY=p.y;checkScreenAtSp();}
    if(dragging==='eye'){m.eye.heldX=p.x;m.eye.heldY=p.y;checkEyeInBeam(p.x,p.y);}
    if(dragging==='m2screen'){m.screen.x=Math.max(20,Math.min(R.W-20,p.x));m.screen.y=p.y;checkEyeInBeam();checkScreenAtSp();}
    if(dragging==='m2eye'){m.eye.x=Math.max(20,Math.min(R.W-20,p.x));m.eye.y=Math.max(20,Math.min(R.H-20,p.y));checkEyeInBeam();}
    startLoop();return;
  }
  if(R.mode==='m3'){
    var m=R.m3,ht=m.tray&&m.tray.hitSlot(p),hp=(m.top.state==='placed'&&hitM3Mirror(p,m.top))||(m.bottom.state==='placed'&&hitM3Mirror(p,m.bottom)),hh=(m.top.state==='held'&&dragging==='top')||(m.bottom.state==='held'&&dragging==='bottom');
    cv.style.cursor=(ht||hp||hh)?'pointer':'default';
    if(!dragging)return;
    if(Math.hypot(p.x-downPt.x,p.y-downPt.y)>3)downMoved=true;
    if(!downMoved)return;
    if(dragging==='top'){m.top.heldX=p.x;m.top.heldY=p.y;checkM3(false);}
    if(dragging==='bottom'){m.bottom.heldX=p.x;m.bottom.heldY=p.y;checkM3(false);}
    startLoop();return;
  }
  R.hoverObj=hitObj(p);R.hoverEq=(R.eqState==='placed'&&hitEq(p));
  var hitTray=R.eqTray&&R.eqTray.hitSlot(p);
  cv.style.cursor=(R.hoverObj||R.hoverEq||(R.eqState==='tray'&&hitTray)||(R.eqState==='held'))?'pointer':'default';
  if(!dragging)return;
  if(Math.hypot(p.x-downPt.x,p.y-downPt.y)>3)downMoved=true;
  if(!downMoved)return;
  if(dragging==='obj'){setObjPx(p.x);if(window.playTick)window.playTick();}
  if(dragging==='eq'&&R.eqState==='placed'){
    if(!R.eqLift){
      if((downPt.y-p.y)>28){
        R.eqLift=true;R.eqState='held';R.eqScale=1;R.eqHeldX=p.x;R.eqHeldY=p.y;
        if(window.playPick)window.playPick();
      }else{setEqPx(p.x);}
    }
  }
  if(dragging==='eq'&&(R.eqState==='held'||R.eqState==='stowing')){R.eqHeldX=p.x;R.eqHeldY=p.y;}
  startLoop();
});
cv.addEventListener('pointerdown',function(ev){
  var p=pos(ev);clickFx(ev);
  if(R.mode==='m2'){
    downPt=p;downMoved=false;
    if(hitM2S(p)){dragging='m2s';R.m2.dragS=true;cv.setPointerCapture(ev.pointerId);ev.preventDefault();if(window.playPick)window.playPick();return;}
    var slot=R.m2.tray&&R.m2.tray.hitSlot(p);
    if(slot){
      var id=slot.id,m=R.m2;
      if(id==='screen'){m.heldItem='screen';m.screen.state='held';m.screen.heldX=p.x;m.screen.heldY=p.y;}
      else if(id==='eye'){m.heldItem='eye';m.eye.state='held';m.eye.heldX=p.x;m.eye.heldY=p.y;}
      dragging=id;downMoved=true;
      cv.setPointerCapture(ev.pointerId);ev.preventDefault();
      if(window.playPick)window.playPick();return;
    }
    if(hitM2Screen(p)){dragging='m2screen';R.m2.dragScreen=true;cv.setPointerCapture(ev.pointerId);ev.preventDefault();if(window.playPick)window.playPick();return;}
    if(hitM2Eye(p)){dragging='m2eye';R.m2.eye.dragEye=true;cv.setPointerCapture(ev.pointerId);ev.preventDefault();if(window.playPick)window.playPick();return;}
    return;
  }
  if(R.mode==='m3'){
    downPt=p;downMoved=false;
    var m=R.m3,slot=m.tray&&m.tray.hitSlot(p);
    if(slot){
      var idx=slot.x<m.tray.card.x+m.tray.card.w*0.5?0:1,key=idx===0?'top':'bottom';
      if(m[key].state==='tray'){m[key].state='held';m[key].heldX=p.x;m[key].heldY=p.y;m.heldItem=key;dragging=key;downMoved=true;cv.setPointerCapture(ev.pointerId);ev.preventDefault();if(window.playPick)window.playPick();return;}
    }
    if((m.top.state==='placed'||m.top.state==='slot')&&hitM3Mirror(p,m.top)){m.top.state='held';m.top.heldX=p.x;m.top.heldY=p.y;dragging='top';downMoved=true;cv.setPointerCapture(ev.pointerId);ev.preventDefault();if(window.playPick)window.playPick();return;}
    if((m.bottom.state==='placed'||m.bottom.state==='slot')&&hitM3Mirror(p,m.bottom)){m.bottom.state='held';m.bottom.heldX=p.x;m.bottom.heldY=p.y;dragging='bottom';downMoved=true;cv.setPointerCapture(ev.pointerId);ev.preventDefault();if(window.playPick)window.playPick();return;}
    return;
  }
  if(R.mode!=='m1')return;
  downPt=p;downMoved=false;
  if(R.eqState==='tray'&&R.eqTray&&R.eqTray.hitSlot(p)){
    R.eqState='held';R.eqScale=0.4;R.eqHeldX=p.x;R.eqHeldY=p.y;
    dragging='eq';downMoved=true;
    cv.setPointerCapture(ev.pointerId);ev.preventDefault();
    if(window.playPick)window.playPick();return;
  }
  if(R.eqState==='placed'&&hitEq(p)){
    dragging='eq';R.eqLift=false;
    cv.setPointerCapture(ev.pointerId);ev.preventDefault();
    return;
  }
  if(hitObj(p)){dragging='obj';cv.setPointerCapture(ev.pointerId);ev.preventDefault();if(window.playPick)window.playPick();return;}
});
function pointInPoly(px,py,poly){
  if(!poly||poly.length<4)return false;
  var sign=0;
  for(var i=0;i<poly.length;i++){
    var a=poly[i],b=poly[(i+1)%poly.length];
    var cross=(b.x-a.x)*(py-a.y)-(b.y-a.y)*(px-a.x);
    if(cross===0)continue;
    if(sign===0)sign=cross>0?1:-1;
    else if((cross>0&&sign<0)||(cross<0&&sign>0))return false;
  }
  return sign!==0;
}
function checkEyeInBeam(x,y){
  var m=R.m2,ey=m.eye;
  var was=m.eye.inBeam;
  if(m.eye.state==='tray'){m.eye.inBeam=false;if(was!==false)updateHint();return;}
  if(arguments.length<2){x=ey.x;y=ey.y;}
  if(!m.showRay||m.wedgePoly.length<4){m.eye.inBeam=false;if(m.eye.inBeam!==was)updateHint();return;}
  m.eye.inBeam=pointInPoly(x,y,m.wedgePoly);
  if(m.eye.inBeam!==was){updateHint();startLoop();}
}
function checkScreenAtSp(){var m=R.m2;var sx=(m.screen.state==='held')?m.screen.heldX:m.screen.x;m.screenAtSp=(m.screen.state!=='tray')&&Math.abs(sx-m.Sp.x)<=20;updateHint();}
function checkM3(commit){
  var m=R.m3;
  if(commit){
    ['top','bottom'].forEach(function(key){
      var mr=m[key],slot=m[key+'Slot'];
      if(mr.state==='held'){
        if(Math.hypot(mr.heldX-slot.x,mr.heldY-slot.y)<=slot.r){mr.state='slot';mr.x=slot.x;mr.y=slot.y;}
        else{mr.state='placed';mr.x=mr.heldX;mr.y=mr.heldY;}
      }
    });
  }
  computeM3Path();
}
function computeM3Path(){
  var m=R.m3,t=m.tube;
  var hadPath=!!m.path; /* R23：null→非null 才重置 pathT0；角度变化重算不重置 */
  m.path=null;m.inEye=false;
  if(m.top.state!=='slot'||m.bottom.state!=='slot'){updateHint();return;}
  var th=m.angle*Math.PI/180;
  var p0={x:m.objPos.x,y:t.y1},i1={x:t.x_r,y:t.y1};
  if(Math.abs(m.angle-45)<=0.5){
    var i2={x:t.x_r,y:t.y2};
    if(!hadPath)m.pathT0=performance.now();
    m.path={p0:p0,i1:i1,i2:i2,ex:m.eyePos.x-30,wall:null}; // R24：第三段光线延伸到眼前（目镜筒缩短后光要出筒口射到眼睛）
    m.inEye=true;updateHint();return;
  }
  var r1={x:Math.cos(2*th),y:Math.sin(2*th)};
  var tx=(r1.x!==0)?((r1.x>0?t.x_r+t.w/2:t.x_r-t.w/2)-t.x_r)/r1.x:Infinity;
  var ty=(t.y2-t.y1)/r1.y;
  var tt=Math.min(tx,ty);
  var wall={x:t.x_r+r1.x*tt,y:t.y1+r1.y*tt};
  if(!hadPath)m.pathT0=performance.now();
  m.path={p0:p0,i1:i1,i2:null,wall:wall};
  m.inEye=false;updateHint();
}
function endDrag(ev){
  if(R.mode==='m2'){
    var m=R.m2,p=ev?pos(ev):{x:R.eqHeldX,y:R.eqHeldY};
    if(dragging==='screen'||dragging==='eye'){
      var item=dragging==='screen'?m.screen:m.eye,slot=m.tray.slots[dragging==='screen'?0:1];
      item.heldX=p.x;item.heldY=p.y;
      if(m.tray.pointInCard(p)){item.state='tray';m.heldItem=null;}
      else{item.x=p.x;item.y=p.y;item.state='placed';m.heldItem=null;}
    }
    if(dragging==='m2screen'){
      if(m.tray.pointInCard(p)){m.screen.state='tray';}
      else{m.screen.state='placed';}
    }
    if(dragging==='m2eye'){
      if(m.tray.pointInCard(p)){m.eye.state='tray';}
      else{m.eye.state='placed';}
    }
    checkScreenAtSp();checkEyeInBeam();m.dragS=false;m.dragScreen=false;m.eye.dragEye=false;
    dragging=null;downPt=null;downMoved=false;updateHint();startLoop();return;
  }
  if(R.mode==='m3'){
    var m=R.m3,p=ev?pos(ev):{x:0,y:0};
    if(dragging==='top'||dragging==='bottom'){
      var mr=m[dragging];
      mr.heldX=p.x;mr.heldY=p.y;
      if(m.tray.pointInCard(p)){mr.state='tray';}
      else{checkM3(true);}
    }
    m.heldItem=null;dragging=null;downPt=null;downMoved=false;updateHint();startLoop();return;
  }
  if(dragging==='obj'&&!downMoved)toggleLit();
  else if(dragging==='eq'&&R.eqState==='held'&&R.eqTray){
    var p=ev?pos(ev):{x:R.eqHeldX,y:R.eqHeldY};
    if(R.eqTray.pointInCard(p)){
      var slot=R.eqTray.slots[0];
      R.eqStow={t0:performance.now(),x0:R.eqHeldX,y0:R.eqHeldY,x1:slot.x,y1:slot.y+slot.h/2};
      R.eqState='stowing';R.eqOn=false;R.hoverEq=false;
      if(window.playClick)window.playClick();
    }else{
      var lo=16,hi=R.W-16;
      var tx=Math.max(lo,Math.min(hi,p.x));
      R.eqFall={t0:performance.now(),x0:p.x,y0:p.y,x1:tx,y1:R.candleY,playedDrop:false};
      R.eqState='falling';R.eqOn=false;
    }
  }
  else if(dragging&&downMoved&&window.playDrop)window.playDrop();
  R.eqLift=false;
  dragging=null;downPt=null;downMoved=false;
  updateHint();startLoop();if(!loopOn)R.draw();
}
cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',endDrag);
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
btnFull.addEventListener('click',function(){if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();});
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(e){document.addEventListener(e,syncFull);});
document.getElementById('btn-reset').addEventListener('click',function(ev){
  clickFx(ev);
  if(R.mode==='m2'){
    layoutM2();
    R.m2.showRay=false;R.m2.showExt=false;R.m2.showNormal=false;R.m2.showSym=false;R.m2.rayT0=0;R.m2.animT=0;R.m2.flowT=0;R.m2.rayPlayed=false;R.m2.imgAlpha=0.45;
    if(cbRay)cbRay.checked=false;if(cbExt)cbExt.checked=false;if(cbNorm)cbNorm.checked=false;if(cbSym)cbSym.checked=false;
    checkScreenAtSp();checkEyeInBeam();updateHint();if(window.playClick)window.playClick();if(!loopOn)R.draw();return;
  }
  if(R.mode==='m3'){
    layoutM3();
    R.m3.top.state='tray';R.m3.bottom.state='tray';
    R.m3.angle=45;R.m3.showPath=false;R.m3.rayT0=0;R.m3.animT=0;R.m3.path=null;R.m3.inEye=false;
    if(angleS)angleS.value=45;if(readAngle)readAngle.textContent='45.0';if(cbPath)cbPath.checked=false;
    updateHint();if(window.playClick)window.playClick();if(!loopOn)R.draw();return;
  }
  R.objLit=false;R.doCm=8;R.eqDo=Math.round(eqMax()*0.9);R.matched=false;R.showAux=false;R.imgAlpha=0.4;
  R.eqState='off';R.eqOn=false;R.eqScale=0;R.eqFall=null;R.eqStow=null;R.eqLift=false;btnEq.classList.remove('on');
  if(recPanel){recPanel.classList.remove('show');if(btnTable)btnTable.classList.remove('on');}
  R.lightFx=null;
  cbAux.checked=false;
  recClear();
  R.objX=R.mirrorX-R.doCm*K;R.eqX=R.mirrorX+R.eqDo*K;
  syncSlider();updateReadout();updateHint();
  if(window.playClick)window.playClick();
  if(!loopOn)R.draw();
});
layout();setMode('m1');startLoop();
window.__mirDbg={
  get objX(){return Math.round(R.objX);},get imgX(){return Math.round(R.mirrorX+R.doCm*K);},
  get eqX(){return Math.round(R.eqX);},get matched(){return R.matched;},get lit(){return R.objLit;}
};
})();

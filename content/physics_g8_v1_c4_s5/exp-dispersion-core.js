'use strict';
/* c4s5 光的色散 · 控制层 (R10 场景重构) */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
PROPS.SPRITE_VER=85;
var cv=document.getElementById('scene'), wrap=document.getElementById('scene-wrap');
var R=window.DSP;
R.ctx=cv.getContext('2d');
var prismS=document.getElementById('prism-slider'), prismV=document.getElementById('prism-val');
var rS=document.getElementById('r-slider'), gS=document.getElementById('g-slider'), bS=document.getElementById('b-slider');
var mixR=document.getElementById('mix-readout'), mixSw=document.getElementById('mix-swatch');
var btnLight=document.getElementById('btn-light');
var hintEl=document.getElementById('hint');
var dragging=null,spawnItem=null,loopOn=false;
R.mode='m1'; R.prismDeg=0; R.sourceOn=false; R.showRays=true; R.showLabels=false; R.dragHint=true;
R.R=255; R.G=255; R.B=255; R.ripple={t0:0,x:0,y:0}; R.sunR=40; R.sunHover=false;

function layout(){
  var r=wrap.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
  R.W=Math.max(280,r.width); R.H=r.height;
  cv.width=Math.round(R.W*dpr); cv.height=Math.round(R.H*dpr);
  R.ctx.setTransform(dpr,0,0,dpr,0,0);
  R.by=R.H*0.70;
  var cbEl=document.querySelector('.ctrlbar'), cvEl=document.getElementById('scene');
  var cbR=cbEl?cbEl.getBoundingClientRect():null, cvR=cvEl?cvEl.getBoundingClientRect():null;
  R.fy=(cbR&&cvR&&cvR.height>0)?Math.round(R.H*(cbR.top-cvR.top)/cvR.height):Math.round(R.H*0.91);
  var prevP=R.prism||{};
  var ph=Math.min(R.H*0.32,190); R.prism={x:R.W*0.30,y:PROPS.seatY(R.by,64,0.218*ph),h:ph,deg:prevP.deg||0};
  R.sunR=Math.min(R.H*0.10,64);
  if(!R.source){R.source={x:R.W*0.10,y:R.H*0.21,on:false};}
  updateHint();
  if(!loopOn)R.draw();
}
window.addEventListener('resize',layout);
function clickFx(ev){R.ripple={t0:performance.now(),x:ev.clientX,y:ev.clientY}; startLoop();}
function startLoop(){if(!loopOn){loopOn=true;requestAnimationFrame(loop);}}
function loop(){try{R.draw();}catch(err){console.error('disp draw:',err);} requestAnimationFrame(loop);}

function setMode(m){
  R.mode=m; document.body.className=(m==='m1'?'mode-m1':'mode-m2');
  document.getElementById('mode-m1').classList.toggle('active',m==='m1');
  document.getElementById('mode-m2').classList.toggle('active',m==='m2');
  updateHint(); if(!loopOn)R.draw();
}
function setPrism(d){d=Math.round(Math.max(-15,Math.min(15,d))); R.prism.deg=d; prismS.value=d; prismV.textContent=d+'°'; if(!loopOn)R.draw();}
function setRGB(k,v){R[k]=v; syncNum(k); updateMix(); if(!loopOn)R.draw();}
function updateMix(){
  var c='rgb('+R.R+','+R.G+','+R.B+')',name=mixName();
  mixR.textContent='R'+R.R+' G'+R.G+' B'+R.B+' '+name;
  if(mixSw)mixSw.style.background=c;
}
function mixName(){
  if(R.R===0&&R.G===0&&R.B===0)return '黑';
  if(R.R===255&&R.G===255&&R.B===255)return '白';
  if(R.R===255&&R.G===255&&R.B===0)return '黄';
  if(R.R===0&&R.G===255&&R.B===255)return '青';
  if(R.R===255&&R.G===0&&R.B===255)return '品红';
  if(R.R===255&&R.G===0&&R.B===0)return '红';
  if(R.R===0&&R.G===255&&R.B===0)return '绿';
  if(R.R===0&&R.G===0&&R.B===255)return '蓝';
  return '混色';
}
function toggleLight(){var was=R.sourceOn; R.sourceOn=!was; if(btnLight)btnLight.textContent=R.sourceOn?'熄灭':'点亮'; updateHint(); if(!loopOn)R.draw();}
function updateHint(){
  if(!hintEl)return;
  if(R.mode==='m2'){hintEl.textContent='拖滑杆或在框内输入 0-255（超范围红框无效）；三色全拉满才显示色名标注'; if(btnLight)btnLight.textContent='点亮'; return;}
  if(btnLight)btnLight.textContent=R.sourceOn?'熄灭':'点亮';
  if(!R.sourceOn){hintEl.textContent='点太阳开启白光'; return;}
  if(R.dragHint){hintEl.textContent='光源已开：棱镜角度滑杆=转棱柱看光带偏移；拖棱柱沿桌改色散距离（墙上光带宽窄变）'; return;}
  hintEl.textContent='白光由各色光混合；红偏折最小，紫偏折最大';
}

prismS.addEventListener('input',function(){setPrism(+this.value); if(window.playTick)window.playTick();});
rS.addEventListener('input',function(){setRGB('R',+this.value); if(window.playTick)window.playTick();});
gS.addEventListener('input',function(){setRGB('G',+this.value); if(window.playTick)window.playTick();});
bS.addEventListener('input',function(){setRGB('B',+this.value); if(window.playTick)window.playTick();});
var NUM={R:document.getElementById('r-num'),G:document.getElementById('g-num'),B:document.getElementById('b-num')};
function syncNum(k){var el=NUM[k]; if(!el)return; if(el.value!==String(R[k]))el.value=String(R[k]); el.classList.remove('invalid');}
['R','G','B'].forEach(function(k){
  var el=NUM[k]; if(!el)return;
  el.addEventListener('input',function(){
    var t=el.value.trim(), v=Number(t);
    if(t!==''&&/^\d+$/.test(t)&&v>=0&&v<=255){
      el.classList.remove('invalid');
      if(k==='R')rS.value=v; if(k==='G')gS.value=v; if(k==='B')bS.value=v;
      setRGB(k,v);
      if(window.playTick)window.playTick();
    }else{
      el.classList.add('invalid');
    }
  });
  el.addEventListener('blur',function(){ if(el.classList.contains('invalid')){ el.value=String(R[k]); el.classList.remove('invalid'); } });
});
document.getElementById('mode-m1').addEventListener('click',function(ev){clickFx(ev); setMode('m1'); if(window.playClick)window.playClick();});
document.getElementById('mode-m2').addEventListener('click',function(ev){clickFx(ev); setMode('m2'); if(window.playClick)window.playClick();});
if(btnLight)btnLight.addEventListener('click',function(ev){clickFx(ev); toggleLight(); if(window.playClick)window.playClick();});
document.getElementById('cb-rays').addEventListener('change',function(){R.showRays=this.checked; if(!loopOn)R.draw();});
document.getElementById('cb-labels').addEventListener('change',function(){R.showLabels=this.checked; if(!loopOn)R.draw();});
var traySrc=document.getElementById('tray-source');
if(traySrc){traySrc.style.cursor='pointer'; traySrc.addEventListener('click',function(){toggleLight();});}
document.getElementById('btn-reset').addEventListener('click',function(ev){
  clickFx(ev);
  R.mode='m1'; R.prism.x=R.W*0.30; R.prism.deg=0; R.sourceOn=false; R.R=255; R.G=255; R.B=255;
  R.source={x:R.W*0.10,y:R.H*0.21};
  R.showRays=true; R.showLabels=false; R.dragHint=true;
  prismS.value=0; prismV.textContent='0°';
  rS.value=255; gS.value=255; bS.value=255; syncNum('R');syncNum('G');syncNum('B'); if(btnLight)btnLight.textContent='点亮';
  setMode('m1'); updateMix(); updateHint(); if(!loopOn)R.draw();
});

function pos(ev){var r=cv.getBoundingClientRect(); return {x:ev.clientX-r.left,y:ev.clientY-r.top};}
function hitSun(p){return Math.hypot(p.x-R.source.x,p.y-R.source.y)<R.sunR+8;}
function hitPrism(p){var py=R.prism.y, ph=R.prism.h; return Math.abs(p.x-R.prism.x)<40 && p.y>=py-ph-20 && p.y<=py+10;}
cv.addEventListener('pointermove',function(ev){
  var p=pos(ev);
  R.sunHover=hitSun(p);
  cv.style.cursor=(R.sunHover||hitPrism(p))?'move':'default';
  if(!dragging&&!spawnItem)return;
  var it=dragging||spawnItem;
  if(it==='prism'){R.prism.x=Math.max(R.W*0.12,Math.min(R.W*0.46,p.x));}
  if(!loopOn)R.draw();
});
cv.addEventListener('pointerdown',function(ev){
  var p=pos(ev); clickFx(ev);
  if(R.mode!=='m1')return;
  if(hitSun(p)){var was=R.sourceOn; R.sourceOn=!was; if(btnLight)btnLight.textContent=R.sourceOn?'熄灭':'点亮'; updateHint(); if(!loopOn)R.draw(); ev.preventDefault(); return;}

  if(hitPrism(p)){dragging='prism'; R.dragHint=false; cv.setPointerCapture(ev.pointerId); ev.preventDefault(); if(window.playClick)window.playClick(); return;}
});
function endDrag(){dragging=null; spawnItem=null; updateHint(); if(!loopOn)R.draw();}
cv.addEventListener('pointerup',endDrag); cv.addEventListener('pointercancel',endDrag);
document.addEventListener('pointerup',function(){if(spawnItem){endDrag();}});
function trayStart(id,ev){
  if(R.mode!=='m1')return;
  spawnItem=id; var r=cv.getBoundingClientRect();
  var p={x:ev.clientX-r.left,y:ev.clientY-r.top};

  if(window.playClick)window.playClick(); startLoop(); ev.preventDefault();
}


var btnFull=document.getElementById('btn-full');
function pickFn(el,names){for(var i=0;i<names.length;i++){var fn=el[names[i]]; if(typeof fn==='function')return fn;}return null;}
function fullEl(){return document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement;}
function syncFull(){btnFull.textContent=(fullEl()||document.documentElement.classList.contains('pseudo-fs'))?'退出全屏':'全屏';}
function reqFull(){
  var el=document.documentElement,f=pickFn(el,['requestFullscreen','webkitRequestFullscreen','webkitRequestFullScreen','mozRequestFullScreen','msRequestFullscreen']);
  if(!f){document.documentElement.classList.add('pseudo-fs'); syncFull(); return;}
  var r=f.call(el); if(r&&r.catch)r.catch(function(){document.documentElement.classList.add('pseudo-fs'); syncFull();});
  setTimeout(function(){if(!fullEl()&&!document.documentElement.classList.contains('pseudo-fs')){document.documentElement.classList.add('pseudo-fs'); syncFull();}},400);
}
function exitFull(){
  var f=pickFn(document,['exitFullscreen','webkitExitFullscreen','webkitCancelFullScreen','mozCancelFullScreen','msExitFullscreen']);
  if(f)f.call(document); document.documentElement.classList.remove('pseudo-fs'); syncFull();
}
btnFull.addEventListener('click',function(){ if(fullEl()||document.documentElement.classList.contains('pseudo-fs')) exitFull(); else reqFull(); });
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(e){document.addEventListener(e,syncFull);});

layout(); updateMix(); updateHint(); startLoop();
window.__dspDbg={
  get bandX0(){return R.bandX0==null?null:Math.round(R.bandX0);},
  get bandX1(){return R.bandX1==null?null:Math.round(R.bandX1);},
  get bandC(){return R.bandX0==null?null:Math.round((R.bandX0+R.bandX1)/2);},
  get faceW(){return R.faceW==null?null:Math.round(R.faceW);},
  get faceXMid(){return R.faceXMid==null?null:Math.round(R.faceXMid);},
  get bandY(){return R.bandY==null?null:Math.round(R.bandY);}
};
})();

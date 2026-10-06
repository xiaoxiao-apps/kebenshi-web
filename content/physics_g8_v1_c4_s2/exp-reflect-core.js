'use strict';
/* c4s2 光的反射 · 控制层：布局/交互/控件同步；渲染几何见 exp-reflect-render.js (window.RFX) */
(function(){
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
PROPS.SPRITE_VER=81;
var cv=document.getElementById('scene'), wrap=document.getElementById('scene-wrap');
var R=window.RFX;
R.ctx=cv.getContext('2d');
var slider=document.getElementById('ang-slider'),angVal=document.getElementById('ang-val');
var readI=document.getElementById('read-i'),readR=document.getElementById('read-r');
var foldSlider=document.getElementById('fold-slider'),foldVal=document.getElementById('fold-val');
var roughSlider=document.getElementById('rough-slider'),roughVal=document.getElementById('rough-val');
var surfaceSel=document.getElementById('surface');
var beamRadios=document.getElementsByName('beam-mode');
var hintEl=document.getElementById('hint');
var dragging=false,loopOn=false;
R.laserOn=false; R.fold=0; R.rough=0; R.beamMode='single'; R.showArrow=false; R.sunHover=false;
R.pulse.loop=false; R.pulse.active=false; R.pulse.reverse=false;

// 高清适配 + resize 按比例重排（O/mirrorY/L/器材全按 W/H 重算，不许悬空/出界）
function layout(){
  var r=wrap.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
  R.W=Math.max(280,r.width); R.H=r.height;
  cv.width=Math.round(R.W*dpr); cv.height=Math.round(R.H*dpr);
  R.ctx.setTransform(dpr,0,0,dpr,0,0);
  R.by=R.H*0.80;                                   // 桌面顶缘（PROPS.bench 默认 topRatio 0.80）
  R.L=Math.min(R.W*0.36,R.H*0.40);                 // 光线长度
  R.mirrorLen=Math.min(R.W*0.42,R.H*0.5);          // 平放镜面板宽度
  R.mirrorDepth=Math.max(46,R.mirrorLen*0.14);     // 2.5D 躺镜总深
  R.mirrorY=R.by+2-0.75*R.mirrorDepth;             // (x,y)=镜面顶面中心=入射点
  R.O={x:R.W/2, y:R.mirrorY};                      // 入射点 O
  R.boardH=R.H*0.52;                               // 白纸板高
  updateHint();
  if(!loopOn)R.draw();
}
window.addEventListener('resize',layout);

// ∠i 唯一角度状态（∠r≡∠i 同变量）；0°时垂直入射原路返回（F 与 E 关于法线对称重叠）
function setAngleDeg(d,snd){
  d=Math.max(0,Math.min(80,Math.round(d)));
  R.angleI=d*Math.PI/180;
  slider.value=d; angVal.textContent=d+'°';
  readI.textContent=d+'°'; readR.textContent=d+'°';
  if(snd==='tick'&&window.playTick)window.playTick();
  if(snd==='click'&&window.playClick)window.playClick();
  if(!loopOn)R.draw();
}

function loop(){
  try{R.draw();}catch(err){console.error('reflect draw:',err);}
  requestAnimationFrame(loop);
}
function startLoop(){if(!loopOn){loopOn=true;requestAnimationFrame(loop);}}

function clickFx(ev){
  R.ripple={t0:performance.now(), x:ev.clientX, y:ev.clientY};
  startLoop();
}
document.addEventListener('pointerdown',function(ev){clickFx(ev);});

slider.addEventListener('input',function(){setAngleDeg(+slider.value,'tick');});
foldSlider.addEventListener('input',function(){
  R.fold=+this.value; foldVal.textContent=this.value+'°';
  updateHint();
  if(!loopOn)R.draw();
});
function syncSurface(){
  var isRough=surfaceSel.value==='rough';
  roughSlider.disabled=!isRough;
  R.rough=isRough?+roughSlider.value:0;
  roughVal.textContent=R.rough;
  updateHint();
  if(!loopOn)R.draw();
}
surfaceSel.addEventListener('change',syncSurface);
roughSlider.addEventListener('input',function(){roughVal.textContent=this.value; R.rough=+this.value; if(!loopOn)R.draw();});
for(var i=0;i<beamRadios.length;i++){
  beamRadios[i].addEventListener('change',function(){if(this.checked){R.beamMode=this.value; updateHint(); if(!loopOn)R.draw();}});
}
document.getElementById('ang-minus').addEventListener('click',function(ev){clickFx(ev);setAngleDeg(R.angleI*180/Math.PI-1,'click');});
document.getElementById('ang-plus').addEventListener('click',function(ev){clickFx(ev);setAngleDeg(R.angleI*180/Math.PI+1,'click');});

document.getElementById('btn-reverse').addEventListener('click',function(ev){
  clickFx(ev); R.pulse.reverse=!R.pulse.reverse; R.pulse.active=true; R.pulse.t0=performance.now(); startLoop();
  updateHint(); if(window.playClick)window.playClick();
});
document.getElementById('btn-reset').addEventListener('click',function(ev){
  R.pulse.active=false; R.pulse.loop=false; R.pulse.reverse=false; R.laserOn=false; R.fold=0; R.rough=0; R.beamMode='single';
  foldSlider.value=0; foldVal.textContent='0°';
  roughSlider.value=40; roughVal.textContent='40';
  surfaceSel.value='smooth'; syncSurface();
  for(var i=0;i<beamRadios.length;i++){ if(beamRadios[i].value==='single') beamRadios[i].checked=true; }
  setAngleDeg(45,'click'); clickFx(ev);
});

document.getElementById('cb-normal').addEventListener('change',function(){R.showNormal=this.checked;if(!loopOn)R.draw();});
document.getElementById('cb-arc').addEventListener('change',function(){R.showArc=this.checked;if(!loopOn)R.draw();});
document.getElementById('cb-arrow').addEventListener('change',function(){R.showArrow=this.checked;if(!loopOn)R.draw();});
document.getElementById('cb-read').addEventListener('change',function(){
  var d=this.checked?'':'none';
  readI.parentNode.style.display=d; readR.parentNode.style.display=d;
});

function updateHint(){
  if(!hintEl)return;
  if(R.beamMode==='beam'){hintEl.textContent=(!R.laserOn?'点太阳开关平行光':'平行光束：太阳光平行入射；滑杆改入射角'); return;}
  if(R.fold>0){hintEl.textContent='纸板折起：反射光不在折后纸板上——三线共面'; return;}
  if(R.pulse.reverse){hintEl.textContent='光路可逆：光沿原反射路射入，沿原入射路射出'; return;}
  if(R.rough>0){hintEl.textContent='粗糙面：逐点 obey 局部反射定律'; return;}
  if(!R.laserOn){hintEl.textContent=(R.beamMode==='beam'?'点太阳开关平行光':'激光已关：点激光笔红钮可重新开启'); return;}
  hintEl.textContent='点激光笔红钮开关激光；拖笔身改入射角';
}
// 笔底中心锚点容器坐标换算 + 移动拖拽（命中笔口或 E 端点 30px 内）
function pos(ev){var r=cv.getBoundingClientRect();return{x:ev.clientX-r.left,y:ev.clientY-r.top};}
function hitRedButton(p){
  var pp=R.penPose(),th=pp.angle*Math.PI/180,c=Math.cos(-th),s=Math.sin(-th);
  var dx=p.x-pp.x, dy=p.y-pp.y;
  var lx=dx*c-dy*s, ly=dx*s+dy*c;
  return lx>=-R.penW/2+0.7222*R.penW && lx<=-R.penW/2+0.8179*R.penW &&
         ly>=-R.penH+0.1778*R.penH && ly<=-R.penH+0.5222*R.penH;
}
cv.addEventListener('pointermove',function(ev){
  var p=pos(ev);
  if(R.beamMode==='beam' && R.sunHit){
    var dx=p.x-R.sunHit.x, dy=p.y-R.sunHit.y;
    R.sunHover=dx*dx+dy*dy<R.sunHit.r*R.sunHit.r;
    cv.style.cursor=R.sunHover?'pointer':'default';
    if(R.sunHover && !loopOn) R.draw();
  }
  if(!dragging||R.beamMode==='beam')return;
  var O=R.O;
  // a=clamp(deg(atan2(|O.x-p.x|, max(1,O.y-p.y))),0,80)；限上半平面
  var a=Math.atan2(Math.abs(p.x-O.x),Math.max(1,O.y-p.y))*180/Math.PI;
  setAngleDeg(a,'tick');
});
function stopDrag(){dragging=false;R.dragFb=false;if(!loopOn)R.draw();}
cv.addEventListener('pointerdown',function(ev){
  var p=pos(ev);
  if(R.beamMode==='beam' && R.sunHit){
    var dx=p.x-R.sunHit.x, dy=p.y-R.sunHit.y;
    if(dx*dx+dy*dy<R.sunHit.r*R.sunHit.r){
      R.laserOn=!R.laserOn; clickFx(ev); updateHint(); if(window.playClick)window.playClick(); ev.preventDefault(); return;
    }
    return;
  }
  var e=R.E(),pp=R.penPose();
  if(hitRedButton(p)){R.laserOn=!R.laserOn; clickFx(ev); if(window.playClick)window.playClick(); updateHint(); ev.preventDefault(); return;}
  // 命中=笔身包围盒（圆心近似）或 E 点 30px 内
  var hitPen=Math.hypot(p.x-pp.x,p.y-pp.y)<=R.penW*0.55;
  if(hitPen||Math.hypot(p.x-e.x,p.y-e.y)<=30){dragging=true;R.dragFb=true;cv.setPointerCapture(ev.pointerId);ev.preventDefault();if(window.playClick)window.playClick();}
});
cv.addEventListener('pointerup',stopDrag);
cv.addEventListener('pointercancel',stopDrag);

// 全屏：native + CSS pseudo-fs 兜底（兼容 Safari 大小写前缀 + IE ms）
var btnFull=document.getElementById('btn-full');
var pseudoFsTimer=0;
function pickFn(elOrDoc, names){
  for(var i=0;i<names.length;i++){ var n=names[i], fn=elOrDoc[n]; if(typeof fn==='function') return fn; }
  return null;
}
window.__fsCap={
  hasReq:!!document.documentElement.requestFullscreen,
  hasWebkitLC:!!document.documentElement.webkitRequestFullscreen,
  hasWebkitUC:!!document.documentElement.webkitRequestFullScreen,
  hasMoz:!!document.documentElement.mozRequestFullScreen,
  hasMs:!!document.documentElement.msRequestFullscreen,
  hasExit:!!document.exitFullscreen,
  hasExitWebkitLC:!!document.webkitExitFullscreen,
  hasExitWebkitUC:!!document.webkitCancelFullScreen,
  hasExitMoz:!!document.mozCancelFullScreen,
  hasExitMs:!!document.msExitFullscreen
};
function reqFull(){
  var el=document.documentElement;
  var f=pickFn(el,['requestFullscreen','webkitRequestFullscreen','webkitRequestFullScreen','mozRequestFullScreen','msRequestFullscreen']);
  if(!f){
    if(hintEl){ hintEl.textContent='全屏：兼容模式（当前浏览器无全屏API）'; }
    document.documentElement.classList.add('pseudo-fs'); syncFull(); return;
  }
  if(hintEl) hintEl.textContent='全屏：原生模式';
  var r=f.call(el);
  if(r&&r.catch){
    r.catch(function(){
      if(hintEl) hintEl.textContent='全屏被拒绝，已切兼容模式';
      document.documentElement.classList.add('pseudo-fs'); syncFull();
    });
  }
  clearTimeout(pseudoFsTimer);
  pseudoFsTimer=setTimeout(function(){
    if(!fullEl() && !document.documentElement.classList.contains('pseudo-fs')){ document.documentElement.classList.add('pseudo-fs'); syncFull(); }
  },400);
}
function exitFull(){
  var f=pickFn(document,['exitFullscreen','webkitExitFullscreen','webkitCancelFullScreen','mozCancelFullScreen','msExitFullscreen']);
  if(f) f.call(document);
  document.documentElement.classList.remove('pseudo-fs'); syncFull();
}
function fullEl(){return document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement;}
function syncFull(){btnFull.textContent=(fullEl()||document.documentElement.classList.contains('pseudo-fs'))?'退出全屏':'全屏';}
btnFull.addEventListener('click',function(){ if(fullEl()||document.documentElement.classList.contains('pseudo-fs')) exitFull(); else reqFull(); });
document.addEventListener('fullscreenchange',syncFull);
document.addEventListener('webkitfullscreenchange',syncFull);
document.addEventListener('mozfullscreenchange',syncFull);
document.addEventListener('MSFullscreenChange',syncFull);

layout(); setAngleDeg(45); syncFull(); startLoop();
})();
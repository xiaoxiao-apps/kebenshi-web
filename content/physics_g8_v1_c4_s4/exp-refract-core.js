'use strict';
/* c4s4 光的折射 · 控制层（唯一写 window.RR 的地方） */
PROPS.SPRITE_BASE='../_lib/v1/sprites/'; // 同 c4s1/c4s3：sprite 基址指共享库目录（props.js 默认'sprites/'相对页面目录=404）
(function(){
var sliderI=document.getElementById('slider-i'),valI=document.getElementById('val-i'),valR=document.getElementById('val-r');
var btnWater=document.getElementById('btn-water'),btnGlass=document.getElementById('btn-glass');
var chkNormal=document.getElementById('chk-normal'),chkAngles=document.getElementById('chk-angles'),chkReflect=document.getElementById('chk-reflect'),chkReverse=document.getElementById('chk-reverse');
var btnReset=document.getElementById('btn-reset');
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function deg(rad){return rad*180/Math.PI;}
var RR=window.RR;
if(!RR)window.RR=RR={medium:'water',iDeg:40,laserOn:false,showNormal:false,showAngles:false,showReflect:false,reverse:false};

function n2(){return RR.medium==='water'?1.333:1.500;}
function refrDeg(iDeg){var i=iDeg*Math.PI/180;if(iDeg<=0)return 0;var s=Math.sin(i)/n2();return Math.asin(Math.min(1,s))*180/Math.PI;}
function fmt(v){return v.toFixed(1);}
function updateReadout(){valI.textContent=fmt(RR.iDeg);valR.textContent=fmt(refrDeg(RR.iDeg));}
function setMedium(m){
  RR.medium=m;
  btnWater.classList.toggle('active',m==='water');btnGlass.classList.toggle('active',m==='glass');
  updateReadout();
}
function syncControls(){
  sliderI.value=String(RR.iDeg);updateReadout();
  btnWater.classList.toggle('active',RR.medium==='water');btnGlass.classList.toggle('active',RR.medium==='glass');
  chkNormal.checked=RR.showNormal;chkAngles.checked=RR.showAngles;chkReflect.checked=RR.showReflect;chkReverse.checked=RR.reverse;
}
function reset(){
  RR.medium='water';RR.iDeg=40;RR.laserOn=false;RR.showNormal=false;RR.showAngles=false;RR.showReflect=false;RR.reverse=false;
  syncControls();if(window.playClick)window.playClick();
}

sliderI.addEventListener('input',function(){
  var v=parseFloat(this.value),old=RR.iDeg;
  RR.iDeg=v;updateReadout();
  if(Math.abs(v-old)>=1&&window.playTick)window.playTick();
});
btnWater.addEventListener('click',function(){setMedium('water');if(window.playClick)window.playClick();});
btnGlass.addEventListener('click',function(){setMedium('glass');if(window.playClick)window.playClick();});
chkNormal.addEventListener('change',function(){RR.showNormal=this.checked;if(window.playClick)window.playClick();});
chkAngles.addEventListener('change',function(){RR.showAngles=this.checked;if(window.playClick)window.playClick();});
chkReflect.addEventListener('change',function(){RR.showReflect=this.checked;if(window.playClick)window.playClick();});
chkReverse.addEventListener('change',function(){RR.reverse=this.checked;if(window.playClick)window.playClick();});
function toggleLaser(){
  RR.laserOn=!RR.laserOn;
  if(RR.laserOn){if(window.playLight)window.playLight();}else{if(window.playSnuff)window.playSnuff();}
}
btnReset.addEventListener('click',reset);

// 全屏按钮照上一节 c4_s3 原版：系统卡文字钮 + documentElement 全屏 + html.pseudo-fs 降级
var btnFull=document.getElementById('btn-full')||document.getElementById('fsBtn');
function penBodyHit(mx,my){ // 笔身旋转矩形命中（整支笔都可拖，蔡总 09:09）：局部 u∈[-w/2,w/2]、v∈[-h,0] 各放宽 14px
  var b=window.RRDraw&&window.RRDraw.penBody;
  if(!b)return false;
  var dx=mx-b.x,dy=my-b.y,ca=Math.cos(b.a),sa=Math.sin(b.a);
  var u=dx*ca+dy*sa,v=-dx*sa+dy*ca;
  return Math.abs(u)<=b.w/2+14&&v>=-b.h-14&&v<=14;
}
function pickFn(el,names){for(var i=0;i<names.length;i++){var fn=el[names[i]];if(typeof fn==='function')return fn;}return null;}
function fullEl(){return document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement;}
function syncFull(){if(!btnFull)return;btnFull.textContent=(fullEl()||document.documentElement.classList.contains('pseudo-fs'))?'退出全屏':'全屏';}
function onFullscreenChange(){ if(window.RRDraw&&window.RRDraw.layout)window.RRDraw.layout(); syncFull(); }
function reqFull(){
  var el=document.documentElement,f=pickFn(el,['requestFullscreen','webkitRequestFullscreen','webkitRequestFullScreen','mozRequestFullScreen','msRequestFullscreen']);
  if(!f){pseudoFs();return;}
  try{var r=f.call(el);if(r&&r.catch)r.catch(function(){pseudoFs();});}catch(err){pseudoFs();return;} // 部分 webview 同步 throw，不兜底按钮就死（蔡总 09:33）
  setTimeout(function(){if(!fullEl()&&!document.documentElement.classList.contains('pseudo-fs')){pseudoFs();}},400);
}
function pseudoFs(){document.documentElement.classList.add('pseudo-fs');syncFull();}
function exitFull(){
  var f=pickFn(document,['exitFullscreen','webkitExitFullscreen','webkitCancelFullScreen','mozCancelFullScreen','msExitFullscreen']);
  if(f)f.call(document);document.documentElement.classList.remove('pseudo-fs');syncFull();
}
if(btnFull){btnFull.addEventListener('click',function(){if(fullEl()||document.documentElement.classList.contains('pseudo-fs'))exitFull();else reqFull();if(window.playClick) playClick();});}
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(e){document.addEventListener(e,syncFull);});

window.addEventListener('DOMContentLoaded',function(){
  var cv=document.getElementById('cv');
  var drag=null,clickSuppress=0;
  if(cv&&window.RRDraw&&window.RRDraw.init)window.RRDraw.init(cv);
  if(cv){
    cv.addEventListener('click',function(e){
      if(clickSuppress>0){clickSuppress=0;return;}
      var hit=window.RRDraw&&window.RRDraw.penHit;
      if(!hit)return;
      var r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
      if(Math.hypot(mx-hit.x,my-hit.y)<=hit.r)toggleLaser();
    });
    cv.addEventListener('mousemove',function(e){
      if(drag)return;
      var hit=window.RRDraw&&window.RRDraw.penHit;
      if(!hit){cv.style.cursor='';return;}
      var r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
      if(Math.hypot(mx-hit.x,my-hit.y)<=hit.r)cv.style.cursor='pointer';
      else cv.style.cursor=penBodyHit(mx,my)?'grab':'';
    });
    cv.addEventListener('pointerdown',function(e){
      var hit=window.RRDraw&&window.RRDraw.penHit;
      if(!hit)return;
      var r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
      if(Math.hypot(mx-hit.x,my-hit.y)<=hit.r+12||penBodyHit(mx,my)){
        drag={sx:mx,sy:my,moved:false};
        cv.setPointerCapture(e.pointerId);
      }
    });
    cv.addEventListener('pointermove',function(e){
      if(!drag)return;
      var r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
      if(Math.hypot(mx-drag.sx,my-drag.sy)>4)drag.moved=true;
      var O=window.RRDraw&&window.RRDraw.O;
      if(!O)return;
      var old=RR.iDeg;
      var i=clamp(Math.round(deg(Math.atan2(O.x-mx,O.y-my))*10)/10,0,80);
      RR.iDeg=i;sliderI.value=String(i);updateReadout();
      if(Math.abs(i-old)>=1&&window.playTick)window.playTick();
      cv.style.cursor='grabbing';
    });
    cv.addEventListener('pointerup',function(e){
      if(!drag)return;
      clickSuppress=1;
      if(!drag.moved){ // 轻点仅红钮开关灯；笔身其他处轻点不触发（蔡总 09:09：拖拽区扩到整笔身后防误触）
        var hit=window.RRDraw&&window.RRDraw.penHit;
        var r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
        if(hit&&Math.hypot(mx-hit.x,my-hit.y)<=hit.r)toggleLaser();
      }
      drag=null;cv.style.cursor='';
    });
  }
  syncControls();
});
window.addEventListener('resize',function(){if(window.RRDraw&&window.RRDraw.layout)window.RRDraw.layout();});
document.addEventListener('fullscreenchange',onFullscreenChange);
document.addEventListener('webkitfullscreenchange',onFullscreenChange);
})();

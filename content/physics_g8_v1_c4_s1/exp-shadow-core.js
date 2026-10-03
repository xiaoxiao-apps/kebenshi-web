(function(){
'use strict';
PROPS.SPRITE_BASE='../_lib/v1/sprites/';
var W=960,H=520,AX=260,CX=480;
var cv=document.getElementById('scene'),cx=cv.getContext('2d');
var source='candle',obj='hole',u=150,v=120,handY=40;
var holes=[-35,25,-18],paused=false,drag=null,alignAnim=null;
var lastTick=0,lastMode='';
var RAYS={candle:'#fbbf24',lamp:'#fde047',laser:'#ff3b30'};
var HINT={
  candle:'拖动蜡烛或屏距，观察小孔成倒像；像高与屏距成正比。',
  lamp:'上下拖动手，屏上影子反向移动；手离灯越近，影子越大。',
  laser:'拖动纸板让三孔对齐，或点「一键对齐」，看激光沿直线穿过三孔。'
};
var SRCMAP={candle:'hole',lamp:'hand',laser:'holes'};
var OBJMAP={hand:'lamp',hole:'candle',holes:'laser'};
function $(id){return document.getElementById(id);}
function clamp(x,a,b){return x<a?a:x>b?b:x;}
function fit(){var r=cv.getBoundingClientRect();if(!r.width)return;var d=window.devicePixelRatio||1;cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);cx.setTransform(cv.width/W,0,0,cv.height/H,0,0);}
window.addEventListener('resize',fit);
function toL(e){var r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
function playClick(){if(window.playClick)window.playClick();}
function playTick(){if(window.playTick)window.playTick();}
function setSource(s){source=s;obj=SRCMAP[s];syncAll();}
function setObject(o){obj=o;source=OBJMAP[o];syncAll();}
function syncAll(){
  $('obj-slider').value=u;$('obj-val').textContent=u;
  $('screen-slider').value=v;$('screen-val').textContent=v;
  document.querySelectorAll('input[name="source"]').forEach(function(r){r.checked=(r.value===source);});
  document.querySelectorAll('input[name="object"]').forEach(function(r){r.checked=(r.value===obj);});
  $('btn-align').disabled=!(source==='laser'&&obj==='holes');
  $('hint').textContent=HINT[source];
}
function onObjInput(e){u=+e.target.value;$('obj-val').textContent=u;if(Date.now()-lastTick>80){lastTick=Date.now();playTick();}}
function onScreenInput(e){v=+e.target.value;$('screen-val').textContent=v;if(Date.now()-lastTick>80){lastTick=Date.now();playTick();}}
function stepObj(d){u=clamp(u+d*5,80,260);$('obj-slider').value=u;$('obj-val').textContent=u;playTick();}
function stepScreen(d){v=clamp(v+d*5,60,220);$('screen-slider').value=v;$('screen-val').textContent=v;playTick();}
function reset(){source='candle';obj='hole';u=150;v=120;handY=40;holes=[-35,25,-18];paused=false;alignAnim=null;syncAll();playClick();}
function togglePause(){paused=!paused;$('btn-pause').textContent=paused?'继续':'暂停';playClick();}
function startAlign(){var from=holes.slice(),t0=Date.now();alignAnim=function(){var p=(Date.now()-t0)/500;p=p>=1?1:p;var e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;holes=from.map(function(h){return Math.round(h*(1-e));});if(p>=1){alignAnim=null;playClick();}};playTick();}
function fullscreen(){var el=document.documentElement;if(el.requestFullscreen)el.requestFullscreen();else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();}
document.querySelectorAll('input[name="source"]').forEach(function(r){r.addEventListener('change',function(){if(r.checked)setSource(r.value);});});
document.querySelectorAll('input[name="object"]').forEach(function(r){r.addEventListener('change',function(){if(r.checked)setObject(r.value);});});
$('obj-slider').addEventListener('input',onObjInput);
$('screen-slider').addEventListener('input',onScreenInput);
$('obj-minus').addEventListener('click',function(){stepObj(-1);});
$('obj-plus').addEventListener('click',function(){stepObj(1);});
$('screen-minus').addEventListener('click',function(){stepScreen(-1);});
$('screen-plus').addEventListener('click',function(){stepScreen(1);});
$('btn-pause').addEventListener('click',togglePause);
$('btn-reset').addEventListener('click',reset);
$('btn-align').addEventListener('click',startAlign);
$('btn-full').addEventListener('click',fullscreen);
cv.addEventListener('pointerdown',function(e){var p=toL(e);drag=null;
  if(source==='lamp'){if(Math.abs(p.x-(CX-u))<40&&Math.abs(p.y-(AX+handY))<60)drag='hand';}
  else if(source==='candle'){if(Math.abs(p.x-(CX-u))<35&&Math.abs(p.y-AX)<80)drag='obj';else if(Math.abs(p.x-(CX+v))<40&&Math.abs(p.y-AX)<90)drag='screen';}
  else{for(var i=0;i<3;i++){var bx=340+i*200;if(Math.abs(p.x-bx)<35&&Math.abs(p.y-(AX+holes[i]))<70){drag='h'+i;break;}}}
  if(drag)cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove',function(e){if(!drag)return;var p=toL(e);
  if(drag==='hand'){handY=clamp(Math.round(p.y-AX),-80,120);}
  else if(drag==='obj'){u=clamp(Math.round(CX-p.x),80,260);$('obj-slider').value=u;$('obj-val').textContent=u;}
  else if(drag==='screen'){v=clamp(Math.round(p.x-CX),60,220);$('screen-slider').value=v;$('screen-val').textContent=v;}
  else if(drag[0]==='h'){var i=+drag[1];holes[i]=clamp(Math.round(p.y-AX),-90,90);}
  if(Date.now()-lastTick>80){lastTick=Date.now();playTick();}
});
cv.addEventListener('pointerup',function(){drag=null;});
function stage(){cx.save();cx.fillStyle='#1f2937';cx.beginPath();roundRect(70,60,820,400,16);cx.fill();cx.restore();}
function roundRect(x,y,w,h,r){var rr=Math.min(r,w/2,h/2);cx.moveTo(x+rr,y);cx.arcTo(x+w,y,x+w,y+h,rr);cx.arcTo(x+w,y+h,x,y+h,rr);cx.arcTo(x,y+h,x,y,rr);cx.arcTo(x,y,x+w,y,rr);cx.closePath();}
function drawRays(pts,col){cx.save();cx.strokeStyle=col;cx.lineWidth=1.5;cx.globalAlpha=0.6;for(var i=0;i<pts.length;i+=2){cx.beginPath();cx.moveTo(pts[i][0],pts[i][1]);cx.lineTo(pts[i+1][0],pts[i+1][1]);cx.stroke();}cx.restore();}
function handShadowShape(x,y,sc){cx.save();cx.translate(x,y);cx.scale(sc,sc);cx.fillStyle='rgba(10,12,18,.92)';cx.beginPath();cx.ellipse(0,0,14,30,0,0,Math.PI*2);cx.fill();for(var i=0;i<3;i++){cx.beginPath();cx.ellipse(-8+i*8,-28,3.5,14,0,0,Math.PI*2);cx.fill();}cx.restore();}
function flameShape(x,y,h,flip){cx.save();cx.translate(x,y);cx.scale(flip?-1:1,flip?-1:1);var g=cx.createLinearGradient(0,-h,0,h);g.addColorStop(0,'#fff7d6');g.addColorStop(.5,'#ffb703');g.addColorStop(1,'#ff7b00');cx.fillStyle=g;cx.beginPath();cx.moveTo(0,-h);cx.bezierCurveTo(h*.35,-h*.35,h*.35,h*.5,0,h);cx.bezierCurveTo(-h*.35,h*.5,-h*.35,-h*.35,0,-h);cx.fill();cx.restore();}
function drawHand(){
  var lx=160,hx=CX-u,sx=CX+v,sc=(sx-lx)/(hx-lx),sy=AX+(handY)*sc;
  PROPS.desk_lamp(cx,lx,AX,{h:140,glow:true});
  PROPS.hand_shadow(cx,hx,AX+handY,{h:90,skin:true});
  PROPS.screen(cx,sx,AX,{h:160});
  cx.save();cx.beginPath();cx.rect(sx-18,AX-130,36,260);cx.clip();handShadowShape(sx,sy,sc*0.9);cx.restore();
  drawRays([[lx,AX],[hx,AX+handY-35],[hx,AX+handY-35],[sx,sy-35*sc],[lx,AX],[hx,AX+handY+25],[hx,AX+handY+25],[sx,sy+25*sc]],RAYS.lamp);
}
function drawPin(){
  var ox=CX-u,sx=CX+v,m=v/u,hi=48*m,blur=Math.abs(v-u)/80;
  PROPS.candle(cx,ox,AX,{h:100,lit:true});
  PROPS.board_with_hole(cx,CX,AX,{h:130,holeR:28});
  PROPS.screen(cx,sx,AX,{h:160});
  cx.save();cx.beginPath();cx.rect(sx-16,AX-120,32,240);cx.clip();
  var n=Math.min(7,2+Math.floor(blur*3)),a=0.55/n;
  for(var i=-n;i<=n;i++){cx.globalAlpha=a;flameShape(sx,AX+hi/2+i*blur*6,hi,true);}
  cx.restore();
  drawRays([[ox,AX-45],[CX,AX],[CX,AX],[sx,AX+hi],[ox,AX+25],[CX,AX],[CX,AX],[sx,AX-hi*.45]],RAYS.candle);
}
function drawLaser(){
  PROPS.laser_pen(cx,140,AX,{h:80,angle:0,dir:'right',beam:false});
  var xs=[340,540,740],sx=860,i,blocked=-1;
  for(i=0;i<3;i++){PROPS.board_with_hole(cx,xs[i],AX+holes[i],{h:110,holeR:26});if(blocked<0&&Math.abs(holes[i])>20)blocked=i;}
  PROPS.screen(cx,sx,AX,{h:150});
  var ex=blocked>=0?xs[blocked]-22:sx,ey=blocked>=0?AX+holes[blocked]:AX;
  cx.save();cx.strokeStyle='#ff3b30';cx.lineWidth=3;cx.lineCap='round';cx.globalAlpha=0.75;cx.beginPath();cx.moveTo(170,AX);cx.lineTo(ex,ey);cx.stroke();cx.restore();
  var g=cx.createRadialGradient(ex,ey,0,ex,ey,24);g.addColorStop(0,'rgba(255,59,48,'+(blocked>=0?0.7:0.55)+')');g.addColorStop(1,'rgba(255,59,48,0)');cx.fillStyle=g;cx.beginPath();cx.arc(ex,ey,24,0,Math.PI*2);cx.fill();
}
function draw(){cx.clearRect(0,0,W,H);stage();
  if(source==='lamp')drawHand();else if(source==='candle')drawPin();else drawLaser();
  cx.save();cx.strokeStyle='rgba(148,163,184,0.18)';cx.lineWidth=1;cx.setLineDash([6,6]);cx.beginPath();cx.moveTo(0,AX);cx.lineTo(W,AX);cx.stroke();cx.setLineDash([]);cx.restore();
}
function loop(){requestAnimationFrame(loop);if(paused)return;if(alignAnim)alignAnim();draw();}
fit();syncAll();loop();
})();
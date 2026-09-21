/* exp-room.js — 隔音房间模型 3D 互动实验（three.js r128 UMD） */
/* r9-lid-db-fix */
/* r10-lid-gain-fix */
(function(){
'use strict';
var cv=document.getElementById('room3d'), wrap=document.getElementById('roomWrap');
var bellState=document.getElementById('bellState'), dbVal=document.getElementById('dbVal'), diffVal=document.getElementById('diffVal');
var bellBtn=document.getElementById('bellBtn'), measureBtn=document.getElementById('measureBtn'), lidBtn=document.getElementById('lidBtn'), resetBtn=document.getElementById('resetBtn'), matGrid=document.getElementById('matGrid');

var scene=new THREE.Scene(); scene.background=new THREE.Color(0xf2efe8);
var camera=new THREE.PerspectiveCamera(45, wrap.clientWidth/wrap.clientHeight, 0.1, 100);
camera.position.set(5,4,6); camera.lookAt(0,0,0);
var renderer=new THREE.WebGLRenderer({canvas:cv, antialias:true}); renderer.setSize(wrap.clientWidth, wrap.clientHeight);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;

var ambient=new THREE.AmbientLight(0xffffff,0.65); scene.add(ambient);
var dir=new THREE.DirectionalLight(0xffffff,0.9); dir.position.set(4,6,3); dir.castShadow=true; dir.shadow.mapSize.set(1024,1024); scene.add(dir);
var fill=new THREE.DirectionalLight(0xffeedd,0.35); fill.position.set(-3,2,-2); scene.add(fill);

function createWoodTexture(){
  var c=document.createElement('canvas'); c.width=512; c.height=512; var ctx=c.getContext('2d');
  ctx.fillStyle='#d2b48c'; ctx.fillRect(0,0,512,512);
  for(var i=0;i<60;i++){ctx.strokeStyle='rgba(120,80,40,'+(0.1+Math.random()*0.15)+')'; ctx.lineWidth=1+Math.random()*3; ctx.beginPath(); ctx.moveTo(Math.random()*512,0); ctx.bezierCurveTo(Math.random()*512,150,Math.random()*512,350,Math.random()*512,512); ctx.stroke();}
  for(var i=0;i<800;i++){ctx.fillStyle='rgba(80,50,20,'+(0.05+Math.random()*0.1)+')'; ctx.fillRect(Math.random()*512,Math.random()*512,2+Math.random()*30,1);}
  ctx.strokeStyle='rgba(60,40,20,0.45)'; ctx.lineWidth=8; ctx.strokeRect(4,4,504,504); ctx.lineWidth=3; ctx.strokeRect(12,12,488,488);
  return new THREE.CanvasTexture(c);
}
var woodTex=createWoodTexture();

var room=new THREE.Group(); scene.add(room);
var walls=[];
function wall(s,p,r){var m=new THREE.Mesh(new THREE.PlaneGeometry(s[0],s[1]),new THREE.MeshStandardMaterial({color:0xe8e2d6,side:THREE.DoubleSide,roughness:0.9}));m.position.set(p[0],p[1],p[2]);m.rotation.set(r[0],r[1],r[2]);room.add(m);walls.push(m);}
wall([2,1.6],[0,0,0],[-Math.PI/2,0,0]); wall([2,1.2],[0,0.6,0.8],[0,0,0]);
wall([2,1.2],[0,0.6,-0.8],[0,Math.PI,0]); wall([1.6,1.2],[1,0.6,0],[0,Math.PI/2,0]); wall([1.6,1.2],[-1,0.6,0],[0,-Math.PI/2,0]);
/* 外壳重建：底面+四个侧面木纹板，顶部敞开，侧壁顶到 y=1.2 与内壁齐平；顶盖由 lidM 唯一承担 */
var shellMat=function(){return new THREE.MeshStandardMaterial({map:woodTex,roughness:0.8});};
var shellBottom=new THREE.Mesh(new THREE.BoxGeometry(2.12,0.06,1.72),shellMat()); shellBottom.position.set(0,-0.04,0); room.add(shellBottom);
var shellXp=new THREE.Mesh(new THREE.BoxGeometry(0.04,1.2,1.64),shellMat()); shellXp.position.set(1.04,0.6,0); room.add(shellXp);
var shellXn=new THREE.Mesh(new THREE.BoxGeometry(0.04,1.2,1.64),shellMat()); shellXn.position.set(-1.04,0.6,0); room.add(shellXn);
var shellZp=new THREE.Mesh(new THREE.BoxGeometry(2.12,1.2,0.04),shellMat()); shellZp.position.set(0,0.6,0.84); room.add(shellZp);
var shellZn=new THREE.Mesh(new THREE.BoxGeometry(2.12,1.2,0.04),shellMat()); shellZn.position.set(0,0.6,-0.84); room.add(shellZn);
for(var wdx=0;wdx<walls.length;wdx++){walls[wdx].position.z+=0.001*(wdx+1);}

var lidP=new THREE.Group(); lidP.position.set(0,1.2,-0.82); room.add(lidP);
var lidM=new THREE.Mesh(new THREE.BoxGeometry(2.04,0.06,1.64),new THREE.MeshStandardMaterial({map:woodTex,roughness:0.8}));
lidM.position.set(0,0.03,0.82); lidP.add(lidM);

function createClockFaceTexture(){
  var c=document.createElement('canvas'); c.width=256; c.height=256; var ctx=c.getContext('2d');
  ctx.fillStyle='#f8f8f8'; ctx.fillRect(0,0,256,256);
  ctx.beginPath(); ctx.arc(128,128,120,0,Math.PI*2); ctx.strokeStyle='#333'; ctx.lineWidth=3; ctx.stroke();
  ctx.fillStyle='#333'; for(var i=0;i<12;i++){var a=i*Math.PI/6; ctx.beginPath(); var s=i%3===0?1.2:0.8; ctx.moveTo(128+Math.cos(a)*110*s,128+Math.sin(a)*110*s); ctx.lineTo(128+Math.cos(a)*120,128+Math.sin(a)*120); ctx.stroke();}
  ctx.strokeStyle='#e74c3c'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(128,128); ctx.lineTo(128,55); ctx.stroke();
  ctx.strokeStyle='#2c3e50'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(128,128); ctx.lineTo(155,128); ctx.stroke();
  ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(128,128,5,0,Math.PI*2); ctx.fill();
  return new THREE.CanvasTexture(c);
}
var clockFaceTex=createClockFaceTexture();

var clock=new THREE.Group(); clock.position.set(0,0.55,0); room.add(clock);
var bodyMat=new THREE.MeshStandardMaterial({color:0xd63031,metalness:0.25,roughness:0.35});
var body=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.32,0.22,32),bodyMat); body.rotation.x=Math.PI/2; clock.add(body);
var rim=new THREE.Mesh(new THREE.TorusGeometry(0.3,0.03,16,32),new THREE.MeshStandardMaterial({color:0xb0a08a,metalness:0.6,roughness:0.3})); clock.add(rim);
var face=new THREE.Mesh(new THREE.CircleGeometry(0.25,32),new THREE.MeshBasicMaterial({map:clockFaceTex})); face.position.z=0.12; clock.add(face);
var bellMat=new THREE.MeshStandardMaterial({color:0xc0c0c0,metalness:0.7,roughness:0.25});
var bellL=new THREE.Mesh(new THREE.SphereGeometry(0.12,16,8,0,Math.PI*2,0,Math.PI/2),bellMat); bellL.position.set(-0.18,0.3,0); bellL.rotation.z=-0.35; clock.add(bellL);
var bellR=bellL.clone(); bellR.position.set(0.18,0.3,0); bellR.rotation.z=0.35; clock.add(bellR);
var hammer=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.16,12),new THREE.MeshStandardMaterial({color:0x8b4513,metalness:0.4,roughness:0.5})); hammer.position.set(0,0.32,0); hammer.rotation.z=Math.PI/2; clock.add(hammer);
var hammerHead=new THREE.Mesh(new THREE.SphereGeometry(0.045,12,12),new THREE.MeshStandardMaterial({color:0x4a4a4a,metalness:0.5,roughness:0.4})); hammerHead.position.set(0.08,0,0); hammer.add(hammerHead);
var legMat=new THREE.MeshStandardMaterial({color:0x555,metalness:0.5,roughness:0.4});
function leg(x,z){var l=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.015,0.25,8),legMat); l.position.set(x,-0.2,z); l.rotation.z=x>0?0.35:-0.35; clock.add(l);}
leg(-0.16,-0.08); leg(0.16,-0.08); leg(-0.16,0.08); leg(0.16,0.08);

var probeCanvas=document.createElement('canvas'); probeCanvas.width=256; probeCanvas.height=128; var probeCtx=probeCanvas.getContext('2d');
var probeTex=new THREE.CanvasTexture(probeCanvas);
function drawProbeScreen(db){
  probeCtx.fillStyle='#0b3d06'; probeCtx.fillRect(0,0,256,128);
  probeCtx.fillStyle='#9eff9e'; probeCtx.font='bold 48px monospace'; probeCtx.textAlign='center'; probeCtx.textBaseline='middle';
  probeCtx.fillText((db==null?'--':db.toFixed(1)),128,50);
  probeCtx.font='20px monospace'; probeCtx.fillText('dB',128,90);
  probeCtx.strokeStyle='#9eff9e'; probeCtx.lineWidth=2; probeCtx.strokeRect(4,4,248,120);
  probeTex.needsUpdate=true;
}
drawProbeScreen(null);

var probe=new THREE.Group(); probe.position.set(1.35,0.45,0); scene.add(probe);
var probeBody=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.55,0.18),new THREE.MeshStandardMaterial({color:0xf4c542,metalness:0.15,roughness:0.4})); probeBody.position.y=0.275; probe.add(probeBody);
var micStem=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.3,12),new THREE.MeshStandardMaterial({color:0x333,metalness:0.4,roughness:0.5})); micStem.position.y=0.6; probe.add(micStem);
var micHead=new THREE.Mesh(new THREE.SphereGeometry(0.045,16,16),new THREE.MeshStandardMaterial({color:0x222,metalness:0.3,roughness:0.6})); micHead.position.y=0.75; probe.add(micHead);
var probeScreen=new THREE.Mesh(new THREE.PlaneGeometry(0.24,0.12),new THREE.MeshBasicMaterial({map:probeTex})); probeScreen.position.set(0,0.32,0.092); probe.add(probeScreen);
for(var bi=0;bi<3;bi++){var bb=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.04,8),new THREE.MeshStandardMaterial({color:0x333})); bb.position.set(-0.08+bi*0.08,0.1,0.1); bb.rotation.x=Math.PI/2; probe.add(bb);}

var mats={none:{c:0xe8e2d6,a:0,g:1.0},sponge:{c:0xd980a0,a:15,g:0.25},foam:{c:0x80c5d9,a:9,g:0.3},towel:{c:0xd9c580,a:12,g:0.35},cardboard:{c:0xbfa887,a:4,g:0.7}};
var curMat='none', baseDb=null;
function applyMat(name){curMat=name;walls.forEach(w=>w.material.color.setHex(mats[name].c));document.querySelectorAll('.mat-btn').forEach(b=>b.classList.toggle('active',b.dataset.mat===name)); if(ringing&&masterGain){ updateMatGain(); } if(baseDb!==null){refreshDb();}}
applyMat('none');

var wave=new THREE.Mesh(new THREE.SphereGeometry(1,32,32),new THREE.MeshBasicMaterial({color:0x3498db,transparent:true,opacity:0.25}));
wave.position.copy(clock.position); room.add(wave);
var leak=new THREE.Mesh(new THREE.SphereGeometry(1,32,32),new THREE.MeshBasicMaterial({color:0xe74c3c,transparent:true,opacity:0.12}));
leak.position.copy(clock.position); scene.add(leak);

var audioCtx=null, gainNode=null, masterGain=null, ringing=false, ringTimer=null, nextNoteTime=0, hammerSwing=0;
var alarmBuffer=null, alarmSrc=null, alarmLoading=null, hammerTimer=null, srcPlaying=false;
function ensureAudio(){if(audioCtx)return audioCtx; audioCtx=new(window.AudioContext||window.webkitAudioContext)(); masterGain=audioCtx.createGain(); masterGain.connect(audioCtx.destination); updateMatGain(); return audioCtx;}
function updateMatGain(){if(!masterGain)return; var g=lidOpen?1.0:0.55*mats[curMat].g; try{masterGain.gain.setTargetAtTime(g,audioCtx.currentTime,0.02);}catch(e){}}
/* —— 真闹钟录音通路：audio/alarm.m4a（机械闹钟实录），经 masterGain 输出，切材料音量联动仍生效 —— */
function loadAlarm(){
  if(alarmBuffer)return Promise.resolve(alarmBuffer);
  if(alarmLoading)return alarmLoading;
  alarmLoading=fetch('audio/alarm.m4a').then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer();})
    .then(function(buf){return new Promise(function(res,rej){ensureAudio().decodeAudioData(buf,res,rej);});})
    .then(function(decoded){alarmBuffer=decoded;return decoded;})
    .catch(function(e){alarmLoading=null;throw e;});
  return alarmLoading;
}
function startAlarmSrc(){
  if(!ringing||!alarmBuffer||!audioCtx)return;
  stopAlarmSrc();
  alarmSrc=audioCtx.createBufferSource(); alarmSrc.buffer=alarmBuffer; alarmSrc.loop=true;
  alarmSrc.connect(masterGain); alarmSrc.start(); srcPlaying=true;
}
function stopAlarmSrc(){
  if(alarmSrc){try{alarmSrc.stop();}catch(e){} try{alarmSrc.disconnect();}catch(e){} alarmSrc=null;}
  srcPlaying=false;
}
/* —— fallback：decode/fetch 失败时用 oscillator 合成铃声 —— */
function beep(time,freq,panVal){
  var o1=audioCtx.createOscillator(); var o2=audioCtx.createOscillator(); var g=audioCtx.createGain(); var p=audioCtx.createStereoPanner?audioCtx.createStereoPanner():null;
  o1.type='triangle'; o2.type='sine'; o1.frequency.value=freq; o2.frequency.value=freq*1.02+Math.random()*4;
  o1.connect(g); o2.connect(g); if(p){p.pan.value=panVal; g.connect(p); p.connect(masterGain);}else{g.connect(masterGain);}
  var t=time; g.gain.setValueAtTime(0,t); g.gain.exponentialRampToValueAtTime(0.4,t+0.01); g.gain.exponentialRampToValueAtTime(0.001,t+0.08);
  o1.start(t); o2.start(t); o1.stop(t+0.09); o2.stop(t+0.09);
}
var pattern=[{f:2100,p:-0.5},{f:2600,p:0.5},{f:2100,p:-0.5},{f:2600,p:0.5}];
var patIdx=0;
function scheduleRing(){
  if(!ringing||!audioCtx)return;
  var ahead=0.1; var now=audioCtx.currentTime;
  while(nextNoteTime<now+ahead){
    var step=pattern[patIdx%pattern.length]; beep(nextNoteTime,step.f,step.p); patIdx++;
    nextNoteTime+=0.11;
  }
  ringTimer=setTimeout(scheduleRing,50);
}
function startFallbackRing(){nextNoteTime=audioCtx.currentTime; scheduleRing();}
var dbTimer=null;
function refreshDb(){
  if(!ringing){
    /* 未响铃守卫：只测到 0.0~2.0 环境底噪，无衰减差值 */
    var n=Math.random()*2;
    dbVal.textContent=n.toFixed(1); diffVal.textContent='--'; drawProbeScreen(n);
    return;
  }
  var b=70+Math.random()*10; if(curMat==='none')baseDb=b; var ref=baseDb||b; var att=lidOpen?0:(6+mats[curMat].a); var d=Math.max(35,ref-att+(Math.random()*2-1));
  dbVal.textContent=d.toFixed(1); diffVal.textContent=(ref-d).toFixed(1); drawProbeScreen(d);
}
function startRing(){
  ensureAudio(); ringing=true; bellBtn.textContent='停止响铃'; bellState.textContent='响铃中';
  if(audioCtx.state==='suspended')audioCtx.resume();
  updateMatGain();
  if(alarmBuffer){ startAlarmSrc(); }
  else{ loadAlarm().then(function(){if(ringing)startAlarmSrc();}).catch(function(){if(ringing)startFallbackRing();}); }
  hammerSwing=0;
  if(hammerTimer)clearInterval(hammerTimer);
  hammerTimer=setInterval(function(){hammerSwing=hammerSwing?0:1;},500);
  dbTimer=setInterval(refreshDb,2000);
}
function stopRing(){
  ringing=false; stopAlarmSrc();
  if(hammerTimer){clearInterval(hammerTimer);hammerTimer=null;}
  if(ringTimer){clearTimeout(ringTimer);ringTimer=null;}
  if(dbTimer){clearInterval(dbTimer);dbTimer=null;}
  if(audioCtx&&audioCtx.state!=='closed'&&audioCtx.state!=='suspended'){try{audioCtx.suspend();}catch(e){}}
  bellBtn.textContent='开始响铃'; bellState.textContent='已停止';
}

var drag=false, lx, ly, cr=Math.atan2(camera.position.z,camera.position.x), ch=Math.atan2(camera.position.y,Math.hypot(camera.position.x,camera.position.y,camera.position.z)), cd=Math.hypot(camera.position.x,camera.position.y,camera.position.z);
function setCam(){camera.position.set(cd*Math.cos(ch)*Math.cos(cr),cd*Math.sin(ch),cd*Math.cos(ch)*Math.sin(cr));camera.lookAt(0,0,0);}
wrap.addEventListener('mousedown',e=>{drag=true;lx=e.clientX;ly=e.clientY;});
window.addEventListener('mousemove',e=>{if(!drag)return;cr-=(e.clientX-lx)*0.005;ch+=(e.clientY-ly)*0.005;ch=Math.max(-1.3,Math.min(1.3,ch));lx=e.clientX;ly=e.clientY;setCam();});
window.addEventListener('mouseup',()=>drag=false);
wrap.addEventListener('wheel',e=>{e.preventDefault();cd*=e.deltaY>0?1.08:0.92;cd=Math.max(3,Math.min(12,cd));setCam();},{passive:false});

var lidOpen=false, lidT=0;
bellBtn.addEventListener('click',()=>{if(ringing){stopRing();}else{startRing();}});
measureBtn.addEventListener('click',refreshDb);
lidBtn.addEventListener('click',()=>{lidOpen=!lidOpen;lidBtn.textContent=lidOpen?'关闭盒盖':'打开盒盖';updateMatGain();});
resetBtn.addEventListener('click',()=>{applyMat('none');dbVal.textContent='--';diffVal.textContent='--';baseDb=null;drawProbeScreen(null);lidOpen=false;lidBtn.textContent='打开盒盖'; if(dbTimer){clearInterval(dbTimer);dbTimer=null;}});
matGrid.addEventListener('click',e=>{var b=e.target.closest('.mat-btn');if(b)applyMat(b.dataset.mat);});

function resize(){var w=wrap.clientWidth,h=wrap.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);

function animate(){
requestAnimationFrame(animate);
var t=performance.now()*0.001;
if(ringing){
  hammer.rotation.z=hammerSwing?0.45:-0.45; hammerHead.position.x=0.08+(hammerSwing?0.006:-0.006);
  bellL.position.y=0.3+Math.sin(t*40)*0.005; bellR.position.y=0.3+Math.cos(t*40)*0.005;
  var s=(t*3)%2.2+0.2; wave.scale.set(s,s,s); wave.material.opacity=0.25*(1-s/2.4); var ls=(t*3)%2.6+0.3; leak.scale.set(ls,ls,ls); var leakF=lidOpen?1:(1-mats[curMat].a/20); leak.material.opacity=0.12*leakF*(1-ls/2.9);
}else{
  hammer.rotation.z=0; hammerHead.position.x=0.08; bellL.position.y=0.3; bellR.position.y=0.3;
  wave.scale.set(0.2,0.2,0.2);leak.scale.set(0.2,0.2,0.2);
}
lidT+=((lidOpen?1:0)-lidT)*0.1; lidP.rotation.x=-lidT*Math.PI*0.55;
renderer.render(scene,camera);
}
animate();
window.__roomDebug={get gain(){return masterGain?masterGain.gain.value:null;},get ringing(){return ringing;},get alarmLoaded(){return !!alarmBuffer;},get srcPlaying(){return srcPlaying;}};
})();

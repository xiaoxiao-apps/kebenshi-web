'use strict';
/* c4s3 平面镜成像 · WebAudio 合成音效（零外部音频） */
(function(){
var ctx=null,soundOn=true;
function ensure(){
  if(!ctx){
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    ctx=new AC();
  }
  if(ctx.state==='suspended')ctx.resume();
  return ctx;
}
document.addEventListener('pointerdown',function(){ensure();},{once:true});
function tone(freq,type,dur,vol,delay){
  if(!soundOn)return;
  var c=ensure();if(!c)return;
  var t0=c.currentTime+(delay||0);
  var o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.value=freq;
  g.gain.setValueAtTime(vol,t0);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g);g.connect(c.destination);
  o.start(t0);o.stop(t0+dur+0.02);
}
window.playClick=function(){tone(800,'square',0.05,0.15);};
window.playTick=function(){tone(1200,'square',0.02,0.08);};
/* 点燃：火苗窜起=低频到高频扫过 */
window.playLight=function(){tone(220,'sawtooth',0.18,0.12);tone(660,'triangle',0.22,0.10,0.08);};
/* 熄灭：气流吹灭=下行 */
window.playSnuff=function(){tone(520,'sine',0.12,0.10);tone(180,'sine',0.16,0.08,0.06);};
/* 拾放（拖起/放下器材） */
window.playPick=function(){tone(440,'triangle',0.06,0.10);};
window.playDrop=function(){tone(330,'triangle',0.08,0.10);};
/* 重合判定成功：三音上行和弦 */
window.playMatch=function(){tone(523,'triangle',0.12,0.14);tone(659,'triangle',0.12,0.14,0.10);tone(784,'triangle',0.25,0.14,0.20);};
var btn=document.getElementById('btn-mute');
if(btn){
  btn.addEventListener('click',function(){
    soundOn=!soundOn;
    this.textContent=soundOn?'🔊':'🔇';
    if(soundOn)window.playClick();
  });
}
})();

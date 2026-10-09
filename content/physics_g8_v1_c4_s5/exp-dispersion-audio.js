'use strict';
/* c4s5 光的色散 · WebAudio 合成音效 */
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
function beep(freq,type,dur,vol){
  if(!soundOn)return;
  var c=ensure();if(!c)return;
  var o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.value=freq;
  g.gain.setValueAtTime(vol,c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+dur);
  o.connect(g);g.connect(c.destination);
  o.start();o.stop(c.currentTime+dur+0.02);
}
window.playClick=function(){beep(800,'square',0.05,0.15);};
window.playTick=function(){beep(1200,'square',0.02,0.08);};
var btn=document.getElementById('btn-mute');
if(btn){
  btn.addEventListener('click',function(){
    soundOn=!soundOn;
    this.textContent=soundOn?'🔊':'🔇';
    if(soundOn)window.playClick();
  });
}
})();
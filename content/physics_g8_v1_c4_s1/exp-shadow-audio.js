(function(){
var soundOn=true,audioCtx=null;
function ensureCtx(){
  if(!audioCtx){
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    audioCtx=new AC();
  }
  return audioCtx;
}
window.addEventListener('pointerdown',function resume(){
  var ctx=ensureCtx();
  if(ctx&&ctx.state==='suspended')ctx.resume();
},{once:true});
function tone(freq,dur,type){
  if(!soundOn)return;
  var ctx=ensureCtx();
  if(!ctx)return;
  if(ctx.state==='suspended')ctx.resume();
  var osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=type;osc.frequency.value=freq;
  var t0=ctx.currentTime;
  gain.gain.setValueAtTime(0.15,t0);
  gain.gain.linearRampToValueAtTime(0,t0+dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);osc.stop(t0+dur+0.02);
}
window.playClick=function(){tone(800,0.05,'square');};
window.playTick=function(){tone(1200,0.02,'square');};
var btn=document.getElementById('btn-mute');
if(btn){
  btn.addEventListener('click',function(){
    soundOn=!soundOn;
    btn.textContent=soundOn?'🔊':'🔇';
  });
}
})();
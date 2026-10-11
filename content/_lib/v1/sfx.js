'use strict';
/* 器材标准件库 v1 · 标准音效模块（蔡总 2026-10-11 R30 定：点燃/熄灭/移动蜡烛等操作音效入库，以后全项目相同操作用同一音效）
   标准操作音效挂 window（与历史调用名兼容）：playClick 点击 / playTick 移动棘轮 / playLight 点燃 / playSnuff 熄灭 / playPick 拖起 / playDrop 放下 / playMatch 判定成功
   页面专属音效用 SFX.tone(freq,type,dur,vol,delay) 合成，不再各自复制引擎
   静音按钮统一绑定 id=btn-mute（全项目同 id） */
(function(){
  if(window.SFX)return;
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
  window.SFX={tone:tone,isOn:function(){return soundOn;}};
  /* === 标准操作音效（全项目统一，改音色只改这里） === */
  window.playClick=function(){tone(800,'square',0.05,0.15);};
  /* 移动：拖拽棘轮短促滴答 */
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
  /* 静音按钮统一绑定 */
  var btn=document.getElementById('btn-mute');
  if(btn){
    btn.addEventListener('click',function(){
      soundOn=!soundOn;
      this.textContent=soundOn?'🔊':'🔇';
      if(soundOn)window.playClick();
    });
  }
})();

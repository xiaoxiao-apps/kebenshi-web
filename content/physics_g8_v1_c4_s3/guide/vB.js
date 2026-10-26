'use strict';
/* c4s3 变体 B · 语音版 = D 版字幕条 UI + 每条触发播放对应 audio/c4s3-{id}.mp3
   首次交互前浏览器可能拦截 autoplay：字幕照常出，play().catch 静默失败即可。
   右上角 🔊/🔇 切换钮 id=guide-mute（独立于 core 的 btn-mute，互不影响）。 */
(function(){
function start(){
  if(!window.GuideEngine||!window.C4S3_SCRIPT)return;
  var LAYER=document.getElementById('guide-layer')||document.body;
  var AUDIOS=window.C4S3_SCRIPT.audios||{};
  var badge=document.createElement('span');
  badge.className='guide-badge';
  badge.textContent='B · 语音版';
  LAYER.appendChild(badge);

  /* 独立静音钮（guide-mute），只控制讲解配音，不动 core 音效 */
  var muted=false;
  var muteBtn=document.createElement('button');
  muteBtn.id='guide-mute';
  muteBtn.className='guide-mute-btn';
  muteBtn.textContent='🔊';
  muteBtn.title='讲解配音开关';
  LAYER.appendChild(muteBtn);

  var curAudio=null;
  function playClip(id){
    if(curAudio){try{curAudio.pause();}catch(e){}curAudio=null;}
    if(muted||!id)return;
    var src=AUDIOS[id];
    if(!src)return;
    var a=new Audio(src);
    curAudio=a;
    var p=a.play();
    if(p&&p.catch)p.catch(function(){/* autoplay 被拦截：静默失败，字幕照常 */});
  }
  muteBtn.addEventListener('click',function(){
    muted=!muted;
    muteBtn.textContent=muted?'🔇':'🔊';
    if(muted&&curAudio){try{curAudio.pause();}catch(e){}curAudio=null;}
  });

  var cap=new GuideEngine.Caption();
  function say(text,kind,audioId){
    cap.show(text,kind,audioId);
    playClip(audioId);
  }

  GuideEngine.init({
    onIntro:function(mode,intro){
      if(intro&&intro.text)say(intro.text,'intro',intro.audio);
    },
    onStep:function(step){
      say(step.say,'step',step.audio);
    },
    onError:function(err){
      say(err.fix,'error',err.audio);
    },
    onFree:function(free){
      say(free.note,'free',null);
    }
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})();

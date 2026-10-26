'use strict';
/* c4s3 变体 D · 字幕解说版（蔡总方案，重点打磨）
   底部「歌词式」字幕条：intro/steps/errors/free 全走字幕条；无触发时隐藏不占位。
   纠错态整条橙色底 + 抖动一次。只读 R/DOM，皮肤层自建 DOM。 */
(function(){
function start(){
  if(!window.GuideEngine||!window.C4S3_SCRIPT)return;
  var LAYER=document.getElementById('guide-layer')||document.body;
  /* 顶部变体小标签 */
  var badge=document.createElement('span');
  badge.className='guide-badge';
  badge.textContent='D · 字幕解说';
  LAYER.appendChild(badge);

  var cap=new GuideEngine.Caption();

  GuideEngine.init({
    onIntro:function(mode,intro){
      if(intro&&intro.text)cap.show(intro.text,'intro',intro.audio);
    },
    onStep:function(step){
      cap.show(step.say,'step',step.audio);
    },
    onError:function(err){
      cap.show(err.fix,'error',err.audio);
    },
    onFree:function(free){
      cap.show(free.note,'free',null);
    }
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})();

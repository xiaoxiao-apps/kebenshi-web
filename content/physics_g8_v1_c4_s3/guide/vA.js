'use strict';
/* c4s3 变体 A · 任务链版（POE：预测→操作→验证，设计书 §3）
   右下卡通老师卡（纯 CSS，无图片资源）：predict 出题+竖排选项；对=绿气泡 praise 自动进下一任务，
   错=橙气泡 retry 可再选（选过的错误项置灰划线）；act/verify=气泡指令，engine 轮询 done。
   切模式重置任务进度（engine 内部）；全通关出庆祝条；点头像可折叠，收起时不打扰自由操作。 */
(function(){
function start(){
  if(!window.GuideEngine||!window.C4S3_SCRIPT)return;
  var DATA=window.C4S3_SCRIPT;
  var LAYER=document.getElementById('guide-layer')||document.body;

  var badge=document.createElement('span');
  badge.className='guide-badge';
  badge.textContent='A · 任务链';
  LAYER.appendChild(badge);

  var card=document.createElement('div');
  card.className='guide-card';
  card.innerHTML='<div class="guide-card-avatar" title="点击收起/展开">🧑‍🏫</div>'+
    '<div class="guide-card-main">'+
      '<div class="guide-bubble"><div class="guide-bubble-progress"></div><div class="guide-bubble-text"></div></div>'+
      '<div class="guide-options"></div>'+
    '</div>';
  LAYER.appendChild(card);
  var av=card.querySelector('.guide-card-avatar');
  var main=card.querySelector('.guide-card-main');
  var bubble=card.querySelector('.guide-bubble');
  var bProg=card.querySelector('.guide-bubble-progress');
  var bText=card.querySelector('.guide-bubble-text');
  var optsEl=card.querySelector('.guide-options');

  var celebrate=document.createElement('div');
  celebrate.className='guide-celebrate';
  celebrate.textContent='🎉 本节任务全通关！';
  celebrate.style.display='none';
  LAYER.appendChild(celebrate);

  var collapsed=false;
  var fb=null;/* {text,kind:'intro'|'ok'|'err',until} 反馈气泡临时覆盖题干 */
  var lastSig='';

  av.addEventListener('click',function(){
    collapsed=!collapsed;
    card.classList.toggle('collapsed',collapsed);
    main.style.display=collapsed?'none':'';
    lastSig='';
  });

  function setFb(text,kind,ms){fb={text:text,kind:kind,until:performance.now()+ms};}

  GuideEngine.init({
    onIntro:function(mode,intro){
      if(intro&&intro.text)setFb(intro.text,'intro',Math.max(4500,intro.text.length*160));
    },
    onTaskFail:function(t){
      if(t&&t.retry)setFb(t.retry,'err',3200);
    },
    onTaskDone:function(t){
      if(t&&t.praise)setFb(t.praise,'ok',2200);
    },
    onAllTasksDone:function(){
      setFb('🎉 本节任务全通关！','ok',5000);
      celebrate.style.display='block';
      setTimeout(function(){celebrate.style.display='none';},5000);
    }
  },{tasks:true});

  function render(){
    var st=GuideEngine.getTaskState();
    var mode=GuideEngine.getMode()||'m1';
    var tasks=(DATA[mode]&&DATA[mode].tasks)||[];
    var t=GuideEngine.curTask();
    var wrong=(t&&st.wrongPick&&st.wrongPick[t.id])||[];
    var fbOn=!!(fb&&performance.now()<fb.until);
    var sig=[mode,st.idx,st.done,st.allDone,collapsed,fbOn?fb.kind+fb.text:'',wrong.join(','),t?t.id:'-'].join('|');
    if(sig===lastSig)return;
    lastSig=sig;

    bubble.classList.remove('ok','err');
    while(optsEl.firstChild)optsEl.removeChild(optsEl.firstChild);

    if(st.allDone||!t){
      bProg.textContent='';
      bText.textContent='🎉 本节任务全通关！接下来自由探索吧～';
      return;
    }
    if(fbOn){
      if(fb.kind==='err')bubble.classList.add('err');
      else if(fb.kind==='ok')bubble.classList.add('ok');
      bProg.textContent='';
      bText.textContent=fb.text;
      return;/* 反馈期间不出选项，避免误点 */
    }
    var stageLabel=t.stage==='predict'?' · 先预测':(t.stage==='act'?' · 去操作':' · 看结果验证');
    bProg.textContent='任务 '+(st.idx+1)+'/'+tasks.length+stageLabel;
    bText.textContent=t.q;
    if(t.stage==='predict'&&t.options){
      t.options.forEach(function(op,i){
        var b=document.createElement('button');
        b.type='button';
        var isWrong=wrong.indexOf(i)>=0;
        b.className='guide-opt'+(isWrong?' wrong':'');
        b.textContent=op;
        if(isWrong)b.disabled=true;
        b.addEventListener('click',function(){GuideEngine.taskAnswer(i);lastSig='';});
        optsEl.appendChild(b);
      });
    }
  }
  (function loop(){render();requestAnimationFrame(loop);})();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})();

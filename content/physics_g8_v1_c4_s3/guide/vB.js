'use strict';
/* c4s3 变体 B · 语音版（打磨版 g2）
   = 底部字幕条（复用 .guide-caption 视觉）+ 每条触发播放 guide/audio/c4s3-{id}.mp3
   新增：右下「老师浮标」= 解说总开关（收起后字幕+配音全停，💤 角标，localStorage 记忆）；
        字幕驻留与音频 ended 同步；🔁 重播当前条；讲话中三竖条动效。
   纪律：不改 engine.js / script.js；字幕逻辑在本文件内自建，不触碰共享 Caption（vC/vD 各自实例化）。
   首次交互前浏览器可能拦截 autoplay：字幕照常出，play() 被拒时回退纯文字时长。 */
(function(){
var LS_COLLAPSED='gvb-collapsed';
var LS_MUTED='gvb-muted';
var MAX_DUR=15000;      /* 配音同步兜底上限 */
var END_TAIL=400;       /* audio ended 后字幕再驻留 */

function start(){
  if(!window.GuideEngine||!window.C4S3_SCRIPT)return;
  var LAYER=document.getElementById('guide-layer')||document.body;
  var AUDIOS=window.C4S3_SCRIPT.audios||{};

  function lsGet(k,def){try{var v=window.localStorage.getItem(k);return v==null?def:v;}catch(e){return def;}}
  function lsSet(k,v){try{window.localStorage.setItem(k,v);}catch(e){}}

  /* ---------- 顶部变体小标签 ---------- */
  var badge=document.createElement('span');
  badge.className='guide-badge';
  badge.textContent='B · 语音版';
  LAYER.appendChild(badge);

  /* ---------- 配音开关（只控配音，不控字幕） ---------- */
  var muted=lsGet(LS_MUTED,'0')==='1';
  var muteBtn=document.createElement('button');
  muteBtn.id='guide-mute';
  muteBtn.className='guide-mute-btn';
  muteBtn.textContent=muted?'🔇':'🔊';
  muteBtn.title='讲解配音开关（字幕不受影响）';
  LAYER.appendChild(muteBtn);

  /* ---------- 老师浮标：解说总开关 ---------- */
  var collapsed=lsGet(LS_COLLAPSED,'0')==='1';
  var fab=document.createElement('button');
  fab.className='gvb-fab';
  fab.type='button';
  fab.innerHTML='<span class="gvb-fab-face">🧑‍🏫</span><span class="gvb-fab-zzz">💤</span>';
  fab.title='收起 / 展开老师解说';
  fab.setAttribute('aria-label','收起或展开老师解说');
  LAYER.appendChild(fab);

  /* ---------- 字幕条（自建，复用 .guide-caption 基础视觉） ---------- */
  var bar=document.createElement('div');
  bar.className='guide-caption gvb-caption';
  bar.innerHTML='<span class="guide-caption-avatar">🎓</span>'+
                '<span class="gvb-speaking"><i></i><i></i><i></i></span>'+
                '<span class="guide-caption-text"></span>'+
                '<button class="gvb-replay" type="button" title="重播这条">🔁</button>';
  bar.style.display='none';
  LAYER.appendChild(bar);
  var txtEl=bar.querySelector('.guide-caption-text');
  var spkEl=bar.querySelector('.gvb-speaking');
  var replayEl=bar.querySelector('.gvb-replay');

  function bottomOff(){
    var cb=document.querySelector('.ctrlbar');
    return cb?Math.round(cb.getBoundingClientRect().height)+8:104;
  }
  function fabBottom(){
    var cb=document.querySelector('.ctrlbar');
    return cb?Math.round(cb.getBoundingClientRect().height)+14:110;
  }
  function place(){
    bar.style.bottom=bottomOff()+'px';
    fab.style.bottom=fabBottom()+'px';
  }
  window.addEventListener('resize',function(){if(cur)place();else fab.style.bottom=fabBottom()+'px';});

  /* ---------- 配音播放 ---------- */
  var curAudio=null;
  function setSpeaking(on){spkEl.classList.toggle('on',!!on);}
  function stopAudio(){
    if(curAudio){
      var a=curAudio;curAudio=null;
      try{a.pause();}catch(e){}
    }
    setSpeaking(false);
  }
  /* 返回 true = 已成功起播（字幕驻留改由 ended 驱动）；false = 走纯文字时长 */
  function playClip(id,onSettled){
    stopAudio();
    if(muted||collapsed||!id)return false;
    var src=AUDIOS[id];
    if(!src)return false;
    var a=new Audio(src);
    curAudio=a;
    var settled=false;
    function settle(failed){
      if(settled)return;settled=true;
      if(curAudio===a)curAudio=null;
      setSpeaking(false);
      if(onSettled)onSettled(failed);
    }
    a.addEventListener('playing',function(){if(curAudio===a)setSpeaking(true);});
    a.addEventListener('pause',function(){if(curAudio===a)setSpeaking(false);});
    a.addEventListener('ended',function(){settle(false);});
    a.addEventListener('error',function(){settle(true);});
    var p=a.play();
    if(p&&p.catch)p.catch(function(){settle(true);});/* autoplay 被拦截：静默回退文字时长 */
    return true;
  }

  /* ---------- 字幕驻留调度 ---------- */
  var cur=null,hideTimer=null;
  function textDur(t){return Math.max(4000,(t||'').length*280);}
  function clearHide(){if(hideTimer){clearTimeout(hideTimer);hideTimer=null;}}
  function scheduleHide(ms){clearHide();hideTimer=setTimeout(hide,ms);}
  function hide(){
    clearHide();
    stopAudio();
    cur=null;
    bar.classList.remove('show');
    setTimeout(function(){if(!cur)bar.style.display='none';},260);
  }
  /* 展开一条解说：collapsed 时只记内部状态，不显示不发声 */
  function say(text,kind,audioId){
    if(!text)return;
    clearHide();stopAudio();
    cur={text:text,kind:kind||'step',audioId:audioId||null,at:now()};
    if(collapsed){bar.style.display='none';bar.classList.remove('show');return;}
    render();
  }
  function now(){return (window.performance&&performance.now)?performance.now():Date.now();}
  function render(){
    if(!cur)return;
    bar.classList.remove('err','shake','show');
    void bar.offsetWidth;/* 强制 reflow，重放入场动画与抖动 */
    txtEl.textContent=cur.text;
    bar.style.display='flex';
    place();
    if(cur.kind==='error')bar.classList.add('err','shake');
    bar.classList.add('show');
    replayEl.style.display=cur.audioId?'':'none';
    var entry=cur;
    var playing=playClip(entry.audioId,function(failed){
      if(cur!==entry)return;
      setSpeaking(false);
      /* 音频正常结束：字幕再驻留 400ms；加载失败/被拦截：回退纯文字时长 */
      scheduleHide(failed?Math.max(600,textDur(entry.text)-(now()-entry.at)):END_TAIL);
    });
    if(!playing){setSpeaking(false);scheduleHide(textDur(entry.text));}
    else scheduleHide(MAX_DUR);/* 兜底上限，ended 会更早接管 */
  }

  /* ---------- 🔁 重播当前条 ---------- */
  replayEl.addEventListener('click',function(e){
    e.stopPropagation();
    if(!cur||!cur.audioId||collapsed)return;
    cur.at=now();
    render();
  });

  /* ---------- 收起 / 展开 ---------- */
  function missedWindow(){
    if(!cur)return 0;
    var span=cur.audioId?MAX_DUR:textDur(cur.text);
    var left=span-(now()-cur.at);
    return left>0?left:0;
  }
  function applyCollapsed(persist){
    fab.classList.toggle('is-collapsed',collapsed);
    fab.title=collapsed?'展开老师解说':'收起老师解说';
    muteBtn.style.display=collapsed?'none':'';/* 解说都关了，音量钮没必要留 */
    if(collapsed){
      bar.style.display='none';
      bar.classList.remove('show');
      clearHide();stopAudio();
    }else{
      place();
      var left=missedWindow();
      if(left>0){/* 收起期间错过的最近一条仍在显示时限内：展开即补显 */
        bar.style.display='flex';
        render();
        scheduleHide(Math.min(left,cur.audioId?MAX_DUR:textDur(cur.text)));
      }
    }
    if(persist!==false)lsSet(LS_COLLAPSED,collapsed?'1':'0');
  }
  fab.addEventListener('click',function(){
    collapsed=!collapsed;
    applyCollapsed(true);
  });

  muteBtn.addEventListener('click',function(){
    muted=!muted;
    muteBtn.textContent=muted?'🔇':'🔊';
    lsSet(LS_MUTED,muted?'1':'0');
    if(muted){
      stopAudio();
      if(cur)scheduleHide(Math.max(1200,textDur(cur.text)-(now()-cur.at)));
    }else if(cur&&cur.audioId&&!collapsed){
      cur.at=now();render();/* 解除静音：当前条重新配音 */
    }
  });

  /* ---------- 初始化 + 接入引擎 ---------- */
  applyCollapsed(false);
  place();

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
      say(free.note,'free',free.audio||null);
    }
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})();

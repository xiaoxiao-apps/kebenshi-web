'use strict';
/* c4s3 变体 B · 语音版（修复轮 r2 / g3，蔡总四条体验反馈）
   ① autoplay 被拦截：挂一次性手势监听（pointerdown/keydown, once+capture）解锁补播当前条或 intro；
   ② 解说队列：有音频在播时新解说入队等播完（error 纠错例外立即打断，被打断的 step/intro 不补播；
      队列上限 3，超出丢最旧、free 类最优先丢）；
   ④ 右上角喇叭钮已删除，右下老师浮标三态循环 voice(🔊语音+字幕)→text(🔇只字幕)→sleep(💤休眠)，
      localStorage 单键 gvb-mode 记忆（旧键 gvb-collapsed/gvb-muted 弃用忽略）。
   纪律：engine.js 仅两处向后兼容 G 字段小改；script.js 仅 m1-s1/m1-s2；生产文件零触碰。 */
(function(){
var LS_MODE='gvb-mode';
var MAX_DUR=15000;      /* 配音同步兜底上限 */
var END_TAIL=400;       /* audio ended 后字幕再驻留 */
var QUEUE_MAX=3;        /* 解说队列上限 */

function start(){
  if(!window.GuideEngine||!window.C4S3_SCRIPT)return;
  var LAYER=document.getElementById('guide-layer')||document.body;
  var AUDIOS=window.C4S3_SCRIPT.audios||{};
  var loadT=now();

  function lsGet(k,def){try{var v=window.localStorage.getItem(k);return v==null?def:v;}catch(e){return def;}}
  function lsSet(k,v){try{window.localStorage.setItem(k,v);}catch(e){}}
  function now(){return (window.performance&&performance.now)?performance.now():Date.now();}

  /* ---------- 顶部变体小标签 ---------- */
  var badge=document.createElement('span');
  badge.className='guide-badge';
  badge.textContent='B · 语音版';
  LAYER.appendChild(badge);

  /* ---------- 老师浮标：三态循环 voice→text→sleep ---------- */
  var mode=lsGet(LS_MODE,'voice');
  if(mode!=='voice'&&mode!=='text'&&mode!=='sleep')mode='voice';
  var fab=document.createElement('button');
  fab.className='gvb-fab';
  fab.type='button';
  fab.innerHTML='<span class="gvb-fab-face">🧑‍🏫</span><span class="gvb-fab-badge"></span>';
  fab.setAttribute('aria-label','老师解说模式切换');
  LAYER.appendChild(fab);
  var fabBadge=fab.querySelector('.gvb-fab-badge');

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
    if(mode!=='voice'||!id)return false;
    var src=AUDIOS[id];
    if(!src)return false;
    var a=new Audio(src);
    curAudio=a;
    var settled=false;
    function settle(failed){
      if(settled)return;settled=true;
      if(curAudio===a)curAudio=null;
      setSpeaking(false);
      if(failed)armUnlock();/* 反馈①：被拦截/加载失败 → 等首次手势补播 */
      if(onSettled)onSettled(failed);
    }
    a.addEventListener('playing',function(){if(curAudio===a){setSpeaking(true);disarmUnlock();}});
    a.addEventListener('pause',function(){if(curAudio===a)setSpeaking(false);});
    a.addEventListener('ended',function(){settle(false);});
    a.addEventListener('error',function(){settle(true);});
    var p=a.play();
    if(p&&p.catch)p.catch(function(){settle(true);});
    return true;
  }

  /* ---------- 首次手势解锁补播（反馈①，voice 态才挂） ---------- */
  var unlockArmed=false;
  function unlockHandler(){
    if(mode!=='voice'){disarmUnlock();return;}
    disarmUnlock();
    if(cur){/* 当前条仍在驻留窗口内：重播 */
      cur.at=now();render();
    }else if(lastIntro&&(now()-loadT)<8000){/* 已过期但页面加载 <8s：补播 intro */
      showEntry({text:lastIntro.text,kind:'intro',audioId:lastIntro.audioId,at:now()});
    }
  }
  function armUnlock(){
    if(mode!=='voice'||unlockArmed)return;
    unlockArmed=true;
    document.addEventListener('pointerdown',unlockHandler,{once:true,capture:true});
    document.addEventListener('keydown',unlockHandler,{once:true,capture:true});
  }
  function disarmUnlock(){
    if(!unlockArmed)return;
    unlockArmed=false;
    document.removeEventListener('pointerdown',unlockHandler,{capture:true});
    document.removeEventListener('keydown',unlockHandler,{capture:true});
  }

  /* ---------- 字幕驻留调度 + 队列（反馈②） ---------- */
  var cur=null,hideTimer=null,q=[],lastIntro=null;
  function textDur(t){return Math.max(4000,(t||'').length*280);}
  function clearHide(){if(hideTimer){clearTimeout(hideTimer);hideTimer=null;}}
  function scheduleHide(ms){clearHide();hideTimer=setTimeout(hide,ms);}
  function hide(){
    clearHide();
    stopAudio();
    cur=null;
    bar.classList.remove('show');
    setTimeout(function(){if(!cur)bar.style.display='none';},260);
    if(q.length)showEntry(q.shift());/* 兜底超时隐藏后继续消化队列 */
  }
  function enqueue(entry){
    q.push(entry);
    while(q.length>QUEUE_MAX){
      var drop=-1;
      for(var i=0;i<q.length;i++){if(q[i].kind==='free'){drop=i;break;}}
      if(drop<0)drop=0;
      q.splice(drop,1);
    }
  }
  function showEntry(entry){
    entry.at=now();
    cur=entry;
    clearHide();
    if(mode==='sleep'){/* 休眠：只记内部状态，不显示不发声 */
      bar.style.display='none';
      bar.classList.remove('show');
      return;
    }
    render();
  }
  function say(text,kind,audioId){
    if(!text)return;
    var entry={text:text,kind:kind||'step',audioId:audioId||null,at:now()};
    if(entry.kind==='intro')lastIntro=entry;
    if(entry.kind==='error'){
      /* 纠错即时：立即打断在播条目，被打断的 step/intro 不再补播 */
      clearHide();stopAudio();
      showEntry(entry);
      return;
    }
    if(mode==='voice'&&curAudio){enqueue(entry);return;}/* 有音频在播：等播完 */
    clearHide();stopAudio();
    showEntry(entry);
  }
  function render(){
    if(!cur)return;
    bar.classList.remove('err','shake','show');
    void bar.offsetWidth;/* 强制 reflow，重放入场动画与抖动 */
    txtEl.textContent=cur.text;
    bar.style.display='flex';
    place();
    if(cur.kind==='error')bar.classList.add('err','shake');
    bar.classList.add('show');
    replayEl.style.display=(cur.audioId&&mode==='voice')?'':'none';
    var entry=cur;
    var playing=playClip(entry.audioId,function(failed){
      if(cur!==entry)return;
      setSpeaking(false);
      if(q.length){showEntry(q.shift());return;}/* 播完取队首上屏 */
      /* 音频正常结束：字幕再驻留 400ms；加载失败/被拦截：回退纯文字时长 */
      scheduleHide(failed?Math.max(600,textDur(entry.text)-(now()-entry.at)):END_TAIL);
    });
    if(!playing){setSpeaking(false);scheduleHide(textDur(entry.text));}
    else scheduleHide(MAX_DUR);/* 兜底上限，ended 会更早接管 */
  }

  /* ---------- 🔁 重播当前条 ---------- */
  replayEl.addEventListener('click',function(e){
    e.stopPropagation();
    if(!cur||!cur.audioId||mode!=='voice')return;
    cur.at=now();
    render();
  });

  /* ---------- 三态循环 ---------- */
  function missedWindow(){
    if(!cur)return 0;
    var span=cur.audioId?MAX_DUR:textDur(cur.text);
    var left=span-(now()-cur.at);
    return left>0?left:0;
  }
  function applyMode(persist){
    fab.classList.remove('mode-voice','mode-text','mode-sleep');
    fab.classList.add('mode-'+mode);
    fabBadge.textContent=mode==='voice'?'🔊':mode==='text'?'🔇':'💤';
    fab.title=mode==='voice'?'语音+字幕':mode==='text'?'只字幕':'老师休眠中，点击唤醒';
    if(mode==='sleep'){
      disarmUnlock();
      clearHide();stopAudio();
      q.length=0;
      bar.style.display='none';
      bar.classList.remove('show');
    }else if(mode==='text'){
      disarmUnlock();
      stopAudio();
      if(cur){
        replayEl.style.display='none';
        scheduleHide(Math.max(800,textDur(cur.text)-(now()-cur.at)));
      }
    }else{/* voice：切回时若当前条仍在窗口内则重播（覆盖「先关声音后开」场景） */
      if(cur&&missedWindow()>0){cur.at=now();render();}
    }
    if(persist!==false)lsSet(LS_MODE,mode);
  }
  fab.addEventListener('click',function(){
    mode=mode==='voice'?'text':mode==='text'?'sleep':'voice';
    applyMode(true);
  });

  /* ---------- 初始化 + 接入引擎 ---------- */
  applyMode(false);
  place();

  GuideEngine.init({
    onIntro:function(m,intro){
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

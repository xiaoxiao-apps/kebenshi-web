'use strict';
/* c4s3 变体 B · 语音版（修复轮 r3 / g4，蔡总三条体验反馈）
   ① autoplay 拦截（平台红线绕不过）：voice 态照常起播 intro，play() 被拒 NotAllowedError →
      弹全屏启动层 .gvb-start「🔊 点击开启语音讲解」，点一下移除并立刻补播当前条；
      放行则启动层永不出现；本次页面生命周期只弹一次；r2 的隐形 once 手势补播保留作兜底。
   ② 浮标三态视觉：voice=纯净头像无任何叠加；text=头像圆面上叠 🔇（白圆底小托，非附在旁边）；
      sleep=同款叠加位 💤 + 头像半透明。三态 title/localStorage(gvb-mode) 循环逻辑不变。
   ③ 结论播报：script.js 追加 m{1,2,3}-concl（trigger after:mX-s5@1500），engine 现成 after: 触发；
      r2 的解说队列（有音频在播则入队等播完，error 例外立即打断，上限 3 丢最旧/free 优先）
      自动保证结论排在上一条解说之后播。
   纪律：本轮 engine.js 零改动；script.js 仅 3 step + 3 audios 追加；生产文件零触碰。 */
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

  /* ---------- 老师浮标：三态循环 voice→text→sleep（r3：voice 态纯净无叠加） ---------- */
  var mode=lsGet(LS_MODE,'voice');
  if(mode!=='voice'&&mode!=='text'&&mode!=='sleep')mode='voice';
  var fab=document.createElement('button');
  fab.className='gvb-fab';
  fab.type='button';
  fab.innerHTML='<span class="gvb-fab-face">🧑‍🏫</span>';
  fab.setAttribute('aria-label','老师解说模式切换');
  LAYER.appendChild(fab);
  /* 叠加图标：voice 态传 null = 从 DOM 摘掉（头像上不留任何角标）；text/sleep 态叠在圆面右下 */
  function setBadge(glyph){
    var b=fab.querySelector('.gvb-fab-badge');
    if(!glyph){if(b&&b.parentNode)b.parentNode.removeChild(b);return;}
    if(!b){b=document.createElement('span');b.className='gvb-fab-badge';fab.appendChild(b);}
    b.textContent=glyph;
  }

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
    function settle(failed,blocked){
      if(settled)return;settled=true;
      if(curAudio===a)curAudio=null;
      setSpeaking(false);
      /* 反馈①：autoplay 被拦 → 显式启动层（一次生命周期只弹一次）；其余失败/已弹过 → 隐形手势兜底 */
      if(blocked&&!startUsed)showStartLayer();
      else if(failed)armUnlock();
      if(onSettled)onSettled(failed,blocked);
    }
    a.addEventListener('playing',function(){if(curAudio===a){setSpeaking(true);disarmUnlock();}});
    a.addEventListener('pause',function(){if(curAudio===a)setSpeaking(false);});
    a.addEventListener('ended',function(){settle(false,false);});
    a.addEventListener('error',function(){settle(true,false);});
    var p=a.play();
    if(p&&p.catch)p.catch(function(e){settle(true,!!(e&&e.name==='NotAllowedError'));});
    return true;
  }

  /* ---------- r3 反馈①：全屏语音启动层 ---------- */
  function showStartLayer(){
    if(mode!=='voice'||startUsed||startEl)return;
    startUsed=true;
    var el=document.createElement('div');
    el.className='gvb-start';
    el.setAttribute('role','button');
    el.setAttribute('aria-label','点击开启语音讲解');
    el.innerHTML='<div class="gvb-start-card"><span class="gvb-start-icon">🔊</span>'+
                 '<span class="gvb-start-title">点击开启语音讲解</span>'+
                 '<span class="gvb-start-sub">浏览器要求先点一下屏幕才允许播声音</span></div>';
    el.addEventListener('click',function(){
      removeStartLayer();
      disarmUnlock();
      if(cur){cur.at=now();render();}        /* 立刻补播当前条 */
      else if(lastIntro)showEntry(lastIntro);/* 当前条已过期：补播 intro */
    });
    LAYER.appendChild(el);
    startEl=el;
  }
  function removeStartLayer(){
    if(!startEl)return;
    var el=startEl;startEl=null;
    if(el.parentNode)el.parentNode.removeChild(el);
  }

  /* ---------- r2 隐形手势解锁补播（r3 降级为兜底，voice 态才挂） ---------- */
  var unlockArmed=false;
  var startEl=null,startUsed=false;/* r3 启动层元素 / 本次页面生命周期是否已弹过 */
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
    var playing=playClip(entry.audioId,function(failed,blocked){
      if(cur!==entry)return;
      setSpeaking(false);
      if(blocked&&startEl){clearHide();return;}/* 启动层在屏：字幕留住，点击解锁后由 render() 接管 */
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
    setBadge(mode==='voice'?null:mode==='text'?'🔇':'💤');
    fab.title=mode==='voice'?'语音+字幕':mode==='text'?'只字幕':'老师休眠中，点击唤醒';
    if(mode==='sleep'){
      removeStartLayer();
      disarmUnlock();
      clearHide();stopAudio();
      q.length=0;
      bar.style.display='none';
      bar.classList.remove('show');
    }else if(mode==='text'){
      removeStartLayer();
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

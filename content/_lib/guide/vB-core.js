'use strict';
/* c4s3 变体B语音版（修复轮 r5 / g6，蔡总反馈①：要做哪步播哪步）
   即时打断制：新解说到达 → 无条件停掉当前音频、清驻留计时、立即上屏渲染；
   r2 的解说队列机制整体删除，防刷屏交给 engine 的 3s 步骤冷却 / 5s 纠错节流。
   audio ended → 字幕 +400ms 后隐藏、🔁 重播、启动层、三态、collapsed/sleep 判断全部保持现状。 */
(function(){
/* 单7：LS 键 gvb-mode→gvb-mode2，旧键弃读不迁移=一次性救回被半藏角标静默切走的设备（默认回 voice） */
var LS_MODE='gvb-mode2';
var MAX_DUR=15000;      /* 配音同步兜底上限 */
var END_TAIL=400;       /* audio ended 后字幕再驻留 */

function start(){
  if(!window.GuideEngine||!window.GUIDE_DATA)return;
  var LAYER=document.getElementById('guide-layer')||document.body;
  var AUDIOS=(window.GUIDE_DATA&&window.GUIDE_DATA.audios)||{};
  var loadT=now();

  function lsGet(k,def){try{var v=window.localStorage.getItem(k);return v==null?def:v;}catch(e){return def;}}
  function lsSet(k,v){try{window.localStorage.setItem(k,v);}catch(e){}}
  function now(){return (window.performance&&performance.now)?performance.now():Date.now();}

  /* EG2-2：删除左上角变体小标签 badge（改由总站/节卡片「语音讲解」角标标注，见 card-voice-badge.css） */

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
  /* C 右缘垂直预算（蔡总 2026-11-02 移动端全量铺·单1）：触摸门 = (pointer:coarse) and (hover:none)，
     金球 fab 固定 bottom=110+安全区，压在 📈 浮钮（bottom:56+44高=100）上方互不交叠；桌面走原 ctrlbar 自适应。 */
  var mqTouch=(window.matchMedia&&window.matchMedia('(pointer:coarse) and (hover:none)'))||null;
  function touchGate(){return !!(mqTouch&&mqTouch.matches);}
  function fabBottom(){
    if(touchGate())return 110+((typeof safe==='object'&&safe)?safe.bottom:0);
    var cb=document.querySelector('.ctrlbar');
    return cb?Math.round(cb.getBoundingClientRect().height)+14:110;
  }
  function place(){
    bar.style.bottom=bottomOff()+'px';
    if(!fabDocked)fab.style.bottom=fabBottom()+'px';
  }
  window.addEventListener('resize',function(){
    refreshSafe();
    hideHint();                                 /* 单7：尺寸变了浮提示定位失效，直接收掉 */
    if(!hideFab()){if(fabDocked)undock();}        /* 宽屏（非触摸门）恢复 right:14px 原定位 */
    else if(!fabDocked&&curPos){fabDocked=true;} /* 旋转到窄屏/触摸门且有记忆位 → 重新吸边半藏 */
    if(fabDocked)reapplyDock();
    else if(cur)place();
    else fab.style.bottom=fabBottom()+'px';
  });

  /* ---------- P1a 金球拖动吸边（蔡总 2026-10-30）：位移<5px=点击（三态循环零变化）；≥5px=跟手拖动，
     松手吸附最近左/右缘并半藏(露60%)，位置写 localStorage('gvb-fab-pos') 跨页记忆；
     单6b：半藏在触摸门内全宽度生效（原仅 (max-width:900px)），宽屏桌面仍保持 right:14px 原定位；
     拖动避开 iOS 安全区 env(safe-area-inset-*)。 ---------- */
  var LS_POS='gvb-fab-pos';
  var fabDocked=false,curPos=null,justDragged=false;
  var mqNarrow=(window.matchMedia&&window.matchMedia('(max-width:900px)'))||null;
  function narrow(){return !!(mqNarrow&&mqNarrow.matches);}
  /* 单6b：半藏判定 = 触摸门（全宽度）或窄屏（桌面窄窗保留原行为） */
  function hideFab(){return touchGate()||narrow();}
  var safe={top:0,right:0,bottom:0,left:0};
  function refreshSafe(){
    try{
      var p=document.createElement('div');
      p.style.cssText='position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;opacity:0;'+
        'padding-top:env(safe-area-inset-top);padding-right:env(safe-area-inset-right);'+
        'padding-bottom:env(safe-area-inset-bottom);padding-left:env(safe-area-inset-left);';
      document.body.appendChild(p);
      var cs=window.getComputedStyle(p);
      safe={top:parseFloat(cs.paddingTop)||0,right:parseFloat(cs.paddingRight)||0,
            bottom:parseFloat(cs.paddingBottom)||0,left:parseFloat(cs.paddingLeft)||0};
      if(p.parentNode)p.parentNode.removeChild(p);
    }catch(e){safe={top:0,right:0,bottom:0,left:0};}
  }
  function fabW(){return fab.offsetWidth||52;}
  function clampTop(t){
    var w=fabW(),mn=safe.top+4,mx=Math.max(mn,window.innerHeight-w-safe.bottom-4);
    return Math.min(Math.max(t,mn),mx);
  }
  function reapplyDock(){
    if(!curPos)return;
    var w=fabW(),hide=hideFab();
    fab.style.bottom='auto';
    fab.style.top=clampTop(curPos.top)+'px';
    if(curPos.edge==='left'){
      fab.style.left=(hide?safe.left-0.4*w:8+safe.left)+'px';fab.style.right='auto';
    }else{
      fab.style.right=(hide?safe.right-0.4*w:8+safe.right)+'px';fab.style.left='auto';
    }
    fab.classList.add('gvb-docked');
  }
  function undock(){
    fabDocked=false;curPos=null;
    fab.classList.remove('gvb-docked');
    fab.style.left='auto';fab.style.right='';fab.style.top='auto';fab.style.bottom='';fab.style.transition='';
    place();
  }
  function persistPos(){if(curPos)lsSet(LS_POS,JSON.stringify({edge:curPos.edge,top:Math.round(curPos.top)}));}
  var dragState=null;
  fab.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    justDragged=false;
    var r=fab.getBoundingClientRect();
    dragState={sx:e.clientX,sy:e.clientY,ox:r.left,oy:r.top,w:r.width,moved:false,id:e.pointerId};
    try{fab.setPointerCapture(e.pointerId);}catch(_){}
  });
  fab.addEventListener('pointermove',function(e){
    if(!dragState)return;
    var dx=e.clientX-dragState.sx,dy=e.clientY-dragState.sy;
    if(!dragState.moved){
      if(Math.sqrt(dx*dx+dy*dy)<5)return;
      dragState.moved=true;fabDocked=true;fab.style.transition='none';refreshSafe();
    }
    if(e.cancelable)e.preventDefault();
    var w=dragState.w,left=dragState.ox+dx,top=dragState.oy+dy;
    left=Math.min(Math.max(left,safe.left-w*0.4),Math.max(safe.left-w*0.4,window.innerWidth-safe.right-w*0.6));
    fab.style.left=left+'px';fab.style.top=clampTop(top)+'px';fab.style.right='auto';fab.style.bottom='auto';
    curPos={edge:(left+w/2<window.innerWidth/2)?'left':'right',top:clampTop(top)};
  });
  function endDrag(e){
    if(!dragState)return;
    var moved=dragState.moved;dragState=null;
    try{fab.releasePointerCapture(e.pointerId);}catch(_){}
    if(!moved)return;                 /* <5px：当点击，交给 click 循环三态 */
    justDragged=true;
    fab.style.transition='';
    reapplyDock();                    /* 吸附最近缘并半藏 */
    persistPos();
  }
  fab.addEventListener('pointerup',endDrag);
  fab.addEventListener('pointercancel',function(){dragState=null;fab.style.transition='';});
  /* 载入记忆位：窄屏/触摸门应用吸边半藏；宽屏桌面保持 right:14px 原定位不动 */
  refreshSafe();
  try{
    var rawPos=lsGet(LS_POS,null);
    if(rawPos){
      var pp=JSON.parse(rawPos);
      if(pp&&(pp.edge==='left'||pp.edge==='right')&&typeof pp.top==='number'){
        curPos={edge:pp.edge,top:pp.top};
        if(hideFab()){fabDocked=true;reapplyDock();}
      }
    }
  }catch(e){}
  /* 单6b：触摸门内无拖拽记忆 → 初始即右缘半藏，中心 y=73%vh（蔡总触摸截图值）；桌面不执行 */
  if(!curPos&&touchGate()){
    var fh=fab.offsetHeight||fabW(),vh=window.innerHeight||360;
    curPos={edge:'right',top:clampTop(vh*0.73-fh/2)};
    fabDocked=true;
    reapplyDock();
  }

  /* ---------- 配音播放 ---------- */
  var curAudio=null;
  var audioResumeAt=0,pauseT=0;/* EG3-2 暂停联动：音频续播断点 / 暂停起点（字幕驻留时间冻结用） */
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
                 '<span class="gvb-start-title">点击开启语音讲解</span></div>';/* EG1：删小字 .gvb-start-sub */
    el.addEventListener('click',function(){
      startAck=true;                         /* EG2-1：先确认，之后 say() 一律放行 */
      if(window.GuideEngine&&window.GuideEngine.rearmPending)window.GuideEngine.rearmPending();/* R9主会话热修：认可=引导时钟归零+重武装未播条目（晚认可不丢首条引导） */
      removeStartLayer();
      disarmUnlock();
      if(pendingEntry){                      /* 优先正式开播被闸门拦下的第一条（通常是欢迎词） */
        var pe=pendingEntry;pendingEntry=null;
        say(pe.text,pe.kind,pe.audioId);
      }
      else if(cur){cur.at=now();render();}   /* 兜底：立刻补播当前条 */
      else if(lastIntro)showEntry(lastIntro);/* 兜底：当前条已过期则补播 intro */
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
  var startAck=false,pendingEntry=null;/* EG2-1 欢迎词闸门：用户是否已确认播音 / 被闸门拦下的第一条（first-wins） */
  function unlockHandler(){
    if(mode!=='voice'){disarmUnlock();return;}
    disarmUnlock();
    if(window.GuideEngine&&window.GuideEngine.rearmPending)window.GuideEngine.rearmPending();/* R9主会话热修：手势解锁认可同款重武装 */
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

  /* ---------- 字幕驻留调度（r5：即时打断，无队列） ---------- */
  var cur=null,hideTimer=null,lastIntro=null;
  function textDur(t){return Math.max(4000,(t||'').length*280);}
  function clearHide(){if(hideTimer){clearTimeout(hideTimer);hideTimer=null;}}
  function scheduleHide(ms){clearHide();hideTimer=setTimeout(hide,ms);}
  function hide(){
    /* 【R9 蔡总 10-29】兜底驻留定时器不得掐灭仍在播的音频：旧 MAX_DUR=15s 到点 hide()→stopAudio() 连带掐音频
       （结论 c6s2-s5a 21.7s 总在开播+15s 被掐=「结论没播完就停掉」终极根因，全库仅它超15s故只结论中招）；
       音频仍在播则自递5s复查，ended/settle 会正常接管收尾 */
    if(curAudio&&!curAudio.paused&&!curAudio.ended){ scheduleHide(5000); return; }
    clearHide();
    stopAudio();
    cur=null;
    bar.classList.remove('show');
    setTimeout(function(){if(!cur)bar.style.display='none';},260);
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
    /* EG2-1 欢迎词闸门：voice 模式未经用户确认前，一律不出声、不显字幕 */
    if(mode==='voice'&&!startAck){
      /* 防死锁b：本生命周期启动层已弹过且已移除 = 用户已确认过，直接放行 */
      if(startUsed&&startEl===null){startAck=true;}
      else{
        if(!startEl)showStartLayer();        /* 首次 say 必弹启动卡（不再依赖 blocked） */
        if(!pendingEntry)pendingEntry=entry; /* first-wins：保住欢迎词不被后续条目顶掉 */
        return;
      }
    }
    /* r5：要做哪步播哪步——无条件打断在播音频，新条立即上屏 */
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

  /* ---------- 单7：切态浮提示（角标半藏后唯一可见的状态反馈，2.5s 自隐） ---------- */
  var HINT_TXT={text:'已切字幕-only·轻点金球回语音',sleep:'老师休眠中·轻点金球唤醒',voice:'语音已恢复'};
  var hintEl=null,hintT=null;
  function hideHint(){
    if(hintT){clearTimeout(hintT);hintT=null;}
    if(!hintEl)return;
    var e=hintEl;hintEl=null;
    e.classList.remove('show');
    setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},220);
  }
  function showHint(){
    hideHint();
    if(!HINT_TXT[mode])return;
    var el=document.createElement('div');
    el.className='gvb-mode-hint';
    el.textContent=HINT_TXT[mode];
    LAYER.appendChild(el);
    var r=fab.getBoundingClientRect(),h=el.offsetHeight||0,w=el.offsetWidth||0;
    var vh=window.innerHeight||360,vw=window.innerWidth||360;
    var top=Math.min(Math.max(r.top+r.height/2,h/2+8+safe.top),Math.max(h/2+8+safe.top,vh-h/2-8-safe.bottom));
    el.style.top=Math.round(top)+'px';
    /* 贴 fab 外侧：右缘吸边→卡在左；左缘吸边→翻到右，避免出视口 */
    if(r.left+r.width/2<vw/2){el.style.left=Math.round(r.right+8)+'px';el.style.right='auto';}
    else{el.style.right=Math.round(vw-r.left+8)+'px';el.style.left='auto';}
    hintEl=el;
    void el.offsetWidth;
    el.classList.add('show');
    hintT=setTimeout(hideHint,2500);
  }

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
    if(justDragged){justDragged=false;return;}/* P1a：拖动松手误触发的 click 不切三态 */
    mode=mode==='voice'?'text':mode==='text'?'sleep':'voice';
    if(mode==='voice')startAck=true;/* EG2-1 防死锁a：用户显式手势切到语音=同意播音 */
    applyMode(true);
    showHint();
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
    },
    /* EG4a：引擎/页面调用的即时静音——停当前音频+清隐藏定时器+字幕条移除 show 态+当前条目引用置空 */
    onStop:function(){
      clearHide();
      stopAudio();
      cur=null;
      bar.classList.remove('show');
      setTimeout(function(){if(!cur)bar.style.display='none';},260);
    },
    /* EG3-1【接口契约3】引擎重置配合：被欢迎词闸门拦下的旧条目不带进新周期；
       startAck/startUsed/startEl 一律不碰（用户已确认过播音，禁重新弹启动卡） */
    onReset:function(){
      pendingEntry=null;
    },
    /* EG3-2【接口契约4】暂停联动：音频续播不重播、字幕冻结显示（DOM 与 cur 保留）、驻留倒计时停摆 */
    onPause:function(paused){
      if(paused){
        pauseT=now();
        if(curAudio){
          try{audioResumeAt=curAudio.currentTime;curAudio.pause();}catch(e){}
        }
        clearHide();
        return;
      }
      if(curAudio){
        try{
          curAudio.currentTime=audioResumeAt;
          var pr=curAudio.play();
          if(pr&&pr.catch)pr.catch(function(){});
        }catch(e){}
      }
      if(cur){
        /* 暂停期间驻留倒计时冻结：把暂停时长补回 at，再按剩余窗口重挂（至少留 END_TAIL，防恢复瞬间字幕消失） */
        if(pauseT)cur.at+=now()-pauseT;
        scheduleHide(Math.max(END_TAIL,missedWindow()));
      }
      pauseT=0;
    },
    /* 【接口契约6·R5】queue:true 条目排队判定：当前是否有语音真在播 */
    isAudioPlaying:function(){return !!(curAudio&&!curAudio.paused&&!curAudio.ended);}
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})();

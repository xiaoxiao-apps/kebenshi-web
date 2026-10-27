'use strict';
/* 通用版：状态源=window.GUIDE_CFG.state（宿主实验的稳定状态对象，须原地 mutate 不重赋值）；数据源=window.GUIDE_DATA（各实验 guide-data）。未配置时回退 c4_s3 默认，向后兼容。 */
/* c4s3 平面镜成像 · 四变体共享触发引擎（设计书 §0.3 / §6.6 / 任务书 §2.3）
   只读纪律：绝不写 window.MRR 任何字段、绝不调用 core 内部函数，只读 window.MRR + DOM。
   G 进度字段为引擎私有（§0.3），经 new Function 的参数注入，不挂 window、不污染 MRR。
   trigger 表达式全部来自本仓库第一方静态数据 script.js（设计书逐条核实的 R 字段），非用户输入。
   特殊 trigger：delay:2000（进模式延时一次）/ expr@2000（持续满足才触发）/
   event:click:#btn-rec:expr、event:input:#obj-slider[:expr]（capture 即时判定，不拦截原逻辑）/
   after:m3-s4@1500（依赖步触发后延时）。 */
/* 【接口契约2·EG4c】window.GUIDE_SCENE={change:function(){...}}
   语义=api.onStop() 立即静音 + clearPendingSchedules() + 清 errLast/freeLast/freePrev/repLast + G.modeEnterT=now()；
   不清 firedSteps/fireCount（防切回子台时非 repeat 旧步骤重发），不重发 intro。
   供页面波在子场景切换处接线（如 c3s3 蒸发子台 tab、c4s1-shadow pinhole/hand 切换）：
   切换处调用 window.GUIDE_SCENE&&window.GUIDE_SCENE.change()。 */
/* 【接口契约1·EG3b】free 条目新增可选字段 cooldown:<毫秒>（如 cooldown:1000 实现「点一次报一次」），
   事件型与电平型 free 节流均取 fr.cooldown||8000，缺省 8000 与旧行为一致。 */
(function(){
if(window.GuideEngine)return;
var R=(window.GUIDE_CFG&&window.GUIDE_CFG.state)||window.MRR;
var DATA=window.GUIDE_DATA||window.C4S3_SCRIPT;
var apiRef=null,loopOn=false;
var curMode=null,G={},firedSteps={},hold={},errLast={},freeLast={},freePrev={},stepSched={};
/* r4：repeat:true 步骤的边沿重触发状态（引擎私有，非 repeat 步骤不使用） */
var repPrev={},repLast={},fireCount={},seenCount={},delayFired={};
var REP_COOLDOWN=3000;
var EVT_DEBOUNCE=500;/* EG3a：事件型 steps 去抖（用户动作到=秒响），电平型 repeat 仍走 REP_COOLDOWN */
var fnCache={};
var tasksOn=false,taskState={idx:0,done:false,allDone:false,answered:{},wrongPick:{}};
var recCache={n:-1,t:0};
var lastDoCm=null,lastChangeSeenT=0,objChangeArmed=true;
/* r5：等效蜡烛移动手势计数状态（镜像 objChangeCount，仅 placed 态跟踪） */
var lastEqDo=null,eqChangeSeenT=0,eqChangeArmed=true,prevEqPlaced=false;
/* A5（W1 c4s2 揪出）：角度改动手势计数状态——监听 R.angleI，无此字段的实验不进守卫 */
var lastAngVal=null,angChangeSeenT=0,angChangeArmed=true;

function now(){return performance.now();}
function getApi(){return apiRef||{};}

/* ---------- trigger 解析 ---------- */
function parseTrigger(t){
  if(typeof t!=='string')return null;
  var p={raw:t,expr:null,holdMs:0,afterId:null,afterMs:0,delayMs:0,evt:null,el:null};
  var m;
  if((m=t.match(/^delay:(\d+)$/))){p.delayMs=+m[1];return p;}
  if((m=t.match(/^after:([\w-]+)@(\d+)$/))){p.afterId=m[1];p.afterMs=+m[2];return p;}
  if((m=t.match(/^event:(\w+):([^:]+)(?::([\s\S]*))?$/))){
    p.evt=m[1];p.el=m[2];p.expr=m[3]||null;return p;
  }
  if((m=t.match(/^([\s\S]+)@(\d+)$/))){p.expr=m[1];p.holdMs=+m[2];return p;}
  p.expr=t;return p;
}
function compile(expr){
  if(expr==null)return null;
  if(Object.prototype.hasOwnProperty.call(fnCache,expr))return fnCache[expr];
  try{fnCache[expr]=new Function('R','G','return ('+expr+');');}
  catch(e){fnCache[expr]=null;}
  return fnCache[expr];
}
function evalParsed(p){
  if(!p||p.expr==null)return false;
  var fn=compile(p.expr);
  if(!fn)return false;
  try{return !!fn(R,G);}catch(e){return false;}
}
function evalExprStr(expr){
  var fn=compile(expr);
  if(!fn)return false;
  try{return !!fn(R,G);}catch(e){return false;}
}
/* 节流：首次必放行（performance.now() 是页面加载后毫秒，不能用 ||0 兜底否则前 N 秒全被吞） */
function throttle(map,key,ms){
  var t=now();
  if(map[key]==null||t-map[key]>=ms){map[key]=t;return true;}
  return false;
}

/* ---------- G 进度字段采集（§0.3，引擎私有） ---------- */
function resetG(){
  G={recCount:0,do0:(R&&R.doCm!=null)?R.doCm:8,objChangeCount:0,
     t:now(),lastObjChangeT:0,eqMoveGestureCount:0,lastEqChangeT:0,
     eqEverOn:false,everMatched:false,firstSlotDone:false,modeEnterT:now(),
     everLit:false,matchedEdgeCount:0,angleWasOff:false,
     raySaid:false,inBeamSaid:false,spSaid:false,firstSlotSaid:false,bothSlotSaid:false,pathSaid:false,
     angChangeCount:0,lastAngChangeT:0};
  lastDoCm=null;lastChangeSeenT=0;objChangeArmed=true;
  lastEqDo=null;eqChangeSeenT=0;eqChangeArmed=true;prevEqPlaced=false;
  lastAngVal=null;angChangeSeenT=0;angChangeArmed=true;
}
function countRec(){
  var t=now();
  if(recCache.n>=0&&t-recCache.t<250)return recCache.n;
  recCache.t=t;
  var cells=document.querySelectorAll('#rec-table tbody .c-do');
  var n=0;
  for(var i=0;i<cells.length;i++){if(cells[i].textContent!=='—')n++;}
  recCache.n=n;return n;
}
function updateG(){
  if(!R)return;
  var t=now();
  G.t=t;
  G.recCount=countRec();
  G.modeEnterT=G.modeEnterT||t;
  if(R.eqOn)G.eqEverOn=true;
  if(R.objLit)G.everLit=true;
  if(R.m3&&((R.m3.top&&R.m3.top.state==='slot')||(R.m3.bottom&&R.m3.bottom.state==='slot')))G.firstSlotDone=true;
  if(R.m3&&Math.abs(R.m3.angle-45)>0.5)G.angleWasOff=true;
  /* matched 边沿计数（free「又重合了」用，先于 tickFree 更新） */
  if(R.matched&&!G._prevMatched)G.matchedEdgeCount++;
  G._prevMatched=R.matched;
  /* objChangeCount：物距改动「手势」计数——R.doCm 变化且已武装才 +1，
     静默 350ms 后重新武装，一次连续拖动（滑杆或 canvas）只计 1 次 */
  if(R.doCm!=null){
    if(lastDoCm===null){lastDoCm=R.doCm;}
    else if(R.doCm!==lastDoCm){
      lastDoCm=R.doCm;lastChangeSeenT=t;G.lastObjChangeT=t;
      if(objChangeArmed){G.objChangeCount++;objChangeArmed=false;}
    }
    if(!objChangeArmed&&t-lastChangeSeenT>350)objChangeArmed=true;
  }
  /* r5 eqMoveGestureCount：等效蜡烛移动「手势」计数——镜像 objChangeCount，
     仅 placed 态跟踪；刚放下种子赋值不计数，一次连续挪动只计 1 次，静默 350ms 重新武装 */
  if(R.eqState==='placed'){
    if(!prevEqPlaced){lastEqDo=R.eqDo;eqChangeArmed=true;}
    else if(R.eqDo!==lastEqDo){
      lastEqDo=R.eqDo;eqChangeSeenT=t;G.lastEqChangeT=t;
      if(eqChangeArmed){G.eqMoveGestureCount++;eqChangeArmed=false;}
    }
    if(!eqChangeArmed&&t-eqChangeSeenT>350)eqChangeArmed=true;
  }else{
    lastEqDo=null;
  }
  prevEqPlaced=(R.eqState==='placed');
  /* A5 angChangeCount：角度改动「手势」计数（监听 R.angleI，镜像 objChangeCount）——
     变化且已武装才 +1，静默 350ms 重新武装，一次连续拖动只计 1 次。
     c4s2 法线步 s4 trigger 依赖 G.angChangeCount>=1 && (G.t-G.lastAngChangeT)>800；
     通用字段：无 R.angleI 的实验不进守卫，其余有角度拖动的实验亦可复用 */
  if(R.angleI!=null){
    if(lastAngVal===null){lastAngVal=R.angleI;}
    else if(R.angleI!==lastAngVal){
      lastAngVal=R.angleI;angChangeSeenT=t;G.lastAngChangeT=t;
      if(angChangeArmed){G.angChangeCount++;angChangeArmed=false;}
    }
    if(!angChangeArmed&&t-angChangeSeenT>350)angChangeArmed=true;
  }
}

/* ---------- 触发分发 ---------- */
function fireStep(step,mode){
  fireCount[step.id]=(fireCount[step.id]||0)+1;/* r4：after: 依赖计数（repeat/非 repeat 都计） */
  if(step.saidFlag)G[step.saidFlag]=true;
  var api=getApi();
  if(api.onStep)api.onStep(step,mode);
}
function fireError(err){
  var api=getApi();
  if(api.onError)api.onError(err);
}
function fireFree(free){
  var api=getApi();
  if(api.onFree)api.onFree(free);
}
function fireIntro(mode,intro){
  var api=getApi();
  if(api.onIntro)api.onIntro(mode,intro);
}

function sched(step,mode,ms){
  if(stepSched[step.id]!=null)return;
  stepSched[step.id]=setTimeout(function(){
    stepSched[step.id]=null;
    if(step.repeat){/* r4：repeat 步骤可重发，不查/不写 fired */
      if(curMode===mode){repLast[step.id]=now();fireStep(step,mode);}
      return;
    }
    var fired=firedSteps[mode]||(firedSteps[mode]={});
    if(curMode===mode&&!fired[step.id]){fired[step.id]=true;fireStep(step,mode);}
  },ms);
}
/* steps：默认边沿触发只回调一次；repeat:true 步骤边沿重触发+3s 冷却（r4）；同帧多条按数组序只发第一条 */
function tickSteps(mode){
  var md=DATA&&DATA[mode];if(!md||!md.steps)return;
  var fired=firedSteps[mode]||(firedSteps[mode]={});
  for(var i=0;i<md.steps.length;i++){
    var st=md.steps[i];
    if(st.repeat){/* r4：repeat 步骤不写 firedSteps，每帧先同步上一帧电平 */
      repPrev[st.id]=repPrev[st.id]||false;
    }else if(fired[st.id])continue;
    var p=parseTrigger(st.trigger);
    if(!p)continue;
    if(p.evt)continue;/* 热修#4：事件型步骤由 bindEventTriggers 处理；此处若每帧电平求值会在闸门变真瞬间误发（c4s4 试点 bug①：s3 把 s1 顶掉的根因） */
    if(p.delayMs){
      if(st.repeat){
        /* r6：delay 型 repeat 步骤每次进模式只发一次，发过（或已挂待）就不再重挂，杜绝 N 秒无限重播 */
        if(delayFired[st.id])continue;
        delayFired[st.id]=true;
      }
      sched(st,mode,p.delayMs);continue;
    }
    if(p.afterId){
      if(st.repeat){
        /* r4：依赖步每多发一次，就重新延时触发一次（seenCount 追 fireCount） */
        var fc=fireCount[p.afterId]||0;
        if(fc>(seenCount[st.id]||0)&&stepSched[st.id]==null){seenCount[st.id]=fc;sched(st,mode,p.afterMs);}
        repPrev[st.id]=false;
      }else if(fired[p.afterId])sched(st,mode,p.afterMs);
      continue;
    }
    if(p.expr==null)continue;
    var v=evalParsed(p);
    var rPrev=st.repeat?!!repPrev[st.id]:false;/* 存档本帧更新前的电平 */
    if(st.repeat)repPrev[st.id]=v;/* 每帧更新上一帧布尔 */
    if(p.holdMs){
      if(v){
        if(hold[st.id]==null){
          /* 热修#5：repeat+hold 只在上升沿(假→真)启动计时——原实现 hold 期间每帧把 repPrev 置真，
             到期时 !rPrev 永假=永不触发（c4s4 试点 bug②：s4 垂直入射哑火根因）。
             发火后 repPrev=true 状态不变不再计时，离开再进入才重新计时=每次进入状态说一次 */
          if(!st.repeat||!rPrev)hold[st.id]=now();
        }
        else if(now()-hold[st.id]>=p.holdMs){
          hold[st.id]=null;
          if(st.repeat){
            if(repLast[st.id]==null||now()-repLast[st.id]>=REP_COOLDOWN){repLast[st.id]=now();fireStep(st,mode);return;}
          }else{fired[st.id]=true;fireStep(st,mode);return;}
        }
      }else hold[st.id]=null;
      continue;
    }
    if(st.repeat){
      if(v&&!rPrev&&(repLast[st.id]==null||now()-repLast[st.id]>=REP_COOLDOWN)){
        repLast[st.id]=now();fireStep(st,mode);return;
      }
      continue;
    }
    if(v){fired[st.id]=true;fireStep(st,mode);return;}
  }
}
/* errors：电平触发可重复，同一条 5s 内不重播（§6.6）；@Ns=持续满足才触发，中断清零 */
function tickErrors(mode){
  var md=DATA&&DATA[mode];if(!md||!md.errors)return;
  for(var i=0;i<md.errors.length;i++){
    var er=md.errors[i];
    var p=parseTrigger(er.trigger);
    if(!p||p.evt||p.expr==null)continue;/* 事件类由 bindEventTriggers 处理 */
    var v=evalParsed(p);
    if(p.holdMs){
      if(v){
        if(hold[er.id]==null)hold[er.id]=now();
        else if(now()-hold[er.id]>=p.holdMs){
          hold[er.id]=null;
          if(throttle(errLast,er.id,5000))fireError(er);
        }
      }else hold[er.id]=null;
      continue;
    }
    if(v&&throttle(errLast,er.id,5000))fireError(er);
  }
}
/* free：边沿+节流，同类 ≥8s 不重播 */
function tickFree(mode){
  var md=DATA&&DATA[mode];if(!md||!md.free)return;
  for(var i=0;i<md.free.length;i++){
    var fr=md.free[i];
    var key=mode+'#'+i;
    var p=parseTrigger(fr.trigger);
    if(!p||p.evt||p.expr==null)continue;
    var v=evalParsed(p);
    if(v&&!freePrev[key]){
      if(throttle(freeLast,key,fr.cooldown||8000))fireFree(fr);/* EG3b：free 可选 cooldown，缺省 8000 */
    }
    freePrev[key]=v;
  }
}
/* 事件类 trigger：capture 阶段即时判定（先于 core 的 bubble 处理器，读到点击前状态），不拦截原逻辑 */
/* EG3c：用户动作到来 → 立即作废在途 after/delay 定时器与 hold 计时，
   杜绝「点完按钮等几秒才播报 / 旧结论把新动作语音顶掉」。逻辑与 onModeEnter 前半段同源。 */
function clearPendingSchedules(){
  for(var k in stepSched){if(stepSched[k]!=null){clearTimeout(stepSched[k]);stepSched[k]=null;}}
  for(var h in hold)hold[h]=null;
}
function bindEventTriggers(){
  function bind(elSel,evt){
    var el=document.querySelector(elSel);
    if(!el)return;
    el.addEventListener(evt,function(){
      if(!curMode)return;
      var md=DATA&&DATA[curMode];if(!md)return;
      if(md.errors)md.errors.forEach(function(er){
        var p=parseTrigger(er.trigger);
        if(!p||p.evt!==evt||p.el!==elSel)return;
        var ok=(p.expr==null)?true:evalParsed(p);
        if(ok&&throttle(errLast,er.id,5000)){clearPendingSchedules();fireError(er);}
      });
      /* 通用版增补（c4s4 设计书 §5.1-2 发现的阻塞缺陷）：事件回调原来只发 errors/free 不发 steps，
         event:input:#slider-i 型步骤会永不触发。repeat 步走 repLast+EVT_DEBOUNCE 去抖（EG3a：事件型秒响，
         500ms 只防连点双触发；电平型 repeat 仍走 tickSteps 的 REP_COOLDOWN），
         非 repeat 步走 firedSteps 一次性闸门。 */
      if(md.steps)md.steps.forEach(function(st){
        var p=parseTrigger(st.trigger);
        if(!p||p.evt!==evt||p.el!==elSel)return;
        var ok=(p.expr==null)?true:evalParsed(p);
        if(!ok)return;
        if(st.repeat){
          if(repLast[st.id]!=null&&now()-repLast[st.id]<EVT_DEBOUNCE)return;
          clearPendingSchedules();
          repLast[st.id]=now();fireStep(st,curMode);
        }else{
          var fm=firedSteps[curMode]||(firedSteps[curMode]={});
          if(fm[st.id])return;
          clearPendingSchedules();
          fm[st.id]=true;fireStep(st,curMode);
        }
      });
      if(md.free)md.free.forEach(function(fr,idx){
        var p=parseTrigger(fr.trigger);
        if(!p||p.evt!==evt||p.el!==elSel)return;
        var key=curMode+'#'+idx;
        var ok=(p.expr==null)?true:evalParsed(p);
        /* EG3b：free 条目可选 cooldown:<毫秒>，缺省 8000 */
        if(ok&&throttle(freeLast,key,fr.cooldown||8000)){clearPendingSchedules();fireFree(fr);}
      });
    },true);
  }
  /* 通用版：扫描 DATA 里所有事件型 trigger，按 (选择器,事件) 去重后逐一绑定，
     不再硬编码 c4_s3 的 #btn-rec/#obj-slider。宿主实验的 event:input:#slider-i 等自动生效。 */
  var seen={};
  for(var m in DATA){
    var md=DATA[m];
    if(!md)continue;
    [md.errors,md.free,md.steps].forEach(function(arr){
      if(!arr)return;
      arr.forEach(function(item){
        var p=item&&item.trigger?parseTrigger(item.trigger):null;
        if(!p||!p.evt||!p.el)return;
        var key=p.el+'|'+p.evt;
        if(seen[key])return;
        seen[key]=true;
        bind(p.el,p.evt);
      });
    });
  }
}

/* ---------- 模式切换（轮询 R.mode 变化沿） ---------- */
/* r4：按模式清全部 step id 的 repeat 计数/电平（step id 全局唯一，跨模式不残留） */
function clearRepeatState(){
  if(!DATA)return;
  for(var m in DATA){
    var md=DATA[m];
    if(!md||!md.steps)continue;
    for(var i=0;i<md.steps.length;i++){
      var id=md.steps[i].id;
      delete fireCount[id];delete seenCount[id];delete repPrev[id];delete repLast[id];delete delayFired[id];
    }
  }
}
function onModeEnter(mode){
  curMode=mode;
  G.modeEnterT=now();
  if(mode==='m1'&&R&&R.doCm!=null)G.do0=R.doCm;
  clearPendingSchedules();/* EG3c 复用：清在途 stepSched 定时器 + hold */
  /* EG4b：切模式即清节流状态，防旧 error/free 跨模式续播重播（repLast 由 clearRepeatState 一并 delete） */
  errLast={};freeLast={};freePrev={};
  var api0=getApi();
  if(api0.onStop)api0.onStop();/* EG4b：立即静音+字幕撤下，须在 fireIntro 之前，否则会掐掉新模式 intro */
  clearRepeatState();/* r4：清全部模式 step 的 fireCount/seenCount/repPrev/repLast，delay 型重进模式可重发 */
  var md=DATA&&DATA[mode];
  if(md&&md.intro)fireIntro(mode,md.intro);
  if(tasksOn)resetTasks(mode);
  var api=getApi();
  if(api.onModeChange)api.onModeChange(mode);
}

/* ---------- EG4c【接口契约2】子场景切换公共 API（不重发 intro、不清 firedSteps/fireCount） ---------- */
window.GUIDE_SCENE={
  change:function(){
    var api=getApi();
    if(api.onStop)api.onStop();          /* 立即静音 + 字幕条撤下 */
    clearPendingSchedules();             /* 作废在途 after/delay 定时器 + hold 计时 */
    errLast={};freeLast={};freePrev={};  /* 清节流：旧 error/free 不带进新子场景 */
    for(var id in repLast)delete repLast[id];/* repeat 冷却一并清，新子场景首次动作秒响 */
    G.modeEnterT=now();
  }
};

/* ---------- 任务链（A 版）：engine 持有进度，皮肤只渲染+转发作答 ---------- */
function resetTasks(mode){
  taskState={idx:0,done:false,allDone:false,answered:{},wrongPick:{}};
  var api=getApi();
  if(api.onTaskReset)api.onTaskReset(mode);
}
function curTask(){
  var md=DATA&&DATA[curMode];
  if(!md||!md.tasks||taskState.allDone)return null;
  if(taskState.idx>=md.tasks.length)return null;
  return md.tasks[taskState.idx];
}
function completeTask(t){
  if(taskState.done)return;
  taskState.done=true;
  var api=getApi();
  if(api.onTaskDone)api.onTaskDone(t);
  setTimeout(function(){
    var md=DATA&&DATA[curMode];
    if(!md||!md.tasks)return;
    taskState.idx++;
    taskState.done=false;
    if(taskState.idx>=md.tasks.length){
      taskState.allDone=true;
      if(api.onAllTasksDone)api.onAllTasksDone(curMode);
    }else{
      if(api.onTaskProgress)api.onTaskProgress(taskState.idx,md.tasks.length);
    }
  },2200);
}
function tickTasks(){
  if(!tasksOn)return;
  var t=curTask();
  if(!t||taskState.done)return;
  if(t.stage==='predict'){
    /* 预测题：答对后才轮询 done（操作印证），答错不推进 */
    if(taskState.answered[t.id]&&evalExprStr(t.done))completeTask(t);
    return;
  }
  if(evalExprStr(t.done))completeTask(t);
}
function taskAnswer(i){
  var t=curTask();
  if(!t||t.stage!=='predict'||taskState.done||taskState.answered[t.id])return;
  var api=getApi();
  if(i===t.answer){
    taskState.answered[t.id]=true;
    if(evalExprStr(t.done))completeTask(t);
  }else{
    if(taskState.wrongPick[t.id].indexOf(i)<0)taskState.wrongPick[t.id].push(i);
    if(api.onTaskFail)api.onTaskFail(t,i);
  }
}
/* 初始化 wrongPick 默认值 */
function ensureWrong(t){if(t&&!taskState.wrongPick[t.id])taskState.wrongPick[t.id]=[];}

/* ---------- 主循环 ---------- */
function tick(){
  if(!loopOn)return;
  if(R){
    updateG();
    var mode=(window.GUIDE_CFG&&window.GUIDE_CFG.mode)||(R&&R.mode);
    if(mode&&mode!==curMode)onModeEnter(mode);
    if(curMode){
      tickSteps(curMode);
      /* everMatched 须在 steps 边沿判定之后置位，否则 m1-s5（!G.everMatched）永远不触发 */
      if(R.matched)G.everMatched=true;
      tickErrors(curMode);
      tickFree(curMode);
      var ct=curTask();ensureWrong(ct);
      tickTasks();
    }
  }
  requestAnimationFrame(tick);
}

/* ---------- 共享字幕条组件（vD/vB/vC 复用；kind: step|error|free|intro） ---------- */
function Caption(){
  var layer=document.getElementById('guide-layer')||document.body;
  var bar=document.createElement('div');
  bar.className='guide-caption';
  bar.innerHTML='<span class="guide-caption-avatar">🎓</span><span class="guide-caption-text"></span>';
  bar.style.display='none';
  layer.appendChild(bar);
  var txt=bar.querySelector('.guide-caption-text');
  var cur=null,timer=null;
  function bottomOff(){
    var cb=document.querySelector('.ctrlbar');
    return cb?Math.round(cb.getBoundingClientRect().height)+8:104;
  }
  function hide(){
    if(timer){clearTimeout(timer);timer=null;}
    cur=null;
    bar.classList.remove('show');
    setTimeout(function(){if(!cur)bar.style.display='none';},260);
  }
  function show(text,kind,audioId){
    if(timer){clearTimeout(timer);timer=null;}
    bar.classList.remove('err','shake','show');
    void bar.offsetWidth;/* 强制 reflow，重放入场动画与抖动 */
    txt.textContent=text;
    bar.style.display='flex';
    bar.style.bottom=bottomOff()+'px';
    if(kind==='error'){bar.classList.add('err','shake');}
    bar.classList.add('show');
    var dur=Math.max(4000,text.length*280);
    cur={text:text,kind:kind,audioId:audioId||null,until:now()+dur};
    timer=setTimeout(hide,dur);
  }
  window.addEventListener('resize',function(){if(cur)bar.style.bottom=bottomOff()+'px';});
  return {show:show,hide:hide,isIdle:function(){return !cur;},el:bar};
}

/* ---------- 对外 API ---------- */
window.GuideEngine={
  init:function(variantApi,opts){
    opts=opts||{};
    apiRef=variantApi||{};
    tasksOn=!!opts.tasks;
    resetG();
    firedSteps={};hold={};errLast={};freeLast={};freePrev={};stepSched={};
    repPrev={};repLast={};fireCount={};seenCount={};delayFired={};/* r4：repeat 状态；r6：delayFired */
    recCache={n:-1,t:0};
    taskState={idx:0,done:false,allDone:false,answered:{},wrongPick:{}};
    bindEventTriggers();
    if(!loopOn){loopOn=true;requestAnimationFrame(tick);}
  },
  Caption:Caption,
  getG:function(){return G;},
  getMode:function(){return curMode;},
  getTaskState:function(){return taskState;},
  curTask:curTask,
  taskAnswer:taskAnswer,
  evalExpr:evalExprStr
};
})();

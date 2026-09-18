/* exp-scope.js — 示波器波形：预设频率按钮(110/220/440/880) + 真实音叉采样变调播放
   波形为示意图：显示窗口固定 1/55 秒，周期数按频率真实比例（110Hz→2 个，880Hz→16 个） */
(function(){
  'use strict';
  var DW = 640, cv = document.getElementById('scopeCv'), ctx = cv.getContext('2d');
  var W = 640, H = 320, k = 1;
  var PRESETS = [110, 220, 440, 880];
  var WIN_HZ = 55;                       /* 显示窗口基频：cycles = selHz / WIN_HZ */
  var selHz = 440, isPlaying = false, predicted = false;
  var phase = 0, lastT = performance.now(), playT0 = 0;
  var bases = [220, 440, 880];
  var srcMap = { 220:'assets/audio/fork-220.m4a', 440:'assets/audio/fork-a4-440.m4a', 880:'assets/audio/fork-880.m4a' };
  var audioEl = null;

  function resize(){ var f = fitCanvas(cv, getCssH(cv)); ctx = f.ctx; W = f.w; H = parseFloat(cv.style.height) || f.h; k = W / DW; draw(); }
  function nearestBase(hz){ var best = bases[0]; for(var i = 1; i < bases.length; i++) if(Math.abs(hz - bases[i]) < Math.abs(hz - best)) best = bases[i]; return best; }
  function ensureAudio(){
    if(audioEl) return audioEl;
    audioEl = new Audio();
    audioEl.crossOrigin = 'anonymous'; audioEl.preload = 'auto'; audioEl.loop = true;
    audioEl.preservesPitch = false;      /* 变调必须关保音高，否则 playbackRate 只变速不变调 */
    audioEl.src = srcMap[nearestBase(selHz)];
    audioEl.load();
    return audioEl;
  }
  function play(hz){
    var el = ensureAudio(), base = nearestBase(hz), src = srcMap[base];
    if(el.src.indexOf(src) === -1){ el.src = src; }
    el.playbackRate = Math.max(0.25, Math.min(4, hz / base)); /* 110Hz → fork-220 ×0.5，音高与所选频率一致 */
    try { el.currentTime = 0; } catch(e){}
    el.play().catch(function(){});
    if(!isPlaying) playT0 = performance.now();
    isPlaying = true; updateUI();
  }
  function stop(){ if(audioEl){ audioEl.pause(); try { audioEl.currentTime = 0; } catch(e){} } isPlaying = false; updateUI(); }
  function updateReadout(){
    document.getElementById('countVal').textContent = selHz;
    document.getElementById('hzVal').textContent = selHz;
  }
  function updateUI(){
    var playBtn = document.getElementById('playBtn');
    if(playBtn) playBtn.textContent = isPlaying ? '▶ 播放中' : '▶ 播放';
    var btns = document.querySelectorAll('#freqBtns .freq-btn');
    for(var i = 0; i < btns.length; i++) btns[i].classList.toggle('active', +btns[i].dataset.hz === selHz);
  }
  function draw(){
    ctx.fillStyle = '#1a1f26'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(108,138,108,0.22)'; ctx.lineWidth = 1 * k;
    for(var gx = 0; gx <= W; gx += W / 10){ ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for(var gy = 0; gy <= H; gy += H / 6){ ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(108,138,108,0.45)'; ctx.lineWidth = 1.2 * k;
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    /* 播放中：正弦波按频率比例周期数相位滚动；未播放：一条直线 */
    ctx.strokeStyle = '#7ee787'; ctx.lineWidth = 2.2 * k; ctx.lineJoin = 'round'; ctx.beginPath();
    if(isPlaying){
      var cycles = selHz / WIN_HZ;
      var pts = Math.max(512, Math.ceil(cycles * 64));
      var el = (performance.now() - playT0) / 1000;
      var env = Math.min(1, el * 6) * (0.88 + 0.12 * Math.sin(el * 8));
      for(var i = 0; i <= pts; i++){
        var x = i / pts * W;
        var y = H / 2 - Math.sin(2 * Math.PI * (cycles * i / pts + phase * cycles)) * H * 0.42 * env;
        if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
    }else{
      ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
    }
    ctx.stroke();
    ctx.font = 'bold ' + (12 * k) + 'px sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#6c8a6c';
    ctx.fillText(selHz + ' Hz · ' + (isPlaying ? 'PLAY' : 'STOP'), 12 * k, 24 * k);
  }

  /* 预设频率按钮组 */
  var freqBtns = document.querySelectorAll('#freqBtns .freq-btn');
  for(var b = 0; b < freqBtns.length; b++){
    freqBtns[b].addEventListener('click', function(){
      selHz = +this.dataset.hz;
      updateReadout(); updateUI(); draw();
      if(isPlaying) play(selHz);   /* 播放中切换 → 音高跟随 */
    });
  }
  document.getElementById('playBtn').addEventListener('click', function(){ play(selHz); });
  document.getElementById('stopBtn').addEventListener('click', stop);

  /* 动画主循环：播放中相位滚动，频率越高滚得越快 */
  function loop(){
    var now = performance.now(), dt = (now - lastT) / 1000; lastT = now;
    if(isPlaying){ phase = (phase + dt * (0.25 + selHz / 880 * 0.75)) % 1; }
    draw();
    requestAnimationFrame(loop);
  }

  var predDense = document.getElementById('predDense'), predSparse = document.getElementById('predSparse');
  var predFb = document.getElementById('predFb'), conclusionBox = document.getElementById('conclusionBox');
  predDense.addEventListener('click', function(){ predicted = true; predFb.className = 'feedback ok show'; predFb.innerHTML = '✅ 正确！高频振动快，波形更密。点 <b>880 Hz</b> 和 <b>110 Hz</b> 对比验证吧。'; conclusionBox.classList.add('show'); });
  predSparse.addEventListener('click', function(){ predicted = true; predFb.className = 'feedback err show'; predFb.textContent = '❌ 再想想：频率高意味着 1 秒内振动次数更多，波形应该更密集。'; });

  /* 返回按钮来源感知：无 ?from= 时（exp-back.js 优先处理 ?from=），referrer 同目录且为 explain/experiment → 指回来源页，否则 index.html */
  (function initBack(){
    try{
      var params = new URLSearchParams(window.location.search);
      if(params.get('from')) return;
      var back = document.querySelector('a[data-back]'); if(!back) return;
      var target = 'index.html', ref = document.referrer;
      if(ref){
        var a = document.createElement('a'); a.href = ref;
        var name = a.pathname.split('/').pop();
        var sameDir = a.pathname.replace(/[^/]*$/, '') === window.location.pathname.replace(/[^/]*$/, '');
        if(a.origin === window.location.origin && sameDir && (name === 'explain.html' || name === 'experiment.html')) target = name;
      }
      back.setAttribute('href', target);
    }catch(e){}
  })();

  FullscreenHelper.bind(document.getElementById('fsScopeWrap'), document.getElementById('fsScopeBtn'), resize);
  window.addEventListener('resize', resize);
  updateReadout(); updateUI(); resize(); requestAnimationFrame(loop);
})();

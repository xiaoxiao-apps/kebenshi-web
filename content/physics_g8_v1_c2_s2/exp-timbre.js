/* exp-timbre.js — 音色对比：同音 do 三波形同屏 + 盲辨
   波形为平滑谐波叠加：音叉=纯正弦；钢琴=基频+2/3/4次谐波递减；长笛=基频为主+少量2次谐波。
   活体示波：点击播放时对应波形滚动晃动（相位滚动+振幅包络），声音停止后回落成一条直线。 */
(function(){
  'use strict';
  var DW = 640, cv = document.getElementById('timbreCv'), ctx = cv.getContext('2d');
  var W = 640, H = 360, k = 1;
  var current = '', playing = false, playT0 = 0, phase = 0, lastT = performance.now();
  var guessCount = 0, conclusionShown = false, hiddenInst = '';
  var names = {fork:'音叉', piano:'钢琴', flute:'长笛'};
  var colors = {fork:'#7ee787', piano:'#7ec8e7', flute:'#e7c87e'};
  var order = ['fork', 'piano', 'flute'];
  var CYCLES = 4;                          /* 同屏 4 个周期，三条波疏密相同 */
  var PTS = CYCLES * 64;                   /* 每周期 64 采样点，保证平滑 */

  function shapeFn(inst){
    if(inst === 'piano'){
      return function(t){ var a = 2 * Math.PI * CYCLES * t;
        return Math.sin(a) + 0.5 * Math.sin(2 * a + 0.6) + 0.3 * Math.sin(3 * a + 1.1) + 0.18 * Math.sin(4 * a + 1.7); };
    }
    if(inst === 'flute'){
      return function(t){ var a = 2 * Math.PI * CYCLES * t;
        return Math.sin(a) + 0.18 * Math.sin(2 * a + 2.2); };
    }
    return function(t){ return Math.sin(2 * Math.PI * CYCLES * t); }; /* 音叉：纯正弦 */
  }
  function peakOf(f){ var p = 0; for(var i = 0; i <= PTS; i++){ var v = Math.abs(f(i / PTS)); if(v > p) p = v; } return p || 1; }

  var audioEl = null;
  function ensureAudio(){
    if(audioEl) return audioEl;
    audioEl = new Audio();
    audioEl.crossOrigin = 'anonymous'; audioEl.preload = 'auto';
    audioEl.addEventListener('ended', function(){          /* 声音停了 → 回落直线 */
      playing = false; current = ''; updateButtons();
    });
    return audioEl;
  }
  function play(inst, src){
    var el = ensureAudio();
    el.pause(); el.src = src; el.load(); el.currentTime = 0;
    el.play().catch(function(){});
    current = inst; playing = true; playT0 = performance.now();
    updateButtons();
  }
  function updateButtons(){
    document.getElementById('nowVal').textContent = current ? names[current] : '—';
    var bs = document.querySelectorAll('.inst-btns .btn');
    for(var i = 0; i < bs.length; i++) bs[i].classList.toggle('active', bs[i].dataset.inst === current);
    draw();
  }

  function resize(){ var f = fitCanvas(cv, getCssH(cv)); ctx = f.ctx; W = f.w; H = parseFloat(cv.style.height) || f.h; k = W / DW; draw(); }
  function drawBand(y, h, inst){
    var mid = y + h / 2;
    ctx.strokeStyle = colors[inst]; ctx.lineWidth = 2.2 * k; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if(inst === current && playing){                        /* 活体波形：相位滚动 + 振幅包络 */
      var f = shapeFn(inst), peak = peakOf(f);
      var el = (performance.now() - playT0) / 1000;
      var env = Math.min(1, el * 6) * (0.88 + 0.12 * Math.sin(el * 9));
      ctx.beginPath();
      for(var i = 0; i <= PTS; i++){
        var t = i / PTS, x = t * W;
        var yy = mid - (f(t + phase) / peak) * h * 0.42 * env;
        if(i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }else{                                                  /* 未发声：一条直线 */
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
    }
    ctx.font = 'bold ' + (12 * k) + 'px sans-serif'; ctx.textAlign = 'left';
    ctx.fillStyle = colors[inst];
    ctx.fillText(names[inst] + (current === inst && playing ? ' · 播放中' : ''), 10 * k, y + 18 * k);
  }
  function draw(){
    ctx.fillStyle = '#1a1f26'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(108,138,108,0.22)'; ctx.lineWidth = 1 * k;
    for(var gx = 0; gx <= W; gx += W / 10){ ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for(var gy = 0; gy <= H; gy += H / 6){ ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(108,138,108,0.45)'; ctx.lineWidth = 1 * k;
    var bh = H / 3;
    for(var s = 1; s <= 2; s++){ ctx.beginPath(); ctx.moveTo(0, bh * s); ctx.lineTo(W, bh * s); ctx.stroke(); }
    for(var i = 0; i < order.length; i++) drawBand(bh * i, bh, order[i]);
  }
  function loop(){
    var now = performance.now(), dt = (now - lastT) / 1000; lastT = now;
    if(playing){ phase = (phase + dt * 0.55) % 1; }         /* 滚动速度 ≈2.2 周期/秒 */
    draw();
    requestAnimationFrame(loop);
  }

  var instBtns = document.querySelectorAll('.inst-btns .btn');
  for(var i = 0; i < instBtns.length; i++){
    instBtns[i].addEventListener('click', function(){ play(this.dataset.inst, this.dataset.src); });
  }
  document.getElementById('randomBtn').addEventListener('click', function(){
    var keys = Object.keys(names), r = keys[Math.floor(Math.random() * keys.length)]; hiddenInst = r;
    var fb = document.getElementById('guessFb'); fb.className = 'feedback info show'; fb.textContent = '🔊 已随机播放，请从下面选择。';
    play(r, document.querySelector('[data-inst="' + r + '"]').dataset.src);
  });
  var guessBtns = document.querySelectorAll('[data-guess]');
  for(var g = 0; g < guessBtns.length; g++){
    guessBtns[g].addEventListener('click', function(){
      var fb = document.getElementById('guessFb');
      if(!hiddenInst){ fb.className = 'feedback err show'; fb.textContent = '❌ 先点击「随机播放」再猜。'; return; }
      guessCount++; document.getElementById('guessVal').textContent = guessCount + '/2';
      var ok = this.dataset.guess === hiddenInst;
      if(ok){ fb.className = 'feedback ok show'; fb.innerHTML = '✅ 猜对！是 <b>' + names[hiddenInst] + '</b>。波形疏密相同、形状不同。'; }
      else { fb.className = 'feedback err show'; fb.innerHTML = '❌ 是 <b>' + names[hiddenInst] + '</b>。再听一次，注意波形形状。'; }
      hiddenInst = '';
      if(guessCount >= 2 && !conclusionShown){ conclusionShown = true; document.getElementById('conclusionBox').classList.add('show'); }
    });
  }

  /* 返回按钮来源感知：无 ?from= 时，referrer 同目录且为 explain/experiment → 指回来源页，否则 index.html */
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

  FullscreenHelper.bind(document.getElementById('fsTimbreWrap'), document.getElementById('fsTimbreBtn'), resize);
  window.addEventListener('resize', resize);
  resize(); requestAnimationFrame(loop);
})();

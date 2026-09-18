/* exp-loudness.js — 响度与振幅：音叉弹乒乓球 + 距离衰减
   音频方案：页面加载即 fetch + decodeAudioData 预解码为 AudioBuffer，
   首次手势 resume AudioContext 常驻，敲击用 BufferSource.start(0) 零延迟出声。 */
(function(){
  'use strict';
  var DW = 640, cv = document.getElementById('loudCv'), ctx = cv.getContext('2d');
  var W = 640, H = 360, k = 1, t0 = performance.now();

  /* ---------- 音频：预解码缓存 ---------- */
  /* 轻敲也用重敲采样（原 fork-2 文件带 3.5s 前导静音导致延迟），仅用更低音量区分 */
  var HARD_SRC = 'assets/audio/fork-a4-440hz-1.mp3',
      LIGHT_SRC = 'assets/audio/fork-a4-440hz-1.mp3';
  var audioCtx = null, buffers = { hard: null, light: null },
      curSrc = null, curGain = null, curMul = 1;
  function ensureCtx(){
    if(audioCtx) return audioCtx;
    var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null;
    try { audioCtx = new AC(); } catch(e){ audioCtx = null; }
    return audioCtx;
  }
  function preloadAudio(){
    var ac = ensureCtx(); if(!ac) return;
    [['hard', HARD_SRC], ['light', LIGHT_SRC]].forEach(function(pair){
      if(buffers[pair[0]]) return;
      fetch(pair[1]).then(function(r){
        if(!r.ok) throw new Error('HTTP ' + r.status);
        return r.arrayBuffer();
      }).then(function(ab){
        return new Promise(function(res, rej){ ac.decodeAudioData(ab, res, rej); });
      }).then(function(buf){ buffers[pair[0]] = buf; }).catch(function(){});
    });
  }
  function distGain(){ return Math.min(1.1 / Math.pow(dist, 0.7), 1); }
  function stopCurrent(){
    if(curSrc){ try{ curSrc.onended = null; curSrc.stop(0); }catch(e){} try{ curSrc.disconnect(); }catch(e){} curSrc = null; }
    if(curGain){ try{ curGain.disconnect(); }catch(e){} curGain = null; }
  }
  function playBuffer(key, mul){
    var ac = ensureCtx(); if(!ac) return;
    if(ac.state === 'suspended') ac.resume().catch(function(){});
    curMul = mul;
    var buf = buffers[key];
    if(!buf){ /* 预解码尚未完成时的兜底：临时 Audio 元素播放一次 */
      preloadAudio();
      var el = new Audio(key === 'hard' ? HARD_SRC : LIGHT_SRC);
      el.volume = Math.min(distGain() * mul, 1);
      el.play().catch(function(){});
      return;
    }
    stopCurrent();
    var src = ac.createBufferSource(); src.buffer = buf;
    var g = ac.createGain(); g.gain.value = Math.min(distGain() * mul, 1);
    src.connect(g); g.connect(ac.destination);
    curSrc = src; curGain = g;
    src.onended = function(){ if(curSrc === src){ curSrc = null; curGain = null; } };
    src.start(0); /* 立即出声 */
  }

  /* ---------- 状态 ---------- */
  var amp = 0, phaseSpd = 0, curForce = '', dist = 2, tried = new Set(), unlocked = false;

  function play(force, maxAmp, mul){
    curForce = force; amp = maxAmp; phaseSpd = 24; t0 = performance.now();
    playBuffer(force === '重敲' ? 'hard' : 'light', mul);
    tried.add(force); updateReadout();
  }
  function updateReadout(){
    document.getElementById('forceVal').textContent = curForce || '—';
    document.getElementById('tryVal').textContent = tried.size + '/2';
    if(tried.size >= 2 && !unlocked){ unlocked = true; document.getElementById('findCard').style.display = 'block'; }
  }

  /* ---------- 画布：音叉 + 乒乓球 ---------- */
  function resize(){ var f = fitCanvas(cv, getCssH(cv)); ctx = f.ctx; W = f.w; H = parseFloat(cv.style.height) || f.h; k = W / DW; draw(); updatePerson(); }
  function draw(){
    var now = (performance.now() - t0) / 1000;
    if(amp > 0){ amp *= 0.97; phaseSpd *= 0.98; if(amp < 0.3){ amp = 0; phaseSpd = 0; } }
    var forkX = W * 0.35, baseY = H * 0.72, stemH = H * 0.26, prongH = H * 0.38, gap = 18 * k;
    var swing = Math.sin(now * phaseSpd) * amp * k;
    /* 纸质暖色背景 */
    ctx.fillStyle = '#f7f3e8'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#efe7d3'; ctx.fillRect(0, H - 30 * k, W, 30 * k);
    ctx.strokeStyle = '#d9c9a3'; ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.moveTo(0, H - 30 * k); ctx.lineTo(W, H - 30 * k); ctx.stroke();
    /* 音叉底座 */
    ctx.fillStyle = '#8b7d6b'; ctx.fillRect(forkX - 26 * k, baseY, 52 * k, stemH);
    /* 叉股 */
    ctx.strokeStyle = '#6b6558'; ctx.lineWidth = 10 * k; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(forkX - gap / 2 + swing, baseY); ctx.lineTo(forkX - gap / 2 + swing, baseY - prongH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(forkX + gap / 2 - swing, baseY); ctx.lineTo(forkX + gap / 2 - swing, baseY - prongH); ctx.stroke();
    /* 悬线 + 乒乓球 */
    var ballX = forkX + gap / 2 + 10 * k + swing, ballY = baseY - prongH * 0.55;
    var kick = (curForce === '重敲') ? amp * 3.2 * k : amp * 1.2 * k;
    var ballR = 14 * k, disp = swing + kick;
    ctx.strokeStyle = '#7a6a58'; ctx.lineWidth = 1.5 * k;
    ctx.beginPath(); ctx.moveTo(forkX + gap / 2 + 10 * k, baseY - prongH); ctx.lineTo(ballX + disp, ballY); ctx.stroke();
    ctx.fillStyle = '#ff9f43'; ctx.beginPath(); ctx.arc(ballX + disp, ballY, ballR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e67e22'; ctx.lineWidth = 2 * k; ctx.stroke();
    ctx.font = 'bold ' + (13 * k) + 'px sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#555';
    ctx.fillText('音叉 + 乒乓球', 12 * k, 24 * k);
    if(curForce){ ctx.fillStyle = curForce === '重敲' ? '#c0392b' : '#2980b9'; ctx.fillText(curForce + ' · 振幅 ' + Math.round(amp), 12 * k, 44 * k); }
    if(dist > 6){ ctx.fillStyle = '#555'; ctx.fillText('距离发声体越远，听到的声音越小', 12 * k, H - 14 * k); }
  }

  /* ---------- 人物：距离滑块 → 水平位置（大小不变） ---------- */
  var personSvg = document.getElementById('personSvg'),
      personTrack = document.getElementById('personTrack');
  function updatePerson(){
    if(!personSvg || !personTrack) return;
    var ratio = (dist - 1) / 9; /* 0=最近 1=最远 */
    var trackW = personTrack.clientWidth || 0;
    /* SVG 元素没有 offsetWidth（非 HTMLElement），用计算样式宽度 */
    var svgW = parseFloat(getComputedStyle(personSvg).width) || 0;
    var span = Math.max((trackW - svgW) / 2, 0);
    var off = (ratio * 2 - 1) * span; /* 近=靠左贴近音叉，远=靠右 */
    personSvg.style.transform = 'translateX(' + off.toFixed(1) + 'px)';
    personSvg.style.opacity = (1 - ratio * 0.2).toFixed(3);
  }
  if(personTrack && typeof ResizeObserver !== 'undefined'){
    new ResizeObserver(function(){ updatePerson(); }).observe(personTrack);
  }

  /* ---------- 事件 ---------- */
  document.getElementById('lightBtn').addEventListener('click', function(){ play('轻敲', 16, 0.5); });
  document.getElementById('hardBtn').addEventListener('click', function(){ play('重敲', 42, 1); });
  var distSlider = document.getElementById('distSlider'), distVal = document.getElementById('distVal');
  distSlider.addEventListener('input', function(){
    dist = +this.value; distVal.textContent = dist + ' m';
    if(curGain) curGain.gain.value = Math.min(distGain() * curMul, 1);
    updatePerson();
  });
  document.getElementById('checkBtn').addEventListener('click', function(){
    var w1 = document.getElementById('w1').value, w2 = document.getElementById('w2').value, fb = document.getElementById('findFb');
    if(w1 === '振幅' && w2 === '振幅'){ fb.className = 'feedback ok show'; fb.textContent = '✅ 回答正确！'; document.getElementById('answerBox').style.display = 'block'; }
    else { fb.className = 'feedback err show'; fb.textContent = '❌ 再想想：乒乓球被弹开幅度反映的是振动幅度。'; }
  });
  function loop(){ draw(); requestAnimationFrame(loop); }

  /* ---------- 初始化：预加载音频 + 首次手势常驻 resume ---------- */
  preloadAudio();
  document.addEventListener('pointerdown', function unlockOnce(){
    document.removeEventListener('pointerdown', unlockOnce, true);
    var ac = ensureCtx();
    if(ac && ac.state === 'suspended') ac.resume().catch(function(){});
  }, true);

  FullscreenHelper.bind(document.getElementById('fsLoudWrap'), document.getElementById('fsLoudBtn'), resize);
  window.addEventListener('resize', resize);
  updatePerson(); updateReadout(); resize(); requestAnimationFrame(loop);
})();

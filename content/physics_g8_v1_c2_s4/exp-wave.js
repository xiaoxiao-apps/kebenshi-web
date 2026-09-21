/* exp-wave.js — 观察噪声的波形：示波器动画，规则正弦 vs 杂乱噪声 */
(function(){
  'use strict';
  var cv = document.getElementById('waveCv'), ctx;
  var DW = 640, W, H, k;
  var stopBtn = document.getElementById('stopBtn');
  var sourceBtns = document.querySelectorAll('[data-source]');
  var source = null, rafId = null, phase = 0, amp = 0.85;
  var audioCtx = null, masterGain = null, oscNode = null, noiseNode = null;
  var noiseBuf = null, noiseLen = 2;

  function initAudio(){
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (!masterGain) { masterGain = audioCtx.createGain(); masterGain.connect(audioCtx.destination); }
  }

  function createNoiseBuffer(){
    if (noiseBuf) return;
    var sr = audioCtx.sampleRate, n = sr * noiseLen;
    noiseBuf = audioCtx.createBuffer(1, n, sr);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }

  function stopSound(){
    if (oscNode) { try { oscNode.stop(); oscNode.disconnect(); } catch(e){} oscNode = null; }
    if (noiseNode) { try { noiseNode.stop(); noiseNode.disconnect(); } catch(e){} noiseNode = null; }
    if (masterGain) masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);
  }

  function startSound(name){
    initAudio(); createNoiseBuffer();
    stopSound();
    if (name === 'tuning') {
      oscNode = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      oscNode.type = 'sine'; oscNode.frequency.value = 440;
      g.gain.value = 0.18;
      oscNode.connect(g); g.connect(masterGain);
      oscNode.start();
      masterGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.02);
    } else if (name === 'noise') {
      noiseNode = audioCtx.createBufferSource();
      var g = audioCtx.createGain();
      noiseNode.buffer = noiseBuf; noiseNode.loop = true;
      g.gain.value = 0.25;
      noiseNode.connect(g); g.connect(masterGain);
      noiseNode.start();
      masterGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.02);
    }
  }

  function resize(){ var f = fitCanvas(cv, 340); ctx = f.ctx; W = f.w; H = f.h; k = W / DW; drawBase(); }

  function drawGrid(){
    ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i <= 8; i++){ var y = H * i / 8; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    for (var j = 0; j <= 10; j++){ var x = W * j / 10; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
  }

  function drawBase(){
    ctx.fillStyle = '#0b1d2e'; ctx.fillRect(0, 0, W, H);
    drawGrid();
    if (!source) {
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2 * k;
      ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
    }
    ctx.fillStyle = '#fff'; ctx.font = 'bold ' + (12 * k) + 'px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('图 2.4-1 噪声的波形（示意）', 12 * k, 22 * k);
  }

  function sampleSine(t){ return Math.sin(t * Math.PI * 2) * amp; }
  function sampleNoise(t){ return (Math.random() - 0.5) * 2 * amp; }

  function drawWave(){
    ctx.strokeStyle = source === 'tuning' ? '#4ade80' : '#f87171';
    ctx.lineWidth = 2 * k; ctx.beginPath();
    var points = Math.floor(W / (2 * k));
    for (var i = 0; i <= points; i++){
      var x = i / points * W, t = (phase + i / points * 2) % 1;
      var y = H/2 - (source === 'tuning' ? sampleSine(t) : sampleNoise(t)) * H * 0.35;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function drawFrame(){
    drawBase();
    if (source) {
      phase += 0.02;
      drawWave();
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = (11 * k) + 'px sans-serif';
      ctx.fillText(source === 'tuning' ? '规则波形 · 乐音' : '杂乱无章 · 噪声', 12 * k, 40 * k);
    }
  }

  function loop(){ drawFrame(); rafId = requestAnimationFrame(loop); }

  function setActiveSource(name){
    source = name;
    sourceBtns.forEach(function(b){ b.classList.toggle('btn-primary', b.dataset.source === name); b.classList.toggle('btn-secondary', b.dataset.source !== name); });
    startSound(name);
  }

  stopBtn.addEventListener('click', function(){
    source = null; stopSound();
    sourceBtns.forEach(function(b){ b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    drawBase();
    rafId = requestAnimationFrame(loop);
  });

  sourceBtns.forEach(function(b){
    b.addEventListener('click', function(){ setActiveSource(b.dataset.source); });
  });

  FullscreenHelper.bind(document.getElementById('fsWaveWrap'), document.getElementById('fsWaveBtn'), resize);
  window.addEventListener('resize', resize);
  resize(); rafId = requestAnimationFrame(loop);
})();

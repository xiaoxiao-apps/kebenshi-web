/* exp-candle.js — 扬声器与烛焰：声波波纹推动火焰颤动 */
(function(){
  'use strict';
  var cv = document.getElementById('candleCv'), ctx;
  var DW = 640, W, H, k;
  var ampSlider = document.getElementById('ampSlider'), ampVal = document.getElementById('ampVal');
  var playBtn = document.getElementById('playBtn'), stopBtn = document.getElementById('stopBtn'), stateVal = document.getElementById('stateVal');
  var playing = false, amp = 0.6, phase = 0, waves = [];
  var audioCtx = null, masterGain = null, oscNodes = [];

  function initAudio(){
    if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
    if (!masterGain) {
      masterGain = audioCtx.createGain();
      masterGain.connect(audioCtx.destination);
    }
    var target = Math.max(0, +ampSlider.value / 100);
    masterGain.gain.setTargetAtTime(target * 0.25, audioCtx.currentTime, 0.02);
  }

  function createVoice(rootFreq, type, gainVal, panVal){
    var o = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    var p = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
    o.type = type;
    o.frequency.value = rootFreq;
    g.gain.value = gainVal;
    if (p) { p.pan.value = panVal || 0; o.connect(g); g.connect(p); p.connect(masterGain); }
    else { o.connect(g); g.connect(masterGain); }
    o.start();
    return { osc: o, gain: g };
  }

  function startSound(){
    initAudio();
    if (oscNodes.length) { return; }
    var now = audioCtx.currentTime;
    var base = 440;
    oscNodes.push(createVoice(base, 'sine', 0.55, -0.15));
    oscNodes.push(createVoice(base * 1.5, 'sine', 0.22, 0.15));
    oscNodes.push(createVoice(base * 2, 'triangle', 0.10, 0));
    stateVal.textContent = '播放中';
  }

  function stopSound(){
    playing = false;
    stateVal.textContent = '静音';
    if (oscNodes.length) {
      oscNodes.forEach(function(n){ try { n.osc.stop(); n.osc.disconnect(); n.gain.disconnect(); } catch(e){} });
      oscNodes = [];
    }
    if (masterGain) { try { masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02); } catch(e){} }
  }

  function updateGainFromSlider(){
    if (masterGain && audioCtx) {
      var v = Math.max(0, +ampSlider.value / 100);
      masterGain.gain.setTargetAtTime(v * 0.25, audioCtx.currentTime, 0.02);
    }
  }

  function resize(){ var f = fitCanvas(cv, 340); ctx = f.ctx; W = f.w; H = f.h; k = W / DW; draw(); }
  function drawSpeaker(x, y){ var w = 50 * k, h = 70 * k; ctx.fillStyle = '#2c2c2c'; ctx.beginPath(); roundRectPath(ctx, x - w/2, y - h/2, w, h, 6 * k); ctx.fill(); ctx.fillStyle = '#4a4a4a'; ctx.beginPath(); ctx.arc(x, y, 18 * k, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(x, y, 10 * k, 0, Math.PI * 2); ctx.fill(); }
  function drawFlame(cx, cy, flicker){
    ctx.save(); ctx.translate(cx, cy);
    var f1 = ctx.createRadialGradient(-3 * k, -20 * k, 2 * k, 0, -10 * k, 28 * k); f1.addColorStop(0, 'rgba(255,220,80,.9)'); f1.addColorStop(.5, 'rgba(255,120,30,.8)'); f1.addColorStop(1, 'rgba(255,50,20,0)');
    ctx.fillStyle = f1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-12 * k - flicker, -15 * k, -2 * k - flicker * 0.3, -42 * k); ctx.quadraticCurveTo(4 * k + flicker * 0.3, -15 * k, 0, 0); ctx.fill();
    ctx.restore();
  }
  function drawWave(w){ ctx.strokeStyle = 'rgba(63,167,232,' + (w.alpha * 0.5) + ')'; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.arc(w.x, w.y, w.r, -Math.PI * 0.35, Math.PI * 0.35); ctx.stroke(); }
  function draw(){ drawScene(); }
  function drawScene(){
    ctx.fillStyle = '#1a1512'; ctx.fillRect(0, 0, W, H);
    var grad = ctx.createLinearGradient(0, H * 0.7, 0, H); grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    var spX = W * 0.22, flX = W * 0.78;
    drawSpeaker(spX, H * 0.55);
    ctx.fillStyle = '#3e2c23'; ctx.fillRect(flX - 10 * k, H * 0.7, 20 * k, 10 * k); ctx.fillStyle = '#c0392b'; ctx.fillRect(flX - 4 * k, H * 0.66, 8 * k, 8 * k);
    var flick = playing ? (Math.random() - 0.5) * amp * 30 * k + Math.sin(phase) * amp * 12 * k : (Math.random() - 0.5) * 3 * k;
    drawFlame(flX, H * 0.66, flick);
    for(var i = 0; i < waves.length; i++){ var w = waves[i]; w.r += 3 * k; w.alpha -= 0.012; drawWave(w); }
    waves = waves.filter(function(w){ return w.alpha > 0; });
    if(playing && phase % Math.PI < 0.15){ waves.push({ x: spX, y: H * 0.55, r: 5 * k, alpha: amp }); }
  }
  function loop(){ phase += 0.12 + amp * 0.1; drawScene(); requestAnimationFrame(loop); }
  ampSlider.addEventListener('input', function(){ amp = +ampSlider.value / 100; ampVal.textContent = ampSlider.value + ' %'; });
  playBtn.addEventListener('click', function(){ playing = true; startSound(); });
  stopBtn.addEventListener('click', function(){ stopSound(); });
  ampSlider.addEventListener('input', function(){ updateGainFromSlider(); });
  FullscreenHelper.bind(document.getElementById('fsCandleWrap'), document.getElementById('fsCandleBtn'), resize);
  window.addEventListener('resize', resize);
  window.__candleAudio = {
    getCtx: function(){ return audioCtx; },
    getGain: function(){ return masterGain; },
    getPlaying: function(){ return { playing: playing, oscCount: oscNodes.length, ctxState: audioCtx ? audioCtx.state : null }; }
  };
  resize(); requestAnimationFrame(loop);
})();

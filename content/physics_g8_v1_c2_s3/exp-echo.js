/* exp-echo.js — 回声定位测距：超声脉冲往返动画与猜一猜判分 */
(function(){
  'use strict';
  var cv = document.getElementById('echoCv'), ctx;
  var DW = 640, W = 640, H = 340, k = 1;
  var distSlider = document.getElementById('distSlider'), distVal = document.getElementById('distVal');
  var mediumSel = document.getElementById('mediumSel');
  var tVal = document.getElementById('tVal'), sVal = document.getElementById('sVal');
  var fireBtn = document.getElementById('fireBtn'), resetBtn = document.getElementById('resetBtn');
  var answerBox = document.getElementById('answerBox'), echoFb = document.getElementById('echoFb');
  var dist = 15, speed = 340, t = 0, pulseX = 0, pulseState = 'idle', pulseStart = 0, pulseDuration = 0, impactFired = false;
  var audioCtx = null, masterGain = null, soundOn = true;
  var soundBtn = document.getElementById('soundBtn');

  function resize(){ var f = fitCanvas(cv, 340); ctx = f.ctx; W = f.w; H = f.h; k = W / DW; draw(); }
  function mediumName(){ return speed === 1500 ? '海水' : '空气'; }
  function updateReadout(){
    dist = +distSlider.value; speed = +mediumSel.value;
    distVal.textContent = dist + ' m';
    var roundTrip = (2 * dist / speed).toFixed(3);
    tVal.textContent = roundTrip + ' s'; sVal.textContent = dist + ' m';
  }
  function drawScene(){
    ctx.fillStyle = '#0b1d2e'; ctx.fillRect(0, 0, W, H);
    var g = ctx.createLinearGradient(0, H * 0.85, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1; ctx.beginPath(); for(var i = 0; i <= 10; i++){ var y = H * i / 10; ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
    var margin = 50 * k, maxD = 40, avail = W - 2 * margin, scale = avail / maxD;
    var sourceX = margin, targetX = margin + dist * scale;
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(margin, H * 0.45, dist * scale, H * 0.12);
    ctx.fillStyle = '#4a8c3f'; ctx.beginPath(); ctx.arc(sourceX, H * 0.55, 10 * k, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c0392b'; roundRectPath(ctx, targetX - 8 * k, H * 0.48, 16 * k, 32 * k, 3 * k); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold ' + (12 * k) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('声源', sourceX, H * 0.62); ctx.fillText('目标', targetX, H * 0.62);
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.textAlign = 'left'; ctx.fillText('0 m', margin, H * 0.4); ctx.textAlign = 'right'; ctx.fillText('40 m', W - margin, H * 0.4);
    if(pulseState !== 'idle'){
      var progress = (performance.now() - pulseStart) / pulseDuration, px;
      if(progress >= 1){ pulseState = 'idle'; px = sourceX; }
      else if(progress < 0.5){ px = sourceX + (targetX - sourceX) * (progress * 2); }
      else { px = targetX - (targetX - sourceX) * ((progress - 0.5) * 2); }
      ctx.strokeStyle = '#3fa7e8'; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.arc(px, H * 0.55, 6 * k, 0, Math.PI * 2); ctx.stroke();
      var waveR = (progress < 0.5 ? progress * 2 : 2 - progress * 2) * 18 * k; if(waveR < 0) waveR = 0;
      ctx.strokeStyle = 'rgba(63,167,232,.4)'; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.arc(px, H * 0.55, 10 * k + waveR, 0, Math.PI * 2); ctx.stroke();
    }
  }
  function draw(){ drawScene(); }
  function ensureAudio(){ if(!audioCtx){ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); masterGain = audioCtx.createGain(); masterGain.gain.value = soundOn ? 1 : 0; masterGain.connect(audioCtx.destination); } if(audioCtx.state === 'suspended'){ audioCtx.resume(); } }
  function playSciFiPulse(){ ensureAudio(); if(!soundOn || !masterGain) return; var t0 = audioCtx.currentTime; var osc = audioCtx.createOscillator(); var gain = audioCtx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(880, t0); osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.25); gain.gain.setValueAtTime(0.25, t0); gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3); osc.connect(gain); gain.connect(masterGain); osc.start(t0); osc.stop(t0 + 0.32); }
  function playImpact(){ ensureAudio(); if(!soundOn || !masterGain) return; var t0 = audioCtx.currentTime; var osc = audioCtx.createOscillator(); var gain = audioCtx.createGain(); var delay = audioCtx.createDelay(0.3), fbGain = audioCtx.createGain(), dryGain = audioCtx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(1800, t0); osc.frequency.exponentialRampToValueAtTime(110, t0 + 0.12); dryGain.gain.value = 0.18; delay.delayTime.value = 0.07; fbGain.gain.value = 0.25; osc.connect(dryGain); dryGain.connect(gain); var delayIn = audioCtx.createGain(); delayIn.gain.value = 0.35; osc.connect(delayIn); delayIn.connect(delay); delay.connect(fbGain); fbGain.connect(gain); fbGain.connect(delayIn); gain.gain.setValueAtTime(0.3, t0); gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18); gain.connect(masterGain); osc.start(t0); osc.stop(t0 + 0.22); }
  function updateSoundBtn(){ if(soundBtn){ soundBtn.textContent = (soundOn ? '🔊 声音开' : '🔇 声音关'); } }
  function firePulse(){ if(pulseState !== 'idle') return; ensureAudio(); playSciFiPulse(); updateReadout(); pulseState = 'running'; pulseStart = performance.now(); impactFired = false; var roundTrip = 2 * dist / speed; pulseDuration = Math.max(roundTrip * 1000 * 28, 300); }
  function checkImpact(now){ if(!impactFired && now >= pulseStart + pulseDuration * 0.5){ impactFired = true; playImpact(); } }
  function loop(){ if(pulseState === 'running'){ draw(); checkImpact(performance.now()); } requestAnimationFrame(loop); }
  distSlider.addEventListener('input', function(){ updateReadout(); draw(); });
  mediumSel.addEventListener('change', function(){ updateReadout(); draw(); });
  fireBtn.addEventListener('click', firePulse);
  soundBtn.addEventListener('click', function(){ soundOn = !soundOn; updateSoundBtn(); if(masterGain){ masterGain.gain.setTargetAtTime(soundOn ? 1 : 0, audioCtx.currentTime, 0.02); } });
  resetBtn.addEventListener('click', function(){ pulseState = 'idle'; distSlider.value = 15; mediumSel.value = '340'; updateReadout(); draw(); });
  document.querySelectorAll('.guess-card .opt').forEach(function(btn){ btn.addEventListener('click', function(){ var ok = btn.getAttribute('data-opt') === 'B'; echoFb.className = 'feedback ' + (ok ? 'ok' : 'err') + ' show'; echoFb.textContent = ok ? ' 回答正确！' : ' 再想想：回波时间是往返，深度要除以 2。'; if(ok) answerBox.style.display = 'block'; }); });
  FullscreenHelper.bind(document.getElementById('fsEchoWrap'), document.getElementById('fsEchoBtn'), resize);
  window.addEventListener('resize', resize);
  updateReadout(); resize(); requestAnimationFrame(loop);
  window.__echoAudio = { getCtx: function(){ return audioCtx; }, getSoundOn: function(){ return soundOn; }, getPulseDuration: function(){ return pulseDuration; } };
})();

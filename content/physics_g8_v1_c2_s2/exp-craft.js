(function() {
  'use strict';

  // ===== 水瓶琴 =====
  var bottles = document.querySelectorAll('.bottle');
  var activeAudio = null;
  var activeBottle = null;

  function stopBottle() {
    if (activeAudio) { activeAudio.pause(); activeAudio.currentTime = 0; activeAudio = null; }
    if (activeBottle) { activeBottle.classList.remove('active'); activeBottle = null; }
  }

  function playBottle(el) {
    stopBottle();
    var src = el.dataset.src;
    if (!src) return;
    var audio = new Audio(src);
    audio.play().catch(function(){});
    activeAudio = audio;
    activeBottle = el;
    el.classList.add('active');
    audio.addEventListener('ended', stopBottle);
  }

  bottles.forEach(function(b) {
    b.addEventListener('click', function() { playBottle(b); });
    b.addEventListener('touchstart', function(e) { e.preventDefault(); playBottle(b); });
  });

  // ===== 活塞哨子 =====
  var blowBtn = document.getElementById('blowBtn');
  var pipeRange = document.getElementById('pipeRange');
  var pipeStage = document.getElementById('pipeStage');
  var pipeAir = document.getElementById('pipeAir');
  var pipePiston = document.getElementById('pipePiston');
  var airLenVal = document.getElementById('airLenVal');
  var pitchVal = document.getElementById('pitchVal');

  var actx = null, osc1 = null, osc2 = null, lfo = null, lfoGain = null, master = null;
  var isBlowing = false;

  // r: 0~1，活塞位置（0=顶部空气柱最长，1=底部最短）
  // 管乐物理：频率 ∝ 1/空气柱长度。有效空气柱 100%→35%，频率约 500Hz→1430Hz（实时合成，不是采样变速）
  function freqFromRatio(r) {
    return 500 / (1 - r * 0.65);
  }

  function updatePipe(r) {
    var pct = Math.max(0, Math.min(100, Math.round(r * 100)));
    pipeRange.value = pct;
    var airLen = 100 - pct;
    pipeAir.style.height = airLen + '%';
    pipePiston.style.top = pct + '%';
    pipePiston.style.bottom = 'auto';
    airLenVal.textContent = airLen + '%';
    var f = freqFromRatio(r);
    var label = airLen > 66 ? '偏低' : (airLen < 33 ? '偏高' : '中等');
    pitchVal.textContent = label + '（约 ' + Math.round(f) + ' Hz）';
    if (isBlowing && osc1 && actx) {
      var t = actx.currentTime;
      osc1.frequency.setTargetAtTime(f, t, 0.03);
      osc2.frequency.setTargetAtTime(f * 2, t, 0.03);
      lfoGain.gain.setTargetAtTime(f * 0.01, t, 0.05);
    }
  }

  function startBlow() {
    if (isBlowing) return;
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (!actx) return;
    if (actx.state === 'suspended') actx.resume();
    var f = freqFromRatio(parseFloat(pipeRange.value) / 100);
    var t = actx.currentTime;
    master = actx.createGain();
    master.gain.setValueAtTime(0, t);
    master.gain.linearRampToValueAtTime(0.5, t + 0.03);   // 软起音防爆音
    osc1 = actx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = f;
    osc2 = actx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = f * 2;
    var osc2Gain = actx.createGain(); osc2Gain.gain.value = 0.15;
    lfo = actx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5;   // 轻颤音更像吹气
    lfoGain = actx.createGain(); lfoGain.gain.value = f * 0.01;
    lfo.connect(lfoGain); lfoGain.connect(osc1.frequency);
    osc1.connect(master); osc2.connect(osc2Gain); osc2Gain.connect(master);
    master.connect(actx.destination);
    osc1.start(); osc2.start(); lfo.start();
    isBlowing = true;
    blowBtn.textContent = '⏹ 停止';
    blowBtn.classList.add('active');
  }

  function stopBlow() {
    if (!isBlowing || !actx || !master) return;
    var t = actx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.05);     // 软止音
    var o1 = osc1, o2 = osc2, lf = lfo;
    setTimeout(function() { try { o1.stop(); o2.stop(); lf.stop(); } catch (e) {} }, 90);
    osc1 = osc2 = lfo = null; master = null;
    isBlowing = false;
    blowBtn.textContent = '🌬️ 吹气';
    blowBtn.classList.remove('active');
  }

  function toggleBlow() {
    isBlowing ? stopBlow() : startBlow();
  }

  // 初始化显示
  updatePipe(parseFloat(pipeRange.value) / 100);

  // 滑块
  pipeRange.addEventListener('input', function() { updatePipe(parseFloat(pipeRange.value) / 100); });

  // 吹气/停止按钮
  blowBtn.addEventListener('click', function(e) { e.preventDefault(); toggleBlow(); });

  // 拖动活塞/管体
  function setFromY(y) {
    var rect = pipeStage.getBoundingClientRect();
    var r = (y - rect.top) / rect.height;
    updatePipe(Math.max(0, Math.min(1, r)));
  }
  var dragging = false;
  pipeStage.addEventListener('pointerdown', function(e) {
    dragging = true;
    pipeStage.setPointerCapture(e.pointerId);
    setFromY(e.clientY);
  });
  pipeStage.addEventListener('pointermove', function(e) {
    if (!dragging) return;
    setFromY(e.clientY);
  });
  pipeStage.addEventListener('pointerup', function(e) { dragging = false; });
  pipeStage.addEventListener('pointerleave', function(e) { dragging = false; });
  pipePiston.addEventListener('pointerdown', function(e) { e.stopPropagation(); dragging = true; pipeStage.setPointerCapture(e.pointerId); });

})();

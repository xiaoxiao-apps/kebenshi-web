/** exp-medium.js — G5 介质传声对比台：空气路径 vs 耳贴桌面路径（WebAudio 音量差） */
(function () {
  'use strict';

  // ===== DOM =====
  var btnAir = document.getElementById('btnAir');
  var btnDesk = document.getElementById('btnDesk');
  var knockBtn = document.getElementById('knockBtn');
  var meterFill = document.getElementById('meterFill');
  var dbText = document.getElementById('dbText');
  var pathNote = document.getElementById('pathNote');
  var cmpFb = document.getElementById('cmpFb');

  // ===== 状态 =====
  var path = 'air';          // 'air' | 'desk'
  var heard = { air: false, desk: false };
  var actx = null;

  var PATHS = {
    air:  { gain: 0.10, db: 40, meter: 26, name: '空气路径' },
    desk: { gain: 0.55, db: 68, meter: 78, name: '耳贴桌面' }
  };

  // ===== WebAudio：合成敲桌声（噪声脉冲 + 低频木质共鸣） =====
  function ensureCtx() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  function knock(p) {
    var ctx = ensureCtx();
    if (!ctx) { pathNote.textContent = '⚠️ 当前浏览器不支持 WebAudio，无法播放示意音频；结论请看下方翻牌。'; return; }
    var t0 = ctx.currentTime + 0.02;
    var peak = PATHS[p].gain;

    // 1) 敲击瞬态：短噪声 burst
    var noiseDur = 0.06;
    var buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * noiseDur), ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }
    var noise = ctx.createBufferSource();
    noise.buffer = buf;
    var nGain = ctx.createGain();
    nGain.gain.value = peak;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = (p === 'desk') ? 2600 : 1400;   // 贴桌面高频成分略多、更实
    noise.connect(lp); lp.connect(nGain); nGain.connect(ctx.destination);
    noise.start(t0); noise.stop(t0 + noiseDur);

    // 2) 木质共鸣：两个衰减正弦（桌面模式振动）
    [[180, 1.0], [268, 0.55]].forEach(function (m) {
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = m[0];
      var g = ctx.createGain();
      g.gain.setValueAtTime(peak * m[1] * 0.8, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (p === 'desk' ? 0.5 : 0.28));
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t0); osc.stop(t0 + 0.6);
    });
  }

  function setMeter(p) {
    var cfg = PATHS[p];
    meterFill.style.width = cfg.meter + '%';
    dbText.textContent = '约 ' + cfg.db + ' dB（示意）';
  }

  function selectPath(p) {
    path = p;
    btnAir.classList.toggle('on', p === 'air');
    btnDesk.classList.toggle('on', p === 'desk');
    setMeter(p);
    pathNote.textContent = (p === 'air')
      ? '🌬️ 空气路径：声音只靠空气传到耳朵——又轻又闷。点「敲击桌面」听。'
      : '👂 耳贴桌面：敲击的振动沿桌面（固体）直接传到耳骨——响亮清楚。点「敲击桌面」听。';
  }

  btnAir.addEventListener('click', function () { selectPath('air'); });
  btnDesk.addEventListener('click', function () { selectPath('desk'); });
  knockBtn.addEventListener('click', function () {
    knock(path);
    heard[path] = true;
    if (heard.air && heard.desk && !cmpFb.classList.contains('show')) {
      cmpFb.className = 'feedback show ok';
      cmpFb.innerHTML = '🎧 两条路径都听过了：<b>同一声敲击</b>，经桌面（固体）传到耳朵明显更响、更清楚。说明固体传声本领比气体强。再翻翻下面的卡片，归纳「介质」概念！';
    }
  });
  selectPath('air');

  // ===== 翻牌 =====
  var cards = document.querySelectorAll('.flip-card');
  var conceptBox = document.getElementById('conceptBox');
  var flipped = {};
  cards.forEach(function (c) {
    c.addEventListener('click', function () {
      c.classList.toggle('flipped');
      flipped[c.dataset.k] = c.classList.contains('flipped');
      var all = Object.keys(flipped).length >= 4 &&
        flipped.solid && flipped.liquid && flipped.gas && flipped.vacuum;
      if (all) conceptBox.style.display = 'block';
    });
  });
})();

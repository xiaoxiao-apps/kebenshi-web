/** exp-bone.js — G9 骨传导体验站：塞耳开关×音叉部位 → 听到/听不到 + 路径高亮 + 440Hz 音叉音 */
(function () {
  'use strict';

  // ===== DOM =====
  var plugSw = document.getElementById('plugSw');
  var plugState = document.getElementById('plugState');
  var heardBox = document.getElementById('heardBox');
  var strikeBtn = document.getElementById('strikeBtn');
  var siteBtns = document.querySelectorAll('.site-btn');
  var pathAir = document.getElementById('pathAir');
  var pathBone = document.getElementById('pathBone');
  var airCut = document.getElementById('airCut');
  var boneCheck = document.getElementById('boneCheck');
  var eardrum = document.getElementById('eardrum');
  var mkChin = document.getElementById('mkChin');
  var mkFore = document.getElementById('mkFore');
  var mkBehind = document.getElementById('mkBehind');
  var mkLabel = document.getElementById('mkLabel');
  var forkG = document.getElementById('fork');

  // ===== 状态 =====
  var site = 'none';        // none | chin | fore | behind
  var vibrating = false;    // 音叉是否在振动
  var actx = null;
  var forkOsc = null, forkGain = null;

  var SITE_NAME = { none: '音叉移开', chin: '下巴', fore: '前额', behind: '耳后' };

  function ensureCtx() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  // ===== 音叉 440 Hz：振动时持续发声，移开/停振即静音 =====
  function startFork() {
    var ctx = ensureCtx();
    if (!ctx) return;
    stopFork();
    forkOsc = ctx.createOscillator();
    forkOsc.type = 'sine';
    forkOsc.frequency.value = 440;             // 标准音叉频率
    forkGain = ctx.createGain();
    forkGain.gain.value = 0;
    forkOsc.connect(forkGain); forkGain.connect(ctx.destination);
    forkOsc.start();
    // 渐入 + 缓慢衰减（模拟音叉能量耗尽）
    var t0 = ctx.currentTime;
    forkGain.gain.setValueAtTime(0.0001, t0);
    forkGain.gain.exponentialRampToValueAtTime(0.28, t0 + 0.05);
    forkGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 6);
    setTimeout(function () { vibrating = false; render(); }, 6000);
  }
  function stopFork() {
    if (forkOsc) { try { forkOsc.stop(); } catch (e) {} forkOsc.disconnect(); forkOsc = null; }
    if (forkGain) { forkGain.disconnect(); forkGain = null; }
  }

  // 音量通路：塞耳+无骨接触→几乎无声；塞耳+骨接触→骨传导清晰；未塞耳→空气传导正常
  function audibleVolume() {
    if (!vibrating) return 0;
    var plugged = plugSw.checked;
    if (site === 'none') return plugged ? 0 : 1;          // 移开：塞耳后基本听不到
    // 抵在骨头上
    if (!plugged) return 1.35;                             // 空气+骨传导叠加，最响
    return 1.15;                                           // 塞耳仍清楚听到（骨传导）
  }

  function render() {
    var plugged = plugSw.checked;
    plugState.textContent = plugged ? '已塞耳：空气路径被堵住 ✂' : '未塞耳：空气传声正常';
    plugState.style.color = plugged ? '#c0392b' : '#5a5a5a';

    // 音叉位置与振动
    var vol = audibleVolume();
    if (forkGain && actx) {
      // 塞耳且无骨接触 → 音量压到几乎为 0；骨接触 → 恢复
      var target = vibrating ? (vol === 0 ? 0.0001 : 0.28 * Math.min(vol, 1.4)) : 0.0001;
      try { forkGain.gain.setTargetAtTime(target, actx.currentTime, 0.05); } catch (e) {}
    }

    // 部位标记
    mkChin.setAttribute('opacity', site === 'chin' ? '1' : '0');
    mkFore.setAttribute('opacity', site === 'fore' ? '1' : '0');
    mkBehind.setAttribute('opacity', site === 'behind' ? '1' : '0');

    // 路径高亮
    if (plugged) {
      pathAir.setAttribute('opacity', '0.25');
      airCut.setAttribute('opacity', '1');
      eardrum.setAttribute('stroke', '#8a8a8a');
    } else {
      pathAir.setAttribute('opacity', '1');
      airCut.setAttribute('opacity', '0');
      eardrum.setAttribute('stroke', '#c0392b');
    }
    var boneOn = site !== 'none';
    pathBone.setAttribute('opacity', boneOn ? '1' : '0.25');
    boneCheck.setAttribute('opacity', boneOn ? '1' : '0');

    // 音叉图标微移示意接触部位
    forkG.setAttribute('transform', site === 'none' ? '' : 'translate(180 ' + (site === 'fore' ? -40 : 60) + ')');

    // 听到状态
    var heard = vibrating && vol > 0;
    if (!vibrating) {
      heardBox.className = 'heard-box no';
      heardBox.innerHTML = '🔇 音叉没在振动 <span class="sub">（点「敲击音叉」让它重新发声）</span>';
      mkLabel.textContent = '先敲音叉，再选部位';
    } else if (heard) {
      heardBox.className = 'heard-box yes';
      if (plugged && site !== 'none') {
        heardBox.innerHTML = '🔊 能清楚听到音叉声！ <span class="sub">（塞着耳也行——振动经头骨直接传到听觉神经，这就是骨传导）</span>';
      } else if (plugged && site === 'none') {
        heardBox.className = 'heard-box no';
        heardBox.innerHTML = '🔇 基本听不到 <span class="sub">（塞耳后空气路径被堵，音叉又没接触骨头）</span>';
      } else {
        heardBox.innerHTML = '🔊 听到音叉声 <span class="sub">（未塞耳：空气路径正常传声' + (site !== 'none' ? '＋骨传导叠加，更响' : '') + '）</span>';
      }
      mkLabel.textContent = SITE_NAME[site] + (plugged ? '·塞耳' : '·未塞耳') + '：' +
        (heard ? (plugged && site !== 'none' ? '头骨路径 ✓ 生效' : '空气路径 ✓ 正常') : '两条路都不通 ✗');
    } else {
      heardBox.className = 'heard-box no';
      heardBox.innerHTML = '🔇 基本听不到音叉声 <span class="sub">（塞耳＋音叉移开：空气路径✂、头骨路径未接通）</span>';
      mkLabel.textContent = '塞耳＋移开：空气✂ 头骨✗ → 听不到';
    }
  }

  // ===== 交互 =====
  plugSw.addEventListener('change', render);
  siteBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      site = b.dataset.site;
      siteBtns.forEach(function (x) { x.classList.toggle('on', x === b); });
      if (site === 'none') { /* 移开：马上听不到 */ }
      render();
    });
  });
  strikeBtn.addEventListener('click', function () {
    vibrating = true;
    startFork();
    render();
  });
  document.querySelector('.site-btn[data-site="none"]').classList.add('on');
  render();
})();

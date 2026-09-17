/** exp-dual.js — G11 双声到达模拟：铁(5200) vs 空气(340) 竞速动画 + 时间差 + 0.1s 合并判定 */
(function () {
  'use strict';

  var V_IRON = 5200;   // 表2.1-1 铁（棒）（C类数字，禁止改动）
  var V_AIR = 340;     // 15℃ 空气（C类数字）
  var THRESHOLD = 0.1; // 分辨阈值（C类数字）

  // ===== DOM =====
  var lenRange = document.getElementById('lenRange');
  var lenInput = document.getElementById('lenInput');
  var roT1 = document.getElementById('roT1');
  var roT2 = document.getElementById('roT2');
  var roD = document.getElementById('roD');
  var verdict = document.getElementById('verdict');
  var hitBtn = document.getElementById('hitBtn');
  var raceLabel = document.getElementById('raceLabel');
  var runIron = document.getElementById('runIron');
  var runAir = document.getElementById('runAir');
  var flashIron = document.getElementById('flashIron');
  var flashAir = document.getElementById('flashAir');

  var actx = null;
  var animId = null;
  var pendingTo = [];

  function ensureCtx() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  function len() {
    var L = parseInt(lenRange.value, 10);
    return isNaN(L) ? 100 : Math.min(150, Math.max(5, L));
  }

  // ===== 读数联动 =====
  function update() {
    var L = len();
    lenInput.value = L;
    var t1 = L / V_IRON;
    var t2 = L / V_AIR;
    var d = t2 - t1;
    roT1.textContent = t1.toFixed(3) + ' s';
    roT2.textContent = t2.toFixed(3) + ' s';
    roD.textContent = d.toFixed(3) + ' s';
    roD.style.color = d > THRESHOLD ? '#4a8c3f' : '#8b6914';
    if (d > THRESHOLD) {
      verdict.className = 'verdict two';
      verdict.innerHTML = '✅ Δt = ' + d.toFixed(3) + ' s <b>&gt; 0.1 s</b>：两声分得开 → 听到 <b>2 次</b>敲打声（先铁管、后空气）。';
    } else {
      verdict.className = 'verdict one';
      verdict.innerHTML = '🔶 Δt = ' + d.toFixed(3) + ' s <b>≤ 0.1 s</b>：两声合并 → 只听到 <b>1 次</b>。管长小于约 36.4 m 时就是这样！';
    }
  }
  lenRange.addEventListener('input', update);
  lenInput.addEventListener('change', function () {
    var v = parseInt(lenInput.value, 10);
    if (!isNaN(v)) lenRange.value = Math.min(150, Math.max(5, v));
    update();
  });
  [['q20', 20], ['q36', 36], ['q100', 100]].forEach(function (q) {
    var b = document.getElementById(q[0]);
    if (b) b.addEventListener('click', function () { lenRange.value = q[1]; update(); });
  });

  // ===== 敲击合成音（短促金属/木鱼声，用于到达提示） =====
  function ping(freq, vol) {
    var ctx = ensureCtx();
    if (!ctx) return;
    var t0 = ctx.currentTime;
    var osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + 0.3);
  }

  // ===== 竞速动画 =====
  function clearTimers() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    pendingTo.forEach(function (t) { clearTimeout(t); });
    pendingTo = [];
  }

  function hit() {
    clearTimers();
    var L = len();
    var t1 = L / V_IRON, t2 = L / V_AIR, d = t2 - t1;
    var twoSounds = d > THRESHOLD;

    // 动画时长压缩：空气路径全程 1.6s 演完，铁路径按真实比例先到
    var T_ANIM = 1.6;
    var x0 = 70, x1 = 562;
    runIron.setAttribute('opacity', '1');
    runAir.setAttribute('opacity', '1');
    flashIron.setAttribute('opacity', '0');
    flashAir.setAttribute('opacity', '0');
    raceLabel.textContent = '竞速开始！铁管声一路领先…';

    // 到达声：按真实 Δt 播放（L≤150 m 时 Δt≤0.412 s，可直接听）
    if (twoSounds) {
      ping(880, 0.3);                          // 第 1 声：沿铁管（先到）
      pendingTo.push(setTimeout(function () { ping(440, 0.22); }, d * 1000)); // 第 2 声：沿空气
    } else {
      ping(660, 0.3);                          // 合并：只听到 1 次
    }

    var start = null;
    var ironDone = false, airDone = false;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / (T_ANIM * 1000), 1);
      // 铁路径：按 t1/t2 比例提前到达
      var ironLead = t2 > 0 ? Math.min(1, p * (t2 / t1)) : 1;
      var xi = x0 + (x1 - x0) * Math.min(ironLead, 1);
      var xa = x0 + (x1 - x0) * p;
      runIron.setAttribute('cx', xi.toFixed(1));
      runAir.setAttribute('cx', xa.toFixed(1));
      if (ironLead >= 1 && !ironDone) {
        ironDone = true;
        flashIron.setAttribute('opacity', '1');
        pendingTo.push(setTimeout(function () { flashIron.setAttribute('opacity', '0'); }, 400));
      }
      if (p >= 1 && !airDone) {
        airDone = true;
        flashAir.setAttribute('opacity', '1');
        raceLabel.textContent = twoSounds ? '👂 两声先后到达 → 共听到 2 次！' : '👂 两声几乎同时到达（Δt≤0.1 s）→ 合并为 1 次';
        pendingTo.push(setTimeout(function () { flashAir.setAttribute('opacity', '0'); }, 600));
        pendingTo.push(setTimeout(function () {
          runIron.setAttribute('opacity', '0');
          runAir.setAttribute('opacity', '0');
        }, 900));
        animId = null;
        return;
      }
      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);
  }
  hitBtn.addEventListener('click', hit);

  update();
})();

/** exp-dual.js — G11 双声到达模拟：铁(5200) vs 空气(340) 竞速动画 + 三声真实时序（叮@0 / 咚@t₁ / 咚@t₂）+ 0.1s 合并判定 */
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
  var slowBtn = document.getElementById('slowBtn');
  var slowNote = document.getElementById('slowNote');
  var raceLabel = document.getElementById('raceLabel');
  var runIron = document.getElementById('runIron');
  var runAir = document.getElementById('runAir');
  var flashIron = document.getElementById('flashIron');
  var flashAir = document.getElementById('flashAir');

  var actx = null;
  var animId = null;
  var pendingTo = [];

  /* G3 慢放三档：只缩放演示间隔（setTimeout/rAF 时间基准），ping 音色与时长不变；
     默认 1× 保持 F6 真实时序语义完全不变 */
  var SPEEDS = [1, 0.5, 0.25];
  var si = 0;
  function refreshSlowNote() {
    if (si === 0) { slowNote.style.display = 'none'; return; }
    var L0 = len();
    slowNote.textContent = '🐢 演示已慢放 ×' + SPEEDS[si] + '，真实 Δt = ' + (L0 / V_AIR - L0 / V_IRON).toFixed(3) + ' s（按当前管长 ' + L0 + ' m）';
    slowNote.style.display = '';
  }
  slowBtn.addEventListener('click', function () {
    si = (si + 1) % 3;
    slowBtn.textContent = '🐢 慢放 ' + SPEEDS[si] + '×';
    refreshSlowNote();
  });

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
      verdict.innerHTML = '✅ Δt = ' + d.toFixed(3) + ' s <b>&gt; 0.1 s</b>：两声「咚」分得开 → 加上敲击瞬间的「叮」，共听到 <b>3 声</b>（叮 → 铁管「咚」→ 空气「咚」）。';
    } else {
      verdict.className = 'verdict one';
      verdict.innerHTML = '🔶 Δt = ' + d.toFixed(3) + ' s <b>≤ 0.1 s</b>：两声「咚」合并 → 听到「叮」+ 1 声「咚」，共 <b>2 声</b>。管长小于约 36.4 m 时就是这样！';
    }
    refreshSlowNote();
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

  // ===== 敲击合成音（880Hz=敲击「叮」，440Hz=到达「咚」，音色区分） =====
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
    /* G3：慢放系数 f 只拉长间隔（÷f），1× 时与 F6 真实时序逐毫秒一致；
       rAF 竞速动画共用 t1ms/t2ms 时间基准，声画同步缩放 */
    var f = SPEEDS[si];
    var t1ms = t1 * 1000 / f, t2ms = t2 * 1000 / f;

    // 竞速动画按真实时序 t₂ 演完（L≤150 m 时 ≤0.44 s），与三声完全对齐
    var x0 = 70, x1 = 562;
    runIron.setAttribute('opacity', '1');
    runAir.setAttribute('opacity', '1');
    flashIron.setAttribute('opacity', '0');
    flashAir.setAttribute('opacity', '0');
    raceLabel.textContent = '竞速开始！铁管声一路领先…';

    /* 三声真实时序（随当前 L 每次重算）：
       t=0 「叮」880Hz=敲击瞬间；t₁=L/V_IRON「咚」440Hz=铁管到达；t₂=L/V_AIR「咚」440Hz=空气到达。
       Δt≤0.1 s 时两「咚」合并为 1 声（在 t₁ 播），听到叮+咚共 2 声 */
    ping(880, 0.3);
    pendingTo.push(setTimeout(function () { ping(440, 0.26); }, t1ms));
    if (twoSounds) {
      pendingTo.push(setTimeout(function () { ping(440, 0.26); }, t2ms));
    }

    // 到达闪光与到达声同步：铁管闪光@t₁、空气闪光@t₂
    pendingTo.push(setTimeout(function () {
      flashIron.setAttribute('opacity', '1');
      pendingTo.push(setTimeout(function () { flashIron.setAttribute('opacity', '0'); }, Math.max(200, t2ms - t1ms)));
    }, t1ms));
    pendingTo.push(setTimeout(function () {
      flashAir.setAttribute('opacity', '1');
      raceLabel.textContent = twoSounds
        ? '👂 叮(敲击) → 咚(铁管 t₁) → 咚(空气 t₂)：两咚分得开，共 3 声！'
        : '👂 叮(敲击) + 咚(两路合并，Δt≤0.1 s)：共 2 声';
      pendingTo.push(setTimeout(function () { flashAir.setAttribute('opacity', '0'); }, 600));
      pendingTo.push(setTimeout(function () {
        runIron.setAttribute('opacity', '0');
        runAir.setAttribute('opacity', '0');
      }, 900));
    }, t2ms));

    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var el = ts - start;
      var pAir = Math.min(el / t2ms, 1);
      var pIron = Math.min(el / t1ms, 1);
      runIron.setAttribute('cx', (x0 + (x1 - x0) * pIron).toFixed(1));
      runAir.setAttribute('cx', (x0 + (x1 - x0) * pAir).toFixed(1));
      if (pAir >= 1) { animId = null; return; }
      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);
  }
  hitBtn.addEventListener('click', hit);

  update();

  /* G3 全屏：SVG height:auto 等比缩放，无需 resize 回调（同 exp-echo） */
  var fsW = document.getElementById('fsDualWrap');
  if (fsW && window.FullscreenHelper) {
    FullscreenHelper.bind(fsW, document.getElementById('fsDualBtn'), null);
  }

  /* F11：壳切tab通知→清序列定时器+冻结已排程 ping（幂等；show 不自动恢复） */
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.kind !== 'sound-lab-hide') return;
    clearTimers();
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    if (actx && actx.state === 'running') actx.suspend();
  });
})();

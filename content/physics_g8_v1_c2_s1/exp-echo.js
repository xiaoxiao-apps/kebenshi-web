/** exp-echo.js — G7 回声测距计算器 + 听觉实验（>0.1s 可分辨回声 / ≤0.1s 混响加强）+ 反向出题 */
(function () {
  'use strict';

  var V = 340;           // 15℃ 空气声速（C类数字，禁止改动）
  var THRESHOLD = 0.1;   // 分辨回声阈值（C类数字）
  var actx = null;

  // ===== DOM =====
  var distRange = document.getElementById('distRange');
  var distInput = document.getElementById('distInput');
  var roS = document.getElementById('roS');
  var roT = document.getElementById('roT');
  var roV = document.getElementById('roV');
  var verdict = document.getElementById('verdict');
  var shoutBtn = document.getElementById('shoutBtn');
  var svgLabel = document.getElementById('svgLabel');
  var waveGo = document.getElementById('waveGo');
  var waveBack = document.getElementById('waveBack');
  var cliffFlash = document.getElementById('cliffFlash');

  function ensureCtx() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  function dist() {
    var d = parseInt(distRange.value, 10);
    return isNaN(d) ? 60 : Math.min(120, Math.max(5, d));
  }

  // ===== 读数联动 =====
  function update() {
    var d = dist();
    distInput.value = d;
    var s = 2 * d;
    var t = s / V;
    roS.textContent = s + ' m';
    roT.textContent = t.toFixed(3) + ' s';
    var canSeparate = t > THRESHOLD;
    roV.textContent = canSeparate ? '能' : '不能';
    roV.className = canSeparate ? 'rv green' : 'rv';
    roV.style.color = canSeparate ? '#4a8c3f' : '#8b6914';
    if (canSeparate) {
      verdict.className = 'verdict echo';
      verdict.innerHTML = '✅ t = ' + t.toFixed(3) + ' s <b>&gt; 0.1 s</b>：能分辨出回声。';
    } else {
      verdict.className = 'verdict mix';
      verdict.innerHTML = '🔶 t = ' + t.toFixed(3) + ' s <b>≤ 0.1 s</b>：分辨不出回声，反射声与原声混在一起使原声<b>加强</b>（混响）——这正是「室内讲话比旷野响亮」的原因（练习⑤）。';
    }
    svgLabel.textContent = '距离 ' + d + ' m → 往返 ' + s + ' m → t = ' + t.toFixed(3) + ' s';
  }

  distRange.addEventListener('input', update);
  distInput.addEventListener('change', function () {
    var v = parseInt(distInput.value, 10);
    if (!isNaN(v)) distRange.value = Math.min(120, Math.max(5, v));
    update();
  });

  // ===== WebAudio 合成「啊」声（人声感：多谐波短促元音） =====
  function makeVoice(ctx, t0, gainVal, outNode) {
    var dur = 0.32;
    [[220, 1.0], [440, 0.5], [660, 0.25], [880, 0.12]].forEach(function (m) {
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(m[0] * 1.06, t0);
      osc.frequency.exponentialRampToValueAtTime(m[0] * 0.94, t0 + dur);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gainVal * m[1], t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(outNode);
      osc.start(t0); osc.stop(t0 + dur + 0.05);
    });
  }

  function shout() {
    var ctx = ensureCtx();
    var d = dist();
    var t = 2 * d / V;
    if (!ctx) { svgLabel.textContent = '⚠️ 浏览器不支持 WebAudio，读数仍可用。'; return; }
    var t0 = ctx.currentTime + 0.05;
    var finalLabel;
    if (t > THRESHOLD) {
      finalLabel = '🔊 反射声波回到耳边——这就是回声（往返 ' + (2 * d) + ' m，t = ' + t.toFixed(3) + ' s）';
    } else {
      finalLabel = '🔊 反射声波几乎同时回到耳边，与原声混在一起更响亮——听不出两声。';
    }
    /* 声波动画：从你出发→撞崖→弹回；回声音频在反射波回到你耳边那一刻响 */
    var animRound = playWaveAnim(d, t, finalLabel);
    makeVoice(ctx, t0, 0.5, ctx.destination);
    if (t > THRESHOLD) {
      makeVoice(ctx, t0 + animRound, 0.22, ctx.destination);
    } else {
      makeVoice(ctx, t0 + t, 0.32, ctx.destination);
    }
  }

  var animRaf = null, animTimers = [];
  function clearAnim() {
    if (animRaf) { cancelAnimationFrame(animRaf); animRaf = null; }
    animTimers.forEach(function (id) { clearTimeout(id); });
    animTimers = [];
  }
  /* 声波脉冲：去程弧线向右平移→撞崖闪光→回程弧线向左平移回你耳边 */
  function playWaveAnim(d, t, finalLabel) {
    clearAnim();
    var x0 = 70, x1 = 540;   /* 你 → 崖面 */
    var goMs = Math.min(Math.max(t * 500, 400), 900);
    waveGo.setAttribute('opacity', '1');
    waveBack.setAttribute('opacity', '0');
    svgLabel.textContent = '📣 声波从你出发，向山崖传播…';
    var start = performance.now();
    function stepGo(now) {
      var p = Math.min((now - start) / goMs, 1);
      waveGo.setAttribute('transform', 'translate(' + (x0 + p * (x1 - x0)).toFixed(1) + ',120)');
      if (p < 1) { animRaf = requestAnimationFrame(stepGo); return; }
      waveGo.setAttribute('opacity', '0');
      cliffFlash.setAttribute('opacity', '0.85');
      animTimers.push(setTimeout(function () { cliffFlash.setAttribute('opacity', '0'); }, 220));
      svgLabel.textContent = '💥 撞上山崖！声波被反射回来…';
      waveBack.setAttribute('opacity', '1');
      var s2 = performance.now();
      function stepBack(now2) {
        var q = Math.min((now2 - s2) / goMs, 1);
        waveBack.setAttribute('transform', 'translate(' + (x1 - q * (x1 - x0)).toFixed(1) + ',120)');
        if (q < 1) { animRaf = requestAnimationFrame(stepBack); return; }
        waveBack.setAttribute('opacity', '0');
        animRaf = null;
        svgLabel.textContent = finalLabel;
      }
      animRaf = requestAnimationFrame(stepBack);
    }
    animRaf = requestAnimationFrame(stepGo);
    return 2 * goMs / 1000;   /* 动画往返秒数：回声音频对齐反射波回到耳边的时刻 */
  }
  shoutBtn.addEventListener('click', shout);

  // ===== 反向出题模式 =====
  var quizT = document.getElementById('quizT');
  var quizInput = document.getElementById('quizInput');
  var quizFb = document.getElementById('quizFb');
  var formulaBox = document.getElementById('formulaBox');
  var curT = 1.5;
  var quizDone = false;

  function genQuiz() {
    var times = [1.5, 2, 0.6, 3, 1.2, 0.4];
    curT = times[Math.floor(Math.random() * times.length)];
    quizT.textContent = String(curT);
    quizInput.value = '';
    quizFb.className = 'feedback';
    quizFb.textContent = '';
    formulaBox.className = 'formula-box';
    quizDone = false;
  }

  document.getElementById('quizCheck').addEventListener('click', function () {
    var raw = quizInput.value.trim();
    if (!raw) { quizFb.className = 'feedback show err'; quizFb.textContent = '请先输入答案（单位 m）。'; return; }
    var val = parseFloat(raw.replace(/[^0-9.]/g, ''));
    var answer = V * curT / 2;
    quizFb.className = 'feedback show';
    if (!isNaN(val) && Math.abs(val - answer) < 1) {
      quizFb.classList.add('ok');
      quizFb.innerHTML = '✅ 正确！s = v·t ÷ 2 = 340 × ' + curT + ' ÷ 2 = <b>约 ' + answer + ' m</b>。';
      quizDone = true;
    } else {
      quizFb.classList.add('err');
      quizFb.innerHTML = '❌ 不对。想想：' + curT + ' s 是声音「一去一回」的总时间，路程要除以几？<button class="btn btn-secondary" id="showFormula" type="button" style="margin-left:8px;padding:6px 12px;min-height:32px;font-size:12px">看算式</button>';
      var sf = document.getElementById('showFormula');
      if (sf) sf.addEventListener('click', function () {
        formulaBox.className = 'formula-box show';
        formulaBox.innerHTML = '<b>算式讲解</b>：声音走的路程 = 人到山崖距离 × 2。<br>s<sub>声</sub> = v·t = 340 m/s × ' + curT + ' s = ' + (V * curT) + ' m<br>s = s<sub>声</sub> ÷ 2 = ' + (V * curT) + ' ÷ 2 = <b>约 ' + answer + ' m</b>';
      });
    }
  });
  quizInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') document.getElementById('quizCheck').click(); });
  document.getElementById('newQuiz').addEventListener('click', genQuiz);

  // ===== Tab 切换 =====
  var tabs = document.querySelectorAll('.mode-tab');
  var panels = document.querySelectorAll('.panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('on'); });
      panels.forEach(function (p) { p.classList.remove('on'); });
      tab.classList.add('on');
      var target = document.querySelector('.panel[data-p="' + tab.dataset.p + '"]');
      if (target) target.classList.add('on');
    });
  });

  update();
})();

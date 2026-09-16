/** exp-slope.js — 斜面小车测平均速度（示意动画 + 可调参数） */
(function(){
  'use strict';

  // ===== DOM =====
  var svg = document.getElementById('slopeSvg');
  var sceneGroup = document.getElementById('sceneGroup');
  var slopeRange = document.getElementById('slopeRange');
  var slopeLabel = document.getElementById('slopeLabel');
  var timerMode = document.getElementById('timerMode');
  var gateSelect = document.getElementById('gateSelect');
  var releaseBtn = document.getElementById('releaseBtn');
  var startTimerBtn = document.getElementById('startTimerBtn');
  var stopTimerBtn = document.getElementById('stopTimerBtn');
  var resetBtn = document.getElementById('resetBtn');
  var stopwatch = document.getElementById('stopwatch');
  var manualHint = document.getElementById('manualHint');
  var statusBar = document.getElementById('statusBar');
  var stepTip = document.getElementById('stepTip');
  var s1Input = document.getElementById('s1');
  var t1Input = document.getElementById('t1');
  var v1Cell = document.getElementById('v1');
  var s2Input = document.getElementById('s2');
  var t2Input = document.getElementById('t2');
  var v2Cell = document.getElementById('v2');
  var s3Cell = document.getElementById('s3');
  var t3Cell = document.getElementById('t3');
  var v3Cell = document.getElementById('v3');
  var repeatCard = document.getElementById('repeatCard');
  var repeatTable = document.getElementById('repeatTable');

  // ===== 配置 =====
  var SLOPE_LABELS = ['低', '中', '高'];
  var SLOPE_ANGLES = [8, 14, 20];          // 仅画面倾角（度）
  var BASE_DURATIONS = [3.5, 2.5, 1.8];    // 低/中/高坡度，全程 100 cm 的示意时长（秒）
  var TRACK_LEN_CM = 100;                  // 斜面刻度 0~100 cm
  var MIDDLE_CM = 50;

  // ===== 状态 =====
  var state = {
    slope: 1,            // 0/1/2
    mode: 'auto',        // 'auto' | 'manual'
    gate: 'bottom',      // 'bottom' | 'middle'
    step: 1,             // 1~5
    running: false,
    manualTiming: false,
    startTime: 0,
    elapsed: 0,
    animationId: null,
    carProgress: 0,      // 0~1（沿斜面全程）
    repeatRows: []
  };

  // ===== 工具 =====
  function fmt(n, d){ if (n === '' || n == null || isNaN(n)) return '—'; return Number(n).toFixed(d); }
  function parseVal(el){ var v = parseFloat(el.value); return isNaN(v) ? null : v; }

  function setStep(n){
    state.step = Math.max(1, Math.min(5, n));
    Array.prototype.forEach.call(statusBar.children, function(ch){
      ch.classList.toggle('active', parseInt(ch.dataset.step, 10) === state.step);
    });
    var tips = [
      '把长木板一端用木块垫起，底端放置金属片。',
      '用刻度尺读出小车将要通过的全程路程 s₁。',
      '从顶端静止释放小车，记录撞击金属片的时间 t₁，计算 v₁。',
      '把金属片移到斜面中部，读出上半段路程 s₂。',
      '重新从顶端释放，记录上半段时间 t₂，并思考下半段怎么求。'
    ];
    stepTip.textContent = tips[state.step - 1];
  }

  // ===== SVG 绘图 =====
  function drawScene(){
    var vbW = 800, vbH = 320;
    var angleDeg = SLOPE_ANGLES[state.slope];
    var angle = angleDeg * Math.PI / 180;
    var padL = 90, padB = 70;
    var trackLenPx = 560;
    var x0 = padL, y0 = vbH - padB;
    var x1 = x0 + trackLenPx * Math.cos(angle);
    var y1 = y0 - trackLenPx * Math.sin(angle);

    sceneGroup.innerHTML = '';

    var blockW = 50, blockH = 18 + state.slope * 16;
    var block = makeRect(x0 - blockW - 4, y0 + 4, blockW, blockH, '#a67c52', '#7a5a3a', 3);
    sceneGroup.appendChild(block);

    var boardThick = 14;
    var board = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    var dx = Math.cos(angle) * boardThick, dy = Math.sin(angle) * boardThick;
    var d = 'M' + x0 + ',' + y0 + ' L' + x1 + ',' + y1 +
            ' l' + dx + ',' + dy + ' L' + (x0 + dx) + ',' + (y0 + dy) + ' Z';
    board.setAttribute('d', d);
    board.setAttribute('fill', 'url(#wood)');
    board.setAttribute('stroke', '#8f6a40');
    board.setAttribute('stroke-width', '1');
    sceneGroup.appendChild(board);

    sceneGroup.appendChild(makeRuler(x1, y1, x0, y0, angle));

    var gateCm = state.gate === 'bottom' ? TRACK_LEN_CM : MIDDLE_CM;
    var gPos = posOnTrack(x1, y1, x0, y0, gateCm / TRACK_LEN_CM);
    sceneGroup.appendChild(makeGate(gPos.x, gPos.y, angle));

    var cPos = posOnTrack(x1, y1, x0, y0, state.carProgress);
    sceneGroup.appendChild(makeCar(cPos.x, cPos.y, angle));

    addText('斜面小车实验（示意图）', vbW / 2, 30, 'middle', '15px', 'var(--ink2)');
  }

  function posOnTrack(xTop, yTop, xBot, yBot, p){
    return { x: xTop + (xBot - xTop) * p, y: yTop + (yBot - yTop) * p };
  }

  function makeRect(x, y, w, h, fill, stroke, r){
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    el.setAttribute('x', x); el.setAttribute('y', y);
    el.setAttribute('width', w); el.setAttribute('height', h);
    el.setAttribute('rx', r || 0); el.setAttribute('fill', fill);
    if(stroke) el.setAttribute('stroke', stroke);
    return el;
  }

  function makeRuler(xTop, yTop, xBot, yBot, angle){
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var offset = 32;
    var rulerLen = Math.hypot(xBot - xTop, yBot - yTop);
    var dx = xBot - xTop, dy = yBot - yTop;
    var ux = dx / rulerLen, uy = dy / rulerLen;
    var rx0 = xTop + ux * (-8) + Math.sin(angle) * offset;
    var ry0 = yTop + uy * (-8) + Math.cos(angle) * offset;
    var rx1 = xBot + ux * 8 + Math.sin(angle) * offset;
    var ry1 = yBot + uy * 8 + Math.cos(angle) * offset;
    var rPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    var perpX = -uy * 8, perpY = ux * 8;
    rPath.setAttribute('d', 'M' + rx0 + ',' + ry0 + ' L' + rx1 + ',' + ry1 +
                       'l' + perpX + ',' + perpY + ' L' + (rx0 + perpX) + ',' + (ry0 + perpY) + ' Z');
    rPath.setAttribute('fill', '#f7f4ed');
    rPath.setAttribute('stroke', '#b0a08a');
    g.appendChild(rPath);

    for(var cm = 0; cm <= TRACK_LEN_CM; cm += 10){
      var p = cm / TRACK_LEN_CM;
      var bx = xTop + dx * p, by = yTop + dy * p;
      var ox = Math.sin(angle) * offset, oy = Math.cos(angle) * offset;
      var tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', bx + ox * 0.25); tick.setAttribute('y1', by + oy * 0.25);
      tick.setAttribute('x2', bx + ox); tick.setAttribute('y2', by + oy);
      tick.setAttribute('stroke', '#7a6a55');
      tick.setAttribute('stroke-width', '2');
      g.appendChild(tick);
      addTextTo(cm, bx + ox - uy * 10, by + oy + ux * 10, 'middle', '11px', '#5a5040', g);
    }
    return g;
  }

  function makeGate(x, y, angle){
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var w = 34, h = 42;
    g.appendChild(makeRect(-w/2, -h, w, 8, '#95a5a6', '#7f8c8d', 2));
    g.appendChild(makeRect(-3, -h + 8, 6, h - 8, '#7f8c8d', null, 2));
    g.appendChild(makeRect(-16, -4, 32, 8, '#5d6d7e', null, 3));
    g.setAttribute('transform', 'translate(' + x + ',' + y + ') rotate(' + (-angle * 180 / Math.PI) + ')');
    g.setAttribute('id', 'gateGroup');
    return g;
  }

  function makeCar(x, y, angle){
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var bodyW = 46, bodyH = 22, cabinW = 26, cabinH = 14;
    g.appendChild(makeRect(-bodyW/2, -bodyH, bodyW, bodyH, 'url(#carGrad)', '#a93226', 4));
    g.appendChild(makeRect(-cabinW/2, -bodyH - cabinH + 4, cabinW, cabinH, '#ecf0f1', '#bdc3c7', 3));
    g.appendChild(makeCircle(-14, -4, 6, '#2c3e50'));
    g.appendChild(makeCircle(14, -4, 6, '#2c3e50'));
    g.setAttribute('transform', 'translate(' + x + ',' + y + ') rotate(' + (-angle * 180 / Math.PI) + ')');
    g.setAttribute('id', 'carGroup');
    return g;
  }

  function makeCircle(cx, cy, r, fill){
    var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r); c.setAttribute('fill', fill);
    return c;
  }

  function addTextTo(text, x, y, anchor, size, color, parent){
    var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('text-anchor', anchor || 'start');
    t.setAttribute('font-size', size || '13px');
    t.setAttribute('fill', color || 'var(--ink)');
    t.setAttribute('font-family', '-apple-system, PingFang SC, Microsoft YaHei, sans-serif');
    t.textContent = text;
    parent.appendChild(t);
  }

  function addText(text, x, y, anchor, size, color){
    addTextTo(text, x, y, anchor, size, color, sceneGroup);
  }

  function beep(){
    try{
      var AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      var ctx = new AC();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(); osc.stop(ctx.currentTime + 0.18);
    }catch(e){}
  }

  function flashGate(){
    var gate = document.getElementById('gateGroup');
    if(gate){ gate.classList.remove('flash'); void gate.offsetWidth; gate.classList.add('flash'); }
    var wrap = document.querySelector('.scene-wrap');
    if(wrap){
      wrap.style.transition = 'background .08s';
      wrap.style.background = 'rgba(255,255,220,.45)';
      setTimeout(function(){ wrap.style.background = ''; }, 120);
    }
  }

  function targetProgress(){ return state.gate === 'bottom' ? 1 : MIDDLE_CM / TRACK_LEN_CM; }
  function baseDuration(){ return BASE_DURATIONS[state.slope]; }

  function startRun(){
    if(state.running) return;
    state.running = true;
    state.carProgress = 0;
    state.elapsed = 0;
    stopwatch.textContent = '0.00';
    if(state.mode === 'auto'){
      animate();
    } else {
      releaseBtn.style.display = 'none';
      startTimerBtn.style.display = 'inline-flex';
      stopTimerBtn.style.display = 'none';
      startTimerBtn.disabled = false;
      setStep(state.gate === 'bottom' ? 3 : 5);
    }
    drawScene();
  }

  function animate(){
    var target = targetProgress();
    var duration = baseDuration() * 1000;
    var stopAt = Math.sqrt(target);
    var began = performance.now();
    state.startTime = began;
    state.animationId = requestAnimationFrame(frame);
    function frame(now){
      var raw = Math.min(stopAt, (now - began) / duration);
      state.carProgress = raw * raw;
      state.elapsed = (now - began) / 1000;
      stopwatch.textContent = state.elapsed.toFixed(2);
      drawScene();
      if(raw < stopAt){ state.animationId = requestAnimationFrame(frame); }
      else { finishRun(); }
    }
  }

  function startManualTimer(){
    if(!state.running || state.manualTiming) return;
    state.manualTiming = true;
    state.startTime = performance.now();
    startTimerBtn.style.display = 'none';
    stopTimerBtn.style.display = 'inline-flex';
    animateManual();
  }

  function animateManual(){
    var target = targetProgress();
    var duration = baseDuration() * 1000;
    var stopAt = Math.sqrt(target);
    var began = performance.now();
    state.animationId = requestAnimationFrame(frame);
    function frame(now){
      var raw = Math.min(stopAt, (now - began) / duration);
      state.carProgress = raw * raw;
      state.elapsed = (now - state.startTime) / 1000;
      stopwatch.textContent = state.elapsed.toFixed(2);
      drawScene();
      if(raw < stopAt){ state.animationId = requestAnimationFrame(frame); }
      else { finishRun(); }
    }
  }

  function stopManualTimer(){
    if(!state.running || !state.manualTiming) return;
    cancelAnimationFrame(state.animationId);
    state.elapsed += 0.10 + Math.random() * 0.30;
    stopwatch.textContent = state.elapsed.toFixed(2);
    state.manualTiming = false;
    stopTimerBtn.style.display = 'none';
    releaseBtn.style.display = 'inline-flex';
    finishRun();
  }

  function finishRun(){
    state.running = false;
    cancelAnimationFrame(state.animationId);
    flashGate(); beep();
    var rounded = Number(state.elapsed.toFixed(2));
    if(state.gate === 'bottom'){ t1Input.value = rounded; setStep(3); }
    else { t2Input.value = rounded; setStep(5); }
    computeTable();
    if(state.mode === 'manual') addRepeatRow();
  }

  function computeTable(){
    var s1 = parseVal(s1Input), t1 = parseVal(t1Input);
    var s2 = parseVal(s2Input), t2 = parseVal(t2Input);
    v1Cell.textContent = (s1 != null && t1 != null && t1 > 0) ? fmt(s1 / t1, 2) : '—';
    v2Cell.textContent = (s2 != null && t2 != null && t2 > 0) ? fmt(s2 / t2, 2) : '—';
    if(s1 != null && s2 != null){
      var s3 = s1 - s2;
      s3Cell.textContent = fmt(s3, 1);
      if(t1 != null && t2 != null && t1 > t2){
        var t3 = t1 - t2;
        t3Cell.textContent = fmt(t3, 2);
        v3Cell.textContent = (t3 > 0) ? fmt(s3 / t3, 2) : '—';
      } else { t3Cell.textContent = '—'; v3Cell.textContent = '—'; }
    } else { s3Cell.textContent = '—'; t3Cell.textContent = '—'; v3Cell.textContent = '—'; }
  }

  function addRepeatRow(){
    var s1 = parseVal(s1Input), t1 = parseVal(t1Input);
    if(s1 == null || t1 == null || t1 <= 0) return;
    state.repeatRows.push({ s: s1, t: t1, v: s1 / t1 });
    renderRepeatTable();
  }

  function renderRepeatTable(){
    var tb = repeatTable.querySelector('tbody');
    if(!tb){ tb = document.createElement('tbody'); repeatTable.appendChild(tb); }
    tb.innerHTML = '';
    var sumV = 0;
    state.repeatRows.forEach(function(row, idx){
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + (idx + 1) + '</td><td>' + fmt(row.s, 1) + '</td><td>' + fmt(row.t, 2) + '</td><td>' + fmt(row.v, 2) + '</td>';
      tb.appendChild(tr); sumV += row.v;
    });
    if(state.repeatRows.length >= 2){
      var tr = document.createElement('tr');
      tr.innerHTML = '<td class="hl">平均</td><td class="hl">—</td><td class="hl">—</td><td class="hl">' + fmt(sumV / state.repeatRows.length, 2) + '</td>';
      tb.appendChild(tr);
    }
  }

  function resetRun(){
    cancelAnimationFrame(state.animationId);
    state.running = false;
    state.manualTiming = false;
    state.carProgress = 0;
    state.elapsed = 0;
    stopwatch.textContent = '0.00';
    releaseBtn.style.display = 'inline-flex';
    startTimerBtn.style.display = 'none';
    stopTimerBtn.style.display = 'none';
    drawScene();
  }

  slopeRange.addEventListener('input', function(){
    state.slope = parseInt(slopeRange.value, 10);
    slopeLabel.textContent = SLOPE_LABELS[state.slope];
    drawScene();
  });

  timerMode.addEventListener('change', function(){
    state.mode = timerMode.value;
    if(state.mode === 'manual'){ manualHint.style.display = 'block'; repeatCard.style.display = 'block'; }
    else { manualHint.style.display = 'none'; repeatCard.style.display = 'none'; }
    resetRun();
  });

  gateSelect.addEventListener('change', function(){
    state.gate = gateSelect.value;
    setStep(state.gate === 'bottom' ? 2 : 4);
    resetRun();
  });

  releaseBtn.addEventListener('click', function(){
    if(state.mode === 'auto') startRun();
    else { releaseBtn.style.display = 'none'; startTimerBtn.style.display = 'inline-flex'; startRun(); }
  });

  startTimerBtn.addEventListener('click', startManualTimer);
  stopTimerBtn.addEventListener('click', stopManualTimer);
  resetBtn.addEventListener('click', resetRun);

  [s1Input, t1Input, s2Input, t2Input].forEach(function(el){
    el.addEventListener('input', computeTable);
  });

  document.addEventListener('keydown', function(e){
    if(e.code === 'Space' && state.manualTiming){ e.preventDefault(); stopManualTimer(); }
  });

  setStep(1);
  computeTable();
  drawScene();
  window.addEventListener('resize', drawScene);

})();

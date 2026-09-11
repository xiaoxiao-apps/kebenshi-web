/* ============================================================
   exp-ruler.js — 实验一：刻度尺读数（允许 ±0.02 cm 估读误差）
   ============================================================ */
(function(){
  var cv = document.getElementById('rulerCv');
  var readoutBar = document.getElementById('rulerReadoutBar');
  var g = fitCanvas(cv, getCssH(cv, readoutBar));
  var state = { startCm: 1.0, lengthCm: 2.35, rangeCm: 8, unit: 'cm', feedback: '', correct: false, quizMode: false };
  var drag = { active: false, body: false, tip: false, offsetCm: 0, pxPerCm: 0 };
  var wrap = document.getElementById('fsRulerWrap');

  function cmToPx(cm, ppc){ return cm * (ppc || drag.pxPerCm); }
  function pxToCm(px, ppc){ return px / (ppc || drag.pxPerCm); }

  function isFullscreen(){
    return document.fullscreenElement === wrap || wrap.classList.contains('pseudo-fullscreen');
  }

  // 全屏时把「量程两行字+铅笔+尺子」整块对准屏幕垂直中心；非全屏保持原布局
  function layoutY(h){
    if(!isFullscreen()) return { rulerY: h * 0.55, textY: 22 };
    var top = cv.getBoundingClientRect().top || 0;
    var center = window.innerHeight / 2 - top; // 屏幕中心换算到 canvas 坐标
    var textY = center - 52;                   // 两行字(24+间距)+铅笔(尺上42)+尺36 的整块中心
    var rulerY = center + 24;
    if(textY < 10){ var d = 10 - textY; textY += d; rulerY += d; }
    if(rulerY + 36 > h - 8){ var d2 = rulerY + 36 - (h - 8); rulerY -= d2; textY -= d2; }
    return { rulerY: rulerY, textY: textY };
  }

  function pencilBox(st, ppc, g2){
    var w = (g2 || {}).w || cv.width;
    var h = (g2 || {}).h || cv.height;
    var margin = 36;
    var rulerY = layoutY(h).rulerY;
    var rulerW = w - margin * 2;
    var leftX = margin;
    var pxPerCm = ppc || (rulerW / state.rangeCm);
    var startX = leftX + st.startCm * pxPerCm;
    var endX = startX + st.lengthCm * pxPerCm;
    return { x: startX - 4, y: rulerY - 26, w: endX - startX + 8, h: 32 };
  }

  function hitPencilBody(x, y, st, g2){
    var b = pencilBox(st, null, g2);
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  }

  function hitPencilTip(x, y, st, g2){
    var b = pencilBox(st, null, g2);
    var tipX = b.x + b.w - 8;
    return x >= tipX - 12 && x <= tipX + 12 && y >= b.y && y <= b.y + b.h;
  }

  function updateReadouts(){
    document.getElementById('readoutStart').textContent = state.startCm.toFixed(2);
    document.getElementById('readoutEnd').textContent = (state.startCm + state.lengthCm).toFixed(2);
    document.getElementById('readoutLen').textContent = state.lengthCm.toFixed(2);
    var lenCard = document.getElementById('readoutLenCard');
    if (lenCard) lenCard.style.display = state.quizMode ? 'none' : '';
  }

  function generate(){
    state.quizMode = true;
    var r = state.rangeCm;
    state.startCm = Math.round((1.0 + Math.random() * Math.max(0.1, r - 2.5)) * 10) / 10;
    var maxLen = r - state.startCm;
    var lenBase = 1.50 + Math.random() * Math.min(4.30, maxLen - 1.50);
    var mm = Math.round(lenBase * 100) / 100;
    state.lengthCm = mm;
    state.feedback = ''; state.correct = false;
    document.getElementById('rulerAns').value = '';
    var fsAns = document.getElementById('rulerAnsFs');
    if(fsAns) fsAns.value = '';
    setFsFb(document.getElementById('rulerFbFs'), '', 'info');
    draw(g, state);
    updateReadouts();
    setFb('', 'info');
  }

  function draw(g2, st){
    var ctx = g2.ctx, w = g2.w, h = g2.h;
    ctx.clearRect(0, 0, w, h);
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#f5f0e0'); grad.addColorStop(1, '#eef6ec');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    var margin = 36;
    var ly = layoutY(h);
    var rulerY = ly.rulerY;
    var rulerW = w - margin * 2;
    var leftX = margin, rightX = w - margin;
    var pxPerCm = rulerW / st.rangeCm;

    ctx.save();
    ctx.fillStyle = '#ffffff'; roundRectPath(ctx, leftX, rulerY, rulerW, 36, 4); ctx.fill();
    ctx.strokeStyle = '#2c2c2c'; ctx.lineWidth = 1; ctx.strokeRect(leftX, rulerY, rulerW, 36);
    ctx.fillStyle = '#2c2c2c'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var stepLabel = 1;
    if (pxPerCm < 18) stepLabel = 2;
    if (pxPerCm < 10) stepLabel = 5;
    for(var cm = 0; cm <= st.rangeCm; cm++){
      var x = leftX + cm * pxPerCm;
      ctx.beginPath(); ctx.moveTo(x, rulerY); ctx.lineTo(x, rulerY + 18); ctx.lineWidth = 1.5; ctx.stroke();
      if (cm % stepLabel === 0) ctx.fillText(cm, x, rulerY + 27);
    }
    if (pxPerCm >= 10) {
      for(var cm2 = 0; cm2 < st.rangeCm; cm2++){
        for(var mm = 1; mm < 10; mm++){
          if (st.rangeCm > 12 && pxPerCm < 24 && mm !== 5) continue;
          var xm = leftX + (cm2 + mm / 10) * pxPerCm;
          var tickH = mm === 5 ? 12 : 7;
          ctx.beginPath(); ctx.moveTo(xm, rulerY); ctx.lineTo(xm, rulerY + tickH); ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
    ctx.restore();

    var startX = leftX + st.startCm * pxPerCm;
    var endX = startX + st.lengthCm * pxPerCm;
    var pencilY = rulerY - 24;
    drawPencil(ctx, startX, pencilY, endX, 18);

    ctx.save();
    ctx.fillStyle = '#2c2c2c'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('量程：0 ~ ' + st.rangeCm + ' cm　　分度值：1 mm', margin, ly.textY);
    ctx.fillStyle = '#5a5a5a'; ctx.font = '13px sans-serif';
    ctx.fillText('请读出物体的长度（注意估读到分度值下一位）', margin, ly.textY + 24);
    ctx.restore();
  }

  function drawPencil(ctx, startX, pencilY, endX, pencilH){
    var pencilW = endX - startX;
    var centerY = pencilY + pencilH / 2;
    // 橡皮/金属箍/削尖笔头用固定物理尺寸，拉长时只伸笔身；过短时整体等比收缩
    var eraserW = 14, ferruleW = 9, tipW = 26;
    var fixedSum = eraserW + ferruleW + tipW;
    if (fixedSum > pencilW * 0.8) {
      var k = Math.max(0.35, (pencilW * 0.8) / fixedSum);
      eraserW *= k; ferruleW *= k; tipW *= k;
    }
    var bodyEndX = endX - tipW;
    var eraserX = startX;
    var ferruleX = startX + eraserW;
    var bodyStartX = ferruleX + ferruleW;
    var bodyEndX2 = endX - tipW;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.filter = 'blur(4px)';
    ctx.beginPath();
    ctx.ellipse((startX + endX) / 2, pencilY + pencilH + 4, pencilW / 2 + 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();

    ctx.save();
    var eraserGrad = ctx.createLinearGradient(eraserX, pencilY, eraserX, pencilY + pencilH);
    eraserGrad.addColorStop(0, '#f4a3b3');
    eraserGrad.addColorStop(0.3, '#ffccd5');
    eraserGrad.addColorStop(0.6, '#f7a8b8');
    eraserGrad.addColorStop(1, '#e58ca0');
    ctx.fillStyle = eraserGrad;
    roundRectPath(ctx, eraserX, pencilY, eraserW, pencilH, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,100,110,0.35)';
    ctx.lineWidth = 1;
    roundRectPath(ctx, eraserX, pencilY, eraserW, pencilH, 3);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(eraserX + eraserW - 2, pencilY + pencilH / 2, pencilH / 3, Math.PI / 2, -Math.PI / 2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    var ferruleGrad = ctx.createLinearGradient(ferruleX, pencilY, ferruleX, pencilY + pencilH);
    ferruleGrad.addColorStop(0, '#d7d7d7');
    ferruleGrad.addColorStop(0.2, '#f2f2f2');
    ferruleGrad.addColorStop(0.5, '#b0b0b0');
    ferruleGrad.addColorStop(0.8, '#e0e0e0');
    ferruleGrad.addColorStop(1, '#9a9a9a');
    ctx.fillStyle = ferruleGrad;
    roundRectPath(ctx, ferruleX, pencilY, ferruleW, pencilH, 1);
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,80,80,0.35)';
    ctx.lineWidth = 1;
    roundRectPath(ctx, ferruleX, pencilY, ferruleW, pencilH, 1);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(100,100,100,0.45)';
    ctx.lineWidth = 0.8;
    for (var i = 1; i <= 2; i++) {
      var lx = ferruleX + (ferruleW * i) / 3;
      ctx.beginPath();
      ctx.moveTo(lx, pencilY + 2);
      ctx.lineTo(lx, pencilY + pencilH - 2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    var bodyGrad = ctx.createLinearGradient(bodyStartX, pencilY - 2, bodyStartX, pencilY + pencilH + 2);
    bodyGrad.addColorStop(0, '#b88a2d');
    bodyGrad.addColorStop(0.08, '#f7c948');
    bodyGrad.addColorStop(0.22, '#f9d66a');
    bodyGrad.addColorStop(0.45, '#f7c948');
    bodyGrad.addColorStop(0.78, '#e6b635');
    bodyGrad.addColorStop(1, '#9f7326');
    ctx.fillStyle = bodyGrad;
    roundRectPath(ctx, bodyStartX, pencilY, bodyEndX2 - bodyStartX, pencilH, 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bodyStartX + 2, pencilY + 3);
    ctx.lineTo(bodyEndX2 - 2, pencilY + 3);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(160,110,40,0.55)';
    ctx.lineWidth = 1;
    var stripeX = bodyStartX + (bodyEndX2 - bodyStartX) * 0.25;
    ctx.beginPath();
    ctx.moveTo(stripeX, pencilY + 3);
    ctx.lineTo(stripeX, pencilY + pencilH - 3);
    ctx.stroke();
    ctx.save();
    ctx.fillStyle = 'rgba(130,90,30,0.25)';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.filter = 'blur(1px)';
    ctx.fillText('2B', bodyStartX + (bodyEndX2 - bodyStartX) * 0.55, centerY);
    ctx.restore();
    ctx.restore();

    ctx.save();
    var woodGrad = ctx.createLinearGradient(bodyEndX2, pencilY, bodyEndX2, pencilY + pencilH);
    woodGrad.addColorStop(0, '#e3cba0');
    woodGrad.addColorStop(0.4, '#f3e3c4');
    woodGrad.addColorStop(1, '#c9a66b');
    ctx.fillStyle = woodGrad;
    ctx.beginPath();
    ctx.moveTo(bodyEndX2, pencilY);
    ctx.lineTo(endX - 3, centerY);
    ctx.lineTo(bodyEndX2, pencilY + pencilH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(160,120,70,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.moveTo(endX - 3, centerY);
    ctx.lineTo(endX, centerY);
    var leadLen = 8;
    ctx.lineTo(endX - leadLen, centerY - 2);
    ctx.lineTo(endX - leadLen, centerY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function setFb(html, type){
    var el = document.getElementById('rulerFb');
    if(!html){ el.className = 'feedback'; el.innerHTML = ''; return; }
    el.className = 'feedback show ' + (type || 'info');
    el.innerHTML = html;
  }

  function setFsFb(el, html, type){
    if(!html){ el.className = 'feedback'; el.innerHTML = ''; return; }
    el.className = 'feedback show ' + (type || 'info');
    el.innerHTML = html;
  }

  function check(inputEl, fbEl){
    var raw = inputEl.value.trim().replace(/[，]/g, ',');
    if(!raw){ setFb('', 'info'); setFsFb(fbEl, '请先输入读数。', 'info'); return; }
    if(raw.indexOf('/') >= 0){ setFb('', 'info'); setFsFb(fbEl, '请输入小数，如 2.35。', 'err'); return; }
    var num = parseFloat(raw);
    if(Number.isNaN(num)){ setFb('', 'info'); setFsFb(fbEl, '请输入有效数字。', 'err'); return; }
    var unitEl = (inputEl.id === 'rulerAnsFs') ? document.getElementById('rulerUnitFs') : document.getElementById('rulerUnit');
    var unit = unitEl ? unitEl.value : 'cm';
    var inputCm = num;
    if(unit === 'mm') inputCm = num / 10;
    var correctVal = state.lengthCm;
    var inRange = Math.abs(inputCm - correctVal) < 0.02;
    var htmlOk = '✅ 正确！物体长度约为 <b>' + correctVal.toFixed(2) + ' cm</b>。<br>末端刻度 − 起始刻度 = ' + (state.startCm + state.lengthCm).toFixed(2) + ' − ' + state.startCm.toFixed(1) + ' = ' + correctVal.toFixed(2) + ' cm，估读到 0.01 cm。';
    var htmlErr = '❌ 再想想。正确读数是 <b>' + correctVal.toFixed(2) + ' cm</b>。<br>末端刻度 − 起始刻度 = ' + (state.startCm + state.lengthCm).toFixed(2) + ' − ' + state.startCm.toFixed(1) + ' = ' + correctVal.toFixed(2) + ' cm，估读到 0.01 cm。';
    if(inRange){
      state.correct = true;
      setFb(htmlOk, 'ok');
      setFsFb(fbEl, htmlOk, 'ok');
    } else {
      setFb(htmlErr, 'err');
      setFsFb(fbEl, htmlErr, 'err');
    }
  }

  function clampPencilToRange(){
    var r = state.rangeCm;
    if (state.startCm + state.lengthCm > r) {
      if (state.lengthCm > r - 0.5) {
        state.lengthCm = Math.max(0.5, Math.min(state.lengthCm, r - 0.01));
        state.startCm = 0;
        if (state.startCm + state.lengthCm > r) state.lengthCm = Math.max(0.5, r - state.startCm - 0.01);
      } else {
        state.startCm = r - state.lengthCm;
      }
    }
    state.startCm = Math.max(0, Math.min(r - 0.5, state.startCm));
  }

  function applyRange(raw){
    var el = document.getElementById('rulerRange');
    var v = parseInt(raw, 10);
    if (!Number.isFinite(v) || v < 2 || v > 30 || String(v) !== String(raw).trim()) {
      el.classList.add('invalid');
      return false;
    }
    el.classList.remove('invalid');
    if (v === state.rangeCm) return false;
    state.rangeCm = v;
    clampPencilToRange();
    draw(g, state);
    updateReadouts();
    var text = '量程 0~' + v + ' cm、分度值 1 mm 的刻度尺测铅笔长度';
    var sub = document.getElementById('rulerSubtitle');
    var lab = document.getElementById('rulerLabTitle');
    if (sub) sub.textContent = text + '，注意估读到分度值的下一位。';
    if (lab) lab.textContent = text;
    return true;
  }

  function bindRangeInput(){
    var el = document.getElementById('rulerRange');
    var timer = null;
    el.addEventListener('input', function(){
      if (timer) clearTimeout(timer);
      timer = setTimeout(function(){ applyRange(el.value); }, 500);
    });
    el.addEventListener('blur', function(){ applyRange(el.value); });
    el.addEventListener('keydown', function(e){ if(e.key === 'Enter') applyRange(el.value); });
  }

  document.getElementById('rulerCheck').addEventListener('click', function(){ check(document.getElementById('rulerAns'), document.getElementById('rulerFb')); });
  document.getElementById('rulerCheckFs').addEventListener('click', function(){ check(document.getElementById('rulerAnsFs'), document.getElementById('rulerFbFs')); });
  document.getElementById('rulerNext').addEventListener('click', generate);
  document.getElementById('rulerNextFs').addEventListener('click', generate);
  document.getElementById('rulerAns').addEventListener('keydown', function(e){ if(e.key === 'Enter') check(document.getElementById('rulerAns'), document.getElementById('rulerFb')); });
  document.getElementById('rulerAnsFs').addEventListener('keydown', function(e){ if(e.key === 'Enter') check(document.getElementById('rulerAnsFs'), document.getElementById('rulerFbFs')); });
  bindRangeInput();
  window.addEventListener('resize', function(){ g = fitCanvas(cv, getCssH(cv, readoutBar)); draw(g, state); updateReadouts(); });
  generate();

  FullscreenHelper.bind(
    document.getElementById('fsRulerWrap'),
    document.getElementById('fsRulerBtn'),
    function(){ g = fitCanvas(cv, getCssH(cv, readoutBar)); draw(g, state); }
  );

  (function dragQuiz(){
    var quiz = document.getElementById('fsRulerQuiz');
    var wrap = document.getElementById('fsRulerWrap');
    var dragging = false, ox = 0, oy = 0, forward = false;
    function isFs(){ return wrap.classList.contains('pseudo-fullscreen') || document.fullscreenElement === wrap; }
    function pt(e){ return e.touches && e.touches.length ? e.touches[0] : e; }
    function down(e){
      if(!isFs()) return;
      var t = e.target;
      if(t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'BUTTON' || (t.closest && t.closest('button'))) return;
      // 触摸点落在铅笔上时面板让路：转发给铅笔处理（拖铅笔+退出出题模式），不拖面板
      var pa = window.__rulerPencil;
      if (pa) {
        var p0 = pt(e);
        var cr = cv.getBoundingClientRect();
        if (pa.hit(p0.clientX - cr.left, p0.clientY - cr.top)) {
          forward = true;
          pa.down(e);
          e.preventDefault();
          return;
        }
      }
      dragging = true;
      var wr = wrap.getBoundingClientRect(), qr = quiz.getBoundingClientRect();
      quiz.style.right = 'auto'; quiz.style.transform = 'none';
      quiz.style.left = (qr.left - wr.left) + 'px'; quiz.style.top = (qr.top - wr.top) + 'px';
      var p = pt(e); ox = p.clientX - qr.left; oy = p.clientY - qr.top;
      e.preventDefault();
    }
    function move(e){
      if (forward) { var pa2 = window.__rulerPencil; if (pa2) pa2.move(e); e.preventDefault(); return; }
      if(!dragging) return;
      var p = pt(e);
      var wr = wrap.getBoundingClientRect(), qr = quiz.getBoundingClientRect();
      var x = p.clientX - ox - wr.left, y = p.clientY - oy - wr.top;
      x = Math.max(0, Math.min(x, wr.width - qr.width));
      y = Math.max(0, Math.min(y, wr.height - qr.height));
      quiz.style.left = x + 'px'; quiz.style.top = y + 'px';
      e.preventDefault();
    }
    function up(e){
      if (forward) { var pa3 = window.__rulerPencil; if (pa3) pa3.up(e); forward = false; return; }
      dragging = false;
    }
    quiz.addEventListener('mousedown', down);
    quiz.addEventListener('touchstart', down, {passive: false});
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, {passive: false});
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
  })();

  function pointerPos(e){
    var rect = cv.getBoundingClientRect();
    var p = e.touches && e.touches.length ? e.touches[0] : e;
    return { x: p.clientX - rect.left, y: p.clientY - rect.top };
  }

  function setCursor(name){ cv.style.cursor = name || ''; }

  function getPxPerCm(){ return (g.w - 72) / state.rangeCm; }

  function onPointerDown(e){
    if(e.type === 'touchstart') e.preventDefault();
    var p = pointerPos(e);
    var hitBody = hitPencilBody(p.x, p.y, state, g);
    var hitTip = hitPencilTip(p.x, p.y, state, g);
    if(!hitBody && !hitTip) return;
    if (state.quizMode) { state.quizMode = false; updateReadouts(); }
    drag.active = true;
    drag.body = hitBody && !hitTip;
    drag.tip = hitTip;
    drag.startX = p.x;
    drag.pxPerCm = getPxPerCm();
    drag.startDragCm = state.startCm;
    if(hitTip){ setCursor('ew-resize'); } else { setCursor('grabbing'); }
  }

  function onPointerMove(e){
    if(e.type === 'touchmove') e.preventDefault();
    var p = pointerPos(e);
    if(!drag.active){
      var hBody = hitPencilBody(p.x, p.y, state, g);
      var hTip = hitPencilTip(p.x, p.y, state, g);
      if(hTip){ setCursor('ew-resize'); }
      else if(hBody){ setCursor('grab'); }
      else { setCursor(''); }
      return;
    }
    if(drag.tip){
      var ppc = drag.pxPerCm || getPxPerCm();
      var b = pencilBox(state, ppc, g);
      var leftX = b.x + 4;
      var rawLen = pxToCm(p.x - leftX, ppc);
      var maxLen = state.rangeCm - state.startCm;
      var newLen = Math.max(0.5, Math.min(maxLen, Math.round(rawLen * 100) / 100));
      if (Math.abs(newLen - state.lengthCm) > 0.0001) {
        state.lengthCm = newLen;
        updateReadouts();
        draw(g, state);
      }
      return;
    }
    if(!drag.body) return;
    var rawStart = drag.startDragCm + pxToCm(p.x - drag.startX, drag.pxPerCm);
    var newStart = Math.max(0.0, Math.min(state.rangeCm - state.lengthCm, Math.round(rawStart * 100) / 100));
    state.startCm = newStart;
    updateReadouts();
    draw(g, state);
  }

  function onPointerUp(e){
    if(!drag.active) return;
    var wasTip = drag.tip;
    drag.active = false; drag.body = false; drag.tip = false;
    if(wasTip){ setCursor(''); }
    else { setCursor(''); }
  }

  cv.addEventListener('mousedown', onPointerDown);
  cv.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  cv.addEventListener('touchstart', onPointerDown, { passive: false });
  cv.addEventListener('touchmove', onPointerMove, { passive: false });
  cv.addEventListener('touchend', onPointerUp);
  cv.addEventListener('touchcancel', onPointerUp);

  // 暴露铅笔命中+处理给全屏答题面板：面板盖住铅笔时触摸转发，保证铅笔永远可拖
  window.__rulerPencil = {
    hit: function(x, y){ return hitPencilBody(x, y, state, g) || hitPencilTip(x, y, state, g); },
    down: onPointerDown,
    move: onPointerMove,
    up: onPointerUp
  };
})();

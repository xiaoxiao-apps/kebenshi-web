/* ============================================================
   exp-ruler.js — 实验一：刻度尺读数（允许 ±0.02 cm 估读误差）
   ============================================================ */
(function(){
  var cv = document.getElementById('rulerCv');
  var g = fitCanvas(cv, getCssH(cv));
  var state = { startCm: 1.0, lengthCm: 2.35, unit: 'cm', feedback: '', correct: false };

  function generate(){
    state.startCm = Math.round((1.0 + Math.random() * 4.0) * 10) / 10;
    var maxLen = 8.0 - state.startCm;
    var lenBase = 1.50 + Math.random() * Math.min(2.80, maxLen - 1.50);
    var mm = Math.round(lenBase * 100) / 100;
    state.lengthCm = mm;
    state.feedback = ''; state.correct = false;
    document.getElementById('rulerAns').value = '';
    draw(g, state);
    setFb('', 'info');
  }

  function draw(g2, st){
    var ctx = g2.ctx, w = g2.w, h = g2.h;
    ctx.clearRect(0, 0, w, h);
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#f5f0e0'); grad.addColorStop(1, '#eef6ec');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    var margin = 36;
    var rulerY = h * 0.55;
    var rulerW = w - margin * 2;
    var leftX = margin, rightX = w - margin;
    var pxPerCm = rulerW / 8.0;

    ctx.save();
    ctx.fillStyle = '#ffffff'; roundRectPath(ctx, leftX, rulerY, rulerW, 36, 4); ctx.fill();
    ctx.strokeStyle = '#2c2c2c'; ctx.lineWidth = 1; ctx.strokeRect(leftX, rulerY, rulerW, 36);
    ctx.fillStyle = '#2c2c2c'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for(var cm = 0; cm <= 8; cm++){
      var x = leftX + cm * pxPerCm;
      ctx.beginPath(); ctx.moveTo(x, rulerY); ctx.lineTo(x, rulerY + 18); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillText(cm, x, rulerY + 27);
    }
    for(var cm2 = 0; cm2 < 8; cm2++){
      for(var mm = 1; mm < 10; mm++){
        var xm = leftX + (cm2 + mm / 10) * pxPerCm;
        var tickH = mm === 5 ? 12 : 7;
        ctx.beginPath(); ctx.moveTo(xm, rulerY); ctx.lineTo(xm, rulerY + tickH); ctx.lineWidth = 1; ctx.stroke();
      }
    }
    ctx.restore();

    var startX = leftX + st.startCm * pxPerCm;
    var endX = startX + st.lengthCm * pxPerCm;
    var pencilY = rulerY - 24;
    drawPencil(ctx, startX, pencilY, endX, 18);

    ctx.save();
    ctx.strokeStyle = '#2980b9'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(startX, rulerY + 42); ctx.lineTo(startX, rulerY + 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(endX, rulerY + 42); ctx.lineTo(endX, rulerY + 60); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#2980b9'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('物体左端对齐 ' + st.startCm.toFixed(1) + ' cm', (startX + endX) / 2, rulerY + 72);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#2c2c2c'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('量程：0 ~ 8 cm　　分度值：1 mm', margin, 22);
    ctx.fillStyle = '#5a5a5a'; ctx.font = '13px sans-serif';
    ctx.fillText('请读出物体的长度（注意估读到分度值下一位）', margin, 46);
    ctx.restore();
  }

  function drawPencil(ctx, startX, pencilY, endX, pencilH){
    var pencilW = endX - startX;
    var centerY = pencilY + pencilH / 2;
    var eraserW = Math.max(10, pencilW * 0.08);
    var ferruleW = Math.max(6, pencilW * 0.05);
    var tipW = Math.max(18, pencilW * 0.12);
    var bodyEndX = endX - tipW;
    var bodyW = bodyEndX - (startX + eraserW + ferruleW);
    if (bodyW < 4) {
      tipW = Math.max(12, pencilW * 0.5);
      bodyEndX = endX - tipW;
    }
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

  function check(){
    var raw = document.getElementById('rulerAns').value.trim().replace(/[，]/g, ',');
    if(!raw){ setFb('请先输入读数。', 'info'); return; }
    if(raw.indexOf('/') >= 0){ setFb('请输入小数，如 2.35。', 'err'); return; }
    var num = parseFloat(raw);
    if(Number.isNaN(num)){ setFb('请输入有效数字。', 'err'); return; }
    var unit = document.getElementById('rulerUnit').value;
    var inputCm = num;
    if(unit === 'mm') inputCm = num / 10;
    var correctVal = state.lengthCm;
    var inRange = Math.abs(inputCm - correctVal) < 0.02;
    if(inRange){
      state.correct = true;
      setFb('✅ 正确！物体长度约为 <b>' + correctVal.toFixed(2) + ' cm</b>。<br>末端刻度 − 起始刻度 = ' + (state.startCm + state.lengthCm).toFixed(2) + ' − ' + state.startCm.toFixed(1) + ' = ' + correctVal.toFixed(2) + ' cm，估读到 0.01 cm。', 'ok');
    } else {
      setFb('❌ 再想想。正确读数是 <b>' + correctVal.toFixed(2) + ' cm</b>。<br>末端刻度 − 起始刻度 = ' + (state.startCm + state.lengthCm).toFixed(2) + ' − ' + state.startCm.toFixed(1) + ' = ' + correctVal.toFixed(2) + ' cm，估读到 0.01 cm。', 'err');
    }
  }

  document.getElementById('rulerCheck').addEventListener('click', check);
  document.getElementById('rulerNext').addEventListener('click', generate);
  document.getElementById('rulerAns').addEventListener('keydown', function(e){ if(e.key === 'Enter') check(); });
  window.addEventListener('resize', function(){ g = fitCanvas(cv, getCssH(cv)); draw(g, state); });
  generate();

  FullscreenHelper.bind(
    document.getElementById('fsRulerWrap'),
    document.getElementById('fsRulerBtn'),
    function(){ g = fitCanvas(cv, getCssH(cv)); draw(g, state); }
  );
})();

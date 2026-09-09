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
    ctx.save();
    ctx.fillStyle = '#e08e5e'; roundRectPath(ctx, startX, pencilY, endX - startX, 18, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 1; roundRectPath(ctx, startX, pencilY, endX - startX, 18, 3); ctx.stroke();
    ctx.fillStyle = '#b8860b'; ctx.beginPath(); ctx.arc(startX, pencilY + 9, 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#8b6914'; ctx.beginPath();
    ctx.moveTo(endX - 6, pencilY); ctx.lineTo(endX + 4, pencilY + 9); ctx.lineTo(endX - 6, pencilY + 18); ctx.closePath(); ctx.fill();
    ctx.restore();

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

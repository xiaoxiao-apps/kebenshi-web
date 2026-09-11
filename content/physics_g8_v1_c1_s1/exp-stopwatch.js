/* ============================================================
   exp-stopwatch.js — 实验二：停表读数
   ============================================================ */
(function(){
  var cv = document.getElementById('stopwatchCv');
  var g = fitCanvas(cv, getCssH(cv));
  var running = false, startTime = 0, frozen = 0;
  var targetMin = 0, targetSec = 0, passedHalf = false;
  var autoTimer = null, targetTotalSec = 0, hasTarget = false;

  function clearAutoTimer(){ if(autoTimer){ clearTimeout(autoTimer); autoTimer = null; } }

  function initZero(){
    frozen = 0; running = false; clearAutoTimer();
    targetMin = 0; targetSec = 0; passedHalf = false; targetTotalSec = 0; hasTarget = false;
    document.getElementById('swMin').value = '';
    document.getElementById('swSec').value = '';
    var fb = document.getElementById('swFb');
    fb.className = 'feedback'; fb.innerHTML = '';
  }

  function runToTarget(){
    running = true; startTime = performance.now();
    var total = targetMin * 60 + targetSec;
    var t0 = performance.now();
    function step(){
      if(!running) return;
      var k = Math.min(1, (performance.now() - t0) / 900);
      frozen = total * k;
      startTime = performance.now();
      if(k < 1){ requestAnimationFrame(step); }
      else { running = false; frozen = total; }
    }
    requestAnimationFrame(step);
  }

  function resetTarget(){
    clearAutoTimer();
    targetMin = Math.floor(1 + Math.random() * 2);
    targetSec = Math.round(Math.random() * 599) / 10;
    passedHalf = targetSec >= 30;
    targetTotalSec = targetMin * 60 + targetSec;
    frozen = 0; running = false;
    document.getElementById('swMin').value = '';
    document.getElementById('swSec').value = '';
    var fb = document.getElementById('swFb');
    fb.className = 'feedback'; fb.innerHTML = '';
    hasTarget = true;
    autoTimer = setTimeout(runToTarget, 2000);
  }

  function totalSeconds(){ return running ? frozen + (performance.now() - startTime) / 1000 : frozen; }

  function totalToDisplay(t){
    var s = t % 60;
    return s;
  }

  function drawBtn(ctx, x, y, w2, h2, color, text){
    ctx.save();
    ctx.fillStyle = color; roundRectPath(ctx, x - w2 / 2, y - h2 / 2, w2, h2, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1; roundRectPath(ctx, x - w2 / 2, y - h2 / 2, w2, h2, 8); ctx.stroke();
    ctx.fillStyle = '#2c2c2c'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function insideBtn(px, py, x, y, w2, h2){ return px >= x - w2 / 2 && px <= x + w2 / 2 && py >= y - h2 / 2 && py <= y + h2 / 2; }

  function drawStopwatch(ctx, w, h){
    var cx = w * 0.5, cy = h * 0.52, r = Math.min(w, h) * 0.33;
    var sec = totalSeconds();
    var min = Math.floor(sec / 60);
    var s = sec % 60;

    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#f5f0e0'); grad.addColorStop(1, '#eef6ec');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.strokeStyle = '#a8b2ba'; ctx.lineWidth = r * 0.07;
    ctx.beginPath(); ctx.arc(cx, cy - r * 1.30, r * 0.26, Math.PI, 0); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#b8c2c8';
    ctx.fillRect(cx - r * 0.09, cy - r * 1.24, r * 0.18, r * 0.26);
    ctx.save();
    ctx.strokeStyle = '#8a949c'; ctx.lineWidth = 1;
    for(var kn = 0; kn < 4; kn += 1){
      var kx = cx - r * 0.06 + kn * r * 0.04;
      ctx.beginPath(); ctx.moveTo(kx, cy - r * 1.24); ctx.lineTo(kx, cy - r * 0.98); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = '#b8c2c8';
    ctx.fillRect(cx - r * 0.12, cy - r * 1.30, r * 0.24, r * 0.07);

    ctx.save();
    ctx.translate(cx - r * 0.78, cy - r * 0.78);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = '#b8c2c8';
    ctx.fillRect(-r * 0.055, -r * 0.26, r * 0.11, r * 0.28);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = '#9fadb6'; ctx.lineWidth = r * 0.09;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.07, 0, 7); ctx.stroke();
    ctx.strokeStyle = '#c8d2d8'; ctx.lineWidth = r * 0.02;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.02, 0, 7); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#f7f4ee'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
    ctx.strokeStyle = '#d8d2c6'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.985, 0, 7); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var R0 = r * 0.96;
    for(var k = 0; k <= 299; k += 1){
      var tang = (k / 300) * 2 * Math.PI - Math.PI / 2;
      var tx1 = cx + Math.cos(tang) * R0;
      var ty1 = cy + Math.sin(tang) * R0;
      var tx2 = cx + Math.cos(tang) * (R0 - r * 0.030);
      var ty2 = cy + Math.sin(tang) * (R0 - r * 0.030);
      ctx.beginPath(); ctx.moveTo(tx1, ty1); ctx.lineTo(tx2, ty2); ctx.strokeStyle = '#a8a8a8'; ctx.lineWidth = 0.75; ctx.stroke();
    }
    for(var i = 1; i <= 29; i += 2){
      var mang = (i / 30) * 2 * Math.PI - Math.PI / 2;
      var mx1 = cx + Math.cos(mang) * R0;
      var my1 = cy + Math.sin(mang) * R0;
      var mx2 = cx + Math.cos(mang) * (R0 - r * 0.055);
      var my2 = cy + Math.sin(mang) * (R0 - r * 0.055);
      ctx.beginPath(); ctx.moveTo(mx1, my1); ctx.lineTo(mx2, my2); ctx.strokeStyle = '#555555'; ctx.lineWidth = 1.2; ctx.stroke();
    }
    for(var i = 0; i <= 30; i += 2){
      var ang = (i / 30) * 2 * Math.PI - Math.PI / 2;
      var x1 = cx + Math.cos(ang) * R0;
      var y1 = cy + Math.sin(ang) * R0;
      var x2 = cx + Math.cos(ang) * (R0 - r * 0.095);
      var y2 = cy + Math.sin(ang) * (R0 - r * 0.095);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = '#333333'; ctx.lineWidth = 2; ctx.stroke();
      if(i > 0){
        ctx.save();
        ctx.translate(cx + Math.cos(ang) * (r * 0.76), cy + Math.sin(ang) * (r * 0.76));
        ctx.rotate(ang + Math.PI / 2);
        ctx.fillStyle = '#2c2c2c'; ctx.font = 'bold ' + (r * 0.105) + 'px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(i), 0, 0);
        ctx.restore();
      }
    }
    for(var rj = 31; rj <= 59; rj += 2){
      var redAng = ((rj - 30) / 30) * 2 * Math.PI - Math.PI / 2;
      ctx.save();
      ctx.translate(cx + Math.cos(redAng) * (r * 0.66), cy + Math.sin(redAng) * (r * 0.66));
      ctx.rotate(redAng + Math.PI / 2);
      ctx.fillStyle = '#c0392b'; ctx.font = 'bold ' + (r * 0.09) + 'px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(rj), 0, 0);
      ctx.restore();
    }
    ctx.restore();

    var scx = cx, scy = cy - r * 0.40, sr = r * 0.22;
    ctx.save();
    ctx.fillStyle = '#faf8f2'; ctx.beginPath(); ctx.arc(scx, scy, sr, 0, 7); ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(scx, scy, sr, 0, 7); ctx.stroke();
    for(var j = 0; j <= 30; j += 1){
      var isHalf = j % 2 === 1;
      var mang = (j / 30) * 2 * Math.PI - Math.PI / 2;
      var ml = isHalf ? sr * 0.12 : sr * 0.22;
      var mx1 = scx + Math.cos(mang) * sr, my1 = scy + Math.sin(mang) * sr;
      var mx2 = scx + Math.cos(mang) * (sr - ml), my2 = scy + Math.sin(mang) * (sr - ml);
      ctx.beginPath(); ctx.moveTo(mx1, my1); ctx.lineTo(mx2, my2);
      ctx.strokeStyle = isHalf ? '#c0392b' : '#333'; ctx.lineWidth = isHalf ? 1 : 1.5; ctx.stroke();
      if(!isHalf){
        var nval = j / 2;
        ctx.save();
        ctx.translate(scx + Math.cos(mang) * (sr * 0.64), scy + Math.sin(mang) * (sr * 0.64));
        ctx.rotate(mang + Math.PI / 2);
        ctx.fillStyle = '#333'; ctx.font = 'bold ' + Math.max(8, sr * 0.34) + 'px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(nval === 0 ? 15 : nval), 0, 0);
        ctx.restore();
      }
    }
    ctx.restore();

    var displayS = totalToDisplay(s);
    var secAng = (displayS / 30) * 2 * Math.PI - Math.PI / 2;
    var minAng = ((min % 15) / 15 + (s % 60) / (15 * 60)) * 2 * Math.PI - Math.PI / 2;
    ctx.save();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(secAng + Math.PI) * (r * 0.18), cy + Math.sin(secAng + Math.PI) * (r * 0.18));
    ctx.lineTo(cx + Math.cos(secAng) * (r * 0.90), cy + Math.sin(secAng) * (r * 0.90));
    ctx.stroke();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(scx, scy); ctx.lineTo(scx + Math.cos(minAng) * (sr * 0.70), scy + Math.sin(minAng) * (sr * 0.70)); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(scx, scy, sr * 0.10, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.05, 0, 7); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#5a5a5a'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('大表盘：0~30 s（0.1 s/格）  小表盘：0~15 min（0.5 min/格）', 10, 16);
    ctx.restore();

    drawBtn(ctx, w * 0.22, h - 40, 88, 44, '#7bc46e', running ? '停止' : '开始');
    drawBtn(ctx, w * 0.50, h - 40, 88, 44, '#c4a35a', '归零');
    drawBtn(ctx, w * 0.78, h - 40, 88, 44, '#8ecdf0', '出题');
  }

  function loop(){
    var ctx = g.ctx, w = g.w, h = g.h;
    drawStopwatch(ctx, w, h);
    requestAnimationFrame(loop);
  }

  function handleClick(e){
    var rect = cv.getBoundingClientRect();
    var px, py;
    if(e.changedTouches && e.changedTouches.length){
      px = e.changedTouches[0].clientX - rect.left; py = e.changedTouches[0].clientY - rect.top;
      e.preventDefault();
    } else { px = e.offsetX; py = e.offsetY; }
    var h = cv.clientHeight;
    if(insideBtn(px, py, cv.clientWidth * 0.22, h - 40, 88, 44)){
      clearAutoTimer();
      if(!running){ running = true; startTime = performance.now(); }
      else { running = false; frozen += (performance.now() - startTime) / 1000; }
    } else if(insideBtn(px, py, cv.clientWidth * 0.50, h - 40, 88, 44)){
      initZero();
    } else if(insideBtn(px, py, cv.clientWidth * 0.78, h - 40, 88, 44)){
      resetTarget();
    }
  }

  cv.addEventListener('mousedown', handleClick);
  cv.addEventListener('touchstart', handleClick, {passive: false});
  window.addEventListener('resize', function(){ g = fitCanvas(cv, getCssH(cv)); });

  document.getElementById('swCheck').addEventListener('click', function(){
    var fb = document.getElementById('swFb');
    if(!hasTarget){ fb.className = 'feedback show info'; fb.innerHTML = '请先点画面里的"出题"按钮。'; return; }
    var m = parseInt(document.getElementById('swMin').value, 10);
    var s = parseFloat(document.getElementById('swSec').value);
    var fb = document.getElementById('swFb');
    if(Number.isNaN(m) || Number.isNaN(s)){ fb.className = 'feedback show info'; fb.innerHTML = '请先填写分和秒。'; return; }
    var ok = (Math.round(m) === targetMin) && (Math.abs(s - targetSec) <= 0.11);
    if(ok){
      fb.className = 'feedback show ok';
      fb.innerHTML = '✅ 正确！停表读数为 <b>' + targetMin + ' 分 ' + targetSec.toFixed(1) + ' 秒</b>。';
    } else {
      fb.className = 'feedback show err';
      fb.innerHTML = '❌ 正确读数是 <b>' + targetMin + ' 分 ' + targetSec.toFixed(1) + ' 秒</b>。小表盘指针' + (passedHalf ? '已过中线' : '未过中线') + '，所以大表盘应读 ' + (passedHalf ? '红字 31~59 s（即黑字 +30 s）' : '黑字 0~30 s') + '。';
    }
  });

  initZero();
  requestAnimationFrame(loop);

  FullscreenHelper.bind(
    document.getElementById('fsSwWrap'),
    document.getElementById('fsSwBtn'),
    function(){ g = fitCanvas(cv, getCssH(cv)); }
  );
})();

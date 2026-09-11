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
    var cx = w * 0.5, cy = h * 0.50, r = Math.min(w, h) * 0.34;
    var sec = totalSeconds();
    var min = Math.floor(sec / 60);
    var s = sec % 60;

    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#f5f0e0'); grad.addColorStop(1, '#eef6ec');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, r - 4, 0, 7); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for(var i = 0; i <= 30; i += 1){
      var ang = (i / 30) * 2 * Math.PI - Math.PI / 2;
      var isMajor = i % 5 === 0;
      var tickLen = isMajor ? 10 : 5;
      var x1 = cx + Math.cos(ang) * (r - 10), y1 = cy + Math.sin(ang) * (r - 10);
      var x2 = cx + Math.cos(ang) * (r - 10 - tickLen), y2 = cy + Math.sin(ang) * (r - 10 - tickLen);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = '#5a5a5a'; ctx.lineWidth = isMajor ? 1.5 : 1; ctx.stroke();
      if(i % 2 === 0 && i > 0){
        ctx.fillStyle = '#2c2c2c'; ctx.font = '11px sans-serif';
        ctx.fillText(String(i), cx + Math.cos(ang) * (r - 26), cy + Math.sin(ang) * (r - 26));
      }
    }
    ctx.fillStyle = '#c0392b'; ctx.font = '10px sans-serif';
    for(var rj = 31; rj <= 59; rj += 2){
      var redAng = ((rj - 30) / 30) * 2 * Math.PI - Math.PI / 2;
      ctx.fillText(String(rj), cx + Math.cos(redAng) * (r - 42), cy + Math.sin(redAng) * (r - 42));
    }
    ctx.restore();

    var scx = cx, scy = cy - r * 0.40, sr = r * 0.28;
    ctx.save();
    ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(scx, scy, sr, 0, 7); ctx.stroke();
    ctx.fillStyle = '#f5f0e0'; ctx.beginPath(); ctx.arc(scx, scy, sr - 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#8b6914'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for(var jm = 0; jm <= 30; jm += 1){
      var mang = (jm / 30) * 2 * Math.PI - Math.PI / 2;
      var mLen = (jm % 5 === 0) ? 8 : 4;
      var mx1 = scx + Math.cos(mang) * (sr - 3), my1 = scy + Math.sin(mang) * (sr - 3);
      var mx2 = scx + Math.cos(mang) * (sr - 3 - mLen), my2 = scy + Math.sin(mang) * (sr - 3 - mLen);
      ctx.beginPath(); ctx.moveTo(mx1, my1); ctx.lineTo(mx2, my2); ctx.strokeStyle = '#8b6914'; ctx.lineWidth = (jm % 5 === 0) ? 1.5 : 1; ctx.stroke();
    }
    for(var jn = 0; jn <= 15; jn++){
      var ang2 = (jn / 15) * 2 * Math.PI - Math.PI / 2;
      var sx = scx + Math.cos(ang2) * (sr - 14), sy = scy + Math.sin(ang2) * (sr - 14);
      ctx.fillStyle = '#8b6914'; ctx.font = (jn % 5 === 0) ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.fillText(String(jn), sx, sy);
    }
    ctx.strokeStyle = 'rgba(192,57,43,.6)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(scx, scy); ctx.lineTo(scx + sr - 4, scy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    var displayS = totalToDisplay(s);
    var secAng = (displayS / 30) * 2 * Math.PI - Math.PI / 2;
    var minAng = ((min % 15) / 15 + (s % 60) / (15 * 60)) * 2 * Math.PI - Math.PI / 2;
    ctx.save();
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(secAng) * (r - 22), cy + Math.sin(secAng) * (r - 22)); ctx.stroke();
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(scx, scy); ctx.lineTo(scx + Math.cos(minAng) * (sr - 8), scy + Math.sin(minAng) * (sr - 8)); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#5a5a5a'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('大表盘：0~30 s（0.1 s/格）  小表盘：0~15 min（0.5 min/格）', cx, h - 82);
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

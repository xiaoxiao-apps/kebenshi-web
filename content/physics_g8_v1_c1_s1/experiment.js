/* ============================================================
   experiment.js — 互动实验区（亮色主题）
   原 app.js 模块二：刻度尺读数 / 停表读数
   ============================================================ */

/* ---------- 通用：高清屏适配 ---------- */
function fitCanvas(cv, cssH){
  var dpr = Math.min(window.devicePixelRatio || 1, 3);
  var w = cv.clientWidth || cv.parentElement.clientWidth;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(cssH * dpr);
  cv.style.height = cssH + 'px';
  var ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx: ctx, w: w, h: cssH };
}

function roundRectPath(ctx, x, y, w, h, r){
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/* 根据是否全屏 / 屏幕宽度决定 canvas 的 CSS 高度 */
function getCssH(cv){
  var wrap = cv.parentElement;
  var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
  if((wrap && wrap.classList.contains('pseudo-fullscreen')) || fsEl === wrap){
    return window.innerHeight;
  }
  return window.innerWidth <= 768 ? 300 : 360;
}

/* ============================================================
   实验一：刻度尺读数（允许 ±0.02 cm 估读误差）
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

    // 标尺
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

    // 被测物（铅笔）
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

    // 标注
    ctx.save();
    ctx.strokeStyle = '#2980b9'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(startX, rulerY + 42); ctx.lineTo(startX, rulerY + 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(endX, rulerY + 42); ctx.lineTo(endX, rulerY + 60); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#2980b9'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('物体左端对齐 ' + st.startCm.toFixed(1) + ' cm', (startX + endX) / 2, rulerY + 72);
    ctx.restore();

    // 文字说明
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
    // 判断（允许 ±0.02 cm 的估读误差）
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

  // 全屏（ruler 区）
  FullscreenHelper.bind(
    document.getElementById('fsRulerWrap'),
    document.getElementById('fsRulerBtn'),
    function(){ g = fitCanvas(cv, getCssH(cv)); draw(g, state); }
  );
})();

/* ============================================================
   实验二：停表读数（小表盘过中线 → 大表盘读 30~60 s）
   交互：画面内按钮 开始/停止、归零、出题；"出题"会随机设定目标读数。
   若出题后 2 秒内未点"开始"，指针自动运行到目标读数并停住，方便读数练习。
   ============================================================ */
(function(){
  var cv = document.getElementById('stopwatchCv');
  var g = fitCanvas(cv, getCssH(cv));
  var running = false, startTime = 0, frozen = 0;
  var targetMin = 0, targetSec = 0, passedHalf = false;
  var autoTimer = null, targetTotalSec = 0;

  function clearAutoTimer(){ if(autoTimer){ clearTimeout(autoTimer); autoTimer = null; } }

  function runToTarget(){
    // 指针自动走到目标读数并停住（仅用于出题后的展示）
    running = true; startTime = performance.now();
    var total = targetMin * 60 + targetSec;
    var t0 = performance.now();
    function step(){
      if(!running) return; // 用户手动"停止"会取消自动运行（见点击处理）
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
    // 秒吸附到 0.1 s 整数倍，范围 0.0~59.9 s，保证落在精确刻度上
    targetSec = Math.round(Math.random() * 599) / 10;
    passedHalf = targetSec >= 30;
    targetTotalSec = targetMin * 60 + targetSec;
    frozen = 0; running = false;
    document.getElementById('swMin').value = '';
    document.getElementById('swSec').value = '';
    var fb = document.getElementById('swFb');
    fb.className = 'feedback'; fb.innerHTML = '';
    // 2 秒内没手动开始，就自动走到目标读数（保证题目可作答）
    autoTimer = setTimeout(runToTarget, 2000);
  }

  function totalSeconds(){ return running ? frozen + (performance.now() - startTime) / 1000 : frozen; }

  function totalToDisplay(t){
    // 真实秒表：秒针 0~30 s 一圈，>30s 仍是第二圈读数
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

    // 背景
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#f5f0e0'); grad.addColorStop(1, '#eef6ec');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    // 外框
    ctx.save();
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, r - 4, 0, 7); ctx.fill();
    ctx.restore();

    // 大表盘：一圈 30 s，外圈黑字 2,4,...,30；内圈红字 31,33,...,59；分度值 0.1 s
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for(var i = 0; i <= 30; i += 1){
      var ang = (i / 30) * 2 * Math.PI - Math.PI / 2;
      var isMajor = i % 5 === 0;
      var tickLen = isMajor ? 10 : 5;
      var x1 = cx + Math.cos(ang) * (r - 10), y1 = cy + Math.sin(ang) * (r - 10);
      var x2 = cx + Math.cos(ang) * (r - 10 - tickLen), y2 = cy + Math.sin(ang) * (r - 10 - tickLen);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = '#5a5a5a'; ctx.lineWidth = isMajor ? 1.5 : 1; ctx.stroke();
      // 外圈黑字 2,4,...,30
      if(i % 2 === 0 && i > 0){
        ctx.fillStyle = '#2c2c2c'; ctx.font = '11px sans-serif';
        ctx.fillText(String(i), cx + Math.cos(ang) * (r - 26), cy + Math.sin(ang) * (r - 26));
      }
    }
    // 内圈红字 31,33,...,59
    ctx.fillStyle = '#c0392b'; ctx.font = '10px sans-serif';
    for(var rj = 31; rj <= 59; rj += 2){
      var redAng = ((rj - 30) / 30) * 2 * Math.PI - Math.PI / 2;
      ctx.fillText(String(rj), cx + Math.cos(redAng) * (r - 42), cy + Math.sin(redAng) * (r - 42));
    }
    ctx.restore();

    // 小表盘（分钟盘）：0~15 min，分度值 0.5 min
    var scx = cx, scy = cy - r * 0.40, sr = r * 0.28;
    ctx.save();
    ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(scx, scy, sr, 0, 7); ctx.stroke();
    ctx.fillStyle = '#f5f0e0'; ctx.beginPath(); ctx.arc(scx, scy, sr - 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#8b6914'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    // 0.5 min 刻度线
    for(var jm = 0; jm <= 30; jm += 1){
      var mang = (jm / 30) * 2 * Math.PI - Math.PI / 2;
      var mLen = (jm % 5 === 0) ? 8 : 4;
      var mx1 = scx + Math.cos(mang) * (sr - 3), my1 = scy + Math.sin(mang) * (sr - 3);
      var mx2 = scx + Math.cos(mang) * (sr - 3 - mLen), my2 = scy + Math.sin(mang) * (sr - 3 - mLen);
      ctx.beginPath(); ctx.moveTo(mx1, my1); ctx.lineTo(mx2, my2); ctx.strokeStyle = '#8b6914'; ctx.lineWidth = (jm % 5 === 0) ? 1.5 : 1; ctx.stroke();
    }
    // 数字 0..15
    for(var jn = 0; jn <= 15; jn++){
      var ang2 = (jn / 15) * 2 * Math.PI - Math.PI / 2;
      var sx = scx + Math.cos(ang2) * (sr - 14), sy = scy + Math.sin(ang2) * (sr - 14);
      ctx.fillStyle = '#8b6914'; ctx.font = (jn % 5 === 0) ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.fillText(String(jn), sx, sy);
    }
    // 小表盘中线（判断 30s 进位的关键）
    ctx.strokeStyle = 'rgba(192,57,43,.6)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(scx, scy); ctx.lineTo(scx + sr - 4, scy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 指针（大表盘秒针 + 小表盘分针）
    var displayS = totalToDisplay(s);
    var secAng = (displayS / 30) * 2 * Math.PI - Math.PI / 2;
    var minAng = ((min % 15) / 15 + (s % 60) / (15 * 60)) * 2 * Math.PI - Math.PI / 2;
    ctx.save();
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(secAng) * (r - 22), cy + Math.sin(secAng) * (r - 22)); ctx.stroke();
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(scx, scy); ctx.lineTo(scx + Math.cos(minAng) * (sr - 8), scy + Math.sin(minAng) * (sr - 8)); ctx.stroke();
    ctx.restore();

    // 盘面规格说明
    ctx.save();
    ctx.fillStyle = '#5a5a5a'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('大表盘：0~30 s（0.1 s/格）  小表盘：0~15 min（0.5 min/格）', cx, h - 82);
    ctx.restore();

    // 按钮（开始/停止、归零、出题）
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
      clearAutoTimer();
      running = false; frozen = 0;
    } else if(insideBtn(px, py, cv.clientWidth * 0.78, h - 40, 88, 44)){
      resetTarget();
    }
  }

  cv.addEventListener('mousedown', handleClick);
  cv.addEventListener('touchstart', handleClick, {passive: false});
  window.addEventListener('resize', function(){ g = fitCanvas(cv, getCssH(cv)); });

  document.getElementById('swCheck').addEventListener('click', function(){
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

  resetTarget();
  requestAnimationFrame(loop);

  // 全屏（stopwatch 区）
  FullscreenHelper.bind(
    document.getElementById('fsSwWrap'),
    document.getElementById('fsSwBtn'),
    function(){ g = fitCanvas(cv, getCssH(cv)); }
  );
})();
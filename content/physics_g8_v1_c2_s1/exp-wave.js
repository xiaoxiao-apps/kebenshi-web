/* ============================================================
   exp-wave.js — 声波可视化：鼓面振动→空气疏密波外推 + 水波分屏对比
   ============================================================ */
(function(){
  'use strict';
  var DW = 640;
  var cv = document.getElementById('waveCv');
  var ctx = cv.getContext('2d');
  var W = 640, H = 420, k = 1;

  var freq = 50;              /* slider 20..100 */
  var running = true;
  var beating = false;        /* 敲鼓持续振动 */
  var t = 0;                  /* 场景时间 s */
  var last = performance.now();

  /* 疏密波参数：波长随频率变（频率越高波长越短→疏密带越密） */
  function waveLen(){ return (150 - freq) * 0.9 + 30; }   /* 设计单位 */
  function waveSpeed(){ return 120; }                     /* 波形外推速度 */
  function beatAmp(){ return beating ? 1 : 0; }

  function resize(){
    var f = fitCanvas(cv, getCssH(cv));
    ctx = f.ctx; W = f.w; H = parseFloat(cv.style.height) || f.h;
    k = W / DW;
    draw();
  }

  /* ===== 上半屏：鼓 + 空气疏密波（横向 1D 质点阵列） ===== */
  var ROWS = 7, COLS = 34;
  function drawTop(){
    var yTop = 0, hTop = H * 0.52;
    /* 背景 */
    var bg = ctx.createLinearGradient(0, yTop, 0, hTop);
    bg.addColorStop(0, '#fdf6e3'); bg.addColorStop(1, '#f8ecd0');
    ctx.fillStyle = bg; ctx.fillRect(0, yTop, W, hTop);

    /* 鼓（左侧，竖直摆放鼓面朝右，同教材）：桶形鼓身+皮革鼓面+鼓钉+鼓环+支架 */
    var dx = W * 0.155, dy = hTop * 0.46;
    var memOff = beatAmp() * Math.sin(t * freq * 0.35) * 3.5 * k;  /* 鼓面水平振动 */
    var rw = 15 * k, rh = 36 * k, bl = 54 * k;
    /* 鼓身：横卧桶形（中间鼓），木色纵向渐变体现立体 */
    var wg = ctx.createLinearGradient(0, dy - rh, 0, dy + rh);
    wg.addColorStop(0, '#5a3d0c'); wg.addColorStop(0.3, '#a8781e');
    wg.addColorStop(0.6, '#8b6914'); wg.addColorStop(1, '#4a3208');
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.moveTo(dx - bl, dy - rh * 0.8);
    ctx.quadraticCurveTo(dx - bl * 0.5, dy - rh * 1.14, dx - rw, dy - rh);
    ctx.lineTo(dx, dy - rh);
    ctx.lineTo(dx, dy + rh);
    ctx.lineTo(dx - rw, dy + rh);
    ctx.quadraticCurveTo(dx - bl * 0.5, dy + rh * 1.14, dx - bl, dy + rh * 0.8);
    ctx.closePath(); ctx.fill();
    /* 后端鼓面（左） */
    ctx.fillStyle = '#d9c9a8';
    ctx.beginPath(); ctx.ellipse(dx - bl, dy, rw * 0.45, rh * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    /* 侧面鼓环×2 */
    ctx.strokeStyle = '#3d3d3d'; ctx.lineWidth = 2.2 * k;
    [0.32, 0.68].forEach(function(u){
      var rx2 = dx - bl * u;
      ctx.beginPath(); ctx.ellipse(rx2, dy, rw * 0.5, rh * (1.02 - 0.1 * Math.abs(u - 0.5)), 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    });
    /* 支架：两木腿+横梁 */
    ctx.strokeStyle = '#6b4a10'; ctx.lineWidth = 4 * k; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(dx - bl * 0.75, dy + rh * 0.7); ctx.lineTo(dx - bl * 0.95, dy + rh + 16 * k);
    ctx.moveTo(dx - bl * 0.25, dy + rh * 0.9); ctx.lineTo(dx - bl * 0.05, dy + rh + 16 * k);
    ctx.moveTo(dx - bl * 1.0, dy + rh + 16 * k); ctx.lineTo(dx, dy + rh + 16 * k);
    ctx.stroke(); ctx.lineCap = 'butt';
    /* 鼓面（右）：皮革色径向渐变 + 水平振动 */
    var mg = ctx.createRadialGradient(dx - rw * 0.3 + memOff, dy - rh * 0.3, rw * 0.2, dx + memOff, dy, rh * 1.1);
    mg.addColorStop(0, '#f7ecd9'); mg.addColorStop(0.65, '#e2cda6'); mg.addColorStop(1, '#c9b184');
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.ellipse(dx + memOff, dy, rw, rh, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 3 * k; ctx.stroke();
    /* 鼓面边缘一圈鼓钉 */
    ctx.fillStyle = '#4a3208';
    for(var ni = 0; ni < 14; ni++){
      var na = ni / 14 * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(dx + memOff + Math.cos(na) * rw * 0.88, dy + Math.sin(na) * rh * 0.88, 1.6 * k, 0, Math.PI * 2);
      ctx.fill();
    }
    /* 「鼓」标签：鼓身正下方，与质点阵列 x 不重叠 */
    ctx.font = 'bold ' + (12 * k) + 'px sans-serif';
    ctx.fillStyle = '#8b6914'; ctx.textAlign = 'center';
    ctx.fillText('鼓', dx - bl * 0.5, dy + rh + 30 * k);

    /* 空气质点阵列：x0 起向右；每点原位振动，位移=行波函数 */
    var x0 = dx + 26 * k;
    var span = W - x0 - 14 * k;
    var lam = waveLen() * k;
    var sp = waveSpeed() * k;
    var A = 9 * k * beatAmp();
    ctx.fillStyle = '#2980b9';
    for(var r = 0; r < ROWS; r++){
      var ry = hTop * 0.18 + r * (hTop * 0.62 / (ROWS - 1));
      for(var c = 0; c < COLS; c++){
        var px0 = x0 + span * c / (COLS - 1);
        var dist = px0 - x0;
        /* 行波：位移 = A·sin(2π(dist/λ - f·t))；波前未到则不动 */
        var front = sp * t;
        var disp = 0;
        if(dist < front){
          disp = A * Math.sin(2 * Math.PI * (dist / lam - t * freq * 0.035));
          disp *= Math.min(1, (front - dist) / (30 * k));  /* 波前平滑淡入 */
        }
        /* 疏密：靠近密部画大画深 */
        var dens = 0.5 + 0.5 * Math.cos(2 * Math.PI * (dist / lam - t * freq * 0.035));
        var alpha = dist < front ? 0.35 + 0.5 * dens : 0.18;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px0 + disp, ry, (2 + 1.4 * dens * beatAmp()) * k, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    /* 波前位置标线 */
    if(beating || t > 0.2){
      var fx = Math.min(x0 + sp * t, W - 6 * k);
      if(sp * t < span + 40 * k){
        ctx.strokeStyle = 'rgba(192,57,43,.55)';
        ctx.lineWidth = 1.6 * k;
        ctx.setLineDash([5 * k, 4 * k]);
        ctx.beginPath(); ctx.moveTo(fx, hTop * 0.10); ctx.lineTo(fx, hTop * 0.88); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#c0392b';
        ctx.font = (11 * k) + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('波前', fx + 4 * k, hTop * 0.12);
      }
    }
    /* 疏/密标注 */
    ctx.font = 'bold ' + (12 * k) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2980b9';
    ctx.fillText('空气疏密波 →', x0, hTop * 0.09);
  }
  /* ===== 下半屏：铅笔点水面→一圈圈水波（俯视） ===== */
  var drips = [];            /* 已滴下的水波 {t0} */
  var nextDrip = 0;
  function drawBottom(){
    var yTop = H * 0.52, hB = H - yTop;
    /* 水面 */
    var bg = ctx.createLinearGradient(0, yTop, 0, H);
    bg.addColorStop(0, '#cfe8f7'); bg.addColorStop(1, '#a9d3ee');
    ctx.fillStyle = bg; ctx.fillRect(0, yTop, W, hB);
    /* 分隔线 */
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.moveTo(0, yTop); ctx.lineTo(W, yTop); ctx.stroke();
    ctx.font = 'bold ' + (12 * k) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2c2c2c';
    ctx.fillText('声波：质点原位振动，疏密波形外传', 14 * k, yTop - 8 * k);
    ctx.fillStyle = '#1a5e8c';
    ctx.fillText('水波：铅笔轻点水面，一圈圈波纹向远处传', 14 * k, yTop + 20 * k);

    /* 滴点：中左 */
    var px = W * 0.34, py = yTop + hB * 0.56;
    /* 发波：按频率节奏新增滴 */
    var rate = 0.6 + freq * 0.03;    /* 次/秒 */
    if(beating && running){
      while(t >= nextDrip){
        drips.push({ t0: t });
        nextDrip += 1 / rate;
        if(drips.length > 40) drips.shift();
      }
    }
    /* 涟漪圆环：半径随时间外推，间距=波速/频率 */
    var sp = waveSpeed() * 0.85 * k;
    var maxR = Math.max(W, hB);
    ctx.lineWidth = 2 * k;
    for(var i = 0; i < drips.length; i++){
      var age = t - drips[i].t0;
      if(age < 0) continue;
      var r = sp * age;
      if(r > maxR) continue;
      var a = Math.max(0, 0.7 - r / maxR * 0.7);
      ctx.strokeStyle = 'rgba(255,255,255,' + a + ')';
      ctx.beginPath();
      ctx.ellipse(px, py, r, r * 0.55, 0, 0, Math.PI * 2);  /* 俯视透视：压扁成椭圆 */
      ctx.stroke();
      ctx.strokeStyle = 'rgba(41,128,185,' + (a * 0.5) + ')';
      ctx.beginPath();
      ctx.ellipse(px, py, r * 0.94, r * 0.52, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    /* 滴点中心波动 */
    var wob = beating ? Math.sin(t * freq * 0.35) * 2.5 * k : 0;
    ctx.fillStyle = '#1a5e8c';
    ctx.beginPath(); ctx.arc(px, py, (3.4 + wob * 0.4) * k, 0, Math.PI * 2); ctx.fill();
    /* 铅笔：斜插到滴点 */
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-Math.PI / 3.2);
    var lift = beating ? 0 : -6 * k;
    ctx.translate(0, lift);
    ctx.fillStyle = '#e0a52e';
    ctx.fillRect(-4 * k, -78 * k, 8 * k, 58 * k);
    ctx.fillStyle = '#f7e3ae';
    ctx.beginPath();
    ctx.moveTo(-4 * k, -20 * k); ctx.lineTo(4 * k, -20 * k); ctx.lineTo(0, -2 * k);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a5a5a';
    ctx.beginPath();
    ctx.moveTo(-1.6 * k, -8 * k); ctx.lineTo(1.6 * k, -8 * k); ctx.lineTo(0, -2 * k);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-4 * k, -84 * k, 8 * k, 8 * k);
    ctx.restore();
    ctx.font = (11 * k) + 'px sans-serif';
    ctx.fillStyle = '#1a5e8c';
    ctx.textAlign = 'left';
    ctx.fillText('铅笔不断轻点水面', px + 60 * k, py + 40 * k);
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    drawTop();
    drawBottom();
  }

  /* ===== 控件 ===== */
  var freqSlider = document.getElementById('freqSlider');
  var freqVal = document.getElementById('freqVal');
  var beatBtn = document.getElementById('beatBtn');
  var pauseBtn = document.getElementById('pauseBtn');
  var noteLine = document.getElementById('noteLine');

  function freqName(v){ return v < 40 ? '低' : (v > 70 ? '高' : '适中'); }
  function updateNote(){
    noteLine.innerHTML = '当前频率：<b>' + freqName(freq) + '</b> — ' +
      (freq > 70 ? '振动快，疏密带排得<b>密</b>（波长短）'
      : (freq < 40 ? '振动慢，疏密带排得<b>疏</b>（波长长）'
      : '疏密间距适中。拖动 slider 看疏密变化！'));
  }
  freqSlider.addEventListener('input', function(){
    freq = +freqSlider.value;
    freqVal.textContent = freqName(freq);
    updateNote();
  });
  beatBtn.addEventListener('click', function(){
    beating = !beating;
    if(beating){
      t = 0; nextDrip = 0; drips = [];
      beatBtn.textContent = '⏹ 停止敲鼓';
    } else {
      beatBtn.textContent = '🥁 敲鼓（持续振动）';
    }
  });
  pauseBtn.addEventListener('click', function(){
    running = !running;
    pauseBtn.textContent = running ? '⏸ 暂停' : '▶ 继续';
  });

  /* ===== 主循环 ===== */
  function loop(now){
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if(running && beating) t += dt;
    draw();
    requestAnimationFrame(loop);
  }

  FullscreenHelper.bind(document.getElementById('fsWaveWrap'), document.getElementById('fsWaveBtn'), resize);
  window.addEventListener('resize', resize);
  updateNote(); resize();
  requestAnimationFrame(loop);
})();

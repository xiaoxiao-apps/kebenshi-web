/* exp-intro.js — 问题导入：蚊子 vs 蝴蝶翅膀振动频率 */
(function(){
  'use strict';
  var DW = 640, cv = document.getElementById('introCv'), ctx = cv.getContext('2d');
  var W = 640, H = 360, k = 1;
  var audioEl = null, mosqPlaying = false, wasPlaying = false, butterflyHint = 0, mosqHint = 0;
  /* G4：翅膀默认静止，点谁谁扇；暂停=相位冻结（active 保持） */
  var active = { butterfly: false, mosquito: false };
  var paused = false, animT = 0, lastT = performance.now();
  function resize(){ var f = fitCanvas(cv, getCssH(cv)); ctx = f.ctx; W = f.w; H = parseFloat(cv.style.height) || f.h; k = W / DW; draw(); }
  function ensureAudio(){ if(!audioEl){ audioEl = document.createElement('audio'); audioEl.src = 'assets/audio/mosquito-buzz.mp3'; audioEl.preload = 'auto'; audioEl.addEventListener('ended', function(){ mosqPlaying = false; }); } return audioEl; }
  function wingEllipse(cx, cy, span, h, angle, alpha, tint){
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(angle); ctx.translate(-cx, -cy);
    ctx.fillStyle = 'rgba(' + tint + ',' + alpha + ')';
    ctx.beginPath(); ctx.ellipse(cx + span / 2, cy, Math.abs(span) / 2, h, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  /* G4 蝴蝶：宽圆双对翅（贝塞尔前翅+后翅）+翅面眼斑+棒状触角+头胸腹三节，粉橙色系 */
  function drawButterfly(cx, cy, span){
    var fh = 24 * k, d, ex, ey, hx, hy;
    for(d = -1; d <= 1; d += 2){
      ctx.fillStyle = 'rgba(246,153,90,.92)'; /* 前翅：大、圆、上伸 */
      ctx.beginPath();
      ctx.moveTo(cx, cy - 4 * k);
      ctx.bezierCurveTo(cx + d * span * 0.35, cy - fh * 1.7, cx + d * span * 0.95, cy - fh * 1.35, cx + d * span, cy - fh * 0.35);
      ctx.bezierCurveTo(cx + d * span, cy + fh * 0.15, cx + d * span * 0.55, cy + fh * 0.2, cx + d * span * 0.3, cy + fh * 0.1);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(248,186,140,.92)'; /* 后翅：圆扇下伸 */
      ctx.beginPath();
      ctx.moveTo(cx + d * span * 0.28, cy + fh * 0.05);
      ctx.bezierCurveTo(cx + d * span * 0.85, cy + fh * 0.15, cx + d * span * 0.9, cy + fh * 1.05, cx + d * span * 0.5, cy + fh * 1.25);
      ctx.bezierCurveTo(cx + d * span * 0.15, cy + fh * 1.35, cx, cy + fh * 0.7, cx, cy + 4 * k);
      ctx.closePath(); ctx.fill();
      ex = cx + d * span * 0.66; ey = cy - fh * 0.55; /* 前翅眼斑：同心圆 */
      ctx.fillStyle = 'rgba(90,50,20,.85)'; ctx.beginPath(); ctx.arc(ex, ey, 5.2 * k, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,214,140,.95)'; ctx.beginPath(); ctx.arc(ex, ey, 3.2 * k, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(60,35,15,.9)'; ctx.beginPath(); ctx.arc(ex, ey, 1.5 * k, 0, Math.PI * 2); ctx.fill();
      hx = cx + d * span * 0.5; hy = cy + fh * 0.75; /* 后翅小眼斑 */
      ctx.fillStyle = 'rgba(90,50,20,.7)'; ctx.beginPath(); ctx.arc(hx, hy, 3 * k, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,224,170,.9)'; ctx.beginPath(); ctx.arc(hx, hy, 1.6 * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#6b4226'; ctx.lineWidth = 1.6 * k; /* 棒状触角：线+末端小圆 */
    for(d = -1; d <= 1; d += 2){
      ctx.beginPath(); ctx.moveTo(cx + d * 2 * k, cy - 16 * k);
      ctx.quadraticCurveTo(cx + d * 7 * k, cy - 26 * k, cx + d * 10 * k, cy - 30 * k); ctx.stroke();
      ctx.fillStyle = '#6b4226'; ctx.beginPath(); ctx.arc(cx + d * 10 * k, cy - 30 * k, 2 * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#7a4a2a'; /* 头胸腹三节短粗体 */
    ctx.beginPath(); ctx.arc(cx, cy - 12 * k, 5 * k, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, cy - 2 * k, 5.5 * k, 9 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, cy + 14 * k, 4.5 * k, 10 * k, 0, 0, Math.PI * 2); ctx.fill();
  }
  /* G4 蚊子：细长锥形腹+圆头+大复眼+下扎口器+6条折线细长腿，深灰褐色系 */
  function drawMosquito(cx, cy){
    var L = 30 * k, sd, li, y0, x1, y1, x2, y2, s, sy, ww;
    ctx.strokeStyle = '#3a2f28'; ctx.lineWidth = 1.2 * k; /* 6条折线细长腿：每侧3条两段折弯 */
    for(sd = -1; sd <= 1; sd += 2){
      for(li = 0; li < 3; li++){
        y0 = cy - 8 * k + li * 7 * k;
        x1 = cx + sd * (10 + li * 4) * k; y1 = y0 + 10 * k;
        x2 = cx + sd * (16 + li * 6) * k; y2 = y0 + 22 * k;
        ctx.beginPath(); ctx.moveTo(cx + sd * 3 * k, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
    }
    ctx.fillStyle = '#4a3f38'; /* 细长锥形腹：尾端收尖 */
    ctx.beginPath();
    ctx.moveTo(cx - 4 * k, cy - 2 * k);
    ctx.lineTo(cx + 4 * k, cy - 2 * k);
    ctx.quadraticCurveTo(cx + 2 * k, cy + L * 0.6, cx, cy + L);
    ctx.quadraticCurveTo(cx - 2 * k, cy + L * 0.6, cx - 4 * k, cy - 2 * k);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(210,200,190,.35)'; ctx.lineWidth = 1 * k; /* 腹节线 */
    for(s = 1; s <= 3; s++){
      sy = cy - 2 * k + L * 0.22 * s; ww = 4 * k * (1 - s * 0.2);
      ctx.beginPath(); ctx.moveTo(cx - ww, sy); ctx.lineTo(cx + ww, sy); ctx.stroke();
    }
    ctx.fillStyle = '#5a4a40'; ctx.beginPath(); ctx.ellipse(cx, cy - 6 * k, 5.5 * k, 7 * k, 0, 0, Math.PI * 2); ctx.fill(); /* 胸 */
    ctx.fillStyle = '#4a3f38'; ctx.beginPath(); ctx.arc(cx, cy - 16 * k, 5 * k, 0, Math.PI * 2); ctx.fill(); /* 圆头 */
    ctx.fillStyle = '#8a2b2b'; /* 大复眼 */
    ctx.beginPath(); ctx.arc(cx - 3 * k, cy - 17 * k, 3 * k, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 3 * k, cy - 17 * k, 3 * k, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3a2f28'; ctx.lineWidth = 1.6 * k; /* 下扎口器（喙） */
    ctx.beginPath(); ctx.moveTo(cx - 1 * k, cy - 13 * k); ctx.lineTo(cx - 9 * k, cy - 8 * k); ctx.stroke();
  }
  function drawPanel(x, w, label, freq, color, baseFreq, kind){
    ctx.fillStyle = color; ctx.fillRect(x, 0, w, H);
    ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 2 * k; ctx.strokeRect(x, 0, w, H);
    ctx.fillStyle = '#fff'; ctx.font = 'bold ' + (16 * k) + 'px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, 26 * k);
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '' + (13 * k) + 'px sans-serif';
    ctx.fillText('约 ' + freq + ' Hz', x + w / 2, 46 * k);
    var cx = x + w / 2, cy = H * 0.55, h = 22 * k;
    /* G4：静止时相位=0（合拢态）；active 才按视觉频率扇动；暂停时 animT 冻结 */
    var ph = active[kind] ? animT * 2 * Math.PI * baseFreq : 0;
    if(kind === 'butterfly'){
      /* 视觉频率=真实 6 Hz（60fps 每周期10帧可辨）；合拢态 spread=0.22 */
      var spread = 0.22 + 0.78 * Math.abs(Math.sin(ph));
      drawButterfly(cx, cy, w * 0.42 * spread);
    } else {
      /* 视觉 18 Hz 慢速示意（真实 550 Hz 需 >1100fps，60fps 下严重混叠），残影表达高速 */
      var spanBase = w * 0.20, wy = cy - 6 * k;
      if(active.mosquito){
        for(var i = -3; i <= 3; i++){
          var ph2 = ph + i * 0.45;
          var span = Math.abs(Math.sin(ph2)) * spanBase * (1 - Math.abs(i) * 0.18);
          var a = 0.55 - Math.abs(i) * 0.11;
          wingEllipse(cx, wy, -span, h * 0.5, -0.45, a, '120,110,105');
          wingEllipse(cx, wy, span, h * 0.5, 0.45, a, '120,110,105');
        }
      } else {
        wingEllipse(cx, wy, -spanBase * 0.35, h * 0.4, -1.15, 0.5, '120,110,105'); /* 合拢：窄翅斜贴体侧 */
        wingEllipse(cx, wy, spanBase * 0.35, h * 0.4, 1.15, 0.5, '120,110,105');
      }
      drawMosquito(cx, cy);
      ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.font = '' + (11 * k) + 'px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('实际约 550 Hz，画面为慢速示意', x + w / 2, H - 10 * k);
    }
  }
  /* 面板几何唯一来源：draw 绘制与 click 命中判定同取此处，resize 后不会错位 */
  function panels(){ var w2 = W / 2; return [ {x: 0, w: w2, kind: 'butterfly'}, {x: w2, w: W - w2, kind: 'mosquito'} ]; }
  function draw(){
    ctx.clearRect(0, 0, W, H);
    var ps = panels();
    drawPanel(ps[0].x, ps[0].w, '蝴蝶', 6, '#b8e0d2', 6, 'butterfly');
    drawPanel(ps[1].x, ps[1].w, '蚊子', 550, '#ffd3b6', 18, 'mosquito');
    if(butterflyHint > 0){ butterflyHint -= 0.02; ctx.fillStyle = 'rgba(255,255,255,.92)'; roundRectPath(ctx, W * 0.08, H * 0.65, W * 0.34, 44 * k, 8 * k); ctx.fill(); ctx.fillStyle = '#555'; ctx.font = 'bold ' + (13 * k) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('振动太慢，人耳听不到', W * 0.25, H * 0.65 + 27 * k); }
    if(mosqHint > 0){ mosqHint -= 0.02; ctx.fillStyle = 'rgba(255,255,255,.92)'; roundRectPath(ctx, W * 0.58, H * 0.65, W * 0.34, 44 * k, 8 * k); ctx.fill(); ctx.fillStyle = '#555'; ctx.textAlign = 'center'; ctx.fillText(mosqPlaying ? '蚊子正在嗡嗡叫' : '播放蚊子嗡嗡声', W * 0.75, H * 0.65 + 27 * k); }
  }
  var pauseBtn = document.getElementById('mosqPauseBtn');
  cv.addEventListener('click', function(e){
    var r = cv.getBoundingClientRect();
    /* G4 修复：W/H 与 panels() 同 CSS px 系（原 cv.width 是设备px，dpr=2 下换算翻倍致全点击 hit=null） */
    var x = (e.clientX - r.left) * (W / r.width);
    var y = (e.clientY - r.top) * (H / r.height);
    var pad = 6 * k, ps = panels(), hit = null;
    for(var i = 0; i < ps.length; i++){
      var p = ps[i];
      if(x >= p.x + pad && x <= p.x + p.w - pad && y >= pad && y <= H - pad){ hit = p.kind; break; }
    }
    if(!hit) return; /* 两面板之外：零触发 */
    if(paused){ paused = false; pauseBtn.textContent = '⏸ 暂停'; }
    var a = ensureAudio();
    if(hit === 'butterfly'){
      active.butterfly = true; /* 点蝴蝶：翅膀扇但无声 */
      if(mosqPlaying || !a.paused){ a.pause(); a.currentTime = 0; mosqPlaying = false; wasPlaying = false; }
      butterflyHint = 1.5;
    } else {
      active.mosquito = true; /* 点蚊子：扇翅+嗡嗡声 */
      if(a.paused || a.ended){ a.currentTime = 0; a.play().catch(function(){}); mosqPlaying = true; }
      mosqHint = 1.5;
    }
  });
  pauseBtn.addEventListener('click', function(){
    paused = !paused;
    var a = ensureAudio();
    if(paused){
      wasPlaying = mosqPlaying && !a.paused;
      a.pause(); mosqPlaying = false; /* 翅膀定格：active 保持，loop 内 animT 停走 */
      pauseBtn.textContent = '▶ 继续';
    } else {
      if(wasPlaying){ a.play().catch(function(){}); mosqPlaying = true; wasPlaying = false; }
      pauseBtn.textContent = '⏸ 暂停';
    }
  });
  document.getElementById('mosqResetBtn').addEventListener('click', function(){
    var a = ensureAudio(); a.pause(); a.currentTime = 0;
    mosqPlaying = false; wasPlaying = false; mosqHint = 0; butterflyHint = 0;
    active.butterfly = false; active.mosquito = false; /* 翅膀归位静止 */
    paused = false; animT = 0; pauseBtn.textContent = '⏸ 暂停';
    var b = this; b.textContent = '✅ 已重置'; b.disabled = true;
    setTimeout(function(){ b.textContent = '↺ 重置'; b.disabled = false; }, 1000);
  });
  document.querySelectorAll('.opt').forEach(function(b){
    b.addEventListener('click', function(){
      var fb = document.getElementById('guessFb');
      if(this.dataset.ans === 'freq'){ fb.className = 'feedback ok show'; fb.textContent = '✅ 猜对方向！揭晓后看看完整解释。'; this.classList.add('right'); }
      else { fb.className = 'feedback err show'; fb.textContent = '❌ 再想想：蚊子和蝴蝶翅膀都在振动，关键差别是振动的快慢。'; this.classList.add('wrong'); }
    });
  });
  document.getElementById('revealBtn').addEventListener('click', function(){
    document.getElementById('answerBox').style.display = 'block';
    document.getElementById('guessFb').className = 'feedback info show'; document.getElementById('guessFb').textContent = '答案揭晓：频率是否落在人耳听觉范围内。';
  });
  function loop(){ var now = performance.now(); if(!paused){ animT += (now - lastT) / 1000; } lastT = now; draw(); requestAnimationFrame(loop); }
  FullscreenHelper.bind(document.getElementById('fsIntroWrap'), document.getElementById('fsIntroBtn'), resize);
  window.addEventListener('resize', resize); resize(); requestAnimationFrame(loop);

  /* F11：壳切tab通知→停蚊子 mp3（幂等；show 不自动恢复播放） */
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.kind !== 'sound-lab-hide') return;
    if (audioEl) { audioEl.pause(); }
    mosqPlaying = false; wasPlaying = false;
  });
})();

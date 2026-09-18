/* exp-intro.js — 问题导入：蚊子 vs 蝴蝶翅膀振动频率 */
(function(){
  'use strict';
  var DW = 640, cv = document.getElementById('introCv'), ctx = cv.getContext('2d');
  var W = 640, H = 360, k = 1, t0 = performance.now();
  var audioEl = null, mosqPlaying = false, butterflyHint = 0, mosqHint = 0;
  function resize(){ var f = fitCanvas(cv, getCssH(cv)); ctx = f.ctx; W = f.w; H = parseFloat(cv.style.height) || f.h; k = W / DW; draw(); }
  function ensureAudio(){ if(!audioEl){ audioEl = document.createElement('audio'); audioEl.src = 'assets/audio/mosquito-buzz.mp3'; audioEl.preload = 'auto'; audioEl.addEventListener('ended', function(){ mosqPlaying = false; }); } return audioEl; }
  function wingEllipse(cx, cy, span, h, angle, alpha, tint){
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(angle); ctx.translate(-cx, -cy);
    ctx.fillStyle = 'rgba(' + tint + ',' + alpha + ')';
    ctx.beginPath(); ctx.ellipse(cx + span / 2, cy, Math.abs(span) / 2, h, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawPanel(x, w, label, freq, color, baseFreq, kind){
    ctx.fillStyle = color; ctx.fillRect(x, 0, w, H);
    ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 2 * k; ctx.strokeRect(x, 0, w, H);
    ctx.fillStyle = '#fff'; ctx.font = 'bold ' + (16 * k) + 'px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, 26 * k);
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '' + (13 * k) + 'px sans-serif';
    ctx.fillText('约 ' + freq + ' Hz', x + w / 2, 46 * k);
    var cx = x + w / 2, cy = H * 0.55, h = 22 * k, now = (performance.now() - t0) / 1000;
    if(kind === 'butterfly'){
      var ph = now * 2 * Math.PI * 2;
      var span = Math.abs(Math.sin(ph)) * w * 0.38;
      wingEllipse(cx, cy, -span, h, -0.3, 0.95, '248,205,218');
      wingEllipse(cx, cy, span, h, 0.3, 0.95, '248,205,218');
      ctx.fillStyle = '#444'; ctx.beginPath(); ctx.ellipse(cx, cy, 10 * k, 30 * k, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      var base = now * baseFreq * Math.PI * 2, spanBase = w * 0.22;
      for(var i = -3; i <= 3; i++){
        var ph = base + i * 0.45;
        var span = Math.abs(Math.sin(ph)) * spanBase * (1 - Math.abs(i) * 0.18);
        var a = 0.82 - Math.abs(i) * 0.16;
        wingEllipse(cx, cy, -span, h * 0.85, -0.25, a, '168,230,207');
        wingEllipse(cx, cy, span, h * 0.85, 0.25, a, '168,230,207');
      }
      ctx.strokeStyle = 'rgba(100,180,140,.35)'; ctx.lineWidth = 1.5 * k;
      for(var j = 0; j < 5; j++){
        var oy = (j - 2) * 6 * k;
        ctx.beginPath(); ctx.moveTo(cx + spanBase * 0.2, cy + oy); ctx.lineTo(cx + spanBase * 0.9, cy + oy); ctx.stroke();
      }
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.ellipse(cx, cy, 8 * k, 26 * k, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  function draw(){
    ctx.clearRect(0, 0, W, H);
    var w2 = W / 2;
    drawPanel(0, w2, '蝴蝶', 6, '#b8e0d2', 2, 'butterfly');
    drawPanel(w2, W - w2, '蚊子', 550, '#ffd3b6', 18, 'mosquito');
    if(butterflyHint > 0){ butterflyHint -= 0.02; ctx.fillStyle = 'rgba(255,255,255,.92)'; roundRectPath(ctx, W * 0.08, H * 0.65, W * 0.34, 44 * k, 8 * k); ctx.fill(); ctx.fillStyle = '#555'; ctx.font = 'bold ' + (13 * k) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('振动太慢，人耳听不到', W * 0.25, H * 0.65 + 27 * k); }
    if(mosqHint > 0){ mosqHint -= 0.02; ctx.fillStyle = 'rgba(255,255,255,.92)'; roundRectPath(ctx, W * 0.58, H * 0.65, W * 0.34, 44 * k, 8 * k); ctx.fill(); ctx.fillStyle = '#555'; ctx.textAlign = 'center'; ctx.fillText(mosqPlaying ? '蚊子正在嗡嗡叫' : '播放蚊子嗡嗡声', W * 0.75, H * 0.65 + 27 * k); }
  }
  cv.addEventListener('click', function(e){
    var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * (cv.width / r.width);
    if(x < W / 2){ butterflyHint = 1.5; }
    else {
      var a = ensureAudio();
      if(a.paused || a.ended){ a.currentTime = 0; a.play().catch(function(){}); mosqPlaying = true; }
      mosqHint = 1.5;
    }
  });
  document.getElementById('mosqResetBtn').addEventListener('click', function(){
    var a = ensureAudio(); a.pause(); a.currentTime = 0; mosqPlaying = false; mosqHint = 0;
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
  function loop(){ draw(); requestAnimationFrame(loop); }
  FullscreenHelper.bind(document.getElementById('fsIntroWrap'), document.getElementById('fsIntroBtn'), resize);
  window.addEventListener('resize', resize); resize(); requestAnimationFrame(loop);
})();

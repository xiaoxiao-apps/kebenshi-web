/* ============================================================
   anim.js — 导入小剧场（亮色主题适配）
   原 app.js 模块一，颜色适配浅色背景
   ============================================================ */

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

(function(){
  var cv = document.getElementById('animCv');
  var cap = document.getElementById('cap');
  var bar = document.getElementById('animBar');
  var cssH = cv.clientHeight || 320;
  var g = fitCanvas(cv, cssH);
  var t0 = null, raf = null, elapsed = 0, lastNow = 0, paused = false;
  var DUR = 36000;

  var scenes = [
    [0,     7000,  '周末，小明要给新买的书架量尺寸。<br>他摆摆手说："不用尺子，我目测一下就行。"', 'shop'],
    [7000,  16000, '小明"估摸"着锯好了木板，结果——<br><span class="reveal">书架板子短了一截，根本装不上。</span>', 'fail'],
    [16000, 24000, '妈妈笑着说："测量可不能靠感觉！<br>工具、分度值、估读，一个都不能少。"', 'teach'],
    [24000, 30000, '长度要测量，时间同样也要测量。<br>比赛里差 0.01 秒，名次就完全不一样。', 'time'],
    [30000, 36000, '这节课，我们就来学习<br><span class="reveal">长度和时间的测量</span>。', 'reveal']
  ];

  function person(ctx, x, y, s, dir, phase, emotion){
    emotion = emotion || 'normal';
    ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
    var skin = '#fce0cd', hair = '#3e3025', blush = '#ffb3b3', jacket = '#ff9a5e', shorts = '#4a7cc7';
    var sw = Math.sin(phase), sw2 = Math.sin(phase + 0.6);
    var legSwingR = sw * 10, legSwingL = -sw * 10, armSwingR = sw2 * 8, armSwingL = -sw2 * 8;

    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 5, 0, 0, 7); ctx.fill();

    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = shorts; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(-5, -22); ctx.lineTo(-8 + legSwingR, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, -22); ctx.lineTo(8 + legSwingL, 0); ctx.stroke();

    ctx.fillStyle = '#3a2e2a'; ctx.beginPath(); ctx.ellipse(-8 + legSwingR, 2, 7, 4, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8 + legSwingL, 2, 7, 4, 0, 0, 7); ctx.fill();

    ctx.fillStyle = jacket; ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.lineWidth = 1;
    roundRectPath(ctx, -13, -48, 26, 28, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff'; roundRectPath(ctx, -3, -45, 6, 14, 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(0, -31); ctx.stroke();

    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = jacket; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(-11, -42); ctx.lineTo(-18 + armSwingL, -28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(11, -42); ctx.lineTo(18 + armSwingR, -28); ctx.stroke();

    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(-18 + armSwingL, -26, 4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(18 + armSwingR, -26, 4, 0, 7); ctx.fill();

    ctx.fillStyle = shorts; roundRectPath(ctx, -12, -25, 24, 9, 3); ctx.fill();

    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -55, 13, 0, 7); ctx.fill();
    ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, -56, 13.5, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-13, -55); ctx.quadraticCurveTo(-7, -61, 0, -57);
    ctx.quadraticCurveTo(7, -61, 13, -55); ctx.quadraticCurveTo(13, -64, 0, -65);
    ctx.quadraticCurveTo(-13, -64, -13, -55); ctx.fill();

    var blink = Math.sin(phase * 0.5) > 0.92;
    ctx.fillStyle = '#2a2a2a';
    if(blink){
      ctx.lineWidth = 2; ctx.strokeStyle = '#2a2a2a';
      ctx.beginPath(); ctx.moveTo(-6, -54); ctx.lineTo(-2, -54); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2, -54); ctx.lineTo(6, -54); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(-4, -54, 2.2, 0, 7); ctx.arc(4, -54, 2.2, 0, 7); ctx.fill();
    }

    ctx.fillStyle = blush; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.arc(-7, -49, 2.8, 0, 7); ctx.arc(7, -49, 2.8, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = '#d47c6e'; ctx.lineWidth = 1.5;
    if(emotion === 'sad'){ ctx.beginPath(); ctx.arc(0, -49, 2.5, Math.PI - 0.3, 0.3); ctx.stroke(); }
    else if(emotion === 'surprise'){ ctx.beginPath(); ctx.arc(0, -50, 2.5, 0, 7); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(0, -52, 2.5, 0.2, Math.PI - 0.2); ctx.stroke(); }

    ctx.fillStyle = '#d94e4e'; roundRectPath(ctx, -17, -45, 7, 18, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-17, -43); ctx.quadraticCurveTo(-22, -35, -17, -28); ctx.stroke();

    ctx.restore();
  }

  function drawBg(ctx, w, h, now, glints){
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#e8f0f8'); grad.addColorStop(1, '#d4e4d0');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#c8d8c0'; ctx.beginPath();
    ctx.moveTo(0, h * 0.65); ctx.lineTo(w, h * 0.65);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.06)'; ctx.lineWidth = 1;
    for(var i = 0; i < 12; i++){
      var x = (i * 47) % w;
      ctx.beginPath(); ctx.moveTo(x, h * 0.65); ctx.lineTo(x + 20, h); ctx.stroke();
    }

    if(glints > 0){
      ctx.save();
      for(var j = 0; j < 6; j++){
        var gx = (j * 83 + now * 0.02) % w, gy = h * 0.72 + (j % 3) * 25;
        ctx.fillStyle = 'rgba(184,134,11,' + (0.2 + 0.1 * Math.sin(now * 0.003 + j)) + ')';
        ctx.beginPath(); ctx.arc(gx, gy, 2, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawShelf(ctx, x, y, scale, broken){
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-50, -60); ctx.lineTo(-50, 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(50, -60); ctx.lineTo(50, 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-55, -55); ctx.lineTo(55, -55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-55, 0); ctx.lineTo(55, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-55, 55); ctx.lineTo(55, 55); ctx.stroke();
    if(broken){
      ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-45, 60); ctx.lineTo(45, 60); ctx.stroke();
      ctx.fillStyle = '#c0392b'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('短了！', 0, 85);
    }
    ctx.restore();
  }

  function drawRulerHint(ctx, w, h){
    var x = w * 0.5, y = h * 0.78;
    ctx.save();
    ctx.fillStyle = '#ffffff'; roundRectPath(ctx, x - 100, y - 10, 200, 20, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#2c2c2c'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('测量需要工具 + 准确读数', x, y);
    ctx.restore();
  }

  function drawFrame(now){
    if(t0 === null) t0 = now;
    if(paused){ raf = requestAnimationFrame(drawFrame); lastNow = now; return; }
    var dt = lastNow ? now - lastNow : 0; lastNow = now;
    elapsed = (elapsed + dt) % DUR;
    var el = elapsed;
    bar.style.width = (el / DUR * 100) + '%';
    var sc = scenes[0];
    for(var i = 0; i < scenes.length; i++){
      if(el >= scenes[i][0] && el < scenes[i][1]){ sc = scenes[i]; break; }
    }
    if(cap.dataset.t !== String(sc[0])){ cap.dataset.t = String(sc[0]); cap.innerHTML = sc[2]; }
    var ctx = g.ctx, w = g.w, h = g.h;
    var wp = now * 0.012;
    ctx.clearRect(0, 0, w, h);

    if(sc[3] === 'shop'){
      drawBg(ctx, w, h, now, 1);
      drawShelf(ctx, w * 0.55, h * 0.55, 1.1, false);
      person(ctx, w * 0.24 + (el / 7000) * w * 0.12, h * 0.72, 1.4, 1, wp, 'normal');
      ctx.save(); ctx.fillStyle = '#8b6914'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('"差不多就行！"', w * 0.32, h * 0.38); ctx.restore();
    } else if(sc[3] === 'fail'){
      drawBg(ctx, w, h, now, 1);
      drawShelf(ctx, w * 0.55, h * 0.55, 1.1, true);
      person(ctx, w * 0.32, h * 0.72, 1.4, 1, 0, 'sad');
    } else if(sc[3] === 'teach'){
      drawBg(ctx, w, h, now, 1);
      person(ctx, w * 0.30, h * 0.72, 1.4, 1, 0, 'surprise');
      ctx.save(); ctx.fillStyle = '#4a8c3f'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('工具、分度值、估读，一个都不能少', w * 0.55, h * 0.42); ctx.restore();
      drawRulerHint(ctx, w, h);
    } else if(sc[3] === 'time'){
      drawBg(ctx, w, h, now, 1);
      person(ctx, w * 0.30, h * 0.72, 1.4, 1, wp, 'normal');
      ctx.save();
      ctx.fillStyle = '#2980b9'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('0.01 s', w * 0.62, h * 0.40);
      ctx.fillStyle = '#5a5a5a'; ctx.font = '13px sans-serif';
      ctx.fillText('差之毫厘，名次完全不同', w * 0.62, h * 0.48);
      ctx.restore();
    } else {
      drawBg(ctx, w, h, now, 1);
      person(ctx, w * 0.30, h * 0.72, 1.4, 1, wp, 'normal');
      ctx.save(); ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = '#8b6914'; ctx.shadowColor = 'rgba(184,134,11,.4)'; ctx.shadowBlur = 12;
      ctx.fillText('长度和时间的测量', w * 0.55, h * 0.40); ctx.restore();
    }
    raf = requestAnimationFrame(drawFrame);
  }

  var pauseBtn = document.getElementById('pauseBtn');
  function start(){
    if(raf) cancelAnimationFrame(raf);
    t0 = null; elapsed = 0; lastNow = 0; paused = false;
    pauseBtn.textContent = '⏸ 暂停';
    raf = requestAnimationFrame(drawFrame);
  }
  document.getElementById('replayBtn').addEventListener('click', start);
  pauseBtn.addEventListener('click', function(){
    paused = !paused;
    pauseBtn.textContent = paused ? '▶ 继续' : '⏸ 暂停';
  });
  document.getElementById('toExperimentBtn').addEventListener('click', function(){
    window.location.href = 'experiment.html';
  });

  window.addEventListener('resize', function(){
    cssH = cv.clientHeight || 320;
    g = fitCanvas(cv, cssH);
  });

  start();
})();
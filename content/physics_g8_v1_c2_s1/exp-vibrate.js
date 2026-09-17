/* ============================================================
   exp-vibrate.js — 发声体振动台：橡皮筋 slider 联动 + WebAudio 嗡嗡声
   ============================================================ */
(function(){
  'use strict';
  var DW = 640;                      /* 设计宽度 */
  var cv = document.getElementById('bandCv');
  var ctx = cv.getContext('2d');
  var W = 640, H = 300, k = 1;

  var amp = 60;                      /* slider 0..100 */
  var tension = 50;                  /* slider 0..100 */
  var held = false;                  /* 按住橡皮筋 */
  var plucked = false;               /* 已拨动 */
  var t0 = performance.now();
  var audio = null;                  /* {ctx} 按需发声 */
  var curAmp = 0;                    /* 当前振幅（设计单位px），随衰减变化 */
  var curCycle = -1;                 /* 已发声的振动周期序号 */
  var SAG = 8;                       /* 静止下垂量（设计单位px） */

  function baseFreq(){ return 90 + tension * 1.6; }          /* 90~250 Hz */
  function maxAmp(){ return 6 + amp * 0.22; }                /* 拨动初始振幅（设计单位px） */
  function vibAmp(){ return held ? 0 : curAmp; }

  function resize(){
    var f = fitCanvas(cv, getCssH(cv));
    ctx = f.ctx; W = f.w; H = parseFloat(cv.style.height) || f.h;
    k = W / DW;
    draw();
  }

  /* ===== 音频：每完成一个振动周期发一声短促拨弦声（随振幅衰减变轻） ===== */
  function ensureAudio(){
    if(audio) return audio;
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    audio = { ctx: new AC() };
    return audio;
  }
  function pluckSound(level){
    var a = ensureAudio();
    if(!a) return;
    if(a.ctx.state === 'suspended') a.ctx.resume();
    var ac = a.ctx, now = ac.currentTime;
    var f = baseFreq() * 2.2;
    var dur = Math.min(0.18, Math.max(0.04, 8 / baseFreq()));
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(60, f * 0.8), now + dur);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.005, 0.3 * level), now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain); gain.connect(ac.destination);
    osc.start(now); osc.stop(now + dur + 0.02);
  }
  function stopAudio(){ curCycle = -1; }

  /* ===== 场景绘制 ===== */
  function draw(){
    var now = (performance.now() - t0) / 1000;
    var freq = baseFreq() / 22;      /* 视觉振动频率 */

    /* 振幅衰减：衰减到阈值 → 停止发声并停止动画 */
    if(plucked && !held && curAmp > 0){
      curAmp = maxAmp() * Math.exp(-now / 1.2);
      var cyc = Math.floor(now * freq);
      if(cyc > curCycle){
        curCycle = cyc;
        var level = curAmp / maxAmp();
        if(level >= 0.04) pluckSound(level);
      }
      if(curAmp < 0.4){ curAmp = 0; plucked = false; updateState(); }
    }

    var A = vibAmp() * k;
    var phase = now * freq * Math.PI * 2;
    var yBase = H * 0.52;
    var x1 = W * 0.14, x2 = W * 0.86;

    /* 背景：暖色墙面 + 桌面 */
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#fdf3d8'); bg.addColorStop(1, '#f6dfa0');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    /* 木盒（橡皮筋绷在绿色盒子上，照教材图2.1-2） */
    var bx = W * 0.10, by = yBase + 18 * k, bw = W * 0.80, bh = H * 0.26;
    ctx.fillStyle = '#4a8c3f';
    roundRectPath(ctx, bx, by, bw, bh, 8 * k); ctx.fill();
    ctx.fillStyle = '#5cb84e';
    roundRectPath(ctx, bx, by, bw, 12 * k, 6 * k); ctx.fill();

    /* 振动虚影（多帧重影，体现"变胖变虚"；端点钉牢，只晃中间） */
    if(A > 0.5){
      var ghosts = 4;
      for(var g = 1; g <= ghosts; g++){
        var gp = phase + g * 0.42;
        var ga = A * (1 - g * 0.14);
        ctx.strokeStyle = 'rgba(139,105,20,' + (0.28 - g * 0.05) + ')';
        ctx.lineWidth = (3.2 - g * 0.3) * k;
        drawBand(x1, x2, yBase, Math.sin(gp) * ga);
      }
    }
    /* 主橡皮筋 */
    var my = Math.sin(phase) * A;
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 3.4 * k;
    drawBand(x1, x2, yBase, my);

    /* 固定钉 */
    pin(x1, yBase); pin(x2, yBase);

    /* 按住的手 */
    if(held) drawHand(W * 0.5, yBase);

    /* 拨动的手指箭头（拨动瞬间提示） */
    if(plucked && !held && now < 1.2){
      ctx.globalAlpha = Math.max(0, 1.2 - now);
      ctx.strokeStyle = '#2980b9'; ctx.lineWidth = 2 * k;
      ctx.beginPath();
      ctx.moveTo(W * 0.5, yBase - 46 * k); ctx.lineTo(W * 0.5, yBase - 16 * k);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W * 0.5 - 6 * k, yBase - 24 * k);
      ctx.lineTo(W * 0.5, yBase - 14 * k);
      ctx.lineTo(W * 0.5 + 6 * k, yBase - 24 * k);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    drawLabels(A, yBase);
  }

  /* 驻波包络 sin(π·u)：静止下垂量与振动位移都乘它 → 左右两端点(u=0/1)恒在 yBase */
  function drawBand(x1, x2, yBase, dy){
    var sag = SAG * k * Math.sin(0.01 * tension);
    ctx.beginPath();
    var N = 24;
    for(var i = 0; i <= N; i++){
      var u = i / N;
      var env = Math.sin(Math.PI * u);
      var x = x1 + (x2 - x1) * u;
      var y = yBase + (sag + dy) * env;
      if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  function pin(x, y){
    ctx.fillStyle = '#7c5812';
    ctx.beginPath(); ctx.arc(x, y, 5 * k, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c4a35a';
    ctx.beginPath(); ctx.arc(x, y, 2.4 * k, 0, Math.PI * 2); ctx.fill();
  }
  function drawHand(x, y){
    ctx.save();
    ctx.fillStyle = '#f7ddc4'; ctx.strokeStyle = '#c4a35a'; ctx.lineWidth = 1.6 * k;
    roundRectPath(ctx, x - 26 * k, y - 66 * k, 52 * k, 58 * k, 16 * k);
    ctx.fill(); ctx.stroke();
    /* 手指压在皮筋上 */
    roundRectPath(ctx, x - 10 * k, y - 14 * k, 20 * k, 22 * k, 9 * k);
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function drawLabels(A, yBase){
    ctx.font = 'bold ' + (13 * k) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8b6914';
    ctx.fillText('橡皮筋绷在盒子上', 14 * k, 24 * k);
    if(A > 0.5){
      ctx.fillStyle = '#c0392b';
      ctx.fillText('〰 振动中 → 每周期“铮”一声', 14 * k, 46 * k);
      /* 振幅标注：双向箭头 */
      var x0 = W * 0.90;
      ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 1.6 * k;
      ctx.beginPath();
      ctx.moveTo(x0, yBase - A - 4 * k); ctx.lineTo(x0, yBase + A + 4 * k);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x0 - 4 * k, yBase - A + 2 * k); ctx.lineTo(x0, yBase - A - 5 * k); ctx.lineTo(x0 + 4 * k, yBase - A + 2 * k);
      ctx.moveTo(x0 - 4 * k, yBase + A - 2 * k); ctx.lineTo(x0, yBase + A + 5 * k); ctx.lineTo(x0 + 4 * k, yBase + A - 2 * k);
      ctx.stroke();
      ctx.font = (11 * k) + 'px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('振幅', x0 - 8 * k, yBase);
      ctx.textAlign = 'left';
    } else if(held){
      ctx.fillStyle = '#5a5a5a';
      ctx.fillText('🖐 被按住：振动停止 → 发声停止', 14 * k, 46 * k);
    } else {
      ctx.fillStyle = '#5a5a5a';
      ctx.fillText('静止：不振动，不发声', 14 * k, 46 * k);
    }
  }
  /* ===== 控件与状态 ===== */
  var ampSlider = document.getElementById('ampSlider');
  var tensionSlider = document.getElementById('tensionSlider');
  var ampVal = document.getElementById('ampVal');
  var tensionVal = document.getElementById('tensionVal');
  var pluckBtn = document.getElementById('pluckBtn');
  var holdBtn = document.getElementById('holdBtn');
  var resetBtn = document.getElementById('resetBtn');
  var stateLine = document.getElementById('stateLine');

  function tensionName(v){ return v < 30 ? '松' : (v > 70 ? '紧' : '适中'); }
  function updateState(){
    var vibrating = !held && plucked;
    var vibBadge = vibrating ? '<span class="badge on">振动中</span>' : '<span class="badge off">不振动</span>';
    var sndBadge = vibrating ? '<span class="badge on">铮铮发声 🔊</span>' : '<span class="badge off">无声 🔇</span>';
    var note = held ? '手按住橡皮筋，振动被迫停止，发声也停止。' : (plucked ? '橡皮筋每完成一次振动就“铮”一声；振动越来越弱，声音也越来越轻，静止后不再发声。' : '橡皮筋静止，不发声音。点「拨动」试试！');
    stateLine.innerHTML = vibBadge + sndBadge + '<br><span style="font-size:13px;color:var(--ink2);">' + note + '</span>';
  }

  function onAmp(){
    amp = +ampSlider.value;
    ampVal.textContent = amp;
    updateState(); draw();
  }
  function onTension(){
    tension = +tensionSlider.value;
    tensionVal.textContent = tensionName(tension);
    draw();
  }
  ampSlider.addEventListener('input', onAmp);
  tensionSlider.addEventListener('input', onTension);

  pluckBtn.addEventListener('click', function(){
    held = false; holdBtn.classList.remove('holding'); holdBtn.textContent = '🖐 按住橡皮筋';
    plucked = true; t0 = performance.now();
    curAmp = maxAmp(); curCycle = -1;
    ensureAudio(); updateState();
  });
  function setHold(on){
    held = on;
    holdBtn.classList.toggle('holding', on);
    holdBtn.textContent = on ? '🖐 按住中…（松开继续）' : '🖐 按住橡皮筋';
    if(on){ stopAudio(); }
    updateState();
  }
  holdBtn.addEventListener('mousedown', function(){ setHold(true); });
  holdBtn.addEventListener('mouseup', function(){ setHold(false); });
  holdBtn.addEventListener('mouseleave', function(){ if(held) setHold(false); });
  holdBtn.addEventListener('touchstart', function(e){ e.preventDefault(); setHold(true); }, { passive: false });
  holdBtn.addEventListener('touchend', function(e){ e.preventDefault(); setHold(false); });
  resetBtn.addEventListener('click', function(){
    plucked = false; curAmp = 0; curCycle = -1; setHold(false);
    ampSlider.value = 60; tensionSlider.value = 50;
    onAmp(); onTension();
  });

  /* ===== 主循环 ===== */
  function loop(){
    draw();
    requestAnimationFrame(loop);
  }

  FullscreenHelper.bind(document.getElementById('fsVibWrap'), document.getElementById('fsVibBtn'), resize);
  window.addEventListener('resize', resize);
  onAmp(); onTension(); updateState(); resize();
  requestAnimationFrame(loop);
})();

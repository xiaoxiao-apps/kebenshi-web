/* ============================================================
   exp-vacuum.js — 真空罩模拟：粒子密度 + 铃声波形联动 + 三步追问
   ============================================================ */
(function(){
  'use strict';
  var DW = 640;
  var cv = document.getElementById('vacCv');
  var ctx = cv.getContext('2d');
  var W = 640, H = 320, k = 1;

  var playing = false;           /* 闹铃播放中（振动+有声，真空时只振无声） */
  var pumping = false;           /* 按住抽气 */
  var audio = null;              /* WebAudio：机械闹钟铃 */
  var t0 = performance.now();

  /* 粒子状态机：in(罩内漂)/tube(管内排队流动)/out(已入泵) */
  var N_PART = 48;
  var parts = [];
  (function seed(){
    var rng = 7;
    function rnd(){ rng = (rng * 16807) % 2147483647; return rng / 2147483647; }
    for(var i = 0; i < N_PART; i++){
      parts.push({ st: 'in', rx: rnd(), ry: rnd(), ph: rnd() * Math.PI * 2, sp: 0.4 + rnd() * 0.8, u: 0 });
    }
  })();
  function inCount(){ var n = 0; for(var i = 0; i < N_PART; i++) if(parts[i].st === 'in') n++; return n; }
  function airPct(){ return Math.round(inCount() / N_PART * 100); }
  function density(){ return inCount() / N_PART; }
  function ringAmp(){ return playing ? density() : 0; }

  function stepParts(dt){
    var sp = pumping ? 1.3 : 1.6, i, p;
    var tube = [];
    for(i = 0; i < N_PART; i++) if(parts[i].st === 'tube') tube.push(parts[i]);
    tube.sort(function(a, b){ return a.u - b.u; });
    if(pumping){
      /* 抽气：管尾空出间距才放下一粒进管；u 0→1 到泵口转 out */
      var minU = tube.length ? tube[0].u : 9;
      if(minU > 0.12){
        for(i = 0; i < N_PART; i++) if(parts[i].st === 'in'){ parts[i].st = 'tube'; parts[i].u = 0; break; }
      }
      for(i = 0; i < N_PART; i++){ p = parts[i]; if(p.st === 'tube'){ p.u += sp * dt; if(p.u >= 1) p.st = 'out'; } }
    } else {
      /* 松开：泵口空出间距才放下一粒回流；u 1→0 到罩内入口转 in */
      var maxU = tube.length ? tube[tube.length - 1].u : -9;
      if(maxU < 0.9){
        for(i = 0; i < N_PART; i++) if(parts[i].st === 'out'){ parts[i].st = 'tube'; parts[i].u = 1; break; }
      }
      for(i = 0; i < N_PART; i++){ p = parts[i]; if(p.st === 'tube'){ p.u -= sp * dt; if(p.u <= 0) p.st = 'in'; } }
    }
  }
  window.__vacParts = function(){ return parts.map(function(p){ return p.st === 'tube' ? +p.u.toFixed(2) : p.st; }); };
  window.__vacState = function(){ return { air: airPct(), playing: playing, pumping: pumping, gain: audio ? +audio.master.gain.value.toFixed(4) : null }; };

  function ensureAudio(){
    if(audio) return audio;
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    var ac = new AC();
    var g = ac.createGain(); g.gain.value = 0; g.connect(ac.destination);
    /* 金属铃碗泛音 + 铃锤连续快打铃的颤音（机械闹钟「叮铃铃」）
       颤音 LFO 接在 trem 节点上调制（0~1），master gain 只管音量：
       master=0 时真正静音（LFO 不能直接加在 master.gain 上，否则 gain=0 仍±振荡出声） */
    var trem = ac.createGain(); trem.gain.value = 1; trem.connect(g);
    var freqs = [2093, 2637, 3136, 4186];
    var gains = [0.4, 0.3, 0.22, 0.12];
    for(var i = 0; i < freqs.length; i++){
      var o = ac.createOscillator(); o.type = 'square'; o.frequency.value = freqs[i];
      var og = ac.createGain(); og.gain.value = gains[i];
      o.connect(og); og.connect(trem); o.start();
    }
    var lfo = ac.createOscillator(); lfo.frequency.value = 28;   /* 铃锤颤音 */
    var lfoG = ac.createGain(); lfoG.gain.value = 0.45;
    lfo.connect(lfoG); lfoG.connect(trem.gain);
    lfo.start();
    audio = { ctx: ac, master: g };
    return audio;
  }
  function syncAudio(){
    var a = audio;
    if(!a) return;
    if(a.ctx.state === 'suspended') a.ctx.resume();
    var lvl = ringAmp();
    a.master.gain.setTargetAtTime(lvl * 0.09, a.ctx.currentTime, 0.05);
  }
  function muteAudio(){
    if(audio) audio.master.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.05);
  }

  function resize(){
    var f = fitCanvas(cv, getCssH(cv));
    ctx = f.ctx; W = f.w; H = parseFloat(cv.style.height) || f.h;
    k = W / DW;
    draw();
  }

  /* ===== 绘制 ===== */
  function bellDome(){
    return {
      x: W * 0.20, w: W * 0.44,
      top: H * 0.12, base: H * 0.72
    };
  }
  function draw(){
    var now = (performance.now() - t0) / 1000;
    var d = bellDome();
    /* 背景 */
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#eaf5fd'); bg.addColorStop(1, '#d7e9f7');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    /* 底座 */
    ctx.fillStyle = '#8b6914';
    roundRectPath(ctx, d.x - 18 * k, d.base, d.w + 36 * k, 16 * k, 6 * k); ctx.fill();
    ctx.fillStyle = '#a8781e';
    roundRectPath(ctx, d.x - 18 * k, d.base, d.w + 36 * k, 6 * k, 3 * k); ctx.fill();
    /* 玻璃罩（钟罩形：圆顶+直筒） */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(d.x, d.base);
    ctx.lineTo(d.x, d.top + d.w * 0.42);
    ctx.quadraticCurveTo(d.x, d.top, d.x + d.w / 2, d.top);
    ctx.quadraticCurveTo(d.x + d.w, d.top, d.x + d.w, d.top + d.w * 0.42);
    ctx.lineTo(d.x + d.w, d.base);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    ctx.fill();
    ctx.clip();
    drawParticles(d, now);
    drawClock(d, now);
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(d.x, d.base);
    ctx.lineTo(d.x, d.top + d.w * 0.42);
    ctx.quadraticCurveTo(d.x, d.top, d.x + d.w / 2, d.top);
    ctx.quadraticCurveTo(d.x + d.w, d.top, d.x + d.w, d.top + d.w * 0.42);
    ctx.lineTo(d.x + d.w, d.base);
    ctx.strokeStyle = '#2980b9'; ctx.lineWidth = 2.5 * k; ctx.stroke();
    /* 抽气机 + 气管 */
    drawPump(d, now);
    /* 右侧：铃声波形 */
    drawWaveform(d, now);
    drawHud(d);
  }

  function drawParticles(d, now){
    /* 罩内漂的粒子 */
    ctx.fillStyle = '#2980b9';
    for(var i = 0; i < N_PART; i++){
      var p = parts[i];
      if(p.st !== 'in') continue;
      var drift = Math.sin(now * p.sp + p.ph) * 10 * k;
      var driftY = Math.cos(now * p.sp * 0.7 + p.ph) * 8 * k;
      var x = d.x + 8 * k + p.rx * (d.w - 16 * k) + drift;
      var y = d.top + 14 * k + p.ry * (d.base - d.top - 20 * k) + driftY;
      ctx.globalAlpha = 0.55 + 0.4 * Math.sin(now * 2 + p.ph);
      ctx.beginPath(); ctx.arc(x, y, 2.6 * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  /* 管内排队粒子：沿气管曲线插值 */
  function tubePoint(d, u, px, py){
    var x0 = d.x + d.w - 10 * k, y0 = d.base - 8 * k;
    var x1 = px, y1 = py - 18 * k;
    var mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 26 * k;
    var a = 1 - u;
    return {
      x: a * a * x0 + 2 * a * u * mx + u * u * x1,
      y: a * a * y0 + 2 * a * u * my + u * u * y1
    };
  }
  function drawTubeParts(d, px, py){
    ctx.fillStyle = '#2980b9';
    for(var i = 0; i < N_PART; i++){
      var p = parts[i];
      if(p.st !== 'tube') continue;
      var pt = tubePoint(d, p.u, px, py);
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 2.6 * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawClock(d, now){
    /* 整机振动：只跟 playing 走（介质只影响传声，不影响声源振动） */
    var bodyShake = playing ? Math.sin(now * 30) * 1.6 * k : 0;
    var cx = d.x + d.w / 2, cy = d.base - 46 * k + bodyShake, r = 30 * k;
    /* 闹钟身体 */
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fdecea';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2); ctx.fill();
    /* 表针 */
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2.2 * k;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - r * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r * 0.42, cy + r * 0.1); ctx.stroke();
    /* 铃铛 + 敲锤：振动只跟 playing 走 */
    var shake = playing ? Math.sin(now * 30) * 4 * k : 0;
    ctx.fillStyle = '#8b6914';
    ctx.beginPath(); ctx.arc(cx - r * 0.95 + shake, cy - r * 1.15, 8 * k, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.95 + shake, cy - r * 1.15, 8 * k, 0, Math.PI * 2); ctx.fill();
    /* 罩外传播的声纹弧线（幅度=密度） */
    var a = ringAmp();
    if(a > 0.03){
      ctx.strokeStyle = 'rgba(192,57,43,' + (0.5 * a) + ')';
      ctx.lineWidth = 2 * k;
      for(var i = 1; i <= 3; i++){
        var rr = (r + 14 * k * i) * (1 + 0.08 * Math.sin(now * 8));
        ctx.beginPath(); ctx.arc(cx, cy, rr, -0.5, 0.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, rr, Math.PI - 0.5, Math.PI + 0.5); ctx.stroke();
      }
    }
  }
  /* 泵体弹簧下压：按住下压一截、松开弹回（欠阻尼带过冲） */
  var pressV = 0, pressVel = 0, lastPT = 0;
  function drawPump(d, now){
    var dt = Math.min(0.05, Math.max(0.001, now - lastPT)); lastPT = now;
    var target = pumping ? 1 : 0;
    pressVel += (target - pressV) * 220 * dt;
    pressVel *= Math.exp(-9 * dt);
    pressV += pressVel * dt;
    var px = d.x + d.w + 34 * k, py = d.base - 6 * k + pressV * 4 * k;
    /* 气管：从罩内底部接到抽气机 */
    ctx.strokeStyle = '#5a5a5a'; ctx.lineWidth = 3 * k;
    ctx.beginPath();
    ctx.moveTo(d.x + d.w - 10 * k, d.base - 8 * k);
    ctx.quadraticCurveTo(px - 8 * k, py - 30 * k, px, py - 18 * k);
    ctx.stroke();
    drawTubeParts(d, px, py);
    /* 抽气机盒子（下压） */
    ctx.fillStyle = '#5a5a5a';
    roundRectPath(ctx, px - 4 * k, py - 18 * k, 64 * k, 34 * k, 6 * k); ctx.fill();
    ctx.fillStyle = pumping ? '#c0392b' : '#8a8a8a';
    roundRectPath(ctx, px + 2 * k, py - 12 * k, 52 * k, 12 * k, 4 * k); ctx.fill();
    /* 活塞杆+手柄：垂直下压/弹回，不左右晃 */
    var sink = pressV * 7 * k;
    ctx.strokeStyle = '#3d3d3d'; ctx.lineWidth = 2.5 * k;
    ctx.beginPath();
    ctx.moveTo(px + 28 * k, py - 18 * k);
    ctx.lineTo(px + 28 * k, py - 28 * k + sink);
    ctx.stroke();
    ctx.fillStyle = '#2c2c2c';
    roundRectPath(ctx, px + 18 * k, py - 33 * k + sink, 20 * k, 5 * k, 2.5 * k); ctx.fill();
    ctx.font = 'bold ' + (12 * k) + 'px sans-serif';
    ctx.fillStyle = '#2c2c2c';
    ctx.textAlign = 'left';
    ctx.fillText('抽气泵（可按住）', px - 4 * k, py + 30 * k);
  }

  /* 右侧铃声波形：幅度随空气密度联动 */
  function drawWaveform(d, now){
    var x0 = W * 0.70, ww = W * 0.27, cy = H * 0.30;
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    roundRectPath(ctx, x0 - 10 * k, cy - 60 * k, ww + 20 * k, 120 * k, 10 * k);
    ctx.fill();
    ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1 * k;
    ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x0 + ww, cy); ctx.stroke();
    var a = ringAmp();
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2 * k;
    ctx.beginPath();
    for(var x = 0; x <= ww; x += 2){
      var env = Math.abs(Math.sin(x / ww * Math.PI * 6 + now * 20));
      var y = cy + Math.sin(x / ww * Math.PI * 24 - now * 40) * 44 * k * a * (0.35 + 0.65 * env);
      if(x === 0) ctx.moveTo(x0 + x, y); else ctx.lineTo(x0 + x, y);
    }
    ctx.stroke();
    ctx.font = 'bold ' + (12 * k) + 'px sans-serif';
    ctx.fillStyle = '#2c2c2c'; ctx.textAlign = 'center';
    ctx.fillText('罩外听到的铃声', x0 + ww / 2, cy - 68 * k);
    ctx.font = (11 * k) + 'px sans-serif';
    ctx.fillStyle = '#5a5a5a';
    ctx.fillText(playing ? (a > 0.02 ? '响度 ' + Math.round(a * 100) + '%' : '无声（真空）') : '未播放', x0 + ww / 2, cy + 74 * k);
  }

  function drawHud(d){
    var air = airPct();
    ctx.font = 'bold ' + (13 * k) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2980b9';
    ctx.fillText('空气量 ' + air + '%', 14 * k, 24 * k);
    ctx.fillStyle = '#5a5a5a';
    ctx.font = (11.5 * k) + 'px sans-serif';
    var msg = !playing ? '点「播放闹铃」：闹钟振动+铃声'
      : (pumping ? '抽气中：粒子排队过管入泵，铃声变小'
      : (air === 0 ? '真空：闹钟仍振动，但没介质传声'
      : (air < 35 ? '空气很少：铃声微弱'
      : '空气充足：铃声正常传播')));
    ctx.fillText(msg, 14 * k, 44 * k);
    /* 蓝点图例 */
    ctx.fillStyle = '#2980b9';
    ctx.beginPath(); ctx.arc(20 * k, 60 * k, 2.6 * k, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a5a5a';
    ctx.fillText('= 空气粒子（传声介质）', 28 * k, 64 * k);
  }

  /* ===== 控件：播放/按住抽气/重置 ===== */
  var airVal = document.getElementById('airVal');
  var stateLine = document.getElementById('stateLine');
  var playBtn = document.getElementById('playBtn');
  var pumpBtn = document.getElementById('pumpBtn');
  var resetVac = document.getElementById('resetVac');

  function updateState(){
    var air = airPct(), d = density();
    var badge = !playing ? '<span style="color:var(--ink2);font-weight:800;">未播放 ⏸</span>'
      : d > 0.6 ? '<span style="color:var(--green);font-weight:800;">铃声正常 🔔</span>'
      : (d > 0.05 ? '<span style="color:var(--gold);font-weight:800;">铃声变小 🔉</span>'
      : '<span style="color:var(--red);font-weight:800;">闹钟仍振动，但真空无声 🔇</span>');
    stateLine.innerHTML = badge + ' <span style="font-size:13px;color:var(--ink2);">罩内空气 ' + air + '%。按住抽气：粒子排队过管；松开：回流。抽到真空闹钟仍在振动，只是没介质传声。</span>';
    if(airVal) airVal.textContent = air + '%';
  }
  function setPlaying(v){
    if(playing === v) return;
    playing = v;
    if(playBtn) playBtn.textContent = v ? '⏸ 暂停闹铃' : '▶ 播放闹铃';
    if(v){ ensureAudio(); syncAudio(); } else muteAudio();
    updateState();
  }
  function setPumping(v){
    if(pumping === v) return;
    pumping = v;
    if(pumpBtn){
      pumpBtn.textContent = v ? '💨 抽气中…' : '🫳 按住抽气';
      pumpBtn.classList.toggle('pressed', v);
    }
    updateState();
  }
  if(playBtn) playBtn.addEventListener('click', function(){ setPlaying(!playing); });
  /* 按住抽气键：pointer/mouse/touch 三套，按住才抽、松开停 */
  (function bindHold(el){
    if(!el) return;
    function start(e){ e.preventDefault(); ensureAudio(); setPumping(true); }
    function stop(){ setPumping(false); }
    el.addEventListener('pointerdown', start);
    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointerleave', stop);
    el.addEventListener('pointercancel', stop);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    window.addEventListener('touchcancel', stop);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  })(pumpBtn);
  /* 画布上直接按住泵体 = 按住抽气键 */
  cv.addEventListener('pointerdown', function(e){
    var rect = cv.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    var d = bellDome();
    var px = d.x + d.w + 34 * k, py = d.base - 6 * k;
    if(x >= px - 6 * k && x <= px + 62 * k && y >= py - 36 * k && y <= py + 18 * k){
      e.preventDefault(); ensureAudio(); setPumping(true);
    }
  });
  cv.addEventListener('pointerup', function(){ setPumping(false); });
  cv.addEventListener('pointercancel', function(){ setPumping(false); });
  cv.addEventListener('pointerleave', function(){ setPumping(false); });
  resetVac.addEventListener('click', function(){
    setPumping(false); setPlaying(false);
    for(var i = 0; i < N_PART; i++){ parts[i].st = 'in'; parts[i].u = 0; }
    updateState();
  });

  /* ===== 三步追问：逐题解锁，答完出推理链徽章 ===== */
  var done = 0;
  function bindQ(stepId, fbId, nextId){
    var step = document.getElementById(stepId);
    step.querySelectorAll('.opt').forEach(function(opt){
      opt.addEventListener('click', function(){
        if(step.dataset.done) return;
        if(opt.dataset.ok === '1'){
          step.dataset.done = '1';
          opt.classList.add('right');
          step.querySelectorAll('.opt').forEach(function(o){ if(o !== opt) o.classList.add('dim'); });
          document.getElementById(fbId).classList.add('show');
          done++;
          document.getElementById('qaCounter').textContent = '进度 ' + done + '/3';
          if(nextId) document.getElementById(nextId).classList.remove('locked');
          if(done >= 3) document.getElementById('badgeZone').classList.add('show');
        } else {
          opt.classList.add('wrong');
          setTimeout(function(){ opt.classList.remove('wrong'); }, 900);
        }
      });
    });
  }
  bindQ('q1', 'fb1', 'q2');
  bindQ('q2', 'fb2', 'q3');
  bindQ('q3', 'fb3', null);

  /* ===== 主循环 ===== */
  var lastT = performance.now(), lastHud = 0;
  function loop(){
    var now = performance.now();
    stepParts((now - lastT) / 1000); lastT = now;
    if(now - lastHud > 250){ lastHud = now; updateState(); if(playing) syncAudio(); }   /* HTML 读数+音量跟空气量实时联动 */
    draw(); requestAnimationFrame(loop);
  }
  FullscreenHelper.bind(document.getElementById('fsVacWrap'), document.getElementById('fsVacBtn'), resize);
  window.addEventListener('resize', resize);
  updateState(); resize();
  requestAnimationFrame(loop);
})();

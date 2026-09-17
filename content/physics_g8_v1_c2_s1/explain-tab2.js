/* ============================================================
   explain-tab2.js — Tab②「声音的传播」真空罩交互实验（仅供 explain.html）
   播放：罩内闹钟跳动（机身弹跳+铃锤摆动）+ WebAudio 循环铃声；
   按住抽气泵：蓝色空气粒子沿管子逐个外逃、铃声渐小，抽真空后无声；
   松开：粒子沿管回流进罩、铃声渐大恢复正常。
   绘制颜色一律 hex/rgba 字面量，不用 CSS 变量。
   ============================================================ */
(function(){
  'use strict';
  var cv = document.getElementById('t2VacCv');
  if(!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var DW = 520;                      /* 设计宽度 */
  var W = DW, H = 280, k = 1;

  var air = 100;                     /* 罩内空气百分比 0..100 */
  var playing = false;               /* 播放中：闹钟跳动+发声 */
  var pumping = false;               /* 按住抽气泵 */
  var lastT = performance.now();

  /* ===== 空气粒子池：N 个，状态机 in(罩内漂)/tube(管内排队流动)/out(已入泵待回流) ===== */
  var N = 40, parts = [], idxByRank = [];
  (function seed(){
    var rng = 11;
    function rnd(){ rng = (rng * 16807) % 2147483647; return rng / 2147483647; }
    var order = [], i, j, tmp;
    for(i = 0; i < N; i++) order.push(i);
    for(i = N - 1; i > 0; i--){
      j = Math.floor(rnd() * (i + 1));
      tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
    for(i = 0; i < N; i++){
      parts.push({ rx: rnd(), ry: rnd(), ph: rnd() * Math.PI * 2,
                   sp: 0.4 + rnd() * 0.8, rank: order[i], st: 'in', u: 0 });
      idxByRank[order[i]] = i;
    }
  })();
  /* 排队过管：抽气 in→tube(u↑)→out(吸入泵)；松开 out→tube(u↓)→in，间距 gap 一粒粒进 */
  function stepParticles(dt){
    var i, p, minU, maxU, r;
    var sp = pumping ? 1.15 : 1.7;             /* 管内流速：回流略快 */
    for(i = 0; i < N; i++){
      p = parts[i];
      if(p.st === 'tube'){
        p.u += (pumping ? sp : -sp) * dt;
        if(p.u >= 1){ p.st = 'out'; p.u = 1; }
        else if(p.u <= 0){ p.st = 'in'; p.u = 0; }
      }
    }
    if(pumping){
      minU = 2;
      for(i = 0; i < N; i++) if(parts[i].st === 'tube' && parts[i].u < minU) minU = parts[i].u;
      for(r = 0; r < N; r++){                  /* rank 升序离罩 */
        p = parts[idxByRank[r]];
        if(p.st !== 'in') continue;
        if(minU < 0.15) break;                 /* 管尾未空出间距：排队等 */
        p.st = 'tube'; p.u = 0; minU = 0;
      }
    } else {
      maxU = -1;
      for(i = 0; i < N; i++) if(parts[i].st === 'tube' && parts[i].u > maxU) maxU = parts[i].u;
      for(r = N - 1; r >= 0; r--){             /* 后吸入的先回流 */
        p = parts[idxByRank[r]];
        if(p.st !== 'out') continue;
        if(maxU > 0.88) break;                 /* 泵口未空出间距：排队等 */
        p.st = 'tube'; p.u = 1; maxU = 1;
      }
    }
  }
  window.__t2Parts = function(){               /* QA 钩子：粒子状态分布 */
    var c = { in: 0, tube: 0, out: 0 }, us = [];
    for(var i = 0; i < N; i++){ c[parts[i].st]++; if(parts[i].st === 'tube') us.push(+parts[i].u.toFixed(2)); }
    return { c: c, us: us };
  };

  function fit(){
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var w = cv.clientWidth || cv.parentElement.clientWidth || DW;
    var h = Math.round(w * H / DW);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = w; H = h; k = w / DW;
  }

  function geo(){
    var bw = W * 0.42, bx = W * 0.10;
    var top = H * 0.10, base = H * 0.72;
    return { bx: bx, bw: bw, top: top, base: base,
             px: W * 0.70, py: H * 0.56, pw: W * 0.21, ph: H * 0.17 };
  }

  /* 管子中心线：罩内右下 → 侧壁外 → 抽气泵（二次贝塞尔） */
  function tubePts(g){
    return [ { x: g.bx + g.bw - 10 * k, y: g.base - 14 * k },
             { x: g.bx + g.bw + 26 * k, y: g.base - 50 * k },
             { x: g.px - 2 * k, y: g.py + g.ph * 0.4 } ];
  }
  function bez(p, t){
    var mt = 1 - t;
    return { x: mt * mt * p[0].x + 2 * mt * t * p[1].x + t * t * p[2].x,
             y: mt * mt * p[0].y + 2 * mt * t * p[1].y + t * t * p[2].y };
  }
  function rrect(x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ===== WebAudio：机械闹钟「叮铃铃」——金属铃partials(非谐正弦) + 25Hz 快颤音，懒创建 ===== */
  var ac = null, airGain = null;
  function ensureAudio(){
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    if(!ac){
      ac = new AC();
      var trem = ac.createGain(); trem.gain.value = 0.7;
      airGain = ac.createGain(); airGain.gain.value = 0;   /* 音量 = f(air) */
      trem.connect(airGain); airGain.connect(ac.destination);
      /* 铃碗非谐 partials：正弦叠置出金属感 */
      var parts = [[2093, 0.5], [2637, 0.34], [3720, 0.18], [5274, 0.08]];
      parts.forEach(function(p){
        var o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = p[0];
        var g = ac.createGain(); g.gain.value = p[1];
        o.connect(g); g.connect(trem);
        o.start();
      });
      /* 25Hz 快颤音 = 机械铃锤连续打铃的「铃铃铃…」 */
      var lfo = ac.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 25;
      var lfoG = ac.createGain(); lfoG.gain.value = 0.45;
      lfo.connect(lfoG); lfoG.connect(trem.gain);
      lfo.start();
    }
    if(ac.state !== 'running' && ac.resume) ac.resume();
    return ac;
  }
  function syncGain(){
    if(!ac || !airGain) return;
    var target = playing ? 0.10 * Math.pow(air / 100, 1.3) : 0;
    airGain.gain.setTargetAtTime(target, ac.currentTime, 0.06);
  }
  window.__t2AudioCtx = function(){ return ac; };          /* QA 钩子 */
  window.__t2AirGain = function(){ return airGain; };
  window.__t2State = function(){ return { air: air, playing: playing, pumping: pumping }; };

  /* ===== 玻璃罩（透明质感：高光条+顶部弧形反光+边缘描边） ===== */
  function bellPath(g){
    ctx.beginPath();
    ctx.moveTo(g.bx, g.base);
    ctx.lineTo(g.bx, g.top + g.bw * 0.40);
    ctx.quadraticCurveTo(g.bx, g.top, g.bx + g.bw / 2, g.top);
    ctx.quadraticCurveTo(g.bx + g.bw, g.top, g.bx + g.bw, g.top + g.bw * 0.40);
    ctx.lineTo(g.bx + g.bw, g.base);
    ctx.closePath();
  }
  function drawBase(g){
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(g.bx - 16 * k, g.base, g.bw + 32 * k, 14 * k);
    ctx.fillStyle = '#a8781e';
    ctx.fillRect(g.bx - 16 * k, g.base, g.bw + 32 * k, 5 * k);
  }
  function drawGlass(g){
    /* 左侧高光条 + 右缘反光（clip 在罩内） */
    ctx.save();
    bellPath(g); ctx.clip();
    var hg = ctx.createLinearGradient(g.bx, 0, g.bx + g.bw, 0);
    hg.addColorStop(0, 'rgba(255,255,255,0.34)');
    hg.addColorStop(0.18, 'rgba(255,255,255,0.06)');
    hg.addColorStop(0.85, 'rgba(255,255,255,0)');
    hg.addColorStop(1, 'rgba(255,255,255,0.22)');
    ctx.fillStyle = hg;
    ctx.fillRect(g.bx, g.top, g.bw, g.base - g.top);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2.4 * k;
    ctx.beginPath();
    ctx.arc(g.bx + g.bw / 2, g.top + g.bw * 0.40, g.bw * 0.34, Math.PI * 1.25, Math.PI * 1.6);
    ctx.stroke();
    ctx.restore();
    /* 边缘反光：蓝色主体描边 + 白色细描边 */
    bellPath(g);
    ctx.strokeStyle = '#2980b9'; ctx.lineWidth = 2.5 * k; ctx.stroke();
    bellPath(g);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1 * k; ctx.stroke();
    /* 罩口密封 rim */
    ctx.fillStyle = '#b9c9d4';
    ctx.fillRect(g.bx - 4 * k, g.base - 3 * k, g.bw + 8 * k, 4 * k);
  }
  /* ===== 管子：双层描边呈现管壁厚度 ===== */
  function drawTube(g){
    var tp = tubePts(g);
    function path(){
      ctx.beginPath();
      ctx.moveTo(tp[0].x, tp[0].y);
      ctx.quadraticCurveTo(tp[1].x, tp[1].y, tp[2].x, tp[2].y);
    }
    ctx.lineCap = 'round';
    path(); ctx.strokeStyle = '#7f8c8d'; ctx.lineWidth = 9 * k; ctx.stroke();
    path(); ctx.strokeStyle = 'rgba(214,234,248,0.92)'; ctx.lineWidth = 5 * k; ctx.stroke();
    ctx.lineCap = 'butt';
  }
  /* ===== 抽气泵机身：按住下压一截、松开弹簧弹回（带过冲），不左右晃 ===== */
  var pressV = 0, pressVel = 0, lastPT = 0;
  function drawPump(g, now){
    var dt = Math.min(0.05, Math.max(0.001, now - lastPT)); lastPT = now;
    var target = pumping ? 1 : 0;                  /* 欠阻尼弹簧：压下/弹回 */
    pressVel += (target - pressV) * 220 * dt;
    pressVel *= Math.exp(-9 * dt);
    pressV += pressVel * dt;
    var press = pressV * 5 * k;
    var py = g.py + press;
    rrect(g.px, py, g.pw, g.ph, 8 * k);
    ctx.fillStyle = '#5a5a5a'; ctx.fill();
    rrect(g.px + 6 * k, py + 6 * k, g.pw - 12 * k, g.ph * 0.38, 4 * k);
    ctx.fillStyle = pumping ? '#c0392b' : '#8a8a8a'; ctx.fill();
    /* 活塞杆 + 手柄：垂直下压/弹回（无左右晃动） */
    var sink = pressV * 8 * k;
    ctx.strokeStyle = '#3d3d3d'; ctx.lineWidth = 3 * k;
    ctx.beginPath();
    ctx.moveTo(g.px + g.pw * 0.5, py - 2 * k);
    ctx.lineTo(g.px + g.pw * 0.5, py - 12 * k + sink);
    ctx.stroke();
    ctx.fillStyle = '#2c2c2c';
    rrect(g.px + g.pw * 0.5 - 10 * k, py - 17 * k + sink, 20 * k, 5 * k, 2.5 * k);
    ctx.fill();
    ctx.font = 'bold ' + Math.max(10, 12 * k) + 'px sans-serif';
    ctx.fillStyle = '#2c2c2c'; ctx.textAlign = 'center';
    ctx.fillText('抽气泵', g.px + g.pw / 2, py + g.ph + 14 * k);
    ctx.textAlign = 'left';
  }

  /* ===== 闹钟：双铃+铃锤+支脚；播放中机身弹跳、铃锤摆动 ===== */
  function drawClock(g, now){
    /* 只要播放中闹钟就一直震动发声（真空里也震，只是听不见） */
    var bob = playing ? Math.abs(Math.sin(now * 18)) * 3 * k : 0;
    var cx = g.bx + g.bw / 2;
    var footY = g.base - 8 * k;
    var r = Math.min(g.bw * 0.24, 30 * k);
    var cy = footY - 9 * k - r - bob;
    ctx.save();
    ctx.translate(cx, cy);
    /* 支脚 */
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 3 * k;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, r * 0.85); ctx.lineTo(-r * 0.9, footY - cy);
    ctx.moveTo(r * 0.55, r * 0.85); ctx.lineTo(r * 0.9, footY - cy);
    ctx.stroke();
    /* 双铃 + 铃锤（摆动） */
    var swing = playing ? Math.sin(now * 34) * 0.5 : 0;
    ctx.save();
    ctx.rotate(swing * 0.3);
    ctx.fillStyle = '#8b6914';
    ctx.beginPath(); ctx.arc(-r * 0.9, -r * 0.95, r * 0.36, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.9, -r * 0.95, r * 0.36, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.rotate(swing);
    ctx.strokeStyle = '#6b4a08'; ctx.lineWidth = 2.4 * k;
    ctx.beginPath(); ctx.moveTo(0, -r * 0.95); ctx.lineTo(0, -r * 1.45); ctx.stroke();
    ctx.fillStyle = '#6b4a08';
    ctx.beginPath(); ctx.arc(0, -r * 1.5, 2.6 * k, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    /* 机身 + 表盘 + 表针 */
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fdecea';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2.2 * k;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * 0.42, r * 0.1); ctx.stroke();
    ctx.restore();
    /* 罩外声纹弧线：幅度=f(air) */
    var a = playing ? air / 100 : 0;
    if(a > 0.04){
      ctx.strokeStyle = 'rgba(192,57,43,' + (0.45 * a).toFixed(3) + ')';
      ctx.lineWidth = 2 * k;
      for(var i = 1; i <= 3; i++){
        var rr = (r + 12 * k * i) * (1 + 0.08 * Math.sin(now * 8));
        ctx.beginPath(); ctx.arc(cx, cy, rr, -0.5, 0.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, rr, Math.PI - 0.5, Math.PI + 0.5); ctx.stroke();
      }
    }
  }

  /* ===== 粒子：罩内漂（clip 内）/ 管内排队流动（clip 外，tubePass）；out 已入泵不画 ===== */
  function drawParticles(g, now, tubePass){
    var tp = tubePts(g);
    ctx.fillStyle = '#2980b9';
    for(var i = 0; i < N; i++){
      var p = parts[i], x, y, alpha;
      if(tubePass){
        if(p.st !== 'tube') continue;
        var q = bez(tp, p.u);
        var jig = (p.u > 0.92 || p.u < 0.08) ? 0.8 : 1.6;
        x = q.x + Math.sin(now * 3 + p.ph) * jig * k;
        y = q.y + Math.cos(now * 3 + p.ph) * jig * k;
        alpha = 0.9;
        if(p.u > 0.92) alpha *= (1 - p.u) / 0.08 * 0.7 + 0.3;   /* 泵口被吸入淡出 */
      } else {
        if(p.st !== 'in') continue;
        x = g.bx + 8 * k + p.rx * (g.bw - 16 * k) + Math.sin(now * p.sp + p.ph) * 9 * k;
        y = g.top + 14 * k + p.ry * (g.base - g.top - 22 * k) + Math.cos(now * p.sp * 0.7 + p.ph) * 7 * k;
        alpha = 0.55 + 0.4 * Math.sin(now * 2 + p.ph);
      }
      ctx.globalAlpha = alpha;
      ctx.beginPath(); ctx.arc(x, y, 2.6 * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ===== HUD：空气量读数 + 状态提示 + 图例 ===== */
  function drawHud(g, now){
    /* 读数/提示放右上、图例放右下——都避开玻璃罩区域 */
    ctx.font = 'bold ' + Math.max(11, 13 * k) + 'px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#2980b9';
    ctx.fillText('空气量 ' + Math.round(air) + '%', W - 10 * k, 20 * k);
    ctx.fillStyle = '#5a5a5a';
    ctx.font = Math.max(10, 11.5 * k) + 'px sans-serif';
    var msg = !playing ? '点「播放」：闹钟响铃'
      : air < 1 ? '真空：闹钟仍在振动，但无声'
      : pumping ? '抽气中：粒子排队过管入泵，铃声变小'
      : air > 99 ? '空气充足：铃声正常'
      : '进气中：粒子排队沿管回流罩内，铃声变大';
    ctx.fillText(msg, W - 10 * k, 38 * k);
    ctx.fillStyle = '#2980b9';
    ctx.beginPath(); ctx.arc(W - 10 * k - ctx.measureText('= 空气粒子（传声介质）').width - 8 * k, H - 12 * k, 2.6 * k, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a5a5a';
    ctx.fillText('= 空气粒子（传声介质）', W - 10 * k, H - 8 * k);
    ctx.textAlign = 'left';
  }

  function draw(){
    var now = performance.now();
    var dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    /* air 更新：抽气 ~16/s 递减，回流 ~22/s 回升（与排队流速匹配） */
    if(pumping){ air = Math.max(0, air - 16 * dt); }
    else if(air < 100){ air = Math.min(100, air + 22 * dt); }
    stepParticles(dt);
    if(ac) syncGain();
    var airEl = document.getElementById('t2AirVal');
    if(airEl) airEl.textContent = Math.round(air) + '%';

    var g = geo();
    ctx.clearRect(0, 0, W, H);
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#fdf3d8'); bg.addColorStop(1, '#f3e2b3');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    drawTube(g);                       /* 管在罩后：入口被罩沿盖住 */
    drawBase(g);
    ctx.save();
    bellPath(g); ctx.clip();
    ctx.fillStyle = 'rgba(41,128,185,0.06)';
    bellPath(g); ctx.fill();
    drawParticles(g, now / 1000, false);               /* 罩内粒子 */
    drawClock(g, now / 1000);
    ctx.restore();
    drawGlass(g);
    drawParticles(g, now / 1000, true);                /* 管内粒子：不被罩 clip 裁掉 */
    drawPump(g, now / 1000);
    drawHud(g, now / 1000);
    requestAnimationFrame(draw);
  }

  /* ===== 控件：按钮 + 画布上泵体都可按压 ===== */
  var playBtn = document.getElementById('t2Play');
  var pumpBtn = document.getElementById('t2Pump');
  function setPumping(v){
    if(pumping === v) return;
    pumping = v;
    if(pumpBtn){
      pumpBtn.textContent = v ? '💨 抽气中…' : '🫳 按住抽气';
      pumpBtn.classList.toggle('pressed', v);      /* 按钮下压动作效果（画布按泵体时同步） */
    }
  }
  if(playBtn) playBtn.addEventListener('click', function(){
    playing = !playing;
    playBtn.textContent = playing ? '⏸ 暂停' : '▶ 播放';
    if(playing) ensureAudio();
    syncGain();
  });
  if(pumpBtn){
    var start = function(e){
      e.preventDefault();
      setPumping(true);
    };
    var stop = function(){
      setPumping(false);
    };
    pumpBtn.addEventListener('pointerdown', start);
    pumpBtn.addEventListener('mousedown', start);
    pumpBtn.addEventListener('touchstart', start, { passive: false });
    pumpBtn.addEventListener('pointerup', stop);
    pumpBtn.addEventListener('pointerleave', stop);
    pumpBtn.addEventListener('pointercancel', stop);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    window.addEventListener('touchcancel', stop);
    window.addEventListener('pointerup', stop);      /* pointerdown preventDefault 会吞 mouseup，pointerup 必挂 */
    window.addEventListener('pointercancel', stop);
  }
  /* 画布上直接按压泵体（含手柄区）= 按住抽气键 */
  cv.addEventListener('pointerdown', function(e){
    var rect = cv.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    var g = geo();
    if(x >= g.px && x <= g.px + g.pw && y >= g.py - 18 * k && y <= g.py + g.ph){
      e.preventDefault();
      setPumping(true);
    }
  });
  /* 画布内松开/移出也停（双保险，防 preventDefault 吞事件） */
  cv.addEventListener('pointerup', function(){ setPumping(false); });
  cv.addEventListener('pointercancel', function(){ setPumping(false); });
  cv.addEventListener('pointerleave', function(){ setPumping(false); });

  window.addEventListener('resize', fit);
  fit();
  requestAnimationFrame(draw);
})();

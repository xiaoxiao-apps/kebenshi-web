/* ============================================================
   explain-tab3.js — Tab③「声波与水波」交互实验（仅供 explain.html）
   声波模式：左侧竖直摆放的真实感鼓（鼓面朝右，同教材图）——木纹横卧鼓身/
     皮质鼓面高光/铆钉/支架，点「敲击」→ 鼓面沿法向振动 + WebAudio 鼓声，
     波前（同心弧）向右扩散，
     越远越稀疏、范围越大、透明度随距离衰减；
   水波模式：透视立体水面（蓝绿渐变+高光斑），点「击打水面」
     （或直接点水面选点）→ 同心椭圆涟漪向四周扩散，
     线宽与透明度随半径衰减直到消失，伴轻微水声。
   绘制颜色一律 hex/rgba 字面量，不用 CSS 变量。
   ============================================================ */
(function(){
  'use strict';
  var cv = document.getElementById('t3WaveCv');
  if(!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var DW = 560, W = DW, H = 260, k = 1;
  var mode = 'sound';
  var fronts = [];      /* 声波波前出生时间戳 ms（含错峰的未来出生） */
  var ripples = [];     /* 水波涟漪 {x,y,t0} */
  var drumHit = 0;      /* 敲击时间戳 ms，0=未敲 */
  var rafId = 0;
  var ac = null;

  function fit(){
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var w = cv.clientWidth || cv.parentElement.clientWidth || DW;
    var h = window.innerWidth <= 768 ? 210 : 260;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = w; H = h; k = w / DW;
  }

  /* ---------- 音频：鼓声（低频咚+噪声瞬态）/ 水声（带通噪声） ---------- */
  function audio(){
    if(!ac){
      var AC = window.AudioContext || window.webkitAudioContext;
      if(AC) ac = new AC();
    }
    if(ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function drumSound(){
    var a = audio(); if(!a) return;
    var t = a.currentTime;
    var o = a.createOscillator(), g = a.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.22);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + 0.4);
    var len = Math.floor(a.sampleRate * 0.06);
    var buf = a.createBuffer(1, len, a.sampleRate);
    var d = buf.getChannelData(0);
    for(var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = a.createBufferSource(); src.buffer = buf;
    var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    var ng = a.createGain(); ng.gain.value = 0.25;
    src.connect(lp); lp.connect(ng); ng.connect(a.destination);
    src.start(t);
  }
  /* 水声（第1版回退）：bandpass 噪声——噪声包络 → 带通（中心 ~700Hz 每滴略异）→ 快起音慢衰，噗噜水花感 */
  function waterSound(){
    var a = audio(); if(!a) return;
    var t = a.currentTime;
    var len = Math.floor(a.sampleRate * 0.35);
    var buf = a.createBuffer(1, len, a.sampleRate);
    var d = buf.getChannelData(0);
    for(var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.6);
    var src = a.createBufferSource(); src.buffer = buf;
    var bp = a.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = 620 + Math.random() * 160;
    bp.Q.value = 2.8;
    var g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.5, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    src.connect(bp); bp.connect(g); g.connect(a.destination);
    src.start(t);
  }
  window.__t3Ripples = function(){ return ripples.slice(); };   /* QA 钩子 */

  /* ---------- 鼓几何：竖直摆放，鼓面朝右（同教材）；鼓身向左横卧 ---------- */
  function geo(){
    var gx = W * 0.20, gy = H * 0.46;      /* 鼓面中心 */
    var rx = 13 * k, ry = 46 * k;          /* 鼓面椭圆：横半轴小（透视）、竖半轴大 */
    var bl = 62 * k;                        /* 鼓身向左长度 */
    return { gx: gx, gy: gy, rx: rx, ry: ry, bl: bl };
  }
  function vibAmp(now){                     /* 敲击后 0.9s 衰减振幅 */
    if(!drumHit) return 0;
    var dt = (now - drumHit) / 1000;
    if(dt > 0.9){ drumHit = 0; return 0; }
    return Math.exp(-4.5 * dt) * Math.sin(dt * 55);
  }

  function drawDrum(now){
    var g = geo(), amp = vibAmp(now);
    var jx = amp * 4 * k;                   /* 鼓面沿法向（水平）抖动 */
    var jy = amp * 0.8 * k;                 /* 鼓身微颤 */
    var topY = g.gy - g.ry, botY = g.gy + g.ry;
    var lx = g.gx - g.bl;                   /* 鼓身左端 */
    /* 支架：两斜腿+横档（撑住横卧鼓身） */
    ctx.strokeStyle = '#6b4a08'; ctx.lineWidth = 4 * k; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(g.gx - g.bl * 0.75, botY - g.ry * 0.25);
    ctx.lineTo(g.gx - g.bl * 0.95, botY + 16 * k);
    ctx.moveTo(g.gx - g.bl * 0.25, botY - g.ry * 0.25);
    ctx.lineTo(g.gx - g.bl * 0.05, botY + 16 * k);
    ctx.moveTo(g.gx - g.bl * 0.85, botY + 8 * k);
    ctx.lineTo(g.gx - g.bl * 0.15, botY + 8 * k);
    ctx.stroke();
    /* 地面投影 */
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.beginPath();
    ctx.ellipse(g.gx - g.bl * 0.5, botY + 18 * k, g.bl * 0.62, 5 * k, 0, 0, Math.PI * 2);
    ctx.fill();
    /* 鼓身：横卧木桶，竖向渐变（上亮中明下暗）+ 桶形鼓肚 */
    var bg = ctx.createLinearGradient(0, topY, 0, botY);
    bg.addColorStop(0, '#7c4a12'); bg.addColorStop(0.3, '#b0722a');
    bg.addColorStop(0.6, '#9c6220'); bg.addColorStop(1, '#6b3d0c');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(lx, topY + g.ry * 0.18 + jy);
    ctx.bezierCurveTo(lx - g.bl * 0.10, g.gy - g.ry * 0.55 + jy, lx - g.bl * 0.10, g.gy + g.ry * 0.55 + jy, lx, botY - g.ry * 0.18 + jy);
    ctx.lineTo(g.gx, botY - g.ry * 0.10 + jy * 0.4);
    ctx.lineTo(g.gx, topY + g.ry * 0.10 + jy * 0.4);
    ctx.closePath(); ctx.fill();
    /* 木纹横线（沿桶轴向） */
    ctx.strokeStyle = 'rgba(60,32,4,0.35)'; ctx.lineWidth = 1 * k;
    for(var i = -2; i <= 2; i++){
      var yy = g.gy + i * g.ry * 0.32;
      ctx.beginPath();
      ctx.moveTo(lx + 2 * k, yy + jy * 0.6);
      ctx.quadraticCurveTo(lx + g.bl * 0.5, yy + (i === 0 ? 0 : i * 1.5 * k) + jy * 0.5, g.gx - 2 * k, yy + jy * 0.3);
      ctx.stroke();
    }
    /* 左端箍圈 + 近鼓面箍圈 */
    ctx.strokeStyle = '#4a2a06'; ctx.lineWidth = 3 * k;
    ctx.beginPath(); ctx.ellipse(lx, g.gy + jy, g.rx * 0.75, g.ry * 0.86, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(g.gx - g.bl * 0.16, g.gy + jy * 0.5, g.rx * 0.85, g.ry * 0.95, 0, 0, Math.PI * 2); ctx.stroke();
    /* 鼓面侧壁（皮质环带，连接鼓身与鼓面） */
    ctx.fillStyle = '#e8d5a8';
    ctx.beginPath();
    ctx.ellipse(g.gx + jx, g.gy, g.rx, g.ry, 0, Math.PI * 0.5, Math.PI * 1.5);
    ctx.lineTo(g.gx - g.bl * 0.02 + jx * 0.5, topY + g.ry * 0.10);
    ctx.lineTo(g.gx - g.bl * 0.02 + jx * 0.5, botY - g.ry * 0.10);
    ctx.closePath(); ctx.fill();
    /* 鼓面（朝右）：皮质径向高光 */
    var fg = ctx.createRadialGradient(g.gx + jx - g.rx * 0.3, g.gy - g.ry * 0.35, 2, g.gx + jx, g.gy, g.ry);
    fg.addColorStop(0, '#f7ecd2'); fg.addColorStop(0.6, '#e8d5a8'); fg.addColorStop(1, '#cbb078');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.ellipse(g.gx + jx, g.gy, g.rx, g.ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.ellipse(g.gx + jx, g.gy, g.rx, g.ry, 0, 0, Math.PI * 2); ctx.stroke();
    /* 鼓边铆钉（沿鼓面椭圆一周） */
    ctx.fillStyle = '#5a3a08';
    for(var n = 0; n < 10; n++){
      var a = n / 10 * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(g.gx + jx + Math.cos(a) * g.rx * 0.92, g.gy + Math.sin(a) * g.ry * 0.94, 1.8 * k, 0, Math.PI * 2);
      ctx.fill();
    }
    /* 振动提示线（鼓面右侧） */
    if(Math.abs(amp) > 0.08){
      ctx.strokeStyle = 'rgba(192,57,43,0.55)'; ctx.lineWidth = 1.6 * k;
      for(var s = 0; s < 2; s++){
        ctx.beginPath();
        ctx.arc(g.gx + jx + g.rx + 6 * k + s * 6 * k, g.gy, 8 * k, -0.6, 0.6);
        ctx.stroke();
      }
    }
    return g;
  }

  /* ---------- 声波模式：波前向右扩散，越远越稀疏/范围越大/越淡 ---------- */
  function drawSound(now){
    var g = drawDrum(now);
    var sx = g.gx + g.rx, sy = g.gy;         /* 波源：鼓面右缘 */
    fronts = fronts.filter(function(t0){ return now - t0 < 4200; });
    fronts.forEach(function(t0){
      var age = (now - t0) / 1000;
      if(age < 0) return;                    /* 错峰未出生 */
      var r = age * 130 * k;                 /* 波前半径 */
      if(r < 4 * k) return;
      var span = Math.min(W - sx - 4 * k, r);
      if(span <= 0) return;
      var alpha = Math.max(0, 0.75 * (1 - age / 4.2));
      /* 疏密相间：主弧（密）+ 内侧伴弧（疏密对） */
      ctx.strokeStyle = 'rgba(41,128,185,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = (2.6 - 1.6 * age / 4.2) * k;
      ctx.beginPath();
      ctx.arc(sx, sy, r, -0.85, 0.85);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(41,128,185,' + (alpha * 0.45).toFixed(3) + ')';
      ctx.lineWidth = 1.2 * k;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.86, -0.7, 0.7);
      ctx.stroke();
    });
    /* 说明文字 */
    ctx.fillStyle = '#8b6914';
    ctx.font = 'bold ' + Math.max(10, 12 * k) + 'px sans-serif';
    ctx.fillText('鼓面振动 → 声波一圈圈向右传（越远越稀疏）', W * 0.34, H * 0.12);
  }

  /* ---------- 水波模式：透视立体水面 + 同心椭圆涟漪 ---------- */
  function waterGeo(){
    return { cx: W * 0.5, cy: H * 0.56, rx: W * 0.42, ry: H * 0.30 };
  }
  function drawWater(now){
    var w = waterGeo();
    /* 水面：蓝绿径向渐变 + 边缘深水色 */
    var wg = ctx.createRadialGradient(w.cx - w.rx * 0.25, w.cy - w.ry * 0.5, 4, w.cx, w.cy, w.rx);
    wg.addColorStop(0, '#bfe3ea'); wg.addColorStop(0.55, '#7fc4d4'); wg.addColorStop(1, '#3d8fa3');
    ctx.fillStyle = wg;
    ctx.beginPath(); ctx.ellipse(w.cx, w.cy, w.rx, w.ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2c6e7f'; ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.ellipse(w.cx, w.cy, w.rx, w.ry, 0, 0, Math.PI * 2); ctx.stroke();
    /* 静态高光斑（立体感） */
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(w.cx - w.rx * 0.35, w.cy - w.ry * 0.42, w.rx * 0.28, w.ry * 0.16, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.ellipse(w.cx + w.rx * 0.3, w.cy + w.ry * 0.3, w.rx * 0.16, w.ry * 0.09, 0.2, 0, Math.PI * 2); ctx.fill();
    /* 涟漪：同心椭圆环外扩，线宽与透明度随半径衰减 */
    ripples = ripples.filter(function(rp){ return now - rp.t0 < 3600; });
    ripples.forEach(function(rp){
      var age = (now - rp.t0) / 1000;
      for(var ring = 0; ring < 4; ring++){
        var rr = age * 90 * k - ring * 16 * k;
        if(rr <= 2 * k) continue;
        var fade = Math.max(0, 1 - rr / (w.rx * 1.05));
        if(fade <= 0) continue;
        var a = 0.65 * fade * (1 - ring * 0.18);
        ctx.strokeStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
        ctx.lineWidth = (2.8 * fade + 0.6) * k;
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, rr, rr * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    ctx.fillStyle = '#2c6e7f';
    ctx.font = 'bold ' + Math.max(10, 12 * k) + 'px sans-serif';
    ctx.fillText('点水面任意处击打 → 涟漪向四周扩散（越远越弱）', W * 0.06, H * 0.10);
  }

  /* ---------- 主循环 ---------- */
  function draw(now){
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fdf8ec';
    ctx.fillRect(0, 0, W, H);
    if(mode === 'sound') drawSound(now); else drawWater(now);
    var busy = mode === 'sound'
      ? (fronts.length > 0 || drumHit > 0)
      : (ripples.length > 0);
    if(busy) rafId = requestAnimationFrame(draw);
    else rafId = 0;
  }
  function kick(){ if(!rafId) rafId = requestAnimationFrame(draw); }

  /* ---------- 事件 ---------- */
  var btnWave = document.getElementById('t3ModeWave');
  var btnWater = document.getElementById('t3ModeWater');
  var btnHit = document.getElementById('t3Hit');
  var btnTap = document.getElementById('t3Tap');
  function setMode(m){
    mode = m;
    fronts = []; ripples = []; drumHit = 0;
    btnHit.style.display = m === 'sound' ? '' : 'none';
    btnTap.style.display = m === 'water' ? '' : 'none';
    btnWave.classList.toggle('on', m === 'sound');
    btnWater.classList.toggle('on', m === 'water');
    kick();
  }
  btnWave.addEventListener('click', function(){ setMode('sound'); });
  btnWater.addEventListener('click', function(){ setMode('water'); });
  btnHit.addEventListener('click', function(){
    var now = performance.now();
    drumHit = now;
    for(var i = 0; i < 6; i++) fronts.push(now + i * 260);   /* 一串错峰波前 */
    drumSound();
    kick();
  });
  btnTap.addEventListener('click', function(){
    var w = waterGeo();
    ripples.push({ x: w.cx - w.rx * 0.15, y: w.cy, t0: performance.now() });
    waterSound();
    kick();
  });
  cv.addEventListener('pointerdown', function(e){
    if(mode !== 'water') return;
    var rect = cv.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    /* 点击范围夹回湖面椭圆边界内（超出则落在边界上） */
    var w = waterGeo();
    var dx = x - w.cx, dy = y - w.cy;
    var m = Math.sqrt(dx * dx / (w.rx * w.rx) + dy * dy / (w.ry * w.ry));
    if(m > 0.94){
      var s = 0.94 / m;
      x = w.cx + dx * s; y = w.cy + dy * s;
    }
    ripples.push({ x: x, y: y, t0: performance.now() });
    waterSound();
    kick();
  });
  window.addEventListener('resize', function(){ fit(); kick(); });
  fit(); setMode('sound');
})();

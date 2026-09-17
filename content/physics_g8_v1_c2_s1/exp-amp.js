/* ============================================================
   exp-amp.js — 振动放大器：鼓面碎纸屑 + 音叉点水 + 慢镜头回放
   ============================================================ */
(function(){
  'use strict';
  var DW = 640;
  var cv = document.getElementById('ampCv');
  var ctx = cv.getContext('2d');
  var W = 640, H = 320, k = 1;

  var force = 60;             /* slider 10..100 */
  var t = 0;                  /* 场景时间 */
  var last = performance.now();
  var slow = false;           /* 慢镜头 0.25x */

  /* 敲击事件：hitT=敲击时刻；纸屑粒子 */
  var hitT = -99;
  var chits = [];             /* 碎纸屑 {x0, v, ph, size, color} */
  var rng = 11;
  function rnd(){ rng = (rng * 16807) % 2147483647; return rng / 2147483647; }
  for(var i = 0; i < 14; i++){
    chits.push({
      off: (rnd() - 0.5) * 74,    /* 鼓面上相对中心位置（设计单位） */
      v: 0.7 + rnd() * 0.8,       /* 弹跳速度系数 */
      ph: rnd() * Math.PI * 2,
      size: 2.4 + rnd() * 2.4,
      color: rnd() > 0.5 ? '#f2c14e' : '#ffffff',
      rot: rnd() * Math.PI
    });
  }

  /* 音叉点水事件 */
  var forkT = -99;
  var drops = [];               /* 水花粒子 {x,y,vx,vy,life} */
  var ripples = [];             /* 水面涟漪 {t0} */

  /* ===== 音效：敲鼓 / 音叉（WebAudio） ===== */
  var audio = null;
  function ensureAudio(){
    if(audio) return audio;
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    var ac = new AC();
    var g = ac.createGain(); g.gain.value = 0.5; g.connect(ac.destination);
    var nb = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.2), ac.sampleRate);
    var nd = nb.getChannelData(0);
    for(var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    audio = { ctx: ac, out: g, noise: nb };
    return audio;
  }
  function drumSound(f){
    var a = ensureAudio(); if(!a) return;
    if(a.ctx.state === 'suspended') a.ctx.resume();
    var t0 = a.ctx.currentTime, lv = 0.25 + 0.55 * (f / 100);
    /* 鼓面低频：sine 高频快滑到 50Hz + 衰减（力度越大越响） */
    var o = a.ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(140 + f, t0);
    o.frequency.exponentialRampToValueAtTime(50, t0 + 0.28);
    var og = ac_gain(a, lv, 0.4);
    o.connect(og); og.connect(a.out); o.start(t0); o.stop(t0 + 0.45);
    /* 敲击瞬态：噪声过低通 */
    var ns = a.ctx.createBufferSource(); ns.buffer = a.noise;
    var nf = a.ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 900;
    var ng = ac_gain(a, lv * 0.5, 0.09);
    ns.connect(nf); nf.connect(ng); ng.connect(a.out); ns.start(t0); ns.stop(t0 + 0.1);
  }
  function forkSound(){
    var a = ensureAudio(); if(!a) return;
    if(a.ctx.state === 'suspended') a.ctx.resume();
    var t0 = a.ctx.currentTime;
    /* 音叉：近纯音 512Hz 慢衰 + 弱 4 次泛音（金属味） */
    [[512, 0.3, 1.6], [2048, 0.06, 0.25]].forEach(function(cfg){
      var o = a.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = cfg[0];
      var g2 = ac_gain(a, cfg[1], cfg[2]);
      o.connect(g2); g2.connect(a.out); o.start(t0); o.stop(t0 + cfg[2] + 0.05);
    });
  }
  function ac_gain(a, lv, dur){
    var g = a.ctx.createGain();
    g.gain.setValueAtTime(lv, a.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.ctx.currentTime + dur);
    return g;
  }
  window.__ampDbg = function(){ return { audio: !!audio, state: audio ? audio.ctx.state : 'none' }; };

  function resize(){
    var f = fitCanvas(cv, getCssH(cv));
    ctx = f.ctx; W = f.w; H = parseFloat(cv.style.height) || f.h;
    k = W / DW;
    draw();
  }

  /* 鼓面振动衰减：敲后 ~1.6s 内衰减 */
  function drumEnv(){
    var dt = t - hitT;
    if(dt < 0 || dt > 1.8) return 0;
    return Math.exp(-dt * 2.6) * (force / 100);
  }
  function forkEnv(){
    var dt = t - forkT;
    if(dt < 0 || dt > 2.2) return 0;
    return Math.exp(-dt * 1.8);
  }

  /* ===== 左半屏：鼓 + 碎纸屑 ===== */
  function drawDrum(){
    var cx = W * 0.26, cy = H * 0.60;
    var env = drumEnv();
    var shim = Math.sin(t * 46) * 3.2 * k * env;   /* 鼓面高频微颤 */

    /* 鼓身 */
    ctx.fillStyle = '#c0392b';
    roundRectPath(ctx, cx - 62 * k, cy - 4 * k, 124 * k, 66 * k, 10 * k); ctx.fill();
    ctx.fillStyle = '#e74c3c';
    roundRectPath(ctx, cx - 62 * k, cy - 4 * k, 124 * k, 14 * k, 6 * k); ctx.fill();
    /* 鼓面椭圆（随振动上下位移 shim） */
    ctx.fillStyle = '#f5e8d8';
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 3 * k;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 6 * k + shim, 62 * k, 16 * k, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    /* 鼓架腿 */
    ctx.strokeStyle = '#7c5812'; ctx.lineWidth = 5 * k;
    ctx.beginPath();
    ctx.moveTo(cx - 44 * k, cy + 60 * k); ctx.lineTo(cx - 52 * k, cy + 84 * k);
    ctx.moveTo(cx + 44 * k, cy + 60 * k); ctx.lineTo(cx + 52 * k, cy + 84 * k);
    ctx.stroke();

    /* 碎纸屑：弹跳高度 ∝ 力度（放大可视化） */
    for(var i = 0; i < chits.length; i++){
      var p = chits[i];
      var dt = t - hitT;
      var jump = 0;
      if(dt >= 0 && dt < 1.8){
        /* 多次弹跳，衰减 */
        var bt = dt * p.v * 5.2 + p.ph;
        var s = Math.abs(Math.sin(bt));
        jump = s * (58 * k) * env * p.v;
      }
      var px = cx + p.off * k;
      var py = cy - 10 * k + shim * (1 - Math.abs(p.off) / 60) - jump;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.rot + t * 6 * p.v * (env > 0.02 ? 1 : 0));
      ctx.fillStyle = p.color;
      ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 0.8 * k;
      ctx.fillRect(-p.size * k, -p.size * k * 0.6, p.size * 2 * k, p.size * 1.2 * k);
      ctx.strokeRect(-p.size * k, -p.size * k * 0.6, p.size * 2 * k, p.size * 1.2 * k);
      ctx.restore();
    }

    /* 鼓槌（槌头朝鼓：敲击瞬间落到鼓面） */
    var dt2 = t - hitT;
    var swing = dt2 >= 0 && dt2 < 0.35 ? (1 - dt2 / 0.35) : (dt2 < 0 && dt2 > -0.3 ? (-dt2 / 0.3) : 0.55);
    ctx.save();
    ctx.translate(cx + 78 * k, cy - 40 * k);
    ctx.rotate(0.35 - swing * 0.85);   /* 静止抬起，swing=1 时槌头落到鼓面右缘 */
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 5 * k;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-52 * k, 0); ctx.stroke();
    ctx.fillStyle = '#c4a35a';
    ctx.beginPath(); ctx.arc(-56 * k, 0, 9 * k, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    /* 标注 */
    ctx.font = 'bold ' + (12 * k) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8b6914';
    ctx.fillText('鼓面碎纸屑', cx, H - 12 * k);
    if(env > 0.05){
      ctx.fillStyle = '#c0392b';
      ctx.font = (11 * k) + 'px sans-serif';
      ctx.fillText('力度' + force + '：纸屑跳 ' + Math.round(env * 58) + 'px 高', cx, 22 * k);
      /* 跳动幅度双向箭头 */
      var ax = cx + 78 * k, top = cy - 14 * k - env * 58 * k, bot = cy - 10 * k;
      ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 1.6 * k;
      ctx.beginPath(); ctx.moveTo(ax, top); ctx.lineTo(ax, bot); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax - 4 * k, top + 6 * k); ctx.lineTo(ax, top); ctx.lineTo(ax + 4 * k, top + 6 * k);
      ctx.moveTo(ax - 4 * k, bot - 6 * k); ctx.lineTo(ax, bot); ctx.lineTo(ax + 4 * k, bot - 6 * k);
      ctx.stroke();
    }
  }
  /* ===== 右半屏：音叉点水 ===== */
  function drawFork(){
    var cx = W * 0.74, waterY = H * 0.62;
    var env = forkEnv();
    var shim = Math.sin(t * 60) * 2.2 * k * env;

    /* 水槽 */
    ctx.fillStyle = 'rgba(41,128,185,.18)';
    roundRectPath(ctx, cx - 88 * k, waterY - 4 * k, 176 * k, 74 * k, 8 * k); ctx.fill();
    ctx.strokeStyle = '#2980b9'; ctx.lineWidth = 2 * k;
    roundRectPath(ctx, cx - 88 * k, waterY - 4 * k, 176 * k, 74 * k, 8 * k); ctx.stroke();
    /* 水面 */
    ctx.fillStyle = '#a9d3ee';
    ctx.fillRect(cx - 84 * k, waterY, 168 * k, 62 * k);
    /* 涟漪 */
    var sp = 90 * k;
    ctx.lineWidth = 1.8 * k;
    for(var i = 0; i < ripples.length; i++){
      var age = t - ripples[i];
      if(age < 0 || age > 2) continue;
      var r = sp * age;
      var a = Math.max(0, 0.75 - age * 0.38);
      ctx.strokeStyle = 'rgba(255,255,255,' + a + ')';
      ctx.beginPath();
      ctx.ellipse(cx, waterY + 8 * k, r, r * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    /* 水花粒子 */
    ctx.fillStyle = '#7fc4ee';
    for(var j = 0; j < drops.length; j++){
      var d = drops[j];
      if(d.life <= 0) continue;
      ctx.globalAlpha = Math.min(1, d.life * 2);
      ctx.beginPath(); ctx.arc(d.x, d.y, 2.2 * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* 音叉：U 形，振动时两臂开合 shim */
    var forkX = cx, forkTop = waterY - 96 * k;
    ctx.strokeStyle = '#5a5a5a'; ctx.lineWidth = 7 * k; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(forkX - 12 * k - shim, forkTop);
    ctx.lineTo(forkX - 12 * k - shim, waterY - 26 * k);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(forkX + 12 * k + shim, forkTop);
    ctx.lineTo(forkX + 12 * k + shim, waterY - 26 * k);
    ctx.stroke();
    ctx.lineWidth = 8 * k;
    ctx.beginPath();
    ctx.arc(forkX, waterY - 26 * k, 12 * k, 0, Math.PI);
    ctx.stroke();
    /* 叉柄插入水中 */
    ctx.lineWidth = 6 * k;
    ctx.beginPath();
    ctx.moveTo(forkX, waterY - 22 * k);
    ctx.lineTo(forkX, waterY + 22 * k);
    ctx.stroke();
    ctx.lineCap = 'butt';
    /* 橡皮锤（敲击瞬间） */
    var dtf = t - forkT;
    if(dtf >= -0.3 && dtf < 0.4){
      var sw = dtf < 0 ? (-dtf / 0.3) : Math.max(0, 1 - dtf / 0.4);
      ctx.save();
      ctx.translate(forkX - 40 * k - sw * 26 * k, forkTop + 10 * k);
      ctx.fillStyle = '#c0392b';
      roundRectPath(ctx, -10 * k, -7 * k, 20 * k, 14 * k, 6 * k); ctx.fill();
      ctx.strokeStyle = '#7c5812'; ctx.lineWidth = 4 * k;
      ctx.beginPath(); ctx.moveTo(-10 * k, 0); ctx.lineTo(-30 * k, 14 * k); ctx.stroke();
      ctx.restore();
    }
    /* 振动标注 */
    if(env > 0.05){
      ctx.strokeStyle = '#2980b9'; ctx.lineWidth = 1.6 * k;
      ctx.beginPath();
      ctx.moveTo(forkX - 20 * k, forkTop - 8 * k); ctx.lineTo(forkX - 28 * k, forkTop - 8 * k);
      ctx.moveTo(forkX + 20 * k, forkTop - 8 * k); ctx.lineTo(forkX + 28 * k, forkTop - 8 * k);
      ctx.stroke();
      ctx.fillStyle = '#2980b9';
      ctx.font = (11 * k) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('音叉振动→溅起水花', forkX, forkTop - 16 * k);
    }
    ctx.font = 'bold ' + (12 * k) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a5e8c';
    ctx.fillText('音叉点水', cx, H - 12 * k);
  }

  function stepDrops(dt){
    /* 水花生成：音叉入水瞬间 */
    var since = t - forkT;
    if(since >= 0 && since < 0.06 && drops.length < 60){
      var cx = W * 0.74, waterY = H * 0.62;
      for(var i = 0; i < 16; i++){
        drops.push({
          x: cx + (rnd() - 0.5) * 20 * k,
          y: waterY,
          vx: (rnd() - 0.5) * 160 * k,
          vy: -rnd() * 220 * k,
          life: 0.7 + rnd() * 0.5
        });
      }
      ripples.push(t);
      if(ripples.length > 8) ripples.shift();
    }
    for(var j = 0; j < drops.length; j++){
      var d = drops[j];
      if(d.life <= 0) continue;
      d.x += d.vx * dt; d.y += d.vy * dt;
      d.vy += 520 * k * dt;
      d.life -= dt;
    }
    /* 持续振动时周期发波 */
    var env = forkEnv();
    if(env > 0.15 && Math.sin(t * 12) > 0.985) ripples.push(t);
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    /* 背景 */
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#fdf6e3'); bg.addColorStop(1, '#f6e6c0');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    /* 分隔虚线 */
    ctx.strokeStyle = 'rgba(139,105,20,.3)'; ctx.lineWidth = 1.5 * k;
    ctx.setLineDash([6 * k, 5 * k]);
    ctx.beginPath(); ctx.moveTo(W * 0.5, 14 * k); ctx.lineTo(W * 0.5, H - 14 * k); ctx.stroke();
    ctx.setLineDash([]);
    drawDrum();
    drawFork();
    /* 慢镜头标识 */
    if(slow){
      ctx.fillStyle = 'rgba(41,128,185,.85)';
      ctx.font = 'bold ' + (13 * k) + 'px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('🐢 慢镜头 0.25×', W - 14 * k, 24 * k);
      ctx.textAlign = 'left';
    }
  }

  /* ===== 控件 ===== */
  var forceSlider = document.getElementById('forceSlider');
  var forceVal = document.getElementById('forceVal');
  var hitBtn = document.getElementById('hitBtn');
  var forkBtn = document.getElementById('forkBtn');
  var slowBtn = document.getElementById('slowBtn');

  forceSlider.addEventListener('input', function(){
    force = +forceSlider.value;
    forceVal.textContent = force;
  });
  hitBtn.addEventListener('click', function(){
    hitT = t;                      /* 重新敲击 */
    drumSound(force);
  });
  forkBtn.addEventListener('click', function(){
    forkT = t;
    drops = [];
    forkSound();
  });
  slowBtn.addEventListener('click', function(){
    slow = !slow;
    slowBtn.classList.toggle('active', slow);
    slowBtn.textContent = slow ? '🐢 慢镜头：开' : '🐢 慢镜头回放';
    if(slow){
      /* 回放：时间倒回最近一次敲击前 0.2s */
      var anchor = Math.max(hitT, forkT);
      if(anchor > -90) t = Math.max(0, anchor - 0.2);
    }
  });

  /* ===== 问答题 ===== */
  (function(){
    var card = document.getElementById('qaCard');
    var fb = document.getElementById('fbAmp');
    card.querySelectorAll('.opt').forEach(function(opt){
      opt.addEventListener('click', function(){
        if(card.dataset.done) return;
        if(opt.dataset.ok === '1'){
          card.dataset.done = '1';
          opt.classList.add('right');
          card.querySelectorAll('.opt').forEach(function(o){ if(o !== opt) o.classList.add('dim'); });
          fb.classList.add('show');
        } else {
          opt.classList.add('wrong');
          setTimeout(function(){ opt.classList.remove('wrong'); }, 900);
        }
      });
    });
  })();

  /* ===== 主循环 ===== */
  function loop(now){
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt * (slow ? 0.25 : 1);
    stepDrops(dt * (slow ? 0.25 : 1));
    draw();
    requestAnimationFrame(loop);
  }

  FullscreenHelper.bind(document.getElementById('fsAmpWrap'), document.getElementById('fsAmpBtn'), resize);
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(loop);
})();

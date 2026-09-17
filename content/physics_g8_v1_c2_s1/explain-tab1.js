/* ============================================================
   explain-tab1.js — Tab①「声音的产生」交互实验（仅供 explain.html）
   盒子上绷橡皮筋：拉动 slider 调绷紧长度——共鸣盒随橡皮筋一起变长/变短，
   橡皮筋拉长变细、缩短变粗；「拨动」按钮 WebAudio 真实发声 + 驻波振动动画。
   绘制颜色一律 hex/rgba 字面量，不用 CSS 变量。
   ============================================================ */
(function(){
  'use strict';
  var cv = document.getElementById('t1BandCv');
  if(!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var DW = 520;                      /* 设计宽度 */
  var W = DW, H = 240, k = 1;

  var tension = 50;                  /* slider 0..100：绷紧长度 */
  var vibrating = false, t0 = 0, rafId = 0;
  var ac = null;                     /* AudioContext（懒创建） */

  function freq(){ return Math.round(130 + 2.62 * tension); }   /* 130~392 Hz */
  function bandThick(){ return Math.max(1.6, (6 - 4 * tension / 100) * k); } /* 6px→2px */
  function bandColor(){
    /* 绷紧颜色加深：#c4a35a → #6b4a08（线性插值转 hex） */
    var c0 = [196, 163, 90], c1 = [107, 74, 8], t = tension / 100, out = '#';
    for(var i = 0; i < 3; i++){
      var v = Math.round(c0[i] + (c1[i] - c0[i]) * t);
      out += (v < 16 ? '0' : '') + v.toString(16);
    }
    return out;
  }

  function fit(){
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var w = cv.clientWidth || cv.parentElement.clientWidth || DW;
    var h = window.innerWidth <= 768 ? 200 : 240;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = w; H = h; k = w / DW;
    draw();
  }

  function geo(){
    /* 共鸣盒长度随绷紧长度联动：0→0.36W，100→0.70W（橡皮筋两端钉在盒顶，随之伸缩） */
    var bw = W * (0.36 + 0.34 * tension / 100), fh = H * 0.30;
    var dx = 18 * k, dy = 14 * k;                 /* 立体透视偏移 */
    var bx = (W - bw - dx) / 2, topY = H * 0.46;
    return { bw: bw, fh: fh, dx: dx, dy: dy, bx: bx, topY: topY,
      x1: bx + dx * 0.5, x2: bx + bw + dx * 0.5, yBase: topY - dy * 0.5 };
  }

  /* ===== 立体木盒：顶面亮、正面中、右侧暗 + 投影 ===== */
  function drawBox(g){
    /* 地面投影 */
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.beginPath();
    ctx.ellipse(g.bx + g.bw / 2 + g.dx, g.topY + g.fh + 4 * k, g.bw * 0.58, 5 * k, 0, 0, Math.PI * 2);
    ctx.fill();
    /* 右侧面（暗） */
    ctx.fillStyle = '#3a7231';
    ctx.beginPath();
    ctx.moveTo(g.bx + g.bw, g.topY);
    ctx.lineTo(g.bx + g.bw + g.dx, g.topY - g.dy);
    ctx.lineTo(g.bx + g.bw + g.dx, g.topY - g.dy + g.fh);
    ctx.lineTo(g.bx + g.bw, g.topY + g.fh);
    ctx.closePath(); ctx.fill();
    /* 正面 + 明暗渐变 */
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(g.bx, g.topY, g.bw, g.fh);
    var fg = ctx.createLinearGradient(0, g.topY, 0, g.topY + g.fh);
    fg.addColorStop(0, 'rgba(255,255,255,0.14)');
    fg.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = fg;
    ctx.fillRect(g.bx, g.topY, g.bw, g.fh);
    /* 顶面（亮） */
    ctx.fillStyle = '#6cc25a';
    ctx.beginPath();
    ctx.moveTo(g.bx, g.topY);
    ctx.lineTo(g.bx + g.dx, g.topY - g.dy);
    ctx.lineTo(g.bx + g.bw + g.dx, g.topY - g.dy);
    ctx.lineTo(g.bx + g.bw, g.topY);
    ctx.closePath(); ctx.fill();
    /* 棱线 */
    ctx.strokeStyle = '#2f5c27'; ctx.lineWidth = 1.4 * k;
    ctx.strokeRect(g.bx, g.topY, g.bw, g.fh);
    ctx.beginPath();
    ctx.moveTo(g.bx, g.topY); ctx.lineTo(g.bx + g.dx, g.topY - g.dy);
    ctx.lineTo(g.bx + g.bw + g.dx, g.topY - g.dy); ctx.lineTo(g.bx + g.bw, g.topY);
    ctx.moveTo(g.bx + g.bw + g.dx, g.topY - g.dy);
    ctx.lineTo(g.bx + g.bw + g.dx, g.topY - g.dy + g.fh);
    ctx.lineTo(g.bx + g.bw, g.topY + g.fh);
    ctx.stroke();
    /* 正面小标签 */
    ctx.fillStyle = '#eaf5e6';
    ctx.font = 'bold ' + Math.max(10, 12 * k) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('共鸣盒', g.bx + g.bw / 2, g.topY + g.fh * 0.62);
    ctx.textAlign = 'left';
  }

  function pin(x, y){
    ctx.fillStyle = '#7c5812';
    ctx.beginPath(); ctx.arc(x, y, 4.5 * k, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c4a35a';
    ctx.beginPath(); ctx.arc(x, y, 2 * k, 0, Math.PI * 2); ctx.fill();
  }
  /* ===== 橡皮筋：驻波包络 sin(pi*u)*sin(wt)，两端固定中间幅最大 ===== */
  function drawBand(g, amp, phase){
    var th = bandThick(), col = bandColor(), n = 48;
    function curve(shift, color, lw, alpha){
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha;
      ctx.beginPath();
      for(var i = 0; i <= n; i++){
        var u = i / n;
        var x = g.x1 + (g.x2 - g.x1) * u;
        var env = Math.sin(Math.PI * u);              /* 驻波包络：两端恒 0 */
        var y = g.yBase + (shift + amp * Math.sin(phase)) * env;   /* 下垂也乘包络→端点钉死在中心 */
        if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    /* 静止时轻微下垂感；振动时以驻波为主 */
    if(amp < 0.4){
      curve(6 * k * (1 - tension / 130), col, th, 1);
    } else {
      curve(0, col, th, 0.22);                        /* 虚影：另一相位 */
      curve(0, col, th * 1.5, 0.10);                  /* 运动模糊加粗感 */
      ctx.save();
      curve(0, col, th, 1);                           /* 主筋 */
      ctx.restore();
      /* 高光（细亮线，随主筋） */
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = Math.max(0.8, th * 0.3);
      ctx.beginPath();
      for(var i = 0; i <= n; i++){
        var u = i / n;
        var x = g.x1 + (g.x2 - g.x1) * u;
        var y = g.yBase + amp * Math.sin(Math.PI * u) * Math.sin(phase) - th * 0.3 * Math.sin(Math.PI * u);
        if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    pin(g.x1, g.yBase); pin(g.x2, g.yBase);
  }

  function drawLabels(g, amp){
    ctx.font = 'bold ' + Math.max(11, 13 * k) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8b6914';
    ctx.fillText('橡皮筋绷在盒子上', 12, 20);
    ctx.fillStyle = amp > 0.4 ? '#c0392b' : '#5a5a5a';
    ctx.fillText(amp > 0.4 ? '〰 振动中 → 发声（绷得越紧，音调越高）' : '静止：不振动，不发声', 12, 39);
  }

  function draw(){
    var g = geo(), amp = 0, phase = 0;
    if(vibrating){
      var dt = (performance.now() - t0) / 1000;
      if(dt > 1.5){ vibrating = false; }
      else{
        amp = 26 * k * Math.exp(-dt / 0.5);           /* 阻尼衰减 ~1.5s 停 */
        /* 视觉频率 = 真实频率 / 25（放慢但相对快慢正确） */
        phase = dt * (freq() / 25) * Math.PI * 2;
      }
    }
    ctx.clearRect(0, 0, W, H);
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#fdf3d8'); bg.addColorStop(1, '#f3e2b3');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    drawBox(g);
    drawBand(g, amp, phase);
    drawLabels(g, amp);
    rafId = requestAnimationFrame(draw);
  }

  /* ===== WebAudio：triangle + 低通，instant attack + exp decay ≈1.2s ===== */
  function pluck(){
    var AC = window.AudioContext || window.webkitAudioContext;
    if(AC){
      if(!ac) ac = new AC();
      if(ac.state !== 'running' && ac.resume) ac.resume();
      var t = ac.currentTime;
      var osc = ac.createOscillator();
      var lp = ac.createBiquadFilter();
      var gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq(), t);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2400, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.32, t + 0.01);          /* instant attack */
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);    /* exp decay */
      osc.connect(lp); lp.connect(gain); gain.connect(ac.destination);
      osc.start(t); osc.stop(t + 1.3);
      if(window.__t1AudioState) window.__t1AudioState();           /* QA 钩子（无副作用） */
    }
    vibrating = true; t0 = performance.now();
  }
  window.__t1AudioCtx = function(){ return ac; };                   /* QA：读 AudioContext */
  window.__t1AudioState = null;

  /* ===== 控件 ===== */
  var slider = document.getElementById('t1Tension');
  var pluckBtn = document.getElementById('t1Pluck');
  if(slider){
    slider.addEventListener('input', function(){
      tension = +slider.value;
    });
    tension = +slider.value;
  }
  if(pluckBtn) pluckBtn.addEventListener('click', pluck);
  window.addEventListener('resize', fit);
  fit();
})();

/* exp-ruler.js — 钢尺振动：左侧木桌 + 片状钢尺右伸 + WebAudio 变调（length→pitch） */
(function(){
  'use strict';
  var DW = 640, cv = document.getElementById('rulerCv'), ctx = cv.getContext('2d');
  var W = 640, H = 340, k = 1, lenCm = 20, t0 = performance.now();
  var plucking = false, curAmp = 0, playedSet = new Set(), unlocked = false;
  var actx = null, audioBuf = null, audioEl = null, audioStarted = false;

  function freqFromLen(L){ return Math.round(625 / L); }       /* 示意频率 */
  function visualFreq(L){ return 1.8 + 80 / L; }               /* 画面振动快慢 */
  function playbackRate(L){ return Math.sqrt(20 / L); }        /* 伸出越短音越高 */

  /* ---------- 音频：WebAudio 预解码，点击即播且变调真实生效 ---------- */
  function initAudio(){
    if(audioStarted) return; audioStarted = true;
    try{
      actx = new (window.AudioContext || window.webkitAudioContext)();
      fetch('assets/audio/ruler-fixed.wav')
        .then(function(r){ return r.arrayBuffer(); })
        .then(function(ab){ return actx.decodeAudioData(ab); })
        .then(function(buf){ audioBuf = buf; })
        .catch(function(){});
    }catch(e){}
  }
  function ensureAudio(){
    if(!audioEl){ audioEl = document.createElement('audio'); audioEl.src = 'assets/audio/ruler-fixed.wav'; audioEl.preload = 'auto'; }
    return audioEl;
  }
  function playPluck(L){
    var rate = playbackRate(L);
    if(actx && audioBuf){
      if(actx.state === 'suspended') actx.resume();
      var src = actx.createBufferSource(); src.buffer = audioBuf; src.playbackRate.value = rate;
      var g = actx.createGain(), t = actx.currentTime;
      g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
      src.connect(g); g.connect(actx.destination); src.start(0);
    }else{
      var a = ensureAudio();
      a.preservesPitch = false; a.webkitPreservesPitch = false;   /* 关键：否则变速不变调 */
      try{ a.pause(); a.currentTime = 0; }catch(e){}
      a.playbackRate = rate; a.play().catch(function(){});
    }
    if(window.console && console.log) console.log('[ruler] len=' + L + 'cm playbackRate=' + rate.toFixed(3));
  }

  /* ---------- 场景：左侧木桌 + 片状钢尺 ---------- */
  function geom(){
    var deskX0 = W * 0.05, deskX1 = W * 0.42, topY = H * 0.42;
    var th = 10 * k;                                  /* 钢尺厚度（恒定，片状） */
    var rulerW = lenCm * 9 * k;                       /* 伸出长度 */
    return { x0: deskX0, x1: deskX1, topY: topY, depth: 16 * k, thick: 14 * k,
             th: th, clampX: deskX1 - 44 * k, edgeX: deskX1, tipX: deskX1 + rulerW,
             rulerW: rulerW, rulerY: topY - th };
  }
  function drawDesk(g){
    var wall = ctx.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#f2ede3'); wall.addColorStop(1, '#e3dac8');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#d6cdb8'; ctx.fillRect(0, H * 0.88, W, H * 0.12);      /* 地面 */
    var wood = ctx.createLinearGradient(0, g.topY - g.depth, 0, g.topY + g.thick);
    wood.addColorStop(0, '#dbb182'); wood.addColorStop(0.55, '#c19068'); wood.addColorStop(1, '#8d6a48');
    ctx.fillStyle = wood;                                                    /* 桌面（梯形透视） */
    ctx.beginPath();
    ctx.moveTo(g.x0 + 9 * k, g.topY - g.depth); ctx.lineTo(g.x1, g.topY - g.depth);
    ctx.lineTo(g.x1, g.topY); ctx.lineTo(g.x0, g.topY); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(101,72,45,.35)'; ctx.lineWidth = 1 * k;          /* 木纹 */
    for(var i = 0; i < 4; i++){
      var gy = g.topY - g.depth + (i + 1) * g.depth / 5;
      ctx.beginPath(); ctx.moveTo(g.x0 + (9 - i * 2) * k, gy); ctx.lineTo(g.x1 - 3 * k, gy + 2 * k); ctx.stroke();
    }
    ctx.fillStyle = '#9a7350'; ctx.fillRect(g.x0, g.topY, g.x1 - g.x0, g.thick);   /* 桌面前挡板 */
    ctx.fillStyle = '#7c5a3c';                                                 /* 两条桌腿 */
    ctx.fillRect(g.x0 + 8 * k, g.topY + g.thick, 15 * k, H * 0.88 - g.topY - g.thick);
    ctx.fillRect(g.x1 - 24 * k, g.topY + g.thick, 15 * k, H * 0.88 - g.topY - g.thick);
    ctx.fillStyle = '#f5ead8'; ctx.font = 'bold ' + (13 * k) + 'px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('木质课桌', (g.x0 + g.x1) / 2, g.topY + g.thick / 2);
  }
  function bend(g, x){                                   /* 悬臂弯曲：固定端 0，自由端最大 */
    if(x <= g.edgeX || !plucking) return 0;
    var u = (x - g.edgeX) / g.rulerW;
    return curAmp * k * u * u * Math.sin((performance.now() - t0) / 1000 * visualFreq(lenCm) * Math.PI * 2);
  }
  function drawRuler(g){
    var N = 26, i, x, y;
    ctx.beginPath();                                     /* 等厚薄片：上沿采样 → 下沿回描 */
    for(i = 0; i <= N; i++){ x = g.clampX + (g.tipX - g.clampX) * i / N; y = g.rulerY + bend(g, x); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    for(i = N; i >= 0; i--){ x = g.clampX + (g.tipX - g.clampX) * i / N; ctx.lineTo(x, g.rulerY + g.th + bend(g, x)); }
    ctx.closePath();
    var metal = ctx.createLinearGradient(0, g.rulerY - 20 * k, 0, g.rulerY + g.th + 20 * k);
    metal.addColorStop(0, '#e8e8e8'); metal.addColorStop(0.5, '#fafafa'); metal.addColorStop(1, '#a8a8a8');
    ctx.fillStyle = metal; ctx.fill(); ctx.strokeStyle = '#777'; ctx.lineWidth = 1.2 * k; ctx.stroke();
    ctx.strokeStyle = '#666'; ctx.lineWidth = 1 * k;                         /* 刻度线跟随弯曲 */
    for(i = 0; i <= lenCm; i++){
      x = g.edgeX + i * 9 * k; if(x > g.tipX + 1 * k) continue;
      var dy = bend(g, x), tl = (i % 5 === 0 ? 6 : 3.5) * k;
      ctx.beginPath(); ctx.moveTo(x, g.rulerY + dy + 1 * k); ctx.lineTo(x, g.rulerY + dy + 1 * k + tl); ctx.stroke();
    }
    ctx.fillStyle = '#c9a227'; ctx.strokeStyle = '#a5841c'; ctx.lineWidth = 1.2 * k;   /* 压块 */
    roundRectPath(ctx, g.clampX - 2 * k, g.rulerY - 15 * k, 40 * k, 15 * k, 3 * k); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#6b5420'; ctx.font = 'bold ' + (10 * k) + 'px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('按住', g.clampX + 18 * k, g.rulerY - 7.5 * k);
    var dimY = g.rulerY - 30 * k;                                            /* 伸出长度标注 */
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 1.5 * k;
    ctx.beginPath(); ctx.moveTo(g.edgeX, dimY); ctx.lineTo(g.tipX, dimY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(g.edgeX, dimY - 4 * k); ctx.lineTo(g.edgeX, dimY + 4 * k); ctx.moveTo(g.tipX, dimY - 4 * k); ctx.lineTo(g.tipX, dimY + 4 * k); ctx.stroke();
    ctx.fillStyle = '#c0392b'; ctx.font = 'bold ' + (13 * k) + 'px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('伸出桌面：' + lenCm + ' cm', (g.edgeX + g.tipX) / 2, dimY - 9 * k);
    ctx.fillStyle = '#555'; ctx.font = 'bold ' + (12 * k) + 'px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('钢尺（片状）', g.edgeX + 4 * k, g.rulerY + g.th + 18 * k);
    if(plucking && curAmp > 0.5){ ctx.fillStyle = '#c0392b'; ctx.fillText('〰 振动中  ' + freqFromLen(lenCm) + ' Hz', g.edgeX + 4 * k, g.rulerY + g.th + 38 * k); }
  }
  function draw(){
    if(plucking && curAmp > 0){ curAmp *= 0.965; if(curAmp < 0.3){ curAmp = 0; plucking = false; } }
    var g = geom(); drawDesk(g); drawRuler(g);
  }
  function resize(){ var f = fitCanvas(cv, getCssH(cv)); ctx = f.ctx; W = f.w; H = parseFloat(cv.style.height) || f.h; k = W / DW; draw(); }

  /* ---------- 交互（保持原逻辑） ---------- */
  var lenSlider = document.getElementById('lenSlider'), lenVal = document.getElementById('lenVal');
  var freqVal = document.getElementById('freqVal'), tryVal = document.getElementById('tryVal');
  var pluckBtn = document.getElementById('pluckBtn'), resetBtn = document.getElementById('resetBtn');
  var findCard = document.getElementById('findCard'), findFb = document.getElementById('findFb');
  var answerBox = document.getElementById('answerBox'), checkBtn = document.getElementById('checkBtn');
  function updateReadout(){
    lenCm = +lenSlider.value; lenVal.textContent = lenCm + ' cm';
    freqVal.textContent = freqFromLen(lenCm) + ' Hz'; tryVal.textContent = playedSet.size + '/3';
    if(playedSet.size >= 3 && !unlocked){ unlocked = true; findCard.style.display = 'block'; }
  }
  lenSlider.addEventListener('input', function(){ updateReadout(); draw(); });
  pluckBtn.addEventListener('click', function(){ initAudio(); playPluck(lenCm); t0 = performance.now(); plucking = true; curAmp = 16; playedSet.add(lenCm); updateReadout(); });
  resetBtn.addEventListener('click', function(){ playedSet.clear(); unlocked = false; curAmp = 0; plucking = false; findCard.style.display = 'none'; answerBox.style.display = 'none'; findFb.className = 'feedback'; findFb.style.display = 'none'; lenSlider.value = 20; updateReadout(); });
  checkBtn.addEventListener('click', function(){
    var w1 = document.getElementById('w1').value, w2 = document.getElementById('w2').value, w3 = document.getElementById('w3').value;
    if(w1 === '短' && w2 === '快' && w3 === '高'){ findFb.className = 'feedback ok show'; findFb.textContent = '✅ 回答正确！'; answerBox.style.display = 'block'; }
    else { findFb.className = 'feedback err show'; findFb.textContent = '❌ 再想想：伸出长度、振动快慢、音调高低三者是怎么变化的？'; }
  });
  function loop(){ draw(); requestAnimationFrame(loop); }
  FullscreenHelper.bind(document.getElementById('fsRulerWrap'), document.getElementById('fsRulerBtn'), resize);
  window.addEventListener('resize', resize);
  initAudio(); updateReadout(); resize(); requestAnimationFrame(loop);
})();

/* ============================================================
   长度和时间的测量 · 可交互教材原型 v1
   模块：悬念动画 / 刻度尺与停表 / 小练习
   ============================================================ */

/* ---------- 通用：高清屏适配 ---------- */
function fitCanvas(cv, cssH){
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const w = cv.clientWidth || cv.parentElement.clientWidth;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(cssH * dpr);
  cv.style.height = cssH + 'px';
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h: cssH };
}

function roundRectPath(ctx, x, y, w, h, r){
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/* ============================================================
   模块一：悬念小剧场 —— “差不多”惹的祸
   ============================================================ */
(function(){
  const cv = document.getElementById('animCv');
  const cap = document.getElementById('cap');
  const bar = document.getElementById('animBar');
  let g = fitCanvas(cv, 300);
  let t0 = null, raf = null, elapsed = 0, lastNow = 0, paused = false;
  const DUR = 36000;

  const scenes = [
    [0,     7000,  '周末，小明要给新买的书架量尺寸。<br>他摆摆手说：“不用尺子，我目测一下就行。”', 'shop'],
    [7000,  16000, '小明“估摸”着锯好了木板，结果——<br><span class="reveal">书架板子短了一截，根本装不上。</span>', 'fail'],
    [16000, 24000, '妈妈笑着说：“测量可不能靠感觉！<br>工具、分度值、估读，一个都不能少。”', 'teach'],
    [24000, 30000, '长度要测量，时间同样也要测量。<br>比赛里差 0.01 秒，名次就完全不一样。', 'time'],
    [30000, 36000, '这节课，我们就来学习<br><span class="reveal">长度和时间的测量</span>。', 'reveal'],
  ];

  function person(ctx, x, y, s, dir, phase, emotion = 'normal'){
    ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
    const skin = '#fce0cd', hair = '#3e3025', blush = '#ffb3b3', jacket = '#ff9a5e', shorts = '#4a7cc7';
    const sw = Math.sin(phase), sw2 = Math.sin(phase + 0.6);
    const legSwingR = sw * 10, legSwingL = -sw * 10, armSwingR = sw2 * 8, armSwingL = -sw2 * 8;

    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 5, 0, 0, 7); ctx.fill();

    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = shorts; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(-5, -22); ctx.lineTo(-8 + legSwingR, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, -22); ctx.lineTo(8 + legSwingL, 0); ctx.stroke();

    ctx.fillStyle = '#3a2e2a'; ctx.beginPath(); ctx.ellipse(-8 + legSwingR, 2, 7, 4, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8 + legSwingL, 2, 7, 4, 0, 0, 7); ctx.fill();

    ctx.fillStyle = jacket; ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 1;
    roundRectPath(ctx, -13, -48, 26, 28, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff'; roundRectPath(ctx, -3, -45, 6, 14, 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(0, -31); ctx.stroke();

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

    const blink = Math.sin(phase * 0.5) > 0.92;
    ctx.fillStyle = '#2a2a2a';
    if(blink){ ctx.lineWidth = 2; ctx.strokeStyle = '#2a2a2a'; ctx.beginPath(); ctx.moveTo(-6, -54); ctx.lineTo(-2, -54); ctx.stroke(); ctx.beginPath(); ctx.moveTo(2, -54); ctx.lineTo(6, -54); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(-4, -54, 2.2, 0, 7); ctx.arc(4, -54, 2.2, 0, 7); ctx.fill(); }

    ctx.fillStyle = blush; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(-7, -49, 2.8, 0, 7); ctx.arc(7, -49, 2.8, 0, 7); ctx.fill(); ctx.globalAlpha = 1;

    ctx.strokeStyle = '#d47c6e'; ctx.lineWidth = 1.5;
    if(emotion === 'sad'){ ctx.beginPath(); ctx.arc(0, -49, 2.5, Math.PI - 0.3, 0.3); ctx.stroke(); }
    else if(emotion === 'surprise'){ ctx.beginPath(); ctx.arc(0, -50, 2.5, 0, 7); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(0, -52, 2.5, 0.2, Math.PI - 0.2); ctx.stroke(); }

    ctx.fillStyle = '#d94e4e'; roundRectPath(ctx, -17, -45, 7, 18, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-17, -43); ctx.quadraticCurveTo(-22, -35, -17, -28); ctx.stroke();

    ctx.restore();
  }

  function drawBg(ctx, w, h, now, glints = 0){
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a1022'); grad.addColorStop(1, '#111a35');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#1a2545'; ctx.beginPath(); ctx.moveTo(0, h * 0.65); ctx.lineTo(w, h * 0.65); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
    for(let i = 0; i < 12; i++){
      const x = (i * 47) % w;
      ctx.beginPath(); ctx.moveTo(x, h * 0.65); ctx.lineTo(x + 20, h); ctx.stroke();
    }

    if(glints > 0){
      ctx.save();
      for(let i = 0; i < 6; i++){
        const x = (i * 83 + now * 0.02) % w, y = h * 0.72 + (i % 3) * 25;
        ctx.fillStyle = `rgba(255,209,102,${0.15 + 0.1 * Math.sin(now * 0.003 + i)})`;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawShelf(ctx, x, y, scale, broken = false){
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.strokeStyle = '#8a6a4b'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-50, -60); ctx.lineTo(-50, 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(50, -60); ctx.lineTo(50, 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-55, -55); ctx.lineTo(55, -55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-55, 0); ctx.lineTo(55, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-55, 55); ctx.lineTo(55, 55); ctx.stroke();
    if(broken){
      ctx.strokeStyle = '#ff7d7d'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-45, 60); ctx.lineTo(45, 60); ctx.stroke();
      ctx.fillStyle = '#ff7d7d'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('短了！', 0, 85);
    }
    ctx.restore();
  }

  function drawRulerHint(ctx, w, h, now){
    const x = w * 0.5, y = h * 0.78;
    ctx.save();
    ctx.fillStyle = '#dfe9ff'; roundRectPath(ctx, x - 90, y - 8, 180, 16, 4); ctx.fill();
    ctx.fillStyle = '#0e1526'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('测量需要工具 + 准确读数', x, y);
    ctx.restore();
  }

  function drawFrame(now){
    if(t0 === null) t0 = now;
    if(paused){ raf = requestAnimationFrame(drawFrame); lastNow = now; return; }
    const dt = lastNow ? now - lastNow : 0; lastNow = now;
    elapsed = (elapsed + dt) % DUR;
    const el = elapsed;
    bar.style.width = (el / DUR * 100) + '%';
    const sc = scenes.find(s => el >= s[0] && el < s[1]) || scenes[scenes.length - 1];
    if(cap.dataset.t !== String(sc[0])){ cap.dataset.t = String(sc[0]); cap.innerHTML = sc[2]; }
    const { ctx, w, h } = g;
    const wp = now * 0.012;
    ctx.clearRect(0, 0, w, h);

    if(sc[3] === 'shop'){
      drawBg(ctx, w, h, now, 1);
      drawShelf(ctx, w * 0.55, h * 0.55, 1.1, false);
      person(ctx, w * 0.24 + (el / 7000) * w * 0.12, h * 0.72, 1.4, 1, wp, 'normal');
      ctx.save(); ctx.fillStyle = '#ffd166'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('“差不多就行！”', w * 0.32, h * 0.38); ctx.restore();
    } else if(sc[3] === 'fail'){
      drawBg(ctx, w, h, now, 1);
      drawShelf(ctx, w * 0.55, h * 0.55, 1.1, true);
      person(ctx, w * 0.32, h * 0.72, 1.4, 1, 0, 'sad');
    } else if(sc[3] === 'teach'){
      drawBg(ctx, w, h, now, 1);
      person(ctx, w * 0.30, h * 0.72, 1.4, 1, 0, 'surprise');
      ctx.save(); ctx.fillStyle = '#5fe3a1'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('工具、分度值、估读，一个都不能少', w * 0.55, h * 0.42); ctx.restore();
      drawRulerHint(ctx, w, h, now);
    } else if(sc[3] === 'time'){
      drawBg(ctx, w, h, now, 1);
      person(ctx, w * 0.30, h * 0.72, 1.4, 1, wp, 'normal');
      ctx.save();
      ctx.fillStyle = '#5ad7ff'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('0.01 s', w * 0.62, h * 0.40);
      ctx.fillStyle = '#aeb9d4'; ctx.font = '13px sans-serif';
      ctx.fillText('差之毫厘，名次完全不同', w * 0.62, h * 0.48);
      ctx.restore();
    } else {
      drawBg(ctx, w, h, now, 1);
      person(ctx, w * 0.30, h * 0.72, 1.4, 1, wp, 'normal');
      ctx.save(); ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd166'; ctx.shadowColor = 'rgba(255,209,102,.8)'; ctx.shadowBlur = 16;
      ctx.fillText('长度和时间的测量', w * 0.55, h * 0.40); ctx.restore();
    }
    raf = requestAnimationFrame(drawFrame);
  }

  const pauseBtn = document.getElementById('pauseBtn');
  function start(){ if(raf) cancelAnimationFrame(raf); t0 = null; elapsed = 0; lastNow = 0; paused = false; pauseBtn.textContent = '⏸ 暂停'; raf = requestAnimationFrame(drawFrame); }
  document.getElementById('replayBtn').addEventListener('click', start);
  pauseBtn.addEventListener('click', ()=>{ paused = !paused; pauseBtn.textContent = paused ? '▶ 继续' : '⏸ 暂停'; });
  document.getElementById('toLabBtn').addEventListener('click', ()=>{ document.querySelector('.labBox').scrollIntoView({behavior:'smooth', block:'start'}); });
  window.addEventListener('resize', ()=>{ g = fitCanvas(cv, 300); });
  start();
})();

/* ============================================================
   模块二：互动实验区
   ============================================================ */

/* ---------- 2.1 刻度尺读数 ---------- */
(function(){
  const cv = document.getElementById('rulerCv');
  let g = fitCanvas(cv, 360);
  let state = { startCm: 1.0, lengthCm: 2.35, unit: 'cm', feedback: '', correct: false };

  function generate(){
    state.startCm = Math.round((1.0 + Math.random() * 4.0) * 10) / 10;
    const maxLen = 8.0 - state.startCm;
    const lenBase = 1.50 + Math.random() * Math.min(2.80, maxLen - 1.50);
    const mm = Math.round(lenBase * 100) / 100;
    state.lengthCm = mm;
    state.feedback = ''; state.correct = false;
    draw(g, state);
    setFb('', 'info');
  }

  function draw(g2, st){
    const { ctx, w, h } = g2;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 0, w, h);

    const margin = 36;
    const rulerY = h * 0.55;
    const rulerW = w - margin * 2;
    const leftX = margin, rightX = w - margin;
    const pxPerCm = rulerW / 8.0;

    // 标尺
    ctx.save();
    ctx.fillStyle = '#dfe9ff'; roundRectPath(ctx, leftX, rulerY, rulerW, 36, 4); ctx.fill();
    ctx.strokeStyle = '#0e1526'; ctx.lineWidth = 1; ctx.strokeRect(leftX, rulerY, rulerW, 36);
    ctx.fillStyle = '#0e1526'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for(let cm = 0; cm <= 8; cm++){
      const x = leftX + cm * pxPerCm;
      ctx.beginPath(); ctx.moveTo(x, rulerY); ctx.lineTo(x, rulerY + 18); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillText(cm, x, rulerY + 27);
    }
    for(let cm = 0; cm < 8; cm++){
      for(let mm = 1; mm < 10; mm++){
        const x = leftX + (cm + mm / 10) * pxPerCm;
        const tickH = mm === 5 ? 12 : 7;
        ctx.beginPath(); ctx.moveTo(x, rulerY); ctx.lineTo(x, rulerY + tickH); ctx.lineWidth = 1; ctx.stroke();
      }
    }
    ctx.restore();

    // 被测物（铅笔）
    const startX = leftX + st.startCm * pxPerCm;
    const endX = startX + st.lengthCm * pxPerCm;
    const pencilY = rulerY - 24;
    ctx.save();
    ctx.fillStyle = '#ff7d7d'; roundRectPath(ctx, startX, pencilY, endX - startX, 18, 3); ctx.fill();
    ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(startX, pencilY + 9, 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#ff7d7d'; ctx.beginPath();
    ctx.moveTo(endX - 6, pencilY); ctx.lineTo(endX + 4, pencilY + 9); ctx.lineTo(endX - 6, pencilY + 18); ctx.closePath(); ctx.fill();
    ctx.restore();

    // 标注
    ctx.save();
    ctx.strokeStyle = '#5ad7ff'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(startX, rulerY + 42); ctx.lineTo(startX, rulerY + 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(endX, rulerY + 42); ctx.lineTo(endX, rulerY + 60); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#5ad7ff'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('物体左端对齐 ' + st.startCm.toFixed(1) + ' cm', (startX + endX) / 2, rulerY + 72);
    ctx.restore();

    // 文字说明
    ctx.save();
    ctx.fillStyle = '#f4f7ff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('量程：0 ~ 8 cm　　分度值：1 mm', margin, 28);
    ctx.fillStyle = '#aeb9d4'; ctx.font = '13px sans-serif';
    ctx.fillText('请读出物体的长度（注意估读到分度值下一位）', margin, 50);
    ctx.restore();
  }

  function setFb(html, type = 'info'){
    const el = document.getElementById('rulerFb');
    el.className = 'feedback show ' + type;
    el.innerHTML = html;
  }

  function check(){
    const raw = document.getElementById('rulerAns').value.trim().replace(/[，]/g, ',');
    if(!raw){ setFb('请先输入读数。', 'info'); return; }
    if(raw.includes('/')){ setFb('请输入小数，如 2.35。', 'err'); return; }
    const num = parseFloat(raw);
    if(Number.isNaN(num)){ setFb('请输入有效数字。', 'err'); return; }
    const unit = document.getElementById('rulerUnit').value;
    let inputCm = num;
    if(unit === 'mm') inputCm = num / 10;
    // 判断（允许 ±0.02 cm 的估读误差）
    const correctVal = state.lengthCm;
    const inRange = Math.abs(inputCm - correctVal) < 0.02;
    if(inRange){
      state.correct = true;
      setFb(`✅ 正确！物体长度约为 <b>${correctVal.toFixed(2)} cm</b>。<br>末端刻度 − 起始刻度 = ${(state.startCm + state.lengthCm).toFixed(2)} − ${state.startCm.toFixed(1)} = ${correctVal.toFixed(2)} cm，估读到 0.01 cm。`, 'ok');
    } else {
      setFb(`❌ 再想想。正确读数是 <b>${correctVal.toFixed(2)} cm</b>。<br>末端刻度 − 起始刻度 = ${(state.startCm + state.lengthCm).toFixed(2)} − ${state.startCm.toFixed(1)} = ${correctVal.toFixed(2)} cm，估读到 0.01 cm。`, 'err');
    }
  }

  document.getElementById('rulerCheck').addEventListener('click', check);
  document.getElementById('rulerNext').addEventListener('click', generate);
  document.getElementById('rulerAns').addEventListener('keydown', (e)=>{ if(e.key === 'Enter') check(); });
  window.addEventListener('resize', ()=>{ g = fitCanvas(cv, 360); draw(g, state); });
  generate();
})();

/* ---------- 2.2 停表读数 ---------- */
(function(){
  const cv = document.getElementById('stopwatchCv');
  let g = fitCanvas(cv, 360);
  let running = false, startTime = 0, elapsed = 0, frozen = 0;
  let targetMin = 0, targetSec = 0, passedHalf = false;
  let showResult = false;

  function resetTarget(){
    targetMin = Math.floor(1 + Math.random() * 2);
    const secBase = Math.random() * 59.9;
    targetSec = Math.round(secBase * 10) / 10;
    passedHalf = targetSec >= 30;
    elapsed = 0; frozen = 0; running = false; showResult = false;
    document.getElementById('swMin').value = '';
    document.getElementById('swSec').value = '';
    const fb = document.getElementById('swFb');
    fb.className = 'feedback'; fb.innerHTML = '';
  }

  function totalSeconds(){ return running ? frozen + (performance.now() - startTime) / 1000 : frozen; }

  function drawStopwatch(ctx, w, h, now){
    const cx = w * 0.5, cy = h * 0.52, r = Math.min(w, h) * 0.34;
    const sec = totalSeconds();
    const min = Math.floor(sec / 60);
    const s = sec % 60;

    // 背景
    ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 0, w, h);

    // 外框
    ctx.save();
    ctx.strokeStyle = '#dfe9ff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    ctx.fillStyle = '#16213a'; ctx.beginPath(); ctx.arc(cx, cy, r - 4, 0, 7); ctx.fill();
    ctx.restore();

    // 大表盘刻度 0-60 s
    ctx.save();
    ctx.fillStyle = '#f4f7ff'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for(let i = 0; i <= 60; i += 5){
      const ang = (i / 60) * 2 * Math.PI - Math.PI / 2;
      const len = i % 10 === 0 ? 10 : 5;
      const x1 = cx + Math.cos(ang) * (r - 10), y1 = cy + Math.sin(ang) * (r - 10);
      const x2 = cx + Math.cos(ang) * (r - 10 - len), y2 = cy + Math.sin(ang) * (r - 10 - len);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = '#dfe9ff'; ctx.lineWidth = 1.5; ctx.stroke();
      if(i % 10 === 0){
        ctx.fillText(String(i), cx + Math.cos(ang) * (r - 28), cy + Math.sin(ang) * (r - 28));
      }
    }
    ctx.restore();

    // 小表盘（分钟盘）
    const scx = cx, scy = cy - r * 0.42, sr = r * 0.28;
    ctx.save();
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(scx, scy, sr, 0, 7); ctx.stroke();
    ctx.fillStyle = '#16213a'; ctx.beginPath(); ctx.arc(scx, scy, sr - 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffd166'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for(let i = 0; i <= 3; i++){
      const ang = (i / 3) * Math.PI - Math.PI / 2;
      const x = scx + Math.cos(ang) * (sr - 8), y = scy + Math.sin(ang) * (sr - 8);
      ctx.fillText(String(i), x, y);
    }
    // 小表盘中线
    ctx.strokeStyle = 'rgba(255,125,125,.6)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(scx, scy); ctx.lineTo(scx + sr - 4, scy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 指针
    const secAng = (s / 60) * 2 * Math.PI - Math.PI / 2;
    const minAng = (min / 3) * Math.PI - Math.PI / 2 + (s / 60) * (Math.PI / 3);
    ctx.save();
    ctx.strokeStyle = '#ff7d7d'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(secAng) * (r - 22), cy + Math.sin(secAng) * (r - 22)); ctx.stroke();
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(scx, scy); ctx.lineTo(scx + Math.cos(minAng) * (sr - 8), scy + Math.sin(minAng) * (sr - 8)); ctx.stroke();
    ctx.restore();

    // 当前读数显示
    ctx.save();
    ctx.fillStyle = '#f4f7ff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`当前：${min} 分 ${s.toFixed(1)} 秒`, cx, h - 30);
    ctx.restore();

    // 按钮
    drawBtn(ctx, w * 0.22, h - 75, 80, 32, '#5fe3a1', running ? '停止' : '开始');
    drawBtn(ctx, w * 0.50, h - 75, 80, 32, '#ffd166', '归零');
    drawBtn(ctx, w * 0.78, h - 75, 80, 32, '#5ad7ff', '出题');
  }

  function drawBtn(ctx, x, y, w2, h2, color, text){
    ctx.save();
    ctx.fillStyle = color; roundRectPath(ctx, x - w2 / 2, y - h2 / 2, w2, h2, 8); ctx.fill();
    ctx.fillStyle = '#0e1526'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function insideBtn(px, py, x, y, w2, h2){ return px >= x - w2 / 2 && px <= x + w2 / 2 && py >= y - h2 / 2 && py <= y + h2 / 2; }

  function loop(now){
    const { ctx, w, h } = g;
    drawStopwatch(ctx, w, h, now);
    requestAnimationFrame(loop);
  }

  function handleClick(e){
    const rect = cv.getBoundingClientRect();
    let px, py;
    if(e.changedTouches && e.changedTouches.length){ px = e.changedTouches[0].clientX - rect.left; py = e.changedTouches[0].clientY - rect.top; }
    else { px = e.offsetX; py = e.offsetY; }
    const h = cv.clientHeight;
    if(insideBtn(px, py, cv.clientWidth * 0.22, h - 75, 80, 32)){
      if(!running){ running = true; startTime = performance.now(); }
      else { running = false; frozen += (performance.now() - startTime) / 1000; }
    } else if(insideBtn(px, py, cv.clientWidth * 0.50, h - 75, 80, 32)){
      running = false; frozen = 0;
    } else if(insideBtn(px, py, cv.clientWidth * 0.78, h - 75, 80, 32)){
      resetTarget();
    }
  }

  cv.addEventListener('mousedown', handleClick);
  cv.addEventListener('touchstart', handleClick, {passive: false});
  window.addEventListener('resize', ()=>{ g = fitCanvas(cv, 360); });

  document.getElementById('swCheck').addEventListener('click', ()=>{
    const m = parseInt(document.getElementById('swMin').value, 10);
    const s = parseFloat(document.getElementById('swSec').value);
    const fb = document.getElementById('swFb');
    if(Number.isNaN(m) || Number.isNaN(s)){ fb.className = 'feedback show info'; fb.innerHTML = '请先填写分和秒。'; return; }
    const cur = totalSeconds();
    const curMin = Math.floor(cur / 60);
    const curSec = cur % 60;
    const ok = Math.abs(m - targetMin) < 0.5 && Math.abs(s - targetSec) < 0.15;
    if(ok){ fb.className = 'feedback show ok'; fb.innerHTML = `✅ 正确！停表读数为 <b>${targetMin} 分 ${targetSec.toFixed(1)} 秒</b>。`; }
    else { fb.className = 'feedback show err'; fb.innerHTML = `❌ 正确读数是 <b>${targetMin} 分 ${targetSec.toFixed(1)} 秒</b>。小表盘指针${passedHalf ? '已过中线' : '未过中线'}，所以大表盘读 ${passedHalf ? '30~60 s' : '0~30 s'}。`; }
  });

  resetTarget();
  requestAnimationFrame(loop);
})();

/* ============================================================
   模块三：趁热打铁 —— 小练习
   ============================================================ */
(function(){
  const quizEl = document.getElementById('quiz');
  const fbEl = document.getElementById('fb');
  const qidxEl = document.getElementById('qidx');
  const nextBtn = document.getElementById('nextQ');

  const questions = [
    {
      stem: '一把刻度尺的分度值是 1 mm，用它测量物体长度时，下列读数正确的是（　　）',
      opts: ['2.3 cm', '2.35 cm', '2.350 cm', '2 cm'],
      ans: 1,
      fb: '分度值是 1 mm，读数时要估读到分度值的下一位，即 0.1 mm = 0.01 cm。所以应读到小数点后两位，<b>2.35 cm</b> 正确。'
    },
    {
      stem: '关于刻度尺的使用，下列说法正确的是（　　）',
      opts: ['读数时视线应斜着看刻度', '物体的一端必须对齐 0 刻度', '读数时要估读到分度值的下一位', '选择刻度尺时只看量程就行'],
      ans: 2,
      fb: '读数时视线要与刻度尺垂直；物体左端可以不对齐 0 刻度，用末端刻度减去起始刻度即可；选择刻度尺时要同时考虑量程和分度值。<b>读数时要估读到分度值的下一位</b>是正确的。'
    },
    {
      stem: '机械停表小表盘指针在“1”和“2”之间，且过了 1 和 2 的中线；大表盘指针指在 37.5 s 处，则读数为（　　）',
      opts: ['1 min 7.5 s', '1 min 37.5 s', '2 min 37.5 s', '0 min 37.5 s'],
      ans: 1,
      fb: '小表盘读分钟：指针在 1 和 2 之间，取 1 min。因为指针过了中线，所以大表盘读 30~60 s 的范围，即 37.5 s。最终读数为 <b>1 min 37.5 s</b>。'
    }
  ];

  let qi = 0, answered = false;

  function render(){
    answered = false;
    const q = questions[qi];
    quizEl.innerHTML = '<div class="stem">' + q.stem + '</div>' +
      q.opts.map((o, i) => '<button class="opt" data-i="' + i + '">' + String.fromCharCode(65 + i) + '．' + o + '</button>').join('');
    fbEl.classList.remove('show'); fbEl.innerHTML = '';
    qidxEl.textContent = '第 ' + (qi + 1) + ' / ' + questions.length + ' 题';
    nextBtn.style.visibility = 'hidden';
    quizEl.querySelectorAll('.opt').forEach(btn => { btn.addEventListener('click', () => onPick(btn)); });
  }

  function onPick(btn){
    if(answered) return;
    answered = true;
    const i = +btn.dataset.i;
    const q = questions[qi];
    const opts = quizEl.querySelectorAll('.opt');
    opts.forEach(o => o.classList.add('dim'));
    if(i === q.ans){ btn.classList.add('right'); fbEl.innerHTML = '✅ 答对了！<br>' + q.fb; }
    else { btn.classList.add('wrong'); opts[q.ans].classList.remove('dim'); opts[q.ans].classList.add('right'); fbEl.innerHTML = '❌ 再想想——正确答案是 ' + String.fromCharCode(65 + q.ans) + '。<br>' + q.fb; }
    fbEl.classList.add('show');
    nextBtn.style.visibility = 'visible';
    nextBtn.textContent = qi < questions.length - 1 ? '下一题' : '再练一遍';
  }

  nextBtn.addEventListener('click', ()=>{ qi = (qi + 1) % questions.length; render(); });
  render();
})();

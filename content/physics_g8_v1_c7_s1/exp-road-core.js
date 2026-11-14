/* ============================================================
 * exp-road-core.js — 场景A（7.1 力）侧视马路  C7V5-R5
 * R5 修订：天空/草地/黄虚线；右尽头=泥土护坡(坑洼)滑入池塘；PhET写实轿车+小人(放大≥30%H)；
 * 只推不拉·人与车解耦(鼠标拖人，人停车惯性续滑，人不下水)；F/v 大仪表条(≥2.5倍高,18px,满量程刻度)；
 * 刹车=右侧踏板图形；方向盘=居中modal·按住拖动转动·示意图实时@拨点·力臂≈0不转；
 * 滑冰鞋=踏板虚化锁定最大·人向后滑离手脱开(相互作用+惯性)。
 * 力的示意图经 force-overlay.js 门控（开=仅活跃交互画矢量；关=全场景无）。
 * ============================================================ */
(function () {
  'use strict';

  /* ===== 调色板 ===== */
  var PAL = {
    grass1: '#8bc34a', grass2: '#558b2f', asphalt: '#42474e', asphaltTop: '#5b616b', lane: '#e8b62c',
    dirt: '#9c7a50', dirtDark: '#7d6040', water1: '#5aa7e0', water2: '#2b6fae', foam: 'rgba(255,255,255,.55)',
    car: '#d64545', carTop: '#e05555', carBot: '#b03030', carGlass: '#bfe3f2', wheel: '#2b2f36', rim: '#c7ced6',
    skin: '#f0c08a', hair: '#6b4a2f', cloth: '#3f6fb5', pants: '#37474f', shoe: '#5b4636', ice: '#bfe6f5',
    sponge: '#f0913e', spongeDark: '#cf7526',
    text: '#28323d', sub: '#6b7885', bar: '#e2e8f0', thrust: '#dc2626', speed: '#2563eb'
  };

  /* ===== 物理常量（力→加速度，非速度） ===== */
  var M = 1.2, A_SCALE = 55, F_MAX = 10, FRIC = 130, BRAKE_SCALE = 55, BRAKE_MAX = 10;
  var V_MAX = 500, G_SLOPE = 620, ICE_K = 34, ICE_FRIC = 90, DIAL_FMAX = 6, WEIGHT_N = M * 9.8;

  /* ===== 画布脚手架 ===== */
  var cv = document.getElementById('scene');
  var ctx = cv.getContext('2d');
  var W = 960, H = 540, DPR = 1, dirty = true, lastNow = 0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function setText(id, t) { var el = document.getElementById(id); if (el && el.textContent !== t) el.textContent = t; }
  function sfx(name) { if (!S.muted && window['play' + name]) { try { window['play' + name](); } catch (e) {} } }

  /* ===== 布局 L（resize 全量重算） ===== */
  var L = {};
  function layout() {
    L.roadTop = Math.round(H * 0.58);
    L.roadH = Math.max(26, Math.round(H * 0.06));
    L.roadBot = L.roadTop + L.roadH;
    L.roadLeft = 30;
    L.slopeX = Math.round(W - Math.max(200, W * 0.26));
    L.pondX = Math.round(L.slopeX + (W - 16 - L.slopeX) * 0.52);
    L.pondY = Math.round(H * 0.80);
    L.pondBottom = H - 12;
    L.bumpA = Math.max(4, Math.round(H * 0.012));
    L.personH = Math.max(96, Math.round(H * 0.30));
    L.armLen = Math.round(L.personH * 0.36);
    L.pushK = F_MAX / Math.max(10, L.personH * 0.30);
    L.carW = clamp(Math.round(W * 0.30), 138, Math.round(H * 0.52));
    L.carH = Math.round(L.carW * 0.42);
    L.wheelR = Math.round(L.carH * 0.30);
    L.homeX = L.roadLeft + L.carW * 0.5 + Math.round((L.slopeX - L.roadLeft - L.carW) * 0.32);
    L.shoreX = L.slopeX - Math.round(L.personH * 0.16);
    L.gh = 38;
    if (W >= 660) { L.gw = clamp(Math.round((W - 48) / 2), 220, 430); L.g1 = { x: 16, y: 44 }; L.g2 = { x: 32 + L.gw, y: 44 }; }
    else { L.gw = W - 32; L.g1 = { x: 16, y: 42 }; L.g2 = { x: 16, y: 42 + L.gh + 32 }; }
    L.pedalW = W < 430 ? 70 : 84;
    L.pedal = { x: W - L.pedalW - 22, y: Math.round(H * 0.34), w: L.pedalW, h: Math.max(84, Math.round(H * 0.20)) };
    var mw = clamp(Math.round(Math.min(W, H) * 0.66), 230, 420);
    L.modal = { w: mw, h: mw, x: Math.round((W - mw) / 2), y: Math.round((H - mw) / 2) };
    L.dialR = Math.round(mw * 0.30);
  }

  /* ===== 状态 ===== */
  var S = {
    car: { x: 0, vx: 0, y: 0, angle: 0, mode: 'road', settled: false, splashT: 0 },
    person: { x: 0, vx: 0, sliding: false, off: 0, baseX: 0 },
    sponge: { def: 0 },
    push: { active: false, F: 0 },
    shoe: 'normal', brake: 0, brakeSaved: 0, wheelZoom: false,
    dial: { angle: 0, drag: null, F: 0, pt: null, dirv: null, msg: '' },
    diagram: false, muted: false,
    sw: null,
    ps: { mode: 'idle', x: 0, y: 0, downX: 0, downY: 0, moved: 0 }
  };
  window.C7V5_ROAD = S;

  /* ===== 地形（护坡坑洼起伏）+ 几何访问器 ===== */
  function groundY(x) {
    if (x <= L.slopeX) return L.roadTop;
    if (x >= L.pondX) return L.pondBottom;
    var t = (x - L.slopeX) / Math.max(1, L.pondX - L.slopeX);
    var y = L.roadTop + (L.pondY - L.roadTop) * (t * 0.62 + t * t * 0.38);
    y += Math.sin(t * Math.PI * 3.5) * L.bumpA * (1 - t * 0.6) + Math.sin(t * Math.PI * 8 + 1.3) * L.bumpA * 0.45 * (1 - t);
    return y;
  }
  function comPoint() { return { x: S.car.x, y: L.roadTop + S.car.y - L.carH * 0.72 }; }
  function contactPoint() { return { x: S.car.x - L.carW * 0.5, y: L.roadTop + S.car.y - L.carH * 0.52 }; }
  function clampPersonX(x) {
    var max = S.car.mode === 'road' ? Math.min(L.shoreX, S.car.x - L.carW * 0.5 - L.personH * 0.05) : L.shoreX;
    return clamp(x, L.roadLeft + 12, max);
  }
  function modalCenter() { return { x: L.modal.x + L.modal.w / 2, y: L.modal.y + L.modal.h / 2 }; }

  /* ===== resize ===== */
  function resize() {
    DPR = window.devicePixelRatio || 1;
    var r = cv.getBoundingClientRect();
    W = Math.max(360, Math.round(r.width)); H = Math.max(320, Math.round(r.height));
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layout();
    if (window.ForceOverlay) ForceOverlay.setScale(clamp(Math.round(W * 0.028), 18, 30));
    resetCar();
    dirty = true;
  }
  function resetCar() {
    var car = S.car;
    car.x = L.homeX; car.vx = 0; car.y = 0; car.angle = 0; car.mode = 'road'; car.settled = false;
    S.person.x = clampPersonX(L.homeX - L.carW * 0.5 - L.armLen - L.personH * 0.12);
    S.person.vx = 0; S.person.sliding = false; S.person.off = 0; S.person.baseX = S.person.x;
    S.push.active = false; S.push.F = 0; S.sponge.def = 0;
    S.brake = S.shoe === 'ice' ? BRAKE_MAX : 0; S.brakeSaved = 0;
    S.dial.drag = null; S.dial.angle = 0; S.dial.msg = ''; S.dial.F = 0;
    if (window.ForceOverlay) ForceOverlay.clear();
    dirty = true;
  }
  function canvasXY(ev) { var r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }

  /* ===== rAF 单循环 ===== */
  function tick(now) {
    var dt = lastNow ? Math.min(48, now - lastNow) : 16; lastNow = now;
    if (step(dt / 1000, now)) dirty = true;
    if (dirty) { dirty = false; draw(); }
    requestAnimationFrame(tick);
  }

  /* ===== 绘制基础 ===== */
  function rr(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function circ(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }

  /* ===== 场景：天空/云/草地/池塘/护坡/沥青路+黄虚线（修订点2） ===== */
  function cloud(x, y, s) {
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    circ(x, y, s * 15); ctx.fill(); circ(x + s * 17, y - s * 9, s * 12); ctx.fill();
    circ(x + s * 34, y, s * 14); ctx.fill(); rr(x - s * 3, y - s * 2, s * 52, s * 14, s * 7); ctx.fill();
  }
  function drawScene(now) {
    var sg = ctx.createLinearGradient(0, 0, 0, L.roadTop);
    sg.addColorStop(0, '#6fb1e4'); sg.addColorStop(1, '#d9edfa');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, L.roadTop + 2);
    ctx.fillStyle = 'rgba(255,214,90,.35)'; circ(W * 0.84, L.roadTop * 0.24, 40); ctx.fill();
    ctx.fillStyle = '#ffd85e'; circ(W * 0.84, L.roadTop * 0.24, 26); ctx.fill();
    cloud(W * 0.12, L.roadTop * 0.30, Math.max(0.6, H / 700)); cloud(W * 0.48, L.roadTop * 0.18, Math.max(0.5, H / 850));
    var gg = ctx.createLinearGradient(0, L.roadTop, 0, H);
    gg.addColorStop(0, PAL.grass1); gg.addColorStop(1, PAL.grass2);
    ctx.fillStyle = gg; ctx.fillRect(0, L.roadTop, W, H - L.roadTop);
    // 池塘（右端坡底）
    var wg = ctx.createLinearGradient(0, L.pondY, 0, H);
    wg.addColorStop(0, PAL.water1); wg.addColorStop(1, PAL.water2);
    ctx.fillStyle = wg; ctx.fillRect(L.pondX - 8, L.pondY, W - L.pondX + 8, H - L.pondY);
    ctx.strokeStyle = PAL.foam; ctx.lineWidth = 2;
    for (var i = 0; i < 3; i++) {
      var wy = L.pondY + 10 + i * 15, wx = L.pondX + 6 + i * 26;
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.quadraticCurveTo(wx + 12, wy - 4, wx + 24, wy); ctx.stroke();
    }
    // 泥土护坡：坑坑洼洼的斜坡面（起伏碰撞源）
    ctx.beginPath(); ctx.moveTo(L.slopeX, L.roadTop);
    for (var x = L.slopeX; x <= L.pondX; x += 7) ctx.lineTo(x, groundY(x));
    ctx.lineTo(L.pondX, H); ctx.lineTo(L.slopeX, H); ctx.closePath();
    ctx.fillStyle = PAL.dirt; ctx.fill();
    ctx.strokeStyle = PAL.dirtDark; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(L.slopeX, L.roadTop);
    for (var x2 = L.slopeX; x2 <= L.pondX; x2 += 7) ctx.lineTo(x2, groundY(x2));
    ctx.stroke();
    [0.24, 0.48, 0.72].forEach(function (t, k) {          // 坑洼
      var hx = L.slopeX + t * (L.pondX - L.slopeX), hy = groundY(hx);
      ctx.fillStyle = 'rgba(90,66,40,.55)';
      ctx.beginPath(); ctx.ellipse(hx, hy + 2, 9 + k * 3, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#8d949c'; circ(L.slopeX + (L.pondX - L.slopeX) * 0.38, groundY(L.slopeX + (L.pondX - L.slopeX) * 0.38) + 7, 3.4); ctx.fill();
    // 沥青路面 + 黄色虚线中线（图二样式）
    var ag = ctx.createLinearGradient(0, L.roadTop, 0, L.roadBot);
    ag.addColorStop(0, PAL.asphaltTop); ag.addColorStop(1, PAL.asphalt);
    ctx.fillStyle = ag; ctx.fillRect(L.roadLeft, L.roadTop, L.slopeX - L.roadLeft, L.roadH);
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(L.roadLeft, L.roadTop, L.slopeX - L.roadLeft, 3);
    ctx.strokeStyle = PAL.lane; ctx.lineWidth = Math.max(3, Math.round(L.roadH * 0.14)); ctx.setLineDash([20, 16]);
    ctx.beginPath(); ctx.moveTo(L.roadLeft + 6, L.roadTop + L.roadH * 0.58); ctx.lineTo(L.slopeX - 6, L.roadTop + L.roadH * 0.58); ctx.stroke();
    ctx.setLineDash([]);
    ctx.save(); ctx.fillStyle = PAL.text; ctx.font = '600 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('池塘护坡', (L.slopeX + L.pondX) / 2, L.roadTop - 10); ctx.restore();
    // 入水飞溅波纹
    if (S.car.mode === 'pond' && now - S.car.splashT < 1400) {
      var p = (now - S.car.splashT) / 1400;
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.7 * (1 - p)).toFixed(2) + ')'; ctx.lineWidth = 2.5;
      for (var k2 = 0; k2 < 2; k2++) {
        var rad = 14 + p * 46 + k2 * 12;
        ctx.beginPath(); ctx.ellipse(S.car.x, L.pondY + 3, rad, rad * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
  }

  /* ===== PhET 风格写实轿车（车头向右，修订点4/8） ===== */
  function drawOneWheel(cx0, cy0, r) {
    ctx.fillStyle = PAL.wheel; circ(cx0, cy0, r); ctx.fill();
    ctx.fillStyle = PAL.rim; circ(cx0, cy0, r * 0.52); ctx.fill();
    ctx.fillStyle = '#6b7684'; circ(cx0, cy0, r * 0.16); ctx.fill();
  }
  function drawCar() {
    var car = S.car, gy = L.roadTop + car.y, w = L.carW, h = L.carH, x = car.x - w / 2;
    ctx.save();
    if (car.angle) { ctx.translate(car.x, gy); ctx.rotate(car.angle); ctx.translate(-car.x, -gy); }
    ctx.fillStyle = 'rgba(20,30,45,.20)';
    ctx.beginPath(); ctx.ellipse(car.x, gy + 3, w * 0.5, 5, 0, 0, Math.PI * 2); ctx.fill();
    drawOneWheel(x + w * 0.22, gy - L.wheelR * 0.92, L.wheelR);
    drawOneWheel(x + w * 0.78, gy - L.wheelR * 0.92, L.wheelR);
    var bodyY = gy - h * 0.80, bodyH = h * 0.72;
    var bg = ctx.createLinearGradient(0, bodyY - h * 0.62, 0, gy);
    bg.addColorStop(0, PAL.carTop); bg.addColorStop(1, PAL.carBot);
    // 座舱（车顶弧线）
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.16, bodyY + 4);
    ctx.quadraticCurveTo(x + w * 0.22, bodyY - h * 0.60, x + w * 0.36, bodyY - h * 0.62);
    ctx.lineTo(x + w * 0.60, bodyY - h * 0.62);
    ctx.quadraticCurveTo(x + w * 0.73, bodyY - h * 0.56, x + w * 0.80, bodyY + 4);
    ctx.closePath(); ctx.fill();
    // 车窗（前挡风右倾 + 两块侧窗）
    ctx.fillStyle = PAL.carGlass;
    rr(x + w * 0.26, bodyY - h * 0.50, w * 0.19, h * 0.42, 5); ctx.fill();
    rr(x + w * 0.48, bodyY - h * 0.50, w * 0.15, h * 0.42, 5); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.655, bodyY - h * 0.48); ctx.lineTo(x + w * 0.735, bodyY - h * 0.02);
    ctx.lineTo(x + w * 0.665, bodyY - h * 0.02); ctx.closePath(); ctx.fill();
    // 车身主体
    ctx.fillStyle = bg; rr(x, bodyY, w, bodyH, h * 0.20); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.16)'; rr(x + w * 0.05, bodyY + bodyH * 0.12, w * 0.9, bodyH * 0.16, h * 0.08); ctx.fill();
    ctx.strokeStyle = 'rgba(60,20,20,.45)'; ctx.lineWidth = 1.5;                  // 门缝+把手
    ctx.beginPath(); ctx.moveTo(x + w * 0.46, bodyY + 4); ctx.lineTo(x + w * 0.46, bodyY + bodyH - 6); ctx.stroke();
    ctx.fillStyle = 'rgba(60,20,20,.5)'; rr(x + w * 0.36, bodyY + bodyH * 0.30, w * 0.06, 3, 1.5); ctx.fill();
    // 车灯：车头(右)前照灯 + 车尾(左)尾灯 + 保险杠
    ctx.fillStyle = '#ffe08a'; rr(x + w - 9, bodyY + bodyH * 0.22, 9, bodyH * 0.26, 4); ctx.fill();
    ctx.fillStyle = '#f43f5e'; rr(x, bodyY + bodyH * 0.22, 6, bodyH * 0.26, 3); ctx.fill();
    ctx.fillStyle = '#3f4650'; rr(x + w - 6, gy - h * 0.20, 8, h * 0.10, 3); ctx.fill(); rr(x - 2, gy - h * 0.20, 8, h * 0.10, 3); ctx.fill();
    // 车内方向盘（点击 → 居中放大 modal，修订点8）
    var swx = x + w * 0.62, swy = bodyY - h * 0.16, swr = Math.max(8, h * 0.14);
    ctx.strokeStyle = PAL.wheel; ctx.lineWidth = 3; circ(swx, swy, swr); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(swx - swr, swy); ctx.lineTo(swx + swr, swy); ctx.moveTo(swx, swy); ctx.lineTo(swx, swy + swr); ctx.stroke();
    S.sw = { x: swx, y: swy, r: swr };
    // 重心标记
    var c = comPoint();
    ctx.fillStyle = '#fff'; circ(c.x, c.y, 5); ctx.fill();
    ctx.strokeStyle = PAL.text; ctx.lineWidth = 2; circ(c.x, c.y, 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c.x - 8, c.y); ctx.lineTo(c.x + 8, c.y); ctx.moveTo(c.x, c.y - 8); ctx.lineTo(c.x, c.y + 8); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.fillStyle = '#fff'; ctx.font = '600 11px sans-serif'; ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 3;
    ctx.fillText('重心', c.x, c.y - 12); ctx.restore();
    // 池塘中：半透明水面盖住车体下半（浸没感）
    if (car.mode === 'pond') {
      ctx.save(); ctx.fillStyle = 'rgba(90,167,224,.45)';
      ctx.fillRect(car.x - w * 0.6, L.pondY, w * 1.2, H - L.pondY); ctx.restore();
    }
  }

  /* ===== PhET 风格小人（比例协调，非火柴人；推车手臂前伸，修订点3/5） ===== */
  function drawPerson() {
    var per = S.person, px = per.x, gy = L.roadTop, ph = L.personH, ice = S.shoe === 'ice';
    var headR = ph * 0.105, topY = gy - ph, headY = topY + headR * 1.15;
    var shY = topY + ph * 0.34, hipY = topY + ph * 0.56, torsoW = ph * 0.115;
    var walking = S.ps.mode === 'person' || per.sliding;
    var pushing = S.push.active && S.push.F > 0.05 && S.car.mode === 'road';
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // 双腿（裤）：行走/滑行=前后分开
    var fOff = walking ? ph * 0.10 : ph * 0.05;
    ctx.strokeStyle = '#2c3a42'; ctx.lineWidth = ph * 0.058;
    leg(px - 2, px - fOff, hipY, gy, ph);                       // 后腿（深色）
    ctx.strokeStyle = PAL.pants;
    leg(px + 2, px + fOff, hipY, gy, ph);                       // 前腿
    // 鞋 / 冰刀
    if (ice) {
      ctx.strokeStyle = '#9aa7b2'; ctx.lineWidth = 3;
      [-fOff, fOff].forEach(function (o) { ctx.beginPath(); ctx.moveTo(px + o - 9, gy - 1); ctx.lineTo(px + o + 11, gy - 1); ctx.stroke(); });
      ctx.fillStyle = '#41545e';
      rr(px - fOff - 8, gy - 8, 16, 7, 3); ctx.fill(); rr(px + fOff - 6, gy - 8, 16, 7, 3); ctx.fill();
    } else {
      ctx.fillStyle = PAL.shoe;
      rr(px - fOff - 9, gy - 7, 18, 7, 3); ctx.fill(); rr(px + fOff - 5, gy - 7, 18, 7, 3); ctx.fill();
    }
    // 躯干（圆角上衣）
    ctx.fillStyle = PAL.cloth; rr(px - torsoW, shY - ph * 0.07, torsoW * 2, hipY - shY + ph * 0.08, torsoW * 0.75); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.14)'; rr(px - torsoW * 0.55, shY - ph * 0.02, torsoW * 1.1, (hipY - shY) * 0.5, 4); ctx.fill();
    // 双臂：推车=前伸按到车；否则自然下垂/摆动
    ctx.strokeStyle = PAL.skin; ctx.lineWidth = ph * 0.042;
    if (pushing) {
      var cp = contactPoint();
      ctx.beginPath(); ctx.moveTo(px + torsoW * 0.5, shY);
      ctx.quadraticCurveTo(px + L.armLen * 0.55, shY + ph * 0.06, cp.x - 4, cp.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - torsoW * 0.4, shY + ph * 0.02);
      ctx.quadraticCurveTo(px + L.armLen * 0.45, shY + ph * 0.12, cp.x - 4, cp.y + ph * 0.03); ctx.stroke();
      ctx.fillStyle = PAL.skin; circ(cp.x - 4, cp.y, ph * 0.028); ctx.fill(); circ(cp.x - 4, cp.y + ph * 0.03, ph * 0.026); ctx.fill();
    } else {
      var sw = walking ? ph * 0.07 : ph * 0.02;
      ctx.beginPath(); ctx.moveTo(px + torsoW * 0.6, shY); ctx.lineTo(px + sw + ph * 0.03, hipY - ph * 0.02); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - torsoW * 0.6, shY); ctx.lineTo(px - sw - ph * 0.01, hipY - ph * 0.02); ctx.stroke();
    }
    // 头（面向右=车）：头发/耳/眼/笑
    ctx.fillStyle = PAL.skin; circ(px + ph * 0.012, headY, headR * 1.08); ctx.fill();
    ctx.fillStyle = PAL.hair;
    ctx.beginPath(); ctx.arc(px + ph * 0.012, headY, headR * 1.12, Math.PI * 0.98, Math.PI * 2.12); ctx.fill();
    ctx.fillStyle = PAL.skin; circ(px - headR * 0.75, headY + headR * 0.25, headR * 0.22); ctx.fill();
    ctx.fillStyle = '#3a2c20'; circ(px + headR * 0.55, headY - headR * 0.05, Math.max(1.6, ph * 0.012)); ctx.fill();
    ctx.strokeStyle = '#3a2c20'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(px + headR * 0.42, headY + headR * 0.32, headR * 0.4, 0.25, Math.PI * 0.72); ctx.stroke();
    ctx.restore();
  }
  function leg(hx, fx, hipY, gy, ph) {
    var kx = (hx + fx) / 2 + ph * 0.022, ky = hipY + (gy - hipY) * 0.55;
    ctx.beginPath(); ctx.moveTo(hx, hipY); ctx.lineTo(kx, ky); ctx.lineTo(fx, gy - ph * 0.045); ctx.stroke();
  }

  /* ===== 手-车接触海绵（形变∝力） ===== */
  function drawSponge() {
    if (S.car.mode !== 'road') return;
    var cp = contactPoint(), def = S.sponge.def;
    var w0 = L.carH * 0.16, h0 = L.carH * 0.30;
    var w = w0 * (1 + def * 0.45), h = h0 * (1 - def * 0.55);
    var x = cp.x - w * 0.5, y = cp.y - h / 2;
    ctx.save();
    ctx.fillStyle = PAL.sponge; rr(x, y, w, h, 4); ctx.fill();
    ctx.strokeStyle = PAL.spongeDark; ctx.lineWidth = 1.5; rr(x, y, w, h, 4); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (var i = 0; i < 3; i++) { circ(x + w * (0.3 + i * 0.2), y + h * 0.5, 1.8); ctx.fill(); }
    ctx.restore();
  }

  /* ===== F/v 主观察仪表条（修订点6：高≥2.5倍、18px、数值+单位+满量程刻度） ===== */
  function drawGauge(g, frac, color, title, valTxt, maxTxt) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.90)'; rr(g.x - 8, g.y - 8, g.w + 16, L.gh + 40, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(100,116,139,.4)'; ctx.lineWidth = 1; rr(g.x - 8, g.y - 8, g.w + 16, L.gh + 40, 12); ctx.stroke();
    ctx.fillStyle = PAL.bar; rr(g.x, g.y, g.w, L.gh, 10); ctx.fill();
    if (frac > 0.001) { ctx.fillStyle = color; rr(g.x, g.y, Math.max(16, g.w * clamp(frac, 0, 1)), L.gh, 10); ctx.fill(); }
    ctx.strokeStyle = 'rgba(40,50,61,.4)'; ctx.lineWidth = 1.5;                 // 满量程刻度 0/25/50/75/100%
    for (var i = 0; i <= 4; i++) {
      var tx = g.x + g.w * i / 4, e = (i === 0 || i === 4) ? 0 : 7;
      ctx.beginPath(); ctx.moveTo(tx, g.y + e); ctx.lineTo(tx, g.y + L.gh - e); ctx.stroke();
    }
    ctx.font = '700 18px "PingFang SC","Microsoft YaHei",sans-serif'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255,255,255,.92)'; ctx.shadowBlur = 4; ctx.fillStyle = PAL.text;
    ctx.textAlign = 'left'; ctx.fillText(title, g.x + 10, g.y + L.gh / 2);
    ctx.textAlign = 'right'; ctx.fillText(valTxt, g.x + g.w - 10, g.y + L.gh / 2);
    ctx.shadowBlur = 0; ctx.font = '600 12px sans-serif'; ctx.fillStyle = PAL.sub;
    ctx.textAlign = 'left'; ctx.fillText('0', g.x + 2, g.y + L.gh + 13);
    ctx.textAlign = 'right'; ctx.fillText(maxTxt, g.x + g.w - 2, g.y + L.gh + 13);
    ctx.restore();
  }
  function drawGauges() {
    var f = S.push.active ? S.push.F / F_MAX : 0;
    var sp = clamp(Math.abs(S.car.vx) / V_MAX, 0, 1);
    drawGauge(L.g1, f, PAL.thrust, '推力 F', (S.push.active ? S.push.F.toFixed(1) : '0.0') + ' N', '满量程 10 N');
    drawGauge(L.g2, sp, PAL.speed, '速度 v', Math.abs(S.car.vx).toFixed(0) + ' px/s', '满量程 500 px/s');
  }

  /* ===== 刹车踏板（修订点7：右侧踏板图形，踩下深度=刹车力） ===== */
  function drawPedal() {
    var p = L.pedal, dis = S.shoe === 'ice';
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.88)'; rr(p.x - 8, p.y - 26, p.w + 16, p.h + 62, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(100,116,139,.4)'; ctx.lineWidth = 1; rr(p.x - 8, p.y - 26, p.w + 16, p.h + 62, 12); ctx.stroke();
    ctx.fillStyle = PAL.text; ctx.font = '700 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('刹车踏板', p.x + p.w / 2, p.y - 9);
    if (dis) ctx.globalAlpha = 0.35;                                             // 滑冰鞋：自动虚化
    ctx.fillStyle = '#475569'; rr(p.x + p.w * 0.30, p.y, p.w * 0.40, 14, 5); ctx.fill();   // 转轴座
    var pvx = p.x + p.w * 0.5, pvy = p.y + 8;
    var ang = 0.16 + S.brake / BRAKE_MAX * 0.55;
    var ex = pvx + Math.sin(ang) * p.h * 0.72, ey = pvy + Math.cos(ang) * p.h * 0.72;
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;                              // 回位弹簧
    ctx.beginPath(); ctx.moveTo(p.x + 6, pvy + 4);
    for (var i = 1; i <= 4; i++) ctx.lineTo(p.x + 6 + (ex - p.x - 6) * i / 4, pvy + 4 + (ey - pvy - 4) * i / 4 + (i % 2 ? -4 : 4));
    ctx.stroke();
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 6;                              // 踏板臂
    ctx.beginPath(); ctx.moveTo(pvx, pvy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(ang);                          // 脚踏板面
    ctx.fillStyle = '#1f2933'; rr(-p.w * 0.32, -7, p.w * 0.64, 14, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5;
    for (var k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(k * p.w * 0.14, -4); ctx.lineTo(k * p.w * 0.14, 4); ctx.stroke(); }
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.fillStyle = PAL.text; ctx.font = '700 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('刹车力 ' + S.brake.toFixed(1) + ' N', p.x + p.w / 2, p.y + p.h + 16);
    ctx.font = '600 11px sans-serif'; ctx.fillStyle = dis ? PAL.thrust : PAL.sub;
    ctx.fillText(dis ? '滑冰鞋：锁定=最大' : '按住上下拖动 = 踩下/松开', p.x + p.w / 2, p.y + p.h + 31);
    ctx.restore();
  }

  /* ===== 方向盘放大区：居中 modal（修订点8） ===== */
  function drawWheelModal() {
    var b = L.modal, c = modalCenter(), R = L.dialR;
    ctx.save();
    ctx.fillStyle = 'rgba(15,23,42,.45)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.97)'; rr(b.x, b.y, b.w, b.h, 16); ctx.fill();
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; rr(b.x, b.y, b.w, b.h, 16); ctx.stroke();
    ctx.fillStyle = PAL.text; ctx.font = '700 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('方向盘放大区', c.x, b.y + 26);
    ctx.font = '600 12px sans-serif'; ctx.fillStyle = PAL.sub;
    ctx.fillText('按住轮上一点拖动 → 盘随拖动方向转动；松手停止', c.x, b.y + 44);
    // 轮盘（随拖动旋转）
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(S.dial.angle);
    ctx.strokeStyle = PAL.wheel; ctx.lineWidth = Math.max(6, R * 0.14); circ(0, 0, R); ctx.stroke();
    ctx.lineWidth = Math.max(4, R * 0.07);
    for (var a = 0; a < 3; a++) { var ang = a * Math.PI * 2 / 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * R, Math.sin(ang) * R); ctx.stroke(); }
    ctx.fillStyle = PAL.car; circ(0, 0, R * 0.18); ctx.fill();
    ctx.restore();
    // 12/3/6/9 点位标记（随盘转，文字不转）
    [[12, -Math.PI / 2], [3, 0], [6, Math.PI / 2], [9, Math.PI]].forEach(function (m) {
      var aa = m[1] + S.dial.angle, qx = c.x + Math.cos(aa) * R, qy = c.y + Math.sin(aa) * R;
      ctx.fillStyle = '#fff'; circ(qx, qy, 9); ctx.fill();
      ctx.strokeStyle = PAL.speed; ctx.lineWidth = 2; circ(qx, qy, 9); ctx.stroke();
      ctx.fillStyle = PAL.speed; ctx.font = '700 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(m[0] + '点', qx, qy);
    });
    if (S.dial.drag && S.dial.pt) { ctx.fillStyle = PAL.thrust; circ(S.dial.pt.x, S.dial.pt.y, 5); ctx.fill(); }
    // 关闭按钮
    var cbx = b.x + b.w - 20, cby = b.y + 20;
    ctx.fillStyle = '#e2e8f0'; circ(cbx, cby, 13); ctx.fill();
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(cbx - 5, cby - 5); ctx.lineTo(cbx + 5, cby + 5); ctx.moveTo(cbx + 5, cby - 5); ctx.lineTo(cbx - 5, cby + 5); ctx.stroke();
    if (S.dial.msg) {
      ctx.fillStyle = PAL.text; ctx.font = '600 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(S.dial.msg, c.x, b.y + b.h - 12);
    }
    ctx.restore();
  }

  /* ===== 合成 draw ===== */
  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    drawScene(now || performance.now());
    drawCar();
    drawPerson();
    drawSponge();
    drawGauges();
    drawPedal();
    if (S.wheelZoom) drawWheelModal();
    if (window.ForceOverlay) ForceOverlay.draw(ctx, { w: W, h: H });
  }

  /* ===== overlay 注册（门控在 ForceOverlay 内；此处只管活跃事件） ===== */
  function syncOverlay() {
    var FO = window.ForceOverlay; if (!FO) return;
    var car = S.car, ice = S.shoe === 'ice';
    if (car.mode === 'slide' || (car.mode === 'pond' && !car.settled)) {
      var c = comPoint();
      FO.register('gravity', { point: c, dir: { x: 0, y: 1 }, magN: WEIGHT_N, color: '#7c3aed', label: 'G≈' + WEIGHT_N.toFixed(1) + 'N' });
    } else FO.unregister('gravity');
    if (S.wheelZoom && S.dial.drag && S.dial.F > 0.15 && S.dial.pt) {
      FO.register('dial', { point: S.dial.pt, dir: S.dial.dirv, magN: S.dial.F, color: '#0891b2', label: 'F=' + S.dial.F.toFixed(1) + 'N' });
    } else FO.unregister('dial');
    if (S.push.active && S.push.F > 0.05 && car.mode === 'road') {
      var cp = contactPoint(), hp = { x: S.person.x + L.armLen * 0.85, y: cp.y };
      if (ice) {
        FO.register('push', {
          point: cp, dir: { x: 1, y: 0 }, magN: S.push.F, color: PAL.thrust, label: '车受向前 ' + S.push.F.toFixed(1) + 'N',
          pair: { point: hp, dir: { x: -1, y: 0 }, magN: S.push.F, color: PAL.speed, label: '人受向后 ' + S.push.F.toFixed(1) + 'N' }
        });
      } else FO.register('push', { point: cp, dir: { x: 1, y: 0 }, magN: S.push.F, color: PAL.thrust, label: '推力 F=' + S.push.F.toFixed(1) + 'N' });
    } else FO.unregister('push');
  }

  /* ===== 物理步进（力→加速度；修订点5/9：人车解耦+滑冰滑离） ===== */
  function step(dt, now) {
    var ch = false, car = S.car, per = S.person, ice = S.shoe === 'ice';
    // 推力：人手（x+臂长）压到车左面多深 → F（只推不拉，dir 恒向前）
    var pen = car.mode === 'road' ? (per.x + L.armLen - (car.x - L.carW * 0.5)) : -1;
    if (pen > 0) { S.push.active = true; S.push.F = clamp(pen * L.pushK, 0, F_MAX); }
    else { S.push.active = false; S.push.F = 0; }
    if (ice && S.push.active) {                                            // 相互作用：人持续向后加速（接触段）
      per.vx -= S.push.F * ICE_K * dt; per.sliding = true;
    }

    var decel = FRIC + S.brake / M * BRAKE_SCALE;
    if (car.mode === 'road') {
      var aPush = (!ice && S.push.active) ? S.push.F / M * A_SCALE : 0;   // 滑冰：刹车锁定最大，车不动
      if (Math.abs(car.vx) <= 0.5 && aPush <= decel) car.vx = 0;          // 静阻力顶得住 → 不动
      else {
        var a = aPush - (car.vx > 0 ? 1 : -1) * decel;
        car.vx += a * dt;
        if (car.vx < 0) car.vx = 0;                                       // 只推不拉：摩擦不得倒车
        car.vx = clamp(car.vx, 0, V_MAX * 1.5);
      }
      car.x += car.vx * dt;
      var minX = L.roadLeft + L.carW * 0.5;
      if (car.x < minX) { car.x = minX; car.vx = 0; }
      if (car.x >= L.slopeX) {
        car.mode = 'slide'; setHint('车越过路尽头 → 沿护坡滑下：重力加速，坑洼碰撞减速'); sfx('Click');
      }
      if (car.vx > 0.05) ch = true;
    } else if (car.mode === 'slide') {
      var grad = (groundY(car.x + 6) - groundY(car.x - 6)) / 12;
      car.vx += G_SLOPE * grad * dt;                                      // 重力沿坡分量
      car.vx *= (1 - 0.55 * dt);                                          // 坡面坑洼起伏：碰撞/减速
      car.x += car.vx * dt;
      car.y = groundY(car.x) - L.roadTop;
      var ta = Math.atan(grad); car.angle += (ta - car.angle) * Math.min(1, dt * 10);
      ch = true;
      if (car.x >= L.pondX - L.carW * 0.22) {
        car.mode = 'pond'; car.splashT = now; car.settled = false; sfx('Match');
        setHint('车冲入池塘：水的阻力使车迅速减速下沉');
      }
    } else {                                                              // pond
      car.vx *= Math.pow(0.05, dt);
      car.x = Math.min(car.x + car.vx * dt, W - 24 - L.carW * 0.45);
      var ty = (L.pondBottom - L.carH * 0.34) - L.roadTop;
      car.y += (ty - car.y) * Math.min(1, dt * 2.2);
      var rock = (now - car.splashT < 1600) ? Math.sin(now * 0.006) * 0.05 * (1 - (now - car.splashT) / 1600) : 0;
      car.angle += (rock - car.angle) * Math.min(1, dt * 6);
      if (!car.settled && Math.abs(car.y - ty) < 2 && Math.abs(car.vx) < 4) { car.settled = true; setHint('车沉入池底停住 — 点「重置」再来一轮'); }
      ch = !car.settled || Math.abs(rock) > 0.002;
    }

    // 人（滑冰滑离：接触段加速 + 脱手后惯性滑行缓慢减速；普通鞋由鼠标直接控制）
    if (per.sliding) {
      var penNow = car.mode === 'road' ? (per.x + L.armLen - (car.x - L.carW * 0.5)) : -1;
      if (penNow > 0 && ice) {                                             // 接触段：偏移累积（鼠标仍可加压）
        per.off += per.vx * dt;
        per.x = clampPersonX(per.baseX + per.off);
      } else if (Math.abs(per.vx) > 2) {                                   // 脱手：惯性滑行缓慢减速
        per.vx -= Math.sign(per.vx) * ICE_FRIC * dt; per.x += per.vx * dt;
      } else {                                                             // 停下：偏移折回抓取基准，防回弹
        per.vx = 0; per.sliding = false;
        S.ps.grabDX += per.off; per.baseX = per.x; per.off = 0;
        setHint('滑冰鞋：手与车已脱离 → 人靠惯性滑行，缓慢停下');
      }
      var pmin = L.roadLeft + 12;
      if (per.x < pmin) { per.x = pmin; per.vx = 0; per.sliding = false; }
      per.x = clampPersonX(per.x);
      ch = true;
    }

    // 海绵形变（弹簧回复，∝推力）
    var sTarget = S.push.active && car.mode === 'road' ? S.push.F / F_MAX : 0;
    var nd = S.sponge.def + (sTarget - S.sponge.def) * Math.min(1, dt * 14);
    if (Math.abs(nd - S.sponge.def) > 0.001) { S.sponge.def = nd; ch = true; }

    syncOverlay();
    return ch;
  }

  /* ===== pointer（修订点5/7/8 交互） ===== */
  function nearPerson(p) { return Math.hypot(p.x - S.person.x, p.y - (L.roadTop - L.personH * 0.5)) <= L.personH * 0.6; }
  function nearPedal(p) { var q = L.pedal; return p.x >= q.x - 10 && p.x <= q.x + q.w + 10 && p.y >= q.y - 28 && p.y <= q.y + q.h + 36; }
  function brakeFromY(y) { S.brake = clamp((y - L.pedal.y) / L.pedal.h, 0, 1) * BRAKE_MAX; }
  function setHint(t) { setText('hint', t); }
  function openWheel() {
    S.wheelZoom = true; S.dial.msg = '按住轮上一点拖动试试'; seg('btn-wheel', true); sfx('Click'); dirty = true;
  }
  function closeWheel() {
    S.wheelZoom = false; S.dial.drag = null; S.dial.F = 0; S.dial.pt = null; S.dial.msg = '';
    if (window.ForceOverlay) ForceOverlay.unregister('dial');
    seg('btn-wheel', false); dirty = true;
  }
  function capture(ev) { if (cv.setPointerCapture && ev.pointerId != null) { try { cv.setPointerCapture(ev.pointerId); } catch (e) {} } }

  function onDown(ev) {
    var p = canvasXY(ev);
    S.ps.x = p.x; S.ps.y = p.y; S.ps.downX = p.x; S.ps.downY = p.y; S.ps.moved = 0;
    if (S.wheelZoom) {                                                     // modal 优先
      var c = modalCenter(), R = L.dialR, cbx = L.modal.x + L.modal.w - 20, cby = L.modal.y + 20;
      if (Math.hypot(p.x - cbx, p.y - cby) <= 16) { closeWheel(); return; }
      var d = Math.hypot(p.x - c.x, p.y - c.y);
      if (Math.abs(d - R) <= R * 0.45 || d <= R * 0.28) {
        S.dial.drag = { a0: Math.atan2(p.y - c.y, p.x - c.x) - S.dial.angle };
        S.ps.mode = 'dial'; capture(ev); ev.preventDefault(); dirty = true; return;
      }
      if (p.x < L.modal.x || p.x > L.modal.x + L.modal.w || p.y < L.modal.y || p.y > L.modal.y + L.modal.h) closeWheel();
      return;
    }
    if (nearPedal(p)) {
      if (S.shoe === 'ice') { setHint('滑冰鞋：刹车踏板已锁定为最大（虚化不可调）'); return; }
      S.ps.mode = 'pedal'; brakeFromY(p.y); capture(ev);
      setHint('踩下刹车踏板 → 刹车力增大；松手保持当前值'); ev.preventDefault(); dirty = true; return;
    }
    if (S.sw && S.car.mode === 'road' && Math.hypot(p.x - S.sw.x, p.y - S.sw.y) <= S.sw.r + 12) { openWheel(); return; }
    if (nearPerson(p) && S.car.mode !== 'pond') {
      if (S.person.sliding) { setHint('人正在惯性滑行中，停下后才能再拖动'); return; }
      S.ps.mode = 'person'; S.ps.grabDX = S.person.x - p.x;
      S.person.off = 0; S.person.baseX = S.person.x; capture(ev);
      setHint(S.shoe === 'ice' ? '滑冰鞋：推到人车接触 → 人整体向后滑离车（相互作用）' : '拖动小人向前顶住车 → 车受力启动；按住不动 → 车凭惯性前滑');
      ev.preventDefault(); dirty = true; return;
    }
    S.ps.mode = 'idle';
  }
  function onMove(ev) {
    var p = canvasXY(ev); S.ps.x = p.x; S.ps.y = p.y;
    if (S.ps.mode === 'pedal') { brakeFromY(p.y); dirty = true; return; }
    if (S.ps.mode === 'person') {
      S.person.baseX = clampPersonX(p.x + (S.ps.grabDX || 0));
      if (!S.person.sliding) S.person.x = S.person.baseX;                  // 滑冰接触段：位置由 step 积分偏移
      dirty = true; return;
    }
    if (S.ps.mode === 'dial' && S.dial.drag) {
      var c = modalCenter(), R = L.dialR;
      var a = S.dial.angle + S.dial.drag.a0, rx = Math.cos(a), ry = Math.sin(a);
      var gx = c.x + rx * R, gy = c.y + ry * R;
      var dx = p.x - gx, dy = p.y - gy, dl = Math.hypot(dx, dy);
      S.dial.F = clamp(dl / (R * 0.45) * DIAL_FMAX, 0, DIAL_FMAX);
      S.dial.pt = { x: gx, y: gy }; S.dial.dirv = { x: dx, y: dy };
      var cross = rx * dy - ry * dx, ratio = dl > 1e-6 ? Math.abs(cross) / dl : 0;   // 力臂/R = sinθ
      if (ratio < 0.2) S.dial.msg = '作用线≈过盘心 → 力臂≈0 → 不转动';
      else { S.dial.angle += cross / R * 0.9; S.dial.msg = '力臂≈' + Math.round(ratio * R) + 'px → 盘随拖动转动（松手停止）'; }
      dirty = true; return;
    }
    var over = nearPedal(p) || nearPerson(p) ||
      (S.sw && S.car.mode === 'road' && Math.hypot(p.x - S.sw.x, p.y - S.sw.y) <= S.sw.r + 12);
    cv.style.cursor = over ? 'pointer' : 'default';
  }
  function onUp() {
    if (S.ps.mode === 'person') setHint('松手：不再推 → 车只受摩擦/刹车减速（力不是维持运动的原因）');
    if (S.ps.mode === 'dial') {
      S.dial.drag = null; S.dial.F = 0; S.dial.pt = null; S.dial.msg = '松手 → 停止转动';
      if (window.ForceOverlay) ForceOverlay.unregister('dial');
    }
    S.ps.mode = 'idle'; dirty = true;
  }

  /* ===== 控件 wiring ===== */
  function seg(id, on) { var b = document.getElementById(id); if (b) b.classList.toggle('on', !!on); }
  function setShoe(s) {
    if (s === S.shoe) return;
    S.shoe = s;
    if (s === 'ice') {
      S.brakeSaved = S.brake; S.brake = BRAKE_MAX;
      S.person.vx = 0; S.person.sliding = false; S.person.off = 0; S.person.baseX = S.person.x;
      setHint('滑冰鞋：刹车踏板虚化锁定=最大；推车 → 人整体向后滑离车、手脱开（相互作用+惯性）');
    } else {
      S.brake = S.brakeSaved || 0;
      setHint('普通鞋：拖动小人向前推车 → 车受力启动');
    }
    seg('btn-shoe-normal', s === 'normal'); seg('btn-shoe-ice', s === 'ice');
    sfx('Click'); dirty = true;
  }
  function wire() {
    function on(id, ev, fn) { var el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }
    on('btn-shoe-normal', 'click', function () { setShoe('normal'); });
    on('btn-shoe-ice', 'click', function () { setShoe('ice'); });
    on('btn-wheel', 'click', function () { if (S.wheelZoom) closeWheel(); else openWheel(); });
    on('btn-diagram', 'click', function () {
      S.diagram = !S.diagram;
      if (window.ForceOverlay) ForceOverlay.setOn(S.diagram);
      var b = document.getElementById('btn-diagram'); if (b) b.classList.toggle('on', S.diagram);
      setHint(S.diagram ? '力的示意图：开 — 仅当前活跃交互/事件画矢量（1cm=1N）' : '力的示意图：关 — 全场景不画矢量');
      sfx('Click'); dirty = true;
    });
    on('btn-reset', 'click', function () { resetCar(); setHint('已重置：拖动小人向前推车 → 车启动'); sfx('Click'); });
    on('btn-mute', 'click', function () {
      S.muted = !S.muted; var b = document.getElementById('btn-mute');
      if (b) { b.classList.toggle('on', !S.muted); b.textContent = S.muted ? '🔇' : '🔊'; }
    });
    on('btn-full', 'click', function () {
      var el = document.documentElement;
      if (!document.fullscreenElement) { if (el.requestFullscreen) el.requestFullscreen(); }
      else if (document.exitFullscreen) document.exitFullscreen();
    });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (e) { document.addEventListener(e, function () { setTimeout(resize, 60); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.wheelZoom) closeWheel(); });

    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (e) { cv.addEventListener(e, onUp); });
    window.addEventListener('resize', resize);
  }

  /* ===== init ===== */
  wire();
  if (window.ForceOverlay) ForceOverlay.setOn(false);
  seg('btn-shoe-normal', true);
  resize();
  requestAnimationFrame(tick);
})();

/* ============================================================
 * exp-road-core.js — 场景A（7.1 力）侧视马路  C7V5-R1
 * 规格：设计书 §1 全条。范式=侧视2D。复用 v4 pointer状态机/弹簧二阶/矢量思路。
 * 力的示意图经 force-overlay.js 门控（开=仅活跃交互画矢量；关=全场景无）。
 * 结构：单一 IIFE；step()/draw()/handlers 用函数声明（同作用域提升），末尾统一 init。
 * ============================================================ */
(function () {
  'use strict';

  /* ===== 调色板（侧视马路） ===== */
  var PAL = {
    sky: '#dfe9f2', asphalt: '#4a4f57', asphaltTop: '#5b616b',
    curb: '#e8b62c', river: '#3f8fd6', riverDeep: '#2b6fae', riverFoam: '#bfe0f7',
    car: '#d64545', carDark: '#a83232', carGlass: '#bfe3f2', wheel: '#2b2f36',
    skin: '#f0c08a', cloth: '#3f6fb5', clothDark: '#2f5590', sponge: '#f0913e', spongeDark: '#cf7526',
    ice: '#9fd8ef', text: '#28323d', sub: '#6b7885', bar: '#e2e8f0',
    thrust: '#dc2626', speed: '#2563eb', ok: '#16a34a'
  };

  /* ===== 物理常量（§1；力→加速度，非速度） ===== */
  var M = 1.2, A_SCALE = 55, PX_PER_N = 12, F_MAX = 10;
  var FRIC = 130, BRAKE_SCALE = 55, G_FALL = 900, WEIGHT_N = M * 9.8;
  var V_BAR = 380, DIAL_F = 3;

  /* ===== 画布脚手架 ===== */
  var cv = document.getElementById('scene');
  var ctx = cv.getContext('2d');
  var W = 960, H = 540, DPR = 1, dirty = true, lastNow = 0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function setText(id, t) { var el = document.getElementById(id); if (el && el.textContent !== t) el.textContent = t; }
  function sfx(name) { if (!S.muted && window['play' + name]) { try { window['play' + name](); } catch (e) {} } }

  /* ===== 布局 L（resize 全量重算） ===== */
  var L = {};
  function layout() {
    L.roadTop = Math.round(H * 0.60);
    L.roadH = Math.max(20, Math.round(H * 0.05));
    L.roadBot = L.roadTop + L.roadH;
    L.roadLeft = 36;
    L.curbX = Math.round(W - Math.max(150, W * 0.20));
    L.riverRight = W - 24;
    L.riverTop = L.roadBot;
    L.riverBot = H - 14;
    L.carW = clamp(Math.round(W * 0.13), 92, 150);
    L.carH = Math.round(L.carW * 0.42);
    L.wheelR = Math.round(L.carH * 0.30);
    L.homeX = L.roadLeft + L.carW * 0.5 + Math.round((L.curbX - L.roadLeft - L.carW) * 0.28);
    L.barX = 16; L.barY = 52; L.barW = clamp(Math.round(W * 0.20), 140, 210); L.barH = 14; L.barGap = 30;
    L.wheelBox = { w: clamp(Math.round(W * 0.26), 190, 240), h: clamp(Math.round(W * 0.26), 190, 240) };
    L.wheelBox.x = Math.round(W - L.wheelBox.w - 18);
    L.wheelBox.y = 52;
    L.wheelR = Math.round(Math.min(L.wheelBox.w, L.wheelBox.h) * 0.30);
  }

  /* ===== 状态 ===== */
  var S = {
    car: { x: 0, vx: 0, y: 0, angle: 0, falling: false, fallen: false },
    person: { side: 'right', backOff: 0, backV: 0 },
    sponge: { def: 0 },
    push: { active: false, F: 0, dir: 1 },
    shoe: 'normal', brake: 0, wheelZoom: false,
    dial: { anim: null, angle: 0, msg: '' },
    diagram: false, muted: false,
    ps: { mode: 'idle', x: 0, y: 0, downX: 0, downY: 0 }
  };
  window.C7V5_ROAD = S;

  /* ===== 几何访问器（render/physics 共用） ===== */
  function carCX() { return S.car.x; }
  function carBottom() { return L.roadTop + S.car.y; }
  function comPoint() { return { x: S.car.x, y: carBottom() - L.carH * 0.5 }; }
  function sideSign() { return S.person.side === 'right' ? 1 : -1; }
  function contactPoint() {
    return { x: S.car.x + sideSign() * L.carW * 0.5, y: carBottom() - L.carH * 0.62 };
  }
  function personX() {
    return S.car.x + sideSign() * (L.carW * 0.5 + 28) + sideSign() * S.person.backOff;
  }
  function handPoint() {
    return { x: S.car.x + sideSign() * (L.carW * 0.5 + 8), y: carBottom() - L.carH * 0.66 };
  }
  function wheelCenter() { return { x: L.wheelBox.x + L.wheelBox.w / 2, y: L.wheelBox.y + L.wheelBox.h / 2 }; }
  function dialPoint(which) {
    var c = wheelCenter(), R = L.wheelR;
    if (which === 12) return { x: c.x, y: c.y - R, which: 12 };
    if (which === 3) return { x: c.x + R, y: c.y, which: 3 };
    if (which === 6) return { x: c.x, y: c.y + R, which: 6 };
    return { x: c.x - R, y: c.y, which: 9 };
  }

  /* ===== resize（DPR 适配 + 全量重算） ===== */
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
    S.car.x = L.homeX; S.car.vx = 0; S.car.y = 0; S.car.angle = 0;
    S.car.falling = false; S.car.fallen = false;
    S.person.backOff = 0; S.person.backV = 0;
    S.sponge.def = 0; S.push.active = false; S.push.F = 0;
    S.dial.anim = null; S.dial.angle = 0; S.dial.msg = '';
    if (window.ForceOverlay) ForceOverlay.clear();
    dirty = true;
  }
  function canvasXY(ev) { var r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }

  /* ===== rAF 单循环（step/draw 由函数声明提升） ===== */
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

  /* ===== 路面 + 河 + 路缘（§1.1/§1.4） ===== */
  function drawRoad() {
    ctx.fillStyle = PAL.sky; ctx.fillRect(0, 0, W, H);
    // 河（路缘右侧、路面下方）
    ctx.fillStyle = PAL.river;
    ctx.fillRect(L.curbX, L.riverTop, L.riverRight - L.curbX, L.riverBot - L.riverTop);
    ctx.fillStyle = PAL.riverDeep;
    ctx.fillRect(L.curbX, L.riverTop + (L.riverBot - L.riverTop) * 0.45, L.riverRight - L.curbX, (L.riverBot - L.riverTop) * 0.55);
    ctx.strokeStyle = PAL.riverFoam; ctx.lineWidth = 2;
    for (var i = 0; i < 3; i++) {
      var wy = L.riverTop + 12 + i * 16, wx = L.curbX + 14 + i * 22;
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.quadraticCurveTo(wx + 12, wy - 4, wx + 24, wy); ctx.stroke();
    }
    // 沥青路面（左 → 路缘断开）
    ctx.fillStyle = PAL.asphalt;
    ctx.fillRect(L.roadLeft, L.roadTop, L.curbX - L.roadLeft, L.roadH);
    ctx.fillStyle = PAL.asphaltTop;
    ctx.fillRect(L.roadLeft, L.roadTop, L.curbX - L.roadLeft, 4);
    // 路面虚线
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.setLineDash([14, 12]);
    ctx.beginPath(); ctx.moveTo(L.roadLeft + 6, L.roadTop + L.roadH * 0.55); ctx.lineTo(L.curbX - 6, L.roadTop + L.roadH * 0.55); ctx.stroke();
    ctx.setLineDash([]);
    // 路缘线（断开处黄色立缘）
    ctx.fillStyle = PAL.curb;
    ctx.fillRect(L.curbX - 4, L.roadTop - 6, 5, L.roadH + 6);
    ctx.save(); ctx.fillStyle = PAL.text; ctx.font = '600 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('路缘', L.curbX - 2, L.roadTop - 12); ctx.restore();
  }

  /* ===== 小车（带方向盘）+ 轮 + 重心点（§1.2/§1.4） ===== */
  function drawCar() {
    var c = comPoint(), w = L.carW, h = L.carH;
    ctx.save();
    ctx.translate(c.x, c.y); ctx.rotate(S.car.angle); ctx.translate(-c.x, -c.y);
    var x = S.car.x - w / 2, y = carBottom() - h;
    // 车身
    ctx.fillStyle = PAL.car; rr(x, y, w, h, 8); ctx.fill();
    ctx.fillStyle = PAL.carDark; rr(x, y + h * 0.62, w, h * 0.38, 6); ctx.fill();
    // 车厢 + 玻璃
    ctx.fillStyle = PAL.car; rr(x + w * 0.22, y - h * 0.5, w * 0.56, h * 0.56, 6); ctx.fill();
    ctx.fillStyle = PAL.carGlass; rr(x + w * 0.28, y - h * 0.42, w * 0.44, h * 0.36, 4); ctx.fill();
    // 车内小方向盘
    var swx = x + w * 0.34, swy = y - h * 0.18, swr = h * 0.16;
    ctx.strokeStyle = PAL.wheel; ctx.lineWidth = 3; circ(swx, swy, swr); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(swx - swr, swy); ctx.lineTo(swx + swr, swy); ctx.stroke();
    // 轮
    ctx.fillStyle = PAL.wheel;
    circ(x + w * 0.24, carBottom() - L.wheelR * 0.4, L.wheelR); ctx.fill();
    circ(x + w * 0.76, carBottom() - L.wheelR * 0.4, L.wheelR); ctx.fill();
    ctx.fillStyle = '#9aa3ad';
    circ(x + w * 0.24, carBottom() - L.wheelR * 0.4, L.wheelR * 0.42); ctx.fill();
    circ(x + w * 0.76, carBottom() - L.wheelR * 0.4, L.wheelR * 0.42); ctx.fill();
    // 重心点标记
    ctx.fillStyle = '#fff'; circ(c.x, c.y, 5); ctx.fill();
    ctx.strokeStyle = PAL.text; ctx.lineWidth = 2; circ(c.x, c.y, 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c.x - 8, c.y); ctx.lineTo(c.x + 8, c.y);
    ctx.moveTo(c.x, c.y - 8); ctx.lineTo(c.x, c.y + 8); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.fillStyle = PAL.sub; ctx.font = '600 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('重心', c.x, c.y - 12); ctx.restore();
  }

  /* ===== 小人（左/右站位 + 鞋）（§1.2/§1.5） ===== */
  function drawPerson() {
    var px = personX(), gy = carBottom(), ice = S.shoe === 'ice';
    var hh = L.carH * 1.5, head = hh * 0.20;
    var topY = gy - hh;
    ctx.save();
    // 腿
    ctx.strokeStyle = PAL.clothDark; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px, topY + hh * 0.55); ctx.lineTo(px - 6, gy - 4);
    ctx.moveTo(px, topY + hh * 0.55); ctx.lineTo(px + 6, gy - 4); ctx.stroke();
    // 鞋 / 冰刀
    if (ice) {
      ctx.strokeStyle = PAL.ice; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(px - 11, gy - 1); ctx.lineTo(px - 1, gy - 1);
      ctx.moveTo(px + 1, gy - 1); ctx.lineTo(px + 11, gy - 1); ctx.stroke();
    } else {
      ctx.fillStyle = '#5b4636';
      rr(px - 11, gy - 5, 11, 5, 2); ctx.fill(); rr(px + 1, gy - 5, 11, 5, 2); ctx.fill();
    }
    // 躯干
    ctx.strokeStyle = PAL.cloth; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(px, topY + head); ctx.lineTo(px, topY + hh * 0.56); ctx.stroke();
    // 头
    ctx.fillStyle = PAL.skin; circ(px, topY + head * 0.5, head * 0.62); ctx.fill();
    // 手臂伸向接触点
    var hp = handPoint();
    ctx.strokeStyle = PAL.skin; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(px, topY + hh * 0.34); ctx.lineTo(hp.x, hp.y); ctx.stroke();
    ctx.restore();
  }

  /* ===== 手-车接触点海绵（推时压扁，形变∝力）（§1.5） ===== */
  function drawSponge() {
    var cp = contactPoint(), def = S.sponge.def;
    var w0 = 16, h0 = 22, sgn = sideSign();
    var w = w0 * (1 + def * 0.45), h = h0 * (1 - def * 0.55);   // 压扁：高↓宽↑
    var x = cp.x + (sgn > 0 ? -w * 0.2 : -w * 0.8), y = cp.y - h / 2;
    ctx.save();
    ctx.fillStyle = PAL.sponge; rr(x, y, w, h, 4); ctx.fill();
    ctx.strokeStyle = PAL.spongeDark; ctx.lineWidth = 1.5; rr(x, y, w, h, 4); ctx.stroke();
    // 海绵孔
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (var i = 0; i < 3; i++) { circ(x + w * (0.3 + i * 0.2), y + h * 0.5, 1.6); ctx.fill(); }
    ctx.restore();
  }

  /* ===== 推力条 + 速度条（双显示）（§1.1） ===== */
  function drawBar(x, y, w, h, frac, color, text) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.82)'; rr(x - 6, y - 16, w + 12, h + 22, 8); ctx.fill();
    ctx.fillStyle = PAL.bar; rr(x, y, w, h, 5); ctx.fill();
    ctx.fillStyle = color; if (frac > 0.001) { rr(x, y, Math.max(4, w * clamp(frac, 0, 1)), h, 5); ctx.fill(); }
    ctx.fillStyle = PAL.text; ctx.font = '600 11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText(text, x, y - 3);
    ctx.restore();
  }
  function drawBars() {
    var f = S.push.active ? S.push.F / F_MAX : 0;
    var sp = clamp(Math.abs(S.car.vx) / V_BAR, 0, 1);
    drawBar(L.barX, L.barY, L.barW, L.barH, f, PAL.thrust, '推力 F = ' + (S.push.active ? S.push.F.toFixed(1) : '0.0') + ' N');
    drawBar(L.barX, L.barY + L.barGap, L.barW, L.barH, sp, PAL.speed, '速度 v = ' + Math.abs(S.car.vx).toFixed(0) + ' px/s');
  }

  /* ===== 方向盘放大区（§1.6：同力同向·向上，只变拨点） ===== */
  function drawWheelZoom() {
    var b = L.wheelBox, c = wheelCenter(), R = L.wheelR;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.94)'; rr(b.x, b.y, b.w, b.h, 14); ctx.fill();
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; rr(b.x, b.y, b.w, b.h, 14); ctx.stroke();
    ctx.fillStyle = PAL.text; ctx.font = '700 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('方向盘放大区 · 力 F=3N 向上，只变拨点', c.x, b.y + 8);
    // 轮盘（随拨动旋转）
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(S.dial.angle);
    ctx.strokeStyle = PAL.wheel; ctx.lineWidth = 7; circ(0, 0, R); ctx.stroke();
    ctx.lineWidth = 5;
    for (var a = 0; a < 3; a++) { var ang = a * Math.PI * 2 / 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * R, Math.sin(ang) * R); ctx.stroke(); }
    ctx.fillStyle = PAL.carDark; circ(0, 0, R * 0.18); ctx.fill();
    ctx.restore();
    // 盘心 + 4 拨点
    ctx.fillStyle = PAL.sub; circ(c.x, c.y, 3); ctx.fill();
    [12, 3, 6, 9].forEach(function (wh) {
      var p = dialPoint(wh);
      ctx.fillStyle = '#fff'; circ(p.x, p.y, 9); ctx.fill();
      ctx.strokeStyle = PAL.speed; ctx.lineWidth = 2; circ(p.x, p.y, 9); ctx.stroke();
      ctx.fillStyle = PAL.speed; ctx.font = '700 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(wh + '点', p.x, p.y);
    });
    if (S.dial.msg) {
      ctx.fillStyle = PAL.text; ctx.font = '600 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(S.dial.msg, c.x, b.y + b.h - 8);
    }
    ctx.restore();
  }

  /* ===== 合成 draw ===== */
  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawRoad();
    drawCar();
    drawPerson();
    drawSponge();
    drawBars();
    if (S.wheelZoom) drawWheelZoom();
    if (window.ForceOverlay) ForceOverlay.draw(ctx, { w: W, h: H });
  }
  /* ===== 翻落（§1.4：重心越过路缘 → 不推也翻落，重力） ===== */
  function startTopple() {
    var car = S.car;
    if (car.falling || car.fallen) return;
    car.falling = true; car.vy = 0;
    car.spinDir = car.vx >= 0 ? 1 : (S.person.side === 'right' ? 1 : 1);
    S.push.active = false; S.push.F = 0;
    sfx('Click');
    dirty = true;
  }

  /* ===== 方向盘拨动（§1.6：力臂=支点到作用线垂距） ===== */
  function dialWhich(p) {
    var best = null, bd = 1e9;
    [12, 3, 6, 9].forEach(function (wh) {
      var q = dialPoint(wh), d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < bd) { bd = d; best = wh; }
    });
    return bd <= 18 ? best : null;
  }
  function applyDial(which) {
    // 力锁定向上 F=3N；力臂 = 拨点到盘心的水平距离（作用线为竖直线）
    var c = wheelCenter(), p = dialPoint(which);
    var arm = Math.abs(p.x - c.x);                 // 12/6 → 0；3/9 → R
    var R = L.wheelR;
    if (arm < R * 0.2) {
      S.dial.msg = which + '点：作用线过盘心 → 力臂=0 → 不转动';
      S.dial.anim = { t0: performance.now(), from: S.dial.angle, to: S.dial.angle, arm: 0, dir: 0, which: which };
      return;
    }
    // 力向上：右侧拨点(3点)→逆时针(-)，左侧拨点(9点)→顺时针(+)
    var dir = (p.x > c.x) ? -1 : 1;
    var to = S.dial.angle + dir * 0.7;             // 转动 ~40°
    S.dial.msg = which + '点：力臂=半径 → 转动（' + (dir < 0 ? '逆时针' : '顺时针') + '）';
    S.dial.anim = { t0: performance.now(), from: S.dial.angle, to: to, arm: arm, dir: dir, which: which };
    sfx('Click');
    dirty = true;
  }

  /* ===== overlay 注册（门控由 ForceOverlay 内部处理；此处只负责活跃事件登记/移除） ===== */
  function syncOverlay() {
    var FO = window.ForceOverlay; if (!FO) return;
    var car = S.car;
    // 翻落重力（仅活跃翻落事件）
    if (car.falling) {
      var c = comPoint();
      FO.register('gravity', { point: c, dir: { x: 0, y: 1 }, magN: WEIGHT_N, color: '#7c3aed', label: 'G≈' + WEIGHT_N.toFixed(1) + 'N' });
    } else FO.unregister('gravity');
    // 方向盘拨力（仅拨动动画期间）
    if (S.dial.anim && S.dial.anim.arm > 0) {
      var p = dialPoint(S.dial.anim.which);
      FO.register('dial', { point: p, dir: { x: 0, y: -1 }, magN: DIAL_F, color: '#0891b2', label: 'F=3N↑' });
    } else FO.unregister('dial');
    // 推车 / 滑冰相互作用
    if (S.push.active && S.push.F > 0.05) {
      var cp = contactPoint(), hp = handPoint(), d = S.push.dir;
      if (S.shoe === 'ice') {
        FO.register('push', {
          point: cp, dir: { x: d, y: 0 }, magN: S.push.F, color: PAL.thrust, label: '车受向前 ' + S.push.F.toFixed(1) + 'N',
          pair: { point: hp, dir: { x: -d, y: 0 }, magN: S.push.F, color: PAL.speed, label: '人受向后 ' + S.push.F.toFixed(1) + 'N' }
        });
      } else {
        FO.register('push', { point: cp, dir: { x: d, y: 0 }, magN: S.push.F, color: PAL.thrust, label: '推力 F=' + S.push.F.toFixed(1) + 'N' });
      }
    } else FO.unregister('push');
  }

  /* ===== 物理步进（力 → 加速度，非速度） ===== */
  function step(dt, now) {
    var ch = false, car = S.car, ice = S.shoe === 'ice';

    if (car.fallen) { syncOverlay(); return false; }

    if (car.falling) {
      // 翻落：重力自由落体 + 前倾旋转
      car.vy = (car.vy || 0) + G_FALL * dt;
      car.y += car.vy * dt;
      car.angle += car.spinDir * 3.2 * dt;
      if (car.y >= (L.riverBot - L.roadTop) - L.carH * 0.3) {
        car.y = (L.riverBot - L.roadTop) - L.carH * 0.3;
        car.falling = false; car.fallen = true; sfx('Match');
      }
      ch = true;
    } else {
      // 水平动力学
      var brakeDecel = S.brake / M * BRAKE_SCALE;
      var aPush = 0;
      if (S.push.active && !ice) aPush = S.push.dir * S.push.F / M * A_SCALE;   // 滑冰：车自动刹住，推力不驱动车
      var aFric = 0;
      if (Math.abs(car.vx) > 0.5) aFric = -Math.sign(car.vx) * (FRIC + brakeDecel);
      else if (ice && S.push.active) aFric = 0;
      if (ice) { // 滑冰鞋：车刹住（强制趋于静止）
        car.vx *= Math.pow(0.0001, dt);
        if (Math.abs(car.vx) < 1) car.vx = 0;
      } else {
        var vx0 = car.vx;
        car.vx += (aPush + aFric) * dt;
        // 摩擦不得把车反向拖动
        if (!S.push.active && vx0 !== 0 && Math.sign(car.vx) !== Math.sign(vx0)) car.vx = 0;
        car.vx = clamp(car.vx, -V_BAR * 1.6, V_BAR * 1.6);
        car.x += car.vx * dt;
      }
      // 左端限位
      var minX = L.roadLeft + L.carW * 0.5;
      if (car.x < minX) { car.x = minX; if (car.vx < 0) car.vx = 0; }
      // 重心越过路缘 → 翻落（不推也翻）
      if (car.x >= L.curbX) { car.x = L.curbX; startTopple(); }
      if (Math.abs(car.vx) > 0.01 || car.x !== car.x) ch = true;
      if (Math.abs(car.vx) > 0.01) ch = true;
    }

    // 海绵形变（弹簧回复，∝力）
    var sTarget = (S.push.active && !S.car.falling) ? S.push.F / F_MAX : 0;
    var nd = S.sponge.def + (sTarget - S.sponge.def) * Math.min(1, dt * 14);
    if (Math.abs(nd - S.sponge.def) > 0.001) { S.sponge.def = nd; ch = true; }

    // 滑冰反推：人向后位移（相互作用）
    var bTarget = (ice && S.push.active) ? 34 : 0;
    var nb = S.person.backOff + (bTarget - S.person.backOff) * Math.min(1, dt * 6);
    if (Math.abs(nb - S.person.backOff) > 0.05) { S.person.backOff = nb; ch = true; }

    // 方向盘拨动动画
    if (S.dial.anim) {
      var A = S.dial.anim, p = clamp((now - A.t0) / 520, 0, 1);
      S.dial.angle = lerp(A.from, A.to, easeInOut(p));
      ch = true;
      if (p >= 1) { S.dial.anim = null; }
    }

    syncOverlay();
    return ch;
  }
  /* ===== pointer 状态机（idle/hover/grab/drag/release） ===== */
  function nearContact(p) { var c = contactPoint(); return Math.hypot(p.x - c.x, p.y - c.y) <= 30; }
  function setHint(t) { setText('hint', t); }

  function onDown(ev) {
    var p = canvasXY(ev), car = S.car;
    S.ps.x = p.x; S.ps.y = p.y; S.ps.downX = p.x; S.ps.downY = p.y;
    if (S.wheelZoom) {
      var wh = dialWhich(p);
      if (wh) { S.ps.mode = 'dial'; applyDial(wh); ev.preventDefault(); return; }
    }
    if (!car.falling && !car.fallen && nearContact(p)) {
      S.ps.mode = 'grab'; S.push.active = true; S.push.F = 0; S.push.dir = sideSign() > 0 ? -1 : 1;
      if (cv.setPointerCapture && ev.pointerId != null) { try { cv.setPointerCapture(ev.pointerId); } catch (e) {} }
      setHint(S.shoe === 'ice' ? '滑冰鞋：车刹住，人反被向后推（相互作用）' : '拖拽施力 → 车加速；松手 → 摩擦减速');
      ev.preventDefault(); dirty = true; return;
    }
    S.ps.mode = 'idle';
  }
  function onMove(ev) {
    var p = canvasXY(ev); S.ps.x = p.x; S.ps.y = p.y;
    if (S.ps.mode === 'grab' && S.push.active) {
      var dx = p.x - S.ps.downX;
      if (Math.abs(dx) > 2) S.push.dir = dx > 0 ? 1 : -1;
      S.push.F = clamp(Math.abs(dx) / PX_PER_N, 0, F_MAX);
      dirty = true;
      return;
    }
    // hover 光标
    var over = (!S.car.falling && !S.car.fallen && nearContact(p)) || (S.wheelZoom && dialWhich(p));
    cv.style.cursor = over ? 'pointer' : 'default';
  }
  function onUp() {
    if (S.ps.mode === 'grab') { S.push.active = false; S.push.F = 0; setHint('松手 → 摩擦使车减速停下（力不是维持运动的原因）'); }
    S.ps.mode = 'idle'; dirty = true;
  }

  /* ===== 控件 wiring ===== */
  function seg(id, on) { var b = document.getElementById(id); if (b) b.classList.toggle('on', !!on); }
  function wire() {
    function on(id, ev, fn) { var el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }
    on('btn-stance-left', 'click', function () { S.person.side = 'left'; S.person.backOff = 0; seg('btn-stance-left', true); seg('btn-stance-right', false); sfx('Click'); dirty = true; });
    on('btn-stance-right', 'click', function () { S.person.side = 'right'; S.person.backOff = 0; seg('btn-stance-left', false); seg('btn-stance-right', true); sfx('Click'); dirty = true; });
    on('btn-shoe-normal', 'click', function () { S.shoe = 'normal'; seg('btn-shoe-normal', true); seg('btn-shoe-ice', false); setHint('普通鞋：推车 → 车动'); sfx('Click'); dirty = true; });
    on('btn-shoe-ice', 'click', function () { S.shoe = 'ice'; seg('btn-shoe-normal', false); seg('btn-shoe-ice', true); setHint('滑冰鞋：车自动刹住，人推车反把自己向后推'); sfx('Click'); dirty = true; });
    on('rng-brake', 'input', function (e) { S.brake = parseFloat(e.target.value) || 0; setText('lbl-brake', S.brake.toFixed(1) + 'N'); dirty = true; });
    on('btn-wheel', 'click', function () { S.wheelZoom = !S.wheelZoom; seg('btn-wheel', S.wheelZoom); if (!S.wheelZoom && window.ForceOverlay) ForceOverlay.unregister('dial'); sfx('Click'); dirty = true; });
    on('btn-diagram', 'click', function () {
      S.diagram = !S.diagram;
      if (window.ForceOverlay) ForceOverlay.setOn(S.diagram);
      var b = document.getElementById('btn-diagram'); if (b) b.classList.toggle('on', S.diagram);
      setHint(S.diagram ? '力的示意图：开 — 仅当前活跃交互/事件画矢量（1cm=1N）' : '力的示意图：关 — 全场景不画矢量');
      sfx('Click'); dirty = true;
    });
    on('btn-reset', 'click', function () { resetCar(); setHint('已重置：按住接触点（海绵）左右拖拽 → 推车'); sfx('Click'); });
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

    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (e) { cv.addEventListener(e, onUp); });
    window.addEventListener('resize', resize);
  }

  /* ===== init ===== */
  wire();
  if (window.ForceOverlay) ForceOverlay.setOn(false);
  seg('btn-stance-right', true); seg('btn-shoe-normal', true);
  resize();
  requestAnimationFrame(tick);
})();

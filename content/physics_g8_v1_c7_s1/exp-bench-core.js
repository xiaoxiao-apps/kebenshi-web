/* ============================================================
 * exp-bench-core.js — 场景B（7.2 弹力 + 7.3 重力）侧视实验台  C7V5-R2
 * 规格：设计书 §2 全条。侧视2D；复用 force-overlay.js 门控overlay（悬挂重力矢量）。
 * 物理：弹簧二阶欠阻尼（金属 ζ≈0.2 ωₙ=12）；五档材质 k+弹性限度谱；
 *       胡克 ΔL=F/k（曲线斜率=1/k 或 g/k，非 g）；测力计 G=mg、超量程 clamp 5N。
 * 结构：单一 IIFE；step()/draw()/handlers 函数声明提升，末尾统一 wiring + init。
 * ============================================================ */
(function () {
  'use strict';

  /* ===== 调色板 ===== */
  var PAL = {
    bg: '#e8eef4', floor: '#b9a58d', floorTop: '#cbb89f',
    ramp: '#9fb3c8', rampSide: '#7e93aa',
    stand: '#5b6672', standDark: '#3f4954', standHi: '#828d99',
    weight: '#c2410c', weightDark: '#9a3412', weightHi: '#e0713c',
    rest: '#16a34a', limit: '#dc2626', curve: '#2563eb', over: '#dc2626',
    body: '#f4f6f8', bodyEdge: '#8595a8', needle: '#dc2626', scale: '#334155',
    text: '#28323d', sub: '#6b7885', panel: 'rgba(255,255,255,.94)', grav: '#7c3aed'
  };

  /* ===== 五档材质谱（§2.2 钢k大限度高 > 铁 > 铝k小限度低 > 铅丝限度≈0 > 橡皮泥纯塑性） ===== */
  var MATS = [
    { name: '钢',   k: 2.0,  limitF: 4.5,  zeta: 0.18, p: 0,   color: '#8f9aa6', note: '钢：k 大、弹性限度高' },
    { name: '铁',   k: 1.3,  limitF: 3.2,  zeta: 0.22, p: 0,   color: '#a08d78', note: '铁：k 与限度居中' },
    { name: '铝',   k: 0.7,  limitF: 1.6,  zeta: 0.26, p: 0,   color: '#b9c6d2', note: '铝：k 小、弹性限度低（4块钩码即超限度）' },
    { name: '铅丝', k: 0.35, limitF: 0.05, zeta: 0.9,  p: 0.9, color: '#77808d', note: '铅丝：弹性限度≈0，拉长不回弹（准塑性）' },
    { name: '橡皮泥', k: 0.2, limitF: 0,   zeta: 1.0,  p: 1.0, color: '#d98a5f', note: '橡皮泥：纯塑性，形变完全保留' }
  ];

  /* ===== 物理常量 ===== */
  var GACC = 9.8, BLOCK_KG = 0.05, BLOCK_N = BLOCK_KG * GACC;   // 钩码 50g → 0.49N
  var OMEGA = 12, RANGE = 5, MAXN = 12, FLOW = 6;               // ωₙ=12；量程5N；塑性流动速率

  /* ===== 画布脚手架 ===== */
  var cv = document.getElementById('scene');
  var ctx = cv.getContext('2d');
  var W = 960, H = 540, DPR = 1, dirty = true, lastNow = 0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function setText(id, t) { var el = document.getElementById(id); if (el && el.textContent !== t) el.textContent = t; }
  function setHint(t) { setText('hint', t); }
  function sfx(name) { if (!S.muted && window['play' + name]) { try { window['play' + name](); } catch (e) {} } }
  function seg(id, on) { var b = document.getElementById(id); if (b) b.classList.toggle('on', !!on); }

  /* ===== 布局 L（resize 全量重算） ===== */
  var L = {};
  function layout() {
    var zEl = document.querySelector('.zone');
    var zH = zEl ? zEl.offsetHeight : 0;
    L.floorY = Math.round(H - Math.max(H * 0.12, zH + 14));   // 地面/斜面避开底部控制区
    L.bx0 = Math.round(W * 0.34);
    L.rx = Math.round(W * 0.52);
    L.rw = Math.min(Math.round(W * 0.36), 340);
    L.TH = 15 * Math.PI / 180;
    L.bx1 = L.rx + Math.round(L.rw * 0.42);
    L.byr1 = L.floorY - Math.round((L.bx1 - L.rx) * Math.tan(L.TH));
    L.RH = clamp(Math.round(H * 0.58), 150, 430);            // 巨大铁架台立杆
    L.AW = clamp(Math.round(W * 0.13), 100, 170);            // 横杆
    L.L0 = clamp(Math.round(H * 0.17), 84, 120);             // 弹簧自然长（不能太小）
    L.PXCM = clamp(H * 0.052, 22, 32);                       // 伸长绘制比例 px/cm
    L.wb = clamp(Math.round(H * 0.022), 9, 14);              // 钩码块高
    L.ww = Math.round(L.wb * 2.6);
    L.BL = clamp(Math.round(H * 0.19), 76, 118);             // 测力计筒长
    L.baseW = clamp(Math.round(W * 0.16), 120, 220);
    L.gw = clamp(Math.round(W * 0.30), 185, 280); L.gh = clamp(Math.round(H * 0.33), 140, 205);
    L.gx = W - L.gw - 14; L.gy = 50;
    L.zw = clamp(Math.round(W * 0.46), 250, 380); L.zh = clamp(Math.round(H * 0.76), 300, 480);
    L.zx = Math.round((W - L.zw) / 2); L.zy = Math.round((H - L.zh) / 2) + 4;
  }

  /* ===== 状态 ===== */
  var S = {
    mat: 0, mode: 'spring', tilt: { t: 0, target: 0 },
    sp: { x: 0, v: 0, rest: 0, maxOver: 0 },                // x/rest 单位 cm（rest=永久变形基准下移）
    n: 0, curve: { pts: {}, pending: false, axis: 'F' },
    bal: { r: 0, v: 0, flash: 0, dragF: -1 },
    zoom: false, eye: false, diagram: false, muted: false,
    ps: { mode: 'idle', x: 0, y: 0 }
  };
  window.C7V5_BENCH = S;
  window.C7V5_BENCH_DBG = { hang: hangPt, bottom: bottomY, rest: restY, lay: function () { return L; } };

  /* ===== 几何访问器 ===== */
  function tiltE() { return easeInOut(S.tilt.t); }
  function tiltAng() { return L.TH * tiltE(); }
  function basePt() { var tt = tiltE(); return { x: lerp(L.bx0, L.bx1, tt), y: lerp(L.floorY, L.byr1, tt) }; }
  function topPt() { var b = basePt(), a = tiltAng(); return { x: b.x - L.RH * Math.sin(a), y: b.y - L.RH * Math.cos(a) }; }
  function hangPt() { var t = topPt(), a = tiltAng(); return { x: t.x - L.AW * Math.cos(a), y: t.y + L.AW * Math.sin(a) }; }
  function mat() { return MATS[S.mat]; }
  function limitExt() { return mat().limitF / mat().k; }                 // cm
  function steadyExt(n) {
    var m = mat(), F = n * BLOCK_N;
    if (F <= m.limitF) return F / m.k;                                   // 胡克：ΔL=F/k
    return limitExt() + (F - m.limitF) / m.k * 2.5;                      // 超限度：弯折（更软）
  }
  function springTopY() { return hangPt().y + 6; }
  function restY() { return springTopY() + L.L0 + S.sp.rest * L.PXCM; }  // 回弹基准线（随永久变形下移）
  function limitY() { return restY() + limitExt() * L.PXCM; }            // 弹性限度线
  function bottomY() { return restY() + S.sp.x * L.PXCM; }               // 当前悬挂端
  function stackTopSp() { return bottomY() + 10; }
  function availCm() {                                                 // 钩码堆底不触地的可用伸长（cm）
    return (L.floorY - 16 - (springTopY() + L.L0) - 10 - S.n * L.wb) / L.PXCM;
  }
  function hardMaxX() { return Math.max(-1.8, availCm() - S.sp.rest); } // 并圈硬限位
  function balBodyTop() { return hangPt().y + 12; }
  function balHookY() { return balBodyTop() + L.BL + 8; }
  function weightCOM() {
    var hx = hangPt().x;
    if (S.mode === 'spring') return { x: hx, y: stackTopSp() + S.n * L.wb * 0.5 };
    return { x: hx, y: balHookY() + 6 + S.n * L.wb * 0.5 };
  }

  /* ===== resize ===== */
  function resize() {
    DPR = window.devicePixelRatio || 1;
    var r = cv.getBoundingClientRect();
    W = Math.max(360, Math.round(r.width)); H = Math.max(320, Math.round(r.height));
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layout();
    if (window.ForceOverlay) ForceOverlay.setScale(clamp(Math.round(W * 0.028), 18, 30));
    dirty = true;
  }
  function canvasXY(ev) { var r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }

  /* ===== rAF 单循环 ===== */
  function tick(now) {
    var dt = lastNow ? clamp(now - lastNow, 0, 48) : 16; lastNow = now;
    if (step(dt / 1000, now)) dirty = true;
    if (dirty) { dirty = false; draw(); }
    requestAnimationFrame(tick);
  }

  /* ===== 物理步进 ===== */
  function step(dt, now) {
    var moved = false, m = mat();
    if (S.tilt.t !== S.tilt.target) {
      var d = Math.min(1.4 * dt, Math.abs(S.tilt.target - S.tilt.t));
      S.tilt.t += (S.tilt.target > S.tilt.t ? 1 : -1) * d;
      moved = true;
    }
    if (S.mode === 'spring') {
      var sp = S.sp;
      if (S.ps.mode !== 'spdrag') {
        var target = steadyExt(S.n);
        if (sp.v !== 0 || sp.x !== target) {                             // 欠阻尼二阶回归（金属回弹/过冲）
          var a = OMEGA * OMEGA * (target - sp.x) - 2 * m.zeta * OMEGA * sp.v;
          sp.v += a * dt; sp.x += sp.v * dt; moved = true;
          if (Math.abs(sp.x - target) < 0.002 && Math.abs(sp.v) < 0.02) { sp.x = target; sp.v = 0; }
        }
      }
      var lim = limitExt(), av = availCm();
      if (m.p > 0) {                                                     // 铅丝/橡皮泥：塑性流动，静止基准线跟随
        if (sp.x > lim && sp.rest + sp.x < av) { var f = Math.min(1, FLOW * dt) * (sp.x - lim) * m.p; sp.rest += f; sp.x -= f; moved = true; }
        else if (sp.x < -lim) { var f2 = Math.min(1, FLOW * dt) * (-lim - sp.x) * m.p; sp.rest -= f2; sp.x += f2; moved = true; }
      } else {                                                           // 金属：超限度→回落后永久变形（新基准线下移）
        if (sp.x > lim) { if (sp.x > sp.maxOver) { sp.maxOver = sp.x; moved = true; } }
        else if (sp.maxOver > lim) { sp.rest += (sp.maxOver - lim) * 0.7; sp.maxOver = 0; moved = true; }
      }
      var hm = hardMaxX();
      if (sp.x > hm) { sp.x = hm; if (sp.v > 0) sp.v = 0; moved = true; } // 并圈硬限位：不穿地板
      var tot = sp.rest + sp.x;                                           // 总伸长（含永久）
      var recOk = m.p > 0
        ? (Math.abs(tot - Math.min(steadyExt(S.n), av)) < 0.06 || tot >= av - 0.06)
        : (Math.abs(sp.x - steadyExt(S.n)) < 0.002 && Math.abs(sp.v) < 0.02); // 与snap同阈值：静止后才记录，斜率恒=1/k
      if (S.curve.pending && S.ps.mode !== 'spdrag' && recOk) {
        S.curve.pts[S.n] = tot;                                           // 每勾一块记录总伸长
        S.curve.pending = false; moved = true;
      }
    } else {
      var b = S.bal;
      var tgt = b.dragF >= 0 ? b.dragF : S.n * BLOCK_N;                  // 测力计读数 = G = mg
      if (tgt > RANGE) { b.flash = 0.4; tgt = RANGE; }                   // 超量程 clamp 5N
      if (b.v !== 0 || b.r !== tgt || b.dragF >= 0) {
        var a2 = OMEGA * OMEGA * (tgt - b.r) - 2 * 0.2 * OMEGA * b.v;    // 指针 ζ=0.2 ωₙ=12（回零过冲）
        b.v += a2 * dt; b.r += b.v * dt; moved = true;
        if (Math.abs(b.r - tgt) < 0.002 && Math.abs(b.v) < 0.02) { b.r = tgt; b.v = 0; }
      }
      if (b.flash > 0) { b.flash -= dt; moved = true; }
    }
    if (window.ForceOverlay) {                                           // 门控：悬挂重力矢量@重心向下
      if (ForceOverlay.isOn() && S.n > 0 && !S.zoom) {
        var c = weightCOM(), Gn = S.n * BLOCK_N;
        ForceOverlay.register('hangG', { point: c, dir: { x: 0, y: 1 }, magN: Gn, color: PAL.grav, label: 'G=' + Gn.toFixed(2) + 'N' });
        moved = true;
      } else ForceOverlay.unregister('hangG');
    }
    return moved;
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
  function dashLine(x0, y0, x1, y1, color, dash) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.setLineDash(dash || [7, 5]);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
  }
  function txt(t, x, y, color, size, align) {
    ctx.save(); ctx.fillStyle = color || PAL.text;
    ctx.font = '600 ' + (size || 11) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(t, x, y); ctx.restore();
  }
  function coil(x, y0, y1, sw, color, lw) {                             // 弹簧（锯齿线圈）
    var n = 9, seg = (y1 - y0 - 12) / n;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw || 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + 6);
    for (var i = 0; i < n; i++) {
      var ya = y0 + 6 + i * seg, yb = ya + seg;
      ctx.lineTo(x + (i % 2 ? -sw / 2 : sw / 2), (ya + yb) / 2);
      ctx.lineTo(x, yb);
    }
    ctx.lineTo(x, y1); ctx.stroke(); ctx.restore();
  }

  /* ===== 地面 + 斜面（§2.1） ===== */
  function drawGround() {
    ctx.fillStyle = PAL.bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = PAL.floor; ctx.fillRect(0, L.floorY, W, H - L.floorY);
    ctx.fillStyle = PAL.floorTop; ctx.fillRect(0, L.floorY, W, 4);
    var t = tiltE();
    if (t > 0.02) {
      ctx.save(); ctx.globalAlpha = Math.min(1, t * 1.6);
      var rise = L.rw * Math.tan(L.TH);
      ctx.fillStyle = PAL.ramp;
      ctx.beginPath(); ctx.moveTo(L.rx, L.floorY); ctx.lineTo(L.rx + L.rw, L.floorY - rise);
      ctx.lineTo(L.rx + L.rw, L.floorY); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = PAL.rampSide; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(L.rx, L.floorY); ctx.lineTo(L.rx + L.rw, L.floorY - rise); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      ctx.beginPath(); ctx.moveTo(L.rx + L.rw * 0.55, L.floorY - rise * 0.42);
      ctx.lineTo(L.rx + L.rw * 0.9, L.floorY - rise * 0.82); ctx.lineTo(L.rx + L.rw * 0.9, L.floorY - rise * 0.42);
      ctx.closePath(); ctx.fill();
      txt('斜面', L.rx + L.rw * 0.5, L.floorY - rise * 0.25, PAL.standDark, 12, 'center');
      ctx.restore();
    }
  }

  /* ===== 巨大铁架台（底座+立杆+横杆，整体随斜面倾） ===== */
  function drawStand() {
    var b = basePt(), a = tiltAng();
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(-a);
    ctx.fillStyle = PAL.standDark; rr(-L.baseW / 2, -7, L.baseW, 14, 4); ctx.fill();
    ctx.fillStyle = PAL.stand; rr(-L.baseW / 2 + 8, -11, L.baseW - 16, 6, 3); ctx.fill();
    ctx.strokeStyle = PAL.stand; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -L.RH); ctx.stroke();
    ctx.strokeStyle = PAL.standHi; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-2.5, -12); ctx.lineTo(-2.5, -L.RH + 4); ctx.stroke();
    ctx.strokeStyle = PAL.stand; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(2, -L.RH + 4); ctx.lineTo(-L.AW, -L.RH + 4); ctx.stroke();
    ctx.fillStyle = PAL.standDark; circ(-L.AW, -L.RH + 4, 7); ctx.fill();
    ctx.fillStyle = PAL.standHi; circ(-L.AW, -L.RH + 4, 3); ctx.fill();
    ctx.restore();
  }

  /* ===== 钩码堆 ===== */
  function drawWeights(hx, topY, n, wb) {
    for (var i = 0; i < n; i++) {
      var y = topY + i * wb, w = L.ww * (1 - i * 0.015);
      ctx.fillStyle = PAL.weight; rr(hx - w / 2, y, w, wb - 1, 2.5); ctx.fill();
      ctx.strokeStyle = PAL.weightDark; ctx.lineWidth = 1; rr(hx - w / 2, y, w, wb - 1, 2.5); ctx.stroke();
      ctx.fillStyle = PAL.weightHi; ctx.fillRect(hx - w / 2 + 3, y + 2, w - 6, 1.6);
    }
    if (n > 0) txt(n + '×50g', hx + L.ww / 2 + 8, topY + n * wb / 2, PAL.sub, 11);
  }

  /* ===== 弹簧悬挂（五档材质 + 双基准线）（§2.2/§2.3/§2.4） ===== */
  function drawSpringHang() {
    var h = hangPt(), hx = h.x, y0 = springTopY(), y1 = bottomY(), m = mat();
    ctx.fillStyle = PAL.standDark; rr(hx - 16, y0 - 6, 32, 8, 3); ctx.fill();
    coil(hx, y0, y1, 30, m.color, m.p >= 1 ? 6 : 4.5);
    ctx.fillStyle = PAL.standDark; rr(hx - 15, y1, 30, 6, 2); ctx.fill();          // 悬挂托盘
    ctx.strokeStyle = PAL.standDark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hx, y1 + 6); ctx.lineTo(hx, y1 + 10); ctx.stroke();
    drawWeights(hx, stackTopSp(), S.n, L.wb);
    // 双基准线：回弹线（绿）+ 弹性限度线（红）；铅丝两线≈重合；橡皮泥隐藏限度线标"塑性"
    var lx0 = Math.max(6, hx - 74), lx1 = hx + 96;
    dashLine(lx0, restY(), lx1, restY(), PAL.rest, [8, 5]);
    var restLbl = '回弹基准线' + (S.sp.rest > 0.05 ? '（已下移 ' + S.sp.rest.toFixed(2) + 'cm）' : '');
    txt(restLbl, lx1 + 5, restY(), PAL.rest, 10.5);
    if (S.mat === 4) {
      txt('塑性 · 无回弹（两线合并）', lx1 + 5, restY() + 14, PAL.limit, 10.5);
    } else {
      dashLine(lx0, limitY(), lx1, limitY(), PAL.limit, [4, 4]);
      txt(S.mat === 3 ? '弹性限度线 ≈ 静止线' : '弹性限度线', lx1 + 5, limitY(), PAL.limit, 10.5);
    }
    txt('ΔL = ' + (S.sp.rest + S.sp.x).toFixed(2) + ' cm', lx0, y1 - 12, PAL.sub, 11, 'left');
  }

  /* ===== 测力计（场景小图）（§2.5） ===== */
  function drawBalanceHang() {
    var h = hangPt(), hx = h.x, bt = balBodyTop(), bw = 36, b = S.bal;
    ctx.strokeStyle = PAL.standDark; ctx.lineWidth = 3;
    circ(hx, bt - 6, 6); ctx.stroke();                                            // 吊环
    ctx.fillStyle = PAL.body; rr(hx - bw / 2, bt, bw, L.BL, 7); ctx.fill();
    var flashing = b.flash > 0 && Math.floor(b.flash * 10) % 2 === 0;
    ctx.strokeStyle = flashing ? PAL.limit : PAL.bodyEdge; ctx.lineWidth = flashing ? 3.5 : 2;
    rr(hx - bw / 2, bt, bw, L.BL, 7); ctx.stroke();
    var sTop = bt + 10, sLen = L.BL - 24;
    ctx.strokeStyle = PAL.scale; ctx.lineWidth = 1.4;
    for (var i = 0; i <= 10; i++) {
      var y = sTop + sLen * i / 10, major = i % 2 === 0;
      ctx.beginPath(); ctx.moveTo(hx - bw / 2 + 3, y); ctx.lineTo(hx - bw / 2 + (major ? 12 : 8), y); ctx.stroke();
      if (major) txt(String(i / 2), hx + bw / 2 - 6, y, PAL.scale, 9, 'right');
    }
    var py = sTop + sLen * clamp(b.r, 0, RANGE) / RANGE;
    ctx.strokeStyle = PAL.needle; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(hx - bw / 2 + 3, py); ctx.lineTo(hx + bw / 2 - 14, py); ctx.stroke();
    ctx.fillStyle = PAL.needle;
    ctx.beginPath(); ctx.moveTo(hx + bw / 2 - 14, py); ctx.lineTo(hx + bw / 2 - 20, py - 3.4);
    ctx.lineTo(hx + bw / 2 - 20, py + 3.4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = PAL.bodyEdge; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(hx, bt + L.BL); ctx.lineTo(hx, bt + L.BL + 8);
    ctx.arc(hx + 3, bt + L.BL + 9, 3.4, Math.PI, 0, true); ctx.stroke();          // 挂钩
    drawWeights(hx, balHookY() + 6, S.n, L.wb);
    var G = S.n * BLOCK_N;
    txt('G = mg = ' + G.toFixed(2) + ' N', hx + bw / 2 + 12, bt + 14, PAL.text, 12);
    if (b.flash > 0) txt('超量程！clamp 5N', hx + bw / 2 + 12, bt + 32, PAL.limit, 11.5);
  }

  /* ===== 伸长量曲线图 ΔL vs F（斜率=1/k 或 g/k，非 g）（§2.4） ===== */
  function drawGraph() {
    var gx = L.gx, gy = L.gy, gw = L.gw, gh = L.gh, m = mat();
    ctx.save();
    ctx.fillStyle = PAL.panel; rr(gx, gy, gw, gh, 10); ctx.fill();
    ctx.strokeStyle = '#d7dee6'; ctx.lineWidth = 1; rr(gx, gy, gw, gh, 10); ctx.stroke();
    txt('伸长量曲线（限度内：ΔL ∝ F）', gx + 10, gy + 14, PAL.text, 11.5);
    var ax = gx + 34, ay = gy + gh - 44, aw = gw - 52, ah = gh - 68;
    var fAxis = S.curve.axis === 'F';
    var maxN = 1; for (var k in S.curve.pts) maxN = Math.max(maxN, +k);
    var xmax = Math.max(1.2, (maxN + 1) * BLOCK_N * 1.1);
    if (!fAxis) xmax = xmax / GACC;
    var ymax = 1; for (var k2 in S.curve.pts) ymax = Math.max(ymax, S.curve.pts[k2] * 1.25);
    ctx.strokeStyle = PAL.text; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(ax, gy + 26); ctx.lineTo(ax, ay); ctx.lineTo(ax + aw + 8, ay); ctx.stroke();
    txt(fAxis ? 'F/N' : 'm/kg', ax + aw + 6, ay + 12, PAL.sub, 10, 'right');
    txt('ΔL/cm', ax + 5, gy + 32, PAL.sub, 10);
    var limF = m.limitF, limX = fAxis ? limF : limF / GACC;
    if (limX > 0 && limX < xmax) {
      var lxp = ax + aw * clamp(limX / xmax, 0, 1);
      dashLine(lxp, ay, lxp, ay - ah, PAL.limit, [4, 4]);
      txt('限度', lxp + 3, ay - ah + 6, PAL.limit, 9.5);
    }
    var keys = Object.keys(S.curve.pts).map(Number).sort(function (p, q) { return p - q; });
    ctx.beginPath(); ctx.moveTo(ax, ay);
    var lastIn = null;
    for (var i = 0; i < keys.length; i++) {
      var n = keys[i], F = n * BLOCK_N, xv = fAxis ? F : n * BLOCK_KG;
      var px = ax + aw * clamp(xv / xmax, 0, 1), py = ay - ah * clamp(S.curve.pts[n] / ymax, 0, 1);
      ctx.lineTo(px, py);
      if (F <= limF && limF > 0) lastIn = { n: n, ext: S.curve.pts[n] };
    }
    ctx.strokeStyle = PAL.curve; ctx.lineWidth = 2.2; ctx.stroke();
    for (var j = 0; j < keys.length; j++) {
      var n2 = keys[j], F2 = n2 * BLOCK_N, xv2 = fAxis ? F2 : n2 * BLOCK_KG;
      var px2 = ax + aw * clamp(xv2 / xmax, 0, 1), py2 = ay - ah * clamp(S.curve.pts[n2] / ymax, 0, 1);
      ctx.fillStyle = F2 > limF ? PAL.over : PAL.curve; circ(px2, py2, 3.2); ctx.fill();
    }
    var sy = gy + gh - 24, slopeT;
    if (lastIn) {
      if (fAxis) slopeT = '斜率 ΔL/F = 1/k = ' + (lastIn.ext / (lastIn.n * BLOCK_N)).toFixed(2) + ' cm/N（非 g）';
      else slopeT = '斜率 ΔL/m = g/k = ' + (lastIn.ext / (lastIn.n * BLOCK_KG)).toFixed(2) + ' cm/kg';
    } else slopeT = 'k = ' + m.k + ' N/cm · 加钩码记录点';
    txt(slopeT, gx + 10, sy, lastIn ? PAL.text : PAL.sub, 11);
    if (keys.length && keys[keys.length - 1] * BLOCK_N > limF)
      txt('超限度：曲线弯折 + 永久变形', gx + 10, sy - 15, PAL.over, 10.5);
    ctx.restore();
  }

  /* ===== 测力计放大（标准组件）+ 观察眼（视差）（§2.6/§2.7） ===== */
  function drawEyeIcon(x, y, color) {
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 13, y); ctx.quadraticCurveTo(x, y - 9, x + 13, y);
    ctx.quadraticCurveTo(x, y + 9, x - 13, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color; circ(x, y, 3.6); ctx.fill(); ctx.restore();
  }
  function drawZoom() {
    var zx = L.zx, zy = L.zy, zw = L.zw, zh = L.zh, cx = zx + zw / 2, b = S.bal;
    ctx.save();
    ctx.shadowColor = 'rgba(20,30,45,.3)'; ctx.shadowBlur = 18;
    ctx.fillStyle = PAL.panel; rr(zx, zy, zw, zh, 14); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#c6d0da'; ctx.lineWidth = 1.4; rr(zx, zy, zw, zh, 14); ctx.stroke();
    txt('测力计放大 · 标准组件', zx + 14, zy + 18, PAL.text, 12.5);
    var ringY = zy + 44, bodyTop = ringY + 16, bodyH = zh - 190, bw = 64;
    ctx.strokeStyle = PAL.standDark; ctx.lineWidth = 4; circ(cx, ringY, 9); ctx.stroke();
    txt('吊环', cx + 16, ringY, PAL.sub, 11);
    ctx.fillStyle = PAL.bodyEdge; rr(cx - 9, bodyTop - 8, 18, 8, 2); ctx.fill();
    txt('调零螺丝', cx - 16, bodyTop - 4, PAL.sub, 11, 'right');
    ctx.fillStyle = PAL.body; rr(cx - bw / 2, bodyTop, bw, bodyH, 9); ctx.fill();
    var flashing = b.flash > 0 && Math.floor(b.flash * 10) % 2 === 0;
    ctx.strokeStyle = flashing ? PAL.limit : PAL.bodyEdge; ctx.lineWidth = flashing ? 4 : 2.4;
    rr(cx - bw / 2, bodyTop, bw, bodyH, 9); ctx.stroke();
    coil(cx, bodyTop + 8, bodyTop + bodyH * 0.42, 20, '#8f9aa6', 3);
    txt('弹簧', cx + bw / 2 + 8, bodyTop + bodyH * 0.25, PAL.sub, 11);
    var sTop = bodyTop + bodyH * 0.46, sLen = bodyH * 0.48;
    ctx.strokeStyle = PAL.scale; ctx.lineWidth = 1.6;
    for (var i = 0; i <= 25; i++) {
      var y = sTop + sLen * i / 25, major = i % 5 === 0;
      ctx.beginPath(); ctx.moveTo(cx - bw / 2 + 5, y); ctx.lineTo(cx - bw / 2 + (major ? 20 : 12), y); ctx.stroke();
      if (major) txt((i / 5).toFixed(0), cx + bw / 2 - 8, y, PAL.scale, 11, 'right');
    }
    txt('刻度', cx + bw / 2 + 8, sTop + 4, PAL.sub, 11);
    var py = sTop + sLen * clamp(b.r, 0, RANGE) / RANGE;
    ctx.strokeStyle = PAL.needle; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(cx - bw / 2 + 5, py); ctx.lineTo(cx + bw / 2 - 24, py); ctx.stroke();
    ctx.fillStyle = PAL.needle;
    ctx.beginPath(); ctx.moveTo(cx + bw / 2 - 24, py); ctx.lineTo(cx + bw / 2 - 33, py - 5);
    ctx.lineTo(cx + bw / 2 - 33, py + 5); ctx.closePath(); ctx.fill();
    txt('指针', cx + bw / 2 + 8, py < sTop + 22 ? py + 16 : py, PAL.needle, 11);
    txt('N', cx - bw / 2 + 8, sTop - 8, PAL.sub, 10);
    var hookY = bodyTop + bodyH;
    ctx.strokeStyle = PAL.bodyEdge; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(cx, hookY); ctx.lineTo(cx, hookY + 12);
    ctx.arc(cx + 5, hookY + 14, 5.5, Math.PI, 0, true); ctx.stroke();
    txt('挂钩', cx + 20, hookY + 10, PAL.sub, 11);
    var wtop = hookY + 22, wbz = Math.min(L.wb, Math.max(5, (zy + zh - 30 - wtop) / Math.max(1, S.n)));
    drawWeights(cx, wtop, S.n, wbz);
    txt('读数 G = ' + clamp(b.r, 0, RANGE).toFixed(2) + ' N', zx + zw - 14, zy + 18, PAL.text, 12.5, 'right');
    if (b.flash > 0) txt('超量程 clamp 5N', zx + zw - 14, zy + 36, PAL.limit, 11.5, 'right');
    if (S.eye) drawZoomEye(cx, py, hookY, b.r);
    ctx.restore();
  }
  function drawZoomEye(cx, py, hookY, r) {
    var tipX = cx + 30, eyeY = Math.min(py + 96, L.zy + L.zh - 44);
    var wrong = clamp(r + 0.07, 0, RANGE), pyW = py + 13;
    ctx.save();
    ctx.setLineDash([5, 4]); ctx.lineWidth = 1.8;
    ctx.strokeStyle = PAL.rest;
    ctx.beginPath(); ctx.moveTo(tipX, eyeY - 10); ctx.lineTo(tipX, py + 2); ctx.stroke();
    ctx.strokeStyle = PAL.over;
    ctx.beginPath(); ctx.moveTo(tipX - 92, eyeY - 10); ctx.lineTo(tipX, pyW); ctx.stroke();
    ctx.setLineDash([]);
    drawEyeIcon(tipX, eyeY, PAL.rest);
    drawEyeIcon(tipX - 92, eyeY, PAL.over);
    ctx.strokeStyle = PAL.over; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tipX - 5, pyW - 5); ctx.lineTo(tipX + 5, pyW + 5);
    ctx.moveTo(tipX + 5, pyW - 5); ctx.lineTo(tipX - 5, pyW + 5); ctx.stroke();
    txt('⊥ 垂直正读 ' + clamp(r, 0, RANGE).toFixed(2) + 'N ✓', tipX + 10, eyeY - 24, PAL.rest, 11);
    txt('斜视错读 ≈ ' + wrong.toFixed(2) + 'N ✗（视差）', tipX - 96, eyeY - 24, PAL.over, 11, 'right');
    ctx.restore();
  }

  /* ===== 主绘制 ===== */
  function draw() {
    drawGround();
    drawStand();
    if (S.mode === 'spring') drawSpringHang(); else drawBalanceHang();
    if (S.mode === 'spring' && !S.zoom) drawGraph();
    if (S.zoom && S.mode === 'balance') drawZoom();
    if (window.ForceOverlay) ForceOverlay.draw(ctx, { w: W, h: H });
  }

  /* ===== pointer 状态机（拖悬挂物：按压/拉伸 或 拉测力计钩） ===== */
  function onDown(ev) {
    if (S.zoom) return;
    var p = canvasXY(ev), hx = hangPt().x;
    if (S.mode === 'spring') {
      var top = bottomY() - 26, bot = stackTopSp() + S.n * L.wb + 16;
      if (Math.abs(p.x - hx) < 40 && p.y >= top && p.y <= bot) {
        S.ps.mode = 'spdrag';
        if (cv.setPointerCapture && ev.pointerId != null) { try { cv.setPointerCapture(ev.pointerId); } catch (e) {} }
        setHint(mat().note + ' — 拖过红色限度线试试');
        ev.preventDefault(); dirty = true;
      }
    } else {
      var hk = balHookY(), btop = hk - 20, bbot = hk + 6 + S.n * L.wb + 18;
      if (Math.abs(p.x - hx) < 40 && p.y >= btop && p.y <= bbot) {
        S.ps.mode = 'bdrag'; S.bal.dragF = clamp(S.bal.r, 0, 8);
        if (cv.setPointerCapture && ev.pointerId != null) { try { cv.setPointerCapture(ev.pointerId); } catch (e) {} }
        setHint('下拉挂钩：读数=拉力；超过 5N 量程 → 红闪 clamp');
        ev.preventDefault(); dirty = true;
      }
    }
  }
  function onMove(ev) {
    var p = canvasXY(ev);
    if (S.ps.mode === 'spdrag') {
      S.sp.x = clamp((p.y - restY()) / L.PXCM, -1.8, hardMaxX()); S.sp.v = 0; dirty = true; ev.preventDefault();
    } else if (S.ps.mode === 'bdrag') {
      S.bal.dragF = clamp((p.y - balHookY()) / (L.PXCM * 0.7), 0, 8); dirty = true; ev.preventDefault();
    }
  }
  function onUp() {
    if (S.ps.mode === 'spdrag')
      setHint(S.sp.rest > 0.05 ? '超过弹性限度 → 永久变形：新静止基准线已下移' : '限度内 → 回弹到绿色基准线（弹性）');
    if (S.ps.mode === 'bdrag') { S.bal.dragF = -1; setHint('松手：指针回零，欠阻尼过冲（ζ=0.2 ωₙ=12）'); }
    S.ps.mode = 'idle'; dirty = true;
  }

  /* ===== 钩码增减 ===== */
  function setN(delta) {
    var nn = clamp(S.n + delta, 0, MAXN);
    if (nn === S.n) { if (delta > 0) setHint('最多 ' + MAXN + ' 块（测力计早已超量程红闪）'); return; }
    S.n = nn; setText('lbl-w', S.n + '块');
    if (S.mode === 'spring') {
      if (delta > 0) { S.curve.pending = true; }
      else { for (var k in S.curve.pts) if (+k > S.n) delete S.curve.pts[k]; S.curve.pending = false; }
      setHint('G = ' + S.n + '×0.49 = ' + (S.n * BLOCK_N).toFixed(2) + 'N — 曲线记录 ΔL（斜率=1/k，非 g）');
    } else {
      var G = S.n * BLOCK_N;
      setHint(G > RANGE ? 'G=' + G.toFixed(2) + 'N 超过量程 5N → 红闪 clamp（会损坏测力计！）'
        : '读数 G = mg = ' + G.toFixed(2) + ' N（指针欠阻尼摆动）');
    }
    sfx('Click'); dirty = true;
  }

  /* ===== 控件 wiring ===== */
  function wire() {
    function on(id, ev, fn) { var el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }
    on('btn-flat', 'click', function () { S.tilt.target = 0; seg('btn-flat', true); seg('btn-tilt', false); sfx('Click'); setHint('铁架台回到水平桌面'); dirty = true; });
    on('btn-tilt', 'click', function () { S.tilt.target = 1; seg('btn-flat', false); seg('btn-tilt', true); sfx('Click'); setHint('架倾斜，悬挂物仍世界竖直 → 重力方向竖直向下'); dirty = true; });
    on('btn-spring', 'click', function () {
      S.mode = 'spring'; S.zoom = false; S.eye = false;
      seg('btn-spring', true); seg('btn-balance', false); seg('btn-zoom', false); seg('btn-eye', false);
      sfx('Click'); setHint('挂点：弹簧 — 拖悬挂物或加钩码看 ΔL'); dirty = true;
    });
    on('btn-balance', 'click', function () {
      S.mode = 'balance';
      seg('btn-spring', false); seg('btn-balance', true);
      sfx('Click'); setHint('挂点：测力计 — 加钩码读 G=mg，可下拉挂钩'); dirty = true;
    });
    on('rng-mat', 'input', function (e) {
      S.mat = clamp(parseInt(e.target.value, 10) || 0, 0, 4);
      S.sp = { x: 0, v: 0, rest: 0, maxOver: 0 }; S.curve.pts = {}; S.curve.pending = false;
      setText('lbl-mat', mat().name); setHint(mat().note); dirty = true;
    });
    on('btn-w-minus', 'click', function () { setN(-1); });
    on('btn-w-plus', 'click', function () { setN(1); });
    on('btn-axis-f', 'click', function () { S.curve.axis = 'F'; seg('btn-axis-f', true); seg('btn-axis-m', false); sfx('Click'); dirty = true; });
    on('btn-axis-m', 'click', function () { S.curve.axis = 'm'; seg('btn-axis-f', false); seg('btn-axis-m', true); sfx('Click'); setHint('横轴 m(kg)：斜率 = g/k（含 g）；横轴 F(N)：斜率 = 1/k'); dirty = true; });
    on('btn-zoom', 'click', function () {
      if (S.mode !== 'balance') { setHint('先把挂点切换到「测力计」再放大'); return; }
      S.zoom = !S.zoom; if (!S.zoom) S.eye = false;
      seg('btn-zoom', S.zoom); seg('btn-eye', S.eye); sfx('Click');
      setHint(S.zoom ? '放大视图：吊环/调零螺丝/弹簧/刻度/指针/挂钩' : '');
      dirty = true;
    });
    on('btn-eye', 'click', function () {
      if (!S.zoom) { setHint('先按「🔍 测力计放大」再观察读数视线'); return; }
      S.eye = !S.eye; seg('btn-eye', S.eye); sfx('Click');
      setHint(S.eye ? '绿色⊥虚线=垂直正读；红色斜线=斜视错读（视差）' : '');
      dirty = true;
    });
    on('btn-diagram', 'click', function () {
      S.diagram = !S.diagram;
      if (window.ForceOverlay) ForceOverlay.setOn(S.diagram);
      seg('btn-diagram', S.diagram);
      setHint(S.diagram ? '力的示意图 ON：悬挂重物时画重力矢量（@重心 竖直向下）' : '力的示意图 OFF：全场景无矢量');
      sfx('Click'); dirty = true;
    });
    on('btn-reset', 'click', function () {
      S.n = 0; setText('lbl-w', '0块');
      S.sp = { x: 0, v: 0, rest: 0, maxOver: 0 };
      S.bal = { r: 0, v: 0, flash: 0, dragF: -1 };
      S.curve.pts = {}; S.curve.pending = false;
      S.tilt.target = 0; S.zoom = false; S.eye = false;
      seg('btn-flat', true); seg('btn-tilt', false); seg('btn-zoom', false); seg('btn-eye', false);
      if (window.ForceOverlay) ForceOverlay.clear();
      setHint('已重置：拖悬挂物按压/拉伸，或逐块加钩码'); sfx('Click'); dirty = true;
    });
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
  seg('btn-spring', true); seg('btn-flat', true); seg('btn-axis-f', true);
  setText('lbl-mat', MATS[0].name); setText('lbl-w', '0块');
  resize();
  requestAnimationFrame(tick);
})();

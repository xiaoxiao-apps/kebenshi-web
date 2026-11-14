/* ============================================================
 * exp-road-core.js — 场景A（7.1 力）侧视马路  C7V5-R9
 * R9 修订：P1 贝塞尔写实卡通小人(头/发/脸/颈/躯干/臂手/弯膝腿/鞋+shading衣纹)；P2 车缩至0.24W；
 * P3 手臂以肩为轴臂长恒定(单关节IK)够得着才搭手；P4 刹车=竖直滑道+踏板滑钮；
 * P5 护坡参照坝体剖面(棕土坡+灰护面+正常高水位水平线截坡)；P7 轮滑鞋=一排滚轮+轮架醒目配色；
 * P8 左推/右推按钮·只推不拉·人站哪侧只能向另一侧推；P9 方向盘力先行(切向矢量→克服静阻力→扭矩+惯性+阻尼)；
 * P10 海绵米色多孔+标签；P11 动作触发语音(speechSynthesis zh-CN, 新动作打断旧, 尊重静音)。
 * 力的示意图经 force-overlay.js 门控（开=仅活跃交互画矢量；关=全场景无）。
 * ============================================================ */
(function () {
  'use strict';

  /* ===== 调色板 ===== */
  var PAL = {
    grass1: '#8bc34a', grass2: '#558b2f', asphalt: '#42474e', asphaltTop: '#5b616b', lane: '#e8b62c',
    dirt: '#9c7a50', dirtDark: '#7d6040', lining: '#9aa3ab', liningDark: '#77828c',
    water1: '#5aa7e0', water2: '#2b6fae', foam: 'rgba(255,255,255,.55)',
    car: '#d64545', carTop: '#e05555', carBot: '#b03030', carGlass: '#bfe3f2', wheel: '#2b2f36', rim: '#c7ced6',
    skin: '#f0c08a', skinSh: '#d9a066', hair: '#5a3d26', cloth: '#3f6fb5', clothSh: '#2f568f', pants: '#37474f',
    shoe: '#5b4636', skate: '#ff9f1c', skateDark: '#b36a00', ice: '#bfe6f5',
    sponge: '#f6e3a8', spongeDark: '#d3b063', spongeHole: '#e2c988',
    text: '#28323d', sub: '#6b7885', bar: '#e2e8f0', thrust: '#dc2626', speed: '#2563eb'
  };

  /* ===== 物理常量（力→加速度，非速度） ===== */
  var M = 1.2, A_SCALE = 55, F_MAX = 10, FRIC = 130, BRAKE_SCALE = 55, BRAKE_MAX = 10;
  var V_MAX = 500, G_SLOPE = 620, ICE_K = 34, ICE_FRIC = 90, DIAL_FMAX = 6, WEIGHT_N = M * 9.8;
  var DIAL_FRES = 1.0, DIAL_KT = 5.5;                                           // P9：静态阻力阈值 + 扭矩系数

  /* ===== 画布脚手架 ===== */
  var cv = document.getElementById('scene');
  var ctx = cv.getContext('2d');
  var W = 960, H = 540, DPR = 1, dirty = true, lastNow = 0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function setText(id, t) { var el = document.getElementById(id); if (el && el.textContent !== t) el.textContent = t; }
  function sfx(name) { if (!S.muted && window['play' + name]) { try { window['play' + name](); } catch (e) {} } }
  function speak(t) {                                                           // P11：点哪播哪，新句打断旧句，尊重静音
    if (S.muted || !window.speechSynthesis) return;
    try {
      var u = new SpeechSynthesisUtterance(t);
      u.lang = 'zh-CN'; u.rate = 1.02;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* ===== 布局 L（resize 全量重算） ===== */
  var L = {};
  function layout() {
    L.roadTop = Math.round(H * 0.58);
    L.roadH = Math.max(26, Math.round(H * 0.06));
    L.roadBot = L.roadTop + L.roadH;
    L.roadLeft = 30;
    L.slopeX = Math.round(W - Math.max(200, W * 0.26));
    L.toeX = W - 20;                                                            // P5：坝体剖面——坡脚
    L.pondY = Math.round(H * 0.80);                                             // 正常高水位（水平线）
    L.pondBottom = H - 12;
    L.bumpA = Math.max(3, Math.round(H * 0.008));
    L.personH = Math.max(96, Math.round(H * 0.30 * clamp(W / 700, 0.62, 1)));    // 窄屏按比例收小人，保人车比例
    L.armLen = Math.round(L.personH * 0.36);
    L.pushK = F_MAX / Math.max(10, L.personH * 0.30);
    L.carW = clamp(Math.round(W * 0.24), 118, Math.round(H * 0.44));            // P2：车稍缩小
    L.carH = Math.round(L.carW * 0.42);
    L.wheelR = Math.round(L.carH * 0.30);
    L.homeX = L.roadLeft + L.carW * 0.5 + Math.round((L.slopeX - L.roadLeft - L.carW) * 0.32);
    L.shoreX = L.slopeX - Math.round(L.personH * 0.16);
    L.waterX = L.toeX;                                                          // P5：水位线与坡面交点
    for (var x = L.slopeX; x <= L.toeX; x += 4) { if (groundY(x) >= L.pondY) { L.waterX = x; break; } }
    L.gh = 38;
    var gy0 = W < 640 ? 112 : 44;                                               // 窄屏：仪表下移让出顶部提示
    if (W >= 660) { L.gw = clamp(Math.round((W - 48) / 2), 220, 430); L.g1 = { x: 16, y: gy0, w: L.gw }; L.g2 = { x: 32 + L.gw, y: gy0, w: L.gw }; }
    else { L.gw = W - 32; L.g1 = { x: 16, y: gy0, w: L.gw }; L.g2 = { x: 16, y: gy0 + L.gh + 32, w: L.gw }; }
    L.pedalW = W < 430 ? 58 : 68;
    L.pedal = { x: W - L.pedalW - 40, y: Math.round(H * (W < 640 ? 0.36 : 0.30)), w: L.pedalW, h: Math.max(120, Math.round(H * 0.32)) };  // P4：竖直滑道
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
    pushDir: 'left',                                                            // P8：左推(人在车左→推向右) / 右推
    shoe: 'normal', brake: 0, brakeSaved: 0, wheelZoom: false,
    dial: { angle: 0, omega: 0, drag: null, F: 0, Ft: 0, tan: null, pt: null, msg: '' },
    diagram: false, muted: false,
    sw: null,
    ps: { mode: 'idle', x: 0, y: 0, downX: 0, downY: 0, moved: 0 }
  };
  window.C7V5_ROAD = S;

  /* ===== 地形（P5 坝体剖面护坡）+ 几何访问器 ===== */
  function groundY(x) {
    if (x <= L.slopeX) return L.roadTop;
    if (x >= L.toeX) return L.pondBottom;
    var t = (x - L.slopeX) / Math.max(1, L.toeX - L.slopeX);
    var s = t * t * (3 - 2 * t);                                                // 平滑坡面（坝体剖面感）
    var y = L.roadTop + (L.pondBottom - L.roadTop) * (t * 0.55 + s * 0.45);
    y += Math.sin(t * Math.PI * 5) * L.bumpA * (1 - t * 0.55);                  // 轻微起伏（碰撞减速源）
    return y;
  }
  function dirS() { return S.pushDir === 'left' ? 1 : -1; }                     // 推向：左推=车向+x
  function shoulderPt() {                                                       // 推车姿态屈膝沉肩，手才够得着车面
    var ph = L.personH, crouch = (S.push.active && S.push.F > 0.05 && S.car.mode === 'road') ? 0.60 : 0.66;
    return { x: S.person.x + dirS() * ph * 0.055, y: L.roadTop - ph * crouch };
  }
  function comPoint() { return { x: S.car.x, y: L.roadTop + S.car.y - L.carH * 0.72 }; }
  function contactPoint() {                                                     // P3：肩为轴·臂长恒定——够得着搭手，够不着自然前伸
    var sh = shoulderPt(), d = dirS(), faceX = S.car.x - d * L.carW * 0.5;
    var dx = (faceX - sh.x) * d;
    var faceTop = L.roadTop + S.car.y - L.carH * 0.88, faceBot = L.roadTop + S.car.y - L.carH * 0.10;
    if (dx < L.armLen) return { x: faceX - d * 3, y: clamp(sh.y + Math.sqrt(Math.max(4, L.armLen * L.armLen - dx * dx)), faceTop, faceBot) };
    return { x: sh.x + d * L.armLen * 0.88, y: sh.y + L.armLen * 0.47 };
  }
  function reachPen() {                                                         // 手(肩+臂长)压到车面多深 → 推力
    if (S.car.mode !== 'road') return -1;
    var faceX = S.car.x - dirS() * L.carW * 0.5;
    return L.armLen - (faceX - shoulderPt().x) * dirS();
  }
  function clampPersonX(x) {
    var d = dirS(), min = L.roadLeft + 12, max = L.shoreX;
    if (S.car.mode === 'road') {
      if (d > 0) max = Math.min(L.shoreX, S.car.x - L.carW * 0.5 - L.personH * 0.05);
      else { min = S.car.x + L.carW * 0.5 + L.personH * 0.05; max = L.slopeX - L.personH * 0.10; }
    }
    return clamp(x, min, Math.max(min, max));
  }
  function personHome() {
    var d = dirS();
    return clampPersonX(S.car.x - d * (L.carW * 0.5 + L.armLen + L.personH * 0.12));
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
    S.person.x = personHome();
    S.person.vx = 0; S.person.sliding = false; S.person.off = 0; S.person.baseX = S.person.x;
    S.push.active = false; S.push.F = 0; S.sponge.def = 0;
    S.brake = S.shoe === 'ice' ? BRAKE_MAX : 0; S.brakeSaved = 0;
    S.dial.drag = null; S.dial.angle = 0; S.dial.omega = 0; S.dial.msg = ''; S.dial.F = 0; S.dial.Ft = 0; S.dial.pt = null;
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
    // P5 护坡（参照坝体剖面）：棕色土坡 + 坡面灰色护面层 + 正常高水位水平线截坡
    var dg = ctx.createLinearGradient(0, L.roadTop, 0, H);
    dg.addColorStop(0, PAL.dirt); dg.addColorStop(1, PAL.dirtDark);
    ctx.beginPath(); ctx.moveTo(L.slopeX, L.roadTop);
    for (var x = L.slopeX; x <= L.toeX; x += 6) ctx.lineTo(x, groundY(x));
    ctx.lineTo(L.toeX, H); ctx.lineTo(L.slopeX, H); ctx.closePath();
    ctx.fillStyle = dg; ctx.fill();
    ctx.strokeStyle = PAL.lining; ctx.lineWidth = 8;                            // 灰色护面层
    ctx.beginPath(); ctx.moveTo(L.slopeX, L.roadTop);
    for (var x2 = L.slopeX; x2 <= L.toeX; x2 += 6) ctx.lineTo(x2, groundY(x2));
    ctx.stroke();    ctx.strokeStyle = PAL.liningDark; ctx.lineWidth = 1.6;                      // 护面板分缝
    for (var j = 1; j <= 5; j++) {
      var jx = L.slopeX + j * (L.toeX - L.slopeX) / 6, jy = groundY(jx);
      var jg = (groundY(jx + 3) - groundY(jx - 3)) / 6;
      ctx.beginPath(); ctx.moveTo(jx + jg * 5, jy - 5); ctx.lineTo(jx - jg * 7, jy + 7); ctx.stroke();
    }
    // 水体：沿坡升到正常高水位，水平线截坡（水下土坡半透明可见）
    ctx.beginPath(); ctx.moveTo(L.waterX, L.pondY); ctx.lineTo(W, L.pondY); ctx.lineTo(W, H);
    for (var x3 = L.toeX; x3 >= L.waterX; x3 -= 6) ctx.lineTo(x3, groundY(x3));
    ctx.closePath();    var wg = ctx.createLinearGradient(0, L.pondY, 0, H);
    wg.addColorStop(0, 'rgba(90,167,224,.72)'); wg.addColorStop(1, 'rgba(43,111,174,.86)');
    ctx.fillStyle = wg; ctx.fill();
    ctx.strokeStyle = PAL.foam; ctx.lineWidth = 2;                              // 水面波纹
    for (var i = 0; i < 3; i++) {
      var wy = L.pondY + 12 + i * 16, wx = L.waterX + 14 + i * 30;
      if (wx + 26 > W - 6) break;
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.quadraticCurveTo(wx + 13, wy - 4, wx + 26, wy); ctx.stroke();
    }
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.6; ctx.setLineDash([7, 6]);
    ctx.beginPath(); ctx.moveTo(L.waterX - 26, L.pondY); ctx.lineTo(W - 8, L.pondY); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#fff'; ctx.font = '600 11px sans-serif'; ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(20,50,90,.6)'; ctx.shadowBlur = 3;
    ctx.fillText('正常高水位', W - 12, L.pondY - 6); ctx.restore();
    // 沥青路面 + 黄色虚线中线
    var ag = ctx.createLinearGradient(0, L.roadTop, 0, L.roadBot);
    ag.addColorStop(0, PAL.asphaltTop); ag.addColorStop(1, PAL.asphalt);
    ctx.fillStyle = ag; ctx.fillRect(L.roadLeft, L.roadTop, L.slopeX - L.roadLeft, L.roadH);
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(L.roadLeft, L.roadTop, L.slopeX - L.roadLeft, 3);
    ctx.strokeStyle = PAL.lane; ctx.lineWidth = Math.max(3, Math.round(L.roadH * 0.14)); ctx.setLineDash([20, 16]);
    ctx.beginPath(); ctx.moveTo(L.roadLeft + 6, L.roadTop + L.roadH * 0.58); ctx.lineTo(L.slopeX - 6, L.roadTop + L.roadH * 0.58); ctx.stroke();
    ctx.setLineDash([]);
    ctx.save(); ctx.fillStyle = PAL.text; ctx.font = '600 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('池塘护坡', (L.slopeX + L.waterX) / 2, L.roadTop - 10); ctx.restore();
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

  /* ===== P1 贝塞尔写实卡通小人（面向车；P3 手臂肩为轴臂长恒定；P7 轮滑鞋滚轮） ===== */
  function drawPerson() {
    var per = S.person, ph = L.personH, gy = L.roadTop, d = dirS(), ice = S.shoe === 'ice';
    var pushing = S.push.active && S.push.F > 0.05 && S.car.mode === 'road';
    var walking = S.ps.mode === 'person' || per.sliding;
    var reaching = pushing || S.ps.mode === 'person';
    var topY = gy - ph, headR = ph * 0.10, headY = topY + headR * 1.42;
    var shY = L.roadTop - ph * (pushing ? 0.60 : 0.66), hipY = topY + ph * 0.56, tw = ph * 0.115;
    var shx = ph * 0.055;                                                       // 肩关节（与 shoulderPt 一致）
    var lean = pushing ? ph * 0.055 : (per.sliding ? -ph * 0.045 : 0);           // 前倾推车/后仰滑行
    var fOff = walking ? ph * 0.115 : ph * 0.05;
    var cp = reaching ? contactPoint() : null;
    var handL = cp ? { x: (cp.x - per.x) * d, y: cp.y } : null;                  // 世界→本地（镜像后恒朝+x）
    ctx.save();
    ctx.translate(per.x, 0); ctx.scale(d, 1);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // —— 后腿（深色裤）——
    strokeLimb(-tw * 0.35, hipY, -fOff * 0.55, hipY + (gy - hipY) * 0.52, -fOff * 0.95, gy - ph * 0.055, ph * 0.062, '#26333b', ph * 0.02);
    drawFoot(-fOff * 0.95, gy, ph, ice, true);
    // —— 躯干（贝塞尔上衣 + shading + 衣纹）——
    var sg = ctx.createLinearGradient(-tw, shY, tw * 1.3, hipY);
    sg.addColorStop(0, PAL.clothSh); sg.addColorStop(0.45, PAL.cloth); sg.addColorStop(1, PAL.clothSh);
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(-tw * 0.92 + lean * 0.6, shY - ph * 0.05);
    ctx.bezierCurveTo(-tw * 1.1 + lean * 0.3, shY + ph * 0.06, -tw * 0.95, hipY - ph * 0.04, -tw * 0.8, hipY + ph * 0.035);
    ctx.bezierCurveTo(-tw * 0.2, hipY + ph * 0.055, tw * 0.4, hipY + ph * 0.055, tw * 0.85, hipY + ph * 0.03);
    ctx.bezierCurveTo(tw * 1.02, hipY - ph * 0.05, tw * 1.08 + lean, shY + ph * 0.05, tw * 0.95 + lean, shY - ph * 0.048);
    ctx.bezierCurveTo(tw * 0.3 + lean, shY - ph * 0.075, -tw * 0.3 + lean, shY - ph * 0.075, -tw * 0.92 + lean * 0.6, shY - ph * 0.05);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(20,35,60,.35)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.strokeStyle = 'rgba(20,35,60,.16)'; ctx.lineWidth = 1.4;                // 衣纹
    ctx.beginPath(); ctx.moveTo(-tw * 0.2 + lean * 0.7, shY + ph * 0.02); ctx.quadraticCurveTo(-tw * 0.05, shY + ph * 0.10, -tw * 0.3, hipY - ph * 0.02); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tw * 0.45 + lean * 0.5, shY + ph * 0.05); ctx.quadraticCurveTo(tw * 0.35, shY + ph * 0.12, tw * 0.5, hipY - ph * 0.03); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.13)';                                    // 胸前受光
    ctx.beginPath(); ctx.moveTo(tw * 0.1 + lean * 0.8, shY - ph * 0.02);
    ctx.quadraticCurveTo(tw * 0.85 + lean * 0.8, shY + ph * 0.02, tw * 0.6, hipY - ph * 0.05);
    ctx.quadraticCurveTo(tw * 0.25, shY + ph * 0.08, tw * 0.1 + lean * 0.8, shY - ph * 0.02); ctx.closePath(); ctx.fill();    // —— 颈 + 领口 ——
    ctx.fillStyle = PAL.skinSh; rr(-tw * 0.22 + lean, shY - ph * 0.085, tw * 0.5, ph * 0.05, 3); ctx.fill();
    ctx.fillStyle = PAL.skin; rr(-tw * 0.2 + lean, shY - ph * 0.09, tw * 0.46, ph * 0.04, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(20,35,60,.4)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-tw * 0.35 + lean, shY - ph * 0.052); ctx.lineTo(tw * 0.05 + lean, shY - ph * 0.028); ctx.lineTo(tw * 0.42 + lean, shY - ph * 0.055); ctx.stroke();
    // —— 前腿（裤 + 弯膝）——
    strokeLimb(tw * 0.35, hipY, fOff * 0.62, hipY + (gy - hipY) * 0.5, fOff, gy - ph * 0.055, ph * 0.066, PAL.pants, ph * 0.024);
    drawFoot(fOff, gy, ph, ice, false);
    // —— 双臂（P3 单关节IK：臂长恒=armLen，肩为轴）——
    if (handL) {
      var hx = handL.x, hy = handL.y;
      drawArm(shx - tw * 0.1, shY + ph * 0.012, hx - ph * 0.012, hy + ph * 0.022, ph, true);   // 远侧臂(略暗)
      drawArm(shx + tw * 0.12, shY, hx, hy, ph, false);                                          // 近侧臂
      ctx.fillStyle = PAL.skin; circ(hx, hy, ph * 0.030); ctx.fill();                            // 手
      ctx.strokeStyle = 'rgba(120,80,40,.5)'; ctx.lineWidth = 1; circ(hx, hy, ph * 0.030); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hx + ph * 0.02, hy - ph * 0.012); ctx.lineTo(hx + ph * 0.034, hy - ph * 0.004); ctx.stroke();
    } else {
      var sw = walking ? ph * 0.075 : ph * 0.015;
      drawArm(shx - tw * 0.15, shY + ph * 0.01, -sw * 0.7 - ph * 0.02, hipY - ph * 0.01, ph, true);
      drawArm(shx + tw * 0.15, shY, sw + ph * 0.03, hipY - ph * 0.02, ph, false);
      ctx.fillStyle = PAL.skin;
      circ(-sw * 0.7 - ph * 0.02, hipY - ph * 0.01, ph * 0.027); ctx.fill();
      circ(sw + ph * 0.03, hipY - ph * 0.02, ph * 0.028); ctx.fill();
    }
    // —— 头（贝塞尔颅型/下颌 + 发型 + 脸）——
    var hdx = lean * 1.15 + ph * 0.012;
    ctx.fillStyle = PAL.skinSh;                                                 // 耳
    ctx.beginPath(); ctx.ellipse(hdx - headR * 0.72, headY + headR * 0.18, headR * 0.2, headR * 0.3, -0.2, 0, Math.PI * 2); ctx.fill();
    var fg = ctx.createRadialGradient(hdx + headR * 0.35, headY - headR * 0.3, headR * 0.2, hdx, headY, headR * 1.5);
    fg.addColorStop(0, '#f7d3a5'); fg.addColorStop(1, PAL.skin);
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(hdx - headR * 0.85, headY - headR * 0.15);
    ctx.bezierCurveTo(hdx - headR * 1.02, headY - headR * 1.35, hdx + headR * 0.72, headY - headR * 1.58, hdx + headR * 0.94, headY - headR * 0.35);   // 颅顶
    ctx.bezierCurveTo(hdx + headR * 1.02, headY + headR * 0.15, hdx + headR * 0.92, headY + headR * 0.55, hdx + headR * 0.5, headY + headR * 0.98);   // 颊→颏
    ctx.bezierCurveTo(hdx + headR * 0.1, headY + headR * 1.18, hdx - headR * 0.5, headY + headR * 0.85, hdx - headR * 0.72, headY + headR * 0.35);   // 下颌
    ctx.bezierCurveTo(hdx - headR * 0.85, headY + headR * 0.1, hdx - headR * 0.87, headY - headR * 0.05, hdx - headR * 0.85, headY - headR * 0.15);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(120,80,40,.35)'; ctx.lineWidth = 1.1; ctx.stroke();
    ctx.fillStyle = PAL.hair;                                                   // 发型（贝塞尔发盖+刘海+鬓角）
    ctx.beginPath();
    ctx.moveTo(hdx - headR * 0.92, headY + headR * 0.02);
    ctx.bezierCurveTo(hdx - headR * 1.18, headY - headR * 1.2, hdx - headR * 0.2, headY - headR * 1.78, hdx + headR * 0.62, headY - headR * 1.3);
    ctx.bezierCurveTo(hdx + headR * 0.95, headY - headR * 1.08, hdx + headR * 1.02, headY - headR * 0.7, hdx + headR * 0.98, headY - headR * 0.42);
    ctx.bezierCurveTo(hdx + headR * 0.6, headY - headR * 0.82, hdx + headR * 0.05, headY - headR * 0.95, hdx - headR * 0.4, headY - headR * 0.62);   // 刘海缘
    ctx.bezierCurveTo(hdx - headR * 0.66, headY - headR * 0.42, hdx - headR * 0.82, headY - headR * 0.2, hdx - headR * 0.92, headY + headR * 0.02);
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(40,25,12,.5)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#fff';                                                     // 眼
    ctx.beginPath(); ctx.ellipse(hdx + headR * 0.42, headY - headR * 0.08, headR * 0.2, headR * 0.24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#33241a'; circ(hdx + headR * 0.47, headY - headR * 0.05, Math.max(1.5, headR * 0.11)); ctx.fill();
    ctx.fillStyle = '#fff'; circ(hdx + headR * 0.5, headY - headR * 0.1, Math.max(0.8, headR * 0.04)); ctx.fill();
    ctx.strokeStyle = '#3a2c20'; ctx.lineWidth = 1.5;                           // 眉
    ctx.beginPath(); ctx.moveTo(hdx + headR * 0.26, headY - headR * 0.42); ctx.quadraticCurveTo(hdx + headR * 0.45, headY - headR * 0.52, hdx + headR * 0.62, headY - headR * 0.4); ctx.stroke();
    ctx.lineWidth = 1.3;                                                        // 鼻
    ctx.beginPath(); ctx.moveTo(hdx + headR * 0.82, headY + headR * 0.12); ctx.quadraticCurveTo(hdx + headR * 0.92, headY + headR * 0.28, hdx + headR * 0.76, headY + headR * 0.32); ctx.stroke();
    ctx.beginPath(); ctx.arc(hdx + headR * 0.45, headY + headR * 0.42, headR * 0.3, 0.2, Math.PI * 0.66); ctx.stroke();   // 微笑
    ctx.fillStyle = 'rgba(230,120,110,.28)';                                    // 腮红
    ctx.beginPath(); ctx.ellipse(hdx + headR * 0.62, headY + headR * 0.3, headR * 0.16, headR * 0.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function strokeLimb(x0, y0, x1, y1, x2, y2, w, col, bend) {                   // 双段关节肢体（膝/肘弯）
    ctx.strokeStyle = 'rgba(15,25,35,.28)'; ctx.lineWidth = w + 2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 + bend, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 + bend, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function drawArm(sx, sy, hx, hy, ph, far) {                                   // 肩→手微弧恒长臂：短袖+皮肤前臂
    var dx = hx - sx, dy = hy - sy, ln = Math.hypot(dx, dy) || 1;
    var cx = (sx + hx) / 2 - dy / ln * ph * 0.018, cy = (sy + hy) / 2 + dx / ln * ph * 0.018;
    ctx.strokeStyle = far ? PAL.skinSh : PAL.skin; ctx.lineWidth = ph * 0.04;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx, cy, hx, hy); ctx.stroke();
    ctx.strokeStyle = far ? PAL.clothSh : PAL.cloth; ctx.lineWidth = ph * 0.052; // 短袖
    ctx.beginPath(); ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + (cx - sx) * 0.5, sy + (cy - sy) * 0.5, sx + (hx - sx) * 0.42, sy + (hy - sy) * 0.42); ctx.stroke();
  }
  function drawFoot(fx, gy, ph, ice, back) {                                    // P7：普通鞋 / 轮滑鞋（轮架+一排滚轮，醒目对比色）
    var w = ph * 0.115, hgt = ph * 0.045, x0 = fx - w * 0.42, y0 = gy - hgt;
    if (ice) {
      var wr = ph * 0.017, wy = gy - wr;
      ctx.fillStyle = PAL.skateDark; rr(x0 - 1, wy - wr * 1.15, w + 6, wr * 1.1, 2); ctx.fill();       // 轮架
      for (var i = 0; i < 4; i++) {
        var wx = x0 + 2 + i * (w + 2) / 3.4;
        ctx.fillStyle = '#2b2f36'; circ(wx, wy, wr); ctx.fill();
        ctx.strokeStyle = back ? 'rgba(0,0,0,.35)' : '#111'; ctx.lineWidth = 1.4; circ(wx, wy, wr); ctx.stroke();
        ctx.fillStyle = PAL.skate; circ(wx, wy, wr * 0.42); ctx.fill();
      }
      ctx.fillStyle = back ? '#d97f0e' : PAL.skate;                                                   // 鞋身（亮橙）
      ctx.beginPath();
      ctx.moveTo(x0, y0 - hgt * 0.55);
      ctx.bezierCurveTo(x0 + w * 0.2, y0 - hgt * 0.7, x0 + w * 0.75, y0 - hgt * 0.35, x0 + w + 4, y0 + hgt * 0.1);
      ctx.lineTo(x0 + w + 4, wy - wr * 1.1); ctx.lineTo(x0 - 1, wy - wr * 1.1);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#7a4a00'; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.fillStyle = '#fff8ec'; rr(x0 + w * 0.1, y0 - hgt * 0.18, w * 0.55, 2.4, 1.2); ctx.fill();   // 鞋带条
    } else {
      ctx.fillStyle = back ? '#4a382b' : PAL.shoe;
      ctx.beginPath();
      ctx.moveTo(x0, gy - 1);
      ctx.bezierCurveTo(x0, y0 - hgt * 0.5, x0 + w * 0.5, y0 - hgt * 0.35, x0 + w + 3, gy - 2);
      ctx.lineTo(x0 + w + 3, gy - 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2c2119'; rr(x0 - 1, gy - 3, w + 5, 3, 1.4); ctx.fill();                       // 鞋底
    }
  }

  /* ===== 手-车接触海绵（P10：米色多孔可识别 + 按压凹陷 + 标签；形变∝力） ===== */
  function drawSponge() {
    if (S.car.mode !== 'road') return;
    var d = dirS(), pen = reachPen();
    var cp = (pen > 0) ? contactPoint()                                          // 受压：贴手位置
      : { x: S.car.x - d * L.carW * 0.5 - d * 3, y: L.roadTop + S.car.y - L.carH * 0.5 };   // 未推：贴车面停放
    var def = S.sponge.def;
    var w0 = L.carH * 0.17, h0 = L.carH * 0.32;
    var w = w0 * (1 + def * 0.45), h = h0 * (1 - def * 0.55);
    var x = cp.x - w * 0.5 + d * 2, y = cp.y - h / 2;
    ctx.save();
    var sg = ctx.createLinearGradient(x, y, x, y + h);
    sg.addColorStop(0, '#fbf0cc'); sg.addColorStop(1, PAL.sponge);
    ctx.fillStyle = sg; rr(x, y, w, h, 4); ctx.fill();
    ctx.strokeStyle = PAL.spongeDark; ctx.lineWidth = 1.5; rr(x, y, w, h, 4); ctx.stroke();
    ctx.fillStyle = PAL.spongeHole;                                             // 多孔洞纹理
    for (var i = 0; i < 7; i++) {
      var hx = x + w * (0.14 + ((i * 37) % 72) / 100), hy = y + h * (0.14 + ((i * 53) % 68) / 100);
      ctx.beginPath(); ctx.ellipse(hx, hy, 1.1 + (i % 3) * 0.55, 0.9 + (i % 2) * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (def > 0.08) {                                                          // 按压凹陷（手侧弧面）
      ctx.strokeStyle = 'rgba(160,120,50,.5)'; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x + (d > 0 ? 1 : w - 1), y + h * 0.18);
      ctx.quadraticCurveTo(x + (d > 0 ? 1 : w - 1) + d * def * w * 0.3, y + h * 0.5, x + (d > 0 ? 1 : w - 1), y + h * 0.82);
      ctx.stroke();
    }
    ctx.font = '600 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(255,255,255,.9)'; ctx.shadowBlur = 3; ctx.fillStyle = '#8a6a20'; ctx.fillText('海绵', x + w / 2, y + h + 3);
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

  /* ===== P4 刹车=竖直滑道：踏板造型滑钮上下滑=刹车力（轮滑鞋锁定虚化） ===== */
  function drawBrake() {
    var p = L.pedal, dis = S.shoe === 'ice';
    var knobH = 26, ty0 = p.y + 10, th = p.h - 20;
    var ky = ty0 + (S.brake / BRAKE_MAX) * th;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.88)'; rr(p.x - 10, p.y - 28, p.w + 20, p.h + 66, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(100,116,139,.4)'; ctx.lineWidth = 1; rr(p.x - 10, p.y - 28, p.w + 20, p.h + 66, 12); ctx.stroke();
    ctx.fillStyle = PAL.text; ctx.font = '700 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('刹车踏板', p.x + p.w / 2, p.y - 10);
    if (dis) ctx.globalAlpha = 0.35;                                             // 轮滑鞋：自动虚化
    var cx0 = p.x + p.w / 2;
    ctx.fillStyle = '#b6c2cf'; rr(cx0 - 8, ty0 - 4, 16, th + 8, 8); ctx.fill();  // 竖直滑道
    ctx.fillStyle = '#8c9bab'; rr(cx0 - 4, ty0, 8, th, 4); ctx.fill();           // 滑槽
    ctx.strokeStyle = 'rgba(40,50,61,.35)'; ctx.lineWidth = 1.2;                 // 0/最大 刻度
    ctx.beginPath(); ctx.moveTo(cx0 - 12, ty0); ctx.lineTo(cx0 - 20, ty0); ctx.moveTo(cx0 - 12, ty0 + th); ctx.lineTo(cx0 - 20, ty0 + th); ctx.stroke();
    ctx.font = '600 9px sans-serif'; ctx.fillStyle = PAL.sub; ctx.textAlign = 'right';
    ctx.fillText('松', cx0 - 22, ty0 + 3); ctx.fillText('紧', cx0 - 22, ty0 + th + 3);
    // 滑钮=刹车踏板造型：滑块座 + 踏板臂 + 带防滑棱的脚踏板
    ctx.fillStyle = '#475569'; rr(cx0 - 13, ky - knobH / 2, 26, knobH, 6); ctx.fill();
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.4; rr(cx0 - 13, ky - knobH / 2, 26, knobH, 6); ctx.stroke();
    ctx.fillStyle = '#94a3b8'; circ(cx0, ky, 4.5); ctx.fill();
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 5;                              // 踏板臂（向右下）
    ctx.beginPath(); ctx.moveTo(cx0 + 8, ky + 4); ctx.lineTo(cx0 + p.w * 0.34, ky + 14); ctx.stroke();
    ctx.save(); ctx.translate(cx0 + p.w * 0.34, ky + 14); ctx.rotate(0.5);       // 脚踏板面
    ctx.fillStyle = PAL.thrust; rr(-p.w * 0.16, -8, p.w * 0.34, 16, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(90,20,20,.6)'; ctx.lineWidth = 1.2; rr(-p.w * 0.16, -8, p.w * 0.34, 16, 4); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5;
    for (var k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(k * p.w * 0.08, -5); ctx.lineTo(k * p.w * 0.08, 5); ctx.stroke(); }
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.fillStyle = PAL.text; ctx.font = '700 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('刹车力 ' + S.brake.toFixed(1) + ' N', cx0, p.y + p.h + 16);
    ctx.font = '600 10px sans-serif'; ctx.fillStyle = dis ? PAL.thrust : PAL.sub;
    ctx.fillText(dis ? '轮滑鞋:锁定=最大' : '上下拖动滑钮=刹车力', cx0, p.y + p.h + 30);
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
    ctx.fillText('按住轮上一点拖动 → 先见切向力矢量，克服阻力后盘才转动；松手即停', c.x, b.y + 44);
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
    drawBrake();
    if (S.wheelZoom) drawWheelModal();
    if (window.ForceOverlay) ForceOverlay.draw(ctx, { w: W, h: H });
  }

  /* ===== overlay 注册（门控在 ForceOverlay 内；此处只管活跃事件） ===== */
  function syncOverlay() {
    var FO = window.ForceOverlay; if (!FO) return;
    var car = S.car, ice = S.shoe === 'ice', d = dirS();
    if (car.mode === 'slide' || (car.mode === 'pond' && !car.settled)) {
      var c = comPoint();
      FO.register('gravity', { point: c, dir: { x: 0, y: 1 }, magN: WEIGHT_N, color: '#7c3aed', label: 'G≈' + WEIGHT_N.toFixed(1) + 'N' });
    } else FO.unregister('gravity');
    if (S.wheelZoom && S.dial.drag && S.dial.F > 0.12 && S.dial.pt && S.dial.tan) {   // P9：力先行——拖动即画切向矢量
      var sg2 = S.dial.Ft >= 0 ? 1 : -1;
      FO.register('dial', { point: S.dial.pt, dir: { x: S.dial.tan.x * sg2, y: S.dial.tan.y * sg2 }, magN: S.dial.F, color: '#0891b2', label: 'F=' + S.dial.F.toFixed(1) + 'N' });
    } else FO.unregister('dial');
    if (S.push.active && S.push.F > 0.05 && car.mode === 'road') {
      var cp = contactPoint(), sh = shoulderPt(), hp = { x: sh.x - d * L.armLen * 0.5, y: cp.y };
      if (ice) {
        FO.register('push', {
          point: cp, dir: { x: d, y: 0 }, magN: S.push.F, color: PAL.thrust, label: '车受推 ' + S.push.F.toFixed(1) + 'N',
          pair: { point: hp, dir: { x: -d, y: 0 }, magN: S.push.F, color: PAL.speed, label: '人受向后 ' + S.push.F.toFixed(1) + 'N' }
        });
      } else FO.register('push', { point: cp, dir: { x: d, y: 0 }, magN: S.push.F, color: PAL.thrust, label: '推力 F=' + S.push.F.toFixed(1) + 'N' });
    } else FO.unregister('push');
  }

  /* ===== 物理步进（力→加速度；P8 左/右推只推不拉 + 人车解耦 + P9 方向盘力先行） ===== */
  function step(dt, now) {
    var ch = false, car = S.car, per = S.person, ice = S.shoe === 'ice', d = dirS();
    // 推力：手（肩+臂长）压到车面多深 → F（只推不拉，dir 恒=推向）
    var pen = reachPen();
    if (pen > 0) { S.push.active = true; S.push.F = clamp(pen * L.pushK, 0, F_MAX); }
    else { S.push.active = false; S.push.F = 0; }
    if (ice && S.push.active) {                                            // 相互作用：人持续向后加速（接触段）
      per.vx -= d * S.push.F * ICE_K * dt; per.sliding = true;
    }

    var decel = FRIC + S.brake / M * BRAKE_SCALE;
    if (car.mode === 'road') {
      var aPush = (!ice && S.push.active) ? d * S.push.F / M * A_SCALE : 0; // 轮滑：刹车锁定最大，车不动
      if (Math.abs(car.vx) <= 0.5 && Math.abs(aPush) <= decel) car.vx = 0;   // 静阻力顶得住 → 不动
      else {
        var a = aPush - (car.vx > 0 ? 1 : car.vx < 0 ? -1 : 0) * decel;
        car.vx += a * dt;
        if (car.vx * d < 0) car.vx = 0;                                     // 只推不拉：摩擦不得反向推车
        car.vx = clamp(car.vx, -V_MAX * 1.5, V_MAX * 1.5);
      }
      car.x += car.vx * dt;
      var minX = L.roadLeft + L.carW * 0.5;
      if (car.x < minX) { car.x = minX; if (car.vx < 0) car.vx = 0; }
      if (car.x >= L.slopeX && car.vx > 0) {
        car.mode = 'slide'; setHint('车越过路尽头 → 沿护坡滑下：重力加速，坡面起伏减速'); sfx('Click');
        speak('车冲下护坡，重力让车越来越快');
      }
      if (Math.abs(car.vx) > 0.05) ch = true;
    } else if (car.mode === 'slide') {
      var grad = (groundY(car.x + 6) - groundY(car.x - 6)) / 12;
      car.vx += G_SLOPE * grad * dt;                                      // 重力沿坡分量
      car.vx *= (1 - 0.55 * dt);                                          // 坡面起伏：碰撞/减速
      car.x += car.vx * dt;
      car.y = groundY(car.x) - L.roadTop;
      var ta = Math.atan(grad); car.angle += (ta - car.angle) * Math.min(1, dt * 10);
      ch = true;
      if (car.x >= L.waterX - L.carW * 0.22) {                            // P5：沿坡滑入水（水位线截坡处）
        car.mode = 'pond'; car.splashT = now; car.settled = false; sfx('Match');
        setHint('车沿护坡滑入池塘：水的阻力使车迅速减速下沉');
        speak('车滑进池塘，水的阻力让车停下来');
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

    // 人（轮滑滑离：接触段加速 + 脱手后惯性滑行缓慢减速；普通鞋由鼠标直接控制）
    if (per.sliding) {
      var penNow = reachPen();
      if (penNow > 0 && ice) {                                             // 接触段：偏移累积（鼠标仍可加压）
        per.off += per.vx * dt;
        per.x = clampPersonX(per.baseX + per.off);
      } else if (Math.abs(per.vx) > 2) {                                   // 脱手：惯性滑行缓慢减速
        per.vx -= Math.sign(per.vx) * ICE_FRIC * dt; per.x += per.vx * dt;
      } else {                                                             // 停下：偏移折回抓取基准，防回弹
        per.vx = 0; per.sliding = false;
        S.ps.grabDX += per.off; per.baseX = per.x; per.off = 0;
        setHint('轮滑鞋：手与车已脱离 → 人靠惯性滑行，缓慢停下');
      }
      if (per.x <= L.roadLeft + 12 && per.vx < 0) { per.x = L.roadLeft + 12; per.vx = 0; }
      per.x = clampPersonX(per.x);
      ch = true;
    }

    // P9 方向盘：切向力克服静阻力 → 扭矩 + 惯性 + 阻尼；松手即停（onUp 清 omega）
    var dl = S.dial;
    if (dl.drag) {
      var fa = Math.abs(dl.Ft);
      if (fa > DIAL_FRES) {
        dl.omega += Math.sign(dl.Ft) * (fa - DIAL_FRES) * DIAL_KT * dt;
        dl.omega *= (1 - 3.2 * dt);
        dl.omega = clamp(dl.omega, -9, 9);
        dl.angle += dl.omega * dt;
        ch = true;
      } else if (Math.abs(dl.omega) > 0.001) { dl.omega *= (1 - 9 * dt); dl.angle += dl.omega * dt; ch = true; }
    }

    // 海绵形变（弹簧回复，∝推力）
    var sTarget = S.push.active && car.mode === 'road' ? S.push.F / F_MAX : 0;
    var nd = S.sponge.def + (sTarget - S.sponge.def) * Math.min(1, dt * 14);
    if (Math.abs(nd - S.sponge.def) > 0.001) { S.sponge.def = nd; ch = true; }

    syncOverlay();
    return ch;
  }

  /* ===== pointer（P4 刹车滑道 / P8 推人 / P9 方向盘力先行） ===== */
  function nearPerson(p) { return Math.hypot(p.x - S.person.x, p.y - (L.roadTop - L.personH * 0.5)) <= L.personH * 0.6; }
  function nearPedal(p) { var q = L.pedal; return p.x >= q.x - 12 && p.x <= q.x + q.w + 12 && p.y >= q.y - 30 && p.y <= q.y + q.h + 40; }
  function brakeFromY(y) { S.brake = clamp((y - (L.pedal.y + 10)) / (L.pedal.h - 20), 0, 1) * BRAKE_MAX; }
  function setHint(t) { setText('hint', t); }
  function openWheel() {
    S.wheelZoom = true; S.dial.msg = '按住轮上一点拖动试试'; seg('btn-wheel', true); sfx('Click');
    speak('这是方向盘放大区，力要先克服阻力，方向盘才会转动');
    dirty = true;
  }
  function closeWheel() {
    S.wheelZoom = false; S.dial.drag = null; S.dial.F = 0; S.dial.Ft = 0; S.dial.omega = 0; S.dial.pt = null; S.dial.msg = '';
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
      var d0 = Math.hypot(p.x - c.x, p.y - c.y);
      if (Math.abs(d0 - R) <= R * 0.45 || d0 <= R * 0.28) {
        S.dial.drag = { a0: Math.atan2(p.y - c.y, p.x - c.x) - S.dial.angle };
        S.dial.omega = 0;
        S.ps.mode = 'dial'; capture(ev); ev.preventDefault(); dirty = true; return;
      }
      if (p.x < L.modal.x || p.x > L.modal.x + L.modal.w || p.y < L.modal.y || p.y > L.modal.y + L.modal.h) closeWheel();
      return;
    }
    if (nearPedal(p)) {
      if (S.shoe === 'ice') { setHint('轮滑鞋：刹车已锁定为最大（虚化不可调）'); return; }
      S.ps.mode = 'pedal'; brakeFromY(p.y); capture(ev);
      setHint('沿竖直滑道上下拖动踏板滑钮 → 刹车力增大/减小');
      speak('踩下刹车踏板，刹车力让车减速');
      ev.preventDefault(); dirty = true; return;
    }
    if (S.sw && S.car.mode === 'road' && Math.hypot(p.x - S.sw.x, p.y - S.sw.y) <= S.sw.r + 12) { openWheel(); return; }
    if (nearPerson(p) && S.car.mode !== 'pond') {
      if (S.person.sliding) { setHint('人正在惯性滑行中，停下后才能再拖动'); return; }
      S.ps.mode = 'person'; S.ps.grabDX = S.person.x - p.x;
      S.person.off = 0; S.person.baseX = S.person.x; capture(ev);
      setHint(S.shoe === 'ice' ? '轮滑鞋：推到人车接触 → 人整体向后滑离车（相互作用）' : '拖动小人顶住车 → 车受力启动；按住不动 → 车凭惯性前滑');
      speak('我们现在小人推车，首先海绵先受力形变，然后力传到车让车往前走');
      ev.preventDefault(); dirty = true; return;
    }
    S.ps.mode = 'idle';
  }
  function onMove(ev) {
    var p = canvasXY(ev); S.ps.x = p.x; S.ps.y = p.y;
    if (S.ps.mode === 'pedal') { brakeFromY(p.y); dirty = true; return; }
    if (S.ps.mode === 'person') {
      S.person.baseX = clampPersonX(p.x + (S.ps.grabDX || 0));
      if (!S.person.sliding) S.person.x = S.person.baseX;                  // 轮滑接触段：位置由 step 积分偏移
      dirty = true; return;
    }
    if (S.ps.mode === 'dial' && S.dial.drag) {                             // P9：力先行——切向分量→矢量→克服静阻力才转
      var c = modalCenter(), R = L.dialR;
      var a = S.dial.angle + S.dial.drag.a0, rx = Math.cos(a), ry = Math.sin(a);
      var gx = c.x + rx * R, gy = c.y + ry * R;
      var dx = p.x - gx, dy = p.y - gy, dl = Math.hypot(dx, dy);
      var cross = rx * dy - ry * dx;                                       // 切向分量×R（=力臂×F）
      var ratio = dl > 1e-6 ? Math.abs(cross) / dl : 0;                    // 力臂/R = |sinθ|
      S.dial.pt = { x: gx, y: gy }; S.dial.tan = { x: -ry, y: rx };
      S.dial.F = clamp(Math.abs(cross) / (R * 0.45) * DIAL_FMAX, 0, DIAL_FMAX);
      S.dial.Ft = ratio < 0.2 ? 0 : (cross > 0 ? S.dial.F : -S.dial.F);
      if (ratio < 0.2) S.dial.msg = '作用线≈过盘心 → 力臂≈0 → 不转动';
      else if (S.dial.F <= DIAL_FRES) S.dial.msg = '切向力 ' + S.dial.F.toFixed(1) + 'N ≤ 静阻力 ' + DIAL_FRES.toFixed(1) + 'N → 盘不动';
      else S.dial.msg = '切向力克服静阻力 → 力臂≈' + Math.round(ratio * R) + 'px → 盘转动（松手即停）';
      dirty = true; return;
    }
    var over = nearPedal(p) || nearPerson(p) ||
      (S.sw && S.car.mode === 'road' && Math.hypot(p.x - S.sw.x, p.y - S.sw.y) <= S.sw.r + 12);
    cv.style.cursor = over ? 'pointer' : 'default';
  }
  function onUp() {
    if (S.ps.mode === 'person') setHint('松手：不再推 → 车只受摩擦/刹车减速（力不是维持运动的原因）');
    if (S.ps.mode === 'dial') {                                            // 松手即停、矢量消
      S.dial.drag = null; S.dial.F = 0; S.dial.Ft = 0; S.dial.omega = 0; S.dial.pt = null; S.dial.msg = '松手 → 停止转动';
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
      setHint('轮滑鞋：刹车锁定=最大（虚化）；推车 → 人整体向后滑离车、手脱开（相互作用+惯性）');
      speak('现在我们换上轮滑鞋');
    } else {
      S.brake = S.brakeSaved || 0;
      setHint('普通鞋：拖动小人顶住车 → 车受力启动');
      speak('现在我们换上普通鞋');
    }
    seg('btn-shoe-normal', s === 'normal'); seg('btn-shoe-ice', s === 'ice');
    sfx('Click'); dirty = true;
  }
  function setPushDir(dir) {                                                 // P8：左推/右推——只推不拉，换边重摆人位
    if (S.pushDir === dir) return;
    S.pushDir = dir;
    S.person.x = personHome();
    S.person.vx = 0; S.person.sliding = false; S.person.off = 0; S.person.baseX = S.person.x;
    S.push.active = false; S.push.F = 0;
    seg('btn-push-left', dir === 'left'); seg('btn-push-right', dir === 'right');
    setHint(dir === 'left' ? '左推：人站车左边 → 只能往右推（不能左拉）' : '右推：人站车右边 → 只能往左推（不能右拉）');
    speak(dir === 'left' ? '小人站在车左边，往右推车' : '小人站在车右边，往左推车');
    sfx('Click'); dirty = true;
  }
  function wire() {
    function on(id, ev, fn) { var el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }
    on('btn-shoe-normal', 'click', function () { setShoe('normal'); });
    on('btn-shoe-ice', 'click', function () { setShoe('ice'); });
    on('btn-push-left', 'click', function () { setPushDir('left'); });
    on('btn-push-right', 'click', function () { setPushDir('right'); });
    on('btn-wheel', 'click', function () { if (S.wheelZoom) closeWheel(); else openWheel(); });
    on('btn-diagram', 'click', function () {
      S.diagram = !S.diagram;
      if (window.ForceOverlay) ForceOverlay.setOn(S.diagram);
      var b = document.getElementById('btn-diagram'); if (b) b.classList.toggle('on', S.diagram);
      setHint(S.diagram ? '力的示意图：开 — 仅当前活跃交互/事件画矢量（1cm=1N）' : '力的示意图：关 — 全场景不画矢量');
      sfx('Click'); dirty = true;
    });
    on('btn-reset', 'click', function () { resetCar(); setHint('已重置：拖动小人顶住车 → 车启动'); sfx('Click'); });
    on('btn-mute', 'click', function () {
      S.muted = !S.muted; var b = document.getElementById('btn-mute');
      if (b) { b.classList.toggle('on', !S.muted); b.textContent = S.muted ? '🔇' : '🔊'; }
      if (S.muted && window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) {} }
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
  seg('btn-push-left', true);
  resize();
  requestAnimationFrame(tick);
})();

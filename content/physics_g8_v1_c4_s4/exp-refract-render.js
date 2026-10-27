'use strict';
/* c4s4 光的折射 · 渲染层（状态契约 window.RR 只读，暴露 RRDraw.init/layout/draw） */
(function(){
var RR = window.RR = {
  medium: 'water', iDeg: 40, laserOn: false,
  showNormal: false, showAngles: false, showReflect: false, reverse: false
};
var W = 0, H = 0, dpr = 1, ctx = null, cv = null, loopOn = false;
var by = 0, fy = 0, surfaceY = 0, tankX = 0, penY = 0;
var tankH = 0, tankScale = 0, penScale = 0, glassH = 0, brickTop = 0, brickBottom = 0, tankSeat = 0;
var animProgress = 1, prevLaserOn = false, rayStart = 0;

function refraction(iDeg, n2) {
  var i = iDeg * Math.PI / 180;
  if (iDeg <= 0) return { rDeg: 0, sinR: 0 };
  var sinR = Math.sin(i) / n2;
  if (sinR > 1) sinR = 1;
  return { rDeg: Math.asin(sinR) * 180 / Math.PI, sinR: sinR };
}

function registerSprites() {
  ['water_tank', 'laser_pen', 'glass_brick'].forEach(function(id) {
    if (PROPS.onSprite) PROPS.onSprite(id, function() { RRDraw.draw(); });
  });
}

function skyGradient(c) {
  var g = c.createLinearGradient(0, 0, 0, by);
  g.addColorStop(0, '#dbeafe');
  g.addColorStop(1, '#eff6ff');
  return g;
}

function rayColor(c, glowW, coreW) {
  c.save();
  c.lineCap = 'round';
  c.shadowBlur = 10;
  c.shadowColor = '#ff3b30';
  c.strokeStyle = 'rgba(255,59,48,.25)';
  c.lineWidth = glowW;
  return c;
}

function drawRay(c, p1, p2, glowW, coreW) {
  rayColor(c, glowW, coreW);
  c.beginPath(); c.moveTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.stroke();
  c.shadowBlur = 0;
  c.strokeStyle = '#ff3b30';
  c.lineWidth = coreW;
  c.beginPath(); c.moveTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.stroke();
  c.restore();
}

function drawProgressRay(c, pts, progress, glowW, coreW) {
  // 泛化折线：累计各段长，progress 裁总长，返回移动光点头 tip
  var segs = [], total = 0, k;
  for (k = 1; k < pts.length; k++) {
    var len = Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y) || 1;
    segs.push(len); total += len;
  }
  var d = progress * total, acc = 0, tip = null;
  for (k = 0; k < segs.length; k++) {
    var p = pts[k], q = pts[k + 1], cap = d - acc;
    if (cap <= segs[k]) {
      if (cap > 0) {
        var t = cap / segs[k];
        tip = { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
        drawRay(c, p, tip, glowW, coreW);
      }
      return tip;
    }
    drawRay(c, p, q, glowW, coreW);
    acc += segs[k];
  }
  return tip;
}

function chevron(c, from, to, t) {
  // 在 from→to 线段 t 处画小 V 形箭头指向 to（两短线各 8px、夹角约 30°，红色同光路内核色）
  var x = from.x + (to.x - from.x) * t, y = from.y + (to.y - from.y) * t;
  var ang = Math.atan2(to.y - from.y, to.x - from.x);
  var s = 8, spread = 15 * Math.PI / 180;
  c.save();
  c.strokeStyle = '#ff3b30'; c.lineWidth = 2; c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x - s * Math.cos(ang - spread), y - s * Math.sin(ang - spread));
  c.lineTo(x, y);
  c.lineTo(x - s * Math.cos(ang + spread), y - s * Math.sin(ang + spread));
  c.stroke();
  c.restore();
}

function surfaceYFor(medium) {
  // 玻璃入射面=顶面透视带中线（sprite 实测：后边行0.006/前边行0.143，中=0.0745，即顶面前后两边中间）
  return medium === 'water' ? tankSeat - 0.601 * tankH : brickTop + 0.0745 * glassH;
}

function nozzleOffset(Adeg, hDrawn) {
  var img = PROPS.img('laser_pen');
  var w = (img && img.naturalWidth > 0) ? hDrawn * img.naturalWidth / img.naturalHeight : hDrawn * 2;
  var a = Adeg * Math.PI / 180;
  var lx = 0.4799 * w, ly = -0.65 * hDrawn;
  return { x: lx * Math.cos(a) - ly * Math.sin(a), y: lx * Math.sin(a) + ly * Math.cos(a) };
}

function computeGeometry(iDeg, surfaceY, penH, medium) {
  var iRad = iDeg * Math.PI / 180;
  var L = Math.min(H * 0.42, W * 0.30, (surfaceY - (penH + 30)) / Math.max(0.25, Math.cos(iRad))); // 玻璃态入射面高，限 L 使笔身留在屏内
  var Ox = tankX;
  if (medium === 'glass') {
    // 砖内光路居中：入射点=顶面中心−砖内水平位移/2（0.802·glassH·tan r），出射点=中心+位移/2；
    // 位移最大≈192px→偏中心最大96px < 顶/底面带半宽133px，全角度两点都落在面带内不出侧面
    var dIn = (by + 32 - surfaceY) * Math.tan(Math.asin(Math.sin(iRad) / 1.5)); // 砖内水平位移=(桌带中线−顶面中线)·tan r
    Ox = tankX + 0.014 * glassH - dIn / 2;
  }
  var O = { x: Ox, y: surfaceY };
  var N = { x: O.x - Math.sin(iRad) * L, y: O.y - Math.cos(iRad) * L };
  var off = nozzleOffset(90 - iDeg, penH);
  var P = { x: N.x - off.x, y: N.y - off.y };
  return { O: O, pen: P, nozzle: N };
}

var RRDraw = window.RRDraw = {
  init: function(canvas) {
    cv = canvas;
    ctx = cv.getContext('2d');
    registerSprites();
    this.layout();
  },
  layout: function() {
    if (!cv) return;
    var r = cv.parentElement ? cv.parentElement.getBoundingClientRect() : { width: 800, height: 600 };
    W = Math.max(280, r.width || 800);
    H = Math.max(200, r.height || 600);
    dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var ctrlH = 96;
    fy = H - Math.min(ctrlH, H * 0.18);
    // 桌面带宽对齐 c4s3/c4s5 器材库基准：109 = 顶面64 + 高光4 + 前脸41（原 88 前脸过薄）
    by = Math.max(40, fy - 109);
    tankX = W * 0.58;

    tankH = Math.min(H * 0.30, 250);
    glassH = Math.min(H * 0.34, 270);
    // 桌面摆放规则 R1 坐深居中（props.js 库定版）：器材足迹竖向跨度居中于桌面进深带 [by,by+64]，
    // anchor=sprite 底边=足迹前缘 → seatY=PROPS.seatY(by,64,span)；span 实测：water_tank 顶面带 frac 0.2129、glass_brick 0.1363
    tankSeat = PROPS.seatY(by, 64, 0.2129 * tankH);
    brickBottom = PROPS.seatY(by, 64, 0.1363 * glassH);
    brickTop = brickBottom - glassH;
    if (!ctx) ctx = cv.getContext('2d');
  },
  draw: function() {
    var c = ctx, R = window.RR;
    if (!c || !W || !R) return;
    c.clearRect(0, 0, W, H);
    c.fillStyle = skyGradient(c);
    c.fillRect(0, 0, W, by);
    PROPS.wood_desk(c, W, H, { by: by, fy: fy, x0: 0, x1: W });

    surfaceY = surfaceYFor(R.medium);
    var penH = Math.min(H * 0.09, 72);
    var geo = computeGeometry(R.iDeg, surfaceY, penH, R.medium);
    var O = geo.O;
    var pen = geo.pen;
    var nozzle = geo.nozzle;
    var penAngle = 90 - R.iDeg;

    if (R.medium === 'water') {
      PROPS.water_tank(c, tankX, tankSeat, { h: tankH, water: 0.8, turbid: 0.3 });
    } else {
      // 砖右移 0.18·glassH：大入射角砖内水平位移最大≈0.72·glassH，平移后入射/出射点全角度落在顶面带/底面带内（不出侧面）
      PROPS.glass_brick(c, tankX, brickBottom, { h: glassH });
    }

    var n2 = R.medium === 'water' ? 1.333 : 1.500;
    var refr = refraction(R.iDeg, n2);
    var rRad = refr.rDeg * Math.PI / 180;
    var deskC = by + 32; // 桌面进深带中线=坐定器材足迹中线=光线落桌桌面标高（R1）
    var P2 = { x: O.x + (deskC - O.y) * Math.tan(rRad), y: deskC };
    var rayProg = animProgress;

    // 光路折线：water 三段 nozzle→O→P2；glass 四段 nozzle→O→B2→exitEnd
    // 出射折射论证：顶面 sin i = n·sin r；底面法线与顶面平行，内部光线以 r 角射到底面，
    // n·sin r = sin i′ → i′=i → 出射光线与入射光线平行（仅侧向平移）
    var pts;
    if (R.medium === 'water') {
      pts = [nozzle, O, P2];
    } else {
      // 出射点=底面中心（sprite 实测底面中线行 frac≈0.8765）=「刚出玻璃那个点」；砖内段竖直跨度按 O→B2 实算
      var B2 = { x: O.x + (deskC - O.y) * Math.tan(rRad), y: deskC }; // 出射点=底面中线=足迹中线（R1 居中⇒桌带中线）
      var iRadE = R.iDeg * Math.PI / 180;
      var tExit = 32 / Math.cos(iRadE); // 砖坐桌面：出射段自 B2 至桌前缘(by+64)止、光点落桌面；i=0 时 cos=1
      var exitEnd = { x: B2.x + tExit * Math.sin(iRadE), y: by + 64 }; // 出射段至桌前缘止（B2 在桌带中线，Δy=32=tExit·cos i 自洽）
      pts = [nozzle, O, B2, exitEnd];
    }
    var ptsDir = R.reverse ? pts.slice().reverse() : pts;

    if (R.laserOn) {
      var tip = drawProgressRay(c, ptsDir, rayProg, 5, 2);
      if (tip) {
        c.save(); c.fillStyle = '#fff7cc'; c.shadowBlur = 10; c.shadowColor = '#ff3b30';
        c.beginPath(); c.arc(tip.x, tip.y, 4, 0, 7); c.fill(); c.restore();
      }
    }

    PROPS.laser_pen(c, pen.x, pen.y, { h: penH, angle: penAngle, beam: false });

    if (R.showNormal) {
      c.save();
      c.strokeStyle = '#94a3b8'; c.lineWidth = 1.5; c.setLineDash([5, 4]);
      c.beginPath(); c.moveTo(O.x, O.y - 60); c.lineTo(O.x, O.y + 70); c.stroke();
      c.setLineDash([]);
      c.fillStyle = '#1f2937'; c.beginPath(); c.arc(O.x, O.y, 3.5, 0, 7); c.fill();
      c.font = 'bold 13px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#475569';
      c.fillText('O', O.x - 10, O.y + 16);
      c.fillText('N', O.x + 10, O.y - 52);
      c.restore();
    }
    if (R.showAngles) {
      var iRad = R.iDeg * Math.PI / 180, rRad = refraction(R.iDeg, R.medium === 'water' ? 1.333 : 1.500).rDeg * Math.PI / 180;
      var rad = Math.min(38, Math.max(24, (nozzle.y - O.y) * 0.35));
      c.save();
      c.strokeStyle = '#2563eb'; c.lineWidth = 2;
      c.beginPath(); c.arc(O.x, O.y, rad, -(Math.PI / 2 + iRad), -Math.PI / 2, false); c.stroke();
      c.strokeStyle = '#0ea5e9'; c.lineWidth = 2;
      c.beginPath(); c.arc(O.x, O.y, rad + 10, Math.PI / 2 - rRad, Math.PI / 2, false); c.stroke();
      c.font = 'bold 12px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      // 标签落在对应弧线的角平分线上：i 弧在左上象限（入射光↔法线上段），r 弧在右下象限（折射光↔法线下段）
      var thI = -Math.PI / 2 - iRad / 2, thR = Math.PI / 2 - rRad / 2;
      c.fillStyle = '#1d4ed8';
      c.fillText('i', O.x + (rad + 13) * Math.cos(thI), O.y + (rad + 13) * Math.sin(thI));
      c.fillStyle = '#0369a1';
      c.fillText('r', O.x + (rad + 10 + 13) * Math.cos(thR), O.y + (rad + 10 + 13) * Math.sin(thR));
      c.restore();
    }
    // 微弱反射光线：界面处同时发生反射，空气侧对称
    if (R.showReflect && R.laserOn) {
      // 反射光线与入射光线关于法线对称：入射来自左上 → 反射去右上（x 取 +sin）
      var iRad = R.iDeg * Math.PI / 180, refLen = Math.min(W, H) * 0.28;
      var refX = O.x + Math.sin(iRad) * refLen, refY = O.y - Math.cos(iRad) * refLen;
      c.save();
      c.lineCap = 'round';
      c.strokeStyle = 'rgba(255,59,48,.45)'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(O.x, O.y); c.lineTo(refX, refY); c.stroke();
      c.restore();
    }
    // 光路可逆：方向箭头按相邻段中点+行进方向画（reverse 反序后自动反向）
    if (R.laserOn) {
      for (var ci = 0; ci < ptsDir.length - 1; ci++) chevron(c, ptsDir[ci], ptsDir[ci + 1], 0.5);
    }
    if (R.laserOn && R.medium === 'glass' && B2) {
      // 底面出射点 B2 短法线：灰虚线上下吤20px，不标字母
      c.save();
      c.strokeStyle = '#94a3b8'; c.lineWidth = 1.5; c.setLineDash([5, 4]);
      c.beginPath(); c.moveTo(B2.x, B2.y - 20); c.lineTo(B2.x, B2.y + 20); c.stroke();
      c.setLineDash([]);
      c.restore();
    }
    // 笔身红钮命中区（供 core 点击开关激光）：sprite 324×90，drawImage(-w/2,-h,w,h)，
    // 红钮 sprite 像素 frac 实测值见下行系数 → 局部坐标 (u-w/2, v-h)，再按 angle=90-iDeg 旋转加 pen 锚点
    var hitW = penH * 324 / 90;
    var hlX = 0.7706 * hitW - hitW / 2, hlY = 0.3537 * penH - penH;
    var haRad = penAngle * Math.PI / 180;
    RRDraw.penHit = {
      x: pen.x + hlX * Math.cos(haRad) - hlY * Math.sin(haRad),
      y: pen.y + hlX * Math.sin(haRad) + hlY * Math.cos(haRad),
      r: Math.max(12, penH * 0.20)
    };
    RRDraw.O = O;
    // 笔身整体命中区（旋转矩形）：锚点=pen，局部 u∈[-w/2,w/2]、v∈[-h,0]（drawImage(-w/2,-h,w,h)），供 core 拖拽判定
    RRDraw.penBody = { x: pen.x, y: pen.y, a: haRad, w: hitW, h: penH };
  }
};

function startLoop() {
  if (loopOn) return;
  loopOn = true;
  requestAnimationFrame(loop);
}

function loop() {
  try {
    var R = window.RR;
    if (R) {
      if (R.laserOn && !prevLaserOn) rayStart = performance.now();
      prevLaserOn = R.laserOn;
      animProgress = R.laserOn ? Math.min(1, (performance.now() - rayStart) / 700) : 0;
    }
    RRDraw.draw();
  } catch (err) { console.error('refract draw:', err); }
  if (loopOn) requestAnimationFrame(loop);
}

window.addEventListener('load', function() {
  var el = document.getElementById('cv');
  if (el && !cv) RRDraw.init(el);
  startLoop();
});
})();

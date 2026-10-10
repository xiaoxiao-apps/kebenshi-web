(function(global){
  'use strict';
  const PROPS = global.PROPS = global.PROPS || {};

  // 2.5D 斜透视投影常量（全库统一）
  PROPS.P25 = { dx: 0.35, dy: -0.35 };

  // 水槽几何常量(原生754×301实测):水面后缘/前缘/底行frac、侧壁分段表[行frac,x0,x1]、水面后缘内收
  // 2026-10-03 蔡总新空水槽素材(截屏08.21)重测: 背墙竖线0.130/0.866、内底后缘0.748、内底前缘0.935
  PROPS.TANK = {
    back: 0.039, front: 0.265, bot: 0.935, insetL: 0.106, insetR: 0.108,
    walls: [[0.145, 0.130, 0.866], [0.748, 0.130, 0.866], [0.935, 0.106, 0.892]]
  };
  // 带孔板原生孔位(洞已修补进sprite、渲染时代码打孔;cx取板实体中心)
  PROPS.BOARD_HOLE = { cx: 0.5000, cy: 0.2813, r: 28 };

  // 确定性伪随机（代替 Math.random）
  PROPS.rand = function(seed) {
    const s = Math.sin(seed * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };

  // === sprite loader contract ===
  PROPS.SPRITE_BASE = 'sprites/';
  PROPS.SPRITE_VER = 91;
  PROPS._imgCache = PROPS._imgCache || {};
  PROPS.img = function(id) {
    var c = PROPS._imgCache;
    if (!c[id]) {
      var img = new Image();
      img.src = PROPS.SPRITE_BASE + id + '.png?v=' + (PROPS.SPRITE_VER || 1);
      c[id] = img;
    }
    return c[id];
  };
  PROPS.onSprite = function(id, cb) {
    var img = PROPS.img(id);
    if (img.complete && img.naturalWidth > 0) { cb(); return; }
    if (!img._cbs) img._cbs = [];
    img._cbs.push(cb);
    if (!img._hooked) {
      img._hooked = true;
      img.onload = function() { (img._cbs || []).forEach(function(f) { f(); }); };
    }
  };
  PROPS.spriteReady = function(id) {
    var img = PROPS.img(id);
    return img.complete && img.naturalWidth > 0;
  };
  function spriteScale(id, opt) {
    if (opt.h || opt.w) {
      var img = PROPS.img(id);
      if (img.naturalWidth > 0) {
        if (opt.h) return opt.h / img.naturalHeight;
        return opt.w / img.naturalWidth;
      }
    }
    return opt.scale || 1;
  }

  // laser_pen: 待多状态素材(scale/angle/dir); beam 动态
  PROPS.laser_pen = function(ctx, x, y, opt) {
    opt = opt || {};
    if (!PROPS.spriteReady('laser_pen')) return;
    var img = PROPS.img('laser_pen');
    var s = spriteScale('laser_pen', opt);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var a = (opt.angle || 0) * Math.PI / 180;
    var dir = (opt.dir === 'left' || opt.dir === -1) ? -1 : 1;
    ctx.save(); ctx.translate(x, y);
    if (a) ctx.rotate(a);
    if (dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h, w, h);
    if (opt.beam) {
      var L = opt.beamLen || 400;
      // 锚点=镜头环连通域中心实测
      var ax = -w / 2 + w * 0.9799, ay = -h + h * 0.3500;
      ctx.lineCap = 'round';
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'rgba(255,59,48,.25)';
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + L, ay); ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ff3b30';
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + L, ay); ctx.stroke();
    }
    ctx.restore();
  };

  // water_tank: 待多状态素材(water/turbid); 水位线过渡
  PROPS.water_tank = function(ctx, x, y, opt) {
    opt = opt || {};
    if (!PROPS.spriteReady('water_tank')) return;
    var img = PROPS.img('water_tank');
    var s = spriteScale('water_tank', opt);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var a = (opt.angle || 0) * Math.PI / 180;
    var dir = (opt.dir === 'left' || opt.dir === -1) ? -1 : 1;
    ctx.save(); ctx.translate(x, y);
    if (a) ctx.rotate(a);
    if (dir < 0) ctx.scale(-1, 1);
    // 2026-10-03 蔡总新空槽素材：前壁不透明，水体画在缸体之上、clip 内腔
    var lvl = (opt.water === undefined) ? 1 : Math.max(0, Math.min(1, opt.water));
    var TK = PROPS.TANK;
    var PX = function(fr) { return (fr - 0.5) * w; };
    var PY = function(fr) { return -(1 - fr) * h; };
    ctx.drawImage(img, -w / 2, -h, w, h); // 先画缸体
    if (lvl > 0.01) {
      // 内腔侧壁 x(y): 口内0.05/0.95@0.265 → 底前0.076/0.924@0.935
      function ixL(y) { return 0.050 + (0.076 - 0.050) * Math.max(0, Math.min(1, (y - TK.front) / (TK.bot - TK.front))); }
      function ixR(y) { return 1 - ixL(y); }
      var yf = TK.front + (1 - lvl) * (TK.bot - TK.front);   // 水面前缘行frac
      var yb = Math.max(TK.back, yf - (TK.front - TK.back)); // 水面后缘
      function bxAt(y) { // 顶面后缘 x 范围
        if (y <= 0.748) return [0.130, 0.866];
        var t = (y - 0.748) / (TK.bot - 0.748);
        return [0.130 + (0.076 - 0.130) * t, 0.866 + (0.924 - 0.866) * t];
      }
      var fL = ixL(yf), fR = ixR(yf), bE = bxAt(yb);
      // 前面(梯形): 水面前缘→底前缘, 两侧内壁
      // 浊度 0..1: 清水中蓝 ↔ 乳白 线性插值（蔡总 2026-10-03 浊度滑杆）
      var tb = Math.max(0, Math.min(1, opt.turbid || 0));
      function mixc(c1, c2, a1, a2) {
        return 'rgba(' + Math.round(c1[0] + (c2[0] - c1[0]) * tb) + ',' + Math.round(c1[1] + (c2[1] - c1[1]) * tb) + ',' + Math.round(c1[2] + (c2[2] - c1[2]) * tb) + ',' + (a1 + (a2 - a1) * tb).toFixed(2) + ')';
      }
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(PX(fL), PY(yf)); ctx.lineTo(PX(fR), PY(yf));
      ctx.lineTo(PX(ixR(TK.bot)), PY(TK.bot)); ctx.lineTo(PX(ixL(TK.bot)), PY(TK.bot));
      ctx.closePath(); ctx.clip();
      var gw = ctx.createLinearGradient(0, PY(yf), 0, PY(TK.bot));
      gw.addColorStop(0, mixc([105, 185, 238], [242, 243, 239], 0.88, 0.94));
      gw.addColorStop(1, mixc([70, 150, 215], [226, 229, 223], 0.92, 0.96));
      ctx.fillStyle = gw; ctx.fillRect(-w / 2 - 2, -h - 2, w + 4, h + 4);
      ctx.restore();
      // 顶面(平行四边形): 后缘(yb)→前缘(yf)
      ctx.beginPath();
      ctx.moveTo(PX(bE[0]), PY(yb)); ctx.lineTo(PX(bE[1]), PY(yb));
      ctx.lineTo(PX(fR), PY(yf)); ctx.lineTo(PX(fL), PY(yf));
      ctx.closePath();
      ctx.fillStyle = mixc([150, 215, 250], [248, 249, 246], 0.95, 0.96);
      ctx.fill();
      // 水面前缘高光线
      ctx.strokeStyle = opt.turbid ? 'rgba(255,255,255,.9)' : 'rgba(235,248,255,.95)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(PX(fL), PY(yf)); ctx.lineTo(PX(fR), PY(yf)); ctx.stroke();
    }
    ctx.restore();
  };

  // glass_brick: 待多状态素材(scale/angle/dir)
  PROPS.glass_brick = function(ctx, x, y, opt) {
    opt = opt || {};
    if (!PROPS.spriteReady('glass_brick')) return;
    var img = PROPS.img('glass_brick');
    var s = spriteScale('glass_brick', opt);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var a = (opt.angle || 0) * Math.PI / 180;
    var dir = (opt.dir === 'left' || opt.dir === -1) ? -1 : 1;
    ctx.save(); ctx.translate(x, y);
    if (a) ctx.rotate(a);
    if (dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();
  };

  // plane_mirror: 2.5D 躺镜，纯代码绘制，(x,y)=顶面中心
  PROPS.plane_mirror = function(ctx, x, y, opt) {
    opt = opt || {};
    var w = opt.w || 300;
    var d = opt.depth || Math.max(40, w * 0.14);
    var rough = Math.max(0, Math.min(100, opt.rough || 0));
    ctx.save(); ctx.translate(x, y);
    // 顶面梯形：远边 y-0.30d 宽 0.92w；近边 y+0.30d 宽 w
    var farY = -0.30 * d, nearY = 0.30 * d;
    var farW = 0.92 * w, nearW = w;
    var fx0 = -farW / 2, fx1 = farW / 2;
    var nx0 = -nearW / 2, nx1 = nearW / 2;
    var frontH = 0.45 * d;
    var fy = nearY + frontH;
    var gradTop = ctx.createLinearGradient(0, farY, 0, nearY);
    gradTop.addColorStop(0, '#e8eef5');
    gradTop.addColorStop(1, '#c9d4e0');
    if (rough > 0) {
      var teeth = 8 + Math.floor(rough / 8);
      var amp = d * (0.015 + 0.045 * rough / 100);
      var jag = [];
      for (var i = 0; i <= teeth; i++) {
        var t = i / teeth;
        jag.push({ x: nx0 + (nx1 - nx0) * t, y: nearY + amp * Math.sin(i * 91.7 + rough) });
      }
      // 顶面：远边平直 + 近边 jag 逆序
      ctx.beginPath();
      ctx.moveTo(fx0, farY); ctx.lineTo(fx1, farY);
      for (var j = teeth; j >= 0; j--) ctx.lineTo(jag[j].x, jag[j].y);
      ctx.closePath();
      ctx.fillStyle = gradTop; ctx.fill();
      // 前面：顶边 jag 正序 + 底边平直
      var gradFront = ctx.createLinearGradient(0, nearY, 0, fy);
      gradFront.addColorStop(0, '#6b7684');
      gradFront.addColorStop(1, '#4b5563');
      ctx.beginPath();
      ctx.moveTo(jag[0].x, jag[0].y);
      for (var k = 1; k <= teeth; k++) ctx.lineTo(jag[k].x, jag[k].y);
      ctx.lineTo(nx1, fy); ctx.lineTo(nx0, fy);
      ctx.closePath();
      ctx.fillStyle = gradFront; ctx.fill();
      // 亮/暗分界锯齿描边强化
      ctx.strokeStyle = '#556070'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(jag[0].x, jag[0].y);
      for (var m = 1; m <= teeth; m++) ctx.lineTo(jag[m].x, jag[m].y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(fx0, farY); ctx.lineTo(fx1, farY);
      ctx.lineTo(nx1, nearY); ctx.lineTo(nx0, nearY);
      ctx.closePath();
      ctx.fillStyle = gradTop; ctx.fill();
    }
    // 镜面光泽：两条斜向高光带
    var shineAlpha = 0.30 * (1 - rough / 130);
    if (shineAlpha > 0.001) {
      ctx.strokeStyle = 'rgba(255,255,255,' + shineAlpha.toFixed(3) + ')';
      ctx.lineWidth = Math.max(1, w * 0.012);
      ctx.beginPath(); ctx.moveTo(fx0 + w * 0.10, farY + d * 0.05); ctx.lineTo(nx1 - w * 0.12, nearY - d * 0.02); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx0 + w * 0.22, farY + d * 0.18); ctx.lineTo(nx1 - w * 0.05, nearY + d * 0.08); ctx.stroke();
    }
    // 粗糙微面
    if (rough > 0) {
      ctx.strokeStyle = 'rgba(230,235,240,0.35)';
      ctx.lineWidth = Math.max(0.6, w * 0.004);
      var n = Math.floor(6 + rough / 10);
      for (var i = 0; i < n; i++) {
        var t0 = (i + 0.2) / n;
        var sx = fx0 + (nx1 - fx0) * t0;
        var sy = farY + (nearY - farY) * (0.2 + 0.6 * ((Math.sin(i * 127.1 + rough) + 1) / 2));
        ctx.beginPath(); ctx.moveTo(sx, sy);
        for (var j = 0; j < 4; j++) {
          var tt = (j + 1) / 4;
          var px = sx + (nx1 - sx) * tt * 0.35;
          var py = sy + (nearY - sy) * tt + Math.sin(i * 127.1 + rough + j * 33.7) * d * 0.02;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
    // rough>0 时前面已在顶面分支内绘制；平直分支才需下面这段
    // 左右侧三角连接
    ctx.fillStyle = '#8b96a5';
    ctx.beginPath(); ctx.moveTo(fx0, farY); ctx.lineTo(nx0, nearY); ctx.lineTo(nx0, fy); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(fx1, farY); ctx.lineTo(nx1, nearY); ctx.lineTo(nx1, fy); ctx.closePath(); ctx.fill();
    // 全件描边
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fx0, farY); ctx.lineTo(fx1, farY);
    ctx.lineTo(nx1, nearY); ctx.lineTo(nx1, fy); ctx.lineTo(nx0, fy); ctx.lineTo(nx0, nearY);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  // sun: 手绘太阳，纯代码绘制，(x,y)=圆心
  PROPS.sun = function(c, x, y, opts) {
    opts = opts || {};
    var r = opts.r || 40;
    var rays = opts.rays || 12;
    var hover = !!opts.hover;
    c.save();
    var g = c.createRadialGradient(x, y, r * 0.25, x, y, r);
    g.addColorStop(0, '#ffd43b'); g.addColorStop(1, '#ff922b');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.strokeStyle = 'rgba(255,212,59,0.25)'; c.lineWidth = r * 0.35;
    c.beginPath(); c.arc(x, y, r * 1.3, 0, 7); c.stroke();
    c.fillStyle = '#ffd43b';
    for (var i = 0; i < rays; i++) {
      var th = i * (360 / rays) * Math.PI / 180, r1 = r * 1.15, r2 = r * 1.55;
      c.beginPath(); c.moveTo(x + r1 * Math.cos(th), y + r1 * Math.sin(th));
      c.lineTo(x + r2 * Math.cos(th + 7 * Math.PI / 180), y + r2 * Math.sin(th + 7 * Math.PI / 180));
      c.lineTo(x + r2 * Math.cos(th - 7 * Math.PI / 180), y + r2 * Math.sin(th - 7 * Math.PI / 180));
      c.closePath(); c.fill();
    }
    if (hover) {
      c.strokeStyle = '#e0a20a'; c.lineWidth = 2;
      c.beginPath(); c.arc(x, y, r * 1.5, 0, 7); c.stroke();
    }
    c.restore();
  };

  // paper_board: fold=0~85度沿竖直中线2.5D折叠(右半压缩+阴影)
  PROPS.paper_board = function(ctx, x, y, opt) {
    opt = opt || {};
    if (!PROPS.spriteReady('paper_board')) return;
    var img = PROPS.img('paper_board');
    var s = spriteScale('paper_board', opt);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var a = (opt.angle || 0) * Math.PI / 180;
    var dir = (opt.dir === 'left' || opt.dir === -1) ? -1 : 1;
    var fold = Math.max(0, Math.min(85, opt.fold || 0));
    var cf = Math.cos(fold * Math.PI / 180);
    ctx.save(); ctx.translate(x, y);
    if (a) ctx.rotate(a);
    if (dir < 0) ctx.scale(-1, 1);
    if (fold <= 0) {
      ctx.drawImage(img, -w / 2, -h, w, h);
    } else {
      var topF = 0.0122, botF = 0.9976, foldTop = 0.0805, foldBot = 0.9976;
      ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 - 1, -h + h * topF - 1, w / 2 + 1, h * (botF - topF) + 2); ctx.clip();
      ctx.drawImage(img, -w / 2, -h, w, h); ctx.restore();
      var iw = img.naturalWidth, ih = img.naturalHeight;
      // 折过来半:源图自折线顶缘水平切平(去透视翘角),顶缘与左半折线处齐平
      ctx.drawImage(img, iw / 2, ih * foldTop, iw / 2, ih * (foldBot - foldTop), 0, -h + h * foldTop, (w / 2) * cf, h * (foldBot - foldTop));
      ctx.fillStyle = 'rgba(35,40,70,' + (0.22 * (1 - cf)).toFixed(3) + ')';
      ctx.fillRect(0, -h + h * foldTop, (w / 2) * cf, h * (foldBot - foldTop));
      ctx.strokeStyle = 'rgba(120,120,130,.8)'; ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(0, -h + h * foldTop); ctx.lineTo(0, -h + h * foldBot); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  };

  // candle: lit=false 过渡遮罩
  PROPS.candle = function(ctx, x, y, opt) {
    opt = opt || {};
    if (!PROPS.spriteReady('candle')) return;
    var img = PROPS.img('candle');
    var s = spriteScale('candle', opt);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var a = (opt.angle || 0) * Math.PI / 180;
    var dir = (opt.dir === 'left' || opt.dir === -1) ? -1 : 1;
    ctx.save(); ctx.translate(x, y);
    if (a) ctx.rotate(a);
    if (dir < 0) ctx.scale(-1, 1);
    if (opt.lit === false && PROPS.spriteReady('candle_unlit')) {
      var uimg = PROPS.img('candle_unlit');
      var uw = uimg.naturalWidth * s, uh = uimg.naturalHeight * s;
      ctx.drawImage(uimg, -uw / 2, -uh, uw, uh);
    } else {
      ctx.drawImage(img, -w / 2, -h, w, h);
    }
    if (opt.lit === false) {
      if (!PROPS.spriteReady('candle_unlit')) {
        ctx.fillStyle = '#f5f2ec';
        ctx.fillRect(-w / 2 - 1, -h - 1, w + 2, h * 0.27);
      }
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = Math.max(1.5, w * 0.02); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, -h * 0.73); ctx.lineTo(0, -h * 0.79); ctx.stroke();
    }
    ctx.restore();
  };

  // 2.5D 透视卷帘屏（PhET geometric-optics ProjectionScreen 同款：近边高/远边高=1.09/0.91）
  // 投影内容 clip 用 PROPS.screenGeom().pts；opt.w 被忽略，屏几何全由 h 推导
  function geomOf(h) {
    var fw = 0.36 * h;
    var cy = -h / 2;
    return {
      fw: fw,
      cy: cy,
      TL: { x: -fw / 2, y: cy - 0.455 * h },
      BL: { x: -fw / 2, y: cy + 0.455 * h },
      BR: { x: fw / 2, y: cy + 0.545 * h },
      TR: { x: fw / 2, y: cy - 0.545 * h }
    };
  }
  PROPS.screen = function(ctx, x, y, opt) {
    opt = opt || {};
    // 兼容旧 opt.h / opt.scale；opt.w 忽略
    var s = opt.h ? opt.h / 467 : (opt.scale || 1);
    var h = 467 * s;
    var a = (opt.angle || 0) * Math.PI / 180;
    var dir = (opt.dir === 'left' || opt.dir === -1) ? -1 : 1;
    ctx.save(); ctx.translate(x, y);
    if (a) ctx.rotate(a);
    if (dir < 0) ctx.scale(-1, 1);
    var g = geomOf(h);
    function bar(p1, p2) {
      var dx = p2.x - p1.x, dy = p2.y - p1.y;
      var len = Math.hypot(dx, dy) || 1;
      var ux = dx / len, uy = dy / len;
      var nx = -uy, ny = ux;
      var o = 0.05 * h, t = 0.055 * h / 2;
      ctx.beginPath();
      ctx.moveTo(p1.x - ux * o - nx * t, p1.y - uy * o - ny * t);
      ctx.lineTo(p2.x + ux * o - nx * t, p2.y + uy * o - ny * t);
      ctx.lineTo(p2.x + ux * o + nx * t, p2.y + uy * o + ny * t);
      ctx.lineTo(p1.x - ux * o + nx * t, p1.y - uy * o + ny * t);
      ctx.closePath();
      ctx.fillStyle = '#94a3b8'; ctx.fill();
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = Math.max(1, h * 0.008); ctx.stroke();
    }
    // 拉杆 + 圆钮
    var midB = { x: (g.BL.x + g.BR.x) / 2, y: (g.BL.y + g.BR.y) / 2 };
    var rodLen = 0.12 * h;
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = Math.max(1.5, h * 0.01); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(midB.x, midB.y); ctx.lineTo(midB.x, midB.y + rodLen); ctx.stroke();
    var knobR = Math.max(1.5, 0.022 * h);
    ctx.fillStyle = '#b4b4b4'; ctx.strokeStyle = '#64748b'; ctx.lineWidth = Math.max(1, h * 0.008);
    ctx.beginPath(); ctx.arc(midB.x, midB.y + rodLen, knobR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 底杆 → 屏面 → 顶杆（顶杆压屏面上缘）
    bar(g.BL, g.BR);
    ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#334155'; ctx.lineWidth = Math.max(1.5, h * 0.012);
    ctx.beginPath();
    ctx.moveTo(g.TL.x, g.TL.y); ctx.lineTo(g.BL.x, g.BL.y);
    ctx.lineTo(g.BR.x, g.BR.y); ctx.lineTo(g.TR.x, g.TR.y); ctx.closePath();
    ctx.fill(); ctx.stroke();
    bar(g.TL, g.TR);
    ctx.restore();
  };

  // 返回光屏几何（全局坐标，未施加 angle/dir 变换），供投影内容 clip
  PROPS.screenGeom = function(x, y, h) {
    var g = geomOf(h);
    return {
      cx: x,
      cy: y + g.cy,
      fw: g.fw,
      pts: {
        TL: { x: x + g.TL.x, y: y + g.TL.y },
        BL: { x: x + g.BL.x, y: y + g.BL.y },
        BR: { x: x + g.BR.x, y: y + g.BR.y },
        TR: { x: x + g.TR.x, y: y + g.TR.y }
      },
      faceX: x
    };
  };

  // board_with_hole: 真挖孔渲染。离屏缓冲复用 PROPS._boardBuf，孔位/孔径算法不变。
  PROPS.board_with_hole = function(ctx, x, y, opt) {
    opt = opt || {};
    if (!PROPS.spriteReady('board_with_hole')) return;
    var img = PROPS.img('board_with_hole');
    var s = spriteScale('board_with_hole', opt);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var a = (opt.angle || 0) * Math.PI / 180;
    var dir = (opt.dir === 'left' || opt.dir === -1) ? -1 : 1;
    ctx.save(); ctx.translate(x, y);
    if (a) ctx.rotate(a);
    if (dir < 0) ctx.scale(-1, 1);
    if (opt.noHole) {
      ctx.drawImage(img, -w / 2, -h, w, h);
    } else {
      var buf = PROPS._boardBuf;
      var bw = Math.ceil(w), bh = Math.ceil(h);
      if (!buf || buf.width !== bw || buf.height !== bh) {
        buf = document.createElement('canvas');
        buf.width = bw; buf.height = bh;
        PROPS._boardBuf = buf;
      }
      var bctx = buf.getContext('2d');
      bctx.clearRect(0, 0, bw, bh);
      bctx.drawImage(img, 0, 0, w, h);
      var BH = PROPS.BOARD_HOLE;
      var hx = w * BH.cx + (opt.holeDx || 0) * s;
      var hy = h * BH.cy + (opt.holeDy || 0) * s;
      var hr = Math.max(2, (opt.holeR === undefined ? BH.r : opt.holeR) * s);
      bctx.globalCompositeOperation = 'destination-out';
      bctx.beginPath(); bctx.arc(hx, hy, hr, 0, Math.PI * 2); bctx.fill();
      bctx.globalCompositeOperation = 'source-atop';
      bctx.strokeStyle = 'rgba(0,0,0,.25)';
      bctx.lineWidth = Math.max(1, hr * 0.12);
      bctx.beginPath(); bctx.arc(hx, hy, hr, 0, Math.PI * 2); bctx.stroke();
      bctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(buf, -w / 2, -h, w, h);
    }
    ctx.restore();
  };

  // desk_lamp: lit=false 换无光晕素材(desk_lamp_off); glow=true 可叠加代码光晕
  PROPS.desk_lamp = function(ctx, x, y, opt) {
    opt = opt || {};
    var lid = (opt.lit === false && PROPS.spriteReady('desk_lamp_off')) ? 'desk_lamp_off' : 'desk_lamp';
    if (!PROPS.spriteReady(lid)) return;
    var img = PROPS.img(lid);
    var s = spriteScale('desk_lamp', opt);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var a = (opt.angle || 0) * Math.PI / 180;
    var dir = (opt.dir === 'left' || opt.dir === -1) ? -1 : 1;
    ctx.save(); ctx.translate(x, y);
    if (a) ctx.rotate(a);
    if (dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h, w, h);
    if (opt.glow) {
      var cx = w * 0.30, cy = -h * 0.55, r = w * 0.65;
      var g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
      g.addColorStop(0, 'rgba(255,247,176,.45)');
      g.addColorStop(1, 'rgba(255,247,176,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  // hand_shadow: 纯 sprite（肤色版支持 opt.skin）
  PROPS.hand_shadow = function(ctx, x, y, opt) {
    opt = opt || {};
    var hid = (opt.skin && PROPS.spriteReady('hand_shadow_skin')) ? 'hand_shadow_skin' : 'hand_shadow';
    if (!PROPS.spriteReady(hid)) return;
    var img = PROPS.img(hid);
    var s = spriteScale(hid, opt);
    // 肤色版与黑版显示尺寸对齐:按黑版原生高归一(gallery fit 以黑版尺寸计算)
    if (hid !== 'hand_shadow' && PROPS.spriteReady('hand_shadow')) {
      s = s * PROPS.img('hand_shadow').naturalHeight / img.naturalHeight;
    }
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var a = (opt.angle || 0) * Math.PI / 180;
    var dir = (opt.dir === 'left' || opt.dir === -1) ? -1 : 1;
    ctx.save(); ctx.translate(x, y);
    if (a) ctx.rotate(a);
    if (dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();
  };

  // smoke_box: 纯 sprite
  PROPS.smoke_box = function(ctx, x, y, opt) {
    opt = opt || {};
    if (!PROPS.spriteReady('smoke_box')) return;
    var img = PROPS.img('smoke_box');
    var s = spriteScale('smoke_box', opt);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var a = (opt.angle || 0) * Math.PI / 180;
    var dir = (opt.dir === 'left' || opt.dir === -1) ? -1 : 1;
    ctx.save(); ctx.translate(x, y);
    if (a) ctx.rotate(a);
    if (dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();
  };


  // bench: 实验桌面组件（奶油黄背景 + 横纹木桌面 + 灰桌身），返回 {benchTopY,benchH}
  PROPS.bench = function(ctx, W, H, opt) {
    opt = opt || {};
    var topRatio = opt.topRatio || 0.80;
    var thickRatio = opt.thickRatio || 0.04;
    var cool = opt.tone === 'cool';
    var wood = opt.wood || (cool ? ['#dfe6ee','#cbd5e1'] : ['#e8dcc0','#dcd0b0']);
    var sideColor = opt.sideColor || (cool ? '#9aa8b8' : 'rgb(160,160,160)');
    function rand(seed) { var x = Math.sin(seed) * 10000; return x - Math.floor(x); }
    var by = H * topRatio, bh = H * thickRatio;
    ctx.fillStyle = cool ? '#e8f1f8' : '#f9f4cd'; ctx.fillRect(0, 0, W, H);
    var g = ctx.createLinearGradient(0, by, 0, by + bh);
    g.addColorStop(0, wood[0]); g.addColorStop(1, wood[1]);
    ctx.fillStyle = g; ctx.fillRect(0, by, W, bh);
    for (var y = by + 2; y < by + bh; y += (2 + rand(y * 17) * 2)) {
      ctx.strokeStyle = cool
        ? 'rgba(148,163,184,' + (0.16 + rand(y * 11) * 0.12).toFixed(2) + ')'
        : 'rgba(150,125,85,' + (0.10 + rand(y * 11) * 0.08) + ')';
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, by + 0.5); ctx.lineTo(W, by + 0.5); ctx.stroke();
    ctx.fillStyle = sideColor; ctx.fillRect(0, by + bh, W, H - by - bh);
    return { benchTopY: by, benchH: bh };
  };

  // toolbox: 收纳卡组件
  PROPS.toolbox = {
    create: function(spec) {
      spec = spec || {};
      var card = spec.card || { x: 16, y: 16, w: 220, h: 92, r: 10, fill: '#dce6f2', stroke: '#b8c6da' };
      var items = (spec.items || []).slice();
      var fit = spec.fit || 56;
      var nat = spec.nat || {};
      function roundRect(ctx, x, y, w, h, r) {
        var rr = Math.min(r, w / 2, h / 2);
        ctx.beginPath(); ctx.moveTo(x + rr, y); ctx.lineTo(x + w - rr, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + rr); ctx.lineTo(x + w, y + h - rr);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h); ctx.lineTo(x + rr, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - rr); ctx.lineTo(x, y + rr);
        ctx.quadraticCurveTo(x, y, x + rr, y); ctx.closePath();
      }
      var slots = items.map(function(it) {
        var n = nat[it.id] || {};
        var w = fit, h = fit;
        if (n.w && n.h) { var sc = Math.min(fit / n.w, fit / n.h); w = Math.round(n.w * sc); h = Math.round(n.h * sc); }
        return { id: it.id, x: it.x, y: it.y, w: w, h: h };
      });
      return {
        card: card, slots: slots,
        drawCard: function(ctx) {
          ctx.save(); ctx.fillStyle = card.fill; ctx.strokeStyle = card.stroke; ctx.lineWidth = 1;
          roundRect(ctx, card.x, card.y, card.w, card.h, card.r); ctx.fill(); ctx.stroke(); ctx.restore();
        },
        drawThumb: function(ctx, id, cx, cyBottom) {
          var slot = null;
          for (var i = 0; i < slots.length; i++) if (slots[i].id === id) { slot = slots[i]; break; }
          if (!slot || !PROPS[id]) return;
          PROPS[id](ctx, cx, cyBottom, { w: slot.w, h: slot.h });
        },
        hitSlot: function(p) {
          var best = null, bestD = Infinity;
          for (var i = 0; i < slots.length; i++) {
            var s = slots[i];
            var hw = s.w / 2 + 12, hh = s.h / 2 + 12, cx = s.x, cy = s.y;
            if (p.x >= cx - hw && p.x <= cx + hw && p.y >= cy - hh && p.y <= cy + hh) {
              var d = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
              if (d < bestD) { bestD = d; best = s; }
            }
          }
          return best;
        },
        pointInCard: function(p) {
          return p.x >= card.x && p.x <= card.x + card.w && p.y >= card.y && p.y <= card.y + card.h;
        },
        rectInCard: function(r) {
          return !(r.R < card.x || r.L > card.x + card.w || r.B < card.y || r.T > card.y + card.h);
        },
        storedPos: function(id) {
          for (var i = 0; i < slots.length; i++) if (slots[i].id === id) {
            var s = slots[i]; return { x: s.x, y: s.y + s.h / 2 };
          }
          return null;
        }
      };
    }
  };

  // prism: 三棱镜 3D 程序化版（蔡总 2026-10-09 21:59 定版：贴图版删除，实验页 drawPrism3D 沉库为唯一实现）
  // (x,y)=底边中心（底面坐深、后角坐桌）；opt={h=高(默认120), angle=yaw度(绕竖直轴真旋转、外法向可见性排序)}
  PROPS.prism = function(ctx, x, y, opt) {
    opt = opt || {};
    var h = opt.h || 120;
    var yawDeg = opt.angle || 0;
    ctx.save();
    var th = yawDeg * Math.PI / 180, r = h * 0.42, T = [], B = [];
    for (var k = 0; k < 3; k++) { var a = th + k * 2 * Math.PI / 3; var tx = x + r * Math.cos(a), ty = y - h - 0.30 * r * Math.sin(a); T.push({x: tx, y: ty}); B.push({x: tx, y: ty + h}); }
    var byMax = Math.max(B[0].y, B[1].y, B[2].y), dy = y - byMax;
    T = T.map(function(p) { return {x: p.x, y: p.y + dy}; }); B = B.map(function(p) { return {x: p.x, y: p.y + dy}; });
    var srt = [0, 1, 2].sort(function(i1, i2) { return T[i1].x - T[i2].x; });
    var iL = srt[0], iR = srt[2], iM = srt[1];
    var t = (T[iM].x - T[iL].x) / ((T[iR].x - T[iL].x) || 1), yLR = T[iL].y + (T[iR].y - T[iL].y) * t;
    var low = (T[iM].y > yLR) ? [iL, iM, iR] : [iL, iR];
    for (var i = 0; i < low.length - 1; i++) {
      var a1 = low[i], a2 = low[i + 1];
      ctx.beginPath(); ctx.moveTo(T[a1].x, T[a1].y); ctx.lineTo(T[a2].x, T[a2].y); ctx.lineTo(B[a2].x, B[a2].y); ctx.lineTo(B[a1].x, B[a1].y); ctx.closePath();
      var g = ctx.createLinearGradient(T[a1].x, 0, T[a2].x, 0);
      g.addColorStop(0, 'rgba(176,214,236,0.78)'); g.addColorStop(1, 'rgba(226,243,250,0.78)');
      ctx.fillStyle = g; ctx.fill();
    }
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(B[low[0]].x, B[low[0]].y);
    for (var i2 = 1; i2 < low.length; i2++) ctx.lineTo(B[low[i2]].x, B[low[i2]].y);
    ctx.stroke();
    low.forEach(function(ix) { ctx.beginPath(); ctx.moveTo(T[ix].x, T[ix].y); ctx.lineTo(B[ix].x, B[ix].y); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(T[0].x, T[0].y); ctx.lineTo(T[1].x, T[1].y); ctx.lineTo(T[2].x, T[2].y); ctx.closePath();
    ctx.fillStyle = 'rgba(236,248,252,0.92)'; ctx.fill(); ctx.stroke();
    ctx.restore();
  };

  // glass_plate: 竖立玻璃板（含底座），(x,y)=整体底边中心
  PROPS.glass_plate = function(ctx, x, y, opt) {
    /* R25c 蔡总：玻璃板=绕纵轴旋转的竖立 2.5D（旧 R25b 侧边斜=绕横轴歪=要倒了）；几何照旧版 PNG 探针：侧边竖直、上下边右斜 drop=s*w、顶面薄平行四边形退向右后上、右侧厚度面；(x,y)=底边中心；opt.h 显示高；总宽≈0.39h 对齐旧图 0.41h */
    opt = opt || {};
    var h = opt.h || 160;
    var a = opt.angle || 0;
    var w = h * 0.34, drop = h * 0.085, dx = h * 0.030, dy = -dx * 0.4, fh = h - drop; // R25d 蔡总：旋转角加大（drop 0.048→0.085h，超旧图 0.076h）、厚度再减（dx 0.05→0.030h）、去中间白竖纹
    ctx.save(); ctx.translate(x, y);
    if (a) ctx.rotate(a);
    ctx.lineWidth = Math.max(1.2, h * 0.008); ctx.strokeStyle = '#64748b'; ctx.lineJoin = 'round';
    // 顶面（退向右后上）
    ctx.beginPath(); ctx.moveTo(-w / 2, -h); ctx.lineTo(w / 2, -fh); ctx.lineTo(w / 2 + dx, -fh + dy); ctx.lineTo(-w / 2 + dx, -h + dy); ctx.closePath();
    ctx.fillStyle = 'rgba(225,242,250,0.60)'; ctx.fill(); ctx.stroke();
    // 右侧厚度面（侧边竖直）
    ctx.beginPath(); ctx.moveTo(w / 2, -fh); ctx.lineTo(w / 2 + dx, -fh + dy); ctx.lineTo(w / 2 + dx, dy); ctx.lineTo(w / 2, 0); ctx.closePath();
    ctx.fillStyle = 'rgba(150,196,216,0.45)'; ctx.fill(); ctx.stroke();
    // 板面（平行四边形：侧边竖直、上下边右斜）
    ctx.beginPath(); ctx.moveTo(-w / 2, -drop); ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2, -fh); ctx.lineTo(-w / 2, -h); ctx.closePath();
    ctx.fillStyle = 'rgba(191,225,240,0.30)'; ctx.fill(); ctx.stroke();
    ctx.restore();
  };

  // screen_wide: 加宽横幕（c4s345 新增），(x,y)=整件底边中心；opt.h 显示高（默认300）
  PROPS.screen_wide = function(ctx, x, y, opt) {
    opt = opt || {};
    var id = 'screen_wide';
    var h = opt.h || 300;
    ctx.save(); ctx.translate(x, y);
    if (!PROPS.spriteReady(id)) {
      var w = h * 1.1918;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      ctx.strokeRect(-w / 2, -h, w, h);
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }
    var img = PROPS.img(id);
    var s = h / img.naturalHeight;
    var w = img.naturalWidth * s;
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();
  };

  // 加宽横幕几何（全局坐标）：幕面占图比例为主会话像素实测，硬编码不许改
  PROPS.screenWideGeom = function(x, y, h) {
    var w = h * 1.1918;
    return {
      cx: x, w: w,
      xL: x - w / 2 + 0.119 * w,
      xR: x - w / 2 + 0.911 * w,
      yT: y - h + 0.006 * h,
      yB: y - h + 0.747 * h,
      faceW: 0.792 * w
    };
  };

  // observer_eye: 观察者眼（蔡总 2026-10-10 素材入库），(x,y)=包围盒中心；opt.h 显示高（默认48），dir='right' 水平翻转
  PROPS.observer_eye = function(ctx, x, y, opt) {
    opt = opt || {};
    var id = 'observer_eye';
    var h = opt.h || 48;
    var dir = (opt.dir === 'right' || opt.dir === -1) ? -1 : 1;
    ctx.save(); ctx.translate(x, y);
    ctx.scale(dir, 1);
    if (!PROPS.spriteReady(id)) {
      var w = h * 1.0603;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }
    var img = PROPS.img(id);
    var s = h / img.naturalHeight;
    var w = img.naturalWidth * s;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  };

  // submarine_hull: 潜艇水下剖面艇体（蔡总 2026-10-10 Seedream生成+抠图入库），(x,y)=包围盒中心；opt.w 显示宽（高=opt.w/5.136，来源=sprite实测bbox宽高比）
  PROPS.submarine_hull = function(ctx, x, y, opt) {
    opt = opt || {};
    var id = 'submarine_hull';
    var w = opt.w || 300;
    var h = w / 5.136;
    ctx.save(); ctx.translate(x, y);
    if (!PROPS.spriteReady(id)) {
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }
    var img = PROPS.img(id);
    var s = w / img.naturalWidth;
    var dh = img.naturalHeight * s;
    ctx.drawImage(img, -w / 2, -dh / 2, w, dh);
    ctx.restore();
  };

  // === wood_desk: 全屏木质桌带（蔡总 2026-10-09 验收定版，以后所有实验桌面统一用它） ===
  // opt={by,fy}：by=桌面顶线（顶面起点）、fy=地板线（前缘底边）；顶面 by→by+64 斜向自然木纹、白高光亮线4px、前缘 by+68→fy 竖向自然木纹、底缘阴影3px
  // opt.x0/opt.x1（默认 0/W）=桌带水平范围
  // 左出屏弯折桌变体（蔡总 14:11 定版沉库）：{x0:0, x1:<桌边>, bend:true, legTo:<立板底边>}——x1=进出屏长度随意调；bend=顶面深度三角+同板90°弯折立板(宽45=板厚)+2.5D右侧面(斜宽sideDx默认40)；legTo默认fy
  PROPS._wrnd = function(s) {
    var x = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  PROPS._wobLine = function(c, x1, y1, x2, y2, seed, amp, segs) {
    c.beginPath(); c.moveTo(x1, y1);
    for (var k = 1; k <= segs; k++) {
      var t = k / segs;
      var px = x1 + (x2 - x1) * t, py = y1 + (y2 - y1) * t;
      if (k < segs) {
        px += (PROPS._wrnd(seed * 7.3 + k * 3.1) - 0.5) * 2 * amp;
        py += (PROPS._wrnd(seed * 3.7 + k * 5.9) - 0.5) * amp * 0.5;
      }
      c.lineTo(px, py);
    }
    c.stroke();
  };
  PROPS.wood_desk = function(ctx, W, H, opt) {
    var by = opt.by, fy = opt.fy;
    var X0 = (typeof opt.x0 === 'number') ? opt.x0 : 0;
    var X1 = (typeof opt.x1 === 'number') ? opt.x1 : W;
    var topH = 64, topB = by + topH;
    var tg = ctx.createLinearGradient(0, by, 0, topB);
    tg.addColorStop(0, '#e3d3ab'); tg.addColorStop(1, '#d6c294');
    ctx.fillStyle = tg; ctx.fillRect(X0, by, X1 - X0, topH);
    ctx.save(); ctx.beginPath(); ctx.rect(X0, by, X1 - X0, topH); ctx.clip();
    var gi = 0, gx;
    for (gx = X0 - topH; gx < X1 + topH; ) {
      ctx.strokeStyle = 'rgba(165,135,85,' + (0.10 + PROPS._wrnd(gi * 2.3) * 0.14).toFixed(2) + ')';
      ctx.lineWidth = 0.9 + PROPS._wrnd(gi * 4.1) * 0.9;
      var t0 = PROPS._wrnd(gi * 5.7) * 0.4;
      PROPS._wobLine(ctx, gx + topH * 0.62 * t0, topB - topH * t0, gx + topH * 0.62, by, gi + 1, 2.4, 4);
      gi++; gx += 10 + PROPS._wrnd(gi * 1.7) * 7;
    }
    gi = 0;
    for (gx = X0 - topH; gx < X1 + topH; ) {
      ctx.strokeStyle = 'rgba(150,118,70,' + (0.09 + PROPS._wrnd(gi * 9.7 + 21) * 0.08).toFixed(2) + ')';
      ctx.lineWidth = 2.4 + PROPS._wrnd(gi * 10.3 + 22) * 1.4;
      PROPS._wobLine(ctx, gx, topB, gx + topH * 0.62, by, gi + 200, 2.8, 4);
      gi++; gx += 56 + PROPS._wrnd(gi * 9.1 + 20) * 24;
    }
    ctx.restore();
    ctx.fillStyle = '#f6ecd4'; ctx.fillRect(X0, topB, X1 - X0, 4);
    var fg = ctx.createLinearGradient(0, topB + 4, 0, fy);
    fg.addColorStop(0, '#dcc99c'); fg.addColorStop(1, '#c8b183');
    ctx.fillStyle = fg; ctx.fillRect(X0, topB + 4, X1 - X0, fy - topB - 4);
    gi = 0;
    for (gx = X0 + 3; gx < X1; ) {
      ctx.strokeStyle = 'rgba(150,120,70,' + (0.12 + PROPS._wrnd(gi * 3.3 + 41) * 0.14).toFixed(2) + ')';
      ctx.lineWidth = 0.8 + PROPS._wrnd(gi * 4.7 + 42) * 0.8;
      PROPS._wobLine(ctx, gx, topB + 6, gx, fy - 3, gi + 60, 1.7, 3);
      gi++; gx += 4 + PROPS._wrnd(gi * 2.9 + 40) * 4;
    }
    gi = 0;
    for (gx = X0 + 20; gx < X1; ) {
      ctx.strokeStyle = 'rgba(140,108,60,' + (0.09 + PROPS._wrnd(gi * 7.7 + 81) * 0.10).toFixed(2) + ')';
      ctx.lineWidth = 2 + PROPS._wrnd(gi * 8.3 + 82) * 1.2;
      PROPS._wobLine(ctx, gx, topB + 6, gx, fy - 3, gi + 120, 2.0, 3);
      gi++; gx += 34 + PROPS._wrnd(gi * 6.1 + 80) * 20;
    }
    ctx.fillStyle = 'rgba(110,82,45,0.45)'; ctx.fillRect(X0, fy - 3, X1 - X0, 3);
    if (opt.bend) {
      var legTo = (typeof opt.legTo === 'number') ? opt.legTo : fy;
      var dxs = (typeof opt.sideDx === 'number') ? opt.sideDx : 40;
      var D = 64;
      ctx.save(); ctx.beginPath(); ctx.moveTo(X1, by); ctx.lineTo(X1 + dxs, by); ctx.lineTo(X1, by + topH); ctx.closePath(); ctx.clip();
      var tgg = ctx.createLinearGradient(0, by, 0, by + topH);
      tgg.addColorStop(0, '#e3d3ab'); tgg.addColorStop(1, '#d6c294');
      ctx.fillStyle = tgg; ctx.fillRect(X1, by, dxs, topH);
      var gt = 0;
      for (var gxt = X1 - dxs; gxt < X1 + dxs; ) {
        ctx.strokeStyle = 'rgba(165,135,85,' + (0.10 + PROPS._wrnd(gt * 2.3 + 401) * 0.14).toFixed(2) + ')';
        ctx.lineWidth = 0.9 + PROPS._wrnd(gt * 4.1 + 402) * 0.9;
        PROPS._wobLine(ctx, gxt + 40, by + topH, gxt + 80, by, gt + 420, 2.4, 4);
        gt++; gxt += 10 + PROPS._wrnd(gt * 1.7 + 400) * 7;
      }
      ctx.restore();
      var tw = 45, ex = X1 - tw, yC = fy;
      var lg = ctx.createLinearGradient(ex, 0, X1, 0);
      lg.addColorStop(0, '#c8b183'); lg.addColorStop(1, '#dcc99c');
      ctx.fillStyle = lg; ctx.fillRect(ex, yC, tw, legTo - yC);
      var gii = 0;
      for (var gy = yC + 6; gy < legTo - 2; ) {
        ctx.strokeStyle = 'rgba(150,120,70,' + (0.12 + PROPS._wrnd(gii * 3.3 + 41) * 0.14).toFixed(2) + ')';
        ctx.lineWidth = 0.8 + PROPS._wrnd(gii * 4.7 + 42) * 0.8;
        PROPS._wobLine(ctx, ex + 4, gy, X1 - 5, gy, gii + 60, 1.7, 3);
        gii++; gy += 4 + PROPS._wrnd(gii * 2.9 + 40) * 4;
      }
      gii = 0;
      for (var gy2 = yC + 16; gy2 < legTo - 2; ) {
        ctx.strokeStyle = 'rgba(140,108,60,' + (0.09 + PROPS._wrnd(gii * 7.7 + 81) * 0.10).toFixed(2) + ')';
        ctx.lineWidth = 2 + PROPS._wrnd(gii * 8.3 + 82) * 1.2;
        PROPS._wobLine(ctx, ex + 4, gy2, X1 - 5, gy2, gii + 120, 2.0, 3);
        gii++; gy2 += 34 + PROPS._wrnd(gii * 6.1 + 80) * 20;
      }
      ctx.strokeStyle = 'rgba(110,82,45,0.16)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ex, yC); ctx.lineTo(X1 - 4, by + topH + 4); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ex, yC + 2); ctx.lineTo(X1 - 4, by + topH + 6); ctx.stroke();
      ctx.fillStyle = '#f6ecd4'; ctx.fillRect(X1 - 4, by + topH, 4, legTo - by - topH);
      ctx.fillStyle = 'rgba(110,82,45,0.45)'; ctx.fillRect(ex, yC, 3, legTo - yC);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(X1, by + topH); ctx.lineTo(X1 + dxs, by); ctx.lineTo(X1 + dxs, legTo); ctx.lineTo(X1, legTo); ctx.closePath(); ctx.clip();
      var sg = ctx.createLinearGradient(X1, 0, X1 + dxs, 0);
      sg.addColorStop(0, '#d6c294'); sg.addColorStop(1, '#c0a878');
      ctx.fillStyle = sg; ctx.fillRect(X1, by - D - 6, dxs, legTo - by + D + 12);
      var g3 = 0;
      for (var gx5 = X1 + 4; gx5 < X1 + dxs - 2; ) {
        ctx.strokeStyle = 'rgba(150,118,70,' + (0.10 + PROPS._wrnd(g3 * 3.9 + 301) * 0.12).toFixed(2) + ')';
        ctx.lineWidth = 0.9 + PROPS._wrnd(g3 * 4.3 + 302) * 0.9;
        PROPS._wobLine(ctx, gx5, by - D, gx5, legTo, g3 + 320, 1.5, 4);
        g3++; gx5 += 4 + PROPS._wrnd(g3 * 5.7 + 300) * 4;
      }
      g3 = 0;
      for (var gx6 = X1 + 10; gx6 < X1 + dxs - 2; ) {
        ctx.strokeStyle = 'rgba(140,108,60,' + (0.08 + PROPS._wrnd(g3 * 7.1 + 341) * 0.09).toFixed(2) + ')';
        ctx.lineWidth = 2 + PROPS._wrnd(g3 * 8.9 + 342) * 1.1;
        PROPS._wobLine(ctx, gx6, by - D, gx6, legTo, g3 + 360, 1.8, 4);
        g3++; gx6 += 30 + PROPS._wrnd(g3 * 6.3 + 340) * 18;
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X1, by + topH); ctx.lineTo(X1 + dxs, by); ctx.stroke();
      ctx.strokeStyle = 'rgba(110,82,45,0.25)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X1 + dxs, by); ctx.lineTo(X1 + dxs, legTo); ctx.stroke();
    }
    return { by: by, fy: fy, topB: topB, x0: X0, x1: X1 };
  };

  /* == 桌面摆放规则（蔡总 2026-10-09 15:40 定版沉库；以后所有需放桌面的实验器材一律照此摆放） ==
     R1 坐深居中：器材等轴测足迹竖向跨度 span 居中于桌面进深带 [by, by+topH]，seatY=PROPS.seatY(by,topH,span)；span 按器材几何算（三棱柱 span≈0.218*h）；上下留白相等、不贴桌沿
     R2 零投影：器材直接坐桌面、不画接地阴影/椭圆影（阴影形与足迹不重合会露楔缝=悬空感；蔡总 R31/R34 两轮定）
     R3 连线锚实时轮廓：光线/绳/杆等连到器材的端点=器材当前轮廓左右极点 PROPS.silhouetteX(x,r,yawDeg)，随旋转/拖动实时跟随，禁用固定偏移（蔡总 R34 定：旋转拖动光线不许断）
     R4 拖拽夹取在桌面带内：器材拖拽 x 范围 ⊂ [x0+margin, x1-margin]，不许拖出桌边悬空（c4s5：桌边0.5W 时夹取 0.12W..0.46W）
     R5 桌变体选择：PROPS.wood_desk({x0,x1,bend,legTo})；立板 legTo 接场景下边界（如灰栏顶 fy）；器材只坐顶面带 by..by+topH，不越立板/栏区
  */
  PROPS.seatY = function (by, topH, span) { return by + (topH + span) / 2; };
  PROPS.silhouetteX = function (x, r, yawDeg) {
    var th = yawDeg * Math.PI / 180, mn = 9, mx = -9;
    for (var k = 0; k < 3; k++) { var cs = Math.cos(th + k * 2 * Math.PI / 3); if (cs < mn) mn = cs; if (cs > mx) mx = cs; }
    return { L: x + r * mn, R: x + r * mx };
  };
  /* == 2.5D 房间空间（蔡总 2026-10-09 20:45 定版沉库；以后所有需要室内场景的实验一律调 PROPS.room_25d） ==
     调用：PROPS.room_25d(c,W,H,opts)；opts 可覆写 {cy 阴角线=0.16H, xc 角竖线=0.62W, cyN 顶交线右端=0.05H, fy 灰栏顶=默认H不画灰栏}
     含：屋顶带+条纹收敛消失点VP（VP在右墙顶交线延长线=地平线高）+背墙+阴角下环境光渐变+右墙退缩四边形（亮一档+角线AO）+冠顶线脚（亮+暗、角点连续）+角竖线+灰栏
     用法纪律：光带/光斑落右墙（x>xc 区）；器材摆放按 R1-R5；三比例不擅改保透视一致；条纹/线脚低对比不抢实验主体的戏
  */
  PROPS.room_25d = function (c, W, H, opts) {
    opts = opts || {};

  var fy=opts.fy!=null?opts.fy:H;
  var cy=opts.cy!=null?opts.cy:H*0.16, xc=opts.xc!=null?opts.xc:W*0.62, cyN=opts.cyN!=null?opts.cyN:H*0.05;
  var m=(cyN-cy)/(W-xc);
  c.fillStyle='#f6f1e3'; c.fillRect(0,0,W,cy-3);
  c.save(); c.beginPath();
  c.moveTo(0,0); c.lineTo(W,0); c.lineTo(W,cyN); c.lineTo(xc,cy-3); c.lineTo(0,cy-3); c.closePath(); c.clip();
  var vpx=W*0.45, vpy=cy-3+m*(vpx-xc);
  c.strokeStyle='rgba(175,165,135,0.28)'; c.lineWidth=2;
  for(var i=0;i<4;i++){
    var xt=W*(0.08+0.24*i);
    c.beginPath();
    c.moveTo(xt,-10);
    c.lineTo(vpx,vpy);
    c.stroke();
  }
  c.restore();
  c.fillStyle='#f0ecc6'; c.fillRect(0,cy-3,xc,fy-cy+3);
  var g=c.createLinearGradient(0,cy+2,0,cy+48);
  g.addColorStop(0,'rgba(120,110,80,0.12)'); g.addColorStop(1,'rgba(120,110,80,0)');
  c.fillStyle=g; c.fillRect(0,cy+2,xc,46);
  c.fillStyle='#f5f1d6';
  c.beginPath(); c.moveTo(xc,cy-3); c.lineTo(W,cyN); c.lineTo(W,H); c.lineTo(xc,H); c.closePath(); c.fill();
  var ga=c.createLinearGradient(xc,0,xc+90,0);
  ga.addColorStop(0,'rgba(120,110,80,0.14)'); ga.addColorStop(1,'rgba(120,110,80,0)');
  c.save(); c.beginPath(); c.moveTo(xc,cy-3); c.lineTo(W,cyN); c.lineTo(W,H); c.lineTo(xc,H); c.closePath(); c.clip();
  c.fillStyle=ga; c.fillRect(xc,cyN,W-xc,H-cyN);
  c.restore();
  c.fillStyle='#fbf8ec';
  c.beginPath(); c.moveTo(xc,cy-3); c.lineTo(W,cyN-3); c.lineTo(W,cyN); c.lineTo(xc,cy); c.closePath(); c.fill();
  c.fillStyle='rgba(140,130,100,0.35)';
  c.beginPath(); c.moveTo(xc,cy); c.lineTo(W,cyN); c.lineTo(W,cyN+2); c.lineTo(xc,cy+2); c.closePath(); c.fill();
  c.fillStyle='#fbf8ec'; c.fillRect(0,cy-3,xc,3);
  c.fillStyle='rgba(140,130,100,0.35)'; c.fillRect(0,cy,xc,2);
  c.strokeStyle='rgba(140,130,100,0.35)'; c.lineWidth=2;
  c.beginPath(); c.moveTo(xc,cy+2); c.lineTo(xc,H); c.stroke();
  c.fillStyle='#9aa0a6'; c.fillRect(0,fy,W,H-fy);
  };
  // mirror_plate: 薄反射镜片（蔡总 2026-10-10 R22 点名：plane_mirror 渲染太厚，换薄片画法），(x,y)=板中心；opt.len 板长默认90、厚 th=7，正面玻璃渐变+背面斜纹
  PROPS.mirror_plate = function(ctx, x, y, opt) {
    opt = opt || {};
    var len = opt.len || 90, th = 7;
    ctx.save();
    ctx.translate(x, y);
    var g = ctx.createLinearGradient(-len / 2, 0, len / 2, 0);
    g.addColorStop(0, '#cfe4f7'); g.addColorStop(0.45, '#f4f9ff'); g.addColorStop(1, '#a8c8e8');
    ctx.fillStyle = g; ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(-len / 2, -th / 2, len, th, 3); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.2;
    for (var i = 0; i < 4; i++) {
      var bx = -len / 2 + len * (i + 0.5) / 4;
      ctx.beginPath(); ctx.moveTo(bx, th / 2); ctx.lineTo(bx - 5, th / 2 + 6); ctx.stroke();
    }
    ctx.restore();
  };

  /* == APPEND-POINT: 6~10号件由单②插入此行上方 == */
})(typeof window !== 'undefined' ? window : globalThis);

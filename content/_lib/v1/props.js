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

  // plane_mirror: 待多状态素材(stand)
  PROPS.plane_mirror = function(ctx, x, y, opt) {
    opt = opt || {};
    if (!PROPS.spriteReady('plane_mirror')) return;
    var img = PROPS.img('plane_mirror');
    var s = spriteScale('plane_mirror', opt);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var a = (opt.angle || 0) * Math.PI / 180;
    var dir = (opt.dir === 'left' || opt.dir === -1) ? -1 : 1;
    ctx.save(); ctx.translate(x, y);
    if (a) ctx.rotate(a);
    if (dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();
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
      var topF = 0.0107, botF = 0.9893, foldTop = 0.0789, foldBot = 0.9829;
      ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 - 1, -h + h * topF - 1, w / 2 + 1, h * (botF - topF) + 2); ctx.clip();
      ctx.drawImage(img, -w / 2, -h, w, h); ctx.restore();
      var iw = img.naturalWidth, ih = img.naturalHeight;
      // 折过来半:源图自折线顶缘水平切平(去透视翘角),顶缘与左半折线处齐平
      ctx.drawImage(img, iw / 2, ih * foldTop, iw / 2, ih * (foldBot - foldTop), 0, -h + h * foldTop, (w / 2) * cf, h * (foldBot - foldTop));
      ctx.fillStyle = 'rgba(35,40,70,' + (0.22 * (1 - cf)).toFixed(3) + ')';
      ctx.fillRect(0, -h + h * foldTop, (w / 2) * cf, h * (foldBot - foldTop));
      ctx.strokeStyle = 'rgba(120,120,130,.8)'; ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(0, -h + h * 0.0789); ctx.lineTo(0, -h + h * 0.9829); ctx.stroke();
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

  /* == APPEND-POINT: 6~10号件由单②插入此行上方 == */
})(typeof window !== 'undefined' ? window : globalThis);

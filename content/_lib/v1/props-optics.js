(function(global){
'use strict';
const PROPS = global.PROPS = global.PROPS || {};
const P25 = PROPS.P25 || {dx: 0.35, dy: -0.35};
const rand = PROPS.rand || function(seed){
  const s = Math.sin(seed * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

function px(u, x, opt){
  const scale = (opt && opt.scale) || 8;
  const len = (opt && opt.railLen) || 60;
  const zero = (opt && opt.zero) || 'center';
  if(zero === 'left') return x + u * scale;
  return x - (len * scale) / 2 + u * scale;
}

PROPS.MOUNTABLE = ['candle','lens_convex','lens_concave','screen','laser_pen','f_led'];

PROPS.AXIS_H = 70;

PROPS.AXIS_OFFSET = {
  candle: -80,
  lens_convex: -46,
  lens_concave: -46,
  screen: -46,
  laser_pen: -12
};

const AXIS_FRAC = {
  candle: 0.82,
  screen: 0.62,
  lens_convex: 0.5,
  lens_concave: 0.5,
  laser_pen: 0.5
};

const OPTIC_OFF = function(id, h){
  if(id === 'lens_convex' || id === 'lens_concave') return 46;
  if(id === 'candle') return h * 0.76;
  if(id === 'screen') return h * 0.5;
  if(id === 'laser_pen') return h * 0.722;
  return h * 0.5;
};

PROPS.railAxisY = function(x, y, opt){
  const baseH = (opt && opt.baseH) || 14;
  return y - baseH;
};

function mountAt(ctx, x, yBase, id, opt){
  if(!id) return;
  if(PROPS.MOUNTABLE.indexOf(id) < 0){
    console.warn('props-optics: "' + id + '" is not MOUNTABLE');
    return;
  }
  const fn = PROPS[id];
  if(typeof fn !== 'function'){
    console.warn('props-optics: PROPS.' + id + ' not loaded');
    return;
  }
  // 旧透镜 sprite 已退役（2026-10-17 蔡总拍板），lens 统一矢量绘制，旁路 PROPS.img 防 404
  const vecLens = (id === 'lens_convex' || id === 'lens_concave');
  const ms = vecLens ? 1 : ((PROPS.spriteReady && PROPS.spriteReady(id)) ? Math.min(90 / PROPS.img(id).naturalHeight, 120 / PROPS.img(id).naturalWidth) : 1);
  const mountOpt = Object.assign({}, opt || {}, {scale: ms});
  const h = vecLens ? ((opt && opt.h) || 60) : PROPS.img(id).naturalHeight * ms;
  const yEquip = yBase - PROPS.AXIS_H + OPTIC_OFF(id, h);
  fn(ctx, x, yEquip, mountOpt);
  // 立柱:连接器材到底座（等效改写：视觉不变）
  ctx.fillStyle = '#8a8f96'; ctx.fillRect(x - 2.5, yEquip, 5, yBase - yEquip);
  ctx.strokeStyle = 'rgba(26,26,26,1)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.rect(x - 2.5, yEquip, 5, yBase - yEquip); ctx.stroke();
}

PROPS.optical_rail = function(ctx, x, y, opt){
  opt = opt || {};
  const len = opt.railLen || 60, scale = opt.scale || 8, zero = opt.zero || 'center', ruler = opt.ruler !== false;
  const w = len * scale, left = zero === 'left' ? x : x - w / 2;
  const ready = PROPS.spriteReady && PROPS.spriteReady('optical_rail');

  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';

  if(ready){
    const img = PROPS.img('optical_rail');
    const sw = w;
    const sh = sw * (img.naturalHeight / img.naturalWidth);
    const stop = y - sh;
    ctx.drawImage(img, left, stop, sw, sh);
    // 轨面主刻度：在 sprite 之上用代码绘制，保留 zero/ruler 参数语义
    if(ruler){
      ctx.strokeStyle = 'rgba(26,26,26,1)'; ctx.lineWidth = 1;
      const ft = 35/101, nf = 62/101;
      for(let u = 0; u <= len; u += 1){
        const rx = px(u, x, opt);
        let mh = sh * 0.07;
        if(u % 10 === 0) mh = sh * 0.16;
        else if(u % 5 === 0) mh = sh * 0.11;
        ctx.beginPath(); ctx.moveTo(rx, stop + sh*ft); ctx.lineTo(rx, stop + sh*ft + mh); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(26,26,26,1)'; ctx.textAlign = 'center';
      ctx.font = Math.max(8, sh*0.16) + 'px sans-serif';
      for(let u = 0; u <= len; u += 10){
        const rx = px(u, x, opt);
        ctx.fillText(String(u), rx, stop + sh*nf);
      }
    }
    // 底座滑块：优先使用 optical_rail_base 素材，否则代码绘制 fallback
    const bc = Math.max(1, Math.min(4, opt.baseCount || 3));
    let bs = opt.bases;
    if(!bs || !bs.length){ bs = []; for(let i = 0; i < bc; i++) bs.push({u: len * (i + 1) / (bc + 1), mount: null}); }
    bs.forEach(function(b){
      const bx = px(b.u, x, opt);
      if(PROPS.spriteReady('optical_rail_base')){
        const bimg = PROPS.img('optical_rail_base');
        const bw = Math.max(24, sh * 1.5);
        const bh = bw * (287/881);
        const baseBottom = stop + sh * 0.30;
        ctx.drawImage(bimg, bx - bw/2, baseBottom - bh, bw, bh);
        mountAt(ctx, bx, baseBottom - bh, b.mount, opt);
      } else {
        ctx.fillStyle = '#7d838c'; ctx.fillRect(bx - 8, y - 5, 16, 5);
        ctx.fillStyle = '#9aa0a8'; ctx.fillRect(bx - 5, y - 10, 10, 5);
        ctx.fillStyle = '#b8bdc4'; ctx.beginPath(); ctx.arc(bx, y - 12, 3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(26,26,26,1)'; ctx.lineWidth = Math.max(2, Math.min(5, 14 * 0.035));
        ctx.beginPath(); ctx.rect(bx - 8, y - 5, 16, 5); ctx.rect(bx - 5, y - 10, 10, 5); ctx.stroke();
        mountAt(ctx, bx, y, b.mount, opt);
      }
    });
  } else {
    // 未就绪：仅画底座占位
    const top = y - 14;
    const lw = Math.max(2, Math.min(5, 14 * 0.035));
    const g = ctx.createLinearGradient(left, top, left, y);
    g.addColorStop(0, '#7d838c'); g.addColorStop(0.5, '#9aa0a8'); g.addColorStop(1, '#7d838c');
    ctx.fillStyle = g; ctx.fillRect(left, top, w, 14);
    ctx.fillStyle = '#f5f6f8'; ctx.fillRect(left + 2, top + 1, w - 4, 4);
    ctx.strokeStyle = 'rgba(26,26,26,1)'; ctx.lineWidth = lw; ctx.beginPath(); ctx.rect(left, top, w, 14); ctx.stroke();
    if(ruler){
      ctx.strokeStyle = 'rgba(26,26,26,1)'; ctx.lineWidth = Math.max(1, lw * 0.5);
      for(let u = 0; u <= len; u += 1){
        const rx = px(u, x, opt), h = u % 10 === 0 ? 5 : (u % 5 === 0 ? 3 : 2);
        ctx.beginPath(); ctx.moveTo(rx, top + 1); ctx.lineTo(rx, top + 1 + h); ctx.stroke();
      }
    }
    const bc = Math.max(1, Math.min(4, opt.baseCount || 3));
    let bs = opt.bases;
    if(!bs || !bs.length){ bs = []; for(let i = 0; i < bc; i++) bs.push({u: len * (i + 1) / (bc + 1), mount: null}); }
    bs.forEach(function(b){
      const bx = px(b.u, x, opt);
      ctx.fillStyle = '#7d838c'; ctx.fillRect(bx - 8, top - 5, 16, 5);
      ctx.fillStyle = '#9aa0a8'; ctx.fillRect(bx - 5, top - 10, 10, 5);
      ctx.fillStyle = '#b8bdc4'; ctx.beginPath(); ctx.arc(bx, top - 12, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(26,26,26,1)'; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.rect(bx - 8, top - 5, 16, 5); ctx.rect(bx - 5, top - 10, 10, 5); ctx.stroke();
      mountAt(ctx, bx, top, b.mount, opt);
    });
  }
  ctx.restore();
};

function drawDashedPlaceholder(ctx, x, y, w, h, label){
  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.rect(x - w / 2, y - h, w, h); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h); ctx.lineTo(x + w / 2, y);
  ctx.moveTo(x + w / 2, y - h); ctx.lineTo(x - w / 2, y);
  ctx.stroke();
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y - h / 2);
  ctx.restore();
}

PROPS.lens_convex = function(ctx, x, y, opt){
  opt = opt || {};
  const h = opt.h || 60, f = opt.f || 15;
  // PhET 实测宽高比带 0.08~0.18：宽随 f 联动（f 小更凸），fMin=1.2cm（c5s1 滑杆下限）
  // (x,y)=光心（垂直居中骑光轴，无底座）；玻璃质感配色照 glass_plate
  const fMin = 1.2;
  const cy = y, rw = Math.max(h * 0.08, Math.min(h * 0.18, h * (0.08 + 0.10 * (fMin / f)))), edge = Math.max(1.5, h * 0.02), lw = Math.max(1.2, h * 0.008);
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - edge, cy - h / 2);
  ctx.bezierCurveTo(x - rw, cy - h / 4, x - rw, cy + h / 4, x - edge, cy + h / 2);
  ctx.lineTo(x + edge, cy + h / 2);
  ctx.bezierCurveTo(x + rw, cy + h / 4, x + rw, cy - h / 4, x + edge, cy - h / 2);
  ctx.closePath();
  ctx.fillStyle = 'rgba(225,242,250,0.60)'; ctx.fill();
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = lw; ctx.stroke();
  // 内层边缘过渡（缩 0.72 的同形内描边）
  const k = 0.72;
  ctx.beginPath();
  ctx.moveTo(x - edge * k, cy - h / 2 * k);
  ctx.bezierCurveTo(x - rw * k, cy - h / 4 * k, x - rw * k, cy + h / 4 * k, x - edge * k, cy + h / 2 * k);
  ctx.lineTo(x + edge * k, cy + h / 2 * k);
  ctx.bezierCurveTo(x + rw * k, cy + h / 4 * k, x + rw * k, cy - h / 4 * k, x + edge * k, cy - h / 2 * k);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(150,196,216,0.45)'; ctx.lineWidth = Math.max(1, h * 0.02); ctx.stroke();
  // 白高光条
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(1, lw * 0.45);
  ctx.beginPath(); ctx.moveTo(x - rw * 0.5, cy - h / 3); ctx.lineTo(x + rw * 0.5, cy + h / 3); ctx.stroke();
  ctx.restore();
};

PROPS.lens_concave = function(ctx, x, y, opt){
  opt = opt || {};
  const h = opt.h || 60, f = opt.f || 15;
  // 统一矢量真圆弧(三变体同形状语言同轴高);旧透镜 sprite 已退役（2026-10-17 蔡总拍板），统一矢量绘制
  // 矢量凹透镜:PhET 实测 rim 带 0.06~0.14,边缘厚度随比例缩;精确圆弧
  // (x,y)=光心（垂直居中骑光轴，无底座）；玻璃质感配色照 glass_plate
  const fMin = 1.2;
  const cy = y, rim = Math.max(h * 0.06, Math.min(h * 0.14, h * (0.06 + 0.08 * (fMin / f)))), t = Math.max(1.2, rim * 0.5), lw = Math.max(1.2, h * 0.008);
  function shape(rm, hv, tt){
    const R = (hv * hv + (rm - tt) * (rm - tt)) / (2 * (rm - tt));
    const beta = Math.atan2(hv, R + tt - rm);
    ctx.beginPath();
    ctx.moveTo(x - rm, cy - hv);
    ctx.lineTo(x + rm, cy - hv);
    ctx.arc(x + R + tt, cy, R, Math.PI + beta, Math.PI - beta, true);
    ctx.lineTo(x - rm, cy + hv);
    ctx.arc(x - R - tt, cy, R, beta, -beta, true);
    ctx.closePath();
  }
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  shape(rim, h / 2, t);
  ctx.fillStyle = 'rgba(225,242,250,0.60)'; ctx.fill();
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = lw; ctx.stroke();
  // 内层边缘过渡
  shape(rim * 0.72, h / 2 * 0.72, t * 0.72);
  ctx.strokeStyle = 'rgba(150,196,216,0.45)'; ctx.lineWidth = Math.max(1, h * 0.02); ctx.stroke();
  // 白高光条
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = Math.max(1, lw * 0.4);
  ctx.beginPath(); ctx.moveTo(x - rim * 0.5, cy - h / 3); ctx.lineTo(x - rim * 0.2, cy + h / 4); ctx.stroke();
  ctx.restore();
};



/* == APPEND-POINT: 光学件增补插入此处 == */

})(typeof window !== 'undefined' ? window : globalThis);

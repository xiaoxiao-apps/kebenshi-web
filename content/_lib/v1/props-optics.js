(function(global){
'use strict';
const PROPS = global.PROPS = global.PROPS || {};
const P25 = PROPS.P25 || {dx: 0.35, dy: -0.35};
const rand = PROPS.rand || function(seed){
  const s = Math.sin(seed * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

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

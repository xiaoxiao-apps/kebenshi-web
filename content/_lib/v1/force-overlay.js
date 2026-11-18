/* ============================================================
 * force-overlay.js — 门控式实时局部"力的示意图"（C7V5 共享，场景A/B复用）
 * 规格：设计书 §0/§1.7 —— 全局开关；on 时仅对"当前活跃交互/事件"画矢量：
 *   作用点正确、方向正确、长度∝力（比例尺 1cm=1N，标尺显示）、实时随力变、
 *   交互结束即移除；off 时全场景不画任何矢量。支持"一对"相互作用力
 *   （等大反向共线，作用在两物体）。重力矢量仅在翻落/悬挂等活跃事件注册时画。
 * API：setOn(bool)/isOn()/register(id,spec)/unregister(id)/clear()/setScale(pxPerCm)/draw(ctx,view)
 * spec = {point:{x,y}, dir:{x,y}|angle, magN, color?, label?, dash?(bool|[段,隙]), pair?:{point,dir|angle,magN,color?,label?,dash?}}
 * ============================================================ */
(function (global) {
  'use strict';

  var on = false;          // 全局门控开关
  var items = {};          // 活跃矢量注册表（id -> spec）
  var CM = 26;             // 比例尺：1cm = CM px（1cm=1N）
  var MINLEN = 6;          // 矢量最小可见长度（px）

  function setScale(pxPerCm) { if (pxPerCm > 0) CM = pxPerCm; }
  function getScale() { return CM; }
  function setOn(b) { on = !!b; if (!on) items = {}; }   // 关时清空注册表，杜绝残影
  function isOn() { return on; }

  function register(id, spec) { if (on && id) items[id] = spec; }
  function unregister(id) { delete items[id]; }
  function clear() { items = {}; }
  function count() { var n = 0; for (var k in items) n++; return n; }

  // dir 归一化：支持 {x,y} 或 angle(弧度，屏幕坐标：0=右，+y=下)
  function unit(d) {
    var x, y;
    if (d && typeof d.angle === 'number') { x = Math.cos(d.angle); y = Math.sin(d.angle); }
    else if (d && typeof d.x === 'number' && typeof d.y === 'number') { x = d.x; y = d.y; }
    else return { x: 1, y: 0 };
    var m = Math.hypot(x, y); if (m < 1e-6) return { x: 1, y: 0 };
    return { x: x / m, y: y / m };
  }

  function arrow(ctx, x0, y0, ux, uy, len, color, lw, dash) {
    if (len < MINLEN) len = MINLEN;
    var x1 = x0 + ux * len, y1 = y0 + uy * len;
    var hd = Math.max(8, Math.min(16, len * 0.3));
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = lw || 3.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (dash) ctx.setLineDash(dash === true ? [7, 5] : dash);   // w轮：虚线矢量（如切向分力）
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hd * 0.82, y1 - uy * hd * 0.82); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - ux * hd - uy * hd * 0.5, y1 - uy * hd + ux * hd * 0.5);
    ctx.lineTo(x1 - ux * hd + uy * hd * 0.5, y1 - uy * hd - ux * hd * 0.5);
    ctx.closePath(); ctx.fill();
    // 作用点实心圆
    ctx.beginPath(); ctx.arc(x0, y0, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    return { x1: x1, y1: y1 };
  }

  function label(ctx, txt, x, y, color) {
    if (!txt) return;
    ctx.save();
    ctx.font = '600 12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    var w = ctx.measureText(txt).width + 8;
    ctx.fillRect(x - 2, y - 12, w, 15);
    ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(txt, x + 2, y - 4.5);
    ctx.restore();
  }

  function drawOne(ctx, s, defColor, view) {
    if (!s || !s.point) return;
    var u = unit(s.dir), len = (s.magN || 0) * CM;
    var color = s.color || defColor || '#dc2626';
    var e = arrow(ctx, s.point.x, s.point.y, u.x, u.y, len, color, 3.4, s.dash);
    if (s.label) {
      var lw = ctx.measureText(s.label).width;
      var lx = e.x1 + (u.x >= 0 ? 4 : -lw - 6), ly = e.y1;
      if (view) {                                   // 标签不出画布（翻落时箭头尖可能出界）
        lx = Math.max(4, Math.min((view.w || 300) - lw - 10, lx));
        ly = Math.max(18, Math.min((view.h || 300) - 10, ly));
      }
      label(ctx, s.label, lx, ly, color);
    }
  }

  // 比例尺标尺：1cm = 1N（overlay on 时常驻一角）
  function drawScale(ctx, view) {
    if (!view) return;
    var x = 16, y = (view.h || 300) - 22, len = CM;
    ctx.save();
    ctx.strokeStyle = '#334155'; ctx.fillStyle = '#334155'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + len, y - 5); ctx.lineTo(x + len, y + 5); ctx.stroke();
    ctx.font = '600 11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('1cm = 1N', x + len + 6, y + 5);
    ctx.restore();
  }

  function draw(ctx, view) {
    if (!on) return;                 // 门控：off 时不画任何矢量
    var any = false;
    for (var id in items) {
      var s = items[id]; any = true;
      drawOne(ctx, s, '#dc2626', view);
      if (s.pair) drawOne(ctx, s.pair, '#2563eb', view);   // 相互作用：另一物体上的等大反向力
    }
    if (any || true) drawScale(ctx, view);            // on 时始终显示比例尺标尺
  }

  global.ForceOverlay = {
    setOn: setOn, isOn: isOn, register: register, unregister: unregister,
    clear: clear, count: count, setScale: setScale, getScale: getScale, draw: draw
  };
})(typeof window !== 'undefined' ? window : globalThis);

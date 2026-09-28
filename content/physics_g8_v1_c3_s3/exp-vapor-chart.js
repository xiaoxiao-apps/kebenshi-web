/* exp-vapor-chart.js — 水沸腾 T-t 曲线与数据表 [s11: 无时间上限+时间轴拖动+双击回当下+放大浮窗] */
/* eslint-env browser */

const CHART_COLORS = {
  axis: 'rgba(255,255,255,0.35)', grid: 'rgba(255,255,255,0.10)', tick: '#9aa4b5',
  curve: '#5ad7ff', dot: '#ffffff', plateau: 'rgba(90,215,255,0.45)', title: '#ffd54f'
};

let chartCanvas, chartCtx, bigCanvas, bigCtx, tooltipEl, lastTableCount = 0, lastChartCount = 0;
// 蔡总 2026-09-27 18:15：时间轴刻度间距恒定不压缩，窗口随时间向前滚动
const CHART_SPAN = 6;  // 小图固定窗口（min）
const BIG_SPAN = 12;   // 放大浮窗固定窗口（min）
let chartView = { live: true, a: 0, b: CHART_SPAN, span: CHART_SPAN };
let bigView = { live: true, a: 0, b: BIG_SPAN, span: BIG_SPAN };
let chartModalOpen = false;

function dataEnd() {
  const d = state.chartLog || [];
  return Math.max(d.length ? d[d.length - 1].t : 0, state.recordTime || 0);
}
function maxStart(v) { return Math.max(0, dataEnd() - v.span); }
function curWindow(v) {
  if (!v.live) return { a: v.a, b: v.b };
  const b = Math.max(v.span, dataEnd());
  return { a: b - v.span, b };
}

function initChart() {
  chartCanvas = document.getElementById('tt-chart');
  if (chartCanvas) chartCtx = chartCanvas.getContext('2d');
  bigCanvas = document.getElementById('tt-chart-big');
  if (bigCanvas) bigCtx = bigCanvas.getContext('2d');
  tooltipEl = document.getElementById('chart-tooltip');
  // 蔡总 2026-09-27 22:28：挂到 body 层级，跳出 #ui-layer(z-index:10) 的层叠上下文，才能浮在放大弹窗(z-index:60)之上
  if (tooltipEl) { document.body.appendChild(tooltipEl); tooltipEl.style.zIndex = '9999'; }
  bindChartGestures(chartCanvas, chartView);
  bindChartGestures(bigCanvas, bigView);
  const zb = document.getElementById('btn-chart-zoom');
  if (zb) zb.addEventListener('click', () => { chartModalOpen = true; document.getElementById('chart-modal').style.display = 'flex'; drawChart(); playClick(); });
  const zc = document.getElementById('chart-modal-close');
  if (zc) zc.addEventListener('click', () => { chartModalOpen = false; document.getElementById('chart-modal').style.display = 'none'; playClick(); });
  window.addEventListener('resize', drawChart);
  drawChart();
}

function bindChartGestures(cv, v) {
  if (!cv) return;
  let drag = null;
  cv.style.touchAction = 'none';
  cv.addEventListener('pointerdown', e => {
    const w = curWindow(v);
    drag = { x: e.clientX, a: w.a };
    v.live = false; v.a = w.a; v.b = w.b;
    try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  });
  cv.addEventListener('pointermove', e => {
    if (drag) {
      const plotW = Math.max(1, cv.clientWidth - 64);
      const dm = -(e.clientX - drag.x) / plotW * v.span;
      const a = Math.max(0, Math.min(maxStart(v), drag.a + dm));
      v.a = a; v.b = a + v.span; v.live = false;
      hideTooltip(); drawChart();
      return;
    }
    const hit = findNearestPoint(cv, v, e.clientX, e.clientY);
    if (hit) showTooltip(hit.pt, hit.x, hit.y, cv);
    else hideTooltip();
  });
  cv.addEventListener('pointerup', () => { drag = null; });
  cv.addEventListener('pointerleave', hideTooltip);
  cv.addEventListener('dblclick', () => { v.live = true; drawChart(); });
}

function drawChart() {
  drawChartTo(chartCanvas, chartCtx, chartView);
  if (chartModalOpen) drawChartTo(bigCanvas, bigCtx, bigView);
}

function drawChartTo(cv, ctx, view) {
  if (!cv || !ctx) return;
  const rect = cv.parentElement.getBoundingClientRect();
  cv.width = Math.max(1, rect.width); cv.height = Math.max(1, rect.height);
  const w = cv.width, h = cv.height;
  ctx.clearRect(0, 0, w, h);
  const m = { top: 22, right: 24, bottom: 28, left: 40 };
  const px = m.left, py = m.top, pw = Math.max(1, w - m.left - m.right), ph = Math.max(1, h - m.top - m.bottom);
  const win = curWindow(view); const xMin = win.a, xMax = win.b;
  const yMin = 0, yMax = 110;
  const span = Math.max(0.001, xMax - xMin);
  const xStep = span > 40 ? 10 : span > 16 ? 5 : span > 8 ? 2 : 1;
  const xGrid = span > 16 ? 5 : span > 8 ? 1 : 0.5;
  function xs(t) { return px + (t - xMin) / span * pw; }
  function ys(T) { return py + ph - (T - yMin) / (yMax - yMin) * ph; }
  ctx.strokeStyle = CHART_COLORS.grid; ctx.lineWidth = 1; ctx.beginPath();
  for (let T = yMin; T <= yMax + 0.001; T += 10) { const y = ys(T); ctx.moveTo(px, y); ctx.lineTo(px + pw, y); }
  for (let t = Math.ceil(xMin / xGrid) * xGrid; t <= xMax + 0.001; t += xGrid) { const x = xs(t); ctx.moveTo(x, py); ctx.lineTo(x, py + ph); }
  ctx.stroke();
  ctx.strokeStyle = CHART_COLORS.axis; ctx.lineWidth = 1.5; ctx.beginPath();
  ctx.moveTo(px, py); ctx.lineTo(px, py + ph); ctx.lineTo(px + pw, py + ph); ctx.stroke();
  ctx.fillStyle = CHART_COLORS.tick; ctx.font = '11px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let T = yMin; T <= yMax + 0.001; T += 10) { const y = ys(T); ctx.fillText(String(T), px - 6, y); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let t = Math.ceil(xMin / xStep) * xStep; t <= xMax + 0.001; t += xStep) { const x = xs(t); ctx.fillText(String(t), x, py + ph + 5); }
  ctx.font = '10px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('t/min', px + pw - 4, py + ph - 5); ctx.textAlign = 'left'; ctx.fillText('T/℃', px + 4, py + 4);
  if (!view.live) { ctx.fillStyle = '#ffd54f'; ctx.textAlign = 'right'; ctx.fillText('历史视图·双击回当下', px + pw, py - 8); }

  const bp = typeof boilingPoint === 'function' ? boilingPoint(state) : 100.0;
  const yBp = ys(bp);
  ctx.strokeStyle = CHART_COLORS.plateau; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5; ctx.beginPath();
  ctx.moveTo(px, yBp); ctx.lineTo(px + pw, yBp); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#5ad7ff'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText('沸点 ' + bp.toFixed(1) + '℃', px + 4, yBp - 3);

  const data = state.chartLog || [];
  if (data.length < 2) return;
  ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
  ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = CHART_COLORS.curve;
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < data.length; i++) {
    const pt = data[i];
    if (pt.t < xMin - 1 || pt.t > xMax + 1) { started = false; continue; }
    const x = xs(pt.t), y = ys(pt.T);
    if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
  }
  ctx.stroke();
  if (span <= 20) {
    data.forEach(pt => {
      if (pt.t < xMin || pt.t > xMax) return;
      ctx.beginPath(); ctx.arc(xs(pt.t), ys(pt.T), 2.5, 0, Math.PI * 2); ctx.fillStyle = CHART_COLORS.dot; ctx.fill();
    });
  }
  ctx.restore();
}

function findNearestPoint(cv, view, clientX, clientY) {
  const data = state.chartLog || [];
  if (!data.length || !cv) return null;
  const rect = cv.getBoundingClientRect();
  // 与 drawChartTo 完全一致的几何参数，保证大小图都命中
  const m = { top: 22, right: 24, bottom: 28, left: 40 };
  const pw = Math.max(1, rect.width - m.left - m.right);
  const ph = Math.max(1, rect.height - m.top - m.bottom);
  const win = curWindow(view); const xMin = win.a, xMax = win.b;
  const mx = clientX - rect.left, my = clientY - rect.top;
  if (mx < m.left || mx > rect.width - m.right || my < m.top || my > rect.height - m.bottom) return null;
  const span = Math.max(0.001, xMax - xMin);
  const tHover = xMin + (mx - m.left) / pw * span;
  let best = null, bestDt = Infinity;
  data.forEach(pt => { if (pt.t < xMin || pt.t > xMax) return; const dt = Math.abs(pt.t - tHover); if (dt < bestDt) { bestDt = dt; best = pt; } });
  if (!best) return null;
  const x = m.left + (best.t - xMin) / span * pw;
  const y = m.top + ph - best.T / 110 * ph;
  // 蔡总 2026-09-27 22:28：放大图也要悬停浮现温度/时间——按时间就近命中即可，不再卡垂直距离
  return { pt: best, x, y };
}

function showTooltip(pt, x, y, cv) {
  if (!tooltipEl) return;
  tooltipEl.innerHTML = '时间 ' + pt.t.toFixed(1) + ' min<br>温度 ' + pt.T.toFixed(1) + ' ℃';
  tooltipEl.style.display = 'block';
  const rect = cv.getBoundingClientRect();
  const tw = tooltipEl.offsetWidth, th = tooltipEl.offsetHeight;
  let left = rect.left + x + 12, top = rect.top + y - th - 10;
  if (left + tw > window.innerWidth) left = rect.left + x - tw - 12;
  if (top < 0) top = rect.top + y + 16;
  tooltipEl.style.left = left + 'px'; tooltipEl.style.top = top + 'px';
}
function hideTooltip() { if (tooltipEl) tooltipEl.style.display = 'none'; }

function renderTable() {
  const tbody = document.getElementById('data-tbody');
  tbody.innerHTML = '';
  const data = state.dataLog || [];
  const slice = data.slice(-60);
  slice.forEach(pt => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${pt.t.toFixed(1)}</td><td>${pt.T.toFixed(1)}</td>`;
    tbody.appendChild(tr);
  });
  const wrap = tbody.parentElement.parentElement; wrap.scrollTop = wrap.scrollHeight;
}

function clearTable() {
  state.dataLog = []; state.lastRecordIdx = -1; lastTableCount = 0;
  state.chartLog = []; state.lastChartIdx = -1; state.firstHeatT = null; lastChartCount = 0;
  state.boilRecT = null; state.recordStop = false;
  chartView = { live: true, a: 0, b: CHART_SPAN, span: CHART_SPAN };
  bigView = { live: true, a: 0, b: BIG_SPAN, span: BIG_SPAN };
  document.getElementById('data-tbody').innerHTML = ''; drawChart();
}

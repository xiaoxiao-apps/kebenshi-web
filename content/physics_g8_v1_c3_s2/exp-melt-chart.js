/* exp-melt-chart.js — 熔化凝固 T-t 曲线与数据表 [R4: 架构整体移植 c3s3 exp-vapor-chart.js——chartLog独立数据源+view/curWindow/maxStart/dataEnd四件套+bindChartGestures+drawChartTo单套大小图；保留c3s2教学要素：熔点平台虚线/加热冷却双色分段/图例/数据表/放大浮窗tabs/教材图/标题] */
/* eslint-env browser */

const CHART_SAMPLE_NAMES = { hypo: '海波', paraffin: '石蜡' };
const CHART_COLORS = {
  axis: 'rgba(255,255,255,0.35)',
  grid: 'rgba(255,255,255,0.10)',
  tick: '#9aa4b5',
  curve: '#5ad7ff',
  curveHeat: '#ff7043',
  curveCool: '#4fc3f7',
  legend: '#c8d0e0',
  dot: '#ffffff',
  plateau: 'rgba(90,215,255,0.45)',
  title: '#ffd54f'
};

let chartCanvas, chartCtx, floatCanvas, floatCtx, floatWrap, tooltipEl;
let chartResizeObserver;
let lastChartCount = 0;
/* R4回归修复（主会话）：lastTableCount 原声明在 exp-melt.js:5，移植时被删而 :200 仍在用 →
   updateUI 抛 ReferenceError 使 init() 中断、物理主循环不启动（simTime 恒 0）。
   补回声明，与 lastChartCount 同层（let 顶层声明跨 script 共享，故 exp-melt.js 可读写）。 */
let lastTableCount = 0;
const CHART_SPAN = 6;  // 小图固定窗口（min），对齐 c3s3
const BIG_SPAN = 12;   // 放大浮窗固定窗口（min），对齐 c3s3
let chartView = { live: true, a: 0, b: CHART_SPAN, span: CHART_SPAN };
let bigView = { live: true, a: 0, b: BIG_SPAN, span: BIG_SPAN };

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

/* ---------- 初始化 ---------- */
function initChart() {
  chartCanvas = document.getElementById('tt-chart');
  if (chartCanvas) chartCtx = chartCanvas.getContext('2d');
  floatCanvas = document.getElementById('float-tt-chart');
  if (floatCanvas) floatCtx = floatCanvas.getContext('2d');
  floatWrap = document.getElementById('chart-float');
  tooltipEl = document.getElementById('chart-tooltip');

  bindChartGestures(chartCanvas, chartView);
  bindChartGestures(floatCanvas, bigView);
  bindFloatUI();

  const liveBtn = document.getElementById('chart-live-btn');
  if (liveBtn) {
    liveBtn.addEventListener('click', () => {
      chartView.live = true;
      drawChart();
      updateLiveBtn();
      if (typeof playClick === 'function') playClick();
    });
  }

  // 绑定教材图像切换按钮（即使未进入对比馆也要可用）
  document.querySelectorAll('.chart-switcher button').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.chart-switcher button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (typeof renderTextbookChart === 'function') renderTextbookChart(btn.dataset.chart);
      hideSegmentCard();
      if (typeof playClick === 'function') playClick();
    };
  });

  if (document.getElementById('textbook-chart-stage') && typeof renderTextbookChart === 'function') {
    renderTextbookChart('melt-c');
  }

  window.addEventListener('resize', drawChart);
  drawChart();
  updateChartTitle();
  updateLiveBtn();
}

function redrawChart() {
  drawChart();
  updateChartTitle();
}

// 兼容旧调用名
function drawChart() {
  drawChartTo(chartCanvas, chartCtx, chartView);
  if (floatOpen() && floatTabIs('live')) drawChartTo(floatCanvas, floatCtx, bigView);
}

function floatOpen() { return floatWrap && floatWrap.style.display !== 'none' && floatWrap.style.display !== ''; }
function floatTabIs(tab) {
  const activeTab = document.querySelector('.chart-float-tabs button.active');
  return (activeTab ? activeTab.dataset.tab : 'live') === tab;
}

/* ---------- 手势（照搬 c3s3 bindChartGestures：拖拽平移+悬停tooltip+双击回当下） ---------- */
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
      hideTooltip(); drawChart(); updateLiveBtn();
      return;
    }
    const hit = findNearestPoint(cv, v, e.clientX, e.clientY);
    if (hit) showTooltip(hit.pt, hit.x, hit.y, cv);
    else hideTooltip();
  });
  cv.addEventListener('pointerup', () => { drag = null; updateLiveBtn(); });
  cv.addEventListener('pointerleave', hideTooltip);
  cv.addEventListener('dblclick', () => { v.live = true; drawChart(); updateLiveBtn(); });
}

/* ---------- 标题 ---------- */
function getChartSampleTitle() {
  let name = '';
  if (typeof sampleDef === 'function') {
    const def = sampleDef();
    if (def && def.name) name = def.name;
  }
  if (!name) name = CHART_SAMPLE_NAMES[state.sample] || state.sample || '';
  return name + '温度时间曲线';
}

function updateLiveBtn() {
  const btn = document.getElementById('chart-live-btn');
  if (btn) btn.classList.toggle('show', !chartView.live);
  const latest = document.querySelector('.chart-float-latest');
  if (latest) latest.classList.toggle('active', !bigView.live);
}

function updateChartTitle() {
  const title = getChartSampleTitle();
  const small = document.getElementById('chart-title');
  if (small) {
    small.textContent = title;
    let hint = document.getElementById('chart-live-hint');
    if (!hint) {
      hint = document.createElement('span');
      hint.id = 'chart-live-hint';
      hint.textContent = '拖动回看历史·双击回最新';
      hint.style.cssText = 'font-size:11px;color:#9090a5;margin-left:8px;vertical-align:middle;';
      small.parentElement.appendChild(hint);
    }
  }
  const float = document.getElementById('chart-float-title');
  if (float) float.textContent = title;
  const floatHint = document.getElementById('chart-float-hint');
  if (floatHint) floatHint.textContent = '拖动回看历史·双击回最新';
}

/* ---------- 绘制（照搬 c3s3 drawChartTo：yMin=0/yMax=110每10一格、xStep/xGrid按span自适应、margins统一、span<=20描点、clip裁剪） ---------- */
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

  // 熔点/凝固点平台虚线（c3s2 教学要素，参照 c3s3 沸点虚线画法）
  const def = (typeof sampleDef === 'function') ? sampleDef() : null;
  if (def && def.kind === 'crystal' && typeof def.meltingPoint === 'number') {
    const mp = def.meltingPoint;
    const yMp = ys(mp);
    ctx.strokeStyle = CHART_COLORS.plateau; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(px, yMp); ctx.lineTo(px + pw, yMp); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#5ad7ff'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    const label = (state.mode === 'freeze' ? '凝固平台 ' : '熔点 ') + mp + '℃';
    ctx.fillText(label, px + 4, yMp - 3);
  }

  const data = state.chartLog || [];
  if (data.length < 2) return;
  ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();

  // 双色分段曲线（c3s2 教学要素：加热暖色/冷却冷色，逐段 stroke）
  function pointColor(pt) { return pt.heat === false ? CHART_COLORS.curveCool : CHART_COLORS.curveHeat; }
  ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (let i = 1; i < data.length; i++) {
    const p0 = data[i - 1], p1 = data[i];
    if (p1.t < xMin - 1 || p0.t > xMax + 1) continue;
    ctx.beginPath();
    ctx.moveTo(xs(p0.t), ys(p0.T));
    ctx.lineTo(xs(p1.t), ys(p1.T));
    ctx.strokeStyle = pointColor(p1);
    ctx.stroke();
  }

  // 描点（照 c3s3：span<=20 才描点，r=2.5 白色）
  if (span <= 20) {
    data.forEach(pt => {
      if (pt.t < xMin || pt.t > xMax) return;
      ctx.beginPath(); ctx.arc(xs(pt.t), ys(pt.T), 2.5, 0, Math.PI * 2); ctx.fillStyle = CHART_COLORS.dot; ctx.fill();
    });
  }

  // 图例（c3s2 教学要素：加热/冷却，右上角）
  if (data.length) {
    const lx = px + pw - 70;
    const ly = py + 8;
    const r = 3;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.beginPath();
    ctx.arc(lx, ly, r, 0, Math.PI * 2);
    ctx.fillStyle = CHART_COLORS.curveHeat;
    ctx.fill();
    ctx.fillStyle = CHART_COLORS.legend;
    ctx.fillText('加热', lx + r + 3, ly + 1);
    const lx2 = lx + 38;
    ctx.beginPath();
    ctx.arc(lx2, ly, r, 0, Math.PI * 2);
    ctx.fillStyle = CHART_COLORS.curveCool;
    ctx.fill();
    ctx.fillStyle = CHART_COLORS.legend;
    ctx.fillText('冷却', lx2 + r + 3, ly + 1);
  }

  ctx.restore();
}

/* ---------- hover 气泡（照搬 c3s3 findNearestPoint/showTooltip/hideTooltip） ---------- */
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
  const y = m.top + ph - (best.T - 0) / 110 * ph;
  return { pt: best, x, y };
}

function showTooltip(pt, x, y, cv) {
  if (!tooltipEl) return;
  const phase = pt.heat === false ? '冷却' : '加热';
  tooltipEl.innerHTML = '时间 ' + pt.t.toFixed(1) + ' min<br>温度 ' + pt.T.toFixed(1) + ' ℃<br>' + phase;
  tooltipEl.style.display = 'block';
  const rect = cv.getBoundingClientRect();
  const tw = tooltipEl.offsetWidth, th = tooltipEl.offsetHeight;
  let left = rect.left + x + 12, top = rect.top + y - th - 10;
  if (left + tw > window.innerWidth) left = rect.left + x - tw - 12;
  if (top < 0) top = rect.top + y + 16;
  tooltipEl.style.left = left + 'px'; tooltipEl.style.top = top + 'px';
}
function hideTooltip() { if (tooltipEl) tooltipEl.style.display = 'none'; }

/* ---------- 数据表（继续读 dataLog，不动） ---------- */
function renderTable() {
  const tbody = document.getElementById('data-tbody');
  tbody.innerHTML = '';
  state.dataLog.forEach(pt => {
    const tr = document.createElement('tr');
    const phase = pt.heat === false ? '凝固' : '熔化';
    tr.innerHTML = `<td>${pt.t}</td><td>${pt.T.toFixed(1)}</td><td>${phase}</td>`;
    tbody.appendChild(tr);
  });
  const wrap = tbody.parentElement.parentElement;
  wrap.scrollTop = wrap.scrollHeight;
}

function clearTable() {
  state.dataLog = [];
  state.lastRecordTime = -1;
  state.chartLog = [];
  state.lastChartIdx = -1;
  state.recordTime = 0;
  lastChartCount = 0;
  chartView = { live: true, a: 0, b: CHART_SPAN, span: CHART_SPAN };
  bigView = { live: true, a: 0, b: BIG_SPAN, span: BIG_SPAN };
  document.getElementById('data-tbody').innerHTML = '';
  drawChart();
}

/* ---------- 悬浮窗（保留 DOM 与 tab/拖拽/改大小逻辑，绘制走 drawChartTo(floatCanvas,floatCtx,bigView)） ---------- */
function bindFloatUI() {
  const openBtn = document.getElementById('chart-float-btn');
  if (openBtn) openBtn.addEventListener('click', () => { openChartFloat(); if (typeof playClick === 'function') playClick(); });

  const closeBtn = document.querySelector('.chart-float-close');
  if (closeBtn) closeBtn.addEventListener('click', closeChartFloat);

  const latestBtn = document.querySelector('.chart-float-latest');
  if (latestBtn) latestBtn.addEventListener('click', () => {
    bigView.live = true;
    drawChart();
    updateLiveBtn();
    if (typeof playClick === 'function') playClick();
  });

  const titlebar = document.getElementById('chart-float-titlebar');
  if (titlebar && floatWrap) {
    let dragging = false, startX, startY, startL, startT;
    titlebar.addEventListener('pointerdown', e => {
      if (e.target.closest('.chart-float-close') || e.target.closest('.chart-float-latest')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const st = floatWrap.style;
      startL = parseFloat(st.left) || 15;
      startT = parseFloat(st.top) || 20;
      if (e.pointerId !== undefined) try { titlebar.setPointerCapture(e.pointerId); } catch (_) {}
    });
    titlebar.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = ((e.clientX - startX) / window.innerWidth) * 100;
      const dy = ((e.clientY - startY) / window.innerHeight) * 100;
      let l = startL + dx;
      let t = startT + dy;
      l = Math.max(0, Math.min(l, 98));
      t = Math.max(0, Math.min(t, 98));
      floatWrap.style.left = l + 'vw';
      floatWrap.style.top = t + 'vh';
    });
    titlebar.addEventListener('pointerup', () => { dragging = false; });
  }

  const resizer = document.querySelector('.chart-float-resizer');
  if (resizer && floatWrap) {
    let resizing = false, startX, startY, startW, startH;
    resizer.addEventListener('pointerdown', e => {
      e.preventDefault();
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = floatWrap.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;
      resizer.setPointerCapture(e.pointerId);
    });
    resizer.addEventListener('pointermove', e => {
      if (!resizing) return;
      const w = Math.max(320, startW + e.clientX - startX);
      const h = Math.max(260, startH + e.clientY - startY);
      floatWrap.style.width = w + 'px';
      floatWrap.style.height = h + 'px';
    });
    resizer.addEventListener('pointerup', () => {
      resizing = false;
      drawChart();
    });
  }

  document.querySelectorAll('.chart-float-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      switchFloatTab(btn.dataset.tab);
      if (typeof playClick === 'function') playClick();
    });
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && floatWrap && floatWrap.style.display !== 'none') closeChartFloat();
  });

  if (typeof ResizeObserver !== 'undefined' && floatWrap) {
    chartResizeObserver = new ResizeObserver(() => {
      if (floatOpen() && floatTabIs('live')) drawChart();
    });
    chartResizeObserver.observe(floatWrap);
  }

  const textbookStage = document.getElementById('textbook-chart-stage');
  if (typeof ResizeObserver !== 'undefined' && textbookStage) {
    const textObserver = new ResizeObserver(() => {
      const pane = document.querySelector('.chart-tab-pane[data-tab="textbook"]');
      if (pane && pane.classList.contains('active')) renderTextbookChart(currentTextbookChart);
    });
    textObserver.observe(textbookStage);
  }
}

function openChartFloat() {
  if (!floatWrap) return;
  floatWrap.style.display = 'flex';
  if (!floatWrap.style.width) {
    floatWrap.style.width = '70vw';
    floatWrap.style.height = '60vh';
    floatWrap.style.left = '15vw';
    floatWrap.style.top = '20vh';
  }
  bigView.live = true;
  updateLiveBtn();
  switchFloatTab('live');
  drawChart();
  updateChartTitle();
}

function closeChartFloat() {
  if (!floatWrap) return;
  floatWrap.style.display = 'none';
  hideTooltip();
  hideSegmentCard();
}

function hideSegmentCard() {
  const card = document.getElementById('segment-card');
  if (card) card.style.display = 'none';
}

function switchFloatTab(tab) {
  document.querySelectorAll('.chart-float-tabs button').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.querySelectorAll('.chart-tab-pane').forEach(p => {
    p.classList.toggle('active', p.dataset.tab === tab);
  });
  if (tab !== 'textbook') hideSegmentCard();
  if (tab === 'live') drawChart();
  if (tab === 'textbook') renderTextbookChart(currentTextbookChart);
}

/* ---------- 教材图像 ---------- */
let currentTextbookChart = 'melt-c';
const POINT_INFO = {
  'melt-c': {
    A: { title: 'A 点 · 固态吸热升温', temp: '不断升高', heat: '吸热', phase: '固态' },
    B: { title: 'B 点 · 达到熔点，开始熔化', temp: '保持不变', heat: '吸热', phase: '固液共存' },
    C: { title: 'C 点 · 熔化结束，全部变液态', temp: '保持不变', heat: '吸热', phase: '液态' },
    D: { title: 'D 点 · 液态吸热继续升温', temp: '不断升高', heat: '吸热', phase: '液态' }
  },
  'freeze-c': {
    E: { title: 'E 点 · 液态放热降温', temp: '不断降低', heat: '放热', phase: '液态' },
    F: { title: 'F 点 · 达到凝固点，开始凝固', temp: '保持不变', heat: '放热', phase: '固液共存' },
    G: { title: 'G 点 · 凝固结束，全部变固态', temp: '即将下降', heat: '放热', phase: '固态' },
    H: { title: 'H 点 · 固态放热继续降温', temp: '不断降低', heat: '放热', phase: '固态' }
  }
};

const SEGMENT_INFO = {
  'melt-c': {
    AB: { title: 'AB 段 · 固态升温', temp: '不断升高', heat: '吸热', phase: '固态' },
    BC: { title: 'BC 段 · 熔化温度不变', temp: '保持不变', heat: '吸热', phase: '固液共存' },
    CD: { title: 'CD 段 · 液态升温', temp: '不断升高', heat: '吸热', phase: '液态' }
  },
  'freeze-c': {
    EF: { title: 'EF 段 · 液态降温', temp: '不断降低', heat: '放热', phase: '液态' },
    FG: { title: 'FG 段 · 凝固温度不变', temp: '保持不变', heat: '放热', phase: '固液共存' },
    GH: { title: 'GH 段 · 固态降温', temp: '不断降低', heat: '放热', phase: '固态' }
  }
};

let textbookGeo = null; // { points: {A:{x,y},...}, segments: [{name,type,p1,c1,c2,p2},...] }

function distToSegment(px, py, a, b) {
  const vx = b.x - a.x, vy = b.y - a.y;
  const wx = px - a.x, wy = py - a.y;
  const len2 = vx * vx + vy * vy;
  let t = len2 === 0 ? 0 : (vx * wx + vy * wy) / len2;
  if (t < 0) t = 0;
  if (t > 1) t = 1;
  const cx = a.x + t * vx, cy = a.y + t * vy;
  return Math.hypot(px - cx, py - cy);
}

function bezierPoint(p1, c1, c2, p2, t) {
  const u = 1 - t, u2 = u * u, u3 = u2 * u;
  const t2 = t * t, t3 = t2 * t;
  return {
    x: u3 * p1.x + 3 * u2 * t * c1.x + 3 * u * t2 * c2.x + t3 * p2.x,
    y: u3 * p1.y + 3 * u2 * t * c1.y + 3 * u * t2 * c2.y + t3 * p2.y
  };
}

function distToBezier(px, py, p1, c1, c2, p2) {
  let best = Infinity;
  const steps = 30;
  let prev = p1;
  for (let i = 1; i <= steps; i++) {
    const pt = bezierPoint(p1, c1, c2, p2, i / steps);
    const d = distToSegment(px, py, prev, pt);
    if (d < best) best = d;
    prev = pt;
  }
  return best;
}

function onTextbookStageClick(e) {
  const stage = document.getElementById('textbook-chart-stage');
  const card = document.getElementById('segment-card');
  if (!stage || !textbookGeo) return;
  const svg = stage.querySelector('svg');
  if (!svg) return;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return;
  const loc = pt.matrixTransform(ctm.inverse());
  const x = loc.x, y = loc.y;

  // 端点优先
  for (const name of Object.keys(textbookGeo.points)) {
    const p = textbookGeo.points[name];
    if (Math.hypot(x - p.x, y - p.y) <= 12) {
      showPointCard(name);
      return;
    }
  }

  // 线段命中（约 8px）
  for (const seg of textbookGeo.segments) {
    const d = (seg.type === 'line')
      ? distToSegment(x, y, seg.p1, seg.p2)
      : distToBezier(x, y, seg.p1, seg.c1, seg.c2, seg.p2);
    if (d <= 8) {
      showSegmentCard(seg.name);
      return;
    }
  }

  // 空白处关闭（浮窗自身不关闭）
  if (card && !card.contains(e.target)) {
    hideSegmentCard();
  }
}

function showSegmentCard(name) {
  const info = SEGMENT_INFO[currentTextbookChart];
  if (!info || !info[name]) return;
  const d = info[name];
  document.getElementById('seg-title').textContent = d.title;
  document.getElementById('seg-temp').textContent = '温度变化：' + d.temp;
  document.getElementById('seg-heat').textContent = '吸放热：' + d.heat;
  document.getElementById('seg-phase').textContent = '状态：' + d.phase;
  document.getElementById('segment-card').style.display = 'block';
}

function renderTextbookChart(key) {
  currentTextbookChart = key;
  const stage = document.getElementById('textbook-chart-stage');
  if (!stage) return;
  const isCrystal = key.endsWith('-c');
  const isMelt = key.startsWith('melt');
  const title = isCrystal
    ? (isMelt ? '晶体熔化图像' : '晶体凝固图像')
    : (isMelt ? '非晶体熔化图像' : '非晶体凝固图像');

  const W = Math.max(320, stage.clientWidth || 420);
  const H = Math.max(200, stage.clientHeight || 240);
  textbookGeo = { points: {}, segments: [] };
  const mL = 40, mR = 40, mT = 30, mB = 34;
  const pw = Math.max(1, W - mL - mR);
  const ph = Math.max(1, H - mT - mB);
  const r = Math.max(7, Math.min(pw, ph) * 0.018);
  const strokeW = Math.max(2.5, Math.min(pw, ph) * 0.006);
  const fontS = Math.max(12, Math.min(pw, ph) * 0.04);
  const smallFS = Math.max(10, fontS * 0.82);
  const arcOut = 0.55; // 晶体图弧线外凸比例

  let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="100%">';
  svg += '<text x="' + mL + '" y="22" fill="#ffd54f" font-size="' + fontS + '">' + title + '</text>';
  svg += '<line x1="' + mL + '" y1="' + (H - mB) + '" x2="' + (W - mR) + '" y2="' + (H - mB) + '" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>';
  svg += '<line x1="' + mL + '" y1="' + (H - mB) + '" x2="' + mL + '" y2="' + mT + '" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>';
  svg += '<text x="' + (W - mR + 6) + '" y="' + (H - mB + 5) + '" fill="#9aa4b5" font-size="' + smallFS + '">t/min</text>';
  svg += '<text x="' + (mL - 28) + '" y="' + (mT + 4) + '" fill="#9aa4b5" font-size="' + smallFS + '">T/℃</text>';

  function px(rx, ry) {
    return { x: mL + rx * pw, y: mT + ry * ph };
  }
  function bezier(P, Q, c1, c2) {
    return '<path d="M ' + P.x + ' ' + P.y + ' C ' + c1.x + ' ' + c1.y + ', ' + c2.x + ' ' + c2.y + ', ' + Q.x + ' ' + Q.y + '" fill="none" stroke="#5ad7ff" stroke-width="' + strokeW + '" stroke-linecap="round"/>';
  }
  function label(name, x, y, anchor, baseline) {
    const ax = anchor === 'end' ? x - 10 : (anchor === 'start' ? x + 10 : x);
    const dy = baseline === 'top' ? y - 12 : (baseline === 'bottom' ? y + 16 : y + 5);
    return '<text x="' + ax + '" y="' + dy + '" fill="#fff" font-size="' + fontS + '" text-anchor="' + (anchor === 'middle' ? 'middle' : (anchor === 'end' ? 'end' : 'start')) + '">' + name + '</text>';
  }

  if (isCrystal) {
    // 晶体图：平台占横轴 25%，A→B 弧与 C→D 弧对称
    const plateauW = 0.25;
    const leftW = 0.30;   // A 到 B 的水平跨度
    const rightW = 0.30;  // C 到 D 的水平跨度
    const startX = 0.05, endX = 0.98;
    const lowY = 0.82, highY = 0.14, midY = 0.42;
    const Bx = startX + leftW;
    const Cx = Bx + plateauW;
    const Dx = endX;

    if (isMelt) {
      const A = px(startX, lowY), B = px(Bx, midY), C = px(Cx, midY), D = px(Dx, highY);
      textbookGeo.points = { A, B, C, D };
      // 控制点：A→B 与 C→D 对称（水平镜像+垂直镜像）
      const c1 = { x: A.x + leftW * arcOut * pw, y: A.y - (lowY - midY) * 0.45 * ph };
      const c2 = { x: B.x - leftW * (1 - arcOut) * pw, y: B.y + (lowY - midY) * 0.10 * ph };
      const c3 = { x: C.x + rightW * (1 - arcOut) * pw, y: C.y - (midY - highY) * 0.10 * ph };
      const c4 = { x: D.x - rightW * arcOut * pw, y: D.y + (midY - highY) * 0.45 * ph };
      svg += bezier(A, B, c1, c2);
      svg += '<line x1="' + B.x + '" y1="' + B.y + '" x2="' + C.x + '" y2="' + C.y + '" stroke="#5ad7ff" stroke-width="' + strokeW + '"/>';
      svg += bezier(C, D, c3, c4);
      textbookGeo.segments = [
        { name: 'AB', type: 'bezier', p1: A, c1, c2, p2: B },
        { name: 'BC', type: 'line', p1: B, p2: C },
        { name: 'CD', type: 'bezier', p1: C, c1: c3, c2: c4, p2: D }
      ];
      svg += makePoint('A', A.x, A.y, '#5ad7ff', r);
      svg += makePoint('B', B.x, B.y, '#5ad7ff', r);
      svg += makePoint('C', C.x, C.y, '#5ad7ff', r);
      svg += makePoint('D', D.x, D.y, '#5ad7ff', r);
      svg += label('A', A.x, A.y, 'end', 'bottom');
      svg += label('B', B.x, B.y, 'end', 'top');
      svg += label('C', C.x, C.y, 'start', 'top');
      svg += label('D', D.x, D.y, 'start', 'bottom');
    } else {
      const E = px(startX, highY), F = px(Bx, midY + 0.08), G = px(Cx, midY + 0.08), H = px(Dx, lowY);
      textbookGeo.points = { E, F, G, H };
      const c1 = { x: E.x + leftW * arcOut * pw, y: E.y + (midY + 0.08 - highY) * 0.45 * ph };
      const c2 = { x: F.x - leftW * (1 - arcOut) * pw, y: F.y - (midY + 0.08 - highY) * 0.10 * ph };
      const c3 = { x: G.x + rightW * (1 - arcOut) * pw, y: G.y + (lowY - midY - 0.08) * 0.10 * ph };
      const c4 = { x: H.x - rightW * arcOut * pw, y: H.y - (lowY - midY - 0.08) * 0.45 * ph };
      svg += bezier(E, F, c1, c2);
      svg += '<line x1="' + F.x + '" y1="' + F.y + '" x2="' + G.x + '" y2="' + G.y + '" stroke="#5ad7ff" stroke-width="' + strokeW + '"/>';
      svg += bezier(G, H, c3, c4);
      textbookGeo.segments = [
        { name: 'EF', type: 'bezier', p1: E, c1, c2, p2: F },
        { name: 'FG', type: 'line', p1: F, p2: G },
        { name: 'GH', type: 'bezier', p1: G, c1: c3, c2: c4, p2: H }
      ];
      svg += makePoint('E', E.x, E.y, '#5ad7ff', r);
      svg += makePoint('F', F.x, F.y, '#5ad7ff', r);
      svg += makePoint('G', G.x, G.y, '#5ad7ff', r);
      svg += makePoint('H', H.x, H.y, '#5ad7ff', r);
      svg += label('E', E.x, E.y, 'end', 'top');
      svg += label('F', F.x, F.y, 'end', 'bottom');
      svg += label('G', G.x, G.y, 'start', 'bottom');
      svg += label('H', H.x, H.y, 'start', 'bottom');
    }
  } else {
    // 非晶体：光滑曲线，占满绘图区
    const P0 = px(0.05, isMelt ? 0.82 : 0.14);
    const P1 = px(0.28, isMelt ? 0.62 : 0.38);
    const P2 = px(0.72, isMelt ? 0.32 : 0.68);
    const P3 = px(0.98, isMelt ? 0.14 : 0.82);
    svg += '<path d="M ' + P0.x + ' ' + P0.y + ' C ' + P1.x + ' ' + P1.y + ', ' + P2.x + ' ' + P2.y + ', ' + P3.x + ' ' + P3.y + '" fill="none" stroke="#ff9800" stroke-width="' + strokeW + '" stroke-linecap="round"/>';
  }
  svg += '</svg>';
  stage.innerHTML = svg;

  const svgEl = stage.querySelector('svg');
  if (svgEl) {
    svgEl.style.cursor = 'crosshair';
    svgEl.addEventListener('click', onTextbookStageClick);
  }
}

function makePoint(name, x, y, color, r) {
  r = r || 6;
  return '<circle data-point="' + name + '" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + color + '" stroke="#fff" stroke-width="1.5" style="cursor:pointer"/>';
}

function showPointCard(name) {
  const info = POINT_INFO[currentTextbookChart];
  if (!info || !info[name]) return;
  const d = info[name];
  document.getElementById('seg-title').textContent = d.title;
  document.getElementById('seg-temp').textContent = '温度变化：' + d.temp;
  document.getElementById('seg-heat').textContent = '吸放热：' + d.heat;
  document.getElementById('seg-phase').textContent = '状态：' + d.phase;
  document.getElementById('segment-card').style.display = 'block';
}

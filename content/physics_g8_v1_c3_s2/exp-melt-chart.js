/* exp-melt-chart.js — 温度-时间曲线系统（小图 + 放大悬浮窗） [r5i] */
/* eslint-env browser */

const CHART_SAMPLE_NAMES = { hypo: '海波', paraffin: '石蜡', ice: '冰' };
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

let chartCanvas, chartCtx;
let floatCanvas, floatCtx, floatWrap;
let tooltipEl;
let chartResizeObserver;
let floatPanRight = null; // null = 自动跟随最新数据
let floatPanning = false, floatPanStartX = 0, floatPanStartRight = 0;
let livePanRight = null; // null = 小图跟随最新数据
let livePanning = false, livePanStartX = 0, livePanStartRight = 0;

const LIVE_WINDOW = 60;   // 小图时间窗（分钟）：r13 单连续实验流，整段可见使熔化/凝固两平台同屏
const FLOAT_WINDOW = 12;  // 悬浮窗实时曲线时间窗（分钟）

/* ---------- 初始化 ---------- */
function initChart() {
  chartCanvas = document.getElementById('tt-chart');
  if (chartCanvas) chartCtx = chartCanvas.getContext('2d');

  floatCanvas = document.getElementById('float-tt-chart');
  if (floatCanvas) floatCtx = floatCanvas.getContext('2d');

  floatWrap = document.getElementById('chart-float');
  tooltipEl = document.getElementById('chart-tooltip');

  bindChartHover(chartCanvas, LIVE_WINDOW);
  bindChartHover(floatCanvas, FLOAT_WINDOW);
  bindFloatUI();
  bindFloatPan();
  bindLivePan();

  const liveBtn = document.getElementById('chart-live-btn');
  if (liveBtn) {
    liveBtn.addEventListener('click', () => {
      livePanRight = null;
      renderToCtx(chartCtx, chartCanvas, LIVE_WINDOW, false);
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

  resizeChart();
  updateChartTitle();
  updateLiveBtn();
}

function redrawChart() {
  resizeChart();
  updateChartTitle();
}

// 兼容旧调用名
function drawChart() { redrawChart(); }

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
  if (!btn) return;
  btn.classList.toggle('show', livePanRight !== null);
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

function updateFloatLatestBtn() {
  const btn = document.querySelector('.chart-float-latest');
  if (!btn) return;
  btn.classList.toggle('active', floatPanRight !== null);
}

/* ---------- 坐标范围（r11：y 轴固定 -15 ~ 110，不随数据扩缩） ---------- */
function computeYRange() {
  return { yMin: -15, yMax: 110, step: 20 };
}

/* 固定刻度线：0~100 每 20 一格；底部 -15 单独一条，顶部 110 单独一条（均不在 20 步进内） */
function fixedTickList() {
  const ticks = [];
  for (let T = 0; T <= 100 + 0.001; T += 20) ticks.push(T);
  ticks.push(-15);
  ticks.push(110);
  return ticks;
}

function computeXRange(windowMinutes, right) {
  const data = state.dataLog || [];
  const tMax = data.length ? data[data.length - 1].t : 0;
  const r = (typeof right === 'number') ? right : Math.max(windowMinutes, tMax);
  const left = Math.max(0, r - windowMinutes);
  return { xMin: left, xMax: r, tMax };
}

function getMargins(isFloat) {
  return { top: 22, right: isFloat ? 34 : 28, bottom: 26, left: 42 };
}

/* ---------- 绘制 ---------- */
function renderToCtx(ctx, canvas, timeWindow, isFloat) {
  const w = canvas.width, h = canvas.height;
  if (!w || !h) return;
  ctx.clearRect(0, 0, w, h);

  const data = state.dataLog || [];
  const m = getMargins(isFloat);
  const plotX = m.left;
  const plotY = m.top;
  const plotW = Math.max(1, w - m.left - m.right);
  const plotH = Math.max(1, h - m.top - m.bottom);

  const { xMin, xMax } = computeXRange(timeWindow, isFloat ? floatPanRight : livePanRight);
  const { yMin, yMax } = computeYRange();
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;

  function xScale(t) { return plotX + (t - xMin) / xRange * plotW; }
  function yScale(T) { return plotY + plotH - (T - yMin) / yRange * plotH; }

  // 网格（r10：固定刻度线）
  ctx.strokeStyle = CHART_COLORS.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const xGridStep = isFloat ? 1 : 2;
  for (let t = Math.ceil(xMin / xGridStep) * xGridStep; t <= xMax + 0.001; t += xGridStep) {
    const x = xScale(t);
    ctx.moveTo(x, plotY);
    ctx.lineTo(x, plotY + plotH);
  }
  fixedTickList().forEach(T => {
    const y = yScale(T);
    ctx.moveTo(plotX, y);
    ctx.lineTo(plotX + plotW, y);
  });
  ctx.stroke();

  // 坐标轴
  ctx.strokeStyle = CHART_COLORS.axis;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotX, plotY);
  ctx.lineTo(plotX, plotY + plotH);
  ctx.lineTo(plotX + plotW, plotY + plotH);
  ctx.stroke();

  // 刻度与数字（r10：固定刻度线，含底部 -15）
  ctx.fillStyle = CHART_COLORS.tick;
  ctx.font = (isFloat ? '12px' : '11px') + ' sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  fixedTickList().forEach(T => {
    const y = yScale(T);
    ctx.beginPath();
    ctx.strokeStyle = CHART_COLORS.axis;
    ctx.lineWidth = 1;
    ctx.moveTo(plotX - 5, y);
    ctx.lineTo(plotX, y);
    ctx.stroke();
    ctx.fillText(String(Math.round(T)), plotX - 8, y);
  });

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  // 自适应刻度间隔：保证相邻两位数字不重叠，且10/12 min窗口下至少5个刻度
  const approxDigitW = ctx.measureText('00').width;
  const minTickGapPx = approxDigitW + 16;
  let xLabelStep = 1;
  while (plotW / ((xMax - xMin) / xLabelStep) < minTickGapPx && xLabelStep < 60) xLabelStep++;
  if ((xMax - xMin) / xLabelStep < 4) {
    xLabelStep = Math.max(1, Math.floor((xMax - xMin) / 5));
  }

  for (let t = Math.ceil(xMin / xLabelStep) * xLabelStep; t <= xMax + 0.001; t += xLabelStep) {
    const x = xScale(t);
    ctx.beginPath();
    ctx.strokeStyle = CHART_COLORS.axis;
    ctx.lineWidth = 1;
    ctx.moveTo(x, plotY + plotH);
    ctx.lineTo(x, plotY + plotH + 4);
    ctx.stroke();
    ctx.fillText(String(Math.round(t)), x, plotY + plotH + 6);
  }

  // 轴名称：放到绘图区内侧，避免与刻度数字重叠
  ctx.fillStyle = CHART_COLORS.tick;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('T/℃', plotX + 4, plotY + 4);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('t/min', plotX + plotW - 4, plotY + plotH - 6);

  // 熔点/凝固平台虚线
  const def = (typeof sampleDef === 'function') ? sampleDef() : null;
  if (def && def.kind === 'crystal' && typeof def.meltingPoint === 'number') {
    const mp = def.meltingPoint;
    if (mp >= yMin && mp <= yMax) {
      const y = yScale(mp);
      ctx.strokeStyle = CHART_COLORS.plateau;
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#5ad7ff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.font = (isFloat ? '12px' : '11px') + ' sans-serif';
      const label = (state.mode === 'freeze' ? '凝固平台 ' : '熔点 ') + mp + '℃';
      ctx.fillText(label, plotX + 4, y - 3);
    }
  }

  if (!data.length) return;

  // 曲线（双色分段：加热暖色，冷却冷色）
  ctx.save();
  ctx.beginPath();
  ctx.rect(plotX, plotY, plotW, plotH);
  ctx.clip();

  function pointColor(pt) { return pt.heat === false ? CHART_COLORS.curveCool : CHART_COLORS.curveHeat; }

  ctx.lineWidth = isFloat ? 3 : 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (let i = 1; i < data.length; i++) {
    ctx.beginPath();
    ctx.moveTo(xScale(data[i - 1].t), yScale(data[i - 1].T));
    ctx.lineTo(xScale(data[i].t), yScale(data[i].T));
    ctx.strokeStyle = pointColor(data[i]);
    ctx.stroke();
  }

  // 描点
  data.forEach(pt => {
    const x = xScale(pt.t);
    const y = yScale(pt.T);
    ctx.beginPath();
    ctx.arc(x, y, isFloat ? 3 : 2.5, 0, Math.PI * 2);
    ctx.fillStyle = pointColor(pt);
    ctx.fill();
  });

  // 图例（加热/冷却）：右上角，避开左上角 T/℃ 轴名
  if (data.length) {
    const lx = plotX + plotW - 70;
    const ly = plotY + 8;
    const r = isFloat ? 4 : 3;
    ctx.font = (isFloat ? '12px' : '11px') + ' sans-serif';
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

function resizeChart() {
  if (chartCanvas && chartCanvas.parentElement) {
    const rect = chartCanvas.parentElement.getBoundingClientRect();
    chartCanvas.width = Math.max(1, rect.width);
    chartCanvas.height = Math.max(1, rect.height);
    renderToCtx(chartCtx, chartCanvas, LIVE_WINDOW, false);
  }
  resizeFloatChart();
}

function resizeFloatChart() {
  if (!floatWrap || floatWrap.style.display === 'none') return;
  const activeTab = document.querySelector('.chart-float-tabs button.active');
  const tab = activeTab ? activeTab.dataset.tab : 'live';
  if (tab === 'live') {
    if (!floatCanvas) return;
    const rect = floatCanvas.parentElement.getBoundingClientRect();
    floatCanvas.width = Math.max(1, rect.width);
    floatCanvas.height = Math.max(1, rect.height);
    renderToCtx(floatCtx, floatCanvas, FLOAT_WINDOW, true);
  } else if (tab === 'textbook') {
    renderTextbookChart(currentTextbookChart);
  }
}

/* ---------- hover 气泡 ---------- */
function bindChartHover(canvas, timeWindow) {
  if (!canvas) return;
  canvas.addEventListener('pointermove', e => {
    if (livePanning) { hideTooltip(); return; }
    const hit = findNearestPoint(canvas, timeWindow, e.clientX, e.clientY);
    if (hit) showTooltip(hit.pt, hit.x, hit.y, hit.rect);
    else hideTooltip();
  });
  canvas.addEventListener('pointerleave', hideTooltip);
  canvas.addEventListener('pointerdown', e => {
    if (livePanning) return;
    const hit = findNearestPoint(canvas, timeWindow, e.clientX, e.clientY);
    if (hit) showTooltip(hit.pt, hit.x, hit.y, hit.rect);
    else hideTooltip();
  });
}

function findNearestPoint(canvas, timeWindow, clientX, clientY) {
  const data = state.dataLog || [];
  if (!data.length || !canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const isFloat = canvas === floatCanvas;
  const m = getMargins(isFloat);
  const plotW = Math.max(1, rect.width - m.left - m.right);
  const plotH = Math.max(1, rect.height - m.top - m.bottom);
  const { xMin, xMax } = computeXRange(timeWindow, isFloat ? floatPanRight : livePanRight);
  const { yMin, yMax } = computeYRange();

  const mx = clientX - rect.left;
  const my = clientY - rect.top;
  const tHover = xMin + (mx - m.left) / plotW * (xMax - xMin);

  let best = null, bestDt = Infinity;
  data.forEach(pt => {
    const dt = Math.abs(pt.t - tHover);
    if (dt < bestDt) { bestDt = dt; best = pt; }
  });
  if (!best) return null;

  const x = m.left + (best.t - xMin) / (xMax - xMin) * plotW;
  const y = m.top + plotH - (best.T - yMin) / (yMax - yMin) * plotH;
  const dist = Math.hypot(mx - x, my - y);
  if (dist > (isFloat ? 34 : 26)) return null;
  return { pt: best, x, y, rect };
}

function showTooltip(pt, x, y, rect) {
  if (!tooltipEl) return;
  const phase = (typeof state !== 'undefined' && state.phaseName) ? state.phaseName : '';
  tooltipEl.innerHTML = '时间 ' + pt.t + ' min<br>温度 ' + pt.T.toFixed(1) + ' ℃' + (phase ? '<br>物态：' + phase : '');
  tooltipEl.style.display = 'block';
  const tw = tooltipEl.offsetWidth;
  const th = tooltipEl.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = rect.left + x + 12;
  let top = rect.top + y - th - 10;
  if (left + tw > vw) left = rect.left + x - tw - 12;
  if (top < 0) top = rect.top + y + 16;
  if (left < 0) left = 4;
  if (top + th > vh) top = vh - th - 4;

  tooltipEl.style.left = left + 'px';
  tooltipEl.style.top = top + 'px';
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.style.display = 'none';
}

/* ---------- 悬浮窗 ---------- */
function bindFloatUI() {
  const openBtn = document.getElementById('chart-float-btn');
  if (openBtn) openBtn.addEventListener('click', () => { openChartFloat(); if (typeof playClick === 'function') playClick(); });

  const closeBtn = document.querySelector('.chart-float-close');
  if (closeBtn) closeBtn.addEventListener('click', closeChartFloat);

  const latestBtn = document.querySelector('.chart-float-latest');
  if (latestBtn) latestBtn.addEventListener('click', () => {
    floatPanRight = null;
    resizeFloatChart();
    updateFloatLatestBtn();
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
      resizeFloatChart();
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
      if (floatWrap && floatWrap.style.display !== 'none') resizeFloatChart();
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

function bindFloatPan() {
  if (!floatCanvas) return;
  const wrap = floatCanvas.parentElement;
  if (!wrap) return;

  function minutesPerPx() {
    const rect = floatCanvas.getBoundingClientRect();
    const m = getMargins(true);
    const plotW = Math.max(1, rect.width - m.left - m.right);
    return FLOAT_WINDOW / plotW;
  }

  function moveToRight(right) {
    const data = state.dataLog || [];
    const tMax = data.length ? data[data.length - 1].t : 0;
    floatPanRight = Math.max(FLOAT_WINDOW, Math.min(right, Math.max(tMax, FLOAT_WINDOW)));
    resizeFloatChart();
    updateFloatLatestBtn();
  }

  let lastTapTime = 0, lastTapX = 0, lastTapY = 0;

  wrap.addEventListener('pointerdown', e => {
    if (e.target.closest('.chart-float-latest') || e.target.closest('.chart-float-close')) return;
    floatPanning = true;
    floatPanStartX = e.clientX;
    floatPanStartRight = (typeof floatPanRight === 'number') ? floatPanRight : computeXRange(FLOAT_WINDOW).xMax;
    try { wrap.setPointerCapture(e.pointerId); } catch (_) {}
  });

  wrap.addEventListener('pointermove', e => {
    if (!floatPanning) return;
    hideTooltip();
    const dx = e.clientX - floatPanStartX;
    moveToRight(floatPanStartRight - dx * minutesPerPx());
  });

  wrap.addEventListener('pointerup', e => {
    floatPanning = false;
    const now = Date.now();
    if (now - lastTapTime < 350 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 10) {
      floatPanRight = null;
      resizeFloatChart();
      updateFloatLatestBtn();
    }
    lastTapTime = now;
    lastTapX = e.clientX;
    lastTapY = e.clientY;
  });
  wrap.addEventListener('pointercancel', () => { floatPanning = false; });

  wrap.addEventListener('wheel', e => {
    if (!floatWrap || floatWrap.style.display === 'none') return;
    const delta = e.deltaX || e.deltaY;
    if (!delta) return;
    e.preventDefault();
    const mpp = minutesPerPx();
    const currentRight = (typeof floatPanRight === 'number') ? floatPanRight : computeXRange(FLOAT_WINDOW).xMax;
    moveToRight(currentRight + delta * mpp);
  }, { passive: false });

  wrap.addEventListener('dblclick', e => {
    if (e.target.closest('.chart-float-latest') || e.target.closest('.chart-float-close')) return;
    floatPanRight = null;
    resizeFloatChart();
    updateFloatLatestBtn();
  });
}

function bindLivePan() {
  if (!chartCanvas) return;

  function minutesPerPx() {
    const rect = chartCanvas.getBoundingClientRect();
    const m = getMargins(false);
    const plotW = Math.max(1, rect.width - m.left - m.right);
    return LIVE_WINDOW / plotW;
  }

  function moveToRight(right) {
    const data = state.dataLog || [];
    const tMax = data.length ? data[data.length - 1].t : 0;
    livePanRight = Math.max(LIVE_WINDOW, Math.min(right, Math.max(tMax, LIVE_WINDOW)));
    renderToCtx(chartCtx, chartCanvas, LIVE_WINDOW, false);
    updateLiveBtn();
  }

  chartCanvas.addEventListener('pointerdown', e => {
    livePanning = true;
    livePanStartX = e.clientX;
    livePanStartRight = (typeof livePanRight === 'number') ? livePanRight : computeXRange(LIVE_WINDOW).xMax;
    chartCanvas.style.cursor = 'grabbing';
    try { chartCanvas.setPointerCapture(e.pointerId); } catch (_) {}
  });

  chartCanvas.addEventListener('pointermove', e => {
    if (!livePanning) return;
    hideTooltip();
    const dx = e.clientX - livePanStartX;
    moveToRight(livePanStartRight - dx * minutesPerPx());
  });

  chartCanvas.addEventListener('pointerup', () => { livePanning = false; chartCanvas.style.cursor = 'grab'; });
  chartCanvas.addEventListener('pointercancel', () => { livePanning = false; chartCanvas.style.cursor = 'grab'; });

  chartCanvas.addEventListener('dblclick', () => {
    livePanRight = null;
    renderToCtx(chartCtx, chartCanvas, LIVE_WINDOW, false);
    updateLiveBtn();
  });

  chartCanvas.style.cursor = 'grab';
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
  floatPanRight = null;
  updateFloatLatestBtn();
  switchFloatTab('live');
  resizeFloatChart();
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
  if (tab === 'live') resizeFloatChart();
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
    G: { title: 'G 点 · 凝固结束，全部变固态', temp: '保持不变', heat: '放热', phase: '固态' },
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

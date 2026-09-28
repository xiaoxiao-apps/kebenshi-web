/* exp-vapor.js — 汽化液化探究馆 UI 与交互 [s11: 删开场演示、初始即运行] */
/* eslint-env browser */

function init() {
  state = makeInitialState();
  initScene();
  bindCameraEvents();
  bindTouchZoom();
  bindUI();
  initChart();
  updateUI();
  animate();
  if (typeof initLiquefyDom === 'function') initLiquefyDom();
  document.getElementById('btn-pause').textContent = '暂停';
  const lb = document.getElementById('btn-lamp');
  lb.textContent = '点燃酒精灯'; lb.classList.add('primary'); lb.classList.remove('warn');
}

function bindCameraEvents() {
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('resize', () => { onResize(); drawChart(); });
}

function bindUI() {
  bindModeTabs();
  bindCustomSelect('fire', v => { state.fire = v; updateFlame(); });
  bindCustomSelect('amount', v => { state.amount = v; });
  bindCustomSelect('timescale', v => { state.timeScale = parseFloat(v); });
  bindCustomSelect('lid', v => { switchLid(state, v); updateCoverVisual(); if (v === 'sealed') showToast('盖上密封盖后水蒸气不易跑出，杯内液面上方气压增大，沸点升高'); });
  bindSlider('amb', v => { state.ambTemp = v; state.waterTemp = v; state.evap.cooling.withTemp = v; state.evap.cooling.withoutTemp = v; state.evap.paper.waterTemp = v; state.evap.paper.paperTemp = v; if (state.simTime === 0) { clearTable(); } updateUI(); }, '℃');

  bindEvapUI();
  document.getElementById('btn-lamp').addEventListener('click', toggleLamp);
  document.getElementById('btn-pause').addEventListener('click', () => { state.paused = !state.paused; document.getElementById('btn-pause').textContent = state.paused ? '开始' : '暂停'; if (!state.paused && state.heating) startBoil(); else stopBoil(); playClick(); });
  document.getElementById('btn-reset').addEventListener('click', resetAll);
  document.getElementById('btn-mute').addEventListener('click', () => { setSoundEnabled(!getSoundEnabled()); document.getElementById('btn-mute').textContent = getSoundEnabled() ? '🔊' : '🔇'; playClick(); });
  document.getElementById('btn-pause').textContent = state.paused ? '开始' : '暂停';
}

function bindSlider(name, setter, unit) {
  const slider = document.getElementById(name + '-slider');
  const minus = document.getElementById(name + '-minus');
  const plus = document.getElementById(name + '-plus');
  const val = document.getElementById(name + '-val');
  const step = parseFloat(slider.step);
  slider.addEventListener('input', () => { const v = parseFloat(slider.value); setter(v); val.textContent = v + unit; });
  minus.addEventListener('click', () => { slider.value = Math.max(slider.min, parseFloat(slider.value) - step); slider.dispatchEvent(new Event('input')); playClick(); });
  plus.addEventListener('click', () => { slider.value = Math.min(slider.max, parseFloat(slider.value) + step); slider.dispatchEvent(new Event('input')); playClick(); });
}

function bindCustomSelect(id, callback) {
  const wrap = document.getElementById(id + '-wrap');
  const select = document.getElementById(id + '-select');
  const triggerText = wrap.querySelector('.custom-select-text');
  const options = wrap.querySelectorAll('.custom-option');
  function setValue(value) {
    select.value = value;
    const opt = wrap.querySelector('.custom-option[data-value="' + value + '"]');
    if (opt) { triggerText.textContent = opt.textContent; options.forEach(o => o.classList.remove('active')); opt.classList.add('active'); }
    callback(value); playClick();
  }
  wrap.querySelector('.custom-select-trigger').addEventListener('click', e => { e.stopPropagation(); const open = wrap.classList.contains('open'); document.querySelectorAll('.custom-select.open').forEach(w => w.classList.remove('open')); if (!open) wrap.classList.add('open'); });
  options.forEach(opt => opt.addEventListener('click', e => { e.stopPropagation(); setValue(opt.dataset.value); wrap.classList.remove('open'); }));
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) wrap.classList.remove('open'); });
  select.addEventListener('change', () => setValue(select.value));
}

function toggleLamp() {
  state.heating = !state.heating;
  updateFlame();
  const btn = document.getElementById('btn-lamp');
  btn.textContent = state.heating ? '熄灭酒精灯' : '点燃酒精灯';
  btn.classList.toggle('primary', !state.heating); btn.classList.toggle('warn', state.heating);
  if (state.heating) { playIgnite(); if (!state.paused) startBoil(); }
  else { playClick(); stopBoil(); }
}

function resetAll() {
  const mode = state.mode, sub = state.evapSub;
  const lidSel = document.getElementById('lid-select');
  const lid = lidSel ? lidSel.value : 'vent';
  state = makeInitialState({ ambTemp: parseFloat(document.getElementById('amb-slider').value), fire: document.getElementById('fire-select').value, amount: document.getElementById('amount-select').value, timeScale: parseFloat(document.getElementById('timescale-select').value), mode: mode, evapSub: sub, lid: lid });
  stopBoil(); updateFlame(); updateThermometerLiquid(); updateBathVisual(); updateCoverVisual(); clearTable();
  if (mode === 'evap') { setModeVisibility(mode); switchEvapSub(sub); }
  updateUI();
  document.getElementById('btn-pause').textContent = '暂停';
  document.getElementById('btn-lamp').textContent = '点燃酒精灯';
  document.getElementById('btn-lamp').classList.add('primary'); document.getElementById('btn-lamp').classList.remove('warn');
  if (!state.paused && state.heating) startBoil(); else stopBoil();
  playClick();
}

function updateUI() {
  if (state.mode === 'boil') updateBoilUI();
  else if (state.mode === 'evap') updateEvapUI();
}

function soundStateText(T, boiling, heating) {
  if (boiling) return '开水不响';
  if (!heating) return '无声';
  if (T < 60) return '几乎无声';
  if (T < 75) return '渐响';
  if (T < 85) return '最响·响水不开';
  return '渐小';
}

function updateBoilUI() {
  document.getElementById('r-water-temp').textContent = state.waterTemp.toFixed(1) + ' ℃';
  document.getElementById('r-boil-state').textContent = state.boiling ? '沸腾' : '未沸腾';
  document.getElementById('r-sim-time').textContent = (state.simTime / 60).toFixed(1) + ' min';
  const lvl = state.soundLevel || 0;
  document.getElementById('r-sound-level').style.width = (lvl * 100).toFixed(0) + '%';
  document.getElementById('r-sound-state').textContent = soundStateText(state.waterTemp, state.boiling, state.heating);
  const arrow = document.getElementById('heat-arrow');
  arrow.classList.toggle('show', state.boiling && state.heating);
  if (state.dataLog.length !== lastTableCount) {
    lastTableCount = state.dataLog.length;
    renderTable(); playDrip();
  }
  if ((state.chartLog || []).length !== lastChartCount) {
    lastChartCount = (state.chartLog || []).length;
    drawChart();
  }
  if (state.mode === 'boil' && boilGain) setBoilVolume(lvl);
}

function updateEvapUI() {
  const f = state.evap.factors;
  document.getElementById('evap-amb-slider').value = f.ambTemp;
  document.getElementById('evap-amb-val').textContent = f.ambTemp + '℃';
  document.getElementById('evap-temp-slider').value = f.temp;
  document.getElementById('evap-temp-val').textContent = f.temp + '℃';
  document.getElementById('evap-area-slider').value = f.area;
  document.getElementById('evap-area-val').textContent = f.area.toFixed(1);
  document.getElementById('evap-wind-slider').value = f.wind;
  document.getElementById('evap-wind-val').textContent = f.wind.toFixed(1);
  document.getElementById('evap-cool-temp-slider').value = state.evap.cooling.baseT;
  document.getElementById('evap-cool-temp-val').textContent = state.evap.cooling.baseT + '℃';
  document.getElementById('evap-cool-wind-slider').value = state.evap.cooling.wind;
  document.getElementById('evap-cool-wind-val').textContent = state.evap.cooling.wind.toFixed(1);
  document.getElementById('evap-vol-left').textContent = (f.volumes[0] * 100).toFixed(0) + '%';
  document.getElementById('evap-vol-right').textContent = (f.volumes[1] * 100).toFixed(0) + '%';
  document.getElementById('evap-temp-with').textContent = state.evap.cooling.withTemp.toFixed(1) + ' ℃';
  document.getElementById('evap-temp-without').textContent = state.evap.cooling.withoutTemp.toFixed(1) + ' ℃';
  document.querySelectorAll('.evap-coat-btn').forEach((btn, i) => {
    btn.textContent = '涂酒精';
  });
  document.getElementById('evap-alcohol-left').textContent = state.evap.cooling.alcohol[0].toFixed(0) + '%';
  document.getElementById('evap-alcohol-right').textContent = state.evap.cooling.alcohol[1].toFixed(0) + '%';
  document.getElementById('paper-water-temp').textContent = state.evap.paper.waterTemp.toFixed(1) + ' ℃';
  document.getElementById('paper-pot-temp').textContent = state.evap.paper.paperTemp.toFixed(1) + ' ℃';
  updateCoolingCoatButtons();
  const p = state.evap.paper;
  const pstate = document.getElementById('paper-state');
  if (p.burning) pstate.textContent = '纸锅已点燃';
  else if (!p.lit) pstate.textContent = '未点燃';
  else if (p.boiling) pstate.textContent = '水沸腾中';
  else pstate.textContent = '加热中';
  const matchBtn = document.getElementById('paper-match-btn');
  const waterBtn = document.getElementById('paper-water-btn');
  if (matchBtn) { matchBtn.textContent = p.lit ? '已点燃' : '划火柴'; matchBtn.disabled = p.lit; matchBtn.classList.toggle('primary', !p.lit); }
  if (waterBtn) { waterBtn.style.display = (!p.lit && p.water === 0 && !p.filling) ? 'block' : 'none'; }
}


function bindModeTabs() {
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      switchMode(btn.dataset.mode);
      playClick();
    });
  });
}

function switchMode(mode) {
  if (mode === state.mode) return;
  state.mode = mode;
  document.querySelectorAll('.mode-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  const boilPanel = document.getElementById('boil-panel');
  const evapPanel = document.getElementById('evap-panel');
  const liquefyPanel = document.getElementById('liquefy-panel');
  const dataBoil = document.getElementById('data-boil');
  const dataEvap = document.getElementById('data-evap');
  const dataLiquefy = document.getElementById('data-liquefy');
  const heatArrow = document.getElementById('heat-arrow');
  if (mode === 'boil') {
    boilPanel.style.display = 'block'; evapPanel.style.display = 'none'; liquefyPanel.style.display = 'none';
    dataBoil.style.display = 'block'; dataEvap.style.display = 'none'; if (dataLiquefy) dataLiquefy.style.display = 'none';
    if (heatArrow) heatArrow.style.display = 'block';
  } else if (mode === 'evap') {
    boilPanel.style.display = 'none'; evapPanel.style.display = 'block'; liquefyPanel.style.display = 'none';
    dataBoil.style.display = 'none'; dataEvap.style.display = 'block'; if (dataLiquefy) dataLiquefy.style.display = 'none';
    if (heatArrow) heatArrow.style.display = 'none';
    switchEvapSub(state.evapSub);
  } else if (mode === 'liquefy') {
    boilPanel.style.display = 'none'; evapPanel.style.display = 'none'; liquefyPanel.style.display = 'block';
    dataBoil.style.display = 'none'; dataEvap.style.display = 'none'; if (dataLiquefy) dataLiquefy.style.display = 'block';
    if (heatArrow) heatArrow.style.display = 'none';
    if (typeof switchLiquefySub === 'function') switchLiquefySub(state.liquefySub || 'breath');
  }
  cameraState.distance = mode === 'evap' ? 42 : (mode === 'liquefy' ? 50 : 58);
  cameraState.polar = Math.PI / 3.0; cameraState.azimuth = 0.45;
  if (typeof applyCameraOrbit === 'function') applyCameraOrbit();
  setModeVisibility(mode);
  if (typeof setLiquefyGroupVisible === 'function') setLiquefyGroupVisible(mode === 'liquefy');
}

function bindEvapUI() {
  document.querySelectorAll('.sub-tab').forEach(btn => {
    btn.addEventListener('click', () => { switchEvapSub(btn.dataset.sub); playClick(); });
  });
  bindSlider('evap-amb', v => { state.evap.factors.ambTemp = v; }, '℃');
  bindSlider('evap-temp', v => { state.evap.factors.temp = v; }, '℃');
  bindSlider('evap-area', v => { state.evap.factors.area = v; }, '');
  bindSlider('evap-wind', v => { state.evap.factors.wind = v; }, '');
  bindSlider('evap-cool-temp', v => { state.evap.cooling.baseT = v; }, '℃');
  bindSlider('evap-cool-wind', v => { state.evap.cooling.wind = v; }, '');
  document.getElementById('evap-reset-drops').addEventListener('click', () => { state.evap.factors.volumes = [1, 1]; state.evap.factors.fastShown = false; state.evap.factors.slowShown = false; playClick(); });
  document.querySelectorAll('.evap-coat-btn').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const c = state.evap.cooling;
      c.alcohol[i] = Math.min(100, c.alcohol[i] + 20);
      playClick();
    });
  });
  const matchBtn = document.getElementById('paper-match-btn');
  if (matchBtn) {
    matchBtn.addEventListener('click', () => {
      if (!state.evap.paper.lit) { state.evap.paper.lit = true; playClick(); }
    });
  }
  const waterBtn = document.getElementById('paper-water-btn');
  if (waterBtn) {
    waterBtn.addEventListener('click', () => {
      if (!state.evap.paper.lit && state.evap.paper.water === 0) {
        state.evap.paper.filling = true;
        playClick();
      }
    });
  }
}

function updateCoolingCoatButtons() {
  if (!coolThermometers || coolThermometers.length < 2 || !camera || !renderer) return;
  const btns = document.querySelectorAll('.evap-coat-btn');
  const rect = renderer.domElement.getBoundingClientRect();
  coolThermometers.forEach((th, i) => {
    const btn = btns[i]; if (!btn) return;
    const worldPos = new THREE.Vector3();
    th.group.getWorldPosition(worldPos);
    worldPos.project(camera);
    const x = (worldPos.x * 0.5 + 0.5) * rect.width + rect.left;
    const y = (-worldPos.y * 0.5 + 0.5) * rect.height + rect.top;
    btn.style.left = x + 'px';
    btn.style.top = (y + 30) + 'px';
  });
}

function switchEvapSub(sub) {
  state.evapSub = sub;
  document.querySelectorAll('.sub-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.sub === sub));
  document.getElementById('evap-factors-controls').style.display = sub === 'factors' ? 'block' : 'none';
  document.getElementById('evap-cooling-controls').style.display = sub === 'cooling' ? 'block' : 'none';
  document.getElementById('evap-paper-controls').style.display = sub === 'paper' ? 'block' : 'none';
  document.getElementById('evap-factors-readout').style.display = sub === 'factors' ? 'block' : 'none';
  document.getElementById('evap-cooling-readout').style.display = sub === 'cooling' ? 'block' : 'none';
  document.getElementById('evap-paper-readout').style.display = sub === 'paper' ? 'block' : 'none';
  document.querySelectorAll('.evap-coat-btn').forEach(btn => { btn.style.display = sub === 'cooling' ? 'block' : 'none'; });
  if (typeof setEvapSub === 'function') setEvapSub(sub);
}

function checkEvapToasts() {
  if (state.mode !== 'evap') return;
  const f = state.evap.factors;
  if (state.evapSub === 'factors' && f.fastShown && !f._fastToast) {
    f._fastToast = true;
    showToast('要加快液体的蒸发，可以升高液体的温度，增大液体的表面积，加快液体表面上的空气流动；而要减慢蒸发，应该采取相反的措施。');
  }
  const c = state.evap.cooling;
  if (state.evapSub === 'cooling' && c.conclusionShown && !c._toast) {
    c._toast = true;
    showToast('酒精在蒸发过程中吸热，致使酒精及与酒精接触的物体温度下降');
  }
  const p = state.evap.paper;
  if (state.evapSub === 'paper' && p.conclusionShown && !p._toast) {
    p._toast = true;
    showToast('水沸腾温度保持在沸点（100℃）低于纸的着火点，纸锅不会燃烧');
  }
}

setInterval(checkEvapToasts, 400);

window.addEventListener('DOMContentLoaded', init);

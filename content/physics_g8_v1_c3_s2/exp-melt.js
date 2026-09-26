/* exp-melt.js — 熔化凝固探究馆 UI、图表与交互 */
/* eslint-env browser */

let isRotating = false, rotateStart = { x: 0, y: 0 };
let lastTableCount = 0;

function init() {
  initScene();
  bindUI();
  bindTouchZoom();
  initChart();
  updateModeUI();
  applyInitialPhase();
  updateUI();
  animate();
}

function bindUI() {
  bindCustomSelect('sample', v => {
    state.sample = v;
    resetPhysics();
    document.getElementById('btn-pause').textContent = '开始';
    clearTable();
    redrawChart();
    updateSampleNameLabel();
  });
  bindCustomSelect('fire', v => { state.fire = v; });
  bindCustomSelect('amount', v => { state.amount = v; });
  bindCustomSelect('timescale', v => { state.timeScale = parseFloat(v); });

  bindSlider('amb', v => {
    state.ambTemp = v;
    state.sampleTemp = v;
    state.bathTemp = v;
    if (state.simTime === 0) applyInitialPhase();
  }, '℃');

  document.getElementById('btn-lamp').addEventListener('click', () => {
    const on = !state.heating;
    setHeating(on);
    if (on) playIgnite(); else playExtinguish();
    if (on && !paused) startBoil();
    else stopBoil();
    updateLampUI();
  });
  document.getElementById('btn-pre-melt').addEventListener('click', () => {
    preMeltComplete();
    playClick();
    updateUI();
  });
  document.getElementById('btn-pause').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('btn-pause').textContent = paused ? '开始' : '暂停';
    if (!paused && state.heating) startBoil(); else stopBoil();
    playClick();
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    resetPhysics();
    document.getElementById('btn-pause').textContent = '开始';
    clearTable();
    redrawChart();
    playClick();
  });
  document.getElementById('btn-mute').addEventListener('click', () => {
    setSoundEnabled(!getSoundEnabled());
    document.getElementById('btn-mute').textContent = getSoundEnabled() ? '🔊' : '🔇';
    playClick();
  });

  document.getElementById('btn-freeze-quick').addEventListener('click', () => {
    if (state.meltedFrac >= 1) startFreezePhase();
    updateLampUI();
    playClick();
    updateUI();
  });

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('resize', () => { onResize(); redrawChart(); });

  document.getElementById('btn-pause').textContent = paused ? '开始' : '暂停';
}

function throttledSliderTick() {}

function bindSlider(name, setter, unit) {
  const slider = document.getElementById(name + '-slider');
  const minus = document.getElementById(name + '-minus');
  const plus = document.getElementById(name + '-plus');
  const val = document.getElementById(name + '-val');
  const step = parseFloat(slider.step);
  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    setter(v);
    val.textContent = v + unit;
    throttledSliderTick();
    updateUI();
  });
  minus.addEventListener('click', () => { slider.value = Math.max(slider.min, parseFloat(slider.value) - step); slider.dispatchEvent(new Event('input')); playClick(); });
  plus.addEventListener('click', () => { slider.value = Math.min(slider.max, parseFloat(slider.value) + step); slider.dispatchEvent(new Event('input')); playClick(); });
}

function updateLampUI() {
  const btn = document.getElementById('btn-lamp');
  btn.textContent = state.heating ? '熄灭酒精灯' : '点燃酒精灯';
  btn.classList.toggle('primary', !state.heating);
  btn.classList.toggle('warn', state.heating);
}

function updateModeUI() {
  const quick = document.getElementById('btn-freeze-quick');
  if (quick) quick.style.display = (state.meltedFrac >= 1 && state.heating) ? 'flex' : 'none';
}

function updateSampleNameLabel() {
  const el = document.getElementById('sample-name-label');
  if (el) el.textContent = (sampleDef() && sampleDef().name) || state.sample;
}

function bindCustomSelect(id, callback) {
  const select = document.getElementById(id + '-select');
  const wrap = document.getElementById(id + '-wrap');
  const trigger = wrap.querySelector('.custom-select-trigger');
  const triggerText = trigger.querySelector('.custom-select-text') || trigger;
  const options = wrap.querySelectorAll('.custom-option');

  function setValue(value) {
    select.value = value;
    const opt = wrap.querySelector('.custom-option[data-value="' + value + '"]');
    if (opt) {
      triggerText.textContent = opt.textContent;
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
    }
    callback(value);
    playClick();
  }

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = wrap.classList.contains('open');
    document.querySelectorAll('.custom-select.open').forEach(w => w.classList.remove('open'));
    if (!isOpen) wrap.classList.add('open');
  });

  options.forEach(opt => {
    opt.addEventListener('click', e => {
      e.stopPropagation();
      setValue(opt.dataset.value);
      wrap.classList.remove('open');
    });
  });

  document.addEventListener('click', e => {
    if (!wrap.contains(e.target)) wrap.classList.remove('open');
  });

  select.addEventListener('change', () => {
    setValue(select.value);
  });
}

function updateUI() {
  document.getElementById('r-sample-temp').textContent = state.sampleTemp.toFixed(1) + ' ℃';
  document.getElementById('r-water-temp').textContent = state.bathTemp.toFixed(1) + ' ℃';
  const wp = (state.bathTemp < 0) ? '固态' : (state.bathTemp >= 99.5 ? '沸腾' : '液态');
  document.getElementById('r-water-phase').textContent = wp;
  document.getElementById('r-sim-time').textContent = (state.simTime / 60).toFixed(1) + ' min';
  document.getElementById('phase-label').textContent = state.phaseName;
  updateSampleNameLabel();
  updateLampUI();
  updateModeUI();

  // 海波凝固平台结论标注
  const ann = document.getElementById('freeze-annotation');
  if (ann) {
    const def = sampleDef();
    const show = state.mode === 'freeze' && def.kind === 'crystal' && def.meltingPoint === 48 &&
                 state.meltedFrac > 0 && state.meltedFrac < 1;
    if (show && !state.freezeAnnotationShown) {
      state.freezeAnnotationShown = true;
      playFreezeDone();
    }
    ann.style.display = (show || state.freezeAnnotationShown) ? 'block' : 'none';
  }

  if (state.dataLog.length !== lastTableCount) {
    lastTableCount = state.dataLog.length;
    renderTable();
    redrawChart();
    playDrip();
  }
}

function onDataRecorded() {
  renderTable();
  redrawChart();
  playDrip();
}

function clearTable() {
  state.dataLog = [];
  state.lastRecordTime = -1;
  lastTableCount = 0;
  document.getElementById('data-tbody').innerHTML = '';
}

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

function onPointerDown(e) {
  if (!e.target.closest('#canvas-container') || e.button !== 0) return;
  ensureAudioContext();
  isRotating = true;
  rotateStart.x = e.clientX;
  rotateStart.y = e.clientY;
}

function onPointerMove(e) {
  if (!isRotating) return;
  updateCameraRotation(e.clientX - rotateStart.x, e.clientY - rotateStart.y);
  rotateStart.x = e.clientX;
  rotateStart.y = e.clientY;
}

function onPointerUp() {
  isRotating = false;
}

let pinchStartDist = 0;
function bindTouchZoom() {
  renderer.domElement.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDist = Math.hypot(dx, dy);
    }
  }, { passive: false });
  renderer.domElement.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (pinchStartDist > 0) {
        const delta = (pinchStartDist - dist) * 0.05;
        cameraState.distance = THREE.MathUtils.clamp(cameraState.distance + delta, CAM_MIN_DIST, CAM_MAX_DIST);
        applyCameraOrbit();
      }
      pinchStartDist = dist;
      e.preventDefault();
    }
  }, { passive: false });
  renderer.domElement.addEventListener('touchend', () => { pinchStartDist = 0; });
}

window.addEventListener('DOMContentLoaded', init);

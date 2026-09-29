/* exp-subl.js — 升华凝华观察站 UI 与交互 [s1] */
/* eslint-env browser */

function init() {
  state = makeInitialState();
  initScene();
  bindCameraEvents();
  bindTouchZoom();
  bindUI();
  if (window.SublimationPour) window.SublimationPour.init();
  updateUI();
  animate();
  document.getElementById('btn-pause').textContent = state.paused ? '开始' : '暂停';
}

function ensureFirstAudio() { ensureAudioContext(); }

function bindCameraEvents() {
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('resize', () => onResize());
  renderer.domElement.addEventListener('pointerdown', ensureFirstAudio, { once: true });
}

function bindUI() {
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  document.getElementById('hot-select').addEventListener('change', e => {
    state.hotTemp = parseInt(e.target.value, 10);
    playClick();
  });
  document.getElementById('iodine-select').addEventListener('change', e => {
    state.iodineAmount = e.target.value;
    state.iodineCount = IODINE_COUNTS[e.target.value];
    playClick();
    applyIodine();
  });

  document.getElementById('btn-hot').addEventListener('click', () => {
    ensureFirstAudio();
    const guess = document.getElementById('guess-card');
    if (guess && !state.guessDone) { guess.classList.add('hidden'); }
    if (window.SublimationPour) window.SublimationPour.playPour('hot');
  });
  document.getElementById('btn-cold').addEventListener('click', () => {
    ensureFirstAudio();
    const guess = document.getElementById('guess-card');
    if (guess && !state.guessDone) { guess.classList.add('hidden'); }
    if (window.SublimationPour) window.SublimationPour.playPour('cold');
  });

  document.querySelectorAll('.guess-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      document.querySelectorAll('.guess-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.guess-q').forEach(q => {
        q.classList.toggle('active', q.dataset.q === target && q.dataset.step === btn.dataset.step);
      });
      playClick();
    });
  });
  document.getElementById('guess-reveal').addEventListener('click', () => {
    document.getElementById('guess-card').classList.add('hidden');
    state.guessDone = true;
    playClick();
  });

  document.getElementById('btn-pause').addEventListener('click', () => {
    state.paused = !state.paused;
    document.getElementById('btn-pause').textContent = state.paused ? '开始' : '暂停';
    playClick();
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    resetScene();
    if (window.SublimationPour) window.SublimationPour.reset();
    document.getElementById('btn-pause').textContent = '暂停';
    playClick();
  });
  document.getElementById('btn-mute').addEventListener('click', () => {
    setSoundEnabled(!getSoundEnabled());
    document.getElementById('btn-mute').textContent = getSoundEnabled() ? '🔊' : '🔇';
    playClick();
  });
  document.getElementById('btn-fullscreen').addEventListener('click', () => {
    const el = document.getElementById('app');
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen();
  });
  document.addEventListener('fullscreenchange', () => {
    document.getElementById('btn-fullscreen').textContent = document.fullscreenElement ? '⛶ 退出全屏' : '⛶ 全屏';
  });
}

function switchMode(mode) {
  if (mode === state.mode) return;
  state.mode = mode;
  playModeSwitch();
  document.querySelectorAll('.mode-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  document.getElementById('iodine-panel').style.display = mode === 'iodine' ? 'block' : 'none';
  const g = document.getElementById('guess-card');
  if (g) g.classList.toggle('hidden', mode !== 'iodine' || state.guessDone);
  if (window.SublimationPour) window.SublimationPour.setMode(mode);
}

function updateUI() {
  if (state.mode !== 'iodine') return;
  document.getElementById('r-vapor').textContent = (state.vapor * 100).toFixed(0) + '%';
  document.getElementById('r-iodine').textContent = (state.iodineLeft * 100).toFixed(0) + '%';
  const chip = document.getElementById('r-phase');
  chip.textContent = state.phase === 'sublimate' ? '升华中' : state.phase === 'deposit' ? '凝华中' : '静止';
  const arrow = document.getElementById('heat-arrow');
  arrow.classList.toggle('show', state.phase === 'sublimate');
  const cargor = document.getElementById('cool-arrow');
  cargor.classList.toggle('show', state.phase === 'deposit');
  if (state.phase === 'sublimate' && !state.sublimAnnounced && state.vapor > 0.35) {
    state.sublimAnnounced = true;
    showDefinition('sublimation');
  }
  if (state.phase === 'deposit' && !state.depositAnnounced && state.wallCrystal > 0.25) {
    state.depositAnnounced = true;
    showDefinition('deposition');
  }
}

function showDefinition(kind) {
  const card = document.getElementById('def-card');
  const title = document.getElementById('def-title');
  const en = document.getElementById('def-en');
  const body = document.getElementById('def-body');
  if (kind === 'sublimation') {
    title.textContent = '升华';
    en.textContent = 'sublimation';
    body.innerHTML = '物质从<b>固态</b>直接变成<b>气态</b>的过程 · <b>吸热</b>';
  } else {
    title.textContent = '凝华';
    en.textContent = 'deposition';
    body.innerHTML = '物质从<b>气态</b>直接变成<b>固态</b>的过程 · <b>放热</b>';
  }
  card.classList.add('show');
  setTimeout(() => card.classList.remove('show'), 5000);
}

let isRotating = false, rotateStart = { x: 0, y: 0 };
function onPointerDown(e) {
  if (!e.target.closest('#canvas-container') || e.button !== 0) return;
  isRotating = true; rotateStart.x = e.clientX; rotateStart.y = e.clientY;
}
function onPointerMove(e) {
  if (window.SublimationPour && (window.SublimationPour.state.isDragging || window.SublimationPour.state.animating)) return;
  if (!isRotating) return;
  const dx = e.clientX - rotateStart.x, dy = e.clientY - rotateStart.y;
  updateCameraRotation(dx, dy);
  rotateStart.x = e.clientX; rotateStart.y = e.clientY;
}
function onPointerUp() { isRotating = false; }

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
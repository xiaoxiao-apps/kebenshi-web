// exp-liquefy.js — 阶段三 液化探究 DOM + 单实验状态机
// 职责：tab③ 按钮启用、液化面板按钮交互、数据面板更新
// 依赖：exp-liquefy-core.js 提供的 buildLiquefyScene/updateLiquefy/resetLiquefy/setLiquefyGroupVisible

let lqBuilt = false;

function ensureLiquefyState() {
  if (!state.liquefy) {
    state.liquefy = { waterTemp: 25, steamState: '无', collectedPct: 0 };
  }
}

function updateLiquefyUI() {
  const lq = state.liquefy || {};
  const tempEl = document.getElementById('lq-water-temp');
  const steamEl = document.getElementById('lq-steam-state');
  const collectedEl = document.getElementById('lq-collected');
  if (tempEl) tempEl.textContent = (lq.waterTemp != null ? lq.waterTemp : state.waterTemp).toFixed(1) + ' ℃';
  if (steamEl) steamEl.textContent = lq.steamState || '无';
  if (collectedEl) collectedEl.textContent = (lq.collectedPct || 0).toFixed(0) + '%';

  const lampBtn = document.getElementById('lq-lamp-btn');
  if (lampBtn) {
    lampBtn.textContent = state.heating ? '熄灭酒精灯' : '点燃酒精灯';
    lampBtn.classList.toggle('primary', !state.heating);
    lampBtn.classList.toggle('warn', state.heating);
  }
}

function initLiquefyDom() {
  if (lqBuilt) return;
  lqBuilt = true;
  ensureLiquefyState();
  if (typeof buildLiquefyScene === 'function') buildLiquefyScene();

  const lampBtn = document.getElementById('lq-lamp-btn');
  const resetBtn = document.getElementById('lq-reset-btn');

  if (lampBtn) {
    lampBtn.addEventListener('click', () => {
      state.heating = !state.heating;
      if (typeof updateFlame === 'function') updateFlame();
      const mainBtn = document.getElementById('btn-lamp');
      if (mainBtn) {
        mainBtn.textContent = state.heating ? '熄灭酒精灯' : '点燃酒精灯';
        mainBtn.classList.toggle('primary', !state.heating);
        mainBtn.classList.toggle('warn', state.heating);
      }
      if (state.heating) { if (typeof playIgnite === 'function') playIgnite(); }
      else { if (typeof playClick === 'function') playClick(); }
      updateLiquefyUI();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ensureLiquefyState();
      state.heating = false;
      if (typeof updateFlame === 'function') updateFlame();
      if (typeof resetLiquefy === 'function') resetLiquefy();
      if (typeof resetAll === 'function') resetAll();
      const mainBtn = document.getElementById('btn-lamp');
      if (mainBtn) {
        mainBtn.textContent = '点燃酒精灯';
        mainBtn.classList.add('primary');
        mainBtn.classList.remove('warn');
      }
      if (typeof playClick === 'function') playClick();
      updateLiquefyUI();
    });
  }
}

// 主循环挂载：借道 updateEvapScene 之后调用 updateLiquefy
(function hookLiquefyUpdate() {
  const orig = window.updateEvapScene;
  window.updateEvapScene = function(dt) {
    if (typeof orig === 'function') orig(dt);
    if (state && state.mode === 'liquefy') {
      if (typeof updateLiquefy === 'function') updateLiquefy(dt);
      updateLiquefyUI();
    }
  };
}());

// 防御：修复从④切回③时 gallery-panel 未隐藏的泄漏（exp-vapor.js 已冻结，故在 liquefy 侧打补丁）
(function patchGalleryPanelVisibility() {
  const orig = window.switchMode;
  if (typeof orig !== 'function' || orig.__lqPatched) return;
  window.switchMode = function(mode) {
    const result = orig.apply(this, arguments);
    const galleryPanel = document.getElementById('gallery-panel');
    if (galleryPanel) galleryPanel.style.display = (mode === 'gallery') ? 'block' : 'none';
    return result;
  };
  window.switchMode.__lqPatched = true;
}());

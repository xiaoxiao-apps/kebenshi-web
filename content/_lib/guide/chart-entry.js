/* chart-entry.js — 共享曲线浮钮/浮层 + canvas托盘器材标签组件（蔡总 2026-11-02 移动端全量铺·单2b）
   门控 = (pointer:coarse) and (hover:none)：触摸门内生效；桌面（pointer:fine）MQ 不匹配 → engage 从不执行、DOM 零改动。

   API 1  ChartEntry.attach({getChartEl, title, redraw?, getHiddenEls?})
     触摸门内生成 #tt-entry 📈浮钮（右缘半藏露60%，点按先 .full 全显再开浮层，浮层关回半藏）
     + .tt-overlay 浮层（遮罩+×+点遮罩关；开时把 getChartEl() 宿主移入 .tt-overlay-card 并重绘一次，关时移回原位）。
     redraw 缺省 = 派发 window resize；getHiddenEls 返回的元素 engage 时 display:none、disengage 还原。
     样式在 chart-entry.css（c3s2/c3s3 页内原 CSS 规则保留，双份同值零漂移）。

   API 2  ChartEntry.tray({label, setOpen, isBlankHit, redraw, initialOpen?})
     canvas 托盘页左缘竖标签（.ce-tray-tab 30×96 left:0，单6b 初始 top=26%vh；拖拽记忆优先）：
     点标签 = 展开托盘(setOpen(true)+重绘+标签隐藏)；托盘展开时点标签外空白(isBlankHit(e)===true) = 收回
     (setOpen(false)+重绘+标签复现)。器材拖拽命中逻辑由各页 core.js 自理，本组件不碰 canvas。
     initialOpen（单10b③）= 触摸门 engage 初始即展开（页声明）；缺省 = 收起（原语义）。
     非触摸门：标签从不生成，托盘常绘（trayOpen 由页内门控初始化决定）。

   API 3  ChartEntry.traySetVisible(bool)（单10b② 托盘标签场景化）
     场景切换处由页 core.js 调用，按"本场景托盘有无货"开关竖标签：
     false = 标签 display:none 且托盘强制收起(setOpen(false)+重绘)；true = 标签复现(原 top 记忆)。
     engage 默认按最近一次 setVisible 值（未调用 = true 兼容现状）。非触摸门仅记值：桌面零介入逐字节。 */
(function () {
  var touchMQ = window.matchMedia ? window.matchMedia('(pointer:coarse) and (hover:none)') : null;

  function click() { if (typeof playClick === 'function') playClick(); }

  /* 单4b：竖标签可上下拖——pointerdown 记起点，位移≥6px 进拖动态改 top 并抑制点击；
     <6px 松手=点击原语义。top clamp 屏高 8%~80%；拖毕位置会话内保持（trayTabTop 记忆）。 */
  var trayTabTop = null;
  var DRAG_TH = 6;
  function clampTabTop(top) {
    var vh = window.innerHeight || 360;
    return Math.max(vh * 0.08, Math.min(vh * 0.80, top));
  }
  function makeTabDraggable(tab) {
    if (trayTabTop != null) tab.style.top = clampTabTop(trayTabTop) + 'px';
    var startY = 0, startTop = 0, holding = false, moved = false;
    tab.addEventListener('pointerdown', function (e) {
      holding = true; moved = false;
      startY = e.clientY;
      startTop = tab.getBoundingClientRect().top;
      tab.setPointerCapture(e.pointerId);
    });
    tab.addEventListener('pointermove', function (e) {
      if (!holding) return;
      var dy = e.clientY - startY;
      if (!moved && Math.abs(dy) < DRAG_TH) return;
      moved = true;
      var top = clampTabTop(startTop + dy);
      tab.style.top = top + 'px';
      trayTabTop = top;
      e.preventDefault();
    });
    tab.addEventListener('pointerup', function () { holding = false; });
    tab.addEventListener('pointercancel', function () { holding = false; moved = false; });
    tab.addEventListener('click', function (e) {
      if (moved) { moved = false; e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);
  }

  /* ================= API 1：曲线浮钮/浮层 ================= */
  var chartCfg = null;
  var cEngaged = false;
  var entry = null, overlay = null, host = null, originParent = null, originNext = null;
  var hiddenEls = [];

  function cRedraw() {
    if (chartCfg && typeof chartCfg.redraw === 'function') chartCfg.redraw();
    else window.dispatchEvent(new Event('resize'));
  }
  function openOverlay() {
    if (overlay || !chartCfg) return;
    host = typeof chartCfg.getChartEl === 'function' ? chartCfg.getChartEl() : null;
    if (!host) return;
    originParent = host.parentNode;
    originNext = host.nextSibling;
    overlay = document.createElement('div');
    overlay.className = 'tt-overlay';
    var card = document.createElement('div');
    card.className = 'tt-overlay-card';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'tt-overlay-close';
    close.textContent = '×';
    close.setAttribute('aria-label', '关闭' + (chartCfg.title || '曲线'));
    close.addEventListener('click', function () { closeOverlay(); click(); });
    card.appendChild(close);
    host.classList.add('tt-in-card');
    card.appendChild(host);
    overlay.appendChild(card);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeOverlay(); });
    document.body.appendChild(overlay);
    requestAnimationFrame(cRedraw);
  }
  function closeOverlay() {
    if (!overlay) return;
    if (host && originParent) originParent.insertBefore(host, originNext || null);
    if (host) host.classList.remove('tt-in-card');
    overlay.remove();
    overlay = null; host = null; originParent = null; originNext = null;
    if (entry) entry.classList.remove('full'); /* D 浮层关→浮钮回右缘半藏 */
    requestAnimationFrame(cRedraw);
  }
  function buildEntry() {
    entry = document.createElement('button');
    entry.type = 'button';
    entry.id = 'tt-entry';
    entry.textContent = '📈';
    entry.setAttribute('aria-label', '放大查看' + ((chartCfg && chartCfg.title) || '曲线'));
    entry.addEventListener('click', function () { entry.classList.add('full'); openOverlay(); click(); });
    document.body.appendChild(entry);
  }
  function applyHidden(hide) {
    var els = (chartCfg && typeof chartCfg.getHiddenEls === 'function') ? (chartCfg.getHiddenEls() || []) : [];
    if (hide) {
      hiddenEls = els;
      hiddenEls.forEach(function (el) { el.__cePrev = el.style.display; el.style.display = 'none'; });
    } else {
      hiddenEls.forEach(function (el) { el.style.display = el.__cePrev || ''; delete el.__cePrev; });
      hiddenEls = [];
    }
  }
  function cEngage() {
    if (cEngaged || !chartCfg) return;
    cEngaged = true;
    buildEntry();
    applyHidden(true);
  }
  function cDisengage() {
    if (!cEngaged) return;
    cEngaged = false;
    closeOverlay();
    applyHidden(false);
    if (entry) { entry.remove(); entry = null; }
  }

  /* ================= API 2：canvas 托盘器材标签 ================= */
  var trayCfg = null;
  var tEngaged = false;
  var trayTab = null;
  var trayVisible = true;   /* 单10b②：场景化标签开关（false=本场景托盘无货：标签隐藏+托盘强制收起） */

  function trayOpenNow() { return !!(trayCfg && trayCfg.setOpen && trayCfg.__open); }
  function tabShowNow() { return trayVisible && !trayOpenNow(); }   /* 单10b②：无货场景标签不复现 */
  function setTray(open) {
    if (!trayCfg) return;
    trayCfg.__open = open;
    trayCfg.setOpen(open);
    if (trayTab) trayTab.style.display = tabShowNow() ? '' : 'none';
    if (typeof trayCfg.redraw === 'function') trayCfg.redraw();
  }
  function onTrayDocDown(e) {
    var t = e.target;
    if (t && t.closest && t.closest('.ce-tray-tab')) return;
    if (!trayOpenNow()) return;
    if (typeof trayCfg.isBlankHit === 'function' && !trayCfg.isBlankHit(e)) return;
    setTray(false);
    click();
  }
  function buildTrayTab() {
    trayTab = document.createElement('button');
    trayTab.type = 'button';
    trayTab.className = 'ce-tray-tab';
    trayTab.textContent = (trayCfg && trayCfg.label) || '器材';
    trayTab.setAttribute('aria-label', '展开' + ((trayCfg && trayCfg.label) || '器材') + '托盘');
    makeTabDraggable(trayTab); /* 单4b：先注册拖拽(含点击抑制)，再注册开托盘 */
    trayTab.addEventListener('click', function () { setTray(true); click(); });
    document.body.appendChild(trayTab);
    /* 初始同步：标签可见 = 场景有货且托盘收起（单10b②/③） */
    trayTab.style.display = tabShowNow() ? '' : 'none';
  }
  function tEngage() {
    if (tEngaged || !trayCfg) return;
    tEngaged = true;
    var open0 = !!trayCfg.initialOpen;   /* 单10b③：页声明触摸门初始展开；缺省收起（原语义） */
    trayCfg.__open = open0;
    trayCfg.setOpen(open0);
    if (typeof trayCfg.redraw === 'function') trayCfg.redraw();
    buildTrayTab();
    document.addEventListener('pointerdown', onTrayDocDown);
  }
  function tDisengage() {
    if (!tEngaged) return;
    tEngaged = false;
    document.removeEventListener('pointerdown', onTrayDocDown);
    if (trayTab) { trayTab.remove(); trayTab = null; }
    trayCfg.__open = true;
    trayCfg.setOpen(true); /* 非触摸门托盘常绘 */
    if (typeof trayCfg.redraw === 'function') trayCfg.redraw();
  }

  /* ================= 门控同步 ================= */
  function sync() {
    if (touchMQ.matches) { cEngage(); tEngage(); }
    else { cDisengage(); tDisengage(); }
  }
  function init() {
    sync();
    if (touchMQ.addEventListener) touchMQ.addEventListener('change', sync);
    else if (touchMQ.addListener) touchMQ.addListener(sync);
  }
  function schedule() {
    if (!touchMQ) return;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }

  window.ChartEntry = {
    attach: function (opts) { chartCfg = opts || null; schedule(); },
    tray: function (opts) {
      trayCfg = opts || null;
      if (trayCfg) trayCfg.__open = true; /* 未 engage（含桌面）视为常开 */
      schedule();
    },
    traySetVisible: function (v) {
      trayVisible = !!v;
      if (!tEngaged || !trayCfg) return;   /* 单10b②：非触摸门仅记值（engage 时生效），桌面零介入 */
      if (!trayVisible) setTray(false);    /* 无货：标签隐藏+托盘强制收起+重绘 */
      else if (trayTab) trayTab.style.display = tabShowNow() ? '' : 'none';   /* 有货：标签复现(原 top 记忆)/展开态仍隐 */
    }
  };
})();

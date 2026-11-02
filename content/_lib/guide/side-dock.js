/* side-dock.js — 共享侧边浮层组件（蔡总 2026-11-02 移动端全量铺·单2a）
   自动接管容器：.control-panel, .data-panel, [data-sidedock]。
   门控 = (pointer:coarse) and (hover:none)：触摸门内把容器转 fixed 侧浮层默认收起(.collapsed)离屏，
   左右缘追加 30×96 竖标签(.panel-tab)唤出，标题追加 ×(.panel-collapse)收起，点标签/面板外空白自动收回，
   首进指路气泡(localStorage 'qd-narrow-hint' 记一次，6 秒自消或点消)。
   侧别：data-sidedock="left|right" 优先，否则 .data-panel→right，其余→left。
   标签文字：data-sidedock-label 优先，否则容器 .panel-title 首2字，否则按侧默认(参数/读数)。
   气泡文字：data-sidedock-hint 优先（整条），否则「①/②… 点「标签」展开」；若页内存在 #tt-entry(曲线浮钮)追加末条。
   非触摸门：engage 从不执行、DOM 零改动 = 容器原布局原样。 */
(function () {
  var touchMQ = window.matchMedia ? window.matchMedia('(pointer:coarse) and (hover:none)') : null;
  if (!touchMQ) return;
  var HINT_KEY = 'qd-narrow-hint';
  var SEL = '.control-panel, .data-panel, [data-sidedock]';
  var NUMS = ['①', '②', '③', '④', '⑤', '⑥'];
  var engaged = false;
  var pairs = [];         /* {el, tab, side, label} 按文档序 */
  var collapseBtns = [];

  function click() { if (typeof playClick === 'function') playClick(); }

  /* 单4b：竖标签可上下拖——pointerdown 记起点，位移≥6px 进拖动态改 top 并抑制点击；
     <6px 松手=点击原语义。top clamp 屏高 8%~80%；拖毕位置会话内保持（tabTops 记忆，重建时恢复）。 */
  var tabTops = {};
  var DRAG_TH = 6;
  function clampTabTop(top) {
    var vh = window.innerHeight || 360;
    return Math.max(vh * 0.08, Math.min(vh * 0.80, top));
  }
  function makeTabDraggable(tab, key) {
    if (tabTops[key] != null) tab.style.top = clampTabTop(tabTops[key]) + 'px';
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
      tabTops[key] = top;
      e.preventDefault();
    });
    tab.addEventListener('pointerup', function () { holding = false; });
    tab.addEventListener('pointercancel', function () { holding = false; moved = false; });
    tab.addEventListener('click', function (e) {
      if (moved) { moved = false; e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);
  }

  function resolveSide(el) {
    var v = (el.getAttribute('data-sidedock') || '').trim().toLowerCase();
    if (v === 'left' || v === 'right') return v;
    if (el.classList.contains('data-panel')) return 'right';
    return 'left';
  }
  function resolveLabel(el, side) {
    var lab = el.getAttribute('data-sidedock-label');
    if (lab) return lab.trim().slice(0, 2);
    var t = el.querySelector('.panel-title');
    if (t && t.textContent) return t.textContent.trim().slice(0, 2);
    return side === 'right' ? '读数' : '参数';
  }

  function buildPanels() {
    var nodes = document.querySelectorAll(SEL);
    Array.prototype.forEach.call(nodes, function (el) {
      var side = resolveSide(el);
      var label = resolveLabel(el, side);
      el.classList.add('sd-dock', side === 'right' ? 'sd-right' : 'sd-left', 'collapsed');

      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'panel-tab tab-' + side;
      tab.textContent = label;
      tab.setAttribute('aria-label', '展开' + label + '面板');
      makeTabDraggable(tab, 'sd:' + side + ':' + label); /* 单4b：先注册拖拽(含点击抑制)，再注册开面板 */
      tab.addEventListener('click', function () {
        el.classList.remove('collapsed');
        tab.style.display = 'none';
        click();
      });
      document.body.appendChild(tab);

      var title = el.querySelector('.panel-title');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'panel-collapse';
      btn.textContent = '×';
      btn.setAttribute('aria-label', '收起' + label + '面板');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        el.classList.add('collapsed');
        tab.style.display = '';
        click();
      });
      (title || el).appendChild(btn);
      collapseBtns.push(btn);

      pairs.push({ el: el, tab: tab, side: side, label: label });
    });
  }

  /* 点外收回：pointerdown 落在受管面板/竖标签/曲线浮层之外 → 展开的面板自动 .collapsed（× 收起钮保留） */
  function onDocDown(e) {
    var t = e.target;
    if (t && t.closest && t.closest('.sd-dock, .panel-tab, .tt-overlay')) return;
    pairs.forEach(function (pr) {
      if (!pr.el.classList.contains('collapsed')) {
        pr.el.classList.add('collapsed');
        pr.tab.style.display = '';
      }
    });
  }

  /* 首进指路气泡：面板标签逐条 + 若页内有 #tt-entry(📈曲线浮钮) 追加末条；localStorage 记一次 */
  function showHints() {
    var seen = null;
    try { seen = window.localStorage.getItem(HINT_KEY); } catch (_) {}
    if (seen) return;
    try { window.localStorage.setItem(HINT_KEY, '1'); } catch (_) {}
    var bubbles = [];
    function bubble(text, style) {
      var b = document.createElement('div');
      b.className = 'qd-hint-bubble';
      b.textContent = text;
      b.style.cssText = style;
      document.body.appendChild(b);
      bubbles.push(b);
    }
    var vw = window.innerWidth, vh = window.innerHeight;
    var i = 0;
    pairs.forEach(function (pr) {
      var r = pr.tab.getBoundingClientRect();
      var custom = pr.el.getAttribute('data-sidedock-hint');
      var text = custom || ((NUMS[i] || '') + ' 点「' + pr.label + '」展开').trim();
      if (pr.side === 'right') bubble(text, 'right:' + (vw - r.left + 6) + 'px;top:' + (r.top + 8) + 'px;');
      else bubble(text, 'left:' + (r.right + 6) + 'px;top:' + (r.top + 8) + 'px;');
      i++;
    });
    var entry = document.getElementById('tt-entry');
    if (entry) {
      var er = entry.getBoundingClientRect();
      bubble((NUMS[i] || '③') + ' 点这里放大温度曲线', 'right:' + (vw - er.left + 6) + 'px;bottom:' + (vh - er.top + 6) + 'px;');
    }
    function clear() {
      clearTimeout(timer);
      bubbles.forEach(function (b) { b.remove(); });
      document.removeEventListener('pointerdown', clear);
    }
    var timer = setTimeout(clear, 6000);
    document.addEventListener('pointerdown', clear);
  }

  function engage() {
    if (engaged) return;
    engaged = true;
    buildPanels();
    document.addEventListener('pointerdown', onDocDown);
    requestAnimationFrame(showHints);
  }
  function disengage() {
    if (!engaged) return;
    engaged = false;
    document.removeEventListener('pointerdown', onDocDown);
    pairs.forEach(function (pr) {
      pr.tab.remove();
      pr.el.classList.remove('collapsed', 'sd-dock', 'sd-left', 'sd-right');
    });
    pairs = [];
    collapseBtns.forEach(function (b) { b.remove(); });
    collapseBtns = [];
    var bubbles = document.querySelectorAll('.qd-hint-bubble');
    Array.prototype.forEach.call(bubbles, function (b) { b.remove(); });
  }
  function sync() { if (touchMQ.matches) engage(); else disengage(); }
  function init() {
    sync();
    if (touchMQ.addEventListener) touchMQ.addEventListener('change', sync);
    else if (touchMQ.addListener) touchMQ.addListener(sync);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

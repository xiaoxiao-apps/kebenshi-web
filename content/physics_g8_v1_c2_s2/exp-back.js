(function() {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    var params = new URLSearchParams(window.location.search);
    var from = params.get('from');
    var tab = params.get('tab');
    var hasFromParam = (from === 'explain' || from === 'quiz');
    if (!hasFromParam) {
      /* 无 from 参数时按来源页兜底：从讲解页/练习页点进来的，从哪来回哪去 */
      from = '';
      var m = (document.referrer || '').match(/\/(explain|quiz)\.html(?:\?[^#]*)?(?:#(t[1-4]))?$/);
      if (m) { from = m[1]; if (!tab && m[2]) tab = m[2]; }
      if (!from) return;
    }

    /* 将 from/tab 透传给实验区导航卡片，使 exp 页能识别来源 */
    if (hasFromParam) {
      var cards = document.querySelectorAll('a.nav-card');
      for (var j = 0; j < cards.length; j++) {
        var card = cards[j];
        var base = card.getAttribute('href') || '';
        if (!base || /^javascript:/i.test(base)) continue;
        var sep = base.indexOf('?') === -1 ? '?' : '&';
        card.setAttribute('href', base + sep + 'from=' + encodeURIComponent(from) + (tab ? '&tab=' + encodeURIComponent(tab) : ''));
      }
    }

    var href, btnText;
    if (from === 'explain') {
      /* 返回来源 Tab：URL tab 参数优先，其次本节 explain 页记录的当前 Tab（键名随目录推导，如 c2s1_explain_tab） */
      if (!tab || !/^t[1-4]$/.test(tab)) {
        tab = '';
        var seg = (window.location.pathname.match(/_(c\d+)_(s\d+)/) || []).slice(1).join('');
        if (seg) { try { tab = sessionStorage.getItem(seg + '_explain_tab') || ''; } catch (e) { tab = ''; } }
      }
      href = tab ? 'explain.html#' + tab : 'explain.html';
      btnText = '📖 返回知识讲解';
    } else {
      href = 'quiz.html';
      btnText = '‹ 返回随堂练习';
    }

    /* 改写页面原有返回钮（非壳环境可见可用；壳环境会被 HIDE_BACK_CSS 隐藏） */
    var backs = document.querySelectorAll('a[data-back]');
    for (var i = 0; i < backs.length; i++) {
      var el = backs[i];
      el.setAttribute('href', href);
      if (/back-btn/.test(el.className)) {
        el.innerHTML = from === 'explain' ? '‹ 返回知识讲解' : btnText;
      } else {
        el.innerHTML = el.innerHTML.replace(/返回实验区/, btnText);
      }
    }

    /* 壳环境浮动返回钮：总站壳注入的 HIDE_BACK_CSS 按旧类名/data 属性/id 选择器隐藏页内返回钮，
       下面的类名与 id 均不在其命中范围内，讲解页带 ?from=explain 跳来时保证有路可回 */
    if (hasFromParam && from === 'explain' && !document.getElementById('qd-exp-back-float')) {
      var fab = document.createElement('button');
      fab.id = 'qd-exp-back-float';
      fab.className = 'qd-exp-back-float';
      fab.type = 'button';
      fab.textContent = '📖 返回知识讲解';
      fab.setAttribute('aria-label', '返回知识讲解');
      fab.style.cssText = 'position:fixed;top:10px;left:10px;z-index:2147483000;' +
        'min-height:44px;padding:10px 16px;border:none;border-radius:22px;cursor:pointer;' +
        'background:rgba(28,28,32,.82);color:#fff;font-size:14px;font-weight:700;line-height:1.2;' +
        'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 2px 10px rgba(0,0,0,.35);';
      fab.addEventListener('click', function () { window.location.href = href; });
      var mount = function () { (document.body || document.documentElement).appendChild(fab); };
      if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) console.warn('exp-back error', e);
  }
})();

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

    var href, text;
    if (from === 'explain') {
      /* 返回来源 Tab：URL tab 参数优先，其次 explain 页记录的当前 Tab */
      if (!tab || !/^t[1-4]$/.test(tab)) {
        try { tab = sessionStorage.getItem('c2s4_explain_tab') || 't1'; } catch (e) { tab = 't1'; }
      }
      href = 'explain.html#' + tab;
      text = '‹ 返回知识讲解';
    } else {
      href = 'quiz.html';
      text = '‹ 返回随堂练习';
    }

    var backs = document.querySelectorAll('a[data-back]');
    for (var i = 0; i < backs.length; i++) {
      var el = backs[i];
      el.setAttribute('href', href);
      if (/back-btn/.test(el.className)) {
        el.innerHTML = text;
      } else {
        el.innerHTML = el.innerHTML.replace(/返回实验区/, text);
      }
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) console.warn('exp-back error', e);
  }
})();

(function() {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    var params = new URLSearchParams(window.location.search);
    var from = params.get('from');
    if (from !== 'explain' && from !== 'quiz') return;

    var href, text;
    if (from === 'explain') {
      /* 返回来源 Tab：URL tab 参数优先，其次 explain 页记录的当前 Tab */
      var tab = params.get('tab');
      if (!tab || !/^t[1-4]$/.test(tab)) {
        try { tab = sessionStorage.getItem('c2s1_explain_tab') || 't1'; } catch (e) { tab = 't1'; }
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

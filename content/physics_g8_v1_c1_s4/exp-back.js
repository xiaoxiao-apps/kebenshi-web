(function() {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    var params = new URLSearchParams(window.location.search);
    if (params.get('from') !== 'explain') return;

    var backs = document.querySelectorAll('a[data-back]');
    for (var i = 0; i < backs.length; i++) {
      var el = backs[i];
      el.setAttribute('href', 'explain.html');
      var html = el.innerHTML;
      if (/back-btn/.test(el.className)) {
        el.innerHTML = '‹ 返回知识讲解';
      } else {
        el.innerHTML = html.replace(/返回实验区/, '📖 返回知识讲解');
      }
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) console.warn('exp-back error', e);
  }
})();

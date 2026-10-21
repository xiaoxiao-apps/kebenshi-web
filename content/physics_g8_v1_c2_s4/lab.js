/* lab.js — 噪声实验室整合壳：模式切换（iframe 常驻懒加载）+ 头部降噪注入 */
(function () {
  'use strict';

  var SUBTITLES = {
    wave: '看波形对比：乐音的波形有规则，噪声的波形杂乱无章。',
    decibel: '声音越强，人对声音的感觉越响，用分贝（dB）表示声音强弱的等级。',
    control: '防止噪声产生、阻断噪声传播、防止噪声进入耳朵——控制噪声的三条途径。'
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.mode-tab'));
  var frames = Array.prototype.slice.call(document.querySelectorAll('.mode-frame'));
  var subtitleEl = document.getElementById('mode-subtitle');

  /* 原页面头部降噪：只注入 CSS，不改原文件。
     选择器依据原页面实际结构：三个 exp 页均为 a.back-btn[data-back]（‹ 返回实验区）、.page-header（padding 24px 0 8px 约减半） */
  var QUIET_CSS =
    'a.back-btn[data-back]{display:none !important;}' +
    '.page-header{padding:12px 0 4px !important;}';

  function injectQuietCss(frame) {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.head) return;
      if (doc.getElementById('noise-lab-quiet')) return;
      var style = doc.createElement('style');
      style.id = 'noise-lab-quiet';
      style.textContent = QUIET_CSS;
      doc.head.appendChild(style);
    } catch (e) {
      /* 注入失败保持原样 */
      if (window.console && console.warn) console.warn('quiet-css inject failed:', frame.dataset.mode, e);
    }
  }

  function activate(mode) {
    tabs.forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    frames.forEach(function (frame) {
      var on = frame.dataset.mode === mode;
      frame.classList.toggle('active', on);
      if (on && !frame.src) {
        frame.addEventListener('load', function () { injectQuietCss(frame); });
        frame.src = frame.dataset.src; /* 首次激活才赋 src，之后常驻不重载 */
      }
    });
    subtitleEl.textContent = SUBTITLES[mode] || '';
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { activate(tab.dataset.mode); });
  });
  activate('wave'); /* 初始模式 */
})();

/* lab.js — 测速实验室整合壳：模式切换（iframe 常驻懒加载）+ 头部降噪注入 */
(function () {
  'use strict';

  var SUBTITLES = {
    slope: '按下面 5 步完成实验，体会“测路程、测时间、再求平均速度”。',
    sensor: '用超声波“发射—反射—接收”测距离，再用连续两次测距算运动速度。'
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.mode-tab'));
  var frames = Array.prototype.slice.call(document.querySelectorAll('.mode-frame'));
  var subtitleEl = document.getElementById('mode-subtitle');

  /* 原页面头部降噪：只注入 CSS，不改原文件。
     选择器依据本节两页实际结构逐页核实：
     exp-slope.html  → a.back-btn#backLink（‹ 返回实验区）
     exp-sensor.html → a.back-btn#backBtn（‹ 返回探索区，JS 还会按 referrer 改文案）
     两页返回按钮均为 a.back-btn，统一隐藏；.page-header 原 padding 24px 0 8px 约减半 */
  var QUIET_CSS =
    'a.back-btn#backLink,a.back-btn#backBtn{display:none !important;}' +
    '.page-header{padding:12px 0 4px !important;}';

  function injectQuietCss(frame) {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.head) return;
      if (doc.getElementById('exp-lab-quiet')) return;
      var style = doc.createElement('style');
      style.id = 'exp-lab-quiet';
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
  activate('slope'); /* 初始模式 */
})();

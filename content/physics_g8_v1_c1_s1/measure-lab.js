/* measure-lab.js — 测量工坊整合壳：模式切换（iframe 常驻懒加载）+ 头部降噪注入 + 壳全屏 */
(function () {
  'use strict';

  var SUBTITLES = {
    warmup: '感觉总是可靠吗？先看图判断，再用“尺”验证。',
    ruler: '用刻度尺测铅笔长度，注意估读到分度值的下一位。',
    stopwatch: '点画面里的“出题”按钮给停表设定读数，再写下你的答案。',
    estimate: '用身体尺和生活经验快速估测长度和时间。',
    task: '动手记录数据，多次测量求平均，理解误差概念。'
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.mode-tab'));
  var frames = Array.prototype.slice.call(document.querySelectorAll('.mode-frame'));
  var subtitleEl = document.getElementById('mode-subtitle');

  /* 原页面头部降噪：只注入 CSS，不改原文件。
     选择器依据原页面实际结构：a.back-btn[data-back]（返回实验区）、.page-header（padding 24px 0 8px 约减半） */
  var QUIET_CSS =
    'a.back-btn[data-back]{display:none !important;}' +
    '.page-header{padding:12px 0 4px !important;}';

  function injectQuietCss(frame) {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.head) return;
      if (doc.getElementById('measure-lab-quiet')) return;
      var style = doc.createElement('style');
      style.id = 'measure-lab-quiet';
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

  /* 壳全屏：独立实现，不依赖 fullscreen.js */
  var fsBtn = document.getElementById('shell-fullscreen');
  fsBtn.addEventListener('click', function () {
    var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (fsEl) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else {
      var el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }
  });
  document.addEventListener('fullscreenchange', syncFsIcon);
  document.addEventListener('webkitfullscreenchange', syncFsIcon);
  function syncFsIcon() {
    var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    fsBtn.textContent = fsEl ? '🗗' : '⛶';
  }

  activate('warmup'); /* 初始模式 */
})();

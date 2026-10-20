/* lab.js — 隔音房间实验室整合壳：单模式（iframe 常驻懒加载）+ 头部降噪注入 + 壳全屏 */
(function () {
  'use strict';

  var SUBTITLES = {
    room: '用鞋盒充当“房间”，给内壁贴材料，测处理前后的分贝差，评估隔音性能。'
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.mode-tab'));
  var frames = Array.prototype.slice.call(document.querySelectorAll('.mode-frame'));
  var subtitleEl = document.getElementById('mode-subtitle');

  /* 原页面头部降噪：只注入 CSS，不改原文件。
     选择器依据 exp-room.html 实际结构：a.back-btn[data-back]（文案「‹ 返回实验区」，由 exp-back.js 可能改写）、
     .page-header（common.css 中 padding:24px 0 8px，约减半） */
  var QUIET_CSS =
    'a.back-btn[data-back]{display:none !important;}' +
    '.page-header{padding:12px 0 4px !important;}';

  function injectQuietCss(frame) {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.head) return;
      if (doc.getElementById('lab-quiet')) return;
      var style = doc.createElement('style');
      style.id = 'lab-quiet';
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

  activate('room'); /* 单模式，直接激活 */
})();

/* lab.js — 速度实验室整合壳：模式切换（iframe 常驻懒加载）+ 头部降噪注入 + 壳全屏 */
(function () {
  'use strict';

  var SUBTITLES = {
    motion: '甲车匀速、乙车变速，看每 10 s 间隔里两车各跑了多远。',
    calc: '输入 v、s、t 中任意两个量，第三个自动算出，单位自动换算。',
    speed: '十种物体的速度对比，点条目看 km/h 换算和生活化类比。',
    unit: '8 种速度单位任选互转：m/s、km/h、cm/s、km/min、mph、节、ft/s、马赫。'
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.mode-tab'));
  var frames = Array.prototype.slice.call(document.querySelectorAll('.mode-frame'));
  var subtitleEl = document.getElementById('mode-subtitle');

  /* 原页面头部降噪：只注入 CSS，不改原文件。
     选择器依据原页面实际结构：四个 exp 页统一是 a.back-btn（文案「‹ 返回互动探索区」，无 data-back），
     .page-header 原 padding 24px 0 8px（common.css）→ 约减半为 12px 0 4px */
  var QUIET_CSS =
    'a.back-btn{display:none !important;}' +
    '.page-header{padding:12px 0 4px !important;}';

  function injectQuietCss(frame) {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.head) return;
      if (doc.getElementById('speed-lab-quiet')) return;
      var style = doc.createElement('style');
      style.id = 'speed-lab-quiet';
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

  activate('motion'); /* 初始模式 */
})();

/* lab.js — 参照物实验室整合壳：模式切换（iframe 常驻懒加载）+ 头部降噪注入 */
(function () {
  'use strict';

  var SUBTITLES = {
    motion: '彗星、猎豹、蜗牛……人们根据什么判断这些物体是运动的？',
    reference: '点击街景中的物体，把它设为参照物，观察目标物体的运动状态。',
    train: '先体验“自己的列车动了”的错觉，再找出原因。',
    harvester: '收割机收稻子，运稻车与它并排同速前进。换个参照物，谁在动？'
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.mode-tab'));
  var frames = Array.prototype.slice.call(document.querySelectorAll('.mode-frame'));
  var subtitleEl = document.getElementById('mode-subtitle');

  /* 原页面头部降噪：只注入 CSS，不改原文件。
     选择器依据本节 4 个 exp 页实际结构（已逐页核实）：
     a.back-btn[data-back]（「‹ 返回实验区」）、.page-header（common.css padding 24px 0 8px，约减半） */
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
  activate('motion'); /* 初始模式 */
})();

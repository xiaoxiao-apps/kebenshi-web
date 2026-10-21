/* lab.js — 声音特性实验室整合壳：模式切换（iframe 常驻懒加载）+ 头部降噪注入 */
(function () {
  'use strict';

  var SUBTITLES = {
    intro: '蚊子翅膀振动快、蝴蝶振动慢——声音的高低差别从哪里来？',
    ruler: '拨动伸出桌面的钢尺：改变伸出长度和拨动幅度，听音调与响度怎么变。',
    scope: '把声音显示在示波器上：波形疏密看音调，波形高低看响度。',
    loudness: '用力大小不同，振幅不同——响度跟振幅有什么关系？',
    timbre: '同一首曲子，不同乐器演奏——波形形状不同，音色就不同。',
    range: '人耳能听到多高、多低的声音？动手测一测听觉频率范围。',
    craft: '动手做一件“乐器”：仿真调音，理解音调可以改变的道理。',
    instruments: '常见乐器的发声部分是什么？它们靠什么振动发声？'
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.mode-tab'));
  var frames = Array.prototype.slice.call(document.querySelectorAll('.mode-frame'));
  var subtitleEl = document.getElementById('mode-subtitle');

  /* 原页面头部降噪：只注入 CSS，不改原文件。
     本节 8 页返回按钮均为 a.back-btn（7 页带 data-back，exp-instruments 不带，故不用 [data-back] 限定）；
     .page-header 原 padding 24px 0 8px（common.css:43），约减半。 */
  var QUIET_CSS =
    'a.back-btn{display:none !important;}' +
    '.page-header{padding:12px 0 4px !important;}';

  function injectQuietCss(frame) {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.head) return;
      if (doc.getElementById('sound-lab-quiet')) return;
      var style = doc.createElement('style');
      style.id = 'sound-lab-quiet';
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
  activate('intro'); /* 初始模式 */
})();

/* lab.js — 声音实验室整合壳：模式切换（iframe 常驻懒加载）+ 头部降噪注入 */
(function () {
  'use strict';

  var SUBTITLES = {
    vibrate: '一切发声体都在振动——看音叉击水溅起水花。',
    amp: '桌面振动太微弱？用放大器把微小振动放大给你看。',
    wave: '声音以波的形式传播，看波形理解声波。',
    vacuum: '抽走罩内空气，铃声越来越小——声音传播需要介质。',
    medium: '固体、液体、气体，比一比谁传声本领强。',
    dual: '两只耳朵收到声音有先后，据此判断声源方向。',
    speed: '给各种介质中的声速排排队，从慢到快。',
    echo: '声音遇到障碍会反射回来，用回声测距离。'
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.mode-tab'));
  var frames = Array.prototype.slice.call(document.querySelectorAll('.mode-frame'));
  var subtitleEl = document.getElementById('mode-subtitle');

  /* 原页面头部降噪：只注入 CSS，不改原文件。
     选择器依据本节 8 个 exp 页实际结构（已逐页核实）：
     a.back-btn[data-back]（‹ 返回实验区）、.page-header（common.css padding 24px 0 8px，约减半） */
  var QUIET_CSS =
    'a.back-btn[data-back]{display:none !important;}' +
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

  /* F11：display:none 的 iframe 内 document.hidden 仍为 false，浏览器不停 WebAudio/Audio——
     壳切 tab 时主动 postMessage 通知子页自停（hide）；show 只作状态通知，子页不自动恢复播放 */
  function postToFrame(frame, kind) {
    try {
      if (frame.contentWindow) frame.contentWindow.postMessage({ kind: kind }, '*');
    } catch (e) { /* 投递失败不影响切换 */ }
  }

  function activate(mode) {
    tabs.forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    frames.forEach(function (frame) {
      var on = frame.dataset.mode === mode;
      frame.classList.toggle('active', on);
      if (on && !frame.src) {
        frame.addEventListener('load', function () {
          injectQuietCss(frame);
          /* 加载期间已被切走：load 后补发 hide（子页监听可能错过切换瞬间的消息） */
          if (!frame.classList.contains('active')) postToFrame(frame, 'sound-lab-hide');
        });
        frame.src = frame.dataset.src; /* 首次激活才赋 src，之后常驻不重载 */
      }
      if (frame.src) postToFrame(frame, on ? 'sound-lab-show' : 'sound-lab-hide');
    });
    subtitleEl.textContent = SUBTITLES[mode] || '';
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { activate(tab.dataset.mode); });
  });
  activate('vibrate'); /* 初始模式 */
})();

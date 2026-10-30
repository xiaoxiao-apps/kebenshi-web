/* mobile-guard.js — 环境引导蒙层（P1b，蔡总 2026-10-30 10:13 令）
   命中条件：微信内核(MicroMessenger) 或 (pointer:coarse 且 竖屏 innerHeight>innerWidth)。
   微信 → 引导「点右上角⋯ → 在浏览器打开」；竖屏 → 引导「请横屏使用」。
   带「仍要继续」关闭钮，关闭记 sessionStorage 当次不再弹；桌面(pointer:fine)永不弹。
   全站共享单文件，绝对路径 /content/_lib/mobile-guard.js，defer 加载。 */
(function () {
  'use strict';
  var SS_KEY = 'mg-dismissed';
  var overlayEl = null;

  function ssGet(k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) {} }

  function isWeChat() { return /MicroMessenger/i.test(navigator.userAgent || ''); }
  function isCoarse() {
    return !!(window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
  }
  function isPortrait() { return window.innerHeight > window.innerWidth; }

  /* 返回需要弹的引导类型：'wechat' | 'rotate' | null（桌面 pointer:fine 恒 null） */
  function guardKind() {
    if (isWeChat()) return 'wechat';
    if (isCoarse() && isPortrait()) return 'rotate';
    return null;
  }

  function dismissed() { return ssGet(SS_KEY) === '1'; }

  function buildOverlay(kind) {
    var el = document.createElement('div');
    el.className = 'mg-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    var icon = kind === 'wechat' ? '↗' : '⟳';
    var title = kind === 'wechat' ? '请在浏览器中打开' : '请横屏使用';
    var body = kind === 'wechat'
      ? '点右上角 <b>⋯</b> → 选择「在浏览器打开」，获得完整体验'
      : '本实验为横屏设计，请把设备<b>旋转为横屏</b>后继续使用';
    el.innerHTML =
      '<div class="mg-card">' +
        '<div class="mg-icon">' + icon + '</div>' +
        '<div class="mg-title">' + title + '</div>' +
        '<div class="mg-body">' + body + '</div>' +
        '<button type="button" class="mg-continue">仍要继续</button>' +
      '</div>';
    el.querySelector('.mg-continue').addEventListener('click', function () {
      ssSet(SS_KEY, '1');
      hide();
    });
    return el;
  }

  function injectStyle() {
    if (document.getElementById('mg-style')) return;
    var css =
      '.mg-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(8,12,20,.82);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);' +
      'padding:calc(20px + env(safe-area-inset-top)) calc(20px + env(safe-area-inset-right)) calc(20px + env(safe-area-inset-bottom)) calc(20px + env(safe-area-inset-left));' +
      'font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;}' +
      '.mg-card{max-width:min(360px,88vw);background:#fff;border-radius:18px;padding:28px 24px;text-align:center;' +
      'box-shadow:0 16px 48px rgba(0,0,0,.45);}' +
      '.mg-icon{font-size:44px;line-height:1;color:#2563eb;margin-bottom:12px;}' +
      '.mg-title{font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;}' +
      '.mg-body{font-size:14.5px;line-height:1.6;color:#475569;margin-bottom:20px;}' +
      '.mg-body b{color:#0f172a;}' +
      '.mg-continue{min-width:132px;min-height:44px;padding:10px 22px;border-radius:22px;border:1px solid #cbd5e1;' +
      'background:#f1f5f9;color:#334155;font-size:14px;font-weight:600;cursor:pointer;}' +
      '.mg-continue:active{background:#e2e8f0;}';
    var st = document.createElement('style');
    st.id = 'mg-style';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  function show(kind) {
    if (overlayEl) return;
    injectStyle();
    overlayEl = buildOverlay(kind);
    (document.body || document.documentElement).appendChild(overlayEl);
  }

  function hide() {
    if (!overlayEl) return;
    var el = overlayEl; overlayEl = null;
    if (el.parentNode) el.parentNode.removeChild(el);
  }

  function evaluate() {
    if (dismissed()) { hide(); return; }
    var kind = guardKind();
    if (!kind) { hide(); return; }
    /* 已在屏且类型一致则保留；类型变化（微信↔竖屏）重建 */
    if (overlayEl) {
      var cur = overlayEl.getAttribute('data-kind');
      if (cur === kind) return;
      hide();
    }
    show(kind);
    if (overlayEl) overlayEl.setAttribute('data-kind', kind);
  }

  function boot() {
    evaluate();
    window.addEventListener('resize', evaluate);
    window.addEventListener('orientationchange', function () { setTimeout(evaluate, 120); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

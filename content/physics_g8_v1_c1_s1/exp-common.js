/* ============================================================
   exp-common.js — 实验区共享工具函数
   ============================================================ */
function fitCanvas(cv, cssH){
  var dpr = Math.min(window.devicePixelRatio || 1, 3);
  var w = cv.clientWidth || cv.parentElement.clientWidth;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(cssH * dpr);
  cv.style.height = cssH + 'px';
  var ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx: ctx, w: w, h: cssH };
}

function roundRectPath(ctx, x, y, w, h, r){
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function getCssH(cv){
  var wrap = cv.parentElement;
  var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
  if((wrap && wrap.classList.contains('pseudo-fullscreen')) || fsEl === wrap){
    return window.innerHeight;
  }
  return window.innerWidth <= 768 ? 300 : 360;
}

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

function getCssH(cv, bar){
  var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
  var fsWrap = null, el = cv.parentElement;
  while(el && el !== document.body){
    if(el.classList.contains('pseudo-fullscreen') || el === fsEl){ fsWrap = el; break; }
    el = el.parentElement;
  }
  if(fsWrap){
    var h = window.innerHeight;
    if(bar && bar.offsetHeight) h -= bar.offsetHeight;
    var parent = cv.parentElement;
    for(var i = 0; i < fsWrap.children.length; i++){
      var child = fsWrap.children[i];
      if(child === parent) continue;
      if(child.querySelector && (child.querySelector('.fullscreen-btn') || child.querySelector('.exit-fs-btn'))) continue;
      if(child.classList.contains('fullscreen-btn') || child.classList.contains('exit-fs-btn')) continue;
      if(child.offsetHeight){
        var cs = getComputedStyle(child);
        h -= child.offsetHeight + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
      }
    }
    return Math.max(h, 120);
  }
  return window.innerWidth <= 768 ? 300 : 360;
}

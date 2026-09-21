/* ============================================================
   fullscreen.js — 全屏辅助（Fullscreen API + 伪全屏降级）
   ============================================================ */
(function(){
  window.FullscreenHelper = {
    isFullscreen: function(){
      return !!(document.fullscreenElement || document.webkitFullscreenElement);
    },
    enter: function(el){
      if(el.requestFullscreen) return el.requestFullscreen();
      if(el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
      // 降级：伪全屏
      el.classList.add('pseudo-fullscreen');
      el._exitBtn.style.display = 'block';
      // 触发自定义事件让 canvas 重新适配
      window.dispatchEvent(new Event('resize'));
      return Promise.resolve();
    },
    exit: function(el){
      if(this.isFullscreen()){
        if(document.exitFullscreen) return document.exitFullscreen();
        if(document.webkitExitFullscreen) return document.webkitExitFullscreen();
      }
      // 降级退出
      el.classList.remove('pseudo-fullscreen');
      el._exitBtn.style.display = 'none';
      window.dispatchEvent(new Event('resize'));
      return Promise.resolve();
    },
    toggle: function(el){
      if(this.isFullscreen() || el.classList.contains('pseudo-fullscreen')){
        return this.exit(el);
      } else {
        return this.enter(el);
      }
    },
    /**
     * 为一个 fullscreen-wrap 元素绑定全屏按钮
     * @param {HTMLElement} wrap - .fullscreen-wrap 容器
     * @param {HTMLElement} btn - .fullscreen-btn 按钮
     * @param {Function} onResize - 全屏切换后的回调（用于 canvas 重绘）
     */
    bind: function(wrap, btn, onResize){
      // 创建退出按钮（伪全屏时用）
      var exitBtn = document.createElement('button');
      exitBtn.className = 'exit-fs-btn';
      exitBtn.textContent = '✕ 退出全屏';
      exitBtn.addEventListener('click', function(){ FullscreenHelper.exit(wrap); });
      document.body.appendChild(exitBtn);
      wrap._exitBtn = exitBtn;

      btn.addEventListener('click', function(){
        FullscreenHelper.toggle(wrap).then(function(){
          setTimeout(function(){
            if(onResize) onResize();
            window.dispatchEvent(new Event('resize'));
          }, 100);
        });
      });

      // 监听全屏变化（浏览器 ESC 退出时）
      document.addEventListener('fullscreenchange', function(){
        setTimeout(function(){
          if(!FullscreenHelper.isFullscreen() && wrap.classList.contains('pseudo-fullscreen')){
            wrap.classList.remove('pseudo-fullscreen');
            exitBtn.style.display = 'none';
          }
          if(onResize) onResize();
          window.dispatchEvent(new Event('resize'));
        }, 100);
      });
      if(document.webkitExitFullscreen){
        document.addEventListener('webkitfullscreenchange', function(){
          setTimeout(function(){
            if(onResize) onResize();
            window.dispatchEvent(new Event('resize'));
          }, 100);
        });
      }
    }
  };
})();

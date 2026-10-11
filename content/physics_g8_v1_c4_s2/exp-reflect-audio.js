'use strict';
/* c4s2 光的反射 · 页面专属音效（R30 瘦身：通用引擎/标准操作音效/静音按钮全部迁共享库 _lib/v1/sfx.js，这里只留本页专属脉冲音） */
window.playPulse=function(){if(window.SFX)window.SFX.tone(660,'sine',0.15,0.2);};

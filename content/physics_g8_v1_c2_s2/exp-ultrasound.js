/* exp-ultrasound.js — 超声波与次声波应用：翻牌交互 */
(function(){
  'use strict';
  document.querySelectorAll('[data-flip]').forEach(function(card){
    card.addEventListener('click', function(){
      card.classList.toggle('flipped');
    });
  });
})();

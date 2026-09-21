/* exp-control.js — 控制噪声三个途径：拖拽分类与即时反馈 */
(function(){
  'use strict';
  var cards = document.querySelectorAll('.measure-card');
  var bins = document.querySelectorAll('.bin');
  var fb = document.getElementById('fb');
  var total = cards.length, placed = 0;

  function showFb(text, ok){
    fb.textContent = text; fb.className = 'feedback show ' + (ok ? 'ok' : 'err');
  }

  function checkWin(){
    if (placed === total) {
      showFb(' 全部正确！控制噪声有三种思路：在声源处防止产生、在传播过程中阻断、在人耳处防止进入。', true);
    }
  }

  cards.forEach(function(card){
    card.addEventListener('dragstart', function(ev){ card.classList.add('dragging'); ev.dataTransfer.setData('text/plain', card.dataset.category); ev.dataTransfer.effectAllowed = 'move'; });
    card.addEventListener('dragend', function(){ card.classList.remove('dragging'); });
  });

  bins.forEach(function(bin){
    bin.addEventListener('dragover', function(ev){ ev.preventDefault(); bin.classList.add('drag-over'); });
    bin.addEventListener('dragleave', function(){ bin.classList.remove('drag-over'); });
    bin.addEventListener('drop', function(ev){ ev.preventDefault(); bin.classList.remove('drag-over'); });
  });

  bins.forEach(function(bin){
    bin.addEventListener('drop', function(ev){
      ev.preventDefault();
      var card = document.querySelector('.measure-card.dragging');
      if (!card) return;
      if (bin.dataset.accept === card.dataset.category) {
        var slot = bin.querySelector('.slot-list');
        slot.appendChild(card);
        card.classList.add('placed');
        card.setAttribute('draggable', 'false');
        placed++;
        showFb(' 放对了：' + card.textContent.trim(), true);
        setTimeout(checkWin, 200);
      } else {
        showFb(' 再放一次：这个措施不属于“' + bin.querySelector('h3').textContent.trim().split(' ')[1] + '”。', false);
      }
    });
  });
})();

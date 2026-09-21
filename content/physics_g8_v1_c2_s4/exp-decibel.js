/* exp-decibel.js — 人对不同强度的声音的感觉：分贝刻度 + 可拖场景 + 上限按钮 */
(function(){
  'use strict';
  var dbInfo = {
    0:   { db: '0 dB', text: '人耳刚能听到的最微弱的声音。' },
    35:  { db: '30~40 dB', text: '较为理想的安静环境。为了保证休息和睡眠，声音不能超过 50 dB。' },
    70:  { db: '70 dB', text: '会干扰谈话，影响工作效率。' },
    90:  { db: '90 dB', text: '长期生活在 90 dB 以上的噪声环境中，听力会受到严重影响并产生神经衰弱、头疼、高血压等疾病。为了保护听力，声音不能超过 90 dB。' },
    150: { db: '150 dB', text: '如果突然暴露在高 150 dB 的噪声环境中，鼓膜会破裂出血，双耳完全失去听力。' }
  };
  var marker = document.getElementById('dbMarker');
  var dbReadout = document.getElementById('dbReadout');
  var dbInfoEl = document.getElementById('dbInfo');
  var scale = document.getElementById('dbScale');

  function setDb(db){
    var pct = Math.min(Math.max(db / 150 * 100, 0), 100);
    marker.style.left = pct + '%';
    var info = dbInfo[db] || { db: db + ' dB', text: '不同分贝对应不同的听觉感受。' };
    dbReadout.textContent = info.db + ' · ' + info.text.split('。')[0] + (info.text.includes('。') ? '。' : '');
    dbInfoEl.textContent = info.text;
  }

  document.querySelectorAll('[data-db]').forEach(function(card){
    card.addEventListener('click', function(){ setDb(+card.dataset.db); });
  });

  document.querySelectorAll('[data-limit]').forEach(function(btn){
    btn.addEventListener('click', function(){ setDb(+btn.dataset.limit); });
  });

  var draggables = document.querySelectorAll('#scenePool .chip-card');
  draggables.forEach(function(el){
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', function(ev){ ev.dataTransfer.setData('text/plain', el.dataset.db); });
  });
  scale.addEventListener('dragover', function(ev){ ev.preventDefault(); });
  scale.addEventListener('drop', function(ev){ ev.preventDefault(); var db = ev.dataTransfer.getData('text/plain'); if (db) setDb(+db); });
  setDb(0);
})();

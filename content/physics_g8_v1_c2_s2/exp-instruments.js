/* exp-instruments.js — 科学世界·乐音和乐器：三 Tab 迷你仿真 + 贾湖骨笛
   试听按钮：点击循环播放、按钮变「⏹ 停止」，再点停止；同时只响一个，切 Tab 自动停。 */
(function(){
  'use strict';

  /* ---------- Tab 切换 ---------- */
  var tabs = document.querySelectorAll('.tab-btn'), panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(function(btn){
    btn.addEventListener('click', function(){
      stopLoop();
      var id = btn.dataset.tab;
      tabs.forEach(function(b){ b.classList.toggle('active', b === btn); });
      panels.forEach(function(p){ p.classList.toggle('active', p.id === 'tab-' + id); });
    });
  });

  /* ---------- 音频工具 ---------- */
  var audios = {};
  function ensureAudio(name, src){
    if(!audios[name]){
      audios[name] = new Audio(src);
      audios[name].preload = 'auto';
    }
    return audios[name];
  }
  function setRate(a, rate){ a.preservesPitch = false; a.playbackRate = Math.max(0.3, Math.min(3, rate)); }
  function volLabel(v){ return v < 0.35 ? '响度：小' : (v > 0.7 ? '响度：大' : '响度：中'); }
  function pitchLabel(rate){ return rate < 0.85 ? '音调：低' : (rate > 1.2 ? '音调：高' : '音调：中'); }

  /* ---------- 循环播放 + 按钮状态互斥 ---------- */
  var loopBtn = null;
  function stopLoop(){
    if(!loopBtn) return;
    var a = loopBtn._audio;
    if(a){ try{ a.pause(); a.currentTime = 0; }catch(e){} }
    loopBtn.textContent = loopBtn._label;
    loopBtn.classList.remove('playing');
    loopBtn = null;
  }
  function toggleLoop(btn, audio){
    if(loopBtn === btn){ stopLoop(); return; }
    stopLoop();
    if(!btn._label) btn._label = btn.textContent;
    audio.loop = true;
    try{ audio.currentTime = 0; }catch(e){}
    audio.play().catch(function(){});
    btn._audio = audio;
    btn.textContent = '⏹ 停止';
    btn.classList.add('playing');
    loopBtn = btn;
  }

  /* ---------- 打击乐器 ---------- */
  var drumStrength = document.getElementById('drumStrength'), drumRead = document.getElementById('drumRead');
  var drumAudio = null;
  function applyDrum(){
    var v = parseInt(drumStrength.value, 10) / 100;
    if(drumAudio){ drumAudio.volume = v; }
    drumRead.textContent = volLabel(v);
  }
  document.getElementById('playDrum').addEventListener('click', function(){
    stopLoop();   /* 打击乐点一下响一下；先停掉可能在循环的弦乐/管乐 */
    drumAudio = ensureAudio('taiko', 'assets/audio/taiko-hit.mp3');
    drumAudio.loop = false;
    applyDrum(); try{ drumAudio.currentTime = 0; }catch(e){} drumAudio.play().catch(function(){});
  });
  drumStrength.addEventListener('input', applyDrum); applyDrum();

  var bellSize = document.getElementById('bellSize'), bellRead = document.getElementById('bellRead');
  var bellAudio = null;
  function applyBell(){
    var r = 0.6 + parseInt(bellSize.value, 10) / 100 * 0.8;
    if(bellAudio){ setRate(bellAudio, r); }
    bellRead.textContent = pitchLabel(r);
  }
  document.getElementById('playBell').addEventListener('click', function(){
    stopLoop();
    bellAudio = ensureAudio('bell', 'assets/audio/chinese-bell.mp3');
    bellAudio.loop = false;
    applyBell(); try{ bellAudio.currentTime = 0; }catch(e){} bellAudio.play().catch(function(){});
  });
  bellSize.addEventListener('input', applyBell); applyBell();

  /* ---------- 弦乐器 ---------- */
  var stringLen = document.getElementById('stringLen'), pluckStrength = document.getElementById('pluckStrength');
  var violinRead = document.getElementById('violinRead'), pluckRead = document.getElementById('pluckRead');
  var violinAudio = null;
  function applyViolin(){
    var r = 1.4 - parseInt(stringLen.value, 10) / 100 * 0.8;
    var v = parseInt(pluckStrength.value, 10) / 100;
    if(violinAudio){ setRate(violinAudio, r); violinAudio.volume = v; }
    violinRead.textContent = pitchLabel(r);
    pluckRead.textContent = volLabel(v);
  }
  document.getElementById('playViolin').addEventListener('click', function(){
    violinAudio = ensureAudio('violin', 'assets/audio/violin-do-c4.mp3');
    applyViolin(); toggleLoop(this, violinAudio);
  });
  document.getElementById('playPluck').addEventListener('click', function(){
    violinAudio = ensureAudio('violin', 'assets/audio/violin-do-c4.mp3');
    applyViolin(); toggleLoop(this, violinAudio);
  });
  stringLen.addEventListener('input', applyViolin);
  pluckStrength.addEventListener('input', applyViolin);
  applyViolin();

  /* ---------- 管乐器 ---------- */
  var airLen = document.getElementById('airLen'), windRead = document.getElementById('windRead');
  var windAudio = null;
  function applyWind(){
    var r = 1.4 - parseInt(airLen.value, 10) / 100 * 0.8;
    if(windAudio){ setRate(windAudio, r); }
    windRead.textContent = pitchLabel(r);
  }
  document.getElementById('playFlute').addEventListener('click', function(){
    windAudio = ensureAudio('flute', 'assets/audio/flute-do-c4.mp3');
    applyWind(); toggleLoop(this, windAudio);
  });
  document.getElementById('playDizi').addEventListener('click', function(){
    windAudio = ensureAudio('dizi', 'assets/audio/dizi-note.mp3');
    applyWind(); toggleLoop(this, windAudio);
  });
  airLen.addEventListener('input', applyWind); applyWind();

  /* ---------- 翻牌 ---------- */
  document.querySelectorAll('[data-flip]').forEach(function(card){
    card.addEventListener('click', function(){ card.classList.toggle('flipped'); });
  });

})();

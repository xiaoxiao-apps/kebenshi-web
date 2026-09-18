/* exp-range.js — 听觉频率范围：对数轴 + 动物条带 + 连续纯音试听 */
(function(){
  'use strict';
  var DW = 640, cv = document.getElementById('rangeCv'), ctx = cv.getContext('2d');
  var W = 640, H = 280, k = 1, MIN_HZ = 1, MAX_HZ = 200000, selected = null;
  var audioCtx = null, osc = null, gainNode = null, playing = false;
  var ranges = { '人':[20,20000], '狗':[15,50000], '猫':[60,65000], '蝙蝠':[1000,120000], '海豚':[150,150000], '大象':[1,20000] };
  function logPos(hz){ return Math.log10(Math.max(MIN_HZ, Math.min(MAX_HZ, hz)) / MIN_HZ) / Math.log10(MAX_HZ / MIN_HZ); }
  function hzFromPos(p){ return Math.round(MIN_HZ * Math.pow(MAX_HZ / MIN_HZ, p)); }
  function fmtHz(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function resize(){ var f = fitCanvas(cv, getCssH(cv)); ctx = f.ctx; W = f.w; H = parseFloat(cv.style.height) || f.h; k = W / DW; draw(); }
  function draw(){
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    var pad = 24 * k, axisY = H * 0.62, axisW = W - pad * 2, x0 = pad, x1 = x0 + axisW;
    var xInfra = x0 + axisW * logPos(20), xUltra = x0 + axisW * logPos(20000);
    ctx.fillStyle = 'rgba(192,57,43,.08)'; ctx.fillRect(x0, pad, xInfra - x0, H - pad * 2);
    ctx.fillStyle = 'rgba(74,140,63,.12)'; ctx.fillRect(xInfra, pad, xUltra - xInfra, H - pad * 2);
    ctx.fillStyle = 'rgba(155,89,182,.08)'; ctx.fillRect(xUltra, pad, x1 - xUltra, H - pad * 2);
    if(selected && ranges[selected]){
      var r = ranges[selected], sx = x0 + axisW * logPos(r[0]), sw = axisW * (logPos(r[1]) - logPos(r[0]));
      var barY = axisY - 34 * k;
      ctx.fillStyle = 'rgba(41,128,185,.35)'; roundRectPath(ctx, sx, barY, sw, 18 * k, 6 * k); ctx.fill();
      ctx.fillStyle = '#2980b9'; ctx.font = 'bold ' + (11 * k) + 'px sans-serif'; ctx.textAlign = 'center';
      var labelX = Math.min(Math.max(sx + sw / 2, pad + 20 * k), W - pad - 20 * k);
      ctx.fillText(selected + ' ' + fmtHz(r[0]) + '~' + fmtHz(r[1]) + ' Hz', labelX, barY - 6 * k);
    }
    ctx.strokeStyle = '#888'; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.moveTo(x0, axisY); ctx.lineTo(x1, axisY); ctx.stroke();
    var ticks = [1, 10, 100, 1000, 10000, 100000, 200000];
    var labelTicks = [1, 10, 100, 1000, 10000, 100000];
    ctx.fillStyle = '#555'; ctx.font = (11 * k) + 'px sans-serif'; ctx.textAlign = 'center';
    for(var i = 0; i < ticks.length; i++){
      var tx = x0 + axisW * logPos(ticks[i]);
      ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1 * k; ctx.beginPath(); ctx.moveTo(tx, axisY); ctx.lineTo(tx, axisY + 6 * k); ctx.stroke();
      if(labelTicks.indexOf(ticks[i]) === -1) continue;
      var idx = labelTicks.indexOf(ticks[i]);
      ctx.textBaseline = (idx % 2 === 0) ? 'top' : 'alphabetic';
      var ty = (idx % 2 === 0) ? axisY + 10 * k : axisY - 8 * k;
      ctx.fillText(fmtHz(ticks[i]), tx, ty);
    }
    ctx.textBaseline = 'alphabetic';
    var curHz = hzFromPos((+playSlider.value - 10) / 90), curX = x0 + axisW * logPos(curHz);
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 2 * k; ctx.setLineDash([4 * k, 3 * k]); ctx.beginPath(); ctx.moveTo(curX, pad); ctx.lineTo(curX, axisY + 8 * k); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#8b6914'; ctx.font = 'bold ' + (10 * k) + 'px sans-serif'; ctx.textAlign = (curX > W / 2) ? 'right' : 'left';
    ctx.fillText('▲ ' + fmtHz(curHz) + ' Hz', curX + (curX > W / 2 ? -4 * k : 4 * k), pad + 14 * k);
    ctx.fillStyle = '#4a8c3f'; ctx.font = 'bold ' + (12 * k) + 'px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('人耳 20~20 000 Hz', xInfra + 6 * k, axisY - 46 * k);
    ctx.strokeStyle = '#4a8c3f'; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.moveTo(xInfra, axisY - 38 * k); ctx.lineTo(xUltra, axisY - 38 * k); ctx.stroke();
    ctx.fillStyle = '#c0392b'; ctx.textAlign = 'center'; ctx.fillText('次声波', (x0 + xInfra) / 2, axisY - 26 * k);
    ctx.fillStyle = '#8e44ad'; ctx.fillText('超声波', (xUltra + x1) / 2, axisY - 26 * k);
  }
  function ensureAudio(){ if(audioCtx) return audioCtx; var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null; audioCtx = new AC(); return audioCtx; }
  function startTone(hz){ var ac = ensureAudio(); if(!ac) return; if(ac.state === 'suspended') ac.resume(); if(!osc){ osc = ac.createOscillator(); gainNode = ac.createGain(); osc.type = 'sine'; osc.connect(gainNode); gainNode.connect(ac.destination); osc.start(); } setTone(hz); playing = true; }
  function setTone(hz){ if(!osc) return; var now = audioCtx.currentTime; osc.frequency.setTargetAtTime(Math.max(1, hz), now, 0.02); var out = hz > 20000 || hz < 20; gainNode.gain.setTargetAtTime(out ? 0.0001 : 0.25, now, 0.05); updateWarning(out); }
  function stopTone(){ if(osc){ try { osc.stop(); } catch(e){} osc = null; gainNode = null; } playing = false; var hz = hzFromPos((+playSlider.value - 10) / 90); updateWarning(hz > 20000 || hz < 20); }
  function updateWarning(out){ var el = document.getElementById('rangeWarn'); if(!el) return; if(out){ el.style.display = 'block'; el.textContent = '⚠️ 超出人耳听觉范围，听不到'; } else { el.style.display = 'none'; el.textContent = ''; } }
  var animalBtns = document.querySelectorAll('.animal-grid .btn');
  var playSlider = document.getElementById('playSlider'), playHz = document.getElementById('playHz');
  var playToneBtn = document.getElementById('playToneBtn'), stopToneBtn = document.getElementById('stopToneBtn'), revealBtn = document.getElementById('revealBtn');
  var answerBox = document.getElementById('answerBox');
  function updatePlayHz(shouldSet){ var p = (+playSlider.value - 10) / 90, hz = hzFromPos(p); playHz.textContent = fmtHz(hz) + ' Hz'; if(playing && shouldSet !== false) setTone(hz); updateWarning((!playing) && (hz > 20000 || hz < 20)); return hz; }
  for(var i = 0; i < animalBtns.length; i++){
    animalBtns[i].addEventListener('click', function(){
      var a = this.dataset.animal; selected = (selected === a ? null : a);
      for(var j = 0; j < animalBtns.length; j++) animalBtns[j].classList.toggle('active', animalBtns[j].dataset.animal === selected);
      draw();
    });
  }
  playSlider.addEventListener('input', function(){ updatePlayHz(true); });
  playToneBtn.addEventListener('click', function(){ startTone(updatePlayHz(false)); });
  stopToneBtn.addEventListener('click', stopTone);
  revealBtn.addEventListener('click', function(){ answerBox.style.display = 'block'; });
  function loop(){ draw(); requestAnimationFrame(loop); }
  window.addEventListener('resize', resize); updatePlayHz(false); resize(); requestAnimationFrame(loop);
})();

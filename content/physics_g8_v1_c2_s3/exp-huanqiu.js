/* exp-huanqiu.js — 丘回声：纵向剖面/前视图，声波从人位置发出、栏板反射、返回人耳; r6: moving reflect arcs, rail shake, center pulse */
(function(){
  'use strict';
  var cv = document.getElementById('huanqiuCv'), ctx;
  var W, H, k;
  var standSelect = document.getElementById('standSelect'), shoutBtn = document.getElementById('shoutBtn');
  var infoCard = document.getElementById('infoCard'), outsideInfo = document.getElementById('outsideInfo');
  var waves = [], stand = 'center';
  var shakes = { left: null, right: null };

  function platformY(){ return H * 0.72; }
  function platformH(){ return H * 0.10; }
  function platformW(){ return W * 0.80; }
  function leftRailInnerX(){ var pw = platformW(), px = (W - pw) / 2; return px + W * 0.025; }
  function rightRailInnerX(){ var pw = platformW(), px = (W - pw) / 2; return px + pw - W * 0.025; }
  function railTopY(){ return H * 0.26; }
  function railBottomY(){ return platformY() + platformH(); }
  function centerX(){ return W / 2; }
  function centerY(){ return platformY() + platformH() / 2; }

  function clipToRails(){
    var rt = railTopY(), rb = railBottomY();
    ctx.beginPath(); ctx.rect(leftRailInnerX(), rt, rightRailInnerX() - leftRailInnerX(), rb - rt); ctx.clip();
  }

  function resize(){ var f = fitCanvas(cv, 360); ctx = f.ctx; W = f.w; H = f.h; k = Math.max(1, W / 640); draw(); }

  function drawSky(){ ctx.fillStyle = '#e9f4fb'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#d9e6dc'; ctx.fillRect(0, H - H * 0.08, W, H * 0.08); }

  function drawPlatform(){
    var py = platformY(), ph = platformH(), pw = platformW(), px = (W - pw) / 2;
    ctx.fillStyle = '#e8ded0'; ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#c9b89c'; ctx.lineWidth = Math.max(1, H * 0.006); ctx.strokeRect(px, py, pw, ph);
    // 天心石小标记
    var stoneR = Math.max(3, W * 0.012);
    ctx.fillStyle = '#d4b896'; ctx.beginPath(); ctx.arc(W / 2, py + ph / 2, stoneR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#bfa887'; ctx.lineWidth = Math.max(1, W * 0.002); ctx.stroke();
    // 两侧斜坡
    var slopeW = W * 0.14;
    ctx.fillStyle = '#d6c8b4';
    ctx.beginPath(); ctx.moveTo(px, py + ph / 2); ctx.lineTo(px + slopeW, py + ph); ctx.lineTo(px, py + ph); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(px + pw, py + ph / 2); ctx.lineTo(px + pw - slopeW, py + ph); ctx.lineTo(px + pw, py + ph); ctx.closePath(); ctx.fill();
  }

  function railShakeOffset(startTime){
    var t = performance.now() - startTime;
    var dur = 350;
    if(t >= dur) return 0;
    var k2 = Math.max(1, W / 640);
    return 3 * k2 * Math.exp(-t / 120) * Math.sin(t / 25);
  }

  function drawRail(){
    var pw = platformW(), px = (W - pw) / 2;
    var rt = railTopY(), rb = railBottomY();
    var railW = Math.max(6, W * 0.025);

    var shakeL = 0, shakeR = 0;
    if(shakes.left){ shakeL = railShakeOffset(shakes.left); if(shakeL === 0) shakes.left = null; }
    if(shakes.right){ shakeR = railShakeOffset(shakes.right); if(shakeR === 0) shakes.right = null; }

    ctx.fillStyle = '#b0a08a';
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = Math.max(1, W * 0.003);

    // 左侧栏板
    ctx.save(); ctx.translate(shakeL, 0);
    ctx.fillRect(px - railW, rt, railW, rb - rt);
    ctx.strokeRect(px - railW, rt, railW, rb - rt);
    ctx.restore();

    // 右侧栏板
    ctx.save(); ctx.translate(shakeR, 0);
    ctx.fillRect(px + pw, rt, railW, rb - rt);
    ctx.strokeRect(px + pw, rt, railW, rb - rt);
    ctx.restore();

    // 栏板顶部
    ctx.save(); if(shakes.left) ctx.translate(shakeL, 0);
    ctx.fillStyle = '#9c8c75';
    ctx.fillRect(px - railW - W * 0.005, rt, railW + W * 0.01, H * 0.025);
    ctx.restore();
    ctx.save(); if(shakes.right) ctx.translate(shakeR, 0);
    ctx.fillRect(px + pw - W * 0.005, rt, railW + W * 0.01, H * 0.025);
    ctx.restore();

    // 标注（放在左侧栏板上方天空区，左对齐且距左边缘有安全边距，任何宽度均不被截断/重叠）
    ctx.fillStyle = '#8b6914'; ctx.font = 'bold ' + Math.max(10, W * 0.015) + 'px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('汉白玉栏板', W * 0.05, rt - H * 0.03);
  }

  function drawLabels(){
    var x = W * 0.05, y = H * 0.08, fs = Math.max(11, W * 0.018);
    ctx.fillStyle = 'rgba(139,105,20,0.95)'; ctx.font = 'bold ' + fs + 'px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('半径约 11.5 m', x, y);
    ctx.fillText('高出地面约 5 m', x, y + fs * 1.4);
  }

  // r8: 教科书插画风站姿人物（圆头+发色块/肤色脸/红衣/长裤/四肢比例），脚落台面、总高约34*scale（personY 上方17*scale 到下方17*scale），眼点画在 eyeY 便于反射线对齐
  function drawPerson(x, y, color){
    var s = Math.max(1, W / 640);
    var feet = y + 17 * s, headC = y - 13 * s, headR = 3.6 * s;
    var skin = '#f2c69b';
    ctx.lineCap = 'round';
    // 双腿（长裤）
    ctx.strokeStyle = '#3b4a5a'; ctx.lineWidth = 2.6 * s;
    ctx.beginPath(); ctx.moveTo(x - 1.7 * s, y + 3 * s); ctx.lineTo(x - 1.9 * s, feet - 1.2 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 1.7 * s, y + 3 * s); ctx.lineTo(x + 1.9 * s, feet - 1.2 * s); ctx.stroke();
    // 鞋
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath(); ctx.ellipse(x - 2.1 * s, feet - 0.7 * s, 2.0 * s, 1.0 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 2.1 * s, feet - 0.7 * s, 2.0 * s, 1.0 * s, 0, 0, Math.PI * 2); ctx.fill();
    // 双臂：衣袖(上衣色)上段微张 + 肤色前臂自然下垂
    ctx.strokeStyle = color; ctx.lineWidth = 2.2 * s;
    ctx.beginPath(); ctx.moveTo(x - 3.5 * s, y - 7 * s); ctx.lineTo(x - 4.6 * s, y - 1 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 3.5 * s, y - 7 * s); ctx.lineTo(x + 4.6 * s, y - 1 * s); ctx.stroke();
    ctx.strokeStyle = skin; ctx.lineWidth = 1.9 * s;
    ctx.beginPath(); ctx.moveTo(x - 4.6 * s, y - 1 * s); ctx.lineTo(x - 5.0 * s, y + 4 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 4.6 * s, y - 1 * s); ctx.lineTo(x + 5.0 * s, y + 4 * s); ctx.stroke();
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(x - 5.1 * s, y + 4.6 * s, 1.1 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 5.1 * s, y + 4.6 * s, 1.1 * s, 0, Math.PI * 2); ctx.fill();
    // 躯干（上衣，肩宽腰窄）
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 3.8 * s, y - 8 * s);
    ctx.lineTo(x + 3.8 * s, y - 8 * s);
    ctx.lineTo(x + 3.0 * s, y + 4 * s);
    ctx.lineTo(x - 3.0 * s, y + 4 * s);
    ctx.closePath(); ctx.fill();
    // 颈
    ctx.fillStyle = skin; ctx.fillRect(x - 1.0 * s, y - 10.6 * s, 2.0 * s, 2.8 * s);
    // 脸（肤色圆头）
    ctx.beginPath(); ctx.arc(x, headC, headR, 0, Math.PI * 2); ctx.fill();
    // 头发（顶部发盖+两鬓）
    ctx.fillStyle = '#4a3222';
    ctx.beginPath(); ctx.arc(x, headC, headR + 0.3 * s, Math.PI + 0.45, Math.PI * 2 - 0.45); ctx.closePath(); ctx.fill();
    ctx.fillRect(x - headR - 0.2 * s, y - 14.8 * s, 0.9 * s, 1.9 * s);
    ctx.fillRect(x + headR - 0.7 * s, y - 14.8 * s, 0.9 * s, 1.9 * s);
    // 眼睛点（与 eyeY() 对齐）
    ctx.fillStyle = '#222222';
    ctx.beginPath(); ctx.arc(x - 1.4 * s, y - 14 * s, 0.55 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 1.4 * s, y - 14 * s, 0.55 * s, 0, Math.PI * 2); ctx.fill();
    // 嘴（微笑弧，喊话波源高度）
    ctx.strokeStyle = '#8c4a3c'; ctx.lineWidth = 0.7 * s;
    ctx.beginPath(); ctx.arc(x, y - 12.4 * s, 1.1 * s, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  }

  function personX(){ return stand === 'center' ? W / 2 : W / 2 + W * 0.16; }
  function personY(){ return platformY() - 17 * Math.max(1, W / 640); }
  // r8: 眼睛高度 = personY 上方 14*scale（头顶下约3*scale），反射回程线/弧汇聚终点
  function eyeY(){ return personY() - 14 * Math.max(1, W / 640); }
  function mouthY(){ return personY() - 11.5 * Math.max(1, W / 640); }

  function railHitX(side){ var pw = platformW(), px = (W - pw) / 2; return side === 'left' ? px + W * 0.025 : px + pw - W * 0.025; }
  function railHitY(){ return railTopY() + (railBottomY() - railTopY()) * 0.7; }

  function emitWave(sx, sy){
    var arcs = [];
    for(var i = 0; i < 7; i++) arcs.push({ r: i * Math.max(2, W * 0.012), alpha: 1 - i * 0.12 });
    waves.push({ sx: sx, sy: sy, life: 1, state: 'out', speed: Math.max(1.2, W * 0.0035), arcs: arcs, reflectArcs: [], reflectFromX: null, reflectFromY: null });
  }

  function drawArcGroup(cx, cy, arcs, colorBase, angle, spread, doClip){
    ctx.lineWidth = Math.max(1, W * 0.003);
    if(doClip){ ctx.save(); clipToRails(); }
    for(var i = 0; i < arcs.length; i++){
      var a = arcs[i];
      if(a.alpha <= 0.01) continue;
      ctx.beginPath();
      ctx.strokeStyle = colorBase.replace('ALPHA', (0.75 * a.alpha).toFixed(3));
      if(arguments.length >= 5 && spread > 0){
        ctx.arc(cx, cy, a.r, angle - spread / 2, angle + spread / 2);
      } else {
        ctx.arc(cx, cy, a.r, 0, Math.PI * 2);
      }
      ctx.stroke();
    }
    if(doClip){ ctx.restore(); }
  }

  function addCenterPulse(g){
    g.pulses.push({ r: 0, alpha: 1, start: performance.now() });
  }

  function drawPulse(p){
    if(p.alpha <= 0.01) return;
    ctx.save();
    var cx = personX(), cy = eyeY(); // r8: 汇合脉冲回到人眼高度
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(5, W * 0.04));
    g.addColorStop(0, 'rgba(255,255,180,' + (0.8 * p.alpha).toFixed(3) + ')');
    g.addColorStop(0.6, 'rgba(255,220,120,' + (0.5 * p.alpha).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,220,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Math.max(5, W * 0.04) + p.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawWaves(){
    var personXVal = personX(), personYVal = personY();
    for(var i = 0; i < waves.length; i++){
      var w = waves[i]; if(w.life <= 0) continue;
      var active = false;
      w.hitLeft = w.hitLeft || false;
      w.hitRight = w.hitRight || false;
      // 更新外发波
      for(var j = 0; j < w.arcs.length; j++){
        var a = w.arcs[j]; a.r += w.speed; a.alpha = Math.max(0, 1 - a.r / (Math.max(W, H) * 0.7)); if(a.alpha > 0.01) active = true;
      }
      var outerR = w.arcs[w.arcs.length - 1].r;

      // 撞栏板检测：左右独立
      if(w.arcs[w.arcs.length - 1].alpha > 0.01){
        var dxLeft = Math.abs(personXVal - leftRailInnerX());
        var dxRight = Math.abs(rightRailInnerX() - personXVal);
        if(outerR >= dxLeft && !w.hitLeft){
          w.hitLeft = true;
          addReflect(w, leftRailInnerX(), railHitY(), 'left');
          shakes.left = performance.now();
        }
        if(outerR >= dxRight && !w.hitRight){
          w.hitRight = true;
          addReflect(w, rightRailInnerX(), railHitY(), 'right');
          shakes.right = performance.now();
        }
        if(w.reflectArcs && w.reflectArcs.length && (w.hitLeft || w.hitRight)){
          w.state = 'reflect';
        }
      }

      // 更新反射波（双层：组 -> 弧）
      if(w.reflectArcs && w.reflectArcs.length){
        for(var jj = 0; jj < w.reflectArcs.length; jj++){
          var g = w.reflectArcs[jj]; if(!g) continue;
          for(var kk = 0; kk < g.arcs.length; kk++){
            var a = g.arcs[kk];
            a.r += w.speed;
            a.alpha = Math.max(0, 1 - a.r / (Math.max(W, H) * 0.8));
            if(a.alpha > 0.01) active = true;
          }
          var outerA = g.arcs[g.arcs.length - 1];
          if(!g.arrived && outerA.r >= g.dist){ g.arrived = true; addCenterPulse(g); }
          for(var pp = g.pulses.length - 1; pp >= 0; pp--){
            var p = g.pulses[pp]; var pt = performance.now() - p.start; p.r += w.speed * 0.8; p.alpha = Math.max(0, 1 - pt / 400); if(p.alpha <= 0.01){ g.pulses.splice(pp, 1); }
          }
        }
      }

      // 绘制撞击闪光
      drawHitFlashes(w);

      // 绘制外发波（裁剪到两栏板内侧之间）
      drawArcGroup(w.sx, w.sy, w.arcs, 'rgba(63,167,232,ALPHA)', 0, 0, true);

      // 绘制反射波（左右独立，从栏板反射点朝台面中心汇聚）
      if(w.reflectArcs && w.reflectArcs.length){
        for(var ri = 0; ri < w.reflectArcs.length; ri++){
          var refl = w.reflectArcs[ri];
          if(!refl || refl.life <= 0) continue;
          // r8: 反射弧朝人眼汇聚（不再落台面中心/脚前）
          var angle = Math.atan2(eyeY() - refl.fromY, personX() - refl.fromX);
          drawArcGroup(refl.fromX, refl.fromY, refl.arcs, 'rgba(231,76,60,ALPHA)', angle, Math.PI / 3, false);
        }
      }

      // 绘制中心汇合脉冲
      for(var ri2 = 0; w.reflectArcs && ri2 < w.reflectArcs.length; ri2++){
        var rg = w.reflectArcs[ri2]; if(!rg) continue;
        for(var pi = 0; pi < rg.pulses.length; pi++){ drawPulse(rg.pulses[pi]); }
      }

      // 移除条件：外发波走完全程且所有反射弧也淡出/越过中心
      var outGone = w.arcs[w.arcs.length - 1].r > Math.max(W, H) * 1.2;
      var margin = W * 0.35;
      var refGone = !w.reflectArcs || w.reflectArcs.length === 0 || w.reflectArcs.every(function(rf){ return !rf || rf.arcs[rf.arcs.length - 1].r > rf.dist + margin || rf.arcs[rf.arcs.length - 1].alpha <= 0.01; });
      if(outGone && refGone) w.life = 0;
    }
    waves = waves.filter(function(w2){ return w2.life > 0; });
    drawPerson(personXVal, personYVal, '#c0392b');
  }

  function addReflect(w, fx, fy, side){
    if(!w.reflectArcs) w.reflectArcs = [];
    var arcs = [];
    for(var r = 0; r < 7; r++) arcs.push({ r: r * Math.max(2, W * 0.012), alpha: 1 - r * 0.12 });
    var g = { fromX: fx, fromY: fy, side: side, life: 1, arcs: arcs, arrived: false, pulses: [] };
    g.dist = Math.hypot(personX() - fx, eyeY() - fy); // r8: 回程距离到人眼
    w.reflectArcs.push(g);
  }

  function drawHitFlashes(w){
    var now = performance.now();
    if(w.hitLeft && (!w.flashLeft || w.flashLeft.life > 0)){
      if(!w.flashLeft) w.flashLeft = { start: now, life: 1 };
      w.flashLeft.life = Math.max(0, 1 - (now - w.flashLeft.start) / 500);
      drawFlash(leftRailInnerX(), railHitY(), w.flashLeft.life);
    }
    if(w.hitRight && (!w.flashRight || w.flashRight.life > 0)){
      if(!w.flashRight) w.flashRight = { start: now, life: 1 };
      w.flashRight.life = Math.max(0, 1 - (now - w.flashRight.start) / 500);
      drawFlash(rightRailInnerX(), railHitY(), w.flashRight.life);
    }
  }

  function drawFlash(x, y, life){
    if(life <= 0) return;
    ctx.save();
    var g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(5, W * 0.03));
    g.addColorStop(0, 'rgba(255,255,220,' + (0.7 * life).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,255,220,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, Math.max(5, W * 0.03), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function draw(){ drawSky(); drawPlatform(); drawRail(); drawLabels(); drawWaves(); }

  function shout(){ emitWave(personX(), mouthY()); } // r8: 波源在嘴/头高度

  function updateInfo(){ if(stand === 'center'){ infoCard.style.display = 'block'; outsideInfo.style.display = 'none'; } else { infoCard.style.display = 'none'; outsideInfo.style.display = 'block'; } }

  standSelect.addEventListener('change', function(){ stand = standSelect.value; updateInfo(); });
  shoutBtn.addEventListener('click', shout);
  FullscreenHelper.bind(document.getElementById('fsHuanqiuWrap'), document.getElementById('fsHuanqiuBtn'), resize);
  window.addEventListener('resize', resize);
  updateInfo(); resize();
  function loop(){ draw(); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  Object.defineProperty(window,'__hqWaves',{get:function(){ return waves; }});
})();

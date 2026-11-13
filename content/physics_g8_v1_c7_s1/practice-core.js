/* 练习本 · 第7章 力（场景外考点）——判分 + 解析
 * 考点（设计书§3）：估测(1N≈两鸡蛋/中学生≈500N)、相互作用vs平衡辨析、
 * 斜面重力作图(竖直向下)、测力计读数误差(视差)、胡克结论表述。
 * 调色板与 exp-road-core.js PAL 同源；共享打磨：滚动条/移动端/加载遮罩见 practice.html。 */
(function () {
  'use strict';

  var PAL = { text: '#28323d', sub: '#6b7885', accent: '#2563eb', ok: '#16a34a', wrong: '#dc2626',
    slope: '#8a6d4a', slopeTop: '#a5825c', block: '#d64545', blockDark: '#a83232',
    steel: '#6b7885', scaleBg: '#ffffff', scaleEdge: '#94a3b8', needle: '#dc2626' };

  var QS = [
    { t: 'choice', tag: '估测',
      q: '下列物体所受重力最接近 1N 的是？',
      opts: ['两个鸡蛋', '一名中学生', '一辆小汽车', '一张课桌'], ans: 0,
      ex: '两个鸡蛋质量约 100g = 0.1kg，G = mg ≈ 0.1kg × 9.8N/kg ≈ 1N。中学生体重约 500N，汽车、课桌都远大于 1N。' },
    { t: 'choice', tag: '估测',
      q: '一名普通中学生站在水平地面上，对地面的压力最接近？',
      opts: ['50N', '500N', '5000N', '5N'], ans: 1,
      ex: '中学生质量约 50kg，G = mg ≈ 50kg × 9.8N/kg ≈ 500N；水平地面上对地面压力大小等于重力，故选 500N。' },
    { t: 'choice', tag: '辨析',
      q: '书静止在水平桌面上。下面哪一对是相互作用力（作用力与反作用力）？',
      opts: ['书受到的重力 与 桌面对书的支持力',
             '书对桌面的压力 与 桌面对书的支持力',
             '书受到的重力 与 书对桌面的压力',
             '桌面受到的重力 与 地面对桌面的支持力'], ans: 1,
      ex: '相互作用力：作用在两个物体上、等大反向同性质——书压桌面（施力者书）与桌面托书（施力者桌面）正是一对。A 是平衡力（同作用在书上）；C 性质不同且不互为作用对象；D 大小一般不等。' },
    { t: 'incline', tag: '作图',
      q: '木块静止在斜面上。点击图中一支箭头，选出木块所受重力 G 的正确方向。',
      ex: '重力方向总是竖直向下（指向地心方向），与斜面倾角无关——既不垂直于斜面，也不沿斜面。垂直斜面/沿斜面的是把重力"分解"后的分量方向，初中只要求画竖直向下的重力示意图。' },
    { t: 'gauge', tag: '读数',
      q: '图中测力计指针位置：绿色视线垂直刻度盘，红色为斜视。规范操作下正确读数是？',
      opts: ['1.2N', '1.4N', '1.6N', '1.0N'], ans: 1,
      ex: '读数时视线必须与刻度盘垂直，正对指针：读 1.4N。斜视会因视差读偏——图中红色斜视线从上方看会误读成 1.6N，读数偏大。' },
    { t: 'choice', tag: '结论',
      q: '探究"弹簧伸长量与拉力的关系"，正确的结论表述是？',
      opts: ['在弹性限度内，弹簧的伸长量与受到的拉力成正比',
             '在弹性限度内，弹簧的长度与受到的拉力成正比',
             '弹簧的伸长量与受到的拉力成正比',
             '在弹性限度内，弹簧的伸长量与钩码质量成正比'], ans: 0,
      ex: 'B 错在"长度"——成正比的是伸长量 ΔL = L − L₀，不是总长；C 缺"在弹性限度内"前提，超限度后不再成正比（还会永久变形）；D 应表述为拉力 F（钩码重力 G = mg 只是拉力的来源）。' }
  ];

  var state = { answered: [], right: 0 };

  function el(id) { return document.getElementById(id); }
  function updScore() {
    el('score').textContent = '答对 ' + state.right + ' / ' + QS.length;
    var n = state.answered.filter(function (v) { return v; }).length;
    if (n === QS.length) {
      el('done-text').textContent = '完成！答对 ' + state.right + ' / ' + QS.length + (state.right === QS.length ? ' 🎉 全对' : '');
      el('done').classList.add('show');
    }
  }

  function feedback(card, ok) {
    var fb = card.querySelector('.fb');
    fb.className = 'fb ' + (ok ? 'ok' : 'bad');
    fb.innerHTML = (ok ? '✅ 答对了！' : '❌ 答错了。') + '<br>' + card._ex;
  }

  /* ---- 选择题渲染 ---- */
  function renderChoice(card, qi) {
    var q = QS[qi], box = document.createElement('div'); box.className = 'opts';
    q.opts.forEach(function (txt, i) {
      var b = document.createElement('button'); b.className = 'opt';
      b.textContent = 'ABCD'.charAt(i) + '. ' + txt;
      b.onclick = function () {
        if (state.answered[qi]) return;
        state.answered[qi] = true;
        var ok = i === q.ans; if (ok) state.right++;
        box.querySelectorAll('.opt').forEach(function (btn, j) {
          btn.disabled = true;
          if (j === q.ans) btn.classList.add('right');
          else if (j === i) btn.classList.add('wrong');
        });
        feedback(card, ok); updScore();
      };
      box.appendChild(b);
    });
    card.appendChild(box);
  }

  /* ---- 画布脚手架（DPR 适配） ---- */
  function mkCanvas(card, w, h) {
    var cv = document.createElement('canvas'); cv.className = 'fig';
    var dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr; cv.height = h * dpr; cv.style.height = 'auto';
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    card.appendChild(cv);
    return { cv: cv, ctx: ctx, w: w, h: h };
  }
  function arrow(ctx, x0, y0, x1, y1, color, lw) {
    var a = Math.atan2(y1 - y0, x1 - x0), hl = 10;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * hl * 0.6, y1 - Math.sin(a) * hl * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - hl * Math.cos(a - 0.42), y1 - hl * Math.sin(a - 0.42));
    ctx.lineTo(x1 - hl * Math.cos(a + 0.42), y1 - hl * Math.sin(a + 0.42));
    ctx.closePath(); ctx.fill();
  }

  /* ---- Q4 斜面重力作图（点箭头判分） ---- */
  function renderIncline(card, qi) {
    var C = mkCanvas(card, 380, 240), ctx = C.ctx;
    var TH = Math.PI / 6, L = 64; // 重心 + 箭头长
    var bx = 170, by = 210 - (bx - 50) * Math.tan(TH);       // 木块底心贴在斜面斜边上
    var cx = bx - 7.5, cy = by - 13;                          // 木块重心（旋转后局部(0,-15)）
    var dirs = [ { d: [0, 1], lab: 'A' },                       // 竖直向下（对）
                 { d: [Math.sin(TH), Math.cos(TH)], lab: 'B' }, // 垂直斜面向下（错）
                 { d: [-Math.cos(TH), Math.sin(TH)], lab: 'C' },// 沿斜面向下（错）
                 { d: [0, -1], lab: 'D' } ];                    // 竖直向上（错）
    function draw(pick) {
      ctx.clearRect(0, 0, C.w, C.h);
      ctx.fillStyle = '#dfe9f2'; ctx.fillRect(0, 0, C.w, C.h);
      ctx.fillStyle = PAL.slope; ctx.beginPath();
      ctx.moveTo(50, 210); ctx.lineTo(340, 210); ctx.lineTo(340, 210 - 290 * Math.tan(TH)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = PAL.slopeTop; ctx.fillRect(50, 208, 290, 4);
      // 木块（贴在斜面上）
      ctx.save(); ctx.translate(bx, by); ctx.rotate(-TH);
      ctx.fillStyle = PAL.block; ctx.fillRect(-22, -30, 44, 30);
      ctx.fillStyle = PAL.blockDark; ctx.fillRect(-22, -8, 44, 8);
      ctx.restore();
      // 候选箭头
      dirs.forEach(function (o, i) {
        var col = PAL.accent;
        if (pick !== undefined) col = (i === 0 || i === pick) ? (i === 0 ? PAL.ok : (pick === 0 ? PAL.wrong : PAL.wrong)) : '#c3ccd6';
        if (pick !== undefined && i === 0) col = PAL.ok;
        if (pick !== undefined && i === pick && pick !== 0) col = PAL.wrong;
        arrow(ctx, cx, cy, cx + o.d[0] * L, cy + o.d[1] * L, col, 3);
        ctx.fillStyle = col; ctx.font = '700 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(o.lab, cx + o.d[0] * (L + 13), cy + o.d[1] * (L + 13) + 4);
      });
      ctx.strokeStyle = PAL.text; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, 7); ctx.stroke();
      ctx.fillStyle = PAL.sub; ctx.font = '600 11px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(pick === undefined ? '点击一支箭头作答' : '绿 = 正确方向（竖直向下）', 12, 20);
    }
    draw();
    C.cv.addEventListener('pointerdown', function (e) {
      if (state.answered[qi]) return;
      var r = C.cv.getBoundingClientRect();
      var mx = (e.clientX - r.left) * C.w / r.width, my = (e.clientY - r.top) * C.h / r.height;
      var pick = -1, best = 16;
      dirs.forEach(function (o, i) { // 点到箭头线段距离
        var tx = cx + o.d[0] * L, ty = cy + o.d[1] * L;
        var dx = tx - cx, dy = ty - cy, t = Math.max(0, Math.min(1, ((mx - cx) * dx + (my - cy) * dy) / (dx * dx + dy * dy)));
        var d = Math.hypot(mx - (cx + dx * t), my - (cy + dy * t));
        if (d < best) { best = d; pick = i; }
      });
      if (pick < 0) return;
      state.answered[qi] = true;
      var ok = pick === 0; if (ok) state.right++;
      draw(pick); feedback(card, ok); updScore();
    });
  }

  /* ---- Q5 测力计读数（静态图 + 选择） ---- */
  function renderGauge(card, qi) {
    var C = mkCanvas(card, 380, 240), ctx = C.ctx;
    ctx.fillStyle = '#dfe9f2'; ctx.fillRect(0, 0, C.w, C.h);
    var gx = 150, gy = 26, gw = 56, gh = 150; // 表身
    ctx.strokeStyle = PAL.steel; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(gx + gw / 2, gy - 6, 9, 0, 7); ctx.stroke();      // 吊环
    ctx.fillStyle = PAL.scaleBg; ctx.strokeStyle = PAL.scaleEdge; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(gx, gy, gw, gh, 10); ctx.fill(); ctx.stroke();
    for (var n = 0; n <= 5; n++) {                                            // 刻度 0~5N
      var yy = gy + 16 + n * (gh - 34) / 5;
      ctx.strokeStyle = PAL.sub; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(gx + 8, yy); ctx.lineTo(gx + 22, yy); ctx.stroke();
      ctx.fillStyle = PAL.sub; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(n + '', gx + 25, yy + 3);
    }
    var py = gy + 16 + 1.4 * (gh - 34) / 5;                                   // 指针 @1.4N
    ctx.strokeStyle = PAL.needle; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(gx + 8, py); ctx.lineTo(gx + gw - 8, py); ctx.stroke();
    ctx.fillStyle = PAL.steel; ctx.fillRect(gx + gw / 2 - 16, gy + gh, 32, 10); // 挂钩座
    ctx.strokeStyle = PAL.steel; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(gx + gw / 2, gy + gh + 20, 8, 0, Math.PI); ctx.stroke();
    arrow(ctx, 320, py, gx + gw + 6, py, PAL.ok, 2.5);                        // 垂直视线
    ctx.fillStyle = PAL.ok; ctx.font = '700 11px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('垂直视线 → 1.4N', 322, py - 8);
    arrow(ctx, 320, py - 46, gx + gw + 6, py, PAL.wrong, 2);                  // 斜视视线
    ctx.fillStyle = PAL.wrong; ctx.textAlign = 'right';
    ctx.fillText('斜视(视差) 误读 1.6N', 322, py - 52);
    renderChoice(card, qi);
  }

  /* ---- 总渲染 ---- */
  function render() {
    state = { answered: [], right: 0 };
    el('done').classList.remove('show');
    var quiz = el('quiz'); quiz.innerHTML = '';
    QS.forEach(function (q, qi) {
      var card = document.createElement('div'); card.className = 'qcard'; card._ex = q.ex;
      var head = document.createElement('div'); head.className = 'qhead';
      head.innerHTML = '<span class="qnum">' + (qi + 1) + ' · ' + q.tag + '</span><span class="qtext">' + q.q + '</span>';
      card.appendChild(head);
      if (q.t === 'choice') renderChoice(card, qi);
      else if (q.t === 'incline') renderIncline(card, qi);
      else if (q.t === 'gauge') renderGauge(card, qi);
      var fb = document.createElement('div'); fb.className = 'fb'; card.appendChild(fb);
      quiz.appendChild(card);
    });
    updScore();
  }

  el('btn-retry').onclick = render;
  render();
  var ld = el('loading'); ld.classList.add('fade');
  setTimeout(function () { ld.style.display = 'none'; }, 500); // 遮罩淡出
})();

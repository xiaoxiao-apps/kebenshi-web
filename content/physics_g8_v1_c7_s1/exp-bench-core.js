/* ============================================================
 * exp-bench-core.js — 场景B（7.2 弹力 + 7.3 重力）侧视实验台  C7V5-R10
 * R10 三轮修订：⑭完整螺旋线圈(每圈前后两弧) ⑮测力计课本全要素+挂钩/下弹簧/指针同步下移(位移=伸长)
 *   ⑯观察眼复用器材库 observer_eye.png(失败回退标准眼形) ⑰超弹性后仍可压缩回缩(并圈限位,塑性rest保留)
 *   ⑱示意图三类矢量：下拉=向下手力@手 / 上压=向上手力@手 / 挂砝码=G@重心（拖拽实时、松手消失）
 * 规格：设计书 §2 全条。侧视2D；复用 force-overlay.js 门控overlay（悬挂重力矢量）。
 * 物理：弹簧二阶欠阻尼（金属 ζ≈0.2 ωₙ=12）；五档材质 k+弹性限度谱；
 *       胡克 ΔL=F/k（曲线斜率=1/k 或 g/k，非 g）；测力计 G=mg、超量程 clamp 5N。
 * 结构：单一 IIFE；step()/draw()/handlers 函数声明提升，末尾统一 wiring + init。
 * z9轮：修2 BS.hangG flag 及置位点删除（guide-data 已无 c7b-16 step；ForceOverlay 'hangG' 矢量 id 不受影响）。
 * z11轮：修2 新 flag——BS.annot 电平（标注 toggle 状态随开关 true/false，reset 恢复不归零；c7b-05/c7b-19 超限度双分支门槛）；
 *       BS.zoomOpen 脉冲1s（点测力计本开放大 modal 瞬间置位；弹簧模式无 zoom 不置；c7b-21 构造条触发源）。
 * z13轮：修1 BS.matPlastic 电平（=mat().p>0，换材质同步，reset 恢复）+ BS.balanceEntered 电平（切挂点到测力计置 true，reset 清）；
 *       修2 完成度电平 has*×8（hasPulled/hasMatChanged/hasPlasticTried/hasMassAdded/hasAxisM/hasZoom/hasOverRange/hasAnnotOn，仅 reset 清）——praise c7b-38 触发源；
 *       修3 idle 暴露——window 捕获 pointerdown/keydown/wheel 归零 lastUserT，每 tick 写 BS.idle=(now-lastUserT)/1000（秒，数值）。
 * z14轮：引导并入动作条（guide-data 已删 8 idle 催办条 + 入场续条）——core 无已删 clip id 引用；BS 电平/完成度置位全保留（praise 链用）。
 * z15轮：修1 BS.matName 电平（=mat().name '钢'/'铁'/'铝'/'铅丝'/'橡皮泥'，换材质同步、reset 随当前材质恢复）——c7b-26 铅丝/c7b-27 橡皮泥 双分支触发源；
 *       修2 BS.tilt 由脉冲改电平（btn-tilt 置 true / btn-flat·reset 置 false）——c7b-38 queue 续条 trigger=tilt，须在 c7b-07 播完后仍判 tilt===true 才不被 queueDefer 重判放弃（07 播完才播总结）。
 * ============================================================ */
(function () {
  'use strict';

  /* ===== 调色板 ===== */
  var PAL = {
    bg: '#e8eef4', floor: '#b9a58d', floorTop: '#cbb89f',
    ramp: '#9fb3c8', rampSide: '#7e93aa',
    stand: '#5b6672', standDark: '#3f4954', standHi: '#828d99',
    weight: '#c2410c', weightDark: '#9a3412', weightHi: '#e0713c',
    rest: '#16a34a', limit: '#dc2626', curve: '#2563eb', over: '#dc2626',
    body: '#f4f6f8', bodyEdge: '#8595a8', needle: '#dc2626', scale: '#334155',
    text: '#28323d', sub: '#6b7885', panel: 'rgba(255,255,255,.94)', grav: '#7c3aed', hand: '#ea580c'
  };

  /* ===== 五档材质谱（§2.2 钢k大限度高 > 铁 > 铝k小限度低 > 铅丝限度≈0 > 橡皮泥纯塑性） ===== */
  var MATS = [
    { name: '钢',   k: 2.0,  limitF: 14,   zeta: 0.18, p: 0,   color: '#b9c5d1', note: '钢：k 大、弹性限度高' },      // 亮银灰（z5 修2：限度 9→14）
    { name: '铁',   k: 1.3,  limitF: 8,    zeta: 0.22, p: 0,   color: '#8b929a', note: '铁：k 与限度居中' },          // 灰（z5 修2：限度 6→8）
    { name: '铝',   k: 0.7,  limitF: 1.6,  zeta: 0.26, p: 0,   color: '#d4dce5', note: '铝：k 小、弹性限度低（200g 砝码即超限度）' }, // 浅银
    { name: '铅丝', k: 0.35, limitF: 0.05, zeta: 0.9,  p: 0.9, color: '#5d656e', note: '铅丝：弹性限度≈0，拉长不回弹（准塑性）' }, // 暗灰
    { name: '橡皮泥', k: 0.2, limitF: 0,   zeta: 1.0,  p: 1.0, color: '#a5713f', note: '橡皮泥：纯塑性，形变完全保留' }  // 棕褐
  ];

  /* ===== 物理常量 ===== */
  var GACC = 9.8;
  var MAS = [0, 50, 100, 150, 200, 250];                                   // z4 修3：砝码质量档（g），S.n=档索引（单块，体量∝质量^⅓）
  function massG(n) { return MAS[n] || 0; }
  function forceOf(n) { return massG(n) / 1000 * GACC; }                   // F = mg（N）
  var OMEGA = 12, RANGE = 5, FLOW = 6;                                     // ωₙ=12；量程5N；塑性流动速率

  /* ===== 画布脚手架 ===== */
  var cv = document.getElementById('scene');
  var ctx = cv.getContext('2d');
  var W = 960, H = 540, DPR = 1, dirty = true, lastNow = 0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function setText(id, t) { var el = document.getElementById(id); if (el && el.textContent !== t) el.textContent = t; }
  function setHint(t) {}                                                     // z轮：hint 层已删（字幕由 guide vB 承载），no-op
  function sfx(name) { if (!S.muted && window['play' + name]) { try { window['play' + name](); } catch (e) {} } }
  function seg(id, on) { var b = document.getElementById(id); if (b) b.classList.toggle('on', !!on); }

  /* ===== 布局 L（resize 全量重算） ===== */
  var L = {};
  function layout() {
    var zEl = document.querySelector('.zone');
    var zH = zEl && zEl.offsetHeight > 0 ? zEl.offsetHeight : (W < 640 ? 150 : 90);   // z8修2：DOM 实测，fallback 按 W 估 150/90
    var narrow = W < 640;
    var uH = W < 900 ? H - zH : H;                            // z8修2：窄屏场景收进 zone 之上（c6 约定；W≥900 布局零改动）
    L.zoneH = zH; L.uH = uH;
    L.floorY = W < 900 ? Math.round(uH - Math.max(uH * 0.12, 14)) : Math.round(H - Math.max(H * 0.12, zH + 14));   // 地面/斜面避开底部控制区（弹簧/曲线面板 y 经 floorY 同步）
    L.bx0 = Math.round(W * 0.34);
    L.rx = Math.round(W * 0.52);
    L.rw = Math.min(Math.round(W * 0.36), 340);
    L.TH = 15 * Math.PI / 180;
    L.bx1 = L.rx + Math.round(L.rw * 0.42);
    L.byr1 = L.floorY - Math.round((L.bx1 - L.rx) * Math.tan(L.TH));
    L.RH = clamp(Math.round(H * 0.74), 170, L.floorY - 44);  // ⑪铁架台立杆≥70%画面高（顶部避开hint）
    L.AW = clamp(Math.round(W * 0.15), 80, 210);              // ⑪横杆同步放大
    L.L0 = clamp(Math.round(H * 0.21), 96, 165);              // 弹簧自然长
    L.PXCM = clamp(H * 0.055, 22, 36);                        // 伸长绘制比例 px/cm
    var ws = clamp(Math.round(H * 0.026), 11, 18) / 16;           // z3 修1：现有 narrow 缩放系数（@1200 视口=1）
    L.wb = Math.round(30 * ws);                                    // 砝码 50g 基准块高 30（PhET 粗圆柱；z4 修3 体量∝质量^⅓）
    L.ww = Math.round(36 * 1.15 * ws);                             // 宽=弹簧圈半径 36×1.15≈41
    L.BL = clamp(Math.round(H * 0.26), 110, 190);             // ⑫测力计筒长放大
    L.baseW = clamp(Math.round(W * 0.2), 140, 280);           // ⑪底座放大
    L.gw = clamp(Math.round(W * (narrow ? 0.46 : 0.30)), 170, 280);
    L.gh = clamp(Math.round(H * (narrow ? 0.30 : 0.33)), 135, 205);
    L.gx = W - L.gw - 14; L.gy = narrow ? L.floorY - L.gh - 10 : 50;  // ⑪窄屏曲线移右下，避开基准线标签
    L.zw = clamp(Math.round(W * 0.46), 250, 380); L.zh = clamp(Math.round(H * 0.76), 300, 480);
    L.zx = Math.round((W - L.zw) / 2); L.zy = Math.round((H - L.zh) / 2) + 4;
  }

  /* ===== 状态 ===== */
  var S = {
    mat: 0, mode: 'spring', tilt: { t: 0, target: 0 },
    sp: { x: 0, v: 0, rest: 0, maxOver: 0 },                // x/rest 单位 cm（rest=永久变形基准下移）
    n: 0, curve: { pts: {}, pending: false, axis: 'F' },
    bal: { r: 0, v: 0, flash: 0, dragF: -1 },
    zoom: false, eye: false, diagram: false, muted: false,
    annot: false,                                             // z7轮修4：标注开关（基准线/限度线/ΔL/zoom引线标注；缺省关=纯净场景；曲线面板不受控）
    ps: { mode: 'idle', x: 0, y: 0 }
  };
  window.C7V5_BENCH = S;
  window.C7V5_BENCH_DBG = { hang: hangPt, bottom: bottomY, rest: restY, lay: function () { return L; },
    meterBox: meterBodyBox, zoomBtns: function () { return ZBTN; } };

  /* z7轮修1：guide 解说状态源（engine-core 轮询；事件标志=pulse 置 true 后 1.0s 自动归零→重复动作产生新边沿可重复播报；
     电平型 diagram 随示意图开关 true/false，不归零） */
  var BS = {
    pull: false, press: false, weightAdd: false, overLimit: false,            // z9修2：hangG 已删（c7b-16 step 不存在）
    material: false, tilt: false, flat: false, axisM: false, overRange: false,
    bdragRelease: false, balanceEnter: false, eye: false, reset: false,
    diagram: false, annot: false, zoomOpen: false,                            // z11修2：annot 电平（标注 toggle）+ zoomOpen 脉冲（测力计放大 modal 开启瞬间）
    matPlastic: false, balanceEntered: false,                                 // z13修1：塑性材质电平（=mat().p>0）+ 进过测力计模式电平（reset 清）
    hasPulled: false, hasMatChanged: false, hasPlasticTried: false, hasMassAdded: false,   // z13修2：完成度电平（置 true 后仅 reset 清）
    hasAxisM: false, hasZoom: false, hasOverRange: false, hasAnnotOn: false,
    idle: 0,                                                                  // z13修3：距上次用户动作秒数（每 tick 写）
    matName: '钢'                                                             // z15修1：当前材质名电平（=mat().name；c7b-26 铅丝/c7b-27 橡皮泥 双分支触发源）
  };
  window.C7S1_STATE = { mode: 'bench', bench: BS };
  var pulseTimers = {};                                                       // z7轮：pulse 定时器表（reset 清表）
  function pulse(key) {                                                       // 置 true + 1.0s 后自动归零；重复置 true 重启计时（每帧持续条件保持 true）
    BS[key] = true;
    if (pulseTimers[key]) clearTimeout(pulseTimers[key]);
    pulseTimers[key] = setTimeout(function () { BS[key] = false; pulseTimers[key] = null; }, 1000);
  }
  function clearPulses() { for (var pk in pulseTimers) { clearTimeout(pulseTimers[pk]); pulseTimers[pk] = null; } }

  /* ===== 几何访问器 ===== */
  function tiltE() { return easeInOut(S.tilt.t); }
  function tiltAng() { return L.TH * tiltE(); }
  function basePt() { var tt = tiltE(); return { x: lerp(L.bx0, L.bx1, tt), y: lerp(L.floorY, L.byr1, tt) }; }
  function topPt() { var b = basePt(), a = tiltAng(); return { x: b.x - L.RH * Math.sin(a), y: b.y - L.RH * Math.cos(a) }; }
  function hangPt() { var t = topPt(), a = tiltAng(); return { x: t.x - L.AW * Math.cos(a), y: t.y + L.AW * Math.sin(a) }; }
  function mat() { return MATS[S.mat]; }
  function limitExt() { return mat().limitF / mat().k; }                 // cm
  function steadyExt(n) {
    var m = mat(), F = forceOf(n);                                          // z4 修3：F=mg（质量档）
    if (F <= m.limitF) return F / m.k;                                   // 胡克：ΔL=F/k
    return limitExt() + (F - m.limitF) / m.k * 2.5;                      // 超限度：弯折（更软）
  }
  function blockWH(n) {                                                  // z4 修3：单块砝码 w/h = 50g 基准 × (m/50)^⅓
    var mg = massG(n);
    if (mg <= 0) return { w: 0, h: 0 };
    var s = Math.pow(mg / 50, 1 / 3);
    return { w: L.ww * s, h: L.wb * s };
  }
  function springTopY() { return hangPt().y + 6; }
  function restY() { return springTopY() + L.L0 + S.sp.rest * L.PXCM; }  // 回弹基准线（随永久变形下移）
  function limitY() { return restY() + limitExt() * L.PXCM; }            // 弹性限度线
  function bottomY() { return restY() + S.sp.x * L.PXCM; }               // 当前悬挂端
  function stackTopSp() { return bottomY() + 10; }
  function availCm() {                                                 // 砝码底不触地的可用伸长（cm）
    var stackH = S.n > 0 ? blockWH(S.n).h : 0;                         // z4 修3：单块高=堆高
    return (L.floorY - 16 - (springTopY() + L.L0) - 10 - stackH) / L.PXCM;
  }
  function hardMaxX() { return Math.max(-1.8, availCm() - S.sp.rest); } // 拉伸硬限位：不穿地板
  function hardMinX() { return -0.65 * L.L0 / L.PXCM - S.sp.rest; }   // 压缩硬限位：并圈总长≥35%自然长（sp.x 可负）
  function balBodyTop() { return hangPt().y + 12; }
  function hookRestY() { return balBodyTop() + L.BL + 8; }
  function balExtPx() { return (L.BL - 86) * clamp(S.bal.r, 0, RANGE) / RANGE; } // 伸长量(px)：指针/下弹簧/挂钩同源
  function balHookY() {                                                 // ⑭挂钩随伸长下移（sprite 分支=wire 底）
    if (meterReady()) {
      var bw0 = meterBodyW(L.BL);
      return meterTabTop(L.BL) + TAB_HF * bw0 + 0.51 * bw0;
    }
    return hookRestY() + balExtPx();
  }
  function weightCOM() {
    var hx = hangPt().x, bh = blockWH(S.n).h;                          // z4 修3：单块重心
    if (S.mode === 'spring') return { x: hx, y: stackTopSp() + bh * 0.5 };
    return { x: hx, y: balHookY() + 6 + bh * 0.5 };
  }

  /* ===== resize ===== */
  function resize() {
    DPR = window.devicePixelRatio || 1;
    var r = cv.getBoundingClientRect();
    W = Math.max(360, Math.round(r.width)); H = Math.max(320, Math.round(r.height));
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layout();
    if (window.ForceOverlay) ForceOverlay.setScale(clamp(Math.round(W * 0.028), 18, 30));
    dirty = true;
  }
  function canvasXY(ev) { var r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }

  /* ===== rAF 单循环 ===== */
  var lastUserT = 0;                                                          // z13修3：上次用户动作时刻（wire 里 window 捕获 pointerdown/keydown/wheel 归零）
  function markUser() { lastUserT = performance.now(); }
  function tick(now) {
    var dt = lastNow ? clamp(now - lastNow, 0, 48) : 16; lastNow = now;
    BS.idle = (now - lastUserT) / 1000;                                       // z13修3：idle 秒数电平（z14：idle 催办条已删，电平保留）
    if (step(dt / 1000, now)) dirty = true;
    if (dirty) { dirty = false; draw(); }
    requestAnimationFrame(tick);
  }

  /* ===== 物理步进 ===== */
  function step(dt, now) {
    var moved = false, m = mat();
    if (S.tilt.t !== S.tilt.target) {
      var d = Math.min(1.4 * dt, Math.abs(S.tilt.target - S.tilt.t));
      S.tilt.t += (S.tilt.target > S.tilt.t ? 1 : -1) * d;
      moved = true;
    }
    if (S.mode === 'spring') {
      var sp = S.sp;
      if (S.ps.mode !== 'spdrag') {
        var target = steadyExt(S.n);
        if (sp.v !== 0 || sp.x !== target) {                             // 欠阻尼二阶回归（金属回弹/过冲）
          var a = OMEGA * OMEGA * (target - sp.x) - 2 * m.zeta * OMEGA * sp.v;
          sp.v += a * dt; sp.x += sp.v * dt; moved = true;
          if (Math.abs(sp.x - target) < 0.002 && Math.abs(sp.v) < 0.02) { sp.x = target; sp.v = 0; }
        }
      }
      var lim = limitExt(), av = availCm();
      if (sp.x > lim + 0.02) pulse('overLimit');                          // 超弹性限度（c7b-05）
      if (m.p > 0) {                                                     // 铅丝/橡皮泥：塑性流动，静止基准线跟随
        if (sp.x > lim && sp.rest + sp.x < av) { var f = Math.min(1, FLOW * dt) * (sp.x - lim) * m.p; sp.rest += f; sp.x -= f; moved = true; }
        else if (sp.x < -lim) {                                          // z4 修4：压缩对称塑性流动（f 负；橡皮泥 lim=0 → 任何压缩都保留）
          var fc = Math.min(1, FLOW * dt) * (sp.x + lim) * m.p;
          sp.rest += fc; sp.x -= fc; moved = true;
        }
      } else {                                                           // 金属：超限度→回落后永久变形（新基准线下移）
        if (sp.x > lim) { if (sp.x > sp.maxOver) { sp.maxOver = sp.x; moved = true; } }
        else if (sp.maxOver > lim) { sp.rest += (sp.maxOver - lim) * 0.7; sp.maxOver = 0; moved = true; }
      }
      var hm = hardMaxX(), hmn = hardMinX();
      if (sp.x > hm) { sp.x = hm; if (sp.v > 0) sp.v = 0; moved = true; } // 拉伸硬限位：不穿地板
      if (sp.x < hmn) { sp.x = hmn; if (sp.v < 0) sp.v = 0; moved = true; } // 压缩硬限位：并圈
      var tot = sp.rest + sp.x;                                           // 总伸长（含永久）
      var recOk = m.p > 0
        ? (Math.abs(tot - Math.min(steadyExt(S.n), av)) < 0.06 || tot >= av - 0.06)
        : (Math.abs(sp.x - steadyExt(S.n)) < 0.002 && Math.abs(sp.v) < 0.02); // 与snap同阈值：静止后才记录，斜率恒=1/k
      if (S.curve.pending && S.ps.mode !== 'spdrag' && recOk) {
        S.curve.pts[S.n] = tot;                                           // 每勾一块记录总伸长
        S.curve.pending = false; moved = true;
      }
    } else {
      var b = S.bal;
      var Fn = forceOf(S.n);                                              // z4 修3：F=mg（质量档）
      var tgt = b.dragF >= 0 ? b.dragF : Fn;                              // 测力计读数 = G = mg
      if (tgt > RANGE) { b.flash = 0.4; tgt = RANGE; pulse('overRange'); BS.hasOverRange = true; }   // 超过量程 5N：红闪（c7b-10）；z13修2：hasOverRange
      if (b.v !== 0 || b.r !== tgt || b.dragF >= 0) {
        var a2 = OMEGA * OMEGA * (tgt - b.r) - 2 * 0.2 * OMEGA * b.v;    // 指针 ζ=0.2 ωₙ=12（回零过冲）
        b.v += a2 * dt; b.r += b.v * dt; moved = true;
        if (Math.abs(b.r - tgt) < 0.002 && Math.abs(b.v) < 0.02) { b.r = tgt; b.v = 0; }
      }
      if (b.flash > 0) { b.flash -= dt; moved = true; }
    }
    if (window.ForceOverlay) {                                           // 门控：三类矢量（挂砝码G@重心 / 下拉手力 / 上压手力 @手）
      if (ForceOverlay.isOn() && !S.zoom) {
        if (S.n > 0) {
          var c = weightCOM(), Gn = forceOf(S.n);                           // z轮五1：同点反向等大异体——G@重心(地球吸引砝码) + 弹簧对砝码上拉
          ForceOverlay.register('hangG', {
            point: c, dir: { x: 0, y: 1 }, magN: Gn, color: PAL.grav, label: 'G=' + Gn.toFixed(2) + 'N',
            pair: { point: c, dir: { x: 0, y: -1 }, magN: Gn, label: '弹簧对砝码 F拉=' + Gn.toFixed(2) + 'N' } });
        } else ForceOverlay.unregister('hangG');
        var hx = hangPt().x;
        if (S.ps.mode === 'spdrag') {                                    // 拖弹簧：下拉=向下手力 / 上压=向上手力，@握点实时
          var d = S.sp.x - steadyExt(S.n), Fh = mat().k * Math.abs(d);
          var gp = { x: hx, y: S.n > 0 ? stackTopSp() + blockWH(S.n).h : bottomY() + 8 };   // 握点：主箭与 pair 同点
          if (Fh > 0.02) ForceOverlay.register('handF', {
            point: gp, dir: { x: 0, y: d > 0 ? 1 : -1 }, magN: Fh, color: PAL.hand,
            label: (d > 0 ? 'F拉=' : 'F压=') + Fh.toFixed(2) + 'N',
            pair: { point: gp, dir: { x: 0, y: d > 0 ? -1 : 1 }, magN: Fh, label: '弹簧对手 F弹=' + Fh.toFixed(2) + 'N' } });
          else ForceOverlay.unregister('handF');
        } else if (S.ps.mode === 'bdrag') {                              // 拉测力计钩：向下手力@钩 + 弹簧对手向上（同点 pair）
          var bp = { x: hx, y: balHookY() + 4 };
          ForceOverlay.register('handF', {
            point: bp, dir: { x: 0, y: 1 }, magN: S.bal.dragF, color: PAL.hand,
            label: 'F拉=' + S.bal.dragF.toFixed(2) + 'N',
            pair: { point: bp, dir: { x: 0, y: -1 }, magN: S.bal.dragF, label: '弹簧对手 F弹=' + S.bal.dragF.toFixed(2) + 'N' } });
        } else ForceOverlay.unregister('handF');
        moved = true;
      } else { ForceOverlay.unregister('hangG'); ForceOverlay.unregister('handF'); }
    }
    return moved;
  }

  /* ===== 绘制基础 ===== */
  function rr(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function circ(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
  function dashLine(x0, y0, x1, y1, color, dash) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.setLineDash(dash || [7, 5]);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
  }
  function txt(t, x, y, color, size, align) {
    ctx.save(); ctx.fillStyle = color || PAL.text;
    ctx.font = '600 ' + (size || 11) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(t, x, y); ctx.restore();
  }
  function helix(x, y0, y1, sw, color, k, turns) {                        // C7V6-L1 入库：参数化螺旋移入 PROPS.spring_helix（前后股深度分遍）
    PROPS.spring_helix(ctx, x, y0, { ext: y1 - y0, sw: sw, color: color, k: k, turns: turns || 12 });
  }

  /* ===== C7V6 蔡总参考图 sprite：条形盒测力计本体（C7V6-L1 入库：sprite+overlay+程序化回退整件移入 PROPS.meter_side；core 只留物理/命中盒几何访问器） ===== */
  var METER_IMG = PROPS.meter_side.IMG;
  PROPS.meter_side.onLoad(function () { dirty = true; });
  function meterReady() { return METER_IMG.complete && METER_IMG.naturalWidth > 0; }
  var MB = PROPS.meter_side.G.MB;
  var TAB_HF = PROPS.meter_side.G.TAB_HF;
  function meterBodyW(bodyH) {
    return bodyH * (METER_IMG.naturalWidth || 165) / (METER_IMG.naturalHeight || 800);
  }
  function meterExt(bodyH) {                                     // 伸长量(px)：与 balExtPx 同源，按 bodyH 缩放
    return bodyH * (1 - 86 / L.BL) * clamp(S.bal.r, 0, RANGE) / RANGE;
  }
  function meterTabTop(bodyH) {
    return balBodyTop() - 10 + bodyH - 0.02 * bodyH + meterExt(bodyH);
  }
  /* ===== z2 修3：测力计本体命中盒（点本体放大）+ 放大 modal 按钮命中盒 ===== */
  function meterBodyBox() {
    var hx = hangPt().x, top = balBodyTop() - 10;
    var bw = meterReady() ? meterBodyW(L.BL) : clamp(Math.round(L.BL * 0.40), 44, 64);
    return { x0: hx - bw / 2, y0: top, x1: hx + bw / 2, y1: top + L.BL };
  }
  var ZBTN = { read: { x: 0, y: 0, w: 0, h: 0 }, close: { x: 0, y: 0, w: 0, h: 0 } };
  function zoomBtnsRect(zx, zy, zw) {                            // 右上「读数」+「×」关闭；命中盒随绘制更新
    var bh = 24, by = zy + 8, cw = 26, rw = 50, gap = 8;
    ZBTN.close = { x: zx + zw - 12 - cw, y: by, w: cw, h: bh };
    ZBTN.read = { x: ZBTN.close.x - gap - rw, y: by, w: rw, h: bh };
    return ZBTN;
  }

  /* ===== 地面 + 斜面（§2.1） ===== */
  function drawGround() {
    ctx.fillStyle = PAL.bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = PAL.floor; ctx.fillRect(0, L.floorY, W, H - L.floorY);
    ctx.fillStyle = PAL.floorTop; ctx.fillRect(0, L.floorY, W, 4);
    var t = tiltE();
    if (t > 0.02) {
      ctx.save(); ctx.globalAlpha = Math.min(1, t * 1.6);
      var rise = L.rw * Math.tan(L.TH);
      ctx.fillStyle = PAL.ramp;
      ctx.beginPath(); ctx.moveTo(L.rx, L.floorY); ctx.lineTo(L.rx + L.rw, L.floorY - rise);
      ctx.lineTo(L.rx + L.rw, L.floorY); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = PAL.rampSide; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(L.rx, L.floorY); ctx.lineTo(L.rx + L.rw, L.floorY - rise); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      ctx.beginPath(); ctx.moveTo(L.rx + L.rw * 0.55, L.floorY - rise * 0.42);
      ctx.lineTo(L.rx + L.rw * 0.9, L.floorY - rise * 0.82); ctx.lineTo(L.rx + L.rw * 0.9, L.floorY - rise * 0.42);
      ctx.closePath(); ctx.fill();
      txt('斜面', L.rx + L.rw * 0.5, L.floorY - rise * 0.25, PAL.standDark, 12, 'center');
      ctx.restore();
    }
  }

  /* ===== 巨大铁架台（⑪最大化：底座+立杆+横杆加粗，整体随斜面倾） ===== */
  function drawStand() {
    var b = basePt(), a = tiltAng();
    PROPS.stand_side(ctx, b.x, b.y, { rh: L.RH, aw: L.AW, baseW: L.baseW, tilt: a });   // C7V6-L1 入库：底座+立杆+横杆+端环整件
  }

  /* ===== 砝码（z4 修3：单块圆柱，体量∝质量^⅓；ww0/wb0=50g 基准 z3 现值；顶钩环互锁弹簧底钩） ===== */
  function drawWeights(hx, topY, n, wbMax) {
    var mg = massG(n);
    if (mg <= 0) return;                                                   // m=0 不画
    var dim = blockWH(n), wb = Math.min(dim.h, wbMax || dim.h), w = dim.w * (wb / dim.h);   // z4 修3：尺寸挤压留 core
    PROPS.weight_cyl(ctx, hx, topY, { mass: mg, w: w, h: wb });            // C7V6-L1 入库：圆柱+顶钩环+克重印字
  }

  /* ===== 弹簧悬挂（⑩PhET helix + 底部挂钩+砝码 + 双基准线）（§2.2/§2.3/§2.4） ===== */
  function drawSpringHang() {
    var h = hangPt(), hx = h.x, y0 = springTopY(), y1 = bottomY(), m = mat();
    ctx.fillStyle = PAL.standDark; rr(hx - 18, y0 - 7, 36, 9, 3); ctx.fill();
    helix(hx, y0, y1, 36, m.color, m.k);                                    // ⑩色随材质、粗细光泽随 k
    ctx.strokeStyle = PAL.standDark; ctx.lineWidth = 2.8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx, y1); ctx.lineTo(hx, y1 + 5);             // ⑩底部挂钩
    ctx.arc(hx + 4, y1 + 6.6, 4, Math.PI, 0, true); ctx.stroke();
    drawWeights(hx, stackTopSp(), S.n);                                    // z4 修3：单块自然体量（地板由 availCm/hardMaxX 保证）
    if (!S.annot) return;                                                    // z7轮修4：标注关=纯净场景（双基准线/限度线/ΔL 全隐）
    // 双基准线：回弹线（绿）+ 弹性限度线（红）；铅丝两线≈重合；橡皮泥隐藏限度线标"塑性"
    var narrow = W < 640, lx0 = Math.max(6, hx - 80), lx1 = hx + (narrow ? 54 : 100), labX = hx + 24;
    dashLine(lx0, restY(), lx1, restY(), PAL.rest, [8, 5]);
    var restLbl = narrow
      ? '回弹线' + (S.sp.rest > 0.05 ? '↓' + S.sp.rest.toFixed(1) : '')
      : '回弹基准线' + (S.sp.rest > 0.05 ? '（已下移 ' + S.sp.rest.toFixed(2) + 'cm）' : '');
    txt(restLbl, labX, restY() - 9, PAL.rest, narrow ? 9.5 : 10.5);
    if (S.mat === 4) {
      txt(narrow ? '塑性无回弹' : '塑性 · 无回弹（两线合并）', labX, restY() + 14, PAL.limit, narrow ? 9.5 : 10.5);
    } else {
      dashLine(lx0, limitY(), lx1, limitY(), PAL.limit, [4, 4]);
      var limN = mat().limitF + 'N';                                         // z4 修2：红线标签加印牛数
      var limLbl = S.mat === 3 ? (narrow ? '限度≈静止' : '弹性限度线 ≈ 静止线') : (narrow ? '限度' + limN : '弹性限度线 ' + limN);
      txt(limLbl, labX, limitY() - restY() < 22 ? limitY() + 13 : limitY() - 9, PAL.limit, narrow ? 9.5 : 10.5);
    }
    txt(narrow ? 'ΔL' + (S.sp.rest + S.sp.x).toFixed(1) + 'cm' : 'ΔL = ' + (S.sp.rest + S.sp.x).toFixed(2) + ' cm', labX, y0 + 10, PAL.sub, narrow ? 9 : 11);
  }

  /* ===== 测力计（场景小图，⑫标准条形测力计：全参数标识）（§2.5） ===== */
  function drawBalanceHangSpr() {                                        // C7V6：参考图 sprite 本体 + 参数化 overlay（C7V6-L1 入库：本体整件走 PROPS.meter_side）
    var h = hangPt(), hx = h.x, b = S.bal;
    var bodyH = L.BL, bodyW = meterBodyW(bodyH), mbTop = balBodyTop() - 10;   // 吊环接 hangPt
    PROPS.meter_side(ctx, hx, mbTop, { mode: 'balance', img: METER_IMG, bodyH: bodyH, r: b.r, range: RANGE, flash: b.flash, blRef: L.BL });
    var hy = balHookY();
    var wbB = Math.max(4, L.floorY - 14 - (hy + 6));                        // z4 修3：单块高度上限（不穿地板）
    drawWeights(hx, hy + 6, S.n, wbB);
    txt('G = mg = ' + forceOf(S.n).toFixed(2) + ' N', hx + bodyW / 2 + 12, mbTop + 14, PAL.text, 12);
    if (b.flash > 0) txt('超过量程 5N，会损坏测力计', hx + bodyW / 2 + 12, mbTop + 32, PAL.limit, 11.5);
  }
  function drawBalanceHang() {
    if (meterReady()) { drawBalanceHangSpr(); return; }                   // sprite 优先，下方为 fallback
    var h = hangPt(), hx = h.x, bt = balBodyTop(), b = S.bal;
    var bw = clamp(Math.round(L.BL * 0.40), 44, 64);
    PROPS.meter_side(ctx, hx, bt, { mode: 'spring', bodyH: L.BL, r: b.r, range: RANGE, flash: b.flash });   // C7V6-L1 入库：程序化体（吊环/调零螺丝/双刻度/内簧/拉杆/挂钩整套）
    var wbB = Math.max(4, L.floorY - 14 - (balHookY() + 6));
    drawWeights(hx, balHookY() + 6, S.n, wbB);
    var G = forceOf(S.n);
    txt('G = mg = ' + G.toFixed(2) + ' N', hx + bw / 2 + 12, bt + 14, PAL.text, 12);
    if (b.flash > 0) txt('超过量程 5N，会损坏测力计', hx + bw / 2 + 12, bt + 32, PAL.limit, 11.5);
  }

  /* ===== 伸长量曲线图 ΔL vs F（斜率=1/k 或 g/k，非 g）（§2.4） ===== */
  function drawGraph() {
    var gx = L.gx, gy = L.gy, gw = L.gw, gh = L.gh, m = mat();
    ctx.save();
    ctx.fillStyle = PAL.panel; rr(gx, gy, gw, gh, 10); ctx.fill();
    ctx.strokeStyle = '#d7dee6'; ctx.lineWidth = 1; rr(gx, gy, gw, gh, 10); ctx.stroke();
    txt('伸长量曲线（限度内：ΔL ∝ F）', gx + 10, gy + 14, PAL.text, 11.5);
    var ax = gx + 34, ay = gy + gh - 44, aw = gw - 52, ah = gh - 68;
    var fAxis = S.curve.axis === 'F';
    var maxN = 0; for (var k in S.curve.pts) maxN = Math.max(maxN, +k);
    var fTop = massG(maxN + 1) > 0 ? forceOf(maxN + 1) : forceOf(maxN) * 1.2 + 0.3;   // z4 修3：顶档时留白
    var xmax = Math.max(1.2, fTop * 1.1);
    if (!fAxis) xmax = xmax / GACC;
    var ymax = 1; for (var k2 in S.curve.pts) ymax = Math.max(ymax, S.curve.pts[k2] * 1.25);
    ctx.strokeStyle = PAL.text; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(ax, gy + 26); ctx.lineTo(ax, ay); ctx.lineTo(ax + aw + 8, ay); ctx.stroke();
    txt(fAxis ? 'F/N' : 'm/kg', ax + aw + 6, ay + 12, PAL.sub, 10, 'right');
    txt('ΔL/cm', ax + 5, gy + 32, PAL.sub, 10);
    var limF = m.limitF, limX = fAxis ? limF : limF / GACC;
    if (limX > 0 && limX < xmax) {
      var lxp = ax + aw * clamp(limX / xmax, 0, 1);
      dashLine(lxp, ay, lxp, ay - ah, PAL.limit, [4, 4]);
      txt('限度', lxp + 3, ay - ah + 6, PAL.limit, 9.5);
    }
    var keys = Object.keys(S.curve.pts).map(Number).sort(function (p, q) { return p - q; });
    ctx.beginPath(); ctx.moveTo(ax, ay);
    var lastIn = null;
    for (var i = 0; i < keys.length; i++) {
      var n = keys[i], F = forceOf(n), xv = fAxis ? F : massG(n) / 1000;
      var px = ax + aw * clamp(xv / xmax, 0, 1), py = ay - ah * clamp(S.curve.pts[n] / ymax, 0, 1);
      ctx.lineTo(px, py);
      if (F <= limF && limF > 0) lastIn = { n: n, ext: S.curve.pts[n] };
    }
    ctx.strokeStyle = PAL.curve; ctx.lineWidth = 2.2; ctx.stroke();
    for (var j = 0; j < keys.length; j++) {
      var n2 = keys[j], F2 = forceOf(n2), xv2 = fAxis ? F2 : massG(n2) / 1000;
      var px2 = ax + aw * clamp(xv2 / xmax, 0, 1), py2 = ay - ah * clamp(S.curve.pts[n2] / ymax, 0, 1);
      ctx.fillStyle = F2 > limF ? PAL.over : PAL.curve; circ(px2, py2, 3.2); ctx.fill();
    }
    var sy = gy + gh - 24, slopeT, narrowG = W < 640, sSize = narrowG ? 9.5 : 11;
    if (lastIn) {
      if (fAxis) slopeT = (narrowG ? '斜率=1/k=' : '斜率 ΔL/F = 1/k = ') + (lastIn.ext / forceOf(lastIn.n)).toFixed(2) + (narrowG ? 'cm/N(非g)' : ' cm/N（非 g）');
      else slopeT = (narrowG ? '斜率=g/k=' : '斜率 ΔL/m = g/k = ') + (lastIn.ext / (massG(lastIn.n) / 1000)).toFixed(2) + (narrowG ? 'cm/kg' : ' cm/kg');
    } else slopeT = 'k = ' + m.k + ' N/cm · 加砝码记录点';
    txt(slopeT, gx + 10, sy, lastIn ? PAL.text : PAL.sub, sSize);
    if (keys.length && forceOf(keys[keys.length - 1]) > limF)
      txt('超限度：曲线弯折 + 永久变形', gx + 10, sy - 15, PAL.over, 10.5);
    ctx.restore();
  }

  /* ===== 测力计放大（⑫标准组件+引线标注）+ 观察眼（⑬视线真⊥刻度面）（§2.6/§2.7） ===== */
  function drawEyeIcon(x, y, color, pdx, pdy) {                             // ⑬标准眼形：杏仁轮廓+虹膜+瞳孔+高光
    ctx.save();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 14, y);
    ctx.quadraticCurveTo(x, y - 10, x + 14, y);
    ctx.quadraticCurveTo(x, y + 10, x - 14, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    var ix = x + (pdx || 0) * 4.5, iy = y + (pdy || 0) * 3.5;
    ctx.fillStyle = color; circ(ix, iy, 4.4); ctx.fill();
    ctx.fillStyle = '#1f2933'; circ(ix, iy, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.92)'; circ(ix - 1.5, iy - 1.5, 1); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.quadraticCurveTo(x, y - 10, x + 14, y); ctx.stroke();
    ctx.restore();
  }
  function leader(x0, y0, x1, y1, label, align, color) {                    // 引线标注
    ctx.save(); ctx.strokeStyle = '#aab6c2'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    txt(label, x1 + (align === 'right' ? -5 : 5), y1, color || PAL.sub, 11, align);
    ctx.restore();
  }
  /* ===== 观察眼 sprite（器材库 observer_eye.png，朝左；加载失败回退标准眼形） ===== */
  var EYE_IMG = new Image();
  EYE_IMG.src = '../_lib/v1/sprites/observer_eye.png?v=20261118z';
  EYE_IMG.onload = function () { dirty = true; };
  function eyeReady() { return EYE_IMG.complete && EYE_IMG.naturalWidth > 0; }
  function drawEye(x, y, h, color) {
    if (!eyeReady()) { drawEyeIcon(x, y, color, -1, 0); return; }
    var w = h * EYE_IMG.naturalWidth / EYE_IMG.naturalHeight;
    ctx.drawImage(EYE_IMG, x - w / 2, y - h / 2, w, h);
  }
  function drawZoomHeader(zx, zy, zw, titleSuffix, b) {                    // z2 修3：modal 头（标题 + 读数 + 右上「读数」按钮 + 关闭）
    var zr = zoomBtnsRect(zx, zy, zw), rb = zr.read, cb = zr.close;
    txt(zw < 300 ? '测力计放大' : '测力计放大 · ' + titleSuffix, zx + 14, zy + 18, PAL.text, 12.5);
    txt((S.ps.mode === 'bdrag' ? '读数 F拉 = ' : '读数 G = ') + clamp(b.r, 0, RANGE).toFixed(2) + ' N', zx + 14, zy + 38, PAL.text, 12.5);
    if (b.flash > 0) txt('超过量程 5N，会损坏测力计', zx + 14, zy + 55, PAL.limit, 11.5);
    ctx.save();                                                            // 「读数」切换钮（on=绿）
    ctx.fillStyle = S.eye ? 'rgba(22,163,74,.16)' : 'rgba(148,163,184,.16)';
    rr(rb.x, rb.y, rb.w, rb.h, 6); ctx.fill();
    ctx.strokeStyle = S.eye ? '#16a34a' : '#94a3b8'; ctx.lineWidth = 1.2; rr(rb.x, rb.y, rb.w, rb.h, 6); ctx.stroke();
    txt('读数', rb.x + rb.w / 2, rb.y + rb.h / 2 + 0.5, S.eye ? '#15803d' : '#475569', 11.5, 'center');
    ctx.fillStyle = 'rgba(148,163,184,.16)'; rr(cb.x, cb.y, cb.w, cb.h, 6); ctx.fill();   // 「×」关闭钮
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.2; rr(cb.x, cb.y, cb.w, cb.h, 6); ctx.stroke();
    txt('×', cb.x + cb.w / 2, cb.y + cb.h / 2 + 0.5, '#475569', 15, 'center');
    ctx.restore();
  }
  function drawZoomSpr() {                                               // C7V6：参考图 sprite 放大 + 七项引线标注
    var zx = L.zx, zy = L.zy, zw = L.zw, zh = L.zh, cx = zx + zw / 2, b = S.bal;
    ctx.save();
    ctx.shadowColor = 'rgba(20,30,45,.3)'; ctx.shadowBlur = 18;
    ctx.fillStyle = PAL.panel; rr(zx, zy, zw, zh, 14); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#c6d0da'; ctx.lineWidth = 1.4; rr(zx, zy, zw, zh, 14); ctx.stroke();
    drawZoomHeader(zx, zy, zw, '参考图组件', b);
    var ratio = meterBodyW(1), extF = Math.max(0, 1 - 86 / L.BL);
    var stack = 0.98 + extF + ratio * (TAB_HF + 0.51);                   // 本体 + 挂钩行程（预留）
    var bodyH = Math.min(Math.round(zh * 0.80), Math.round((zh - 46) / stack));
    var bodyW = bodyH * ratio;
    var top = zy + Math.max(30, Math.round((zh - bodyH * stack) / 2));
    var mret = PROPS.meter_side(ctx, cx, top, { mode: 'balance', img: METER_IMG, bodyH: bodyH, r: b.r, range: RANGE, flash: b.flash, blRef: L.BL });   // C7V6-L1 入库
    var py = mret.py, hookY = mret.hookY, tabTop = mret.tabTop;
    var springY = top + MB.spring_top * bodyH, zeroY = top + MB.zero * bodyH;
    var sLen = (MB.five - MB.zero) * bodyH;
    var wtop = hookY + 10, wbz = clamp(zy + zh - 26 - wtop, 3, Math.round(L.wb * 1.75));   // z4 修3：单块（modal 内高度封顶≈250g 自然比）
    drawWeights(cx, wtop, S.n, wbz);
    var rx = cx + bodyW / 2, lx = cx - bodyW / 2, faceX = cx - 0.20 * bodyW, rodY = (py + tabTop) / 2;
    if (S.annot) {                                                          // z7轮修4：七项引线标注受「标注」toggle 控制（缺省关）
      leader(cx + 6, top + 6, rx + 34, top + 4, '吊环', 'left');            // 七组件（无调零螺丝）
      leader(rx - 4, top + bodyH * 0.14, rx + 34, top + bodyH * 0.14, '外壳', 'left');
      leader(cx + 8, (springY + py) / 2, rx + 34, top + bodyH * 0.32, '弹簧', 'left');
      leader(rx - 2, py, rx + 34, py + 10, '指针(红)', 'left', PAL.needle);
      leader(faceX + 4, zeroY + 8, lx - 30, zeroY - 2, '刻度面板', 'right');
      leader(cx - 4, rodY, lx - 30, rodY, '拉杆', 'right');
      leader(cx - 8, hookY - 6, lx - 30, hookY, '挂钩', 'right');
    }
    if (S.eye) drawZoomEye(cx + (MB.slot_x1 - 0.5) * bodyW, py, zeroY, sLen, b.r);
    ctx.restore();
  }
  function drawZoom() {
    if (meterReady()) { drawZoomSpr(); return; }                         // sprite 优先，下方为 fallback
    var zx = L.zx, zy = L.zy, zw = L.zw, zh = L.zh, cx = zx + zw / 2, b = S.bal;
    var bw = clamp(Math.round(zw * 0.26), 66, 104);
    ctx.save();
    ctx.shadowColor = 'rgba(20,30,45,.3)'; ctx.shadowBlur = 18;
    ctx.fillStyle = PAL.panel; rr(zx, zy, zw, zh, 14); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#c6d0da'; ctx.lineWidth = 1.4; rr(zx, zy, zw, zh, 14); ctx.stroke();
    drawZoomHeader(zx, zy, zw, '标准组件', b);
    var ringY = zy + 46, bodyTop = ringY + 18;
    var bodyH = clamp(Math.round((zh - 64 - 128) / 1.46), 70, 240);          // ⑭预留挂钩行程=伸长量
    var rx = cx + bw / 2, lx = cx - bw / 2;
    ctx.strokeStyle = PAL.standDark; ctx.lineWidth = 4.5; circ(cx, ringY, 10); ctx.stroke();  // 吊环
    ctx.fillStyle = PAL.bodyEdge; rr(cx - 10, bodyTop - 8, 20, 8, 2); ctx.fill();             // 环座
    ctx.fillStyle = PAL.standDark; rr(rx - 2, bodyTop + 5, 13, 9, 3); ctx.fill();             // 调零螺丝
    ctx.strokeStyle = PAL.standHi; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(rx + 2, bodyTop + 9.5); ctx.lineTo(rx + 8, bodyTop + 9.5); ctx.stroke();
    ctx.fillStyle = PAL.body; rr(lx, bodyTop, bw, bodyH, 10); ctx.fill();                     // 外壳
    var flashing = b.flash > 0 && Math.floor(b.flash * 10) % 2 === 0;
    ctx.strokeStyle = flashing ? PAL.limit : PAL.bodyEdge; ctx.lineWidth = flashing ? 4 : 2.6;
    rr(lx, bodyTop, bw, bodyH, 10); ctx.stroke();
    txt('条型测力计', cx, bodyTop + 16, PAL.text, 13, 'center');                              // 面板标题
    if (bw >= 84) txt('型号 J14003 · 量程 0~5N', cx, bodyTop + 32, PAL.sub, 9.5, 'center');    // 型号+量程
    else { txt('型号 J14003', cx, bodyTop + 30, PAL.sub, 8.5, 'center'); txt('量程 0~5N', cx, bodyTop + 41, PAL.sub, 8.5, 'center'); }
    var spY0 = bodyTop + (bw >= 84 ? 42 : 50);
    var sTop = bodyTop + bodyH * 0.46, sLen = bodyH * 0.46;                  // 双刻度 0.1N 分度
    var py = sTop + sLen * clamp(b.r, 0, RANGE) / RANGE;                     // 指针位（=弹簧下端）
    helix(cx, spY0, py - 6, 13, '#b9c5d1', 1.2, 9);                          // ⑭内弹簧：随指针拉伸下移
    ctx.fillStyle = 'rgba(255,255,255,.8)'; rr(cx - 14, sTop - 12, 28, sLen + 24, 5); ctx.fill(); // 刻度面板条
    txt('N', lx + 13, sTop - 9, PAL.sub, 10, 'center');
    txt('gf', rx - 15, sTop - 9, PAL.sub, 10, 'center');
    for (var i = 0; i <= 50; i++) {
      var y = sTop + sLen * i / 50, major = i % 10 === 0, mid = i % 5 === 0;
      ctx.strokeStyle = PAL.scale; ctx.lineWidth = major ? 1.8 : 1;
      var len = major ? 18 : (mid ? 12 : 7);
      ctx.beginPath(); ctx.moveTo(lx + 4, y); ctx.lineTo(lx + 4 + len, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx - 4, y); ctx.lineTo(rx - 4 - len, y); ctx.stroke();
      if (major) {
        txt(String(i / 10), lx + 25, y, i === 0 ? PAL.limit : PAL.scale, 11);
        txt(String(Math.round(i * 10.2)), rx - 25, y, i === 0 ? PAL.limit : PAL.scale, 10.5, 'right');   // z轮五2：gf 满量程 510（g=9.8）
      }
    }
    ctx.strokeStyle = PAL.limit; ctx.lineWidth = 2.4;                                          // 零刻度强调
    ctx.beginPath(); ctx.moveTo(lx + 4, sTop); ctx.lineTo(lx + 23, sTop); ctx.stroke();
    txt('分度值 0.1N / 10.2gf', cx, sTop + sLen + 13, PAL.sub, 9.5, 'center');
    var hookY = bodyTop + bodyH + (py - sTop);                                                 // ⑭底部挂钩：位移=伸长量
    ctx.strokeStyle = PAL.bodyEdge; ctx.lineWidth = 4; ctx.lineCap = 'round';                  // ⑭拉杆：弹簧下端→挂钩
    ctx.beginPath(); ctx.moveTo(cx, py - 6); ctx.lineTo(cx, hookY); ctx.stroke();
    ctx.strokeStyle = PAL.needle; ctx.lineWidth = 3.6;                                         // 指针（红）
    ctx.beginPath(); ctx.moveTo(lx + 4, py); ctx.lineTo(rx - 26, py); ctx.stroke();
    ctx.fillStyle = PAL.needle;
    ctx.beginPath(); ctx.moveTo(rx - 26, py); ctx.lineTo(rx - 36, py - 5.5);
    ctx.lineTo(rx - 36, py + 5.5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = PAL.bodyEdge; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx, hookY); ctx.lineTo(cx, hookY + 13);
    ctx.arc(cx + 6, hookY + 15, 6.5, Math.PI, 0, true); ctx.stroke();
    var wtop = hookY + 24, wbz = clamp(zy + zh - 26 - wtop, 3, Math.round(L.wb * 1.75));
    drawWeights(cx, wtop, S.n, wbz);
    if (S.annot) {                                                          // z7轮修4：fallback 六组件引线标注同受「标注」toggle 控制
      leader(cx + 11, ringY - 5, rx + 34, ringY + (zw < 300 ? 8 : -14), '吊环', 'left');          // 六组件引线标注
      leader(rx + 6, bodyTop + 9, rx + 34, bodyTop + 2, '调零螺丝', 'left');
      leader(cx + 12, (spY0 + py - 6) / 2, rx + 34, bodyTop + 54, '弹簧', 'left');
      leader(rx + 2, py + 6, rx + 34, py + 16, '指针(红)', 'left', PAL.needle);
      leader(lx - 4, sTop + sLen * 0.24, lx - 30, sTop + sLen * 0.24 - 8, '刻度(N/gf)', 'right');
      leader(cx - 7, hookY + 16, lx - 30, hookY + 10, '挂钩', 'right');
    }
    if (S.eye) drawZoomEye(rx, py, sTop, sLen, b.r);
    ctx.restore();
  }
  function drawZoomEye(faceX, py, sTop, sLen, r) {
    // ⑬刻度面=竖直壳边（屏幕坐标竖直）→ 法线=水平。正确：眼在刻度正前方同高处，水平视线⊥刻度面；
    //   错误：眼偏侧（下方），视线掠过指针尖端（standoff g）交刻度于偏高位置 → 错读值（视差）。
    //   z4 修5：两射线共焦点 tip=(faceX-g, py)（指针尖端），✗ 在 py 上方。
    var g = 8;
    var eyeX = Math.min(faceX + 96, L.zx + L.zw - 36);
    var eyeWY = Math.min(py + (L.zw < 300 ? 92 : 108), L.zy + L.zh - 58);
    var tipX = faceX - g, tipY = py;
    var hitY = py - g * (eyeWY - py) / (eyeX - faceX + g);
    var wrong = clamp(r + (py - hitY) / sLen * RANGE, 0, RANGE);
    ctx.save();
    ctx.setLineDash([4, 4]); ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(100,116,139,.55)';
    ctx.beginPath(); ctx.moveTo(faceX, sTop - 14); ctx.lineTo(faceX, sTop + sLen + 14); ctx.stroke();  // 刻度面（竖直）参考
    ctx.setLineDash([6, 4]); ctx.lineWidth = 1.9; ctx.strokeStyle = PAL.rest;
    ctx.beginPath(); ctx.moveTo(eyeX - 15, py); ctx.lineTo(tipX, tipY); ctx.lineTo(faceX, py); ctx.stroke();  // 正确视线：水平（沿法线），过 tip 交面于 py
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(faceX - 9, py); ctx.lineTo(faceX - 9, py - 9);
    ctx.lineTo(faceX, py - 9); ctx.stroke();                                              // ⊥直角标记（绿线交面处）
    ctx.strokeStyle = PAL.over; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(eyeX, eyeWY); ctx.lineTo(tipX, tipY); ctx.lineTo(faceX, hitY); ctx.stroke(); // 错误：斜视穿 tip 延长交面（py 上方）
    ctx.setLineDash([]); ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(faceX - 5, hitY - 5); ctx.lineTo(faceX + 5, hitY + 5);
    ctx.moveTo(faceX + 5, hitY - 5); ctx.lineTo(faceX - 5, hitY + 5); ctx.stroke();          // ✗ 错读点
    drawEye(eyeX, py, 30, PAL.rest);                                         // 眼在刻度正前方（sprite 朝左）
    drawEye(eyeX, eyeWY, 30, PAL.over);                                      // 眼偏侧
    txt('⊥正读 ' + clamp(r, 0, RANGE).toFixed(2) + 'N ✓', eyeX + 15, py - 19, PAL.rest, 10.5, 'right');
    txt('错读 ≈ ' + wrong.toFixed(2) + 'N ✗', eyeX + 15, eyeWY + 24, PAL.over, 10.5, 'right');
    ctx.restore();
  }

  /* ===== 主绘制 ===== */
  function draw() {
    drawGround();
    drawStand();
    if (S.mode === 'spring') drawSpringHang(); else drawBalanceHang();
    if (S.mode === 'spring' && !S.zoom) drawGraph();
    if (S.zoom && S.mode === 'balance') {
      var mb = meterBodyBox();                                             // z2 修3：放大时高亮场景本体（指示放大对象）
      ctx.save(); ctx.strokeStyle = 'rgba(37,99,235,.55)'; ctx.lineWidth = 2.4; ctx.setLineDash([5, 4]);
      rr(mb.x0 - 3, mb.y0 - 3, (mb.x1 - mb.x0) + 6, (mb.y1 - mb.y0) + 6, 8); ctx.stroke(); ctx.restore();
      drawZoom();
    }
    if (window.ForceOverlay) ForceOverlay.draw(ctx, { w: W, h: H });
  }

  /* ===== pointer 状态机（拖悬挂物：按压/拉伸 或 拉测力计钩） ===== */
  function inRect(p, r) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
  function onDown(ev) {
    var p = canvasXY(ev), hx = hangPt().x;
    if (S.zoom) {                                                          // z2 修3：modal 内「读数」切换观察眼 / 关闭
      if (inRect(p, ZBTN.read)) {
        S.eye = !S.eye; if (S.eye) pulse('eye'); sfx('Click');            // c7b-14：观察眼事件在此置位
        setHint(S.eye ? '眼在刻度正前方：视线⊥刻度面（沿法线）→ 正读；眼偏侧斜视 → 视差错读' : '');
        ev.preventDefault(); dirty = true; return;
      }
      if (inRect(p, ZBTN.close)) { S.zoom = false; S.eye = false; sfx('Click'); ev.preventDefault(); dirty = true; return; }
      return;
    }
    if (S.mode === 'spring') {
      var top = bottomY() - 26, bot = stackTopSp() + blockWH(S.n).h + 16;
      if (Math.abs(p.x - hx) < 40 && p.y >= top && p.y <= bot) {
        S.ps.mode = 'spdrag';
        if (cv.setPointerCapture && ev.pointerId != null) { try { cv.setPointerCapture(ev.pointerId); } catch (e) {} }
        setHint(mat().note + ' — 拖过红色限度线试试');
        ev.preventDefault(); dirty = true;
      }
    } else {
      var hk = balHookY(), btop = hk - 20, bbot = hk + 6 + blockWH(S.n).h + 18;
      if (Math.abs(p.x - hx) < 40 && p.y >= btop && p.y <= bbot) {
        S.ps.mode = 'bdrag'; S.bal.dragF = clamp(S.bal.r, 0, 8);
        if (cv.setPointerCapture && ev.pointerId != null) { try { cv.setPointerCapture(ev.pointerId); } catch (e) {} }
        setHint('下拉挂钩：读数=拉力；超过量程 5N，会损坏测力计');
        ev.preventDefault(); dirty = true;
      } else {
        var mb = meterBodyBox();                                           // z2 修3：点测力计本体 → 放大 modal
        if (p.x >= mb.x0 && p.x <= mb.x1 && p.y >= mb.y0 && p.y <= mb.y1) {
          S.zoom = true; pulse('zoomOpen'); BS.hasZoom = true; sfx('Click');   // z11修2：zoomOpen 脉冲（c7b-21 构造条；弹簧模式无 zoom 不置）；z13修2：hasZoom
          setHint('放大视图：吊环/外壳/刻度面板/弹簧/指针/拉杆/挂钩 — 点右上「读数」看视线');
          ev.preventDefault(); dirty = true;
        }
      }
    }
  }
  function onMove(ev) {
    var p = canvasXY(ev);
    if (S.ps.mode === 'spdrag') {
      S.sp.x = clamp((p.y - restY()) / L.PXCM, hardMinX(), hardMaxX()); S.sp.v = 0; dirty = true; ev.preventDefault();
      var dz = S.sp.x - steadyExt(S.n);
      if (dz > 0.05) { pulse('pull'); BS.hasPulled = true; if (BS.matPlastic) BS.hasPlasticTried = true; }   // z轮六4：下拉(c7b-02)事件；z13修2：hasPulled/hasPlasticTried
      else if (dz < -0.05) { pulse('press'); if (BS.matPlastic) BS.hasPlasticTried = true; }                // z轮六4：上压(c7b-03)事件；z13修2：hasPlasticTried
    } else if (S.ps.mode === 'bdrag') {
      S.bal.dragF = clamp((p.y - hookRestY()) / (L.PXCM * 0.7), 0, 8); dirty = true; ev.preventDefault();
    }
  }
  function onUp() {
    if (S.ps.mode === 'spdrag')
      setHint(S.sp.rest > 0.05 ? '超过弹性限度 → 永久变形：新静止基准线已下移' : '限度内 → 回弹到绿色基准线（弹性）');
    if (S.ps.mode === 'bdrag') { S.bal.dragF = -1; pulse('bdragRelease'); setHint('松手：指针回零'); }   // z轮五3+六4：c7b-11
    S.ps.mode = 'idle'; dirty = true;
  }

  /* ===== 砝码增减（z4 修3：质量档索引，步进 clamp 0..MAS.length-1） ===== */
  function setN(delta) {
    if (delta > 0) pulse('weightAdd');                                    // z轮六4：c7b-04（+按下即事件）
    var nn = clamp(S.n + delta, 0, MAS.length - 1);
    if (nn === S.n) { if (delta > 0) setHint('最大砝码 ' + MAS[MAS.length - 1] + 'g'); return; }
    S.n = nn; setText('lbl-w', wLabel());
    if (S.n > 0) BS.hasMassAdded = true;                                    // z13修2：加过砝码完成度（m>0 首次即置）
    if (S.mode === 'spring') {
      if (delta > 0) { S.curve.pending = true; }
      else { for (var k in S.curve.pts) if (+k > S.n) delete S.curve.pts[k]; S.curve.pending = false; }
      setHint('G = ' + (massG(S.n) / 1000).toFixed(3) + 'kg×9.8 = ' + forceOf(S.n).toFixed(2) + 'N — 曲线记录 ΔL（斜率=1/k，非 g）');
    } else {
      var G = forceOf(S.n);
      setHint(G > RANGE ? '红闪：G=' + G.toFixed(2) + 'N 超过量程 5N，会损坏测力计'
        : '读数 G = mg = ' + G.toFixed(2) + ' N（指针欠阻尼摆动）');
    }
    sfx('Click'); dirty = true;
  }
  function wLabel() { return S.n > 0 ? massG(S.n) + 'g' : '无'; }           // 控制组文案：砝码 − {m}g +（m=0 显「无」）

  /* ===== 控件 wiring ===== */
  function syncFullBtn() {                                                     // z轮六1：照搬 road-core——btn-full 文案 toggle + .back 随 fullscreenElement 隐/现
    var fs = !!document.fullscreenElement;
    var b = document.getElementById('btn-full');
    if (b) b.textContent = fs ? '退出全屏' : '全屏';
    var back = document.querySelector('.back');
    if (back) back.style.display = fs ? 'none' : '';
  }
  function wire() {
    function on(id, ev, fn) { var el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }
    ['pointerdown', 'keydown', 'wheel'].forEach(function (e) { window.addEventListener(e, markUser, true); });   // z13修3：任何用户动作归零 idle 计时
    on('btn-flat', 'click', function () { S.tilt.target = 0; BS.tilt = false; pulse('flat'); seg('btn-flat', true); seg('btn-tilt', false); sfx('Click'); setHint('铁架台回到水平桌面'); dirty = true; });   // z15修2：回水平清 tilt 电平
    on('btn-tilt', 'click', function () { S.tilt.target = 1; BS.tilt = true; seg('btn-flat', false); seg('btn-tilt', true); sfx('Click'); setHint('架倾斜，悬挂物仍世界竖直 → 重力方向竖直向下'); dirty = true; });   // z15修2：tilt 改电平（c7b-38 queue 续条须在 c7b-07 播完后仍判 tilt===true）
    on('btn-spring', 'click', function () {
      S.mode = 'spring'; S.zoom = false; S.eye = false;
      seg('btn-spring', true); seg('btn-balance', false);
      sfx('Click'); setHint('挂点：弹簧 — 拖悬挂物或换砝码看 ΔL'); dirty = true;
    });
    on('btn-balance', 'click', function () {
      S.mode = 'balance'; pulse('balanceEnter');                          // z5 修3：c7b-17 测力计入场解说
      BS.balanceEntered = true;                                           // z13修1：入场电平（reset 清；z14：续条已删，电平保留）
      seg('btn-spring', false); seg('btn-balance', true);
      sfx('Click'); setHint('挂点：测力计 — 点测力计本体放大，换砝码读 G=mg，可下拉挂钩'); dirty = true;
    });
    on('rng-mat', 'input', function (e) {
      S.mat = clamp(parseInt(e.target.value, 10) || 0, 0, 4);
      S.sp = { x: 0, v: 0, rest: 0, maxOver: 0 }; S.curve.pts = {}; S.curve.pending = false;
      pulse('material');                                                    // z轮六4：c7b-06
      BS.matPlastic = mat().p > 0; BS.hasMatChanged = true; BS.matName = mat().name;   // z13修1：塑性材质电平同步；z13修2：换过材质完成度；z15修1：材质名电平同步（c7b-26/27 双分支）
      setText('lbl-mat', mat().name); setHint(mat().note); dirty = true;
    });
    on('btn-w-minus', 'click', function () { setN(-1); });
    on('btn-w-plus', 'click', function () { setN(1); });
    on('btn-axis-f', 'click', function () { S.curve.axis = 'F'; seg('btn-axis-f', true); seg('btn-axis-m', false); sfx('Click'); dirty = true; });
    on('btn-axis-m', 'click', function () { S.curve.axis = 'm'; pulse('axisM'); BS.hasAxisM = true; seg('btn-axis-f', false); seg('btn-axis-m', true); sfx('Click'); setHint('横轴 m(kg)：斜率 = g/k（含 g）；横轴 F(N)：斜率 = 1/k'); dirty = true; });   // z13修2：hasAxisM
    on('btn-diagram', 'click', function () {
      S.diagram = !S.diagram;
      BS.diagram = S.diagram;                                                // z7轮修2：电平型 flag 随开关 true/false（c7b-18 触发源）
      if (window.ForceOverlay) ForceOverlay.setOn(S.diagram);
      seg('btn-diagram', S.diagram);
      setHint(S.diagram ? '力的示意图 ON：悬挂重物时画重力矢量（@重心 竖直向下）' : '力的示意图 OFF：全场景无矢量');
      sfx('Click'); dirty = true;
    });
    on('btn-reset', 'click', function () {
      S.n = 0; setText('lbl-w', wLabel());
      S.sp = { x: 0, v: 0, rest: 0, maxOver: 0 };
      S.bal = { r: 0, v: 0, flash: 0, dragF: -1 };
      S.curve.pts = {}; S.curve.pending = false;
      S.tilt.target = 0; S.zoom = false; S.eye = false;
      seg('btn-flat', true); seg('btn-tilt', false);
      if (window.ForceOverlay) ForceOverlay.clear();
      clearPulses();                                                         // z7轮：清 pulse 定时器表
      for (var bk in BS) BS[bk] = false;                                     // 事件标志归零（可重触发全部解说）
      BS.diagram = S.diagram;                                                // z7轮修2：电平型 diagram 不归零，随开关状态恢复
      BS.annot = S.annot;                                                    // z11修2：电平型 annot 同理（标注 toggle 状态不随 reset 翻转）
      BS.matPlastic = mat().p > 0;                                           // z13修1：电平型 matPlastic 随当前材质恢复（balanceEntered/has* 全清）
      BS.matName = mat().name;                                               // z15修1：电平型 matName 随当前材质恢复（blanket false 后复位）
      pulse('reset');                                                        // c7b-15：重置本身是事件（1.0s 后自动归零）
      if (window.GUIDE_RESET) window.GUIDE_RESET.all();                      // 接口契约3——页面重置后语音字幕全部从头
      setHint('已重置：拖悬挂物按压/拉伸，或换砝码'); sfx('Click'); dirty = true;
    });
    on('btn-annot', 'click', function () {                                   // z7轮修4：标注 toggle（缺省关；曲线面板不受控）
      S.annot = !S.annot;
      BS.annot = S.annot;                                                    // z11修2：电平型 flag 随开关（c7b-05/c7b-19 超限度双分支门槛）
      if (S.annot) BS.hasAnnotOn = true;                                     // z13修2：标注开过完成度（粘性，关不掉）
      seg('btn-annot', S.annot);
      setHint(S.annot ? '标注 ON：基准线/弹性限度线/ΔL/放大图引线标注全部显示' : '标注 OFF：纯净场景，仅器材与读数');
      sfx('Click'); dirty = true;
    });
    on('btn-mute', 'click', function () {
      S.muted = !S.muted; var b = document.getElementById('btn-mute');
      if (b) { b.classList.toggle('on', !S.muted); b.textContent = S.muted ? '🔇' : '🔊'; }
    });
    on('btn-full', 'click', function () {
      var el = document.documentElement;
      if (!document.fullscreenElement) { if (el.requestFullscreen) el.requestFullscreen(); }
      else if (document.exitFullscreen) document.exitFullscreen();
    });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (e) { document.addEventListener(e, function () { syncFullBtn(); setTimeout(resize, 60); }); });

    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (e) { cv.addEventListener(e, onUp); });
    window.addEventListener('resize', resize);
  }

  /* ===== init ===== */
  wire();
  if (window.ForceOverlay) ForceOverlay.setOn(false);
  syncFullBtn();
  seg('btn-spring', true); seg('btn-flat', true); seg('btn-axis-f', true);
  setText('lbl-mat', MATS[0].name); setText('lbl-w', wLabel());
  resize();
  requestAnimationFrame(tick);
})();

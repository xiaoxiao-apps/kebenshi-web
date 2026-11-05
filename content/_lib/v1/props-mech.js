(function(global){
'use strict';
const PROPS = global.PROPS = global.PROPS || {};
const rand = PROPS.rand || function(seed){
  const s = Math.sin(seed * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

/* ============================================================
 * props-mech.js — 第七章「力」力学器材标准件 v1（2026-11-04，c7 单A，16件；2026-11-06 C7V2-D1 增补 glass_bottle_tube=17件）
 * 约定同 props-optics/props-density：IIFE 挂 global.PROPS；(x,y)=底面中心锚点
 * （吊挂件=底钩锚点向上画；旋转件=中心锚点）；有挂载点的件返回几何含 mounts:{锚名:{x,y}}（世界坐标）。
 * 视觉全原创（PhET masses-and-springs 仅借交互语义：圈距线性变疏/柱高∝质量档/顶钩底钩 snap）。
 * 件清单：plasticine / hand_press / spring_horizontal / spring_vertical / bar_magnet /
 *   iron_ball / ball_track_table / door / magnet_cart / spring_meter / hook_weight /
 *   ruler_flex / rubber_band / plumb_line / earth_globe / person_pin / glass_bottle_tube(C7V2-D1)
 * ============================================================ */

// MECH_IDS: 本文件件名清单（gallery 与下游 B 单索引用）
PROPS.MECH_IDS = ['plasticine','hand_press','spring_horizontal','spring_vertical','bar_magnet','iron_ball','ball_track_table','door','magnet_cart','spring_meter','hook_weight','ruler_flex','rubber_band','plumb_line','earth_globe','person_pin','glass_bottle_tube'];

// plasticine: 橡皮泥（橙色圆饼）。(x,y)=底面中心；opt.size 默认70；opt.press 0-1 → 顶面凹陷深度+宽度摊开联动
// 松手是否复原由调用页决定（件只按 opt.press 画）。返回 {w,h,tip:{x,y}}（tip=凹陷底中心）
PROPS.plasticine = function(ctx, x, y, opt){
  opt = opt || {};
  const s = opt.size || 70;
  const p = Math.max(0, Math.min(1, opt.press || 0));
  const a = s * (0.46 + 0.20 * p);   // 半宽（按压摊开）
  const h = s * (0.46 - 0.18 * p);   // 总高（按压变矮）
  const dentD = s * 0.20 * p;        // 凹陷深度
  const dentW = s * 0.30 * p;        // 凹陷半宽
  ctx.save();
  const g = ctx.createRadialGradient(x - a * 0.4, y - h * 1.1, s * 0.1, x, y - h * 0.4, a * 1.7);
  g.addColorStop(0, '#f5a25d'); g.addColorStop(0.6, '#ef8c3a'); g.addColorStop(1, '#c96f26');
  ctx.fillStyle = g;
  ctx.strokeStyle = 'rgba(150,80,25,0.7)'; ctx.lineWidth = Math.max(1.2, s * 0.02);
  ctx.beginPath();
  ctx.moveTo(x - a, y);
  ctx.bezierCurveTo(x - a, y - h * 1.3, x - a * 0.55, y - h - dentD * 0.15, x - dentW, y - h);
  ctx.bezierCurveTo(x - dentW * 0.4, y - h + dentD, x + dentW * 0.4, y - h + dentD, x + dentW, y - h);
  ctx.bezierCurveTo(x + a * 0.55, y - h - dentD * 0.15, x + a, y - h * 1.3, x + a, y);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // 左上高光弧
  ctx.strokeStyle = 'rgba(255,235,205,0.5)'; ctx.lineWidth = Math.max(2, s * 0.05); ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.ellipse(x - a * 0.38, y - h * 0.52, a * 0.28, h * 0.34, -0.4, Math.PI * 0.9, Math.PI * 1.7);
  ctx.stroke();
  ctx.restore();
  return {w: 2 * a, h: h, tip: {x: x, y: y - h + dentD}};
};

// hand_press: 手指按压 sprite（sprites/hand_press.png，指尖在图底中央）。(x,y)=指尖；opt.angle 旋转度（绕指尖）；opt.h/opt.w/opt.scale 尺寸（默认显示高140）
// 返回 {w,h,tip:{x,y}}（sprite 未就绪返回 0 尺寸+虚线占位框）
PROPS.hand_press = function(ctx, x, y, opt){
  opt = opt || {};
  const id = 'hand_press';
  const a = (opt.angle || 0) * Math.PI / 180;
  ctx.save(); ctx.translate(x, y);
  if (a) ctx.rotate(a);
  if (!PROPS.spriteReady(id)) {
    const w = opt.h || 140;
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
    ctx.strokeRect(-w / 2, -w, w, w);
    ctx.setLineDash([]);
    ctx.restore();
    return {w: 0, h: 0, tip: {x: x, y: y}};
  }
  const img = PROPS.img(id);
  let s;
  if (opt.h) s = opt.h / img.naturalHeight;
  else if (opt.w) s = opt.w / img.naturalWidth;
  else s = opt.scale || 140 / img.naturalHeight;
  const w = img.naturalWidth * s, h = img.naturalHeight * s;
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
  return {w: w, h: h, tip: {x: x, y: y}};
};

// spring_horizontal: 水平弹簧（左端灰立柱+底座固定支架，圈距随拉伸线性变化，右端拉环）。(x,y)=支架底座底中心
// opt.stretch -1..1（负=压缩）；opt.len 自然长默认130；opt.h 支架高默认70
// 返回 {axisY,end:{x,y},ring:{x,y}}（end=弹簧右端锚点，ring=拉环圆心，页面连力/挂物用）
PROPS.spring_horizontal = function(ctx, x, y, opt){
  opt = opt || {};
  const h = opt.h || 70;
  const L0 = opt.len || 130;
  const st = Math.max(-1, Math.min(1, opt.stretch || 0));
  const axisY = y - h * 0.62;
  const baseW = h * 0.9, postW = Math.max(8, h * 0.16);
  const x0 = x + postW / 2 + 4;               // 弹簧起点（立柱右侧）
  const L = L0 * (1 + 0.6 * st);              // 当前长（圈距线性）
  const x1 = x0 + L;                          // 弹簧右端
  ctx.save();
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1.2;
  // 底座
  ctx.fillStyle = '#9aa1ab';
  ctx.beginPath(); ctx.roundRect(x - baseW / 2, y - 8, baseW, 8, 2); ctx.fill(); ctx.stroke();
  // 立柱
  ctx.fillStyle = '#b6bcc6';
  ctx.beginPath(); ctx.roundRect(x - postW / 2, axisY - h * 0.20, postW, (y - 8) - (axisY - h * 0.20), 2); ctx.fill(); ctx.stroke();
  // 螺旋圈（正弦，圈距随 L 线性）
  const coils = 9, r = h * 0.20, lead = 8;
  ctx.strokeStyle = '#5b6068'; ctx.lineWidth = Math.max(2, h * 0.035); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, axisY);
  const N = 72;
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    ctx.lineTo(x0 + lead + (L - lead * 2) * t, axisY - r * Math.sin(t * coils * Math.PI * 2));
  }
  ctx.lineTo(x1, axisY);
  ctx.stroke();
  // 右端拉环
  ctx.strokeStyle = '#4b5563'; ctx.lineWidth = Math.max(2, h * 0.03);
  ctx.beginPath(); ctx.arc(x1 + 7, axisY, 7, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  return {axisY: axisY, end: {x: x1, y: axisY}, ring: {x: x1 + 7, y: axisY}};
};

// spring_vertical: 竖直弹簧（螺旋10圈、圈距随 opt.stretch 0..1 线性变疏；顶端挂环=固定锚、底端小钩=挂载锚）。灰黑金属线（原创配色，勿抄 PhET）。
// (x,y)=底钩锚点（向上画，顶挂环圆心=y-h+ringR）。opt.h 自然总高默认170；弹簧段长×(1+0.45*stretch)
// 返回 {h,top:{x,y},hook:{x,y},mounts:{hook:{x,y}}}（top=顶挂环圆心；hook 语义=挂 hook_weight 顶钩的 snap 点）
PROPS.spring_vertical = function(ctx, x, y, opt){
  opt = opt || {};
  const H0 = opt.h || 170;
  const st = Math.max(0, Math.min(1, opt.stretch || 0));
  const r = Math.max(8, H0 * 0.085);            // 螺旋半径
  const ringR = Math.max(4, H0 * 0.028);        // 顶挂环半径
  const hookL = H0 * 0.10;                      // 底钩段高
  const coil0 = H0 - hookL - ringR * 2 - 4;     // 自然弹簧段长
  const coilLen = coil0 * (1 + 0.45 * st);      // 圈距线性变疏
  const H = coilLen + hookL + ringR * 2 + 4;
  const topY = y - H;
  ctx.save();
  ctx.strokeStyle = '#5b6068'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // 顶挂环
  ctx.lineWidth = Math.max(2, H0 * 0.018);
  ctx.beginPath(); ctx.arc(x, topY + ringR, ringR, 0, Math.PI * 2); ctx.stroke();
  // 螺旋 10 圈
  const coils = 10, cy0 = topY + ringR * 2 + 2;
  ctx.lineWidth = Math.max(2.2, H0 * 0.022);
  ctx.beginPath();
  ctx.moveTo(x, topY + ringR * 2);
  const N = 120;
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    ctx.lineTo(x + r * Math.sin(t * coils * Math.PI * 2), cy0 + coilLen * t);
  }
  ctx.stroke();
  // 底端小钩：竖直短茎 + 钩弧
  const stemTop = cy0 + coilLen;
  ctx.beginPath(); ctx.moveTo(x, stemTop); ctx.lineTo(x, y - hookL * 0.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + hookL * 0.24, y - hookL * 0.30, hookL * 0.32, Math.PI * 0.75, Math.PI * 2.05); ctx.stroke();
  ctx.restore();
  return {h: H, top: {x: x, y: topY + ringR}, hook: {x: x, y: y}, mounts: {hook: {x: x, y: y}}};
};

// bar_magnet: 条形磁体（左半蓝S/右半红N；opt.label=true 白字N/S；opt.angle 旋转度）。(x,y)=中心
// opt.w 默认96（h=w*0.32）。返回 {w,h,angle,poles:{N:{x,y},S:{x,y}}}（磁极为旋转后世界坐标）
PROPS.bar_magnet = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 96, h = opt.h || w * 0.32;
  const a = (opt.angle || 0) * Math.PI / 180;
  ctx.save(); ctx.translate(x, y);
  if (a) ctx.rotate(a);
  ctx.lineWidth = Math.max(1, h * 0.05); ctx.strokeStyle = '#3f4650';
  // S 半（蓝，左）
  ctx.fillStyle = '#4267c9';
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w / 2, h, [h * 0.18, 0, 0, h * 0.18]); ctx.fill(); ctx.stroke();
  // N 半（红，右）
  ctx.fillStyle = '#cf4a43';
  ctx.beginPath(); ctx.roundRect(0, -h / 2, w / 2, h, [0, h * 0.18, h * 0.18, 0]); ctx.fill(); ctx.stroke();
  // 顶面高光条
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(-w / 2 + 3, -h / 2 + 2.5, w - 6, h * 0.20);
  if (opt.label) {
    ctx.fillStyle = '#fff'; ctx.font = 'bold ' + Math.round(h * 0.56) + 'px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('S', -w / 4, 1); ctx.fillText('N', w / 4, 1);
  }
  ctx.restore();
  const cs = Math.cos(a), sn = Math.sin(a);
  function rot(lx, ly){ return {x: x + lx * cs - ly * sn, y: y + lx * sn + ly * cs}; }
  return {w: w, h: h, angle: opt.angle || 0, poles: {N: rot(w / 2 - 2, 0), S: rot(-w / 2 + 2, 0)}};
};

// iron_ball: 小铁球（银灰球+高光）。(x,y)=球底点；opt.r 半径默认16
// 返回 {r,center:{x,y}}
PROPS.iron_ball = function(ctx, x, y, opt){
  opt = opt || {};
  const r = opt.r || 16;
  const cy = y - r;
  ctx.save();
  const g = ctx.createRadialGradient(x - r * 0.35, cy - r * 0.4, r * 0.15, x, cy, r * 1.15);
  g.addColorStop(0, '#e8ecf1'); g.addColorStop(0.5, '#aab3bd'); g.addColorStop(1, '#5f6a76');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(60,68,78,0.8)'; ctx.lineWidth = Math.max(1, r * 0.06); ctx.stroke();
  // 高光斑
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath(); ctx.ellipse(x - r * 0.38, cy - r * 0.45, r * 0.20, r * 0.11, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  return {r: r, center: {x: x, y: cy}};
};

// ball_track_table: 木框浅蓝桌面舞台（木色边框+浅蓝台面+左上斜面槽=球滚下入口）。(x,y)=整件底边中心
// opt.w 默认460、opt.h 默认150。返回 {w,h,top:{l,t,r,b},ramp:{x0,y0,x1,y1}}
// top=台面内矩形世界坐标（页面轨迹计算用）；ramp=斜面槽上缘起点/终点
PROPS.ball_track_table = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 460, h = opt.h || 150;
  const l = x - w / 2, t = y - h, fw = Math.max(8, w * 0.028);
  const il = l + fw, it = t + fw, ir = l + w - fw, ib = y - fw;
  ctx.save();
  // 木框
  const gw = ctx.createLinearGradient(l, t, l, y);
  gw.addColorStop(0, '#c99a5e'); gw.addColorStop(1, '#a57842');
  ctx.fillStyle = gw; ctx.strokeStyle = '#7c5a30'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(l, t, w, h, fw * 0.5); ctx.fill(); ctx.stroke();
  // 浅蓝台面
  const gb = ctx.createLinearGradient(0, it, 0, ib);
  gb.addColorStop(0, '#dceefb'); gb.addColorStop(1, '#bcdcf2');
  ctx.fillStyle = gb;
  ctx.beginPath(); ctx.roundRect(il, it, ir - il, ib - it, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(120,150,175,0.6)'; ctx.lineWidth = 1; ctx.stroke();
  // 左上斜面槽：槽面（浅色带）+ 上下两条轨线（入口左上、出口接台面右下）
  const rx0 = il + (ir - il) * 0.04, ry0 = it + (ib - it) * 0.08;
  const rx1 = il + (ir - il) * 0.42, ry1 = ib - (ib - it) * 0.08;
  const rd = h * 0.10; // 槽带宽（竖直方向）
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.beginPath(); ctx.moveTo(rx0, ry0); ctx.lineTo(rx1, ry1); ctx.lineTo(rx1, ry1 + rd * 0.5); ctx.lineTo(rx0, ry0 + rd); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8fb4cf'; ctx.lineWidth = Math.max(2, h * 0.02); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(rx0, ry0); ctx.lineTo(rx1, ry1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rx0, ry0 + rd); ctx.lineTo(rx1, ry1 + rd * 0.5); ctx.stroke();
  ctx.restore();
  return {w: w, h: h, top: {l: il, t: it, r: ir, b: ib}, ramp: {x0: rx0, y0: ry0, x1: rx1, y1: ry1}};
};

// door: 门（门框+合页侧左+门板）。(x,y)=门框开口底边中心；opt.w 默认150、opt.h 默认230
// opt.open 0-1 开门角（透视窄化+远缘微抬）；opt.pointMark 0-1 → 门板黑点作用点（离轴距离=pointMark×板宽；undefined 不画点但仍返回坐标）
// 返回 {w,h,panelW,hinge:{x,y},point:{x,y}}（hinge=合页轴心，point=作用点，E2 三要素箭头起点用）
PROPS.door = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 150, h = opt.h || 230;
  const op = Math.max(0, Math.min(1, opt.open || 0));
  const pm = Math.max(0, Math.min(1, opt.pointMark === undefined ? 0.75 : opt.pointMark));
  const l = x - w / 2, t = y - h;
  const jamb = Math.max(8, w * 0.09);
  const innerL = l + jamb, innerW = w - jamb * 2;
  const panelW = innerW * (1 - 0.72 * op);  // 透视窄化
  const skew = op * h * 0.045;              // 远缘微抬
  const pT = t + jamb, pB = y;
  ctx.save();
  // 门框（左右立柱+上槛）
  ctx.fillStyle = '#a5825a'; ctx.strokeStyle = '#75593a'; ctx.lineWidth = 1.4;
  ctx.fillRect(l, t, jamb, h); ctx.strokeRect(l, t, jamb, h);
  ctx.fillRect(l + w - jamb, t, jamb, h); ctx.strokeRect(l + w - jamb, t, jamb, h);
  ctx.fillRect(l, t, w, jamb); ctx.strokeRect(l, t, w, jamb);
  // 门板（合页侧=左柱内缘）
  ctx.fillStyle = '#d9b98c';
  ctx.beginPath();
  ctx.moveTo(innerL, pT);
  ctx.lineTo(innerL + panelW, pT - skew);
  ctx.lineTo(innerL + panelW, pB - skew * 0.4);
  ctx.lineTo(innerL, pB);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8a6a45'; ctx.stroke();
  // 门板装饰内框
  const ins = Math.min(panelW * 0.18, h * 0.055);
  ctx.strokeStyle = 'rgba(138,106,69,0.65)'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(innerL + ins, pT + ins);
  ctx.lineTo(innerL + panelW - ins, pT + ins - skew * 0.8);
  ctx.lineTo(innerL + panelW - ins, pB - ins - skew * 0.3);
  ctx.lineTo(innerL + ins, pB - ins);
  ctx.closePath(); ctx.stroke();
  // 合页三枚（左柱内缘）
  ctx.fillStyle = '#6b7280';
  for (let i = 0; i < 3; i++) {
    const hy = pT + (pB - pT) * (0.14 + i * 0.34);
    ctx.fillRect(innerL - 3, hy, 7, Math.max(8, h * 0.05));
  }
  // 作用点黑标记
  const ptX = innerL + panelW * pm;
  const ptY = (pT + pB) / 2 - skew * (pm * 0.8);
  if (opt.pointMark !== undefined) {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(ptX, ptY, Math.max(3.5, w * 0.028), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  return {w: w, h: h, panelW: panelW, hinge: {x: innerL, y: (pT + pB) / 2}, point: {x: ptX, y: ptY}};
};

// magnet_cart: 磁车（木色平板车+四轮+顶面磁体插槽）。(x,y)=轮底中心；opt.w 默认150；opt.dir='left' 车头朝左（默认朝右）
// 返回 {w,h,deck:{x,y},head:{x,y},mounts:{magnet:{x,y}}}（magnet=插槽中心世界坐标，语义=放 bar_magnet 的 snap 点）
PROPS.magnet_cart = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 150;
  const dir = (opt.dir === 'left' || opt.dir === -1) ? -1 : 1;
  const wheelR = Math.max(7, w * 0.055);
  const deckT = Math.max(9, w * 0.085);
  const deckY = y - wheelR * 2 - deckT;   // 床板顶面
  const l = x - w / 2;
  const slotW = w * 0.52, slotD = deckT * 0.42;
  ctx.save();
  // 床板（木色）
  const g = ctx.createLinearGradient(0, deckY, 0, deckY + deckT);
  g.addColorStop(0, '#d8ab74'); g.addColorStop(1, '#b5844e');
  ctx.fillStyle = g; ctx.strokeStyle = '#7c5a30'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.roundRect(l, deckY, w, deckT, 3); ctx.fill(); ctx.stroke();
  // 车头标记（dir 端小深色斜面）
  ctx.fillStyle = '#9a6b3c';
  ctx.beginPath();
  ctx.moveTo(x + dir * w / 2, deckY + 2);
  ctx.lineTo(x + dir * (w / 2 - w * 0.07), deckY + 2);
  ctx.lineTo(x + dir * w / 2, deckY + deckT - 2);
  ctx.closePath(); ctx.fill();
  // 顶面磁体插槽（凹槽，画在床板顶）
  ctx.fillStyle = '#8a6238';
  ctx.fillRect(x - slotW / 2, deckY + 1, slotW, slotD);
  ctx.strokeStyle = 'rgba(90,62,32,0.9)'; ctx.lineWidth = 1;
  ctx.strokeRect(x - slotW / 2, deckY + 1, slotW, slotD);
  // 四轮（侧面视角沿底排四只）
  const wxs = [-0.36, -0.13, 0.13, 0.36];
  for (let i = 0; i < 4; i++) {
    const wx = x + w * wxs[i];
    ctx.fillStyle = '#4b5563'; ctx.strokeStyle = '#313844'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(wx, y - wheelR, wheelR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9aa1ab';
    ctx.beginPath(); ctx.arc(wx, y - wheelR, wheelR * 0.38, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  return {w: w, h: wheelR * 2 + deckT, deck: {x: x, y: deckY}, head: {x: x + dir * w / 2, y: deckY + deckT / 2}, mounts: {magnet: {x: x, y: deckY}}};
};

// spring_meter: 弹簧测力计（0-5N 刻度面板：主刻度1.0..5.0+0.2小格、指针、顶环、底挂钩；内部弹簧伸长与读数联动）。
// (x,y)=底挂钩锚点（竖直态向上画；orientation:'h' 水平态=绕锚点旋转，顶环在左、挂钩在右）。
// opt.reading 0-5 → 指针位+弹簧伸长；opt.h 总长默认230；面板浅色原创。
// 返回 {w,h,top:{x,y},hook:{x,y},reading:{x,y},mounts:{hook:{x,y}}}（top=顶环圆心；hook=挂钩snap点(挂hook_weight)；reading=指针尖世界坐标）
PROPS.spring_meter = function(ctx, x, y, opt){
  opt = opt || {};
  const H = opt.h || 230;
  const rd = Math.max(0, Math.min(5, opt.reading || 0));
  const horiz = opt.orientation === 'h';
  // 局部坐标：锚(0,0)=挂钩底，向上为负
  const bw = H * 0.21;                 // 壳体宽
  const hookL = H * 0.09;
  const bodyB = -hookL, bodyT = -H * 0.86;
  const ringR = H * 0.036, ringCY = -H + ringR * 0.9;
  const winT = bodyT + H * 0.055, winB = bodyB - H * 0.05;
  const winL = -bw * 0.30, winR = bw * 0.30;
  function ptrY(v){ return winT + (winB - winT) * (v / 5); }
  const pY = ptrY(rd);
  ctx.save(); ctx.translate(x, y);
  if (horiz) ctx.rotate(-Math.PI / 2);
  ctx.lineCap = 'round';
  // 顶环 + 短茎
  ctx.strokeStyle = '#5b6068'; ctx.lineWidth = Math.max(2, H * 0.016);
  ctx.beginPath(); ctx.arc(0, ringCY, ringR, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, ringCY + ringR); ctx.lineTo(0, bodyT); ctx.stroke();
  // 壳体（浅色面板）
  const gb = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
  gb.addColorStop(0, '#f4eeda'); gb.addColorStop(0.5, '#fbf7ea'); gb.addColorStop(1, '#e7dfc6');
  ctx.fillStyle = gb; ctx.strokeStyle = '#8a8266'; ctx.lineWidth = Math.max(1.4, H * 0.008);
  ctx.beginPath(); ctx.roundRect(-bw / 2, bodyT, bw, bodyB - bodyT, bw * 0.22); ctx.fill(); ctx.stroke();
  // 刻度窗（白底）
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#b7ae92'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(winL, winT, winR - winL, winB - winT, 3); ctx.fill(); ctx.stroke();
  // 内部弹簧（窗顶→指针，圈距随读数变疏=伸长联动）
  const coils = 7, sw = (winR - winL) * 0.26;
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = Math.max(1.6, H * 0.009);
  ctx.beginPath(); ctx.moveTo(0, winT + 2);
  const N = 60;
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    ctx.lineTo(sw * Math.sin(t * coils * Math.PI * 2), winT + 2 + (pY - winT - 4) * t);
  }
  ctx.stroke();
  // 刻度：主刻度 0..5 每 1N（数字标签）+ 小格每 0.2N；刻度线在窗右缘，0 上 5 下
  ctx.strokeStyle = '#3f4650'; ctx.fillStyle = '#3f4650';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  const fs = Math.max(8, H * 0.042);
  ctx.font = fs + 'px sans-serif';
  for (let v = 0; v <= 5.0001; v += 0.2) {
    const ty = ptrY(v);
    const major = Math.abs(v - Math.round(v)) < 0.01;
    ctx.lineWidth = major ? 1.6 : 0.9;
    ctx.beginPath();
    ctx.moveTo(winR - 2, ty);
    ctx.lineTo(winR - 2 - (major ? (winR - winL) * 0.30 : (winR - winL) * 0.15), ty);
    ctx.stroke();
    if (major) ctx.fillText(v.toFixed(1), winL + (winR - winL) * 0.52, ty);
  }
  // 单位 N（窗顶上方壳面）
  ctx.textAlign = 'center';
  ctx.font = 'bold ' + Math.round(fs * 1.05) + 'px sans-serif';
  ctx.fillText('N', 0, bodyT + H * 0.028);
  // 指针（红三角+横线，指窗右缘刻度）
  ctx.fillStyle = '#d64545'; ctx.strokeStyle = '#d64545'; ctx.lineWidth = Math.max(1.6, H * 0.008);
  ctx.beginPath(); ctx.moveTo(winL + 1, pY); ctx.lineTo(winR - 1, pY); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(winR - 1, pY);
  ctx.lineTo(winR - 1 - (winR - winL) * 0.16, pY - (winR - winL) * 0.07);
  ctx.lineTo(winR - 1 - (winR - winL) * 0.16, pY + (winR - winL) * 0.07);
  ctx.closePath(); ctx.fill();
  // 底挂钩：茎+钩弧
  ctx.strokeStyle = '#5b6068'; ctx.lineWidth = Math.max(2, H * 0.014);
  ctx.beginPath(); ctx.moveTo(0, bodyB); ctx.lineTo(0, -hookL * 0.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(hookL * 0.26, -hookL * 0.30, hookL * 0.34, Math.PI * 0.75, Math.PI * 2.05); ctx.stroke();
  ctx.restore();
  // 世界坐标锚点（水平态=绕锚点 -90° 旋转：局部(lx,ly)→世界(x+ly, y-lx)）
  function W(lx, ly){ return horiz ? {x: x + ly, y: y - lx} : {x: x + lx, y: y + ly}; }
  return {
    w: horiz ? H : bw, h: horiz ? bw : H,
    top: W(0, ringCY - ringR),
    hook: W(0, 0),
    reading: W(winR, pY),
    mounts: {hook: W(0, 0)}
  };
};

// hook_weight: 钩码（金属圆柱+顶钩；柱高/直径∝质量档，质量印柱面）。(x,y)=底面中心
// opt.g 克数默认100（50/100/250 或自定义数 → 尺寸线性档）；顶钩与 spring_meter/spring_vertical 底钩 snap 由调用页对齐锚点
// weightGeom 单源导出（同 props-density weightGeom 惯例，页面命中/叠挂计算用）
// 返回 {w,h,hook:{x,y},g}（hook=顶钩锚点世界坐标）
function weightGeomOf(g){
  const w = Math.max(18, 16 + g * 0.072);   // 250g→34px
  const h = Math.max(22, 16 + g * 0.16);    // 250g→56px
  return {w: w, h: h};
}
PROPS.weightGeom = PROPS.weightGeom || weightGeomOf;
PROPS.hook_weight = function(ctx, x, y, opt){
  opt = opt || {};
  const g = opt.g === undefined ? 100 : opt.g;
  const G = weightGeomOf(g);
  const w = G.w, h = G.h;
  const hookH = Math.max(8, h * 0.22);      // 顶钩段高
  const l = x - w / 2, t = y - h;
  ctx.save();
  // 顶钩（弧+短茎）
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = Math.max(2, w * 0.09); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, t); ctx.lineTo(x, t - hookH * 0.45); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, t - hookH * 0.45 - hookH * 0.28, hookH * 0.28, Math.PI * 0.15, Math.PI * 1.55); ctx.stroke();
  // 圆柱身（金属灰渐变）
  const gm = ctx.createLinearGradient(l, 0, l + w, 0);
  gm.addColorStop(0, '#8f979f'); gm.addColorStop(0.45, '#d6dade'); gm.addColorStop(1, '#7e868e');
  ctx.fillStyle = gm; ctx.strokeStyle = '#5b6068'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(l, t, w, h, Math.min(4, w * 0.12)); ctx.fill(); ctx.stroke();
  // 顶/底椭圆盖（2.5D 圆柱感）
  const ry = Math.min(w * 0.14, h * 0.10);
  ctx.fillStyle = '#e2e6ea';
  ctx.beginPath(); ctx.ellipse(x, t + ry * 0.5, w / 2, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5b6068'; ctx.stroke();
  // 质量印字（如 250 g）
  ctx.fillStyle = '#3f4650';
  ctx.font = 'bold ' + Math.max(9, Math.min(h * 0.26, w * 0.30)) + 'px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(g + ' g', x, t + h * 0.58);
  ctx.restore();
  return {w: w, h: h + hookH, hook: {x: x, y: t - hookH * 0.73 - hookH * 0.28}, g: g};
};

// ruler_flex: 直尺（米色长尺+刻度线；opt.bend -1..1 → 尺身二次曲线弯曲，左端固定夹示意）。(x,y)=左端底（夹持位）
// opt.len 默认150、opt.th 默认13。返回 {len,bend,tip:{x,y},ctrl:{x,y}}（tip=右端世界坐标；ctrl=二次曲线控制点，页面画力箭头参考）
PROPS.ruler_flex = function(ctx, x, y, opt){
  opt = opt || {};
  const L = opt.len || 150, th = opt.th || 13;
  const b = Math.max(-1, Math.min(1, opt.bend || 0));
  const cyOff = -b * L * 0.28;             // 右端竖向偏移（b>0=向下弯）
  const ctrlY = y - th / 2 + cyOff * 2;    // 二次控制点（中线）
  function bez(t, y0, yc, y1){ const u = 1 - t; return u * u * y0 + 2 * u * t * yc + t * t * y1; }
  const yTop0 = y - th, yMid = y - th / 2;
  ctx.save();
  // 尺身（上下两条二次曲线围成弯曲长条）
  ctx.beginPath();
  ctx.moveTo(x, yMid - th / 2);
  ctx.quadraticCurveTo(x + L / 2, ctrlY - th / 2, x + L, yMid + cyOff - th / 2);
  ctx.lineTo(x + L, yMid + cyOff + th / 2);
  ctx.quadraticCurveTo(x + L / 2, ctrlY + th / 2, x, yMid + th / 2);
  ctx.closePath();
  const gr = ctx.createLinearGradient(0, y - th, 0, y + cyOff);
  gr.addColorStop(0, '#f6edd8'); gr.addColorStop(1, '#e3d4ae');
  ctx.fillStyle = gr; ctx.fill();
  ctx.strokeStyle = '#a08c5c'; ctx.lineWidth = 1.2; ctx.stroke();
  // 刻度线+数字（沿中线采样）
  ctx.strokeStyle = '#6b5b33'; ctx.fillStyle = '#6b5b33';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = Math.max(7, th * 0.55) + 'px sans-serif';
  const cmN = 10;
  for (let i = 0; i <= cmN * 2; i++) {
    const t = i / (cmN * 2);
    const px2 = x + L * t;
    const py2 = bez(t, yMid, ctrlY, yMid + cyOff);
    const major = i % 2 === 0;
    const tl = th * (major ? 0.5 : 0.28);
    ctx.lineWidth = major ? 1.2 : 0.8;
    ctx.beginPath(); ctx.moveTo(px2, py2 - th / 2 + 1); ctx.lineTo(px2, py2 - th / 2 + 1 + tl); ctx.stroke();
    if (major && i > 0 && i < cmN * 2) ctx.fillText(String(i / 2), px2, py2 - th * 0.18);
  }
  // 左端固定夹（灰色夹块）
  ctx.fillStyle = '#9aa1ab'; ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(x - th * 0.5, y - th * 1.5, th * 1.1, th * 1.9, 2); ctx.fill(); ctx.stroke();
  ctx.restore();
  return {len: L, bend: b, tip: {x: x + L, y: yMid + cyOff}, ctrl: {x: x + L / 2, y: ctrlY}};
};

// rubber_band: 橡皮筋（褐色环带；opt.stretch 0..1 → 环拉长变细）。(x,y)=环中心
// opt.w 自然环宽默认80。返回 {w,h}（当前环外廓宽高）
PROPS.rubber_band = function(ctx, x, y, opt){
  opt = opt || {};
  const st = Math.max(0, Math.min(1, opt.stretch || 0));
  const w0 = opt.w || 80;
  const w = w0 * (1 + 0.9 * st);          // 拉长
  const h = w0 * 0.42 * (1 - 0.45 * st);  // 变窄
  const band = Math.max(2.5, w0 * 0.085 * (1 - 0.5 * st)); // 带厚变细
  ctx.save();
  ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = band; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(x, y, w / 2 - band / 2, h / 2 - band / 2, 0, 0, Math.PI * 2); ctx.stroke();
  // 高光细弧（带上缘）
  ctx.strokeStyle = 'rgba(220,180,140,0.55)'; ctx.lineWidth = Math.max(1, band * 0.3);
  ctx.beginPath(); ctx.ellipse(x, y, w / 2 - band / 2, h / 2 - band / 2, 0, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  ctx.restore();
  return {w: w, h: h};
};

// plumb_line: 铅垂线（顶吸盘+细线+锥形铅锤）。(x,y)=吸盘中心（顶锚）；opt.len 线长默认160
// 线恒竖直向下（件内固定竖直，不随任何 opt 旋转）
// 返回 {len,top:{x,y},bob:{x,y},tip:{x,y}}（bob=铅锤重心位，tip=锥尖）
PROPS.plumb_line = function(ctx, x, y, opt){
  opt = opt || {};
  const L = opt.len || 160;
  const cupR = Math.max(9, L * 0.075);
  const bobH = Math.max(16, L * 0.16), bobW = bobH * 0.62;
  const lineTop = y + cupR * 0.55, lineBot = y + L;
  ctx.save();
  // 细线（恒竖直）
  ctx.strokeStyle = '#4b5563'; ctx.lineWidth = Math.max(1.2, L * 0.008);
  ctx.beginPath(); ctx.moveTo(x, lineTop); ctx.lineTo(x, lineBot); ctx.stroke();
  // 顶吸盘（半圆碗+颈）
  ctx.fillStyle = '#c05a4a'; ctx.strokeStyle = '#8e3f33'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x, y, cupR, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#8e3f33';
  ctx.beginPath(); ctx.roundRect(x - cupR * 0.28, y + cupR * 0.5, cupR * 0.56, cupR * 0.45, 2); ctx.fill();
  // 锥形铅锤（上圆柱颈+下锥尖）
  const byTop = lineBot;
  const gm = ctx.createLinearGradient(x - bobW / 2, 0, x + bobW / 2, 0);
  gm.addColorStop(0, '#7d858d'); gm.addColorStop(0.45, '#c9ced4'); gm.addColorStop(1, '#6f777f');
  ctx.fillStyle = gm; ctx.strokeStyle = '#565d65'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - bobW / 2, byTop);
  ctx.lineTo(x + bobW / 2, byTop);
  ctx.lineTo(x + bobW / 2, byTop + bobH * 0.45);
  ctx.lineTo(x, byTop + bobH);
  ctx.lineTo(x - bobW / 2, byTop + bobH * 0.45);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  return {len: L, top: {x: x, y: y}, bob: {x: x, y: byTop + bobH * 0.45}, tip: {x: x, y: byTop + bobH}};
};

// earth_globe: 地球球体（蓝球+绿色陆块blob自画简化+高光；勿抄真地图素材）。(x,y)=球心；opt.r 默认90
// opt.spots 可选 [{lat,lon,label}]（度）→ 简化投影 x=cx+r*cos(lat)*sin(lon), y=cy-r*sin(lat)；背面点 visible=false 不画标记
// 返回 {r,center:{x,y},spots:[{lat,lon,label,x,y,visible}]}（页内点选用）
PROPS.earth_globe = function(ctx, x, y, opt){
  opt = opt || {};
  const r = opt.r || 90;
  const D = Math.PI / 180;
  ctx.save();
  // 球体
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.15, x, y, r * 1.1);
  g.addColorStop(0, '#7fc4ee'); g.addColorStop(0.55, '#3d8fd1'); g.addColorStop(1, '#1f5c96');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  // 陆块 blob（clip 球内；确定性伪随机，同参同形；只画正面 lon∈(-90,90)）
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#57a05c';
  for (let k = 0; k < 7; k++) {
    const lat = (rand(k * 3.7 + 1) * 130 - 65) * D;
    const lon = (rand(k * 5.3 + 2) * 150 - 75) * D;
    const br = r * (0.16 + rand(k * 7.1 + 3) * 0.16);
    const cx = x + r * Math.cos(lat) * Math.sin(lon);
    const cy = y - r * Math.sin(lat);
    ctx.beginPath();
    const n = 8;
    for (let i = 0; i <= n; i++) {
      const th = i / n * Math.PI * 2;
      const rr = br * (0.7 + rand(k * 11.3 + i * 1.7) * 0.55);
      const px2 = cx + rr * Math.cos(th), py2 = cy + rr * Math.sin(th) * 0.8;
      if (i === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
    }
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.30)';
  ctx.beginPath(); ctx.ellipse(x - r * 0.4, y - r * 0.45, r * 0.26, r * 0.15, -0.6, 0, Math.PI * 2); ctx.fill();
  // 球缘描边
  ctx.strokeStyle = 'rgba(20,60,100,0.7)'; ctx.lineWidth = Math.max(1.2, r * 0.016);
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  // spots 标记+标签
  const out = [];
  (opt.spots || []).forEach(function(sp){
    const lat = sp.lat * D, lon = sp.lon * D;
    const vis = Math.cos(lon) > 0.02;   // 正面半球
    const sx = x + r * Math.cos(lat) * Math.sin(lon);
    const sy = y - r * Math.sin(lat);
    out.push({lat: sp.lat, lon: sp.lon, label: sp.label || '', x: sx, y: sy, visible: vis});
    if (!vis) return;
    ctx.fillStyle = '#e03131';
    ctx.beginPath(); ctx.arc(sx, sy, Math.max(3, r * 0.045), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke();
    if (sp.label) {
      ctx.fillStyle = '#123a5e'; ctx.font = 'bold ' + Math.max(10, r * 0.13) + 'px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(sp.label, sx, sy - Math.max(4, r * 0.06));
    }
  });
  ctx.restore();
  return {r: r, center: {x: x, y: y}, spots: out};
};

// person_pin: 小人重力箭头桩（简化矢量小人：圆头+躯干腿，无真脸）。(x,y)=脚底中心；opt.scale 身高倍率（opt.h 直接给高）
// opt.arrow 'down' → 身侧粉色重力箭头 G；'up' → 支持力 F（同粉色系区分标签）
// 返回 {h,foot:{x,y},head:{x,y},arrow:{x0,y0,x1,y1,label}}（arrow 世界坐标，页面可复用画力）
PROPS.person_pin = function(ctx, x, y, opt){
  opt = opt || {};
  const H = opt.h || 90 * (opt.scale || 1);
  const headR = H * 0.13;
  const bodyT = y - H + headR * 2;         // 躯干顶（颈）
  const hipY = y - H * 0.38;               // 髋
  const shW = H * 0.10;                    // 肩半宽
  ctx.save();
  // 腿
  ctx.strokeStyle = '#3f5878'; ctx.lineWidth = Math.max(3, H * 0.055); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - shW * 0.45, hipY); ctx.lineTo(x - shW * 0.55, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + shW * 0.45, hipY); ctx.lineTo(x + shW * 0.55, y); ctx.stroke();
  // 躯干
  ctx.fillStyle = '#5b7ba6'; ctx.strokeStyle = '#3f5878'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(x - shW, bodyT, shW * 2, hipY - bodyT + H * 0.03, shW * 0.5); ctx.fill(); ctx.stroke();
  // 臂
  ctx.strokeStyle = '#5b7ba6'; ctx.lineWidth = Math.max(2.5, H * 0.045);
  ctx.beginPath(); ctx.moveTo(x - shW, bodyT + H * 0.05); ctx.lineTo(x - shW * 1.5, hipY - H * 0.05); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + shW, bodyT + H * 0.05); ctx.lineTo(x + shW * 1.5, hipY - H * 0.05); ctx.stroke();
  // 头（圆头无脸）
  ctx.fillStyle = '#f0c9a0'; ctx.strokeStyle = '#c99b6e'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x, y - H + headR, headR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 力箭头（身侧，粉色）
  let arrow = null;
  if (opt.arrow === 'down' || opt.arrow === 'up') {
    const down = opt.arrow === 'down';
    const ax = x + shW * 2.4;
    const cy0 = y - H * 0.55;
    const aLen = H * 0.42;
    const y0 = down ? cy0 - aLen / 2 : cy0 + aLen / 2;
    const y1 = down ? cy0 + aLen / 2 : cy0 - aLen / 2;
    const hd = Math.max(6, aLen * 0.22);
    ctx.strokeStyle = '#e8639a'; ctx.fillStyle = '#e8639a';
    ctx.lineWidth = Math.max(2.5, H * 0.035); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ax, y0); ctx.lineTo(ax, y1 - (down ? hd : -hd)); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ax, y1);
    ctx.lineTo(ax - hd * 0.55, y1 - (down ? hd : -hd));
    ctx.lineTo(ax + hd * 0.55, y1 - (down ? hd : -hd));
    ctx.closePath(); ctx.fill();
    const label = down ? 'G' : 'F';
    ctx.font = 'bold ' + Math.max(11, H * 0.16) + 'px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(label, ax + hd * 0.7, (y0 + y1) / 2);
    arrow = {x0: ax, y0: y0, x1: ax, y1: y1, label: label};
  }
  ctx.restore();
  return {h: H, foot: {x: x, y: y}, head: {x: x, y: y - H + headR}, arrow: arrow};
};

/* == APPEND-POINT: 力学件增补插入此处 == */

// glass_bottle_tube: 玻璃瓶细管（微小形变放大法教具，教材P10练习4图7.2-5原型；设计书§2 s2场景①）。
// (x,y)=瓶底中心；w=整体宽（默认110）、h=整体高（瓶底→细管顶，默认240）
// opt.squeeze 0..1 捏力→细管水柱顶面联动上升：基线（塞顶上方）→接近管顶（squeeze=1 不溢出），变化肉眼明显
// 结构：椭圆形厚壁玻璃瓶（半透明浅蓝+瓶身左缘白高光+厚壁双线）装满红色水（颈部带液面）
//       + 深色带孔橡胶塞 + 细玻璃管竖直插过塞心（管内红色水柱、顶面凹弯月可见）
// 用法：const r = PROPS.glass_bottle_tube(ctx, 260, 380, 110, 240, {squeeze: 0.5}); // r.waterTopY=水柱顶面y像素
// 返回 {waterTopY}（细管内水柱顶面世界y坐标，页面标注/对齐用）
PROPS.glass_bottle_tube = function(ctx, x, y, w, h, opt){
  if (w !== null && typeof w === 'object') { opt = w; w = 0; h = 0; } // 兼容 gallery 4参调用 (ctx,x,y,opt)
  opt = opt || {};
  w = w || opt.w || 110;
  h = h || opt.h || 240;
  const sq = Math.max(0, Math.min(1, opt.squeeze || 0));
  // === 竖直布局（h 比例）===
  const bx = w * 0.5, by = h * 0.28, cy = y - by;          // 瓶身椭圆（底触 y）
  const nRx = Math.max(7, w * 0.115);                      // 瓶颈半宽
  const neckTop = y - h * 0.645;                           // 瓶颈顶
  const wall = Math.max(2, w * 0.045);                     // 厚壁厚
  const stopT = y - h * 0.735, stopB = neckTop + h * 0.012; // 橡胶塞顶/底
  const tw = Math.max(3.5, w * 0.05);                      // 细管外半宽
  const tubeTopY = y - h * 0.98;                           // 细管顶
  const waterBaseY = neckTop + h * 0.03;                   // 颈部液面（装满）
  const wTop0 = stopT - h * 0.03;                          // 水柱基线（squeeze=0）
  const wTopMax = tubeTopY + h * 0.045;                    // 水柱上限（squeeze=1，不溢出）
  const waterTopY = wTop0 - (wTop0 - wTopMax) * sq;
  // 颈-身交接点（瓶颈侧线落在瓶身椭圆上的参数角，上方左右两点）
  const cosJ = Math.min(1, nRx / bx);
  const sinJ = -Math.sqrt(1 - cosJ * cosJ);
  const thL = Math.atan2(sinJ, -cosJ);
  const thR = Math.atan2(sinJ, cosJ);
  const joinY = cy + by * sinJ;
  // 瓶轮廓单路径（颈左壁↓ → 沿椭圆经左/底/右 → 颈右壁↑）
  function bottlePath(){
    ctx.beginPath();
    ctx.moveTo(x - nRx, neckTop);
    ctx.lineTo(x - nRx, joinY);
    ctx.ellipse(x, cy, bx, by, 0, thL, thR, true);
    ctx.lineTo(x + nRx, neckTop);
    ctx.closePath();
  }
  ctx.save();
  // 1) 厚壁玻璃瓶身（半透明浅蓝渐变）
  const gG = ctx.createLinearGradient(x - bx, 0, x + bx, 0);
  gG.addColorStop(0, 'rgba(198,224,242,0.85)');
  gG.addColorStop(0.45, 'rgba(226,241,251,0.62)');
  gG.addColorStop(1, 'rgba(180,210,234,0.85)');
  bottlePath(); ctx.fillStyle = gG; ctx.fill();
  // 2) 瓶内红色水（clip 轮廓内，液面以下装满）
  ctx.save();
  bottlePath(); ctx.clip();
  const gB = ctx.createLinearGradient(0, waterBaseY, 0, y);
  gB.addColorStop(0, '#e0574a'); gB.addColorStop(1, '#b93a30');
  ctx.fillStyle = gB;
  ctx.fillRect(x - bx, waterBaseY, bx * 2, y - waterBaseY);
  ctx.restore();
  // 3) 颈部液面椭圆（带描边=液面可见）
  ctx.fillStyle = '#ef6a5c';
  ctx.beginPath(); ctx.ellipse(x, waterBaseY, nRx * 0.82, Math.max(1.5, w * 0.022), 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(150,50,40,0.6)'; ctx.lineWidth = 1; ctx.stroke();
  // 4) 厚壁双线：外轮廓描边 + 内壁线（颈两侧短竖线 + 内椭圆下弧）
  ctx.strokeStyle = '#8fb6d2'; ctx.lineWidth = Math.max(1.6, w * 0.02);
  bottlePath(); ctx.stroke();
  ctx.strokeStyle = 'rgba(127,168,196,0.85)'; ctx.lineWidth = Math.max(1.2, w * 0.013);
  ctx.beginPath();
  ctx.moveTo(x - nRx + wall, neckTop + 2); ctx.lineTo(x - nRx + wall, joinY + wall * 1.2);
  ctx.moveTo(x + nRx - wall, neckTop + 2); ctx.lineTo(x + nRx - wall, joinY + wall * 1.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, cy, bx - wall, by - wall, 0, thL, thR, true);
  ctx.stroke();
  // 5) 瓶身左缘白色高光弧
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = Math.max(2.2, w * 0.035); ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.ellipse(x, cy, bx * 0.86, by * 0.86, 0, Math.PI * 0.72, Math.PI * 1.28);
  ctx.stroke();
  // 6) 深色带孔橡胶塞（下宽上窄梯形 + 顶面椭圆 2.5D）
  const sBw = nRx + w * 0.03, sTw = nRx * 0.92;
  ctx.lineCap = 'butt';
  ctx.fillStyle = '#4b3a2f'; ctx.strokeStyle = '#33261d'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - sBw, stopB);
  ctx.lineTo(x + sBw, stopB);
  ctx.lineTo(x + sTw, stopT);
  ctx.lineTo(x - sTw, stopT);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5d4a3c';
  ctx.beginPath(); ctx.ellipse(x, stopT, sTw, Math.max(2, w * 0.03), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 7) 细玻璃管（竖直双壁线插过塞心 + 管口加厚缘）
  ctx.strokeStyle = 'rgba(125,166,196,0.95)'; ctx.lineWidth = Math.max(1.2, w * 0.014); ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - tw, stopT); ctx.lineTo(x - tw, tubeTopY);
  ctx.moveTo(x + tw, stopT); ctx.lineTo(x + tw, tubeTopY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - tw - 1.5, tubeTopY); ctx.lineTo(x + tw + 1.5, tubeTopY);
  ctx.stroke();
  // 8) 管内红色水柱（顶面凹弯月=中心微低；穿过塞孔连到颈部液面）
  const cw = Math.max(1.8, tw * 0.6);
  ctx.beginPath();
  ctx.moveTo(x - cw, waterTopY);
  ctx.quadraticCurveTo(x, waterTopY + cw * 0.9, x + cw, waterTopY);
  ctx.lineTo(x + cw, waterBaseY);
  ctx.lineTo(x - cw, waterBaseY);
  ctx.closePath();
  const gC = ctx.createLinearGradient(x - cw, 0, x + cw, 0);
  gC.addColorStop(0, '#c94437'); gC.addColorStop(0.5, '#e8564a'); gC.addColorStop(1, '#bd3a2f');
  ctx.fillStyle = gC; ctx.fill();
  // 弯月面深色描边（顶面弯月可见）
  ctx.strokeStyle = 'rgba(140,45,35,0.75)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - cw, waterTopY);
  ctx.quadraticCurveTo(x, waterTopY + cw * 0.9, x + cw, waterTopY);
  ctx.stroke();
  ctx.restore();
  return {waterTopY: waterTopY};
};

})(typeof window !== 'undefined' ? window : globalThis);

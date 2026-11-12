(function(global){
'use strict';
const PROPS = global.PROPS = global.PROPS || {};
const rand = PROPS.rand || function(seed){
  const s = Math.sin(seed * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

/* ============================================================
 * props-mech.js — 第七章「力」力学器材标准件 v1（2026-11-04，c7 单A，16件；2026-11-06 C7V2-D1 增补 glass_bottle_tube=17件；2026-11-11 C7V3-R1 重绘 spring_horizontal/hand_press/spring_meter + 增补 hook_link=18件；2026-11-12 C7V4-R8 增补 _25d「一张桌子」新件14件15函数=33件，旧件全保留）
 * 约定同 props-optics/props-density：IIFE 挂 global.PROPS；(x,y)=底面中心锚点
 * （吊挂件=底钩锚点向上画；旋转件=中心锚点）；有挂载点的件返回几何含 mounts:{锚名:{x,y}}（世界坐标）。
 * 视觉全原创（PhET masses-and-springs 仅借交互语义：圈距线性变疏/柱高∝质量档/顶钩底钩 snap）。
 * 件清单：plasticine / hand_press / spring_horizontal / spring_vertical / bar_magnet /
 *   iron_ball / ball_track_table / door / magnet_cart / spring_meter / hook_weight /
 *   ruler_flex / rubber_band / plumb_line / earth_globe / person_pin / glass_bottle_tube(C7V2-D1) / hook_link(C7V3-R1)
 * ============================================================ */

// MECH_IDS: 本文件件名清单（gallery 与下游 B 单索引用）
PROPS.MECH_IDS = ['plasticine','hand_press','spring_horizontal','spring_vertical','bar_magnet','iron_ball','ball_track_table','door','magnet_cart','spring_meter','hook_weight','ruler_flex','rubber_band','plumb_line','earth_globe','person_pin','glass_bottle_tube','hook_link','spring_25d','rubber_band_25d','clay_25d','bottle_tube_25d','cart_25d','wood_block_25d','box_25d','door_25d','skateboard_25d','figure_25d','balloon_25d','meter_25d','weight_hook_25d','iron_stand_25d','table_25d'];
// MECH_25D_IDS: C7V4-R8「一张桌子」2.5D 新件清单（14件15函数；旧件保留不删，v3 页面还在用）
PROPS.MECH_25D_IDS = ['spring_25d','rubber_band_25d','clay_25d','bottle_tube_25d','cart_25d','wood_block_25d','box_25d','door_25d','skateboard_25d','figure_25d','balloon_25d','meter_25d','weight_hook_25d','iron_stand_25d','table_25d'];

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

// hand_press: 真实手型按压（C7V3-R1 矢量重绘，替代 sprite）：贝塞尔轮廓手掌+拇指+食指按压姿态（指节弧度/指甲小弧/手腕收口），肤色填充+深一档描边。
// (x,y)=食指尖；opt.press 0..1 食指屈度（0=直压，1=屈压，指尖位恒为锚点）；opt.angle 旋转度（绕指尖）；opt.h 显示高默认140（或 opt.scale 倍率）
// 返回 {w,h,tip:{x,y}}
PROPS.hand_press = function(ctx, x, y, opt){
  opt = opt || {};
  const p = Math.max(0, Math.min(1, opt.press || 0));
  const H = opt.h || 140 * (opt.scale || 1);
  const k = H / 140;
  const a = (opt.angle || 0) * Math.PI / 180;
  ctx.save();
  ctx.translate(x, y);
  if (a) ctx.rotate(a);
  ctx.scale(k, k);
  // 设计坐标：指尖(0,0)、向上为负；屈度 p → 指节向右弓出 b
  const b = 4 + p * 13;
  const skin = ctx.createLinearGradient(-46, -140, 30, 0);
  skin.addColorStop(0, '#f7d3ad'); skin.addColorStop(0.55, '#efc095'); skin.addColorStop(1, '#e2aa7c');
  ctx.fillStyle = skin;
  ctx.strokeStyle = '#bd8055'; ctx.lineWidth = 1.7;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // 手腕收口（前臂短段，顶部圆收）
  ctx.beginPath();
  ctx.moveTo(-33, -96);
  ctx.bezierCurveTo(-37, -116, -33, -131, -26, -137);
  ctx.bezierCurveTo(-18, -142, 2, -142, 10, -137);
  ctx.bezierCurveTo(17, -131, 19, -115, 15, -96);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 手掌（手背轮廓）
  ctx.beginPath();
  ctx.moveTo(-34, -100);
  ctx.bezierCurveTo(-41, -84, -38, -66, -30, -56);
  ctx.bezierCurveTo(-18, -46, 6, -44, 18, -50);
  ctx.bezierCurveTo(28, -56, 30, -78, 26, -92);
  ctx.bezierCurveTo(20, -104, -22, -108, -34, -100);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 拇指（掌左上斜伸，圆头+指甲小弧）
  ctx.beginPath();
  ctx.moveTo(-30, -92);
  ctx.bezierCurveTo(-42, -86, -50, -70, -48, -56);
  ctx.bezierCurveTo(-47, -48, -38, -45, -33, -51);
  ctx.bezierCurveTo(-28, -59, -26, -75, -24, -86);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f0c6a8'; ctx.strokeStyle = 'rgba(150,92,52,0.65)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(-43.5, -53, 3.6, 4.6, 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 蜷曲的中指/无名指/小指（掌右侧三段鼓包，自上而下渐短）
  ctx.fillStyle = skin; ctx.strokeStyle = '#bd8055'; ctx.lineWidth = 1.6;
  const curls = [[-72, 30], [-57, 33], [-44, 29]];
  for (let i = 0; i < 3; i++) {
    const cy0 = curls[i][0], rr = curls[i][1];
    ctx.beginPath();
    ctx.moveTo(12, cy0 - 8);
    ctx.bezierCurveTo(22, cy0 - 9, rr - 2, cy0 - 7, rr, cy0);
    ctx.bezierCurveTo(rr + 2, cy0 + 7, 22, cy0 + 9, 12, cy0 + 8);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // 指节弧度褶（鼓包顶上小弧）
    ctx.strokeStyle = 'rgba(160,98,58,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(rr - 6, cy0, 4.5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.strokeStyle = '#bd8055'; ctx.lineWidth = 1.6;
  }
  // 食指（按压主指：指尖(0,0)→指节，屈度 p 弓出）
  ctx.beginPath();
  ctx.moveTo(-6, -3);
  ctx.bezierCurveTo(-8 + b * 0.55, -22, -7 + b * 0.85, -45, -3, -64);
  ctx.bezierCurveTo(-1, -70, 10, -70, 12, -64);
  ctx.bezierCurveTo(14 + b * 0.85, -45, 13 + b * 0.55, -20, 6.5, -3);
  ctx.bezierCurveTo(4, 1.5, -3.5, 1.5, -6, -3);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 食指指节褶（两道小弧，随屈度加深）
  ctx.strokeStyle = 'rgba(160,98,58,' + (0.35 + 0.35 * p) + ')'; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.arc(b * 0.7 + 2, -30, 5.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.beginPath(); ctx.arc(b * 0.45 + 2, -48, 5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  // 食指尖指甲（小弧，亮一档）
  ctx.fillStyle = '#f2c9ab'; ctx.strokeStyle = 'rgba(150,92,52,0.65)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0.5, -7.5, 4, 5.2, 0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
  return {w: 84 * k, h: H, tip: {x: x, y: y}};
};

// 阻尼回弹参数（C7V3-R1，页面直操松手用）：页面按 x(t)=A·e^(−ζt)·cos(ωt) 驱动 opt.stretch，晃1-2下归位
PROPS.DAMP = {zeta: 0.18, omega: 14};

// spring_horizontal: 水平弹簧（C7V3-R1 PhET masses-and-springs 风格重绘：圆润螺旋线圈=二次贝塞尔连续绕线、圈距随伸长渐变(拉伸变疏/压缩变密)、线圈明暗双面(上亮下暗细描边)、两端直引线+锚环；左灰立柱底座支架保留）。
// (x,y)=支架底座底中心；opt.stretch -1..1（负=压缩）；opt.len 自然长默认130；opt.h 支架高默认70；opt.vel 可选（回弹相位由页面按 PROPS.DAMP 驱动，件只按 stretch 画）
// 返回 {axisY,end:{x,y},ring:{x,y}}（end=弹簧右端锚点，ring=拉环圆心，页面连力/挂物用）
PROPS.spring_horizontal = function(ctx, x, y, opt){
  opt = opt || {};
  const h = opt.h || 70;
  const L0 = opt.len || 130;
  const st = Math.max(-1, Math.min(1, opt.stretch || 0));
  const axisY = y - h * 0.62;
  const baseW = h * 0.9, postW = Math.max(8, h * 0.16);
  const x0 = x + postW / 2 + 4;               // 弹簧起点（立柱右侧）
  const L = L0 * (1 + 0.6 * st);              // 当前长（圈距线性：拉伸变疏/压缩变密）
  const x1 = x0 + L;                          // 弹簧右端
  ctx.save();
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1.2;
  // 底座
  ctx.fillStyle = '#9aa1ab';
  ctx.beginPath(); ctx.roundRect(x - baseW / 2, y - 8, baseW, 8, 2); ctx.fill(); ctx.stroke();
  // 立柱
  ctx.fillStyle = '#b6bcc6';
  ctx.beginPath(); ctx.roundRect(x - postW / 2, axisY - h * 0.20, postW, (y - 8) - (axisY - h * 0.20), 2); ctx.fill(); ctx.stroke();
  // === PhET 风格螺旋：每圈两段二次贝塞尔连续绕线，圆润线帽 ===
  const coils = 9, r = h * 0.20, lead = 10;
  const coilX0 = x0 + lead, coilX1 = x1 - lead;
  const pitch = (coilX1 - coilX0) / coils;
  const w = Math.max(2.6, h * 0.05);          // 线径
  function coilPath(){
    ctx.beginPath();
    ctx.moveTo(x0, axisY);
    ctx.lineTo(coilX0, axisY);                // 左直引线
    for (let i = 0; i < coils; i++) {
      const sx = coilX0 + i * pitch;
      ctx.quadraticCurveTo(sx + pitch * 0.25, axisY - 2 * r, sx + pitch * 0.5, axisY);
      ctx.quadraticCurveTo(sx + pitch * 0.75, axisY + 2 * r, sx + pitch, axisY);
    }
    ctx.lineTo(x1, axisY);                    // 右直引线
  }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // 细描边（底层暗轮廓）
  coilPath(); ctx.strokeStyle = '#3f444c'; ctx.lineWidth = w + 2.2; ctx.stroke();
  // 线材主体
  coilPath(); ctx.strokeStyle = '#aab2bb'; ctx.lineWidth = w; ctx.stroke();
  // 明暗双面：上半亮线 / 下半暗线（同路径微偏移细描）
  ctx.save(); ctx.translate(0, -w * 0.22);
  coilPath(); ctx.strokeStyle = 'rgba(242,246,250,0.85)'; ctx.lineWidth = w * 0.36; ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.translate(0, w * 0.24);
  coilPath(); ctx.strokeStyle = 'rgba(66,72,82,0.5)'; ctx.lineWidth = w * 0.32; ctx.stroke();
  ctx.restore();
  // 两端锚环：左端固定环（立柱侧）+ 右端拉环
  ctx.strokeStyle = '#4b5563'; ctx.lineWidth = Math.max(2, h * 0.03);
  ctx.beginPath(); ctx.arc(x0 - 1, axisY, Math.max(4, h * 0.06), 0, Math.PI * 2); ctx.stroke();
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

// spring_meter: 弹簧测力计（C7V3-R1 照蔡总实物照片重绘，条形盒式）：青绿(#3f8f96系)条形盒身+上下圆头盖+白色面板顶部弧形花边+双列刻度(左右各0..5N，主刻度整数+0.2小格)+面板中央竖直黑槽+红色指针横标+顶部银色金属吊环+底部挂钩组件(金属挂片+J形钩)。
// 锚点改吊环顶：(x,y)=吊环顶；表身与刻度固定不动。
// opt.F 0..5 受力 → d=F/5*槽长，红指针+挂片+J钩整体下移 d（挂钩伸出底槽位移可见）；opt.orientation 'v'(默认)|'h'（同规格旋转90°：环左钩右，刻度数字正立可读不镜像）；opt.h 总长默认230。
// 返回 {w,h,hookX,hookY,bodyTop,bodyBot,reading,top,mounts:{hook}}（hookX/hookY=J钩尖实时世界坐标，供钩码/互挂 snap；bodyTop/bodyBot=盒身顶/底中心世界坐标；reading=F）
PROPS.spring_meter = function(ctx, x, y, opt){
  opt = opt || {};
  const H = opt.h || 230;
  const F = Math.max(0, Math.min(5, opt.F || 0));
  const horiz = opt.orientation === 'h';
  // 局部坐标：锚(0,0)=吊环顶，向下为正
  const bw = H * 0.22;                    // 盒身宽
  const ringR = H * 0.042;                // 吊环半径
  const ringCY = ringR + 1;               // 吊环圆心（环顶=锚点）
  const bodyT = ringR * 2 + H * 0.025;    // 盒身顶
  const bodyB = H * 0.86;                 // 盒身底（下方留 J 钩行程）
  const capR = bw * 0.5;                  // 圆头盖半径
  const panelL = -bw * 0.42, panelR = bw * 0.42;
  const panelT = bodyT + H * 0.04, panelB = bodyB - H * 0.035;
  const slotW = Math.max(3, H * 0.017);   // 中央黑槽宽
  const slotT = panelT + H * 0.062;       // 槽顶=0刻度
  const slotB = panelB - H * 0.02;        // 槽底=5刻度
  const slotLen = slotB - slotT;
  const d = F / 5 * slotLen;              // 指针/挂片/J钩整体位移
  const ptrY = slotT + d;
  const hr = H * 0.026;                   // J钩弧半径
  const stemY = bodyB + H * 0.012 + d;    // J钩茎底（F=0 收进底槽仅露钩，随 d 下移伸出可见）
  const hookTip = {x: 1.782 * hr, y: stemY};
  ctx.save();
  ctx.translate(x, y);
  if (horiz) ctx.rotate(-Math.PI / 2);
  ctx.lineJoin = 'round';
  // 顶部金属吊环（银色圆环：暗描边+金属体+高光弧）
  ctx.strokeStyle = '#5f676f'; ctx.lineWidth = Math.max(2.4, H * 0.017);
  ctx.beginPath(); ctx.arc(0, ringCY, ringR, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#c3cad1'; ctx.lineWidth = Math.max(1.4, H * 0.010);
  ctx.beginPath(); ctx.arc(0, ringCY, ringR, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = Math.max(1, H * 0.005);
  ctx.beginPath(); ctx.arc(0, ringCY, ringR, Math.PI * 1.05, Math.PI * 1.45); ctx.stroke();
  // 环-盒短茎
  ctx.strokeStyle = '#8b939b'; ctx.lineWidth = Math.max(2, H * 0.013);
  ctx.beginPath(); ctx.moveTo(0, ringCY + ringR); ctx.lineTo(0, bodyT + capR * 0.3); ctx.stroke();
  // 青绿条形盒身（上下圆头盖=整圆角）
  const gb = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
  gb.addColorStop(0, '#57a9b0'); gb.addColorStop(0.4, '#3f8f96'); gb.addColorStop(1, '#2d6d75');
  ctx.fillStyle = gb; ctx.strokeStyle = '#275c63'; ctx.lineWidth = Math.max(1.3, H * 0.007);
  ctx.beginPath(); ctx.roundRect(-bw / 2, bodyT, bw, bodyB - bodyT, capR); ctx.fill(); ctx.stroke();
  // 盒身左缘高光
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = Math.max(1.4, H * 0.008); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-bw * 0.34, bodyT + capR * 1.1); ctx.lineTo(-bw * 0.34, bodyB - capR * 1.1); ctx.stroke();
  ctx.lineCap = 'butt';
  // 白色面板（顶部弧形花边=排半圆扇贝弧）
  ctx.fillStyle = '#fbfaf6'; ctx.strokeStyle = '#c8d2cf'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(panelL, panelT, panelR - panelL, panelB - panelT, 3); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#7fb3b8'; ctx.lineWidth = Math.max(1, H * 0.005);
  const scN = 5, scPad = (panelR - panelL) * 0.08;
  const scW = (panelR - panelL - scPad * 2) / scN, scY = panelT + H * 0.024;
  for (let i = 0; i < scN; i++) {
    ctx.beginPath();
    ctx.arc(panelL + scPad + scW * (i + 0.5), scY, scW * 0.5, Math.PI, 0);
    ctx.stroke();
  }
  // 单位 N（花边下、槽顶上方；水平态反向旋转=正立可读）
  ctx.fillStyle = '#3a4a4c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold ' + Math.max(7, H * 0.034) + 'px sans-serif';
  ctx.save(); ctx.translate(0, panelT + H * 0.045);
  if (horiz) ctx.rotate(Math.PI / 2);
  ctx.fillText('N', 0, 0);
  ctx.restore();
  // 双列刻度：左右各 0..5N，主刻度整数(带数字)+0.2小格；刻度线在面板外缘，数字靠槽侧
  const fs = Math.max(6.5, H * 0.030);
  ctx.font = fs + 'px sans-serif';
  ctx.strokeStyle = '#3a4a4c'; ctx.fillStyle = '#3a4a4c';
  const tkMaj = H * 0.024, tkMin = H * 0.013;
  for (let v = 0; v <= 5.0001; v += 0.2) {
    const ty = slotT + slotLen * (v / 5);
    const major = Math.abs(v - Math.round(v)) < 0.01;
    const tl = major ? tkMaj : tkMin;
    ctx.lineWidth = major ? 1.4 : 0.8;
    ctx.beginPath(); ctx.moveTo(panelL + 2, ty); ctx.lineTo(panelL + 2 + tl, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(panelR - 2, ty); ctx.lineTo(panelR - 2 - tl, ty); ctx.stroke();
    if (major) {
      const lab = String(Math.round(v));
      ctx.save(); ctx.translate(panelL + 4 + tl, ty);
      if (horiz) ctx.rotate(Math.PI / 2);
      ctx.textAlign = 'left'; ctx.fillText(lab, 0, 0);
      ctx.restore();
      ctx.save(); ctx.translate(panelR - 4 - tl, ty);
      if (horiz) ctx.rotate(Math.PI / 2);
      ctx.textAlign = 'right'; ctx.fillText(lab, 0, 0);
      ctx.restore();
    }
  }
  // 面板中央竖直黑槽
  ctx.fillStyle = '#22262b';
  ctx.beginPath(); ctx.roundRect(-slotW / 2, slotT, slotW, slotLen, slotW * 0.4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(-slotW / 2 + 0.8, slotT + 1.5, slotW * 0.3, slotLen - 3);
  // === 受力下移组件（挂片+红指针横标，随 d 整体下移）===
  // 金属挂片（槽内滑块）
  const gp = ctx.createLinearGradient(-slotW * 1.4, 0, slotW * 1.4, 0);
  gp.addColorStop(0, '#7d858d'); gp.addColorStop(0.5, '#d3d8dd'); gp.addColorStop(1, '#6f777f');
  ctx.fillStyle = gp; ctx.strokeStyle = '#4b5158'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(-slotW * 1.4, ptrY - H * 0.011, slotW * 2.8, H * 0.022, 2); ctx.fill(); ctx.stroke();
  // 红色指针横标（横贯面板中部，两端尖角）
  const pW = bw * 0.30, pH = Math.max(2.5, H * 0.012);
  ctx.fillStyle = '#d84343'; ctx.strokeStyle = '#9c2f2f'; ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-pW, ptrY - pH * 0.32);
  ctx.lineTo(pW, ptrY - pH * 0.32);
  ctx.lineTo(pW + pH * 0.6, ptrY);
  ctx.lineTo(pW, ptrY + pH * 0.32);
  ctx.lineTo(-pW, ptrY + pH * 0.32);
  ctx.lineTo(-pW - pH * 0.6, ptrY);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(-pW + 1.5, ptrY - pH * 0.28, pW * 2 - 3, pH * 0.22);
  // 底盖出槽口（暗色，J钩茎从此伸出）
  ctx.fillStyle = '#1f2429';
  ctx.beginPath(); ctx.roundRect(-slotW * 0.8, bodyB - H * 0.018, slotW * 1.6, H * 0.018, 1.5); ctx.fill();
  // === J形钩组件（挂片下方整体，随 d 下移=挂钩伸出底槽可见位移）===
  // 金属挂片茎（扁条，从底槽口伸出段）
  const stemW = Math.max(2.2, H * 0.013);
  const gs = ctx.createLinearGradient(-stemW, 0, stemW, 0);
  gs.addColorStop(0, '#7d858d'); gs.addColorStop(0.5, '#cfd4d9'); gs.addColorStop(1, '#6f777f');
  ctx.fillStyle = gs; ctx.strokeStyle = '#4b5158'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.roundRect(-stemW / 2, bodyB - H * 0.015, stemW, stemY - bodyB + H * 0.015, stemW * 0.4); ctx.fill(); ctx.stroke();
  ctx.lineCap = 'round';
  // 挂环小圈（底槽口处）
  ctx.strokeStyle = '#5f676f'; ctx.lineWidth = Math.max(1.6, H * 0.009);
  ctx.beginPath(); ctx.arc(0, bodyB + H * 0.004 + d, Math.max(2.5, H * 0.012), 0, Math.PI * 2); ctx.stroke();
  // J形钩（茎底→下弯→右挑，钩尖朝上）
  ctx.lineWidth = Math.max(2, H * 0.013);
  ctx.beginPath();
  ctx.arc(0.891 * hr, stemY - 0.454 * hr, hr, Math.PI * 0.85, Math.PI * 0.15, true);
  ctx.stroke();
  ctx.restore();
  // 世界坐标（水平态=绕锚点 -90°：局部(lx,ly)→世界(x+ly, y-lx)）
  function W(lx, ly){ return horiz ? {x: x + ly, y: y - lx} : {x: x + lx, y: y + ly}; }
  const tipW = W(hookTip.x, hookTip.y);
  return {
    w: horiz ? H + H * 0.06 : bw, h: horiz ? bw : H + H * 0.06,
    hookX: tipW.x, hookY: tipW.y,
    bodyTop: W(0, bodyT), bodyBot: W(0, bodyB),
    reading: F,
    top: {x: x, y: y},
    mounts: {hook: {x: tipW.x, y: tipW.y}}
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

// hook_link: 双钩互挂件（C7V3-R1 新增，相互舞台「测力计对拉」用）：两个 C 形金属钩交叉互挂——左钩开口向右、右钩开口向左，交叠处右钩压左钩；opt.tension 0..1 越大两钩贴合越紧（中心距收拢）+微形变（沿受力轴压扁）。
// (x,y)=交叠段中心；opt.s 整体宽默认90。
// 返回 {leftX,leftY,rightX,rightY}（两端锚点世界坐标：left=左钩尾柄端、right=右钩尾柄端，接测力计挂钩/立柱用）
PROPS.hook_link = function(ctx, x, y, opt){
  opt = opt || {};
  const S = opt.s || 90;
  const t = Math.max(0, Math.min(1, opt.tension || 0));
  const R = S * 0.24;                        // C钩半径
  const dist = R * (1.05 - 0.28 * t);        // 两钩圆心距（tension 越大钩尖互插越深=贴合越紧）
  const c = dist / 2;
  const lw = Math.max(3, S * 0.075);         // 钩线径
  const tail = S * 0.20;                     // 尾柄长
  const sq = 1 - 0.07 * t;                   // 微形变（横向压扁系数）
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  function hook(dir){
    // dir=-1 左钩（开口向右，弧经左侧）；dir=+1 右钩（开口向左，弧经右侧）
    ctx.save();
    ctx.translate(dir * c, 0);
    ctx.scale(sq, 1);
    const a0 = dir < 0 ? Math.PI * 0.28 : Math.PI * 1.28;
    const a1 = dir < 0 ? Math.PI * 1.72 : Math.PI * 0.72;
    function path(){
      ctx.beginPath();
      ctx.arc(0, 0, R, a0, a1, false);       // 顺时针：左钩经π(左半)、右钩经0(右半)
      ctx.moveTo(dir * R, 0);                // 尾柄自 C 背点起笔（独立子路径，避免弦线横穿钩口）
      ctx.lineTo(dir * (R + tail), 0);
    }
    path(); ctx.strokeStyle = '#41464e'; ctx.lineWidth = lw + 2; ctx.stroke();   // 暗描边
    path(); ctx.strokeStyle = '#9aa2ab'; ctx.lineWidth = lw; ctx.stroke();       // 金属体
    // 上缘亮线（明暗双面，两端各收0.22rad避免溢出钩口）
    ctx.beginPath(); ctx.arc(0, 0, R - lw * 0.22, a0 + 0.22, a1 - 0.22, false);
    ctx.strokeStyle = 'rgba(240,244,248,0.7)'; ctx.lineWidth = lw * 0.3; ctx.stroke();
    ctx.restore();
    // 尾柄端圆头
    ctx.beginPath(); ctx.arc(dir * (c + (R + tail) * sq), 0, lw * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = '#7d858d'; ctx.fill();
  }
  hook(-1);   // 左钩（下层）
  hook(1);    // 右钩（上层，交叠处压左钩）
  ctx.restore();
  const lx = x - (c + (R + tail) * sq), rx = x + (c + (R + tail) * sq);
  return {leftX: lx, leftY: y, rightX: rx, rightY: y};
};

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

/* ============================================================
 * C7V4-R8「一张桌子」2.5D 器材件（2026-11-12，14件15函数：skateboard_25d+figure_25d 同列第9件）
 * 统一斜俯视投影 token PROPS.P25：深度 d → 屏幕偏移 (+d*ax, -d*ay)，ax=cos30°*0.5≈0.433、ay=sin30°*0.5=0.25（斜切30°、俯视压缩0.5）
 * 可见面恒为：前面(竖直矩形)+顶面(平行四边形)+右侧面(平行四边形)；投影恒右下偏移椭圆（sh25）
 * 新件全部 _25d 后缀，与旧件并存；(x,y)=底面中心锚点（吊挂件=底钩锚点向上画），一律返回 {w,h,base:{x,y},mounts:{...}}
 * 配色沿用 v1 器材库色系：木纹/金属/纸盒/塑料 token 见 P25
 * ============================================================ */
const P25 = PROPS.P25 = {
  ax: 0.433, ay: 0.25,                                   // 深度→屏幕偏移分量（全件统一，勿改）
  sh: {dx: 0.16, dy: 0.06, a: 0.13},                     // 投影右下偏移与浓度（全件统一）
  wood:   {top: '#e2b881', front: '#c99a5e', side: '#a57842', line: '#7c5a30'},
  metal:  {top: '#c8ced5', front: '#9aa1ab', side: '#7d838c', line: '#5b6068'},
  paper:  {top: '#e9d1a4', front: '#d4b37e', side: '#b89460', line: '#8a6a42'},
  plastic:{top: '#8dc3e0', front: '#5f9fc6', side: '#4a83ab', line: '#37617e'},
  teal:   {top: '#57a9b0', front: '#3f8f96', side: '#2d6d75', line: '#275c63'}
};
// sh25: 统一投影（底面右下偏移椭圆，先画于器材之下）
function sh25(ctx, x, y, w, d){
  const s = P25.sh;
  ctx.save();
  ctx.fillStyle = 'rgba(80,60,30,' + s.a + ')';
  ctx.beginPath();
  ctx.ellipse(x + w * s.dx, y + d * s.dy, w * 0.52 + d * P25.ax * 0.5, Math.max(3, d * 0.32 + w * 0.05), 0, 0, Math.PI * 2);
  ctx.fill(); ctx.restore();
}
// box25: 2.5D 长方体单源助手。底面中心(x,y)、占位 w(宽)×d(深)、高 h；pal=P25 配色 token
// 绘制序：投影(可跳)→右侧面→前面→顶面；返回 {ox,oy,topC,top:{fl,bl,br,fr}}（topC=顶面中心，top=顶面平行四边形四角世界坐标）
function box25(ctx, x, y, w, d, h, pal, skipShadow){
  const ox = d * P25.ax, oy = d * P25.ay;
  if (!skipShadow) sh25(ctx, x, y, w, d);
  ctx.save();
  ctx.strokeStyle = pal.line; ctx.lineWidth = 1.2; ctx.lineJoin = 'round';
  ctx.fillStyle = pal.side;                       // 右侧面
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - h); ctx.lineTo(x + w / 2 + ox, y - h - oy);
  ctx.lineTo(x + w / 2 + ox, y - oy); ctx.lineTo(x + w / 2, y);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = pal.front;                      // 前面（竖直矩形）
  ctx.beginPath(); ctx.rect(x - w / 2, y - h, w, h); ctx.fill(); ctx.stroke();
  ctx.fillStyle = pal.top;                        // 顶面（平行四边形）
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h); ctx.lineTo(x - w / 2 + ox, y - h - oy);
  ctx.lineTo(x + w / 2 + ox, y - h - oy); ctx.lineTo(x + w / 2, y - h);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  return {ox: ox, oy: oy, topC: {x: x + ox / 2, y: y - h - oy / 2},
    top: {fl: {x: x - w / 2, y: y - h}, bl: {x: x - w / 2 + ox, y: y - h - oy}, br: {x: x + w / 2 + ox, y: y - h - oy}, fr: {x: x + w / 2, y: y - h}}};
}

// spring_25d: 弹簧（2.5D，自然长 L₀=8cm 视觉、线圈均匀、顶端挂钩环、下端挂钩）。(x,y)=底钩锚点（向上画）
// opt.h 自然总高默认150；opt.stretch 0..1 圈距线性拉开（物理行为属 R11+，本件只按值画）
// 返回 {w,h,base,top,mounts:{top,hook}} base=底面中心锚点；top=顶挂环圆心；hook=底钩 snap
PROPS.spring_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const H0 = opt.h || 150;
  const st = Math.max(0, Math.min(1, opt.stretch || 0));
  const r = Math.max(9, H0 * 0.09);                 // 螺旋半径
  const ringR = Math.max(4, H0 * 0.03);             // 顶挂环半径
  const hookL = H0 * 0.10;                          // 底钩段高
  const coil0 = H0 - hookL - ringR * 2 - 4;
  const coilLen = coil0 * (1 + 0.5 * st);           // 圈距线性变疏
  const H = coilLen + hookL + ringR * 2 + 4;
  const topY = y - H;
  sh25(ctx, x, y, r * 1.6, r * 0.7);                // 统一投影（托盘静置态）
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // 顶挂钩环（2.5D 扁环=俯视压缩椭圆）
  ctx.strokeStyle = '#5b6068'; ctx.lineWidth = Math.max(2, H0 * 0.018);
  ctx.beginPath(); ctx.ellipse(x, topY + ringR, ringR, ringR * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
  // 螺旋 10 圈（暗描边+金属体双层，线圈均匀）
  const coils = 10, cy0 = topY + ringR * 2 + 2, N = 120;
  function coilPath(){
    ctx.beginPath(); ctx.moveTo(x, topY + ringR * 2);
    for (let i = 1; i <= N; i++) { const t = i / N; ctx.lineTo(x + r * Math.sin(t * coils * Math.PI * 2), cy0 + coilLen * t); }
  }
  coilPath(); ctx.strokeStyle = '#3f444c'; ctx.lineWidth = Math.max(3.4, H0 * 0.026); ctx.stroke();
  coilPath(); ctx.strokeStyle = '#aab2bb'; ctx.lineWidth = Math.max(2.2, H0 * 0.019); ctx.stroke();
  // 底端挂钩：竖直短茎 + 钩弧
  const stemTop = cy0 + coilLen;
  ctx.strokeStyle = '#5b6068'; ctx.lineWidth = Math.max(2, H0 * 0.018);
  ctx.beginPath(); ctx.moveTo(x, stemTop); ctx.lineTo(x, y - hookL * 0.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + hookL * 0.24, y - hookL * 0.30, hookL * 0.32, Math.PI * 0.75, Math.PI * 2.05); ctx.stroke();
  ctx.restore();
  return {w: 2 * r + 4, h: H, base: {x: x, y: y}, top: {x: x, y: topY + ringR},
    mounts: {top: {x: x, y: topY + ringR}, hook: {x: x, y: y}}};
};

// rubber_band_25d: 橡皮筋（2.5D 环状松弛平放台面，比弹簧软粗哑光）。(x,y)=环底面中心锚点
// opt.w 环外宽默认80。返回 {w,h,base,mounts:{gripL,gripR}} gripL/R=左右拉点（拉伸交互用）
PROPS.rubber_band_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const w0 = opt.w || 80;
  const rx = w0 / 2, ry = w0 * P25.ay;              // 俯视压缩环
  const band = Math.max(3, w0 * 0.09);              // 带厚（粗、哑光）
  const cy0 = y - ry;                               // 环中心（底缘触 y）
  sh25(ctx, x, y, w0 * 0.92, ry * 1.4);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#6f4526'; ctx.lineWidth = band + 1.8;
  ctx.beginPath(); ctx.ellipse(x, cy0, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();   // 暗描边
  ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = band;
  ctx.beginPath(); ctx.ellipse(x, cy0, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();   // 褐色带体
  ctx.strokeStyle = 'rgba(220,180,140,0.45)'; ctx.lineWidth = Math.max(1.2, band * 0.3);
  ctx.beginPath(); ctx.ellipse(x, cy0, rx, ry, 0, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();  // 哑光上缘高光
  ctx.restore();
  return {w: w0 + band, h: 2 * ry + band, base: {x: x, y: y},
    mounts: {gripL: {x: x - rx, y: cy0}, gripR: {x: x + rx, y: cy0}}};
};

// clay_25d: 橡皮泥（2.5D 矮圆柱团 4×4×3cm 视觉，表面哑光橙）。(x,y)=底面中心锚点；opt.s 尺寸倍率默认1
// 返回 {w,h,base,top,mounts:{top}} top=顶面椭圆中心（按压作用点，塑性形变属 R11+）
PROPS.clay_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const s = opt.s || 1;
  const rx = 38 * s, ry = rx * 0.5, h = 38 * s;     // 顶/底椭圆 ry=俯视压缩
  const cb = y - ry;                                // 底椭圆中心（底缘触 y）
  sh25(ctx, x, y, rx * 1.9, ry * 1.4);
  ctx.save();
  ctx.strokeStyle = '#c96f26'; ctx.lineWidth = 1.3;
  // 侧壁（前半：左右竖边+底前弧）
  const g = ctx.createLinearGradient(x - rx, 0, x + rx, 0);
  g.addColorStop(0, '#ef8c3a'); g.addColorStop(0.5, '#f5a25d'); g.addColorStop(1, '#c96f26');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - rx, y - h); ctx.lineTo(x - rx, cb);
  ctx.ellipse(x, cb, rx, ry, 0, Math.PI, 0, true);  // 底前弧（左→底→右）
  ctx.lineTo(x + rx, y - h);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 顶面（亮一档椭圆盖住侧壁接缝）
  ctx.fillStyle = '#f5a25d';
  ctx.beginPath(); ctx.ellipse(x, y - h, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 左上哑光高光弧
  ctx.strokeStyle = 'rgba(255,235,205,0.5)'; ctx.lineWidth = Math.max(2, rx * 0.09); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(x - rx * 0.3, y - h - ry * 0.15, rx * 0.32, ry * 0.34, -0.3, Math.PI * 1.0, Math.PI * 1.8); ctx.stroke();
  ctx.restore();
  return {w: 2 * rx, h: h + ry, base: {x: x, y: y}, top: {x: x, y: y - h},
    mounts: {top: {x: x, y: y - h}}};
};

// bottle_tube_25d: 玻璃瓶+细管（2.5D，瓶身半透明圆润+带孔瓶塞+细管竖直+管内红色液面 h₀）。(x,y)=瓶底面中心锚点
// opt.w 默认84、opt.h 默认200（瓶底→细管顶）。返回 {w,h,base,waterTopY,mounts:{gripL,gripR,tubeTop}} grip=瓶身捏点、tubeTop=管口
PROPS.bottle_tube_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 84, h = opt.h || 200;
  const rx = w * 0.42, ry = rx * 0.45;              // 瓶身椭圆截面（俯视压缩）
  const cb = y - ry;                                // 底椭圆中心（底缘触 y）
  const bh = h * 0.40, bodyTop = y - bh;            // 瓶身直段顶
  const neckB = bodyTop - h * 0.10;                 // 肩段顶（瓶颈起）
  const nw = Math.max(5, w * 0.10);                 // 瓶颈半宽
  const neckTop = y - h * 0.62;                     // 瓶颈顶
  const stopB = neckTop, stopT = y - h * 0.70;      // 瓶塞底/顶
  const tw = Math.max(2.5, w * 0.04);               // 细管半宽
  const tubeTop = y - h * 0.97;                     // 细管顶
  const waterBaseY = neckB + h * 0.03;              // 颈内液面（装满）
  const waterTopY = y - h * 0.55;                   // 管内液柱顶（h₀=5cm 视觉）
  function bottlePath(){
    ctx.beginPath();
    ctx.moveTo(x - nw, neckTop);
    ctx.lineTo(x - nw, neckB);
    ctx.quadraticCurveTo(x - rx * 0.92, neckB + 2, x - rx, bodyTop);   // 肩（圆润）
    ctx.lineTo(x - rx, cb);
    ctx.ellipse(x, cb, rx, ry, 0, Math.PI, 0, true);                   // 底前弧
    ctx.lineTo(x + rx, bodyTop);
    ctx.quadraticCurveTo(x + rx * 0.92, neckB + 2, x + nw, neckB);
    ctx.lineTo(x + nw, neckTop);
    ctx.closePath();
  }
  sh25(ctx, x, y, rx * 2, ry * 1.5);
  ctx.save();
  // 瓶身半透明玻璃
  const gG = ctx.createLinearGradient(x - rx, 0, x + rx, 0);
  gG.addColorStop(0, 'rgba(198,224,242,0.85)'); gG.addColorStop(0.45, 'rgba(226,241,251,0.62)'); gG.addColorStop(1, 'rgba(180,210,234,0.85)');
  bottlePath(); ctx.fillStyle = gG; ctx.fill();
  // 瓶内红水（clip 轮廓内，颈液面以下装满）
  ctx.save();
  bottlePath(); ctx.clip();
  const gB = ctx.createLinearGradient(0, waterBaseY, 0, y);
  gB.addColorStop(0, '#e0574a'); gB.addColorStop(1, '#b93a30');
  ctx.fillStyle = gB;
  ctx.fillRect(x - rx, waterBaseY, rx * 2, y - waterBaseY);
  ctx.restore();
  // 颈内液面椭圆（2.5D 水平液面）
  ctx.fillStyle = '#ef6a5c';
  ctx.beginPath(); ctx.ellipse(x, waterBaseY, nw * 0.85, Math.max(1.4, w * 0.02), 0, 0, Math.PI * 2); ctx.fill();
  // 瓶身描边+左缘白高光
  ctx.strokeStyle = '#8fb6d2'; ctx.lineWidth = Math.max(1.5, w * 0.02);
  bottlePath(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = Math.max(2, w * 0.032); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - rx * 0.72, bodyTop + bh * 0.15); ctx.lineTo(x - rx * 0.72, cb - ry * 0.3); ctx.stroke();
  // 深色带孔瓶塞（下宽上窄梯形+顶面椭圆）
  const sBw = nw + w * 0.03, sTw = nw * 0.92;
  ctx.lineCap = 'butt';
  ctx.fillStyle = '#4b3a2f'; ctx.strokeStyle = '#33261d'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - sBw, stopB); ctx.lineTo(x + sBw, stopB);
  ctx.lineTo(x + sTw, stopT); ctx.lineTo(x - sTw, stopT);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5d4a3c';
  ctx.beginPath(); ctx.ellipse(x, stopT, sTw, Math.max(1.8, w * 0.026), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 细玻璃管（竖直双壁线插过塞心+管口缘）
  ctx.strokeStyle = 'rgba(125,166,196,0.95)'; ctx.lineWidth = Math.max(1.2, w * 0.014); ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - tw, stopT); ctx.lineTo(x - tw, tubeTop);
  ctx.moveTo(x + tw, stopT); ctx.lineTo(x + tw, tubeTop);
  ctx.moveTo(x - tw - 1.5, tubeTop); ctx.lineTo(x + tw + 1.5, tubeTop);
  ctx.stroke();
  // 管内红色液柱（顶面凹弯月，穿塞连到颈液面）
  const cw = Math.max(1.6, tw * 0.6);
  ctx.beginPath();
  ctx.moveTo(x - cw, waterTopY);
  ctx.quadraticCurveTo(x, waterTopY + cw * 0.9, x + cw, waterTopY);
  ctx.lineTo(x + cw, waterBaseY); ctx.lineTo(x - cw, waterBaseY);
  ctx.closePath();
  ctx.fillStyle = '#d8483c'; ctx.fill();
  ctx.strokeStyle = 'rgba(140,45,35,0.75)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - cw, waterTopY);
  ctx.quadraticCurveTo(x, waterTopY + cw * 0.9, x + cw, waterTopY);
  ctx.stroke();
  ctx.restore();
  return {w: 2 * rx, h: h, base: {x: x, y: y}, waterTopY: waterTopY,
    mounts: {gripL: {x: x - rx * 0.8, y: cb - bh * 0.3}, gripR: {x: x + rx * 0.8, y: cb - bh * 0.3}, tubeTop: {x: x, y: tubeTop}}};
};

// cart_25d: 小车（2.5D 车身+四轮+顶部平面可放物）。(x,y)=底面中心锚点（轮底触台）；opt.w 默认120
// 返回 {w,h,base,deck,mounts:{deck,pushF,pushB,top}} deck=顶面中心（放物点）、pushF/B=前/后推点（车身侧面上半）
PROPS.cart_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 120, d = w * 0.36, bh = w * 0.26;
  const wr = Math.max(7, w * 0.06);                 // 轮半径
  const baseLift = wr * 0.4;                        // 车身底抬离台面（轮嵌入）
  const g0 = box25(ctx, x, y - baseLift, w, d, bh, P25.plastic, false);
  const ox = g0.ox, oy = g0.oy;
  ctx.save();
  function wheel(wx, wy, r){
    ctx.fillStyle = '#313844'; ctx.strokeStyle = '#22262e'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(wx, wy, r, r * 0.82, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9aa1ab';
    ctx.beginPath(); ctx.ellipse(wx, wy, r * 0.4, r * 0.33, 0, 0, Math.PI * 2); ctx.fill();
  }
  const wy = y - wr * 0.65;
  wheel(x - w * 0.30 + ox, wy - oy, wr * 0.88); wheel(x + w * 0.30 + ox, wy - oy, wr * 0.88);  // 远侧两轮
  wheel(x - w * 0.30, wy, wr); wheel(x + w * 0.30, wy, wr);                                    // 近侧两轮
  // 顶面载物浅槽（deck 标记）
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = Math.max(1.2, w * 0.012);
  ctx.strokeRect(x - w * 0.22 + ox * 0.5, y - baseLift - bh - oy * 0.5 - oy * 0.28, w * 0.44, oy * 0.56);
  ctx.restore();
  const deck = g0.topC;
  return {w: w + ox, h: bh + wr + oy, base: {x: x, y: y}, deck: deck,
    mounts: {deck: deck, top: deck, pushF: {x: x - w / 2, y: y - baseLift - bh * 0.55}, pushB: {x: x + w / 2 + ox, y: y - baseLift - bh * 0.55 - oy}}};
};

// wood_block_25d: 木块（2.5D 长方体 3×3×6cm 高型，木纹）。(x,y)=底面中心锚点；opt.s 尺寸倍率默认1
// 返回 {w,h,base,top,mounts:{top,pushTop,pushMid,pushLow}} push 三高点=作用点翻倒演示（设计书§3.7）
PROPS.wood_block_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const s = opt.s || 1, w = 52 * s, d = 52 * s, h = 104 * s;
  const g = box25(ctx, x, y, w, d, h, P25.wood);
  ctx.save();
  // 前面木纹（三道横弧）
  ctx.strokeStyle = 'rgba(124,90,48,0.35)'; ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const gy = y - h * i / 4;
    ctx.beginPath(); ctx.moveTo(x - w / 2 + 3 * s, gy);
    ctx.quadraticCurveTo(x, gy - 3 * s, x + w / 2 - 3 * s, gy + 1); ctx.stroke();
  }
  // 顶面木纹（两道沿深度线）
  ctx.strokeStyle = 'rgba(124,90,48,0.30)';
  for (let i = 1; i <= 2; i++) {
    const fx = x - w / 2 + w * i / 3;
    ctx.beginPath(); ctx.moveTo(fx, y - h); ctx.lineTo(fx + g.ox, y - h - g.oy); ctx.stroke();
  }
  // 右侧面暗纹一道
  ctx.strokeStyle = 'rgba(90,64,32,0.35)';
  ctx.beginPath(); ctx.moveTo(x + w / 2 + g.ox * 0.5, y - h - g.oy * 0.5 + 4 * s); ctx.lineTo(x + w / 2 + g.ox * 0.5, y - g.oy * 0.5 - 4 * s); ctx.stroke();
  ctx.restore();
  return {w: w + g.ox, h: h + g.oy, base: {x: x, y: y}, top: g.topC,
    mounts: {top: g.topC, pushTop: {x: x, y: y - h * 0.82}, pushMid: {x: x, y: y - h * 0.5}, pushLow: {x: x, y: y - h * 0.18}}};
};

// box_25d: 箱子（2.5D 6×4×4cm 视觉、比木块矮胖、顶面可摞叠、纸盒质感+封箱带）。(x,y)=底面中心锚点；opt.s 倍率默认1
// 返回 {w,h,base,top,mounts:{top,stack}} top/stack=顶面中心（摞叠放置点，设计书§3.9）
PROPS.box_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const s = opt.s || 1, w = 96 * s, d = 64 * s, h = 60 * s;
  const g = box25(ctx, x, y, w, d, h, P25.paper);
  ctx.save();
  // 顶面封箱带（沿宽度中线一条深带）
  ctx.fillStyle = 'rgba(160,120,70,0.4)';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.09, y - h); ctx.lineTo(x - w * 0.09 + g.ox, y - h - g.oy);
  ctx.lineTo(x + w * 0.09 + g.ox, y - h - g.oy); ctx.lineTo(x + w * 0.09, y - h);
  ctx.closePath(); ctx.fill();
  // 前面标签（白矩形+两道横线字意）
  ctx.fillStyle = 'rgba(255,253,246,0.85)'; ctx.strokeStyle = 'rgba(138,106,66,0.6)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.rect(x - w * 0.24, y - h * 0.72, w * 0.48, h * 0.40); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(120,90,55,0.5)';
  ctx.beginPath(); ctx.moveTo(x - w * 0.18, y - h * 0.60); ctx.lineTo(x + w * 0.18, y - h * 0.60); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - w * 0.18, y - h * 0.46); ctx.lineTo(x + w * 0.08, y - h * 0.46); ctx.stroke();
  // 前面竖直接缝（纸板折边）
  ctx.strokeStyle = 'rgba(138,106,66,0.5)';
  ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x, y); ctx.stroke();
  ctx.restore();
  return {w: w + g.ox, h: h + g.oy, base: {x: x, y: y}, top: g.topC,
    mounts: {top: g.topC, stack: g.topC}};
};

// door_25d: 门（2.5D 门框+门扇，门轴在左、门扇可见厚度、三个推点标记）。(x,y)=门框底面中心锚点
// opt.w 默认170、opt.h 默认220（门宽18cm/高24cm 视觉）；opt.points!==false 画三推点标记
// 返回 {w,h,base,hinge,mounts:{hinge,pushNear,pushMid,pushFar}} 推点=近轴/中轴/远轴（设计书§3.11 力臂演示）
PROPS.door_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 170, h = opt.h || 220;
  const jamb = Math.max(10, w * 0.075), jd = jamb * 0.8;  // 门框柱宽/深
  const l = x - w / 2;
  // 门框三件（左右立柱+上槛，2.5D 木框）
  box25(ctx, l + jamb / 2, y, jamb, jd, h, P25.wood);
  box25(ctx, l + w - jamb / 2, y, jamb, jd, h, P25.wood);
  box25(ctx, x, y - h + jamb / 2, w - jamb * 2, jd, jamb, P25.wood);
  // 门扇（薄厚 2.5D 板，轴在左柱内缘）
  const innerL = l + jamb, panelW = w - jamb * 2 - 4, th = jd * 0.55;
  const panelH = h - jamb - 2;
  const pg = box25(ctx, innerL + 2 + panelW / 2, y - 1, panelW, th, panelH,
    {top: '#e7c99b', front: '#d9b98c', side: '#b98f5e', line: '#8a6a45'});
  const pL = innerL + 2;
  // 门扇装饰内框（前面）
  ctx.save();
  ctx.strokeStyle = 'rgba(138,106,69,0.65)'; ctx.lineWidth = 1.2;
  const ins = Math.min(panelW * 0.16, panelH * 0.05);
  ctx.strokeRect(pL + ins, y - 1 - panelH + ins, panelW - ins * 2, panelH - ins * 2);
  // 合页三枚（左缘金属）
  ctx.fillStyle = '#6b7280';
  for (let i = 0; i < 3; i++) {
    const hy = y - 1 - panelH * (0.16 + i * 0.34);
    ctx.fillRect(pL - 3, hy - Math.max(5, h * 0.025), 7, Math.max(10, h * 0.05));
  }
  // 三推点标记（近轴25%/中轴55%/远轴88% 板宽，半高，黑点白圈）
  const midY = y - 1 - panelH / 2;
  const pts = [0.25, 0.55, 0.88].map(function(f){ return {x: pL + panelW * f, y: midY}; });
  if (opt.points !== false) {
    pts.forEach(function(p){
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(3.5, w * 0.024), 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.stroke();
    });
  }
  ctx.restore();
  return {w: w + pg.ox, h: h, base: {x: x, y: y}, hinge: {x: pL, y: midY},
    mounts: {hinge: {x: pL, y: midY}, pushNear: pts[0], pushMid: pts[1], pushFar: pts[2]}};
};

// skateboard_25d: 滑板（2.5D 板面深色砂纸+枫木侧+四轮）。(x,y)=底面中心锚点（轮底触台）；opt.w 默认130
// 返回 {w,h,base,deck,mounts:{deck}} deck=板面中心（小人踩踏位）
PROPS.skateboard_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 130, d = w * 0.26, th = w * 0.055;
  const wr = Math.max(5, w * 0.045);
  const baseLift = wr * 0.5;
  const g = box25(ctx, x, y - baseLift, w, d, th,
    {top: '#4a4f57', front: '#c99a5e', side: '#a57842', line: '#6b4f2c'}, false);
  ctx.save();
  function wheel(wx, wy, r){
    ctx.fillStyle = '#3f4650';
    ctx.beginPath(); ctx.ellipse(wx, wy, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cf8a3a';
    ctx.beginPath(); ctx.ellipse(wx, wy, r * 0.4, r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
  }
  const wy = y - wr * 0.6;
  wheel(x - w * 0.32 + g.ox, wy - g.oy, wr * 0.85); wheel(x + w * 0.32 + g.ox, wy - g.oy, wr * 0.85);
  wheel(x - w * 0.32, wy, wr); wheel(x + w * 0.32, wy, wr);
  // 板面中线贴纸（白色细条，沿深度中线）
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = Math.max(1.5, w * 0.012); ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.38, y - baseLift - th);
  ctx.lineTo(x + w * 0.38 + g.ox * 0.7, y - baseLift - th - g.oy * 0.7);
  ctx.stroke();
  ctx.restore();
  return {w: w + g.ox, h: th + wr + g.oy, base: {x: x, y: y}, deck: g.topC,
    mounts: {deck: g.topC}};
};

// figure_25d: 踩板小人（2.5D，圆头+躯干+双腿双臂前伸互推姿态，无真脸）。(x,y)=脚底面中心锚点
// opt.h 身高默认110；opt.variant 'thin'(默认)|'fat' 胖/瘦两型（躯干宽+头径+衣色随型变）
// 返回 {w,h,base,head,mounts:{handL,handR}} handL/R=双手互推作用点（设计书§3.12）
PROPS.figure_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const H = opt.h || 110, fat = opt.variant === 'fat';
  const bodyW = H * (fat ? 0.30 : 0.18), headR = H * (fat ? 0.145 : 0.125);
  const hipY = y - H * 0.36, bodyT = y - H + headR * 2;
  sh25(ctx, x, y, bodyW * 1.7, bodyW * 0.6);
  ctx.save();
  ctx.lineCap = 'round';
  // 双腿（深色裤）
  const legW = bodyW * 0.32;
  ctx.strokeStyle = '#3f5878'; ctx.lineWidth = Math.max(3.5, H * 0.055);
  ctx.beginPath(); ctx.moveTo(x - legW, hipY); ctx.lineTo(x - legW * 1.1, y - 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + legW, hipY); ctx.lineTo(x + legW * 1.1, y - 2); ctx.stroke();
  // 鞋（小椭圆）
  ctx.fillStyle = '#333a44';
  ctx.beginPath(); ctx.ellipse(x - legW * 1.1, y - 2, legW * 0.78, legW * 0.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + legW * 1.1, y - 2, legW * 0.78, legW * 0.4, 0, 0, Math.PI * 2); ctx.fill();
  // 躯干（前面亮+右侧暗一档=2.5D 体感）
  const shirt = fat ? {f: '#e07b5f', s: '#c4604a'} : {f: '#5b9bc4', s: '#4a83ab'};
  ctx.fillStyle = shirt.f; ctx.strokeStyle = 'rgba(40,50,65,0.55)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(x - bodyW / 2, bodyT, bodyW, hipY - bodyT + H * 0.02, bodyW * 0.35); ctx.fill(); ctx.stroke();
  ctx.fillStyle = shirt.s;
  ctx.beginPath(); ctx.roundRect(x + bodyW * 0.20, bodyT + 2, bodyW * 0.30, hipY - bodyT, bodyW * 0.14); ctx.fill();
  // 双臂（前伸互推姿态）
  ctx.strokeStyle = shirt.f; ctx.lineWidth = Math.max(2.5, H * 0.042);
  ctx.beginPath(); ctx.moveTo(x - bodyW * 0.4, bodyT + H * 0.08); ctx.lineTo(x - bodyW * 0.85, bodyT + H * 0.22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + bodyW * 0.4, bodyT + H * 0.08); ctx.lineTo(x + bodyW * 0.85, bodyT + H * 0.22); ctx.stroke();
  // 头（圆头无脸+发色顶弧，胖型头大一圈）
  ctx.fillStyle = '#f0c9a0'; ctx.strokeStyle = '#c99b6e'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x, bodyT - headR * 0.9, headR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = fat ? '#5a4634' : '#3f4a58';
  ctx.beginPath(); ctx.arc(x, bodyT - headR * 1.0, headR, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  ctx.restore();
  const handL = {x: x - bodyW * 0.85, y: bodyT + H * 0.22}, handR = {x: x + bodyW * 0.85, y: bodyT + H * 0.22};
  return {w: bodyW * 2.2, h: H, base: {x: x, y: y}, head: {x: x, y: bodyT - headR * 1.9},
    mounts: {handL: handL, handR: handR}};
};

// balloon_25d: 气球（2.5D，opt.inflate 0..1 吹气前瘪→吹气后鼓；喷口 mounts.jet 恒朝下）。(x,y)=喷口底面中心锚点
// opt.r 充气满半径默认52。返回 {w,h,base,center,mounts:{jet,top}} jet=喷口（喷气点，设计书§3.13）、top=球顶
PROPS.balloon_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const inf = Math.max(0, Math.min(1, opt.inflate === undefined ? 1 : opt.inflate));
  const R = (opt.r || 52) * (0.45 + 0.55 * inf);
  const ry = R * (1 - 0.12 * inf);                  // 微扁（俯视压缩感）
  const flat = inf < 0.25;                          // 瘪态阈值
  const cy = flat ? y - R * 0.4 : y - R * 0.9 - inf * 4;
  sh25(ctx, x, y, R * 1.3, R * 0.5);
  ctx.save();
  // 喷口小三角（底部收口，恒朝下）
  ctx.fillStyle = '#c94f6d'; ctx.strokeStyle = '#a63a55'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - R * 0.10, y - 2); ctx.lineTo(x + R * 0.10, y - 2);
  ctx.lineTo(x, cy + ry * 0.90); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (flat) {
    // 瘪态：松弛褶皱扁囊（贝塞尔软塌轮廓+褶线）
    ctx.fillStyle = '#e4607f'; ctx.strokeStyle = '#a63a55'; ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(x - R * 0.9, y - 3);
    ctx.bezierCurveTo(x - R * 0.7, y - R * 0.75, x - R * 0.2, y - R * 0.5, x + R * 0.1, y - R * 0.8);
    ctx.bezierCurveTo(x + R * 0.5, y - R * 1.0, x + R * 0.85, y - R * 0.4, x + R * 0.9, y - 3);
    ctx.bezierCurveTo(x + R * 0.4, y + 2, x - R * 0.4, y + 2, x - R * 0.9, y - 3);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(160,50,75,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - R * 0.4, y - 4); ctx.quadraticCurveTo(x - R * 0.1, y - R * 0.5, x + R * 0.3, y - 5); ctx.stroke();
  } else {
    // 鼓态：橡胶质感球体+左上高光
    const g = ctx.createRadialGradient(x - R * 0.35, cy - R * 0.4, R * 0.1, x, cy, R * 1.15);
    g.addColorStop(0, '#f58ba4'); g.addColorStop(0.6, '#e4607f'); g.addColorStop(1, '#c24260');
    ctx.fillStyle = g; ctx.strokeStyle = '#a63a55'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(x, cy, R, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.ellipse(x - R * 0.4, cy - ry * 0.45, R * 0.20, ry * 0.12, -0.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  const top = flat ? {x: x, y: y - R * 0.9} : {x: x, y: cy - ry};
  return {w: 2 * R, h: y - top.y, base: {x: x, y: y}, center: {x: x, y: cy},
    mounts: {jet: {x: x, y: y - 2}, top: top}};
};

// meter_25d: 条形盒测力计（2.5D 青绿盒身+白面板刻度0-5N+红指针+顶吊环+底J钩）。(x,y)=底钩锚点（向上画）
// opt.h 总长默认200；opt.needle 0..5 读数(N)→指针沿槽位移（欠阻尼摆动属 R11+，本件只按值画）
// 返回 {w,h,base,reading,top,mounts:{ring,hook}} ring=顶吊环 snap、hook=底钩 snap（三用位挂接）
PROPS.meter_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const H = opt.h || 200;
  const F = Math.max(0, Math.min(5, opt.needle || 0));
  const bw = H * 0.20, d = bw * 0.55;               // 盒身宽/深
  const hookL = H * 0.10, ringR = H * 0.035;
  const bodyH = H - hookL - ringR * 2 - 6;
  const bodyB = y - hookL, bodyT = bodyB - bodyH;
  const g0 = box25(ctx, x, bodyB, bw, d, bodyH, P25.teal, false);
  ctx.save();
  ctx.lineCap = 'round';
  // 底 J 钩（金属，同 v1 spring_meter 画法）
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = Math.max(2, H * 0.014);
  ctx.beginPath(); ctx.moveTo(x, bodyB); ctx.lineTo(x, y - hookL * 0.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + hookL * 0.24, y - hookL * 0.30, hookL * 0.32, Math.PI * 0.75, Math.PI * 2.05); ctx.stroke();
  // 前面白面板
  const pL = x - bw * 0.38, pR = x + bw * 0.38, pT = bodyT + H * 0.035, pB = bodyB - H * 0.025;
  ctx.fillStyle = '#fbfaf6'; ctx.strokeStyle = '#c8d2cf'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(pL, pT, pR - pL, pB - pT, 2); ctx.fill(); ctx.stroke();
  // 中央黑槽
  const slotW = Math.max(2.5, H * 0.015), slotT = pT + H * 0.055, slotB = pB - H * 0.018, slotLen = slotB - slotT;
  ctx.fillStyle = '#22262b';
  ctx.beginPath(); ctx.roundRect(x - slotW / 2, slotT, slotW, slotLen, slotW * 0.4); ctx.fill();
  // 刻度（左右列 0..5，主刻度整数带数字+0.5小格）
  ctx.strokeStyle = '#3a4a4c'; ctx.fillStyle = '#3a4a4c';
  ctx.font = Math.max(7, H * 0.034) + 'px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  for (let v = 0; v <= 5.0001; v += 0.5) {
    const ty = slotT + slotLen * (v / 5), maj = Math.abs(v - Math.round(v)) < 0.01;
    ctx.lineWidth = maj ? 1.3 : 0.8;
    ctx.beginPath(); ctx.moveTo(pL + 2, ty); ctx.lineTo(pL + 2 + (maj ? H * 0.021 : H * 0.011), ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pR - 2, ty); ctx.lineTo(pR - 2 - (maj ? H * 0.021 : H * 0.011), ty); ctx.stroke();
    if (maj) ctx.fillText(String(Math.round(v)), pL + 4 + H * 0.022, ty);
  }
  // 单位 N（面板顶部）
  ctx.textAlign = 'center'; ctx.font = 'bold ' + Math.max(7, H * 0.032) + 'px sans-serif';
  ctx.fillText('N', x, slotT - H * 0.024);
  // 红指针（横贯面板，随读数位移；两端尖角）
  const ptrY = slotT + slotLen * (F / 5), pW2 = bw * 0.30, pH = Math.max(2, H * 0.011);
  ctx.fillStyle = '#d84343'; ctx.strokeStyle = '#9c2f2f'; ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(x - pW2, ptrY - pH * 0.3); ctx.lineTo(x + pW2, ptrY - pH * 0.3);
  ctx.lineTo(x + pW2 + pH * 0.6, ptrY); ctx.lineTo(x + pW2, ptrY + pH * 0.3);
  ctx.lineTo(x - pW2, ptrY + pH * 0.3); ctx.lineTo(x - pW2 - pH * 0.6, ptrY);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 顶吊环（2.5D 扁环+短茎）
  const ringCY = bodyT - ringR - 2;
  ctx.strokeStyle = '#8b939b'; ctx.lineWidth = Math.max(2, H * 0.012);
  ctx.beginPath(); ctx.moveTo(x, bodyT); ctx.lineTo(x, ringCY + ringR * 0.5); ctx.stroke();
  ctx.strokeStyle = '#5f676f'; ctx.lineWidth = Math.max(2.2, H * 0.014);
  ctx.beginPath(); ctx.ellipse(x, ringCY, ringR, ringR * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#c3cad1'; ctx.lineWidth = Math.max(1.2, H * 0.008);
  ctx.beginPath(); ctx.ellipse(x, ringCY, ringR, ringR * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  return {w: bw + g0.ox, h: H, base: {x: x, y: y}, reading: F, top: {x: x, y: ringCY - ringR * 0.55},
    mounts: {ring: {x: x, y: ringCY}, hook: {x: x, y: y}}};
};

// weight_hook_25d: 钩码/砝码（2.5D 金属圆柱 50g 视觉+顶部挂环）。(x,y)=底面中心锚点；opt.g 克数默认50（尺寸线性档，50g 印字）
// 返回 {w,h,base,hook,mounts:{hook,top}} hook=顶挂环 snap（挂弹簧/测力计钩）
PROPS.weight_hook_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const g = opt.g === undefined ? 50 : opt.g;
  const rx = Math.max(11, 9 + g * 0.05);            // 50g→rx11.5
  const ry = rx * 0.5, h = Math.max(20, 16 + g * 0.14);  // 50g→h23
  const ringR = Math.max(4, rx * 0.34);
  const cb = y - ry;                                // 底椭圆中心（底缘触 y）
  sh25(ctx, x, y, rx * 2, ry * 1.4);
  ctx.save();
  // 顶挂环（2.5D 扁环+短茎）
  ctx.strokeStyle = '#5b6068'; ctx.lineWidth = Math.max(2, rx * 0.16); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x, y - h - ringR * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y - h - ringR * 1.1, ringR, ringR * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
  // 圆柱侧壁（金属渐变）
  const gm = ctx.createLinearGradient(x - rx, 0, x + rx, 0);
  gm.addColorStop(0, '#8f979f'); gm.addColorStop(0.45, '#d6dade'); gm.addColorStop(1, '#7e868e');
  ctx.fillStyle = gm; ctx.strokeStyle = '#5b6068'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - rx, y - h); ctx.lineTo(x - rx, cb);
  ctx.ellipse(x, cb, rx, ry, 0, Math.PI, 0, true);  // 底前弧
  ctx.lineTo(x + rx, y - h);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 顶面椭圆盖（亮一档）
  ctx.fillStyle = '#e2e6ea';
  ctx.beginPath(); ctx.ellipse(x, y - h, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 质量印字（前面）
  ctx.fillStyle = '#3f4650'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold ' + Math.max(8, Math.min(h * 0.34, rx * 0.5)) + 'px sans-serif';
  ctx.fillText(g + ' g', x, y - h * 0.45 + ry * 0.3);
  ctx.restore();
  const hook = {x: x, y: y - h - ringR * 1.1};
  return {w: 2 * rx, h: h + ry + ringR * 1.6, base: {x: x, y: y}, hook: hook,
    mounts: {hook: hook, top: {x: x, y: y - h}}};
};

// iron_stand_25d: 铁架台（2.5D 化，R7 修正几何：底座宽、竖杆立横臂左端、横臂向右前挑出悬臂、右段挂钩）。(x,y)=底座底面中心锚点
// opt.h 总高默认260。参考 exp-force-lab-core.js L287-296 注释几何，重绘为 2.5D 顶面+侧面+统一投影
// 返回 {w,h,base,mounts:{hook,armTip,rodTop,base}} hook=横臂右段悬挂点（约73%处，A1 铁架台顶挂）、armTip=横臂右端
PROPS.iron_stand_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const H = opt.h || 260;
  const baseW = H * 0.44, baseD = H * 0.17, baseH = H * 0.045;   // 底座加宽压竖杆脚下
  const rodW = H * 0.042, armT = H * 0.038, armD = rodW * 1.1;
  const rodX = x - baseW * 0.28;                                  // 竖杆中心=横臂左端（非十字形）
  const armLen = baseW * 0.92;                                    // 横臂自竖杆顶向右前挑出
  const rodH = H - baseH - armT;
  const armY = y - baseH - rodH;                                  // 横臂底
  // 底座（2.5D 金属板）
  box25(ctx, x, y, baseW, baseD, baseH, P25.metal);
  // 竖杆（立于横臂左端，2.5D 立柱+左缘高光）
  const rg = box25(ctx, rodX, y - baseH + 1, rodW, armD, rodH, P25.metal, true);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = Math.max(1, rodW * 0.14); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(rodX - rodW * 0.28, y - baseH + 4); ctx.lineTo(rodX - rodW * 0.28, armY + 4); ctx.stroke();
  ctx.restore();
  // 横臂（右挑悬臂：宽=armLen、深=armD、高=armT 的水平 2.5D 板）
  const ag = box25(ctx, rodX + armLen / 2 - rodW * 0.3, armY + armT, armLen, armD, armT, P25.metal, true);
  // 竖杆顶帽（小椭圆）+ 横臂-竖杆接头夹块
  ctx.save();
  ctx.fillStyle = '#c8ced5'; ctx.strokeStyle = '#5b6068'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(rodX, armY - 1, rodW * 0.62, rodW * 0.3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#7d838c';
  ctx.beginPath(); ctx.roundRect(rodX - rodW * 0.8, armY - armT * 0.4, rodW * 1.9, armT * 1.5, 2); ctx.fill(); ctx.stroke();
  // 右段挂钩（横臂下缘约 73% 处，金属钩弧）
  const hookX = rodX + armLen * 0.73, hookTop = armY + 2, hr = Math.max(5, H * 0.024);
  ctx.strokeStyle = '#5b6068'; ctx.lineWidth = Math.max(2, H * 0.011); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(hookX, hookTop); ctx.lineTo(hookX, hookTop + hr * 1.2); ctx.stroke();
  ctx.beginPath(); ctx.arc(hookX + hr * 0.8, hookTop + hr * 1.5, hr, Math.PI * 0.9, Math.PI * 2.2); ctx.stroke();
  ctx.restore();
  const armTip = {x: rodX + armLen - rodW * 0.3 + ag.ox, y: armY + armT - ag.oy};
  return {w: baseW + baseD * P25.ax, h: H + baseD * P25.ay, base: {x: x, y: y},
    mounts: {hook: {x: hookX + hr * 0.8, y: hookTop + hr * 1.5 + hr}, armTip: armTip,
      rodTop: {x: rodX, y: armY - 1}, base: {x: x, y: y}}};
};

// table_25d: 实验大桌面背景件（2.5D 暖白木纹台面+桌沿厚度+右侧裙边；opt.showZones=true 画五区+工具架分区参考线，设计书§2.2 百分比制）
// (x,y)=桌面前沿底边中心锚点；opt.w 总宽默认960、opt.d 台面深度默认430、opt.th 桌沿厚默认24
// 返回 {w,h,base,top:{fl,bl,br,fr},at(fx,fy),zones:[{id,x0,y0,x1,y1}]} at=台面归一坐标(fx 0..1 左→右, fy 0..1 后→前)→世界坐标（摆放对齐单源）
PROPS.table_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 960, d = opt.d || 430, th = opt.th || 24;
  const ox = d * P25.ax, oy = d * P25.ay;
  const FL = {x: x - w / 2, y: y - th}, FR = {x: x + w / 2, y: y - th};
  const BL = {x: FL.x + ox, y: FL.y - oy}, BR = {x: FR.x + ox, y: FR.y - oy};
  ctx.save();
  // 右侧裙边（桌面厚度侧面）
  ctx.fillStyle = '#a57842'; ctx.strokeStyle = '#7c5a30'; ctx.lineWidth = 1.2; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(FR.x, FR.y); ctx.lineTo(BR.x, BR.y);
  ctx.lineTo(BR.x, BR.y + th); ctx.lineTo(FR.x, FR.y + th);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 前沿桌裙（厚度立面）
  ctx.fillStyle = '#b5844e';
  ctx.beginPath(); ctx.rect(FL.x, FL.y, w, th); ctx.fill(); ctx.stroke();
  // 前沿亮线（桌沿倒角）
  ctx.strokeStyle = 'rgba(255,240,215,0.5)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(FL.x + 2, FL.y + 1.5); ctx.lineTo(FR.x - 2, FL.y + 1.5); ctx.stroke();
  // 台面（暖白浅木纹平行四边形）
  const gT = ctx.createLinearGradient(0, BL.y, 0, FL.y);
  gT.addColorStop(0, '#f3ead9'); gT.addColorStop(0.55, '#eee1c9'); gT.addColorStop(1, '#e7d7ba');
  ctx.fillStyle = gT; ctx.strokeStyle = '#7c5a30'; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(FL.x, FL.y); ctx.lineTo(BL.x, BL.y); ctx.lineTo(BR.x, BR.y); ctx.lineTo(FR.x, FR.y);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 台面归一坐标→世界坐标（摆放对齐单源；fy=1 前沿、fy=0 后沿）
  function at(fx, fy){
    const bxp = BL.x + (BR.x - BL.x) * fx, byp = BL.y + (BR.y - BL.y) * fx;
    const fxp = FL.x + (FR.x - FL.x) * fx, fyp = FL.y + (FR.y - FL.y) * fx;
    return {x: bxp + (fxp - bxp) * fy, y: byp + (fyp - byp) * fy};
  }
  // 木纹（六道沿宽度长线，确定性微弯）
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(FL.x, FL.y); ctx.lineTo(BL.x, BL.y); ctx.lineTo(BR.x, BR.y); ctx.lineTo(FR.x, FR.y);
  ctx.closePath(); ctx.clip();
  ctx.strokeStyle = 'rgba(160,120,70,0.16)'; ctx.lineWidth = 1.2;
  for (let i = 1; i <= 6; i++) {
    const fy = i / 7;
    const p0 = at(-0.02, fy), p1 = at(1.02, fy);
    ctx.beginPath(); ctx.moveTo(p0.x, p0.y);
    ctx.quadraticCurveTo(x + ox * 0.5, (p0.y + p1.y) / 2 + (i % 2 ? 3 : -3), p1.x, p1.y);
    ctx.stroke();
  }
  ctx.restore();
  // 五区+工具架分区参考线（§2.2 百分比制：x% → fx=(x-2)/96，y% → fy=(y-2)/96）
  const ZONES = [
    {id: 'Z1', x0: 8, y0: 8, x1: 32, y1: 36},
    {id: 'Z2', x0: 34, y0: 24, x1: 66, y1: 58},
    {id: 'Z3', x0: 68, y0: 8, x1: 92, y1: 38},
    {id: 'Z4', x0: 8, y0: 62, x1: 34, y1: 90},
    {id: 'Z5', x0: 66, y0: 62, x1: 92, y1: 90},
    {id: 'ZT', x0: 20, y0: 92, x1: 80, y1: 98}
  ];
  const zw = [];
  ZONES.forEach(function(z){
    const f = function(px, py){ return at(Math.max(0, Math.min(1, (px - 2) / 96)), Math.max(0, Math.min(1, (py - 2) / 96))); };
    const p0 = f(z.x0, z.y0), p1 = f(z.x1, z.y0), p2 = f(z.x1, z.y1), p3 = f(z.x0, z.y1);
    zw.push({id: z.id, x0: p0.x, y0: p0.y, x1: p2.x, y1: p2.y});
    if (opt.showZones) {
      ctx.save();
      ctx.strokeStyle = 'rgba(224,162,10,0.55)'; ctx.lineWidth = 1.2; ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
      ctx.closePath(); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(122,92,30,0.65)';
      ctx.font = '600 ' + Math.max(10, w * 0.012) + 'px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(z.id, p0.x + 4, p0.y + 3);
      ctx.restore();
    }
  });
  ctx.restore();
  return {w: w + ox, h: th + oy, base: {x: x, y: y},
    top: {fl: FL, bl: BL, br: BR, fr: FR}, at: at, zones: zw,
    mounts: {center: at(0.5, 0.5)}};
};

})(typeof window !== 'undefined' ? window : globalThis);

(function(global){
'use strict';
const PROPS = global.PROPS = global.PROPS || {};
const rand = PROPS.rand || function(seed){
  const s = Math.sin(seed * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

/* ============================================================
 * props-mech.js — 第七章「力」力学器材标准件 v1（2026-11-04，c7 单A，16件；2026-11-06 C7V2-D1 增补 glass_bottle_tube=17件；2026-11-11 C7V3-R1 重绘 spring_horizontal/hand_press/spring_meter + 增补 hook_link=18件；2026-11-12 C7V4-R8 增补 _25d「一张桌子」新件14件15函数=33件，旧件全保留；2026-11-12 C7V4-R9 增补承载件 tray/track/door_frame/pump _25d=37件；2026-11-20 C7V6-L1 增补第七章实验绘制器材9件 dial_side/car_side/person_side/sponge_pad/brake_pedal/stand_side/weight_cyl/spring_helix/meter_side=46件，旧37件零改动）
 * 约定同 props-optics/props-density：IIFE 挂 global.PROPS；(x,y)=底面中心锚点
 * （吊挂件=底钩锚点向上画；旋转件=中心锚点）；有挂载点的件返回几何含 mounts:{锚名:{x,y}}（世界坐标）。
 * 视觉全原创（PhET masses-and-springs 仅借交互语义：圈距线性变疏/柱高∝质量档/顶钩底钩 snap）。
 * 件清单：plasticine / hand_press / spring_horizontal / spring_vertical / bar_magnet /
 *   iron_ball / ball_track_table / door / magnet_cart / spring_meter / hook_weight /
 *   ruler_flex / rubber_band / plumb_line / earth_globe / person_pin / glass_bottle_tube(C7V2-D1) / hook_link(C7V3-R1)
 * ============================================================ */

// MECH_IDS: 本文件件名清单（gallery 与下游 B 单索引用）
PROPS.MECH_IDS = ['plasticine','hand_press','spring_horizontal','spring_vertical','bar_magnet','iron_ball','ball_track_table','door','magnet_cart','spring_meter','hook_weight','ruler_flex','rubber_band','plumb_line','earth_globe','person_pin','glass_bottle_tube','hook_link','spring_25d','rubber_band_25d','clay_25d','bottle_tube_25d','cart_25d','wood_block_25d','box_25d','door_25d','skateboard_25d','figure_25d','balloon_25d','meter_25d','weight_hook_25d','iron_stand_25d','table_25d','tray_25d','track_25d','door_frame_25d','pump_25d'];
// MECH_25D_IDS: C7V4-R8「一张桌子」2.5D 新件清单（14件15函数；旧件保留不删，v3 页面还在用）
PROPS.MECH_25D_IDS = ['spring_25d','rubber_band_25d','clay_25d','bottle_tube_25d','cart_25d','wood_block_25d','box_25d','door_25d','skateboard_25d','figure_25d','balloon_25d','meter_25d','weight_hook_25d','iron_stand_25d','table_25d','tray_25d','track_25d','door_frame_25d','pump_25d'];

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

/* ============================================================
 * C7V4-R9「一张桌子」承载件 4 件（2026-11-12）：tray_25d / track_25d / door_frame_25d / pump_25d
 * 全部走 P25/sh25/box25 单源 token；(x,y)=底面中心锚点；返回 {w,h,base,mounts}
 * ============================================================ */

// tray_25d: 器材托盘（2.5D 浅盘：外框盘壁+内底凹槽位 opt.slots 默认4）。(x,y)=盘底面中心锚点
// opt.w 外宽默认240；返回 {w,h,base,top,mounts:{slots:[4]世界坐标,top}} slots=凹槽中心（R10 吸附用）
PROPS.tray_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 240, d = w * 0.44, h = w * 0.085;   // 浅盘：低壁
  const n = opt.slots || 4;
  const pal = {top: '#e9dfc6', front: '#d2c4a4', side: '#b6a684', line: '#8a7a5c'};
  const g = box25(ctx, x, y, w, d, h, pal);
  const ox = g.ox, oy = g.oy;
  // 内底（顶面四角向中心缩盘壁厚 rt + 下沉内槽深 drop → 浅色底板平行四边形）
  const rt = w * 0.035, drop = h * 0.55;
  const T = g.top;
  const cx0 = x + ox / 2, cy0 = T.fl.y - oy / 2;
  function shr(p){ const vx = p.x - cx0, vy = p.y - cy0; const L = Math.hypot(vx, vy) || 1; return {x: p.x - vx / L * rt, y: p.y - vy / L * rt * 0.6 + drop}; }
  const bfl = shr(T.fl), bbl = shr(T.bl), bbr = shr(T.br), bfr = shr(T.fr);
  ctx.save();
  ctx.fillStyle = '#ddceac'; ctx.strokeStyle = pal.line; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bfl.x, bfl.y); ctx.lineTo(bbl.x, bbl.y); ctx.lineTo(bbr.x, bbr.y); ctx.lineTo(bfr.x, bfr.y);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 凹槽位（内底均分 n 个：椭圆暗窝+下缘高光）
  const slots = [];
  const sr = (bfr.x - bfl.x) / n * 0.30, sry = sr * 0.5;
  for (let i = 0; i < n; i++) {
    const f = (i + 0.5) / n;
    const pF = {x: bfl.x + (bfr.x - bfl.x) * f, y: bfl.y + (bfr.y - bfl.y) * f};
    const pB = {x: bbl.x + (bbr.x - bbl.x) * f, y: bbl.y + (bbr.y - bbl.y) * f};
    const p = {x: (pF.x + pB.x) / 2, y: (pF.y + pB.y) / 2};
    slots.push(p);
    ctx.fillStyle = 'rgba(122,102,66,0.30)';
    ctx.beginPath(); ctx.ellipse(p.x, p.y, sr, sry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,250,235,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, sr, sry, 0, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  }
  // 盘壁内缘亮线（前沿内壁）
  ctx.strokeStyle = 'rgba(255,250,235,0.45)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(bfl.x + 2, bfl.y - 1); ctx.lineTo(bfr.x - 2, bfr.y - 1); ctx.stroke();
  ctx.restore();
  return {w: w + ox, h: h + oy, base: {x: x, y: y}, top: g.topC,
    mounts: {slots: slots, top: g.topC}};
};

// track_25d: 光滑桌面轨道（2.5D 长条低矮导轨+两端挡块+顶面光滑亮带）。(x,y)=底面中心锚点
// opt.w 总长默认360；返回 {w,h,base,mounts:{start,end,axis,len,top}} start/end=导轨顶面两端行车线点、axis=单位向量（水平向右）
PROPS.track_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 360, d = w * 0.13, h = opt.h || w * 0.05;
  const g = box25(ctx, x, y, w, d, h, P25.metal);
  const ox = g.ox, oy = g.oy;
  const stopW = w * 0.045, stopH = h * 2.4;
  // 两端挡块（小立柱，跳投影）
  box25(ctx, x - w / 2 + stopW / 2, y - h + 1, stopW, d * 0.9, stopH, P25.wood, true);
  box25(ctx, x + w / 2 - stopW / 2, y - h + 1, stopW, d * 0.9, stopH, P25.wood, true);
  ctx.save();
  // 顶面光滑亮带（沿行车方向两道高光=近似光滑语义）
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(1.4, h * 0.10); ctx.lineCap = 'round';
  const ty = y - h - oy * 0.5;
  ctx.beginPath(); ctx.moveTo(x - w * 0.40 + ox * 0.5, ty); ctx.lineTo(x + w * 0.40 + ox * 0.5, ty); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.moveTo(x - w * 0.40 + ox * 0.5, ty - oy * 0.22); ctx.lineTo(x + w * 0.40 + ox * 0.5, ty - oy * 0.22); ctx.stroke();
  // 前沿刻度短线（每 1/8 长一道，轨道标尺感）
  ctx.strokeStyle = 'rgba(91,96,104,0.4)'; ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    const tx = x - w / 2 + w * i / 8;
    ctx.beginPath(); ctx.moveTo(tx, y - h + 2); ctx.lineTo(tx, y - h + h * 0.4); ctx.stroke();
  }
  ctx.restore();
  const start = {x: x - w * 0.38 + ox * 0.5, y: ty}, end = {x: x + w * 0.38 + ox * 0.5, y: ty};
  return {w: w + ox, h: h + stopH + oy, base: {x: x, y: y},
    mounts: {start: start, end: end, axis: {x: 1, y: 0}, len: end.x - start.x, top: g.topC}};
};

// door_frame_25d: 门框（2.5D 墙体门口套框：浅墙背板+厚木套三件，与 door_25d 配套、门轴位在左）。(x,y)=框底面中心锚点
// opt.w 外宽默认210、opt.h 外高默认250（比 door_25d 默认大一圈套住）；返回 {w,h,base,mounts:{hinge,pushPoints:[3],opening}}
// hinge=左柱内缘半高（门轴位）、pushPoints=门口净宽 25%/55%/88% 三推点（与 door_25d 推点约定一致）、opening=门口净宽中点
PROPS.door_frame_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 210, h = opt.h || 250;
  const jamb = Math.max(12, w * 0.085), jd = jamb * 0.9;
  const l = x - w / 2, innerL = l + jamb, innerW = w - jamb * 2;
  // 墙背板（门口内浅色墙面，2.5D 平行四边形微退后）
  const ox = jd * P25.ax, oy = jd * P25.ay;
  ctx.save();
  ctx.fillStyle = '#efe6d2'; ctx.strokeStyle = '#b3a284'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(innerL, y); ctx.lineTo(innerL + ox, y - oy);
  ctx.lineTo(innerL + ox, y - h + jamb - oy); ctx.lineTo(innerL, y - h + jamb);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 门口内缘暗线（深度暗示）
  ctx.strokeStyle = 'rgba(120,100,70,0.3)';
  ctx.beginPath(); ctx.moveTo(innerL + ox * 0.5, y - oy * 0.5); ctx.lineTo(innerL + ox * 0.5, y - h + jamb - oy * 0.5); ctx.stroke();
  ctx.restore();
  // 套框三件（左柱=门轴侧、右柱、上槛；深木色比 door_25d 门框重一档）
  const pal = {top: '#d3a86e', front: '#b5844e', side: '#93683a', line: '#6f4d29'};
  box25(ctx, l + jamb / 2, y, jamb, jd, h, pal);
  box25(ctx, l + w - jamb / 2, y, jamb, jd, h, pal);
  box25(ctx, x, y - h + jamb / 2, w - jamb * 2, jd, jamb, pal);
  const midY = y - (h - jamb) * 0.5;
  const pts = [0.25, 0.55, 0.88].map(function(f){ return {x: innerL + innerW * f, y: midY}; });
  return {w: w + ox, h: h + oy, base: {x: x, y: y},
    mounts: {hinge: {x: innerL, y: midY}, pushPoints: pts, opening: {x: x + ox / 2, y: midY}}};
};

// pump_25d: 打气嘴（2.5D 小圆柱泵体+顶部软管接头+金属嘴尖）。(x,y)=底面中心锚点
// opt.h 泵体高默认64；返回 {w,h,base,mounts:{nozzle,top}} nozzle=嘴尖（R10+ 接气球喷口）
PROPS.pump_25d = function(ctx, x, y, opt){
  opt = opt || {};
  const H = opt.h || 64;
  const rx = H * 0.24, ry = rx * 0.5, bh = H * 0.62;   // 圆柱泵体
  const cb = y - ry;
  sh25(ctx, x, y, rx * 2, ry * 1.4);
  ctx.save();
  // 泵体圆柱（塑料红，金属渐变画法同 weight_hook_25d）
  const gm = ctx.createLinearGradient(x - rx, 0, x + rx, 0);
  gm.addColorStop(0, '#c4604a'); gm.addColorStop(0.45, '#e88a70'); gm.addColorStop(1, '#b0503c');
  ctx.fillStyle = gm; ctx.strokeStyle = '#8c3f30'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - rx, y - bh); ctx.lineTo(x - rx, cb);
  ctx.ellipse(x, cb, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(x + rx, y - bh);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 顶面椭圆盖 + 泵杆短柄
  ctx.fillStyle = '#ef9d86';
  ctx.beginPath(); ctx.ellipse(x, y - bh, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#5b6068'; ctx.lineWidth = Math.max(2.4, H * 0.05); ctx.lineCap = 'round';
  const rodT = y - bh - H * 0.24;
  ctx.beginPath(); ctx.moveTo(x, y - bh); ctx.lineTo(x, rodT); ctx.stroke();
  ctx.fillStyle = '#3f4650';
  ctx.beginPath(); ctx.roundRect(x - rx * 0.42, rodT - H * 0.05, rx * 0.84, H * 0.06, 2); ctx.fill();
  // 软管（泵体侧壁→右弯贝塞尔→金属嘴尖）
  const hoseX0 = x + rx * 0.9, hoseY0 = y - bh * 0.75;
  const nz = {x: x + rx + H * 0.34, y: y - bh * 0.30};
  ctx.strokeStyle = '#4a4f57'; ctx.lineWidth = Math.max(2.6, H * 0.055);
  ctx.beginPath(); ctx.moveTo(hoseX0, hoseY0);
  ctx.bezierCurveTo(x + rx + H * 0.28, hoseY0 - H * 0.06, nz.x - H * 0.06, nz.y - H * 0.16, nz.x, nz.y);
  ctx.stroke();
  // 嘴尖（金属小锥+卡箍）
  ctx.strokeStyle = '#c8ced5'; ctx.lineWidth = Math.max(2, H * 0.04);
  ctx.beginPath(); ctx.moveTo(nz.x, nz.y); ctx.lineTo(nz.x + H * 0.10, nz.y + H * 0.03); ctx.stroke();
  ctx.fillStyle = '#9aa1ab';
  ctx.beginPath(); ctx.arc(nz.x, nz.y, Math.max(2, H * 0.03), 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  const nozzle = {x: nz.x + H * 0.10, y: nz.y + H * 0.03};
  return {w: rx * 2 + H * 0.44, h: bh + H * 0.29 + ry, base: {x: x, y: y},
    mounts: {nozzle: nozzle, top: {x: x, y: rodT - H * 0.05}}};
};

/* ================================================================================
 * C7V6-L1 新增9件第七章实验绘制器材（来源: physics_g8_v1_c7_s1/exp-road-core.js、
 * exp-bench-core.js 打磨版内联绘制代码逐字提取；2026-11-20 入册 v1，不升版）
 * 变体白名单=尺寸/角度/朝向/挡位/挂载参数；确定性绘制（无 Math.random，正弦伪随机）
 * ================================================================================ */

// 共享小工具（l1 前缀防与旧37件冲突）
function l1rr(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function l1circ(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);}
function l1txt(ctx,t,x,y,color,size,align){ctx.save();ctx.fillStyle=color||'#28323d';ctx.font='600 '+(size||11)+'px "PingFang SC","Microsoft YaHei",sans-serif';ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillText(t,x,y);ctx.restore();}
function l1shade(hex,amt){var n=parseInt(hex.slice(1),16);var c=function(v){return Math.max(0,Math.min(255,v))};return 'rgb('+c((n>>16)+amt)+','+c(((n>>8)&255)+amt)+','+c((n&255)+amt)+')';}
function l1clamp(v,a,b){return Math.max(a,Math.min(b,v));}

PROPS.MECH_L1_IDS=['dial_side','car_side','person_side','sponge_pad','brake_pedal','stand_side','weight_cyl','spring_helix','meter_side'];
PROPS.MECH_IDS=PROPS.MECH_IDS.concat(PROPS.MECH_L1_IDS);

/* dial_side: 方向盘（来源 C7V6 exp-road-core.drawWheel：圆环+水平直径杠+中心竖直半辐条；车内小盘与弹窗大盘同一件）
 * (x,y)=轮盘圆心（旋转件圆心锚点，规则13例外）；opt.r 半径 / opt.scale 倍率 / opt.angle 弧度 / opt.color 默认'#2b2f36'
 * 变体白名单: r/scale/angle/color
 */
PROPS.dial_side=function(ctx,x,y,opt){
  opt=opt||{};
  var r=(opt.r||40)*(opt.scale||1);
  ctx.save();
  ctx.translate(x,y);ctx.rotate(opt.angle||0);
  ctx.strokeStyle=opt.color||'#2b2f36';ctx.lineWidth=Math.max(3,r*0.14);
  l1circ(ctx,0,0,r);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.moveTo(0,0);ctx.lineTo(0,r);ctx.stroke();
  ctx.restore();
  return {r:r,center:{x:x,y:y}};
};

/* car_side: 侧视轿车+车轮（来源 C7V6 exp-road-core.drawCar/drawOneWheel；车头朝右，渐变车体+座舱+车窗+灯+保险杠+车内方向盘）
 * (x,y)=轮地接触线中心（底面中心锚点）；opt.w/h 车尺寸；opt.angle 车姿态弧度（绕锚点旋转，斜面物理由页面驱动）；opt.wheelR 轮半径；
 * opt.wheels=[{x,y,sx,sy}] 世界坐标悬架轮(x,y=轮心,sx,sy=支柱顶；缺省=±0.32w 两轮静态)；opt.dialAngle 方向盘角；
 * opt.com={x,y}|null 重心标记(车身旋转坐标系内绘制)；opt.comLabel 是否绘制'重心'白字(不随车旋转)
 * 返回 {sw:{x,y,r} 方向盘命中圆, com}；变体白名单: w/h/angle/wheelR/wheels/dialAngle/com/comLabel
 */
PROPS.car_side=function(ctx,x,y,opt){
  opt=opt||{};
  var w=opt.w,h=opt.h,gy=y,x0=x-w/2;
  function oneWheel(cx0,cy0,r){ctx.fillStyle='#2b2f36';l1circ(ctx,cx0,cy0,r);ctx.fill();ctx.fillStyle='#c7ced6';l1circ(ctx,cx0,cy0,r*0.52);ctx.fill();ctx.fillStyle='#6b7684';l1circ(ctx,cx0,cy0,r*0.16);ctx.fill();}
  ctx.save();
  if(opt.angle){ctx.translate(x,gy);ctx.rotate(opt.angle);ctx.translate(-x,-gy);}
  ctx.fillStyle='rgba(20,30,45,.20)';
  ctx.beginPath();ctx.ellipse(x,gy+3,w*0.5,5,0,0,Math.PI*2);ctx.fill();
  var bodyY=gy-h*0.80,bodyH=h*0.72;
  var bg=ctx.createLinearGradient(0,bodyY-h*0.62,0,gy);
  bg.addColorStop(0,'#e05555');bg.addColorStop(1,'#b03030');
  ctx.fillStyle=bg;
  ctx.beginPath();
  ctx.moveTo(x0+w*0.16,bodyY+4);
  ctx.quadraticCurveTo(x0+w*0.22,bodyY-h*0.60,x0+w*0.36,bodyY-h*0.62);
  ctx.lineTo(x0+w*0.60,bodyY-h*0.62);
  ctx.quadraticCurveTo(x0+w*0.73,bodyY-h*0.56,x0+w*0.80,bodyY+4);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#bfe3f2';
  l1rr(ctx,x0+w*0.26,bodyY-h*0.50,w*0.19,h*0.42,5);ctx.fill();
  l1rr(ctx,x0+w*0.48,bodyY-h*0.50,w*0.15,h*0.42,5);ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x0+w*0.655,bodyY-h*0.48);ctx.lineTo(x0+w*0.735,bodyY-h*0.02);
  ctx.lineTo(x0+w*0.665,bodyY-h*0.02);ctx.closePath();ctx.fill();
  ctx.fillStyle=bg;l1rr(ctx,x0,bodyY,w,bodyH,h*0.20);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.16)';l1rr(ctx,x0+w*0.05,bodyY+bodyH*0.12,w*0.9,bodyH*0.16,h*0.08);ctx.fill();
  ctx.strokeStyle='rgba(60,20,20,.45)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(x0+w*0.46,bodyY+4);ctx.lineTo(x0+w*0.46,bodyY+bodyH-6);ctx.stroke();
  ctx.fillStyle='rgba(60,20,20,.5)';l1rr(ctx,x0+w*0.36,bodyY+bodyH*0.30,w*0.06,3,1.5);ctx.fill();
  ctx.fillStyle='#ffe08a';l1rr(ctx,x0+w-9,bodyY+bodyH*0.22,9,bodyH*0.26,4);ctx.fill();
  ctx.fillStyle='#f43f5e';l1rr(ctx,x0,bodyY+bodyH*0.22,6,bodyH*0.26,3);ctx.fill();
  ctx.fillStyle='#3f4650';l1rr(ctx,x0+w-6,gy-h*0.20,8,h*0.10,3);ctx.fill();l1rr(ctx,x0-2,gy-h*0.20,8,h*0.10,3);ctx.fill();
  var swx=x0+w*0.62,swy=bodyY-h*0.16,swr=Math.max(8,h*0.14);
  PROPS.dial_side(ctx,swx,swy,{r:swr,angle:opt.dialAngle||0});
  var sw={x:swx,y:swy,r:swr};
  if(opt.com){
    var c=opt.com;
    ctx.fillStyle='#fff';l1circ(ctx,c.x,c.y,5);ctx.fill();
    ctx.strokeStyle='#28323d';ctx.lineWidth=2;l1circ(ctx,c.x,c.y,5);ctx.stroke();
    ctx.beginPath();ctx.moveTo(c.x-8,c.y);ctx.lineTo(c.x+8,c.y);ctx.moveTo(c.x,c.y-8);ctx.lineTo(c.x,c.y+8);ctx.stroke();
  }
  ctx.restore();
  var wr=opt.wheelR||20;
  var wheels=opt.wheels||[
    {x:x-w*0.32,y:gy-wr,sx:x-w*0.32,sy:gy-2*wr},
    {x:x+w*0.32,y:gy-wr,sx:x+w*0.32,sy:gy-2*wr}];
  wheels.forEach(function(wt){
    ctx.strokeStyle='#555';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(wt.sx,wt.sy);ctx.lineTo(wt.x,wt.y);ctx.stroke();
    oneWheel(wt.x,wt.y,wr);
  });
  if(opt.comLabel&&opt.com){
    ctx.save();ctx.fillStyle='#fff';ctx.font='600 11px sans-serif';ctx.textAlign='center';
    ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=3;
    ctx.fillText('重心',opt.com.x,opt.com.y-12);ctx.restore();
  }
  return {sw:sw,com:opt.com||null};
};

/* person_side: 侧视推手人（来源 C7V6 exp-road-core.drawPerson/drawPersonSpr；有机体sprite优先，未加载回退贝塞尔卡通人）
 * (x,y)=双足地面中心（底面中心锚点，站立于y线）；opt.h 人高；opt.dir 1朝右/-1朝左；opt.ice 轮滑变体（鞋↔轮滑靴sprite交叉淡变）；
 * opt.eng 0..1 站立↔推手过渡；opt.hand={x,y} 世界坐标手目标（肩轴定长手臂IK，sprite路径用）；opt.cp 世界坐标接触点（回退路径用，null=自然摆臂）；
 * opt.handOff/cpOff={dx,dy} 相对锚点目标（展柜用）；opt.armLen 上臂长；opt.pushing/walking/sliding 回退姿态；opt.spriteBase 默认'assets/'（相对页面目录，404自动回退矢量身体）
 * onLoad(cb)：sprite加载完成钩子（页面置dirty）；变体白名单: h/dir/ice/eng/hand(Off)/cp(Off)/armLen/pushing/walking/sliding/spriteBase
 */
var L1_SPR_CACHE={},L1_PERSON_CBS=[];
function l1mkSpr(base,file,nw,nh,v){
  var key=base+'|'+file;
  if(!L1_SPR_CACHE[key]){
    var img=new Image();
    img.onload=function(){L1_PERSON_CBS.forEach(function(f){try{f()}catch(e){}});};
    img.src=base+file+'?v='+(v||'20261117');
    L1_SPR_CACHE[key]={img:img,nw:nw,nh:nh};
  }
  return L1_SPR_CACHE[key];
}
/* 脚本初始化即建 person sprite（与旧 core mkSpr 脚本初始化时机一致，消首帧/探针时序差）；cache key=base|file，页面同 base 引用复用 */
l1mkSpr('assets/','boy_stand.png',154,800);l1mkSpr('assets/','boy_skate.png',172,820);
l1mkSpr('assets/','boy_push_body.png',418,652,'20261117g');l1mkSpr('assets/','boy_skatepush_body.png',403,657,'20261117v');
l1mkSpr('assets/','boy_arm.png',231,61,'20261117g');l1mkSpr('assets/','boy_arm_far.png',234,54,'20261117h');
PROPS.person_side=function(ctx,x,y,opt){
  opt=opt||{};
  var base=opt.spriteBase||'assets/';
  var SPR={
    stand:l1mkSpr(base,'boy_stand.png',154,800),
    skate:l1mkSpr(base,'boy_skate.png',172,820),
    push:l1mkSpr(base,'boy_push_body.png',418,652,'20261117g'),
    skatepush:l1mkSpr(base,'boy_skatepush_body.png',403,657,'20261117v'),
    arm:l1mkSpr(base,'boy_arm.png',231,61,'20261117g'),
    armFar:l1mkSpr(base,'boy_arm_far.png',234,54,'20261117h')
  };
  SPR.arm.rig={pivX:0,pivY:30,tipX:230,tipY:13};
  SPR.armFar.rig={pivX:0,pivY:26.5,tipX:233,tipY:24.5};
  var SPR_K_BODY=800,PUSH_FOOT_F=0.4498,SKATEPUSH_FOOT_F=0.6234;
  var ph=opt.h||160,d=opt.dir===-1?-1:1,ice=!!opt.ice;
  function sstep(t){return t*t*(3-2*t);}
  var e=sstep(opt.eng||0);
  function sprOK(s){return s.img.complete&&s.img.naturalWidth>0;}
  function personSprOK(){return sprOK(SPR.stand)&&sprOK(SPR.skate)&&sprOK(SPR.push)&&sprOK(SPR.skatepush)&&sprOK(SPR.arm)&&sprOK(SPR.armFar);}
  function sprW(s,k){return (s.img.naturalWidth||s.nw)*k;}
  function sprH(s,k){return (s.img.naturalHeight||s.nh)*k;}
  function drawArmSpr(s,sx,sy,tx,ty,k,alpha){
    var r=s.rig,dist=Math.hypot(tx-sx,ty-sy),targetAng=Math.atan2(ty-sy,tx-sx);
    var spanWorld=(r.tipX-r.pivX)*k,kx=dist/spanWorld,kxu=k*kx;
    var iAng=Math.atan2((r.tipY-r.pivY)*k,dist);
    var nw=s.img.naturalWidth||s.nw,nh=s.img.naturalHeight||s.nh;
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.translate(sx,sy);ctx.rotate(targetAng-iAng);
    ctx.drawImage(s.img,-r.pivX*kxu,-r.pivY*k,nw*kxu,nh*k);
    ctx.restore();
  }
  function drawBodySpr(s,kb,alpha,footF){
    var bw=sprW(s,kb),bh=sprH(s,kb);
    ctx.globalAlpha=alpha;
    ctx.drawImage(s.img,-bw*(footF||0.5),y-bh,bw,bh);
    ctx.globalAlpha=1;
  }
  var hand=opt.hand||(opt.handOff?{x:x+opt.handOff.dx,y:y+opt.handOff.dy}:null);
  if(personSprOK()){
    var kb=ph/SPR_K_BODY;
    ctx.save();
    ctx.translate(x,0);ctx.scale(d,1);
    var armOn=e>=0.02,shxL=0,shY=0,tipX=0,tipY=0;
    if(armOn){
      shxL=ph*(ice?0.0406+(0.1641-0.0406)*e:0.055);
      shY=y-ph*(ice?0.789+(0.5588-0.789)*e:0.66+(0.575-0.66)*e);
      var sp=hand||{x:x+d*ph*0.5,y:y-ph*0.5};
      var tx=(sp.x-x)*d,ty=sp.y;
      var ikAng=Math.atan2(ty-shY,tx-shxL),ikDist=Math.hypot(tx-shxL,ty-shY);
      var armLen0=opt.armLen||ph*0.36;
      var ang=Math.PI/2+(ikAng-Math.PI/2)*e;
      var len=armLen0+(ikDist-armLen0)*e;
      tipX=shxL+Math.cos(ang)*len;tipY=shY+Math.sin(ang)*len;
      drawArmSpr(SPR.armFar,shxL+2,shY+3,tipX,tipY,kb,0.9*e);
    }
    ctx.save();ctx.scale(-1,1);
    if(ice){
      if(e<0.02)drawBodySpr(SPR.skate,kb,1);
      else if(e>0.98)drawBodySpr(SPR.skatepush,kb,1,SKATEPUSH_FOOT_F);
      else{drawBodySpr(SPR.skate,kb,1-e);drawBodySpr(SPR.skatepush,kb,e,SKATEPUSH_FOOT_F);}
    }else if(e<0.02)drawBodySpr(SPR.stand,kb,1);
    else if(e>0.98)drawBodySpr(SPR.push,kb,1,PUSH_FOOT_F);
    else{drawBodySpr(SPR.stand,kb,1-e);drawBodySpr(SPR.push,kb,e,PUSH_FOOT_F);}
    ctx.restore();
    if(armOn){
      var tSl=sprH(SPR.arm,kb);
      var pw=tSl*1.6,phh=tSl*1.25;
      ctx.save();ctx.globalAlpha=e;ctx.fillStyle='#f9d624';
      l1rr(ctx,shxL-pw/2,shY-phh/2,pw,phh,phh*0.45);ctx.fill();
      ctx.restore();
      drawArmSpr(SPR.arm,shxL,shY,tipX,tipY,kb,e);
    }
    ctx.restore();
    return {sprite:true,hand:hand};
  }
  /* —— 精灵未加载：贝塞尔写实卡通人（来源 exp-road-core.drawPerson 回退主体 + strokeLimb/drawArm/drawFoot，逐字）—— */
  var pushing=!!opt.pushing,walking=!!opt.walking,sliding=!!opt.sliding;
  var cp=opt.cp||(opt.cpOff?{x:x+opt.cpOff.dx,y:y+opt.cpOff.dy}:null);
  var gy=y;
  var topY=gy-ph,headR=ph*0.10,headY=topY+headR*1.42;
  var shY=gy-ph*(pushing?0.60:0.66),hipY=topY+ph*0.56,tw=ph*0.115;
  var shx=ph*0.055;
  var lean=pushing?ph*0.055:(sliding?-ph*0.045:0);
  var fOff=walking?ph*0.115:ph*0.05;
  var handL=cp?{x:(cp.x-x)*d,y:cp.y}:null;
  function strokeLimb(x0,y0,x1,y1,x2,y2,w2,col,bend){
    ctx.strokeStyle='rgba(15,25,35,.28)';ctx.lineWidth=w2+2;
    ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1+bend,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.strokeStyle=col;ctx.lineWidth=w2;
    ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1+bend,y1);ctx.lineTo(x2,y2);ctx.stroke();
  }
  function drawArmF(sx,sy,hx,hy,far){
    var dx=hx-sx,dy=hy-sy,ln=Math.hypot(dx,dy)||1;
    var cx2=(sx+hx)/2-dy/ln*ph*0.018,cy2=(sy+hy)/2+dx/ln*ph*0.018;
    ctx.strokeStyle=far?'#d9a066':'#f0c08a';ctx.lineWidth=ph*0.04;
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(cx2,cy2,hx,hy);ctx.stroke();
    ctx.strokeStyle=far?'#2f568f':'#3f6fb5';ctx.lineWidth=ph*0.052;
    ctx.beginPath();ctx.moveTo(sx,sy);
    ctx.quadraticCurveTo(sx+(cx2-sx)*0.5,sy+(cy2-sy)*0.5,sx+(hx-sx)*0.42,sy+(hy-sy)*0.42);ctx.stroke();
  }
  function drawFootF(fx,fgy,fice,back){
    var w=ph*0.115,hgt=ph*0.045,x0=fx-w*0.42,y0=fgy-hgt;
    if(fice){
      var wr=ph*0.017,wy=fgy-wr;
      ctx.fillStyle='#b36a00';l1rr(ctx,x0-1,wy-wr*1.15,w+6,wr*1.1,2);ctx.fill();
      for(var i=0;i<4;i++){
        var wx=x0+2+i*(w+2)/3.4;
        ctx.fillStyle='#2b2f36';l1circ(ctx,wx,wy,wr);ctx.fill();
        ctx.strokeStyle=back?'rgba(0,0,0,.35)':'#111';ctx.lineWidth=1.4;l1circ(ctx,wx,wy,wr);ctx.stroke();
        ctx.fillStyle='#ff9f1c';l1circ(ctx,wx,wy,wr*0.42);ctx.fill();
      }
      ctx.fillStyle=back?'#d97f0e':'#ff9f1c';
      ctx.beginPath();
      ctx.moveTo(x0,y0-hgt*0.55);
      ctx.bezierCurveTo(x0+w*0.2,y0-hgt*0.7,x0+w*0.75,y0-hgt*0.35,x0+w+4,y0+hgt*0.1);
      ctx.lineTo(x0+w+4,wy-wr*1.1);ctx.lineTo(x0-1,wy-wr*1.1);
      ctx.closePath();ctx.fill();
      ctx.strokeStyle='#7a4a00';ctx.lineWidth=1.4;ctx.stroke();
      ctx.fillStyle='#fff8ec';l1rr(ctx,x0+w*0.1,y0-hgt*0.18,w*0.55,2.4,1.2);ctx.fill();
    }else{
      ctx.fillStyle=back?'#4a382b':'#5b4636';
      ctx.beginPath();
      ctx.moveTo(x0,fgy-1);
      ctx.bezierCurveTo(x0,y0-hgt*0.5,x0+w*0.5,y0-hgt*0.35,x0+w+3,fgy-2);
      ctx.lineTo(x0+w+3,fgy-1);ctx.closePath();ctx.fill();
      ctx.fillStyle='#2c2119';l1rr(ctx,x0-1,fgy-3,w+5,3,1.4);ctx.fill();
    }
  }
  ctx.save();
  ctx.translate(x,0);ctx.scale(d,1);
  ctx.lineCap='round';ctx.lineJoin='round';
  strokeLimb(-tw*0.35,hipY,-fOff*0.55,hipY+(gy-hipY)*0.52,-fOff*0.95,gy-ph*0.055,ph*0.062,'#26333b',ph*0.02);
  drawFootF(-fOff*0.95,gy,ice,true);
  var sg=ctx.createLinearGradient(-tw,shY,tw*1.3,hipY);
  sg.addColorStop(0,'#2f568f');sg.addColorStop(0.45,'#3f6fb5');sg.addColorStop(1,'#2f568f');
  ctx.fillStyle=sg;
  ctx.beginPath();
  ctx.moveTo(-tw*0.92+lean*0.6,shY-ph*0.05);
  ctx.bezierCurveTo(-tw*1.1+lean*0.3,shY+ph*0.06,-tw*0.95,hipY-ph*0.04,-tw*0.8,hipY+ph*0.035);
  ctx.bezierCurveTo(-tw*0.2,hipY+ph*0.055,tw*0.4,hipY+ph*0.055,tw*0.85,hipY+ph*0.03);
  ctx.bezierCurveTo(tw*1.02,hipY-ph*0.05,tw*1.08+lean,shY+ph*0.05,tw*0.95+lean,shY-ph*0.048);
  ctx.bezierCurveTo(tw*0.3+lean,shY-ph*0.075,-tw*0.3+lean,shY-ph*0.075,-tw*0.92+lean*0.6,shY-ph*0.05);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(20,35,60,.35)';ctx.lineWidth=1.2;ctx.stroke();
  ctx.strokeStyle='rgba(20,35,60,.16)';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(-tw*0.2+lean*0.7,shY+ph*0.02);ctx.quadraticCurveTo(-tw*0.05,shY+ph*0.10,-tw*0.3,hipY-ph*0.02);ctx.stroke();
  ctx.beginPath();ctx.moveTo(tw*0.45+lean*0.5,shY+ph*0.05);ctx.quadraticCurveTo(tw*0.35,shY+ph*0.12,tw*0.5,hipY-ph*0.03);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.13)';
  ctx.beginPath();ctx.moveTo(tw*0.1+lean*0.8,shY-ph*0.02);
  ctx.quadraticCurveTo(tw*0.85+lean*0.8,shY+ph*0.02,tw*0.6,hipY-ph*0.05);
  ctx.quadraticCurveTo(tw*0.25,shY+ph*0.08,tw*0.1+lean*0.8,shY-ph*0.02);ctx.closePath();ctx.fill();
  ctx.fillStyle='#d9a066';l1rr(ctx,-tw*0.22+lean,shY-ph*0.085,tw*0.5,ph*0.05,3);ctx.fill();
  ctx.fillStyle='#f0c08a';l1rr(ctx,-tw*0.2+lean,shY-ph*0.09,tw*0.46,ph*0.04,3);ctx.fill();
  ctx.strokeStyle='rgba(20,35,60,.4)';ctx.lineWidth=1.3;
  ctx.beginPath();ctx.moveTo(-tw*0.35+lean,shY-ph*0.052);ctx.lineTo(tw*0.05+lean,shY-ph*0.028);ctx.lineTo(tw*0.42+lean,shY-ph*0.055);ctx.stroke();
  strokeLimb(tw*0.35,hipY,fOff*0.62,hipY+(gy-hipY)*0.5,fOff,gy-ph*0.055,ph*0.066,'#37474f',ph*0.024);
  drawFootF(fOff,gy,ice,false);
  if(handL){
    var hx=handL.x,hy=handL.y;
    drawArmF(shx-tw*0.1,shY+ph*0.012,hx-ph*0.012,hy+ph*0.022,true);
    drawArmF(shx+tw*0.12,shY,hx,hy,false);
    ctx.fillStyle='#f0c08a';l1circ(ctx,hx,hy,ph*0.030);ctx.fill();
    ctx.strokeStyle='rgba(120,80,40,.5)';ctx.lineWidth=1;l1circ(ctx,hx,hy,ph*0.030);ctx.stroke();
    ctx.beginPath();ctx.moveTo(hx+ph*0.02,hy-ph*0.012);ctx.lineTo(hx+ph*0.034,hy-ph*0.004);ctx.stroke();
  }else{
    var sw2=walking?ph*0.075:ph*0.015;
    drawArmF(shx-tw*0.15,shY+ph*0.01,-sw2*0.7-ph*0.02,hipY-ph*0.01,true);
    drawArmF(shx+tw*0.15,shY,sw2+ph*0.03,hipY-ph*0.02,false);
    ctx.fillStyle='#f0c08a';
    l1circ(ctx,-sw2*0.7-ph*0.02,hipY-ph*0.01,ph*0.027);ctx.fill();
    l1circ(ctx,sw2+ph*0.03,hipY-ph*0.02,ph*0.028);ctx.fill();
  }
  var hdx=lean*1.15+ph*0.012;
  ctx.fillStyle='#d9a066';
  ctx.beginPath();ctx.ellipse(hdx-headR*0.72,headY+headR*0.18,headR*0.2,headR*0.3,-0.2,0,Math.PI*2);ctx.fill();
  var fg=ctx.createRadialGradient(hdx+headR*0.35,headY-headR*0.3,headR*0.2,hdx,headY,headR*1.5);
  fg.addColorStop(0,'#f7d3a5');fg.addColorStop(1,'#f0c08a');
  ctx.fillStyle=fg;
  ctx.beginPath();
  ctx.moveTo(hdx-headR*0.85,headY-headR*0.15);
  ctx.bezierCurveTo(hdx-headR*1.02,headY-headR*1.35,hdx+headR*0.72,headY-headR*1.58,hdx+headR*0.94,headY-headR*0.35);
  ctx.bezierCurveTo(hdx+headR*1.02,headY+headR*0.15,hdx+headR*0.92,headY+headR*0.55,hdx+headR*0.5,headY+headR*0.98);
  ctx.bezierCurveTo(hdx+headR*0.1,headY+headR*1.18,hdx-headR*0.5,headY+headR*0.85,hdx-headR*0.72,headY+headR*0.35);
  ctx.bezierCurveTo(hdx-headR*0.85,headY+headR*0.1,hdx-headR*0.87,headY-headR*0.05,hdx-headR*0.85,headY-headR*0.15);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(120,80,40,.35)';ctx.lineWidth=1.1;ctx.stroke();
  ctx.fillStyle='#5a3d26';
  ctx.beginPath();
  ctx.moveTo(hdx-headR*0.92,headY+headR*0.02);
  ctx.bezierCurveTo(hdx-headR*1.18,headY-headR*1.2,hdx-headR*0.2,headY-headR*1.78,hdx+headR*0.62,headY-headR*1.3);
  ctx.bezierCurveTo(hdx+headR*0.95,headY-headR*1.08,hdx+headR*1.02,headY-headR*0.7,hdx+headR*0.98,headY-headR*0.42);
  ctx.bezierCurveTo(hdx+headR*0.6,headY-headR*0.82,hdx+headR*0.05,headY-headR*0.95,hdx-headR*0.4,headY-headR*0.62);
  ctx.bezierCurveTo(hdx-headR*0.66,headY-headR*0.42,hdx-headR*0.82,headY-headR*0.2,hdx-headR*0.92,headY+headR*0.02);
  ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(40,25,12,.5)';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.ellipse(hdx+headR*0.42,headY-headR*0.08,headR*0.2,headR*0.24,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#33241a';l1circ(ctx,hdx+headR*0.47,headY-headR*0.05,Math.max(1.5,headR*0.11));ctx.fill();
  ctx.fillStyle='#fff';l1circ(ctx,hdx+headR*0.5,headY-headR*0.1,Math.max(0.8,headR*0.04));ctx.fill();
  ctx.strokeStyle='#3a2c20';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(hdx+headR*0.26,headY-headR*0.42);ctx.quadraticCurveTo(hdx+headR*0.45,headY-headR*0.52,hdx+headR*0.62,headY-headR*0.4);ctx.stroke();
  ctx.lineWidth=1.3;
  ctx.beginPath();ctx.moveTo(hdx+headR*0.82,headY+headR*0.12);ctx.quadraticCurveTo(hdx+headR*0.92,headY+headR*0.28,hdx+headR*0.76,headY+headR*0.32);ctx.stroke();
  ctx.beginPath();ctx.arc(hdx+headR*0.45,headY+headR*0.42,headR*0.3,0.2,Math.PI*0.66);ctx.stroke();
  ctx.fillStyle='rgba(230,120,110,.28)';
  ctx.beginPath();ctx.ellipse(hdx+headR*0.62,headY+headR*0.3,headR*0.16,headR*0.1,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
  return {sprite:false};
};
PROPS.person_side.onLoad=function(cb){L1_PERSON_CBS.push(cb);};

/* sponge_pad: 小车接触海绵（来源 C7V6 exp-road-core.drawSponge；米黄多孔+按压凹陷+标签）
 * (x,y)=车身接触面点（侧挂锚点，海绵中心=锚点+(dir*2-宽半)）；opt.def 0..1 压缩量（物理由页面驱动）；opt.s 车高标度(w0=s*0.17,h0=s*0.32)；opt.dir ±1；opt.label!==false 绘制'海绵'白字
 * 变体白名单: def/s/dir/label
 */
PROPS.sponge_pad=function(ctx,x,y,opt){
  opt=opt||{};
  var d=opt.dir||1,def=opt.def||0,s=opt.s||100;
  var w0=s*0.17,h0=s*0.32;
  var w=w0*(1+def*0.45),h=h0*(1-def*0.55);
  var px=x-w*0.5+d*2,py=y-h/2;
  ctx.save();
  var sg=ctx.createLinearGradient(px,py,px,py+h);
  sg.addColorStop(0,'#fbf0cc');sg.addColorStop(1,'#f6e3a8');
  ctx.fillStyle=sg;l1rr(ctx,px,py,w,h,4);ctx.fill();
  ctx.strokeStyle='#d3b063';ctx.lineWidth=1.5;l1rr(ctx,px,py,w,h,4);ctx.stroke();
  ctx.fillStyle='#e2c988';
  for(var i=0;i<7;i++){
    var hx=px+w*(0.14+((i*37)%72)/100),hy=py+h*(0.14+((i*53)%68)/100);
    ctx.beginPath();ctx.ellipse(hx,hy,1.1+(i%3)*0.55,0.9+(i%2)*0.5,0,0,Math.PI*2);ctx.fill();
  }
  if(def>0.08){
    ctx.strokeStyle='rgba(160,120,50,.5)';ctx.lineWidth=1.4;
    ctx.beginPath();
    ctx.moveTo(px+(d>0?1:w-1),py+h*0.18);
    ctx.quadraticCurveTo(px+(d>0?1:w-1)+d*def*w*0.3,py+h*0.5,px+(d>0?1:w-1),py+h*0.82);
    ctx.stroke();
  }
  if(opt.label!==false){
    ctx.font='600 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    ctx.shadowColor='rgba(255,255,255,.9)';ctx.shadowBlur=3;ctx.fillStyle='#8a6a20';
    ctx.fillText('海绵',px+w/2,py+h+3);
  }
  ctx.restore();
  return {w:w,h:h,x:px,y:py};
};

/* brake_pedal: 刹车竖直滑轨+踏板滑块（来源 C7V6 exp-road-core.drawBrake；面板+滑槽+刻度松紧+梯形防滑踏板）
 * (x,y)=滑槽顶左（侧挂锚点）；opt.w/h 滑槽面板尺寸；opt.frac 0..1 滑块位置（刹车量物理由页面驱动）；opt.dis 轮滑锁定置灰；opt.valTxt 底部'刹车力 N'行文本；opt.hintTxt 提示行（缺省按dis自动）
 * 变体白名单: w/h/frac/dis/valTxt/hintTxt
 */
PROPS.brake_pedal=function(ctx,x,y,opt){
  opt=opt||{};
  var w=opt.w||68,h=opt.h||160,dis=!!opt.dis;
  var frac=l1clamp(opt.frac||0,0,1);
  var ty0=y+10,th=h-20;
  var ky=ty0+frac*th;
  ctx.save();
  ctx.fillStyle='rgba(255,255,255,.88)';l1rr(ctx,x-10,y-28,w+20,h+66,12);ctx.fill();
  ctx.strokeStyle='rgba(100,116,139,.4)';ctx.lineWidth=1;l1rr(ctx,x-10,y-28,w+20,h+66,12);ctx.stroke();
  ctx.fillStyle='#28323d';ctx.font='700 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillText('刹车踏板',x+w/2,y-10);
  if(dis)ctx.globalAlpha=0.35;
  var cx0=x+w/2;
  ctx.fillStyle='#b6c2cf';l1rr(ctx,cx0-8,ty0-4,16,th+8,8);ctx.fill();
  ctx.fillStyle='#8c9bab';l1rr(ctx,cx0-4,ty0,8,th,4);ctx.fill();
  ctx.strokeStyle='rgba(40,50,61,.35)';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(cx0-12,ty0);ctx.lineTo(cx0-20,ty0);ctx.moveTo(cx0-12,ty0+th);ctx.lineTo(cx0-20,ty0+th);ctx.stroke();
  ctx.font='600 9px sans-serif';ctx.fillStyle='#6b7885';ctx.textAlign='right';
  ctx.fillText('松',cx0-22,ty0+3);ctx.fillText('紧',cx0-22,ty0+th+3);
  ctx.save();ctx.translate(cx0,ky);
  var scale=w/68;
  var padW=46*scale,padH=34*scale,ins=padW*0.06,pr=padH*0.16;
  var px0=-padW/2,py0=-padH/2;
  var padGrad=ctx.createLinearGradient(0,py0,0,py0+padH);
  padGrad.addColorStop(0,'#f8f9fa');padGrad.addColorStop(0.5,'#e8ebec');padGrad.addColorStop(1,'#c9ced2');
  ctx.beginPath();
  ctx.moveTo(px0+pr,py0);
  ctx.arcTo(px0+padW,py0,px0+padW-ins,py0+padH,pr);
  ctx.arcTo(px0+padW-ins,py0+padH,px0+ins,py0+padH,pr);
  ctx.arcTo(px0+ins,py0+padH,px0,py0,pr);
  ctx.arcTo(px0,py0,px0+padW,py0,pr);
  ctx.closePath();
  ctx.fillStyle=padGrad;ctx.fill();
  ctx.strokeStyle='#3f4650';ctx.lineWidth=2;ctx.stroke();
  var rowH=padH*0.09,vpad=padH*0.15,step=(padH-2*vpad)/5;
  var lcolW=padW*0.42,rcolW=padW*0.30,gap=padW*0.06,lm=(padW-(lcolW+gap+rcolW))/2;
  var lx0=px0+lm,rx0=px0+lm+lcolW+gap;
  ctx.fillStyle='#17181a';
  for(var i=0;i<5;i++){
    var cy=py0+vpad+step*(i+0.5);
    l1rr(ctx,lx0,cy-rowH/2,lcolW,rowH,rowH/2);ctx.fill();
    l1rr(ctx,rx0,cy-rowH/2,rcolW,rowH,rowH/2);ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha=1;
  ctx.fillStyle='#28323d';ctx.font='700 13px sans-serif';ctx.textAlign='center';
  ctx.fillText(opt.valTxt||'',cx0,y+h+16);
  ctx.font='600 9px sans-serif';ctx.fillStyle=dis?'#dc2626':'#6b7885';
  ctx.fillText(opt.hintTxt||(dis?'轮滑锁定=最大':'拖动滑钮=刹车力'),cx0,y+h+30);
  ctx.restore();
  return {x:x,y:y,w:w,h:h,knob:{x:cx0,y:ky}};
};

/* stand_side: 侧视铁架台（来源 C7V6 exp-bench-core.drawStand；底座+立杆+左挑横杆+端环，整体随斜面倾斜）
 * (x,y)=底座底面中心（底面中心锚点）；opt.rh 立杆高 / opt.aw 横杆长 / opt.baseW 底座宽 / opt.tilt 倾斜弧度（内部rotate(-tilt)）
 * 返回 {top立杆顶,hang横杆挂点}；变体白名单: rh/aw/baseW/tilt
 */
PROPS.stand_side=function(ctx,x,y,opt){
  opt=opt||{};
  var rh=opt.rh||260,aw=opt.aw||90,baseW=opt.baseW||180,a=opt.tilt||0;
  ctx.save();ctx.translate(x,y);ctx.rotate(-a);
  ctx.fillStyle='#3f4954';l1rr(ctx,-baseW/2,-9,baseW,18,5);ctx.fill();
  ctx.fillStyle='#5b6672';l1rr(ctx,-baseW/2+10,-14,baseW-20,7,3);ctx.fill();
  ctx.strokeStyle='#5b6672';ctx.lineWidth=14;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(0,-rh);ctx.stroke();
  ctx.strokeStyle='#828d99';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-3.5,-14);ctx.lineTo(-3.5,-rh+5);ctx.stroke();
  ctx.strokeStyle='#5b6672';ctx.lineWidth=11;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(3,-rh+5);ctx.lineTo(-aw,-rh+5);ctx.stroke();
  ctx.fillStyle='#3f4954';l1circ(ctx,-aw,-rh+5,9);ctx.fill();
  ctx.fillStyle='#828d99';l1circ(ctx,-aw,-rh+5,4);ctx.fill();
  ctx.restore();
  return {top:{x:x-rh*Math.sin(a),y:y-rh*Math.cos(a)},hang:{x:x-rh*Math.sin(a)-aw*Math.cos(a),y:y-rh*Math.cos(a)+aw*Math.sin(a)}};
};

/* weight_cyl: 圆柱钩码（来源 C7V6 exp-bench-core.drawWeights；顶部挂环衔接簧底钩+身印克重；同规格视觉相同）
 * (x,y)=圆柱顶面中心（悬挂件顶锚点，向下绘制）；opt.mass 克重（50/100/150/200/250）；opt.w/h 显式尺寸（页面布局挤压优先，质量比仍由克重定）；缺省按 opt.u 50g基准{w,h}以(mass/50)^(1/3)派生
 * 返回 {w,h,hookTop}；变体白名单: mass/w/h/u
 */
PROPS.weight_cyl=function(ctx,x,y,opt){
  opt=opt||{};
  var mass=opt.mass||50;
  if(mass<=0)return null;
  var w=opt.w,h=opt.h;
  if(w==null||h==null){var u=opt.u||{w:41,h:30},s=Math.pow(mass/50,1/3);w=u.w*s;h=u.h*s;}
  var hr=5,stub=6,ry=w*0.10,yb=y+h;
  var g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);
  g.addColorStop(0,'#e8edf1');g.addColorStop(0.5,'#b9c2ca');g.addColorStop(1,'#87929b');
  var x0=x-w/2,x1=x+w/2;
  ctx.fillStyle=g;ctx.beginPath();
  ctx.moveTo(x0,y);ctx.lineTo(x0,yb);
  ctx.ellipse(x,yb,w/2,ry,0,Math.PI,0,true);
  ctx.lineTo(x1,y);
  ctx.ellipse(x,y,w/2,ry,0,0,Math.PI,true);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#dfe6ec';ctx.beginPath();ctx.ellipse(x,y,w/2,ry,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#6f7b85';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(x,yb,w/2,ry,0,0,Math.PI);ctx.stroke();
  var cy=y-stub-hr+2;
  ctx.strokeStyle='#5f6b75';ctx.lineWidth=Math.max(1.4,w*0.03);
  ctx.beginPath();ctx.moveTo(x,y+2);ctx.lineTo(x,cy+hr);ctx.stroke();
  ctx.beginPath();ctx.arc(x,cy,hr,0,Math.PI*2);ctx.stroke();
  l1txt(ctx,mass+'g',x,y+h*0.5+1,'#333',Math.max(8,Math.min(13,Math.round(h*0.37))),'center');
  return {w:w,h:h,hookTop:{x:x,y:y-stub}};
};

/* spring_helix: 参数化螺旋弹簧（来源 C7V6 exp-bench-core.helix；P(θ)=(x+sw·sinθ, ya+pitch·θ/2π+e·cosθ)，前后股深度排序：后股压暗+前股高光芯）
 * (x,y)=顶端锚点（悬挂件向下绘制）；opt.ext 伸长量px（底端=y+ext；弹性/塑性弯曲态由页面物理经ext驱动，件本体无状态）；opt.sw 旋半径；opt.color 材质色；opt.k 材质刚度（线宽光泽随k）；opt.turns 匝数默认12
 * 返回 {top,bottom}；变体白名单: ext/sw/color/k/turns
 */
PROPS.spring_helix=function(ctx,x,y,opt){
  opt=opt||{};
  var y0=y,y1=y+(opt.ext==null?120:opt.ext);
  var sw=opt.sw||36,color=opt.color||'#b9c5d1';
  var k=opt.k==null?1:opt.k,turns=opt.turns||12;
  var lead=6;
  var lw=sw*0.07*(0.9+k*0.06),gl=Math.round(10+k*16);
  var ya=y0+lead,yb=y1-lead,span=Math.max(0,yb-ya);
  var e=sw*0.32,pitch=span/turns;
  if(pitch<lw*0.75)pitch=lw*0.75;
  var tt=Math.max(1,span/pitch),thEnd=tt*2*Math.PI;
  var step=Math.min(0.12,1.8/Math.max(sw,1)),N=Math.ceil(thEnd/step);
  function PX(th){return x+sw*Math.sin(th);}
  function PY(th){return ya+pitch*th/(2*Math.PI)+e*Math.cos(th);}
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  ctx.strokeStyle=color;ctx.lineWidth=lw;
  ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(PX(0),PY(0));
  ctx.moveTo(PX(thEnd),PY(thEnd));ctx.lineTo(x,y1);ctx.stroke();
  var pts=[],j,th;
  for(j=0;j<=N;j++){th=Math.min(j*step,thEnd);pts.push([PX(th),PY(th),Math.cos(th)>=0]);}
  function strokeRun(run,front){
    if(run.length<2)return;
    ctx.beginPath();ctx.moveTo(run[0][0],run[0][1]);
    for(var z=1;z<run.length;z++)ctx.lineTo(run[z][0],run[z][1]);
    ctx.stroke();
    if(front){
      ctx.strokeStyle=l1shade(color,gl+10);ctx.lineWidth=lw*0.35;
      ctx.beginPath();ctx.moveTo(run[0][0],run[0][1]);
      for(var z2=1;z2<run.length;z2++)ctx.lineTo(run[z2][0],run[z2][1]);
      ctx.stroke();
      ctx.strokeStyle=color;ctx.lineWidth=lw;
    }
  }
  function pass(front){
    var run=[],q;
    ctx.strokeStyle=front?color:l1shade(color,-gl-24);
    ctx.lineWidth=front?lw:lw*0.9;
    for(q=0;q<pts.length;q++){
      if(pts[q][2]===front)run.push(pts[q]);
      else{strokeRun(run,front);run=[];}
    }
    strokeRun(run,front);
  }
  pass(false);pass(true);
  ctx.restore();
  return {top:{x:x,y:y0},bottom:{x:x,y:y1}};
};

/* meter_side: 侧视教材测力计（来源 C7V6 exp-bench-core C7V6 参照图sprite本体+参数化覆盖件，及程序化回退体；全要素：刻度/指针/调零螺丝/吊环/拉杆/挂钩）
 * (x,y)=本体顶面中心（悬挂件顶锚点，向下绘制）；opt.mode='balance' 参照图sprite本体（img未加载自动回退程序化体）| 'spring' 程序化体（半透壳露内簧+调零螺丝）；
 * opt.bodyH 本体高；opt.r 读数N；opt.range 量程默认5；opt.flash 超限红闪秒；opt.img 页面已加载Image（可选，避免双图竞态）；opt.blRef 弹簧ext参考高（zoom用，=场景L.BL）
 * 返回 {bodyW,py,hookY,tabTop,ext,ready}；变体白名单: mode/bodyH/r/range/flash/img/blRef
 */
var L1_METER_CBS=[];
var L1_METER_IMG=new Image();
L1_METER_IMG.onload=function(){L1_METER_CBS.forEach(function(f){try{f()}catch(e){}});};
L1_METER_IMG.src='assets/meter_body.png?v=20261117';
var L1_MB={spring_top:0.3750,strip_top:0.4406,zero:0.4501,five:0.9024,slot_x0:0.4561,slot_x1:0.5501,face_cx:0.4992};
var L1_TAB_WF=0.4777,L1_TAB_HF=0.376,L1_HOLE_YF=0.1418,L1_HOLE_RF=0.074,L1_WIRE_U=649;
function l1meterSlot(hx,bodyW){return {l:hx+(L1_MB.slot_x0-0.5)*bodyW,r:hx+(L1_MB.slot_x1-0.5)*bodyW};}
function l1meterSpring(ctx,hx,top,bodyW,bodyH,py){
  var y0=top+L1_MB.spring_top*bodyH,y1=py-2,sl=l1meterSlot(hx,bodyW);
  var lw=Math.max(1,bodyW*0.012),l=sl.l+lw,r=sl.r-lw,c=(sl.l+sl.r)/2;
  ctx.save();
  ctx.strokeStyle='#4a4a4a';ctx.lineWidth=lw;ctx.lineJoin='round';ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(c,y0);
  if(y1-y0<4)ctx.lineTo(c,Math.max(y0+1,y1));
  else{
    var seg=(y1-y0)/14;
    for(var i=0;i<14;i++)ctx.lineTo(i%2===0?r:l,y0+seg*(i+1));
    ctx.lineTo(c,y1);
  }
  ctx.stroke();ctx.restore();
}
function l1meterRod(ctx,hx,top,bodyW,bodyH,py,ext){
  var tabTop=top+bodyH-0.02*bodyH+ext;
  ctx.save();
  ctx.strokeStyle='#8595a8';ctx.lineWidth=Math.max(1.4,bodyW*0.022);ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(hx,py);ctx.lineTo(hx,tabTop+1);ctx.stroke();
  ctx.restore();
}
function l1meterPointer(ctx,hx,top,bodyW,bodyH,py){
  var sl=l1meterSlot(hx,bodyW),e=0.06*bodyW,th=Math.max(2,bodyH*0.006);
  ctx.save();
  ctx.fillStyle='#d92b2b';ctx.fillRect(sl.l-e,py-th/2,(sl.r-sl.l)+e*2,th);
  ctx.fillStyle='#20242a';ctx.fillRect(hx-0.025*bodyW,py+th/2,0.05*bodyW,0.012*bodyH);
  ctx.restore();
}
function l1meterTabHook(ctx,hx,top,bodyW,bodyH,ext){
  var tabW=L1_TAB_WF*bodyW,tabH=L1_TAB_HF*bodyW;
  var tabTop=top+bodyH-0.02*bodyH+ext,tabX=hx-tabW/2;
  var rb=Math.min(tabW/2,tabH),by=tabTop+tabH,u=bodyW/L1_WIRE_U;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tabX,tabTop);ctx.lineTo(tabX+tabW,tabTop);
  ctx.lineTo(tabX+tabW,by-rb);
  ctx.arcTo(tabX+tabW,by,tabX+tabW-rb,by,rb);
  ctx.lineTo(tabX+rb,by);
  ctx.arcTo(tabX,by,tabX,by-rb,rb);
  ctx.closePath();
  ctx.fillStyle='rgb(220,218,221)';ctx.fill();
  ctx.fillStyle='rgb(202,200,203)';ctx.fillRect(tabX,tabTop,tabW,tabH*0.12);
  ctx.fillStyle='#fff';l1circ(ctx,hx,tabTop+L1_HOLE_YF*bodyW,L1_HOLE_RF*bodyW);ctx.fill();
  function wire(){
    ctx.beginPath();
    ctx.moveTo(hx,by+4*u);
    ctx.bezierCurveTo(hx-60*u,by+40*u,hx-151*u,by+120*u,hx-151*u,by+178*u);
    ctx.bezierCurveTo(hx-151*u,by+260*u,hx-90*u,by+331*u,hx-32*u,by+331*u);
    ctx.bezierCurveTo(hx+40*u,by+331*u,hx+128*u,by+270*u,hx+128*u,by+208*u);
  }
  ctx.lineCap='round';
  ctx.strokeStyle='#3f3f3f';ctx.lineWidth=0.0123*bodyW;wire();ctx.stroke();
  ctx.strokeStyle='#fff';ctx.lineWidth=0.0062*bodyW;wire();ctx.stroke();
  ctx.restore();
  return by+0.51*bodyW;
}
function l1meterFlash(ctx,hx,top,bodyW,bodyH,flash){
  if(!(flash>0)||Math.floor(flash*10)%2!==0)return;
  ctx.save();ctx.fillStyle='rgba(220,38,38,.28)';
  l1rr(ctx,hx-bodyW/2,top,bodyW,bodyH,8);ctx.fill();ctx.restore();
}
PROPS.meter_side=function(ctx,x,y,opt){
  opt=opt||{};
  var img=opt.img||L1_METER_IMG;
  var ready=img.complete&&img.naturalWidth>0;
  var bodyH=opt.bodyH||260,range=opt.range||5,r=opt.r||0,flash=opt.flash||0;
  var blRef=opt.blRef||bodyH;
  function bwF(bh){return bh*(img.naturalWidth||165)/(img.naturalHeight||800);}
  function extF(bh){return bh*(1-86/blRef)*l1clamp(r,0,range)/range;}
  if((opt.mode||'balance')==='balance'&&ready){
    var bw=bwF(bodyH),e=extF(bodyH);
    ctx.drawImage(img,x-bw/2,y,bw,bodyH);
    var z=y+L1_MB.zero*bodyH,f=y+L1_MB.five*bodyH;
    var py=z+(f-z)*l1clamp(r,0,range)/range;
    l1meterSpring(ctx,x,y,bw,bodyH,py);
    l1meterRod(ctx,x,y,bw,bodyH,py,e);
    l1meterPointer(ctx,x,y,bw,bodyH,py);
    var hookY=l1meterTabHook(ctx,x,y,bw,bodyH,e);
    l1meterFlash(ctx,x,y,bw,bodyH,flash);
    return {bodyW:bw,py:py,hookY:hookY,tabTop:y+bodyH-0.02*bodyH+e,ext:e,ready:true};
  }
  var bw2=l1clamp(Math.round(bodyH*0.40),44,64);
  var bt=y;
  ctx.strokeStyle='#3f4954';ctx.lineWidth=3.4;ctx.lineCap='round';
  l1circ(ctx,x,bt-9,7.5);ctx.stroke();
  ctx.fillStyle='#8595a8';l1rr(ctx,x-6,bt-2,12,5,2);ctx.fill();
  ctx.fillStyle='#3f4954';l1rr(ctx,x+bw2/2-2,bt+6,10,7,2.5);ctx.fill();
  ctx.strokeStyle='#828d99';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(x+bw2/2+1,bt+9.5);ctx.lineTo(x+bw2/2+6,bt+9.5);ctx.stroke();
  ctx.fillStyle='rgba(244,246,248,.55)';l1rr(ctx,x-bw2/2,bt,bw2,bodyH,8);ctx.fill();
  var flashing=flash>0&&Math.floor(flash*10)%2===0;
  ctx.strokeStyle=flashing?'#dc2626':'#8595a8';ctx.lineWidth=flashing?3.5:2.2;
  l1rr(ctx,x-bw2/2,bt,bw2,bodyH,8);ctx.stroke();
  l1txt(ctx,'条型测力计',x,bt+11,'#28323d',9.5,'center');
  l1txt(ctx,'J14003 · 量程5N',x,bt+22,'#6b7885',7.5,'center');
  var sTop=bt+62,sLen=bodyH-86;
  var py2=sTop+sLen*l1clamp(r,0,range)/range;
  PROPS.spring_helix(ctx,x,bt+26,{ext:(py2-2)-(bt+26),sw:11,color:'#b9c5d1',k:1.1,turns:7});
  ctx.fillStyle='rgba(255,255,255,.8)';l1rr(ctx,x-12,sTop-10,24,sLen+18,4);ctx.fill();
  ctx.strokeStyle='#8595a8';ctx.lineWidth=2.6;
  var hookY2=bt+bodyH+8+(bodyH-86)*l1clamp(r,0,range)/range;
  ctx.beginPath();ctx.moveTo(x,py2-2);ctx.lineTo(x,hookY2);ctx.stroke();
  l1txt(ctx,'N',x-bw2/2+9,sTop-6,'#6b7885',8,'center');
  l1txt(ctx,'gf',x+bw2/2-11,sTop-6,'#6b7885',8,'center');
  for(var i=0;i<=10;i++){
    var yy=sTop+sLen*i/10,major=i%2===0;
    ctx.strokeStyle='#334155';ctx.lineWidth=major?1.6:1;
    ctx.beginPath();ctx.moveTo(x-bw2/2+3,yy);ctx.lineTo(x-bw2/2+(major?13:8),yy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+bw2/2-3,yy);ctx.lineTo(x+bw2/2-(major?13:8),yy);ctx.stroke();
    if(major){
      l1txt(ctx,String(i/2),x-bw2/2+15,yy,i===0?'#dc2626':'#334155',8.5);
      l1txt(ctx,String(Math.round(i*51)),x+bw2/2-15,yy,i===0?'#dc2626':'#334155',7.5,'right');
    }
  }
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x-bw2/2+3,sTop);ctx.lineTo(x-bw2/2+14,sTop);ctx.stroke();
  l1txt(ctx,'分度0.1N',x,sTop+sLen+11,'#6b7885',7,'center');
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2.4;
  ctx.beginPath();ctx.moveTo(x-bw2/2+3,py2);ctx.lineTo(x+bw2/2-3,py2);ctx.stroke();
  ctx.fillStyle='#dc2626';l1circ(ctx,x-bw2/2+6,py2,2.6);ctx.fill();
  ctx.strokeStyle='#8595a8';ctx.lineWidth=2.8;
  ctx.beginPath();ctx.moveTo(x,hookY2);
  ctx.arc(x+4,hookY2+2,4,Math.PI,0,true);ctx.stroke();
  return {bodyW:bw2,py:py2,hookY:hookY2,tabTop:null,ext:(bodyH-86)*l1clamp(r,0,range)/range,ready:false};
};
PROPS.meter_side.IMG=L1_METER_IMG;
PROPS.meter_side.G={MB:L1_MB,TAB_WF:L1_TAB_WF,TAB_HF:L1_TAB_HF,HOLE_YF:L1_HOLE_YF,HOLE_RF:L1_HOLE_RF,WIRE_U:L1_WIRE_U,slot:l1meterSlot};
PROPS.meter_side.onLoad=function(cb){L1_METER_CBS.push(cb);};

})(typeof window !== 'undefined' ? window : globalThis);

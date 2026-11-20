/* ============================================================
 * exp-road-core.js — 场景A（7.1 力）侧视马路  C7V5-R9
 * R9 修订：P1 贝塞尔写实卡通小人(头/发/脸/颈/躯干/臂手/弯膝腿/鞋+shading衣纹)；P2 车缩至0.24W；
 * P3 手臂以肩为轴臂长恒定(单关节IK)够得着才搭手；P4 刹车=竖直滑道+踏板滑钮；
 * P5 护坡参照坝体剖面(棕土坡+灰护面+正常高水位水平线截坡)；P7 轮滑鞋=一排滚轮+轮架醒目配色；
 * P8 左推/右推按钮·只推不拉·人站哪侧只能向另一侧推；P9 方向盘力先行(切向矢量→克服静阻力→扭矩+惯性+阻尼)；
 * P10 海绵米色多孔+标签；P11 动作触发语音 x轮起由 guide 引擎承载（触发式 mp3+字幕，见 window.C7S1_STATE）。
 * 力的示意图经 force-overlay.js 门控（开=仅活跃交互画矢量；关=全场景无）。
 * x轮：车相关力显示=内部×DISP(50)（内部物理零改动）；重力仅 slide/pond未停 且脱手时注册，maxLen=110。
 * z9轮：修1 海绵 toggle——S.sponge 缺省 false（手直接推车）；海绵仅 on 时绘制/形变；接触面=海绵脸(on)/车脸(off)，臂IK/够得着同步；
 *       穿轮滑鞋静默置 sponge=false（不播拿掉条）。修2 flag 矩阵重排——电平 sponge/ice/diagram；
 *       脉冲 pushStatic/pushMove/icePush/release/spongeAdd/spongeRemove；删 pushStart/pushNormal/staticHold/iceSlide/iceLock。
 * z10轮：修1 release 改电平——脱手边沿 && car.vx·d>2（当下仍在滑行）&& 非轮滑 → RS.release=true 常驻（1s 脉冲删除）；
 *       清 false 时机=下次推中上升沿 / 重置 / 换鞋。修2 换鞋清前置——shoeIce/shoeNormal 清 everPushed/everMoved/RS.release。
 * z11轮：修1 release 双门槛——(a) 进入 slide 瞬间 RS.release=false；
 *       (b) 置位加 !S.sponge（隔海绵推不置电平）。修3 方向盘阻尼加大——omega 衰减 3.2→6.5、DIAL_KT 5.5→4.2（FRES/clamp 不变）。
 * z12轮：修1 release 置位边沿加 car.mode==='road' 门槛——持触推车越坡时 mode 变化构成合成脱手边沿，不得在 z11a 清零后复置电平（slide/pond/settled 期间任何边沿都不置）。
 * z13轮：修2 完成度电平 has*×8（hasPushed/hasCoasted/hasBraked/hasIcePushed/hasSpongePushed/hasDiagramOn/hasWheel/hasSlid，置 true 后仅 resetCar 清）——praise c7r-37 触发源；
 *       修3 idle 暴露——window 捕获 pointerdown/keydown/wheel 归零 lastUserT，每 tick 写 RS.idle=(now-lastUserT)/1000（秒，数值）。
 * z14轮：引导并入动作条（guide-data 已删松手条/15 idle 催办条/入场续条）——修1 brakeLevel 暴露：RS.brakeLevel=S.brake 数值电平每 tick 同步
 *       （c7r-03 brakeLevel===0 / c7r-25 brakeLevel>0 双分支门槛，防引导循环）；修2 release 残留守卫：RS.release/hasCoasted 置位保留（praise 链用），core 无已删 clip id 引用。
 * z16轮：修1 push session 结构——sessionMoved 接触上升沿重置；vx·d>2 持续≥0.3s → sessionMoved=true + pulse pushMove（每 session 一次）；
 *       pushStatic 仅 !sessionMoved 且 |vx|<2 持续0.8s 才 pulse（每 session 一次），sessionMoved 后本 session 抑制——力小只播静推条/力大才播推车条/先静后走推车条接棒。
 * ============================================================ */
(function () {
  'use strict';

  /* ===== 调色板 ===== */
  var PAL = {
    grass1: '#8bc34a', grass2: '#558b2f', asphalt: '#42474e', asphaltTop: '#5b616b', lane: '#e8b62c',
    dirt: '#9c7a50', dirtDark: '#7d6040', lining: '#9aa3ab', liningDark: '#77828c',
    water1: '#5aa7e0', water2: '#2b6fae', foam: 'rgba(255,255,255,.55)',
    car: '#d64545', carTop: '#e05555', carBot: '#b03030', carGlass: '#bfe3f2', wheel: '#2b2f36', rim: '#c7ced6',
    skin: '#f0c08a', skinSh: '#d9a066', hair: '#5a3d26', cloth: '#3f6fb5', clothSh: '#2f568f', pants: '#37474f',
    sleeve: '#f9d624',                                                          // w轮修5：豆包有机身袖色（肩头补片同色）
    shoe: '#5b4636', skate: '#ff9f1c', skateDark: '#b36a00', ice: '#bfe6f5',
    sponge: '#f6e3a8', spongeDark: '#d3b063', spongeHole: '#e2c988',
    text: '#28323d', sub: '#6b7885', bar: '#e2e8f0', thrust: '#dc2626', speed: '#2563eb'
  };

  /* ===== 物理常量（力→加速度，非速度） ===== */
  var M = 1.2, A_SCALE = 55, F_MAX = 10, FRIC = 130, BRAKE_SCALE = 55, BRAKE_MAX = 10;
  var V_MAX = 500, G_SLOPE = 620, ICE_K = 34, ICE_FRIC = 90, DIAL_FMAX = 6, WEIGHT_N = M * 9.8;
  var DIAL_FRES = 1.0, DIAL_KT = 4.2;                                           // P9：静态阻力阈值 + 扭矩系数（z11修3：KT 5.5→4.2 阻尼加大）
  var DISP = 50, GDISP = 1000;                                                  // x轮修1：显示倍率——车相关力×50（满量程500N）、重力按 M显示1200kg×9.8=11760N；内部物理零改动

  /* ===== 画布脚手架 ===== */
  var cv = document.getElementById('scene');
  var ctx = cv.getContext('2d');
  var W = 960, H = 540, DPR = 1, dirty = true, lastNow = 0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function sfx(name) { if (!S.muted && window['play' + name]) { try { window['play' + name](); } catch (e) {} } }

  /* ===== 布局 L（resize 全量重算） ===== */
  var L = {};
  function layout() {
    var zEl = document.querySelector('.zone');                                  // z8修2：窄屏场景带收进 zone 之上（c6 约定；W≥900 布局零改动）
    var zoneH = zEl && zEl.offsetHeight > 0 ? zEl.offsetHeight : (W < 640 ? 150 : 90);   // DOM 实测，fallback 按 W 估 150/90
    var uH = W < 900 ? H - zoneH : H;
    L.zoneH = zoneH; L.uH = uH;
    L.roadTop = Math.round(uH * 0.58);
    L.roadH = Math.max(26, Math.round(uH * 0.06));
    L.roadBot = L.roadTop + L.roadH;
    L.roadLeft = 30;
    L.slopeX = Math.round(W - Math.max(200, W * 0.26));
    L.toeX = W - 20;                                                            // P5：坝体剖面——坡脚
    L.pondBottom = uH - 10;                                                     // p轮：池底（z8：窄屏按 usableH）
    L.bumpA = Math.max(3, Math.round(uH * 0.008));
    L.personH = Math.max(96, Math.round(H * 0.30 * clamp(W / 700, 0.62, 1)));    // 窄屏按比例收小人，保人车比例
    L.armLen = Math.round(L.personH * 0.36);
    L.pushK = F_MAX / Math.max(10, L.personH * 0.30);
    L.carW = clamp(Math.round(W * 0.24), 118, Math.round(H * 0.44));            // P2：车稍缩小
    L.carH = Math.round(L.carW * 0.42);
    L.pondY = Math.max(L.roadBot + 4, Math.min(Math.round(uH * 0.68), L.pondBottom - Math.round(1.35 * L.carH)));  // p轮：正常高水位——水深≥1.35车高保证整辆没顶（z8：y 按 usableH）
    L.restX = W + L.carW * 0.05;                                                // p轮：停住中心=车尾留45%、车头探出画外
    L.wheelR = Math.round(L.carH * 0.30);
    L.homeX = L.roadLeft + L.carW * 0.5 + Math.round((L.slopeX - L.roadLeft - L.carW) * 0.32);
    L.shoreX = L.slopeX - Math.round(L.personH * 0.16);
    L.waterX = L.toeX;                                                          // P5：水位线与坡面交点
    for (var x = L.slopeX; x <= L.toeX; x += 4) { if (groundY(x) >= L.pondY) { L.waterX = x; break; } }
    L.gh = 38;
    L.pedalW = W < 430 ? 58 : 68;
    var pedX = W - L.pedalW - 40;                                               // z8b修1：pedal.x 先算——W<900 仪表卡右缘让位至 ≤ pedX−12（W≥900 零改动）
    var gy0 = W < 640 ? 112 : 44;                                               // 窄屏：仪表下移让出顶部提示
    if (W >= 900) { L.gw = clamp(Math.round((W - 48) / 2), 220, 430); L.g1 = { x: 16, y: gy0, w: L.gw }; L.g2 = { x: 32 + L.gw, y: gy0, w: L.gw }; }
    else if (W >= 660) { var gCW = Math.round((pedX - 12 - 8) / 2); L.gw = gCW - 16; L.g1 = { x: 16, y: gy0, w: L.gw }; L.g2 = { x: 16 + gCW, y: gy0, w: L.gw }; }   // z8b：横排两卡 cardW=(pedX−12−卡左8−gap0)/2，右对齐数值/满量程随新宽
    else { L.gw = pedX - 12 - 8 - 16; L.g1 = { x: 16, y: gy0, w: L.gw }; L.g2 = { x: 16, y: gy0 + L.gh + 32, w: L.gw }; }   // z8b：堆叠两卡 cardW=pedX−12−卡左8
    var pedY = W >= H ? Math.round(H * (W < 640 ? 0.36 : 0.30)) : Math.max(64, Math.round(H * 0.10));   // z8修1：竖屏=天空带右侧；横屏现状满足则不动 y 只加 clamp
    var pedH = Math.min(Math.max(120, Math.round(H * 0.32)), Math.max(120, L.roadTop - 24 - 46 - pedY)); // clamp(round(H*.32),120,roadTop-24-y-46)
    if (pedY + pedH + 46 > L.roadTop - 24) pedY = Math.max(8, L.roadTop - 24 - 46 - pedH);              // 硬约束全视口：底+46(读数+提示label) ≤ roadTop-24
    L.pedal = { x: pedX, y: pedY, w: L.pedalW, h: pedH };                        // P4：竖直滑道（z8：不压护坡；nearPedal 读本 rect 自动同步）
    var mw = clamp(Math.round(Math.min(W, H) * 0.66), 230, 420);
    L.modal = { w: mw, h: mw, x: Math.round((W - mw) / 2), y: Math.round((H - mw) / 2) };
    L.dialR = Math.round(mw * 0.30);
  }

  /* ===== 状态 ===== */
  var S = {
    car: { x: 0, vx: 0, y: 0, angle: 0, mode: 'road', settled: false, splashT: 0 },
    person: { x: 0, vx: 0, sliding: false, off: 0, baseX: 0 },
    sponge: false, spongeDef: 0,                                                // z9修1：海绵 toggle 缺省关（手直接推车）；def=形变量
    push: { active: false, F: 0 },
    pushDir: 'left',                                                            // P8：左推(人在车左→推向右) / 右推
    shoe: 'normal', brake: 0, brakeSaved: 0, wheelZoom: false,
    dial: { angle: 0, omega: 0, drag: null, F: 0, Ft: 0, dir: null, tan: null, pt: null, msg: '' },   // w轮修2：F=施加力总量F_full(∝|drag|)，dir=拖拽方向，Ft=带符号切向分力
    diagram: false, muted: false,
    eng: 0,                                                                     // d轮：站↔推过渡系数（渲染-only）
    sw: null,
    ps: { mode: 'idle', x: 0, y: 0, downX: 0, downY: 0, moved: 0 }
  };
  window.C7V5_ROAD = S;

  /* z7轮修1：guide 解说状态源（engine-core 轮询；事件标志=pulse 置 true 后 1.0s 自动归零→重复动作产生新边沿可重复播报；
     z9修2：电平型 sponge/ice/diagram 随开关/鞋态 true/false，不归零；
     z10修1：release 改电平——脱手边沿+当下滑行(vx·d>2)+非轮滑 → true 常驻；清 false=推中上升沿/重置/换鞋（z14：松手条已删，电平保留备 praise 链）；
     脉冲 pushStatic=!sessionMoved且推中|vx|<2 持续0.8s（每session一次） / pushMove=推中vx·d>2 持续0.3s（每session一次，z16修1） / icePush=ice且推中 /
     spongeAdd/spongeRemove=toggle；slide/brake/wheel/shoeIce/shoeNormal 沿用 */
  var RS = {
    sponge: false, ice: false, diagram: false, release: false,              // z10修1：release 入电平组（常驻不归零）
    pushStatic: false, pushMove: false, icePush: false,
    spongeAdd: false, spongeRemove: false,
    slide: false, pond: false, settled: false, brake: false,
    wheel: false, shoeIce: false, shoeNormal: false,
    hasPushed: false, hasCoasted: false, hasBraked: false, hasIcePushed: false,   // z13修2：完成度电平（置 true 后仅 resetCar 清）
    hasSpongePushed: false, hasDiagramOn: false, hasWheel: false, hasSlid: false,
    idle: 0,                                                                      // z13修3：距上次用户动作秒数（每 tick 写）
    brakeLevel: 0                                                                 // z14修1：刹车数值电平=S.brake（每 tick 同步；c7r-03/25 双分支门槛）
  };
  window.C7S1_STATE = { mode: 'road', road: RS };
  var pulseTimers = {};                                                       // z7轮：pulse 定时器表（reset 清表）
  function pulse(key) {                                                       // 置 true + 1.0s 后自动归零；重复置 true 重启计时（每帧持续条件保持 true）
    RS[key] = true;
    if (pulseTimers[key]) clearTimeout(pulseTimers[key]);
    pulseTimers[key] = setTimeout(function () { RS[key] = false; pulseTimers[key] = null; }, 1000);
  }
  function clearPulses() { for (var pk in pulseTimers) { clearTimeout(pulseTimers[pk]); pulseTimers[pk] = null; } }
  var pushStaticT = 0;                                                      // z9修2：推中且|vx|<2 累计秒数（≥0.8 → pushStatic）
  var pushMoveT = 0, sessionMoved = false, sessionStatic = false;           // z16修1：push session——vx·d>2 累计秒数（≥0.3 → sessionMoved）；静推/推车每 session 一次标志（接触上升沿重置）
  var everPushed = false, everMoved = false;                                // z9修2：release 前置——曾推 / 车曾走（vx·d>2）；z10修2：换鞋清零

  /* ===== 地形（P5 坝体剖面护坡）+ 几何访问器 ===== */
  function groundY(x) {
    if (x <= L.slopeX) return L.roadTop;
    if (x >= L.toeX) return L.pondBottom;
    var t = (x - L.slopeX) / Math.max(1, L.toeX - L.slopeX);
    var s = t * t * (3 - 2 * t);                                                // 平滑坡面（坝体剖面感）
    var y = L.roadTop + (L.pondBottom - L.roadTop) * (t * 0.55 + s * 0.45);
    y += Math.sin(t * Math.PI * 5) * L.bumpA * (1 - t * 0.55);                  // 轻微起伏（碰撞减速源）
    return y;
  }
  function terrainPose(cx) {                                                    // p轮：双轴贴地——后/前轮接地点连弦，弦线角=车姿，clearance 抬升保证车体不嵌土
    var hf = L.carW * 0.32, rearX = cx - hf, frontX = cx + hf, base = frontX - rearX;
    var yR = groundY(rearX), yF = groundY(frontX);
    var angle = Math.atan2(yF - yR, base);
    var clearance = 0, chordC = yR + (yF - yR) * 0.5;                           // cx=弦中点
    for (var x = rearX; x <= frontX + 1e-6; x += 8) {
      var t = (x - rearX) / base, cy = yR + (yF - yR) * t;
      var d = cy - groundY(x); if (d > clearance) clearance = d;                // 弦高于地形处=凸起，抬升车体避免嵌入
    }
    if (clearance < 0) clearance = 0;
    return { rearX: rearX, frontX: frontX, yR: yR, yF: yF, angle: angle, chordY: chordC, clearance: clearance, grad: (yF - yR) / base };
  }
  function dirS() { return S.pushDir === 'left' ? 1 : -1; }                     // 推向：左推=车向+x
  function pushingNow() { return S.push.active && S.push.F > 0.05 && S.car.mode === 'road'; }
  function shoulderPt() {                                                       // d轮：肩轴对齐新素材实测分数
    var ph = L.personH, d = dirS();
    if (!pushingNow()) return { x: S.person.x + d * ph * 0.055, y: L.roadTop - ph * 0.66 };
    var ice = S.shoe === 'ice';
    if (ice) return { x: S.person.x + d * ph * 0.1641, y: L.roadTop - ph * 0.5588 };   // w轮 豆包轮滑推身肩切口实测(sprite 0.298w,0.320h)+脚锚0.6234→world(0.1641,0.5588)
    return { x: S.person.x + d * ph * 0.055, y: L.roadTop - ph * 0.575 };              // g轮 豆包有机push_body(418×652) 肩分数(0.3443,0.2949)+脚锚0.4498→world(0.055,0.575)
  }
  function SPONGE(d) {                                                          // d轮：海绵车体锚定（尾灯高度带），人靠近/推/松手都不动
    return { x: S.car.x - d * (L.carW * 0.5) - d * 3, y: L.roadTop + S.car.y - L.carH * 0.66 };
  }
  function CARFACE(d) {                                                         // z9修1：无海绵接触面=车脸（同尾灯高度带）
    return { x: S.car.x - d * (L.carW * 0.5), y: L.roadTop + S.car.y - L.carH * 0.66 };
  }
  function handTarget(d) { return S.sponge ? SPONGE(d) : CARFACE(d); }          // z9修1：接触点=海绵脸(on)/车脸(off)
  function comPoint() { return { x: S.car.x, y: L.roadTop + S.car.y - L.carH * 0.72 }; }
  function contactPoint() {                                                     // P3：肩为轴·臂长恒定——够得着搭手，够不着自然前伸
    var d = dirS();
    if (pushingNow()) return handTarget(d);                                     // z9修1：推车=手去够海绵脸(on)/车脸(off)
    var sh = shoulderPt(), faceX = handTarget(d).x;
    var dx = (faceX - sh.x) * d;
    var faceTop = L.roadTop + S.car.y - L.carH * 0.88, faceBot = L.roadTop + S.car.y - L.carH * 0.10;
    if (dx < L.armLen) return { x: faceX - d * 3, y: clamp(sh.y + Math.sqrt(Math.max(4, L.armLen * L.armLen - dx * dx)), faceTop, faceBot) };
    return { x: sh.x + d * L.armLen * 0.88, y: sh.y + L.armLen * 0.47 };
  }
  function reachPen() {                                                         // 手(肩+臂长)压到接触面多深 → 推力（z9修1：面=海绵脸/车脸 随 toggle 同步）
    if (S.car.mode !== 'road') return -1;
    var faceX = handTarget(dirS()).x;
    return L.armLen - (faceX - shoulderPt().x) * dirS();
  }
  function clampPersonX(x) {
    var d = dirS(), min = L.roadLeft + 12, max = L.shoreX;
    if (S.car.mode === 'road') {
      if (d > 0) max = Math.min(L.shoreX, S.car.x - L.carW * 0.5 - L.personH * 0.05);
      else { min = S.car.x + L.carW * 0.5 + L.personH * 0.05; max = L.slopeX - L.personH * 0.10; }
    }
    return clamp(x, min, Math.max(min, max));
  }
  function personHome() {
    var d = dirS();
    return clampPersonX(S.car.x - d * (L.carW * 0.5 + L.armLen + L.personH * 0.12));
  }
  function modalCenter() { return { x: L.modal.x + L.modal.w / 2, y: L.modal.y + L.modal.h / 2 }; }

  /* ===== resize ===== */
  function resize() {
    DPR = window.devicePixelRatio || 1;
    var r = cv.getBoundingClientRect();
    W = Math.max(360, Math.round(r.width)); H = Math.max(320, Math.round(r.height));
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layout();
    if (window.ForceOverlay) ForceOverlay.setScale(clamp(Math.round(W * 0.028), 18, 30));
    resetCar();
    dirty = true;
  }
  function resetCar() {
    var car = S.car;
    car.x = L.homeX; car.vx = 0; car.y = 0; car.angle = 0; car.mode = 'road'; car.settled = false;
    S.person.x = personHome();
    S.person.vx = 0; S.person.sliding = false; S.person.off = 0; S.person.baseX = S.person.x;
    S.push.active = false; S.push.F = 0; S.spongeDef = 0; S.eng = 0;
    S.brake = S.shoe === 'ice' ? BRAKE_MAX : 0; S.brakeSaved = 0;
    S.dial.drag = null; S.dial.angle = 0; S.dial.omega = 0; S.dial.msg = ''; S.dial.F = 0; S.dial.Ft = 0; S.dial.dir = null; S.dial.pt = null;
    clearPulses();                                                            // z7轮：清 pulse 定时器表
    for (var rk in RS) RS[rk] = false;                                        // guide 事件标志归零（可重新触发全部解说）
    RS.diagram = S.diagram;                                                   // z7轮修2：电平型 diagram 不归零，随开关状态恢复
    RS.sponge = S.sponge; RS.ice = S.shoe === 'ice';                          // z9修2：电平型 sponge/ice 随开关/鞋态恢复
    RS.brakeLevel = S.brake;                                                  // z14修1：数值电平随重置后刹车值恢复
    pushStaticT = 0; pushMoveT = 0; sessionMoved = false; sessionStatic = false;   // z16修1：session 状态随重置清
    pushWas = false; everPushed = false; everMoved = false;
    if (window.ForceOverlay) ForceOverlay.clear();
    dirty = true;
  }
  function canvasXY(ev) { var r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }

  /* ===== rAF 单循环 ===== */
  var lastUserT = 0;                                                            // z13修3：上次用户动作时刻（wire 里 window 捕获 pointerdown/keydown/wheel 归零）
  function markUser() { lastUserT = performance.now(); }
  function tick(now) {
    var dt = lastNow ? Math.min(48, now - lastNow) : 16; lastNow = now;
    RS.idle = (now - lastUserT) / 1000;                                         // z13修3：idle 秒数电平（z14：idle 催办条已删，电平保留）
    RS.brakeLevel = S.brake;                                                    // z14修1：刹车数值电平每 tick 同步（c7r-03 ===0 / c7r-25 >0 分支门槛）
    if (step(dt / 1000, now)) dirty = true;
    if (dirty) { dirty = false; draw(); }
    requestAnimationFrame(tick);
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
  function drawWheel(x, y, r, angle) {                                          // C7V6-L1 入库：几何统一走 PROPS.dial_side（圆环+水平直径杆+中心竖直半辐；车内/modal 同调用）
    PROPS.dial_side(ctx, x, y, { r: r, angle: angle || 0, color: PAL.wheel });
  }

  /* ===== 场景：天空/云/草地/池塘/护坡/沥青路+黄虚线（修订点2） ===== */
  function cloud(x, y, s) {
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    circ(x, y, s * 15); ctx.fill(); circ(x + s * 17, y - s * 9, s * 12); ctx.fill();
    circ(x + s * 34, y, s * 14); ctx.fill(); rr(x - s * 3, y - s * 2, s * 52, s * 14, s * 7); ctx.fill();
  }
  function drawScene(now) {
    var sg = ctx.createLinearGradient(0, 0, 0, L.roadTop);
    sg.addColorStop(0, '#6fb1e4'); sg.addColorStop(1, '#d9edfa');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, L.roadTop + 2);
    ctx.fillStyle = 'rgba(255,214,90,.35)'; circ(W * 0.84, L.roadTop * 0.24, 40); ctx.fill();
    ctx.fillStyle = '#ffd85e'; circ(W * 0.84, L.roadTop * 0.24, 26); ctx.fill();
    cloud(W * 0.12, L.roadTop * 0.30, Math.max(0.6, H / 700)); cloud(W * 0.48, L.roadTop * 0.18, Math.max(0.5, H / 850));
    var gg = ctx.createLinearGradient(0, L.roadTop, 0, H);
    gg.addColorStop(0, PAL.grass1); gg.addColorStop(1, PAL.grass2);
    ctx.fillStyle = gg; ctx.fillRect(0, L.roadTop, W, H - L.roadTop);
    // P5 护坡（参照坝体剖面）：棕色土坡 + 坡面灰色护面层 + 正常高水位水平线截坡
    var dg = ctx.createLinearGradient(0, L.roadTop, 0, H);
    dg.addColorStop(0, PAL.dirt); dg.addColorStop(1, PAL.dirtDark);
    ctx.beginPath(); ctx.moveTo(L.slopeX, L.roadTop);
    for (var x = L.slopeX; x <= L.toeX; x += 6) ctx.lineTo(x, groundY(x));
    ctx.lineTo(L.toeX, H); ctx.lineTo(L.slopeX, H); ctx.closePath();
    ctx.fillStyle = dg; ctx.fill();
    ctx.strokeStyle = PAL.lining; ctx.lineWidth = 8;                            // 灰色护面层
    ctx.beginPath(); ctx.moveTo(L.slopeX, L.roadTop);
    for (var x2 = L.slopeX; x2 <= L.toeX; x2 += 6) ctx.lineTo(x2, groundY(x2));
    ctx.stroke();    ctx.strokeStyle = PAL.liningDark; ctx.lineWidth = 1.6;                      // 护面板分缝
    for (var j = 1; j <= 5; j++) {
      var jx = L.slopeX + j * (L.toeX - L.slopeX) / 6, jy = groundY(jx);
      var jg = (groundY(jx + 3) - groundY(jx - 3)) / 6;
      ctx.beginPath(); ctx.moveTo(jx + jg * 5, jy - 5); ctx.lineTo(jx - jg * 7, jy + 7); ctx.stroke();
    }
    // 沥青路面 + 黄色虚线中线
    var ag = ctx.createLinearGradient(0, L.roadTop, 0, L.roadBot);
    ag.addColorStop(0, PAL.asphaltTop); ag.addColorStop(1, PAL.asphalt);
    ctx.fillStyle = ag; ctx.fillRect(L.roadLeft, L.roadTop, L.slopeX - L.roadLeft, L.roadH);
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(L.roadLeft, L.roadTop, L.slopeX - L.roadLeft, 3);
    ctx.strokeStyle = PAL.lane; ctx.lineWidth = Math.max(3, Math.round(L.roadH * 0.14)); ctx.setLineDash([20, 16]);
    ctx.beginPath(); ctx.moveTo(L.roadLeft + 6, L.roadTop + L.roadH * 0.58); ctx.lineTo(L.slopeX - 6, L.roadTop + L.roadH * 0.58); ctx.stroke();
    ctx.setLineDash([]);
    ctx.save(); ctx.fillStyle = PAL.text; ctx.font = '600 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('池塘护坡', (L.slopeX + L.waterX) / 2, L.roadTop - 10); ctx.restore();
  }

  /* ===== q轮 水体单遍半透明（车之后画 → 水下部分自然透水色 = 真浸没感，无蓝晕矩形） ===== */
  function drawWater() {
    ctx.beginPath(); ctx.moveTo(L.waterX, L.pondY); ctx.lineTo(W, L.pondY); ctx.lineTo(W, H);
    for (var x3 = L.toeX; x3 >= L.waterX; x3 -= 6) ctx.lineTo(x3, groundY(x3));
    ctx.closePath();
    var wg = ctx.createLinearGradient(0, L.pondY, 0, H);
    wg.addColorStop(0, 'rgba(90,167,224,.62)'); wg.addColorStop(1, 'rgba(43,111,174,.74)');
    ctx.fillStyle = wg; ctx.fill();
  }
  function drawWaterFx(now) {
    ctx.strokeStyle = PAL.foam; ctx.lineWidth = 2;                              // 水面波纹
    for (var i = 0; i < 3; i++) {
      var wy = L.pondY + 12 + i * 16, wx = L.waterX + 14 + i * 30;
      if (wx + 26 > W - 6) break;
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.quadraticCurveTo(wx + 13, wy - 4, wx + 26, wy); ctx.stroke();
    }
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.6; ctx.setLineDash([7, 6]);
    ctx.beginPath(); ctx.moveTo(L.waterX - 26, L.pondY); ctx.lineTo(W - 8, L.pondY); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#fff'; ctx.font = '600 11px sans-serif'; ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(20,50,90,.6)'; ctx.shadowBlur = 3;
    ctx.fillText('正常高水位', W - 12, L.pondY - 6); ctx.restore();
    if (S.car.mode === 'pond' && now - S.car.splashT < 1400) {                  // 入水飞溅波纹
      var p = (now - S.car.splashT) / 1400;
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.7 * (1 - p)).toFixed(2) + ')'; ctx.lineWidth = 2.5;
      for (var k2 = 0; k2 < 2; k2++) {
        var rad = 14 + p * 46 + k2 * 12;
        ctx.beginPath(); ctx.ellipse(S.car.x, L.pondY + 3, rad, rad * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
  }

  /* ===== PhET 风格写实轿车（车头向右，修订点4/8） ===== */
  function drawCar() {
    var car = S.car, gy = L.roadTop + car.y, w = L.carW, h = L.carH;
    // t轮：车身系锚定轮+悬架行程（前后锁死轮拱、只上下动=减震）——布局/物理在 core 算，绘制走 PROPS.car_side（C7V6-L1 入库）
    var Ox = car.x, Oy = L.roadTop + car.y, theta = car.angle;
    var cosT = Math.cos(theta), sinT = Math.sin(theta);
    var tMin = -0.10 * L.carH, tMax = 0.35 * L.carH;
    var wt = [], wheels = [];
    [-1, 1].forEach(function(sgn) {
      var axX = sgn * L.carW * 0.32, t = car._cl || 0;
      for (var it = 0; it < 5; it++) {
        var xw = Ox + axX * cosT + (L.wheelR - t) * sinT;
        var tRaw = (groundY(xw) - L.wheelR - Oy - axX * sinT + L.wheelR * cosT) / cosT;
        t = clamp(t + 0.5 * (tRaw - t), tMin, tMax);
      }
      var xwf = Ox + axX * cosT + (L.wheelR - t) * sinT;
      var ywf = Oy + axX * sinT + (-L.wheelR + t) * cosT;
      wt.push({ axX: axX, t: t, xw: xwf, yw: ywf });
      var stX = Ox + axX * cosT + L.wheelR * 2 * sinT;
      var stY = Oy + axX * sinT - L.wheelR * 2 * cosT;
      wheels.push({ x: xwf, y: ywf, sx: stX, sy: stY });
    });
    S._wheelT = wt;
    var ret = PROPS.car_side(ctx, car.x, gy, {
      w: w, h: h, angle: car.angle, wheelR: L.wheelR, wheels: wheels,
      dialAngle: S.dial.angle, com: comPoint(), comLabel: true
    });
    S.sw = ret.sw;                                                              // 车内方向盘命中盒（点击 → modal）
  }

  /* ===== P1 推手人（C7V6-L1 入库：sprite 机制/贝塞尔回退全部移入 PROPS.person_side；core 只传状态与 IK 目标） ===== */
  PROPS.person_side.onLoad(function () { dirty = true; });
  function drawPerson() {
    var per = S.person, ph = L.personH, d = dirS();
    var pushing = S.push.active && S.push.F > 0.05 && S.car.mode === 'road';
    var walking = S.ps.mode === 'person' || per.sliding;
    var reaching = pushing || S.ps.mode === 'person';
    PROPS.person_side(ctx, per.x, L.roadTop, {
      h: ph, dir: d, ice: S.shoe === 'ice', eng: S.eng, armLen: L.armLen,
      hand: handTarget(d), cp: reaching ? contactPoint() : null,
      pushing: pushing, walking: walking, sliding: per.sliding, spriteBase: 'assets/'
    });
  }


  /* ===== 手-车接触海绵（P10：米色多孔可识别 + 按压凹陷 + 标签；形变∝力） ===== */
  function drawSponge() {
    if (!S.sponge || S.car.mode !== 'road') return;                             // z9修1：海绵仅 toggle on 时绘制
    var d = dirS(), cp = SPONGE(d);                                             // d轮：车体锚定，靠近/推/松手全程不动
    PROPS.sponge_pad(ctx, cp.x, cp.y, { def: S.spongeDef, s: L.carH, dir: d }); // C7V6-L1 入库
  }

  /* ===== F/v 主观察仪表条（修订点6：高≥2.5倍、18px、数值+单位+满量程刻度） ===== */
  function drawGauge(g, frac, color, title, valTxt, maxTxt) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.90)'; rr(g.x - 8, g.y - 8, g.w + 16, L.gh + 40, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(100,116,139,.4)'; ctx.lineWidth = 1; rr(g.x - 8, g.y - 8, g.w + 16, L.gh + 40, 12); ctx.stroke();
    ctx.fillStyle = PAL.bar; rr(g.x, g.y, g.w, L.gh, 10); ctx.fill();
    if (frac > 0.001) { ctx.fillStyle = color; rr(g.x, g.y, Math.max(16, g.w * clamp(frac, 0, 1)), L.gh, 10); ctx.fill(); }
    ctx.strokeStyle = 'rgba(40,50,61,.4)'; ctx.lineWidth = 1.5;                 // 满量程刻度 0/25/50/75/100%
    for (var i = 0; i <= 4; i++) {
      var tx = g.x + g.w * i / 4, e = (i === 0 || i === 4) ? 0 : 7;
      ctx.beginPath(); ctx.moveTo(tx, g.y + e); ctx.lineTo(tx, g.y + L.gh - e); ctx.stroke();
    }
    ctx.font = '700 18px "PingFang SC","Microsoft YaHei",sans-serif'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255,255,255,.92)'; ctx.shadowBlur = 4; ctx.fillStyle = PAL.text;
    ctx.textAlign = 'left'; ctx.fillText(title, g.x + 10, g.y + L.gh / 2);
    ctx.textAlign = 'right'; ctx.fillText(valTxt, g.x + g.w - 10, g.y + L.gh / 2);
    ctx.shadowBlur = 0; ctx.font = '600 12px sans-serif'; ctx.fillStyle = PAL.sub;
    ctx.textAlign = 'left'; ctx.fillText('0', g.x + 2, g.y + L.gh + 13);
    ctx.textAlign = 'right'; ctx.fillText(maxTxt, g.x + g.w - 2, g.y + L.gh + 13);
    ctx.restore();
  }
  function drawGauges() {
    var f = S.push.active ? S.push.F / F_MAX : 0;
    var sp = clamp(Math.abs(S.car.vx) / V_MAX, 0, 1);
    drawGauge(L.g1, f, PAL.thrust, '推力 F', ((S.push.active ? S.push.F : 0) * DISP).toFixed(0) + ' N', '满量程 ' + (F_MAX * DISP) + ' N');   // x轮修1：显示=内部×50（0~500N）
    drawGauge(L.g2, sp, PAL.speed, '速度 v', Math.abs(S.car.vx).toFixed(0) + ' px/s', '满量程 500 px/s');
  }

  /* ===== P4 刹车=竖直滑道：踏板造型滑钮上下滑=刹车力（轮滑鞋锁定虚化） ===== */
  function drawBrake() {
    var p = L.pedal, dis = S.shoe === 'ice';
    PROPS.brake_pedal(ctx, p.x, p.y, {                                          // C7V6-L1 入库：滑轨+踏板滑钮整件
      w: p.w, h: p.h, frac: S.brake / BRAKE_MAX, dis: dis,
      valTxt: '刹车力 ' + (S.brake * DISP).toFixed(0) + ' N'                    // x轮修1：显示=内部×50
    });
  }

  /* ===== 方向盘放大区：居中 modal（修订点8） ===== */
  function drawWheelModal() {
    var b = L.modal, c = modalCenter(), R = L.dialR;
    ctx.save();
    ctx.fillStyle = 'rgba(15,23,42,.45)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.97)'; rr(b.x, b.y, b.w, b.h, 16); ctx.fill();
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; rr(b.x, b.y, b.w, b.h, 16); ctx.stroke();
    ctx.fillStyle = PAL.text; ctx.font = '700 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('方向盘放大区', c.x, b.y + 26);
    ctx.font = '600 12px sans-serif'; ctx.fillStyle = PAL.sub;
    ctx.fillText('按住轮上一点拖动 → 先见切向力矢量，', c.x, b.y + 42);
    ctx.fillText('克服阻力后盘才转动；松手即停', c.x, b.y + 58);
    // 轮盘（随拖动旋转；w轮修1：与车内同 drawWheel——圆环+水平直径杆+中心竖直半辐）
    drawWheel(c.x, c.y, R, S.dial.angle);
    // 12/3/6/9 点位标记（随盘转，文字不转）
    [[12, -Math.PI / 2], [3, 0], [6, Math.PI / 2], [9, Math.PI]].forEach(function (m) {
      var aa = m[1] + S.dial.angle, qx = c.x + Math.cos(aa) * R, qy = c.y + Math.sin(aa) * R;
      ctx.fillStyle = '#fff'; circ(qx, qy, 9); ctx.fill();
      ctx.strokeStyle = PAL.speed; ctx.lineWidth = 2; circ(qx, qy, 9); ctx.stroke();
      ctx.fillStyle = PAL.speed; ctx.font = '700 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(m[0] + '点', qx, qy);
    });
    if (S.dial.drag && S.dial.pt) { ctx.fillStyle = PAL.thrust; circ(S.dial.pt.x, S.dial.pt.y, 5); ctx.fill(); }
    // 关闭按钮
    var cbx = b.x + b.w - 20, cby = b.y + 20;
    ctx.fillStyle = '#e2e8f0'; circ(cbx, cby, 13); ctx.fill();
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(cbx - 5, cby - 5); ctx.lineTo(cbx + 5, cby + 5); ctx.moveTo(cbx + 5, cby - 5); ctx.lineTo(cbx - 5, cby + 5); ctx.stroke();
    if (S.dial.msg) {
      ctx.fillStyle = PAL.text; ctx.font = '600 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(S.dial.msg, c.x, b.y + b.h - 12);
    }
    ctx.restore();
  }

  /* ===== 合成 draw ===== */
  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    var t = now || performance.now();
    drawScene(t);
    drawCar();
    drawPerson();
    drawWater();                                                                  // q轮：水体单遍半透明（车之后画）
    drawWaterFx(t);                                                               // q轮：水花/泡沫/水位线/标签
    drawSponge();
    drawGauges();
    drawBrake();
    if (S.wheelZoom) drawWheelModal();
    if (window.ForceOverlay) ForceOverlay.draw(ctx, { w: W, h: H });
  }

  /* ===== overlay 注册（门控在 ForceOverlay 内；此处只管活跃事件） ===== */
  function syncOverlay() {
    var FO = window.ForceOverlay; if (!FO) return;
    var car = S.car, ice = S.shoe === 'ice', d = dirS();
    // x轮修1：重力策略回退——仅 护坡滑行/入水未停 且脱手时注册（撤销 w轮常驻）；显示 11760N、箭长上限 110px
    if ((car.mode === 'slide' || (car.mode === 'pond' && !car.settled)) && !S.push.active) {
      var c = comPoint();
      FO.register('gravity', { point: c, dir: { x: 0, y: 1 }, magN: WEIGHT_N, maxLen: 110, color: '#7c3aed', label: 'G≈' + (WEIGHT_N * GDISP).toFixed(0) + 'N' });
    } else FO.unregister('gravity');
    if (S.wheelZoom && S.dial.drag && S.dial.pt) {                             // w轮修2：施加力=拖拽方向（实线）+切向分力（虚线）
      if (S.dial.dir && S.dial.F > 0.12) {
        FO.register('dial', { point: S.dial.pt, dir: S.dial.dir, magN: S.dial.F, color: '#0891b2', label: '施加力 F=' + S.dial.F.toFixed(1) + 'N' });
      } else FO.unregister('dial');
      if (S.dial.tan && Math.abs(S.dial.Ft) > 0.12) {
        var sg2 = S.dial.Ft >= 0 ? 1 : -1;
        FO.register('dialTan', {
          point: S.dial.pt, dir: { x: S.dial.tan.x * sg2, y: S.dial.tan.y * sg2 }, magN: Math.abs(S.dial.Ft),
          color: '#d97706', label: '切向分力 ' + Math.abs(S.dial.Ft).toFixed(1) + 'N', dash: true
        });
      } else FO.unregister('dialTan');
    } else { FO.unregister('dial'); FO.unregister('dialTan'); }
    if (S.push.active && S.push.F > 0.05 && car.mode === 'road') {
      // w轮修3：作用反作用同点——pair 与主箭同作用点 cp（接触点），两种鞋都注册
      var cp = contactPoint(), fd = (S.push.F * DISP).toFixed(0);           // x轮修1：显示=内部×50（0~500N），magN 保持内部值（箭长不变）
      FO.register('push', {
        point: cp, dir: { x: d, y: 0 }, magN: S.push.F, color: PAL.thrust,
        label: (ice ? '车受推 ' : '推力 F=') + fd + 'N',
        pair: { point: cp, dir: { x: -d, y: 0 }, magN: S.push.F, color: PAL.speed, label: '人受向后 ' + fd + 'N' }
      });
    } else FO.unregister('push');
  }

  /* ===== 物理步进（力→加速度；P8 左/右推只推不拉 + 人车解耦 + P9 方向盘力先行） ===== */
  var pushWas = false;                                                     // z9修2：推中↔脱手边沿检测（release 触发源）
  function step(dt, now) {
    var ch = false, car = S.car, per = S.person, ice = S.shoe === 'ice', d = dirS();
    // 推力：手（肩+臂长）压到车面多深 → F（只推不拉，dir 恒=推向）
    var pen = reachPen();
    if (pen > 0) { S.push.active = true; S.push.F = clamp(pen * L.pushK, 0, F_MAX); }
    else { S.push.active = false; S.push.F = 0; }
    if (ice && S.push.active) {                                            // 相互作用：人持续向后加速（接触段）
      per.vx -= d * S.push.F * ICE_K * dt; per.sliding = true;
    }
    var pushingNow2 = S.push.active && S.push.F > 0.05 && car.mode === 'road';
    if (pushingNow2) {                                                       // z16修1：push session 结构——力小只静推条/力大才推车条/先静后走推车条接棒
      if (!pushWas) { sessionMoved = false; sessionStatic = false; pushStaticT = 0; pushMoveT = 0; }   // z16修1：接触上升沿重置 session
      if (ice) { pulse('icePush'); RS.hasIcePushed = true; }                   // c7r-22：冰面推中人后滑；z13修2
      if (car.vx * d > 2) {                                                    // c7r-03/20：推中车向前走（右推 vx<0 → 按 vx·d 判向前）
        pushMoveT += dt;                                                       // z16修1：首次有意义移动=vx·d>2 持续≥0.3s
        if (pushMoveT >= 0.3 && !sessionMoved) { sessionMoved = true; pulse('pushMove'); }   // z16修1：推车每 session 一次
        everMoved = true;
        RS.hasPushed = true;                                                   // z13修2
        if (S.sponge) RS.hasSpongePushed = true;                               // z13修2：隔海绵推车完成度
      } else pushMoveT = 0;
      if (!sessionMoved && !sessionStatic && Math.abs(car.vx) < 2) {           // z16修1：静推仅本 session 未走过（sessionMoved 后本 session 抑制）
        pushStaticT += dt;
        if (pushStaticT >= 0.8) { sessionStatic = true; pulse('pushStatic'); pushStaticT = 0; RS.hasPushed = true; }   // z13修2：静推也算推过；z16修1：每 session 一次
      } else pushStaticT = 0;
    } else { pushStaticT = 0; pushMoveT = 0; }
    if (pushingNow2) {
      if (!pushWas) RS.release = false;                                      // z10修1：推中上升沿清电平
      everPushed = true;
    } else if (pushWas && everPushed && everMoved && car.vx * d > 2 && !ice && !S.sponge && car.mode === 'road') {
      RS.release = true;                                                     // z10修1：脱手边沿+当下仍在滑行+非轮滑 → 电平常驻；z11修1b：加 !S.sponge（隔海绵推不播松手条）；z12修1：加 mode==='road'（持触越坡 mode 变化=合成脱手边沿，不得复置电平）
      RS.hasCoasted = true;                                                  // z13修2：松手滑行完成度
    }
    pushWas = pushingNow2;

    var decel = FRIC + S.brake / M * BRAKE_SCALE;
    if (car.mode === 'road') {
      car._cl = 0;
      var aPush = (!ice && S.push.active) ? d * S.push.F / M * A_SCALE : 0; // 轮滑：刹车锁定最大，车不动
      if (Math.abs(car.vx) <= 0.5 && Math.abs(aPush) <= decel) car.vx = 0;   // 静阻力顶得住 → 不动
      else {
        var a = aPush - (car.vx > 0 ? 1 : car.vx < 0 ? -1 : 0) * decel;
        car.vx += a * dt;
        if (car.vx * d < 0) car.vx = 0;                                     // 只推不拉：摩擦不得反向推车
        car.vx = clamp(car.vx, -V_MAX * 1.5, V_MAX * 1.5);
      }
      car.x += car.vx * dt;
      var minX = L.roadLeft + L.carW * 0.5;
      if (car.x < minX) { car.x = minX; if (car.vx < 0) car.vx = 0; }
      if (car.x >= L.slopeX && car.vx > 0) {
        car.mode = 'slide'; RS.release = false; RS.hasSlid = true; pulse('slide'); setHint('车越过路尽头 → 沿护坡滑下：重力加速，坡面起伏减速'); sfx('Click');   // x轮修3：c7r-05；z11修1a：进 slide 清 release 电平（queue 续条重判作废 → 滑落期间不播松手条）；z13修2：hasSlid
      }
      if (Math.abs(car.vx) > 0.05) ch = true;
    } else if (car.mode === 'slide') {
      var grad = (groundY(car.x + 6) - groundY(car.x - 6)) / 12;
      car.vx += G_SLOPE * grad * dt;                                      // 重力沿坡分量
      car.vx *= (1 - 0.55 * dt);                                          // 坡面起伏：碰撞/减速
      car.x += car.vx * dt;
      var ps = terrainPose(car.x);                                        // p轮：双轴贴地滚动
      car.y = ps.chordY - ps.clearance - L.roadTop;
      car.angle = ps.angle;                                               // 弦线角直接=车姿（无滞后→车底线=chord-clearance 恒不嵌土）
      car._cl = ps.clearance;
      ch = true;
      if (car.x >= L.waterX) {                                            // p轮：中心过水位截坡点 → 入水
        car.mode = 'pond'; car.splashT = now; car.settled = false; sfx('Match');
        pulse('pond');                                                   // x轮修3：c7r-06
        setHint('车沿护坡滑入水，继续贴坡面滑向池底');
      }
    } else {                                                              // pond：p轮——删除竖直 sink/rock 脱离地形，改为沿坡贴地滚到池底
      var pp = terrainPose(car.x);
      car.vx += G_SLOPE * pp.grad * 0.8 * dt;                            // 重力沿坡继续（双轴差/轴距）
      car.vx *= Math.pow(0.3, dt);                                       // 水阻
      car.x += car.vx * dt;
      if (car.x >= L.restX) { car.x = L.restX; car.vx = 0; }             // 右 clamp：车头探出画外、车尾留45%
      var pf = terrainPose(car.x);
      car.y = pf.chordY - pf.clearance - L.roadTop;
      var rock = (now - car.splashT < 1600) ? Math.sin(now * 0.006) * 0.02 * (1 - (now - car.splashT) / 1600) : 0;  // 入水微晃
      car.angle = pf.angle + rock;                                        // 地形弦线角 + 微晃（直接赋值，不脱离地形）
      car._cl = pf.clearance;
      if (!car.settled && Math.abs(car.vx) < 4 && car.x >= L.restX - 2) { car.settled = true; pulse('settled'); setHint('车沿护坡滑到池底停住——车头探出画外，池塘向画外延伸'); }   // x轮修3：c7r-07
      ch = !car.settled || Math.abs(rock) > 0.002;
    }

    // 人（轮滑滑离：接触段加速 + 脱手后惯性滑行缓慢减速；普通鞋由鼠标直接控制）
    if (per.sliding) {
      var penNow = reachPen();
      if (penNow > 0 && ice) {                                             // 接触段：偏移累积（鼠标仍可加压）
        per.off += per.vx * dt;
        per.x = clampPersonX(per.baseX + per.off);
      } else if (Math.abs(per.vx) > 2) {                                   // 脱手：惯性滑行缓慢减速（z9修2：iceSlide flag 已删——语音并入 c7r-22）
        per.vx -= Math.sign(per.vx) * ICE_FRIC * dt; per.x += per.vx * dt;
      } else {                                                             // 停下：偏移折回抓取基准，防回弹
        per.vx = 0; per.sliding = false;
        S.ps.grabDX += per.off; per.baseX = per.x; per.off = 0;
        setHint('轮滑鞋：手与车已脱离 → 人靠惯性滑行，缓慢停下');
      }
      if (per.x <= L.roadLeft + 12 && per.vx < 0) { per.x = L.roadLeft + 12; per.vx = 0; }
      per.x = clampPersonX(per.x);
      ch = true;
    }

    // P9 方向盘：切向力克服静阻力 → 扭矩 + 惯性 + 阻尼；松手即停（onUp 清 omega）
    var dl = S.dial;
    if (dl.drag) {
      var fa = Math.abs(dl.Ft);
      if (fa > DIAL_FRES) {
        dl.omega += Math.sign(dl.Ft) * (fa - DIAL_FRES) * DIAL_KT * dt;
        dl.omega *= (1 - 6.5 * dt);                                          // z11修3：拖拽中阻尼 3.2→6.5（转向更沉、峰值角速度更低）
        dl.omega = clamp(dl.omega, -9, 9);
        dl.angle += dl.omega * dt;
        ch = true;
      } else if (Math.abs(dl.omega) > 0.001) { dl.omega *= (1 - 9 * dt); dl.angle += dl.omega * dt; ch = true; }
    }

    // 海绵形变（弹簧回复，∝推力；z9修1：仅 toggle on 时形变）
    var sTarget = S.sponge && S.push.active && car.mode === 'road' ? S.push.F / F_MAX : 0;
    var nd = S.spongeDef + (sTarget - S.spongeDef) * Math.min(1, dt * 14);
    if (Math.abs(nd - S.spongeDef) > 0.001) { S.spongeDef = nd; ch = true; }

    // d轮：站↔推过渡系数（渲染-only，0.3s 趋近；v轮：ice 态同用 → skate↔skatepush crossfade）
    var engT = (S.push.active && S.push.F > 0.05 && car.mode === 'road') ? 1 : 0;
    if (S.eng !== engT) { S.eng = clamp(S.eng + (engT > S.eng ? dt : -dt) / 0.3, 0, 1); ch = true; }

    syncOverlay();
    return ch;
  }

  /* ===== pointer（P4 刹车滑道 / P8 推人 / P9 方向盘力先行） ===== */
  function nearPerson(p) { return Math.hypot(p.x - S.person.x, p.y - (L.roadTop - L.personH * 0.5)) <= L.personH * 0.6; }
  function nearPedal(p) { var q = L.pedal; return p.x >= q.x - 12 && p.x <= q.x + q.w + 12 && p.y >= q.y - 30 && p.y <= q.y + q.h + 40; }
  function brakeFromY(y) {
    var nb = clamp((y - (L.pedal.y + 10)) / (L.pedal.h - 20), 0, 1) * BRAKE_MAX;
    if (nb > S.brake + 1e-9) { pulse('brake'); RS.hasBraked = true; }        // x轮修3：刹车增大（c7r-08）；z13修2：hasBraked
    S.brake = nb;
  }
  function setHint(t) { }                                                       // x轮修4：#hint 框已删——知识点由 guide 语音字幕承载（c7r-01..14）；no-op 防调用点报错
  function openWheel() {
    S.wheelZoom = true; S.dial.msg = '按住轮上一点拖动试试'; seg('btn-wheel', true); sfx('Click');
    pulse('wheel');                                                           // x轮修3：c7r-11
    RS.hasWheel = true;                                                       // z13修2：方向盘放大区完成度
    dirty = true;
  }
  function closeWheel() {
    S.wheelZoom = false; S.dial.drag = null; S.dial.F = 0; S.dial.Ft = 0; S.dial.omega = 0; S.dial.dir = null; S.dial.pt = null; S.dial.msg = '';
    if (window.ForceOverlay) { ForceOverlay.unregister('dial'); ForceOverlay.unregister('dialTan'); }
    seg('btn-wheel', false); dirty = true;
  }
  function capture(ev) { if (cv.setPointerCapture && ev.pointerId != null) { try { cv.setPointerCapture(ev.pointerId); } catch (e) {} } }

  function onDown(ev) {
    var p = canvasXY(ev);
    S.ps.x = p.x; S.ps.y = p.y; S.ps.downX = p.x; S.ps.downY = p.y; S.ps.moved = 0;
    if (S.wheelZoom) {                                                     // modal 优先
      var c = modalCenter(), R = L.dialR, cbx = L.modal.x + L.modal.w - 20, cby = L.modal.y + 20;
      if (Math.hypot(p.x - cbx, p.y - cby) <= 16) { closeWheel(); return; }
      var d0 = Math.hypot(p.x - c.x, p.y - c.y);
      if (Math.abs(d0 - R) <= R * 0.45 || d0 <= R * 0.28) {
        S.dial.drag = { a0: Math.atan2(p.y - c.y, p.x - c.x) - S.dial.angle };
        S.dial.omega = 0;
        S.ps.mode = 'dial'; capture(ev); ev.preventDefault(); dirty = true; return;
      }
      if (p.x < L.modal.x || p.x > L.modal.x + L.modal.w || p.y < L.modal.y || p.y > L.modal.y + L.modal.h) closeWheel();
      return;
    }
    if (nearPedal(p)) {
      if (S.shoe === 'ice') { setHint('轮滑鞋：刹车已锁定为最大（虚化不可调）'); return; }
      S.ps.mode = 'pedal'; brakeFromY(p.y); capture(ev);
      setHint('沿竖直滑道上下拖动踏板滑钮 → 刹车力增大/减小');
      ev.preventDefault(); dirty = true; return;
    }
    if (S.sw && S.car.mode === 'road' && Math.hypot(p.x - S.sw.x, p.y - S.sw.y) <= S.sw.r + 12) { openWheel(); return; }
    if (nearPerson(p) && S.car.mode !== 'pond') {
      if (S.person.sliding) { setHint('人正在惯性滑行中，停下后才能再拖动'); return; }
      S.ps.mode = 'person'; S.ps.grabDX = S.person.x - p.x;
      S.person.off = 0; S.person.baseX = S.person.x; capture(ev);
      setHint(S.shoe === 'ice' ? '轮滑鞋：推到人车接触 → 人整体向后滑离车（相互作用）' : '拖动小人顶住车 → 车受力启动；按住不动 → 车凭惯性前滑');
      ev.preventDefault(); dirty = true; return;
    }
    S.ps.mode = 'idle';
  }
  function onMove(ev) {
    var p = canvasXY(ev); S.ps.x = p.x; S.ps.y = p.y;
    if (S.ps.mode === 'pedal') { brakeFromY(p.y); dirty = true; return; }
    if (S.ps.mode === 'person') {
      S.person.baseX = clampPersonX(p.x + (S.ps.grabDX || 0));
      if (!S.person.sliding) S.person.x = S.person.baseX;                  // 轮滑接触段：位置由 step 积分偏移
      dirty = true; return;
    }
    if (S.ps.mode === 'dial' && S.dial.drag) {                             // w轮修2：施加力=拖拽方向——F_full∝|drag|，Ft=F_full·sinθ 带符号（力先行语义不变）
      var c = modalCenter(), R = L.dialR;
      var a = S.dial.angle + S.dial.drag.a0, rx = Math.cos(a), ry = Math.sin(a);
      var gx = c.x + rx * R, gy = c.y + ry * R;
      var dx = p.x - gx, dy = p.y - gy, dl = Math.hypot(dx, dy);
      var cross = rx * dy - ry * dx;                                       // 单位径向×drag = |drag|·sinθ（=力臂×F/R）
      var ratio = dl > 1e-6 ? Math.abs(cross) / dl : 0;                    // 力臂/R = |sinθ|
      S.dial.pt = { x: gx, y: gy }; S.dial.tan = { x: -ry, y: rx };
      S.dial.dir = dl > 1e-6 ? { x: dx / dl, y: dy / dl } : null;           // 施加力方向=归一鼠标位移
      S.dial.F = clamp(dl / (R * 0.45) * DIAL_FMAX, 0, DIAL_FMAX);         // F_full=clamp(|drag|/(R·0.45)·FMAX)
      S.dial.Ft = ratio < 0.2 ? 0 : clamp(S.dial.F * cross / dl, -S.dial.F, S.dial.F);   // Ft=F_full·cross/(R·|drag|) 带符号
      if (ratio < 0.2) S.dial.msg = '作用线≈过盘心 → 力臂≈0 → 不转动';
      else if (Math.abs(S.dial.Ft) <= DIAL_FRES) S.dial.msg = '切向力 ' + Math.abs(S.dial.Ft).toFixed(1) + 'N ≤ 静阻力 ' + DIAL_FRES.toFixed(1) + 'N → 盘不动';
      else S.dial.msg = '切向力克服静阻力 → 力臂≈' + Math.round(ratio * R) + 'px → 盘转动（松手即停）';
      dirty = true; return;
    }
    var over = nearPedal(p) || nearPerson(p) ||
      (S.sw && S.car.mode === 'road' && Math.hypot(p.x - S.sw.x, p.y - S.sw.y) <= S.sw.r + 12);
    cv.style.cursor = over ? 'pointer' : 'default';
  }
  function onUp() {
    if (S.ps.mode === 'person') setHint('松手：不再推 → 车只受摩擦/刹车减速（力不是维持运动的原因）');
    if (S.ps.mode === 'dial') {                                            // 松手即停、矢量消
      S.dial.drag = null; S.dial.F = 0; S.dial.Ft = 0; S.dial.omega = 0; S.dial.dir = null; S.dial.pt = null; S.dial.msg = '松手 → 停止转动';
      if (window.ForceOverlay) { ForceOverlay.unregister('dial'); ForceOverlay.unregister('dialTan'); }
    }
    S.ps.mode = 'idle'; dirty = true;
  }

  /* ===== 控件 wiring ===== */
  function seg(id, on) { var b = document.getElementById(id); if (b) b.classList.toggle('on', !!on); }
  function syncFullBtn() {                                                     // x轮修2：全屏 toggle——按钮文案随 fullscreenElement 同步
    var fs = !!document.fullscreenElement;
    var b = document.getElementById('btn-full');
    if (b) b.textContent = fs ? '退出全屏' : '全屏';
    var back = document.querySelector('.back');                                  // y轮修1：全屏时左上"返回本节"隐藏，退出全屏才恢复
    if (back) back.style.display = fs ? 'none' : '';
  }
  function syncSpongeBtn() {                                                  // z9修1：按钮文案/态随 S.sponge（on=「拿掉海绵」）
    var b = document.getElementById('btn-sponge');
    if (b) { b.classList.toggle('on', S.sponge); b.textContent = S.sponge ? '拿掉海绵' : '放上海绵'; }
  }
  function setShoe(s) {
    if (s === S.shoe) return;
    S.shoe = s;
    RS.ice = s === 'ice';                                                     // z9修2：电平型 ice 随鞋态
    everPushed = false; everMoved = false; RS.release = false;                // z10修2：换鞋清前置——轮滑推车不动绝不播松手条
    if (s === 'ice') {
      S.brakeSaved = S.brake; S.brake = BRAKE_MAX;
      S.person.vx = 0; S.person.sliding = false; S.person.off = 0; S.person.baseX = S.person.x;
      if (S.sponge) { S.sponge = false; S.spongeDef = 0; RS.sponge = false; syncSpongeBtn(); }   // z9修1：穿轮滑鞋静默拿掉海绵（不播 spongeRemove）
      pulse('shoeIce');                                                       // x轮修3：c7r-12（z9修2：iceLock 已删）
      setHint('轮滑鞋：刹车锁定=最大（虚化）；推车 → 人整体向后滑离车、手脱开（相互作用+惯性）');
    } else {
      S.brake = S.brakeSaved || 0;
      pulse('shoeNormal');                                                    // x轮修3：c7r-13
      setHint('普通鞋：拖动小人顶住车 → 车受力启动');
    }
    seg('btn-shoe-normal', s === 'normal'); seg('btn-shoe-ice', s === 'ice');
    sfx('Click'); dirty = true;
  }
  function setPushDir(dir) {                                                 // P8：左推/右推——只推不拉，换边重摆人位
    if (S.pushDir === dir) return;
    S.pushDir = dir;
    S.person.x = personHome();
    S.person.vx = 0; S.person.sliding = false; S.person.off = 0; S.person.baseX = S.person.x;
    S.push.active = false; S.push.F = 0;
    seg('btn-push-left', dir === 'left'); seg('btn-push-right', dir === 'right');
    setHint(dir === 'left' ? '左推：人站车左边 → 只能往右推（不能左拉）' : '右推：人站车右边 → 只能往左推（不能右拉）');
    sfx('Click'); dirty = true;
  }
  function wire() {
    function on(id, ev, fn) { var el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }
    ['pointerdown', 'keydown', 'wheel'].forEach(function (e) { window.addEventListener(e, markUser, true); });   // z13修3：任何用户动作归零 idle 计时
    on('btn-shoe-normal', 'click', function () { setShoe('normal'); });
    on('btn-shoe-ice', 'click', function () { setShoe('ice'); });
    on('btn-push-left', 'click', function () { setPushDir('left'); });
    on('btn-push-right', 'click', function () { setPushDir('right'); });
    on('btn-sponge', 'click', function () {                                   // z9修1：海绵 toggle——脉冲 spongeAdd/spongeRemove + 电平 RS.sponge
      S.sponge = !S.sponge;
      RS.sponge = S.sponge;
      if (!S.sponge) S.spongeDef = 0;
      pulse(S.sponge ? 'spongeAdd' : 'spongeRemove');
      syncSpongeBtn();
      sfx('Click'); dirty = true;
    });
    on('btn-wheel', 'click', function () { if (S.wheelZoom) closeWheel(); else openWheel(); });
    on('btn-diagram', 'click', function () {
      S.diagram = !S.diagram;
      RS.diagram = S.diagram;                                                 // z7轮修2：电平型 flag 随开关 true/false（c7r-18/c7r-19 触发源）
      if (S.diagram) RS.hasDiagramOn = true;                                  // z13修2：示意图开过完成度（粘性，关不掉）
      if (window.ForceOverlay) ForceOverlay.setOn(S.diagram);
      var b = document.getElementById('btn-diagram'); if (b) b.classList.toggle('on', S.diagram);
      setHint(S.diagram ? '力的示意图：开 — 仅当前活跃交互/事件画矢量（1cm=50N）' : '力的示意图：关 — 全场景不画矢量');
      sfx('Click'); dirty = true;
    });
    on('btn-reset', 'click', function () {
      resetCar(); setHint('已重置：拖动小人顶住车 → 车启动'); sfx('Click');
      if (window.GUIDE_RESET) window.GUIDE_RESET.all();                        // x轮修3：接口契约3——页面重置后语音字幕全部从头
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
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.wheelZoom) closeWheel(); });

    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (e) { cv.addEventListener(e, onUp); });
    window.addEventListener('resize', resize);
  }

  /* ===== init ===== */
  wire();
  if (window.ForceOverlay) { ForceOverlay.setOn(false); ForceOverlay.setLegendN(DISP); }   // x轮修1：路页标尺 '1cm = 50N'（bench 缺省 1N 不受影响）
  syncFullBtn();
  syncSpongeBtn();                                                            // z9修1：初始文案=「放上海绵」（S.sponge 缺省 false）
  seg('btn-shoe-normal', true);
  seg('btn-push-left', true);
  resize();
  requestAnimationFrame(tick);
  if (/[?&]debug=1/.test((typeof location !== 'undefined' && location.search) || '')) {
    window.__exp = { S: S, L: L, step: step, groundY: groundY, layout: layout, terrainPose: terrainPose, get W() { return W; }, get H() { return H; } };
  }
})();

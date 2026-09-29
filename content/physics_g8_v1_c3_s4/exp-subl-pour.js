/* exp-subl-pour.js — 碘演示双水杯浇淋交互 [r9 particle water PBF + runaway guard + stream density] */
/* eslint-env browser */
(function () {
'use strict';

const CUP_R = 1.5, CUP_H = 3.6, CUP_WATER_H = 2.4;
const HOT_HOME = new THREE.Vector3(-6.5, -7, 2.2);
const COLD_HOME = new THREE.Vector3(6.5, -7, 2.2);
const TABLE_TOP_Y = -7, CONTAINER_R = 3.4, RIM_Y = 0.5;
const LID_Y = RIM_Y + 0.05;
const POUR_POS_HOT = new THREE.Vector3(2.8, RIM_Y + 5.1, 1.2);
const POUR_POS_COLD = new THREE.Vector3(-3.0, RIM_Y + 5.0, 1.1);
function pourPosFor(type) { return type === 'cold' ? POUR_POS_COLD : POUR_POS_HOT; }
const LIFT_DUR = 0.7, POUR_DUR = 2.2, RETURN_DUR = 0.7, FADE_DUR = 1.5;

const HOT_WATER_COLOR = 0xffe9c0;
const COLD_WATER_COLOR = 0xbfe3ff;

const POUR = {
  ready: false, isDragging: false, animating: false,
  animType: null, animT: 0, animPhase: 'idle',
  animFrom: new THREE.Vector3(), animStartQ: new THREE.Quaternion(), animTargetQ: new THREE.Quaternion(),
  draggedCup: null, hoverCup: null,
  dragOffset: new THREE.Vector3(), dragPlane: new THREE.Plane(),
  hotTemp: 80, cups: {},
  steamMesh: null, steamData: [],
  wallStreams: null, lidFilm: null, lidSplash: null, puddle: null,
  streamActive: false, streamT: 0, wallStreamT: 0,
  pourProg: 0, fadeAll: 1,
  cupTiltDeg: 0, cupOffset: 0, mouthDot: 0,
  // particle fluid
  waterParticles: {}, waterBody: {}, streamParticles: null,
  waterCount: 0, streamCount: 0,
  surfaceFlat: 0, maxLocalR: 0, minLocalY: 0, surface95: 0,
  restWaterHeight: 0, volumeMid: 0, tiltAsym: 0, surfaceWorldFlat: 0,
  physicsMs: 0, _physicsTimes: [],
  runawayCount: 0, _runawayAcc: 0, _runawayWin: 0,
  streamSteady: 0, _streamSteadyAcc: 0, _streamSteadyN: 0,
  spillPhysics: false, spillAngle: 0,
  streamHitLid: 0, hitLidRadius: 0, _hitRSum: 0, _hitRCount: 0,
  fpsSample: 0, _frameTimes: [], _lastFrame: performance.now(),
  _spillTriggered: false,
  _puddleOn: false, _puddleSnapped: false, _tableHit: null,
  emptyAfterPour: 0, resetRefills: 0, _emptyTooltipTimer: null
};

const W_MAX = 3000;             // upper bound per cup
const W_TARGET = 2600;          // >= 2500
const STREAM_MAX = 900;         // >= 800（R11 连续水柱模式下仅保留常量，streamCount 报等效值）
const STREAM_EQUIV = 560;       // 连续水柱的等效活跃粒子数（钩子语义允许变，字段保留）
const GRAVITY = new THREE.Vector3(0, -9.8, 0);
const DT_SUB = 1 / 120;         // fixed physics substep

// PBF direct-grid constants
const H = 0.24;                 // ~spacing * 1.0
const H2 = H * H;
const STIFFNESS = 0.36;
const PBF_ITER = 1;
const PBF_DAMPING = 0.985;
const MAX_VEL = 6.0;
const MAX_DISP = 0.5;         // single-substep displacement clamp (anti-explosion)

const GRID_X0 = -1.6, GRID_Y0 = -0.1, GRID_Z0 = -1.6;
const GRID_GX = 14, GRID_GY = 18, GRID_GZ = 14;
const GRID_CELLS = GRID_GX * GRID_GY * GRID_GZ;

const pourPointer = new THREE.Vector2();
let lastHoverRaycast = 0, hoverPending = false;
let lastX = 0, lastY = 0;

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();

function $(id) { return document.getElementById(id); }
function seeded(i) { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }
function waterColor(type) { return type === 'hot' ? HOT_WATER_COLOR : COLD_WATER_COLOR; }

function init() {
  if (POUR.ready) return;
  if (!scene || !camera || !renderer) return;
  buildCups(); buildSteam(); buildWaterParticles(); buildWaterBody(); buildStreamParticles(); buildLidEffects(); buildWallStreams(); buildPuddle();
  bindPointer();
  POUR.ready = true;
  setMode(state && state.mode || 'iodine');
}

function setMode(mode) {
  const vis = mode === 'iodine';
  Object.values(POUR.cups).forEach(function (g) { if (g) g.visible = vis; });
  if (!vis) hideTooltip();
  // R12: 粒子仅跑物理，视觉恒隐藏（水体由 waterBody 承担，随杯显隐）
  if (POUR.streamParticles) POUR.streamParticles.mesh.visible = false;
  if (POUR.lidFilm) POUR.lidFilm.visible = false;
  if (POUR.lidSplash) POUR.lidSplash.visible = false;
  if (POUR.wallStreams) POUR.wallStreams.visible = false;
  if (POUR.puddle) POUR.puddle.visible = false;
}

function buildCups() {
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaccff, transparent: true, opacity: 0.22,
    roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false
  });
  const rimMat = new THREE.MeshBasicMaterial({ color: 0x88aaff, depthWrite: false });
  const bottomMat = new THREE.MeshPhysicalMaterial({
    color: 0xdceaff, transparent: true, opacity: 0.35,
    roughness: 0.08, metalness: 0.05, side: THREE.DoubleSide, depthWrite: false
  });
  const bottomRingMat = new THREE.MeshBasicMaterial({ color: 0xbfd4ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false });
  [['hot', HOT_HOME], ['cold', COLD_HOME]].forEach(function (cfg) {
    const type = cfg[0], home = cfg[1];
    const group = new THREE.Group();
    group.position.copy(home);
    group.userData = { type: type, home: home.clone() };
    scene.add(group);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(CUP_R, CUP_R, CUP_H, 32, 1, true), glassMat);
    wall.position.y = CUP_H / 2; wall.renderOrder = 10; group.add(wall);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(CUP_R, 0.05, 8, 40), rimMat);
    rim.rotation.x = Math.PI / 2; rim.position.y = CUP_H; rim.renderOrder = 10; group.add(rim);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(CUP_R, 32), bottomMat);
    bottom.rotation.x = -Math.PI / 2; bottom.renderOrder = 10; group.add(bottom);
    const bottomRing = new THREE.Mesh(new THREE.RingGeometry(CUP_R - 0.06, CUP_R, 48), bottomRingMat);
    bottomRing.rotation.x = -Math.PI / 2; bottomRing.position.y = 0.01; bottomRing.renderOrder = 11; group.add(bottomRing);
    const shadow = makeContactShadow(CUP_R * 1.25);
    shadow.position.y = 0.005; group.add(shadow);
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(CUP_R + 0.25, CUP_R + 0.25, CUP_H, 24, 1, true),
      new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = CUP_H / 2; hit.userData.pourCup = group; group.add(hit);
    wall.userData.pourCup = group; rim.userData.pourCup = group;
    POUR.cups[type] = group;
  });
  const containerShadow = makeContactShadow(CONTAINER_R * 1.25);
  containerShadow.position.set(0, TABLE_TOP_Y + 0.005, 0);
  scene.add(containerShadow);
}

function makeParticleTexture() {
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
  const cx = cv.getContext('2d');
  const g = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  cx.fillStyle = g; cx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace || '';
  return tex;
}

function makeContactShadowTexture() {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128;
  const cx = cv.getContext('2d');
  const g = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.25)');
  g.addColorStop(0.6, 'rgba(0,0,0,0.12)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  cx.fillStyle = g; cx.fillRect(0, 0, 128, 128);
  const tex2 = new THREE.CanvasTexture(cv);
  tex2.colorSpace = THREE.SRGBColorSpace || '';
  return tex2;
}

// 贴地接触阴影圆盘（contactShadow）：随杯子水平移动，软化杯体与桌面的融合
function makeContactShadow(radius) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2, radius * 2),
    new THREE.MeshBasicMaterial({ map: makeContactShadowTexture(), transparent: true, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 9;
  return mesh;
}

function buildWaterParticles() {
  const tex = makeParticleTexture();
  Object.keys(POUR.cups).forEach(function (type) {
    const mat = new THREE.PointsMaterial({
      color: waterColor(type), size: 0.26, map: tex, transparent: true, opacity: 0.82,
      depthWrite: false, depthTest: false, sizeAttenuation: true, blending: THREE.NormalBlending
    });
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(W_MAX * 3);
    const vel = new Float32Array(W_MAX * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mesh = new THREE.Points(geo, mat);
    mesh.frustumCulled = false; mesh.renderOrder = 12;
    mesh.raycast = function () {};
    mesh.visible = false; // R12: 粒子仅跑物理，视觉由 waterBody mesh 承担
    POUR.cups[type].add(mesh);
    POUR.waterParticles[type] = { mesh: mesh, pos: pos, vel: vel, active: W_TARGET, color: waterColor(type) };
    resetWater(type);
  });
}

function resetWater(type) {
  const p = POUR.waterParticles[type];
  if (!p) return;
  p.active = W_TARGET;
  // Hexagonal-close packed-ish initial layout inside cylinder radius, height CUP_WATER_H
  const area = Math.PI * (CUP_R - 0.25) * (CUP_R - 0.25);
  const h = CUP_WATER_H - 0.1;
  const volume = area * h;
  const spacing = Math.pow(volume / W_TARGET, 1 / 3);
  let i = 0;
  for (let y = 0.12; y < h && i < W_MAX; y += spacing * 0.92) {
    const ringR = Math.min(CUP_R - 0.18, Math.sqrt((CUP_R - 0.18) * (CUP_R - 0.18) * (1 - Math.pow((y - h / 2) / (h / 2 + 0.01), 2) * 0.02)));
    const ringN = Math.max(1, Math.floor((2 * Math.PI * ringR) / spacing));
    for (let k = 0; k < ringN && i < W_MAX; k++) {
      const a = (k / ringN) * Math.PI * 2 + (y * 1.3);
      const r = ringR * Math.sqrt((k % 7 + 1) / 8);
      p.pos[i * 3] = r * Math.cos(a);
      p.pos[i * 3 + 1] = y;
      p.pos[i * 3 + 2] = r * Math.sin(a);
      p.vel[i * 3] = 0; p.vel[i * 3 + 1] = 0; p.vel[i * 3 + 2] = 0;
      i++;
    }
  }
  // fill any remaining slots up to W_TARGET with random cylinder samples
  while (i < W_TARGET && i < W_MAX) {
    const a = seeded(i * 9 + 3) * Math.PI * 2;
    const r = (CUP_R - 0.2) * Math.sqrt(seeded(i * 9 + 4));
    p.pos[i * 3] = r * Math.cos(a);
    p.pos[i * 3 + 1] = 0.12 + seeded(i * 9 + 5) * h;
    p.pos[i * 3 + 2] = r * Math.sin(a);
    p.vel[i * 3] = 0; p.vel[i * 3 + 1] = 0; p.vel[i * 3 + 2] = 0;
    i++;
  }
  p.active = i;
  p.mesh.geometry.attributes.position.needsUpdate = true;
  p.mesh.geometry.setDrawRange(0, p.active);
  const wb = POUR.waterBody[type];
  if (wb) wb.h = CUP_WATER_H; // R12: refill 时水面回满
}

// R12：杯内水体 mesh 化 —— 圆柱体代替粒子点（连续水柱视觉），水面圆盘随时世界水平
const WATER_BODY_R = CUP_R - 0.08; // 稍小于杯壁半径防 z-fighting
const _qSurfBase = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
const _wbQ = new THREE.Quaternion();

function buildWaterBody() {
  Object.keys(POUR.cups).forEach(function (type) {
    const cup = POUR.cups[type];
    const colorHex = waterColor(type);
    const group = new THREE.Group();
    const cylMat = new THREE.MeshStandardMaterial({
      color: colorHex, transparent: true, opacity: 0.78,
      roughness: 0.16, metalness: 0.05, depthWrite: false, side: THREE.DoubleSide
    });
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(WATER_BODY_R, WATER_BODY_R, CUP_WATER_H, 40, 1, true), cylMat);
    cyl.position.y = CUP_WATER_H / 2; cyl.renderOrder = 11; cyl.raycast = function () {};
    group.add(cyl);
    const surfMat = new THREE.MeshStandardMaterial({
      color: colorHex, transparent: true, opacity: 0.88,
      roughness: 0.08, metalness: 0.05, depthWrite: false, side: THREE.DoubleSide
    });
    const surface = new THREE.Mesh(new THREE.CircleGeometry(WATER_BODY_R, 48), surfMat);
    surface.position.y = CUP_WATER_H; surface.renderOrder = 11; surface.raycast = function () {};
    surface.quaternion.copy(_qSurfBase);
    group.add(surface);
    cup.add(group);
    POUR.waterBody[type] = { group: group, cyl: cyl, surface: surface, h: CUP_WATER_H };
  });
}

// 每帧：水位由粒子 active 统计驱动并平滑 lerp；水面圆盘用杯 quaternion 逆补偿保持世界水平
function updateWaterBody(dt) {
  const k = Math.min(1, (dt || 0.016) * 8); // 平滑收敛系数（连续无跳变）
  Object.keys(POUR.cups).forEach(function (type) {
    const wb = POUR.waterBody[type];
    const p = POUR.waterParticles[type];
    if (!wb || !p) return;
    const cup = POUR.cups[type];
    const hTarget = p.active > 0 ? (p.active / W_TARGET) * CUP_WATER_H : 0;
    wb.h += (hTarget - wb.h) * k;
    const active = p.active > 0;
    wb.cyl.visible = active && wb.h > 0.05;
    wb.surface.visible = active && wb.h > 0.12;
    wb.cyl.position.y = wb.h / 2;
    wb.cyl.scale.y = Math.max(0.001, wb.h / CUP_WATER_H);
    wb.surface.position.y = wb.h;
    // 水位近似见底时水面盘淡化，避免残留小瘦点
    const fade = Math.min(1, wb.h / 0.3);
    wb.cyl.material.opacity = 0.78 * fade;
    wb.surface.material.opacity = 0.88 * fade;
    if (active) {
      // 世界水平补偿：surface 为杯组子节点，最终朝向 = 杯世界朝向 * 补偿逆四元数 => 水平
      _wbQ.copy(cup.quaternion).invert().multiply(_qSurfBase);
      wb.surface.quaternion.copy(_wbQ);
    }
  });
}
// R11 视觉：连续水柱条带 mesh（自建条带，沿贝塞尔采样 SEG 段，逐帧更新 position attribute）
const STREAM_SEG = 24;                    // 采样段数
const STREAM_RADIAL = 10;                 // 每段圆周顶点数
const STREAM_R0 = 0.34;                   // 杯口半径（流量守恒 r(t)=r0/(1+k·t)）
const STREAM_RK = 1.6;                    // 变细系数（下落越快越细）

function buildStreamParticles() {
  // 条带几何：(SEG+1) 环 × RADIAL 顶点，三角形索引固定，顶点每帧重写
  const verts = (STREAM_SEG + 1) * STREAM_RADIAL;
  const pos = new Float32Array(verts * 3);
  const nrm = new Float32Array(verts * 3);
  const idx = [];
  for (let s = 0; s < STREAM_SEG; s++) {
    for (let r = 0; r < STREAM_RADIAL; r++) {
      const r2 = (r + 1) % STREAM_RADIAL;
      const a = s * STREAM_RADIAL + r, b = s * STREAM_RADIAL + r2;
      const c = (s + 1) * STREAM_RADIAL + r, d = (s + 1) * STREAM_RADIAL + r2;
      idx.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  geo.setIndex(idx);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff, transparent: true, opacity: 0.55,
    roughness: 0.12, metalness: 0.05, depthWrite: false, side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false; mesh.renderOrder = 14;
  mesh.visible = false;
  scene.add(mesh);
  // 保留 streamParticles 字段名（钩子/引用兼容），mesh 改为条带；发射用粒子数组退役
  POUR.streamParticles = {
    mesh: mesh, pos: pos, vel: null, life: null, hitDone: null, next: 0
  };
}

const _sp = new THREE.Vector3(), _sc = new THREE.Vector3(), _se = new THREE.Vector3();
const _stan = new THREE.Vector3(), _sp1 = new THREE.Vector3(), _sp2 = new THREE.Vector3();
const _sref = new THREE.Vector3(0, 1, 0);

function streamPoint(start, ctrl, end, t, out) {
  const u = 1 - t;
  return out.set(
    u * u * start.x + 2 * u * t * ctrl.x + t * t * end.x,
    u * u * start.y + 2 * u * t * ctrl.y + t * t * end.y,
    u * u * start.z + 2 * u * t * ctrl.z + t * t * end.z
  );
}

// 逐帧重建条带顶点：沿二次贝塞尔采样 STREAM_SEG 段，半径按流量守恒 r(t)=r0/(1+k·t) 上粗下细，叠加轻微正弦颤动
function rebuildStreamRibbon(s, start, ctrl, end, time) {
  const pos = s.mesh.geometry.attributes.position.array;
  const nrm = s.mesh.geometry.attributes.normal.array;
  for (let seg = 0; seg <= STREAM_SEG; seg++) {
    const t = seg / STREAM_SEG;
    streamPoint(start, ctrl, end, t, _sp);
    const tA = Math.max(0, t - 0.02), tB = Math.min(1, t + 0.02);
    streamPoint(start, ctrl, end, tA, _sc).subVectors(
      streamPoint(start, ctrl, end, tB, _se), _sc
    );
    _stan.copy(_sc).normalize();
    _sp1.crossVectors(_stan, _sref);
    if (_sp1.lengthSq() < 1e-6) _sp1.set(1, 0, 0);
    _sp1.normalize();
    _sp2.crossVectors(_stan, _sp1).normalize();
    // 轻微正弦摆动（时间相位让水柱微微颤动，振幅沿程渐大）
    const wob = 0.045 * (0.3 + t);
    _sp.addScaledVector(_sp1, Math.sin(time * 7.3 + t * 9.1) * wob);
    _sp.addScaledVector(_sp2, Math.cos(time * 6.1 + t * 11.3) * wob * 0.8);
    const radius = STREAM_R0 / (1 + STREAM_RK * t);
    for (let r = 0; r < STREAM_RADIAL; r++) {
      const a = (r / STREAM_RADIAL) * Math.PI * 2;
      const ca = Math.cos(a), sa = Math.sin(a);
      const vi = (seg * STREAM_RADIAL + r) * 3;
      pos[vi] = _sp.x + (_sp1.x * ca + _sp2.x * sa) * radius;
      pos[vi + 1] = _sp.y + (_sp1.y * ca + _sp2.y * sa) * radius;
      pos[vi + 2] = _sp.z + (_sp1.z * ca + _sp2.z * sa) * radius;
      nrm[vi] = _sp1.x * ca + _sp2.x * sa;
      nrm[vi + 1] = _sp1.y * ca + _sp2.y * sa;
      nrm[vi + 2] = _sp1.z * ca + _sp2.z * sa;
    }
  }
  s.mesh.geometry.attributes.position.needsUpdate = true;
  s.mesh.geometry.attributes.normal.needsUpdate = true;
}

function buildSteam() {
  const geo = new THREE.SphereGeometry(0.12, 6, 6);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.30, depthWrite: false });
  POUR.steamMesh = new THREE.InstancedMesh(geo, mat, 28);
  POUR.steamMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); POUR.steamMesh.renderOrder = 15;
  for (let i = 0; i < 28; i++) {
    POUR.steamData.push({ angle: (i / 28) * Math.PI * 2 + seeded(i * 11) * 0.5, r: 0.12 + seeded(i * 11 + 1) * 0.14, y: seeded(i * 11 + 2) * 1.8, speed: 0.7 + seeded(i * 11 + 3) * 0.9, sway: seeded(i * 11 + 4) * Math.PI * 2, sz: 0.5 + 0.5 * seeded(i * 11 + 5), drift: 0.7 + seeded(i * 11 + 6) * 1.2 });
  }
  scene.add(POUR.steamMesh);
}

function buildLidEffects() {
  POUR.lidFilm = new THREE.Group();
  POUR.lidFilm.position.set(0, RIM_Y + 0.03, 0);
  POUR.lidFilm.visible = false;
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1, 48),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.userData.baseOpacity = 0.5;
  disc.renderOrder = 15;
  POUR.lidFilm.add(disc);
  const tex = makeParticleTexture();
  const streakGeo = new THREE.PlaneGeometry(0.32, 1);
  streakGeo.translate(0, 0.5, 0);
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(streakGeo, new THREE.MeshBasicMaterial({
      color: 0xffffff, map: tex, transparent: true, opacity: 0.4,
      depthWrite: false, side: THREE.DoubleSide
    }));
    m.rotation.x = -Math.PI / 2;
    m.rotation.y = (i / 10) * Math.PI * 2 + seeded(i * 9) * 0.25;
    m.userData.baseOpacity = 0.4;
    m.renderOrder = 15;
    POUR.lidFilm.add(m);
  }
  scene.add(POUR.lidFilm);

  POUR.lidSplash = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.06, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide })
  );
  POUR.lidSplash.rotation.x = Math.PI / 2;
  POUR.lidSplash.position.set(0, RIM_Y + 0.08, 0);
  POUR.lidSplash.visible = false;
  POUR.lidSplash.renderOrder = 15;
  scene.add(POUR.lidSplash);
}

function buildWallStreams() {
  POUR.wallStreams = new THREE.Group();
  POUR.wallStreams.position.set(0, RIM_Y, 0);
  for (let i = 0; i < 8; i++) {
    const thetaLen = 0.25 + seeded(i * 8) * 0.35;
    const thetaStart = seeded(i * 11) * Math.PI * 2;
    const geo = new THREE.CylinderGeometry(CONTAINER_R + 0.05, CONTAINER_R + 0.05, 1, 14, 1, true, thetaStart, thetaLen);
    geo.translate(0, -0.5, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.5,
      depthWrite: false, side: THREE.DoubleSide
    }));
    m.userData = { baseOpacity: 0.5, onset: seeded(i * 7) * 0.35, arc: thetaLen * (CONTAINER_R + 0.05) };
    m.renderOrder = 15;
    POUR.wallStreams.add(m);
  }
  POUR.wallStreams.visible = false;
  scene.add(POUR.wallStreams);
}

function buildPuddle() {
  const geo = new THREE.CircleGeometry(1, 48);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide
  });
  POUR.puddle = new THREE.Mesh(geo, mat);
  POUR.puddle.rotation.x = -Math.PI / 2;
  POUR.puddle.position.set(0, TABLE_TOP_Y + 0.02, 0);
  POUR.puddle.visible = false;
  POUR.puddle.renderOrder = 14;
  POUR.puddle.userData.baseOpacity = 0.45;
  scene.add(POUR.puddle);
}

function bindPointer() {
  renderer.domElement.addEventListener('pointerdown', onPointerDown, true);
  renderer.domElement.addEventListener('pointermove', onPointerMove, true);
  renderer.domElement.addEventListener('pointerup', onPointerUp, true);
  renderer.domElement.addEventListener('pointerleave', hideTooltip, true);
}

function updatePointer(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pourPointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pourPointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function onPointerDown(e) {
  if (POUR.animating || !state || state.mode !== 'iodine' || e.button !== 0) return;
  updatePointer(e);
  raycaster.setFromCamera(pourPointer, camera);
  const hits = raycaster.intersectObjects([POUR.cups.hot, POUR.cups.cold], true);
  if (!hits.length) return;
  const cup = hits[0].object.userData.pourCup;
  if (!cup) return;
  e.stopPropagation(); e.preventDefault();
  if (typeof ensureFirstAudio === 'function') ensureFirstAudio();
  try { renderer.domElement.setPointerCapture(e.pointerId); } catch (_) {}
  startDrag(cup, hits[0].point);
}

function startDrag(cup, point) {
  POUR.isDragging = true; POUR.draggedCup = cup; POUR.hoverCup = null; hideTooltip();
  POUR.dragOffset.copy(point).sub(cup.position);
  const n = camera.getWorldDirection(new THREE.Vector3());
  POUR.dragPlane.setFromNormalAndCoplanarPoint(n, point);
}

function onPointerMove(e) {
  if (POUR.isDragging && POUR.draggedCup) {
    updatePointer(e);
    raycaster.setFromCamera(pourPointer, camera);
    const target = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(POUR.dragPlane, target)) {
      const p = target.sub(POUR.dragOffset);
      p.y = Math.max(p.y, TABLE_TOP_Y);
      POUR.draggedCup.position.copy(p);
      POUR.draggedCup.rotation.set(0, 0, 0);
    }
    return;
  }
  if (POUR.animating) { hideTooltip(); return; }
  doHoverRaycast(e);
}

function doHoverRaycast(e) {
  if (!state || state.mode !== 'iodine') return;
  lastX = e.clientX; lastY = e.clientY;
  const now = performance.now();
  if (now - lastHoverRaycast < 70) {
    if (!hoverPending) { hoverPending = true; requestAnimationFrame(function () { hoverPending = false; raycastHoverNow(e); }); }
    return;
  }
  raycastHoverNow(e);
}

function raycastHoverNow(e) {
  lastHoverRaycast = performance.now();
  updatePointer(e);
  raycaster.setFromCamera(pourPointer, camera);
  const hits = raycaster.intersectObjects([POUR.cups.hot, POUR.cups.cold], true);
  if (hits.length) {
    const cup = hits[0].object.userData.pourCup;
    if (cup) { POUR.hoverCup = cup; updateTooltip(e.clientX, e.clientY); return; }
  }
  POUR.hoverCup = null; hideTooltip();
}

function onPointerUp(e) {
  if (!POUR.isDragging || !POUR.draggedCup) return;
  const cup = POUR.draggedCup;
  const over = isOverContainer(cup.position);
  stopDrag();
  if (over) startPourFrom(cup.userData.type, cup.position);
  else returnCupHome(cup);
}

function isOverContainer(pos) {
  return Math.hypot(pos.x, pos.z) < CONTAINER_R + 0.9 && pos.y > TABLE_TOP_Y + 0.5;
}

function stopDrag() {
  POUR.isDragging = false;
  try { renderer.domElement.releasePointerCapture && renderer.domElement.releasePointerCapture(0); } catch (_) {}
  POUR.draggedCup = null;
}

function returnCupHome(cup) {
  cup.position.copy(cup.userData.home);
  cup.rotation.set(0, 0, 0);
  cup.quaternion.set(0, 0, 0, 1);
}

function computePourQ(pos) {
  const lidCenter = new THREE.Vector3(0, RIM_Y, 0);
  const dir = lidCenter.sub(pos).normalize();
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
}

function deepTiltQuat(home, angle) {
  const up = new THREE.Vector3(0, 1, 0);
  const h = new THREE.Vector3(0, RIM_Y, 0).sub(home);
  h.y = 0; h.normalize();
  const axis = new THREE.Vector3().crossVectors(up, h).normalize();
  return new THREE.Quaternion().setFromAxisAngle(axis, angle);
}

function playPour(type) {
  if (POUR.animating || !POUR.ready || !POUR.cups[type]) return;
  if (pourEmpty(type)) { showEmptyTooltip(type); return; }
  POUR.animating = true; POUR.animType = type; POUR.animT = 0; POUR.animPhase = 'lift';
  const cup = POUR.cups[type];
  returnCupHome(cup);
  POUR.animFrom = cup.userData.home.clone();
  POUR.animStartQ = new THREE.Quaternion().setFromEuler(cup.rotation);
  POUR.animPos = pourPosFor(type).clone();
  POUR.animTargetQ = computePourQ(POUR.animPos);
  POUR.pourProg = 0; POUR.fadeAll = 1;
  POUR._spillTriggered = false;
  POUR._puddleOn = false; POUR._puddleSnapped = false; POUR._tableHit = null;
  setButtonsDisabled(true);
  if (typeof ensureFirstAudio === 'function') ensureFirstAudio();
  if (typeof playPourWater === 'function') playPourWater(POUR_DUR);
}

function startPourFrom(type, fromPos) {
  if (POUR.animating || !POUR.ready) return;
  if (pourEmpty(type)) { showEmptyTooltip(type); return; }
  POUR.animating = true; POUR.animType = type; POUR.animT = 0; POUR.animPhase = 'lift';
  const cup = POUR.cups[type];
  returnCupHome(cup);
  cup.position.copy(fromPos);
  POUR.animFrom = fromPos.clone();
  POUR.animStartQ = new THREE.Quaternion().setFromEuler(cup.rotation);
  POUR.animPos = pourPosFor(type).clone();
  POUR.animTargetQ = computePourQ(POUR.animPos);
  POUR.pourProg = 0; POUR.fadeAll = 1;
  POUR._spillTriggered = false;
  POUR._puddleOn = false; POUR._puddleSnapped = false; POUR._tableHit = null;
  setButtonsDisabled(true);
  if (typeof ensureFirstAudio === 'function') ensureFirstAudio();
  if (typeof playPourWater === 'function') playPourWater(POUR_DUR);
}

function setButtonsDisabled(disabled) {
  ['btn-hot', 'btn-cold'].forEach(function (id) { const b = $(id); if (b) b.disabled = disabled; });
}

function updatePourProg() {
  if (!POUR.animating) { POUR.pourProg = 0; return; }
  const total = LIFT_DUR + POUR_DUR;
  if (POUR.animPhase === 'lift') {
    POUR.pourProg = THREE.MathUtils.clamp(POUR.animT / total, 0, 1);
  } else if (POUR.animPhase === 'pour') {
    POUR.pourProg = THREE.MathUtils.clamp((LIFT_DUR + POUR.animT) / total, 0, 1);
  } else if (POUR.animPhase === 'return') {
    const e = easeInOutQuad(THREE.MathUtils.clamp(POUR.animT / RETURN_DUR, 0, 1));
    POUR.pourProg = 1 - e;
  } else {
    POUR.pourProg = 0;
  }
}

function animatePour(dt) {
  if (!POUR.animating) return;
  POUR.animT += dt;
  const cup = POUR.cups[POUR.animType];
  const home = cup.userData.home;
  updatePourProg();
  if (POUR.animPhase === 'lift') {
    const t = Math.min(1, POUR.animT / LIFT_DUR);
    const e = easeInOutQuad(t);
    cup.position.lerpVectors(POUR.animFrom, POUR.animPos, e);
    cup.quaternion.copy(POUR.animStartQ).slerp(POUR.animTargetQ, e);
    if (t >= 1) { POUR.animPhase = 'pour'; POUR.animT = 0; }
  } else if (POUR.animPhase === 'pour') {
    cup.position.copy(POUR.animPos);
    const t = Math.min(1, POUR.animT / POUR_DUR);
    cup.quaternion.copy(POUR.animTargetQ).premultiply(deepTiltQuat(home, 1.15 * easeInOutQuad(t)));
    if (POUR.animT >= POUR_DUR) { POUR.streamActive = false; POUR.animPhase = 'return'; POUR.animT = 0; }
  } else if (POUR.animPhase === 'return') {
    const t = Math.min(1, POUR.animT / RETURN_DUR);
    const e = easeInOutQuad(t);
    cup.position.lerpVectors(POUR.animPos, home, e);
    cup.quaternion.copy(POUR.animTargetQ).slerp(POUR.animStartQ, e);
    if (t >= 1) { POUR.animPhase = 'fade'; POUR.animT = 0; }
  } else if (POUR.animPhase === 'fade') {
    const t = Math.min(1, POUR.animT / FADE_DUR);
    POUR.fadeAll = 1 - easeOutQuad(t);
    if (t >= 1) finishPour();
  }
}

function finishPour() {
  const pouredType = POUR.animType;
  POUR.animating = false; POUR.animPhase = 'idle'; POUR.animType = null;
  POUR.streamActive = false; POUR.streamT = 0; POUR.wallStreamT = 0;
  POUR.pourProg = 0; POUR.fadeAll = 1;
  POUR._spillTriggered = false;
  POUR._puddleOn = false; POUR._puddleSnapped = false; POUR._tableHit = null;
  setButtonsDisabled(false);
  if (POUR.streamParticles) POUR.streamParticles.mesh.visible = false;
  if (POUR.lidFilm) POUR.lidFilm.visible = false;
  if (POUR.lidSplash) POUR.lidSplash.visible = false;
  if (POUR.wallStreams) POUR.wallStreams.visible = false;
  if (POUR.puddle) POUR.puddle.visible = false;
  // emptyAfterPour hook: particles that remain after pour + return home
  POUR.emptyAfterPour = (pouredType && POUR.waterParticles[pouredType]) ? POUR.waterParticles[pouredType].active : 0;
}

function pourEmpty(type) {
  const p = POUR.waterParticles[type];
  return !!(p && p.active <= 0);
}

function showEmptyTooltip(type) {
  const el = $('pour-tooltip');
  if (!el) return;
  POUR.hoverCup = null;
  el.textContent = '杯子空了，点重置恢复';
  const cup = POUR.cups[type];
  if (cup && camera && renderer) {
    const v = new THREE.Vector3(0, CUP_H * 0.5, 0).applyMatrix4(cup.matrixWorld).project(camera);
    const rect = renderer.domElement.getBoundingClientRect();
    const x = rect.left + (v.x * 0.5 + 0.5) * rect.width;
    const y = rect.top + (-v.y * 0.5 + 0.5) * rect.height;
    el.style.left = Math.min(window.innerWidth - 110, x + 14) + 'px';
    el.style.top = Math.max(10, y - 30) + 'px';
  }
  el.classList.add('show');
  clearTimeout(POUR._emptyTooltipTimer);
  POUR._emptyTooltipTimer = setTimeout(hideTooltip, 1500);
}

function updateSteam(dt) {
  if (!POUR.steamMesh || !POUR.cups.hot) return;
  const cup = POUR.cups.hot;
  const base = new THREE.Vector3(); cup.getWorldPosition(base); base.y += CUP_H;
  const dummy = new THREE.Object3D();
  const span = 2.2;
  for (let i = 0; i < POUR.steamMesh.count; i++) {
    const p = POUR.steamData[i];
    p.y += p.speed * dt;
    if (p.y > span) { p.y = 0; p.angle += 0.8 + seeded(i * 13) * 1.4; }
    const prog = p.y / span;
    const rad = 0.18 + prog * (1.3 + p.drift) + Math.sin(p.y * 2 + p.sway) * 0.10 * prog;
    const s = (0.55 + 0.9 * prog) * p.sz;
    dummy.position.set(base.x + rad * Math.cos(p.angle), base.y + p.y, base.z + rad * Math.sin(p.angle));
    dummy.scale.setScalar(Math.max(0.001, s));
    dummy.updateMatrix(); POUR.steamMesh.setMatrixAt(i, dummy.matrix);
  }
  POUR.steamMesh.instanceMatrix.needsUpdate = true;
}

function getRimLowest(cup) {
  cup.updateMatrixWorld();
  const rimCenterLocal = new THREE.Vector3(0, CUP_H, 0);
  const rimCenter = rimCenterLocal.applyMatrix4(cup.matrixWorld);
  const up = _v.set(0, 1, 0).applyQuaternion(cup.quaternion).normalize();
  const worldDown = new THREE.Vector3(0, -1, 0);
  const dot = worldDown.dot(up);
  let perp;
  if (Math.abs(dot) > 0.99995) {
    perp = new THREE.Vector3(1, 0, 0);
  } else {
    perp = worldDown.clone().sub(up.clone().multiplyScalar(dot)).normalize();
  }
  return rimCenter.add(perp.multiplyScalar(CUP_R));
}

function getRimTangent(cup) {
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cup.quaternion).normalize();
  const worldDown = new THREE.Vector3(0, -1, 0);
  const dot = worldDown.dot(up);
  let perp;
  if (Math.abs(dot) > 0.99995) {
    perp = new THREE.Vector3(1, 0, 0);
  } else {
    perp = worldDown.clone().sub(up.clone().multiplyScalar(dot)).normalize();
  }
  // tangent is perpendicular to up and perp, roughly along the rim opening direction
  return up.clone().cross(perp).normalize();
}

function updateStream(dt) {
  if (!POUR.streamParticles) return;
  const s = POUR.streamParticles;
  const colorHex = waterColor(POUR.animType || 'hot');
  s.mesh.material.color.setHex(colorHex);
  s.mesh.material.opacity = 0.70 * POUR.fadeAll;
  // R11 方案B：连续水柱 mesh 替代粒子流；起点=杯口世界坐标（每帧跟随拖拽/深倾），终点=lidCenter 上方（保留矄准语义）
  let flowing = !!(POUR.streamActive && POUR.animType && POUR.fadeAll > 0.001);
  const wp = POUR.waterParticles[POUR.animType];
  if (wp && wp.active < 80) flowing = false; // throttle by cup water volume
  s.mesh.visible = flowing;
  let active = 0;
  if (flowing) {
    const cup = POUR.cups[POUR.animType];
    const start = getRimLowest(cup);
    // R12：水流自然竖直下坠 —— 方向 = 竖直向下为主 + 少量杯口倾斜切向水平分量，不再弯向盖心
    const cupPos = new THREE.Vector3(); cup.getWorldPosition(cupPos);
    let tx = start.x - cupPos.x, tz = start.z - cupPos.z;
    const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
    const dirLen = Math.sqrt(1 + 0.15 * 0.15);
    const dx = tx * 0.15 / dirLen, dy = -1 / dirLen, dz = tz * 0.15 / dirLen;
    // 落点判定：沿弹道与盖面 y=LID_Y 求交，落在罐口半径内则落盖面，否则延伸到桌面
    const tLid = dy !== 0 ? (start.y - LID_Y) / (-dy) : 0;
    const lidX = start.x + dx * tLid, lidZ = start.z + dz * tLid;
    const onLid = Math.hypot(lidX, lidZ) <= CONTAINER_R + 0.3;
    let end;
    if (onLid) {
      end = new THREE.Vector3(lidX, LID_Y + 0.04, lidZ);
    } else {
      const tTable = dy !== 0 ? (start.y - TABLE_TOP_Y) / (-dy) : 0;
      end = new THREE.Vector3(start.x + dx * tTable, TABLE_TOP_Y + 0.02, start.z + dz * tTable);
      POUR._tableHit = { x: end.x, z: end.z, t: performance.now() };
      POUR._puddleOn = true;
    }
    // 弹道中点控制点：竖直下坠的轻微弧线（非 S 形），叠加条带自身的微颤
    const ctrl = new THREE.Vector3((start.x + end.x) / 2, (start.y + end.y) / 2 + 0.25, (start.z + end.z) / 2);
    rebuildStreamRibbon(s, start, ctrl, end, performance.now() * 0.001);
    active = STREAM_EQUIV; // 等效活跃粒子数（连续水柱模式）
    // 撞击飞溅：落盖面才触发 hitLid/累计 hitLidRadius；落桌面触发 hitPuddle
    POUR._hitAcc = (POUR._hitAcc || 0) + dt;
    const HIT_DT = 1 / 40;
    while (POUR._hitAcc >= HIT_DT) {
      POUR._hitAcc -= HIT_DT;
      if (onLid) {
        POUR._hitRSum += Math.hypot(end.x, end.z);
        POUR._hitRCount++;
        POUR.hitLidRadius = POUR._hitRSum / POUR._hitRCount;
        hitLid(end.x, end.y, end.z, 0, -6, 0, colorHex);
      } else {
        hitPuddle(end.x + (Math.random() - 0.5) * 0.6, end.z + (Math.random() - 0.5) * 0.6, colorHex);
      }
    }
  } else {
    POUR._hitAcc = 0;
  }
  POUR.streamCount = active;
  // steady-state stream metric (after ramp-up, pour mid-flight)
  if (POUR.streamActive && POUR.streamT > 0.6) {
    POUR._streamSteadyAcc += active;
    POUR._streamSteadyN++;
    POUR.streamSteady = POUR._streamSteadyAcc / POUR._streamSteadyN;
  }
}

function hitLid(x, y, z, vx, vy, vz, colorHex) {
  POUR.streamHitLid++;
  const r = Math.hypot(x, z);
  if (r < 1.2 && !POUR._spillTriggered) {
    POUR._spillTriggered = true;
    triggerPhysics();
  }
  // splash ring one-shot reset handled in updateLidEffects
  POUR.lidSplash.position.set(x, LID_Y + 0.04, z);
  POUR.lidSplash.material.color.setHex(colorHex);
}

function hitPuddle(x, z, colorHex) {
  if (POUR.puddle) {
    POUR.puddle.material.color.setHex(colorHex);
    POUR.puddle.userData.hit = true;
  }
}

function updateLidEffects(dt) {
  if (!POUR.lidFilm || !POUR.lidSplash) return;
  if (!POUR.streamActive && POUR.animPhase === 'idle') {
    POUR.lidFilm.visible = false; POUR.lidSplash.visible = false; return;
  }
  POUR.streamT += dt;
  const type = POUR.animType;
  const baseColor = waterColor(type);
  POUR.lidFilm.visible = true;
  const disc = POUR.lidFilm.children[0];
  disc.material.color.setHex(baseColor);
  const filmStart = 0.3, filmDur = 0.9;
  let filmProg = (POUR.streamT - filmStart) / filmDur;
  filmProg = THREE.MathUtils.clamp(filmProg, 0, 1);
  const filmScale = easeOutQuad(filmProg) * CONTAINER_R;
  POUR.lidFilm.scale.setScalar(Math.max(0.001, filmScale));
  disc.material.opacity = disc.userData.baseOpacity * filmProg * POUR.fadeAll;
  for (let i = 1; i < POUR.lidFilm.children.length; i++) {
    const s = POUR.lidFilm.children[i];
    s.material.color.setHex(baseColor);
    const rProg = THREE.MathUtils.clamp((POUR.streamT - filmStart - 0.05 * i) / (filmDur * 0.8), 0, 1);
    s.scale.y = easeOutQuad(rProg);
    s.material.opacity = s.userData.baseOpacity * rProg * POUR.fadeAll;
  }
  const splashDur = 0.4;
  if (POUR.streamT < splashDur) {
    POUR.lidSplash.visible = true;
    const sp = POUR.streamT / splashDur;
    POUR.lidSplash.scale.setScalar(0.3 + sp * 1.5);
    POUR.lidSplash.material.opacity = 0.85 * (1 - sp) * POUR.fadeAll;
  } else {
    POUR.lidSplash.visible = false;
  }
}

function updateWallStreams(dt) {
  if (!POUR.wallStreams) return;
  if (!POUR.streamActive && POUR.animPhase === 'idle') {
    POUR.wallStreams.visible = false; return;
  }
  POUR.wallStreamT += dt;
  POUR.wallStreams.visible = true;
  const type = POUR.animType;
  const baseColor = waterColor(type);
  const FALL_H = RIM_Y - TABLE_TOP_Y + 0.6;
  const wallStart = 0.9, wallDur = 1.0;
  for (let i = 0; i < POUR.wallStreams.children.length; i++) {
    const m = POUR.wallStreams.children[i];
    m.material.color.setHex(baseColor);
    const t = (POUR.wallStreamT - wallStart - m.userData.onset) / wallDur;
    const prog = THREE.MathUtils.clamp(t, 0, 1);
    const e = easeOutQuad(prog);
    m.visible = prog > 0 && POUR.fadeAll > 0.001;
    m.scale.y = e * FALL_H;
    m.material.opacity = m.userData.baseOpacity * e * POUR.fadeAll;
  }
}

function updatePuddle(dt) {
  if (!POUR.puddle) return;
  if (!POUR.streamActive && POUR.animPhase === 'idle') {
    POUR.puddle.visible = false; POUR.puddle.userData.hit = false; return;
  }
  const type = POUR.animType;
  const baseColor = waterColor(type);
  // R13b：水花落桌面时 puddle 跟随真实落点（150ms 内新鲜才 lerp，尺寸/透明度不变）
  const _hit = POUR._tableHit;
  if (_hit && performance.now() - _hit.t < 150) {
    if (!POUR._puddleSnapped) {
      POUR.puddle.position.x = _hit.x;
      POUR.puddle.position.z = _hit.z;
      POUR._puddleSnapped = true;
    } else {
      const k = Math.min(1, dt * 10);
      POUR.puddle.position.x += (_hit.x - POUR.puddle.position.x) * k;
      POUR.puddle.position.z += (_hit.z - POUR.puddle.position.z) * k;
    }
  }
  const puddleStart = 0.3, puddleDur = 0.8;
  const pProg = THREE.MathUtils.clamp((POUR.streamT - puddleStart) / puddleDur, 0, 1);
  const e = easeOutQuad(pProg);
  const r = THREE.MathUtils.lerp(1.3, 2.1, e);
  POUR.puddle.visible = POUR._puddleOn && POUR.fadeAll > 0.001;
  POUR.puddle.scale.set(r, r, r);
  POUR.puddle.material.color.setHex(baseColor);
  POUR.puddle.material.opacity = POUR.puddle.userData.baseOpacity * e * POUR.fadeAll;
}

function triggerPhysics() {
  if (POUR.animType === 'hot') { if (typeof startSublimate === 'function') startSublimate(); }
  else if (POUR.animType === 'cold') { if (typeof startDeposit === 'function') startDeposit(); }
}

function worldToLocal(posLocal, cup, worldPos) {
  // posLocal is a THREE.Vector3 mutated in-place
  posLocal.copy(worldPos).applyMatrix4(cup.matrixWorld.clone().invert());
}

function gridKey(cx, cy, cz) {
  if (cx < 0 || cx >= GRID_GX || cy < 0 || cy >= GRID_GY || cz < 0 || cz >= GRID_GZ) return -1;
  return (cx * GRID_GY + cy) * GRID_GZ + cz;
}

function ensureGridArrays() {
  if (!POUR._gridHead) POUR._gridHead = new Int32Array(GRID_CELLS);
  if (!POUR._gridNext) POUR._gridNext = new Int32Array(W_MAX);
}

function integrateWater(cup, type, dt) {
  const p = POUR.waterParticles[type];
  if (!p) return;
  const physT0 = performance.now();
  cup.updateMatrixWorld();
  const q = cup.quaternion;
  const localGravity = new THREE.Vector3(0, -9.8, 0).applyQuaternion(q);
  const eps = 0.08;
  const rLimit = CUP_R - eps;
  const r2 = rLimit * rLimit;
  const steps = Math.max(1, Math.min(2, Math.ceil(dt / 0.02)));
  const hSub = dt / steps;
  const invHSub = 1 / hSub;

  ensureGridArrays();
  if (!p.pred) p.pred = new Float32Array(W_MAX * 3);
  const pred = p.pred;
  const head = POUR._gridHead;
  const next = POUR._gridNext;

  const cupVel = new THREE.Vector3();
  if (cup.userData.lastPos) {
    cupVel.subVectors(cup.position, cup.userData.lastPos).divideScalar(dt || 0.016);
  }
  cup.userData.lastPos = cup.position.clone();

  // low-side horizontal direction in local coords (for tilt asymmetry)
  const worldDownLocal = new THREE.Vector3(0, -1, 0).applyQuaternion(q.clone().invert());
  const lowLen = Math.hypot(worldDownLocal.x, worldDownLocal.z);
  let lowNx = 0, lowNz = 0;
  if (lowLen > 1e-6) { lowNx = worldDownLocal.x / lowLen; lowNz = worldDownLocal.z / lowLen; }

  for (let s = 0; s < steps; s++) {
    // 1) gravity integration -> predicted positions
    for (let i = 0; i < p.active; i++) {
      let vx = p.vel[i * 3] + localGravity.x * hSub;
      let vy = p.vel[i * 3 + 1] + localGravity.y * hSub;
      let vz = p.vel[i * 3 + 2] + localGravity.z * hSub;
      p.vel[i * 3] = vx; p.vel[i * 3 + 1] = vy; p.vel[i * 3 + 2] = vz;
      pred[i * 3] = p.pos[i * 3] + vx * hSub;
      pred[i * 3 + 1] = p.pos[i * 3 + 1] + vy * hSub;
      pred[i * 3 + 2] = p.pos[i * 3 + 2] + vz * hSub;
    }

    // 2) PBD neighbor relaxation (multi-iteration); rebuild direct grid each substep
    for (let it = 0; it < PBF_ITER; it++) {
      head.fill(-1);
      for (let i = 0; i < p.active; i++) {
        const cx = Math.floor((pred[i * 3] - GRID_X0) / H);
        const cy = Math.floor((pred[i * 3 + 1] - GRID_Y0) / H);
        const cz = Math.floor((pred[i * 3 + 2] - GRID_Z0) / H);
        const key = gridKey(cx, cy, cz);
        if (key >= 0) {
          next[i] = head[key];
          head[key] = i;
        } else {
          next[i] = -1;
        }
      }
      for (let i = 0; i < p.active; i++) {
        let px = pred[i * 3], py = pred[i * 3 + 1], pz = pred[i * 3 + 2];
        const cx = Math.floor((px - GRID_X0) / H);
        const cy = Math.floor((py - GRID_Y0) / H);
        const cz = Math.floor((pz - GRID_Z0) / H);
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx;
          if (nx < 0 || nx >= GRID_GX) continue;
          for (let dy = -1; dy <= 1; dy++) {
            const ny = cy + dy;
            if (ny < 0 || ny >= GRID_GY) continue;
            for (let dz = -1; dz <= 1; dz++) {
              const nz = cz + dz;
              if (nz < 0 || nz >= GRID_GZ) continue;
              const key = (nx * GRID_GY + ny) * GRID_GZ + nz;
              for (let j = head[key]; j >= 0; j = next[j]) {
                if (j <= i) continue;
                const dx_ = pred[j * 3] - px;
                const dy_ = pred[j * 3 + 1] - py;
                const dz_ = pred[j * 3 + 2] - pz;
                const d2 = dx_ * dx_ + dy_ * dy_ + dz_ * dz_;
                if (d2 < H2 && d2 > 1e-8) {
                  const d = Math.sqrt(d2);
                  const factor = (H - d) * STIFFNESS * 0.5 / d;
                  const ox = dx_ * factor;
                  const oy = dy_ * factor;
                  const oz = dz_ * factor;
                  px -= ox; py -= oy; pz -= oz;
                  pred[j * 3] += ox; pred[j * 3 + 1] += oy; pred[j * 3 + 2] += oz;
                }
              }
            }
          }
        }
        pred[i * 3] = px; pred[i * 3 + 1] = py; pred[i * 3 + 2] = pz;
      }
    }

    // 3) cup wall / floor constraints
    for (let i = 0; i < p.active; i++) {
      if (pred[i * 3 + 1] < eps) pred[i * 3 + 1] = eps;
      const rr = pred[i * 3] * pred[i * 3] + pred[i * 3 + 2] * pred[i * 3 + 2];
      if (rr > r2) {
        const r = Math.sqrt(rr);
        const scale = rLimit / r;
        pred[i * 3] *= scale;
        pred[i * 3 + 2] *= scale;
      }
    }

    // 4) write back velocity and position + substep damping/clamp + displacement guard
    for (let i = 0; i < p.active; i++) {
      let dxn = pred[i * 3] - p.pos[i * 3];
      let dyn = pred[i * 3 + 1] - p.pos[i * 3 + 1];
      let dzn = pred[i * 3 + 2] - p.pos[i * 3 + 2];
      const dn2 = dxn * dxn + dyn * dyn + dzn * dzn;
      if (dn2 > MAX_DISP * MAX_DISP) {          // single-substep displacement clamp
        const ds = MAX_DISP / Math.sqrt(dn2);
        dxn *= ds; dyn *= ds; dzn *= ds;
      }
      let vx = dxn * invHSub * PBF_DAMPING;
      let vy = dyn * invHSub * PBF_DAMPING;
      let vz = dzn * invHSub * PBF_DAMPING;
      const v2 = vx * vx + vy * vy + vz * vz;
      if (v2 > MAX_VEL * MAX_VEL) {
        const s = MAX_VEL / Math.sqrt(v2);
        vx *= s; vy *= s; vz *= s;
      }
      p.vel[i * 3] = vx; p.vel[i * 3 + 1] = vy; p.vel[i * 3 + 2] = vz;
      p.pos[i * 3] += dxn;
      p.pos[i * 3 + 1] += dyn;
      p.pos[i * 3 + 2] += dzn;
    }
  }

  // frame-level cup inertia (slosh), velocity re-clamped after inertia so lift never explodes
  const localCupVel = cupVel.clone().applyQuaternion(q.clone().invert());
  let cvx = localCupVel.x * 0.04;
  let cvy = localCupVel.y * 0.04;
  let cvz = localCupVel.z * 0.04;
  const ciMag = Math.sqrt(cvx * cvx + cvy * cvy + cvz * cvz);
  if (ciMag > 4.0) { const cs = 4.0 / ciMag; cvx *= cs; cvy *= cs; cvz *= cs; }
  for (let i = 0; i < p.active; i++) {
    let ivx = p.vel[i * 3] + cvx;
    let ivy = p.vel[i * 3 + 1] + cvy;
    let ivz = p.vel[i * 3 + 2] + cvz;
    const iv2 = ivx * ivx + ivy * ivy + ivz * ivz;
    if (iv2 > MAX_VEL * MAX_VEL) {
      const ivs = MAX_VEL / Math.sqrt(iv2);
      ivx *= ivs; ivy *= ivs; ivz *= ivs;
    }
    p.vel[i * 3] = ivx; p.vel[i * 3 + 1] = ivy; p.vel[i * 3 + 2] = ivz;
  }

  // runaway guard: respawn escaped particles to cup bottom center, zero velocity (per-second window)
  POUR._runawayWin += dt;
  let respawned = 0;
  const escR2 = (CUP_R + 1) * (CUP_R + 1);
  const hiY = CUP_H + 3;                       // spec: y > CUP_H+3
  const loY = -1;                               // spec: y < -1
  const pouring = POUR.streamActive && type === POUR.animType; // mouth open: top-escape is legit outflow, skip top check
  for (let i = 0; i < p.active; i++) {
    const px = p.pos[i * 3], py = p.pos[i * 3 + 1], pz = p.pos[i * 3 + 2];
    if ((px * px + pz * pz) > escR2 || py < loY || (!pouring && py > hiY)) {
      const a = seeded(i * 9 + 101) * Math.PI * 2;
      const rr2 = (CUP_R - 0.3) * Math.sqrt(seeded(i * 9 + 102));
      p.pos[i * 3] = rr2 * Math.cos(a);
      p.pos[i * 3 + 1] = eps;
      p.pos[i * 3 + 2] = rr2 * Math.sin(a);
      p.vel[i * 3] = 0; p.vel[i * 3 + 1] = 0; p.vel[i * 3 + 2] = 0;
      respawned++;
    }
  }
  POUR._runawayAcc += respawned;
  if (POUR._runawayWin >= 1.0) {
    POUR.runawayCount = POUR._runawayAcc;
    POUR._runawayAcc = 0;
    POUR._runawayWin = 0;
  }

  // metrics
  let maxR = 0, minY = Infinity, maxY = -Infinity;
  let midCount = 0, tiltSum = 0;
  for (let i = 0; i < p.active; i++) {
    const px = p.pos[i * 3], py = p.pos[i * 3 + 1], pz = p.pos[i * 3 + 2];
    const r = Math.hypot(px, pz);
    if (r > maxR) maxR = r;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
    if (py > 1.0) midCount++;
    tiltSum += px * lowNx + pz * lowNz;
  }

  // local surface flatness (top layer band)
  const topBand = maxY - 0.35;
  let sum = 0, nTop = 0;
  for (let i = 0; i < p.active; i++) {
    if (p.pos[i * 3 + 1] >= topBand) { sum += p.pos[i * 3 + 1]; nTop++; }
  }
  const mean = nTop ? sum / nTop : 0;
  let sq = 0;
  for (let i = 0; i < p.active; i++) {
    if (p.pos[i * 3 + 1] >= topBand) { const d = p.pos[i * 3 + 1] - mean; sq += d * d; }
  }
  const std = nTop ? Math.sqrt(sq / nTop) : 0;

  // surface95: mean of top 3% local y (robust liquid surface, ignores sparse loft but tracks true surface line)
  const ysArr = [];
  for (let i = 0; i < p.active; i++) ysArr.push(p.pos[i * 3 + 1]);
  ysArr.sort(function (a, b) { return b - a; });
  const topN = Math.max(1, Math.floor(p.active * 0.03));
  let topSum = 0;
  for (let i = 0; i < topN; i++) topSum += ysArr[i];
  const surface95 = topSum / topN;

  // world-space top surface flatness (only when tilted; otherwise same as local)
  let worldStd = std;
  if (lowLen > 0.15) {
    let worldSum = 0, worldN = 0;
    for (let i = 0; i < p.active; i++) {
      if (p.pos[i * 3 + 1] >= topBand) {
        _v.set(p.pos[i * 3], p.pos[i * 3 + 1], p.pos[i * 3 + 2]);
        _v.applyMatrix4(cup.matrixWorld);
        worldSum += _v.y; worldN++;
      }
    }
    const worldMean = worldN ? worldSum / worldN : 0;
    let worldSq = 0;
    for (let i = 0; i < p.active; i++) {
      if (p.pos[i * 3 + 1] >= topBand) {
        _v.set(p.pos[i * 3], p.pos[i * 3 + 1], p.pos[i * 3 + 2]);
        _v.applyMatrix4(cup.matrixWorld);
        const d = _v.y - worldMean;
        worldSq += d * d;
      }
    }
    worldStd = worldN ? Math.sqrt(worldSq / worldN) : 0;
  }

  if (type === (POUR.animType || 'hot')) {
    POUR.waterCount = p.active;
    POUR.surfaceFlat = std;
    POUR.maxLocalR = maxR;
    POUR.minLocalY = minY;
    POUR.restWaterHeight = maxY;
    POUR.surface95 = surface95;
    POUR.volumeMid = p.active ? midCount / p.active : 0;
    POUR.tiltAsym = p.active ? tiltSum / p.active : 0;
    POUR.surfaceWorldFlat = worldStd;
  }

  // emptyAfterPour hook (no auto-refill)
  p.mesh.geometry.setDrawRange(0, p.active);
  p.mesh.geometry.attributes.position.needsUpdate = true;

  // spill detection: local surface Y at the lowest rim side crosses cup top
  if (POUR.animating && type === POUR.animType && POUR.streamActive === false && POUR._spillTriggered === false) {
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cup.quaternion).normalize();
    const tilt = Math.acos(THREE.MathUtils.clamp(up.y, -1, 1)) * 180 / Math.PI;
    const overflowH = CUP_H - CUP_R * Math.sin(tilt * Math.PI / 180);
    if (surface95 >= overflowH - 0.12 && tilt >= 15) {
      POUR.streamActive = true; POUR.streamT = 0; POUR.wallStreamT = 0;
      POUR._streamSteadyAcc = 0; POUR._streamSteadyN = 0;
      POUR.spillPhysics = true; POUR.spillAngle = tilt;
    }
  }

  // remove outflow particles when stream active
  if (POUR.streamActive && type === POUR.animType) {
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cup.quaternion).normalize();
    const tilt = Math.acos(THREE.MathUtils.clamp(up.y, -1, 1)) * 180 / Math.PI;
    if (tilt > 90 && p.active > 0 && p.active < 60) { p.active = 0; } // R10c: clear invisible residue film at deep tilt
    const overflowH = CUP_H - CUP_R * Math.sin(tilt * Math.PI / 180);
    let removed = 0;
    const drainBoost = tilt > 90 ? 20 : 1; // R10c: deep-tilt phase drains fast so one pour empties the cup
    const removeTarget = Math.max(1, Math.min(14 * drainBoost, Math.floor(p.active * 0.005 * drainBoost)));
    for (let i = p.active - 1; i >= 0 && removed < removeTarget; i--) {
      const wy = p.pos[i * 3 + 1];
      if (wy > overflowH - 0.08) {
        p.active--;
        if (i !== p.active) {
          p.pos[i * 3] = p.pos[p.active * 3];
          p.pos[i * 3 + 1] = p.pos[p.active * 3 + 1];
          p.pos[i * 3 + 2] = p.pos[p.active * 3 + 2];
          p.vel[i * 3] = p.vel[p.active * 3];
          p.vel[i * 3 + 1] = p.vel[p.active * 3 + 1];
          p.vel[i * 3 + 2] = p.vel[p.active * 3 + 2];
        }
        p.pos[p.active * 3] = 0; p.pos[p.active * 3 + 1] = -100; p.pos[p.active * 3 + 2] = 0;
        removed++;
      }
    }
  }

  // smooth physics timing
  const physDt = performance.now() - physT0;
  if (!POUR._physicsTimes) POUR._physicsTimes = [];
  POUR._physicsTimes.push(physDt);
  if (POUR._physicsTimes.length > 60) POUR._physicsTimes.shift();
  let physSum = 0;
  for (let i = 0; i < POUR._physicsTimes.length; i++) physSum += POUR._physicsTimes[i];
  POUR.physicsMs = physSum / POUR._physicsTimes.length;
}

function updateWater(dt) {
  Object.keys(POUR.cups).forEach(function (type) {
    const cup = POUR.cups[type];
    if (!cup) return;
    integrateWater(cup, type, dt || 0.016);
  });
}

function updateTooltip(x, y) {
  const cup = POUR.hoverCup;
  if (!cup) return;
  const el = $('pour-tooltip');
  if (!el) return;
  POUR.hotTemp = state ? state.hotTemp : 80;
  const coldT = state && state.coldTemp ? state.coldTemp : 20;
  const txt = cup.userData.type === 'hot' ? '热水 约' + POUR.hotTemp + '℃' : '凉水 约' + coldT + '℃';
  if (el.textContent !== txt) el.textContent = txt;
  el.style.left = Math.min(window.innerWidth - 110, x + 14) + 'px';
  el.style.top = Math.max(10, y - 30) + 'px';
  el.classList.add('show');
}

function hideTooltip() {
  const el = $('pour-tooltip');
  if (el) el.classList.remove('show');
}

function reset() {
  POUR.isDragging = false; POUR.animating = false; POUR.animPhase = 'idle'; POUR.animType = null;
  POUR.streamActive = false; POUR.streamT = 0; POUR.wallStreamT = 0; POUR.pourProg = 0; POUR.fadeAll = 1;
  POUR._spillTriggered = false; POUR.spillPhysics = false; POUR.spillAngle = 0;
  POUR.streamHitLid = 0; POUR.hitLidRadius = 0;
  POUR._frameTimes = []; POUR._lastFrame = performance.now();
  POUR._physicsTimes = []; POUR.physicsMs = 0;
  POUR.runawayCount = 0; POUR._runawayAcc = 0; POUR._runawayWin = 0;
  POUR.streamSteady = 0; POUR._streamSteadyAcc = 0; POUR._streamSteadyN = 0;
  POUR.surface95 = 0;
  setButtonsDisabled(false);
  if (POUR.streamParticles) {
    POUR.streamParticles.mesh.visible = false;
    POUR._hitAcc = 0;
  }
  if (POUR.lidFilm) POUR.lidFilm.visible = false;
  if (POUR.lidSplash) POUR.lidSplash.visible = false;
  if (POUR.wallStreams) POUR.wallStreams.visible = false;
  if (POUR.puddle) POUR.puddle.visible = false;
  if (POUR.cups.hot) { returnCupHome(POUR.cups.hot); }
  if (POUR.cups.cold) { returnCupHome(POUR.cups.cold); }
  Object.keys(POUR.waterParticles).forEach(function (type) { resetWater(type); });
  POUR.resetRefills = POUR.waterParticles.hot ? POUR.waterParticles.hot.active : 0;
}

function update(dt) {
  if (!POUR.ready) return;
  // FPS sample
  const now = performance.now();
  POUR._frameTimes.push(now - POUR._lastFrame);
  if (POUR._frameTimes.length > 120) POUR._frameTimes.shift();
  const avgFrame = POUR._frameTimes.reduce(function (a, b) { return a + b; }, 0) / POUR._frameTimes.length;
  POUR.fpsSample = avgFrame;
  POUR._lastFrame = now;

  updateSteam(dt);
  animatePour(dt);
  updateWater(dt);
  updateWaterBody(dt);
  updateStream(dt);
  updateLidEffects(dt);
  updateWallStreams(dt);
  updatePuddle(dt);
  // cup debug metrics
  if (POUR.animType && POUR.cups[POUR.animType]) {
    const cup = POUR.cups[POUR.animType];
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cup.quaternion).normalize();
    POUR.cupTiltDeg = Math.acos(THREE.MathUtils.clamp(up.y, -1, 1)) * 180 / Math.PI;
    POUR.cupOffset = Math.hypot(cup.position.x, cup.position.z);
    const lidCenter = new THREE.Vector3(0, RIM_Y, 0);
    POUR.mouthDot = up.dot(lidCenter.clone().sub(cup.position).normalize());
  }
  if (POUR.hoverCup) updateTooltip(lastX, lastY);
}

// Debug helpers for acceptance snapshots/tests
function poseCup(type, posArray, eulerArray) {
  const cup = POUR.cups[type];
  if (!cup) return;
  // Prevent reset() in the same frame from overriding
  POUR.isDragging = false; POUR.animating = false; POUR.animType = null; POUR.animPhase = 'idle';
  cup.position.fromArray(posArray);
  cup.rotation.set(eulerArray[0], eulerArray[1], eulerArray[2]);
  cup.updateMatrixWorld();
}

function stepPhysics(steps, dt) {
  for (let i = 0; i < steps; i++) update(dt || 0.016);
}

window.SublimationPour = {
  init: init, playPour: playPour, setMode: setMode, reset: reset, update: update, state: POUR,
  poseCup: poseCup, stepPhysics: stepPhysics
};

})();

/* exp-vapor-core.js — 汽化液化探究馆 3D 场景与核心循环 [s1] */
/* eslint-env browser */

const BEAKER_R = 3.4, BEAKER_H = 8.5, WATER_H = 5.8;
const BATH_BOTTOM_Y = 1.8, RIM_Y = BATH_BOTTOM_Y + BEAKER_H;
const IRON_X = -8.5;
const BASE_W = 22, BASE_D = 12;
const RING_Y = 1.2, TOP_Y = 20.2;
const THERMO_X = 0.0, THERMO_Y = 4.5;
const PAPER_TEMP_BAR_MAX = 200;
const FLAME_PROFILE = {
  high:   { base: 1.20, inner: 0xfff3e0, outer: 0xff5722, disc: 0xff3d00, discOp: 0.60 },
  medium: { base: 0.85, inner: 0xffcc80, outer: 0xff7043, disc: 0xff5722, discOp: 0.50 },
  low:    { base: 0.55, inner: 0xbf360c, outer: 0x5d1910, disc: 0x8d2800, discOp: 0.35 }
};

let state;
let scene, camera, renderer;
let waterMesh, coverMesh, boilBubbles, attachBubbles;
let boilBubbleData = [], attachBubbleData = [];
let flameGroup, flameDisc, flameCones = [];
let flameBaseScale = 1;
let thermoLiquid, thermoGroup;
let toastTimer = null;
let lastPhysicsTime = performance.now();

let cameraState = { distance: 58, azimuth: 0.45, polar: Math.PI / 3.0 };
const CAM_MIN_DIST = 24, CAM_MAX_DIST = 90;
const SCENE_CENTER_BOIL = new THREE.Vector3(0, 7.0, 0);
const SCENE_CENTER_EVAP = new THREE.Vector3(0, -5.5, 0);
function sceneCenter() { return state && state.mode === 'evap' ? SCENE_CENTER_EVAP : SCENE_CENTER_BOIL; }

let boilGroup, evapGroup;
let evapSubGroups = {};
let evapDroplets = [], evapDishes = [], evapVapor = [];
let coolThermometers = [];
let evapTooltip, raycaster, pointer = new THREE.Vector2();
let fanGroup, fanAnimT = 0, fanPivot;
let hoverDropIdx = null;
let evapWindLines = [];
let evapWindBurst = { active: false, startTime: 0, duration: 1.2 };
let evapStreamEmitTimer = 0;
let evapRipples = [];
let evapRippleTimer = 0.4;
let windDrift = 0;
let pointerMoved = false, fanClickStart = { x: 0, y: 0 };
let paperPotMesh, paperWaterMesh, paperFlameGroup;
let paperMatchGroup, paperMatchHead, paperThermoGroup, paperThermoLiquid, paperTempBarTopLine;
let paperBoxW, paperBoxD;
let paperFireGroup, paperSmokeParticles = [], paperBubbles = [], paperVaporParticles = [];
let paperBubbleData = [];

function seeded(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function resetPhysicsCore() {
  state = makeInitialState({ ambTemp: state ? state.ambTemp : 25, fire: state ? state.fire : 'medium', amount: state ? state.amount : 'medium', timeScale: state ? state.timeScale : 60 });
  hideToast();
  updateFlame();
  updateThermometerLiquid();
  updateBathVisual();
}

function initScene() {
  const container = document.getElementById('canvas-container');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a24);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 36, 62);
  camera.lookAt(new THREE.Vector3(0, 9, 0));
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  renderer.domElement.addEventListener('pointermove', onHoverMove);
  renderer.domElement.addEventListener('pointerleave', hideEvapTooltip);
  raycaster = new THREE.Raycaster();
  evapTooltip = document.getElementById('evap-tooltip');

  const ambient = new THREE.AmbientLight(0xffffff, 0.55); scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.85); dir.position.set(15, 30, 15); scene.add(dir);
  const fill = new THREE.DirectionalLight(0xffffff, 0.40); fill.position.set(-12, 20, -10); scene.add(fill);
  const back = new THREE.DirectionalLight(0xaaccff, 0.30); back.position.set(-15, 15, -15); scene.add(back);

  buildTable();
  buildIronStand();
  buildBeaker();
  buildCover();
  buildSteam();
  buildThermometer();
  buildLamp();
  boilGroup = new THREE.Group();
  const toBoil = [];
  scene.children.forEach(c => { if (!c.isLight) toBoil.push(c); });
  toBoil.forEach(c => { scene.remove(c); boilGroup.add(c); });
  scene.add(boilGroup);
  buildEvapScene();
  setModeVisibility(state.mode);
  applyCameraOrbit();
}

function buildTable() {
  const table = new THREE.Mesh(new THREE.BoxGeometry(80, 2, 50), new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.85 }));
  table.position.y = -8; scene.add(table);
}

function buildIronStand() {
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x3d3d45, metalness: 0.55, roughness: 0.45 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(BASE_W, 1.0, BASE_D), darkMetal);
  base.position.set(0, -6.5, 0); scene.add(base);
  const rodH = TOP_Y + 9.5;
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, rodH, 16), darkMetal);
  rod.position.set(IRON_X, rodH / 2 - 9, 0); scene.add(rod);
  const armLowLen = Math.abs(IRON_X) + 1.5;
  const armLow = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, armLowLen, 16), darkMetal);
  armLow.rotation.z = Math.PI / 2; armLow.position.set(IRON_X + armLowLen / 2, RING_Y, 0); scene.add(armLow);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(BEAKER_R + 0.3, 0.12, 8, 32), darkMetal);
  ring.rotation.x = Math.PI / 2; ring.position.set(0, RING_Y, 0); scene.add(ring);
  const gauzeMat = new THREE.MeshStandardMaterial({ color: 0x888899, metalness: 0.35, roughness: 0.7, wireframe: true });
  const gauze = new THREE.Mesh(new THREE.CylinderGeometry(BEAKER_R + 0.45, BEAKER_R + 0.45, 0.06, 32, 1, true), gauzeMat);
  gauze.position.set(0, RING_Y + 0.05, 0); scene.add(gauze);
  const ceramic = new THREE.Mesh(new THREE.CylinderGeometry(BEAKER_R - 0.05, BEAKER_R - 0.05, 0.06, 32), new THREE.MeshStandardMaterial({ color: 0xcdc5b8, roughness: 0.9 }));
  ceramic.position.set(0, RING_Y + 0.08, 0); scene.add(ceramic);
  const armTopLen = Math.abs(IRON_X) + THERMO_X + 0.5;
  const armTop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, armTopLen, 16), darkMetal);
  armTop.rotation.z = Math.PI / 2; armTop.position.set(IRON_X + armTopLen / 2, TOP_Y, 0); scene.add(armTop);
  const clampTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.7), darkMetal);
  clampTop.position.set(THERMO_X, TOP_Y, 0); scene.add(clampTop);
  const clampRingTop = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 8, 20), darkMetal);
  clampRingTop.rotation.x = Math.PI / 2; clampRingTop.position.set(THERMO_X, TOP_Y, 0); scene.add(clampRingTop);
}

function buildBeaker() {
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaccff, transparent: true, opacity: 0.22,
    roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false
  });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(BEAKER_R, BEAKER_R, BEAKER_H, 40, 1, true), glassMat);
  wall.position.set(0, RIM_Y - BEAKER_H / 2, 0); wall.renderOrder = 1; scene.add(wall);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(BEAKER_R, 0.05, 8, 48), new THREE.MeshBasicMaterial({ color: 0x88aaff, depthWrite: false }));
  edge.rotation.x = Math.PI / 2; edge.position.set(0, RIM_Y, 0); edge.renderOrder = 1; scene.add(edge);

  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x64d8ff, transparent: true, opacity: 0.45,
    roughness: 0.12, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false
  });
  waterMesh = new THREE.Mesh(new THREE.CylinderGeometry(BEAKER_R - 0.25, BEAKER_R - 0.25, 1, 32), waterMat);
  waterMesh.position.set(0, BATH_BOTTOM_Y + WATER_H / 2, 0); waterMesh.scale.y = WATER_H; waterMesh.renderOrder = 2; scene.add(waterMesh);

  const bubbleGeo = new THREE.SphereGeometry(0.08, 6, 6);
  const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false });
  boilBubbles = new THREE.InstancedMesh(bubbleGeo, bubbleMat, 48);
  boilBubbles.instanceMatrix.setUsage(THREE.DynamicDrawUsage); boilBubbles.visible = false; boilBubbles.renderOrder = 2;
  for (let i = 0; i < 48; i++) {
    const angle = (i / 48) * Math.PI * 2 + seeded(i * 7) * 0.6;
    const r = (BEAKER_R - 0.7) * Math.sqrt(seeded(i * 7 + 1));
    const speed = 1.2 + seeded(i * 7 + 2) * 1.4;
    boilBubbleData.push({ angle, r, speed, y: seeded(i * 7 + 3) * WATER_H, grow: 0.6 + seeded(i * 7 + 4) * 0.8 });
  }
  scene.add(boilBubbles);

  attachBubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 5, 5), new THREE.MeshBasicMaterial({ color: 0xcceeff, transparent: true, opacity: 0.45, depthWrite: false }), 24);
  attachBubbles.instanceMatrix.setUsage(THREE.DynamicDrawUsage); attachBubbles.visible = false; attachBubbles.renderOrder = 2;
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2 + seeded(i * 5) * 0.8;
    const r = (BEAKER_R - 1.0) * Math.sqrt(seeded(i * 5 + 1)) + 0.25;
    const speed = 0.8 + seeded(i * 5 + 2) * 0.9;
    attachBubbleData.push({ angle, r, baseY: BATH_BOTTOM_Y + 0.1 + seeded(i * 5 + 2) * 0.4, phase: seeded(i * 5 + 3) * Math.PI * 2, y: seeded(i * 5 + 4) * WATER_H * 0.95, speed, life: seeded(i * 5 + 4) });
  }
  scene.add(attachBubbles);

  const cornerR = 0.35;
  const bottomTorus = new THREE.Mesh(new THREE.TorusGeometry(BEAKER_R - cornerR, cornerR, 10, 48), glassMat);
  bottomTorus.rotation.x = Math.PI / 2; bottomTorus.position.set(0, BATH_BOTTOM_Y + cornerR, 0); bottomTorus.renderOrder = 1; scene.add(bottomTorus);
  const bottomDisc = new THREE.Mesh(new THREE.CircleGeometry(BEAKER_R - cornerR, 40), new THREE.MeshPhysicalMaterial({ color: 0xaaccff, transparent: true, opacity: 0.25, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false }));
  bottomDisc.rotation.x = -Math.PI / 2; bottomDisc.position.set(0, BATH_BOTTOM_Y, 0); bottomDisc.renderOrder = 1; scene.add(bottomDisc);
}

function buildCover() {
  const mat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false });
  coverMesh = new THREE.Mesh(new THREE.RingGeometry(0.35, BEAKER_R + 0.05, 48), mat);
  coverMesh.rotation.x = -Math.PI / 2; coverMesh.position.set(0, RIM_Y + 0.04, 0); coverMesh.renderOrder = 3; scene.add(coverMesh);
}

/* 蔡总 2026-09-27 17:39：纸板盖·带孔时从孔里冒热气，随温度升高逐渐变大 */
let steamMesh = null, steamData = [];
function buildSteam() {
  steamMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.30, depthWrite: false }), 28);
  steamMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); steamMesh.renderOrder = 5;
  for (let i = 0; i < 28; i++) {
    steamData.push({ angle: (i / 28) * Math.PI * 2 + seeded(i * 11) * 0.5, r: 0.16 + seeded(i * 11 + 1) * 0.16, y: seeded(i * 11 + 2) * 2.6, speed: 0.8 + seeded(i * 11 + 3) * 0.8, sway: seeded(i * 11 + 4) * Math.PI * 2, sz: 0.6 + 0.4 * seeded(i * 11 + 5), drift: 0.8 + seeded(i * 11 + 6) * 1.4 });
  }
  scene.add(steamMesh);
}
function updateSteam(dt) {
  if (!steamMesh) return;
  const T = state.waterTemp;
  const active = state.mode === 'boil' && state.lid === 'vent' && state.heating && T > 45;
  const g = active ? Math.max(0, Math.min(1, (T - 45) / 55)) : 0;
  const dummy = new THREE.Object3D();
  const span = 1.2 + 2.4 * g;
  for (let i = 0; i < steamMesh.count; i++) {
    const p = steamData[i];
    p.y += p.speed * dt * (0.4 + 0.8 * g);
    if (p.y > span) { p.y = 0; p.angle += 0.9 + seeded(i * 13) * 1.6; }
    const prog = p.y / Math.max(0.001, span);
    // 蔡总 2026-09-27 17:59：透过杯孔后往四周向上扩散（半径随高度张开的扩散锥）
    const rad = 0.22 + prog * (1.6 + p.drift) + Math.sin(p.y * 2.0 + p.sway) * 0.10 * prog;
    const s = g * (0.5 + 1.2 * prog) * p.sz;
    dummy.position.set(rad * Math.cos(p.angle), RIM_Y + 0.10 + p.y, rad * Math.sin(p.angle));
    dummy.scale.setScalar(Math.max(0.001, s));
    dummy.updateMatrix(); steamMesh.setMatrixAt(i, dummy.matrix);
  }
  steamMesh.instanceMatrix.needsUpdate = true;
}

function buildThermometer() {
  thermoGroup = new THREE.Group(); thermoGroup.position.set(THERMO_X, THERMO_Y, 0.0);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false });
  const tubeLen = TOP_Y - THERMO_Y - 0.3;
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, tubeLen, 16, 1, true), glassMat);
  tube.position.y = tubeLen / 2; tube.renderOrder = 4; thermoGroup.add(tube);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), new THREE.MeshStandardMaterial({ color: 0xff3333 }));
  bulb.position.y = 0.26; thermoGroup.add(bulb);
  const liqGeo = new THREE.CylinderGeometry(0.07, 0.07, 1, 12);
  liqGeo.translate(0, 0.5, 0);
  thermoLiquid = new THREE.Mesh(liqGeo, new THREE.MeshBasicMaterial({ color: 0xff1a1a }));
  thermoLiquid.position.y = 0.6; thermoGroup.add(thermoLiquid);

  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 1024;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, 128, 1024);
  const minT = -10, maxT = 110;
  for (let T = minT; T <= maxT; T++) {
    const y = 30 + (1 - (T - minT) / (maxT - minT)) * 964;
    const major = T % 10 === 0;
    cx.strokeStyle = '#222'; cx.lineWidth = major ? 4 : 2;
    cx.beginPath(); cx.moveTo(major ? 78 : 92, y); cx.lineTo(124, y); cx.stroke();
    if (major) { cx.fillStyle = '#111'; cx.font = 'bold 28px sans-serif'; cx.textAlign = 'left'; cx.textBaseline = 'middle'; cx.fillText(String(T), 8, y); }
  }
  const tex = new THREE.CanvasTexture(cv);
  const stripH = tubeLen - 3.0, stripY = 1.5 + stripH / 2;
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.48, stripH), new THREE.MeshBasicMaterial({ map: tex, side: THREE.FrontSide }));
  strip.position.set(0, stripY, -0.2); thermoGroup.add(strip);
  const strip2 = strip.clone(); strip2.rotation.y = Math.PI; strip2.position.set(0, stripY, -0.21); thermoGroup.add(strip2);
  scene.add(thermoGroup);
}

function buildLamp() {
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.05, side: THREE.DoubleSide, depthWrite: false });
  const bodyPoints = [new THREE.Vector2(0.95, -6.20), new THREE.Vector2(1.25, -5.40), new THREE.Vector2(1.75, -4.60), new THREE.Vector2(2.20, -3.80), new THREE.Vector2(2.55, -3.00), new THREE.Vector2(2.45, -2.40), new THREE.Vector2(1.80, -1.90), new THREE.Vector2(0.95, -1.45)];
  const body = new THREE.Mesh(new THREE.LatheGeometry(bodyPoints, 32), glassMat); scene.add(body);
  const alcoholMat = new THREE.MeshPhysicalMaterial({ color: 0xcceeff, transparent: true, opacity: 0.55, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false });
  const alcoholPoints = [new THREE.Vector2(0.85, -6.00), new THREE.Vector2(1.15, -5.25), new THREE.Vector2(1.60, -4.50), new THREE.Vector2(2.00, -3.80), new THREE.Vector2(2.05, -3.30), new THREE.Vector2(1.55, -2.70)];
  const alcohol = new THREE.Mesh(new THREE.LatheGeometry(alcoholPoints, 32), alcoholMat); scene.add(alcohol);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.88, 1.15, 16, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false }));
  neck.position.set(0, -0.90, 0); scene.add(neck);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.95, 0.70, 24), new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.4 }));
  cap.position.set(0, -0.30, 0); scene.add(cap);
  const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.65, 10), new THREE.MeshStandardMaterial({ color: 0x555555 }));
  wick.position.set(0, 0.10, 0); scene.add(wick);

  flameGroup = new THREE.Group(); flameGroup.position.set(0, 0.38, 0); scene.add(flameGroup);
  flameDisc = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), new THREE.MeshBasicMaterial({ color: 0xff5722, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
  flameDisc.rotation.x = -Math.PI / 2; flameDisc.position.y = -0.3; flameDisc.renderOrder = 0; flameGroup.add(flameDisc);
  const coneGeo = new THREE.ConeGeometry(0.35, 1.0, 8);
  const innerCone = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({ color: FLAME_PROFILE.medium.inner, transparent: true, opacity: 0.9, depthWrite: false }));
  innerCone.position.set(0, 0.3, 0); innerCone.renderOrder = 0; innerCone.userData.inner = true; flameGroup.add(innerCone); flameCones.push(innerCone);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const c = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({ color: FLAME_PROFILE.medium.outer, transparent: true, opacity: 0.8, depthWrite: false })); c.position.set(Math.cos(a) * 0.42, 0.25, Math.sin(a) * 0.42); c.rotation.x = Math.PI / 10; c.renderOrder = 0; c.userData.inner = false; flameGroup.add(c); flameCones.push(c); }
  flameGroup.visible = false;
}

function updateFlame() {
  const on = state.heating;
  if (flameGroup) flameGroup.visible = on;
  if (!on || !flameCones.length) return;
  const p = FLAME_PROFILE[state.fire] || FLAME_PROFILE.medium;
  flameBaseScale = p.base;
  flameCones.forEach(c => { const w = c.userData.inner ? p.base : p.base * 0.85; c.material.color.setHex(c.userData.inner ? p.inner : p.outer); c.scale.set(w, p.base, w); });
  flameDisc.material.color.setHex(p.disc); flameDisc.material.opacity = p.discOp; flameDisc.scale.setScalar(p.base);
}

function updateBathVisual(dt) {
  if (!waterMesh) return;
  const T = state.waterTemp;
  if (state.boiling) { waterMesh.material.color.setHex(0x99eaff); waterMesh.material.opacity = 0.55; }
  else { waterMesh.material.color.setHex(0x64d8ff); waterMesh.material.opacity = 0.45; }

  attachBubbles.visible = state.bubbleRegime === 'collapse';
  boilBubbles.visible = state.bubbleRegime === 'boil';
  if (dt) {
    const dummy = new THREE.Object3D();
    if (boilBubbles.visible) {
      for (let i = 0; i < boilBubbles.count; i++) {
        const b = boilBubbleData[i]; b.y += b.speed * dt;
        if (b.y > WATER_H) { b.y = 0; b.angle += (seeded(i * 9) - 0.5) * 0.3; }
        const s = 0.45 + b.grow * 1.3 * (b.y / WATER_H);
        dummy.position.set(b.r * Math.cos(b.angle), BATH_BOTTOM_Y + b.y, b.r * Math.sin(b.angle));
        dummy.scale.setScalar(s); dummy.updateMatrix(); boilBubbles.setMatrixAt(i, dummy.matrix);
      }
      boilBubbles.instanceMatrix.needsUpdate = true;
    }
    if (attachBubbles.visible) {
      for (let i = 0; i < attachBubbles.count; i++) {
        const b = attachBubbleData[i];
        b.y += b.speed * dt * (0.6 + 0.4 * ((T - 50) / 50));
        // 蔡总 2026-09-27 17:24：气泡运动范围始终是整个水柱，不是只在下半部分
        const top = WATER_H * (0.92 + 0.08 * seeded(i * 5 + 3));
        if (b.y > top || b.life <= 0) {
          b.y = 0;
          b.life = 1.0;
          b.angle = (i / 24) * Math.PI * 2 + seeded(i * 5 + 6) * 0.8;
        }
        const prog = b.y / top;
        // 蔡总 2026-09-27 17:00：气泡大小全程 小→大（~80℃峰）→小，变化要明显
        const szBase = preboilBubbleSize(T);
        const collapse = Math.max(0, Math.min(1, (98 - T) / 38));
        const s = (1.0 - prog * 0.85 * collapse) * szBase;
        b.life -= dt * (0.15 + seeded(i * 5 + 7) * 0.2) * (0.3 + collapse);
        dummy.position.set(b.r * Math.cos(b.angle), b.baseY + b.y, b.r * Math.sin(b.angle));
        dummy.scale.setScalar(Math.max(0.05, s * (b.life > 0 ? 1 : 0.01)));
        dummy.updateMatrix(); attachBubbles.setMatrixAt(i, dummy.matrix);
      }
      attachBubbles.instanceMatrix.needsUpdate = true;
    }
  }
}

function updateThermometerLiquid() {
  if (!thermoLiquid) return;
  const minT = -10, maxT = 110;
  let frac = (state.waterTemp - minT) / (maxT - minT);
  frac = Math.max(0, Math.min(1, frac));
  const cy = 30 + (1 - frac) * 964;
  const topY = 1.5 + 12.4 * (1 - cy / 1024);
  thermoLiquid.scale.y = Math.max(0.05, topY - thermoLiquid.position.y);
}

function applyCameraOrbit() {
  const r = cameraState.distance, phi = cameraState.polar, theta = cameraState.azimuth;
  const c = sceneCenter();
  camera.position.set(c.x + r * Math.sin(phi) * Math.sin(theta), c.y + r * Math.cos(phi), c.z + r * Math.sin(phi) * Math.cos(theta));
  camera.lookAt(c);
}

function updateCameraRotation(dx, dy) {
  cameraState.azimuth -= dx * 0.006;
  const newPolar = cameraState.polar - dy * 0.006;
  cameraState.polar = Math.max(0.087, Math.min(Math.PI / 2 - 0.087, newPolar));
  applyCameraOrbit();
}

function onWheel(e) { e.preventDefault(); cameraState.distance = THREE.MathUtils.clamp(cameraState.distance + e.deltaY * 0.05, CAM_MIN_DIST, CAM_MAX_DIST); applyCameraOrbit(); }
function onResize() { if (!camera || !renderer) return; camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); }

function showToast(html) {
  const el = document.getElementById('phase-toast'); if (!el) return;
  el.innerHTML = html; el.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 5200);
}
function hideToast() { const el = document.getElementById('phase-toast'); if (el) el.classList.remove('show'); if (toastTimer) clearTimeout(toastTimer); }

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastPhysicsTime) / 1000);
  lastPhysicsTime = now;
  stepPhysics(state, dt);
  stepEvapPhysics(state, dt);
  if (flameGroup && state.heating) { const t = now * 0.006; flameGroup.scale.setScalar(flameBaseScale * (1 + Math.sin(t) * 0.12)); flameGroup.rotation.y += 0.02; }
  if (state.mode === 'boil') { updateBathVisual(dt); updateThermometerLiquid(); updateCoverVisual(); updateSteam(dt); checkAnnouncements(); if (boilGain) setBoilVolume(state.soundLevel || 0); }
  else if (state.mode === 'evap' || state.mode === 'liquefy') updateEvapScene(dt);
  if (typeof updateUI === 'function') updateUI();
  renderer.render(scene, camera);
}

function checkAnnouncements() {
  if (!state.hissAnnounced && !state.boiling && state.waterTemp >= 60) {
    state.hissAnnounced = true;
    showToast('<b>响水不开</b><br>升温开始变慢；壶底产生大量小气泡，上升遇冷收缩、破裂，声音最吵，但水还没沸腾');
  }
  if (!state.quietAnnounced && !state.boiling && state.waterTemp >= 85) {
    state.quietAnnounced = true;
    showToast('升温更慢；气泡破裂减少，响声逐渐减弱，水温继续上升，即将沸腾');
  }
  if (!state.plateauAnnounced && state.boiling) {
    state.plateauAnnounced = true;
    const bp = boilingPoint(state).toFixed(1);
    showToast('<b>开水不响</b><br>水温保持 ' + bp + ' ℃ 不变，大量气泡上升、变大，直达水面破裂，只剩低沉的“哕哚”声');
  }
  if (!state.conclusionAnnounced && state.recordStop) {
    state.conclusionAnnounced = true;
    showToast('<b>实验结论</b><br>水在沸腾前，温度不断升高；水在沸腾后，温度保持不变。');
  }
}

function updateCoverVisual() {
  if (!coverMesh) return;
  coverMesh.material.color.setHex(state.lid === 'sealed' ? 0xc8b8a8 : 0xd7ccc8);
  coverMesh.material.opacity = state.lid === 'sealed' ? 0.98 : 0.95;
}

function setModeVisibility(mode) {
  if (boilGroup) boilGroup.visible = (mode === 'boil');
  if (evapGroup) evapGroup.visible = (mode === 'evap');
  if (evapSubGroups.factors) evapSubGroups.factors.visible = (mode === 'evap' && state.evapSub === 'factors');
  if (evapSubGroups.cooling) evapSubGroups.cooling.visible = (mode === 'evap' && state.evapSub === 'cooling');
  if (evapSubGroups.paper) evapSubGroups.paper.visible = (mode === 'evap' && state.evapSub === 'paper');
  const lqHint = document.getElementById('lq-phase-hint');
  if (lqHint) {
    if (mode === 'liquefy') {
      lqHint.classList.remove('hidden');
      lqHint.style.display = 'block';
    } else {
      lqHint.classList.add('hidden');
      lqHint.style.display = 'none';
    }
  }
}

function setEvapSub(sub) {
  state.evapSub = sub;
  setModeVisibility(state.mode);
}

function updateEvapScene(dt) {
  setModeVisibility(state.mode);
  if (state.evapSub === 'factors') updateEvapDroplets(dt);
  else if (state.evapSub === 'cooling') updateEvapCooling(dt);
  else if (state.evapSub === 'paper') updateEvapPaper(dt);
  updateEvapTooltip();
}

function updateEvapDroplets(dt) {
  const f = state.evap.factors;
  const dishBottomY = -6.88;
  evapDroplets.forEach((drop, i) => {
    const V = f.volumes[i];
    const s = Math.pow(Math.max(0.001, V), 1 / 3);
    drop.scale.set(1.6 * s, Math.max(0.05, 0.55 * s), 1.6 * s);
    drop.position.y = dishBottomY + 0.55 * s;
  });
  const rightWind = f.wind + f.fanBoost;
  const leftRate = evaporationRate(f.ambTemp, 1.0, f.wind), rightRate = evaporationRate(f.temp, f.area, rightWind);
  const maxRate = Math.max(leftRate, rightRate);
  const t = performance.now() * 0.003;
  if (fanAnimT > 0) {
    fanAnimT = Math.max(0, fanAnimT - dt);
    const p = 1 - fanAnimT / 0.34;
    fanPivot.position.y = Math.sin(p * Math.PI * 2) * 0.28;
    fanPivot.rotation.x = Math.sin(p * Math.PI * 2) * 0.015;
  } else if (fanPivot) {
    fanPivot.position.y = 0;
    fanPivot.rotation.x = 0;
  }
  updateEvapWindLines(dt);
  updateEvapRipples(dt);
  const windActive = evapWindBurst.active || f.fanBoost > 0.1;
  const driftTarget = windActive ? (f.fanBoost / 6) * 1.8 : 0;
  windDrift += (driftTarget - windDrift) * Math.min(1, dt * 3);
  evapVapor.forEach((p, i) => {
    const side = p.userData.side;
    const V = f.volumes[side];
    const rate = side === 0 ? leftRate : rightRate;
    const active = V > 0.01 && rate > 0.001;
    p.visible = active;
    if (!active) return;
    const drop = evapDroplets[side];
    const s = Math.pow(Math.max(0.001, V), 1 / 3);
    const surfaceY = drop.position.y + 0.55 * s;
    const lift = ((t + p.userData.phase) % 2.5) / 2.5 * 4.0;
    const spread = lift * 0.35;
    p.position.set(p.userData.baseX + Math.sin(t + p.userData.phase) * spread, surfaceY + lift, p.userData.baseZ + Math.cos(t + p.userData.phase) * spread);
    if (side === 1 && windActive) p.position.x += windDrift * (lift / 4.0) * -0.94;
    if (side === 1 && windActive) p.position.z += windDrift * (lift / 4.0) * -0.34;
    const sc = 0.6 + (rate / (maxRate || 1)) * 1.2;
    p.scale.setScalar(sc);
  });
}

function updateEvapWindLines(dt) {
  const f = state.evap.factors;
  const now = performance.now() / 1000;
  if (f.fanBoost > 0.15) {
    evapStreamEmitTimer -= dt;
    if (evapStreamEmitTimer <= 0) {
      emitStreamline(0);
      evapStreamEmitTimer = 0.09 + seeded(Math.floor(now * 1000) % 11) * 0.10;
    }
  } else {
    evapStreamEmitTimer = 0;
  }
  evapWindLines.forEach((line) => {
    const u = line.userData;
    if (!u.active) { line.visible = false; return; }
    const p = (now - u.startTime) / u.duration;
    if (p < 0) { line.visible = false; return; }
    if (p >= 1) { u.active = false; line.visible = false; return; }
    line.visible = true;
    const drawP = Math.min(1, p / 0.8);
    const idxCount = line.geometry.index ? line.geometry.index.count : line.geometry.attributes.position.count;
    line.geometry.setDrawRange(0, Math.floor(idxCount * drawP));
    let op;
    if (p < 0.15) op = u.maxOpacity * (p / 0.15);
    else if (p < 0.75) op = u.maxOpacity;
    else op = u.maxOpacity * (1 - (p - 0.75) / 0.25);
    u.mat.uniforms.baseOpacity.value = op;
  });
  if (evapWindBurst.active && (now - evapWindBurst.startTime) > evapWindBurst.duration) evapWindBurst.active = false;
}

function triggerWindBurst() {
  evapWindBurst.active = true;
  evapWindBurst.startTime = performance.now() / 1000;
  evapWindBurst.duration = 0.95;
  for (let i = 0; i < 5; i++) emitStreamline(i * 0.12);
  spawnRipple(0.0);
  spawnRipple(0.18);
  spawnRipple(0.36);
}

function updateEvapCooling(dt) {
  coolThermometers.forEach((th, i) => {
    const T = i === 0 ? state.evap.cooling.withTemp : state.evap.cooling.withoutTemp;
    const minT = -10, maxT = 60;
    let frac = (T - minT) / (maxT - minT); frac = Math.max(0, Math.min(1, frac));
    const h = 0.2 + frac * 4.8;
    th.liquid.scale.y = Math.max(0.05, h);
  });
}

function makeWindStreamMaterial(color, baseOpacity) {
  return new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(color) }, baseOpacity: { value: baseOpacity } },
    vertexShader: `
      varying float vAlpha;
      void main() {
        vAlpha = uv.x;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float baseOpacity;
      varying float vAlpha;
      void main() {
        float fade = 1.0 - vAlpha * vAlpha;
        gl_FragColor = vec4(color, baseOpacity * fade);
      }
    `,
    transparent: true, depthWrite: false, side: THREE.DoubleSide
  });
}

function makeStreamlinePath(seed) {
  const j = seeded(seed) - 0.5;
  const flatY = -5.43 + j * 0.12;
  const pts = [];
  const n = 24;
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    let x, y, z;
    if (t < 0.22) {
      const s = t / 0.22;
      x = 10.5 - (10.5 - 8.5) * s;
      y = -4.58 - (-4.58 - flatY) * s;
      z = 1.65 - (1.65 - 0.92) * s;
    } else {
      const s = (t - 0.22) / 0.78;
      x = 8.5 - (8.5 - 3.5) * s;
      y = flatY + Math.sin(s * Math.PI * 2.0) * 0.075;
      z = 0.92 - (0.92 + 0.9) * s;
    }
    pts.push(new THREE.Vector3(x, y, z + j * 0.15));
  }
  pts.push(new THREE.Vector3(3.0, flatY + 0.30, -0.9 + j * 0.15));
  return new THREE.CatmullRomCurve3(pts);
}

function buildStreamlinePool(g) {
  for (let i = 0; i < 6; i++) {
    const geo = new THREE.TubeGeometry(makeStreamlinePath(i), 48, 0.06, 6, false);
    const mat = makeWindStreamMaterial(0xe8f4ff, 0.0);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false; mesh.visible = false; mesh.renderOrder = 6;
    mesh.userData = { active: false, startTime: 0, duration: 0.9, maxOpacity: 0.55, mat };
    g.add(mesh); evapWindLines.push(mesh);
  }
}

function emitStreamline(stagger) {
  const now = performance.now() / 1000;
  const line = evapWindLines.find(l => !l.userData.active);
  if (!line) return;
  const u = line.userData;
  u.active = true;
  u.startTime = now + (stagger || 0);
  u.maxOpacity = 0.40 + seeded(Math.floor(now * 1000) % 13) * 0.25;
  u.mat.uniforms.baseOpacity.value = 0.0;
  line.geometry.setDrawRange(0, 0);
}

function spawnRipple(stagger) {
  const r = evapRipples.find(x => !x.userData.active);
  if (!r) return;
  r.userData.active = true;
  r.userData.startTime = performance.now() / 1000 + (stagger || 0);
  r.scale.setScalar(0.4);
  r.material.opacity = 0.5;
}

function updateEvapRipples(dt) {
  const f = state.evap.factors;
  const now = performance.now() / 1000;
  if (f.fanBoost > 0.15) {
    evapRippleTimer -= dt;
    if (evapRippleTimer <= 0) { spawnRipple(); evapRippleTimer = 0.5; }
  } else {
    evapRippleTimer = 0.4;
  }
  evapRipples.forEach((r) => {
    const u = r.userData;
    if (!u.active) { r.visible = false; return; }
    const p = (now - u.startTime) / 1.0;
    if (p < 0) { r.visible = false; return; }
    if (p >= 1) { u.active = false; r.visible = false; return; }
    r.visible = true;
    r.scale.setScalar(0.4 + 1.2 * p);
    r.material.opacity = 0.5 * (1 - p);
  });
}

function lerpColor(a, b, t) {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b_ = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | b_;
}

function paperTempColor(T) {
  if (T <= 40) return 0x4caf50;
  if (T <= 100) return lerpColor(0x4caf50, 0xffeb3b, (T - 40) / 60);
  if (T <= 183) return lerpColor(0xffeb3b, 0xf44336, (T - 100) / 83);
  return 0xf44336;
}

function updateEvapPaper(dt) {
  const p = state.evap.paper;
  const t = performance.now() * 0.001;

  // match
  if (paperMatchGroup) {
    paperMatchGroup.visible = true;
    if (paperMatchHead) paperMatchHead.material.color.setHex(p.lit ? 0x221111 : 0xff3333);
  }

  // bottom flame
  if (paperFlameGroup) {
    paperFlameGroup.visible = p.lit && !p.burning;
    if (paperFlameGroup.visible) paperFlameGroup.scale.setScalar(1 + Math.sin(performance.now() * 0.006) * 0.12);
  }

  // burning fire
  if (paperFireGroup) {
    paperFireGroup.visible = p.burning;
    if (p.burning) {
      paperFireGroup.children.forEach(f => {
        const u = f.userData;
        const jitter = 0.15 * Math.sin(t * u.speed + u.phase);
        f.position.set(u.basePos.x + jitter, u.basePos.y + 0.1 * Math.sin(t * u.speed * 1.3), u.basePos.z + jitter * 0.6);
        const sc = 0.9 + 0.25 * Math.sin(t * u.speed * 2 + u.phase);
        f.scale.setScalar(sc);
      });
    }
  }

  // smoke
  if (paperSmokeParticles.length) {
    paperSmokeParticles.forEach(s => {
      s.visible = p.burning;
      if (!p.burning) return;
      const u = s.userData;
      let life = (u.life + t * 0.35) % 1;
      u.life = life;
      const y = life * 5.5;
      s.position.set(u.basePos.x + Math.sin(t + u.phase) * 0.4, u.basePos.y + y, u.basePos.z + Math.cos(t * 0.7 + u.phase) * 0.3);
      const sc = 1 + life * 3.0;
      s.scale.setScalar(sc);
      s.material.opacity = 0.55 * (1 - life);
    });
  }

  // water (water=1 visual = 2/3 box height)
  if (paperWaterMesh) {
    const water = p.water;
    paperWaterMesh.visible = water > 0.02;
    if (paperWaterMesh.visible) {
      const maxH = 3.8 * 2 / 3;
      const wh = water * maxH;
      paperWaterMesh.scale.y = wh;
      paperWaterMesh.position.y = 0.09 + wh / 2;
    }
  }

  // colored temperature progress bar
  if (paperThermoLiquid && paperThermoGroup) {
    const barH = paperThermoGroup.userData.barH;
    let h = 0.001;
    let c = 0x4caf50;
    if (p.lit) {
      const Tdisplay = (p.water > 0.02 ? Math.min(100, p.waterTemp) : Math.min(p.paperTemp, PAPER_TEMP_BAR_MAX));
      const T = Math.max(0, Tdisplay);
      h = Math.max(0.001, (T / PAPER_TEMP_BAR_MAX) * barH);
      c = paperTempColor(Tdisplay);
    }
    paperThermoLiquid.scale.y = h;
    if (paperThermoLiquid.material.map) {
      paperThermoLiquid.material.map.repeat.y = h / barH;
      paperThermoLiquid.material.map.offset.y = 0;
      paperThermoLiquid.material.map.needsUpdate = true;
    }
    paperTempBarTopLine.position.y = h;
    paperTempBarTopLine.visible = h > 0.15;
    paperTempBarTopLine.material.color.setHex(c);
  }

  // bubbles (small boil-like bubbles inside paper pot water)
  if (paperBubbles.length) {
    const showBubbles = p.water > 0 && p.lit && p.waterTemp > 60;
    const waterTop = p.water * (3.8 * 2 / 3);
    paperBubbles.forEach((b, i) => {
      b.visible = showBubbles;
      if (!showBubbles) return;
      const d = paperBubbleData[i];
      const speedMul = p.boiling ? 2.4 : 0.7;
      let y = d.y + d.speed * speedMul * dt;
      if (y > waterTop) {
        y = 0;
        d.x = (seeded(i * 11 + 7) - 0.5) * (paperBoxW - 1.0);
        d.z = (seeded(i * 11 + 8) - 0.5) * (paperBoxD - 1.0);
      }
      d.y = y;
      const prog = y / Math.max(0.001, waterTop);
      const s = 0.25 + 0.6 * prog + (p.boiling ? 0.35 * Math.sin(t * 6 + d.phase) : 0);
      b.position.set(d.x, 0.1 + y, d.z);
      b.scale.setScalar(Math.max(0.12, s));
      b.material.opacity = p.boiling ? 0.85 : 0.45;
    });
  }

  // vapor (white steam rising from box opening)
  if (paperVaporParticles.length) {
    const showVapor = p.boiling;
    const waterTop = p.water * (3.8 * 2 / 3);
    paperVaporParticles.forEach(v => {
      v.visible = showVapor;
      if (!showVapor) return;
      const u = v.userData;
      let life = (u.life + dt * 0.55) % 1;
      u.life = life;
      const lift = life * 4.0;
      v.position.set(u.basePos.x + Math.sin(t + u.phase) * 0.5, u.basePos.y + waterTop - 0.4 + lift, u.basePos.z + Math.cos(t * 0.8 + u.phase) * 0.4);
      const sc = 0.8 + life * 2.2;
      v.scale.setScalar(sc);
      v.material.opacity = 0.5 * (1 - life);
    });
  }
}

let isRotating = false, rotateStart = { x: 0, y: 0 };
function onPointerDown(e) { if (!e.target.closest('#canvas-container') || e.button !== 0) return; ensureAudioContext(); isRotating = true; rotateStart.x = e.clientX; rotateStart.y = e.clientY; pointerMoved = false; fanClickStart.x = e.clientX; fanClickStart.y = e.clientY; }
function onPointerMove(e) { if (!isRotating) return; const dx = e.clientX - rotateStart.x, dy = e.clientY - rotateStart.y; if (Math.hypot(dx, dy) > 5) pointerMoved = true; updateCameraRotation(dx, dy); rotateStart.x = e.clientX; rotateStart.y = e.clientY; }
function onPointerUp(e) { isRotating = false; if (e && e.button === 0 && !pointerMoved && e.target.closest('#canvas-container')) { checkFanClick(e.clientX, e.clientY); checkPaperMatchClick(e.clientX, e.clientY); } pointerMoved = false; }

function checkFanClick(x, y) {
  if (!fanGroup || !raycaster) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((y - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(fanGroup.children, true);
  if (hits.length > 0) {
    const f = state.evap.factors;
    f.fanBoost = Math.min(6, f.fanBoost + 1.2);
    fanAnimT = 0.34;
    triggerWindBurst();
    if (typeof playFanWhoosh === 'function') playFanWhoosh();
    if (typeof playClick === 'function') playClick();
  }
}

function checkPaperMatchClick(x, y) {
  if (!paperMatchGroup || !raycaster || state.evapSub !== 'paper') return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((y - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(paperMatchGroup.children, true);
  if (hits.length > 0) {
    state.evap.paper.lit = true;
    if (typeof playClick === 'function') playClick();
  }
}

function onHoverMove(e) {
  if (isRotating || !raycaster || evapDroplets.length < 2) { hoverDropIdx = null; return; }
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(evapDroplets);
  if (hits.length > 0) {
    hoverDropIdx = evapDroplets.indexOf(hits[0].object);
  } else {
    hoverDropIdx = null;
  }
}
function hideEvapTooltip() { hoverDropIdx = null; if (evapTooltip) evapTooltip.style.display = 'none'; }

function updateEvapTooltip() {
  if (!evapTooltip || hoverDropIdx == null || isRotating) { if (evapTooltip) evapTooltip.style.display = 'none'; return; }
  const i = hoverDropIdx;
  const f = state.evap.factors;
  const T = i === 0 ? f.ambTemp : f.temp;
  const wind = i === 0 ? f.wind : (f.wind + f.fanBoost);
  const V = f.volumes[i];
  const area = i === 0 ? 1.0 : f.area;
  evapTooltip.innerHTML = '<b>' + (i === 0 ? '对照组' : '实验组') + '</b><br>温度：' + T.toFixed(1) + ' ℃<br>剩余量：' + (V * 100).toFixed(0) + '% (' + V.toFixed(2) + ')<br>表面积：' + area.toFixed(2) + '<br>当前空气流速：' + wind.toFixed(2);
  evapTooltip.style.display = 'block';
  const drop = evapDroplets[i];
  const worldPos = new THREE.Vector3();
  drop.getWorldPosition(worldPos);
  worldPos.project(camera);
  const rect = renderer.domElement.getBoundingClientRect();
  const x = (worldPos.x * 0.5 + 0.5) * rect.width + rect.left + 16;
  const y = (-worldPos.y * 0.5 + 0.5) * rect.height + rect.top;
  evapTooltip.style.left = x + 'px';
  evapTooltip.style.top = y + 'px';
}

let pinchStartDist = 0;
function bindTouchZoom() {
  renderer.domElement.addEventListener('touchstart', e => { if (e.touches.length === 2) { const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY; pinchStartDist = Math.hypot(dx, dy); } }, { passive: false });
  renderer.domElement.addEventListener('touchmove', e => { if (e.touches.length === 2) { const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY; const dist = Math.hypot(dx, dy); if (pinchStartDist > 0) { const delta = (pinchStartDist - dist) * 0.05; cameraState.distance = THREE.MathUtils.clamp(cameraState.distance + delta, CAM_MIN_DIST, CAM_MAX_DIST); applyCameraOrbit(); } pinchStartDist = dist; e.preventDefault(); } }, { passive: false });
  renderer.domElement.addEventListener('touchend', () => { pinchStartDist = 0; });
}

function makeTextLabel(text, width, height, opts) {
  opts = opts || {};
  const cv = document.createElement('canvas');
  const cx = cv.getContext('2d');
  cx.font = opts.font ? opts.font : 'bold 28px sans-serif';
  const pad = 12;
  let cw = width, ch = height;
  if (opts.plain) {
    const m = cx.measureText(text);
    cw = Math.max(1, Math.ceil(m.width + pad * 2));
  }
  cv.width = cw; cv.height = ch;
  cx.font = opts.font ? opts.font : 'bold 28px sans-serif';
  cx.textAlign = 'center'; cx.textBaseline = 'middle';
  if (!opts.plain) {
    cx.fillStyle = opts.bg ? opts.bg : 'rgba(24,30,44,0.85)';
    cx.fillRect(0, 0, cw, ch);
    cx.strokeStyle = 'rgba(90,215,255,0.45)'; cx.lineWidth = 2; cx.strokeRect(2, 2, cw - 4, ch - 4);
  }
  cx.fillStyle = opts.color ? opts.color : '#e8f4ff';
  cx.fillText(text, cw / 2, ch / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter;
  const h = opts.h ? opts.h : 2.4;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: opts.plain ? 1.0 : 0.92, side: THREE.DoubleSide, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry((cw / ch) * h, h), mat);
  mesh.renderOrder = 20; return mesh;
}

function buildEvapScene() {
  evapGroup = new THREE.Group(); scene.add(evapGroup);
  const table = new THREE.Mesh(new THREE.BoxGeometry(80, 2, 50), new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.85 }));
  table.position.y = -8; evapGroup.add(table);
  const gFactors = new THREE.Group(); evapGroup.add(gFactors); evapSubGroups.factors = gFactors;
  const gCooling = new THREE.Group(); evapGroup.add(gCooling); evapSubGroups.cooling = gCooling;
  const gPaper = new THREE.Group(); evapGroup.add(gPaper); evapSubGroups.paper = gPaper;
  buildEvapFactors(gFactors);
  buildEvapCooling(gCooling);
  buildEvapPaper(gPaper);
}

function buildEvapFactors(g) {
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xf7f5f0, roughness: 0.35, metalness: 0, side: THREE.DoubleSide });
  const dropMat = new THREE.MeshPhysicalMaterial({ color: 0x64d8ff, transparent: true, opacity: 0.65, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false });
  const dishPoints = [new THREE.Vector2(0, 0), new THREE.Vector2(1.6, 0), new THREE.Vector2(1.9, 0.08), new THREE.Vector2(2.3, 0.5)];
  const dishGeo = new THREE.LatheGeometry(dishPoints, 48);
  const dishBottomY = -6.88;
  for (let i = 0; i < 2; i++) {
    const x = i === 0 ? -6 : 6;
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(x, dishBottomY, 0); dish.renderOrder = 2; g.add(dish);
    const drop = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), dropMat);
    const s = 1;
    drop.scale.set(1.6 * s, 0.55 * s, 1.6 * s); drop.position.set(x, dishBottomY + 0.55 * s, 0); drop.renderOrder = 3; g.add(drop);
    evapDroplets.push(drop); evapDishes.push(dish);
    const tag = makeTextLabel(i === 0 ? '对照组' : '实验组', 200, 72, { h: 1.6, font: 'bold 26px sans-serif', plain: true });
    tag.position.set(x, -4.35, 0); g.add(tag);
  }
  fanGroup = new THREE.Group(); fanGroup.position.set(12, -6.3, 2.2); g.add(fanGroup);
  fanPivot = new THREE.Group(); fanGroup.add(fanPivot);
  const fanMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, side: THREE.DoubleSide });
  const fanFace = new THREE.Mesh(new THREE.CircleGeometry(1.6, 32), fanMat);
  fanFace.rotation.x = -Math.PI / 2; fanFace.scale.set(1, 1.2, 1); fanFace.position.set(0, 1.2, 0); fanFace.renderOrder = 5; fanPivot.add(fanFace);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 12), new THREE.MeshStandardMaterial({ color: 0x5d4037 }));
  handle.rotation.set(Math.PI / 2, 0, 0); handle.position.set(0, 1.2, 2.8); fanPivot.add(handle);
  fanGroup.rotation.y = Math.PI / 2;
  buildStreamlinePool(g);
  evapWindBurst = { active: false, startTime: 0, duration: 0.95 };
  const rippleGeo = new THREE.RingGeometry(0.9, 1.0, 40);
  const rippleMat = new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(rippleGeo, rippleMat.clone());
    r.rotation.x = -Math.PI / 2;
    r.position.set(6.6, -5.72, 0.2);
    r.renderOrder = 5;
    r.visible = false;
    r.userData = { active: false, startTime: 0 };
    g.add(r); evapRipples.push(r);
  }
  for (let i = 0; i < 12; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: 0xcceeff, transparent: true, opacity: 0.5, depthWrite: false }));
    p.userData = { side: i % 2, baseX: (i % 2 === 0 ? -6 : 6) + (seeded(i * 3) - 0.5) * 2.2, baseZ: (seeded(i * 3 + 1) - 0.5) * 1.6, speed: 0.8 + seeded(i * 3 + 2) * 1.2, phase: seeded(i * 3 + 2) * 10 };
    p.renderOrder = 4; g.add(p); evapVapor.push(p);
  }
}

function buildEvapCooling(g) {
  const xSpan = 3.9;
  for (let i = 0; i < 2; i++) {
    const t = new THREE.Group(); t.position.set(i === 0 ? -xSpan : xSpan, -5, 0); g.add(t);
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.48, side: THREE.DoubleSide, depthWrite: false });
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 6, 16, 1, true), glassMat);
    tube.position.y = 3; tube.renderOrder = 4; t.add(tube);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), new THREE.MeshStandardMaterial({ color: 0xff3333 }));
    bulb.position.y = 0.3; t.add(bulb);
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 12).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ color: 0xff1a1a }));
    liq.position.y = 0.6; t.add(liq);
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 2048;
    const cx = cv.getContext('2d');
    cx.fillStyle = '#f5f5f5';
    cx.fillRect(0, 0, 1024, 2048);
    cx.strokeStyle = '#1a1a1a';
    cx.fillStyle = '#1a1a1a';
    cx.textAlign = 'left';
    cx.textBaseline = 'middle';
    const majorLabels = [0, 10, 20, 30, 40, 50];
    for (let T = -10; T <= 60; T++) {
      const y = 60 + (1 - (T + 10) / 70) * 1928;
      const major = T % 10 === 0;
      cx.lineWidth = major ? 6 : 4;
      cx.beginPath(); cx.moveTo(major ? 760 : 840, y); cx.lineTo(1000, y); cx.stroke();
    }
    cx.font = 'bold 120px sans-serif';
    for (const T of majorLabels) {
      const y = 60 + (1 - (T + 10) / 70) * 1928;
      cx.fillText(String(T), 40, y);
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const stripW = 0.9;
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(stripW, 5.2), new THREE.MeshBasicMaterial({ map: tex, side: THREE.FrontSide, transparent: true }));
    strip.position.set(0, 3.2, -0.145); t.add(strip);
    const strip2 = strip.clone(); strip2.rotation.y = Math.PI; strip2.position.set(0, 3.2, 0.145); t.add(strip2);
    coolThermometers.push({ group: t, liquid: liq, baseY: 0.6 });
  }
}

function buildEvapPaper(g) {
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.9, side: THREE.DoubleSide, depthWrite: false });
  const boxW = 6, boxH = 3.8, boxD = 4.2;
  paperBoxW = boxW; paperBoxD = boxD;
  const pot = new THREE.Group(); pot.position.set(0, -6.2, 0); g.add(pot);
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(boxW, 0.18, boxD), paperMat); bottom.position.y = 0; bottom.renderOrder = 3; pot.add(bottom);
  for (const s of [[1, 0, 0, boxD], [-1, 0, 0, boxD], [0, 0, 1, boxW], [0, 0, -1, boxW]]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(s[0] ? 0.18 : boxW, boxH, s[2] ? 0.18 : boxD), paperMat);
    wall.position.set(s[0] * (boxW / 2 - 0.09), boxH / 2, s[2] * (boxD / 2 - 0.09)); wall.renderOrder = 3; pot.add(wall);
  }
  paperPotMesh = pot;

  const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x64d8ff, transparent: true, opacity: 0.5, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false });
  paperWaterMesh = new THREE.Mesh(new THREE.BoxGeometry(boxW - 0.4, 1, boxD - 0.4), waterMat);
  paperWaterMesh.position.set(0, 0.09 + (boxH * 2 / 3) / 2, 0); paperWaterMesh.renderOrder = 2; pot.add(paperWaterMesh);

  const fire = new THREE.Group(); fire.position.set(0, -7.15, boxD / 2 + 0.55); g.add(fire); paperFlameGroup = fire;
  const fScale = 1.6;
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.34 * fScale, 24), new THREE.MeshBasicMaterial({ color: 0xff5722, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = -0.15 * fScale; disc.renderOrder = 0; fire.add(disc);
  const innerCone = new THREE.Mesh(new THREE.ConeGeometry(0.28 * fScale, 1.1 * fScale, 14), new THREE.MeshBasicMaterial({ color: 0xffcc80, transparent: true, opacity: 0.9, depthWrite: false }));
  innerCone.position.set(0, 0.25 * fScale, 0); innerCone.userData.inner = true; innerCone.renderOrder = 0; fire.add(innerCone);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.22 * fScale, 0.9 * fScale, 12), new THREE.MeshBasicMaterial({ color: 0xff5722, transparent: true, opacity: 0.72, depthWrite: false }));
    c.position.set(Math.cos(a) * 0.26 * fScale, 0.18 * fScale, Math.sin(a) * 0.26 * fScale);
    c.rotation.x = Math.PI / 10; c.renderOrder = 0; fire.add(c);
  }
  fire.visible = false;

  // match (front center ground, head toward box bottom)
  paperMatchGroup = new THREE.Group();
  paperMatchGroup.position.set(0.9, -6.80, boxD / 2 + 4.1);
  paperMatchGroup.rotation.y = Math.PI;
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 12), new THREE.MeshStandardMaterial({ color: 0xe8dcca, roughness: 0.9 }));
  stick.rotation.x = Math.PI / 2; stick.position.set(0, 0, 1.6); paperMatchGroup.add(stick);
  paperMatchHead = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.6 }));
  paperMatchHead.position.set(0, 0, 3.2); paperMatchHead.userData.isMatch = true; paperMatchGroup.add(paperMatchHead);
  g.add(paperMatchGroup);

  // colored temperature progress bar (hollow frame + bottom-up fill + ticks)
  paperThermoGroup = new THREE.Group();
  paperThermoGroup.position.set(-boxW / 2 - 1.8, -6.2, 0.6);
  paperThermoGroup.userData = { barH: 6.8 };
  const barW = 0.55, barH = 6.8, border = 0.06;
  const frameMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
  const frameBox = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat);
    m.position.set(x, y, z); m.renderOrder = 10; paperThermoGroup.add(m);
  };
  frameBox(barW, border, 0.18, 0, 0, 0);                       // bottom
  frameBox(barW, border, 0.18, 0, barH, 0);                    // top
  frameBox(border, barH, 0.18, -barW / 2 + border / 2, barH / 2, 0); // left
  frameBox(border, barH, 0.18, barW / 2 - border / 2, barH / 2, 0);  // right

  const gradCanvas = document.createElement('canvas'); gradCanvas.width = 64; gradCanvas.height = 1024;
  const gcx = gradCanvas.getContext('2d');
  const grad = gcx.createLinearGradient(0, gradCanvas.height, 0, 0);
  grad.addColorStop(0.0, '#4caf50');
  grad.addColorStop(0.5, '#ffeb3b');
  grad.addColorStop(0.915, '#f44336');
  grad.addColorStop(1.0, '#f44336');
  gcx.fillStyle = grad; gcx.fillRect(0, 0, 64, 1024);
  const barTex = new THREE.CanvasTexture(gradCanvas);
  barTex.wrapS = THREE.ClampToEdgeWrapping; barTex.wrapT = THREE.ClampToEdgeWrapping;
  barTex.magFilter = THREE.LinearFilter; barTex.minFilter = THREE.LinearFilter;
  paperThermoLiquid = new THREE.Mesh(
    new THREE.BoxGeometry(barW - border * 2, 1, 0.12).translate(0, 0.5, 0),
    new THREE.MeshBasicMaterial({ map: barTex, transparent: true, opacity: 0.98, depthWrite: false })
  );
  paperThermoLiquid.position.set(0, 0, 0); paperThermoGroup.add(paperThermoLiquid);
  paperThermoLiquid.scale.y = 0.001;

  paperTempBarTopLine = new THREE.Mesh(
    new THREE.BoxGeometry(barW * 0.85, 0.06, 0.2),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  paperTempBarTopLine.position.y = 0; paperTempBarTopLine.visible = false; paperThermoGroup.add(paperTempBarTopLine);

  const tickMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
  const addTick = (T, text) => {
    const y = barH * (T / PAPER_TEMP_BAR_MAX);
    const tick = new THREE.Mesh(new THREE.BoxGeometry(barW * 1.4, 0.06, 0.24), tickMat);
    tick.position.set(0, y, 0.12); paperThermoGroup.add(tick);
    const lbl = makeTextLabel(text, 360, 90, { h: 0.85, font: 'bold 42px sans-serif', color: '#e8f4ff', plain: true });
    const labelW = lbl.geometry.parameters.width;
    const tickLeft = -barW * 1.4 / 2;
    const rightEdge = tickLeft - 0.15;
    lbl.position.set(rightEdge - labelW / 2, y, 0.18); paperThermoGroup.add(lbl);
  };
  addTick(100, '100℃水沸点');
  addTick(183, '183℃燃点');
  g.add(paperThermoGroup);

  // top fire
  paperFireGroup = new THREE.Group();
  paperFireGroup.position.set(0, -6.2 + boxH, 0);
  for (let i = 0; i < 5; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0xffcc80 : 0xff5722, transparent: true, opacity: 0.85, depthWrite: false });
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.35 + seeded(i * 5) * 0.25, 0.9 + seeded(i * 5 + 1) * 0.7, 8), mat);
    f.position.set((seeded(i * 5 + 2) - 0.5) * 2.2, seeded(i * 5 + 3) * 0.4, (seeded(i * 5 + 4) - 0.5) * 1.6);
    f.userData = { basePos: f.position.clone(), phase: seeded(i * 5) * Math.PI * 2, speed: 2 + seeded(i * 5 + 1) * 3 };
    f.renderOrder = 6; paperFireGroup.add(f);
  }
  paperFireGroup.visible = false; g.add(paperFireGroup);

  // smoke
  const smokeMat = new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.55, depthWrite: false });
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.2 + seeded(i * 7) * 0.25, 8, 8), smokeMat.clone());
    s.position.set((seeded(i * 7 + 1) - 0.5) * 3.0, -6.2 + boxH + seeded(i * 7 + 2) * 2.0, (seeded(i * 7 + 3) - 0.5) * 2.0);
    s.userData = { basePos: s.position.clone(), speed: 0.8 + seeded(i * 7 + 4) * 1.2, phase: seeded(i * 7 + 5) * Math.PI * 2, life: seeded(i * 7 + 6) };
    s.renderOrder = 7; s.visible = false; g.add(s); paperSmokeParticles.push(s);
  }

  // water bubbles
  const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false });
  for (let i = 0; i < 8; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.08 + seeded(i * 11) * 0.06, 8, 8), bubbleMat.clone());
    b.renderOrder = 3; b.visible = false; g.add(b);
    paperBubbles.push(b);
    paperBubbleData.push({ x: (seeded(i * 11 + 1) - 0.5) * (boxW - 1.0), z: (seeded(i * 11 + 2) - 0.5) * (boxD - 1.0), y: seeded(i * 11 + 3), speed: 0.8 + seeded(i * 11 + 4) * 1.2, phase: seeded(i * 11 + 5) * Math.PI * 2 });
  }

  // vapor
  const vaporMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false });
  for (let i = 0; i < 10; i++) {
    const v = new THREE.Mesh(new THREE.SphereGeometry(0.12 + seeded(i * 13) * 0.12, 6, 6), vaporMat.clone());
    v.position.set((seeded(i * 13 + 1) - 0.5) * 3.0, -6.2 + boxH + 0.2 + seeded(i * 13 + 2) * 1.0, (seeded(i * 13 + 3) - 0.5) * 2.0);
    v.userData = { basePos: v.position.clone(), speed: 0.5 + seeded(i * 13 + 4) * 0.8, phase: seeded(i * 13 + 5) * Math.PI * 2, life: seeded(i * 13 + 6) };
    v.renderOrder = 7; v.visible = false; g.add(v); paperVaporParticles.push(v);
  }

}

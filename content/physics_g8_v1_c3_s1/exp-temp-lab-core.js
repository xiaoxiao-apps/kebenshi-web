/* exp-temp-lab-core.js — 温度实验室 阶段一 核心物理与 3D 场景 */
/* eslint-env browser */

// ===== Physical constants (must be greppable) =====
const C_WATER = 4200; // J/(kg·℃) 水比热容
const RHO_WATER = 1000; // kg/m³ 水密度
const C_ICE = 2100; // J/(kg·℃) 冰比热容
const LAM_ICE = 3.34e5; // J/kg 冰熔化潜热
const ETA_HEAT = 0.8; // 加热效率
const BOIL_TEMP = 100; // ℃ 标准大气压沸水
const ICE_TEMP = 0; // ℃
const TIME_SCALE = 60; // 默认时间倍率（state.timeScale 初始值；模拟时间 = 真实时间 × timeScale）
const K_MIX = 10; // W/℃ 水-冰混合传热系数
const ICE_CUBE_G = 10; // 每块冰 10g（加冰按块数增加，物理总质量 state.iceMass 照旧累计）

// ===== Initial state =====
const INITIAL = {
  waterTemp: 20,
  ambTemp: 20,
  volumeML: 200,
  heatPower: 0,
  heating: false,
  iceMass: 0,
  simTime: 0,
  timeScale: 60
};

let state = {
  waterTemp: INITIAL.waterTemp,
  ambTemp: INITIAL.ambTemp,
  volumeML: INITIAL.volumeML,
  heatPower: INITIAL.heatPower,
  heating: INITIAL.heating,
  iceMass: INITIAL.iceMass,
  simTime: INITIAL.simTime,
  timeScale: INITIAL.timeScale,
  dataLog: []
};

let paused = true; // 初始暂停，等用户点继续 (R2-A F)
let lastPhysicsTime = performance.now();

let scene, camera, renderer;
let waterMesh, beakerMesh, heaterMesh, flameMesh, flameDisc;
let iceCubes = [];
const iceCubeGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
const iceCubeMat = new THREE.MeshPhysicalMaterial({
  color: 0xe1f5fe, transparent: true, opacity: 0.85, roughness: 0.2
});
const SCENE_CENTER = new THREE.Vector3(0, -1.5, 0);
const CAM_MIN_DIST = 25, CAM_MAX_DIST = 80;
let cameraState = { distance: 55, azimuth: 0.5, polar: Math.PI / 3 };

let thermometers = [];
let selectedThermometer = null;
let nextThermId = 1;

function resetState() {
  state.waterTemp = INITIAL.waterTemp;
  state.ambTemp = INITIAL.ambTemp;
  state.volumeML = INITIAL.volumeML;
  state.heatPower = INITIAL.heatPower;
  state.heating = INITIAL.heating;
  state.iceMass = INITIAL.iceMass;
  state.simTime = INITIAL.simTime;
  state.timeScale = INITIAL.timeScale;
  state.dataLog = [];
  thermometers.forEach(t => { if (scene && t.meshGroup) scene.remove(t.meshGroup); });
  thermometers = [];
  selectedThermometer = null;
  nextThermId = 1;
  if (scene) iceCubes.forEach(c => scene.remove(c));
  iceCubes = [];
}

function waterMassKg() { return (state.volumeML / 1e6) * RHO_WATER; }

function beakerWaterHeight() {
  return 1.2 + (state.volumeML - 100) / 300 * 3.2; // 100mL→1.2，400mL→4.4
}

function stepPhysics(dtReal) {
  if (paused) return;
  const dt = dtReal * state.timeScale;
  state.simTime += dt;
  state.dataLog.push({ t: state.simTime, T: state.waterTemp });
  if (state.dataLog.length > 6000) state.dataLog.shift();

  const mWater = waterMassKg();
  const kCool = 1.5; // W/℃ 整体散热系数（500W 可烧沸：稳态ΔT=400/1.5≈267℃>80℃；冷却 tau≈9s 真实时间可见）
  const powerIn = state.heating ? state.heatPower * ETA_HEAT : 0;
  let dTwater = (powerIn / (mWater * C_WATER)) * dt - (kCool / (mWater * C_WATER)) * (state.waterTemp - state.ambTemp) * dt;

  if (state.heating && state.waterTemp >= BOIL_TEMP) {
    dTwater = 0;
    state.waterTemp = BOIL_TEMP;
  }

  if (state.iceMass > 0) {
    // 水-冰混合传热：P_mix = K_MIX × (水温-0℃)；dt 为模拟秒，P_mix*dt 即焦耳
    const P_mix = K_MIX * Math.max(0, state.waterTemp - 0);
    dTwater -= P_mix * dt / (mWater * C_WATER);
    const meltKg = P_mix * dt / LAM_ICE;
    state.iceMass = Math.max(0, state.iceMass - meltKg * 1000); // iceMass 单位 g
    state.waterTemp += dTwater;
    if (state.iceMass > 0 && state.waterTemp < 0) state.waterTemp = 0; // 冰存在时水温不低于 0℃
  } else {
    state.waterTemp += dTwater;
  }

  if (!state.heating && state.iceMass <= 0 && Math.abs(state.waterTemp - state.ambTemp) > 0.01) {
    const tau = 120;
    state.waterTemp += (state.ambTemp - state.waterTemp) * (1 - Math.exp(-dt / tau));
  }

  // Global safety clamp
  state.waterTemp = Math.max(-30, Math.min(100, state.waterTemp));
}

// ===== Scene setup =====
function initScene() {
  const container = document.getElementById('canvas-container');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a24);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 26, 48);
  camera.lookAt(SCENE_CENTER);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.7);
  dir.position.set(20, 40, 20);
  scene.add(dir);
  const back = new THREE.DirectionalLight(0xffffff, 0.3);
  back.position.set(-20, 20, -20);
  scene.add(back);

  buildTable();
  buildBeakerAndWater();
  buildHeater();
  buildIce();
  buildFlame();
  buildBubbles();
  applyCameraOrbit();
}

function buildTable() {
  const geo = new THREE.BoxGeometry(80, 2.4, 60); // 加厚，顶面 = -6.2
  const mat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });
  tableMesh = new THREE.Mesh(geo, mat);
  tableMesh.position.y = -7.4; // 顶面 -7.4 + 1.2 = -6.2
  scene.add(tableMesh);
}

function buildBeakerAndWater() {
  const beakerGeo = new THREE.CylinderGeometry(4.8, 4.8, 7, 32, 1, true);
  const beakerMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaccff, transparent: true, opacity: 0.25,
    roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false
  });
  beakerMesh = new THREE.Mesh(beakerGeo, beakerMat);
  beakerMesh.position.y = -1.5; // 杯底坐 -5.0，杯高 7 → 杯口 +2.0
  scene.add(beakerMesh);
  const edgeGeo = new THREE.TorusGeometry(4.8, 0.05, 8, 32); // 杯口 torus 半径与杯口一致
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x88aaff });
  const edge = new THREE.Mesh(edgeGeo, edgeMat);
  edge.rotation.x = Math.PI / 2;
  edge.position.y = 2.0; // 杯口
  scene.add(edge);
  updateWaterMesh();
}

function updateWaterMesh() {
  const h = beakerWaterHeight();
  if (!waterMesh) {
    const geo = new THREE.CylinderGeometry(4.55, 4.55, 1, 32);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x64d8ff, transparent: true, opacity: 0.55,
      roughness: 0.15, metalness: 0.1, side: THREE.DoubleSide,
      emissive: 0x114455
    });
    waterMesh = new THREE.Mesh(geo, mat);
    scene.add(waterMesh);
  }
  waterMesh.scale.y = h;
  waterMesh.position.y = -4.9 + h / 2; // 水柱底贴杯内底 -4.9
}

function buildHeater() {
  const geo = new THREE.CylinderGeometry(5.0, 5.0, 0.8, 24); // 中心 -5.8 → 顶面 -5.4，托住放大后的杯
  const mat = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.6 });
  heaterMesh = new THREE.Mesh(geo, mat);
  heaterMesh.position.set(0, -5.8, 0);
  scene.add(heaterMesh);
}

function buildIce() {
  iceCubes = []; // 多块独立冰方案：不再建单个 iceMesh，addIce 时 spawnIceCube
}

function spawnIceCube() {
  const cube = new THREE.Mesh(iceCubeGeo, iceCubeMat);
  const a = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * 3.6; // 烧杯内半径~4.55，留余量绝不超壁
  cube.position.set(Math.cos(a) * r, -4.9 + beakerWaterHeight() - 0.4, Math.sin(a) * r);
  cube.rotation.y = Math.random() * Math.PI;
  iceCubes.push(cube);
  scene.add(cube);
}

function updateIceCubes() {
  if (state.iceMass <= 0) {
    while (iceCubes.length) scene.remove(iceCubes.pop());
    return;
  }
  const target = Math.round(state.iceMass / ICE_CUBE_G);
  while (iceCubes.length > target) scene.remove(iceCubes.pop()); // 熔化减少
  const y = -4.9 + beakerWaterHeight() - 0.4; // 随水面浮动
  iceCubes.forEach(c => { c.position.y = y; });
}

function buildFlame() {
  // 火焰组：原点设在锥尖线 y=-5.0（杯底），UI 的 scale 闪烁动画永不会把火焰顶到 -5.0 以上
  flameMesh = new THREE.Group();
  flameMesh.position.y = -5.0;
  // 8 个小锥体（r=0.35 h=0.9）环形分布半径 2.2：锥尖局部 y=0（世界 -5.0），锥体向下至 -0.9（世界 -5.9，下半埋在座顶 -5.4 内）
  const coneGeo = new THREE.ConeGeometry(0.35, 0.9, 8);
  const coneMat = new THREE.MeshBasicMaterial({ color: 0xff5722, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const c = new THREE.Mesh(coneGeo, coneMat);
    c.position.set(Math.cos(a) * 2.2, -0.45, Math.sin(a) * 2.2);
    flameMesh.add(c);
  }
  // 座顶红色发光 disc（平放，世界 y=-5.38）：不入组，避免 UI 对 flameMesh 的 scale 闪烁把它压到座顶面以下产生 z 闪烁
  const discGeo = new THREE.CircleGeometry(2.6, 32);
  const discMat = new THREE.MeshBasicMaterial({ color: 0xff3d00, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  flameDisc = new THREE.Mesh(discGeo, discMat);
  flameDisc.rotation.x = -Math.PI / 2;
  flameDisc.position.y = -5.38;
  flameDisc.visible = false;
  scene.add(flameDisc);
  flameMesh.visible = false;
  scene.add(flameMesh); // setHeating 控制 flameMesh/flameDisc 的 visible
}

function applyCameraOrbit() {
  const r = cameraState.distance;
  const phi = cameraState.polar;
  const theta = cameraState.azimuth;
  const x = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  camera.position.set(x, y, z);
  camera.lookAt(SCENE_CENTER);
}

function updateCameraRotation(dx, dy) {
  cameraState.azimuth -= dx * 0.005;
  const newPolar = cameraState.polar - dy * 0.005;
  const minPolar = 5 * Math.PI / 180;
  const maxPolar = 85 * Math.PI / 180;
  cameraState.polar = Math.max(minPolar, Math.min(maxPolar, newPolar));
  applyCameraOrbit();
}

function onWheel(e) {
  e.preventDefault();
  cameraState.distance = THREE.MathUtils.clamp(cameraState.distance + e.deltaY * 0.05, CAM_MIN_DIST, CAM_MAX_DIST);
  applyCameraOrbit();
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function addIce() {
  state.iceMass += ICE_CUBE_G;
  spawnIceCube();
  playSplash();
}

let bubbles = [];
function buildBubbles() {
  const geo = new THREE.SphereGeometry(1, 8, 8); // 单位球，尺寸靠 scale 0.18~0.3 控制
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
  for (let i = 0; i < 15; i++) {
    const b = new THREE.Mesh(geo, mat);
    b.visible = false;
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 4.0; // 水柱内半径 <4.0（放大后杯内径~4.55）
    b.position.set(Math.cos(a) * r, -4.7, Math.sin(a) * r);
    b.scale.setScalar(0.18 + Math.random() * 0.12);
    scene.add(b);
    bubbles.push({ mesh: b, speed: 0.7 + Math.random() * 0.9, phase: Math.random() });
  }
}

function updateBubbles(dt) {
  const boiling = state.heating && state.waterTemp >= 99.5;
  const waterTopY = -4.9 + beakerWaterHeight(); // 水面
  const y0 = -4.7; // 杯底起点
  const y1 = waterTopY - 0.1; // 水面下 0.1 终点
  bubbles.forEach(b => {
    if (!boiling) { b.mesh.visible = false; return; }
    b.mesh.visible = true;
    b.phase += dt * b.speed;
    if (b.phase >= 1) { // 到顶后循环：重新随机 x,z（半径<4.0）与尺寸
      b.phase -= 1;
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 4.0;
      b.mesh.position.x = Math.cos(a) * r;
      b.mesh.position.z = Math.sin(a) * r;
      b.mesh.scale.setScalar(0.18 + Math.random() * 0.12);
    }
    b.mesh.position.y = y0 + b.phase * (y1 - y0);
  });
  return boiling;
}

function setHeating(on) {
  state.heating = on;
  if (flameMesh) flameMesh.visible = on;
  if (flameDisc) flameDisc.visible = on;
}

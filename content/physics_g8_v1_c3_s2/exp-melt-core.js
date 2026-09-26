/* exp-melt-core.js — 熔化凝固探究馆 核心物理与 3D 场景 [r5i] */
/* eslint-env browser */

const SAMPLE_DEFS = {
  hypo: {
    name: '海波', kind: 'crystal', meltingPoint: 48,
    colorSolid: 0xf5f5f5, colorLiquid: 0xe8f4f8,
    latentHeat: 2.2e5, cSolid: 1500, cLiquid: 2400
  },
  paraffin: {
    name: '石蜡', kind: 'amorph', softStart: 50, softEnd: 70,
    colorSolid: 0xfaf3e0, colorLiquid: 0xf5e6c8,
    latentHeat: 0, cSolid: 2100, cLiquid: 2500
  },
  ice: {
    name: '冰', kind: 'crystal', meltingPoint: 0,
    colorSolid: 0xd6f0ff, colorLiquid: 0x88ccff,
    latentHeat: 3.34e5, cSolid: 2100, cLiquid: 4180
  }
};

const FIRE_POWER = { low: 80, medium: 150, high: 260 };
const AMOUNT_KG = { small: 0.015, medium: 0.030, large: 0.060 };
const BATH_MAX_TEMP = 100;
const KSAMPLE = 3.5;
const KCOOL = 1.5;           // 样品直接向环境散热系数（熄灯冷却用）
const KBATH_LOSS = 1.2;      // 烧杯向环境散热系数

const BEAKER_R = 3.4, BEAKER_H = 8.5, BATH_H = 6.2;
const BATH_BOTTOM_Y = 1.8;

const IRON_X = -8.5;
const BASE_CX = 0; // 底座中心与立杆解耦
const BASE_W = 22, BASE_D = 12;
const RING_Y = 1.2;
const MID_Y = 11.5;
const TOP_Y = 20.2;
const TUBE_X = 0.0;
const TUBE_R = 0.6;
const TUBE_H = 11.4;
const TUBE_CENTRE_Y = 8.9;
const THERMO_X = 0.0;
const THERMO_Y = 4.5;

const SAMPLE_HEIGHT = 2.6;
const SAMPLE_RADIUS = 0.5;
const SAMPLE_BOTTOM_Y = TUBE_CENTRE_Y - TUBE_H / 2 + 0.15;
const SAMPLE_CENTRE_Y = SAMPLE_BOTTOM_Y + SAMPLE_HEIGHT / 2;
const ROD_TOP_Y = 21.2;

const FLAME_PROFILE = {
  high:   { base: 1.20, inner: 0xfff3e0, outer: 0xff5722, disc: 0xff3d00, discOp: 0.60 },
  medium: { base: 0.85, inner: 0xffcc80, outer: 0xff7043, disc: 0xff5722, discOp: 0.50 },
  low:    { base: 0.55, inner: 0xbf360c, outer: 0x5d1910, disc: 0x8d2800, discOp: 0.35 }
};

const INITIAL = {
  mode: 'melt',
  sample: 'hypo', fire: 'medium', ambTemp: 25, amount: 'medium', timeScale: 60,
  sampleTemp: 25, bathTemp: 25, meltedFrac: 0,
  heating: false, simTime: 0, lastRecordTime: -1,
  dataLog: [], phaseName: '固态',
  plateauAnnounced: false,
  fullyMeltedAnnounced: false,
  paraffinHeatAnnounced: false,
  paraffinFreezeAnnounced: false,
  freezeAnnotationShown: false
};

let state = JSON.parse(JSON.stringify(INITIAL));
let paused = true;
let lastPhysicsTime = performance.now();
let scene, camera, renderer;
let bathMesh, bathTopDisc, boilBubbles, sampleMesh, sampleLiquid, sampleSurfaceRing, sampleSurfaceDisc, sampleBlock, thermoLiquid, thermoGroup;
let boilBubbleData = [];
let flameGroup, flameDisc;
let flameCones = [];
let flameBaseScale = 1;
let particleData = [];
let toastTimer = null;

let cameraState = { distance: 60, azimuth: 0.45, polar: Math.PI / 3.0 };
const CAM_MIN_DIST = 22, CAM_MAX_DIST = 90;
const SCENE_CENTER = new THREE.Vector3(0, 7.0, 0);

function markMain(...objs) {
  objs.forEach(o => { if (o) o.userData.mainApparatus = true; });
}
function setMainApparatusVisible(v) {
  if (!scene) return;
  scene.traverse(obj => { if (obj.userData && obj.userData.mainApparatus) obj.visible = v; });
  updateSampleVisual();
}
function resetState() {
  state = JSON.parse(JSON.stringify(INITIAL));
  state.sampleTemp = state.ambTemp;
  state.bathTemp = state.ambTemp;
  state.mode = 'melt';
  paused = true;
  hideToast();
  updateSampleVisual();
  updateThermometerLiquid();
  updateFlame();
}

function resetPhysics() {
  state.sampleTemp = state.ambTemp;
  state.bathTemp = state.ambTemp;
  state.meltedFrac = 0;
  state.heating = false;
  state.simTime = 0;
  state.lastRecordTime = -1;
  state.phaseName = '固态';
  state.plateauAnnounced = false;
  state.fullyMeltedAnnounced = false;
  state.mode = 'melt';
  state.paraffinHeatAnnounced = false;
  state.paraffinFreezeAnnounced = false;
  state.freezeAnnotationShown = false;
  paused = true;
  stopBoil();
  hideToast();
  applyInitialPhase();
  updateThermometerLiquid();
  updateFlame();
}

function sampleDef() { return SAMPLE_DEFS[state.sample]; }
function sampleMass() { return AMOUNT_KG[state.amount]; }
function fireWatts() { return FIRE_POWER[state.fire]; }

function phaseForCrystal(T, frac) {
  if (frac <= 0) return '固态';
  if (frac >= 1) return '液态';
  return '固液共存';
}

function phaseForParaffin(T) {
  if (T < 50) return '固态';
  if (T > 70) return '液态';
  if (state.mode === 'freeze') return '变稠变硬';
  return '变软变稀';
}

function updatePhaseName() {
  const def = sampleDef();
  if (def.kind === 'crystal') state.phaseName = phaseForCrystal(state.sampleTemp, state.meltedFrac);
  else state.phaseName = phaseForParaffin(state.sampleTemp);
}

function applyInitialPhase() {
  const def = sampleDef();
  if (def.kind === 'crystal') {
    state.meltedFrac = state.ambTemp > def.meltingPoint ? 1 : 0;
  }
  updatePhaseName();
  updateSampleVisual();
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

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.85);
  dir.position.set(15, 30, 15);
  scene.add(dir);
  const fill = new THREE.DirectionalLight(0xffffff, 0.40);
  fill.position.set(-12, 20, -10);
  scene.add(fill);
  const back = new THREE.DirectionalLight(0xaaccff, 0.30);
  back.position.set(-15, 15, -15);
  scene.add(back);

  buildTable();
  buildIronStand();
  buildBeaker();
  buildTestTube();
  buildThermometer();
  buildLamp();
  setMainApparatusVisible(true);
  applyCameraOrbit();
}

function buildTable() {
  const geo = new THREE.BoxGeometry(80, 2, 50);
  const mat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.85 });
  const table = new THREE.Mesh(geo, mat);
  table.position.y = -8;
  scene.add(table);
}

function buildIronStand() {
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x3d3d45, metalness: 0.55, roughness: 0.45 });

  // 底座：立杆位于约1/4靠左处，底座大部分伸向右侧
  const base = new THREE.Mesh(new THREE.BoxGeometry(BASE_W, 1.0, BASE_D), darkMetal);
  base.position.set(BASE_CX, -6.5, 0);
  scene.add(base);

  // 立杆：加长到顶约 ROD_TOP_Y，支撑上横杆
  const rodH = ROD_TOP_Y + 9.5;
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, rodH, 16), darkMetal);
  rod.position.set(IRON_X, rodH / 2 - 9, 0);
  scene.add(rod);

  // 下横杆：连铁圈
  const armLowLen = Math.abs(IRON_X) + 1.5;
  const armLow = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, armLowLen, 16), darkMetal);
  armLow.rotation.z = Math.PI / 2;
  armLow.position.set(IRON_X + armLowLen / 2, RING_Y, 0);
  scene.add(armLow);

  // 铁圈
  const ring = new THREE.Mesh(new THREE.TorusGeometry(BEAKER_R + 0.3, 0.12, 8, 32), darkMetal);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, RING_Y, 0);
  scene.add(ring);

  // 石棉网（金属丝网）
  const gauzeMat = new THREE.MeshStandardMaterial({
    color: 0x888899, metalness: 0.35, roughness: 0.7, wireframe: true
  });
  const gauze = new THREE.Mesh(new THREE.CylinderGeometry(BEAKER_R + 0.45, BEAKER_R + 0.45, 0.06, 32, 1, true), gauzeMat);
  gauze.position.set(0, RING_Y + 0.05, 0);
  scene.add(gauze);

  // 陶瓷网片（中间圆片）
  const ceramic = new THREE.Mesh(
    new THREE.CylinderGeometry(BEAKER_R - 0.05, BEAKER_R - 0.05, 0.06, 32),
    new THREE.MeshStandardMaterial({ color: 0xcdc5b8, roughness: 0.9 })
  );
  ceramic.position.set(0, RING_Y + 0.08, 0);
  scene.add(ceramic);

  // 中横杆：夹试管，高出烧杯口
  const armMidLen = Math.abs(IRON_X) + TUBE_X + 1.0;
  const armMid = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, armMidLen, 16), darkMetal);
  armMid.rotation.z = Math.PI / 2;
  armMid.position.set(IRON_X + armMidLen / 2, MID_Y, 0);
  scene.add(armMid);

  const clampMidW = TUBE_R * 1.8;
  const clampMid = new THREE.Mesh(new THREE.BoxGeometry(clampMidW, 0.25, clampMidW * 0.8), darkMetal);
  clampMid.position.set(TUBE_X, MID_Y, 0);
  scene.add(clampMid);
  const clampRingMid = new THREE.Mesh(new THREE.TorusGeometry(TUBE_R * 1.25, 0.08, 8, 24), darkMetal);
  clampRingMid.rotation.x = Math.PI / 2;
  clampRingMid.position.set(TUBE_X, MID_Y, 0);
  scene.add(clampRingMid);

  // 上横杆：悬吊温度计，贴近立杆顶部
  const armTopLen = Math.abs(IRON_X) + THERMO_X + 0.5;
  const armTop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, armTopLen, 16), darkMetal);
  armTop.rotation.z = Math.PI / 2;
  armTop.position.set(IRON_X + armTopLen / 2, TOP_Y, 0);
  scene.add(armTop);

  const clampTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.7), darkMetal);
  clampTop.position.set(THERMO_X, TOP_Y, 0);
  scene.add(clampTop);
  const clampRingTop = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 8, 20), darkMetal);
  clampRingTop.rotation.x = Math.PI / 2;
  clampRingTop.position.set(THERMO_X, TOP_Y, 0);
  scene.add(clampRingTop);

  markMain(base, rod, armLow, ring, gauze, ceramic, armMid, clampMid, clampRingMid,
           armTop, clampTop, clampRingTop);
}

function buildBeaker() {
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaccff, transparent: true, opacity: 0.22,
    roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false
  });
  const rimY = BATH_BOTTOM_Y + BEAKER_H;

  // 直壁玻璃筒
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(BEAKER_R, BEAKER_R, BEAKER_H, 40, 1, true),
    glassMat
  );
  wall.position.set(0, rimY - BEAKER_H / 2, 0);
  scene.add(wall);
  wall.renderOrder = 1;

  // 杯口边缘环
  const edge = new THREE.Mesh(
    new THREE.TorusGeometry(BEAKER_R, 0.05, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0x88aaff })
  );
  edge.rotation.x = Math.PI / 2;
  edge.position.set(0, rimY, 0);
  scene.add(edge);
  edge.renderOrder = 1;

  const bathGeo = new THREE.CylinderGeometry(BEAKER_R - 0.25, BEAKER_R - 0.25, 1, 32);
  const bathMat = new THREE.MeshPhysicalMaterial({
    color: 0x64d8ff, transparent: true, opacity: 0.45,
    roughness: 0.12, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false
  });
  bathMesh = new THREE.Mesh(bathGeo, bathMat);
  bathMesh.position.set(0, BATH_BOTTOM_Y + BATH_H / 2, 0);
  scene.add(bathMesh);
  bathMesh.renderOrder = 2;

  // 水面顶盖（冰态显示）
  const topDiscGeo = new THREE.CircleGeometry(BEAKER_R - 0.28, 32);
  const topDiscMat = new THREE.MeshPhysicalMaterial({
    color: 0xf0faff, transparent: true, opacity: 0.9,
    roughness: 0.3, metalness: 0.05, side: THREE.DoubleSide, depthWrite: false
  });
  bathTopDisc = new THREE.Mesh(topDiscGeo, topDiscMat);
  bathTopDisc.rotation.x = -Math.PI / 2;
  bathTopDisc.position.set(0, BATH_BOTTOM_Y + BATH_H, 0);
  bathTopDisc.visible = false;
  bathTopDisc.renderOrder = 3;
  scene.add(bathTopDisc);

  // 沸腾气泡
  const bubbleGeo = new THREE.SphereGeometry(0.07, 6, 6);
  const bubbleMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false
  });
  boilBubbles = new THREE.InstancedMesh(bubbleGeo, bubbleMat, 36);
  boilBubbles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  boilBubbles.visible = false;
  boilBubbles.renderOrder = 3;
  boilBubbleData = [];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2 + seeded(i * 7) * 0.5;
    const r = (BEAKER_R - 0.6) * Math.sqrt(seeded(i * 7 + 1));
    const speed = 0.8 + seeded(i * 7 + 2) * 1.2;
    const y = seeded(i * 7 + 3) * BATH_H;
    boilBubbleData.push({ angle, r, speed, y });
    dummy.position.set(r * Math.cos(angle), BATH_BOTTOM_Y + y, r * Math.sin(angle));
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    boilBubbles.setMatrixAt(i, dummy.matrix);
  }
  scene.add(boilBubbles);

  // 底部圆角过渡 + 底片
  const bottomGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaccff, transparent: true, opacity: 0.25,
    roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false
  });
  const cornerR = 0.35;
  const bottomTorus = new THREE.Mesh(
    new THREE.TorusGeometry(BEAKER_R - cornerR, cornerR, 10, 48),
    glassMat
  );
  bottomTorus.rotation.x = Math.PI / 2;
  bottomTorus.position.set(0, BATH_BOTTOM_Y + cornerR, 0);
  scene.add(bottomTorus);
  bottomTorus.renderOrder = 1;

  const bottomDisc = new THREE.Mesh(
    new THREE.CircleGeometry(BEAKER_R - cornerR, 40),
    bottomGlassMat
  );
  bottomDisc.rotation.x = -Math.PI / 2;
  bottomDisc.position.set(0, BATH_BOTTOM_Y, 0);
  scene.add(bottomDisc);
  bottomDisc.renderOrder = 1;

  const bottomEdge = new THREE.Mesh(
    new THREE.TorusGeometry(BEAKER_R - cornerR, 0.04, 6, 40),
    new THREE.MeshBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.5, depthWrite: false })
  );
  bottomEdge.rotation.x = Math.PI / 2;
  bottomEdge.position.set(0, BATH_BOTTOM_Y + 0.02, 0);
  scene.add(bottomEdge);
  bottomEdge.renderOrder = 1;

  updateBathHeight();
  markMain(wall, edge, bathMesh, bathTopDisc, boilBubbles, bottomTorus, bottomDisc, bottomEdge);
}

function updateBathHeight() {
  bathMesh.scale.y = BATH_H;
  bathMesh.position.y = BATH_BOTTOM_Y + BATH_H / 2;
  if (bathTopDisc) bathTopDisc.position.y = BATH_BOTTOM_Y + BATH_H;
}

function updateBathVisual(dt) {
  if (!bathMesh) return;
  const T = state.bathTemp;
  let phase = 'liquid';
  if (T < 0) phase = 'solid';
  else if (T >= 99.5) phase = 'boiling';

  if (phase === 'solid') {
    bathMesh.material.color.setHex(0xe8f6ff);
    bathMesh.material.opacity = 0.8;
    bathMesh.material.roughness = 0.5;
    if (bathTopDisc) bathTopDisc.visible = true;
    if (boilBubbles) boilBubbles.visible = false;
  } else {
    bathMesh.material.color.setHex(0x64d8ff);
    bathMesh.material.opacity = 0.45;
    bathMesh.material.roughness = 0.12;
    if (bathTopDisc) bathTopDisc.visible = false;
    if (boilBubbles) boilBubbles.visible = (phase === 'boiling');
  }

  if (phase === 'boiling' && boilBubbles && boilBubbles.visible && dt) {
    const dummy = new THREE.Object3D();
    for (let i = 0; i < boilBubbles.count; i++) {
      const b = boilBubbleData[i];
      b.y += b.speed * dt;
      if (b.y > BATH_H) b.y = 0;
      const s = 0.7 + 0.5 * Math.sin((b.y / BATH_H) * Math.PI);
      dummy.position.set(b.r * Math.cos(b.angle), BATH_BOTTOM_Y + b.y, b.r * Math.sin(b.angle));
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      boilBubbles.setMatrixAt(i, dummy.matrix);
    }
    boilBubbles.instanceMatrix.needsUpdate = true;
  }
}

function buildTestTube() {
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transparent: true, opacity: 0.28,
    roughness: 0.05, side: THREE.DoubleSide, depthWrite: false
  });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(TUBE_R, TUBE_R, TUBE_H, 32, 1, true), glassMat);
  tube.position.set(TUBE_X, TUBE_CENTRE_Y, 0);
  scene.add(tube);
  tube.renderOrder = 4;
  const tubeBottom = new THREE.Mesh(new THREE.SphereGeometry(TUBE_R, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), glassMat);
  tubeBottom.position.set(TUBE_X, TUBE_CENTRE_Y - TUBE_H / 2, 0);
  scene.add(tubeBottom);
  tubeBottom.renderOrder = 4;

  // 管口外翻小圆唇
  const tubeTopY = TUBE_CENTRE_Y + TUBE_H / 2;
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.07, 8, 32), glassMat);
  lip.rotation.x = Math.PI / 2;
  lip.position.set(TUBE_X, tubeTopY, 0);
  lip.renderOrder = 4;
  scene.add(lip);

  const def = sampleDef();
  const particleGeo = new THREE.BoxGeometry(1, 1, 1);
  const particleMat = new THREE.MeshStandardMaterial({ color: def.colorSolid, roughness: 0.6 });
  const COUNT = 80;
  sampleMesh = new THREE.InstancedMesh(particleGeo, particleMat, COUNT);
  sampleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  sampleMesh.position.set(TUBE_X, 0, 0);
  scene.add(sampleMesh);

  // 预先生成确定性分布参数
  particleData = [];
  for (let i = 0; i < COUNT; i++) {
    const r = Math.sqrt(seeded(i * 3 + 0));
    const a = i * 2.39996 + seeded(i * 3 + 1) * 0.6;
    const u = seeded(i * 3 + 2);
    const s = 0.16 + seeded(i * 3 + 3) * 0.12;
    const rot = new THREE.Euler(
      seeded(i * 3 + 4) * Math.PI,
      seeded(i * 3 + 5) * Math.PI,
      seeded(i * 3 + 6) * Math.PI
    );
    particleData.push({ r, a, u, s, rot });
  }

  const liqGeo = new THREE.CylinderGeometry(SAMPLE_RADIUS, SAMPLE_RADIUS, 1, 32);
  const liqMat = new THREE.MeshPhysicalMaterial({
    color: def.colorLiquid, transparent: true, opacity: 0.85, roughness: 0.2, depthWrite: false
  });
  sampleLiquid = new THREE.Mesh(liqGeo, liqMat);
  sampleLiquid.position.set(TUBE_X, SAMPLE_CENTRE_Y, 0);
  sampleLiquid.visible = false;
  scene.add(sampleLiquid);
  sampleLiquid.renderOrder = 3;

  const ringMat = new THREE.MeshBasicMaterial({ color: def.colorLiquid, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false });
  sampleSurfaceRing = new THREE.Mesh(new THREE.TorusGeometry(SAMPLE_RADIUS, 0.04, 8, 32), ringMat);
  sampleSurfaceRing.rotation.x = Math.PI / 2;
  sampleSurfaceRing.position.set(TUBE_X, SAMPLE_CENTRE_Y, 0);
  sampleSurfaceRing.visible = false;
  scene.add(sampleSurfaceRing);
  sampleSurfaceRing.renderOrder = 3;

  const discMat = new THREE.MeshBasicMaterial({ color: lighten(def.colorLiquid, 0.18), transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
  sampleSurfaceDisc = new THREE.Mesh(new THREE.CircleGeometry(SAMPLE_RADIUS, 32), discMat);
  sampleSurfaceDisc.rotation.x = -Math.PI / 2;
  sampleSurfaceDisc.position.set(TUBE_X, SAMPLE_CENTRE_Y, 0);
  sampleSurfaceDisc.visible = false;
  scene.add(sampleSurfaceDisc);
  sampleSurfaceDisc.renderOrder = 3;

  const blockGeo = new THREE.CylinderGeometry(SAMPLE_RADIUS * 0.94, SAMPLE_RADIUS * 0.94, 1, 24);
  const blockMat = new THREE.MeshStandardMaterial({ color: def.colorSolid, roughness: 0.6, transparent: true, opacity: 0.95 });
  sampleBlock = new THREE.Mesh(blockGeo, blockMat);
  sampleBlock.position.set(TUBE_X, SAMPLE_BOTTOM_Y + 0.5, 0);
  sampleBlock.visible = false;
  sampleBlock.renderOrder = 2;
  scene.add(sampleBlock);

  updateSampleVisual();
  markMain(tube, tubeBottom, lip, sampleMesh, sampleLiquid, sampleSurfaceRing, sampleSurfaceDisc, sampleBlock);
}

function seeded(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function lighten(hex, amount) {
  const r = ((hex >> 16) & 0xff);
  const g = ((hex >> 8) & 0xff);
  const b = (hex & 0xff);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return (lr << 16) | (lg << 8) | lb;
}

function updateSampleParticles(visibleCount, solidHeight, centerY) {
  if (!sampleMesh || !particleData.length) return;
  const dummy = new THREE.Object3D();
  const maxR = TUBE_R - 0.05;
  for (let i = 0; i < sampleMesh.count; i++) {
    if (i < visibleCount) {
      const p = particleData[i];
      const rr = maxR * p.r;
      const x = rr * Math.cos(p.a);
      const z = rr * Math.sin(p.a);
      const y = centerY - solidHeight / 2 + p.u * solidHeight;
      dummy.position.set(x, y, z);
      dummy.rotation.copy(p.rot);
      dummy.scale.set(p.s, p.s, p.s);
      dummy.updateMatrix();
      sampleMesh.setMatrixAt(i, dummy.matrix);
    } else {
      dummy.position.set(0, 0, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      sampleMesh.setMatrixAt(i, dummy.matrix);
    }
  }
  sampleMesh.instanceMatrix.needsUpdate = true;
}

function buildThermometer() {
  thermoGroup = new THREE.Group();
  thermoGroup.position.set(THERMO_X, THERMO_Y, 0.0);
  // 玻璃管
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false });
  // 玻璃管：顶部低于上横杆，呈吊挂状；感温泡仍落入样品中下部
  const tubeLen = TOP_Y - THERMO_Y - 0.3;
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, tubeLen, 16, 1, true), glassMat);
  tube.position.y = tubeLen / 2;
  tube.renderOrder = 4;
  thermoGroup.add(tube);
  // 玻璃泡
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), new THREE.MeshStandardMaterial({ color: 0xff3333 }));
  bulb.position.y = 0.26;
  thermoGroup.add(bulb);
  // 红色液柱
  const liqGeo = new THREE.CylinderGeometry(0.07, 0.07, 1, 12);
  liqGeo.translate(0, 0.5, 0);
  thermoLiquid = new THREE.Mesh(liqGeo, new THREE.MeshBasicMaterial({ color: 0xff1a1a }));
  thermoLiquid.position.y = 0.6;
  thermoGroup.add(thermoLiquid);
  // 刻度条
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 1024;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#ffffff';
  cx.fillRect(0, 0, 128, 1024);
  const minT = -10, maxT = 110, step = 1;
  const n = (maxT - minT) / step;
  for (let i = 0; i <= n; i++) {
    const T = minT + i * step;
    const y = 30 + (1 - i / n) * 964;
    const major = T % 10 === 0;
    cx.strokeStyle = '#222';
    cx.lineWidth = major ? 4 : 2;
    cx.beginPath();
    cx.moveTo(major ? 78 : 92, y);
    cx.lineTo(124, y);
    cx.stroke();
    if (major) {
      cx.fillStyle = '#111';
      cx.font = 'bold 28px sans-serif';
      cx.textAlign = 'left';
      cx.textBaseline = 'middle';
      cx.fillText(String(T), 8, y);
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  const stripH = tubeLen - 3.0;
  const stripY = 1.5 + stripH / 2;
  const stripGeo = new THREE.PlaneGeometry(0.48, stripH);
  const stripMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.FrontSide });
  const strip = new THREE.Mesh(stripGeo, stripMat);
  strip.position.set(0, stripY, -0.2);
  thermoGroup.add(strip);
  const strip2 = strip.clone();
  strip2.rotation.y = Math.PI;
  strip2.position.set(0, stripY, -0.21);
  thermoGroup.add(strip2);
  scene.add(thermoGroup);
  markMain(thermoGroup);
}

function buildLamp() {
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transparent: true, opacity: 0.22,
    roughness: 0.05, metalness: 0.05, side: THREE.DoubleSide, depthWrite: false
  });

  // 酒精灯：坛子造型——底部圆弧收窄，向上外撇，宽肩后内收短颈
  const bodyPoints = [
    new THREE.Vector2(0.95, -6.20),  // 底部
    new THREE.Vector2(1.25, -5.40),
    new THREE.Vector2(1.75, -4.60),
    new THREE.Vector2(2.20, -3.80),
    new THREE.Vector2(2.55, -3.00),  // 最宽肩
    new THREE.Vector2(2.45, -2.40),
    new THREE.Vector2(1.80, -1.90),  // 颈底
    new THREE.Vector2(0.95, -1.45)   // 瓶口
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(bodyPoints, 32), glassMat);
  scene.add(body);

  // 灯内酒精
  const alcoholMat = new THREE.MeshPhysicalMaterial({
    color: 0xcceeff, transparent: true, opacity: 0.55,
    roughness: 0.1, metalness: 0.0, side: THREE.DoubleSide, depthWrite: false
  });
  const alcoholPoints = [
    new THREE.Vector2(0.85, -6.00),
    new THREE.Vector2(1.15, -5.25),
    new THREE.Vector2(1.60, -4.50),
    new THREE.Vector2(2.00, -3.80),
    new THREE.Vector2(2.05, -3.30),
    new THREE.Vector2(1.55, -2.70)
  ];
  const alcohol = new THREE.Mesh(new THREE.LatheGeometry(alcoholPoints, 32), alcoholMat);
  scene.add(alcohol);

  // 灯颈（透明短管，从瓶口向上略外撇）
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.50, 0.88, 1.15, 16, 1, true),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false })
  );
  neck.position.set(0, -0.90, 0);
  scene.add(neck);

  // 白色灯帽，明显坐在瓶口上方
  const capMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.4 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.95, 0.70, 24), capMat);
  cap.position.set(0, -0.30, 0);
  scene.add(cap);

  // 灯芯从帽中伸出
  const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.65, 10), new THREE.MeshStandardMaterial({ color: 0x555555 }));
  wick.position.set(0, 0.10, 0);
  scene.add(wick);

  // 火焰（位置不变，仍在石棉网正下方）
  flameGroup = new THREE.Group();
  flameGroup.position.set(0, 0.38, 0);
  scene.add(flameGroup);

  flameDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.8, 24),
    new THREE.MeshBasicMaterial({ color: 0xff5722, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })
  );
  flameDisc.rotation.x = -Math.PI / 2;
  flameDisc.position.y = -0.3;
  flameDisc.renderOrder = 0;
  flameGroup.add(flameDisc);

  const coneGeo = new THREE.ConeGeometry(0.35, 1.0, 8);
  const innerCone = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({ color: FLAME_PROFILE.medium.inner, transparent: true, opacity: 0.9, depthWrite: false }));
  innerCone.position.set(0, 0.3, 0);
  innerCone.renderOrder = 0;
  innerCone.userData.inner = true;
  flameGroup.add(innerCone);
  flameCones.push(innerCone);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const c = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({ color: FLAME_PROFILE.medium.outer, transparent: true, opacity: 0.8, depthWrite: false }));
    c.position.set(Math.cos(a) * 0.42, 0.25, Math.sin(a) * 0.42);
    c.rotation.x = Math.PI / 10;
    c.renderOrder = 0;
    c.userData.inner = false;
    flameGroup.add(c);
    flameCones.push(c);
  }

  flameGroup.visible = false;
  markMain(body, alcohol, neck, cap, wick, flameGroup);
}

function applyHeatCrystal(q, def, m) {
  const mp = def.meltingPoint;
  const heatPhase = m * def.latentHeat;

  if (state.meltedFrac <= 0 && state.sampleTemp > mp + 0.01) {
    if (q > 0) {
      state.sampleTemp = mp;
      const newFrac = q / heatPhase;
      if (newFrac >= 1) {
        const rem = (newFrac - 1) * heatPhase;
        state.meltedFrac = 1;
        state.sampleTemp = mp + rem / (m * def.cLiquid);
      } else {
        state.meltedFrac = newFrac;
      }
    } else {
      state.sampleTemp += q / (m * def.cSolid);
    }
    return;
  }

  if (q > 0) {
    if (state.meltedFrac >= 1) {
      state.sampleTemp += q / (m * def.cLiquid);
    } else if (state.sampleTemp < mp - 0.01) {
      const energyToMp = (mp - state.sampleTemp) * m * def.cSolid;
      if (q < energyToMp) {
        state.sampleTemp += q / (m * def.cSolid);
      } else {
        state.sampleTemp = mp;
        const rem = q - energyToMp;
        const newFrac = state.meltedFrac + rem / heatPhase;
        if (newFrac >= 1) {
          const rem2 = (newFrac - 1) * heatPhase;
          state.meltedFrac = 1;
          state.sampleTemp = mp + rem2 / (m * def.cLiquid);
        } else {
          state.meltedFrac = newFrac;
        }
      }
    } else {
      const newFrac = state.meltedFrac + q / heatPhase;
      if (newFrac >= 1) {
        const rem = (newFrac - 1) * heatPhase;
        state.meltedFrac = 1;
        state.sampleTemp = mp + rem / (m * def.cLiquid);
      } else {
        state.meltedFrac = newFrac;
        state.sampleTemp = mp;
      }
    }
  } else if (q < 0) {
    q = -q;
    if (state.meltedFrac <= 0) {
      state.sampleTemp -= q / (m * def.cSolid);
    } else if (state.sampleTemp > mp + 0.01) {
      const energyToMp = (state.sampleTemp - mp) * m * def.cLiquid;
      if (q < energyToMp) {
        state.sampleTemp -= q / (m * def.cLiquid);
      } else {
        state.sampleTemp = mp;
        const rem = q - energyToMp;
        const newFrac = state.meltedFrac - rem / heatPhase;
        if (newFrac <= 0) {
          const rem2 = -newFrac * heatPhase;
          state.meltedFrac = 0;
          state.sampleTemp = mp - rem2 / (m * def.cSolid);
        } else {
          state.meltedFrac = newFrac;
        }
      }
    } else {
      const newFrac = state.meltedFrac - q / heatPhase;
      if (newFrac <= 0) {
        const rem = -newFrac * heatPhase;
        state.meltedFrac = 0;
        state.sampleTemp = mp - rem / (m * def.cSolid);
      } else {
        state.meltedFrac = newFrac;
        state.sampleTemp = mp;
      }
    }
  }
}

function stepPhysics(dtReal) {
  if (paused) return;
  const prevT = state.sampleTemp;
  const dt = dtReal * state.timeScale;
  state.simTime += dt;

  const def = sampleDef();
  const m = sampleMass();
  const fire = state.heating ? fireWatts() : 0;

  // 子步积分：热交换显式欧拉在 dtSim 较大（×60 加速）时会不稳定过冲，
  // 拆成每子步 ≤1 模拟秒的循环（每子步重算温度差，收敛稳定）。
  const nSub = Math.max(1, Math.ceil(dt / 1));
  const h = dt / nSub;

  const bathCp = 4200, bathM = 0.25;
  for (let i = 0; i < nSub; i++) {
    // 烧杯温度动态：酒精灯加热 + 环境散热
    let dBath = (fire / (bathM * bathCp)) * h - (KBATH_LOSS / (bathM * bathCp)) * (state.bathTemp - state.ambTemp) * h;
    if (state.bathTemp + dBath > BATH_MAX_TEMP) {
      state.bathTemp = BATH_MAX_TEMP;
      dBath = 0;
    }
    state.bathTemp += dBath;

    // 样品与烧杯的热交换
    let q = KSAMPLE * (state.bathTemp - state.sampleTemp) * h;
    // 熄灯时额外直接向环境散热（让凝固平台更明显、冷却更快）
    if (!state.heating) {
      q -= KCOOL * (state.sampleTemp - state.ambTemp) * h;
    }

    if (def.kind === 'crystal') {
      applyHeatCrystal(q, def, m);
    } else {
      const c = state.sampleTemp > def.softEnd ? def.cLiquid : def.cSolid;
      state.sampleTemp += q / (m * c);
    }

    // 物理钳制：被动热交换中样品不可能比热源（水浴）更热；
    // 仅在吸热方向(q>=0)且已超过时钳到水浴温度，熄灯冷却不受影响。
    if (q >= 0 && state.sampleTemp > state.bathTemp) {
      state.sampleTemp = state.bathTemp;
    }
  }

  state.sampleTemp = Math.max(-15, Math.min(120, state.sampleTemp));
  updatePhaseName();
  recordData();
  updateSampleVisual();
  updateThermometerLiquid();
  checkPhaseToast(prevT);
  updatePhaseFlow(prevT);
}

function recordData() {
  const tMin = Math.floor(state.simTime / 60);
  if (tMin > state.lastRecordTime) {
    state.lastRecordTime = tMin;
    state.dataLog.push({ t: tMin, T: state.sampleTemp, heat: !!state.heating, mode: state.mode });
    if (state.dataLog.length > 120) state.dataLog.shift();
    if (typeof onDataRecorded === 'function') onDataRecorded();
  }
}

function updateSampleVisual() {
  const def = sampleDef();
  sampleMesh.material.color.setHex(def.colorSolid);
  sampleLiquid.material.color.setHex(def.colorLiquid);
  sampleSurfaceRing.material.color.setHex(def.colorLiquid);
  sampleSurfaceDisc.material.color.setHex(lighten(def.colorLiquid, 0.18));
  if (sampleBlock) sampleBlock.material.color.setHex(def.colorSolid);

  function setLiqTop(y) {
    sampleSurfaceRing.position.y = y;
    sampleSurfaceDisc.position.y = y;
  }

  if (def.kind === 'crystal') {
    if (sampleBlock) sampleBlock.visible = false;
    const s = state.meltedFrac;
    if (s <= 0) {
      sampleMesh.visible = true;
      sampleLiquid.visible = false;
      sampleSurfaceRing.visible = false;
      sampleSurfaceDisc.visible = false;
      updateSampleParticles(sampleMesh.count, SAMPLE_HEIGHT, SAMPLE_CENTRE_Y);
    } else if (s >= 1) {
      sampleMesh.visible = false;
      sampleLiquid.visible = true;
      sampleLiquid.scale.set(1, SAMPLE_HEIGHT, 1);
      sampleLiquid.position.y = SAMPLE_CENTRE_Y;
      sampleLiquid.material.opacity = 0.90;
      sampleSurfaceRing.visible = true;
      sampleSurfaceDisc.visible = true;
      setLiqTop(SAMPLE_BOTTOM_Y + SAMPLE_HEIGHT);
      updateSampleParticles(0, SAMPLE_HEIGHT, SAMPLE_CENTRE_Y);
    } else {
      sampleMesh.visible = true;
      sampleLiquid.visible = true;
      const solidH = SAMPLE_HEIGHT * (1 - s);
      const solidCY = SAMPLE_BOTTOM_Y + solidH / 2;
      const liqH = SAMPLE_HEIGHT * s;
      const liqCY = SAMPLE_BOTTOM_Y + SAMPLE_HEIGHT - liqH / 2;
      sampleLiquid.scale.set(1, liqH, 1);
      sampleLiquid.position.y = liqCY;
      sampleLiquid.material.opacity = 0.65 + 0.25 * s;
      sampleSurfaceRing.visible = true;
      sampleSurfaceDisc.visible = true;
      setLiqTop(liqCY + liqH / 2);
      updateSampleParticles(Math.ceil(sampleMesh.count * (1 - s)), solidH, solidCY);
    }
  } else {
    const s = Math.max(0, Math.min(1, (state.sampleTemp - def.softStart) / (def.softEnd - def.softStart)));
    sampleMesh.visible = false;
    sampleLiquid.visible = s > 0.005;
    const blockH = SAMPLE_HEIGHT * (1 - s);
    if (sampleBlock) {
      if (blockH > 0.001) {
        sampleBlock.visible = true;
        sampleBlock.scale.set(1, blockH, 1);
        sampleBlock.position.y = SAMPLE_BOTTOM_Y + blockH / 2;
      } else {
        sampleBlock.visible = false;
      }
    }
    const liqH = SAMPLE_HEIGHT * s;
    const liqCY = SAMPLE_BOTTOM_Y + SAMPLE_HEIGHT - liqH / 2;
    if (sampleLiquid.visible) {
      sampleLiquid.scale.set(1, liqH, 1);
      sampleLiquid.position.y = liqCY;
      sampleLiquid.material.opacity = s >= 1 ? 0.90 : (0.65 + 0.25 * s);
      sampleSurfaceRing.visible = true;
      sampleSurfaceDisc.visible = true;
      setLiqTop(liqCY + liqH / 2);
    } else {
      sampleSurfaceRing.visible = false;
      sampleSurfaceDisc.visible = false;
    }
    updateSampleParticles(0, SAMPLE_HEIGHT, SAMPLE_CENTRE_Y);
  }
}

function updateThermometerLiquid() {
  if (!thermoLiquid) return;
  const minT = -10, maxT = 110;
  let frac = (state.sampleTemp - minT) / (maxT - minT);
  frac = Math.max(0, Math.min(1, frac));
  // 柱顶与刻度条精确对齐：刻度 canvas y = 30+(1-frac)*964（画布高 1024），
  // 刻度条底=局部 Y 1.5、条高 12.4 → 柱顶局部 Y = 1.5+12.4*(1-cy/1024)；液柱底=0.6
  const cy = 30 + (1 - frac) * 964;
  const topY = 1.5 + 12.4 * (1 - cy / 1024);
  thermoLiquid.scale.y = Math.max(0.05, topY - thermoLiquid.position.y);
}

function setHeating(on) {
  state.heating = on;
  updateFlame();
}

function updateFlame() {
  const on = state.heating;
  if (flameGroup) flameGroup.visible = on;
  if (!on || !flameCones.length) return;
  const p = FLAME_PROFILE[state.fire] || FLAME_PROFILE.medium;
  flameBaseScale = p.base;
  flameCones.forEach(c => {
    c.material.color.setHex(c.userData.inner ? p.inner : p.outer);
    const w = c.userData.inner ? p.base : p.base * 0.85;
    c.scale.set(w, p.base, w);
  });
  flameDisc.material.color.setHex(p.disc);
  flameDisc.material.opacity = p.discOp;
  flameDisc.scale.setScalar(p.base);
}

function isSolidifying() {
  const def = sampleDef();
  if (state.mode !== 'freeze') return false;
  if (state.heating) return false;
  if (def.kind === 'crystal') {
    return state.meltedFrac > 0 && state.meltedFrac < 1;
  }
  return state.sampleTemp > def.softStart && state.sampleTemp < def.softEnd;
}

function startFreezePhase() {
  state.mode = 'freeze';
  if (state.heating) setHeating(false);
  stopBoil();
  updateFlame();
  updateModeUI();
}

function updatePhaseFlow(prevT) {
  const def = sampleDef();
  if (def.kind === 'crystal' && state.mode === 'melt' && state.meltedFrac >= 1 && !state.fullyMeltedAnnounced) {
    state.fullyMeltedAnnounced = true;
    showPhaseToast('已完全熔化！熄灭酒精灯可观察凝固过程');
    updateModeUI();
  }
  if (!state.heating && state.mode === 'melt' && state.meltedFrac > 0 && state.simTime > 0) {
    startFreezePhase();
  }
}

function enterMode(mode) {
  state.mode = mode;
  if (mode === 'melt') {
    setMainApparatusVisible(true);
    resetPhysics();
    if (typeof clearTable === 'function') clearTable();
    if (typeof drawChart === 'function') drawChart();
  } else if (mode === 'freeze') {
    setMainApparatusVisible(true);
    state.heating = false;
    stopBoil();
    updateFlame();
  }
  if (typeof updateModeUI === 'function') updateModeUI();
}

function preMeltComplete() {
  const def = sampleDef();
  const target = def.kind === 'crystal' ? def.meltingPoint + 8 : def.softEnd + 10;
  state.sampleTemp = target;
  state.bathTemp = target;
  state.meltedFrac = 1;
  state.heating = false;
  state.mode = 'freeze';
  state.plateauAnnounced = false;
  state.fullyMeltedAnnounced = true;
  state.paraffinHeatAnnounced = false;
  state.paraffinFreezeAnnounced = false;
  stopBoil();
  updatePhaseName();
  updateSampleVisual();
  updateBathVisual();
  updateThermometerLiquid();
  updateFlame();
  updateModeUI();
  if (typeof updateUI === 'function') updateUI();
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
  cameraState.azimuth -= dx * 0.006;
  const newPolar = cameraState.polar - dy * 0.006;
  cameraState.polar = Math.max(0.08, Math.min(Math.PI / 2 - 0.08, newPolar));
  applyCameraOrbit();
}

function onWheel(e) {
  e.preventDefault();
  cameraState.distance = THREE.MathUtils.clamp(cameraState.distance + e.deltaY * 0.05, CAM_MIN_DIST, CAM_MAX_DIST);
  applyCameraOrbit();
}

function onResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function checkPhaseToast(prevT) {
  const def = sampleDef();
  if (def.kind === 'crystal') {
    if (state.plateauAnnounced) return;
    const mp = def.meltingPoint;
    if (state.mode === 'melt' && prevT < mp && state.sampleTemp >= mp && state.meltedFrac < 1) {
      state.plateauAnnounced = true;
      showPhaseToast(`温度达到熔点 ${mp}℃，${def.name}开始熔化，熔化过程中吸热、温度保持不变`);
    } else if (state.mode === 'freeze' && prevT > mp && state.sampleTemp <= mp && state.meltedFrac > 0) {
      state.plateauAnnounced = true;
      showPhaseToast(`温度降到凝固点 ${mp}℃，${def.name}开始凝固，凝固过程中放热、温度保持不变`);
    }
  } else {
    if (state.mode === 'melt' && !state.paraffinHeatAnnounced && prevT < def.softStart && state.sampleTemp >= def.softStart) {
      state.paraffinHeatAnnounced = true;
      showPhaseToast('石蜡是非晶体，没有固定熔点，变软变稀过程中温度持续上升');
    } else if (state.mode === 'freeze' && !state.paraffinFreezeAnnounced && prevT > def.softEnd && state.sampleTemp <= def.softEnd) {
      state.paraffinFreezeAnnounced = true;
      showPhaseToast('石蜡没有固定凝固点，变稠变硬过程中温度持续下降');
    }
  }
}

function showPhaseToast(html) {
  const el = document.getElementById('phase-toast');
  if (!el) return;
  el.innerHTML = html;
  el.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('show'); }, 5200);
}

function hideToast() {
  const el = document.getElementById('phase-toast');
  if (el) el.classList.remove('show');
  if (toastTimer) clearTimeout(toastTimer);
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastPhysicsTime) / 1000);
  lastPhysicsTime = now;

  stepPhysics(dt);

  if (flameGroup && state.heating) {
    const t = now * 0.006;
    const jitter = 1 + Math.sin(t) * 0.12;
    flameGroup.scale.setScalar(flameBaseScale * jitter);
    flameGroup.rotation.y += 0.02;
  }

  if (typeof updateUI === 'function') updateUI();
  updateBathVisual(dt);
  renderer.render(scene, camera);
}

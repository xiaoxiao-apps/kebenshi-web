/* exp-subl-core.js — 升华凝华观察站 3D 场景 + 物理引擎 [s1] */
/* eslint-env browser */
/* 模式①：碘的升华与凝华（固态⇌气态直接互变，全程无液态碘） */

const TABLE_TOP_Y = -7;
const CONTAINER_R = 3.4, CONTAINER_H = 7.5;
const CONTAINER_BOTTOM_Y = TABLE_TOP_Y, CONTAINER_CENTER_Y = CONTAINER_BOTTOM_Y + CONTAINER_H / 2;
const RIM_Y = CONTAINER_BOTTOM_Y + CONTAINER_H;
const IODINE_COLOR = 0x3a2340;
const VAPOR_COLOR = 0x7b4a9e;
const CRYSTAL_COLOR = 0xb890e8;
const IODINE_COUNTS = { small: 40, medium: 80, large: 140 };
const HOT_PROFILE = {
  60:  { rate: 0.28, label: '60℃' },
  80:  { rate: 0.5,  label: '80℃' },
  100: { rate: 0.78, label: '100℃' }
};

let state;
let scene, camera, renderer, raycaster, pointer = new THREE.Vector2();
let iodineMesh, iodineData = [];
let vaporMesh, vaporData = [];
let crystalMesh, crystalData = [];
let containerGroup, coverMesh, iodineGroup;
let cameraState = { distance: 34, azimuth: 0.5, polar: Math.PI / 3.2 };
const CAM_MIN_DIST = 16, CAM_MAX_DIST = 62;
let lastPhysicsTime = performance.now();

function seeded(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function sceneCenter() { return new THREE.Vector3(0, CONTAINER_CENTER_Y, 0); }

function makeInitialState(overrides) {
  const base = {
    mode: 'iodine',
    hotTemp: 80,
    coldTemp: 20,
    iodineAmount: 'medium',
    iodineCount: IODINE_COUNTS.medium,
    phase: 'idle',          // idle | sublimate | deposit
    vapor: 0,               // 0..1 蒸气充满度
    iodineLeft: 1,          // 1..0.2 底部固态碘剩余份额
    wallCrystal: 0,         // 0..1 器壁结晶光泽
    paused: false,
    sublimAnnounced: false,
    depositAnnounced: false,
    subShrink: 0,
    guessDone: false
  };
  return Object.assign(base, overrides || {});
}

function initScene() {
  const container = document.getElementById('canvas-container');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a24);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 34);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  raycaster = new THREE.Raycaster();

  const ambient = new THREE.AmbientLight(0xffffff, 0.6); scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.85); dir.position.set(15, 22, 15); scene.add(dir);
  const fill = new THREE.DirectionalLight(0xb9d8ff, 0.4); fill.position.set(-12, 12, -10); scene.add(fill);

  buildTable();
  buildSealedContainer();
  buildIodine();
  buildVapor();
  buildCrystals();
  applyCameraOrbit();
}

function buildTable() {
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(80, 2, 50),
    new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.85 })
  );
  table.position.y = -8;
  scene.add(table);
}
function buildSealedContainer() {
  containerGroup = new THREE.Group();
  containerGroup.position.set(0, CONTAINER_BOTTOM_Y, 0);
  scene.add(containerGroup);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaccff, transparent: true, opacity: 0.20,
    roughness: 0.05, metalness: 0.08, side: THREE.DoubleSide, depthWrite: false
  });
  // 直壁玻璃筒
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(CONTAINER_R, CONTAINER_R, CONTAINER_H, 40, 1, true), glassMat);
  wall.position.y = CONTAINER_H / 2;
  wall.renderOrder = 1;
  containerGroup.add(wall);
  // 杯口边缘环
  const edge = new THREE.Mesh(new THREE.TorusGeometry(CONTAINER_R, 0.05, 8, 48), new THREE.MeshBasicMaterial({ color: 0x88aaff, depthWrite: false }));
  edge.rotation.x = Math.PI / 2;
  edge.position.y = CONTAINER_H;
  edge.renderOrder = 1;
  containerGroup.add(edge);
  // 底部圆角 + 底片
  const cornerR = 0.3;
  const bottomTorus = new THREE.Mesh(new THREE.TorusGeometry(CONTAINER_R - cornerR, cornerR, 10, 48), glassMat);
  bottomTorus.rotation.x = Math.PI / 2;
  bottomTorus.position.y = cornerR;
  bottomTorus.renderOrder = 1;
  containerGroup.add(bottomTorus);
  const bottomDisc = new THREE.Mesh(new THREE.CircleGeometry(CONTAINER_R - cornerR, 40), new THREE.MeshPhysicalMaterial({ color: 0xaaccff, transparent: true, opacity: 0.22, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false }));
  bottomDisc.rotation.x = -Math.PI / 2;
  bottomDisc.position.y = 0;
  bottomDisc.renderOrder = 1;
  containerGroup.add(bottomDisc);
  // 透明玻璃盖（密封）
  const lidMat = new THREE.MeshPhysicalMaterial({ color: 0xaaccff, transparent: true, opacity: 0.28, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false });
  coverMesh = new THREE.Mesh(new THREE.CylinderGeometry(CONTAINER_R + 0.12, CONTAINER_R + 0.12, 0.16, 40, 1, true), lidMat);
  coverMesh.position.y = CONTAINER_H + 0.1;
  coverMesh.renderOrder = 2;
  containerGroup.add(coverMesh);
  const coverDisc = new THREE.Mesh(new THREE.CircleGeometry(CONTAINER_R + 0.12, 40), lidMat);
  coverDisc.rotation.x = Math.PI / 2;
  coverDisc.position.y = CONTAINER_H + 0.18;
  coverDisc.renderOrder = 2;
  containerGroup.add(coverDisc);
}

function buildIodine() {
  iodineGroup = new THREE.Group();
  iodineGroup.position.set(0, 0.08, 0);
  containerGroup.add(iodineGroup);
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ color: IODINE_COLOR, roughness: 0.5, metalness: 0.3 });
  const count = IODINE_COUNTS.large;
  iodineMesh = new THREE.InstancedMesh(geo, mat, count);
  iodineMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  iodineMesh.renderOrder = 3;
  iodineData = [];
  for (let i = 0; i < count; i++) {
    const angle = seeded(i * 7) * Math.PI * 2;
    const r = (CONTAINER_R - 0.5) * Math.sqrt(seeded(i * 7 + 1));
    iodineData.push({
      x: Math.cos(angle) * r,
      z: Math.sin(angle) * r,
      y: seeded(i * 7 + 3) * 0.5,
      size: 0.12 + seeded(i * 7 + 4) * 0.16,
      phase: seeded(i * 7 + 5) * Math.PI * 2
    });
  }
  iodineGroup.add(iodineMesh);
  applyIodine();
}

function applyIodine() {
  const dummy = new THREE.Object3D();
  const active = Math.max(1, Math.round(state.iodineCount * state.iodineLeft));
  for (let i = 0; i < iodineMesh.count; i++) {
    if (i < active) {
      const p = iodineData[i];
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.size);
      dummy.rotation.set(0, p.phase, 0);
    } else {
      dummy.position.set(0, -20, 0);
      dummy.scale.setScalar(0.001);
    }
    dummy.updateMatrix();
    iodineMesh.setMatrixAt(i, dummy.matrix);
  }
  iodineMesh.instanceMatrix.needsUpdate = true;
}

function makeVaporTexture() {
  // R11 视觉：软边 sprite 贴图（中心紫 0x7b4a9e 附近 → 边缘透明）
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
  const cx = cv.getContext('2d');
  const g = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(146,94,186,1)');
  g.addColorStop(0.45, 'rgba(123,74,158,0.55)');
  g.addColorStop(1, 'rgba(123,74,158,0)');
  cx.fillStyle = g; cx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace || '';
  return tex;
}

function buildVapor() {
  // R11 视觉：平面贴片 billboard 实例替代实心球，单片 opacity~0.35 靠重叠出浓度
  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.MeshBasicMaterial({
    map: makeVaporTexture(), transparent: true, opacity: 0.35,
    depthWrite: false, side: THREE.DoubleSide
  });
  vaporMesh = new THREE.InstancedMesh(geo, mat, 90);
  vaporMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  vaporMesh.renderOrder = 4;
  vaporMesh.visible = false;
  vaporData = [];
  for (let i = 0; i < 90; i++) {
    const angle = seeded(i * 11) * Math.PI * 2;
    const r = (CONTAINER_R - 0.6) * Math.sqrt(seeded(i * 11 + 1));
    vaporData.push({
      angle, r, r0: r,
      y: 0, yBirth: 0.15 + seeded(i * 11 + 2) * 0.35, // 出生区：底部碘晶表面附近
      speed: 0.4 + seeded(i * 11 + 3) * 0.7,
      sway: seeded(i * 11 + 4) * Math.PI * 2,
      size: 0.5 + seeded(i * 11 + 5) * 0.7,
      age: 0, on: false // 生命周期：age 渐入 + on 激活标记（防 popping）
    });
  }
  containerGroup.add(vaporMesh);
}

function buildCrystals() {
  const geo = new THREE.SphereGeometry(0.7, 6, 6);
  const mat = new THREE.MeshStandardMaterial({ color: CRYSTAL_COLOR, roughness: 0.2, metalness: 0.25, transparent: true, opacity: 0.85 });
  crystalMesh = new THREE.InstancedMesh(geo, mat, 70);
  crystalMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  crystalMesh.renderOrder = 5;
  crystalMesh.visible = false;
  crystalData = [];
  for (let i = 0; i < 70; i++) {
    const angle = seeded(i * 13) * Math.PI * 2;
    const onWall = seeded(i * 13 + 1) > 0.5;
    const y = 0.3 + seeded(i * 13 + 2) * (CONTAINER_H - 0.6);
    crystalData.push({
      angle,
      r: onWall ? CONTAINER_R - 0.1 : (CONTAINER_R - 0.6) * Math.sqrt(seeded(i * 13 + 3)),
      y,
      onWall,
      size: 0.08 + seeded(i * 13 + 4) * 0.14
    });
  }
  containerGroup.add(crystalMesh);
}

function updateVapor(dt) {
  const g = state.phase === 'sublimate' ? state.vapor : (state.phase === 'deposit' ? Math.max(0.05, state.vapor) : 0);
  const dummy = new THREE.Object3D();
  const active = Math.round(g * vaporMesh.count);
  vaporMesh.visible = active > 1;
  const t = performance.now() * 0.001;
  const yTop = CONTAINER_H - 0.2;
  for (let i = 0; i < vaporMesh.count; i++) {
    const p = vaporData[i];
    if (i >= active) p.on = false;              // 失活：不再生（消失 popping 由淡出段兼顾）
    if (!p.on && i < active && dt > 0) {
      // 连续强度映射：新激活粒子从 scale 0 渐入，消除整数个粒子突现
      p.on = true; p.age = 0; p.y = p.yBirth; p.r = p.r0;
      p.angle = Math.random() * Math.PI * 2;
    }
    if (p.on) {
      p.age += dt;
      p.y += p.speed * dt * (0.5 + 0.8 * g);
      const prog = Math.min(1, (p.y - p.yBirth) / (yTop - p.yBirth));
      let mul, rr = p.r;
      if (prog < 0.15) {
        const u = prog / 0.15;                   // ① 出生：淡入渐大
        mul = u * u * (3 - 2 * u);
      } else if (prog < 0.8) {
        mul = 1 + 0.35 * ((prog - 0.15) / 0.65); // ② 上升中继续长大
      } else {
        const u = (prog - 0.8) / 0.2;            // ③ 顶部：长大 + 向外漂 + 淡出（scale 收 0）
        mul = (1.35 + 0.45 * u) * (1 - u * u);
        rr = p.r0 * (1 + 0.4 * u);
      }
      const rad = rr + Math.sin(t + p.sway) * 0.15;
      dummy.position.set(rad * Math.cos(p.angle), p.y, rad * Math.sin(p.angle));
      dummy.quaternion.copy(camera.quaternion);  // billboard 贴片朝向相机
      dummy.scale.setScalar(Math.max(0.001, mul * p.size * 1.6));
      if (prog >= 1) p.on = false;               // ④ 到高度上限：回收，下帧重置到出生区
    } else {
      dummy.position.set(0, -20, 0);
      dummy.quaternion.identity();
      dummy.scale.setScalar(0.001);
    }
    dummy.updateMatrix();
    vaporMesh.setMatrixAt(i, dummy.matrix);
  }
  vaporMesh.instanceMatrix.needsUpdate = true;
}

function updateCrystals() {
  const g = state.wallCrystal;
  const dummy = new THREE.Object3D();
  const active = Math.round(g * crystalMesh.count);
  crystalMesh.visible = active > 1;
  for (let i = 0; i < crystalMesh.count; i++) {
    if (i < active) {
      const p = crystalData[i];
      dummy.position.set(Math.cos(p.angle) * p.r, p.y, Math.sin(p.angle) * p.r);
      dummy.scale.setScalar(p.size * (0.6 + 0.4 * g));
    } else {
      dummy.position.set(0, -20, 0);
      dummy.scale.setScalar(0.001);
    }
    dummy.updateMatrix();
    crystalMesh.setMatrixAt(i, dummy.matrix);
  }
  crystalMesh.instanceMatrix.needsUpdate = true;
}

function stepPhysics(dt) {
  if (state.paused || state.mode !== 'iodine') return;
  const profile = HOT_PROFILE[state.hotTemp] || HOT_PROFILE[80];
  if (state.phase === 'sublimate') {
    state.vapor += profile.rate * dt;
    if (state.vapor > 1) state.vapor = 1;
    state.iodineLeft = Math.max(0.2, 1 - state.vapor * 0.55);
  } else if (state.phase === 'deposit') {
    state.vapor = Math.max(0, state.vapor - profile.rate * 0.9 * dt);
    state.wallCrystal = Math.min(1, state.wallCrystal + profile.rate * 0.8 * dt);
  }
}

function startSublimate() {
  state.phase = 'sublimate';
  ensureAudioContext();
  if (typeof playSizzle === 'function') playSizzle(0.8);
}

function startDeposit() {
  state.phase = 'deposit';
  ensureAudioContext();
  if (typeof playDeposit === 'function') playDeposit();
}

function resetScene() {
  state.phase = 'idle';
  state.vapor = 0;
  state.iodineLeft = 1;
  state.wallCrystal = 0;
  state.subShrink = 0;
  state.sublimAnnounced = false;
  state.depositAnnounced = false;
  applyIodine();
  updateVapor(0);
  updateCrystals();
}

function applyCameraOrbit() {
  const r = cameraState.distance, phi = cameraState.polar, theta = cameraState.azimuth;
  const c = sceneCenter();
  camera.position.set(c.x + r * Math.sin(phi) * Math.sin(theta), c.y + r * Math.cos(phi), c.z + r * Math.sin(phi) * Math.cos(theta));
  camera.lookAt(c);
}

function updateCameraRotation(dx, dy) {
  cameraState.azimuth -= dx * 0.006;
  const np = cameraState.polar - dy * 0.006;
  cameraState.polar = Math.max(0.087, Math.min(Math.PI / 2 - 0.087, np));
  applyCameraOrbit();
}

function onWheel(e) { e.preventDefault(); cameraState.distance = THREE.MathUtils.clamp(cameraState.distance + e.deltaY * 0.05, CAM_MIN_DIST, CAM_MAX_DIST); applyCameraOrbit(); }
function onResize() { if (!camera || !renderer) return; camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); }

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastPhysicsTime) / 1000);
  lastPhysicsTime = now;
  stepPhysics(dt);
  if (state.mode === 'iodine') {
    applyIodine();
    updateVapor(dt);
    updateCrystals();
    if (window.SublimationPour) window.SublimationPour.update(dt);
  }
  if (typeof updateUI === 'function') updateUI();
  renderer.render(scene, camera);
}

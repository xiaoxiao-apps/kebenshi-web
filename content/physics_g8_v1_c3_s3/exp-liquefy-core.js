// exp-liquefy-core.js — 阶段三 液化探究 单一实验（水蒸气遇冷液化）
// 依赖全局：THREE, scene, camera, renderer, state

let liquefyGroup = null;
let lqBeakerWater = null;
let lqFlameGroup = null, lqFlameDisc = null, lqFlameCones = [];
let lqGlassPlate = null;
let lqDropletMesh = null, lqSteamMesh = null;
let lqTube = null, lqTubeCurve = null;
let lqCollectBeaker = null, lqCollectWater = null;
let lqTooltip = null, lqPhaseHint = null;
let lqRaycaster = null;
const lqPointer = new THREE.Vector2();
let lqHoverTarget = null;
let lqTooltipTargets = [];
let lqTooltipPos = { x: 0, y: 0 };
let lqBeakerWaterBaseScale = 4.5;
let lqBeakerWaterBaseY = 0;
const LQ_LAMP_BODY_OFFSET = 0.67;

const lqDummy = new THREE.Object3D();

const LQ_BEAKER_R = 3.2;
const LQ_BEAKER_H = 7.0;
const LQ_BEAKER_BOTTOM_Y = 0.0;
const LQ_RIM_Y = LQ_BEAKER_BOTTOM_Y + LQ_BEAKER_H;
const LQ_PLATE_TILT = -25 * Math.PI / 180;
const LQ_PLATE_POS = new THREE.Vector3(0, 9.5, 0);
const LQ_FULL_DROPS = 480;
const LQ_PLATE_HALF_W = 4.5;
const LQ_PLATE_HALF_D = 2.5;
const LQ_PLATE_THICK = 0.15;
const LQ_COLLECT_POS = new THREE.Vector3(8.5, -4.5, 0);
const LQ_COLLECT_R = 2.4;
const LQ_COLLECT_H = 5.0;
const LQ_COLLECT_BOTTOM_Y = LQ_COLLECT_POS.y - LQ_COLLECT_H / 2;
const LQ_MAX_DROPS = 200;
const LQ_MAX_STEAM = 120;
const LQ_TUBE_R = 0.18;
const LQ_STAND_X = -5.2;
const LQ_BASE_W = 12.0;
const LQ_BASE_D = 6.0;
const LQ_ROD_H = 18.0;

let lqDroplets = [];
let lqSteam = [];
let lqCollectedCount = 0;
let lqPrevHeating = false;
let lqHeatStartMs = 0;
let lqSteamSpawnAcc = 0;
let lqLastWaterTemp = 25;
let lqPlateNormal = new THREE.Vector3();
let lqPlateDownhill = new THREE.Vector3();
let lqLowEdge = new THREE.Vector3();
let lqTubeLength = 1;

function lqSeeded(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const LQ_PHASE_TEXTS = [
  '点燃酒精灯，开始加热烧杯中的水',
  '烧杯中的水温度升高，蒸发加快，产生大量水蒸气',
  '热的水蒸气遇到冷的玻璃片，在玻璃片表面凝结成小水珠',
  '遇冷的小水珠沿玻璃片由导管流入收集烧杯中'
];

function registerLiquefyTooltip(mesh, title, body) {
  if (!mesh) return;
  mesh.userData.lqTooltip = { title, body };
  lqTooltipTargets.push(mesh);
}

function buildLiquefyScene() {
  if (liquefyGroup) return;
  liquefyGroup = new THREE.Group();
  liquefyGroup.position.set(0, 7, 0);
  scene.add(liquefyGroup);

  buildLiquefyTable(liquefyGroup);
  buildLiquefyStand(liquefyGroup);
  buildLiquefyBeaker(liquefyGroup);
  buildLiquefyLamp(liquefyGroup);
  buildLiquefyPlate(liquefyGroup);
  buildLiquefyTube(liquefyGroup);
  buildLiquefyCollectBeaker(liquefyGroup);
  buildLiquefyDroplets(liquefyGroup);
  buildLiquefySteam(liquefyGroup);

  updateLiquefyPlateMath();
  resetLiquefy();
  setLiquefyGroupVisible(state && state.mode === 'liquefy');
  initLiquefyTooltip();
}

function buildLiquefyTable(g) {
  const table = new THREE.Mesh(new THREE.BoxGeometry(80, 2, 50), new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.85 }));
  table.position.y = -8;
  g.add(table);
}

function buildLiquefyStand(g) {
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x3d3d45, metalness: 0.55, roughness: 0.45 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(LQ_BASE_W, 1.0, LQ_BASE_D), darkMetal);
  base.position.set(0, -6.5, 0);
  g.add(base);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, LQ_ROD_H, 16), darkMetal);
  rod.position.set(LQ_STAND_X, -6.5 + 0.5 + LQ_ROD_H / 2, 0);
  g.add(rod);
  const armLen = Math.abs(LQ_STAND_X) + 0.5;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, armLen, 16), darkMetal);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(LQ_STAND_X + armLen / 2, -0.6, 0);
  g.add(arm);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(LQ_BEAKER_R + 0.25, 0.1, 8, 32), darkMetal);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, -0.6, 0);
  g.add(ring);
  const gauze = new THREE.Mesh(new THREE.CylinderGeometry(LQ_BEAKER_R + 0.3, LQ_BEAKER_R + 0.3, 0.05, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x888899, metalness: 0.35, roughness: 0.7, wireframe: true }));
  gauze.position.set(0, -0.45, 0);
  g.add(gauze);

  registerLiquefyTooltip(base, '铁架台', '固定和支撑实验器材');
  registerLiquefyTooltip(rod, '铁架台', '固定和支撑实验器材');
  registerLiquefyTooltip(arm, '铁架台', '固定和支撑实验器材');
  registerLiquefyTooltip(ring, '铁架台', '固定和支撑实验器材');
  registerLiquefyTooltip(gauze, '铁架台', '固定和支撑实验器材');
}

function buildLiquefyBeaker(g) {
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xaaccff, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(LQ_BEAKER_R, LQ_BEAKER_R, LQ_BEAKER_H, 40, 1, true), glassMat);
  wall.position.set(0, LQ_BEAKER_BOTTOM_Y + LQ_BEAKER_H / 2, 0);
  wall.renderOrder = 1;
  g.add(wall);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(LQ_BEAKER_R, 0.05, 8, 48), new THREE.MeshBasicMaterial({ color: 0x88aaff, depthWrite: false }));
  edge.rotation.x = Math.PI / 2;
  edge.position.set(0, LQ_RIM_Y, 0);
  edge.renderOrder = 1;
  g.add(edge);

  const waterH = 4.5;
  const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x64d8ff, transparent: true, opacity: 0.5, roughness: 0.12, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false });
  lqBeakerWater = new THREE.Mesh(new THREE.CylinderGeometry(LQ_BEAKER_R - 0.2, LQ_BEAKER_R - 0.2, 1, 32), waterMat);
  lqBeakerWater.position.set(0, LQ_BEAKER_BOTTOM_Y + 0.3 + waterH / 2, 0);
  lqBeakerWater.scale.y = waterH;
  lqBeakerWater.renderOrder = 2;
  g.add(lqBeakerWater);

  const bottomDisc = new THREE.Mesh(new THREE.CircleGeometry(LQ_BEAKER_R - 0.05, 40), new THREE.MeshPhysicalMaterial({ color: 0xaaccff, transparent: true, opacity: 0.22, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false }));
  bottomDisc.rotation.x = -Math.PI / 2;
  bottomDisc.position.set(0, LQ_BEAKER_BOTTOM_Y, 0);
  bottomDisc.renderOrder = 1;
  g.add(bottomDisc);

  registerLiquefyTooltip(wall, '烧杯', '被加热的水，产生水蒸气');
  registerLiquefyTooltip(lqBeakerWater, '烧杯', '被加热的水，产生水蒸气');
  lqBeakerWaterBaseScale = lqBeakerWater.scale.y;
  lqBeakerWaterBaseY = LQ_BEAKER_BOTTOM_Y + 0.3;
}

function buildLiquefyLamp(g) {
  const lampGroup = new THREE.Group();
  lampGroup.position.set(0, -1.37, 0);
  g.add(lampGroup);

  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.05, side: THREE.DoubleSide, depthWrite: false });
  const bodyPoints = [
    new THREE.Vector2(0.95, -6.20 + LQ_LAMP_BODY_OFFSET),
    new THREE.Vector2(1.25, -5.40 + LQ_LAMP_BODY_OFFSET),
    new THREE.Vector2(1.75, -4.60 + LQ_LAMP_BODY_OFFSET),
    new THREE.Vector2(2.20, -3.80 + LQ_LAMP_BODY_OFFSET),
    new THREE.Vector2(2.55, -3.00 + LQ_LAMP_BODY_OFFSET),
    new THREE.Vector2(2.45, -2.40 + LQ_LAMP_BODY_OFFSET),
    new THREE.Vector2(1.80, -1.90 + LQ_LAMP_BODY_OFFSET),
    new THREE.Vector2(0.95, -1.45 + LQ_LAMP_BODY_OFFSET)
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(bodyPoints, 32), glassMat);
  lampGroup.add(body);

  const alcoholMat = new THREE.MeshPhysicalMaterial({ color: 0xcceeff, transparent: true, opacity: 0.55, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false });
  const alcoholPoints = [
    new THREE.Vector2(0.85, -6.00 + LQ_LAMP_BODY_OFFSET),
    new THREE.Vector2(1.15, -5.25 + LQ_LAMP_BODY_OFFSET),
    new THREE.Vector2(1.60, -4.50 + LQ_LAMP_BODY_OFFSET),
    new THREE.Vector2(2.00, -3.80 + LQ_LAMP_BODY_OFFSET),
    new THREE.Vector2(2.05, -3.30 + LQ_LAMP_BODY_OFFSET),
    new THREE.Vector2(1.55, -2.70 + LQ_LAMP_BODY_OFFSET)
  ];
  const alcohol = new THREE.Mesh(new THREE.LatheGeometry(alcoholPoints, 32), alcoholMat);
  lampGroup.add(alcohol);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.88, 1.15, 16, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false }));
  neck.position.set(0, -0.90 + LQ_LAMP_BODY_OFFSET, 0);
  lampGroup.add(neck);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.95, 0.70, 24), new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.4 }));
  cap.position.set(0, -0.30 + LQ_LAMP_BODY_OFFSET, 0);
  lampGroup.add(cap);

  const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.65, 10), new THREE.MeshStandardMaterial({ color: 0x555555 }));
  wick.position.set(0, 0.10 + LQ_LAMP_BODY_OFFSET, 0);
  lampGroup.add(wick);

  registerLiquefyTooltip(body, '酒精灯', '热源');

  lqFlameGroup = new THREE.Group();
  lqFlameGroup.position.set(0, 1.05, 0);
  lampGroup.add(lqFlameGroup);

  lqFlameDisc = new THREE.Mesh(new THREE.CircleGeometry(0.34, 24), new THREE.MeshBasicMaterial({ color: 0xff5722, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
  lqFlameDisc.rotation.x = -Math.PI / 2;
  lqFlameDisc.position.y = -0.15;
  lqFlameGroup.add(lqFlameDisc);

  const innerCone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.1, 14), new THREE.MeshBasicMaterial({ color: 0xffcc80, transparent: true, opacity: 0.9, depthWrite: false }));
  innerCone.position.set(0, 0.25, 0);
  innerCone.userData.inner = true;
  lqFlameGroup.add(innerCone);
  lqFlameCones.push(innerCone);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.9, 12), new THREE.MeshBasicMaterial({ color: 0xff5722, transparent: true, opacity: 0.72, depthWrite: false }));
    c.position.set(Math.cos(a) * 0.26, 0.18, Math.sin(a) * 0.26);
    c.rotation.x = Math.PI / 10;
    c.userData.inner = false;
    lqFlameGroup.add(c);
    lqFlameCones.push(c);
  }
  lqFlameGroup.visible = false;
}

function buildLiquefyPlate(g) {
  const plateMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transparent: true, opacity: 0.35,
    roughness: 0.05, metalness: 0.0, transmission: 0.65,
    thickness: 0.15, ior: 1.5,
    side: THREE.DoubleSide, depthWrite: false
  });
  lqGlassPlate = new THREE.Mesh(new THREE.BoxGeometry(LQ_PLATE_HALF_W * 2, LQ_PLATE_THICK, LQ_PLATE_HALF_D * 2), plateMat);
  lqGlassPlate.position.copy(LQ_PLATE_POS);
  lqGlassPlate.rotation.z = LQ_PLATE_TILT;
  lqGlassPlate.renderOrder = 3;
  g.add(lqGlassPlate);

  const edgeGeo = new THREE.EdgesGeometry(lqGlassPlate.geometry);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xcceeff, transparent: true, opacity: 0.75, depthWrite: false });
  const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
  edgeLine.position.copy(LQ_PLATE_POS);
  edgeLine.rotation.z = LQ_PLATE_TILT;
  edgeLine.renderOrder = 4;
  g.add(edgeLine);

  const metal = new THREE.MeshStandardMaterial({ color: 0x3d3d45, metalness: 0.55, roughness: 0.45 });
  const backMid = new THREE.Vector3(
    -LQ_PLATE_HALF_W,
    LQ_PLATE_POS.y + (-LQ_PLATE_HALF_W) * Math.tan(LQ_PLATE_TILT),
    0
  );
  const bracketLen = Math.abs(backMid.x - LQ_STAND_X);
  const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, bracketLen, 16), metal);
  bracket.rotation.z = Math.PI / 2;
  bracket.position.set((LQ_STAND_X + backMid.x) / 2, backMid.y, 0);
  g.add(bracket);
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, LQ_PLATE_HALF_D * 1.4), metal);
  clip.position.copy(backMid);
  clip.position.y += 0.05;
  clip.rotation.z = LQ_PLATE_TILT;
  g.add(clip);

  registerLiquefyTooltip(lqGlassPlate, '玻璃片', '冰冷的玻璃片：热的水蒸气遇到冰冷的玻璃片，在玻璃片表面凝结成小水珠');
  registerLiquefyTooltip(edgeLine, '玻璃片', '冰冷的玻璃片：热的水蒸气遇到冰冷的玻璃片，在玻璃片表面凝结成小水珠');
  registerLiquefyTooltip(bracket, '铁架台', '固定玻璃片');
  registerLiquefyTooltip(clip, '铁架台', '固定玻璃片');
}

function updateLiquefyPlateMath() {
  const s = Math.sin(LQ_PLATE_TILT);
  const c = Math.cos(LQ_PLATE_TILT);
  lqPlateNormal.set(s, c, 0).normalize();
  const gProj = new THREE.Vector3(0, -1, 0).projectOnPlane(lqPlateNormal);
  lqPlateDownhill.copy(gProj).normalize();
  if (lqPlateDownhill.lengthSq() < 0.5) lqPlateDownhill.set(c, -s, 0);

  lqLowEdge.set(LQ_PLATE_HALF_W * c, LQ_PLATE_POS.y + LQ_PLATE_HALF_W * s, 0);
}

function buildLiquefyTube(g) {
  const s = Math.sin(LQ_PLATE_TILT);
  const c = Math.cos(LQ_PLATE_TILT);
  const start = new THREE.Vector3(LQ_PLATE_HALF_W * c, LQ_PLATE_POS.y + LQ_PLATE_HALF_W * s - 0.08, 0);
  const end = new THREE.Vector3(LQ_COLLECT_POS.x, LQ_COLLECT_BOTTOM_Y + LQ_COLLECT_H + 1.0, 0);
  const mid1 = new THREE.Vector3(start.x + 1.5, start.y - 1.0, 0);
  const mid2 = new THREE.Vector3(end.x - 1.0, end.y + 0.3, 0);
  lqTubeCurve = new THREE.CatmullRomCurve3([start, mid1, mid2, end]);
  lqTubeLength = lqTubeCurve.getLength();

  const tubeMat = new THREE.MeshPhysicalMaterial({ color: 0xaaccff, transparent: true, opacity: 0.35, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false });
  lqTube = new THREE.Mesh(new THREE.TubeGeometry(lqTubeCurve, 32, LQ_TUBE_R, 12, false), tubeMat);
  lqTube.renderOrder = 3;
  g.add(lqTube);

  registerLiquefyTooltip(lqTube, '导管', '引导凝结水珠流入收集烧杯');
}

function buildLiquefyCollectBeaker(g) {
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xaaccff, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(LQ_COLLECT_R, LQ_COLLECT_R, LQ_COLLECT_H, 32, 1, true), glassMat);
  wall.position.copy(LQ_COLLECT_POS);
  wall.renderOrder = 1;
  g.add(wall);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(LQ_COLLECT_R, 0.05, 8, 48), new THREE.MeshBasicMaterial({ color: 0x88aaff, depthWrite: false }));
  edge.rotation.x = Math.PI / 2;
  edge.position.set(LQ_COLLECT_POS.x, LQ_COLLECT_BOTTOM_Y + LQ_COLLECT_H, LQ_COLLECT_POS.z);
  edge.renderOrder = 1;
  g.add(edge);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(LQ_COLLECT_R - 0.2, 40), new THREE.MeshPhysicalMaterial({ color: 0xaaccff, transparent: true, opacity: 0.25, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false }));
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.set(LQ_COLLECT_POS.x, LQ_COLLECT_BOTTOM_Y + 0.2, LQ_COLLECT_POS.z);
  bottom.renderOrder = 1;
  g.add(bottom);

  const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x64d8ff, transparent: true, opacity: 0.55, roughness: 0.12, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false });
  lqCollectWater = new THREE.Mesh(new THREE.CylinderGeometry(LQ_COLLECT_R - 0.25, LQ_COLLECT_R - 0.25, 1, 32), waterMat);
  lqCollectWater.position.set(LQ_COLLECT_POS.x, LQ_COLLECT_BOTTOM_Y + 0.45, LQ_COLLECT_POS.z);
  lqCollectWater.scale.y = 0.1;
  lqCollectWater.renderOrder = 2;
  g.add(lqCollectWater);

  registerLiquefyTooltip(wall, '收集烧杯', '收集液化下来的小水珠');
  registerLiquefyTooltip(lqCollectWater, '收集烧杯', '收集液化下来的小水珠');
}

function buildLiquefyDroplets(g) {
  const geo = new THREE.SphereGeometry(0.18, 10, 10);
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xd7f0ff, transparent: true, opacity: 0.85, roughness: 0.05, metalness: 0.1 });
  lqDropletMesh = new THREE.InstancedMesh(geo, mat, LQ_MAX_DROPS);
  lqDropletMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  lqDropletMesh.renderOrder = 4;
  g.add(lqDropletMesh);
  for (let i = 0; i < LQ_MAX_DROPS; i++) {
    lqDroplets.push({ phase: 'idle', pos: new THREE.Vector3(), scale: 0, tubeT: 0, fallV: 0 });
  }
}

function buildLiquefySteam(g) {
  const geo = new THREE.SphereGeometry(0.14, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false });
  lqSteamMesh = new THREE.InstancedMesh(geo, mat, LQ_MAX_STEAM);
  lqSteamMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  lqSteamMesh.renderOrder = 5;
  g.add(lqSteamMesh);
  for (let i = 0; i < LQ_MAX_STEAM; i++) {
    lqSteam.push({
      active: false,
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      swayPhase: lqSeeded(i) * Math.PI * 2,
      life: 0
    });
  }
}

function spawnLiquefyDroplet(x, y, z) {
  for (let i = 0; i < LQ_MAX_DROPS; i++) {
    const d = lqDroplets[i];
    if (d.phase === 'idle') {
      d.phase = 'growing';
      d.pos.set(x, y, z);
      d.scale = 0.06;
      d.tubeT = 0;
      d.fallV = 0;
      return;
    }
  }
}

function spawnLiquefySteam(count) {
  let spawned = 0;
  for (let i = 0; i < LQ_MAX_STEAM; i++) {
    const p = lqSteam[i];
    if (!p.active && spawned < count) {
      p.active = true;
      const r = Math.sqrt(lqSeeded(i * 7 + spawned)) * (LQ_BEAKER_R - 0.5);
      const a = lqSeeded(i * 7 + spawned + 1) * Math.PI * 2;
      p.pos.set(r * Math.cos(a), LQ_RIM_Y + 0.05 + lqSeeded(i * 7 + spawned + 2) * 0.2, r * Math.sin(a));
      p.vel.set((lqSeeded(i * 7 + spawned + 3) - 0.5) * 0.6, 1.2 + lqSeeded(i * 7 + spawned + 4) * 0.8, (lqSeeded(i * 7 + spawned + 5) - 0.5) * 0.6);
      p.swayPhase = lqSeeded(i * 7 + spawned + 6) * Math.PI * 2;
      p.life = 0;
      spawned++;
    }
  }
}

function setLiquefyGroupVisible(visible) {
  if (liquefyGroup) liquefyGroup.visible = visible;
  if (visible) {
    if (window.boilGroup) window.boilGroup.visible = false;
    if (window.evapGroup) window.evapGroup.visible = false;
  }
}

function resetLiquefy() {
  lqDroplets.forEach(d => { d.phase = 'idle'; d.scale = 0; });
  lqSteam.forEach(p => { p.active = false; });
  lqCollectedCount = 0;
  lqSteamSpawnAcc = 0;
  if (lqCollectWater) lqCollectWater.scale.y = 0.1;
  if (lqFlameGroup) lqFlameGroup.visible = false;
  if (lqBeakerWater) {
    lqBeakerWater.scale.y = lqBeakerWaterBaseScale;
    lqBeakerWater.position.y = lqBeakerWaterBaseY + lqBeakerWaterBaseScale / 2;
  }
}

function updateLiquefyLamp() {
  if (!lqFlameGroup) return;
  const on = !!(state && state.heating);
  lqFlameGroup.visible = on;
  if (!on || !lqFlameCones.length) return;
  const p = { base: 1.0, inner: 0xffcc80, outer: 0xff5722, disc: 0xff5722, discOp: 0.5 };
  const t = performance.now() * 0.006;
  lqFlameCones.forEach((c, i) => {
    const w = c.userData.inner ? p.base : p.base * 0.9;
    const flicker = 1 + Math.sin(t + i * 0.8) * 0.06;
    c.material.color.setHex(c.userData.inner ? p.inner : p.outer);
    c.scale.set(w * flicker, p.base * flicker, w * flicker);
  });
  if (lqFlameDisc) {
    lqFlameDisc.material.color.setHex(p.disc);
    lqFlameDisc.material.opacity = p.discOp;
    lqFlameDisc.scale.setScalar(p.base * (1 + Math.sin(t) * 0.05));
  }
}

function updateLiquefy(dt) {
  if (!liquefyGroup || !liquefyGroup.visible) return;
  const T = state ? state.waterTemp : 25;
  const heating = !!(state && state.heating);
  const boiling = !!(state && state.boiling);
  if (heating && !lqPrevHeating) lqHeatStartMs = performance.now();
  lqPrevHeating = heating;
  lqLastWaterTemp = T;

  updateLiquefyLamp();

  if (heating && T > 40) {
    const u = Math.min(1, (T - 40) / 60);
    const baseRate = boiling ? 28 : (0.5 + 24.5 * u * u);
    lqSteamSpawnAcc += baseRate * dt;
    while (lqSteamSpawnAcc >= 1) {
      spawnLiquefySteam(1);
      lqSteamSpawnAcc -= 1;
    }
  }

  const plateYAt = (x) => LQ_PLATE_POS.y + x * Math.tan(LQ_PLATE_TILT);
  const dummy = lqDummy;
  const t = performance.now() * 0.001;

  for (let i = 0; i < LQ_MAX_STEAM; i++) {
    const p = lqSteam[i];
    if (!p.active) {
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      lqSteamMesh.setMatrixAt(i, dummy.matrix);
      continue;
    }
    p.life += dt;
    p.pos.x += p.vel.x * dt + Math.sin(t * 2 + p.swayPhase) * 0.15 * dt;
    p.pos.z += p.vel.z * dt + Math.cos(t * 1.5 + p.swayPhase) * 0.12 * dt;
    p.pos.y += p.vel.y * dt;

    const py = plateYAt(p.pos.x);
    if (p.pos.y > py && Math.abs(p.pos.x) <= LQ_PLATE_HALF_W && Math.abs(p.pos.z) <= LQ_PLATE_HALF_D) {
      let condenseChance;
      if (T <= 40) condenseChance = 0;
      else {
        const u = Math.min(1, (T - 40) / 60);
        condenseChance = 0.001 + (boiling ? 0.38 : 0.30) * u * u;
      }
      if (Math.random() < condenseChance) spawnLiquefyDroplet(p.pos.x, py - 0.05, p.pos.z);
      p.active = false;
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      lqSteamMesh.setMatrixAt(i, dummy.matrix);
      continue;
    }
    if (p.pos.y > LQ_PLATE_POS.y + 4.0) p.active = false;

    const sc = Math.max(0.001, 0.5 + Math.min(1, p.life * 0.8));
    dummy.position.copy(p.pos);
    dummy.scale.setScalar(sc);
    dummy.updateMatrix();
    lqSteamMesh.setMatrixAt(i, dummy.matrix);
  }
  lqSteamMesh.instanceMatrix.needsUpdate = true;

  const lowEdge = lqLowEdge;
  const downhill = lqPlateDownhill;
  const tubeEnd = lqTubeCurve ? lqTubeCurve.getPointAt(1) : new THREE.Vector3(LQ_COLLECT_POS.x, LQ_COLLECT_BOTTOM_Y + LQ_COLLECT_H + 1, 0);
  const waterSurfaceY = LQ_COLLECT_BOTTOM_Y + 0.45 + 4.2 * Math.min(1, lqCollectedCount / LQ_FULL_DROPS);

  for (let i = 0; i < LQ_MAX_DROPS; i++) {
    const d = lqDroplets[i];
    if (d.phase === 'idle') {
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      lqDropletMesh.setMatrixAt(i, dummy.matrix);
      continue;
    }

    if (d.phase === 'growing') {
      d.scale += dt * 0.25;
      if (d.scale >= 0.28) d.phase = 'flowing';
    } else if (d.phase === 'flowing') {
      d.pos.addScaledVector(downhill, dt * 1.0);
      const dx = d.pos.x - LQ_PLATE_POS.x;
      const dy = d.pos.y - LQ_PLATE_POS.y;
      const distAlong = dx * Math.cos(LQ_PLATE_TILT) + dy * Math.sin(LQ_PLATE_TILT);
      if (distAlong >= LQ_PLATE_HALF_W - 0.15 || d.pos.y <= lowEdge.y + 0.05) {
        d.phase = 'tube';
        d.tubeT = 0;
      }
    } else if (d.phase === 'tube') {
      d.tubeT += (dt * 1.2) / Math.max(0.5, lqTubeLength);
      if (d.tubeT >= 1) {
        d.tubeT = 1;
        d.phase = 'falling';
        d.pos.copy(tubeEnd);
        d.fallV = 0;
      } else {
        d.pos.copy(lqTubeCurve.getPointAt(d.tubeT));
      }
    } else if (d.phase === 'falling') {
      d.fallV += 9.8 * dt;
      d.pos.y -= d.fallV * dt;
      if (d.pos.y <= waterSurfaceY) {
        d.phase = 'idle';
        lqCollectedCount++;
      }
    }

    if (d.phase !== 'idle') {
      dummy.position.copy(d.pos);
      dummy.scale.setScalar(Math.max(0.001, d.scale));
      dummy.updateMatrix();
      lqDropletMesh.setMatrixAt(i, dummy.matrix);
    }
  }
  lqDropletMesh.instanceMatrix.needsUpdate = true;

  if (lqCollectWater) {
    const targetH = Math.max(0.1, 4.2 * Math.min(1, lqCollectedCount / LQ_FULL_DROPS));
    lqCollectWater.scale.y += (targetH - lqCollectWater.scale.y) * (1 - Math.exp(-dt * 8));
    lqCollectWater.position.y = LQ_COLLECT_BOTTOM_Y + 0.45 + lqCollectWater.scale.y / 2;
  }

  if (state && !state.liquefy) state.liquefy = {};
  if (state && state.liquefy) {
    state.liquefy.waterTemp = T;
    state.liquefy.steamState = heating ? (boiling ? '沸腾·大量水蒸气' : (T > 70 ? '大量水蒸气' : '少量水蒸气')) : '无';
    state.liquefy.collectedPct = Math.min(100, (lqCollectedCount / LQ_FULL_DROPS) * 100);
  }

  updateLiquefyWaterLevels(dt);
  updateLiquefyPhaseHint();
}

function updateLiquefyWaterLevels(dt) {
  if (!lqBeakerWater) return;
  const pct = (state && state.liquefy && state.liquefy.collectedPct) || 0;
  const targetScale = lqBeakerWaterBaseScale * (1 - 0.45 * Math.min(1, pct / 100));
  const k = 1 - Math.exp(-dt * 8);
  lqBeakerWater.scale.y += (targetScale - lqBeakerWater.scale.y) * k;
  lqBeakerWater.position.y = lqBeakerWaterBaseY + lqBeakerWater.scale.y / 2;
}

function updateLiquefyPhaseHint() {
  if (!lqPhaseHint) return;
  const heating = !!(state && state.heating);
  if (!heating) {
    lqPhaseHint.classList.add('hidden');
    lqPhaseHint.style.opacity = 0;
    lqPhaseHint.style.display = 'none';
    return;
  }
  lqPhaseHint.style.display = '';
  let idx = 1;
  const elapsed = performance.now() - lqHeatStartMs;
  if (elapsed < 2500) idx = 0;
  const anyGrowingOrFlowing = lqDroplets.some(d => d.phase === 'growing' || d.phase === 'flowing');
  const steam = (state.liquefy && state.liquefy.steamState) || '无';
  if (anyGrowingOrFlowing || steam.includes('大量')) idx = 2;
  const anyTubeOrFalling = lqDroplets.some(d => d.phase === 'tube' || d.phase === 'falling');
  const collectedPct = (state.liquefy && state.liquefy.collectedPct) || 0;
  if (anyTubeOrFalling || collectedPct > 0) idx = 3;
  const text = LQ_PHASE_TEXTS[idx];
  if (lqPhaseHint.dataset.text !== text) {
    lqPhaseHint.classList.remove('hidden');
    lqPhaseHint.style.opacity = 0;
    setTimeout(() => {
      lqPhaseHint.textContent = text;
      lqPhaseHint.dataset.text = text;
      lqPhaseHint.style.opacity = 1;
    }, 250);
  } else {
    lqPhaseHint.classList.remove('hidden');
  }
}

function initLiquefyTooltip() {
  if (lqTooltip) return;
  lqTooltip = document.getElementById('lq-tooltip');
  lqPhaseHint = document.getElementById('lq-phase-hint');
  if (!renderer || !renderer.domElement) return;
  lqRaycaster = new THREE.Raycaster();
  renderer.domElement.addEventListener('pointermove', onLiquefyPointerMove, { passive: true });
  renderer.domElement.addEventListener('pointerleave', hideLiquefyTooltip);
  patchLiquefyModeSwitch();
}

let lqRaycastPending = false;
let lqLastRaycastTime = 0;
function onLiquefyPointerMove(e) {
  if (!state || state.mode !== 'liquefy' || !liquefyGroup || !liquefyGroup.visible) {
    hideLiquefyTooltip();
    return;
  }
  const rect = renderer.domElement.getBoundingClientRect();
  lqPointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  lqPointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  lqTooltipPos.x = e.clientX;
  lqTooltipPos.y = e.clientY;
  const now = performance.now();
  if (now - lqLastRaycastTime < 70) {
    if (!lqRaycastPending) {
      lqRaycastPending = true;
      requestAnimationFrame(() => { lqRaycastPending = false; doLiquefyRaycast(); });
    }
  } else {
    doLiquefyRaycast();
  }
}

function doLiquefyRaycast() {
  lqLastRaycastTime = performance.now();
  if (!lqRaycaster || !camera) return;
  lqRaycaster.setFromCamera(lqPointer, camera);
  const hits = lqRaycaster.intersectObjects(lqTooltipTargets, false);
  let hit = null;
  for (let i = 0; i < hits.length; i++) {
    if (hits[i].object.visible && hits[i].object.userData.lqTooltip) { hit = hits[i]; break; }
  }
  if (hit) {
    showLiquefyTooltip(hit.object.userData.lqTooltip, lqTooltipPos.x, lqTooltipPos.y);
  } else {
    hideLiquefyTooltip();
  }
}

function showLiquefyTooltip(info, x, y) {
  if (!lqTooltip) return;
  lqTooltip.querySelector('.lq-tooltip-title').textContent = info.title;
  lqTooltip.querySelector('.lq-tooltip-body').textContent = info.body;
  lqTooltip.style.display = 'block';
  const pad = 14;
  const rect = lqTooltip.getBoundingClientRect();
  let left = x + pad, top = y + pad;
  if (left + rect.width > window.innerWidth) left = x - rect.width - pad;
  if (top + rect.height > window.innerHeight) top = y - rect.height - pad;
  lqTooltip.style.left = Math.max(pad, left) + 'px';
  lqTooltip.style.top = Math.max(pad, top) + 'px';
  lqTooltip.classList.add('show');
}

function hideLiquefyTooltip() {
  if (!lqTooltip) return;
  lqTooltip.classList.remove('show');
  setTimeout(() => { if (!lqTooltip.classList.contains('show')) lqTooltip.style.display = 'none'; }, 150);
  lqHoverTarget = null;
}

function hideLiquefyOverlays() {
  hideLiquefyTooltip();
  if (lqPhaseHint) lqPhaseHint.classList.add('hidden');
}

function patchLiquefyModeSwitch() {
  const orig = window.switchMode;
  if (typeof orig !== 'function' || orig.__lqHintPatched) return;
  window.switchMode = function(mode) {
    const r = orig.apply(this, arguments);
    if (mode !== 'liquefy') hideLiquefyOverlays();
    return r;
  };
  window.switchMode.__lqHintPatched = true;
}

function switchLiquefyScene(name) {
  // 单实验模式，无需多场景切换；保留函数避免外部调用报错
}

window.__liquefyCoreReady = true;

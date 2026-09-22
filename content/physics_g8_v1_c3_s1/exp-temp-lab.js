/* exp-temp-lab.js — 温度实验室 阶段一 主逻辑 + UI + 温度计架 */
/* eslint-env browser */

const THERM_DEFS = {
  lab: { name: '实验室温度计', min: -20, max: 110, step: 1, color: 0xff5252, type: 'liquid' },
  clinical: { name: '体温计', min: 35, max: 42, step: 0.1, color: 0x7c4dff, type: 'clinical' },
  diy: { name: '自制瓶式温度计', min: -10, max: 100, step: 1, color: 0x00c853, type: 'diy' },
  digital: { name: '电子温度计', min: -30, max: 120, step: 0.1, color: 0x29b6f6, type: 'digital' }
};

let raycaster, mouse;
let isRotating = false, rotateStart = { x: 0, y: 0 };
let draggedTherm = null, dragOffset = new THREE.Vector3();
let ptrDownPos = null, ptrDownThermId = null, ptrDragStarted = false;
let lastPointerClient = { x: 0, y: 0 }; // 拖拽时最后一次的屏幕坐标（pointerup 可能无坐标时用）
let lastTime = performance.now();

function init() {
  initScene();
  bindUI();
  animate();
}

function bindUI() {
  document.querySelectorAll('.rack-item').forEach(btn => {
    btn.addEventListener('click', () => { addThermometer(btn.dataset.type); playClick(); });
  });

  bindSlider('amb', v => { state.ambTemp = v; }, ' ℃');
  bindSlider('power', v => { state.heatPower = v; updateHeatUI(); }, ' W');
  bindSlider('vol', v => { state.volumeML = v; updateWaterMesh(); }, ' mL');

  document.getElementById('btn-heat').addEventListener('click', () => {
    setHeating(!state.heating);
    updateHeatUI();
    playClick();
  });
  document.getElementById('btn-ice').addEventListener('click', () => { addIce(); updateUI(); });

  document.getElementById('btn-pause').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('btn-pause').textContent = paused ? '开始' : '暂停';
    playClick();
  });
  document.getElementById('btn-reset').addEventListener('click', () => { resetAll(); playClick(); });
  document.getElementById('btn-mute').addEventListener('click', () => {
    setSoundEnabled(!getSoundEnabled());
    document.getElementById('btn-mute').textContent = getSoundEnabled() ? '🔊' : '🔇';
    playClick();
  });

  const shakeBtn = document.getElementById('clinical-shake');
  shakeBtn.addEventListener('click', () => { shakeSelectedClinical(); playClick(); });

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
  renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
  renderer.domElement.addEventListener('touchend', onTouchEnd);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('resize', onResize);

  const tsSel = document.getElementById('timescale-select');
  if (tsSel) tsSel.addEventListener('change', () => {
    state.timeScale = parseFloat(tsSel.value);
    playClick();
  });
  document.getElementById('btn-pause').textContent = paused ? '开始' : '暂停';

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
}

function bindSlider(name, setter, unit) {
  const slider = document.getElementById(name + '-slider');
  const minus = document.getElementById(name + '-minus');
  const plus = document.getElementById(name + '-plus');
  const val = document.getElementById(name + '-val');
  const step = parseFloat(slider.step);
  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    setter(v);
    val.textContent = v + unit;
    throttledSliderTick();
    updateUI();
  });
  minus.addEventListener('click', () => { slider.value = Math.max(slider.min, parseFloat(slider.value) - step); slider.dispatchEvent(new Event('input')); playClick(); });
  plus.addEventListener('click', () => { slider.value = Math.min(slider.max, parseFloat(slider.value) + step); slider.dispatchEvent(new Event('input')); playClick(); });
}

function updateHeatUI() {
  const btn = document.getElementById('btn-heat');
  btn.textContent = state.heating ? '加热：开' : '加热：关';
  btn.classList.toggle('primary', !state.heating);
  btn.classList.toggle('warn', state.heating);
}

function resetAll() {
  resetState();
  paused = true;
  setHeating(false);
  document.getElementById('btn-pause').textContent = '开始';
  const tsSel = document.getElementById('timescale-select');
  if (tsSel) tsSel.value = '60';
  state.timeScale = 60;
  document.getElementById('amb-slider').value = INITIAL.ambTemp;
  document.getElementById('power-slider').value = INITIAL.heatPower;
  document.getElementById('vol-slider').value = INITIAL.volumeML;
  document.getElementById('amb-val').textContent = INITIAL.ambTemp + ' ℃';
  document.getElementById('power-val').textContent = INITIAL.heatPower + ' W';
  document.getElementById('vol-val').textContent = INITIAL.volumeML + ' mL';
  updateHeatUI();
  updateUI();
}

function updateMouse(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function onPointerDown(e) {
  if (!e.target.closest('#canvas-container') || e.button !== 0) return;
  ensureAudioContext();
  updateMouse(e);
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  for (const hit of hits) {
    const id = hit.object.userData.thermId;
    if (id) {
      const t = thermometers.find(x => x.id === id);
      if (t && !draggedTherm) {
        ptrDownPos = { x: e.clientX, y: e.clientY };
        ptrDownThermId = id;
        ptrDragStarted = false;
        selectedThermometer = id;
      }
      return;
    }
  }
  ptrDownPos = { x: e.clientX, y: e.clientY };
  ptrDownThermId = null;
  isRotating = true;
  rotateStart.x = e.clientX;
  rotateStart.y = e.clientY;
}

function startDragTherm(id, point) {
  selectedThermometer = id;
  draggedTherm = id;
  const trashEl = document.getElementById('trash-bin');
  if (trashEl) trashEl.classList.add('lit'); // 拖动时点亮垃圾桶
  const t = thermometers.find(x => x.id === id);
  if (t) dragOffset.copy(point).sub(t.meshGroup.position);
}

function removeThermometer(t) {
  scene.remove(t.meshGroup);
  const idx = thermometers.indexOf(t);
  if (idx >= 0) thermometers.splice(idx, 1);
  if (selectedThermometer === t.id) selectedThermometer = null;
  playClick();
}

function clampDragPos(p) {
  // R3：拖拽限幅——y 不低于桌面顶上方 0.1，x/z 限在桌面 80×60 内留边，防温度计沉入桌体被遮
  p.y = Math.max(p.y, -6.1);
  p.x = Math.max(-39, Math.min(39, p.x));
  p.z = Math.max(-29, Math.min(29, p.z));
  return p;
}

function onPointerMove(e) {
  if (ptrDownThermId != null && !ptrDragStarted && ptrDownPos) {
    const dx = e.clientX - ptrDownPos.x;
    const dy = e.clientY - ptrDownPos.y;
    if (dx * dx + dy * dy >= 25) {
      ptrDragStarted = true;
      updateMouse(e);
      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), new THREE.Vector3(0, 0, 0));
      const point = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, point)) startDragTherm(ptrDownThermId, point);
      else { selectedThermometer = ptrDownThermId; draggedTherm = ptrDownThermId; dragOffset.set(0, 0, 0); }
    }
  }
  if (isRotating) {
    updateCameraRotation(e.clientX - rotateStart.x, e.clientY - rotateStart.y);
    rotateStart.x = e.clientX;
    rotateStart.y = e.clientY;
    return;
  }
  if (!draggedTherm) return;
  lastPointerClient.x = e.clientX;
  lastPointerClient.y = e.clientY;
  updateMouse(e);
  raycaster.setFromCamera(mouse, camera);
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), new THREE.Vector3(0, 0, 0));
  const target = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, target);
  if (target) {
    const t = thermometers.find(x => x.id === draggedTherm);
    if (t) { t.meshGroup.position.copy(target).sub(dragOffset); clampDragPos(t.meshGroup.position); }
  }
}

function onPointerUp(e) {
  const trashEl = document.getElementById('trash-bin');
  if (draggedTherm && trashEl) trashEl.classList.remove('lit');
  if (ptrDownThermId != null && !ptrDragStarted) {
    const t = thermometers.find(x => x.id === ptrDownThermId);
    if (t) { toggleThermometerInOut(t); playClick(); }
  } else if (draggedTherm) {
    const t = thermometers.find(x => x.id === draggedTherm);
    if (t) {
      // 坐标兼容：优先用 pointerup 事件坐标，无坐标时用拖拽中最后记录的位置
      const cx = (e && typeof e.clientX === 'number') ? e.clientX : lastPointerClient.x;
      const cy = (e && typeof e.clientY === 'number') ? e.clientY : lastPointerClient.y;
      let inTrash = false;
      if (trashEl) {
        const r = trashEl.getBoundingClientRect();
        inTrash = cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
      }
      if (inTrash) removeThermometer(t); // 入桶即删除，不吸附
      else snapThermometer(t);
    }
  }
  ptrDownPos = null;
  ptrDownThermId = null;
  ptrDragStarted = false;
  draggedTherm = null;
  isRotating = false;
}

let pinchStartDist = 0;
function onTouchStart(e) {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    pinchStartDist = Math.hypot(dx, dy);
  }
}
function onTouchMove(e) {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    if (pinchStartDist > 0) {
      const delta = (pinchStartDist - dist) * 0.05;
      cameraState.distance = THREE.MathUtils.clamp(cameraState.distance + delta, CAM_MIN_DIST, CAM_MAX_DIST);
      applyCameraOrbit();
    }
    pinchStartDist = dist;
  }
}
function onTouchEnd(e) {
  if (e.touches.length < 2) pinchStartDist = 0;
}

function getThermSlotIndex() {
  return thermometers.filter(x => x.inWater).length;
}

function getSlotPosition(idx) {
  const radius = 3.2; // 烧杯放大后环形散开半径，6 支间距≈3.3 单位不重叠
  const angle = (idx * Math.PI * 2) / 6;
  return new THREE.Vector3(Math.cos(angle) * radius, -4.9 + beakerWaterHeight() - 0.3, Math.sin(angle) * radius);
}

function getTablePosition(idx) {
  return new THREE.Vector3(-10 + (idx % 4) * 2.2, -5.75, 5 + Math.floor(idx / 4) * 2);
}

function snapThermometer(t) {
  const dist = Math.sqrt(t.meshGroup.position.x * t.meshGroup.position.x + t.meshGroup.position.z * t.meshGroup.position.z);
  if (dist < 6.2 && t.meshGroup.position.y > -6.5 && t.meshGroup.position.y < 3.5) {
    t.inWater = true;
    const slot = getSlotPosition(t.slotIndex);
    t.targetPos = slot.clone();
  } else {
    t.inWater = false;
    t.targetPos = getTablePosition(t.slotIndex).clone();
  }
}

function toggleThermometerInOut(t) {
  if (t.inWater) {
    t.inWater = false;
    t.targetPos = getTablePosition(t.slotIndex).clone();
  } else {
    t.inWater = true;
    t.targetPos = getSlotPosition(t.slotIndex).clone();
  }
}

// ===== Thermometer creation =====
function addThermometer(type) {
  if (thermometers.length >= 6) return;
  const def = THERM_DEFS[type];
  const group = new THREE.Group();
  group.userData.thermId = nextThermId;
  const id = nextThermId++;
  const slotIndex = thermometers.length;
  group.position.set(-8, -5.75, 5);

  if (type === 'diy') buildDIY(group, def);
  else if (type === 'digital') buildDigital(group, def);
  else buildTube(group, def, type);

  scene.add(group);
  const t = { id, type, def, meshGroup: group, inWater: true, reading: state.waterTemp, retainedReading: state.ambTemp, targetPos: getSlotPosition(slotIndex), slotIndex };
  thermometers.push(t);
  selectedThermometer = id;
  updateUI();
}

function buildTube(group, def, type) {
  const isClinical = type === 'clinical';
  const tubeLen = isClinical ? 6 : 10;              // 玻璃管长
  const tubeR = isClinical ? 0.2 : 0.23;            // 外半径
  const bulbR = isClinical ? 0.4 : 0.45;
  const bulbY = isClinical ? 0.25 : 0.3;
  const tubeBottom = isClinical ? 0.95 : 0.6;       // 液柱底端
  const usableLen = tubeLen - tubeBottom - 0.15;    // 液柱可用生长长度

  // 玻璃外壳（体温计=三棱柱，教材特征）
  const glassGeo = isClinical
    ? new THREE.CylinderGeometry(tubeR, tubeR, tubeLen, 3)
    : new THREE.CylinderGeometry(tubeR, tubeR, tubeLen, 16, 1, true);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.y = tubeLen / 2;
  if (isClinical) glass.rotation.y = Math.PI / 3;   // 让平面对准 +z，便于贴刻度
  group.add(glass);

  // 感温泡（R3：体温计=细圆柱水银泡；实验室=红球泡不动）
  if (isClinical) {
    const shellGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.6, 16);
    const shell = new THREE.Mesh(shellGeo, glassMat); // 透明玻璃壳，底 y=0=感温点不穿桌
    shell.position.y = 0.3;
    group.add(shell);
    const hgGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.55, 14);
    const hgMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.85, roughness: 0.3 });
    const hg = new THREE.Mesh(hgGeo, hgMat); // 内层银色水银柱
    hg.position.y = 0.3;
    group.add(hg);
  } else {
    const bulbGeo = new THREE.SphereGeometry(bulbR, 20, 16);
    const bulbMat = new THREE.MeshStandardMaterial({ color: def.color });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.y = bulbY;
    group.add(bulb);
  }

  if (isClinical) {
    // 缩口：球泡上方 y=0.55~0.95 细颈（教材特征）
    const neckGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 10);
    const neck = new THREE.Mesh(neckGeo, new THREE.MeshStandardMaterial({ color: 0xc9d2d9 }));
    neck.position.y = 0.75;
    group.add(neck);
  }

  // 液柱：几何原点=底端，scale.y 沿 +y 向上生长
  const liqR = isClinical ? 0.08 : 0.09;
  const liqGeo = new THREE.CylinderGeometry(liqR, liqR, 1, 12);
  liqGeo.translate(0, 0.5, 0);
  const liqMat = new THREE.MeshBasicMaterial({ color: isClinical ? 0xc0c0c0 : def.color });
  const liquid = new THREE.Mesh(liqGeo, liqMat);
  liquid.position.y = tubeBottom;
  liquid.scale.y = usableLen * 0.15;
  group.add(liquid);
  group.userData.liquid = liquid;
  group.userData.tubeBottom = tubeBottom;
  group.userData.tubeLen = usableLen;

  // 刻度：canvas 贴图白色窄条，朝 +z；256×2048 高分辨率（R2：翻倍，数字清晰）
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 2048;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#ffffff';
  cx.fillRect(0, 0, 256, 2048);
  const minorStep = isClinical ? 0.1 : 2;      // 短线间隔（体温计0.1℃ / 实验室2℃）
  const perMajor = isClinical ? 10 : 5;        // 每多少短线一条长线（1℃ / 10℃）
  const n = Math.round((def.max - def.min) / minorStep);
  for (let i = 0; i <= n; i++) {
    const T = def.min + i * minorStep;
    const y = 60 + (1 - i / n) * 1928;
    const major = i % perMajor === 0;
    cx.strokeStyle = '#222222';
    cx.lineWidth = major ? 8 : 4;
    cx.beginPath();
    cx.moveTo(major ? 156 : 192, y);
    cx.lineTo(248, y);
    cx.stroke();
    const labeled = isClinical ? major : (major && T % 20 === 0 && T >= 0 && T <= 100);
    if (labeled) {
      cx.fillStyle = '#111111';
      cx.font = 'bold 76px sans-serif';
      cx.textAlign = 'left';
      cx.textBaseline = 'middle';
      cx.fillText(String(Math.round(T)), 12, y);
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const stripGeo = new THREE.PlaneGeometry(isClinical ? 0.45 : 0.62, usableLen);
  const stripY = tubeBottom + usableLen / 2;
  // R3：贴条移到液柱背面（z 负），FrontSide 剔除镜像背面；stripBack 旋转 π 让 -z 视角也看正面字
  const stripFront = new THREE.Mesh(stripGeo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.FrontSide }));
  stripFront.position.set(0, stripY, isClinical ? -0.11 : -0.24);
  group.add(stripFront);
  const stripBack = new THREE.Mesh(stripGeo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.FrontSide }));
  stripBack.rotation.y = Math.PI;
  stripBack.position.set(0, stripY, isClinical ? -0.12 : -0.25);
  group.add(stripBack);

  // 让每个子网格可被 raycaster 识别为这支温度计
  group.traverse(o => { if (o !== group) o.userData.thermId = group.userData.thermId; });
}

function buildDIY(group, def) {
  // 口服液玻璃瓶：圆柱瓶身（略上窄下宽），底坐原点，感温点在原点附近
  const bottleGeo = new THREE.CylinderGeometry(0.5, 0.55, 1.5, 20);
  const bottleMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
  const bottle = new THREE.Mesh(bottleGeo, bottleMat);
  bottle.position.y = 0.75; // 底坐原点、顶到 1.5
  group.add(bottle);

  // 瓶内有色水（教材：绿色/def.color）
  const waterGeo = new THREE.CylinderGeometry(0.42, 0.46, 1.2, 18);
  const waterMat = new THREE.MeshStandardMaterial({ color: def.color, transparent: true, opacity: 0.7 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 0.7;
  group.add(water);

  // 橡皮塞：棕色，坐在瓶口
  const corkGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.35, 16);
  const corkMat = new THREE.MeshStandardMaterial({ color: 0x8d5a2b });
  const cork = new THREE.Mesh(corkGeo, corkMat);
  cork.position.y = 1.6;
  group.add(cork);

  // 细吸管：透明玻璃，从瓶口向上长出
  const strawGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.2, 12, 1, true);
  const strawMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
  const straw = new THREE.Mesh(strawGeo, strawMat);
  straw.position.y = 1.7 + 1.6; // 管底 1.7 接瓶口上方
  group.add(straw);

  // 液柱：无刻度，液面高度随温度变化即教材现象
  const liqGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 12);
  liqGeo.translate(0, 0.5, 0);
  const liquid = new THREE.Mesh(liqGeo, new THREE.MeshBasicMaterial({ color: 0x00c853 }));
  liquid.position.y = 1.7;
  liquid.scale.y = 2.8 * 0.2;
  group.add(liquid);
  group.userData.liquid = liquid;
  group.userData.tubeBottom = 1.7;
  group.userData.tubeLen = 2.8;

  group.traverse(o => { if (o !== group) o.userData.thermId = group.userData.thermId; });
}

function buildDigital(group, def) {
  // 金属探杆：尖端 y=0=感温点，机身在上
  const probeGeo = new THREE.CylinderGeometry(0.06, 0.04, 4, 12);
  const probeMat = new THREE.MeshStandardMaterial({ color: 0x9aa4ad, metalness: 0.7, roughness: 0.35 });
  const probe = new THREE.Mesh(probeGeo, probeMat);
  probe.position.y = 2;
  group.add(probe);

  // 白色机身
  const bodyGeo = new THREE.BoxGeometry(1.4, 2.6, 0.5);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf2f4f6 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 5.3;
  group.add(body);

  // 按钮小圆点 ×2
  [4.45, 4.2].forEach(y => {
    const btnGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12);
    const btn = new THREE.Mesh(btnGeo, new THREE.MeshStandardMaterial({ color: 0x4a4f55 }));
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0.4, y, 0.24);
    group.add(btn);
  });

  // 液晶数显屏：接口 userData.screen={canvas,ctx,texture,mesh} 保持不变
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 128, 64);
  const tex = new THREE.CanvasTexture(canvas);
  const screenGeo = new THREE.PlaneGeometry(1.1, 0.6);
  const screenMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 5.5, 0.26);
  group.add(screen);
  group.userData.screen = { canvas, ctx, texture: tex, mesh: screen };

  group.traverse(o => { if (o !== group) o.userData.thermId = group.userData.thermId; });
}

function updateThermometers() {
  thermometers.forEach(t => {
    if (t.targetPos) {
      t.meshGroup.position.lerp(t.targetPos, 0.1);
      if (t.meshGroup.position.distanceTo(t.targetPos) < 0.05) t.targetPos = null;
    }
    if (t.inWater) {
      if (t.type === 'clinical') {
        // 缩口保持：只记录峰值，水温下降读数不回落，甩一甩才复位
        t.retainedReading = Math.max(t.retainedReading, state.waterTemp);
        t.reading = t.retainedReading;
      } else {
        t.reading = state.waterTemp;
      }
    } else {
      if (t.type !== 'clinical') t.reading = state.ambTemp;
      else t.reading = t.retainedReading;
      if (t.type === 'clinical' && t.retainedReading < state.ambTemp) t.reading = state.ambTemp;
    }
    updateThermometerVisual(t);
  });
}

function updateThermometerVisual(t) {
  const def = t.def;
  let frac = (t.reading - def.min) / (def.max - def.min);
  let warn = false;
  if (frac > 1) { frac = 1; warn = true; }
  if (frac < 0) { frac = 0; warn = true; }

  if (t.type === 'digital') {
    const s = t.meshGroup.userData.screen;
    if (s) {
      s.ctx.fillStyle = '#000';
      s.ctx.fillRect(0, 0, 128, 64);
      s.ctx.fillStyle = warn ? '#ff5252' : '#29b6f6';
      s.ctx.font = 'bold 28px monospace';
      s.ctx.textAlign = 'center';
      s.ctx.fillText(t.reading.toFixed(1) + '℃', 64, 40);
      s.texture.needsUpdate = true;
    }
  } else if (t.meshGroup.userData.liquid) {
    const liq = t.meshGroup.userData.liquid;
    const len = t.meshGroup.userData.tubeLen || 1;   // 可用管长：液位高度 = frac * len，从球泡向上生长
    liq.scale.y = Math.max(0.03, frac * len);
    const baseColor = t.type === 'clinical' ? 0xc0c0c0 : def.color; // R3：银色水银
    liq.material.color.setHex(warn ? 0xff5252 : baseColor);
  }
}

// ===== UI updates =====
function updateUI() {
  document.getElementById('r-water-temp').textContent = state.waterTemp.toFixed(1) + ' ℃';
  document.getElementById('r-amb-temp').textContent = state.ambTemp.toFixed(1) + ' ℃';
  document.getElementById('r-sim-time').textContent = state.simTime.toFixed(1) + ' s';
  document.getElementById('r-ice-mass').textContent = state.iceMass.toFixed(1) + ' g';
  document.getElementById('r-power').textContent = (state.heating ? state.heatPower : 0) + ' W';

  const readingsDiv = document.getElementById('thermometer-readings');
  readingsDiv.innerHTML = '';
  thermometers.forEach(t => {
    const div = document.createElement('div');
    div.className = 'readout reading-row';
    const warn = t.reading > t.def.max || t.reading < t.def.min;
    if (warn) div.classList.add('warn');
    if (warn) {
      div.textContent = `${t.def.name}: — 超量程`; // R3：超量程只显横杠不显数字
    } else {
      div.textContent = `${t.def.name}: ${t.reading.toFixed(1)} ℃`;
    }
    readingsDiv.appendChild(div);
  });

  const shakeBtn = document.getElementById('clinical-shake');
  const clinicalOut = thermometers.find(t => t.type === 'clinical' && !t.inWater);
  if (clinicalOut) {
    shakeBtn.classList.add('active');
    shakeBtn.textContent = `甩一甩体温计 #${clinicalOut.id}`;
  } else {
    shakeBtn.classList.remove('active');
    shakeBtn.textContent = '甩一甩体温计';
  }
}

let shakeAnim = null;
function shakeSelectedClinical() {
  const t = thermometers.find(x => x.type === 'clinical' && !x.inWater);
  if (!t) return;
  playWhoosh();
  t.retainedReading = state.ambTemp;
  t.reading = state.ambTemp;
  const group = t.meshGroup;
  const startRot = group.rotation.z;
  let startTime = performance.now();
  if (shakeAnim) cancelAnimationFrame(shakeAnim);
  function frame(now) {
    const elapsed = (now - startTime) / 1000;
    if (elapsed < 0.5) {
      group.rotation.z = startRot + Math.sin(elapsed * Math.PI * 8) * 0.25;
      shakeAnim = requestAnimationFrame(frame);
    } else {
      group.rotation.z = startRot;
      shakeAnim = null;
    }
  }
  shakeAnim = requestAnimationFrame(frame);
}

// ===== Animation loop =====
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  stepPhysics(dt);
  updateWaterMesh();
  updateThermometers();

  const boilingNow = updateBubbles(dt);
  if (boilingNow && typeof playBoilThrottled === 'function') playBoilThrottled();

  updateIceCubes();

  if (flameMesh && state.heating) {
    const t = now * 0.005;
    flameMesh.scale.setScalar(1 + Math.sin(t) * 0.1);
  }

  updateUI();
  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);


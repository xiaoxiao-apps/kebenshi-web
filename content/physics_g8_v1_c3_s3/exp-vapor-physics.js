/* exp-vapor-physics.js — 沸腾探究纯物理积分（可 node 冒烟） [s3] */
/* eslint-env browser, node */

/* 升温规律（蔡总 2026-09-27 22:28）：散热损失随温度饱和增长（蒸发+对流），升温曲线先快后慢、上凸弯曲，绝非斜直线 */
const FIRE_POWER = { low: 120, medium: 150, high: 240 };
const WATER_AMOUNT = { small: 0.10, medium: 0.20, large: 0.30 };
const CP_WATER = 4180;
const K_LOSS = 1.0;
const BOILING_POINT = { vent: 100.0, sealed: 102.5 };

function boilingPoint(state) { return BOILING_POINT[state.lid || 'vent']; }

function evaporationLoss(T) {
  // 30℃ 起蒸发散热就起步，饱和式增长：低温升温快→中温变慢→高温更慢（曲线明显上凸）
  if (T <= 30) return 0;
  return 62 * (1 - Math.exp(-(T - 30) / 38));
}

/* 沸腾声音（蔡总 2026-09-27 四阶段文档）：<60几乎无声→60~85响水不开最吵→85~100渐小→沸腾开水不响（低沉、比响水阶段小很多） */
function soundLevel(T, boiling, heating) {
  if (boiling) return 0.12;
  if (!heating) return 0;
  if (T < 60) return 0;
  if (T < 75) return (T - 60) / 15;
  if (T < 85) return 1.0;
  return Math.max(0.15, 1.0 - (T - 85) / 15 * 0.85);
}

function bubbleRegime(T, boiling, bp) {
  if (boiling) return 'boil';
  if (T < 50) return 'none';
  if (T < bp - 0.05) return 'collapse';
  return 'boil';
}

/* 蔡总 2026-09-27 17:00：沸前气泡大小先由小变大（~80℃峰值）再变小，幅度要明显 */
function preboilBubbleSize(T) {
  if (T < 50) return 0.15;
  if (T < 55) return 0.15 + (T - 50) / 5 * 0.10;
  if (T < 80) return 0.25 + (T - 55) / 25 * 1.55;
  if (T < 98) return 1.80 - (T - 80) / 18 * 1.40;
  return 0.40;
}

function makeInitialState(overrides) {
  const amb = (overrides && overrides.ambTemp != null) ? overrides.ambTemp : 25;
  return {
    mode: 'boil', fire: 'medium', ambTemp: amb, amount: 'medium', timeScale: 10,
    waterTemp: amb, heating: false, boiling: false, simTime: 0,
    lid: 'vent', t90: null, recordTime: 0, lastRecordIdx: -1, dataLog: [],
    boilRecT: null, recordStop: false,
    firstHeatT: null, lastChartIdx: -1, chartLog: [],
    paused: false, soundLevel: 0, bubbleRegime: 'none',
    plateauAnnounced: false, conclusionAnnounced: false,
    hissAnnounced: false, quietAnnounced: false,
    evapSub: 'factors',
    evap: {
      factors: { temp: 35, area: 1.5, wind: 2.0, ambTemp: 25, fanBoost: 0, volumes: [1, 1], fastShown: false, slowShown: false },
      cooling: { baseT: amb, wind: 2.0, alcohol: [0, 0], drop: [0, 0], withTemp: amb, withoutTemp: amb, conclusionShown: false },
      paper: { lit: false, water: 0, filling: false, waterTemp: amb, paperTemp: amb, boiling: false, burning: false, conclusionShown: false }
    },
    ...overrides
  };
}

function fireWatts(state) { return state.heating ? (FIRE_POWER[state.fire] || 0) : 0; }
function waterMass(state) { return WATER_AMOUNT[state.amount] || 0.20; }

function recordData(state) {
  const T = state.waterTemp;
  // 蔡总 2026-09-27 17:59：从一开始就记录、无时间上限；沸后 4.5min 只触发结论不停记录（计时门控在 stepPhysics）
  const rt = (state.simTime - state.firstHeatT) / 60;
  state.recordTime = rt;
  const idx = Math.floor(rt / 0.5);
  if (idx > state.lastRecordIdx) {
    state.lastRecordIdx = idx;
    state.dataLog.push({ t: idx * 0.5, T: T });
    if (state.dataLog.length > 4000) state.dataLog.shift();
  }
  if (idx > state.lastChartIdx) {
    state.lastChartIdx = idx;
    state.chartLog.push({ t: idx * 0.5, T: T });
    if (state.chartLog.length > 4000) state.chartLog.shift();
  }
  if (state.boiling && state.boilRecT == null) state.boilRecT = rt;
  if (!state.recordStop && state.boilRecT != null && rt - state.boilRecT >= 4.5) state.recordStop = true;
}

function stepPhysics(state, dtReal) {
  if (state.paused) return;
  // 蔡总 2026-09-27 22:15：灯未点燃前不计时、不画曲线；点火后计时与曲线持续，熄灯也不停，仅重置停
  if (state.heating && state.firstHeatT == null) state.firstHeatT = state.simTime;
  if (state.firstHeatT == null) return;
  const dt = dtReal * state.timeScale;
  state.simTime += dt;
  const m = waterMass(state);
  const P = fireWatts(state);
  const mc = m * CP_WATER;
  const BP = boilingPoint(state);

  if (state.heating && state.waterTemp >= BP - 0.05) {
    state.boiling = true;
    state.waterTemp = BP;
  } else {
    state.boiling = false;
    const nSub = Math.max(1, Math.ceil(dt / 0.5));
    const h = dt / nSub;
    for (let i = 0; i < nSub; i++) {
      const T = state.waterTemp;
      const dT = (P - K_LOSS * (T - state.ambTemp) - evaporationLoss(T)) / mc * h;
      let T2 = T + dT;
      if (state.heating && T2 > BP) T2 = BP;
      if (T2 < state.ambTemp) T2 = state.ambTemp;
      state.waterTemp = T2;
    }
  }

  state.soundLevel = soundLevel(state.waterTemp, state.boiling, state.heating);
  state.bubbleRegime = bubbleRegime(state.waterTemp, state.boiling, BP);
  recordData(state);
}

function switchLid(state, lid) {
  if (!state || (lid !== 'vent' && lid !== 'sealed')) return;
  state.lid = lid;
  if (state.boiling) {
    const target = boilingPoint(state);
    const delta = target - state.waterTemp;
    if (Math.abs(delta) > 0.1) state.waterTemp += delta * 0.15;
    else state.waterTemp = target;
  }
}

function evaporationRate(T, area, wind) {
  const base = 0.0008;
  const tempFactor = Math.pow(2, (T - 25) / 22);
  const windFactor = 1 + wind * 0.65;
  return base * tempFactor * Math.max(0.1, area) * windFactor;
}

function stepEvaporationFactors(state, dtReal) {
  const dt = dtReal * state.timeScale;
  const f = state.evap.factors;
  const baseT = f.ambTemp, baseA = 1.0, baseW = f.wind;
  const leftRate = evaporationRate(baseT, baseA, baseW);
  const rightRate = evaporationRate(f.temp, f.area, baseW + f.fanBoost);
  const rates = [leftRate, rightRate];
  if (f.fanBoost > 0) {
    f.fanBoost *= Math.pow(0.5, dtReal);
    if (f.fanBoost < 0.05) f.fanBoost = 0;
  }
  for (let i = 0; i < 2; i++) {
    const V = f.volumes[i];
    const surface = Math.pow(Math.max(0.001, V), 2 / 3);
    f.volumes[i] = Math.max(0, V - rates[i] * surface * dt);
  }
  if (!f.fastShown && (f.volumes[0] - f.volumes[1] > 0.25 || f.volumes[1] < 0.5)) f.fastShown = true;
  if (!f.slowShown && (f.volumes[1] - f.volumes[0] > 0.25 || f.volumes[0] < 0.5)) f.slowShown = true;
}

function stepEvapCooling(state, dtReal) {
  const dt = dtReal * state.timeScale;
  const c = state.evap.cooling;
  const baseT = c.baseT;
  const wind = Math.max(0, c.wind);
  const tempCoeff = 1 + 0.025 * (baseT - 25);
  const maxRate = (0.012 + 5 * 0.006) * (1 + 0.025 * (40 - 25)) * 20 * state.timeScale;
  for (let i = 0; i < 2; i++) {
    const hasAlcohol = c.alcohol[i] > 0;
    let consume = 0;
    if (hasAlcohol) {
      consume = (0.012 + wind * 0.006) * tempCoeff * dt * 20;
      c.alcohol[i] = Math.max(0, c.alcohol[i] - consume);
    }
    const rate = dtReal > 0 ? consume / dtReal : 0;
    const targetDrop = hasAlcohol ? Math.min(8, (rate / maxRate) * 8) : 0;
    c.drop[i] += (targetDrop - c.drop[i]) * (1 - Math.exp(-dtReal / 2.5));
    const T = i === 0 ? c.withTemp : c.withoutTemp;
    const target = baseT - c.drop[i];
    const newT = T + (target - T) * (1 - Math.exp(-dtReal / 1.5));
    if (i === 0) c.withTemp = newT; else c.withoutTemp = newT;
  }
  if (!c.conclusionShown && c.withTemp < baseT - 2 && c.alcohol[0] > 0) c.conclusionShown = true;
}

function stepPaperPot(state, dtReal) {
  const dt = dtReal * state.timeScale;
  const p = state.evap.paper;
  const amb = state.ambTemp;
  const BP = 100.0;

  if (!p.lit) {
    p.waterTemp += -0.05 * (p.waterTemp - amb) * dt;
    p.paperTemp += -0.05 * (p.paperTemp - amb) * dt;
    p.boiling = false;
    p.burning = false;
    if (p.filling && p.water < 1) {
      p.water = Math.min(1, p.water + dt / 2);
    }
    return;
  }

  if (p.burning) {
    p.waterTemp += -0.05 * (p.waterTemp - amb) * dt;
    p.paperTemp = Math.max(amb, p.paperTemp + (250 - p.paperTemp) * 0.002 * dt);
    p.boiling = false;
    return;
  }

  if (p.water > 0) {
    const P = 240;
    const m = 0.08;
    const mc = m * CP_WATER;
    const dT = (P / mc) * dt - (0.45 / mc) * (p.waterTemp - amb) * dt;
    p.waterTemp += dT;
    if (p.waterTemp >= BP - 0.05) {
      p.waterTemp = BP;
      p.boiling = true;
    } else {
      p.boiling = false;
    }
    p.paperTemp = Math.min(182.99, p.waterTemp + 10);
    if (p.boiling) {
      const boilRate = 0.55 / 75;
      p.water = Math.max(0, p.water - boilRate * dt);
    }
  } else {
    p.waterTemp += -0.05 * (p.waterTemp - amb) * dt;
    p.boiling = false;
    p.paperTemp += 5.2 * dt;
    if (p.paperTemp >= 183) {
      p.paperTemp = 183;
      p.burning = true;
    }
  }

  if (!p.conclusionShown && p.boiling) p.conclusionShown = true;
}

function stepEvapPhysics(state, dtReal) {
  if (state.paused || state.mode !== 'evap') return;
  if (state.evapSub === 'factors') stepEvaporationFactors(state, dtReal);
  else if (state.evapSub === 'cooling') stepEvapCooling(state, dtReal);
  else if (state.evapSub === 'paper') stepPaperPot(state, dtReal);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FIRE_POWER, WATER_AMOUNT, CP_WATER, BOILING_POINT,
    makeInitialState, stepPhysics, fireWatts, waterMass, switchLid,
    soundLevel, bubbleRegime, evaporationLoss, boilingPoint, preboilBubbleSize,
    evaporationRate, stepEvaporationFactors, stepEvapCooling, stepPaperPot, stepEvapPhysics
  };
}

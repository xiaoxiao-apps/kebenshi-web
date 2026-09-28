/* exp-vapor-audio.js — 汽化液化探究馆 WebAudio 音效（零外部音频） [s1] */
/* eslint-env browser */

let audioCtx = null, soundEnabled = true, lastTickTime = 0;
const TICK_INTERVAL = 80;

function ensureAudioContext() {
  if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
}
function setSoundEnabled(v) { soundEnabled = v; }
function getSoundEnabled() { return soundEnabled; }
function masterGain(value) {
  if (!audioCtx) return null;
  const g = audioCtx.createGain(); g.connect(audioCtx.destination); g.gain.value = value; return g;
}

function playClick() {
  if (!soundEnabled) return; ensureAudioContext(); if (!audioCtx) return;
  const out = masterGain(0.12), now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
  osc.type = 'triangle'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
  g.gain.setValueAtTime(0.25, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(g); g.connect(out); osc.start(now); osc.stop(now + 0.1);
}

function playIgnite() {
  if (!soundEnabled) return; ensureAudioContext(); if (!audioCtx) return;
  const out = masterGain(0.18), now = audioCtx.currentTime;
  const noiseBuf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.18), audioCtx.sampleRate);
  const data = noiseBuf.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
  const noise = audioCtx.createBufferSource(); noise.buffer = noiseBuf;
  const filter = audioCtx.createBiquadFilter(); filter.type = 'bandpass';
  filter.frequency.setValueAtTime(600, now); filter.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
  const g = audioCtx.createGain(); g.gain.setValueAtTime(0.6, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  noise.connect(filter); filter.connect(g); g.connect(out); noise.start(now); noise.stop(now + 0.2);
}

let boilNode = null, boilGain = null, boilFilter = null;
function startBoil() {
  if (!soundEnabled || boilNode || !audioCtx) return; ensureAudioContext(); if (!audioCtx) return;
  const bufSize = Math.floor(audioCtx.sampleRate * 2);
  const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0); for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
  boilNode = audioCtx.createBufferSource(); boilNode.buffer = buffer; boilNode.loop = true;
  boilFilter = audioCtx.createBiquadFilter(); boilFilter.type = 'bandpass'; boilFilter.frequency.value = 280; boilFilter.Q.value = 1.2;
  boilGain = audioCtx.createGain(); boilGain.gain.value = 0.04;
  boilNode.connect(boilFilter); boilFilter.connect(boilGain); boilGain.connect(audioCtx.destination); boilNode.start();
}
function stopBoil() { if (!boilNode) return; try { boilNode.stop(); } catch (e) {} boilNode = null; boilGain = null; boilFilter = null; }
function setBoilVolume(soundLevel) {
  if (!boilGain) return;
  const lvl = Math.max(0, Math.min(1, soundLevel));
  const now = audioCtx.currentTime;
  boilGain.gain.setTargetAtTime(0.002 + 0.07 * lvl, now, 0.08);
  if (boilFilter) boilFilter.frequency.setTargetAtTime(180 + 260 * lvl, now, 0.08);
}

function playDrip() {
  if (!soundEnabled) return; ensureAudioContext();
  const now = performance.now(); if (now - lastTickTime < TICK_INTERVAL) return; lastTickTime = now;
  if (!audioCtx) return; const t = audioCtx.currentTime, out = masterGain(0.1);
  const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
  osc.type = 'sine'; osc.frequency.setValueAtTime(1800, t);
  g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  osc.connect(g); g.connect(out); osc.start(t); osc.stop(t + 0.05);
}

function playFanWhoosh() {
  if (!soundEnabled) return; ensureAudioContext(); if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const len = 0.8, sampleRate = audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, Math.floor(sampleRate * len), sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = audioCtx.createBufferSource(); noise.buffer = buffer;
  const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.9;
  lp.frequency.setValueAtTime(260, now);
  lp.frequency.linearRampToValueAtTime(500, now + 0.25);
  lp.frequency.linearRampToValueAtTime(260, now + 0.8);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.026, now + 0.1);
  g.gain.linearRampToValueAtTime(0.014, now + 0.45);
  g.gain.linearRampToValueAtTime(0, now + 0.8);
  const bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass';
  bp.frequency.value = 180; bp.Q.value = 1.2;
  const bg = audioCtx.createGain(); bg.gain.value = 0.06;
  noise.connect(lp); lp.connect(g); g.connect(audioCtx.destination);
  noise.connect(bp); bp.connect(bg); bg.connect(audioCtx.destination);
  noise.start(now); noise.stop(now + 0.8);
}

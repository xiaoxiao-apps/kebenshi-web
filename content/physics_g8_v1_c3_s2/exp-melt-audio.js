/* exp-melt-audio.js — 熔化凝固探究馆 WebAudio 音效（零外部音频） */
/* eslint-env browser */

let audioCtx = null;
let soundEnabled = true;
let lastTickTime = 0;
const TICK_INTERVAL = 80;

function ensureAudioContext() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

function setSoundEnabled(v) { soundEnabled = v; }
function getSoundEnabled() { return soundEnabled; }

function masterGain(value) {
  if (!audioCtx) return null;
  const g = audioCtx.createGain();
  g.connect(audioCtx.destination);
  g.gain.value = value;
  return g;
}

function playClick() {
  if (!soundEnabled) return;
  ensureAudioContext();
  const out = masterGain(0.12);
  if (!out || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
  g.gain.setValueAtTime(0.25, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(g); g.connect(out);
  osc.start(now); osc.stop(now + 0.1);
}

function playIgnite() {
  if (!soundEnabled) return;
  ensureAudioContext();
  const out = masterGain(0.18);
  if (!out || !audioCtx) return;
  const now = audioCtx.currentTime;
  const noiseBuf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.18), audioCtx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuf;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.6, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  noise.connect(filter); filter.connect(g); g.connect(out);
  noise.start(now); noise.stop(now + 0.2);
}

function playExtinguish() {
  if (!soundEnabled) return;
  ensureAudioContext();
  const out = masterGain(0.2);
  if (!out || !audioCtx) return;
  const now = audioCtx.currentTime;
  const noiseBuf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.25), audioCtx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuf;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.2);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.5, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  noise.connect(filter); filter.connect(g); g.connect(out);
  noise.start(now); noise.stop(now + 0.28);
}

function playFreezeDone() {
  if (!soundEnabled) return;
  ensureAudioContext();
  const out = masterGain(0.12);
  if (!out || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
  g.gain.setValueAtTime(0.15, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc.connect(g); g.connect(out);
  osc.start(now); osc.stop(now + 0.4);
}

let boilNode = null, boilGain = null;
function startBoil() {
  if (!soundEnabled || boilNode || !audioCtx) return;
  ensureAudioContext();
  if (!audioCtx) return;
  const bufSize = Math.floor(audioCtx.sampleRate * 2);
  const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
  boilNode = audioCtx.createBufferSource();
  boilNode.buffer = buffer;
  boilNode.loop = true;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 280;
  filter.Q.value = 1.2;
  boilGain = audioCtx.createGain();
  boilGain.gain.value = 0.04;
  boilNode.connect(filter); filter.connect(boilGain); boilGain.connect(audioCtx.destination);
  boilNode.start();
}

function stopBoil() {
  if (!boilNode) return;
  try { boilNode.stop(); } catch (e) {}
  boilNode = null; boilGain = null;
}

function playDrip() {
  if (!soundEnabled) return;
  ensureAudioContext();
  const now = performance.now();
  if (now - lastTickTime < TICK_INTERVAL) return;
  lastTickTime = now;
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const out = masterGain(0.1);
  if (!out) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1800, t);
  g.gain.setValueAtTime(0.05, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  osc.connect(g); g.connect(out);
  osc.start(t); osc.stop(t + 0.05);
}

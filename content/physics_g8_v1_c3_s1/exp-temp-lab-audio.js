/* exp-temp-lab-audio.js — WebAudio 实时合成（零外部音频） */
/* eslint-env browser */

let audioCtx = null;
let soundEnabled = true;
let lastSliderTickTime = 0;
const SLIDER_TICK_INTERVAL = 80; // ms

function ensureAudioContext() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

function setSoundEnabled(v) { soundEnabled = v; }
function getSoundEnabled() { return soundEnabled; }

function playClick() {
  if (!soundEnabled) return;
  ensureAudioContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.connect(audioCtx.destination);
  master.gain.value = 0.12;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(gain); gain.connect(master);
  osc.start(now); osc.stop(now + 0.1);
}

function playTick() {
  if (!soundEnabled) return;
  ensureAudioContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.connect(audioCtx.destination);
  master.gain.value = 0.12;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2200, now);
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
  osc.connect(gain); gain.connect(master);
  osc.start(now); osc.stop(now + 0.04);
}

function throttledSliderTick() {
  const now = performance.now();
  if (now - lastSliderTickTime > SLIDER_TICK_INTERVAL) {
    playTick();
    lastSliderTickTime = now;
  }
}

function playSplash() {
  if (!soundEnabled) return;
  ensureAudioContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.connect(audioCtx.destination);
  master.gain.value = 0.15;
  const bufferSize = Math.floor(audioCtx.sampleRate * 0.3);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  noise.connect(filter); filter.connect(gain); gain.connect(master);
  noise.start(now); noise.stop(now + 0.3);
}

function playWhoosh() {
  if (!soundEnabled) return;
  ensureAudioContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.connect(audioCtx.destination);
  master.gain.value = 0.15;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1200;
  osc.connect(filter); filter.connect(gain); gain.connect(master);
  osc.start(now); osc.stop(now + 0.25);
}

function playBoil() {
  if (!soundEnabled) return;
  ensureAudioContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.connect(audioCtx.destination);
  master.gain.value = 0.08;
  const bufferSize = Math.floor(audioCtx.sampleRate * 0.6);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 300 + Math.random() * 200;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  noise.connect(filter); filter.connect(gain); gain.connect(master);
  noise.start(now); noise.stop(now + 0.6);
}

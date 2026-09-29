/* exp-subl-audio.js — 升华凝华观察站 WebAudio 音效（零外部音频） [s1] */
/* eslint-env browser */

let audioCtx = null, soundEnabled = true;

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

/* 通用噪声缓冲 */
function noiseBuffer(seconds) {
  const len = Math.floor(audioCtx.sampleRate * seconds);
  const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/* 按钮/下拉轻咔哒 */
function playClick() {
  if (!soundEnabled) return; ensureAudioContext(); if (!audioCtx) return;
  const out = masterGain(0.12), now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
  osc.type = 'triangle'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
  g.gain.setValueAtTime(0.25, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(g); g.connect(out); osc.start(now); osc.stop(now + 0.1);
}

/* 模式切换咔哒 */
function playModeSwitch() {
  if (!soundEnabled) return; ensureAudioContext(); if (!audioCtx) return;
  const out = masterGain(0.14), now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
  osc.type = 'square'; osc.frequency.setValueAtTime(900, now); osc.frequency.exponentialRampToValueAtTime(500, now + 0.05);
  g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  osc.connect(g); g.connect(out); osc.start(now); osc.stop(now + 0.08);
}

/* 浇热水滋啦声（高频噪声突发） */
function playSizzle(duration) {
  if (!soundEnabled) return; ensureAudioContext(); if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const src = audioCtx.createBufferSource();
  src.buffer = noiseBuffer(Math.max(0.3, duration));
  const bp = audioCtx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.setValueAtTime(2800, now); bp.frequency.exponentialRampToValueAtTime(1800, now + duration); bp.Q.value = 0.7;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(0.22, now + 0.12);
  g.gain.linearRampToValueAtTime(0.05, now + duration);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.1);
  src.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
  src.start(now); src.stop(now + duration + 0.15);
}

/* 蒸气升腾轻啸（低频柔噪声 + 滑音） */
function playVaporWhoosh() {
  if (!soundEnabled) return; ensureAudioContext(); if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const src = audioCtx.createBufferSource();
  src.buffer = noiseBuffer(1.0);
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(400, now); lp.frequency.linearRampToValueAtTime(900, now + 0.5); lp.frequency.linearRampToValueAtTime(300, now + 1.0);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.06, now + 0.3); g.gain.linearRampToValueAtTime(0.0001, now + 1.0);
  src.connect(lp); lp.connect(g); g.connect(audioCtx.destination);
  src.start(now); src.stop(now + 1.05);
}

/* 凝华细碎声（短促高频簇） */
function playDeposit() {
  if (!soundEnabled) return; ensureAudioContext(); if (!audioCtx) return;
  const now = audioCtx.currentTime;
  for (let i = 0; i < 6; i++) {
    const t = now + i * 0.03;
    const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(2000 + (i % 3) * 600, t);
    g.gain.setValueAtTime(0.07, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(g); g.connect(audioCtx.destination); osc.start(t); osc.stop(t + 0.05);
  }
}
/* 模式③：搅拌声（循环带通噪声） */
let stirSrc = null;
function startStirSound() {
  if (!soundEnabled) return; ensureAudioContext(); if (!audioCtx) return;
  stopStirSound();
  stirSrc = audioCtx.createBufferSource();
  stirSrc.buffer = noiseBuffer(2);
  const bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 0.6;
  const g = audioCtx.createGain(); g.gain.value = 0.045;
  stirSrc.loop = true; stirSrc.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
  stirSrc.start(); stirSrc.onended = function () { stirSrc = null; };
}
function stopStirSound() { if (stirSrc) { try { stirSrc.stop(); stirSrc.disconnect(); } catch (e) {} stirSrc = null; } }

/* 模式③：结霜叮铃 */
function playFrostCrystal() {
  if (!soundEnabled) return; ensureAudioContext(); if (!audioCtx) return;
  const now = audioCtx.currentTime;
  for (let i = 0; i < 7; i++) {
    const t = now + i * 0.04;
    const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(2600 + (i % 4) * 500, t);
    g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(g); g.connect(audioCtx.destination); osc.start(t); osc.stop(t + 0.06);
  }
}

/* 倒水/浇淋声（白噪声低通，无外部音频） */
function playPourWater(duration) {
  if (!soundEnabled) return; ensureAudioContext(); if (!audioCtx) return;
  const dur = Math.max(0.4, Math.min(3, duration || 1.5));
  const now = audioCtx.currentTime;
  const src = audioCtx.createBufferSource(); src.buffer = noiseBuffer(dur);
  const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.8;
  lp.frequency.setValueAtTime(900, now); lp.frequency.linearRampToValueAtTime(450, now + dur * 0.6); lp.frequency.linearRampToValueAtTime(300, now + dur);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.08, now + 0.15);
  g.gain.linearRampToValueAtTime(0.04, now + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, now + dur + 0.15);
  src.connect(lp); lp.connect(g); g.connect(audioCtx.destination);
  src.start(now); src.stop(now + dur + 0.2);
}

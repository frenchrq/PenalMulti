// Soft synthesized sounds (no audio files). Everything respects the sound setting.
import { settings } from './settings.js';

let actx = null;
function ctx() {
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  return actx;
}

export function tone(freq, dur, delay = 0, vol = 0.07) {
  if (!settings.sound) return;
  try {
    const c = ctx(), t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  } catch (e) { /* ignore */ }
}

export function goalChime() {
  tone(523, 0.22, 0); tone(659, 0.22, 0.14); tone(784, 0.4, 0.28);
}

export function saveSound() {
  tone(220, 0.45, 0, 0.06);
}

export function winChime() {
  tone(523, 0.2, 0, 0.06); tone(659, 0.2, 0.14, 0.06); tone(784, 0.2, 0.28, 0.06); tone(1047, 0.45, 0.42, 0.06);
}

// Short, quiet crowd roar made from filtered noise.
export function roar() {
  if (!settings.sound) return;
  try {
    const c = ctx(), dur = 1.8, sr = c.sampleRate;
    const buf = c.createBuffer(1, Math.floor(sr * dur), sr), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.5;
    const g = c.createGain(), t = c.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(c.destination); src.start(t);
  } catch (e) { /* ignore */ }
}

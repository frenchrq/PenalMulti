// What he has practised. The 45 distinct facts from 1x1 to 9x9 are tracked once each
// (3x7 and 7x3 are the same fact). Everything stays in this device's storage.
//
// Levels per fact:  0 = not seen yet,  1 = practising,  2 = secure
// "Secure" means at least two attempts, the last one right and at least 2 of the last 3 right.
import { load, save, remove } from './store.js';

const KEY = 'progress';
let data = load(KEY, { facts: {}, sessions: [] });
if (!data || typeof data !== 'object' || !data.facts) data = { facts: {}, sessions: [] };
if (!Array.isArray(data.sessions)) data.sessions = [];

const keyOf = (a, b) => (a <= b ? a + 'x' + b : b + 'x' + a);

export function record(a, b, ok) {
  const k = keyOf(a, b);
  const f = data.facts[k] || { n: 0, c: 0, r: [] };
  f.n++; if (ok) f.c++;
  f.r.push(ok ? 1 : 0); if (f.r.length > 5) f.r.shift();
  data.facts[k] = f;
  save(KEY, data);
}

export function level(a, b) {
  const f = data.facts[keyOf(a, b)];
  if (!f) return 0;
  const r = f.r;
  const good = r.slice(-3).reduce((s, x) => s + x, 0);
  return r.length >= 2 && r[r.length - 1] === 1 && good >= 2 ? 2 : 1;
}

// How much a fact should show up when picking questions: new and shaky ones more often.
export function weight(a, b) {
  const l = level(a, b);
  return l === 0 ? 3 : l === 1 ? 4 : 1;
}

export function addSession(goals, total, tables, game = 'penales') {
  data.sessions.push({ t: Date.now(), goals, total, tables, game });
  if (data.sessions.length > 60) data.sessions = data.sessions.slice(-60);
  save(KEY, data);
}

export function summary() {
  let secure = 0, practising = 0, fresh = 0;
  for (let a = 1; a <= 9; a++) {
    for (let b = a; b <= 9; b++) {
      const l = level(a, b);
      if (l === 2) secure++; else if (l === 1) practising++; else fresh++;
    }
  }
  const best = data.sessions.reduce((m, s) => Math.max(m, s.goals), 0);
  return { secure, practising, fresh, total: 45, best, sessions: data.sessions.slice(-5).reverse() };
}

export function reset() {
  data = { facts: {}, sessions: [] };
  remove(KEY);
}

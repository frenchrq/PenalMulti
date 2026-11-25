// Tiny wrapper over localStorage. Every read and write is guarded: private windows
// or blocked storage must never break the app, it just forgets between visits.
const NS = 'pm2:';

export function load(key, fallback) {
  try {
    const v = localStorage.getItem(NS + key);
    return v == null ? fallback : JSON.parse(v);
  } catch (e) {
    return fallback;
  }
}

export function save(key, value) {
  try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
}

export function remove(key) {
  try { localStorage.removeItem(NS + key); } catch (e) { /* ignore */ }
}

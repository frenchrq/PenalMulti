// Entry point: a tiny hash router. Each screen exports { title, mount(root) } and may return a cleanup function.
import { applySettings } from './core/settings.js';
import home from './screens/home.js';
import team from './screens/team.js';
import progress from './screens/progress.js';
import settings from './screens/settings.js';
import penales from './games/penales.js';
import liga from './games/liga.js';
import memoria from './games/memoria.js';

const ROUTES = { '': home, equipo: team, progreso: progress, ajustes: settings, penales, liga, memoria };

let cleanup = null;

function render() {
  const name = location.hash.replace(/^#\/?/, '').split('/')[0];
  const screen = ROUTES[name] || home;
  if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
  const root = document.getElementById('app');
  root.innerHTML = '';
  cleanup = screen.mount(root) || null;
  document.title = screen === home ? 'PenalMulti' : screen.title + ' · PenalMulti';
  window.scrollTo(0, 0);
}

applySettings();
window.addEventListener('hashchange', render);
render();

// Offline support (only over http/https, so opening the file directly still works).
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* ignore */ });
  });
}

// Service worker: keeps the app working offline.
// IMPORTANT: bump VERSION whenever any file in ASSETS changes, so devices pick up the new files.
const VERSION = 'v1';
const CORE = 'penalmulti-core-' + VERSION;
const RUNTIME = 'penalmulti-runtime';

const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/app.js',
  'js/core/audio.js',
  'js/core/progress.js',
  'js/core/scene.js',
  'js/core/settings.js',
  'js/core/store.js',
  'js/core/teams.js',
  'js/core/ui.js',
  'js/games/index.js',
  'js/games/penales.js',
  'js/screens/home.js',
  'js/screens/progress.js',
  'js/screens/settings.js',
  'js/screens/team.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CORE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('penalmulti-core-') && k !== CORE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve from cache first, refresh the cache in the background (so updates arrive on the next open).
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !fonts) return;

  event.respondWith(
    caches.open(sameOrigin ? CORE : RUNTIME).then((cache) =>
      cache.match(req, { ignoreSearch: sameOrigin }).then((hit) => {
        const net = fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    )
  );
});

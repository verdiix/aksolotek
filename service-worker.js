const CACHE_NAME = 'pou-ios2-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './manifest.webmanifest',
  './assets/pou_sprite.png',
  // ikony jeśli dodasz:
  // './icons/icon-192.png',
  // './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stale-while-revalidate
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkRes => {
        const copy = networkRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return networkRes;
      }).catch(() => cached); // offline -> cache
      return cached || fetchPromise;
    })
  );
});

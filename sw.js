// Service Worker for SeweragePay PWA
const CACHE_NAME = 'sewerage-pay-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first strategy for smooth updates without caching stale dev scripts
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Skip browser extensions and dev server internal requests
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/@') || url.pathname.includes('node_modules')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

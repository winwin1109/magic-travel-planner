const CACHE_NAME = 'planner-cache-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// 安裝時快取檔案
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 攔截網路請求，優先使用快取（支援離線）
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
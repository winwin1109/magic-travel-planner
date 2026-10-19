// 每次更新 index.html 後，建議將尾數版本號 +1 (例如改為 v3, v4)
const CACHE_NAME = 'magic-travel-planner-v2';

// 預設需要快取的核心檔案與字型/匯出套件
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=ZCOOL+KuaiLe&family=ZCOOL+XiaoWei&display=swap'
];

// 1. 安裝階段：儲存核心靜態資源並立即接管
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 強制新版 Service Worker 立即生效
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. 啟動階段：自動清除所有舊版本的快取，避免畫面卡在舊版
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('清除舊版快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 立即控制所有開啟中的頁面
  );
});

// 3. 攔截請求階段：採用「網路優先 (Network First)」，有網路時自動抓最新版並更新快取，無網路時讀取離線快取
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 如果成功從網路取得最新檔案，同步寫入快取供下次離線使用
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 當處於飛行模式或無網路時，從本地快取回傳檔案
        return caches.match(event.request);
      })
  );
});
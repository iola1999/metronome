const CACHE_NAME = "metronome-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/src/js/app.js",
  "/src/js/db.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// 检查更新函数
async function checkForUpdates() {
  try {
    const currentCache = await caches.open(CACHE_NAME);
    const cachedResponse = await currentCache.match('/');
    
    if (!cachedResponse) return false;
    
    // 获取最新的页面内容
    const freshResponse = await fetch('/', { cache: 'no-cache' });
    if (!freshResponse.ok) return false;
    
    // 比较 ETag 或者内容
    const cachedETag = cachedResponse.headers.get('ETag');
    const freshETag = freshResponse.headers.get('ETag');
    
    if (cachedETag && freshETag && cachedETag !== freshETag) {
      return true;
    }
    
    // 如果没有 ETag，比较内容
    const cachedText = await cachedResponse.text();
    const freshText = await freshResponse.text();
    
    return cachedText !== freshText;
  } catch (error) {
    console.error('检查更新失败:', error);
    return false;
  }
}

// 安装 Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 激活 Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 处理请求
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// 添加消息处理
self.addEventListener('message', async (event) => {
  if (event.data === 'CHECK_UPDATES') {
    const hasUpdates = await checkForUpdates();
    if (hasUpdates) {
      // 通知所有客户端有更新
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE'
        });
      });
    }
  }
});

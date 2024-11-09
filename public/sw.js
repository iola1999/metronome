const CACHE_NAME = "metronome-cache-v1";

// 检查更新函数
async function checkForUpdates() {
  try {
    const currentCache = await caches.open(CACHE_NAME);
    const cachedResponse = await currentCache.match("/");

    if (!cachedResponse) return false;

    const freshResponse = await fetch("/", { cache: "no-cache" });
    if (!freshResponse.ok) return false;

    const cachedText = await cachedResponse.text();
    const freshText = await freshResponse.text();

    if (cachedText !== freshText) {
      // 检测到更新时，清除所有缓存
      await caches.delete(CACHE_NAME);
      // 创建新的缓存并缓存根路径
      const newCache = await caches.open(CACHE_NAME);
      await newCache.put("/", freshResponse);
      return true;
    }

    return false;
  } catch (error) {
    console.error("检查更新失败:", error);
    return false;
  }
}

// 安装 Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add("/");
    })
  );
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim(),
    ])
  );
});

// 处理请求 - 缓存优先策略，对所有请求进行缓存
self.addEventListener("fetch", (event) => {
  // 忽略非 http(s) 请求
  if (!event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // 检查是否是有效的响应
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // 克隆响应，因为响应流只能被使用一次
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// 添加消息处理
self.addEventListener("message", async (event) => {
  if (event.data === "CHECK_UPDATES") {
    const hasUpdates = await checkForUpdates();
    if (hasUpdates) {
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: "UPDATE_AVAILABLE",
        });
      });
    }
  }
});

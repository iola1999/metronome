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

    return cachedText !== freshText;
  } catch (error) {
    console.error("检查更新失败:", error);
    return false;
  }
}

// 安装 Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 缓存根路径
      return cache.add("/");
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

// 处理请求 - 缓存优先策略，对所有请求进行缓存
self.addEventListener("fetch", (event) => {
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

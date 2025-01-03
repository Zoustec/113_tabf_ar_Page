const cacheName = "Zoustec-台灣金融研究院AR-1.0.1";
const contentToCache = [
    "Build/tabf_ar.loader.js",
    "Build/tabf_ar.framework.js.unityweb",
    "Build/tabf_ar.data.unityweb",
    "Build/tabf_ar.wasm.unityweb",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
      self.skipWaiting(); // 強制激活新的 Service Worker
    })());
});

self.addEventListener('activate', function (e) {
    e.waitUntil((async function () {
        // 清除舊的快取
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map((name) => {
                if (name !== cacheName) {
                    console.log(`[Service Worker] Deleting old cache: ${name}`);
                    return caches.delete(name);
                }
            })
        );
    })());
    self.clients.claim(); // 立即控制未受控的網頁
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
});

const CACHE_NAME = "sapahati-v1";

// Aset yang di-cache saat install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/launchericon-192x192.png",
  "/icons/launchericon-512x512.png"
];

// =====================
// INSTALL: simpan cache
// =====================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ========================
// ACTIVATE: hapus cache lama
// ========================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ===================================
// FETCH: Network First, fallback Cache
// ===================================
self.addEventListener("fetch", (event) => {
  // Lewati request non-GET dan API calls
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("/api/") ||
    event.request.url.includes("googleapis.com") ||
    event.request.url.includes("sheets.googleapis.com")
  ) {
    return;
  }

  // Untuk navigasi (HTML), gunakan Network First
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Untuk aset statis (JS, CSS, gambar), gunakan Cache First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});

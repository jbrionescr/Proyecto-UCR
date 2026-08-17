const CACHE_NAME = "fu-static-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Cache-first SOLO para assets estáticos propios (chunks de Next, imágenes, fuentes).
// Nunca intercepta /api/*, navegación HTML ni nada cross-origin: esos deben
// llegar siempre frescos (donaciones, aplicaciones, chats, sesión, etc.).
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (request.mode === "navigate" || request.destination === "document") return;

  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") || /\.(png|jpe?g|svg|ico|webp|woff2?)$/.test(url.pathname);
  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

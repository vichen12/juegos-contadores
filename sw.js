/* ============================================================
   El Anotador · Service Worker
   Cachea el shell del ecosistema para que ande sin internet.
   Estrategia:
     · Navegaciones (páginas): network-first con fallback a caché.
     · Estáticos propios: stale-while-revalidate.
     · Fuentes de Google: cache-first (una vez bajadas, offline).
   Al cambiar archivos, subí VERSION para forzar actualización.
   ============================================================ */
const VERSION = "anotador-v1.0.0";
const CORE = VERSION + "-core";
const RUNTIME = VERSION + "-rt";

// Rutas relativas al scope (raíz del sitio).
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/css/tokens.css",
  "./assets/css/base.css",
  "./assets/css/shell.css",
  "./assets/js/store.js",
  "./assets/js/registry.js",
  "./assets/js/theme.js",
  "./assets/js/shell.js",
  "./assets/js/pwa.js",
  "./assets/icons/favicon.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./apps/truco/",
  "./apps/truco/index.html",
  "./apps/podrido/",
  "./apps/podrido/index.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CORE).then((cache) =>
      // addAll falla entero si un item falla; los agregamos tolerante.
      Promise.allSettled(PRECACHE.map((u) => cache.add(u)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

function isFont(url) {
  return (
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com"
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Fuentes de Google: cache-first (persisten offline).
  if (isFont(url)) {
    event.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        try {
          const res = await fetch(req);
          if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
          return res;
        } catch (e) {
          return hit || Response.error();
        }
      })
    );
    return;
  }

  // Solo manejamos nuestro propio origen para el resto.
  if (url.origin !== self.location.origin) return;

  // Navegaciones: network-first, fallback a caché (o home).
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return cached || (await caches.match("./index.html")) || (await caches.match("./"));
        })
    );
    return;
  }

  // Estáticos propios: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

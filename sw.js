/* ============================================================
   El Anotador · Service Worker
   Cachea el shell del ecosistema para que ande sin internet.
   Estrategia:
     · Navegaciones (páginas): network-first con fallback a caché.
     · Estáticos propios: stale-while-revalidate.
     · Fuentes de Google: cache-first (una vez bajadas, offline).
   Al cambiar archivos, subí VERSION para forzar actualización.
   ============================================================ */
const VERSION = "vichen-v3.2.0";
const CORE = VERSION + "-core";
const RUNTIME = VERSION + "-rt";

// Rutas relativas al scope (raíz del sitio).
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/css/tokens.css",
  "./assets/css/base.css",
  "./assets/css/components.css",
  "./assets/css/shell.css",
  "./assets/js/store.js",
  "./assets/js/registry.js",
  "./assets/js/icons.js",
  "./assets/js/theme.js",
  "./assets/js/shell.js",
  "./assets/js/pwa.js",
  "./assets/img/logo-trans.png",
  "./assets/img/logo-emblem-trans.png",
  "./assets/icons/favicon.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/vichen-192.png",
  "./assets/icons/vichen-512.png",
  "./assets/icons/vichen-maskable-512.png",
  "./assets/icons/vichen-apple.png",
  "./assets/icons/truco-192.png",
  "./assets/icons/truco-512.png",
  "./assets/icons/truco-maskable-512.png",
  "./assets/icons/truco-apple.png",
  "./assets/icons/magic-192.png",
  "./assets/icons/magic-512.png",
  "./assets/icons/magic-maskable-512.png",
  "./assets/icons/magic-apple.png",
  "./apps/truco/",
  "./apps/truco/index.html",
  "./apps/truco/manifest.webmanifest",
  "./apps/magic/",
  "./apps/magic/index.html",
  "./apps/magic/manifest.webmanifest",
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

  // Compat: la app "podrido" se renombró a "magic". Evita 404 de links viejos.
  if (url.origin === self.location.origin && url.pathname.indexOf("/apps/podrido") !== -1) {
    event.respondWith(Response.redirect(new URL("./apps/magic/", self.registration.scope).href, 302));
    return;
  }

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

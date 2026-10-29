/* =========================================================
   Na'Guara — Service Worker
   Pré-cache do app shell + estratégias de rede
   ========================================================= */

const VERSION = "naguara-v1.1.0";
const CACHE_NAME = `${VERSION}-static`;
const OFFLINE_URL = "./offline.html";

const APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./css/styles.css",
  "./js/app.js",
  "./manifest.json",
  "./assets/fonts/fraunces-latin.woff2",
  "./assets/fonts/manrope-latin.woff2",
  "./assets/icons/favicon.svg",
  "./assets/icons/favicon-32.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/images/hero-tequenos.webp",
  "./assets/images/hero-tequenos-480.webp",
  "./assets/images/hero-tequenos-600.webp",
  "./assets/images/hero-arepa.webp",
  "./assets/images/hero-arepa-360.webp",
  "./assets/images/tequenos-clasicos.webp",
  "./assets/images/tequenos-clasicos-480.webp",
  "./assets/images/tequenos-clasicos-600.webp",
  "./assets/images/tequenos-tocineta.webp",
  "./assets/images/tequenos-tocineta-480.webp",
  "./assets/images/tequenos-tocineta-600.webp",
  "./assets/images/tequenos-guayaba.webp",
  "./assets/images/tequenos-guayaba-480.webp",
  "./assets/images/tequenos-guayaba-600.webp",
  "./assets/images/arepa-reina.webp",
  "./assets/images/arepa-reina-480.webp",
  "./assets/images/arepa-reina-600.webp",
  "./assets/images/arepa-queso.webp",
  "./assets/images/arepa-queso-480.webp",
  "./assets/images/arepa-queso-600.webp",
  "./assets/images/arepa-carne.webp",
  "./assets/images/arepa-carne-640.webp",
  "./assets/images/arepa-carne-480.webp",
  "./assets/images/arepa-carne-600.webp",
  "./assets/images/combo-pareja.webp",
  "./assets/images/combo-pareja-480.webp",
  "./assets/images/combo-pareja-600.webp",
  "./assets/images/combo-familiar.webp",
  "./assets/images/combo-familiar-480.webp",
  "./assets/images/combo-familiar-600.webp",
  "./assets/images/papelon.webp",
  "./assets/images/papelon-480.webp",
  "./assets/images/papelon-600.webp",
  "./assets/images/tizana.webp",
  "./assets/images/tizana-480.webp",
  "./assets/images/tizana-600.webp",
  "./assets/screenshots/mobile.webp",
  "./assets/screenshots/desktop.webp",
  "./creditos.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Só tratamos GET do mesmo domínio.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegação: tenta a rede, cai para o app shell em offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match("./index.html")) || (await cache.match(OFFLINE_URL)) || Response.error();
        }),
    );
    return;
  }

  // Assets: cache primeiro e atualização em segundo plano.
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });

      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            cache.put(request, response.clone()).catch(() => {});
          }
          return response;
        })
        .catch(() => null);

      return cached || (await network) || Response.error();
    }),
  );
});

// Permite atualização imediata quando a página pede.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

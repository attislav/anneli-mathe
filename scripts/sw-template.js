// Service Worker für Sternenpfad — wird von scripts/build-sw.mjs befüllt.
//
// Strategie:
//   - Beim Installieren: alle App-Dateien und Bild-Atlanten in den Cache.
//   - Seiten (Navigation): erst Netz, sonst Cache — so kommen Updates schnell an.
//   - Alles andere: erst Cache, sonst Netz (und dann merken).

const VERSION = "__VERSION__";
const CACHE = `sternenpfad-${VERSION}`;
const PRECACHE = __PRECACHE__;
const ART = __ART__;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE);
      // Bilder liegen auf einem fremden Server: „no-cors" ergibt eine undurchsichtige
      // Antwort, die der Browser trotzdem als Hintergrundbild anzeigen kann.
      await Promise.all(
        ART.map(async (url) => {
          try {
            const res = await fetch(url, { mode: "no-cors" });
            await cache.put(url, res);
          } catch {
            // offline beim Installieren — dann eben beim nächsten Mal
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone());
          return res;
        } catch {
          const cached = (await caches.match(req, { ignoreSearch: true })) || (await caches.match("/"));
          return cached || Response.error();
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === "opaque") {
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        return Response.error();
      }
    })(),
  );
});

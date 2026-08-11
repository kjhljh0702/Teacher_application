const CACHE_NAME = "teacher-link-v6-5-0-cache";
const NOTIFICATION_TARGETS = new Set(["home", "facilities", "reviews", "jobs", "community", "profile"]);
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=6.5.0",
  "./content-policy.js?v=6.5.0",
  "./app.js?v=6.5.0",
  "./favicon.svg",
  "./manifest.webmanifest?v=6.5.0",
  "./assets/teacher-network-hero.webp",
  "./assets/career-desk.webp",
  "./assets/teacher-community.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && url.pathname.endsWith("/config.js")) {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
    return;
  }

  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("./index.html")));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const requestedTarget = event.notification.data?.target;
  const target = NOTIFICATION_TARGETS.has(requestedTarget) ? requestedTarget : "home";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (windows) => {
      const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (existing) {
        await existing.focus();
        existing.postMessage({ type: "OPEN_NOTIFICATION", target });
        return;
      }
      await self.clients.openWindow(`./#${target}`);
    }),
  );
});

const CACHE_NAME = "itv-cache-v1";
const urlsToCache = [
  "ver.html?token=PUBLICO",
  "manifest.json",
  "https://alexandre7888.github.io/Filmes-E-TV/file_00000000629c61f5ab79dacd3f1866e9.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
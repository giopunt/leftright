var cacheName = 'static_0.1';
var filesToCache = [
  'offline-ve001.html',
  'style-ve001.css',
  'client-ve001.js',
];

const expectedCaches  = [
  'static_0.1'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/*self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);

  if(url.origin == location.origin && url.pathname == '/'){
    event.respondWith(caches.match('/offline-ve001.html'));
    return;
  }

  if(url.origin == location.origin && url.pathname == '/client.js'){
    event.respondWith(caches.match('/client-ve001.js'));
    return;
  }

  if(url.origin == location.origin && url.pathname == '/style.css'){
    event.respondWith(caches.match('/style-ve001.css'));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});*/

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(cachesNames => {
      return Promise.all(
        cachesNames.map(cacheName => {
          if(!expectedCaches.includes(cacheName)) {
           return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

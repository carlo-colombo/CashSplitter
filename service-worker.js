// Service Worker for Cashsplitter PWA
const CACHE_NAME = 'cashsplitter-v1';

// Files to cache for offline use
const filesToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles.css',
  '/index.js',
  '/loader.js',
  '/main.ts',
  '/build.ts',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/manifest.json'
];

// Install service worker and cache all content
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(filesToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response as it's a stream and can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // Add the new resource to cache
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            // If network fails and we don't have a cached response, serve fallback
            if (event.request.url.indexOf('.html') > -1) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

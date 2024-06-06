self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    event.waitUntil(
      caches.open('static-v1').then((cache) => {
        return cache.addAll([
          './',
          './index.html',
          './android-chrome-192x192.png',
          './android-chrome-512x512.png',
          './apple-touch-icon.png',
          './favicon-16x16.png',
          './favicon-32x32.png',
          './favicon.ico'
        ]);
      })
    );
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  
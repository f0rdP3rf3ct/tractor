self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('v1').then((cache) => cache.addAll([
            '/',
            '/index.html',
            '/styles.css',
            '/script.js',
            '/icons/icon-192.png'
        ]))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});

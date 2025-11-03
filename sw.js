// sw.js

const CACHE_NAME = 'tareas-v1';

const urlsToCache = [
    // La ruta raíz del proyecto en un subdirectorio (ej: /pouchPorject/)
    './', 
    // Archivos locales (usando './' como buena práctica relativa)
    './index.html',
    './styles.css',
    './main.js',
    './manifest.json', // ¡Añadir el manifiesto es crucial para la PWA!
    './images/icons/icon1.png', 
    './images/icons/icon2.png',
    
    'https://cdn.jsdelivr.net/npm/pouchdb@9.0.0/dist/pouchdb.min.js' 
];

// 1. EVENTO INSTALL: Cachar los archivos estáticos
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando y cacheados archivos estáticos.');
    // Espera hasta que el caché se abra y todos los archivos se agreguen
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    const isCachedAsset = urlsToCache.some(url => requestUrl.pathname.endsWith(url.replace('./', '')));

    if (isCachedAsset || event.request.destination === 'style' || event.request.destination === 'script') {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    
                    return fetch(event.request); 
                })
        );
        return;
    }
    
   
    event.respondWith(fetch(event.request));
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activando y limpiando cachés antiguas.');
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});
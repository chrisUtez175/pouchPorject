// sw.js

const CACHE_NAME = 'tareas-v1';
// Lista de archivos estáticos que queremos guardar en caché
const urlsToCache = [
    '/', // El archivo HTML principal
    'index.html',
    'styles.css',
    'main.js',
    'https://cdn.jsdelivr.net/npm/pouchdb@9.0.0/dist/pouchdb.min.js' // La librería externa
    // Si tienes un favicon, agrégalo aquí
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
            // Forzar la activación del nuevo SW inmediatamente
            .then(() => self.skipWaiting())
    );
});

// 2. EVENTO FETCH: Estrategia Cache Only
self.addEventListener('fetch', event => {
    // Si la solicitud es para un recurso que hemos cacheado
    const requestUrl = new URL(event.request.url);

    // Estrategia Cache Only: Busca SÓLO en la caché
    const isCachedAsset = urlsToCache.some(url => requestUrl.pathname.endsWith(url.replace('./', '')));

    // Esta estrategia es mejor para los archivos estáticos
    if (isCachedAsset || event.request.destination === 'style' || event.request.destination === 'script') {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Devuelve la respuesta de la caché si existe
                    if (response) {
                        return response;
                    }
                    // Si el recurso no está en caché (lo que no debería pasar si la instalación es exitosa),
                    // intenta ir a la red (esto es una protección, pero la idea es usar solo caché).
                    return fetch(event.request); 
                })
        );
        return;
    }
    
    // Para todos los demás recursos (como PouchDB o peticiones externas que no cacheamos)
    // usamos la estrategia por defecto (Network First o simple fetch).
    event.respondWith(fetch(event.request));
});

// 3. EVENTO ACTIVATE: Limpiar cachés antiguas
self.addEventListener('activate', event => {
    console.log('Service Worker: Activando y limpiando cachés antiguas.');
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Elimina cualquier caché que no esté en la lista blanca
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});
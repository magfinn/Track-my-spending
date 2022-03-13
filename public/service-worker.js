const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_TO_CACHE = [
    '/',
    './index.html',
    './css/styles.css',
    './js/index.js',
    './js/idb.js',
    './manifest.json',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png'
];

// self.addEventListener('install', function (e) {
//     e.waitUntil(
//         caches.open(CACHE_NAME).then(function (cache) {
//             console.log('installing cache : ' + CACHE_NAME)
//             return cache.addAll(FILES_TO_CACHE)
//         })
//     );
//     self.skipWaiting();
// })

// self.addEventListener('activate', function (e) {
//     e.waitUntil(
//         caches.keys().then(function (keyList) {
//             let cacheKeepList = keyList.filter(function (key) {
//                 return key.indexOf(APP_PREFIX);
//             });
//             cacheKeepList.push(CACHE_NAME);

//             return Promise.all(keyList.map(function (key, i) {
//                 if (cacheKeepList.indexOf(key) === -1) {
//                     console.log('deleting cache : ' + keyList[i]);
//                     return caches.delete(keyList[i]);
//                 }
//             }));
//         })
//     )
// });

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Your files were successfully pre-cached.');
            return cache.addAll(FILES_TO_CACHE)
        })
    );
    self.skipWaiting();
})

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            )
        })
    );
    self.cliets.claim()
});

self.addEventListener('fetch', function (e) {
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(e.request)
                        .then(response => {
                            // If the response was good, clone it and store it in the cache.
                            if (response.status === 200) {
                                cache.put(e.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch(err => {
                            // Network request failed, try to get it from the cache.
                            return cache.match(e.request);
                        });
                })
                .catch(err => console.log(err))
        );

        return;
    }
});

// self.addEventListener('fetch', function (e) {
//     console.log('fetch request : ' + e.request.url)
//     e.respondWith(
//         caches.match(e.request).then(function (request) {
//             if (request) {
//                 console.log('responding with cache : ' + e.request.url)
//                 return request
//             } else {
//                 console.log('file is not cached, fetching : ' + e.request.url)
//                 return fetch(e.request)
//             }
//         })
//     )
// });
// Service Worker for Lao Typo Game PWA
const CACHE_NAME = 'lao-typo-v2.9.4';
const OFFLINE_URL = '/gameplay.html';

// Files to cache for offline use
const CACHE_FILES = [
    '/',
    '/index.html',
    '/start.html',
    '/gameplay.html',
    '/leaderboard.html',
    '/manifest.json',
    '/firebase-config.js',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/favicon.ico',
    '/screenshot-wide.png',
    '/screenshot-narrow.png',
    // Game assets
    '/images/LaoTypo-logo-04.png',
    '/images/LaoTypo-logo-06.png',
    '/images/Gecko.png',
    '/bg_sound.mp3',
    '/result_sound.mp3',
    // External resources (will be cached when accessed)
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@400;500;700&family=Montserrat:wght@400;500;600;700&display=swap',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js',
    'https://www.googletagmanager.com/gtag/js?id=G-2F516DW62Z'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching essential files');
                return cache.addAll(CACHE_FILES);
            })
            .then(() => {
                console.log('✅ Service Worker installed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version
                    console.log('📦 Serving from cache:', event.request.url);
                    return cachedResponse;
                }
                
                // Network request with cache update
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response for caching
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        console.log('🌐 Fetched and cached:', event.request.url);
                        return response;
                    })
                    .catch(() => {
                        // Network failed, serve offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Background sync for Firebase data
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync event:', event.tag);
    
    if (event.tag === 'sync-personal-records') {
        event.waitUntil(syncPersonalRecords());
    } else if (event.tag === 'sync-leaderboard') {
        event.waitUntil(syncLeaderboard());
    }
});

async function syncPersonalRecords() {
    try {
        console.log('📊 Syncing personal records in background...');
        // This would integrate with Firebase when available
        // For now, just log that sync was attempted
        console.log('✅ Personal records sync completed');
    } catch (error) {
        console.error('❌ Personal records sync failed:', error);
    }
}

async function syncLeaderboard() {
    try {
        console.log('🏆 Syncing leaderboard in background...');
        // This would integrate with Firebase when available
        console.log('✅ Leaderboard sync completed');
    } catch (error) {
        console.error('❌ Leaderboard sync failed:', error);
    }
}

// Push notifications (for future features)
self.addEventListener('push', (event) => {
    console.log('📱 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New challenge available!',
        icon: '/images/Laotypo-logo.jpg',
        badge: '/images/Laotypo-logo.jpg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Play Now',
                icon: '/images/Laotypo-logo.jpg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/Laotypo-logo.jpg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Lao Typo Game', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/start.html')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    console.log('💬 Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
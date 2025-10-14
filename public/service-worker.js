// Empty service worker to prevent 404 errors
// This file prevents the browser from showing 404 errors when looking for a service worker

self.addEventListener('install', () => {
    // Skip waiting to activate immediately
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    // Clean up old caches if any
    return self.clients.claim();
});

// No-op service worker - doesn't cache anything or provide offline functionality

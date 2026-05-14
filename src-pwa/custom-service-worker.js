/* eslint-env serviceworker */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

// Clean old caches
cleanupOutdatedCaches()

// Precache files
precacheAndRoute(self.__WB_MANIFEST)

// Cache name constants
const CACHE_NAMES = {
  API: 'api-cache-v1',
  IMAGES: 'images-cache-v1',
  STATIC: 'static-cache-v1'
}

// API caching strategy - Network first with offline fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: CACHE_NAMES.API,
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
)

// Image caching strategy - Cache first
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: CACHE_NAMES.IMAGES,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
)

// Static assets - Stale while revalidate
registerRoute(
  ({ request }) => 
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.STATIC,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
)

// Handle offline navigation
const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: 'navigations',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
)

registerRoute(navigationRoute)

// Background sync for failed requests
self.addEventListener('sync', event => {
  if (event.tag === 'sync-farmers') {
    event.waitUntil(syncFarmers())
  }
})

// Periodic background sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(periodicSync())
  }
})

// Listen for skip waiting signal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Helper functions
async function syncFarmers() {
  // Implementation for syncing farmers in background
  console.log('Background sync triggered')
}

async function periodicSync() {
  // Implementation for periodic sync
  console.log('Periodic sync triggered')
}

// Handle quota errors
self.addEventListener('error', event => {
  if (event.error && event.error.name === 'QuotaExceededError') {
    // Clear least important caches
    caches.delete(CACHE_NAMES.IMAGES)
  }
})
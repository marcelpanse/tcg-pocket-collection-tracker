// Bump this whenever the caching strategy changes, or to force every user
// to drop stale entries from a previous version. The activate handler
// deletes any cache whose name doesn't match.
const CACHE_NAME = 'tcg-pocket-cache-v2'
const IMAGE_PATH_MARKER = '/images/'

self.addEventListener('install', (event) => {
  // Take over immediately so returning users get the new strategy on the
  // next fetch instead of the tab-close-and-reopen dance.
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
      await self.clients.claim()
    })(),
  )
})

// Stale-while-revalidate: serve the cached copy immediately (fast, offline
// friendly) and refresh the cache in the background so the next request
// gets the newer bytes. Previous versions used cache-first with no refresh,
// which pinned outdated image binaries in every returning user's browser
// even after we shipped replacements.
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.includes(IMAGE_PATH_MARKER)) {
    return
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(request)
      const network = fetch(request)
        .then((response) => {
          if (response?.ok) {
            cache.put(request, response.clone()).catch(() => {})
          }
          return response
        })
        .catch(() => undefined)
      return cached || (await network) || Response.error()
    })(),
  )
})

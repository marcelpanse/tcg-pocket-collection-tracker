const CACHE_NAME = 'tcg-pocket-cache-v1'
const IMAGE_CACHE = 'images/'

self.addEventListener('activate', (_event) => {
  console.log('Service Worker activated.')
})

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes(IMAGE_CACHE)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).then((response) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone())
              return response
            })
          })
        )
      }),
    )
  }
})

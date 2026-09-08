// The service worker was retired: standard HTTP caching already covers our images
// and the manual cache was pinning stale bytes for returning users. This block
// tears down any worker + cache still registered from previous visits.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    .catch(() => {})
}
if ('caches' in window) {
  caches
    .keys()
    .then((names) => Promise.all(names.filter((n) => n.startsWith('tcg-pocket-cache')).map((n) => caches.delete(n))))
    .catch(() => {})
}

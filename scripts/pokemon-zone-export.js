// Browser-side exporter for scripts/scrape-missions.ts, driven by the /scrape-missions skill.
//
// pokemon-zone sits behind Cloudflare, which blocks scripted requests. This function runs inside a
// pokemon-zone.com tab (via `orca eval` in Orca's built-in browser) and fetches the same pages/APIs the
// scraper needs as same-origin requests. It starts the export in the background and returns right
// away; poll `window.__pzExport` for progress, then save `window.__pzBundle` to a file and run
// `tsx scripts/scrape-missions.ts --bundle <file>`.
//
// Don't run this file directly — `tsx scripts/pokemon-zone-snippet.ts [SET ...]` writes a copy with
// the expansion list filled in from CardsDB.
;() => {
  const EXPANSIONS = [] /* __EXPANSIONS__ */
  const DELAY_MS = 400

  if (location.hostname !== 'www.pokemon-zone.com') {
    return { state: 'error', error: `Wrong page (${location.href}) — navigate to https://www.pokemon-zone.com first` }
  }
  if (EXPANSIONS.length === 0) {
    return { state: 'error', error: 'No expansions filled in — generate this file with scripts/pokemon-zone-snippet.ts' }
  }
  if (window.__pzExport?.state === 'running') {
    return window.__pzExport
  }

  const status = { state: 'running', step: 'card catalog', setsDone: 0, setsTotal: EXPANSIONS.length, missions: 0, error: null }
  window.__pzExport = status
  window.__pzBundle = null

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const run = async () => {
    const bundle = { version: 1, exportedAt: new Date().toISOString(), expansions: EXPANSIONS, cardData: null, listings: {}, missions: {} }

    const cardRes = await fetch('/api/game/card-data/', { headers: { Accept: 'application/json' } })
    if (!cardRes.ok) {
      throw new Error(`card-data: HTTP ${cardRes.status}`)
    }
    bundle.cardData = await cardRes.json()

    for (const exp of EXPANSIONS) {
      status.step = `${exp} listing`
      await sleep(DELAY_MS)
      const res = await fetch(`/themed-collections/${exp.toLowerCase()}`, { headers: { Accept: 'text/html' } })
      if (res.status === 404) {
        // Promo sets have no themed-collections page.
        bundle.listings[exp] = null
        status.setsDone++
        continue
      }
      if (!res.ok) {
        throw new Error(`${exp} listing: HTTP ${res.status}`)
      }
      const html = await res.text()
      bundle.listings[exp] = html

      const doc = new DOMParser().parseFromString(html, 'text/html')
      const ids = [...new Set([...doc.querySelectorAll('[data-mission-id]')].map((el) => el.getAttribute('data-mission-id')))]
      for (const [i, id] of ids.entries()) {
        if (id in bundle.missions) {
          continue
        }
        status.step = `${exp} mission ${i + 1}/${ids.length}`
        await sleep(DELAY_MS)
        const r = await fetch(`/api/missions/themed-collections/${id}/`, { headers: { Accept: 'application/json' } })
        if (r.ok) {
          bundle.missions[id] = { status: r.status, body: await r.json() }
        } else if (r.status === 500) {
          // Expected for fixed-list missions: the scraper falls back to the visible cards.
          bundle.missions[id] = { status: 500 }
        } else {
          throw new Error(`mission ${id}: HTTP ${r.status}`)
        }
        status.missions++
      }
      status.setsDone++
    }
    return bundle
  }

  run().then(
    (bundle) => {
      window.__pzBundle = bundle
      status.state = 'done'
      status.step = 'done'
    },
    (err) => {
      status.state = 'error'
      status.error = String(err)
    },
  )
  return status
}

import fs from 'node:fs'
import path from 'node:path'

// Enumerates which localized card images exist on disk and writes a small
// manifest at frontend/assets/image-locales.json. The frontend imports it to
// pick the right image src at render time, so no runtime onError fallback is
// needed and there is no flicker for cards missing a locale.
//
// Manifest shape: { [card_id]: number } where the number is a bitmask over
// LOCALES (least-significant bit is LOCALES[0]). Keeps the file compact — a
// bit under 30 KB for ~3900 cards — and lookup is O(1).

const IMAGES_DIR = 'frontend/public/images'
const OUT_PATH = 'frontend/assets/image-locales.json'

// Order matters — the bitmask is positional. Adding a new locale must be
// appended at the end so existing bit positions stay stable.
export const LOCALES = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR'] as const

function collectCardIdsForLocale(locale: string): Set<string> {
  const dir = path.join(IMAGES_DIR, locale)
  if (!fs.existsSync(dir)) {
    return new Set()
  }
  const files = fs.readdirSync(dir)
  const ids = new Set<string>()
  for (const f of files) {
    if (f.endsWith('.webp')) {
      ids.add(f.slice(0, -'.webp'.length))
    }
  }
  return ids
}

function main() {
  const perLocale = LOCALES.map((l) => collectCardIdsForLocale(l))
  const allCardIds = new Set<string>()
  for (const set of perLocale) {
    for (const id of set) {
      allCardIds.add(id)
    }
  }

  const manifest: Record<string, number> = {}
  for (const cardId of [...allCardIds].sort()) {
    let mask = 0
    for (let i = 0; i < LOCALES.length; i++) {
      if (perLocale[i].has(cardId)) {
        mask |= 1 << i
      }
    }
    manifest[cardId] = mask
  }

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Wrote ${Object.keys(manifest).length} card ids to ${OUT_PATH}`)
  // Coverage summary
  for (let i = 0; i < LOCALES.length; i++) {
    const count = Object.values(manifest).filter((m) => (m & (1 << i)) !== 0).length
    console.log(`  ${LOCALES[i]}: ${count} images`)
  }
}

main()

import type { Card } from '@/types'
import imageLocalesData from '../../assets/image-locales.json'

// Positional bit order in the manifest bitmask (see scripts/generate-image-locales.ts).
const LOCALES = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR'] as const

const manifest = imageLocalesData as Record<string, number>

function normalizeLocale(lang: string): (typeof LOCALES)[number] {
  // The frontend uses i18next codes like "en", "es", "fr", "de", "it", "pt"
  // but the image folders use the full BCP-47 tag. Map by prefix.
  const short = lang.toLowerCase().split(/[-_]/)[0]
  switch (short) {
    case 'es':
      return 'es-ES'
    case 'fr':
      return 'fr-FR'
    case 'de':
      return 'de-DE'
    case 'it':
      return 'it-IT'
    case 'pt':
      return 'pt-BR'
    default:
      return 'en-US'
  }
}

export function hasLocalizedImage(cardId: string, lang: string): boolean {
  const locale = normalizeLocale(lang)
  const bit = LOCALES.indexOf(locale)
  if (bit < 0) {
    return false
  }
  const mask = manifest[cardId]
  return mask !== undefined && (mask & (1 << bit)) !== 0
}

// Returns the best image path for the requested language, falling back to
// en-US when there is no localized variant. The decision is made off the
// build-time manifest, so no runtime onError / retry is needed.
export function getLocalizedImagePath(card: Pick<Card, 'card_id'>, lang: string): string {
  const locale = hasLocalizedImage(card.card_id, lang) ? normalizeLocale(lang) : 'en-US'
  return `/images/${locale}/${card.card_id}.webp`
}

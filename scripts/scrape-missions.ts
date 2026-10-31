import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import type { CheerioAPI } from 'cheerio'
import * as cheerio from 'cheerio'
import { expansions as allExpansions } from '../frontend/src/lib/CardsDB'

const BASE_URL = 'https://www.pokemon-zone.com'
const TARGET_DIR = './frontend/assets/themed-collections/'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

// CLI: `tsx scripts/scrape-missions.ts [--bundle <file>] [SET ...]`
//   --bundle  read everything from a browser export (see scripts/pokemon-zone-export.js) instead of fetching live
//   SET ...   only scrape those sets (default: all sets, or all sets in the bundle)
const cliArgs = process.argv.slice(2)
let bundlePath: string | null = null
const onlyIds: string[] = []
for (let i = 0; i < cliArgs.length; i++) {
  const arg = cliArgs[i]
  if (arg === '--bundle') {
    bundlePath = cliArgs[++i] ?? null
    if (!bundlePath) {
      throw new Error('--bundle needs a file path')
    }
  } else if (arg.startsWith('--bundle=')) {
    bundlePath = arg.slice('--bundle='.length)
  } else {
    onlyIds.push(arg)
  }
}
const knownIds = allExpansions.map((e) => e.id)
const unknownIds = onlyIds.filter((id) => !knownIds.includes(id))
if (unknownIds.length > 0) {
  throw new Error(`Unknown expansion id(s): ${unknownIds.join(', ')}. Known: ${knownIds.join(', ')}`)
}

type PZCard = {
  cardId: string
  expansionCollectionNumbers: { expansionId: string; collectionNumber: number }[]
}

// pokemon-zone is behind Cloudflare and rejects node-fetch. Shell out to curl with full browser headers.
function fetchWithCurl(url: string, accept: string): string {
  const args = [
    '-sL',
    '--compressed',
    '--fail',
    '--retry',
    '3',
    '--retry-delay',
    '5',
    '-H',
    `User-Agent: ${UA}`,
    '-H',
    `Accept: ${accept}`,
    '-H',
    'Accept-Language: en-US,en;q=0.9',
    '-H',
    'Sec-Fetch-Dest: document',
    '-H',
    'Sec-Fetch-Mode: navigate',
    '-H',
    'Upgrade-Insecure-Requests: 1',
    url,
  ]
  return execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 })
}

function fetchJSON<T>(url: string): T {
  return JSON.parse(fetchWithCurl(url, 'application/json')) as T
}

// Pokemon-zone item titles like "Shop ticket" need normalizing to match the UI's expected labels.
function normalizeRewardLabel(raw: string): string {
  // Title-case each word, but preserve parenthesized suffixes verbatim (lowercase inside).
  const segs = raw.split(/(\s\([^)]+\))/)
  return segs
    .map((seg, i) => {
      if (i % 2 === 1) {
        return seg.toLowerCase()
      }
      return seg.replace(/\b\w/g, (m) => m.toUpperCase())
    })
    .join('')
}

function formatReward(qty: string, label: string): string {
  let normalized = normalizeRewardLabel(label)
  // Pokemon-zone uses "(icon)" for profile icons; legacy data uses "(profile icon)".
  normalized = normalized.replace(/\s\(icon\)$/i, ' (profile icon)')
  if (qty === '1' && /\(emblem\)|\(profile icon\)|\(icon\)|\(cover\)|\(backdrop\)$/i.test(normalized)) {
    return normalized
  }
  return `${normalized} ×${qty}`
}

type PZMissionResponse = {
  data: {
    cardMission: {
      frames: {
        amount: number
        criterion: {
          targetType: string
          targetIds: string[]
        }[]
      }[]
    }
  }
}

// Build once and reused: maps a pokemon-zone card id (e.g. "PK_10_021240_00") to
// every card_id we know for that card (a single card can live in more than one
// expansion — Bulbasaur is A1-1 and A4b-1, for instance).
function buildCardIdIndex(source: DataSource): Map<string, string[]> {
  console.log('Loading pokemon-zone card catalog...')
  const cardData = source.cardData()
  const index = new Map<string, string[]>()
  for (const card of cardData.cards) {
    const ids = card.expansionCollectionNumbers.map((ecn) => `${ecn.expansionId}-${ecn.collectionNumber}`)
    if (ids.length === 0) {
      continue
    }
    index.set(card.cardId, [...new Set(ids)])
  }
  console.log(`  → ${index.size} cards indexed`)
  return index
}

function resolveTargetIds(targetIds: string[], index: Map<string, string[]>): string[] {
  const resolved: string[] = []
  const seen = new Set<string>()
  for (const t of targetIds) {
    const ids = index.get(t)
    if (!ids) {
      // Unknown PK id — surface it so we can catch drift instead of silently dropping.
      console.warn(`  ! unknown pokemon-zone card id: ${t}`)
      continue
    }
    for (const id of ids) {
      if (!seen.has(id)) {
        seen.add(id)
        resolved.push(id)
      }
    }
  }
  return resolved
}

type MissionOnPage = {
  missionId: string | null
  name: string
  secret: boolean
  reward: string
  // Fallback data used only when missionId is null: fully-visible figures in the listing.
  visibleSlots: { cardId: string }[]
}

function extractCardIdFromAlt(altText: string): string | null {
  const m = altText.match(/\(([A-Z]\d+[a-z]?)\)\s*#(\d+)/)
  if (!m) {
    return null
  }
  return `${m[1]}-${Number.parseInt(m[2], 10)}`
}

function parseMissionsFromListing($: CheerioAPI): MissionOnPage[] {
  const out: MissionOnPage[] = []
  const headers = $('.themed-collection-detail__category_header').toArray()
  for (const h of headers) {
    const $h = $(h)
    const isSecret = /secret/i.test($h.text())
    let $node = $h.next()
    while ($node.length && !$node.hasClass('themed-collection-detail__category_header')) {
      $node.find('.theme-collection-mission-card').each((_i, el) => {
        const $card = $(el)
        const name = $card.find('.theme-collection-mission-card__title').first().text().trim()
        // Big-pool missions ("+N Cards") carry data-mission-id so the API can
        // expand them. Small/fixed missions don't — we fall back to reading the
        // visible figures. Every duplicate frame carries the same mission-id;
        // grab the first one.
        const missionId = $card.find('[data-mission-id]').first().attr('data-mission-id') ?? null
        const rewards: string[] = []
        $card.find('.theme-collection-mission-card__rewards .icon-list__item .common-item-icon').each((_j, e2) => {
          const titleAttr = $(e2).attr('title') || ''
          const m = titleAttr.match(/^(\d+)x\s+(.+)$/)
          if (m) {
            rewards.push(formatReward(m[1], m[2].trim()))
          }
        })
        const visibleSlots: { cardId: string }[] = []
        $card.find('.theme-collection-mission-card__cards > figure').each((_j, fig) => {
          const altText = $(fig).find('img').attr('alt') || ''
          const cardId = extractCardIdFromAlt(altText)
          if (cardId) {
            visibleSlots.push({ cardId })
          }
        })
        out.push({ missionId, name, secret: isSecret, reward: rewards.join('<br />'), visibleSlots })
      })
      $node = $node.next()
    }
  }
  return out
}

type MissionOut = {
  expansionId: string
  name: string
  requiredCards: { options: string[]; amount: number }[]
  reward: string
  secret: boolean
}

function requiredCardsFromVisibleSlots(slots: { cardId: string }[]): { options: string[]; amount: number }[] {
  // Consecutive identical slots collapse into one requirement (amount = count).
  const out: { options: string[]; amount: number }[] = []
  for (const slot of slots) {
    const last = out[out.length - 1]
    if (last && last.options.length === 1 && last.options[0] === slot.cardId) {
      last.amount += 1
    } else {
      out.push({ options: [slot.cardId], amount: 1 })
    }
  }
  return out
}

// Where the scraper reads pokemon-zone data from: live (curl) or a browser export bundle.
type DataSource = {
  cardData(): { cards: PZCard[] }
  // null = the set has no themed-collections page (promo sets).
  listingHtml(expansionId: string): string | null
  // null = the API doesn't serve this mission (fixed-list missions) → use the visible cards.
  mission(missionId: string): PZMissionResponse | null
}

const liveSource: DataSource = {
  cardData: () => fetchJSON<{ cards: PZCard[] }>(`${BASE_URL}/api/game/card-data/`),
  listingHtml: (expansionId) => {
    const listingUrl = `${BASE_URL}/themed-collections/${expansionId.toLowerCase()}`
    console.log(`Fetching ${listingUrl}`)
    return fetchWithCurl(listingUrl, 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
  },
  mission: (missionId) => {
    sleep(400)
    try {
      return fetchJSON<PZMissionResponse>(`${BASE_URL}/api/missions/themed-collections/${missionId}/`)
    } catch {
      // API said no — caller drops through to the visible-slots fallback.
      return null
    }
  },
}

type Bundle = {
  version: 1
  exportedAt: string
  expansions: string[]
  cardData: { cards: PZCard[] }
  listings: Record<string, string | null>
  missions: Record<string, { status: number; body?: PZMissionResponse }>
}

function loadBundle(path: string): Bundle {
  const bundle = JSON.parse(fs.readFileSync(path, 'utf8')) as Bundle
  if (bundle.version !== 1 || !bundle.cardData || !bundle.listings || !bundle.missions) {
    throw new Error(`${path} is not a pokemon-zone export bundle`)
  }
  console.log(`Using bundle ${path} (exported ${bundle.exportedAt})`)
  return bundle
}

function bundleSource(bundle: Bundle): DataSource {
  return {
    cardData: () => bundle.cardData,
    listingHtml: (expansionId) => {
      if (!(expansionId in bundle.listings)) {
        throw new Error(`${expansionId} is not in the bundle — re-export including it`)
      }
      return bundle.listings[expansionId]
    },
    mission: (missionId) => {
      const entry = bundle.missions[missionId]
      if (!entry) {
        throw new Error(`mission ${missionId} is not in the bundle — re-export`)
      }
      if (entry.status === 500) {
        return null
      }
      if (!entry.body) {
        throw new Error(`mission ${missionId} has status ${entry.status} and no body in the bundle`)
      }
      return entry.body
    },
  }
}

function scrapeExpansion(expansionId: string, index: Map<string, string[]>, source: DataSource): MissionOut[] | null {
  const html = source.listingHtml(expansionId)
  if (html === null) {
    return null
  }
  const $ = cheerio.load(html)
  const missions = parseMissionsFromListing($)
  console.log(`  → ${missions.length} missions found; resolving`)

  const out: MissionOut[] = []
  for (const m of missions) {
    // Every mission-card carries a data-mission-id but only some are served by
    // the API (large card pools that render as "+N Cards"). Fixed-list missions
    // return 500 — for those the visible figures already contain the full list,
    // so we fall back to reading them. We can't reliably tell from the id which
    // path applies, so try the API and catch the failure.
    let requiredCards: { options: string[]; amount: number }[] | null = null
    const detail = m.missionId ? source.mission(m.missionId) : null
    if (detail) {
      requiredCards = detail.data.cardMission.frames.map((frame) => {
        // A frame's criterion is an array of predicates. pokemon-zone uses
        // CARD_ID for card-pool missions, POKEMON_CARD_ID for fixed pokémon
        // slots, and TRAINERS_CARD_ID for fixed trainer slots — all three
        // name our target card ids. Union the targetIds across criteria —
        // a card matching any of them counts. Warn on anything else so a
        // new type doesn't silently produce empty options.
        const CARD_TARGET_TYPES = new Set(['CARD_ID', 'POKEMON_CARD_ID', 'TRAINERS_CARD_ID'])
        const targetIds: string[] = []
        for (const c of frame.criterion) {
          if (CARD_TARGET_TYPES.has(c.targetType)) {
            targetIds.push(...c.targetIds)
          } else {
            console.warn(`  ! unhandled criterion targetType "${c.targetType}" in mission ${m.missionId}`)
          }
        }
        return { options: resolveTargetIds(targetIds, index), amount: frame.amount }
      })
    }
    if (!requiredCards) {
      requiredCards = requiredCardsFromVisibleSlots(m.visibleSlots)
    }
    out.push({ expansionId, name: m.name, requiredCards, reward: m.reward, secret: m.secret })
  }
  return out
}

function sleep(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function main() {
  const bundle = bundlePath ? loadBundle(bundlePath) : null
  const source = bundle ? bundleSource(bundle) : liveSource
  const expansions = onlyIds.length > 0 ? onlyIds : (bundle?.expansions ?? knownIds)
  const index = buildCardIdIndex(source)
  for (const [i, exp] of expansions.entries()) {
    if (i > 0 && !bundle) {
      sleep(1500)
    }
    let missions: MissionOut[] | null
    try {
      missions = scrapeExpansion(exp, index, source)
    } catch (err) {
      // Bundle mode: every error is real (404s are already recorded as null), so fail loudly.
      if (bundle) {
        throw err
      }
      // Live mode: promo sets (P-A, P-B) have no themed collections page — pokemon-zone
      // returns 404 and we skip the write so we don't stamp an empty file.
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`  ! skipping ${exp}: ${msg.split('\n')[0]}`)
      continue
    }
    if (missions === null) {
      console.log(`  → ${exp}: no themed collections, skipped`)
      continue
    }
    const outPath = `${TARGET_DIR}${exp}-missions.json`
    fs.writeFileSync(outPath, `${JSON.stringify(missions, null, 2)}\n`)
    console.log(`  → ${exp}: ${missions.length} missions written to ${outPath}`)
  }
}

main()

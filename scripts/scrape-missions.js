import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import * as cheerio from 'cheerio'

const BASE_URL = 'https://www.pokemon-zone.com/themed-collections'
const TARGET_DIR = './frontend/assets/themed-collections/'
const CARDS_PATH = './frontend/assets/cards.json'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

const expansions = ['A1', 'A1a', 'A2', 'A2a', 'A2b', 'A3', 'A3a', 'A3b', 'A4', 'A4a', 'A4b', 'B1', 'B1a', 'B2', 'B2a', 'B2b', 'B3']

const allCards = JSON.parse(fs.readFileSync(CARDS_PATH, 'utf8'))
const cardById = new Map(allCards.map((c) => [c.card_id, c]))
const cardByInternalId = new Map(allCards.map((c) => [c.internal_id, c]))

// pokemon-zone is behind Cloudflare and rejects node-fetch. Shell out to curl with full browser headers.
function fetchHTML(url) {
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
    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
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
  const text = execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  return cheerio.load(text)
}

// Pokemon-zone item titles like "Shop ticket" need normalizing to match the UI's expected labels.
function normalizeRewardLabel(raw) {
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

function formatReward(qty, label) {
  let normalized = normalizeRewardLabel(label)
  // Pokemon-zone uses "(icon)" for profile icons; legacy data uses "(profile icon)".
  normalized = normalized.replace(/\s\(icon\)$/i, ' (profile icon)')
  if (qty === '1' && /\(emblem\)|\(profile icon\)|\(icon\)|\(cover\)|\(backdrop\)$/i.test(normalized)) {
    return normalized
  }
  return `${normalized} ×${qty}`
}

function extractCardId(altText) {
  const m = altText.match(/\(([A-Z]\d+[a-z]?)\)\s*#(\d+)/)
  if (!m) {
    return null
  }
  return `${m[1]}-${Number.parseInt(m[2], 10)}`
}

function resolveAlternates(cardId) {
  const card = cardById.get(cardId)
  if (!card) {
    return [cardId]
  }
  const ids = card.alternate_versions
    .map((iid) => cardByInternalId.get(iid))
    .filter(Boolean)
    .map((c) => c.card_id)
  return ids.length > 0 ? ids : [cardId]
}

function parseMissionCard($, $card) {
  const title = $card.find('.theme-collection-mission-card__title').first().text().trim()

  const rewards = []
  $card.find('.theme-collection-mission-card__rewards .icon-list__item .common-item-icon').each((_i, el) => {
    const titleAttr = $(el).attr('title') || ''
    const m = titleAttr.match(/^(\d+)x\s+(.+)$/)
    if (m) {
      rewards.push(formatReward(m[1], m[2].trim()))
    }
  })

  const slots = []
  $card.find('.theme-collection-mission-card__cards > figure').each((_i, fig) => {
    const $fig = $(fig)
    const altText = $fig.find('img').attr('alt') || ''
    const cardId = extractCardId(altText)
    if (!cardId) {
      return
    }
    const countText = $fig.find('.theme-collection-mission-card__card-count').text().trim()
    // "+N Card(s)" inside a figure indicates this slot has alternate-art versions; resolve via cards.json.
    const hasAlternates = /\+\d+\s+Cards?/i.test(countText)
    slots.push({ cardId, hasAlternates })
  })

  // Group consecutive identical slots into one requirement with amount = duplicate count.
  const requiredCards = []
  for (const slot of slots) {
    const options = slot.hasAlternates ? resolveAlternates(slot.cardId) : [slot.cardId]
    const last = requiredCards[requiredCards.length - 1]
    if (last && JSON.stringify(last.options) === JSON.stringify(options)) {
      last.amount += 1
    } else {
      requiredCards.push({ options, amount: 1 })
    }
  }

  return { name: title, requiredCards, reward: rewards.join('<br />') }
}

function scrapeExpansion(expansionId) {
  const url = `${BASE_URL}/${expansionId.toLowerCase()}`
  console.log(`Fetching ${url}`)
  const $ = fetchHTML(url)

  const missions = []
  const headers = $('.themed-collection-detail__category_header').toArray()
  for (const h of headers) {
    const $h = $(h)
    const headerText = $h.text().trim()
    const isSecret = /secret/i.test(headerText)
    let $node = $h.next()
    while ($node.length && !$node.hasClass('themed-collection-detail__category_header')) {
      $node.find('.theme-collection-mission-card').each((_i, el) => {
        const m = parseMissionCard($, $(el))
        missions.push({ expansionId, name: m.name, requiredCards: m.requiredCards, reward: m.reward, secret: isSecret })
      })
      $node = $node.next()
    }
  }
  return missions
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function main() {
  for (const [i, exp] of expansions.entries()) {
    if (i > 0) {
      sleep(1500)
    }
    const missions = scrapeExpansion(exp)
    const outPath = `${TARGET_DIR}${exp}-missions.json`
    fs.writeFileSync(outPath, `${JSON.stringify(missions, null, 2)}\n`)
    console.log(`  → ${exp}: ${missions.length} missions written`)
  }
}

main()

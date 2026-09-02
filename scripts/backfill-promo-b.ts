// Fills in Promo-B cards Limitless does not list yet (recurring problem).
// Metadata from Serebii, evolution stage from pokemongohub, image from pokemongohub PNG → sharp WebP.
// Run: tsx scripts/backfill-promo-b.ts
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import sharp from 'sharp'
import { expansions } from '../frontend/src/lib/CardsDB'
import type { Card, CardType } from '../frontend/src/types'
import { encode } from './encoder'

// Windows: sharp keeps a file lock on files opened via file path, blocking overwrite in the same
// process. Disable the cache so metadata() releases the handle before we rewrite the file.
sharp.cache(false)

const EXPANSION_ID = 'P-B'
const SEREBII_LIST = 'https://www.serebii.net/tcgpocket/promo-b/'
const HUB_LIST = 'https://pocket.pokemongohub.net/en/set/vxunkwyap88g5jr-promo-b'
const CARDS_JSON = 'frontend/assets/cards.json'
const IMAGES_DIR = 'frontend/public/images/en-US'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TCG-Pocket-Collection-Tracker-Backfill'

// Serebii uses "electric" for the game's "lightning" type; keep the mapping.
const energyIconMap: Record<string, CardType> = {
  grass: 'grass',
  fire: 'fire',
  water: 'water',
  lightning: 'lightning',
  electric: 'lightning',
  psychic: 'psychic',
  fighting: 'fighting',
  darkness: 'darkness',
  metal: 'metal',
  dragon: 'dragon',
  colorless: 'colorless',
}

async function get(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status}`)
  }
  return res.text()
}

// Serebii promo-b listing: extract {number, url} for every card currently on the set page.
async function listSerebiiCards(): Promise<{ number: number; url: string }[]> {
  const html = await get(SEREBII_LIST)
  const $ = cheerio.load(html)
  const out: { number: number; url: string }[] = []
  $('a[href^="/tcgpocket/promo-b/"]').each((_i, a) => {
    const href = $(a).attr('href')
    const m = href?.match(/\/tcgpocket\/promo-b\/(\d{3})\.shtml$/)
    if (m) {
      const n = parseInt(m[1], 10)
      if (!out.some((c) => c.number === n)) {
        out.push({ number: n, url: `https://www.serebii.net${href}` })
      }
    }
  })
  return out.sort((a, b) => a.number - b.number)
}

// pokemongohub set page: extract {number, name, cardUrl, imageUrl} from JSON-LD ItemList in the SSR HTML.
async function listHubCards(): Promise<Map<number, { name: string; cardUrl: string; imageUrl: string }>> {
  const html = await get(HUB_LIST)
  const rx =
    /\\"position\\":(\d+),\\"item\\":\{\\"@type\\":\\"CreativeWork\\",\\"name\\":\\"([^\\"]+)\\",\\"url\\":\\"([^\\"]+)\\",\\"image\\":\\"([^\\"]+)\\"/g
  const out = new Map<number, { name: string; cardUrl: string; imageUrl: string }>()
  for (const m of html.matchAll(rx)) {
    const n = parseInt(m[1], 10)
    const name = m[2].replace(/\\u0026#39;/g, "'").replace(/\\u0026/g, '&')
    out.set(n, { name, cardUrl: m[3], imageUrl: m[4] })
  }
  return out
}

interface SerebiiData {
  name: string
  hp: number
  energy: CardType
  card_type: 'pokémon' | 'trainer'
  attacks: Card['attacks']
  ability?: { name: string; effect: string }
  weakness: string
  retreat: number
  artist: string
}

function extractEnergyFromImg(_$: cheerio.CheerioAPI, img: cheerio.Cheerio<cheerio.Element>): CardType | undefined {
  const src = img.attr('src') || ''
  const m = src.match(/\/(\w+)\.png$/)
  return m && energyIconMap[m[1]] ? energyIconMap[m[1]] : undefined
}

function parseSerebiiCard(html: string, number: number): SerebiiData {
  const $ = cheerio.load(html)
  const info = $('.cardinfo').first()
  if (!info.length) {
    throw new Error(`no .cardinfo for #${number}`)
  }
  // First table: name + HP + energy icon
  const nameCell = info.find('td.main').first()
  const name = nameCell.text().replace(/\s+/g, ' ').trim()
  const hp = parseInt(
    info
      .find('td[nowrap][align="right"] b')
      .first()
      .text()
      .replace(/[^0-9]/g, ''),
    10,
  )
  const energyIcon = info.find('td[align="center"][width="20"] img[src^="/tcgpocket/image/"]').first()
  const energy = extractEnergyFromImg($, energyIcon)
  if (!energy) {
    throw new Error(`could not detect energy for #${number}`)
  }
  // Rows: ability (font color=red + ability.png), attacks (energies + name + damage)
  const attacks: Card['attacks'] = []
  let ability: SerebiiData['ability']
  info.find('tr').each((_i, tr) => {
    const $tr = $(tr)
    const abilityIcon = $tr.find('img[src="/tcgpocket/image/ability.png"]')
    if (abilityIcon.length) {
      const anchor = $tr.find('a[href*="/dex/ability/"]').first()
      const abilityName = anchor.text().replace(/\s+/g, ' ').trim()
      const cell = anchor.closest('td')
      // Effect text is the text after the <br> inside the same <td>
      const html = cell.html() || ''
      const parts = html.split(/<br\s*\/?>/i)
      const effectText = cheerio
        .load(`<div>${parts.slice(1).join('<br>')}</div>`)('div')
        .text()
        .replace(/\s+/g, ' ')
        .trim()
      ability = { name: abilityName, effect: effectText || 'No effect' }
      return
    }
    const attackAnchor = $tr.find('a[href*="/dex/moves/"]').first()
    if (attackAnchor.length) {
      // Cost cell is the first <td align="center" width="15%">
      const costCell = $tr.find('td[align="center"][width="15%"]').first()
      const cost: CardType[] = []
      costCell.find('img[src^="/card/image/"]').each((_j, im) => {
        const src = $(im).attr('src') || ''
        const mm = src.match(/\/card\/image\/(\w+)\.png/)
        if (mm && energyIconMap[mm[1]]) {
          cost.push(energyIconMap[mm[1]] as CardType)
        }
      })
      const attackName = attackAnchor.text().replace(/\s+/g, ' ').trim()
      const nameCellHtml = attackAnchor.closest('td').html() || ''
      const parts = nameCellHtml.split(/<br\s*\/?>/i)
      const effectText = cheerio
        .load(`<div>${parts.slice(1).join('<br>')}</div>`)('div')
        .text()
        .replace(/\s+/g, ' ')
        .trim()
      // Damage cell — last main td in the row
      const damageCell = $tr.find('td.main').last()
      const damage = damageCell.text().replace(/\s+/g, ' ').trim() || '0'
      attacks.push({
        cost: cost.length ? cost : ['No Cost'],
        name: attackName,
        damage,
        effect: effectText || 'No effect',
      })
    }
  })
  // Weakness / Retreat block
  let weakness = 'N/A'
  let retreat = 0
  info.find('td.small').each((_i, td) => {
    const label = $(td).text().replace(/\s+/g, ' ').trim().toLowerCase()
    const next = $(td).next('td')
    if (label === 'weakness') {
      const wImg = next.find('img[src^="/tcgpocket/image/"]').first()
      const w = extractEnergyFromImg($, wImg)
      if (w) {
        weakness = w
      }
    } else if (label === 'retreat cost') {
      retreat = next.find('img[src^="/tcgpocket/image/colorless.png"]').length
    }
  })
  // Illustrator
  const artistAnchor = $('a[href*="/dex/artist/"]').first()
  const artist = artistAnchor.text().replace(/\s+/g, ' ').trim() || 'Unknown'
  // Card type: all Promo-B so far are Pokémon (no Trainers). If ability contains no ability icon and no energy icon in title, it could be trainer. Assume Pokémon here.
  const card_type = 'pokémon' as const
  return { name, hp, energy, card_type, attacks, ability, weakness, retreat, artist }
}

async function fetchHubStage(cardUrl: string): Promise<string> {
  const html = await get(cardUrl)
  // additionalProperty JSON-LD: look for "Stage" value
  const m = html.match(/\\"name\\":\\"Stage\\",\\"value\\":\\"([^\\"]+)\\"/)
  if (!m) {
    return 'basic'
  }
  const raw = m[1].toLowerCase()
  if (raw === 'basic') {
    return 'basic'
  }
  if (raw === 'stage-1' || raw === 'stage 1' || raw === 'stage1') {
    return 'stage1'
  }
  if (raw === 'stage-2' || raw === 'stage 2' || raw === 'stage2') {
    return 'stage2'
  }
  return raw.replace(/[^a-z0-9]/g, '')
}

async function downloadAsWebp(pngUrl: string, dest: string) {
  const res = await fetch(pngUrl, { headers: { 'User-Agent': UA } })
  if (!res.ok) {
    throw new Error(`GET ${pngUrl} → ${res.status}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  // Windows keeps a lock on files sharp has read metadata from, so delete first if present.
  if (fs.existsSync(dest)) {
    fs.unlinkSync(dest)
  }
  await sharp(buf).webp({ quality: 90 }).toFile(dest)
}

// Existing P-B WebP files that Serebii-JPG-based scrapes produced were VP8 without alpha.
// The app's FancyCard (lazy load + 3D transforms) refuses to render those; only VP8X-with-alpha
// works. Detect the broken ones by reading metadata, then re-download from pokemongohub PNG.
async function isBrokenWebp(filePath: string): Promise<boolean> {
  if (!fs.existsSync(filePath)) {
    return false
  }
  try {
    const meta = await sharp(filePath).metadata()
    return meta.hasAlpha === false
  } catch {
    return true
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const cards: Card[] = JSON.parse(fs.readFileSync(CARDS_JSON, 'utf8'))
  const existingPB = cards.filter((c) => c.expansion === EXPANSION_ID)
  const existingNumbers = new Set(existingPB.map((c) => Number.parseInt(c.card_id.split('-').pop() ?? '0', 10)))
  console.log(`cards.json: ${existingPB.length} existing P-B cards, max #${Math.max(...existingNumbers)}`)

  const [serebiiList, hubList] = await Promise.all([listSerebiiCards(), listHubCards()])
  console.log(`Serebii lists ${serebiiList.length} P-B cards; pokemongohub lists ${hubList.size}`)

  const missing = serebiiList.filter((c) => !existingNumbers.has(c.number))
  console.log(`Missing (present on Serebii but not in cards.json): ${missing.map((m) => `#${m.number}`).join(', ') || '(none)'}`)

  // Also check existing P-B images for the "broken VP8-only" encoding that the app cannot render.
  const brokenNumbers: number[] = []
  for (const num of existingNumbers) {
    const imgPath = path.join(IMAGES_DIR, `${EXPANSION_ID}-${num}.webp`)
    if (await isBrokenWebp(imgPath)) {
      brokenNumbers.push(num)
    }
  }
  brokenNumbers.sort((a, b) => a - b)
  console.log(`Broken WebP (VP8 without alpha, need re-download): ${brokenNumbers.map((n) => `#${n}`).join(', ') || '(none)'}`)

  if (!dryRun) {
    for (const num of brokenNumbers) {
      const hub = hubList.get(num)
      if (!hub) {
        console.warn(`  #${num} broken but pokemongohub has no entry, skipping`)
        continue
      }
      const dest = path.join(IMAGES_DIR, `${EXPANSION_ID}-${num}.webp`)
      await downloadAsWebp(hub.imageUrl, dest)
      console.log(`  #${num} image refreshed → ${dest}`)
    }
  }

  if (missing.length === 0) {
    if (brokenNumbers.length > 0 && !dryRun) {
      console.log(`\nRefreshed ${brokenNumbers.length} broken images. Regenerate manifest with "tsx scripts/generate-image-locales.ts".`)
    } else {
      console.log('Nothing to do.')
    }
    return
  }

  const expansion = expansions.find((e) => e.id === EXPANSION_ID)
  if (!expansion) {
    throw new Error('P-B expansion missing from CardsDB')
  }

  const cardsByName = new Map<string, number[]>()
  for (const c of cards) {
    const arr = cardsByName.get(c.name) ?? []
    arr.push(c.internal_id)
    cardsByName.set(c.name, arr)
  }

  const newRecords: Card[] = []
  for (const { number, url } of missing) {
    console.log(`\n#${number} → fetching Serebii detail…`)
    const html = await get(url)
    const data = parseSerebiiCard(html, number)
    const hub = hubList.get(number)
    if (!hub) {
      console.warn(`  pokemongohub has no entry for #${number}, skipping (need image + stage)`)
      continue
    }
    const stage = data.card_type === 'pokémon' ? await fetchHubStage(hub.cardUrl) : 'basic'
    const card_id = `${EXPANSION_ID}-${number}`
    const internal_id = encode(expansion, number, 'P')
    const siblings = cardsByName.get(data.name) ?? []
    const alternate_versions = [...new Set([...siblings, internal_id])].toSorted((a, b) => a - b)
    const record: Card = {
      expansion: EXPANSION_ID as Card['expansion'],
      card_id,
      image: `/images/en-US/${card_id}.webp`,
      hp: data.hp,
      energy: data.energy,
      name: data.name,
      card_type: data.card_type,
      evolution_type: stage as Card['evolution_type'],
      attacks: data.attacks,
      ability: data.ability,
      weakness: data.weakness,
      retreat: data.retreat,
      rarity: 'P',
      ex: data.name.includes(' ex'),
      baby: false,
      pack: 'everypack',
      alternate_versions,
      artist: data.artist,
      internal_id,
    } as Card

    console.log(`  ${data.name} — HP ${data.hp}, ${data.energy}, retreat ${data.retreat}, weakness ${data.weakness}, stage ${stage}`)
    console.log(`  ability: ${data.ability?.name ?? '(none)'} — attacks: ${data.attacks.map((a) => `${a.name} (${a.damage})`).join(', ')}`)
    console.log(`  internal_id: ${internal_id}, alternate_versions: [${alternate_versions.join(', ')}]`)

    if (!dryRun) {
      const dest = path.join(IMAGES_DIR, `${card_id}.webp`)
      await downloadAsWebp(hub.imageUrl, dest)
      console.log(`  image → ${dest}`)
    }
    newRecords.push(record)
  }

  if (dryRun) {
    console.log(`\nDry run — would add ${newRecords.length} cards. Re-run without --dry-run to write.`)
    return
  }

  // Insert new records preserving sort order (expansion, then card number)
  const merged = [...cards, ...newRecords].sort((a, b) => {
    if (a.expansion !== b.expansion) {
      return a.expansion < b.expansion ? -1 : 1
    }
    const na = Number.parseInt(a.card_id.split('-').pop() ?? '0', 10)
    const nb = Number.parseInt(b.card_id.split('-').pop() ?? '0', 10)
    return na - nb
  })
  fs.writeFileSync(CARDS_JSON, JSON.stringify(merged, null, 2))
  console.log(`\nWrote ${newRecords.length} new cards to ${CARDS_JSON}`)
  console.log(
    'Next: run "pnpm biome check --write --files-max-size=4000000 frontend/assets/cards.json" and then "tsx scripts/generate-image-locales.ts && pnpm hashes"',
  )
}

await main()

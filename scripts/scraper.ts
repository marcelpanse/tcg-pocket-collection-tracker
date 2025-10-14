import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { CheerioAPI } from 'cheerio'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { expansions as allExpansions } from '../frontend/src/lib/CardsDB'
import type { Card, ExpansionId, Rarity } from '../frontend/src/types'
import { encode } from './encoder'

const BASE_URL = 'https://pocket.limitlesstcg.com'

const targetDir = 'frontend/assets/cards/'
const imagesDir = 'frontend/public/images/en-US/'
const imagesPath = '/images/en-US/'

// const expansions = ['A1']
const expansions = allExpansions.map((e) => e.id)

const packs = [
  'Pikachu pack',
  'Charizard pack',
  'Mewtwo pack',
  'Dialga pack',
  'Palkia pack',
  'Mew pack',
  'Arceus pack',
  'Shining revelry pack',
  'Lunala pack',
  'Solgaleo pack',
  'Buzzwole pack',
  'Eevee grove pack',
  'Ho-Oh pack',
  'Lugia pack',
  'Suicune pack',
  'Deluxe pack',
  'All cards',
]

const typeMapping = {
  G: 'Grass',
  R: 'Fire',
  W: 'Water',
  L: 'Lightning',
  P: 'Psychic',
  F: 'Fighting',
  D: 'Darkness',
  M: 'Metal',
  Y: 'Fairy',
  C: 'Colorless',
}

const fullArtRarities = ['☆', '☆☆', '☆☆☆', 'Crown Rare', 'P']

const rarityOverrides = {
  A2b: [
    { rarity: '✵', start: 97, end: 106 },
    { rarity: '✵✵', start: 107, end: 110 },
  ],
  A3: [
    { rarity: '✵', start: 210, end: 229 },
    { rarity: '✵✵', start: 230, end: 237 },
  ],
  A3a: [
    { rarity: '✵', start: 89, end: 98 },
    { rarity: '✵✵', start: 99, end: 102 },
  ],
  A3b: [
    { rarity: '✵', start: 93, end: 102 },
    { rarity: '✵✵', start: 103, end: 106 },
  ],
  A4: [
    { rarity: '✵', start: 212, end: 231 },
    { rarity: '✵✵', start: 232, end: 239 },
  ],
  A4a: [
    { rarity: '✵', start: 91, end: 100 },
    { rarity: '✵✵', start: 101, end: 104 },
  ],
  A4b: [{ rarity: '✵✵', start: 377, end: 378 }],
} // as Record<ExpansionId, { rarity: Rarity; start: number; end: number }[]>

/* Helper Functions */

async function downloadImage(imageUrl: string, dest: string) {
  const response = await fetch(imageUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }

  const stream = response.body
  if (!stream) {
    throw new Error(`Failed to download image: ${imageUrl}`)
  }

  const writer = fs.createWriteStream(dest)

  await pipeline(stream, writer)
}

async function fetchHTML(url: string) {
  const response = await fetch(url)
  const text = await response.text()
  return cheerio.load(text)
}

function mapAttackCost($: CheerioAPI, costElements) {
  const costList: string[] = []

  costElements.each((_i, element) => {
    const costSymbol = $(element).text().trim()

    if (costSymbol.length > 1) {
      // Iterate over each letter in costSymbol
      for (const letter of costSymbol) {
        const costType = typeMapping[letter]
        if (!costType) {
          throw new Error(`Unrecognized energy symbol: '${letter}'`)
        }
        costList.push(costType)
      }
    } else {
      const costType = typeMapping[costSymbol] || 'Unknown'
      if (costType === 'Unknown') {
        console.warn(`Warning: unrecognized symbol '${costSymbol}'.`)
      }
      costList.push(costType)
    }
  })

  return costList.length > 0 ? costList : ['No Cost']
}

function extractSetAndPackInfo($: CheerioAPI) {
  const setInfo = $('div.card-prints-current')

  if (setInfo.length) {
    const setDetailsElement = setInfo.find('span.text-lg')
    const setDetails = setDetailsElement.length ? setDetailsElement.text().replaceAll(' ', '').toLowerCase().trim() : 'Unknown'

    const packTemp = setInfo.find('span').last().text().trim()
    const packInfo = packTemp.split('·').pop().trim().split(/\s+/).join(' ')
    const pack = packs.includes(packInfo) ? packInfo.replace(' ', '').toLowerCase() : 'everypack'

    return { setDetails, pack }
  }
  return { setDetails: 'Unknown', pack: 'Unknown' }
}

function urlToCardId(url: string): { expansion: string; cardNr: number; cardId: string } {
  if (!url) {
    throw new Error('url is false')
  }

  // Assumes the url ends with /cards/expansion/number
  const regex = /.*\/cards\/([a-zA-Z0-9-]+)\/(\d+)/g
  const matches = [...url.matchAll(regex)]

  if (matches.length === 0) {
    throw new Error(`couldn't extract card id from '${url}'`)
  }
  return {
    expansion: matches[0][1],
    cardNr: parseInt(matches[0][2], 10),
    cardId: `${matches[0][1]}-${matches[0][2]}`,
  }
}

async function extractCardInfo($: CheerioAPI, cardUrl: string, expansion: string) {
  const inPackId = Number.parseInt(cardUrl.split('/').pop(), 10)
  if (!inPackId) {
    throw new Error(`Faied to parse card id from url: ${cardUrl}`)
  }

  const card_id = `${expansion}-${inPackId}`

  const imageUrl = $('img.card').attr('src')
  if (!imageUrl) {
    throw new Error(`Failed to scrap image: ${cardUrl}`)
  }
  const imageName = card_id + path.extname(imageUrl)
  const imageDest = path.join(imagesDir, imageName)
  if (!fs.existsSync(imageDest)) {
    console.log(`Downloading: ${imageUrl}`)
    await downloadImage(imageUrl, imageDest)
  } else {
    console.log(`Skipping image, already exists: ${imageName}`)
  }
  const image = imagesPath + imageName

  const title = $('p.card-text-title').text().trim()
  const titleParts = title.split(' - ')

  // Extract the last part for HP and remove non-digit characters
  const hp = titleParts.length > 1 ? titleParts[titleParts.length - 1].replace(/\D/g, '') : 'Unknown'

  // Assign the energy type from the second part if it exists
  const energy = titleParts.length > 1 ? titleParts[1].trim() : 'N/A'

  // Assign the name from the first part
  const name = titleParts[0].trim()

  const typeAndEvolution = $('p.card-text-type').text().trim().split('-')
  const card_type = typeAndEvolution[0].toLowerCase().trim()
  const evolution_type = typeAndEvolution[1] ? typeAndEvolution[1].toLowerCase().trim().replace(' ', '') : 'basic'

  const attacks: Card['attacks'][number][] = []
  $('div.card-text-attack').each((_i, attackElem) => {
    const attackInfoSection = $(attackElem).find('p.card-text-attack-info')
    const attackEffectSection = $(attackElem).find('p.card-text-attack-effect')

    if (attackInfoSection.length) {
      // Find all cost elements and map them to human-readable types
      const costElements = attackInfoSection.find('span.ptcg-symbol')
      const attackCost = mapAttackCost($, costElements)

      // Extract attack name and damage
      let attackText = attackInfoSection.text().trim()
      costElements.each((_j, costElem) => {
        attackText = attackText.replace($(costElem).text(), '').trim()
      })

      const attackParts = attackText.split(' ')
      const attackName = (attackParts.length > 1 ? attackParts.slice(0, -1).join(' ').trim() : attackParts.slice(-1)[0].trim()) || 'defaultAttackName'
      const attackDamage = (attackParts.length > 1 ? attackParts.slice(-1)[0].trim() : '0') || '0'
      const attackEffect = attackEffectSection.text().trim() || 'No effect'

      attacks.push({
        cost: attackCost,
        name: attackName,
        damage: attackDamage,
        effect: attackEffect,
      })
    }
  })

  const ability = extractAbility($)
  const weaknessAndRetreat = $('p.card-text-wrr').text().trim().split('\n')
  const weakness = weaknessAndRetreat[0]?.split(': ')[1]?.toLowerCase().trim() || 'N/A'
  const retreat = weaknessAndRetreat[1]?.split(': ')[1]?.toLowerCase().trim() || 'N/A'

  const raritySection = $('table.card-prints-versions tr.current')
  let rarity = (cardUrl.toString().includes('P-A') ? 'P' : raritySection.find('td:last-child').text().trim() || 'P') as Rarity
  if (rarityOverrides[expansion]) {
    for (const { rarity: rarityOverride, start, end } of rarityOverrides[expansion]) {
      if (start <= inPackId && inPackId <= end) {
        rarity = rarityOverride
      }
    }
  }

  const fullart = fullArtRarities.includes(rarity)

  const ex = name.includes(' ex')

  // Check if card is a baby pokemon (Not currently specified exactly on Limitless TCG page)
  const baby = weakness === 'none' && hp === '30' && energy !== 'Dragon'

  const { setDetails: set_details, pack } = extractSetAndPackInfo($)

  const alternate_versions: string[] = []
  let linked = false
  let baseExpansion = expansion
  let baseCardNr = inPackId
  let foundMyself = false

  console.log('processing alternates for', card_id)
  $('table.card-prints-versions tr').each((_i, version) => {
    const versionName = $(version).find('a').text().trim().replace(/\s+/g, ' ')
    if (versionName) {
      const alternate_card_id = $(version).find('a').attr('href')
      console.log('checking', alternate_card_id, versionName)
      if (!alternate_card_id) {
        foundMyself = true // no link with href means this is the current version we're looking at.
        console.log('found self reference')
      }

      alternate_versions.push(alternate_card_id ? urlToCardId(alternate_card_id).cardId : card_id)
      const alternate_card_rarity = $(version).find('td:last-child').text().trim() || 'P'

      // this checks for a card with the same rarity (up to EX card rarity) that is before the current card in the list. If so, that's the linked card
      // the alternate cards are only available up to EX card rarity (at least for now). And since limitless doesn't properly set shiny cards, we have to check it like this.
      if (rarity.includes('◊') && alternate_card_rarity === rarity && !foundMyself && !linked) {
        baseExpansion = alternate_card_id ? urlToCardId(alternate_card_id).expansion : expansion
        baseCardNr = alternate_card_id ? urlToCardId(alternate_card_id).cardNr : inPackId
        linked = !!alternate_card_id //just for reference to double-check our db for errors
        console.log('found alternate option', alternate_card_id, baseExpansion, baseCardNr, linked)
      }

      // However, a foil card would link to a base card, but in the game that isn't the case. So we need to check for foil cards.
      // We consider it a foil card if we already linked it, but still find the same rarity in the same set before the current card.
      if (alternate_card_id && !foundMyself) {
        const alternateSetId = urlToCardId(alternate_card_id).expansion
        if (alternateSetId === expansion && alternate_card_rarity === rarity) {
          // same set, same rarity, means this one is an alternative art in the same set (can be foil), remove the link and treat like unique card.
          baseExpansion = expansion // foils don't have linked cards (at least not yet!)
          baseCardNr = inPackId
          linked = false
          console.log('disregarding alternate-->unique', baseExpansion, baseCardNr, linked)
        }
      }
    }
  })

  const internal_id = encode(
    allExpansions.find((e) => e.id === baseExpansion),
    baseCardNr,
    rarity,
  )

  const artist = $('div.card-text-section.card-text-artist a').text().trim() || 'Unknown'

  console.log('returning card info', card_id)
  return {
    expansion: expansion as ExpansionId,
    card_id,
    image,
    hp,
    energy,
    name,
    card_type,
    evolution_type,
    attacks,
    ability,
    weakness,
    retreat,
    rarity,
    fullart,
    ex,
    baby,
    set_details,
    pack,
    alternate_versions,
    artist,
    internal_id,
    linked, //purely for testing to see if cards are linked correctly.
  }
}

async function getCardDetails(cardUrl: string, expansionId: string) {
  try {
    console.log(`Fetching details for ${cardUrl}...`)
    const $ = await fetchHTML(cardUrl)
    return await extractCardInfo($, cardUrl, expansionId)
  } catch (error) {
    console.error(`Error fetching details for ${cardUrl}:`, error)
    return null // Return null or a default object to continue the process for other cards
  }
}
function extractAbility($: CheerioAPI) {
  const cardType = $('p.card-text-type').text().trim()
  if (cardType.startsWith('Trainer')) {
    // handle the effect for Trainer cards explicitly
    const abilitySection = $('div.card-text-section')
    if (abilitySection.length) {
      const nextSection = abilitySection.next('div.card-text-section')
      if (!nextSection) {
        return undefined
      }
      return {
        name: '',
        effect: nextSection.text().trim(),
      }
    }
    return undefined
  } else {
    // For other cards, extract ability name and effect
    const abilitySection = $('div.card-text-ability')
    if (abilitySection.length) {
      const abilityName = abilitySection.find('p.card-text-ability-info').text().replace('Ability:', '').trim()
      let abilityEffect = abilitySection.find('p.card-text-ability-effect').text().trim()

      // Remove text within square brackets, similar to Python's re.sub(r'\[.*?\]', '')
      abilityEffect = abilityEffect.replace(/\[.*?]/g, '').trim()

      if (Boolean(abilityName) !== Boolean(abilityEffect)) {
        throw new Error('Ability name and effect presence missmatch')
      }

      if (!abilityName) {
        return undefined
      }

      return {
        name: abilityName || 'No ability',
        effect: abilityEffect || 'No effect',
      }
    }
    return undefined
  }
}

async function getCardLinks(mainUrl: string) {
  const $ = await fetchHTML(mainUrl)
  const links: string[] = []

  $('.card-search-grid a').each((_i, element) => {
    const link = $(element).attr('href')
    if (link) {
      links.push(`${BASE_URL}${link}`)
    }
  })

  return links
}

async function scrapeCards() {
  for (const expansion of expansions) {
    try {
      const mainUrl = `${BASE_URL}/cards/${expansion}`
      const cardLinks = await getCardLinks(mainUrl)
      console.log(`Found ${cardLinks.length} card links.`)

      const concurrencyLimit = 10
      const cards: Card[] = []
      let index = 0 // Track the current index of the cardLinks being processed

      fs.mkdirSync(targetDir, { recursive: true })

      // Function to process a batch of tasks with a given concurrency limit
      async function processBatch() {
        // Queue up to `concurrencyLimit` promises at the same time
        const promises: Promise<void>[] = []
        while (index < cardLinks.length && promises.length < concurrencyLimit) {
          const link = cardLinks[index++]
          promises.push(
            getCardDetails(link, expansion).then((card) => {
              if (card) {
                cards.push(card)
              }
            }),
          )
        }
        // Wait for the batch of promises to resolve
        await Promise.all(promises)

        // Process the next batch if there are more links remaining
        if (index < cardLinks.length) {
          await processBatch()
        }
      }

      // Start processing the batches
      await processBatch()

      console.log(`Scraping completed. Found ${cards.length} cards.`)

      // Sort the cards array by id as a number
      cards.sort((a, b) => Number.parseInt(a.card_id.split('-').pop(), 10) - Number.parseInt(b.card_id.split('-').pop(), 10))

      fs.writeFileSync(path.join(targetDir, `${expansion}.json`), JSON.stringify(cards, null, 2))
      console.log('Cards saved to cards.json')
    } catch (error) {
      console.error('Error scraping cards:', error)
    }
  }
}

scrapeCards().catch(console.error)

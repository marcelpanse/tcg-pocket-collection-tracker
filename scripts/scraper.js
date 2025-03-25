import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

const BASE_URL = 'https://pocket.limitlesstcg.com'
const targetDir = 'frontend/assets/cards/'
const expansions = ['A1', 'A1a', 'A2', 'A2a', 'P-A']
const packs = ['Pikachu pack', 'Charizard pack', 'Mewtwo pack', 'Dialga pack', 'Palkia pack', 'Mew pack', 'Arceus pack', 'All cards']

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

const craftingCost = {
  '◊': 35,
  '◊◊': 70,
  '◊◊◊': 150,
  '◊◊◊◊': 500,
  '☆': 400,
  '☆☆': 1250,
  '☆☆☆': 1500,
  '♛': 2500,
}

const fullArtRarities = ['☆', '☆☆', '☆☆☆', 'Crown Rare']

/* Helper Functions */

async function fetchHTML(url) {
  const response = await fetch(url)
  const text = await response.text()
  return cheerio.load(text)
}

function mapAttackCost($, costElements) {
  const costList = []

  costElements.each((_i, element) => {
    const costSymbol = $(element).text().trim()

    if (costSymbol.length > 1) {
      // Iterate over each letter in costSymbol
      for (const letter of costSymbol) {
        const costType = typeMapping[letter] || 'Unknown'
        if (costType === 'Unknown') {
          console.warn(`Warning: unrecognized symbol '${letter}'.`)
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

function extractSetAndPackInfo($) {
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

function extractCardInfo($, cardUrl) {
  const cardInfo = {}

  // Extract card ID from the URL (assuming the ID is the last segment of the URL path)
  cardInfo.id = cardUrl.split('/').pop()

  cardInfo.image = $('img.card').attr('src')
  const title = $('p.card-text-title').text().trim()
  const titleParts = title.split(' - ')

  // Extract the last part for HP and remove non-digit characters
  cardInfo.hp = titleParts.length > 1 ? titleParts[titleParts.length - 1].replace(/\D/g, '') : 'Unknown'

  // Assign the energy type from the second part if it exists
  cardInfo.energy = titleParts.length > 1 ? titleParts[1].trim() : 'N/A'

  // Assign the name from the first part
  cardInfo.name = titleParts[0].trim()

  if (cardInfo.name === 'Old Amber' && cardInfo.id === '63') {
    cardInfo.linkedCardID = 'A1-218'
  }

  const typeAndEvolution = $('p.card-text-type').text().trim().split('-')
  cardInfo.card_type = typeAndEvolution[0].toLowerCase().trim()
  cardInfo.evolution_type = typeAndEvolution[1] ? typeAndEvolution[1].toLowerCase().trim().replace(' ', '') : 'basic'

  cardInfo.attacks = []
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
      const attackName = attackParts.slice(0, -1).join(' ').trim() || 'Unknown'
      const attackDamage = attackParts.slice(-1)[0].trim() || '0'
      const attackEffect = attackEffectSection.text().trim() || 'No effect'

      cardInfo.attacks.push({
        cost: attackCost,
        name: attackName,
        damage: attackDamage,
        effect: attackEffect,
      })
    }
  })

  cardInfo.ability = extractAbility($)
  const weaknessAndRetreat = $('p.card-text-wrr').text().trim().split('\n')
  cardInfo.weakness = weaknessAndRetreat[0]?.split(': ')[1]?.toLowerCase().trim() || 'N/A'
  cardInfo.retreat = weaknessAndRetreat[1]?.split(': ')[1]?.toLowerCase().trim() || 'N/A'

  const raritySection = $('table.card-prints-versions tr.current')
  cardInfo.rarity = raritySection.find('td:last-child').text().trim() || 'Unknown'
  cardInfo.fullart = fullArtRarities.includes(cardInfo.rarity) ? 'Yes' : 'No'

  cardInfo.ex = cardInfo.name.includes('ex') ? 'yes' : 'no'

  const { setDetails, pack } = extractSetAndPackInfo($)
  cardInfo.set_details = setDetails
  cardInfo.pack = pack

  cardInfo.alternate_versions = []
  $('table.card-prints-versions tr').each((_i, version) => {
    const versionName = $(version).find('a').text().trim().replace(/\s+/g, ' ')
    const rarityText = $(version).find('td:last-child').text().trim()
    if (versionName) {
      cardInfo.alternate_versions.push({
        version: versionName,
        rarity: rarityText === 'Crown Rare' ? '♛' : rarityText,
      })
    }
  })

  cardInfo.artist = $('div.card-text-section.card-text-artist a').text().trim() || 'Unknown'
  cardInfo.crafting_cost = craftingCost[cardInfo.rarity] || 'Unknown'

  console.log('returning card info', cardInfo.id)
  return cardInfo
}

async function getCardDetails(cardUrl) {
  try {
    console.log(`Fetching details for ${cardUrl}...`)
    const $ = await fetchHTML(cardUrl)
    return extractCardInfo($, cardUrl)
  } catch (error) {
    console.error(`Error fetching details for ${cardUrl}:`, error)
    return null // Return null or a default object to continue the process for other cards
  }
}
function extractAbility($) {
  const cardType = $('p.card-text-type').text().trim()
  if (cardType.startsWith('Trainer')) {
    // For Trainer cards, handle the effect for Trainer cards explicitly
    const abilitySection = $('div.card-text-section')
    if (abilitySection.length) {
      const nextSection = abilitySection.next('div.card-text-section')
      return nextSection.length ? nextSection.text().trim() : 'No effect'
    }
    return 'No effect'
  } else {
    // For other cards, extract ability name and effect
    const abilitySection = $('div.card-text-ability')
    if (abilitySection.length) {
      const abilityName = abilitySection.find('p.card-text-ability-info').text().replace('Ability:', '').trim()
      let abilityEffect = abilitySection.find('p.card-text-ability-effect').text().trim()

      // Remove text within square brackets, similar to Python's re.sub(r'\[.*?\]', '')
      abilityEffect = abilityEffect.replace(/\[.*?]/g, '').trim()

      return {
        name: abilityName || 'No ability',
        effect: abilityEffect || 'No effect',
      }
    }
    return { name: 'No ability', effect: 'N/A' }
  }
}

async function getCardLinks(mainUrl) {
  const $ = await fetchHTML(mainUrl)
  const links = []

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
      const cards = []
      let index = 0 // Track the current index of the cardLinks being processed

      fs.mkdirSync(targetDir, { recursive: true })

      // Function to process a batch of tasks with a given concurrency limit
      async function processBatch() {
        // Queue up to `concurrencyLimit` promises at the same time
        const promises = []
        while (index < cardLinks.length && promises.length < concurrencyLimit) {
          const link = cardLinks[index++]
          promises.push(
            getCardDetails(link).then((card) => {
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
      cards.sort((a, b) => Number.parseInt(a.id, 10) - Number.parseInt(b.id, 10))

      fs.writeFileSync(path.join(targetDir, `${expansion}.json`), JSON.stringify(cards, null, 2))
      console.log('Cards saved to cards.json')
    } catch (error) {
      console.error('Error scraping cards:', error)
    }
  }
}

scrapeCards().catch(console.error)

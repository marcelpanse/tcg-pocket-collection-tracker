import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

const BASE_URL = 'https://bulbapedia.bulbagarden.net/wiki'
const targetDir = '../frontend/assets/themed-collections/'
const expansions = ['A3b']
// const expansions = ['A1', 'A1a', 'A2', 'A2a', 'A2b', 'A3', 'A3a', 'A3b']
const expansionToName = {
  A1: 'Genetic_Apex',
  A1a: 'Mythical_Island',
  A2: 'Space-Time_Smackdown',
  A2a: 'Triumphant_Light',
  A2b: 'Shining_Revelry',
  A3: 'Celestial_Guardians',
  A3a: 'Extradimensional_Crisis',
  A3b: 'Eevee_Grove',
}

async function fetchHTML(url) {
  const response = await fetch(url)
  const text = await response.text()
  return cheerio.load(text)
}

function parseCards($, cards, expansion) {
  const cardsList = []
  let isOfTheFollowing = false
  const combinationCard = {}
  cards.contents().each((_i, elem) => {
    const line = $(elem).text()
    const numOfFollowing = line.match(/\d+ of the following:/)
    const numOfCombination = line.match(/\d+ in any combination of:/)
    if (numOfFollowing != null) {
      isOfTheFollowing = true
      combinationCard.amount = numOfFollowing[0].slice(0, -18)
      combinationCard.options = []
    } else if (numOfCombination != null) {
      isOfTheFollowing = true
      combinationCard.amount = numOfCombination[0].slice(0, -23)
      combinationCard.options = []
    } else {
      const ids = line.match(/#\d\d\d/g)
      if (ids != null) {
        const options = ids.map((id) => `${expansion}-${Number.parseInt(id.slice(1))}`)
        if (isOfTheFollowing) {
          combinationCard.options = combinationCard.options.concat(options)
        } else {
          const card = {}
          card.options = options
          const amount = line.match(/×\d+/g)
          if (amount != null) {
            card.amount = Number.parseInt(amount[0].slice(1))
          } else {
            card.amount = 1
          }
          cardsList.push(card)
        }
      }
    }
  })
  if (isOfTheFollowing) {
    cardsList.push(combinationCard)
  }
  return cardsList
}

async function getExpansionMissions(expansion) {
  const expansionUrl = `${BASE_URL}/${expansionToName[expansion]}_(TCG_Pocket)#Themed_Collections`
  console.log(`Fetching details for ${expansionUrl}...`)
  try {
    const $ = await fetchHTML(expansionUrl)
    const missions = []
    $('table').each((_i, table) => {
      if ($(table).text().includes('Required cards')) {
        $(table)
          .find('tr')
          .each((_j, row) => {
            const tableRow = $(row).find('td')
            const mission = {}
            mission.expansionId = expansion
            mission.name = tableRow.eq(0).text()
            // mission.requiredCards = tableRow.eq(1).text()
            mission.requiredCards = parseCards($, tableRow.eq(1), expansion)
            const rewardCell = tableRow.eq(2)
            const rewardItems = []

            // Get text content from each child node or text node, respecting <br> tags
            rewardCell.contents().each((_k, node) => {
              if (node.type === 'text') {
                // Add text content to rewards array if it's not just whitespace
                const text = $(node).text().trim()
                if (text) rewardItems.push(text)
              } else if (node.name === 'br') {
                // Don't need to do anything special for <br> tags as we're collecting items separately
              } else if (node.name) {
                // Handle other HTML elements (spans with images, etc.)
                const text = $(node).text().trim()
                if (text) rewardItems.push(text)
              }
            })

            // Join the reward items with newlines and remove extra spaces
            mission.reward = rewardItems.map((item) => item.replace(/\s+/g, ' ').trim()).join('<br />')
            if (mission.name !== '') {
              missions.push(mission)
            }
          })
      }
    })
    return missions
  } catch (error) {
    console.error(`Error fetching missions for ${expansionUrl}:`, error)
    return null
  }
}

async function scrapeMissions() {
  for (const expansion of expansions) {
    try {
      fs.mkdirSync(targetDir, { recursive: true })

      const missions = await getExpansionMissions(expansion)
      console.log(`Scraping completed. Found ${missions.length} missions for ${expansion}.`)

      fs.writeFileSync(path.join(targetDir, `${expansion}-missions.json`), JSON.stringify(missions, null, 2))
      console.log('Cards saved to %s-missions.json', expansion)
    } catch (error) {
      console.error('Error scraping missions:', error)
    }
  }
}

scrapeMissions().catch(console.error)

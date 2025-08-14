import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

const BASE_URL = 'https://game8.co/games/Pokemon-TCG-Pocket/archives/'
const ALL_DECK_URL = '477754'
const targetDir = 'frontend/assets/decks/'
const myDecks = []

async function fetchHTML(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  })
  const text = await response.text()
  return cheerio.load(text)
}

async function scrapeDeckSource() {
  console.log('Scraping decks from Game8.co')
  const $ = await fetchHTML(BASE_URL + ALL_DECK_URL)

  //For Debug purposes
  // const filepath = './response.html'
  // const savedHtml = await fetchAndSaveHTMLIfNotExists(BASE_URL + ALL_DECK_URL, filepath)
  // const $ = cheerio.load(savedHtml)

  const tableTopDeck = $('.a-table').eq(1)

  //we loop on each row of table

  const rows = tableTopDeck.find('tr')
  let currentRank = null

  console.log(`Found ${rows.length / 2} tiers.`)
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] // élément natif
    if (i % 2 === 0) {
      //even row are rank
      currentRank = $(row).find('img').first().attr('alt').replace('Tier', '').trim()
    } else {
      const decksA = $(row).find('a')

      console.log(`Found ${decksA.length} decks in ${currentRank} tier.`)
      let deckCount = 0
      for (const a of decksA) {
        deckCount++
        const deck = { cards: [], rank: currentRank }
        deck.name = $(a).find('img').attr('alt').replace('Deck', '').replace(' and ', ' & ').trim()
        deck.img_url = $(a).find('img').attr('data-src')
        //third a is deck id
        deck.deck_id = $(a).attr('href').split('/').pop()

        console.log(`Scraping deck ${deck.name}. (${deckCount} of ${decksA.length})`)
        await scrapeDeck(deck)
        myDecks.push(deck)
      }
    }
  }
  fs.writeFileSync(path.join(targetDir, 'decks-game8.json'), JSON.stringify(myDecks, null, 2))
}

async function scrapeDeck(deck) {
  const cards = []
  const energy = []

  if (deck.deck_id) {
    const $ = await fetchHTML(BASE_URL + deck.deck_id)

    //For Debug purposes
    // const filepath = './responseDeck.html'
    // deck.deck_id = '538981#hm_101'
    // const savedHtml = await fetchAndSaveHTMLIfNotExists(`${BASE_URL}/${deck.deck_id}`, filepath)
    // const $ = cheerio.load(savedHtml)

    let tableDeck1
    if (deck.deck_id.includes('#')) {
      tableDeck1 = $(`#${deck.deck_id.split('#')[1]}`).next('table.table--fixed')
    } else {
      tableDeck1 = $('.table--fixed').eq(0)
    }
    const rows = tableDeck1.find('tr')

    for (const row of rows) {
      const cardsTd = $(row).find('td')
      for (const td of cardsTd) {
        const text = $(td).text().trim()
        const imgs = $(td).find('img')
        imgs.each((_, img) => {
          const alt = $(img).attr('alt')
          const cardId = formatCardId(alt)
          if (cardId) {
            if (cardId.includes('-NaN')) {
              energy.push(cardId.replace('-NaN', '').toLowerCase())
            } else {
              cards.push(cardId)
              if (text.includes('2')) {
                cards.push(cardId)
              }
            }
          }
        })
      }
    }

    deck.cards = cards
    deck.energy = energy
  }
}

function formatCardId(cardName) {
  //Pokemon TCG Pocket- A1 033 Card
  let cardId = cardName.replace('Pokemon TCG Pocket- ', '').replace(' Card', '')
  cardId = `${cardId.split(' ')[0]}-${Number(cardId.split(' ')[1])}`
  return cardId
}

//For Debug purposes
// async function fetchAndSaveHTMLIfNotExists(url, filepath) {
//   try {
//     const existingHtml = fs.readFileSync(filepath)
//     return existingHtml
//   } catch {
//     // Fichier n'existe pas
//     const response = await fetch(url)
//     const html = await response.text()

//     fs.writeFileSync(filepath, html)
//     console.log(`HTML saved to ${filepath}`)

//     return html
//   }
// }

scrapeDeckSource().catch(console.error)

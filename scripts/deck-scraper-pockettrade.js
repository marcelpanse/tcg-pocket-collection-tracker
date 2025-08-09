import fs from 'node:fs'
import path from 'node:path'
import fetch from 'node-fetch'

const BASE_URL = 'https://pockettrade.app/ptg/v1/deck'
const ALL_DECK_URL = '/filter'
const SPECIFIC_DECK_URL = '/details'
const targetDir = 'frontend/assets/decks/'
let allDecks = []
const myDecks = []

async function scrapeDeckSource() {
  const payload = { type: 'featured', search_string: '', card_no_list: [], pack_ids: [], rarities: [], energy_types: [], search_user_id: null }
  const response = await fetch(BASE_URL + ALL_DECK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // adjust if API requires something else
    },
    body: JSON.stringify(payload), // your data here
  })

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }
  allDecks = await response.json()
  for (const deck of allDecks.decks) {
    await scrapeDeck(deck.deck_id)
  }

  fs.writeFileSync(path.join(targetDir, 'decks_pockettrade.json'), JSON.stringify(myDecks, null, 2))
}

async function scrapeDeck(deckId) {
  if (deckId) {
    const response = await fetch(`${BASE_URL}${SPECIFIC_DECK_URL}/${deckId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    const deckDetails = await response.json()

    const deck = {
      name: deckDetails.name,
      img_url: deckDetails.card_image_url,
      deck_id: deckDetails.deck_id,
      cards: deckDetails.cards.map((card) => `${card.card_no.replace('_', '-')}`),
      rank: deckDetails.badges[0].text.replace('Tier', '').trim(),
      energy: [],
    }

    myDecks.push(deck)
  }
}

scrapeDeckSource().catch(console.error)

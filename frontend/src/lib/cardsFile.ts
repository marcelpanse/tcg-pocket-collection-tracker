import type { Card, StoredCard } from '@/types'

// cards.json stores each card once, with all the expansions it is printed in.
// The rest of the app works with one Card per print (card_id), so cards are expanded when loaded.

const imagesPath = '/images/en-US/'

// By expansion, then by card number
export function compareCards(a: Pick<Card, 'expansion' | 'card_id'>, b: Pick<Card, 'expansion' | 'card_id'>) {
  if (a.expansion !== b.expansion) {
    return a.expansion < b.expansion ? -1 : 1
  }
  return Number.parseInt(a.card_id.split('-').pop() as string, 10) - Number.parseInt(b.card_id.split('-').pop() as string, 10)
}

export function expandCards(storedCards: StoredCard[]): Card[] {
  const cards = storedCards.flatMap(({ expansions, ...card }) =>
    expansions.map(({ expansion, number, pack }) => {
      const card_id = `${expansion}-${number}`
      return { ...card, card_id, expansion, image: `${imagesPath}${card_id}.webp`, pack } as Card
    }),
  )
  return cards.sort(compareCards)
}

export function compactCards(cards: Card[]): StoredCard[] {
  const storedCards = new Map<number, StoredCard>()

  for (const { card_id, expansion, image, pack, amount_owned, collected, updated_at, ...card } of cards) {
    const number = Number.parseInt(card_id.split('-').pop() as string, 10)
    if (`${expansion}-${number}` !== card_id || image !== `${imagesPath}${card_id}.webp`) {
      throw new Error(`Unexpected card_id or image for ${card_id}: ${image}`)
    }

    const stored = storedCards.get(card.internal_id)
    if (!stored) {
      const { internal_id, name, ...rest } = card
      storedCards.set(internal_id, { internal_id, name, expansions: [{ expansion, number, pack }], ...rest })
      continue
    }

    // Everything but the print itself is stored once: if a source disagrees between prints (e.g. a typo
    // in a reprint's artist on Limitless), the first print wins
    const { expansions: _expansions, ...storedRest } = stored
    for (const key of new Set([...Object.keys(storedRest), ...Object.keys(card)]) as Set<keyof typeof card>) {
      if (JSON.stringify(storedRest[key]) !== JSON.stringify(card[key])) {
        console.warn(
          `${card_id} and ${stored.expansions[0].expansion}-${stored.expansions[0].number} share internal_id ${card.internal_id} but have a different ${key}, keeping ${JSON.stringify(storedRest[key])}`,
        )
      }
    }
    stored.expansions.push({ expansion, number, pack })
  }

  return [...storedCards.values()]
}

// Checks that cards.json loads and that no existing card disappeared or changed internal_id
// compared with a base git ref (users' collections are stored by internal_id).
// Run: pnpm verify-cards [base ref, default origin/main]

import { execFileSync } from 'node:child_process'
import { allCards } from '../frontend/src/lib/CardsDB'
import { decode } from './encoder'

const baseRef = process.argv[2] ?? 'origin/main'
const cardsPath = 'frontend/assets/cards.json'

type StoredEntry = { internal_id: number; card_id?: string; expansions?: { expansion: string; number: number }[] }

// cards.json has either one entry per card_id, or one entry per internal_id with its prints in `expansions`
function internalIdsByCardId(entries: StoredEntry[]): Map<string, number> {
  const ids = new Map<string, number>()
  for (const entry of entries) {
    const cardIds = entry.expansions ? entry.expansions.map((e) => `${e.expansion}-${e.number}`) : [entry.card_id as string]
    for (const cardId of cardIds) {
      ids.set(cardId, entry.internal_id)
    }
  }
  return ids
}

const errors: string[] = []

const currentIds = new Map<string, number>()
for (const card of allCards) {
  if (currentIds.has(card.card_id)) {
    errors.push(`Duplicate card_id ${card.card_id}`)
  }
  currentIds.set(card.card_id, card.internal_id)
  try {
    decode(card.internal_id)
  } catch (error) {
    errors.push(`${card.card_id}: ${error instanceof Error ? error.message : error}`)
  }
}

const baseIds = internalIdsByCardId(JSON.parse(execFileSync('git', ['show', `${baseRef}:${cardsPath}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })))
for (const [cardId, internalId] of baseIds) {
  const current = currentIds.get(cardId)
  if (current === undefined) {
    errors.push(`${cardId} was removed`)
  } else if (current !== internalId) {
    errors.push(`${cardId} changed internal_id: ${internalId} -> ${current}`)
  }
}

const added = [...currentIds.keys()].filter((cardId) => !baseIds.has(cardId))
console.log(`${allCards.length} cards, ${baseIds.size} in ${baseRef}, ${added.length} new${added.length > 0 ? `: ${added.join(', ')}` : ''}`)

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error)
  }
  process.exit(1)
}
console.log('cards.json is valid')

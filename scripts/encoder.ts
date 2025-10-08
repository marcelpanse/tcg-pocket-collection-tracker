import { expansions } from '../frontend/src/lib/CardsDB'
import type { Expansion } from '../frontend/src/types'

const MASK_7 = 0x7f // 127 - for expansion and rarity (up to 99)
const MASK_10 = 0x3ff // 1023 - for card number (up to 999)

export function encode(expansion: Expansion, cardNr: number, rarity: Rarity): number {
  console.log('encoding', expansion.id, cardNr, rarity)
  const expansionId = expansion.internalId ?? 0
  const rarityId = rarityToId[rarity] ?? 0

  if (expansionId < 1 || expansionId > 99) {
    throw new Error('Expansion ID must be 1-99')
  }
  if (cardNr < 1 || cardNr > 999) {
    throw new Error('Card number must be 1-999')
  }
  if (rarityId < 1 || rarityId > 99) {
    throw new Error('Rarity ID must be 1-99')
  }

  // Layout: [7 bits expansion][10 bits cardNr][7 bits rarity] = 24 bits total
  const encoded = (expansionId << 17) | (cardNr << 7) | rarityId
  const x = encoded >>> 0 // unsigned 32-bit

  console.log('encoded', x)
  console.log('decoded', decode(x)) // sanity check

  return x
}

export function decode(id: number) {
  const rarityId = id & MASK_7
  const card = (id >>> 7) & MASK_10
  const expansionId = (id >>> 17) & MASK_7
  return {
    expansion: expansions.find((e) => e.internalId === expansionId)?.id ?? '',
    card,
    rarity: rarities[rarityId] ?? '',
  }
}

export const rarities = [
  '', //0
  '◊', // 1
  '◊◊', // 2
  '◊◊◊', // 3
  '◊◊◊◊', // 4
  '☆', // 5
  '☆☆', // 6
  '☆☆☆', // 7
  '✵', // 8
  '✵✵', // 9
  'Crown Rare', // 10
  'P', // 11
] as const

export type Rarity = (typeof rarities)[number]

const rarityToId = Object.fromEntries(rarities.map((r, i) => [r, i])) as Record<Rarity, number>

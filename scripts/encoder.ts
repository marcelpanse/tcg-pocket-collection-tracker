import { expansions } from '../frontend/src/lib/CardsDB'
import type { Expansion, ExpansionId, Rarity } from '../frontend/src/types'

const MASK_6 = 0x3f // 63 - for rarity
const MASK_8 = 0xff // 255 - for expansion and rarity (up to 199)
const MASK_10 = 0x3ff // 1023 - for card number (up to 999)

export function encode(expansion: Expansion, cardNr: number, rarity: Rarity): number {
  console.log('encoding', expansion.id, cardNr, rarity)
  const expansionId = expansion.internalId
  const rarityId = rarityToId[rarity]

  if (expansionId < 1 || expansionId > 199) {
    throw new Error('Expansion ID must be 1-199')
  }
  if (cardNr < 1 || cardNr > 999) {
    throw new Error('Card number must be 1-999')
  }
  if (rarityId < 0 || rarityId > 63) {
    throw new Error('Rarity ID must be 0-63')
  }

  // Layout: [8 bits expansion][10 bits cardNr][6 bits rarity] = 24 bits total
  const encoded = (expansionId << 16) | (cardNr << 6) | rarityId
  const x = encoded >>> 0 // unsigned 32-bit

  console.log('encoded', x)
  console.log('decoded', decode(x)) // sanity check

  return x
}

export function decode(id: number) {
  const rarityId = id & MASK_6
  const card = (id >>> 6) & MASK_10
  const expansionId = (id >>> 16) & MASK_8

  const rarity = rarityIdToRarity.get(rarityId)
  const expansion = expansions.find((e) => e.internalId === expansionId)
  if (rarity === undefined || expansion === undefined) {
    throw new Error(`Cannot decode ${id}: rarity=${rarityId.toString(2)}, expansion=${expansionId}`)
  }
  return { expansion: expansion.id as ExpansionId, card, rarity }
}

const rarityToId: Record<Rarity, number> = {
  '◊': 0,
  '◊◊': 1,
  '◊◊◊': 2,
  '◊◊◊◊': 3,
  '☆': 4,
  '☆☆': 5,
  '☆☆☆': 6,
  // '☆☆☆☆': 7,
  '✵': 8,
  '✵✵': 9,
  // '✵✵✵': 10,
  // '✵✵✵✵': 11,
  'Crown Rare': 12,
  // 13-15
  P: 16,
  // 17-63
} as const

const rarityIdToRarity: Map<number, Rarity> = new Map(Object.entries(rarityToId).map(([r, i]) => [i, r as Rarity]))

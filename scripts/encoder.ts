const MASK_16 = 0xffff
const MASK_12 = 0xfff
const MASK_4 = 0xf

export function encode(expansion: string, cardNr: number, rarity: Rarity): number {
  console.log('encoding', expansion, cardNr, rarity)
  const expansionId = encodeExpansion(expansion)
  const rarityId = rarityToId[rarity] ?? 0

  if (expansionId > MASK_16) {
    throw new Error('Expansion too large (>16 bits)')
  }
  if (cardNr > MASK_12) {
    throw new Error('Card number too large (>12 bits)')
  }
  if (rarityId > MASK_4) {
    throw new Error('Rarity too large (>4 bits)')
  }

  const encoded = (expansionId << 16) | (cardNr << 4) | rarityId
  const x = encoded >>> 0 // unsigned 32-bit

  console.log('encoded', x)
  console.log('decoded', decode(x)) // sanity check

  return x
}

export function decode(id: number) {
  const rarityId = id & MASK_4
  const card = (id >>> 4) & MASK_12
  const expansion = (id >>> 16) & MASK_16
  return {
    expansion: decodeExpansion(expansion) ?? '',
    card,
    rarity: rarities[rarityId] ?? '',
  }
}

export const rarities = [
  '◊', // 0
  '◊◊', // 1
  '◊◊◊', // 2
  '◊◊◊◊', // 3
  '☆', // 4
  '☆☆', // 5
  '☆☆☆', // 6
  '✵', // 7
  '✵✵', // 8
  'Crown Rare', // 9
  'P', // 10
  '', // 11 (fallback / undefined)
] as const

export type Rarity = (typeof rarities)[number]

const rarityToId = Object.fromEntries(rarities.map((r, i) => [r, i])) as Record<Rarity, number>

export function encodeExpansion(exp: string): number {
  const cleaned = exp.toUpperCase().replace(/[^A-Z0-9]/g, '')
  let num = 0
  for (const char of cleaned) {
    const val = parseInt(char, 36) // A=10, B=11, etc.
    num = num * 36 + val
  }
  return num // fits easily into 16 bits for <=3 chars
}

export function decodeExpansion(num: number): string {
  if (num === 0) {
    return ''
  }
  let out = ''
  while (num > 0) {
    const rem = num % 36
    out = rem.toString(36).toUpperCase() + out
    num = Math.floor(num / 36)
  }
  return out
}

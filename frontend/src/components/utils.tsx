import type { CardTypeOption } from '@/lib/filters'
import type { Rarity } from '@/types'

export function formatRarity(rarity: Rarity) {
  switch (rarity) {
    case '◊':
    case '◊◊':
    case '◊◊◊':
    case '◊◊◊◊':
      return rarity
    case '☆':
    case '☆☆':
    case '☆☆☆':
      return <span className="text-yellow-500 hover:text-yellow-400 data-[state=on]:text-yellow-300">{rarity}</span>
    case '✵':
    case '✵✵':
      return <span className="text-pink-300 hover:text-pink-300 data-[state=on]:text-pink-300">{rarity}</span>
    case 'Crown Rare':
      return '👑'
    case 'P':
      return 'P'
  }
  throw new Error(`Unrecognized rarity: ${rarity}`)
}

export function showCardType(x: CardTypeOption) {
  if (x === 'trainer') {
    return 'T'
  } else {
    return <img src={`/images/energy/${x}.webp`} alt={x} className="h-4" />
  }
}

import type { Rarity } from '@/types'

export function formatRarity(rarity: Rarity) {
  switch (rarity) {
    case '◊':
    case '◊◊':
    case '◊◊◊':
    case '◊◊◊◊':
      return <span className="text-gray-400 hover:text-gray-500 px-1">{rarity}</span>
    case '☆':
    case '☆☆':
    case '☆☆☆':
      return <span className="text-yellow-500 hover:text-yellow-600 data-[state=on]:text-yellow-500 px-1">{rarity}</span>
    case '✵':
    case '✵✵':
      return <span className="text-pink-300 hover:text-pink-500 .dark:data-[state=on]:text-pink-400 px-1">{rarity}</span>
    case 'Crown Rare':
      return <span className="px-1">👑</span>
    case 'P':
      return <span className="px-1">P</span>
  }
  return null
}

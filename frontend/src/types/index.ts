const expansionIds = ['A1', 'A1a', 'A2', 'A2a', 'A2b', 'A3', 'A3a', 'A3b', 'A4', 'P-A'] as const
export type ExpansionId = (typeof expansionIds)[number]

const rarities = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', '☆', '☆☆', '☆☆☆', '✵', '✵✵', 'Crown Rare', 'P', ''] as const

export const cardTypes = ['grass', 'fire', 'water', 'lightning', 'psychic', 'fighting', 'darkness', 'metal', 'dragon', 'colorless', 'trainer', ''] as const

export type Rarity = (typeof rarities)[number]
export type CardType = (typeof cardTypes)[number]

export interface AccountRow {
  $id: string
  username: string
  friend_id: string
  is_public: boolean
  is_active_trading: boolean
  min_number_of_cards_to_keep: number
  max_number_of_cards_wanted: number
}

export interface CollectionRow {
  email: string
  card_id: string
  amount_owned: number
  rarity?: Rarity
  updated_at: string
}

export interface Expansion {
  name: string
  id: ExpansionId
  cards: Card[]
  packs: Pack[]
  missions?: Mission[]
  tradeable?: boolean
  promo?: boolean
  containsShinies?: boolean
  containsBabies?: boolean
}

export interface Pack {
  name: string
  color: string
}

export interface Card {
  card_id: string
  linkedCardID?: string
  expansion: ExpansionId
  name: string
  hp: string
  energy: string
  card_type: string
  evolution_type: string
  image: string
  attacks: {
    cost: string[]
    name: string
    damage: string
    effect: string
  }[]
  ability: {
    name: string
    effect: string
  }
  weakness: string
  retreat: string
  rarity: Rarity
  fullart: string
  ex: string
  baby: boolean
  set_details: string
  pack: string
  alternate_versions: {
    card_id: string
    version: string
    rarity: Rarity
  }[]
  artist: string
  probability: {
    '1-3 card': string | null | undefined
    '4 card': string | null | undefined
    '5 card': string | null | undefined
  }
  crafting_cost: number

  amount_owned?: number // calculated from the collection table
}

export interface ImportExportRow {
  Id: string
  CardName: string
  NumberOwned: number
}

export interface Mission {
  name: string
  requiredCards: MissionCard[]
  expansionId: ExpansionId
  reward?: string
  completed?: boolean
}

export interface MissionCard {
  amount: number
  options: string[]
  owned?: number
}

const expansionIds = ['A1', 'A1a', 'A2', 'A2a', 'P-A'] as const
export type ExpansionId = (typeof expansionIds)[number]

const rarities = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', '☆', '☆☆', '☆☆☆', 'Crown Rare', 'Unknown', ''] as const

export type Rarity = (typeof rarities)[number]

export interface AccountRow {
  $id: string
  username: string
  friend_id: string
}

export interface CollectionRow {
  email: string
  card_id: string
  amount_owned: number
  rarity?: Rarity
}

export interface Expansion {
  name: string
  id: ExpansionId
  cards: Card[]
  packs: Pack[]
  tradeable?: boolean
  promo?: boolean
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
  set_details: string
  pack: string
  alternate_versions: {
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

export interface CollectedCard extends Card {
  amount_owned?: number
}

export interface ImportExportRow {
  Id: string
  CardName: string
  NumberOwned: number
}

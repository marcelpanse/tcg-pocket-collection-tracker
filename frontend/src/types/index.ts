import type { Models } from 'appwrite'

export interface AccountRow {
  $id: string
  username: string
  friend_id: string
}

export interface CollectionRow extends Partial<Models.Document> {
  $id: string
  email: string
  card_id: string
  amount_owned: number
}

<<<<<<< HEAD
export interface Card {
  id: string
=======
export interface Expansion {
  name: string
  id: string
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
  expansion: string
>>>>>>> 7cb76f3866e4f04d49dbb1acdf91df59900ecd5d
  name: string
  hp: string
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
<<<<<<< HEAD
  } | string
=======
  }
>>>>>>> 7cb76f3866e4f04d49dbb1acdf91df59900ecd5d
  weakness: string
  retreat: string
  rarity: string
  fullart: string
  ex: string
  set_details: string
  pack: string
  alternate_versions: {
    version: string
    rarity: string
  }[]
  artist: string
  probability: {
    '1-3 card': string | null | undefined
    '4 card': string | null | undefined
    '5 card': string | null | undefined
  }
  crafting_cost: number
}

<<<<<<< HEAD
=======
export interface CollectedCard extends Card {
  amount_owned?: number
}
>>>>>>> 7cb76f3866e4f04d49dbb1acdf91df59900ecd5d

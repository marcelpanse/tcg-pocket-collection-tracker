import type { Models } from 'appwrite'

export enum BooleanType {
  Yes = 'Yes',
  No = 'No',
}

export interface CollectionRow extends Partial<Models.Document> {
  $id: string
  email: string
  card_id: string
  amount_owned: number
}

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
  expansion: string
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
  }
  weakness: string
  retreat: string
  rarity: Rarity
  fullart: BooleanType
  ex: BooleanType
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
}

export interface CollectedCard extends Card {
  amount_owned?: number
}

export enum Rarity {
  '◊' = '◊',
  '◊◊' = '◊◊',
  '◊◊◊' = '◊◊◊',
  '◊◊◊◊' = '◊◊◊◊',
  '☆' = '☆',
  '☆☆' = '☆☆',
  '☆☆☆' = '☆☆☆',
  CrownRare = 'Crown Rare',
}

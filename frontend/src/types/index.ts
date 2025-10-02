import type { Session } from '@supabase/supabase-js'

export type User = Session

export const expansionIds = ['A1', 'A1a', 'A2', 'A2a', 'A2b', 'A3', 'A3a', 'A3b', 'A4', 'A4a', 'A4b', 'P-A'] as const
export type ExpansionId = (typeof expansionIds)[number]

export const rarities = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', '☆', '☆☆', '☆☆☆', '✵', '✵✵', 'Crown Rare', 'P', ''] as const
export const tradableRarities = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', '☆'] as const

export const cardTypes = ['grass', 'fire', 'water', 'lightning', 'psychic', 'fighting', 'darkness', 'metal', 'dragon', 'colorless', 'trainer', ''] as const

export type Rarity = (typeof rarities)[number]
export type TradableRarity = (typeof tradableRarities)[number]
export type CardType = (typeof cardTypes)[number]

export interface AccountRow {
  $id: string
  email: string
  username: string
  friend_id: string
  collection_last_updated: Date
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

export interface CollectionRowUpdate {
  card_id: string
  amount_owned: number
}

const tradeStatuses = ['offered', 'accepted', 'declined', 'finished'] as const

export type TradeStatus = (typeof tradeStatuses)[number]

export interface TradeRow {
  id: number
  created_at: Date
  updated_at: Date
  offering_friend_id: string
  receiving_friend_id: string
  offer_card_id: string
  receiver_card_id: string
  offerer_ended: boolean
  receiver_ended: boolean
  status: TradeStatus
}

export interface TradePartners {
  friend_id: string
  username: string
  matched_cards_amount: number
}

export interface PackStructure {
  cardsPerPack: 4 | 5
}

export interface Expansion {
  name: string
  id: ExpansionId
  cards: Card[]
  packs: Pack[]
  missions?: Mission[]
  tradeable: boolean
  promo?: boolean
  containsShinies?: boolean
  containsBabies?: boolean
  packStructure?: PackStructure
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
  ability?: {
    name: string
    effect: string
  }
  weakness: string
  retreat: string
  rarity: Rarity
  fullart: boolean
  ex: boolean
  baby: boolean
  set_details: string
  pack: string
  alternate_versions: string[]
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

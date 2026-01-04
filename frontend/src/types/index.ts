import type { Session } from '@supabase/supabase-js'

export type User = Session

export const expansionIds = ['B1a', 'B1', 'A4b', 'A4a', 'A4', 'A3b', 'A3a', 'A3', 'A2b', 'A2a', 'A2', 'A1a', 'A1', 'P-B', 'P-A'] as const
export type ExpansionId = (typeof expansionIds)[number]

export const rarities = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', '☆', '☆☆', '☆☆☆', '✵', '✵✵', 'Crown Rare', 'P'] as const
export const tradableRarities = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', '☆', '☆☆', '✵', '✵✵'] as const

export const energies = ['grass', 'fire', 'water', 'lightning', 'psychic', 'fighting', 'darkness', 'metal'] as const
export type Energy = (typeof energies)[number]
export const cardTypes = [...energies, 'dragon', 'colorless', 'trainer'] as const

export type Rarity = (typeof rarities)[number]
export type TradableRarity = (typeof tradableRarities)[number]
export type CardType = (typeof cardTypes)[number]

export interface RaritySettingsRow {
  rarity: Rarity
  to_collect: number
  to_keep: number
}

export interface AccountRow {
  $id: string
  email: string
  username: string
  friend_id: string
  collection_last_updated: Date
  is_public: boolean
  is_active_trading: boolean
  trade_rarity_settings: RaritySettingsRow[]
}

export interface CollectionRow {
  amount_owned: number
  email: string
  created_at: string
  updated_at: string
  internal_id: number

  collection: string[] // array of cardIds
}

export interface CardAmountUpdate {
  amount_owned: number
  internal_id: number
  card_id: string
}

export interface CardAmountsRowUpdate {
  email: string
  amount_owned: number
  internal_id: number
  updated_at: string
}

export interface CollectionRowUpdate {
  email: string
  card_id: string
  internal_id: number
  updated_at: string
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
  trade_matches: number
}

export interface PackStructure {
  containsShinies: boolean
  containsBabies: boolean
  cardsPerPack: 4 | 5
}

export interface Expansion {
  name: string
  id: ExpansionId
  internalId: number
  packs: Pack[]
  missions?: Mission[]
  tradeable: boolean
  openable: boolean
  promo?: boolean
  packStructure?: PackStructure
}

export interface Pack {
  name: string
  color: string
}

export interface Card {
  internal_id: number
  card_id: string
  expansion: ExpansionId
  name: string
  hp?: number
  energy: CardType
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
  retreat?: number
  rarity: Rarity
  ex: boolean
  baby: boolean
  set_details: string
  pack: string
  alternate_versions: number[]
  artist: string

  amount_owned?: number // calculated from the card amounts table
  collected?: boolean // calculated from the card amounts table
  updated_at?: string // calculated from the card amounts table
}

export interface ImportExportRow {
  Id: string
  CardName: string
  InternalId: number
  NumberOwned: number
  Rarity: Rarity
  Collected: boolean
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

export interface Deck {
  id?: number
  email?: string
  likes?: number
  is_public: boolean
  name: string
  energy: Energy[]
  cards: number[]
}

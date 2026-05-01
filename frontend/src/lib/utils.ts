import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Card, Collection, GameLanguage, Mission, RaritySettingsRow } from '@/types'
import pokemonTranslations from '../../assets/pokemon_translations.json'
import toolTranslations from '../../assets/tools_translations.json'
import trainerTranslations from '../../assets/trainers_translations.json'
import { allCards } from './CardsDB'

export const formatLanguage: Record<GameLanguage, string> = {
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size))
  }
  return res
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatFriendId(friendId: string): string {
  if (!friendId || friendId.length !== 16) {
    return friendId
  }
  return `${friendId.slice(0, 4)}-${friendId.slice(4, 8)}-${friendId.slice(8, 12)}-${friendId.slice(12, 16)}`
}

export function getCardNameByLang(card: Card, lang: string): string {
  if (card.name === undefined || card.name === null) {
    return ''
  }

  switch (card.card_type) {
    case 'pokémon': {
      let cardName = card.ex ? card.name.slice(0, -3) : card.name
      const key = cardName.toLowerCase()
      const cardNameTranslations = pokemonTranslations[key as keyof typeof pokemonTranslations]

      if (cardNameTranslations) {
        cardName = cardNameTranslations[lang as keyof typeof cardNameTranslations] || cardName
      }

      return card.ex ? `${cardName} ex` : cardName
    }
    case 'trainer': {
      if (card.evolution_type === 'item' || card.evolution_type === 'tool' || card.evolution_type === 'stadium') {
        const toolNameTranslations = toolTranslations[card.name.toLowerCase() as keyof typeof toolTranslations]
        if (toolNameTranslations) {
          return toolNameTranslations[lang as keyof typeof toolNameTranslations] || card.name
        }
      } else if (card.evolution_type === 'supporter') {
        const trainerNameTranslations = trainerTranslations[card.name.toLowerCase() as keyof typeof trainerTranslations]
        if (trainerNameTranslations) {
          return trainerNameTranslations[lang as keyof typeof trainerNameTranslations] || card.name
        }
      }
      break
    }
  }

  return card.name
}

interface TradeSettings {
  to_collect: number
  to_keep: number
}

function getTradingCards(
  collection: Collection,
  settings_rows: RaritySettingsRow[],
  filter_func: (card: Card & { amount_owned: number }, settings: TradeSettings) => boolean,
) {
  const settings_map = Object.fromEntries(settings_rows.map(({ rarity, ...rest }) => [rarity, rest]))
  const arr = allCards
    .map((card) => {
      const row = collection.get(card.internal_id)
      return {
        card: { ...card, amount_owned: row?.amount_owned ?? 0 },
        settings: row !== undefined && row.amount_wanted !== null ? { to_keep: row.amount_wanted, to_collect: row.amount_wanted } : settings_map[card.rarity],
      }
    })
    .filter(({ card, settings }) => settings !== undefined && filter_func(card, settings))
    .map(({ card }) => card.internal_id)
  return [...new Set(arr)]
}

export function getExtraCards(cards: Collection, settings_rows: RaritySettingsRow[]): number[] {
  return getTradingCards(cards, settings_rows, (c, settings) => c.amount_owned > settings.to_keep)
}

export function getNeededCards(cards: Collection, settings_rows: RaritySettingsRow[]): number[] {
  return getTradingCards(cards, settings_rows, (c, settings) => c.amount_owned < settings.to_collect)
}

export function umami(event: string) {
  // @ts-expect-error runtime script on window object
  window.umami?.track(event)
}

export type MissionType = 'all' | 'normal' | 'secret' | 'complete'

export function getMissionType(mission: Mission): Exclude<MissionType, 'all'> {
  const name = mission.name.toLowerCase()
  if (name.includes('complete') || name.includes('pokedex') || name.includes('pokédex') || name.endsWith('immersive experience')) {
    return 'complete'
  }
  return mission.secret ? 'secret' : 'normal'
}

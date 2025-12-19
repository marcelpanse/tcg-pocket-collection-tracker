import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Card, CollectionRow, RaritySettingsRow } from '@/types'
import pokemonTranslations from '../../assets/pokemon_translations.json'
import toolTranslations from '../../assets/tools_translations.json'
import trainerTranslations from '../../assets/trainers_translations.json'
import { allCards } from './CardsDB'

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
      if (card.evolution_type === 'item' || card.evolution_type === 'tool') {
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

function getTradingCards(
  collection: Map<number, CollectionRow>,
  settings_rows: RaritySettingsRow[],
  filter_func: (card: Card & { amount_owned: number }, settings: Omit<RaritySettingsRow, 'rarity'>) => boolean,
) {
  const settings_map = Object.fromEntries(settings_rows.map(({ rarity, ...rest }) => [rarity, rest]))
  const arr = allCards
    .map((card) => ({
      card: { ...card, amount_owned: collection.get(card.internal_id)?.amount_owned ?? 0 },
      settings: settings_map[card.rarity],
    }))
    .filter(({ card, settings }) => settings !== undefined && filter_func(card, settings))
    .map(({ card }) => card.internal_id)
  return [...new Set(arr)]
}

export function getExtraCards(cards: Map<number, CollectionRow>, settings_rows: RaritySettingsRow[]): number[] {
  return getTradingCards(cards, settings_rows, (c, settings) => c.amount_owned > settings.to_keep)
}

export function getNeededCards(cards: Map<number, CollectionRow>, settings_rows: RaritySettingsRow[]): number[] {
  return getTradingCards(cards, settings_rows, (c, settings) => c.amount_owned < settings.to_collect)
}

export function umami(event: string) {
  // @ts-expect-error runtime script on window object
  window.umami?.track(event)
}

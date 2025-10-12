import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Card, CollectionRow } from '@/types'
import pokemonTranslations from '../../assets/pokemon_translations.json'
import toolTranslations from '../../assets/tools_translations.json'
import trainerTranslations from '../../assets/trainers_translations.json'
import { allCards } from './CardsDB'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

export function getExtraCards(cards: Map<number, CollectionRow>, amount_wanted: number): number[] {
  return Array.from(cards.values())
    .filter((c) => c.amount_owned > amount_wanted)
    .map((c) => c.internal_id)
}

export function getNeededCards(cards: Map<number, CollectionRow>, amount_wanted: number): number[] {
  const notNeeded = new Set(
    Array.from(cards.values())
      .filter((c) => c.amount_owned >= amount_wanted)
      .map((c) => c.internal_id),
  )
  return allCards.map((c) => c.internal_id).filter((internal_id) => !notNeeded.has(internal_id))
}

export function umami(event: string) {
  // @ts-expect-error runtime script on window object
  window.umami?.track(event)
}

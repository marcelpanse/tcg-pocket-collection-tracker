import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Card } from '@/types'
import pokemonTranslations from '../../assets/pokemon_translations.json'
import toolTranslations from '../../assets/tools_translations.json'
import trainerTranslations from '../../assets/trainers_translations.json'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCardNameByLang(card: Card, lang: string): string {
  if (card.name === undefined || card.name === null) return ''

  switch (card.card_type) {
    case 'pokémon': {
      let cardName = card.ex === 'yes' ? card.name.slice(0, -3) : card.name
      const key = cardName.toLowerCase()
      const cardNameTranslations = pokemonTranslations[key as keyof typeof pokemonTranslations]

      if (cardNameTranslations) {
        cardName = cardNameTranslations[lang as keyof typeof cardNameTranslations] || cardName
      }

      return card.ex === 'yes' ? `${cardName} ex` : cardName
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

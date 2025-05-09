import type { Card } from '@/types'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import pokemonTranslations from '../../assets/pokemon_translations.json'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCardNameByLang(card: Card, lang: string): string {
  if (card.name === undefined || card.name === null) return ''

  let cardName = card.ex === 'yes' ? card.name.slice(0, -3) : card.name

  const key = cardName.toLowerCase()
  const cardNameTranslations = pokemonTranslations[key as keyof typeof pokemonTranslations]

  if (cardNameTranslations) {
    cardName = cardNameTranslations[lang as keyof typeof cardNameTranslations] || cardName
  }

  return card.ex === 'yes' ? `${cardName} ex` : cardName
}

export const getPokemonImageUrl = (packName: string) => {
  // Normalize the packName (lowercase and remove spaces)
  const normalizedPackName = packName.toLowerCase().replace(/\s+/g, '')
  const pokemonMap: Record<string, string> = {
    pikachupack: 'pikachu',
    charizardpack: 'charizard',
    mewtwopack: 'mewtwo',
    dialgapack: 'dialga',
    palkiapack: 'palkia',
    mewpack: 'mew',
    arceuspack: 'arceus',
    shiningrevelrypack: 'rayquaza',
    lunalapack: 'lunala',
    solgaleopack: 'solgaleo',
    all: 'mew',
  }

  const pokemon = pokemonMap[normalizedPackName]
  return `/images/pokemon/${pokemon}.webp`
}

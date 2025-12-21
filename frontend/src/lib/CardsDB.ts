import type { Card, Expansion, ExpansionId, Mission, Rarity } from '@/types'
import AllCardsJson from '../../assets/cards.json'
import A1Missions from '../../assets/themed-collections/A1-missions.json'
import A1aMissions from '../../assets/themed-collections/A1a-missions.json'
import A2Missions from '../../assets/themed-collections/A2-missions.json'
import A2aMissions from '../../assets/themed-collections/A2a-missions.json'
import A2bMissions from '../../assets/themed-collections/A2b-missions.json'
import A3Missions from '../../assets/themed-collections/A3-missions.json'
import A3aMissions from '../../assets/themed-collections/A3a-missions.json'
import A3bMissions from '../../assets/themed-collections/A3b-missions.json'
import A4Missions from '../../assets/themed-collections/A4-missions.json'
import A4aMissions from '../../assets/themed-collections/A4a-missions.json'
import A4bMissions from '../../assets/themed-collections/A4b-missions.json'
import B1Missions from '../../assets/themed-collections/B1-missions.json'
import B1aMissions from '../../assets/themed-collections/B1a-missions.json'

export const allCards: Card[] = AllCardsJson as Card[]

const allCardsDict: Map<string, Card> = new Map(allCards.map((card) => [card.card_id, card]))
const allCardsByInternalId: Map<number, Card> = new Map(allCards.map((card) => [card.internal_id, card]))
const allCardsByInternalIdList: Partial<Record<number, Card[]>> = Object.groupBy(allCards, (c) => c.internal_id)

export const getCardById = (cardId: string): Card | undefined => {
  return allCardsDict.get(cardId)
}

export const getCardByInternalId = (internalId: number): Card | undefined => {
  return allCardsByInternalId.get(internalId)
}

export function getCardsByInternalId(internalId: number) {
  return allCardsByInternalIdList[internalId]
}

export const getInteralIdByCardId = (card_id: string) => {
  const internalId = getCardById(card_id)?.internal_id
  if (!internalId) {
    throw new Error(`Internal ID for card with id ${card_id} not found`)
  }
  return internalId
}

const a1Missions: Mission[] = A1Missions as unknown as Mission[]
const a1aMissions: Mission[] = A1aMissions as unknown as Mission[]
const a2Missions: Mission[] = A2Missions as unknown as Mission[]
const a2aMissions: Mission[] = A2aMissions as unknown as Mission[]
const a2bMissions: Mission[] = A2bMissions as unknown as Mission[]
const a3Missions: Mission[] = A3Missions as unknown as Mission[]
const a3aMissions: Mission[] = A3aMissions as unknown as Mission[]
const a3bMissions: Mission[] = A3bMissions as unknown as Mission[]
const a4Missions: Mission[] = A4Missions as unknown as Mission[]
const a4aMissions: Mission[] = A4aMissions as unknown as Mission[]
const a4bMissions: Mission[] = A4bMissions as unknown as Mission[]
const b1Missions: Mission[] = B1Missions as unknown as Mission[]
const b1aMissions: Mission[] = B1aMissions as unknown as Mission[]

export const expansions: Expansion[] = [
  // internalId=0 skipped for error states
  {
    name: 'geneticapex',
    id: 'A1',
    internalId: 1, // IMPORTANT note: these should NEVER EVER change. The internals of the DB depend on it.
    packs: [
      { name: 'mewtwopack', color: '#c078bc' },
      { name: 'charizardpack', color: '#c08c78' },
      { name: 'pikachupack', color: '#c0af78' },
      { name: 'everypack', color: '#c0c0c0' },
    ],
    missions: a1Missions,
    tradeable: true,
    openable: true,
    packStructure: {
      containsShinies: false,
      containsBabies: false,
      cardsPerPack: 5,
    },
  },
  {
    name: 'mythicalisland',
    id: 'A1a',
    internalId: 2,
    packs: [{ name: 'mewpack', color: '#c07898' }],
    missions: a1aMissions,
    tradeable: true,
    openable: true,
    packStructure: {
      containsShinies: false,
      containsBabies: false,
      cardsPerPack: 5,
    },
  },
  {
    name: 'space-timesmackdown',
    id: 'A2',
    internalId: 3,
    packs: [
      { name: 'dialgapack', color: '#7895c0' },
      { name: 'palkiapack', color: '#c07898' },
      { name: 'everypack', color: '#c0c0c0' },
    ],
    missions: a2Missions,
    tradeable: true,
    openable: true,
    packStructure: {
      containsShinies: false,
      containsBabies: false,
      cardsPerPack: 5,
    },
  },
  {
    name: 'triumphantlight',
    id: 'A2a',
    internalId: 4,
    packs: [{ name: 'arceuspack', color: '#c0b278' }],
    missions: a2aMissions,
    tradeable: true,
    openable: true,
    packStructure: {
      containsShinies: false,
      containsBabies: false,
      cardsPerPack: 5,
    },
  },
  {
    name: 'shiningrevelry',
    id: 'A2b',
    internalId: 5,
    packs: [{ name: 'shiningrevelrypack', color: '#78b3c0' }],
    missions: a2bMissions,
    tradeable: true,
    openable: true,
    packStructure: {
      containsShinies: true,
      containsBabies: false,
      cardsPerPack: 5,
    },
  },
  {
    name: 'celestialguardians',
    id: 'A3',
    internalId: 6,
    packs: [
      { name: 'lunalapack', color: '#8c78c0' },
      { name: 'solgaleopack', color: '#c09e78' },
      { name: 'everypack', color: '#c0c0c0' },
    ],
    missions: a3Missions,
    tradeable: true,
    openable: true,
    packStructure: {
      containsShinies: true,
      containsBabies: false,
      cardsPerPack: 5,
    },
  },
  {
    name: 'extradimensionalcrisis',
    id: 'A3a',
    internalId: 7,
    packs: [{ name: 'buzzwolepack', color: '#c07878' }],
    missions: a3aMissions,
    tradeable: true,
    openable: true,
    packStructure: {
      containsShinies: true,
      containsBabies: false,
      cardsPerPack: 5,
    },
  },
  {
    name: 'eeveegrove',
    id: 'A3b',
    internalId: 8,
    packs: [{ name: 'eeveegrovepack', color: '#c0a378' }],
    missions: a3bMissions,
    tradeable: true,
    openable: true,
    packStructure: {
      containsShinies: true,
      containsBabies: false,
      cardsPerPack: 5,
    },
  },
  {
    name: 'wisdomofseaandsky',
    id: 'A4',
    internalId: 9,
    packs: [
      { name: 'ho-ohpack', color: '#c09578' },
      { name: 'lugiapack', color: '#789ec0' },
      { name: 'everypack', color: '#c0c0c0' },
    ],
    missions: a4Missions,
    tradeable: true,
    openable: true,
    packStructure: {
      containsShinies: true,
      containsBabies: true,
      cardsPerPack: 5,
    },
  },
  {
    name: 'secludedsprings',
    id: 'A4a',
    internalId: 10,
    packs: [{ name: 'suicunepack', color: '#78c0be' }],
    missions: a4aMissions,
    tradeable: true,
    openable: true,
    packStructure: {
      containsShinies: true,
      containsBabies: true,
      cardsPerPack: 5,
    },
  },
  {
    name: 'deluxepackex',
    id: 'A4b',
    internalId: 11,
    packs: [{ name: 'deluxepack', color: '#c0af78' }],
    missions: a4bMissions,
    tradeable: true,
    openable: false,
    packStructure: {
      containsShinies: true,
      containsBabies: false,
      cardsPerPack: 4,
    },
  },
  {
    name: 'megarising',
    id: 'B1',
    internalId: 12,
    packs: [
      { name: 'megaaltariapack', color: '#78b3c0' },
      { name: 'megablazikenpack', color: '#c08678' },
      { name: 'megagyaradospack', color: '#788ac0' },
      { name: 'everypack', color: '#c0c0c0' },
    ],
    missions: b1Missions,
    tradeable: true,
    openable: true,
    packStructure: {
      containsShinies: true,
      containsBabies: false,
      cardsPerPack: 5,
    },
  },
  {
    name: 'crimsonblaze',
    id: 'B1a',
    internalId: 13,
    packs: [{ name: 'crimsonblazepack', color: '#bf8f78' }],
    missions: b1aMissions,
    tradeable: true,
    openable: true,
    packStructure: {
      containsShinies: true,
      containsBabies: false,
      cardsPerPack: 5,
    },
  },
  // Pack colors should have saturation 37.5% (96) and value 75% (192). The distance in hue between any two packs should not be smaller than 3.33% (12)
  {
    name: 'promo-a',
    id: 'P-A',
    internalId: 192, // IMPORTANT note: these should NEVER EVER change. The internals of the DB depend on it.
    packs: [{ name: 'everypack', color: '#c0c0c0' }],
    tradeable: false,
    openable: false,
    promo: true,
  },
  {
    name: 'promo-b',
    id: 'P-B',
    internalId: 193,
    packs: [{ name: 'everypack', color: '#c0c0c0' }],
    tradeable: false,
    openable: false,
    promo: true,
  },
]

const expansionsDict: Map<string, Expansion> = new Map(expansions.map((expansion) => [expansion.id, expansion]))

export const getExpansionById = (id: ExpansionId): Expansion => {
  const expansion = expansionsDict.get(id)
  if (expansion === undefined) {
    throw new Error(`Unrecognized expansionId: ${id}`)
  }
  return expansion
}

export const tradeableExpansions = expansions.filter((e) => e.tradeable).map((e) => e.id)

export const basicRarities: Rarity[] = ['◊', '◊◊', '◊◊◊', '◊◊◊◊']

export const craftingCost: Partial<Record<Rarity, number>> = {
  '◊': 35,
  '◊◊': 70,
  '◊◊◊': 150,
  '◊◊◊◊': 500,
  '☆': 400,
  '☆☆': 1250,
  '☆☆☆': 1500,
  'Crown Rare': 2500,
}

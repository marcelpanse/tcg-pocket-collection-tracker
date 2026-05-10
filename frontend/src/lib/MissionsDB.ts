import type { ExpansionId, Mission } from '@/types'

const A1Missions = await import('../../assets/themed-collections/A1-missions.json')
const A1aMissions = await import('../../assets/themed-collections/A1a-missions.json')
const A2Missions = await import('../../assets/themed-collections/A2-missions.json')
const A2aMissions = await import('../../assets/themed-collections/A2a-missions.json')
const A2bMissions = await import('../../assets/themed-collections/A2b-missions.json')
const A3Missions = await import('../../assets/themed-collections/A3-missions.json')
const A3aMissions = await import('../../assets/themed-collections/A3a-missions.json')
const A3bMissions = await import('../../assets/themed-collections/A3b-missions.json')
const A4Missions = await import('../../assets/themed-collections/A4-missions.json')
const A4aMissions = await import('../../assets/themed-collections/A4a-missions.json')
const A4bMissions = await import('../../assets/themed-collections/A4b-missions.json')
const B1Missions = await import('../../assets/themed-collections/B1-missions.json')
const B1aMissions = await import('../../assets/themed-collections/B1a-missions.json')
const B2Missions = await import('../../assets/themed-collections/B2-missions.json')
const B2aMissions = await import('../../assets/themed-collections/B2a-missions.json')
const B2bMissions = await import('../../assets/themed-collections/B2b-missions.json')
const B3Missions = await import('../../assets/themed-collections/B3-missions.json')

export const missionsMap: Partial<Record<ExpansionId, Mission[]>> = {
  A1: A1Missions.default as Mission[],
  A1a: A1aMissions.default as Mission[],
  A2: A2Missions.default as Mission[],
  A2a: A2aMissions.default as Mission[],
  A2b: A2bMissions.default as Mission[],
  A3: A3Missions.default as Mission[],
  A3a: A3aMissions.default as Mission[],
  A3b: A3bMissions.default as Mission[],
  A4: A4Missions.default as Mission[],
  A4a: A4aMissions.default as Mission[],
  A4b: A4bMissions.default as Mission[],
  B1: B1Missions.default as Mission[],
  B1a: B1aMissions.default as Mission[],
  B2: B2Missions.default as Mission[],
  B2a: B2aMissions.default as Mission[],
  B2b: B2bMissions.default as Mission[],
  B3: B3Missions.default as Mission[],
}

export const expansionsWithMissions = (Object.keys(missionsMap) as ExpansionId[]).filter((id) => (missionsMap[id]?.length ?? 0) > 0)

export function getMissionsForExpansion(id: ExpansionId): Mission[] {
  return missionsMap[id] ?? []
}

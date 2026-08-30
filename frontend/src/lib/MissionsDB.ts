import { type ExpansionId, expansionIds, type Mission } from '@/types'

// Eagerly load every mission JSON in the themed-collections directory.
// New sets are picked up automatically as long as their file is named "{ExpansionId}-missions.json".
const missionModules = import.meta.glob<{ default: Mission[] }>('../../assets/themed-collections/*-missions.json', { eager: true })

const knownIds = new Set<string>(expansionIds)

export const missionsMap: Partial<Record<ExpansionId, Mission[]>> = Object.fromEntries(
  Object.entries(missionModules).flatMap(([path, mod]) => {
    const match = path.match(/([^/]+)-missions\.json$/)
    if (!match || !knownIds.has(match[1])) {
      return []
    }
    return [[match[1] as ExpansionId, mod.default]]
  }),
)

export const expansionsWithMissions = (Object.keys(missionsMap) as ExpansionId[]).filter((id) => (missionsMap[id]?.length ?? 0) > 0)

export function getMissionsForExpansion(id: ExpansionId): Mission[] {
  return missionsMap[id] ?? []
}

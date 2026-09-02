import { useEffect, useState } from 'react'
import changelogData from '../../public/changelog.json'

export interface ChangelogEntry {
  sha: string
  date: string
  type: 'feat' | 'fix'
  scope: string | null
  title: string
}

interface Changelog {
  generatedAt: string
  entries: ChangelogEntry[]
}

const LAST_SEEN_KEY = 'changelog.lastSeenSha'

// Bundled at build time by scripts/generate-changelog.ts. No runtime fetch.
export const changelog = changelogData as Changelog

function readLastSeen(): string | null {
  try {
    return localStorage.getItem(LAST_SEEN_KEY)
  } catch {
    return null
  }
}

function writeLastSeen(sha: string): void {
  try {
    localStorage.setItem(LAST_SEEN_KEY, sha)
  } catch {
    // Private mode / storage disabled — no persistence, but the UI still works for this session.
  }
}

// Number of entries newer than the last SHA the viewer opened the changelog on.
// If they've never opened it, every entry counts as unread.
export function useUnreadChangelogCount(): number {
  const [lastSeen, setLastSeen] = useState<string | null>(null)
  useEffect(() => {
    setLastSeen(readLastSeen())
    const onStorage = (e: StorageEvent) => {
      if (e.key === LAST_SEEN_KEY) {
        setLastSeen(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  if (lastSeen === null) {
    return changelog.entries.length
  }
  const idx = changelog.entries.findIndex((e) => e.sha === lastSeen)
  return idx === -1 ? changelog.entries.length : idx
}

// Called when the user actually opens the changelog page.
export function markChangelogAsSeen(): void {
  const latest = changelog.entries[0]?.sha
  if (latest) {
    writeLastSeen(latest)
    // Fire a storage event so other tabs / hook instances react immediately.
    window.dispatchEvent(new StorageEvent('storage', { key: LAST_SEEN_KEY, newValue: latest }))
  }
}

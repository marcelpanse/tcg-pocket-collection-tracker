import { useQuery } from '@tanstack/react-query'
import i18n from 'i18next'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Entry {
  sha: string
  date: string
  type: 'feat' | 'fix'
  scope: string | null
  title: string
}

interface Changelog {
  generatedAt: string
  entries: Entry[]
}

const LAST_SEEN_KEY = 'changelog.lastSeenSha'

function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function typeBadge(type: Entry['type']) {
  const base = 'inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide'
  if (type === 'feat') {
    return <span className={`${base} bg-emerald-900/60 text-emerald-300`}>New</span>
  }
  return <span className={`${base} bg-amber-900/60 text-amber-300`}>Fix</span>
}

export function ChangelogDialog() {
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(null)

  const { data } = useQuery<Changelog>({
    queryKey: ['changelog'],
    queryFn: async () => {
      const res = await fetch('/changelog.json')
      if (!res.ok) {
        throw new Error(`changelog.json → ${res.status}`)
      }
      return res.json()
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })

  useEffect(() => {
    try {
      setLastSeen(localStorage.getItem(LAST_SEEN_KEY))
    } catch {
      // Ignore private-mode / disabled storage.
    }
  }, [])

  const latestSha = data?.entries[0]?.sha
  const hasNew = latestSha !== undefined && latestSha !== lastSeen

  const handleOpen = (next: boolean) => {
    setOpen(next)
    if (next && latestSha) {
      try {
        localStorage.setItem(LAST_SEEN_KEY, latestSha)
        setLastSeen(latestSha)
      } catch {
        // Ignore.
      }
    }
  }

  // Group entries by date for a lightweight visual rhythm.
  const grouped = new Map<string, Entry[]>()
  for (const entry of data?.entries ?? []) {
    const arr = grouped.get(entry.date) ?? []
    arr.push(entry)
    grouped.set(entry.date, arr)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <Button className="px-2 sm:px-4 relative" variant="ghost" size="icon" aria-label="What's new" title="What's new" onClick={() => handleOpen(true)}>
        <Bell />
        {hasNew && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-neutral-900" />}
      </Button>
      <DialogContent className="border-1 border-neutral-700 shadow-none max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>What's new</DialogTitle>
        </DialogHeader>
        {!data && <p className="p-4 text-sm text-neutral-400">Loading…</p>}
        {data && data.entries.length === 0 && <p className="p-4 text-sm text-neutral-400">No recent updates.</p>}
        {data && data.entries.length > 0 && (
          <div className="flex flex-col gap-4 pb-2">
            {[...grouped.entries()].map(([date, entries]) => (
              <section key={date} className="flex flex-col gap-1.5">
                <h3 className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 px-0.5">{formatDate(date, i18n.language)}</h3>
                <ul className="flex flex-col gap-1.5">
                  {entries.map((e) => (
                    <li key={e.sha} className="flex items-start gap-2 rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2">
                      <span className="pt-0.5">{typeBadge(e.type)}</span>
                      <div className="min-w-0 flex-1">
                        {e.scope && <span className="mr-1.5 text-xs text-neutral-500">{e.scope}</span>}
                        <span className="text-sm text-neutral-200">{e.title}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

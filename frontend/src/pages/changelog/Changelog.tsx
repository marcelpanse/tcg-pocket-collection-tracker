import i18n from 'i18next'
import { useEffect } from 'react'
import { type ChangelogEntry, changelog, markChangelogAsSeen } from '@/lib/useChangelog'

function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function typeBadge(type: ChangelogEntry['type']) {
  const base = 'inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide'
  if (type === 'feat') {
    return <span className={`${base} bg-emerald-900/60 text-emerald-300`}>New</span>
  }
  return <span className={`${base} bg-amber-900/60 text-amber-300`}>Fix</span>
}

export default function Changelog() {
  useEffect(() => {
    markChangelogAsSeen()
  }, [])

  // Group entries by date for a lightweight visual rhythm.
  const grouped = new Map<string, ChangelogEntry[]>()
  for (const entry of changelog.entries) {
    const arr = grouped.get(entry.date) ?? []
    arr.push(entry)
    grouped.set(entry.date, arr)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-100">What's new</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Recent changes to the tracker. Want to discuss?{' '}
          <a href="https://community.tcgpocketcollectiontracker.com" target="_blank" rel="noreferrer" className="text-neutral-200 underline">
            Join the community forum →
          </a>
        </p>
      </header>
      {changelog.entries.length === 0 ? (
        <p className="text-sm text-neutral-400">No recent updates.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {[...grouped.entries()].map(([date, entries]) => (
            <section key={date} className="flex flex-col gap-1.5">
              <h2 className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 px-0.5">{formatDate(date, i18n.language)}</h2>
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
    </main>
  )
}

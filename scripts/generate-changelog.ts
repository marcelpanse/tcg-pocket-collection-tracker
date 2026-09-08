// Reads recent git log from main and writes a curated changelog to frontend/public/changelog.json.
// Meant to run at build time — output is fetched at runtime by the ChangelogDialog.
// Run: tsx scripts/generate-changelog.ts
import { execSync } from 'node:child_process'
import fs from 'node:fs'

const OUT_PATH = 'frontend/public/changelog.json'
const MAX_ENTRIES = 60 // Cap so old churn doesn't accumulate forever.

// Conventional-commit prefixes we care to show. Anything else (chore/build/style) is skipped.
const SHOWN_TYPES = new Set(['feat', 'fix'])

// Titles that add no user-visible value; hide from the changelog even when they carry a shown prefix.
const NOISE = [/^rerun scraper/i, /^chore\(hashes\)/i, /^merge (branch|pull)/i]

interface Entry {
  sha: string
  date: string
  type: string
  scope: string | null
  title: string
}

function main() {
  // Format: SHA<TAB>ISO_DATE<TAB>SUBJECT — TAB is unlikely to appear inside a subject.
  const raw = execSync(`git log -n 500 --pretty=format:"%h%x09%cI%x09%s" main`, { encoding: 'utf8' })

  const entries: Entry[] = []
  for (const line of raw.split('\n')) {
    if (!line.trim()) {
      continue
    }
    const [sha, iso, subject] = line.split('\t')
    if (!sha || !iso || !subject) {
      continue
    }
    if (NOISE.some((rx) => rx.test(subject))) {
      continue
    }

    // Match conventional commit: type(scope)?: title
    const m = subject.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/)
    if (!m) {
      continue
    }
    const [, type, scope, title] = m
    if (!SHOWN_TYPES.has(type)) {
      continue
    }

    entries.push({
      sha,
      date: iso.slice(0, 10),
      type,
      scope: scope ?? null,
      title: title.replace(/\s*\(#\d+\)\s*$/, '').trim(), // Strip the "(#123)" PR suffix squash-merges leave.
    })

    if (entries.length >= MAX_ENTRIES) {
      break
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    entries,
  }
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(`Wrote ${entries.length} entries to ${OUT_PATH}`)
}

main()

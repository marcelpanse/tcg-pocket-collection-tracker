// Writes the browser export function (scripts/pokemon-zone-export.js) with the expansion list filled in,
// for the /scrape-missions skill to run in the browser via `orca eval`.
// Usage: tsx scripts/pokemon-zone-snippet.ts [SET ...]   → prints the path of the generated file
import fs from 'node:fs'
import path from 'node:path'
import { expansions } from '../frontend/src/lib/CardsDB'

const OUT_FILE = path.resolve('./scripts/.cache/pokemon-zone-export.run.js')

const allIds = expansions.map((e) => e.id)
const onlyIds = process.argv.slice(2)
const unknown = onlyIds.filter((id) => !allIds.includes(id))
if (unknown.length > 0) {
  console.error(`Unknown expansion id(s): ${unknown.join(', ')}. Known: ${allIds.join(', ')}`)
  process.exit(1)
}
const ids = onlyIds.length > 0 ? onlyIds : allIds

const template = fs.readFileSync('./scripts/pokemon-zone-export.js', 'utf8')
const placeholder = '[] /* __EXPANSIONS__ */'
if (!template.includes(placeholder)) {
  console.error('Placeholder not found in scripts/pokemon-zone-export.js')
  process.exit(1)
}
// The skill wraps the file as `(<fn>)()`, so keep only the bare function: drop the header comments and the `;` biome puts before the arrow.
const fnStart = template.indexOf('() => {')
if (fnStart === -1) {
  console.error('Function start not found in scripts/pokemon-zone-export.js')
  process.exit(1)
}
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
fs.writeFileSync(OUT_FILE, template.slice(fnStart).replace(placeholder, JSON.stringify(ids)))
console.log(OUT_FILE)

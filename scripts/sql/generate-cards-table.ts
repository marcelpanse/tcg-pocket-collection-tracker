/**
 * This script extracts cards from the CardsDB and generates SQL statements to insert them into Postgres.
 * This is just a helper function to get the cards into the postgres db cards table. This table is currently
 * only used for the trading matching algorithm.
 *
 * Because this is a TS file you need to run this with `bun run scripts/sql/generate-cards-table.ts`
 * Install bun with `npm install -g bun` if you don't have it already.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { allCards as cardsToInsert, tradeableExpansions } from '../../frontend/src/lib/CardsDB'
import { type Card, type Rarity, tradableRarities } from '../../frontend/src/types'

// Get the directory name using ESM compatible approach
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Generate a single bulk INSERT statement for better performance
function generateBulkInsertSQL(cards: Card[]): string {
  let sql = `
TRUNCATE TABLE cards;
INSERT INTO cards (card_id, rarity) VALUES
`

  // Generate values for bulk insert
  const values = cards
    .filter((card) => !card.linkedCardID && (tradableRarities as readonly Rarity[]).includes(card.rarity) && tradeableExpansions.includes(card.expansion))
    .map((card) => {
      // Escape single quotes in strings
      const cardId = card.card_id.replace(/'/g, "''")
      const rarity = card.rarity.replace(/'/g, "''")

      return `('${cardId}', '${rarity}')`
    })
    .join(',\n  ')

  sql += `  ${values};`

  return sql
}

try {
  // Generate the SQL
  const bulkInsertSQL = generateBulkInsertSQL(cardsToInsert)

  // Write the SQL to file
  fs.writeFileSync(path.join(outputDir, 'bulk-insert.sql'), bulkInsertSQL)

  // Output to console
  console.log('Generated SQL statements for inserting cards into Postgres database')
  console.log(`Total cards to insert: ${cardsToInsert.length}`)
  console.log('SQL file created: output/bulk-insert.sql')
} catch (error: unknown) {
  console.error('Error:', error)
}

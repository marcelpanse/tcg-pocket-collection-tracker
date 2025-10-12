/**
 * This script extracts cards from the CardsDB and generates SQL statements to insert them into Postgres.
 * This is just a helper function to get the cards into the postgres db cards table. This table is currently
 * only used for the trading matching algorithm.
 *
 * Because this is a TS file you need to run this with `tsx scripts/sql/generate-cards-table.ts`
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
TRUNCATE TABLE cards_list;
INSERT INTO cards_list (internal_id, card_id, rarity, tradable) VALUES
`

  // after we ran this and migrated everyone, we can add this deduplication code back in and recreate the table contents.
  // this is because we don't need the duplicate internal_ids. To do this:
  // 1. delete the cards_list table
  // 2. create the table again but with the primary key being internal_id: int4
  // 3. adjust this script to enable the deduplication code
  // 4. run this script on the db
  // 5. after deployment, delete the cards table (the cards_list table is now used instead).
  // 6. after migration remove the amount_owned column from the collections table.
  // 7. deploy get-trading-partners deno function and test
  // 8. drop the public_cards view

  //deduplicate cards on card.internal_id
  // const seenIds = new Set<number>()
  // const dedupedCards = cards.filter((card) => {
  //   if (seenIds.has(card.internal_id)) {
  //     return false
  //   }
  //   seenIds.add(card.internal_id)
  //   return true
  // })

  // Generate values for bulk insert
  const values = cards
    .map((card) => {
      const rarity = card.rarity
      const tradable = (tradableRarities as readonly Rarity[]).includes(card.rarity) && tradeableExpansions.includes(card.expansion)

      return `(${card.internal_id}, '${card.card_id}', '${rarity}', ${tradable})`
    })
    .join(',\n  ')

  sql += ` ${values};`

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

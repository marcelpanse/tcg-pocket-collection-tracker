import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

// Get the connection string from the environment variable "SUPABASE_DB_URL"
const databaseUrl = Deno.env.get('SUPABASE_DB_URL') || ''
// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(databaseUrl, 3, true)

Deno.serve(async (_req) => {
  try {
    const connection = await pool.connect()

    // const { name } = await req.json()

    const tradingPartners = await connection.queryObject<{ count: number }>(`
SELECT
  a.friend_id, count(c.card_id) matched_cards_amount
FROM
  accounts a,
  collection c
WHERE
  a.email IN (SELECT a.email FROM accounts a ORDER BY a.collection_last_updated LIMIT 100)
  AND a.email = c.email
  AND a.is_active_trading = TRUE
  AND c.amount_owned > a.min_number_of_cards_to_keep
  AND c.card_id IN (
    SELECT
      c.card_id
    FROM
      collection c
    WHERE
      c.email = 'marcel.panse@gmail.com'
      AND c.amount_owned < 10
  )
GROUP BY
  a.friend_id
ORDER BY
  matched_cards_amount DESC;
`)

    return new Response(JSON.stringify(tradingPartners), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('An error occurred:', err)
    return new Response('An internal server error occurred', { status: 500 })
  } finally {
    // Release the connection back into the pool
    connection.release()
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-trading-partners' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

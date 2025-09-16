import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

const databaseUrl = Deno.env.get('SUPABASE_DB_URL') || ''
const pool = new postgres.Pool(databaseUrl, 10, true)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
  'Access-Control-Allow-Headers': 'apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  const connection = await pool.connect()
  try {
    const { email, maxNumberOfCardsWanted } = await req.json()

    if (!email || !maxNumberOfCardsWanted) {
      return new Response('Missing email or maxNumberOfCardsWanted', { status: 400 })
    }

    console.log('fetching trading partners')

    const tradingPartners = await connection.queryObject(
      `
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
      c.email = $1
      AND c.amount_owned < $2
  )
GROUP BY
  a.friend_id
ORDER BY
  matched_cards_amount DESC;
`,
      [email, maxNumberOfCardsWanted],
    )

    const serializedRows = tradingPartners.rows.map((row) => ({
      ...row,
      matched_cards_amount: Number(row.matched_cards_amount),
    }))

    console.log('returning', serializedRows)

    return new Response(JSON.stringify(serializedRows), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (err) {
    console.error('An error occurred:', err)
    return new Response('An internal server error occurred', { status: 500 })
  } finally {
    // Release the connection back into the pool
    connection.release()
  }
})

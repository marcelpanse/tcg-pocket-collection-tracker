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
WITH recent_accounts AS (
    SELECT email
    FROM accounts
    WHERE is_active_trading = TRUE AND is_public = TRUE
    ORDER BY collection_last_updated
    LIMIT 100
),
   wanted_cards AS (
       -- Cards YOU are missing
       SELECT c.card_id
       FROM cards c
       WHERE NOT EXISTS (
           SELECT 1
           FROM collection c2
           WHERE c2.card_id = c.card_id
             AND c2.email = $1            -- your email
             AND c2.amount_owned >= $2    -- your threshold
       )
   ),
   partner_wanted_cards AS (
       -- Cards THEY are missing
       SELECT c.card_id, a.email
       FROM accounts a
                JOIN cards c ON TRUE
       WHERE NOT EXISTS (
           SELECT 1
           FROM collection c2
           WHERE c2.card_id = c.card_id
             AND c2.email = a.email
             AND c2.amount_owned >= a.min_number_of_cards_to_keep
       )
   )
SELECT
    a.friend_id,
    a.username,
    COUNT(DISTINCT CASE WHEN wc.card_id IS NOT NULL THEN c.card_id END) AS matched_cards_amount
FROM accounts a
         JOIN recent_accounts ra
              ON a.email = ra.email
         JOIN collection c
              ON a.email = c.email
         LEFT JOIN wanted_cards wc
                   ON c.card_id = wc.card_id
                       AND c.amount_owned > a.min_number_of_cards_to_keep
         LEFT JOIN partner_wanted_cards pwc
                   ON pwc.card_id = c.card_id
                       AND pwc.email = $1   -- your account, to see if they want what you own
WHERE a.email != $1
GROUP BY a.friend_id, a.username
HAVING COUNT(DISTINCT CASE WHEN wc.card_id IS NOT NULL THEN c.card_id END) > 0
   AND COUNT(DISTINCT CASE WHEN pwc.card_id IS NOT NULL THEN c.card_id END) > 0
ORDER BY matched_cards_amount DESC;
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

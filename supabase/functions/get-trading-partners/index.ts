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
    const { email, maxNumberOfCardsWanted, minNumberOfCardsToKeep } = await req.json()

    if (!email || !maxNumberOfCardsWanted || !minNumberOfCardsToKeep) {
      return new Response('Missing email or maxNumberOfCardsWanted', { status: 400 })
    }

    console.log('fetching trading partners')

    const tradingPartners = await connection.queryObject(
      `
          WITH recent_accounts AS (
              SELECT email, min_number_of_cards_to_keep, max_number_of_cards_wanted
              FROM accounts
              WHERE is_active_trading = TRUE
                AND is_public = TRUE
              ORDER BY collection_last_updated DESC, email
              LIMIT 50
          ),
               your_wanted AS (
                   SELECT c.internal_id
                   FROM cards_list c
                            LEFT JOIN card_amounts c2
                                      ON c.internal_id = c2.internal_id AND c2.email = $1
                   WHERE c.tradable = TRUE 
                     AND c2.amount_owned < $2
               ),
               you_have AS (
                   SELECT c.internal_id
                   FROM card_amounts c
                   WHERE c.email = $1
                     AND c.amount_owned > $3
               ),
               partner_wanted AS (
                   SELECT a.email, c.internal_id
                   FROM recent_accounts a
                            CROSS JOIN cards_list c
                            LEFT JOIN card_amounts c2
                                      ON c.internal_id = c2.internal_id AND c2.email = a.email
                   WHERE c.tradable = TRUE 
                       AND c2.amount_owned < a.max_number_of_cards_wanted
               ),
               partner_has AS (
                   SELECT c.email, c.internal_id
                   FROM card_amounts c
                            JOIN recent_accounts ra ON ra.email = c.email
                            JOIN accounts a ON a.email = c.email
                   WHERE c.tradable = TRUE 
                       AND c.amount_owned > a.min_number_of_cards_to_keep
               ),
               matches AS (
                   -- What you can get from them
                   SELECT ph.email AS partner_email, COUNT(ph.internal_id) AS they_can_give
                   FROM partner_has ph
                            JOIN your_wanted yw ON ph.internal_id = yw.internal_id
                   GROUP BY ph.email
               ),
               reverse_matches AS (
                   -- What they can get from you
                   SELECT pw.email AS partner_email, COUNT(pw.internal_id) AS you_can_give
                   FROM partner_wanted pw
                            JOIN you_have yh ON pw.internal_id = yh.internal_id
                   GROUP BY pw.email
               )
          SELECT
              a.friend_id,
              a.username,
              LEAST(COALESCE(m.they_can_give,0), COALESCE(rm.you_can_give,0)) AS matched_cards_amount
          FROM accounts a
                   JOIN recent_accounts ra ON ra.email = a.email
                   LEFT JOIN matches m ON m.partner_email = a.email
                   LEFT JOIN reverse_matches rm ON rm.partner_email = a.email
          WHERE a.email != $1
            AND COALESCE(m.they_can_give,0) > 0
            AND COALESCE(rm.you_can_give,0) > 0
          ORDER BY matched_cards_amount DESC;
`,
      [email, maxNumberOfCardsWanted, minNumberOfCardsToKeep],
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

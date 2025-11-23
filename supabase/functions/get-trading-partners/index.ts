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

    interface RowType {
      friend_id: string
      username: string
      matched_cards_amount: number
    }
    const tradingPartners = await connection.queryObject<RowType>(
      `
          WITH recent_accounts AS (
              SELECT email, friend_id, username
              FROM accounts
              WHERE
                  is_active_trading = TRUE
                AND is_public = TRUE
                AND collection_last_updated IS NOT NULL
              ORDER BY collection_last_updated DESC
              LIMIT 50
          )
          SELECT
              friend_id,
              username,
              SUM(LEAST(num_to_give, num_to_get)) as trade_matches
          FROM
              (
                  SELECT
                      a.friend_id,
                      a.username,
                      t.rarity_id as rarity,
                      COUNT(*) as num_to_give
                  FROM
                      (
                          SELECT
                              ca.internal_id
                          FROM
                              card_amounts ca
                                  INNER JOIN trade_rarity_settings t ON t.email = $1 AND (ca.internal_id & 63) = t.rarity_id
                          WHERE
                              ca.email = $1
                            AND ca.amount_owned > t.to_keep
                      ) as to_give
                          CROSS JOIN recent_accounts a
                          LEFT JOIN card_amounts ca ON ca.email = a.email AND ca.internal_id = to_give.internal_id
                          INNER JOIN trade_rarity_settings t ON t.email = a.email AND (to_give.internal_id & 63) = t.rarity_id
                  WHERE
                      COALESCE(ca.amount_owned, 0) < t.to_collect
                  GROUP BY a.friend_id, username, t.rarity_id
              )
                  NATURAL JOIN
              (
                  SELECT
                      a.friend_id,
                      a.username,
                      t.rarity_id as rarity,
                      COUNT(*) as num_to_get
                  FROM
                      (
                          SELECT
                              cl.internal_id
                          FROM
                              cards_list cl
                                  LEFT JOIN card_amounts ca ON ca.email = $1 AND cl.internal_id = ca.internal_id
                                  INNER JOIN trade_rarity_settings t ON t.email = $1 AND (cl.internal_id & 63) = t.rarity_id
                          WHERE
                              t.to_collect > 0 AND (ca.amount_owned IS NULL OR ca.amount_owned < t.to_collect)
                      ) as to_get
                          CROSS JOIN recent_accounts a
                          INNER JOIN card_amounts ca ON ca.email = a.email AND ca.internal_id = to_get.internal_id
                          INNER JOIN trade_rarity_settings t ON t.email = a.email AND (ca.internal_id & 63) = t.rarity_id
                  WHERE
                      ca.amount_owned > t.to_keep
                  GROUP BY a.friend_id, username, t.rarity_id
              )
          GROUP BY friend_id, username
          ORDER BY trade_matches DESC;
`,
      [email],
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

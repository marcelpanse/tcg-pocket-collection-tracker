import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const databaseUrl = Deno.env.get('SUPABASE_DB_URL') || ''
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const pool = new postgres.Pool(databaseUrl, 10, true)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
  'Access-Control-Allow-Headers': 'apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Extract caller email from JWT using admin client
  const adminClient = createClient(supabaseUrl, supabaseServiceKey)
  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(authHeader.replace('Bearer ', ''))

  if (authError || !user?.email) {
    return new Response('Unauthorized', { status: 401 })
  }

  const callerEmail = user.email

  const connection = await pool.connect()
  try {
    const { action, friend_id } = await req.json()

    if (!action || !friend_id) {
      return new Response('Missing action or friend_id', { status: 400 })
    }

    // Resolve friend_id → email + username, and look up caller's username
    const { rows: friendRows } = await connection.queryObject<{ email: string; username: string }>(
      'SELECT email, username FROM accounts WHERE friend_id = $1',
      [friend_id],
    )

    if (friendRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Friend not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const friendEmail = friendRows[0].email
    const friendUsername = friendRows[0].username

    if (callerEmail === friendEmail) {
      return new Response(JSON.stringify({ error: 'Cannot add yourself as a friend' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const { rows: callerRows } = await connection.queryObject<{ username: string }>('SELECT username FROM accounts WHERE email = $1', [callerEmail])
    const callerUsername = callerRows[0]?.username ?? ''

    if (action === 'send_request') {
      // Check for existing row between the pair (either direction)
      const { rows: existing } = await connection.queryObject<{ id: number; state: string }>(
        `SELECT id, state FROM friends
         WHERE (email_requester = $1 AND email_accepter = $2)
            OR (email_requester = $2 AND email_accepter = $1)`,
        [callerEmail, friendEmail],
      )

      if (existing.length > 0) {
        const row = existing[0]
        if (row.state === 'pending' || row.state === 'accepted') {
          return new Response(JSON.stringify({ message: 'Request already exists' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }
        // Update if revoked/declined — reset to pending with caller as requester
        await connection.queryObject(
          `UPDATE friends
           SET state = 'pending', email_requester = $1, email_accepter = $2,
               username_requester = $3, username_accepter = $4
           WHERE id = $5`,
          [callerEmail, friendEmail, callerUsername, friendUsername, row.id],
        )
      } else {
        await connection.queryObject(
          `INSERT INTO friends (email_requester, email_accepter, state, username_requester, username_accepter)
           VALUES ($1, $2, 'pending', $3, $4)`,
          [callerEmail, friendEmail, callerUsername, friendUsername],
        )
      }
    } else if (action === 'accept') {
      await connection.queryObject(
        `UPDATE friends SET state = 'accepted'
         WHERE email_accepter = $1 AND email_requester = $2 AND state = 'pending'`,
        [callerEmail, friendEmail],
      )
    } else if (action === 'decline') {
      await connection.queryObject(
        `UPDATE friends SET state = 'declined'
         WHERE email_accepter = $1 AND email_requester = $2 AND state = 'pending'`,
        [callerEmail, friendEmail],
      )
    } else if (action === 'revoke') {
      await connection.queryObject(
        `UPDATE friends SET state = 'revoked'
         WHERE ((email_requester = $1 AND email_accepter = $2 AND state IN ('accepted', 'pending'))
             OR (email_requester = $2 AND email_accepter = $1 AND state = 'accepted'))`,
        [callerEmail, friendEmail],
      )
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err) {
    console.error('An error occurred:', err)
    return new Response('An internal server error occurred', { status: 500 })
  } finally {
    connection.release()
  }
})

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
  console.log('Caller authenticated:', callerEmail)

  console.log('Acquiring database connection from pool')
  const connection = await pool.connect()
  console.log('Database connection acquired')
  try {
    const { action, friend_id } = await req.json()
    console.log('Action:', action, '| friend_id:', friend_id)

    if (!action || !friend_id) {
      return new Response('Missing action or friend_id', { status: 400 })
    }

    // Resolve friend_id → email + username, and look up caller's username
    const friendLookupSql = 'SELECT email, username FROM accounts WHERE friend_id = $1'
    console.log('Executing SQL:', friendLookupSql, '| params:', [friend_id])
    const { rows: friendRows } = await connection.queryObject<{ email: string; username: string }>(friendLookupSql, [friend_id])
    console.log('Friend lookup result:', friendRows)

    if (friendRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Friend not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const friendEmail = friendRows[0].email
    const friendUsername = friendRows[0].username
    console.log('Resolved friend:', { friendEmail, friendUsername })

    if (callerEmail === friendEmail) {
      return new Response(JSON.stringify({ error: 'Cannot add yourself as a friend' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const callerLookupSql = 'SELECT username, friend_id FROM accounts WHERE email = $1'
    console.log('Executing SQL:', callerLookupSql, '| params:', [callerEmail])
    const { rows: callerRows } = await connection.queryObject<{ username: string; friend_id: string }>(callerLookupSql, [callerEmail])
    const callerUsername = callerRows[0]?.username ?? ''
    const callerFriendId = callerRows[0]?.friend_id ?? ''
    console.log('Caller username:', callerUsername, '| caller friend_id:', callerFriendId)

    if (action === 'send_request') {
      // Check for existing row between the pair (either direction)
      const existingCheckSql = `SELECT id, state FROM friends
         WHERE (email_requester = $1 AND email_accepter = $2)
            OR (email_requester = $2 AND email_accepter = $1)`
      console.log('Executing SQL:', existingCheckSql, '| params:', [callerEmail, friendEmail])
      const { rows: existing } = await connection.queryObject<{ id: number; state: string }>(existingCheckSql, [callerEmail, friendEmail])
      console.log('Existing friendship rows:', existing)

      if (existing.length > 0) {
        const row = existing[0]
        if (row.state === 'pending' || row.state === 'accepted') {
          console.log('Request already exists with state:', row.state)
          return new Response(JSON.stringify({ message: 'Request already exists' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }
        // Update if revoked/declined — reset to pending with caller as requester
        const updateSql = `UPDATE friends
           SET state = 'pending', email_requester = $1, email_accepter = $2,
               username_requester = $3, username_accepter = $4,
               friend_id_requester = $5, friend_id_accepter = $6
           WHERE id = $7`
        console.log('Executing SQL:', updateSql, '| params:', [callerEmail, friendEmail, callerUsername, friendUsername, callerFriendId, friend_id, row.id])
        await connection.queryObject(updateSql, [callerEmail, friendEmail, callerUsername, friendUsername, callerFriendId, friend_id, row.id])
        console.log('Updated existing friendship row to pending')
      } else {
        const insertSql = `INSERT INTO friends (email_requester, email_accepter, state, username_requester, username_accepter, friend_id_requester, friend_id_accepter)
           VALUES ($1, $2, 'pending', $3, $4, $5, $6)`
        console.log('Executing SQL:', insertSql, '| params:', [callerEmail, friendEmail, callerUsername, friendUsername, callerFriendId, friend_id])
        await connection.queryObject(insertSql, [callerEmail, friendEmail, callerUsername, friendUsername, callerFriendId, friend_id])
        console.log('Inserted new friendship request')
      }
    } else if (action === 'accept') {
      const acceptSql = `UPDATE friends SET state = 'accepted'
         WHERE email_accepter = $1 AND email_requester = $2 AND state = 'pending'`
      console.log('Executing SQL:', acceptSql, '| params:', [callerEmail, friendEmail])
      await connection.queryObject(acceptSql, [callerEmail, friendEmail])
      console.log('Friendship accepted')
    } else if (action === 'decline') {
      const declineSql = `UPDATE friends SET state = 'declined'
         WHERE email_accepter = $1 AND email_requester = $2 AND state = 'pending'`
      console.log('Executing SQL:', declineSql, '| params:', [callerEmail, friendEmail])
      await connection.queryObject(declineSql, [callerEmail, friendEmail])
      console.log('Friendship declined')
    } else if (action === 'revoke') {
      const revokeSql = `UPDATE friends SET state = 'revoked'
         WHERE ((email_requester = $1 AND email_accepter = $2 AND state IN ('accepted', 'pending'))
             OR (email_requester = $2 AND email_accepter = $1 AND state = 'accepted'))`
      console.log('Executing SQL:', revokeSql, '| params:', [callerEmail, friendEmail])
      await connection.queryObject(revokeSql, [callerEmail, friendEmail])
      console.log('Friendship revoked')
    } else {
      console.log('Invalid action:', action)
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
    console.log('Releasing database connection back to pool')
    connection.release()
  }
})

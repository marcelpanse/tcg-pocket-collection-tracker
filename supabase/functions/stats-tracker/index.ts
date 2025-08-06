import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Get the connection string from the environment variable "SUPABASE_DB_URL"
const databaseUrl = Deno.env.get('SUPABASE_DB_URL') || ''
// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(databaseUrl, 3, true)

Deno.serve(async (_req) => {
  try {
    // Grab a connection from the pool
    const connection = await pool.connect()

    try {
      // Run a query
      const collectionCountResult = await connection.queryObject<{ count: number }>('SELECT SUM(amount_owned) as count FROM collection;')
      const usersCountResult = await connection.queryObject<{ count: number }>('SELECT count(*) as count FROM auth.users')

      const collectionCount = collectionCountResult.rows[0]?.count.toLocaleString()
      console.log('result', collectionCount)

      const usersCount = usersCountResult.rows[0]?.count.toLocaleString()
      console.log('result', usersCount)

      const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
        global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } },
      })

      // Encode the result as pretty printed JSON
      const body = JSON.stringify({ collectionCount, usersCount })

      const { error } = await supabase.storage.from('stats').update('stats.json', body, {
        cacheControl: '60',
        upsert: true,
        contentType: 'application/json',
      })

      if (error) {
        console.error('Error uploading stats', error)
        throw new Error('Error uploading stats')
      }

      // Return the response with the correct content type header
      return new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      })
    } finally {
      // Release the connection back into the pool
      connection.release()
    }
  } catch (err) {
    console.error('An error occurred:', err)
    return new Response('An internal server error occurred', { status: 500 })
  }
})

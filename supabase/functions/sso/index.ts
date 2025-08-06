import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Buffer } from 'node:buffer'
import { createHmac } from 'node:crypto'

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') || ''
  const allowedOrigins = ['https://localhost:5173', 'https://tcgpocketcollectiontracker.com']

  if (req.method === 'OPTIONS') {
    // Handle CORS preflight requests
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    })
  }

  const { sso, sig } = await req.json()

  console.log('Current time', new Date(), Date.now())
  console.log('Starting SSO', sso, sig)

  const discourseConnectSecret = Deno.env.get('DISCOURSE_CONNECT') || ''

  // Validate the signature: ensure that HMAC-SHA256 of sso (using discourse_connect_secret, as the key) is equal to the sig (sig will be hex encoded).
  const hmac = createHmac('sha256', discourseConnectSecret)
  hmac.update(sso)
  const calculatedSig = hmac.digest('hex')
  console.log('calculatedSig', calculatedSig)
  if (calculatedSig !== sig) {
    throw new Error('Invalid signature')
  }

  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '')

  // Get the session or user object
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')

  const { data, error } = await supabaseClient.auth.getUser(token)
  const loggedInUser = data.user
  if (error || !loggedInUser) {
    console.log('User not logged in', error, loggedInUser)
    throw new Error('User not found')
  }
  console.log('user', loggedInUser)

  let account: { username: string } | null = null
  const { data: accountData } = await supabaseClient.from('accounts').select().single()
  if (accountData) {
    account = accountData as unknown as { username: string } | null
    console.log('account', account)
  }

  const ssoDecoded = Buffer.from(sso, 'base64').toString('utf-8')
  console.log('ssoDecoded', ssoDecoded)

  const params = new URLSearchParams(ssoDecoded)
  const returnUrl = params.get('return_sso_url')
  const nonce = params.get('nonce') || ''
  console.log('returnUrl', returnUrl)
  console.log('nonce', nonce)

  const payload = {
    nonce,
    email: loggedInUser.email,
    external_id: loggedInUser.email,
    username: account?.username || '',
    suppress_welcome_message: 'true',
  }
  //url-encoded version of the payload
  const urlEncodedPayload = new URLSearchParams(payload).toString()
  console.log('urlEncodedPayload', urlEncodedPayload)

  //base64 encoded version of the url-encoded payload
  const payloadBase64 = Buffer.from(urlEncodedPayload).toString('base64')

  //Calculate a HMAC-SHA256 hash of the payload using discourse_connect_secret as the key and Base64 encoded payload as text
  const signature = createHmac('sha256', discourseConnectSecret).update(payloadBase64).digest('hex')
  console.log('signature', signature)

  return new Response(
    JSON.stringify({
      redirectUrl: `${returnUrl}?sso=${payloadBase64}&sig=${signature}`,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    },
  )
})

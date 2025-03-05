import { createHmac } from 'node:crypto'
import { Client, Databases, Query, Users } from 'node-appwrite'

export const DATABASE_ID = '679f7ce60013c742add3'
export const ACCOUNTS_ID = '67b1e20b0032c6efb057'

// biome-ignore lint/suspicious/noExplicitAny: untyped in the example
export default async ({ req, res, log }: any) => {
  log('Current time', new Date(), new Date().valueOf())

  const { sso, sig } = JSON.parse(req.body)
  log('Starting SSO', sso, sig)

  const discourseConnectSecret = process.env.DISCOURSE_CONNECT || ''

  // Validate the signature: ensure that HMAC-SHA256 of sso (using discourse_connect_secret, as the key) is equal to the sig (sig will be hex encoded).
  const hmac = createHmac('sha256', discourseConnectSecret)
  hmac.update(sso)
  const calculatedSig = hmac.digest('hex')
  log('calculatedSig', calculatedSig)
  if (calculatedSig !== sig) {
    throw new Error('Invalid signature')
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT || '')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || '')
    .setKey(req.headers['x-appwrite-key'] ?? '')

  const headers = req.headers
  const userId = headers['x-appwrite-user-id']
  log('userId', userId)

  const users = new Users(client)
  const loggedInUser = await users.get(userId)
  log('loggedInUser', loggedInUser.email)

  if (!loggedInUser) {
    throw new Error('User not found')
  }

  let account: { username: string } | null = null
  try {
    const databases = new Databases(client)
    const result = await databases.listDocuments(DATABASE_ID, ACCOUNTS_ID, [Query.equal('email', loggedInUser.email), Query.limit(1)])
    account = result.documents[0] as unknown as { username: string } | null
    log('account', account)
  } catch (e) {
    // ignore, account not created yet
    log('account not found', e)
  }

  const ssoDecoded = Buffer.from(sso, 'base64').toString('utf-8')
  log('ssoDecoded', ssoDecoded)

  const params = new URLSearchParams(ssoDecoded)
  const returnUrl = params.get('return_sso_url')
  const nonce = params.get('nonce') || ''
  log('returnUrl', returnUrl)
  log('nonce', nonce)

  const payload = {
    nonce,
    email: loggedInUser.email,
    external_id: userId,
    username: account?.username || '',
    suppress_welcome_message: 'true',
  }
  //url-encoded version of the payload
  const urlEncodedPayload = new URLSearchParams(payload).toString()
  log('urlEncodedPayload', urlEncodedPayload)

  //base64 encoded version of the url-encoded payload
  const payloadBase64 = Buffer.from(urlEncodedPayload).toString('base64')

  //Calculate a HMAC-SHA256 hash of the payload using discourse_connect_secret as the key and Base64 encoded payload as text
  const signature = createHmac('sha256', discourseConnectSecret).update(payloadBase64).digest('hex')
  log('signature', signature)

  return res.json({
    redirectUrl: `${returnUrl}?sso=${payloadBase64}&sig=${signature}`,
  })
}

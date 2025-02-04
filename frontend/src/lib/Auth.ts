import { Account, Client, Databases, ID } from 'appwrite'
const client = new Client().setProject('679d358b0013b9a1797f').setEndpoint('https://api.tcgpocketcollectiontracker.com/v1')
const databases = new Databases(client)

export const DATABASE_ID = '679f7ce60013c742add3'
export const COLLECTION_ID = '679f7cf50003d1a172c5'

export const login = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const secret = urlParams.get('secret')
  const userId = urlParams.get('userId')

  const user = await getUser()
  if (user) {
    return user
  } else if (secret && userId) {
    const account = new Account(client)
    const session = await account.createSession(userId, secret)
    console.log('user logged in via link', session)
    return await getUser()
  }
  return null
}

export const getUser = async () => {
  try {
    const account = new Account(client)
    const user = await account.get()
    // Logged in
    console.log('user is logged in', user)
    return user
  } catch {
    // Not logged in
    // console.log('user is not logged in', _e)
    return null
  }
}

export const sendMagicLink = async (email: string) => {
  const account = new Account(client)

  const token = await account.createMagicURLToken(ID.unique(), email, `${window.location.origin}/#/verify`)
  console.log(token)
}

export const logout = async () => {
  const account = new Account(client)

  const result = await account.deleteSession('current')
  console.log('logged out', result)
}

export const getDatabase = async () => {
  return databases
}

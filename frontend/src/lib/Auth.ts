import { Account, Client, Databases, Functions, ID, Storage } from 'appwrite'

const client = new Client().setProject('679d358b0013b9a1797f').setEndpoint('https://api.tcgpocketcollectiontracker.com/v1')
const databases = new Databases(client)
const storage = new Storage(client)
const functions = new Functions(client)

export const DATABASE_ID = '679f7ce60013c742add3'
export const COLLECTION_ID = '679f7cf50003d1a172c5'
export const ACCOUNTS_ID = '67b1e20b0032c6efb057'

export const getUser = async () => {
  try {
    const account = new Account(client)
    const user = await account.get()
    console.log('user is logged in', user)
    return user
  } catch {
    // Not logged in
    return null
  }
}

export const sendOTP = async (email: string) => {
  const account = new Account(client)

  const sessionToken = await account.createEmailToken(ID.unique(), email)
  return sessionToken.userId
}

export const checkOTP = async (email: string, code: string) => {
  const account = new Account(client)

  await account.createSession(email, code)
  return await getUser()
}

export const logout = async () => {
  const account = new Account(client)

  const result = await account.deleteSession('current')
  console.log('logged out', result)
}

export const getDatabase = async () => {
  return databases
}

export const getStorage = () => {
  return storage
}

export const authSSO = async (sso: string, sig: string) => {
  const response = await functions.createExecution('67ba4433001821690693', JSON.stringify({ sso, sig }))
  window.location.href = JSON.parse(response.responseBody).redirectUrl
}

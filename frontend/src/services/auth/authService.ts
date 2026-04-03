import { pb } from '@/lib/pocketbase'
import type { User } from '@/types'

export const getCurrentUser = async () => {
  return pb.authStore.record
}

export const logout = async () => {
  pb.authStore.clear()
}

export const authSSO = async (_user: User, sso: string, sig: string) => {
  console.log('Initializing SSO for discourse', sso, sig)

  const response = await fetch(pb.buildUrl('/api/sso'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: pb.authStore.token,
    },
    body: JSON.stringify({ sso, sig }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.log('PocketBase SSO error', data)
    throw new Error('Error logging in')
  }

  console.log('PocketBase SSO data', data)
  return data
}

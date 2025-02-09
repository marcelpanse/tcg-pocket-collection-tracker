import { login } from '@/lib/Auth'
// useLogin.ts
import { useMemo } from 'react'

export type LoginPromise = ReturnType<typeof login>

export function useLogin(): LoginPromise {
  return useMemo(
    () =>
      new Promise<Awaited<LoginPromise>>((resolve, reject) => {
        login()
          .then((user) => {
            if (user) {
              resolve(user)
            } else {
              reject(new Error('Error logging in! No user found.'))
            }
          })
          .catch(reject)
      }),
    [],
  )
}

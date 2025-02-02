import { useState } from 'react'
import { sendMagicLink } from '../lib/Auth.ts'

export const Login = () => {
  const [emailInput, setEmailInput] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  return (
    <>
      {!emailSent && (
        <div className="flex align-center justify-center gap-2">
          <input
            type="text"
            placeholder="email"
            onChange={(e) => setEmailInput(e.target.value)}
            className="block rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
          <button
            className="cursor-pointer rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            type="button"
            onClick={async () => {
              //TODO: validate email with regex
              if (emailInput) {
                await sendMagicLink(emailInput)
                setEmailSent(true)
              } else {
                // TODO: show error in Snackbar
              }
            }}
          >
            login / signup
          </button>
        </div>
      )}
      {emailSent && <h2>Check your email for a login link!</h2>}
    </>
  )
}

/**
 * Auth Callback Route — /auth/callback
 *
 * This is where WorkOS redirects after the user logs in.
 * The URL contains an authorization code that gets exchanged for tokens.
 *
 * The WorkOS SDK's handleCallbackRoute() does all the heavy lifting:
 * 1. Extracts the authorization code from the URL
 * 2. Exchanges it for access_token + refresh_token via WorkOS API
 * 3. Stores both tokens in an encrypted HttpOnly cookie
 * 4. Redirects to the app
 *
 * In the standard template, this was done manually with iron-session.
 * The SDK handles it automatically, including error cases.
 */

import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuth } from '@workos/authkit-tanstack-react-start'

export const Route = createFileRoute('/auth/callback')({
  beforeLoad: async () => {
    // After the middleware handles the callback, check if we're authenticated
    // and redirect to the app
    const auth = await getAuth()
    if (auth?.user) {
      throw redirect({ to: '/app' })
    }
    // If not authenticated after callback, redirect to home
    throw redirect({ to: '/' })
  },
  component: () => {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Processing sign in...</p>
      </div>
    )
  },
})

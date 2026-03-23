/**
 * Sign In Route — /auth/sign-in
 *
 * Redirects the user to the WorkOS hosted login page.
 * Uses getSignInUrl() from the WorkOS SDK instead of manually
 * building the authorization URL (as the standard template does).
 *
 * Flow:
 * 1. User clicks "Sign In" somewhere in the app
 * 2. Browser navigates to /auth/sign-in
 * 3. beforeLoad calls getSignInUrl() to get the WorkOS login URL
 * 4. Throws a redirect to send the user to WorkOS
 * 5. User logs in on WorkOS
 * 6. WorkOS redirects back to /auth/callback with an auth code
 */

import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSignInUrl } from '@workos/authkit-tanstack-react-start'

export const Route = createFileRoute('/auth/sign-in')({
  beforeLoad: async () => {
    // getSignInUrl() generates the full WorkOS authorization URL
    // including client_id, redirect_uri, and state parameters
    const signInUrl = await getSignInUrl()
    throw redirect({ href: signInUrl })
  },
  component: () => {
    // This component should never render because beforeLoad always redirects.
    // It's here as a fallback in case the redirect fails.
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Redirecting to sign in...</p>
      </div>
    )
  },
})

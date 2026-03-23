/**
 * Sign Out Route — /auth/sign-out
 *
 * Clears the user's session and redirects to the home page.
 * Uses signOut() from the WorkOS SDK which:
 * 1. Revokes the session with WorkOS
 * 2. Clears the encrypted session cookie
 * 3. Redirects to the specified URL (or home by default)
 */

import { createFileRoute, redirect } from '@tanstack/react-router'
import { signOut } from '@workos/authkit-tanstack-react-start'

export const Route = createFileRoute('/auth/sign-out')({
  beforeLoad: async () => {
    await signOut()
    throw redirect({ to: '/' })
  },
  component: () => {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    )
  },
})

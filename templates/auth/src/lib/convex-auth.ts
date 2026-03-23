/**
 * Convex Auth Bridge Hook
 *
 * This hook bridges the WorkOS AuthKit SDK with Convex's auth system.
 *
 * WHY IS THIS NEEDED?
 * ConvexProviderWithAuth expects a `useAuth` hook that returns:
 *   { isLoading, isAuthenticated, fetchAccessToken }
 *
 * WorkOS provides two separate hooks:
 *   useAuth() → { isLoaded, user, ... }
 *   useAccessToken() → { accessToken, ... }
 *
 * This bridge combines them into the shape Convex expects.
 *
 * HOW IT WORKS:
 * 1. Gets the user state from WorkOS useAuth()
 * 2. Gets the access token from WorkOS useAccessToken()
 * 3. Returns a combined object matching Convex's interface
 * 4. Convex calls fetchAccessToken() to get the JWT
 * 5. Convex sends the JWT with every function call
 * 6. The Convex backend validates the JWT and populates ctx.auth
 *
 * IMPORTANT: The fetchAccessToken callback uses useCallback with [accessToken]
 * as a dependency. This prevents infinite re-render loops while still updating
 * when the token changes.
 */

import { useCallback } from 'react'
import { useAuth, useAccessToken } from '@workos/authkit-tanstack-react-start/client'

/**
 * Bridge hook that adapts WorkOS auth state to Convex's expected interface.
 *
 * Usage:
 *   <ConvexProviderWithAuth client={convex} useAuth={useAuthFromWorkOS}>
 *     {children}
 *   </ConvexProviderWithAuth>
 */
export function useAuthFromWorkOS() {
  const { isLoaded, user } = useAuth()
  const { accessToken } = useAccessToken()

  const fetchAccessToken = useCallback(async () => {
    // Return the current access token, or null if not available
    // Convex will call this function whenever it needs to authenticate a request
    return accessToken ?? null
  }, [accessToken])

  return {
    // isLoading: true while the auth state is being determined
    // Convex will show a loading state until this becomes false
    isLoading: !isLoaded,

    // isAuthenticated: true when the user is logged in
    // Convex uses this to decide whether to send the token
    isAuthenticated: !!user,

    // fetchAccessToken: returns the JWT for Convex to send with requests
    // Convex calls this automatically — you don't need to call it manually
    fetchAccessToken,
  }
}

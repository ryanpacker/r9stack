/**
 * Convex Auth Bridge Hook
 *
 * Bridges the WorkOS AuthKit SDK to the `useAuth` shape
 * `ConvexProviderWithAuth` expects: `{ isLoading, isAuthenticated,
 * fetchAccessToken }`.
 *
 * HOW IT WORKS:
 * 1. `useAuth()` gives the session state: `{ loading, user }`.
 * 2. `useAccessToken()` gives token accessors: `{ getAccessToken, refresh }`.
 * 3. Convex calls `fetchAccessToken({ forceRefreshToken })` when it needs a
 *    JWT: normally `getAccessToken()`, or `refresh()` when Convex signals the
 *    cached token is stale (`forceRefreshToken`). Honoring that flag is what
 *    keeps long-lived sessions from silently losing auth.
 * 4. Convex sends the JWT with every function call; the backend validates it
 *    (see convex/auth.config.ts) and populates `ctx.auth`.
 *
 * This mirrors Convex's official template-tanstack-start-authkit bridge.
 */

import { useCallback, useMemo } from 'react'
import {
  useAuth,
  useAccessToken,
} from '@workos/authkit-tanstack-react-start/client'

/**
 * Bridge hook adapting WorkOS auth state to Convex's expected interface.
 *
 * Usage:
 *   <ConvexProviderWithAuth client={convex} useAuth={useAuthFromWorkOS}>
 *     {children}
 *   </ConvexProviderWithAuth>
 */
export function useAuthFromWorkOS() {
  const { loading, user } = useAuth()
  const { getAccessToken, refresh } = useAccessToken()

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) return null
      try {
        if (forceRefreshToken) {
          return (await refresh()) ?? null
        }
        return (await getAccessToken()) ?? null
      } catch {
        return null
      }
    },
    [user, refresh, getAccessToken],
  )

  return useMemo(
    () => ({
      isLoading: loading,
      isAuthenticated: !!user,
      fetchAccessToken,
    }),
    [loading, user, fetchAccessToken],
  )
}

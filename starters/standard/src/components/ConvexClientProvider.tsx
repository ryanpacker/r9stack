import { ConvexProviderWithAuth, ConvexReactClient } from 'convex/react'
import { useCallback, useState } from 'react'
import {
  useAccessToken,
  useAuth,
} from '@workos/authkit-tanstack-react-start/client'
import type { ReactNode } from 'react'

/**
 * Bridges the WorkOS AuthKit session into the shape ConvexProviderWithAuth
 * expects ({ isLoading, isAuthenticated, fetchAccessToken }) so Convex
 * functions can validate the JWT via ctx.auth.getUserIdentity().
 */
function useAuthFromAuthKit() {
  const { user, loading: isLoading } = useAuth()
  const { getAccessToken, refresh } = useAccessToken()

  const isAuthenticated = !!user

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

  return { isLoading, isAuthenticated, fetchAccessToken }
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string),
  )

  return (
    <ConvexProviderWithAuth client={client} useAuth={useAuthFromAuthKit}>
      {children}
    </ConvexProviderWithAuth>
  )
}
